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
import { getPrepaidPrice, SITE } from '@/lib/constants';
import ReviewsSection from '@/components/ReviewsSection';
import InventoryCountdown from '@/components/InventoryCountdown';
import SizeGuideModal from '@/components/SizeGuideModal';

type Product = {
  id: string; slug: string; name: string; description: string;
  price: number; compareAt: number | null;
  images: string[]; sizes: SizeOption[];
  videos?: string[]; // NEW — see product/[slug]/page.tsx for where this is parsed
};

export default function ProductClient({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<string | null>(null);
  const [bumpCart, setBumpCart] = useState(false);

  const displayPrice = product.price;
  const prepaidPrice = getPrepaidPrice(product.price);

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
        <nav className="text-xs uppercase tracking-widest text-ivory/60 mb-6" aria-label="Breadcrumb">
          <a href="/">Home</a> / <span className="text-ivory">{product.name}</span>
        </nav>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <ProductGallery images={product.images} name={product.name} videos={product.videos ?? []} />
          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-crimson">Rosé & Co</div>
              <h1 className="font-display text-3xl md:text-4xl text-ivory mt-2">{product.name}</h1>
              <RatingLine />
            </div>

            <div>
              <div className="flex items-baseline gap-3">
                <div className="text-3xl font-semibold text-ivory">{inr(displayPrice)}</div>
                {product.compareAt && product.compareAt > displayPrice && (
                  <div className="text-base line-through text-ivory/40">{inr(product.compareAt)}</div>
                )}
              </div>
              <div className="text-xs text-ivory/60 mt-2">
                Free shipping. Prepaid via UPI is {inr(prepaidPrice)}. Cash on delivery available.
              </div>
            </div>

            <InventoryCountdown productSlug={product.slug} totalStock={totalStock} />

            <ShipsInCounter />

            {totalStock === 0 && (
              <div className="text-sm text-crimson">This drop is sold out. Next drop in a few weeks.</div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="label">Size</div>
                <SizeGuideModal />
              </div>
              <SizeSelector sizes={product.sizes} value={size} onChange={setSize} />
            </div>

            <div>
              <div className="label">Quantity</div>
              <div className="inline-flex items-center border border-taupe/40 text-ivory">
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
            {msg && <div className="text-sm text-crimson">{msg}</div>}

            <TrustBadges />
            <PincodeCheck />

            <details open className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-ivory">The piece</summary>
              <div className="mt-3 text-ivory/80 leading-[1.8] space-y-3 text-sm">
                <p>{product.description}</p>
              </div>
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-ivory">Fit & care</summary>
              <ul className="mt-3 space-y-2 text-ivory/80 text-sm leading-[1.8] list-disc pl-5">
                <li>See the size chart below for exact measurements.</li>
                <li>Corsets and hardware pieces: spot clean, keep metal dry.</li>
                <li>Mesh and jersey pieces: hand-wash cold, air dry only.</li>
              </ul>
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-ivory">Size chart</summary>
              <div className="mt-3"><InteractiveSizeChart /></div>
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-ivory">How this compares</summary>
              <ComparisonTable />
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-ivory">Shipping & returns</summary>
              <div className="mt-3 text-sm text-ivory/80 leading-[1.8] space-y-2">
                <p>Free shipping anywhere in India via Delhivery. Metros in three to five working days. Smaller cities in five to seven.</p>
                <p>Seven days to return from the day it arrives. Tags on, unworn, unwashed. We arrange the pickup. Refund lands in about a week.</p>
              </div>
            </details>
          </div>
        </div>
      </div>

      <ReviewsSection productSlug={product.slug} />

      <StickyBuyBar price={displayPrice} onBuy={doBuyNow} productName={product.name} />
      <div className="h-20 md:hidden" />
      <RecentlyViewed currentSlug={product.slug} />
    </>
  );
}

