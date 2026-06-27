"""WODMIN sample data generator.

Provides idempotent seeding of categories, collections, products, blogs,
testimonials, FAQs and gallery items into MongoDB if they're empty.
"""
from __future__ import annotations

import random
import uuid
from datetime import datetime, timedelta, timezone


# ---------- IMAGE POOLS (Unsplash/Pexels furniture imagery) ----------
IMG = {
    "living_room": [
        "https://images.unsplash.com/photo-1567016526105-22da7c13161a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    ],
    "sofa": [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80",
    ],
    "bedroom": [
        "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1200&q=80",
    ],
    "bed": [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1200&q=80",
    ],
    "wardrobe": [
        "https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1631049552240-59c37f38802b?auto=format&fit=crop&w=1200&q=80",
    ],
    "dining": [
        "https://images.unsplash.com/photo-1568347760450-1ef7874c5f5f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1610177567940-cad90e9fb85e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80",
    ],
    "office": [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=1200&q=80",
    ],
    "office_chair": [
        "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=1200&q=80",
    ],
    "study": [
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&w=1200&q=80",
    ],
    "storage": [
        "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=1200&q=80",
    ],
    "tv_unit": [
        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
    ],
    "bookshelf": [
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    ],
    "coffee_table": [
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1200&q=80",
    ],
    "dining_chair": [
        "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1561149877-84d0d7d3b3f5?auto=format&fit=crop&w=1200&q=80",
    ],
    "kids": [
        "https://images.unsplash.com/photo-1558877385-8c1a7f1f4c25?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1617104551722-3b2d51366400?auto=format&fit=crop&w=1200&q=80",
    ],
    "outdoor": [
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?auto=format&fit=crop&w=1200&q=80",
    ],
    "lighting": [
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=1200&q=80",
    ],
    "decor": [
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1616627451515-6a4ec0d8b9c8?auto=format&fit=crop&w=1200&q=80",
    ],
    "kitchen": [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80",
    ],
    "mattress": [
        "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
    "gallery": [
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80",
    ],
    "blog": [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    ],
}


def _slug(text: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in text.lower()).strip("-").replace("--", "-")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------- CATEGORIES ----------
CATEGORY_DEFS = [
    ("Living Room", "living_room", "Sofas, recliners, coffee tables and complete living sets to anchor your home."),
    ("Bedroom", "bedroom", "Beds, bedside tables and dressing units crafted for restful nights."),
    ("Dining", "dining", "Dining tables and benches that bring families together."),
    ("Kitchen", "kitchen", "Smart kitchen storage and modular cabinetry."),
    ("Office Furniture", "office", "Workstations, conference tables and storage for modern offices."),
    ("Study Furniture", "study", "Study tables, chairs and racks for productive learning."),
    ("Storage", "storage", "Cabinets, shoe racks and multipurpose storage units."),
    ("TV Units", "tv_unit", "Entertainment units to host your screen, speakers and decor."),
    ("Wardrobes", "wardrobe", "2, 3 and 4-door wardrobes with mirror, drawer & loft options."),
    ("Bookshelves", "bookshelf", "Open shelves and closed bookcases for every collection."),
    ("Beds", "bed", "Single, queen and king beds with and without storage."),
    ("Mattresses", "mattress", "Pocket spring, foam and orthopedic mattresses."),
    ("Sofas", "sofa", "Two, three seater and L-shaped sofas in fabric and leatherette."),
    ("Coffee Tables", "coffee_table", "Centre tables, nest tables and lift-top designs."),
    ("Dining Tables", "dining", "4, 6 and 8-seater dining tables."),
    ("Dining Chairs", "dining_chair", "Cushioned, wooden and metal dining chairs."),
    ("Office Chairs", "office_chair", "Ergonomic, executive and visitor chairs."),
    ("Kids Furniture", "kids", "Bunk beds, study sets and storage made safe for little ones."),
    ("Outdoor Furniture", "outdoor", "Balcony, garden and patio sets that last."),
    ("Lighting", "lighting", "Floor lamps, pendants and table lamps."),
    ("Home Decor", "decor", "Mirrors, planters and accent pieces."),
    ("New Arrivals", "decor", "The freshest additions to the WODMIN catalogue."),
    ("Budget Collection", "living_room", "Best-value pieces under tight budgets without compromising on style."),
    ("Value Collection", "bedroom", "Crowd-favourite picks balancing price and longevity."),
    ("Premium Essentials", "dining", "Slightly elevated everyday essentials for those who notice details."),
]

# ---------- COLLECTIONS ----------
COLLECTION_DEFS = [
    ("The Mumbai Compact", "Space-savvy pieces for 1BHK and 2BHK city homes.", "living_room"),
    ("The Hyderabad Heritage", "Wood-rich classics with a contemporary twist.", "dining"),
    ("The Bengaluru Workhome", "Beautiful office-from-home furniture.", "office"),
    ("The Chennai Coastal", "Light tones and breezy silhouettes.", "bedroom"),
    ("The Delhi Modern", "Bold modern statements for spacious flats.", "sofa"),
    ("Budget Saver", "Crafted to keep you under budget.", "storage"),
    ("Newly Wed", "Everything to set up a new home together.", "bedroom"),
    ("Student Starter", "Smart, sturdy basics for students.", "study"),
    ("Family First", "Built tough for families with kids.", "living_room"),
    ("Office Setup", "Outfit a 4-30 person office.", "office"),
    ("Compact Living", "Furniture for studio and 1RK homes.", "storage"),
    ("Festive Picks", "Curated picks for Diwali and housewarming.", "decor"),
    ("Monsoon Sale", "Weather-friendly, treated furniture.", "outdoor"),
    ("Premium Wood Series", "Solid sheesham and mango wood furniture.", "wardrobe"),
    ("Smart Storage", "Bed, sofa and table options with hidden storage.", "bed"),
]

# ---------- PRODUCTS ----------
PRODUCT_BLUEPRINTS = [
    # (name, category_slug, base_price, materials, type_tag)
    ("Oslo 3-Seater Fabric Sofa", "sofas", 28999, ["Engineered Wood", "Fabric", "Foam"], "sofa"),
    ("Helsinki L-Shaped Sofa", "sofas", 42999, ["Solid Wood", "Polyester", "HR Foam"], "sofa"),
    ("Tokyo 2-Seater Recliner", "sofas", 32999, ["Metal Frame", "Leatherette"], "sofa"),
    ("Kyoto Loveseat", "sofas", 18999, ["Engineered Wood", "Linen"], "sofa"),
    ("Lisbon Queen Storage Bed", "beds", 24999, ["Engineered Wood", "Laminate"], "bed"),
    ("Madrid King Hydraulic Bed", "beds", 34999, ["Solid Wood", "Laminate"], "bed"),
    ("Berlin Single Bed", "beds", 9999, ["Engineered Wood"], "bed"),
    ("Vienna Bunk Bed", "kids-furniture", 22999, ["Solid Wood", "Metal Rails"], "kids"),
    ("Athena 4-Door Wardrobe with Mirror", "wardrobes", 38999, ["Engineered Wood", "Mirror", "Laminate"], "wardrobe"),
    ("Apollo 3-Door Wardrobe", "wardrobes", 28999, ["Engineered Wood", "Laminate"], "wardrobe"),
    ("Hera 2-Door Compact Wardrobe", "wardrobes", 14999, ["Engineered Wood"], "wardrobe"),
    ("Zeus Sliding Wardrobe", "wardrobes", 44999, ["Engineered Wood", "Glass"], "wardrobe"),
    ("Aurora 6-Seater Dining Table Set", "dining-tables", 32999, ["Solid Wood", "MDF"], "dining"),
    ("Nova 4-Seater Dining Set", "dining-tables", 19999, ["Engineered Wood", "Cushion"], "dining"),
    ("Comet 8-Seater Banquet Table", "dining-tables", 48999, ["Solid Wood"], "dining"),
    ("Stellar Dining Chair (Set of 2)", "dining-chairs", 6999, ["Solid Wood", "Cushion"], "dining_chair"),
    ("Orbit Bar Stool", "dining-chairs", 4999, ["Metal", "Engineered Wood"], "dining_chair"),
    ("Cosmos TV Unit 65 inch", "tv-units", 16999, ["Engineered Wood", "Laminate"], "tv_unit"),
    ("Galaxy Floating TV Console", "tv-units", 11999, ["Engineered Wood"], "tv_unit"),
    ("Nebula Coffee Table", "coffee-tables", 7999, ["Solid Wood", "Glass"], "coffee_table"),
    ("Quasar Lift-Top Coffee Table", "coffee-tables", 9999, ["Engineered Wood", "Metal"], "coffee_table"),
    ("Comet Nest of Tables (Set of 3)", "coffee-tables", 5999, ["Solid Wood"], "coffee_table"),
    ("Atlas Executive Office Chair", "office-chairs", 12999, ["Mesh", "Metal Base", "Lumbar Support"], "office_chair"),
    ("Hercules Ergonomic Chair", "office-chairs", 17999, ["Mesh", "Adjustable Arms"], "office_chair"),
    ("Triton Visitor Chair", "office-chairs", 3999, ["Metal", "Cushion"], "office_chair"),
    ("Forge Workstation 4-Seater", "office-furniture", 54999, ["Engineered Wood", "Steel"], "office"),
    ("Anvil Manager Desk", "office-furniture", 19999, ["Solid Wood"], "office"),
    ("Pioneer Study Table", "study-furniture", 7999, ["Engineered Wood"], "study"),
    ("Voyager Student Desk with Bookshelf", "study-furniture", 9999, ["Engineered Wood"], "study"),
    ("Curio 5-Shelf Bookshelf", "bookshelves", 8999, ["Engineered Wood"], "bookshelf"),
    ("Library Open Bookcase", "bookshelves", 12999, ["Solid Wood"], "bookshelf"),
    ("Vault Shoe Cabinet", "storage", 6999, ["Engineered Wood"], "storage"),
    ("Cache Multi-utility Cabinet", "storage", 10999, ["Engineered Wood"], "storage"),
    ("Bloom 3-Seater Garden Bench", "outdoor-furniture", 14999, ["Treated Wood"], "outdoor"),
    ("Patio Foldable Set", "outdoor-furniture", 18999, ["Steel", "Polyester"], "outdoor"),
    ("Sunrise Pendant Lamp", "lighting", 2999, ["Metal", "Fabric"], "lighting"),
    ("Eclipse Floor Lamp", "lighting", 4499, ["Wood", "Linen"], "lighting"),
    ("Halo Table Lamp", "lighting", 1999, ["Ceramic"], "lighting"),
    ("Mirror Moon Wall Mirror", "home-decor", 3499, ["Wood Frame"], "decor"),
    ("Terra Planter Set of 3", "home-decor", 1999, ["Ceramic"], "decor"),
    ("Aurora Wall Art Triptych", "home-decor", 2999, ["Canvas"], "decor"),
    ("Sleep+ Pocket Spring Mattress Queen", "mattresses", 14999, ["Pocket Spring", "Memory Foam"], "mattress"),
    ("OrthoCare Mattress King", "mattresses", 18999, ["HR Foam", "Coir"], "mattress"),
    ("Cloud9 Foam Mattress Single", "mattresses", 6999, ["High Density Foam"], "mattress"),
    ("Junior Bunk + Study Combo", "kids-furniture", 26999, ["Engineered Wood"], "kids"),
    ("Mini Reader Kids Bookshelf", "kids-furniture", 5999, ["Engineered Wood"], "kids"),
    ("Cuisinier Kitchen Trolley", "kitchen", 7999, ["Stainless Steel", "Engineered Wood"], "kitchen"),
    ("Baker's Pantry Cabinet", "kitchen", 13999, ["Engineered Wood"], "kitchen"),
    ("Riviera 3-Seater Outdoor Sofa", "outdoor-furniture", 22999, ["Aluminium", "Cushion"], "outdoor"),
    ("Cabana Lounge Chair", "outdoor-furniture", 9999, ["Rattan", "Cushion"], "outdoor"),
    ("Studio Compact Sofa Cum Bed", "sofas", 16999, ["Engineered Wood", "Fabric"], "sofa"),
    ("Pioneer Office Storage Locker", "office-furniture", 8999, ["Steel"], "storage"),
    ("Maple Bedside Table", "bedroom", 3999, ["Engineered Wood"], "bedroom"),
    ("Oak Dresser with Mirror", "bedroom", 12999, ["Engineered Wood"], "bedroom"),
    ("Pine Living Room Set", "living-room", 49999, ["Solid Wood", "Fabric"], "living_room"),
    ("Cedar Sectional Sofa", "living-room", 38999, ["Engineered Wood", "Fabric"], "living_room"),
    ("Birch 4-Seater Bench", "dining", 7999, ["Solid Wood"], "dining"),
    ("Walnut Console Table", "living-room", 9999, ["Engineered Wood"], "living_room"),
    ("Spruce Folding Study Chair", "study-furniture", 2999, ["Metal", "Plastic"], "office_chair"),
    ("Linen Throw Cushion Set", "home-decor", 999, ["Linen"], "decor"),
    ("Mango Wood Bar Cabinet", "storage", 18999, ["Mango Wood"], "storage"),
    ("Industrial Pipe Bookshelf", "bookshelves", 11999, ["Metal Pipe", "Wood"], "bookshelf"),
    ("Cosy Reading Armchair", "living-room", 13999, ["Engineered Wood", "Fabric"], "sofa"),
    ("Glide Recliner Sofa", "sofas", 25999, ["Engineered Wood", "Leatherette"], "sofa"),
    ("Pop Kids Bed with Storage", "kids-furniture", 14999, ["Engineered Wood"], "kids"),
    ("Glow Bedside Lamp", "lighting", 1499, ["Wood", "Cotton"], "lighting"),
    ("Sapphire Sofa Set 3+1+1", "sofas", 36999, ["Engineered Wood", "Fabric"], "living_room"),
    ("Emerald Recliner Chair", "sofas", 19999, ["Engineered Wood", "Leatherette"], "sofa"),
    ("Topaz Side Table", "coffee-tables", 2999, ["Engineered Wood"], "coffee_table"),
    ("Ruby Storage Ottoman", "storage", 4999, ["Engineered Wood", "Fabric"], "storage"),
    ("Onyx Shoe Rack 4-Tier", "storage", 3999, ["Engineered Wood"], "storage"),
]


COLOURS = ["Walnut", "Honey Oak", "Wenge", "White", "Charcoal", "Beige", "Cream", "Teak"]
SIZES = ["Standard", "Compact", "Large"]
MATERIAL_OPTIONS = ["Solid Wood", "Engineered Wood", "Metal", "Glass", "Fabric", "Leatherette"]


def _category_slug(name: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in name.lower()).strip("-").replace("--", "-")


def build_categories() -> list[dict]:
    out = []
    for name, img_key, desc in CATEGORY_DEFS:
        out.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "slug": _category_slug(name),
            "description": desc,
            "image": IMG[img_key][0],
            "image_pool": IMG[img_key],
            "created_at": _now(),
        })
    return out


