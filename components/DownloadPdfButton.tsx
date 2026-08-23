'use client';

// "Kalkuláció letöltése" gomb. CSAK akkor jelenik meg, ha a canDownloadPdf(profile)
// engedélyezi (jelenleg partner-role).
//
// Ár-mód választó:
//   Kattintáskor előbb egy PriceModeChooser overlay jelenik meg (partner
//   fióknál). A user választ "Partner ár" vagy "Általános ár" — a választás
//   user-gesztusa indítja a PDF-generálást és a letöltést/új-fül-megnyitást.
//   A buildData(mode) függvény újraszámolja az árakat a választott módra,
//   függetlenül a fejléc pricingMode-jától.
//
// iOS Safari kompatibilitás:
//   1) Font + logó előtöltés a mount-nál — a tap-lánc user-gesztus ablakát nem
//      töri meg hálózati késleltetés.
//   2) A választó gomb (Partner ár / Általános ár) tap-ja MAGA egy user-gesztus.
//      A window.open('','_blank') SZINKRON annak onClick-jén belül, majd a
//      blob-URL beállítása a nyitott fülre.
//   3) File objektum a Blob helyett — a Safari a File.name-t használja a Share →
//      "Save to Files" mentési névhez (unknown.pdf helyett).
//   4) Desktopon klasszikus <a download> anchor.click.

import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/shared/supabase';
import { canDownloadPdf } from '@/lib/shared/canDownloadPdf';
import {
  generateCalculationPdf,
  preloadPdfFonts,
  preloadPdfLogo,
  type PdfData,
  type PdfPriceMode,
} from '@/lib/shared/pdfExport';
import PriceModeChooser from '@/components/PriceModeChooser';

interface Props {
  profile: UserProfile | null | undefined;
  /** Csak akkor aktív a gomb, ha van kiszámolt eredmény. */
  hasResult: boolean;
  /** A választó gomb kattintáskor hívja — a friss result-ból építi a PDF
   *  adatot A KIVÁLASZTOTT ár-móddal (nem a fejléc pricingMode-jából). */
  buildData: (mode: PdfPriceMode) => PdfData;
  className?: string;
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iP(hone|od|ad)/.test(ua)) return true;
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
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DownloadPdfButton({
  profile,
  hasResult,
  buildData,
  className,
}: Props) {
  const [chooserOpen, setChooserOpen] = useState(false);

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

  // A választó gomb tap-jén futó teljes generálás + letöltés/megnyitás.
  // Ez az EGYETLEN user-gesztus a PDF-lánchoz (a fő gomb csak a chooser-t nyitja).
  const handleModeSelected = async (mode: PdfPriceMode) => {
    // A chooser bezárása AZONNAL — hogy az user-gesztus ablak alatt fusson
    // a window.open. A setState maga sync, csak a re-render aszinkron.
    setChooserOpen(false);

    const isIOS = detectIOS();
    let iosWindow: Window | null = null;
    if (isIOS) {
      // Szinkron a user-gesztus alatt, MIELŐTT bármilyen await lenne.
      iosWindow = window.open('', '_blank');
    }

    try {
      const data = buildData(mode);
      const { blob, filename } = await generateCalculationPdf(data);

      if (isIOS) {
        // File objektum a Blob helyett — a Safari a File.name-t használja a
        // Share → "Save to Files" mentési névhez (unknown.pdf helyett).
        const file = new File([blob], filename, { type: 'application/pdf' });
        const url = URL.createObjectURL(file);
        if (iosWindow && !iosWindow.closed) {
          iosWindow.location.href = url;
          try {
            iosWindow.addEventListener('load', () => {
              try { iosWindow!.document.title = filename; } catch { /* cross-origin ok */ }
            }, { once: true });
            setTimeout(() => {
              try { if (iosWindow && !iosWindow.closed) iosWindow.document.title = filename; } catch { /* ok */ }
            }, 500);
          } catch { /* ok — nem kritikus, a File.name már elég */ }
        } else {
          window.location.href = url;
        }
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        downloadOnDesktop(blob, filename);
      }
    } catch (err) {
      if (iosWindow && !iosWindow.closed) iosWindow.close();
      // eslint-disable-next-line no-console
      console.error('PDF generálás hiba:', err);
      alert('Nem sikerült létrehozni a PDF-et. Kérjük, próbáld újra.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setChooserOpen(true)}
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

      <PriceModeChooser
        open={chooserOpen}
        onClose={() => setChooserOpen(false)}
        onSelect={handleModeSelected}
        title="Melyik áron töltsem le?"
        description="A választás CSAK a letöltött PDF-re vonatkozik — a képernyős árakat nem érinti."
      />
    </>
  );
}
