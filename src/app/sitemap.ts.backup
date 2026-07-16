import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const DOMAIN = 'https://rose-and-co.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });

  const productUrls = products.map((p) => ({
    url: `${DOMAIN}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [
    { url: DOMAIN, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${DOMAIN}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${DOMAIN}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${DOMAIN}/journal`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ...productUrls,
  ];
}
