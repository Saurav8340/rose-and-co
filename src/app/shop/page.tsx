import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';
import JsonLd from '@/components/JsonLd';
import { collectionJsonLd, breadcrumbJsonLd, BRAND } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'New Arrivals | Rosé & Co',
  description: 'Corsets, mesh, chains, raw silhouettes. Small drops, no restock. Free shipping across India. Ships from Gurugram in 24-48 hours.',
  alternates: { canonical: `${BRAND.domain}/shop` },
  openGraph: {
    type: 'website',
    url: `${BRAND.domain}/shop`,
    title: 'The Rosé & Co Collection',
    description: 'Small drops. Once it\'s gone, it\'s gone.',
    siteName: BRAND.name,
    locale: 'en_IN',
  },
};

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    select: {
      slug: true,
      name: true,
      description: true,
      price: true,
      compareAt: true,
      images: true,
    },
  });

  const productForJsonLd = products.map((p) => {
    const imgs = JSON.parse(p.images) as string[];
    return { slug: p.slug, name: p.name, price: p.price, image: imgs[0] || '/products/amara-front.webp' };
  });

  return (
    <>
      <JsonLd
        data={[
          collectionJsonLd(productForJsonLd),
          breadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Shop', url: '/shop' },
          ]),
        ]}
      />

      <section className="container-x py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-crimson">New Arrivals</div>
          <h1 className="font-display text-4xl md:text-6xl mt-3 text-ivory">
            Small drops. Then we vanish.
          </h1>
          <p className="mt-6 text-ivory/70 leading-relaxed">
            Once it&apos;s gone, it&apos;s gone. Ships from Gurugram in twenty-four to forty-eight hours. Free anywhere in India.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-16 max-w-5xl mx-auto">
          {products.map((p) => {
            const imgs = JSON.parse(p.images) as string[];
            const discount = p.compareAt ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100) : 0;

            return (
              <Link key={p.slug} href={`/product/${p.slug}`} prefetch className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-blush/20">
                  <Image
                    src={imgs[0]}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top group-hover:scale-105 transition duration-700"
                  />
                  {discount > 0 && (
                    <span className="absolute top-4 right-4 bg-ivory text-wine text-xs font-semibold px-3 py-1 uppercase tracking-widest">
                      {discount}% off
                    </span>
                  )}
                </div>
                <div className="mt-6">
                  <h2 className="font-display text-2xl md:text-3xl text-ivory group-hover:text-crimson transition">
                    {p.name}
                  </h2>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-xl font-semibold text-crimson">{inr(p.price)}</span>
                    {p.compareAt && (
                      <span className="text-sm line-through text-ivory/40">{inr(p.compareAt)}</span>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-ivory/70 leading-relaxed line-clamp-3">
                    {p.description}
                  </p>
                  <span className="mt-4 inline-block text-sm underline text-ivory group-hover:text-crimson transition">
                    See the piece
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}




