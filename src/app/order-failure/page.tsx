import Link from 'next/link';
import { SITE } from '@/lib/constants';

export default function OrderFailure() {
  return (
    <div className="container-x py-20 text-center max-w-2xl">
      <div className="w-16 h-16 rounded-full bg-wine/20 text-crimson mx-auto flex items-center justify-center text-3xl">!</div>
      <h1 className="font-display text-4xl mt-6 text-ivory">Order did not go through.</h1>
      <p className="mt-4 text-ivory/70 leading-relaxed">
        No money has left your account permanently. If UPI did deduct it, email us at <a className="underline text-crimson hover:text-ivory transition" href={`mailto:${SITE.email}`}>{SITE.email}</a> with your UPI transaction reference. We will create the order manually and confirm within an hour.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/checkout" className="btn-primary">Try again</Link>
        <Link href="/contact" className="btn-secondary">Email us</Link>
      </div>
    </div>
  );
}




