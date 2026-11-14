import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Flag,
  Volume2,
  RotateCcw,
  Award,
  BookOpen,
  ClipboardCheck,
  CheckSquare,
  Square,
  Coins,
  AlertCircle,
  Sparkles,
  UserCheck,
  Headphones,
  GraduationCap,
  ChevronRight,
  Clock,
  AlertTriangle,
  X,
  Check,
  Info,
  SlidersHorizontal,
  FileText,
  Type,
  Maximize2
} from 'lucide-react';
import {
  CANONICAL_STATS,
  EXAM_TRACKS,
  TME_PRE_A1_SPEC,
  SAA_EXAM_SPEC,
  HERE_WE_GO_BOOK_META,
  HERE_WE_GO_MCQ_BANK,
  TME_PRE_A1_BANK,
  SAA_EXAM_BANK,
  SAA_ORIGINAL_BANK,
  SAA_115_EXAM_PAPERS,
  SAA_ALL_EXAM_PAPERS
} from '../../data/exam';
import { playDialogueSpeech, stopDialogueSpeech, isDialogue } from '../../services/dialogueSpeaker';
import { useStudent } from '../../context/StudentContext';
import {
  isBookInOwnGrade,
  formatStudentBadge,
  formatStudentDisplayName
} from '../../utils/studentIdHelper';
import {
  recordMcqExamStats,
  recordPreA1MasteryLeaderboard,
  submitStudentQuestionReport
} from '../../services/supabase';
import {
  recordExamMasterySession,
  loadStudentMastery,
  migrateMistakeMapToCanonical,
  MASTERY_STATES
} from '../../utils/masteryHelper';
import { resolveCanonicalId } from '../../data/exam';
import { PreA1MasteryDashboard } from '../../components/exam/PreA1MasteryDashboard';
import {
  assembleExamForm,
  assemblePreA1ExamForm,
  buildFormOutline,
  buildTaskBreakdown,
  getInProgressKey,
  loadInProgress,
  saveInProgress,
  clearInProgress,
  purgeExpiredInProgress,
  getTaskLabel,
  extractTargetToken,
  resolveQuestionTrack
} from './examBlueprint';
import {
  MISTAKE_SOURCE_OPTIONS,
  buildMistakeReviewSequence,
  filterMistakesBySource,
  getMistakeAttemptLimit,
  isMistakeSourceCleared,
  simulateMistakeAttempts
} from './mistakeReview';

const CHOICE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const STUDENT_REPORT_TAGS = [
  { id: 'no_answer', icon: '❌', label: '找不到正確答案（答案似乎不在選項中）' },
  { id: 'image_error', icon: '🖼️', label: '圖片看不到或圖片內容不合' },
  { id: 'audio_error', icon: '🔊', label: '語音沒有聲音或讀音怪怪的' },
  { id: 'typo_error', icon: '✍️', label: '題目或選項有錯字或打錯' },
  { id: 'other_error', icon: '❓', label: '其他問題 / 題目意思怪怪的' }
];
const ALL_BOOK_OPTIONS = ['g1', 'g2', 1, 2, 3, 4, 5, 6, 7, 8, 9];
const formatBookLabel = (bKey) => {
  if (bKey === 'g1') return '1年大寫';
  if (bKey === 'g2') return '2年大小寫';
  if (Number(bKey) === 9) return '國一先修';
  return `第 ${bKey} 冊`;
};

/**
 * 依據學生年級取得預設對應冊別陣列
 */
function getDefaultBooksForGrade(grade) {
  const g = Number(grade) || 0;
  if (g === 1) return ['g1'];
  if (g === 2) return ['g2'];
  if (g === 3) return [1, 2];
  if (g === 4) return [3, 4];
  if (g === 5) return [5, 6];
  if (g === 6) return [7, 8, 9];
  return [1, 2, 3, 4, 5, 6, 7, 8];
}

/**
 * 將 A: ... B: ... 對話題幹自動分行呈現，提升閱讀清晰度
 */
function formatQuestionStem(text) {
  const str = String(text || '').trim();
  if (/\bA:\s*/.test(str) && /\bB:\s*/.test(str)) {
    const parts = str.split(/(?=\bB:\s*)/);
    return (
      <div className="space-y-1.5">
        {parts.map((p, idx) => (
          <div key={idx} className="leading-snug">
            {p.trim()}
          </div>
        ))}
      </div>
    );
  }
  return <div className="leading-snug">{str}</div>;
}

