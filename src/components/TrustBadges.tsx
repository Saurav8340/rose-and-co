export default function TrustBadges() {
  const items = [
    { icon: 'FREE',   title: 'Free shipping',  sub: 'Anywhere in India' },
    { icon: '24-48',  title: 'Ships in',       sub: 'From Gurugram unit' },
    { icon: '7 DAYS', title: 'To return',      sub: 'Free reverse pickup' },
    { icon: 'UPI',    title: 'Secure checkout', sub: 'No cards, no netbanking' },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 py-4 border-y border-taupe/20">
      {items.map(x => (
        <div key={x.title} className="text-center">
          <div className="text-[10px] font-bold text-crimson tracking-wider">{x.icon}</div>
          <div className="text-xs font-medium text-ivory mt-1 leading-tight">{x.title}</div>
          <div className="text-[10px] text-ivory/60 mt-0.5">{x.sub}</div>
        </div>
      ))}
    </div>
  );
}




