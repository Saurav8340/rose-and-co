import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isCorrect } from '@/lib/captcha';
import { captchaVerifySchema } from '@/lib/validate';
import { rateLimit, getIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const ip = getIp(req);
  const rl = rateLimit(`captchaverify:${ip}`, 20, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const parsed = captchaVerifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid' }, { status: 400 });

  const { token, code, mobile } = parsed.data;

  const session = await prisma.verificationSession.findUnique({ where: { token } });
  if (!session) return NextResponse.json({ error: 'Session expired. Please restart.' }, { status: 400 });
  if (session.mobile !== mobile) return NextResponse.json({ error: 'Mobile mismatch. Please restart.' }, { status: 400 });
  if (session.expiresAt < new Date()) return NextResponse.json({ error: 'Verification expired. Please try again.' }, { status: 400 });
  if (session.attempts >= 5) return NextResponse.json({ error: 'Too many wrong answers. Please refresh.' }, { status: 400 });

  await prisma.verificationSession.update({
    where: { token }, data: { attempts: session.attempts + 1 },
  });

  if (!isCorrect(code, session.captcha)) {
    return NextResponse.json({ error: 'Wrong answer. Try again.' }, { status: 400 });
  }

  await prisma.verificationSession.update({ where: { token }, data: { verified: true } });
  return NextResponse.json({ ok: true });
}




