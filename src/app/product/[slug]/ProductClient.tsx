'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductGallery from '@/components/ProductGallery';
import SizeSelector, { SizeOption } from '@/components/SizeSelector';
import StickyBuyBar from '@/components/StickyBuyBar';
import PincodeCheck from '@/components/PincodeCheck';
import ShipsInCounter from '@/components/ShipsInCounter';
import TrustBadges from '@/components/TrustBadges';
import ShareButton from '@/components/ShareButton';
import WishlistButton from '@/components/WishlistButton';
import InteractiveSizeChart from '@/components/InteractiveSizeChart';
import ComparisonTable from '@/components/ComparisonTable';
import RecentlyViewed from '@/components/RecentlyViewed';
import RatingLine from '@/components/RatingLine';
import { addRecentlyViewed } from '@/lib/recentlyViewed';
import { useCart } from '@/components/CartContext';
import { inr } from '@/lib/format';
import { PAYMENT, SITE } from '@/lib/constants';

type Product = {
  id: string; slug: string; name: string; description: string;
  price: number; compareAt: number | null;
  images: string[]; sizes: SizeOption[];
};

export default function ProductClient({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<string | null>(null);
  const [bumpCart, setBumpCart] = useState(false);

  const displayPrice = PAYMENT.fullPrice;
  const prepaidPrice = PAYMENT.prepaidPrice;

  const totalStock = useMemo(() => product.sizes.reduce((s, x) => s + x.stock, 0), [product.sizes]);

  useEffect(() => {
    addRecentlyViewed({ id: product.id, slug: product.slug, name: product.name, price: displayPrice, image: product.images[0] });
  }, [product.id, product.slug, product.name, displayPrice, product.images]);

  const doAdd = () => {
    if (!size) { setMsg('Pick a size first.'); return; }
    add({ productId: product.id, slug: product.slug, name: product.name, image: product.images[0], size, quantity: qty, price: displayPrice });
    setMsg('Added.');
    setBumpCart(true);
    setTimeout(() => setBumpCart(false), 600);
    setTimeout(() => setMsg(null), 2000);
  };

  const doBuyNow = () => {
    if (!size) { setMsg('Pick a size first.'); return; }
    add({ productId: product.id, slug: product.slug, name: product.name, image: product.images[0], size, quantity: qty, price: displayPrice });
    router.push('/checkout');
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `${SITE.url}/product/${product.slug}`;

  return (
    <>
      <div className="container-x py-6 md:py-10">
        <nav className="text-xs uppercase tracking-widest text-espresso/60 mb-6">
          <a href="/">Home</a> / <span className="text-espresso">{product.name}</span>
        </nav>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <ProductGallery images={product.images} name={product.name} />
          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-wine">Rose &amp; Co</div>
              <h1 className="font-display text-3xl md:text-4xl text-espresso mt-2">{product.name}</h1>
              <RatingLine />
            </div>

            {/* One clean pricing block. That's it. */}
            <div>
              <div className="flex items-baseline gap-3">
                <div className="text-3xl font-semibold text-espresso">{inr(displayPrice)}</div>
                {product.compareAt && product.compareAt > displayPrice && (
                  <div className="text-base line-through text-espresso/40">{inr(product.compareAt)}</div>
                )}
              </div>
              <div className="text-xs text-espresso/60 mt-2">
                Free shipping. Prepaid via UPI is {inr(prepaidPrice)}. Cash on delivery available.
              </div>
            </div>

            <ShipsInCounter />

            {totalStock > 0 && totalStock <= 20 && (
              <div className="text-sm text-wine">Only {totalStock} left across all sizes.</div>
            )}
            {totalStock === 0 && (
              <div className="text-sm text-wine">This drop is sold out. Next drop in four to six weeks.</div>
            )}

            <SizeSelector sizes={product.sizes} value={size} onChange={setSize} />

            <div>
              <div className="label">Quantity</div>
              <div className="inline-flex items-center border border-taupe/40">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2 text-lg" aria-label="Decrease quantity">-</button>
                <span className="px-4 py-2 border-x border-taupe/40 min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(5, q + 1))} className="px-4 py-2 text-lg" aria-label="Increase quantity">+</button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={doBuyNow} className="btn-primary flex-1">Buy Now</button>
              <button onClick={doAdd} className={`btn-secondary flex-1 transition-transform ${bumpCart ? 'scale-95' : ''}`}>Add to Bag</button>
              <WishlistButton productId={product.id} />
              <ShareButton title={product.name} url={shareUrl} />
            </div>
            {msg && <div className="text-sm text-wine">{msg}</div>}

            <TrustBadges />
            <PincodeCheck />

            <details open className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">The set</summary>
              <div className="mt-3 text-espresso/80 leading-[1.8] space-y-3 text-sm">
                <p>A fitted crop top and a high-waisted midi skirt. Hand-painted marble swirl in three tones &mdash; deep rose, wine, warm ivory.</p>
                <p>Every set is painted before the cloth is cut, so no two look the same. If that isn&apos;t what you want, this may not be the piece.</p>
              </div>
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">Fabric &amp; fit</summary>
              <ul className="mt-3 space-y-2 text-espresso/80 text-sm leading-[1.8] list-disc pl-5">
                <li>Poly-satin, around a hundred grams per square metre.</li>
                <li>Fitted top, sits at the natural waist. A-line midi skirt, mid-calf on a 5&apos;7&quot; frame.</li>
                <li>Model is 5&apos;7&quot; in size S.</li>
                <li>Dry clean, or hand-wash cold. Never tumble dry.</li>
              </ul>
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">Size chart</summary>
              <div className="mt-3"><InteractiveSizeChart /></div>
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">How the Amara compares</summary>
              <ComparisonTable />
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">Shipping &amp; returns</summary>
              <div className="mt-3 text-sm text-espresso/80 leading-[1.8] space-y-2">
                <p>Free shipping anywhere in India via Delhivery. Metros in three to five working days. Smaller cities in five to seven.</p>
                <p>Seven days to return from the day it arrives. Tags on, unworn, unwashed. We arrange the pickup. Refund lands in about a week.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
      <StickyBuyBar price={displayPrice} onBuy={doBuyNow} />
      <div className="h-20 md:hidden" />
      <RecentlyViewed currentSlug={product.slug} />
    </>
  );
}
