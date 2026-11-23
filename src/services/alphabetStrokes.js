/**
 * 均勻點雲重取樣：將任意長度或稀疏之筆劃重取樣為固定 N 個等距點
 */
export const resamplePoints = (pts, targetCount = 16) => {
  if (!pts || pts.length === 0) return [];
  if (pts.length === 1) return Array(targetCount).fill(pts[0]);
  const res = [];
  let totalLen = 0;
  for (let i = 1; i < pts.length; i++) {
    totalLen += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  if (totalLen <= 0) return Array(targetCount).fill(pts[0]);
  const step = totalLen / (targetCount - 1);
  res.push({ x: pts[0].x, y: pts[0].y });
  let accumulated = 0;
  let currIdx = 0;
  for (let i = 1; i < targetCount - 1; i++) {
    const targetDist = i * step;
    while (currIdx < pts.length - 1) {
      const p1 = pts[currIdx];
      const p2 = pts[currIdx + 1];
      const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      if (accumulated + segLen >= targetDist) {
        const t = (targetDist - accumulated) / (segLen || 1);
        res.push({
          x: Math.round(p1.x + (p2.x - p1.x) * t),
          y: Math.round(p1.y + (p2.y - p1.y) * t)
        });
        break;
      }
      accumulated += segLen;
      currIdx++;
    }
  }
  res.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y });
  return res;
};
// ═══════════════════════════════════════════════════════════════════════════
// 霧臺英語宇宙：26 字母標準四線三格筆順數據庫與手寫評分引擎 (Alphabet Strokes Engine)
// 依據教育部/臺灣國小英語課綱標準：四線三格、起筆方向、筆劃順序 ①②③
// ═══════════════════════════════════════════════════════════════════════════

export const FOUR_LINES = {
  top: 15,     // 頂線 (Ascender / Headline)
  mid: 45,     // 中線 (Midline / Waistline - 虛線)
  base: 75,    // 基線 (Baseline - 實線主基底)
  bottom: 105, // 底線 (Descender / Bottom line)
  width: 100,
  height: 120
};

/**
 * 輔助取樣點生成器：將線段或三次貝茲曲線離散取樣成點座標集合
 */
const sampleLine = (x1, y1, x2, y2, steps = 10) => {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push([Math.round(x1 + (x2 - x1) * t), Math.round(y1 + (y2 - y1) * t)]);
  }
  return pts;
};

const sampleCubic = (p0, p1, p2, p3, steps = 16) => {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const inv = 1 - t;
    const x = Math.round(inv * inv * inv * p0[0] + 3 * inv * inv * t * p1[0] + 3 * inv * t * t * p2[0] + t * t * t * p3[0]);
    const y = Math.round(inv * inv * inv * p0[1] + 3 * inv * inv * t * p1[1] + 3 * inv * t * t * p2[1] + t * t * t * p3[1]);
    pts.push([x, y]);
  }
  return pts;
};

