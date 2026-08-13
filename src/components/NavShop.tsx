import { prisma } from '@/lib/prisma';
import ShopDropdown from './ShopDropdown';

export default async function NavShop() {
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

  const items = products.map((p) => {
    const imgs = JSON.parse(p.images) as string[];
    return {
      slug: p.slug,
      name: p.name,
      price: p.price,
      compareAt: p.compareAt,
      image: imgs[0] || '/products/amara-front.webp',
      tagline: 'Small batch. Real hardware.',
    };
  });

  return <ShopDropdown products={items} />;
}
