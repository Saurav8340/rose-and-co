import { SITE } from '@/lib/constants';
import { sanitizeHtml } from "@/lib/sanitize";

export const metadata = { title: 'Questions' };

const sections: { title: string; items: [string, string][] }[] = [
  {
    title: 'Shipping and delivery',
    items: [
      ['When will my order reach me?', 'Metros usually see it in three to five working days. Smaller cities in five to seven. Everything ships from our Gurugram studio within forty-eight hours of your order.'],
      ['Do you ship internationally?', 'Not yet. India only, for now.'],
      ['Who handles the delivery?', 'Delhivery, mostly. A handful of remote pincodes are served by Ecom Express or Xpressbees.'],
      ['How do I track it?', 'A tracking link goes to your registered mobile once the courier picks it up.'],
      ["What happens if I'm not home?", 'The courier tries three times. If all three fail, it comes back to us and we refund what you paid.'],
    ],
  },
  {
    title: 'Payment',
    items: [
      ['Which methods do you accept?', 'UPI only. GPay, PhonePe, Paytm, BHIM, Amazon Pay, CRED. No cards or netbanking yet.'],
      ['Why UPI only?', 'Because we are small. Card gateways cost more than they are worth at our volume. UPI does the same job at no fee.'],
      ['Is cash on delivery available?', 'Partial. A small deposit online, the rest in cash when it arrives.'],
      ['Why not full COD?', 'We tried, and thirty percent came back. Every refused delivery costs us in shipping. A small deposit keeps the piece here for someone who actually wants it.'],
      ['My payment is pending, is something wrong?', "No. We check every UPI payment against our bank statement by hand. Usually done in an hour. If it's been more than four hours, email us with the UTR."],
      ['My money left, but no order confirmation.', 'Write to us with the UPI reference and the amount. We create the order manually, usually within the hour.'],
    ],
  },
  {
    title: 'Product and fit',
    items: [
      ['Is the hardware actually metal?', 'Yes. Real D-rings, buckles, and chain — not a graphic printed on. It has weight, and it holds.'],
      ['Are the corsets actually boned?', 'Yes. Steel boning, not a soft shell pretending to have structure. Lace it how you like — snug or loose.'],
      ['How does the sizing run?', 'True to Zara and H&amp;M. Between sizes, check the specific notes on each product page &mdash; corsets and mesh fit differently.'],
      ['How do I take care of it?', 'Hand-wash cold for mesh and fishnet. Spot-clean hardware, don\'t submerge it. Never tumble dry. Full details on the care guide.'],
      ['Will the hardware tarnish?', 'Not with normal wear. Keep it dry and it holds its finish.'],
    ],
  },
  {
    title: 'Returns',
    items: [
      ['Can I return it?', 'Yes, within seven days of it arriving. Tags on, unworn, unwashed, original packaging.'],
      ['How does the return work?', 'Email us at care@roseandco.in with your order number. We arrange a free pickup. Once we check it in, the refund is on its way &mdash; usually about a week.'],
      ['Can I exchange for a different size?', 'Yes, free, if the size you want is in stock.'],
      ['It arrived damaged.', 'Email within forty-eight hours with a photo. Full refund. We arrange the pickup. No back and forth.'],
    ],
  },
  {
    title: 'Order changes',
    items: [
      ['Can I change my address?', 'Yes, within four hours of ordering. After that, the courier has picked it up.'],
      ['Can I cancel?', 'Any time before dispatch. Anything you paid online lands back in about a week.'],
    ],
  },
];

export default function FAQ() {
  return (
    <div className="container-x py-16 max-w-2xl">
      <div className="text-xs uppercase tracking-[0.3em] text-crimson">Help</div>
      <h1 className="font-display text-4xl md:text-5xl text-ivory mt-3">A few common questions.</h1>

      <div className="mt-12 space-y-12">
        {sections.map(sec => (
          <div key={sec.title}>
            <h2 className="font-display text-2xl text-ivory mb-4">{sec.title}</h2>
            <div className="space-y-3">
              {sec.items.map(([q, a]) => (
                <details key={q} className="border-b border-taupe/20 pb-4 pt-4 group">
                  <summary className="cursor-pointer font-medium text-ivory flex justify-between text-[15px]">
                    <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(q) }} />
                    <span className="group-open:rotate-45 transition ml-4 text-crimson">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-ivory/70 leading-[1.8]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(a) }} />
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-6 border border-taupe/20 text-center">
        <p className="text-sm text-ivory/80">Anything else? Write to us.</p>
        <a className="mt-2 inline-block underline text-crimson" href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </div>
    </div>
  );
}



