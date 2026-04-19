// Stonecem Floor — felületkeményítő (6 szín)
export const STONECEM_FLOOR_COLORS = [
  { key: 'ANTRACITA', name: 'Antracita (sötétszürke)', sku: 'TT11703', hex: '#535152', m2PerBucket: 8, category: 'sötét' },
  { key: 'CEMENTO',   name: 'Cemento (cementszürke)',  sku: 'TT11705', hex: '#88837f', m2PerBucket: 7, category: 'világos' },
  { key: 'CREMA',     name: 'Crema (krém)',            sku: 'TT11715', hex: '#e3c394', m2PerBucket: 7, category: 'világos' },
  { key: 'NOGAL',     name: 'Nogal (dióbarna)',        sku: 'TT11710', hex: '#735652', m2PerBucket: 8, category: 'sötét' },
  { key: 'PIZARRA',   name: 'Pizarra (középszürke)',   sku: 'TT11704', hex: '#645a5b', m2PerBucket: 8, category: 'sötét' },
  { key: 'TOSTADO',   name: 'Tostado (sárgásbarna)',   sku: 'TT11713', hex: '#8b664c', m2PerBucket: 8, category: 'sötét' },
] as const;

export type StonecemFloorColorKey = typeof STONECEM_FLOOR_COLORS[number]['key'];

export const STONECEM_FLOOR_PRICE = 17913; // nettó Ft/25kg vödör (minden színnél)
export const STONECEM_FLOOR_KG_PER_BUCKET = 25;

// Arcocem Fast — pigmentált beton (12 szín, 5kg zsák)
export const ARCOCEM_FAST_COLORS = [
  { key: 'ACIER',     name: 'Acier (acélszürke)',     sku: 'TT11462-1', hex: '#7c7b79', price: 7024 },
  { key: 'ANTRACITA', name: 'Antracita (sötétszürke)', sku: 'TT11470-1', hex: '#575352', price: 11217 },
  { key: 'ARDOIS',    name: 'Ardois (palaszürke)',    sku: 'TT11471-1', hex: '#656462', price: 10110 },
  { key: 'ARGILE',    name: 'Argile (agyag barna)',   sku: 'TT11467-1', hex: '#9f8879', price: 7339 },
  { key: 'HARVEST',   name: 'Harvest (sárgásbarna)',  sku: 'TT11464-1', hex: '#a08e79', price: 12567 },
  { key: 'JASPE',     name: 'Jaspe (vörösbarna)',     sku: 'TT11465-1', hex: '#985747', price: 14146 },
  { key: 'MORA',      name: 'Mora (lilás-bordós)',    sku: 'TT11463-1', hex: '#8c7b6f', price: 8366 },
  { key: 'NOGAL',     name: 'Nogal (dióbarna)',       sku: 'TT11461-1', hex: '#7a584e', price: 15890 },
  { key: 'NOIR',      name: 'Noir (fekete)',          sku: 'TT11469-1', hex: '#2f2e2c', price: 14461 },
  { key: 'OLIVA',     name: 'Oliva (olívazöld)',      sku: 'TT11468-1', hex: '#9b876c', price: 11618 },
  { key: 'PEWTER',    name: 'Pewter (ónszürke)',      sku: 'TT11460-1', hex: '#989795', price: 6315 },
  { key: 'REDWOOD',   name: 'Redwood (vörösfenyő)',   sku: 'TT11466-1', hex: '#956758', price: 10039 },
] as const;

export type ArcocemFastColorKey = typeof ARCOCEM_FAST_COLORS[number]['key'];

export const ARCOCEM_FAST_KG_PER_BAG = 5;
export const ARCOCEM_FAST_KG_PER_M3 = 10; // 10 kg pigment / 1 m3 beton

