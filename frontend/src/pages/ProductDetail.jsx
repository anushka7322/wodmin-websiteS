import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Phone, MessageCircle, Share2, Download, Star, Truck, ShieldCheck, BadgePercent } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { api, formatINR } from "@/lib/api";
import { CONTACT, buildWhatsAppLink } from "@/lib/contact";
import EnquiryForm from "@/components/forms/EnquiryForm";
import ProductCard from "@/components/product/ProductCard";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [colour, setColour] = useState(null);
  const [size, setSize] = useState(null);

  useEffect(() => {
    api.get(`/products/${slug}`)
      .then((r) => { setData(r.data); setImgIdx(0); setColour(r.data.product.colours?.[0] || null); setSize(r.data.product.sizes?.[0] || null); })
      .catch(() => setData({ notFound: true }));
  }, [slug]);

  if (!data) return <div className="container-wodmin py-20 text-center text-brand-mocha">Loading…</div>;
  if (data.notFound) return <div className="container-wodmin py-20 text-center">Product not found. <Link className="text-brand-terracotta" to="/products">Browse products →</Link></div>;

  const p = data.product;
  const images = p.images?.length ? p.images : [p.main_image];

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: p.name, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div data-testid="product-detail">
      <section className="bg-white">
        <div className="container-wodmin py-8">
          <nav className="text-xs text-brand-mocha">
            <Link to="/" className="hover:text-brand-terracotta">Home</Link> / <Link to="/products" className="hover:text-brand-terracotta">Products</Link> / <Link to={`/category/${p.category_slug}`} className="hover:text-brand-terracotta">{p.category_name}</Link> / {p.name}
          </nav>
        </div>
      </section>

      <section className="container-wodmin pb-16">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-brand-line bg-brand-sand">
              <div className="aspect-[4/3]">
                <img src={images[imgIdx]} alt={p.name} className="h-full w-full object-cover" data-testid="product-main-image" />
              </div>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {images.map((u, i) => (
                <button
                  key={u + i}
                  onClick={() => setImgIdx(i)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${i === imgIdx ? "border-brand-terracotta" : "border-transparent hover:border-brand-line"}`}
                  data-testid={`product-thumb-${i}`}
                >
                  <img src={u} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
              <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-xl border border-dashed border-brand-line text-xs text-brand-mocha">
                Video coming soon
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-5">
            <span className="text-xs uppercase tracking-widest text-brand-mocha">{p.category_name}</span>
            <h1 className="mt-2 font-display text-3xl text-brand-walnut sm:text-4xl">{p.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-xs text-brand-mocha">
              <span>SKU: {p.sku}</span> <span>·</span>
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-brand-terracotta text-brand-terracotta" /> {p.rating} ({p.review_count})</span> <span>·</span>
              <span>{p.stock_status}</span>
            </div>

            <div className="mt-5 flex items-end gap-2">
              <span className="font-display text-3xl text-brand-walnut">{formatINR(p.price)}</span>
              {p.mrp > p.price && <span className="text-brand-mocha line-through">{formatINR(p.mrp)}</span>}
              {p.discount_pct > 0 && <span className="rounded-full bg-brand-terracotta/10 px-2 py-1 text-xs font-semibold text-brand-terracotta">{p.discount_pct}% off</span>}
            </div>
            <p className="mt-1 text-xs text-brand-mocha">Indicative price. GST extra. Final quote on enquiry.</p>

            <p className="mt-5 text-brand-mocha leading-relaxed">{p.short_description}</p>

            {p.colours?.length > 0 && (
              <div className="mt-6">
                <div className="eyebrow">Colour</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.colours.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColour(c)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${colour === c ? "border-brand-terracotta bg-brand-terracotta text-white" : "border-brand-line bg-white text-brand-walnut hover:border-brand-terracotta"}`}
                      data-testid={`colour-${c}`}
                    >{c}</button>
                  ))}
                </div>
              </div>
            )}
            {p.sizes?.length > 0 && (
              <div className="mt-4">
                <div className="eyebrow">Size</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${size === s ? "border-brand-terracotta bg-brand-terracotta text-white" : "border-brand-line bg-white text-brand-walnut hover:border-brand-terracotta"}`}
                      data-testid={`size-${s}`}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 grid grid-cols-2 gap-3">
              <a href="#enquiry-block" className="btn-primary" data-testid="pdp-enquire-btn">Get a Quote</a>
              <a href={buildWhatsAppLink(`Hi, I'd like a quote for ${p.name} (${p.sku}), colour: ${colour}, size: ${size}.`)} target="_blank" rel="noreferrer" className="btn-whatsapp" data-testid="pdp-whatsapp-btn">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
              <a href={CONTACT.phoneLink} className="btn-secondary" data-testid="pdp-call-btn"><Phone className="h-4 w-4" /> Call Now</a>
              <button onClick={share} className="btn-secondary" data-testid="pdp-share-btn"><Share2 className="h-4 w-4" /> Share</button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-brand-line bg-white p-4 text-xs text-brand-walnut">
              <div className="flex flex-col items-start gap-1"><Truck className="h-4 w-4 text-brand-terracotta" /> Free delivery</div>
              <div className="flex flex-col items-start gap-1"><ShieldCheck className="h-4 w-4 text-brand-terracotta" /> {p.warranty}</div>
              <div className="flex flex-col items-start gap-1"><BadgePercent className="h-4 w-4 text-brand-terracotta" /> Best price</div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              <button onClick={() => toast.message("Catalogue download coming soon")} className="inline-flex items-center gap-1.5 text-brand-terracotta hover:underline" data-testid="download-catalogue"><Download className="h-4 w-4" /> Download Catalogue</button>
              <span className="text-brand-line">|</span>
              <button onClick={() => toast.message("Spec sheet download coming soon")} className="inline-flex items-center gap-1.5 text-brand-terracotta hover:underline" data-testid="download-spec"><Download className="h-4 w-4" /> Specification Sheet</button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs / Accordions */}
      <section className="container-wodmin pb-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="font-display text-2xl text-brand-walnut">About this piece</h2>
            <p className="mt-3 text-brand-mocha leading-relaxed">{p.description}</p>

            <Accordion type="single" collapsible className="mt-8" defaultValue="specs">
              <AccordionItem value="specs">
                <AccordionTrigger data-testid="acc-specs">Specifications</AccordionTrigger>
                <AccordionContent>
                  <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div><dt className="text-brand-mocha">Dimensions</dt><dd className="text-brand-walnut">{p.dimensions}</dd></div>
                    <div><dt className="text-brand-mocha">Weight</dt><dd className="text-brand-walnut">{p.weight_kg} kg</dd></div>
                    <div><dt className="text-brand-mocha">Materials</dt><dd className="text-brand-walnut">{p.materials?.join(", ")}</dd></div>
                    <div><dt className="text-brand-mocha">Colours</dt><dd className="text-brand-walnut">{p.colours?.join(", ")}</dd></div>
                    <div><dt className="text-brand-mocha">Sizes</dt><dd className="text-brand-walnut">{p.sizes?.join(", ")}</dd></div>
                    <div><dt className="text-brand-mocha">Warranty</dt><dd className="text-brand-walnut">{p.warranty}</dd></div>
                  </dl>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger data-testid="acc-care">Care Instructions</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-brand-walnut">
                    {p.care_instructions?.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="delivery">
                <AccordionTrigger data-testid="acc-delivery">Delivery & Installation</AccordionTrigger>
                <AccordionContent><p className="text-sm text-brand-walnut">{p.delivery_info}</p></AccordionContent>
              </AccordionItem>
              <AccordionItem value="faqs">
                <AccordionTrigger data-testid="acc-faqs">Common questions</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm text-brand-walnut">
                    <div><div className="font-medium">Can I customise this piece?</div><div className="text-brand-mocha">Many sizes and colours are made-to-order. Mention requirements in your enquiry.</div></div>
                    <div><div className="font-medium">Is GST included?</div><div className="text-brand-mocha">Indicative price is exclusive of GST. Final invoice includes GST.</div></div>
                    <div><div className="font-medium">How fast is delivery?</div><div className="text-brand-mocha">7-12 working days in major cities; made-to-order items 3-4 weeks.</div></div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="lg:col-span-5" id="enquiry-block">
            <div className="sticky top-24 card-soft p-6">
              <h3 className="font-display text-2xl text-brand-walnut">Request a quote</h3>
              <p className="mt-1 text-sm text-brand-mocha">Tell us about your needs and we'll respond in 2 working hours.</p>
              <div className="mt-5"><EnquiryForm product={p} source="product" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {data.related?.length > 0 && (
        <section className="container-wodmin pb-20">
          <h2 className="font-display text-2xl text-brand-walnut sm:text-3xl">You might also like</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.related.slice(0, 4).map((rp, i) => <ProductCard key={rp.id} product={rp} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
