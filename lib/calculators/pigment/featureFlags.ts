// lib/calculators/pigment/featureFlags.ts
// -----------------------------------------------------------------------------
// Pigment kalkulátor feature flag-ek.
//
// Külön flag rendszerenként, mert az Efectto Quartz és az Efectto PU
// recept-tábláit egymástól függetlenül kapcsoljuk be / le.
//
// Ha a flag true, az adott rendszer pigment funkciója "Fejlesztés alatt"
// üzenetet mutat, és a Mikrocement Kalkulátorban is el van rejtve a
// szín-választó (pigment) annál a rendszernél. False-ra állítva mindenhol
// egyszerre újraaktiválódik:
//   1) /calculators/pigment választó oldal (Efectto kártya)
//   2) /calculators/pigment/efectto-quartz vagy /efectto-pu (kalkulátor megjelenik)
//   3) /calculators/mikrocement (Efectto szín-választó és pigment kosárba-rakás)
// -----------------------------------------------------------------------------

export const EFECTTO_QUARTZ_PIGMENT_UNDER_DEVELOPMENT = true;   // marad letiltva
export const EFECTTO_PU_PIGMENT_UNDER_DEVELOPMENT = false;      // újraaktiválva
