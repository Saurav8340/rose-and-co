import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { captchaVerifySchema } from '@/lib/validate';
import { rateLimit, getIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const ip = getIp(req);
  const rl = rateLimit(`verify:${ip}`, 30, 5 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const parsed = captchaVerifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid' }, { status: 400 });

  const { token, code, mobile } = parsed.data;
  const session = await prisma.verificationSession.findUnique({ where: { token } });
  if (!session) return NextResponse.json({ error: 'Session expired. Refresh captcha.' }, { status: 400 });
  if (session.mobile !== mobile) return NextResponse.json({ error: 'Mobile mismatch' }, { status: 400 });
  if (session.expiresAt < new Date()) return NextResponse.json({ error: 'Session expired' }, { status: 400 });
  if (session.attempts >= 5) return NextResponse.json({ error: 'Too many attempts. Refresh captcha.' }, { status: 400 });

  const ok = session.captcha.toUpperCase() === code.toUpperCase();
  await prisma.verificationSession.update({
    where: { token }, data: { attempts: { increment: 1 }, verified: ok },
  });
  if (!ok) return NextResponse.json({ error: 'Incorrect captcha' }, { status: 400 });

  return NextResponse.json({ verified: true });
}
