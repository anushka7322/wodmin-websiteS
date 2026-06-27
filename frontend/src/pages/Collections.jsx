import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

export default function Collections() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/collections").then((r) => setItems(r.data)); }, []);
  return (
    <div className="container-wodmin py-12 lg:py-16" data-testid="collections-page">
      <header className="max-w-3xl">
        <span className="eyebrow">Collections</span>
        <h1 className="mt-2 font-display text-4xl text-brand-walnut sm:text-5xl">Curated for moments and homes.</h1>
        <p className="mt-3 text-brand-mocha">Hand-picked groups for newly-weds, students, budget shoppers, office setups and more.</p>
      </header>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <Link key={c.id} to={`/collection/${c.slug}`} className="group card-soft overflow-hidden" data-testid={`collection-${c.slug}`}>
            <div className="aspect-[4/3] overflow-hidden bg-brand-sand">
              <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl text-brand-walnut group-hover:text-brand-terracotta">{c.name}</h3>
              <p className="mt-1 text-sm text-brand-mocha">{c.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
