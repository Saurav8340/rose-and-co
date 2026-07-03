import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductClient from './ProductClient';
import JsonLd from '@/components/JsonLd';
import { productSchema, breadcrumbSchema, faqSchema } from '@/lib/schemas';
import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

// Static-generate every product page. Regenerate on demand only.
export const revalidate = 300;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true },
  });
  return products.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, price: true, images: true, slug: true },
  });
  if (!p) return { title: 'Product' };
  return {
    title: `${p.name} - Rs ${p.price} - Hand-painted marble swirl satin`,
    description: `${p.description} Free shipping across India, ships from Delhi NCR in 24-48 hours. UPI prepaid Rs 1,399 (save Rs 100).`,
    keywords: ['satin co-ord set', 'marble print skirt set', 'poly-satin midi', 'indian D2C fashion', 'crop top skirt set', 'engagement outfit', 'party wear india', p.name.toLowerCase()],
    openGraph: {
      title: p.name,
      description: p.description,
      images: JSON.parse(p.images).slice(0, 1).map((i: string) => ({ url: `${SITE.url}${i}` })),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: p.name,
      description: p.description,
    },
    alternates: { canonical: `/product/${p.slug}` },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) notFound();

  const images: string[] = JSON.parse(p.images);
  const sizes = JSON.parse(p.sizes);

  const productFaqs = [
    { q: 'What is the fabric?', a: 'Poly-satin blend, around 90 to 100 GSM. Has weight, falls with drape. Not the thin shiny kind you see in Rs 500 satin.' },
    { q: 'Is the print really hand-painted?', a: 'Yes. Each panel is hand-painted before the fabric is cut. Your swirl pattern will look slightly different from the one in the photos.' },
    { q: 'How does the sizing run?', a: 'True to size for most women. Between sizes, size down for the top and up for the skirt.' },
    { q: 'How long does delivery take?', a: 'Ships from Delhi NCR within 24 to 48 hours of payment confirmation. Delivered in 3 to 5 business days to metros, 5 to 7 to smaller cities.' },
    { q: 'Can I wear the top separately?', a: 'Yes. Works with jeans, tailored trousers, or a plain skirt.' },
    { q: 'What is the difference between prepaid and COD?', a: 'Prepaid via UPI is Rs 1,399 (save Rs 100). Partial COD is Rs 1,499 total, split as Rs 299 online plus Rs 1,200 cash on delivery.' },
  ];

  return (
    <>
      <JsonLd data={[
        productSchema({
          id: p.id, slug: p.slug, name: p.name, description: p.description,
          price: p.price, images, sizes,
        }),
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Shop', url: '/' },
          { name: p.name, url: `/product/${p.slug}` },
        ]),
        faqSchema(productFaqs),
      ]} />
      <ProductClient product={{
        id: p.id, slug: p.slug, name: p.name, description: p.description,
        price: p.price, compareAt: p.compareAt, images, sizes,
      }} />
    </>
  );
}
