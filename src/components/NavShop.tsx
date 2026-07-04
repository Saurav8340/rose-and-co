import { prisma } from '@/lib/prisma';
import ShopDropdown from './ShopDropdown';

const TAGLINES: Record<string, string> = {
  'amara-marble-swirl-coord-set': 'Poured in rosé. Worn in fire.',
  'aarna-beige-marble-swirl-coord-set': 'Cast in caramel. Kept in calm.',
};

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
      image: imgs[0] || '/products/amara-front.png',
      tagline: TAGLINES[p.slug] || 'One-of-a-kind. Handcrafted in India.',
    };
  });

  return <ShopDropdown products={items} />;
}
