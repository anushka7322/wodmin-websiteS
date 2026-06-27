import { useState } from "react";
import { toast } from "sonner";
import { TrendingUp, MapPin, Users, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

const FIELD = "w-full rounded-xl border border-brand-line bg-brand-cream px-4 py-3 text-sm outline-none transition focus:border-brand-terracotta focus:ring-2 focus:ring-brand-terracotta/30";

export default function Dealer() {
  const [f, setF] = useState({ name:"", phone:"", email:"", company:"", city:"", state:"", business_years:"", monthly_volume:"", message:"" });
  const [busy, setBusy] = useState(false);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (!f.name || !f.phone || !f.email || !f.company || !f.city || !f.state) { toast.error("Please fill all required fields"); return; }
    setBusy(true);
    try {
      const payload = { ...f, business_years: f.business_years ? Number(f.business_years) : null };
      await api.post("/dealer-applications", payload);
      toast.success("Application submitted. Our partnerships team will reach out within 48 hours.");
      setF({ name:"", phone:"", email:"", company:"", city:"", state:"", business_years:"", monthly_volume:"", message:"" });
    } catch { toast.error("Could not submit. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <div data-testid="dealer-page">
      <section className="container-wodmin py-14">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <span className="pill-accent">Dealer Program</span>
            <h1 className="mt-4 font-display text-4xl text-brand-walnut sm:text-5xl">Partner with WODMIN. Grow with India's most loved affordable furniture brand.</h1>
            <p className="mt-4 text-brand-mocha leading-relaxed">
              Whether you run a furniture showroom, an interior firm or an online store — apply to become an authorised WODMIN dealer.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="card-soft p-4"><TrendingUp className="h-5 w-5 text-brand-terracotta" /><div className="mt-2 text-sm font-semibold text-brand-walnut">Healthy margins</div><div className="text-xs text-brand-mocha">Transparent dealer pricing with seasonal incentives.</div></div>
              <div className="card-soft p-4"><MapPin className="h-5 w-5 text-brand-terracotta" /><div className="mt-2 text-sm font-semibold text-brand-walnut">Exclusive territories</div><div className="text-xs text-brand-mocha">Protected regions for committed partners.</div></div>
              <div className="card-soft p-4"><Users className="h-5 w-5 text-brand-terracotta" /><div className="mt-2 text-sm font-semibold text-brand-walnut">Training & support</div><div className="text-xs text-brand-mocha">Onboarding, product training, marketing collateral.</div></div>
              <div className="card-soft p-4"><ShieldCheck className="h-5 w-5 text-brand-terracotta" /><div className="mt-2 text-sm font-semibold text-brand-walnut">After-sales backup</div><div className="text-xs text-brand-mocha">Warranty fulfilment handled centrally.</div></div>
            </div>
          </div>
          <div className="lg:col-span-6">
            <form onSubmit={submit} className="card-soft p-6 sm:p-8" data-testid="dealer-form">
              <h2 className="font-display text-2xl text-brand-walnut">Dealer application</h2>
              <p className="mt-1 text-sm text-brand-mocha">Most applications are reviewed within 48 hours.</p>
              <div className="mt-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={FIELD} required placeholder="Full name *" value={f.name} onChange={up("name")} data-testid="dl-name" />
                  <input className={FIELD} required placeholder="Phone *" value={f.phone} onChange={up("phone")} data-testid="dl-phone" />
                </div>
                <input className={FIELD} required type="email" placeholder="Email *" value={f.email} onChange={up("email")} data-testid="dl-email" />
                <input className={FIELD} required placeholder="Company / Store name *" value={f.company} onChange={up("company")} data-testid="dl-company" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={FIELD} required placeholder="City *" value={f.city} onChange={up("city")} data-testid="dl-city" />
                  <input className={FIELD} required placeholder="State *" value={f.state} onChange={up("state")} data-testid="dl-state" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={FIELD} type="number" placeholder="Years in business" value={f.business_years} onChange={up("business_years")} data-testid="dl-years" />
                  <input className={FIELD} placeholder="Monthly furniture volume" value={f.monthly_volume} onChange={up("monthly_volume")} data-testid="dl-vol" />
                </div>
                <textarea className={`${FIELD} min-h-[110px]`} placeholder="Anything else we should know?" value={f.message} onChange={up("message")} data-testid="dl-msg" />
                <button type="submit" disabled={busy} className="btn-primary mt-2" data-testid="dl-submit">{busy ? "Submitting…" : "Submit application"}</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
