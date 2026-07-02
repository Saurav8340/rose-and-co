'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { inr } from '@/lib/format';
import { PAYMENT } from '@/lib/constants';
import { lookupPincode } from '@/lib/pincode';
import { serializedUtm } from '@/lib/utm';
import UpiButtons from '@/components/UpiButtons';

type Step = 'address' | 'verify' | 'payment' | 'done';

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [step, setStep] = useState<Step>('address');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const startedAt = useRef<number>(Date.now());
  const [honeypot, setHoneypot] = useState('');
  const submitting = useRef(false);

  const [form, setForm] = useState({
    fullName: '', mobile: '', email: '', altPhone: '',
    pincode: '', state: '', city: '',
    addressLine1: '', addressLine2: '', landmark: '',
  });

  const [captchaSVG, setCaptchaSVG] = useState<string>('');
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [captchaInput, setCaptchaInput] = useState<string>('');

  const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'PARTIAL_COD'>('PREPAID');
  const [qrData, setQrData] = useState<string | null>(null);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [returnedFromApp, setReturnedFromApp] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && paymentStarted) setReturnedFromApp(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [paymentStarted]);

  useEffect(() => {
    const saved = localStorage.getItem('rc_checkout');
    if (saved) try { setForm(f => ({ ...f, ...JSON.parse(saved) })); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem('rc_checkout', JSON.stringify(form)); }, [form]);

  useEffect(() => {
    if (submitting.current) return;
    if (step === 'done') return;
    if (items.length === 0) router.push('/cart');
  }, [items.length, step, router]);

  useEffect(() => {
    if (form.pincode.length === 6) {
      lookupPincode(form.pincode).then(res => {
        if (res) setForm(f => ({ ...f, state: res.state, city: res.city }));
      });
    }
  }, [form.pincode]);

  const setField = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const qty = items.reduce((s, i) => s + i.quantity, 0);
  const fullTotal    = PAYMENT.fullPrice * qty;
  const prepaidTotal = PAYMENT.prepaidPrice * qty;
  const codDeposit   = PAYMENT.codDeposit * qty;
  const codRemaining = PAYMENT.codRemaining * qty;

  const amountToPay = paymentMethod === 'PREPAID' ? prepaidTotal : codDeposit;
  const orderNote = ('RoseAndCo ' + (form.fullName || 'Order')).slice(0, 60);

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return setErr('Enter valid 10-digit mobile');
    if (!/^[1-9]\d{5}$/.test(form.pincode)) return setErr('Enter valid PIN');
    if (!form.fullName || form.fullName.length < 2) return setErr('Enter your full name');
    if (!form.addressLine1 || form.addressLine1.length < 5) return setErr('Enter your full address');
    if (!form.city || !form.state) return setErr('City & State required');

    setLoading(true);
    try {
      const res = await fetch('/api/captcha/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: form.mobile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCaptchaSVG(data.svg); setCaptchaToken(data.token);
      setStep('verify');
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const refreshCaptcha = async () => {
    setCaptchaInput(''); setErr(null); setLoading(true);
    try {
      const res = await fetch('/api/captcha/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: form.mobile }),
      });
      const data = await res.json();
      setCaptchaSVG(data.svg); setCaptchaToken(data.token);
    } finally { setLoading(false); }
  };

  const verifyCaptcha = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setLoading(true);
    try {
      const res = await fetch('/api/captcha/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken, code: captchaInput.toUpperCase(), mobile: form.mobile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      const qrRes = await fetch('/api/payment/upi-qr', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountToPay, orderNote }),
      });
      const qrJson = await qrRes.json();
      setQrData(qrJson.qr);
      setStep('payment');
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (step !== 'payment') return;
    fetch('/api/payment/upi-qr', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountToPay, orderNote }),
    }).then(r => r.json()).then(d => setQrData(d.qr));
  }, [amountToPay, step, orderNote]);

  const submitOrder = async () => {
    setErr(null);
    if (items.length === 0) return setErr('Cart empty');
    setLoading(true);
    submitting.current = true;

    try {
      const it = items[0];
      const res = await fetch('/api/orders/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationToken: captchaToken,
          ...form,
          paymentMethod,
          productId: it.productId,
          size: it.size,
          quantity: it.quantity,
          paidConfirmed: true,
          website: honeypot,
          startedAt: startedAt.current,
          metaFbc: readCookie('_fbc'),
          metaFbp: readCookie('_fbp'),
          utm: serializedUtm(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed');

      setStep('done');
      const successUrl = '/order-success?id=' + data.orderNumber;
      window.location.href = successUrl;
      setTimeout(() => {
        try { clear(); } catch {}
        router.push(successUrl);
      }, 500);
    } catch (e: any) {
      submitting.current = false;
      setErr(e.message);
    } finally { setLoading(false); }
  };

  const markPaymentStarted = () => setPaymentStarted(true);

  return (
    <div className="container-x py-6 md:py-10 max-w-4xl">
      <input type="text" name="website" tabIndex={-1} autoComplete="off"
        value={honeypot} onChange={e => setHoneypot(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        aria-hidden="true" />

      <div className="flex items-center justify-between mb-8 text-xs uppercase tracking-widest">
        {[
          { s: 'address', l: '1 · Address' },
          { s: 'verify',  l: '2 · Verify' },
          { s: 'payment', l: '3 · Payment' },
        ].map(x => (
          <div key={x.s} className={'flex-1 text-center py-2 border-b-2 ' + (step === x.s ? 'border-wine text-wine' : 'border-taupe/20 text-espresso/40')}>{x.l}</div>
        ))}
      </div>

      {err && <div className="p-3 mb-4 bg-wine/10 text-wine border border-wine/30 text-sm">{err}</div>}

      {step === 'done' && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-wine text-ivory flex items-center justify-center text-3xl mb-4">✓</div>
          <div className="font-display text-2xl text-espresso">Order placed. Taking you to your confirmation…</div>
        </div>
      )}

      {step !== 'done' && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {step === 'address' && (
              <form onSubmit={submitAddress} className="space-y-4" autoComplete="on">
                <h2 className="font-display text-2xl text-espresso">Shipping details</h2>
                <p className="text-xs text-espresso/60">Your browser can auto-fill saved addresses. Tap a field to see suggestions.</p>

                <div>
                  <label htmlFor="fullName" className="label">Full name *</label>
                  <input id="fullName" name="name" type="text" required autoFocus autoComplete="name"
                    enterKeyHint="next" className="input"
                    value={form.fullName} onChange={e => setField('fullName', e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="mobile" className="label">Mobile *</label>
                    <input id="mobile" name="tel" type="tel" required inputMode="numeric"
                      pattern="[6-9][0-9]{9}" maxLength={10} autoComplete="tel-national"
                      enterKeyHint="next" className="input" placeholder="10-digit mobile"
                      value={form.mobile} onChange={e => setField('mobile', e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div>
                    <label htmlFor="email" className="label">Email (optional)</label>
                    <input id="email" name="email" type="email" autoComplete="email"
                      enterKeyHint="next" className="input"
                      value={form.email} onChange={e => setField('email', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="pincode" className="label">PIN *</label>
                    <input id="pincode" name="postal-code" type="text" required
                      inputMode="numeric" maxLength={6} autoComplete="postal-code"
                      enterKeyHint="next" className="input"
                      value={form.pincode} onChange={e => setField('pincode', e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div>
                    <label htmlFor="city" className="label">City *</label>
                    <input id="city" name="city" type="text" required autoComplete="address-level2"
                      enterKeyHint="next" className="input"
                      value={form.city} onChange={e => setField('city', e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="state" className="label">State *</label>
                    <input id="state" name="state" type="text" required autoComplete="address-level1"
                      enterKeyHint="next" className="input"
                      value={form.state} onChange={e => setField('state', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label htmlFor="addressLine1" className="label">Address line 1 *</label>
                  <input id="addressLine1" name="address-line1" type="text" required
                    autoComplete="address-line1" enterKeyHint="next" className="input"
                    placeholder="House / flat / building, street"
                    value={form.addressLine1} onChange={e => setField('addressLine1', e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="landmark" className="label">Landmark (optional)</label>
                    <input id="landmark" name="address-line2" type="text" autoComplete="address-line2"
                      enterKeyHint="next" className="input"
                      value={form.landmark} onChange={e => setField('landmark', e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="altPhone" className="label">Alt phone (optional)</label>
                    <input id="altPhone" name="tel-alt" type="tel" inputMode="numeric" maxLength={10}
                      autoComplete="tel-national" enterKeyHint="done" className="input"
                      value={form.altPhone} onChange={e => setField('altPhone', e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Please wait…' : 'Continue →'}
                </button>
              </form>
            )}

            {step === 'verify' && (
              <form onSubmit={verifyCaptcha} className="space-y-6">
                <h2 className="font-display text-2xl text-espresso">Quick check</h2>
                <p className="text-sm text-espresso/70">Type the characters shown below exactly as they appear.</p>
                <div className="p-6 bg-blush/30 border border-taupe/20 flex items-center gap-4 flex-wrap">
                  <div dangerouslySetInnerHTML={{ __html: captchaSVG }} className="inline-block" />
                  <button type="button" onClick={refreshCaptcha} className="text-xs uppercase tracking-widest text-wine underline">↻ Refresh</button>
                </div>
                <div>
                  <label className="label">Type it here *</label>
                  <input required autoFocus autoComplete="off"
                    className="input uppercase tracking-[0.3em] text-center text-lg" maxLength={6}
                    value={captchaInput} onChange={e => setCaptchaInput(e.target.value.toUpperCase())} />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep('address')} className="btn-secondary">← Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Checking…' : 'Continue →'}</button>
                </div>
              </form>
            )}

            {step === 'payment' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl text-espresso">Payment</h2>

                <div className="space-y-3">
                  <label className={'cursor-pointer block p-5 border-2 ' + (paymentMethod === 'PREPAID' ? 'border-green-600 bg-green-50' : 'border-taupe/30 bg-white')}>
                    <input type="radio" name="pm" className="sr-only" checked={paymentMethod === 'PREPAID'} onChange={() => setPaymentMethod('PREPAID')} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-xs uppercase tracking-widest text-green-800 font-semibold">Recommended · Save ₹{PAYMENT.prepaidSavings * qty}</div>
                        <div className="font-display text-lg mt-1 text-espresso">Full prepaid via UPI</div>
                        <div className="text-sm text-espresso/70 mt-1">Pay <b className="text-espresso">{inr(prepaidTotal)}</b> now. No cash on delivery.</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs line-through text-espresso/40">{inr(fullTotal)}</div>
                        <div className="text-xl font-semibold text-green-800">{inr(prepaidTotal)}</div>
                      </div>
                    </div>
                  </label>

                  <label className={'cursor-pointer block p-5 border-2 ' + (paymentMethod === 'PARTIAL_COD' ? 'border-wine bg-blush/40' : 'border-taupe/30 bg-white')}>
                    <input type="radio" name="pm" className="sr-only" checked={paymentMethod === 'PARTIAL_COD'} onChange={() => setPaymentMethod('PARTIAL_COD')} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-xs uppercase tracking-widest text-espresso/60 font-semibold">Cash on delivery</div>
                        <div className="font-display text-lg mt-1 text-espresso">Partial COD</div>
                        <div className="text-sm text-espresso/70 mt-1">Pay <b>{inr(codDeposit)}</b> now + <b>{inr(codRemaining)}</b> in cash at delivery.</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold text-espresso">{inr(fullTotal)}</div>
                        <div className="text-[10px] text-espresso/50 uppercase tracking-wider">Total</div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="p-5 bg-ivory border border-taupe/30 text-center">
                  <div className="text-xs uppercase tracking-widest text-espresso/60">Amount to pay now</div>
                  <div className="text-4xl font-semibold text-wine mt-1">{inr(amountToPay)}</div>
                  {paymentMethod === 'PARTIAL_COD' && (
                    <div className="mt-2 text-sm text-espresso/70">Remaining <b>{inr(codRemaining)}</b> in cash at delivery.</div>
                  )}
                  {paymentMethod === 'PREPAID' && (
                    <div className="mt-2 text-sm text-green-800 font-medium">You are saving ₹{PAYMENT.prepaidSavings * qty} with prepaid.</div>
                  )}
                </div>

                {isMobile ? (
                  <div onClick={markPaymentStarted}>
                    <UpiButtons amount={amountToPay} note={orderNote} />
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="p-6 bg-white border border-taupe/30 flex flex-col sm:flex-row items-center gap-6">
                      {qrData && <img src={qrData} alt="UPI QR Code" width={220} height={220} className="border p-2 shrink-0" />}
                      <div className="text-sm text-espresso/80 space-y-2">
                        <div className="text-lg font-display text-wine">Scan with any UPI app</div>
                        <div>Open GPay, PhonePe, Paytm or any UPI app on your phone → scan the QR → pay {inr(amountToPay)}.</div>
                        <div className="pt-2 text-xs text-espresso/60">The amount and payment details are already inside the QR.</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={'p-5 border-2 ' + (returnedFromApp ? 'border-wine bg-blush/30 animate-pulse' : 'border-taupe/30 bg-white')}>
                  <div className="text-xs uppercase tracking-widest text-espresso/70">Step 2</div>
                  <div className="font-display text-lg text-espresso mt-1">Done paying?</div>
                  <p className="text-xs text-espresso/60 mt-1">Once you have paid {inr(amountToPay)}, tap the button below. We check the payment within 2 hours.</p>
                  <button type="button" onClick={submitOrder} disabled={loading}
                    className="btn-primary w-full mt-4 text-base">
                    {loading ? 'Placing order…' : 'I have paid ' + inr(amountToPay) + ' — confirm order'}
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <button type="button" onClick={() => setStep('verify')} className="text-xs uppercase tracking-widest text-espresso/60 underline">← Back</button>
                  <p className="text-[11px] text-espresso/60 text-right">🔒 By placing this order you accept our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy-policy" className="underline">Privacy</Link>.</p>
                </div>
              </div>
            )}
          </div>

          <div className="border border-taupe/20 p-6 bg-blush/20 h-fit md:sticky md:top-24">
            <div className="text-xs uppercase tracking-widest text-espresso/60 mb-4">Order summary</div>
            {items.map((it, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-taupe/20 mb-3">
                <div className="relative w-16 h-20 bg-ivory shrink-0">
                  <Image src={it.image} alt={it.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="text-sm">
                  <div className="text-espresso font-medium">{it.name}</div>
                  <div className="text-xs text-espresso/60">Size {it.size} · Qty {it.quantity}</div>
                  <div className="text-wine font-semibold mt-1">{inr(it.price * it.quantity)}</div>
                </div>
              </div>
            ))}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{inr(fullTotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="text-wine">Free</span></div>
              {paymentMethod === 'PREPAID' && (
                <div className="flex justify-between text-green-800">
                  <span>UPI discount</span><span>-{inr(PAYMENT.prepaidSavings * qty)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-taupe/30 font-semibold">
              <span>Total</span>
              <span>{paymentMethod === 'PREPAID' ? inr(prepaidTotal) : inr(fullTotal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
