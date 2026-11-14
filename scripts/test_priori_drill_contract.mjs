import assert from 'node:assert/strict';
import {
  PRIORI_DRILL_DEFAULT_LIMIT,
  buildPrioriDrillCohort,
  stepPrioriDrillQueue,
  normalizePrioriDrillLimit,
} from '../src/features/priori/prioriDrill.js';

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

console.log('✅ PRIORI drill cap (10/20), no-padding, and early mastery exit contract passed!');
