import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Layers,
  Link2,
  Volume2,
  Turtle,
  Keyboard,
  Palette,
  PenTool,
  Search,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Eye,
  EyeOff,
  Gamepad2,
  ExternalLink,
  ShieldAlert,
  GripVertical,
  RotateCcw,
  Loader2,
  Sparkles,
  PartyPopper,
} from 'lucide-react';
import { speakEnglish, soundEngine, stopSpeech } from '../../services/audio';
import { isElementarySafeWord } from '../../services/profanityFilter';
import { getOfflineWordMeta } from './data/vocabDictionary';
import { lookupWordSafeOnline } from './utils/vocabLookup';

const FALLBACK_VOCAB = [
  { id: 'v_fb_apple', en: 'apple', zh: '蘋果', kind: 'core' },
  { id: 'v_fb_banana', en: 'banana', zh: '香蕉', kind: 'core' },
  { id: 'v_fb_happy', en: 'happy', zh: '快樂的', kind: 'core' },
  { id: 'v_fb_sunny', en: 'sunny', zh: '晴朗的', kind: 'core' },
  { id: 'v_fb_library', en: 'library', zh: '圖書館', kind: 'core' },
  { id: 'v_fb_elephant', en: 'elephant', zh: '大象', kind: 'core' },
];

const SYLLABLE_COLORS = [
  'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700',
  'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700',
  'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
  'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700',
];

const shuffleArraySeeded = (arr, seed = 1) => {
  const copy = [...arr];
  let s = ((Number(seed) || 1) + 1) >>> 0;
  const nextRand = () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  if (copy.length > 1 && copy.every((item, idx) => item === arr[idx])) {
    [copy[0], copy[copy.length - 1]] = [copy[copy.length - 1], copy[0]];
  }
  return copy;
};

