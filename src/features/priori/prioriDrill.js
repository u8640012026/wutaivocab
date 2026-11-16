export const PRIORI_DRILL_LIMIT_OPTIONS = [
  { count: 10, label: '10 題短測' },
  { count: 20, label: '20 題長測' },
];
export const PRIORI_DRILL_DEFAULT_LIMIT = 20;

/** 首測總分達此門檻（含）時，答對的題目直接認列精熟（streak = 2），不必再刷題 */
export const PRIORI_FIRST_TEST_MASTERY_SCORE = 80;

/**
 * 錯題特訓選項洗牌資格：僅「純文字單選、無題圖／選項圖／音檔／閱讀文章、選項不互相引用」之題目才可洗牌；
 * 其餘（圖片題、聽力題、題組、選項含「以上皆是」「(1)」等）一律維持原卷順序，避免對不上原卷。
 */
export function isPrioriOptionShuffleEligible(question) {
  if (!question || question.questionType !== 'single-choice') return false;
  const opts = Array.isArray(question.options) ? question.options : [];
  if (opts.length < 3) return false;
  if (question.figureImage || question.passage || question.media?.audioSrc || question.groupId) return false;
  if (Array.isArray(question.optionImages) && question.optionImages.length > 0) return false;
  const refPattern = /以上|皆|都是|均|同上|皆非|\([1-4]\)|（[1-4]）|[①②③④]|選項/;
  const qText = String(question.questionText || '');
  if (/圖/.test(qText)) return false;
  const stepsText = (Array.isArray(question.explanationSteps) ? question.explanationSteps : []).join(' ');
  if (/\(\s*[1-4]\s*\)|（\s*[1-4]\s*）|選項|第\s*[1-4]\s*個/.test(stepsText)) return false;
  return !opts.some((o) => typeof o !== 'string' || !o.trim() || refPattern.test(o));
}

/**
 * 回傳「畫面顯示順序 → 原始選項索引」對照陣列。
 * 作答、批改與紀錄仍一律使用原始索引，只有畫面排列順序不同，因此不會影響成績與原卷對照。
 */
export function getPrioriOptionDisplayOrder(question, seed = '') {
  const n = Array.isArray(question?.options) ? question.options.length : 0;
  const identity = Array.from({ length: n }, (_, i) => i);
  if (!isPrioriOptionShuffleEligible(question)) return identity;
  let h = 2166136261;
  const str = `${seed}|${question.id}`;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const order = [...identity];
  for (let i = order.length - 1; i > 0; i -= 1) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.every((v, i) => v === i) ? identity : order;
}

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

/**
 * 解析大小寫字母配對作答字串或物件
 */
export function parseAlphabetPairAnswer(raw) {
  if (!raw) return { upper: '', lower: '' };
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return {
      upper: String(raw.upper || '').trim().slice(0, 1),
      lower: String(raw.lower || '').trim().slice(0, 1),
    };
  }
  const str = String(raw).trim();
  if (!str) return { upper: '', lower: '' };
  if (str.includes(',')) {
    const [u = '', l = ''] = str.split(',');
    return {
      upper: u.trim().slice(0, 1),
      lower: l.trim().slice(0, 1),
    };
  }
  const letters = str.replace(/\s+/g, '');
  return {
    upper: letters.slice(0, 1),
    lower: letters.slice(1, 2),
  };
}

export function formatAlphabetPairValue(upper = '', lower = '') {
  const u = String(upper || '').trim().slice(0, 1);
  const l = String(lower || '').trim().slice(0, 1);
  if (!u && !l) return '';
  return `${u}, ${l}`;
}

export function hasPrioriAnswer(question, rawAnswer) {
  if (!question) return false;
  if (question.questionType === 'alphabet-pair') {
    const { upper, lower } = parseAlphabetPairAnswer(rawAnswer);
    return Boolean(upper && lower);
  }
  return rawAnswer !== undefined && rawAnswer !== null && rawAnswer !== '';
}

