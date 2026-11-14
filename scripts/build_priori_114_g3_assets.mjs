import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
const sharp = require('sharp');
const ffmpeg = require('ffmpeg-static');

const MATH_PDF = path.resolve('PRIORI/114篩選測驗/114年篩選測驗數學科3年級試卷.pdf');
const CHI_PDF = path.resolve('PRIORI/114篩選測驗/114年篩選測驗國語科3年級試卷.pdf');
const ENG_PDF = path.resolve('PRIORI/114篩選測驗/114年篩選測驗英語科3年級試卷.pdf');
const ENG_MP3 = path.resolve('PRIORI/114篩選測驗/114年篩選測驗英語科3年級試卷聽力檔.mp3');

const MATH_OUT = path.resolve('public/assets/priori/114/math-g3');
const CHI_OUT = path.resolve('public/assets/priori/114/chi-g3');
const ENG_OUT = path.resolve('public/assets/priori/114/eng-g3');
const ENG_AUDIO_OUT = path.resolve('public/audio/priori/114/eng-g3');

// 嚴禁從答案卷裁切：以下全部由空白學生試卷 PDF（*試卷.pdf）裁切
const MATH_CROPS = [
  // Figures
  { name: 'q01_fig.webp', page: 0, left: 125, top: 1372, width: 1090, height: 64 },
  { name: 'q02_fig.webp', page: 0, left: 120, top: 1592, width: 1120, height: 605 },
  { name: 'q07_fig.webp', page: 0, left: 1330, top: 2125, width: 1060, height: 270 },
  { name: 'q08_fig.webp', page: 0, left: 1330, top: 2758, width: 920, height: 192 },
  { name: 'q11_fig.webp', page: 1, left: 165, top: 795, width: 720, height: 155 },
  { name: 'q12_fig.webp', page: 1, left: 160, top: 1148, width: 420, height: 258 },
  { name: 'q19_fig.webp', page: 1, left: 1330, top: 335, width: 1060, height: 425 },
  { name: 'q20_fig.webp', page: 1, left: 1330, top: 998, width: 1060, height: 382 },
  { name: 'q25_fig.webp', page: 1, left: 1330, top: 2750, width: 700, height: 490 },
  // Questions (Page 1 Left)
  { name: 'q01.webp', page: 0, left: 95, top: 1312, width: 1150, height: 265 },
  { name: 'q02.webp', page: 0, left: 95, top: 1590, width: 1150, height: 610 },
  { name: 'q03.webp', page: 0, left: 95, top: 2212, width: 1150, height: 490 },
  { name: 'q04.webp', page: 0, left: 95, top: 2718, width: 1150, height: 700 },
  // Page 1 Right
  { name: 'q05.webp', page: 0, left: 1278, top: 1238, width: 1155, height: 398 },
  { name: 'q06.webp', page: 0, left: 1278, top: 1658, width: 1155, height: 292 },
  { name: 'q07.webp', page: 0, left: 1278, top: 1972, width: 1155, height: 638 },
  { name: 'q08.webp', page: 0, left: 1278, top: 2630, width: 1155, height: 790 },
  // Page 2 Left
  { name: 'q09.webp', page: 1, left: 95, top: 110, width: 1150, height: 205 },
  { name: 'q10.webp', page: 1, left: 95, top: 340, width: 1150, height: 342 },
  { name: 'q11.webp', page: 1, left: 95, top: 708, width: 1150, height: 335 },
  { name: 'q12.webp', page: 1, left: 95, top: 1062, width: 1150, height: 495 },
  { name: 'q13.webp', page: 1, left: 95, top: 1584, width: 1150, height: 205 },
  { name: 'q14.webp', page: 1, left: 95, top: 1815, width: 1150, height: 290 },
  { name: 'q15.webp', page: 1, left: 95, top: 2130, width: 1150, height: 582 },
  { name: 'q16.webp', page: 1, left: 95, top: 2736, width: 1150, height: 292 },
  { name: 'q17.webp', page: 1, left: 95, top: 3054, width: 1150, height: 368 },
  // Page 2 Right
  { name: 'q18.webp', page: 1, left: 1278, top: 110, width: 1155, height: 138 },
  { name: 'q19.webp', page: 1, left: 1278, top: 264, width: 1155, height: 652 },
  { name: 'q20.webp', page: 1, left: 1278, top: 932, width: 1155, height: 572 },
  { name: 'q21.webp', page: 1, left: 1278, top: 1522, width: 1155, height: 262 },
  { name: 'q22.webp', page: 1, left: 1278, top: 1798, width: 1155, height: 262 },
  { name: 'q23.webp', page: 1, left: 1278, top: 2076, width: 1155, height: 380 },
  { name: 'q24.webp', page: 1, left: 1278, top: 2470, width: 1155, height: 198 },
  { name: 'q25.webp', page: 1, left: 1278, top: 2684, width: 1155, height: 716 },
];

