import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import ProductGrid from "@/components/product/ProductGrid";

export default function CollectionDetail() {
  const { slug } = useParams();
  const [c, setC] = useState(null);
  useEffect(() => { api.get(`/collections/${slug}`).then((r) => setC(r.data)).catch(() => setC({notFound:true})); }, [slug]);
  if (c?.notFound) return <div className="container-wodmin py-20 text-center">Collection not found. <Link className="text-brand-terracotta" to="/collections">View all →</Link></div>;
  return (
    <div data-testid="collection-detail">
      <section className="bg-white">
        <div className="container-wodmin py-10 lg:py-14">
          <nav className="text-xs text-brand-mocha"><Link to="/" className="hover:text-brand-terracotta">Home</Link> / <Link to="/collections" className="hover:text-brand-terracotta">Collections</Link> / {c?.name || ""}</nav>
          <h1 className="mt-3 font-display text-4xl text-brand-walnut sm:text-5xl">{c?.name}</h1>
          <p className="mt-3 max-w-2xl text-brand-mocha">{c?.description}</p>
        </div>
      </section>
      <ProductGrid fixedCollection={slug} />
    </div>
  );
}
