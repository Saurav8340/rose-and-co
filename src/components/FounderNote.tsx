export default function FounderNote() {
  return (
    <div className="mt-20 pt-10 border-t border-taupe/20">
      <div className="grid md:grid-cols-4 gap-6 items-start">
        <div className="md:col-span-1">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blush to-wine/70 flex items-center justify-center text-ivory font-display text-2xl">
            A
          </div>
        </div>
        <div className="md:col-span-3 space-y-4">
          <div className="text-xs uppercase tracking-[0.3em] text-wine">A note</div>
          <div className="text-espresso/85 leading-[1.9] italic text-[17px]">
            <p>
              Hi. I&apos;m Aditi. I&apos;m twenty-three, and this is my first attempt at making clothes.
            </p>
            <p className="mt-3">
              Some things will go wrong. When they do, please write to me before you write about me anywhere else. I read every note, and I fix what I can.
            </p>
          </div>
          <div className="pt-2 text-sm text-espresso/60">
            &mdash; A, Gurugram
          </div>
        </div>
      </div>
    </div>
  );
}
