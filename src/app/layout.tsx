import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import JsonLd from '@/components/JsonLd';
import { CartProvider } from '@/components/CartContext';
import { WishlistProvider } from '@/components/WishlistContext';
import GreetingBanner from '@/components/GreetingBanner';
import PersonalizedDiscount from '@/components/PersonalizedDiscount';
import SocialProof from '@/components/SocialProof';
import WhatsAppButton from '@/components/WhatsAppButton';
import { localBusinessJsonLd, BRAND } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.domain),
  title: {
    default: 'Rosé & Co - Hand-painted Marble Swirl Co-ord Sets',
    template: '%s | Rosé & Co',
  },
  description: 'Hand-painted marble swirl satin co-ord sets. Two hundred pieces per drop. Ships from Gurugram in 24-48 hours. Free shipping across India.',
  keywords: ['Rosé & Co', 'marble swirl co-ord', 'satin co-ord set', 'premium co-ord India', 'buy co-ord online India', 'Gurugram fashion brand'],
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  publisher: BRAND.name,
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BRAND.domain,
    siteName: BRAND.name,
    title: 'Rosé & Co - Hand-painted Marble Swirl Co-ord Sets',
    description: 'Two hundred sets. Then we begin again.',
    images: [{ url: `${BRAND.domain}/og-cover.jpg`, width: 1200, height: 630, alt: BRAND.name }],
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.postalpincode.in" />
      </head>
      <body>
        <JsonLd data={localBusinessJsonLd()} />
        <CartProvider>
          <WishlistProvider>
            <PersonalizedDiscount />
            <GreetingBanner />
            <Header />
            {children}
            <SocialProof />
            <WhatsAppButton />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