// ── 26 大寫字母筆順標準庫 (A ~ Z) ──
const UPPER_STROKES = {
  A: {
    char: 'A', case: 'upper', sound: 'A is for Apple',
    strokes: [
      { id: 1, path: 'M 50 15 L 20 75', start: { x: 50, y: 15 }, end: { x: 20, y: 75 }, labelPos: { x: 30, y: 40 }, hint: '由頂點往左下斜畫', sample: sampleLine(50, 15, 20, 75) },
      { id: 2, path: 'M 50 15 L 80 75', start: { x: 50, y: 15 }, end: { x: 80, y: 75 }, labelPos: { x: 70, y: 40 }, hint: '由頂點往右下斜畫', sample: sampleLine(50, 15, 80, 75) },
      { id: 3, path: 'M 32 52 L 68 52', start: { x: 32, y: 52 }, end: { x: 68, y: 52 }, labelPos: { x: 50, y: 58 }, hint: '從左至右畫中間橫線', sample: sampleLine(32, 52, 68, 52) }
    ]
  },
  B: {
    char: 'B', case: 'upper', sound: 'B is for Book',
    strokes: [
      { id: 1, path: 'M 28 15 L 28 75', start: { x: 28, y: 15 }, end: { x: 28, y: 75 }, labelPos: { x: 20, y: 45 }, hint: '由上往下垂直筆劃', sample: sampleLine(28, 15, 28, 75) },
      { id: 2, path: 'M 28 15 C 65 15, 65 45, 28 45', start: { x: 28, y: 15 }, end: { x: 28, y: 45 }, labelPos: { x: 60, y: 28 }, hint: '由頂點向右環抱至中線', sample: sampleCubic([28, 15], [65, 15], [65, 45], [28, 45]) },
      { id: 3, path: 'M 28 45 C 70 45, 70 75, 28 75', start: { x: 28, y: 45 }, end: { x: 28, y: 75 }, labelPos: { x: 64, y: 62 }, hint: '從中線向右環抱至基線', sample: sampleCubic([28, 45], [70, 45], [70, 75], [28, 75]) }
    ]
  },
  C: {
    char: 'C', case: 'upper', sound: 'C is for Cat',
    strokes: [
      { id: 1, path: 'M 75 28 C 30 15, 18 55, 35 72 C 52 82, 72 75, 75 64', start: { x: 75, y: 28 }, end: { x: 75, y: 64 }, labelPos: { x: 50, y: 22 }, hint: '由右上逆時針畫圓弧至右下', sample: [...sampleCubic([75, 28], [30, 15], [18, 55], [35, 72]), ...sampleCubic([35, 72], [52, 82], [72, 75], [75, 64])] }
    ]
  },
  D: {
    char: 'D', case: 'upper', sound: 'D is for Dog',
    strokes: [
      { id: 1, path: 'M 28 15 L 28 75', start: { x: 28, y: 15 }, end: { x: 28, y: 75 }, labelPos: { x: 20, y: 45 }, hint: '由上往下垂直筆劃', sample: sampleLine(28, 15, 28, 75) },
      { id: 2, path: 'M 28 15 C 75 15, 75 75, 28 75', start: { x: 28, y: 15 }, end: { x: 28, y: 75 }, labelPos: { x: 68, y: 45 }, hint: '由頂點畫大半圓至基線', sample: sampleCubic([28, 15], [75, 15], [75, 75], [28, 75]) }
    ]
  },
  E: {
    char: 'E', case: 'upper', sound: 'E is for Elephant',
    strokes: [
      { id: 1, path: 'M 30 15 L 30 75', start: { x: 30, y: 15 }, end: { x: 30, y: 75 }, labelPos: { x: 22, y: 45 }, hint: '垂直主幹由上往下', sample: sampleLine(30, 15, 30, 75) },
      { id: 2, path: 'M 30 15 L 72 15', start: { x: 30, y: 15 }, end: { x: 72, y: 15 }, labelPos: { x: 50, y: 22 }, hint: '頂端橫線向右', sample: sampleLine(30, 15, 72, 15) },
      { id: 3, path: 'M 30 45 L 65 45', start: { x: 30, y: 45 }, end: { x: 65, y: 45 }, labelPos: { x: 48, y: 52 }, hint: '中線橫線向右', sample: sampleLine(30, 45, 65, 45) },
      { id: 4, path: 'M 30 75 L 72 75', start: { x: 30, y: 75 }, end: { x: 72, y: 75 }, labelPos: { x: 50, y: 82 }, hint: '底線橫線向右', sample: sampleLine(30, 75, 72, 75) }
    ]
  },
  F: {
    char: 'F', case: 'upper', sound: 'F is for Fish',
    strokes: [
      { id: 1, path: 'M 30 15 L 30 75', start: { x: 30, y: 15 }, end: { x: 30, y: 75 }, labelPos: { x: 22, y: 45 }, hint: '垂直主幹由上往下', sample: sampleLine(30, 15, 30, 75) },
      { id: 2, path: 'M 30 15 L 72 15', start: { x: 30, y: 15 }, end: { x: 72, y: 15 }, labelPos: { x: 50, y: 22 }, hint: '頂端橫線向右', sample: sampleLine(30, 15, 72, 15) },
      { id: 3, path: 'M 30 45 L 65 45', start: { x: 30, y: 45 }, end: { x: 65, y: 45 }, labelPos: { x: 48, y: 52 }, hint: '中線橫線向右', sample: sampleLine(30, 45, 65, 45) }
    ]
  },
  G: {
    char: 'G', case: 'upper', sound: 'G is for Girl',
    strokes: [
      { id: 1, path: 'M 75 28 C 30 15, 18 55, 35 72 C 52 82, 72 75, 72 52', start: { x: 75, y: 28 }, end: { x: 72, y: 52 }, labelPos: { x: 50, y: 22 }, hint: '由右上畫大圓弧到右側中線', sample: [...sampleCubic([75, 28], [30, 15], [18, 55], [35, 72]), ...sampleCubic([35, 72], [52, 82], [72, 75], [72, 52])] },
      { id: 2, path: 'M 72 52 L 52 52', start: { x: 72, y: 52 }, end: { x: 52, y: 52 }, labelPos: { x: 62, y: 44 }, hint: '從右向內水平畫橫線', sample: sampleLine(72, 52, 52, 52) }
    ]
  },
  H: {
    char: 'H', case: 'upper', sound: 'H is for Hat',
    strokes: [
      { id: 1, path: 'M 28 15 L 28 75', start: { x: 28, y: 15 }, end: { x: 28, y: 75 }, labelPos: { x: 20, y: 45 }, hint: '左側垂直線由上往下', sample: sampleLine(28, 15, 28, 75) },
      { id: 2, path: 'M 72 15 L 72 75', start: { x: 72, y: 15 }, end: { x: 72, y: 75 }, labelPos: { x: 80, y: 45 }, hint: '右側垂直線由上往下', sample: sampleLine(72, 15, 72, 75) },
      { id: 3, path: 'M 28 45 L 72 45', start: { x: 28, y: 45 }, end: { x: 72, y: 45 }, labelPos: { x: 50, y: 52 }, hint: '中線水平連接左右', sample: sampleLine(28, 45, 72, 45) }
    ]
  },
  I: {
    char: 'I', case: 'upper', sound: 'I is for Ice',
    strokes: [
      { id: 1, path: 'M 50 15 L 50 75', start: { x: 50, y: 15 }, end: { x: 50, y: 75 }, labelPos: { x: 42, y: 45 }, hint: '中央垂直筆劃由上往下', sample: sampleLine(50, 15, 50, 75) },
      { id: 2, path: 'M 32 15 L 68 15', start: { x: 32, y: 15 }, end: { x: 68, y: 15 }, labelPos: { x: 50, y: 22 }, hint: '頂端水平橫線', sample: sampleLine(32, 15, 68, 15) },
      { id: 3, path: 'M 32 75 L 68 75', start: { x: 32, y: 75 }, end: { x: 68, y: 75 }, labelPos: { x: 50, y: 82 }, hint: '基線水平橫線', sample: sampleLine(32, 75, 68, 75) }
    ]
  },
  J: {
    char: 'J', case: 'upper', sound: 'J is for Juice',
    strokes: [
      { id: 1, path: 'M 40 15 L 80 15', start: { x: 40, y: 15 }, end: { x: 80, y: 15 }, labelPos: { x: 60, y: 22 }, hint: '頂端橫線向右', sample: sampleLine(40, 15, 80, 15) },
      { id: 2, path: 'M 62 15 L 62 60 C 62 76, 36 76, 36 62', start: { x: 62, y: 15 }, end: { x: 36, y: 62 }, labelPos: { x: 70, y: 45 }, hint: '由上往下並向左彎起鉤', sample: [...sampleLine(62, 15, 62, 60), ...sampleCubic([62, 60], [62, 76], [36, 76], [36, 62])] }
    ]
  },
  K: {
    char: 'K', case: 'upper', sound: 'K is for Kite',
    strokes: [
      { id: 1, path: 'M 28 15 L 28 75', start: { x: 28, y: 15 }, end: { x: 28, y: 75 }, labelPos: { x: 20, y: 45 }, hint: '左側主幹由上往下', sample: sampleLine(28, 15, 28, 75) },
      { id: 2, path: 'M 72 18 L 30 48', start: { x: 72, y: 18 }, end: { x: 30, y: 48 }, labelPos: { x: 56, y: 30 }, hint: '由右上往主幹斜畫', sample: sampleLine(72, 18, 30, 48) },
      { id: 3, path: 'M 30 48 L 74 75', start: { x: 30, y: 48 }, end: { x: 74, y: 75 }, labelPos: { x: 58, y: 66 }, hint: '由中點往右下斜畫', sample: sampleLine(30, 48, 74, 75) }
    ]
  },
  L: {
    char: 'L', case: 'upper', sound: 'L is for Lion',
    strokes: [
      { id: 1, path: 'M 30 15 L 30 75', start: { x: 30, y: 15 }, end: { x: 30, y: 75 }, labelPos: { x: 22, y: 45 }, hint: '垂直直線由上往下', sample: sampleLine(30, 15, 30, 75) },
      { id: 2, path: 'M 30 75 L 72 75', start: { x: 30, y: 75 }, end: { x: 72, y: 75 }, labelPos: { x: 52, y: 82 }, hint: '底端橫線向右', sample: sampleLine(30, 75, 72, 75) }
    ]
  },
  M: {
    char: 'M', case: 'upper', sound: 'M is for Monkey',
    strokes: [
      { id: 1, path: 'M 22 75 L 22 15', start: { x: 22, y: 75 }, end: { x: 22, y: 15 }, labelPos: { x: 14, y: 45 }, hint: '左側立柱自下而上', sample: sampleLine(22, 75, 22, 15) },
      { id: 2, path: 'M 22 15 L 50 60', start: { x: 22, y: 15 }, end: { x: 50, y: 60 }, labelPos: { x: 34, y: 34 }, hint: '由左頂點向中斜下', sample: sampleLine(22, 15, 50, 60) },
      { id: 3, path: 'M 50 60 L 78 15', start: { x: 50, y: 60 }, end: { x: 78, y: 15 }, labelPos: { x: 66, y: 34 }, hint: '由中央向右頂斜上', sample: sampleLine(50, 60, 78, 15) },
      { id: 4, path: 'M 78 15 L 78 75', start: { x: 78, y: 15 }, end: { x: 78, y: 75 }, labelPos: { x: 86, y: 45 }, hint: '右側立柱自上而下', sample: sampleLine(78, 15, 78, 75) }
    ]
  },
  N: {
    char: 'N', case: 'upper', sound: 'N is for Nose',
    strokes: [
      { id: 1, path: 'M 25 75 L 25 15', start: { x: 25, y: 75 }, end: { x: 25, y: 15 }, labelPos: { x: 17, y: 45 }, hint: '左側立柱自下而上', sample: sampleLine(25, 75, 25, 15) },
      { id: 2, path: 'M 25 15 L 75 75', start: { x: 25, y: 15 }, end: { x: 75, y: 75 }, labelPos: { x: 50, y: 45 }, hint: '對角斜線從左上到右下', sample: sampleLine(25, 15, 75, 75) },
      { id: 3, path: 'M 75 75 L 75 15', start: { x: 75, y: 75 }, end: { x: 75, y: 15 }, labelPos: { x: 83, y: 45 }, hint: '右側立柱自下而上', sample: sampleLine(75, 75, 75, 15) }
    ]
  },
  O: {
    char: 'O', case: 'upper', sound: 'O is for Orange',
    strokes: [
      { id: 1, path: 'M 50 15 C 22 15, 22 75, 50 75 C 78 75, 78 15, 50 15', start: { x: 50, y: 15 }, end: { x: 50, y: 15 }, labelPos: { x: 50, y: 24 }, hint: '由頂點逆時針畫完整大橢圓', sample: [...sampleCubic([50, 15], [22, 15], [22, 75], [50, 75]), ...sampleCubic([50, 75], [78, 75], [78, 15], [50, 15])] }
    ]
  },
  P: {
    char: 'P', case: 'upper', sound: 'P is for Pen',
    strokes: [
      { id: 1, path: 'M 28 15 L 28 75', start: { x: 28, y: 15 }, end: { x: 28, y: 75 }, labelPos: { x: 20, y: 45 }, hint: '垂直主幹由上往下', sample: sampleLine(28, 15, 28, 75) },
      { id: 2, path: 'M 28 15 C 70 15, 70 45, 28 45', start: { x: 28, y: 15 }, end: { x: 28, y: 45 }, labelPos: { x: 62, y: 28 }, hint: '由頂點向右環抱至中線', sample: sampleCubic([28, 15], [70, 15], [70, 45], [28, 45]) }
    ]
  },
  Q: {
    char: 'Q', case: 'upper', sound: 'Q is for Queen',
    strokes: [
      { id: 1, path: 'M 50 15 C 22 15, 22 75, 50 75 C 78 75, 78 15, 50 15', start: { x: 50, y: 15 }, end: { x: 50, y: 15 }, labelPos: { x: 50, y: 24 }, hint: '逆時針畫完整大橢圓', sample: [...sampleCubic([50, 15], [22, 15], [22, 75], [50, 75]), ...sampleCubic([50, 75], [78, 75], [78, 15], [50, 15])] },
      { id: 2, path: 'M 55 60 L 80 80', start: { x: 55, y: 60 }, end: { x: 80, y: 80 }, labelPos: { x: 74, y: 68 }, hint: '右下短斜尾巴筆劃', sample: sampleLine(55, 60, 80, 80) }
    ]
  },
  R: {
    char: 'R', case: 'upper', sound: 'R is for Red',
    strokes: [
      { id: 1, path: 'M 28 15 L 28 75', start: { x: 28, y: 15 }, end: { x: 28, y: 75 }, labelPos: { x: 20, y: 45 }, hint: '垂直主幹由上往下', sample: sampleLine(28, 15, 28, 75) },
      { id: 2, path: 'M 28 15 C 70 15, 70 45, 28 45', start: { x: 28, y: 15 }, end: { x: 28, y: 45 }, labelPos: { x: 62, y: 28 }, hint: '上半部圓弧環抱至中線', sample: sampleCubic([28, 15], [70, 15], [70, 45], [28, 45]) },
      { id: 3, path: 'M 48 45 L 74 75', start: { x: 48, y: 45 }, end: { x: 74, y: 75 }, labelPos: { x: 64, y: 62 }, hint: '由中線往右下斜畫支柱', sample: sampleLine(48, 45, 74, 75) }
    ]
  },
  S: {
    char: 'S', case: 'upper', sound: 'S is for Sun',
    strokes: [
      { id: 1, path: 'M 72 28 C 50 15, 28 22, 35 38 C 40 48, 65 48, 68 58 C 72 70, 48 78, 28 66', start: { x: 72, y: 28 }, end: { x: 28, y: 66 }, labelPos: { x: 50, y: 20 }, hint: '連續 S 形蛇形曲線', sample: [...sampleCubic([72, 28], [50, 15], [28, 22], [35, 38]), ...sampleCubic([35, 38], [40, 48], [65, 48], [68, 58]), ...sampleCubic([68, 58], [72, 70], [48, 78], [28, 66])] }
    ]
  },
  T: {
    char: 'T', case: 'upper', sound: 'T is for Tiger',
    strokes: [
      { id: 1, path: 'M 24 15 L 76 15', start: { x: 24, y: 15 }, end: { x: 76, y: 15 }, labelPos: { x: 50, y: 22 }, hint: '頂端橫梁從左向右', sample: sampleLine(24, 15, 76, 15) },
      { id: 2, path: 'M 50 15 L 50 75', start: { x: 50, y: 15 }, end: { x: 50, y: 75 }, labelPos: { x: 42, y: 45 }, hint: '中央垂直大柱由上往下', sample: sampleLine(50, 15, 50, 75) }
    ]
  },
  U: {
    char: 'U', case: 'upper', sound: 'U is for Umbrella',
    strokes: [
      { id: 1, path: 'M 28 15 L 28 60 C 28 76, 72 76, 72 60 L 72 15', start: { x: 28, y: 15 }, end: { x: 72, y: 15 }, labelPos: { x: 22, y: 35 }, hint: '左降向下環抱右升至頂點', sample: [...sampleLine(28, 15, 28, 60), ...sampleCubic([28, 60], [28, 76], [72, 76], [72, 60]), ...sampleLine(72, 60, 72, 15)] }
    ]
  },
  V: {
    char: 'V', case: 'upper', sound: 'V is for Van',
    strokes: [
      { id: 1, path: 'M 25 15 L 50 75', start: { x: 25, y: 15 }, end: { x: 50, y: 75 }, labelPos: { x: 34, y: 42 }, hint: '由左頂點向中央底端斜畫', sample: sampleLine(25, 15, 50, 75) },
      { id: 2, path: 'M 50 75 L 75 15', start: { x: 50, y: 75 }, end: { x: 75, y: 15 }, labelPos: { x: 66, y: 42 }, hint: '由中央底端向右頂點斜畫', sample: sampleLine(50, 75, 75, 15) }
    ]
  },
  W: {
    char: 'W', case: 'upper', sound: 'W is for Water',
    strokes: [
      { id: 1, path: 'M 18 15 L 32 75', start: { x: 18, y: 15 }, end: { x: 32, y: 75 }, labelPos: { x: 22, y: 45 }, hint: '第 1 劃向底端斜畫', sample: sampleLine(18, 15, 32, 75) },
      { id: 2, path: 'M 32 75 L 50 35', start: { x: 32, y: 75 }, end: { x: 50, y: 35 }, labelPos: { x: 42, y: 55 }, hint: '第 2 劃向中間波峰斜上', sample: sampleLine(32, 75, 50, 35) },
      { id: 3, path: 'M 50 35 L 68 75', start: { x: 50, y: 35 }, end: { x: 68, y: 75 }, labelPos: { x: 58, y: 55 }, hint: '第 3 劃向底端斜下', sample: sampleLine(50, 35, 68, 75) },
      { id: 4, path: 'M 68 75 L 82 15', start: { x: 68, y: 75 }, end: { x: 82, y: 15 }, labelPos: { x: 78, y: 45 }, hint: '第 4 劃向右頂點斜上', sample: sampleLine(68, 75, 82, 15) }
    ]
  },
  X: {
    char: 'X', case: 'upper', sound: 'X is for Box',
    strokes: [
      { id: 1, path: 'M 25 15 L 75 75', start: { x: 25, y: 15 }, end: { x: 75, y: 75 }, labelPos: { x: 35, y: 30 }, hint: '左上往右下對角交叉', sample: sampleLine(25, 15, 75, 75) },
      { id: 2, path: 'M 75 15 L 25 75', start: { x: 75, y: 15 }, end: { x: 25, y: 75 }, labelPos: { x: 65, y: 30 }, hint: '右上往左下對角交叉', sample: sampleLine(75, 15, 25, 75) }
    ]
  },
  Y: {
    char: 'Y', case: 'upper', sound: 'Y is for Yellow',
    strokes: [
      { id: 1, path: 'M 24 15 L 50 45', start: { x: 24, y: 15 }, end: { x: 50, y: 45 }, labelPos: { x: 34, y: 28 }, hint: '左上往中點斜畫', sample: sampleLine(24, 15, 50, 45) },
      { id: 2, path: 'M 76 15 L 50 45', start: { x: 76, y: 15 }, end: { x: 50, y: 45 }, labelPos: { x: 66, y: 28 }, hint: '右上往中點斜畫', sample: sampleLine(76, 15, 50, 45) },
      { id: 3, path: 'M 50 45 L 50 75', start: { x: 50, y: 45 }, end: { x: 50, y: 75 }, labelPos: { x: 42, y: 60 }, hint: '中點往下畫垂直柄', sample: sampleLine(50, 45, 50, 75) }
    ]
  },
  Z: {
    char: 'Z', case: 'upper', sound: 'Z is for Zebra',
    strokes: [
      { id: 1, path: 'M 26 18 L 74 18', start: { x: 26, y: 18 }, end: { x: 74, y: 18 }, labelPos: { x: 50, y: 24 }, hint: '頂端橫線向右', sample: sampleLine(26, 18, 74, 18) },
      { id: 2, path: 'M 74 18 L 26 72', start: { x: 74, y: 18 }, end: { x: 26, y: 72 }, labelPos: { x: 52, y: 45 }, hint: '對角斜線往左下', sample: sampleLine(74, 18, 26, 72) },
      { id: 3, path: 'M 26 72 L 74 72', start: { x: 26, y: 72 }, end: { x: 74, y: 72 }, labelPos: { x: 50, y: 78 }, hint: '基底橫線向右', sample: sampleLine(26, 72, 74, 72) }
    ]
  }
};

