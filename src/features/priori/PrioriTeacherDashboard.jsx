import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Lock,
  Unlock,
  RefreshCw,
  BarChart3,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Pencil,
  Award,
  AlertTriangle,
  Layers,
  X,
  Printer,
  Table2,
  KeyRound,
} from 'lucide-react';
import { PRIORI_SUBJECTS, PRIORI_PAPERS, PRIORI_PAPER_MAP } from '../../data/priori';
import { MathRichText } from './MathRichText';
import { PrioriScratchpadPreview } from './PrioriScratchpad';
import { LilyEmblem, PrioriPrintableSheet, PrioriTeacherPrintModal } from './PrioriModals';
import { PrioriRosterModal } from './PrioriRosterModal';
import {
  fetchAllPrioriTeacherRecordsWithMeta,
  PRIORI_DEMO_CLASS_RECORDS,
  isPrioriAnswerCorrect,
  formatPrioriAnswerLabel,
  getClassHeadcount,
  loadLocalSeatNames,
  saveLocalSeatNames,
} from './prioriStorage';
import {
  getPrioriTeacherSession,
  clearPrioriTeacherSession,
  loginPrioriTeacherServer,
  logoutPrioriTeacherServer,
  loadEncryptedRosterEnvelope,
} from './prioriSecurity';

const ALL_YEARS_DESC = ['115', '114', '113', '112', '111', '110', '109', '108'];
const GRADE_TABS = ['1', '2', '3', '4', '5', '6'];
const PAPER_GRADE_OPTIONS = ['3', '4', '5', '6'];

function normNumStr(val, fallback = '') {
  const s = String(val ?? '').trim();
  if (!s || s === 'guest') return s || fallback;
  const digits = s.replace(/\D/g, '');
  if (!digits) return s;
  return String(parseInt(digits, 10));
}

function getStreakBadge(streak) {
  const n = Number(streak) || 0;
  if (n >= 2) {
    return {
      key: 'mastered',
      label: `🌟 已精熟 (連對 ${n} 次)`,
      shortLabel: '🌟 已精熟',
      cls: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
    };
  }
  if (n === 1) {
    return {
      key: 'progress',
      label: '🌱 連對 1 次 (再對 1 次即精熟)',
      shortLabel: '🌱 連對 1 次',
      cls: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
    };
  }
  return {
    key: 'remedial',
    label: '⚠️ 待補強 (連對歸零)',
    shortLabel: '⚠️ 待補強',
    cls: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700',
  };
}

function formatClassLabel(classNum) {
  if (classNum === 'guest') return '訪客練習';
  const n = normNumStr(classNum, '1');
  const map = { '1': '甲班（霧臺 1 班）', '2': '乙班（勵古 2 班）', '3': '丙班（3 班）' };
  return map[n] || `${n} 班`;
}

function formatShortClassName(classNum) {
  if (classNum === 'guest') return '訪客';
  const map = { '1': '甲班', '2': '乙班', '3': '丙班' };
  return map[normNumStr(classNum, '1')] || `${classNum}班`;
}

function formatGradeClassTitle(grade, classNum) {
  if (grade === 'demo' || classNum === 'demo') return '🧪 示範班級（假資料）';
  if (classNum === 'all') return `${grade} 年級全部班級`;
  if (classNum === 'guest') return '訪客練習';
  return `${grade} 年${formatShortClassName(classNum)}`;
}

function getRecordFirstAnswersMap(rec) {
  if (!rec) return {};
  if (rec.firstAnswers && Object.keys(rec.firstAnswers).length > 0) {
    return rec.firstAnswers;
  }
  return rec.latestAnswers || {};
}

function getQuestionAttemptCount(rec, questionId) {
  if (!rec) return 0;
  const fromMap = Number(rec.questionAttemptCounts?.[questionId]);
  if (Number.isFinite(fromMap) && fromMap > 0) return fromMap;
  const hasLatest =
    rec.latestAnswers &&
    rec.latestAnswers[questionId] !== undefined &&
    rec.latestAnswers[questionId] !== null &&
    rec.latestAnswers[questionId] !== '';
  return hasLatest ? 1 : 0;
}

function getDrillAttemptsCount(rec) {
  if (!rec) return 0;
  if (Number.isFinite(Number(rec.drillAttemptsCount))) {
    return Math.max(0, Number(rec.drillAttemptsCount));
  }
  return Math.max(0, (Number(rec.attemptsCount) || 1) - 1);
}

function extractSeatAndNickname(rec) {
  const seat = normNumStr(rec.studentSeat, '99').padStart(2, '0');
  const rawName = String(rec.displayName || '');
  const parenMatch = rawName.match(/\(([^)]+)\)/);
  const nickname = parenMatch ? parenMatch[1] : rawName;
  return { seat, nickname };
}

/**
 * 將題幹濃縮為單題矩陣左側簡明摘要（移除 LaTeX 定界符與多餘空白，保留核心題意）
 */
