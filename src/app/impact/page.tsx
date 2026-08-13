export const metadata = { title: 'Our impact', description: 'Small-batch production, real hardware sourcing. What we actually do vs what other brands say.' };

export default function ImpactPage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Our impact</div>
      <h1 className="font-display text-4xl md:text-5xl text-ivory mt-3">Small-batch, honest, checked before it ships</h1>
      <p className="mt-4 text-ivory/70 leading-relaxed">
        We&apos;re not a sustainable brand in the strict sense. But here&apos;s what we actually do.
      </p>

      <div className="mt-10 space-y-8 text-ivory/80 leading-relaxed">
        <div>
          <h2 className="font-display text-2xl text-ivory mb-3">What we do</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Produce a small run per drop. No overstock. When it sells out, wait a few weeks for the next one.</li>
            <li>Source real metal hardware &mdash; D-rings, buckles, chain &mdash; not printed-on graphics.</li>
            <li>Quality-check boning, stitching, and hardware attachment on every piece before it ships.</li>
            <li>Stitch at a small unit near Karol Bagh, Delhi. A handful of tailors, one supervisor. Fair wages.</li>
            <li>Pack each order by hand at our Gurugram address.</li>
            <li>Free return shipping via Delhivery. Returned pieces are inspected, repaired if needed, resold at a small discount (or donated if not resalable).</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl text-ivory mb-3">What we don&apos;t do</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Use organic or handloom fabric for mesh/jersey pieces. We&apos;re honest about that.</li>
            <li>Claim carbon neutrality. We&apos;re not there yet.</li>
            <li>Have take-back or resale programs. Considering both for the future.</li>
            <li>Charge extra for &quot;sustainability&quot;. The price is the price.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl text-ivory mb-3">Why we&apos;re transparent about this</h2>
          <p className="text-sm">Most brands claim sustainability without doing the work. We think being honest about limitations is more valuable than performing perfection.</p>
        </div>
      </div>
    </div>
  );
}
