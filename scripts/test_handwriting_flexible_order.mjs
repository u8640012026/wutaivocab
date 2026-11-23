import fs from 'node:fs';
import {
  ALL_STROKES,
  evaluateHandwriting,
  matchTracingStroke,
  evaluateTracingCompletion
} from '../src/services/alphabetStrokes.js';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const asUserStroke = (stroke, reverse = false) => {
  const points = (stroke.sample || []).map(([x, y]) => ({ x, y }));
  return reverse ? points.reverse() : points;
};

console.log('HANDWRITING FLEXIBLE ORDER & MISSING COMPONENT CONTRACT');

const aModel = ALL_STROKES.A;
const reorderedReversedA = [
  asUserStroke(aModel.strokes[2], true),
  asUserStroke(aModel.strokes[1], true),
  asUserStroke(aModel.strokes[0], true)
];
const aResult = evaluateHandwriting({ targetChar: 'A', userStrokes: reorderedReversedA });
assert(aResult.passed && aResult.score >= 80, `Reordered/reversed A must pass, got ${aResult.score}`);
assert(aResult.details.orderRequired === false, 'Stroke order must be diagnostic only');

const zModel = ALL_STROKES.Z;
const continuousZ = zModel.strokes.flatMap((stroke, index) => {
  const points = asUserStroke(stroke);
  return index === 0 ? points : points.slice(1);
});
const zResult = evaluateHandwriting({ targetChar: 'Z', userStrokes: [continuousZ] });
assert(zResult.passed && zResult.score >= 75, `Continuous-stroke Z must pass, got ${zResult.score}`);

// 自然一筆連寫小寫字母 a, b, d, g, h, m, n, p, q, u 全數必須通過描紅與自由書寫
for (const ch of ['a', 'b', 'd', 'g', 'h', 'm', 'n', 'p', 'q', 'u']) {
  const mod = ALL_STROKES[ch];
  const joined = mod.strokes.flatMap((stroke, index) => {
    const pts = asUserStroke(stroke);
    return index === 0 ? pts : pts.slice(1);
  });
  const tc = evaluateTracingCompletion({ targetChar: ch, userStrokes: [joined] });
  const hw = evaluateHandwriting({ targetChar: ch, userStrokes: [joined] });
  assert(tc.completed, `Continuous lowercase ${ch} must complete tracing`);
  assert(hw.passed && hw.score >= 75, `Continuous lowercase ${ch} must pass freehand, got ${hw.score}`);
}

// 寫小寫 a 一筆繞圓直接下拉右尾（未刻意回到頂端 y=45）也必須自然通過
const naturalOneStrokeA = [
  { x: 64, y: 50 }, { x: 50, y: 45 }, { x: 34, y: 52 }, { x: 32, y: 62 },
  { x: 42, y: 73 }, { x: 58, y: 74 }, { x: 67, y: 64 }, { x: 68, y: 55 },
  { x: 68, y: 66 }, { x: 68, y: 75 }
];
assert(
  evaluateTracingCompletion({ targetChar: 'a', userStrokes: [naturalOneStrokeA] }).completed,
  'Natural 1-stroke lowercase a must complete tracing'
);
assert(
  evaluateHandwriting({ targetChar: 'a', userStrokes: [naturalOneStrokeA] }).passed,
  'Natural 1-stroke lowercase a must pass freehand'
);

// 漏點與漏橫防誤過：沒點的 i / j 與沒橫的 t / f 在描紅與自由書寫皆必須攔截失敗
for (const ch of ['i', 'j']) {
  const stemOnly = asUserStroke(ALL_STROKES[ch].strokes[0]);
  const tr = matchTracingStroke({ targetChar: ch, userStroke: stemOnly, completedStrokeIndices: [] });
  const tc = evaluateTracingCompletion({ targetChar: ch, userStrokes: [stemOnly] });
  const hw = evaluateHandwriting({ targetChar: ch, userStrokes: [stemOnly] });
  assert(!tr.matchedIndices.includes(1), `Tracing ${ch} stem alone must NOT mark dot as matched`);
  assert(!tc.completed, `Tracing ${ch} without dot must NOT complete`);
  assert(!hw.passed && hw.score < 60, `Freehand ${ch} without dot must fail, got ${hw.score}`);
}

// 自然寫偏延長樣本：從 y=38 甚至 y=28 直接一筆直拉下來的 i / j 單幹（未另點點點），同樣必須攔截為漏點
const extendedIStemY38 = [{ x: 50, y: 38 }, { x: 50, y: 45 }, { x: 50, y: 55 }, { x: 50, y: 65 }, { x: 50, y: 75 }];
const extendedIStemY28 = [{ x: 50, y: 28 }, { x: 50, y: 40 }, { x: 50, y: 55 }, { x: 50, y: 75 }];
const extendedJStemY38 = [
  { x: 58, y: 38 }, { x: 58, y: 45 }, { x: 58, y: 60 }, { x: 58, y: 75 },
  { x: 58, y: 95 }, { x: 52, y: 103 }, { x: 42, y: 103 }, { x: 36, y: 95 }
];
for (const [ch, extStem] of [['i', extendedIStemY38], ['i', extendedIStemY28], ['j', extendedJStemY38]]) {
  const tr = matchTracingStroke({ targetChar: ch, userStroke: extStem, completedStrokeIndices: [] });
  const tc = evaluateTracingCompletion({ targetChar: ch, userStrokes: [extStem] });
  const hw = evaluateHandwriting({ targetChar: ch, userStrokes: [extStem] });
  assert(!tr.matchedIndices.includes(1), `Extended single-stroke ${ch} must NOT absorb dot`);
  assert(!tc.completed, `Extended single-stroke ${ch} tracing without separate dot must NOT complete`);
  assert(!hw.passed && hw.score < 60, `Extended single-stroke ${ch} freehand without separate dot must fail, got ${hw.score}`);
}

