import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";

export default function BlogDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => { api.get(`/blogs/${slug}`).then((r) => setData(r.data)).catch(() => setData({notFound:true})); }, [slug]);
  if (!data) return <div className="container-wodmin py-20 text-center text-brand-mocha">Loading…</div>;
  if (data.notFound) return <div className="container-wodmin py-20 text-center">Article not found. <Link to="/blogs" className="text-brand-terracotta">Read more →</Link></div>;
  const b = data.blog;
  return (
    <article className="container-wodmin py-12 lg:py-16" data-testid="blog-detail">
      <nav className="text-xs text-brand-mocha"><Link to="/" className="hover:text-brand-terracotta">Home</Link> / <Link to="/blogs" className="hover:text-brand-terracotta">Blogs</Link> / {b.title}</nav>
      <header className="mx-auto mt-6 max-w-3xl">
        <span className="pill">{b.category}</span>
        <h1 className="mt-3 font-display text-4xl text-brand-walnut sm:text-5xl">{b.title}</h1>
        <div className="mt-3 text-xs text-brand-mocha">{b.author} · {new Date(b.published_at).toLocaleDateString("en-IN", {year:"numeric", month:"short", day:"numeric"})} · {b.read_minutes} min read</div>
      </header>
      <div className="mx-auto mt-8 max-w-4xl">
        <div className="aspect-[16/9] overflow-hidden rounded-3xl bg-brand-sand">
          <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
        </div>
      </div>
      <div className="prose prose-neutral mx-auto mt-10 max-w-3xl text-brand-walnut">
        {b.content.split("\n").map((line, i) => {
          if (line.startsWith("## ")) return <h2 key={i} className="mt-8 font-display text-2xl">{line.slice(3)}</h2>;
          if (line.startsWith("# ")) return <h1 key={i} className="font-display text-3xl">{line.slice(2)}</h1>;
          if (line.startsWith("- ")) return <li key={i} className="ml-6 list-disc">{line.slice(2)}</li>;
          if (!line.trim()) return <br key={i} />;
          return <p key={i} className="mt-4 leading-relaxed text-brand-mocha">{line}</p>;
        })}
      </div>
      <div className="mx-auto mt-14 max-w-3xl border-t border-brand-line pt-8">
        <h3 className="font-display text-xl text-brand-walnut">Read next</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {data.related?.map((r) => (
            <Link key={r.id} to={`/blog/${r.slug}`} className="group">
              <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-brand-sand">
                <img src={r.image} alt={r.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="mt-2 font-display text-base text-brand-walnut group-hover:text-brand-terracotta">{r.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
