"""WODMIN backend — catalogue, content, enquiry capture, admin & SEO endpoints."""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated, List, Optional
from xml.sax.saxutils import escape as xml_escape

from dotenv import load_dotenv
from fastapi import APIRouter, Body, Depends, FastAPI, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse, StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Imports that may read env at import time go below load_dotenv()
from auth import (  # noqa: E402
    AdminLogin,
    AdminPublic,
    LoginResponse,
    create_access_token,
    get_admin_dependency,
    seed_admin,
    verify_password,
)
from pdf_utils import build_catalogue_pdf, build_product_pdf  # noqa: E402
from seed_data import seed_all  # noqa: E402

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="WODMIN API", version="2.0.0")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("wodmin")

require_admin = get_admin_dependency(db)


# ---------- helpers ----------
def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _strip_id(doc):
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc


# ---------- Enquiry models ----------
class EnquiryIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    phone: str
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    message: Optional[str] = None
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    category_slug: Optional[str] = None
    source: Optional[str] = "product"


class EnquiryOut(EnquiryIn):
    id: str
    status: str = "new"
    created_at: str


class WholesaleEnquiryIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    phone: str
    email: Optional[EmailStr] = None
    company: str
    business_type: str
    city: str
    estimated_quantity: Optional[str] = None
    message: Optional[str] = None


class WholesaleEnquiryOut(WholesaleEnquiryIn):
    id: str
    status: str = "new"
    created_at: str


class DealerApplicationIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    phone: str
    email: EmailStr
    company: str
    city: str
    state: str
    business_years: Optional[int] = None
    monthly_volume: Optional[str] = None
    message: Optional[str] = None


class DealerApplicationOut(DealerApplicationIn):
    id: str
    status: str = "new"
    created_at: str


class CallbackRequestIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    phone: str
    preferred_time: Optional[str] = None
    topic: Optional[str] = None


class CallbackRequestOut(CallbackRequestIn):
    id: str
    status: str = "new"
    created_at: str


class NewsletterIn(BaseModel):
    email: EmailStr


# ---------- Public catalogue endpoints ----------
@api_router.get("/")
async def root():
    return {"name": "WODMIN API", "status": "ok", "time": _now_iso()}


@api_router.get("/categories")
async def list_categories():
    return await db.categories.find({}, {"_id": 0}).sort("name", 1).to_list(200)


@api_router.get("/categories/{slug}")
async def get_category(slug: str):
    doc = await db.categories.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Category not found")
    return doc


@api_router.get("/collections")
async def list_collections():
    return await db.collections_meta.find({}, {"_id": 0}).sort("name", 1).to_list(200)


@api_router.get("/collections/{slug}")
async def get_collection(slug: str):
    doc = await db.collections_meta.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Collection not found")
    return doc


@api_router.get("/products")
async def list_products(
    category: Optional[str] = None,
    collection: Optional[str] = None,
    q: Optional[str] = None,
    material: Optional[str] = None,
    colour: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    in_stock: Optional[bool] = None,
    is_best_seller: Optional[bool] = None,
    is_new_arrival: Optional[bool] = None,
    is_budget: Optional[bool] = None,
    sort: str = "popular",
    limit: int = Query(24, le=200),
    skip: int = 0,
):
    where: dict = {}
    if category:
        where["category_slug"] = category
    if collection:
        where["collection_slugs"] = collection
    if q:
        where["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"short_description": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
        ]
    if material:
        where["materials"] = {"$regex": f"^{material}$", "$options": "i"}
    if colour:
        where["colours"] = {"$regex": f"^{colour}$", "$options": "i"}
    if min_price is not None or max_price is not None:
        price_q: dict = {}
        if min_price is not None:
            price_q["$gte"] = min_price
        if max_price is not None:
            price_q["$lte"] = max_price
        where["price"] = price_q
    if in_stock:
        where["stock_status"] = "In Stock"
    if is_best_seller:
        where["is_best_seller"] = True
    if is_new_arrival:
        where["is_new_arrival"] = True
    if is_budget:
        where["is_budget"] = True

    sort_map = {
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "newest": [("created_at", -1)],
        "rating": [("rating", -1)],
        "popular": [("review_count", -1)],
    }
    sort_spec = sort_map.get(sort, sort_map["popular"])
    cursor = db.products.find(where, {"_id": 0}).sort(sort_spec).skip(skip).limit(limit)
    items = await cursor.to_list(limit)
    total = await db.products.count_documents(where)
    return {"items": items, "total": total, "limit": limit, "skip": skip}


