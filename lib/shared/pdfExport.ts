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

/** A Betonstamp mellé milyen második logó kerüljön a fejlécbe:
 *  - 'topciment' — Mikrocement / Bélyegzett Beton / Overlay
 *  - 'estecha'   — Vakolat (ESTonetex System)
 *  - 'none'      — csak Betonstamp (pigment kalkulátorok)
 */
export type PdfLogoVariant = 'topciment' | 'estecha' | 'none';

/** Hivatalos árajánlat-fejléc a kalkuláció ELÉ (cégbemutató + termékleírás).
 *  Ha `PdfData.quoteHeader` be van állítva, a PDF fejléc-címe a
 *  `quoteHeader.title` (default "Árajánlat") lesz a `data.title` HELYETT.
 *  A cégbemutató és termékleírás szekciók a kalkuláció szekciói ELŐTT rendereledik. */
export interface PdfQuoteHeader {
  /** Cím a fejlécben. Default: "ÁRAJÁNLAT". */
  title?: string;
  /** Cégbemutató szöveg (quote_profiles.company_intro). */
  companyIntro?: string;
  /** Termék/technológia-leírás (auto-generált + partner által szerkesztett). */
  productDescription?: string;
  /** Partner céges logója (előre dataURL-be cache-elve). Ha nincs, a PDF
   *  a beágyazott Betonstamp logót használja fallbackként. */
  companyLogo?: PdfImage;
}

/** Beágyazott referenciakép a PDF végére. A dataUrl a partner Storage-ából
 *  van előre letöltve és base64-be konvertálva (iOS gesztus szigor miatt). */
export interface PdfImage {
  dataUrl: string;
  width: number;
  height: number;
  mimeType?: 'PNG' | 'JPEG' | 'WEBP';
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
  /** A Betonstamp mellé kerülő második logó (kalkulátor-specifikus). */
  logoVariant?: PdfLogoVariant;
  /** Ha be van állítva, hivatalos árajánlatként generálódik: cégbemutató +
   *  termékleírás szekció a kalkuláció ELŐTT, és a title-t felülírja. */
  quoteHeader?: PdfQuoteHeader;
  /** Ha be van állítva, a kalkuláció UTÁN egy "Referenciák" szekció, ahol
   *  a képek 2 oszlopos rácsba beágyazódnak. */
  referenceImages?: PdfImage[];
}

// Brand-akcens (Betonstamp sárga #fbc02d). RGB.
const BRAND: [number, number, number] = [251, 192, 45];
// Betonstamp sötétkék (#053d57) — hivatalos árajánlat brand-arculatához.
const BRAND_DARK: [number, number, number] = [5, 61, 87];
const TEXT_DARK: [number, number, number] = [30, 30, 30];
const TEXT_MUTED: [number, number, number] = [110, 110, 110];
const RULE: [number, number, number] = [220, 220, 220];
const RULE_LIGHT: [number, number, number] = [230, 230, 230];

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
//
// FONT-CACHE: a font base64-eket modul-szintű változóban tartjuk, hogy a
// tényleges tap idején az `await import` MIKROTASZK-hit legyen (nem hálózati
// I/O). Ez kritikus iOS Safari-nál: az első valódi await hálózati késleltetés
// után a user-gesztus ablak lezárul, és a programmatikus blob-letöltés
// (doc.save/anchor.click) csendben blokkolt lesz. Ha a font már cache-elve
// van a gomb mount-jánál, a tap-lánc gyakorlatilag szinkron.
const FONT_FAMILY = 'DejaVuSans';
let CACHED_FONTS: { regular: string; bold: string } | null = null;

/** Előtöltő: hívja a `DownloadPdfButton` a mount pillanatában, hogy a tap-lánc
 *  már cache-elt fontot használjon. Idempotens — többször hívható. */
export async function preloadPdfFonts(): Promise<void> {
  if (CACHED_FONTS) return;
  const mod = await import('./fonts/dejavuSans');
  CACHED_FONTS = {
    regular: mod.DEJAVU_SANS_REGULAR_B64,
    bold: mod.DEJAVU_SANS_BOLD_B64,
  };
}

// Logó-cache — 3 logó a PDF-fejléchez (középre igazítva a variant szerint).
// Ugyanaz a cache + preload minta mint a fontnál: modul-szintű változóban él,
// a `DownloadPdfButton` a mount-nál betölti mindhármat (iOS gesztus-szigor
// miatt kritikus, hogy a tap pillanatában cache-hit legyen).
interface LogoAsset { dataUrl: string; width: number; height: number; }
let CACHED_BETONSTAMP_LOGO: LogoAsset | null = null;
let CACHED_TOPCIMENT_LOGO: LogoAsset | null = null;
let CACHED_ESTECHA_LOGO: LogoAsset | null = null;

