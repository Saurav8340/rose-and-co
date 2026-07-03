import Link from 'next/link';

export const metadata = { title: 'Care guide', description: 'How to wash, dry, iron, and store satin without damaging it. Rules that keep your Amara set looking new.' };

export default function CareGuidePage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Care guide</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3">Keep your satin looking new</h1>
      <p className="mt-4 text-espresso/70 leading-relaxed">
        Satin lasts if you treat it right. Here are the rules.
      </p>

      <div className="mt-10 space-y-6 text-espresso/80 leading-relaxed">
        <div className="p-5 bg-blush/30 border-l-4 border-wine">
          <h2 className="font-display text-xl text-espresso">The four rules</h2>
          <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm">
            <li><b>Never tumble dry.</b> Heat kills poly-satin. Air dry only.</li>
            <li><b>Cold water only.</b> Warm water breaks down the fibre finish.</li>
            <li><b>No wringing.</b> Squeeze water out gently.</li>
            <li><b>Iron on the reverse only, low heat.</b> Or steam in a bathroom.</li>
          </ol>
        </div>

        <div>
          <h2 className="font-display text-xl text-espresso mb-3">Washing</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Hand wash cold with mild detergent.</li>
            <li>Or gentle cycle in a mesh bag.</li>
            <li>Never bleach.</li>
            <li>Never soak overnight.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl text-espresso mb-3">Drying</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Hang or lay flat.</li>
            <li>Never direct sunlight.</li>
            <li>Never near a heater.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl text-espresso mb-3">Storage</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Cotton bag, not plastic.</li>
            <li>Away from perfume and hairspray.</li>
            <li>Air out every 2 months.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl text-espresso mb-3">Read more</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><Link href="/journal/how-to-iron-satin" className="underline text-wine">How to iron satin without damaging it</Link></li>
            <li><Link href="/journal/remove-wrinkles-no-iron" className="underline text-wine">Remove wrinkles without an iron</Link></li>
            <li><Link href="/journal/storing-satin-yellowing-prevention" className="underline text-wine">Storing satin without yellowing</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