@api_router.get("/products/featured")
async def featured_products():
    best = await db.products.find({"is_best_seller": True}, {"_id": 0}).limit(8).to_list(8)
    new = await db.products.find({"is_new_arrival": True}, {"_id": 0}).limit(8).to_list(8)
    budget = await db.products.find({"is_budget": True}, {"_id": 0}).limit(8).to_list(8)
    return {"best_sellers": best, "new_arrivals": new, "budget": budget}


@api_router.get("/products/by-ids")
async def products_by_ids(ids: str):
    """Comma-separated list of product ids — used for wishlist/compare/recently viewed."""
    id_list = [i.strip() for i in ids.split(",") if i.strip()]
    if not id_list:
        return []
    docs = await db.products.find({"id": {"$in": id_list}}, {"_id": 0}).to_list(len(id_list))
    by_id = {d["id"]: d for d in docs}
    return [by_id[i] for i in id_list if i in by_id]


@api_router.get("/products/{slug}")
async def get_product(slug: str):
    doc = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Product not found")
    related = (
        await db.products.find({"category_slug": doc["category_slug"], "slug": {"$ne": slug}}, {"_id": 0})
        .limit(8)
        .to_list(8)
    )
    return {"product": doc, "related": related}


@api_router.get("/products/{slug}/pdf")
async def product_pdf(slug: str):
    doc = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Product not found")
    pdf_bytes = build_product_pdf(doc)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="WODMIN-{slug}.pdf"'},
    )


@api_router.get("/catalogue.pdf")
async def catalogue_pdf():
    docs = await db.products.find({}, {"_id": 0}).limit(150).to_list(150)
    pdf_bytes = build_catalogue_pdf(docs)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="WODMIN-Catalogue-2026.pdf"'},
    )


@api_router.get("/filters")
async def filter_options():
    materials = await db.products.distinct("materials")
    colours = await db.products.distinct("colours")
    prices = await db.products.aggregate([{"$group": {"_id": None, "min": {"$min": "$price"}, "max": {"$max": "$price"}}}]).to_list(1)
    p = prices[0] if prices else {"min": 0, "max": 100000}
    return {
        "materials": sorted([m for m in materials if m]),
        "colours": sorted([c for c in colours if c]),
        "price_min": p.get("min", 0),
        "price_max": p.get("max", 100000),
    }


@api_router.get("/blogs")
async def list_blogs(limit: int = 20, skip: int = 0, category: Optional[str] = None):
    where = {"category": category} if category else {}
    items = await db.blogs.find(where, {"_id": 0}).sort("published_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.blogs.count_documents(where)
    return {"items": items, "total": total}


@api_router.get("/blogs/{slug}")
async def get_blog(slug: str):
    doc = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Blog not found")
    related = await db.blogs.find({"slug": {"$ne": slug}}, {"_id": 0}).sort("published_at", -1).limit(3).to_list(3)
    return {"blog": doc, "related": related}


@api_router.get("/testimonials")
async def list_testimonials(limit: int = 24):
    return await db.testimonials.find({}, {"_id": 0}).limit(limit).to_list(limit)


@api_router.get("/faqs")
async def list_faqs(category: Optional[str] = None):
    where = {"category": category} if category else {}
    return await db.faqs.find(where, {"_id": 0}).sort("order", 1).to_list(500)


@api_router.get("/gallery")
async def list_gallery():
    return await db.gallery.find({}, {"_id": 0}).to_list(200)


@api_router.get("/banner")
async def get_home_banner():
    doc = await db.settings.find_one({"key": "home_banner"}, {"_id": 0})
    return doc or {
        "key": "home_banner",
        "title": "Beautiful furniture, honestly priced",
        "subtitle": "Modern Furniture for Every Home",
        "cta_label": "Explore the catalogue",
        "cta_link": "/categories",
        "active": True,
    }


# ---------- Enquiry endpoints ----------
@api_router.post("/enquiries", response_model=EnquiryOut)
async def create_enquiry(data: EnquiryIn):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4()); doc["status"] = "new"; doc["created_at"] = _now_iso()
    await db.enquiries.insert_one(doc.copy())
    return EnquiryOut(**doc)


