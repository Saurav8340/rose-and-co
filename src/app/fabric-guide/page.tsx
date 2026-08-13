export const metadata = { title: 'Fabric guide', description: 'What we look for in construction and why. Boning, hardware, and mesh quality signals explained.' };

export default function FabricGuidePage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Fabric guide</div>
      <h1 className="font-display text-4xl md:text-5xl text-ivory mt-3">What we obsess over</h1>
      <p className="mt-4 text-ivory/70 leading-relaxed">
        Construction is 80% of what makes a good piece. Here&apos;s what we look for and why.
      </p>

      <div className="mt-10 space-y-8 text-ivory/80 leading-relaxed">
        <div>
          <h2 className="font-display text-2xl text-ivory mb-3">Boning: steel vs plastic</h2>
          <p>Steel boning holds its shape wear after wear. Plastic (spiral or flat) boning warps within a few wears, especially in humidity. We use steel in every corset and waspie — no exceptions, no boneless shells sold as the real thing.</p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-ivory mb-3">Hardware: real metal vs printed</h2>
          <p>A lot of &quot;chain-detail&quot; pieces on the market are a chain graphic printed onto fabric. Ours are real metal D-rings, buckles, and chain, riveted on properly. It adds weight you can feel and it doesn&apos;t flake off after a wash.</p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-ivory mb-3">Mesh weight</h2>
          <p>Thin mesh goes see-through the first time it stretches over a seam and pills within a few wears. We use a denser mesh that holds its shape and stays opaque where it&apos;s meant to.</p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-ivory mb-3">Why it matters</h2>
          <p>You can&apos;t always tell construction quality from a product photo. That&apos;s exactly why cheap versions of these pieces exist &mdash; the flaws only show up after the first wash or the first night out. We&apos;d rather tell you upfront what to look for.</p>
        </div>
      </div>
    </div>
  );
}
