import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateChallenge } from '@/lib/captcha';
import { mobileSchema } from '@/lib/validate';
import { rateLimit, getIp } from '@/lib/rateLimit';
import crypto from 'crypto';

export async function POST(req: Request) {
  const ip = getIp(req);
  const rl = rateLimit(`captcha:${ip}`, 10, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const parsed = mobileSchema.safeParse(body?.mobile);
  if (!parsed.success) return NextResponse.json({ error: 'Enter valid mobile' }, { status: 400 });

  const mobile = parsed.data;
  const challenge = generateChallenge();
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60_000);

  await prisma.verificationSession.create({
    data: { token, mobile, captcha: challenge.answer, verified: false, attempts: 0, expiresAt },
  });

  return NextResponse.json({ token, question: challenge.question, type: challenge.type });
}



