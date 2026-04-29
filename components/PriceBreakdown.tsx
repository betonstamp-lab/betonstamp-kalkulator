'use client';

interface PriceBreakdownProps {
  variant: 'line' | 'total';
  kiszerelesPrice: number;
  anyagszuksegletPrice: number;
  partnerMode?: boolean;
  showSinglePrice?: boolean;
}

const formatFt = (n: number) => `${Math.round(n).toLocaleString('hu-HU')} Ft`;

export default function PriceBreakdown({
  variant,
  kiszerelesPrice,
  anyagszuksegletPrice,
  partnerMode = false,
  showSinglePrice = false,
}: PriceBreakdownProps) {
  const kiszerelesLabel = partnerMode ? 'Partneri kiszerelés szerint' : 'Kiszerelés szerint';
  const anyagszuksegletLabel = partnerMode ? 'Partneri anyagszükséglet szerint' : 'Anyagszükséglet szerint';
  const kiszerelesColor = partnerMode ? 'text-green-700' : 'text-brand-600';

  if (variant === 'line') {
    if (showSinglePrice) {
      return (
        <div className="mt-2 pt-2 border-t border-gray-300 text-sm">
          <div className="flex justify-between font-semibold">
            <span className="text-gray-600">Ár:</span>
            <span className={kiszerelesColor}>{formatFt(kiszerelesPrice)}</span>
          </div>
        </div>
      );
    }
    return (
      <div className="mt-2 pt-2 border-t border-gray-300 text-sm">
        <div className="flex justify-between font-semibold">
          <span className="text-gray-600">{kiszerelesLabel}:</span>
          <span className={kiszerelesColor}>{formatFt(kiszerelesPrice)}</span>
        </div>
        <div className="flex justify-between font-semibold mt-1">
          <span className="text-gray-600">{anyagszuksegletLabel}:</span>
          <span className="text-green-600">{formatFt(anyagszuksegletPrice)}</span>
        </div>
      </div>
    );
  }

  // variant === 'total'
  if (showSinglePrice) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="flex justify-between sm:block sm:text-right">
          <span className={`text-lg sm:text-xl font-bold ${kiszerelesColor}`}>
            {formatFt(kiszerelesPrice)}
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
      <div className="flex justify-between sm:block sm:text-right">
        <span className="text-xs text-gray-500 sm:block">{kiszerelesLabel}</span>
        <span className={`text-lg sm:text-xl font-bold ${kiszerelesColor}`}>
          {formatFt(kiszerelesPrice)}
        </span>
      </div>
      <div className="flex justify-between sm:block sm:text-right">
        <span className="text-xs text-gray-500 sm:block">{anyagszuksegletLabel}</span>
        <span className="text-lg sm:text-xl font-bold text-green-600">
          {formatFt(anyagszuksegletPrice)}
        </span>
      </div>
    </div>
  );
}
