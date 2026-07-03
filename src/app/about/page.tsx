import { SITE } from '@/lib/constants';
import FounderNote from '@/components/FounderNote';

export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">About</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3 mb-8">Small studio, Gurugram.</h1>

      <div className="text-espresso/80 leading-relaxed space-y-5">
        <p>
          Rose &amp; Co started in a 2BHK in Sector 47, Gurugram, in early 2026. One founder, one product, one supplier in Surat.
        </p>

        <p>
          The idea came from a specific problem. Every satin co-ord under Rs 2,000 on Indian D2C sites was either too thin (60 to 70 GSM), had a print that looked digital and flat, or arrived weeks late from a Meesho reseller. We wanted something between the Rs 1,200 fast-fashion category and the Rs 4,000 heavy-satin bridal category. Nobody was making it.
        </p>

        <p>
          So we did. 95 to 105 GSM poly-satin, hand-painted marble swirl, cut and stitched at a small unit near Karol Bagh, shipped from our Gurugram address via Delhivery. That is the whole operation.
        </p>

        <h2 className="font-display text-2xl text-espresso pt-6">What we do</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>200 sets per drop. When XS to M is gone, wait for the next drop (usually 4 to 6 weeks).</li>
          <li>Each set is hand-painted, so no two are identical. Yours will look slightly different from the photos.</li>
          <li>Ships from Gurugram in 24 to 48 hours. Delhivery Standard for most pincodes.</li>
          <li>Every set is checked at packing. Loose threads, print smudges, missing tags &mdash; we catch them.</li>
        </ul>

        <h2 className="font-display text-2xl text-espresso pt-6">What we don&apos;t do</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>No fake &ldquo;Rs 4,999 crossed out&rdquo; nonsense. The price is the price.</li>
          <li>No full COD. Tried it, hit 30% RTO in the first month, killed it. Partial COD only (Rs 299 online + Rs 1,200 cash).</li>
          <li>No 500-SKU catalogue. One product at a time, done properly.</li>
          <li>No promotional SMS. If we message you, it is about your order.</li>
        </ul>

        <h2 className="font-display text-2xl text-espresso pt-6">If something breaks</h2>
        <p>
          We are a new brand. If your set arrives damaged, if the size chart lied to you, if Delhivery loses the package &mdash; email me directly at <a className="underline text-wine" href={`mailto:${SITE.email}`}>{SITE.email}</a>. Usually reply within 4 hours during Gurugram working hours.
        </p>

        <p>
          No forms. No ticket numbers. No &ldquo;your feedback is important to us&rdquo; templates.
        </p>
      </div>

      <FounderNote />
    </div>
  );
}
