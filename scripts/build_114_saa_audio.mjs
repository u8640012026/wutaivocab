import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'public', 'audio', 'saa', '114');
const DATA_DIR = path.join(ROOT, 'src', 'data', 'exam', 'saa');

// Set to true ONLY after calibrating timestamps against the actual official 114 MP3 files.
export const TIMESTAMPS_CALIBRATED = true;

// Calibrated timestamps against real SAA/114/{4,5,6} MP3s via FFmpeg silencedetect (-35dB, 0.4s) + cluster verification.
export const OFFICIAL_AUDIO_CLIPS_114 = {
  4: [
    [137.8, 146.3], [155.9, 181.0], [190.6, 199.5], [208.9, 217.5], [227.0, 235.5],
    [245.1, 253.7], [263.3, 299.3], [312.8, 341.4], [354.9, 367.0], [380.6, 404.0],
    [417.5, 444.3], [457.9, 492.2], [505.9, 528.4], [542.1, 563.3], [576.8, 607.2],
  ],
  5: [
    [137.0, 145.6], [155.1, 163.6], [173.2, 181.9], [191.4, 201.1], [210.6, 221.7],
    [231.2, 244.4], [257.9, 270.5], [284.0, 299.8], [313.3, 341.2], [354.7, 368.1],
    [381.6, 398.4], [411.9, 443.2], [457.2, 503.2], [516.9, 573.4], [583.0, 636.3],
  ],
  6: [
    [144.8, 153.2], [162.6, 171.3], [180.8, 197.5], [211.0, 224.3], [237.8, 252.8],
    [266.3, 280.2], [294.0, 310.9], [324.6, 344.5], [358.0, 381.1], [394.7, 411.2],
    [425.0, 465.0], [478.5, 493.1], [506.7, 559.0], [573.5, 623.7], [637.3, 677.7],
  ],
};

const SOURCE_FILENAMES = {
  4: [
    '114年縣市學生學習能力檢測四年級英語科＿英聽檔.mp3',
    '114年國小四年級英語科英聽檔.mp3',
    '114_G4_audio.mp3',
    'g4.mp3',
  ],
  5: [
    '114年縣市學生學習能力檢測五年級英語科＿英聽檔.mp3',
    '114年國小五年級英語科英聽檔.mp3',
    '114_G5_audio.mp3',
    'g5.mp3',
  ],
  6: [
    '114年縣市學生學習能力檢測六年級英語科＿英聽檔.mp3',
    '114年國小六年級英語科英聽檔.mp3',
    '114_G6_audio.mp3',
    'g6.mp3',
  ],
};

function getCandidateDirs(grade) {
  const g = String(grade);
  const dirs = [];
  if (process.env.SAA_114_SOURCE_DIR) {
    const envDir = path.resolve(process.env.SAA_114_SOURCE_DIR);
    dirs.push(path.join(envDir, g), envDir);
  }
  dirs.push(
    path.resolve(ROOT, 'SAA', '114', g),
    path.resolve(ROOT, 'SAA', '114'),
    path.resolve(ROOT, '..', 'SAA', '114', g),
    path.resolve(ROOT, '..', 'SAA', '114'),
    path.resolve('/home/antigravity/upload/SAA/114', g),
    path.resolve('/home/antigravity/upload'),
    path.resolve(ROOT, 'tmp', 'audio', '114', g),
    path.resolve(ROOT, 'tmp', 'audio', '114'),
  );
  return dirs;
}

function findSourceFile(grade) {
  const candidates = SOURCE_FILENAMES[grade];
  const dirs = getCandidateDirs(grade);
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const name of candidates) {
      const full = path.join(dir, name);
      if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
    }
    // If inside a grade-specific directory (e.g., SAA/114/4), accept a single .mp3 file
    if (path.basename(dir) === String(grade)) {
      const mp3s = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.mp3'));
      if (mp3s.length === 1) {
        return path.join(dir, mp3s[0]);
      }
    }
  }
  return null;
}

async function resolveFfmpeg() {
  let ffmpegPath = process.env.FFMPEG_PATH || '';
  if (!ffmpegPath) {
    try {
      ffmpegPath = (await import('ffmpeg-static')).default;
    } catch {
      ffmpegPath = 'ffmpeg';
    }
  }
  const check = spawnSync(ffmpegPath, ['-version'], { encoding: 'utf8' });
  if (check.status !== 0) {
    throw new Error(
      'FFmpeg is required for SAA 114 audio clipping. Set FFMPEG_PATH, install ffmpeg, '
        + 'or install ffmpeg-static before running this script.',
    );
  }
  return ffmpegPath;
}

