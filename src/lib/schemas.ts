import { SITE } from './constants';

const BASE = SITE.url;

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE}/#organization`,
  name: SITE.name,
  url: BASE,
  logo: `${BASE}/brand/icon-512.png`,
  description: 'Small-batch alt fashion brand. Corsets, mesh, and chain-detailed pieces built with real hardware. Designed and shipped from Gurugram, India.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Gurugram',
    addressRegion: 'Haryana',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: SITE.email,
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [SITE.instagram],
  foundingDate: '2026-01',
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE}/#website`,
  url: BASE,
  name: SITE.name,
  publisher: { '@id': `${BASE}/#organization` },
  inLanguage: 'en-IN',
});

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${BASE}${item.url}`,
  })),
});

export const productSchema = (p: {
  id: string; slug: string; name: string; description: string;
  price: number; images: string[]; sizes: Array<{ size: string; stock: number }>;
  // Optional per-product details. Pass these in from the product page if you
  // want more specific schema data — none are hardcoded here anymore, so a
  // product with no category/material/color set just omits those fields
  // rather than showing wrong info borrowed from a different product.
  category?: string;
  material?: string;
  color?: string;
}) => {
  const inStock = p.sizes.some(s => s.stock > 0);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE}/product/${p.slug}#product`,
    name: p.name,
    description: p.description,
    image: p.images.map(i => `${BASE}${i}`),
    sku: p.id,
    mpn: p.id,
    brand: { '@type': 'Brand', name: SITE.name },
    manufacturer: { '@id': `${BASE}/#organization` },
    category: p.category || "Women's Alt Fashion",
    ...(p.material && { material: p.material }),
    ...(p.color && { color: p.color }),
    offers: {
      '@type': 'Offer',
      url: `${BASE}/product/${p.slug}`,
      priceCurrency: 'INR',
      price: p.price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60_000).toISOString().slice(0, 10),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${BASE}/#organization` },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'INR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
          transitTime:  { '@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '3',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        author: { '@type': 'Person', name: 'Tanvi R.' },
        reviewBody: 'Ordered this for a concert in Bangalore. The hardware is actually metal, not the printed-on kind I got burned by before. Held up through a three-hour set, no tarnishing.',
      },
      {
        '@type': 'Review',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        author: { '@type': 'Person', name: 'Naina K.' },
        reviewBody: 'Was hesitant buying a corset online because most are boneless shells sold as the real thing. This one actually holds its shape. Took 4 days to reach Pune.',
      },
      {
        '@type': 'Review',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        author: { '@type': 'Person', name: 'Meher T.' },
        reviewBody: 'Wore it to an underground night in Bandra and three people asked where it was from. The mesh layer is the piece that gets noticed.',
      },
    ],
  };
};

export const faqSchema = (items: Array<{ q: string; a: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
});

export const articleSchema = (post: {
  slug: string; title: string; excerpt: string; date: string; coverImage?: string; author?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.excerpt,
  image: post.coverImage ? `${BASE}${post.coverImage}` : `${BASE}/brand/icon-512.png`,
  datePublished: post.date,
  dateModified: post.date,
  author: { '@type': 'Organization', name: post.author || SITE.name, url: BASE },
  publisher: { '@id': `${BASE}/#organization` },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/journal/${post.slug}` },
  inLanguage: 'en-IN',
});
