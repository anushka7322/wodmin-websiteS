import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Phone, MessageCircle, Truck, ShieldCheck, Star, Sparkles, Hammer, BadgePercent, Building2, Users, Quote } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";
import EnquiryForm from "@/components/forms/EnquiryForm";
import { BRAND, CONTACT, buildWhatsAppLink } from "@/lib/contact";

const VALUES = [
  { icon: BadgePercent, title: "Up to 45% off MRP", desc: "Honest pricing direct from the brand. No showroom markup." },
  { icon: ShieldCheck, title: "1-5 year warranty", desc: "Every WODMIN piece is backed by a written warranty." },
  { icon: Truck, title: "Free delivery & assembly", desc: "Doorstep installation across major Indian cities." },
  { icon: Hammer, title: "India-built quality", desc: "Designed and assembled in our partner workshops in India." },
];

const STEPS = [
  { n: "01", title: "Browse the catalogue", desc: "Pick from 300+ designs across 25 categories." },
  { n: "02", title: "Enquire or WhatsApp", desc: "Share your space, style and budget — get a personalised quote." },
  { n: "03", title: "Confirm & schedule", desc: "Pay easily, schedule a slot that suits you." },
  { n: "04", title: "Delivery + assembly", desc: "We deliver, assemble and ensure it looks just right." },
];

