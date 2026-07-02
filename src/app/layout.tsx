import type { Metadata } from 'next';
import Script from 'next/script';
import { headers } from 'next/headers';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import UtmCapture from '@/components/UtmCapture';
import { CartProvider } from '@/components/CartContext';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: 'Small-batch co-ord sets in hand-painted marble prints. Ships from Delhi NCR in 24-48 hours. Free shipping across India. Prepay via UPI, save ₹100.',
  keywords: ['co-ord set', 'marble print', 'satin skirt', 'party wear india', 'rose and co', 'amara set'],
  openGraph: {
    title: SITE.name, description: SITE.tagline,
    url: SITE.url, siteName: SITE.name, locale: 'en_IN', type: 'website',
  },
  twitter: { card: 'summary_large_image', title: SITE.name, description: SITE.tagline },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const gtmId   = process.env.NEXT_PUBLIC_GTM_ID;
  const ga4Id   = process.env.NEXT_PUBLIC_GA4_ID;

  const h = headers();
  const pathname = h.get('x-invoke-path') || h.get('x-pathname') || '';
  const isAdminRoute = pathname.startsWith('/admin');

  const loadPixel = !!pixelId && !isAdminRoute;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        {loadPixel && (
          <>
            <Script id="fb-pixel" strategy="afterInteractive">{`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','${pixelId}'); fbq('track','PageView');
            `}</Script>
            <noscript><img height="1" width="1" style={{display:'none'}} alt="" src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`} /></noscript>
          </>
        )}
        {gtmId && !isAdminRoute && (
          <Script id="gtm" strategy="afterInteractive">{`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');
          `}</Script>
        )}
        {ga4Id && !isAdminRoute && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">{`
              window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','${ga4Id}');
            `}</Script>
          </>
        )}
        <CartProvider>
          <UtmCapture />
          <AnnouncementBar />
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
