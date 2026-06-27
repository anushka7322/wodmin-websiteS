# WODMIN — Product Requirements Document

## Original problem statement (verbatim)
Build a production-ready website for **WODMIN**, an Indian furniture & home solutions brand. **NOT** an e-commerce website — customers browse, build trust and enquire (Get Quote, Enquire Now, WhatsApp, Call, Request Callback, Visit Store). Positioning: Affordable • Reliable • Modern • Durable. Tagline: "Modern Furniture for Every Home." Target market: India. Architecture must be ready to layer e-commerce (cart, checkout, payments, accounts, tracking) later without redesign.

## Stack
- Frontend: React (CRA) + Tailwind + Shadcn UI + Framer Motion + React Router 7 + React Helmet Async
- Backend: FastAPI + Motor (async MongoDB) + ReportLab PDF + PyJWT + bcrypt
- DB: MongoDB (UUID string IDs, ISO datetimes; no ObjectIds leaked)

## Core user personas
1. Indian family/homeowner browsing furniture for a 1-3 BHK home
2. Student / young professional with budget constraints
3. Builder / interior designer / hotel buying bulk
4. Dealer / wholesaler applying to partner
5. WODMIN admin managing the catalogue and pipeline

## What's been implemented

### Iteration 1 — Feb 2026
- Backend `server.py`: public catalogue + enquiry endpoints (/api)
- Seeder: 25 categories, 15 collections, 70+ products, 20 blogs, 50 testimonials, 30 FAQs, 12 gallery items
- Frontend public site: Home, About, Categories, Category detail, Collections, Collection detail, Products (search/filter/sort), Product detail (gallery, accordions, sticky enquiry), Wholesale, Dealer, Gallery, Blogs, Blog detail, FAQs, Contact (form + callback + 4 stores + map), Privacy, Terms, 404
- Header (sticky + mega menu + search + mobile drawer), Footer, Floating WhatsApp button
- Forms persist: enquiries, wholesale, dealer, callback, newsletter
- Test results: backend 31/31, frontend 97% (one bug fixed)

### Iteration 2 — Feb 2026 (this iteration)
- **Admin JWT auth**: bcrypt + HS256 PyJWT (12h tokens), Authorization Bearer header, axios interceptor with 401 redirect. Seeded admin from .env on startup. Credentials live in `/app/memory/test_credentials.md`.
- **Admin console** (`/admin/*` — no public chrome): Login, Dashboard (stats cards + recent enquiries + top categories chart), Products (304 rows with search + create/edit/delete modal), Categories CRUD, Collections CRUD, Blogs CRUD, Testimonials CRUD, FAQs CRUD, Gallery CRUD, Homepage Banner editor, Customer Enquiries pipeline, Wholesale, Dealer applications, Callbacks, Newsletter subscribers (each with status filtering + detail modal + mark contacted/qualified/closed).
- **Catalogue expanded to 304 products** via Walnut/Oak/Wenge variants in the seeder.
- **SEO**: react-helmet-async wraps the app. `Seo` component sets title/description/OG/Twitter meta. JSON-LD helpers emit Organization (home), Product + BreadcrumbList (PDP), Article (blog detail), FAQPage (FAQs).
- **sitemap.xml + robots.txt** are emitted both as `/api/sitemap.xml`, `/api/robots.txt` and written statically into `/app/frontend/public` on every backend startup so they're reachable through the public ingress at `/sitemap.xml` and `/robots.txt`.
- **PDF downloads**: `GET /api/catalogue.pdf` (full catalogue, ~7MB) and `GET /api/products/{slug}/pdf` (individual spec sheet) generated with ReportLab. Wired up on PDP via direct links.
- **Wishlist + Compare + Recently Viewed**: localStorage-backed React Context (`storageContext.jsx`). Heart + Compare icons on every ProductCard and PDP. Header badges show counts. Dedicated `/wishlist` and `/compare` (side-by-side spec table, max 4) pages. Recently Viewed tracked automatically on every PDP visit.

## Backlog (next iterations)
### P0
- Object storage for product images (currently Unsplash URLs); admin image uploader.
- Send-to-WhatsApp / email handoff from admin's "Mark contacted" status update.
- Brute-force lockout on admin login (current MVP: no lockout).
### P1
- Customer accounts (saved wishlist server-side, order history) when e-commerce launches.
- Stripe + Razorpay payment + cart/checkout (architecture ready).
- Live chat widget.
- Cache the catalogue PDF (rebuild only on catalogue change; current build is ~11 s per request).
### P2
- Loyalty / referral program; coupons; inventory module.
- Multi-language (Hindi).

## Brand & contact constants
See `/app/frontend/src/lib/contact.js` — phone, WhatsApp, email, address, stores all editable in one file.
