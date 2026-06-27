import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  useEffect(() => { api.get("/gallery").then((r) => setItems(r.data)); }, []);
  const cats = ["All", ...Array.from(new Set(items.map((i) => i.category)))];
  const visible = filter === "All" ? items : items.filter((i) => i.category === filter);
  return (
    <div className="container-wodmin py-12 lg:py-16" data-testid="gallery-page">
      <header className="max-w-3xl">
        <span className="eyebrow">Gallery</span>
        <h1 className="mt-2 font-display text-4xl text-brand-walnut sm:text-5xl">Real projects, real homes.</h1>
        <p className="mt-3 text-brand-mocha">A peek into the homes, offices and stores we've helped furnish across India.</p>
      </header>
      <div className="mt-8 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`rounded-full border px-4 py-1.5 text-sm transition ${filter===c?"border-brand-terracotta bg-brand-terracotta text-white":"border-brand-line bg-white text-brand-walnut hover:border-brand-terracotta"}`} data-testid={`gallery-filter-${c}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:_balance]">
        {visible.map((g) => (
          <figure key={g.id} className="mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-brand-line bg-white">
            <img src={g.image} alt={g.title} className="w-full object-cover" />
            <figcaption className="p-4">
              <span className="pill">{g.category}</span>
              <div className="mt-2 font-display text-lg text-brand-walnut">{g.title}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