// ── 26 小寫字母筆順標準庫 (a ~ z) ──
const LOWER_STROKES = {
  a: {
    char: 'a', case: 'lower', sound: 'a is for ant',
    strokes: [
      { id: 1, path: 'M 68 55 C 68 45, 32 45, 32 60 C 32 75, 68 75, 68 62', start: { x: 68, y: 55 }, end: { x: 68, y: 62 }, labelPos: { x: 50, y: 48 }, hint: '逆時針畫圓圈 (在中線與基線間)', sample: [...sampleCubic([68, 55], [68, 45], [32, 45], [32, 60]), ...sampleCubic([32, 60], [32, 75], [68, 75], [68, 62])] },
      { id: 2, path: 'M 68 45 L 68 75', start: { x: 68, y: 45 }, end: { x: 68, y: 75 }, labelPos: { x: 76, y: 60 }, hint: '右側垂直線由上往下', sample: sampleLine(68, 45, 68, 75) }
    ]
  },
  b: {
    char: 'b', case: 'lower', sound: 'b is for ball',
    strokes: [
      { id: 1, path: 'M 32 15 L 32 75', start: { x: 32, y: 15 }, end: { x: 32, y: 75 }, labelPos: { x: 24, y: 45 }, hint: '長頸由頂線直線向下至基線', sample: sampleLine(32, 15, 32, 75) },
      { id: 2, path: 'M 32 55 C 32 45, 68 45, 68 60 C 68 75, 32 75, 32 68', start: { x: 32, y: 55 }, end: { x: 32, y: 68 }, labelPos: { x: 52, y: 48 }, hint: '順時針畫出右邊肚肚', sample: [...sampleCubic([32, 55], [32, 45], [68, 45], [68, 60]), ...sampleCubic([68, 60], [68, 75], [32, 75], [32, 68])] }
    ]
  },
  c: {
    char: 'c', case: 'lower', sound: 'c is for cup',
    strokes: [
      { id: 1, path: 'M 66 52 C 45 44, 34 52, 34 60 C 34 68, 48 76, 66 70', start: { x: 66, y: 52 }, end: { x: 66, y: 70 }, labelPos: { x: 50, y: 48 }, hint: '在中線與基線間逆時針畫圓弧', sample: [...sampleCubic([66, 52], [45, 44], [34, 52], [34, 60]), ...sampleCubic([34, 60], [34, 68], [48, 76], [66, 70])] }
    ]
  },
  d: {
    char: 'd', case: 'lower', sound: 'd is for duck',
    strokes: [
      { id: 1, path: 'M 68 58 C 68 45, 32 45, 32 60 C 32 75, 68 75, 68 64', start: { x: 68, y: 58 }, end: { x: 68, y: 64 }, labelPos: { x: 48, y: 48 }, hint: '逆時針畫左邊肚肚', sample: [...sampleCubic([68, 58], [68, 45], [32, 45], [32, 60]), ...sampleCubic([32, 60], [32, 75], [68, 75], [68, 64])] },
      { id: 2, path: 'M 68 15 L 68 75', start: { x: 68, y: 15 }, end: { x: 68, y: 75 }, labelPos: { x: 76, y: 40 }, hint: '從頂線垂直向下貫穿至基線', sample: sampleLine(68, 15, 68, 75) }
    ]
  },
  e: {
    char: 'e', case: 'lower', sound: 'e is for egg',
    strokes: [
      { id: 1, path: 'M 32 60 L 68 60 C 68 45, 32 45, 32 60 C 32 75, 68 75, 68 68', start: { x: 32, y: 60 }, end: { x: 68, y: 68 }, labelPos: { x: 45, y: 55 }, hint: '水平橫線向右，接著逆時針環繞', sample: [...sampleLine(32, 60, 68, 60), ...sampleCubic([68, 60], [68, 45], [32, 45], [32, 60]), ...sampleCubic([32, 60], [32, 75], [68, 75], [68, 68])] }
    ]
  },
  f: {
    char: 'f', case: 'lower', sound: 'f is for fox',
    strokes: [
      { id: 1, path: 'M 62 20 C 52 15, 45 15, 45 28 L 45 75', start: { x: 62, y: 20 }, end: { x: 45, y: 75 }, labelPos: { x: 55, y: 16 }, hint: '由頂點向左拐彎，垂直下伸至基線', sample: [...sampleCubic([62, 20], [52, 15], [45, 15], [45, 28]), ...sampleLine(45, 28, 45, 75)] },
      { id: 2, path: 'M 32 45 L 62 45', start: { x: 32, y: 45 }, end: { x: 62, y: 45 }, labelPos: { x: 48, y: 52 }, hint: '在中線上畫水平短橫線', sample: sampleLine(32, 45, 62, 45) }
    ]
  },
  g: {
    char: 'g', case: 'lower', sound: 'g is for goat',
    strokes: [
      { id: 1, path: 'M 68 55 C 68 45, 32 45, 32 60 C 32 75, 68 75, 68 62', start: { x: 68, y: 55 }, end: { x: 68, y: 62 }, labelPos: { x: 50, y: 48 }, hint: '中線與基線間逆時針圓圈', sample: [...sampleCubic([68, 55], [68, 45], [32, 45], [32, 60]), ...sampleCubic([32, 60], [32, 75], [68, 75], [68, 62])] },
      { id: 2, path: 'M 68 45 L 68 95 C 68 106, 38 106, 38 95', start: { x: 68, y: 45 }, end: { x: 38, y: 95 }, labelPos: { x: 76, y: 75 }, hint: '垂直直衝底線並向左勾起', sample: [...sampleLine(68, 45, 68, 95), ...sampleCubic([68, 95], [68, 106], [38, 106], [38, 95])] }
    ]
  },
  h: {
    char: 'h', case: 'lower', sound: 'h is for hen',
    strokes: [
      { id: 1, path: 'M 32 15 L 32 75', start: { x: 32, y: 15 }, end: { x: 32, y: 75 }, labelPos: { x: 24, y: 45 }, hint: '從頂線垂直下伸至基線', sample: sampleLine(32, 15, 32, 75) },
      { id: 2, path: 'M 32 55 C 32 45, 68 45, 68 60 L 68 75', start: { x: 32, y: 55 }, end: { x: 68, y: 75 }, labelPos: { x: 50, y: 48 }, hint: '由主幹往右拱起並下落基線', sample: [...sampleCubic([32, 55], [32, 45], [68, 45], [68, 60]), ...sampleLine(68, 60, 68, 75)] }
    ]
  },
  i: {
    char: 'i', case: 'lower', sound: 'i is for ink',
    strokes: [
      { id: 1, path: 'M 50 45 L 50 75', start: { x: 50, y: 45 }, end: { x: 50, y: 75 }, labelPos: { x: 42, y: 60 }, hint: '中線到基線垂直短棒', sample: sampleLine(50, 45, 50, 75) },
      { id: 2, path: 'M 50 28 L 50 29', start: { x: 50, y: 28 }, end: { x: 50, y: 29 }, labelPos: { x: 50, y: 20 }, hint: '在頂線與中線中央輕點一點', sample: [[50, 28], [50, 29]] }
    ]
  },
  j: {
    char: 'j', case: 'lower', sound: 'j is for jar',
    strokes: [
      { id: 1, path: 'M 58 45 L 58 95 C 58 106, 36 106, 36 95', start: { x: 58, y: 45 }, end: { x: 36, y: 95 }, labelPos: { x: 66, y: 70 }, hint: '中線下穿底線並向左勾起', sample: [...sampleLine(58, 45, 58, 95), ...sampleCubic([58, 95], [58, 106], [36, 106], [36, 95])] },
      { id: 2, path: 'M 58 28 L 58 29', start: { x: 58, y: 28 }, end: { x: 58, y: 29 }, labelPos: { x: 58, y: 20 }, hint: '在上方輕點一點', sample: [[58, 28], [58, 29]] }
    ]
  },
  k: {
    char: 'k', case: 'lower', sound: 'k is for key',
    strokes: [
      { id: 1, path: 'M 32 15 L 32 75', start: { x: 32, y: 15 }, end: { x: 32, y: 75 }, labelPos: { x: 24, y: 45 }, hint: '長幹從頂線直達基線', sample: sampleLine(32, 15, 32, 75) },
      { id: 2, path: 'M 66 48 L 36 62', start: { x: 66, y: 48 }, end: { x: 36, y: 62 }, labelPos: { x: 56, y: 50 }, hint: '向主幹中點斜畫', sample: sampleLine(66, 48, 36, 62) },
      { id: 3, path: 'M 36 62 L 68 75', start: { x: 36, y: 62 }, end: { x: 68, y: 75 }, labelPos: { x: 58, y: 72 }, hint: '向右下基線斜畫', sample: sampleLine(36, 62, 68, 75) }
    ]
  },
  l: {
    char: 'l', case: 'lower', sound: 'l is for leg',
    strokes: [
      { id: 1, path: 'M 50 15 L 50 75', start: { x: 50, y: 15 }, end: { x: 50, y: 75 }, labelPos: { x: 42, y: 45 }, hint: '從頂線垂直直落基線', sample: sampleLine(50, 15, 50, 75) }
    ]
  },
  m: {
    char: 'm', case: 'lower', sound: 'm is for milk',
    strokes: [
      { id: 1, path: 'M 24 45 L 24 75', start: { x: 24, y: 45 }, end: { x: 24, y: 75 }, labelPos: { x: 16, y: 60 }, hint: '左側短立柱由中線到基線', sample: sampleLine(24, 45, 24, 75) },
      { id: 2, path: 'M 24 55 C 24 45, 50 45, 50 60 L 50 75', start: { x: 24, y: 55 }, end: { x: 50, y: 75 }, labelPos: { x: 38, y: 48 }, hint: '第 1 個拱門落到基線', sample: [...sampleCubic([24, 55], [24, 45], [50, 45], [50, 60]), ...sampleLine(50, 60, 50, 75)] },
      { id: 3, path: 'M 50 55 C 50 45, 76 45, 76 60 L 76 75', start: { x: 50, y: 55 }, end: { x: 76, y: 75 }, labelPos: { x: 64, y: 48 }, hint: '第 2 個拱門落到基線', sample: [...sampleCubic([50, 55], [50, 45], [76, 45], [76, 60]), ...sampleLine(76, 60, 76, 75)] }
    ]
  },
  n: {
    char: 'n', case: 'lower', sound: 'n is for nut',
    strokes: [
      { id: 1, path: 'M 32 45 L 32 75', start: { x: 32, y: 45 }, end: { x: 32, y: 75 }, labelPos: { x: 24, y: 60 }, hint: '短立柱由中線到基線', sample: sampleLine(32, 45, 32, 75) },
      { id: 2, path: 'M 32 55 C 32 45, 68 45, 68 60 L 68 75', start: { x: 32, y: 55 }, end: { x: 68, y: 75 }, labelPos: { x: 50, y: 48 }, hint: '向右拱起並落到基線', sample: [...sampleCubic([32, 55], [32, 45], [68, 45], [68, 60]), ...sampleLine(68, 60, 68, 75)] }
    ]
  },
  o: {
    char: 'o', case: 'lower', sound: 'o is for ox',
    strokes: [
      { id: 1, path: 'M 50 45 C 28 45, 28 75, 50 75 C 72 75, 72 45, 50 45', start: { x: 50, y: 45 }, end: { x: 50, y: 45 }, labelPos: { x: 50, y: 52 }, hint: '在中線與基線間逆時針畫圓', sample: [...sampleCubic([50, 45], [28, 45], [28, 75], [50, 75]), ...sampleCubic([50, 75], [72, 75], [72, 45], [50, 45])] }
    ]
  },
  p: {
    char: 'p', case: 'lower', sound: 'p is for pig',
    strokes: [
      { id: 1, path: 'M 32 45 L 32 105', start: { x: 32, y: 45 }, end: { x: 32, y: 105 }, labelPos: { x: 24, y: 75 }, hint: '由中線下伸貫穿至底線', sample: sampleLine(32, 45, 32, 105) },
      { id: 2, path: 'M 32 55 C 32 45, 68 45, 68 60 C 68 75, 32 75, 32 68', start: { x: 32, y: 55 }, end: { x: 32, y: 68 }, labelPos: { x: 52, y: 48 }, hint: '在右側畫出飽滿圓肚', sample: [...sampleCubic([32, 55], [32, 45], [68, 45], [68, 60]), ...sampleCubic([68, 60], [68, 75], [32, 75], [32, 68])] }
    ]
  },
  q: {
    char: 'q', case: 'lower', sound: 'q is for quiet',
    strokes: [
      { id: 1, path: 'M 68 55 C 68 45, 32 45, 32 60 C 32 75, 68 75, 68 62', start: { x: 68, y: 55 }, end: { x: 68, y: 62 }, labelPos: { x: 50, y: 48 }, hint: '逆時針畫出左邊圓肚', sample: [...sampleCubic([68, 55], [68, 45], [32, 45], [32, 60]), ...sampleCubic([32, 60], [32, 75], [68, 75], [68, 62])] },
      { id: 2, path: 'M 68 45 L 68 105', start: { x: 68, y: 45 }, end: { x: 68, y: 105 }, labelPos: { x: 76, y: 75 }, hint: '由中線垂直貫穿直達底線', sample: sampleLine(68, 45, 68, 105) }
    ]
  },
  r: {
    char: 'r', case: 'lower', sound: 'r is for run',
    strokes: [
      { id: 1, path: 'M 35 45 L 35 75', start: { x: 35, y: 45 }, end: { x: 35, y: 75 }, labelPos: { x: 27, y: 60 }, hint: '垂直短幹由中線至基線', sample: sampleLine(35, 45, 35, 75) },
      { id: 2, path: 'M 35 55 C 35 46, 58 45, 66 50', start: { x: 35, y: 55 }, end: { x: 66, y: 50 }, labelPos: { x: 50, y: 44 }, hint: '向右上畫出小枝芽弧線', sample: sampleCubic([35, 55], [35, 46], [58, 45], [66, 50]) }
    ]
  },
  s: {
    char: 's', case: 'lower', sound: 's is for six',
    strokes: [
      { id: 1, path: 'M 64 52 C 50 45, 35 49, 40 58 C 45 64, 65 62, 62 68 C 58 75, 42 75, 34 68', start: { x: 64, y: 52 }, end: { x: 34, y: 68 }, labelPos: { x: 50, y: 46 }, hint: '在中線與基線間寫小 S', sample: [...sampleCubic([64, 52], [50, 45], [35, 49], [40, 58]), ...sampleCubic([40, 58], [45, 64], [65, 62], [62, 68]), ...sampleCubic([62, 68], [58, 75], [42, 75], [34, 68])] }
    ]
  },
  t: {
    char: 't', case: 'lower', sound: 't is for top',
    strokes: [
      { id: 1, path: 'M 48 22 L 48 68 C 48 75, 62 75, 62 68', start: { x: 48, y: 22 }, end: { x: 62, y: 68 }, labelPos: { x: 40, y: 45 }, hint: '自接近頂線處下行並向右微勾', sample: [...sampleLine(48, 22, 48, 68), ...sampleCubic([48, 68], [48, 75], [62, 75], [62, 68])] },
      { id: 2, path: 'M 34 45 L 62 45', start: { x: 34, y: 45 }, end: { x: 62, y: 45 }, labelPos: { x: 48, y: 52 }, hint: '在中線上畫水平橫線', sample: sampleLine(34, 45, 62, 45) }
    ]
  },
  u: {
    char: 'u', case: 'lower', sound: 'u is for under',
    strokes: [
      { id: 1, path: 'M 32 45 L 32 64 C 32 75, 68 75, 68 64 L 68 45', start: { x: 32, y: 45 }, end: { x: 68, y: 45 }, labelPos: { x: 24, y: 55 }, hint: '中線下行環抱回中線', sample: [...sampleLine(32, 45, 32, 64), ...sampleCubic([32, 64], [32, 75], [68, 75], [68, 64]), ...sampleLine(68, 64, 68, 45)] },
      { id: 2, path: 'M 68 45 L 68 75', start: { x: 68, y: 45 }, end: { x: 68, y: 75 }, labelPos: { x: 76, y: 60 }, hint: '右側垂直靠攏至基線', sample: sampleLine(68, 45, 68, 75) }
    ]
  },
  v: {
    char: 'v', case: 'lower', sound: 'v is for vet',
    strokes: [
      { id: 1, path: 'M 30 45 L 50 75', start: { x: 30, y: 45 }, end: { x: 50, y: 75 }, labelPos: { x: 38, y: 58 }, hint: '由中線向基線中央斜下', sample: sampleLine(30, 45, 50, 75) },
      { id: 2, path: 'M 50 75 L 70 45', start: { x: 50, y: 75 }, end: { x: 70, y: 45 }, labelPos: { x: 62, y: 58 }, hint: '由基線中央向右頂斜上', sample: sampleLine(50, 75, 70, 45) }
    ]
  },
  w: {
    char: 'w', case: 'lower', sound: 'w is for win',
    strokes: [
      { id: 1, path: 'M 20 45 L 32 75', start: { x: 20, y: 45 }, end: { x: 32, y: 75 }, labelPos: { x: 24, y: 60 }, hint: '第 1 劃向基線斜下', sample: sampleLine(20, 45, 32, 75) },
      { id: 2, path: 'M 32 75 L 48 55', start: { x: 32, y: 75 }, end: { x: 48, y: 55 }, labelPos: { x: 40, y: 66 }, hint: '第 2 劃向中線斜上', sample: sampleLine(32, 75, 48, 55) },
      { id: 3, path: 'M 48 55 L 64 75', start: { x: 48, y: 55 }, end: { x: 64, y: 75 }, labelPos: { x: 56, y: 66 }, hint: '第 3 劃向基線斜下', sample: sampleLine(48, 55, 64, 75) },
      { id: 4, path: 'M 64 75 L 78 45', start: { x: 64, y: 75 }, end: { x: 78, y: 45 }, labelPos: { x: 72, y: 60 }, hint: '第 4 劃向中線斜上', sample: sampleLine(64, 75, 78, 45) }
    ]
  },
  x: {
    char: 'x', case: 'lower', sound: 'x is for box',
    strokes: [
      { id: 1, path: 'M 32 45 L 68 75', start: { x: 32, y: 45 }, end: { x: 68, y: 75 }, labelPos: { x: 42, y: 54 }, hint: '左上往右下對角交叉', sample: sampleLine(32, 45, 68, 75) },
      { id: 2, path: 'M 68 45 L 32 75', start: { x: 68, y: 45 }, end: { x: 32, y: 75 }, labelPos: { x: 58, y: 54 }, hint: '右上往左下對角交叉', sample: sampleLine(68, 45, 32, 75) }
    ]
  },
  y: {
    char: 'y', case: 'lower', sound: 'y is for yo-yo',
    strokes: [
      { id: 1, path: 'M 30 45 L 50 75', start: { x: 30, y: 45 }, end: { x: 50, y: 75 }, labelPos: { x: 38, y: 58 }, hint: '中線向基線斜下短筆', sample: sampleLine(30, 45, 50, 75) },
      { id: 2, path: 'M 70 45 L 34 105', start: { x: 70, y: 45 }, end: { x: 34, y: 105 }, labelPos: { x: 58, y: 70 }, hint: '右中線向下長斜貫穿至底線', sample: sampleLine(70, 45, 34, 105) }
    ]
  },
  z: {
    char: 'z', case: 'lower', sound: 'z is for zoo',
    strokes: [
      { id: 1, path: 'M 32 48 L 68 48', start: { x: 32, y: 48 }, end: { x: 68, y: 48 }, labelPos: { x: 50, y: 44 }, hint: '中線橫線向右', sample: sampleLine(32, 48, 68, 48) },
      { id: 2, path: 'M 68 48 L 32 72', start: { x: 68, y: 48 }, end: { x: 32, y: 72 }, labelPos: { x: 50, y: 60 }, hint: '對角斜線往左下', sample: sampleLine(68, 48, 32, 72) },
      { id: 3, path: 'M 32 72 L 68 72', start: { x: 32, y: 72 }, end: { x: 68, y: 72 }, labelPos: { x: 50, y: 78 }, hint: '基底橫線向右', sample: sampleLine(32, 72, 68, 72) }
    ]
  }
};

