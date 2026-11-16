import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  PRIORI_SUBJECTS,
  PRIORI_PAPERS,
  PRIORI_PAPER_MAP,
  PRIORI_QUESTION_INDEX,
  PRIORI_STATS,
} from '../src/data/priori/index.js';

const ROOT = process.cwd();
const FORBIDDEN_TTS_TOKENS = ['+', '-', '−', '×', '÷', '/', '=', '···', '...'];

const EXPECTED_G4_6_SPECS = {
  '114-math-g4': {
    subject: 'math',
    grade: 4,
    optCount: 4,
    figCount: 10,
    passageCount: 0,
    audioCount: 0,
    answers: [2, 2, 2, 3, 2, 1, 1, 0, 0, 2, 3, 0, 1, 0, 1, 3, 2, 2, 2, 1, 3, 1, 3, 0, 3],
  },
  '114-chinese-g4': {
    subject: 'chinese',
    grade: 4,
    optCount: 4,
    figCount: 0,
    passageCount: 2,
    audioCount: 0,
    answers: [3, 2, 0, 2, 1, 2, 1, 0, 3, 1, 2, 1, 1, 0, 2, 0, 3, 2, 0, 1, 2, 1, 2, 3, 0],
  },
  '114-english-g4': {
    subject: 'english',
    grade: 4,
    optCount: 3,
    figCount: 22,
    passageCount: 0,
    audioCount: 10,
    answers: [0, 0, 2, 1, 1, 0, 1, 0, 2, 0, 1, 0, 2, 1, 2, 0, 1, 0, 1, 2, 1, 2, 1, 2, 2],
  },
  '114-math-g5': {
    subject: 'math',
    grade: 5,
    optCount: 4,
    figCount: 6,
    passageCount: 0,
    audioCount: 0,
    answers: [0, 2, 3, 1, 2, 3, 0, 0, 2, 2, 3, 1, 3, 1, 1, 0, 3, 3, 2, 3, 1, 2, 0, 0, 0],
  },
  '114-chinese-g5': {
    subject: 'chinese',
    grade: 5,
    optCount: 4,
    figCount: 0,
    passageCount: 3,
    audioCount: 0,
    answers: [0, 1, 0, 2, 3, 1, 0, 1, 0, 1, 1, 2, 3, 0, 2, 1, 2, 0, 1, 1, 3, 2, 2, 0, 0],
  },
  '114-english-g5': {
    subject: 'english',
    grade: 5,
    optCount: 3,
    figCount: 22,
    passageCount: 0,
    audioCount: 10,
    answers: [2, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 2, 2, 2, 0, 1, 1, 0, 2, 2, 0, 1, 2, 0, 2],
  },
  '114-math-g6': {
    subject: 'math',
    grade: 6,
    optCount: 4,
    figCount: 4,
    passageCount: 0,
    audioCount: 0,
    answers: [1, 3, 0, 1, 3, 3, 0, 2, 1, 2, 0, 1, 2, 1, 2, 0, 1, 2, 2, 3, 3, 1, 0, 2, 0],
  },
  '114-chinese-g6': {
    subject: 'chinese',
    grade: 6,
    optCount: 4,
    figCount: 0,
    passageCount: 3,
    audioCount: 0,
    answers: [1, 2, 2, 2, 3, 1, 3, 1, 1, 1, 0, 1, 1, 1, 2, 0, 2, 2, 3, 0, 2, 0, 3, 3, 2],
  },
  '114-english-g6': {
    subject: 'english',
    grade: 6,
    optCount: 3,
    figCount: 19,
    passageCount: 0,
    audioCount: 10,
    answers: [1, 2, 0, 2, 2, 1, 0, 2, 2, 1, 1, 0, 0, 1, 0, 2, 2, 0, 1, 0, 2, 0, 1, 1, 0],
  },
};

function shannonEntropy(hist, total) {
  let h = 0;
  for (let i = 0; i < hist.length; i += 1) {
    if (hist[i] === 0) continue;
    const p = hist[i] / total;
    h -= p * Math.log2(p);
  }
  return h;
}

async function validateWebpAsset(publicRelPath) {
  const fullPath = path.join(ROOT, 'public', publicRelPath.replace(/^\/+/, ''));
  const stat = await fs.stat(fullPath);
  assert.ok(stat.size > 800, `WebP too small: ${publicRelPath} (${stat.size} bytes)`);
  const { data, info } = await sharp(fullPath).greyscale().raw().toBuffer({ resolveWithObject: true });
  const hist = new Uint32Array(256);
  let nonWhite = 0;
  for (let i = 0; i < data.length; i += 1) {
    const px = data[i];
    hist[px] += 1;
    if (px < 245) nonWhite += 1;
  }
  const nonWhiteRatio = nonWhite / data.length;
  const entropy = shannonEntropy(hist, data.length);
  assert.ok(
    nonWhiteRatio >= 0.015,
    `Asset ${publicRelPath} looks nearly blank (nonWhiteRatio=${nonWhiteRatio.toFixed(4)})`
  );
  assert.ok(
    entropy >= 0.25,
    `Asset ${publicRelPath} has suspiciously low entropy (${entropy.toFixed(3)})`
  );
  assert.ok(info.width >= 60 && info.height >= 40, `Asset ${publicRelPath} invalid dimensions ${info.width}x${info.height}`);
}

