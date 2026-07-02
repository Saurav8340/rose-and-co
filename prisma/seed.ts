import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.product.upsert({
    where: { slug: 'amara-marble-swirl-coord-set' },
    update: {
      name: 'Amara Marble Swirl Co-ord Set',
      description: 'Fitted crop top and high-waist A-line midi skirt in hand-painted marble swirl satin. Deep rose, wine and warm ivory tones on a poly-satin blend (about 90–100 GSM). Every set is one of a kind. Free shipping across India, ships from Delhi NCR in 24–48 hours. UPI prepaid: ₹1,399 (save ₹100).',
      price: 1499,
      compareAt: 2499,
      active: true,
    },
    create: {
      slug: 'amara-marble-swirl-coord-set',
      name: 'Amara Marble Swirl Co-ord Set',
      description: 'Fitted crop top and high-waist A-line midi skirt in hand-painted marble swirl satin. Deep rose, wine and warm ivory tones on a poly-satin blend (about 90–100 GSM). Every set is one of a kind. Free shipping across India, ships from Delhi NCR in 24–48 hours. UPI prepaid: ₹1,399 (save ₹100).',
      price: 1499,
      compareAt: 2499,
      images: JSON.stringify([
        '/products/amara-front.png',
        '/products/amara-back.png',
        '/products/amara-left.png',
        '/products/amara-right.png',
        '/products/amara-fabric.png',
      ]),
      sizes: JSON.stringify([
        { size: 'XS',  stock: 8 },
        { size: 'S',   stock: 12 },
        { size: 'M',   stock: 15 },
        { size: 'L',   stock: 10 },
        { size: 'XL',  stock: 6 },
        { size: 'XXL', stock: 0 },
      ]),
      active: true,
    },
  });
  console.log('Seeded / updated Amara Co-ord Set.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
