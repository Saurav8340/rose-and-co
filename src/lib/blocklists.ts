// Bot User-Agent + disposable email detection

const BOT_UA_PATTERNS = [
  /bot/i, /crawl/i, /spider/i,
  /python-requests/i, /axios\//i, /curl\//i, /wget/i,
  /Go-http-client/i, /okhttp/i, /HeadlessChrome/i,
  /PostmanRuntime/i, /Java\/[\d]/i,
];

export function isBotUA(ua: string): boolean {
  if (!ua) return true;
  return BOT_UA_PATTERNS.some(rx => rx.test(ua));
}

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
  'yopmail.com', 'trashmail.com', 'throwawaymail.com', 'temp-mail.org',
  'sharklasers.com', 'getnada.com', 'dispostable.com', 'maildrop.cc',
  'mintemail.com', 'mytemp.email', 'discard.email', 'fakeinbox.com',
]);

export function isDisposableEmail(email: string): boolean {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}



