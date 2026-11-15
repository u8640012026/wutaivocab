/**
 * Batch Asset Slicer & Contact-Sheet Builder for Year 113 Priori Exams (Grades 3-6, 12 Papers).
 *
 * Outputs:
 * - public/assets/priori/113/<paperKey>/*.webp  (25 questions + figures + reading passages)
 * - public/audio/priori/113/eng-g{3,4,5,6}/*.mp3 (96kbps Mono listening clips)
 * - tmp/113_sheets/<paperKey>.png                (visual inspection contact sheets)
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import { PDFParse } from 'pdf-parse';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'PRIORI', '113篩選測驗');
const SHEET_DIR = path.join(ROOT, 'tmp', '113_sheets');

const SCALE = 3;
const COL_SPLIT_X = 1263;

// Explicitly verified Math questions containing geometric/chart figures
const MATH_FIG_QUESTIONS = {
  'math-g3': new Set([1, 3, 13, 14, 20, 21, 22, 23]),
  'math-g4': new Set([2, 4, 5, 6, 8, 10, 13, 19, 23, 25]),
  'math-g5': new Set([1, 2, 7, 11, 13, 15]),
  'math-g6': new Set([1, 15, 16]),
};

// Chinese passage definitions (matched to PDF column bounds + start header)
const CHINESE_PASSAGES = {
  'chi-g3': [
    { name: 'passage_20_22.webp', page: 2, col: 1, yMin: 210, firstQ: 20 },
    { name: 'passage_23_25.webp', page: 3, col: 0, yMin: 120, firstQ: 23 },
  ],
  'chi-g4': [
    { name: 'passage_20_22.webp', page: 2, col: 0, yMin: 210, firstQ: 20 },
    { name: 'passage_23_25.webp', page: 2, col: 1, yMin: 140, firstQ: 23 },
  ],
  'chi-g5': [
    { name: 'passage_18_20.webp', page: 2, col: 0, yMin: 210, firstQ: 18 },
    { name: 'passage_21_23.webp', page: 2, col: 1, yMin: 120, firstQ: 21 },
    { name: 'passage_24_25.webp', page: 3, col: 0, yMin: 140, firstQ: 24 },
  ],
  'chi-g6': [
    { name: 'passage_18_20.webp', page: 2, col: 0, yMin: 210, firstQ: 18 },
    { name: 'passage_21_23.webp', page: 2, col: 1, yMin: 120, firstQ: 21 },
    { name: 'passage_24_25.webp', page: 3, col: 0, yMin: 140, firstQ: 24 },
  ],
};

const PAPERS = [
  { key: 'math-g3', pdf: '113年篩選測驗數學科3年級試卷.pdf', accent: '#0f766e' },
  { key: 'math-g4', pdf: '113年篩選測驗數學科4年級試卷.pdf', accent: '#0f766e' },
  { key: 'math-g5', pdf: '113年篩選測驗數學科5年級試卷.pdf', accent: '#0f766e' },
  { key: 'math-g6', pdf: '113年篩選測驗數學科6年級試卷.pdf', accent: '#0f766e' },
  { key: 'chi-g3', pdf: '113年篩選測驗國語科3年級試卷.pdf', accent: '#b45309' },
  { key: 'chi-g4', pdf: '113年篩選測驗國語科4年級試卷.pdf', accent: '#b45309' },
  { key: 'chi-g5', pdf: '113年篩選測驗國語科5年級試卷.pdf', accent: '#b45309' },
  { key: 'chi-g6', pdf: '113年篩選測驗國語科6年級試卷.pdf', accent: '#b45309' },
  { key: 'eng-g3', pdf: '113年篩選測驗英語科3年級試卷.pdf', accent: '#4f46e5' },
  { key: 'eng-g4', pdf: '113年篩選測驗英語科4年級試卷.pdf', accent: '#4f46e5' },
  { key: 'eng-g5', pdf: '113年篩選測驗英語科5年級試卷.pdf', accent: '#4f46e5' },
  { key: 'eng-g6', pdf: '113年篩選測驗英語科6年級試卷.pdf', accent: '#4f46e5' },
];

// 113 English G3 MP3 segment triplets [startIdx, endIdx] over silencedetect (-35dB, d=1.6s) -> 94 segs
const ENG_G3_TRIPLETS = [
  [5, 7],   // q01: Z, z
  [8, 10],  // q02: E, e
  [11, 13], // q03: C, c
  [14, 16], // q04: H, h
  [17, 19], // q05: J, j
  [20, 22], // q06: K, k
  [23, 25], // q07: X, x
  [26, 28], // q08: M, m
  [29, 31], // q09: P, p
  [32, 34], // q10: Q, q
  [35, 37], // q11: T, t
  [38, 40], // q12: R, r
  [42, 44], // q13: G, g
  [45, 47], // q14: V, v
  [48, 50], // q15: B, b
  [62, 64], // q16: O/X
  [65, 67], // q17: O/X
  [68, 70], // q18: O/X
  [71, 73], // q19: O/X
  [74, 76], // q20: O/X
  [77, 79], // q21: O/X
  [81, 83], // q22: picture choice
  [84, 86], // q23: picture choice
  [87, 89], // q24: picture choice
  [90, 92], // q25: picture choice
];

// 113 English G4-G6 MP3 triplets (37 segs each -> segs [3,5]..[32,34] = Q1..Q10)
const ENG_G4_6_TRIPLETS = [
  [3, 5],
  [6, 8],
  [9, 11],
  [13, 15],
  [16, 18],
  [19, 21],
  [23, 25],
  [26, 28],
  [29, 31],
  [32, 34],
];

async function analyzePdfLayout(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data, verbosity: 0 }).promise;
  const pages = [];
  const questions = {};
  const headers = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const vp = page.getViewport({ scale: SCALE });
    const tc = await page.getTextContent();
    const items = tc.items
      .map((it) => {
        const [, , , , tx, ty] = pdfjsLib.Util.transform(vp.transform, it.transform);
        return { str: it.str, x: Math.round(tx), y: Math.round(ty), h: Math.round((it.height || 10) * SCALE) };
      })
      .filter((i) => i.str.trim());

    const lines = [];
    for (const it of items) {
      const col = it.x < COL_SPLIT_X ? 0 : 1;
      let line = lines.find((l) => l.col === col && Math.abs(l.y - it.y) < 16);
      if (!line) {
        line = { col, y: it.y, x: it.x, text: '', items: [] };
        lines.push(line);
      }
      line.x = Math.min(line.x, it.x);
      line.text += it.str;
      line.items.push(it);
    }
    lines.sort((a, b) => a.col - b.col || a.y - b.y);
    pages.push({ page: p - 1, width: Math.round(vp.width), height: Math.round(vp.height), lines });

    const minY = p === 1 ? 1000 : 120;
    for (const l of lines) {
      const t = l.text.trim();
      const m = t.match(/^(\d{1,2})\.(.*)$/);
      if (m) {
        const q = Number(m[1]);
        const colLeft = l.col === 0 ? 105 : 1310;
        if (q >= 1 && q <= 25 && l.y > minY && l.y < 3390 && l.x < colLeft + 260 && !questions[q]) {
          if (!/^[12]\.新社|^[12]\.后豐|^3\.2/.test(t) && (l.x < colLeft + 150 || /^\d+\./.test(t))) {
            questions[q] = { page: p - 1, col: l.col, x: l.x, y: l.y, text: t };
          }
        }
      }
      if (
        l.y > (p === 1 ? 1200 : 100) &&
        l.y < 3380 &&
        /^(請閱讀|作答說明|第二部分|第[一二三]部分|二、題組|三、聽辨|二、聽辨|一、聽辨|二、辨識|一、辨識|時間到|範例題|第一部分)/.test(t)
      ) {
        headers.push({ page: p - 1, col: l.col, x: l.x, y: l.y, text: t });
      }
    }
  }
  return { pages, questions, headers };
}

async function decodePageGrayscale(pageBuf) {
  const { data, info } = await sharp(pageBuf).grayscale().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function isRowWhite(gray, y, x1, x2) {
  if (y < 0 || y >= gray.height) return true;
  const off = y * gray.width;
  for (let x = x1; x < x2; x++) {
    if (gray.data[off + x] < 240) return false;
  }
  return true;
}

function findWhiteBandAbove(gray, startY, minY, x1, x2, minGapRows = 12) {
  let run = 0;
  for (let y = Math.min(startY, gray.height - 1); y >= Math.max(minY, 0); y--) {
    if (isRowWhite(gray, y, x1, x2)) {
      run += 1;
      if (run >= minGapRows) return y + Math.floor(run / 2);
    } else {
      run = 0;
    }
  }
  return Math.max(minY, 0);
}

function findLastInkAbove(gray, ceilingY, floorY, x1, x2) {
  for (let y = Math.min(ceilingY, gray.height - 1); y >= Math.max(floorY, 0); y--) {
    if (!isRowWhite(gray, y, x1, x2)) return Math.min(gray.height - 1, y + 12);
  }
  return Math.min(ceilingY, gray.height - 1);
}

/** Find widest contiguous white gap inside [startY, endY] and return its midpoint; fallback to scanning backward from endY */
function findWhiteGapSplit(gray, startY, endY, x1, x2, minGap = 20) {
  let bestLen = 0;
  let bestMid = null;
  let run = 0;
  const lo = Math.max(0, Math.round(startY));
  const hi = Math.min(gray.height - 1, Math.round(endY));
  // Prefer the gap closest to endY that still has >= minGap pure white rows (so internal gaps inside a question don't split it prematurely)
  const gaps = [];
  for (let y = lo; y <= hi; y++) {
    if (isRowWhite(gray, y, x1, x2)) {
      run += 1;
    } else {
      if (run >= minGap) gaps.push({ start: y - run, end: y - 1, len: run });
      run = 0;
    }
  }
  if (run >= minGap) gaps.push({ start: hi - run + 1, end: hi, len: run });
  if (gaps.length > 0) {
    // Pick the deepest wide gap near endY (or widest if comparable)
    const lastGap = gaps[gaps.length - 1];
    bestLen = lastGap.len;
    bestMid = Math.round((lastGap.start + lastGap.end) / 2);
  }
  return { mid: bestMid, len: bestLen };
}

