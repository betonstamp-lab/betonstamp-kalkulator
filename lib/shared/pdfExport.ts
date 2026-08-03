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
  /** Szekció-részösszeg (Ft, bruttó). Elhagyható. Egyáras esetén használandó. */
  subtotal?: number;
  /** Szekció-részösszeg címkéje (pl. "Részösszeg", "Felület 1 összesen"). */
  subtotalLabel?: string;
  /** Kettős szekció-részösszeg (Kiszerelés szerint / Anyagszükséglet szerint).
   *  Ha ez meg van adva, felülírja a `subtotal`-t: a generator két sorral renderel. */
  subtotalPrices?: {
    kiszereles?: number;
    anyag?: number;
  };
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

/** Egységes felület-fejléc a PDF-hez. Minden kalkulátor buildData()-ja ugyanezt
 *  használja, hogy a formátum garantáltan egységes maradjon.
 *  Kimenet: "Felület 1 — 40 m² — SAMOS"  vagy  "Felület 2 — 25 m²" (ha nincs szín). */
export function formatSurfaceHeader({
  index,
  area,
  color,
}: {
  index: number;
  area: number | string | null | undefined;
  color?: string | null;
}): string {
  const parts: string[] = [`Felület ${index}`];
  if (area !== null && area !== undefined && String(area).trim() !== '') {
    parts.push(`${area} m²`);
  }
  if (color && String(color).trim() !== '') {
    parts.push(String(color).trim());
  }
  return parts.join(' — ');
}

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Beágyazott Unicode font (DejaVu Sans Condensed) — támogatja a teljes magyar
// karakterkészletet (á é í ó ö ő ú ü ű + nagybetűk). Dinamikus import: csak a
// PDF-generálás pillanatában tölti be a browser, hogy a fő bundle-t ne
// terhelje meg a ~1.7 MB base64 tartalom.
const FONT_FAMILY = 'DejaVuSans';
async function registerUnicodeFont(doc: jsPDF): Promise<void> {
  const { DEJAVU_SANS_REGULAR_B64, DEJAVU_SANS_BOLD_B64 } = await import('./fonts/dejavuSans');
  doc.addFileToVFS('DejaVuSansCondensed.ttf', DEJAVU_SANS_REGULAR_B64);
  doc.addFont('DejaVuSansCondensed.ttf', FONT_FAMILY, 'normal');
  doc.addFileToVFS('DejaVuSansCondensed-Bold.ttf', DEJAVU_SANS_BOLD_B64);
  doc.addFont('DejaVuSansCondensed-Bold.ttf', FONT_FAMILY, 'bold');
  doc.setFont(FONT_FAMILY, 'normal');
}

