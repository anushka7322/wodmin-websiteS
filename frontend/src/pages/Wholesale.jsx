import { useState } from "react";
import { toast } from "sonner";
import { Building2, Hotel, GraduationCap, UtensilsCrossed, Briefcase, Truck, Tag, Headset } from "lucide-react";
import { api } from "@/lib/api";

const FIELD = "w-full rounded-xl border border-brand-line bg-brand-cream px-4 py-3 text-sm outline-none transition focus:border-brand-terracotta focus:ring-2 focus:ring-brand-terracotta/30";

const TYPES = [
  { v: "builder", l: "Builder / Developer", icon: Building2 },
  { v: "hotel", l: "Hotel / Resort", icon: Hotel },
  { v: "school", l: "School / Institution", icon: GraduationCap },
  { v: "restaurant", l: "Restaurant / Cafe", icon: UtensilsCrossed },
  { v: "corporate", l: "Corporate office", icon: Briefcase },
  { v: "other", l: "Other", icon: Tag },
];

const PERKS = [
  { icon: Tag, t: "Up to 30% off list", d: "Volume-based pricing tailored to your project size." },
  { icon: Truck, t: "Pan-India delivery", d: "Scheduled, palletised shipments to your site." },
  { icon: Headset, t: "Dedicated account manager", d: "One point of contact from enquiry to installation." },
  { icon: Building2, t: "Custom finishes", d: "Mix and match wood tones, fabrics and dimensions." },
];

export default function Wholesale() {
  const [f, setF] = useState({ name:"", phone:"", email:"", company:"", business_type:"builder", city:"", estimated_quantity:"", message:"" });
  const [busy, setBusy] = useState(false);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name || !f.phone || !f.company || !f.city) { toast.error("Please fill the required fields"); return; }
    setBusy(true);
    try {
      await api.post("/wholesale-enquiries", f);
      toast.success("Thanks — our wholesale team will reach out within 24 hours.");
      setF({ name:"", phone:"", email:"", company:"", business_type:"builder", city:"", estimated_quantity:"", message:"" });
    } catch { toast.error("Could not submit. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <div data-testid="wholesale-page">
      <section className="container-wodmin py-14">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <span className="pill-accent">Wholesale & Projects</span>
            <h1 className="mt-4 font-display text-4xl text-brand-walnut sm:text-5xl">Furnishing a hotel, office or housing project?</h1>
            <p className="mt-4 text-brand-mocha text-base sm:text-lg leading-relaxed">
              WODMIN partners with builders, hospitality brands, corporates and institutions across India.
              Tell us about your requirement and we'll put together a tailored quote.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {PERKS.map((p) => (
                <div key={p.t} className="rounded-2xl border border-brand-line bg-white p-4">
                  <p.icon className="h-5 w-5 text-brand-terracotta" />
                  <div className="mt-2 text-sm font-semibold text-brand-walnut">{p.t}</div>
                  <div className="text-xs text-brand-mocha">{p.d}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6">
            <form onSubmit={submit} className="card-soft p-6 sm:p-8" data-testid="wholesale-form">
              <h2 className="font-display text-2xl text-brand-walnut">Bulk enquiry form</h2>
              <p className="mt-1 text-sm text-brand-mocha">All fields marked * are required.</p>

              <div className="mt-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={FIELD} required placeholder="Name *" value={f.name} onChange={up("name")} data-testid="ws-name" />
                  <input className={FIELD} required placeholder="Phone *" value={f.phone} onChange={up("phone")} data-testid="ws-phone" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={FIELD} type="email" placeholder="Email" value={f.email} onChange={up("email")} data-testid="ws-email" />
                  <input className={FIELD} required placeholder="Company / Organisation *" value={f.company} onChange={up("company")} data-testid="ws-company" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select className={FIELD} value={f.business_type} onChange={up("business_type")} data-testid="ws-type">
                    {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                  </select>
                  <input className={FIELD} required placeholder="City *" value={f.city} onChange={up("city")} data-testid="ws-city" />
                </div>
                <input className={FIELD} placeholder="Estimated quantity / order value" value={f.estimated_quantity} onChange={up("estimated_quantity")} data-testid="ws-qty" />
                <textarea className={`${FIELD} min-h-[110px]`} placeholder="Tell us about your project, timeline and product preferences…" value={f.message} onChange={up("message")} data-testid="ws-msg" />
              </div>
              <button type="submit" disabled={busy} className="btn-primary mt-5" data-testid="ws-submit">{busy ? "Submitting…" : "Submit wholesale enquiry"}</button>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-wodmin">
          <span className="eyebrow">We work with</span>
          <h2 className="mt-2 font-display text-3xl text-brand-walnut sm:text-4xl">Projects we love.</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {TYPES.map((t) => (
              <div key={t.v} className="card-soft flex flex-col items-center justify-center gap-2 p-6 text-center">
                <t.icon className="h-6 w-6 text-brand-terracotta" />
                <div className="text-sm font-medium text-brand-walnut">{t.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
