import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import {
  PRIORI_114_MATH_G3_META,
  PRIORI_114_MATH_G3_QUESTIONS,
} from '../src/data/priori/priori114MathG3.js';
import {
  PRIORI_114_CHINESE_G3_META,
  PRIORI_114_CHINESE_G3_QUESTIONS,
} from '../src/data/priori/priori114ChineseG3.js';
import {
  PRIORI_114_ENGLISH_G3_META,
  PRIORI_114_ENGLISH_G3_QUESTIONS,
} from '../src/data/priori/priori114EnglishG3.js';
import {
  PRIORI_PAPERS,
  PRIORI_PAPER_MAP,
  PRIORI_QUESTION_INDEX,
  PRIORI_STATS,
} from '../src/data/priori/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const FORBIDDEN_TTS_TOKENS = ['+', '-', '−', '×', '÷', '/', '=', '···', '...'];
const SPARSE_LINEART_ALLOWLIST = new Set([
  '/assets/priori/114/math-g3/q20_fig.webp', // Thin hollow 8cm x 5cm rectangle diagram (1.68% ink)
]);

const EXPECTED_MATH_ANSWERS = [
  3, 1, 2, 0, 0,
  2, 3, 3, 1, 1,
  2, 3, 2, 2, 3,
  0, 3, 2, 1, 1,
  0, 1, 0, 3, 2,
];

const EXPECTED_CHINESE_ANSWERS = [
  3, 1, 3, 2, 3,
  0, 0, 0, 1, 2,
  1, 2, 1, 1, 3,
  1, 3, 3, 2, 1,
  0, 2, 3, 2, 3,
];

const EXPECTED_ENGLISH_ALPHABET_ANSWERS = [
  'V, v', 'N, n', 'J, j', 'T, t', 'C, c',
  'P, p', 'F, f', 'G, g', 'S, s', 'Y, y',
  'U, u', 'D, d', 'Q, q', 'L, l', 'H, h',
];

const EXPECTED_ENGLISH_MCQ_ANSWERS = [
  0, 0, 1, 0, 1, 0, // Q16-Q21 (O=0, X=1)
  2, 0, 2, 2,       // Q22-Q25 (3-picture choice)
];

