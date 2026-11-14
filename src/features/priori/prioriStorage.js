import { supabase } from '../../services/supabase';
import { parseStudentId, formatStudentDisplayName } from '../../utils/studentIdHelper';
import { PRIORI_PAPERS, PRIORI_PAPER_MAP } from '../../data/priori';

const STORAGE_PREFIX = 'wutai_priori_v1_';
const STUDENT_META_INDEX_KEY = 'wutai_priori_student_meta_v1';
export const PRIORI_CLOUD_MODE = 'priori-record';
export const PRIORI_CLOUD_WEEK = 0;

export function getPrioriStorageKey(studentId) {
  return `${STORAGE_PREFIX}${studentId || 'guest'}`;
}

export function loadPrioriRecords(studentId) {
  try {
    const raw = localStorage.getItem(getPrioriStorageKey(studentId));
    return raw ? JSON.parse(raw) : {};
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

function buildStudentIdentity(student, displayName) {
  const sid = student?.student_id ? String(student.student_id) : 'guest';
  if (sid === 'guest') {
    return {
      studentKey: 'guest',
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
    grade,
    classNum,
    seat,
    displayName: resolvedName,
  };
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
  const prevStreaks = prev.streaks || {};
  const prevScratchpad = prev.scratchpad || {};

  const nextLatestAnswers = { ...prevLatestAnswers };
  const nextStreaks = { ...prevStreaks };
  const nextScratchpad = { ...prevScratchpad };
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

    const prevStreak = Number(prevStreaks[q.id]) || 0;
    const isCorrect = isPrioriAnswerCorrect(q, rawAns);

    if (isCorrect) {
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

  const firstScore =
    typeof prev.firstScore === 'number'
      ? prev.firstScore
      : !isMistakeRetry
      ? sessionScore
      : latestScore;

  const updatedAt = new Date().toISOString();
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
    score: latestScore,
    latestScore,
    firstScore,
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
    scratchpad: nextScratchpad,
    attemptsCount: (prev.attemptsCount || 0) + 1,
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
  } catch {}

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

async function syncPrioriRecordToCloud(identity, record) {
  try {
    const cloudDeviceId = `priori_${identity.studentKey}_${record.paperId}`;
    const compactPayload = {
      v: 1,
      paperId: record.paperId,
      studentKey: identity.studentKey,
      grade: identity.grade,
      classNum: identity.classNum,
      seat: identity.seat,
      displayName: identity.displayName,
      firstScore: record.firstScore,
      latestScore: record.latestScore,
      correctCount: record.correctCount,
      totalCount: record.totalCount,
      masteredCount: record.masteredCount,
      attemptsCount: record.attemptsCount,
      streaks: record.streaks,
      latestAnswers: record.latestAnswers,
      scratchpad: record.scratchpad,
      updatedAt: record.updatedAt,
    };

    let serialized = JSON.stringify(compactPayload);
    // 防禦過大筆跡 payload：若超過 40KB 則每筆畫再降採樣
    if (serialized.length > 40000) {
      const trimmedPad = {};
      for (const [qId, strokes] of Object.entries(record.scratchpad || {})) {
        trimmedPad[qId] = compressStrokes(strokes, 12, 28);
      }
      serialized = JSON.stringify({ ...compactPayload, scratchpad: trimmedPad });
    }

    const { data: existing, error: selectError } = await supabase
      .from('leaderboard')
      .select('id')
      .eq('device_id', cloudDeviceId)
      .eq('mode', PRIORI_CLOUD_MODE)
      .eq('week', PRIORI_CLOUD_WEEK)
      .maybeSingle();

    if (selectError) {
      console.warn('學習扶助紀錄雲端查詢失敗（已保存本機）:', selectError.message);
      return { ok: false, error: selectError.message };
    }

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from('leaderboard')
        .update({
          name: identity.displayName,
          book: serialized,
          score: record.latestScore,
          time: record.masteredCount,
          created_at: record.updatedAt,
        })
        .eq('id', existing.id);
      if (updateError) {
        console.warn('學習扶助紀錄雲端更新失敗（已保存本機）:', updateError.message);
        return { ok: false, error: updateError.message };
      }
    } else {
      const { error: insertError } = await supabase.from('leaderboard').insert([
        {
          device_id: cloudDeviceId,
          name: identity.displayName,
          mode: PRIORI_CLOUD_MODE,
          book: serialized,
          score: record.latestScore,
          time: record.masteredCount,
          week: PRIORI_CLOUD_WEEK,
        },
      ]);
      if (insertError) {
        console.warn('學習扶助紀錄雲端寫入失敗（已保存本機）:', insertError.message);
        return { ok: false, error: insertError.message };
      }
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
  const nextTime = new Date(nextRec.updatedAt || 0).getTime();
  const prevTime = existing ? new Date(existing.updatedAt || 0).getTime() : -1;
  if (!existing || nextTime >= prevTime) {
    byStudent.set(sk, nextRec);
  }
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
 * 一次讀取全試卷的教師診斷紀錄（供班級成績矩陣跨科／跨年總覽與單卷分析共用）
 */
export async function fetchAllPrioriTeacherRecordsWithMeta(filterPaperId = null) {
  const bucketByPaper = new Map();
  const metaIndex = loadStudentMetaIndex();
  let cloudError = '';

  // 1. 收集所有本機端紀錄
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
        mergeStudentRecord(bucketByPaper, paperId, studentKey, {
          ...rec,
          paperId,
          studentKey,
          studentGrade: rec.studentGrade || meta.grade || parsedId.grade || '03',
          studentClass:
            rec.studentClass ||
            meta.classNum ||
            parsedId.classNum ||
            (studentKey === 'guest' ? 'guest' : '1'),
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

  // 2. 從 Supabase 讀取跨裝置紀錄（mode='priori-record', week=0）
  if (typeof window === 'undefined' || !window.__CI__) {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('id, device_id, name, book, score, time, created_at')
        .eq('mode', PRIORI_CLOUD_MODE)
        .eq('week', PRIORI_CLOUD_WEEK)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        cloudError = error.message || '雲端紀錄讀取失敗';
      } else if (Array.isArray(data)) {
        for (const row of data) {
          if (!row?.book) continue;
          try {
            const payload = JSON.parse(row.book);
            const pid = payload?.paperId;
            if (!pid || (filterPaperId && pid !== filterPaperId)) continue;
            const sk = payload.studentKey || 'guest';
            mergeStudentRecord(bucketByPaper, pid, sk, {
              paperId: pid,
              studentKey: sk,
              studentGrade: payload.grade || '03',
              studentClass: payload.classNum || '1',
              studentSeat: payload.seat || '01',
              displayName: payload.displayName || row.name || sk,
              firstScore: payload.firstScore ?? row.score ?? 0,
              latestScore: payload.latestScore ?? row.score ?? 0,
              score: payload.latestScore ?? row.score ?? 0,
              correctCount: payload.correctCount ?? 0,
              totalCount:
                payload.totalCount ?? (PRIORI_PAPER_MAP[pid]?.totalQuestions || 25),
              masteredCount: payload.masteredCount ?? row.time ?? 0,
              attemptsCount: payload.attemptsCount ?? 1,
              streaks: payload.streaks || {},
              latestAnswers: payload.latestAnswers || {},
              scratchpad: payload.scratchpad || {},
              updatedAt: payload.updatedAt || row.created_at,
              source: 'cloud',
            });
          } catch {}
        }
      }
    } catch (err) {
      cloudError = err?.message || '雲端連線異常';
    }
  }

  const recordsByPaperId = {};
  for (const [pid, byStudent] of bucketByPaper.entries()) {
    recordsByPaperId[pid] = sortTeacherRecords(byStudent.values());
  }
  return { recordsByPaperId, cloudError };
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
  if (!paper) return {};
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
      const built = buildDemoAnswersAndStreaks(paperId, stu.pattern);
      const totalCount = PRIORI_PAPER_MAP[paperId]?.questions?.length || 25;
      const latestScore = Math.round((built.correctCount / totalCount) * 100);
      return {
        paperId,
        studentKey: stu.key,
        studentGrade: stu.grade,
        studentClass: stu.classNum,
        studentSeat: stu.seat,
        displayName: stu.name,
        firstScore: stu.firstScoreBase,
        latestScore,
        score: latestScore,
        correctCount: built.correctCount,
        totalCount,
        masteredCount: built.masteredCount,
        attemptsCount: stu.attemptsCount,
        latestAnswers: built.latestAnswers,
        streaks: built.streaks,
        scratchpad: buildDemoScratchpadForPaper(paperId, stu.padMode),
        updatedAt: '2026-11-14T09:15:00Z',
        isDemo: true,
      };
    })
);
