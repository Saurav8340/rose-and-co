import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { UPI } from '@/lib/constants';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount || 0);
  const note = String(body.orderNote || 'Rose And Co Order').slice(0, 60);
  if (amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

  const params = new URLSearchParams({
    pa: UPI.id, pn: UPI.name, am: String(amount), cu: 'INR', tn: note,
  }).toString();
  const upiUri = `upi://pay?${params}`;

  const qr = await QRCode.toDataURL(upiUri, {
    errorCorrectionLevel: 'M', margin: 1, width: 400,
    color: { dark: '#2B1810', light: '#FAF6F0' },
  });
  return NextResponse.json({ qr, upiUri });
}




