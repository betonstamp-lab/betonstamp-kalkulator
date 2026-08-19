// Közös logó-blokk: BetonStamp + Topciment Hungary logók egymás mellett.
// A "két logó" mintát tükrözi (Calculator.tsx fejléc + login/register oldal).
// Reszponzív: mobilon kisebb (h-16 / h-20), tabletet fölfelé nagyobb (h-20 / h-28).
// Egy helyen tartva, hogy a jövőben egységesen módosítható legyen.

interface Props {
  /** Alsó szegély vonalat rajzol-e (kalkulátor fejlécben igen; login-oldalon nem). */
  bordered?: boolean;
  /** Extra Tailwind class-ok a wrapperre (pl. margók). */
  className?: string;
}

export default function HeaderLogos({ bordered = false, className = '' }: Props) {
  const base = 'flex justify-center items-center gap-6 sm:gap-10';
  const border = bordered ? 'mb-1 pb-1 border-b border-gray-200 -mt-4 py-0' : '';
  return (
    <div className={`${base} ${border} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/betonstamp-logo.png"
        alt="BetonStamp"
        className="h-16 md:h-20 object-contain"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/topciment-logo.png"
        alt="Topciment Hungary"
        className="h-20 md:h-28 object-contain"
      />
    </div>
  );
}
