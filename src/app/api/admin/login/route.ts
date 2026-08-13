import { NextResponse } from 'next/server';
import { signAdminSession } from '@/lib/session';
import { rateLimit, getIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const ip = getIp(req);
  const rl = rateLimit(`adminLogin:${ip}`, 10, 15 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });

  const { email, password } = await req.json().catch(() => ({}));
  const ok = email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  await signAdminSession(email);
  return NextResponse.json({ ok: true });
}




