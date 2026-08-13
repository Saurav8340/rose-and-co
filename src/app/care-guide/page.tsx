export const metadata = { title: 'Care guide', description: 'How to wash mesh, store corsets, and keep hardware from tarnishing. Rules that keep your pieces holding up.' };

export default function CareGuidePage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-crimson">Care guide</div>
      <h1 className="font-display text-4xl md:text-5xl text-ivory mt-3">Keep it holding up</h1>
      <p className="mt-4 text-ivory/70 leading-relaxed">
        Real hardware and boned construction last if you treat them right. Here are the rules.
      </p>

      <div className="mt-10 space-y-6 text-ivory/80 leading-relaxed">
        <div className="p-5 bg-blush/30 border-l-4 border-wine">
          <h2 className="font-display text-xl text-ivory">The four rules</h2>
          <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm">
            <li><b>Never tumble dry mesh or fishnet.</b> Heat is what tears it. Air dry only.</li>
            <li><b>Cold water only.</b> Warm water breaks down mesh and stretches lacing.</li>
            <li><b>Unlace corsets before washing.</b> Wash the shell, never the boning channels submerged.</li>
            <li><b>Keep hardware dry.</b> Wipe D-rings and buckles, don&apos;t soak metal parts.</li>
          </ol>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-3">Washing</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Hand wash mesh and fishnet cold with mild detergent.</li>
            <li>Corset shells: spot clean where possible, hand wash if needed with boning removed if your piece allows it.</li>
            <li>Never bleach.</li>
            <li>Never soak overnight — mesh loses its stretch.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-3">Drying</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Hang or lay flat.</li>
            <li>Never direct sunlight — it weakens mesh fibres.</li>
            <li>Never near a heater or radiator.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-3">Storage</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Store corsets laced loosely flat, not folded — keeps the boning from creasing.</li>
            <li>Cotton bag for mesh and fishnet, not plastic.</li>
            <li>Keep hardware dry and away from perfume or hairspray — both dull the metal finish.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}




