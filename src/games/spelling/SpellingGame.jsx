import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button3D } from '../../components/ui/Button3D';
import { useI18n } from '../../context/I18nContext';
import { soundEngine, speakEnglish, stopSpeech } from '../../services/audio';
import { HonorSubmissionCard } from '../../components/HonorSubmissionCard';
import { generateSpellingAlphabetRound } from '../../services/alphabetEngine';
import { enterFullscreen, exitFullscreen } from '../../services/fullscreen';
import confetti from 'canvas-confetti';
import { ArrowLeft, Volume2, Heart, Trophy, CheckCircle2, HeartCrack, Flame } from 'lucide-react';

export const SpellingGame = ({
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
  const isAlphabetModeRef = useRef(isAlphabetMode);
  isAlphabetModeRef.current = isAlphabetMode;
  const [queue, setQueue] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [wordGroups, setWordGroups] = useState([]);
  const [cleanTarget, setCleanTarget] = useState('');
  const [slots, setSlots] = useState([]);
  const [letters, setLetters] = useState([]);
  const [lives, setLives] = useState(5);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [shakingSlot, setShakingSlot] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [streak, setStreak] = useState(0);
  const [visualScore, setVisualScore] = useState(0);
  const [floatingPts, setFloatingPts] = useState(null);
  const initialCountRef = useRef(0);
  const historyWordsRef = useRef(new Map());
  const mistakeIdsRef = useRef(new Set());
  const livesRef = useRef(5);
  const streakRef = useRef(0);
  const floatTimerRef = useRef(null);

  // 同步 Refs 供鍵盤、拖曳與異步回呼使用，杜絕 stale closure
  const cleanTargetRef = useRef('');
  cleanTargetRef.current = cleanTarget;
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  const lettersRef = useRef(letters);
  lettersRef.current = letters;
  const feedbackRef = useRef(feedback);
  feedbackRef.current = feedback;
  const hasStartedRef = useRef(hasStarted);
  hasStartedRef.current = hasStarted;
  const isFinishedRef = useRef(isFinished);
  isFinishedRef.current = isFinished;
  const currentWordRef = useRef(currentWord);
  currentWordRef.current = currentWord;
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const startTimeRef = useRef(startTime);
  startTimeRef.current = startTime;

  // 解析題目：支援片語分組 (如 "by bike" -> [by(2), bike(4)])
  const parsePhrase = (rawEn = '') => {
    const words = rawEn.trim().split(/\s+/).filter(Boolean);
    let globalSlotIndex = 0;
    const groups = [];
    const allCleanChars = [];

    for (const w of words) {
      const chars = w.toLowerCase().replace(/[^a-z]/g, '').split('');
      const group = {
        word: w,
        slots: []
      };
      for (const ch of chars) {
        group.slots.push({
          char: ch,
          slotIndex: globalSlotIndex
        });
        allCleanChars.push(ch);
        globalSlotIndex++;
      }
      if (group.slots.length > 0) {
        groups.push(group);
      }
    }

    return {
      wordGroups: groups,
      cleanTarget: allCleanChars.join(''),
      totalSlots: globalSlotIndex
    };
  };

  useEffect(() => {
    let shuffled = [];
    if (isAlphabetMode) {
      const effectiveAlphaGrade = settings?.alphaGrade || (settings?.alphaMode === 'lower' ? 2 : 1);
      const effectiveAlphaMode = settings?.alphaMode || (Number(effectiveAlphaGrade) === 2 ? 'lower' : 'upper');
      const qCount = settings?.count === 'all' ? 15 : (parseInt(settings?.count, 10) || 10);
      shuffled = generateSpellingAlphabetRound({
        count: qCount,
        alphaMode: effectiveAlphaMode,
        alphaGrade: effectiveAlphaGrade
      }).map((q) => ({
        ...q,
        en: q.sequenceChars.join(' '),
        zh: q.meaningZh,
        audioText: q.sequenceChars.join(', ')
      }));
    } else {
      let filtered = words.filter(w => (settings?.selectedUnits || []).includes(`${w.book}-${w.lesson}`));
      if (filtered.length === 0 && words.length > 0) {
        filtered = words;
      }
      shuffled = [...filtered].sort(() => 0.5 - Math.random());
      if (settings?.count && settings.count !== 'all') {
        shuffled = shuffled.slice(0, parseInt(settings.count, 10));
      }
    }
    setQueue(shuffled);
    queueRef.current = shuffled;
    initialCountRef.current = shuffled.length;
    historyWordsRef.current.clear();
    mistakeIdsRef.current.clear();
    shuffled.forEach(w => historyWordsRef.current.set(w.id, { id: w.id, en: w.en, zh: w.zh }));
  }, [settings, words, isAlphabetMode]);

  const loadWord = (wordObj) => {
    if (!wordObj || !wordObj.en) return;
    setCurrentWord(wordObj);
    currentWordRef.current = wordObj;

    if (wordObj.isAlphabetQuestion) {
      const target = wordObj.sequenceChars.join('');
      const groups = [{
        word: target,
        slots: wordObj.slots.map(s => ({
          char: s.expectedChar,
          slotIndex: s.slotIndex
        }))
      }];
      setWordGroups(groups);
      setCleanTarget(target);
      cleanTargetRef.current = target;

      const initialSlots = wordObj.slots.map((s) => (
        s.isGiven
          ? { id: `given-${wordObj.id}-${s.slotIndex}`, char: s.expectedChar, isGiven: true, isPlaced: true }
          : null
      ));
      setSlots(initialSlots);
      slotsRef.current = initialSlots;

      const candidateList = wordObj.candidateTiles.map(tile => ({ ...tile, isPlaced: false }));
      setLetters(candidateList);
      lettersRef.current = candidateList;

      setLives(5);
      livesRef.current = 5;
      setFeedback(null);
      feedbackRef.current = null;
      setTimeout(() => speakEnglish(wordObj.audioText || wordObj.en, { persona: 'standard_us' }), 250);
      return;
    }

    const { wordGroups: groups, cleanTarget: target, totalSlots } = parsePhrase(wordObj.en);
    if (totalSlots === 0) {
      moveToNext(true);
      return;
    }

    setWordGroups(groups);
    setCleanTarget(target);
    cleanTargetRef.current = target;

    const initialSlots = new Array(totalSlots).fill(null);
    setSlots(initialSlots);
    slotsRef.current = initialSlots;

    const chars = target.split('').map((char, index) => ({
      id: `letter-${index}-${Date.now()}-${Math.random()}`,
      char,
      isPlaced: false
    }));

    const shuffledLetters = [...chars].sort(() => 0.5 - Math.random());
    setLetters(shuffledLetters);
    lettersRef.current = shuffledLetters;

    setLives(5);
    livesRef.current = 5;
    setFeedback(null);
    feedbackRef.current = null;
    setTimeout(() => speakEnglish(wordObj.audioText || wordObj.en, { persona: 'standard_us' }), 250);
  };

  // 卸載時還原全螢幕與停止語音
  useEffect(() => {
    return () => {
      if (floatTimerRef.current) clearTimeout(floatTimerRef.current);
      stopSpeech();
      exitFullscreen();
    };
  }, []);

  const handleBackToLobby = () => {
    stopSpeech();
    exitFullscreen();
    onBack();
  };

  const handleStart = () => {
    if (!queue || queue.length === 0) {
      if (words && words.length > 0) {
        loadWord(words[0]);
      }
      return;
    }
    setHasStarted(true);
    hasStartedRef.current = true;
    const now = Date.now();
    setStartTime(now);
    startTimeRef.current = now;
    enterFullscreen();
    loadWord(queue[0]);
  };

  // 自動直接開局（零二次彈窗）
  useEffect(() => {
    if (queue && queue.length > 0 && !hasStartedRef.current) {
      handleStart();
    }
  }, [queue?.length]);

  // 點擊字母自動填入第一個空格 (平板友善)
  const handleLetterClick = (letter) => {
    if (feedbackRef.current || letter.isPlaced) return;

    const nextEmptyIndex = slotsRef.current.findIndex(s => s === null);
    if (nextEmptyIndex === -1) return;

    const targetChar = cleanTargetRef.current[nextEmptyIndex];

    const isMatch = isAlphabetMode ? letter.char === targetChar : letter.char.toLowerCase() === targetChar.toLowerCase();
    if (isMatch) {
      processCorrect(letter, nextEmptyIndex);
    } else {
      processWrong(nextEmptyIndex);
    }
  };

  // 拖曳起始處理
  const handleDragStart = (e, letter) => {
    if (feedbackRef.current || letter.isPlaced) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', letter.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 拖曳置入槽位處理
  const handleDropOnSlot = (e, targetSlotIndex) => {
    e.preventDefault();
    if (feedbackRef.current) return;
    const letterId = e.dataTransfer.getData('text/plain');
    if (!letterId) return;

    const letterObj = lettersRef.current.find(l => l.id === letterId);
    if (!letterObj || letterObj.isPlaced) return;

    // 該槽位若已填入，不予重複覆蓋
    if (slotsRef.current[targetSlotIndex] !== null) return;

    const expectedChar = cleanTargetRef.current[targetSlotIndex];
    const isMatch = isAlphabetMode ? letterObj.char === expectedChar : letterObj.char.toLowerCase() === expectedChar.toLowerCase();
    if (isMatch) {
      processCorrect(letterObj, targetSlotIndex);
    } else {
      processWrong(targetSlotIndex);
    }
  };

  // 處理放置正確
  const processCorrect = (letterObj, slotIndex) => {
    soundEngine.blockSnap(slotIndex);
    soundEngine.hapticPulse('normal');

    const newSlots = [...slotsRef.current];
    newSlots[slotIndex] = letterObj;
    slotsRef.current = newSlots;
    setSlots(newSlots);

    const newLetters = lettersRef.current.map(l => (l.id === letterObj.id ? { ...l, isPlaced: true } : l));
    lettersRef.current = newLetters;
    setLetters(newLetters);

    // 全部填滿
    if (newSlots.every(slot => slot !== null)) {
      const nextStreak = streakRef.current + 1;
      streakRef.current = nextStreak;
      setStreak(nextStreak);

      const gain = 100 + Math.min((nextStreak - 1) * 20, 100);
      setVisualScore(v => v + gain);
      if (floatTimerRef.current) clearTimeout(floatTimerRef.current);
      setFloatingPts({ id: Date.now(), text: nextStreak >= 2 ? `+${gain} 🔥 x${nextStreak}` : `+${gain}` });
      floatTimerRef.current = setTimeout(() => setFloatingPts(null), 1200);

      setFeedback('correct');
      feedbackRef.current = 'correct';
      setStats(s => ({ ...s, correct: s.correct + 1 }));
      soundEngine.correct();
      if (nextStreak >= 2) soundEngine.combo(nextStreak);
      if (currentWordRef.current?.audioText || currentWordRef.current?.en) {
        const spokenText = currentWordRef.current.audioText || currentWordRef.current.en;
        setTimeout(() => speakEnglish(spokenText, { persona: 'standard_us' }), 140);
      }
      confetti({ particleCount: nextStreak >= 3 ? 70 : 50, spread: 65, origin: { y: 0.6 } });
      setTimeout(() => moveToNext(true), 1550);
    }
  };

  // 處理放置錯誤（嚴禁在 setState updater 內執行任何副作用）
  const processWrong = (slotIndex) => {
    soundEngine.wrong();
    soundEngine.hapticPulse('strong');
    if (currentWordRef.current?.id) {
      mistakeIdsRef.current.add(currentWordRef.current.id);
    }
    setShakingSlot(slotIndex);
    setTimeout(() => setShakingSlot(null), 500);

    const nextLives = Math.max(0, livesRef.current - 1);
    livesRef.current = nextLives;
    setLives(nextLives);

    if (nextLives <= 0) {
      streakRef.current = 0;
      setStreak(0);
      setFeedback('wrong');
      feedbackRef.current = 'wrong';
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
      setTimeout(() => moveToNext(false), 2200);
    }
  };

  // 支援鍵盤直接打字輸入 (Chromebook / 電腦無縫體驗)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!hasStartedRef.current || isFinishedRef.current || feedbackRef.current) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length !== 1) return;

      const pressedKey = isAlphabetModeRef.current
        ? (currentWordRef.current?.isUpper ? e.key.toUpperCase() : e.key.toLowerCase())
        : e.key.toLowerCase();
      if (!/[a-zA-Z]/.test(e.key)) return;

      const currentSlots = slotsRef.current;
      const nextEmptyIndex = currentSlots.findIndex(s => s === null);
      if (nextEmptyIndex === -1) return;

      const targetChar = cleanTargetRef.current[nextEmptyIndex];
      const isMatch = isAlphabetModeRef.current ? pressedKey === targetChar : pressedKey === targetChar.toLowerCase();

      if (isMatch) {
        const availableLetter = lettersRef.current.find(l => !l.isPlaced && l.char === pressedKey);
        if (availableLetter) {
          processCorrect(availableLetter, nextEmptyIndex);
        }
      } else {
        processWrong(nextEmptyIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const moveToNext = (wasCorrect) => {
    setFeedback(null);
    feedbackRef.current = null;
    const newQueue = [...queueRef.current];
    const curr = newQueue.shift();

    if (!wasCorrect) {
      newQueue.push(curr);
    }

    if (newQueue.length > 0) {
      setQueue(newQueue);
      queueRef.current = newQueue;
      loadWord(newQueue[0]);
    } else {
      // 挑戰完成！退出全螢幕回到正常視窗
      exitFullscreen();
      const finalSec = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
      setElapsedTime(finalSec);
      setIsFinished(true);
      isFinishedRef.current = true;
      soundEngine.win();
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
    }
  };

  if (isFinished) {
    const totalWords = initialCountRef.current || stats.correct;
    const mistakesCount = mistakeIdsRef.current.size;
    const firstAttemptPerfect = Math.max(0, totalWords - mistakesCount);

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fadeIn">
        <GlassCard className="max-w-md w-full text-center p-8">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-3 animate-bounce" />
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 font-heading mb-1">
            {t.spellingComplete}
          </h2>
          <p className="text-xs font-bold text-slate-500 mb-6">
            {t.spentTime}：<span className="text-rose-500 font-black text-lg">{elapsedTime} 秒</span>
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {firstAttemptPerfect} / {totalWords}
              </span>
              <p className="text-xs font-bold text-slate-500 mt-1">首次完美拼出 ({Math.round((firstAttemptPerfect / Math.max(1, totalWords)) * 100)}%)</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {mistakesCount > 0 ? `+${mistakesCount}` : '0'}
              </span>
              <p className="text-xs font-bold text-slate-500 mt-1">{mistakesCount > 0 ? '完成重測訂正' : '一次零失誤'}</p>
            </div>
          </div>

          {/* 榮譽榜破紀錄留名判定卡與獎狀領取 (僅傳入首答完美數，絕不灌水) */}
          <HonorSubmissionCard
            mode={isAlphabetMode ? 'spelling-abc' : 'spelling'}
            book={isAlphabetMode ? 'abc' : qualifyingBook}
            score={firstAttemptPerfect}
            correctCount={firstAttemptPerfect}
            time={elapsedTime}
            totalCount={totalWords}
            rangeText={isAlphabetMode ? 'Aa 字母連續序列拼裝' : (qualifyingBook ? `第 ${qualifyingBook} 冊` : (settings?.selectedUnits || []).slice(0, 3).join(', '))}
            reviewWords={Array.from(historyWordsRef.current.values()).map(w => ({
              ...w,
              isMistake: mistakeIdsRef.current.has(w.id)
            }))}
          />

          <Button3D variant="slate" size="lg" onClick={handleBackToLobby} className="w-full">
            {t.backLobby}
          </Button3D>
        </GlassCard>
      </div>
    );
  }

  const nextEmptyIndex = slots.findIndex(s => s === null);
  const completedWords = Math.max(0, (initialCountRef.current || queue.length) - queue.length);
  const totalWordsCount = Math.max(1, initialCountRef.current || queue.length);
  const SPELL_TILE_PALETTES = [
    'bg-sky-500 hover:bg-sky-400 border-sky-700',
    'bg-rose-500 hover:bg-rose-400 border-rose-700',
    'bg-emerald-500 hover:bg-emerald-400 border-emerald-700',
    'bg-amber-500 hover:bg-amber-400 border-amber-700',
    'bg-violet-500 hover:bg-violet-400 border-violet-700'
  ];

  // ─── 遊戲進行中 (星空書閣結晶工坊 • iPad 零捲動滿版全螢幕適配) ───
  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col items-center justify-between p-3 sm:p-5 max-h-[100dvh] h-[100dvh] overflow-hidden select-none animate-fadeIn">
      {/* 星空書閣背景層 */}
      <img
        src="/assets/lobby/theme_quiz.jpg"
        alt="Starlight Library"
        className="absolute inset-0 w-full h-full object-cover opacity-35 brightness-75 pointer-events-none select-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-indigo-950/60 to-slate-950/90 pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center h-full justify-between">
        {/* 頂部資訊列 */}
        <div className="w-full flex items-center justify-between gap-2 mb-1.5 flex-shrink-0">
          <Button3D variant="slate" size="sm" onClick={handleBackToLobby} icon={ArrowLeft}>
            {t.backLobby}
          </Button3D>

          {/* 愛心生命值 */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10">
            {[...Array(5)].map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                  i < lives
                    ? 'text-rose-500 fill-rose-500 animate-pulse'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          {/* 連擊火焰 + 局內分數 + 剩餘字數 */}
          <div className="flex items-center gap-1.5">
            {streak >= 2 && (
              <span
                key={`sp-combo-${streak}`}
                className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black flex items-center gap-1 shadow-md animate-balloon-pump"
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>x{streak}</span>
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-xl bg-slate-900/85 border border-amber-400/35 text-amber-300 text-xs font-mono font-black">
              {visualScore} pt
            </span>
            <span className="text-xs font-black text-slate-300 hidden xs:inline">
              剩 {queue.length} 字
            </span>
          </div>
        </div>

        {/* 進度條 */}
        <div className="w-full h-1.5 rounded-full bg-slate-800/90 overflow-hidden mb-2 flex-shrink-0">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.round((completedWords / totalWordsCount) * 100)}%` }}
          />
        </div>

        {currentWord && (
          <GlassCard className="w-full flex-1 min-h-0 flex flex-col justify-between text-center relative overflow-hidden p-4 sm:p-6 mb-1 border-2 border-sky-400/35 bg-slate-900/80 text-white">
            {/* 浮動加分動畫 */}
            {floatingPts && (
              <div
                key={floatingPts.id}
                className="pointer-events-none absolute top-4 right-5 z-30 text-lg sm:text-2xl font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(251,191,36,0.9)] animate-float-up-fade"
              >
                {floatingPts.text}
              </div>
            )}

            {/* 中文提示與朗讀按鈕 */}
            <div className="mb-2 sm:mb-3 flex flex-col items-center flex-shrink-0">
              <h2 className="text-2xl sm:text-4xl font-black text-white font-heading mb-1.5 drop-shadow">
                {currentWord.zh}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => speakEnglish(currentWord.audioText || currentWord.en, { persona: 'standard_us' })}
                  className="px-3 py-1.5 rounded-full bg-sky-500/25 hover:bg-sky-500/40 border border-sky-400/50 text-sky-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-black cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>聽發音</span>
                </button>
                <button
                  type="button"
                  onClick={() => speakEnglish(currentWord.audioText || currentWord.en, { persona: 'standard_us', rate: 0.78 })}
                  className="px-2.5 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-white/15 text-slate-300 text-xs font-black transition-all active:scale-95 cursor-pointer"
                >
                  🐢 慢速
                </button>
              </div>
            </div>

            {/* 單字目標槽位 (下一個空位呼吸高亮引導) */}
            <div className="flex flex-wrap justify-center items-center gap-x-5 sm:gap-x-8 gap-y-3 mb-3 sm:mb-5 min-h-[56px] sm:min-h-[64px]">
              {wordGroups.map((group, gIdx) => (
                <div key={gIdx} className="flex items-center gap-1.5 sm:gap-2.5">
                  {group.slots.map(({ slotIndex }) => {
                    const slot = slots[slotIndex];
                    const isShaking = shakingSlot === slotIndex;
                    const isNextTarget = !slot && slotIndex === nextEmptyIndex;
                    return (
                      <div
                        key={slotIndex}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => handleDropOnSlot(e, slotIndex)}
                        className={`
                          w-10 h-12 sm:w-14 sm:h-18 rounded-xl sm:rounded-2xl border-2 sm:border-4 flex items-center justify-center text-xl sm:text-3xl font-black ${isAlphabetMode ? '' : 'uppercase'} transition-all select-none
                          ${isShaking ? 'animate-shake border-rose-500 bg-rose-950/60 text-rose-200' : ''}
                          ${slot?.isGiven
                            ? 'bg-sky-600/80 border-sky-300/70 text-white shadow'
                            : slot
                            ? 'bg-emerald-500 border-emerald-300 text-white shadow-lg shadow-emerald-500/35 animate-pop'
                            : isNextTarget
                            ? 'bg-amber-500/15 border-amber-400 text-amber-300/60 ring-2 ring-amber-400/40 animate-pulse'
                            : 'bg-slate-800/80 border-dashed border-slate-600 text-transparent'}
                        `}
                      >
                        {slot ? slot.char : isNextTarget ? '•' : '?'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* 打散的字母寶石積木區 (支援點擊、拖曳與鍵盤打字) */}
            <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-950/70 border border-white/15 flex-shrink-0">
              <p className="text-[11px] sm:text-xs font-bold text-slate-400 mb-2">
                {t.tapLettersHint}
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {letters.map((letter, idx) => {
                  const palette = SPELL_TILE_PALETTES[idx % SPELL_TILE_PALETTES.length];
                  return (
                    <button
                      key={letter.id}
                      type="button"
                      draggable={!letter.isPlaced && feedback === null}
                      onDragStart={(e) => handleDragStart(e, letter)}
                      disabled={letter.isPlaced || feedback !== null}
                      onClick={() => handleLetterClick(letter)}
                      className={`
                        w-10 h-12 sm:w-14 sm:h-18 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl font-black ${isAlphabetMode ? '' : 'uppercase'} transition-all select-none
                        ${letter.isPlaced
                          ? 'opacity-0 scale-50 pointer-events-none'
                          : `btn-3d ${palette} text-white border-b-4 active:border-b-0 cursor-grab active:cursor-grabbing shadow-lg`}
                      `}
                    >
                      {letter.char}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 正確或失敗全屏回饋遮罩 */}
            {feedback && (
              <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md animate-fadeIn ${
                feedback === 'correct' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/95 text-white'
              }`}>
                {feedback === 'correct' ? (
                  <>
                    <CheckCircle2 className="w-14 h-14 mb-2 animate-bounce" />
                    <span className="text-2xl sm:text-3xl font-black font-heading">{t.correct}</span>
                  </>
                ) : (
                  <>
                    <HeartCrack className="w-14 h-14 mb-2 animate-pulse" />
                    <span className="text-xl sm:text-2xl font-black font-heading mb-1">{t.heartsDepleted}</span>
                    <p className="text-xl sm:text-2xl font-black underline mt-2">{currentWord.en}</p>
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
