import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button3D } from '../../components/ui/Button3D';
import { useI18n } from '../../context/I18nContext';
import { soundEngine, speakEnglish, stopSpeech, getVoiceDiagnostics } from '../../services/audio';
import { HonorSubmissionCard } from '../../components/HonorSubmissionCard';
import { getSentenceListeningQuestions, getDialogueQAQuestions } from '../../services/listeningQuestionBank.js';
import { generateQuizAlphabetQuestions } from '../../services/alphabetEngine';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, Volume2, Send, CheckCircle2, XCircle,
  Trophy, RotateCcw, Sparkles, Flame, Archive
} from 'lucide-react';

// 常見英語同音／近音字防撞群組（單字聽力四選一避開多正解爭議）
const HOMOPHONE_GROUPS = [
  ['one', 'won'],
  ['two', 'to', 'too'],
  ['four', 'for'],
  ['eight', 'ate'],
  ['red', 'read'],
  ['blue', 'blew'],
  ['sun', 'son'],
  ['sea', 'see'],
  ['bee', 'be'],
  ['eye', 'i'],
  ['no', 'know'],
  ['write', 'right'],
  ['meet', 'meat'],
  ['buy', 'by', 'bye'],
  ['here', 'hear'],
  ['there', 'their'],
  ['where', 'wear'],
  ['week', 'weak'],
  ['hour', 'our'],
  ['hair', 'hare'],
  ['bear', 'bare'],
  ['pear', 'pair'],
  ['flower', 'flour'],
  ['ant', 'aunt'],
  ['hi', 'high'],
  ['new', 'knew'],
  ['wait', 'weight'],
  ['way', 'weigh']
];

const FALLBACK_LISTEN_DISTRACTORS = [
  { en: 'apple', zh: '蘋果' },
  { en: 'banana', zh: '香蕉' },
  { en: 'book', zh: '書本' },
  { en: 'pencil', zh: '鉛筆' },
  { en: 'eraser', zh: '橡皮擦' },
  { en: 'ruler', zh: '尺' },
  { en: 'dog', zh: '狗' },
  { en: 'cat', zh: '貓' },
  { en: 'sunny', zh: '晴朗的' },
  { en: 'library', zh: '圖書館' }
];

const getHomophoneSet = (wordLower) => {
  const clean = String(wordLower || '').trim().toLowerCase();
  const group = HOMOPHONE_GROUPS.find(g => g.includes(clean));
  return new Set(group || [clean]);
};

const buildWordListeningOptions = (targetWord, allPool = []) => {
  const targetEn = String(targetWord?.en || '').trim();
  const targetLower = targetEn.toLowerCase();
  const targetZh = String(targetWord?.zh || '').trim();
  const bannedHomophones = getHomophoneSet(targetLower);

  const combinedPool = [...(allPool || []), ...FALLBACK_LISTEN_DISTRACTORS];
  const shuffledPool = [...combinedPool].sort(() => 0.5 - Math.random());

  const chosen = [];
  const usedLower = new Set([targetLower]);
  const usedZh = new Set(targetZh ? [targetZh] : []);

  for (const cand of shuffledPool) {
    if (chosen.length >= 3) break;
    const cEn = String(cand?.en || '').trim();
    const cLower = cEn.toLowerCase();
    const cZh = String(cand?.zh || '').trim();
    if (!cEn || usedLower.has(cLower)) continue;
    if (cZh && usedZh.has(cZh)) continue;
    if (bannedHomophones.has(cLower)) continue;
    usedLower.add(cLower);
    if (cZh) usedZh.add(cZh);
    chosen.push({ textEn: cEn, textZh: cZh, isCorrect: false, hideZhBeforeFeedback: true });
  }

  const rawOptions = [
    { textEn: targetEn, textZh: targetZh, isCorrect: true, hideZhBeforeFeedback: true },
    ...chosen
  ].sort(() => 0.5 - Math.random());

  return rawOptions.map((opt, idx) => ({
    ...opt,
    key: String.fromCharCode(65 + idx)
  }));
};

