'use client';

interface Props {
  stock: number;
  size?: string;
}

export default function StockUrgency({ stock, size }: Props) {
  if (stock === 0) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 text-crimson text-sm">
        <span className="w-2 h-2 rounded-full bg-wine" />
        Sold out {size && `in ${size}`}
      </div>
    );
  }

  if (stock <= 3) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 text-crimson text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-wine animate-pulse" />
        Only {stock} left {size && `in ${size}`}
      </div>
    );
  }

  if (stock <= 8) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 text-ivory/70 text-sm">
        <span className="w-2 h-2 rounded-full bg-ivory/50" />
        In stock {size && `in ${size}`}
      </div>
    );
  }

  return null;
}




