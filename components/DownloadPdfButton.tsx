'use client';

// "Kalkuláció letöltése" gomb. CSAK akkor jelenik meg, ha a canDownloadPdf(profile)
// engedélyezi (jelenleg partner-role). A kattintás pillanatában hívja a
// buildData() függvényt, ami a friss result-ból építi fel a PDF adatot, majd
// átadja a közös generátornak.
//
// A pricingMode-ot a hívó adja át (a saját usePricingMode()-ból), hogy a PDF
// tükrözze, melyik módban készült.

import type { UserProfile } from '@/lib/shared/supabase';
import { canDownloadPdf } from '@/lib/shared/canDownloadPdf';
import { generateCalculationPdf, type PdfData } from '@/lib/shared/pdfExport';

interface Props {
  profile: UserProfile | null | undefined;
  /** Csak akkor aktív a gomb, ha van kiszámolt eredmény. */
  hasResult: boolean;
  /** A gomb kattintáskor hívja — a friss result-ból építi a PDF adatot. */
  buildData: () => PdfData;
  className?: string;
}

export default function DownloadPdfButton({
  profile,
  hasResult,
  buildData,
  className,
}: Props) {
  if (!canDownloadPdf(profile)) return null;

  const handleClick = async () => {
    if (!hasResult) return;
    try {
      const data = buildData();
      await generateCalculationPdf(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PDF generálás hiba:', err);
      alert('Nem sikerült létrehozni a PDF-et.');
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
