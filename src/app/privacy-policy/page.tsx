import { SITE } from '@/lib/constants';

export const metadata = { title: 'Privacy Policy' };

export default function Page() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <h1 className="font-display text-4xl text-ivory mb-2">Privacy policy</h1>
      <p className="text-sm text-ivory/60 mb-8">Last updated: 1 January 2026</p>

      <div className="text-ivory/80 leading-relaxed space-y-6">
        <div>
          <h2 className="font-display text-xl text-ivory mb-2">What we collect</h2>
          <p>Your name, mobile, address, PIN, email (if you share it), and your UPI transaction reference. That is it.</p>
        </div>
        <div>
          <h2 className="font-display text-xl text-ivory mb-2">What we do not collect</h2>
          <p>Card numbers, bank credentials, biometrics, browsing history outside our site &mdash; none of that.</p>
        </div>
        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Why we collect it</h2>
          <p>To ship your order, verify your payment, and update you when the package moves. That is the entire reason.</p>
        </div>
        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Who we share it with</h2>
          <p>Our courier partners get your name, address, and mobile so they can deliver. That is the only third party we share personal data with. We do not sell your data.</p>
        </div>
        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Marketing messages</h2>
          <p>We do not spam you with WhatsApp or SMS blasts. If we message you, it is about your order.</p>
        </div>
        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Analytics and cookies</h2>
          <p>We use Meta Pixel to measure ad performance. It drops standard cookies in your browser. You can block these in browser settings &mdash; the site will still work.</p>
        </div>
        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Your rights</h2>
          <p>Email <a className="underline text-wine" href={`mailto:${SITE.email}`}>{SITE.email}</a> to see your data, correct it, or delete it. We will do it within 7 working days.</p>
        </div>
        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Data storage</h2>
          <p>Data lives in an encrypted Postgres database. Access is limited to two people on our team. Payment credentials are never stored.</p>
        </div>
      </div>
    </div>
  );
}