@api_router.post("/wholesale-enquiries", response_model=WholesaleEnquiryOut)
async def create_wholesale_enquiry(data: WholesaleEnquiryIn):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4()); doc["status"] = "new"; doc["created_at"] = _now_iso()
    await db.wholesale_enquiries.insert_one(doc.copy())
    return WholesaleEnquiryOut(**doc)


@api_router.post("/dealer-applications", response_model=DealerApplicationOut)
async def create_dealer_application(data: DealerApplicationIn):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4()); doc["status"] = "new"; doc["created_at"] = _now_iso()
    await db.dealer_applications.insert_one(doc.copy())
    return DealerApplicationOut(**doc)


@api_router.post("/callback-requests", response_model=CallbackRequestOut)
async def create_callback(data: CallbackRequestIn):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4()); doc["status"] = "new"; doc["created_at"] = _now_iso()
    await db.callbacks.insert_one(doc.copy())
    return CallbackRequestOut(**doc)


@api_router.post("/newsletter")
async def newsletter_subscribe(data: NewsletterIn):
    existing = await db.newsletter.find_one({"email": data.email})
    if existing:
        return {"status": "already_subscribed"}
    await db.newsletter.insert_one({"id": str(uuid.uuid4()), "email": data.email, "created_at": _now_iso()})
    return {"status": "subscribed"}


# ---------- Admin auth ----------
@api_router.post("/admin/login", response_model=LoginResponse)
async def admin_login(payload: AdminLogin):
    email = payload.email.lower().strip()
    user = await db.admin_users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(sub=user["id"], email=user["email"], role=user.get("role", "admin"))
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        admin=AdminPublic(id=user["id"], email=user["email"], name=user.get("name", ""), role=user.get("role", "admin")),
    )


@api_router.get("/admin/me", response_model=AdminPublic)
async def admin_me(admin: dict = Depends(require_admin)):
    return AdminPublic(id=admin["id"], email=admin["email"], name=admin.get("name", ""), role=admin.get("role", "admin"))


# ---------- Admin CRUD: products ----------
class ProductWrite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    slug: Optional[str] = None
    sku: Optional[str] = None
    category_id: Optional[str] = None
    category_slug: str
    category_name: Optional[str] = None
    price: int
    mrp: Optional[int] = None
    short_description: Optional[str] = ""
    description: Optional[str] = ""
    materials: List[str] = Field(default_factory=list)
    colours: List[str] = Field(default_factory=list)
    sizes: List[str] = Field(default_factory=list)
    dimensions: Optional[str] = ""
    weight_kg: Optional[float] = 0
    warranty: Optional[str] = ""
    care_instructions: List[str] = Field(default_factory=list)
    delivery_info: Optional[str] = ""
    images: List[str] = Field(default_factory=list)
    main_image: Optional[str] = ""
    is_best_seller: bool = False
    is_new_arrival: bool = False
    is_budget: bool = False
    collection_slugs: List[str] = Field(default_factory=list)
    stock_status: str = "In Stock"


def _slugify(text: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in text.lower()).strip("-").replace("--", "-")


@api_router.post("/admin/products")
async def admin_create_product(data: ProductWrite, admin: dict = Depends(require_admin)):
    cat = await db.categories.find_one({"slug": data.category_slug}, {"_id": 0})
    if not cat:
        raise HTTPException(400, "Unknown category_slug")
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = data.slug or _slugify(data.name)
    doc["sku"] = data.sku or f"WD-{int(datetime.now().timestamp())%100000}"
    doc["category_id"] = cat["id"]
    doc["category_name"] = cat["name"]
    doc["mrp"] = data.mrp or int(data.price * 1.3)
    doc["discount_pct"] = max(0, int(round((1 - data.price / doc["mrp"]) * 100))) if doc["mrp"] else 0
    doc["currency"] = "INR"
    doc["main_image"] = data.main_image or (data.images[0] if data.images else "")
    doc["rating"] = 4.6
    doc["review_count"] = 0
    doc["tags"] = [data.category_slug]
    doc["created_at"] = _now_iso()
    await db.products.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/products/{pid}")
