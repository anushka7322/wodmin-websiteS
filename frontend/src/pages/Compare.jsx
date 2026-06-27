import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, GitCompare, MessageCircle, Phone } from "lucide-react";
import { api, formatINR } from "@/lib/api";
import { useStorage } from "@/lib/storageContext";
import { CONTACT, buildWhatsAppLink } from "@/lib/contact";
import Seo from "@/lib/seo";

const ROWS = [
  { label: "Price", key: "price", render: (v) => formatINR(v) },
  { label: "MRP", key: "mrp", render: (v) => formatINR(v) },
  { label: "Discount", key: "discount_pct", render: (v) => `${v}% off` },
  { label: "Category", key: "category_name" },
  { label: "Dimensions", key: "dimensions" },
  { label: "Weight", key: "weight_kg", render: (v) => `${v} kg` },
  { label: "Materials", key: "materials", render: (v) => (v || []).join(", ") },
  { label: "Colours", key: "colours", render: (v) => (v || []).join(", ") },
  { label: "Sizes", key: "sizes", render: (v) => (v || []).join(", ") },
  { label: "Warranty", key: "warranty" },
  { label: "Rating", key: "rating", render: (v, p) => `${v} (${p.review_count})` },
  { label: "Availability", key: "stock_status" },
];

export default function Compare() {
  const { compare, toggleCompare, clearCompare } = useStorage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!compare.length) { setItems([]); setLoading(false); return; }
    setLoading(true);
    api.get("/products/by-ids", { params: { ids: compare.join(",") } })
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, [compare]);

  return (
    <div className="container-wodmin py-12 lg:py-16" data-testid="compare-page">
      <Seo title="Compare products" />
      <header className="flex items-end justify-between">
        <div>
          <span className="eyebrow">Compare</span>
          <h1 className="mt-2 font-display text-4xl text-brand-walnut sm:text-5xl">Side-by-side view.</h1>
          <p className="mt-2 text-sm text-brand-mocha">Compare up to 4 products. Specs, price, warranty and more.</p>
        </div>
        {compare.length > 0 && (
          <button onClick={clearCompare} className="btn-secondary text-sm" data-testid="compare-clear">Clear all</button>
        )}
      </header>

      {loading ? (
        <div className="mt-10 text-center text-brand-mocha">Loading…</div>
      ) : items.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-brand-line bg-white p-12 text-center">
          <GitCompare className="mx-auto h-10 w-10 text-brand-terracotta" />
          <p className="mt-4 font-display text-2xl text-brand-walnut">Nothing to compare yet</p>
          <p className="mt-2 text-sm text-brand-mocha">Tap the compare icon on any product to add it here.</p>
          <Link to="/products" className="btn-primary mt-6">Browse products</Link>
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-x-4">
            <thead>
              <tr>
                <th className="w-32 text-left text-xs uppercase tracking-widest text-brand-mocha"></th>
                {items.map((p) => (
                  <th key={p.id} className="min-w-[220px] text-left align-top" data-testid={`compare-col-${p.slug}`}>
                    <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-brand-sand">
                      <img src={p.main_image} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <Link to={`/product/${p.slug}`} className="font-display text-base text-brand-walnut hover:text-brand-terracotta">{p.name}</Link>
                      <button onClick={() => toggleCompare(p.id)} className="rounded-full p-1 hover:bg-brand-sand" aria-label="Remove"><X className="h-4 w-4" /></button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="text-sm">
                  <th className="py-3 pr-3 text-left font-medium text-brand-mocha">{row.label}</th>
                  {items.map((p) => (
                    <td key={p.id + row.label} className="py-3 text-brand-walnut">
                      {row.render ? row.render(p[row.key], p) : p[row.key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th></th>
                {items.map((p) => (
                  <td key={"cta-" + p.id} className="py-4">
                    <div className="space-y-2">
                      <Link to={`/product/${p.slug}`} className="btn-primary w-full text-xs !py-2">Enquire</Link>
                      <a href={buildWhatsAppLink(`Hi WODMIN, I'm comparing ${p.name} (${p.sku}). Please share details.`)} target="_blank" rel="noreferrer" className="btn-whatsapp w-full text-xs !py-2"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
                      <a href={CONTACT.phoneLink} className="btn-secondary w-full text-xs !py-2"><Phone className="h-3.5 w-3.5" /> Call</a>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
