// components/ColorSwatch.tsx
// -----------------------------------------------------------------------------
// Reusable szín-swatch komponens. Egy kis lekerekített négyzet, ami a tényleges
// színt mutatja (hex) vagy gradienst (pl. fémes színekhez). Bármely kalkulátor
// szín-választó UI-jához használható (vakolat, mikrocement-pigment, overlay, stb.).
//
// Példák:
//   <ColorSwatch hex="#D8C4A0" />              // egyszerű hex
//   <ColorSwatch hex="#F3F6FB" />              // világos színhez automatikusan
//                                              // erősebb szegély
//   <ColorSwatch gradient="linear-gradient(135deg, #BD8D4B, #FCF7B2, #BF8F30)" />
//   <ColorSwatch hex="#90B186" size={24} title="Musgo (moha)" />
// -----------------------------------------------------------------------------

interface ColorSwatchProps {
  /** Egyszerű szín #RRGGBB formátumban. Ha gradient is meg van adva, az nyer. */
  hex?: string;
  /** CSS background-image érték (pl. 'linear-gradient(135deg, #A, #B, #C)') fémes színekhez. */
  gradient?: string;
  /** Méret pixelben (alapból 20). */
  size?: number;
  /** Tooltip / a11y title. */
  title?: string;
}

/** Perceptuális luminance közelítés: ha > 230 a 0–255 skálán, a szín nagyon világos
 *  → erősebb szegély kell hogy látható maradjon (pl. Blanco #F3F6FB, fehér Mixol). */
function isVeryLight(hex: string): boolean {
  const h = hex.replace('#', '').trim();
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
  // ITU-R BT.601 közelítés
  return 0.299 * r + 0.587 * g + 0.114 * b > 230;
}

export default function ColorSwatch({ hex, gradient, size = 20, title }: ColorSwatchProps) {
  const style: React.CSSProperties = { width: size, height: size };
  if (gradient) {
    style.backgroundImage = gradient;
  } else if (hex) {
    style.backgroundColor = hex;
  }
  // Gradient esetén default szegély; hex esetén nagyon-világosnál erősebb keret.
  const borderClass = gradient
    ? 'border-gray-300'
    : (hex && isVeryLight(hex) ? 'border-gray-400' : 'border-gray-300');

  return (
    <span
      className={`inline-block rounded-md border ${borderClass} shrink-0`}
      style={style}
      title={title}
      aria-label={title}
      role={title ? 'img' : undefined}
      aria-hidden={!title}
    />
  );
}
