import { Link } from "react-router-dom";
import { ShieldCheck, Sparkles, Hammer, Heart, Users, Truck, BadgePercent } from "lucide-react";
import { BRAND } from "@/lib/contact";

const VALUES = [
  { icon: BadgePercent, title: "Affordable", desc: "Direct-from-brand pricing. No showroom markups." },
  { icon: ShieldCheck, title: "Reliable", desc: "Written warranty on every piece. Real after-sales support." },
  { icon: Sparkles, title: "Modern", desc: "Designs that look at home in today's Indian living spaces." },
  { icon: Hammer, title: "Durable", desc: "Quality materials, sturdy joinery, built to last." },
];

const STATS = [
  { v: "2018", l: "Founded" },
  { v: "300+", l: "Designs" },
  { v: "25", l: "Categories" },
  { v: "50,000+", l: "Customers served" },
];

export default function About() {
  return (
    <div data-testid="about-page">
      <section className="container-wodmin py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="pill-accent">About {BRAND.name}</span>
            <h1 className="mt-4 font-display text-4xl text-brand-walnut sm:text-5xl">Modern furniture for every Indian home.</h1>
            <p className="mt-5 text-brand-mocha text-base sm:text-lg leading-relaxed">
              {BRAND.name} was founded with a simple belief — that good furniture should be modern, dependable and within reach.
              We design our pieces in India and work with trusted workshops across the country to keep prices honest and quality consistent.
            </p>
            <p className="mt-3 text-brand-mocha leading-relaxed">
              From a one-bedroom flat in Pune to a 30-seater office in Bengaluru, our pieces are made for the way Indians actually live and work.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden rounded-[2rem] border border-brand-line bg-brand-sand">
              <img src="https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=900&q=80" alt="WODMIN workshop" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-wodmin">
          <span className="eyebrow">What we stand for</span>
          <h2 className="mt-2 font-display text-3xl text-brand-walnut sm:text-4xl">Affordable • Reliable • Modern • Durable.</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="card-soft p-6">
                <v.icon className="h-6 w-6 text-brand-terracotta" />
                <div className="mt-3 font-display text-xl text-brand-walnut">{v.title}</div>
                <p className="mt-1 text-sm text-brand-mocha">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-wodmin py-16">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-brand-line bg-white p-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l}>
              <div className="font-display text-3xl text-brand-walnut">{s.v}</div>
              <div className="text-xs text-brand-mocha">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-wodmin pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-brand-line bg-brand-sand">
              <img src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80" alt="" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-6">
            <span className="eyebrow">Manufacturing</span>
            <h2 className="mt-2 font-display text-3xl text-brand-walnut sm:text-4xl">Built in India, for Indian conditions.</h2>
            <p className="mt-3 text-brand-mocha leading-relaxed">
              All our wood is termite-treated. Our hardware is sourced from quality-checked Indian and imported partners.
              We finish with low-VOC polishes so your furniture is safe for kids and pets.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-brand-walnut">
              <li className="flex gap-2"><Heart className="h-4 w-4 text-brand-terracotta" /> 100+ skilled craftspeople</li>
              <li className="flex gap-2"><Users className="h-4 w-4 text-brand-terracotta" /> Dedicated B2B & dealer team</li>
              <li className="flex gap-2"><Truck className="h-4 w-4 text-brand-terracotta" /> Pan-India delivery network</li>
            </ul>
            <Link to="/contact" className="btn-primary mt-6">Talk to us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
