import { supabase, getDeviceId } from '../../services/supabase';
import {
  parseStudentId,
  formatStudentDisplayName,
  isGuestStudent,
} from '../../utils/studentIdHelper';
import { PRIORI_PAPERS, PRIORI_PAPER_MAP } from '../../data/priori';
import {
  parseAlphabetPairAnswer,
  formatAlphabetPairValue,
  hasPrioriAnswer,
  isPrioriAnswerCorrect,
  summarizePrioriPaperState,
  reconcilePrioriPaperRecordWithPaper,
  mergePrioriPaperRecordWithPaper,
  PRIORI_FIRST_TEST_MASTERY_SCORE,
} from './prioriDrill';
import {
  getPrioriTeacherSession,
  isPrioriSchemaPendingError,
  isPrioriUnauthorizedError,
} from './prioriSecurity';

export {
  parseAlphabetPairAnswer,
  formatAlphabetPairValue,
  hasPrioriAnswer,
  isPrioriAnswerCorrect,
  summarizePrioriPaperState,
};

const STORAGE_PREFIX = 'wutai_priori_v1_';
const STUDENT_META_INDEX_KEY = 'wutai_priori_student_meta_v1';
const LAST_IPAD_SEAT_KEY = 'wutai_priori_last_seat_on_ipad_v1';
const DEVICE_SECRET_KEY = 'wutai_priori_device_secret_v1';
const STUDENT_SESSIONS_KEY = 'wutai_priori_student_sessions_v1';

export function getOrCreatePrioriDeviceSecret() {
  try {
    const existing = localStorage.getItem(DEVICE_SECRET_KEY);
    if (existing && existing.length >= 32) return existing;
    let secret = '';
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      secret = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    } else {
      secret =
        'wdev_' +
        Math.random().toString(36).slice(2) +
        Math.random().toString(36).slice(2) +
        Date.now().toString(36);
    }
    localStorage.setItem(DEVICE_SECRET_KEY, secret);
    return secret;
  } catch {
    return 'fallback_' + getDeviceId();
  }
}

