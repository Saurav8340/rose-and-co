export const metadata = { title: 'Our impact', description: 'Small-batch production, transparent supply chain. What we actually do vs what other brands say.' };

export default function ImpactPage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Our impact</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3">Small-batch, transparent, honest</h1>
      <p className="mt-4 text-espresso/70 leading-relaxed">
        We\'re not a sustainable brand in the strict sense. But here\'s what we actually do.
      </p>

      <div className="mt-10 space-y-8 text-espresso/80 leading-relaxed">
        <div>
          <h2 className="font-display text-2xl text-espresso mb-3">What we do</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Produce 200 sets per drop. No overstock. When it sells out, wait 4-6 weeks for the next drop.</li>
            <li>Hand-paint each fabric panel. Not machine-printed. Not digital.</li>
            <li>Source poly-satin from a single mill in Surat. We know their conditions and pay above market rate.</li>
            <li>Stitch at a small unit near Karol Bagh, Delhi. 8 tailors, one supervisor. Fair wages.</li>
            <li>Pack each order by hand at our Gurugram address.</li>
            <li>Free return shipping via Delhivery. Returned pieces are inspected, repaired if needed, resold at a small discount (or donated if not resalable).</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl text-espresso mb-3">What we don\'t do</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Use organic or handloom fabric. Poly-satin is not eco-friendly. We\'re honest about that.</li>
            <li>Claim carbon neutrality. We\'re not there yet.</li>
            <li>Have take-back or resale programs. Considering both for future.</li>
            <li>Charge extra for &quot;sustainability&quot;. Rs 1,499 is the price.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl text-espresso mb-3">Why we\'re transparent about this</h2>
          <p className="text-sm">Most brands claim sustainability without doing the work. We think being honest about limitations is more valuable than performing perfection.</p>
        </div>
      </div>
    </div>
  );
}
