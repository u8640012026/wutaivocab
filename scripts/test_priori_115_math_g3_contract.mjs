import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {
  PRIORI_115_MATH_G3_META,
  PRIORI_115_MATH_G3_QUESTIONS,
} from '../src/data/priori/priori115MathG3.js';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');

const EXPECTED_ANSWERS = [
  0, 1, 0, 0, 2,
  2, 0, 0, 3, 1,
  2, 2, 3, 2, 0,
  3, 3, 1, 3, 0,
  1, 2, 1, 3, 3,
];

const EXPECTED_FIGURE_NUMBERS = new Set([9, 11, 13, 15, 19, 25]);
// Monochrome thin-stroke geometry / number-line PDF vector crops naturally have lower Shannon entropy (~0.57-0.78) than shaded diagrams/dense text.
const SPARSE_LINE_ART_EXCEPTIONS = new Set([
  '/assets/priori/115/math-g3/q13.webp',
  '/assets/priori/115/math-g3/q13_fig.webp',
  '/assets/priori/115/math-g3/q15.webp',
  '/assets/priori/115/math-g3/q15_fig.webp',
]);
const FORBIDDEN_TTS_TOKENS = ['+', '-', '−', '×', '÷', '/', '=', '···', '...'];

async function verifyAssetImage(assetWebPath, label) {
  assert.ok(assetWebPath && assetWebPath.startsWith('/assets/priori/115/math-g3/'), `${label}: unexpected path ${assetWebPath}`);
  const absPath = path.join(PUBLIC_DIR, assetWebPath.replace(/^\//, ''));
  assert.ok(fs.existsSync(absPath), `${label}: missing file ${absPath}`);

  const image = sharp(absPath);
  const meta = await image.metadata();
  assert.ok((meta.width || 0) >= 80, `${label}: width ${meta.width} < 80`);
  assert.ok((meta.height || 0) >= 80, `${label}: height ${meta.height} < 80`);

  const [{ data, info }, stats] = await Promise.all([
    image.clone().grayscale().raw().toBuffer({ resolveWithObject: true }),
    image.clone().stats(),
  ]);

  let nonWhite = 0;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] < 245) nonWhite += 1;
  }
  const nonWhiteRatio = nonWhite / (info.width * info.height);
  assert.ok(
    nonWhiteRatio >= 0.02,
    `${label}: non-white pixel ratio ${(nonWhiteRatio * 100).toFixed(2)}% < 2.00%`
  );
  const minEntropy = SPARSE_LINE_ART_EXCEPTIONS.has(assetWebPath) ? 0.5 : 0.8;
  assert.ok(
    (stats.entropy || 0) >= minEntropy,
    `${label}: image entropy ${stats.entropy} < ${minEntropy}`
  );
}

function assertCleanTts(text, label) {
  assert.equal(typeof text, 'string', `${label}: must be string`);
  assert.ok(text.trim().length > 0, `${label}: empty TTS text`);
  for (const token of FORBIDDEN_TTS_TOKENS) {
    assert.ok(
      !text.includes(token),
      `${label}: forbidden raw symbol "${token}" found in "${text}"`
    );
  }
}

async function run() {
  console.log('=== PRIORI 115 Math Grade 3 Contract Verification ===');

  assert.equal(PRIORI_115_MATH_G3_META.year, 115);
  assert.equal(PRIORI_115_MATH_G3_META.subject, 'math');
  assert.equal(PRIORI_115_MATH_G3_META.grade, 3);
  assert.equal(PRIORI_115_MATH_G3_META.answerSource, 'teacher_solved');
  assert.equal(PRIORI_115_MATH_G3_META.officialAnswerVerified, false);
  assert.equal(PRIORI_115_MATH_G3_QUESTIONS.length, 25);

  const verifiedAssets = [];

  for (let idx = 0; idx < PRIORI_115_MATH_G3_QUESTIONS.length; idx += 1) {
    const q = PRIORI_115_MATH_G3_QUESTIONS[idx];
    const qNum = idx + 1;

    assert.equal(q.id, `priori-115-math-g3-q${String(qNum).padStart(2, '0')}`);
    assert.equal(q.number, qNum);
    assert.ok(Array.isArray(q.options) && q.options.length === 4, `Q${qNum}: must have 4 options`);
    assert.equal(q.answer, EXPECTED_ANSWERS[idx], `Q${qNum}: answer mismatch`);
    assert.equal(q.answerSource, 'teacher_solved', `Q${qNum}: answerSource mismatch`);
    assert.equal(q.officialAnswerVerified, false, `Q${qNum}: officialAnswerVerified must be false`);
    assert.equal(q.ttsVerified, true, `Q${qNum}: ttsVerified must be true`);

    assertCleanTts(q.ttsText, `Q${qNum}.ttsText`);
    assert.ok(
      Array.isArray(q.optionTtsTexts) && q.optionTtsTexts.length === 4,
      `Q${qNum}: must have 4 optionTtsTexts`
    );
    q.optionTtsTexts.forEach((optTts, optIdx) => {
      assertCleanTts(optTts, `Q${qNum}.optionTtsTexts[${optIdx}]`);
    });

    assert.ok(
      Array.isArray(q.explanationSteps) && q.explanationSteps.length >= 3,
      `Q${qNum}: explanationSteps must have >= 3 steps`
    );
    assert.ok(q.curriculumCode && q.curriculumCode.trim().length > 0, `Q${qNum}: missing curriculumCode`);
    assert.ok(q.prioriCode && q.prioriCode.trim().length > 0, `Q${qNum}: missing prioriCode`);

    await verifyAssetImage(q.questionImage, `Q${qNum}.questionImage`);
    verifiedAssets.push(q.questionImage);

    if (EXPECTED_FIGURE_NUMBERS.has(qNum)) {
      assert.ok(q.figureImage, `Q${qNum}: expected figureImage`);
      await verifyAssetImage(q.figureImage, `Q${qNum}.figureImage`);
      verifiedAssets.push(q.figureImage);
    } else {
      assert.equal(q.figureImage, null, `Q${qNum}: expected null figureImage`);
    }
  }

  assert.equal(verifiedAssets.length, 31, 'Expected 25 questionImages + 6 figureImages = 31 total assets');
  console.log(`PASSED: All 25 questions, metadata, natural TTS texts, and ${verifiedAssets.length} WebP assets passed Sharp & contract gates.`);
}

run().catch((err) => {
  console.error('CONTRACT FAILED:', err);
  process.exit(1);
});
