// lib/calculators/vakolat/products.ts
// -----------------------------------------------------------------------------
// VAKOLAT KALKULÁTOR — ESTonetex System (1. fázis: FALAZATOK)
// -----------------------------------------------------------------------------
// Forrás: microcement_m2.xlsx → "Vakolatok" munkalap + Rétegrendek PDF (ESTonetex).
// FONTOS: minden ár BRUTTÓ (27% ÁFA-val), pontosan mint a mikrocement kalkulátornál.
// A partneri kedvezményt a közös logika (profiles.partner_discount) alkalmazza,
// ugyanúgy mint a többi kalkulátornál — itt csak a bruttó alapárakat tároljuk.
//
// SKU-k: a Shoprenter export (2026-06-07) alapján; a korábbi 3 placeholder
// (Silcopin 1L színtelen, EST-3 Plus 0.25L, 80gr háló 1m²) időközben felkerült
// a shopra a valós cikkszámokkal, így minden tétel kosárba kerül.
//
// Hatókör: csak a FÜGGŐLEGES FALAK (falazatok). A medence / munkapult / felújítás /
// témapark / díszkő munkatípusok KIMARADNAK ebből a fázisból.
// -----------------------------------------------------------------------------

export type Thickness = '1.5' | '2.2' | '3'; // cm — a kialakító (befejező) réteg vastagsága

// Egy kiszerelés: ár (bruttó) + fedés (m²) + Shoprenter SKU
export interface PackOption {
  label: string;   // pl. "25 kg", "5 L"
  price: number;   // bruttó Ft
  m2: number;      // hány m²-re elég EZ a kiszerelés
  sku: string;     // Shoprenter cikkszám
}

// ---------------------------------------------------------------------------
// 1) ALAPFELÜLETEK (a "Felület kiválasztása" gomb opciói)
//    prep: 'match' = az előkészítő vakolat a választott KIALAKÍTÓ vakolattal
//                    azonos típusú (EST-TXT vagy EST-Park), előkészítő fedéssel.
//          'forte' = az előkészítő mindig EST-Forte, függetlenül a kialakítótól.
//    needsMesh: minden falazatnál kell üvegszálas háló (82 gr).
//    Rögzítők (dübel/csavar/horgony) NEM szerepelnek — Gábor döntése szerint kimaradnak.
// ---------------------------------------------------------------------------
export interface Surface {
  id: string;
  name: string;
  prep: 'match' | 'forte';
  needsMesh: boolean;
  info: string;
}

export const SURFACES: Surface[] = [
  { id: 'beton_falazat', name: 'Beton falazat', prep: 'match', needsMesh: true,
    info: 'Előkészítő réteg: a választott kialakító vakolat (EST-TXT vagy EST-Park) 4–5 mm, belesimított üvegszálas hálóval.' },
  { id: 'tegla', name: 'Tégla', prep: 'match', needsMesh: true,
    info: 'Előkészítő réteg: a választott kialakító vakolat (EST-TXT vagy EST-Park) 4–5 mm, belesimított üvegszálas hálóval.' },
  { id: 'monolit_beton', name: 'Monolit betonfal', prep: 'forte', needsMesh: true,
    info: 'Előkészítő réteg: EST-Forte 4–5 mm + üvegszálas háló (a katalógus szerint dübellel rögzítve — a dübelt nem áraztuk).' },
  { id: 'gipszkarton', name: 'Gipszkarton', prep: 'forte', needsMesh: true,
    info: 'Előkészítő réteg: EST-Forte 4–5 mm + üvegszálas háló (csavarral rögzítve — a csavart nem áraztuk).' },
  { id: 'hungarocell', name: 'Hungarocell (EPS-XPS)', prep: 'forte', needsMesh: true,
    info: 'Előkészítő réteg: EST-Forte 4–5 mm + üvegszálas háló (horgonnyal rögzítve — a horgonyt nem áraztuk).' },
  { id: 'gipszes_festett', name: 'Gipszes / festett fal', prep: 'forte', needsMesh: true,
    info: 'Előkészítő réteg: EST-Forte 4–5 mm + üvegszálas háló (dübellel rögzítve — a dübelt nem áraztuk).' },
];

