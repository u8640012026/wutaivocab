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
  Sparkles,
  Pencil,
  Award,
  AlertTriangle,
  Eye,
  Layers,
  X,
  Printer,
} from 'lucide-react';
import { PRIORI_SUBJECTS, PRIORI_PAPERS } from '../../data/priori';
import { MathRichText } from './MathRichText';
import { PrioriScratchpadPreview } from './PrioriScratchpad';
import { LilyEmblem, PrioriPrintableSheet } from './PrioriModals';
import {
  fetchPrioriTeacherRecordsWithMeta,
  PRIORI_DEMO_CLASS_RECORDS,
  isPrioriAnswerCorrect,
  formatPrioriAnswerLabel,
} from './prioriStorage';

const AUTH_SESSION_KEY = 'wutai_priori_teacher_authed';

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
  const n = String(classNum);
  const map = { '1': '1 班（甲）', '2': '2 班（乙）', '3': '3 班（丙）' };
  return map[n] || `${n} 班`;
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

  // 篩選條件（年度、科目、年級、班級、搜尋）
  const [selectedYear, setSelectedYear] = useState('114');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedGrade, setSelectedGrade] = useState('3');
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 資料載入與展示切換
  const [realRecords, setRealRecords] = useState([]);
  const [cloudError, setCloudError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoAutoChecked, setDemoAutoChecked] = useState(false);

  // 分頁與檢視目標
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'students'
  const [inspectedQuestionId, setInspectedQuestionId] = useState(null);
  const [selectedStudentKey, setSelectedStudentKey] = useState(null);
  const [studentQuestionFilter, setStudentQuestionFilter] = useState('all'); // 'all' | 'remedial' | 'progress' | 'mastered' | 'scratchpad'

  const activePaper = useMemo(() => {
    return (
      PRIORI_PAPERS.find(
        (p) =>
          String(p.year) === String(selectedYear) &&
          p.subject === selectedSubject &&
          (selectedGrade === 'all' || String(p.grade) === String(selectedGrade))
      ) || null
    );
  }, [selectedYear, selectedSubject, selectedGrade]);

  const loadRecords = useCallback(async () => {
    if (!activePaper) {
      setRealRecords([]);
      setCloudError('');
      return;
    }
    setIsLoading(true);
    try {
      const { records: fetched, cloudError: fetchErr } = await fetchPrioriTeacherRecordsWithMeta(
        activePaper.paperId
      );
      setRealRecords(fetched);
      setCloudError(fetchErr || '');
      if (!demoAutoChecked) {
        setShowDemo(fetched.length === 0);
        setDemoAutoChecked(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activePaper, demoAutoChecked]);

  useEffect(() => {
    if (isAuthed) {
      loadRecords();
    }
  }, [isAuthed, loadRecords]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password.trim() === 'wt7902230') {
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
  };

  // 合併真實與示範紀錄
  const combinedRecords = useMemo(() => {
    if (!activePaper) return [];
    const demoForPaper = showDemo
      ? PRIORI_DEMO_CLASS_RECORDS.filter((d) => d.paperId === activePaper.paperId)
      : [];
    return [...realRecords, ...demoForPaper];
  }, [activePaper, realRecords, showDemo]);

  // 動態收集所有出現過的班級選項
  const availableClasses = useMemo(() => {
    const set = new Set(['1', '2']);
    combinedRecords.forEach((r) => {
      if (r.studentClass) set.add(String(r.studentClass));
    });
    return Array.from(set).sort((a, b) => {
      if (a === 'guest') return 1;
      if (b === 'guest') return -1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [combinedRecords]);

  // 套用班級、年級與搜尋過濾後的學生清單
  const filteredRecords = useMemo(() => {
    return combinedRecords.filter((r) => {
      if (selectedGrade !== 'all') {
        const gNorm = String(r.studentGrade || '03').replace(/^0/, '');
        if (gNorm !== String(selectedGrade)) return false;
      }
      if (selectedClass !== 'all' && String(r.studentClass) !== String(selectedClass)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${r.displayName || ''} ${r.studentSeat || ''} ${r.studentKey || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [combinedRecords, selectedClass, selectedGrade, searchQuery]);

  // 全班統計 KPI 與各題答對率／選項誘答統計
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

    const nStudents = filteredRecords.length;
    const totalQ = activePaper.questions.length;

    const avgFirstScore =
      nStudents > 0
        ? Math.round(
            filteredRecords.reduce((s, r) => s + (Number(r.firstScore ?? r.score) || 0), 0) / nStudents
          )
        : 0;
    const avgLatestScore =
      nStudents > 0
        ? Math.round(
            filteredRecords.reduce((s, r) => s + (Number(r.latestScore ?? r.score) || 0), 0) / nStudents
          )
        : 0;
    const avgMasteryPct =
      nStudents > 0 && totalQ > 0
        ? Math.round(
            (filteredRecords.reduce((s, r) => s + (Number(r.masteredCount) || 0), 0) /
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

      for (const stu of filteredRecords) {
        const chosen = stu.latestAnswers?.[q.id];
        if (typeof chosen === 'number' && chosen >= 0 && chosen < optLen) {
          optionCounts[chosen] += 1;
        }
        const ok = isPrioriAnswerCorrect(q, chosen);
        if (ok) {
          correctCount += 1;
        } else if (q.questionType === 'alphabet-pair' && chosen) {
          wrongInputs.push(String(chosen));
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
  }, [activePaper, filteredRecords]);

  const inspectedQuestion = useMemo(() => {
    if (!activePaper || !inspectedQuestionId) return null;
    return activePaper.questions.find((q) => q.id === inspectedQuestionId) || null;
  }, [activePaper, inspectedQuestionId]);

  const inspectedStudent = useMemo(() => {
    if (!selectedStudentKey) return null;
    return filteredRecords.find((r) => r.studentKey === selectedStudentKey) || null;
  }, [filteredRecords, selectedStudentKey]);

  const studentDetailQuestions = useMemo(() => {
    if (!activePaper || !inspectedStudent) return [];
    return activePaper.questions.filter((q) => {
      const streak = Number(inspectedStudent.streaks?.[q.id]) || 0;
      const hasPad =
        Array.isArray(inspectedStudent.scratchpad?.[q.id]) &&
        inspectedStudent.scratchpad[q.id].length > 0;

      if (studentQuestionFilter === 'remedial') return streak === 0;
      if (studentQuestionFilter === 'progress') return streak === 1;
      if (studentQuestionFilter === 'mastered') return streak >= 2;
      if (studentQuestionFilter === 'scratchpad') return hasPad;
      return true;
    });
  }, [activePaper, inspectedStudent, studentQuestionFilter]);

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
              檢視班級答題熱區、雙連對精熟進度與學生單題計算紙筆跡（與單字館完全隔離）
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

  // ── 教師診斷後台主畫面 ──
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
              <span>學習扶助・教師班級與個人診斷後台</span>
            </h1>
            <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
              連續答對 2 次即自動更新為「🌟 已精熟」；點選任一題目或學生可即時回看方格計算紙筆跡
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDemo((v) => !v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${
              showDemo
                ? 'bg-cyan-700 border-cyan-600 text-white shadow-sm'
                : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            🧪 示範班級資料：{showDemo ? '開' : '關'}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            disabled={!activePaper}
            className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-black flex items-center gap-1 hover:bg-amber-100 disabled:opacity-50 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>列印解答卷（含正解）</span>
          </button>

          <button
            type="button"
            onClick={loadRecords}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-black flex items-center gap-1 hover:bg-teal-100 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>重整資料</span>
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

      {/* 年度 / 科目 / 年級 / 班級 / 搜尋篩選列 */}
      <section className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/70 dark:border-slate-700 p-3 sm:p-4 shadow-sm grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div>
          <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
            年度
          </label>
          <select
            aria-label="篩選年度"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setInspectedQuestionId(null);
              setSelectedStudentKey(null);
            }}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100"
          >
            <option value="114">114 年篩選測驗（官方答案）</option>
            <option value="115">115 年篩選測驗（教師參考解）</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
            科目
          </label>
          <select
            aria-label="篩選科目"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setInspectedQuestionId(null);
              setSelectedStudentKey(null);
            }}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100"
          >
            {PRIORI_SUBJECTS.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.label}
                {subj.availableGrades.length === 0 ? '（建置中）' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
            年級
          </label>
          <select
            aria-label="篩選年級"
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setInspectedQuestionId(null);
              setSelectedStudentKey(null);
            }}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100"
          >
            <option value="all">全部年級</option>
            <option value="3">三年級</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
            班級
          </label>
          <select
            aria-label="篩選班級"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedStudentKey(null);
            }}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100"
          >
            <option value="all">全部班級</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {formatClassLabel(cls)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
            搜尋學生
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="姓名或座號"
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </section>

      {!activePaper ? (
        <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-dashed border-stone-300 dark:border-slate-700 p-10 text-center space-y-2">
          <Layers className="w-10 h-10 mx-auto text-teal-600/50" />
          <h2 className="text-base font-black text-slate-700 dark:text-slate-200">
            此年度／科目試卷建置中
          </h2>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            目前已完成「114 年三年級國語／英語／數學」三科官方試卷與「115 年三年級數學」；切換年度或科目即可查看診斷資料與計算紙筆跡。
          </p>
        </div>
      ) : (
        <>
          {/* KPI 總覽列 */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/80 dark:border-slate-700 p-4 shadow-sm">
              <div className="text-xs font-black text-slate-500 dark:text-slate-400">
                篩選人數
              </div>
              <div className="text-2xl font-black text-teal-800 dark:text-teal-200 mt-1 tabular-nums">
                {classAnalytics.studentCount} 位
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                真實紀錄 {realRecords.length} 位{showDemo ? ' + 示範 4 位' : ''}
              </div>
            </div>

            <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/80 dark:border-slate-700 p-4 shadow-sm">
              <div className="text-xs font-black text-slate-500 dark:text-slate-400">
                班級平均分數（初測 → 最新）
              </div>
              <div className="text-2xl font-black text-cyan-800 dark:text-cyan-200 mt-1 tabular-nums">
                {classAnalytics.avgFirstScore} → {classAnalytics.avgLatestScore} 分
              </div>
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                訂正進步 +{Math.max(0, classAnalytics.avgLatestScore - classAnalytics.avgFirstScore)} 分
              </div>
            </div>

            <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/80 dark:border-slate-700 p-4 shadow-sm">
              <div className="text-xs font-black text-slate-500 dark:text-slate-400">
                全班精熟達成率（連對 2 次）
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1 tabular-nums">
                {classAnalytics.avgMasteryPct}%
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                以每位學生各題連續答對 ≥ 2 次計算
              </div>
            </div>

            <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/80 dark:border-slate-700 p-4 shadow-sm">
              <div className="text-xs font-black text-slate-500 dark:text-slate-400">
                全班共同待補強題數（答對率 &lt; 60%）
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
                {classAnalytics.weakQuestionCount} 題
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                可於下方展開誘答分布與學生筆跡
              </div>
            </div>
          </section>

          {/* 視角切換分頁 */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('questions');
                setSelectedStudentKey(null);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 border-2 transition cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-teal-700 border-teal-600 text-white shadow-md'
                  : 'bg-white/90 dark:bg-slate-900/90 border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>各題答題情況與單題計算紙</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 border-2 transition cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-teal-700 border-teal-600 text-white shadow-md'
                  : 'bg-white/90 dark:bg-slate-900/90 border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>各生作答與精熟明細 ({filteredRecords.length})</span>
            </button>
          </div>

          {/* ═══ 分頁 1：各題答題情況與單題計算紙檢視 ═══ */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              {/* 若老師已點選單題，於上方顯著展開「單題各生計算紙總覽面板」 */}
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
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {inspectedQuestion.curriculumCode} / {inspectedQuestion.prioriCode}
                        </span>
                      </div>
                      <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        <MathRichText text={inspectedQuestion.questionText} />
                      </div>
                      <div className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                        {inspectedQuestion.officialAnswerVerified ? '官方標準答案：' : '參考正解：'}
                        {inspectedQuestion.questionType === 'alphabet-pair' ? (
                          <span>{inspectedQuestion.answer}</span>
                        ) : (
                          <>
                            ({inspectedQuestion.answer + 1}){' '}
                            <MathRichText text={inspectedQuestion.options[inspectedQuestion.answer]} />
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectedQuestionId(null)}
                      aria-label="關閉單題計算紙檢視"
                      className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>收合單題檢視</span>
                    </button>
                  </div>

                  {inspectedQuestion.figureImage && (
                    <div className="inline-block bg-white p-2 rounded-2xl border border-stone-200">
                      <img
                        src={inspectedQuestion.figureImage}
                        alt={`第 ${inspectedQuestion.number} 題圖示`}
                        className="max-h-36 w-auto object-contain"
                      />
                    </div>
                  )}

                  {filteredRecords.length === 0 ? (
                    <p className="text-xs font-bold text-slate-500 py-4 text-center">
                      目前篩選條件下尚無學生作答紀錄。
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredRecords.map((stu) => {
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
                                  {formatClassLabel(stu.studentClass)}・{stu.displayName}
                                </span>
                                <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black ${badge.cls}`}>
                                  {badge.shortLabel}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                                    isOk
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-rose-600 text-white'
                                  }`}
                                >
                                  {formatPrioriAnswerLabel(inspectedQuestion, chosen, false)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedStudentKey(stu.studentKey);
                                    setActiveTab('students');
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-[11px] font-black text-teal-700 dark:text-teal-300 hover:bg-teal-50 cursor-pointer"
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

              {/* 25 題全班答題率與誘答分布清單 */}
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
                            <span className="text-[11px] font-mono text-slate-400">
                              {q.prioriCode}
                            </span>
                            {isWeak && (
                              <span className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                共同弱點題
                              </span>
                            )}
                          </div>

                          <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                            <MathRichText text={q.questionText} />
                          </div>

                          {/* 選項誘答人數／聽寫正解與誤答一覽 */}
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
                            onClick={() =>
                              setInspectedQuestionId(isInspected ? null : q.id)
                            }
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

          {/* ═══ 分頁 2：各生作答與精熟明細 ═══ */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              {!inspectedStudent ? (
                filteredRecords.length === 0 ? (
                  <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-stone-200 dark:border-slate-700 p-8 text-center text-xs font-bold text-slate-500">
                    此篩選條件下尚無學生作答紀錄。可開啟上方「🧪 示範班級資料」或先完成一次練習試卷。
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredRecords.map((stu) => {
                      const padCount = Object.values(stu.scratchpad || {}).filter(
                        (arr) => Array.isArray(arr) && arr.length > 0
                      ).length;
                      const wrongCount = Math.max(
                        0,
                        (stu.totalCount || 25) - (stu.correctCount || 0)
                      );

                      return (
                        <div
                          key={stu.studentKey}
                          className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-teal-200/80 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 text-[11px] font-black">
                                  {formatClassLabel(stu.studentClass)}
                                </span>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                  {stu.displayName}
                                </h3>
                                {stu.isDemo ? (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                                    示範
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                                    實測紀錄
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                                練習 {stu.attemptsCount || 1} 次・計算紙留存 {padCount} 題
                              </p>
                            </div>

                            <div className="text-right tabular-nums">
                              <div className="text-xl font-black text-teal-800 dark:text-teal-200">
                                {stu.latestScore ?? stu.score} 分
                              </div>
                              <div className="text-[11px] font-bold text-slate-500">
                                初測 {stu.firstScore ?? stu.score} 分
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-xs font-black tabular-nums">
                              <span className="text-emerald-700 dark:text-emerald-300">
                                🌟 精熟 {stu.masteredCount || 0} / {stu.totalCount || 25} 題
                              </span>
                              <span className="text-rose-600 dark:text-rose-400">
                                待補強 {wrongCount} 題
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudentKey(stu.studentKey);
                                setStudentQuestionFilter('all');
                              }}
                              className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>點閱個人作答與計算紙</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* 單生全卷明細與逐題計算紙面板 */
                <div className="space-y-4 animate-fadeIn">
                  <section className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-teal-300 dark:border-teal-700 p-4 sm:p-5 shadow-md space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentKey(null)}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>回學生名單</span>
                        </button>
                        <div>
                          <h2 className="text-lg font-black text-slate-900 dark:text-white">
                            {formatClassLabel(inspectedStudent.studentClass)}・
                            {inspectedStudent.displayName}
                          </h2>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                            初測 {inspectedStudent.firstScore ?? inspectedStudent.score} 分 → 最新{' '}
                            {inspectedStudent.latestScore ?? inspectedStudent.score} 分・🌟 已精熟{' '}
                            {inspectedStudent.masteredCount || 0} / {inspectedStudent.totalCount || 25} 題
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

                    {/* 題目狀態篩選膠囊 */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-slate-800">
                      {[
                        { id: 'all', label: `全部 (${activePaper.questions.length})` },
                        { id: 'remedial', label: '⚠️ 待補強' },
                        { id: 'progress', label: '🌱 連對 1 次 (差 1 次精熟)' },
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
                      const chosen = inspectedStudent.latestAnswers?.[q.id];
                      const isOk = isPrioriAnswerCorrect(q, chosen);
                      const streak = Number(inspectedStudent.streaks?.[q.id]) || 0;
                      const badge = getStreakBadge(streak);
                      const padStrokes = inspectedStudent.scratchpad?.[q.id] || [];

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
                              <span className="text-[11px] font-mono text-slate-400">
                                {q.prioriCode}
                              </span>
                            </div>

                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                              <MathRichText text={q.questionText} />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs font-black">
                              <span
                                className={
                                  isOk
                                    ? 'text-emerald-700 dark:text-emerald-300'
                                    : 'text-rose-700 dark:text-rose-300'
                                }
                              >
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
              )}
            </div>
          )}
        </>
      )}
      </div>

      {/* 教師後台專用原生列印學習單（含標準／參考正解與已選學生作答紀錄） */}
      <PrioriPrintableSheet
        paper={activePaper}
        questions={activePaper?.questions || []}
        answers={inspectedStudent?.latestAnswers || null}
        showAnswerKey={true}
      />
    </>
  );
}
