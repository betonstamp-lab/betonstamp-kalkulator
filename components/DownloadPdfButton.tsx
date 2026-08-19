'use client';

// "Kalkuláció letöltése" gomb. CSAK akkor jelenik meg, ha a canDownloadPdf(profile)
// engedélyezi (jelenleg partner-role). A kattintás pillanatában hívja a
// buildData() függvényt, ami a friss result-ból építi fel a PDF adatot, majd
// átadja a közös generátornak.
//
// iOS Safari kompatibilitás:
//   1) Font-előtöltés a mount-nál (preloadPdfFonts) — a tap-lánc user-gesztus
//      ablakát nem töri meg hálózati késleltetés.
//   2) iOS-en window.open('','_blank') SZINKRON a user-gesztus alatt, majd
//      a blob-URL beállítása a nyitott fülre. Az iOS user Save-el mentheti.
//   3) Desktopon klasszikus <a download> anchor.click a blob-URL-lel.

import { useEffect } from 'react';
import type { UserProfile } from '@/lib/shared/supabase';
import { canDownloadPdf } from '@/lib/shared/canDownloadPdf';
import {
  generateCalculationPdf,
  preloadPdfFonts,
  preloadPdfLogo,
  type PdfData,
} from '@/lib/shared/pdfExport';

interface Props {
  profile: UserProfile | null | undefined;
  /** Csak akkor aktív a gomb, ha van kiszámolt eredmény. */
  hasResult: boolean;
  /** A gomb kattintáskor hívja — a friss result-ból építi a PDF adatot. */
  buildData: () => PdfData;
  className?: string;
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  // iPhone, iPad (klasszikus), iPod
  if (/iP(hone|od|ad)/.test(ua)) return true;
  // iPadOS 13+ Safari (asztali user-agent) — platform=MacIntel + touch
  const isTouch = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;
  if (isTouch && /Mac/.test(ua)) return true;
  return false;
}

function downloadOnDesktop(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Kis késleltetés, hogy a browser el tudja indítani a letöltést a revoke előtt.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DownloadPdfButton({
  profile,
  hasResult,
  buildData,
  className,
}: Props) {
  // Font + logó előtöltés a mount-nál — kritikus iOS Safari user-gesztus
  // szigorához, hogy a tap-lánc ne szakadjon meg hálózati kéréssel.
  useEffect(() => {
    if (canDownloadPdf(profile)) {
      preloadPdfFonts().catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('PDF font preload hiba (nem blokkoló):', err);
      });
      preloadPdfLogo().catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('PDF logo preload hiba (nem blokkoló):', err);
      });
    }
  }, [profile]);

  if (!canDownloadPdf(profile)) return null;

  const handleClick = async () => {
    if (!hasResult) return;

    const isIOS = detectIOS();
    // iOS-en a window.open-t MOST kell szinkron megnyitnunk, a user-gesztus alatt.
    // A későbbi await miatt a browser már nem engedné.
    let iosWindow: Window | null = null;
    if (isIOS) {
      iosWindow = window.open('', '_blank');
    }

    try {
      const data = buildData();
      const { blob, filename } = await generateCalculationPdf(data);

      if (isIOS) {
        const url = URL.createObjectURL(blob);
        if (iosWindow && !iosWindow.closed) {
          // Az iOS user a nyitott fülön megtekintheti / megoszthatja / mentheti.
          iosWindow.location.href = url;
        } else {
          // Popup blokkolva vagy zárva — inline navigálás.
          // Az aktuális fül a blob-URL-re vált; a user vissza tud lépni.
          window.location.href = url;
        }
        // A blob revoke-ja nem azonnal — a fül még használja.
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        downloadOnDesktop(blob, filename);
      }
    } catch (err) {
      // Ha az iOS ablak nyitva maradt de a generálás hibázott, zárjuk be.
      if (iosWindow && !iosWindow.closed) iosWindow.close();
      // eslint-disable-next-line no-console
      console.error('PDF generálás hiba:', err);
      alert('Nem sikerült létrehozni a PDF-et. Kérjük, próbáld újra.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!hasResult}
      className={
        className ??
        // w-full sm:w-auto: mobilon teljes szélesség (jól látható és tapintható),
        // sm+ (≥640px) visszaáll a kompakt, tartalomhoz igazodó gombra.
        'inline-flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-4 text-sm font-semibold border-2 border-brand-500 bg-white text-brand-700 rounded-lg hover:bg-brand-50 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed'
      }
      aria-label="Kalkuláció letöltése PDF-ben"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
      </svg>
      Kalkuláció letöltése
    </button>
  );
}
