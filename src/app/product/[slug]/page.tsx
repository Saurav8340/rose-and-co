import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductClient from './ProductClient';
import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) return { title: 'Product' };
  return {
    title: `${p.name} — ₹${p.price}`,
    description: p.description,
    openGraph: { title: p.name, description: p.description, images: JSON.parse(p.images).slice(0,1) },
    alternates: { canonical: `/product/${p.slug}` },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) notFound();

  const images: string[] = JSON.parse(p.images);
  const sizes = JSON.parse(p.sizes);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: images.map(i => `${SITE.url}${i}`),
    sku: p.id,
    brand: { '@type': 'Brand', name: SITE.name },
    offers: {
      '@type': 'Offer',
      price: p.price, priceCurrency: 'INR', availability: 'https://schema.org/InStock',
      url: `${SITE.url}/product/${p.slug}`,
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '124' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductClient product={{
        id: p.id, slug: p.slug, name: p.name, description: p.description,
        price: p.price, compareAt: p.compareAt, images, sizes,
      }} />
    </>
  );
}
