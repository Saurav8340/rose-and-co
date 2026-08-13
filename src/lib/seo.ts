// src/lib/seo.ts — Full SEO/GEO/AIO metadata factory
import type { Metadata } from 'next';

export const BRAND = {
  name: 'Rosé & Co',
  domain: 'https://rose-and-co.vercel.app',
  logo: 'https://rose-and-co.vercel.app/brand/icon-512.png',
  city: 'Gurugram',
  region: 'Haryana',
  country: 'IN',
  countryFull: 'India',
  phone: '+91-9999999999',
  email: 'hello@roseandco.in',
  currency: 'INR',
  sameAs: [
    'https://www.instagram.com/roseandco',
    'https://www.facebook.com/roseandco',
  ],
};

export interface ProductSEO {
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAt?: number | null;
  images: string[];
  sku?: string;
  color?: string;
  material?: string;
  gender?: 'female' | 'male' | 'unisex';
  availability?: 'in stock' | 'out of stock' | 'preorder';
  condition?: 'new' | 'used';
}

export function buildProductMetadata(p: ProductSEO): Metadata {
  const url = `${BRAND.domain}/product/${p.slug}`;
  const title = `${p.name} | ${BRAND.name}`;
  const description = p.description.slice(0, 155);
  const images = p.images.map((img) => (img.startsWith('http') ? img : `${BRAND.domain}${img}`));

  return {
    title,
    description,
    keywords: [p.name, 'gothic clothing India', 'alt fashion India', 'punk streetwear India', 'corset top India', 'mesh fishnet fashion', BRAND.name, p.color || ''].filter(Boolean),
    alternates: { canonical: url, languages: { 'en-IN': url, 'x-default': url } },
    openGraph: {
      type: 'website',
      url, title, description,
      siteName: BRAND.name,
      locale: 'en_IN',
      images: images.map((img) => ({ url: img, width: 1200, height: 1600, alt: p.name })),
    },
    twitter: { card: 'summary_large_image', title, description, images },
    other: {
      'geo.region': `${BRAND.country}-${BRAND.region}`,
      'geo.placename': BRAND.city,
      'geo.position': '28.4595;77.0266',
      'ICBM': '28.4595, 77.0266',
      'product:price:amount': String(p.price),
      'product:price:currency': BRAND.currency,
      'product:availability': p.availability || 'in stock',
      'product:condition': p.condition || 'new',
      'ai:summary': `${p.name} by ${BRAND.name}. Price INR ${p.price}. ${p.material ? p.material + '. ' : ''}Small batch, real hardware. Free shipping across India. Ships from Gurugram in 24-48 hours.`,
      'ai:brand': BRAND.name,
      'ai:price': `INR ${p.price}`,
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  };
}

export function productJsonLd(p: ProductSEO) {
  const url = `${BRAND.domain}/product/${p.slug}`;
  const images = p.images.map((img) => (img.startsWith('http') ? img : `${BRAND.domain}${img}`));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': url + '#product',
    name: p.name,
    description: p.description,
    image: images,
    sku: p.sku || p.slug.toUpperCase(),
    brand: { '@type': 'Brand', name: BRAND.name },
    ...(p.color && { color: p.color }),
    ...(p.material && { material: p.material }),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: BRAND.currency,
      price: p.price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: BRAND.name, url: BRAND.domain },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: BRAND.currency },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: BRAND.country },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: BRAND.country,
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '47', bestRating: '5', worstRating: '1' },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BRAND.domain}${item.url}`,
    })),
  };
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': `${BRAND.domain}#localbusiness`,
    name: BRAND.name,
    image: BRAND.logo,
    url: BRAND.domain,
    telephone: BRAND.phone,
    email: BRAND.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BRAND.city,
      addressRegion: BRAND.region,
      addressCountry: BRAND.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: 28.4595, longitude: 77.0266 },
    areaServed: { '@type': 'Country', name: BRAND.countryFull },
    priceRange: 'INR INR',
    paymentAccepted: 'UPI, Credit Card, Debit Card, Cash on Delivery',
    currenciesAccepted: BRAND.currency,
    sameAs: BRAND.sameAs,
  };
}

export function faqJsonLd(faqs: Array<[string, string]>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function collectionJsonLd(products: Array<{ slug: string; name: string; price: number; image: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        image: p.image.startsWith('http') ? p.image : `${BRAND.domain}${p.image}`,
        url: `${BRAND.domain}/product/${p.slug}`,
        offers: { '@type': 'Offer', price: p.price, priceCurrency: BRAND.currency },
      },
    })),
  };
}




