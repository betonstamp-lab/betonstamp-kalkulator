// Közös logó-blokk: BetonStamp + Topciment Hungary logók egymás mellett.
// A "két logó" mintát tükrözi (Calculator.tsx fejléc + login/register oldal).
// Reszponzív: mobilon kisebb (h-16 / h-20), tabletet fölfelé nagyobb (h-20 / h-28).
// Egy helyen tartva, hogy a jövőben egységesen módosítható legyen.
//
// showEstecha: opcionális harmadik logó, csak a Vakolat kalkulátoron (ESTonetex
// termékcsalád). Mobilon szűkebb gap-pel is elfér mind a három.

interface Props {
  /** Alsó szegély vonalat rajzol-e (kalkulátor fejlécben igen; login-oldalon nem). */
  bordered?: boolean;
  /** Extra Tailwind class-ok a wrapperre (pl. margók). */
  className?: string;
  /** Topciment Hungary logó megjelenítése (default true).
   *  A Vakolat kalkulátoron false — ott csak BetonStamp + Estecha van. */
  showTopciment?: boolean;
  /** Ha true, harmadik logó: Estecha Hungary — CSAK a Vakolat kalkulátoron. */
  showEstecha?: boolean;
}

export default function HeaderLogos({
  bordered = false,
  className = '',
  showTopciment = true,
  showEstecha = false,
}: Props) {
  // A gap mobilon szűkebb, hogy több logó is elférjen.
  const logoCount = 1 + (showTopciment ? 1 : 0) + (showEstecha ? 1 : 0);
  const gap = logoCount >= 3 ? 'gap-3 sm:gap-6 md:gap-10' : 'gap-6 sm:gap-10';
  const base = `flex justify-center items-center flex-wrap ${gap}`;
  const border = bordered ? 'mb-1 pb-1 border-b border-gray-200 -mt-4 py-0' : '';
  return (
    <div className={`${base} ${border} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/betonstamp-logo.png"
        alt="BetonStamp"
        className="h-14 sm:h-16 md:h-20 object-contain"
      />
      {showTopciment && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/images/topciment-logo.png"
          alt="Topciment Hungary"
          className="h-16 sm:h-20 md:h-28 object-contain"
        />
      )}
      {showEstecha && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/images/estecha_logo_hungary.png"
          alt="Estecha Hungary"
          className="h-14 sm:h-16 md:h-20 object-contain"
        />
      )}
    </div>
  );
}