export async function generateCalculationPdf(data: PdfData): Promise<void> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  await registerUnicodeFont(doc);
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
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setFontSize(16);
  doc.text('Betonstamp', MARGIN_X + 12, y + 16);

  doc.setFont(FONT_FAMILY, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(todayISO(), PAGE_W - MARGIN_X, y + 16, { align: 'right' });
  y += 32;

  // Kalkulátor cím
  doc.setTextColor(...TEXT_DARK);
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setFontSize(13);
  doc.text(data.title, MARGIN_X, y);
  y += 18;

  // Ár-mód sor
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND);
  const modeLabel = data.pricingMode === 'partner' ? 'Ár: Partneri' : 'Ár: Általános';
  doc.text(modeLabel, MARGIN_X, y);
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
      doc.setFont(FONT_FAMILY, 'bold');
      doc.setFontSize(11);
      doc.text(section.heading, MARGIN_X, y);
      y += 14;
    }

    for (const item of section.items) {
      // Egy tétel: 2 sor, ha van bontott ár; egyébként 1 sor.
      // Első sor: név (bal) + kiszereles/single ár (jobb)
      // Második sor: mennyiség (bal, halványabb) + anyag ár (jobb, halványabb) — ha van
      ensureRoom(24);

      doc.setFont(FONT_FAMILY, 'normal');
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
        ? doc.getTextWidth(priceMain) + 6
        : 0;
      // A splitTextToSize üres tömböt tud visszaadni, ha a maxW extrém kicsi;
      // védekezésképpen minimumot tartunk (a font-metrikák per-glyph pontatlansága
      // ellen is véd — DejaVu Sans Condensed-nél volt reprodukálható eset).
      const nameMaxW = Math.max(60, CONTENT_W - priceWidth);
      const nameLines = doc.splitTextToSize(item.name, nameMaxW);
      if (item.name) {
        doc.text(nameLines, MARGIN_X, y);
      }
      if (priceMain) {
        doc.text(priceMain, PAGE_W - MARGIN_X, y, { align: 'right' });
      }
      // Név-blokk MINIMUM egy sor magas — akkor is, ha nameLines.length === 0.
      const nameLineHeight = 12;
      const linesCount = Array.isArray(nameLines) ? nameLines.length : 1;
      const nameHeight = Math.max(1, linesCount) * nameLineHeight;
      y += nameHeight;

      // Mennyiség + secondary ár (anyag) sor. Csak akkor rajzoljuk, ha VAN mit
      // rajzolni — de az y-lépést mindig alkalmazzuk, hogy a tétel-blokk
      // magassága konzisztens legyen.
      doc.setFontSize(9);
      doc.setTextColor(...TEXT_MUTED);
      if (item.quantity) {
        doc.text(item.quantity, MARGIN_X + 8, y);
      }
      if (item.prices?.anyag !== undefined) {
        doc.text(
          `Anyagszükséglet: ${formatFt(item.prices.anyag)}`,
          PAGE_W - MARGIN_X,
          y,
          { align: 'right' }
        );
      }
      y += 12;

      y += 4; // sor közötti szellős tér
    }

    // Kettős szekció-részösszeg — ha subtotalPrices van, felülírja a subtotal-t.
    if (section.subtotalPrices && (section.subtotalPrices.kiszereles !== undefined || section.subtotalPrices.anyag !== undefined)) {
      ensureRoom(36);
      doc.setDrawColor(...RULE);
      doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
      y += 12;
      doc.setFont(FONT_FAMILY, 'bold');
      doc.setFontSize(10);
      const label = section.subtotalLabel ?? 'Részösszeg';
      if (section.subtotalPrices.kiszereles !== undefined) {
        doc.setTextColor(...TEXT_MUTED);
        doc.text(`${label} — Kiszerelés szerint`, MARGIN_X, y);
        doc.setTextColor(...TEXT_DARK);
        doc.text(formatFt(section.subtotalPrices.kiszereles), PAGE_W - MARGIN_X, y, { align: 'right' });
        y += 14;
      }
      if (section.subtotalPrices.anyag !== undefined) {
        doc.setTextColor(...TEXT_MUTED);
        doc.text(`${label} — Anyagszükséglet szerint`, MARGIN_X, y);
        doc.setTextColor(...TEXT_DARK);
        doc.text(formatFt(section.subtotalPrices.anyag), PAGE_W - MARGIN_X, y, { align: 'right' });
        y += 14;
      }
    } else if (section.subtotal !== undefined) {
      ensureRoom(18);
      doc.setDrawColor(...RULE);
      doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
      y += 12;
      doc.setFont(FONT_FAMILY, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...TEXT_DARK);
      doc.text(section.subtotalLabel ?? 'Részösszeg', MARGIN_X, y);
      doc.text(formatFt(section.subtotal), PAGE_W - MARGIN_X, y, { align: 'right' });
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

    doc.setFont(FONT_FAMILY, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_DARK);
    doc.text('Összesen', MARGIN_X, y);

    if (data.totals.single !== undefined) {
      doc.text(formatFt(data.totals.single), PAGE_W - MARGIN_X, y, { align: 'right' });
      y += 18;
    } else {
      y += 16;
      doc.setFontSize(10);
      if (data.totals.kiszereles !== undefined) {
        doc.setTextColor(...TEXT_MUTED);
        doc.text('Kiszerelés szerint', MARGIN_X + 10, y);
        doc.setTextColor(...TEXT_DARK);
        doc.text(formatFt(data.totals.kiszereles), PAGE_W - MARGIN_X, y, { align: 'right' });
        y += 14;
      }
      if (data.totals.anyag !== undefined) {
        doc.setTextColor(...TEXT_MUTED);
        doc.text('Anyagszükséglet szerint', MARGIN_X + 10, y);
        doc.setTextColor(...TEXT_DARK);
        doc.text(formatFt(data.totals.anyag), PAGE_W - MARGIN_X, y, { align: 'right' });
        y += 14;
      }
    }
  }

  // --- Lábjegyzet ---
  const hasPrices =
    !!data.totals?.kiszereles || !!data.totals?.anyag || !!data.totals?.single;
  if (hasPrices) {
    // A lábjegyzet mindig az utolsó oldal aljára. DejaVu Sans Condensed csak
    // Regular + Bold — italic-ot nem regisztráltunk, ezért 'normal' marad.
    doc.setFont(FONT_FAMILY, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      'Az árak tartalmazzák az ÁFÁ-t.',
      MARGIN_X,
      PAGE_H - 30
    );
  }

  const filename = `${data.filenamePrefix ?? 'betonstamp-kalkulacio'}-${todayISO()}.pdf`;
  doc.save(filename);
}
