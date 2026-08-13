export default function CheckoutProgressBar({ step }: { step: 'address' | 'verify' | 'payment' | 'done' }) {
  const map: Record<string, number> = { address: 0.25, verify: 0.5, payment: 0.85, done: 1 };
  const pct = (map[step] || 0.25) * 100;

  return (
    <div className="mb-6">
      <div className="h-1 bg-taupe/20 w-full overflow-hidden">
        <div className="h-full bg-wine transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}




