import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";
import { SlidersHorizontal, X } from "lucide-react";

const SORTS = [
  { v: "popular", l: "Popular" },
  { v: "newest", l: "Newest" },
  { v: "price_asc", l: "Price: Low to High" },
  { v: "price_desc", l: "Price: High to Low" },
  { v: "rating", l: "Top Rated" },
];

export default function ProductGrid({ fixedCategory, fixedCollection, fixedFilters, title }) {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ materials: [], colours: [], price_min: 0, price_max: 100000 });
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const q = params.get("q") || "";
  const material = params.get("material") || "";
  const colour = params.get("colour") || "";
  const minPrice = Number(params.get("min_price") || 0);
  const maxPrice = Number(params.get("max_price") || 0);
  const sort = params.get("sort") || "popular";
  const inStock = params.get("in_stock") === "true";

  useEffect(() => {
    api.get("/filters").then((r) => setFilters(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = {
      sort,
      limit: 60,
      ...(fixedCategory ? { category: fixedCategory } : {}),
      ...(fixedCollection ? { collection: fixedCollection } : {}),
      ...(fixedFilters || {}),
      ...(q ? { q } : {}),
      ...(material ? { material } : {}),
      ...(colour ? { colour } : {}),
      ...(minPrice ? { min_price: minPrice } : {}),
      ...(maxPrice ? { max_price: maxPrice } : {}),
      ...(inStock ? { in_stock: true } : {}),
    };
    api.get("/products", { params: query })
      .then((r) => { setItems(r.data.items); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [fixedCategory, fixedCollection, fixedFilters, q, material, colour, minPrice, maxPrice, sort, inStock]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (!v) next.delete(k); else next.set(k, v);
    setParams(next, { replace: true });
  };
  const clearAll = () => { const keep = q ? `?q=${encodeURIComponent(q)}` : ""; setParams(new URLSearchParams(keep), { replace: true }); };

  const FilterPanel = () => (
    <aside className="space-y-7" data-testid="filter-panel">
      <div>
        <h4 className="eyebrow">Sort by</h4>
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="mt-2 w-full rounded-xl border border-brand-line bg-white px-3 py-2 text-sm"
          data-testid="sort-select"
        >
          {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
      </div>
      <div>
        <h4 className="eyebrow">Price range</h4>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={`Min ₹${filters.price_min ?? 0}`}
            defaultValue={minPrice || ""}
            onBlur={(e) => setParam("min_price", e.target.value)}
            className="rounded-xl border border-brand-line bg-white px-3 py-2 text-sm"
            data-testid="filter-min-price"
          />
          <input
            type="number"
            placeholder={`Max ₹${filters.price_max ?? 100000}`}
            defaultValue={maxPrice || ""}
            onBlur={(e) => setParam("max_price", e.target.value)}
            className="rounded-xl border border-brand-line bg-white px-3 py-2 text-sm"
            data-testid="filter-max-price"
          />
        </div>
      </div>
      <div>
        <h4 className="eyebrow">Material</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {filters.materials.slice(0, 12).map((m) => (
            <button
              key={m}
              onClick={() => setParam("material", material === m ? "" : m)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${material === m ? "border-brand-terracotta bg-brand-terracotta text-white" : "border-brand-line bg-white text-brand-walnut hover:border-brand-terracotta"}`}
              data-testid={`filter-material-${m}`}
            >{m}</button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="eyebrow">Colour</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {filters.colours.slice(0, 12).map((c) => (
            <button
              key={c}
              onClick={() => setParam("colour", colour === c ? "" : c)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${colour === c ? "border-brand-terracotta bg-brand-terracotta text-white" : "border-brand-line bg-white text-brand-walnut hover:border-brand-terracotta"}`}
              data-testid={`filter-colour-${c}`}
            >{c}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm text-brand-walnut">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setParam("in_stock", e.target.checked ? "true" : "")}
            data-testid="filter-in-stock"
          />
          In stock only
        </label>
      </div>
      <button onClick={clearAll} className="text-sm text-brand-terracotta hover:underline" data-testid="filter-clear">Clear all filters</button>
    </aside>
  );

  return (
    <div className="container-wodmin py-10">
      {title && <h2 className="font-display text-3xl sm:text-4xl text-brand-walnut">{title}</h2>}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-brand-mocha" data-testid="product-grid-count">{loading ? "Loading…" : `${total} products`}</p>
        <button
          className="md:hidden inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-4 py-2 text-sm"
          onClick={() => setShowMobileFilter(true)}
          data-testid="mobile-filter-toggle"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[260px_1fr]">
        <div className="hidden md:block"><FilterPanel /></div>
        <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-brand-sand" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-brand-line bg-white p-12 text-center">
              <p className="font-display text-2xl text-brand-walnut">No products match your filters</p>
              <p className="mt-2 text-sm text-brand-mocha">Try clearing filters or browsing other categories.</p>
              <button className="btn-secondary mt-5" onClick={clearAll}>Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="product-grid">
              {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>

      {showMobileFilter && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setShowMobileFilter(false)}>
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg">Filters</span>
              <button onClick={() => setShowMobileFilter(false)} className="p-2"><X className="h-5 w-5" /></button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
}