const CHI_CROPS = [
  // Passages
  { name: 'passage_20_22.webp', page: 2, left: 1280, top: 118, width: 1145, height: 1998 },
  { name: 'passage_23_25.webp', page: 3, left: 95, top: 115, width: 1145, height: 1265 },
  // Page 1 Left
  { name: 'q01.webp', page: 0, left: 95, top: 1615, width: 1145, height: 440 },
  { name: 'q02.webp', page: 0, left: 95, top: 2104, width: 1145, height: 516 },
  { name: 'q03.webp', page: 0, left: 95, top: 2665, width: 1145, height: 440 },
  // Page 1 Right
  { name: 'q04.webp', page: 0, left: 1280, top: 1620, width: 1145, height: 512 },
  { name: 'q05.webp', page: 0, left: 1280, top: 2180, width: 1145, height: 586 },
  { name: 'q06.webp', page: 0, left: 1280, top: 2816, width: 1145, height: 365 },
  // Page 2 Left
  { name: 'q07.webp', page: 1, left: 95, top: 115, width: 1145, height: 365 },
  { name: 'q08.webp', page: 1, left: 95, top: 525, width: 1145, height: 516 },
  { name: 'q09.webp', page: 1, left: 95, top: 1086, width: 1145, height: 442 },
  { name: 'q10.webp', page: 1, left: 95, top: 1575, width: 1145, height: 516 },
  { name: 'q11.webp', page: 1, left: 95, top: 2138, width: 1145, height: 516 },
  { name: 'q12.webp', page: 1, left: 95, top: 2698, width: 1145, height: 365 },
  // Page 2 Right
  { name: 'q13.webp', page: 1, left: 1280, top: 112, width: 1145, height: 340 },
  { name: 'q14.webp', page: 1, left: 1280, top: 530, width: 1145, height: 478 },
  { name: 'q15.webp', page: 1, left: 1280, top: 1050, width: 1145, height: 616 },
  { name: 'q16.webp', page: 1, left: 1280, top: 1708, width: 1145, height: 616 },
  { name: 'q17.webp', page: 1, left: 1280, top: 2366, width: 1145, height: 682 },
  // Page 3 Left
  { name: 'q18.webp', page: 2, left: 95, top: 112, width: 1145, height: 478 },
  { name: 'q19.webp', page: 2, left: 95, top: 632, width: 1145, height: 546 },
  // Page 3 Right (Q20-Q22)
  { name: 'q20.webp', page: 2, left: 1280, top: 2132, width: 1145, height: 362 },
  { name: 'q21.webp', page: 2, left: 1280, top: 2534, width: 1145, height: 428 },
  { name: 'q22.webp', page: 2, left: 1280, top: 3008, width: 1145, height: 300 },
  // Page 4 Left (Q23-Q25)
  { name: 'q23.webp', page: 3, left: 95, top: 1388, width: 1145, height: 362 },
  { name: 'q24.webp', page: 3, left: 95, top: 1832, width: 1145, height: 362 },
  { name: 'q25.webp', page: 3, left: 95, top: 2278, width: 1145, height: 440 },
];

