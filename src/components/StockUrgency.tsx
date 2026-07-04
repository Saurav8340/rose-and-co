'use client';

interface Props {
  stock: number;
  size?: string;
}

export default function StockUrgency({ stock, size }: Props) {
  if (stock === 0) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 text-red-700 text-sm">
        <span className="w-2 h-2 rounded-full bg-red-600" />
        Sold out {size && `in ${size}`}
      </div>
    );
  }

  if (stock <= 3) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 text-wine text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-wine animate-pulse" />
        Only {stock} left {size && `in ${size}`}
      </div>
    );
  }

  if (stock <= 8) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 text-espresso/70 text-sm">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        In stock {size && `in ${size}`}
      </div>
    );
  }

  return null;
}