// ---------------------------------------------------------------------------
// 2) KIALAKÍTÓ (BEFEJEZŐ) VAKOLATOK — falazatnál EST-TXT vagy EST-Park
//    bagsPerM2: hány 25 kg-os zsák kell 1 m²-re az adott vastagságnál.
//    (Excel "Felület kialakításához": 1,5 cm → 1 ; 2,2 cm → 1,5 ; 3 cm → 2)
//    prepM2PerBag: ugyanezen termék ELŐKÉSZÍTŐ rétegként (4–5 mm) — Excel "előkészítésnél".
//    Színenkénti SKU: minden vakolat (TXT/Park) 3 színben (homok/szürke/fehér),
//    a Shoprenter külön cikkszámmal kezeli színenként.
// ---------------------------------------------------------------------------
export interface FinishingColor {
  key: 'homok' | 'szurke' | 'feher';
  name: string;   // megjelenítendő név
  sku: string;    // Shoprenter cikkszám
  hex: string;    // ColorSwatch-hez (#RRGGBB)
}

export interface FinishingPlaster {
  id: string;
  name: string;
  colors: FinishingColor[];  // szín-választás per termék
  bagPrice: number;          // bruttó Ft / 25 kg zsák (minden színnél azonos)
  bagKg: number;
  bagsPerM2: Record<Thickness, number>;
  prepM2PerBag: number;      // előkészítő rétegként hány m²-re elég 1 zsák
}

export const FINISHING: FinishingPlaster[] = [
  {
    id: 'est_txt', name: 'EST-TXT vakolat',
    colors: [
      { key: 'homok',  name: 'homokkő', sku: 'MOR-EXP-AREN',    hex: '#D8C4A0' },
      { key: 'szurke', name: 'szürke',  sku: 'MOR-EXP-GRIS',    hex: '#A6A6A4' },
      { key: 'feher',  name: 'fehér',   sku: 'MOR-EXP-BLANCO',  hex: '#F1EFE9' },
    ],
    bagPrice: 10990, bagKg: 25,
    bagsPerM2: { '1.5': 1, '2.2': 1.5, '3': 2 },
    prepM2PerBag: 4,
  },
  {
    id: 'est_park', name: 'EST-Park vakolat',
    colors: [
      { key: 'homok',  name: 'homokkő', sku: 'MORT-S-AREN',    hex: '#D8C4A0' },
      { key: 'szurke', name: 'szürke',  sku: 'MORT-S-GRIS',    hex: '#A6A6A4' },
      { key: 'feher',  name: 'fehér',   sku: 'MORT-S-BLANCO',  hex: '#F1EFE9' },
    ],
    bagPrice: 9490, bagKg: 25,
    bagsPerM2: { '1.5': 1, '2.2': 1.5, '3': 2 },
    prepM2PerBag: 4,
  },
];

// EST-Forte — előkészítő vakolat a 'forte' típusú felületekhez (csak fehér).
export const FORTE_PREP = {
  id: 'est_forte', name: 'EST-Forte vakolat (fehér)',
  sku: 'MORT-FORT-ARE',
  bagPrice: 14690, bagKg: 25,
  prepM2PerBag: 7, // 1 zsák ~7 m² előkészítő rétegként
};

// ---------------------------------------------------------------------------
// 3) ÜVEGSZÁLAS HÁLÓ (82 gr) — minden falazatnál.
//    FONTOS: az átfedések (~10 cm takarás a háló-illesztéseknél) miatt
//    a szükséges háló-mennyiség = felület m² × 1,1 (MESH_OVERLAP_FACTOR).
//    Pl. 10 m² felület → 11 m² háló. Csak EZUTÁN jön a csomag-optimalizálás.
//    Csomag-optimalizálás: 50 m²-es tekercs + 1 m²-es darab a legolcsóbb kombóra.
//    Mindkét kiszerelés (50m² tekercs, 1m² darab) szerepel a Shoprenteren.
// ---------------------------------------------------------------------------
export const MESH_OVERLAP_FACTOR = 1.1; // átfedés/takarás az illesztéseknél
export const MESH: PackOption[] = [
  { label: '50 m² tekercs', price: 22535, m2: 50, sku: 'UVEHA82' },
  { label: '1 m²',          price: 460,   m2: 1,  sku: 'UVEHA82-1M' },
];