// 同時保留自然容錯：直幹略偏到 y=38，但有補上獨立輕點（支援先點後寫 & 單點點擊）則必須通過
assert(
  evaluateTracingCompletion({ targetChar: 'i', userStrokes: [extendedIStemY38, [{ x: 50, y: 28 }, { x: 50.6, y: 28.6 }]] }).completed,
  'Extended i stem plus dedicated tap dot must complete tracing'
);
assert(
  evaluateHandwriting({ targetChar: 'i', userStrokes: [[{ x: 50, y: 28 }, { x: 50.6, y: 28.6 }], extendedIStemY38] }).passed,
  'Dot-first i with slightly tall stem must pass freehand'
);
assert(
  evaluateTracingCompletion({ targetChar: 'j', userStrokes: [[{ x: 58, y: 28 }], extendedJStemY38] }).completed,
  'Single-point dot-first j must complete tracing'
);
assert(
  evaluateHandwriting({ targetChar: 'j', userStrokes: [[{ x: 58, y: 28 }, { x: 58.6, y: 28.6 }], extendedJStemY38] }).passed,
  'Dot-first j with separate dot must pass freehand'
);

for (const ch of ['t', 'f']) {
  const stemOnly = asUserStroke(ALL_STROKES[ch].strokes[0]);
  const tr = matchTracingStroke({ targetChar: ch, userStroke: stemOnly, completedStrokeIndices: [] });
  const tc = evaluateTracingCompletion({ targetChar: ch, userStrokes: [stemOnly] });
  const hw = evaluateHandwriting({ targetChar: ch, userStrokes: [stemOnly] });
  assert(!tr.matchedIndices.includes(1), `Tracing ${ch} stem alone must NOT mark crossbar as matched`);
  assert(!tc.completed, `Tracing ${ch} without crossbar must NOT complete`);
  assert(!hw.passed && hw.score < 60, `Freehand ${ch} without crossbar must fail, got ${hw.score}`);
}

// 無關直線與大面積亂畫必攔截
const badAResult = evaluateHandwriting({
  targetChar: 'A',
  userStrokes: [[{ x: 10, y: 105 }, { x: 90, y: 105 }]]
});
assert(!badAResult.passed, `Unrelated line must fail A, got ${badAResult.score}`);

const scribbleA = [
  ...aModel.strokes.map(s => asUserStroke(s)),
  [{ x: 5, y: 10 }, { x: 95, y: 110 }, { x: 5, y: 110 }, { x: 95, y: 10 }, { x: 10, y: 55 }, { x: 90, y: 55 }]
];
const scribbleResult = evaluateHandwriting({ targetChar: 'A', userStrokes: scribbleA });
assert(!scribbleResult.passed, `Excessive scribble over A must fail, got ${scribbleResult.score}`);

const iModel = ALL_STROKES.i;
const dotFirst = matchTracingStroke({
  targetChar: 'i',
  userStroke: asUserStroke(iModel.strokes[1]),
  completedStrokeIndices: []
});
assert(dotFirst.accepted && dotFirst.matchedIndices.includes(1), 'Lowercase i dot must be accepted before the stem');

const tracedContinuousZ = matchTracingStroke({
  targetChar: 'Z',
  userStroke: continuousZ,
  completedStrokeIndices: []
});
assert(tracedContinuousZ.accepted, 'Tracing must accept a clean continuous Z');
assert(tracedContinuousZ.matchedIndices.length === 3, 'Continuous Z must cover all three suggested components');

// 教學模板使用國小正體印刷手寫造形：a/g 為單層圓腹，q 有下降部。
assert(ALL_STROKES.a.strokes.length === 2, 'Lowercase a must use the two-component single-storey manuscript form');
assert(ALL_STROKES.g.strokes.some(stroke => stroke.sample.some(([, y]) => y > 90)), 'Lowercase g must include a descender');
assert(ALL_STROKES.q.strokes.some(stroke => stroke.sample.some(([, y]) => y >= 100)), 'Lowercase q must include a descender');
assert(ALL_STROKES.G.strokes.length === 2 && ALL_STROKES.G.strokes[1].start.y === ALL_STROKES.G.strokes[1].end.y, 'Uppercase G must keep its clear manuscript inner bar');
assert(ALL_STROKES.t.strokes.length === 2 && ALL_STROKES.t.strokes[1].start.y === ALL_STROKES.t.strokes[1].end.y, 'Lowercase t must keep its separate manuscript crossbar');

const handwritingSource = fs.readFileSync(new URL('../src/games/handwriting/HandwritingGame.jsx', import.meta.url), 'utf8');
assert(handwritingSource.includes("['upper', 'lower', 'mixed'].includes(settings?.alphaMode)"), 'Handwriting must honor upper/lower/mixed alphaMode');
assert(handwritingSource.includes('matchTracingStroke'), 'Tracing UI must use geometry matching instead of pen-lift counting');
assert(handwritingSource.includes('evaluateTracingCompletion'), 'Tracing UI must use whole-character completion verification');

console.log('✓ Alternative stroke order and reverse direction accepted');
console.log('✓ Continuous 1-stroke a, b, d, g, h, m, n, p, q, u, Z accepted');
console.log('✓ Missing dot (i, j) and missing crossbar (t, f) strictly rejected');
console.log('✓ Unrelated scribbles rejected');
console.log('✓ Primary manuscript a/G/g/q/t forms protected');
console.log('✓ upper/lower/mixed lobby selection honored');
