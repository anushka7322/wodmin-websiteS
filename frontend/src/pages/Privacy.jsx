export default function Privacy() {
  return (
    <article className="container-wodmin py-14" data-testid="privacy-page">
      <header className="max-w-3xl">
        <span className="eyebrow">Privacy Policy</span>
        <h1 className="mt-2 font-display text-4xl text-brand-walnut sm:text-5xl">Your privacy, our priority.</h1>
        <p className="mt-3 text-brand-mocha">Effective from January 2026.</p>
      </header>
      <div className="prose mx-auto mt-10 max-w-3xl text-brand-walnut">
        <p className="text-brand-mocha leading-relaxed">WODMIN ("we", "us", "our") respects your privacy. This policy explains what personal data we collect, why we collect it and what we do with it.</p>
        <h2 className="mt-8 font-display text-2xl">Information we collect</h2>
        <ul className="mt-3 space-y-2 list-disc pl-6 text-brand-mocha">
          <li>Name, phone number, email and city when you submit enquiry, callback, dealer or wholesale forms.</li>
          <li>Information you share during conversations on WhatsApp, phone or email.</li>
          <li>Basic analytics (pages visited, device type) to improve the site.</li>
        </ul>
        <h2 className="mt-8 font-display text-2xl">How we use it</h2>
        <ul className="mt-3 space-y-2 list-disc pl-6 text-brand-mocha">
          <li>To respond to your enquiries and provide quotes.</li>
          <li>To send updates about your order, delivery and after-sales.</li>
          <li>To share occasional offers (only if you opt-in to our newsletter).</li>
        </ul>
        <h2 className="mt-8 font-display text-2xl">Sharing</h2>
        <p className="mt-3 text-brand-mocha">We never sell your data. We share information only with trusted logistics, payment and analytics partners — strictly to fulfil your order or improve the service.</p>
        <h2 className="mt-8 font-display text-2xl">Your rights</h2>
        <p className="mt-3 text-brand-mocha">You can request access, correction or deletion of your data at any time by writing to hello@wodmin.in.</p>
      </div>
    </article>
  );
}
