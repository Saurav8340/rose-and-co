// Server-side captcha generation (mixed alphanumeric)
export function generateCaptcha(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing chars (I,O,0,1)
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

// Simple SVG captcha renderer (server-side; distortion + noise)
export function renderCaptchaSVG(code: string): string {
  const w = 220, h = 70;
  const colors = ['#B03A4C', '#5C1A2B', '#8B7568', '#2B1810'];
  let chars = '';
  code.split('').forEach((c, i) => {
    const x = 22 + i * 30 + (Math.random() * 6 - 3);
    const y = 45 + (Math.random() * 12 - 6);
    const rot = (Math.random() * 40 - 20).toFixed(1);
    const col = colors[Math.floor(Math.random() * colors.length)];
    const size = 30 + Math.floor(Math.random() * 6);
    chars += `<text x="${x}" y="${y}" fill="${col}" font-family="Georgia,serif" font-weight="700" font-size="${size}" transform="rotate(${rot} ${x} ${y})">${c}</text>`;
  });
  let noise = '';
  for (let i = 0; i < 6; i++) {
    const x1 = Math.random() * w, y1 = Math.random() * h;
    const x2 = Math.random() * w, y2 = Math.random() * h;
    noise += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#B03A4C" stroke-opacity="0.35" stroke-width="1"/>`;
  }
  for (let i = 0; i < 40; i++) {
    noise += `<circle cx="${Math.random()*w}" cy="${Math.random()*h}" r="1" fill="#5C1A2B" fill-opacity="0.3"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="100%" height="100%" fill="#FAF6F0"/>
    ${noise}
    ${chars}
  </svg>`;
}
