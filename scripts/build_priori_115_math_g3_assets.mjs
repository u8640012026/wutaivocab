import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
const sharp = require('sharp');

const PDF_PATH = path.resolve('PRIORI/115篩選測驗/數學/115年篩選測驗數學科3年級試卷.pdf');
const OUT_DIR = path.resolve('public/assets/priori/115/math-g3');
const CONTACT_SHEET_PATH = path.resolve('tmp/priori_115_math_g3_contact_sheet.png');

const FIGURE_CROPS = [
  { name: 'q09_fig.webp', page: 0, left: 1379, top: 1911, width: 1015, height: 244 },
  { name: 'q11_fig.webp', page: 0, left: 1370, top: 3022, width: 570, height: 268 },
  { name: 'q13_fig.webp', page: 1, left: 164, top: 728, width: 937, height: 601 },
  { name: 'q15_fig.webp', page: 1, left: 207, top: 2138, width: 712, height: 170 },
  { name: 'q19_fig.webp', page: 1, left: 1380, top: 244, width: 780, height: 442 },
  { name: 'q25_fig.webp', page: 1, left: 1458, top: 2735, width: 964, height: 324 },
];

const QUESTION_CROPS = [
  // Page 1 Left
  { name: 'q01.webp', page: 0, left: 120, top: 1318, width: 1120, height: 150 },
  { name: 'q02.webp', page: 0, left: 120, top: 1488, width: 1120, height: 236 },
  { name: 'q03.webp', page: 0, left: 120, top: 1742, width: 1120, height: 406 },
  { name: 'q04.webp', page: 0, left: 120, top: 2165, width: 1120, height: 740 },
  { name: 'q05.webp', page: 0, left: 120, top: 2920, width: 1120, height: 155 },
  { name: 'q06.webp', page: 0, left: 120, top: 3095, width: 1120, height: 295 },
  // Page 1 Right
  { name: 'q07.webp', page: 0, left: 1280, top: 1235, width: 1130, height: 215 },
  { name: 'q08.webp', page: 0, left: 1280, top: 1460, width: 1130, height: 350 },
  { name: 'q09.webp', page: 0, left: 1280, top: 1825, width: 1130, height: 690 },
  { name: 'q10.webp', page: 0, left: 1280, top: 2528, width: 1130, height: 340 },
  { name: 'q11.webp', page: 0, left: 1280, top: 2870, width: 1130, height: 545 },
  // Page 2 Left
  { name: 'q12.webp', page: 1, left: 120, top: 115, width: 1120, height: 435 },
  { name: 'q13.webp', page: 1, left: 120, top: 565, width: 1120, height: 995 },
  { name: 'q14.webp', page: 1, left: 120, top: 1575, width: 1120, height: 390 },
  { name: 'q15.webp', page: 1, left: 120, top: 1975, width: 1120, height: 755 },
  { name: 'q16.webp', page: 1, left: 120, top: 2745, width: 1120, height: 210 },
  { name: 'q17.webp', page: 1, left: 120, top: 2970, width: 1120, height: 215 },
  { name: 'q18.webp', page: 1, left: 120, top: 3195, width: 1120, height: 215 },
  // Page 2 Right
  { name: 'q19.webp', page: 1, left: 1280, top: 115, width: 1130, height: 750 },
  { name: 'q20.webp', page: 1, left: 1280, top: 880, width: 1130, height: 275 },
  { name: 'q21.webp', page: 1, left: 1280, top: 1165, width: 1130, height: 235 },
  { name: 'q22.webp', page: 1, left: 1280, top: 1410, width: 1130, height: 615 },
  { name: 'q23.webp', page: 1, left: 1280, top: 2035, width: 1130, height: 215 },
  { name: 'q24.webp', page: 1, left: 1280, top: 2265, width: 1130, height: 290 },
  { name: 'q25.webp', page: 1, left: 1280, top: 2570, width: 1130, height: 825 },
];

async function buildAssets() {
  if (!fs.existsSync(PDF_PATH)) {
    throw new Error(`Missing PDF source: ${PDF_PATH}`);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(CONTACT_SHEET_PATH), { recursive: true });

  console.log('Rendering PDF pages at scale=3...');
  const buf = fs.readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buf });
  await parser.load();
  const shot = await parser.getScreenshot({ scale: 3 });

  const allCrops = [...FIGURE_CROPS, ...QUESTION_CROPS];
  const generatedTiles = [];

  for (const crop of allCrops) {
    const pageBuf = shot.pages[crop.page].data;
    const outPath = path.join(OUT_DIR, crop.name);
    const extractedBuf = await sharp(pageBuf)
      .extract({
        left: crop.left,
        top: crop.top,
        width: crop.width,
        height: crop.height,
      })
      .png()
      .toBuffer();

    await sharp(extractedBuf)
      .trim({ background: '#ffffff', threshold: 10 })
      .extend({
        top: 14,
        bottom: 14,
        left: 16,
        right: 16,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .webp({ quality: 90 })
      .toFile(outPath);

    generatedTiles.push({ name: crop.name, outPath });
    console.log(`  ✓ ${crop.name} (${crop.width}x${crop.height})`);
  }

  // Build Contact Sheet (4 columns x 8 rows)
  const COLS = 4;
  const CELL_W = 460;
  const CELL_H = 320;
  const PAD = 16;
  const LABEL_H = 36;
  const ROWS = Math.ceil(generatedTiles.length / COLS);
  const SHEET_W = COLS * CELL_W + (COLS + 1) * PAD;
  const SHEET_H = ROWS * CELL_H + (ROWS + 1) * PAD;

  const composites = [];
  for (let i = 0; i < generatedTiles.length; i++) {
    const { name, outPath } = generatedTiles[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = PAD + col * (CELL_W + PAD);
    const y = PAD + row * (CELL_H + PAD);

    const thumbBuf = await sharp(outPath)
      .resize(CELL_W - 12, CELL_H - LABEL_H - 12, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toBuffer();

    const frameSvg = Buffer.from(
      `<svg width="${CELL_W}" height="${CELL_H}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${CELL_W}" height="${CELL_H}" rx="12" fill="#ffffff" stroke="#0f766e" stroke-width="2"/>
        <rect x="0" y="0" width="${CELL_W}" height="${LABEL_H}" rx="10" fill="${name.includes('_fig') ? '#0f766e' : '#1e293b'}"/>
        <text x="14" y="24" font-family="sans-serif" font-size="18" font-weight="bold" fill="#ffffff">${name}</text>
      </svg>`
    );

    composites.push({ input: frameSvg, left: x, top: y });
    composites.push({ input: thumbBuf, left: x + 6, top: y + LABEL_H + 4 });
  }

  await sharp({
    create: {
      width: SHEET_W,
      height: SHEET_H,
      channels: 4,
      background: { r: 241, g: 245, b: 249, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toFile(CONTACT_SHEET_PATH);

  console.log(`\n✅ Generated ${generatedTiles.length} WebP assets & contact sheet: ${CONTACT_SHEET_PATH}`);
}

buildAssets().catch((err) => {
  console.error(err);
  process.exit(1);
});