/** Előtöltő: mindhárom logó base64-ét cache-eli. Idempotens, párhuzamos. */
export async function preloadPdfLogo(): Promise<void> {
  const tasks: Promise<void>[] = [];
  if (!CACHED_BETONSTAMP_LOGO) {
    tasks.push((async () => {
      const mod = await import('./images/betonstampLogoBase64');
      CACHED_BETONSTAMP_LOGO = {
        dataUrl: mod.BETONSTAMP_LOGO_DATAURL,
        width: mod.BETONSTAMP_LOGO_WIDTH,
        height: mod.BETONSTAMP_LOGO_HEIGHT,
      };
    })());
  }
  if (!CACHED_TOPCIMENT_LOGO) {
    tasks.push((async () => {
      const mod = await import('./images/topcimentLogoBase64');
      CACHED_TOPCIMENT_LOGO = {
        dataUrl: mod.TOPCIMENT_LOGO_DATAURL,
        width: mod.TOPCIMENT_LOGO_WIDTH,
        height: mod.TOPCIMENT_LOGO_HEIGHT,
      };
    })());
  }
  if (!CACHED_ESTECHA_LOGO) {
    tasks.push((async () => {
      const mod = await import('./images/estechaLogoBase64');
      CACHED_ESTECHA_LOGO = {
        dataUrl: mod.ESTECHA_LOGO_DATAURL,
        width: mod.ESTECHA_LOGO_WIDTH,
        height: mod.ESTECHA_LOGO_HEIGHT,
      };
    })());
  }
  if (tasks.length) await Promise.all(tasks);
}

async function registerUnicodeFont(doc: jsPDF): Promise<void> {
  if (!CACHED_FONTS) {
    // Fallback: ha a gomb nem hívta a preload-ot vagy még nem futott le,
    // itt is beolvassuk. Cache-hit után gyors mikrotaszk lesz.
    await preloadPdfFonts();
  }
  const fonts = CACHED_FONTS!;
  doc.addFileToVFS('DejaVuSansCondensed.ttf', fonts.regular);
  doc.addFont('DejaVuSansCondensed.ttf', FONT_FAMILY, 'normal');
  doc.addFileToVFS('DejaVuSansCondensed-Bold.ttf', fonts.bold);
  doc.addFont('DejaVuSansCondensed-Bold.ttf', FONT_FAMILY, 'bold');
  doc.setFont(FONT_FAMILY, 'normal');
}

/** A generált PDF a hívónak visszaadva — a letöltés/megjelenítés módja
 *  (anchor download vs. window.open blob-URL) a hívón dől el, hogy iOS Safari
 *  user-gesztus szigorát tiszteletben tudja tartani. */
export interface GeneratedPdf {
  /** A tényleges PDF Blob (application/pdf). */
  blob: Blob;
  /** Javasolt fájlnév (dátummal). */
  filename: string;
}