// ---------------------------------------------------------------------------
// 4) PIGMENTÁLÁS — OPCIONÁLIS, EFFEKT jellegű (nem a teljes felületre).
//    A felhasználó DARABSZÁMRA választ; a rendszer csak KIÍRJA, hány m²-re elég.
//    Logika (Gábor + Norbi alapján):
//      - EST-Decor: poralapú, durvább szemcse, ELŐBB kerül fel. Önállóan NEM megy,
//        mindig kötőanyaggal (Silcopin VAGY Monocrom).
//      - Silcopin + Mixol: enyhébb szín, több réteggel erősíthető.
//      - Monocrom + Mixol: jóval erősebb, akár 1 réteg teljesen átszínez.
//      - A Mixol a folyékony kötőanyagba (Silcopin/Monocrom) kevert színező.
//    Mind opcionális, kihagyható.
// ---------------------------------------------------------------------------

// EST-Decor (poralapú alapszín) — 8 szín, csomagonként 3 kiszerelés.
// SKU pattern: EST-DECO-{kiszerelés}-{szín-kód}
export interface DecorColor {
  key: string;   // SKU-suffix: ARC, BLAN, CENI, CUER, GRAFIT, MUS, OCRE, TERRA
  name: string;  // megjelenítendő név
  hex: string;   // ColorSwatch-hez
}
export const EST_DECOR_COLORS: DecorColor[] = [
  { key: 'ARC',    name: 'Arcilla (agyag)',         hex: '#B77B6F' },
  { key: 'BLAN',   name: 'Blanco (fehér)',          hex: '#F3F6FB' },
  { key: 'CENI',   name: 'Ceniza (hamuszürke)',     hex: '#8F9095' },
  { key: 'CUER',   name: 'Cuero (bőr)',             hex: '#A07651' },
  { key: 'GRAFIT', name: 'Grafito (grafitszürke)',  hex: '#5F5E62' },
  { key: 'MUS',    name: 'Musgo (moha)',            hex: '#95AE63' },
  { key: 'OCRE',   name: 'Ocre (okker)',            hex: '#D6A05E' },
  { key: 'TERRA',  name: 'Terracotta',              hex: '#8B524A' },
];

export interface DecorPack {
  label: string;
  price: number;
  m2min: number;
  m2max: number;
  skuPrefix: string;  // a teljes SKU = skuPrefix + DecorColor.key
}
export const EST_DECOR_PACKS: DecorPack[] = [
  { label: '1 kg',  price: 5420,  m2min: 1.5, m2max: 10,  skuPrefix: 'EST-DECO-1kg-' },
  { label: '3 kg',  price: 11300, m2min: 4.5, m2max: 30,  skuPrefix: 'EST-DECO-3kg-' },
  { label: '10 kg', price: 32140, m2min: 15,  m2max: 100, skuPrefix: 'EST-DECO-10kg-' },
];

/** Segéd a SKU-építéshez: getDecorSku({key:'ARC'}, {skuPrefix:'EST-DECO-1kg-'}) → 'EST-DECO-1kg-ARC' */
export function getDecorSku(color: DecorColor, pack: DecorPack): string {
  return pack.skuPrefix + color.key;
}

// Kötőanyagok (színtelen gyanta) — ezekbe kerül a Mixol színező.
// SILCOPIN: a színtelen kiszerelések (1L és 10L) a Shoprenteren.
export const SILCOPIN: PackOption[] = [
  { label: '1 L',  price: 5840,  m2: 5,  sku: 'EST26-TRANS1' },
  { label: '10 L', price: 44930, m2: 50, sku: 'EST26-TRANS10' },
];
export const MONOCROM: PackOption[] = [
  { label: '1 L', price: 10480, m2: 3,  sku: 'MONOCROMTRANS1L' }, // Gábor: 3 m² / 1 L
  { label: '5 L', price: 34460, m2: 15, sku: 'MONOCROMTRANS5L' }, // 5 L → 15 m²
];