export const ALL_STROKES = { ...UPPER_STROKES, ...LOWER_STROKES };

/**
 * 取得指定字元的筆劃定義
 */
export const getLetterStrokes = (char) => {
  if (!char) return null;
  return ALL_STROKES[char] || null;
};

const toModelPoint = (point) => ({
  x: Array.isArray(point) ? point[0] : point.x,
  y: Array.isArray(point) ? point[1] : point.y
});

const meanNearestDistance = (source, target) => {
  if (!source.length || !target.length) return 99;
  let total = 0;
  source.forEach((point) => {
    let nearest = Infinity;
    target.forEach((candidate) => {
      nearest = Math.min(nearest, Math.hypot(point.x - candidate.x, point.y - candidate.y));
    });
    total += nearest;
  });
  return total / source.length;
};

const getBounds = (points) => {
  if (!points.length) return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, centerX: 0, centerY: 0 };
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  };
};

const getModelPointGroups = (model) => model.strokes.map((stroke) =>
  (stroke.sample || []).map(toModelPoint)
);

const pointDistancesToTarget = (source, target) => {
  if (!source.length || !target.length) return [];
  return source.map((point) => {
    let nearest = Infinity;
    for (let i = 0; i < target.length; i++) {
      const candidate = target[i];
      const d = Math.hypot(point.x - candidate.x, point.y - candidate.y);
      if (d < nearest) nearest = d;
    }
    return nearest;
  });
};

