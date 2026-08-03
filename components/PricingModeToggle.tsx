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

  // A container h-10 magas, azonos mint a többi fejléc-gomb (Vissza, Kijelentkezés).
  // A belső gombok h-full-t vesznek fel + azonos text-sm font-semibold-t.
  return (
    <div
      className="inline-flex items-center h-10 border-2 border-brand-500 rounded-lg bg-white overflow-hidden"
      role="group"
      aria-label="Ár-mód váltó"
      title="Csak a kijelzett árat vezérli. A kosárba menő mennyiség változatlan."
    >
      <button
        type="button"
        onClick={() => setPricingMode('partner')}
        aria-pressed={pricingMode === 'partner'}
        className={`inline-flex items-center h-full px-3 text-sm font-semibold transition-colors whitespace-nowrap ${
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
        className={`inline-flex items-center h-full px-3 text-sm font-semibold transition-colors whitespace-nowrap ${
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
