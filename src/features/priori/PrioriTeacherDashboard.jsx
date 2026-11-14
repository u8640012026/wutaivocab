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
import { LilyEmblem, PrioriPrintableSheet } from './PrioriModals';
import { PrioriRosterModal } from './PrioriRosterModal';
import {
  fetchAllPrioriTeacherRecordsWithMeta,
  PRIORI_DEMO_CLASS_RECORDS,
  isPrioriAnswerCorrect,
  formatPrioriAnswerLabel,
} from './prioriStorage';
import {
  verifyPrioriTeacherPassword,
  loadEncryptedRosterEnvelope,
} from './prioriSecurity';

const AUTH_SESSION_KEY = 'wutai_priori_teacher_authed';
const ALL_YEARS_DESC = ['115', '114', '113', '112', '111', '110', '109', '108'];
const GRADE_TABS = ['1', '2', '3', '4', '5', '6'];

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

function formatGradeClassTitle(grade, classNum) {
  if (classNum === 'all') return `${grade} 年級全部班級`;
  if (classNum === 'guest') return '訪客練習';
  const cMap = { '1': '甲班', '2': '乙班', '3': '丙班' };
  const cLabel = cMap[normNumStr(classNum)] || `${classNum}班`;
  return `${grade} 年${cLabel}`;
}

function extractSeatAndNickname(rec) {
  const seat = normNumStr(rec.studentSeat, '99').padStart(2, '0');
  const rawName = String(rec.displayName || '');
  const parenMatch = rawName.match(/\(([^)]+)\)/);
  const nickname = parenMatch ? parenMatch[1] : rawName;
  return { seat, nickname };
}

