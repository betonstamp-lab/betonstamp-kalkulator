// lib/calculators/vakolat/calculate.ts
// -----------------------------------------------------------------------------
// VAKOLAT KALKULÁTOR — számítási logika (1. fázis: FALAZATOK)
// -----------------------------------------------------------------------------
// Bemenet: 1 felület (area, thickness, surface, finishing + color, pigments,
// release on/off, impregnation mode). Visszatérés: tételsorok + bruttó végösszeg.
// Multi-felület aggregáció a page.tsx szintjén történik (több calculateVakolat hívás
// + saját aggregátor).
// -----------------------------------------------------------------------------

import {
  SURFACES,
  FINISHING,
  FORTE_PREP,
  MESH,
  MESH_OVERLAP_FACTOR,
  EST_DECOR_COLORS,
  EST_DECOR_PACKS,
  getDecorSku,
  SILCOPIN,
  MONOCROM,
  MIXOL,
  RELEASE,
  IMPREGNATION,
  isPlaceholderSku,
  type Thickness,
  type ImpregnationMode,
} from './products';
import { optimizePackages } from '@/lib/shared/packaging';

/**
 * Egy tételsor a kalkulátor eredményében. Konzisztens a többi kalkulátor
 * LineItem-jével (units × unitSize × pricePerUnit), de van pár Vakolat-specifikus
 * extra mező a fedettség kiírásához (pigment tételeknél).
 */
export interface LineItem {
  name: string;
  sku: string;
  units: number;
  unitSize: string;
  pricePerUnit: number;     // bruttó Ft / egység
  totalPrice: number;       // bruttó Ft összesen
  inCart: boolean;          // false → placeholder SKU, ne küldjük a Shoprenter API-nak
  m2Coverage?: number;      // pigment tételeknél: a kiszerelés fedettsége m²-ben (egyértékű)
  m2CoverageMin?: number;   // EST-Decor: tartomány alsó (m²)
  m2CoverageMax?: number;   // EST-Decor: tartomány felső (m²)
}

/**
 * Pigment-tétel a felhasználói választás szerint. Csak az indexek tárolódnak,
 * az ár/SKU/név mindig a products.ts-ből frissül.
 */
export type PigmentLine =
  | { type: 'est_decor'; colorKey: string; packIndex: number }
  | { type: 'silcopin'; packIndex: number }
  | { type: 'monocrom'; packIndex: number }
  | { type: 'mixol'; mixolIndex: number; packIndex: number };

export interface VakolatInput {
  area: number;
  thickness: Thickness;
  surfaceId: string;
  finishingId: string;
  finishingColorKey: string;
  pigmentLines: PigmentLine[];
  releaseOn: boolean;
  impregnationMode: ImpregnationMode;
  /** Partneri kedvezmény szorzó (1 = nincs kedvezmény; 0.9 = 10% partneri kedvezmény).
   *  A hívó számolja a profile.partner_discount mezőből — single source of truth. */
  discountMultiplier: number;
}

export interface VakolatResult {
  prepLines: LineItem[];         // előkészítő vakolat + háló
  finishingLine: LineItem;       // kialakító vakolat
  pigmentLines: LineItem[];      // EST-Decor / Silcopin / Monocrom / Mixol
  releaseLines: LineItem[];      // 0 vagy több (csak ha releaseOn)
  impregnationLines: LineItem[]; // 0 vagy több (csak ha mód !== 'none')
  totalBrutto: number;           // bruttó végösszeg listaáron
  totalPartner?: number;         // bruttó × 0.9 ha input.partner === true
}

/**
 * Az `input` érvénytelen állapotában (hiányzó felület / vakolat / szín, area ≤ 0)
 * `null`-t ad vissza. A UI a `null` esetet "kalkulálj" előtti üres állapotnak tekinti.
 */
