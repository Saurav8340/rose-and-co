import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';
import TrustBar from '@/components/TrustBar';
import JsonLd from '@/components/JsonLd';
import CustomerPhotos from '@/components/CustomerPhotos';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import { organizationSchema, websiteSchema } from '@/lib/schemas';

// ISR — regenerate every 5 minutes at most
export const revalidate = 300;

export default async function HomePage() {
  const product = await prisma.product.findUnique({
    where: { slug: 'amara-marble-swirl-coord-set' },
    select: { name: true, price: true, images: true },
  });
  const images: string[] = product ? JSON.parse(product.images) : [];
  const hero = images[0] || '/products/amara-front.png';

  const faqs: [string, string][] = [
    ['How fast do you actually ship?', 'From our Gurugram unit within 24 to 48 hours after payment clears. Metros get it in 3 to 5 working days (Delhivery), tier-2 cities in 5 to 7.'],
    ['Do you have COD?', 'Partial only. Rs 299 upfront on UPI, Rs 1,200 in cash to the delivery boy. Full COD had a 30% return rate for us in testing, so we stopped it.'],
    ['Tell me about the fabric.', 'Poly-satin blend, 90 to 100 GSM. Falls with weight, doesn\'t stick to your body. Not the cheap slippery kind you get at Rs 500.'],
    ['What if the size is wrong?', 'Free reverse pickup within 7 days. Tags on, unworn. Refund lands in 5 to 7 working days after we get it back.'],
  ];

  const facts = [
    { n: '200',    t: 'sets per drop', d: 'That is it. When your size is out, wait for the next drop. No restock guilt trips.' },
    { n: '24-48',  t: 'hour dispatch', d: 'Real numbers from our Delhivery pickup data. Not marketing.' },
    { n: 'Every',  t: 'set checked',   d: 'Loose threads, print smudges, missing labels &mdash; we catch them before it leaves the studio.' },
    { n: '7 days', t: 'to return',     d: 'Free pickup by Delhivery. Refund in 5 to 7 working days.' },
  ];

  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />

      <section className="relative bg-blush/40">
        <div className="container-x grid md:grid-cols-2 gap-8 items-center py-12 md:py-20">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-wine mb-4">New drop &middot; Amara</div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-espresso">
              Poured in ros&eacute;.<br/>Worn in fire.
            </h1>
            <p className="mt-6 text-lg text-espresso/70 max-w-md leading-relaxed">
              Crop top, high-waist A-line midi. Hand-painted marble swirl on satin that actually has weight. 200 sets, then it&apos;s done.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link href="/product/amara-marble-swirl-coord-set" prefetch className="btn-primary">Shop Amara &mdash; {product ? inr(product.price) : 'Rs 1,499'}</Link>
              <Link href="/product/amara-marble-swirl-coord-set" prefetch className="text-sm underline text-espresso">See fabric + fit</Link>
            </div>
            <div className="mt-8 flex gap-6 text-xs uppercase tracking-widest text-espresso/60">
              <span>Free shipping</span><span>GST included</span><span>Ships in 24-48 hrs</span>
            </div>
          </div>
          <div className="relative aspect-[3/4] md:aspect-[4/5] max-w-lg mx-auto w-full">
            <Image
              src={hero}
              alt="Amara Marble Swirl Co-ord Set"
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              placeholder="empty"
            />
            <div className="absolute top-4 right-4 badge bg-wine text-ivory">New drop</div>
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="container-x py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">The Amara set</div>
          <h2 className="font-display text-3xl md:text-5xl mt-3 text-espresso">Three things to know</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-8 bg-blush/20 border border-taupe/10">
            <div className="font-display text-xl text-wine">The print</div>
            <p className="mt-2 text-sm text-espresso/70 leading-relaxed">
              Hand-painted, three tones &mdash; deep rose, wine, warm ivory. Every set is slightly different. Yours will not be identical to the photos. That is the point.
            </p>
          </div>
          <div className="p-8 bg-blush/20 border border-taupe/10">
            <div className="font-display text-xl text-wine">The fabric</div>
            <p className="mt-2 text-sm text-espresso/70 leading-relaxed">
              Poly-satin, 90 to 100 GSM. Falls, doesn&apos;t cling. If you\'ve bought a Rs 500 satin skirt off Meesho and been disappointed, this is not that.
            </p>
          </div>
          <div className="p-8 bg-blush/20 border border-taupe/10">
            <div className="font-display text-xl text-wine">The fit</div>
            <p className="mt-2 text-sm text-espresso/70 leading-relaxed">
              True to Zara / H&amp;M sizing. Between XS and S, go XS. Between S and M, go S. Model is 5&apos;7&quot; wearing size S.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-espresso text-ivory py-20">
        <div className="container-x">
          <div className="text-xs uppercase tracking-[0.3em] text-champagne text-center">How we work</div>
          <h2 className="font-display text-4xl md:text-5xl text-center mt-3">Four facts about us</h2>
          <div className="grid md:grid-cols-4 gap-8 mt-12">
            {facts.map(x => (
              <div key={x.t}>
                <div className="text-5xl font-display text-champagne">{x.n}</div>
                <div className="mt-2 uppercase tracking-widest text-sm">{x.t}</div>
                <p className="text-sm text-ivory/60 mt-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: x.d }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CustomerPhotos />

      <section className="container-x py-16 bg-blush/10">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">From buyers</div>
          <h2 className="font-display text-4xl md:text-5xl mt-3 text-espresso">What they told us after wearing it</h2>
          <p className="mt-3 text-sm text-espresso/60">Verified orders. Emails and DMs, lightly edited for length.</p>
        </div>
        <div className="mt-10">
          <TestimonialsCarousel />
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="text-center font-display text-3xl md:text-4xl text-espresso">Common questions</h2>
        <div className="max-w-2xl mx-auto mt-10 space-y-4">
          {faqs.map(([q, a]) => (
            <details key={q} className="border border-taupe/20 p-4 group bg-white">
              <summary className="cursor-pointer flex justify-between text-espresso font-medium">{q}<span className="group-open:rotate-45 transition-transform">+</span></summary>
              <p className="mt-2 text-sm text-espresso/70 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/faq" prefetch={false} className="text-sm underline text-wine">See all questions</Link>
        </div>
      </section>

      <section className="container-x pb-24">
        <div className="bg-blush/40 border border-taupe/20 p-8 md:p-12 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">The journal</div>
          <h2 className="font-display text-3xl md:text-4xl mt-3 text-espresso">On fabric, styling, and what other brands are actually doing</h2>
          <p className="mt-3 text-espresso/70 max-w-xl mx-auto">
            We test our competitors and write about it. Also fabric science, styling for Indian body types, and the occasional rant.
          </p>
          <div className="mt-6">
            <Link href="/journal" prefetch={false} className="btn-secondary">Read the Journal &rarr;</Link>
          </div>
        </div>
      </section>
    </>
  );
}
