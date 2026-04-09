import { ProductOption } from '@/types';

export function optimizeByM2(totalM2: number, options: ProductOption[]): ProductOption[] {
  const valid = options.filter(o => o.price > 0 && o.m2 && o.m2 > 0);
  if (!valid.length) return [];
  
  // Rendezzük méret szerint csökkenő sorrendbe
  valid.sort((a, b) => (b.m2 || 0) - (a.m2 || 0));
  
  if (valid.length === 1) {
    const piecesNeeded = Math.ceil(totalM2 / valid[0].m2!);
    return [{ ...valid[0], qty: piecesNeeded }];
  }

  let best: ProductOption[] | null = null;
  let bestPrice = Infinity;

  // Maximum darabszám a legkisebb kiszerelésből
  const smallestM2 = Math.min(...valid.map(v => v.m2!));
  const maxSmall = Math.ceil(totalM2 / smallestM2) + 5;
  
  // Legnagyobb kiszerelés max darabszáma
  const largestM2 = Math.max(...valid.map(v => v.m2!));
  const maxLarge = Math.ceil(totalM2 / largestM2) + 3;

  // Próbáljuk ki az összes kombinációt
  for (let i = 0; i <= maxLarge; i++) {
    for (let j = 0; j <= maxSmall; j++) {
      let covered = 0;
      let price = 0;
      const combo: ProductOption[] = [];

      // Nagy kiszerelés (valid[0] - 50m²)
      if (valid[0] && i > 0) {
        covered += valid[0].m2! * i;
        price += valid[0].price * i;
        combo.push({ ...valid[0], qty: i });
      }
      
      // Kis kiszerelés (valid[1] - 1m²)
      if (valid[1] && j > 0) {
        covered += valid[1].m2! * j;
        price += valid[1].price * j;
        combo.push({ ...valid[1], qty: j });
      }
      
      // Ha lefedi a szükséges területet és olcsóbb mint az eddigi legjobb
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

  // Rendezzük méret szerint növekvő sorrendbe (kis, nagy)
  valid.sort((a, b) => (a.kg || 0) - (b.kg || 0));

  if (valid.length === 1) {
    const piecesNeeded = Math.ceil(totalKg / valid[0].kg!);
    return [{ ...valid[0], qty: piecesNeeded }];
  }

  let best: { countLarge: number; countSmall: number } | null = null;
  let bestPrice = Infinity;

  const maxLarge = Math.ceil(totalKg / valid[1].kg!) + 3;
  const maxSmall = Math.ceil(totalKg / valid[0].kg!) + 3;

  for (let countLarge = 0; countLarge <= maxLarge; countLarge++) {
    for (let countSmall = 0; countSmall <= maxSmall; countSmall++) {
      const covered = (countLarge * valid[1].kg!) + (countSmall * valid[0].kg!);
      
      if (covered >= totalKg) {
        const price = (countLarge * valid[1].price) + (countSmall * valid[0].price);
        
        if (price < bestPrice) {
          bestPrice = price;
          best = { countLarge, countSmall };
        }
      }
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
  const valid = options.filter(o => o.price > 0 && o.liters).sort((a, b) => (b.liters || 0) - (a.liters || 0));
  if (!valid.length) return [];
  
  if (valid.length === 1) {
    const piecesNeeded = Math.ceil(totalLiters / valid[0].liters!);
    return [{ ...valid[0], qty: piecesNeeded }];
  }

  // Ha 2 kiszerelés van
  if (valid.length === 2) {
    let best: { countLarge: number; countSmall: number } | null = null;
    let bestPrice = Infinity;
    const maxLarge = Math.ceil(totalLiters / valid[0].liters!) + 3;
    const maxSmall = Math.ceil(totalLiters / valid[1].liters!) + 5;
    
    for (let countLarge = 0; countLarge <= maxLarge; countLarge++) {
      for (let countSmall = 0; countSmall <= maxSmall; countSmall++) {
        const covered = (countLarge * valid[0].liters!) + (countSmall * valid[1].liters!);
        
        if (covered >= totalLiters) {
          const price = (countLarge * valid[0].price) + (countSmall * valid[1].price);
          
          if (price < bestPrice) {
            bestPrice = price;
            best = { countLarge, countSmall };
          }
        }
      }
    }
    
    const result: ProductOption[] = [];
    if (best && best.countLarge > 0) {
      result.push({ ...valid[0], qty: best.countLarge });
    }
    if (best && best.countSmall > 0) {
      result.push({ ...valid[1], qty: best.countSmall });
    }
    return result;
  }

  // 3+ kiszerelés: próbálj ki minden kombinációt
  let best: ProductOption[] | null = null;
  let bestPrice = Infinity;
  
  const maxCount = Math.ceil(totalLiters / Math.min(...valid.map(v => v.liters!))) + 2;
  
  for (let i = 0; i <= maxCount; i++) {
    for (let j = 0; j <= maxCount; j++) {
      for (let k = 0; k <= maxCount; k++) {
        let covered = 0;
        let price = 0;
        const combo: ProductOption[] = [];
        
        if (valid[0] && i > 0) {
          covered += valid[0].liters! * i;
          price += valid[0].price * i;
          combo.push({ ...valid[0], qty: i });
        }
        if (valid[1] && j > 0) {
          covered += valid[1].liters! * j;
          price += valid[1].price * j;
          combo.push({ ...valid[1], qty: j });
        }
        if (valid[2] && k > 0) {
          covered += valid[2].liters! * k;
          price += valid[2].price * k;
          combo.push({ ...valid[2], qty: k });
        }
        
        if (covered >= totalLiters && price < bestPrice) {
          bestPrice = price;
          best = combo;
        }
      }
    }
  }
  
  return best || [];
}