import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Inventory, structural screening & spot-check sampler for PRIORI papers.
// Absence of a flag is NOT full content approval (human/PDF/audio spot-check is still required).
const args = process.argv.slice(2);
const strictMode = args.includes('--strict');
const spotYearIdx = args.indexOf('--spot-check');
const spotCheckYear = spotYearIdx >= 0 ? Number(args[spotYearIdx + 1]) : null;
const positional = args.filter((a, i) => !a.startsWith('--') && !(spotYearIdx >= 0 && i === spotYearIdx + 1));

const repo = path.resolve(positional[0] || '.');
const out = path.resolve(positional[1] || path.join(repo, 'tmp', 'priori_screen'));

const { PRIORI_PAPERS } = await import(pathToFileURL(path.join(repo, 'src/data/priori/index.js')).href);
const hubSource = await fs.readFile(path.join(repo, 'src/features/priori/PrioriPracticeHub.jsx'), 'utf8');
const modalsSource = await fs.readFile(path.join(repo, 'src/features/priori/PrioriModals.jsx'), 'utf8');

const zoomWiringOk =
  hubSource.includes('openZoom(') &&
  hubSource.includes('PrioriZoomModal') &&
  hubSource.includes('currentQuestion.passage.image') &&
  hubSource.includes('currentQuestion.figureImage') &&
  hubSource.includes('currentQuestion.questionImage');

const rows = [];
const groups = new Map();
const originalPdfIssues = [];

const exists = async (url) => {
  if (!url) return '';
  if (!url.startsWith('/') || url.includes('..')) return 'unsupported-path';
  try {
    const s = await fs.stat(path.join(repo, 'public', url.slice(1)));
    return s.isFile() && s.size > 0 ? 'yes' : 'empty';
  } catch {
    return 'missing';
  }
};

