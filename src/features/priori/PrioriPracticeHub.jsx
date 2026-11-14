import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  BookOpen,
  Pencil,
  QrCode,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Printer,
  Maximize2,
  ChevronRight,
  UserCheck,
  FileText,
  Check,
  Lock,
  Award,
  Flame,
  Headphones,
  Square,
  Zap,
} from 'lucide-react';
import {
  PRIORI_SUBJECTS,
  PRIORI_PAPERS,
  PRIORI_PAPER_MAP,
} from '../../data/priori';
import { useStudent } from '../../context/StudentContext';
import { useTheme } from '../../context/ThemeContext';
import { formatStudentDisplayName } from '../../utils/studentIdHelper';
import { MathRichText } from './MathRichText';
import { PrioriScratchpad, PrioriScratchpadPreview } from './PrioriScratchpad';
import { PrioriAlphabetPad } from './PrioriAlphabetPad';
import { PrioriTeacherDashboard } from './PrioriTeacherDashboard';
import {
  loadPrioriRecords,
  recordPrioriAttempt,
  recordPrioriSubjectDrillAttempt,
  getSubjectRemedialPool,
  hasPrioriAnswer,
  isPrioriAnswerCorrect,
  formatPrioriAnswerLabel,
} from './prioriStorage';
import {
  LilyEmblem,
  PrioriZoomModal,
  PrioriQrModal,
  PrioriSubmitConfirmModal,
  PrioriPrintableSheet,
} from './PrioriModals';

const FONT_FAMILY_STYLE = {
  fontFamily: "'Plus Jakarta Sans', 'Nunito', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
};

const HUB_GRADES = [
  { id: '3', label: '三年級' },
  { id: '4', label: '四年級' },
  { id: '5', label: '五年級' },
  { id: '6', label: '六年級' },
];

function pickZhTwVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  return (
    voices.find((v) => v.lang === 'zh-TW' && /HsiaoChen|Yating|HanHan|Google|Meijia/i.test(v.name)) ||
    voices.find((v) => v.lang === 'zh-TW') ||
    voices.find((v) => v.lang?.startsWith('zh')) ||
    null
  );
}

function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds || 0));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return mins > 0 ? `${mins} 分 ${secs} 秒` : `${secs} 秒`;
}

