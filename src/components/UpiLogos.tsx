export default function UpiLogos() {
  // Real brand colors kept as-is — factual app identities, not themeable.
  const apps = [
    { id: 'gpay', name: 'GPay', bg: 'linear-gradient(135deg,#4285F4 0%,#34A853 40%,#FBBC04 70%,#EA4335 100%)', letter: 'G', fg: '#fff' },
    { id: 'phonepe', name: 'PhonePe', bg: '#5F259F', letter: 'Pe', fg: '#fff' },
    { id: 'paytm', name: 'Paytm', bg: '#00BAF2', letter: 'P', fg: '#fff' },
    { id: 'bhim', name: 'BHIM', bg: '#00449E', letter: 'B', fg: '#fff' },
    { id: 'amazonpay', name: 'AmazonPay', bg: '#232F3E', letter: 'a', fg: '#FF9900' },
    { id: 'cred', name: 'CRED', bg: '#0F0F0F', letter: 'C', fg: '#fff' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] uppercase tracking-widest text-ivory/60 mr-1">Pay via</span>
      {apps.map(a => (
        <div key={a.id} className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold" style={{ background: a.bg, color: a.fg }} title={a.name}>
          {a.letter}
        </div>
      ))}
      <span className="text-[10px] text-ivory/60 ml-1">or any UPI app</span>
    </div>
  );
}
