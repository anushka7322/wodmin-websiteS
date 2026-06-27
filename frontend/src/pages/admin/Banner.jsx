import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const inputCls = "w-full rounded-xl border border-brand-line bg-brand-cream px-3 py-2 text-sm outline-none focus:border-brand-terracotta focus:ring-2 focus:ring-brand-terracotta/30";

export default function Banner() {
  const [b, setB] = useState({ title: "", subtitle: "", cta_label: "", cta_link: "/categories", active: true });
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/banner").then((r) => setB((prev) => ({ ...prev, ...r.data }))); }, []);

  const save = async () => {
    setBusy(true);
    try { await api.put("/admin/banner", b); toast.success("Banner updated"); }
    catch { toast.error("Save failed"); }
    finally { setBusy(false); }
  };

  return (
    <div data-testid="admin-banner">
      <span className="eyebrow">Settings</span>
      <h1 className="font-display text-3xl text-brand-walnut">Homepage Banner</h1>
      <p className="mt-1 text-sm text-brand-mocha">Currently only the headline & CTA are wired to a settings store. The hero image stays as configured in design.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-xs"><span className="font-semibold uppercase tracking-widest text-brand-mocha">Title</span><input className={`${inputCls} mt-1`} value={b.title || ""} onChange={(e) => setB({...b, title: e.target.value})} /></label>
        <label className="block text-xs"><span className="font-semibold uppercase tracking-widest text-brand-mocha">Subtitle</span><input className={`${inputCls} mt-1`} value={b.subtitle || ""} onChange={(e) => setB({...b, subtitle: e.target.value})} /></label>
        <label className="block text-xs"><span className="font-semibold uppercase tracking-widest text-brand-mocha">CTA Label</span><input className={`${inputCls} mt-1`} value={b.cta_label || ""} onChange={(e) => setB({...b, cta_label: e.target.value})} /></label>
        <label className="block text-xs"><span className="font-semibold uppercase tracking-widest text-brand-mocha">CTA Link</span><input className={`${inputCls} mt-1`} value={b.cta_link || ""} onChange={(e) => setB({...b, cta_link: e.target.value})} /></label>
        <label className="block text-xs"><span className="font-semibold uppercase tracking-widest text-brand-mocha">Active</span>
          <select className={`${inputCls} mt-1`} value={String(b.active)} onChange={(e) => setB({...b, active: e.target.value === "true"})}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
      </div>

      <button onClick={save} disabled={busy} className="btn-primary mt-6">{busy ? "Saving…" : "Save banner"}</button>

      <div className="mt-8 card-soft p-6">
        <span className="eyebrow">Live preview</span>
        <h2 className="mt-2 font-display text-3xl text-brand-walnut">{b.title || "—"}</h2>
        <p className="mt-1 text-brand-mocha">{b.subtitle || "—"}</p>
        <a href={b.cta_link || "#"} className="btn-primary mt-4">{b.cta_label || "—"}</a>
      </div>
    </div>
  );
}
