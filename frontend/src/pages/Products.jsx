import ProductGrid from "@/components/product/ProductGrid";

export default function Products() {
  return (
    <div data-testid="products-page">
      <section className="bg-white">
        <div className="container-wodmin py-10 lg:py-14">
          <span className="eyebrow">All products</span>
          <h1 className="mt-2 font-display text-4xl text-brand-walnut sm:text-5xl">The complete WODMIN catalogue.</h1>
          <p className="mt-3 max-w-2xl text-brand-mocha">Search, filter and find the perfect piece. Tap any item for details and a personal quote.</p>
        </div>
      </section>
      <ProductGrid />
    </div>
  );
}