export async function generateCalculationPdf(data: PdfData): Promise<GeneratedPdf> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  await registerUnicodeFont(doc);
  // Logó előtöltés fallback (ha a hívó nem preload-olta a mount-nál).
  if (!CACHED_BETONSTAMP_LOGO) {
    try { await preloadPdfLogo(); } catch { /* nélküle is generálható */ }
  }
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
  const variant: PdfLogoVariant = data.logoVariant ?? 'none';
  const secondaryLogo: LogoAsset | null =
    variant === 'topciment' ? (CACHED_TOPCIMENT_LOGO ?? null) :
    variant === 'estecha'   ? (CACHED_ESTECHA_LOGO ?? null) :
    null;

  if (data.quoteHeader) {
    // HIVATALOS ÁRAJÁNLAT dizájn: bal-fent NAGY céges logó (fallback Betonstamp),
    // alatta "ÁRAJÁNLAT" nagy sötétkék felirat. Jobb-fent kisebb rendszer-logók
    // (Betonstamp + Topciment/Estecha) + dátum. Sötétkék elválasztó vonal alatta.
    const COMPANY_LOGO_MAX_H = 84;
    const COMPANY_LOGO_MAX_W = 200;
    const RIGHT_LOGO_H = 22;
    const RIGHT_LOGO_GAP = 10;

    // Bal: partner céglogó vagy Betonstamp fallback
    const bigLogo = data.quoteHeader.companyLogo
      ? {
          dataUrl: data.quoteHeader.companyLogo.dataUrl,
          width: data.quoteHeader.companyLogo.width,
          height: data.quoteHeader.companyLogo.height,
          mime: (data.quoteHeader.companyLogo.mimeType ?? 'PNG') as 'PNG' | 'JPEG' | 'WEBP',
        }
      : CACHED_BETONSTAMP_LOGO
        ? {
            dataUrl: CACHED_BETONSTAMP_LOGO.dataUrl,
            width: CACHED_BETONSTAMP_LOGO.width,
            height: CACHED_BETONSTAMP_LOGO.height,
            mime: 'PNG' as const,
          }
        : null;

    let bigLogoBottom = y;
    if (bigLogo) {
      const ratio = bigLogo.width / bigLogo.height;
      let h = COMPANY_LOGO_MAX_H;
      let w = h * ratio;
      if (w > COMPANY_LOGO_MAX_W) { w = COMPANY_LOGO_MAX_W; h = w / ratio; }
      try {
        doc.addImage(bigLogo.dataUrl, bigLogo.mime, MARGIN_X, y, w, h);
      } catch { /* ok */ }
      bigLogoBottom = y + h;
    }

    // Jobb: rendszer-logók egymás mellett (Betonstamp + esetleg Topciment/Estecha)
    const rightList: LogoAsset[] = [];
    if (CACHED_BETONSTAMP_LOGO) rightList.push(CACHED_BETONSTAMP_LOGO);
    if (secondaryLogo) rightList.push(secondaryLogo);
    let rightBottomY = y;
    if (rightList.length > 0) {
      const widths = rightList.map((l) => RIGHT_LOGO_H * (l.width / l.height));
      const totalW = widths.reduce((s, w) => s + w, 0) + RIGHT_LOGO_GAP * (rightList.length - 1);
      let cx = PAGE_W - MARGIN_X - totalW;
      for (let i = 0; i < rightList.length; i++) {
        try { doc.addImage(rightList[i].dataUrl, 'PNG', cx, y, widths[i], RIGHT_LOGO_H); } catch { /* ok */ }
        cx += widths[i] + RIGHT_LOGO_GAP;
      }
      rightBottomY = y + RIGHT_LOGO_H;
    }

    // Dátum jobb-felső logó ALATT, kis szürke
    doc.setFont(FONT_FAMILY, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(todayISO(), PAGE_W - MARGIN_X, rightBottomY + 12, { align: 'right' });

    // Nagy "ÁRAJÁNLAT" felirat a bal-oldali logó ALATT
    const titleY = bigLogoBottom + 22;
    doc.setFont(FONT_FAMILY, 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...BRAND_DARK);
    const bigTitle = (data.quoteHeader.title || 'ÁRAJÁNLAT').toUpperCase();
    doc.text(bigTitle, MARGIN_X, titleY);

    // Ár-mód (kisebb, sárga, a cím alatt)
    doc.setFont(FONT_FAMILY, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...BRAND);
    const modeLabelQ = data.pricingMode === 'partner' ? 'Ár: Partner' : 'Ár: Általános';
    doc.text(modeLabelQ, MARGIN_X, titleY + 14);

    // Fejléc-lezárás: sötétkék vastag vonal
    const headerEndY = Math.max(bigLogoBottom, rightBottomY + 14, titleY + 22);
    doc.setDrawColor(...BRAND_DARK);
    doc.setLineWidth(1.5);
    doc.line(MARGIN_X, headerEndY, PAGE_W - MARGIN_X, headerEndY);
    y = headerEndY + 16;
  } else {
    // KALKULÁCIÓ-PDF (változatlan) — Betonstamp + kalkulátor-specifikus közép,
    // dátum jobb-felül, cím + ár-mód + halvány elválasztó.
    const LOGO_H = 36;
    const LOGO_GAP = 20;
    const logoList: LogoAsset[] = [];
    if (CACHED_BETONSTAMP_LOGO) logoList.push(CACHED_BETONSTAMP_LOGO);
    if (secondaryLogo) logoList.push(secondaryLogo);

    let logoBottomY = y;
    if (logoList.length > 0) {
      const widths = logoList.map((l) => LOGO_H * (l.width / l.height));
      const totalW = widths.reduce((s, w) => s + w, 0) + LOGO_GAP * (logoList.length - 1);
      let cx = (PAGE_W - totalW) / 2;
      for (let i = 0; i < logoList.length; i++) {
        doc.addImage(logoList[i].dataUrl, 'PNG', cx, y, widths[i], LOGO_H);
        cx += widths[i] + LOGO_GAP;
      }
      logoBottomY = y + LOGO_H;
    }
    doc.setFont(FONT_FAMILY, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    const dateY = logoList.length > 0 ? y + 10 : y + 12;
    doc.text(todayISO(), PAGE_W - MARGIN_X, dateY, { align: 'right' });
    y = logoBottomY + (logoList.length > 0 ? 12 : 0);

    doc.setTextColor(...TEXT_DARK);
    doc.setFont(FONT_FAMILY, 'bold');
    doc.setFontSize(13);
    doc.text(data.title, MARGIN_X, y);
    y += 18;

    doc.setFont(FONT_FAMILY, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND);
    const modeLabel = data.pricingMode === 'partner' ? 'Ár: Partner' : 'Ár: Általános';
    doc.text(modeLabel, MARGIN_X, y);
    y += 14;

    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
    y += 14;
  }

  // Szekció-cím szín: árajánlat-módban brand sötétkék, egyébként a kalkuláció fekete.
  const headingColor = data.quoteHeader ? BRAND_DARK : TEXT_DARK;
  // Árajánlat-mód: az "(összesített)" toldalékot NE mutassuk (a kalkulátor
  // buildData-ban maradhat, hogy a kalkuláció-PDF változatlan legyen).
  const cleanQuoteText = (s: string): string =>
    data.quoteHeader ? s.replace(/\s*\(összesített\)/gi, '') : s;

  // --- Árajánlat-fejléc szekciók (cégbemutató + termékleírás) ---
  if (data.quoteHeader) {
    const renderQuoteBlock = (heading: string, body: string) => {
      if (!body || !body.trim()) return;
      ensureRoom(30);
      doc.setFont(FONT_FAMILY, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...headingColor);
      doc.text(heading, MARGIN_X, y);
      y += 14;
      doc.setFont(FONT_FAMILY, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...TEXT_DARK);
      // A bekezdéseket meg\ntartva tördeljük — az újsorokat követjük.
      const paragraphs = body.split(/\r?\n/);
      const lineHeight = 13;
      for (const para of paragraphs) {
        if (!para.trim()) { y += lineHeight / 2; continue; }
        const lines = doc.splitTextToSize(para, CONTENT_W);
        for (const line of Array.isArray(lines) ? lines : [lines]) {
          ensureRoom(lineHeight);
          doc.text(line, MARGIN_X, y);
          y += lineHeight;
        }
      }
      y += 8;
    };
    renderQuoteBlock('Cégbemutató', data.quoteHeader.companyIntro ?? '');
    renderQuoteBlock('Termék és technológia', data.quoteHeader.productDescription ?? '');
  }

  // --- Szekciók ---
  doc.setTextColor(...TEXT_DARK);

  for (const section of data.sections) {
    ensureRoom(30);
    if (section.heading) {
      doc.setFont(FONT_FAMILY, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...headingColor);
      doc.text(cleanQuoteText(section.heading), MARGIN_X, y);
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
      // Árajánlat-módban: CSAK a kiszerelés szerinti ár (a single vagy kiszereles),
      // anyagszükséglet nélkül. Kalkuláció-módban a régi logika (single → kiszereles).
      const priceMain =
        item.prices?.single !== undefined
          ? formatFt(item.prices.single)
          : item.prices?.kiszereles !== undefined
            ? formatFt(item.prices.kiszereles)
            : '';
      const priceWidth = priceMain
        ? doc.getTextWidth(priceMain) + 6
        : 0;
      const nameMaxW = Math.max(60, CONTENT_W - priceWidth);
      const nameText = cleanQuoteText(item.name);
      const nameLines = doc.splitTextToSize(nameText, nameMaxW);
      if (nameText) {
        doc.text(nameLines, MARGIN_X, y);
      }
      if (priceMain) {
        doc.text(priceMain, PAGE_W - MARGIN_X, y, { align: 'right' });
      }
      const nameLineHeight = 12;
      const linesCount = Array.isArray(nameLines) ? nameLines.length : 1;
      const nameHeight = Math.max(1, linesCount) * nameLineHeight;
      y += nameHeight;

      // Mennyiség + secondary ár (anyag) sor.
      // Árajánlat-módban az anyagszükséglet-árat NEM mutatjuk; a mennyiség sor
      // megmaradhat (a tétel-név gyakran maga tartalmazza a "N × KISZERELÉS"-t,
      // de ha van külön quantity, azt is kiírjuk halványan).
      const showAnyag = !data.quoteHeader && item.prices?.anyag !== undefined;
      if (item.quantity || showAnyag) {
        doc.setFontSize(9);
        doc.setTextColor(...TEXT_MUTED);
        if (item.quantity) {
          doc.text(item.quantity, MARGIN_X + 8, y);
        }
        if (showAnyag) {
          doc.text(
            `Anyagszükséglet: ${formatFt(item.prices!.anyag!)}`,
            PAGE_W - MARGIN_X,
            y,
            { align: 'right' }
          );
        }
        y += 12;
      }

      y += 4; // sor közötti szellős tér
    }

    // Kettős szekció-részösszeg — ha subtotalPrices van, felülírja a subtotal-t.
    // Árajánlat-módban a szekció-részösszegeket SEHOL nem mutatjuk (tisztább kép).
    if (data.quoteHeader) {
      // skip a részösszeg-blokkot árajánlat-módban
    } else if (section.subtotalPrices && (section.subtotalPrices.kiszereles !== undefined || section.subtotalPrices.anyag !== undefined)) {
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
    if (data.quoteHeader) {
      // ÁRAJÁNLAT: sötétkék háttér-blokk fehér szöveggel — HANGSÚLYOS brand-lezárás.
      // Egyetlen ár: a kiszerelés szerinti (vagy single, ha nincs kettős bontás).
      const quoteTotal = data.totals.single ?? data.totals.kiszereles ?? data.totals.anyag ?? 0;
      const blockH = 32;
      doc.setFillColor(...BRAND_DARK);
      doc.rect(MARGIN_X, y, PAGE_W - MARGIN_X * 2, blockH, 'F');
      const innerX = MARGIN_X + 12;
      const innerY = y + 20;
      doc.setFont(FONT_FAMILY, 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('Összesen', innerX, innerY);
      doc.text(formatFt(quoteTotal), PAGE_W - MARGIN_X - 12, innerY, { align: 'right' });
      y += blockH + 8;
    } else {
      // Kalkuláció-PDF (változatlan)
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
  }

  // --- Referenciaképek (a végösszeg UTÁN, a lábjegyzet ELŐTT) ---
  if (data.referenceImages && data.referenceImages.length > 0) {
    y += 10;
    ensureRoom(30);
    doc.setFont(FONT_FAMILY, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...headingColor);
    doc.text('Referenciák', MARGIN_X, y);
    y += 14;

    // 2 oszlopos rács. Cella szélessége = fél CONTENT_W - kis rés.
    const IMG_GAP = 12;
    const cellW = (CONTENT_W - IMG_GAP) / 2;
    const cellMaxH = 140; // arányos maximum, hogy egy oldalon 2 sor is elférjen

    let col = 0;
    let rowH = 0;
    let rowStartY = y;
    for (const img of data.referenceImages) {
      if (!img.dataUrl || !img.width || !img.height) continue;
      // Célméret arányosan a cellába, aránytartással.
      const ratio = img.width / img.height;
      let w = cellW;
      let h = cellW / ratio;
      if (h > cellMaxH) { h = cellMaxH; w = cellMaxH * ratio; }
      // Új sor kell?
      if (col === 0) {
        // Az új sort MOST fogjuk kezdeni — ellenőrizzük, hogy elfér-e még ezen az oldalon.
        ensureRoom(cellMaxH + 6);
        rowStartY = y;
        rowH = 0;
      }
      const cellX = MARGIN_X + col * (cellW + IMG_GAP) + (cellW - w) / 2;
      const fmt = (img.mimeType ?? 'PNG') as 'PNG' | 'JPEG' | 'WEBP';
      try {
        doc.addImage(img.dataUrl, fmt, cellX, rowStartY, w, h);
      } catch {
        // ha a kép-formátum gond, csendben skip — a többi PDF-nek nem szabad meghalnia
      }
      rowH = Math.max(rowH, h);
      col += 1;
      if (col >= 2) {
        col = 0;
        y = rowStartY + rowH + IMG_GAP;
      }
    }
    // Utolsó félbe maradt sor lezárása
    if (col === 1) {
      y = rowStartY + rowH + IMG_GAP;
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
  const blob = doc.output('blob');
  return { blob, filename };
}