def build_collections() -> list[dict]:
    out = []
    for name, desc, img_key in COLLECTION_DEFS:
        out.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "slug": _category_slug(name),
            "description": desc,
            "image": IMG[img_key][0],
            "created_at": _now(),
        })
    return out


def build_products(categories: list[dict], collections: list[dict]) -> list[dict]:
    cat_by_slug = {c["slug"]: c for c in categories}
    out = []
    random.seed(42)
    for idx, (name, cat_slug, price, mats, type_tag) in enumerate(PRODUCT_BLUEPRINTS):
        cat = cat_by_slug.get(cat_slug) or random.choice(categories)
        imgs = IMG.get(type_tag, IMG["living_room"])
        gallery = random.sample(imgs, k=min(len(imgs), 3))
        colours = random.sample(COLOURS, k=random.randint(2, 4))
        sizes = random.sample(SIZES, k=random.randint(1, 3))
        mrp = int(price * random.uniform(1.18, 1.45))
        is_best = idx % 5 == 0
        is_new = idx % 4 == 1
        is_budget = price <= 9999
        coll_tags = []
        if is_budget:
            coll_tags.append("budget-saver")
        if idx % 3 == 0 and len(collections) > 0:
            coll_tags.append(collections[idx % len(collections)]["slug"])
        out.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "slug": _category_slug(name),
            "sku": f"WD-{1000 + idx}",
            "category_id": cat["id"],
            "category_slug": cat["slug"],
            "category_name": cat["name"],
            "price": price,
            "mrp": mrp,
            "discount_pct": int(round((1 - price / mrp) * 100)),
            "currency": "INR",
            "short_description": f"{name} crafted by WODMIN — modern silhouette, family-friendly build, easy maintenance.",
            "description": (
                f"Meet the {name}. Designed and assembled in India, the piece blends practical proportions "
                f"with a contemporary look. Built using {', '.join(mats).lower()}, it's engineered for "
                f"everyday durability while keeping things affordable. Perfect for Indian homes, apartments and small offices."
            ),
            "materials": mats,
            "colours": colours,
            "sizes": sizes,
            "dimensions": f"{random.randint(80, 220)} x {random.randint(60, 180)} x {random.randint(40, 110)} cm",
            "weight_kg": round(random.uniform(8, 95), 1),
            "warranty": f"{random.choice([1, 2, 3, 5])} year warranty",
            "care_instructions": [
                "Wipe regularly with a soft dry cloth",
                "Avoid direct sunlight and water spills",
                "Use coasters for hot or wet items",
                "Tighten fittings every 6 months",
            ],
            "delivery_info": "Free delivery & assembly in 7-12 working days across major Indian cities.",
            "images": gallery,
            "main_image": gallery[0],
            "is_best_seller": is_best,
            "is_new_arrival": is_new,
            "is_budget": is_budget,
            "collection_slugs": coll_tags,
            "rating": round(random.uniform(4.1, 4.9), 1),
            "review_count": random.randint(12, 480),
            "stock_status": "Made to Order" if idx % 7 == 0 else "In Stock",
            "tags": [type_tag, cat["slug"]],
            "created_at": _now(),
        })
    return out


