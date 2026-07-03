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
    addRecentlyViewed({
      id: product.id, slug: product.slug, name: product.name,
      price: displayPrice, image: product.images[0],
    });
  }, [product.id, product.slug, product.name, displayPrice, product.images]);

  const discount = useMemo(() => {
    if (!product.compareAt || product.compareAt <= product.price) return 0;
    return Math.round(((product.compareAt - product.price) / product.compareAt) * 100);
  }, [product]);

  const doAdd = () => {
    if (!size) { setMsg('Pick a size first.'); return; }
    add({
      productId: product.id, slug: product.slug, name: product.name,
      image: product.images[0], size, quantity: qty, price: displayPrice,
    });
    setMsg('Added.');
    setBumpCart(true);
    setTimeout(() => setBumpCart(false), 600);
    setTimeout(() => setMsg(null), 2000);
  };

  const doBuyNow = () => {
    if (!size) { setMsg('Pick a size first.'); return; }
    add({
      productId: product.id, slug: product.slug, name: product.name,
      image: product.images[0], size, quantity: qty, price: displayPrice,
    });
    router.push('/checkout');
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `${SITE.url}/product/${product.slug}`;

  return (
    <>
      <div className="container-x py-6 md:py-10">
        <nav className="text-xs uppercase tracking-widest text-espresso/60 mb-6">
          <a href="/">Home</a> / <a href="/">Shop</a> / <span className="text-espresso">{product.name}</span>
        </nav>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <ProductGallery images={product.images} name={product.name} />
          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-wine">Rose &amp; Co</div>
              <h1 className="font-display text-3xl md:text-4xl text-espresso mt-2">{product.name}</h1>
              <RatingLine />
            </div>

            <div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-semibold text-espresso">{inr(displayPrice)}</div>
                {product.compareAt && product.compareAt > displayPrice && (
                  <div className="text-lg line-through text-espresso/40">{inr(product.compareAt)}</div>
                )}
                {discount > 0 && <div className="badge bg-wine text-ivory">{discount}% off</div>}
              </div>
              <div className="text-xs text-espresso/60 mt-1">GST included &middot; Free shipping</div>

              <div className="mt-3 p-3 bg-green-50 border-2 border-green-600/40">
                <div className="text-xs uppercase tracking-widest text-green-800 font-semibold">UPI prepaid</div>
                <div className="text-sm text-espresso mt-1">
                  Pay upfront at <b>{inr(prepaidPrice)}</b>, save <b className="text-green-800">Rs {PAYMENT.prepaidSavings}</b>. No cash on delivery.
                </div>
              </div>
            </div>

            <ShipsInCounter />

            <div className="p-3 bg-blush/40 border-l-2 border-wine text-sm text-espresso">
              200 sets per drop, hand-painted. {totalStock > 0 ? `${totalStock} left across all sizes right now.` : 'Sold out.'}
            </div>

            <SizeSelector sizes={product.sizes} value={size} onChange={setSize} />

            <div>
              <div className="label">Quantity</div>
              <div className="inline-flex items-center border border-taupe/40">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2 text-lg">-</button>
                <span className="px-4 py-2 border-x border-taupe/40 min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(5, q + 1))} className="px-4 py-2 text-lg">+</button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={doBuyNow} className="btn-primary flex-1">Buy Now</button>
              <button onClick={doAdd} className={`btn-secondary flex-1 transition-transform ${bumpCart ? 'scale-95' : ''}`}>
                Add to Bag
              </button>
              <WishlistButton productId={product.id} />
              <ShareButton title={product.name} url={shareUrl} />
            </div>
            {msg && <div className="text-sm text-wine">{msg}</div>}

            <TrustBadges />

            <PincodeCheck />

            <details open className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">The set</summary>
              <div className="mt-3 text-espresso/80 leading-relaxed space-y-3 text-sm">
                <p>Fitted crop top + high-waist A-line midi skirt. Hand-painted marble swirl on poly-satin. Three tones: deep rose, wine, warm ivory.</p>
                <p>Because the print is done by hand before cutting, no two sets are identical. Your swirl pattern will look slightly different from the photos. Same colours, different placement. If that bothers you, this is not the piece.</p>
              </div>
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">Fabric + fit</summary>
              <ul className="mt-3 space-y-2 text-espresso/80 text-sm list-disc pl-5">
                <li>Poly-satin blend, 90 to 100 GSM. Falls with weight.</li>
                <li>Top is fitted through bust and waist. Crop sits at natural waist.</li>
                <li>Skirt is high-waist, A-line, midi length. Falls mid-calf on 5&apos;7&quot;.</li>
                <li>Model is 5&apos;7&quot; wearing size S.</li>
                <li>Care: dry clean is safest. Hand-wash cold works. Never tumble dry, never wring.</li>
              </ul>
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">Size chart</summary>
              <div className="mt-3">
                <InteractiveSizeChart />
              </div>
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">How the Amara compares</summary>
              <ComparisonTable />
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">Shipping + returns</summary>
              <ul className="mt-3 text-sm text-espresso/80 list-disc pl-5 space-y-1">
                <li>Free Delhivery Standard shipping across India.</li>
                <li>Ships from Gurugram in 24 to 48 hours after payment clears.</li>
                <li>Metros: 3 to 5 working days. Tier-2: 5 to 7.</li>
                <li>7-day return window. Free reverse pickup.</li>
                <li>Refund in 5 to 7 working days after we get the return.</li>
              </ul>
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">Common questions</summary>
              <div className="mt-3 text-sm text-espresso/80 space-y-3">
                <div>
                  <b>Will the print match the photos?</b>
                  <p className="mt-1 text-espresso/70">Not exactly. Every set is hand-painted so your swirl will be slightly different. Same three tones though.</p>
                </div>
                <div>
                  <b>Can I wear the top separately?</b>
                  <p className="mt-1 text-espresso/70">Yes. Buyers do it with jeans, tailored trousers, plain skirts. Works.</p>
                </div>
                <div>
                  <b>Prepaid vs COD - the actual difference?</b>
                  <p className="mt-1 text-espresso/70">Prepaid: {inr(prepaidPrice)} total. Partial COD: {inr(PAYMENT.fullPrice)} - Rs {PAYMENT.codDeposit} on UPI now + Rs {PAYMENT.codRemaining} in cash at delivery.</p>
                </div>
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
