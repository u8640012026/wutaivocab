import assert from 'node:assert/strict';
import {
  PRIORI_DRILL_DEFAULT_LIMIT,
  buildPrioriDrillCohort,
  stepPrioriDrillQueue,
  normalizePrioriDrillLimit,
  reconcilePrioriPaperRecordWithPaper,
  mergePrioriPaperRecordWithPaper,
} from '../src/features/priori/prioriDrill.js';
import { PRIORI_PAPER_MAP } from '../src/data/priori/index.js';

assert.equal(PRIORI_DRILL_DEFAULT_LIMIT, 20);
assert.equal(normalizePrioriDrillLimit(10), 10);
assert.equal(normalizePrioriDrillLimit(20), 20);
assert.equal(normalizePrioriDrillLimit('all'), 20);
assert.equal(normalizePrioriDrillLimit(999), 20);

// Case 1: Only 2 wrong questions (streak=0 each). Never pad to 20; finish cleanly after 4 consecutive right answers.
const twoWrong = [
  { id: 'q1', paperId: '114-math-g3', number: 1 },
  { id: 'q2', paperId: '114-math-g3', number: 2 },
];
const packed2 = buildPrioriDrillCohort(twoWrong, {}, 20);
assert.equal(packed2.cohort.length, 2, 'Must keep exact 2 wrong questions without padding');
assert.equal(packed2.overflowCount, 0);

let qState = packed2.cohort.map((q, i) => ({ ...q, _instanceKey: `init_${i}` }));
let streaks = { ...packed2.initialStreaks };
const cohortIds2 = packed2.cohort.map((q) => q.id);

for (let idx = 0; idx < 4; idx += 1) {
  const res = stepPrioriDrillQueue({
    queue: qState,
    cohortIds: cohortIds2,
    currentIdx: idx,
    streaksById: streaks,
    isCorrect: true,
    maxAttempts: 20,
  });
  qState = res.nextQueue;
  streaks = res.nextStreaks;
  if (idx < 3) {
    assert.equal(res.allCohortMastered, false, `Attempt ${idx + 1} should not finish early`);
  } else {
    assert.equal(res.allCohortMastered, true, 'All 2 wrong questions mastered after 4 right answers');
    assert.equal(res.shouldAutoFinish, true, 'Must auto-finish immediately at 4th attempt');
    assert.equal(qState.length, 4, 'Queue length must stop cleanly at 4');
  }
}

// Case 2: Only 2 wrong questions, student keeps getting EVERY attempt wrong -> strict stop at cap 20 (never 200!).
let wrongQueue = packed2.cohort.map((q, i) => ({ ...q, _instanceKey: `w_${i}` }));
let wrongStreaks = { ...packed2.initialStreaks };
let hitCapAt = -1;

for (let idx = 0; idx < 25; idx += 1) {
  const res = stepPrioriDrillQueue({
    queue: wrongQueue,
    cohortIds: cohortIds2,
    currentIdx: idx,
    streaksById: wrongStreaks,
    isCorrect: false,
    maxAttempts: 20,
  });
  wrongQueue = res.nextQueue;
  wrongStreaks = res.nextStreaks;
  assert.ok(wrongQueue.length <= 20, `Queue exceeded cap 20: ${wrongQueue.length}`);
  if (res.reachedCap) {
    hitCapAt = idx + 1;
    break;
  }
}
assert.equal(hitCapAt, 20, 'Repeated wrong attempts on 2 mistakes must terminate strictly at attempt 20');