const getComponentKind = (groupPoints) => {
  const bounds = getBounds(groupPoints);
  if (groupPoints.length <= 4 || (bounds.width <= 6 && bounds.height <= 6)) {
    return 'dot';
  }
  if (bounds.height <= 6 && bounds.width >= 16) {
    return 'crossbar';
  }
  return 'stroke';
};

/**
 * 獨立點部件檢核（如 i / j 上方的點）：
 * 必須是一筆尺寸緊湊、位於點位區域的獨立筆畫，絕不可由延伸至 y<=38 的直幹單筆誤吸收。
 */
const isDedicatedDotStroke = (strokePoints = [], dotGroupPoints = [], { isTracing = true } = {}) => {
  if (!strokePoints.length || !dotGroupPoints.length) return false;
  const strokeBounds = getBounds(strokePoints);
  const dotBounds = getBounds(dotGroupPoints);
  if (strokeBounds.width > 18 || strokeBounds.height > 18) return false;
  if (strokeBounds.maxY > dotBounds.centerY + 13.5) return false;

  const dotTol = isTracing ? 10.5 : 11.0;
  const meanDist = meanNearestDistance(dotGroupPoints, strokePoints);
  const centerDist = Math.hypot(strokeBounds.centerX - dotBounds.centerX, strokeBounds.centerY - dotBounds.centerY);
  return meanDist <= dotTol && centerDist <= (isTracing ? 12.5 : 13.5);
};