// Desmocem Powder (csak 3 szín a bélyegzett beton kalkulátorhoz)
export const DESMOCEM_POWDER_COLORS = [
  { key: 'ANTRACITA', name: 'Antracita (sötétszürke)', sku: 'TT11303', price: 23835, image: '/desmocem-powder/antracita.webp' },
  { key: 'NOGAL',     name: 'Nogal (dióbarna)',        sku: 'TT11309', price: 30323, image: '/desmocem-powder/nogal.webp' },
  { key: 'NOIR',      name: 'Noir (fekete)',           sku: 'TT11302', price: 30323, image: '/desmocem-powder/noir.webp' },
] as const;

export type DesmocemPowderColorKey = typeof DESMOCEM_POWDER_COLORS[number]['key'];

export const DESMOCEM_POWDER_M2_PER_BUCKET = 80;
export const DESMOCEM_POWDER_KG_PER_BUCKET = 10;

// Desmocem Liquid (folyékony leválasztó)
export const DESMOCEM_LIQUID_PRODUCTS = {
  small: { name: 'Desmocem Liquid 5L',  sku: 'TT11300', price: 23760, liters: 5 },
  large: { name: 'Desmocem Liquid 18L', sku: 'TT11301', price: 70276, liters: 18 },
} as const;
export const DESMOCEM_LIQUID_M2_PER_5L = 50; // 5L = 50 m2 (10 m2/liter, konzisztens az Overlay-jel)

// Masters Relief Enhancer (8 szín, 150ml, 30 m2/doboz)
export const RELIEF_COLORS = [
  { key: 'BLACK',      name: 'Black (fekete)',             sku: 'MREHAU-BLACK',     hex: '#2c2c2c' },
  { key: 'COFFEE',     name: 'Coffee (kávé)',              sku: 'MREHAU-COFFEE',    hex: '#6f4e37' },
  { key: 'CREAM',      name: 'Cream (krém)',               sku: 'MREHAU-CREAM',     hex: '#f5e6c8' },
  { key: 'LIGHT_GREY', name: 'Light Grey (világosszürke)', sku: 'MREHAU-LGREY',     hex: '#b0b0b0' },
  { key: 'MED_GREY',   name: 'Med. Grey (középszürke)',    sku: 'MREHAU-MGREY',     hex: '#808080' },
  { key: 'SANDSTONE',  name: 'Sandstone (homokkő)',        sku: 'MREHAU-SANDSTONE', hex: '#c2a882' },
  { key: 'SEPIA',      name: 'Sepia (szépia)',             sku: 'MREHAU-SEPIA',     hex: '#704214' },
  { key: 'SIENNA',     name: 'Sienna (szienna)',           sku: 'MREHAU-SIENNA',    hex: '#a0522d' },
] as const;

export type ReliefColorKey = typeof RELIEF_COLORS[number]['key'];

export const RELIEF_PRICE = 18717;
export const RELIEF_M2_PER_BOX = 30;
export const RELIEF_ML_PER_BOX = 150;

// Sealcem DSV M70 lakk
export const SEALCEM_M70_PRODUCTS = {
  normal:   { name: 'Sealcem DSV M70 18L (normál)',         sku: 'TT11001', price: 85654, liters: 18 },
  antislip: { name: 'Sealcem DSV M70 AD 18L (csúszásgátló)', sku: 'TT11015', price: 97260, liters: 18 },
} as const;
// Sealcem DSV M70: 1 réteg → 100 m²/18L lefedettség
// 2 réteg esetén 50 m², 3 réteg esetén ~33 m² (ezt a page.tsx számolja rétegszám × képlet alapján)
export const SEALCEM_M70_M2_PER_18L_SINGLE_LAYER = 100;

// Fibra Vidrio Top 12mm (poliszál)
export const POLISZAL = {
  name: 'Fibra Vidrio Top 12mm',
  sku: 'TT11805',
  price: 5720,
  kgPerPack: 1,
} as const;
export const POLISZAL_KG_PER_M3: Record<number, number> = {
  10: 2, // 10 cm betonnál 2 kg/m3
  15: 3, // 15 cm betonnál 3 kg/m3
};