# ---------- BLOGS ----------
BLOG_DEFS = [
    ("How to Choose the Right Sofa for Indian Homes", "Buying Guide"),
    ("Small Bedroom Ideas: 10 Smart Furniture Hacks", "Space Saving"),
    ("Solid Wood vs Engineered Wood: Which is Best for You?", "Buying Guide"),
    ("Care Tips to Make Your Furniture Last 10+ Years", "Furniture Care"),
    ("Setting Up Your Work-From-Home Corner Under ₹25,000", "Home Office"),
    ("Vastu-Friendly Living Room Layouts", "Interior Design"),
    ("Monsoon Care for Wooden Furniture", "Furniture Care"),
    ("Top 5 Modular Wardrobe Designs for 2026", "Latest Trends"),
    ("Dining Table Sizes: Choosing Between 4 and 6 Seater", "Buying Guide"),
    ("Kid-Safe Furniture: A Parent's Checklist", "Buying Guide"),
    ("How to Style a Studio Apartment on a Budget", "Space Saving"),
    ("Latest Furniture Trends Sweeping Indian Homes", "Latest Trends"),
    ("Office Ergonomics: Picking the Right Chair", "Home Office"),
    ("How to Mix Wood Tones Like a Pro", "Interior Design"),
    ("Storage Beds vs Regular Beds: A Cost Breakdown", "Buying Guide"),
    ("Setting Up a Reading Nook in 4 Easy Steps", "Interior Design"),
    ("Festive Refresh: Diwali Decor Ideas for 2026", "Home Decor"),
    ("Why Indian Families Love L-Shaped Sofas", "Latest Trends"),
    ("Affordable Furniture: Where to Save vs Splurge", "Buying Guide"),
    ("Wholesale Furniture Buying Guide for Builders", "Wholesale"),
]


