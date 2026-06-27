"""WODMIN backend — catalogue, content and enquiry capture API."""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

from seed_data import seed_all


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="WODMIN API", version="1.0.0")
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("wodmin")


# ---------- helpers ----------
def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _strip_id(doc: dict) -> dict:
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
    source: Optional[str] = "product"  # product / general / quick


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
    business_type: str  # builder, hotel, school, restaurant, corporate, other
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


# ---------- Catalogue endpoints ----------
@api_router.get("/")
async def root():
    return {"name": "WODMIN API", "status": "ok", "time": _now_iso()}


@api_router.get("/categories")
async def list_categories():
    docs = await db.categories.find({}, {"_id": 0}).sort("name", 1).to_list(200)
    return docs


@api_router.get("/categories/{slug}")
async def get_category(slug: str):
    doc = await db.categories.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Category not found")
    return doc


@api_router.get("/collections")
async def list_collections():
    docs = await db.collections_meta.find({}, {"_id": 0}).sort("name", 1).to_list(200)
    return docs


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
    sort: str = "popular",  # popular, price_asc, price_desc, newest, rating
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


@api_router.get("/products/{slug}")
async def get_product(slug: str):
    doc = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Product not found")
    # related products from same category
    related = (
        await db.products.find(
            {"category_slug": doc["category_slug"], "slug": {"$ne": slug}},
            {"_id": 0},
        )
        .limit(8)
        .to_list(8)
    )
    return {"product": doc, "related": related}


@api_router.get("/filters")
async def filter_options():
    materials = await db.products.distinct("materials")
    colours = await db.products.distinct("colours")
    prices = await db.products.aggregate(
        [{"$group": {"_id": None, "min": {"$min": "$price"}, "max": {"$max": "$price"}}}]
    ).to_list(1)
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
    items = (
        await db.blogs.find(where, {"_id": 0})
        .sort("published_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(limit)
    )
    total = await db.blogs.count_documents(where)
    return {"items": items, "total": total}


@api_router.get("/blogs/{slug}")
async def get_blog(slug: str):
    doc = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Blog not found")
    related = (
        await db.blogs.find({"slug": {"$ne": slug}}, {"_id": 0})
        .sort("published_at", -1)
        .limit(3)
        .to_list(3)
    )
    return {"blog": doc, "related": related}


@api_router.get("/testimonials")
async def list_testimonials(limit: int = 24):
    items = await db.testimonials.find({}, {"_id": 0}).limit(limit).to_list(limit)
    return items


@api_router.get("/faqs")
async def list_faqs(category: Optional[str] = None):
    where = {"category": category} if category else {}
    items = await db.faqs.find(where, {"_id": 0}).sort("order", 1).to_list(500)
    return items


@api_router.get("/gallery")
async def list_gallery():
    items = await db.gallery.find({}, {"_id": 0}).to_list(200)
    return items


# ---------- Enquiry endpoints ----------
@api_router.post("/enquiries", response_model=EnquiryOut)
async def create_enquiry(data: EnquiryIn):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "new"
    doc["created_at"] = _now_iso()
    await db.enquiries.insert_one(doc.copy())
    return EnquiryOut(**doc)


@api_router.post("/wholesale-enquiries", response_model=WholesaleEnquiryOut)
async def create_wholesale_enquiry(data: WholesaleEnquiryIn):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "new"
    doc["created_at"] = _now_iso()
    await db.wholesale_enquiries.insert_one(doc.copy())
    return WholesaleEnquiryOut(**doc)


@api_router.post("/dealer-applications", response_model=DealerApplicationOut)
async def create_dealer_application(data: DealerApplicationIn):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "new"
    doc["created_at"] = _now_iso()
    await db.dealer_applications.insert_one(doc.copy())
    return DealerApplicationOut(**doc)


@api_router.post("/callback-requests", response_model=CallbackRequestOut)
async def create_callback(data: CallbackRequestIn):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "new"
    doc["created_at"] = _now_iso()
    await db.callbacks.insert_one(doc.copy())
    return CallbackRequestOut(**doc)


@api_router.post("/newsletter")
async def newsletter_subscribe(data: NewsletterIn):
    existing = await db.newsletter.find_one({"email": data.email})
    if existing:
        return {"status": "already_subscribed"}
    await db.newsletter.insert_one({
        "id": str(uuid.uuid4()),
        "email": data.email,
        "created_at": _now_iso(),
    })
    return {"status": "subscribed"}


# ---------- include router ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- startup: seed data ----------
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
        logger.info("Seeding WODMIN sample data... existing counts: %s", counts)
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
        logger.info("Seed complete.")
    else:
        logger.info("Existing data present. Skipping seed.")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
