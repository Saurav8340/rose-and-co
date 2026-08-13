import InteractiveSizeChart from '@/components/InteractiveSizeChart';

export const metadata = { title: 'Size guide', description: 'How to measure yourself for corsets, mesh, and hardware pieces. Size chart with brand equivalents (Zara, H&amp;M).' };

export default function SizeGuidePage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-crimson">Size guide</div>
      <h1 className="font-display text-4xl md:text-5xl text-ivory mt-3">How to size yourself right</h1>
      <p className="mt-4 text-ivory/70 leading-relaxed">
        Wrong size costs you a week. Here&apos;s how to get it right the first time.
      </p>

      <div className="mt-10">
        <h2 className="font-display text-2xl text-ivory mb-4">Size chart</h2>
        <InteractiveSizeChart />
      </div>

      <div className="mt-12 space-y-6 text-ivory/80 leading-relaxed">
        <div>
          <h3 className="font-display text-xl text-ivory mb-2">Between sizes?</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Between XS and S: XS for fitted, S for comfort.</li>
            <li>Between S and M with broader bust: size up for corsets and structured tops only.</li>
            <li>Mesh and jersey pieces have some give &mdash; when in doubt for those, size down.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xl text-ivory mb-2">Still unsure?</h3>
          <p className="text-sm">Email us at care@roseandco.in with your bust, waist, and hip measurements. We&apos;ll pick the size for you.</p>
        </div>
      </div>
    </div>
  );
}