def build_blogs() -> list[dict]:
    out = []
    today = datetime.now(timezone.utc)
    for i, (title, cat) in enumerate(BLOG_DEFS):
        published = today - timedelta(days=i * 6)
        slug = _category_slug(title)
        out.append({
            "id": str(uuid.uuid4()),
            "title": title,
            "slug": slug,
            "category": cat,
            "excerpt": f"{title} — practical, India-first advice from the WODMIN design team to help you decide better.",
            "content": (
                f"# {title}\n\n"
                f"At WODMIN we believe choosing furniture should be simple, affordable and joyful. "
                f"In this guide we break down what matters for Indian homes — from dimensions and materials, "
                f"to maintenance and total cost of ownership.\n\n"
                f"## Key takeaways\n\n"
                f"- Plan room dimensions before you shop.\n"
                f"- Prioritise materials over decoration.\n"
                f"- Always confirm warranty, delivery and after-sales support.\n\n"
                f"## In closing\n\nIf you'd like personalised help, our store consultants are a WhatsApp message away. "
                f"Reach out for a free quote tailored to your space, budget and style."
            ),
            "image": IMG["blog"][i % len(IMG["blog"])],
            "author": random.choice(["Priya Sharma", "Rahul Verma", "Ananya Iyer", "Vikram Singh", "Sneha Patil"]),
            "published_at": published.isoformat(),
            "read_minutes": random.randint(3, 9),
        })
    return out


