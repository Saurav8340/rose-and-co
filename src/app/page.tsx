import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';
import { PAYMENT } from '@/lib/constants';
import TrustBar from '@/components/TrustBar';
import JsonLd from '@/components/JsonLd';
import CustomerPhotos from '@/components/CustomerPhotos';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import { organizationSchema, websiteSchema } from '@/lib/schemas';

export const revalidate = 300;

export default async function HomePage() {
  const product = await prisma.product.findUnique({
    where: { slug: 'amara-marble-swirl-coord-set' },
    select: { name: true, price: true, compareAt: true, images: true },
  });
  const images = product ? JSON.parse(product.images) : [];
  const hero = images[0] || '/products/amara-front.png';
  const mrp = product?.compareAt || PAYMENT.mrp;
  const sp  = product?.price || PAYMENT.fullPrice;

  const faqs = [
    ['When will it arrive?', 'Metros, three to five working days. Smaller cities, five to seven. Ships from Gurugram within forty-eight hours of your order.'],
    ['Is cash on delivery available?', 'Partial. A small deposit at the door, the rest in cash when it arrives.'],
    ['Tell me about the fabric.', 'Poly-satin, around a hundred grams per square metre. It has weight. It falls without clinging.'],
    ['What if the size is wrong?', 'Seven days to return. Free pickup. Refund lands in a week.'],
  ];

  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />

      <section className="relative bg-blush/40">
        <div className="container-x grid md:grid-cols-2 gap-8 items-center py-12 md:py-20">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-wine mb-4">A new drop</div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-espresso">
              Poured in ros&eacute;.<br/>Worn in fire.
            </h1>
            <p className="mt-6 text-lg text-espresso/70 max-w-md leading-relaxed">
              Hand-painted marble swirl on satin that actually has weight. Two hundred sets, and then we begin again.
            </p>

            <div className="mt-8 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-wine">{inr(sp)}</span>
              <span className="text-base line-through text-espresso/40">{inr(mrp)}</span>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <Link href="/product/amara-marble-swirl-coord-set" prefetch className="btn-primary">Shop the Amara</Link>
              <Link href="/product/amara-marble-swirl-coord-set" prefetch className="text-sm underline text-espresso">See the set</Link>
            </div>
          </div>
          <div className="relative aspect-[3/4] md:aspect-[4/5] max-w-lg mx-auto w-full">
            <Image src={hero} alt="Amara Marble Swirl Co-ord Set" fill priority fetchPriority="high" sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="container-x py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">The set</div>
          <h2 className="font-display text-3xl md:text-5xl mt-3 text-espresso">Three things worth knowing.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mt-14 max-w-5xl mx-auto">
          <div>
            <div className="font-display text-xl text-wine">The print</div>
            <p className="mt-3 text-[15px] text-espresso/75 leading-[1.8]">
              Hand-painted, one panel at a time. Three tones &mdash; deep rose, wine, warm ivory &mdash; that arrange themselves differently on every set. Yours will not be the one in the photo. That is the point.
            </p>
          </div>
          <div>
            <div className="font-display text-xl text-wine">The fabric</div>
            <p className="mt-3 text-[15px] text-espresso/75 leading-[1.8]">
              A poly-satin heavy enough to fall properly. It moves when you walk. It does not stick when you sit. Nothing like the thin, shiny kind you may have been disappointed by before.
            </p>
          </div>
          <div>
            <div className="font-display text-xl text-wine">The fit</div>
            <p className="mt-3 text-[15px] text-espresso/75 leading-[1.8]">
              True to the sizing you already know from Zara or H&amp;M. If you are between, we usually say go down for the top and up for the skirt. Satin does not stretch.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-espresso text-ivory py-24">
        <div className="container-x max-w-4xl text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-champagne">How we work</div>
          <h2 className="font-display text-3xl md:text-5xl mt-3">Two hundred sets, then we begin again.</h2>
          <p className="mt-6 text-lg text-ivory/70 leading-relaxed max-w-2xl mx-auto">
            A drop lasts as long as it lasts. Every piece is looked at before it leaves the studio. Ships from Gurugram, free anywhere in India, seven days to return if it isn&apos;t right.
          </p>
        </div>
      </section>

      <CustomerPhotos />

      <section className="container-x py-20 bg-blush/10">
        <div className="text-center max-w-xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">Notes from buyers</div>
          <h2 className="font-display text-3xl md:text-5xl mt-3 text-espresso">What they told us after.</h2>
        </div>
        <div className="mt-12"><TestimonialsCarousel /></div>
      </section>

      <section className="container-x py-20 max-w-2xl">
        <h2 className="font-display text-3xl md:text-4xl text-espresso text-center">A few questions.</h2>
        <div className="mt-10 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="border-b border-taupe/20 pb-4 pt-4 group">
              <summary className="cursor-pointer flex justify-between text-espresso font-medium text-[15px]">
                {q}<span className="group-open:rotate-45 transition-transform text-wine">+</span>
              </summary>
              <p className="mt-3 text-sm text-espresso/70 leading-[1.8]">{a}</p>
            </details>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/faq" prefetch={false} className="text-sm underline text-wine">All the questions</Link>
        </div>
      </section>

      <section className="container-x pb-24">
        <div className="bg-blush/40 p-10 md:p-16 text-center max-w-3xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">The journal</div>
          <h2 className="font-display text-3xl md:text-4xl mt-3 text-espresso">On fabric, fit, and other quiet obsessions.</h2>
          <div className="mt-6">
            <Link href="/journal" prefetch={false} className="btn-secondary">Read a while</Link>
          </div>
        </div>
      </section>
    </>
  );
}
