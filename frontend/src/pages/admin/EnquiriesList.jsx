import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const STATUSES = ["new", "contacted", "qualified", "closed"];

const TITLES = {
  "enquiries": "Customer Enquiries",
  "wholesale-enquiries": "Wholesale Enquiries",
  "dealer-applications": "Dealer Applications",
  "callback-requests": "Callback Requests",
  "newsletter": "Newsletter Subscribers",
};

const FIELDS = {
  "enquiries": ["name", "phone", "email", "city", "product_name", "source", "message"],
  "wholesale-enquiries": ["name", "phone", "company", "business_type", "city", "estimated_quantity", "message"],
  "dealer-applications": ["name", "phone", "email", "company", "city", "state", "business_years", "monthly_volume", "message"],
  "callback-requests": ["name", "phone", "preferred_time", "topic"],
  "newsletter": ["email", "created_at"],
};

export default function EnquiriesList({ resource }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    const params = {};
    if (filter && resource !== "newsletter") params.status = filter;
    const r = await api.get(`/admin/${resource}`, { params });
    setItems(r.data.items || []);
  }, [resource, filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (it, status) => {
    if (resource === "newsletter") return;
    try {
      await api.patch(`/admin/${resource}/${it.id}/status`, { status });
      toast.success(`Marked as ${status}`);
      load();
    } catch { toast.error("Update failed"); }
  };

  const fields = FIELDS[resource];
  const title = TITLES[resource];

  return (
    <div data-testid={`admin-enquiries-${resource}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Pipeline</span>
          <h1 className="font-display text-3xl text-brand-walnut">{title} <span className="text-brand-mocha text-base">· {items.length}</span></h1>
        </div>
        {resource !== "newsletter" && (
          <div className="flex gap-2 text-xs">
            <button onClick={() => setFilter("")} className={`rounded-full border px-3 py-1.5 ${!filter ? "bg-brand-terracotta border-brand-terracotta text-white" : "border-brand-line bg-white text-brand-walnut"}`}>All</button>
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-3 py-1.5 capitalize ${filter===s ? "bg-brand-terracotta border-brand-terracotta text-white" : "border-brand-line bg-white text-brand-walnut"}`}>{s}</button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-brand-line bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-sand/40 text-left text-xs uppercase tracking-widest text-brand-mocha">
            <tr>
              {fields.slice(0, 4).map((f) => <th key={f} className="px-4 py-3">{f.replace(/_/g, ' ')}</th>)}
              {resource !== "newsletter" && <th className="px-4 py-3">Status</th>}
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {items.map((it) => (
              <tr key={it.id || it.email}>
                {fields.slice(0, 4).map((f) => <td key={f} className="px-4 py-3 text-brand-walnut">{String(it[f] ?? "—").slice(0, 60)}</td>)}
                {resource !== "newsletter" && (
                  <td className="px-4 py-3">
                    <span className={`pill ${it.status === "new" ? "!bg-brand-terracotta/10 !text-brand-terracotta" : ""}`}>{it.status}</span>
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setOpen(it)} className="text-sm text-brand-terracotta hover:underline">View</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td className="px-4 py-8 text-center text-brand-mocha" colSpan={fields.length + 1}>No entries yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4" onClick={() => setOpen(null)}>
          <div className="mx-auto max-h-[90vh] max-w-xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl text-brand-walnut">{open.name || open.email}</h2>
            <p className="mt-1 text-xs text-brand-mocha">Received {new Date(open.created_at || Date.now()).toLocaleString("en-IN")}</p>
            <dl className="mt-5 space-y-2 text-sm">
              {fields.map((f) => (
                <div key={f} className="grid grid-cols-3 gap-2 border-b border-brand-line py-2">
                  <dt className="text-brand-mocha capitalize">{f.replace(/_/g, ' ')}</dt>
                  <dd className="col-span-2 text-brand-walnut break-words">{String(open[f] ?? "—")}</dd>
                </div>
              ))}
            </dl>
            {resource !== "newsletter" && (
              <div className="mt-5 flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button key={s} onClick={() => { updateStatus(open, s); setOpen({ ...open, status: s }); }} className={`rounded-full border px-4 py-2 text-xs capitalize ${open.status===s?"bg-brand-terracotta border-brand-terracotta text-white":"border-brand-line bg-white text-brand-walnut hover:border-brand-terracotta"}`}>Mark {s}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