function computeShannonEntropy(channelData) {
  const hist = new Uint32Array(256);
  for (let i = 0; i < channelData.length; i += 1) {
    hist[channelData[i]] += 1;
  }
  const total = channelData.length;
  let entropy = 0;
  for (let b = 0; b < 256; b += 1) {
    if (hist[b] === 0) continue;
    const p = hist[b] / total;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

async function inspectImageAsset(publicRelPath, label) {
  const absPath = path.join(PUBLIC_DIR, publicRelPath.replace(/^\//, ''));
  assert.ok(fs.existsSync(absPath), `Missing image asset for ${label}: ${absPath}`);
  const meta = await sharp(absPath).metadata();
  assert.ok(
    (meta.width || 0) >= 80 && (meta.height || 0) >= 36,
    `Image dimensions unexpectedly small for ${label} (${publicRelPath}): ${meta.width}x${meta.height}`
  );

  const { data, info } = await sharp(absPath)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let nonWhiteCount = 0;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] < 245) nonWhiteCount += 1;
  }
  const nonWhiteRatio = nonWhiteCount / (info.width * info.height);
  const entropy = computeShannonEntropy(data);

  const minNonWhite = SPARSE_LINEART_ALLOWLIST.has(publicRelPath) ? 0.01 : 0.02;
  const minEntropy = SPARSE_LINEART_ALLOWLIST.has(publicRelPath) ? 0.2 : 0.35;

  assert.ok(
    nonWhiteRatio >= minNonWhite,
    `Image looks near-blank for ${label} (${publicRelPath}): nonWhiteRatio=${nonWhiteRatio.toFixed(4)}`
  );
  assert.ok(
    entropy >= minEntropy,
    `Image entropy too low for ${label} (${publicRelPath}): entropy=${entropy.toFixed(3)}`
  );

  return {
    path: publicRelPath,
    width: meta.width,
    height: meta.height,
    nonWhiteRatio,
    entropy,
  };
}

function assertCleanTts(text, label) {
  assert.ok(typeof text === 'string' && text.trim().length >= 4, `Empty TTS text at ${label}`);
  for (const token of FORBIDDEN_TTS_TOKENS) {
    assert.ok(
      !text.includes(token),
      `Forbidden raw symbol "${token}" found in TTS at ${label}: "${text}"`
    );
  }
}

async function main() {
  // 1. Index & Registry Checks
  assert.equal(PRIORI_PAPERS.length, 4, 'PRIORI_PAPERS must list all 4 papers (115 Math + 114 3-subjects)');
  assert.equal(PRIORI_STATS.totalPapers, 4);
  assert.equal(PRIORI_STATS.totalQuestions, 100);
  assert.ok(PRIORI_PAPER_MAP['114-math-g3']);
  assert.ok(PRIORI_PAPER_MAP['114-chinese-g3']);
  assert.ok(PRIORI_PAPER_MAP['114-english-g3']);
  assert.equal(Object.keys(PRIORI_QUESTION_INDEX).length, 100);

  // 2. Meta Checks
  const metas = [
    [PRIORI_114_MATH_G3_META, '114-math-g3', 'math'],
    [PRIORI_114_CHINESE_G3_META, '114-chinese-g3', 'chinese'],
    [PRIORI_114_ENGLISH_G3_META, '114-english-g3', 'english'],
  ];
  for (const [meta, expectedId, expectedSubject] of metas) {
    assert.equal(meta.paperId, expectedId);
    assert.equal(meta.subject, expectedSubject);
    assert.equal(meta.year, 114);
    assert.equal(meta.grade, 3);
    assert.equal(meta.totalQuestions, 25);
    assert.equal(meta.pointsPerQuestion, 4);
    assert.equal(meta.totalPoints, 100);
    assert.equal(meta.officialAnswerVerified, true);
    assert.equal(meta.answerSource, 'official_pdf');
  }

  assert.equal(PRIORI_114_MATH_G3_QUESTIONS.length, 25);
  assert.equal(PRIORI_114_CHINESE_G3_QUESTIONS.length, 25);
  assert.equal(PRIORI_114_ENGLISH_G3_QUESTIONS.length, 25);

  const imageStats = [];
  const checkedImages = new Set();
  async function checkUniqueImage(relPath, label) {
    if (!relPath) return;
    if (checkedImages.has(relPath)) {
      const absPath = path.join(PUBLIC_DIR, relPath.replace(/^\//, ''));
      assert.ok(fs.existsSync(absPath), `Missing repeated image ${relPath}`);
      return;
    }
    checkedImages.add(relPath);
    imageStats.push(await inspectImageAsset(relPath, label));
  }

  // 3. Validate 114 Math G3
  for (let i = 0; i < 25; i += 1) {
    const q = PRIORI_114_MATH_G3_QUESTIONS[i];
    assert.equal(q.number, i + 1);
    assert.equal(q.officialAnswerVerified, true);
    assert.equal(q.answerSource, 'official_pdf');
    assert.equal(q.answer, EXPECTED_MATH_ANSWERS[i], `Math Q${q.number} answer mismatch`);
    assert.equal(q.options.length, 4, `Math Q${q.number} must have 4 options`);
    assert.ok(q.explanationSteps.length >= 3, `Math Q${q.number} explanationSteps < 3`);
    assertCleanTts(q.ttsText, `Math Q${q.number} ttsText`);
    assert.equal(q.optionTtsTexts.length, 4, `Math Q${q.number} optionTtsTexts length != 4`);
    q.optionTtsTexts.forEach((optTts, idx) =>
      assertCleanTts(optTts, `Math Q${q.number} option[${idx}]`)
    );
    await checkUniqueImage(q.questionImage, `Math Q${q.number} questionImage`);
    if (q.figureImage) {
      await checkUniqueImage(q.figureImage, `Math Q${q.number} figureImage`);
    }
  }

  // 4. Validate 114 Chinese G3
  for (let i = 0; i < 25; i += 1) {
    const q = PRIORI_114_CHINESE_G3_QUESTIONS[i];
    assert.equal(q.number, i + 1);
    assert.equal(q.officialAnswerVerified, true);
    assert.equal(q.answerSource, 'official_pdf');
    assert.equal(q.answer, EXPECTED_CHINESE_ANSWERS[i], `Chinese Q${q.number} answer mismatch`);
    assert.equal(q.options.length, 4, `Chinese Q${q.number} must have 4 options`);
    assert.ok(q.explanationSteps.length >= 3, `Chinese Q${q.number} explanationSteps < 3`);
    assertCleanTts(q.ttsText, `Chinese Q${q.number} ttsText`);
    assert.equal(q.optionTtsTexts.length, 4);
    q.optionTtsTexts.forEach((optTts, idx) =>
      assertCleanTts(optTts, `Chinese Q${q.number} option[${idx}]`)
    );

    if (q.number >= 20 && q.number <= 22) {
      assert.equal(q.groupId, 'chi-114-g3-g1');
      assert.ok(q.passage?.paragraphs?.length >= 5, `Chinese Q${q.number} missing passage paragraphs`);
      assertCleanTts(q.passage.ttsText, `Chinese Q${q.number} passage.ttsText`);
      await checkUniqueImage(q.passage.image, `Chinese Q${q.number} passage.image`);
    } else if (q.number >= 23 && q.number <= 25) {
      assert.equal(q.groupId, 'chi-114-g3-g2');
      assert.ok(q.passage?.paragraphs?.length >= 5, `Chinese Q${q.number} missing passage paragraphs`);
      assertCleanTts(q.passage.ttsText, `Chinese Q${q.number} passage.ttsText`);
      await checkUniqueImage(q.passage.image, `Chinese Q${q.number} passage.image`);
    }
    await checkUniqueImage(q.questionImage, `Chinese Q${q.number} questionImage`);
  }

  // 5. Validate 114 English G3 (+ MP3 audio files)
  for (let i = 0; i < 25; i += 1) {
    const q = PRIORI_114_ENGLISH_G3_QUESTIONS[i];
    assert.equal(q.number, i + 1);
    assert.equal(q.officialAnswerVerified, true);
    assert.equal(q.answerSource, 'official_pdf');
    assert.ok(q.explanationSteps.length >= 3, `English Q${q.number} explanationSteps < 3`);
    assertCleanTts(q.ttsText, `English Q${q.number} ttsText`);

    assert.ok(q.media?.audioSrc, `English Q${q.number} missing media.audioSrc`);
    assert.equal(q.media.audioSourceType, 'official_mp3');
    const audioPath = path.join(PUBLIC_DIR, q.media.audioSrc.replace(/^\//, ''));
    assert.ok(fs.existsSync(audioPath), `Missing MP3 audio for English Q${q.number}: ${audioPath}`);
    const audioSize = fs.statSync(audioPath).size;
    assert.ok(audioSize > 5000, `Audio file too small for English Q${q.number}: ${audioSize} bytes`);

    if (q.number <= 15) {
      assert.equal(q.questionType, 'alphabet-pair');
      assert.equal(q.answer, EXPECTED_ENGLISH_ALPHABET_ANSWERS[i], `English Q${q.number} answer mismatch`);
      assert.equal(q.expectedUpper, EXPECTED_ENGLISH_ALPHABET_ANSWERS[i].split(',')[0].trim());
      assert.equal(q.expectedLower, EXPECTED_ENGLISH_ALPHABET_ANSWERS[i].split(',')[1].trim());
      assert.equal(q.options.length, 0);
    } else if (q.number <= 21) {
      assert.equal(q.questionType, 'single-choice');
      assert.equal(q.options.length, 2, `English Q${q.number} must have 2 options (O/X)`);
      assert.equal(
        q.answer,
        EXPECTED_ENGLISH_MCQ_ANSWERS[q.number - 16],
        `English Q${q.number} O/X answer mismatch`
      );
      q.optionTtsTexts.forEach((optTts, idx) =>
        assertCleanTts(optTts, `English Q${q.number} option[${idx}]`)
      );
    } else {
      assert.equal(q.questionType, 'single-choice');
      assert.equal(q.options.length, 3, `English Q${q.number} must have 3 picture options`);
      assert.equal(
        q.answer,
        EXPECTED_ENGLISH_MCQ_ANSWERS[q.number - 16],
        `English Q${q.number} dialogue answer mismatch`
      );
      assert.ok(q.figureImage, `English Q${q.number} missing figureImage`);
      await checkUniqueImage(q.figureImage, `English Q${q.number} figureImage`);
      q.optionTtsTexts.forEach((optTts, idx) =>
        assertCleanTts(optTts, `English Q${q.number} option[${idx}]`)
      );
    }

    await checkUniqueImage(q.questionImage, `English Q${q.number} questionImage`);
  }

  // 6. Verify exact expected crop file count = 90 WebPs (34 math + 27 chi + 29 eng)
  assert.equal(checkedImages.size, 90, `Expected 90 unique 114 G3 WebPs, found ${checkedImages.size}`);

  const lowEntropy = imageStats.filter((s) => s.entropy < 0.8);
  const minEntropy = Math.min(...imageStats.map((s) => s.entropy));
  const minNonWhite = Math.min(...imageStats.map((s) => s.nonWhiteRatio));

  console.log('✅ PRIORI 114 G3 3-subject contract test passed!');
  console.log(
    `   Papers: 3 × 25 = 75 official-answer questions | MP3 clips: 25 | Unique WebPs: ${checkedImages.size}`
  );
  console.log(
    `   Image metrics: min nonWhiteRatio=${minNonWhite.toFixed(4)}, min entropy=${minEntropy.toFixed(3)}`
  );
  if (lowEntropy.length > 0) {
    console.log(
      '   Sparse B&W line-art (< 0.80 entropy):',
      lowEntropy.map((s) => `${s.path} (${s.entropy.toFixed(3)})`).join(', ')
    );
  }
}

main().catch((err) => {
  console.error('❌ PRIORI 114 G3 contract test failed:', err);
  process.exit(1);
});
