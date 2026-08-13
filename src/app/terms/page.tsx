import { SITE } from '@/lib/constants';

export const metadata = { title: 'Terms & Conditions' };

export default function Page() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <h1 className="font-display text-4xl text-ivory mb-2">Terms and conditions</h1>
      <p className="text-sm text-ivory/60 mb-8">Placing an order means you agree to what is below.</p>

      <div className="text-ivory/80 leading-relaxed space-y-6">
        <div>
          <h2 className="font-display text-xl text-ivory mb-2">The product</h2>
          <p>Hardware finish and mesh tone can vary slightly from product photos because of (a) natural variation in metal plating, (b) how your screen displays colours, (c) how lighting hits fabric. This is not a defect.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Pricing</h2>
          <p>₹2,299 all-in. GST is included. Shipping is free. What you see is what you pay. If we change prices later, existing orders are not affected.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Payment</h2>
          <p>UPI only. Two options:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Full prepaid: ₹2,199 upfront</li>
            <li>Partial COD: ₹299 online + ₹2,000 in cash on delivery</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Payment verification</h2>
          <p>We match every UPI payment to your order manually. Usually done within 2 hours. Orders where we cannot match a payment within 24 hours are cancelled and any partial payment is refunded.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Cancellation</h2>
          <p>Free cancellation any time before we hand the order to the courier &mdash; usually within 24 hours of placing. After dispatch, use the returns flow.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Jurisdiction</h2>
          <p>Any dispute is subject to Gurugram, Haryana courts.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Intellectual property</h2>
          <p>All content, designs and photos on this site belong to Rosé & Co. Please do not lift them for your own brand.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Contact</h2>
          <p><a className="underline text-crimson" href={`mailto:${SITE.email}`}>{SITE.email}</a> for anything at all.</p>
        </div>
      </div>
    </div>
  );
}




