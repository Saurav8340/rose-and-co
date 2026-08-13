export function generateOrderNumber(): string {
  const y = new Date().getFullYear().toString().slice(-2);
  const m = String(new Date().getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `RC${y}${m}${rand}`;
}



