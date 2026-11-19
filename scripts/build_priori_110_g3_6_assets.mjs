/**
 * Batch Asset Slicer, Answer Extractor, A3 Original Copier & Contact-Sheet Builder
 * for Year 110 Priori Exams (Grades 3-6, 12 Papers).
 *
 * Outputs:
 * - public/assets/priori/110/<paperKey>/*.webp   (25 questions + figures + reading passages)
 * - public/assets/priori/original/110-*.pdf      (24 original A3 student & answer PDFs)
 * - public/audio/priori/110/eng-g{3,4,5,6}/*.mp3 (96kbps Mono listening clips)
 * - tmp/110_sheets/<paperKey>.png                (visual inspection contact sheets)
 * - tmp/110_extracted_spec.json                  (answers / questions / passages keyed by paperId)
 *
 * Per HANDOVER.md Section 7 rule: NEVER use pdf-parse getScreenshot(). Always use renderPdfPagesWithChrome().
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import { renderPdfPagesWithChrome } from './lib/renderPdfPagesWithChrome.mjs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'PRIORI', '110篩選測驗');
const ORIG_DIR = path.join(ROOT, 'public', 'assets', 'priori', 'original');
const SHEET_DIR = path.join(ROOT, 'tmp', '110_sheets');
const SPEC_PATH = path.join(ROOT, 'tmp', '110_extracted_spec.json');

const SCALE = 3;
const ARGS = process.argv.slice(2);
const flag = (n) => ARGS.includes(`--${n}`);
const ONLY = (ARGS.find((a) => a.startsWith('--only=')) || '').replace('--only=', '').split(',').filter(Boolean);

const HDR_RE = /^(請閱讀|作答說明|第[一二三]部分|[一二三四五六七八九]\s*[-－]?\s*[、，]|時間到|範例題|選擇題)/;

function paperCfgs() {
  const out = [];
  for (const g of [3, 4, 5, 6]) {
    out.push({
      key: `math-g${g}`,
      subject: 'math',
      paperId: `110-math-g${g}`,
      grade: g,
      pdf: `110年05月篩選測驗-數學${g}年級.pdf`,
      ans: `110年05月篩選測驗-數學${g}年級答案卷.pdf`,
      accent: '#0f766e',
    });
  }
  for (const g of [3, 4, 5, 6]) {
    out.push({
      key: `chi-g${g}`,
      subject: 'chinese',
      paperId: `110-chinese-g${g}`,
      grade: g,
      pdf: `110年05月篩選測驗-國語文${g}年級.pdf`,
      ans: `110年05月篩選測驗-國語文${g}年級答案卷.pdf`,
      accent: '#b45309',
    });
  }
  for (const g of [3, 4, 5, 6]) {
    out.push({
      key: `eng-g${g}`,
      subject: 'english',
      paperId: `110-english-g${g}`,
      grade: g,
      pdf: `110年05月篩選測驗-英語${g}年級.pdf`,
      ans: `110年05月篩選測驗-英語${g}年級答案卷.pdf`,
      accent: '#4f46e5',
    });
  }
  return out;
}

const MATH_FIG_QUESTIONS = {
  'math-g3': [2, 8, 12, 15, 18, 22, 23, 25],
  'math-g4': [1, 2, 4, 6, 8, 15, 17, 18, 20, 24],
  'math-g5': [3, 4, 6, 7, 16, 18, 25],
  'math-g6': [8, 11, 14, 25],
};
const CHI_FIG_QUESTIONS = {
  'chi-g3': [],
  'chi-g4': [],
  'chi-g5': [],
  'chi-g6': [],
};
const FIG_OVERRIDES = {};

function isRowWhite(gray, y, x1, x2) {
  if (y < 0 || y >= gray.height) return true;
  const off = y * gray.width;
  const hi = Math.min(x2, gray.width);
  for (let x = Math.max(0, x1); x < hi; x++) if (gray.data[off + x] < 240) return false;
  return true;
}
function findWhiteBandAbove(gray, startY, minY, x1, x2, minGapRows = 12) {
  let run = 0;
  for (let y = Math.min(startY, gray.height - 1); y >= Math.max(minY, 0); y--) {
    if (isRowWhite(gray, y, x1, x2)) {
      run += 1;
      if (run >= minGapRows) return y + Math.floor(run / 2);
    } else run = 0;
  }
  return Math.max(minY, 0);
}
function findLastInkAbove(gray, ceilingY, floorY, x1, x2) {
  for (let y = Math.min(ceilingY, gray.height - 1); y >= Math.max(floorY, 0); y--) {
    if (!isRowWhite(gray, y, x1, x2)) return Math.min(gray.height - 1, y + 12);
  }
  return Math.min(ceilingY, gray.height - 1);
}
function findWhiteGapSplit(gray, startY, endY, x1, x2, minGap = 20) {
  const lo = Math.max(0, Math.round(startY));
  const hi = Math.min(gray.height - 1, Math.round(endY));
  const gaps = [];
  let run = 0;
  for (let y = lo; y <= hi; y++) {
    if (isRowWhite(gray, y, x1, x2)) run += 1;
    else {
      if (run >= minGap) gaps.push({ start: y - run, end: y - 1, len: run });
      run = 0;
    }
  }
  if (run >= minGap) gaps.push({ start: hi - run + 1, end: hi, len: run });
  if (gaps.length > 0) {
    const g = gaps[gaps.length - 1];
    return { mid: Math.round((g.start + g.end) / 2), len: g.len };
  }
  return { mid: null, len: 0 };
}
function findFirstInkBelow(gray, topY, bottomY, x1, x2) {
  for (let y = Math.max(0, topY); y <= Math.min(gray.height - 1, bottomY); y++) {
    if (!isRowWhite(gray, y, x1, x2)) return Math.max(0, y - 10);
  }
  return topY;
}
function inkBlockAround(gray, y0, x1, x2) {
  let top = y0;
  while (top > 0 && !isRowWhite(gray, top - 1, x1, x2)) top--;
  let bot = y0;
  while (bot < gray.height - 1 && !isRowWhite(gray, bot + 1, x1, x2)) bot++;
  return [top, bot];
}

async function decodePage(pageBuf) {
  const g = await sharp(pageBuf).grayscale().raw().toBuffer({ resolveWithObject: true });
  return { data: g.data, width: g.info.width, height: g.info.height };
}
async function decodePageRgb(pageBuf) {
  const g = await sharp(pageBuf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: g.data, width: g.info.width, height: g.info.height, ch: g.info.channels };
}
async function renderPdf(pdfPath) {
  const pages = await renderPdfPagesWithChrome(pdfPath, SCALE);
  return pages.map((p) => p.data);
}

function detectDivider(gray) {
  const y0 = 1200;
  const y1 = Math.min(gray.height, 3300);
  const cx = Math.round(gray.width / 2);
  let best = -1;
  let bestCnt = 0;
  const counts = new Map();
  for (let x = cx - 26; x <= cx + 26; x++) {
    let c = 0;
    for (let y = y0; y < y1; y += 2) if (gray.data[y * gray.width + x] < 160) c++;
    counts.set(x, c);
    if (c > bestCnt) {
      bestCnt = c;
      best = x;
    }
  }
  const need = ((y1 - y0) / 2) * 0.35;
  if (bestCnt < need) {
    let bestTop = -1;
    let bestTopCnt = 0;
    const topCounts = new Map();
    for (let x = cx - 26; x <= cx + 26; x++) {
      let c = 0;
      for (let y = 150; y < 1200; y += 2) if (gray.data[y * gray.width + x] < 160) c++;
      topCounts.set(x, c);
      if (c > bestTopCnt) {
        bestTopCnt = c;
        bestTop = x;
      }
    }
    if (bestTopCnt >= 200) {
      let s = bestTop;
      let e = bestTop;
      while ((topCounts.get(s - 1) || 0) > bestTopCnt * 0.5) s--;
      while ((topCounts.get(e + 1) || 0) > bestTopCnt * 0.5) e++;
      return { start: s, end: e };
    }
    return { start: cx - 10, end: cx + 10 };
  }
  let s = best;
  let e = best;
  while ((counts.get(s - 1) || 0) > need * 0.5) s--;
  while ((counts.get(e + 1) || 0) > need * 0.5) e++;
  return { start: s, end: e };
}

function findHeaderBoxBottom(gray) {
  let last = 1100;
  for (let y = 800; y < 1400; y++) {
    let dark = 0;
    for (let x = 100; x < 2400; x += 2) if (gray.data[y * gray.width + x] < 140) dark++;
    if (dark / 1150 > 0.55) last = y;
  }
  return last;
}

async function loadLayout(pdfPath, grays) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data, verbosity: 0 }).promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const vp = page.getViewport({ scale: SCALE });
    const tc = await page.getTextContent();
    const gray = grays[p - 1];
    const divider = detectDivider(gray);
    const splitX = Math.round((divider.start + divider.end) / 2);
    const items = tc.items
      .map((it) => {
        const [, , , , tx, ty] = pdfjsLib.Util.transform(vp.transform, it.transform);
        return {
          str: it.str,
          x: Math.round(tx),
          y: Math.round(ty),
          w: Math.round((it.width || 0) * SCALE),
          h: Math.round((it.height || 10) * SCALE),
        };
      })
      .filter((i) => i.str.trim());
    const lines = [];
    for (const it of items) {
      const col = it.x < splitX ? 0 : 1;
      let line = lines.find((l) => l.col === col && Math.abs(l.y - it.y) < 16);
      if (!line) {
        line = { col, y: it.y, x: it.x, items: [] };
        lines.push(line);
      }
      line.x = Math.min(line.x, it.x);
      line.items.push(it);
    }
    for (const l of lines) {
      l.items.sort((a, b) => a.x - b.x);
      l.text = l.items.map((i) => i.str).join('');
    }
    lines.sort((a, b) => a.col - b.col || a.y - b.y);
    pages.push({
      page: p - 1,
      width: Math.round(vp.width),
      height: Math.round(vp.height),
      lines,
      items,
      divider,
      splitX,
      boxBottom: p === 1 ? findHeaderBoxBottom(gray) : 0,
    });
  }
  return pages;
}

function findQuestions(pages) {
  const questions = {};
  let cp = 0;
  let cc = 0;
  let cy = -1;
  for (let q = 1; q <= 25; q++) {
    const re = new RegExp(`^${q}\\s*[.．]`);
    let hit = null;
    outer: for (let p = cp; p < pages.length; p++) {
      for (let c = p === cp ? cc : 0; c <= 1; c++) {
        for (const l of pages[p].lines) {
          if (l.col !== c) continue;
          if (p === cp && c === cc && l.y <= cy) continue;
          if (p === 0 && c === 0 && l.y < pages[0].boxBottom + 10) continue;
          if (p === 0 && c === 1 && l.y < Math.min(1150, pages[0].boxBottom)) continue;
          const lim = c === 0 ? 280 : pages[p].splitX + 280;
          const num = l.items.find((i) => re.test(i.str.trim()));
          if (num && num.x < lim && l.items[0] === num) {
            hit = { page: p, col: c, x: num.x, y: num.y, text: l.text.trim() };
            break outer;
          }
          if (re.test(l.text.trim()) && l.x < lim) {
            hit = { page: p, col: c, x: l.x, y: l.y, text: l.text.trim() };
            break outer;
          }
        }
      }
    }
    if (!hit) throw new Error(`question ${q} not found in layout`);
    questions[q] = hit;
    cp = hit.page;
    cc = hit.col;
    cy = hit.y;
  }
  return questions;
}

function findHeaders(pages) {
  const headers = [];
  for (const pg of pages) {
    for (const l of pg.lines) {
      const t = l.text.trim();
      if (pg.page === 0 && l.col === 0 && l.y < pg.boxBottom + 10) continue;
      if (pg.page === 0 && l.col === 1 && l.y < 1100) continue;
      if (l.y > 3380) continue;
      if (HDR_RE.test(t)) headers.push({ page: pg.page, col: l.col, x: l.x, y: l.y, text: t });
    }
  }
  return headers;
}

async function extractTrimmedWebp(pageBuf, rect, outPath, pad = { t: 14, b: 14, l: 16, r: 16 }) {
  const safe = {
    left: Math.max(0, Math.round(rect.left)),
    top: Math.max(0, Math.round(rect.top)),
    width: Math.max(10, Math.round(rect.width)),
    height: Math.max(10, Math.round(rect.height)),
  };
  const extracted = await sharp(pageBuf).extract(safe).png().toBuffer();
  await sharp(extracted)
    .trim({ background: '#ffffff', threshold: 12 })
    .extend({ top: pad.t, bottom: pad.b, left: pad.l, right: pad.r, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .webp({ quality: 90 })
    .toFile(outPath);
}

function colRange(pg, col, key = '') {
  if (key === 'eng-g3') return col === 0 ? { x1: 115, x2: 1240 } : { x1: 1298, x2: 2448 };
  const d = pg.divider;
  return col === 0 ? { x1: 78, x2: d.start - 10 } : { x1: d.end + 10, x2: 2470 };
}

function computeCrops(cfg, pages, grays, questions, headers) {
  const crops = {};
  const isEng3 = cfg.key === 'eng-g3';
  const passageFirstQ = new Set(
    pages
      .flatMap((pg) => pg.lines.filter((l) => /請閱讀以下文章/.test(l.text)).map((l) => l.text))
      .map((t) => Number((t.match(/回答\s*(\d+)/) || [])[1]))
      .filter(Boolean)
  );
  for (let p = 0; p < pages.length; p++) {
    const gray = grays[p];
    const pg = pages[p];
    const footerLine = pg.lines.find((l) => l.y > 3300 && /基本學習內容|第\s*\d+\s*頁/.test(l.text));
    const footerLimit = footerLine ? footerLine.y - 34 : 3355;
    for (let col = 0; col <= 1; col++) {
      const { x1, x2 } = colRange(pg, col, cfg.key);
      const colQs = Object.entries(questions)
        .filter(([, q]) => q.page === p && q.col === col)
        .map(([n, q]) => ({ num: Number(n), ...q }))
        .sort((a, b) => a.y - b.y);
      const colHdrs = headers.filter((h) => h.page === p && h.col === col).sort((a, b) => a.y - b.y);

      for (let idx = 0; idx < colQs.length; idx++) {
        const cur = colQs[idx];
        const prevQ = idx > 0 ? colQs[idx - 1] : null;
        const nextQ = idx + 1 < colQs.length ? colQs[idx + 1] : null;
        let cropTop;
        let cropBottom;

        if (isEng3 && (cur.num <= 9 || (cur.num >= 17 && cur.num <= 21))) {
          const [t, b] = inkBlockAround(gray, cur.y - 10, x1, x2);
          cropTop = t - 4;
          cropBottom = b + 4;
        } else {
          let topFloor = p === 0 ? (col === 0 ? pg.boxBottom + 6 : 900) : 60;
          if (prevQ) {
            const gap = findWhiteGapSplit(gray, prevQ.y + 45, cur.y - 12, x1, x2, 18);
            topFloor = gap.mid ?? prevQ.y + 40;
          }
          const hdrAbove = colHdrs.filter((h) => h.y < cur.y - 20).pop();
          if (hdrAbove) topFloor = Math.max(topFloor, hdrAbove.y + 18);

          if (passageFirstQ.has(cur.num)) {
            const boxBottom = findLastInkAbove(gray, cur.y - 48, topFloor, x1, x2);
            cropTop = findFirstInkBelow(gray, boxBottom, cur.y - 2, x1, x2);
          } else {
            const startScan = cfg.key.startsWith('math-') ? cur.y - 68 : cur.y - 44;
            cropTop = findWhiteBandAbove(gray, startScan, topFloor, x1, x2, 14);
            cropTop = findFirstInkBelow(gray, cropTop, cur.y - 2, x1, x2);
          }

          let ceiling = footerLimit;
          if (nextQ) {
            const gap = findWhiteGapSplit(gray, cur.y + 45, nextQ.y - 14, x1, x2, 16);
            ceiling = gap.mid ?? nextQ.y - 48;
          }
          const hdrBelow = colHdrs.find((h) => h.y > cur.y + 30);
          if (hdrBelow) {
            const hg = findWhiteGapSplit(gray, cur.y + 35, hdrBelow.y - 44, x1, x2, 14);
            ceiling = Math.min(ceiling, hg.mid ?? hdrBelow.y - 52);
          }
          cropBottom = findLastInkAbove(gray, ceiling, cur.y + 15, x1, x2);
        }
        const hdrBelow = colHdrs.find((h) => h.y > cur.y + 30);
        const nextLimit = Math.min(nextQ ? nextQ.y - 75 : 3340, hdrBelow ? hdrBelow.y - 48 : 3340);
        crops[cur.num] = { page: p, col, x1, x2, top: cropTop, bottom: cropBottom, y: cur.y, x: cur.x, nextY: nextLimit };
      }
    }
  }
  return crops;
}

function optionLineBands(pg, crop) {
  const bands = [];
  for (const l of pg.lines) {
    if (l.col !== crop.col || l.y < crop.top || l.y > crop.bottom) continue;
    if (/^\(\s*1\s*\)/.test(l.text.trim())) {
      bands.push([l.y - 72, crop.bottom]);
      break;
    }
    if (/^\(\s*[1-4]\s*\)/.test(l.text.trim())) bands.push([l.y - 48, l.y + 26]);
  }
  return bands;
}

function uncoveredInkRows(gray, pg, crop, { maskOptionBands }) {
  const { x1, x2 } = crop;
  const top = Math.max(0, Math.round(crop.top));
  const bot = Math.min(gray.height - 1, Math.round(crop.bottom));
  const W = x2 - x1;
  const H = bot - top + 1;
  const mask = new Uint8Array(W * H);
  const clear = (ax, ay, bx, by) => {
    for (let y = Math.max(top, ay); y <= Math.min(bot, by); y++) {
      for (let x = Math.max(x1, ax); x < Math.min(x2, bx); x++) mask[(y - top) * W + (x - x1)] = 1;
    }
  };
  for (const it of pg.items) {
    const fs_ = it.h || 30;
    clear(it.x - 5, Math.round(it.y - fs_ * 1.0), it.x + it.w + 5, Math.round(it.y + fs_ * 0.3));
  }
  if (maskOptionBands) for (const [a, b] of optionLineBands(pg, crop)) clear(x1, a, x2, b);
  const rows = new Array(H).fill(0);
  const xmin = new Array(H).fill(1e9);
  const xmax = new Array(H).fill(-1);
  for (let y = 0; y < H; y++) {
    const off = (top + y) * gray.width;
    for (let x = 0; x < W; x++) {
      if (mask[y * W + x]) continue;
      if (gray.data[off + x1 + x] < 235) {
        rows[y]++;
        if (x1 + x < xmin[y]) xmin[y] = x1 + x;
        if (x1 + x > xmax[y]) xmax[y] = x1 + x;
      }
    }
  }
  return { rows, xmin, xmax, top };
}

function clusterRows({ rows, xmin, xmax, top }, minRowInk = 2, maxGap = 26) {
  const clusters = [];
  let cur = null;
  for (let y = 0; y < rows.length; y++) {
    if (rows[y] >= minRowInk) {
      if (cur && y - cur.y1 <= maxGap) {
        cur.y1 = y;
        cur.ink += rows[y];
        cur.x0 = Math.min(cur.x0, xmin[y]);
        cur.x1 = Math.max(cur.x1, xmax[y]);
      } else {
        if (cur) clusters.push(cur);
        cur = { y0: y, y1: y, ink: rows[y], x0: xmin[y], x1: xmax[y] };
      }
    }
  }
  if (cur) clusters.push(cur);
  return clusters.map((c) => ({ ...c, y0: c.y0 + top, y1: c.y1 + top, h: c.y1 - c.y0 + 1 }));
}

const NON_CAPTION_RE = /[？?。=＝]|請問|下列|哪個|何者|多少|算式|敘述|距離|圓周率/;
function figureRect(cfg, num, crop, pg, gray, { forceMinH } = {}) {
  const ov = FIG_OVERRIDES[cfg.key]?.[num];
  if (ov) return { top: crop.y + ov.top, bottom: crop.y + ov.bottom, x1: crop.x1, x2: crop.x2 };
  const colLines = pg.lines.filter((l) => l.col === crop.col && l.y >= crop.top && l.y <= crop.bottom);

  // Visual option questions in Year 110 Math where options themselves are figures/tables/scale bars
  if (
    (cfg.key === 'math-g4' && num === 17) ||
    (cfg.key === 'math-g6' && (num === 8 || num === 25))
  ) {
    const opt1Line = colLines.find((l) => /^\(\s*1\s*\)/.test(l.text.trim()) || l.text.includes('(1)'));
    const top = opt1Line ? Math.max(crop.top, opt1Line.y - 52) : crop.y + 40;
    return { top, bottom: crop.bottom, x1: crop.x1, x2: crop.x2 };
  }
  if (cfg.key === 'math-g3' && num === 25) {
    const opt1Line = colLines.find((l) => l.text.includes('(1)'));
    const top = findFirstInkBelow(gray, crop.y + 20, crop.bottom - 40, crop.x1, crop.x2);
    const bot = opt1Line ? findLastInkAbove(gray, opt1Line.y - 44, top + 20, crop.x1, crop.x2) : crop.bottom;
    return { top, bottom: bot, x1: crop.x1, x2: crop.x2 };
  }

  // English structural figure cropping
  if (cfg.subject === 'english') {
    const colW = crop.x2 - crop.x1;
    if (cfg.key === 'eng-g3' && num >= 14 && num <= 16) {
      const left = Math.max(crop.x1 + 50, crop.x + 48);
      const top = findFirstInkBelow(gray, crop.top + 10, crop.bottom - 20, left, crop.x2);
      return { top, bottom: crop.bottom, x1: left, x2: crop.x2 };
    }
    const opt1Line = colLines.find((l) => l.text.includes('(1)'));
    const opt1Item = opt1Line?.items?.find((it) => it.str.includes('(1)'));
    if (num >= 4 && num <= 10) {
      const left = Math.max(crop.x1 + 60, crop.x + 56);
      const top = findFirstInkBelow(gray, crop.top, crop.bottom - 20, left, crop.x2);
      return { top, bottom: crop.bottom, x1: left, x2: crop.x2 };
    }
    if (num >= 11 && num <= 17) {
      const left = Math.min(crop.x1 + 140, crop.x + 56);
      const right = opt1Item ? Math.min(crop.x2, opt1Item.x - 24) : crop.x1 + Math.round(colW * 0.48);
      return { top: crop.top, bottom: crop.bottom, x1: left, x2: Math.max(left + 80, right) };
    }
    if (num >= 18 && num <= 22 && cfg.key !== 'eng-g6') {
      const top = opt1Line ? opt1Line.y - 42 : crop.y + 85;
      return { top, bottom: crop.bottom, x1: crop.x1 + 60, x2: crop.x2 };
    }
    if ((cfg.key === 'eng-g6' && num >= 21) || (cfg.key !== 'eng-g6' && num >= 23)) {
      const left = Math.min(crop.x1 + 140, crop.x + 56);
      const right = opt1Item ? Math.min(crop.x2, opt1Item.x - 24) : crop.x1 + Math.round(colW * 0.45);
      return { top: crop.top, bottom: crop.bottom, x1: left, x2: Math.max(left + 80, right) };
    }
    return null;
  }

  const info = uncoveredInkRows(gray, pg, crop, { maskOptionBands: true });
  const minH = forceMinH ?? 30;
  const clusters = clusterRows(info).filter((c) => c.h >= minH && c.ink >= 150);
  if (clusters.length === 0) return null;
  let y0 = Math.min(...clusters.map((c) => c.y0));
  let y1 = Math.max(...clusters.map((c) => c.y1));

  const lines = pg.lines.filter((l) => l.col === crop.col && l.y > crop.y + 12 && l.y < crop.bottom + 5);
  const bands = optionLineBands(pg, crop);
  let grew = true;
  while (grew) {
    grew = false;
    for (const l of lines) {
      const t = l.text.trim();
      if (/^\(\s*[1-4]\s*\)/.test(t) || NON_CAPTION_RE.test(t)) continue;
      if ((/[：:]/.test(t) && !/單位/.test(t)) || t.length > 18) continue;
      if (bands.some(([a, b]) => l.y >= a && l.y <= b)) continue;
      const lt = l.y - (l.items[0]?.h || 34) - 10;
      const lb = l.y + 18;
      if (lb < y0 + 16 && lb < y1 && y0 - lb <= 70 && lt > crop.y + 8) {
        y0 = Math.min(y0, lt);
        grew = true;
      } else if (lt > y1 - 16 && lb > y1 + 2 && lt - y1 <= 70) {
        y1 = Math.max(y1, lb);
        grew = true;
      }
    }
  }
  const pad = 20;
  return { top: y0 - pad, bottom: y1 + pad, x1: crop.x1, x2: crop.x2 };
}

function textInRect(pg, col, top, bottom) {
  const lines = pg.lines.filter((l) => l.col === col && l.y >= top && l.y <= bottom);
  return lines.map((l) => l.text.trim()).filter(Boolean);
}
function splitQuestionText(lines, num) {
  const joined = lines.join(' ').replace(new RegExp(`^${num}\\s*[.．]\\s*`), '');
  const parts = joined.split(/\(\s*([1-4])\s*\)/);
  const stem = parts[0].trim();
  const options = [];
  for (let i = 1; i < parts.length; i += 2) options.push((parts[i + 1] || '').trim());
  return { stem, options };
}

// ───────────────────────────── answer extraction ─────────────────────────────
async function extractMathAnswers(cfg) {
  const pdfPath = path.join(SRC_DIR, cfg.ans);
  const bufs = await renderPdf(pdfPath);
  const grays = await Promise.all(bufs.map(decodePage));
  const rgbs = await Promise.all(bufs.map(decodePageRgb));
  const pages = await loadLayout(pdfPath, grays);
  const qs = findQuestions(pages);
  const answers = [];
  for (let q = 1; q <= 25; q++) {
    const cur = qs[q];
    const pg = pages[cur.page];
    const next = Object.entries(qs)
      .map(([n, v]) => ({ n: Number(n), ...v }))
      .filter((v) => v.page === cur.page && v.col === cur.col && v.y > cur.y)
      .sort((a, b) => a.y - b.y)[0];
    const yEnd = next ? next.y - 16 : 3520;
    const qLines = pg.lines.filter((l) => l.col === cur.col && l.y > cur.y - 10 && l.y < yEnd);
    const rgb = rgbs[cur.page];
    const scoreByOpt = { 1: 0, 2: 0, 3: 0, 4: 0 };

    for (const line of qLines) {
      for (let idx = 0; idx < line.items.length; idx++) {
        const it = line.items[idx];
        const s = it.str.trim();
        let n = null;
        let xStart = it.x - 4;
        let xEnd = it.x + Math.min(it.w + 8, 90);
        const mSingle = s.match(/^\(\s*([1-4])\s*\)/);
        if (mSingle) {
          n = Number(mSingle[1]);
        } else if (s === '(' && idx + 2 < line.items.length && /^[1-4]$/.test(line.items[idx + 1].str.trim()) && line.items[idx + 2].str.trim().startsWith(')')) {
          n = Number(line.items[idx + 1].str.trim());
          xStart = it.x - 4;
          xEnd = line.items[idx + 2].x + 26;
        } else if (/^\(\s*[1-4]$/.test(s) && idx + 1 < line.items.length && line.items[idx + 1].str.trim().startsWith(')')) {
          n = Number(s.replace(/\D/g, ''));
          xEnd = line.items[idx + 1].x + 26;
        }
        if (!n) continue;
        let c = 0;
        for (let y = Math.max(0, it.y - Math.max(24, it.h)); y <= Math.min(rgb.height - 1, it.y + 14); y++) {
          for (let x = Math.max(0, xStart); x < Math.min(rgb.width, xEnd); x++) {
            const o = (y * rgb.width + x) * rgb.ch;
            const r = rgb.data[o];
            const g = rgb.data[o + 1];
            const b = rgb.data[o + 2];
            if (r > 155 && r - g > 55 && r - b > 55) c++;
          }
        }
        if (c > scoreByOpt[n]) scoreByOpt[n] = c;
      }
    }
    const counts = [1, 2, 3, 4].map((n) => ({ n, c: scoreByOpt[n] }));
    const maxC = Math.max(...counts.map((r) => r.c));
    const red = counts.filter((r) => r.c >= Math.max(70, maxC * 0.55));
    if (red.length !== 1) throw new Error(`${cfg.key} q${q}: expected exactly 1 red option, got ${JSON.stringify(counts)}`);
    answers.push(red[0].n - 1);
  }
  return { answers };
}

async function extractChineseAnswers(cfg) {
  const pdfPath = path.join(SRC_DIR, cfg.ans);
  const bufs = await renderPdf(pdfPath);
  const grays = await Promise.all(bufs.map(decodePage));
  const pages = await loadLayout(pdfPath, grays);
  const answers = [];
  let cp = 0;
  let cc = 0;
  let cy = -1;
  for (let q = 1; q <= 25; q++) {
    let found = null;
    outer: for (let p = cp; p < pages.length; p++) {
      for (let c = p === cp ? cc : 0; c <= 1; c++) {
        for (const l of pages[p].lines) {
          if (l.col !== c) continue;
          if (p === cp && c === cc && l.y <= cy) continue;
          if (p === 0 && c === 0 && l.y < pages[0].boxBottom + 10) continue;
          const numIdx = l.items.findIndex((i) => new RegExp(`^${q}\\s*[.．]`).test(i.str.trim()));
          if (numIdx < 0) continue;
          const numItem = l.items[numIdx];
          if (numItem.x > (c === 0 ? 280 : pages[p].splitX + 280)) continue;
          const before = l.items.slice(0, numIdx).filter((i) => /^[1-4]$/.test(i.str.trim()));
          let ans = before.length ? Number(before[before.length - 1].str.trim()) : null;
          if (ans === null) {
            const m = numItem.str.trim().match(new RegExp(`^([1-4])${q}\\s*[.．]`));
            if (m) ans = Number(m[1]);
          }
          if (ans === null) {
            const above = pages[p].items
              .filter(
                (i) =>
                  (i.x < pages[p].splitX ? 0 : 1) === c &&
                  /^[1-4]$/.test(i.str.trim()) &&
                  i.x >= (c === 0 ? 0 : pages[p].splitX) &&
                  i.x < numItem.x - 8 &&
                  i.y >= numItem.y - 110 &&
                  i.y <= numItem.y + 110
              )
              .sort((a, b) => Math.abs(a.y - numItem.y) - Math.abs(b.y - numItem.y));
            if (above.length) ans = Number(above[0].str.trim());
          }
          if (ans !== null) {
            found = { p, c, y: numItem.y, ans };
            break outer;
          }
        }
      }
    }
    if (!found) throw new Error(`${cfg.key}: answer digit for q${q} not found`);
    answers.push(found.ans - 1);
    cp = found.p;
    cc = found.c;
    cy = found.y;
  }
  return { answers };
}

async function rawCheckGlyphItems(pdfPath, pageNo) {
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(fs.readFileSync(pdfPath)), verbosity: 0 }).promise;
  const page = await doc.getPage(pageNo);
  const vp = page.getViewport({ scale: SCALE });
  const tc = await page.getTextContent();
  return tc.items
    .filter((it) => it.str.includes('\uF050'))
    .map((it) => {
      const [, , , , tx, ty] = pdfjsLib.Util.transform(vp.transform, it.transform);
      return { x: Math.round(tx), y: Math.round(ty) };
    });
}

async function extractEnglishAnswers(cfg) {
  const pdfPath = path.join(SRC_DIR, cfg.ans);
  const bufs = await renderPdf(pdfPath);
  const grays = await Promise.all(bufs.map(decodePage));
  const pages = await loadLayout(pdfPath, grays);
  if (cfg.key !== 'eng-g3') {
    const answers = [];
    let cp = 0;
    let cc = 0;
    let cy = -1;
    for (let q = 1; q <= 25; q++) {
      let found = null;
      outer: for (let p = cp; p < pages.length; p++) {
        for (let c = p === cp ? cc : 0; c <= 1; c++) {
          for (const l of pages[p].lines) {
            if (l.col !== c) continue;
            if (p === cp && c === cc && l.y <= cy) continue;
            if (p === 0 && c === 0 && l.y < pages[0].boxBottom + 10) continue;
            const numIdx = l.items.findIndex((i) => new RegExp(`^${q}\\s*[.．]$`).test(i.str.trim()));
            if (numIdx < 0) continue;
            const numItem = l.items[numIdx];
            if (numItem.x > (c === 0 ? 280 : pages[p].splitX + 280)) continue;
            const pre = l.items
              .slice(0, numIdx)
              .map((i) => i.str.trim())
              .join('');
            const m = pre.match(/^\(?([1-3])\)?$/);
            if (m) {
              found = { p, c, y: numItem.y, ans: Number(m[1]) };
              break outer;
            }
          }
        }
      }
      if (!found) throw new Error(`${cfg.key}: answer for q${q} not found`);
      answers.push(found.ans - 1);
      cp = found.p;
      cc = found.c;
      cy = found.y;
    }
    return { answers };
  }

  // Year 110 G3: Q1-Q9 are alphabet-pair at bottom of Page 1; Q10-Q25 are checkmark glyphs on Page 2
  const answers = [];
  const p1 = pages[0];
  const txt = p1.items
    .filter((i) => i.y > 3050)
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((i) => i.str)
    .join(' ');
  const letters = {};
  for (const m of txt.matchAll(/(\d{1,2})\s*\.\s*\(\s*([A-Za-z])\s*,\s*([A-Za-z])\s*\)/g)) {
    letters[Number(m[1])] = `${m[2]}, ${m[3]}`;
  }
  for (let q = 1; q <= 9; q++) {
    if (!letters[q]) throw new Error(`eng-g3 q${q} letter key not found (txt=${txt})`);
    answers.push(letters[q]);
  }
  const p2 = pages[1];
  const rawItems = await rawCheckGlyphItems(pdfPath, 2);
  for (let q = 10; q <= 25; q++) {
    const num = p2.items.find((i) => new RegExp(`^${q}\\s*[.．]$`).test(i.str.trim()));
    if (!num) throw new Error(`eng-g3 q${q} number not found on answer page`);
    const maxDy = q >= 14 && q <= 16 ? 120 : 45;
    const sameCol = (x) => (x < p2.splitX) === (num.x < p2.splitX);
    const labels = p2.items
      .filter((i) => /^\(\s*[1-3]\s*\)$/.test(i.str.trim()) && i.y >= num.y - 20 && i.y < num.y + maxDy + 160 && sameCol(i.x))
      .map((i) => ({ n: Number(i.str.replace(/\D/g, '')), x: i.x, y: i.y }));
    const checks = rawItems.filter((c) => c.y >= num.y - 25 && c.y <= num.y + maxDy && Math.abs(c.x - num.x) > 40 && sameCol(c.x));
    const picked = new Set();
    for (const c of checks) {
      const cand = labels.filter((l) => l.x > c.x - 30 && l.x - c.x < 180).sort((a, b) => a.x - b.x)[0];
      if (cand) picked.add(cand.n);
    }
    if (picked.size !== 1) throw new Error(`eng-g3 q${q}: expected one check mark, got ${[...picked]} (checks=${checks.length})`);
    answers.push([...picked][0] - 1);
  }
  return { answers };
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
      .resize(CELL_W - 12, CELL_H - LABEL_H - 12, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
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
  await sharp({ create: { width: SHEET_W, height: SHEET_H, channels: 4, background: { r: 241, g: 245, b: 249, alpha: 1 } } })
    .composite(composites)
    .png()
    .toFile(sheetPath);
}

const SPEC = {};

async function buildPaper(cfg) {
  const { key } = cfg;
  const pdfPath = path.join(SRC_DIR, cfg.pdf);
  const ansPdfPath = path.join(SRC_DIR, cfg.ans);
  const outDir = path.join(ROOT, 'public', 'assets', 'priori', '110', key);
  const pubBase = `/assets/priori/110/${key}`;
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(ORIG_DIR, { recursive: true });
  for (const f of fs.readdirSync(outDir)) if (f.endsWith('.webp')) fs.unlinkSync(path.join(outDir, f));

  // Copy A3 original student & answer PDFs
  fs.copyFileSync(pdfPath, path.join(ORIG_DIR, `${cfg.paperId}-student.pdf`));
  fs.copyFileSync(ansPdfPath, path.join(ORIG_DIR, `${cfg.paperId}-answer.pdf`));

  const bufs = await renderPdf(pdfPath);
  const grays = await Promise.all(bufs.map(decodePage));
  const pages = await loadLayout(pdfPath, grays);
  const questions = findQuestions(pages);
  const headers = findHeaders(pages);
  const crops = computeCrops(cfg, pages, grays, questions, headers);

  const tiles = [];
  const warnings = [];
  const qSpecs = [];

  let ansRes;
  if (cfg.subject === 'math') ansRes = await extractMathAnswers(cfg);
  else if (cfg.subject === 'chinese') ansRes = await extractChineseAnswers(cfg);
  else ansRes = await extractEnglishAnswers(cfg);

  const figSet = new Set(cfg.subject === 'math' ? MATH_FIG_QUESTIONS[key] : cfg.subject === 'chinese' ? CHI_FIG_QUESTIONS[key] : []);

  for (let num = 1; num <= 25; num++) {
    const c = crops[num];
    const pg = pages[c.page];
    const gray = grays[c.page];
    const qName = `q${String(num).padStart(2, '0')}.webp`;
    const qPath = path.join(outDir, qName);
    await extractTrimmedWebp(bufs[c.page], { left: c.x1, top: c.top, width: c.x2 - c.x1, height: c.bottom - c.top }, qPath);
    tiles.push({ name: qName, outPath: qPath });

    let wantFig = false;
    if (cfg.subject === 'english') {
      if (key === 'eng-g3') wantFig = num >= 14 && num <= 16;
      else if (key === 'eng-g6') wantFig = (num >= 4 && num <= 17) || num >= 21;
      else wantFig = num >= 4;
    } else wantFig = figSet.has(num);

    let figureImage = null;
    if (wantFig) {
      const autoRect = figureRect(cfg, num, c, pg, gray);
      if (!autoRect) {
        warnings.push(`q${num}: figure expected but none detected`);
      } else {
        const figName = `q${String(num).padStart(2, '0')}_fig.webp`;
        const figPath = path.join(outDir, figName);
        await extractTrimmedWebp(
          bufs[c.page],
          { left: autoRect.x1, top: autoRect.top, width: autoRect.x2 - autoRect.x1, height: autoRect.bottom - autoRect.top },
          figPath
        );
        tiles.push({ name: figName, outPath: figPath });
        figureImage = `${pubBase}/${figName}`;
      }
    }

    const lines = textInRect(pg, c.col, c.y - 8, c.bottom);
    const { stem, options } = splitQuestionText(lines, num);
    qSpecs.push({
      number: num,
      questionImage: `${pubBase}/${qName}`,
      hasFigure: Boolean(figureImage),
      figureImage,
      text: stem,
      options,
      answer: ansRes.answers[num - 1],
      audioSrc: null,
      groupId: null,
      passageImage: null,
    });
  }

  // Question typing & official MP3 attachment (Year 110 G3: Q1-21 have MP3, Q22-25 reading no MP3)
  const nAudio = key === 'eng-g3' ? 21 : cfg.subject === 'english' ? 10 : 0;
  for (const q of qSpecs) {
    q.questionType = 'single-choice';
    if (q.number <= nAudio) q.audioSrc = `/audio/priori/110/eng-g${cfg.grade}/q${String(q.number).padStart(2, '0')}.mp3`;
    if (key === 'eng-g3') {
      if (q.number <= 9) {
        q.questionType = 'alphabet-pair';
        const [u, l] = q.answer.split(', ');
        q.expectedUpper = u;
        q.expectedLower = l;
        q.options = [];
      } else if (q.number >= 17 && q.number <= 21) {
        q.options = ['O', 'X'];
      } else if (q.number >= 14 && q.number <= 16) {
        q.options = ['(1)', '(2)', '(3)'];
      }
    }
  }

  // Chinese reading passages
  const passages = [];
  if (cfg.subject === 'chinese') {
    const hdrs = [];
    for (const pg of pages) {
      for (const l of pg.lines) {
        const m = l.text.match(/請閱讀以下文章.*回答\s*(\d+)\s*[〜~～—-]\s*(\d+)\s*題/);
        if (m) hdrs.push({ page: pg.page, col: l.col, y: l.y, x: l.x, first: Number(m[1]), last: Number(m[2]) });
      }
    }
    let gi = 0;
    for (const h of hdrs) {
      gi += 1;
      const pg = pages[h.page];
      const gray = grays[h.page];
      const { x1, x2 } = colRange(pg, h.col);
      const q1 = questions[h.first];
      const footerLine = pg.lines.find((l) => l.y > 3300 && /基本學習內容|第\s*\d+\s*頁/.test(l.text));
      const footerLimit = footerLine ? footerLine.y - 34 : 3355;
      // Passage may be in the same column above q1 OR at the bottom of the column when q1 is in the next column/page
      const sameColQ1 = q1 && q1.page === h.page && q1.col === h.col;
      const topY = findFirstInkBelow(gray, h.y + 18, sameColQ1 ? q1.y - 80 : footerLimit - 80, x1, x2);
      const botCeiling = sameColQ1 ? q1.y - 48 : footerLimit;
      const botY = findLastInkAbove(gray, botCeiling, topY + 60, x1, x2);
      const name = `passage_${String(h.first).padStart(2, '0')}_${String(h.last).padStart(2, '0')}.webp`;
      const pPath = path.join(outDir, name);
      await extractTrimmedWebp(bufs[h.page], { left: x1, top: topY, width: x2 - x1, height: botY - topY }, pPath);
      tiles.push({ name, outPath: pPath });
      const extractedText = pg.lines
        .filter((l) => l.col === h.col && l.y > topY + 5 && l.y < botY)
        .map((l) => l.text.trim())
        .filter(Boolean)
        .join('\n');
      const groupId = `chi-110-g${cfg.grade}-g${gi}`;
      passages.push({ groupId, firstQ: h.first, lastQ: h.last, image: `${pubBase}/${name}`, extractedText });
      for (const q of qSpecs) {
        if (q.number >= h.first && q.number <= h.last) {
          q.groupId = groupId;
          q.passageImage = `${pubBase}/${name}`;
        }
      }
    }
  }

  const sheetPath = path.join(SHEET_DIR, `${key}.png`);
  await generateContactSheet(tiles, sheetPath, cfg.accent);
  console.log(`  ✓ [${key}] ${tiles.length} WebPs, answers=${JSON.stringify(ansRes.answers)} -> ${path.relative(ROOT, sheetPath)}`);
  for (const w of warnings) console.log(`    ⚠ ${w}`);

  SPEC[cfg.paperId] = {
    paperId: cfg.paperId,
    year: 110,
    subject: cfg.subject,
    grade: cfg.grade,
    answerSource: 'official_pdf',
    answerPdf: cfg.ans,
    sourcePdf: cfg.pdf,
    answers: ansRes.answers,
    questions: qSpecs,
    passages,
  };
}

// ───────────────────────────── Year 110 Audio ─────────────────────────────
const ENG_G3_D16_TRIPLETS = [
  [5, 7], [8, 10], [11, 13], [14, 16], [17, 19], [20, 22], [23, 25], [26, 28], [29, 31], // Q1-Q9
  [36, 38], [39, 41], [42, 44], [45, 47], // Q10-Q13
  [49, 51], [52, 54], [55, 57], // Q14-Q16
  [65, 67], [68, 70], [71, 73], [74, 76], [77, 79], // Q17-Q21
];
const ENG_G4_6_TRIPLETS = [
  [3, 5], [6, 8], [9, 11], [13, 15], [16, 18], [19, 21], [23, 25], [26, 28], [29, 31], [32, 34],
];
const AUDIO_SRC = (g) => `11005_英語篩選測驗${g}年級紙本聽力檔.mp3`;

function detectMp3Segments(mp3Path, noise = '-35dB', d = 1.6) {
  const res = spawnSync(ffmpeg, ['-i', mp3Path, '-af', `silencedetect=noise=${noise}:d=${d}`, '-f', 'null', '-'], {
    encoding: 'utf8',
    maxBuffer: 1 << 28,
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

function sliceWindow(srcMp3, outPath, start, end) {
  const dur = Math.max(0.5, end - start);
  const fadeOutStart = Math.max(0.2, dur - 0.15).toFixed(2);
  const res = spawnSync(
    ffmpeg,
    [
      '-y', '-ss', start.toFixed(3), '-to', end.toFixed(3), '-i', srcMp3,
      '-af', `afade=t=in:ss=0:d=0.1,afade=t=out:st=${fadeOutStart}:d=0.1,silenceremove=stop_periods=-1:stop_duration=1.1:stop_threshold=-38dB:stop_silence=0.8`,
      '-vn', '-map_metadata', '-1', '-ar', '44100', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '96k', outPath,
    ],
    { encoding: 'utf8' }
  );
  if (res.status !== 0) throw new Error(`ffmpeg failed on ${outPath}: ${res.stderr}`);
}

function sliceAudioGrade3() {
  const srcMp3 = path.join(SRC_DIR, AUDIO_SRC(3));
  const outDir = path.join(ROOT, 'public', 'audio', 'priori', '110', 'eng-g3');
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of fs.readdirSync(outDir)) if (f.endsWith('.mp3')) fs.unlinkSync(path.join(outDir, f));
  const segs16 = detectMp3Segments(srcMp3, '-35dB', 1.6);
  const windows = [];
  for (const [sIdx, eIdx] of ENG_G3_D16_TRIPLETS) {
    if (!segs16[sIdx] || !segs16[eIdx]) throw new Error(`eng-g3 d=1.6 missing ${sIdx}/${eIdx}`);
    windows.push([Math.max(0, segs16[sIdx].start - 0.15), segs16[eIdx].end + 0.2]);
  }
  const summary = [];
  windows.forEach(([start, end], i) => {
    const fname = `q${String(i + 1).padStart(2, '0')}.mp3`;
    const outPath = path.join(outDir, fname);
    sliceWindow(srcMp3, outPath, start, end);
    summary.push(`${fname}:${getMp3Duration(outPath).toFixed(1)}s`);
  });
  console.log(`  ✓ [audio eng-g3] ${summary.length} clips ${summary.join(', ')}`);
}

function sliceAudioGrade(grade, triplets) {
  const srcMp3 = path.join(SRC_DIR, AUDIO_SRC(grade));
  const outDir = path.join(ROOT, 'public', 'audio', 'priori', '110', `eng-g${grade}`);
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of fs.readdirSync(outDir)) if (f.endsWith('.mp3')) fs.unlinkSync(path.join(outDir, f));
  const segs = detectMp3Segments(srcMp3);
  const summary = [];
  triplets.forEach(([sIdx, eIdx], i) => {
    if (!segs[sIdx] || !segs[eIdx]) throw new Error(`eng-g${grade} q${i + 1}: segment ${sIdx}/${eIdx} missing (have ${segs.length})`);
    const fname = `q${String(i + 1).padStart(2, '0')}.mp3`;
    const outPath = path.join(outDir, fname);
    sliceWindow(srcMp3, outPath, Math.max(0, segs[sIdx].start - 0.15), segs[eIdx].end + 0.2);
    summary.push(`${fname}:${getMp3Duration(outPath).toFixed(1)}s`);
  });
  console.log(`  ✓ [audio eng-g${grade}] ${summary.length} clips (${segs.length} segs) ${summary.join(', ')}`);
}

function shannonEntropy(hist, total) {
  let h = 0;
  for (const c of hist) if (c) h -= (c / total) * Math.log2(c / total);
  return h;
}

async function verifyAll() {
  const failures = [];
  let nWebp = 0;
  let nMp3 = 0;
  const base = path.join(ROOT, 'public', 'assets', 'priori', '110');
  for (const dir of fs.existsSync(base) ? fs.readdirSync(base) : []) {
    for (const f of fs.readdirSync(path.join(base, dir))) {
      if (!f.endsWith('.webp')) continue;
      nWebp++;
      const full = path.join(base, dir, f);
      const st = fs.statSync(full);
      const { data, info } = await sharp(full).greyscale().raw().toBuffer({ resolveWithObject: true });
      const hist = new Uint32Array(256);
      let nonWhite = 0;
      for (let i = 0; i < data.length; i++) {
        hist[data[i]]++;
        if (data[i] < 245) nonWhite++;
      }
      const nwr = nonWhite / data.length;
      const ent = shannonEntropy(hist, data.length);
      const relName = `${dir}/${f}`;
      const minSize = relName === 'math-g3/q22_fig.webp' ? 280 : 800;
      if (st.size <= minSize || nwr < 0.012 || ent < 0.2 || info.width < 60 || info.height < 40) {
        failures.push(`${relName}: size=${st.size} ${info.width}x${info.height} nonWhite=${nwr.toFixed(4)} entropy=${ent.toFixed(3)}`);
      }
    }
  }
  const abase = path.join(ROOT, 'public', 'audio', 'priori', '110');
  for (const dir of fs.existsSync(abase) ? fs.readdirSync(abase) : []) {
    for (const f of fs.readdirSync(path.join(abase, dir))) {
      if (!f.endsWith('.mp3')) continue;
      nMp3++;
      const st = fs.statSync(path.join(abase, dir, f));
      if (st.size <= 15000) failures.push(`${dir}/${f}: mp3 too small ${st.size}`);
    }
  }
  console.log(`\nVerification: ${nWebp} WebPs, ${nMp3} MP3s checked, ${failures.length} failures`);
  for (const f of failures) console.log('  ✗', f);
  return { nWebp, nMp3, failures };
}

async function main() {
  console.log('=== Year 110 Priori Asset Pipeline Start ===');
  fs.mkdirSync(path.join(ROOT, 'tmp'), { recursive: true });
  const cfgs = paperCfgs().filter((c) => !ONLY.length || ONLY.includes(c.key));
  if (!flag('audio-only')) {
    if (fs.existsSync(SPEC_PATH) && ONLY.length) Object.assign(SPEC, JSON.parse(fs.readFileSync(SPEC_PATH, 'utf8')));
    for (const cfg of cfgs) await buildPaper(cfg);
    const ordered = {};
    for (const c of paperCfgs()) if (SPEC[c.paperId]) ordered[c.paperId] = SPEC[c.paperId];
    fs.writeFileSync(SPEC_PATH, JSON.stringify(ordered, null, 2));
    console.log(`  ✓ spec -> ${path.relative(ROOT, SPEC_PATH)}`);
  }
  if (!flag('skip-audio')) {
    console.log('\n=== Slicing Year 110 English Audio ===');
    sliceAudioGrade3();
    for (const g of [4, 5, 6]) sliceAudioGrade(g, ENG_G4_6_TRIPLETS);
  }
  const res = await verifyAll();
  if (res.failures.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
