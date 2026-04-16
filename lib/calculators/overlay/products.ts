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
  leszvalaszto_por_noir: {
    name: 'Desmocem Powder Noir 10kg',
    sku: 'TT11303',
    price: 30323,
    kg: 10,
    m2PerUnit: 70,
  },
  leszvalaszto_por_antracita: {
    name: 'Desmocem Powder Antracita 10kg',
    sku: 'TT11302',
    price: 23835,
    kg: 10,
    m2PerUnit: 70,
  },
  leszvalaszto_folyekony: {
    name: 'Desmocem Liquid 5L',
    sku: 'TT11300',
    price: 23760,
    liters: 5,
    m2PerUnit: 50,
  },
  relief: {
    name: 'Masters Relief Enhancer 150mL',
    sku: 'MREHAU-SZULO',
    price: 18717,
    ml: 150,
    m2PerUnit: 30,
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
