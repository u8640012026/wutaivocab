import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { PDFParse } from 'pdf-parse';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import ffmpegStatic from 'ffmpeg-static';

const SOURCE_DIR = path.resolve('PRIORI/114篩選測驗');
const ASSET_ROOT = path.resolve('public/assets/priori/114');
const AUDIO_ROOT = path.resolve('public/audio/priori/114');
const SHEET_DIR = path.resolve('tmp/114_sheets');

const SCALE = 3;

const PAPERS = [
  {
    key: 'math-g4',
    pdf: '114年篩選測驗數學科4年級試卷.pdf',
    subject: 'math',
    grade: 4,
    accent: '#0f766e',
    mathFigures: [2, 7, 8, 9, 13, 17, 20, 22, 23, 24],
    mathOptionFigures: [],
  },
  {
    key: 'math-g5',
    pdf: '114年篩選測驗數學科5年級試卷.pdf',
    subject: 'math',
    grade: 5,
    accent: '#0f766e',
    mathFigures: [1, 2, 10, 22, 25],
    mathOptionFigures: [13],
  },
  {
    key: 'math-g6',
    pdf: '114年篩選測驗數學科6年級試卷.pdf',
    subject: 'math',
    grade: 6,
    accent: '#0f766e',
    mathFigures: [3, 7, 23],
    mathOptionFigures: [17],
  },
  {
    key: 'chi-g4',
    pdf: '114年篩選測驗國語科4年級試卷.pdf',
    subject: 'chinese',
    grade: 4,
    accent: '#b45309',
    passages: [
      { name: 'passage_20_22.webp', page: 2, col: 'L', topHint: 245, beforeQ: 20 },
      { name: 'passage_23_25.webp', page: 2, col: 'R', topHint: 145, beforeQ: 23 },
    ],
  },
  {
    key: 'chi-g5',
    pdf: '114年篩選測驗國語科5年級試卷.pdf',
    subject: 'chinese',
    grade: 5,
    accent: '#b45309',
    passages: [
      { name: 'passage_18_20.webp', page: 2, col: 'L', topHint: 245, beforeQ: 18 },
      { name: 'passage_21_23.webp', page: 2, col: 'R', topHint: 145, beforeQ: 21 },
      { name: 'passage_24_25.webp', page: 3, col: 'L', topHint: 145, beforeQ: 24 },
    ],
  },
  {
    key: 'chi-g6',
    pdf: '114年篩選測驗國語科6年級試卷.pdf',
    subject: 'chinese',
    grade: 6,
    accent: '#b45309',
    passages: [
      { name: 'passage_18_20.webp', page: 2, col: 'L', topHint: 245, beforeQ: 18 },
      { name: 'passage_21_23.webp', page: 2, col: 'R', topHint: 145, beforeQ: 21 },
      { name: 'passage_24_25.webp', page: 3, col: 'L', topHint: 145, beforeQ: 24 },
    ],
  },
  {
    key: 'eng-g4',
    pdf: '114年篩選測驗英語科4年級試卷.pdf',
    mp3: '114年篩選測驗英語科4年級試卷聽力檔.mp3',
    subject: 'english',
    grade: 4,
    accent: '#4f46e5',
    rowFigureQs: [4, 5, 6, 7, 8, 9, 10, 18, 19, 20, 21, 22],
    sideFigureQs: [11, 12, 13, 14, 15, 16, 17, 23, 24, 25],
  },
  {
    key: 'eng-g5',
    pdf: '114年篩選測驗英語科5年級試卷.pdf',
    mp3: '114年篩選測驗英語科5年級試卷聽力檔.mp3',
    subject: 'english',
    grade: 5,
    accent: '#4f46e5',
    rowFigureQs: [4, 5, 6, 7, 8, 9, 10, 18, 19, 20, 21, 22],
    sideFigureQs: [11, 12, 13, 14, 15, 16, 17, 23, 24, 25],
  },
  {
    key: 'eng-g6',
    pdf: '114年篩選測驗英語科6年級試卷.pdf',
    mp3: '114年篩選測驗英語科6年級試卷聽力檔.mp3',
    subject: 'english',
    grade: 6,
    accent: '#4f46e5',
    rowFigureQs: [4, 5, 6, 7, 8, 9, 10],
    sideFigureQs: [11, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25],
  },
];

