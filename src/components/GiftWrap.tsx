'use client';

export default function GiftWrap({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 p-4 border border-taupe/30 bg-blush cursor-pointer hover:border-wine transition rounded-lg">
      <input
        type="checkbox"
        checked={enabled}
        onChange={e => onChange(e.target.checked)}
        className="mt-1 accent-wine w-4 h-4 cursor-pointer"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="font-medium text-ivory">Add gift wrap</div>
          <div className="text-sm font-semibold text-wine">+ Rs 49</div>
        </div>
        <div className="text-xs text-ivory/60 mt-1">Black tissue, wax seal, hand-written card. Adds no delay to shipping.</div>
      </div>
    </label>
  );
}
