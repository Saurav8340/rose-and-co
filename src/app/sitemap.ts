import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({ where: { active: true } });
  const staticPaths = ['', '/about', '/contact', '/faq', '/privacy-policy', '/refund-policy', '/shipping-policy', '/terms', '/cancellation-policy', '/track', '/search'];
  return [
    ...staticPaths.map(p => ({ url: `${SITE.url}${p}`, lastModified: new Date() })),
    ...products.map(p => ({ url: `${SITE.url}/product/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
