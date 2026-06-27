import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useStorage } from "@/lib/storageContext";
import ProductCard from "@/components/product/ProductCard";
import Seo from "@/lib/seo";

export default function Wishlist() {
  const { wishlist, clearWishlist } = useStorage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wishlist.length) { setItems([]); setLoading(false); return; }
    setLoading(true);
    api.get("/products/by-ids", { params: { ids: wishlist.join(",") } })
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, [wishlist]);

  return (
    <div className="container-wodmin py-12 lg:py-16" data-testid="wishlist-page">
      <Seo title="Wishlist" />
      <header className="flex items-end justify-between">
        <div>
          <span className="eyebrow">Your Wishlist</span>
          <h1 className="mt-2 font-display text-4xl text-brand-walnut sm:text-5xl">Saved for later.</h1>
        </div>
        {wishlist.length > 0 && (
          <button onClick={clearWishlist} className="btn-secondary text-sm" data-testid="wishlist-clear"><Trash2 className="h-4 w-4" /> Clear all</button>
        )}
      </header>
      {loading ? (
        <div className="mt-10 text-center text-brand-mocha">Loading…</div>
      ) : items.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-brand-line bg-white p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-brand-terracotta" />
          <p className="mt-4 font-display text-2xl text-brand-walnut">Your wishlist is empty</p>
          <p className="mt-2 text-sm text-brand-mocha">Tap the heart icon on any product to save it for later.</p>
          <Link to="/products" className="btn-primary mt-6">Browse products</Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
