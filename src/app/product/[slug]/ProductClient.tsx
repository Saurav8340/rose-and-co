'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductGallery from '@/components/ProductGallery';
import SizeSelector, { SizeOption } from '@/components/SizeSelector';
import StickyBuyBar from '@/components/StickyBuyBar';
import PincodeCheck from '@/components/PincodeCheck';
import { useCart } from '@/components/CartContext';
import { inr } from '@/lib/format';
import { PAYMENT } from '@/lib/constants';

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

  // Price shown on product page = full price (₹1,499)
  // Prepaid saving is offered at checkout, shown here as a badge to build intent
  const displayPrice = PAYMENT.fullPrice;
  const prepaidPrice = PAYMENT.prepaidPrice;

  const totalStock = useMemo(() => product.sizes.reduce((s, x) => s + x.stock, 0), [product.sizes]);

  const doAdd = () => {
    if (!size) { setMsg('Pick a size first.'); return; }
    add({
      productId: product.id, slug: product.slug, name: product.name,
      image: product.images[0], size, quantity: qty, price: displayPrice,
    });
    setMsg('Added to bag.');
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
              <div className="text-xs uppercase tracking-[0.3em] text-wine">Rosé & Co</div>
              <h1 className="font-display text-3xl md:text-4xl text-espresso mt-2">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-wine">★★★★★</span>
                <span className="text-xs text-espresso/60">Loved by early buyers</span>
              </div>
            </div>

            {/* PRICE + PREPAID INCENTIVE */}
            <div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-semibold text-espresso">{inr(displayPrice)}</div>
                {product.compareAt && product.compareAt > displayPrice && (
                  <div className="text-lg line-through text-espresso/40">{inr(product.compareAt)}</div>
                )}
              </div>
              <div className="text-xs text-espresso/60 mt-1">GST included · Free shipping · No hidden charges</div>

              {/* Prepaid savings badge — front and centre */}
              <div className="mt-3 p-3 bg-green-50 border-2 border-green-600/40 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-green-800 font-semibold">Pay via UPI at checkout</div>
                  <div className="text-sm text-espresso mt-1">
                    Get it for <b>{inr(prepaidPrice)}</b> — save <b className="text-green-800">₹{PAYMENT.prepaidSavings}</b>
                  </div>
                </div>
                <div className="text-2xl">💰</div>
              </div>
            </div>

            <div className="p-3 bg-blush/40 border-l-2 border-wine text-sm text-espresso">
              Hand-painted in small batches. {totalStock > 0 ? `${totalStock} sets left across all sizes.` : 'Sold out — next drop coming soon.'}
            </div>

            <SizeSelector sizes={product.sizes} value={size} onChange={setSize} />

            <div>
              <div className="label">Quantity</div>
              <div className="inline-flex items-center border border-taupe/40">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2 text-lg">−</button>
                <span className="px-4 py-2 border-x border-taupe/40 min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(5, q + 1))} className="px-4 py-2 text-lg">+</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={doBuyNow} className="btn-primary flex-1">Buy Now</button>
              <button onClick={doAdd} className="btn-secondary flex-1">Add to Bag</button>
            </div>
            {msg && <div className="text-sm text-wine">{msg}</div>}

            {/* PIN DELIVERY ESTIMATOR — kept from v8 */}
            <PincodeCheck />

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-taupe/20 text-xs text-espresso/70">
              <div>🚚 <b>Free shipping</b><br/>All India</div>
              <div>📦 <b>24–48 hrs</b><br/>To dispatch</div>
              <div>🔄 <b>7 days</b><br/>To return</div>
              <div>🔒 <b>UPI</b><br/>All apps supported</div>
            </div>

            <details open className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">The set</summary>
              <div className="mt-3 text-espresso/80 leading-relaxed space-y-3 text-sm">
                <p>Fitted crop top and high-waist A-line midi skirt. Hand-painted marble swirl in three tones — deep rose, wine, and warm ivory — on soft-drape poly-satin.</p>
                <p>Each set is one of a kind because the print is done by hand before the fabric is cut. That means your swirl pattern will be slightly different from the one you see in the photos. If that bothers you, this is not the piece for you.</p>
              </div>
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">Fabric + fit</summary>
              <ul className="mt-3 space-y-2 text-espresso/80 text-sm list-disc pl-5">
                <li>Poly-satin blend, around 90–100 GSM. Has weight, falls with drape.</li>
                <li>Top: fitted through the bust and waist. Crop length sits just above the natural waist.</li>
                <li>Skirt: high-waisted A-line, midi length. Falls to mid-calf on a 5ft 7in model.</li>
                <li>Model wears size S. Height 5ft 7in.</li>
                <li>Care: dry clean is safest. Gentle hand-wash in cold water works too. Do not tumble dry.</li>
              </ul>
            </details>

            {/* SIZE CHART — kept from v8 */}
            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">Size chart (cm)</summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm text-espresso/80">
                  <thead className="text-xs uppercase tracking-widest text-espresso/60 border-b border-taupe/30">
                    <tr>
                      <th className="text-left py-2">Size</th>
                      <th className="text-left py-2">Bust</th>
                      <th className="text-left py-2">Waist</th>
                      <th className="text-left py-2">Hip</th>
                      <th className="text-left py-2">Skirt length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['XS',  '81',  '61', '86',  '75'],
                      ['S',   '86',  '66', '91',  '75'],
                      ['M',   '91',  '71', '97',  '76'],
                      ['L',   '97',  '76', '102', '76'],
                      ['XL',  '102', '81', '107', '77'],
                      ['XXL', '107', '86', '112', '77'],
                    ].map(row => (
                      <tr key={row[0]} className="border-b border-taupe/10">
                        <td className="py-2 font-medium">{row[0]}</td>
                        <td className="py-2">{row[1]} cm</td>
                        <td className="py-2">{row[2]} cm</td>
                        <td className="py-2">{row[3]} cm</td>
                        <td className="py-2">{row[4]} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-xs text-espresso/60">Measured flat, garment size. Add ~2 cm for comfortable fit.</p>
              </div>
            </details>

            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">Shipping + returns</summary>
              <ul className="mt-3 text-sm text-espresso/80 list-disc pl-5 space-y-1">
                <li>Free shipping across India. No minimum.</li>
                <li>Ships from Delhi NCR within 24–48 hours of payment confirmation.</li>
                <li>Delivered in 3–5 business days to metros, 5–7 to smaller cities.</li>
                <li>7 days to return from delivery date. Tags on, unworn. Free reverse pickup.</li>
                <li>Refund lands in 5–7 working days after we receive the item.</li>
              </ul>
            </details>

            {/* PRODUCT-SPECIFIC FAQ — kept from v8 */}
            <details className="border-t border-taupe/20 pt-4">
              <summary className="cursor-pointer uppercase tracking-widest text-sm text-espresso">Common questions about this set</summary>
              <div className="mt-3 text-sm text-espresso/80 space-y-3">
                <div>
                  <b>Will my print look exactly like the photos?</b>
                  <p className="mt-1 text-espresso/70">No — that is the point. Every piece is hand-painted, so your swirl pattern will be slightly different. Same colours, same style, unique pattern.</p>
                </div>
                <div>
                  <b>Can I wear the top separately?</b>
                  <p className="mt-1 text-espresso/70">Yes. Works with jeans, tailored trousers, or a plain skirt. The top is versatile enough to wear on its own.</p>
                </div>
                <div>
                  <b>Is the crop too short?</b>
                  <p className="mt-1 text-espresso/70">No. It sits at the natural waist and works with the high-waist skirt to show about 1-2 inches of skin. Modest by intent.</p>
                </div>
                <div>
                  <b>Will the print rub off on my skin?</b>
                  <p className="mt-1 text-espresso/70">No. The pigment is bonded into the fabric fibres. It will not transfer even with sweat.</p>
                </div>
                <div>
                  <b>Prepaid vs COD — what is the actual difference?</b>
                  <p className="mt-1 text-espresso/70">Prepaid via UPI is <b>{inr(prepaidPrice)}</b> — you save <b>₹{PAYMENT.prepaidSavings}</b>. Partial COD is <b>{inr(PAYMENT.fullPrice)}</b> total, split as ₹{PAYMENT.codDeposit} online + ₹{PAYMENT.codRemaining} cash on delivery. Same product, same shipping speed.</p>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
      <StickyBuyBar price={displayPrice} onBuy={doBuyNow} />
      <div className="h-20 md:hidden" />
    </>
  );
}
