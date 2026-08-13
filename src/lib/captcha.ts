// Fast, human-friendly captcha (final v24)
// 60% math (2 + 3 = ?), 40% 4-char alphanumeric (AB3D)

const SAFE_CHARS = 'ACDEFGHJKMNPQRTUVWXY3467';

export type CaptchaChallenge = {
  question: string;
  answer: string;
  type: 'math' | 'text';
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMath(): CaptchaChallenge {
  const ops = ['+', '-', 'x'];
  const op = ops[randomInt(0, 2)];
  let a = randomInt(1, 9);
  let b = randomInt(1, 9);
  if (op === '-' && b > a) [a, b] = [b, a];
  let answer: number;
  if (op === '+') answer = a + b;
  else if (op === '-') answer = a - b;
  else answer = a * b;
  return { question: `${a} ${op} ${b}`, answer: String(answer), type: 'math' };
}

function generateText(): CaptchaChallenge {
  let code = '';
  for (let i = 0; i < 4; i++) code += SAFE_CHARS[randomInt(0, SAFE_CHARS.length - 1)];
  return { question: code, answer: code.toLowerCase(), type: 'text' };
}

export function generateChallenge(): CaptchaChallenge {
  return Math.random() < 0.6 ? generateMath() : generateText();
}

export function normalizeAnswer(input: string): string {
  return String(input || '').trim().toLowerCase().replace(/\s+/g, '');
}

export function isCorrect(userInput: string, expectedAnswer: string): boolean {
  return normalizeAnswer(userInput) === normalizeAnswer(expectedAnswer);
}

// Legacy compat (some old references)
export function generateCaptcha(): { text: string; svg: string } {
  const c = generateChallenge();
  return { text: c.answer, svg: '' };
}



