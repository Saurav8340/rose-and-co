import { SITE } from '@/lib/constants';

export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">About</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3 mb-8">A small studio in Gurugram.</h1>

      <div className="text-espresso/80 leading-relaxed space-y-5">
        <p>
          We started Rosé & Co in early 2026 because we could not find satin co-ord sets that felt premium without costing what a Zara or H&M premium import costs. Everything we liked was either flimsy at ₹1,500 or heavy at ₹6,000. Nothing in between.
        </p>
        <p>
          So we made our own. Small drops, hand-painted prints, real satin. Shipped directly from Gurugram.
        </p>

        <h2 className="font-display text-2xl text-espresso pt-6">What we do</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Design in small batches. 200 sets per drop, then it stays sold out until the next batch.</li>
          <li>Print by hand. Every set is one of a kind — your swirl will not match anyone else&rsquo;s.</li>
          <li>Ship in 24–48 hours from Delhi NCR.</li>
          <li>Check every piece before dispatch. Loose thread, print smudge, missing tag &mdash; we catch it before it goes out.</li>
        </ul>

        <h2 className="font-display text-2xl text-espresso pt-6">What we do not do</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>No fake discounts. The price you see is what we charge. No &ldquo;₹4,999 crossed out, now ₹1,499&rdquo; nonsense.</li>
          <li>No full COD. Partial only. Full COD pushed our RTO rate above 30% in early tests and would have made us price at ₹1,999.</li>
          <li>No 500-SKU catalogue. We drop, sell out, drop again.</li>
          <li>No promotional SMS. If we message you, it is about your order.</li>
        </ul>

        <h2 className="font-display text-2xl text-espresso pt-6">If something goes wrong</h2>
        <p>
          We are a new brand. If your set arrives damaged, if the size is off, if the courier loses it &mdash; email <a className="underline text-wine" href={`mailto:${SITE.email}`}>{SITE.email}</a>. We will fix it. No forms, no ticket numbers, no runaround.
        </p>

        <p className="pt-6 text-sm text-espresso/60 italic">
          &mdash; The Rosé & Co team. Gurugram, Haryana.
        </p>
      </div>
    </div>
  );
}
