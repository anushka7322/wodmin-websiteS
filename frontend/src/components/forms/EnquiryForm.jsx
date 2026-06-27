import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const FIELD_BASE = "w-full rounded-xl border border-brand-line bg-brand-cream px-4 py-3 text-sm outline-none transition focus:border-brand-terracotta focus:ring-2 focus:ring-brand-terracotta/30";

export default function EnquiryForm({ product, source = "product", compact = false, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    message: product ? `I'd like a quote for ${product.name} (${product.sku}).` : "",
  });
  const [busy, setBusy] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please add your name and phone");
      return;
    }
    setBusy(true);
    try {
      await api.post("/enquiries", {
        ...form,
        product_id: product?.id,
        product_name: product?.name,
        category_slug: product?.category_slug,
        source,
      });
      toast.success("Thanks! Our consultant will reach out within 2 working hours.");
      setForm({ ...form, name: "", phone: "", email: "", city: "", message: "" });
      onSuccess?.();
    } catch (err) {
      toast.error("Could not submit. Please try WhatsApp or call us.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={compact ? "space-y-3" : "space-y-4"} data-testid="enquiry-form">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className={FIELD_BASE} required placeholder="Full name *" value={form.name} onChange={update("name")} data-testid="enquiry-name" />
        <input className={FIELD_BASE} required placeholder="Phone *" value={form.phone} onChange={update("phone")} data-testid="enquiry-phone" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className={FIELD_BASE} type="email" placeholder="Email" value={form.email} onChange={update("email")} data-testid="enquiry-email" />
        <input className={FIELD_BASE} placeholder="City" value={form.city} onChange={update("city")} data-testid="enquiry-city" />
      </div>
      <textarea
        className={`${FIELD_BASE} min-h-[110px] resize-y`}
        placeholder="Tell us a bit about what you're looking for…"
        value={form.message}
        onChange={update("message")}
        data-testid="enquiry-message"
      />
      <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto" data-testid="enquiry-submit">
        {busy ? "Sending…" : "Send Enquiry"}
      </button>
      <p className="text-xs text-brand-mocha">We respect your privacy. No spam, ever.</p>
    </form>
  );
}
