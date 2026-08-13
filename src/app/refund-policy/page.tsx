import { SITE } from '@/lib/constants';

export const metadata = { title: 'Returns & Refund Policy' };

export default function Page() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <h1 className="font-display text-4xl text-ivory mb-8">Returns and refunds</h1>

      <div className="text-ivory/80 leading-relaxed space-y-6">
        <div className="p-5 bg-blush/40 border-l-4 border-wine rounded">
          <p><b>Return window:</b> 7 days from delivery.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">What we accept</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Unworn, unwashed pieces</li>
            <li>Original tags still attached</li>
            <li>Original packaging intact</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">What we do not accept</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Anything worn or washed, even once</li>
            <li>Missing tags or packaging</li>
            <li>Signs of alteration</li>
            <li>Items ordered more than 7 days ago</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">How to return</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Email <a className="underline text-wine" href={`mailto:${SITE.email}`}>{SITE.email}</a> with your order number and reason.</li>
            <li>We arrange a reverse pickup &mdash; the courier collects from your address. You do not need to send it yourself.</li>
            <li>Once we receive and check it (2 working days), refund is initiated.</li>
            <li>Refund lands in your original payment source in 5–7 working days.</li>
          </ol>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Exchanges</h2>
          <p>Free size exchange within 7 days, subject to stock. Same product, different size only.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">If we shipped the wrong item or a defective one</h2>
          <p>Email us within 48 hours with a photo. Full refund + free return pickup. No back-and-forth, no questions.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Partial COD orders</h2>
          <p>If you paid a deposit online plus cash on delivery, the refund covers both amounts. The online deposit lands back in your UPI. The cash portion is refunded to a bank account you share via email.</p>
        </div>
      </div>
    </div>
  );
}
