'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import CheckoutSummary from '@/components/CheckoutSummary';
import UPIPayButton from '@/components/UPIPayButton';
import { generateOrderId } from '@/lib/upi';

export default function ExpressCheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [address, setAddress] = useState<any>({});
  const [step, setStep] = useState<'address' | 'pay'>('address');
  const [orderId] = useState(generateOrderId());

  useEffect(() => {
    // Preload address if returning customer
    const saved = localStorage.getItem('rc_last_address');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.pincode) {
          setAddress(parsed);
          // Auto-skip to payment if all fields filled
          if (parsed.address && parsed.city && parsed.phone) {
            setStep('pay');
          }
        }
      } catch {}
    }
  }, []);

  const canProceed =
    address.name && address.phone?.length === 10 && address.pincode?.length === 6 &&
    address.address && address.city && address.state;

  const discountPct = parseFloat(localStorage.getItem('rc_active_discount') || '0');
  const discountAmt = Math.round((total * discountPct) / 100);
  const finalTotal = total - discountAmt + (total - discountAmt < 999 ? 99 : 0);

  const handlePaymentInitiated = (id: string) => {
    // Save order to localStorage before payment
    const order = {
      orderId: id,
      items,
      address,
      total: finalTotal,
      discount: discountAmt,
      timestamp: Date.now(),
      status: 'pending',
    };
    const orders = JSON.parse(localStorage.getItem('rc_orders') || '[]');
    orders.push(order);
    localStorage.setItem('rc_orders', JSON.stringify(orders));

    // Redirect to thank you page after 3s (assuming payment app opened)
    setTimeout(() => {
      clear();
      router.push(`/thank-you?order=${id}`);
    }, 3000);
  };

  if (items.length === 0) {
    return (
      <main className="container-x py-20 text-center">
        <h1 className="font-display text-3xl text-espresso">Your cart is empty.</h1>
        <p className="mt-4 text-espresso/70">Add something you love first.</p>
        <button
          onClick={() => router.push('/shop')}
          className="mt-6 bg-wine text-ivory px-6 py-3 uppercase tracking-widest text-sm hover:bg-espresso transition"
        >
          Browse the collection
        </button>
      </main>
    );
  }

  return (
    <main className="container-x py-8 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl text-espresso mb-8">
        {step === 'address' ? 'Where should we send it?' : 'Almost there.'}
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {step === 'address' && (
            <>
              <AddressAutocomplete
                onChange={(data) => setAddress(data)}
                initial={address}
              />

              <button
                onClick={() => canProceed && setStep('pay')}
                disabled={!canProceed}
                className={`mt-6 w-full py-4 uppercase tracking-widest text-sm font-semibold transition ${
                  canProceed
                    ? 'bg-wine text-ivory hover:bg-espresso'
                    : 'bg-taupe/30 text-espresso/50 cursor-not-allowed'
                }`}
              >
                Continue to payment
              </button>
            </>
          )}

          {step === 'pay' && (
            <div className="space-y-6">
              <div className="bg-blush/10 p-4 text-sm">
                <div className="text-xs uppercase tracking-widest text-wine mb-2">Shipping to</div>
                <div className="font-medium">{address.name}</div>
                <div className="text-espresso/70 mt-1">
                  {address.address}, {address.city}, {address.state} - {address.pincode}
                </div>
                <div className="text-espresso/70">{address.phone}</div>
                <button
                  onClick={() => setStep('address')}
                  className="mt-2 text-xs underline text-wine"
                >
                  Change
                </button>
              </div>

              <UPIPayButton
                amount={finalTotal}
                orderId={orderId}
                note={`RoseAndCo Order`}
                onPaymentInitiated={handlePaymentInitiated}
              />

              <p className="text-xs text-espresso/60 text-center">
                Your UPI app will open with all details pre-filled.
                Just approve to complete payment.
              </p>
            </div>
          )}
        </div>

        <div>
          <CheckoutSummary subtotal={total} />

          <div className="mt-6 space-y-2 text-xs text-espresso/70">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-green-600" />
              Ships from Gurugram in 24-48 hours
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-green-600" />
              Free 7-day returns, free reverse pickup
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-green-600" />
              Secure UPI, encrypted end-to-end
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
