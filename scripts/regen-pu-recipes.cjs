/* Karbantartó generátor: a data/efectto_pu_recipes.json-ből regenerálja az
   EFECTTO_PU_RECIPES TS literálját scripts/_pu_recipes_out.txt-be.
   Használat: node scripts/regen-pu-recipes.cjs
   A meglévő EFECTTO_PU_COLORS sorrendet és a TS pigment-kulcs konvenciót használja. */
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'efectto_pu_recipes.json'), 'utf8'));

const PIGMENT_KEY_MAP = {
  'Amarillo': 'amarillo',
  'Negro': 'negro',
  'Rojo Naranja': 'rojoNaranja',
  'Rojo Intenso': 'rojoIntenso',
  'Blanco': 'blanco',
  'Azul': 'azul',
  'Verde': 'verde',
  'Negro Humo': 'negroHumo',
  'Amarillo Vainilla': 'amarilloVainilla',
  'Amarillo Limon': 'amarilloLimon',
};
const PIGMENT_KEY_ORDER = ['amarillo','negro','rojoNaranja','rojoIntenso','blanco','azul','verde','negroHumo','amarilloVainilla','amarilloLimon'];

const COLORS_ORDER = [
  'BLANCO','BLANCO ROTO','BONE','SHALE GREY','SPIKE','LIQUEN','MOJAVE','PORCELAIN',
  'UNIVERSE','MOSS','BREEZE','INDIA','BLUSH','CORAL','PAPYRUS','CHAMPAGNE',
  'WASABI','KHAKI','SALMON','CAFÉ','SÁHARA','JADE','CEMENTO','GINGER',
  'RAFFIA','CAIRO','CLAY','MARRÓN','COBRE','SAND','CALABAZA','PINK',
  'EUCALYPTUS','HIMALAYA','PEARL GREY','PIZARRA','PURE BLACK','MOON','ACERO','AZUL PROFUNDO',
  'ADRA','SAMOS','PLOMO','KALAHARI','DESERT TAN','COTTON','NÉBULA','PERLA',
];

// Sanity check: minden grain összes színének léteznie kell a JSON-ben.
for (const grain of ['small','medium','big']) {
  for (const color of COLORS_ORDER) {
    if (!data[grain] || !data[grain][color]) {
      throw new Error(`Hianyzo szin: ${grain}/${color}`);
    }
  }
}
// JSON-ben esetleg ismeretlen pigment kulcsok kiszurese
for (const grain of ['small','medium','big']) {
  for (const color of Object.keys(data[grain])) {
    for (const k of Object.keys(data[grain][color])) {
      if (!(k in PIGMENT_KEY_MAP)) {
        throw new Error(`Ismeretlen pigment kulcs: ${grain}/${color}/${k}`);
      }
    }
  }
}

let out = '';
out += 'export const EFECTTO_PU_RECIPES: Record<EFECTTO_PUGrainSize, Record<EFECTTO_PUColorName, EfecttoPigmentRecipe>> = {\n';
for (const grain of ['small','medium','big']) {
  out += `  ${grain}: {\n`;
  for (const color of COLORS_ORDER) {
    const recipe = data[grain][color];
    const mapped = {};
    for (const [k, v] of Object.entries(recipe)) {
      mapped[PIGMENT_KEY_MAP[k]] = v;
    }
    const entries = PIGMENT_KEY_ORDER
      .filter(k => mapped[k] !== undefined)
      .map(k => `${k}: ${mapped[k]}`)
      .join(', ');
    out += `    '${color}': { ${entries} },\n`;
  }
  out += '  },\n';
}
out += '};\n';

fs.writeFileSync(path.join(__dirname, '_pu_recipes_out.txt'), out, { encoding: 'utf8' });