export const StandardQuiz = ({
  mode = 'zh-en',
  settings,
  words = [],
  qualifyingBook,
  onBack
}) => {
  const { t } = useI18n();
  const isAlphabetMode = Boolean(
    qualifyingBook === 'abc' ||
    (settings?.selectedUnits && settings.selectedUnits.includes('abc')) ||
    settings?.alphaMode
  );

  // 聽力三合一膠囊子模式：'word' (單字辨音) | 'sentence' (句子辨句) | 'qa' (情境問答)
  // 雙向速辨子模式：'zh-en' (看中選英) | 'en-zh' (看英選中) | 'mixed' (雙向混合)
  const [choiceDirection, setChoiceDirection] = useState(() => {
    return localStorage.getItem('wutai_quiz_choice_dir') || 'mixed';
  });
  const isChoiceMode = mode === 'quiz-choice' || mode === 'quiz-zh-en' || mode === 'quiz-en-zh';
  const isLegacyRetiredMode = isChoiceMode || mode === 'quiz-hard';

  const [listeningSubMode, setListeningSubMode] = useState(() => {
    return localStorage.getItem('wutai_quiz_listening_sub') || 'word';
  });

  const [queue, setQueue] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [selectedChoiceKey, setSelectedChoiceKey] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, streak: 0 });
  const [firstAttemptCorrect, setFirstAttemptCorrect] = useState(0);
  const [visualScore, setVisualScore] = useState(0);
  const [floatingPts, setFloatingPts] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bonusActive, setBonusActive] = useState(false);
  const [audioReadyForBonus, setAudioReadyForBonus] = useState(false);
  const [audioNeedsManualPlay, setAudioNeedsManualPlay] = useState(false);
  const [bonusTimeLeftMs, setBonusTimeLeftMs] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [voiceDiag, setVoiceDiag] = useState(() => getVoiceDiagnostics('standard_us'));

  const inputRef = useRef(null);
  const initialCountRef = useRef(0);
  const historyWordsRef = useRef(new Map());
  const mistakeIdsRef = useRef(new Set());
  const firstAttemptDoneRef = useRef(new Set());
  const repeatFailCountRef = useRef(new Map());
  const floatTimerRef = useRef(null);
  const moveNextTimerRef = useRef(null);
  const wrongReplayTimerRef = useRef(null);
  const questionPlayGenRef = useRef(0);
  const questionAudioCompletedRef = useRef(false);

  // 初始化題庫隊列 (支援單字、小鎮生活句子辨句、小鎮生活情境問答)
  useEffect(() => {
    let list = [];

    if (isAlphabetMode) {
      const qCount = settings?.count === 'all' ? 26 : (parseInt(settings?.count, 10) || 20);
      const effectiveAlphaMode = settings?.alphaMode || (Number(settings?.alphaGrade) === 2 ? 'lower' : 'upper');
      let qType = 'upper_to_lower';
      if (mode === 'quiz-en-zh' || (isChoiceMode && choiceDirection === 'en-zh')) {
        qType = 'lower_to_upper';
      }
      if (mode === 'quiz-listening') {
        qType = 'listening';
      }
      if (isChoiceMode && choiceDirection === 'mixed') {
        const half = Math.ceil(qCount / 2);
        const listA = generateQuizAlphabetQuestions('upper_to_lower', half, effectiveAlphaMode);
        const listB = generateQuizAlphabetQuestions('lower_to_upper', qCount - half, effectiveAlphaMode);
        list = [...listA, ...listB].sort(() => 0.5 - Math.random());
      } else {
        list = generateQuizAlphabetQuestions(qType, qCount, effectiveAlphaMode);
      }
    } else if (mode === 'quiz-listening') {
      const qCount = settings?.count === 'all' ? 30 : (parseInt(settings?.count, 10) || 20);

      if (listeningSubMode === 'sentence') {
        list = getSentenceListeningQuestions(qCount);
      } else if (listeningSubMode === 'qa') {
        list = getDialogueQAQuestions(qCount);
      } else {
        // 'word' 單字辨音模式 ➔ 升級為 2×2 四選一觸控大卡（含同音詞防撞過濾）
        let filtered = words.filter(w => settings?.selectedUnits?.includes(`${w.book}-${w.lesson}`));
        if (filtered.length === 0 && words.length > 0) {
          filtered = words; // 若未選單元，預設隨機挑選全部單字
        }
        let shuffled = [...filtered].sort(() => 0.5 - Math.random());
        if (settings?.count !== 'all') {
          shuffled = shuffled.slice(0, parseInt(settings?.count, 10) || 20);
        }
        const distractorPool = filtered.length >= 4 ? filtered : words;
        list = shuffled.map((w) => ({
          ...w,
          subMode: 'word',
          audioText: w.en,
          correctEn: w.en,
          correctZh: w.zh,
          promptZh: '請聆聽發音，選出聽到的正確英文單字：',
          options: buildWordListeningOptions(w, distractorPool)
        }));
      }
    } else {
      let filtered = words.filter(w => settings?.selectedUnits?.includes(`${w.book}-${w.lesson}`));
      if (filtered.length === 0 && words.length > 0) {
        filtered = words;
      }
      let shuffled = [...filtered].sort(() => 0.5 - Math.random());
      if (settings?.count !== 'all') {
        shuffled = shuffled.slice(0, parseInt(settings?.count, 10) || 20);
      }
      list = shuffled.map((w, idx) => {
        let qDir = choiceDirection;
        if (choiceDirection === 'mixed') {
          qDir = idx % 2 === 0 ? 'zh-en' : 'en-zh';
        }
        return { ...w, qDirection: qDir };
      });
    }

    setQueue(list);
    initialCountRef.current = list.length;
    historyWordsRef.current.clear();
    mistakeIdsRef.current.clear();
    firstAttemptDoneRef.current.clear();
    repeatFailCountRef.current.clear();
    setFirstAttemptCorrect(0);

    list.forEach(w => {
      historyWordsRef.current.set(w.id, {
        id: w.id,
        en: w.correctEn || w.en,
        zh: w.correctZh || w.zh
      });
    });

    setCurrentQuestion(list[0] || null);
  }, [settings, words, mode, listeningSubMode, choiceDirection, isChoiceMode, isAlphabetMode]);

  // 卸載時確保停止語音與計時，並在聽力模式追蹤瀏覽器美式語音品質
  useEffect(() => {
    const updateDiag = () => setVoiceDiag(getVoiceDiagnostics('standard_us'));
    updateDiag();
    const tDiag = setTimeout(updateDiag, 400);
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    try {
      synth?.addEventListener?.('voiceschanged', updateDiag);
    } catch (e) {}

    return () => {
      clearTimeout(tDiag);
      try {
        synth?.removeEventListener?.('voiceschanged', updateDiag);
      } catch (e) {}
      if (floatTimerRef.current) clearTimeout(floatTimerRef.current);
      if (moveNextTimerRef.current) clearTimeout(moveNextTimerRef.current);
      if (wrongReplayTimerRef.current) clearTimeout(wrongReplayTimerRef.current);
      stopSpeech();
    };
  }, []);

  // 統一當題語音播放狀態（首次播放與手動/慢速重播共用）：僅當語音真正成功播完才解鎖 12 秒速度加分
  const playQuestionAudio = useCallback((textToSpeak, customRate = null) => {
    if (!textToSpeak) return;
    const gen = questionPlayGenRef.current;
    setIsSpeaking(true);
    setAudioNeedsManualPlay(false);
    const opts = typeof customRate === 'number' ? { persona: 'standard_us', rate: customRate } : { persona: 'standard_us' };
    speakEnglish(textToSpeak, {
      ...opts,
      onStart: () => {
        if (questionPlayGenRef.current !== gen) return;
        setIsSpeaking(true);
        setAudioNeedsManualPlay(false);
      },
      onEnd: (info) => {
        if (questionPlayGenRef.current !== gen) return;
        setIsSpeaking(false);
        if (info?.completed === true) {
          setAudioNeedsManualPlay(false);
          if (!questionAudioCompletedRef.current) {
            questionAudioCompletedRef.current = true;
            setAudioReadyForBonus(true);
            setBonusTimeLeftMs(12000);
            setBonusActive(true);
          }
        } else if (info?.reason !== 'cancelled' && !questionAudioCompletedRef.current) {
          setAudioNeedsManualPlay(true);
        }
      }
    });
  }, []);

  // 聽力模式自動播放語音；首次真正成功播完 (info.completed === true) 才啟動 12 秒速度加分條
  useEffect(() => {
    questionPlayGenRef.current += 1;
    questionAudioCompletedRef.current = false;
    setBonusActive(false);
    setAudioReadyForBonus(false);
    setAudioNeedsManualPlay(false);
    setBonusTimeLeftMs(0);

    if (hasStarted && mode === 'quiz-listening' && currentQuestion && !isFinished) {
      const textToSpeak = currentQuestion.audioText || currentQuestion.en;
      if (textToSpeak) {
        const timer = setTimeout(() => {
          playQuestionAudio(textToSpeak, null);
        }, 280);
        return () => {
          questionPlayGenRef.current += 1;
          clearTimeout(timer);
          setIsSpeaking(false);
          stopSpeech();
        };
      }
    }
  }, [currentQuestion, hasStarted, mode, isFinished, playQuestionAudio]);

  // 12 秒黃金速度加分條（純視覺連擊鼓勵，歸零零懲罰、絕不影響首答正確率）
  useEffect(() => {
    if (!bonusActive || !audioReadyForBonus || feedback !== null || isFinished || mode !== 'quiz-listening') return;
    const startTs = Date.now();
    const interval = setInterval(() => {
      const left = Math.max(0, 12000 - (Date.now() - startTs));
      setBonusTimeLeftMs(left);
      if (left <= 0) {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [bonusActive, audioReadyForBonus, feedback, isFinished, mode]);

  const handleStart = () => {
    if (queue.length === 0) return;
    setHasStarted(true);
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  // 自動直接開局（依據 Lobby 整備室設定，零二次彈窗）
  useEffect(() => {
    if (queue.length > 0 && !hasStarted) {
      handleStart();
    }
  }, [queue.length, hasStarted]);

  // 重新播放當前題目語音（支援原速與 0.78x 慢速；自動播放未觸發時點擊重播成功後亦可解鎖當題速度計時）
  const handleReplayAudio = useCallback((customRate = null) => {
    if (!currentQuestion) return;
    const textToSpeak = currentQuestion.audioText || currentQuestion.en;
    if (textToSpeak) {
      playQuestionAudio(textToSpeak, customRate);
    }
  }, [currentQuestion, playQuestionAudio]);

  // 單選題選項點擊處理 (全模式四選一觸控卡片)
  const handleSelectChoice = (option) => {
    if (feedback !== null || !currentQuestion) return;

    const speedBonus = mode === 'quiz-listening' && bonusActive && audioReadyForBonus && bonusTimeLeftMs > 0
      ? Math.round((bonusTimeLeftMs / 12000) * 50)
      : 0;

    questionPlayGenRef.current += 1;
    stopSpeech();
    setIsSpeaking(false);
    setBonusActive(false);
    setSelectedChoiceKey(option.key);
    const isCorrect = option.isCorrect;
    const qId = currentQuestion.id;

    const isFirstAttempt = !firstAttemptDoneRef.current.has(qId);
    if (isFirstAttempt) {
      firstAttemptDoneRef.current.add(qId);
      if (isCorrect) {
        setFirstAttemptCorrect(prev => prev + 1);
      }
    }

    if (isCorrect) {
      setFeedback('correct');
      const newStreak = stats.streak + 1;
      setStats(s => ({ ...s, correct: s.correct + 1, streak: newStreak }));
      const gain = 100 + speedBonus + Math.min((newStreak - 1) * 20, 80);
      setVisualScore(v => v + gain);
      if (floatTimerRef.current) clearTimeout(floatTimerRef.current);
      setFloatingPts({ id: Date.now(), text: newStreak >= 2 ? `+${gain} 🔥 x${newStreak}` : `+${gain}` });
      floatTimerRef.current = setTimeout(() => setFloatingPts(null), 1200);

      soundEngine.correct();
      soundEngine.hapticPulse('normal');
      if (newStreak >= 2) soundEngine.combo(newStreak);

      if (moveNextTimerRef.current) clearTimeout(moveNextTimerRef.current);
      moveNextTimerRef.current = setTimeout(() => moveToNext(true), 950);
    } else {
      setFeedback('wrong');
      mistakeIdsRef.current.add(currentQuestion.id);
      setStats(s => ({ ...s, wrong: s.wrong + 1, streak: 0 }));
      soundEngine.wrong();
      soundEngine.hapticPulse('strong');

      if (mode === 'quiz-listening') {
        const answerAudio = currentQuestion.audioText || currentQuestion.correctEn || currentQuestion.en;
        if (answerAudio) {
          if (wrongReplayTimerRef.current) clearTimeout(wrongReplayTimerRef.current);
          const replayGen = questionPlayGenRef.current;
          wrongReplayTimerRef.current = setTimeout(() => {
            if (questionPlayGenRef.current !== replayGen) return;
            speakEnglish(answerAudio, { persona: 'standard_us', rate: 0.85 });
          }, 450);
        }
      }

      if (moveNextTimerRef.current) clearTimeout(moveNextTimerRef.current);
      moveNextTimerRef.current = setTimeout(() => moveToNext(false), 2500);
    }
  };

  // 文字輸入送出處理 (單字拼寫測驗)
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || feedback) return;

    let isCorrect = false;
    const ans = inputValue.trim().toLowerCase();

    let effectiveDir = currentQuestion?.qDirection || choiceDirection;
    if (mode === 'quiz-zh-en') effectiveDir = 'zh-en';
    if (mode === 'quiz-en-zh') effectiveDir = 'en-zh';

    if (effectiveDir === 'zh-en' || mode === 'quiz-listening' || mode === 'quiz-hard') {
      const target = (currentQuestion.correctEn || currentQuestion.en || '').toLowerCase();
      isCorrect = ans === target;
    } else {
      const inputTargets = ans.split(/[、,，/]/).map(w => w.trim());
      const correctTargets = (currentQuestion.correctZh || currentQuestion.zh || '').split(/[、,，/]/).map(w => w.trim());
      isCorrect = inputTargets.some(u => correctTargets.includes(u));
    }

    const qId = currentQuestion.id;
    const isFirstAttempt = !firstAttemptDoneRef.current.has(qId);
    if (isFirstAttempt) {
      firstAttemptDoneRef.current.add(qId);
      if (isCorrect) {
        setFirstAttemptCorrect(prev => prev + 1);
      }
    }

    if (isCorrect) {
      setFeedback('correct');
      const newStreak = stats.streak + 1;
      setStats(s => ({ ...s, correct: s.correct + 1, streak: newStreak }));
      soundEngine.correct();
      if (newStreak >= 3) soundEngine.combo(newStreak);

      setTimeout(() => moveToNext(true), 900);
    } else {
      setFeedback('wrong');
      mistakeIdsRef.current.add(currentQuestion.id);
      setStats(s => ({ ...s, wrong: s.wrong + 1, streak: 0 }));
      soundEngine.wrong();

      setTimeout(() => moveToNext(false), 1800);
    }
  };

  const moveToNext = (wasCorrect) => {
    if (moveNextTimerRef.current) {
      clearTimeout(moveNextTimerRef.current);
      moveNextTimerRef.current = null;
    }
    if (wrongReplayTimerRef.current) {
      clearTimeout(wrongReplayTimerRef.current);
      wrongReplayTimerRef.current = null;
    }
    stopSpeech();
    setIsSpeaking(false);
    setBonusActive(false);
    setFeedback(null);
    setSelectedChoiceKey(null);
    setInputValue('');
    inputRef.current?.focus();

    const newQ = [...queue];
    const curr = newQ.shift();

    // 答錯沉底：錯題循環重測機制 (單題上限3次重試，複製新物件確保最後一題重試也會重新播音)
    if (!wasCorrect && curr) {
      const failCount = (repeatFailCountRef.current.get(curr.id) || 0) + 1;
      repeatFailCountRef.current.set(curr.id, failCount);
      if (failCount < 3) {
        newQ.push({ ...curr, _retryKey: failCount });
      }
    }

    if (newQ.length > 0) {
      setQueue(newQ);
      setCurrentQuestion(newQ[0]);
    } else {
      const finalSec = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(finalSec);
      setIsFinished(true);
      soundEngine.win();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    }
  };

// 測驗結算畫面
  if (isFinished) {
    const isTownListeningMode = mode === 'quiz-listening' && (listeningSubMode === 'sentence' || listeningSubMode === 'qa');
    const isNewWordListening = mode === 'quiz-listening' && listeningSubMode === 'word' && !isAlphabetMode;
    const isPracticeOnlyMode = Boolean(isLegacyRetiredMode || isNewWordListening);
    const rangeDescription = isTownListeningMode
      ? (listeningSubMode === 'sentence' ? '小鎮生活英語句型辨析' : '小鎮生活情境問答挑戰')
      : qualifyingBook
      ? `第 ${qualifyingBook} 冊`
      : settings?.selectedUnits?.slice(0, 3).join(', ');

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fadeIn">
        <GlassCard className="max-w-lg w-full text-center p-4 sm:p-6 md:p-8">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-3 animate-bounce" />
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 font-heading mb-1">
            {t.perfect}
          </h2>
          <p className="text-xs font-bold text-slate-500 mb-6">
            {t.spentTime}：<span className="text-blue-600 font-black text-lg">{elapsedTime} 秒</span>
            {mode === 'quiz-listening' && (
              <>
                {' '}• 局內聲波積分：<span className="text-amber-500 font-black">{visualScore}</span>
              </>
            )}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {firstAttemptCorrect} / {initialCountRef.current || stats.correct}
              </span>
              <p className="text-xs font-bold text-slate-500 mt-1">首次答對 ({Math.round((firstAttemptCorrect / (initialCountRef.current || 1)) * 100)}%)</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {mistakeIdsRef.current.size > 0 ? `+${mistakeIdsRef.current.size}` : '0'}
              </span>
              <p className="text-xs font-bold text-slate-500 mt-1">
                {mistakeIdsRef.current.size > 0 ? '完成錯題訂正' : '一次零失誤'}
              </p>
            </div>
          </div>

          {/* 榮譽榜破紀錄留名判定卡與獎狀領取 (僅傳入首答正確數；舊版打字與新版四選一單字聽力採練習隔離) */}
          <HonorSubmissionCard
            mode={isChoiceMode ? 'quiz-choice' : mode}
            book={isTownListeningMode ? null : qualifyingBook}
            score={firstAttemptCorrect}
            correctCount={firstAttemptCorrect}
            practiceOnly={isPracticeOnlyMode}
            time={elapsedTime}
            totalCount={initialCountRef.current || 20}
            rangeText={rangeDescription}
            reviewWords={Array.from(historyWordsRef.current.values()).map(w => ({
              ...w,
              isMistake: mistakeIdsRef.current.has(w.id)
            }))}
          />

          <Button3D variant="slate" size="lg" onClick={() => { stopSpeech(); onBack(); }} className="w-full">
            {t.backLobby}
          </Button3D>
        </GlassCard>
      </div>
    );
  }

  // 測驗進行中畫面
  const hasOptions = Array.isArray(currentQuestion?.options) && currentQuestion.options.length > 0;
  const completedCount = Math.max(0, (initialCountRef.current || queue.length) - queue.length);
  const totalQCount = Math.max(1, initialCountRef.current || queue.length);
  const isListeningMode = mode === 'quiz-listening';

  return (
    <div className={
      isListeningMode
        ? 'fixed inset-0 z-40 h-[100dvh] w-full bg-slate-950 flex flex-col items-center justify-between p-3 sm:p-5 overflow-hidden select-none animate-fadeIn'
        : 'w-full max-w-3xl mx-auto px-4 py-4 flex flex-col items-center'
    }>
      {isListeningMode && (
        <>
          <img
            src="/assets/lobby/theme_quiz.jpg"
            alt="Starlight Acoustic Arena"
            className="absolute inset-0 w-full h-full object-cover opacity-35 brightness-75 pointer-events-none select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-indigo-950/60 to-slate-950/90 pointer-events-none" />
        </>
      )}

      <div className={`relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center ${isListeningMode ? 'h-full justify-between' : ''}`}>
        {/* 舊版中英打字測驗退役提醒 */}
        {isLegacyRetiredMode && (
          <div className="w-full mb-3 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-700/60 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
            <Archive className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>舊版打字測驗已退役為純練習模式（歷史榜單已封存保留），新作答不計入排行榜。</span>
          </div>
        )}

        {/* 頂部資訊列 */}
        <div className="w-full flex items-center justify-between mb-2 sm:mb-3 gap-2 shrink-0">
          <Button3D variant="slate" size="sm" onClick={() => { stopSpeech(); onBack(); }} icon={ArrowLeft}>
            {t.backLobby}
          </Button3D>

          {/* 聽力模式子標籤徽章 */}
          {isListeningMode && (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-200 border border-sky-400/40 backdrop-blur-md">
              {listeningSubMode === 'sentence' ? '🦁 句子辨句' : listeningSubMode === 'qa' ? '💬 情境問答' : '🎧 單字辨音'}
            </span>
          )}

          <div className="flex items-center gap-1.5">
            {isListeningMode && stats.streak >= 2 && (
              <span
                key={`qz-combo-${stats.streak}`}
                className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black flex items-center gap-1 shadow-md animate-balloon-pump"
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>x{stats.streak}</span>
              </span>
            )}
            {isListeningMode && (
              <span className="px-2.5 py-0.5 rounded-xl bg-slate-900/85 border border-amber-400/35 text-amber-300 text-xs font-mono font-black">
                {visualScore} pt
              </span>
            )}
            <span className={`text-xs font-black ${isListeningMode ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
              {t.remaining}{queue.length}
            </span>
          </div>
        </div>

        {/* 聽力進度條 */}
        {isListeningMode && (
          <div className="w-full h-1.5 rounded-full bg-slate-800/90 overflow-hidden mb-2 shrink-0">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.round((completedCount / totalQCount) * 100)}%` }}
            />
          </div>
        )}

      {currentQuestion && (
        <GlassCard className={`w-full text-center relative overflow-hidden ${
          isListeningMode
            ? 'flex-1 min-h-0 flex flex-col justify-between p-4 sm:p-7 border-2 border-sky-400/40 bg-slate-900/80 text-white'
            : 'p-6 sm:p-10'
        }`}>
          {/* 浮動加分動畫 */}
          {floatingPts && (
            <div
              key={floatingPts.id}
              className="pointer-events-none absolute top-4 right-5 z-30 text-lg sm:text-2xl font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(251,191,36,0.9)] animate-float-up-fade"
            >
              {floatingPts.text}
            </div>
          )}

          {/* 連擊 Combo 徽章（非聽力備援顯示） */}
          {!isListeningMode && stats.streak >= 2 && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs shadow-md animate-bounce">
              🔥 Combo x{stats.streak}!
            </div>
          )}

          {/* 題目與發音顯示區域 */}
          <div className="min-h-[125px] flex flex-col items-center justify-center mb-3 sm:mb-5">
            {(currentQuestion?.qDirection === 'zh-en' || (!currentQuestion?.qDirection && choiceDirection === 'zh-en') || mode === 'quiz-zh-en' || mode === 'quiz-hard') && !isListeningMode ? (
              <h2 className="text-3xl sm:text-5xl font-black text-slate-800 dark:text-slate-100 font-heading">
                {currentQuestion.zh}
              </h2>
            ) : isListeningMode ? (
              <div className="flex flex-col items-center w-full">
                {/* 題目提示語句 */}
                {(currentQuestion.promptZh || currentQuestion.prompt) && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-200 text-xs sm:text-sm font-black mb-3 animate-fadeIn">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{currentQuestion.promptZh || currentQuestion.prompt}</span>
                  </div>
                )}

                {/* 動態聲波圓環與 5 軌跳動音律條 */}
                <div className="flex items-center justify-center gap-3 sm:gap-5">
                  <div className="hidden sm:flex items-end gap-1 h-10">
                    {[0.4, 0.85, 0.6, 1.0, 0.5].map((h, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 rounded-full bg-sky-400 transition-all duration-200 ${
                          isSpeaking ? 'animate-pulse' : 'opacity-40'
                        }`}
                        style={{ height: `${Math.round((isSpeaking ? h : 0.25) * 36)}px` }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReplayAudio(null)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer relative group ${
                      isSpeaking ? 'ring-4 ring-sky-300/60 scale-105' : ''
                    }`}
                    title="點擊重新朗讀發音"
                  >
                    <Volume2 className="w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-110 transition-transform" />
                    {isSpeaking && (
                      <span className="absolute inset-0 rounded-full border-4 border-sky-300 animate-ping opacity-50" />
                    )}
                  </button>

                  <div className="hidden sm:flex items-end gap-1 h-10">
                    {[0.5, 1.0, 0.6, 0.85, 0.4].map((h, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 rounded-full bg-cyan-400 transition-all duration-200 ${
                          isSpeaking ? 'animate-pulse' : 'opacity-40'
                        }`}
                        style={{ height: `${Math.round((isSpeaking ? h : 0.25) * 36)}px` }}
                      />
                    ))}
                  </div>
                </div>

                {/* 重播與 0.78x 慢速播放控制列 */}
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => handleReplayAudio(null)}
                    className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/15 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>重播原速</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReplayAudio(0.78)}
                    className="px-2.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-400/40 text-[11px] font-black cursor-pointer"
                  >
                    🐢 慢速 0.78x
                  </button>
                </div>

                {/* 12 秒黃金速度加分條（首次語音真正播完後開始，歸零無懲罰） */}
                <div className="w-full max-w-md mt-2.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-0.5">
                    <span>
                      {bonusActive
                        ? '⚡ 速度加分計時中（歸零不扣分）'
                        : audioNeedsManualPlay
                        ? '🔇 自動播放未觸發，請點擊上方喇叭手動播放'
                        : '🎧 請先專心聆聽語音，播完啟動加分計時...'}
                    </span>
                    <span className="font-mono text-amber-300">
                      {bonusActive ? `${(bonusTimeLeftMs / 1000).toFixed(1)}s` : '--'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-100 ${
                        bonusTimeLeftMs > 4000 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: bonusActive ? `${Math.round((bonusTimeLeftMs / 12000) * 100)}%` : '0%' }}
                    />
                  </div>
                  {(voiceDiag?.quality === 'missing_en' || voiceDiag?.quality === 'legacy_sapi') && (
                    <p className="mt-1.5 text-[10px] font-bold text-amber-300/90 leading-snug">
                      {voiceDiag.quality === 'missing_en'
                        ? '⚠️ 本瀏覽器未內建美式英語語音包，建議改用 Edge / Chrome / iPad Safari 享清晰美語'
                        : `💡 目前使用 Windows 基礎語音（${voiceDiag.voiceName}），改用 Edge / Chrome / iPad 可享更自然美式原聲`}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {(currentQuestion.promptZh || currentQuestion.prompt) && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-300/40 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-black mb-3 animate-fadeIn">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentQuestion.promptZh || currentQuestion.prompt}</span>
                  </div>
                )}
                <h2 className="text-3xl sm:text-5xl font-black text-slate-800 dark:text-slate-100 font-heading">
                  {currentQuestion.target || currentQuestion.en}
                </h2>
              </div>
            )}
          </div>

          {/* 四選一明確正誤回饋橫幅（避免答錯後只變色直接跳題讓人誤以為亂按就通過） */}
          {hasOptions && feedback && (
            <div
              className={`w-full max-w-2xl mx-auto mb-3 px-3.5 py-2 rounded-2xl border text-xs sm:text-sm font-black flex items-center justify-center gap-2 animate-fadeIn ${
                feedback === 'correct'
                  ? (isListeningMode
                    ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200')
                  : (isListeningMode
                    ? 'bg-rose-500/20 border-rose-400/60 text-rose-200'
                    : 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-700 dark:text-rose-200')
              }`}
            >
              {feedback === 'correct' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>
                    答對了！「{currentQuestion.correctEn || currentQuestion.correctAnswer || currentQuestion.en}」
                    {currentQuestion.correctZh ? `（${currentQuestion.correctZh}）` : ''}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-300 shrink-0" />
                  <span>
                    答錯了！正確答案是「{currentQuestion.correctEn || currentQuestion.correctAnswer || currentQuestion.en}」
                    {currentQuestion.correctZh ? `（${currentQuestion.correctZh}）` : ''} — 已加入錯題，待會會再考一次！
                  </span>
                </>
              )}
            </div>
          )}

          {/* 🌟 4 大實體觸控卡片選項 (全聽力子模式 & 字母認讀專用) 🌟 */}
          {hasOptions ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto w-full">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedChoiceKey === opt.key;
                const showSuccess = feedback === 'correct' && opt.isCorrect;
                const showWrongSelection = feedback === 'wrong' && isSelected;
                const showAnswerReveal = feedback === 'wrong' && opt.isCorrect;
                const shouldShowZh = Boolean(opt.textZh && (!opt.hideZhBeforeFeedback || feedback !== null));

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectChoice(opt)}
                    disabled={feedback !== null}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 relative shadow-md active:scale-98 cursor-pointer ${
                      showSuccess
                        ? 'bg-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-300/50 scale-[1.02]'
                        : showWrongSelection
                        ? 'bg-rose-500 text-white border-rose-300 scale-[0.98]'
                        : showAnswerReveal
                        ? 'bg-emerald-500/90 text-white border-emerald-300 ring-4 ring-emerald-400/60 animate-pulse'
                        : isListeningMode
                        ? 'bg-slate-800/90 border-sky-400/25 hover:border-sky-400 hover:bg-slate-800 text-white hover:shadow-lg'
                        : 'bg-white/95 dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-xl font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-sm ${
                      showSuccess || showAnswerReveal
                        ? 'bg-white text-emerald-700'
                        : showWrongSelection
                        ? 'bg-white text-rose-700'
                        : isListeningMode
                        ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}>
                      {opt.key}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className={`text-base sm:text-xl font-black leading-snug break-words ${
                        showSuccess || showWrongSelection || showAnswerReveal || isListeningMode
                          ? 'text-white'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}>
                        {opt.textEn || opt.text || opt.label || ''}
                      </p>
                      {shouldShowZh && (
                        <p className={`text-xs font-bold mt-1 animate-fadeIn ${
                          showSuccess || showWrongSelection || showAnswerReveal
                            ? 'text-white/90'
                            : isListeningMode
                            ? 'text-slate-300'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {opt.textZh}
                        </p>
                      )}
                    </div>

                    {showSuccess && <CheckCircle2 className="w-5 h-5 text-white shrink-0 animate-bounce" />}
                    {showWrongSelection && <XCircle className="w-5 h-5 text-white shrink-0 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          ) : (
            /* 傳統輸入框表單 (單字拼寫測驗) */
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-lg mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="請輸入答案並按 Enter..."
                disabled={feedback !== null}
                autoComplete="off"
                autoFocus
                className="flex-1 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-xl font-black text-center text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
              />
              <Button3D
                type="submit"
                variant="blue"
                size="lg"
                disabled={!inputValue.trim() || feedback !== null}
                icon={Send}
              >
                送出
              </Button3D>
            </form>
          )}

          {/* 正誤即時遮罩 (若為單字拼寫輸入框時顯示) */}
          {!hasOptions && feedback && (
            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md animate-fadeIn ${
              feedback === 'correct' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/95 text-white'
            }`}>
              {feedback === 'correct' ? (
                <>
                  <CheckCircle2 className="w-16 h-16 mb-2 animate-bounce" />
                  <span className="text-3xl font-black font-heading">{t.correct}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 mb-2" />
                  <span className="text-2xl font-black font-heading mb-1">{t.wrong}</span>
                  <p className="text-sm font-bold opacity-90">
                    正確答案：<span className="text-xl underline font-black ml-1">
                      {(currentQuestion?.qDirection === 'en-zh' || mode === 'quiz-en-zh') ? currentQuestion.zh : currentQuestion.en}
                    </span>
                  </p>
                </>
              )}
            </div>
          )}
        </GlassCard>
      )}
      </div>
    </div>
  );
};