async function run() {
  console.log('=== PRIORI Year-114 Grades 4–6 Contract Verification ===');

  assert.equal(PRIORI_PAPERS.length, 37, 'PRIORI_PAPERS must list all 37 published papers');
  assert.equal(PRIORI_STATS.totalPapers, 37);
  assert.equal(PRIORI_STATS.totalQuestions, 925);
  assert.equal(Object.keys(PRIORI_QUESTION_INDEX).length, 925);

  for (const subj of PRIORI_SUBJECTS) {
    assert.deepEqual(
      subj.availableGrades,
      [3, 4, 5, 6],
      `Subject ${subj.id} must declare availableGrades [3, 4, 5, 6]`
    );
  }

  const checkedImages = new Set();
  const checkedAudios = new Set();

  for (const [paperId, spec] of Object.entries(EXPECTED_G4_6_SPECS)) {
    const paper = PRIORI_PAPER_MAP[paperId];
    assert.ok(paper, `Missing registered paper ${paperId}`);
    assert.equal(paper.year, 114);
    assert.equal(paper.subject, spec.subject);
    assert.equal(paper.grade, spec.grade);
    assert.equal(paper.totalQuestions, 25);
    assert.equal(paper.questions.length, 25);
    assert.equal(paper.officialAnswerVerified, true);
    assert.equal(paper.answerSource, 'official_pdf');

    const actualAnswers = paper.questions.map((q) => q.answer);
    assert.deepEqual(
      actualAnswers,
      spec.answers,
      `Answer mismatch on ${paperId}`
    );

    let figCount = 0;
    let audioCount = 0;
    const passages = new Set();

    for (let i = 0; i < paper.questions.length; i += 1) {
      const q = paper.questions[i];
      assert.equal(q.number, i + 1);
      assert.equal(q.questionType, 'single-choice');
      assert.equal(q.options.length, spec.optCount, `${q.id} option count mismatch`);
      assert.equal(q.optionTtsTexts.length, spec.optCount, `${q.id} optionTtsTexts mismatch`);
      assert.equal(q.ttsVerified, true, `${q.id} ttsVerified must be true`);
      assert.ok(q.answer >= 0 && q.answer < spec.optCount, `${q.id} answer out of range`);
      assert.ok(Array.isArray(q.explanationSteps) && q.explanationSteps.length >= 2, `${q.id} missing explanationSteps`);

      const allTts = [q.ttsText, ...q.optionTtsTexts, q.passage?.ttsText || ''];
      for (const line of allTts) {
        for (const tok of FORBIDDEN_TTS_TOKENS) {
          assert.ok(
            !line.includes(tok),
            `${q.id} contains forbidden TTS token "${tok}" in "${line}"`
          );
        }
      }

      assert.ok(q.questionImage, `${q.id} missing questionImage`);
      checkedImages.add(q.questionImage);
      if (/圖片/.test(q.prompt || '')) {
        assert.ok(q.figureImage || q.passage?.image, `${q.id} mentions "圖片" in prompt but has neither figureImage nor passage.image`);
      }
      if (q.figureImage) {
        figCount += 1;
        checkedImages.add(q.figureImage);
      }
      if (q.passage?.image) {
        passages.add(q.passage.image);
        checkedImages.add(q.passage.image);
      }
      if (q.passage) {
        const rawLen = (q.passage.paragraphs || []).join('').replace(/\s+/g, '').length;
        const ttsLen = (q.passage.ttsText || '').replace(/\s+/g, '').length;
        assert.ok(
          ttsLen >= Math.floor(rawLen * 0.9),
          `${q.id} passage.ttsText must read verbatim original passage (ttsLen=${ttsLen} < 0.9 * rawLen=${rawLen})`
        );
        for (const spoiler of ['跑廁所', '心存希望']) {
          assert.ok(
            !(q.passage.ttsText || '').includes(spoiler),
            `${q.id} passage.ttsText contains interpretive spoiler "${spoiler}"`
          );
        }
      }
      if (q.media?.audioSrc) {
        audioCount += 1;
        assert.equal(q.media.audioSourceType, 'official_mp3');
        checkedAudios.add(q.media.audioSrc);
      }
    }

    assert.equal(figCount, spec.figCount, `${paperId} figureImage count mismatch`);
    assert.equal(passages.size, spec.passageCount, `${paperId} passage image count mismatch`);
    assert.equal(audioCount, spec.audioCount, `${paperId} audioSrc count mismatch`);
  }

  for (const imgPath of checkedImages) {
    await validateWebpAsset(imgPath);
  }
  for (const audioPath of checkedAudios) {
    const fullAudioPath = path.join(ROOT, 'public', audioPath.replace(/^\/+/, ''));
    const stat = await fs.stat(fullAudioPath);
    assert.ok(stat.size > 15000, `MP3 too small (${stat.size} bytes): ${audioPath}`);
  }

  console.log(
    `✓ Validated 9 Year-114 G4–G6 papers (225 Qs), ${checkedImages.size} WebP images, ${checkedAudios.size} official MP3 clips.`
  );
  console.log('✓ Total catalog: 37 papers / 925 questions passed.');
}

run().catch((err) => {
  console.error('❌ PRIORI 114 G4–G6 contract failed:', err);
  process.exit(1);
});
