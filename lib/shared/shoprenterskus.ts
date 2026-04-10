// Shoprenter SKU mapping a kalkulátor termékeihez
// Ha egy terméknek nincs SKU-ja (üres string), az nem kerül be a kosárba
// Új termékek felvételekor csak ide kell beírni az SKU-t

export const SHOPRENTER_SKUS: Record<string, string> = {
  // === ALAPOZÓK ===
  'Primacem ABS_1L': 'TT03021-1',
  'Primacem ABS_5L': 'TT03004',
  'Primacem Plusz_1L': 'TT03022-1',
  'Primacem Plusz_5L': 'TT03005',
  'Primapox 100 Barrier_5kg': 'TT03011',   // A komp. 3.1kg (B komp. automatikusan hozzáadódik)
  'Primapox 100 Barrier_20kg': 'TT03013',  // A komp. 12.4kg (B komp. automatikusan hozzáadódik)
  'Primacem Grip_5kg': 'TT03003',

  // === HÁLÓ ===
  'Háló 50gr_1m2': 'TT06001-1M',
  'Háló 50gr_50m2': 'TT06001',

  // === NATTURE MIKROCEMENTEK ===
  'Natture XL_20kg': 'TT01603',
  'Natture L_20kg': 'TT01602',
  'Natture M_18kg': 'TT01605',
  'Natture S_15kg': 'TT01600',

  // === ACRICEM GYANTA ===
  'Acricem gyanta_5L': 'TT01009',
  'Acricem gyanta_25L': 'TT01010',

  // === PRESEALER ===
  'PreSealer_1L': 'TT02029-1',
  'PreSealer_5L': 'TT02020',

  // === LAKKOK - ONE COAT ===
  // 1.2L = csomag (A 1L + B 0.2L együtt), NEM kell külön B komponens
  'ONE Coat (matt)_1.2L': 'TT02049-1',
  'ONE Coat (selyemfény)_1.2L': 'TT02046-1',
  'ONE Coat (fényes)_1.2L': 'TT02044-1',
  // 6L = A komp. 5L, B komp. külön (automatikusan hozzáadódik)
  'ONE Coat (matt)_6L': 'TT02032',
  'ONE Coat (selyemfény)_6L': 'TT02031',
  'ONE Coat (fényes)_6L': 'TT02030',

  // === LAKKOK - DRAGON ===
  // 4L = A komp. 3L, B komp. külön (automatikusan hozzáadódik)
  'Dragon (matt)_4L': 'TT02102',
  'Dragon (selyemfény)_4L': 'TT02101',
  'Dragon (fényes)_4L': 'TT02100',

  // === LAKKOK - TOP 100 (egykomponensű, nem kell B komp.) ===
  'TOP 100 (matt)_1L': 'TT02130',
  'TOP 100 (matt)_5L': 'TT02140',
  'TOP 100 (fényes)_1L': 'TT02147',
  'TOP 100 (fényes)_5L': 'TT02148',

  // === LAKKOK - TOP PRO+ ===
  // A komp. (B komp. automatikusan hozzáadódik)
  'TOP PRO+ (lassú kötésű)_1.44L': 'TT02143',
  'TOP PRO+ (gyors kötésű)_1.44L': 'TT02141',

  // === EFECTTO QUARTZ ===
  'Super grain_6kg': 'TT01214',
  'Super grain_17kg': 'TT01213',
  'Medium grain_6kg': 'TT01216',
  'Medium grain_17kg': 'TT01215',
  'Big grain_6kg': 'TT01210',
  'Big grain_17kg': 'TT01209',
  'Small grain_6kg': 'TT01212',
  'Small grain_17kg': 'TT01211',

  // === EFECTTO PU (A komponens) ===
  'Efectto PU Big grain_10.875kg': 'TT01224',
  'Efectto PU Big grain_2kg': 'TT01634',
  'Efectto PU Medium grain_10.875kg': 'TT01225',
  'Efectto PU Medium grain_2kg': 'TT01635',
  'Efectto PU Small grain_10.875kg': 'TT01226',
  'Efectto PU Small grain_2kg': 'TT01636',

  // === EFECTTO PU (B komponens) ===
  'B komp. Efectto PU_0.21kg': 'TT01639',
  'B komp. Efectto PU_0.875kg': 'TT01227',
  'B komp. Efectto PU_1.05kg': 'TT01638',

  // === POOL ===
  'Arcicem Pool_25L': 'TT01016',
  'Arcicem Pool_5L': 'TT01035',
  'Aquaciment XXL_18kg': 'TT01050',
  'Aquaciment XL_18kg': 'TT01051',
  'Topsealer WT Pool_5L': 'TT02070',

  // === PIGMENTEK - ARCOCEM BASIC ===
  // 1L kiszerelés
  'Arcocem Basic Amarillo_1L': 'TT04003',
  'Arcocem Basic Amarillo Vainilla_1L': 'TT04608',
  'Arcocem Basic Azul_1L': 'TT04006',
  'Arcocem Basic Blanco_1L': 'TT04002',
  'Arcocem Basic Negro_1L': 'TT04001',
  'Arcocem Basic Negro Humo_1L': 'TT04612',
  'Arcocem Basic Rojo Intenso_1L': 'TT04611',
  'Arcocem Basic Rojo Naranja_1L': 'TT04005',
  'Arcocem Basic Verde_1L': 'TT04004',
  // 0.5L kiszerelés
  'Arcocem Basic Amarillo_0.5L': 'TT04503',
  'Arcocem Basic Azul_0.5L': 'TT04506',
  'Arcocem Basic Blanco_0.5L': 'TT04502',
  'Arcocem Basic Negro_0.5L': 'TT04501',
  'Arcocem Basic Rojo Naranja_0.5L': 'TT04505',
  'Arcocem Basic Verde_0.5L': 'TT04504',

  // === B KOMPONENSEK (külön SKU-k, a COMPANION_PRODUCTS használja) ===
  'B komp. One Coat/Dragon_1L': 'TT02016',
  'B komp. TOP PRO+ FAST_0.64kg': 'TT02142',
  'B komp. TOP PRO+ SLOW_0.64kg': 'TT02144',
  'B komp. Primapox Barrier_1.9kg': 'TT03025',
  'B komp. Primapox Barrier_7.6kg': 'TT03014',
};

