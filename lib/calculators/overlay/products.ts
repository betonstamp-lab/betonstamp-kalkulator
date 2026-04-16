export const OVERLAY_COLORS = [
  { key: 'BLANCO', name: 'Blanco (fehér)', sku: 'TT12000', hex: '#efede8' },
  { key: 'PEWTER', name: 'Pewter (ónszürke)', sku: 'TT12001', hex: '#9a9a9a' },
  { key: 'NOIR', name: 'Noir (fekete)', sku: 'TT12002', hex: '#2b2b29' },
  { key: 'PIZARRA', name: 'Pizarra (középszürke)', sku: 'TT12003', hex: '#6f6964' },
  { key: 'CEMENTO', name: 'Cemento (cementszürke)', sku: 'TT12004', hex: '#c6c0ad' },
  { key: 'ANTRACITA', name: 'Antracita (sötétszürke)', sku: 'TT12005', hex: '#4a4a4a' },
  { key: 'ZINC', name: 'Zinc (cinkszürke)', sku: 'TT12006', hex: '#808080' },
  { key: 'ACIER', name: 'Acier (acélszürke)', sku: 'TT12007', hex: '#8d8077' },
  { key: 'NOGAL', name: 'Nogal (dióbarna)', sku: 'TT12009', hex: '#8f7460' },
  { key: 'TABAC', name: 'Tabac (dohánybarna)', sku: 'TT12010', hex: '#a07a5a' },
  { key: 'OLIVA', name: 'Oliva (olívazöld)', sku: 'TT12011', hex: '#808060' },
  { key: 'TOSTADO', name: 'Tostado (sárgásbarna)', sku: 'TT12012', hex: '#c99866' },
  { key: 'JAUNE', name: 'Jaune (sárga)', sku: 'TT12013', hex: '#e8c570' },
  { key: 'CREMA', name: 'Crema (krém)', sku: 'TT12014', hex: '#e7d0ae' },
  { key: 'PIERRE', name: 'Pierre (drapp)', sku: 'TT12015', hex: '#c2b3a1' },
  { key: 'TON_PIERRE', name: 'Ton Pierre (világos bézs)', sku: 'TT12016', hex: '#ddceb6' },
] as const;

export type OverlayColorKey = typeof OVERLAY_COLORS[number]['key'];

// Ár minden Overlay színnél azonos
export const OVERLAY_PRICE_PER_BAG = 21252;
export const OVERLAY_KG_PER_BAG = 25;
// Excel szerint: 1 db 25 kg-os Overlay zsák fedi 1.25 m²-t
// Következmény: 1 m² → 20 kg Overlay (= 0.8 zsák)
export const OVERLAY_M2_PER_BAG = 1.25;

export const OVERLAY_SUPPORTING_PRODUCTS = {
  primacem_plus: {
    name: 'Primacem Plus 5L',
    sku: 'TT03005',
    price: 22079,
    liters: 5,
    m2PerUnit: 50,
  },
  leszvalaszto_folyekony: {
    name: 'Desmocem Liquid 5L',
    sku: 'TT11300',
    price: 23760,
    liters: 5,
    m2PerUnit: 50,
  },
  lakk_normal: {
    name: 'Sealcem DSV M70 18L',
    sku: 'TT11001',
    price: 85654,
    liters: 18,
    m2PerUnit: 50,
  },
  lakk_ad: {
    name: 'Sealcem DSV M70 bidón AD 18L (csúszásgátló)',
    sku: 'TT11015',
    price: 97260,
    liters: 18,
    m2PerUnit: 50,
  },
} as const;

export type OverlaySupportingProductKey = keyof typeof OVERLAY_SUPPORTING_PRODUCTS;

export const DESMOCEM_POWDER_COLORS = [
  { key: 'ANTRACITA', name: 'Antracita (sötétszürke)', sku: 'TT11303', hex: '#3d3d3d', price: 23835 },
  { key: 'BLANCO', name: 'Blanco (fehér)', sku: 'TT11306', hex: '#f0ede6', price: 23835 },
  { key: 'CREMA', name: 'Crema (krém)', sku: 'TT11307', hex: '#e7d5b0', price: 23835 },
  { key: 'GRIS', name: 'Gris (szürke)', sku: 'TT11304', hex: '#808080', price: 23835 },
  { key: 'GRIS_CLARO', name: 'Gris Claro (világosszürke)', sku: 'TT11305', hex: '#b8b8b8', price: 23835 },
  { key: 'PIERRE', name: 'Pierre (bézses homokkő)', sku: 'TT11313', hex: '#c2b3a1', price: 23835 },
  { key: 'ROJO', name: 'Rojo (vörös)', sku: 'TT11308', hex: '#a03020', price: 23835 },
  { key: 'MARRON_CLARO', name: 'Marron Claro (világosbarna)', sku: 'TT11312', hex: '#a0825a', price: 30323 },
  { key: 'NOGAL', name: 'Nogal (dióbarna)', sku: 'TT11309', hex: '#5c3a1e', price: 30323 },
  { key: 'NOIR', name: 'Noir (fekete)', sku: 'TT11302', hex: '#1a1a1a', price: 30323 },
  { key: 'TOSTADO', name: 'Tostado (sárgásbarna)', sku: 'TT11311', hex: '#c49a5c', price: 30323 },
] as const;

export type DesmocemPowderColorKey = typeof DESMOCEM_POWDER_COLORS[number]['key'];

// Minden Desmocem Powder színnél azonos
export const DESMOCEM_POWDER_KG = 10;
export const DESMOCEM_POWDER_M2_PER_UNIT = 70;

export const RELIEF_COLORS = [
  { key: 'BLACK', name: 'Black (fekete)', sku: 'MREHAU-BLACK', hex: '#2c2c2c' },
  { key: 'COFFEE', name: 'Coffee (kávé)', sku: 'MREHAU-COFFEE', hex: '#6f4e37' },
  { key: 'CREAM', name: 'Cream (krém)', sku: 'MREHAU-CREAM', hex: '#f5e6c8' },
  { key: 'LIGHT_GREY', name: 'Light Grey (világosszürke)', sku: 'MREHAU-LGREY', hex: '#b0b0b0' },
  { key: 'MED_GREY', name: 'Med. Grey (középszürke)', sku: 'MREHAU-MGREY', hex: '#808080' },
  { key: 'SANDSTONE', name: 'Sandstone (homokkő)', sku: 'MREHAU-SANDSTONE', hex: '#c2a882' },
  { key: 'SEPIA', name: 'Sepia (szépia)', sku: 'MREHAU-SEPIA', hex: '#704214' },
  { key: 'SIENNA', name: 'Sienna (szienna)', sku: 'MREHAU-SIENNA', hex: '#a0522d' },
] as const;

export type ReliefColorKey = typeof RELIEF_COLORS[number]['key'];

// Minden Relief színnél azonos
export const RELIEF_PRICE = 18717;
export const RELIEF_ML = 150;
export const RELIEF_M2_PER_UNIT = 30;