export function isPrioriAnswerCorrect(question, rawAnswer) {
  if (!question) return false;
  if (question.questionType === 'alphabet-pair') {
    const { upper, lower } = parseAlphabetPairAnswer(rawAnswer);
    if (!upper || !lower) return false;
    const expectedUpper =
      question.expectedUpper || parseAlphabetPairAnswer(question.answer).upper;
    const expectedLower =
      question.expectedLower || parseAlphabetPairAnswer(question.answer).lower;
    return upper === expectedUpper && lower === expectedLower;
  }
  return rawAnswer === question.answer;
}

/**
 * 依題庫與逐題作答／連對紀錄重算全卷成績與精熟摘要
 */
export function summarizePrioriPaperState(
  paper,
  latestAnswers = {},
  streaks = {},
  firstAnswers = null,
  fallbackTotal = 25
) {
  const questions = Array.isArray(paper?.questions) ? paper.questions : null;
  if (!questions || questions.length === 0) {
    const qIds = Array.from(
      new Set([...Object.keys(latestAnswers || {}), ...Object.keys(streaks || {})])
    );
    const totalCount = Math.max(1, Number(fallbackTotal) || qIds.length || 25);
    const masteredIds = qIds.filter((qid) => (Number(streaks?.[qid]) || 0) >= 2);
    const wrongIds = qIds.filter((qid) => (Number(streaks?.[qid]) || 0) === 0);
    return {
      totalCount,
      correctCount: masteredIds.length,
      latestScore: Math.round((masteredIds.length / totalCount) * 100),
      wrongIds,
      masteredIds,
      masteredCount: masteredIds.length,
      firstCorrectCount: undefined,
      firstScore: undefined,
    };
  }

  const wrongIds = [];
  const masteredIds = [];
  let correctCount = 0;

  for (const q of questions) {
    const ans = latestAnswers?.[q.id];
    if (isPrioriAnswerCorrect(q, ans)) {
      correctCount += 1;
    } else {
      wrongIds.push(q.id);
    }
    if ((Number(streaks?.[q.id]) || 0) >= 2) {
      masteredIds.push(q.id);
    }
  }

  const totalCount = questions.length;
  const latestScore = Math.round((correctCount / Math.max(1, totalCount)) * 100);

  let firstCorrectCount;
  let firstScore;
  if (firstAnswers && typeof firstAnswers === 'object') {
    let fc = 0;
    let hasAnyFirst = false;
    for (const q of questions) {
      const fAns = firstAnswers[q.id];
      if (hasPrioriAnswer(q, fAns)) {
        hasAnyFirst = true;
      }
      if (isPrioriAnswerCorrect(q, fAns)) {
        fc += 1;
      }
    }
    if (hasAnyFirst || Object.keys(firstAnswers).length > 0) {
      firstCorrectCount = fc;
      firstScore = Math.round((fc / Math.max(1, totalCount)) * 100);
    }
  }

  return {
    totalCount,
    correctCount,
    latestScore,
    wrongIds,
    masteredIds,
    masteredCount: masteredIds.length,
    firstCorrectCount,
    firstScore,
  };
}

/**
 * 依最新題庫標準答案重算單筆紀錄（修正過往誤鍵題號後可自動校正既有本機／雲端分數、初測分數、錯題表與連對一致度）
 */
