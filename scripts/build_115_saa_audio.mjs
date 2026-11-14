import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'public', 'audio', 'saa', '115');
const DATA_DIR = path.join(ROOT, 'src', 'data', 'exam', 'saa');

export const TIMESTAMPS_CALIBRATED = true;

// Calibrated timestamps against real SAA/115 MP3s via FFmpeg silencedetect (-35dB, 0.4s) + cluster verification.
export const OFFICIAL_AUDIO_CLIPS_115 = {
  4: [
    [132.4, 141.7], [153.1, 179.6], [191.1, 200.9], [212.3, 222.0], [233.7, 243.4],
    [254.9, 265.0], [276.8, 296.6], [310.5, 334.4], [348.4, 364.0], [377.4, 390.0],
    [404.0, 424.6], [438.1, 451.2], [464.6, 484.1], [497.6, 520.9], [534.3, 579.5],
  ],
  5: [
    [132.7, 142.5], [154.2, 163.8], [175.4, 184.8], [196.2, 206.3], [218.0, 232.4],
    [245.8, 264.1], [277.7, 295.4], [309.4, 326.6], [340.2, 359.1], [372.4, 386.7],
    [401.1, 432.0], [446.2, 483.9], [497.6, 539.1], [552.6, 588.4], [609.0, 654.1],
  ],
  6: [
    [132.5, 142.3], [153.7, 163.4], [174.9, 195.1], [208.5, 226.8], [240.1, 254.1],
    [267.8, 308.1], [321.8, 356.1], [369.9, 405.7], [419.1, 437.0], [450.4, 464.9],
    [478.3, 537.9], [551.9, 592.6], [606.5, 654.0], [667.8, 701.6], [722.4, 766.1],
  ],
};

const SOURCE_FILENAMES = {
  4: ['115年縣市學生學習能力檢測四年級英語科＿英聽檔.mp3'],
  5: ['115年縣市學生學習能力檢測五年級英語科＿英聽檔.mp3'],
  6: ['115年縣市學生學習能力檢測六年級英語科＿英聽檔.mp3'],
};

function findSourceFile(grade) {
  const dirs = [
    path.resolve(ROOT, 'SAA', '115', String(grade)),
    path.resolve(ROOT, 'SAA', '115'),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const name of SOURCE_FILENAMES[grade]) {
      const full = path.join(dir, name);
      if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
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
    throw new Error('FFmpeg is required for SAA 115 audio clipping.');
  }
  return ffmpegPath;
}

function verifyClipDecodable(ffmpegPath, filePath, expectedDuration) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing output clip: ${filePath}`);
  const size = fs.statSync(filePath).size;
  if (size < 10_000) throw new Error(`Output clip unexpectedly small (${size} bytes): ${filePath}`);
  if (size >= 25 * 1024 * 1024) throw new Error(`Output clip exceeds 25 MiB limit (${size} bytes): ${filePath}`);
  const decodeCheck = spawnSync(ffmpegPath, ['-v', 'error', '-i', filePath, '-f', 'null', '-'], { encoding: 'utf8' });
  if (decodeCheck.status !== 0) throw new Error(`Output clip failed FFmpeg decode check (${filePath}):\n${decodeCheck.stderr}`);
  if (expectedDuration <= 0.2) throw new Error(`Invalid clip duration (${expectedDuration}s) for ${filePath}`);
}

function writeAudioSrcToQuestionBanks() {
  for (const grade of [4, 5, 6]) {
    const filePath = path.join(DATA_DIR, `saa115G${grade}.js`);
    const raw = fs.readFileSync(filePath, 'utf8');
    const jsonStr = raw.replace(/^export const SAA_115_G\d_QUESTIONS = /, '').replace(/;\s*$/, '');
    const questions = JSON.parse(jsonStr);
    let updated = 0;
    for (const q of questions) {
      if (q.section === 'listening') {
        const audioSrc = `/audio/saa/115/g${grade}/q${String(q.number).padStart(2, '0')}.mp3`;
        q.media = {
          ...(q.media || {}),
          audioSrc,
          audioSourceType: 'official',
        };
        updated++;
      }
    }
    const nextContent = `export const SAA_115_G${grade}_QUESTIONS = ${JSON.stringify(questions, null, 2)};\n`;
    fs.writeFileSync(filePath, nextContent, 'utf8');
    console.log(`  ✓ Updated ${updated} listening items with media.audioSrc in saa115G${grade}.js`);
  }
}

async function main() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  SAA 115 OFFICIAL AUDIO CLIPPING PIPELINE                   ');
  console.log('══════════════════════════════════════════════════════════════');

  const ffmpegPath = await resolveFfmpeg();
  const resolvedSources = {};
  for (const grade of [4, 5, 6]) {
    const src = findSourceFile(grade);
    if (!src) throw new Error(`Missing raw SAA 115 MP3 for grade ${grade}`);
    resolvedSources[grade] = src;
  }

  let totalClipped = 0;
  for (const [gradeText, clips] of Object.entries(OFFICIAL_AUDIO_CLIPS_115)) {
    const grade = Number(gradeText);
    const sourcePath = resolvedSources[grade];
    const gradeDir = path.join(OUTPUT_DIR, `g${grade}`);
    fs.mkdirSync(gradeDir, { recursive: true });
    console.log(`\n  Clipping Grade ${grade} from: ${sourcePath}`);

    for (const [index, [start, end]] of clips.entries()) {
      const duration = Number((end - start).toFixed(3));
      const fadeOutStart = Math.max(0, Number((duration - 0.1).toFixed(3)));
      const questionNumber = index + 1;
      const outputPath = path.join(gradeDir, `q${String(questionNumber).padStart(2, '0')}.mp3`);
      const result = spawnSync(
        ffmpegPath,
        [
          '-hide_banner', '-loglevel', 'error', '-y',
          '-ss', String(start), '-to', String(end),
          '-i', sourcePath,
          '-af', `afade=t=in:ss=0:d=0.1,afade=t=out:st=${fadeOutStart}:d=0.1`,
          '-vn', '-map_metadata', '-1',
          '-c:a', 'libmp3lame', '-b:a', '96k', '-ar', '44100', '-ac', '1',
          outputPath,
        ],
        { encoding: 'utf8' },
      );
      if (result.status !== 0) throw new Error(`Failed G${grade} Q${questionNumber}: ${result.stderr}`);
      verifyClipDecodable(ffmpegPath, outputPath, duration);
      totalClipped++;
      console.log(`    ✓ ${path.relative(ROOT, outputPath)} (${fs.statSync(outputPath).size} bytes, ${duration}s)`);
    }
  }

  if (totalClipped !== 45) throw new Error(`Expected 45 clips, got ${totalClipped}`);
  writeAudioSrcToQuestionBanks();
  console.log('\n🎉 Successfully created & verified 45 official 96kbps Mono clips in public/audio/saa/115/');
}

main().catch((err) => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
