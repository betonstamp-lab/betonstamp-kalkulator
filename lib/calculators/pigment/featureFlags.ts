// lib/calculators/pigment/featureFlags.ts
// -----------------------------------------------------------------------------
// Pigment kalkulátor feature flag-ek.
//
// EFECTTO_PIGMENT_UNDER_DEVELOPMENT:
//   Ha true, az Efectto Quartz és Efectto PU pigment funkció ideiglenesen le
//   van tiltva — a recept-tábla szemcseméretek közt nem ad konzisztens színt.
//   FALSE-ra állítva mind a három helyen egyszerre újraaktiválódik:
//     1) /calculators/pigment választó oldal      (Efectto kártyák újra élnek)
//     2) /calculators/pigment/efectto-quartz      (kalkulátor megjelenik)
//     3) /calculators/pigment/efectto-pu          (kalkulátor megjelenik)
//     4) /calculators/mikrocement                 (Efectto szín-választó és
//                                                  pigment kosárba-rakás)
// -----------------------------------------------------------------------------

export const EFECTTO_PIGMENT_UNDER_DEVELOPMENT = true;
