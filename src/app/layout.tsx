import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { CartProvider } from '@/components/CartContext';
import { WishlistProvider } from '@/components/WishlistContext';
import GreetingBanner from '@/components/GreetingBanner';
import PersonalizedDiscount from '@/components/PersonalizedDiscount';
import SocialProof from '@/components/SocialProof';
import WhatsAppButton from '@/components/WhatsAppButton';
import LeadCaptureChip from '@/components/LeadCaptureChip';
import CartAbandonmentTracker from '@/components/CartAbandonmentTracker';
import { localBusinessJsonLd, BRAND } from '@/lib/seo';
import MetaPixel from '@/components/MetaPixel';

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.domain),
  title: {
    default: 'Rosé & Co - Hand-painted Marble Swirl Co-ord Sets',
    template: '%s | Rosé & Co',
  },
  description: 'Hand-painted marble swirl satin co-ord sets. Ships from Gurugram in 24-48 hours. Free shipping across India.',
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
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        
        
        <link rel="dns-prefetch" href="https://api.postalpincode.in" />
      </head>
      <body>
      <MetaPixel />
        <a href="#main-content" className="skip-link">Skip to main content</a>

        <JsonLd data={localBusinessJsonLd()} />
        <CartProvider>
          <WishlistProvider>
            <PersonalizedDiscount />
            <GreetingBanner />
            <Header />
            <main id="main-content" role="main">
              {children}
            </main>
            <Footer />
            <SocialProof />
            <WhatsAppButton />
            <LeadCaptureChip />
            <CartAbandonmentTracker />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
