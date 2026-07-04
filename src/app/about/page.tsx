import { SITE } from '@/lib/constants';
import FounderNote from '@/components/FounderNote';

export const metadata = {
  title: 'About',
  description: 'A small studio in Gurugram making one thing at a time.',
};

export default function AboutPage() {
  return (
    <div className="container-x py-16 max-w-2xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">About</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3 mb-10 leading-tight">
        Small studio.<br/>One thing at a time.
      </h1>

      <div className="text-espresso/85 leading-[1.9] space-y-6 text-[17px]">
        <p>
          We began in the spring of 2026, in a two-bedroom flat in Sector 47, Gurugram. There was one founder, one product, and one long conversation with a mill in Surat about the difference between good satin and satin that only photographs well.
        </p>

        <p>
          The problem we set out to solve was small and specific. Satin co-ords under two thousand rupees were almost always too thin, or printed in a way that flattened everything, or shipped from resellers who took three weeks. Satin co-ords above three thousand were the same three brands you already knew. Between them was nothing.
        </p>

        <p>
          So we made the thing that should have been there. A poly-satin heavy enough to fall properly. A marble print painted by hand, one panel at a time, before the cloth was ever cut. A crop top and a midi skirt, stitched at a small unit near Karol Bagh, packed and shipped from our own address by Delhivery.
        </p>

        <p>
          We do this in batches of two hundred. When the sizes are gone, we wait four to six weeks and begin again. Every set is looked at before it leaves the studio. A loose thread, a print that ran, a missing tag &mdash; we catch it, or we don&apos;t ship it.
        </p>

        <div className="pt-4">
          <p className="text-espresso font-medium">A few things we don&apos;t do.</p>
        </div>

        <p>
          We don&apos;t invent discounts. The retail markup on a piece like this is real, and our MRP reflects it. We sell direct, and that is the whole reason the price is what it is.
        </p>

        <p>
          We don&apos;t do full cash on delivery. We tried it and one in three came back. So we ask for a small deposit at the door, and the rest in cash. It keeps the piece here for someone who actually wants it.
        </p>

        <p>
          We don&apos;t send promotional messages. If we write to you, it is about your order.
        </p>

        <div className="pt-4">
          <p className="text-espresso font-medium">When something goes wrong.</p>
        </div>

        <p>
          Because sometimes it does. This is a new brand made by one person. If your set arrives damaged, if the size chart was off, if Delhivery loses the package &mdash; please write to me at <a className="underline text-wine" href={`mailto:${SITE.email}`}>{SITE.email}</a>. Not a form, not a ticket. My inbox. I answer within a few hours during studio time.
        </p>

        <p className="text-espresso/70 italic">
          That&apos;s all.
        </p>
      </div>

      <FounderNote />
    </div>
  );
}
