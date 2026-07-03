import InteractiveSizeChart from '@/components/InteractiveSizeChart';
import Link from 'next/link';

export const metadata = { title: 'Size guide', description: 'How to measure yourself for online satin shopping. Amara set size chart with brand equivalents (Zara, H&amp;M).' };

export default function SizeGuidePage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Size guide</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3">How to size yourself right</h1>
      <p className="mt-4 text-espresso/70 leading-relaxed">
        Wrong size costs you a week. Here\'s how to get it right the first time.
      </p>

      <div className="mt-10">
        <h2 className="font-display text-2xl text-espresso mb-4">Amara set size chart</h2>
        <InteractiveSizeChart />
      </div>

      <div className="mt-12 space-y-6 text-espresso/80 leading-relaxed">
        <div>
          <h3 className="font-display text-xl text-espresso mb-2">Between sizes?</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Between XS and S: XS for fitted, S for comfort.</li>
            <li>Between S and M with broader bust: size up for top only.</li>
            <li>Between L and XL: always XL. Satin doesn\'t stretch.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xl text-espresso mb-2">How to measure yourself</h3>
          <p className="text-sm">Full guide: <Link href="/journal/how-to-measure-for-online-shopping" className="underline text-wine">How to measure yourself for online satin shopping</Link></p>
        </div>

        <div>
          <h3 className="font-display text-xl text-espresso mb-2">Still unsure?</h3>
          <p className="text-sm">Email us at care@roseandco.in with your bust, waist, and hip measurements. We\'ll pick the size for you.</p>
        </div>
      </div>
    </div>
  );
}