for (const paper of PRIORI_PAPERS) {
  const needsStudentPdf = paper.year <= 114 || paper.paperId === '115-math-g3';
  if (needsStudentPdf) {
    const stuStatus = await exists(`/assets/priori/original/${paper.paperId}-student.pdf`);
    if (stuStatus !== 'yes') {
      originalPdfIssues.push(`${paper.paperId}-student.pdf:${stuStatus}`);
    }
    if (paper.year <= 114) {
      const ansStatus = await exists(`/assets/priori/original/${paper.paperId}-answer.pdf`);
      if (ansStatus !== 'yes') {
        originalPdfIssues.push(`${paper.paperId}-answer.pdf:${ansStatus}`);
      }
    }
  }

  for (const q of paper.questions) {
    const flags = [];
    const img = q.figureImage || '';
    const passageImg = q.passage?.image || '';
    const rawImg = q.questionImage || '';
    const audio = q.media?.audioSrc || '';
    const statuses = await Promise.all([img, passageImg, rawImg, audio].map(exists));
    for (const [i, label] of ['figure', 'passage-image', 'question-image', 'audio'].entries()) {
      if (statuses[i] && statuses[i] !== 'yes') flags.push(`${label}:${statuses[i]}`);
    }
    if (!q.questionImage || statuses[2] !== 'yes') {
      flags.push('missing-question-image');
    }

    const text = `${q.questionText || ''} ${(q.options || []).join(' ')}`;
    if (
      /(如圖|下圖|上圖|看圖|圖片|圖中|圖形|圖表|圖案|圖示|圖卡|圖畫|圖一|圖二|圖三)/.test(text) &&
      !img &&
      !passageImg
    ) {
      flags.push('visual-reference-no-figure-review');
    }
    if (
      paper.subject === 'english' &&
      /(?:圖片|圖案|圖示)\s*[（(]?[1234一二三四]/.test((q.options || []).join(' ')) &&
      !img &&
      !passageImg
    ) {
      flags.push('picture-options-no-figure-review');
    }
    if (q.groupId || q.passage) {
      const key = `${paper.paperId}/${q.groupId || q.passage?.groupId || 'missing-group-id'}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(q.number);
      if (!q.groupId || !q.passage || q.groupId !== q.passage.groupId) flags.push('group-link-review');
    }

    const tts = `${q.ttsText || ''} ${q.passage?.ttsText || ''}`;
    if (/(正確答案是|答案是選項|所以選[（(]?[一二三四1234]|選項[一二三四1234]是正確|應選[（(]?[一二三四1234])/.test(tts)) {
      flags.push('possible-tts-answer-leak-review');
    }
    if (paper.subject === 'english' && audio && typeof q.answer === 'number') {
      const ansOpt = String(q.options?.[q.answer] || '').trim();
      if (/^[A-Za-z]{2,}$/.test(ansOpt) && new RegExp(`\\b${ansOpt}\\b`, 'i').test(q.ttsText || '')) {
        flags.push('english-listening-tts-leak-review');
      }
    }
    if (paper.subject === 'english' && paper.year >= 111 && paper.year <= 114) {
      const expected = q.number <= (paper.grade === 3 ? (paper.year === 111 ? 21 : 25) : 10);
      if (expected && !audio) flags.push('audio-missing-vs-existing-year-convention');
      if (!expected && audio) flags.push('audio-outside-existing-year-convention');
    }

    rows.push({
      paper: paper.paperId,
      year: paper.year,
      subject: paper.subject,
      grade: paper.grade,
      number: q.number,
      questionType: q.questionType,
      answer: q.answer,
      groupId: q.groupId || '',
      passageTitle: q.passage?.title || '',
      questionImage: rawImg,
      questionImageStatus: statuses[2],
      figureImage: img,
      figureStatus: statuses[0],
      passageImage: passageImg,
      passageImageStatus: statuses[1],
      audio,
      audioStatus: statuses[3],
      hasTts: Boolean(q.ttsText),
      hasPassageTts: Boolean(q.passage?.ttsText),
      flags,
      visualReview: 'pending',
      audioContentReview: audio ? 'pending' : 'not-applicable',
      ttsLeakReview: 'pending',
      sourceGroupReview: 'pending',
      zoomUiReview: zoomWiringOk ? 'ui-wired-pending-spotcheck' : 'missing-ui-zoom',
    });
  }
}

const criticalFlagSet = new Set([
  'missing-question-image',
  'picture-options-no-figure-review',
  'group-link-review',
  'possible-tts-answer-leak-review',
  'english-listening-tts-leak-review',
  'audio-missing-vs-existing-year-convention',
  'audio-outside-existing-year-convention',
]);
const criticalFlags = rows.filter((r) => r.flags.some((f) => criticalFlagSet.has(f) || f.includes(':missing') || f.includes(':empty')));

const spotCheckSamples = [];
if (spotCheckYear) {
  const yearPapers = PRIORI_PAPERS.filter((p) => Number(p.year) === spotCheckYear);
  for (const p of yearPapers) {
    const picks = [];
    const figQ = p.questions.find((q) => q.figureImage);
    const groupQ = p.questions.find((q) => q.groupId);
    const audioQ = p.questions.find((q) => q.media?.audioSrc);
    const tailQ = p.questions[p.questions.length - 1];
    const firstQ = p.questions[0];
    for (const q of [firstQ, figQ, groupQ, audioQ, tailQ]) {
      if (q && !picks.some((x) => x.number === q.number)) picks.push(q);
    }
    spotCheckSamples.push({
      paperId: p.paperId,
      studentPdf: `/assets/priori/original/${p.paperId}-student.pdf`,
      hasYearInModal: modalsSource.includes(String(spotCheckYear)) || spotCheckYear <= 114,
      samples: picks.slice(0, 4).map((q) => ({
        qNo: q.number,
        type: q.questionType,
        answer: q.answer,
        figureImage: q.figureImage || null,
        groupId: q.groupId || null,
        audioSrc: q.media?.audioSrc || null,
      })),
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  warning: 'Inventory and heuristics only; compare original PDFs, audio, and actual UI.',
  zoomWiringOk,
  originalPdfIssues,
  papers: PRIORI_PAPERS.length,
  questions: rows.length,
  flagged: rows.filter((r) => r.flags.length).length,
  criticalFlagged: criticalFlags.length,
  groups: [...groups].map(([key, questions]) => ({ key, questions })),
  spotCheckSamples,
  rows,
};

await fs.mkdir(out, { recursive: true });
await fs.writeFile(path.join(out, 'inventory.json'), JSON.stringify(report, null, 2) + '\n');
const columns = [
  'paper', 'number', 'questionType', 'groupId', 'passageTitle',
  'questionImage', 'questionImageStatus', 'figureImage', 'figureStatus',
  'passageImage', 'passageImageStatus', 'audio', 'audioStatus',
  'hasTts', 'hasPassageTts', 'flags', 'visualReview', 'audioContentReview',
  'ttsLeakReview', 'sourceGroupReview', 'zoomUiReview',
];
const csv = (v) => '"' + (Array.isArray(v) ? v.join('; ') : String(v ?? '')).replaceAll('"', '""') + '"';
await fs.writeFile(
  path.join(out, 'inventory.csv'),
  '\ufeff' + columns.join(',') + '\n' + rows.map((r) => columns.map((c) => csv(r[c])).join(',')).join('\n') + '\n'
);

const counts = {};
for (const r of rows) for (const f of r.flags) counts[f] = (counts[f] || 0) + 1;
console.log(JSON.stringify({
  papers: report.papers,
  questions: report.questions,
  zoomWiringOk,
  originalPdfIssues,
  flagged: report.flagged,
  criticalFlagged: report.criticalFlagged,
  counts,
  spotCheckPapers: spotCheckSamples.length,
}, null, 2));

if (strictMode && (!zoomWiringOk || originalPdfIssues.length > 0 || criticalFlags.length > 0)) {
  console.error('❌ Strict PRIORI content screen failed!');
  process.exit(1);
}