// Case 3: Short test (10 cap) terminates strictly at attempt 10 on repeated wrong answers.
const packed10 = buildPrioriDrillCohort(twoWrong, {}, 10);
let shortQueue = packed10.cohort.map((q, i) => ({ ...q, _instanceKey: `s_${i}` }));
let shortStreaks = { ...packed10.initialStreaks };
let shortCapAt = -1;
for (let idx = 0; idx < 15; idx += 1) {
  const res = stepPrioriDrillQueue({
    queue: shortQueue,
    cohortIds: cohortIds2,
    currentIdx: idx,
    streaksById: shortStreaks,
    isCorrect: false,
    maxAttempts: 10,
  });
  shortQueue = res.nextQueue;
  shortStreaks = res.nextStreaks;
  assert.ok(shortQueue.length <= 10, `Short drill exceeded cap 10: ${shortQueue.length}`);
  if (res.reachedCap) {
    shortCapAt = idx + 1;
    break;
  }
}
assert.equal(shortCapAt, 10, '10-question short drill must terminate strictly at attempt 10');

// Case 4: 25 wrong questions under 20 cap -> packs 10 urgent questions cleanly so sinking still works and total attempts <= 20.
const twentyFiveWrong = Array.from({ length: 25 }, (_, i) => ({
  id: `q${i + 1}`,
  paperId: '114-math-g3',
  number: i + 1,
}));
const packed25 = buildPrioriDrillCohort(twentyFiveWrong, {}, 20);
assert.equal(packed25.cohort.length, 10, 'Should pack 10 zero-streak questions into a 20-attempt round');
assert.equal(packed25.overflowCount, 15);

// Case 5: Cross-device staggered completion recomputes totals, scores & masteredCount (GPT finding #1)
const mathPaper = PRIORI_PAPER_MAP['114-math-g3'];
const q1 = mathPaper.questions[0];
const q2 = mathPaper.questions[1];

const dev1Rec = {
  paperId: '114-math-g3',
  score: 4,
  latestScore: 4,
  firstScore: 4,
  correctCount: 1,
  firstCorrectCount: 1,
  masteredCount: 1,
  totalCount: 25,
  firstAnswers: { [q1.id]: q1.answer, [q2.id]: null },
  latestAnswers: { [q1.id]: q1.answer, [q2.id]: null },
  streaks: { [q1.id]: 2, [q2.id]: 0 },
  questionAttemptCounts: { [q1.id]: 1 },
  updatedAt: '2026-11-15T10:00:00.000Z',
};

const dev2Rec = {
  paperId: '114-math-g3',
  score: 4,
  latestScore: 4,
  firstScore: 4,
  correctCount: 1,
  firstCorrectCount: 1,
  masteredCount: 1,
  totalCount: 25,
  firstAnswers: { [q1.id]: null, [q2.id]: q2.answer },
  latestAnswers: { [q1.id]: null, [q2.id]: q2.answer },
  streaks: { [q1.id]: 0, [q2.id]: 2 },
  questionAttemptCounts: { [q2.id]: 1 },
  updatedAt: '2026-11-15T10:05:00.000Z',
};

const mergedStaggered = mergePrioriPaperRecordWithPaper(dev1Rec, dev2Rec, mathPaper);
assert.equal(mergedStaggered.score, 8, 'Staggered merge must recompute score = 8');
assert.equal(mergedStaggered.latestScore, 8, 'Staggered merge must recompute latestScore = 8');
assert.equal(mergedStaggered.correctCount, 2, 'Staggered merge must recompute correctCount = 2');
assert.equal(mergedStaggered.masteredCount, 2, 'Staggered merge must recompute masteredCount = 2');
assert.equal(mergedStaggered.masteredIds.length, 2);
assert.equal(mergedStaggered.firstScore, 8, 'Staggered merge must backfill missing firstAnswers for Q2 -> 8');
assert.equal(mergedStaggered.firstCorrectCount, 2);