export function calculateVakolat(input: VakolatInput): VakolatResult | null {
  if (!isFinite(input.area) || input.area <= 0) return null;
  const surface = SURFACES.find(s => s.id === input.surfaceId);
  if (!surface) return null;
  const finishing = FINISHING.find(f => f.id === input.finishingId);
  if (!finishing) return null;
  const color = finishing.colors.find(c => c.key === input.finishingColorKey);
  if (!color) return null;

  const prepLines: LineItem[] = [];

  // 1) Előkészítő réteg
  if (surface.prep === 'match') {
    // A választott kialakító vakolat előkészítő rétegként (prepM2PerBag = 4)
    const bags = Math.ceil(input.area / finishing.prepM2PerBag);
    prepLines.push({
      name: `${finishing.name} — előkészítő (${color.name})`,
      sku: color.sku,
      units: bags,
      unitSize: '25 kg zsák',
      pricePerUnit: finishing.bagPrice,
      totalPrice: bags * finishing.bagPrice,
      inCart: !isPlaceholderSku(color.sku),
    });
  } else {
    // EST-Forte előkészítő (prepM2PerBag = 7)
    const bags = Math.ceil(input.area / FORTE_PREP.prepM2PerBag);
    prepLines.push({
      name: FORTE_PREP.name + ' — előkészítő',
      sku: FORTE_PREP.sku,
      units: bags,
      unitSize: '25 kg zsák',
      pricePerUnit: FORTE_PREP.bagPrice,
      totalPrice: bags * FORTE_PREP.bagPrice,
      inCart: !isPlaceholderSku(FORTE_PREP.sku),
    });
  }

  // 2) Üvegszálas háló — átfedés-szorzó (1.1) MIATT area × 1.1, majd optimalizálás
  if (surface.needsMesh) {
    const meshNeededM2 = input.area * MESH_OVERLAP_FACTOR;
    const meshOptimized = optimizePackages(meshNeededM2, MESH);
    meshOptimized.forEach(({ pack, qty }) => {
      prepLines.push({
        name: 'Üvegszálas háló 82 gr',
        sku: pack.sku,
        units: qty,
        unitSize: pack.label,
        pricePerUnit: pack.price,
        totalPrice: qty * pack.price,
        inCart: !isPlaceholderSku(pack.sku),
      });
    });
  }

  // 3) Kialakító (befejező) réteg
  const finishingBags = Math.ceil(input.area * finishing.bagsPerM2[input.thickness]);
  const finishingLine: LineItem = {
    name: `${finishing.name} — kialakító (${color.name}, ${input.thickness} cm)`,
    sku: color.sku,
    units: finishingBags,
    unitSize: '25 kg zsák',
    pricePerUnit: finishing.bagPrice,
    totalPrice: finishingBags * finishing.bagPrice,
    inCart: !isPlaceholderSku(color.sku),
  };

  // 4) Pigment tételek — a felhasználó darabra ad hozzá; mindig 1 db kerül a tételbe
  const pigmentLines: LineItem[] = [];
  input.pigmentLines.forEach(pl => {
    if (pl.type === 'est_decor') {
      const decorColor = EST_DECOR_COLORS.find(c => c.key === pl.colorKey);
      const pack = EST_DECOR_PACKS[pl.packIndex];
      if (!decorColor || !pack) return;
      const sku = getDecorSku(decorColor, pack);
      pigmentLines.push({
        name: `EST-Decor — ${decorColor.name}`,
        sku,
        units: 1,
        unitSize: pack.label,
        pricePerUnit: pack.price,
        totalPrice: pack.price,
        inCart: !isPlaceholderSku(sku),
        m2CoverageMin: pack.m2min,
        m2CoverageMax: pack.m2max,
      });
    } else if (pl.type === 'silcopin') {
      const pack = SILCOPIN[pl.packIndex];
      if (!pack) return;
      pigmentLines.push({
        name: 'Silcopin — színtelen kötőanyag',
        sku: pack.sku,
        units: 1,
        unitSize: pack.label,
        pricePerUnit: pack.price,
        totalPrice: pack.price,
        inCart: !isPlaceholderSku(pack.sku),
        m2Coverage: pack.m2,
      });
    } else if (pl.type === 'monocrom') {
      const pack = MONOCROM[pl.packIndex];
      if (!pack) return;
      pigmentLines.push({
        name: 'Monocrom — színtelen kötőanyag',
        sku: pack.sku,
        units: 1,
        unitSize: pack.label,
        pricePerUnit: pack.price,
        totalPrice: pack.price,
        inCart: !isPlaceholderSku(pack.sku),
        m2Coverage: pack.m2,
      });
    } else if (pl.type === 'mixol') {
      const mixol = MIXOL[pl.mixolIndex];
      const pack = mixol?.packs[pl.packIndex];
      if (!mixol || !pack) return;
      pigmentLines.push({
        name: mixol.name,
        sku: pack.sku,
        units: 1,
        unitSize: pack.label,
        pricePerUnit: pack.price,
        totalPrice: pack.price,
        inCart: !isPlaceholderSku(pack.sku),
        m2Coverage: pack.m2,
      });
    }
  });

  // 5) Leválasztó (opcionális)
  const releaseLines: LineItem[] = [];
  if (input.releaseOn) {
    const releaseOptimized = optimizePackages(input.area, RELEASE);
    releaseOptimized.forEach(({ pack, qty }) => {
      releaseLines.push({
        name: 'EST-Release leválasztó',
        sku: pack.sku,
        units: qty,
        unitSize: pack.label,
        pricePerUnit: pack.price,
        totalPrice: qty * pack.price,
        inCart: !isPlaceholderSku(pack.sku),
      });
    });
  }

  // 6) Impregnálás (opcionális)
  const impregnationLines: LineItem[] = [];
  if (input.impregnationMode !== 'none') {
    const mode = IMPREGNATION[input.impregnationMode];
    const impOptimized = optimizePackages(input.area, mode.packs);
    impOptimized.forEach(({ pack, qty }) => {
      impregnationLines.push({
        name: mode.label,
        sku: pack.sku,
        units: qty,
        unitSize: pack.label,
        pricePerUnit: pack.price,
        totalPrice: qty * pack.price,
        inCart: !isPlaceholderSku(pack.sku),
      });
    });
  }

  // Végösszeg
  const sumOf = (lines: LineItem[]) => lines.reduce((s, l) => s + l.totalPrice, 0);
  const totalBrutto =
    sumOf(prepLines) +
    finishingLine.totalPrice +
    sumOf(pigmentLines) +
    sumOf(releaseLines) +
    sumOf(impregnationLines);
  const totalPartner = input.discountMultiplier < 1 ? Math.round(totalBrutto * input.discountMultiplier) : undefined;

  return {
    prepLines,
    finishingLine,
    pigmentLines,
    releaseLines,
    impregnationLines,
    totalBrutto,
    totalPartner,
  };
}

