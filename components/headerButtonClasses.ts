// Közös fejléc-gomb class-készletek. Egy helyen tartva, hogy a 8 kalkulátor
// fejléce ne csússzon szét vizuálisan. Az összes elem h-10 magasságú, azonos
// border/rounded/text/padding stack-kel — a színek/keret eltérhetnek.

const BASE = 'inline-flex items-center justify-center h-10 px-4 text-sm font-medium border-2 rounded-lg transition-colors whitespace-nowrap';

/** Semleges (szürke) fejléc-gomb — pl. "← Vissza a főoldalra". */
export const HEADER_BUTTON_NEUTRAL = `${BASE} border-gray-300 text-gray-700 hover:text-gray-900 bg-white`;

/** Veszélyes (piros keret) fejléc-gomb — pl. "Kijelentkezés". */
export const HEADER_BUTTON_DANGER = `${BASE} border-red-500 text-gray-500 hover:text-red-500 bg-white`;