function verifyClipDecodable(ffmpegPath, filePath, expectedDuration) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing output clip: ${filePath}`);
  }
  const size = fs.statSync(filePath).size;
  if (size < 10_000) {
    throw new Error(`Output clip unexpectedly small (${size} bytes): ${filePath}`);
  }
  if (size >= 25 * 1024 * 1024) {
    throw new Error(`Output clip exceeds Cloudflare Pages 25 MiB limit (${size} bytes): ${filePath}`);
  }
  const decodeCheck = spawnSync(ffmpegPath, ['-v', 'error', '-i', filePath, '-f', 'null', '-'], { encoding: 'utf8' });
  if (decodeCheck.status !== 0) {
    throw new Error(`Output clip failed FFmpeg decode check (${filePath}):\n${decodeCheck.stderr}`);
  }
  if (expectedDuration <= 0.2) {
    throw new Error(`Invalid clip duration (${expectedDuration}s) for ${filePath}`);
  }
}

function writeAudioSrcToQuestionBanks() {
  for (const grade of [4, 5, 6]) {
    const filePath = path.join(DATA_DIR, `saa114G${grade}.js`);
    const raw = fs.readFileSync(filePath, 'utf8');
    const jsonStr = raw.replace(/^export const SAA_114_G\d_QUESTIONS = /, '').replace(/;\s*$/, '');
    const questions = JSON.parse(jsonStr);
    let updated = 0;
    for (const q of questions) {
      if (q.section === 'listening') {
        const audioSrc = `/audio/saa/114/g${grade}/q${String(q.number).padStart(2, '0')}.mp3`;
        q.media = {
          ...(q.media || {}),
          audioSrc,
          audioSourceType: 'official',
        };
        updated++;
      }
    }
    const nextContent = `export const SAA_114_G${grade}_QUESTIONS = ${JSON.stringify(questions, null, 2)};\n`;
    fs.writeFileSync(filePath, nextContent, 'utf8');
    console.log(`  ✓ Updated ${updated} listening items with media.audioSrc in saa114G${grade}.js`);
  }
}

async function main() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  SAA 114 OFFICIAL AUDIO CLIPPING PIPELINE (STAGE 3)          ');
  console.log('══════════════════════════════════════════════════════════════');

  const allowEstimated = process.argv.includes('--allow-estimated');
  if (!TIMESTAMPS_CALIBRATED && !allowEstimated) {
    throw new Error(
      'OFFICIAL_AUDIO_CLIPS_114 timestamps are not yet calibrated against real 114 MP3 files. '
        + 'Calibrate timestamps first (set TIMESTAMPS_CALIBRATED = true), or pass --allow-estimated for local testing only.',
    );
  }

  const ffmpegPath = await resolveFfmpeg();

  const resolvedSources = {};
  const missingGrades = [];
  for (const grade of [4, 5, 6]) {
    const src = findSourceFile(grade);
    if (!src) {
      missingGrades.push(grade);
      console.error(`  [ERROR] Missing Grade ${grade} MP3. Checked SAA/114/${grade}/ and ${SOURCE_FILENAMES[grade].join(' / ')}`);
    } else {
      resolvedSources[grade] = src;
    }
  }
  if (missingGrades.length > 0) {
    throw new Error(`Missing raw SAA 114 MP3 sources for grades: ${missingGrades.join(', ')}`);
  }

  let totalClipped = 0;
  for (const [gradeText, clips] of Object.entries(OFFICIAL_AUDIO_CLIPS_114)) {
    const grade = Number(gradeText);
    const sourcePath = resolvedSources[grade];
    if (clips.length !== 15) {
      throw new Error(`Grade ${grade} must define 15 listening clip ranges, got ${clips.length}`);
    }

    console.log(`\n  Clipping Grade ${grade} from: ${sourcePath}`);
    const gradeDir = path.join(OUTPUT_DIR, `g${grade}`);
    fs.mkdirSync(gradeDir, { recursive: true });

    for (const [index, [start, end]] of clips.entries()) {
      const duration = Number((end - start).toFixed(3));
      if (duration <= 0.3) {
        throw new Error(`Invalid timestamp range for G${grade} Q${index + 1}: [${start}, ${end}]`);
      }
      const fadeOutStart = Math.max(0, Number((duration - 0.1).toFixed(3)));
      const questionNumber = index + 1;
      const outputPath = path.join(gradeDir, `q${String(questionNumber).padStart(2, '0')}.mp3`);

      const result = spawnSync(
        ffmpegPath,
        [
          '-hide_banner',
          '-loglevel', 'error',
          '-y',
          '-ss', String(start),
          '-to', String(end),
          '-i', sourcePath,
          '-af', `afade=t=in:ss=0:d=0.1,afade=t=out:st=${fadeOutStart}:d=0.1`,
          '-vn',
          '-map_metadata', '-1',
          '-c:a', 'libmp3lame',
          '-b:a', '96k',
          '-ar', '44100',
          '-ac', '1',
          outputPath,
        ],
        { encoding: 'utf8' },
      );

      if (result.status !== 0) {
        throw new Error(`Failed to create G${grade} Q${questionNumber} clip:\n${result.stderr || result.stdout}`);
      }
      verifyClipDecodable(ffmpegPath, outputPath, duration);
      totalClipped++;
      console.log(`    ✓ ${path.relative(ROOT, outputPath)} (${fs.statSync(outputPath).size} bytes, ${duration}s)`);
    }
  }

  if (totalClipped !== 45) {
    throw new Error(`Expected exactly 45 audio clips, but produced ${totalClipped}`);
  }

  writeAudioSrcToQuestionBanks();

  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('🎉 Successfully created & verified 45 official 96kbps Mono clips in public/audio/saa/114/');
  console.log('══════════════════════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
