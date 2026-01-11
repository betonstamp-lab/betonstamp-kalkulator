import { ProductOption } from '@/types';

export function optimizeByM2(totalM2: number, options: ProductOption[]): ProductOption[] {
  const valid = options.filter(o => o.price > 0 && o.m2 && o.m2 > 0);
  if (!valid.length) return [];
  
  if (valid.length === 1) {
    const piecesNeeded = Math.ceil(totalM2 / valid[0].m2!);
    return [{ ...valid[0], qty: piecesNeeded }];
  }

  let best: ProductOption[] | null = null;
  let bestPrice = Infinity;

  const maxLarge = Math.ceil(totalM2 / Math.max(...valid.map(v => v.m2!))) + 3;

  for (let i = 0; i <= maxLarge; i++) {
    for (let j = 0; j <= maxLarge; j++) {
      const combo: ProductOption[] = [];
      let covered = 0;
      let price = 0;

      if (valid[0] && i > 0) {
        combo.push({ ...valid[0], qty: i });
        covered += valid[0].m2! * i;
        price += valid[0].price * i;
      }
      if (valid[1] && j > 0) {
        combo.push({ ...valid[1], qty: j });
        covered += valid[1].m2! * j;
        price += valid[1].price * j;
      }
      
      if (covered >= totalM2 && price < bestPrice) {
        bestPrice = price;
        best = combo;
      }
    }
  }

  return best || [];
}

export function optimizeByKg(totalKg: number, options: ProductOption[]): ProductOption[] {
  const valid = options.filter(o => o.price > 0 && o.kg);
  if (!valid.length) return [];

  if (valid.length === 1) {
    const piecesNeeded = Math.ceil(totalKg / valid[0].kg!);
    return [{ ...valid[0], qty: piecesNeeded }];
  }

  let best: { countLarge: number; countSmall: number } | null = null;
  let bestPrice = Infinity;

  const maxLarge = Math.ceil(totalKg / valid[1].kg!) + 3;

  for (let countLarge = 0; countLarge <= maxLarge; countLarge++) {
    const coveredByLarge = countLarge * valid[1].kg!;
    const remaining = totalKg - coveredByLarge;
    const countSmall = remaining > 0 ? Math.ceil(remaining / valid[0].kg!) : 0;

    const price = (countLarge * valid[1].price) + (countSmall * valid[0].price);

    if (price < bestPrice) {
      bestPrice = price;
      best = { countLarge, countSmall };
    }
  }

  const result: ProductOption[] = [];
  if (best && best.countLarge > 0) {
    result.push({ ...valid[1], qty: best.countLarge });
  }
  if (best && best.countSmall > 0) {
    result.push({ ...valid[0], qty: best.countSmall });
  }

  return result;
}

export function optimizeByLiters(totalLiters: number, options: ProductOption[]): ProductOption[] {
  const valid = options.filter(o => o.price > 0 && o.liters);
  if (!valid.length) return [];

  if (valid.length === 1) {
    const piecesNeeded = Math.ceil(totalLiters / valid[0].liters!);
    return [{ ...valid[0], qty: piecesNeeded }];
  }

  let best: { countLarge: number; countSmall: number } | null = null;
  let bestPrice = Infinity;

  const maxLarge = Math.ceil(totalLiters / valid[1].liters!) + 3;

  for (let countLarge = 0; countLarge <= maxLarge; countLarge++) {
    const coveredByLarge = countLarge * valid[1].liters!;
    const remaining = totalLiters - coveredByLarge;
    const countSmall = remaining > 0 ? Math.ceil(remaining / valid[0].liters!) : 0;

    const price = (countLarge * valid[1].price) + (countSmall * valid[0].price);

    if (price < bestPrice) {
      bestPrice = price;
      best = { countLarge, countSmall };
    }
  }

  const result: ProductOption[] = [];
  if (best && best.countLarge > 0) {
    result.push({ ...valid[1], qty: best.countLarge });
  }
  if (best && best.countSmall > 0) {
    result.push({ ...valid[0], qty: best.countSmall });
  }

  return result;
}