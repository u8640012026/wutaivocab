import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button3D } from '../../components/ui/Button3D';
import { useI18n } from '../../context/I18nContext';
import { soundEngine, speakEnglish, stopSpeech } from '../../services/audio';
import { HonorSubmissionCard } from '../../components/HonorSubmissionCard';
import {
  generateSentenceRound,
  formatTokensToSentence,
  matchSentenceTokens,
  parseSelectedSentenceScope
} from '../../data/sentencePatterns';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, Volume2, RotateCcw, CheckCircle2, Sparkles,
  Trophy, Lightbulb, Flame, Eraser, Zap, AlertCircle, Layers,
  Headphones, MessageSquare, Image as ImageIcon, Eye
} from 'lucide-react';

const TILE_PALETTES = [
  'bg-sky-500 hover:bg-sky-400 text-white border-b-4 border-sky-700 shadow-sky-900/30',
  'bg-emerald-500 hover:bg-emerald-400 text-white border-b-4 border-emerald-700 shadow-emerald-900/30',
  'bg-indigo-500 hover:bg-indigo-400 text-white border-b-4 border-indigo-700 shadow-indigo-900/30',
  'bg-rose-500 hover:bg-rose-400 text-white border-b-4 border-rose-700 shadow-rose-900/30',
  'bg-violet-500 hover:bg-violet-400 text-white border-b-4 border-violet-700 shadow-violet-900/30'
];

const PUNCT_STYLE =
  'bg-amber-400 hover:bg-amber-300 text-stone-950 border-b-4 border-amber-600 shadow-amber-900/30 font-black min-w-[44px]';

const readSavedSentenceLevel = () => {
  try {
    const saved = localStorage.getItem('wutai_sentence_level');
    return saved === 'lv3' || saved === 'lv2' ? saved : 'lv1';
  } catch (e) {
    return 'lv1';
  }
};

