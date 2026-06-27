import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

// Field schema per resource (rendered in modal)
const SCHEMA = {
  categories: {
    title: "Categories",
    list: ["name", "slug", "description"],
    fields: [
      { key: "name", label: "Name *", required: true },
      { key: "slug", label: "Slug", hint: "Auto-generated if empty" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image URL" },
    ],
  },
  collections: {
    title: "Collections",
    list: ["name", "slug", "description"],
    fields: [
      { key: "name", label: "Name *", required: true },
      { key: "slug", label: "Slug" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image URL" },
    ],
  },
  blogs: {
    title: "Blogs",
    list: ["title", "category", "author"],
    fields: [
      { key: "title", label: "Title *", required: true },
      { key: "slug", label: "Slug" },
      { key: "category", label: "Category *", required: true },
      { key: "author", label: "Author" },
      { key: "excerpt", label: "Excerpt", type: "textarea" },
      { key: "content", label: "Content *", type: "textarea", required: true },
      { key: "image", label: "Cover image URL" },
      { key: "read_minutes", label: "Read minutes", type: "number" },
    ],
  },
  testimonials: {
    title: "Testimonials",
    list: ["name", "city", "rating"],
    fields: [
      { key: "name", label: "Name *", required: true },
      { key: "city", label: "City" },
      { key: "role", label: "Role / Persona" },
      { key: "rating", label: "Rating (1-5)", type: "number" },
      { key: "quote", label: "Quote *", type: "textarea", required: true },
    ],
  },
  faqs: {
    title: "FAQs",
    list: ["question", "category"],
    fields: [
      { key: "question", label: "Question *", required: true },
      { key: "answer", label: "Answer *", type: "textarea", required: true },
      { key: "category", label: "Category" },
      { key: "order", label: "Order", type: "number" },
    ],
  },
  gallery: {
    title: "Gallery",
    list: ["title", "category"],
    fields: [
      { key: "title", label: "Title *", required: true },
      { key: "category", label: "Category" },
      { key: "image", label: "Image URL *", required: true },
    ],
  },
};

export default function ResourceManager({ resource }) {
  const cfg = SCHEMA[resource];
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!cfg) return;
    const r = await api.get(`/admin/${resource}`);
    setItems(Array.isArray(r.data) ? r.data : r.data.items || []);
  }, [resource, cfg]);

  useEffect(() => { load(); }, [load]);

  if (!cfg) return <div>Unknown resource: {resource}</div>;

  const blankForm = () => Object.fromEntries(cfg.fields.map((f) => [f.key, f.type === "number" ? 0 : ""]));
  const openCreate = () => { setForm(blankForm()); setEditing("new"); };
  const openEdit = (item) => { setForm({ ...blankForm(), ...item }); setEditing(item.id); };

  const save = async () => {
    for (const f of cfg.fields) if (f.required && !form[f.key]) { toast.error(`${f.label.replace("*","")} is required`); return; }
    setBusy(true);
    try {
      const payload = { ...form };
      for (const f of cfg.fields) if (f.type === "number") payload[f.key] = Number(payload[f.key] || 0);
      if (editing === "new") await api.post(`/admin/${resource}`, payload);
      else await api.put(`/admin/${resource}/${editing}`, payload);
      toast.success("Saved"); setEditing(null); load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally { setBusy(false); }
  };

  const remove = async (item) => {
    if (!window.confirm("Delete this item?")) return;
    try { await api.delete(`/admin/${resource}/${item.id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div data-testid={`admin-${resource}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Manage</span>
          <h1 className="font-display text-3xl text-brand-walnut">{cfg.title} <span className="text-brand-mocha text-base">· {items.length}</span></h1>
        </div>
        <button onClick={openCreate} className="btn-primary" data-testid={`new-${resource}`}><Plus className="h-4 w-4" /> New</button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-brand-line bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-sand/40 text-left text-xs uppercase tracking-widest text-brand-mocha">
            <tr>{cfg.list.map((k) => <th key={k} className="px-4 py-3">{k}</th>)}<th className="w-24"></th></tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {items.map((it) => (
              <tr key={it.id}>
                {cfg.list.map((k) => <td key={k} className="px-4 py-3 text-brand-walnut">{String(it[k] ?? "—").slice(0, 80)}</td>)}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(it)} className="rounded-full p-2 hover:bg-brand-sand"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(it)} className="rounded-full p-2 hover:bg-brand-sand text-brand-terracotta"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td className="px-4 py-8 text-center text-brand-mocha" colSpan={cfg.list.length + 1}>No items yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="mx-auto max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-brand-walnut">{editing === "new" ? "New" : "Edit"} {cfg.title.toLowerCase().slice(0, -1)}</h2>
              <button onClick={() => setEditing(null)} className="rounded-full p-2 hover:bg-brand-sand"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 space-y-3">
              {cfg.fields.map((f) => (
                <label key={f.key} className="block text-xs">
                  <span className="font-semibold uppercase tracking-widest text-brand-mocha">{f.label}</span>
                  {f.hint && <span className="ml-2 text-brand-mocha normal-case tracking-normal">({f.hint})</span>}
                  <div className="mt-1">
                    {f.type === "textarea" ? (
                      <textarea className="w-full min-h-[120px] rounded-xl border border-brand-line bg-brand-cream px-3 py-2 text-sm" value={form[f.key] || ""} onChange={(e) => setForm({...form, [f.key]: e.target.value})} />
                    ) : (
                      <input type={f.type || "text"} className="w-full rounded-xl border border-brand-line bg-brand-cream px-3 py-2 text-sm" value={form[f.key] ?? ""} onChange={(e) => setForm({...form, [f.key]: e.target.value})} />
                    )}
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
              <button onClick={save} disabled={busy} className="btn-primary">{busy ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