async def admin_update_product(pid: str, data: ProductWrite, admin: dict = Depends(require_admin)):
    cat = await db.categories.find_one({"slug": data.category_slug}, {"_id": 0})
    if not cat:
        raise HTTPException(400, "Unknown category_slug")
    update = data.model_dump()
    update["slug"] = data.slug or _slugify(data.name)
    update["category_id"] = cat["id"]
    update["category_name"] = cat["name"]
    update["mrp"] = data.mrp or int(data.price * 1.3)
    update["discount_pct"] = max(0, int(round((1 - data.price / update["mrp"]) * 100))) if update["mrp"] else 0
    update["main_image"] = data.main_image or (data.images[0] if data.images else "")
    update["updated_at"] = _now_iso()
    res = await db.products.update_one({"id": pid}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Product not found")
    doc = await db.products.find_one({"id": pid}, {"_id": 0})
    return doc


@api_router.delete("/admin/products/{pid}")
async def admin_delete_product(pid: str, admin: dict = Depends(require_admin)):
    res = await db.products.delete_one({"id": pid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    return {"deleted": pid}


# ---------- Generic helpers (no Body parameter) ----------
async def _generic_list(coll: str):
    return await db[coll].find({}, {"_id": 0}).to_list(1000)


async def _generic_delete(coll: str, item_id: str):
    res = await db[coll].delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"deleted": item_id}


async def _generic_create(coll: str, payload: BaseModel, slug_field: Optional[str] = None):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    if slug_field and not doc.get(slug_field):
        doc[slug_field] = _slugify(doc.get("name") or doc.get("title") or doc["id"])
    doc["created_at"] = _now_iso()
    await db[coll].insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


async def _generic_update(coll: str, item_id: str, payload: BaseModel, slug_field: Optional[str] = None):
    update = payload.model_dump()
    if slug_field and not update.get(slug_field):
        update[slug_field] = _slugify(update.get("name") or update.get("title") or item_id)
    update["updated_at"] = _now_iso()
    res = await db[coll].update_one({"id": item_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Not found")
    return await db[coll].find_one({"id": item_id}, {"_id": 0})


class CategoryWrite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    slug: Optional[str] = None
    description: Optional[str] = ""
    image: Optional[str] = ""


class CollectionWrite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    slug: Optional[str] = None
    description: Optional[str] = ""
    image: Optional[str] = ""


class BlogWrite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    slug: Optional[str] = None
    category: str
    excerpt: Optional[str] = ""
    content: str
    image: Optional[str] = ""
    author: Optional[str] = "WODMIN Team"
    published_at: Optional[str] = None
    read_minutes: Optional[int] = 5


class TestimonialWrite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    city: Optional[str] = ""
    role: Optional[str] = ""
    rating: int = 5
    quote: str


class FaqWrite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    question: str
    answer: str
    category: str = "general"
    order: int = 0


class GalleryWrite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    category: str = "Customer Home"
    image: str


class BannerWrite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    subtitle: Optional[str] = ""
    cta_label: Optional[str] = "Explore the catalogue"
    cta_link: Optional[str] = "/categories"
    active: bool = True


# ---------- Removed legacy factory; explicit endpoints below ----------
@api_router.get("/admin/categories")
async def admin_list_categories(admin: dict = Depends(require_admin)):
    return await _generic_list("categories")


@api_router.post("/admin/categories")
async def admin_create_category(payload: CategoryWrite, admin: dict = Depends(require_admin)):
    return await _generic_create("categories", payload, slug_field="slug")


@api_router.put("/admin/categories/{item_id}")
async def admin_update_category(item_id: str, payload: CategoryWrite, admin: dict = Depends(require_admin)):
    return await _generic_update("categories", item_id, payload, slug_field="slug")


@api_router.delete("/admin/categories/{item_id}")
async def admin_delete_category(item_id: str, admin: dict = Depends(require_admin)):
    return await _generic_delete("categories", item_id)


@api_router.get("/admin/collections")
async def admin_list_collections(admin: dict = Depends(require_admin)):
    return await _generic_list("collections_meta")


@api_router.post("/admin/collections")
async def admin_create_collection(payload: CollectionWrite, admin: dict = Depends(require_admin)):
    return await _generic_create("collections_meta", payload, slug_field="slug")


@api_router.put("/admin/collections/{item_id}")
async def admin_update_collection(item_id: str, payload: CollectionWrite, admin: dict = Depends(require_admin)):
    return await _generic_update("collections_meta", item_id, payload, slug_field="slug")


@api_router.delete("/admin/collections/{item_id}")
async def admin_delete_collection(item_id: str, admin: dict = Depends(require_admin)):
    return await _generic_delete("collections_meta", item_id)


@api_router.get("/admin/blogs")
async def admin_list_blogs(admin: dict = Depends(require_admin)):
    return await _generic_list("blogs")


@api_router.post("/admin/blogs")
async def admin_create_blog(payload: BlogWrite, admin: dict = Depends(require_admin)):
    return await _generic_create("blogs", payload, slug_field="slug")


@api_router.put("/admin/blogs/{item_id}")
async def admin_update_blog(item_id: str, payload: BlogWrite, admin: dict = Depends(require_admin)):
    return await _generic_update("blogs", item_id, payload, slug_field="slug")


@api_router.delete("/admin/blogs/{item_id}")
async def admin_delete_blog(item_id: str, admin: dict = Depends(require_admin)):
    return await _generic_delete("blogs", item_id)


@api_router.get("/admin/testimonials")
async def admin_list_testimonials(admin: dict = Depends(require_admin)):
    return await _generic_list("testimonials")


@api_router.post("/admin/testimonials")
async def admin_create_testimonial(payload: TestimonialWrite, admin: dict = Depends(require_admin)):
    return await _generic_create("testimonials", payload)


@api_router.put("/admin/testimonials/{item_id}")
async def admin_update_testimonial(item_id: str, payload: TestimonialWrite, admin: dict = Depends(require_admin)):
    return await _generic_update("testimonials", item_id, payload)


@api_router.delete("/admin/testimonials/{item_id}")
async def admin_delete_testimonial(item_id: str, admin: dict = Depends(require_admin)):
    return await _generic_delete("testimonials", item_id)


@api_router.get("/admin/faqs")
async def admin_list_faqs(admin: dict = Depends(require_admin)):
    return await _generic_list("faqs")


@api_router.post("/admin/faqs")
async def admin_create_faq(payload: FaqWrite, admin: dict = Depends(require_admin)):
    return await _generic_create("faqs", payload)


@api_router.put("/admin/faqs/{item_id}")
async def admin_update_faq(item_id: str, payload: FaqWrite, admin: dict = Depends(require_admin)):
    return await _generic_update("faqs", item_id, payload)


@api_router.delete("/admin/faqs/{item_id}")
async def admin_delete_faq(item_id: str, admin: dict = Depends(require_admin)):
    return await _generic_delete("faqs", item_id)


@api_router.get("/admin/gallery")
async def admin_list_gallery(admin: dict = Depends(require_admin)):
    return await _generic_list("gallery")


@api_router.post("/admin/gallery")
async def admin_create_gallery(payload: GalleryWrite, admin: dict = Depends(require_admin)):
    return await _generic_create("gallery", payload)


@api_router.put("/admin/gallery/{item_id}")
async def admin_update_gallery(item_id: str, payload: GalleryWrite, admin: dict = Depends(require_admin)):
    return await _generic_update("gallery", item_id, payload)


@api_router.delete("/admin/gallery/{item_id}")
async def admin_delete_gallery(item_id: str, admin: dict = Depends(require_admin)):
    return await _generic_delete("gallery", item_id)


@api_router.put("/admin/banner")
async def admin_set_banner(payload: BannerWrite, admin: dict = Depends(require_admin)):
    doc = payload.model_dump()
    doc["key"] = "home_banner"
    doc["updated_at"] = _now_iso()
    await db.settings.update_one({"key": "home_banner"}, {"$set": doc}, upsert=True)
    doc.pop("_id", None)
    return doc


# ---------- Admin: enquiries view & status ----------
async def _list_with_status(coll: str, status: Optional[str], limit: int):
    where = {"status": status} if status else {}
    items = await db[coll].find(where, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    total = await db[coll].count_documents(where)
    return {"items": items, "total": total}


@api_router.get("/admin/enquiries")
async def admin_enquiries(status: Optional[str] = None, limit: int = 200, admin: dict = Depends(require_admin)):
    return await _list_with_status("enquiries", status, limit)


@api_router.get("/admin/wholesale-enquiries")
async def admin_wholesale(status: Optional[str] = None, limit: int = 200, admin: dict = Depends(require_admin)):
    return await _list_with_status("wholesale_enquiries", status, limit)


@api_router.get("/admin/dealer-applications")
async def admin_dealers(status: Optional[str] = None, limit: int = 200, admin: dict = Depends(require_admin)):
    return await _list_with_status("dealer_applications", status, limit)


@api_router.get("/admin/callback-requests")
async def admin_callbacks(status: Optional[str] = None, limit: int = 200, admin: dict = Depends(require_admin)):
    return await _list_with_status("callbacks", status, limit)


@api_router.get("/admin/newsletter")
async def admin_newsletter(limit: int = 500, admin: dict = Depends(require_admin)):
    items = await db.newsletter.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return {"items": items, "total": len(items)}


class StatusUpdate(BaseModel):
    status: str


@api_router.patch("/admin/{coll_alias}/{item_id}/status")
async def admin_update_status(coll_alias: str, item_id: str, payload: StatusUpdate, admin: dict = Depends(require_admin)):
    alias_to_coll = {
        "enquiries": "enquiries",
        "wholesale-enquiries": "wholesale_enquiries",
        "dealer-applications": "dealer_applications",
        "callback-requests": "callbacks",
    }
    coll = alias_to_coll.get(coll_alias)
    if not coll:
        raise HTTPException(404, "Unknown collection")
    res = await db[coll].update_one({"id": item_id}, {"$set": {"status": payload.status, "updated_at": _now_iso()}})
    if res.matched_count == 0:
        raise HTTPException(404, "Not found")
    return {"id": item_id, "status": payload.status}


@api_router.get("/admin/analytics")
async def admin_analytics(admin: dict = Depends(require_admin)):
    counts = {}
    for label, coll in [
        ("products", "products"),
        ("categories", "categories"),
        ("collections", "collections_meta"),
        ("blogs", "blogs"),
        ("testimonials", "testimonials"),
        ("faqs", "faqs"),
        ("gallery", "gallery"),
        ("enquiries", "enquiries"),
        ("wholesale_enquiries", "wholesale_enquiries"),
        ("dealer_applications", "dealer_applications"),
        ("callbacks", "callbacks"),
        ("newsletter", "newsletter"),
    ]:
        counts[label] = await db[coll].count_documents({})
    counts["new_enquiries"] = await db.enquiries.count_documents({"status": "new"})
    counts["new_wholesale"] = await db.wholesale_enquiries.count_documents({"status": "new"})
    counts["new_dealers"] = await db.dealer_applications.count_documents({"status": "new"})
    recent_enquiries = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).limit(8).to_list(8)
    by_category = await db.products.aggregate([
        {"$group": {"_id": "$category_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 8},
        {"$project": {"_id": 0, "category": "$_id", "count": 1}},
    ]).to_list(8)
    return {"counts": counts, "recent_enquiries": recent_enquiries, "products_by_category": by_category}


# ---------- SEO: sitemap.xml & robots.txt ----------
PUBLIC_DIR = Path(__file__).resolve().parent.parent / "frontend" / "public"


async def _build_sitemap_xml() -> str:
    base = os.environ.get("PUBLIC_URL", "https://wodmin.in").rstrip("/")
    static_paths = [
        "/", "/about", "/categories", "/collections", "/products",
        "/wholesale", "/dealer", "/gallery", "/blogs", "/faqs",
        "/contact", "/privacy", "/terms",
    ]
    urls = list(static_paths)
    for c in await db.categories.find({}, {"_id": 0, "slug": 1}).to_list(200):
        urls.append(f"/category/{c['slug']}")
    for c in await db.collections_meta.find({}, {"_id": 0, "slug": 1}).to_list(200):
        urls.append(f"/collection/{c['slug']}")
    for p in await db.products.find({}, {"_id": 0, "slug": 1}).limit(2000).to_list(2000):
        urls.append(f"/product/{p['slug']}")
    for b in await db.blogs.find({}, {"_id": 0, "slug": 1}).to_list(200):
        urls.append(f"/blog/{b['slug']}")
    today = datetime.now(timezone.utc).date().isoformat()
    body = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        body.append(f"  <url><loc>{xml_escape(base + u)}</loc><lastmod>{today}</lastmod></url>")
    body.append("</urlset>")
    return "\n".join(body)


def _build_robots_txt() -> str:
    base = os.environ.get("PUBLIC_URL", "https://wodmin.in").rstrip("/")
    return "\n".join([
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        f"Sitemap: {base}/sitemap.xml",
        "",
    ])


@api_router.get("/sitemap.xml")
async def api_sitemap_xml():
    return Response(content=await _build_sitemap_xml(), media_type="application/xml")


@api_router.get("/robots.txt")
async def api_robots_txt():
    return PlainTextResponse(_build_robots_txt())


@app.get("/sitemap.xml", include_in_schema=False)
async def sitemap_xml():
    return Response(content=await _build_sitemap_xml(), media_type="application/xml")


@app.get("/robots.txt", include_in_schema=False)
async def robots_txt():
    return PlainTextResponse(_build_robots_txt())


# ---------- Mount router & middleware ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Startup: seed catalogue + admin ----------
@app.on_event("startup")
async def on_startup():
    counts = {
        "categories": await db.categories.count_documents({}),
        "products": await db.products.count_documents({}),
        "collections": await db.collections_meta.count_documents({}),
        "blogs": await db.blogs.count_documents({}),
        "testimonials": await db.testimonials.count_documents({}),
        "faqs": await db.faqs.count_documents({}),
        "gallery": await db.gallery.count_documents({}),
    }
    if any(v == 0 for v in counts.values()):
        logger.info("Seeding catalogue data... existing counts: %s", counts)
        data = seed_all()
        if counts["categories"] == 0:
            await db.categories.insert_many([d.copy() for d in data["categories"]])
        if counts["collections"] == 0:
            await db.collections_meta.insert_many([d.copy() for d in data["collections"]])
        if counts["products"] == 0:
            await db.products.insert_many([d.copy() for d in data["products"]])
        if counts["blogs"] == 0:
            await db.blogs.insert_many([d.copy() for d in data["blogs"]])
        if counts["testimonials"] == 0:
            await db.testimonials.insert_many([d.copy() for d in data["testimonials"]])
        if counts["faqs"] == 0:
            await db.faqs.insert_many([d.copy() for d in data["faqs"]])
        if counts["gallery"] == 0:
            await db.gallery.insert_many([d.copy() for d in data["gallery"]])
        logger.info("Catalogue seed complete.")
    await seed_admin(db)
    logger.info("Admin seeding done.")
    # Emit static sitemap.xml & robots.txt into the CRA public dir so they're
    # reachable through the public ingress (which only routes /api/* to backend).
    try:
        PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
        (PUBLIC_DIR / "sitemap.xml").write_text(await _build_sitemap_xml(), encoding="utf-8")
        (PUBLIC_DIR / "robots.txt").write_text(_build_robots_txt(), encoding="utf-8")
        logger.info("Wrote static sitemap.xml + robots.txt to %s", PUBLIC_DIR)
    except Exception as e:  # noqa: BLE001
        logger.warning("Could not write static SEO files: %s", e)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
