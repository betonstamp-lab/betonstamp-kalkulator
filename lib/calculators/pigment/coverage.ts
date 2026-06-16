// lib/calculators/pigment/coverage.ts
// -----------------------------------------------------------------------------
// m² alapú számítási mód konstansai a pigment kalkulátorokhoz.
//
// MICROCEMENT_COVERAGE: hány kg mikrocement por kell 1 m²-re EGY rétegben,
// szemcseméretenként. Több réteg esetén egyszerű szorzás:
//     weightKg = m² × MICROCEMENT_COVERAGE[rendszer][szemcse] × rétegszám
//
// NATTURE_RESIN_L_PER_KG: az Acricem gyanta liter / kg pigment-por arány,
// CSAK a Natture rendszerhez. Más rendszereknél nincs külön gyanta.
//
// A kulcsok pontosan illeszkednek a recept-fájlok (recipes) kulcsaihoz:
//   - Natture:       's' | 'm' | 'l' | 'xl'    (mint NATTURE_PIGMENT_RECIPES)
//   - EfecttoQuartz: 'small' | 'medium' | 'big'
//   - EfecttoPU:     'small' | 'medium' | 'big'
//   - Atlanttic:     'xl' (jelenleg) — 'xxl' a jövőbeni bővítéshez
// -----------------------------------------------------------------------------

export const MICROCEMENT_COVERAGE = {
  natture:       { s: 0.25, m: 0.5,  l: 0.7,  xl: 1.0 },
  efecttoQuartz: { small: 0.25, medium: 0.45, big: 0.9 },
  efecttoPU:     { small: 0.25, medium: 0.45, big: 0.9 },
  atlantic:      { xl: 1.5, xxl: 2.0 },
} as const;

// Acricem gyanta arány — CSAK Natture
export const NATTURE_RESIN_L_PER_KG = { s: 0.42, m: 0.37, l: 0.33, xl: 0.30 } as const;
