// Mikrocement rendszerek típusai

export type MikrocementSystem = 'natture' | 'effectoQuartz' | 'effectoPU' | 'pool';

export interface ProductOption {
  kg?: number;
  liters?: number;
  m2?: number;
  price: number;
  qty?: number;
  name?: string;
}

export interface AlapozoProduct {
  name: string;
  options: ProductOption[];
  info: string;
}

export interface MikrocementProduct {
  name: string;
  kgPerM2: number;
  literPerKg?: number;
  info: string;
}

export interface LakkProduct {
  name: string;
  options: ProductOption[];
  needPresealer?: boolean;
  info: string;
}

export interface Surface {
  id: number;
  area: string;
  alapozo: string;
  lakk: string;
  layers: {
    xl: number;
    l: number;
    m: number;
    s: number;
  };
  puLayers: {
    big: number;
    medium: number;
    small: number;
  };
}

export interface CalculationResult {
  items: {
    cat: string;
    pkgs: ProductOption[];
    price: number;
  }[];
  total: number;
  layers: string[];
  surfaces: Surface[];
  totalM2: number;
}

export interface SystemProducts {
  name: string;
  alapozok: Record<string, AlapozoProduct>;
  lakkok: Record<string, LakkProduct>;
  mikrocementek?: Record<string, MikrocementProduct>;
  mikroOptions?: Record<string, ProductOption[]>;
  halo?: ProductOption[];
  gyanta?: ProductOption[];
  presealer?: ProductOption[];
  padlo?: any;
  fal?: any;
  bkomponens?: any;
}