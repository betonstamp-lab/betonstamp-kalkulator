// Egyszeri karbantartó-script: a public/images/betonstamp-logo.png fájlt
// base64-be konvertálja, és beleírja egy TS modulba
// (lib/shared/images/betonstampLogoBase64.ts). A jsPDF-be az addImage-en át
// megy be dataURL-ként; így a PDF-generálás nem függ HTTP-kéréstől.
//
// A PNG méretét (szélesség × magasság) a header (IHDR chunk) 16-24. bájtjából
// olvassuk ki, hogy a jsPDF-ben a képarány megőrizhető legyen.
//
// Használat: node scripts/embed-logo.cjs

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'public', 'images', 'betonstamp-logo.png');
const OUT_DIR = path.join(__dirname, '..', 'lib', 'shared', 'images');
const OUT_FILE = path.join(OUT_DIR, 'betonstampLogoBase64.ts');

const buf = fs.readFileSync(SRC);
// PNG signature check (első 8 bájt): 89 50 4E 47 0D 0A 1A 0A
const sig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
for (let i = 0; i < 8; i++) {
  if (buf[i] !== sig[i]) throw new Error('Nem PNG fajl: ' + SRC);
}
// IHDR chunk 8..24 bájt között. Szélesség = 16..19, magasság = 20..23 (BE).
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);

const base64 = buf.toString('base64');
const dataUrl = `data:image/png;base64,${base64}`;

fs.mkdirSync(OUT_DIR, { recursive: true });
const out =
`// AUTO-GENERATED — ne szerkeszd kézzel. Regeneráláshoz: node scripts/embed-logo.cjs
// Forrás: public/images/betonstamp-logo.png (${buf.length} bytes)
// Kép méretei (PNG IHDR-ből): ${width} × ${height} px
// A PDF export (lib/shared/pdfExport.ts) dinamikusan importálja.

export const BETONSTAMP_LOGO_DATAURL = ${JSON.stringify(dataUrl)};
export const BETONSTAMP_LOGO_WIDTH = ${width};
export const BETONSTAMP_LOGO_HEIGHT = ${height};
`;

fs.writeFileSync(OUT_FILE, out, { encoding: 'utf8' });
console.log(`Generated ${OUT_FILE}  (${(base64.length / 1024).toFixed(0)} KB base64, ${width}x${height} px)`);
