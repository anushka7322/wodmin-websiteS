import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api, formatINR } from "@/lib/api";

const EMPTY = {
  name: "", slug: "", sku: "", category_slug: "", price: 0, mrp: 0,
  short_description: "", description: "",
  materials: [], colours: [], sizes: [],
  dimensions: "", weight_kg: 0, warranty: "1 year warranty",
  care_instructions: [], delivery_info: "",
  images: [], main_image: "",
  is_best_seller: false, is_new_arrival: false, is_budget: false,
  collection_slugs: [], stock_status: "In Stock",
};

const splitList = (v) => v.split(",").map((s) => s.trim()).filter(Boolean);

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [categories, setCategories] = useState([]);

  const load = useCallback(async () => {
    const params = { limit: 60 };
    if (q) params.q = q;
    const r = await api.get("/products", { params });
    setItems(r.data.items); setTotal(r.data.total);
  }, [q]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.get("/categories").then((r) => setCategories(r.data)); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing("new"); };
  const openEdit = (p) => {
    setForm({
      ...EMPTY, ...p,
      materials: p.materials || [], colours: p.colours || [], sizes: p.sizes || [],
      images: p.images || [], care_instructions: p.care_instructions || [],
      collection_slugs: p.collection_slugs || [],
    });
    setEditing(p.id);
  };

  const save = async () => {
    if (!form.name || !form.category_slug || !form.price) { toast.error("Name, category and price are required"); return; }
    setBusy(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price), mrp: Number(form.mrp || 0), weight_kg: Number(form.weight_kg || 0),
      };
      if (editing === "new") await api.post("/admin/products", payload);
      else await api.put(`/admin/products/${editing}`, payload);
      toast.success("Saved");
      setEditing(null); load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally { setBusy(false); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    try { await api.delete(`/admin/products/${p.id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div data-testid="admin-products">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Catalogue</span>
          <h1 className="font-display text-3xl text-brand-walnut">Products <span className="text-brand-mocha text-base">· {total}</span></h1>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-mocha" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="rounded-full border border-brand-line bg-white pl-9 pr-4 py-2 text-sm" data-testid="admin-products-search" />
          </div>
          <button onClick={openCreate} className="btn-primary" data-testid="admin-products-new"><Plus className="h-4 w-4" /> New product</button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-brand-line bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-sand/40 text-left text-xs uppercase tracking-widest text-brand-mocha">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {items.map((p) => (
              <tr key={p.id} data-testid={`admin-product-${p.slug}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.main_image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div>
                      <div className="font-medium text-brand-walnut">{p.name}</div>
                      <div className="text-xs text-brand-mocha">{p.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-walnut">{p.category_name}</td>
                <td className="px-4 py-3 text-brand-walnut">{formatINR(p.price)}</td>
                <td className="px-4 py-3 text-brand-mocha">{p.stock_status}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="rounded-full p-2 hover:bg-brand-sand" data-testid={`edit-${p.slug}`}><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(p)} className="rounded-full p-2 hover:bg-brand-sand text-brand-terracotta" data-testid={`delete-${p.slug}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4" onClick={() => setEditing(null)} data-testid="product-modal">
          <div className="mx-auto max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-brand-walnut">{editing === "new" ? "New product" : "Edit product"}</h2>
              <button onClick={() => setEditing(null)} className="rounded-full p-2 hover:bg-brand-sand"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="Name *"><input className={inputCls} value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} data-testid="pf-name" /></Field>
              <Field label="SKU"><input className={inputCls} value={form.sku || ""} onChange={(e) => setForm({...form, sku: e.target.value})} /></Field>
              <Field label="Category *">
                <select className={inputCls} value={form.category_slug} onChange={(e) => setForm({...form, category_slug: e.target.value})} data-testid="pf-category">
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Stock"><select className={inputCls} value={form.stock_status} onChange={(e) => setForm({...form, stock_status: e.target.value})}><option>In Stock</option><option>Made to Order</option><option>Out of Stock</option></select></Field>
              <Field label="Price ₹ *"><input type="number" className={inputCls} value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} data-testid="pf-price" /></Field>
              <Field label="MRP ₹"><input type="number" className={inputCls} value={form.mrp} onChange={(e) => setForm({...form, mrp: e.target.value})} /></Field>
              <Field label="Dimensions"><input className={inputCls} value={form.dimensions} onChange={(e) => setForm({...form, dimensions: e.target.value})} /></Field>
              <Field label="Weight (kg)"><input type="number" className={inputCls} value={form.weight_kg} onChange={(e) => setForm({...form, weight_kg: e.target.value})} /></Field>
              <Field label="Warranty"><input className={inputCls} value={form.warranty} onChange={(e) => setForm({...form, warranty: e.target.value})} /></Field>
              <Field label="Main image URL"><input className={inputCls} value={form.main_image || ""} onChange={(e) => setForm({...form, main_image: e.target.value})} /></Field>
              <Field label="Gallery images (comma-separated URLs)" full><input className={inputCls} value={(form.images || []).join(", ")} onChange={(e) => setForm({...form, images: splitList(e.target.value)})} /></Field>
              <Field label="Materials (comma-separated)" full><input className={inputCls} value={(form.materials || []).join(", ")} onChange={(e) => setForm({...form, materials: splitList(e.target.value)})} /></Field>
              <Field label="Colours (comma-separated)" full><input className={inputCls} value={(form.colours || []).join(", ")} onChange={(e) => setForm({...form, colours: splitList(e.target.value)})} /></Field>
              <Field label="Sizes (comma-separated)" full><input className={inputCls} value={(form.sizes || []).join(", ")} onChange={(e) => setForm({...form, sizes: splitList(e.target.value)})} /></Field>
              <Field label="Short description" full><input className={inputCls} value={form.short_description} onChange={(e) => setForm({...form, short_description: e.target.value})} /></Field>
              <Field label="Description" full><textarea className={`${inputCls} min-h-[100px]`} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></Field>
              <div className="sm:col-span-2 flex flex-wrap gap-4 text-sm">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.is_best_seller} onChange={(e) => setForm({...form, is_best_seller: e.target.checked})} /> Best Seller</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.is_new_arrival} onChange={(e) => setForm({...form, is_new_arrival: e.target.checked})} /> New Arrival</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.is_budget} onChange={(e) => setForm({...form, is_budget: e.target.checked})} /> Budget Pick</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
              <button onClick={save} disabled={busy} className="btn-primary" data-testid="pf-save">{busy ? "Saving…" : "Save product"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-brand-line bg-brand-cream px-3 py-2 text-sm outline-none focus:border-brand-terracotta focus:ring-2 focus:ring-brand-terracotta/30";

function Field({ label, full, children }) {
  return (
    <label className={`${full ? "sm:col-span-2" : ""} text-xs`}>
      <span className="font-semibold uppercase tracking-widest text-brand-mocha">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
