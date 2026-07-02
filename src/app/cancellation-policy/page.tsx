import { SITE } from '@/lib/constants';

export const metadata = { title: 'Cancellation Policy' };

export default function Page() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <h1 className="font-display text-4xl text-espresso mb-8">Cancellations</h1>

      <div className="text-espresso/80 leading-relaxed space-y-6">
        <p>You can cancel any order before it ships. Just email <a className="underline text-wine" href={`mailto:${SITE.email}`}>{SITE.email}</a> with your order number.</p>

        <div className="p-5 bg-blush/30 border-l-4 border-wine">
          <h2 className="font-display text-xl text-espresso mb-2">Before dispatch</h2>
          <p>Full refund of anything you paid online. Refund lands in your original payment method in 5–7 working days.</p>
        </div>

        <div className="p-5 bg-white border border-taupe/20">
          <h2 className="font-display text-xl text-espresso mb-2">After dispatch</h2>
          <p>Can not cancel &mdash; the order is already with the courier. You have two options:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Refuse delivery when the courier arrives. It comes back to us and we refund the online-paid amount within 7 working days.</li>
            <li>Accept delivery and return it under our Refund Policy within 7 days.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