export function reconcilePrioriPaperRecordWithPaper(rec, paper = null) {
  if (!rec || typeof rec !== 'object' || !Array.isArray(paper?.questions) || paper.questions.length === 0) {
    return rec;
  }
  const latestAnswers = rec.latestAnswers;
  const firstAnswers =
    rec.firstAnswers && typeof rec.firstAnswers === 'object' ? rec.firstAnswers : null;
  if (!latestAnswers || typeof latestAnswers !== 'object') {
    return rec;
  }

  const nextStreaks = { ...(rec.streaks || {}) };
  let streaksChanged = false;

  // 首測總分 ≥ 80：初測答對且之後未再作答（作答次數 ≤ 1）之題目，直接認列精熟（streak = 2）
  let firstTestHighScore = false;
  if (firstAnswers) {
    let fc = 0;
    for (const q of paper.questions) {
      if (isPrioriAnswerCorrect(q, firstAnswers[q.id])) fc += 1;
    }
    firstTestHighScore =
      Math.round((fc / Math.max(1, paper.questions.length)) * 100) >=
      PRIORI_FIRST_TEST_MASTERY_SCORE;
  }

  for (const q of paper.questions) {
    if (!Object.prototype.hasOwnProperty.call(latestAnswers, q.id)) continue;
    const ans = latestAnswers[q.id];
    if (!hasPrioriAnswer(q, ans)) continue;
    const isCorrect = isPrioriAnswerCorrect(q, ans);
    const curStreak = Number(nextStreaks[q.id]) || 0;
    if (isCorrect && curStreak === 0) {
      nextStreaks[q.id] = 1;
      streaksChanged = true;
    } else if (!isCorrect && curStreak > 0) {
      nextStreaks[q.id] = 0;
      streaksChanged = true;
    }
    if (
      firstTestHighScore &&
      isCorrect &&
      (Number(nextStreaks[q.id]) || 0) === 1 &&
      isPrioriAnswerCorrect(q, firstAnswers[q.id]) &&
      Number(rec.questionAttemptCounts?.[q.id]) === 1
    ) {
      nextStreaks[q.id] = 2;
      streaksChanged = true;
    }
  }

  const summary = summarizePrioriPaperState(
    paper,
    latestAnswers,
    nextStreaks,
    firstAnswers,
    rec.totalCount || paper.totalQuestions || 25
  );

  const unchanged =
    !streaksChanged &&
    rec.latestScore === summary.latestScore &&
    rec.score === summary.latestScore &&
    rec.correctCount === summary.correctCount &&
    rec.masteredCount === summary.masteredCount &&
    (typeof summary.firstScore !== 'number' || rec.firstScore === summary.firstScore) &&
    (typeof summary.firstCorrectCount !== 'number' ||
      rec.firstCorrectCount === summary.firstCorrectCount) &&
    Array.isArray(rec.wrongIds) &&
    rec.wrongIds.length === summary.wrongIds.length &&
    rec.wrongIds.every((id, i) => id === summary.wrongIds[i]);

  if (unchanged) return rec;

  return {
    ...rec,
    score: summary.latestScore,
    latestScore: summary.latestScore,
    correctCount: summary.correctCount,
    totalCount: summary.totalCount,
    wrongIds: summary.wrongIds,
    masteredIds: summary.masteredIds,
    masteredCount: summary.masteredCount,
    streaks: nextStreaks,
    firstScore: typeof summary.firstScore === 'number' ? summary.firstScore : rec.firstScore,
    firstCorrectCount:
      typeof summary.firstCorrectCount === 'number'
        ? summary.firstCorrectCount
        : rec.firstCorrectCount,
  };
}

/**
 * 合併單卷新舊／跨裝置作答紀錄（保留初次測驗快照與較新精熟進度，避免舊機或未作答題覆蓋實作答，並重算總分與精熟數）
 */
