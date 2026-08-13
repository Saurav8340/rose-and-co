import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const orderId = searchParams.id;

  // Get other products to upsell
  const otherProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
    select: { slug: true, name: true, price: true, compareAt: true, images: true },
  });

  return (
    <main className="container-x py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-6xl mb-4">🖤</div>
        <div className="text-xs uppercase tracking-[0.3em] text-crimson mb-2">Order confirmed</div>
        <h1 className="font-display text-4xl md:text-5xl text-ivory mb-4">
          Thank you.
        </h1>
        <p className="text-ivory/70 max-w-md mx-auto mb-2">
          Your order is being prepared. We ship from Gurugram in twenty-four to forty-eight hours.
        </p>
        {orderId && (
          <p className="text-xs text-ivory/60 font-mono">
            Order ID: {orderId}
          </p>
        )}

        {/* What happens next */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-blush/40 p-6">
            <div className="text-xs uppercase tracking-widest text-crimson mb-2">1 · Today</div>
            <p className="text-sm text-ivory">
              Confirmation on WhatsApp with order details.
            </p>
          </div>
          <div className="bg-blush/40 p-6">
            <div className="text-xs uppercase tracking-widest text-crimson mb-2">2 · 24-48 hrs</div>
            <p className="text-sm text-ivory">
              Tracking link once we hand it to Delhivery.
            </p>
          </div>
          <div className="bg-blush/40 p-6">
            <div className="text-xs uppercase tracking-widest text-crimson mb-2">3 · 3-7 days</div>
            <p className="text-sm text-ivory">
              At your door. Reply with a photo if you love it.
            </p>
          </div>
        </div>

        {/* Upsell — complete the look */}
        <div className="mt-16 text-left">
          <div className="text-xs uppercase tracking-[0.3em] text-crimson mb-2 text-center">
            While you wait
          </div>
          <h2 className="font-display text-2xl md:text-3xl text-ivory mb-8 text-center">
            Something else to love.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {otherProducts.map((p) => {
              const imgs = JSON.parse(p.images) as string[];
              return (
                <Link
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  prefetch
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-blush/20">
                    <Image
                      src={imgs[0]}
                      alt={p.name}
                      fill
                      sizes="200px"
                      className="object-cover object-top group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-ivory group-hover:text-crimson truncate">
                      {p.name}
                    </h3>
                    <p className="text-xs text-crimson mt-0.5">
                      Rs {p.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Referral prompt */}
        <div className="mt-16 bg-espresso text-ivory p-8 md:p-12">
          <div className="text-xs uppercase tracking-[0.3em] text-champagne mb-2">
            Give Rs 200, get Rs 200
          </div>
          <h2 className="font-display text-2xl md:text-3xl mb-3">
            Someone in your coven deserves this too.
          </h2>
          <p className="text-ivory/70 text-sm max-w-md mx-auto mb-6">
            Share your code. When they buy, you both get Rs 200 off your next order.
          </p>
          <Link
            href="/referral"
            className="inline-block bg-ivory text-espresso px-6 py-3 uppercase tracking-widest text-xs hover:bg-champagne transition"
          >
            Get my code
          </Link>
        </div>
      </div>
    </main>
  );
}