/**
 * 單一部件幾何覆蓋檢查：
 * - 點型部件（如 i / j 的點）：不可被垂直主幹頂端誤吸收，須為獨立點筆畫
 * - 水平橫畫（如 t / f / A / H / G 的橫畫）：檢查端點與整體覆蓋，防漏橫誤過
 * - 一般主幹與圓弧（如 a / b / d / m / n / u）：保持自然一筆連寫的高容錯
 */
export const evaluateComponentCoverage = (
  groupPoints = [],
  userPoints = [],
  { isTracing = true, componentTolerance = 11.5, userStrokes = null } = {}
) => {
  const kind = getComponentKind(groupPoints);
  if (!groupPoints.length || !userPoints.length) {
    return { covered: false, kind, meanDist: 99, maxDist: 99, p90Dist: 99 };
  }

  const dists = pointDistancesToTarget(groupPoints, userPoints);
  const meanDist = dists.reduce((acc, v) => acc + v, 0) / dists.length;
  const maxDist = Math.max(...dists);
  const sorted = [...dists].sort((a, b) => a - b);
  const p90Dist = sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * 0.9))];

  if (kind === 'dot') {
    const candidateStrokes = Array.isArray(userStrokes) ? userStrokes : [userPoints];
    const dotMatches = candidateStrokes.filter(stroke =>
      isDedicatedDotStroke(stroke, groupPoints, { isTracing })
    );
    if (dotMatches.length === 0) {
      return { covered: false, kind, meanDist, maxDist, p90Dist };
    }
    let bestStats = null;
    for (const dotStroke of dotMatches) {
      const sDists = pointDistancesToTarget(groupPoints, dotStroke);
      const sMean = sDists.reduce((acc, v) => acc + v, 0) / sDists.length;
      const sMax = Math.max(...sDists);
      const sSorted = [...sDists].sort((a, b) => a - b);
      const sP90 = sSorted[Math.min(sSorted.length - 1, Math.floor((sSorted.length - 1) * 0.9))];
      if (!bestStats || sMean < bestStats.meanDist) {
        bestStats = { covered: true, kind, meanDist: sMean, maxDist: sMax, p90Dist: sP90 };
      }
    }
    return bestStats;
  }

  if (kind === 'crossbar') {
    const barMeanTol = isTracing ? 9.5 : 10.0;
    const barMaxTol = isTracing ? 11.8 : 12.2;
    const covered = meanDist <= barMeanTol && maxDist <= barMaxTol;
    return { covered, kind, meanDist, maxDist, p90Dist };
  }

  const covered = meanDist <= componentTolerance && p90Dist <= componentTolerance + 6.5;
  return { covered, kind, meanDist, maxDist, p90Dist };
};