function summarizeQuestionText(q, maxLen = 24) {
  const raw = String(q?.questionText || q?.conceptTitle || '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    .replace(/\$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!raw) return q?.conceptTitle || `第 ${q?.number || ''} 題`;
  return raw.length > maxLen ? `${raw.slice(0, maxLen)}…` : raw;
}

export function PrioriTeacherDashboard({ onBack }) {
  const [teacherSession, setTeacherSession] = useState(() => getPrioriTeacherSession());
  const isAuthed = Boolean(teacherSession);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 主分頁：班級成績矩陣（預設） vs 各題診斷分析
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'questions'

  // 第一順位選班級（年級 × 班別）
  const [selectedGrade, setSelectedGrade] = useState('3');
  const [selectedClass, setSelectedClass] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');

  // 矩陣維度切換：依年度看三科（國/數/英） vs 依科目看歷年（115–108）；試卷年級支援跨年級補救練習檢視
  const [matrixMode, setMatrixMode] = useState('by-year'); // 'by-year' | 'by-subject'
  const [selectedYear, setSelectedYear] = useState('114');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedPaperGrade, setSelectedPaperGrade] = useState('3');
  const [onlyBuiltYears, setOnlyBuiltYears] = useState(false);

  // 本機可輸入座號姓名對照表（不上傳雲端／Git，僅留本機瀏覽器）
  const [localSeatNames, setLocalSeatNames] = useState(() => loadLocalSeatNames());

  // 教師指定列印彈窗與目標試卷設定
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTargetPaperId, setPrintTargetPaperId] = useState('');
  const [printShowAnswerKey, setPrintShowAnswerKey] = useState(true);

  // 全卷資料與加密名冊狀態（示範班級已內建於年級／班級下拉選單，空班預設保持乾淨）
  const [realRecordsByPaper, setRealRecordsByPaper] = useState({});
  const [cloudError, setCloudError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scoreViewMode, setScoreViewMode] = useState('initial'); // 'initial' (預設初測) | 'mastery' (精熟後)
  const isDemoView = selectedGrade === 'demo' || selectedClass === 'demo';

  // 加密名冊狀態（明文只留在記憶體）
  const [rosterEnvelope, setRosterEnvelope] = useState(null);
  const [rosterEntries, setRosterEntries] = useState([]);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

  // 展開單題或單生單卷明細
  const [inspectedQuestionId, setInspectedQuestionId] = useState(null);
  const [inspectedCell, setInspectedCell] = useState(null); // { studentLabel, nickname, seat, studentClass, paperId, record }
  const [studentQuestionFilter, setStudentQuestionFilter] = useState('all');

  const activePaper = useMemo(() => {
    return (
      PRIORI_PAPERS.find(
        (p) =>
          String(p.year) === String(selectedYear) &&
          p.subject === selectedSubject &&
          String(p.grade) === String(selectedPaperGrade)
      ) || null
    );
  }, [selectedYear, selectedSubject, selectedPaperGrade]);

  const handleLocalSeatNameChange = useCallback(
    (rowKey, value) => {
      const next = { ...localSeatNames };
      if (value !== '') {
        next[rowKey] = value;
      } else {
        delete next[rowKey];
      }
      saveLocalSeatNames(next);
      setLocalSeatNames(next);
    },
    [localSeatNames]
  );

  const loadAllData = useCallback(async () => {
    if (!teacherSession) return;
    setIsLoading(true);
    try {
      const [recRes, rosRes] = await Promise.all([
        fetchAllPrioriTeacherRecordsWithMeta(null, {
          teacherToken: teacherSession.token,
          allowedClasses: teacherSession.allowedClasses,
        }),
        loadEncryptedRosterEnvelope(teacherSession.token),
      ]);

      if (recRes.unauthorized || rosRes.unauthorized) {
        clearPrioriTeacherSession();
        setTeacherSession(null);
        setAuthError('教師伺服器憑證已失效或過期，請重新驗證登入。');
        return;
      }

      setRealRecordsByPaper(recRes.recordsByPaperId || {});
      setCloudError(recRes.cloudError || rosRes.cloudError || '');
      if (rosRes.envelope) setRosterEnvelope(rosRes.envelope);
    } finally {
      setIsLoading(false);
    }
  }, [teacherSession]);

  useEffect(() => {
    if (isAuthed) {
      loadAllData();
    }
  }, [isAuthed, loadAllData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError('');
    try {
      const res = await loginPrioriTeacherServer(password);
      if (res.ok && res.session) {
        setTeacherSession(res.session);
        setAuthError('');
        setPassword('');
        const allowed = res.session.allowedClasses || ['*'];
        if (!allowed.includes('*') && allowed.length > 0) {
          const [g, c] = String(allowed[0]).split('-');
          if (g && c) {
            setSelectedGrade(g);
            setSelectedClass(c);
          }
        }
      } else {
        setAuthError(res.error || '教師密碼錯誤，請再試一次。');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const token = teacherSession?.token || '';
    await logoutPrioriTeacherServer(token);
    setTeacherSession(null);
    setPassword('');
    setRosterEntries([]);
    setInspectedCell(null);
  };

  // 依目前選取切換「真實班級紀錄」或「內建示範班級（假資料）」
  const combinedByPaper = useMemo(() => {
    const out = {};
    const allPaperIds = new Set([
      ...PRIORI_PAPERS.map((p) => p.paperId),
      ...Object.keys(realRecordsByPaper),
    ]);
    for (const pid of allPaperIds) {
      out[pid] = isDemoView
        ? PRIORI_DEMO_CLASS_RECORDS.filter((d) => d.paperId === pid)
        : realRecordsByPaper[pid] || [];
    }
    return out;
  }, [realRecordsByPaper, isDemoView]);

  // 解密名冊索引（key: `${grade}-${classNum}-${seat}`）
  const rosterLookup = useMemo(() => {
    const map = new Map();
    for (const entry of rosterEntries) {
      const g = normNumStr(entry.grade);
      const c = normNumStr(entry.classNum, '1');
      const s = normNumStr(entry.seat).padStart(2, '0');
      map.set(`${g}-${c}-${s}`, entry);
    }
    return map;
  }, [rosterEntries]);

  const effectiveGradeForOptions = selectedGrade === 'demo' ? '3' : selectedGrade;

  // 動態收集所有出現過的班別（預設含學校實際甲乙班）
  const availableClasses = useMemo(() => {
    const set = new Set(['1', '2']);
    if (!isDemoView) {
      for (const entry of rosterEntries) {
        if (normNumStr(entry.grade) === String(effectiveGradeForOptions)) {
          set.add(normNumStr(entry.classNum, '1'));
        }
      }
      for (const list of Object.values(realRecordsByPaper)) {
        for (const rec of list) {
          if (
            normNumStr(rec.studentGrade, '3') === String(effectiveGradeForOptions) &&
            rec.studentClass
          ) {
            set.add(
              rec.studentClass === 'guest' ? 'guest' : normNumStr(rec.studentClass, '1')
            );
          }
        }
      }
    }
    return Array.from(set).sort((a, b) => {
      if (a === 'guest') return 1;
      if (b === 'guest') return -1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [effectiveGradeForOptions, isDemoView, realRecordsByPaper, rosterEntries]);

  // ── 建置「全班座號升冪基準名單」（示範班級只列內建示範生；真實班級依各班人數與加密名冊展開） ──
  const classRosterRows = useMemo(() => {
    const rowMap = new Map();

    const ensureRow = (gradeVal, classVal, seatVal, skHint, nickHint, nameOverride = '') => {
      const g = normNumStr(gradeVal, String(effectiveGradeForOptions));
      const c = classVal === 'guest' ? 'guest' : normNumStr(classVal, '1');
      const seatNum = parseInt(normNumStr(seatVal, '99'), 10) || 99;
      const seatStr = String(seatNum).padStart(2, '0');
      const rowKey = c === 'guest' ? `guest:${skHint}` : `${g}-${c}-${seatStr}`;

      if (!rowMap.has(rowKey)) {
        const rosterMatch = isDemoView ? null : rosterLookup.get(`${g}-${c}-${seatStr}`);
        rowMap.set(rowKey, {
          rowKey,
          grade: g,
          classNum: c,
          seatNum,
          seatPad: seatStr,
          seatStr: c === 'guest' ? '訪客' : `${seatStr} 號`,
          rosterName: nameOverride || rosterMatch?.name || '',
          localName: isDemoView ? '' : localSeatNames[rowKey] || '',
          nickname: nickHint || '',
          studentKey: skHint || '',
          recordsByPaper: {},
        });
      } else {
        const existing = rowMap.get(rowKey);
        if (nameOverride && !existing.rosterName) existing.rosterName = nameOverride;
        if (nickHint && !existing.nickname) existing.nickname = nickHint;
        if (skHint && !existing.studentKey) existing.studentKey = skHint;
      }
      return rowMap.get(rowKey);
    };

    if (!isDemoView) {
      // 0. 依全校公開各班人數先展開 1..N 座號骨架（無任何學生姓名的公開人數基準）
      const targetClasses =
        selectedClass === 'all'
          ? availableClasses.filter((c) => c !== 'guest')
          : selectedClass !== 'guest'
          ? [selectedClass]
          : [];
      for (const c of targetClasses) {
        const headcount = getClassHeadcount(selectedGrade, c);
        for (let seatNo = 1; seatNo <= headcount; seatNo += 1) {
          ensureRow(selectedGrade, c, seatNo, '', '');
        }
      }

      // 1. 納入解密名冊中屬於該年級／班級的每位學生
      for (const entry of rosterEntries) {
        const g = normNumStr(entry.grade);
        const c = normNumStr(entry.classNum, '1');
        if (g !== String(selectedGrade)) continue;
        if (selectedClass !== 'all' && c !== String(selectedClass)) continue;
        ensureRow(g, c, entry.seat, entry.studentKey, '', entry.name);
      }
    }

    // 2. 合併各試卷學生作答紀錄
    for (const [paperId, list] of Object.entries(combinedByPaper)) {
      for (const rec of list) {
        const g = normNumStr(rec.studentGrade, '3');
        const c = rec.studentClass === 'guest' ? 'guest' : normNumStr(rec.studentClass, '1');
        if (!isDemoView) {
          if (g !== String(selectedGrade)) continue;
          if (selectedClass !== 'all' && c !== String(selectedClass)) continue;
        }

        const { seat, nickname } = extractSeatAndNickname(rec);
        const row = ensureRow(
          g,
          c,
          seat,
          rec.studentKey,
          rec.isDemo ? '' : nickname,
          rec.isDemo ? rec.displayName || '' : ''
        );
        row.recordsByPaper[paperId] = rec;
      }
    }

    return Array.from(rowMap.values()).sort((a, b) => {
      if (a.classNum === 'guest' && b.classNum !== 'guest') return 1;
      if (b.classNum === 'guest' && a.classNum !== 'guest') return -1;
      if (a.classNum !== b.classNum) {
        return String(a.classNum).localeCompare(String(b.classNum), undefined, { numeric: true });
      }
      return a.seatNum - b.seatNum;
    });
  }, [
    availableClasses,
    combinedByPaper,
    effectiveGradeForOptions,
    isDemoView,
    localSeatNames,
    rosterEntries,
    rosterLookup,
    selectedClass,
    selectedGrade,
  ]);

  // 依班級檢視用的搜尋後名單
  const matrixRows = useMemo(() => {
    if (!searchQuery.trim()) return classRosterRows;
    const q = searchQuery.trim().toLowerCase();
    return classRosterRows.filter((r) => {
      const hay = `${r.seatStr} ${r.rosterName} ${r.localName} ${r.nickname} ${r.studentKey}`.toLowerCase();
      return hay.includes(q);
    });
  }, [classRosterRows, searchQuery]);

  // 矩陣欄位定義（依年度看三科 vs 依科目看歷年 115~108，採用選定的試卷年級）
  const matrixColumns = useMemo(() => {
    if (matrixMode === 'by-year') {
      return [
        { key: 'chinese', label: '國語', subjectId: 'chinese', year: selectedYear },
        { key: 'math', label: '數學', subjectId: 'math', year: selectedYear },
        { key: 'english', label: '英語', subjectId: 'english', year: selectedYear },
      ].map((col) => {
        const paper = PRIORI_PAPERS.find(
          (p) =>
            p.subject === col.subjectId &&
            String(p.year) === String(col.year) &&
            String(p.grade) === String(selectedPaperGrade)
        );
        return { ...col, paper: paper || null };
      });
    }

    const yearsList = onlyBuiltYears
      ? ALL_YEARS_DESC.filter((y) =>
          PRIORI_PAPERS.some(
            (p) =>
              p.subject === selectedSubject &&
              String(p.year) === y &&
              String(p.grade) === String(selectedPaperGrade)
          )
        )
      : ALL_YEARS_DESC;

    return yearsList.map((y) => {
      const paper = PRIORI_PAPERS.find(
        (p) =>
          p.subject === selectedSubject &&
          String(p.year) === y &&
          String(p.grade) === String(selectedPaperGrade)
      );
      return {
        key: `${selectedSubject}-${y}`,
        label: `${y} 年`,
        subjectId: selectedSubject,
        year: y,
        paper: paper || null,
      };
    });
  }, [matrixMode, selectedYear, selectedSubject, selectedPaperGrade, onlyBuiltYears]);

  // ── 「依題目分頁」用單卷已作答學生紀錄（不受搜尋題目關鍵字影響統計） ──
  const questionTabRecords = useMemo(() => {
    if (!activePaper) return [];
    const list = combinedByPaper[activePaper.paperId] || [];
    return list
      .filter((r) => {
        if (isDemoView) return true;
        const gNorm = normNumStr(r.studentGrade, '3');
        if (gNorm !== String(selectedGrade)) return false;
        const cNorm = r.studentClass === 'guest' ? 'guest' : normNumStr(r.studentClass, '1');
        if (selectedClass !== 'all' && cNorm !== String(selectedClass)) return false;
        return true;
      })
      .sort((a, b) => {
        if (String(a.studentClass || '') !== String(b.studentClass || '')) {
          return String(a.studentClass || '').localeCompare(String(b.studentClass || ''), undefined, {
            numeric: true,
          });
        }
        return Number(a.studentSeat || 99) - Number(b.studentSeat || 99);
      });
  }, [activePaper, combinedByPaper, isDemoView, selectedClass, selectedGrade]);

  const classAnalytics = useMemo(() => {
    if (!activePaper) {
      return {
        studentCount: 0,
        expectedStudentCount: 0,
        avgFirstScore: 0,
        avgLatestScore: 0,
        avgFirstAccuracyPct: 0,
        avgMasteryPct: 0,
        weakQuestionCount: 0,
        questionStats: [],
      };
    }
    const nStudents = questionTabRecords.length;
    const expectedStudentCount = isDemoView
      ? Math.max(nStudents, classRosterRows.length)
      : Math.max(
          nStudents,
          classRosterRows.filter((r) => r.classNum !== 'guest').length || nStudents
        );
    const totalQ = activePaper.questions.length;
    const avgFirstScore =
      nStudents > 0
        ? Math.round(
            questionTabRecords.reduce((s, r) => s + (Number(r.firstScore ?? r.score) || 0), 0) /
              nStudents
          )
        : 0;
    const avgLatestScore =
      nStudents > 0
        ? Math.round(
            questionTabRecords.reduce((s, r) => s + (Number(r.latestScore ?? r.score) || 0), 0) /
              nStudents
          )
        : 0;

    let totalFirstAnswered = 0;
    let totalFirstCorrect = 0;

    const questionStats = activePaper.questions.map((q) => {
      const optLen = Array.isArray(q.options) ? q.options.length : 0;
      const firstOptionCounts = Array(optLen).fill(0);
      const latestOptionCounts = Array(optLen).fill(0);
      const wrongInputs = [];

      let firstAnsweredCount = 0;
      let firstCorrectCount = 0;
      let latestAnsweredCount = 0;
      let latestCorrectCount = 0;
      let masteredCount = 0;
      let scratchpadCount = 0;
      let drillStudentsCount = 0;

      for (const stu of questionTabRecords) {
        const firstMap = getRecordFirstAnswersMap(stu);
        const firstChosen = firstMap?.[q.id];
        const hasFirst =
          firstChosen !== undefined && firstChosen !== null && firstChosen !== '';
        if (hasFirst) {
          firstAnsweredCount += 1;
          totalFirstAnswered += 1;
          if (typeof firstChosen === 'number' && firstChosen >= 0 && firstChosen < optLen) {
            firstOptionCounts[firstChosen] += 1;
          }
          if (isPrioriAnswerCorrect(q, firstChosen)) {
            firstCorrectCount += 1;
            totalFirstCorrect += 1;
          }
        }

        const latestChosen = stu.latestAnswers?.[q.id];
        const hasLatest =
          latestChosen !== undefined && latestChosen !== null && latestChosen !== '';
        if (hasLatest) {
          latestAnsweredCount += 1;
          if (typeof latestChosen === 'number' && latestChosen >= 0 && latestChosen < optLen) {
            latestOptionCounts[latestChosen] += 1;
          }
          if (isPrioriAnswerCorrect(q, latestChosen)) {
            latestCorrectCount += 1;
          } else if (q.questionType === 'alphabet-pair') {
            wrongInputs.push(formatPrioriAnswerLabel(q, latestChosen, false));
          }
        }

        if ((stu.streaks?.[q.id] || 0) >= 2) masteredCount += 1;
        if (Array.isArray(stu.scratchpad?.[q.id]) && stu.scratchpad[q.id].length > 0) {
          scratchpadCount += 1;
        }
        if (getQuestionAttemptCount(stu, q.id) > 1) {
          drillStudentsCount += 1;
        }
      }

      const firstCorrectRate =
        firstAnsweredCount > 0 ? Math.round((firstCorrectCount / firstAnsweredCount) * 100) : 0;
      const latestCorrectRate =
        latestAnsweredCount > 0
          ? Math.round((latestCorrectCount / latestAnsweredCount) * 100)
          : 0;
      const masteryRate =
        latestAnsweredCount > 0 ? Math.round((masteredCount / latestAnsweredCount) * 100) : 0;

      return {
        question: q,
        firstAnsweredCount,
        firstCorrectCount,
        firstCorrectRate,
        latestAnsweredCount,
        latestCorrectCount,
        latestCorrectRate,
        masteredCount,
        masteryRate,
        scratchpadCount,
        drillStudentsCount,
        firstOptionCounts,
        latestOptionCounts,
        wrongInputs,
        // 向後相容目前檢視欄位的動態統計
        optionCounts: scoreViewMode === 'initial' ? firstOptionCounts : latestOptionCounts,
        correctCount: scoreViewMode === 'initial' ? firstCorrectCount : latestCorrectCount,
        correctRate: scoreViewMode === 'initial' ? firstCorrectRate : masteryRate,
      };
    });

    const avgFirstAccuracyPct =
      totalFirstAnswered > 0 ? Math.round((totalFirstCorrect / totalFirstAnswered) * 100) : 0;
    const avgMasteryPct =
      nStudents > 0 && totalQ > 0
        ? Math.round(
            (questionTabRecords.reduce((s, r) => s + (Number(r.masteredCount) || 0), 0) /
              (nStudents * totalQ)) *
              100
          )
        : 0;

    const weakQuestionCount =
      nStudents > 0
        ? questionStats.filter((st) =>
            scoreViewMode === 'initial'
              ? st.firstAnsweredCount > 0 && st.firstCorrectRate < 60
              : st.latestAnsweredCount > 0 && st.masteryRate < 60
          ).length
        : 0;

    return {
      studentCount: nStudents,
      expectedStudentCount,
      avgFirstScore,
      avgLatestScore,
      avgFirstAccuracyPct,
      avgMasteryPct,
      weakQuestionCount,
      questionStats,
    };
  }, [activePaper, classRosterRows, isDemoView, questionTabRecords, scoreViewMode]);

  const filteredQuestionStats = useMemo(() => {
    const stats = classAnalytics.questionStats || [];
    if (!searchQuery.trim()) return stats;
    const kw = searchQuery.trim().toLowerCase();
    return stats.filter((st) => {
      const q = st.question;
      const hay = `第${q.number}題 ${q.number} ${q.conceptTitle || ''} ${q.questionText || ''}`.toLowerCase();
      return hay.includes(kw);
    });
  }, [classAnalytics.questionStats, searchQuery]);

  const inspectedQuestion = useMemo(() => {
    if (!activePaper || !inspectedQuestionId) return null;
    return activePaper.questions.find((q) => q.id === inspectedQuestionId) || null;
  }, [activePaper, inspectedQuestionId]);

  const inspectedPaper = useMemo(
    () => (inspectedCell?.paperId ? PRIORI_PAPER_MAP[inspectedCell.paperId] : null),
    [inspectedCell]
  );

  const studentDetailQuestions = useMemo(() => {
    if (!inspectedPaper || !inspectedCell?.record) return [];
    const rec = inspectedCell.record;
    return inspectedPaper.questions.filter((q) => {
      const streak = Number(rec.streaks?.[q.id]) || 0;
      const hasPad =
        Array.isArray(rec.scratchpad?.[q.id]) && rec.scratchpad[q.id].length > 0;
      if (studentQuestionFilter === 'remedial') return streak === 0;
      if (studentQuestionFilter === 'progress') return streak === 1;
      if (studentQuestionFilter === 'mastered') return streak >= 2;
      if (studentQuestionFilter === 'scratchpad') return hasPad;
      return true;
    });
  }, [inspectedPaper, inspectedCell, studentQuestionFilter]);

  const getDisplayStudentTitle = useCallback(
    (rec) => {
      const g = normNumStr(rec.studentGrade, '3');
      const c = rec.studentClass === 'guest' ? 'guest' : normNumStr(rec.studentClass, '1');
      const { seat, nickname } = extractSeatAndNickname(rec);
      const key = c === 'guest' ? '' : `${g}-${c}-${seat}`;
      const rosterMatch = key ? rosterLookup.get(key) : null;
      if (rosterMatch) return `${seat} 號 ${rosterMatch.name}`;
      const localName = key ? localSeatNames[key] : '';
      if (localName) return `${seat} 號 ${localName}`;
      return rec.displayName || `${seat} 號 (${nickname})`;
    },
    [rosterLookup, localSeatNames]
  );

  // ── 密碼驗證登入畫面 ──
  if (!isAuthed) {
    return (
      <div className="relative z-10 flex-1 w-full max-w-md mx-auto px-4 py-10 flex flex-col justify-center animate-fadeIn">
        <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-teal-300 dark:border-teal-700 p-6 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回練習館</span>
            </button>
            <LilyEmblem className="w-8 h-8 text-teal-700 dark:text-teal-300" />
          </div>

          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-teal-900 dark:text-teal-100">
              學習扶助・獨立教師診斷後台
            </h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              班級成績矩陣、雙連對精熟追蹤與學生計算紙筆跡檢閱
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label
                htmlFor="priori-teacher-password"
                className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1"
              >
                教師後台密碼
              </label>
              <input
                id="priori-teacher-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError('');
                }}
                placeholder="請輸入教師密碼"
                autoFocus
                className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-teal-600"
              />
            </div>

            {authError && (
              <p className="text-xs font-black text-rose-600 dark:text-rose-400">{authError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-2xl bg-teal-700 hover:bg-teal-600 disabled:opacity-60 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>{isLoggingIn ? '伺服器驗證中…' : '驗證進入教師診斷台'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const printablePaper =
    (printTargetPaperId && PRIORI_PAPER_MAP[printTargetPaperId]) ||
    inspectedPaper ||
    activePaper ||
    PRIORI_PAPERS[0] ||
    null;

  return (
    <>
      <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 animate-fadeIn print:hidden">
        {/* 頂部導覽列 */}
        <header className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-teal-200/80 dark:border-teal-800/70 p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-2 rounded-2xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回練習館</span>
            </button>
            <div>
              <h1 className="text-base sm:text-xl font-black text-teal-900 dark:text-teal-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-700 dark:text-teal-300" />
                <span>學習扶助・教師診斷後台</span>
              </h1>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                座號升冪成績總覽・點進分數即可檢視最新答題與計算紙筆跡
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRosterModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 transition cursor-pointer ${
                rosterEntries.length > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                  : rosterEnvelope
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 animate-pulse'
                  : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {rosterEntries.length > 0
                  ? `名冊已解鎖 (${rosterEntries.length})`
                  : rosterEnvelope
                  ? `解鎖名冊 (${rosterEnvelope.count || 0})`
                  : '匯入加密名冊'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-black flex items-center gap-1 hover:bg-amber-100 transition cursor-pointer"
              title="指定科目・年度・年級並選擇教師解答卷或空白練習卷"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>列印解答卷（含正解）</span>
            </button>

            <button
              type="button"
              onClick={loadAllData}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-black flex items-center gap-1 hover:bg-teal-100 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>重整</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black hover:bg-stone-200 transition cursor-pointer"
            >
              登出
            </button>
          </div>
        </header>

        {cloudError && (
          <div
            role="alert"
            className="rounded-2xl bg-rose-50/95 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 px-4 py-2.5 text-xs font-black text-rose-800 dark:text-rose-200 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>雲端紀錄讀取失敗（目前僅顯示本機紀錄）：{cloudError}</span>
          </div>
        )}

        {/* 第一順位：精簡單行篩選列 (1 年級 2 班級 3 檢視 4 搜尋) + 子膠囊維度 */}
        <section className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/70 dark:border-slate-700 p-3.5 sm:p-4 shadow-sm space-y-2.5">
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-2.5 items-end">
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
                1. 年級
              </label>
              <select
                aria-label="篩選年級"
                value={selectedGrade}
                onChange={(e) => {
                  const nextGrade = e.target.value;
                  setSelectedGrade(nextGrade);
                  if (nextGrade === 'demo') {
                    setSelectedPaperGrade('3');
                  } else {
                    if (selectedClass === 'demo') setSelectedClass('1');
                    setSelectedPaperGrade(
                      PRIORI_PAPERS.some((p) => String(p.grade) === String(nextGrade))
                        ? String(nextGrade)
                        : '3'
                    );
                  }
                  setInspectedCell(null);
                  setInspectedQuestionId(null);
                }}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100"
              >
                {GRADE_TABS.map((g) => (
                  <option key={g} value={g}>
                    {g} 年級
                  </option>
                ))}
                <option value="demo">🧪 示範班級（假資料）</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
                2. 班級
              </label>
              <select
                aria-label="篩選班級"
                value={selectedClass}
                onChange={(e) => {
                  const nextCls = e.target.value;
                  setSelectedClass(nextCls);
                  if (nextCls !== 'demo' && selectedGrade === 'demo') {
                    setSelectedGrade('3');
                    setSelectedPaperGrade('3');
                  }
                  setInspectedCell(null);
                  setInspectedQuestionId(null);
                }}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100"
              >
                <option value="demo">🧪 示範班級（假資料）</option>
                {availableClasses.map((cls) => {
                  const count = cls !== 'guest' ? getClassHeadcount(effectiveGradeForOptions, cls) : 0;
                  return (
                    <option key={cls} value={cls}>
                      {cls === 'guest'
                        ? `${effectiveGradeForOptions}年訪客練習`
                        : `${effectiveGradeForOptions}年${formatShortClassName(cls)}${
                            count > 0 ? ` (${count}人)` : ''
                          }`}
                    </option>
                  );
                })}
                <option value="all">{effectiveGradeForOptions}年級全體</option>
              </select>
            </div>

            <div className="lg:col-span-4">
              <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
                3. 檢視
              </label>
              <div className="inline-flex w-full p-1 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('matrix');
                    setInspectedCell(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                    activeTab === 'matrix'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Table2 className="w-3.5 h-3.5" />
                  <span>依班級</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('questions');
                    setInspectedCell(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                    activeTab === 'questions'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>依題目</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
                4. 搜尋
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  aria-label="搜尋座號姓名或題目"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'questions' ? '搜尋題號／題意關鍵字' : '搜尋座號／姓名'}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* 檢視模式子膠囊 */}
          {activeTab === 'matrix' && !inspectedCell && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-stone-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex p-1 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setMatrixMode('by-year')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                      matrixMode === 'by-year'
                        ? 'bg-slate-800 dark:bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    依年度看國／數／英
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatrixMode('by-subject')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                      matrixMode === 'by-subject'
                        ? 'bg-slate-800 dark:bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    依科目看歷年（115–108）
                  </button>
                </div>

                {matrixMode === 'by-year' ? (
                  <select
                    aria-label="矩陣篩選年度"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-xs font-black text-teal-900 dark:text-teal-100"
                  >
                    {ALL_YEARS_DESC.map((y) => {
                      const hasPaper = PRIORI_PAPERS.some(
                        (p) => String(p.year) === y && String(p.grade) === String(selectedPaperGrade)
                      );
                      return (
                        <option key={y} value={y}>
                          {y} 年{hasPaper ? '' : '（未建）'}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <>
                    <select
                      aria-label="矩陣篩選科目"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-xs font-black text-teal-900 dark:text-teal-100"
                    >
                      {PRIORI_SUBJECTS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onlyBuiltYears}
                        onChange={(e) => setOnlyBuiltYears(e.target.checked)}
                        className="rounded border-stone-300 text-teal-600"
                      />
                      <span>僅看已建置年度</span>
                    </label>
                  </>
                )}

                <select
                  aria-label="矩陣試卷年級"
                  value={selectedPaperGrade}
                  onChange={(e) => setSelectedPaperGrade(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-200"
                >
                  {PAPER_GRADE_OPTIONS.map((pg) => (
                    <option key={pg} value={pg}>
                      {pg}年級試卷
                    </option>
                  ))}
                </select>

                <div
                  role="group"
                  aria-label="測驗階段切換"
                  className="inline-flex p-1 rounded-xl bg-amber-50/90 dark:bg-slate-800 border border-amber-200 dark:border-slate-700"
                >
                  <button
                    type="button"
                    onClick={() => setScoreViewMode('initial')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      scoreViewMode === 'initial'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    初測成績（預設）
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoreViewMode('mastery')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      scoreViewMode === 'mastery'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    精熟後成果
                  </button>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {formatGradeClassTitle(selectedGrade, selectedClass)}・共 {matrixRows.length} 人（座號升冪）
              </span>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-stone-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="篩選科目"
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setInspectedQuestionId(null);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-xs font-black text-teal-900 dark:text-teal-100"
                >
                  {PRIORI_SUBJECTS.map((subj) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.label}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="篩選年度"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setInspectedQuestionId(null);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-xs font-black text-teal-900 dark:text-teal-100"
                >
                  {ALL_YEARS_DESC.map((y) => {
                    const exists = PRIORI_PAPERS.some(
                      (p) =>
                        p.subject === selectedSubject &&
                        String(p.year) === y &&
                        String(p.grade) === String(selectedPaperGrade)
                    );
                    return (
                      <option key={y} value={y}>
                        {y} 年{exists ? '' : ' (未建)'}
                      </option>
                    );
                  })}
                </select>

                <select
                  aria-label="篩選試卷年級"
                  value={selectedPaperGrade}
                  onChange={(e) => {
                    setSelectedPaperGrade(e.target.value);
                    setInspectedQuestionId(null);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-xs font-black text-teal-900 dark:text-teal-100"
                >
                  {PAPER_GRADE_OPTIONS.map((pg) => {
                    const exists = PRIORI_PAPERS.some(
                      (p) =>
                        p.subject === selectedSubject &&
                        String(p.year) === String(selectedYear) &&
                        String(p.grade) === pg
                    );
                    return (
                      <option key={pg} value={pg}>
                        {pg}年級卷{exists ? '' : ' (未建)'}
                      </option>
                    );
                  })}
                </select>

                <div
                  role="group"
                  aria-label="單題測驗階段切換"
                  className="inline-flex p-1 rounded-xl bg-amber-50/90 dark:bg-slate-800 border border-amber-200 dark:border-slate-700"
                >
                  <button
                    type="button"
                    onClick={() => setScoreViewMode('initial')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      scoreViewMode === 'initial'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    初測成績（預設）
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoreViewMode('mastery')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      scoreViewMode === 'mastery'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    精熟後成果
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {PRIORI_PAPERS.map((p) => {
                    const isPicked = activePaper?.paperId === p.paperId;
                    return (
                      <button
                        key={p.paperId}
                        type="button"
                        onClick={() => {
                          setSelectedSubject(p.subject);
                          setSelectedYear(String(p.year));
                          setSelectedPaperGrade(String(p.grade));
                          setInspectedQuestionId(null);
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-black border transition cursor-pointer ${
                          isPicked
                            ? 'bg-teal-700 border-teal-800 text-white shadow-sm'
                            : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400'
                        }`}
                      >
                        {p.year} {p.gradeLabel}
                        {p.subjectLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {formatGradeClassTitle(selectedGrade, selectedClass)}（{classRosterRows.length} 席）
              </span>
            </div>
          )}
        </section>

        {/* ═══ 若老師點開某生某卷成績格 → 展開「單生全卷明細與逐題計算紙」 ═══ */}
        {inspectedCell && inspectedPaper && inspectedCell.record ? (
          <div className="space-y-4 animate-fadeIn">
            <section className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-teal-300 dark:border-teal-700 p-4 sm:p-5 shadow-md space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInspectedCell(null)}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>回成績總表</span>
                  </button>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {isDemoView
                        ? `🧪 示範 ${formatShortClassName(inspectedCell.classNum)}`
                        : formatGradeClassTitle(selectedGrade, inspectedCell.classNum)}{' '}
                      {inspectedCell.seatStr}{' '}
                      {inspectedCell.studentName || ''}
                      {inspectedCell.nickname && !inspectedCell.studentName ? `（${inspectedCell.nickname}）` : ''}
                      <span className="ml-2 text-sm font-black text-teal-700 dark:text-teal-300">
                        ・{inspectedPaper.title}
                      </span>
                    </h2>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                      初測 {inspectedCell.record.firstScore ?? inspectedCell.record.score} 分 → 最新{' '}
                      {inspectedCell.record.latestScore ?? inspectedCell.record.score} 分・🌟 已精熟{' '}
                      {inspectedCell.record.masteredCount || 0} /{' '}
                      {inspectedCell.record.totalCount || inspectedPaper.questions.length} 題
                      {getDrillAttemptsCount(inspectedCell.record) > 0
                        ? `・自主補練 ${getDrillAttemptsCount(inspectedCell.record)} 次`
                        : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-black">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-300">
                    精熟標準：連續答對 2 次
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-slate-800">
                {[
                  { id: 'all', label: `全部 (${inspectedPaper.questions.length})` },
                  { id: 'remedial', label: '⚠️ 待補強' },
                  { id: 'progress', label: '🌱 連對 1 次' },
                  { id: 'mastered', label: '🌟 已精熟' },
                  ...(inspectedPaper.subject === 'math'
                    ? [{ id: 'scratchpad', label: '✏️ 含計算紙筆跡' }]
                    : []),
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setStudentQuestionFilter(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                      studentQuestionFilter === pill.id
                        ? 'bg-teal-700 border-teal-600 text-white shadow-sm'
                        : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </section>

            <div className="space-y-3">
              {studentDetailQuestions.map((q) => {
                const firstMap = getRecordFirstAnswersMap(inspectedCell.record);
                const firstChosen = firstMap?.[q.id];
                const chosen = inspectedCell.record.latestAnswers?.[q.id];
                const isOk = isPrioriAnswerCorrect(q, chosen);
                const isFirstOk = isPrioriAnswerCorrect(q, firstChosen);
                const streak = Number(inspectedCell.record.streaks?.[q.id]) || 0;
                const badge = getStreakBadge(streak);
                const padStrokes =
                  inspectedPaper.subject === 'math'
                    ? inspectedCell.record.scratchpad?.[q.id] || []
                    : [];
                const showPadPane =
                  inspectedPaper.subject === 'math' || padStrokes.length > 0;
                const qAttempts = getQuestionAttemptCount(inspectedCell.record, q.id);

                return (
                  <article
                    key={q.id}
                    className={`rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 p-4 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-4 items-start ${
                      isOk
                        ? 'border-emerald-200 dark:border-emerald-800/70'
                        : 'border-rose-300 dark:border-rose-800/80'
                    }`}
                  >
                    <div className={`${showPadPane ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-2`}>
                      <div className="flex flex-wrap items-center gap-2">
                        {isOk ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          第 {q.number} 題
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-black ${badge.cls}`}>
                          {badge.label}
                        </span>
                        {qAttempts > 1 && (
                          <span className="px-2 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-700 text-[11px] font-black text-cyan-800 dark:text-cyan-200">
                            自主練習 {qAttempts} 次{firstChosen !== undefined && firstChosen !== chosen ? (isFirstOk ? '' : '（初錯→修正）') : ''}
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                        <MathRichText text={q.questionText} />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-black">
                        <span className={isOk ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>
                          學生作答：
                          {q.questionType === 'alphabet-pair' ? (
                            <span>{formatPrioriAnswerLabel(q, chosen)}</span>
                          ) : chosen !== undefined && chosen !== null ? (
                            <>
                              ({chosen + 1}) <MathRichText text={q.options[chosen]} />
                            </>
                          ) : (
                            '未作答'
                          )}
                        </span>
                        <span className="text-teal-800 dark:text-teal-300">
                          {q.officialAnswerVerified ? '官方正解：' : '參考正解：'}
                          {q.questionType === 'alphabet-pair' ? (
                            <span>{q.answer}</span>
                          ) : (
                            <>
                              ({q.answer + 1}) <MathRichText text={q.options[q.answer]} />
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {showPadPane && (
                      <div className="lg:col-span-5">
                        <PrioriScratchpadPreview
                          questionNumber={q.number}
                          strokes={padStrokes}
                          compact={true}
                        />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'matrix' ? (
          /* ═══ 分頁 1：班級座號升冪成績矩陣（預設主畫面） ═══ */
          <section
            aria-label="班級成績總覽矩陣"
            className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-teal-200/80 dark:border-slate-700 shadow-md overflow-hidden"
          >
            {matrixRows.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Users className="w-10 h-10 mx-auto text-teal-600/40" />
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                  {formatGradeClassTitle(selectedGrade, selectedClass)} 目前尚無學生作答紀錄或名冊
                </p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  可在上方「1. 年級」或「2. 班級」下拉選單切換「🧪 示範班級（假資料）」預覽矩陣效果，或點「匯入加密名冊」展開全班座號表。
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50/95 dark:bg-slate-800/90 border-b border-stone-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300">
                      <th className="sticky left-0 z-10 bg-stone-50/95 dark:bg-slate-800/95 py-3 px-3 sm:px-4 whitespace-nowrap w-20">
                        座號
                      </th>
                      <th className="py-3 px-3 sm:px-4 whitespace-nowrap min-w-[140px]">
                        姓名（本機／名冊）
                      </th>
                      {matrixColumns.map((col) => (
                        <th
                          key={col.key}
                          className="py-3 px-2.5 sm:px-3 text-center whitespace-nowrap min-w-[96px]"
                        >
                          <div className="font-black text-slate-800 dark:text-slate-100">
                            {col.label}
                          </div>
                          {!col.paper && (
                            <div className="text-[10px] font-bold text-slate-400">尚未建置</div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-slate-800 text-xs sm:text-sm">
                    {matrixRows.map((row) => (
                      <tr
                        key={row.rowKey}
                        className="hover:bg-teal-50/40 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="sticky left-0 z-10 bg-white/95 dark:bg-slate-900/95 py-2.5 px-3 sm:px-4 font-black text-slate-700 dark:text-slate-200 tabular-nums whitespace-nowrap">
                          {(selectedClass === 'all' || isDemoView) && row.classNum !== 'guest'
                            ? `${formatShortClassName(row.classNum)} `
                            : ''}
                          {row.seatStr}
                        </td>

                        <td className="py-2 px-3 sm:px-4 whitespace-nowrap">
                          {row.rosterName ? (
                            <div>
                              <span className="font-black text-slate-900 dark:text-white">
                                {row.rosterName}
                              </span>
                              {row.nickname && (
                                <span className="block text-[11px] font-bold text-slate-400">
                                  前台：{row.nickname}
                                </span>
                              )}
                            </div>
                          ) : row.classNum === 'guest' ? (
                            <span className="font-bold text-slate-600 dark:text-slate-300">
                              {row.nickname || '訪客練習'}
                            </span>
                          ) : (
                            <div>
                              <input
                                type="text"
                                aria-label={`${row.seatStr} 姓名輸入`}
                                value={row.localName}
                                onChange={(e) => handleLocalSeatNameChange(row.rowKey, e.target.value)}
                                placeholder="輸入姓名（僅存本機）"
                                className="w-28 sm:w-32 px-2 py-1 rounded-lg bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                              />
                              {row.nickname && (
                                <span className="block text-[10px] font-bold text-slate-400 mt-0.5">
                                  前台：{row.nickname}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {matrixColumns.map((col) => {
                          const rec = col.paper ? row.recordsByPaper[col.paper.paperId] : null;
                          if (!col.paper || !rec) {
                            return (
                              <td
                                key={col.key}
                                className="py-2.5 px-2.5 text-center font-bold text-slate-300 dark:text-slate-600 select-none"
                              >
                                -
                              </td>
                            );
                          }

                          const firstScore = rec.firstScore ?? rec.score ?? 0;
                          const latestScore = rec.latestScore ?? rec.score ?? 0;
                          const totalCount = rec.totalCount || col.paper.totalQuestions || 25;
                          const firstCorrectCount = rec.firstCorrectCount;
                          const masteredCount = rec.masteredCount || 0;
                          const drillCount = getDrillAttemptsCount(rec);
                          const allMastered = masteredCount >= totalCount && totalCount > 0;
                          const hasPad =
                            col.paper.subject === 'math' &&
                            Object.values(rec.scratchpad || {}).some(
                              (arr) => Array.isArray(arr) && arr.length > 0
                            );
                          const displayScore =
                            scoreViewMode === 'initial' ? firstScore : latestScore;

                          return (
                            <td key={col.key} className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setStudentQuestionFilter('all');
                                  setInspectedCell({
                                    classNum: row.classNum,
                                    seatStr: row.seatStr,
                                    studentName: row.rosterName,
                                    nickname: row.nickname,
                                    paperId: col.paper.paperId,
                                    record: rec,
                                  });
                                }}
                                title="點此展開全卷答題明細與計算紙筆跡"
                                className="inline-flex flex-col items-center px-2.5 py-1.5 rounded-xl bg-teal-50/90 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 transition cursor-pointer tabular-nums min-w-[92px]"
                              >
                                <span className="font-black text-teal-900 dark:text-teal-100 text-xs sm:text-sm">
                                  {displayScore} 分{hasPad ? ' ✏️' : ''}
                                </span>
                                {scoreViewMode === 'initial' ? (
                                  <span className="text-[10px] font-black mt-0.5 text-slate-600 dark:text-slate-300">
                                    初測{firstCorrectCount !== undefined ? ` ${firstCorrectCount}/${totalCount}` : ''}
                                    {drillCount > 0 ? (
                                      <span className="text-emerald-700 dark:text-emerald-300">
                                        {` ・補${drillCount}次`}
                                      </span>
                                    ) : null}
                                  </span>
                                ) : (
                                  <span
                                    className={`text-[10px] font-black mt-0.5 ${
                                      allMastered
                                        ? 'text-emerald-700 dark:text-emerald-300'
                                        : 'text-amber-700 dark:text-amber-300'
                                    }`}
                                  >
                                    {allMastered ? '🌟 已精熟' : `🌟 ${masteredCount}/${totalCount}`}
                                    {drillCount > 0 ? ` ・補${drillCount}次` : ''}
                                  </span>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : !activePaper ? (
          <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-dashed border-stone-300 dark:border-slate-700 p-10 text-center space-y-2">
            <Layers className="w-10 h-10 mx-auto text-teal-600/50" />
            <h2 className="text-base font-black text-slate-700 dark:text-slate-200">
              此年度／科目試卷建置中
            </h2>
          </div>
        ) : (
          /* ═══ 分頁 2：全班單題答題情況與單題計算紙彙整 ═══ */
          <div className="space-y-4">
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/80 dark:border-slate-700 p-4 shadow-sm">
                <div className="text-xs font-black text-slate-500 dark:text-slate-400">
                  已答／應答人數
                </div>
                <div className="text-2xl font-black text-teal-800 dark:text-teal-200 mt-1 tabular-nums">
                  {classAnalytics.studentCount} / {classAnalytics.expectedStudentCount} 位
                </div>
              </div>
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/80 dark:border-slate-700 p-4 shadow-sm">
                <div className="text-xs font-black text-slate-500 dark:text-slate-400">
                  {scoreViewMode === 'initial'
                    ? `初測平均（最新 ${classAnalytics.avgLatestScore} 分）`
                    : `精熟後平均（初測 ${classAnalytics.avgFirstScore} 分）`}
                </div>
                <div className="text-2xl font-black text-cyan-800 dark:text-cyan-200 mt-1 tabular-nums">
                  {scoreViewMode === 'initial'
                    ? `${classAnalytics.avgFirstScore} 分`
                    : `${classAnalytics.avgLatestScore} 分`}
                </div>
              </div>
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/80 dark:border-slate-700 p-4 shadow-sm">
                <div className="text-xs font-black text-slate-500 dark:text-slate-400">
                  {scoreViewMode === 'initial'
                    ? `初測平均答對率（精熟 ${classAnalytics.avgMasteryPct}%）`
                    : `精熟達成率（連對 2 次・初測 ${classAnalytics.avgFirstAccuracyPct}%）`}
                </div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1 tabular-nums">
                  {scoreViewMode === 'initial'
                    ? `${classAnalytics.avgFirstAccuracyPct}%`
                    : `${classAnalytics.avgMasteryPct}%`}
                </div>
              </div>
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/80 dark:border-slate-700 p-4 shadow-sm">
                <div className="text-xs font-black text-slate-500 dark:text-slate-400">
                  共同弱點題（&lt; 60%）
                </div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
                  {classAnalytics.weakQuestionCount} 題
                </div>
              </div>
            </section>

            {inspectedQuestion && (
              <section
                aria-label={`第 ${inspectedQuestion.number} 題全班作答與計算紙檢視`}
                className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-cyan-500 dark:border-cyan-600 p-4 sm:p-5 shadow-xl space-y-4 animate-fadeIn"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 dark:border-slate-800 pb-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-cyan-700 text-white text-xs font-black">
                        單題診斷・第 {inspectedQuestion.number} 題
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 text-xs font-black">
                        {inspectedQuestion.conceptTitle}
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      <MathRichText text={inspectedQuestion.questionText} />
                    </div>
                    {(() => {
                      const st = classAnalytics.questionStats.find(
                        (item) => item.question.id === inspectedQuestion.id
                      );
                      if (!st) return null;
                      return (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {inspectedQuestion.questionType === 'alphabet-pair' ? (
                            <span className="px-2 py-0.5 rounded-lg text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400 text-emerald-800 dark:text-emerald-200">
                              正解：{inspectedQuestion.answer} ✓（{st.correctCount}人）
                            </span>
                          ) : (
                            inspectedQuestion.options.map((_, oIdx) => {
                              const isCorrectOpt = oIdx === inspectedQuestion.answer;
                              const cnt = st.optionCounts[oIdx];
                              return (
                                <span
                                  key={oIdx}
                                  className={`px-2 py-0.5 rounded-lg text-[11px] font-black tabular-nums border ${
                                    isCorrectOpt
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-800 dark:text-emerald-200'
                                      : cnt > 0
                                      ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-700 dark:text-rose-300'
                                      : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-slate-400'
                                  }`}
                                >
                                  ({oIdx + 1}){isCorrectOpt ? '✓' : ''}：{cnt}人
                                </span>
                              );
                            })
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectedQuestionId(null)}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>收合</span>
                  </button>
                </div>

                {questionTabRecords.length === 0 ? (
                  <p className="text-xs font-bold text-slate-500 py-4 text-center">
                    目前篩選條件下尚無學生作答紀錄。
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {questionTabRecords.map((stu) => {
                      const firstChosen = getRecordFirstAnswersMap(stu)?.[inspectedQuestion.id];
                      const latestChosen = stu.latestAnswers?.[inspectedQuestion.id];
                      const chosen = scoreViewMode === 'initial' ? firstChosen : latestChosen;
                      const isOk = isPrioriAnswerCorrect(inspectedQuestion, chosen);
                      const streak = Number(stu.streaks?.[inspectedQuestion.id]) || 0;
                      const badge = getStreakBadge(streak);
                      const padStrokes = stu.scratchpad?.[inspectedQuestion.id] || [];
                      const qAttempts = getQuestionAttemptCount(stu, inspectedQuestion.id);

                      return (
                        <div
                          key={stu.studentKey}
                          className={`rounded-2xl border-2 p-3 space-y-2.5 ${
                            isOk
                              ? 'border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/30 dark:bg-emerald-950/20'
                              : 'border-rose-200 dark:border-rose-800/70 bg-rose-50/30 dark:bg-rose-950/20'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                                {getDisplayStudentTitle(stu)}
                              </span>
                              <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black ${badge.cls}`}>
                                {badge.shortLabel}
                              </span>
                              {qAttempts > 1 && (
                                <span className="px-2 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-700 text-[10px] font-black text-cyan-800 dark:text-cyan-200">
                                  自主練 {qAttempts} 次
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                                  isOk ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                }`}
                              >
                                {scoreViewMode === 'initial' ? '初：' : '最新：'}
                                {formatPrioriAnswerLabel(inspectedQuestion, chosen, false)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const { seat, nickname } = extractSeatAndNickname(stu);
                                  setStudentQuestionFilter('all');
                                  setInspectedCell({
                                    classNum: normNumStr(stu.studentClass, '1'),
                                    seatStr: `${seat} 號`,
                                    studentName: rosterLookup.get(
                                      `${normNumStr(stu.studentGrade, '3')}-${normNumStr(
                                        stu.studentClass,
                                        '1'
                                      )}-${seat}`
                                    )?.name || '',
                                    nickname,
                                    paperId: activePaper.paperId,
                                    record: stu,
                                  });
                                }}
                                className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-[11px] font-black text-teal-700 dark:text-teal-300 cursor-pointer"
                              >
                                看全卷
                              </button>
                            </div>
                          </div>

                          {(activePaper.subject === 'math' || padStrokes.length > 0) && (
                            <PrioriScratchpadPreview
                              questionNumber={inspectedQuestion.number}
                              strokes={padStrokes}
                              compact={true}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            <section
              aria-label="依題目班級作答交叉矩陣"
              className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-teal-200/80 dark:border-slate-700 shadow-md overflow-hidden"
            >
              <div className="px-4 py-2.5 bg-stone-50/80 dark:bg-slate-800/70 border-b border-stone-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <span>
                  {activePaper.subject === 'math'
                    ? `縱軸：第 1–${activePaper.questions.length} 題（題意縮減，點題目看全班計算紙）｜橫軸：座號由 1 至末`
                    : `縱軸：第 1–${activePaper.questions.length} 題（題意縮減，點題目看全班選項統計）｜橫軸：座號由 1 至末`}
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-emerald-700 dark:text-emerald-300">🌟 已精熟</span>
                  <span className="text-teal-700 dark:text-teal-300">○ 答對</span>
                  <span className="text-rose-600 dark:text-rose-400">✕ 答錯</span>
                  <span className="text-slate-400">- 未作答</span>
                  <span>✏️ 有計算紙</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50/95 dark:bg-slate-800/90 border-b border-stone-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300">
                      <th className="sticky left-0 z-10 bg-stone-50/95 dark:bg-slate-800/95 py-2.5 px-3 sm:px-4 min-w-[235px] whitespace-nowrap">
                        題目（題意縮減）
                      </th>
                      <th className="py-2.5 px-2.5 text-center whitespace-nowrap min-w-[96px]">
                        <div>{scoreViewMode === 'initial' ? '初測答對率' : '目前精熟率'}</div>
                        <div className="text-[10px] font-bold text-slate-400">
                          {scoreViewMode === 'initial' ? '已答/應答・精熟' : '已答/應答・初測'}
                        </div>
                      </th>
                      {classRosterRows.map((stuRow) => {
                        const shortCls =
                          (selectedClass === 'all' || isDemoView) && stuRow.classNum !== 'guest'
                            ? formatShortClassName(stuRow.classNum).slice(0, 1)
                            : '';
                        const seatHead =
                          stuRow.classNum === 'guest'
                            ? '訪'
                            : `${shortCls}${stuRow.seatPad}`;
                        const stuName = stuRow.rosterName || stuRow.localName;
                        return (
                          <th
                            key={stuRow.rowKey}
                            className="py-2 px-1.5 text-center whitespace-nowrap min-w-[46px]"
                            title={stuName ? `${stuRow.seatStr} ${stuName}` : stuRow.seatStr}
                          >
                            <div className="font-black text-slate-800 dark:text-slate-100 tabular-nums">
                              {seatHead}
                            </div>
                            {stuName && (
                              <div className="text-[10px] font-bold text-slate-400 truncate max-w-[44px] mx-auto">
                                {stuName}
                              </div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-slate-800 text-xs">
                    {filteredQuestionStats.length === 0 ? (
                      <tr>
                        <td
                          colSpan={classRosterRows.length + 2}
                          className="py-8 text-center font-bold text-slate-500 dark:text-slate-400"
                        >
                          找不到符合「{searchQuery}」的題目
                        </td>
                      </tr>
                    ) : (
                      filteredQuestionStats.map((st) => {
                        const q = st.question;
                        const isInspected = inspectedQuestionId === q.id;
                        const isWeak = classAnalytics.studentCount > 0 && st.correctRate < 60;
                        return (
                          <tr
                            key={q.id}
                            className={`transition-colors ${
                              isInspected
                                ? 'bg-cyan-50/70 dark:bg-cyan-950/30'
                                : isWeak
                                ? 'bg-rose-50/35 dark:bg-rose-950/15 hover:bg-rose-50/70'
                                : 'hover:bg-teal-50/40 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            <td className="sticky left-0 z-10 bg-white/95 dark:bg-slate-900/95 py-2 px-3 sm:px-4 align-middle border-r border-stone-100 dark:border-slate-800">
                              <button
                                type="button"
                                onClick={() => setInspectedQuestionId(isInspected ? null : q.id)}
                                className="w-full text-left flex items-start gap-2 group cursor-pointer"
                              >
                                <span
                                  className={`px-2 py-0.5 rounded-lg text-[11px] font-black tabular-nums shrink-0 transition ${
                                    isInspected
                                      ? 'bg-cyan-700 text-white'
                                      : isWeak
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-teal-700 text-white group-hover:bg-teal-600'
                                  }`}
                                >
                                  第 {q.number} 題
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[220px]">
                                    {summarizeQuestionText(q)}
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-400 truncate max-w-[220px]">
                                    {q.conceptTitle}
                                    {st.scratchpadCount > 0 ? ` · ✏️${st.scratchpadCount}` : ''}
                                  </div>
                                </div>
                              </button>
                            </td>

                            <td className="py-2 px-2.5 text-center whitespace-nowrap tabular-nums">
                              {(() => {
                                const answeredCount =
                                  scoreViewMode === 'initial'
                                    ? st.firstAnsweredCount
                                    : st.latestAnsweredCount;
                                const mainPct =
                                  scoreViewMode === 'initial'
                                    ? st.firstCorrectRate
                                    : st.masteryRate;
                                const altPct =
                                  scoreViewMode === 'initial'
                                    ? st.masteryRate
                                    : st.firstCorrectRate;
                                const altLabel = scoreViewMode === 'initial' ? '精熟' : '初測';
                                if (answeredCount === 0) {
                                  return (
                                    <span className="text-slate-300 dark:text-slate-600 font-bold">
                                      -
                                    </span>
                                  );
                                }
                                return (
                                  <div className="inline-flex flex-col items-center">
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded-lg font-black text-[11px] ${
                                        isWeak
                                          ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                      }`}
                                    >
                                      {mainPct}%
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                                      {answeredCount}/{classAnalytics.expectedStudentCount}人・{altLabel}
                                      {altPct}%
                                    </span>
                                  </div>
                                );
                              })()}
                            </td>

                            {classRosterRows.map((stuRow) => {
                              const rec = stuRow.recordsByPaper[activePaper.paperId];
                              const firstMap = getRecordFirstAnswersMap(rec);
                              const chosen =
                                scoreViewMode === 'initial'
                                  ? firstMap?.[q.id]
                                  : rec?.latestAnswers?.[q.id];
                              const hasAnswer =
                                Boolean(rec) && chosen !== undefined && chosen !== null && chosen !== '';
                              const streak = Number(rec?.streaks?.[q.id]) || 0;
                              const qAttempts = getQuestionAttemptCount(rec, q.id);
                              const hasPad = Boolean(
                                rec &&
                                  Array.isArray(rec.scratchpad?.[q.id]) &&
                                  rec.scratchpad[q.id].length > 0
                              );

                              if (!rec || (!hasAnswer && (scoreViewMode === 'initial' || streak === 0))) {
                                return (
                                  <td
                                    key={stuRow.rowKey}
                                    className="py-2 px-1 text-center font-bold text-slate-300 dark:text-slate-600 select-none"
                                  >
                                    -
                                  </td>
                                );
                              }

                              const isMastered = scoreViewMode === 'mastery' && streak >= 2;
                              const isOk = hasAnswer ? isPrioriAnswerCorrect(q, chosen) : streak > 0;
                              const symbol = isMastered ? '🌟' : isOk ? '○' : '✕';
                              const cellCls = isMastered
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-200'
                                : isOk
                                ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200'
                                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300';

                              return (
                                <td key={stuRow.rowKey} className="py-1.5 px-1 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setInspectedQuestionId(q.id)}
                                    title={`${stuRow.seatStr}｜${
                                      scoreViewMode === 'initial' ? '初測' : '最新'
                                    }作答：${formatPrioriAnswerLabel(q, chosen, false)}${
                                      qAttempts > 1 ? `｜自主練習 ${qAttempts} 次` : ''
                                    }`}
                                    className={`inline-flex items-center justify-center gap-0.5 min-w-[30px] px-1 py-1 rounded-lg border text-xs font-black transition hover:scale-105 cursor-pointer ${cellCls}`}
                                  >
                                    <span>{symbol}</span>
                                    {qAttempts > 1 && (
                                      <span className="text-[9px] font-black text-cyan-700 dark:text-cyan-300">
                                        {qAttempts}
                                      </span>
                                    )}
                                    {hasPad && <span className="text-[9px]">✏️</span>}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>

      <PrioriRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        existingEnvelope={rosterEnvelope}
        decryptedCount={rosterEntries.length}
        teacherToken={teacherSession?.token || ''}
        onRosterUnlocked={(entries, env) => {
          setRosterEntries(entries);
          if (env) setRosterEnvelope(env);
        }}
      />

      <PrioriTeacherPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        initialPaperId={printablePaper?.paperId}
        initialShowAnswerKey={printShowAnswerKey}
        onConfirmPrint={(paperId, includeKey) => {
          setPrintTargetPaperId(paperId);
          setPrintShowAnswerKey(includeKey);
          setIsPrintModalOpen(false);
          setTimeout(() => {
            try {
              window.print();
            } catch {}
          }, 80);
        }}
      />

      <PrioriPrintableSheet
        paper={printablePaper}
        questions={printablePaper?.questions || []}
        answers={inspectedCell?.record?.latestAnswers || null}
        showAnswerKey={printShowAnswerKey}
      />
    </>
  );
}
