import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/authContext";

export default function AdminLogin() {
  const { admin, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="min-h-screen grid place-items-center text-brand-mocha">Loading…</div>;
  if (admin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email.trim().toLowerCase(), password);
      toast.success("Welcome back");
      navigate("/admin", { replace: true });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Login failed. Check your credentials.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-brand-cream p-6" data-testid="admin-login">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-terracotta text-white"><Lock className="h-5 w-5" /></div>
          <h1 className="mt-4 font-display text-3xl text-brand-walnut">WODMIN Admin</h1>
          <p className="mt-1 text-sm text-brand-mocha">Sign in to manage the catalogue.</p>
        </div>
        <form onSubmit={submit} className="card-soft p-6 sm:p-8 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-brand-mocha">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-brand-line bg-brand-cream px-4 py-3 text-sm outline-none focus:border-brand-terracotta focus:ring-2 focus:ring-brand-terracotta/30"
              data-testid="admin-login-email"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-brand-mocha">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-brand-line bg-brand-cream px-4 py-3 text-sm outline-none focus:border-brand-terracotta focus:ring-2 focus:ring-brand-terracotta/30"
              data-testid="admin-login-password"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full" data-testid="admin-login-submit">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
