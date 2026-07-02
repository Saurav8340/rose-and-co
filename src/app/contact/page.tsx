import { SITE } from '@/lib/constants';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <div className="container-x py-16 max-w-2xl">
      <h1 className="font-display text-4xl text-espresso">Get in touch</h1>
      <p className="mt-3 text-espresso/70 leading-relaxed">
        Fastest way to reach us is email. We reply within 24 hours &mdash; usually much faster on weekdays.
      </p>

      <div className="mt-8 grid gap-4 text-espresso">
        <div className="p-5 border border-taupe/30 bg-white">
          <div className="text-xs uppercase tracking-widest text-espresso/60 mb-1">Email</div>
          <a className="text-lg underline text-wine" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div>
        <div className="p-5 border border-taupe/30 bg-white">
          <div className="text-xs uppercase tracking-widest text-espresso/60 mb-1">Instagram</div>
          <a className="text-lg underline text-wine" href={SITE.instagram} target="_blank" rel="noopener">@roseandco</a>
          <p className="text-xs text-espresso/60 mt-2">DMs are open. Slower than email but we do check.</p>
        </div>
        <div className="p-5 border border-taupe/30 bg-white">
          <div className="text-xs uppercase tracking-widest text-espresso/60 mb-1">Address</div>
          <div className="text-sm">{SITE.address}</div>
          <p className="text-xs text-espresso/60 mt-2">Not a shopfront. Studio + fulfilment only.</p>
        </div>
      </div>

      <div className="mt-10 p-5 bg-blush/30 border border-taupe/20">
        <h2 className="font-display text-xl text-espresso">Before you write in</h2>
        <ul className="mt-3 text-sm text-espresso/80 space-y-2 list-disc pl-5">
          <li><b>Order help:</b> include your order number in the subject line.</li>
          <li><b>Sizing help:</b> tell us your height and usual size in Zara or H&M. We will pick for you.</li>
          <li><b>Payment issues:</b> attach your UPI transaction reference.</li>
          <li><b>Return / exchange:</b> just say &ldquo;return&rdquo; or &ldquo;exchange&rdquo; and your order number. We do the rest.</li>
        </ul>
      </div>
    </div>
  );
}