async function extractPdfCoordinates(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data, verbosity: 0 }).promise;
  const markers = [];
  const headers = [];
  const opt1s = [];
  const textItems = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const vp = page.getViewport({ scale: SCALE });
    const tc = await page.getTextContent();
    for (const it of tc.items) {
      const str = (it.str || '').trim();
      if (!str) continue;
      const x = Math.round(it.transform[4] * SCALE);
      const y = Math.round(vp.height - it.transform[5] * SCALE);
      const col = x < vp.width * 0.5 ? 'L' : 'R';
      textItems.push({ page: p - 1, col, x, y, str, pw: Math.round(vp.width), ph: Math.round(vp.height) });

      const inColEdge = (x >= 70 && x <= 240) || (x >= 1255 && x <= 1430);
      if (inColEdge) {
        const m = str.match(
          /^(\d{1,2})\.(?:\s|$|下面|下列|請問|如圖|觀察|算算看|這|在|有|一|哪|下|黑熊|關於|根據|文章)/
        );
        if (m) {
          const num = Number(m[1]);
          if (num >= 1 && num <= 25 && !markers.some((k) => k.q === num)) {
            markers.push({ q: num, page: p - 1, col, x, y, pw: Math.round(vp.width), ph: Math.round(vp.height) });
          }
        }
      }
      if (
        (p > 1 || y > 1300) &&
        /^(一、|二、|三、|第一部分|第二部分|作答說明|請閱讀|第\s*\d+\s*頁)/.test(str) &&
        !/^(一、選擇題|第\s*\d+\s*頁)/.test(str)
      ) {
        headers.push({ page: p - 1, col, x, y, str });
      }
      if (/^\(1\)/.test(str)) {
        opt1s.push({ page: p - 1, col, x, y, str });
      }
    }
  }
  return { markers, headers, opt1s, textItems };
}

function getRowInkProfile(raw, width, height, channels, x0, x1) {
  const counts = new Int32Array(height);
  for (let y = 0; y < height; y++) {
    let c = 0;
    for (let x = x0; x < x1; x += 2) {
      const idx = (y * width + x) * channels;
      if (raw[idx] < 238 || raw[idx + 1] < 238 || raw[idx + 2] < 238) c++;
    }
    counts[y] = c;
  }
  return counts;
}

function snapWhiteGap(inkCounts, approxY, searchDown, maxDelta = 38) {
  let bestY = approxY;
  let minInk = Infinity;
  const lo = Math.max(20, approxY - (searchDown ? 12 : maxDelta));
  const hi = Math.min(inkCounts.length - 20, approxY + (searchDown ? maxDelta : 12));
  for (let y = lo; y <= hi; y++) {
    if (inkCounts[y] < minInk) {
      minInk = inkCounts[y];
      bestY = y;
      if (minInk === 0 && Math.abs(y - approxY) <= 18) break;
    }
  }
  return bestY;
}

