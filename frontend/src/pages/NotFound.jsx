import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-wodmin py-24 text-center" data-testid="not-found-page">
      <span className="eyebrow">404</span>
      <h1 className="mt-3 font-display text-5xl text-brand-walnut">This page took a coffee break.</h1>
      <p className="mt-3 text-brand-mocha">Let's get you back to something beautiful.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/categories" className="btn-secondary">Browse categories</Link>
      </div>
    </div>
  );
}