const ENG_CROPS = [
  // Picture-choice Figures (Q22-Q25)
  { name: 'q22_fig.webp', page: 1, left: 1300, top: 1130, width: 1135, height: 350 },
  { name: 'q23_fig.webp', page: 1, left: 1300, top: 1672, width: 1135, height: 348 },
  { name: 'q24_fig.webp', page: 1, left: 1300, top: 2212, width: 1135, height: 344 },
  { name: 'q25_fig.webp', page: 1, left: 1300, top: 2752, width: 1135, height: 326 },
  // Page 1 Left (Q1-Q5)
  { name: 'q01.webp', page: 0, left: 95, top: 2042, width: 1125, height: 250 },
  { name: 'q02.webp', page: 0, left: 95, top: 2306, width: 1125, height: 250 },
  { name: 'q03.webp', page: 0, left: 95, top: 2570, width: 1125, height: 250 },
  { name: 'q04.webp', page: 0, left: 95, top: 2834, width: 1125, height: 250 },
  { name: 'q05.webp', page: 0, left: 95, top: 3105, width: 1125, height: 250 },
  // Page 1 Right (Q6-Q12)
  { name: 'q06.webp', page: 0, left: 1300, top: 1323, width: 1135, height: 252 },
  { name: 'q07.webp', page: 0, left: 1300, top: 1591, width: 1135, height: 252 },
  { name: 'q08.webp', page: 0, left: 1300, top: 1858, width: 1135, height: 252 },
  { name: 'q09.webp', page: 0, left: 1300, top: 2126, width: 1135, height: 252 },
  { name: 'q10.webp', page: 0, left: 1300, top: 2393, width: 1135, height: 252 },
  { name: 'q11.webp', page: 0, left: 1300, top: 2660, width: 1135, height: 252 },
  { name: 'q12.webp', page: 0, left: 1300, top: 2928, width: 1135, height: 252 },
  // Page 2 Left (Q13-Q15 + Q16-Q18)
  { name: 'q13.webp', page: 1, left: 95, top: 105, width: 1125, height: 250 },
  { name: 'q14.webp', page: 1, left: 95, top: 372, width: 1125, height: 250 },
  { name: 'q15.webp', page: 1, left: 95, top: 640, width: 1125, height: 250 },
  { name: 'q16.webp', page: 1, left: 95, top: 2985, width: 1125, height: 112 },
  { name: 'q17.webp', page: 1, left: 95, top: 3113, width: 1125, height: 112 },
  { name: 'q18.webp', page: 1, left: 95, top: 3241, width: 1125, height: 112 },
  // Page 2 Right (Q19-Q25)
  { name: 'q19.webp', page: 1, left: 1300, top: 146, width: 1135, height: 110 },
  { name: 'q20.webp', page: 1, left: 1300, top: 274, width: 1135, height: 110 },
  { name: 'q21.webp', page: 1, left: 1300, top: 402, width: 1135, height: 110 },
  { name: 'q22.webp', page: 1, left: 1300, top: 1004, width: 1135, height: 478 },
  { name: 'q23.webp', page: 1, left: 1300, top: 1545, width: 1135, height: 476 },
  { name: 'q24.webp', page: 1, left: 1300, top: 2085, width: 1135, height: 472 },
  { name: 'q25.webp', page: 1, left: 1300, top: 2626, width: 1135, height: 452 },
];

// 官方聽力分段起訖秒數（對齊 114年篩選測驗英語科3年級試卷聽力檔.mp3 實測 silencedetect）
const ENG_AUDIO_SEGMENTS = [
  { name: 'q01.mp3', start: 122.8, end: 138.3 },
  { name: 'q02.mp3', start: 142.2, end: 157.4 },
  { name: 'q03.mp3', start: 161.4, end: 177.5 },
  { name: 'q04.mp3', start: 181.5, end: 197.5 },
  { name: 'q05.mp3', start: 201.4, end: 217.6 },
  { name: 'q06.mp3', start: 221.6, end: 237.2 },
  { name: 'q07.mp3', start: 241.1, end: 256.2 },
  { name: 'q08.mp3', start: 260.2, end: 276.3 },
  { name: 'q09.mp3', start: 280.2, end: 295.7 },
  { name: 'q10.mp3', start: 299.7, end: 315.3 },
  { name: 'q11.mp3', start: 319.2, end: 335.0 },
  { name: 'q12.mp3', start: 339.0, end: 354.9 },
  { name: 'q13.mp3', start: 367.6, end: 383.6 },
  { name: 'q14.mp3', start: 387.7, end: 403.6 },
  { name: 'q15.mp3', start: 407.6, end: 423.2 },
  { name: 'q16.mp3', start: 591.2, end: 607.5 },
  { name: 'q17.mp3', start: 609.5, end: 626.0 },
  { name: 'q18.mp3', start: 628.0, end: 643.7 },
  { name: 'q19.mp3', start: 645.8, end: 662.0 },
  { name: 'q20.mp3', start: 664.0, end: 680.9 },
  { name: 'q21.mp3', start: 682.9, end: 699.3 },
  { name: 'q22.mp3', start: 731.0, end: 743.7 },
  { name: 'q23.mp3', start: 745.8, end: 758.4 },
  { name: 'q24.mp3', start: 760.5, end: 772.2 },
  { name: 'q25.mp3', start: 774.2, end: 788.0 },
];

