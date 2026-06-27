# WODMIN — Product Requirements Document

## Original problem statement (verbatim)
Build a production-ready website for **WODMIN**, an Indian furniture & home solutions brand. **NOT** an e-commerce website — customers browse, build trust and enquire (Get Quote, Enquire Now, WhatsApp, Call, Request Callback, Visit Store). Positioning: Affordable • Reliable • Modern • Durable. Tagline: "Modern Furniture for Every Home." Target market: India. Architecture must be ready to layer e-commerce (cart, checkout, payments, accounts, tracking) later without redesign.

## Stack
- Frontend: React (CRA) + Tailwind + Shadcn UI + Framer Motion + React Router 7
- Backend: FastAPI + Motor (async MongoDB)
- DB: MongoDB (UUID string IDs, ISO datetimes; no ObjectIds leaked)
- (Brief requested Next.js + Supabase; this environment runs React + FastAPI + MongoDB — stack swap approved by user via skip)

## Core user personas
1. Indian family/homeowner browsing furniture for a 1-3 BHK home
2. Student / young professional with budget constraints
3. Builder / interior designer / hotel buying bulk
4. Dealer / wholesaler applying to partner

## Core requirements (static)
- No cart/checkout/payment/order placement
- Every product carries: Get Quote, Enquire Now, WhatsApp, Call, Share, Download Catalogue/Spec, plus phone CTA on card
- Catalogue: 25 categories, 15 collections, ~75 products, 20 blogs, 50 testimonials, 30 FAQs, gallery
- Pages: Home, About, Categories, Collections, Products, Product Detail, Wholesale, Dealer, Gallery, Blogs, Blog Detail, FAQs, Contact, Privacy, Terms, 404
- Forms persisted to MongoDB: enquiries, wholesale_enquiries, dealer_applications, callbacks, newsletter
- SEO-ready meta tags, semantic structure, responsive (mobile + desktop)
- Brand identity: terracotta (#C25934) + cream + walnut + sage; Fraunces display + DM Sans body

## What's been implemented — Feb 2026 (iteration 1)
- Backend `server.py`: 18 REST endpoints under `/api` with filtering, sort, pagination, related products, featured groupings
- Backend seeder `seed_data.py`: auto-seeds 25 categories, 15 collections, ~76 products, 20 blogs, 50 testimonials, 30 FAQs, 12 gallery items on first boot
- Form capture: enquiries, wholesale, dealer, callback, newsletter (with idempotent dedupe)
- Frontend: Home (hero, value strip, categories, best sellers, new arrivals, budget banner, process, B2B CTA, testimonials, blogs, enquiry form), Categories, CategoryDetail (with virtual-category support for New Arrivals/Budget/etc), Collections + Detail, Products (search & filters), ProductDetail (gallery, colour/size, accordions, sticky enquiry, related), Wholesale form, Dealer form, Gallery (filterable), Blogs + Detail, FAQs (filterable accordion), Contact (form + callback + map + 4 stores), About, Privacy, Terms, 404
- Header: sticky, mega menu, search, mobile drawer
- Floating WhatsApp button on every page
- Newsletter in footer
- Page transitions, framer-motion reveals, hover micro-interactions
- Lint clean (warnings only on shadcn-bundled files & unescaped quotes — non-blocking)
- Testing iteration 1: backend 100% (31/31 pytest), frontend ~97% — one issue (virtual category slugs) fixed.

## Prioritized backlog
### P0 — next iteration (admin & polish)
- Admin dashboard (JWT login, CRUD for products/categories/collections/blogs/testimonials/banners, view enquiries/dealer apps/wholesale, mark as contacted, basic analytics)
- Wishlist + Compare + Recently Viewed (architected client-side, ready to wire to backend)
- More product images per item (currently 3 from a small pool) — integrate object storage
- Catalogue & spec sheet PDF generation
- Dark mode finishing pass

### P1 — content & SEO
- Per-route SEO/OG meta via react-helmet-async
- Structured data (Product, Blog, FAQ, LocalBusiness, BreadcrumbList)
- sitemap.xml + robots.txt
- 300 full products (currently 76 — extend seed)

### P2 — future e-commerce hooks (architecture-ready)
- Razorpay/Stripe integration
- Customer accounts, order tracking
- Inventory, coupons, loyalty
- Live chat (placeholder in UI)

## Brand & contact constants
- See `/app/frontend/src/lib/contact.js` — phone, WhatsApp, email, address, stores all editable in one file.
