import { SITE } from '@/lib/constants';

export const metadata = { title: 'FAQ' };

const sections: { title: string; items: [string, string][] }[] = [
  {
    title: 'Shipping and delivery',
    items: [
      ['How fast do you actually ship?', 'From our Gurugram unit within 24 to 48 hours after your payment clears. Delhivery Standard picks up at 6 PM daily.'],
      ['When will it reach me?', 'Metros - 3 to 5 working days (Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Pune, Kolkata). Tier-2 cities - 5 to 7. North-East and remote pincodes - up to 10.'],
      ['Do you ship internationally?', 'Not yet. India only.'],
      ['How do I get tracking?', 'Delhivery sends the tracking link via SMS to your registered mobile once the courier picks it up.'],
      ['Who does the delivery?', 'Delhivery for most pincodes. Ecom Express or Xpressbees for a handful of remote zones.'],
      ['What if I&apos;m not home?', 'Delhivery attempts 3 times. If all 3 fail, it comes back to us and we refund the online-paid amount in 7 working days.'],
    ],
  },
  {
    title: 'Payment',
    items: [
      ['What payment methods do you take?', 'UPI only. GPay, PhonePe, Paytm, BHIM, Amazon Pay, CRED - all work. No cards, no netbanking.'],
      ['Why no cards or netbanking?', 'Because we\\\'re small. Card gateway integrations cost us Rs 15,000/month in fees plus per-transaction. Not worth it at our volume. UPI does the same job at 0% fee.'],
      ['Is COD available?', 'Partial only. Rs 299 online on UPI, Rs 1,200 in cash to the delivery boy. Total Rs 1,499.'],
      ['Why not full COD?', 'Tried it. Hit 30% RTO in month one - people ordered on a whim and refused delivery. Every refused Rs 1,499 COD costs us Rs 200 in wasted shipping and packaging. Partial COD keeps the price at Rs 1,499 for actual buyers.'],
      ['Payment shows PENDING - problem?', 'No. We manually verify every UPI transaction against our bank statement. Usually done in an hour, always within 2. If it stays PENDING past 4 hours, email us with the UTR.'],
      ['Money left my account but no order confirmation?', 'Email us with the UPI reference number and the amount. We\\\'ll create the order manually within an hour.'],
    ],
  },
  {
    title: 'Product and fit',
    items: [
      ['What is the fabric exactly?', 'Poly-satin blend, 90 to 100 GSM. It falls with weight, doesn&apos;t stick to your skin. Not the shiny slippery kind you get in Rs 500 satin skirts on Meesho.'],
      ['Is the print really hand-painted?', 'Yes. Each fabric panel is hand-painted before cutting. Because of that, your swirl pattern will look slightly different from the photos. Same three tones, different placement.'],
      ['How does the sizing run?', 'True to Zara / H&amp;M sizing. Between XS and S, go XS. Between S and M, size down for top and up for skirt. Between L and XL, go XL - satin does not stretch.'],
      ['What about care?', 'Dry clean is safest. Gentle hand-wash in cold water works too. Never tumble dry. Never wring. Iron on the reverse only, low heat.'],
      ['Will the print fade?', 'The pigment is bonded into the fibre. If you hand-wash cold and skip the bleach, it stays true through 30+ washes (we tested).'],
    ],
  },
  {
    title: 'Returns and exchanges',
    items: [
      ['Can I return it?', 'Yes, within 7 days of delivery. Tags on, unworn, unwashed, original packaging.'],
      ['How does the return work?', 'Email us at care@roseandco.in with your order number. Delhivery does a free reverse pickup from your address. Once we receive and check it (2 working days), refund starts. Money lands in 5 to 7 working days.'],
      ['Can I exchange sizes?', 'Yes, free, subject to stock. Same product, different size. We can&apos;t swap prints because every set is unique.'],
      ['What if it arrives damaged?', 'Email us within 48 hours with a photo. Full refund + free return pickup. No back and forth.'],
    ],
  },
  {
    title: 'Order changes',
    items: [
      ['Can I change my address?', 'Yes, if you email us within 4 hours of placing the order. After that Delhivery has picked it up and we can&apos;t redirect.'],
      ['Can I cancel?', 'Free cancellation any time before dispatch. Refund of anything you paid online lands in 5 to 7 working days.'],
    ],
  },
];

export default function FAQ() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Help centre</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3">Common questions</h1>

      <div className="mt-10 space-y-10">
        {sections.map(sec => (
          <div key={sec.title}>
            <h2 className="font-display text-2xl text-espresso mb-4">{sec.title}</h2>
            <div className="space-y-3">
              {sec.items.map(([q, a]) => (
                <details key={q} className="border border-taupe/20 p-4 bg-white group">
                  <summary className="cursor-pointer font-medium text-espresso flex justify-between">
                    <span dangerouslySetInnerHTML={{ __html: q }} />
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
        <p className="text-sm text-espresso/80">Didn&apos;t find what you were looking for?</p>
        <a className="mt-2 inline-block underline text-wine" href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </div>
    </div>
  );
}
