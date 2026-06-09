// lib/shared/packaging.ts
// -----------------------------------------------------------------------------
// Generikus csomag-optimalizáló — adott m²-igényhez a legolcsóbb csomag-kombót
// választja ki a megadott csomag-opciók közül.
//
// Eltér az utils.ts-ben lévő optimizeByM2-től: generikus T típuson dolgozik
// (megőrzi a bemenő pack referenciát), és tetszőleges számú csomagot támogat
// (1, 2, 3+), tehát olyan esetekre is használható, ahol több kiszerelés van
// (pl. 1L / 5L / 25L leválasztó vagy 0.25L / 1L / 5L impregnálás).
// -----------------------------------------------------------------------------

export interface Packageable {
  /** Lefedettség m²-ben EGY csomagra. */
  m2: number;
  /** Bruttó ár Ft-ban EGY csomagra. */
  price: number;
}

export interface OptimizedPack<T> {
  /** Az eredeti pack-objektum referenciája (név, sku, stb. megőrzött). */
  pack: T;
  /** Hány darab szükséges ebből a pack-ből az optimális kombóhoz. */
  qty: number;
}

/**
 * A megadott `area` m²-hez kiválasztja a legolcsóbb csomag-kombinációt a
 * `packs` listából. Brute-force kombinatorikus keresés — minden csomagból
 * 0..maxQty darab kombinációt próbál.
 *
 * Visszatérési érték: pack + qty pár-tömb, ahol a `pack` az eredeti objektum
 * referenciája (a tömbből). Csak a > 0 qty pack-ek szerepelnek a kimenetben.
 *
 * Ha nincs érvényes opció vagy area ≤ 0 → üres tömb.
 */
export function optimizePackages<T extends Packageable>(
  area: number,
  packs: T[],
): OptimizedPack<T>[] {
  if (area <= 0) return [];
  const valid = packs.filter(p => p.price > 0 && p.m2 > 0);
  if (valid.length === 0) return [];

  // Egyetlen csomag: triviális ceiling
  if (valid.length === 1) {
    const qty = Math.ceil(area / valid[0].m2);
    return qty > 0 ? [{ pack: valid[0], qty }] : [];
  }

  // Max darabszám csomagonként — biztonsággal a legkisebb csomag határa alapján
  const smallestM2 = Math.min(...valid.map(p => p.m2));
  const maxQtyPerPack = Math.ceil(area / smallestM2) + 2;

  let bestQtys: number[] | null = null;
  let bestPrice = Infinity;

  // Rekurzív kombinatorikus bejárás — minden valid[i]-hez 0..maxQtyPerPack darab
  const tryCombination = (idx: number, currentQtys: number[], coveredSoFar: number, priceSoFar: number) => {
    if (idx === valid.length) {
      if (coveredSoFar >= area && priceSoFar < bestPrice) {
        bestPrice = priceSoFar;
        bestQtys = [...currentQtys];
      }
      return;
    }
    const pack = valid[idx];
    for (let q = 0; q <= maxQtyPerPack; q++) {
      const newCovered = coveredSoFar + q * pack.m2;
      const newPrice = priceSoFar + q * pack.price;
      // Korai vágás: ha már most drágább mint a legjobb, hagyjuk
      if (newPrice >= bestPrice) break;
      currentQtys.push(q);
      tryCombination(idx + 1, currentQtys, newCovered, newPrice);
      currentQtys.pop();
    }
  };

  tryCombination(0, [], 0, 0);

  if (!bestQtys) return [];

  // Vissza-mappolás: csak a > 0 qty pack-eket adjuk vissza, az EREDETI pack-referenciával
  const result: OptimizedPack<T>[] = [];
  (bestQtys as number[]).forEach((q, i) => {
    if (q > 0) result.push({ pack: valid[i], qty: q });
  });
  return result;
}