export function PrioriPracticeHub({ onBack, initialPaperId = null }) {
  const { currentStudent, isLoggedIn, openModal } = useStudent();
  const { isDark } = useTheme();
  const studentKey = currentStudent?.student_id || 'guest';

  const initialPaper =
    initialPaperId && PRIORI_PAPER_MAP[initialPaperId]
      ? PRIORI_PAPER_MAP[initialPaperId]
      : null;

  const [viewMode, setViewMode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'teacher') return 'teacher';
      if (initialPaper && params.get('entry') === 'qr') return 'qr-confirm';
    } catch {}
    return initialPaper ? 'quiz' : 'hub';
  }); // 'hub' | 'qr-confirm' | 'quiz' | 'result' | 'teacher'

  const [activeSubject, setActiveSubject] = useState(() =>
    initialPaper ? initialPaper.subject : 'math'
  );
  const [selectedGrade, setSelectedGrade] = useState(() => {
    if (initialPaper?.grade) return String(initialPaper.grade);
    const stuGrade = String(parseInt(currentStudent?.grade || '', 10) || '');
    if (stuGrade && PRIORI_PAPERS.some((p) => String(p.grade) === stuGrade)) {
      return stuGrade;
    }
    return '3';
  });
  const [activePaperId, setActivePaperId] = useState(() =>
    initialPaper ? initialPaper.paperId : '114-math-g3'
  );
  const [savedRecords, setSavedRecords] = useState(() => loadPrioriRecords(studentKey));

  // 當學生身分切換年級且該年級已有建置試卷時自動帶入
  useEffect(() => {
    const stuGrade = String(parseInt(currentStudent?.grade || '', 10) || '');
    if (
      stuGrade &&
      PRIORI_PAPERS.some((p) => p.subject === activeSubject && String(p.grade) === stuGrade)
    ) {
      setSelectedGrade(stuGrade);
    }
  }, [currentStudent?.grade, activeSubject]);

  // 練習設定與作答狀態
  const [assistReadMode, setAssistReadMode] = useState(false); // false: 原卷模擬 | true: 輔助朗讀
  const [showOriginalImage, setShowOriginalImage] = useState(false); // 顯示原卷帶注音題圖
  const [showScratchpad, setShowScratchpad] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isMathInit = !initialPaper || initialPaper.subject === 'math';
    return isMathInit && window.innerWidth >= 1024;
  });
  const [activeQueue, setActiveQueue] = useState(() =>
    initialPaper ? initialPaper.questions : []
  );
  const [isMistakeRetry, setIsMistakeRetry] = useState(false);
  const [isSubjectDrill, setIsSubjectDrill] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [strokesByQuestion, setStrokesByQuestion] = useState({});
  const [firstTryWrongIds, setFirstTryWrongIds] = useState([]);
  const [slotFeedback, setSlotFeedback] = useState(null); // { correct: boolean, sunk?: boolean, headline: string, detail?: string }
  const [lastSubmissionByPaper, setLastSubmissionByPaper] = useState({});
  const [cloudSyncNotice, setCloudSyncNotice] = useState(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 官方英語聽力 MP3 播放器狀態
  const audioRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioRate, setAudioRate] = useState(1.0);

  // 燈箱與彈窗
  const [zoomImageSrc, setZoomImageSrc] = useState(null);
  const [zoomTitle, setZoomTitle] = useState('');
  const [zoomReadOnly, setZoomReadOnly] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [speakingKey, setSpeakingKey] = useState(null);

  // 詳解逐步展開紀錄：{ [questionId]: revealedStepCount }
  const [revealedSteps, setRevealedSteps] = useState({});
  const [printMode, setPrintMode] = useState('all'); // 'all' | 'wrong'

  useEffect(() => {
    setSavedRecords(loadPrioriRecords(studentKey));
  }, [studentKey]);

  const stopAudio = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    } catch {}
    setIsPlayingAudio(false);
  }, []);

  const stopSpeech = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    setSpeakingKey(null);
    stopAudio();
  }, [stopAudio]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  useEffect(() => {
    stopSpeech();
  }, [currentIdx, viewMode, assistReadMode, stopSpeech]);

  const togglePlayOfficialAudio = useCallback(
    (audioSrc) => {
      if (!audioSrc) return;
      if (isPlayingAudio) {
        stopAudio();
        return;
      }
      stopSpeech();
      try {
        const audio = new Audio(audioSrc);
        audio.playbackRate = audioRate;
        audio.onended = () => {
          setIsPlayingAudio(false);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlayingAudio(false);
          audioRef.current = null;
        };
        audioRef.current = audio;
        setIsPlayingAudio(true);
        audio.play().catch(() => {
          setIsPlayingAudio(false);
          audioRef.current = null;
        });
      } catch {
        setIsPlayingAudio(false);
      }
    },
    [audioRate, isPlayingAudio, stopAudio, stopSpeech]
  );

  const speakNaturalText = useCallback(
    (text, key, lang = 'zh-TW') => {
      if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (speakingKey === key) {
        stopSpeech();
        return;
      }
      stopSpeech();
      try {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang;
        utter.rate = 0.92;
        const voice = pickZhTwVoice();
        if (voice) utter.voice = voice;
        utter.onend = () => setSpeakingKey(null);
        utter.onerror = () => setSpeakingKey(null);
        setSpeakingKey(key);
        window.speechSynthesis.speak(utter);
      } catch {
        setSpeakingKey(null);
      }
    },
    [speakingKey, stopSpeech]
  );

  const activePaper = PRIORI_PAPER_MAP[activePaperId] || PRIORI_PAPERS[0];
  const currentQuestion = activeQueue[currentIdx] || null;
  const currentQuestionPaper =
    (currentQuestion?.paperId && PRIORI_PAPER_MAP[currentQuestion.paperId]) || activePaper;

  // 各科獨立錯題與待精熟集中池（絕對分科隔離）
  const activeSubjectInfo = useMemo(
    () => PRIORI_SUBJECTS.find((s) => s.id === activeSubject) || PRIORI_SUBJECTS[0],
    [activeSubject]
  );
  const subjectPapers = useMemo(
    () =>
      PRIORI_PAPERS.filter((p) => p.subject === activeSubject).sort(
        (a, b) => Number(b.year) - Number(a.year)
      ),
    [activeSubject]
  );
  const visibleGradePapers = useMemo(
    () =>
      subjectPapers.filter((p) => String(p.grade) === String(selectedGrade)),
    [subjectPapers, selectedGrade]
  );
  const subjectRemedialPool = useMemo(
    () => getSubjectRemedialPool(savedRecords, activeSubject, 'all'),
    [savedRecords, activeSubject]
  );

  const startQuiz = useCallback(
    (paper, subsetQuestions = null, retryFlag = false, subjectDrillFlag = false) => {
      const basePaper = paper || subjectPapers[0] || PRIORI_PAPERS[0];
      const rawQueue =
        Array.isArray(subsetQuestions) && subsetQuestions.length > 0
          ? subsetQuestions
          : basePaper.questions;
      const queue = rawQueue.map((q, idx) => ({
        ...q,
        paperId: q.paperId || basePaper.paperId,
        _instanceKey: `${q.id}__init_${idx}`,
      }));

      stopSpeech();
      setActiveSubject(basePaper.subject);
      setActivePaperId(basePaper.paperId);
      setActiveQueue(queue);
      setIsMistakeRetry(retryFlag);
      setIsSubjectDrill(subjectDrillFlag);
      setShowScratchpad(
        basePaper.subject === 'math' &&
          (typeof window !== 'undefined' ? window.innerWidth >= 1024 : false)
      );
      setCurrentIdx(0);
      setAnswers({});
      setStrokesByQuestion({});
      setFirstTryWrongIds([]);
      setSlotFeedback(null);
      setLastSubmissionByPaper({});
      setCloudSyncNotice(null);
      setRevealedSteps({});
      setStartedAt(Date.now());
      setElapsedSeconds(0);
      setViewMode('quiz');
    },
    [stopSpeech, subjectPapers]
  );

  const handleSelectOption = (qId, value) => {
    if (slotFeedback) return;
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleScratchpadChange = useCallback((qId, nextStrokes) => {
    setStrokesByQuestion((prev) => ({ ...prev, [qId]: nextStrokes }));
  }, []);

  // 去重後的本場題目清單（用於計分、未作答檢查與結果明細，避免沉底題重複算兩次）
  const uniqueActiveQuestions = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const q of activeQueue) {
      if (!q?.id || seen.has(q.id)) continue;
      seen.add(q.id);
      list.push(q);
    }
    return list;
  }, [activeQueue]);

  // 沉底模式即時批改邏輯
  const handleCheckSinkingQuestion = () => {
    if (!currentQuestion) return;
    const rawAns = answers[currentQuestion.id];
    const ok = isPrioriAnswerCorrect(currentQuestion, rawAns);
    const targetPaperId = currentQuestion.paperId || activePaper.paperId;
    const prevStreak = Number(savedRecords?.[targetPaperId]?.streaks?.[currentQuestion.id]) || 0;

    if (ok) {
      const wasWrongEarlierInSession = firstTryWrongIds.includes(currentQuestion.id);
      const nextStreakEstimate = wasWrongEarlierInSession ? 1 : prevStreak + 1;
      setSlotFeedback({
        correct: true,
        sunk: false,
        headline:
          nextStreakEstimate >= 2
            ? '🌟 答對了！這題連續答對達 2 次，交卷後自動升級為「已精熟」！'
            : wasWrongEarlierInSession
            ? '✅ 沉底訂正過關！再成功複習 1 次就能達成「🌟 已精熟」！'
            : '✅ 答對了！再穩穩累積答對 1 次即可達成精熟。',
        detail: currentQuestion.explanationSteps?.[currentQuestion.explanationSteps.length - 1] || '',
      });
    } else {
      setFirstTryWrongIds((prev) =>
        prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]
      );
      const sunkItem = {
        ...currentQuestion,
        _isSunkRetry: true,
        _instanceKey: `${currentQuestion.id}__sunk_${activeQueue.length}_${Date.now()}`,
      };
      setActiveQueue((prev) => [...prev, sunkItem]);
      setSlotFeedback({
        correct: false,
        sunk: true,
        headline: '❌ 答錯了！這題已自動「沉底」排到最後面再練一次，先把關鍵提示看清楚喔！',
        detail: currentQuestion.explanationSteps?.[0] || '',
      });
    }
  };

  const handleAdvanceAfterFeedback = (shouldFinish) => {
    if (!currentQuestion) return;
    const wasSunk = slotFeedback?.sunk;
    const prevQId = currentQuestion.id;
    setSlotFeedback(null);

    if (wasSunk) {
      // 清空剛剛錯誤的選項，讓題目沉底回來時學生可以真正重新思考作答
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[prevQId];
        return next;
      });
    }

    if (shouldFinish) {
      finalizeQuiz();
    } else {
      setCurrentIdx((i) => Math.min(activeQueue.length, i + 1));
    }
  };

  const finalizeQuiz = useCallback(() => {
    stopSpeech();
    setIsSubmitConfirmOpen(false);
    setSlotFeedback(null);
    const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    setElapsedSeconds(seconds);

    if (activePaper) {
      const displayName = isLoggedIn
        ? formatStudentDisplayName(currentStudent)
        : '訪客學生';

      const handleCloudSyncResult = (syncRes) => {
        if (syncRes && !syncRes.ok) {
          setCloudSyncNotice({ type: 'error', message: syncRes.error || '雲端同步失敗' });
        } else if (syncRes?.ok) {
          setCloudSyncNotice((prev) => (prev?.type === 'error' ? prev : { type: 'ok' }));
        }
      };

      if (isSubjectDrill) {
        const res = recordPrioriSubjectDrillAttempt({
          student: currentStudent,
          displayName,
          fallbackPaper: activePaper,
          activeQueue,
          answers,
          strokesByQuestion,
          firstTryWrongIds,
          elapsedSeconds: seconds,
          onCloudSyncResult: handleCloudSyncResult,
        });
        setLastSubmissionByPaper(res.updatedByPaper || {});
        setSavedRecords(loadPrioriRecords(studentKey));
      } else {
        const updatedRecord = recordPrioriAttempt({
          student: currentStudent,
          displayName,
          paper: activePaper,
          activeQueue,
          answers,
          strokesByQuestion,
          firstTryWrongIds,
          isMistakeRetry,
          elapsedSeconds: seconds,
          onCloudSyncResult: handleCloudSyncResult,
        });
        if (updatedRecord) {
          setLastSubmissionByPaper({ [activePaper.paperId]: updatedRecord });
          setSavedRecords(loadPrioriRecords(studentKey));
        }
      }
    }
    setViewMode('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [
    activePaper,
    activeQueue,
    answers,
    currentStudent,
    firstTryWrongIds,
    isLoggedIn,
    isMistakeRetry,
    isSubjectDrill,
    startedAt,
    stopSpeech,
    strokesByQuestion,
    studentKey,
  ]);

  const handleRequestSubmit = () => {
    const unanswered = uniqueActiveQuestions.filter(
      (q) => !hasPrioriAnswer(q, answers[q.id])
    ).length;
    if (unanswered > 0) {
      setIsSubmitConfirmOpen(true);
    } else {
      finalizeQuiz();
    }
  };

  const answeredCount = useMemo(
    () => uniqueActiveQuestions.filter((q) => hasPrioriAnswer(q, answers[q.id])).length,
    [uniqueActiveQuestions, answers]
  );

  const resultStats = useMemo(() => {
    const wrongList = uniqueActiveQuestions.filter(
      (q) => !isPrioriAnswerCorrect(q, answers[q.id])
    );
    const correctCount = uniqueActiveQuestions.length - wrongList.length;
    const score = Math.round((correctCount / Math.max(1, uniqueActiveQuestions.length)) * 100);
    return { wrongList, correctCount, score };
  }, [uniqueActiveQuestions, answers]);

  const baseOrigin = useMemo(() => {
    return typeof window !== 'undefined' &&
      window.location.origin &&
      !window.location.origin.includes('localhost') &&
      !window.location.origin.includes('127.0.0.1')
      ? window.location.origin
      : 'https://wutaivocab.pages.dev';
  }, []);

  const printQuestions = useMemo(() => {
    if (viewMode === 'result' && printMode === 'wrong' && resultStats.wrongList.length > 0) {
      return resultStats.wrongList;
    }
    return uniqueActiveQuestions.length > 0
      ? uniqueActiveQuestions
      : activePaper?.questions || [];
  }, [activePaper, printMode, resultStats.wrongList, uniqueActiveQuestions, viewMode]);

  const handlePrint = (mode = 'all') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 80);
  };

  const openZoom = (src, title, readOnly = false) => {
    if (!src) return;
    setZoomImageSrc(src);
    setZoomTitle(title);
    setZoomReadOnly(readOnly);
  };

  const hasPassageSplit = Boolean(currentQuestion?.passage);

  return (
    <div
      style={FONT_FAMILY_STYLE}
      className="relative min-h-[100dvh] w-full flex flex-col text-slate-800 dark:text-slate-100"
    >
      {/* ── 北大武山與台灣百合溫潤毛玻璃底圖層（列印時自動隱藏） ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none print:hidden">
        <img
          src="/assets/rukai_ui_background.jpg"
          alt="霧臺山林日景底圖"
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${
            isDark ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <img
          src="/assets/rukai_ui_background_night.webp"
          alt="霧臺山林夜景底圖"
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-0 backdrop-blur-md transition-colors duration-700 ${
            isDark ? 'bg-slate-950/92' : 'bg-[#FAF8F5]/92'
          }`}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 1. 極簡學生大廳視圖 (Hub — 科目 × 年級 × 115→108 緊湊條列)     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {viewMode === 'hub' && (
        <div className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 animate-fadeIn print:hidden">
          {/* 精簡頂部工具列 */}
          <header className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-lime-300/80 dark:border-lime-700/60 p-3.5 sm:p-4 shadow-md flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-2 rounded-2xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回首頁</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-lime-400 to-lime-600 text-lime-950 flex items-center justify-center shadow-sm shrink-0">
                  <LilyEmblem className="w-5 h-5" />
                </div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  霧臺國小・學習扶助自主練習館
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* 迷你練習模式雙段切換 */}
              <div
                className="inline-flex p-0.5 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700"
                title="切換「原卷模擬」或「輔助朗讀」"
              >
                <button
                  type="button"
                  onClick={() => setAssistReadMode(false)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 transition cursor-pointer ${
                    !assistReadMode
                      ? 'bg-slate-800 dark:bg-lime-500 text-white dark:text-lime-950 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>原卷</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssistReadMode(true)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 transition cursor-pointer ${
                    assistReadMode
                      ? 'bg-cyan-700 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>朗讀</span>
                </button>
              </div>

              <button
                type="button"
                onClick={openModal}
                className="px-2.5 py-1.5 rounded-xl bg-lime-50 dark:bg-lime-950/60 border border-lime-300 dark:border-lime-700 text-lime-900 dark:text-lime-200 text-xs font-black flex items-center gap-1.5 hover:bg-lime-100 transition cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>
                  {isLoggedIn ? formatStudentDisplayName(currentStudent) : '訪客練習中'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsQrOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-lime-950 text-xs font-black flex items-center gap-1 shadow-sm transition cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>派卷 QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setViewMode('teacher');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs font-black flex items-center gap-1 hover:bg-amber-100 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>教師後台</span>
              </button>
            </div>
          </header>

          {/* 1. 科目分頁 + 2. 年級選擇膠囊 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              {PRIORI_SUBJECTS.map((subj) => {
                const active = activeSubject === subj.id;
                const subjCount = PRIORI_PAPERS.filter((p) => p.subject === subj.id).length;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => setActiveSubject(subj.id)}
                    className={`px-4 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 border-2 transition shrink-0 cursor-pointer ${
                      active
                        ? 'bg-lime-500 border-lime-600 text-lime-950 shadow-md'
                        : 'bg-white/95 dark:bg-slate-900/95 border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-lime-400'
                    }`}
                  >
                    <span>{subj.label}</span>
                    {subjCount > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                          active
                            ? 'bg-lime-950/15 text-lime-950'
                            : 'bg-stone-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {subjCount} 卷
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 mr-1">
                年級：
              </span>
              {HUB_GRADES.map((g) => {
                const count = subjectPapers.filter((p) => String(p.grade) === g.id).length;
                const active = String(selectedGrade) === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGrade(g.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-black border transition cursor-pointer ${
                      active
                        ? 'bg-slate-800 dark:bg-lime-400 border-slate-800 dark:border-lime-400 text-white dark:text-lime-950 shadow-sm'
                        : count > 0
                        ? 'bg-white/90 dark:bg-slate-900/90 border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-lime-400'
                        : 'bg-stone-50/70 dark:bg-slate-900/40 border-stone-200/70 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 錯題沉底特訓專區（僅在該科已經出現待補強題時才展開，未練習前不佔版面） */}
          {subjectRemedialPool.practicedPaperCount > 0 &&
            (subjectRemedialPool.allRemedialQuestions.length > 0 ? (
              <section
                aria-label={`${activeSubjectInfo.label}待補強與錯題沉底特訓專區`}
                className="rounded-2xl bg-gradient-to-r from-rose-50/95 via-amber-50/90 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-rose-200 dark:border-rose-800/70 px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-2.5"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-black">
                  <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{activeSubjectInfo.label}・錯題沉底特訓</span>
                  </span>
                  {subjectRemedialPool.wrongQuestions.length > 0 && (
                    <span className="text-rose-700 dark:text-rose-300">
                      待訂正 {subjectRemedialPool.wrongQuestions.length} 題
                    </span>
                  )}
                  {subjectRemedialPool.progressQuestions.length > 0 && (
                    <span className="text-amber-700 dark:text-amber-300">
                      🌱 差1次精熟 {subjectRemedialPool.progressQuestions.length} 題
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {subjectRemedialPool.wrongQuestions.length > 0 &&
                    subjectRemedialPool.progressQuestions.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          startQuiz(
                            PRIORI_PAPER_MAP[subjectRemedialPool.wrongQuestions[0].paperId] ||
                              subjectPapers[0],
                            subjectRemedialPool.wrongQuestions,
                            true,
                            true
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-200 font-black text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>僅練錯題 ({subjectRemedialPool.wrongQuestions.length})</span>
                      </button>
                    )}

                  <button
                    type="button"
                    onClick={() =>
                      startQuiz(
                        PRIORI_PAPER_MAP[subjectRemedialPool.allRemedialQuestions[0].paperId] ||
                          subjectPapers[0],
                        subjectRemedialPool.allRemedialQuestions,
                        true,
                        true
                      )
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>
                      開始特訓（{subjectRemedialPool.allRemedialQuestions.length} 題）
                    </span>
                  </button>
                </div>
              </section>
            ) : (
              <div
                aria-label={`${activeSubjectInfo.label}待補強與錯題沉底特訓專區`}
                className="rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-4 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>
                  🌟 {activeSubjectInfo.label}已練習題目全數精熟（連對 2 次，共{' '}
                  {subjectRemedialPool.totalPracticedQuestions} 題）
                </span>
              </div>
            ))}

          {/* 115 → 108 降冪緊湊單行試卷列表 */}
          {visibleGradePapers.length === 0 ? (
            <div className="rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-700 p-6 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
              {HUB_GRADES.find((g) => g.id === String(selectedGrade))?.label || `${selectedGrade}年級`}{' '}
              {activeSubjectInfo.label}試卷尚在建置中，請先切換「三年級」進行練習。
            </div>
          ) : (
            <div className="space-y-2">
              {visibleGradePapers.map((paper) => {
                const record = savedRecords[paper.paperId];
                return (
                  <div
                    key={paper.paperId}
                    onClick={() => startQuiz(paper)}
                    className="group rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-stone-200/80 dark:border-slate-700 hover:border-lime-500 dark:hover:border-lime-500 px-4 py-3 shadow-sm hover:shadow-md transition-all flex flex-wrap items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                      <span className="px-2.5 py-1 rounded-xl bg-lime-100 dark:bg-lime-950 text-lime-900 dark:text-lime-200 text-xs font-black tabular-nums shrink-0">
                        {paper.year} 年
                      </span>
                      <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        {paper.gradeLabel}
                        {paper.subjectLabel}
                      </span>
                      {!paper.officialAnswerVerified && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-[10px] font-black">
                          教師參考答案
                        </span>
                      )}
                      {record ? (
                        <span className="text-xs font-black text-teal-700 dark:text-teal-300 tabular-nums">
                          {record.latestScore ?? record.score} 分 ・ 🌟 {record.masteredCount || 0}/
                          {record.totalCount}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                          尚未作答
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        title="列印學習單"
                        aria-label={`列印${paper.title}學習單`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePaperId(paper.paperId);
                          handlePrint('all');
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startQuiz(paper);
                        }}
                        className="px-4 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-lime-950 font-black text-xs sm:text-sm flex items-center gap-1 shadow-sm active:scale-95 transition cursor-pointer"
                      >
                        <span>{record ? '再練一次' : '開始測驗'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 1.5 派卷 QR 掃碼直達確認卡（身分 ＋ 指定試卷 ＋ 進入測驗）       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {viewMode === 'qr-confirm' && activePaper && (
        <div className="relative z-10 flex-1 w-full max-w-md mx-auto px-4 py-8 flex flex-col justify-center animate-fadeIn print:hidden">
          <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-lime-400 dark:border-lime-600 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-xl bg-lime-100 dark:bg-lime-950 text-lime-900 dark:text-lime-200 text-xs font-black">
                派卷快速進入
              </span>
              <button
                type="button"
                onClick={() => setViewMode('hub')}
                className="text-xs font-black text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                改選其他試卷
              </button>
            </div>

            {/* 目前身分 */}
            <div className="rounded-2xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 p-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-black text-slate-400 dark:text-slate-500">
                  目前身分
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {isLoggedIn ? formatStudentDisplayName(currentStudent) : '尚未登入（訪客模式）'}
                </div>
              </div>
              <button
                type="button"
                onClick={openModal}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-stone-300 dark:border-slate-600 text-xs font-black text-slate-700 dark:text-slate-100 hover:border-lime-500 shrink-0 transition cursor-pointer"
              >
                {isLoggedIn ? '切換座號' : '登入座號'}
              </button>
            </div>

            {/* 要做的試卷 */}
            <div className="rounded-2xl bg-lime-50/80 dark:bg-lime-950/40 border border-lime-300 dark:border-lime-700 p-4 text-center space-y-1.5">
              <div className="text-[11px] font-black text-lime-800 dark:text-lime-300">
                即將進行測驗
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {activePaper.title}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                共 {activePaper.totalQuestions} 題・滿分 {activePaper.totalPoints} 分
              </p>
            </div>

            <button
              type="button"
              onClick={() => startQuiz(activePaper)}
              className="w-full py-3.5 px-5 rounded-2xl bg-lime-500 hover:bg-lime-400 text-lime-950 font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-98 transition cursor-pointer"
            >
              <span>進入測驗</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 2. 作答工作台視圖 (Quiz — 雙欄iPad、左文右題、聽力、沉底批改)   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {viewMode === 'quiz' && currentQuestion && (
        <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 py-3 flex flex-col gap-3 animate-fadeIn print:hidden">
          {/* 頂部無干擾工具列 */}
          <header className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-teal-200/80 dark:border-slate-700 px-3 py-2 shadow-sm flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setViewMode('hub');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center gap-1 transition shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>選卷</span>
              </button>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-teal-900 dark:text-teal-100 truncate">
                  {isSubjectDrill
                    ? `${activeSubjectInfo.label}・錯題沉底特訓（${currentQuestionPaper.year}年）`
                    : `${currentQuestionPaper.year} 年・${currentQuestionPaper.gradeLabel}${currentQuestionPaper.subjectLabel}${
                        isMistakeRetry ? '（錯題沉底重練）' : ''
                      }`}
                </div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                  {isMistakeRetry
                    ? `沉底特訓佇列：第 ${currentIdx + 1} / ${activeQueue.length} 題（答錯會排到隊尾再練）`
                    : `已作答 ${answeredCount} / ${uniqueActiveQuestions.length} 題`}
                </div>
              </div>
            </div>

            {/* 教學與輔助工具切換鈕 */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAssistReadMode((v) => !v)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border transition cursor-pointer ${
                  assistReadMode
                    ? 'bg-cyan-700 border-cyan-600 text-white shadow-sm'
                    : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {assistReadMode ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>輔助朗讀：{assistReadMode ? '開' : '關'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowOriginalImage((v) => !v)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border transition cursor-pointer ${
                  showOriginalImage
                    ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-sm'
                    : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>原卷注音圖：{showOriginalImage ? '開' : '關'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowScratchpad((v) => !v)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border transition cursor-pointer ${
                  showScratchpad
                    ? 'bg-teal-700 border-teal-600 text-white shadow-sm'
                    : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>計算紙</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQrOpen(true)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 transition cursor-pointer"
                title="顯示 QR code 給學生平板掃描"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">派卷 QR</span>
              </button>
            </div>
          </header>

          {/* 題號導覽軌 (Pills) */}
          <nav
            aria-label="題號導覽"
            className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar"
          >
            {activeQueue.map((q, idx) => {
              const isCurrent = idx === currentIdx;
              const isDone = hasPrioriAnswer(q, answers[q.id]);
              return (
                <button
                  key={q._instanceKey || `${q.id}-${idx}`}
                  type="button"
                  disabled={isMistakeRetry && idx > currentIdx && Boolean(q._isSunkRetry)}
                  onClick={() => {
                    if (!isMistakeRetry) setCurrentIdx(idx);
                  }}
                  aria-label={`跳到第 ${q.number} 題`}
                  className={`min-w-[2rem] h-8 px-1.5 rounded-full text-xs font-black tabular-nums shrink-0 flex items-center justify-center transition border-2 ${
                    isMistakeRetry ? 'cursor-default' : 'cursor-pointer'
                  } ${
                    isCurrent
                      ? 'border-teal-700 dark:border-teal-300 ring-2 ring-teal-400/50 scale-110 ' +
                        (isDone
                          ? 'bg-teal-700 text-white'
                          : 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-200')
                      : q._isSunkRetry
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-700 dark:text-rose-200'
                      : isDone
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'bg-white/90 dark:bg-slate-900/90 border-stone-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-teal-400'
                  }`}
                >
                  {q._isSunkRetry ? `↻${q.number}` : q.number}
                </button>
              );
            })}
          </nav>

          {/* 主作答工作區 */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            {/* 左側選配：國語閱讀題組文章卡（左文右題，平板橫放獨立可捲動） */}
            {hasPassageSplit && (
              <aside className="lg:col-span-5 rounded-3xl bg-amber-50/95 dark:bg-slate-900/95 border-2 border-amber-200 dark:border-amber-800/70 p-4 sm:p-5 shadow-md flex flex-col gap-3 max-h-[68vh] lg:max-h-[75vh] overflow-y-auto">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-amber-200/80 dark:border-slate-700">
                  <div>
                    <div className="text-xs font-black text-amber-800 dark:text-amber-300">
                      📖 {currentQuestion.passage.title}
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {currentQuestion.passage.instruction}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {assistReadMode && currentQuestion.passage.ttsText && (
                      <button
                        type="button"
                        onClick={() =>
                          speakNaturalText(
                            currentQuestion.passage.ttsText,
                            `passage-${currentQuestion.passage.groupId}`,
                            'zh-TW'
                          )
                        }
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1 cursor-pointer ${
                          speakingKey === `passage-${currentQuestion.passage.groupId}`
                            ? 'bg-cyan-700 border-cyan-500 text-white animate-pulse'
                            : 'bg-white dark:bg-slate-800 border-cyan-300 text-cyan-800 dark:text-cyan-200'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>朗讀文章</span>
                      </button>
                    )}

                    {currentQuestion.passage.image && (
                      <button
                        type="button"
                        onClick={() =>
                          openZoom(
                            currentQuestion.passage.image,
                            currentQuestion.passage.title,
                            true
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-600 text-amber-800 dark:text-amber-200 text-xs font-black flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>原卷注音圖</span>
                      </button>
                    )}
                  </div>
                </div>

                {showOriginalImage && currentQuestion.passage.image ? (
                  <img
                    src={currentQuestion.passage.image}
                    alt={currentQuestion.passage.title}
                    onClick={() =>
                      openZoom(
                        currentQuestion.passage.image,
                        currentQuestion.passage.title,
                        true
                      )
                    }
                    className="w-full rounded-2xl border border-amber-200 bg-white p-1.5 cursor-zoom-in"
                  />
                ) : (
                  <div className="space-y-3 text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                    {currentQuestion.passage.paragraphs?.map((para, pIdx) => (
                      <p key={pIdx} className="whitespace-pre-line indent-4">
                        {para}
                      </p>
                    ))}
                    {currentQuestion.passage.image && (
                      <button
                        type="button"
                        onClick={() =>
                          openZoom(
                            currentQuestion.passage.image,
                            currentQuestion.passage.title,
                            true
                          )
                        }
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>點此放大查看閱讀文章原卷圖片／注音</span>
                      </button>
                    )}
                  </div>
                )}
              </aside>
            )}

            {/* 主題目與選項卡 */}
            <div
              className={`flex flex-col justify-between gap-3 ${
                hasPassageSplit
                  ? showScratchpad
                    ? 'lg:col-span-4'
                    : 'lg:col-span-7'
                  : showScratchpad
                  ? 'lg:col-span-7'
                  : 'lg:col-span-12'
              }`}
            >
              <article className="flex-1 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-200/80 dark:border-slate-700 p-4 sm:p-6 shadow-md flex flex-col justify-between gap-4">
                <div className="space-y-4">
                  {/* 官方聽力音檔播放器（英語科聽寫／聽力題專屬） */}
                  {currentQuestion.media?.audioSrc && (
                    <div className="rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/60 border-2 border-indigo-200 dark:border-indigo-700 p-3 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        aria-label="播放官方聽力音檔"
                        onClick={() =>
                          togglePlayOfficialAudio(currentQuestion.media.audioSrc)
                        }
                        className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer ${
                          isPlayingAudio
                            ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {isPlayingAudio ? (
                          <>
                            <Square className="w-4 h-4 fill-current" />
                            <span>停止播放官方音檔</span>
                          </>
                        ) : (
                          <>
                            <Headphones className="w-4 h-4" />
                            <span>播放官方聽力題目音檔（連播 3 遍）</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black text-indigo-800 dark:text-indigo-200">
                          語速：
                        </span>
                        {[0.85, 1.0].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              setAudioRate(r);
                              if (audioRef.current) audioRef.current.playbackRate = r;
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-black cursor-pointer transition ${
                              audioRate === r
                                ? 'bg-indigo-700 text-white'
                                : 'bg-white dark:bg-slate-800 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700'
                            }`}
                          >
                            {r === 1.0 ? '1.0x 原速' : '0.85x 慢速'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`grid grid-cols-1 gap-4 ${
                      currentQuestion.figureImage || showOriginalImage
                        ? 'md:grid-cols-12 items-start'
                        : ''
                    }`}
                  >
                    {/* 視覺圖表區（幾何圖形、看圖聽辨或原卷注音截圖） */}
                    {(currentQuestion.figureImage || showOriginalImage) && (
                      <div className="md:col-span-5 space-y-2">
                        <div className="rounded-2xl border border-stone-200 dark:border-slate-700 bg-white p-2.5 flex flex-col items-center">
                          <img
                            src={
                              showOriginalImage
                                ? currentQuestion.questionImage
                                : currentQuestion.figureImage
                            }
                            alt={`第 ${currentQuestion.number} 題${
                              showOriginalImage ? '原卷注音圖' : '題目圖示'
                            }`}
                            onClick={() =>
                              openZoom(
                                showOriginalImage
                                  ? currentQuestion.questionImage
                                  : currentQuestion.figureImage,
                                `第 ${currentQuestion.number} 題${
                                  showOriginalImage ? '・原卷注音清晰圖' : '・圖形細節檢視'
                                }`
                              )
                            }
                            className="max-h-56 md:max-h-64 w-auto object-contain cursor-zoom-in rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              openZoom(
                                showOriginalImage
                                  ? currentQuestion.questionImage
                                  : currentQuestion.figureImage,
                                `第 ${currentQuestion.number} 題${
                                  showOriginalImage ? '・原卷注音清晰圖' : '・圖形細節檢視'
                                }`
                              )
                            }
                            className="mt-2 px-3 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-black flex items-center gap-1 transition cursor-pointer"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>點擊放大看細節</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 題幹與選項／四線格區 */}
                    <div
                      className={`space-y-4 ${
                        currentQuestion.figureImage || showOriginalImage
                          ? 'md:col-span-7'
                          : ''
                      }`}
                    >
                      {/* 題幹 */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 mr-2 rounded-xl bg-teal-700 text-white text-xs sm:text-sm font-black align-middle tabular-nums">
                            第 {currentQuestion.number} 題
                          </span>
                          {currentQuestion._isSunkRetry && (
                            <span className="inline-flex items-center px-2 py-0.5 mr-2 rounded-lg bg-rose-100 text-rose-700 text-xs font-black align-middle">
                              ↻ 沉底再練
                            </span>
                          )}
                          <MathRichText text={currentQuestion.questionText} />
                        </div>

                        {assistReadMode && currentQuestion.ttsVerified === true && (
                          <button
                            type="button"
                            onClick={() =>
                              speakNaturalText(
                                currentQuestion.ttsText,
                                `${currentQuestion.id}-stem`,
                                currentQuestion.ttsLang || 'zh-TW'
                              )
                            }
                            aria-label="朗讀題幹"
                            className={`px-3 py-2 rounded-2xl border-2 text-xs font-black flex items-center gap-1 shrink-0 transition cursor-pointer ${
                              speakingKey === `${currentQuestion.id}-stem`
                                ? 'bg-cyan-700 border-cyan-500 text-white animate-pulse'
                                : 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200 hover:bg-cyan-100'
                            }`}
                          >
                            <Volume2 className="w-4 h-4" />
                            <span className="hidden sm:inline">讀題</span>
                          </button>
                        )}
                      </div>

                      {/* 作答區域：英語聽寫「四線格大小寫面板」或一般單選題按鈕（2／3／4 選） */}
                      {currentQuestion.questionType === 'alphabet-pair' ? (
                        <PrioriAlphabetPad
                          value={answers[currentQuestion.id] || ''}
                          onChange={(val) => handleSelectOption(currentQuestion.id, val)}
                          disabled={Boolean(slotFeedback)}
                        />
                      ) : (
                        <div
                          role="radiogroup"
                          aria-label={`第 ${currentQuestion.number} 題選項`}
                          className={`grid grid-cols-1 gap-2.5 ${
                            currentQuestion.options.length === 2
                              ? 'sm:grid-cols-2'
                              : currentQuestion.options.length === 3
                              ? 'sm:grid-cols-3'
                              : showScratchpad
                              ? 'sm:grid-cols-1 xl:grid-cols-2'
                              : 'sm:grid-cols-2'
                          }`}
                        >
                          {currentQuestion.options.map((opt, oIdx) => {
                            const isSelected = answers[currentQuestion.id] === oIdx;
                            const optSpeakKey = `${currentQuestion.id}-opt-${oIdx}`;
                            const optTts = currentQuestion.optionTtsTexts?.[oIdx];
                            return (
                              <div key={oIdx} className="relative flex items-stretch gap-1.5">
                                <button
                                  type="button"
                                  role="radio"
                                  aria-checked={isSelected}
                                  disabled={Boolean(slotFeedback)}
                                  onClick={() => handleSelectOption(currentQuestion.id, oIdx)}
                                  className={`flex-1 p-3.5 sm:p-4 rounded-2xl border-2 text-left font-black text-sm sm:text-base flex items-center gap-3 transition cursor-pointer ${
                                    isSelected
                                      ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-700 dark:border-teal-400 text-teal-950 dark:text-white shadow-sm'
                                      : 'bg-stone-50/70 dark:bg-slate-800/60 border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400'
                                  }`}
                                >
                                  <span
                                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 tabular-nums ${
                                      isSelected
                                        ? 'bg-teal-700 text-white'
                                        : 'bg-white dark:bg-slate-700 border border-stone-300 dark:border-slate-600 text-slate-600 dark:text-slate-200'
                                    }`}
                                  >
                                    {oIdx + 1}
                                  </span>
                                  <span className="flex-1 leading-snug">
                                    <MathRichText text={opt} />
                                  </span>
                                </button>

                                {assistReadMode &&
                                  currentQuestion.ttsVerified === true &&
                                  optTts && (
                                    <button
                                      type="button"
                                      aria-label={`朗讀選項 ${oIdx + 1}`}
                                      onClick={() =>
                                        speakNaturalText(
                                          optTts,
                                          optSpeakKey,
                                          currentQuestion.ttsLang || 'zh-TW'
                                        )
                                      }
                                      className={`px-2.5 rounded-2xl border-2 flex items-center justify-center transition cursor-pointer ${
                                        speakingKey === optSpeakKey
                                          ? 'bg-cyan-700 border-cyan-500 text-white animate-pulse'
                                          : 'bg-cyan-50 dark:bg-slate-800 border-cyan-200 dark:border-slate-700 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-100'
                                      }`}
                                    >
                                      <Volume2 className="w-4 h-4" />
                                    </button>
                                  )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 沉底特訓模式：即時批改與沉底通知回饋 */}
                      {isMistakeRetry && slotFeedback && (
                        <div
                          role="status"
                          className={`rounded-2xl border-2 p-3.5 space-y-1.5 animate-fadeIn ${
                            slotFeedback.correct
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-100'
                              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-100'
                          }`}
                        >
                          <div className="font-black text-sm">{slotFeedback.headline}</div>
                          {slotFeedback.detail && (
                            <p className="text-xs font-bold opacity-90 leading-relaxed">
                              💡 提示：{slotFeedback.detail}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 底部 上一題 / 沉底批改 / 下一題 / 交卷列 */}
                <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  {isMistakeRetry ? (
                    <span className="text-xs font-black text-rose-700 dark:text-rose-300">
                      🔥 沉底特訓中（第 {currentIdx + 1} / {activeQueue.length} 題）
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={currentIdx === 0}
                      onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                      className="px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>上一題</span>
                    </button>
                  )}

                  {!isMistakeRetry && (
                    <span className="text-xs sm:text-sm font-black text-slate-500 dark:text-slate-400 tabular-nums">
                      {currentIdx + 1} / {activeQueue.length}
                    </span>
                  )}

                  {isMistakeRetry ? (
                    !slotFeedback ? (
                      <button
                        type="button"
                        disabled={!hasPrioriAnswer(currentQuestion, answers[currentQuestion.id])}
                        onClick={handleCheckSinkingQuestion}
                        className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>確認本題答案</span>
                      </button>
                    ) : currentIdx < activeQueue.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => handleAdvanceAfterFeedback(false)}
                        className="px-5 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <span>
                          {slotFeedback.sunk ? '繼續下一題（已排到最後）' : '下一題'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAdvanceAfterFeedback(true)}
                        className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>完成特訓・看精熟成績</span>
                      </button>
                    )
                  ) : currentIdx < activeQueue.length - 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIdx((i) => Math.min(activeQueue.length - 1, i + 1))
                      }
                      className="px-5 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition cursor-pointer"
                    >
                      <span>下一題</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestSubmit}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>交卷核對</span>
                    </button>
                  )}
                </div>
              </article>
            </div>

            {/* 右側：iPad 雙欄並排手寫計算紙 */}
            {showScratchpad && (
              <div className={`${hasPassageSplit ? 'lg:col-span-3' : 'lg:col-span-5'} flex flex-col`}>
                <PrioriScratchpad
                  questionNumber={currentQuestion.number}
                  strokes={strokesByQuestion[currentQuestion.id] || []}
                  onStrokesChange={(nextStrokes) =>
                    handleScratchpadChange(currentQuestion.id, nextStrokes)
                  }
                  className="flex-1"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 3. 結算、錯題沉底再練與逐步詳解視圖 (Result)                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {viewMode === 'result' && (
        <div className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 animate-fadeIn print:hidden">
          <div className="rounded-2xl bg-amber-50/95 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 p-3 sm:p-3.5 text-xs font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
            💡 {activePaper.answerSourceNote}本練習館作答紀錄完全獨立，不會改動單字館金幣與英語檢定館成績。
          </div>

          {cloudSyncNotice?.type === 'error' && (
            <div
              role="alert"
              className="rounded-2xl bg-rose-50/95 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 p-3 sm:p-3.5 text-xs font-black text-rose-800 dark:text-rose-200 leading-relaxed"
            >
              ⚠️ 雲端紀錄同步未完成（作答與計算紙已安全保存於本機瀏覽器）：{cloudSyncNotice.message}
            </div>
          )}

          <section className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-teal-300 dark:border-teal-700 p-5 shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black text-teal-700 dark:text-teal-300">
                  {isSubjectDrill
                    ? `${activeSubjectInfo.label}・錯題沉底特訓成果`
                    : `${activePaper.title}${isMistakeRetry ? '（錯題沉底訂正）' : ''}`}
                </p>
                <div className="flex flex-wrap items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-teal-800 dark:text-teal-200 tabular-nums">
                    {resultStats.score} 分
                  </span>
                  <span className="text-sm font-black text-slate-600 dark:text-slate-300 tabular-nums">
                    本輪通過 {resultStats.correctCount} / {uniqueActiveQuestions.length} 題 ・ 用時{' '}
                    {formatDuration(elapsedSeconds)}
                  </span>
                  {(() => {
                    const rec =
                      lastSubmissionByPaper[activePaper.paperId] ||
                      savedRecords[activePaper.paperId];
                    if (!rec) return null;
                    return (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-black flex items-center gap-1 tabular-nums">
                        <Award className="w-3.5 h-3.5" />
                        <span>
                          🌟 {activePaper.year}年精熟進度：{rec.masteredCount || 0} /{' '}
                          {activePaper.questions.length} 題（連續答對 2 次）
                        </span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewMode('hub')}
                className="px-4 py-2 rounded-2xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>回練習館</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {uniqueActiveQuestions.map((q) => {
                const ok = isPrioriAnswerCorrect(q, answers[q.id]);
                const wasSunk = firstTryWrongIds.includes(q.id);
                return (
                  <a
                    key={q.id}
                    href={`#review-${q.id}`}
                    className={`w-8 h-8 rounded-xl text-xs font-black tabular-nums flex items-center justify-center border transition ${
                      wasSunk
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-800 dark:text-amber-200'
                        : ok
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {q.number}
                  </a>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-stone-100 dark:border-slate-800">
              {resultStats.wrongList.length > 0 ? (
                <button
                  type="button"
                  onClick={() => startQuiz(activePaper, resultStats.wrongList, true, false)}
                  className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Flame className="w-4 h-4" />
                  <span>錯題沉底再練（{resultStats.wrongList.length} 題）</span>
                </button>
              ) : (
                <span className="px-4 py-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-black text-xs sm:text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>本輪題目全部過關！太棒了！</span>
                </span>
              )}

              <button
                type="button"
                onClick={() => startQuiz(activePaper)}
                className="px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>整卷重新作答</span>
              </button>

              <button
                type="button"
                onClick={() => handlePrint(resultStats.wrongList.length > 0 ? 'wrong' : 'all')}
                className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-teal-200 dark:border-teal-700 hover:border-teal-400 text-teal-800 dark:text-teal-200 font-black text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>
                  {resultStats.wrongList.length > 0 ? '列印錯題學習單' : '列印全卷學習單'}
                </span>
              </button>
            </div>
          </section>

          {/* 逐題檢討與逐步引導詳解 */}
          <div className="space-y-3">
            {uniqueActiveQuestions.map((q) => {
              const userChoice = answers[q.id];
              const isCorrect = isPrioriAnswerCorrect(q, userChoice);
              const wasSunk = firstTryWrongIds.includes(q.id);
              const steps = q.explanationSteps || [];
              const revealedCount = revealedSteps[q.id] ?? 1;
              const qPaperId = q.paperId || activePaper.paperId;
              const activeRecord =
                lastSubmissionByPaper[qPaperId] || savedRecords[qPaperId];
              const streak = Number(activeRecord?.streaks?.[q.id]) || 0;
              const qStrokes =
                strokesByQuestion[q.id]?.length > 0
                  ? strokesByQuestion[q.id]
                  : activeRecord?.scratchpad?.[q.id] || [];

              return (
                <article
                  key={q.id}
                  id={`review-${q.id}`}
                  className={`rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 p-4 sm:p-5 shadow-sm space-y-3 ${
                    isCorrect && !wasSunk
                      ? 'border-emerald-200 dark:border-emerald-800/70'
                      : wasSunk
                      ? 'border-amber-300 dark:border-amber-800/80'
                      : 'border-rose-300 dark:border-rose-800/80'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <span className="font-black text-sm text-slate-800 dark:text-slate-100">
                        {q.year}年 第 {q.number} 題
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[11px] font-black">
                        {q.conceptTitle}
                      </span>
                      {wasSunk && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-[11px] font-black">
                          ↻ 曾沉底重練後答對
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-black border ${
                          streak >= 2
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                            : streak === 1
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-800 dark:text-amber-200'
                            : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {streak >= 2
                          ? `🌟 已精熟 (連對 ${streak} 次)`
                          : streak === 1
                          ? '🌱 連對 1 次 (差 1 次精熟)'
                          : '⚠️ 待補強'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-800">
                        課綱 {q.curriculumCode}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-800">
                        學扶 {q.prioriCode}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
                    <MathRichText text={q.questionText} />
                  </div>

                  {q.figureImage && (
                    <div className="inline-flex flex-col items-start gap-1.5 bg-white p-2 rounded-2xl border border-stone-200">
                      <img
                        src={q.figureImage}
                        alt={`第 ${q.number} 題圖示`}
                        onClick={() => openZoom(q.figureImage, `第 ${q.number} 題圖示`, true)}
                        className="max-h-40 w-auto object-contain cursor-zoom-in"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-black">
                    <span
                      className={
                        isCorrect
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-rose-700 dark:text-rose-300'
                      }
                    >
                      你的選擇：{formatPrioriAnswerLabel(q, userChoice)}
                    </span>
                    <span className="text-teal-800 dark:text-teal-300">
                      {q.officialAnswerVerified ? '官方標準答案：' : '參考正解：'}
                      {q.questionType === 'alphabet-pair' ? (
                        <span>{q.answer}</span>
                      ) : (
                        <>
                          ({q.answer + 1}) <MathRichText text={q.options[q.answer]} />
                        </>
                      )}
                    </span>
                  </div>

                  {/* 分步解題引導區 */}
                  {steps.length > 0 && (
                    <div className="rounded-2xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200 dark:border-slate-700 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-teal-800 dark:text-teal-300">
                          📖 教師逐步解題說明（{Math.min(revealedCount, steps.length)} / {steps.length}）
                        </span>
                        <div className="flex items-center gap-1.5">
                          {revealedCount < steps.length && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setRevealedSteps((prev) => ({
                                    ...prev,
                                    [q.id]: Math.min(steps.length, (prev[q.id] ?? 1) + 1),
                                  }))
                                }
                                className="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-[11px] font-black flex items-center gap-1 transition cursor-pointer"
                              >
                                <span>下一步提示</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setRevealedSteps((prev) => ({ ...prev, [q.id]: steps.length }))
                                }
                                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-stone-300 dark:border-slate-600 text-slate-600 dark:text-slate-200 text-[11px] font-bold transition cursor-pointer"
                              >
                                展開全部
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                        {steps.slice(0, revealedCount).map((step, sIdx) => (
                          <li key={sIdx} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {qStrokes.length > 0 && (
                    <PrioriScratchpadPreview
                      questionNumber={q.number}
                      strokes={qStrokes}
                      compact={true}
                    />
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 4. 獨立教師診斷後台視圖 (Teacher Diagnostic Dashboard)         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {viewMode === 'teacher' && (
        <PrioriTeacherDashboard onBack={() => setViewMode('hub')} />
      )}

      {/* 彈窗元件群 */}
      <PrioriZoomModal
        isOpen={Boolean(zoomImageSrc)}
        onClose={() => setZoomImageSrc(null)}
        imageSrc={zoomImageSrc}
        title={zoomTitle}
        question={currentQuestion}
        selectedAnswer={currentQuestion ? answers[currentQuestion.id] : null}
        onSelectAnswer={(oIdx) => {
          if (currentQuestion) handleSelectOption(currentQuestion.id, oIdx);
        }}
        readOnly={zoomReadOnly || viewMode !== 'quiz' || Boolean(slotFeedback)}
      />

      <PrioriQrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        initialPaperId={activePaperId}
        baseOrigin={baseOrigin}
      />

      <PrioriSubmitConfirmModal
        isOpen={isSubmitConfirmOpen}
        unansweredCount={
          uniqueActiveQuestions.filter((q) => !hasPrioriAnswer(q, answers[q.id])).length
        }
        onContinue={() => setIsSubmitConfirmOpen(false)}
        onConfirm={finalizeQuiz}
      />

      {/* 瀏覽器原生列印視圖（外部一律隱藏正解，教師含正解卷於教師後台提供） */}
      {viewMode !== 'teacher' && (
        <PrioriPrintableSheet
          paper={activePaper}
          questions={printQuestions}
          answers={answers}
          showAnswerKey={false}
        />
      )}
    </div>
  );
}