const buildMissingComponentFeedback = (targetChar, missingKinds = []) => {
  if (missingKinds.includes('dot')) {
    return `別忘了補上字母「${targetChar}」上方的小點點喔！`;
  }
  if (missingKinds.includes('crossbar')) {
    return `別忘了幫字母「${targetChar}」補畫橫線喔！`;
  }
  return `字母「${targetChar}」還有重要筆畫沒有寫完整，請再補寫一次！`;
};

/**
 * 描紅模式的單筆比對。
 *
 * 不要求學生依固定編號書寫，也允許反向運筆與一筆連續涵蓋數個部件；
 * 編號與箭頭只保留為「建議筆順」。回傳的 matchedIndices 可一次包含多筆。
 */
export const matchTracingStroke = ({
  targetChar,
  userStroke = [],
  completedStrokeIndices = [],
  componentTolerance = 11.5,
  inkTolerance = 15.5
}) => {
  const model = getLetterStrokes(targetChar);
  if (!model || userStroke.length < 1) {
    return { accepted: false, matchedIndices: [], accuracy: 0, inkDistance: 99 };
  }

  const userPoints = resamplePoints(userStroke, Math.max(40, userStroke.length));
  const modelGroups = getModelPointGroups(model);
  const allModelPoints = modelGroups.flat();
  const alreadyCompleted = new Set(completedStrokeIndices);

  // 防止以大範圍塗鴉碰到所有部件：學生墨跡本身也必須貼近完整字形。
  const inkDistance = meanNearestDistance(userPoints, allModelPoints);
  if (inkDistance > inkTolerance) {
    return {
      accepted: false,
      matchedIndices: [],
      accuracy: Math.max(0, Math.round(100 - inkDistance * 5)),
      inkDistance
    };
  }

  const coverages = modelGroups.map(group =>
    evaluateComponentCoverage(group, userPoints, { isTracing: true, componentTolerance, userStrokes: [userPoints] })
  );
  let matchedIndices = coverages
    .map((cov, index) => ({ cov, index }))
    .filter(({ cov, index }) => !alreadyCompleted.has(index) && cov.covered)
    .map(({ index }) => index);

  // 僅針對「一般線段/弧線」放寬稀疏觸控容錯；點與短橫畫必須精確寫出不可 fallback 吸收
  if (matchedIndices.length === 0) {
    const best = coverages
      .map((cov, index) => ({ cov, index }))
      .filter(({ cov, index }) => !alreadyCompleted.has(index) && cov.kind === 'stroke')
      .sort((a, b) => a.cov.meanDist - b.cov.meanDist)[0];
    if (best && best.cov.meanDist <= componentTolerance + 2.5 && best.cov.p90Dist <= componentTolerance + 8.5) {
      matchedIndices = [best.index];
    }
  }

  return {
    accepted: matchedIndices.length > 0,
    matchedIndices,
    accuracy: Math.max(
      0,
      Math.round(100 - Math.max(inkDistance, ...matchedIndices.map(index => coverages[index].meanDist)) * 5)
    ),
    inkDistance,
    componentDistances: coverages.map(c => c.meanDist)
  };
};

/**
 * 描紅模式「累積整字墨跡」完成檢查：
 * 即使學生一筆連寫完成雙筆字母（如 a, b, d, g, h, m, n, p, q, u），只要整體覆蓋完整字形且未漏點/漏橫，即可直接通關。
 */