export function VocabStudio({
  selectedBook = '3',
  selectedUnit = '0',
  unitVocab = [],
  lang = 'zh',
  onSendToBoard,
  onLaunchGame,
}) {
  const [subMode, setSubMode] = useState('teach'); // 'teach' | 'flashcard' | 'match'
  const [safetyWarn, setSafetyWarn] = useState(null);

  // 過濾來源字表（英文與中文皆過濾安全詞彙）並安全回補
  const baseVocab = useMemo(() => {
    const valid = (Array.isArray(unitVocab) ? unitVocab : [])
      .filter((w) => w?.en && isElementarySafeWord(w.en))
      .map((w) => ({
        ...w,
        zh: w.zh && isElementarySafeWord(w.zh) ? w.zh : '',
      }));
    return valid.length > 0 ? valid : FALLBACK_VOCAB;
  }, [unitVocab]);

  const baseVocabRef = useRef(baseVocab);
  baseVocabRef.current = baseVocab;

  const showSafety = useCallback((msg) => {
    setSafetyWarn(msg);
    setTimeout(() => setSafetyWarn(null), 2800);
  }, []);

  const speakSafeEnglish = useCallback(
    (text, opts = { rate: 0.85 }) => {
      const val = String(text || '').trim();
      if (!val) return;
      if (!isElementarySafeWord(val)) {
        showSafety(
          lang === 'zh'
            ? '包含不適合國小課堂的字詞，已靜音攔截！'
            : 'Unsafe speech blocked!'
        );
        return;
      }
      speakEnglish(val, opts);
    },
    [lang, showSafety]
  );

  // ── Mode 1：單字教學狀態 ──
  const [activeIndex, setActiveIndex] = useState(0);
  const [customEntry, setCustomEntry] = useState(null);
  const [lookupInput, setLookupInput] = useState('');
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [phoneticSystem, setPhoneticSystem] = useState('ipa'); // 'ipa' | 'kk'
  const [showSyllables, setShowSyllables] = useState(false);
  const [typedCount, setTypedCount] = useState(null); // null = full word shown; number = partial typewriter
  const [isSpelling, setIsSpelling] = useState(false);
  const spellTokenRef = useRef(0);
  const wordStripRef = useRef(null);

  // ── Mode 2：抽考閃卡 + 實體拖拉手把遮卡 ──
  const [flashOrder, setFlashOrder] = useState([]);
  const [flashIdx, setFlashIdx] = useState(0);
  const [flashDirection, setFlashDirection] = useState('zh-en'); // 'zh-en' | 'en-zh' | 'listen'
  const [curtainRevealPct, setCurtainRevealPct] = useState(0); // 0 (covered) -> 100 (fully revealed)
  const curtainContainerRef = useRef(null);
  const curtainDragStartRef = useRef(null);

  // ── Mode 3：中英文連連看 ──
  const [matchRoundSeed, setMatchRoundSeed] = useState(0);
  const [matchBatchOffset, setMatchBatchOffset] = useState(0);
  const [selectedLeftKey, setSelectedLeftKey] = useState(null);
  const [selectedRightKey, setSelectedRightKey] = useState(null);
  const [matchedKeys, setMatchedKeys] = useState(() => new Set());
  const [wrongFlashPair, setWrongFlashPair] = useState(null);
  const [dragLine, setDragLine] = useState(null); // { x1, y1, x2, y2, side, key }
  const matchBoardRef = useRef(null);
  const leftCardRefs = useRef(new Map());
  const rightCardRefs = useRef(new Map());
  const [matchedLines, setMatchedLines] = useState([]);

  const lookupSeqRef = useRef(0);
  const lookupAbortRef = useRef(null);

  const cancelInFlightLookup = useCallback(() => {
    lookupSeqRef.current += 1;
    if (lookupAbortRef.current) {
      try {
        lookupAbortRef.current.abort();
      } catch {}
      lookupAbortRef.current = null;
    }
    setIsSearchingOnline(false);
  }, []);

  const lastVocabResetKeyRef = useRef('');
  // 排序並去重詞表識別碼，避免背景雲端重排相同單字順序時誤觸重設
  const baseVocabSignature = useMemo(
    () =>
      Array.from(
        new Set(
          baseVocab
            .map((w) => String(w?.en || '').trim().toLowerCase())
            .filter(Boolean)
        )
      )
        .sort()
        .join('|'),
    [baseVocab]
  );

  // 切換單元或單字清單集合真正變動時才重設狀態並取消進行中請求／拼讀
  useEffect(() => {
    const scopeKey = `${selectedBook}::${selectedUnit}::${baseVocabSignature}`;
    if (lastVocabResetKeyRef.current === scopeKey) return;
    lastVocabResetKeyRef.current = scopeKey;

    cancelInFlightLookup();
    spellTokenRef.current += 1;
    setIsSpelling(false);
    setTypedCount(null);
    setShowSyllables(false);
    setActiveIndex(0);
    setCustomEntry(null);
    setFlashOrder(baseVocab.map((_, idx) => idx));
    setFlashIdx(0);
    setCurtainRevealPct(0);
    setMatchBatchOffset(0);
    setMatchRoundSeed((s) => s + 1);
  }, [selectedBook, selectedUnit, baseVocabSignature, baseVocab, cancelInFlightLookup]);

  // 離開教學模式（如切到閃卡／連連看）時立即中止打字機與播音
  useEffect(() => {
    if (subMode !== 'teach') {
      spellTokenRef.current += 1;
      setIsSpelling(false);
      setTypedCount(null);
      try {
        stopSpeech();
      } catch {}
    }
  }, [subMode]);

  useEffect(() => {
    return () => {
      cancelInFlightLookup();
      spellTokenRef.current += 1;
      try {
        stopSpeech();
      } catch {}
    };
  }, [cancelInFlightLookup]);

  const currentItem = useMemo(() => {
    if (customEntry) return customEntry;
    return baseVocab[activeIndex % baseVocab.length] || baseVocab[0];
  }, [customEntry, baseVocab, activeIndex]);

  const currentMeta = useMemo(() => {
    if (!currentItem) return null;
    if (currentItem.onlineMeta) {
      const offlineBase = getOfflineWordMeta(currentItem.en, selectedBook, selectedUnit);
      return {
        ...offlineBase,
        ...currentItem.onlineMeta,
        hasVerifiedSyllables: Boolean(
          currentItem.onlineMeta.hasVerifiedSyllables ?? offlineBase?.hasVerifiedSyllables
        ),
        syllables:
          currentItem.onlineMeta.hasVerifiedSyllables && currentItem.onlineMeta.syllables?.length
            ? currentItem.onlineMeta.syllables
            : offlineBase?.hasVerifiedSyllables
              ? offlineBase.syllables
              : [currentItem.en],
      };
    }
    return getOfflineWordMeta(currentItem.en, selectedBook, selectedUnit);
  }, [currentItem, selectedBook, selectedUnit]);

  const handleSelectUnitWord = (idx) => {
    cancelInFlightLookup();
    spellTokenRef.current += 1;
    setIsSpelling(false);
    setTypedCount(null);
    setCustomEntry(null);
    setActiveIndex(idx);
  };

  // 自訂線上安全查單字（離線優先 -> 安全過濾線上回補，具備逾期請求防護）
  const handleLookupWord = async (e) => {
    e?.preventDefault();
    const raw = lookupInput.trim();
    if (!raw) return;

    if (!isElementarySafeWord(raw)) {
      showSafety(
        lang === 'zh'
          ? '包含不適合國小課堂的字詞，系統已安全攔截！'
          : 'Unsafe classroom word blocked!'
      );
      return;
    }

    // 先檢查是否已在本課清單中
    const inUnitIdx = baseVocab.findIndex((w) => w.en.toLowerCase() === raw.toLowerCase());
    if (inUnitIdx !== -1) {
      handleSelectUnitWord(inUnitIdx);
      setLookupInput('');
      return;
    }

    const offline = getOfflineWordMeta(raw, selectedBook, selectedUnit);
    if (offline?.fromOfflineDict) {
      cancelInFlightLookup();
      spellTokenRef.current += 1;
      setIsSpelling(false);
      setTypedCount(null);
      setCustomEntry({
        id: `custom_off_${raw.toLowerCase()}`,
        en: offline.word,
        zh: lang === 'zh' ? '課外擴充查詢字詞（離線辭典）' : 'Dictionary Lookup',
        kind: 'lookup',
      });
      setLookupInput('');
      return;
    }

    cancelInFlightLookup();
    const reqId = ++lookupSeqRef.current;
    const ctrl = new AbortController();
    lookupAbortRef.current = ctrl;
    setIsSearchingOnline(true);

    const result = await lookupWordSafeOnline(raw, { signal: ctrl.signal });
    if (reqId !== lookupSeqRef.current || ctrl.signal.aborted) {
      return;
    }
    lookupAbortRef.current = null;
    setIsSearchingOnline(false);

    if (result.blocked) {
      showSafety(
        lang === 'zh'
          ? '該詞彙或其線上釋義不適合國小課堂，已自動攔截！'
          : 'Blocked inappropriate dictionary entry!'
      );
      return;
    }

    if (result.ok && result.data) {
      spellTokenRef.current += 1;
      setIsSpelling(false);
      setTypedCount(null);
      setCustomEntry({
        id: `custom_on_${result.data.word.toLowerCase()}`,
        en: result.data.word,
        zh: result.data.definitionEn || (lang === 'zh' ? '線上安全辭典詞條' : 'Online Safe Dictionary'),
        kind: 'lookup',
        onlineMeta: result.data,
      });
      setLookupInput('');
      return;
    }

    // 若離線無且無網/查無結果，仍可呈現基本拼讀卡（已通過安全檢查）
    spellTokenRef.current += 1;
    setIsSpelling(false);
    setTypedCount(null);
    setCustomEntry({
      id: `custom_raw_${raw.toLowerCase()}`,
      en: raw,
      zh: lang === 'zh' ? '教師自訂補充字卡' : 'Teacher Custom Word',
      kind: 'lookup',
    });
    setLookupInput('');
  };

  // 逐字母打字機拼讀教學
  const handleRunTypewriterSpelling = async () => {
    const targetWord = currentItem?.en || '';
    if (!targetWord || !isElementarySafeWord(targetWord)) return;

    const token = ++spellTokenRef.current;
    setIsSpelling(true);
    setTypedCount(0);

    for (let i = 0; i < targetWord.length; i++) {
      if (spellTokenRef.current !== token) return;
      const ch = targetWord[i];
      setTypedCount(i + 1);
      if (/[a-zA-Z]/.test(ch)) {
        speakEnglish(ch.toUpperCase(), { rate: 1.05 });
        await new Promise((r) => setTimeout(r, 430));
      } else {
        await new Promise((r) => setTimeout(r, 180));
      }
    }

    if (spellTokenRef.current !== token) return;
    await new Promise((r) => setTimeout(r, 200));
    if (spellTokenRef.current !== token) return;
    speakSafeEnglish(targetWord, { rate: 0.84 });
    setIsSpelling(false);
  };

  // ── Mode 2：閃卡資料與手把拖拉遮罩邏輯 ──
  const activeFlashItem = useMemo(() => {
    const order = flashOrder.length === baseVocab.length ? flashOrder : baseVocab.map((_, i) => i);
    const targetIdx = order[flashIdx % order.length] ?? 0;
    return baseVocab[targetIdx] || baseVocab[0];
  }, [baseVocab, flashOrder, flashIdx]);

  const activeFlashMeta = useMemo(() => {
    if (!activeFlashItem) return null;
    return getOfflineWordMeta(activeFlashItem.en, selectedBook, selectedUnit);
  }, [activeFlashItem, selectedBook, selectedUnit]);

  const handleFlashStep = (delta) => {
    soundEngine.click();
    setCurtainRevealPct(0);
    setFlashIdx((i) => (i + delta + baseVocab.length) % baseVocab.length);
  };

  const handleShuffleFlash = () => {
    soundEngine.click();
    setFlashOrder(shuffleArraySeeded(baseVocab.map((_, i) => i), Date.now()));
    setFlashIdx(0);
    setCurtainRevealPct(0);
  };

  const handleCurtainPointerDown = (e) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const rect = curtainContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    curtainDragStartRef.current = {
      startX: e.clientX,
      startPct: curtainRevealPct,
      width: Math.max(120, rect.width),
    };
  };

  const handleCurtainPointerMove = (e) => {
    if (!curtainDragStartRef.current) return;
    const { startX, startPct, width } = curtainDragStartRef.current;
    const deltaPct = ((e.clientX - startX) / width) * 100;
    const nextPct = Math.max(0, Math.min(100, Math.round(startPct + deltaPct)));
    setCurtainRevealPct(nextPct);
  };

  const handleCurtainPointerUp = (e) => {
    if (!curtainDragStartRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    curtainDragStartRef.current = null;
  };

  // ── Mode 3：連連看配對池與座標連線計算 ──
  // 鎖定目前回合抽取的單字組合；背景雲端重排相同單元字順時不洗牌也不歸零進度
  const [lockedMatchRoundWords, setLockedMatchRoundWords] = useState([]);

  useEffect(() => {
    const currentList = baseVocabRef.current;
    if (!currentList.length) {
      setLockedMatchRoundWords([]);
      return;
    }
    const start = matchBatchOffset % currentList.length;
    const slice = [];
    for (let i = 0; i < Math.min(6, currentList.length); i++) {
      slice.push(currentList[(start + i) % currentList.length]);
    }
    setLockedMatchRoundWords(
      slice.map((item, idx) => ({
        key: `${String(item?.en || '').trim().toLowerCase()}_${idx}`,
        en: item.en,
        zh: item.zh || item.en,
      }))
    );
  }, [selectedBook, selectedUnit, baseVocabSignature, matchBatchOffset, matchRoundSeed]);

  const zhByLowerEn = useMemo(() => {
    const map = new Map();
    baseVocab.forEach((w) => {
      const k = String(w?.en || '').trim().toLowerCase();
      if (k && w?.zh && !map.has(k)) {
        map.set(k, w.zh);
      }
    });
    return map;
  }, [baseVocab]);

  const matchPairs = useMemo(
    () =>
      lockedMatchRoundWords.map((item) => ({
        ...item,
        zh: zhByLowerEn.get(String(item.en || '').trim().toLowerCase()) || item.zh || item.en,
      })),
    [lockedMatchRoundWords, zhByLowerEn]
  );

  const matchPairsKey = useMemo(
    () => matchPairs.map((p) => p.key).join('|'),
    [matchPairs]
  );

  const matchRightKeyOrder = useMemo(
    () => shuffleArraySeeded(matchPairsKey ? matchPairsKey.split('|') : [], matchRoundSeed),
    [matchPairsKey, matchRoundSeed]
  );

  const matchRightOrder = useMemo(() => {
    const map = new Map(matchPairs.map((p) => [p.key, p]));
    return matchRightKeyOrder.map((k) => map.get(k)).filter(Boolean);
  }, [matchPairs, matchRightKeyOrder]);

  const lastMatchResetRef = useRef('');
  useEffect(() => {
    const resetSig = `${matchPairsKey}::${matchRoundSeed}`;
    if (lastMatchResetRef.current === resetSig) return;
    lastMatchResetRef.current = resetSig;

    setSelectedLeftKey(null);
    setSelectedRightKey(null);
    setMatchedKeys(new Set());
    setWrongFlashPair(null);
    setDragLine(null);
    setMatchedLines([]);
  }, [matchPairsKey, matchRoundSeed]);

  // 計算已配對連線座標（於視窗縮放與完成配對後自動對齊）
  const recomputeMatchedLines = useCallback(() => {
    const boardEl = matchBoardRef.current;
    if (!boardEl) return;
    const boardRect = boardEl.getBoundingClientRect();
    const lines = [];
    matchedKeys.forEach((key) => {
      const lEl = leftCardRefs.current.get(key);
      const rEl = rightCardRefs.current.get(key);
      if (!lEl || !rEl) return;
      const lr = lEl.getBoundingClientRect();
      const rr = rEl.getBoundingClientRect();
      lines.push({
        key,
        x1: lr.right - boardRect.left,
        y1: lr.top + lr.height / 2 - boardRect.top,
        x2: rr.left - boardRect.left,
        y2: rr.top + rr.height / 2 - boardRect.top,
      });
    });
    setMatchedLines(lines);
  }, [matchedKeys]);

  useEffect(() => {
    if (subMode !== 'match') return undefined;
    recomputeMatchedLines();
    window.addEventListener('resize', recomputeMatchedLines);
    return () => window.removeEventListener('resize', recomputeMatchedLines);
  }, [subMode, recomputeMatchedLines, matchRightOrder]);

  const attemptPairMatch = useCallback(
    (leftKey, rightKey) => {
      if (!leftKey || !rightKey) return;
      if (leftKey === rightKey) {
        const nextSet = new Set(matchedKeys);
        nextSet.add(leftKey);
        setMatchedKeys(nextSet);
        setSelectedLeftKey(null);
        setSelectedRightKey(null);

        const pair = matchPairs.find((p) => p.key === leftKey);
        if (pair) {
          speakSafeEnglish(pair.en, { rate: 0.88 });
        }

        if (nextSet.size === matchPairs.length) {
          soundEngine.win();
          try {
            confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
          } catch {}
        } else {
          soundEngine.correct();
        }
      } else {
        soundEngine.wrong();
        setWrongFlashPair({ left: leftKey, right: rightKey });
        setSelectedLeftKey(null);
        setSelectedRightKey(null);
        setTimeout(() => setWrongFlashPair(null), 550);
      }
    },
    [matchedKeys, matchPairs, speakSafeEnglish]
  );

  const handleTapMatchCard = (side, key) => {
    if (matchedKeys.has(key)) return;
    soundEngine.click();
    if (side === 'left') {
      if (selectedRightKey) {
        attemptPairMatch(key, selectedRightKey);
      } else {
        setSelectedLeftKey((prev) => (prev === key ? null : key));
      }
    } else {
      if (selectedLeftKey) {
        attemptPairMatch(selectedLeftKey, key);
      } else {
        setSelectedRightKey((prev) => (prev === key ? null : key));
      }
    }
  };

  const handleMatchPointerDown = (e, side, key) => {
    if (matchedKeys.has(key)) return;
    const boardEl = matchBoardRef.current;
    if (!boardEl) return;
    const boardRect = boardEl.getBoundingClientRect();
    const cardRect = e.currentTarget.getBoundingClientRect();
    const startX =
      side === 'left' ? cardRect.right - boardRect.left : cardRect.left - boardRect.left;
    const startY = cardRect.top + cardRect.height / 2 - boardRect.top;

    setDragLine({
      side,
      key,
      x1: startX,
      y1: startY,
      x2: e.clientX - boardRect.left,
      y2: e.clientY - boardRect.top,
      startClientX: e.clientX,
      startClientY: e.clientY,
    });
  };

  const handleMatchBoardPointerMove = (e) => {
    if (!dragLine || !matchBoardRef.current) return;
    const boardRect = matchBoardRef.current.getBoundingClientRect();
    setDragLine((prev) =>
      prev
        ? {
            ...prev,
            x2: e.clientX - boardRect.left,
            y2: e.clientY - boardRect.top,
          }
        : null
    );
  };

  const handleMatchBoardPointerUp = (e) => {
    if (!dragLine) return;
    const dist = Math.hypot(
      e.clientX - dragLine.startClientX,
      e.clientY - dragLine.startClientY
    );
    const originSide = dragLine.side;
    const originKey = dragLine.key;
    setDragLine(null);

    if (dist < 10) return; // 交由 onClick 處理點擊配對

    const el = document.elementFromPoint(e.clientX, e.clientY);
    const targetCard = el?.closest?.('[data-match-side]');
    if (!targetCard) return;
    const targetSide = targetCard.getAttribute('data-match-side');
    const targetKey = targetCard.getAttribute('data-match-key');
    if (!targetKey || targetSide === originSide || matchedKeys.has(targetKey)) return;

    if (originSide === 'left') {
      attemptPairMatch(originKey, targetKey);
    } else {
      attemptPairMatch(targetKey, originKey);
    }
  };

  const displayedWordText = useMemo(() => {
    const full = currentItem?.en || '';
    if (typedCount === null) return full;
    return full.slice(0, typedCount);
  }, [currentItem, typedCount]);

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 精簡子模式控制列：[📖 教學 | 🃏 閃卡 | 🔗 連連看] │ [中央專屬工具] │ [🎮 單字館] */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="w-full px-3 sm:px-5 py-1.5 flex flex-wrap items-center justify-between gap-2 bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 shrink-0">
        {/* 左：三模式切換 */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setSubMode('teach')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-black transition flex items-center gap-1 cursor-pointer ${
              subMode === 'teach'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? '教學' : 'Teach'}</span>
          </button>
          <button
            type="button"
            onClick={() => setSubMode('flashcard')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-black transition flex items-center gap-1 cursor-pointer ${
              subMode === 'flashcard'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? '閃卡' : 'Cards'}</span>
          </button>
          <button
            type="button"
            onClick={() => setSubMode('match')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-black transition flex items-center gap-1 cursor-pointer ${
              subMode === 'match'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? '連連看' : 'Match'}</span>
          </button>
        </div>

        {/* 中：本模式精簡控制 */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {subMode === 'teach' && (
            <form onSubmit={handleLookupWord} className="flex items-center gap-1">
              <div className="relative">
                <input
                  type="text"
                  data-testid="vocab-lookup-input"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder={lang === 'zh' ? '查單字 / 課外字...' : 'Lookup word...'}
                  className="w-36 sm:w-48 pl-2.5 pr-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingOnline}
                data-testid="vocab-lookup-submit"
                className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1 cursor-pointer disabled:opacity-60"
              >
                {isSearchingOnline ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{lang === 'zh' ? '查詢' : 'Go'}</span>
              </button>
              {customEntry && (
                <button
                  type="button"
                  onClick={() => setCustomEntry(null)}
                  className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  {lang === 'zh' ? '回本課' : 'Unit'}
                </button>
              )}
            </form>
          )}

          {subMode === 'flashcard' && (
            <>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black">
                {[
                  { id: 'zh-en', labelZh: '看中說英', labelEn: 'Zh→En' },
                  { id: 'en-zh', labelZh: '看英說中', labelEn: 'En→Zh' },
                  { id: 'listen', labelZh: '聽音猜字', labelEn: 'Listen' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setFlashDirection(opt.id);
                      setCurtainRevealPct(0);
                    }}
                    className={`px-2 py-1 rounded-lg cursor-pointer transition ${
                      flashDirection === opt.id
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {lang === 'zh' ? opt.labelZh : opt.labelEn}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleShuffleFlash}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer hover:border-amber-400"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === 'zh' ? '洗牌' : 'Shuffle'}</span>
              </button>
            </>
          )}

          {subMode === 'match' && (
            <>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                {matchedKeys.size} / {matchPairs.length} {lang === 'zh' ? '已配對' : 'Matched'}
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.click();
                  if (baseVocab.length > 6) {
                    setMatchBatchOffset((o) => (o + 6) % baseVocab.length);
                  }
                  setMatchRoundSeed((s) => s + 1);
                }}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer hover:border-emerald-400"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lang === 'zh' ? '換一組' : 'New Set'}</span>
              </button>
            </>
          )}
        </div>

        {/* 右：🎮 前往單字冒險館 */}
        {onLaunchGame && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onLaunchGame('lobby', { openInNewTab: false })}
              className="px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'zh' ? '去單字館' : 'Vocab Games'}</span>
            </button>
            <button
              type="button"
              title={lang === 'zh' ? '於新分頁開啟單字館' : 'Open in new tab'}
              onClick={() => onLaunchGame('lobby', { openInNewTab: true })}
              className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {safetyWarn && (
        <div
          data-testid="vocab-safety-toast"
          className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs sm:text-sm font-black shadow-xl flex items-center gap-2 animate-pop"
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{safetyWarn}</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* Mode 1：📖 單字教學大白板 */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {subMode === 'teach' && currentItem && currentMeta && (
        <div className="flex-1 min-h-0 flex flex-col justify-between px-3 sm:px-6 py-3 max-w-5xl w-full mx-auto gap-3 overflow-y-auto">
          <div className="flex-1 flex flex-col justify-center">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-8 space-y-5">
              {/* 頂部標籤列：詞性 + 課綱來源 + IPA ⇄ KK 一鍵切換 */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-black">
                    {currentMeta.pos}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                      currentItem.kind === 'phonics'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        : currentItem.kind === 'lookup'
                        ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                        : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    {currentItem.kind === 'phonics'
                      ? lang === 'zh' ? '拼讀補充' : 'Phonics'
                      : currentItem.kind === 'lookup'
                      ? lang === 'zh' ? '字典查詢' : 'Lookup'
                      : lang === 'zh' ? '課本單字' : 'Core'}
                  </span>
                </div>

                {/* IPA ⇄ KK 音標顯示（僅確認美式音標時開放一鍵切換 KK，其餘保留原 IPA） */}
                {currentMeta.isUsIpa && currentMeta.kk ? (
                  <button
                    type="button"
                    data-testid="vocab-phonetic-toggle"
                    onClick={() => setPhoneticSystem((p) => (p === 'ipa' ? 'kk' : 'ipa'))}
                    className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2 cursor-pointer transition"
                    title={lang === 'zh' ? '點擊切換 IPA 國際音標 ⇄ KK 音標' : 'Switch IPA / KK'}
                  >
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-600 text-white uppercase">
                      {phoneticSystem}
                    </span>
                    <span className="font-mono text-sm sm:text-base font-bold text-indigo-900 dark:text-indigo-200">
                      {phoneticSystem === 'ipa' ? currentMeta.ipa : currentMeta.kk}
                    </span>
                  </button>
                ) : currentMeta.ipa ? (
                  <div
                    data-testid="vocab-phonetic-ipa-only"
                    className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2"
                    title={lang === 'zh' ? '尚未確認美式讀音，僅顯示 IPA 原音標' : 'IPA only (US pronunciation unverified)'}
                  >
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-600 text-white uppercase">
                      IPA
                    </span>
                    <span className="font-mono text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                      {currentMeta.ipa}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* 核心大字 + 已核實音節分色顯示區 */}
              <div className="text-center space-y-3 py-2">
                {showSyllables &&
                currentMeta.hasVerifiedSyllables &&
                currentMeta.syllables.length > 0 &&
                typedCount === null ? (
                  <div
                    data-testid="vocab-syllable-chips"
                    className="flex flex-wrap items-center justify-center gap-2"
                  >
                    {currentMeta.syllables.map((syl, sIdx) => (
                      <button
                        key={`${syl}_${sIdx}`}
                        type="button"
                        onClick={() => speakSafeEnglish(currentItem.en, { rate: 0.78 })}
                        className={`px-3.5 py-1.5 rounded-2xl border-2 font-phonics text-3xl sm:text-5xl font-black shadow-xs cursor-pointer transition hover:scale-105 ${
                          SYLLABLE_COLORS[sIdx % SYLLABLE_COLORS.length]
                        }`}
                      >
                        {syl}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => speakSafeEnglish(currentItem.en, { rate: 0.85 })}
                    className="font-phonics text-4xl sm:text-6xl font-black tracking-wide text-slate-900 dark:text-white cursor-pointer select-none min-h-[1.2em]"
                  >
                    {displayedWordText}
                    {isSpelling && (
                      <span className="inline-block w-1 h-10 sm:h-12 bg-indigo-500 ml-1 animate-pulse align-middle rounded-full" />
                    )}
                  </div>
                )}

                <div className="text-xl sm:text-2xl font-black text-slate-600 dark:text-slate-300">
                  {currentItem.zh}
                </div>
              </div>

              {/* 主要教學操作鈕列 */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => speakSafeEnglish(currentItem.en, { rate: 0.88 })}
                  className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{lang === 'zh' ? '朗讀' : 'Speak'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => speakSafeEnglish(currentItem.en, { rate: 0.62 })}
                  className="px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Turtle className="w-4 h-4" />
                  <span>{lang === 'zh' ? '慢速' : 'Slow'}</span>
                </button>

                <button
                  type="button"
                  data-testid="vocab-typewriter-btn"
                  onClick={handleRunTypewriterSpelling}
                  className={`px-3.5 py-2 rounded-2xl border text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition ${
                    isSpelling
                      ? 'bg-purple-600 text-white border-purple-500 animate-pulse'
                      : 'bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200'
                  }`}
                >
                  <Keyboard className="w-4 h-4" />
                  <span>{lang === 'zh' ? '逐字拼讀' : 'Spell'}</span>
                </button>

                <button
                  type="button"
                  data-testid="vocab-syllables-btn"
                  disabled={!currentMeta.hasVerifiedSyllables}
                  title={
                    !currentMeta.hasVerifiedSyllables
                      ? lang === 'zh'
                        ? '此字暫無已核實音節資料，保持整字教學'
                        : 'No verified syllable data'
                      : lang === 'zh'
                        ? '切換音節分色拆解'
                        : 'Toggle syllable coloring'
                  }
                  onClick={() => {
                    if (!currentMeta.hasVerifiedSyllables) return;
                    setTypedCount(null);
                    setIsSpelling(false);
                    setShowSyllables((v) => !v);
                  }}
                  className={`px-3.5 py-2 rounded-2xl border text-xs sm:text-sm font-black flex items-center gap-1.5 transition ${
                    !currentMeta.hasVerifiedSyllables
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                      : showSyllables
                        ? 'bg-rose-600 text-white border-rose-500 cursor-pointer'
                        : 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 cursor-pointer'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>{lang === 'zh' ? '音節分色' : 'Syllables'}</span>
                </button>

                {onSendToBoard && (
                  <button
                    type="button"
                    onClick={() => onSendToBoard(currentItem.en)}
                    className="px-3.5 py-2 rounded-2xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>{lang === 'zh' ? '送至板書' : 'Send to Board'}</span>
                  </button>
                )}
              </div>

              {/* 課本例句 + 同／反義詞區 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>
                        {lang === 'zh' ? '課本實用例句' : 'Example'}
                        {currentMeta.example?.unitTag ? ` (${currentMeta.example.unitTag})` : ''}
                      </span>
                    </div>
                    {currentMeta.example ? (
                      <>
                        <div className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                          {currentMeta.example.en}
                        </div>
                        {currentMeta.example.zh && (
                          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {currentMeta.example.zh}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs font-bold text-slate-400 mt-1">
                        {lang === 'zh' ? `可點「去單字館」或切換例句練習 ${currentItem.en}` : `Practice ${currentItem.en}`}
                      </div>
                    )}
                  </div>
                  {currentMeta.example?.en && (
                    <button
                      type="button"
                      onClick={() => speakSafeEnglish(currentMeta.example.en, { rate: 0.85 })}
                      className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 shrink-0 cursor-pointer"
                      title={lang === 'zh' ? '朗讀例句' : 'Speak Example'}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 flex flex-col justify-center gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 shrink-0">
                      {lang === 'zh' ? '同義詞：' : 'Syn:'}
                    </span>
                    {currentMeta.synonyms?.length > 0 ? (
                      currentMeta.synonyms.map((syn) => (
                        <button
                          key={syn}
                          type="button"
                          onClick={() => speakSafeEnglish(syn, { rate: 0.85 })}
                          className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold hover:bg-emerald-200 cursor-pointer"
                        >
                          {syn}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-black text-rose-700 dark:text-rose-400 shrink-0">
                      {lang === 'zh' ? '反義詞：' : 'Ant:'}
                    </span>
                    {currentMeta.antonyms?.length > 0 ? (
                      currentMeta.antonyms.map((ant) => (
                        <button
                          key={ant}
                          type="button"
                          onClick={() => speakSafeEnglish(ant, { rate: 0.85 })}
                          className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 text-xs font-bold hover:bg-rose-200 cursor-pointer"
                        >
                          {ant}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部本課單字快選條 */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                handleSelectUnitWord((activeIndex - 1 + baseVocab.length) % baseVocab.length)
              }
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={wordStripRef}
              className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5"
            >
              {baseVocab.map((w, idx) => {
                const isActive = !customEntry && idx === activeIndex % baseVocab.length;
                return (
                  <button
                    key={w.id || w.en}
                    type="button"
                    onClick={() => handleSelectUnitWord(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border shrink-0 transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    {w.en}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleSelectUnitWord((activeIndex + 1) % baseVocab.length)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* Mode 2：🃏 抽考閃卡（中央隨機出字 + 實體拖拉手把滑動遮卡） */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {subMode === 'flashcard' && activeFlashItem && (
        <div className="flex-1 min-h-0 flex flex-col justify-center items-center px-3 sm:px-6 py-4 max-w-3xl w-full mx-auto gap-4">
          <div className="w-full rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
            {/* 題面區 */}
            <div className="text-center space-y-3">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                {flashDirection === 'zh-en'
                  ? lang === 'zh' ? '看中文唸英文' : 'Speak the English word'
                  : flashDirection === 'en-zh'
                  ? lang === 'zh' ? '看英文說中文' : 'Say the Chinese meaning'
                  : lang === 'zh' ? '聽發音猜單字' : 'Listen and guess'}
                {' · '}
                {(flashIdx % baseVocab.length) + 1}/{baseVocab.length}
              </span>

              {flashDirection === 'zh-en' && (
                <div className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white py-2">
                  {activeFlashItem.zh || activeFlashItem.en}
                </div>
              )}

              {flashDirection === 'en-zh' && (
                <div className="flex items-center justify-center gap-3 py-2">
                  <span className="font-phonics text-4xl sm:text-6xl font-black text-slate-900 dark:text-white">
                    {activeFlashItem.en}
                  </span>
                  <button
                    type="button"
                    onClick={() => speakSafeEnglish(activeFlashItem.en, { rate: 0.85 })}
                    className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 cursor-pointer"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>
              )}

              {flashDirection === 'listen' && (
                <div className="py-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => speakSafeEnglish(activeFlashItem.en, { rate: 0.85 })}
                    className="px-6 py-4 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg flex items-center gap-2.5 shadow-lg cursor-pointer active:scale-95"
                  >
                    <Volume2 className="w-7 h-7" />
                    <span>{lang === 'zh' ? '點擊播音出題' : 'Play Word'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 答案＋可拖拉手把遮卡區 */}
            <div
              ref={curtainContainerRef}
              data-testid="flashcard-curtain-box"
              className="relative rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 min-h-[120px] flex flex-col items-center justify-center p-5 overflow-hidden select-none"
            >
              {/* 底層解答 */}
              <div className="text-center space-y-1">
                {flashDirection !== 'en-zh' && (
                  <div className="font-phonics text-3xl sm:text-5xl font-black text-emerald-700 dark:text-emerald-300">
                    {activeFlashItem.en}
                  </div>
                )}
                {flashDirection !== 'zh-en' && (
                  <div className="text-2xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-300">
                    {activeFlashItem.zh}
                  </div>
                )}
                {activeFlashMeta?.ipa && flashDirection !== 'en-zh' && (
                  <div className="font-mono text-xs sm:text-sm font-bold text-emerald-600/80 dark:text-emerald-400/80">
                    {phoneticSystem === 'kk' && activeFlashMeta.isUsIpa && activeFlashMeta.kk
                      ? activeFlashMeta.kk
                      : activeFlashMeta.ipa}
                  </div>
                )}
              </div>

              {/* 上層滑動實體手把遮卡（向右拖曳即可漸進拉開偷看） */}
              <div
                data-testid="flashcard-curtain-cover"
                onPointerDown={handleCurtainPointerDown}
                onPointerMove={handleCurtainPointerMove}
                onPointerUp={handleCurtainPointerUp}
                onPointerCancel={handleCurtainPointerUp}
                style={{ transform: `translateX(${curtainRevealPct}%)` }}
                className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing touch-none shadow-lg transition-transform duration-75"
              >
                <div className="flex items-center gap-1.5 bg-white/85 px-2.5 py-2 rounded-xl shadow-sm font-black text-xs">
                  <GripVertical className="w-4 h-4 text-amber-600" />
                  <span>{lang === 'zh' ? '向右拖開' : 'Slide'}</span>
                </div>
                <div className="font-black text-sm sm:text-base tracking-wide pr-4 opacity-90 flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4" />
                  <span>{lang === 'zh' ? '手把遮卡（可半拉提示）' : 'Slide Handle to Peek'}</span>
                </div>
              </div>
            </div>

            {/* 底部操作按鈕 */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleFlashStep(-1)}
                className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-black flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{lang === 'zh' ? '上一張' : 'Prev'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => speakSafeEnglish(activeFlashItem.en, { rate: 0.85 })}
                  className="px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-black flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{lang === 'zh' ? '朗讀' : 'Speak'}</span>
                </button>

                <button
                  type="button"
                  data-testid="flashcard-reveal-btn"
                  onClick={() => setCurtainRevealPct((p) => (p >= 95 ? 0 : 100))}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition ${
                    curtainRevealPct >= 95
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  }`}
                >
                  {curtainRevealPct >= 95 ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span>
                    {curtainRevealPct >= 95
                      ? lang === 'zh' ? '蓋上遮卡' : 'Hide'
                      : lang === 'zh' ? '一鍵揭曉' : 'Reveal'}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleFlashStep(1)}
                className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-black flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <span>{lang === 'zh' ? '下一張' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* Mode 3：🔗 中英文連連看（支援點選配對與滑鼠／觸控直接拉線配對） */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {subMode === 'match' && (
        <div className="flex-1 min-h-0 flex flex-col justify-center px-3 sm:px-6 py-3 max-w-5xl w-full mx-auto overflow-y-auto">
          <div className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            {lang === 'zh'
              ? '點擊左右卡片配對，或按住直接從英文拉線連到中文！配對成功即刻朗讀'
              : 'Tap or drag a line between matching English and Chinese cards!'}
          </div>

          <div
            ref={matchBoardRef}
            onPointerMove={handleMatchBoardPointerMove}
            onPointerUp={handleMatchBoardPointerUp}
            className="relative grid grid-cols-2 gap-8 sm:gap-16 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-md select-none touch-none"
          >
            {/* SVG 連線層（已配對實線 ＋ 拖拉中虛線） */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {matchedLines.map((ln) => (
                <line
                  key={ln.key}
                  x1={ln.x1}
                  y1={ln.y1}
                  x2={ln.x2}
                  y2={ln.y2}
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              ))}
              {dragLine && (
                <line
                  x1={dragLine.x1}
                  y1={dragLine.y1}
                  x2={dragLine.x2}
                  y2={dragLine.y2}
                  stroke="#6366f1"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />
              )}
            </svg>

            {/* 左欄：英文卡片 */}
            <div className="space-y-2.5 z-20">
              {matchPairs.map((pair) => {
                const isMatched = matchedKeys.has(pair.key);
                const isSelected = selectedLeftKey === pair.key;
                const isWrong = wrongFlashPair?.left === pair.key;

                return (
                  <button
                    key={`left_${pair.key}`}
                    ref={(el) => {
                      if (el) leftCardRefs.current.set(pair.key, el);
                      else leftCardRefs.current.delete(pair.key);
                    }}
                    type="button"
                    data-match-side="left"
                    data-match-key={pair.key}
                    onPointerDown={(e) => handleMatchPointerDown(e, 'left', pair.key)}
                    onClick={() => handleTapMatchCard('left', pair.key)}
                    disabled={isMatched}
                    className={`w-full px-4 py-3 sm:py-3.5 rounded-2xl border-2 font-phonics text-base sm:text-xl font-black text-left flex items-center justify-between transition cursor-pointer ${
                      isMatched
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300 opacity-75'
                        : isWrong
                        ? 'bg-rose-100 border-rose-500 text-rose-700 animate-pulse'
                        : isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md scale-102'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    <span className="truncate">{pair.en}</span>
                    <Volume2 className="w-4 h-4 opacity-50 shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>

            {/* 右欄：中文卡片（打亂順序） */}
            <div className="space-y-2.5 z-20">
              {matchRightOrder.map((pair) => {
                const isMatched = matchedKeys.has(pair.key);
                const isSelected = selectedRightKey === pair.key;
                const isWrong = wrongFlashPair?.right === pair.key;

                return (
                  <button
                    key={`right_${pair.key}`}
                    ref={(el) => {
                      if (el) rightCardRefs.current.set(pair.key, el);
                      else rightCardRefs.current.delete(pair.key);
                    }}
                    type="button"
                    data-match-side="right"
                    data-match-key={pair.key}
                    onPointerDown={(e) => handleMatchPointerDown(e, 'right', pair.key)}
                    onClick={() => handleTapMatchCard('right', pair.key)}
                    disabled={isMatched}
                    className={`w-full px-4 py-3 sm:py-3.5 rounded-2xl border-2 text-base sm:text-xl font-black text-right flex items-center justify-end transition cursor-pointer ${
                      isMatched
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300 opacity-75'
                        : isWrong
                        ? 'bg-rose-100 border-rose-500 text-rose-700 animate-pulse'
                        : isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md scale-102'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    <span className="truncate">{pair.zh}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {matchedKeys.size === matchPairs.length && matchPairs.length > 0 && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  soundEngine.click();
                  if (baseVocab.length > 6) {
                    setMatchBatchOffset((o) => (o + 6) % baseVocab.length);
                  }
                  setMatchRoundSeed((s) => s + 1);
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-lg cursor-pointer animate-bounce inline-flex items-center gap-2"
              >
                <PartyPopper className="w-4 h-4" />
                <span>{lang === 'zh' ? '全數配對完成！點我再來一組' : 'All Matched! Next Round'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VocabStudio;
