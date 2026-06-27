import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, FolderTree, Mail, Building2, Users, FileText, Star, Newspaper, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

const CARDS = [
  { key: "products", label: "Products", icon: Package, to: "/admin/products" },
  { key: "categories", label: "Categories", icon: FolderTree, to: "/admin/categories" },
  { key: "enquiries", label: "Total enquiries", icon: Mail, to: "/admin/enquiries" },
  { key: "wholesale_enquiries", label: "Wholesale", icon: Building2, to: "/admin/wholesale" },
  { key: "dealer_applications", label: "Dealer apps", icon: Users, to: "/admin/dealers" },
  { key: "blogs", label: "Blogs", icon: FileText, to: "/admin/blogs" },
  { key: "testimonials", label: "Testimonials", icon: Star, to: "/admin/testimonials" },
  { key: "newsletter", label: "Newsletter", icon: Newspaper, to: "/admin/newsletter" },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/admin/analytics").then((r) => setData(r.data)); }, []);

  return (
    <div data-testid="admin-dashboard">
      <div className="flex items-end justify-between">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1 className="font-display text-3xl text-brand-walnut sm:text-4xl">Welcome back.</h1>
          <p className="mt-1 text-sm text-brand-mocha">Snapshot of your catalogue and customer pipeline.</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CARDS.map((c) => (
          <Link key={c.key} to={c.to} className="card-soft p-5 hover:border-brand-terracotta" data-testid={`stat-${c.key}`}>
            <div className="flex items-center justify-between">
              <c.icon className="h-5 w-5 text-brand-terracotta" />
              <ArrowRight className="h-4 w-4 text-brand-mocha" />
            </div>
            <div className="mt-4 font-display text-3xl text-brand-walnut">{data?.counts?.[c.key] ?? "—"}</div>
            <div className="text-xs text-brand-mocha">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="card-soft p-5">
          <div className="text-xs uppercase tracking-widest text-brand-mocha">Pipeline</div>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>New enquiries</span><span className="font-semibold text-brand-walnut">{data?.counts?.new_enquiries ?? 0}</span></div>
            <div className="flex items-center justify-between"><span>New wholesale</span><span className="font-semibold text-brand-walnut">{data?.counts?.new_wholesale ?? 0}</span></div>
            <div className="flex items-center justify-between"><span>New dealer apps</span><span className="font-semibold text-brand-walnut">{data?.counts?.new_dealers ?? 0}</span></div>
          </div>
        </div>
        <div className="card-soft p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-brand-mocha">Recent enquiries</div>
            <Link to="/admin/enquiries" className="text-xs text-brand-terracotta hover:underline">View all →</Link>
          </div>
          <div className="mt-3 divide-y divide-brand-line text-sm">
            {(data?.recent_enquiries || []).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="font-medium text-brand-walnut">{e.name} <span className="text-brand-mocha font-normal">· {e.phone}</span></div>
                  <div className="text-xs text-brand-mocha line-clamp-1">{e.product_name || e.source} {e.city ? ` · ${e.city}` : ""}</div>
                </div>
                <span className={`pill ${e.status === "new" ? "!bg-brand-terracotta/10 !text-brand-terracotta" : ""}`}>{e.status}</span>
              </div>
            ))}
            {(!data?.recent_enquiries || data.recent_enquiries.length === 0) && <div className="py-6 text-center text-brand-mocha">No enquiries yet.</div>}
          </div>
        </div>
      </div>

      <div className="mt-8 card-soft p-5">
        <div className="text-xs uppercase tracking-widest text-brand-mocha">Top categories by inventory</div>
        <div className="mt-3 space-y-2">
          {(data?.products_by_category || []).map((row) => {
            const max = Math.max(...(data.products_by_category.map((x) => x.count)));
            const pct = Math.round((row.count / max) * 100);
            return <div key={row.category}>
                <div className="flex justify-between text-sm"><span className="text-brand-walnut">{row.category}</span><span className="text-brand-mocha">{row.count}</span></div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-brand-sand"><div className="h-full bg-brand-terracotta" style={{ width: `${pct}%` }} /></div>
              </div>;
          })}
        </div>
      </div>
    </div>
  );
}