# ---------- TESTIMONIALS ----------
TESTIMONIAL_TEMPLATES = [
    "We furnished our entire 2BHK with WODMIN and saved nearly 35% versus showrooms. Delivery and assembly were on time.",
    "The team helped us pick a compact sofa that fit our Mumbai flat perfectly. Build quality is solid.",
    "Wholesale order for our 30-seater office arrived clean and on schedule. Highly recommended.",
    "Bought the queen storage bed — sturdy, easy to clean and the storage is genuinely huge.",
    "Their dealer support team is super responsive. I run a store in Pune and WODMIN is now my go-to brand.",
    "Affordable, modern and the kids-furniture range is honestly safer than what we found anywhere else.",
    "We ordered the L-shaped sofa and the colour matched the photos. Five years and still holding up.",
    "The free site visit before installation was a great touch.",
    "I'm an interior designer and recommend WODMIN to almost every client now.",
    "Loved the ergonomic chair — back pain is gone after switching to it.",
]

CITIES = ["Mumbai", "Bengaluru", "Delhi", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow", "Indore", "Surat"]
ROLES = ["Homeowner", "Architect", "Interior Designer", "Office Manager", "Builder", "Student", "Hotelier", "Restaurateur", "Newly Wed", "Family of 4"]


def build_testimonials() -> list[dict]:
    out = []
    random.seed(7)
    names = [
        "Aarav Kapoor", "Diya Mehta", "Rohan Iyer", "Saanvi Reddy", "Vihaan Joshi", "Ananya Pillai",
        "Arjun Bose", "Ishaan Patel", "Kavya Nair", "Aditya Rao", "Meera Khanna", "Rishi Gupta",
        "Tara Sharma", "Aryan Malhotra", "Niharika Das", "Yash Bhatt", "Sneha Chatterjee", "Karan Saxena",
        "Riya Pandey", "Manav Singh", "Pooja Menon", "Aakash Goyal", "Sara Mathew", "Devansh Tripathi",
        "Naina Ghosh", "Kabir Shetty", "Mallika Anand", "Aaditya Pawar", "Janhvi Sinha", "Tushar Bansal",
        "Pari Gokhale", "Hrithik Jain", "Ahaana Roy", "Aniket Naik", "Eesha Vyas", "Mihir Kohli",
        "Tanya Bhalla", "Veer Chauhan", "Avni Bedi", "Ranveer Trivedi", "Lavanya Krishnan", "Aarush Pradhan",
        "Anvi Ranganathan", "Reyansh Bhattacharya", "Mira Saxena", "Atharv Mishra", "Anika Subramaniam",
        "Vivaan Walia", "Sara Qureshi", "Aanya Goswami",
    ]
    for i in range(50):
        out.append({
            "id": str(uuid.uuid4()),
            "name": names[i % len(names)],
            "city": random.choice(CITIES),
            "role": random.choice(ROLES),
            "rating": random.choice([4, 5, 5, 5, 5]),
            "quote": random.choice(TESTIMONIAL_TEMPLATES),
            "created_at": _now(),
        })
    return out


# ---------- FAQs ----------
FAQ_DEFS = [
    ("Do you sell online?", "general", "WODMIN is a catalogue and enquiry-first brand. Once you enquire, our consultant shares pricing, availability and delivery details so you can buy with confidence."),
    ("Which cities do you deliver to?", "delivery", "We deliver across major Indian cities including Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad and more."),
    ("How long does delivery take?", "delivery", "Most products are delivered and assembled within 7-12 working days. Made-to-order items may take 3-4 weeks."),
    ("Is assembly included?", "delivery", "Yes — free assembly is included on all furniture orders within serviceable pincodes."),
    ("What warranty do you offer?", "warranty", "Warranty ranges from 1 to 5 years depending on the product. The exact warranty is listed on every product page."),
    ("Can I see products in person?", "general", "Absolutely. Visit our experience stores or book a video call with a consultant."),
    ("Do you offer EMI?", "payments", "Yes, we offer no-cost EMI options via leading banks. Our consultant shares the latest plans during enquiry."),
    ("Do you support bulk / wholesale orders?", "wholesale", "Yes — visit our Wholesale page or fill the bulk enquiry form. We work with builders, hotels, restaurants and corporate offices."),
    ("How do I become a WODMIN dealer?", "wholesale", "Submit a dealer application on the Dealer Program page. Our partnerships team responds within 48 hours."),
    ("Can I customise dimensions or colours?", "customisation", "Many products offer 2-3 size and colour variations. For fully custom requirements, raise a project enquiry."),
    ("What materials do you use?", "materials", "We use a mix of solid wood, engineered wood, metal, glass and high-grade fabrics. Each product page lists exact materials."),
    ("Are the colours exactly as shown?", "general", "Photographs are a faithful representation, but actual colours may vary slightly due to lighting and screens."),
    ("Do you provide GST invoices?", "payments", "Yes, GST invoices are issued for every order, including B2B and wholesale."),
    ("Can I cancel my order?", "orders", "Enquiries can be cancelled any time. Confirmed orders are subject to our cancellation policy shared by the consultant."),
    ("Do you offer corporate / project pricing?", "wholesale", "Yes — we have dedicated project teams for corporates, hotels and builders."),
    ("How do I track my order?", "delivery", "Once confirmed, our team shares a tracking link and a dedicated WhatsApp number for live updates."),
    ("What is your return policy?", "orders", "Custom-made items are non-returnable. Standard items can be returned in case of manufacturing defects within 7 days."),
    ("Are mattresses sold separately?", "products", "Yes — mattresses are listed and priced separately from beds."),
    ("Is the furniture termite-resistant?", "materials", "All engineered and solid wood pieces undergo termite-resistant treatment as standard."),
    ("Do you offer interior design help?", "services", "Yes — book a free 30-minute consultation with our in-house designer."),
    ("Can I download product catalogues?", "general", "Yes — every product page has a 'Download Specification' button."),
    ("Do you ship internationally?", "delivery", "Currently we serve India only. International project enquiries are handled case-by-case."),
    ("How are prices shown?", "payments", "All prices are in Indian Rupees (₹), inclusive of GST unless mentioned."),
    ("Do you offer installation videos?", "services", "Yes — we share installation walkthroughs for self-assembly items."),
    ("Is there a minimum order for wholesale?", "wholesale", "Wholesale typically starts at orders worth ₹2,00,000 or 10+ units."),
    ("Can I store my favourites?", "general", "Use the Wishlist on every product page (coming soon) to save and compare."),
    ("How can I share a product?", "general", "Use the share icon on the product page to send via WhatsApp, email or link."),
    ("Are your products eco-friendly?", "materials", "We prefer FSC-certified wood and low-VOC finishes wherever feasible."),
    ("Do you offer dealer training?", "wholesale", "Yes — we host onboarding sessions and product training quarterly."),
    ("How do I reach customer support?", "general", "WhatsApp us, call our hotline, or fill the contact form. We respond within 2 working hours."),
]


def build_faqs() -> list[dict]:
    out = []
    for i, (q, cat, a) in enumerate(FAQ_DEFS):
        out.append({
            "id": str(uuid.uuid4()),
            "question": q,
            "category": cat,
            "answer": a,
            "order": i,
        })
    return out


# ---------- GALLERY ----------
def build_gallery() -> list[dict]:
    types = ["Customer Home", "Office Project", "Retail Display", "Installation"]
    titles = [
        "Mehta Family Home, Bandra Mumbai", "Co-working Hub, HSR Bengaluru", "WODMIN Flagship Store, Hyderabad",
        "Singh Residence, Gurugram", "Banquet Hall, Jaipur", "Boutique Hotel, Goa",
        "Kapoor Apartment, Powai Mumbai", "Tech Office, Cyber City Gurugram",
        "Iyer Villa, Chennai", "Architect Studio, Pune", "Cafe Setup, Indiranagar Bengaluru",
        "Shah Duplex, Ahmedabad",
    ]
    out = []
    for i, title in enumerate(titles):
        out.append({
            "id": str(uuid.uuid4()),
            "title": title,
            "category": types[i % len(types)],
            "image": IMG["gallery"][i % len(IMG["gallery"])],
            "created_at": _now(),
        })
    return out


def seed_all() -> dict:
    categories = build_categories()
    collections = build_collections()
    products = build_products(categories, collections)
    blogs = build_blogs()
    testimonials = build_testimonials()
    faqs = build_faqs()
    gallery = build_gallery()
    return {
        "categories": categories,
        "collections": collections,
        "products": products,
        "blogs": blogs,
        "testimonials": testimonials,
        "faqs": faqs,
        "gallery": gallery,
    }
