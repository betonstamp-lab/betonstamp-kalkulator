'use client';

// "Kalkuláció továbbítása" gomb. CSAK partner-role látja (canDownloadPdf).
//
// Eszközfüggő továbbítás:
//   - MOBIL (Web Share API PDF-fel): navigator.share({ files: [pdfFile] }) →
//     OS megosztó sheet nyílik, a partner saját Mail/Gmail appjából küldi,
//     a PDF csatolva, a címzettet ott írja be. NINCS email input az appban.
//   - DESKTOP (nincs fájl-megosztás): mailto: link ÜRES címzettel + előre
//     kitöltött subject/body + a PDF egyidejűleg letöltődik. A partner a
//     megnyílt levelezőben kézzel csatolja a PDF-et.
//
// Az ár-mód választó (PriceModeChooser) ugyanaz, mint a letöltésnél.
// iOS user-gesztus szigor: a chooser gomb tap-je az EGYETLEN user-gesztus,
// azon belül fut a window.share/mailto/download.

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
  hasResult: boolean;
  buildData: (mode: PdfPriceMode) => PdfData;
  className?: string;
}

const MAIL_SUBJECT = 'Betonstamp kalkuláció';
const MAIL_BODY =
  'Kedves Címzett!\n\n' +
  'Csatolom a Betonstamp kalkulációt (PDF).\n\n' +
  'Üdvözlettel,';

/** A böngésző képes fájl-megosztásra? Egy 1 bájtos dummy File-t próbál. */
function canShareFiles(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (typeof navigator.share !== 'function') return false;
  if (typeof navigator.canShare !== 'function') return false;
  try {
    const dummy = new File(['x'], 'x.pdf', { type: 'application/pdf' });
    return navigator.canShare({ files: [dummy] });
  } catch {
    return false;
  }
}

function downloadPdfDesktop(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ShareCalculationButton({
  profile,
  hasResult,
  buildData,
  className,
}: Props) {
  const [chooserOpen, setChooserOpen] = useState(false);

  useEffect(() => {
    if (canDownloadPdf(profile)) {
      preloadPdfFonts().catch(() => { /* ok */ });
      preloadPdfLogo().catch(() => { /* ok */ });
    }
  }, [profile]);

  if (!canDownloadPdf(profile)) return null;

  const handleModeSelected = async (mode: PdfPriceMode) => {
    setChooserOpen(false);
    const useWebShare = canShareFiles();

    try {
      const data = buildData(mode);
      const { blob, filename } = await generateCalculationPdf(data);
      const file = new File([blob], filename, { type: 'application/pdf' });

      if (useWebShare && navigator.canShare({ files: [file] })) {
        // Az OS megosztó sheet nyílik meg — a partner a Mail/Gmail appot választva
        // küld, a PDF csatolva, a címzettet ott írja be.
        try {
          await navigator.share({
            files: [file],
            title: MAIL_SUBJECT,
            text: MAIL_BODY,
          });
        } catch (shareErr) {
          // User "Cancel" a share sheet-en — nem hiba, csak ki-x-elte.
          const name = (shareErr as Error)?.name || '';
          if (name !== 'AbortError') {
            // eslint-disable-next-line no-console
            console.warn('Web Share hiba:', shareErr);
          }
        }
      } else {
        // Desktop / nem támogatott: mailto ÜRES címzettel + a PDF letöltődik.
        const mailto =
          'mailto:?subject=' +
          encodeURIComponent(MAIL_SUBJECT) +
          '&body=' +
          encodeURIComponent(MAIL_BODY);
        // A PDF letöltése ELŐBB — hogy mire a mailto megnyílik, kézre álljon.
        downloadPdfDesktop(blob, filename);
        window.location.href = mailto;
        // Felhasználó-tájékoztatás: a partner a levelezőben csatolja a PDF-et.
        setTimeout(() => {
          alert(
            'A PDF letöltődött. Csatold a most megnyílt e-mailhez, és írd be a címzettet.'
          );
        }, 300);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Kalkuláció továbbítása hiba:', err);
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
          'inline-flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-4 text-sm font-semibold border-2 border-brand-500 bg-white text-brand-700 rounded-lg hover:bg-brand-50 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed'
        }
        aria-label="Kalkuláció továbbítása e-mailben"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l10 7 10-7" />
        </svg>
        Kalkuláció továbbítása
      </button>

      <PriceModeChooser
        open={chooserOpen}
        onClose={() => setChooserOpen(false)}
        onSelect={handleModeSelected}
        title="Melyik áron továbbítsam?"
        description="A választás CSAK a továbbított PDF-re vonatkozik — a képernyős árakat nem érinti."
      />
    </>
  );
}
