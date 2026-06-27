import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Search, Phone, ChevronDown, Heart, GitCompare } from "lucide-react";
import { BRAND, CONTACT } from "@/lib/contact";
import { api } from "@/lib/api";
import { useStorage } from "@/lib/storageContext";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/categories", label: "Categories" },
  { to: "/collections", label: "Collections" },
  { to: "/products", label: "Products" },
  { to: "/wholesale", label: "Wholesale" },
  { to: "/dealer", label: "Dealer" },
  { to: "/gallery", label: "Gallery" },
  { to: "/blogs", label: "Blogs" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [megaCats, setMegaCats] = useState([]);
  const [megaOpen, setMegaOpen] = useState(false);
  const navigate = useNavigate();
  const { wishlist = [], compare = [] } = useStorage() || {};

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    api.get("/categories").then((r) => setMegaCats(r.data || [])).catch(() => {});
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/products?q=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false);
    setOpen(false);
  };

  return (
    <header
      data-testid="site-header"
      className={`sticky top-0 z-40 transition-all ${
        scrolled ? "bg-white/95 backdrop-blur border-b border-brand-line shadow-sm" : "bg-brand-cream/90 backdrop-blur"
      }`}
    >
      {/* Top utility bar */}
      <div className="hidden md:block border-b border-brand-line/70 bg-brand-sand/40">
        <div className="container-wodmin flex items-center justify-between py-2 text-xs text-brand-mocha">
          <span>Free delivery & assembly across major Indian cities</span>
          <div className="flex items-center gap-5">
            <a href={CONTACT.phoneLink} className="hover:text-brand-terracotta flex items-center gap-1.5" data-testid="topbar-call">
              <Phone className="h-3.5 w-3.5" /> {CONTACT.phone}
            </a>
            <Link to="/wholesale" className="hover:text-brand-terracotta">For Dealers & Wholesale</Link>
          </div>
        </div>
      </div>

      <div className="container-wodmin flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2" data-testid="brand-logo">
          <span className="font-display text-2xl font-semibold tracking-tight text-brand-walnut">
            {BRAND.name}
            <span className="ml-0.5 text-brand-terracotta">.</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm">
          {NAV.slice(0, 1).map((n) => (
            <NavLink key={n.to} to={n.to} className={({isActive}) => `${isActive ? "text-brand-terracotta" : "text-brand-walnut hover:text-brand-terracotta"} transition-colors`}>
              {n.label}
            </NavLink>
          ))}
          {/* Mega menu trigger */}
          <div className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
            <button
              data-testid="mega-menu-trigger"
              className="flex items-center gap-1 text-brand-walnut hover:text-brand-terracotta transition-colors"
            >
              Shop <ChevronDown className="h-4 w-4" />
            </button>
            {megaOpen && (
              <div className="absolute left-1/2 top-full -translate-x-1/2 pt-4 w-[760px]" data-testid="mega-menu-panel">
                <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-xl">
                  <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                    {megaCats.slice(0, 18).map((c) => (
                      <Link
                        key={c.id}
                        to={`/category/${c.slug}`}
                        data-testid={`mega-cat-${c.slug}`}
                        className="text-sm text-brand-walnut hover:text-brand-terracotta py-1.5"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-brand-line pt-4">
                    <Link to="/categories" className="text-sm font-medium text-brand-terracotta">View all categories →</Link>
                    <Link to="/collections" className="text-sm text-brand-mocha hover:text-brand-walnut">Explore collections</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          {NAV.slice(3).map((n) => (
            <NavLink key={n.to} to={n.to} className={({isActive}) => `${isActive ? "text-brand-terracotta" : "text-brand-walnut hover:text-brand-terracotta"} transition-colors`}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            data-testid="search-toggle"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="rounded-full p-2 text-brand-walnut hover:bg-brand-sand transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link to="/compare" aria-label="Compare" data-testid="header-compare-link" className="relative rounded-full p-2 text-brand-walnut hover:bg-brand-sand transition-colors">
            <GitCompare className="h-5 w-5" />
            {compare.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-walnut px-1 text-[10px] font-semibold text-white">{compare.length}</span>
            )}
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" data-testid="header-wishlist-link" className="relative rounded-full p-2 text-brand-walnut hover:bg-brand-sand transition-colors">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-terracotta px-1 text-[10px] font-semibold text-white">{wishlist.length}</span>
            )}
          </Link>
          <Link to="/contact" className="hidden md:inline-flex btn-primary" data-testid="header-enquire-btn">
            Enquire Now
          </Link>
          <button
            data-testid="mobile-menu-toggle"
            aria-label="Menu"
            className="lg:hidden rounded-full p-2 text-brand-walnut hover:bg-brand-sand"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-brand-line bg-white">
          <form onSubmit={submitSearch} className="container-wodmin py-4 flex gap-2" data-testid="header-search-form">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sofas, beds, wardrobes, dining…"
              className="flex-1 rounded-full border border-brand-line bg-brand-cream px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-terracotta"
              data-testid="header-search-input"
            />
            <button type="submit" className="btn-primary" data-testid="header-search-submit">Search</button>
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)} data-testid="mobile-drawer-backdrop">
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-semibold">{BRAND.name}<span className="text-brand-terracotta">.</span></span>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-brand-sand" aria-label="Close menu" data-testid="mobile-drawer-close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-base text-brand-walnut hover:bg-brand-sand" data-testid={`mobile-nav-${n.label.toLowerCase()}`}>
                  {n.label}
                </Link>
              ))}
              <Link to="/faqs" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-base text-brand-walnut hover:bg-brand-sand">FAQs</Link>
              <Link to="/about" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-base text-brand-walnut hover:bg-brand-sand">About</Link>
            </nav>
            <div className="mt-6 space-y-2">
              <Link to="/contact" onClick={() => setOpen(false)} className="btn-primary w-full">Enquire Now</Link>
              <a href={CONTACT.phoneLink} className="btn-secondary w-full"><Phone className="h-4 w-4" /> Call {CONTACT.phone}</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