// Mixol színezők — 200/500 gr, fedés az Excelből (a kötőanyaghoz adagolva).
// hex: a "rendes" 17 színhez; gradient: a 3 fémes (ME1/ME2/ME3) színhez CSS background-image-ként.
export interface MixolColor {
  name: string;
  packs: PackOption[];
  hex?: string;
  gradient?: string;
}
export const MIXOL: MixolColor[] = [
  { name: 'Mixol 2 — Umbra (árnyék)',      hex: '#756A4A', packs: [{ label: '200 gr', price: 14465, m2: 330, sku: 'TINT-MIX-2-200' },  { label: '500 gr', price: 30040,  m2: 825, sku: 'TINT-MIX-2-500' }] },
  { name: 'Mixol 3 — szarvasbarna',        hex: '#B3916C', packs: [{ label: '200 gr', price: 14465, m2: 330, sku: 'TINT-MIX-3-200' },  { label: '500 gr', price: 30040,  m2: 825, sku: 'TINT-MIX-3-500' }] },
  { name: 'Mixol 4 — vörös',               hex: '#BF6B69', packs: [{ label: '200 gr', price: 14465, m2: 330, sku: 'TINT-MIX-4-200' },  { label: '500 gr', price: 30040,  m2: 825, sku: 'TINT-MIX-4-500' }] },
  { name: 'Mixol 5 — okkersárga',          hex: '#E3AD55', packs: [{ label: '200 gr', price: 14465, m2: 330, sku: 'TINT-MIX-5-200' },  { label: '500 gr', price: 30040,  m2: 825, sku: 'TINT-MIX-5-500' }] },
  { name: 'Mixol 9 — kék',                 hex: '#629CE5', packs: [{ label: '200 gr', price: 17990, m2: 330, sku: 'TINT-MIX-9-200' },  { label: '500 gr', price: 38995,  m2: 825, sku: 'TINT-MIX-9-500' }] },
  { name: 'Mixol 14 — zöld',               hex: '#90B186', packs: [{ label: '200 gr', price: 18180, m2: 330, sku: 'TINT-MIX-14-200' }, { label: '500 gr', price: 38995,  m2: 825, sku: 'TINT-MIX-14-500' }] },
  { name: 'Mixol 19 — tevebarna',          hex: '#E59B6A', packs: [{ label: '200 gr', price: 15600, m2: 330, sku: 'TINT-MIX-19-200' }, { label: '500 gr', price: 31660,  m2: 825, sku: 'TINT-MIX-19-500' }] },
  { name: 'Mixol 20 — gesztenyebarna',     hex: '#CA826A', packs: [{ label: '200 gr', price: 15600, m2: 330, sku: 'TINT-MIX-20-200' }, { label: '500 gr', price: 31660,  m2: 825, sku: 'TINT-MIX-20-500' }] },
  { name: 'Mixol 21 — földbarna',          hex: '#A8704F', packs: [{ label: '200 gr', price: 15600, m2: 330, sku: 'TINT-MIX-21-200' }, { label: '500 gr', price: 31660,  m2: 825, sku: 'TINT-MIX-21-500' }] },
  { name: 'Mixol 22 — dohánybarna',        hex: '#B29478', packs: [{ label: '200 gr', price: 15600, m2: 330, sku: 'TINT-MIX-22-200' }, { label: '500 gr', price: 31660,  m2: 825, sku: 'TINT-MIX-22-500' }] },
  { name: 'Mixol 23 — sötétbarna',         hex: '#745950', packs: [{ label: '200 gr', price: 15600, m2: 330, sku: 'TINT-MIX-23-200' }, { label: '500 gr', price: 31660,  m2: 825, sku: 'TINT-MIX-23-500' }] },
  { name: 'Mixol 24 — kőszürke',           hex: '#9A9180', packs: [{ label: '200 gr', price: 15600, m2: 330, sku: 'TINT-MIX-24-200' }, { label: '500 gr', price: 31660,  m2: 825, sku: 'TINT-MIX-24-500' }] },
  { name: 'Mixol 25 — fehér',              hex: '#E9E9E9', packs: [{ label: '200 gr', price: 15600, m2: 330, sku: 'TINT-MIX-25-200' }, { label: '500 gr', price: 31660,  m2: 825, sku: 'TINT-MIX-25-500' }] },
  { name: 'Mixol 29 — fekete',             hex: '#524F5A', packs: [{ label: '200 gr', price: 17990, m2: 330, sku: 'TINT-MIX-29-200' }, { label: '500 gr', price: 38995,  m2: 825, sku: 'TINT-MIX-29-500' }] },
  { name: 'Mixol 30 — sárga oxid (elit)',  hex: '#E9E804', packs: [{ label: '200 gr', price: 61320, m2: 330, sku: 'TINT-MIX-30-200' }, { label: '500 gr', price: 148330, m2: 825, sku: 'TINT-MIX-30-500' }] },
  { name: 'Mixol 31 — zöld oxid (elit)',   hex: '#53B079', packs: [{ label: '200 gr', price: 61320, m2: 330, sku: 'TINT-MIX-31-200' }, { label: '500 gr', price: 148330, m2: 825, sku: 'TINT-MIX-31-500' }] },
  { name: 'Mixol 32 — kék oxid (elit)',    hex: '#577DC6', packs: [{ label: '200 gr', price: 61320, m2: 330, sku: 'TINT-MIX-32-200' }, { label: '500 gr', price: 148330, m2: 825, sku: 'TINT-MIX-32-500' }] },
  { name: 'Mixol ME1 — arany',             gradient: 'linear-gradient(135deg, #BD8D4B, #FCF7B2, #BF8F30)', packs: [{ label: '200 gr', price: 37500, m2: 330, sku: 'TINT-MIX-ORO' }] },
  { name: 'Mixol ME2 — ezüst',             gradient: 'linear-gradient(135deg, #BCBCBC, #F7F7F7, #AEAEAE)', packs: [{ label: '200 gr', price: 24400, m2: 330, sku: 'TINT-MIX-PLA' }] },
  { name: 'Mixol ME3 — réz',               gradient: 'linear-gradient(135deg, #B05D34, #F29363, #B05D34)', packs: [{ label: '200 gr', price: 20700, m2: 330, sku: 'TINT-MIX-BRO' }] },
];