export default function Home() {
  const [featured, setFeatured] = useState({ best_sellers: [], new_arrivals: [], budget: [] });
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    api.get("/products/featured").then((r) => setFeatured(r.data));
    api.get("/categories").then((r) => setCategories(r.data));
    api.get("/testimonials", { params: { limit: 9 } }).then((r) => setTestimonials(r.data));
    api.get("/blogs", { params: { limit: 3 } }).then((r) => setBlogs(r.data.items));
  }, []);

  const heroLeft = "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80";
  const heroRight = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80";

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-wodmin grid items-center gap-10 py-12 lg:grid-cols-12 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            <span className="pill-accent" data-testid="hero-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Modern Furniture for Every Home</span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-brand-walnut sm:text-5xl lg:text-6xl">
              Beautiful furniture, <span className="text-brand-terracotta">honestly priced</span>, built for Indian homes.
            </h1>
            <p className="mt-5 max-w-xl text-base text-brand-mocha sm:text-lg leading-relaxed">
              {BRAND.name} brings together modern design, durable materials and a fair price — for families, students, young professionals and businesses across India.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/categories" className="btn-primary" data-testid="hero-shop-btn">
                Explore the catalogue <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={buildWhatsAppLink()} target="_blank" rel="noreferrer" className="btn-whatsapp" data-testid="hero-whatsapp-btn">
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
              <a href={CONTACT.phoneLink} className="btn-secondary" data-testid="hero-call-btn">
                <Phone className="h-4 w-4" /> {CONTACT.phone}
              </a>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3 text-center sm:text-left">
              <div><div className="font-display text-2xl text-brand-walnut">300+</div><div className="text-xs text-brand-mocha">Designs</div></div>
              <div><div className="font-display text-2xl text-brand-walnut">25</div><div className="text-xs text-brand-mocha">Categories</div></div>
              <div><div className="font-display text-2xl text-brand-walnut">50k+</div><div className="text-xs text-brand-mocha">Happy customers</div></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-[2rem] border border-brand-line bg-brand-sand">
                <img src={heroLeft} alt="WODMIN living room" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-10 -left-10 hidden h-44 w-44 overflow-hidden rounded-3xl border-8 border-brand-cream shadow-xl sm:block">
                <img src={heroRight} alt="WODMIN bedroom" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -right-3 top-6 hidden rounded-2xl border border-brand-line bg-white p-4 shadow-lg sm:block">
                <div className="text-xs text-brand-mocha">Rated</div>
                <div className="mt-1 flex items-center gap-1.5 font-display text-xl text-brand-walnut">
                  4.8 <Star className="h-4 w-4 fill-brand-terracotta text-brand-terracotta" />
                </div>
                <div className="text-[11px] text-brand-mocha">12,000+ reviews</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Value strip */}
        <div className="container-wodmin">
          <div className="grid grid-cols-2 gap-3 rounded-3xl border border-brand-line bg-white p-4 shadow-sm sm:grid-cols-4 sm:p-6">
            {VALUES.map((v) => (
              <div key={v.title} className="flex items-start gap-3">
                <div className="rounded-xl bg-brand-sand p-2 text-brand-terracotta"><v.icon className="h-5 w-5" /></div>
                <div>
                  <div className="text-sm font-semibold text-brand-walnut">{v.title}</div>
                  <div className="text-xs text-brand-mocha">{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-wodmin py-20" data-testid="home-categories">
        <div className="flex items-end justify-between">
          <div>
            <span className="eyebrow">Shop by category</span>
            <h2 className="font-display text-3xl text-brand-walnut sm:text-4xl">Furniture for every room.</h2>
          </div>
          <Link to="/categories" className="hidden text-sm text-brand-terracotta hover:underline sm:inline">View all →</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 8).map((c, i) => (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              data-testid={`home-cat-${c.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-brand-line bg-brand-sand"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-walnut/80 via-brand-walnut/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="font-display text-xl">{c.name}</div>
                <div className="mt-1 text-xs opacity-80">Explore →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="bg-white py-20" data-testid="home-bestsellers">
        <div className="container-wodmin">
          <div className="flex items-end justify-between">
            <div>
              <span className="eyebrow">Best sellers</span>
              <h2 className="font-display text-3xl text-brand-walnut sm:text-4xl">Pieces our customers love.</h2>
            </div>
            <Link to="/products?is_best_seller=true" className="hidden text-sm text-brand-terracotta hover:underline sm:inline">See all →</Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.best_sellers.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS strip */}
      <section className="container-wodmin py-20" data-testid="home-new-arrivals">
        <div className="flex items-end justify-between">
          <div>
            <span className="eyebrow">New arrivals</span>
            <h2 className="font-display text-3xl text-brand-walnut sm:text-4xl">Fresh from the workshop.</h2>
          </div>
          <Link to="/products?is_new_arrival=true" className="hidden text-sm text-brand-terracotta hover:underline sm:inline">See all →</Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.new_arrivals.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* BUDGET BANNER */}
      <section className="bg-brand-walnut py-20 text-brand-cream" data-testid="home-budget">
        <div className="container-wodmin grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">Budget collection</span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">Smart furniture for tighter budgets, without compromise.</h2>
            <p className="mt-3 text-brand-cream/70">Beautiful, useful and durable pieces under ₹10,000. Perfect for students, new homes, and small apartments.</p>
            <Link to="/products?is_budget=true" className="btn-primary mt-6">Shop budget picks <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:col-span-7">
            {featured.budget.slice(0, 4).map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="overflow-hidden rounded-2xl bg-white text-brand-walnut">
                <div className="aspect-[4/3] overflow-hidden bg-brand-sand">
                  <img src={p.main_image} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
                <div className="p-3">
                  <div className="text-xs text-brand-mocha">{p.category_name}</div>
                  <div className="line-clamp-1 font-medium">{p.name}</div>
                  <div className="mt-1 text-sm font-semibold text-brand-terracotta">From ₹{p.price.toLocaleString("en-IN")}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="container-wodmin py-20" data-testid="home-process">
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="eyebrow">How it works</span>
            <h2 className="font-display text-3xl text-brand-walnut sm:text-4xl">A simpler way to furnish your home.</h2>
            <p className="mt-3 text-brand-mocha">No pushy salespeople, no hidden fees. Browse, enquire, confirm and we deliver.</p>
            <Link to="/contact" className="btn-secondary mt-6">Talk to a consultant</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {STEPS.map((s) => (
              <div key={s.n} className="card-soft p-6">
                <div className="font-display text-3xl text-brand-terracotta">{s.n}</div>
                <div className="mt-3 font-display text-xl text-brand-walnut">{s.title}</div>
                <p className="mt-1 text-sm text-brand-mocha">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHOLESALE / DEALER BANNER */}
      <section className="container-wodmin">
        <div className="overflow-hidden rounded-[2rem] bg-brand-sand p-8 lg:p-14">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="eyebrow">For businesses</span>
              <h2 className="font-display text-3xl text-brand-walnut sm:text-4xl">Outfit your office, hotel or project — at wholesale prices.</h2>
              <p className="mt-3 max-w-2xl text-brand-mocha">We work directly with builders, hotels, schools, restaurants, corporate offices and retail dealers. Bulk discounts, custom finishes, dedicated account manager.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/wholesale" className="btn-primary"><Building2 className="h-4 w-4" /> Wholesale enquiry</Link>
                <Link to="/dealer" className="btn-secondary"><Users className="h-4 w-4" /> Become a dealer</Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-brand-line bg-white">
                <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80" alt="WODMIN office furniture" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-wodmin py-20" data-testid="home-testimonials">
        <div className="flex items-end justify-between">
          <div>
            <span className="eyebrow">Reviews</span>
            <h2 className="font-display text-3xl text-brand-walnut sm:text-4xl">Loved by 50,000+ Indian families.</h2>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((t) => (
            <div key={t.id} className="card-soft p-6" data-testid={`testimonial-${t.id}`}>
              <Quote className="h-6 w-6 text-brand-terracotta" />
              <p className="mt-3 text-sm leading-relaxed text-brand-walnut">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-sand font-display text-brand-walnut">{t.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                <div>
                  <div className="text-sm font-medium text-brand-walnut">{t.name}</div>
                  <div className="text-xs text-brand-mocha">{t.role} · {t.city}</div>
                </div>
                <div className="ml-auto flex items-center gap-0.5 text-brand-terracotta">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BLOGS */}
      <section className="bg-white py-20">
        <div className="container-wodmin">
          <div className="flex items-end justify-between">
            <div>
              <span className="eyebrow">Latest from the journal</span>
              <h2 className="font-display text-3xl text-brand-walnut sm:text-4xl">Ideas & tips for your home.</h2>
            </div>
            <Link to="/blogs" className="hidden text-sm text-brand-terracotta hover:underline sm:inline">All articles →</Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {blogs.map((b) => (
              <Link key={b.id} to={`/blog/${b.slug}`} className="group card-soft overflow-hidden" data-testid={`home-blog-${b.slug}`}>
                <div className="aspect-[16/10] overflow-hidden bg-brand-sand">
                  <img src={b.image} alt={b.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <span className="pill">{b.category}</span>
                  <h3 className="mt-3 font-display text-xl text-brand-walnut group-hover:text-brand-terracotta">{b.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-brand-mocha">{b.excerpt}</p>
                  <div className="mt-4 text-xs text-brand-mocha">{b.author} · {b.read_minutes} min read</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ENQUIRY CTA */}
      <section className="container-wodmin py-20" data-testid="home-enquiry">
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="eyebrow">Tell us what you need</span>
            <h2 className="mt-3 font-display text-3xl text-brand-walnut sm:text-4xl">Get a personalised quote within 2 hours.</h2>
            <p className="mt-3 text-brand-mocha">Share your space, style and budget. Our consultant will hand-pick options that fit and respond on WhatsApp or call.</p>
            <ul className="mt-6 space-y-3 text-sm text-brand-walnut">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-terracotta" /> Free design consultation</li>
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-brand-terracotta" /> Free delivery & assembly</li>
              <li className="flex items-center gap-2"><BadgePercent className="h-4 w-4 text-brand-terracotta" /> Best prices, GST included</li>
            </ul>
          </div>
          <div className="card-soft p-6 sm:p-8 lg:col-span-7">
            <EnquiryForm source="general" />
          </div>
        </div>
      </section>
    </div>
  );
}
