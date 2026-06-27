"""Iteration 2 backend tests: admin JWT auth, admin CRUD, PDF, sitemap, robots, by-ids."""
import os
import re
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    for line in Path("/app/frontend/.env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
            break

API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@wodmin.in"
ADMIN_PASSWORD = "WodminAdmin@2026"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    assert data.get("token_type") == "bearer"
    assert data["admin"]["email"] == ADMIN_EMAIL
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- Catalogue size (304 products) ----------
class TestCatalogueSize:
    def test_products_count(self):
        r = requests.get(f"{API}/products", timeout=30)
        assert r.status_code == 200
        data = r.json()
        # response may be list or {items,total}
        if isinstance(data, dict) and "items" in data:
            total = data.get("total", len(data["items"]))
            assert total >= 300, f"expected >=300 products, got {total}"
        else:
            assert len(data) >= 300, f"expected >=300 products, got {len(data)}"


# ---------- Admin Auth ----------
class TestAdminAuth:
    def test_login_wrong_password(self):
        r = requests.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": "wrong-pw"}, timeout=20)
        assert r.status_code == 401

    def test_login_success(self, token):
        assert isinstance(token, str) and len(token) > 20

    def test_me_no_auth(self):
        r = requests.get(f"{API}/admin/me", timeout=20)
        assert r.status_code in (401, 403)

    def test_me_with_token(self, auth_headers):
        r = requests.get(f"{API}/admin/me", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert "id" in data and "role" in data

    def test_me_bad_token(self):
        r = requests.get(f"{API}/admin/me", headers={"Authorization": "Bearer not.a.real.token"}, timeout=20)
        assert r.status_code in (401, 403)


# ---------- Admin analytics ----------
class TestAdminAnalytics:
    def test_analytics(self, auth_headers):
        r = requests.get(f"{API}/admin/analytics", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        data = r.json()
        # tolerant of either nested counts or top-level
        counts_src = data.get("counts", data)
        for k in ["products", "categories"]:
            assert k in counts_src, f"missing counts key '{k}': keys={list(counts_src)[:8]}"
        assert int(counts_src["products"]) >= 300
        assert "recent_enquiries" in data
        assert "products_by_category" in data
        assert isinstance(data["recent_enquiries"], list)
        assert isinstance(data["products_by_category"], list)

    def test_analytics_requires_auth(self):
        r = requests.get(f"{API}/admin/analytics", timeout=20)
        assert r.status_code in (401, 403)


# ---------- Admin Product CRUD ----------
class TestAdminProductCRUD:
    def test_create_no_auth(self):
        r = requests.post(f"{API}/admin/products", json={"name": "X"}, timeout=20)
        assert r.status_code in (401, 403, 422)  # 422 if required field missing & still no auth -> should be 401

    def test_full_cycle(self, auth_headers):
        suffix = uuid.uuid4().hex[:8]
        payload = {
            "name": f"TEST_Product_{suffix}",
            "slug": f"test-product-{suffix}",
            "category_slug": "beds",
            "price": 19999,
            "mrp": 29999,
            "image": "https://example.com/test.jpg",
            "description": "TEST product",
            "is_new_arrival": True,
        }
        r = requests.post(f"{API}/admin/products", json=payload, headers=auth_headers, timeout=20)
        assert r.status_code in (200, 201), f"create failed: {r.status_code} {r.text}"
        created = r.json()
        pid = created.get("id") or created.get("_id") or created.get("product", {}).get("id")
        assert pid, f"no id in create response: {created}"

        # GET by slug verifies persistence
        g = requests.get(f"{API}/products/{payload['slug']}", timeout=20)
        assert g.status_code == 200
        assert g.json()["product"]["name"] == payload["name"]

        # UPDATE
        upd = {**payload, "name": f"TEST_Product_{suffix}_v2"}
        u = requests.put(f"{API}/admin/products/{pid}", json=upd, headers=auth_headers, timeout=20)
        assert u.status_code == 200, f"update failed: {u.status_code} {u.text}"
        g2 = requests.get(f"{API}/products/{payload['slug']}", timeout=20)
        assert g2.json()["product"]["name"] == upd["name"]

        # DELETE
        d = requests.delete(f"{API}/admin/products/{pid}", headers=auth_headers, timeout=20)
        assert d.status_code in (200, 204)
        g3 = requests.get(f"{API}/products/{payload['slug']}", timeout=20)
        assert g3.status_code == 404

    def test_update_no_auth(self):
        r = requests.put(f"{API}/admin/products/nonexistent", json={"name": "x"}, timeout=20)
        assert r.status_code in (401, 403)

    def test_delete_no_auth(self):
        r = requests.delete(f"{API}/admin/products/nonexistent", timeout=20)
        assert r.status_code in (401, 403)


# ---------- Admin generic CRUD on simple collections ----------
@pytest.mark.parametrize("resource,payload", [
    ("categories", {"name": "TEST_Cat", "slug": f"test-cat-{uuid.uuid4().hex[:6]}", "image": "x.jpg"}),
    ("collections", {"name": "TEST_Coll", "slug": f"test-coll-{uuid.uuid4().hex[:6]}", "image": "x.jpg"}),
    ("blogs", {"title": "TEST_Blog", "slug": f"test-blog-{uuid.uuid4().hex[:6]}", "category": "tips", "content": "Body"}),
    ("testimonials", {"name": "TEST_T", "quote": "Great!", "rating": 5}),
    ("faqs", {"question": "TEST_Q?", "answer": "A.", "category": "general"}),
    ("gallery", {"title": "TEST_G", "category": "Customer Home", "image": "x.jpg"}),
])
class TestAdminGenericCRUD:
    def test_no_auth_list(self, resource, payload):
        r = requests.get(f"{API}/admin/{resource}", timeout=20)
        assert r.status_code in (401, 403)

    def test_create_update_delete(self, auth_headers, resource, payload):
        c = requests.post(f"{API}/admin/{resource}", json=payload, headers=auth_headers, timeout=20)
        assert c.status_code in (200, 201), f"{resource} create: {c.status_code} {c.text}"
        item = c.json()
        item_id = item.get("id") or item.get("_id")
        assert item_id, f"no id for {resource}: {item}"

        l = requests.get(f"{API}/admin/{resource}", headers=auth_headers, timeout=20)
        assert l.status_code == 200
        assert any(d.get("id") == item_id for d in l.json())

        # update with same model (key fields)
        upd = {**payload}
        if "name" in upd:
            upd["name"] = upd["name"] + "_upd"
        if "title" in upd:
            upd["title"] = upd["title"] + "_upd"
        if "question" in upd:
            upd["question"] = upd["question"] + "_upd"
        u = requests.put(f"{API}/admin/{resource}/{item_id}", json=upd, headers=auth_headers, timeout=20)
        assert u.status_code == 200, f"{resource} update: {u.status_code} {u.text}"

        d = requests.delete(f"{API}/admin/{resource}/{item_id}", headers=auth_headers, timeout=20)
        assert d.status_code in (200, 204), f"{resource} delete: {d.status_code} {d.text}"


# ---------- Admin Banner ----------
class TestAdminBanner:
    def test_get_banner_public(self):
        r = requests.get(f"{API}/banner", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert "title" in data

    def test_put_banner_no_auth(self):
        r = requests.put(f"{API}/admin/banner", json={"title": "x"}, timeout=20)
        assert r.status_code in (401, 403)

    def test_put_banner_with_auth(self, auth_headers):
        payload = {"title": "TEST Banner", "subtitle": "TEST sub", "cta_label": "Go", "cta_link": "/categories", "active": True}
        r = requests.put(f"{API}/admin/banner", json=payload, headers=auth_headers, timeout=20)
        assert r.status_code == 200, f"{r.status_code} {r.text}"
        g = requests.get(f"{API}/banner", timeout=20)
        assert g.status_code == 200
        assert g.json()["title"] == "TEST Banner"


# ---------- Admin Enquiry pipeline ----------
class TestAdminEnquiries:
    @pytest.mark.parametrize("path", [
        "enquiries", "wholesale-enquiries", "dealer-applications", "callback-requests", "newsletter"
    ])
    def test_list_no_auth(self, path):
        r = requests.get(f"{API}/admin/{path}", timeout=20)
        assert r.status_code in (401, 403)

    @pytest.mark.parametrize("path", [
        "enquiries", "wholesale-enquiries", "dealer-applications", "callback-requests", "newsletter"
    ])
    def test_list_with_auth(self, auth_headers, path):
        r = requests.get(f"{API}/admin/{path}", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        body = r.json()
        items = body["items"] if isinstance(body, dict) and "items" in body else body
        assert isinstance(items, list)

    def test_status_update_flow(self, auth_headers):
        # First create an enquiry via public endpoint, then PATCH status
        payload = {"name": "TEST_Enq", "phone": "9999999999", "message": "hi", "source": "product"}
        c = requests.post(f"{API}/enquiries", json=payload, timeout=20)
        assert c.status_code in (200, 201), c.text
        enq = c.json()
        eid = enq.get("id")
        assert eid
        u = requests.patch(f"{API}/admin/enquiries/{eid}/status", json={"status": "contacted"}, headers=auth_headers, timeout=20)
        assert u.status_code == 200, f"{u.status_code} {u.text}"
        # verify via list
        body = requests.get(f"{API}/admin/enquiries", headers=auth_headers, timeout=20).json()
        lst = body["items"] if isinstance(body, dict) and "items" in body else body
        found = [x for x in lst if x.get("id") == eid]
        assert found and found[0].get("status") == "contacted"


# ---------- products/by-ids ----------
class TestProductsByIds:
    def test_by_ids_order_preserved(self):
        # fetch a few product ids first
        r = requests.get(f"{API}/products?limit=5", timeout=20)
        assert r.status_code == 200
        data = r.json()
        items = data["items"] if isinstance(data, dict) and "items" in data else data
        ids = [p["id"] for p in items[:3]]
        # reverse and request
        ordered = list(reversed(ids))
        q = ",".join(ordered)
        r2 = requests.get(f"{API}/products/by-ids", params={"ids": q}, timeout=20)
        assert r2.status_code == 200
        got = r2.json()
        assert [p["id"] for p in got] == ordered

    def test_by_ids_empty(self):
        r = requests.get(f"{API}/products/by-ids", params={"ids": ""}, timeout=20)
        assert r.status_code == 200
        assert r.json() == []


# ---------- PDF endpoints ----------
class TestPDFs:
    def test_catalogue_pdf(self):
        r = requests.get(f"{API}/catalogue.pdf", timeout=120)
        assert r.status_code == 200
        assert "application/pdf" in r.headers.get("Content-Type", "")
        assert len(r.content) > 50_000  # multi-KB at least
        assert r.content[:4] == b"%PDF"

    def test_product_pdf(self):
        # use a known seeded slug if 'wodmin-preview' exists, else first product slug
        slug = "wodmin-preview"
        probe = requests.get(f"{API}/products/{slug}", timeout=20)
        if probe.status_code == 404:
            data = requests.get(f"{API}/products?limit=1", timeout=20).json()
            items = data["items"] if isinstance(data, dict) and "items" in data else data
            slug = items[0]["slug"]
        r = requests.get(f"{API}/products/{slug}/pdf", timeout=30)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:200]}"
        assert "application/pdf" in r.headers.get("Content-Type", "")
        cd = r.headers.get("Content-Disposition", "")
        assert "attachment" in cd.lower()
        assert len(r.content) > 1000
        assert r.content[:4] == b"%PDF"


# ---------- SEO: sitemap + robots ----------
class TestSEO:
    def test_sitemap_xml(self):
        r = requests.get(f"{BASE_URL}/sitemap.xml", timeout=30)
        assert r.status_code == 200
        ct = r.headers.get("Content-Type", "")
        assert "xml" in ct.lower()
        body = r.text
        assert "<urlset" in body
        # parse
        root = ET.fromstring(body)
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        urls = root.findall("sm:url", ns)
        assert len(urls) >= 50, f"too few sitemap entries: {len(urls)}"
        locs = [u.find("sm:loc", ns).text for u in urls]
        assert any("/product/" in l for l in locs), "no product URLs in sitemap"
        assert any("/category/" in l for l in locs), "no category URLs in sitemap"

    def test_robots_txt(self):
        r = requests.get(f"{BASE_URL}/robots.txt", timeout=20)
        assert r.status_code == 200
        body = r.text
        assert "Disallow:" in body
        assert "/admin" in body
        assert re.search(r"(?i)sitemap:\s*https?://", body), "robots.txt missing Sitemap line"
