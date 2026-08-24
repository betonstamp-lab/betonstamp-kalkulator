'use client';

// Közös oldalfejléc — minden bejelentkezés utáni oldalon ugyanaz.
// Tartalom: bal user-badge (név + Partner/Ügyfél címke) · közép BetonStamp logó ·
// jobb PricingModeToggle + "Vissza a főoldalra" (opcionális) + "Kijelentkezés".
//
// Reszponzív:
//   - Mobilon (<sm): `flex-col`, minden blokk teljes szélességben egymás alá.
//     A jobb-oldali gombsáv `flex-wrap` mobil-módban is, a logó középen kicsiben.
//   - Tabletet fölfelé (sm+): `flex-row`, badge balra, logó közép, gombok jobbra.
//
// A partner-feltétel a PricingModeToggle-ban van (a toggle önmagát rejti nem-partner
// esetén), a "Kalkuláció letöltése" gomb máshol van (nem itt) — ide csak a state-tel
// dolgozó vezérlők tartoznak.

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase, UserProfile } from '@/lib/shared/supabase';
import { PricingModeToggle } from '@/components/PricingModeToggle';
import { HEADER_BUTTON_NEUTRAL, HEADER_BUTTON_DANGER } from '@/components/headerButtonClasses';

interface Props {
  profile: UserProfile | null | undefined;
  /** Az email fallback-hez, ha a profile.name üres. */
  userEmail?: string | null;
  /** Megjelenjen-e a "Vissza a főoldalra" gomb? A választó oldalakon false, kalkulátorokon true. */
  showBack?: boolean;
  /** Vissza gomb célja (default: /calculators). */
  backHref?: string;
  /** Kilépés utáni redirect (default: /). */
  signOutHref?: string;
}

export default function AppHeader({
  profile,
  userEmail,
  showBack = true,
  backHref = '/calculators',
  signOutHref = '/',
}: Props) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(signOutHref);
  };

  const isPartner = profile?.role === 'partner';
  const displayName = profile?.name || userEmail || '';

  return (
    <header className="w-full bg-white shadow-sm py-3 px-3 sm:px-4 md:px-8">
      {/* Mobilon: FELSŐ sor (badge + logó justify-between), ALSÓ sor (gombsáv).
           sm+: 3 blokk vízszintesen (badge balra, logó közép, gombok jobbra).
           Az `sm:contents` trükk: a belső wrapper mobilon `flex flex-row justify-between`
           sor, sm+ eltűnik és a gyerekek közvetlenül a fő flex-row-ba kerülnek. */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Mobilon felső sor: badge + logó egymás mellett; sm+ kiürül (contents) */}
        <div className="flex flex-row items-center justify-between gap-3 sm:contents">
          {/* Bal — user-badge */}
          <div className="sm:flex-1 sm:min-w-0 sm:flex sm:justify-start">
            <div className="inline-flex flex-col min-w-0 border-2 border-gray-300 rounded-lg px-3 py-2 self-start">
              <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
              {isPartner ? (
                <span className="inline-block text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mt-0.5 self-start">
                  {profile?.partner_discount ? `Partner (${profile.partner_discount}% kedvezmény)` : 'Partner'}
                </span>
              ) : (
                <span className="inline-block text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-0.5 self-start">
                  Ügyfél
                </span>
              )}
            </div>
          </div>

          {/* Logó — mobilon a badge mellett jobbra, sm+ középen */}
          <a
            href="https://www.betonstamp.hu"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 sm:self-center transition-opacity"
            aria-label="Betonstamp.hu — új ablakban megnyitva"
          >
            <Image
              src="/images/betonstamp-logo.png"
              alt="BetonStamp"
              width={280}
              height={112}
              className="h-10 sm:h-12 md:h-20 w-auto"
            />
          </a>
        </div>

        {/* Jobb — vezérlők (mobilon az alsó sor, sm+ jobbra) */}
        <div className="sm:flex-1 sm:min-w-0 sm:flex sm:justify-end">
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
            <PricingModeToggle isPartner={isPartner} />
            {isPartner && (
              // "Árajánlat-beállítások" — csak partnernek. Ikon mobilon, szöveg sm+.
              <button
                onClick={() => router.push('/arajanlat-beallitasok')}
                className={HEADER_BUTTON_NEUTRAL}
                aria-label="Árajánlat-beállítások"
                title="Árajánlat-beállítások"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317a1.724 1.724 0 013.35 0l.09.372a1.724 1.724 0 002.573 1.066l.327-.196a1.724 1.724 0 012.372 2.372l-.196.327a1.724 1.724 0 001.066 2.573l.372.09a1.724 1.724 0 010 3.35l-.372.09a1.724 1.724 0 00-1.066 2.573l.196.327a1.724 1.724 0 01-2.372 2.372l-.327-.196a1.724 1.724 0 00-2.573 1.066l-.09.372a1.724 1.724 0 01-3.35 0l-.09-.372a1.724 1.724 0 00-2.573-1.066l-.327.196a1.724 1.724 0 01-2.372-2.372l.196-.327a1.724 1.724 0 00-1.066-2.573l-.372-.09a1.724 1.724 0 010-3.35l.372-.09a1.724 1.724 0 001.066-2.573l-.196-.327a1.724 1.724 0 012.372-2.372l.327.196a1.724 1.724 0 002.573-1.066l.09-.372z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Árajánlat</span>
              </button>
            )}
            {showBack && (
              // "Vissza a főoldalra" gomb — mobilon rejtve (a browser vissza-gomb megvan).
              <button
                onClick={() => router.push(backHref)}
                className={`${HEADER_BUTTON_NEUTRAL} hidden sm:inline-flex`}
                aria-label="Vissza a főoldalra"
              >
                ← Vissza a főoldalra
              </button>
            )}
            <button
              onClick={handleSignOut}
              className={HEADER_BUTTON_DANGER}
              aria-label="Kijelentkezés"
            >
              Kijelentkezés
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
