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
import CheckoutProgressBar from '@/components/CheckoutProgressBar';
import GiftWrap from '@/components/GiftWrap';

type Step = 'address' | 'verify' | 'payment' | 'done';

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
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

  const [captchaQuestion, setCaptchaQuestion] = useState<string>('');
  const [captchaType, setCaptchaType] = useState<'math' | 'text'>('math');
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [captchaInput, setCaptchaInput] = useState<string>('');

  const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'PARTIAL_COD'>('PREPAID');
  const [giftWrap, setGiftWrap] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [returnedFromApp, setReturnedFromApp] = useState(false);

  useEffect(() => { setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)); }, []);

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
  const giftWrapAmount = giftWrap ? 49 : 0;
  const fullTotal    = PAYMENT.fullPrice * qty + giftWrapAmount;
  const prepaidTotal = PAYMENT.prepaidPrice * qty + giftWrapAmount;
  const codDeposit   = PAYMENT.codDeposit * qty + giftWrapAmount;
  const codRemaining = PAYMENT.codRemaining * qty;

  const amountToPay = paymentMethod === 'PREPAID' ? prepaidTotal : codDeposit;
  const orderNote = ('RoseAndCo ' + (form.fullName || 'Order') + (giftWrap ? ' [GIFT-WRAP]' : '')).slice(0, 60);

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return setErr('Enter valid 10-digit mobile');
    if (!/^[1-9]\d{5}$/.test(form.pincode)) return setErr('Enter valid PIN');
    if (!form.fullName || form.fullName.length < 2) return setErr('Enter your full name');
    if (!form.addressLine1 || form.addressLine1.length < 5) return setErr('Enter your address');
    if (!form.city || !form.state) return setErr('City and state required');
    setLoading(true);
    try {
      const res = await fetch('/api/captcha/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: form.mobile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCaptchaQuestion(data.question);
      setCaptchaType(data.type);
      setCaptchaToken(data.token);
      setCaptchaInput('');
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
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCaptchaQuestion(data.question);
      setCaptchaType(data.type);
      setCaptchaToken(data.token);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const verifyCaptcha = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setLoading(true);
    try {
      const res = await fetch('/api/captcha/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken, code: captchaInput, mobile: form.mobile }),
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
          verificationToken: captchaToken, ...form,
          paymentMethod, productId: it.productId, size: it.size, quantity: it.quantity,
          paidConfirmed: true, website: honeypot, startedAt: startedAt.current,
          metaFbc: readCookie('_fbc'), metaFbp: readCookie('_fbp'), utm: serializedUtm(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed');
      setStep('done');
      const successUrl = `/order-success?id=${data.orderNumber}`;
      window.location.href = successUrl;
      setTimeout(() => { try { clear(); } catch {} router.push(successUrl); }, 500);
    } catch (e: any) { submitting.current = false; setErr(e.message); }
    finally { setLoading(false); }
  };

  const markPaymentStarted = () => setPaymentStarted(true);

  return (
    <div className="container-x py-6 md:py-10 max-w-4xl">
      <input type="text" name="website" tabIndex={-1} autoComplete="off"
        value={honeypot} onChange={e => setHoneypot(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        aria-hidden="true" />

      <CheckoutProgressBar step={step} />

      <div className="flex items-center justify-between mb-8 text-xs uppercase tracking-widest">
        {[
          { s: 'address', l: 'Address' },
          { s: 'verify',  l: 'Quick check' },
          { s: 'payment', l: 'Payment' },
        ].map(x => (
          <div key={x.s} className={'flex-1 text-center py-2 border-b-2 ' + (step === x.s ? 'border-wine text-wine' : 'border-taupe/20 text-espresso/40')}>{x.l}</div>
        ))}
      </div>

      {err && <div className="p-3 mb-4 bg-wine/10 text-wine border border-wine/30 text-sm">{err}</div>}

      {step === 'done' && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-wine text-ivory flex items-center justify-center text-3xl mb-4">&#10003;</div>
          <div className="font-display text-2xl text-espresso">Order placed. Taking you to your confirmation...</div>
        </div>
      )}

      {step !== 'done' && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {step === 'address' && (
              <form onSubmit={submitAddress} className="space-y-4" autoComplete="on">
                <h2 className="font-display text-2xl text-espresso">Where should we send it?</h2>

                <div>
                  <label htmlFor="fullName" className="label">Your name</label>
                  <input id="fullName" name="name" type="text" required autoFocus autoComplete="name" enterKeyHint="next" className="input" value={form.fullName} onChange={e => setField('fullName', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="mobile" className="label">Mobile</label>
                    <input id="mobile" name="tel" type="tel" required inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} autoComplete="tel-national" enterKeyHint="next" className="input" placeholder="10-digit number" value={form.mobile} onChange={e => setField('mobile', e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div>
                    <label htmlFor="email" className="label">Email (optional)</label>
                    <input id="email" name="email" type="email" autoComplete="email" enterKeyHint="next" className="input" value={form.email} onChange={e => setField('email', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="pincode" className="label">PIN</label>
                    <input id="pincode" name="postal-code" type="text" required inputMode="numeric" maxLength={6} autoComplete="postal-code" enterKeyHint="next" className="input" value={form.pincode} onChange={e => setField('pincode', e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div>
                    <label htmlFor="city" className="label">City</label>
                    <input id="city" name="city" type="text" required autoComplete="address-level2" enterKeyHint="next" className="input" value={form.city} onChange={e => setField('city', e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="state" className="label">State</label>
                    <input id="state" name="state" type="text" required autoComplete="address-level1" enterKeyHint="next" className="input" value={form.state} onChange={e => setField('state', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label htmlFor="addressLine1" className="label">Address</label>
                  <input id="addressLine1" name="address-line1" type="text" required autoComplete="address-line1" enterKeyHint="next" className="input" placeholder="House / flat, street" value={form.addressLine1} onChange={e => setField('addressLine1', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="landmark" className="label">Landmark (optional)</label>
                    <input id="landmark" name="address-line2" type="text" autoComplete="address-line2" enterKeyHint="next" className="input" value={form.landmark} onChange={e => setField('landmark', e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="altPhone" className="label">Alt phone (optional)</label>
                    <input id="altPhone" name="tel-alt" type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" enterKeyHint="done" className="input" value={form.altPhone} onChange={e => setField('altPhone', e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>

                <div className="pt-3">
                  <GiftWrap enabled={giftWrap} onChange={setGiftWrap} />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Please wait...' : 'Continue'}
                </button>
              </form>
            )}

            {step === 'verify' && (
              <form onSubmit={verifyCaptcha} className="space-y-6 max-w-md">
                <h2 className="font-display text-2xl text-espresso">A quick check.</h2>
                <p className="text-sm text-espresso/70">
                  {captchaType === 'math' ? 'Solve this to confirm you are a person.' : 'Type the four characters below.'}
                </p>

                <div className="relative">
                  <div className="p-8 bg-blush/40 border-2 border-taupe/30 flex items-center justify-center">
                    <div
                      className={`select-none font-display text-espresso ${captchaType === 'math' ? 'text-5xl' : 'text-5xl tracking-[0.3em]'}`}
                      style={{
                        textShadow: captchaType === 'text' ? '1px 1px 0 rgba(139,117,104,0.15)' : 'none',
                        letterSpacing: captchaType === 'math' ? '0.15em' : '0.3em',
                      }}
                    >
                      {captchaQuestion}{captchaType === 'math' ? ' = ?' : ''}
                    </div>
                  </div>
                  <button type="button" onClick={refreshCaptcha} disabled={loading}
                    className="absolute top-2 right-2 text-xs uppercase tracking-widest text-wine underline"
                    aria-label="Get a new question">
                    Refresh
                  </button>
                </div>

                <div>
                  <label className="label">Your answer</label>
                  <input required autoFocus autoComplete="off"
                    inputMode={captchaType === 'math' ? 'numeric' : 'text'}
                    className={'input text-center text-2xl ' + (captchaType === 'text' ? 'uppercase tracking-[0.3em]' : '')}
                    maxLength={captchaType === 'math' ? 4 : 6}
                    value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value)}
                    placeholder={captchaType === 'math' ? '12' : 'AB3D'} />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep('address')} className="btn-secondary">Back</button>
                  <button type="submit" disabled={loading || !captchaInput} className="btn-primary flex-1">{loading ? 'Checking...' : 'Continue'}</button>
                </div>
              </form>
            )}

            {step === 'payment' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl text-espresso">How would you like to pay?</h2>

                <div className="space-y-3">
                  <label className={'cursor-pointer block p-5 border-2 ' + (paymentMethod === 'PREPAID' ? 'border-wine bg-blush/30' : 'border-taupe/30 bg-white')}>
                    <input type="radio" name="pm" className="sr-only" checked={paymentMethod === 'PREPAID'} onChange={() => setPaymentMethod('PREPAID')} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-display text-lg text-espresso">Pay in full via UPI</div>
                        <div className="text-sm text-espresso/70 mt-1">Rs 100 off.</div>
                      </div>
                      <div className="text-xl font-semibold text-wine">{inr(prepaidTotal)}</div>
                    </div>
                  </label>

                  <label className={'cursor-pointer block p-5 border-2 ' + (paymentMethod === 'PARTIAL_COD' ? 'border-wine bg-blush/30' : 'border-taupe/30 bg-white')}>
                    <input type="radio" name="pm" className="sr-only" checked={paymentMethod === 'PARTIAL_COD'} onChange={() => setPaymentMethod('PARTIAL_COD')} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-display text-lg text-espresso">Partial cash on delivery</div>
                        <div className="text-sm text-espresso/70 mt-1">{inr(codDeposit)} now, {inr(codRemaining)} on delivery.</div>
                      </div>
                      <div className="text-xl font-semibold text-espresso">{inr(fullTotal)}</div>
                    </div>
                  </label>
                </div>

                <div className="p-5 bg-ivory border border-taupe/30 text-center">
                  <div className="text-xs uppercase tracking-widest text-espresso/60">Pay now</div>
                  <div className="text-4xl font-semibold text-wine mt-1">{inr(amountToPay)}</div>
                </div>

                {isMobile ? (
                  <div onClick={markPaymentStarted}>
                    <UpiButtons amount={amountToPay} note={orderNote} />
                  </div>
                ) : (
                  <div className="p-6 bg-white border border-taupe/30 flex flex-col sm:flex-row items-center gap-6">
                    {qrData && <img src={qrData} alt="UPI QR Code" width={220} height={220} className="border p-2 shrink-0" />}
                    <div className="text-sm text-espresso/80">
                      <div className="text-lg font-display text-wine">Scan with any UPI app.</div>
                      <p className="mt-2">Open GPay, PhonePe, Paytm or any UPI app on your phone. Scan the QR. Pay {inr(amountToPay)}.</p>
                    </div>
                  </div>
                )}

                <div className={'p-5 border-2 ' + (returnedFromApp ? 'border-wine bg-blush/30 animate-pulse' : 'border-taupe/30 bg-white')}>
                  <div className="font-display text-lg text-espresso">Done paying?</div>
                  <p className="text-xs text-espresso/60 mt-1">We verify the payment within a couple of hours. Tap below when you have paid.</p>
                  <button type="button" onClick={submitOrder} disabled={loading} className="btn-primary w-full mt-4 text-base">
                    {loading ? 'Placing order...' : 'I have paid ' + inr(amountToPay)}
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <button type="button" onClick={() => setStep('verify')} className="text-xs uppercase tracking-widest text-espresso/60 underline">Back</button>
                  <p className="text-[11px] text-espresso/60 text-right">
                    By placing this order you accept our <Link href="/terms" className="underline">terms</Link>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Simple, quiet sidebar */}
          <div className="border border-taupe/20 p-6 bg-blush/20 h-fit md:sticky md:top-24">
            <div className="text-xs uppercase tracking-widest text-espresso/60 mb-4">Summary</div>
            {items.map((it, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-taupe/20 mb-3">
                <div className="relative w-16 h-20 bg-ivory shrink-0">
                  <Image src={it.image} alt={it.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="text-sm">
                  <div className="text-espresso font-medium">{it.name}</div>
                  <div className="text-xs text-espresso/60">Size {it.size} &middot; Qty {it.quantity}</div>
                  <div className="text-wine font-semibold mt-1">{inr(it.price * it.quantity)}</div>
                </div>
              </div>
            ))}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{inr(PAYMENT.fullPrice * qty)}</span></div>
              {giftWrap && (<div className="flex justify-between text-espresso/70"><span>Gift wrap</span><span>+ Rs 49</span></div>)}
              <div className="flex justify-between"><span>Shipping</span><span className="text-wine">Free</span></div>
              {paymentMethod === 'PREPAID' && (
                <div className="flex justify-between text-wine"><span>UPI discount</span><span>-{inr(PAYMENT.prepaidSavings * qty)}</span></div>
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