// ---------------------------------------------------------------------------
// 5) LEVÁLASZTÓ (EST-Release) — OPCIONÁLIS, csak textúrázáshoz / bélyegzéshez.
//    Ha bekapcsolják: m² alapján auto, csomag-optimalizálással (1L/5L/25L).
//    FIGYELMEZTETÉS a UI-ban: "Leválasztó csak akkor szükséges, ha a felületet
//    textúrázod / bélyegzed. Sima vakolathoz nem kell."
//    Az 1L árát a products.ts mérvadója szerint tartjuk (5830) — a shop ár (5200)
//    elavult, Gábor frissíti a shopot.
// ---------------------------------------------------------------------------
export const RELEASE: PackOption[] = [
  { label: '1 L',  price: 5830,   m2: 10,  sku: 'EST-DESMOL1' },
  { label: '5 L',  price: 29510,  m2: 50,  sku: 'EST-DESMOL5' },
  { label: '25 L', price: 130910, m2: 250, sku: 'EST-DESMOL25' },
];
export const RELEASE_WARNING =
  'A leválasztó folyadék csak akkor szükséges, ha a felületet textúrázod vagy bélyegzed. Sima vakolt felülethez nem kell.';

// ---------------------------------------------------------------------------
// 6) IMPREGNÁLÁS (EST-3 plusz koncentrátum) — OPCIONÁLIS.
//    NINCS lakk! Ezek lélegző vakolatok, tilos lakkozni — csak impregnálás a védelem.
//    Három választás: "nincs" / "1:14 normál" / "1:6 vizes".
//    Ugyanaz a termék, csak a hígítás (és így a fedés) más.
//    Mindhárom kiszerelés (0,25 L / 1 L / 5 L) szerepel a Shoprenteren.
//    Magyarázó szöveg segítse a választást (lásd lent).
// ---------------------------------------------------------------------------
export type ImpregnationMode = 'none' | 'normal_1_14' | 'wet_1_6';

