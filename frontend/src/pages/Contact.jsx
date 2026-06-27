import { useState } from "react";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { CONTACT, STORES, buildWhatsAppLink } from "@/lib/contact";
import { api } from "@/lib/api";

const FIELD = "w-full rounded-xl border border-brand-line bg-brand-cream px-4 py-3 text-sm outline-none transition focus:border-brand-terracotta focus:ring-2 focus:ring-brand-terracotta/30";

export default function Contact() {
  const [f, setF] = useState({ name:"", phone:"", email:"", city:"", message:"" });
  const [busy, setBusy] = useState(false);
  const [cbF, setCbF] = useState({ name:"", phone:"", preferred_time:"", topic:"" });
  const [cbBusy, setCbBusy] = useState(false);

  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const cbUp = (k) => (e) => setCbF({ ...cbF, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name || !f.phone) { toast.error("Please add your name and phone"); return; }
    setBusy(true);
    try { await api.post("/enquiries", { ...f, source: "contact-page" }); toast.success("Thanks! We'll get back within 2 working hours."); setF({ name:"", phone:"", email:"", city:"", message:"" }); }
    catch { toast.error("Could not submit. Please try WhatsApp or call."); }
    finally { setBusy(false); }
  };

  const cbSubmit = async (e) => {
    e.preventDefault();
    if (!cbF.name || !cbF.phone) { toast.error("Please add your name and phone"); return; }
    setCbBusy(true);
    try { await api.post("/callback-requests", cbF); toast.success("Callback requested. We'll call you back shortly."); setCbF({ name:"", phone:"", preferred_time:"", topic:"" }); }
    catch { toast.error("Could not submit. Please try again."); }
    finally { setCbBusy(false); }
  };

  return (
    <div data-testid="contact-page">
      <section className="container-wodmin py-14">
        <header className="max-w-3xl">
          <span className="eyebrow">Contact</span>
          <h1 className="mt-2 font-display text-4xl text-brand-walnut sm:text-5xl">We're a WhatsApp message away.</h1>
          <p className="mt-3 text-brand-mocha">Send us a message, request a callback or drop by one of our experience stores.</p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <form onSubmit={submit} className="card-soft p-6 sm:p-8" data-testid="contact-form">
              <h2 className="font-display text-2xl text-brand-walnut">Send us a message</h2>
              <div className="mt-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={FIELD} required placeholder="Name *" value={f.name} onChange={up("name")} data-testid="contact-name" />
                  <input className={FIELD} required placeholder="Phone *" value={f.phone} onChange={up("phone")} data-testid="contact-phone" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={FIELD} type="email" placeholder="Email" value={f.email} onChange={up("email")} data-testid="contact-email" />
                  <input className={FIELD} placeholder="City" value={f.city} onChange={up("city")} data-testid="contact-city" />
                </div>
                <textarea className={`${FIELD} min-h-[120px]`} placeholder="How can we help?" value={f.message} onChange={up("message")} data-testid="contact-message" />
                <button type="submit" disabled={busy} className="btn-primary" data-testid="contact-submit">{busy ? "Sending…" : "Send Message"}</button>
              </div>
            </form>

            <form onSubmit={cbSubmit} className="card-soft mt-6 p-6 sm:p-8" data-testid="callback-form">
              <h2 className="font-display text-2xl text-brand-walnut">Request a callback</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input className={FIELD} required placeholder="Name *" value={cbF.name} onChange={cbUp("name")} data-testid="cb-name" />
                <input className={FIELD} required placeholder="Phone *" value={cbF.phone} onChange={cbUp("phone")} data-testid="cb-phone" />
                <input className={FIELD} placeholder="Preferred time (e.g., today 5pm)" value={cbF.preferred_time} onChange={cbUp("preferred_time")} data-testid="cb-time" />
                <input className={FIELD} placeholder="What do you want to discuss?" value={cbF.topic} onChange={cbUp("topic")} data-testid="cb-topic" />
              </div>
              <button type="submit" disabled={cbBusy} className="btn-secondary mt-4" data-testid="cb-submit">{cbBusy?"Requesting…":"Request Callback"}</button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="card-soft p-6">
              <h3 className="font-display text-xl text-brand-walnut">Get in touch</h3>
              <ul className="mt-4 space-y-3 text-sm text-brand-walnut">
                <li className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 text-brand-terracotta" /><a href={CONTACT.phoneLink}>{CONTACT.phone}</a></li>
                <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-brand-terracotta" /><a href={CONTACT.emailLink}>{CONTACT.email}</a></li>
                <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-brand-terracotta" />{CONTACT.address}</li>
                <li className="flex items-start gap-3"><Clock className="mt-0.5 h-4 w-4 text-brand-terracotta" />{CONTACT.hours}</li>
              </ul>
              <a href={buildWhatsAppLink()} target="_blank" rel="noreferrer" className="btn-whatsapp mt-5 w-full" data-testid="contact-whatsapp"><MessageCircle className="h-4 w-4" /> WhatsApp Us</a>
            </div>

            <div className="overflow-hidden rounded-3xl border border-brand-line">
              <iframe
                title="WODMIN store map"
                src={CONTACT.mapUrl}
                className="h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-wodmin">
          <span className="eyebrow">Stores</span>
          <h2 className="mt-2 font-display text-3xl text-brand-walnut sm:text-4xl">Visit a WODMIN experience store.</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STORES.map((s) => (
              <div key={s.city} className="card-soft p-5" data-testid={`store-${s.city.toLowerCase()}`}>
                <div className="font-display text-lg text-brand-walnut">{s.city}</div>
                <p className="mt-1 text-sm text-brand-mocha">{s.address}</p>
                <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-terracotta hover:underline">
                  <Phone className="h-4 w-4" /> {s.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
