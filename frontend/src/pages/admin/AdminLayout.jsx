import { Link, NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, Layers, FileText, Star, HelpCircle, Image as ImageIcon,
  Mail, Building2, Users, PhoneCall, Newspaper, LogOut, ImagePlus,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/collections", label: "Collections", icon: Layers },
  { to: "/admin/blogs", label: "Blogs", icon: FileText },
  { to: "/admin/testimonials", label: "Testimonials", icon: Star },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { to: "/admin/banner", label: "Homepage Banner", icon: ImagePlus },
  { type: "divider", label: "Enquiries" },
  { to: "/admin/enquiries", label: "Customer Enquiries", icon: Mail },
  { to: "/admin/wholesale", label: "Wholesale", icon: Building2 },
  { to: "/admin/dealers", label: "Dealer Applications", icon: Users },
  { to: "/admin/callbacks", label: "Callbacks", icon: PhoneCall },
  { to: "/admin/newsletter", label: "Newsletter", icon: Newspaper },
];

export default function AdminLayout() {
  const { admin, loading, logout } = useAuth();
  const navigate = useNavigate();
  if (loading) return <div className="min-h-screen grid place-items-center text-brand-mocha">Loading…</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => { logout(); navigate("/admin/login", { replace: true }); };

  return (
    <div className="min-h-screen bg-brand-cream" data-testid="admin-layout">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-brand-line bg-white lg:flex">
        <div className="px-6 py-5">
          <Link to="/admin" className="font-display text-2xl text-brand-walnut">WODMIN<span className="text-brand-terracotta">.</span></Link>
          <div className="mt-1 text-xs uppercase tracking-widest text-brand-mocha">Admin Console</div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-6 text-sm">
          {NAV.map((item, i) => item.type === "divider" ? (
            <div key={i} className="mt-4 px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-brand-mocha">{item.label}</div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={`admin-nav-${item.to.split("/").pop() || "dashboard"}`}
              className={({ isActive }) => `mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2 transition ${isActive ? "bg-brand-terracotta/10 text-brand-terracotta" : "text-brand-walnut hover:bg-brand-sand"}`}
            >
              <item.icon className="h-4 w-4" />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-brand-line p-4">
          <div className="text-xs text-brand-mocha">Signed in as</div>
          <div className="text-sm font-medium text-brand-walnut">{admin.email}</div>
          <button onClick={handleLogout} className="mt-3 inline-flex items-center gap-2 text-xs text-brand-mocha hover:text-brand-terracotta" data-testid="admin-logout">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-brand-line bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <Link to="/admin" className="font-display text-xl text-brand-walnut">WODMIN<span className="text-brand-terracotta">.</span></Link>
          <button onClick={handleLogout} className="text-xs text-brand-mocha"><LogOut className="h-4 w-4 inline" /> Sign out</button>
        </div>
        <div className="mt-3 -mx-1 flex gap-1 overflow-x-auto pb-1 text-xs">
          {NAV.filter((i) => !i.type).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({isActive}) => `shrink-0 rounded-full px-3 py-1.5 ${isActive ? "bg-brand-terracotta text-white" : "bg-brand-sand text-brand-walnut"}`}>{item.label}</NavLink>
          ))}
        </div>
      </header>

      <main className="lg:ml-64">
        <div className="px-4 py-6 sm:px-8 sm:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