async function renderPdfCrops(pdfPath, outDir, crops, contactSheetPath, accentHex) {
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Missing PDF source: ${pdfPath}`);
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.dirname(contactSheetPath), { recursive: true });

  console.log(`\nRendering ${path.basename(pdfPath)} at scale=3...`);
  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await parser.load();
  const shot = await parser.getScreenshot({ scale: 3 });

  const generatedTiles = [];
  for (const crop of crops) {
    const pageBuf = shot.pages[crop.page].data;
    const outPath = path.join(outDir, crop.name);

    // 兩階段管線：先 extract 至 PNG buffer 再 trim + extend，避免 sharp bad extract area
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
  }

  // Contact sheet
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

    const isHighlight = name.includes('_fig') || name.includes('passage');
    const frameSvg = Buffer.from(
      `<svg width="${CELL_W}" height="${CELL_H}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${CELL_W}" height="${CELL_H}" rx="12" fill="#ffffff" stroke="${accentHex}" stroke-width="2"/>
        <rect x="0" y="0" width="${CELL_W}" height="${LABEL_H}" rx="10" fill="${isHighlight ? accentHex : '#1e293b'}"/>
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
    .toFile(contactSheetPath);

  console.log(`  ✓ Generated ${generatedTiles.length} WebPs -> ${contactSheetPath}`);
}

function getMp3Duration(mp3Path) {
  const res = spawnSync(ffmpeg, ['-i', mp3Path], { encoding: 'utf8' });
  const m = (res.stderr || '').match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (!m) return 0;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

function splitEnglishAudio() {
  if (!fs.existsSync(ENG_MP3)) {
    throw new Error(`Missing English MP3 source: ${ENG_MP3}`);
  }
  fs.mkdirSync(ENG_AUDIO_OUT, { recursive: true });
  console.log('\nSplitting 114 English G3 listening MP3 into 25 clips...');

  const summary = [];
  for (const seg of ENG_AUDIO_SEGMENTS) {
    const outPath = path.join(ENG_AUDIO_OUT, seg.name);
    const res = spawnSync(
      ffmpeg,
      [
        '-y',
        '-ss',
        String(seg.start),
        '-to',
        String(seg.end),
        '-i',
        ENG_MP3,
        '-af',
        'silenceremove=stop_periods=-1:stop_duration=1.1:stop_threshold=-38dB',
        '-c:a',
        'libmp3lame',
        '-b:a',
        '128k',
        outPath,
      ],
      { encoding: 'utf8' }
    );
    if (res.status !== 0) {
      throw new Error(`ffmpeg failed on ${seg.name}: ${res.stderr}`);
    }
    const dur = getMp3Duration(outPath);
    const bytes = fs.statSync(outPath).size;
    summary.push({ name: seg.name, dur, bytes });
    if (dur < 1.5 || dur > 25) {
      throw new Error(`Audio duration anomaly for ${seg.name}: ${dur.toFixed(2)}s`);
    }
  }
  console.log(
    `  ✓ Split 25 MP3 clips (${summary.map((s) => `${s.name}:${s.dur.toFixed(1)}s`).join(', ')})`
  );
}

async function main() {
  await renderPdfCrops(
    MATH_PDF,
    MATH_OUT,
    MATH_CROPS,
    path.resolve('tmp/priori_114_math_g3_contact_sheet.png'),
    '#0f766e'
  );
  await renderPdfCrops(
    CHI_PDF,
    CHI_OUT,
    CHI_CROPS,
    path.resolve('tmp/priori_114_chi_g3_contact_sheet.png'),
    '#b45309'
  );
  await renderPdfCrops(
    ENG_PDF,
    ENG_OUT,
    ENG_CROPS,
    path.resolve('tmp/priori_114_eng_g3_contact_sheet.png'),
    '#4338ca'
  );
  splitEnglishAudio();
  console.log('\n✅ 114 G3 all images & audio assets built successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
