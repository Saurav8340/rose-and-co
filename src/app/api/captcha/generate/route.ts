import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCaptcha, renderCaptchaSVG } from '@/lib/captcha';
import { rateLimit, getIp } from '@/lib/rateLimit';
import crypto from 'crypto';

export async function POST(req: Request) {
  const ip = getIp(req);
  const rl = rateLimit(`captcha:${ip}`, 20, 5 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const mobile = String(body.mobile || '').replace(/\D/g, '');
  if (!/^[6-9]\d{9}$/.test(mobile)) return NextResponse.json({ error: 'Invalid mobile' }, { status: 400 });

  const code = generateCaptcha(6);
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 10 * 60_000); // 10 min

  await prisma.verificationSession.create({
    data: { token, mobile, captcha: code, expiresAt },
  });

  const svg = renderCaptchaSVG(code);
  return NextResponse.json({ token, svg });
}