export const evaluateTracingCompletion = ({
  targetChar,
  userStrokes = [],
  componentTolerance = 11.5
}) => {
  const model = getLetterStrokes(targetChar);
  if (!model || !Array.isArray(userStrokes) || userStrokes.length === 0) {
    return {
      completed: false,
      missingIndices: model ? model.strokes.map((_, idx) => idx) : [],
      missingKinds: [],
      coveredCount: 0,
      totalComponents: model?.strokes.length || 0,
      modelToUser: 99,
      userToModel: 99
    };
  }

  const resampledStrokes = userStrokes
    .filter(stroke => stroke && stroke.length > 0)
    .map(stroke => resamplePoints(stroke, Math.max(32, Math.min(64, stroke.length))));
  const allUserPoints = resampledStrokes.flat();

  if (allUserPoints.length === 0) {
    return {
      completed: false,
      missingIndices: model.strokes.map((_, idx) => idx),
      missingKinds: [],
      coveredCount: 0,
      totalComponents: model.strokes.length,
      modelToUser: 99,
      userToModel: 99
    };
  }

  const modelGroups = getModelPointGroups(model);
  const allModelPoints = modelGroups.flat();
  const userToModel = meanNearestDistance(allUserPoints, allModelPoints);
  const modelToUser = meanNearestDistance(allModelPoints, allUserPoints);

  const coverages = modelGroups.map(group =>
    evaluateComponentCoverage(group, allUserPoints, { isTracing: true, componentTolerance, userStrokes: resampledStrokes })
  );
  const missingIndices = [];
  const missingKinds = [];
  coverages.forEach((cov, idx) => {
    if (!cov.covered) {
      missingIndices.push(idx);
      missingKinds.push(cov.kind);
    }
  });

  const completed =
    missingIndices.length === 0 &&
    userToModel <= 15.0 &&
    modelToUser <= 11.0;

  return {
    completed,
    missingIndices,
    missingKinds,
    coveredCount: model.strokes.length - missingIndices.length,
    totalComponents: model.strokes.length,
    modelToUser,
    userToModel,
    hintFeedback: missingIndices.length > 0 ? buildMissingComponentFeedback(targetChar, missingKinds) : null
  };
};

/**
 * 點雲幾何比對演算法 ($P Point-Cloud Recognizer 輕量化純前端實作)
 * 評定學生在 Freehand Challenge 下的最終字形 (0 ~ 100)。
 * 筆順、運筆方向及合理的合筆／分筆只作診斷，不作為不及格條件；但必要部件（如點、橫畫）漏寫必定退回補寫。
 */
export const evaluateHandwriting = ({
  targetChar,
  userStrokes = [], // Array of stroke point arrays: [ [{x, y}, ...], [{x, y}, ...] ]
  isGuidedTracing = false
}) => {
  const model = getLetterStrokes(targetChar);
  if (!model) {
    return { score: 100, stars: 3, passed: true, feedback: '書寫完成！' };
  }

  // 描寫版：只要各劃皆有描寫即 100% 滿分
  if (isGuidedTracing) {
    return {
      score: 100,
      stars: 3,
      passed: true,
      feedback: '🎉 筆順引導描紅完成！標準握筆與順序全對！',
      details: { strokeCountOk: true, directionOk: true, accuracy: 100, missingIndices: [] }
    };
  }

  const expectedStrokes = model.strokes;
  const expCount = expectedStrokes.length;
  const userCount = userStrokes.length;

  if (userCount === 0) {
    return {
      score: 0,
      stars: 1,
      passed: false,
      feedback: '畫布上未檢測到筆劃，請在四線三格內書寫！',
      details: { strokeCountOk: false, directionOk: false, accuracy: 0, missingIndices: expectedStrokes.map((_, i) => i) }
    };
  }

  // 1. 筆劃數只保留 10 分的輕量診斷；正常合筆／分筆不應造成誤判。
  const countDiff = Math.abs(userCount - expCount);
  const countScore = countDiff === 0 ? 10 : countDiff === 1 ? 9 : countDiff === 2 ? 8 : 6;

  const modelGroups = getModelPointGroups(model);
  const modelPoints = modelGroups.flat();
  const validStrokes = userStrokes.filter(stroke => stroke && stroke.length > 0);
  const resampledStrokes = validStrokes.map(stroke =>
    resamplePoints(stroke, Math.max(24, Math.min(48, stroke.length)))
  );
  const userPoints = resampledStrokes.flat();

  // 2. 雙向點雲距離：順序與方向無關，同時防止額外亂畫（包含多出獨立塗鴉筆畫）。
  const modelToUser = meanNearestDistance(modelPoints, userPoints);
  const userToModel = meanNearestDistance(userPoints, modelPoints);
  const maxStrokeDistance = resampledStrokes.reduce(
    (worst, strokePts) => Math.max(worst, meanNearestDistance(strokePts, modelPoints)),
    0
  );
  const avgDist = (modelToUser + userToModel) / 2;
  const shapeScore = Math.max(0, Math.min(60, Math.round(60 - Math.max(0, avgDist - 2.5) * 3.2)));

  // 3. 必要部件完整度：每個模板部件都必須真正出現（不可讓 i/j 豎幹誤過點點、或 t/f 豎幹誤過橫線）
  const coverages = modelGroups.map(group =>
    evaluateComponentCoverage(group, userPoints, { isTracing: false, componentTolerance: 12.5, userStrokes: resampledStrokes })
  );
  const missingIndices = [];
  const missingKinds = [];
  coverages.forEach((cov, idx) => {
    if (!cov.covered) {
      missingIndices.push(idx);
      missingKinds.push(cov.kind);
    }
  });
  const coveredComponents = expCount - missingIndices.length;
  const completenessScore = Math.round((coveredComponents / Math.max(1, expCount)) * 20);

  // 4. 四線位置、大小與比例。字形正確但略有自然偏移仍保留容錯。
  const modelBounds = getBounds(modelPoints);
  const userBounds = getBounds(userPoints);
  const centerDistance = Math.hypot(
    userBounds.centerX - modelBounds.centerX,
    userBounds.centerY - modelBounds.centerY
  );
  const sizeDistance = Math.abs(userBounds.width - modelBounds.width) * 0.25
    + Math.abs(userBounds.height - modelBounds.height) * 0.25;
  const placementScore = Math.max(0, Math.min(10, Math.round(10 - Math.max(0, centerDistance + sizeDistance - 4) * 0.45)));

  let totalScore = Math.min(100, Math.max(0, countScore + shapeScore + completenessScore + placementScore));
  const hasExcessScribble = userToModel > 15.0 || maxStrokeDistance > 15.5;
  const hasMissingComponent = missingIndices.length > 0;

  if (hasMissingComponent) {
    totalScore = Math.min(54, totalScore);
  }
  if (hasExcessScribble) {
    totalScore = Math.min(52, totalScore);
  }

  const passed = !hasMissingComponent && !hasExcessScribble && totalScore >= 60;
  const stars = !passed ? 1 : (totalScore >= 80 ? 3 : 2);

  let feedback = '字形、位置與比例都很清楚！大武山神筆勇士！';
  if (hasMissingComponent) {
    feedback = buildMissingComponentFeedback(targetChar, missingKinds);
  } else if (hasExcessScribble) {
    feedback = '筆跡有較多偏離字母形狀的線條，請沿著四線三格乾淨書寫喔！';
  } else if (totalScore < 60) {
    feedback = '請注意字母的完整形狀與四線三格位置，再試一次一定能成功！';
  } else if (totalScore < 80) {
    feedback = '書寫良好！再調整字母大小、比例與基線位置，就能衝上三星！';
  }

  return {
    score: totalScore,
    stars,
    passed,
    feedback,
    details: {
      countScore,
      directionScore: null,
      shapeScore,
      completenessScore,
      placementScore,
      userCount,
      expCount,
      orderRequired: false,
      missingIndices,
      averagePointDistance: Number(avgDist.toFixed(2)),
      userToModel: Number(userToModel.toFixed(2))
    }
  };
};
