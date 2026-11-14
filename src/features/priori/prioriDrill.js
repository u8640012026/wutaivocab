export const PRIORI_DRILL_LIMIT_OPTIONS = [
  { count: 10, label: '10 題短測' },
  { count: 20, label: '20 題長測' },
];
export const PRIORI_DRILL_DEFAULT_LIMIT = 20;

export function normalizePrioriDrillLimit(limit) {
  return Number(limit) === 10 ? 10 : PRIORI_DRILL_DEFAULT_LIMIT;
}

/**
 * 依據單輪作答上限（10 或 20）整理沉底特訓起始題組與起始連對數。
 * 嚴格只取來源題池本身的錯題，絕不抓取他科、未做題或改題湊數。
 */
export function buildPrioriDrillCohort(
  rawPool = [],
  savedRecords = {},
  maxAttempts = PRIORI_DRILL_DEFAULT_LIMIT
) {
  const cap = normalizePrioriDrillLimit(maxAttempts);
  const seen = new Set();
  const deduped = [];
  for (const q of Array.isArray(rawPool) ? rawPool : []) {
    if (!q?.id || seen.has(q.id)) continue;
    seen.add(q.id);
    deduped.push(q);
  }

  // 依每題距離精熟所需次數（streak=0 需 2 次、streak=1 需 1 次）挑選本輪名單，
  // 確保在單輪上限 cap (10 或 20) 次內確實有機會完成精熟，且絕不抓取其他範圍充數。
  const cohort = [];
  const initialStreaks = {};
  let accumulatedNeed = 0;

  for (const q of deduped) {
    const pid = q.paperId;
    const prevStreak = Number(savedRecords?.[pid]?.streaks?.[q.id]) || 0;
    const need = prevStreak >= 1 ? 1 : 2;
    if (cohort.length > 0 && accumulatedNeed + need > cap) continue;
    cohort.push(q);
    initialStreaks[q.id] = prevStreak;
    accumulatedNeed += need;
    if (cohort.length >= cap) break;
  }

  return {
    cohort,
    totalAvailableCount: deduped.length,
    overflowCount: Math.max(0, deduped.length - cohort.length),
    initialStreaks,
    maxAttempts: cap,
  };
}

/**
 * 推進沉底精熟特訓狀態機：
 * - 來源不湊數、單輪總作答題數強制上限 maxAttempts (10 或 20)。
 * - 若錯題本已全員達成連對 2 次（0 題待精熟），立即標記 allCohortMastered = true 提前結束。
 */
export function stepPrioriDrillQueue({
  queue = [],
  cohortIds = [],
  currentIdx = 0,
  streaksById = {},
  isCorrect = false,
  maxAttempts = PRIORI_DRILL_DEFAULT_LIMIT,
}) {
  const cap = normalizePrioriDrillLimit(maxAttempts);
  const currentQ = queue[currentIdx];
  if (!currentQ?.id) {
    return {
      nextQueue: queue,
      nextStreaks: streaksById,
      nextStreakForCurrent: 0,
      allCohortMastered: false,
      reachedCap: false,
      shouldAutoFinish: false,
      needsRepeat: false,
    };
  }

  const prevStreak = Number(streaksById[currentQ.id]) || 0;
  const nextStreakForCurrent = isCorrect ? prevStreak + 1 : 0;
  const nextStreaks = {
    ...streaksById,
    [currentQ.id]: nextStreakForCurrent,
  };

  const targetIds =
    Array.isArray(cohortIds) && cohortIds.length > 0
      ? cohortIds
      : Array.from(new Set(queue.map((item) => item?.id).filter(Boolean)));
  const allCohortMastered =
    targetIds.length > 0 && targetIds.every((id) => (Number(nextStreaks[id]) || 0) >= 2);

  let nextQueue = [...queue];
  let needsRepeat = false;

  if (allCohortMastered) {
    nextQueue = nextQueue.slice(0, currentIdx + 1);
    return {
      nextQueue,
      nextStreaks,
      nextStreakForCurrent,
      allCohortMastered: true,
      reachedCap: false,
      shouldAutoFinish: true,
      needsRepeat: false,
    };
  }

  if (nextStreakForCurrent < 2) {
    const alreadyQueuedAhead = nextQueue
      .slice(currentIdx + 1)
      .some((item) => item?.id === currentQ.id);
    if (!alreadyQueuedAhead && nextQueue.length < cap) {
      needsRepeat = true;
      nextQueue.push({
        ...currentQ,
        _isSunkRetry: true,
        _isSecondRoundCheck: isCorrect,
        _instanceKey: `${currentQ.id}__drill_${nextQueue.length}_${Date.now()}`,
      });
    }
  }

  const isLastSlot = currentIdx >= nextQueue.length - 1;
  const reachedCap = nextQueue.length >= cap && isLastSlot;
  const shouldAutoFinish = allCohortMastered || isLastSlot;

  return {
    nextQueue,
    nextStreaks,
    nextStreakForCurrent,
    allCohortMastered,
    reachedCap,
    shouldAutoFinish,
    needsRepeat,
  };
}