export function PrioriTeacherDashboard({ onBack }) {
  const [isAuthed, setIsAuthed] = useState(() => {
    try {
      return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // 主分頁：班級成績矩陣（預設） vs 各題診斷分析
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'questions'

  // 第一順位選班級（年級 × 班別）
  const [selectedGrade, setSelectedGrade] = useState('3');
  const [selectedClass, setSelectedClass] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');

  // 矩陣維度切換：依年度看三科（國/數/英） vs 依科目看歷年（115–108）
  const [matrixMode, setMatrixMode] = useState('by-year'); // 'by-year' | 'by-subject'
  const [selectedYear, setSelectedYear] = useState('114');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [onlyBuiltYears, setOnlyBuiltYears] = useState(false);

  // 全卷資料與加密名冊狀態
  const [realRecordsByPaper, setRealRecordsByPaper] = useState({});
  const [cloudError, setCloudError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoAutoChecked, setDemoAutoChecked] = useState(false);

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
          String(p.grade) === String(selectedGrade)
      ) ||
      PRIORI_PAPERS.find(
        (p) =>
          String(p.year) === String(selectedYear) && p.subject === selectedSubject
      ) ||
      null
    );
  }, [selectedYear, selectedSubject, selectedGrade]);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [{ recordsByPaperId, cloudError: recErr }, { envelope, cloudError: rosErr }] =
        await Promise.all([
          fetchAllPrioriTeacherRecordsWithMeta(),
          loadEncryptedRosterEnvelope(),
        ]);

      setRealRecordsByPaper(recordsByPaperId || {});
      setCloudError(recErr || rosErr || '');
      if (envelope) setRosterEnvelope(envelope);

      const totalRealCount = Object.values(recordsByPaperId || {}).reduce(
        (sum, list) => sum + list.length,
        0
      );
      if (!demoAutoChecked) {
        setShowDemo(totalRealCount === 0);
        setDemoAutoChecked(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [demoAutoChecked]);

  useEffect(() => {
    if (isAuthed) {
      loadAllData();
    }
  }, [isAuthed, loadAllData]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (verifyPrioriTeacherPassword(password)) {
      try {
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      } catch {}
      setIsAuthed(true);
      setAuthError('');
      setPassword('');
    } else {
      setAuthError('教師密碼錯誤，請再試一次。');
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch {}
    setIsAuthed(false);
    setPassword('');
    setRosterEntries([]);
    setInspectedCell(null);
  };

  // 合併真實與示範紀錄（依 paperId 分桶）
  const combinedByPaper = useMemo(() => {
    const out = {};
    const allPaperIds = new Set([
      ...PRIORI_PAPERS.map((p) => p.paperId),
      ...Object.keys(realRecordsByPaper),
    ]);
    for (const pid of allPaperIds) {
      const realList = realRecordsByPaper[pid] || [];
      const demoList = showDemo
        ? PRIORI_DEMO_CLASS_RECORDS.filter((d) => d.paperId === pid)
        : [];
      out[pid] = [...realList, ...demoList];
    }
    return out;
  }, [realRecordsByPaper, showDemo]);

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

  // 動態收集所有出現過的班別
  const availableClasses = useMemo(() => {
    const set = new Set(['1', '2', '3']);
    for (const entry of rosterEntries) {
      if (normNumStr(entry.grade) === String(selectedGrade)) {
        set.add(normNumStr(entry.classNum, '1'));
      }
    }
    for (const list of Object.values(combinedByPaper)) {
      for (const rec of list) {
        if (normNumStr(rec.studentGrade, '3') === String(selectedGrade) && rec.studentClass) {
          set.add(
            rec.studentClass === 'guest' ? 'guest' : normNumStr(rec.studentClass, '1')
          );
        }
      }
    }
    return Array.from(set).sort((a, b) => {
      if (a === 'guest') return 1;
      if (b === 'guest') return -1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [combinedByPaper, rosterEntries, selectedGrade]);

  // ── 建置「班級座號升冪矩陣名單」（含花名冊空白座號與全部跨科／歷年成績） ──
  const matrixRows = useMemo(() => {
    const rowMap = new Map();

    const ensureRow = (gradeVal, classVal, seatVal, skHint, nickHint, nameOverride = '') => {
      const g = normNumStr(gradeVal, String(selectedGrade));
      const c = classVal === 'guest' ? 'guest' : normNumStr(classVal, '1');
      const seatNum = parseInt(normNumStr(seatVal, '99'), 10) || 99;
      const seatStr = String(seatNum).padStart(2, '0');
      const rowKey = c === 'guest' ? `guest:${skHint}` : `${g}-${c}-${seatStr}`;

      if (!rowMap.has(rowKey)) {
        const rosterMatch = rosterLookup.get(`${g}-${c}-${seatStr}`);
        rowMap.set(rowKey, {
          rowKey,
          grade: g,
          classNum: c,
          seatNum,
          seatStr: c === 'guest' ? '訪客' : `${seatStr} 號`,
          rosterName: nameOverride || rosterMatch?.name || '',
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

    // 1. 先納入解密名冊中屬於該年級／班級的每位學生（確保未作答學生也列出來並顯示 -）
    for (const entry of rosterEntries) {
      const g = normNumStr(entry.grade);
      const c = normNumStr(entry.classNum, '1');
      if (g !== String(selectedGrade)) continue;
      if (selectedClass !== 'all' && c !== String(selectedClass)) continue;
      ensureRow(g, c, entry.seat, entry.studentKey, '', entry.name);
    }

    // 2. 合併各試卷學生作答紀錄
    for (const [paperId, list] of Object.entries(combinedByPaper)) {
      for (const rec of list) {
        const g = normNumStr(rec.studentGrade, '3');
        const c = rec.studentClass === 'guest' ? 'guest' : normNumStr(rec.studentClass, '1');
        if (g !== String(selectedGrade)) continue;
        if (selectedClass !== 'all' && c !== String(selectedClass)) continue;

        const { seat, nickname } = extractSeatAndNickname(rec);
        const row = ensureRow(g, c, seat, rec.studentKey, nickname);
        row.recordsByPaper[paperId] = rec;
      }
    }

    let rows = Array.from(rowMap.values());

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      rows = rows.filter((r) => {
        const hay = `${r.seatStr} ${r.rosterName} ${r.nickname} ${r.studentKey}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return rows.sort((a, b) => {
      if (a.classNum === 'guest' && b.classNum !== 'guest') return 1;
      if (b.classNum === 'guest' && a.classNum !== 'guest') return -1;
      if (a.classNum !== b.classNum) {
        return String(a.classNum).localeCompare(String(b.classNum), undefined, { numeric: true });
      }
      return a.seatNum - b.seatNum;
    });
  }, [combinedByPaper, rosterEntries, rosterLookup, searchQuery, selectedClass, selectedGrade]);

  // 矩陣欄位定義（依年度看三科 vs 依科目看歷年 115~108）
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
            String(p.grade) === String(selectedGrade)
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
              String(p.grade) === String(selectedGrade)
          )
        )
      : ALL_YEARS_DESC;

    return yearsList.map((y) => {
      const paper = PRIORI_PAPERS.find(
        (p) =>
          p.subject === selectedSubject &&
          String(p.year) === y &&
          String(p.grade) === String(selectedGrade)
      );
      return {
        key: `${selectedSubject}-${y}`,
        label: `${y} 年`,
        subjectId: selectedSubject,
        year: y,
        paper: paper || null,
      };
    });
  }, [matrixMode, selectedYear, selectedSubject, selectedGrade, onlyBuiltYears]);

  // ── 「單題分析分頁」用單卷篩選學生清單 ──
  const questionTabRecords = useMemo(() => {
    if (!activePaper) return [];
    const list = combinedByPaper[activePaper.paperId] || [];
    return list
      .filter((r) => {
        const gNorm = normNumStr(r.studentGrade, '3');
        if (gNorm !== String(selectedGrade)) return false;
        const cNorm = r.studentClass === 'guest' ? 'guest' : normNumStr(r.studentClass, '1');
        if (selectedClass !== 'all' && cNorm !== String(selectedClass)) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const hay = `${r.displayName || ''} ${r.studentSeat || ''} ${r.studentKey || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => Number(a.studentSeat || 99) - Number(b.studentSeat || 99));
  }, [activePaper, combinedByPaper, searchQuery, selectedClass, selectedGrade]);

  const classAnalytics = useMemo(() => {
    if (!activePaper) {
      return {
        studentCount: 0,
        avgFirstScore: 0,
        avgLatestScore: 0,
        avgMasteryPct: 0,
        weakQuestionCount: 0,
        questionStats: [],
      };
    }
    const nStudents = questionTabRecords.length;
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
    const avgMasteryPct =
      nStudents > 0 && totalQ > 0
        ? Math.round(
            (questionTabRecords.reduce((s, r) => s + (Number(r.masteredCount) || 0), 0) /
              (nStudents * totalQ)) *
              100
          )
        : 0;

    const questionStats = activePaper.questions.map((q) => {
      const optLen = Array.isArray(q.options) ? q.options.length : 0;
      const optionCounts = Array(optLen).fill(0);
      const wrongInputs = [];
      let correctCount = 0;
      let masteredCount = 0;
      let scratchpadCount = 0;

      for (const stu of questionTabRecords) {
        const chosen = stu.latestAnswers?.[q.id];
        if (typeof chosen === 'number' && chosen >= 0 && chosen < optLen) {
          optionCounts[chosen] += 1;
        }
        const ok = isPrioriAnswerCorrect(q, chosen);
        if (ok) correctCount += 1;
        else if (q.questionType === 'alphabet-pair' && chosen) {
          wrongInputs.push(formatPrioriAnswerLabel(q, chosen, false));
        }
        if ((stu.streaks?.[q.id] || 0) >= 2) masteredCount += 1;
        if (Array.isArray(stu.scratchpad?.[q.id]) && stu.scratchpad[q.id].length > 0) {
          scratchpadCount += 1;
        }
      }

      const correctRate = nStudents > 0 ? Math.round((correctCount / nStudents) * 100) : 0;
      const masteryRate = nStudents > 0 ? Math.round((masteredCount / nStudents) * 100) : 0;
      return {
        question: q,
        correctCount,
        masteredCount,
        scratchpadCount,
        optionCounts,
        wrongInputs,
        correctRate,
        masteryRate,
      };
    });

    const weakQuestionCount =
      nStudents > 0 ? questionStats.filter((st) => st.correctRate < 60).length : 0;

    return {
      studentCount: nStudents,
      avgFirstScore,
      avgLatestScore,
      avgMasteryPct,
      weakQuestionCount,
      questionStats,
    };
  }, [activePaper, questionTabRecords]);

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
      const rosterMatch = rosterLookup.get(`${g}-${c}-${seat}`);
      if (rosterMatch) return `${seat} 號 ${rosterMatch.name}`;
      return rec.displayName || `${seat} 號 (${nickname})`;
    },
    [rosterLookup]
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
              className="w-full py-3 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>驗證進入教師診斷台</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const printablePaper = inspectedPaper || activePaper;

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
              onClick={() => setShowDemo((v) => !v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                showDemo
                  ? 'bg-cyan-700 border-cyan-600 text-white shadow-sm'
                  : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              🧪 示範班級：{showDemo ? '開' : '關'}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              disabled={!printablePaper}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-black flex items-center gap-1 hover:bg-amber-100 disabled:opacity-50 transition cursor-pointer"
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

        {/* 第一順位：選擇班級 + 視角切換 */}
        <section className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/70 dark:border-slate-700 p-3.5 sm:p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
                1. 選擇年級
              </label>
              <select
                aria-label="篩選年級"
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setInspectedCell(null);
                  setInspectedQuestionId(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100"
              >
                {GRADE_TABS.map((g) => (
                  <option key={g} value={g}>
                    {g} 年級
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
                2. 選擇班級
              </label>
              <select
                aria-label="篩選班級"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setInspectedCell(null);
                  setInspectedQuestionId(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100"
              >
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {selectedGrade}年{formatClassLabel(cls)}
                  </option>
                ))}
                <option value="all">{selectedGrade}年級全部班級</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
                3. 檢視模式
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
                  <span>班級成績表</span>
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
                  <span>單題診斷</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
                搜尋座號／姓名
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="座號或姓名"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* 矩陣或單題的年度／科目維度控制列 */}
          {activeTab === 'matrix' && !inspectedCell && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-stone-100 dark:border-slate-800">
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
                    className="px-3 py-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-xs font-black text-teal-900 dark:text-teal-100"
                  >
                    {ALL_YEARS_DESC.map((y) => {
                      const hasPaper = PRIORI_PAPERS.some(
                        (p) => String(p.year) === y && String(p.grade) === String(selectedGrade)
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
                      className="px-3 py-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-xs font-black text-teal-900 dark:text-teal-100"
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
              </div>

              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {formatGradeClassTitle(selectedGrade, selectedClass)}・共 {matrixRows.length} 位（座號升冪）
              </span>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-stone-100 dark:border-slate-800">
              <span className="text-xs font-black text-slate-500">單題診斷考卷：</span>
              <select
                aria-label="篩選年度"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setInspectedQuestionId(null);
                }}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs font-black"
              >
                <option value="114">114 年（官方答案）</option>
                <option value="115">115 年（教師參考解）</option>
              </select>
              <select
                aria-label="篩選科目"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setInspectedQuestionId(null);
                }}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs font-black"
              >
                {PRIORI_SUBJECTS.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.label}
                  </option>
                ))}
              </select>
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
                      {formatGradeClassTitle(selectedGrade, inspectedCell.classNum)} {inspectedCell.seatStr}{' '}
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
                  { id: 'scratchpad', label: '✏️ 含計算紙筆跡' },
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
                const chosen = inspectedCell.record.latestAnswers?.[q.id];
                const isOk = isPrioriAnswerCorrect(q, chosen);
                const streak = Number(inspectedCell.record.streaks?.[q.id]) || 0;
                const badge = getStreakBadge(streak);
                const padStrokes = inspectedCell.record.scratchpad?.[q.id] || [];

                return (
                  <article
                    key={q.id}
                    className={`rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 p-4 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-4 items-start ${
                      isOk
                        ? 'border-emerald-200 dark:border-emerald-800/70'
                        : 'border-rose-300 dark:border-rose-800/80'
                    }`}
                  >
                    <div className="lg:col-span-7 space-y-2">
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

                    <div className="lg:col-span-5">
                      <PrioriScratchpadPreview
                        questionNumber={q.number}
                        strokes={padStrokes}
                        compact={true}
                      />
                    </div>
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
                  可點上方「🧪 示範班級：開」預覽矩陣效果，或點「匯入加密名冊」展開全班座號表。
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50/95 dark:bg-slate-800/90 border-b border-stone-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300">
                      <th className="py-3 px-3 sm:px-4 whitespace-nowrap w-20">座號</th>
                      <th className="py-3 px-3 sm:px-4 whitespace-nowrap min-w-[130px]">
                        {rosterEntries.length > 0 ? '姓名（名冊）' : '身分／暱稱'}
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
                        <td className="py-2.5 px-3 sm:px-4 font-black text-slate-700 dark:text-slate-200 tabular-nums whitespace-nowrap">
                          {selectedClass === 'all' && row.classNum !== 'guest'
                            ? `${formatClassLabel(row.classNum).slice(0, 2)} `
                            : ''}
                          {row.seatStr}
                        </td>

                        <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
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
                          ) : (
                            <span className="font-bold text-slate-600 dark:text-slate-300">
                              {row.nickname || '尚未作答'}
                            </span>
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

                          const latestScore = rec.latestScore ?? rec.score ?? 0;
                          const totalCount = rec.totalCount || col.paper.totalQuestions || 25;
                          const masteredCount = rec.masteredCount || 0;
                          const allMastered = masteredCount >= totalCount && totalCount > 0;
                          const hasPad = Object.values(rec.scratchpad || {}).some(
                            (arr) => Array.isArray(arr) && arr.length > 0
                          );

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
                                className="inline-flex flex-col items-center px-2.5 py-1.5 rounded-xl bg-teal-50/90 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 transition cursor-pointer tabular-nums min-w-[84px]"
                              >
                                <span className="font-black text-teal-900 dark:text-teal-100 text-xs sm:text-sm">
                                  {latestScore} 分{hasPad ? ' ✏️' : ''}
                                </span>
                                <span
                                  className={`text-[10px] font-black mt-0.5 ${
                                    allMastered
                                      ? 'text-emerald-700 dark:text-emerald-300'
                                      : 'text-amber-700 dark:text-amber-300'
                                  }`}
                                >
                                  {allMastered ? '🌟 已精熟' : `🌟 ${masteredCount}/${totalCount}`}
                                </span>
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
                <div className="text-xs font-black text-slate-500 dark:text-slate-400">作答人數</div>
                <div className="text-2xl font-black text-teal-800 dark:text-teal-200 mt-1 tabular-nums">
                  {classAnalytics.studentCount} 位
                </div>
              </div>
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/80 dark:border-slate-700 p-4 shadow-sm">
                <div className="text-xs font-black text-slate-500 dark:text-slate-400">
                  平均（初測 → 最新）
                </div>
                <div className="text-2xl font-black text-cyan-800 dark:text-cyan-200 mt-1 tabular-nums">
                  {classAnalytics.avgFirstScore} → {classAnalytics.avgLatestScore} 分
                </div>
              </div>
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/80 dark:border-slate-700 p-4 shadow-sm">
                <div className="text-xs font-black text-slate-500 dark:text-slate-400">
                  精熟達成率（連對 2 次）
                </div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1 tabular-nums">
                  {classAnalytics.avgMasteryPct}%
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
                      const chosen = stu.latestAnswers?.[inspectedQuestion.id];
                      const isOk = isPrioriAnswerCorrect(inspectedQuestion, chosen);
                      const streak = Number(stu.streaks?.[inspectedQuestion.id]) || 0;
                      const badge = getStreakBadge(streak);
                      const padStrokes = stu.scratchpad?.[inspectedQuestion.id] || [];

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
                            <div className="flex items-center gap-2">
                              <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                                {getDisplayStudentTitle(stu)}
                              </span>
                              <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black ${badge.cls}`}>
                                {badge.shortLabel}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                                  isOk ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                }`}
                              >
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

                          <PrioriScratchpadPreview
                            questionNumber={inspectedQuestion.number}
                            strokes={padStrokes}
                            compact={true}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            <div className="space-y-2.5">
              {classAnalytics.questionStats.map((st) => {
                const q = st.question;
                const isInspected = inspectedQuestionId === q.id;
                const isWeak = classAnalytics.studentCount > 0 && st.correctRate < 60;
                return (
                  <article
                    key={q.id}
                    className={`rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 p-3.5 sm:p-4 shadow-sm transition ${
                      isInspected
                        ? 'border-cyan-600 ring-2 ring-cyan-400/40'
                        : isWeak
                        ? 'border-rose-300 dark:border-rose-800/80'
                        : 'border-stone-200/90 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-xl bg-teal-700 text-white text-xs font-black tabular-nums">
                            第 {q.number} 題
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-black">
                            {q.conceptTitle}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          <MathRichText text={q.questionText} />
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {q.questionType === 'alphabet-pair' ? (
                            <>
                              <span className="px-2 py-0.5 rounded-lg text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400 text-emerald-800 dark:text-emerald-200">
                                正解：{q.answer} ✓（{st.correctCount}人）
                              </span>
                              {st.wrongInputs?.length > 0 && (
                                <span className="px-2 py-0.5 rounded-lg text-[11px] font-black bg-rose-50 dark:bg-rose-950/50 border border-rose-300 text-rose-700 dark:text-rose-300">
                                  常見誤寫：{Array.from(new Set(st.wrongInputs)).join(' / ')}
                                </span>
                              )}
                            </>
                          ) : (
                            q.options.map((_, oIdx) => {
                              const isCorrectOpt = oIdx === q.answer;
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
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="text-right space-y-0.5 min-w-[110px]">
                          <div className="text-xs font-black text-slate-700 dark:text-slate-200 tabular-nums">
                            答對率 {st.correctRate}%（{st.correctCount}/{classAnalytics.studentCount}）
                          </div>
                          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                            🌟 精熟 {st.masteryRate}%（{st.masteredCount}/{classAnalytics.studentCount}）
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInspectedQuestionId(isInspected ? null : q.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition cursor-pointer ${
                            isInspected
                              ? 'bg-cyan-700 border-cyan-600 text-white shadow-sm'
                              : 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200 hover:bg-teal-100'
                          }`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>
                            {isInspected
                              ? '收合計算紙'
                              : `檢視計算紙 (${st.scratchpadCount})`}
                          </span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <PrioriRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        existingEnvelope={rosterEnvelope}
        decryptedCount={rosterEntries.length}
        onRosterUnlocked={(entries, env) => {
          setRosterEntries(entries);
          if (env) setRosterEnvelope(env);
        }}
      />

      <PrioriPrintableSheet
        paper={printablePaper}
        questions={printablePaper?.questions || []}
        answers={inspectedCell?.record?.latestAnswers || null}
        showAnswerKey={true}
      />
    </>
  );
}
