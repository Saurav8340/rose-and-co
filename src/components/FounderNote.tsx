export default function FounderNote() {
  return (
    <div className="mt-16 p-8 md:p-12 bg-blush/30 border border-taupe/20">
      <div className="grid md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-1 flex justify-center">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blush to-wine flex items-center justify-center text-ivory font-display text-5xl">
            AS
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">Note from Aditi</div>
          <blockquote className="mt-3 text-lg text-espresso leading-relaxed italic">
            &ldquo;Hi. My name is Aditi. I&apos;m 23 and I run Rose &amp; Co out of a rented studio in Sector 47, Gurugram. This is my first attempt at building a fashion brand. Some things will go wrong. When they do, please email me directly instead of leaving a bad review somewhere. I read every message myself and I will make it right.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <div className="font-display text-2xl text-wine italic">Aditi</div>
            <div className="text-xs text-espresso/60">Founder &middot; Gurugram, India</div>
          </div>
        </div>
      </div>
    </div>
  );
}