export function PureMcqExamView({ settings, onBack, onComplete }) {
  const { currentStudent, isLoggedIn, addCoins, openModal, coins } = useStudent();

  // 依據學生年級或外部傳入設定決定預設冊別
  const initialBook = useMemo(() => {
    const units = settings?.selectedUnits || [];
    for (const u of units) {
      const m = String(u).match(/Book\s*(\d+)|HWG\s*(\d+)|第\s*(\d+)\s*冊/i);
      if (m) {
        const num = Number(m[1] || m[2] || m[3]);
        if (num >= 1 && num <= 9) return num;
      }
    }
    const gradeBooks = getDefaultBooksForGrade(currentStudent?.grade);
    return gradeBooks[0] || 1;
  }, [settings?.selectedUnits, currentStudent?.grade]);

  // 學生專屬易錯題庫 LocalStorage Key
  const mistakeStorageKey = useMemo(() => {
    const sid = currentStudent?.student_id || currentStudent?.id || 'guest';
    return `wutai_mcq_mistakes_${sid}`;
  }, [currentStudent]);

  // 讀取與儲存個人易錯題池: { [qId]: { wrongCount: number, streak: number, updatedAt: number } }
  // （自動執行 Canonical 遷移，保證舊題號在題庫精簡後 100% 保留且不丟失）
  const [mistakeMap, setMistakeMap] = useState(() => {
    try {
      const raw = localStorage.getItem(mistakeStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      return migrateMistakeMapToCanonical(parsed, mistakeStorageKey);
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(mistakeStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      setMistakeMap(migrateMistakeMapToCanonical(parsed, mistakeStorageKey));
    } catch {
      setMistakeMap({});
    }
  }, [mistakeStorageKey]);

  const saveMistakeMap = useCallback(
    (nextMap) => {
      setMistakeMap(nextMap);
      try {
        localStorage.setItem(mistakeStorageKey, JSON.stringify(nextMap));
      } catch {
        // Ignore storage quota errors
      }
    },
    [mistakeStorageKey]
  );

  // Phase: 'setup' | 'instructions' | 'exam' | 'result'
  const [phase, setPhase] = useState('setup');
  // Setup Sub-View: 'hub' (四大膠囊總覽) | 'textbook' | 'saa' | 'preA1' | 'mistakes'
  const [setupSubView, setSetupSubView] = useState(() => {
    if (settings?.mode === 'mistakes') return 'mistakes';
    return 'hub';
  });
  // Scope Mode: 'curriculum' (課本範圍檢定) | 'ministry-assessment' (學力檢測) | 'tme-preA1' (Pre-A1) | 'mistakes' (個人易錯題複習)
  const [scopeMode, setScopeMode] = useState('curriculum');
  const [selectedBook, setSelectedBook] = useState(initialBook);

  // 課本題型模式: 'comprehensive' (綜合測驗: 聽力+筆試) | 'written' (純筆試: 避開聽力) | 'listening' (純聽力特訓)
  const [textbookExamMode, setTextbookExamMode] = useState(() => {
    if (initialBook === 'g1' || initialBook === 'g2') return 'written';
    return 'comprehensive';
  });
  // 單元範圍快選標籤: 'midterm' (上半冊) | 'final' (下半冊) | 'all' (全冊) | 'custom' (自選)
  const [rangePreset, setRangePreset] = useState(() => {
    if (initialBook === 'g1' || initialBook === 'g2') return 'all';
    return 'midterm';
  });
  const [isCustomUnitOpen, setIsCustomUnitOpen] = useState(false);
  const [isPlayingAudioTest, setIsPlayingAudioTest] = useState(false);

  const [selectedUnits, setSelectedUnits] = useState(() => {
    const meta = HERE_WE_GO_BOOK_META[initialBook];
    if (!meta) return [];
    if (initialBook === 'g1' || initialBook === 'g2') return [...meta.units];
    return meta.units.filter((u) => ['Starter', 'Unit 1', 'Unit 2', 'Review 1'].includes(u));
  });
  // 測驗題數選項: 10 | 20 | 50
  const [questionCountOpt, setQuestionCountOpt] = useState(20);
  // 四聯階梯布題台逐步引導狀態 (1: 冊別, 2: 範圍, 3: 型態, 4: 題數)
  const [activeBoardStep, setActiveBoardStep] = useState(1);
  const [maxReachedBoardStep, setMaxReachedBoardStep] = useState(1);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // 學力檢測 (SAA) 設定
  const defaultSaaGrade = useMemo(() => {
    const g = Number(currentStudent?.grade) || 0;
    return g >= 4 && g <= 6 ? g : 4;
  }, [currentStudent?.grade]);
  const [selectedSaaGrade, setSelectedSaaGrade] = useState(defaultSaaGrade);
  // SAA 題源：官方考古題與自主研發類題嚴格分流，不交叉抽題。
  const [selectedSaaSource, setSelectedSaaSource] = useState('official');
  // SAA 官方測驗年度: 115 | 114 | 113
  const [selectedSaaYear, setSelectedSaaYear] = useState(115);
  // SAA 題型組合: 'standard' (聽15+閱20) | 'listening' (聽20) | 'reading' (閱20)
  const [selectedSaaFormat, setSelectedSaaFormat] = useState('standard');
  // SAA 響應式 Wizard：1 年級 → 2 題源 → 3 官方年度／原創組卷模式
  const [saaWizardStep, setSaaWizardStep] = useState(1);

  // Pre-A1 設定: 'standard' (聽15+閱15) | 'listening' (聽20) | 'reading' (閱20)
  const [selectedPreA1Format, setSelectedPreA1Format] = useState('standard');
  // 正式施測模式 (30題 • 限時35分 • 雙次聽力播音 • 分母300題)
  const [isFormalExam, setIsFormalExam] = useState(false);
  // 易錯題入口：題數代表最多作答次數；題目不足時不以一般題補滿。
  const [mistakeSource, setMistakeSource] = useState('all');
  const [mistakeAttemptLimit, setMistakeAttemptLimit] = useState(10);
  const [masteryInitialTrack, setMasteryInitialTrack] = useState('tme-preA1');
  const finalizeExamRef = useRef(null);

  const isSelectedBookOwnGrade = useMemo(() => {
    return isBookInOwnGrade(
      String(selectedBook),
      currentStudent?.grade,
      'mcq-exam'
    );
  }, [selectedBook, currentStudent?.grade]);

  // 一、二年級語音輔助判斷（冊別為 g1/g2，或低年級學生且進行課本單元檢定）
  const isEarlyGrade = useMemo(() => {
    return (
      selectedBook === 'g1' ||
      selectedBook === 'g2' ||
      (scopeMode === 'curriculum' && Number(currentStudent?.grade) <= 2)
    );
  }, [selectedBook, scopeMode, currentStudent?.grade]);
  const [autoReadEarlyGrade, setAutoReadEarlyGrade] = useState(true);
  const [isSpeakingStem, setIsSpeakingStem] = useState(false);

  // In-Progress Snapshot Key & State (6 小時內有效)
  const inProgressKey = useMemo(() => getInProgressKey(currentStudent), [currentStudent]);
  const [savedSession, setSavedSession] = useState(null);

  // Exam Runtime States
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qIndex]: choiceIdx }
  const [flagged, setFlagged] = useState({}); // { [qIndex]: boolean }
  const [startTime, setStartTime] = useState(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [showUnansweredConfirm, setShowUnansweredConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Result & Review States (單頁翻頁檢視，免上下捲動)
  const [reviewFilter, setReviewFilter] = useState('wrong'); // 'wrong' | 'all'
  const [reviewPageIndex, setReviewPageIndex] = useState(0);
  const [taskBreakdown, setTaskBreakdown] = useState([]);
  const [sessionRewardInfo, setSessionRewardInfo] = useState({
    coinsEarned: 0,
    reason: '',
    eligible: false,
    graduatedCount: 0,
    addedMistakeCount: 0,
    earlyCleared: false,
    clearedSource: false,
    attemptLimit: null
  });
  const hasAwardedCoinsRef = useRef(false);
  const hasFinalizedRef = useRef(false);

  // 學生試題疑義回報狀態 (僅在非正式練習開放)
  const [reportedQuestions, setReportedQuestions] = useState({}); // { [qId]: boolean }
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingQuestion, setReportingQuestion] = useState(null);
  const [selectedReportTag, setSelectedReportTag] = useState('no_answer');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportToastMessage, setReportToastMessage] = useState(null);
  const [zoomedMaterial, setZoomedMaterial] = useState(null);
  const [isPlayingOfficialAudio, setIsPlayingOfficialAudio] = useState(false);
  const [audioPlaybackMode, setAudioPlaybackMode] = useState(null); // null | 'official' | 'fallback'
  const officialAudioRef = useRef(null);
  const officialAudioTimerRef = useRef(null);
  const officialAudioPreloadRef = useRef(new Map());

  const handleOpenReportModal = useCallback((question) => {
    if (!question) return;
    setReportingQuestion(question);
    setSelectedReportTag('no_answer');
    setShowReportModal(true);
  }, []);

  const handleSubmitReport = useCallback(async () => {
    if (!reportingQuestion || isSubmittingReport) return;
    const chosen = STUDENT_REPORT_TAGS.find((t) => t.id === selectedReportTag) || STUDENT_REPORT_TAGS[0];
    setIsSubmittingReport(true);

    try {
      const res = await submitStudentQuestionReport({
        questionId: reportingQuestion.id,
        track: scopeMode,
        book: reportingQuestion.book || selectedBook,
        tag: chosen.id,
        label: chosen.label,
        studentId: currentStudent?.student_id || currentStudent?.id || 'guest',
        studentName: formatStudentDisplayName(currentStudent) || '冒險家'
      });

      setShowReportModal(false);
      if (res && res.success === false) {
        setReportToastMessage('試題回報送出失敗，請檢查網路連線或稍後再試。');
      } else {
        setReportedQuestions((prev) => ({
          ...prev,
          [reportingQuestion.id]: true
        }));
        setReportToastMessage('感謝你的回報！老師會盡快為大家檢查這題 ❤️');
      }
      setTimeout(() => {
        setReportToastMessage(null);
      }, 3500);
    } catch (err) {
      console.warn('Failed to submit report', err);
      setShowReportModal(false);
      setReportToastMessage('試題回報送出失敗，請檢查網路連線或稍後再試。');
      setTimeout(() => {
        setReportToastMessage(null);
      }, 3500);
    } finally {
      setIsSubmittingReport(false);
      setReportingQuestion(null);
    }
  }, [reportingQuestion, isSubmittingReport, selectedReportTag, scopeMode, selectedBook, currentStudent]);

  // 載入時清理過期快照並檢查是否有未完檢定
  useEffect(() => {
    purgeExpiredInProgress();
    const snap = loadInProgress(inProgressKey);
    if (snap && Array.isArray(snap.questions) && snap.questions.length > 0) {
      setSavedSession(snap);
    }
  }, [inProgressKey]);

  // 切換範圍快捷設定
  const applyRangePreset = useCallback((preset, bookKey = selectedBook, advance = true) => {
    setRangePreset(preset);
    if (advance) {
      setActiveBoardStep(3);
      setMaxReachedBoardStep((prev) => Math.max(prev, 3));
    }
    const meta = HERE_WE_GO_BOOK_META[bookKey];
    if (!meta) return;
    if (bookKey === 'g1' || bookKey === 'g2') {
      setSelectedUnits([...meta.units]);
      return;
    }
    if (preset === 'midterm') {
      setSelectedUnits(meta.units.filter((u) => ['Starter', 'Unit 1', 'Unit 2', 'Review 1'].includes(u)));
    } else if (preset === 'final') {
      setSelectedUnits(meta.units.filter((u) => ['Unit 3', 'Unit 4', 'Review 2', 'Festival'].includes(u)));
    } else if (preset === 'all') {
      setSelectedUnits([...meta.units]);
    }
  }, [selectedBook]);

  // 當學生登入身分或年級變更時，自動同步預設冊別
  useEffect(() => {
    setSelectedBook(initialBook);
    if (initialBook === 'g1' || initialBook === 'g2') {
      setRangePreset('all');
      setSelectedUnits(HERE_WE_GO_BOOK_META[initialBook]?.units || []);
      setTextbookExamMode('written');
    } else {
      setRangePreset('midterm');
      const meta = HERE_WE_GO_BOOK_META[initialBook];
      if (meta) {
        setSelectedUnits(meta.units.filter((u) => ['Starter', 'Unit 1', 'Unit 2', 'Review 1'].includes(u)));
      }
    }
  }, [initialBook]);

  // 切換冊別時智慧分流
  const handleSelectBook = useCallback((bookNum) => {
    setSelectedBook(bookNum);
    setActiveBoardStep(2);
    setMaxReachedBoardStep((prev) => Math.max(prev, 2));
    if (bookNum === 'g1' || bookNum === 'g2') {
      setRangePreset('all');
      setSelectedUnits(HERE_WE_GO_BOOK_META[bookNum]?.units || []);
      setTextbookExamMode('written');
    } else {
      const preset = rangePreset === 'custom' ? 'midterm' : rangePreset;
      applyRangePreset(preset, bookNum, false);
    }
  }, [rangePreset, applyRangePreset]);

  const toggleUnit = (unitName) => {
    setSelectedUnits((prev) =>
      prev.includes(unitName) ? prev.filter((u) => u !== unitName) : [...prev, unitName]
    );
  };

  // 課本範圍可用題庫（依 canonicalId 天然去重，杜絕同一題目在組卷中重複出現，並無縫支援 Review 跨單元 scopes）
  const curriculumPool = useMemo(() => {
    const seen = new Set();
    const pool = [];
    for (const q of HERE_WE_GO_MCQ_BANK) {
      if (q.book !== selectedBook) continue;
      const inScope = (selectedUnits || []).includes(q.unit) ||
        (Array.isArray(q.scopes) && q.scopes.some((s) => (selectedUnits || []).includes(s)));
      if (!inScope) continue;
      const cId = q.canonicalId || q.id;
      if (!seen.has(cId)) {
        seen.add(cId);
        pool.push(q);
      }
    }
    return pool;
  }, [selectedBook, selectedUnits]);

  // 個人易錯題列表（雙向相容舊題號與 Canonical 題號，全題庫跨軌道檢索）
  const mistakeQuestions = useMemo(() => {
    const mistakeKeys = Object.keys(mistakeMap || {});
    if (mistakeKeys.length === 0) return [];
    const ids = new Set(mistakeKeys.flatMap((k) => [k, resolveCanonicalId(k)]));
    const seen = new Set();
    const list = [];
    const allBanks = [...HERE_WE_GO_MCQ_BANK, ...SAA_EXAM_BANK, ...TME_PRE_A1_BANK];
    for (const q of allBanks) {
      const cId = q.canonicalId || q.id;
      if (ids.has(q.id) || ids.has(cId)) {
        if (!seen.has(cId)) {
          seen.add(cId);
          list.push({
            ...q,
            sourceTrack: q.sourceTrack || resolveQuestionTrack(q)
          });
        }
      }
    }
    return list;
  }, [mistakeMap]);

  const filteredMistakeQuestions = useMemo(
    () => filterMistakesBySource(mistakeQuestions, mistakeSource),
    [mistakeQuestions, mistakeSource]
  );

  const mistakeSourceCounts = useMemo(() => ({
    all: mistakeQuestions.length,
    curriculum: filterMistakesBySource(mistakeQuestions, 'curriculum').length,
    'ministry-assessment': filterMistakesBySource(mistakeQuestions, 'ministry-assessment').length,
    'tme-preA1': filterMistakesBySource(mistakeQuestions, 'tme-preA1').length
  }), [mistakeQuestions]);

  const effectiveMistakeAttemptLimit = useMemo(
    () => getMistakeAttemptLimit(mistakeAttemptLimit, filteredMistakeQuestions.length),
    [mistakeAttemptLimit, filteredMistakeQuestions.length]
  );

  // Pre-A1 官方模擬題庫 (Scaffold & Registry)
  const tmePool = useMemo(() => {
    if (selectedPreA1Format === 'listening') {
      return TME_PRE_A1_BANK.filter((q) => q.category === 'listening' || q.taskType?.startsWith('L-'));
    }
    if (selectedPreA1Format === 'reading') {
      return TME_PRE_A1_BANK.filter((q) => q.category === 'reading' || q.taskType?.startsWith('R-') || q.taskType?.startsWith('V-'));
    }
    return TME_PRE_A1_BANK;
  }, [selectedPreA1Format]);

  // 縣市學力檢測 (SAA) 題庫 (Scaffold & Registry)
  const saaPool = useMemo(() => {
    const g = Number(selectedSaaGrade) || 4;
    if (selectedSaaSource === 'official') {
      const y = Number(selectedSaaYear) || 115;
      const paper = SAA_ALL_EXAM_PAPERS?.[y]?.[g] || SAA_115_EXAM_PAPERS[g];
      return paper?.questions || [];
    }
    let list = SAA_ORIGINAL_BANK.filter((q) => !q.targetGrade || q.targetGrade === g);
    if (selectedSaaFormat === 'listening') {
      list = list.filter((q) => q.section === 'listening' || q.type?.startsWith('L-') || q.taskType?.startsWith('L-') || q.taskType?.startsWith('A-'));
    } else if (selectedSaaFormat === 'reading') {
      list = list.filter((q) => q.section === 'reading' || q.type?.startsWith('R-') || q.taskType?.startsWith('R-') || q.taskType?.startsWith('V-') || q.taskType?.startsWith('G-'));
    }
    return list;
  }, [selectedSaaGrade, selectedSaaFormat, selectedSaaSource, selectedSaaYear]);

  // 計時器（若為正式施測模式則限時 35 分鐘 2100 秒，逾時自動交卷）
  useEffect(() => {
    if (phase !== 'exam' || !startTime) return;
    const timer = setInterval(() => {
      const cur = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSec(cur);
      if (isFormalExam && cur >= 2100) {
        clearInterval(timer);
        finalizeExamRef.current?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, startTime, isFormalExam]);

  // 作答中自動保存進度至 LocalStorage（6小時內有效，維護健康回應機制與防作弊防逾時）
  useEffect(() => {
    if (phase === 'exam' && questions.length > 0 && startTime) {
      saveInProgress(inProgressKey, {
        startedAt: startTime,
        deadlineAt: isFormalExam ? (startTime + 2100 * 1000) : null,
        isFormalExam: Boolean(isFormalExam),
        questions,
        answers,
        flagged,
        currentIndex,
        elapsedSec,
        selectedBook,
        scopeMode,
        questionCountOpt,
        mistakeSource,
        mistakeAttemptLimit,
        selectedPreA1Format,
        selectedSaaFormat,
        selectedSaaGrade,
        selectedSaaSource,
        selectedSaaYear,
        selectedUnits,
        textbookExamMode
      });
    }
  }, [
    phase,
    questions,
    answers,
    flagged,
    currentIndex,
    elapsedSec,
    inProgressKey,
    startTime,
    isFormalExam,
    selectedBook,
    scopeMode,
    questionCountOpt,
    mistakeSource,
    mistakeAttemptLimit,
    selectedPreA1Format,
    selectedSaaFormat,
    selectedSaaGrade,
    selectedSaaSource,
    selectedSaaYear,
    selectedUnits,
    textbookExamMode
  ]);

  // 若在成績單頁面剛登入，自動補發當次應得金幣
  useEffect(() => {
    if (
      phase === 'result' &&
      isLoggedIn &&
      sessionRewardInfo.coinsEarned > 0 &&
      !hasAwardedCoinsRef.current
    ) {
      hasAwardedCoinsRef.current = true;
      addCoins(sessionRewardInfo.coinsEarned);
    }
  }, [phase, isLoggedIn, sessionRewardInfo.coinsEarned, addCoins]);

  // 組建測驗題目並啟動測驗
  const startExamSession = useCallback(
    (customPool = null, customTargetCount = null, skipInstructions = false) => {
      let targetCount = Number(customTargetCount) || 20;
      let sourceList = [];

      if (customPool && Array.isArray(customPool) && customPool.length > 0) {
        sourceList = customTargetCount ? [...customPool].slice(0, Number(customTargetCount)) : [...customPool];
      } else if (scopeMode === 'tme-preA1') {
        targetCount = isFormalExam || selectedPreA1Format === 'standard' ? 30 : 20;
        if (isFormalExam || selectedPreA1Format === 'standard') {
          sourceList = assemblePreA1ExamForm(tmePool, targetCount);
        } else {
          sourceList = assembleExamForm(tmePool, targetCount);
        }
      } else if (scopeMode === 'ministry-assessment') {
        if (selectedSaaSource === 'official') {
          targetCount = 35;
          sourceList = [...saaPool].slice(0, 35);
        } else if (selectedSaaFormat === 'standard') {
          targetCount = Math.min(35, saaPool.length);
          sourceList = assembleExamForm(saaPool, targetCount);
        } else {
          const reqCount = 20;
          targetCount = Math.min(reqCount, saaPool.length);
          sourceList = assembleExamForm(saaPool, targetCount);
        }
      } else if (scopeMode === 'mistakes') {
        targetCount = effectiveMistakeAttemptLimit;
        sourceList = buildMistakeReviewSequence(
          filteredMistakeQuestions,
          mistakeMap,
          targetCount
        );
      } else {
        targetCount = Number(questionCountOpt) || 20;
        let pool = curriculumPool;
        const isG1G2 = selectedBook === 'g1' || selectedBook === 'g2';

        if (!isG1G2) {
          if (textbookExamMode === 'written') {
            // 純讀寫筆試：完全避開聽力
            pool = pool.filter((q) => !q.media?.audioText && !q.taskType?.startsWith('L-'));
          } else if (textbookExamMode === 'listening') {
            // 純聽力特訓：將對話題與單字題動態轉換為聽力播放題
            pool = pool.map((q) => {
              if (q.taskType === 'G-DLG') {
                return {
                  ...q,
                  taskType: 'L-RESP',
                  section: 'listening',
                  media: { audioText: q.question.replace(/\s*______\s*/g, ' ... ') },
                  question: '請聽語音對話或問句，選出最適當的回應：'
                };
              }
              if (q.taskType === 'V-MEAN') {
                const token = extractTargetToken(q) || (Array.isArray(q.options) ? q.options[q.answer] : '');
                return {
                  ...q,
                  taskType: 'L-WORD',
                  section: 'listening',
                  media: { audioText: token },
                  question: '請聽發音，選出正確的中文意思：'
                };
              }
              return q;
            }).filter((q) => q.media?.audioText || q.taskType?.startsWith('L-'));
          } else {
            // 綜合測驗 (段考標準)：約 25%~35% 聽力 + 70% 讀寫筆試
            let audioCount = 0;
            const maxAudio = Math.max(2, Math.round(targetCount * 0.3));
            pool = pool.map((q) => {
              if (q.taskType === 'G-DLG' && audioCount < maxAudio * 3) {
                audioCount++;
                return {
                  ...q,
                  taskType: 'L-RESP',
                  section: 'listening',
                  media: { audioText: q.question.replace(/\s*______\s*/g, ' ... ') },
                  question: '請聽語音對話或問句，選出最適當的回應：'
                };
              }
              return q;
            });
          }
        }

        // 使用專業語言測驗組卷藍圖：按大題順序排布、難度遞增、題組不拆散
        sourceList = assembleExamForm(pool, targetCount);
      }

      if (sourceList.length === 0) return;

      // 動態誘答項抽樣與選項隨機洗牌：
      // 1. 若題目具 preserveOptionOrder 或是非題，保留原順序
      // 2. 若 options 數量超過目標選項數（預設 4 選項），從誘答項池動態隨機抽取 (targetCount - 1) 個，與唯一正確答案組合成目標數量的答項 (Dynamic Distractor Sampling)
      // 3. 選項文字與 optionImages 成對綁定同步抽樣與 Fisher-Yates 隨機洗牌
      const prepared = sourceList.map((q) => {
        const isTrueFalse = q.subType === 'read-truefalse' || (q.options?.length === 2 && (q.options[0]?.includes('True') || q.options[0]?.includes('相符')));
        if (q.preserveOptionOrder || isTrueFalse) {
          return {
            ...q,
            options: [...q.options],
            optionImages: q.optionImages ? [...q.optionImages] : undefined,
            optionAltTexts: q.optionAltTexts ? [...q.optionAltTexts] : undefined,
            answer: q.answer
          };
        }

        const hasOptionImages = Array.isArray(q.optionImages) && q.optionImages.length === q.options.length;
        const hasOptionAltTexts = Array.isArray(q.optionAltTexts) && q.optionAltTexts.length === q.options.length;
        const combined = q.options.map((text, idx) => ({
          text,
          img: hasOptionImages ? q.optionImages[idx] : null,
          alt: hasOptionAltTexts ? q.optionAltTexts[idx] : null,
          isCorrect: idx === q.answer
        }));

        // 目標呈現選項數（預設 4，若原選項長度 <= 4 則維持原選項長度；亦可由題目自定義 targetOptionCount）
        const targetCount = Math.max(2, Math.min(combined.length, q.targetOptionCount || (combined.length <= 4 ? combined.length : 4)));

        let workingSet = combined;
        // 若選項總數超過目標呈現數，啟動動態誘答項抽樣 (Dynamic Distractor Sampling: 1 正解 + C(n, k) 誘答)
        if (combined.length > targetCount) {
          const correctItem = combined.find((c) => c.isCorrect) || combined[0];
          const distractorPool = combined.filter((c) => !c.isCorrect);

          // 對誘答項池進行隨機洗牌後抽取需要的數量 (targetCount - 1)
          for (let i = distractorPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [distractorPool[i], distractorPool[j]] = [distractorPool[j], distractorPool[i]];
          }
          const sampledDistractors = distractorPool.slice(0, targetCount - 1);
          workingSet = [correctItem, ...sampledDistractors];
        }

        // Fisher-Yates 隨機洗牌工作集合
        for (let i = workingSet.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [workingSet[i], workingSet[j]] = [workingSet[j], workingSet[i]];
        }

        return {
          ...q,
          options: workingSet.map((c, idx) => {
            // 若為圖片選項且文字為通用圖片標籤，同步重新格式化為當前對應標籤
            if (hasOptionImages && (/^圖片\s*\([A-Z0-9]\)$/.test(c.text) || /^選項\s*\([A-Z0-9]\)$/.test(c.text))) {
              return `圖片 (${CHOICE_LABELS[idx] || idx + 1})`;
            }
            return c.text;
          }),
          optionImages: hasOptionImages ? workingSet.map((c) => c.img) : q.optionImages,
          optionAltTexts: hasOptionAltTexts ? workingSet.map((c) => c.alt) : q.optionAltTexts,
          answer: workingSet.findIndex((c) => c.isCorrect)
        };
      });

      hasAwardedCoinsRef.current = false;
      hasFinalizedRef.current = false;
      setQuestions(prepared);
      setCurrentIndex(0);
      setAnswers({});
      setFlagged({});
      setShowUnansweredConfirm(false);
      setShowExitConfirm(false);

      if (skipInstructions || customPool) {
        setStartTime(Date.now());
        setElapsedSec(0);
        setPhase('exam');
      } else {
        setPhase('instructions');
      }
    },
    [
      questionCountOpt,
      scopeMode,
      selectedSaaFormat,
      selectedSaaSource,
      selectedPreA1Format,
      isFormalExam,
      filteredMistakeQuestions,
      effectiveMistakeAttemptLimit,
      mistakeMap,
      curriculumPool,
      tmePool,
      saaPool,
      textbookExamMode,
      selectedBook
    ]
  );

  // 語音朗讀題幹（支援多角色對話男女聲；一、二年級中文題幹自動使用 zh-TW 語音讀題；三～六年級英文題幹使用 en-US 朗讀；支援正式檢定雙次播放協定）
  const speakQuestion = useCallback((text, repeatTimes = 1) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const raw = String(text || '');
      const hasChinese = /[\u4e00-\u9fa5]/.test(raw);
      if (!hasChinese && isDialogue(raw)) {
        playDialogueSpeech({ text: raw });
        return;
      }
      window.speechSynthesis.cancel();
      const clean = raw
        .replace(/_{2,}/g, hasChinese ? ' 空格 ' : ' blank ')
        .replace(/[「」『』]/g, ' ')
        .replace(/\bA:\s*/g, '')
        .replace(/\bB:\s*/g, '');
      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = hasChinese ? 'zh-TW' : 'en-US';
      utter.rate = hasChinese ? 0.86 : 0.9;

      if (window.speechSynthesis.getVoices) {
        const voices = window.speechSynthesis.getVoices() || [];
        if (hasChinese) {
          const zhVoices = voices.filter((v) => (v?.lang || '').toLowerCase().replace('_', '-').startsWith('zh'));
          const twVoice = zhVoices.find((v) => (v?.lang || '').toLowerCase().replace('_', '-').startsWith('zh-tw')) || zhVoices[0];
          if (twVoice) utter.voice = twVoice;
        } else {
          const enVoices = voices.filter((v) => (v?.lang || '').toLowerCase().replace('_', '-').startsWith('en'));
          const usVoice = enVoices.find((v) => (v?.lang || '').toLowerCase().replace('_', '-').startsWith('en-us')) || enVoices[0];
          if (usVoice) utter.voice = usVoice;
        }
      }

      utter.onstart = () => setIsSpeakingStem(true);
      utter.onend = () => {
        setIsSpeakingStem(false);
        if (repeatTimes > 1) {
          setTimeout(() => {
            try {
              const utter2 = new SpeechSynthesisUtterance(clean);
              utter2.lang = hasChinese ? 'zh-TW' : 'en-US';
              utter2.rate = hasChinese ? 0.86 : 0.9;
              if (utter.voice) utter2.voice = utter.voice;
              utter2.onstart = () => setIsSpeakingStem(true);
              utter2.onend = () => setIsSpeakingStem(false);
              utter2.onerror = () => setIsSpeakingStem(false);
              window.speechSynthesis.speak(utter2);
            } catch {
              setIsSpeakingStem(false);
            }
          }, 2000);
        }
      };
      utter.onerror = () => setIsSpeakingStem(false);

      window.speechSynthesis.speak(utter);
    } catch {
      setIsSpeakingStem(false);
    }
  }, []);

  const stopOfficialAudio = useCallback(() => {
    if (officialAudioTimerRef.current) {
      clearTimeout(officialAudioTimerRef.current);
      officialAudioTimerRef.current = null;
    }
    const audio = officialAudioRef.current;
    if (audio) {
      audio.onloadedmetadata = null;
      audio.ontimeupdate = null;
      audio.onended = null;
      audio.onerror = null;
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch {}
      officialAudioRef.current = null;
    }
    setIsPlayingOfficialAudio(false);
  }, []);

  const playOfficialAudio = useCallback((media, repeatTimes = 1) => {
    if (typeof window === 'undefined' || !media?.audioSrc) return false;
    stopOfficialAudio();
    stopDialogueSpeech();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const audio = new Audio(media.audioSrc);
    const clipStart = Number(media.clipStart) || 0;
    const clipEnd = Number(media.clipEnd) || Number.POSITIVE_INFINITY;
    let remaining = Math.max(1, Number(repeatTimes) || 1);
    let finishing = false;
    officialAudioRef.current = audio;
    audio.preload = 'auto';

    const finishPass = () => {
      if (finishing) return;
      finishing = true;
      audio.pause();
      remaining -= 1;
      if (remaining > 0) {
        officialAudioTimerRef.current = setTimeout(() => {
          finishing = false;
          audio.currentTime = clipStart;
          audio.play().catch(() => {
            stopOfficialAudio();
            speakQuestion(media.audioText || '', 1);
          });
        }, 1600);
      } else {
        stopOfficialAudio();
        setIsSpeakingStem(false);
      }
    };

    audio.ontimeupdate = () => {
      if (audio.currentTime >= clipEnd) finishPass();
    };
    audio.onended = finishPass;
    audio.onerror = () => {
      stopOfficialAudio();
      setAudioPlaybackMode('fallback');
      speakQuestion(media.audioText || '', repeatTimes);
    };
    audio.onloadedmetadata = () => {
      audio.currentTime = clipStart;
      setAudioPlaybackMode('official');
      setIsPlayingOfficialAudio(true);
      setIsSpeakingStem(true);
      audio.play().catch(() => {
        stopOfficialAudio();
        setAudioPlaybackMode('fallback');
        speakQuestion(media.audioText || '', repeatTimes);
      });
    };
    return true;
  }, [speakQuestion, stopOfficialAudio]);

  const playQuestionAudio = useCallback((question, repeatTimes = 1) => {
    if (question?.media?.audioSrc) {
      playOfficialAudio(question.media, repeatTimes);
      return;
    }
    speakQuestion(question?.media?.audioText || question?.question || '', repeatTimes);
  }, [playOfficialAudio, speakQuestion]);

  const stopQuestionSpeech = useCallback(() => {
    stopOfficialAudio();
    stopDialogueSpeech();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setIsSpeakingStem(false);
    setAudioPlaybackMode(null);
  }, [stopOfficialAudio]);

  // Official recordings are split into small per-question files. Preload only the
  // current and next item (current only on Save-Data/2G) so playback starts quickly
  // without downloading an entire paper up front.
  useEffect(() => {
    if (phase !== 'exam' || typeof window === 'undefined' || typeof Audio === 'undefined') return;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const constrained = Boolean(connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || ''));
    const candidateIndexes = constrained ? [currentIndex] : [currentIndex, currentIndex + 1];

    candidateIndexes.forEach((index) => {
      const src = questions[index]?.media?.audioSrc;
      if (!src || officialAudioPreloadRef.current.has(src)) return;
      const preloadAudio = new Audio();
      preloadAudio.preload = 'auto';
      preloadAudio.src = src;
      preloadAudio.load();
      officialAudioPreloadRef.current.set(src, preloadAudio);
    });
  }, [phase, currentIndex, questions]);

  // 切換題目時停止上一題朗讀，若為一二年級且啟用自動朗讀則自動念出中文題目
  useEffect(() => {
    stopQuestionSpeech();
    if (phase === 'exam' && isEarlyGrade && autoReadEarlyGrade && questions[currentIndex]) {
      const timer = setTimeout(() => {
        speakQuestion(questions[currentIndex].media?.audioText || questions[currentIndex].question);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, phase, isEarlyGrade, autoReadEarlyGrade, questions, speakQuestion, stopQuestionSpeech]);

  useEffect(() => {
    return () => {
      stopQuestionSpeech();
    };
  }, [stopQuestionSpeech]);

  useEffect(() => {
    if (!zoomedMaterial || typeof window === 'undefined') return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setZoomedMaterial(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedMaterial]);

  // 第 0 頁考前音量測試發音
  const runAudioTest = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setIsPlayingAudioTest(true);
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance('Welcome to the Wutai English Test. Can you hear me clearly? Testing one, two, three.');
      utter.lang = 'en-US';
      utter.rate = 0.9;
      const voices = window.speechSynthesis.getVoices() || [];
      const enVoices = voices.filter(v => (v?.lang || '').toLowerCase().replace('_', '-').startsWith('en'));
      const usVoice = enVoices.find(v => (v?.lang || '').toLowerCase().replace('_', '-').startsWith('en-us')) || enVoices[0];
      if (usVoice) utter.voice = usVoice;
      utter.onend = () => setIsPlayingAudioTest(false);
      utter.onerror = () => setIsPlayingAudioTest(false);
      window.speechSynthesis.speak(utter);
    } catch {
      setIsPlayingAudioTest(false);
    }
  }, []);

  // 第 0 頁沒帶耳機時，一鍵切換純筆試並即時重組
  const switchToWrittenMode = useCallback(() => {
    setTextbookExamMode('written');
    const pool = curriculumPool.filter((q) => !q.media?.audioText && !q.taskType?.startsWith('L-'));
    const sourceList = assembleExamForm(pool, Number(questionCountOpt) || 20);
    const prepared = sourceList.map((q) => {
      const isTrueFalse = q.subType === 'read-truefalse' || (q.options?.length === 2 && (q.options[0]?.includes('True') || q.options[0]?.includes('相符')));
      if (q.preserveOptionOrder || isTrueFalse) return { ...q };
      const rawOptions = Array.isArray(q.options) ? [...q.options] : [];
      if (rawOptions.length <= 4) return { ...q };
      const correctOpt = rawOptions[0];
      const distractors = rawOptions.slice(1);
      for (let i = distractors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
      }
      const chosenDistractors = distractors.slice(0, 3);
      const workingSet = [correctOpt, ...chosenDistractors];
      const indices = [0, 1, 2, 3];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const shuffledOptions = indices.map((idx) => workingSet[idx]);
      const newAnswer = indices.indexOf(0);
      return { ...q, options: shuffledOptions, answer: newAnswer };
    });
    setQuestions(prepared);
  }, [curriculumPool, questionCountOpt]);

  // 正式施測模式：進入聽力試題時自動觸發雙次朗讀協定（間隔 2 秒播放兩遍）
  useEffect(() => {
    if (phase !== 'exam' || !isFormalExam) return;
    const curQ = questions[currentIndex];
    if (!curQ) return;
    const isListening =
      curQ.category === 'listening' ||
      curQ.section === 'listening' ||
      curQ.taskType?.startsWith('L-') ||
      curQ.taskType?.startsWith('A-') ||
      curQ.subType?.startsWith('listen-') ||
      curQ.taskType === 'V-AUDIO-WORD' ||
      curQ.taskType === 'V-AUDIO-PIC' ||
      Boolean(curQ.media?.audioText);
    if (isListening) {
      const timer = setTimeout(() => {
        // Official recordings already contain the mandated repeat; TTS fallback repeats twice.
        playQuestionAudio(curQ, curQ.media?.audioSrc ? 1 : 2);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, currentIndex, isFormalExam, questions, playQuestionAudio]);

  // 點選選項（純粹記錄作答，無遊戲音效）
  const handleSelectOption = (optIdx) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
  };

  const toggleFlagCurrent = () => {
    setFlagged((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
  };

  // 交卷結算：更新易錯題池＋計算金幣獎勵＋同步三大累計排行榜 (測驗王、勤學王、精準王)
  const finalizeExam = useCallback((overridePayload = null) => {
    if (hasFinalizedRef.current) return;
    hasFinalizedRef.current = true;

    const targetQuestions = overridePayload?.questions || questions;
    const targetAnswers = overridePayload?.answers || answers;
    const targetScopeMode = overridePayload?.scopeMode || scopeMode;
    const targetSelectedBook = overridePayload?.selectedBook || selectedBook;
    const targetIsFormal = overridePayload?.isFormal !== undefined ? overridePayload.isFormal : isFormalExam;
    const targetPreA1Format = overridePayload?.selectedPreA1Format || selectedPreA1Format;
    const targetElapsedSec = overridePayload?.elapsedSec !== undefined ? overridePayload.elapsedSec : elapsedSec;
    const targetEarlyCleared = Boolean(overridePayload?.earlyCleared);

    if (overridePayload?.questions) setQuestions(targetQuestions);
    if (overridePayload?.answers) setAnswers(targetAnswers);

    let correctCount = 0;
    const nextMistakes = { ...mistakeMap };
    let graduatedCount = 0;
    let addedMistakeCount = 0;

    targetQuestions.forEach((q, idx) => {
      const isRight = targetAnswers[idx] === q.answer;
      const targetId = resolveCanonicalId(q.canonicalId || q.id);
      if (isRight) {
        correctCount++;
        // 在「個人易錯題複習」模式中答對既有易錯題：連續答對次數 +1，達 2 次即移出易錯池
        if (targetScopeMode === 'mistakes' && (nextMistakes[targetId] || nextMistakes[q.id])) {
          const currentRec = nextMistakes[targetId] || nextMistakes[q.id];
          const nextStreak = (currentRec.streak || 0) + 1;
          if (nextStreak >= 2) {
            delete nextMistakes[targetId];
            delete nextMistakes[q.id];
            graduatedCount++;
          } else {
            delete nextMistakes[q.id];
            nextMistakes[targetId] = {
              ...currentRec,
              streak: nextStreak,
              updatedAt: Date.now()
            };
          }
        }
      } else {
        // 答錯：加入易錯池並將連續答對紀錄歸零（以 Canonical ID 統一索引）
        if (!nextMistakes[targetId] && !nextMistakes[q.id]) {
          addedMistakeCount++;
        }
        const prevWrong = (nextMistakes[targetId]?.wrongCount || nextMistakes[q.id]?.wrongCount || 0);
        delete nextMistakes[q.id];
        nextMistakes[targetId] = {
          wrongCount: prevWrong + 1,
          streak: 0,
          updatedAt: Date.now()
        };
      }
    });

    saveMistakeMap(nextMistakes);

    const total = targetQuestions.length || 1;
    const accuracyRatio = correctCount / total;
    const finalScore = Math.round(accuracyRatio * 100);

    // 判斷是否符合計分資格（易錯題複習、Pre-A1 官方模擬、學力檢測、或選擇學生本年級的課本冊別）
    const isCurriculumTrack = targetScopeMode === 'curriculum';
    const isOwnGradeBook =
      !isCurriculumTrack ||
      isBookInOwnGrade(String(targetSelectedBook), currentStudent?.grade, 'mcq-exam');

    let coinsEarned = 0;
    let reason = '';
    if (!isOwnGradeBook) {
      coinsEarned = 0;
      reason = '跨年級自主練習不發放金幣與排行積分（選擇本年級冊別或易錯題複習即可計分）';
    } else if (finalScore < 60) {
      coinsEarned = 0;
      reason = '答對率需達 60% 以上方可獲得檢定金幣與累計排行，看詳解訂正後再挑戰一次！';
    } else {
      // 題數 × 答對率 × 0.4（10題全對=4、20題全對=8、50題全對=20，單次上限 20 金幣）
      coinsEarned = Math.min(20, Math.max(1, Math.round(total * accuracyRatio * 0.4)));

      // 依測驗軌道顯示精準說明文字，杜絕跨榜誤導
      if (targetScopeMode === 'curriculum') {
        reason = `通過檢定標準（答對率 ${finalScore}%），獲得 +${coinsEarned} 金幣並計入本週三大榜！`;
        const displayName = formatStudentDisplayName(currentStudent);
        recordMcqExamStats({
          grade: currentStudent?.grade,
          book: targetSelectedBook,
          name: displayName,
          correctCount,
          totalCount: total
        }).catch(() => {});
      } else if (targetScopeMode === 'tme-preA1') {
        reason =
          finalScore >= 70
            ? `通過 Pre-A1 官方合格標準（答對率 ${finalScore}% ≥ 70%），獲得 +${coinsEarned} 金幣並更新英雄榜精熟度！`
            : `完成 Pre-A1 官方模擬測驗（答對率 ${finalScore}%），獲得 +${coinsEarned} 鼓勵金幣！`;
      } else if (targetScopeMode === 'ministry-assessment') {
        reason = `完成教育部學力成就模擬（答對率 ${finalScore}%），獲得 +${coinsEarned} 金幣！`;
      } else {
        reason = `完成個人易錯題複習（答對率 ${finalScore}%），獲得 +${coinsEarned} 金幣！`;
      }
    }

    // 記錄三大檢定動態滾動精熟狀態（若為易錯題模式，依題目原始來源軌道分組寫入對應精熟紀錄，杜絕跨軌道污染）
    const currentSid = currentStudent?.student_id || currentStudent?.id || 'guest';
    let updatedSnap = null;
    if (targetScopeMode === 'mistakes') {
      const byTrack = {};
      targetQuestions.forEach((q, idx) => {
        const trk = q.sourceTrack || resolveQuestionTrack(q);
        if (!byTrack[trk]) byTrack[trk] = { questions: [], answers: [] };
        byTrack[trk].questions.push(q);
        byTrack[trk].answers.push(targetAnswers[idx]);
      });
      for (const [trk, data] of Object.entries(byTrack)) {
        updatedSnap = recordExamMasterySession(
          currentSid,
          trk,
          data.questions,
          data.answers,
          false // 易錯題複習為練習模式
        );
      }
    } else {
      const examTrack =
        targetScopeMode === 'tme-preA1'
          ? 'tme-preA1'
          : targetScopeMode === 'ministry-assessment'
          ? 'ministry-assessment'
          : 'curriculum';
      updatedSnap = recordExamMasterySession(
        currentSid,
        examTrack,
        targetQuestions,
        targetAnswers,
        Boolean(targetIsFormal) // 僅正式施測標記為 is_formal，自主練習不誤標
      );
    }

    // 若為 Pre-A1 且學生已登入，同步滾動精熟度至英雄榜 (mode: prea1-mastery)
    if (targetScopeMode === 'tme-preA1' && isLoggedIn) {
      const tmeTrack = updatedSnap?.tracks?.['tme-preA1'];
      if (tmeTrack) {
        const mCount = tmeTrack.mastered_count || 0;
        const mRate = Math.round((mCount / (tmeTrack.total_items || 300)) * 100);
        recordPreA1MasteryLeaderboard({
          grade: currentStudent?.grade,
          name: formatStudentDisplayName(currentStudent),
          studentId: currentSid,
          masteredCount: mCount,
          totalItems: tmeTrack.total_items || 300,
          masteryRate: mRate
        }).catch(() => {});
      }
    }

    if (coinsEarned > 0 && isLoggedIn && !hasAwardedCoinsRef.current) {
      hasAwardedCoinsRef.current = true;
      addCoins(coinsEarned);
    }

    // 計算各大題分項診斷成績
    const breakdown = buildTaskBreakdown(targetQuestions, targetAnswers);
    setTaskBreakdown(breakdown);

    // 清理進行中快照
    clearInProgress(inProgressKey);
    setSavedSession(null);

    const clearedSource = targetScopeMode === 'mistakes'
      ? isMistakeSourceCleared(nextMistakes, filteredMistakeQuestions)
      : false;

    setSessionRewardInfo({
      coinsEarned,
      reason,
      eligible: isOwnGradeBook && finalScore >= 60,
      graduatedCount,
      addedMistakeCount,
      earlyCleared: targetEarlyCleared,
      clearedSource,
      attemptLimit: targetScopeMode === 'mistakes' ? effectiveMistakeAttemptLimit : null
    });

    setShowUnansweredConfirm(false);
    setReviewFilter(correctCount === total ? 'all' : 'wrong');
    setReviewPageIndex(0);
    setPhase('result');

    if (typeof onComplete === 'function') {
      onComplete(finalScore, {
        mode: 'pure-mcq',
        book: targetSelectedBook,
        correctCount,
        totalQuestions: total,
        elapsedSec: targetElapsedSec,
        coinsEarned,
        isFormal: targetIsFormal
      });
    }
  }, [
    mistakeMap,
    questions,
    answers,
    scopeMode,
    saveMistakeMap,
    selectedBook,
    currentStudent?.grade,
    currentStudent?.student_id,
    currentStudent?.id,
    isLoggedIn,
    addCoins,
    onComplete,
    elapsedSec,
    inProgressKey,
    isFormalExam,
    selectedPreA1Format,
    effectiveMistakeAttemptLimit,
    filteredMistakeQuestions
  ]);

  finalizeExamRef.current = finalizeExam;

  const handleAdvanceQuestion = useCallback(() => {
    if (scopeMode === 'mistakes') {
      if (answers[currentIndex] === undefined) return;
      const simulatedMap = simulateMistakeAttempts(mistakeMap, questions, answers, currentIndex);
      if (isMistakeSourceCleared(simulatedMap, filteredMistakeQuestions)) {
        const completedQuestions = questions.slice(0, currentIndex + 1);
        const completedAnswers = Object.fromEntries(
          Object.entries(answers).filter(([index]) => Number(index) <= currentIndex)
        );
        finalizeExamRef.current?.({
          questions: completedQuestions,
          answers: completedAnswers,
          scopeMode: 'mistakes',
          elapsedSec,
          earlyCleared: true
        });
        return;
      }
      const completedQuestions = questions.slice(0, currentIndex + 1);
      const pendingQuestions = questions
        .slice(currentIndex + 1)
        .filter((question) => !isMistakeSourceCleared(simulatedMap, [question]));
      setQuestions([...completedQuestions, ...pendingQuestions]);
      if (pendingQuestions.length > 0) {
        setCurrentIndex(currentIndex + 1);
        return;
      }
    }
    setCurrentIndex((index) => Math.min(questions.length - 1, index + 1));
  }, [scopeMode, answers, currentIndex, mistakeMap, questions, filteredMistakeQuestions, elapsedSec]);

  const handleRequestSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      setShowUnansweredConfirm(true);
    } else {
      finalizeExam();
    }
  };

  // 鍵盤快捷鍵支援 (1~4 / A~D 選答案，左右方向鍵切換題目)
  useEffect(() => {
    if (phase !== 'exam') return;
    const onKeyDown = (e) => {
      if (showUnansweredConfirm || showExitConfirm) return;
      const key = e.key.toUpperCase();
      const currentQ = questions[currentIndex];
      if (!currentQ) return;
      if (['1', 'A'].includes(key) && currentQ.options.length >= 1) {
        handleSelectOption(0);
      } else if (['2', 'B'].includes(key) && currentQ.options.length >= 2) {
        handleSelectOption(1);
      } else if (['3', 'C'].includes(key) && currentQ.options.length >= 3) {
        handleSelectOption(2);
      } else if (['4', 'D'].includes(key) && currentQ.options.length >= 4) {
        handleSelectOption(3);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0 && scopeMode !== 'mistakes') {
        setCurrentIndex((i) => i - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        handleAdvanceQuestion();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, showUnansweredConfirm, showExitConfirm, questions, currentIndex, scopeMode, handleAdvanceQuestion]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // 根據目前時段決定魯凱日/夜底圖
  const isNightBg = useMemo(() => {
    const hr = new Date().getHours();
    return hr >= 18 || hr < 6;
  }, []);

  const bgImageUrl = isNightBg
    ? '/images/rukai_hub_night_1775490488446.png'
    : '/images/rukai_Main_Hub_Day.png';

  // ============================================================================
  // 共用零捲動外框 (100dvh Zero-Scroll Professional Language Assessment Shell)
  // ============================================================================
  const renderShell = (children) => (
    <div
      className="relative w-full h-[100dvh] overflow-hidden select-none flex flex-col items-center justify-center p-2 sm:p-4 md:p-5 bg-slate-900 bg-cover bg-center"
      style={{ backgroundImage: `url('${bgImageUrl}')` }}
    >
      {/* 專業柔焦遮罩層，降低背景干擾、突顯中央檢定面板 */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md pointer-events-none" />

      {/* 學生回報成功 Toast 訊息 */}
      {reportToastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-xl animate-fadeIn flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{reportToastMessage}</span>
        </div>
      )}

      {/* 中央一頁式專業檢定容器 */}
      <div className="relative z-10 w-full max-w-5xl h-full max-h-[820px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-opacity duration-150">
        {children}
      </div>

      {/* 學生試題疑義回報快答彈窗 */}
      {showReportModal && reportingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm sm:text-base">
                <AlertTriangle size={18} />
                <span>題目有什麼問題呢？</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowReportModal(false);
                  setReportingQuestion(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              點選最接近的情況，老師會收到通知為大家修正（免打字）：
            </p>

            <div className="space-y-2">
              {STUDENT_REPORT_TAGS.map((tag) => {
                const isSelected = selectedReportTag === tag.id;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedReportTag(tag.id)}
                    className={`w-full p-2.5 sm:p-3 rounded-xl border text-left text-xs sm:text-sm font-bold flex items-center gap-2.5 transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 bg-slate-50/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="text-base sm:text-lg shrink-0">{tag.icon}</span>
                    <span className="flex-1 leading-snug">{tag.label}</span>
                    {isSelected && <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setShowReportModal(false);
                  setReportingQuestion(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isSubmittingReport}
                onClick={handleSubmitReport}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                {isSubmittingReport ? '送出中...' : '確認送出 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================================================
  // STEP 1 & 2: 一頁式檢定範圍與題數設定 (Setup Screen - Zero Scroll)
  // ============================================================================
  if (phase === 'setup') {
    const bookMeta = HERE_WE_GO_BOOK_META[selectedBook] || HERE_WE_GO_BOOK_META[1];
    const mistakeCount = mistakeQuestions.length;
    const canStart =
      scopeMode === 'mistakes'
        ? filteredMistakeQuestions.length > 0 && effectiveMistakeAttemptLimit > 0
        : scopeMode === 'curriculum'
        ? curriculumPool.length > 0
        : scopeMode === 'tme-preA1'
        ? tmePool.length > 0
        : scopeMode === 'ministry-assessment'
        ? saaPool.length > 0
        : false;
    const setupFlowSteps =
      setupSubView === 'textbook'
        ? []
        : setupSubView === 'saa'
        ? ['年級', '題源', '試卷']
        : setupSubView === 'preA1'
        ? []
        : setupSubView === 'mistakes'
        ? ['來源', '上限']
        : [];
    const setupFlowActiveStep =
      setupSubView === 'textbook'
        ? activeBoardStep
        : setupSubView === 'saa'
        ? saaWizardStep
        : setupSubView === 'mistakes'
        ? 2
        : 1;
    const setupTone =
      setupSubView === 'textbook'
        ? 'blue'
        : setupSubView === 'saa'
        ? 'emerald'
        : setupSubView === 'preA1'
        ? 'violet'
        : 'rose';
    const setupToneClasses = {
      blue: 'bg-blue-600 border-blue-600 text-white',
      emerald: 'bg-emerald-600 border-emerald-600 text-white',
      violet: 'bg-violet-600 border-violet-600 text-white',
      rose: 'bg-rose-600 border-rose-600 text-white'
    };

    if (setupSubView === 'preA1-dashboard') {
      return renderShell(
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-contain">
          <PreA1MasteryDashboard
            student={currentStudent}
            initialTrack={masteryInitialTrack || 'tme-preA1'}
            onBack={() => {
              if (masteryInitialTrack === 'ministry-assessment') setSetupSubView('saa');
              else if (masteryInitialTrack === 'curriculum') setSetupSubView('textbook');
              else setSetupSubView('preA1');
            }}
            onStartDrill={(subType, count = 5, mode = 'all', track = 'tme-preA1') => {
              const studentId = currentStudent?.student_id || currentStudent?.id || 'guest';
              const snap = loadStudentMastery(studentId);
              const trackKey = track || 'tme-preA1';
              const itemsMap = snap?.tracks?.[trackKey]?.items || {};

              let bank = [];
              if (trackKey === 'tme-preA1') {
                bank = TME_PRE_A1_BANK;
                setScopeMode('tme-preA1');
              } else if (trackKey === 'ministry-assessment') {
                bank = SAA_EXAM_BANK;
                setScopeMode('ministry-assessment');
              } else {
                bank = HERE_WE_GO_MCQ_BANK;
                setScopeMode('curriculum');
              }

              let drillPool = bank.filter((q) => {
                if (trackKey === 'curriculum') {
                  const bookNum = Number(subType.replace('b', ''));
                  return q.subType === subType || q.bookGroup === subType || q.book === bookNum;
                }
                return q.subType === subType || q.taskType === subType;
              });
              if (drillPool.length === 0) {
                drillPool = bank;
              }

              if (mode === 'mistakes') {
                const mistakePool = drillPool.filter((q) => {
                  const it = itemsMap[q.id];
                  return it && it.status !== MASTERY_STATES.MASTERED;
                });
                if (mistakePool.length > 0) drillPool = mistakePool;
              } else if (mode === 'new') {
                const newPool = drillPool.filter((q) => !itemsMap[q.id]);
                if (newPool.length > 0) drillPool = newPool;
              }

              if (drillPool.length > 0) {
                // Fisher-Yates 隨機洗牌
                const shuffled = [...drillPool];
                for (let i = shuffled.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                const selected = shuffled.slice(0, Math.min(count, shuffled.length));
                setIsFormalExam(false);
                startExamSession(selected, selected.length, true);
              }
            }}
          />
        </div>
      );
    }

    return renderShell(
      <>
        {/* 頂端精簡導覽列 */}
        <div className={`shrink-0 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/80 dark:bg-slate-900/80 ${setupSubView === 'saa' ? 'py-2' : 'py-3'}`}>
          {setupSubView === 'hub' ? (
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft size={16} />
              離開大廳
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSetupSubView('hub')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft size={16} />
              返回選單
            </button>
          )}

          <div className="flex items-center gap-2">
            {setupSubView === 'hub' && <Award className="text-indigo-600 dark:text-indigo-400" size={22} />}
            {setupSubView === 'textbook' && <BookOpen className="text-blue-600 dark:text-blue-400" size={22} />}
            {setupSubView === 'saa' && <ClipboardCheck className="text-emerald-600 dark:text-emerald-400" size={22} />}
            {setupSubView === 'preA1' && <Award className="text-violet-600 dark:text-violet-400" size={22} />}
            {setupSubView === 'mistakes' && <RotateCcw className="text-rose-600 dark:text-rose-400" size={22} />}
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {setupSubView === 'hub' && '霧臺英語檢定館'}
                {setupSubView === 'textbook' && '課本題庫練習'}
                {setupSubView === 'saa' && '學力檢測練習'}
                {setupSubView === 'preA1' && 'Pre A1 檢測練習'}
                {setupSubView === 'mistakes' && '個人易錯題複習'}
              </h1>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
                {setupSubView === 'hub' && 'Wutai English Assessment Arena'}
                {setupSubView === 'textbook' && 'Here We Go! 分冊分單元檢定'}
                {setupSubView === 'saa' && '教育部 SAA 臺灣學生學習成就評量'}
                {setupSubView === 'preA1' && 'Test My English 官方指標模擬'}
                {setupSubView === 'mistakes' && '精準鎖定錯題 • 連續答對 2 次出庫'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={openModal}
                className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-black flex items-center gap-1.5"
              >
                <span>{formatStudentBadge(currentStudent)}</span>
                <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                  <Coins size={13} />
                  {coins}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openModal}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-black flex items-center gap-1"
              >
                <UserCheck size={14} />
                登入領金幣
              </button>
            )}
          </div>
        </div>

        {/* 中央設定主體：SAA 桌機版固定單頁；窄螢幕保留安全捲動避免裁切 */}
        <div className={`flex-1 min-h-0 flex flex-col overscroll-contain ${
          setupSubView === 'saa'
            ? 'p-2 sm:p-3 gap-2 overflow-y-auto lg:overflow-hidden'
            : 'p-3 sm:p-5 md:p-6 gap-3 overflow-y-auto'
        }`}>
          {setupFlowSteps.length > 0 && (
            <ol
              data-testid="exam-setup-step-rail"
              className={`shrink-0 grid gap-1.5 ${setupFlowSteps.length === 4 ? 'grid-cols-4' : setupFlowSteps.length === 3 ? 'grid-cols-3' : setupFlowSteps.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
              aria-label="測驗設定進度"
            >
              {setupFlowSteps.map((label, index) => {
                const step = index + 1;
                const current = step === setupFlowActiveStep;
                const complete = step < setupFlowActiveStep;
                return (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => {
                        if (setupSubView === 'textbook') setActiveBoardStep(step);
                        if (setupSubView === 'saa') setSaaWizardStep(step);
                      }}
                      disabled={setupSubView === 'preA1' || setupSubView === 'mistakes'}
                      aria-current={current ? 'step' : undefined}
                      className={`w-full min-h-8 rounded-xl border px-2 py-1 text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 transition ${
                        current
                          ? setupToneClasses[setupTone]
                          : complete
                          ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                          : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400'
                      } ${setupSubView === 'preA1' || setupSubView === 'mistakes' ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {complete ? <Check size={13} /> : <span>{step}</span>}
                      <span>{label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
          {/* 未完成檢定接續提醒 (6 小時內有效快照) */}
          {savedSession && (
            <div className="shrink-0 p-3 sm:p-4 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/70 border-2 border-indigo-300 dark:border-indigo-700 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles className="text-indigo-600 dark:text-indigo-400 shrink-0" size={20} />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black text-indigo-950 dark:text-indigo-100 flex items-center gap-2">
                    <span>發現未完成的檢定</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/70 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-200">
                      已作答 {Object.keys(savedSession.answers || {}).length} / {savedSession.questions?.length} 題
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-300 truncate mt-0.5">
                    {savedSession.scopeMode === 'mistakes'
                      ? '易錯題複習'
                      : savedSession.scopeMode === 'tme-preA1'
                      ? 'Pre-A1 官方模擬檢定'
                      : savedSession.scopeMode === 'ministry-assessment'
                      ? 'SAA 學力成就模擬'
                      : `${formatBookLabel(savedSession.selectedBook)}檢定`} • 6 小時內有效，可隨時接續
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    clearInProgress(inProgressKey);
                    setSavedSession(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  放棄重測
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (savedSession.isFormalExam) {
                      const now = Date.now();
                      const deadline = savedSession.deadlineAt || (savedSession.startedAt + 2100 * 1000);
                      const remainingMs = deadline - now;
                      if (remainingMs <= 0) {
                        const qs = savedSession.questions || [];
                        const ans = savedSession.answers || {};
                        setQuestions(qs);
                        setAnswers(ans);
                        setFlagged(savedSession.flagged || {});
                        setElapsedSec(2100);
                        setIsFormalExam(true);
                        if (savedSession.selectedBook) setSelectedBook(savedSession.selectedBook);
                        if (savedSession.scopeMode) setScopeMode(savedSession.scopeMode);
                        if (savedSession.selectedPreA1Format) setSelectedPreA1Format(savedSession.selectedPreA1Format);
                        setSavedSession(null);
                        alert('正式測驗 35 分鐘時間已逾時，系統自動為您結算作答成績！');
                        finalizeExam({
                          questions: qs,
                          answers: ans,
                          scopeMode: savedSession.scopeMode || scopeMode,
                          selectedBook: savedSession.selectedBook || selectedBook,
                          isFormal: true,
                          selectedPreA1Format: savedSession.selectedPreA1Format || selectedPreA1Format,
                          elapsedSec: 2100
                        });
                        return;
                      }
                      setIsFormalExam(true);
                      setStartTime(savedSession.startedAt);
                      setElapsedSec(Math.floor((now - savedSession.startedAt) / 1000));
                    } else {
                      setIsFormalExam(false);
                      setElapsedSec(savedSession.elapsedSec || 0);
                      setStartTime(Date.now() - (savedSession.elapsedSec || 0) * 1000);
                    }
                    hasAwardedCoinsRef.current = false;
                    hasFinalizedRef.current = false;
                    setQuestions(savedSession.questions);
                    setAnswers(savedSession.answers || {});
                    setFlagged(savedSession.flagged || {});
                    setCurrentIndex(savedSession.currentIndex || 0);
                    if (savedSession.selectedBook) setSelectedBook(savedSession.selectedBook);
                    if (savedSession.questionCountOpt) setQuestionCountOpt(savedSession.questionCountOpt);
                    if (savedSession.mistakeSource) setMistakeSource(savedSession.mistakeSource);
                    if (savedSession.mistakeAttemptLimit) {
                      setMistakeAttemptLimit(savedSession.mistakeAttemptLimit === 10 ? 10 : 20);
                    }
                    if (savedSession.scopeMode) setScopeMode(savedSession.scopeMode);
                    if (savedSession.selectedPreA1Format) setSelectedPreA1Format(savedSession.selectedPreA1Format);
                    if (savedSession.selectedSaaFormat) setSelectedSaaFormat(savedSession.selectedSaaFormat);
                    if (savedSession.selectedSaaGrade) setSelectedSaaGrade(savedSession.selectedSaaGrade);
                    if (savedSession.selectedSaaSource) setSelectedSaaSource(savedSession.selectedSaaSource);
                    if (savedSession.selectedSaaYear) setSelectedSaaYear(savedSession.selectedSaaYear);
                    if (savedSession.selectedUnits) setSelectedUnits(savedSession.selectedUnits);
                    if (savedSession.textbookExamMode) setTextbookExamMode(savedSession.textbookExamMode);
                    setSavedSession(null);
                    setPhase('exam');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm flex items-center gap-1 transition cursor-pointer"
                >
                  <span>接續作答</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* 模式 A：四大膠囊首頁 (setupSubView === 'hub')                          */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {setupSubView === 'hub' && (
            <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full gap-3 sm:gap-4 my-auto py-2">
              <div className="text-center sm:text-left">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                  請選擇檢定練習模式
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  涵蓋校內課本段考題庫、教育部縣市學力檢測與 Test My English 官方指標
                </p>
              </div>

              {/* 膠囊 1: 課本題庫練習 */}
              <button
                type="button"
                onClick={() => {
                  setSetupSubView('textbook');
                  setScopeMode('curriculum');
                }}
                className="w-full text-left p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-blue-50/40 dark:hover:bg-slate-800 border-2 border-blue-200/80 dark:border-blue-900/60 border-l-6 border-l-blue-600 hover:border-blue-500 dark:hover:border-blue-400 shadow-md hover:shadow-xl transition-all duration-200 group flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <BookOpen size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        課本題庫練習
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {CANONICAL_STATS.canonicalItems.toLocaleString()} 題分冊精熟
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 sm:line-clamp-none">
                      何嘉仁 Here We Go! 第 1～8 冊與銜接單元，自選冊別、單元與題數
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-blue-600 dark:text-blue-400 font-black text-xs sm:text-sm">
                  <span className="hidden sm:inline">進入練習</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 膠囊 2: 學力檢測練習 */}
              <button
                type="button"
                onClick={() => {
                  setSetupSubView('saa');
                  setScopeMode('ministry-assessment');
                  setSaaWizardStep(1);
                }}
                className="w-full text-left p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-emerald-50/40 dark:hover:bg-slate-800 border-2 border-emerald-200/80 dark:border-emerald-900/60 border-l-6 border-l-emerald-600 hover:border-emerald-500 dark:hover:border-emerald-400 shadow-md hover:shadow-xl transition-all duration-200 group flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <ClipboardCheck size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        學力檢測練習
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        SAA 4～6年級學測
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 sm:line-clamp-none">
                      教育部 SAA 學力檢測：官方 113～115 年原卷與自主研發類題嚴格分流
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-xs sm:text-sm">
                  <span className="hidden sm:inline">進入練習</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 膠囊 3: Pre A1 檢測練習 */}
              <button
                type="button"
                onClick={() => {
                  setSetupSubView('preA1');
                  setScopeMode('tme-preA1');
                }}
                className="w-full text-left p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-violet-50/40 dark:hover:bg-slate-800 border-2 border-violet-200/80 dark:border-violet-900/60 border-l-6 border-l-violet-600 hover:border-violet-500 dark:hover:border-violet-400 shadow-md hover:shadow-xl transition-all duration-200 group flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <Award size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        Pre A1 檢測練習
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        教育部官方標準
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 sm:line-clamp-none">
                      Test My English 官方指標：聽力 15 題 ＋ 閱讀 15 題（達 21 題合格）
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-violet-600 dark:text-violet-400 font-black text-xs sm:text-sm">
                  <span className="hidden sm:inline">進入練習</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 膠囊 4: 易錯題複習 */}
              <button
                type="button"
                onClick={() => {
                  setSetupSubView('mistakes');
                  setScopeMode('mistakes');
                }}
                className="w-full text-left p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-rose-50/40 dark:hover:bg-slate-800 border-2 border-rose-200/80 dark:border-rose-900/60 border-l-6 border-l-rose-600 hover:border-rose-500 dark:hover:border-rose-400 shadow-md hover:shadow-xl transition-all duration-200 group flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <RotateCcw size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        易錯題複習
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {mistakeCount} 題待複習
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 sm:line-clamp-none">
                      可選全部、課本、SAA 或 Pre-A1；只複習真實錯題，連續答對 2 次自動移出
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-rose-600 dark:text-rose-400 font-black text-xs sm:text-sm">
                  <span className="hidden sm:inline">進入練習</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* 模式 B：課本題庫練習 (setupSubView === 'textbook')                     */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* 模式 B：課本題庫練習 (setupSubView === 'textbook') - 四聯階梯式布題台      */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {setupSubView === 'textbook' && (
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              <div className="shrink-0 flex items-center justify-end gap-2">
                <details className="relative">
                  <summary className="list-none w-9 h-9 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center cursor-pointer" aria-label="查看課本測驗說明" title="課本測驗說明">
                    <Info size={17} />
                  </summary>
                  <div className="absolute z-30 right-0 top-11 w-64 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    依序選擇冊別、範圍、題型與題數。完成的步驟會收合並保留摘要，隨時可點回修改。
                  </div>
                </details>
                <button
                  type="button"
                  onClick={() => {
                    setMasteryInitialTrack('curriculum');
                    setSetupSubView('preA1-dashboard');
                  }}
                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition cursor-pointer"
                  aria-label="查看課本精熟卡"
                  title="查看課本精熟卡"
                >
                  <Award size={17} />
                </button>
              </div>

              {/* 手機／直向平板：四列漸進手風琴；iPad 橫向與桌機：四欄並排布題台。 */}
              <div data-testid="textbook-setup-board" className="grid grid-cols-1 lg:grid-cols-4 gap-2 lg:gap-3 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden pr-0.5">
                {/* ───────────────────────────────────────────────────────────── */}
                {/* 欄 1：01 TARGET 冊別選擇                                        */}
                {/* ───────────────────────────────────────────────────────────── */}
                <div
                  data-testid="textbook-step-1"
                  onClick={() => setActiveBoardStep(1)}
                  className={`rounded-2xl p-3 flex flex-col gap-2 min-h-0 lg:h-full lg:overflow-hidden transition-all cursor-pointer ${
                    activeBoardStep === 1
                      ? 'border-2 border-blue-500 dark:border-blue-400 bg-white dark:bg-slate-800 shadow-md ring-2 ring-blue-500/20 dark:ring-blue-400/20 opacity-100'
                      : 1 <= maxReachedBoardStep
                      ? 'border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-xs opacity-95 hover:border-blue-300'
                      : 'border-2 border-dashed border-slate-200 dark:border-slate-750 bg-slate-50/70 dark:bg-slate-850/60 opacity-45 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center transition ${
                        activeBoardStep === 1
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        1
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        冊別
                      </span>
                    </div>
                    <span className="text-[11px] font-black text-blue-700 dark:text-blue-300">
                      {formatBookLabel(selectedBook)}{isSelectedBookOwnGrade ? ' · 本年級' : ''}
                    </span>
                  </div>

                  {/* 冊別按鈕網格 */}
                  <div className={`${activeBoardStep === 1 ? 'flex' : 'hidden'} lg:flex flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5 min-h-0`}>
                    {/* 低年級字母專冊 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-1.5">
                      {['g1', 'g2'].map((bKey) => {
                        const isSelected = selectedBook === bKey;
                        const isOwn = isBookInOwnGrade(bKey, currentStudent?.grade, 'mcq-exam');
                        return (
                          <button
                            key={bKey}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectBook(bKey);
                            }}
                            className={`py-2 px-2 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white shadow-xs font-black'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                            }`}
                          >
                            <span className="text-sm font-black leading-tight">{formatBookLabel(bKey)}</span>
                            {isOwn && (
                              <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-100' : 'text-blue-700 dark:text-blue-300'}`}>
                                ★ 本年級
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* 3~6 年級 1~8 冊 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((bNum) => {
                        const isSelected = selectedBook === bNum;
                        const isOwn = isBookInOwnGrade(String(bNum), currentStudent?.grade, 'mcq-exam');
                        return (
                          <button
                            key={bNum}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectBook(bNum);
                            }}
                            className={`py-2 px-2 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white shadow-xs font-black'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                            }`}
                          >
                            <span className="text-sm font-black leading-tight">{formatBookLabel(bNum)}</span>
                            {isOwn && (
                              <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-100' : 'text-blue-700 dark:text-blue-300'}`}>
                                ★ 本年級
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* 國一先修 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectBook(9);
                      }}
                      className={`w-full py-2 px-2 rounded-xl border text-center transition flex items-center justify-center gap-1 cursor-pointer ${
                        selectedBook === 9
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs font-black'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-sm font-black">國一先修 (Book 9)</span>
                    </button>
                  </div>
                </div>

                {/* ───────────────────────────────────────────────────────────── */}
                {/* 欄 2：02 SCOPE 評量範圍                                        */}
                {/* ───────────────────────────────────────────────────────────── */}
                <div
                  data-testid="textbook-step-2"
                  onClick={() => {
                    if (maxReachedBoardStep >= 2) setActiveBoardStep(2);
                  }}
                  aria-disabled={maxReachedBoardStep < 2}
                  className={`rounded-2xl p-3 flex flex-col gap-2 min-h-0 lg:h-full lg:overflow-hidden transition-all ${maxReachedBoardStep >= 2 ? 'cursor-pointer' : 'cursor-not-allowed'} ${
                    activeBoardStep === 2
                      ? 'border-2 border-blue-500 dark:border-blue-400 bg-white dark:bg-slate-800 shadow-md ring-2 ring-blue-500/20 dark:ring-blue-400/20 opacity-100'
                      : 2 <= maxReachedBoardStep
                      ? 'border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-xs opacity-95 hover:border-blue-300'
                      : 'border-2 border-dashed border-slate-200 dark:border-slate-750 bg-slate-50/70 dark:bg-slate-850/60 opacity-45 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center transition ${
                        activeBoardStep === 2
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        2
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        範圍
                      </span>
                    </div>
                    <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold truncate">
                      {selectedBook === 'g1' || selectedBook === 'g2' ? '全字母' : rangePreset === 'midterm' ? '上半冊' : rangePreset === 'final' ? '下半冊' : rangePreset === 'all' ? '全冊' : `自選 ${selectedUnits.length} 單元`}
                    </span>
                  </div>

                  <div className={`${activeBoardStep === 2 ? 'flex' : 'hidden'} lg:flex flex-1 flex-col gap-2 overflow-y-auto pr-0.5 min-h-0 ${maxReachedBoardStep >= 2 ? '' : 'pointer-events-none'}`}>
                    {/* 1, 2 年級：極簡自動通道 */}
                    {(selectedBook === 'g1' || selectedBook === 'g2') ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
                        <Type size={24} className="text-blue-600 dark:text-blue-400 mb-1" />
                        <div className="text-sm font-black text-blue-900 dark:text-blue-100">
                          全字母闖關檢定
                        </div>
                        <p className="hidden">
                          涵蓋英文字母前後順序、缺漏字母填空與大小寫配對
                        </p>
                        <span className="hidden">
                          ✓ 系統已全自動選定
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* 3~6 年級三大段考快選膠囊 */}
                        <div className="flex flex-col gap-1.5">
                          {/* 上半冊 (期中考) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyRangePreset('midterm');
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-1.5 cursor-pointer ${
                              rangePreset === 'midterm'
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100 font-black shadow-xs ring-1 ring-blue-500'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-sm sm:text-base font-black flex items-center gap-1">
                                <span>上半冊 (期中考)</span>
                              </div>
                              <div className="hidden">
                                Starter, Unit 1, Unit 2, Review 1
                              </div>
                            </div>
                            {rangePreset === 'midterm' && <CheckCircle2 size={16} className="text-blue-600 shrink-0" />}
                          </button>

                          {/* 下半冊 (期末考) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyRangePreset('final');
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-1.5 cursor-pointer ${
                              rangePreset === 'final'
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100 font-black shadow-xs ring-1 ring-blue-500'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-sm sm:text-base font-black flex items-center gap-1">
                                <span>下半冊 (期末考)</span>
                              </div>
                              <div className="hidden">
                                Unit 3, Unit 4, Review 2, Festival
                              </div>
                            </div>
                            {rangePreset === 'final' && <CheckCircle2 size={16} className="text-blue-600 shrink-0" />}
                          </button>

                          {/* 全選 / 全冊總複習 */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyRangePreset('all');
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-1.5 cursor-pointer ${
                              rangePreset === 'all'
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100 font-black shadow-xs ring-1 ring-blue-500'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-sm sm:text-base font-black flex items-center gap-1">
                                <span>全冊總複習 (全選)</span>
                              </div>
                              <div className="hidden">
                                全冊 8 個單元總動員
                              </div>
                            </div>
                            {rangePreset === 'all' && <CheckCircle2 size={16} className="text-blue-600 shrink-0" />}
                          </button>
                        </div>

                        {/* 自選單元折疊抽屜 */}
                        <div className="mt-auto pt-1 border-t border-slate-100 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRangePreset('custom');
                              setActiveBoardStep(2);
                              setIsCustomUnitOpen((prev) => !prev);
                            }}
                            className={`w-full py-1.5 px-2 rounded-lg text-xs font-black border flex items-center justify-between cursor-pointer transition ${
                              rangePreset === 'custom'
                              ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 text-blue-800 dark:text-blue-200'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <SlidersHorizontal size={13} />
                              <span>自選特定單元 ({selectedUnits.length})</span>
                            </span>
                            <span className="text-[10px] font-semibold">{isCustomUnitOpen ? '▲ 收合' : '▼ 展開'}</span>
                          </button>

                          {isCustomUnitOpen && (
                            <div className="grid grid-cols-2 gap-1 mt-1 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-h-36 overflow-y-auto">
                              {bookMeta.units.map((unitName) => {
                                const checked = selectedUnits.includes(unitName);
                                return (
                                  <button
                                    key={unitName}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRangePreset('custom');
                                      toggleUnit(unitName);
                                    }}
                                    className={`p-1.5 rounded-lg border text-left text-xs font-bold truncate flex items-center justify-between cursor-pointer ${
                                      checked
                                              ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                                    }`}
                                  >
                                    <span className="truncate">{unitName}</span>
                                    {checked && <Check size={12} className="shrink-0 ml-0.5" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ───────────────────────────────────────────────────────────── */}
                {/* 欄 3：03 MODE 施測型態                                         */}
                {/* ───────────────────────────────────────────────────────────── */}
                <div
                  data-testid="textbook-step-3"
                  onClick={() => {
                    if (maxReachedBoardStep >= 3) setActiveBoardStep(3);
                  }}
                  aria-disabled={maxReachedBoardStep < 3}
                  className={`rounded-2xl p-3 flex flex-col gap-2 min-h-0 lg:h-full lg:overflow-hidden transition-all ${maxReachedBoardStep >= 3 ? 'cursor-pointer' : 'cursor-not-allowed'} ${
                    activeBoardStep === 3
                      ? 'border-2 border-blue-500 dark:border-blue-400 bg-white dark:bg-slate-800 shadow-md ring-2 ring-blue-500/20 dark:ring-blue-400/20 opacity-100'
                      : 3 <= maxReachedBoardStep
                      ? 'border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-xs opacity-95 hover:border-blue-300'
                      : 'border-2 border-dashed border-slate-200 dark:border-slate-750 bg-slate-50/70 dark:bg-slate-850/60 opacity-45 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center transition ${
                        activeBoardStep === 3
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        3
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        題型
                      </span>
                    </div>
                    <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold">
                      {textbookExamMode === 'comprehensive' ? '綜合測驗' : textbookExamMode === 'written' ? '純讀寫' : '純聽力'}
                    </span>
                  </div>

                  <div className={`${activeBoardStep === 3 ? 'flex' : 'hidden'} lg:flex flex-1 flex-col gap-2 overflow-y-auto pr-0.5 min-h-0 ${maxReachedBoardStep >= 3 ? '' : 'pointer-events-none'}`}>
                    {/* 1, 2 年級：極簡自動通道 */}
                    {(selectedBook === 'g1' || selectedBook === 'g2') ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
                        <GraduationCap size={24} className="text-blue-600 dark:text-blue-400 mb-1" />
                        <div className="text-sm font-black text-blue-900 dark:text-blue-100">
                          字母圖文全題型
                        </div>
                        <p className="hidden">
                          自適應派發純字母、大小寫配對與趣味圖文題，免考複雜文法與長句
                        </p>
                        <span className="hidden">
                          ✓ 低年級專屬通道
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* 綜合測驗 */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTextbookExamMode('comprehensive');
                            setActiveBoardStep(4);
                            setMaxReachedBoardStep((prev) => Math.max(prev, 4));
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-1.5 cursor-pointer ${
                            textbookExamMode === 'comprehensive'
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100 font-black shadow-xs ring-1 ring-blue-500'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-sm sm:text-base font-black flex items-center gap-1.5">
                              <Headphones size={15} className="text-blue-600 shrink-0" />
                              <span>綜合測驗</span>
                              <span className="hidden">
                                段考標準
                              </span>
                            </div>
                            <div className="hidden">
                              含聽力 (約30%) ＋ 讀寫 (約70%)
                            </div>
                          </div>
                          {textbookExamMode === 'comprehensive' && <CheckCircle2 size={16} className="text-blue-600 shrink-0" />}
                        </button>

                        {/* 純筆試測驗 */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTextbookExamMode('written');
                            setActiveBoardStep(4);
                            setMaxReachedBoardStep((prev) => Math.max(prev, 4));
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-1.5 cursor-pointer ${
                            textbookExamMode === 'written'
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100 font-black shadow-xs ring-1 ring-blue-500'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-sm sm:text-base font-black flex items-center gap-1.5">
                              <FileText size={15} className="text-blue-600 shrink-0" />
                              <span>純筆試測驗</span>
                              <span className="hidden">
                                避開聽力
                              </span>
                            </div>
                            <div className="hidden">
                              100% 讀寫選擇題，安靜教室首選
                            </div>
                          </div>
                          {textbookExamMode === 'written' && <CheckCircle2 size={16} className="text-blue-600 shrink-0" />}
                        </button>

                        {/* 純聽力特訓 */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTextbookExamMode('listening');
                            setActiveBoardStep(4);
                            setMaxReachedBoardStep((prev) => Math.max(prev, 4));
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-1.5 cursor-pointer ${
                            textbookExamMode === 'listening'
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100 font-black shadow-xs ring-1 ring-blue-500'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-sm sm:text-base font-black flex items-center gap-1.5">
                              <Volume2 size={15} className="text-blue-600 shrink-0" />
                              <span>純聽力特訓</span>
                              <span className="hidden">
                                聽力衝刺
                              </span>
                            </div>
                            <div className="hidden">
                              全卷皆為聽力理解問答，戴耳機練習
                            </div>
                          </div>
                          {textbookExamMode === 'listening' && <CheckCircle2 size={16} className="text-blue-600 shrink-0" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ───────────────────────────────────────────────────────────── */}
                {/* 欄 4：04 SCALE 題數規模（與其餘三欄一致由頂端開始排列）            */}
                {/* ───────────────────────────────────────────────────────────── */}
                <div
                  data-testid="textbook-step-4"
                  onClick={() => {
                    if (maxReachedBoardStep >= 4) setActiveBoardStep(4);
                  }}
                  aria-disabled={maxReachedBoardStep < 4}
                  className={`rounded-2xl p-3 flex flex-col justify-start gap-2 min-h-0 lg:h-full lg:overflow-hidden transition-all ${maxReachedBoardStep >= 4 ? 'cursor-pointer' : 'cursor-not-allowed'} ${
                    activeBoardStep === 4
                      ? 'border-2 border-blue-500 dark:border-blue-400 bg-white dark:bg-slate-800 shadow-md ring-2 ring-blue-500/20 dark:ring-blue-400/20 opacity-100'
                      : 4 <= maxReachedBoardStep
                      ? 'border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-xs opacity-95 hover:border-blue-300'
                      : 'border-2 border-dashed border-slate-200 dark:border-slate-750 bg-slate-50/70 dark:bg-slate-850/60 opacity-45 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center transition ${
                        activeBoardStep === 4
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        4
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        題數
                      </span>
                    </div>
                    <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold">
                      {questionCountOpt} 題
                    </span>
                  </div>

                  {/* 題數選擇 */}
                  <div className={`${activeBoardStep === 4 ? 'flex' : 'hidden'} lg:flex flex-col gap-1.5 overflow-y-auto min-h-0 ${maxReachedBoardStep >= 4 ? '' : 'pointer-events-none'}`}>
                    {(selectedBook === 'g1' || selectedBook === 'g2' ? [
                      { count: 10, label: '10 題', sub: '小試身手 • 最高 +4 金幣' },
                      { count: 20, label: '20 題', sub: '勇者挑戰 • 最高 +8 金幣' }
                    ] : [
                      { count: 10, label: '10 題', sub: '速測 • 最高 +4 金幣' },
                      { count: 20, label: '20 題', sub: '標準段考 • 最高 +8 金幣 (推薦)' },
                      { count: 50, label: '50 題', sub: '大考衝刺 • 最高 +20 金幣' }
                    ]).map((opt) => {
                      const active = questionCountOpt === opt.count;
                      return (
                        <button
                          key={opt.count}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuestionCountOpt(opt.count);
                            setActiveBoardStep(4);
                            setMaxReachedBoardStep(4);
                          }}
                          className={`w-full py-2.5 px-3 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                            active
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100 font-black shadow-xs ring-1 ring-blue-500'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                          }`}
                        >
                          <div>
                            <span className="text-sm sm:text-base font-black">{opt.label}</span>
                            <div className="hidden">{opt.sub}</div>
                          </div>
                          {active && <CheckCircle2 size={16} className="text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* 下半部：精練布題摘要卡（視線引導至右下角全站啟動按鈕） */}
                  <div className="hidden">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                        <span>已選配置摘要</span>
                        <span className="text-blue-700 dark:text-blue-300 font-black">{questionCountOpt} 題</span>
                      </div>
                      <div className="mt-1 font-black text-slate-800 dark:text-slate-100 truncate text-xs sm:text-sm">
                        {formatBookLabel(selectedBook)} • {rangePreset === 'midterm' ? '期中考範圍' : rangePreset === 'final' ? '期末考範圍' : rangePreset === 'all' ? '全冊範圍' : `${selectedUnits.length} 個單元`}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {textbookExamMode === 'comprehensive' ? '聽力 + 讀寫筆試' : textbookExamMode === 'written' ? '純讀寫筆試' : '純聽力特訓'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* 模式 C：學力檢測練習 (setupSubView === 'saa')                          */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {setupSubView === 'saa' && (
            <div data-testid="saa-wizard" className="h-full min-h-0 flex flex-col gap-2">
              {/* SAA 頂部精熟診斷卡捷徑橫幅 */}
              <div className="shrink-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-emerald-950/40 border border-emerald-300/40 dark:border-emerald-700/40 rounded-2xl p-2 flex items-center justify-between gap-2 [@media(max-height:700px)]:hidden">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ClipboardCheck size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
                      <span className="truncate">SAA 官方 113～115 年題本</span>
                      <span className="hidden md:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        聽力三大題 · 閱讀二大題
                      </span>
                    </h3>
                    <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      動態滾動精熟體系：錯題連對 2 次翻盤解鎖為精熟，拒絕歷史錯誤懲罰
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMasteryInitialTrack('ministry-assessment');
                    setSetupSubView('preA1-dashboard');
                  }}
                  aria-label="查看學力精熟診斷卡"
                  title="查看學力精熟診斷卡"
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <ClipboardCheck size={15} />
                  <span className="hidden sm:inline">精熟診斷卡 ➔</span>
                </button>
              </div>

              {/* 選擇卡是本區唯一翡翠綠粗框；進度、說明與摘要使用中性色，避免誤認為可點選 */}
              <div data-testid="saa-option-stage" className="min-h-0 min-w-0 w-full max-w-xl mx-auto">
              {/* 步驟 1：選擇施測年級 */}
              {saaWizardStep === 1 && (
              <div className="shrink-0 bg-white dark:bg-slate-900/70 rounded-2xl p-2.5 sm:p-3 border-2 border-emerald-500 dark:border-emerald-600 shadow-md shadow-emerald-500/10 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                      1
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      選擇施測年級
                    </span>
                  </div>
                  <span className="hidden sm:inline px-2 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                    每個年級各有 35 題官方卷
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                  {[
                    { grade: 4, label: '四年級', desc: 'Book 3～4' },
                    { grade: 5, label: '五年級', desc: 'Book 5～6' },
                    { grade: 6, label: '六年級', desc: 'Book 7～8' }
                  ].map((g) => {
                    const active = selectedSaaGrade === g.grade;
                    return (
                      <button
                        key={g.grade}
                        type="button"
                        onClick={() => {
                          setSelectedSaaGrade(g.grade);
                          setSaaWizardStep(2);
                        }}
                        aria-pressed={active}
                        className={`py-2 px-3 rounded-xl border-2 text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                          active
                            ? 'border-emerald-700 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300/60 dark:ring-emerald-800'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        }`}
                      >
                        <span className="text-sm sm:text-base font-black">{g.label}</span>
                        <span className={`text-[10px] sm:text-[11px] font-semibold ${active ? 'text-emerald-100' : 'text-slate-400'}`}>{g.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              {/* 步驟 2：官方考古題／自主研發類題分流 */}
              {saaWizardStep === 2 && (
              <div className="shrink-0 bg-white dark:bg-slate-900/70 rounded-2xl p-2.5 sm:p-3 border-2 border-emerald-500 dark:border-emerald-600 shadow-md shadow-emerald-500/10 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                      2
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      選擇題目來源
                    </span>
                  </div>
                  <span className="hidden sm:inline px-2 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                    官方卷與原創題永不混抽
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                  {[
                    { id: 'official', label: '官方考古題', desc: '113～115 年原卷原題', Icon: ClipboardCheck },
                    { id: 'original', label: '原創類題練習', desc: '審核完成後開放', Icon: Sparkles }
                  ].map((source) => {
                    const active = selectedSaaSource === source.id;
                    const SourceIcon = source.Icon;
                    return (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() => {
                          setSelectedSaaSource(source.id);
                          if (source.id === 'official') setSelectedSaaFormat('standard');
                          setSaaWizardStep(3);
                        }}
                        aria-pressed={active}
                        className={`py-2.5 px-3 rounded-xl border-2 text-left transition flex items-center gap-2 cursor-pointer ${
                          active
                            ? 'border-emerald-700 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300/60 dark:ring-emerald-800'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        }`}
                      >
                        <SourceIcon size={20} className="shrink-0" />
                        <span className="min-w-0">
                          <span className="block text-sm sm:text-base font-black truncate">{source.label}</span>
                          <span className={`block text-[10px] sm:text-[11px] font-semibold truncate ${active ? 'text-emerald-100' : 'text-slate-400'}`}>{source.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              {/* 步驟 3：官方選年度；原創選組卷模式 */}
              {saaWizardStep === 3 && (
              <>
              <div className="shrink-0 bg-white dark:bg-slate-900/70 rounded-2xl p-2.5 sm:p-3 border-2 border-emerald-500 dark:border-emerald-600 shadow-md shadow-emerald-500/10 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                      3
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {selectedSaaSource === 'official' ? '選擇官方題本年度' : '選擇原創組卷模式'}
                    </span>
                  </div>
                  <span className="hidden sm:inline px-2 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{selectedSaaSource === 'official' ? '原卷固定 15 聽力＋20 閱讀' : '目前尚無已核准原創題'}</span>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  {(selectedSaaSource === 'official' ? [
                    { id: 115, title: '115 年度', shortTitle: '115 年', count: 35, badge: '最新官方卷', description: '官方原題', Icon: FileText },
                    { id: 114, title: '114 年度', shortTitle: '114 年', count: 35, badge: '官方題本', description: '官方原題', Icon: FileText },
                    { id: 113, title: '113 年度', shortTitle: '113 年', count: 35, badge: '本次新增', description: '官方原題', Icon: FileText }
                  ] : [
                    {
                      id: 'standard',
                      title: '綜合模擬卷',
                      shortTitle: '綜合模擬',
                      count: 35,
                      badge: '建置中',
                      description: '原創聽力 15 題＋閱讀 20 題',
                      Icon: ClipboardCheck
                    },
                    {
                      id: 'listening',
                      title: '聽力測驗 20 題',
                      shortTitle: '聽力專項',
                      count: 20,
                      badge: '建置中',
                      description: '只從已核准的原創聽力題組卷',
                      Icon: Headphones
                    },
                    {
                      id: 'reading',
                      title: '閱讀測驗 20 題',
                      shortTitle: '閱讀專項',
                      count: 20,
                      badge: '建置中',
                      description: '只從已核准的原創閱讀題組卷',
                      Icon: BookOpen
                    }
                  ]).map((option) => {
                    const active = selectedSaaSource === 'official' ? selectedSaaYear === option.id : selectedSaaFormat === option.id;
                    const OptionIcon = option.Icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => selectedSaaSource === 'official' ? setSelectedSaaYear(option.id) : setSelectedSaaFormat(option.id)}
                        className={`w-full min-h-13 p-2 sm:p-3 rounded-xl border-2 text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                          active
                            ? 'border-emerald-700 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300/60 dark:ring-emerald-800'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                            active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                          }`}>
                            <OptionIcon size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-xs sm:text-base font-black truncate ${active ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                <span className="sm:hidden">{option.shortTitle}</span>
                                <span className="hidden sm:inline">{option.title}</span>
                              </span>
                              <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${
                                active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                              }`}>
                                {option.badge}
                              </span>
                            </div>
                            <div className={`hidden sm:block text-xs mt-0.5 truncate ${active ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                              {option.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`hidden sm:inline text-sm sm:text-lg font-black ${active ? 'text-white' : 'text-emerald-700 dark:text-emerald-300'}`}>
                            {option.count} 題
                          </span>
                          {active && <CheckCircle2 size={17} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 三大等第說明：保持單列，為瀏覽器工具列與較矮筆電預留安全高度 */}
              <div className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center gap-2 text-[10px] sm:text-[11px] font-black">
                <span className="text-emerald-700 dark:text-emerald-300">精熟 ≥85%</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-700 dark:text-amber-300">基礎 60–84%</span>
                <span className="text-slate-300">•</span>
                <span className="text-rose-700 dark:text-rose-300">待加強 &lt;60%</span>
              </div>
              </>
              )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* 模式 D：Pre A1 檢測練習 (setupSubView === 'preA1')                     */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {setupSubView === 'preA1' && (
            <div className="flex flex-col gap-2 max-w-2xl w-full mx-auto">
              <div className="shrink-0 flex items-center justify-end gap-2">
                <details className="relative">
                  <summary className="list-none w-9 h-9 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 flex items-center justify-center cursor-pointer" aria-label="查看 Pre-A1 測驗說明" title="Pre-A1 測驗說明">
                    <Info size={17} />
                  </summary>
                  <div className="absolute z-30 right-0 top-11 w-72 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-2">
                    <p><strong>正式測驗：</strong>30 題、35 分鐘，聽力自動播放兩次並寫入正式紀錄。</p>
                    <p><strong>自主練習：</strong>綜合 30 題，或選擇聽力／閱讀各 20 題。</p>
                    <p>寫作請至「拼字大師」，口說請至「聽說實驗室」練習。</p>
                  </div>
                </details>
                <button
                  type="button"
                  onClick={() => {
                    setMasteryInitialTrack('tme-preA1');
                    setSetupSubView('preA1-dashboard');
                  }}
                  className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition cursor-pointer"
                  aria-label="查看 Pre-A1 精熟診斷卡"
                  title="查看 Pre-A1 精熟診斷卡"
                >
                  <Award size={17} />
                </button>
              </div>

              <div className="shrink-0 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/70">
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'formal', title: '正式測驗', meta: '30 題・35 分鐘', Icon: GraduationCap },
                    { id: 'standard', title: '綜合練習', meta: '聽力 15＋閱讀 15', Icon: Award },
                    { id: 'listening', title: '聽力練習', meta: '20 題', Icon: Headphones },
                    { id: 'reading', title: '閱讀練習', meta: '20 題', Icon: BookOpen }
                  ].map((mode) => {
                    const active = mode.id === 'formal'
                      ? isFormalExam
                      : !isFormalExam && selectedPreA1Format === mode.id;
                    const ModeIcon = mode.Icon;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          const formal = mode.id === 'formal';
                          setIsFormalExam(formal);
                          setSelectedPreA1Format(formal ? 'standard' : mode.id);
                        }}
                        aria-pressed={active}
                        className={`min-h-14 px-3 py-2.5 rounded-xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${active ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/60 shadow-sm ring-2 ring-violet-200 dark:ring-violet-900' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-300'}`}
                      >
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                          <ModeIcon size={20} />
                        </span>
                        <span className="min-w-0 flex-1 flex items-center justify-between gap-3">
                          <span className="block text-sm sm:text-base font-black text-slate-900 dark:text-white">{mode.title}</span>
                          <span className={`text-xs font-bold ${active ? 'text-violet-700 dark:text-violet-300' : 'text-slate-400'}`}>{mode.meta}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* 模式 E：易錯題複習 (setupSubView === 'mistakes')                       */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {setupSubView === 'mistakes' && (
            <div className="flex flex-col gap-3">
              <div className="shrink-0 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-700/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-xs font-black flex items-center justify-center">
                      1
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      選擇易錯題來源
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    全部待複習：{mistakeCount} 題
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {MISTAKE_SOURCE_OPTIONS.map((source) => {
                    const active = mistakeSource === source.id;
                    return (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() => setMistakeSource(source.id)}
                        aria-pressed={active}
                        className={`py-2 px-1.5 rounded-xl border-2 text-center transition cursor-pointer ${active ? 'border-rose-600 bg-rose-600 text-white shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-rose-300'}`}
                      >
                        <span className="block text-xs sm:text-sm font-black">{source.label}</span>
                        <span className={`block text-[10px] font-bold ${active ? 'text-rose-100' : 'text-slate-400'}`}>{mistakeSourceCounts[source.id]} 題</span>
                      </button>
                    );
                  })}
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-600 shrink-0" />
                  <span>只使用所選來源的真實錯題；不補一般題。每題連續答對 2 次出庫，選定來源歸零時立即提前完成。</span>
                </div>
              </div>

              <div className="shrink-0 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-700/70 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    設定最多作答次數
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { count: 10, label: '10 題短測', desc: '最多 10 次・全精熟提早結束' },
                    { count: 20, label: '20 題長測', desc: '最多 20 次・全精熟提早結束' }
                  ].map((opt) => {
                    const active = mistakeAttemptLimit === opt.count;
                    return (
                      <button
                        key={opt.count}
                        type="button"
                        onClick={() => setMistakeAttemptLimit(opt.count)}
                        className={`py-2.5 px-2 rounded-xl border-2 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                          active
                            ? 'border-rose-600 bg-rose-600 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-rose-300'
                        }`}
                      >
                        <span className="text-sm sm:text-base font-black">{opt.label}</span>
                        <span
                          className={`text-[11px] font-bold ${
                            active ? 'text-rose-100' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  只出目前選定來源的錯題（{filteredMistakeQuestions.length} 題），絕不抓他科或湊題；達「連對 2 次全數精熟」立刻結束，未精熟最多作答 {mistakeAttemptLimit} 題即結算。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 底部功能與開始測驗 CTA（固定於底部） */}
        <div className={`shrink-0 px-3 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2 sm:gap-3 ${setupSubView === 'saa' ? 'py-2' : 'py-2.5 sm:py-3'}`}>
          {setupSubView === 'hub' ? (
            <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold">💡 提示：本年級檢定答對率 ≥ 60% 可領取金幣獎勵</span>
              <span className="font-bold hidden sm:inline">霧臺評量矩陣 v2.5</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSetupSubView('hub')}
                className={`px-3 sm:px-3.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 transition cursor-pointer flex items-center gap-1 ${setupSubView === 'saa' ? 'py-2 sm:py-2.5' : 'py-2.5'}`}
              >
                <ArrowLeft size={15} />
                <span>返回選單</span>
              </button>

              {setupSubView === 'textbook' && (
                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 py-1.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">
                    {formatBookLabel(selectedBook)}
                  </span>
                  <span>•</span>
                  <span>
                    {selectedBook === 'g1' || selectedBook === 'g2'
                      ? '全字母'
                      : rangePreset === 'midterm'
                      ? '上半冊'
                      : rangePreset === 'final'
                      ? '下半冊'
                      : rangePreset === 'all'
                      ? '全冊'
                      : `自選 ${selectedUnits.length} 單元`}
                  </span>
                  <span>•</span>
                  <span>
                    {textbookExamMode === 'comprehensive'
                      ? '綜合測驗'
                      : textbookExamMode === 'written'
                      ? '純筆試'
                      : '純聽力'}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    {questionCountOpt} 題
                  </span>
                </div>
              )}

              {setupSubView === 'saa' && (
                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 py-1.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span>{selectedSaaGrade} 年級</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    {selectedSaaSource === 'official' ? `${selectedSaaYear} 年官方卷` : '原創類題'}
                  </span>
                  <span>•</span>
                  <span>
                    {selectedSaaSource === 'official' ? '15 聽力＋20 閱讀' : selectedSaaFormat === 'standard' ? '綜合模擬' : selectedSaaFormat === 'listening' ? '純聽力' : '純閱讀'}
                  </span>
                </div>
              )}

              {setupSubView === 'preA1' && (
                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 py-1.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-violet-600 dark:text-violet-400 font-black">
                    {isFormalExam ? '正式標準' : selectedPreA1Format === 'standard' ? '綜合練習' : selectedPreA1Format === 'listening' ? '全聽力' : '全閱讀'}
                  </span>
                  <span>•</span>
                  <span>{isFormalExam || selectedPreA1Format === 'standard' ? '30 題' : '20 題'}</span>
                  {isFormalExam && <><span>•</span><span>限時 35 分</span></>}
                </div>
              )}

              {setupSubView === 'mistakes' && (
                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 py-1.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-rose-600 dark:text-rose-400 font-black">
                    {MISTAKE_SOURCE_OPTIONS.find((item) => item.id === mistakeSource)?.label || '全部'}
                  </span>
                  <span>•</span>
                  <span>{filteredMistakeQuestions.length} 題待複習</span>
                  <span>•</span>
                  <span>最多 {effectiveMistakeAttemptLimit} 次（全對提早結束）</span>
                </div>
              )}

              <button
                type="button"
                disabled={!canStart || (setupSubView === 'saa' && saaWizardStep < 3)}
                onClick={() => startExamSession()}
                className={`w-full sm:w-auto sm:min-w-[260px] rounded-2xl text-white font-black text-sm sm:text-base shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed ${setupSubView === 'saa' ? 'py-2.5 px-4 sm:px-8' : 'py-3.5 px-8'} ${
                  scopeMode === 'tme-preA1'
                    ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/25'
                    : scopeMode === 'ministry-assessment'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                    : scopeMode === 'mistakes'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
                }`}
              >
                <span>
                  {scopeMode === 'tme-preA1'
                    ? (isFormalExam
                        ? '開始 Pre-A1 正式施測 (30 題 · 限時 35 分)'
                        : (tmePool.length > 0 ? `開始 Pre-A1 練習 (${selectedPreA1Format === 'standard' ? 30 : 20} 題)` : '🚧 Pre-A1 官方題庫編製中 (敬請期待)'))
                    : scopeMode === 'ministry-assessment'
                    ? (saaPool.length > 0 ? `開始${selectedSaaSource === 'official' ? `${selectedSaaYear} 年官方卷 (35 題)` : `原創類題 (${selectedSaaFormat === 'standard' ? 35 : 20} 題)`}` : '🚧 原創類題審核建置中（官方卷可先練習）')
                    : scopeMode === 'mistakes'
                    ? (filteredMistakeQuestions.length > 0
                        ? `開始複習（上限 ${effectiveMistakeAttemptLimit} 題）`
                        : '目前沒有這個來源的易錯題')
                    : `開始檢定 (${questionCountOpt} 題)`}
                </span>
                <ArrowRight size={18} />
              </button>
            </>
          )}
        </div>
      </>
    );
  }

  // STEP 2.5: 本次測驗內容配置與說明 (Page 0 Zero-Scroll iPad Blueprint & Dossier)
  // ============================================================================
  if (phase === 'instructions') {
    const outline = buildFormOutline(questions);
    const bookMeta = HERE_WE_GO_BOOK_META[selectedBook] || HERE_WE_GO_BOOK_META[1];
    const centerTitle =
      scopeMode === 'mistakes'
        ? '個人易錯題精熟複習'
        : scopeMode === 'tme-preA1'
        ? 'Test My English Pre-A1 官方模擬檢定'
        : scopeMode === 'ministry-assessment'
        ? selectedSaaSource === 'official'
          ? `教育部 SAA 臺灣學生學習成就評量 (${selectedSaaYear} 年度 • ${selectedSaaGrade} 年級官方卷)`
          : `SAA 自主研發類題 (${selectedSaaGrade} 年級)`
        : `${formatBookLabel(selectedBook)} 課程能力檢定`;

    const candidateDisplayName = isLoggedIn
      ? formatStudentDisplayName(currentStudent)
      : '自主練習考生 (Guest)';

    const passCriteria =
      scopeMode === 'tme-preA1'
        ? 'Pre-A1 合格：答對 21 題 (70%)'
        : scopeMode === 'ministry-assessment'
        ? '精熟門檻：答對率 ≥ 85%'
        : scopeMode === 'mistakes'
        ? '連續答對 2 次判定精熟出庫'
        : isSelectedBookOwnGrade
        ? '本年級合格率 ≥ 60% 獎勵金幣'
        : '自主練習 (免計英雄榜)';

    const hasAudioSection = outline.some((p) => p.audio);

    return renderShell(
      <>
        {/* 頂端精簡導覽列 */}
        <div className="shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/80 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => setPhase('setup')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            重選範圍
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <ClipboardCheck className="text-indigo-600 dark:text-indigo-400 shrink-0" size={18} />
            <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white truncate">
              {centerTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsRulesModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="查看作答守則與檢定說明"
            >
              <Info size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">應試守則</span>
            </button>
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              共 {questions.length} 題
            </span>
          </div>
        </div>

        {/* 主體內容（iPad 一頁內免捲動自適應佈局） */}
        <div className="flex-1 min-h-0 p-3 sm:p-5 flex flex-col justify-between max-w-3xl mx-auto w-full gap-3 overflow-hidden">
          {/* 1. 次要資訊精簡膠囊列 (考生、時間、合格標準) */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 text-xs">
            <div className="flex items-center gap-1.5 text-slate-750 dark:text-slate-200 font-bold min-w-0">
              <UserCheck size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-none">{candidateDisplayName}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-semibold text-[11px] sm:text-xs">
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-slate-400" />
                約 {Math.max(15, Math.ceil(questions.length * 1.2))} 分鐘
              </span>
              <span>•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{passCriteria}</span>
            </div>
          </div>

          {/* 2. 主要資訊一：試卷大題題型分布藍圖 (Exam Blueprint Pills) */}
          <div className="flex-1 min-h-0 flex flex-col justify-center space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <ClipboardCheck size={15} className="text-indigo-600 dark:text-indigo-400" />
                試卷題型分布藍圖 (共 {questions.length} 題)
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {outline.length} 個大題部分
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto max-h-[220px] sm:max-h-none pr-0.5">
              {outline.map((part, idx) => {
                const isAudio = part.audio;
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-800/90 rounded-xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-2xs hover:border-indigo-400 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-white truncate flex items-center gap-1.5">
                          <span>{part.label}</span>
                          {isAudio && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 flex items-center gap-0.5 shrink-0">
                              <Headphones size={10} />
                              聽力
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                          {part.sectionLabel}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shrink-0 ml-2">
                      第 {part.start}–{part.end} 題 ({part.end - part.start + 1} 題)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. 主要資訊二：考前耳機與音量檢驗互動條 (精簡文字，<15字) */}
          <div className="shrink-0">
            {hasAudioSection ? (
              <div className="p-3 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Headphones size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                      含聽力大題，請確認設備音量
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={runAudioTest}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                      isPlayingAudioTest
                        ? 'bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-400'
                        : 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Volume2 size={14} className={isPlayingAudioTest ? 'animate-bounce' : ''} />
                    <span>{isPlayingAudioTest ? '播放中...' : '試聽發音'}</span>
                  </button>

                  {scopeMode === 'curriculum' && (
                    <button
                      type="button"
                      onClick={switchToWrittenMode}
                      className="px-2 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                      title="沒耳機？點此切換為純筆試"
                    >
                      轉純筆試
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                  <FileText size={15} className="text-slate-500 shrink-0" />
                  <span>純筆試測驗 • 全卷無聽力題，請安心作答</span>
                </div>
                <span className="text-[11px] text-slate-400">作答中仍可隨時點擊發音輔助</span>
              </div>
            )}
          </div>

          {/* 4. 主要資訊三：準備好了開始作答按鈕 (Big, tactile CTA) */}
          <div className="shrink-0 pt-1">
            <button
              type="button"
              onClick={() => {
                setStartTime(Date.now());
                setElapsedSec(0);
                setCurrentIndex(0);
                setPhase('exam');
              }}
              className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>
                {scopeMode === 'mistakes'
                  ? `準備好了，開始複習（上限 ${questions.length} 題・全精熟即結束）`
                  : `準備好了，開始作答 (${questions.length} 題)`}
              </span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* 考前應試守則說明彈窗 (固定資訊優雅收納，點擊小圖示即可開啟) */}
        {isRulesModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-base">
                  <Info size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <span>應試指南與作答守則</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRulesModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-1">
                  <div className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Flag size={14} />
                    <span>標記待查與防漏答</span>
                  </div>
                  <p className="text-[11px] text-slate-650 dark:text-slate-300">
                    不確定答案時可點擊右上角旗幟標記，交卷前系統會提示未答題數以防疏漏。
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-1">
                  <div className="font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Headphones size={14} />
                    <span>語音朗讀與聽力播放</span>
                  </div>
                  <p className="text-[11px] text-slate-650 dark:text-slate-300">
                    聽力試題依檢定標準播放兩次，一般讀寫題亦可點擊題目旁的喇叭按鈕進行發音輔助。
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-1">
                  <div className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>自動暫存與斷線續考</span>
                  </div>
                  <p className="text-[11px] text-slate-650 dark:text-slate-300">
                    作答中進度每題自動儲存，若遇設備斷線或意外關閉，6 小時內重新進入皆可無縫接續。
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                我瞭解了，關閉說明
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // ============================================================================
  // STEP 3: 開始測驗 (一頁一題、專業語言檢定風格、頂端三欄極簡列)
  // ============================================================================
  if (phase === 'exam') {
    const currentQ = questions[currentIndex];
    const selectedChoice = answers[currentIndex];
    const isFlagged = !!flagged[currentIndex];
    const answeredCount = Object.keys(answers).length;

    if (!currentQ) return null;

    const isSaaGroupQuestion = scopeMode === 'ministry-assessment' && Boolean(currentQ.groupId && currentQ.passage);
    const groupQuestions = isSaaGroupQuestion
      ? questions.filter((q) => q.groupId === currentQ.groupId)
      : [];
    const groupQuestionIndex = isSaaGroupQuestion
      ? groupQuestions.findIndex((q) => q.id === currentQ.id)
      : -1;
    const openMaterial = (materialData) => {
      if (!materialData) return;
      setZoomedMaterial({
        image: materialData.image || null,
        title: materialData.title || '題目圖片',
        text: materialData.text || '',
      });
    };

    const currentTaskLabel = getTaskLabel(currentQ);
    const centerScopeTitle =
      scopeMode === 'mistakes'
        ? `個人易錯題 · ${currentTaskLabel}`
        : scopeMode === 'tme-preA1'
        ? `Pre-A1 模擬 · ${currentTaskLabel}`
        : scopeMode === 'ministry-assessment'
        ? `SAA 學力模考 · ${currentTaskLabel}`
        : `${formatBookLabel(selectedBook)} · ${currentTaskLabel}`;

    return renderShell(
      <>
        {/* 頂端三欄極簡狀態列：左「離開」、中「測驗冊別」、右「題號進度與標記」 */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 grid grid-cols-3 items-center bg-slate-50/90 dark:bg-slate-900/90">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1 transition"
            >
              <ArrowLeft size={15} />
              離開
            </button>
            {isFormalExam && (
              <span className={`px-2.5 py-1 rounded-lg border font-mono font-black text-xs flex items-center gap-1 ${
                Math.max(0, 2100 - elapsedSec) < 300
                  ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                  : 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                <Clock size={13} />
                <span>{formatTime(Math.max(0, 2100 - elapsedSec))}</span>
              </span>
            )}
          </div>

          <div className="text-center truncate font-black text-sm sm:text-base text-slate-800 dark:text-slate-100">
            {centerScopeTitle}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={toggleFlagCurrent}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition ${
                isFlagged
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="標記待檢查"
            >
              <Flag size={13} className={isFlagged ? 'fill-amber-500 text-amber-500' : ''} />
              <span className="hidden sm:inline">{isFlagged ? '已標記' : '標記'}</span>
            </button>
            <span className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white font-black text-xs sm:text-sm">
              {scopeMode === 'mistakes'
                ? `${currentIndex + 1} / 上限 ${questions.length}`
                : `${currentIndex + 1} / ${questions.length}`}
            </span>
          </div>
        </div>

        {/* 中央單題試題區（固定於容器內，不捲動） */}
        <div
          key={currentQ.id}
          className={`flex-1 min-h-0 px-4 sm:px-8 py-4 sm:py-6 gap-4 overflow-y-auto overscroll-contain transition-opacity duration-150 ${
            isSaaGroupQuestion
              ? 'flex flex-col lg:grid lg:grid-cols-[minmax(300px,42%)_minmax(0,58%)] lg:items-stretch'
              : 'flex flex-col justify-between'
          }`}
        >
          {isSaaGroupQuestion && (
            <aside data-testid="saa-group-material" className="lg:sticky lg:top-0 self-start w-full max-h-none lg:max-h-[calc(100vh-12rem)] overflow-hidden rounded-2xl border-2 border-emerald-300/80 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/25 shadow-sm">
              <div className="px-3.5 py-2.5 bg-emerald-100/90 dark:bg-emerald-900/50 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-black text-emerald-900 dark:text-emerald-100 text-sm truncate">
                    {currentQ.passage.title || '共用題組材料'}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    題組第 {groupQuestionIndex + 1} / {groupQuestions.length} 題 · 左側材料跨題共用
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openMaterial(currentQ.passage)}
                  className="shrink-0 px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1 cursor-zoom-in"
                >
                  <Maximize2 size={14} />
                  放大
                </button>
              </div>
              {currentQ.passage.image ? (
                <button
                  type="button"
                  onClick={() => openMaterial(currentQ.passage)}
                  className="w-full p-2 sm:p-3 bg-white dark:bg-slate-950 cursor-zoom-in flex justify-center"
                  title="點擊放大題組材料"
                >
                  <img
                    src={currentQ.passage.image}
                    alt={currentQ.passage.title || '題組材料'}
                    className="max-h-[42vh] lg:max-h-[calc(100vh-17rem)] max-w-full w-auto object-contain rounded-lg"
                    loading="eager"
                  />
                </button>
              ) : (
                <div className="p-4 max-h-[42vh] lg:max-h-[calc(100vh-17rem)] overflow-y-auto whitespace-pre-line font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {currentQ.passage.text}
                </div>
              )}
            </aside>
          )}

          <div data-testid={isSaaGroupQuestion ? 'saa-group-question' : undefined} className={`min-w-0 flex flex-col gap-4 ${isSaaGroupQuestion ? 'justify-start' : 'flex-1 justify-between'}`}>
          {/* 題幹區 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Question {currentIndex + 1}
              </span>
              <div className="flex items-center gap-1.5">
                {reportedQuestions[currentQ.id] ? (
                  <span className="px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    已回報
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenReportModal(currentQ)}
                    className="px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50/80 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    title="題目有問題？點此快速回報給老師"
                  >
                    <AlertTriangle size={13} />
                    回報問題
                  </button>
                )}
                {isEarlyGrade && (
                  <button
                    type="button"
                    onClick={() => setAutoReadEarlyGrade((prev) => !prev)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                      autoReadEarlyGrade
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500'
                    }`}
                    title="切換是否在換題時自動朗讀題目"
                  >
                    <span>{autoReadEarlyGrade ? '🔊 自動讀題：開' : '🔈 自動讀題：關'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeakingStem) {
                      stopQuestionSpeech();
                    } else {
                      playQuestionAudio(currentQ);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    isSpeakingStem
                      ? 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 animate-pulse'
                      : isEarlyGrade
                        ? 'border-amber-400 bg-amber-500 hover:bg-amber-600 text-white font-black shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Volume2 size={14} className={isSpeakingStem ? 'animate-bounce' : ''} />
                  <span>{isSpeakingStem ? '停止朗讀' : isEarlyGrade ? '🔊 念題目' : '朗讀題幹'}</span>
                </button>
              </div>
            </div>

            {isSaaGroupQuestion && (
              <button
                type="button"
                onClick={() => openMaterial(currentQ.passage)}
                className="lg:hidden w-full px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black flex items-center justify-center gap-2 shadow-sm cursor-zoom-in"
              >
                <Maximize2 size={16} />
                隨時查看／放大共用題組材料
              </button>
            )}

            {/* 一、二年級專屬大喇叭友善讀題橫幅 */}
            {isEarlyGrade && (
              <div className="flex items-center justify-between gap-3 my-2 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-300 dark:border-amber-700/60 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isSpeakingStem) {
                        stopQuestionSpeech();
                      } else {
                        speakQuestion(currentQ.question);
                      }
                    }}
                    className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-sm sm:text-base flex items-center gap-2 shadow-sm transition cursor-pointer active:scale-95 shrink-0 ${
                      isSpeakingStem
                        ? 'bg-rose-500 hover:bg-rose-600 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                    }`}
                  >
                    <Volume2 size={20} className={isSpeakingStem ? 'animate-bounce text-yellow-200' : ''} />
                    <span>{isSpeakingStem ? '⏹️ 停止念題' : '🔊 念題目給我聽'}</span>
                  </button>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                      <span>一、二年級語音輔助</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-bold">
                        國語發音
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-800 dark:text-amber-300 truncate">
                      看不懂國字沒關係，點按鈕聽老師念題目！
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentQ.passage && !isSaaGroupQuestion && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-indigo-50/70 dark:bg-slate-800/90 border border-indigo-200/80 dark:border-slate-700 text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 mb-2">
                <div className="font-black text-indigo-700 dark:text-indigo-400 mb-1.5 flex items-center gap-1.5 text-xs sm:text-sm">
                  <BookOpen size={16} />
                  <span>{currentQ.passage.title || '【生活閱讀篇章】'}</span>
                </div>
                <div className="font-mono text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {currentQ.passage.text}
                </div>
              </div>
            )}
            <div className="flex items-start gap-2.5 py-1">
              {isEarlyGrade && (
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeakingStem) {
                      stopQuestionSpeech();
                    } else {
                      speakQuestion(currentQ.question);
                    }
                  }}
                  className={`shrink-0 p-2 rounded-xl transition cursor-pointer mt-0.5 border-2 ${
                    isSpeakingStem
                      ? 'bg-rose-100 border-rose-300 text-rose-700 animate-pulse'
                      : 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800 dark:bg-amber-900/60 dark:border-amber-700 dark:text-amber-200 shadow-xs'
                  }`}
                  title="點擊聽老師念題目"
                >
                  <Volume2 size={20} className={isSpeakingStem ? 'animate-bounce' : ''} />
                </button>
              )}
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-wide leading-snug">
                {formatQuestionStem(currentQ.question)}
              </div>
            </div>

            {/* 寫作重組專屬：彩色立體磁吸單字積木架 (3D Magnetic Word Blocks Rack) */}
            {(currentQ.tokens || currentQ.scrambledWords) && (
              <div className="my-3 sm:my-4 p-3.5 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-100/95 via-slate-50 to-slate-200/90 dark:from-slate-800/90 dark:to-slate-900/90 border-2 border-slate-300 dark:border-slate-700 shadow-inner flex flex-col gap-3">
                {/* 頂部標籤列：句型徽章與提示 */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {currentQ.pattern && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs">
                        {currentQ.pattern}
                      </span>
                    )}
                    <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1">
                      <span>🧲</span>
                      <span>磁吸單字積木（點擊積木發音）</span>
                    </span>
                  </div>
                  {currentQ.chinese && (
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      中文語意：{currentQ.chinese}
                    </span>
                  )}
                </div>

                {/* 對話情境填空框 (若題目有 contextPrompt) */}
                {currentQ.contextPrompt && (
                  <div className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed shadow-xs">
                    {currentQ.contextPrompt}
                  </div>
                )}

                {/* 3D 磁吸積木展示槽 (Magnetic Rack Tray) */}
                <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 min-h-[72px]">
                  {(currentQ.tokens || currentQ.scrambledWords || []).map((word, wIdx) => {
                    const CHIP_PALETTES = [
                      'bg-rose-500 hover:bg-rose-600 text-white border-b-4 border-rose-700 shadow-rose-200 dark:shadow-none',
                      'bg-sky-500 hover:bg-sky-600 text-white border-b-4 border-sky-700 shadow-sky-200 dark:shadow-none',
                      'bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 shadow-emerald-200 dark:shadow-none',
                      'bg-amber-500 hover:bg-amber-600 text-white border-b-4 border-amber-700 shadow-amber-200 dark:shadow-none',
                      'bg-indigo-500 hover:bg-indigo-600 text-white border-b-4 border-indigo-700 shadow-indigo-200 dark:shadow-none',
                      'bg-fuchsia-500 hover:bg-fuchsia-600 text-white border-b-4 border-fuchsia-700 shadow-fuchsia-200 dark:shadow-none',
                      'bg-teal-500 hover:bg-teal-600 text-white border-b-4 border-teal-700 shadow-teal-200 dark:shadow-none',
                      'bg-purple-500 hover:bg-purple-600 text-white border-b-4 border-purple-700 shadow-purple-200 dark:shadow-none',
                    ];
                    const colorClass = CHIP_PALETTES[wIdx % CHIP_PALETTES.length];

                    return (
                      <button
                        key={wIdx}
                        type="button"
                        onClick={() => speakQuestion(word)}
                        title="點擊聆聽單字發音"
                        className={`group relative px-3.5 py-2 sm:px-4.5 sm:py-2.5 rounded-2xl font-black text-base sm:text-lg tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-1 cursor-pointer select-none shadow-md flex items-center gap-1.5 ${colorClass}`}
                      >
                        <span className="w-2 h-2 rounded-full bg-white/40 shadow-inner block shrink-0" />
                        <span>{word}</span>
                        <Volume2 size={13} className="opacity-0 group-hover:opacity-80 transition-opacity ml-0.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentQ.image && (
              <div className="flex justify-center my-2 sm:my-3">
                <button
                  type="button"
                  onClick={() => openMaterial({ image: currentQ.image, title: `第 ${currentQ.number || currentIndex + 1} 題圖片` })}
                  className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-1.5 cursor-zoom-in group"
                  title="點擊放大圖片"
                >
                  <img
                    src={currentQ.image}
                    alt="題目插圖"
                    className="max-h-52 sm:max-h-64 max-w-full w-auto object-contain rounded-lg group-hover:scale-[1.01] transition-transform"
                    loading="eager"
                  />
                  <span className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/75 text-white text-[11px] font-black flex items-center gap-1 shadow">
                    <Maximize2 size={12} /> 點擊放大
                  </span>
                </button>
              </div>
            )}

            {/* 聽力題專屬播放卡片（學生端完全隱藏字稿，僅留播放鈕） */}
            {currentQ.media?.audioText && (
              <div className="flex flex-col items-center justify-center p-3 sm:p-4 my-2 rounded-2xl bg-indigo-50/80 dark:bg-slate-800/80 border border-indigo-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => isPlayingOfficialAudio ? stopQuestionSpeech() : playQuestionAudio(currentQ)}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Volume2 size={16} />
                  <span>{isPlayingOfficialAudio ? '⏹️ 停止官方原聲' : currentQ.media.audioSrc ? '🎧 播放官方原聲' : isDialogue(currentQ.media.audioText) ? '🎭 播放情境對話語音' : '🎧 播放聽力語音'}</span>
                </button>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                  {currentQ.media.audioSrc
                    ? audioPlaybackMode === 'fallback'
                      ? '⚠️ 官方原聲載入失敗，已自動切換美式語音備援'
                      : audioPlaybackMode === 'official'
                        ? '✓ 正在播放官方試卷原始錄音'
                        : '官方原聲已預載；僅在載入失敗時切換美式語音備援'
                    : '可反覆點擊按鈕聆聽發音'}
                </span>
              </div>
            )}
          </div>

          {/* (A)(B)(C)(D) 選項區 (支援線稿圖檔選項與文字選項) */}
          <div className="my-auto w-full">
            {currentQ.optionImages && currentQ.optionImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {currentQ.optionImages.map((imgSrc, optIdx) => {
                  const isChosen = selectedChoice === optIdx;
                  return (
                    <div
                      key={optIdx}
                      className={`relative rounded-2xl border-2 text-center transition overflow-hidden ${
                        isChosen
                          ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/70 shadow-md ring-2 ring-indigo-400'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 hover:shadow-xs'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        className="w-full h-full p-3 sm:p-4 text-center flex flex-col items-center justify-between gap-2 cursor-pointer"
                      >
                      <div className="flex items-center justify-between w-full pr-9">
                        <span
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 ${
                            isChosen
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {CHOICE_LABELS[optIdx]}
                        </span>
                        {isChosen && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            已選
                          </span>
                        )}
                      </div>

                      <div className="w-full h-24 sm:h-32 flex items-center justify-center p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                        <img
                          src={imgSrc}
                          alt={currentQ.optionAltTexts?.[optIdx] || `選項 ${CHOICE_LABELS[optIdx]}`}
                          className="max-h-full max-w-full object-contain"
                          draggable={false}
                        />
                      </div>

                      <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                        {currentQ.options?.[optIdx] || `選項 (${CHOICE_LABELS[optIdx]})`}
                      </span>
                      </button>
                      <button
                        type="button"
                        data-testid="option-image-zoom"
                        onClick={() => openMaterial({ image: imgSrc, title: `第 ${currentQ.number || currentIndex + 1} 題選項 ${CHOICE_LABELS[optIdx]}` })}
                        className="absolute top-2.5 right-2.5 z-10 p-2 rounded-xl bg-slate-900/80 hover:bg-indigo-700 text-white shadow-lg cursor-zoom-in"
                        title={`放大選項 ${CHOICE_LABELS[optIdx]} 圖片`}
                        aria-label={`放大選項 ${CHOICE_LABELS[optIdx]} 圖片`}
                      >
                        <Maximize2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                {currentQ.options.map((optText, optIdx) => {
                  const isChosen = selectedChoice === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full px-4 py-3 sm:py-4 rounded-2xl border-2 text-left transition flex items-center gap-3.5 ${
                        isChosen
                          ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-950 dark:text-white font-black shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 hover:border-indigo-300 text-slate-800 dark:text-slate-100 font-bold'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-sm sm:text-base shrink-0 ${
                          isChosen
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {CHOICE_LABELS[optIdx]}
                      </span>
                      <span className="text-base sm:text-lg md:text-xl leading-snug">{optText}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          </div>
        </div>

        {/* 底部導覽列：上一題 / 題號圓點列 / 下一題或交卷 */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentIndex === 0 || scopeMode === 'mistakes'}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-40 font-black text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition"
          >
            <ArrowLeft size={16} />
            上一題
          </button>

          {/* 單行可橫向滑動題號列（絕不撐高頁面） */}
          <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto py-1 no-scrollbar">
            {questions.map((_, idx) => {
              const isCurr = idx === currentIndex;
              const isAns = answers[idx] !== undefined;
              const isFlg = !!flagged[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  disabled={scopeMode === 'mistakes' && idx !== currentIndex}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[11px] font-black shrink-0 transition relative flex items-center justify-center ${
                    isCurr
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : isAns
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800'
                        : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {idx + 1}
                  {isFlg && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
                  )}
                </button>
              );
            })}
          </div>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={handleAdvanceQuestion}
              disabled={scopeMode === 'mistakes' && answers[currentIndex] === undefined}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shrink-0 shadow-sm transition"
            >
              下一題
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRequestSubmit}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shrink-0 shadow-sm transition"
            >
              <CheckCircle2 size={16} />
              交卷計分
            </button>
          )}
        </div>

        {/* 未答完確認視窗 */}
        {showUnansweredConfirm && (
          <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                尚有未作答題目
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                目前還有{' '}
                <span className="font-black text-rose-600">
                  {questions.length - answeredCount} 題
                </span>{' '}
                尚未作答。確定要直接交卷嗎？
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowUnansweredConfirm(false);
                    const firstMissing = questions.findIndex((_, idx) => answers[idx] === undefined);
                    if (firstMissing !== -1) setCurrentIndex(firstMissing);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
                >
                  返回檢查未答題
                </button>
                <button
                  type="button"
                  onClick={finalizeExam}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black"
                >
                  確定交卷
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 中途離開確認視窗 */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {scopeMode === 'mistakes' ? '確定要中途離開錯題複習嗎？' : '確定要中止本次檢定嗎？'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {scopeMode === 'mistakes' && answeredCount > 0
                  ? `目前已作答 ${answeredCount} 題；您可以先結算目前已練進度並保存精熟次數，或放棄本次進度直接離開。`
                  : '離開後本次尚未交卷的作答進度將不會計分。'}
              </p>
              <div className="flex flex-col gap-2 pt-1">
                {scopeMode === 'mistakes' && answeredCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const answeredEntries = questions
                        .map((q, idx) => ({ q, ans: answers[idx] }))
                        .filter((item) => item.ans !== undefined);
                      const completedQs = answeredEntries.map((item) => item.q);
                      const completedAns = Object.fromEntries(
                        answeredEntries.map((item, idx) => [idx, item.ans])
                      );
                      setShowExitConfirm(false);
                      finalizeExam({
                        questions: completedQs,
                        answers: completedAns,
                        scopeMode: 'mistakes',
                        elapsedSec
                      });
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition cursor-pointer"
                  >
                    保存已練 {answeredCount} 題進度並結算
                  </button>
                )}
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
                  >
                    繼續作答
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearInProgress(inProgressKey);
                      setSavedSession(null);
                      setShowExitConfirm(false);
                      setPhase('setup');
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black"
                  >
                    放棄進度回設定頁
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {zoomedMaterial && (
          <div
            data-testid="exam-image-zoom"
            className="fixed inset-0 z-[90] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5"
            onClick={() => setZoomedMaterial(null)}
            role="dialog"
            aria-modal="true"
            aria-label={zoomedMaterial.title || '放大題目材料'}
          >
            <div
              className="w-full max-w-6xl max-h-[94vh] rounded-2xl bg-white dark:bg-slate-900 border border-white/20 shadow-2xl overflow-hidden flex flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="font-black text-slate-900 dark:text-white truncate">
                  {zoomedMaterial.title || '題目材料'}
                </div>
                <button
                  type="button"
                  onClick={() => setZoomedMaterial(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-200"
                  aria-label="關閉放大圖片"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="min-h-0 overflow-auto p-2 sm:p-4 flex flex-col items-center gap-3 bg-slate-100 dark:bg-slate-950">
                {zoomedMaterial.image && (
                  <img
                    src={zoomedMaterial.image}
                    alt={zoomedMaterial.title || '放大題目材料'}
                    className="max-w-full max-h-[78vh] w-auto h-auto object-contain rounded-xl bg-white shadow-lg"
                  />
                )}
                {!zoomedMaterial.image && zoomedMaterial.text && (
                  <div className="w-full max-w-4xl p-5 sm:p-7 rounded-xl bg-white dark:bg-slate-900 whitespace-pre-line font-mono text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-100">
                    {zoomedMaterial.text}
                  </div>
                )}
                {zoomedMaterial.image && zoomedMaterial.text && (
                  <details className="w-full max-w-4xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <summary className="px-4 py-2.5 cursor-pointer font-bold text-sm text-indigo-700 dark:text-indigo-300">
                      顯示無障礙文字版材料
                    </summary>
                    <div className="px-4 pb-4 whitespace-pre-line font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                      {zoomedMaterial.text}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ============================================================================
  // STEP 4 & 5: 結算金幣與單題翻頁式檢定報告 (Result & Paged Review - Zero Scroll)
  // ============================================================================
  const totalQ = questions.length || 1;
  const correctList = questions.filter((q, idx) => answers[idx] === q.answer);
  const wrongList = questions.filter((q, idx) => answers[idx] !== q.answer);
  const score = Math.round((correctList.length / totalQ) * 100);

  const reviewItems = questions
    .map((q, idx) => ({ q, idx, userChoice: answers[idx], isCorrect: answers[idx] === q.answer }))
    .filter((item) => (reviewFilter === 'wrong' ? !item.isCorrect || flagged[item.idx] : true));

  const safeReviewIdx = Math.min(
    Math.max(0, reviewPageIndex),
    Math.max(0, reviewItems.length - 1)
  );
  const currentReviewItem = reviewItems[safeReviewIdx] || null;

  return renderShell(
    <>
      {/* 頂端導覽列 */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90">
        <button
          type="button"
          onClick={() => setPhase('setup')}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition"
        >
          <ArrowLeft size={15} />
          返回
        </button>

        <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
          <Award size={18} className="text-indigo-600 dark:text-indigo-400" />
          <span>檢定結果</span>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
        >
          回首頁
        </button>
      </div>

      {/* 主體：電腦雙欄（左成績、右單題翻頁詳解）；手機上下排列，內容超出時可上下滑動 */}
      <div className="flex-1 min-h-0 p-3 sm:p-5 flex flex-col gap-3 overflow-y-auto overscroll-contain lg:grid lg:grid-cols-12 lg:gap-4 lg:overflow-hidden">
        {/* 左欄：成績（得分旁直接顯示本次金幣） */}
        <div className="shrink-0 lg:col-span-4 bg-slate-50/90 dark:bg-slate-800/50 rounded-2xl p-3 sm:p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3">
          <div className="space-y-2.5 sm:space-y-3">
            {/* 分數、答對題數與金幣 */}
            <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-400 truncate">
                  {scopeMode === 'mistakes'
                    ? '易錯題複習'
                    : scopeMode === 'tme-preA1'
                    ? 'Pre-A1 官方模擬'
                    : scopeMode === 'ministry-assessment'
                    ? 'SAA 學力模考'
                    : `${formatBookLabel(selectedBook)}檢定`}
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  答對 {correctList.length} / {totalQ} 題
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {formatTime(elapsedSec)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div
                  title={sessionRewardInfo.reason}
                  className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-black text-sm sm:text-base border ${
                    sessionRewardInfo.coinsEarned > 0
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <Coins size={16} className="shrink-0" />+{sessionRewardInfo.coinsEarned}
                </div>
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center text-white shadow-md ${
                    score >= 60 ? 'bg-indigo-600' : 'bg-rose-600'
                  }`}
                >
                  <span className="text-[10px] font-bold opacity-80">得分</span>
                  <span className="text-2xl sm:text-3xl font-black leading-none">{score}</span>
                </div>
              </div>
            </div>

            {!isLoggedIn && sessionRewardInfo.coinsEarned > 0 && (
              <button
                type="button"
                onClick={openModal}
                className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition"
              >
                登入以入帳金幣
              </button>
            )}

            {scopeMode === 'mistakes' && (
              <div className={`px-3 py-2.5 rounded-xl border text-xs font-black ${
                sessionRewardInfo.clearedSource
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
              }`}>
                {sessionRewardInfo.clearedSource
                  ? `🎉 選定來源的易錯題已歸零，於 ${questions.length} 次作答後${sessionRewardInfo.earlyCleared ? '提前' : ''}完成。`
                  : `已達本次最多 ${sessionRewardInfo.attemptLimit || questions.length} 次作答；尚未精熟的題目會保留到下次。`}
              </div>
            )}

            {/* 分項診斷成績 */}
            {taskBreakdown.length > 0 && (
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  <span>📊 題型分項表現</span>
                  <span className="text-[10px] text-slate-400 font-bold">答對 / 該題型題數</span>
                </div>
                <div className="space-y-1.5">
                  {taskBreakdown.map((row) => {
                    const pct = row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0;
                    return (
                      <div key={row.taskType} className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600 dark:text-slate-300">
                          {row.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 dark:text-slate-100">
                            {row.correct} / {row.total}
                          </span>
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                              pct >= 80
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : pct >= 60
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 易錯題池變動紀錄（一行精簡） */}
            {(sessionRewardInfo.graduatedCount > 0 || sessionRewardInfo.addedMistakeCount > 0) && (
              <div className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold flex flex-wrap gap-x-3 gap-y-0.5">
                {sessionRewardInfo.graduatedCount > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    ✓ 易錯題移出 {sessionRewardInfo.graduatedCount} 題
                  </span>
                )}
                {sessionRewardInfo.addedMistakeCount > 0 && (
                  <span className="text-rose-600 dark:text-rose-400">
                    • 新增易錯題 {sessionRewardInfo.addedMistakeCount} 題
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 操作按鈕組 */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {wrongList.length > 0 && (
              <button
                type="button"
                onClick={() => startExamSession(wrongList, wrongList.length)}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw size={15} />
                錯題重練 ({wrongList.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => startExamSession()}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw size={15} />
              再測一次
            </button>
          </div>
        </div>

        {/* 右欄：一頁一題翻頁式詳解檢視卡（免上下捲動） */}
        <div className="shrink-0 lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3 lg:overflow-hidden lg:min-h-0">
          {/* 篩選與題目翻頁控制列 */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setReviewFilter('wrong');
                  setReviewPageIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                  reviewFilter === 'wrong'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                只看錯題 ({wrongList.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setReviewFilter('all');
                  setReviewPageIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                  reviewFilter === 'all'
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                全部題目 ({questions.length})
              </button>
            </div>

            {reviewItems.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safeReviewIdx === 0}
                  onClick={() => setReviewPageIndex((i) => Math.max(0, i - 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-xs font-black flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  上一題
                </button>
                <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                  {safeReviewIdx + 1} / {reviewItems.length}
                </span>
                <button
                  type="button"
                  disabled={safeReviewIdx >= reviewItems.length - 1}
                  onClick={() =>
                    setReviewPageIndex((i) => Math.min(reviewItems.length - 1, i + 1))
                  }
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-xs font-black flex items-center gap-1"
                >
                  下一題
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>

          {/* 單題詳解內容 */}
          {currentReviewItem ? (
            <div className="flex-1 flex flex-col justify-between gap-2.5 lg:min-h-0 lg:overflow-y-auto">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-black ${
                        currentReviewItem.isCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                      }`}
                    >
                      第 {currentReviewItem.idx + 1} 題 •{' '}
                      {currentReviewItem.isCorrect ? '✓ 答對' : '✗ 答錯'}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {formatBookLabel(currentReviewItem.q.book)} • {currentReviewItem.q.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isFormalExam && (
                      reportedQuestions[currentReviewItem.q.id] ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          已回報
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenReportModal(currentReviewItem.q)}
                          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 transition cursor-pointer"
                          title="若答案或題目有誤，點此回報給老師"
                        >
                          <AlertTriangle size={13} />
                          回報疑義
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => speakQuestion(currentReviewItem.q.question)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                    >
                      <Volume2 size={14} />
                      朗讀
                    </button>
                  </div>
                </div>

                {currentReviewItem.q.passage && (
                  <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-slate-800/90 border border-indigo-200/80 dark:border-slate-700 text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 mb-2">
                    <div className="font-black text-indigo-700 dark:text-indigo-400 mb-1.5 flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <BookOpen size={14} className="shrink-0" />
                        <span className="truncate">{currentReviewItem.q.passage.title || '【生活閱讀篇章】'}</span>
                      </span>
                      {(currentReviewItem.q.passage.image || currentReviewItem.q.passage.text) && (
                        <button
                          type="button"
                          onClick={() => setZoomedMaterial({
                            image: currentReviewItem.q.passage.image || null,
                            title: currentReviewItem.q.passage.title || '共用題組材料',
                            text: currentReviewItem.q.passage.text || '',
                          })}
                          className="shrink-0 px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black flex items-center gap-1 cursor-zoom-in"
                        >
                          <Maximize2 size={12} /> 放大
                        </button>
                      )}
                    </div>
                    {currentReviewItem.q.passage.image && (
                      <button
                        type="button"
                        onClick={() => setZoomedMaterial({
                          image: currentReviewItem.q.passage.image,
                          title: currentReviewItem.q.passage.title || '共用題組材料',
                          text: currentReviewItem.q.passage.text || '',
                        })}
                        className="w-full mb-2 p-1.5 rounded-xl bg-white dark:bg-slate-950 border border-indigo-100 dark:border-slate-700 cursor-zoom-in flex justify-center"
                        title="點擊放大題組材料"
                      >
                        <img
                          src={currentReviewItem.q.passage.image}
                          alt={currentReviewItem.q.passage.title || '共用題組材料'}
                          className="max-h-52 max-w-full object-contain rounded-lg"
                          loading="lazy"
                        />
                      </button>
                    )}
                    <div className="font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {currentReviewItem.q.passage.text}
                    </div>
                  </div>
                )}

                <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {formatQuestionStem(currentReviewItem.q.question)}
                </div>

                {currentReviewItem.q.image && (
                  <div className="flex justify-center my-2">
                    <button
                      type="button"
                      onClick={() => setZoomedMaterial({ image: currentReviewItem.q.image, title: `第 ${currentReviewItem.idx + 1} 題圖片`, text: '' })}
                      className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-1.5 cursor-zoom-in group"
                      title="點擊放大圖片"
                    >
                      <img
                        src={currentReviewItem.q.image}
                        alt="題目插圖"
                        className="max-h-48 sm:max-h-56 max-w-full w-auto object-contain rounded-lg group-hover:scale-[1.01] transition-transform"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/75 text-white text-[11px] font-black flex items-center gap-1 shadow">
                        <Maximize2 size={12} /> 點擊放大
                      </span>
                    </button>
                  </div>
                )}

                {/* 寫作重組單字卡回顧 */}
                {(currentReviewItem.q.tokens || currentReviewItem.q.scrambledWords) && (
                  <div className="my-2.5 p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-inner">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>🧲</span>
                        <span>給定磁吸單字積木：</span>
                      </span>
                      {currentReviewItem.q.pattern && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {currentReviewItem.q.pattern}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {(currentReviewItem.q.tokens || currentReviewItem.q.scrambledWords || []).map((word, wIdx) => {
                        const PALETTES = [
                          'bg-rose-500 text-white',
                          'bg-sky-500 text-white',
                          'bg-emerald-500 text-white',
                          'bg-amber-500 text-white',
                          'bg-indigo-500 text-white',
                          'bg-fuchsia-500 text-white',
                          'bg-teal-500 text-white',
                          'bg-purple-500 text-white'
                        ];
                        return (
                          <span
                            key={wIdx}
                            className={`px-2.5 py-1 rounded-xl text-xs font-black shadow-xs ${PALETTES[wIdx % PALETTES.length]}`}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentReviewItem.q.options.map((optText, oIdx) => {
                  const isAns = oIdx === currentReviewItem.q.answer;
                  const isPicked = oIdx === currentReviewItem.userChoice;
                  return (
                    <div
                      key={oIdx}
                      className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold flex flex-col gap-2 ${
                        isAns
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100'
                          : isPicked && !isAns
                            ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-100'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {currentReviewItem.q.optionImages?.[oIdx] && (
                        <button
                          type="button"
                          onClick={() => setZoomedMaterial({
                            image: currentReviewItem.q.optionImages[oIdx],
                            title: `第 ${currentReviewItem.idx + 1} 題選項 ${CHOICE_LABELS[oIdx]}`,
                            text: '',
                          })}
                          className="relative w-full h-28 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-zoom-in group flex items-center justify-center"
                          title={`放大選項 ${CHOICE_LABELS[oIdx]} 圖片`}
                        >
                          <img
                            src={currentReviewItem.q.optionImages[oIdx]}
                            alt={currentReviewItem.q.optionAltTexts?.[oIdx] || `選項 ${CHOICE_LABELS[oIdx]}`}
                            className="max-w-full max-h-full object-contain group-hover:scale-[1.02] transition-transform"
                            loading="lazy"
                          />
                          <span className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/75 text-white">
                            <Maximize2 size={12} />
                          </span>
                        </button>
                      )}
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className="break-words min-w-0">
                          ({CHOICE_LABELS[oIdx]}) {currentReviewItem.q.optionAltTexts?.[oIdx] || (optText === `(${CHOICE_LABELS[oIdx]})` ? '' : optText)}
                        </span>
                        {isAns && (
                          <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 shrink-0">
                            ✓ 正解
                          </span>
                        )}
                        {isPicked && !isAns && (
                          <span className="text-[11px] font-black text-rose-600 shrink-0">
                            ✗ 你的作答
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm text-indigo-950 dark:text-indigo-100 leading-relaxed flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => speakQuestion(currentReviewItem.q.explanation)}
                  className="p-1.5 rounded-lg bg-indigo-200/80 dark:bg-indigo-800/80 hover:bg-indigo-300 text-indigo-900 dark:text-indigo-100 shrink-0 transition cursor-pointer"
                  title="朗讀解析"
                >
                  <Volume2 size={15} />
                </button>
                <div className="min-w-0">
                  <span className="font-black text-indigo-700 dark:text-indigo-300">💡 解析：</span>
                  {currentReviewItem.q.explanation}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <CheckCircle2 size={36} className="text-emerald-500 mb-2" />
              <div className="font-black text-base text-slate-800 dark:text-white">
                本次測驗全數答對，沒有任何錯題！
              </div>
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
              >
                點此檢視全部題目解析
              </button>
            </div>
          )}
        </div>
      </div>

      {zoomedMaterial && (
        <div
          data-testid="review-image-zoom"
          className="fixed inset-0 z-[90] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5"
          onClick={() => setZoomedMaterial(null)}
          role="dialog"
          aria-modal="true"
          aria-label={zoomedMaterial.title || '放大題目材料'}
        >
          <div
            className="w-full max-w-6xl max-h-[94vh] rounded-2xl bg-white dark:bg-slate-900 border border-white/20 shadow-2xl overflow-hidden flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="font-black text-slate-900 dark:text-white truncate">
                {zoomedMaterial.title || '題目材料'}
              </div>
              <button
                type="button"
                onClick={() => setZoomedMaterial(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-200"
                aria-label="關閉放大圖片"
              >
                <X size={20} />
              </button>
            </div>
            <div className="min-h-0 overflow-auto p-2 sm:p-4 flex flex-col items-center gap-3 bg-slate-100 dark:bg-slate-950">
              {zoomedMaterial.image && (
                <img
                  src={zoomedMaterial.image}
                  alt={zoomedMaterial.title || '放大題目材料'}
                  className="max-w-full max-h-[78vh] w-auto h-auto object-contain rounded-xl bg-white shadow-lg"
                />
              )}
              {!zoomedMaterial.image && zoomedMaterial.text && (
                <div className="w-full max-w-4xl p-5 sm:p-7 rounded-xl bg-white dark:bg-slate-900 whitespace-pre-line font-mono text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-100">
                  {zoomedMaterial.text}
                </div>
              )}
              {zoomedMaterial.image && zoomedMaterial.text && (
                <details className="w-full max-w-4xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <summary className="px-4 py-2.5 cursor-pointer font-bold text-sm text-indigo-700 dark:text-indigo-300">
                    顯示無障礙文字版材料
                  </summary>
                  <div className="px-4 pb-4 whitespace-pre-line font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {zoomedMaterial.text}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PureMcqExamView;