export function mergePrioriPaperRecordWithPaper(localRec, cloudRec, paper = null) {
  if (!localRec && !cloudRec) return null;
  if (!localRec) return reconcilePrioriPaperRecordWithPaper(cloudRec, paper);
  if (!cloudRec) return reconcilePrioriPaperRecordWithPaper(localRec, paper);

  const localTs = new Date(localRec.updatedAt || localRec.completedAt || 0).getTime();
  const cloudTs = new Date(cloudRec.updatedAt || cloudRec.completedAt || 0).getTime();
  const newer = cloudTs >= localTs ? cloudRec : localRec;
  const older = cloudTs >= localTs ? localRec : cloudRec;

  const qById = paper
    ? Object.fromEntries(paper.questions.map((q) => [q.id, q]))
    : {};

  const olderLatest = older.latestAnswers || {};
  const newerLatest = newer.latestAnswers || {};
  const mergedLatestAnswers = { ...olderLatest };
  for (const [qid, newerVal] of Object.entries(newerLatest)) {
    const q = qById[qid];
    const newerHasAns = q
      ? hasPrioriAnswer(q, newerVal)
      : newerVal !== undefined && newerVal !== null && newerVal !== '';
    const olderHasAns = q
      ? hasPrioriAnswer(q, olderLatest[qid])
      : olderLatest[qid] !== undefined && olderLatest[qid] !== null && olderLatest[qid] !== '';
    if (newerHasAns || !olderHasAns) {
      mergedLatestAnswers[qid] = newerVal;
    }
  }

  const olderStreaks = older.streaks || {};
  const newerStreaks = newer.streaks || {};
  const mergedStreaks = { ...olderStreaks };
  for (const [qid, newerStreakVal] of Object.entries(newerStreaks)) {
    const q = qById[qid];
    const newerHasAns = q
      ? hasPrioriAnswer(q, newerLatest[qid])
      : newerLatest[qid] !== undefined && newerLatest[qid] !== null && newerLatest[qid] !== '';
    const olderHasAns = q
      ? hasPrioriAnswer(q, olderLatest[qid])
      : olderLatest[qid] !== undefined && olderLatest[qid] !== null && olderLatest[qid] !== '';
    if (newerHasAns || !olderHasAns) {
      mergedStreaks[qid] = Number(newerStreakVal) || 0;
    } else if (!Object.prototype.hasOwnProperty.call(mergedStreaks, qid)) {
      mergedStreaks[qid] = Number(newerStreakVal) || 0;
    }
  }

  const candidates = [older, newer].filter(
    (record) => record.firstAnswers && typeof record.firstAnswers === 'object' && Object.keys(record.firstAnswers).length > 0
  );
  const firstCandidate = candidates.length === 2 && candidates.every((record) => record.firstSubmittedAt)
    ? candidates.sort((a, b) => new Date(a.firstSubmittedAt) - new Date(b.firstSubmittedAt))[0]
    : candidates[0] || older;
  const mergedFirstAnswers = firstCandidate.firstAnswers || null;

  const mergedScratchpad = { ...(older.scratchpad || {}) };
  for (const [qid, strokes] of Object.entries(newer.scratchpad || {})) {
    if (Array.isArray(strokes) && strokes.length > 0) {
      mergedScratchpad[qid] = strokes;
    }
  }

  const mergedQCounts = { ...(older.questionAttemptCounts || {}) };
  for (const [qid, cnt] of Object.entries(newer.questionAttemptCounts || {})) {
    mergedQCounts[qid] = Math.max(Number(mergedQCounts[qid]) || 0, Number(cnt) || 0);
  }

  const summary = summarizePrioriPaperState(
    paper,
    mergedLatestAnswers,
    mergedStreaks,
    mergedFirstAnswers,
    newer.totalCount || older.totalCount || 25
  );

  const fallbackFirstScore =
    typeof older.firstScore === 'number'
      ? older.firstScore
      : typeof newer.firstScore === 'number'
      ? newer.firstScore
      : summary.latestScore;
  const fallbackFirstCorrect =
    typeof firstCandidate.firstCorrectCount === 'number'
      ? firstCandidate.firstCorrectCount
      : older.firstCorrectCount ?? summary.correctCount;

  return reconcilePrioriPaperRecordWithPaper(
    {
      ...newer,
      score: summary.latestScore,
      latestScore: summary.latestScore,
      correctCount: summary.correctCount,
      totalCount: summary.totalCount,
      wrongIds: summary.wrongIds,
      masteredIds: summary.masteredIds,
      masteredCount: summary.masteredCount,
      firstScore:
        typeof summary.firstScore === 'number' ? summary.firstScore : fallbackFirstScore,
      firstAnswers: mergedFirstAnswers,
      firstCorrectCount:
        typeof summary.firstCorrectCount === 'number'
          ? summary.firstCorrectCount
          : fallbackFirstCorrect,
      firstSubmittedAt: firstCandidate.firstSubmittedAt || older.firstSubmittedAt || older.completedAt,
      latestAnswers: mergedLatestAnswers,
      streaks: mergedStreaks,
      scratchpad: mergedScratchpad,
      questionAttemptCounts: mergedQCounts,
      attemptsCount: Math.max(Number(localRec.attemptsCount) || 1, Number(cloudRec.attemptsCount) || 1),
      drillAttemptsCount: Math.max(
        Number(localRec.drillAttemptsCount) || 0,
        Number(cloudRec.drillAttemptsCount) || 0
      ),
    },
    paper
  );
}
