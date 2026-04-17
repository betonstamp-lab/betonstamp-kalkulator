import { NATTURE_COLOR_HEX } from '@/lib/calculators/mikrocement/pigments';

const normalize = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

const NATTURE_HEX_BY_NORMALIZED_NAME: Map<string, string> = new Map(
  Object.entries(NATTURE_COLOR_HEX).map(([name, hex]) => [normalize(name), hex])
);

export const getEfecttoColorHex = (name: string): string | undefined =>
  NATTURE_HEX_BY_NORMALIZED_NAME.get(normalize(name));

export const sortEfecttoColors = <T extends string>(colors: readonly T[]): T[] =>
  [...colors].sort((a, b) => normalize(a).localeCompare(normalize(b), 'en'));