export const IMPREGNATION = {
  none: { id: 'none' as const, label: 'Nem kérek impregnálást', packs: [] as PackOption[] },
  normal_1_14: {
    id: 'normal_1_14' as const, label: 'Impregnálás — 1:14 hígítás (normál felület)',
    packs: [
      { label: '0,25 L', price: 18360,  m2: 20,  sku: 'EST-3-PLUS2.5' },
      { label: '1 L',    price: 73440,  m2: 80,  sku: 'EST-3-PLUS1' },
      { label: '5 L',    price: 324580, m2: 400, sku: 'EST-3-PLUS5' },
    ] as PackOption[],
  },
  wet_1_6: {
    id: 'wet_1_6' as const, label: 'Impregnálás — 1:6 hígítás (vizes felület)',
    packs: [
      { label: '0,25 L', price: 18360,  m2: 9,   sku: 'EST-3-PLUS2.5' },
      { label: '1 L',    price: 73440,  m2: 35,  sku: 'EST-3-PLUS1' },
      { label: '5 L',    price: 324580, m2: 175, sku: 'EST-3-PLUS5' },
    ] as PackOption[],
  },
};

export const IMPREGNATION_HELP =
  'Beltéri, száraz felületnél az impregnálás általában elhagyható. Kültéren ajánlott. ' +
  'Normál felülethez az 1:14 hígítás megfelelő; vizes terheléshez (patak, tusoló, vízesés, medence-környezet) ' +
  'az erősebb 1:6 hígítást válaszd.';

// ---------------------------------------------------------------------------
// HELPER: TODO- prefixű placeholder SKU-k felismerése. Jelenleg egyik termékre
// sem ad igazat (mindegyik valós Shoprenter cikkszámmal rendelkezik), de a
// helper marad biztonsági hálóként, ha későbbi termék SKU-ja hiányozna.
// ---------------------------------------------------------------------------
export function isPlaceholderSku(sku: string): boolean {
  return sku.startsWith('TODO-');
}

// ---------------------------------------------------------------------------
// MEGJEGYZÉSEK A SZÁMÍTÁSI LOGIKÁHOZ (a calculate.ts-hez):
//
// Bemenet: felület m², vastagság (1.5/2.2/3 cm), alapfelület, kialakító vakolat
//          (EST-TXT/EST-Park) + szín, [pigment tételek], [leválasztó be/ki],
//          [impregnálás: none/1:14/1:6], partner (bool).
//
// Anyagok:
//  1. Előkészítő réteg:
//       - 'match' felület  → a választott kialakító vakolat, prepM2PerBag (4) szerint:
//                            zsák = ceil(area / 4)
//       - 'forte' felület  → EST-Forte, prepM2PerBag (7) szerint: zsák = ceil(area / 7)
//  2. Háló: szükséges m² = area * MESH_OVERLAP_FACTOR (1,1) az átfedések miatt,
//     majd optimalizált csomag (50 m² tekercs + 1 m² darab), legolcsóbb kombó.
//  3. Kialakító réteg: zsák = ceil(area * bagsPerM2[vastagság]).
//  4. Pigment (ha van): a felhasználó darabra választ → tételenként ár + kiírt fedés (m²).
//                       EST-Decor mellé KÖTELEZŐ kötőanyag (Silcopin VAGY Monocrom).
//  5. Leválasztó (ha be): area m² → optimalizált csomag (1/5/25 L). + figyelmeztetés.
//  6. Impregnálás (ha nem none): area m² → optimalizált csomag (0,25/1/5 L) a mód fedésével.
//
// Árazás: minden ár BRUTTÓ. Partner pipa esetén a közös partner-kedvezmény logika
//         vonja le, ugyanúgy mint a mikrocement/overlay kalkulátornál.
//         A csomag-optimalizálás (lib/shared/packaging.ts → optimizePackages) közös segéd.
// ---------------------------------------------------------------------------
