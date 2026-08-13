export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
export const clsx = (...args: Array<string | false | null | undefined>) => args.filter(Boolean).join(' ');




