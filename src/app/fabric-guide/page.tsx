import Link from 'next/link';

export const metadata = { title: 'Fabric guide', description: 'What we look for in fabric and why. Complete guide to GSM, satin types, and quality signals.' };

export default function FabricGuidePage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Fabric guide</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3">What we obsess over</h1>
      <p className="mt-4 text-espresso/70 leading-relaxed">
        Fabric is 80% of what makes a good piece. Here\'s what we look for and why.
      </p>

      <div className="mt-10 space-y-8 text-espresso/80 leading-relaxed">
        <div>
          <h2 className="font-display text-2xl text-espresso mb-3">The Amara fabric</h2>
          <p>Poly-satin blend, 95-105 GSM. Sourced from a mill in Surat. We tested 9 swatches from 6 mills before choosing this one.</p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-espresso mb-3">Why this GSM</h2>
          <p>Under 90 GSM, satin looks flat and feels plasticky. Above 130 GSM, it starts feeling like curtain material. 95-110 is the sweet spot for drape and photographs.</p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-espresso mb-3">Read more</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><Link href="/journal/poly-satin-fabric-guide" className="underline text-wine">Full poly-satin GSM guide</Link></li>
            <li><Link href="/journal/gsm-fabric-quality-guide" className="underline text-wine">What GSM means across all fabrics</Link></li>
            <li><Link href="/journal/poly-satin-vs-silk-satin" className="underline text-wine">Poly-satin vs silk satin</Link></li>
            <li><Link href="/journal/spot-cheap-satin-in-photos" className="underline text-wine">Spot cheap satin in product photos</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
