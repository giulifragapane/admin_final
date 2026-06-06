
export const StockBadge = ({ stock }: { stock: number }) => {
  if (stock === 0)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Sin stock
      </span>
    );
  if (stock <= 10)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        Bajo: {stock}
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      {stock} uds.
    </span>
  );
};