function findFirstInkBelow(gray, topY, bottomY, x1, x2) {
  for (let y = Math.max(0, topY); y <= Math.min(gray.height - 1, bottomY); y++) {
    if (!isRowWhite(gray, y, x1, x2)) return Math.max(0, y - 10);
  }
  return topY;
}

async function extractTrimmedWebp(pageBuf, rect, outPath, pad = { t: 14, b: 14, l: 16, r: 16 }) {
  const safeRect = {
    left: Math.max(0, Math.round(rect.left)),
    top: Math.max(0, Math.round(rect.top)),
    width: Math.max(10, Math.round(rect.width)),
    height: Math.max(10, Math.round(rect.height)),
  };
  const extracted = await sharp(pageBuf).extract(safeRect).png().toBuffer();
  await sharp(extracted)
    .trim({ background: '#ffffff', threshold: 12 })
    .extend({
      top: pad.t,
      bottom: pad.b,
      left: pad.l,
      right: pad.r,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .webp({ quality: 90 })
    .toFile(outPath);
}

async function generateContactSheet(tiles, sheetPath, accentHex) {
  fs.mkdirSync(path.dirname(sheetPath), { recursive: true });
  const COLS = 5;
  const CELL_W = 420;
  const CELL_H = 300;
  const PAD = 14;
  const LABEL_H = 34;
  const ROWS = Math.ceil(tiles.length / COLS);
  const SHEET_W = COLS * CELL_W + (COLS + 1) * PAD;
  const SHEET_H = ROWS * CELL_H + (ROWS + 1) * PAD;

  const composites = [];
  for (let i = 0; i < tiles.length; i++) {
    const { name, outPath } = tiles[i];
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
        <rect x="0" y="0" width="${CELL_W}" height="${CELL_H}" rx="10" fill="#ffffff" stroke="${accentHex}" stroke-width="2"/>
        <rect x="0" y="0" width="${CELL_W}" height="${LABEL_H}" rx="8" fill="${isHighlight ? accentHex : '#1e293b'}"/>
        <text x="12" y="23" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff">${name}</text>
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
    .toFile(sheetPath);
}

async function buildPaperAssets(paperCfg) {
  const { key, pdf, accent } = paperCfg;
  const pdfPath = path.join(SRC_DIR, pdf);
  const outDir = path.join(ROOT, 'public', 'assets', 'priori', '113', key);
  const sheetPath = path.join(SHEET_DIR, `${key}.png`);
  fs.mkdirSync(outDir, { recursive: true });

  const layout = await analyzePdfLayout(pdfPath);
  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await parser.load();
  const shot = await parser.getScreenshot({ scale: SCALE });
  const grays = await Promise.all(shot.pages.map((pg) => decodePageGrayscale(pg.data)));

  const tiles = [];

  // Build ordered events per (page, col)
  for (let p = 0; p < shot.pages.length; p++) {
    const gray = grays[p];
    const pageBuf = shot.pages[p].data;
    const footerLine = layout.pages[p].lines.find(
      (l) => l.y > 3300 && /基本學習內容|第\s*\d+\s*頁/.test(l.text)
    );
    const footerLimit = p === 0 && key === 'eng-g3' ? 3392 : footerLine ? footerLine.y - 34 : 3355;

    for (let col = 0; col <= 1; col++) {
      const x1 = key === 'eng-g3' ? (col === 0 ? 115 : 1295) : (col === 0 ? 78 : 1280);
      const x2 = col === 0 ? 1244 : 2448;
      const colW = x2 - x1;

      const colQs = Object.entries(layout.questions)
        .filter(([, q]) => q.page === p && q.col === col)
        .map(([num, q]) => ({ type: 'q', num: Number(num), x: q.x, y: q.y, text: q.text }))
        .sort((a, b) => a.y - b.y);

      const colHdrs = layout.headers
        .filter((h) => h.page === p && h.col === col)
        .map((h) => ({ type: 'hdr', y: h.y, text: h.text }))
        .sort((a, b) => a.y - b.y);

      const colLines = layout.pages[p].lines.filter((l) => l.col === col).sort((a, b) => a.y - b.y);
      const passageFirstQs = new Set((CHINESE_PASSAGES[key] || []).map((psg) => psg.firstQ));

      for (let idx = 0; idx < colQs.length; idx++) {
        const cur = colQs[idx];
        const prevQ = idx > 0 ? colQs[idx - 1] : null;

        // Top boundary
        let topFloor = p === 0 ? 1150 : 100;
        if (prevQ) {
          const prevGap = findWhiteGapSplit(gray, prevQ.y + 45, cur.y - 12, x1, x2, 18);
          topFloor = prevGap.mid ?? prevQ.y + 40;
        }
        const hdrAbove = colHdrs.filter((h) => h.y < cur.y - 20).pop();
        if (hdrAbove) {
          topFloor = Math.max(topFloor, hdrAbove.y + 18);
        }
        if (passageFirstQs.has(cur.num)) {
          topFloor = Math.max(topFloor, cur.y - 72);
        }

        let cropTop;
        if (key === 'eng-g3' && cur.num <= 15) {
          cropTop = findWhiteBandAbove(gray, cur.y - 108, topFloor, x1, x2, 8);
        } else {
          // Allow headroom for stacked fractions/blocks directly on line 1 (e.g. 1000個 blocks or 5/8 numerator)
          const startScan = key.startsWith('math-') ? cur.y - 68 : cur.y - 44;
          cropTop = findWhiteBandAbove(gray, startScan, topFloor, x1, x2, 14);
          cropTop = findFirstInkBelow(gray, cropTop, cur.y - 2, x1, x2);
        }

        // Bottom boundary: snap cleanly into the horizontal white gap before next question / header
        let ceiling = footerLimit;
        const nextQ = idx + 1 < colQs.length ? colQs[idx + 1] : null;
        if (nextQ) {
          const searchEnd = key === 'eng-g3' && nextQ.num <= 15 ? nextQ.y - 102 : nextQ.y - 14;
          const nextGap = findWhiteGapSplit(gray, cur.y + 45, searchEnd, x1, x2, 16);
          ceiling = nextGap.mid ?? nextQ.y - (key === 'eng-g3' && nextQ.num <= 15 ? 128 : 48);
        }
        const hdrBelow = colHdrs.find((h) => h.y > cur.y + 30);
        if (hdrBelow) {
          const hdrGap = findWhiteGapSplit(gray, cur.y + 35, hdrBelow.y - 18, x1, x2, 16);
          ceiling = Math.min(ceiling, hdrGap.mid ?? hdrBelow.y - 46);
        }

        const cropBottom = findLastInkAbove(gray, ceiling, cur.y + 15, x1, x2);
        const qName = `q${String(cur.num).padStart(2, '0')}.webp`;
        const qPath = path.join(outDir, qName);

        await extractTrimmedWebp(pageBuf, { left: x1, top: cropTop, width: colW, height: cropBottom - cropTop }, qPath);
        tiles.push({ name: qName, outPath: qPath });

        // Figure extraction rules
        if (key.startsWith('math-') && MATH_FIG_QUESTIONS[key]?.has(cur.num)) {
          const qLines = colLines.filter((l) => l.y >= cropTop && l.y <= cropBottom);
          const optLine = qLines.find((l) => /\(1\)/.test(l.text));
          let figTop = cur.y + 18;
          if (key === 'math-g4' && cur.num === 6) {
            const askLine = qLines.find((l) => l.text.includes('下列敘述何者正確'));
            const figBot = askLine ? findLastInkAbove(gray, askLine.y - 42, figTop + 40, x1, x2) : (optLine ? optLine.y - 42 : cropBottom);
            const figName = `q06_fig.webp`;
            const figPath = path.join(outDir, figName);
            await extractTrimmedWebp(pageBuf, { left: x1, top: figTop, width: colW, height: figBot - figTop }, figPath);
            tiles.push({ name: figName, outPath: figPath });
          } else {
            // Stop before prompt/options lines below the figure
            const postFigLine = qLines.find(
              (l) =>
                l.y > cur.y + 45 &&
                (/\(1\)/.test(l.text) ||
                  /下一個圖形是哪個|請問哪個圖卡|下面哪個算式|指針所指的刻度/.test(l.text))
            );
            const firstOptY =
              key === 'math-g4' && cur.num === 5 && optLine
                ? optLine.y - 74
                : postFigLine
                ? postFigLine.y - 42
                : cropBottom;
            let lastStemY = cur.y + 16;
            for (const l of qLines) {
              if (
                l.y > cur.y + 8 &&
                l.y < firstOptY - 30 &&
                l.y < cur.y + 135 &&
                !/\(1\)/.test(l.text) &&
                l.text.trim().length > 9
              ) {
                lastStemY = Math.max(lastStemY, l.y + 14);
              }
            }
            if (key === 'math-g3' && cur.num === 14) lastStemY = cur.y + 110;
            if (key === 'math-g3' && cur.num === 21) lastStemY = cur.y + 72;
            if (key === 'math-g3' && cur.num === 3) lastStemY = cur.y - 52;
            if (key === 'math-g5' && cur.num === 13) lastStemY = Math.max(lastStemY, cur.y + 42);
            const figStart = findFirstInkBelow(gray, lastStemY, firstOptY - 25, x1, x2);
            const figEnd = findLastInkAbove(gray, firstOptY, figStart + 20, x1, x2);
            if (figEnd - figStart >= 35) {
              const figName = `q${String(cur.num).padStart(2, '0')}_fig.webp`;
              const figPath = path.join(outDir, figName);
              await extractTrimmedWebp(pageBuf, { left: x1, top: figStart, width: colW, height: figEnd - figStart }, figPath);
              tiles.push({ name: figName, outPath: figPath });
            }
          }
        } else if (key === 'chi-g5' && cur.num === 14) {
          const qLines = colLines.filter((l) => l.y >= cropTop && l.y <= cropBottom);
          const hdrLine = qLines.find((l) => l.text.includes('參賽料理'));
          const askLine = qLines.find((l) => l.text.includes('比賽結果'));
          const figTop = hdrLine ? hdrLine.y - 36 : cur.y + 135;
          const figBot = askLine ? askLine.y - 40 : cropBottom - 260;
          const figName = 'q14_fig.webp';
          const figPath = path.join(outDir, figName);
          await extractTrimmedWebp(pageBuf, { left: x1, top: figTop, width: colW, height: figBot - figTop }, figPath);
          tiles.push({ name: figName, outPath: figPath });
        } else if (key === 'eng-g3' && cur.num >= 22) {
          // Crop from (1) (2) (3) labels/illustrations below question number/boxes
          const qLines = colLines.filter((l) => l.y >= cropTop && l.y <= cropBottom);
          const lblLine = qLines.find((l) => l.text.includes('(1)'));
          const figTop = lblLine ? lblLine.y - 34 : cur.y + 38;
          const figName = `q${String(cur.num).padStart(2, '0')}_fig.webp`;
          const figPath = path.join(outDir, figName);
          await extractTrimmedWebp(pageBuf, { left: x1 + 45, top: figTop, width: colW - 45, height: cropBottom - figTop }, figPath);
          tiles.push({ name: figName, outPath: figPath });
        } else if (/^eng-g[456]$/.test(key) && cur.num >= 4) {
          const qLines = colLines.filter((l) => l.y >= cropTop && l.y <= cropBottom);
          const opt1Line = qLines.find((l) => l.text.includes('(1)'));
          const opt1Item = opt1Line?.items?.find((it) => it.str.includes('(1)'));

          if (cur.num >= 4 && cur.num <= 10) {
            const figTop = findFirstInkBelow(gray, cur.y + 18, cropBottom - 20, x1 + 65, x2);
            const figName = `q${String(cur.num).padStart(2, '0')}_fig.webp`;
            const figPath = path.join(outDir, figName);
            await extractTrimmedWebp(pageBuf, { left: x1 + 60, top: figTop, width: colW - 60, height: cropBottom - figTop }, figPath);
            tiles.push({ name: figName, outPath: figPath });
          } else if (cur.num >= 11 && cur.num <= 17) {
            const figLeft = Math.min(x1 + 140, cur.x + 56);
            const figRight = opt1Item ? Math.min(x2, opt1Item.x - 24) : x1 + Math.round(colW * 0.48);
            const figName = `q${String(cur.num).padStart(2, '0')}_fig.webp`;
            const figPath = path.join(outDir, figName);
            await extractTrimmedWebp(pageBuf, { left: figLeft, top: cropTop, width: Math.max(80, figRight - figLeft), height: cropBottom - cropTop }, figPath);
            tiles.push({ name: figName, outPath: figPath });
          } else if (cur.num >= 18 && cur.num <= 22 && key !== 'eng-g6') {
            const figTop = opt1Line ? opt1Line.y - 36 : cur.y + 85;
            const figName = `q${String(cur.num).padStart(2, '0')}_fig.webp`;
            const figPath = path.join(outDir, figName);
            await extractTrimmedWebp(pageBuf, { left: x1 + 60, top: figTop, width: colW - 60, height: cropBottom - figTop }, figPath);
            tiles.push({ name: figName, outPath: figPath });
          } else if ((key === 'eng-g6' && cur.num >= 21) || (key !== 'eng-g6' && cur.num >= 23)) {
            const figLeft = Math.min(x1 + 140, cur.x + 56);
            const figRight = opt1Item ? Math.min(x2, opt1Item.x - 24) : x1 + Math.round(colW * 0.45);
            const figName = `q${String(cur.num).padStart(2, '0')}_fig.webp`;
            const figPath = path.join(outDir, figName);
            await extractTrimmedWebp(pageBuf, { left: figLeft, top: cropTop, width: Math.max(80, figRight - figLeft), height: cropBottom - cropTop }, figPath);
            tiles.push({ name: figName, outPath: figPath });
          }
        }
      }
    }
  }

  // Extract Chinese reading passages
  if (CHINESE_PASSAGES[key]) {
    for (const psg of CHINESE_PASSAGES[key]) {
      const pageBuf = shot.pages[psg.page].data;
      const gray = grays[psg.page];
      const x1 = psg.col === 0 ? 78 : 1280;
      const x2 = psg.col === 0 ? 1244 : 2448;
      const qTarget = layout.questions[psg.firstQ];
      const topY = findFirstInkBelow(gray, psg.yMin, qTarget.y - 80, x1, x2);
      const botY = findLastInkAbove(gray, qTarget.y - 42, topY + 60, x1, x2);
      const pPath = path.join(outDir, psg.name);
      await extractTrimmedWebp(pageBuf, { left: x1, top: topY, width: x2 - x1, height: botY - topY }, pPath);
      tiles.push({ name: psg.name, outPath: pPath });
    }
  }

  await generateContactSheet(tiles, sheetPath, accent);
  console.log(`  ✓ [${key}] ${tiles.length} WebPs -> ${path.relative(ROOT, sheetPath)}`);
}

function detectMp3Segments(mp3Path) {
  const res = spawnSync(ffmpeg, ['-i', mp3Path, '-af', 'silencedetect=noise=-35dB:d=1.6', '-f', 'null', '-'], {
    encoding: 'utf8',
  });
  const out = (res.stderr || '') + (res.stdout || '');
  const silences = [];
  let curS = null;
  for (const line of out.split(/\r?\n/)) {
    const m1 = line.match(/silence_start:\s*([0-9.]+)/);
    if (m1) curS = parseFloat(m1[1]);
    const m2 = line.match(/silence_end:\s*([0-9.]+)\s*\|\s*silence_duration:\s*([0-9.]+)/);
    if (m2) {
      silences.push({ s: curS ?? 0, e: parseFloat(m2[1]) });
      curS = null;
    }
  }
  const dur = out.match(/Duration:\s*(\d+):(\d+):([0-9.]+)/);
  const total = dur ? Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3]) : 0;
  const segs = [];
  let prev = 0;
  for (const si of silences) {
    if (si.s - prev > 0.2) segs.push({ start: prev, end: si.s });
    prev = si.e;
  }
  if (total - prev > 0.2) segs.push({ start: prev, end: total });
  return segs;
}

function getMp3Duration(mp3Path) {
  const res = spawnSync(ffmpeg, ['-i', mp3Path], { encoding: 'utf8' });
  const m = (res.stderr || '').match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : 0;
}

function sliceAudioGrade(grade, pdfMp3Name, triplets) {
  const srcMp3 = path.join(SRC_DIR, pdfMp3Name);
  const outDir = path.join(ROOT, 'public', 'audio', 'priori', '113', `eng-g${grade}`);
  fs.mkdirSync(outDir, { recursive: true });
  const segs = detectMp3Segments(srcMp3);

  const summary = [];
  triplets.forEach(([sIdx, eIdx], i) => {
    const start = Math.max(0, segs[sIdx].start - 0.15);
    const end = segs[eIdx].end + 0.2;
    const fname = `q${String(i + 1).padStart(2, '0')}.mp3`;
    const outPath = path.join(outDir, fname);
    const res = spawnSync(
      ffmpeg,
      [
        '-y',
        '-ss',
        start.toFixed(3),
        '-to',
        end.toFixed(3),
        '-i',
        srcMp3,
        '-af',
        'silenceremove=stop_periods=-1:stop_duration=1.1:stop_threshold=-38dB',
        '-ac',
        '1',
        '-c:a',
        'libmp3lame',
        '-b:a',
        '96k',
        outPath,
      ],
      { encoding: 'utf8' }
    );
    if (res.status !== 0) {
      throw new Error(`ffmpeg failed on 113 eng-g${grade} ${fname}: ${res.stderr}`);
    }
    const dur = getMp3Duration(outPath);
    summary.push(`${fname}:${dur.toFixed(1)}s`);
  });
  console.log(`  ✓ [audio eng-g${grade}] ${summary.length} clips (${summary.join(', ')})`);
}

async function main() {
  console.log('=== Year 113 Priori Asset Pipeline Start ===');
  for (const paper of PAPERS) {
    await buildPaperAssets(paper);
  }
  console.log('\n=== Slicing Year 113 English Audio ===');
  sliceAudioGrade(3, '113年篩選測驗英語科3年級試卷聽力檔.mp3', ENG_G3_TRIPLETS);
  sliceAudioGrade(4, '113年篩選測驗英語科4年級試卷聽力檔.mp3', ENG_G4_6_TRIPLETS);
  sliceAudioGrade(5, '113年篩選測驗英語科5年級試卷聽力檔.mp3', ENG_G4_6_TRIPLETS);
  sliceAudioGrade(6, '113年篩選測驗英語科6年級試卷聽力檔.mp3', ENG_G4_6_TRIPLETS);
  console.log('\nAll Year 113 images & audio sliced cleanly!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
