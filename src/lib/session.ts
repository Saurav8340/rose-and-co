import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET || 'dev-secret-please-change-in-production-min-32chars';
const key = new TextEncoder().encode(secretKey);

export async function signAdminSession(email: string) {
  const token = await new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(key);
  cookies().set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = cookies().get('admin_session')?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.role === 'admin';
  } catch { return false; }
}

export function destroyAdminSession() { cookies().delete('admin_session'); }