// ---------------------------------------------------------------------------
// AGGREGÁLÁS (multi-felület) — SKU-szinten csoportosít
// ---------------------------------------------------------------------------

export interface AggregatedLine {
  sku: string;
  name: string;
  unitSize: string;
  pricePerUnit: number;
  units: number;
  totalPrice: number;
  inCart: boolean;
}

export interface AggregatedResult {
  lines: AggregatedLine[];
  totalBrutto: number;
  totalPartner?: number;
}

/**
 * Több felület eredményét összeaggregálja SKU + unitSize alapján.
 * A pigment-tételek (EST-Decor m² tartomány) is bekerülnek, de a tartomány-info
 * elveszik az aggregátumban — ez OK, az aggregátum csak rendelési mennyiséget mutat.
 */
export function aggregateVakolat(results: VakolatResult[], discountMultiplier: number): AggregatedResult {
  const map = new Map<string, AggregatedLine>();

  const addLine = (l: LineItem) => {
    const key = `${l.sku}|${l.unitSize}`;
    const existing = map.get(key);
    if (existing) {
      existing.units += l.units;
      existing.totalPrice = existing.units * existing.pricePerUnit;
    } else {
      map.set(key, {
        sku: l.sku,
        name: l.name,
        unitSize: l.unitSize,
        pricePerUnit: l.pricePerUnit,
        units: l.units,
        totalPrice: l.units * l.pricePerUnit,
        inCart: l.inCart,
      });
    }
  };

  results.forEach(r => {
    r.prepLines.forEach(addLine);
    addLine(r.finishingLine);
    r.pigmentLines.forEach(addLine);
    r.releaseLines.forEach(addLine);
    r.impregnationLines.forEach(addLine);
  });

  const lines = Array.from(map.values());
  const totalBrutto = lines.reduce((s, l) => s + l.totalPrice, 0);
  const totalPartner = discountMultiplier < 1 ? Math.round(totalBrutto * discountMultiplier) : undefined;
  return { lines, totalBrutto, totalPartner };
}