export const SentenceBuilderGame = ({
  settings,
  qualifyingBook,
  returnToTeaching = false,
  onBack
}) => {
  const { t } = useI18n();

  // 從 URL / localStorage / settings 解析初始範圍、低年級字母設定與難度（支援直達與重整）
  const [overrideUnits, setOverrideUnits] = useState(null);
  const [overrideAlphaGrade, setOverrideAlphaGrade] = useState(null);
  const [overrideAlphaMode, setOverrideAlphaMode] = useState(null);
  const [level, setLevel] = useState(() => {
    try {
      const urlLevel = new URLSearchParams(window.location.search).get('level');
      if (urlLevel === 'lv1' || urlLevel === 'lv2' || urlLevel === 'lv3') return urlLevel;
      return readSavedSentenceLevel();
    } catch (e) {
      return 'lv1';
    }
  });

  const effectiveUnits = useMemo(() => {
    if (Array.isArray(overrideUnits) && overrideUnits.length > 0) {
      return overrideUnits;
    }
    const sel = settings?.selectedUnits;
    if (Array.isArray(sel) && sel.length > 0) {
      return sel;
    }
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlUnits = (urlParams.get('units') || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (urlUnits.length > 0) return urlUnits;
      const urlBook = (urlParams.get('book') || '').toLowerCase();
      const urlGrade = parseInt(urlParams.get('grade') || '', 10);
      if (urlBook === 'abc') return ['abc'];
      if (urlBook) return [`${urlBook}-all`];
      if (urlGrade === 1 || urlGrade === 2) return ['abc'];
      if (urlParams.get('from') === 'teaching' && urlParams.get('tBook') === 'free') {
        return ['1-all', '2-all', '3-all', '4-all', '5-all', '6-all', '7-all', '8-all'];
      }

      const savedRaw = localStorage.getItem('wutai_sentence_units');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    if (qualifyingBook === 'abc' || settings?.alphaMode) return ['abc'];
    if (qualifyingBook) return [`${qualifyingBook}-all`];
    return ['1-all'];
  }, [overrideUnits, settings?.selectedUnits, settings?.alphaMode, qualifyingBook]);

  const effectiveAlphaGrade = useMemo(() => {
    if (overrideAlphaGrade === 1 || overrideAlphaGrade === 2) return overrideAlphaGrade;
    if (settings?.alphaGrade === 1 || settings?.alphaGrade === 2) return settings.alphaGrade;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const g = urlParams.get('alphaGrade') || urlParams.get('grade');
      if (g === '2') return 2;
      if (g === '1') return 1;
      const saved = localStorage.getItem('wutai_sentence_alpha_grade');
      if (saved === '2') return 2;
    } catch (e) {}
    return 1;
  }, [overrideAlphaGrade, settings?.alphaGrade]);

  const effectiveAlphaMode = useMemo(() => {
    if (['upper', 'lower', 'mixed'].includes(overrideAlphaMode)) return overrideAlphaMode;
    if (['upper', 'lower', 'mixed'].includes(settings?.alphaMode)) return settings.alphaMode;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const m = urlParams.get('alphaMode');
      if (['upper', 'lower', 'mixed'].includes(m)) return m;
      const saved = localStorage.getItem('wutai_sentence_alpha_mode');
      if (['upper', 'lower', 'mixed'].includes(saved)) return saved;
    } catch (e) {}
    return effectiveAlphaGrade === 2 ? 'lower' : 'upper';
  }, [overrideAlphaMode, settings?.alphaMode, effectiveAlphaGrade]);

  const syncSentenceUrl = useCallback((units, targetLevel, clearBook = false, alphaOpts = null, pushHistory = false) => {
    try {
      const parsedScope = parseSelectedSentenceScope(units);
      const isAlphaUnits = parsedScope.includeAbc && parsedScope.supportedBooks.length === 0;
      if (Array.isArray(units) && units.length > 0) {
        localStorage.setItem('wutai_sentence_units', JSON.stringify(units));
      }

      const params = new URLSearchParams(window.location.search);
      if (clearBook) {
        params.delete('book');
        params.delete('grade');
      }
      if (Array.isArray(units) && units.length > 0) {
        params.set('units', units.join(','));
      }

      if (isAlphaUnits) {
        const nextGrade = alphaOpts?.alphaGrade === 2 ? 2 : 1;
        const nextMode = ['upper', 'lower', 'mixed'].includes(alphaOpts?.alphaMode)
          ? alphaOpts.alphaMode
          : (nextGrade === 2 ? 'lower' : 'upper');
        localStorage.setItem('wutai_sentence_alpha_mode', nextMode);
        localStorage.setItem('wutai_sentence_alpha_grade', String(nextGrade));
        params.set('alphaMode', nextMode);
        params.set('alphaGrade', String(nextGrade));
        params.delete('level');
      } else {
        if (targetLevel === 'lv1' || targetLevel === 'lv2' || targetLevel === 'lv3') {
          localStorage.setItem('wutai_sentence_level', targetLevel);
          params.set('level', targetLevel);
        }
        params.delete('alphaMode');
        params.delete('alphaGrade');
      }

      const qs = params.toString();
      const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      const nextState = { ...(window.history.state || {}), view: 'sentence' };
      if (pushHistory) {
        window.history.pushState(nextState, '', nextUrl);
      } else {
        window.history.replaceState(nextState, '', nextUrl);
      }
    } catch (e) {}
  }, []);

  // 同頁瀏覽器上一頁／下一頁同步（清除臨時覆寫範圍並對齊 URL 難度）
  useEffect(() => {
    const onPopState = () => {
      try {
        setOverrideUnits(null);
        setOverrideAlphaGrade(null);
        setOverrideAlphaMode(null);
        const params = new URLSearchParams(window.location.search);
        const urlLevel = params.get('level');
        if (urlLevel === 'lv1' || urlLevel === 'lv2' || urlLevel === 'lv3') {
          setLevel(urlLevel);
        } else {
          const urlUnits = (params.get('units') || '').split(',').map(s => s.trim().toLowerCase());
          const urlBook = (params.get('book') || '').toLowerCase();
          if (!urlUnits.includes('abc') && urlBook !== 'abc') {
            setLevel(readSavedSentenceLevel());
          }
        }
      } catch (e) {}
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const scopeInfo = useMemo(
    () => parseSelectedSentenceScope(effectiveUnits, qualifyingBook),
    [effectiveUnits, qualifyingBook]
  );

  const isAlphabetMode = Boolean(scopeInfo.includeAbc && scopeInfo.supportedBooks.length === 0);

  // 若為三～六年級正式句型模式且網址尚未帶 ?level=，初載時即補寫進目前 history 條目，確保切換難度後按「上一頁」與初載完全一致
  useEffect(() => {
    try {
      if (isAlphabetMode || scopeInfo.supportedBooks.length === 0) return;
      const params = new URLSearchParams(window.location.search);
      const view = (params.get('view') || '').toLowerCase();
      if (view && view !== 'sentence') return;
      const urlLevel = params.get('level');
      if (urlLevel !== 'lv1' && urlLevel !== 'lv2' && urlLevel !== 'lv3') {
        params.set('level', level);
        const qs = params.toString();
        const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
        window.history.replaceState({ ...(window.history.state || {}), view: 'sentence' }, '', nextUrl);
      }
    } catch (e) {}
  }, [isAlphabetMode, scopeInfo.supportedBooks.length, level, effectiveUnits]);

  // 題組狀態
  const [roundResult, setRoundResult] = useState({ questions: [], availableCount: 0, emptyReason: null, skippedAbc: false, unsupportedBooks: [], unsupportedUnits: [] });
  const [qIndex, setQIndex] = useState(0);
  const [placedTiles, setPlacedTiles] = useState([]);
  const [chineseRevealed, setChineseRevealed] = useState(false);
  const [promptTranscriptRevealed, setPromptTranscriptRevealed] = useState(false);
  const [teachingColorMode, setTeachingColorMode] = useState(false);
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [wrongMsg, setWrongMsg] = useState('');
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [trayShake, setTrayShake] = useState(false);
  const [slotMarks, setSlotMarks] = useState([]); // 只在教學模式或兩次錯後手動提示時顯示
  const [draggedTileId, setDraggedTileId] = useState(null);

  // 局內聲光計分與首答正確數（兩者徹底分離！）
  const [visualScore, setVisualScore] = useState(0);
  const [floatingPts, setFloatingPts] = useState(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [firstAttemptCorrect, setFirstAttemptCorrect] = useState(0);
  const [matchedSentenceText, setMatchedSentenceText] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const startTimeRef = useRef(Date.now());
  const firstAttemptAttemptedRef = useRef(new Set());
  const mistakeIdsRef = useRef(new Set());
  const advanceTimerRef = useRef(null);
  const speechDelayTimerRef = useRef(null);
  const fallbackAdvanceTimerRef = useRef(null);
  const promptAudioTimerRef = useRef(null);
  const floatTimerRef = useRef(null);
  const advanceGenRef = useRef(0);
  const questionsLengthRef = useRef(0);
  const qIndexRef = useRef(0);
  qIndexRef.current = qIndex;
  const finishedSettledRef = useRef(false);

  const clearAdvanceTimers = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (speechDelayTimerRef.current) {
      clearTimeout(speechDelayTimerRef.current);
      speechDelayTimerRef.current = null;
    }
    if (fallbackAdvanceTimerRef.current) {
      clearTimeout(fallbackAdvanceTimerRef.current);
      fallbackAdvanceTimerRef.current = null;
    }
    if (promptAudioTimerRef.current) {
      clearTimeout(promptAudioTimerRef.current);
      promptAudioTimerRef.current = null;
    }
  }, []);

  // 嚴禁在 setState(prev => ...) updater 內執行音效／結算／彩帶等副作用
  const advanceAfterCorrect = useCallback((expectedGen) => {
    if (advanceGenRef.current !== expectedGen) return;
    advanceGenRef.current += 1;
    clearAdvanceTimers();
    const nextIdx = qIndexRef.current + 1;
    if (nextIdx < questionsLengthRef.current) {
      qIndexRef.current = nextIdx;
      setQIndex(nextIdx);
      return;
    }
    if (finishedSettledRef.current) return;
    finishedSettledRef.current = true;
    const sec = Math.max(5, Math.floor((Date.now() - startTimeRef.current) / 1000));
    setElapsedTime(sec);
    setIsFinished(true);
    soundEngine.win();
    try {
      confetti({ particleCount: 95, spread: 85, origin: { y: 0.5 } });
    } catch (e) {}
  }, [clearAdvanceTimers]);

  const scheduleAdvance = useCallback((expectedGen, delayMs) => {
    if (advanceGenRef.current !== expectedGen) return;
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      advanceAfterCorrect(expectedGen);
    }, delayMs);
  }, [advanceAfterCorrect]);

  const initRound = useCallback((units, targetLevel, targetAlphaMode, targetAlphaGrade) => {
    advanceGenRef.current += 1;
    clearAdvanceTimers();
    stopSpeech();

    const res = generateSentenceRound({
      selectedUnits: units,
      qualifyingBook,
      level: targetLevel,
      count: 10,
      alphaMode: targetAlphaMode,
      alphaGrade: targetAlphaGrade
    });
    questionsLengthRef.current = res.questions.length;
    qIndexRef.current = 0;
    finishedSettledRef.current = false;
    setRoundResult(res);
    setQIndex(0);
    setPlacedTiles([]);
    setMatchedSentenceText('');
    setChineseRevealed(false);
    setPromptTranscriptRevealed(false);
    setFeedback(null);
    setWrongMsg('');
    setWrongAttempts(0);
    setSlotMarks([]);
    setVisualScore(0);
    setStreak(0);
    setMaxStreak(0);
    setFirstAttemptCorrect(0);
    setIsFinished(false);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    firstAttemptAttemptedRef.current.clear();
    mistakeIdsRef.current.clear();
  }, [qualifyingBook, clearAdvanceTimers]);

  useEffect(() => {
    initRound(effectiveUnits, level, effectiveAlphaMode, effectiveAlphaGrade);
    return () => {
      advanceGenRef.current += 1;
      clearAdvanceTimers();
      if (floatTimerRef.current) clearTimeout(floatTimerRef.current);
      stopSpeech();
    };
  }, [effectiveUnits, level, effectiveAlphaMode, effectiveAlphaGrade, initRound, clearAdvanceTimers]);

  const questions = roundResult.questions;
  questionsLengthRef.current = questions.length;
  const currentQ = questions[qIndex] || null;
  const placedIdsSet = useMemo(() => new Set(placedTiles.map(t => t.tileId)), [placedTiles]);

  // 切換題目時重置當題操作狀態並停止前題語音
  useEffect(() => {
    stopSpeech();
    setPlacedTiles([]);
    setMatchedSentenceText('');
    setChineseRevealed(false);
    setPromptTranscriptRevealed(false);
    setFeedback(null);
    setWrongMsg('');
    setWrongAttempts(0);
    setSlotMarks([]);
  }, [qIndex]);

  // Lv.3 聽音題型（聽音組句／聽音答句）：切換新題時自動播放對應音訊（聽音答句只播問句絕不洩漏答案）
  useEffect(() => {
    if (promptAudioTimerRef.current) {
      clearTimeout(promptAudioTimerRef.current);
      promptAudioTimerRef.current = null;
    }
    if (isFinished || !currentQ) return;
    const pType = currentQ.promptType;
    if (pType !== 'listen_build' && pType !== 'listen_qa') return;

    const textToPlay = pType === 'listen_qa'
      ? currentQ.promptAudioText
      : (currentQ.audioText || currentQ.en);
    if (!textToPlay) return;

    promptAudioTimerRef.current = setTimeout(() => {
      speakEnglish(textToPlay, { persona: 'standard_us' });
    }, 280);

    return () => {
      if (promptAudioTimerRef.current) {
        clearTimeout(promptAudioTimerRef.current);
        promptAudioTimerRef.current = null;
      }
    };
  }, [currentQ, isFinished]);

  const triggerFloatingPts = (text) => {
    if (floatTimerRef.current) clearTimeout(floatTimerRef.current);
    setFloatingPts({ id: Date.now(), text });
    floatTimerRef.current = setTimeout(() => setFloatingPts(null), 1300);
  };

  // 點選待選區積木 ➔ 飛入答案槽
  const handlePickTile = useCallback((tile) => {
    if (!currentQ || feedback === 'correct') return;
    if (placedIdsSet.has(tile.tileId)) return;

    const nextIndex = placedTiles.length;
    soundEngine.blockSnap(nextIndex);
    soundEngine.hapticPulse('normal');

    setPlacedTiles(prev => [...prev, tile]);
    setFeedback(null);
    setWrongMsg('');
    setSlotMarks([]);
  }, [currentQ, feedback, placedIdsSet, placedTiles.length]);

  // 點選答案槽積木 ➔ 退回待選區
  const handleRemoveTile = useCallback((tileId) => {
    if (feedback === 'correct') return;
    soundEngine.blockPop();
    setPlacedTiles(prev => prev.filter(t => t.tileId !== tileId));
    setFeedback(null);
    setWrongMsg('');
    setSlotMarks([]);
  }, [feedback]);

  // 清空答案槽重排
  const handleClearPlaced = useCallback(() => {
    if (feedback === 'correct' || placedTiles.length === 0) return;
    soundEngine.blockPop();
    setPlacedTiles([]);
    setFeedback(null);
    setWrongMsg('');
    setSlotMarks([]);
  }, [feedback, placedTiles.length]);

  // 拖曳放進答案槽或槽內換位排序
  const handleDropOnSlot = (targetSlotIndex) => {
    if (!draggedTileId || feedback === 'correct' || !currentQ) return;
    const fromPlacedIdx = placedTiles.findIndex(t => t.tileId === draggedTileId);

    if (fromPlacedIdx !== -1) {
      if (fromPlacedIdx === targetSlotIndex) return;
      const next = [...placedTiles];
      const [moved] = next.splice(fromPlacedIdx, 1);
      next.splice(targetSlotIndex, 0, moved);
      setPlacedTiles(next);
      soundEngine.blockSnap(targetSlotIndex);
    } else {
      const bankTile = currentQ.bankTiles.find(t => t.tileId === draggedTileId);
      if (!bankTile) return;
      const next = [...placedTiles];
      next.splice(targetSlotIndex, 0, bankTile);
      setPlacedTiles(next);
      soundEngine.blockSnap(targetSlotIndex);
    }
    setDraggedTileId(null);
    setFeedback(null);
    setWrongMsg('');
    setSlotMarks([]);
  };

  const handleDropOnTrayEnd = () => {
    if (!draggedTileId || feedback === 'correct' || !currentQ) return;
    const fromPlacedIdx = placedTiles.findIndex(t => t.tileId === draggedTileId);
    if (fromPlacedIdx !== -1) {
      const next = [...placedTiles];
      const [moved] = next.splice(fromPlacedIdx, 1);
      next.push(moved);
      setPlacedTiles(next);
      soundEngine.blockSnap(next.length - 1);
    } else {
      const bankTile = currentQ.bankTiles.find(t => t.tileId === draggedTileId);
      if (bankTile) handlePickTile(bankTile);
    }
    setDraggedTileId(null);
  };

  // 整句／字母送出驗證（絕不放一格就透漏對錯，避免逐格試錯作弊；聽力題強制依原音訊語序）
  const handleVerify = useCallback(() => {
    if (!currentQ || feedback === 'correct' || placedTiles.length === 0) return;

    const placedTexts = placedTiles.map(tile => tile.text);
    const allowVariants = !currentQ.isListeningTask && !currentQ.strictOrder;
    const matchedTokens = matchSentenceTokens(placedTexts, currentQ, { allowVariants });

    const hadPriorMistake = firstAttemptAttemptedRef.current.has(currentQ.id);

    if (matchedTokens) {
      if (!hadPriorMistake) {
        firstAttemptAttemptedRef.current.add(currentQ.id);
        setFirstAttemptCorrect(c => c + 1);
      }

      const spokenText = currentQ.isAlphabetSequence
        ? (currentQ.audioText || matchedTokens.join(', '))
        : (formatTokensToSentence(matchedTokens) || currentQ.en);
      const displaySuccessText = currentQ.isAlphabetSequence
        ? matchedTokens.join(' → ')
        : spokenText;

      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setMaxStreak(m => Math.max(m, nextStreak));
      const gain = 100 + Math.min((nextStreak - 1) * 25, 100);
      setVisualScore(s => s + gain);
      triggerFloatingPts(nextStreak >= 2 ? `+${gain} 🔥 x${nextStreak}` : `+${gain}`);

      setMatchedSentenceText(displaySuccessText);
      setFeedback('correct');
      setChineseRevealed(true);
      setSlotMarks(placedTiles.map(() => 'ok'));

      soundEngine.correct();
      if (nextStreak >= 2) soundEngine.combo(nextStreak);
      soundEngine.hapticPulse('normal');
      try {
        confetti({ particleCount: nextStreak >= 3 ? 65 : 35, spread: 60, origin: { y: 0.65 } });
      } catch (e) {}

      // 完整朗讀句子／字母後再跳題，確保句尾不被截斷；若瀏覽器無語音或逾時亦設最高保底時限避免卡死
      const expectedGen = ++advanceGenRef.current;
      clearAdvanceTimers();
      const maxFallbackMs = Math.min(7500, Math.max(3200, spokenText.length * 140 + 1800));
      fallbackAdvanceTimerRef.current = setTimeout(() => {
        advanceAfterCorrect(expectedGen);
      }, maxFallbackMs);

      speechDelayTimerRef.current = setTimeout(() => {
        if (advanceGenRef.current !== expectedGen) return;
        speakEnglish(spokenText, {
          persona: 'standard_us',
          ...(currentQ.isAlphabetSequence ? { rate: 0.88 } : {}),
          onStart: () => {
            if (advanceGenRef.current !== expectedGen) return;
            // 語音已開始播放時，取消先前的過早逾時跳題計時，等整句念完再推進
            if (advanceTimerRef.current) {
              clearTimeout(advanceTimerRef.current);
              advanceTimerRef.current = null;
            }
          },
          onEnd: (info) => {
            if (advanceGenRef.current !== expectedGen) return;
            if (info?.completed === true) {
              scheduleAdvance(expectedGen, 600);
            } else if (info?.reason === 'timeout') {
              scheduleAdvance(expectedGen, 900);
            } else if (info?.reason !== 'cancelled') {
              scheduleAdvance(expectedGen, 1400);
            }
          }
        });
      }, 200);
    } else {
      firstAttemptAttemptedRef.current.add(currentQ.id);
      mistakeIdsRef.current.add(currentQ.id);
      setStreak(0);
      setWrongAttempts(w => w + 1);
      setFeedback('wrong');
      setTrayShake(true);
      setTimeout(() => setTrayShake(false), 500);

      soundEngine.wrong();
      soundEngine.hapticPulse('strong');

      const swappedVariantHit =
        (currentQ.isListeningTask || currentQ.strictOrder) &&
        Array.isArray(currentQ.acceptedVariants) &&
        currentQ.acceptedVariants.some(
          (v) =>
            Array.isArray(v) &&
            placedTexts.length === v.length &&
            placedTexts.every((tok, idx) => tok === v[idx])
        );

      if (placedTiles.length !== currentQ.targetCount) {
        setWrongMsg(
          currentQ.isAlphabetSequence
            ? `字母數量不對喔！這題一共要排 ${currentQ.targetCount} 個字母。`
            : `積木數量不對喔！這句一共需要 ${currentQ.targetCount} 個積木（含標點）。`
        );
      } else if (swappedVariantHit) {
        setWrongMsg('文法雖然通順，但這題是聽力題喔！請完全按照剛剛聽到的先後順序排列！');
      } else if (currentQ.isAlphabetSequence) {
        setWrongMsg('字母順序還差一點點，照著 A → Z 唸一遍再排看看！');
      } else {
        setWrongMsg('語序或字卡還差一點點，調整看看再送出一次！');
      }

      // 僅在「教學標色模式」下於送出後標出對錯格（預設關閉以防試錯）
      if (teachingColorMode) {
        setSlotMarks(
          placedTiles.map((tile, idx) => (tile.text === currentQ.tokens[idx] ? 'ok' : 'err'))
        );
      }
    }
  }, [currentQ, feedback, placedTiles, streak, teachingColorMode, clearAdvanceTimers, advanceAfterCorrect, scheduleAdvance]);

  // 連錯 2 次後的貼心首個錯處提示
  const handleHintNextError = () => {
    if (!currentQ || feedback === 'correct') return;
    soundEngine.hintPing();
    const marks = placedTiles.map((tile, idx) => (tile.text === currentQ.tokens[idx] ? 'ok' : 'err'));
    setSlotMarks(marks);
    const firstMismatchIdx = currentQ.tokens.findIndex((tok, idx) => placedTiles[idx]?.text !== tok);
    if (firstMismatchIdx !== -1) {
      setWrongMsg(`💡 小提示：第 ${firstMismatchIdx + 1} 個位置應該是「${currentQ.tokens[firstMismatchIdx]}」喔！`);
    }
  };

  // 鍵盤支援（Enter 送出 / Backspace 退回最後一塊）
  useEffect(() => {
    const onKeyDown = (e) => {
      if (isFinished || !currentQ || feedback === 'correct') return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'Enter' && placedTiles.length > 0) {
        e.preventDefault();
        handleVerify();
      } else if (e.key === 'Backspace' && placedTiles.length > 0) {
        e.preventDefault();
        handleRemoveTile(placedTiles[placedTiles.length - 1].tileId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFinished, currentQ, feedback, placedTiles, handleVerify, handleRemoveTile]);

  const handleExit = () => {
    advanceGenRef.current += 1;
    clearAdvanceTimers();
    stopSpeech();
    soundEngine.click();
    onBack();
  };

  // ── 邊界保護畫面：無題可出 / 未收錄冊別 ──
  if (roundResult.emptyReason) {
    const isUpcoming = roundResult.emptyReason === 'upcoming_book';
    return (
      <div
        data-sentence-scope={effectiveUnits.join(',')}
        data-sentence-level={isAlphabetMode ? 'alpha' : level}
        data-alpha-grade={isAlphabetMode ? String(effectiveAlphaGrade) : ''}
        data-alpha-mode={isAlphabetMode ? effectiveAlphaMode : ''}
        className="fixed inset-0 z-40 bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none"
      >
        <img
          src="/assets/lobby/theme_quiz.jpg"
          alt="Starlight Library"
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
        />
        <GlassCard className="relative z-10 max-w-lg w-full p-6 sm:p-8 text-center border-2 border-sky-400/50 bg-slate-900/90 text-white">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black font-heading mb-2 text-sky-200">
            {isUpcoming ? '🚧 此冊別尚未收錄至句型庫' : '尚未選擇可練習的單元範圍'}
          </h2>
          <p className="text-sm font-bold text-slate-300 mb-6 leading-relaxed">
            {isUpcoming
              ? `您目前選擇的「${roundResult.unsupportedBooks.map(b => `第 ${b} 冊`).join('、')}」尚未收錄句型庫！目前已完整收錄「第 1～8 冊全單元（含 Lv.1～Lv.3）」與「低年級 3／5 字母順序」。`
              : roundResult.unsupportedUnits?.length > 0
              ? `您目前選擇的單元「${roundResult.unsupportedUnits.join('、')}」目前沒有對應句型題庫，請一鍵切換至已開放範圍試玩！`
              : '目前選取範圍內沒有可組句的題目，請一鍵切換至已開放範圍試玩！'}
          </p>
          <div className="flex flex-col gap-2.5">
            <Button3D
              variant="blue"
              size="lg"
              onClick={() => {
                soundEngine.click();
                setOverrideAlphaGrade(null);
                setOverrideAlphaMode(null);
                setOverrideUnits(['1-all']);
                syncSentenceUrl(['1-all'], level, true, null, true);
              }}
            >
              🚀 一鍵體驗第 1 冊全單元句型
            </Button3D>
            <Button3D
              variant="emerald"
              size="md"
              onClick={() => {
                soundEngine.click();
                setOverrideAlphaGrade(1);
                setOverrideAlphaMode('upper');
                setOverrideUnits(['abc']);
                syncSentenceUrl(['abc'], level, true, { alphaMode: 'upper', alphaGrade: 1 }, true);
              }}
            >
              🐣 一鍵體驗一年級 3 字母排序
            </Button3D>
            <Button3D variant="slate" size="md" onClick={handleExit} icon={ArrowLeft}>
              {returnToTeaching ? '回霧臺英語教學館' : t.backLobby}
            </Button3D>
          </div>
        </GlassCard>
      </div>
    );
  }

  // ── 結算畫面 ──
  if (isFinished) {
    const totalCount = questions.length;
    const accuracyPct = totalCount > 0 ? Math.round((firstAttemptCorrect / totalCount) * 100) : 0;
    const supportedList = scopeInfo.supportedBooks || [];
    const onlyBook = supportedList.length === 1 ? supportedList[0] : null;
    const hasUnsupportedSelection =
      (roundResult.unsupportedBooks?.length || 0) > 0 ||
      (roundResult.unsupportedUnits?.length || 0) > 0;
    const isQualifyingSentenceBook = isAlphabetMode
      ? true
      : Boolean(
          onlyBook &&
          !hasUnsupportedSelection &&
          ((scopeInfo.bookUnitsMap?.[onlyBook]?.size || 0) >= 2 || qualifyingBook === onlyBook)
        );
    const effectiveBook = isAlphabetMode
      ? 'abc'
      : (isQualifyingSentenceBook ? onlyBook : null);
    const bookDesc = supportedList.length > 0 ? `第 ${supportedList.join('、')} 冊` : '自選範圍';
    const levelDesc = level === 'lv3' ? 'Lv.3 情境挑戰' : level === 'lv2' ? 'Lv.2 干擾陷阱' : 'Lv.1 基礎重組';
    const rangeLabel = isAlphabetMode
      ? (effectiveAlphaGrade === 2 ? '二年級連續 5 字母順序挑戰' : '一年級連續 3 字母順序挑戰')
      : `${bookDesc}句型挑戰 (${levelDesc})`;

    return (
      <div
        data-sentence-scope={effectiveUnits.join(',')}
        data-sentence-level={isAlphabetMode ? 'alpha' : level}
        data-alpha-grade={isAlphabetMode ? String(effectiveAlphaGrade) : ''}
        data-alpha-mode={isAlphabetMode ? effectiveAlphaMode : ''}
        className="fixed inset-0 z-40 bg-slate-950 overflow-y-auto p-3 sm:p-6 animate-fadeIn"
      >
        <img
          src="/assets/lobby/theme_quiz.jpg"
          alt="Starlight Library"
          className="fixed inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
        />
        <div className="relative z-10 max-w-2xl mx-auto my-4">
          <GlassCard className="text-center p-5 sm:p-8 border-2 border-sky-400/50 bg-slate-900/90 text-white">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-2 animate-bounce" />
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-amber-200 mb-1">
              ✨ {isAlphabetMode ? '字母積木試煉完成！' : '句型積木試煉完成！'}
            </h2>
            <p className="text-xs font-bold text-slate-300 mb-5">
              耗時 <span className="text-sky-300 font-black text-base">{elapsedTime} 秒</span>
              {' '}• 局內積分 <span className="text-amber-300 font-black">{visualScore}</span>
              {' '}• 最高連擊 <span className="text-rose-300 font-black">x{maxStreak}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40">
                <span className="text-2xl sm:text-3xl font-black text-emerald-300">
                  {firstAttemptCorrect} / {totalCount}
                </span>
                <p className="text-xs font-bold text-slate-300 mt-1">
                  首次一次{isAlphabetMode ? '排對' : '組對'} ({accuracyPct}%)
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/40">
                <span className="text-2xl sm:text-3xl font-black text-amber-300">
                  {mistakeIdsRef.current.size > 0 ? `${mistakeIdsRef.current.size} 題訂正` : '一次全對!'}
                </span>
                <p className="text-xs font-bold text-slate-300 mt-1">
                  {mistakeIdsRef.current.size > 0 ? '已完成順序修正' : '零失誤完美過關'}
                </p>
              </div>
            </div>

            {/* 單冊含 2 單元以上或低年級 abc 即具正式英雄榜與八冊秘典資格；單單元／跨冊則自動進入自主練習保護 */}
            <HonorSubmissionCard
              mode={isAlphabetMode ? 'sentence-abc' : 'sentence'}
              book={effectiveBook}
              score={firstAttemptCorrect}
              correctCount={firstAttemptCorrect}
              practiceOnly={false}
              time={elapsedTime}
              totalCount={totalCount}
              rangeText={rangeLabel}
              reviewWords={questions.map(q => ({
                id: q.id,
                en: q.isAlphabetSequence ? q.tokens.join(' → ') : q.en,
                zh: q.zh,
                isMistake: mistakeIdsRef.current.has(q.id)
              }))}
            />

            {/* 句型／字母回顧發音清單 */}
            <div className="text-left max-h-48 overflow-y-auto space-y-1.5 mb-5 pr-1">
              {questions.map((q) => {
                const isMistake = mistakeIdsRef.current.has(q.id);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => speakEnglish(q.audioText || q.en, { persona: 'standard_us', ...(q.isAlphabetSequence ? { rate: 0.88 } : {}) })}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-2 text-left transition-all cursor-pointer ${
                      isMistake
                        ? 'bg-rose-950/40 border-rose-500/40 hover:bg-rose-950/60'
                        : 'bg-slate-800/70 border-white/10 hover:border-sky-400/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white truncate">
                        {q.isAlphabetSequence ? q.tokens.join(' → ') : q.en}
                      </p>
                      <p className="text-[11px] font-bold text-slate-400 truncate">{q.zh}</p>
                    </div>
                    <Volume2 className="w-4 h-4 text-sky-400 shrink-0" />
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button3D
                variant="blue"
                size="md"
                onClick={() => {
                  soundEngine.click();
                  initRound(effectiveUnits, level, effectiveAlphaMode, effectiveAlphaGrade);
                }}
                icon={RotateCcw}
              >
                再練一輪
              </Button3D>
              <Button3D variant="slate" size="md" onClick={handleExit} icon={ArrowLeft}>
                {returnToTeaching ? '回霧臺英語教學館' : t.backLobby}
              </Button3D>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ── 遊戲進行中：星空書閣句型魔方舞台 (iPad 零捲動單頁適配) ──
  const modeBadge = isAlphabetMode
    ? {
        cls: 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40',
        label: `🔤 ${effectiveAlphaGrade === 2 ? '二年級 5 字母' : '一年級 3 字母'} • ${
          effectiveAlphaMode === 'upper' ? '全大寫' : effectiveAlphaMode === 'lower' ? '全小寫' : '大／小輪流'
        }`
      }
    : level === 'lv3'
    ? { cls: 'bg-violet-500/25 text-violet-300 border border-violet-400/40', label: '🧠 Lv.3 情境挑戰' }
    : level === 'lv2'
    ? { cls: 'bg-rose-500/25 text-rose-300 border border-rose-400/40', label: '🔥 Lv.2 干擾陷阱' }
    : { cls: 'bg-sky-500/25 text-sky-300 border border-sky-400/40', label: '⭐ Lv.1 基礎重組' };

  const promptType = currentQ?.promptType || (isAlphabetMode ? 'alphabet_order' : 'standard');

  return (
    <div
      data-sentence-scope={effectiveUnits.join(',')}
      data-sentence-level={isAlphabetMode ? 'alpha' : level}
      data-alpha-grade={isAlphabetMode ? String(effectiveAlphaGrade) : ''}
      data-alpha-mode={isAlphabetMode ? effectiveAlphaMode : ''}
      data-prompt-type={promptType}
      className="fixed inset-0 z-40 h-[100dvh] w-full bg-slate-950 flex flex-col justify-between p-2.5 sm:p-4 overflow-hidden select-none animate-fadeIn"
    >
      {/* 星空書閣背景層 */}
      <img
        src="/assets/lobby/theme_quiz.jpg"
        alt="Starlight Library"
        className="absolute inset-0 w-full h-full object-cover opacity-35 brightness-75 pointer-events-none select-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-indigo-950/60 to-slate-950/90 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl mx-auto h-full flex flex-col justify-between gap-2">
        {/* ── 頂部 HUD 導航列 ── */}
        <header className="flex items-center justify-between gap-2 shrink-0">
          <Button3D
            variant="slate"
            size="sm"
            onClick={handleExit}
            icon={ArrowLeft}
            title={returnToTeaching ? '返回霧臺英語教學館' : t.backLobby}
          >
            <span className={returnToTeaching ? 'hidden sm:inline' : 'hidden xs:inline'}>
              {returnToTeaching ? '回教學館' : t.backLobby}
            </span>
          </Button3D>

          {/* 中央進度星點列與難度／年級徽章 */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-slate-900/85 border border-sky-400/35 backdrop-blur-md">
            <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black ${modeBadge.cls}`}>
              {modeBadge.label}
            </span>
            <div className="hidden sm:flex items-center gap-1">
              {questions.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx < qIndex
                      ? 'w-2 bg-emerald-400'
                      : idx === qIndex
                      ? 'w-5 bg-amber-400 animate-pulse'
                      : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-mono font-black text-slate-200">
              {qIndex + 1}/{questions.length}
            </span>
          </div>

          {/* 右側分數與連擊火焰 */}
          <div className="flex items-center gap-1.5 shrink-0">
            {streak >= 2 && (
              <div
                key={`combo-${streak}`}
                className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black flex items-center gap-1 shadow-lg animate-balloon-pump"
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>x{streak}</span>
              </div>
            )}
            <div className="px-2.5 py-1 rounded-xl bg-slate-900/85 border border-amber-400/35 text-amber-300 text-xs font-mono font-black">
              {visualScore} pt
            </div>
          </div>
        </header>

        {/* ── 中央核心鑄造舞台 ── */}
        {currentQ && (
          <GlassCard className="relative flex-1 min-h-0 flex flex-col justify-between p-3 sm:p-5 border-2 border-sky-400/40 bg-slate-900/80 text-white overflow-hidden">
            {/* 浮動加分特效 */}
            {floatingPts && (
              <div
                key={floatingPts.id}
                className="pointer-events-none absolute top-4 right-6 z-30 text-lg sm:text-2xl font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(251,191,36,0.9)] animate-float-up-fade"
              >
                {floatingPts.text}
              </div>
            )}

            {/* 1. 題幹提示區（低年級純字母 / 課本基礎 / Lv.3 四合一情境挑戰） */}
            <div className="flex flex-col items-center text-center gap-2 shrink-0">
              <div className="w-full flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-500/20 text-sky-300 border border-sky-400/40">
                    {currentQ.unitTag}
                  </span>
                  {currentQ.isCrossUnit && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40">
                      ✨ 跨單元滾雪球挑戰
                    </span>
                  )}
                  {roundResult.unsupportedBooks?.length > 0 && (
                    <span
                      data-partial-unsupported-notice="true"
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-200 border border-amber-400/40"
                      title="選取範圍內含尚未收錄之冊別，已自動略過僅出已支援冊別題目"
                    >
                      ⚠️ 已略過未收錄：{roundResult.unsupportedBooks.map(b => `第 ${b} 冊`).join('、')}
                    </span>
                  )}
                  {roundResult.unsupportedUnits?.length > 0 && (
                    <span
                      data-partial-unsupported-units-notice="true"
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-200 border border-amber-400/40"
                      title="選取範圍內含無對應題庫之單元代碼，已自動略過"
                    >
                      ⚠️ 已略過無對應單元：{roundResult.unsupportedUnits.join('、')}
                    </span>
                  )}
                  {roundResult.skippedAbc && (
                    <span
                      data-partial-skipped-abc-notice="true"
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-200 border border-amber-400/40"
                      title="字母序列與課本句型分開進行，本次已優先採用課本句型範圍"
                    >
                      ⚠️ 字母與課本分開練習，已略過字母範圍
                    </span>
                  )}
                  {promptType === 'dialogue' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-violet-500/25 text-violet-200 border border-violet-400/40 inline-flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>💬 對話接龍</span>
                    </span>
                  )}
                  {promptType === 'listen_build' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 inline-flex items-center gap-1">
                      <Headphones className="w-3.5 h-3.5" />
                      <span>🎧 聽音組句（嚴格順序）</span>
                    </span>
                  )}
                  {promptType === 'listen_qa' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-500/25 text-indigo-200 border border-indigo-400/40 inline-flex items-center gap-1">
                      <Headphones className="w-3.5 h-3.5" />
                      <span>🗣️ 聽音答句（嚴格順序）</span>
                    </span>
                  )}
                  {promptType === 'picture' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 inline-flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>🖼️ 看圖組句</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.click();
                      setTeachingColorMode(v => !v);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                      teachingColorMode
                        ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50'
                        : 'bg-slate-800/80 text-slate-400 border-white/10 hover:text-slate-200'
                    }`}
                    title="開啟後送出時會標示個別格子正誤（適合練習檢討）"
                  >
                    🎓 練習標色：{teachingColorMode ? '開' : '關'}
                  </button>
                  {!isAlphabetMode && (
                    <div className="flex items-center gap-1" data-sentence-level-switcher="true">
                      {[
                        { id: 'lv1', label: 'Lv.1 基礎', activeCls: 'bg-sky-500 text-white border-sky-300' },
                        { id: 'lv2', label: 'Lv.2 陷阱', activeCls: 'bg-rose-500 text-white border-rose-300' },
                        { id: 'lv3', label: 'Lv.3 情境', activeCls: 'bg-violet-500 text-white border-violet-300' }
                      ].map((lvOpt) => (
                        <button
                          key={lvOpt.id}
                          type="button"
                          onClick={() => {
                            soundEngine.click();
                            if (lvOpt.id === level) return;
                            setLevel(lvOpt.id);
                            syncSentenceUrl(effectiveUnits, lvOpt.id, false, null, true);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                            level === lvOpt.id
                              ? `${lvOpt.activeCls} shadow-sm`
                              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-white/15'
                          }`}
                        >
                          {lvOpt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 依題型呈現題幹內容 */}
              {currentQ.isAlphabetSequence ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 my-1">
                  <h2 className="text-lg sm:text-2xl font-black font-heading text-white drop-shadow">
                    {currentQ.zh}
                  </h2>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => speakEnglish(currentQ.audioText, { persona: 'standard_us', rate: 0.88 })}
                      className="px-3 py-1.5 rounded-full bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-400/50 text-emerald-200 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>聽字母音</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => speakEnglish(currentQ.audioText, { persona: 'standard_us', rate: 0.72 })}
                      className="px-2.5 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-white/15 text-slate-300 text-xs font-black transition-all active:scale-95 cursor-pointer"
                    >
                      🐢 慢速
                    </button>
                  </div>
                </div>
              ) : promptType === 'dialogue' ? (
                <div className="w-full max-w-2xl flex flex-col items-center gap-1.5 my-0.5">
                  <div className="w-full px-3.5 py-2.5 rounded-2xl bg-violet-950/55 border border-violet-400/40 flex flex-wrap items-center justify-between gap-2 text-left">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-black text-violet-300 block">
                        {currentQ.dialogueRole === 'infer_question'
                          ? `對方 (${currentQ.dialogueSpeaker}) 回答說：`
                          : `對方 (${currentQ.dialogueSpeaker}) 說：`}
                      </span>
                      <p className="text-lg sm:text-xl font-black text-white leading-snug">
                        {currentQ.dialogueSpeaker}: &ldquo;{currentQ.dialogueLine}&rdquo;
                      </p>
                      {chineseRevealed && currentQ.dialogueZh && (
                        <p className="text-xs font-bold text-violet-200/85 mt-0.5">
                          ({currentQ.dialogueZh})
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => speakEnglish(currentQ.dialogueLine, { persona: 'standard_us' })}
                      className="px-2.5 py-1.5 rounded-full bg-violet-500/30 hover:bg-violet-500/45 border border-violet-400/50 text-violet-100 text-xs font-black flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>聽對方說</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {currentQ.cueText && (
                      <span className="px-3 py-1 rounded-xl bg-slate-800/90 border border-white/15 text-xs sm:text-sm font-black text-amber-200">
                        {currentQ.cueText}
                      </span>
                    )}
                    {chineseRevealed ? (
                      <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs sm:text-sm font-black text-amber-100">
                        目標句：{currentQ.zh}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { soundEngine.hintPing(); setChineseRevealed(true); }}
                        className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/45 text-amber-200 font-black text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                        <span>💡 看中文提示</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : promptType === 'listen_build' ? (
                <div className="flex flex-col items-center justify-center gap-2 my-0.5">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => speakEnglish(currentQ.audioText || currentQ.en, { persona: 'standard_us' })}
                      className="px-4 py-2 rounded-full bg-cyan-500/30 hover:bg-cyan-500/45 border border-cyan-300/60 text-cyan-100 text-sm sm:text-base font-black flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-5 h-5" />
                      <span>🔊 重聽句子（依順序排積木）</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => speakEnglish(currentQ.audioText || currentQ.en, { persona: 'standard_us', rate: 0.78 })}
                      className="px-3 py-2 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-white/15 text-slate-200 text-xs sm:text-sm font-black transition-all active:scale-95 cursor-pointer"
                    >
                      🐢 0.78x 慢速
                    </button>
                  </div>
                  {chineseRevealed ? (
                    <h2 className="text-base sm:text-xl font-black font-heading text-amber-200">
                      中文意思：{currentQ.zh}
                    </h2>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { soundEngine.hintPing(); setChineseRevealed(true); }}
                      className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/45 text-amber-200 font-black text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                      <span>💡 聽不出來？點看中文意思</span>
                    </button>
                  )}
                </div>
              ) : promptType === 'listen_qa' ? (
                <div className="w-full max-w-2xl flex flex-col items-center gap-1.5 my-0.5">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => speakEnglish(currentQ.promptAudioText, { persona: 'standard_us' })}
                      className="px-4 py-1.5 rounded-full bg-indigo-500/30 hover:bg-indigo-500/45 border border-indigo-300/60 text-indigo-100 text-sm font-black flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>🔊 重聽問句</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => speakEnglish(currentQ.promptAudioText, { persona: 'standard_us', rate: 0.78 })}
                      className="px-2.5 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-white/15 text-slate-200 text-xs font-black transition-all active:scale-95 cursor-pointer"
                    >
                      🐢 慢速
                    </button>
                    {!promptTranscriptRevealed && (
                      <button
                        type="button"
                        onClick={() => { soundEngine.hintPing(); setPromptTranscriptRevealed(true); }}
                        className="px-2.5 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-white/15 text-slate-300 text-xs font-black flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>偷看問句</span>
                      </button>
                    )}
                  </div>

                  {promptTranscriptRevealed && (
                    <div className="px-3 py-1 rounded-xl bg-indigo-950/60 border border-indigo-400/40 text-xs sm:text-sm font-bold text-indigo-100">
                      問句：{currentQ.promptTranscript} {currentQ.promptZh ? `（${currentQ.promptZh}）` : ''}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    {currentQ.imageSrc && (
                      <div className="bg-white p-1.5 rounded-2xl border-2 border-indigo-300/70 shadow flex items-center justify-center">
                        <img src={currentQ.imageSrc} alt="" className="h-14 sm:h-16 w-auto object-contain select-none" />
                      </div>
                    )}
                    {Array.isArray(currentQ.colorSwatches) && currentQ.colorSwatches.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        {currentQ.colorSwatches.map((sw, idx) => (
                          <span
                            key={idx}
                            className="w-10 h-10 rounded-full border-2 border-white shadow-md inline-block"
                            style={{ backgroundColor: sw.hex }}
                          />
                        ))}
                      </div>
                    )}
                    {currentQ.countBadge && (
                      <span
                        data-listen-qa-badge="true"
                        className="px-3 py-1 rounded-xl bg-amber-400 text-stone-950 font-black text-lg sm:text-2xl shadow"
                      >
                        {currentQ.countBadge}
                      </span>
                    )}
                    {currentQ.cueText && (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-indigo-400/35 text-xs sm:text-sm font-black text-amber-200">
                        請組出回答：{currentQ.cueText}
                      </span>
                    )}
                    {chineseRevealed ? (
                      <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs font-black text-amber-100">
                        目標答句：{currentQ.zh}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { soundEngine.hintPing(); setChineseRevealed(true); }}
                        className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/45 text-amber-200 font-black text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                        <span>💡 看中文提示</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : promptType === 'picture' ? (
                <div className="flex flex-col items-center justify-center gap-1.5 my-0.5">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {Array.isArray(currentQ.colorSwatches) && currentQ.colorSwatches.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        {currentQ.colorSwatches.map((sw, idx) => (
                          <span
                            key={idx}
                            className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 border-white shadow-md inline-block"
                            style={{ backgroundColor: sw.hex }}
                          />
                        ))}
                      </div>
                    )}
                    {currentQ.imageSrc && (
                      <div className="bg-white p-1.5 sm:p-2 rounded-2xl border-2 border-emerald-300/70 shadow-md flex items-center justify-center">
                        <img src={currentQ.imageSrc} alt="" className="h-16 sm:h-20 w-auto object-contain select-none" />
                      </div>
                    )}
                    {currentQ.countBadge && (
                      <span className="px-3 py-1 rounded-xl bg-amber-400 text-stone-950 font-black text-lg sm:text-2xl shadow">
                        {currentQ.countBadge}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {currentQ.pictureCue && (
                      <span className="text-xs sm:text-sm font-black text-emerald-200">
                        {currentQ.pictureCue}
                      </span>
                    )}
                    {chineseRevealed ? (
                      <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs sm:text-sm font-black text-amber-100">
                        {currentQ.zh}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { soundEngine.hintPing(); setChineseRevealed(true); }}
                        className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/45 text-amber-200 font-black text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                        <span>💡 看中文提示</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 my-1">
                  {currentQ.hideChineseByDefault && !chineseRevealed ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.hintPing();
                        setChineseRevealed(true);
                      }}
                      className="px-4 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-black text-sm sm:text-base flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-300" />
                      <span>💡 點擊看中文提示（新組合句挑戰）</span>
                    </button>
                  ) : (
                    <h2 className="text-xl sm:text-3xl font-black font-heading text-white drop-shadow">
                      {currentQ.zh}
                    </h2>
                  )}

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => speakEnglish(currentQ.en, { persona: 'standard_us' })}
                      className="px-3 py-1.5 rounded-full bg-sky-500/25 hover:bg-sky-500/40 border border-sky-400/50 text-sky-200 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      title="播放標準美式語音提示"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>聽提示音</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => speakEnglish(currentQ.en, { persona: 'standard_us', rate: 0.78 })}
                      className="px-2.5 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-white/15 text-slate-300 text-xs font-black transition-all active:scale-95 cursor-pointer"
                      title="慢速 0.78x 朗讀"
                    >
                      🐢 慢速
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. 答案鑄造槽（點擊可退回、支援拖曳換位、整句送出才驗證） */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnTrayEnd}
              className={`w-full rounded-2xl border-2 p-3 sm:p-4 transition-all ${
                trayShake ? 'animate-shake border-rose-400 bg-rose-950/40' :
                feedback === 'correct'
                  ? 'border-emerald-400 bg-emerald-950/45 shadow-[0_0_25px_rgba(16,185,129,0.45)]'
                  : 'border-sky-400/40 bg-slate-950/75 shadow-inner'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                <span className="text-sky-300 flex items-center gap-1.5">
                  <span>
                    {currentQ.isAlphabetSequence
                      ? `🔤 字母排列槽：已放 ${placedTiles.length} / ${currentQ.targetCount} 個`
                      : `🧱 造句槽：已放 ${placedTiles.length} / ${currentQ.targetCount} 塊`}
                  </span>
                  {!isAlphabetMode && level === 'lv2' && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px]">
                      含干擾詞，不用全放！
                    </span>
                  )}
                  {!isAlphabetMode && (currentQ.isListeningTask || currentQ.strictOrder) && (
                    <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 text-[10px]">
                      聽力須依聽見順序作答
                    </span>
                  )}
                </span>
                {placedTiles.length > 0 && feedback !== 'correct' && (
                  <button
                    type="button"
                    onClick={handleClearPlaced}
                    className="text-slate-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>清空重排</span>
                  </button>
                )}
              </div>

              <div className="min-h-[64px] flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                {placedTiles.length === 0 ? (
                  <span className="text-xs sm:text-sm font-bold text-slate-500 py-3">
                    {currentQ.isAlphabetSequence
                      ? '點擊下方字母積木，按 A → Z 連續順序排好'
                      : '點擊下方字卡積木，按正確語序組出完整英文句子（含句尾標點）'}
                  </span>
                ) : (
                  placedTiles.map((tile, idx) => {
                    const mark = slotMarks[idx];
                    const markCls =
                      feedback === 'correct' || mark === 'ok'
                        ? 'bg-emerald-500 text-white border-b-4 border-emerald-700 ring-2 ring-emerald-300/70'
                        : mark === 'err'
                        ? 'bg-rose-500 text-white border-b-4 border-rose-700 ring-2 ring-rose-300/70'
                        : tile.isPunct
                        ? PUNCT_STYLE
                        : 'bg-sky-500 hover:bg-sky-400 text-white border-b-4 border-sky-700';

                    return (
                      <button
                        key={tile.tileId}
                        type="button"
                        draggable={feedback !== 'correct'}
                        onDragStart={() => setDraggedTileId(tile.tileId)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.stopPropagation();
                          handleDropOnSlot(idx);
                        }}
                        onClick={() => handleRemoveTile(tile.tileId)}
                        title="點擊退回待選區，或拖曳調整順序"
                        className={`btn-3d px-3 sm:px-4 py-2 rounded-xl ${
                          currentQ.isAlphabetSequence
                            ? 'text-2xl sm:text-3xl min-w-[54px] sm:min-w-[66px]'
                            : 'text-base sm:text-xl'
                        } font-black tracking-wide shadow-md cursor-pointer animate-pop ${markCls}`}
                      >
                        {tile.text}
                      </button>
                    );
                  })
                )}
              </div>

              {/* 驗證後訊息列 */}
              {feedback === 'correct' && (
                <div className="mt-2.5 pt-2 border-t border-emerald-400/30 flex flex-wrap items-center justify-center gap-2 text-emerald-300 font-black text-sm animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 animate-bounce shrink-0" />
                  <span>
                    {currentQ.isAlphabetSequence ? '完美排好！' : '完美組句！'}
                    「{matchedSentenceText || formatTokensToSentence(currentQ.tokens)}」
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeech();
                      advanceAfterCorrect(advanceGenRef.current);
                    }}
                    className="px-2.5 py-0.5 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-100 border border-emerald-400/50 text-xs font-black cursor-pointer"
                  >
                    下一題 ➔
                  </button>
                </div>
              )}
              {feedback === 'wrong' && wrongMsg && (
                <div className="mt-2.5 pt-2 border-t border-rose-400/30 flex flex-wrap items-center justify-center gap-2 text-rose-300 font-bold text-xs animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{wrongMsg}</span>
                  {wrongAttempts >= 2 && (
                    <button
                      type="button"
                      onClick={handleHintNextError}
                      className="px-2.5 py-0.5 rounded-lg bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-400/40 font-black cursor-pointer"
                    >
                      ✨ 提示第一個錯處
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3. 待選字卡／字母區 + 送出驗證按鈕 */}
            <div className="flex flex-col gap-2.5 shrink-0">
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/65 border border-white/10">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                  {currentQ.bankTiles.map((tile, idx) => {
                    const isUsed = placedIdsSet.has(tile.tileId);
                    const palette = tile.isPunct ? PUNCT_STYLE : TILE_PALETTES[idx % TILE_PALETTES.length];
                    return (
                      <button
                        key={tile.tileId}
                        type="button"
                        data-sentence-bank-tile={tile.tileId}
                        disabled={isUsed || feedback === 'correct'}
                        draggable={!isUsed && feedback !== 'correct'}
                        onDragStart={() => setDraggedTileId(tile.tileId)}
                        onClick={() => handlePickTile(tile)}
                        className={`btn-3d px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl ${
                          currentQ.isAlphabetSequence
                            ? 'text-2xl sm:text-3xl min-w-[54px] sm:min-w-[66px]'
                            : 'text-base sm:text-xl'
                        } font-black transition-all select-none ${
                          isUsed
                            ? 'opacity-20 scale-90 bg-slate-800 text-slate-500 border-2 border-dashed border-slate-600 cursor-default shadow-none'
                            : `${palette} shadow-lg cursor-pointer hover:scale-105`
                        }`}
                      >
                        {tile.text}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                  {currentQ.isAlphabetSequence
                    ? '點選字母依序排列，按「送出驗證」或 Enter 檢查答案'
                    : '點選字卡依序組句，按「送出驗證」或 Enter 檢查答案'}
                </span>
                <Button3D
                  variant={placedTiles.length === currentQ.targetCount ? 'emerald' : 'blue'}
                  size="lg"
                  data-sentence-verify="true"
                  onClick={handleVerify}
                  disabled={placedTiles.length === 0 || feedback === 'correct'}
                  icon={Zap}
                  className="w-full sm:w-auto sm:ml-auto"
                >
                  ⚡ 送出驗證
                </Button3D>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