async function trimAndSaveWebp(pageBuf, box, outPath, pad = { top: 14, bottom: 14, left: 16, right: 16 }) {
  const { width, height } = await sharp(pageBuf).metadata();
  const safeLeft = Math.max(0, Math.min(width - 2, Math.round(box.left)));
  const safeTop = Math.max(0, Math.min(height - 2, Math.round(box.top)));
  const safeW = Math.max(10, Math.min(width - safeLeft, Math.round(box.width)));
  const safeH = Math.max(10, Math.min(height - safeTop, Math.round(box.height)));

  const extracted = await sharp(pageBuf)
    .extract({ left: safeLeft, top: safeTop, width: safeW, height: safeH })
    .png()
    .toBuffer();

  await sharp(extracted)
    .trim({ background: '#ffffff', threshold: 12 })
    .extend({
      top: pad.top,
      bottom: pad.bottom,
      left: pad.left,
      right: pad.right,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .webp({ quality: 90 })
    .toFile(outPath);
}

async function generateContactSheet(tiles, outSheetPath, titleText, accentHex) {
  if (!tiles.length) return;
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
    const x0 = PAD + col * (CELL_W + PAD);
    const y0 = PAD + row * (CELL_H + PAD);

    const resized = await sharp(outPath)
      .resize(CELL_W - 12, CELL_H - LABEL_H - 12, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer();

    const meta = await sharp(outPath).metadata();
    const labelSvg = Buffer.from(
      `<svg width="${CELL_W}" height="${CELL_H}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${CELL_W}" height="${CELL_H}" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="0" y="0" width="${CELL_W}" height="${LABEL_H}" rx="10" fill="${accentHex}"/>
        <text x="12" y="23" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">${name} (${meta.width}x${meta.height})</text>
      </svg>`
    );

    composites.push({ input: labelSvg, left: x0, top: y0 });
    composites.push({ input: resized, left: x0 + 6, top: y0 + LABEL_H + 6 });
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
    .toFile(outSheetPath);
}

async function processPaper(paper) {
  const pdfPath = path.join(SOURCE_DIR, paper.pdf);
  if (!fs.existsSync(pdfPath)) throw new Error(`Missing PDF: ${pdfPath}`);

  const outDir = path.join(ASSET_ROOT, paper.key);
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(SHEET_DIR, { recursive: true });

  console.log(`\n=== Building ${paper.key} from ${paper.pdf} ===`);
  const { markers, headers, opt1s, textItems } = await extractPdfCoordinates(pdfPath);
  if (markers.length !== 25) {
    throw new Error(`${paper.key}: Expected 25 question markers, got ${markers.length}`);
  }

  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await parser.load();
  const shot = await parser.getScreenshot({ scale: SCALE });
  await parser.destroy();

  // Compute raw ink profile per page & col
  const pageRaws = [];
  const colProfiles = {};
  for (let p = 0; p < shot.pages.length; p++) {
    const rawObj = await sharp(shot.pages[p].data).raw().toBuffer({ resolveWithObject: true });
    pageRaws.push(rawObj);
    const midX = Math.round(rawObj.info.width * 0.5);
    colProfiles[`${p}L`] = getRowInkProfile(
      rawObj.data,
      rawObj.info.width,
      rawObj.info.height,
      rawObj.info.channels,
      85,
      midX - 18
    );
    colProfiles[`${p}R`] = getRowInkProfile(
      rawObj.data,
      rawObj.info.width,
      rawObj.info.height,
      rawObj.info.channels,
      midX + 18,
      rawObj.info.width - 75
    );
  }

  // Group markers & headers by page+col
  const colItems = {};
  for (const m of markers) {
    const k = `${m.page}${m.col}`;
    if (!colItems[k]) colItems[k] = [];
    colItems[k].push({ ...m, kind: 'Q' });
  }
  for (const h of headers) {
    const k = `${h.page}${h.col}`;
    if (!colItems[k]) colItems[k] = [];
    colItems[k].push({ ...h, kind: 'H' });
  }

  const qBoxes = {};
  const tiles = [];

  for (const [k, items] of Object.entries(colItems)) {
    items.sort((a, b) => a.y - b.y);
    const prof = colProfiles[k];
    const pageW = pageRaws[items[0].page].info.width;
    const midX = Math.round(pageW * 0.5);
    const colLeft = items[0].col === 'L' ? 80 : midX + 14;
    const colRight = items[0].col === 'L' ? midX - 16 : pageW - 70;
    const colWidth = colRight - colLeft;

    for (let i = 0; i < items.length; i++) {
      const cur = items[i];
      if (cur.kind !== 'Q') continue;
      const nxt = items[i + 1];
      const pageFooters = textItems.filter(
        (t) =>
          t.page === cur.page &&
          t.y > 3360 &&
          /(第\s*\d+\s*頁|基本學習內容標準化評量)/.test(t.str)
      );
      const colMaxBot = pageFooters.length
        ? Math.min(...pageFooters.map((t) => t.y)) - 36
        : 3428;
      const topApprox = Math.max(70, cur.y - (paper.subject === 'math' ? 46 : 54));
      const top = snapWhiteGap(prof, topApprox, false, paper.subject === 'math' ? 18 : 28);
      const botRaw = nxt ? Math.min(colMaxBot, nxt.y - 58) : colMaxBot;
      const bottom = nxt ? snapWhiteGap(prof, botRaw, false, 30) : botRaw;

      const qName = `q${String(cur.q).padStart(2, '0')}.webp`;
      const outPath = path.join(outDir, qName);
      const box = { left: colLeft, top, width: colWidth, height: Math.max(40, bottom - top) };
      await trimAndSaveWebp(shot.pages[cur.page].data, box, outPath);
      tiles.push({ name: qName, outPath });
      qBoxes[cur.q] = { ...box, page: cur.page, col: cur.col, bottom, colLeft, colRight, markerY: cur.y };
    }
  }

  // Passages (Chinese G4-G6)
  if (paper.passages) {
    for (const pas of paper.passages) {
      const qBox = qBoxes[pas.beforeQ];
      const pageW = pageRaws[pas.page].info.width;
      const midX = Math.round(pageW * 0.5);
      const left = pas.col === 'L' ? 75 : midX + 12;
      const right = pas.col === 'L' ? midX - 14 : pageW - 65;
      const box = {
        left,
        top: pas.topHint,
        width: right - left,
        height: Math.max(200, qBox.top - pas.topHint - 18),
      };
      const outPath = path.join(outDir, pas.name);
      await trimAndSaveWebp(shot.pages[pas.page].data, box, outPath);
      tiles.push({ name: pas.name, outPath });
    }
  }

  // Figures (Math diagrams & option-bars; English picture choices & side illustrations)
  const findOpt1ForQ = (qNum) => {
    const qb = qBoxes[qNum];
    const candidates = opt1s.filter(
      (o) => o.page === qb.page && o.col === qb.col && o.y >= qb.top && o.y <= qb.bottom
    );
    candidates.sort((a, b) => a.y - b.y);
    return candidates[0] || null;
  };

  if (paper.subject === 'english') {
    for (const qNum of paper.rowFigureQs || []) {
      const qb = qBoxes[qNum];
      const o1 = findOpt1ForQ(qNum);
      if (!o1) throw new Error(`${paper.key} Q${qNum}: missing (1) anchor`);
      const figTop = Math.max(qb.top, o1.y - 46);
      const figName = `q${String(qNum).padStart(2, '0')}_fig.webp`;
      const outPath = path.join(outDir, figName);
      await trimAndSaveWebp(
        shot.pages[qb.page].data,
        { left: qb.colLeft, top: figTop, width: qb.width, height: qb.bottom - figTop },
        outPath,
        { top: 10, bottom: 10, left: 12, right: 12 }
      );
      tiles.push({ name: figName, outPath });
    }
    for (const qNum of paper.sideFigureQs || []) {
      const qb = qBoxes[qNum];
      const o1 = findOpt1ForQ(qNum);
      if (!o1) throw new Error(`${paper.key} Q${qNum}: missing (1) anchor`);
      const figLeft = qb.colLeft + 100;
      const figW = Math.max(120, o1.x - figLeft - 18);
      const figName = `q${String(qNum).padStart(2, '0')}_fig.webp`;
      const outPath = path.join(outDir, figName);
      await trimAndSaveWebp(
        shot.pages[qb.page].data,
        { left: figLeft, top: qb.top, width: figW, height: qb.height },
        outPath,
        { top: 10, bottom: 10, left: 12, right: 12 }
      );
      tiles.push({ name: figName, outPath });
    }
  }

  if (paper.subject === 'math') {
    for (const qNum of paper.mathFigures || []) {
      const qb = qBoxes[qNum];
      const o1 = findOpt1ForQ(qNum);
      if (!o1) throw new Error(`${paper.key} Q${qNum}: missing (1) anchor`);
      // Scan stem text baselines above opt1 inside qb to exclude top stem & bottom question line above options
      const linesInQ = textItems
        .filter((t) => t.page === qb.page && t.col === qb.col && t.y >= qb.markerY - 10 && t.y < o1.y - 30)
        .sort((a, b) => a.y - b.y);
      let figTop = qb.markerY + 34;
      let figBot = o1.y - 54;
      if (paper.key === 'math-g4' && qNum === 8) {
        // Q8 has stem line 1 above bar chart, bar chart, then "星期四參觀人數共有多少人？" above options
        const q8LastLine = linesInQ.filter((t) => /星期四/.test(t.str))[0];
        if (q8LastLine) figBot = q8LastLine.y - 46;
      } else if (paper.key === 'math-g4' && (qNum === 17 || qNum === 20 || qNum === 24)) {
        // Stem at top, diagram in middle, optional "下列哪些說法正確" before options
        const lowerPrompt = linesInQ.filter((t) => /下列哪些/.test(t.str))[0];
        if (lowerPrompt) figBot = lowerPrompt.y - 46;
      } else if (paper.key === 'math-g6' && qNum === 3) {
        const lowerPrompt = linesInQ.filter((t) => /請問下列哪個選項/.test(t.str))[0];
        if (lowerPrompt) figBot = lowerPrompt.y - 46;
      } else if (paper.key === 'math-g6' && qNum === 7) {
        const lowerPrompt = linesInQ.filter((t) => /平行四邊形\s*EF/.test(t.str))[0];
        if (lowerPrompt) figBot = lowerPrompt.y - 46;
      } else if (paper.key === 'math-g6' && qNum === 23) {
        const lowerPrompt = linesInQ.filter((t) => /下列哪個算式/.test(t.str))[0];
        if (lowerPrompt) figBot = lowerPrompt.y - 46;
      } else if (paper.key === 'math-g5' && qNum === 2) {
        const lowerPrompt = linesInQ.filter((t) => /下列哪個算式/.test(t.str))[0];
        if (lowerPrompt) figBot = lowerPrompt.y - 46;
      } else if (paper.key === 'math-g5' && qNum === 22) {
        figBot = o1.y - 76;
      }
      // Adjust figTop below wrapped 2-line question header if needed (e.g. G4 Q2, Q7, Q9, Q13, Q22, Q23; G5 Q10, Q22, Q25)
      if (paper.key === 'math-g4' && [7, 9, 22, 23].includes(qNum)) {
        figTop = qb.markerY + 86;
      } else if (paper.key === 'math-g4' && qNum === 13) {
        figTop = qb.markerY + 40;
        const prompt13 = linesInQ.filter((t) => /請問下面/.test(t.str))[0];
        if (prompt13) figBot = prompt13.y - 48;
      } else if (paper.key === 'math-g4' && qNum === 20) {
        figTop = qb.markerY + 82;
      }
      const figName = `q${String(qNum).padStart(2, '0')}_fig.webp`;
      const outPath = path.join(outDir, figName);
      await trimAndSaveWebp(
        shot.pages[qb.page].data,
        { left: qb.colLeft, top: figTop, width: qb.width, height: Math.max(60, figBot - figTop) },
        outPath,
        { top: 10, bottom: 10, left: 12, right: 12 }
      );
      tiles.push({ name: figName, outPath });
    }
    for (const qNum of paper.mathOptionFigures || []) {
      const qb = qBoxes[qNum];
      const o1 = findOpt1ForQ(qNum);
      if (!o1) throw new Error(`${paper.key} Q${qNum}: missing (1) anchor`);
      const figTop = Math.max(qb.top, o1.y - 48);
      const figName = `q${String(qNum).padStart(2, '0')}_fig.webp`;
      const outPath = path.join(outDir, figName);
      await trimAndSaveWebp(
        shot.pages[qb.page].data,
        { left: qb.colLeft, top: figTop, width: qb.width, height: qb.bottom - figTop },
        outPath,
        { top: 10, bottom: 10, left: 12, right: 12 }
      );
      tiles.push({ name: figName, outPath });
    }
  }

  const sheetPath = path.join(SHEET_DIR, `${paper.key}.png`);
  await generateContactSheet(tiles, sheetPath, paper.key, paper.accent);
  console.log(`  Generated ${tiles.length} WebP assets + contact sheet ${sheetPath}`);

  // MP3 slicing for English listening Q1-Q10
  if (paper.mp3) {
    const mp3Src = path.join(SOURCE_DIR, paper.mp3);
    if (!fs.existsSync(mp3Src)) throw new Error(`Missing MP3: ${mp3Src}`);
    const probe = spawnSync(
      ffmpegStatic,
      ['-i', mp3Src, '-af', 'silencedetect=noise=-35dB:d=1.6', '-f', 'null', '-'],
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    const stderr = probe.stderr || '';
    const silences = [...stderr.matchAll(/silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/g)].map(
      (m) => ({ end: +m[1], dur: +m[2], start: +(m[1] - m[2]).toFixed(2) })
    );
    const segments = [];
    let prevEnd = 0;
    for (const s of silences) {
      if (s.start - prevEnd > 0.35) {
        segments.push({ start: prevEnd, end: s.start });
      }
      prevEnd = s.end;
    }
    if (segments.length < 36) {
      throw new Error(`${paper.key}: Expected >= 36 speech segments in MP3, got ${segments.length}`);
    }
    // Map Q1..Q3 = segments[3..11], Q4..Q6 = segments[13..21], Q7..Q10 = segments[23..34]
    const triplets = [
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
    const audioOutDir = path.join(AUDIO_ROOT, paper.key);
    fs.mkdirSync(audioOutDir, { recursive: true });
    for (let qi = 0; qi < triplets.length; qi++) {
      const [sIdx, eIdx] = triplets[qi];
      const start = Math.max(0, +(segments[sIdx].start - 0.35).toFixed(2));
      const end = +(segments[eIdx].end + 0.35).toFixed(2);
      const dur = +(end - start).toFixed(2);
      const outMp3 = path.join(audioOutDir, `q${String(qi + 1).padStart(2, '0')}.mp3`);
      execFileSync(ffmpegStatic, [
        '-y',
        '-ss',
        String(start),
        '-t',
        String(dur),
        '-i',
        mp3Src,
        '-af',
        `afade=t=in:st=0:d=0.05,afade=t=out:st=${Math.max(0.2, dur - 0.08).toFixed(2)}:d=0.08`,
        '-ac',
        '1',
        '-ar',
        '44100',
        '-b:a',
        '96k',
        '-map_metadata',
        '-1',
        outMp3,
      ], { stdio: 'pipe' });
    }
    console.log(`  Sliced 10 listening MP3 clips -> ${audioOutDir}`);
  }
}

async function main() {
  const only = process.argv.slice(2);
  const targets = only.length ? PAPERS.filter((p) => only.includes(p.key)) : PAPERS;
  for (const p of targets) {
    await processPaper(p);
  }
  console.log('\nALL TARGET 114 G4-G6 ASSETS GENERATED SUCCESSFULLY.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
