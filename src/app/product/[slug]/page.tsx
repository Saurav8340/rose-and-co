import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductClient from './ProductClient';
import JsonLd from '@/components/JsonLd';
import { productSchema, breadcrumbSchema, faqSchema } from '@/lib/schemas';
import type { Metadata } from 'next';
import { SITE, getPrepaidPrice, getCodDeposit, getCodRemaining, getDisplayMrp } from '@/lib/constants';
import { inr } from '@/lib/format';

export const revalidate = 300;


export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true },
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch (err) {
    console.warn('DB not reachable at build time, using empty params', err);
    return [];
  }
}


export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, price: true, compareAt: true, images: true, slug: true },
  });
  if (!p) return { title: 'Product' };

  const mrp = getDisplayMrp(p.price, p.compareAt);
  const prepaidPrice = getPrepaidPrice(p.price);
  const codDeposit = getCodDeposit(p.price);
  const codRemaining = getCodRemaining(p.price);

  return {
    title: `${p.name} - ${inr(p.price)} (MRP ${inr(mrp)}) | ${SITE.name}`,
    description: `${p.description} MRP ${inr(mrp)}, selling at ${inr(p.price)}. Free shipping across India, ships from Gurugram in 24-48 hours. UPI prepaid ${inr(prepaidPrice)}. COD available (${inr(codDeposit)} online + ${inr(codRemaining)} on delivery).`,
    keywords: ['gothic clothing India', 'alt fashion India', 'corset top India', 'punk streetwear India', 'mesh fishnet fashion', p.name.toLowerCase()],
    openGraph: {
      title: p.name, description: p.description,
      images: JSON.parse(p.images).slice(0, 1).map((i: string) => ({ url: `${SITE.url}${i}` })),
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: p.name, description: p.description },
    alternates: { canonical: `/product/${p.slug}` },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) notFound();

  const images: string[] = JSON.parse(p.images);
  const sizes = JSON.parse(p.sizes);

  // FIX: `videos` was already saved correctly to the database by the admin
  // form, but this page never read the field at all — so even a product
  // with a real uploaded video showed nothing on the live PDP. Parsed
  // here the same safe way as images/sizes, defaulting to an empty array
  // if the field is missing/invalid rather than crashing the page.
  let videos: string[] = [];
  try {
    videos = p.videos ? JSON.parse(p.videos) : [];
  } catch {
    videos = [];
  }

  const mrp = getDisplayMrp(p.price, p.compareAt);
  const prepaidPrice = getPrepaidPrice(p.price);
  const codDeposit = getCodDeposit(p.price);
  const codRemaining = getCodRemaining(p.price);

  const productFaqs = [
    { q: 'Is the hardware actually metal?', a: 'Yes. Real D-rings, buckles, or chain depending on the piece — not a graphic printed on. Check the product description above for what this specific piece uses.' },
    { q: 'How does the sizing run?', a: 'True to size for most. Between sizes, check the size chart below — corsets and structured pieces fit differently from mesh and jersey.' },
    { q: 'How long does delivery take?', a: 'Ships from Gurugram within 24 to 48 hours of payment confirmation. Delivered in 3 to 5 business days to metros, 5 to 7 to smaller cities.' },
    { q: 'Can I style this with other pieces?', a: 'Yes — see the styling notes in the description above for what this piece pairs well with.' },
    { q: 'What is the difference between prepaid and COD?', a: `Prepaid via UPI is ${inr(prepaidPrice)}. Partial COD is ${inr(p.price)} total, split as ${inr(codDeposit)} online plus ${inr(codRemaining)} cash on delivery.` },
    { q: 'What is the MRP?', a: `MRP is ${inr(mrp)}. We sell at ${inr(p.price)} because we go direct to buyer and skip the retail markup.` },
  ];

  return (
    <>
      <JsonLd data={[
        productSchema({ id: p.id, slug: p.slug, name: p.name, description: p.description, price: p.price, images, sizes }),
        breadcrumbSchema([
          { name: 'Home', url: '/' }, { name: 'Shop', url: '/shop' },
          { name: p.name, url: `/product/${p.slug}` },
        ]),
        faqSchema(productFaqs),
      ]} />
      <ProductClient product={{
        id: p.id, slug: p.slug, name: p.name, description: p.description,
        price: p.price, compareAt: p.compareAt, images, sizes, videos,
      }} />
    </>
  );
}
