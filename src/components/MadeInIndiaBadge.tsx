export default function MadeInIndiaBadge() {
  return (
    <div className="hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-ivory/70 border border-taupe/40 px-2 py-1 rounded">
      <span className="inline-block w-4 h-3 rounded-sm overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(180deg, #FF9933 33%, #FFF 33% 66%, #138808 66%)' }} />
      <span>Made in India</span>
    </div>
  );
}
