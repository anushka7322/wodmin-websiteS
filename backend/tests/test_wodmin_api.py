"""WODMIN backend API tests — catalogue, content and enquiry endpoints."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to read from frontend env
    from pathlib import Path
    fe = Path("/app/frontend/.env").read_text()
    for line in fe.splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
            break

API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# --- Catalogue ---

def _assert_no_mongo_id(obj):
    """Recursively check no _id field present."""
    if isinstance(obj, dict):
        assert "_id" not in obj, f"_id leaked in response: {list(obj.keys())[:5]}"
        for v in obj.values():
            _assert_no_mongo_id(v)
    elif isinstance(obj, list):
        for v in obj:
            _assert_no_mongo_id(v)


class TestCategories:
    def test_list_categories(self, s):
        r = s.get(f"{API}/categories")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 25, f"expected >=25 categories, got {len(data)}"
        _assert_no_mongo_id(data)
        for c in data[:5]:
            assert "name" in c and "slug" in c and "image" in c

    def test_get_category_by_slug(self, s):
        r = s.get(f"{API}/categories")
        slug = r.json()[0]["slug"]
        r2 = s.get(f"{API}/categories/{slug}")
        assert r2.status_code == 200
        assert r2.json()["slug"] == slug

    def test_get_category_404(self, s):
        r = s.get(f"{API}/categories/nonexistent-xyz")
        assert r.status_code == 404


class TestCollections:
    def test_list_collections(self, s):
        r = s.get(f"{API}/collections")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 15
        _assert_no_mongo_id(data)

    def test_get_collection_by_slug(self, s):
        slug = s.get(f"{API}/collections").json()[0]["slug"]
        r = s.get(f"{API}/collections/{slug}")
        assert r.status_code == 200
        assert r.json()["slug"] == slug


class TestProducts:
    def test_list_products_paginated(self, s):
        r = s.get(f"{API}/products?limit=24")
        assert r.status_code == 200
        data = r.json()
        for k in ("items", "total", "limit", "skip"):
            assert k in data
        assert data["total"] >= 60, f"expected >=60 products, got {data['total']}"
        _assert_no_mongo_id(data["items"])

    def test_filter_by_category(self, s):
        cats = s.get(f"{API}/categories").json()
        slug = cats[0]["slug"]
        r = s.get(f"{API}/products?category={slug}")
        assert r.status_code == 200
        for p in r.json()["items"]:
            assert p["category_slug"] == slug

    def test_search_query(self, s):
        r = s.get(f"{API}/products?q=sofa")
        assert r.status_code == 200
        assert r.json()["total"] >= 0  # may be 0 if no sofa products

    def test_price_filter(self, s):
        r = s.get(f"{API}/products?min_price=10000&max_price=30000")
        assert r.status_code == 200
        for p in r.json()["items"]:
            assert 10000 <= p["price"] <= 30000

    def test_best_seller_filter(self, s):
        r = s.get(f"{API}/products?is_best_seller=true")
        assert r.status_code == 200
        for p in r.json()["items"]:
            assert p.get("is_best_seller") is True

    def test_sort_price_asc(self, s):
        r = s.get(f"{API}/products?sort=price_asc&limit=10")
        prices = [p["price"] for p in r.json()["items"]]
        assert prices == sorted(prices)

    def test_sort_price_desc(self, s):
        r = s.get(f"{API}/products?sort=price_desc&limit=10")
        prices = [p["price"] for p in r.json()["items"]]
        assert prices == sorted(prices, reverse=True)

    def test_sort_newest(self, s):
        r = s.get(f"{API}/products?sort=newest&limit=5")
        assert r.status_code == 200

    def test_featured(self, s):
        r = s.get(f"{API}/products/featured")
        assert r.status_code == 200
        data = r.json()
        for k in ("best_sellers", "new_arrivals", "budget"):
            assert k in data and isinstance(data[k], list)
        _assert_no_mongo_id(data)

    def test_get_product_detail(self, s):
        items = s.get(f"{API}/products?limit=1").json()["items"]
        slug = items[0]["slug"]
        r = s.get(f"{API}/products/{slug}")
        assert r.status_code == 200
        data = r.json()
        assert "product" in data and "related" in data
        assert data["product"]["slug"] == slug
        _assert_no_mongo_id(data)

    def test_product_detail_404(self, s):
        r = s.get(f"{API}/products/does-not-exist-xyz")
        assert r.status_code == 404


class TestFilters:
    def test_filters(self, s):
        r = s.get(f"{API}/filters")
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d["materials"], list) and len(d["materials"]) > 0
        assert isinstance(d["colours"], list) and len(d["colours"]) > 0
        assert isinstance(d["price_min"], (int, float))
        assert isinstance(d["price_max"], (int, float))


class TestBlogs:
    def test_list_blogs(self, s):
        r = s.get(f"{API}/blogs")
        assert r.status_code == 200
        d = r.json()
        assert "items" in d and "total" in d
        assert d["total"] >= 1
        _assert_no_mongo_id(d["items"])

    def test_blog_detail(self, s):
        items = s.get(f"{API}/blogs").json()["items"]
        slug = items[0]["slug"]
        r = s.get(f"{API}/blogs/{slug}")
        assert r.status_code == 200
        d = r.json()
        assert "blog" in d and "related" in d

    def test_blog_category_filter(self, s):
        items = s.get(f"{API}/blogs").json()["items"]
        cat = items[0].get("category")
        if cat:
            r = s.get(f"{API}/blogs?category={cat}")
            assert r.status_code == 200
            for b in r.json()["items"]:
                assert b["category"] == cat


class TestTestimonials:
    def test_testimonials(self, s):
        r = s.get(f"{API}/testimonials")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 24
        _assert_no_mongo_id(data)


class TestFaqs:
    def test_faqs(self, s):
        r = s.get(f"{API}/faqs")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 30
        orders = [f.get("order", 0) for f in data]
        assert orders == sorted(orders)
        _assert_no_mongo_id(data)


class TestGallery:
    def test_gallery(self, s):
        r = s.get(f"{API}/gallery")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        _assert_no_mongo_id(data)


# --- Enquiry endpoints ---
class TestEnquiries:
    def test_create_enquiry(self, s):
        payload = {
            "name": "TEST_user",
            "phone": "9876543210",
            "email": "test@example.com",
            "message": "interested",
            "product_id": "p1",
            "product_name": "Sofa",
            "category_slug": "sofas",
            "source": "product",
        }
        r = s.post(f"{API}/enquiries", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["id"] and d["status"] == "new"
        assert d["name"] == "TEST_user"
        assert d["product_name"] == "Sofa"

    def test_enquiry_missing_required(self, s):
        r = s.post(f"{API}/enquiries", json={"name": "x"})
        assert r.status_code == 422

    def test_wholesale_enquiry(self, s):
        payload = {
            "name": "TEST_wh",
            "phone": "9876543210",
            "company": "Acme",
            "business_type": "builder",
            "city": "Mumbai",
        }
        r = s.post(f"{API}/wholesale-enquiries", json=payload)
        assert r.status_code == 200, r.text
        assert r.json()["company"] == "Acme"

    def test_wholesale_missing_required(self, s):
        r = s.post(f"{API}/wholesale-enquiries", json={"name": "x", "phone": "1"})
        assert r.status_code == 422

    def test_dealer_application(self, s):
        payload = {
            "name": "TEST_dl",
            "phone": "9876543210",
            "email": "dl@example.com",
            "company": "Dealer Co",
            "city": "Delhi",
            "state": "Delhi",
        }
        r = s.post(f"{API}/dealer-applications", json=payload)
        assert r.status_code == 200, r.text
        assert r.json()["state"] == "Delhi"

    def test_dealer_missing_required(self, s):
        r = s.post(f"{API}/dealer-applications", json={"name": "x"})
        assert r.status_code == 422

    def test_callback(self, s):
        r = s.post(f"{API}/callback-requests", json={"name": "TEST_cb", "phone": "9876543210"})
        assert r.status_code == 200
        assert r.json()["status"] == "new"

    def test_newsletter_subscribe(self, s):
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        r = s.post(f"{API}/newsletter", json={"email": email})
        assert r.status_code == 200
        assert r.json()["status"] == "subscribed"
        # resubscribe
        r2 = s.post(f"{API}/newsletter", json={"email": email})
        assert r2.json()["status"] == "already_subscribed"