// Kétkomponensű termékek: A komponenshez tartozó B komponens
// Kulcs = A komp. SKU kulcsa, érték = B komp. SKU kulcsa (azonos mennyiséggel kerül a kosárba)
export const COMPANION_PRODUCTS: Record<string, string> = {
  // ONE Coat 6L = A 5L + B 1L
  'ONE Coat (matt)_6L': 'B komp. One Coat/Dragon_1L',
  'ONE Coat (selyemfény)_6L': 'B komp. One Coat/Dragon_1L',
  'ONE Coat (fényes)_6L': 'B komp. One Coat/Dragon_1L',

  // Dragon 4L = A 3L + B 1L
  'Dragon (matt)_4L': 'B komp. One Coat/Dragon_1L',
  'Dragon (selyemfény)_4L': 'B komp. One Coat/Dragon_1L',
  'Dragon (fényes)_4L': 'B komp. One Coat/Dragon_1L',

  // TOP PRO+ = A + B
  'TOP PRO+ (gyors kötésű)_1.44L': 'B komp. TOP PRO+ FAST_0.64kg',
  'TOP PRO+ (lassú kötésű)_1.44L': 'B komp. TOP PRO+ SLOW_0.64kg',

  // Primapox Barrier = A + B
  'Primapox 100 Barrier_5kg': 'B komp. Primapox Barrier_1.9kg',
  'Primapox 100 Barrier_20kg': 'B komp. Primapox Barrier_7.6kg',

  // ONE Coat 1.2L = csomag (A+B együtt), NEM kell companion
  // TOP 100 = egykomponensű, NEM kell companion
};

// Segédfüggvény: SKU keresés terméknév és kiszerelés alapján
export function getSku(productName: string, size: string): string {
  const key = `${productName}_${size}`;
  return SHOPRENTER_SKUS[key] || '';
}

// Segédfüggvény: van-e SKU a termékhez
export function hasSku(productName: string, size: string): boolean {
  return getSku(productName, size) !== '';
}
