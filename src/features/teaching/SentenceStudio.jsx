import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Eye,
  Replace,
  Puzzle,
  MessageSquare,
  Languages,
  Volume2,
  Turtle,
  BookOpen,
  PenTool,
  Gamepad2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  EyeOff,
  Palette,
  GripVertical,
  ZoomIn,
  ZoomOut,
  Plus,
  Lightbulb,
  Sparkles,
  HelpCircle,
  Star,
} from 'lucide-react';
import { speakEnglish, stopSpeech, soundEngine } from '../../services/audio';
import { isElementarySafeWord } from '../../services/profanityFilter';
import {
  formatTokensToSentence,
  matchSentenceTokens,
  getAvailableSentences,
} from '../../data/sentencePatterns';
import { GRAMMAR_ROLE_STYLES, getRelevantGrammarTableIds } from './data/grammarTablesData';
import { GrammarTablesModal } from './GrammarTablesModal';
import {
  PUNCTUATION_RE,
  classifyTokenRole,
  getAutoScaleTier,
  pickDefaultSlotIndex,
  getFocusSlotIndices,
  buildQaPairs,
  buildSlotSubstitutionChoices,
  validateAndNormalizeSubstitutedTokens,
} from './utils/sentenceHelpers';

// 3-tier 自動字級設定 (0=緊湊長句, 1=中長句, 2=短句大字)
const TIER_TOKEN_CLASSES = [
  {
    token: 'px-2.5 py-1 text-base sm:text-xl rounded-xl',
    containerGap: 'gap-1.5',
    badgeLabelZh: '長句自動縮放',
    badgeLabelEn: 'Compact Scale',
  },
  {
    token: 'px-3 py-1.5 text-xl sm:text-2xl rounded-xl',
    containerGap: 'gap-2',
    badgeLabelZh: '中句適中字級',
    badgeLabelEn: 'Medium Scale',
  },
  {
    token: 'px-3.5 py-2 text-2xl sm:text-4xl rounded-2xl',
    containerGap: 'gap-2.5',
    badgeLabelZh: '短句放大',
    badgeLabelEn: 'Large Scale',
  },
];

function shuffleWithGuarantee(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  if (copy.length > 2 && copy.every((item, idx) => item.text === items[idx].text)) {
    [copy[0], copy[copy.length - 1]] = [copy[copy.length - 1], copy[0]];
  }
  return copy;
}