function loadAllStudentSessions() {
  try {
    const raw = localStorage.getItem(STUDENT_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getCachedPrioriStudentSession(studentKey) {
  if (!studentKey || studentKey === 'guest' || studentKey === '999999') return null;
  const all = loadAllStudentSessions();
  const entry = all?.[studentKey];
  if (!entry?.token || !entry?.expiresAt) return null;
  if (new Date(entry.expiresAt).getTime() <= Date.now() + 60_000) {
    return null;
  }
  return entry;
}

export function saveCachedPrioriStudentSession(studentKey, token, expiresAt) {
  if (!studentKey || studentKey === 'guest' || !token) return;
  try {
    const all = loadAllStudentSessions();
    all[studentKey] = {
      token,
      expiresAt: expiresAt || new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
    };
    localStorage.setItem(STUDENT_SESSIONS_KEY, JSON.stringify(all));
  } catch {}
}

export function clearCachedPrioriStudentSession(studentKey) {
  if (!studentKey) return;
  try {
    const all = loadAllStudentSessions();
    if (all && Object.prototype.hasOwnProperty.call(all, studentKey)) {
      delete all[studentKey];
      localStorage.setItem(STUDENT_SESSIONS_KEY, JSON.stringify(all));
    }
  } catch {}
}

export function getPrioriStorageKey(studentId) {
  return `${STORAGE_PREFIX}${studentId || 'guest'}`;
}

export function loadPrioriRecords(studentId) {
  try {
    const raw = localStorage.getItem(getPrioriStorageKey(studentId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const reconciled = {};
    for (const [pid, rec] of Object.entries(parsed)) {
      reconciled[pid] = reconcilePrioriPaperRecordWithPaper(rec, PRIORI_PAPER_MAP[pid] || null);
    }
    return reconciled;
  } catch {
    return {};
  }
}

function loadStudentMetaIndex() {
  try {
    const raw = localStorage.getItem(STUDENT_META_INDEX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStudentMetaIndex(studentKey, meta) {
  try {
    const index = loadStudentMetaIndex();
    index[studentKey] = {
      ...(index[studentKey] || {}),
      ...meta,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STUDENT_META_INDEX_KEY, JSON.stringify(index));
  } catch {}
}

export function formatPrioriAnswerLabel(question, rawAnswer, withText = true) {
  if (rawAnswer === undefined || rawAnswer === null || rawAnswer === '') {
    return '未作答';
  }
  if (question?.questionType === 'alphabet-pair') {
    const { upper, lower } = parseAlphabetPairAnswer(rawAnswer);
    return `${upper || '＿'}, ${lower || '＿'}`;
  }
  if (typeof rawAnswer === 'number') {
    const text = question?.options?.[rawAnswer];
    return withText && text ? `(${rawAnswer + 1}) ${text}` : `(${rawAnswer + 1})`;
  }
  return String(rawAnswer);
}

/**
 * 將手寫筆畫壓縮成精簡正規化向量格式，降低儲存容量（保留筆型、顏色與關鍵點位）
 */
export function compressStrokes(strokes = [], maxStrokes = 20, maxPtsPerStroke = 72) {
  if (!Array.isArray(strokes) || strokes.length === 0) return [];
  const sliced = strokes.slice(-maxStrokes);
  const result = [];

  for (const s of sliced) {
    const rawPts = Array.isArray(s.points)
      ? s.points
      : Array.isArray(s.p)
      ? s.p.map(([nx, ny]) => ({ nx, ny }))
      : [];
    if (rawPts.length === 0) continue;

    let sampled = rawPts;
    if (rawPts.length > maxPtsPerStroke) {
      sampled = [];
      const step = (rawPts.length - 1) / (maxPtsPerStroke - 1);
      for (let i = 0; i < maxPtsPerStroke; i++) {
        sampled.push(rawPts[Math.min(rawPts.length - 1, Math.round(i * step))]);
      }
    }

    result.push({
      t: s.tool === 'eraser' || s.t === 'eraser' ? 'eraser' : 'pen',
      c: s.colorId || s.c || 'teal',
      p: sampled.map((pt) => [
        Math.round(Math.max(0, Math.min(1, Number(pt.nx) || 0)) * 1000) / 1000,
        Math.round(Math.max(0, Math.min(1, Number(pt.ny) || 0)) * 1000) / 1000,
      ]),
    });
  }
  return result;
}

export function buildStudentIdentity(student, displayName) {
  const sid = student?.student_id ? String(student.student_id) : 'guest';
  const guestFlag = isGuestStudent(student) || sid === 'guest' || sid === '999999';
  if (guestFlag) {
    return {
      studentKey: 'guest',
      isGuest: true,
      grade: '03',
      classNum: 'guest',
      seat: '00',
      displayName: displayName || '訪客學生',
    };
  }
  const parsed = parseStudentId(sid);
  const grade = String(student?.grade || parsed.grade || '03').padStart(2, '0');
  const classNum = String(student?.class || parsed.classNum || '1');
  const seat = String(student?.seat || parsed.seat || '01').padStart(2, '0');
  const resolvedName =
    displayName || formatStudentDisplayName(student) || `三年${classNum}班 ${Number(seat)}號`;
  return {
    studentKey: sid,
    isGuest: false,
    grade,
    classNum,
    seat,
    displayName: resolvedName,
  };
}

/**
 * 輕量本機 iPad 座號記憶（協助提醒點錯座號或更換裝置，不鎖定也不需學生密碼）
 */
export function getLastSeatOnThisIpad() {
  try {
    const raw = localStorage.getItem(LAST_IPAD_SEAT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function rememberSeatOnThisIpad(student, displayName) {
  const identity = buildStudentIdentity(student, displayName);
  if (identity.isGuest) return null;
  const info = {
    studentKey: identity.studentKey,
    displayName: identity.displayName,
    deviceId: getDeviceId(),
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(LAST_IPAD_SEAT_KEY, JSON.stringify(info));
  } catch {}
  return info;
}

/**
 * 合併單卷新舊／跨裝置作答紀錄（保留初次測驗快照與較新精熟進度，避免舊機或未作答題覆蓋實作答，並重算總分與精熟數）
 */
export function mergePrioriPaperRecord(localRec, cloudRec) {
  const paperId = cloudRec?.paperId || localRec?.paperId;
  return mergePrioriPaperRecordWithPaper(
    localRec,
    cloudRec,
    (paperId && PRIORI_PAPER_MAP[paperId]) || null
  );
}

/**
 * 統計單一科目底下的「待補強與錯題沉底池」（與其他科目嚴格隔離）
 */
export function getSubjectRemedialPool(savedRecords = {}, subjectId, yearFilter = 'all') {
  const papers = PRIORI_PAPERS.filter(
    (p) =>
      p.subject === subjectId &&
      (yearFilter === 'all' || String(p.year) === String(yearFilter))
  );

  const wrongQuestions = [];
  const progressQuestions = [];
  let practicedPaperCount = 0;
  let totalPracticedQuestions = 0;
  let masteredCount = 0;

  for (const paper of papers) {
    const rec = savedRecords?.[paper.paperId];
    if (!rec) continue;
    practicedPaperCount += 1;

    for (const q of paper.questions) {
      const hasRecorded =
        rec.latestAnswers &&
        Object.prototype.hasOwnProperty.call(rec.latestAnswers, q.id);
      const streak = Number(rec.streaks?.[q.id]) || 0;
      if (!hasRecorded && streak === 0 && !rec.wrongIds?.includes(q.id)) {
        continue;
      }

      totalPracticedQuestions += 1;
      if (streak >= 2) {
        masteredCount += 1;
      } else if (streak === 1) {
        progressQuestions.push({
          ...q,
          paperId: paper.paperId,
          paperTitle: paper.title,
          _currentStreak: 1,
        });
      } else {
        wrongQuestions.push({
          ...q,
          paperId: paper.paperId,
          paperTitle: paper.title,
          _currentStreak: 0,
        });
      }
    }
  }

  const allRemedialQuestions = [...wrongQuestions, ...progressQuestions];
  return {
    subjectId,
    practicedPaperCount,
    totalPracticedQuestions,
    masteredCount,
    wrongQuestions,
    progressQuestions,
    allRemedialQuestions,
  };
}

export {
  PRIORI_DRILL_LIMIT_OPTIONS,
  PRIORI_DRILL_DEFAULT_LIMIT,
  PRIORI_FIRST_TEST_MASTERY_SCORE,
  normalizePrioriDrillLimit,
  buildPrioriDrillCohort,
  stepPrioriDrillQueue,
  isPrioriOptionShuffleEligible,
  getPrioriOptionDisplayOrder,
} from './prioriDrill';

/**
 * 記錄單次篩選測驗作答（支援整卷、沉底錯題重練、連續答對 2 次精熟判定與分題計算紙保存）
 * 完全獨立於單字館金幣／探索積分與 mcq-exam 檢定統計。
 */
export function recordPrioriAttempt({
  student,
  displayName,
  paper,
  activeQueue = [],
  answers = {},
  strokesByQuestion = {},
  firstTryWrongIds = [],
  streakOverrides = null,
  isMistakeRetry = false,
  elapsedSeconds = 0,
  onCloudSyncResult = null,
}) {
  if (!paper || !Array.isArray(paper.questions)) return null;

  const firstWrongSet = new Set(Array.isArray(firstTryWrongIds) ? firstTryWrongIds : []);
  const identity = buildStudentIdentity(student, displayName);
  const existingAll = loadPrioriRecords(identity.studentKey);
  const prev = existingAll[paper.paperId] || {};

  const prevLatestAnswers = prev.latestAnswers || {};
  const prevFirstAnswers = prev.firstAnswers || null;
  const prevStreaks = prev.streaks || {};
  const prevScratchpad = prev.scratchpad || {};
  const prevQuestionAttemptCounts = prev.questionAttemptCounts || {};

  const nextLatestAnswers = { ...prevLatestAnswers };
  const nextStreaks = { ...prevStreaks };
  const nextScratchpad = { ...prevScratchpad };
  const nextQuestionAttemptCounts = { ...prevQuestionAttemptCounts };
  const newlyMasteredIds = [];

  // 去重（沉底模式可能同一題出現在佇列多次，只結算各獨特題 ID 一次）
  const uniqueQueue = [];
  const seenIds = new Set();
  for (const q of activeQueue) {
    if (!q?.id || seenIds.has(q.id)) continue;
    seenIds.add(q.id);
    uniqueQueue.push(q);
  }

  for (const q of uniqueQueue) {
    const rawAns = answers[q.id];
    const hasAns = rawAns !== undefined && rawAns !== null && rawAns !== '';
    nextLatestAnswers[q.id] = hasAns ? rawAns : null;
    nextQuestionAttemptCounts[q.id] = (Number(nextQuestionAttemptCounts[q.id]) || 0) + 1;

    const prevStreak = Number(prevStreaks[q.id]) || 0;
    const isCorrect = isPrioriAnswerCorrect(q, rawAns);

    if (
      streakOverrides &&
      Object.prototype.hasOwnProperty.call(streakOverrides, q.id)
    ) {
      const updated = Math.max(0, Number(streakOverrides[q.id]) || 0);
      nextStreaks[q.id] = updated;
      if (prevStreak < 2 && updated >= 2) {
        newlyMasteredIds.push(q.id);
      }
    } else if (isCorrect) {
      if (firstWrongSet.has(q.id)) {
        // 沉底模式中第一輪答錯、最後才答對：重設連對為 1（必須下次一次就對才升為 2 精熟）
        nextStreaks[q.id] = 1;
      } else {
        const updated = prevStreak + 1;
        nextStreaks[q.id] = updated;
        if (prevStreak < 2 && updated >= 2) {
          newlyMasteredIds.push(q.id);
        }
      }
    } else {
      nextStreaks[q.id] = 0;
    }

    const strokes = strokesByQuestion[q.id];
    if (Array.isArray(strokes) && strokes.length > 0) {
      nextScratchpad[q.id] = compressStrokes(strokes);
    }
  }

  // 首次正式測驗總分 ≥ 80：答對的題目直接認列精熟（streak = 2），答錯者維持 0 進入待精熟
  const isFirstFormalTest =
    !(prevFirstAnswers && Object.keys(prevFirstAnswers).length > 0) && !isMistakeRetry;
  if (isFirstFormalTest && uniqueQueue.length > 0) {
    const firstCorrectQs = uniqueQueue.filter((q) =>
      isPrioriAnswerCorrect(q, answers[q.id])
    );
    const firstPct = Math.round((firstCorrectQs.length / uniqueQueue.length) * 100);
    if (firstPct >= PRIORI_FIRST_TEST_MASTERY_SCORE) {
      for (const q of firstCorrectQs) {
        if ((Number(nextStreaks[q.id]) || 0) < 2) {
          nextStreaks[q.id] = 2;
          if (!newlyMasteredIds.includes(q.id)) newlyMasteredIds.push(q.id);
        }
      }
    }
  }

  // 全卷維度彙整（確保錯題重練後也能反映全卷最新作答、最新分數與精熟進展）
  const wrongIds = [];
  const masteredIds = [];
  let correctCount = 0;

  for (const q of paper.questions) {
    const ans = nextLatestAnswers[q.id];
    if (isPrioriAnswerCorrect(q, ans)) {
      correctCount += 1;
    } else {
      wrongIds.push(q.id);
    }
    if ((nextStreaks[q.id] || 0) >= 2) {
      masteredIds.push(q.id);
    }
  }

  const totalCount = paper.questions.length;
  const latestScore = Math.round((correctCount / Math.max(1, totalCount)) * 100);
  const sessionCorrect = uniqueQueue.filter((q) =>
    isPrioriAnswerCorrect(q, answers[q.id])
  ).length;
  const sessionScore = Math.round(
    (sessionCorrect / Math.max(1, uniqueQueue.length)) * 100
  );

  // 初測快照僅於首次正式作答建立（後續自主精熟補練不可覆蓋）
  const hasExistingFirstAnswers =
    prevFirstAnswers && Object.keys(prevFirstAnswers).length > 0;
  let nextFirstAnswers = prevFirstAnswers;
  let nextFirstCorrectCount = prev.firstCorrectCount;
  if (!hasExistingFirstAnswers && !isMistakeRetry) {
    const snap = {};
    let fc = 0;
    for (const q of uniqueQueue) {
      const raw = answers[q.id];
      const hasA = raw !== undefined && raw !== null && raw !== '';
      snap[q.id] = hasA ? raw : null;
      if (isPrioriAnswerCorrect(q, raw)) fc += 1;
    }
    nextFirstAnswers = snap;
    nextFirstCorrectCount = fc;
  }

  const firstScore =
    typeof prev.firstScore === 'number'
      ? prev.firstScore
      : !isMistakeRetry
      ? sessionScore
      : latestScore;

  const updatedAt = new Date().toISOString();
  const currentDeviceId = getDeviceId();
  const nextRecord = {
    paperId: paper.paperId,
    year: paper.year,
    subject: paper.subject,
    grade: paper.grade,
    studentKey: identity.studentKey,
    studentGrade: identity.grade,
    studentClass: identity.classNum,
    studentSeat: identity.seat,
    displayName: identity.displayName,
    lastDeviceId: currentDeviceId,
    score: latestScore,
    latestScore,
    firstScore,
    firstAnswers: nextFirstAnswers || null,
    firstCorrectCount:
      typeof nextFirstCorrectCount === 'number' ? nextFirstCorrectCount : correctCount,
    firstSubmittedAt: prev.firstSubmittedAt || (!isMistakeRetry ? updatedAt : undefined),
    sessionScore,
    sessionCorrect,
    sessionTotal: uniqueQueue.length,
    correctCount,
    totalCount,
    wrongIds,
    masteredIds,
    masteredCount: masteredIds.length,
    newlyMasteredIds,
    streaks: nextStreaks,
    latestAnswers: nextLatestAnswers,
    questionAttemptCounts: nextQuestionAttemptCounts,
    scratchpad: nextScratchpad,
    attemptsCount: (prev.attemptsCount || 0) + 1,
    drillAttemptsCount: (prev.drillAttemptsCount || 0) + (isMistakeRetry ? 1 : 0),
    elapsedSeconds,
    completedAt: updatedAt,
    updatedAt,
  };

  try {
    existingAll[paper.paperId] = nextRecord;
    localStorage.setItem(
      getPrioriStorageKey(identity.studentKey),
      JSON.stringify(existingAll)
    );
    saveStudentMetaIndex(identity.studentKey, {
      studentKey: identity.studentKey,
      grade: identity.grade,
      classNum: identity.classNum,
      seat: identity.seat,
      displayName: identity.displayName,
    });
    if (!identity.isGuest) {
      rememberSeatOnThisIpad(student, identity.displayName);
    }
  } catch {}

  // 訪客作答只留本機，不上傳雲端共用紀錄鍵
  if (identity.isGuest) {
    if (typeof onCloudSyncResult === 'function') {
      onCloudSyncResult({ ok: true, localOnly: true });
    }
    return nextRecord;
  }

  // 雲端同步僅寫入隔離通道 mode='priori-record', week=0（CI 測試環境略過網路寫入）
  if (typeof window === 'undefined' || !window.__CI__) {
    syncPrioriRecordToCloud(identity, nextRecord)
      .then((res) => {
        if (typeof onCloudSyncResult === 'function') onCloudSyncResult(res);
      })
      .catch((err) => {
        if (typeof onCloudSyncResult === 'function') {
          onCloudSyncResult({ ok: false, error: err?.message || '雲端同步失敗' });
        }
      });
  }

  return nextRecord;
}

/**
 * 記錄分科跨卷待補強特訓（會自動按題目所屬試卷 paperId 拆分並分別更新精熟狀態）
 */
export function recordPrioriSubjectDrillAttempt({
  student,
  displayName,
  fallbackPaper,
  activeQueue = [],
  answers = {},
  strokesByQuestion = {},
  firstTryWrongIds = [],
  streakOverrides = null,
  elapsedSeconds = 0,
  onCloudSyncResult = null,
}) {
  const byPaperId = new Map();
  for (const q of activeQueue) {
    const pid = q.paperId || fallbackPaper?.paperId;
    if (!pid) continue;
    if (!byPaperId.has(pid)) byPaperId.set(pid, []);
    byPaperId.get(pid).push(q);
  }

  const updatedByPaper = {};
  const newlyMasteredIds = [];

  for (const [pid, qList] of byPaperId.entries()) {
    const targetPaper = PRIORI_PAPER_MAP[pid] || fallbackPaper;
    if (!targetPaper) continue;
    const rec = recordPrioriAttempt({
      student,
      displayName,
      paper: targetPaper,
      activeQueue: qList,
      answers,
      strokesByQuestion,
      firstTryWrongIds,
      streakOverrides,
      isMistakeRetry: true,
      elapsedSeconds,
      onCloudSyncResult,
    });
    if (rec) {
      updatedByPaper[pid] = rec;
      newlyMasteredIds.push(...(rec.newlyMasteredIds || []));
    }
  }

  return {
    primaryRecord:
      (fallbackPaper && updatedByPaper[fallbackPaper.paperId]) ||
      Object.values(updatedByPaper)[0] ||
      null,
    updatedByPaper,
    newlyMasteredIds,
  };
}

function serializeRecordForCloud(identity, record) {
  const compactPayload = {
    v: 3,
    paperId: record.paperId,
    studentKey: identity.studentKey,
    grade: identity.grade,
    classNum: identity.classNum,
    seat: identity.seat,
    displayName: identity.displayName,
    lastDeviceId: record.lastDeviceId || getDeviceId(),
    firstScore: record.firstScore,
    firstAnswers: record.firstAnswers || null,
    firstCorrectCount: record.firstCorrectCount,
    firstSubmittedAt: record.firstSubmittedAt,
    latestScore: record.latestScore,
    correctCount: record.correctCount,
    totalCount: record.totalCount,
    masteredCount: record.masteredCount,
    attemptsCount: record.attemptsCount,
    drillAttemptsCount: record.drillAttemptsCount || 0,
    streaks: record.streaks,
    latestAnswers: record.latestAnswers,
    questionAttemptCounts: record.questionAttemptCounts || {},
    scratchpad: record.scratchpad,
    updatedAt: record.updatedAt,
  };

  // 防禦過大筆跡 payload：若超過 40KB 則每筆畫再降採樣，確保不遺失作答與初測欄位
  if (JSON.stringify(compactPayload).length > 40000) {
    const trimmedPad = {};
    for (const [qId, strokes] of Object.entries(record.scratchpad || {})) {
      trimmedPad[qId] = compressStrokes(strokes, 12, 28);
    }
    return { ...compactPayload, scratchpad: trimmedPad };
  }
  return compactPayload;
}

function hydrateCloudPayload(row) {
  const rawPayload = row?.payload || row?.book;
  if (!rawPayload) return null;
  try {
    const payload = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
    const pid = payload?.paperId || row?.paper_id;
    if (!pid) return null;
    const sk = payload.studentKey || row?.student_key || 'guest';
    if (sk === 'guest' || sk === '999999') return null;
    return reconcilePrioriPaperRecordWithPaper(
      {
        paperId: pid,
        studentKey: sk,
        studentGrade: payload.grade || row?.grade || '03',
        studentClass: payload.classNum || row?.class_num || '1',
        studentSeat: payload.seat || row?.seat || '01',
        displayName: payload.displayName || row?.name || sk,
        lastDeviceId: payload.lastDeviceId || '',
        firstScore: payload.firstScore ?? row?.score ?? 0,
        firstAnswers: payload.firstAnswers || null,
        firstCorrectCount: payload.firstCorrectCount,
        firstSubmittedAt: payload.firstSubmittedAt,
        latestScore: payload.latestScore ?? row?.score ?? 0,
        score: payload.latestScore ?? row?.score ?? 0,
        correctCount: payload.correctCount ?? 0,
        totalCount:
          payload.totalCount ?? (PRIORI_PAPER_MAP[pid]?.totalQuestions || 25),
        masteredCount: payload.masteredCount ?? row?.time ?? 0,
        attemptsCount: payload.attemptsCount ?? 1,
        drillAttemptsCount: payload.drillAttemptsCount ?? 0,
        streaks: payload.streaks || {},
        latestAnswers: payload.latestAnswers || {},
        questionAttemptCounts: payload.questionAttemptCounts || {},
        scratchpad: payload.scratchpad || {},
        updatedAt: payload.updatedAt || row?.updated_at || row?.created_at,
        source: 'cloud',
      },
      PRIORI_PAPER_MAP[pid] || null
    );
  } catch {
    return null;
  }
}

/**
 * 透過伺服器 RPC 取得／核發當前座號專屬的學生工作階段 Token
 * - 同台已綁定裝置：直接無密碼核發 token (`trusted_device`)
 * - 全新空白座號首登：由學生直接自設 4 碼小密碼 (`needs_pin_setup` -> `bound_new`)
 * - 已有雲端舊紀錄且未綁定：提示先由教師於後台設 4 碼 (`needs_teacher_pin`)
 * - 更換新裝置或教師重設後：輸入該 4 碼小密碼 (`pin_required` -> `pin_verified`)
 */
export async function loginPrioriStudentSeat(
  student,
  transferPin = null,
  displayName = '',
  { forceRefresh = false } = {}
) {
  const identity = buildStudentIdentity(student, displayName);
  if (identity.isGuest || (typeof window !== 'undefined' && window.__CI__)) {
    return { ok: true, isGuest: true, token: '' };
  }

  const cleanPin =
    typeof transferPin === 'string' && transferPin.trim() ? transferPin.trim() : null;

  if (!forceRefresh && !cleanPin) {
    const cached = getCachedPrioriStudentSession(identity.studentKey);
    if (cached?.token) {
      return {
        ok: true,
        token: cached.token,
        status: 'cached',
        studentKey: identity.studentKey,
      };
    }
  }

  try {
    const { data, error } = await supabase.rpc('priori_student_login_seat', {
      p_student_key: identity.studentKey,
      p_device_secret: getOrCreatePrioriDeviceSecret(),
      p_transfer_pin: cleanPin,
      p_activation_code: null,
    });

    if (error) {
      if (isPrioriSchemaPendingError(error)) {
        return {
          ok: false,
          schemaPending: true,
          status: 'schema_pending',
          error:
            '尚未於 Supabase 執行 supabase_priori_security.sql 權限隔離腳本，目前僅保留本機作答（絕不寫入公開表）。',
        };
      }
      return {
        ok: false,
        status: 'error',
        error: error.message || '學生座號驗證失敗',
      };
    }

    if (data?.authorized && data?.token) {
      saveCachedPrioriStudentSession(identity.studentKey, data.token, data.expires_at);
      return {
        ok: true,
        token: data.token,
        status: data.status || 'trusted_device',
        studentKey: identity.studentKey,
      };
    }

    clearCachedPrioriStudentSession(identity.studentKey);
    return {
      ok: false,
      status: data?.status || 'needs_pin_setup',
      remainingAttempts: data?.remaining_attempts,
      lockedUntil: data?.locked_until || null,
      hasRecords: Boolean(data?.has_records),
      error: '',
    };
  } catch (err) {
    return {
      ok: false,
      status: 'error',
      error: err?.message || '雲端連線異常',
    };
  }
}

export async function logoutPrioriStudentSession(studentKey) {
  const cached = getCachedPrioriStudentSession(studentKey);
  clearCachedPrioriStudentSession(studentKey);
  if (!cached?.token || (typeof window !== 'undefined' && window.__CI__)) return;
  try {
    await supabase.rpc('priori_student_logout', { p_token: cached.token });
  } catch {}
}

export async function releaseWrongPrioriSeat(student) {
  const identity = buildStudentIdentity(student);
  if (identity.isGuest) return { released: true };
  const cached = getCachedPrioriStudentSession(identity.studentKey);
  clearCachedPrioriStudentSession(identity.studentKey);
  try {
    const prev = getLastSeatOnThisIpad();
    if (prev?.studentKey === identity.studentKey) {
      localStorage.removeItem(LAST_IPAD_SEAT_KEY);
    }
  } catch {}

  if (!cached?.token || (typeof window !== 'undefined' && window.__CI__)) {
    return { released: false };
  }
  try {
    const { data, error } = await supabase.rpc('priori_student_release_wrong_seat', {
      p_token: cached.token,
    });
    if (error) return { released: false, error: error.message };
    return { released: Boolean(data?.released), reason: data?.reason || '' };
  } catch (err) {
    return { released: false, error: err?.message };
  }
}

/**
 * 學生切換裝置或登入座號時，透過獨立隔離表 RPC (`priori_student_get_records`) 僅讀取自己座號的跨裝置進度（無法撈取他生紀錄）
 */
export async function fetchAndMergeStudentCloudRecords(
  student,
  displayName = '',
  options = {}
) {
  const identity = buildStudentIdentity(student, displayName);
  const localAll = loadPrioriRecords(identity.studentKey);

  if (identity.isGuest || (typeof window !== 'undefined' && window.__CI__)) {
    return {
      records: localAll,
      syncedCount: 0,
      cloudLastDeviceId: '',
      cloudError: '',
      authStatus: 'guest',
    };
  }

  try {
    let authRes = await loginPrioriStudentSeat(
      student,
      options.transferPin || null,
      displayName,
      {
        forceRefresh: Boolean(options.forceAuthCheck || options.transferPin),
      }
    );

    if (!authRes.ok) {
      if (authRes.schemaPending) {
        return {
          records: localAll,
          syncedCount: 0,
          cloudLastDeviceId: '',
          schemaPending: true,
          authStatus: 'schema_pending',
          cloudError: authRes.error,
        };
      }
      if (
        authRes.status === 'needs_pin_setup' ||
        authRes.status === 'needs_teacher_pin' ||
        authRes.status === 'pin_required' ||
        authRes.status === 'invalid_pin' ||
        authRes.status === 'pin_locked' ||
        authRes.status === 'invalid_pin_format'
      ) {
        return {
          records: localAll,
          syncedCount: 0,
          cloudLastDeviceId: '',
          authRequired: true,
          authStatus: authRes.status,
          remainingAttempts: authRes.remainingAttempts,
          lockedUntil: authRes.lockedUntil || null,
          hasRecords: Boolean(authRes.hasRecords),
          cloudError: '',
        };
      }
      return {
        records: localAll,
        syncedCount: 0,
        cloudLastDeviceId: '',
        authStatus: authRes.status || 'error',
        cloudError: authRes.error || '雲端紀錄同步失敗',
      };
    }

    let { data, error } = await supabase.rpc('priori_student_get_records', {
      p_token: authRes.token,
      p_student_key: identity.studentKey,
    });

    if (error && isPrioriUnauthorizedError(error)) {
      clearCachedPrioriStudentSession(identity.studentKey);
      authRes = await loginPrioriStudentSeat(
        student,
        options.transferPin || null,
        displayName,
        { forceRefresh: true }
      );
      if (!authRes.ok) {
        return {
          records: localAll,
          syncedCount: 0,
          cloudLastDeviceId: '',
          authRequired: !authRes.schemaPending,
          authStatus: authRes.status || 'needs_pin_setup',
          remainingAttempts: authRes.remainingAttempts,
          lockedUntil: authRes.lockedUntil || null,
          hasRecords: Boolean(authRes.hasRecords),
          cloudError: authRes.error || '',
        };
      }
      const retry = await supabase.rpc('priori_student_get_records', {
        p_token: authRes.token,
        p_student_key: identity.studentKey,
      });
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      if (isPrioriSchemaPendingError(error)) {
        return {
          records: localAll,
          syncedCount: 0,
          cloudLastDeviceId: '',
          schemaPending: true,
          authStatus: 'schema_pending',
          cloudError:
            '尚未於 Supabase 執行 supabase_priori_security.sql 權限隔離腳本，目前僅保留本機作答（絕不寫入公開表）。',
        };
      }
      return {
        records: localAll,
        syncedCount: 0,
        cloudLastDeviceId: '',
        cloudError: error.message || '雲端紀錄同步失敗',
      };
    }

    const rows = Array.isArray(data) ? data : [];
    const mergedAll = { ...localAll };
    const cloudPaperIds = new Set();
    let syncedCount = 0;
    let cloudLastDeviceId = '';
    let latestCloudTs = -1;

    for (const row of rows) {
      const cloudRec = hydrateCloudPayload(row);
      if (!cloudRec) continue;
      syncedCount += 1;
      cloudPaperIds.add(cloudRec.paperId);
      mergedAll[cloudRec.paperId] = mergePrioriPaperRecord(
        mergedAll[cloudRec.paperId],
        cloudRec
      );
      const ts = new Date(cloudRec.updatedAt || 0).getTime();
      if (cloudRec.lastDeviceId && ts >= latestCloudTs) {
        latestCloudTs = ts;
        cloudLastDeviceId = cloudRec.lastDeviceId;
      }
    }

    if (syncedCount > 0) {
      try {
        localStorage.setItem(
          getPrioriStorageKey(identity.studentKey),
          JSON.stringify(mergedAll)
        );
      } catch {}
    }

    // 若本機在登入驗證前已有尚未上雲的離線作答，完成驗證後自動補傳上雲
    for (const [pid, localRec] of Object.entries(localAll)) {
      if (!cloudPaperIds.has(pid) && localRec?.paperId) {
        syncPrioriRecordToCloud(identity, localRec, {
          studentToken: authRes.token,
        }).catch(() => {});
      }
    }

    return {
      records: mergedAll,
      syncedCount,
      cloudLastDeviceId,
      cloudError: '',
      authStatus: authRes.status,
    };
  } catch (err) {
    return {
      records: localAll,
      syncedCount: 0,
      cloudLastDeviceId: '',
      cloudError: err?.message || '雲端連線異常',
    };
  }
}

async function syncPrioriRecordToCloud(identity, record, options = {}) {
  if (identity.isGuest) {
    return { ok: true, localOnly: true };
  }
  try {
    const pseudoStudent = {
      student_id: identity.studentKey,
      grade: identity.grade,
      class: identity.classNum,
      seat: identity.seat,
    };

    let activeToken = options.studentToken || '';
    if (!activeToken) {
      const authRes = await loginPrioriStudentSeat(
        pseudoStudent,
        null,
        identity.displayName
      );
      if (!authRes.ok) {
        if (authRes.schemaPending) {
          return {
            ok: false,
            schemaPending: true,
            error: authRes.error,
          };
        }
        return {
          ok: false,
          authRequired: true,
          authStatus: authRes.status || 'needs_pin_setup',
          error:
            authRes.status === 'needs_teacher_pin'
              ? '已存於本機！此座號已有雲端舊紀錄，請先由老師在後台設定 4 碼密碼後即可同步。'
              : authRes.status === 'needs_pin_setup'
              ? '已存於本機！設定你的 4 碼小密碼後即可同步雲端。'
              : '已存於本機！完成 4 碼小密碼驗證後即可同步雲端。',
        };
      }
      activeToken = authRes.token;
    }

    let { data: existingRows, error: selectError } = await supabase.rpc(
      'priori_student_get_records',
      {
        p_token: activeToken,
        p_student_key: identity.studentKey,
      }
    );

    if (selectError && isPrioriUnauthorizedError(selectError)) {
      clearCachedPrioriStudentSession(identity.studentKey);
      const refreshAuth = await loginPrioriStudentSeat(
        pseudoStudent,
        null,
        identity.displayName,
        { forceRefresh: true }
      );
      if (!refreshAuth.ok) {
        return {
          ok: false,
          authRequired: !refreshAuth.schemaPending,
          authStatus: refreshAuth.status || 'pin_required',
          error:
            refreshAuth.error || '裝置憑證已更新，請輸入 4 碼小密碼完成驗證後再同步雲端。',
        };
      }
      activeToken = refreshAuth.token;
      const retrySel = await supabase.rpc('priori_student_get_records', {
        p_token: activeToken,
        p_student_key: identity.studentKey,
      });
      existingRows = retrySel.data;
      selectError = retrySel.error;
    }

    if (selectError) {
      if (isPrioriSchemaPendingError(selectError)) {
        return {
          ok: false,
          schemaPending: true,
          error:
            '尚未於 Supabase 執行 supabase_priori_security.sql 權限隔離腳本，作答已安全存於本機（未寫入公開資料表）。',
        };
      }
      console.warn('學習扶助紀錄雲端查詢失敗（已保存本機）:', selectError.message);
      return { ok: false, error: selectError.message };
    }

    const existing = Array.isArray(existingRows)
      ? existingRows.find((r) => (r.paper_id || r.payload?.paperId) === record.paperId)
      : null;

    let finalRecord = record;
    if (existing) {
      const existingHydrated = hydrateCloudPayload(existing);
      if (existingHydrated) {
        finalRecord = mergePrioriPaperRecord(existingHydrated, record);
        try {
          const localMap = loadPrioriRecords(identity.studentKey);
          localMap[finalRecord.paperId] = finalRecord;
          localStorage.setItem(
            getPrioriStorageKey(identity.studentKey),
            JSON.stringify(localMap)
          );
        } catch {}
      }
    }

    const cloudPayload = serializeRecordForCloud(identity, finalRecord);
    const { error: upsertError } = await supabase.rpc('priori_student_upsert_record', {
      p_token: activeToken,
      p_student_key: identity.studentKey,
      p_paper_id: finalRecord.paperId,
      p_grade: identity.grade,
      p_class_num: identity.classNum,
      p_seat: identity.seat,
      p_score: Math.min(100, Math.max(0, Number(finalRecord.latestScore) || 0)),
      p_elapsed: Math.min(7200, Math.max(0, Number(finalRecord.elapsedSeconds) || 0)),
      p_payload: cloudPayload,
    });

    if (upsertError) {
      console.warn('學習扶助紀錄雲端寫入失敗（已保存本機）:', upsertError.message);
      return { ok: false, error: upsertError.message };
    }
    return { ok: true };
  } catch (err) {
    const msg = err?.message || String(err);
    console.warn('學習扶助紀錄雲端同步暫緩（已保存本機）:', msg);
    return { ok: false, error: msg };
  }
}

function mergeStudentRecord(bucketMap, paperId, sk, nextRec) {
  if (!bucketMap.has(paperId)) bucketMap.set(paperId, new Map());
  const byStudent = bucketMap.get(paperId);
  const existing = byStudent.get(sk);
  byStudent.set(sk, mergePrioriPaperRecord(existing, nextRec));
}

function sortTeacherRecords(list) {
  return [...list].sort((a, b) => {
    if (a.studentClass !== b.studentClass) {
      return String(a.studentClass).localeCompare(String(b.studentClass), undefined, {
        numeric: true,
      });
    }
    return Number(a.studentSeat || 99) - Number(b.studentSeat || 99);
  });
}

/**
 * 一次讀取全試卷的教師診斷紀錄（僅透過伺服器驗證 token 之 `priori_teacher_list_records` RPC 讀取授權班級紀錄）
 */
export async function fetchAllPrioriTeacherRecordsWithMeta(
  filterPaperId = null,
  options = {}
) {
  const bucketByPaper = new Map();
  const metaIndex = loadStudentMetaIndex();
  let cloudError = '';
  let unauthorized = false;
  let schemaPending = false;

  const teacherSession = getPrioriTeacherSession();
  const teacherToken = options.teacherToken || teacherSession?.token || '';
  const allowedClasses = Array.isArray(options.allowedClasses)
    ? options.allowedClasses
    : teacherSession?.allowedClasses || ['*'];

  const isClassAllowed = (gradeStr, classStr) => {
    if (allowedClasses.includes('*')) return true;
    const gNorm = String(parseInt(String(gradeStr || '').replace(/\D/g, ''), 10) || gradeStr);
    const cNorm = String(parseInt(String(classStr || '').replace(/\D/g, ''), 10) || classStr);
    return (
      allowedClasses.includes(`${gNorm}-${cNorm}`) ||
      allowedClasses.includes(`${gradeStr}-${classStr}`)
    );
  };

  // 1. 收集同裝置本機端測試紀錄（需符合授權班級範圍）
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
      const studentKey = key.slice(STORAGE_PREFIX.length) || 'guest';
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsedMap = JSON.parse(raw);
      if (!parsedMap || typeof parsedMap !== 'object') continue;

      const meta = metaIndex[studentKey] || {};
      const parsedId = studentKey !== 'guest' ? parseStudentId(studentKey) : {};

      for (const [paperId, rec] of Object.entries(parsedMap)) {
        if (!rec || (filterPaperId && paperId !== filterPaperId)) continue;
        const g = rec.studentGrade || meta.grade || parsedId.grade || '03';
        const c =
          rec.studentClass ||
          meta.classNum ||
          parsedId.classNum ||
          (studentKey === 'guest' ? 'guest' : '1');
        if (c !== 'guest' && !isClassAllowed(g, c)) continue;

        mergeStudentRecord(bucketByPaper, paperId, studentKey, {
          ...rec,
          paperId,
          studentKey,
          studentGrade: g,
          studentClass: c,
          studentSeat: rec.studentSeat || meta.seat || parsedId.seat || '00',
          displayName:
            rec.displayName ||
            meta.displayName ||
            (studentKey === 'guest' ? '訪客學生' : `學生 ${studentKey}`),
          source: 'local',
        });
      }
    }
  } catch {}

  // 2. 透過伺服器授權 RPC 從 `priori_records` 隔離資料表讀取授權班級跨裝置紀錄
  if (typeof window === 'undefined' || !window.__CI__) {
    if (teacherToken) {
      try {
        const { data, error } = await supabase.rpc('priori_teacher_list_records', {
          p_token: teacherToken,
          p_paper_id: filterPaperId || null,
          p_grade: options.grade || null,
          p_class_num: options.classNum || null,
        });

        if (error) {
          if (isPrioriSchemaPendingError(error)) {
            schemaPending = true;
            cloudError =
              '尚未於 Supabase 執行 supabase_priori_security.sql 權限隔離腳本，目前僅顯示本機與示範班資料。';
          } else if (isPrioriUnauthorizedError(error)) {
            unauthorized = true;
            cloudError = '教師伺服器憑證已失效或過期，請重新登入。';
          } else {
            cloudError = error.message || '雲端紀錄讀取失敗';
          }
        } else if (Array.isArray(data)) {
          for (const row of data) {
            const cloudRec = hydrateCloudPayload(row);
            if (!cloudRec || (filterPaperId && cloudRec.paperId !== filterPaperId)) continue;
            mergeStudentRecord(bucketByPaper, cloudRec.paperId, cloudRec.studentKey, cloudRec);
          }
        }
      } catch (err) {
        cloudError = err?.message || '雲端連線異常';
      }
    } else if (teacherSession?.schemaPendingOnly) {
      schemaPending = true;
      cloudError =
        '尚未於 Supabase 執行 supabase_priori_security.sql 權限隔離腳本，目前僅顯示本機與示範班資料。';
    }
  }

  const recordsByPaperId = {};
  for (const [pid, byStudent] of bucketByPaper.entries()) {
    recordsByPaperId[pid] = sortTeacherRecords(byStudent.values());
  }
  return { recordsByPaperId, cloudError, unauthorized, schemaPending };
}

/**
 * 讀取教師後台所需的單卷班級／各生學習扶助紀錄（融合雲端 + 本機各生紀錄，並回傳雲端錯誤狀態）
 */
export async function fetchPrioriTeacherRecordsWithMeta(paperId = '114-math-g3') {
  const { recordsByPaperId, cloudError } = await fetchAllPrioriTeacherRecordsWithMeta(paperId);
  return { records: recordsByPaperId[paperId] || [], cloudError };
}

/**
 * 讀取教師後台所需的班級／各生學習扶助紀錄（向後相容只回傳陣列）
 */
export async function fetchPrioriTeacherRecords(paperId = '114-math-g3') {
  const { records } = await fetchPrioriTeacherRecordsWithMeta(paperId);
  return records;
}

// ── 教學展示用：三年級示範班級模擬學生資料（含 114/115 數國英與計算紙筆跡，可在教師後台開關） ──
function makeStroke(pts, colorId = 'teal') {
  return { tool: 'pen', colorId, points: pts.map(([nx, ny]) => ({ nx, ny })) };
}

function buildDemoAnswersAndStreaks(paperId, pattern) {
  const paper = PRIORI_PAPER_MAP[paperId];
  const latestAnswers = {};
  const streaks = {};
  if (!paper) return { latestAnswers, streaks, correctCount: 0, masteredCount: 0 };
  let correctCount = 0;
  let masteredCount = 0;

  paper.questions.forEach((q, idx) => {
    const mode = pattern[idx] ?? 2; // 2=精熟, 1=連對1次, 0=答錯
    if (mode === 0) {
      if (q.questionType === 'alphabet-pair') {
        const lowerConfuse =
          q.expectedLower === 'd'
            ? 'b'
            : q.expectedLower === 'q'
            ? 'p'
            : q.expectedLower === 'n'
            ? 'm'
            : 'b';
        latestAnswers[q.id] = `${q.expectedUpper}, ${lowerConfuse}`;
      } else {
        const len = Math.max(2, q.options?.length || 4);
        latestAnswers[q.id] = (Number(q.answer) + 1) % len;
      }
      streaks[q.id] = 0;
    } else {
      latestAnswers[q.id] = q.answer;
      streaks[q.id] = mode;
      correctCount += 1;
      if (mode >= 2) masteredCount += 1;
    }
  });

  return { latestAnswers, streaks, correctCount, masteredCount };
}

const DEMO_STUDENTS_META = [
  {
    key: 'demo-030101',
    grade: '03',
    classNum: '1',
    seat: '01',
    name: '巴奈 (示範)',
    firstScoreBase: 84,
    pattern: [2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    attemptsCount: 2,
    padMode: 'accurate',
  },
  {
    key: 'demo-030105',
    grade: '03',
    classNum: '1',
    seat: '05',
    name: '達悟 (示範)',
    firstScoreBase: 56,
    pattern: [2, 2, 0, 1, 2, 1, 2, 2, 0, 1, 2, 0, 0, 2, 1, 2, 2, 1, 0, 2, 1, 2, 0, 2, 0],
    attemptsCount: 2,
    padMode: 'misconception',
  },
  {
    key: 'demo-030203',
    grade: '03',
    classNum: '2',
    seat: '03',
    name: '莉雅 (示範)',
    firstScoreBase: 44,
    pattern: [1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0],
    attemptsCount: 1,
    padMode: 'partial',
  },
  {
    key: 'demo-030208',
    grade: '03',
    classNum: '2',
    seat: '08',
    name: '卡爾 (示範)',
    firstScoreBase: 76,
    pattern: [2, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 1, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 1],
    attemptsCount: 2,
    padMode: 'accurate',
  },
];

function buildDemoScratchpadForPaper(paperId, padMode) {
  const paper = PRIORI_PAPER_MAP[paperId];
  // 僅數學科需使用計算紙；國語、英語不附帶計算紙筆跡
  if (!paper || paper.subject !== 'math') return {};
  const q1 = paper.questions[0]?.id;
  const q2 = paper.questions[1]?.id;
  const q3 = paper.questions[2]?.id;
  const pad = {};

  if (padMode === 'accurate' && q1 && q2) {
    pad[q1] = [
      makeStroke([[0.32, 0.2], [0.42, 0.2], [0.42, 0.28], [0.32, 0.34], [0.42, 0.34]]),
      makeStroke([[0.48, 0.2], [0.54, 0.2], [0.54, 0.34], [0.48, 0.34], [0.48, 0.2]]),
      makeStroke([[0.22, 0.44], [0.3, 0.44]]),
      makeStroke([[0.26, 0.39], [0.26, 0.49]]),
      makeStroke([[0.2, 0.56], [0.76, 0.56]], 'indigo'),
      makeStroke([[0.34, 0.64], [0.34, 0.78]]),
      makeStroke([[0.7, 0.64], [0.7, 0.78]]),
    ];
    pad[q2] = [
      makeStroke([[0.35, 0.22], [0.35, 0.36]]),
      makeStroke([[0.44, 0.22], [0.54, 0.22], [0.46, 0.36]]),
      makeStroke([[0.2, 0.56], [0.72, 0.56]], 'indigo'),
    ];
  } else if (padMode === 'misconception' && q1 && q3) {
    pad[q1] = [
      makeStroke([[0.3, 0.22], [0.7, 0.22]]),
      makeStroke([[0.3, 0.38], [0.7, 0.38]]),
      makeStroke([[0.22, 0.52], [0.75, 0.52]], 'indigo'),
      makeStroke([[0.38, 0.62], [0.38, 0.76]], 'rose'),
    ];
    pad[q3] = [
      makeStroke(
        [[0.24, 0.28], [0.68, 0.28], [0.68, 0.46], [0.24, 0.46], [0.24, 0.28]],
        'rose'
      ),
      makeStroke([[0.25, 0.62], [0.72, 0.62]], 'rose'),
    ];
  } else if (padMode === 'partial' && q2) {
    pad[q2] = [
      makeStroke([[0.28, 0.3], [0.66, 0.3]], 'rose'),
      makeStroke([[0.28, 0.48], [0.66, 0.48]], 'rose'),
      makeStroke([[0.45, 0.24], [0.58, 0.7]], 'rose'),
    ];
  }
  return pad;
}

export const PRIORI_DEMO_CLASS_RECORDS = ['114-math-g3', '114-chinese-g3', '114-english-g3', '115-math-g3'].flatMap(
  (paperId) =>
    DEMO_STUDENTS_META.map((stu) => {
      const paper = PRIORI_PAPER_MAP[paperId];
      const built = buildDemoAnswersAndStreaks(paperId, stu.pattern);
      // 依 firstScoreBase 模擬初測較多錯題、之後自主精熟補練修正之成長對照
      const targetFirstCorrect = Math.max(
        1,
        Math.round(((stu.firstScoreBase || 60) / 100) * (paper?.questions?.length || 25))
      );
      const firstPattern = [];
      let remCorrect = targetFirstCorrect;
      for (let i = 0; i < (paper?.questions?.length || 25); i += 1) {
        if (stu.pattern[i] > 0 && remCorrect > 0) {
          firstPattern.push(1);
          remCorrect -= 1;
        } else {
          firstPattern.push(0);
        }
      }
      const firstBuilt = buildDemoAnswersAndStreaks(paperId, firstPattern);
      const questionAttemptCounts = {};
      (paper?.questions || []).forEach((q, idx) => {
        questionAttemptCounts[q.id] = stu.pattern[idx] === 2 ? Math.max(2, stu.attemptsCount) : 1;
      });
      const totalCount = paper?.questions?.length || 25;
      const latestScore = Math.round((built.correctCount / totalCount) * 100);
      return {
        paperId,
        studentKey: stu.key,
        studentGrade: stu.grade,
        studentClass: stu.classNum,
        studentSeat: stu.seat,
        displayName: stu.name,
        firstScore: Math.round((firstBuilt.correctCount / totalCount) * 100),
        firstCorrectCount: firstBuilt.correctCount,
        firstAnswers: firstBuilt.latestAnswers,
        latestScore,
        score: latestScore,
        correctCount: built.correctCount,
        totalCount,
        masteredCount: built.masteredCount,
        attemptsCount: stu.attemptsCount,
        drillAttemptsCount: Math.max(0, stu.attemptsCount - 1),
        questionAttemptCounts,
        latestAnswers: built.latestAnswers,
        streaks: built.streaks,
        scratchpad: buildDemoScratchpadForPaper(paperId, stu.padMode),
        updatedAt: '2026-11-14T09:15:00Z',
        isDemo: true,
      };
    })
);

// ── 霧臺國小各年級各班編班人數骨架（不含姓名個資，僅供教師後台自動展開 1～末號座號） ──
export const SCHOOL_CLASS_HEADCOUNTS = {
  '1': { '1': 5, '2': 11 },
  '2': { '1': 6, '2': 4 },
  '3': { '1': 6, '2': 9 },
  '4': { '1': 8, '2': 11 },
  '5': { '1': 6, '2': 19 },
  '6': { '1': 6, '2': 12 },
};

export function getClassHeadcount(grade, classNum) {
  const g = String(parseInt(String(grade || ''), 10) || '');
  const c = String(parseInt(String(classNum || ''), 10) || '');
  return Number(SCHOOL_CLASS_HEADCOUNTS?.[g]?.[c]) || 0;
}

const LOCAL_SEAT_NAMES_KEY = 'wutai_priori_teacher_local_names_v1';

export function loadLocalSeatNames() {
  try {
    const raw = localStorage.getItem(LOCAL_SEAT_NAMES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveLocalSeatNames(nextMap) {
  try {
    localStorage.setItem(LOCAL_SEAT_NAMES_KEY, JSON.stringify(nextMap || {}));
  } catch {}
}
