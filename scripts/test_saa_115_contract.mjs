import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import {
  SAA_115_G4_QUESTIONS,
  SAA_115_G5_QUESTIONS,
  SAA_115_G6_QUESTIONS,
  SAA_115_ALL_QUESTIONS,
  SAA_ALL_EXAM_PAPERS,
} from '../src/data/exam/saa/index.js';

// Verified 105/105 official Ministry of Education SAA 115 answer keys (A=0, B=1, C=2, D=3)
export const EXPECTED_OFFICIAL_ANSWERS_115 = {
  4: [0, 0, 2, 1, 3, 2, 2, 1, 3, 3, 2, 3, 0, 2, 0, 3, 3, 1, 0, 1, 0, 2, 1, 3, 1, 3, 1, 1, 3, 2, 0, 0, 2, 0, 1],
  5: [3, 1, 3, 3, 3, 0, 3, 0, 1, 0, 1, 1, 1, 1, 2, 1, 0, 0, 0, 3, 0, 3, 1, 2, 2, 2, 2, 2, 3, 2, 1, 0, 3, 2, 0],
  6: [1, 0, 3, 2, 3, 3, 2, 3, 0, 3, 1, 0, 2, 0, 1, 0, 2, 3, 2, 3, 1, 0, 0, 1, 1, 0, 2, 3, 1, 1, 2, 1, 2, 3, 2],
};

const PAPERS_BY_GRADE = {
  4: SAA_115_G4_QUESTIONS,
  5: SAA_115_G5_QUESTIONS,
  6: SAA_115_G6_QUESTIONS,
};

const MIN_NON_WHITE_PCT = 2.0;
const MIN_ENTROPY = 0.8;
// 0.5% catches accidental duplicate/same-box crops while allowing clock-digit variants (e.g. g4-24 11:14 vs 11:40 = 0.76%)
const MIN_PAIRWISE_DIFF_PCT = 0.5;

async function resolveOptionalFfmpeg() {
  try {
    const p = (await import('ffmpeg-static')).default;
    const check = spawnSync(p, ['-version'], { encoding: 'utf8' });
    if (check.status === 0) return p;
  } catch { /* fallback */ }
  const check = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
  return check.status === 0 ? 'ffmpeg' : null;
}

