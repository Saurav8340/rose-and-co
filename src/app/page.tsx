import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';
import { getDisplayMrp } from '@/lib/constants';
import TrustBar from '@/components/TrustBar';
import JsonLd from '@/components/JsonLd';
import CustomerPhotos from '@/components/CustomerPhotos';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import HeroSlideshow from '@/components/HeroSlideshow';
import { organizationSchema, websiteSchema } from '@/lib/schemas';

export const revalidate = 300;

// Products are fully dynamic from the database — no per-slug hardcoded
// copy. Every product uses this same fallback hero text until/unless you
// want to give a specific drop its own tagline later.
const FALLBACK_EDITORIAL = {
  tagline: 'New drop',
  title: 'Join The Coven',
  sub: 'Raw silhouettes, chains, and mesh. Small pieces, then they\'re gone. Ships from Gurugram.',
};

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    select: {
      slug: true,
      name: true,
      price: true,
      compareAt: true,
      images: true,
    },
  });

  // FIX (homepage hero = auto-updating slideshow of live products):
  // this was already pulling from the database correctly and already
  // updates automatically whenever a product is added/edited/removed in
  // admin — nothing was actually broken here. The one real gap: if a
  // product's `images` field was ever an empty array (e.g. a draft saved
  // before any photos were uploaded), it silently fell back to the old,
  // deleted 'amara-front.webp' file — a broken image on the live hero.
  // Fixed by skipping any product with zero images from the slideshow
  // entirely, and by only including the first 5 most recent products so
  // the hero doesn't get overcrowded as your catalog grows — every live
  // product still get its full spot on the grid section further down
  // this same page, and on /shop.
  const slides = products
    .map((p) => {
      const imgs = JSON.parse(p.images) as string[];
      return {
        slug: p.slug,
        name: p.name,
        hero: imgs[0] || '',
        price: p.price,
        mrp: getDisplayMrp(p.price, p.compareAt),
        tagline: FALLBACK_EDITORIAL.tagline,
        title: FALLBACK_EDITORIAL.title,
        sub: FALLBACK_EDITORIAL.sub,
      };
    })
    .filter((s) => s.hero) // skip any product with no real photo yet
    .slice(0, 5);

  const faqs = [
    ['When will it arrive?', 'Metros, three to five working days. Smaller cities, five to seven. Ships from Gurugram within forty-eight hours of your order.'],
    ['Is cash on delivery available?', 'Partial. A small deposit at the door, the rest in cash when it arrives.'],
    ['What\'s the construction like?', 'Real hardware — metal D-rings and buckles, not printed-on graphics. Mesh and jersey pieces have weight to them. Nothing paper-thin.'],
    ['What if the size is wrong?', 'Seven days to return. Free pickup. Refund lands in a week.'],
  ];

  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />

      <HeroSlideshow slides={slides} />

      <TrustBar />

      <section className="container-x py-20" aria-labelledby="collection-heading">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">For The Unbothered</div>
          <h2 id="collection-heading" className="font-display text-3xl md:text-5xl mt-3 text-ivory">
            Not for everyone.
          </h2>
          <p className="mt-4 text-ivory/70">
            That&apos;s the point.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-14 max-w-5xl mx-auto">
          {products.map((p) => {
            const imgs = JSON.parse(p.images) as string[];
            const discount = p.compareAt
              ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100)
              : 0;

            return (
              <Link
                key={p.slug}
                href={`/product/${p.slug}`}
                prefetch
                aria-label={`View the ${p.name} product page, priced at ${inr(p.price)}`}
                className="group block"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-blush/20">
                  <Image
                    src={imgs[0]}
                    alt={`${p.name} — Rosé & Co`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top group-hover:scale-105 transition duration-700"
                  />
                  {discount > 0 && (
                    <span
                      className="absolute top-4 right-4 bg-ivory text-wine text-xs font-semibold px-3 py-1 uppercase tracking-widest"
                      aria-label={`${discount} percent off`}
                    >
                      {discount}% off
                    </span>
                  )}
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-2xl text-ivory">{p.name}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-semibold text-wine">{inr(p.price)}</span>
                      {p.compareAt && (
                        <span className="text-sm line-through text-ivory/40" aria-label={`Original price ${inr(p.compareAt)}`}>
                          {inr(p.compareAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className="text-sm underline text-ivory group-hover:text-wine transition"
                    aria-hidden="true"
                  >
                    See the piece
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-x pb-20" aria-labelledby="details-heading">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">The build</div>
          <h2 id="details-heading" className="font-display text-3xl md:text-5xl mt-3 text-ivory">Three things worth knowing.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mt-14 max-w-5xl mx-auto">
          <div>
            <div className="font-display text-xl text-wine">The hardware</div>
            <p className="mt-3 text-[15px] text-ivory/75 leading-[1.8]">
              Real metal D-rings and buckles, not painted-on graphics. It holds weight. It doesn&apos;t flake off after one wash.
            </p>
          </div>
          <div>
            <div className="font-display text-xl text-wine">The fabric</div>
            <p className="mt-3 text-[15px] text-ivory/75 leading-[1.8]">
              Mesh and jersey with actual weight to them. It moves when you walk. It doesn&apos;t go see-through the first time it stretches.
            </p>
          </div>
          <div>
            <div className="font-display text-xl text-wine">The fit</div>
            <p className="mt-3 text-[15px] text-ivory/75 leading-[1.8]">
              True to the sizing you already know from Zara or H&amp;M. If you&apos;re between sizes, check the piece-specific notes on the product page.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-blush text-ivory py-24" aria-labelledby="how-heading">
        <div className="container-x max-w-4xl text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-champagne">How we work</div>
          <h2 id="how-heading" className="font-display text-3xl md:text-5xl mt-3">Small drops. Then we vanish.</h2>
          <p className="mt-6 text-lg text-ivory/70 leading-relaxed max-w-2xl mx-auto">
            A drop lasts as long as it lasts. Every piece is checked before it leaves the studio. Ships from Gurugram, free anywhere in India, seven days to return if it isn&apos;t right.
          </p>
        </div>
      </section>

      <CustomerPhotos />

      <section className="container-x py-20 bg-blush/10" aria-labelledby="reviews-heading">
        <div className="text-center max-w-xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">Notes from buyers</div>
          <h2 id="reviews-heading" className="font-display text-3xl md:text-5xl mt-3 text-ivory">What they told us after.</h2>
        </div>
        <div className="mt-12"><TestimonialsCarousel /></div>
      </section>

      <section className="container-x py-20 max-w-2xl" aria-labelledby="faqs-heading">
        <h2 id="faqs-heading" className="font-display text-3xl md:text-4xl text-ivory text-center">A few questions.</h2>
        <div className="mt-10 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="border-b border-taupe/20 pb-4 pt-4 group">
              <summary className="cursor-pointer flex justify-between text-ivory font-medium text-[15px]">
                {q}<span className="group-open:rotate-45 transition-transform text-wine" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 text-sm text-ivory/70 leading-[1.8]">{a}</p>
            </details>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/faq"
            prefetch={false}
            aria-label="Read all frequently asked questions"
            className="text-sm underline text-wine"
          >
            All the questions
          </Link>
        </div>
      </section>

      <section className="container-x pb-24" aria-labelledby="journal-heading">
        <div className="bg-blush/40 p-10 md:p-16 text-center max-w-3xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">The journal</div>
          <h2 id="journal-heading" className="font-display text-3xl md:text-4xl mt-3 text-ivory">Notes from the dark side.</h2>
          <div className="mt-6">
            <Link
              href="/journal"
              prefetch={false}
              aria-label="Read the Rosé and Co journal"
              className="btn-secondary"
            >
              Read a while
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
