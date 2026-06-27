import { Link } from "react-router-dom";
import { Phone, MessageCircle, ArrowUpRight, Heart, GitCompare } from "lucide-react";
import { formatINR } from "@/lib/api";
import { buildWhatsAppLink, CONTACT } from "@/lib/contact";
import { useStorage } from "@/lib/storageContext";
import { motion } from "framer-motion";

export default function ProductCard({ product, index = 0 }) {
  const { isWishlisted, isCompared, toggleWishlist, toggleCompare } = useStorage() || {};
  if (!product) return null;
  const wished = isWishlisted?.(product.id);
  const compared = isCompared?.(product.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.45, ease: "easeOut" }}
      data-testid={`product-card-${product.slug}`}
      className="group flex flex-col rounded-3xl border border-brand-line bg-white p-3 sm:p-4 transition-all hover:border-brand-terracotta hover:shadow-md"
    >
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden rounded-2xl bg-brand-sand">
        <div className="aspect-[4/5]">
          <img
            src={product.main_image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.is_new_arrival && <span className="pill-accent">New</span>}
          {product.is_best_seller && <span className="pill">Best Seller</span>}
          {product.is_budget && <span className="rounded-full bg-brand-sage/15 px-3 py-1 text-xs font-medium text-brand-olive">Budget Pick</span>}
        </div>
      </Link>
      <div className="absolute right-5 top-5 flex flex-col gap-2">
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist?.(product.id); }}
          aria-label="Toggle wishlist"
          data-testid={`wishlist-${product.slug}`}
          className={`rounded-full p-2 shadow-sm transition ${wished ? "bg-brand-terracotta text-white" : "bg-white/95 text-brand-walnut hover:text-brand-terracotta"}`}
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); toggleCompare?.(product.id); }}
          aria-label="Toggle compare"
          data-testid={`compare-${product.slug}`}
          className={`rounded-full p-2 shadow-sm transition ${compared ? "bg-brand-walnut text-white" : "bg-white/95 text-brand-walnut hover:text-brand-terracotta"}`}
        >
          <GitCompare className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex-1 px-1">
        <span className="text-[11px] font-medium uppercase tracking-widest text-brand-mocha">{product.category_name}</span>
        <Link to={`/product/${product.slug}`} className="mt-1 block">
          <h3 className="font-display text-lg font-medium text-brand-walnut line-clamp-2 group-hover:text-brand-terracotta">{product.name}</h3>
        </Link>
        <p className="mt-1 text-xs text-brand-mocha">{product.materials?.slice(0, 2).join(" · ")} • {product.dimensions}</p>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-semibold text-brand-walnut" data-testid={`product-price-${product.slug}`}>{formatINR(product.price)}</span>
          {product.mrp > product.price && (
            <>
              <span className="text-sm text-brand-mocha line-through">{formatINR(product.mrp)}</span>
              <span className="text-xs font-semibold text-brand-terracotta">{product.discount_pct}% off</span>
            </>
          )}
        </div>
        <p className="mt-1 text-[11px] text-brand-mocha">Price excludes GST · Enquire for final quote</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 px-1 pb-1">
        <Link to={`/product/${product.slug}`} className="btn-primary !py-2.5 !px-3 text-xs" data-testid={`enquire-${product.slug}`}>
          Enquire Now
        </Link>
        <a
          href={buildWhatsAppLink(`Hi WODMIN! I'm interested in ${product.name} (${product.sku}). Please share details.`)}
          target="_blank"
          rel="noreferrer"
          className="btn-whatsapp !py-2.5 !px-3 text-xs"
          data-testid={`whatsapp-${product.slug}`}
        >
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
        <a href={CONTACT.phoneLink} className="col-span-2 inline-flex items-center justify-center gap-1.5 text-xs text-brand-mocha hover:text-brand-terracotta">
          <Phone className="h-3.5 w-3.5" /> Or call {CONTACT.phone}
        </a>
      </div>
    </motion.div>
  );
}