export function SentenceStudio({
  selectedBook = '3',
  selectedUnit = '0',
  curriculumUnit = null,
  unitVocab = [],
  unitSentences = [],
  lang = 'zh',
  onSendToBoard,
  onLaunchGame,
}) {
  const isZh = lang !== 'en';
  const [subMode, setSubMode] = useState('display'); // 'display' | 'substitute' | 'scramble' | 'qa' | 'zh-en'
  const [activeIdx, setActiveIdx] = useState(0);
  const [fontOffset, setFontOffset] = useState(0); // -1 | 0 | 1
  const [showGrammarColors, setShowGrammarColors] = useState(true);
  const [showChinese, setShowChinese] = useState(true);
  const [grammarModalOpen, setGrammarModalOpen] = useState(false);
  const [safetyWarn, setSafetyWarn] = useState(null);
  const [speakingTokenIdx, setSpeakingTokenIdx] = useState(-1);

  // Substitute mode state
  const [slotIndex, setSlotIndex] = useState(0);
  const [customSlotWord, setCustomSlotWord] = useState('');
  const [subInputText, setSubInputText] = useState('');

  // Scramble mode state
  const [includeDistractors, setIncludeDistractors] = useState(false);
  const [bankTiles, setBankTiles] = useState([]);
  const [placedTiles, setPlacedTiles] = useState([]);
  const [scrambleStatus, setScrambleStatus] = useState(null); // null | 'correct' | 'wrong' | 'revealed'

  // Q&A mode state
  const [qaIdx, setQaIdx] = useState(0);
  const [maskQuestion, setMaskQuestion] = useState(false);
  const [maskAnswer, setMaskAnswer] = useState(true);

  // Zh->En curtain + progressive reveal state
  const [curtainRevealPct, setCurtainRevealPct] = useState(0);
  const [stepRevealCount, setStepRevealCount] = useState(0);
  const isDraggingCurtainRef = useRef(false);
  const curtainContainerRef = useRef(null);
  const qaTimeoutRef = useRef(null);
  const warnTimeoutRef = useRef(null);
  const unitVocabRef = useRef(unitVocab);
  unitVocabRef.current = unitVocab;
  const lastSentenceIdRef = useRef('');

  const fallbackSampleSentences = useMemo(() => {
    return getAvailableSentences({
      selectedUnits: ['1-1', '3-2', '4-2', '8-1'],
      includeCrossUnit: false,
    }).slice(0, 8);
  }, []);

  const usingFallback = !Array.isArray(unitSentences) || unitSentences.length === 0;

  const activeSentences = useMemo(() => {
    const source = usingFallback ? fallbackSampleSentences : unitSentences;
    return source
      .filter((s) => s?.en && isElementarySafeWord(s.en))
      .map((s) => ({
        ...s,
        tokens: Array.isArray(s.tokens) && s.tokens.length > 0
          ? s.tokens
          : String(s.en).trim().split(/\s+/),
      }));
  }, [usingFallback, fallbackSampleSentences, unitSentences]);

  const currentSentence = activeSentences[activeIdx % Math.max(1, activeSentences.length)] || null;

  const relevantGrammarIds = useMemo(
    () => getRelevantGrammarTableIds(selectedBook, selectedUnit),
    [selectedBook, selectedUnit]
  );

  const showSafety = useCallback((msg) => {
    if (warnTimeoutRef.current) window.clearTimeout(warnTimeoutRef.current);
    setSafetyWarn(msg);
    warnTimeoutRef.current = window.setTimeout(() => setSafetyWarn(null), 2800);
  }, []);

  const speakSafe = useCallback(
    (text, opts = { rate: 0.88 }) => {
      const cleaned = String(text || '').trim();
      if (!cleaned) return false;
      if (!isElementarySafeWord(cleaned)) {
        showSafety(isZh ? '偵測到不適當用詞，已攔截朗讀' : 'Unsafe text blocked');
        return false;
      }
      try {
        speakEnglish(cleaned, opts);
      } catch {
        // ignore audio error in headless/mute state
      }
      return true;
    },
    [isZh, showSafety]
  );

  const qaSeqRef = useRef(0);

  const cancelPendingSpeech = useCallback(() => {
    qaSeqRef.current += 1;
    if (qaTimeoutRef.current) {
      window.clearTimeout(qaTimeoutRef.current);
      qaTimeoutRef.current = null;
    }
    try {
      stopSpeech();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelPendingSpeech();
      if (warnTimeoutRef.current) window.clearTimeout(warnTimeoutRef.current);
    };
  }, [cancelPendingSpeech]);

  // 切換冊課、模式或問答題組時，立即取消進行中語音與預約播放
  useEffect(() => {
    cancelPendingSpeech();
  }, [selectedBook, selectedUnit, subMode, qaIdx, cancelPendingSpeech]);

  // 切換冊課時重設索引與模式狀態
  useEffect(() => {
    setActiveIdx(0);
    setQaIdx(0);
    setCustomSlotWord('');
    setSubInputText('');
    setCurtainRevealPct(0);
    setStepRevealCount(0);
    setScrambleStatus(null);
  }, [selectedBook, selectedUnit]);

  // 切換句子時同步更新代換預設位置與中翻英遮簾（僅於 sentence ID 真正變動時重設）
  useEffect(() => {
    if (!currentSentence) return;
    const sentenceKey = `${selectedBook}::${selectedUnit}::${currentSentence.id || currentSentence.en}`;
    if (lastSentenceIdRef.current === sentenceKey) return;
    lastSentenceIdRef.current = sentenceKey;

    setSlotIndex(pickDefaultSlotIndex(currentSentence.tokens, unitVocabRef.current));
    setCustomSlotWord('');
    setSubInputText('');
    setCurtainRevealPct(0);
    setStepRevealCount(0);
    setSpeakingTokenIdx(-1);
  }, [currentSentence, selectedBook, selectedUnit]);

  // 重建重組字磚
  const rebuildScramble = useCallback((sentence, withDistractors) => {
    if (!sentence) {
      setBankTiles([]);
      setPlacedTiles([]);
      setScrambleStatus(null);
      return;
    }
    const baseTiles = sentence.tokens.map((tok, i) => ({
      uid: `tok_${i}_${tok}`,
      text: tok,
      isDistractor: false,
    }));
    const distractorTiles = withDistractors
      ? (sentence.distractors || []).slice(0, 2).map((d, idx) => ({
          uid: `dist_${idx}_${d}`,
          text: d,
          isDistractor: true,
        }))
      : [];
    setBankTiles(shuffleWithGuarantee([...baseTiles, ...distractorTiles]));
    setPlacedTiles([]);
    setScrambleStatus(null);
  }, []);

  useEffect(() => {
    rebuildScramble(currentSentence, includeDistractors);
  }, [currentSentence, includeDistractors, rebuildScramble]);

  // 自動字級計算 (3-tier)
  const displaySentenceText = useMemo(() => {
    if (!currentSentence) return '';
    return formatTokensToSentence(currentSentence.tokens);
  }, [currentSentence]);

  const autoScaleTier = useMemo(() => getAutoScaleTier(displaySentenceText), [displaySentenceText]);
  const effectiveScaleTier = Math.max(0, Math.min(2, autoScaleTier + fontOffset));
  const tierConfig = TIER_TOKEN_CLASSES[effectiveScaleTier];

  const focusSlotSet = useMemo(
    () => new Set(getFocusSlotIndices(currentSentence?.tokens || [], unitVocab)),
    [currentSentence, unitVocab]
  );

  // 代換模式下組成的新句 tokens + 即時文法校正與錯誤檢視
  const substitutionAnalysis = useMemo(() => {
    if (!currentSentence) return { tokens: [], autoFixes: [], errors: [] };
    const rawTokens = currentSentence.tokens.map((tok, idx) =>
      idx === slotIndex && customSlotWord ? customSlotWord : tok
    );
    if (!customSlotWord) {
      return { tokens: rawTokens, autoFixes: [], errors: [] };
    }
    return validateAndNormalizeSubstitutedTokens(rawTokens, { autoCorrect: true });
  }, [currentSentence, slotIndex, customSlotWord]);

  const substitutedTokens = substitutionAnalysis.tokens;
  const substitutionAutoFixes = substitutionAnalysis.autoFixes;
  const substitutionErrors = substitutionAnalysis.errors;
  const badSubstitutionIndices = useMemo(
    () => new Set(substitutionErrors.flatMap((err) => err.indices || [])),
    [substitutionErrors]
  );

  const substitutedSentenceText = useMemo(
    () => formatTokensToSentence(substitutedTokens),
    [substitutedTokens]
  );

  // 智慧代換候選詞（依所選槽位之語法角色與語意類別相容推薦）
  const substitutionChoices = useMemo(() => {
    if (!currentSentence) return [];
    return buildSlotSubstitutionChoices(currentSentence.tokens, slotIndex, unitVocab);
  }, [currentSentence, slotIndex, unitVocab]);

  // 問答對資料
  const qaPairs = useMemo(() => buildQaPairs(activeSentences), [activeSentences]);
  const currentQaPair = qaPairs.length > 0 ? qaPairs[qaIdx % qaPairs.length] : null;

  const handleSelectMode = useCallback(
    (modeId) => {
      try {
        soundEngine.click();
      } catch {
        // ignore audio error
      }
      cancelPendingSpeech();
      setSubMode(modeId);
    },
    [cancelPendingSpeech]
  );

  const handlePrevSentence = useCallback(() => {
    if (activeSentences.length === 0) return;
    try {
      soundEngine.click();
    } catch {
      // ignore
    }
    setActiveIdx((idx) => (idx - 1 + activeSentences.length) % activeSentences.length);
  }, [activeSentences.length]);

  const handleNextSentence = useCallback(() => {
    if (activeSentences.length === 0) return;
    try {
      soundEngine.click();
    } catch {
      // ignore
    }
    setActiveIdx((idx) => (idx + 1) % activeSentences.length);
  }, [activeSentences.length]);

  // Display mode: 點讀單個詞塊
  const handleTokenSpeak = useCallback(
    (token, idx) => {
      if (PUNCTUATION_RE.test(token)) {
        speakSafe(displaySentenceText, { rate: 0.88 });
        return;
      }
      setSpeakingTokenIdx(idx);
      speakSafe(token, { rate: 0.88 });
      window.setTimeout(() => {
        setSpeakingTokenIdx((cur) => (cur === idx ? -1 : cur));
      }, 900);
    },
    [displaySentenceText, speakSafe]
  );

  // Substitute mode: 自訂詞彙檢查與套用
  const handleApplyCustomSubstitute = useCallback(
    (e) => {
      e.preventDefault();
      const val = subInputText.trim();
      if (!val) return;
      if (!isElementarySafeWord(val)) {
        showSafety(isZh ? '該自訂詞彙不適合國小課堂，已阻擋！' : 'Unsafe word blocked!');
        return;
      }
      const nextTokens = currentSentence.tokens.map((tok, idx) => (idx === slotIndex ? val : tok));
      const checked = validateAndNormalizeSubstitutedTokens(nextTokens, { autoCorrect: true });
      setCustomSlotWord(val);
      setSubInputText('');
      if (checked.errors.length === 0) {
        speakSafe(formatTokensToSentence(checked.tokens), { rate: 0.88 });
      }
    },
    [subInputText, currentSentence, slotIndex, isZh, showSafety, speakSafe]
  );

  // Scramble mode interactions
  const handlePickBankTile = useCallback(
    (tile) => {
      try {
        soundEngine.blockSnap();
      } catch {
        // ignore
      }
      if (!PUNCTUATION_RE.test(tile.text)) {
        speakSafe(tile.text, { rate: 0.92 });
      }
      setBankTiles((prev) => prev.filter((item) => item.uid !== tile.uid));
      setPlacedTiles((prev) => [...prev, tile]);
      setScrambleStatus(null);
    },
    [speakSafe]
  );

  const handleReturnPlacedTile = useCallback((tile) => {
    try {
      soundEngine.blockPop();
    } catch {
      // ignore
    }
    setPlacedTiles((prev) => prev.filter((item) => item.uid !== tile.uid));
    setBankTiles((prev) => [...prev, tile]);
    setScrambleStatus(null);
  }, []);

  const handleCheckScramble = useCallback(() => {
    if (!currentSentence || placedTiles.length === 0) return;
    const placedTexts = placedTiles.map((t) => t.text);
    const matched = matchSentenceTokens(placedTexts, currentSentence, { allowVariants: true });
    if (matched) {
      setScrambleStatus('correct');
      try {
        soundEngine.correct();
        confetti({ particleCount: 55, spread: 60, origin: { y: 0.7 } });
      } catch {
        // ignore in headless
      }
      speakSafe(formatTokensToSentence(matched), { rate: 0.88 });
    } else {
      setScrambleStatus('wrong');
      try {
        soundEngine.wrong();
      } catch {
        // ignore
      }
    }
  }, [currentSentence, placedTiles, speakSafe]);

  const handleRevealScrambleAnswer = useCallback(() => {
    if (!currentSentence) return;
    setPlacedTiles(
      currentSentence.tokens.map((tok, idx) => ({
        uid: `ans_${idx}_${tok}`,
        text: tok,
        isDistractor: false,
      }))
    );
    setBankTiles([]);
    setScrambleStatus('revealed');
    speakSafe(displaySentenceText, { rate: 0.86 });
  }, [currentSentence, displaySentenceText, speakSafe]);

  // Q&A 問答連讀（換題／離頁時透過 qaSeqRef 與 cancelPendingSpeech 自動取消）
  const handlePlayQaSequence = useCallback(() => {
    if (!currentQaPair?.question) return;
    cancelPendingSpeech();
    const seq = qaSeqRef.current;
    const answerText = currentQaPair.answer?.en || '';
    speakSafe(currentQaPair.question.en, { rate: 0.86 });
    if (answerText) {
      qaTimeoutRef.current = window.setTimeout(() => {
        if (qaSeqRef.current !== seq) return;
        speakSafe(answerText, { rate: 0.86 });
      }, 1450);
    }
  }, [currentQaPair, cancelPendingSpeech, speakSafe]);

  // Zh->En 拖拉遮簾控制
  const updateCurtainFromClientX = useCallback((clientX) => {
    const rect = curtainContainerRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setCurtainRevealPct(Math.round(pct));
  }, []);

  const handleCurtainPointerDown = useCallback(
    (e) => {
      isDraggingCurtainRef.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      updateCurtainFromClientX(e.clientX);
    },
    [updateCurtainFromClientX]
  );

  const handleCurtainPointerMove = useCallback(
    (e) => {
      if (!isDraggingCurtainRef.current) return;
      updateCurtainFromClientX(e.clientX);
    },
    [updateCurtainFromClientX]
  );

  const handleCurtainPointerUp = useCallback((e) => {
    isDraggingCurtainRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  const handleStepRevealNext = useCallback(() => {
    if (!currentSentence) return;
    try {
      soundEngine.click();
    } catch {
      // ignore
    }
    setStepRevealCount((count) => {
      const next = Math.min(currentSentence.tokens.length, count + 1);
      if (next >= currentSentence.tokens.length) {
        setCurtainRevealPct(100);
      }
      return next;
    });
  }, [currentSentence]);

  const handleSendCurrentSentenceToBoard = useCallback(() => {
    if (!onSendToBoard || !currentSentence) return;
    const targetText =
      subMode === 'substitute' ? substitutedSentenceText : displaySentenceText;
    const cleanForBoard = String(targetText || '').trim();
    if (!cleanForBoard || !isElementarySafeWord(cleanForBoard)) return;
    onSendToBoard(cleanForBoard);
  }, [onSendToBoard, currentSentence, subMode, substitutedSentenceText, displaySentenceText]);

  const subModes = [
    { id: 'display', labelZh: '展示', labelEn: 'Display', icon: Eye },
    { id: 'substitute', labelZh: '代換', labelEn: 'Sub', icon: Replace },
    { id: 'scramble', labelZh: '重組', labelEn: 'Scramble', icon: Puzzle },
    { id: 'qa', labelZh: '問答', labelEn: 'Q&A', icon: MessageSquare },
    { id: 'zh-en', labelZh: '中翻英', labelEn: 'Zh→En', icon: Languages },
  ];

  if (!currentSentence) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 dark:text-slate-400">
        <p className="text-lg font-bold">{isZh ? '目前單元尚無句型資料' : 'No sentence patterns yet'}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden bg-slate-50/70 dark:bg-slate-950/60">
      {/* Slim 1-Row Sentence Studio Control Bar */}
      <div data-testid="studio-subbar" className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 md:[padding-left:var(--studio-subbar-pl,20px)] py-2 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
        {/* 左：5 大教學模式 */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full">
          {subModes.map((m) => {
            const Icon = m.icon;
            const active = subMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                data-testid={`sentence-mode-${m.id}`}
                onClick={() => handleSelectMode(m.id)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-black flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
                  active
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{isZh ? m.labelZh : m.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* 中：字級微調 A-/A+ ＋ 📘 十大文法表 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5">
            <button
              type="button"
              data-testid="sentence-font-dec"
              onClick={() => setFontOffset((v) => Math.max(-1, v - 1))}
              disabled={fontOffset <= -1}
              title={isZh ? '縮小句型色塊' : 'Smaller tokens'}
              className="px-2 py-1 rounded-lg text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer flex items-center gap-0.5"
            >
              <ZoomOut className="w-3.5 h-3.5" />
              <span>A-</span>
            </button>
            <span className="px-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {fontOffset === 0 ? (isZh ? '自動' : 'Auto') : fontOffset > 0 ? 'A+' : 'A-'}
            </span>
            <button
              type="button"
              data-testid="sentence-font-inc"
              onClick={() => setFontOffset((v) => Math.min(1, v + 1))}
              disabled={fontOffset >= 1}
              title={isZh ? '放大句型色塊' : 'Larger tokens'}
              className="px-2 py-1 rounded-lg text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer flex items-center gap-0.5"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>A+</span>
            </button>
          </div>

          <button
            type="button"
            data-testid="open-grammar-modal-btn"
            onClick={() => setGrammarModalOpen(true)}
            className="px-2.5 sm:px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isZh ? '文法整理表' : 'Grammar'}</span>
            {relevantGrammarIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {relevantGrammarIds.length}
              </span>
            )}
          </button>
        </div>

        {/* 右：🎮 一鍵去句型積木遊戲 */}
        {onLaunchGame && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              data-testid="sentence-launch-game-btn"
              onClick={() => onLaunchGame('sentence', { openInNewTab: false })}
              className="px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-400 hover:to-sky-500 text-white text-xs font-black flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isZh ? '句型積木' : 'Sentence Game'}</span>
            </button>
            <button
              type="button"
              title={isZh ? '於新分頁開啟句型積木' : 'Open Sentence Game in new tab'}
              onClick={() => onLaunchGame('sentence', { openInNewTab: true })}
              className="p-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Safety Warning Toast */}
      {safetyWarn && (
        <div
          data-testid="sentence-safety-toast"
          className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs sm:text-sm font-black shadow-xl flex items-center gap-2"
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{safetyWarn}</span>
        </div>
      )}

      {/* Main Content Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4 flex flex-col gap-4 max-w-5xl w-full mx-auto">
        {/* Curriculum Highlight / Fallback Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {usingFallback ? (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                {isZh ? '目前為自由練習精選句型（可切回各冊課次觀看課本句型）' : 'Free mode sample sentences'}
              </span>
            ) : (
              curriculumUnit?.sentenceHighlight && (
                <span className="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 font-bold border border-sky-200 dark:border-sky-800">
                  {isZh ? '本課核心句型：' : 'Unit Focus: '}
                  {curriculumUnit.sentenceHighlight}
                </span>
              )
            )}
            <span className="px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
              {isZh ? tierConfig.badgeLabelZh : tierConfig.badgeLabelEn}
            </span>
          </div>

          {subMode !== 'qa' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevSentence}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer hover:border-sky-400"
                aria-label={isZh ? '上一句' : 'Previous sentence'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-black text-slate-600 dark:text-slate-300">
                {(activeIdx % activeSentences.length) + 1} / {activeSentences.length}
              </span>
              <button
                type="button"
                onClick={handleNextSentence}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer hover:border-sky-400"
                aria-label={isZh ? '下一句' : 'Next sentence'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* Mode 1: Display 展示教學（詞性色塊 + 點字發音 + 課本縮寫原樣呈現） */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {subMode === 'display' && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-8 space-y-6">
            {/* 色塊圖例 + 開關 */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                {showGrammarColors &&
                  ['wh', 'subject', 'verb', 'object', 'prep'].map((roleKey) => (
                    <span
                      key={roleKey}
                      className={`px-2 py-0.5 rounded-lg border ${GRAMMAR_ROLE_STYLES[roleKey].chipClass}`}
                    >
                      {isZh
                        ? GRAMMAR_ROLE_STYLES[roleKey].labelZh
                        : GRAMMAR_ROLE_STYLES[roleKey].labelEn}
                    </span>
                  ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowGrammarColors((v) => !v)}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-black flex items-center gap-1 cursor-pointer ${
                    showGrammarColors
                      ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-200'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>{isZh ? '詞性著色' : 'Colors'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowChinese((v) => !v)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {showChinese ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showChinese ? (isZh ? '隱藏中文' : 'Hide Zh') : isZh ? '顯示中文' : 'Show Zh'}</span>
                </button>
              </div>
            </div>

            {/* 句型積木展示區 */}
            <div
              data-testid="sentence-display-tokens"
              data-scale-tier={effectiveScaleTier}
              data-auto-scale-tier={autoScaleTier}
              className={`min-h-[120px] flex flex-wrap items-center justify-center py-4 ${tierConfig.containerGap}`}
            >
              {currentSentence.tokens.map((tok, idx) => {
                const role = classifyTokenRole(tok, idx, currentSentence.tokens);
                const isPunct = role === 'punct';
                const roleStyle = GRAMMAR_ROLE_STYLES[role] || GRAMMAR_ROLE_STYLES.object;
                const isSpeaking = speakingTokenIdx === idx;

                if (isPunct) {
                  return (
                    <button
                      key={`${idx}_${tok}`}
                      type="button"
                      onClick={() => handleTokenSpeak(tok, idx)}
                      className={`${tierConfig.token} font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:text-slate-900`}
                    >
                      {tok}
                    </button>
                  );
                }

                return (
                  <button
                    key={`${idx}_${tok}`}
                    type="button"
                    data-sentence-token={tok}
                    onClick={() => handleTokenSpeak(tok, idx)}
                    className={`${tierConfig.token} font-phonics font-black border-2 shadow-xs transition cursor-pointer hover:scale-105 active:scale-95 ${
                      showGrammarColors
                        ? roleStyle.chipClass
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600'
                    } ${isSpeaking ? 'ring-4 ring-indigo-500/60 scale-105' : ''}`}
                  >
                    {tok}
                  </button>
                );
              })}
            </div>

            {/* 中文釋義 */}
            {showChinese && (
              <div className="text-center text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-200">
                {currentSentence.zh}
              </div>
            )}

            {/* 教室操作鈕列 */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                data-testid="sentence-speak-all"
                onClick={() => speakSafe(displaySentenceText, { rate: 0.88 })}
                className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-black flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isZh ? '朗讀整句' : 'Speak All'}</span>
              </button>

              <button
                type="button"
                onClick={() => speakSafe(displaySentenceText, { rate: 0.62 })}
                className="px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-sm font-black flex items-center gap-2 cursor-pointer"
              >
                <Turtle className="w-4 h-4" />
                <span>{isZh ? '慢速跟讀' : 'Slow'}</span>
              </button>

              {onSendToBoard && (
                <button
                  type="button"
                  data-testid="sentence-send-to-board"
                  onClick={handleSendCurrentSentenceToBoard}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200 text-sm font-black flex items-center gap-2 cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>{isZh ? '送去四線板書' : 'Send to Board'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* Mode 2: Substitute 句型代換槽（點擊切換挖空 + 課本單字 / 安全自訂） */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {subMode === 'substitute' && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  {isZh
                    ? '已優先鎖定本課重點代換詞（星號標記）；也可點擊任意詞塊切換位置，系統會即時檢視與校正文法！'
                    : 'Unit focus slots are marked with a star; tap any block to move the slot with live grammar checking.'}
                </span>
              </p>
              {customSlotWord && (
                <button
                  type="button"
                  onClick={() => setCustomSlotWord('')}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isZh ? '還原原句' : 'Reset'}</span>
                </button>
              )}
            </div>

            <div
              data-testid="sentence-substitute-tokens"
              className={`min-h-[104px] flex flex-wrap items-center justify-center py-3 px-3 rounded-2xl border-2 transition ${
                substitutionErrors.length > 0
                  ? 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-400'
                  : 'border-transparent'
              } ${tierConfig.containerGap}`}
            >
              {substitutedTokens.map((tok, idx) => {
                const isPunct = PUNCTUATION_RE.test(tok);
                const isActiveSlot = idx === slotIndex;
                const isFocusSlot = focusSlotSet.has(idx);
                const isBadToken = badSubstitutionIndices.has(idx);
                if (isPunct) {
                  return (
                    <span
                      key={`${idx}_${tok}`}
                      className={`${tierConfig.token} font-black text-slate-500 dark:text-slate-400`}
                    >
                      {tok}
                    </span>
                  );
                }
                return (
                  <button
                    key={`${idx}_${tok}`}
                    type="button"
                    data-sub-slot-idx={idx}
                    onClick={() => {
                      setSlotIndex(idx);
                      setCustomSlotWord('');
                    }}
                    className={`relative ${tierConfig.token} font-phonics font-black border-2 transition cursor-pointer ${
                      isBadToken
                        ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-200 ring-4 ring-rose-400/35'
                        : isActiveSlot
                          ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 border-dashed text-amber-950 dark:text-amber-100 ring-4 ring-amber-400/35 shadow-sm'
                          : isFocusSlot
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-100 hover:border-amber-400'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-sky-400'
                    }`}
                  >
                    {tok}
                    {isFocusSlot && (
                      <span
                        title={isZh ? '本課重點代換位置' : 'Unit Focus Slot'}
                        className="ml-1 inline-flex align-top text-amber-500"
                      >
                        <Star className="w-3 h-3 fill-current" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {substitutionErrors.length > 0 && (
              <div
                data-testid="substitute-grammar-error"
                className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-black flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span>{substitutionErrors[0].messageZh}</span>
              </div>
            )}

            {substitutionErrors.length === 0 && substitutionAutoFixes.length > 0 && (
              <div
                data-testid="substitute-grammar-autofix"
                className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-black flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{substitutionAutoFixes[0]}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => speakSafe(substitutedSentenceText, { rate: 0.88 })}
                className="px-4 py-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-black flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isZh ? '朗讀代換句' : 'Speak Substituted'}</span>
              </button>
              {onSendToBoard && (
                <button
                  type="button"
                  onClick={handleSendCurrentSentenceToBoard}
                  className="px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-sm font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>{isZh ? '送去板書' : 'To Board'}</span>
                </button>
              )}
            </div>

            {/* 代換候選字池 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-black text-slate-500 dark:text-slate-400">
                {isZh ? '點選符合文法之快速代換字詞：' : 'Tap a grammar-matched replacement:'}
              </div>
              <div className="flex flex-wrap gap-2">
                {substitutionChoices.map((choice) => {
                  const isApplied = customSlotWord.toLowerCase() === choice.toLowerCase();
                  return (
                    <button
                      key={choice}
                      type="button"
                      data-sub-choice={choice}
                      onClick={() => {
                        const nextTokens = currentSentence.tokens.map((tok, idx) =>
                          idx === slotIndex ? choice : tok
                        );
                        const checked = validateAndNormalizeSubstitutedTokens(nextTokens, { autoCorrect: true });
                        setCustomSlotWord(choice);
                        if (checked.errors.length === 0) {
                          speakSafe(formatTokensToSentence(checked.tokens), { rate: 0.88 });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-sm font-extrabold cursor-pointer transition ${
                        isApplied
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleApplyCustomSubstitute} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  data-testid="substitute-custom-input"
                  value={subInputText}
                  onChange={(e) => setSubInputText(e.target.value)}
                  placeholder={isZh ? '輸入自訂英語單字或名字代入...' : 'Type custom word...'}
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  data-testid="substitute-custom-submit"
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-black flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isZh ? '代入並朗讀' : 'Apply'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* Mode 3: Scramble 互動重組（可選干擾詞 + matchSentenceTokens 驗證） */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {subMode === 'scramble' && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  {isZh ? '請重組這句英文：' : 'Arrange the sentence:'}
                </span>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {currentSentence.zh}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => speakSafe(displaySentenceText, { rate: 0.85 })}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isZh ? '聽提示' : 'Hint Audio'}</span>
                </button>
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDistractors}
                    onChange={(e) => setIncludeDistractors(e.target.checked)}
                    className="rounded text-sky-600"
                  />
                  <span>{isZh ? '加干擾詞' : 'Distractors'}</span>
                </label>
              </div>
            </div>

            {/* 作答擺放軌 */}
            <div
              data-testid="scramble-answer-tray"
              className={`min-h-[96px] p-4 rounded-2xl border-2 border-dashed flex flex-wrap items-center justify-center gap-2 transition ${
                scrambleStatus === 'correct'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400'
                  : scrambleStatus === 'wrong'
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-400'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-700'
              }`}
            >
              {placedTiles.length === 0 ? (
                <span className="text-sm font-bold text-slate-400">
                  {isZh ? '點擊下方字磚組合成完整句子（含標點符號）' : 'Tap tiles below to build the sentence'}
                </span>
              ) : (
                placedTiles.map((tile) => (
                  <button
                    key={tile.uid}
                    type="button"
                    data-placed-tile={tile.text}
                    onClick={() => handleReturnPlacedTile(tile)}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-phonics text-lg sm:text-2xl font-black shadow-sm cursor-pointer active:scale-95"
                  >
                    {tile.text}
                  </button>
                ))
              )}
            </div>

            {/* 回饋訊息 */}
            {scrambleStatus === 'correct' && (
              <div
                data-testid="scramble-feedback-correct"
                className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 font-black text-sm sm:text-base"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isZh ? '太棒了！句子重組完全正確！' : 'Awesome! Perfect sentence!'}</span>
              </div>
            )}
            {scrambleStatus === 'wrong' && (
              <div
                data-testid="scramble-feedback-wrong"
                className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 font-black text-sm sm:text-base"
              >
                <AlertCircle className="w-5 h-5" />
                <span>
                  {isZh
                    ? '語序或標點還差一點點喔，點選上方字磚可收回再試一次！'
                    : 'Not quite yet — tap placed tiles to rearrange!'}
                </span>
              </div>
            )}

            {/* 字磚池 */}
            <div data-testid="scramble-bank" className="flex flex-wrap items-center justify-center gap-2 py-2">
              {bankTiles.map((tile) => (
                <button
                  key={tile.uid}
                  type="button"
                  data-bank-tile={tile.text}
                  onClick={() => handlePickBankTile(tile)}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-sky-500 text-slate-900 dark:text-white font-phonics text-lg sm:text-2xl font-black shadow-xs cursor-pointer active:scale-95"
                >
                  {tile.text}
                </button>
              ))}
            </div>

            {/* 控制按鈕 */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                data-testid="scramble-check-btn"
                onClick={handleCheckScramble}
                disabled={placedTiles.length === 0}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isZh ? '檢查答案' : 'Check'}</span>
              </button>
              <button
                type="button"
                onClick={() => rebuildScramble(currentSentence, includeDistractors)}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>{isZh ? '重新洗牌' : 'Reshuffle'}</span>
              </button>
              <button
                type="button"
                onClick={handleRevealScrambleAnswer}
                className="px-3.5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-sm font-black cursor-pointer"
              >
                {isZh ? '公佈正解' : 'Show Answer'}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* Mode 4: Q&A 雙排問答互動（獨立遮罩 + 問答連讀 / 無相符問答呈現空狀態） */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {subMode === 'qa' && !currentQaPair && (
          <div
            data-testid="sentence-qa-empty"
            className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 sm:p-10 text-center space-y-3"
          >
            <MessageSquare className="w-8 h-8 mx-auto text-slate-400" />
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
              {isZh ? '本單元暫無對應的課本問答對話組' : 'No Matched Q&A Pairs in This Unit'}
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {isZh
                ? '此單元句型以單句展示或複數對話陳述為主，建議改用「展示」、「代換」、「重組」或「中翻英」模式進行教學。'
                : 'Use Display, Substitute, Scramble, or Zh→En mode for this unit.'}
            </p>
          </div>
        )}

        {subMode === 'qa' && currentQaPair && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 text-xs font-black">
                  {isZh ? '問答對話組' : 'Q&A Pair'} {(qaIdx % qaPairs.length) + 1}/{qaPairs.length}
                </span>
                <button
                  type="button"
                  onClick={handlePlayQaSequence}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isZh ? '問答連讀' : 'Play Q & A'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    cancelPendingSpeech();
                    setQaIdx((i) => (i - 1 + qaPairs.length) % qaPairs.length);
                  }}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cancelPendingSpeech();
                    setQaIdx((i) => (i + 1) % qaPairs.length);
                  }}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 問句卡 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border-2 border-sky-200 dark:border-sky-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-600 text-white text-xs font-black">
                  Q · {isZh ? '提問句' : 'Question'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => speakSafe(currentQaPair.question.en, { rate: 0.86 })}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-700 text-sky-700 dark:text-sky-300 text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isZh ? '聽問句' : 'Listen'}</span>
                  </button>
                  <button
                    type="button"
                    data-testid="qa-toggle-question-mask"
                    onClick={() => setMaskQuestion((m) => !m)}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-700 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {maskQuestion ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{maskQuestion ? (isZh ? '顯示英文' : 'Reveal') : isZh ? '遮住問句' : 'Mask'}</span>
                  </button>
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-phonics font-black text-slate-900 dark:text-white min-h-[1.6em] flex items-center gap-2">
                {maskQuestion ? (
                  <>
                    <HelpCircle className="w-6 h-6 text-sky-500 shrink-0" />
                    <span>• • • • • • • ?</span>
                  </>
                ) : (
                  currentQaPair.question.en
                )}
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300">
                {currentQaPair.question.zh}
              </div>
            </div>

            {/* 答句卡 */}
            {currentQaPair.answer && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black">
                    A · {isZh ? '回答句' : 'Answer'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => speakSafe(currentQaPair.answer.en, { rate: 0.86 })}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isZh ? '聽答句' : 'Listen'}</span>
                    </button>
                    <button
                      type="button"
                      data-testid="qa-toggle-answer-mask"
                      onClick={() => setMaskAnswer((m) => !m)}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {maskAnswer ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{maskAnswer ? (isZh ? '揭示答句' : 'Reveal') : isZh ? '遮住答句' : 'Mask'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-2xl sm:text-3xl font-phonics font-black text-emerald-900 dark:text-emerald-100 min-h-[1.6em] flex items-center gap-2">
                  {maskAnswer ? (
                    <>
                      <MessageSquare className="w-6 h-6 text-emerald-500 shrink-0" />
                      <span>• • • • • • • .</span>
                    </>
                  ) : (
                    currentQaPair.answer.en
                  )}
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300">
                  {currentQaPair.answer.zh}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* Mode 5: Zh→En 中翻英口說檢核（逐步揭示 + 可拖曳遮簾手把） */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {subMode === 'zh-en' && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-black">
                {isZh ? '看中文說英文（可半拉遮簾或逐詞揭示）' : 'Translate to English'}
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white py-2">
                {currentSentence.zh}
              </h3>
            </div>

            {/* 漸進提示列 */}
            {stepRevealCount > 0 && curtainRevealPct < 100 && (
              <div
                data-testid="zh-en-step-preview"
                className="flex flex-wrap items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800"
              >
                {currentSentence.tokens.map((tok, i) => (
                  <span
                    key={`${i}_${tok}`}
                    className={`px-2.5 py-1 rounded-xl font-phonics text-lg sm:text-2xl font-black ${
                      i < stepRevealCount
                        ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700 shadow-xs'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-transparent select-none border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {i < stepRevealCount ? tok : '___'}
                  </span>
                ))}
              </div>
            )}

            {/* 答案區 + 可拖曳實體手把遮簾 */}
            <div
              ref={curtainContainerRef}
              data-testid="sentence-curtain-box"
              className="relative rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 min-h-[118px] flex items-center justify-center p-5 overflow-hidden select-none"
            >
              <div className="text-center font-phonics text-2xl sm:text-4xl font-black text-emerald-800 dark:text-emerald-200 leading-snug">
                {displaySentenceText}
              </div>

              <div
                data-testid="sentence-curtain-handle"
                onPointerDown={handleCurtainPointerDown}
                onPointerMove={handleCurtainPointerMove}
                onPointerUp={handleCurtainPointerUp}
                onPointerCancel={handleCurtainPointerUp}
                style={{ transform: `translateX(${curtainRevealPct}%)` }}
                className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing touch-none shadow-lg transition-transform duration-75"
              >
                <div className="flex items-center gap-1.5 bg-white/90 px-3 py-2 rounded-xl shadow-sm font-black text-xs sm:text-sm">
                  <GripVertical className="w-4 h-4 text-amber-600" />
                  <span>{isZh ? '向右拉開' : 'Drag Right'}</span>
                </div>
                <span className="font-black text-sm sm:text-base opacity-90 flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4" />
                  <span>{isZh ? '課堂英文遮簾（可半拉偷看首字）' : 'Slide Curtain to Peek'}</span>
                </span>
              </div>
            </div>

            {/* 控制按鈕 */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                data-testid="zh-en-step-btn"
                onClick={handleStepRevealNext}
                disabled={stepRevealCount >= currentSentence.tokens.length}
                className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-black cursor-pointer"
              >
                {isZh
                  ? `逐詞揭示 (${stepRevealCount}/${currentSentence.tokens.length})`
                  : `Step Reveal (${stepRevealCount}/${currentSentence.tokens.length})`}
              </button>

              <button
                type="button"
                data-testid="zh-en-reveal-all-btn"
                onClick={() => {
                  const willOpen = curtainRevealPct < 100;
                  setCurtainRevealPct(willOpen ? 100 : 0);
                  setStepRevealCount(willOpen ? currentSentence.tokens.length : 0);
                  if (willOpen) speakSafe(displaySentenceText, { rate: 0.88 });
                }}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black cursor-pointer"
              >
                {curtainRevealPct >= 100
                  ? isZh
                    ? '一鍵全遮'
                    : 'Cover All'
                  : isZh
                    ? '全開並朗讀'
                    : 'Reveal & Speak'}
              </button>

              <button
                type="button"
                onClick={() => speakSafe(displaySentenceText, { rate: 0.88 })}
                className="px-3.5 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-200 text-sm font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isZh ? '聽解答' : 'Speak'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 底部本課句型快速切換列（重組與中翻英模式自動隱藏英文原句，避免洩漏答案） */}
        {activeSentences.length > 1 && (
          <div
            data-testid="sentence-bottom-switcher"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
          >
            {activeSentences.map((s, idx) => {
              const isCurrent = idx === activeIdx % activeSentences.length;
              const hideAnswerSpoiler = subMode === 'scramble' || subMode === 'zh-en';
              return (
                <button
                  key={s.id || idx}
                  type="button"
                  onClick={() => {
                    setActiveIdx(idx);
                    try {
                      soundEngine.click();
                    } catch {
                      // ignore
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 transition cursor-pointer ${
                    isCurrent
                      ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400'
                  }`}
                >
                  {hideAnswerSpoiler ? (isZh ? `句型 ${idx + 1}` : `Sentence ${idx + 1}`) : s.en}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 十大視覺文法統整表彈窗 */}
      <GrammarTablesModal
        isOpen={grammarModalOpen}
        onClose={() => setGrammarModalOpen(false)}
        selectedBook={selectedBook}
        selectedUnit={selectedUnit}
        lang={lang}
      />
    </div>
  );
}
