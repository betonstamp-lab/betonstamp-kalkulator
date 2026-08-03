// Közös PDF-generátor a kalkulátorokhoz. jspdf-fel, valódi szöveggel (nem
// html2canvas képpel), egyszerű szöveges/táblázatos layouttal.
//
// A hívó egy PdfData objektumot ad át — minden kalkulátor a saját result-jából
// állítja össze. A generator csak a layout-tal foglalkozik.

import { jsPDF } from 'jspdf';

export type PdfPriceMode = 'partner' | 'general';

export interface PdfLineItem {
  /** Tétel neve (pl. "Stonecem Floor Cemento (cementszürke)"). */
  name: string;
  /** Mennyiség szövegesen (pl. "1 × 25 kg", "16.8 kg", "3 × 18 L", "300 g"). */
  quantity: string;
  /** Ár szintek. Bármelyik hiányozhat: pigment m² módnál nincs ár. */
  prices?: {
    /** "Kiszerelés szerint" ár (Ft, bruttó). */
    kiszereles?: number;
    /** "Anyagszükséglet szerint" ár (Ft, bruttó). */
    anyag?: number;
    /** Ha csak egy ár van (nincs bontás), ide megy. */
    single?: number;
  };
}

export interface PdfSection {
  /** Szekció fejléc (pl. "Felület 1", "Beton", "Alapozó"). Elhagyható. */
  heading?: string;
  items: PdfLineItem[];
  /** Szekció-részösszeg (Ft, bruttó). Elhagyható. */
  subtotal?: number;
  /** Szekció-részösszeg címkéje (pl. "Részösszeg", "Felület 1 összesen"). */
  subtotalLabel?: string;
}

export interface PdfData {
  /** A kalkulátor neve, pl. "Bélyegzett Beton Kalkulátor". */
  title: string;
  /** Jelenlegi ár-mód (a Step 1-ből átvéve). */
  pricingMode: PdfPriceMode;
  sections: PdfSection[];
  /** Végösszegek — bármelyik hiányozhat. */
  totals?: {
    kiszereles?: number;
    anyag?: number;
    single?: number;
  };
  /** Fájlnév prefix; a "-YYYY-MM-DD.pdf" automatikusan hozzáfűződik. */
  filenamePrefix?: string;
}

// Brand-akcens (Betonstamp sárga #fbc02d). RGB.
const BRAND: [number, number, number] = [251, 192, 45];
const TEXT_DARK: [number, number, number] = [30, 30, 30];
const TEXT_MUTED: [number, number, number] = [110, 110, 110];
const RULE: [number, number, number] = [220, 220, 220];

const formatFt = (n: number) => `${Math.round(n).toLocaleString('hu-HU')} Ft`;

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** A jsPDF alap Helvetica fontkészlete csak latin-1 → az ékezetek NFC → NFD +
 *  diacritic-strip. A magyar szövegnek így nincs "?", csak ékezet nélkül. */