async function main() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  SAA 115 OFFICIAL CONTRACT & INTEGRITY AUDIT SUITE           ');
  console.log('══════════════════════════════════════════════════════════════');

  const errors = [];

  // 1. Question Count & Structure
  console.log('\n[1/9] Auditing Question Count & Grade Distribution...');
  const gradeCounts = {
    4: SAA_115_G4_QUESTIONS.length,
    5: SAA_115_G5_QUESTIONS.length,
    6: SAA_115_G6_QUESTIONS.length,
  };
  console.log(`  • Grade 4: ${gradeCounts[4]} / 35 questions`);
  console.log(`  • Grade 5: ${gradeCounts[5]} / 35 questions`);
  console.log(`  • Grade 6: ${gradeCounts[6]} / 35 questions`);
  console.log(`  • Total 115 Questions: ${SAA_115_ALL_QUESTIONS.length} / 105`);

  for (const [grade, count] of Object.entries(gradeCounts)) {
    if (count !== 35) errors.push(`Grade ${grade} count must be 35, got ${count}`);
  }
  if (SAA_115_ALL_QUESTIONS.length !== 105) {
    errors.push(`Total 115 question count must be 105, got ${SAA_115_ALL_QUESTIONS.length}`);
  }

  // 2. Sections
  console.log('\n[2/9] Auditing Question Sections (Q1-15 Listening / Q16-35 Reading)...');
  for (const q of SAA_115_ALL_QUESTIONS) {
    if (q.number <= 15 && q.section !== 'listening') {
      errors.push(`[${q.id}] Q${q.number} must have section 'listening', got '${q.section}'`);
    }
    if (q.number > 15 && q.section !== 'reading') {
      errors.push(`[${q.id}] Q${q.number} must have section 'reading', got '${q.section}'`);
    }
  }

  // 3. Official Metadata Contract (SSOT)
  console.log('\n[3/9] Auditing Official Metadata (sourceType, track, preserveOptionOrder)...');
  for (const q of SAA_115_ALL_QUESTIONS) {
    if (q.year !== 115) errors.push(`[${q.id}] year must be 115, got ${q.year}`);
    if (![4, 5, 6].includes(q.grade)) errors.push(`[${q.id}] invalid grade ${q.grade}`);
    if (q.track !== 'ministry-assessment') errors.push(`[${q.id}] invalid track '${q.track}'`);
    if (q.sourceType !== 'official') errors.push(`[${q.id}] sourceType must be 'official', got '${q.sourceType}'`);
    if (q.sourceStatus !== 'published') errors.push(`[${q.id}] sourceStatus must be 'published', got '${q.sourceStatus}'`);
    if (q.preserveOptionOrder !== true) errors.push(`[${q.id}] preserveOptionOrder must be true`);
    if (q.reviewed !== true) errors.push(`[${q.id}] reviewed must be true`);
  }

  // 4. Options and Hardcoded 105 Official Answer Key Lock
  console.log('\n[4/9] Auditing Options & 105 Official Answer Keys...');
  for (const [gradeText, questions] of Object.entries(PAPERS_BY_GRADE)) {
    const grade = Number(gradeText);
    const expected = EXPECTED_OFFICIAL_ANSWERS_115[grade];
    questions.forEach((q, idx) => {
      if (q.id !== `saa-115-g${grade}-${String(idx + 1).padStart(2, '0')}`) {
        errors.push(`[${q.id}] unexpected id at G${grade} index ${idx}`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        errors.push(`[${q.id}] options must have 4 items`);
      }
      if (q.answer !== expected[idx]) {
        errors.push(`[${q.id}] answer mismatch vs official key: got ${q.answer}, expected ${expected[idx]}`);
      }
      if (!q.question || q.question.trim().length === 0) errors.push(`[${q.id}] empty question`);
      if (!q.explanation || q.explanation.trim().length === 0) errors.push(`[${q.id}] empty explanation`);
    });
  }

  // 5. Listening Non-Leakage & Official Audio Integrity
  console.log('\n[5/9] Auditing Listening Non-Leakage & 45 Official MP3 Clips...');
  const listeningQs = SAA_115_ALL_QUESTIONS.filter((q) => q.section === 'listening');
  const publicDir = path.resolve('public');
  const ffmpegPath = await resolveOptionalFfmpeg();
  let audioSrcCount = 0;

  for (const q of listeningQs) {
    if (!q.media?.audioText || q.media.audioText.trim().length === 0) {
      errors.push(`[${q.id}] listening question missing media.audioText fallback`);
    }
    if (q.question.includes(q.media?.audioText) && q.media?.audioText.length > 20) {
      errors.push(`[${q.id}] audio text leaked in question body!`);
    }
    if (q.media?.audioSrc) {
      audioSrcCount++;
      const audioPath = path.join(publicDir, q.media.audioSrc.replace(/^\//, ''));
      if (!fs.existsSync(audioPath)) {
        errors.push(`[${q.id}] Missing official audio clip: ${q.media.audioSrc}`);
      } else {
        const size = fs.statSync(audioPath).size;
        if (size < 10_000) errors.push(`[${q.id}] Audio clip too small (${size} bytes): ${q.media.audioSrc}`);
        if (size >= 25 * 1024 * 1024) errors.push(`[${q.id}] Audio clip exceeds 25 MiB limit: ${q.media.audioSrc}`);
        if (ffmpegPath) {
          const dec = spawnSync(ffmpegPath, ['-v', 'error', '-i', audioPath, '-f', 'null', '-'], { encoding: 'utf8' });
          if (dec.status !== 0) {
            errors.push(`[${q.id}] Audio clip failed FFmpeg decode: ${q.media.audioSrc}`);
          }
        }
      }
    }
  }
  if (audioSrcCount !== 45) {
    errors.push(`Expected 45/45 listening questions with media.audioSrc, found ${audioSrcCount}`);
  } else {
    console.log(`  • Verified 45/45 official MP3 clips exist, < 25 MiB${ffmpegPath ? ' & FFmpeg decode passed' : ''}`);
  }

  // 6. Passage SSOT & Group Integrity
  console.log('\n[6/9] Auditing Passage Groups & SSOT Shared Material...');
  const groupMap = new Map();
  for (const q of SAA_115_ALL_QUESTIONS) {
    if (q.groupId) {
      if (!groupMap.has(q.groupId)) groupMap.set(q.groupId, []);
      groupMap.get(q.groupId).push(q);
    }
  }
  console.log(`  • Found ${groupMap.size} shared passage groups (${Array.from(groupMap.values()).flat().length} questions total)`);
  for (const [gid, questions] of groupMap.entries()) {
    const firstPassageStr = JSON.stringify(questions[0].passage);
    for (const q of questions) {
      if (!q.passage) errors.push(`[${q.id}] in group '${gid}' missing passage`);
      else if (JSON.stringify(q.passage) !== firstPassageStr) {
        errors.push(`[${q.id}] passage mismatch in group '${gid}'`);
      }
    }
  }

  // 7. Visual Assets & Exam Paper Registration
  console.log('\n[7/9] Auditing Visual Assets & Wizard Paper Registration...');
  let verifiedAssets = 0;
  for (const q of SAA_115_ALL_QUESTIONS) {
    const images = [];
    if (q.image) images.push(q.image);
    if (q.media?.image) images.push(q.media.image);
    if (q.passage?.image) images.push(q.passage.image);
    if (Array.isArray(q.optionImages)) images.push(...q.optionImages);
    for (const imgPath of images) {
      const fullPath = path.join(publicDir, imgPath.replace(/^\//, ''));
      if (!fs.existsSync(fullPath)) errors.push(`[${q.id}] Image not found: ${imgPath}`);
      else verifiedAssets++;
    }
  }
  if (!SAA_ALL_EXAM_PAPERS[115]) {
    errors.push('SAA_ALL_EXAM_PAPERS[115] is missing!');
  } else {
    for (const g of [4, 5, 6]) {
      if (!SAA_ALL_EXAM_PAPERS[115][g] || SAA_ALL_EXAM_PAPERS[115][g].questions?.length !== 35) {
        errors.push(`SAA_ALL_EXAM_PAPERS[115][${g}] missing or does not have 35 questions`);
      }
    }
  }
  console.log(`  • Verified ${verifiedAssets} referenced image files exist on disk`);

  // 8. Option Images Decoupling, Clean (A)-(D) Labels & optionAltTexts
  console.log('\n[8/9] Auditing Option Images Decoupling, Clean Labels & optionAltTexts...');
  const optionImageQs = SAA_115_ALL_QUESTIONS.filter((q) => Array.isArray(q.optionImages));
  console.log(`  • Found ${optionImageQs.length} questions with sliced optionImages (expected 37)`);
  if (optionImageQs.length !== 37) {
    errors.push(`Expected 37 questions with optionImages, found ${optionImageQs.length}`);
  }
  for (const q of optionImageQs) {
    if (q.optionImages.length !== 4) errors.push(`[${q.id}] optionImages must have 4 items`);
    if (q.image) errors.push(`[${q.id}] has both optionImages and q.image`);
    if (JSON.stringify(q.options) !== JSON.stringify(['(A)', '(B)', '(C)', '(D)'])) {
      errors.push(`[${q.id}] options must be ['(A)', '(B)', '(C)', '(D)'], got ${JSON.stringify(q.options)}`);
    }
    if (!Array.isArray(q.optionAltTexts) || q.optionAltTexts.length !== 4 || q.optionAltTexts.some((t) => !t || !String(t).trim())) {
      errors.push(`[${q.id}] must define 4 non-empty optionAltTexts`);
    }
  }

  // 9. Sharp Pixel Quality Gate (Anti-Blank, Entropy Floor & Anti-Collision)
  console.log('\n[9/9] Auditing 148 Option Images via Sharp Pixel Gate...');
  let minNonWhite = 100;
  let minEntropy = 100;
  let minPairDiff = 100;

  for (const q of optionImageQs) {
    const thumbs = [];
    const hashes = new Set();

    for (let i = 0; i < q.optionImages.length; i++) {
      const imgRel = q.optionImages[i];
      const fullPath = path.join(publicDir, imgRel.replace(/^\//, ''));
      if (!fs.existsSync(fullPath)) continue;

      const rawFile = fs.readFileSync(fullPath);
      hashes.add(crypto.createHash('sha256').update(rawFile).digest('hex'));

      const meta = await sharp(fullPath).metadata();
      if ((meta.width || 0) < 80 || (meta.height || 0) < 80) {
        errors.push(`[${q.id}] Option ${i} (${imgRel}) dimensions too small: ${meta.width}x${meta.height}`);
      }

      const { data } = await sharp(fullPath).grayscale().raw().toBuffer({ resolveWithObject: true });
      let nonWhite = 0;
      for (let p = 0; p < data.length; p++) {
        if (data[p] < 245) nonWhite++;
      }
      const nonWhitePct = (nonWhite * 100) / data.length;
      const stats = await sharp(fullPath).stats();
      if (nonWhitePct < minNonWhite) minNonWhite = nonWhitePct;
      if (stats.entropy < minEntropy) minEntropy = stats.entropy;

      if (nonWhitePct < MIN_NON_WHITE_PCT) {
        errors.push(`[${q.id}] Option ${i} (${imgRel}) looks blank/sparse: nonWhite=${nonWhitePct.toFixed(2)}%`);
      }
      if (stats.entropy < MIN_ENTROPY) {
        errors.push(`[${q.id}] Option ${i} (${imgRel}) entropy too low: ${stats.entropy.toFixed(3)}`);
      }

      const thumb = await sharp(fullPath).resize(64, 64, { fit: 'fill' }).grayscale().raw().toBuffer();
      thumbs.push(thumb);
    }

    if (hashes.size !== 4) {
      errors.push(`[${q.id}] Duplicate option image bytes detected (${hashes.size}/4 unique)`);
    }
    if (thumbs.length === 4) {
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          let diffCount = 0;
          for (let k = 0; k < thumbs[i].length; k++) {
            if (Math.abs(thumbs[i][k] - thumbs[j][k]) > 20) diffCount++;
          }
          const diffPct = (diffCount * 100) / thumbs[i].length;
          if (diffPct < minPairDiff) minPairDiff = diffPct;
          if (diffPct < MIN_PAIRWISE_DIFF_PCT) {
            errors.push(`[${q.id}] Option ${i} vs ${j} pixel collision (${diffPct.toFixed(2)}% diff)`);
          }
        }
      }
    }
  }
  console.log(`  • Pixel gate telemetry: minNonWhite=${minNonWhite.toFixed(2)}%, minEntropy=${minEntropy.toFixed(3)}, minPairwiseDiff=${minPairDiff.toFixed(2)}%`);

  console.log('\n══════════════════════════════════════════════════════════════');
  if (errors.length > 0) {
    console.error(`❌ SAA 115 CONTRACT FAILED WITH ${errors.length} ERRORS:`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  } else {
    console.log('🎉 SAA 115 CONTRACT AUDIT PASSED 100% WITH ZERO ERRORS!');
    console.log('   All 105 official questions, answers, 45 audio clips, alt texts & 148 Sharp-verified option cards conform to Gold Standard.');
    console.log('══════════════════════════════════════════════════════════════\n');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
