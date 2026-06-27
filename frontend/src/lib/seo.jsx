import { Helmet } from "react-helmet-async";

const SITE = "WODMIN";
const DESC = "Affordable, reliable and modern furniture for Indian homes, offices, dealers and wholesalers.";

export default function Seo({
  title,
  description = DESC,
  image,
  url,
  type = "website",
  jsonLd,
}) {
  const fullTitle = title ? `${title} · ${SITE}` : `${SITE} — Modern Furniture for Every Home`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:site_name" content={SITE} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}

export const orgJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": SITE,
  "url": "https://wodmin.in",
  "logo": "https://wodmin.in/logo.png",
  "sameAs": ["https://instagram.com/", "https://facebook.com/"],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-98765-43210",
    "contactType": "customer service",
    "areaServed": "IN",
    "availableLanguage": ["en", "hi"],
  },
});

export const productJsonLd = (p) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": p.name,
  "sku": p.sku,
  "image": p.images || [p.main_image],
  "description": p.short_description,
  "brand": { "@type": "Brand", "name": SITE },
  "category": p.category_name,
  "offers": {
    "@type": "Offer",
    "priceCurrency": "INR",
    "price": p.price,
    "availability": p.stock_status === "In Stock" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
  },
  "aggregateRating": p.rating
    ? { "@type": "AggregateRating", "ratingValue": p.rating, "reviewCount": p.review_count }
    : undefined,
});

export const blogJsonLd = (b) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": b.title,
  "image": b.image,
  "author": { "@type": "Person", "name": b.author },
  "datePublished": b.published_at,
  "publisher": { "@type": "Organization", "name": SITE },
});

export const faqJsonLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": items.map((i) => ({
    "@type": "Question",
    "name": i.question,
    "acceptedAnswer": { "@type": "Answer", "text": i.answer },
  })),
});

export const breadcrumbJsonLd = (crumbs) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": crumbs.map((c, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": c.name,
    "item": c.url,
  })),
});
