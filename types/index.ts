export interface SurfaceCalculation {
  surfaceId: number;
  area: number;
  system: MikrocementSystem;
  layers: string[];
  materials: {
    category: string;
    items: {
      name: string;
      amount: number;
      unit: string;
    }[];
  }[];
}
export interface AggregatedMaterial {
  name: string;
  category: string;
  totalAmount: number;
  unit: string;
  packages: ProductOption[];
  totalPrice: number;
}
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
  info?: string;
  options: ProductOption[];
}
export interface MikrocementProduct {
  name: string;
  kgPerM2: number;
  literPerKg?: number;
  info?: string;
  options?: ProductOption[];
}
export interface LakkProduct {
  name: string;
  info?: string;
  needPresealer?: boolean;
  options: ProductOption[];
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
  surfaceType?: 'padlo' | 'fal';
  quartzPadloVastagabb?: 'super' | 'medium';
  quartzPadloVekonyabb?: 'super' | 'medium';
  quartzFalVastagabb?: 'big' | 'small';
  quartzFalVekonyabb?: 'big' | 'small';
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
  surfaceResults?: any[];
}
export interface SystemProducts {
  name?: string;
  alapozok: Record<string, AlapozoProduct>;
  halo?: ProductOption[];
  mikrocementek?: Record<string, MikrocementProduct>;
  mikroOptions?: Record<string, ProductOption[]>;
  gyanta?: ProductOption[];
  presealer?: ProductOption[];
  padlo?: {
    super: MikrocementProduct & { options: ProductOption[] };
    medium: MikrocementProduct & { options: ProductOption[] };
  };
  fal?: {
    big: MikrocementProduct & { options: ProductOption[] };
    small: MikrocementProduct & { options: ProductOption[] };
  };
  bkomponens?: {
    xxl: {
      literPerKg: number;
      options: ProductOption[];
    };
    xl: {
      literPerKg: number;
      options: ProductOption[];
    };
  };
  lakkok: Record<string, LakkProduct>;
}