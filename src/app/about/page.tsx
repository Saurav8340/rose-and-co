import { SITE } from '@/lib/constants';
import FounderNote from '@/components/FounderNote';

export const metadata = {
  title: 'About',
  description: 'A small studio in Gurugram making one thing at a time.',
};

export default function AboutPage() {
  return (
    <div className="container-x py-16 max-w-2xl">
      <div className="text-xs uppercase tracking-[0.3em] text-crimson">About</div>
      <h1 className="font-display text-4xl md:text-5xl text-ivory mt-3 mb-10 leading-tight">
        Small studio.<br/>One drop at a time.
      </h1>

      <div className="text-ivory/85 leading-[1.9] space-y-6 text-[17px]">
        <p>
          We began in the spring of 2026, in a two-bedroom flat in Sector 47, Gurugram. There was one founder, one rack of samples, and a lot of frustration with what alt fashion actually looked like online in India.
        </p>

        <p>
          The problem was small and specific. Corsets under two thousand rupees were almost always boneless — a shell with no real structure, sold as the real thing. Chain details were printed on, not hardware. Everything imported and genuine cost three times what it should, and everything local was a Meesho reseller with the same five stock photos.
        </p>

        <p>
          So we made the thing that should have been there. Steel-boned corsets that actually hold their shape. Real metal D-rings and buckles, not a chain graphic screen-printed onto polyester. Mesh with enough weight that it doesn&apos;t go see-through the first time it stretches. Stitched at a small unit near Karol Bagh, packed and shipped from our own address by Delhivery.
        </p>

        <p>
          We do this in small batches. When the sizes are gone, we wait a few weeks and begin again. Every piece is checked before it leaves the studio. A loose thread, a hook that doesn&apos;t sit right, hardware that doesn&apos;t match the sample &mdash; we catch it, or we don&apos;t ship it.
        </p>

        <div className="pt-4">
          <p className="text-ivory font-medium">A few things we don&apos;t do.</p>
        </div>

        <p>
          We don&apos;t invent discounts. The markup on real hardware and boned construction is real, and our MRP reflects it. We sell direct, and that is the whole reason the price is what it is.
        </p>

        <p>
          We don&apos;t do full cash on delivery. We tried it and one in three came back. So we ask for a small deposit at the door, and the rest in cash. It keeps the piece here for someone who actually wants it.
        </p>

        <p>
          We don&apos;t send promotional messages. If we write to you, it is about your order.
        </p>

        <div className="pt-4">
          <p className="text-ivory font-medium">When something goes wrong.</p>
        </div>

        <p>
          Because sometimes it does. This is a new brand made by one person. If your piece arrives damaged, if the size chart was off, if Delhivery loses the package &mdash; write to me at <a className="underline text-crimson" href={`mailto:${SITE.email}`}>{SITE.email}</a>. Not a form, not a ticket. My inbox. I answer within a few hours during studio time.
        </p>

        <p className="text-ivory/70 italic">
          That&apos;s all.
        </p>
      </div>

      <FounderNote />
    </div>
  );
}



