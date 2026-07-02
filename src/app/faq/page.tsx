import { SITE } from '@/lib/constants';

export const metadata = { title: 'FAQ' };

const sections: { title: string; items: [string, string][] }[] = [
  {
    title: 'Shipping and delivery',
    items: [
      ['How long does delivery take?', 'Ships from Delhi NCR in 24–48 hours. Delivered in 3–5 business days to metros (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata). 5–7 days to smaller cities.'],
      ['Is shipping really free?', 'Yes. No minimum order value. ₹1,499 is what you pay.'],
      ['How will I know it has shipped?', 'You will get a tracking link via SMS on your registered mobile once the courier picks it up.'],
      ['Which courier do you use?', 'Delhivery for most pincodes. Ecom Express or Xpressbees for a few zones where Delhivery does not reach.'],
      ['What if the delivery fails?', 'The courier attempts three times. If all three fail, the order comes back to us and we refund the online-paid amount within 7 working days.'],
      ['Do you ship internationally?', 'Not yet. India only.'],
    ],
  },
  {
    title: 'Payment',
    items: [
      ['What payment methods do you accept?', 'UPI only. GPay, PhonePe, Paytm, BHIM, Amazon Pay, CRED &mdash; any UPI app works. No cards, no netbanking.'],
      ['Is COD available?', 'Partial COD only. Pay ₹300 online via UPI at checkout + ₹1,199 in cash when the order is delivered.'],
      ['Why not full COD?', 'Full COD gave us an RTO rate above 30% in early tests. To offer that, we would have had to price at ₹1,999. Partial COD keeps ₹1,499 possible.'],
      ['Payment shows PENDING &mdash; is that a problem?', 'No. We verify every UPI payment manually. Usually done within an hour, always within 2. If it stays PENDING beyond 4 hours, email us with your order number and UPI reference.'],
      ['Money left my account but I did not get a confirmation.', 'Email us with your UPI reference and the amount. We will create the order manually and confirm within an hour.'],
    ],
  },
  {
    title: 'Product and fit',
    items: [
      ['What is the fabric?', 'Poly-satin blend, around 90–100 GSM. Has weight, falls with drape. Not the thin shiny kind you see in ₹500 satin.'],
      ['Is the print really hand-painted?', 'Yes. Each panel is hand-painted before the fabric is cut. That means your swirl pattern will look slightly different from the one in the photos.'],
      ['How does the sizing run?', 'True to size for most women. Between sizes, we recommend sizing down for the top and up for the skirt. Size chart is on the product page.'],
      ['How do I care for it?', 'Dry clean is safest. Gentle hand-wash in cold water works fine too. Do not tumble dry. Do not wring.'],
      ['Will the print fade?', 'The pigment we use is colour-fast when hand-washed cold. Do not soak. Do not use bleach.'],
    ],
  },
  {
    title: 'Returns and exchanges',
    items: [
      ['Can I return it?', 'Yes, within 7 days of delivery. Tags on, unworn, unwashed, original packaging.'],
      ['How do returns work?', 'Email us with your order number and reason. We arrange a reverse pickup from your address. Once we receive and check it (2 working days), refund is initiated. Money lands in your original payment source in 5–7 working days.'],
      ['Can I exchange for a different size?', 'Yes, free of cost, subject to the size being in stock. Same product, different size only. Print swaps are not possible since every set is unique.'],
      ['What if the product arrives damaged or defective?', 'Email us within 48 hours with a photo. Full refund + free return pickup. No back-and-forth.'],
    ],
  },
  {
    title: 'Order changes',
    items: [
      ['Can I change my address after ordering?', 'Yes, if you email us within 4 hours of placing the order. After that, the order is already with the courier and cannot be modified.'],
      ['Can I cancel my order?', 'Free cancellation any time before the order ships. Email us. Full refund of anything you paid online lands in 5–7 working days.'],
    ],
  },
];

export default function FAQ() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Help centre</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3">Frequently asked questions</h1>

      <div className="mt-10 space-y-10">
        {sections.map(sec => (
          <div key={sec.title}>
            <h2 className="font-display text-2xl text-espresso mb-4">{sec.title}</h2>
            <div className="space-y-3">
              {sec.items.map(([q, a]) => (
                <details key={q} className="border border-taupe/20 p-4 bg-white group">
                  <summary className="cursor-pointer font-medium text-espresso flex justify-between">
                    <span>{q}</span>
                    <span className="group-open:rotate-45 transition ml-4">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-espresso/70 leading-relaxed" dangerouslySetInnerHTML={{ __html: a }} />
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-6 bg-blush/30 border border-taupe/20 text-center">
        <p className="text-sm text-espresso/80">Did not find what you were looking for?</p>
        <a className="mt-2 inline-block underline text-wine" href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </div>
    </div>
  );
}
