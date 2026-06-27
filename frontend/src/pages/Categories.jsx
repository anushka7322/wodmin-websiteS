import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function Categories() {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data));
  }, []);

  return (
    <div className="container-wodmin py-12 lg:py-16" data-testid="categories-page">
      <header className="max-w-3xl">
        <span className="eyebrow">Categories</span>
        <h1 className="mt-2 font-display text-4xl text-brand-walnut sm:text-5xl">Browse 25 furniture categories.</h1>
        <p className="mt-3 text-brand-mocha">From living and bedroom, to office, kids, dining and decor — find the right piece for every corner of your home.</p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cats.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: Math.min(i, 10) * 0.04 }}
          >
            <Link to={`/category/${c.slug}`} className="group block" data-testid={`category-link-${c.slug}`}>
              <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-brand-sand">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="mt-3 px-1">
                <h3 className="font-display text-lg text-brand-walnut group-hover:text-brand-terracotta">{c.name}</h3>
                <p className="line-clamp-2 text-sm text-brand-mocha">{c.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
