// Egyszeri karbantartó-script: a PDF-hez használt PNG logókat base64-be
// konvertálja, és külön TS modulokba írja őket (lib/shared/images/*.ts).
// A jsPDF-be az addImage-en megy be dataURL-ként; a PDF-generálás nem függ
// HTTP-kéréstől.
//
// A PNG méretét (szélesség × magasság) a header (IHDR chunk) 16-24. bájtjából
// olvassuk ki, hogy a jsPDF-ben a képarány megőrizhető legyen.
//
// Használat: node scripts/embed-logo.cjs

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'lib', 'shared', 'images');
fs.mkdirSync(OUT_DIR, { recursive: true });

const LOGOS = [
  {
    src: 'betonstamp-logo.png',
    outFile: 'betonstampLogoBase64.ts',
    exportPrefix: 'BETONSTAMP',
  },
  {
    src: 'topciment-logo.png',
    outFile: 'topcimentLogoBase64.ts',
    exportPrefix: 'TOPCIMENT',
  },
  {
    src: 'estecha_logo_hungary.png',
    outFile: 'estechaLogoBase64.ts',
    exportPrefix: 'ESTECHA',
  },
];

// PNG signature — 89 50 4E 47 0D 0A 1A 0A
const PNG_SIG = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

for (const logo of LOGOS) {
  const srcPath = path.join(__dirname, '..', 'public', 'images', logo.src);
  const buf = fs.readFileSync(srcPath);
  for (let i = 0; i < 8; i++) {
    if (buf[i] !== PNG_SIG[i]) throw new Error('Nem PNG fajl: ' + srcPath);
  }
  // IHDR chunk 8..24. bájt között; szélesség = 16..19, magasság = 20..23 (BE).
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const base64 = buf.toString('base64');
  const dataUrl = `data:image/png;base64,${base64}`;

  const outPath = path.join(OUT_DIR, logo.outFile);
  const out =
`// AUTO-GENERATED — ne szerkeszd kézzel. Regeneráláshoz: node scripts/embed-logo.cjs
// Forrás: public/images/${logo.src} (${buf.length} bytes)
// Kép méretei (PNG IHDR-ből): ${width} × ${height} px
// A PDF export (lib/shared/pdfExport.ts) dinamikusan importálja.

export const ${logo.exportPrefix}_LOGO_DATAURL = ${JSON.stringify(dataUrl)};
export const ${logo.exportPrefix}_LOGO_WIDTH = ${width};
export const ${logo.exportPrefix}_LOGO_HEIGHT = ${height};
`;
  fs.writeFileSync(outPath, out, { encoding: 'utf8' });
  console.log(`Generated ${logo.outFile}  (${(base64.length / 1024).toFixed(0)} KB base64, ${width}x${height} px)`);
}