// Case 6: Later device actively submits wrong answer for Q1 -> latestScore updates & streak resets, while frozen firstScore preserves Q1 initial right
const wrongOverrideQ1 = (q1.answer + 1) % 4;
const dev2WrongRec = {
  paperId: '114-math-g3',
  score: 4,
  latestScore: 4,
  firstScore: 4,
  correctCount: 1,
  firstCorrectCount: 1,
  masteredCount: 1,
  totalCount: 25,
  firstAnswers: { [q1.id]: wrongOverrideQ1, [q2.id]: q2.answer },
  latestAnswers: { [q1.id]: wrongOverrideQ1, [q2.id]: q2.answer },
  streaks: { [q1.id]: 0, [q2.id]: 2 },
  updatedAt: '2026-11-15T10:10:00.000Z',
};
const mergedAfterWrong = mergePrioriPaperRecordWithPaper(dev1Rec, dev2WrongRec, mathPaper);
assert.equal(mergedAfterWrong.latestScore, 4, 'Active newer wrong attempt on Q1 updates latestScore to 4 (Q2 only)');
assert.equal(mergedAfterWrong.correctCount, 1);
assert.equal(mergedAfterWrong.masteredCount, 1);
assert.equal(mergedAfterWrong.streaks[q1.id], 0);
assert.equal(mergedAfterWrong.firstAnswers[q1.id], q1.answer, 'Initial firstAnswers[Q1] remains frozen');
assert.equal(mergedAfterWrong.firstScore, 8, 'Frozen firstScore retains Q1 initial answer + Q2');

// Case 7: Auto-reconcile pre-fix miskeyed records for 113-english-g5 (Q9 -> 0) and 113-english-g6 (Q23 -> 1)
const engG5Paper = PRIORI_PAPER_MAP['113-english-g5'];
const engG5Ans = Object.fromEntries(engG5Paper.questions.map((q) => [q.id, q.answer]));
const preFixEngG5 = {
  paperId: '113-english-g5',
  score: 96,
  latestScore: 96,
  firstScore: 96,
  correctCount: 24,
  firstCorrectCount: 24,
  totalCount: 25,
  wrongIds: ['priori-113-eng-g5-q09'],
  masteredIds: [],
  masteredCount: 0,
  latestAnswers: engG5Ans,
  firstAnswers: engG5Ans,
  streaks: Object.fromEntries(
    engG5Paper.questions.map((q) => [q.id, q.id === 'priori-113-eng-g5-q09' ? 0 : 1])
  ),
};
const reconciledEngG5 = reconcilePrioriPaperRecordWithPaper(preFixEngG5, engG5Paper);
assert.equal(reconciledEngG5.score, 100, '113 Eng G5 Q9=(1) must reconcile 96 -> 100');
assert.equal(reconciledEngG5.firstScore, 100);
assert.equal(reconciledEngG5.wrongIds.length, 0);
assert.equal(reconciledEngG5.streaks['priori-113-eng-g5-q09'], 1);

const engG6Paper = PRIORI_PAPER_MAP['113-english-g6'];
const staleOldWrongEngG6 = {
  paperId: '113-english-g6',
  score: 4,
  latestScore: 4,
  firstScore: 4,
  correctCount: 1,
  firstCorrectCount: 1,
  totalCount: 25,
  wrongIds: engG6Paper.questions.filter((q) => q.number !== 23).map((q) => q.id),
  masteredIds: [],
  masteredCount: 0,
  latestAnswers: { 'priori-113-eng-g6-q23': 0 },
  firstAnswers: { 'priori-113-eng-g6-q23': 0 },
  streaks: { 'priori-113-eng-g6-q23': 1 },
};
const reconciledEngG6 = reconcilePrioriPaperRecordWithPaper(staleOldWrongEngG6, engG6Paper);
assert.equal(reconciledEngG6.score, 0, '113 Eng G6 Q23=(1) (old key) must reconcile 4 -> 0');
assert.equal(reconciledEngG6.firstScore, 0);
assert.ok(reconciledEngG6.wrongIds.includes('priori-113-eng-g6-q23'));
assert.equal(reconciledEngG6.streaks['priori-113-eng-g6-q23'], 0);

console.log('✅ PRIORI drill cap (10/20), early exit, staggered merge & answer-key reconciliation contracts passed!');
