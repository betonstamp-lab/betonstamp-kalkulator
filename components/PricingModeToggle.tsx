'use client';

// Fejléc-váltó a partneri / általános kijelzett ár között.
// CSAK partner fiók-role látja. Alapérték partner (a mostani viselkedés).
// A váltó csak a UI-t vezérli — a kosárba menő adatok változatlanok.

import { usePricingMode } from '@/components/PricingModeContext';

interface Props {
  /** True, ha a bejelentkezett fiók partner-role. Nem-partnernél a komponens null-t render-el. */
  isPartner: boolean;
}

export function PricingModeToggle({ isPartner }: Props) {
  const { pricingMode, setPricingMode } = usePricingMode();
  if (!isPartner) return null;

  return (
    <div
      className="inline-flex items-center gap-0.5 border-2 border-brand-500 rounded-lg p-0.5 bg-white"
      role="group"
      aria-label="Ár-mód váltó"
      title="Csak a kijelzett árat vezérli. A kosárba menő mennyiség változatlan."
    >
      <button
        type="button"
        onClick={() => setPricingMode('partner')}
        aria-pressed={pricingMode === 'partner'}
        className={`px-2.5 py-1 text-[11px] md:text-xs font-semibold rounded transition-colors whitespace-nowrap ${
          pricingMode === 'partner'
            ? 'bg-brand-500 text-white'
            : 'text-gray-700 hover:text-gray-900 hover:bg-brand-50'
        }`}
      >
        Partneri ár
      </button>
      <button
        type="button"
        onClick={() => setPricingMode('general')}
        aria-pressed={pricingMode === 'general'}
        className={`px-2.5 py-1 text-[11px] md:text-xs font-semibold rounded transition-colors whitespace-nowrap ${
          pricingMode === 'general'
            ? 'bg-brand-500 text-white'
            : 'text-gray-700 hover:text-gray-900 hover:bg-brand-50'
        }`}
      >
        Általános ár
      </button>
    </div>
  );
}
