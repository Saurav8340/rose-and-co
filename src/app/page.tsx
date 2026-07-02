import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';
import TrustBar from '@/components/TrustBar';

export const revalidate = 60;

export default async function HomePage() {
  const product = await prisma.product.findUnique({ where: { slug: 'amara-marble-swirl-coord-set' } });
  const images: string[] = product ? JSON.parse(product.images) : [];
  const hero = images[0] || '/products/amara-front.png';

  const reviews = [
    {
      n: 'Ananya S.', c: 'Pune',
      r: 'Ordered for my sister\'s engagement roka. Went with M based on the size chart, fit was accurate. Waistband did not dig in even after a long night. Took 4 days to reach Pune.',
    },
    {
      n: 'Riya K.', c: 'Bangalore',
      r: 'Was hesitant about buying satin online because most brands send you thin synthetic stuff. This one has actual weight to it. Print looks better in person than in photos.',
    },
    {
      n: 'Meher T.', c: 'Mumbai',
      r: 'Wore it to a dinner in Bandra and three people asked where it was from. Skirt is the star — the way it falls when you walk.',
    },
  ];

  const faqs: [string, string][] = [
    ['How long does delivery actually take?', 'Ships from Delhi NCR in 24–48 hours. Delivered in 3–5 business days for metros, 5–7 for smaller cities. Tracking link comes via SMS when it leaves us.'],
    ['Is COD available?', 'Partial COD only. ₹300 online via UPI + ₹1,199 in cash on delivery. We do not do full COD — it kept our RTO rates too high and pushed prices up.'],
    ['What is the fabric like?', 'Poly-satin blend, around 90–100 GSM. Has weight, falls with drape. Feels closer to real silk satin than the shiny cheap kind you see in fast fashion.'],
    ['Can I return it?', 'Yes, within 7 days of delivery. Tags on, unworn, unwashed. We arrange reverse pickup — you do not have to courier it back yourself.'],
  ];

  const facts = [
    { n: '200',    t: 'sets per drop',   d: 'Small batch. When your size sells out, it is gone until the next drop.' },
    { n: '24–48',  t: 'hour dispatch',   d: 'Packed and handed to the courier from our Delhi NCR unit within 2 working days.' },
    { n: '100%',   t: 'inspected',       d: 'Every set is checked for print quality, stitching, and loose threads before it ships.' },
    { n: '7 days', t: 'to return',       d: 'Free reverse pickup. Refund lands in 5–7 working days after we receive it.' },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative bg-blush/40">
        <div className="container-x grid md:grid-cols-2 gap-8 items-center py-12 md:py-20">
          <div className="animate-fade-in">
            <div className="text-xs uppercase tracking-[0.3em] text-wine mb-4">✦ New drop · Amara</div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-espresso">
              Poured in rosé.<br/>Worn in fire.
            </h1>
            <p className="mt-6 text-lg text-espresso/70 max-w-md leading-relaxed">
              Fitted crop top + high-waist A-line midi skirt in hand-painted marble swirl satin. 200 sets in this drop.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link href="/product/amara-marble-swirl-coord-set" className="btn-primary">Shop Amara — {product ? inr(product.price) : '₹1,499'}</Link>
              <Link href="/product/amara-marble-swirl-coord-set" className="text-sm underline text-espresso">See fabric + fit</Link>
            </div>
            <div className="mt-8 flex gap-6 text-xs uppercase tracking-widest text-espresso/60">
              <span>✦ Free shipping</span><span>✦ GST included</span><span>✦ Ships in 24–48 hrs</span>
            </div>
          </div>
          <div className="relative aspect-[3/4] md:aspect-[4/5] max-w-lg mx-auto w-full">
            <Image src={hero} alt="Amara Marble Swirl Co-ord Set" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            <div className="absolute top-4 right-4 badge bg-wine text-ivory">🌹 New drop</div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* WHAT MAKES IT DIFFERENT */}
      <section className="container-x py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">The Amara set</div>
          <h2 className="font-display text-3xl md:text-5xl mt-3 text-espresso">Three things to know</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-8 bg-blush/20 border border-taupe/10">
            <div className="font-display text-xl text-wine">The print</div>
            <p className="mt-2 text-sm text-espresso/70 leading-relaxed">
              Hand-painted marble swirl in three tones — deep rose, wine, warm ivory. Because it is hand-painted, no two sets look identical. Yours will be slightly different from the photos.
            </p>
          </div>
          <div className="p-8 bg-blush/20 border border-taupe/10">
            <div className="font-display text-xl text-wine">The fabric</div>
            <p className="mt-2 text-sm text-espresso/70 leading-relaxed">
              Poly-satin blend, around 90–100 GSM. Has weight to it. Falls close to the body without clinging. Not the stiff kind that crumples the moment you sit down.
            </p>
          </div>
          <div className="p-8 bg-blush/20 border border-taupe/10">
            <div className="font-display text-xl text-wine">The fit</div>
            <p className="mt-2 text-sm text-espresso/70 leading-relaxed">
              Fitted top, A-line midi skirt. True to size for most women. If you are between sizes, size down for the top and up for the skirt. Model is 5ft 7in in size S.
            </p>
          </div>
        </div>
      </section>

      {/* FOUR FACTS */}
      <section className="bg-espresso text-ivory py-20">
        <div className="container-x">
          <div className="text-xs uppercase tracking-[0.3em] text-champagne text-center">How we work</div>
          <h2 className="font-display text-4xl md:text-5xl text-center mt-3">Four facts about us</h2>
          <div className="grid md:grid-cols-4 gap-8 mt-12">
            {facts.map(x => (
              <div key={x.t}>
                <div className="text-5xl font-display text-champagne">{x.n}</div>
                <div className="mt-2 uppercase tracking-widest text-sm">{x.t}</div>
                <p className="text-sm text-ivory/60 mt-2 leading-relaxed">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="container-x py-20">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">What buyers say</div>
          <h2 className="font-display text-4xl md:text-5xl mt-3 text-espresso">Notes from the first drop</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {reviews.map((r, i) => (
            <div key={i} className="p-6 border border-taupe/20 bg-ivory">
              <div className="text-wine">★★★★★</div>
              <p className="mt-3 text-espresso italic leading-relaxed">&ldquo;{r.r}&rdquo;</p>
              <div className="mt-4 text-xs uppercase tracking-widest text-espresso/60">— {r.n}, {r.c}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW ORDERING WORKS */}
      <section className="bg-blush/30 py-16">
        <div className="container-x">
          <h2 className="text-center font-display text-3xl md:text-4xl text-espresso">How ordering works</h2>
          <div className="grid md:grid-cols-4 gap-6 mt-10">
            {[
              ['Pick size',   'XS to XXL, size chart on product page'],
              ['Quick check', 'Type the captcha on screen'],
              ['Pay via UPI', 'GPay, PhonePe, Paytm, any UPI app'],
              ['Delivered',   '3–5 days to metros, 5–7 to tier-2 cities'],
            ].map(([t, d], i) => (
              <div key={t} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-wine text-ivory font-display text-xl flex items-center justify-center">{i+1}</div>
                <div className="mt-3 uppercase tracking-widest text-sm text-espresso">{t}</div>
                <div className="mt-1 text-xs text-espresso/60">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ TEASER */}
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
          <Link href="/faq" className="text-sm underline text-wine">See all questions</Link>
        </div>
      </section>

      {/* CLOSING BAND */}
      <section className="container-x pb-24">
        <div className="bg-blush/40 border border-taupe/20 p-8 md:p-12 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">Ready?</div>
          <h2 className="font-display text-3xl md:text-4xl mt-3 text-espresso">Amara is live. 200 sets total.</h2>
          <p className="mt-3 text-espresso/70 max-w-xl mx-auto">
            Sizes available now: XS, S, M, L, XL. Once your size sells out, it stays out until the next batch.
          </p>
          <div className="mt-6">
            <Link href="/product/amara-marble-swirl-coord-set" className="btn-primary">Shop Amara — {product ? inr(product.price) : '₹1,499'}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
