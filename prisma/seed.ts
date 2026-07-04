import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.product.upsert({
    where: { slug: 'amara-marble-swirl-coord-set' },
    update: {
      name: 'Amara Marble Swirl Co-ord Set',
      description: 'Fitted crop top and high-waist A-line midi skirt in hand-painted marble swirl satin. Deep rose, wine and warm ivory tones on a poly-satin blend (95-105 GSM). Every set is one of a kind. Free shipping across India, ships from Gurugram in 24-48 hours. UPI prepaid: Rs 1,900 (save Rs 100). MRP Rs 3,499.',
      price: 2000,
      compareAt: 3499,
      active: true,
    },
    create: {
      slug: 'amara-marble-swirl-coord-set',
      name: 'Amara Marble Swirl Co-ord Set',
      description: 'Fitted crop top and high-waist A-line midi skirt in hand-painted marble swirl satin. Deep rose, wine and warm ivory tones on a poly-satin blend (95-105 GSM). Every set is one of a kind. Free shipping across India, ships from Gurugram in 24-48 hours. UPI prepaid: Rs 1,900 (save Rs 100). MRP Rs 3,499.',
      price: 2000,
      compareAt: 3499,
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
  console.log('Seeded Amara: MRP 3499, SP 2000, Prepaid 1900, COD 299+1701.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
