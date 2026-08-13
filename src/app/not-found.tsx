import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center max-w-lg mx-auto">
      <h1 className="font-display text-6xl text-ivory">404</h1>
      <p className="mt-4 text-ivory/70">We do not have a page at this URL.</p>
      <Link href="/" className="btn-primary mt-8">Back to shop</Link>
    </div>
  );
}
