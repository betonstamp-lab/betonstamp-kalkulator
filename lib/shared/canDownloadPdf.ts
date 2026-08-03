// EGYETLEN forrás annak eldöntéséhez, hogy a felhasználó látja-e a
// "Kalkuláció letöltése" gombot. Jelenleg csak partner user (fiók-role szerint)
// jogosult; ha később kiterjesztjük más felhasználói körre, CSAK ezt a
// függvényt kell módosítani — a gomb minden kalkulátor-oldalon automatikusan
// követi.
//
// Fontos: a partner-role a fiók típusát jelenti (nem a Step 1 ár-módot).
// Ha egy partner a fejlécben átvált "Általános ár" módra, a gomb továbbra is
// látszik — mert a fiókja partner, csak az árat mutatja általánosan.

import type { UserProfile } from '@/lib/shared/supabase';

export function canDownloadPdf(profile: UserProfile | null | undefined): boolean {
  return profile?.role === 'partner';
}
