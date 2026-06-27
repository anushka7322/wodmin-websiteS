import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import ProductGrid from "@/components/product/ProductGrid";

// Slugs that aren't direct category mappings — they filter by product flags.
const VIRTUAL_CATEGORY_FILTERS = {
  "new-arrivals": { is_new_arrival: true },
  "budget-collection": { is_budget: true },
  "value-collection": { is_budget: true },
  "premium-essentials": { is_best_seller: true },
};

export default function CategoryDetail() {
  const { slug } = useParams();
  const [cat, setCat] = useState(null);
  useEffect(() => { api.get(`/categories/${slug}`).then((r) => setCat(r.data)).catch(() => setCat({notFound:true})); }, [slug]);

  if (cat?.notFound) return <div className="container-wodmin py-20 text-center">Category not found. <Link className="text-brand-terracotta" to="/categories">View all →</Link></div>;

  const virtual = VIRTUAL_CATEGORY_FILTERS[slug];

  return (
    <div data-testid="category-detail">
      <section className="bg-white">
        <div className="container-wodmin py-10 lg:py-14">
          <nav className="text-xs text-brand-mocha"><Link to="/" className="hover:text-brand-terracotta">Home</Link> / <Link to="/categories" className="hover:text-brand-terracotta">Categories</Link> / {cat?.name || ""}</nav>
          <div className="mt-3 grid items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="font-display text-4xl text-brand-walnut sm:text-5xl">{cat?.name}</h1>
              <p className="mt-3 max-w-2xl text-brand-mocha">{cat?.description}</p>
            </div>
            {cat?.image && (
              <div className="lg:col-span-5">
                <div className="aspect-[16/9] overflow-hidden rounded-3xl bg-brand-sand">
                  <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      {virtual ? (
        <ProductGrid fixedFilters={virtual} />
      ) : (
        <ProductGrid fixedCategory={slug} />
      )}
    </div>
  );
}
