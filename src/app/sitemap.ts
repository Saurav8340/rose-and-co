import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getAllPosts } from '@/lib/journal';

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

  const posts = getAllPosts();
  const postUrls = posts.map((post) => ({
    url: `${DOMAIN}/journal/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const collections = ['corsets', 'mesh-fishnet', 'hardware', 'bottoms'].map((slug) => ({
    url: `${DOMAIN}/collections/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const staticPages = [
    { url: DOMAIN, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${DOMAIN}/shop`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${DOMAIN}/journal`, priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${DOMAIN}/faq`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${DOMAIN}/about`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${DOMAIN}/size-guide`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${DOMAIN}/fabric-guide`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${DOMAIN}/care-guide`, priority: 0.5, changeFrequency: 'monthly' as const },
  ].map((s) => ({ ...s, lastModified: new Date() }));

  return [...staticPages, ...collections, ...productUrls, ...postUrls];
}