function safeText(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function generateCalculationPdf(data: PdfData): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const MARGIN_X = 40;
  const MARGIN_TOP = 40;
  const MARGIN_BOTTOM = 50;
  const CONTENT_W = PAGE_W - MARGIN_X * 2;

  let y = MARGIN_TOP;

  const ensureRoom = (needed: number) => {
    if (y + needed > PAGE_H - MARGIN_BOTTOM) {
      doc.addPage();
      y = MARGIN_TOP;
    }
  };

  // --- Fejléc ---
  doc.setFillColor(...BRAND);
  doc.rect(MARGIN_X, y, 4, 22, 'F'); // brand csík
  doc.setTextColor(...TEXT_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(safeText('Betonstamp'), MARGIN_X + 12, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(safeText(todayISO()), PAGE_W - MARGIN_X, y + 16, { align: 'right' });
  y += 32;

  // Kalkulátor cím
  doc.setTextColor(...TEXT_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(safeText(data.title), MARGIN_X, y);
  y += 18;

  // Ár-mód sor
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND);
  const modeLabel = data.pricingMode === 'partner' ? 'Ar: Partneri' : 'Ar: Altalanos';
  doc.text(safeText(modeLabel), MARGIN_X, y);
  y += 14;

  // Szeparátor
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
  y += 14;

  // --- Szekciók ---
  doc.setTextColor(...TEXT_DARK);

  for (const section of data.sections) {
    ensureRoom(30);
    if (section.heading) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(safeText(section.heading), MARGIN_X, y);
      y += 14;
    }

    for (const item of section.items) {
      // Egy tétel: 2 sor, ha van bontott ár; egyébként 1 sor.
      // Első sor: név (bal) + kiszereles/single ár (jobb)
      // Második sor: mennyiség (bal, halványabb) + anyag ár (jobb, halványabb) — ha van
      ensureRoom(24);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...TEXT_DARK);
      // Szélesség-biztosítás: ha nagyon hosszú a név, a splitTextToSize több sorba tördel
      const priceMain =
        item.prices?.single !== undefined
          ? formatFt(item.prices.single)
          : item.prices?.kiszereles !== undefined
            ? formatFt(item.prices.kiszereles)
            : '';
      const priceWidth = priceMain
        ? doc.getTextWidth(safeText(priceMain)) + 6
        : 0;
      const nameMaxW = CONTENT_W - priceWidth;
      const nameLines = doc.splitTextToSize(safeText(item.name), nameMaxW);
      doc.text(nameLines, MARGIN_X, y);
      if (priceMain) {
        doc.text(safeText(priceMain), PAGE_W - MARGIN_X, y, { align: 'right' });
      }
      // Ha a név több sorra tördelődött, a következő sor y-eltolása szerint haladunk
      const nameLineHeight = 12;
      const nameHeight = Array.isArray(nameLines)
        ? nameLines.length * nameLineHeight
        : nameLineHeight;
      y += nameHeight;

      // Mennyiség + secondary ár (anyag) sor
      doc.setFontSize(9);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(safeText(item.quantity), MARGIN_X + 8, y);
      if (item.prices?.anyag !== undefined) {
        doc.text(
          safeText(`Anyagszukseglet: ${formatFt(item.prices.anyag)}`),
          PAGE_W - MARGIN_X,
          y,
          { align: 'right' }
        );
      }
      y += 12;

      y += 4; // sor közötti szellős tér
    }

    if (section.subtotal !== undefined) {
      ensureRoom(18);
      doc.setDrawColor(...RULE);
      doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
      y += 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...TEXT_DARK);
      doc.text(safeText(section.subtotalLabel ?? 'Reszosszeg'), MARGIN_X, y);
      doc.text(safeText(formatFt(section.subtotal)), PAGE_W - MARGIN_X, y, { align: 'right' });
      y += 16;
    }

    y += 6; // szekciók közötti tér
  }

  // --- Végösszegek ---
  if (data.totals && (data.totals.kiszereles !== undefined || data.totals.anyag !== undefined || data.totals.single !== undefined)) {
    ensureRoom(60);
    doc.setDrawColor(...TEXT_DARK);
    doc.setLineWidth(0.8);
    doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
    y += 16;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_DARK);
    doc.text(safeText('Osszesen'), MARGIN_X, y);

    if (data.totals.single !== undefined) {
      doc.text(safeText(formatFt(data.totals.single)), PAGE_W - MARGIN_X, y, { align: 'right' });
      y += 18;
    } else {
      y += 16;
      doc.setFontSize(10);
      if (data.totals.kiszereles !== undefined) {
        doc.setTextColor(...TEXT_MUTED);
        doc.text(safeText('Kiszereles szerint'), MARGIN_X + 10, y);
        doc.setTextColor(...TEXT_DARK);
        doc.text(safeText(formatFt(data.totals.kiszereles)), PAGE_W - MARGIN_X, y, { align: 'right' });
        y += 14;
      }
      if (data.totals.anyag !== undefined) {
        doc.setTextColor(...TEXT_MUTED);
        doc.text(safeText('Anyagszukseglet szerint'), MARGIN_X + 10, y);
        doc.setTextColor(...TEXT_DARK);
        doc.text(safeText(formatFt(data.totals.anyag)), PAGE_W - MARGIN_X, y, { align: 'right' });
        y += 14;
      }
    }
  }

  // --- Lábjegyzet ---
  const hasPrices =
    !!data.totals?.kiszereles || !!data.totals?.anyag || !!data.totals?.single;
  if (hasPrices) {
    // A lábjegyzet mindig az utolsó oldal aljára
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      safeText('Az arak tartalmazzak az AFA-t.'),
      MARGIN_X,
      PAGE_H - 30
    );
  }

  const filename = `${data.filenamePrefix ?? 'betonstamp-kalkulacio'}-${todayISO()}.pdf`;
  doc.save(filename);
}
