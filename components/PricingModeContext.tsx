'use client';

// Partneri / általános ár-mód. Csak a KIJELZETT árat vezérli — a kosárba
// menő SKU + mennyiség változatlan, a Shoprenter a webshop-oldali profil
// alapján adja a partner kedvezményt. Csak partner fiók-role látja a váltót.
//
// Alapérték: 'partner' (a mostani viselkedés). Az állapot memóriában él, page
// reload-nál visszaáll partner-re — ez a biztonságos alap, nem ragad be véletlenül
// általánosban.

import { createContext, useContext, useState, ReactNode } from 'react';

export type PricingMode = 'partner' | 'general';

interface PricingModeContextValue {
  pricingMode: PricingMode;
  setPricingMode: (m: PricingMode) => void;
}

const PricingModeContext = createContext<PricingModeContextValue>({
  pricingMode: 'partner',
  setPricingMode: () => {},
});

export function PricingModeProvider({ children }: { children: ReactNode }) {
  const [pricingMode, setPricingMode] = useState<PricingMode>('partner');
  return (
    <PricingModeContext.Provider value={{ pricingMode, setPricingMode }}>
      {children}
    </PricingModeContext.Provider>
  );
}

export function usePricingMode(): PricingModeContextValue {
  return useContext(PricingModeContext);
}
