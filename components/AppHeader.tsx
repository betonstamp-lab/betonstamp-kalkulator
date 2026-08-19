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
      {/* Mobilon oszlopos elrendezés (elemek egymás alá), sm+ soros. */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3">
        {/* Bal — user-badge (mobilon és desktopon egyforma) */}
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

        {/* Közép — logó (mobilon a badge alatt középen kicsiben) */}
        <a
          href="https://www.betonstamp.hu"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 self-center transition-opacity"
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

        {/* Jobb — vezérlők (mobilon a logó alatt, wrap-el) */}
        <div className="sm:flex-1 sm:min-w-0 sm:flex sm:justify-end">
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
            <PricingModeToggle isPartner={isPartner} />
            {showBack && (
              <button
                onClick={() => router.push(backHref)}
                className={HEADER_BUTTON_NEUTRAL}
                aria-label="Vissza a főoldalra"
              >
                <span className="sm:hidden">← Vissza</span>
                <span className="hidden sm:inline">← Vissza a főoldalra</span>
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
