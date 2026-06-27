import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

export default function Blogs() {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState(null);
  useEffect(() => { api.get("/blogs", { params: cat ? { category: cat } : {} }).then((r) => setItems(r.data.items)); }, [cat]);
  const cats = ["All", "Buying Guide", "Space Saving", "Furniture Care", "Home Office", "Interior Design", "Latest Trends", "Home Decor", "Wholesale"];
  return (
    <div className="container-wodmin py-12 lg:py-16" data-testid="blogs-page">
      <header className="max-w-3xl">
        <span className="eyebrow">Journal</span>
        <h1 className="mt-2 font-display text-4xl text-brand-walnut sm:text-5xl">Furniture, design & home ideas.</h1>
        <p className="mt-3 text-brand-mocha">Buying guides, care tips and design inspiration from the WODMIN team.</p>
      </header>
      <div className="mt-8 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c==="All"?null:c)} className={`rounded-full border px-4 py-1.5 text-sm transition ${ (cat||"All")===c?"border-brand-terracotta bg-brand-terracotta text-white":"border-brand-line bg-white text-brand-walnut hover:border-brand-terracotta"}`} data-testid={`blog-filter-${c}`}>{c}</button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((b) => (
          <Link key={b.id} to={`/blog/${b.slug}`} className="group card-soft overflow-hidden" data-testid={`blog-card-${b.slug}`}>
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
  );
}
