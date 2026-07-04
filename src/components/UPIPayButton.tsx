'use client';

import { useState } from 'react';
import { buildUPIUrl, buildGPayUrl, buildPhonePeUrl, buildPaytmUrl, isMobile, isAndroid, generateOrderId } from '@/lib/upi';

interface Props {
  amount: number;
  orderId?: string;
  note?: string;
  onPaymentInitiated?: (orderId: string) => void;
}

export default function UPIPayButton({ amount, orderId, note, onPaymentInitiated }: Props) {
  const [showApps, setShowApps] = useState(false);
  const finalOrderId = orderId || generateOrderId();

  const handleQuickPay = () => {
    onPaymentInitiated?.(finalOrderId);
    const url = buildUPIUrl({ amount, orderId: finalOrderId, note });
    // Attempt to open UPI app directly
    window.location.href = url;
    // Fallback: if nothing happens in 2 seconds, show app picker
    setTimeout(() => setShowApps(true), 2000);
  };

  const openApp = (url: string) => {
    onPaymentInitiated?.(finalOrderId);
    window.location.href = url;
  };

  if (!isMobile()) {
    // Desktop: show QR code or fallback
    return (
      <div className="bg-blush/20 p-6 rounded">
        <p className="text-sm text-espresso mb-3">Open your UPI app on phone to scan:</p>
        <div className="bg-white p-4 rounded inline-block">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(buildUPIUrl({ amount, orderId: finalOrderId, note }))}`}
            alt="UPI QR Code"
            width={200}
            height={200}
          />
        </div>
        <p className="text-xs text-espresso/70 mt-3">
          Amount: Rs {amount.toFixed(2)} · Order: {finalOrderId}
        </p>
      </div>
    );
  }

  // Mobile: 1-tap UPI
  if (!showApps) {
    return (
      <button
        onClick={handleQuickPay}
        className="w-full bg-wine text-ivory py-4 uppercase tracking-widest text-sm font-semibold hover:bg-espresso transition flex items-center justify-center gap-3"
      >
        <span>Pay Rs {amount.toFixed(0)} via UPI</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    );
  }

  // App picker (fallback)
  return (
    <div className="space-y-2">
      <p className="text-sm text-espresso text-center mb-3">Choose your UPI app:</p>
      <button
        onClick={() => openApp(buildGPayUrl({ amount, orderId: finalOrderId, note }))}
        className="w-full bg-white border border-taupe/20 py-3 rounded flex items-center justify-center gap-2 hover:bg-blush/20 transition"
      >
        <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">G</span>
        <span className="text-sm font-medium">Google Pay</span>
      </button>
      <button
        onClick={() => openApp(buildPhonePeUrl({ amount, orderId: finalOrderId, note }))}
        className="w-full bg-white border border-taupe/20 py-3 rounded flex items-center justify-center gap-2 hover:bg-blush/20 transition"
      >
        <span className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">P</span>
        <span className="text-sm font-medium">PhonePe</span>
      </button>
      <button
        onClick={() => openApp(buildPaytmUrl({ amount, orderId: finalOrderId, note }))}
        className="w-full bg-white border border-taupe/20 py-3 rounded flex items-center justify-center gap-2 hover:bg-blush/20 transition"
      >
        <span className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xs">Pay</span>
        <span className="text-sm font-medium">Paytm</span>
      </button>
      <button
        onClick={() => openApp(buildUPIUrl({ amount, orderId: finalOrderId, note }))}
        className="w-full text-espresso/60 text-xs py-2 hover:text-espresso"
      >
        Other UPI app
      </button>
    </div>
  );
}
