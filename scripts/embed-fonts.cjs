/* Egyszer futtatandó karbantartó-script: a dejavu-fonts-ttf csomagból
   base64-be konvertálja a DejaVu Sans Condensed Regular + Bold TTF fájlokat,
   és beírja őket egy TS modulba: lib/shared/fonts/dejavuSans.ts
   A jsPDF ezt a base64-et olvassa be az addFileToVFS-en át.
   Használat: node scripts/embed-fonts.cjs
*/
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'node_modules', 'dejavu-fonts-ttf', 'ttf');
const OUT_DIR = path.join(__dirname, '..', 'lib', 'shared', 'fonts');
const OUT_FILE = path.join(OUT_DIR, 'dejavuSans.ts');

function toB64(name) {
  const p = path.join(SRC_DIR, name);
  const buf = fs.readFileSync(p);
  return buf.toString('base64');
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const regular = toB64('DejaVuSansCondensed.ttf');
const bold = toB64('DejaVuSansCondensed-Bold.ttf');

const out =
`// AUTO-GENERATED — ne szerkeszd kézzel. Regeneráláshoz: node scripts/embed-fonts.cjs
// Forrás: dejavu-fonts-ttf@2.37.3 (OFL-1.1) — DejaVu Sans Condensed Regular + Bold.
// A PDF export (lib/shared/pdfExport.ts) dinamikusan importálja, hogy a fő
// bundle-t ne terhelje meg; csak a "Kalkuláció letöltése" kattintás után tölt be.

export const DEJAVU_SANS_REGULAR_B64 = ${JSON.stringify(regular)};
export const DEJAVU_SANS_BOLD_B64 = ${JSON.stringify(bold)};
`;

fs.writeFileSync(OUT_FILE, out, { encoding: 'utf8' });
console.log(`Generated ${OUT_FILE}  (Regular ${regular.length} bytes b64, Bold ${bold.length} bytes b64)`);
