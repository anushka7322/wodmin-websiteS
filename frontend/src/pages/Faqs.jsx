import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { api } from "@/lib/api";

export default function Faqs() {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState(null);
  useEffect(() => { api.get("/faqs", { params: cat ? { category: cat } : {} }).then((r) => setItems(r.data)); }, [cat]);
  const cats = ["all", "general", "delivery", "warranty", "payments", "wholesale", "customisation", "materials", "products", "orders", "services"];
  return (
    <div className="container-wodmin py-12 lg:py-16" data-testid="faqs-page">
      <header className="max-w-3xl">
        <span className="eyebrow">FAQs</span>
        <h1 className="mt-2 font-display text-4xl text-brand-walnut sm:text-5xl">Frequently asked questions.</h1>
        <p className="mt-3 text-brand-mocha">Everything customers and partners ask us most often.</p>
      </header>
      <div className="mt-8 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c==="all"?null:c)} className={`rounded-full border px-4 py-1.5 text-sm capitalize transition ${(cat||"all")===c?"border-brand-terracotta bg-brand-terracotta text-white":"border-brand-line bg-white text-brand-walnut hover:border-brand-terracotta"}`} data-testid={`faq-filter-${c}`}>{c}</button>
        ))}
      </div>
      <div className="mt-8 max-w-3xl">
        <Accordion type="single" collapsible>
          {items.map((f) => (
            <AccordionItem key={f.id} value={f.id} data-testid={`faq-item-${f.id}`}>
              <AccordionTrigger className="text-left text-base">{f.question}</AccordionTrigger>
              <AccordionContent className="text-brand-mocha">{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
