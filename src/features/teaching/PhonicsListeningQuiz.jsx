import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  CheckCircle,
  HelpCircle,
  Trophy,
  Star,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  PartyPopper,
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../phonics/data/phonicsData';
import { PhonicsCardView } from '../phonics/components/PhonicsCardView';
import { speakWord, playCardSnapSound } from '../phonics/utils/audio';
import { soundEngine } from '../../services/audio';

const shuffleSeeded = (items, seedStr) => {
  const arr = [...items];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export function PhonicsListeningQuiz({
  allCards = [],
  selectedCardIds,
  curriculumUnit = null,
  lang = 'zh',
  onReturnToBoard,
}) {
  const [scopeMode, setScopeMode] = useState(curriculumUnit ? 'unit' : 'all'); // 'unit' | 'all'
  const [voiceMode, setVoiceMode] = useState('computer'); // 'computer' | 'teacher'
  const [showTeacherWord, setShowTeacherWord] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attemptRound, setAttemptRound] = useState(0);
  const [placedGraphemes, setPlacedGraphemes] = useState([]);
  const [answerStatus, setAnswerStatus] = useState('idle'); // 'idle' | 'correct' | 'wrong'
  const [hintMessage, setHintMessage] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const autoAdvanceTimerRef = useRef(null);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearAutoAdvance();
  }, [clearAutoAdvance]);

  // 切換單元時自動優先切回「本課進度題庫」並重設進度
  useEffect(() => {
    clearAutoAdvance();
    if (curriculumUnit && Array.isArray(curriculumUnit.drillWords) && curriculumUnit.drillWords.length > 0) {
      setScopeMode('unit');
    } else {
      setScopeMode('all');
    }
    setCurrentIndex(0);
    setStars(0);
    setStreak(0);
    setIsCompleted(false);
    setAnswerStatus('idle');
    setHintMessage(null);
  }, [curriculumUnit?.id, clearAutoAdvance, curriculumUnit]);

  const questionPool = useMemo(() => {
    if (scopeMode === 'unit' && curriculumUnit && Array.isArray(curriculumUnit.drillWords) && curriculumUnit.drillWords.length > 0) {
      return curriculumUnit.drillWords.map((d, idx) => ({
        id: `${curriculumUnit.id}_drill_${idx}_${d.word}`,
        word: d.word,
        phonemes: d.phonemes,
        distractors: d.distractors || [],
        meaningZh: d.meaningZh || '',
        meaningEn: d.word,
        emoji: d.emoji || '',
        categoryHint: d.isLetterDrill ? 'basic_consonants' : 'short_vowels',
        isLetterDrill: Boolean(d.isLetterDrill),
      }));
    }

    if (selectedCardIds && selectedCardIds.size >= 3) {
      const filtered = QUIZ_QUESTIONS.filter((q) =>
        q.phonemes.some((ph) => {
          const card = allCards.find((c) => c.grapheme === ph);
          return card && selectedCardIds.has(card.id);
        })
      );
      if (filtered.length >= 5) return filtered;
    }
    return QUIZ_QUESTIONS;
  }, [scopeMode, curriculumUnit, allCards, selectedCardIds]);

  const currentQ = questionPool[currentIndex];

  const graphemeToCardMap = useMemo(() => {
    const map = new Map();
    allCards.forEach((c) => {
      if (!map.has(c.grapheme)) {
        map.set(c.grapheme, c);
      }
    });
    return map;
  }, [allCards]);

  const optionsCards = useMemo(() => {
    if (!currentQ) return [];
    const pool = [...currentQ.phonemes, ...currentQ.distractors];
    const built = pool.map((grapheme, index) => {
      let card = graphemeToCardMap.get(grapheme);
      if (!card) {
        card = {
          id: `q_opt_${grapheme}_${index}`,
          grapheme,
          displayText: grapheme,
          category: currentQ.categoryHint || 'basic_consonants',
          phonemeSound: `/${grapheme}/`,
        };
      }
      return { ...card, uniqueOptId: `opt_${currentQ.id}_${index}_${grapheme}` };
    });
    return shuffleSeeded(built, `${currentQ.id}_${currentIndex}_${attemptRound}`);
  }, [currentQ, currentIndex, attemptRound, graphemeToCardMap]);

  const handlePlayPrompt = useCallback(async () => {
    if (!currentQ || isSpeaking || voiceMode === 'teacher') return;
    setIsSpeaking(true);
    try {
      await speakWord(currentQ.word, 0.82);
    } finally {
      setIsSpeaking(false);
    }
  }, [currentQ, isSpeaking, voiceMode]);

  useEffect(() => {
    clearAutoAdvance();
    if (!currentQ) return;
    setPlacedGraphemes(new Array(currentQ.phonemes.length).fill(null));
    setAnswerStatus('idle');
    setHintMessage(null);
    if (voiceMode === 'computer') {
      speakWord(currentQ.word, 0.82).catch(() => {});
    }
  }, [currentIndex, currentQ, voiceMode, clearAutoAdvance]);

  const handlePlaceCardIntoSlot = (grapheme, targetSlot) => {
    if (!currentQ || answerStatus === 'correct') return;
    playCardSnapSound();
    setAnswerStatus('idle');
    setHintMessage(null);

    const updated = [...placedGraphemes];
    if (typeof targetSlot === 'number') {
      updated[targetSlot] = grapheme;
    } else {
      const firstEmpty = updated.findIndex((item) => item === null);
      if (firstEmpty !== -1) {
        updated[firstEmpty] = grapheme;
      }
    }
    setPlacedGraphemes(updated);
  };

  const handleRemoveFromSlot = (slotIndex) => {
    if (answerStatus === 'correct') return;
    const updated = [...placedGraphemes];
    updated[slotIndex] = null;
    setPlacedGraphemes(updated);
    setAnswerStatus('idle');
    setHintMessage(null);
  };

  const handleCheckAnswer = async () => {
    if (!currentQ || placedGraphemes.includes(null)) return;

    const isCorrect = currentQ.phonemes.every(
      (expected, idx) => placedGraphemes[idx] === expected
    );

    if (isCorrect) {
      setAnswerStatus('correct');
      setStars((prev) => prev + 10);
      setStreak((prev) => prev + 1);
      soundEngine.correct();

      try {
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch {}

      if (voiceMode === 'computer') {
        await speakWord(currentQ.word, 0.88);
      }

      clearAutoAdvance();
      autoAdvanceTimerRef.current = setTimeout(() => {
        if (currentIndex < questionPool.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          soundEngine.win();
          setIsCompleted(true);
        }
      }, 1700);
    } else {
      setAnswerStatus('wrong');
      setStreak(0);
      soundEngine.wrong();

      const firstWrongIdx = currentQ.phonemes.findIndex(
        (expected, idx) => placedGraphemes[idx] !== expected
      );
      if (firstWrongIdx !== -1) {
        const ordinalEn = ['1st', '2nd', '3rd', '4th', '5th'][firstWrongIdx] || `${firstWrongIdx + 1}th`;
        const ordinalZh = ['第 1 個', '第 2 個', '第 3 個', '第 4 個', '第 5 個'][firstWrongIdx] || `第 ${firstWrongIdx + 1} 個`;
        setHintMessage(
          lang === 'zh'
            ? `提示：請仔細聽【${ordinalZh}音素】！注意分辨本課易混淆音。`
            : `Hint: Listen closely to the [${ordinalEn} sound]!`
        );
      }
    }
  };

  const handleNextQuestion = () => {
    clearAutoAdvance();
    if (currentIndex < questionPool.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      soundEngine.win();
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    clearAutoAdvance();
    setCurrentIndex(0);
    setStars(0);
    setStreak(0);
    setAttemptRound((prev) => prev + 1);
    setIsCompleted(false);
    setAnswerStatus('idle');
    setHintMessage(null);
  };

  if (!currentQ) return null;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between p-2 sm:p-5 max-w-4xl mx-auto">
      {/* Top Quiz Controls & Scoreboard */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 sm:px-4 py-2.5 shadow-xs mb-3">
        {/* Scope + Progress */}
        <div className="flex flex-wrap items-center gap-2">
          {curriculumUnit && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black">
              <button
                type="button"
                onClick={() => {
                  setScopeMode('unit');
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  scopeMode === 'unit'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? `本課 (${curriculumUnit.phonicsLabel})` : `Unit (${curriculumUnit.phonicsLabel})`}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setScopeMode('all');
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  scopeMode === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {lang === 'zh' ? '全課綱綜合' : 'All Phonics'}
              </button>
            </div>
          )}

          {/* Voice Source Toggle: 電腦唸 vs 老師口唸 */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black">
            <button
              type="button"
              onClick={() => setVoiceMode('computer')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                voiceMode === 'computer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? '電腦發音' : 'Audio'}</span>
            </button>
            <button
              type="button"
              onClick={() => setVoiceMode('teacher')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                voiceMode === 'teacher'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? '老師口唸' : 'Teacher Reads'}</span>
            </button>
          </div>
        </div>

        {/* Progress, Score & Streak */}
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300 font-mono">
            {currentIndex + 1} / {questionPool.length}
          </span>
          <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>{stars}</span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1 text-rose-500 font-black text-xs px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <Sparkles className="w-3 h-3" />
              <span>{streak}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Dictation Area */}
      <div className="w-full my-auto flex flex-col items-center justify-center space-y-4 sm:space-y-5">
        {voiceMode === 'computer' ? (
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handlePlayPrompt}
              disabled={isSpeaking}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-200 cursor-pointer ${
                isSpeaking
                  ? 'bg-indigo-700 scale-95 ring-8 ring-indigo-300/40 dark:ring-indigo-700/40 animate-pulse'
                  : 'bg-gradient-to-tr from-indigo-500 to-purple-600 hover:scale-105 active:scale-95'
              }`}
            >
              <Volume2 className="w-10 h-10 mb-0.5" />
              <span className="text-xs font-black tracking-wide">
                {isSpeaking ? (lang === 'zh' ? '播放中...' : 'Playing...') : (lang === 'zh' ? '再聽一次' : 'Listen')}
              </span>
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold">
              {currentQ.isLetterDrill
                ? (lang === 'zh' ? '請聽開頭單字音，選出對應字母卡！' : 'Listen and pick the matching letter card!')
                : (lang === 'zh' ? '聽發音後，從下方依序點選音素卡拼出單字！' : 'Listen and tap sound tiles in order!')}
            </p>
          </div>
        ) : (
          /* Teacher Reads Aloud Cue Card (Silent Auto-Speech) */
          <div className="w-full max-w-md rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 p-3.5 text-center shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>{lang === 'zh' ? '靜音出題（由老師親口唸給學生聽）' : 'Silent Mode — Teacher Reads Aloud'}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowTeacherWord((v) => !v)}
                className="px-2 py-0.5 rounded-lg bg-white/80 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 border border-amber-200 dark:border-amber-700 flex items-center gap-1 cursor-pointer"
              >
                {showTeacherWord ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showTeacherWord ? (lang === 'zh' ? '遮住拼字' : 'Hide') : (lang === 'zh' ? '顯示給老師看' : 'Show')}</span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{currentQ.emoji}</span>
              <div className="text-left">
                {showTeacherWord ? (
                  <p className="font-phonics text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                    {currentQ.word}
                  </p>
                ) : (
                  <p className="text-sm font-black text-slate-500 dark:text-slate-400">
                    {lang === 'zh' ? '（拼字已隱藏，請由老師唸出）' : '(Word hidden)'}
                  </p>
                )}
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  {currentQ.meaningZh}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Elkonin Question Slots */}
        <div
          className={`flex items-center justify-center gap-2.5 sm:gap-4 p-4 sm:p-5 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border-2 transition-all duration-300 ${
            answerStatus === 'correct'
              ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-4 ring-emerald-400/30'
              : answerStatus === 'wrong'
              ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 animate-shake'
              : 'border-slate-300 dark:border-slate-700'
          }`}
        >
          {currentQ.phonemes.map((_, slotIdx) => {
            const grapheme = placedGraphemes[slotIdx];
            const card = grapheme ? graphemeToCardMap.get(grapheme) : null;

            return (
              <div
                key={`slot_${slotIdx}`}
                onClick={() => grapheme && handleRemoveFromSlot(slotIdx)}
                className="relative cursor-pointer"
              >
                {grapheme && card ? (
                  <PhonicsCardView
                    card={card}
                    size="lg"
                    showRemove={answerStatus !== 'correct'}
                    onRemove={() => handleRemoveFromSlot(slotIdx)}
                    className={answerStatus === 'correct' ? 'border-emerald-500! ring-2 ring-emerald-400!' : ''}
                  />
                ) : (
                  <div className="w-[74px] h-[94px] sm:w-24 sm:h-28 rounded-2xl border-3 border-dashed border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/40 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 transition-colors">
                    <HelpCircle className="w-7 h-7 opacity-40 mb-1" />
                    <span className="text-[11px] font-bold text-slate-400">
                      {currentQ.isLetterDrill ? (lang === 'zh' ? '字母' : 'Letter') : `${lang === 'zh' ? '音素' : 'Sound'} ${slotIdx + 1}`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feedback */}
        {answerStatus === 'correct' && (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-base sm:text-lg animate-pop">
            <CheckCircle className="w-6 h-6" />
            <span>{lang === 'zh' ? `答對了！${currentQ.word} (${currentQ.meaningZh})` : `Great job! ${currentQ.word}`}</span>
            <span className="text-2xl">{currentQ.emoji}</span>
          </div>
        )}

        {answerStatus === 'wrong' && hintMessage && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold animate-pop">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{hintMessage}</span>
          </div>
        )}

        {/* Candidate Tiles */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm">
          <div className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5">
            {lang === 'zh' ? '點擊下方音素字卡填入空格：' : 'Tap sound tiles below to fill the slots:'}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {optionsCards.map((opt) => (
              <div key={opt.uniqueOptId}>
                <PhonicsCardView
                  card={opt}
                  size="md"
                  onClick={() => handlePlaceCardIntoSlot(opt.grapheme)}
                  className="hover:scale-106 active:scale-95"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="w-full flex items-center justify-between pt-3">
        <button
          type="button"
          onClick={() => {
            setPlacedGraphemes(new Array(currentQ.phonemes.length).fill(null));
            setAnswerStatus('idle');
            setHintMessage(null);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{lang === 'zh' ? '清空重填' : 'Reset'}</span>
        </button>

        {answerStatus === 'correct' ? (
          <button
            type="button"
            onClick={handleNextQuestion}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-colors cursor-pointer"
          >
            <span>{lang === 'zh' ? '下一題' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={placedGraphemes.includes(null)}
            onClick={handleCheckAnswer}
            className="flex items-center gap-2 px-8 py-2.5 sm:py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm sm:text-base shadow-md transition-colors cursor-pointer"
          >
            <span>{lang === 'zh' ? '送出檢查' : 'Check Answer'}</span>
            <CheckCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-pop">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center">
              <Trophy className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
                <PartyPopper className="w-6 h-6 text-amber-500" />
                <span>{lang === 'zh' ? '隨堂聽音小測完成！' : 'Listening Quiz Completed!'}</span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'zh' ? `共完成 ${questionPool.length} 題拼讀聽辨挑戰` : `Finished ${questionPool.length} questions`}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400 font-bold">{lang === 'zh' ? '獲得星星積分' : 'Stars Earned'}</span>
              <p className="text-3xl font-black text-amber-500 mt-0.5 inline-flex items-center justify-center gap-1.5 w-full">
                <span>{stars}</span>
                <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{lang === 'zh' ? '再測一次' : 'Play Again'}</span>
              </button>
              <button
                type="button"
                onClick={onReturnToBoard}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{lang === 'zh' ? '回拼讀白板' : 'Back to Board'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhonicsListeningQuiz;
