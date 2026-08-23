'use client';

// Ár-mód választó overlay — újrahasznosítható a "Kalkuláció letöltése" és a
// jövőbeni "Továbbítás" gombhoz. A megjelenés egy kis kártya a képernyő
// közepén, két opció + Mégse.
//
// FONTOS iOS gesztus szempontból: az `onSelect(mode)` callback a KIVÁLASZTÓ
// GOMB user-gesztusán belül fut. A hívó (pl. DownloadPdfButton) itt indítja
// a window.open + PDF generálást — ez az iOS-lánc kezdete.

import type { PdfPriceMode } from '@/lib/shared/pdfExport';

interface Props {
  open: boolean;
  onClose: () => void;
  /** A kiválasztott ár-móddal hívjuk — user-gesztuson belül. */
  onSelect: (mode: PdfPriceMode) => void;
  /** Cím a kártya tetején. Default: "Melyik áron?" */
  title?: string;
  /** Rövid magyarázó szöveg a cím alatt. */
  description?: string;
}

export default function PriceModeChooser({
  open,
  onClose,
  onSelect,
  title = 'Melyik áron?',
  description,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-mode-chooser-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="price-mode-chooser-title" className="text-lg font-bold text-gray-900 mb-2 text-center">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-gray-500 mb-4 text-center">{description}</p>
        )}

        <div className="flex flex-col gap-3 mt-4">
          {/* A két opció vizuálisan egyenrangú — sem az egyik nincs kiemelt
               "elsődleges" színnel, hogy a user tudatosan válasszon módot. */}
          <button
            type="button"
            onClick={() => onSelect('partner')}
            className="w-full h-12 rounded-lg border-2 border-gray-300 hover:border-gray-400 bg-white text-gray-800 font-semibold transition-colors"
          >
            Partner ár
          </button>
          <button
            type="button"
            onClick={() => onSelect('general')}
            className="w-full h-12 rounded-lg border-2 border-gray-300 hover:border-gray-400 bg-white text-gray-800 font-semibold transition-colors"
          >
            Általános ár
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-10 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Mégse
          </button>
        </div>
      </div>
    </div>
  );
}
