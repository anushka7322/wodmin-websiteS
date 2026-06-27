import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BRAND, CONTACT, SOCIAL } from "@/lib/contact";
import { api } from "@/lib/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      const r = await api.post("/newsletter", { email });
      if (r.data.status === "subscribed") toast.success("Subscribed! Welcome to WODMIN.");
      else toast.info("You're already on our list.");
      setEmail("");
    } catch {
      toast.error("Could not subscribe. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="mt-24 border-t border-brand-line bg-white" data-testid="site-footer">
      <div className="container-wodmin py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="font-display text-3xl font-semibold text-brand-walnut">
              {BRAND.name}<span className="text-brand-terracotta">.</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-brand-mocha leading-relaxed">{BRAND.description}</p>
            <form onSubmit={subscribe} className="mt-6 flex max-w-sm gap-2" data-testid="newsletter-form">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-full border border-brand-line bg-brand-cream px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-terracotta"
                data-testid="newsletter-input"
              />
              <button type="submit" disabled={busy} className="btn-primary" data-testid="newsletter-submit">
                {busy ? "…" : "Subscribe"}
              </button>
            </form>
            <div className="mt-6 flex gap-3 text-brand-mocha">
              <a aria-label="Instagram" href={SOCIAL.instagram} className="rounded-full border border-brand-line p-2 hover:text-brand-terracotta hover:border-brand-terracotta"><Instagram className="h-4 w-4" /></a>
              <a aria-label="Facebook" href={SOCIAL.facebook} className="rounded-full border border-brand-line p-2 hover:text-brand-terracotta hover:border-brand-terracotta"><Facebook className="h-4 w-4" /></a>
              <a aria-label="YouTube" href={SOCIAL.youtube} className="rounded-full border border-brand-line p-2 hover:text-brand-terracotta hover:border-brand-terracotta"><Youtube className="h-4 w-4" /></a>
              <a aria-label="LinkedIn" href={SOCIAL.linkedin} className="rounded-full border border-brand-line p-2 hover:text-brand-terracotta hover:border-brand-terracotta"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
            <div>
              <h4 className="eyebrow">Shop</h4>
              <ul className="mt-4 space-y-2 text-sm text-brand-walnut">
                <li><Link className="hover:text-brand-terracotta" to="/categories">All categories</Link></li>
                <li><Link className="hover:text-brand-terracotta" to="/collections">Collections</Link></li>
                <li><Link className="hover:text-brand-terracotta" to="/products?is_new_arrival=true">New arrivals</Link></li>
                <li><Link className="hover:text-brand-terracotta" to="/products?is_budget=true">Budget collection</Link></li>
                <li><Link className="hover:text-brand-terracotta" to="/gallery">Customer gallery</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="eyebrow">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-brand-walnut">
                <li><Link className="hover:text-brand-terracotta" to="/about">About WODMIN</Link></li>
                <li><Link className="hover:text-brand-terracotta" to="/wholesale">Wholesale</Link></li>
                <li><Link className="hover:text-brand-terracotta" to="/dealer">Dealer Program</Link></li>
                <li><Link className="hover:text-brand-terracotta" to="/blogs">Blog</Link></li>
                <li><Link className="hover:text-brand-terracotta" to="/faqs">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="eyebrow">Contact</h4>
              <ul className="mt-4 space-y-3 text-sm text-brand-walnut">
                <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-brand-mocha" />{CONTACT.address}</li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-mocha" /><a href={CONTACT.phoneLink} className="hover:text-brand-terracotta">{CONTACT.phone}</a></li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-mocha" /><a href={CONTACT.emailLink} className="hover:text-brand-terracotta">{CONTACT.email}</a></li>
                <li className="text-brand-mocha">{CONTACT.hours}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-brand-line pt-6 sm:flex-row sm:items-center sm:justify-between text-xs text-brand-mocha">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-brand-walnut">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-brand-walnut">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
