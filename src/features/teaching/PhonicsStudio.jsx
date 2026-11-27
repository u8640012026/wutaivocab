import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Volume2,
  RotateCcw,
  Sparkles,
  Turtle,
  Rabbit,
  PlusCircle,
  Plus,
  Minus,
  Copy,
  Ear,
  BookA,
  Layers,
  Headphones,
  CheckCircle2,
  PenTool,
  ShieldAlert,
  Star,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { INITIAL_CARDS, PRESET_DECKS } from '../phonics/data/phonicsData';
import { PhonicsCardView } from '../phonics/components/PhonicsCardView';
import { SoundBankModal } from '../phonics/components/SoundBankModal';
import { PhonicsListeningQuiz } from './PhonicsListeningQuiz';
import {
  blendPhonemeSequence,
  playCardSnapSound,
  playRemoveSound,
  speakWord,
} from '../phonics/utils/audio';
import { isElementarySafeWord } from '../../services/profanityFilter';
import { combinePhonicsRow, lookupWordMeaning } from './utils/phonicsCombine';

const MAX_PHONICS_ROWS = 4;

const VOWEL_TABS = [
  { id: 'short', nameZh: '短母音', nameEn: 'Short' },
  { id: 'teams', nameZh: '雙母音', nameEn: 'Teams' },
  { id: 'diphthongs', nameZh: '複合音', nameEn: 'Glides' },
  { id: 'silent_e', nameZh: '魔術 e', nameEn: 'Magic e' },
  { id: 'r_controlled', nameZh: '捲舌 R', nameEn: 'Bossy R' },
];

const VOWEL_CATEGORIES = new Set(['short_vowels', 'silent_e', 'vowel_teams', 'r_controlled']);

const makePlacedCard = (card, suffix = '') => ({
  instanceId: `placed_${card.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}${suffix}`,
  card,
});

const buildCardsFromGraphemes = (graphemes = [], cardMap) => {
  return graphemes
    .map((g, idx) => {
      const card = cardMap.get(g);
      return card ? makePlacedCard(card, `_${idx}`) : null;
    })
    .filter(Boolean);
};

export function PhonicsStudio({
  curriculumUnit = null,
  words = [],
  lang = 'zh',
  onSendToBoard,
}) {
  const [subMode, setSubMode] = useState('board'); // 'board' | 'quiz'
  const [pronunciationMode, setPronunciationMode] = useState('phoneme'); // 'phoneme' | 'word'
  const [isSlowBlending, setIsSlowBlending] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [safetyToast, setSafetyToast] = useState(null);

  const [highlightState, setHighlightState] = useState({ rowId: null, index: null });
  const [blendingRowId, setBlendingRowId] = useState(null);
  const [draggedMeta, setDraggedMeta] = useState(null); // { rowId, index }
  const [activeVowelTab, setActiveVowelTab] = useState('short');
  const [isTrayCollapsed, setIsTrayCollapsed] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const trayRef = useRef(null);
  const optionsMenuRef = useRef(null);

  const [allCards, setAllCards] = useState(() => {
    try {
      const saved = localStorage.getItem('phonics_custom_cards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const safeCustom = parsed.filter(
            (c) =>
              c &&
              c.grapheme &&
              isElementarySafeWord(c.grapheme) &&
              (!c.displayText || isElementarySafeWord(c.displayText)) &&
              (!c.sampleWord || isElementarySafeWord(c.sampleWord))
          );
          return [...INITIAL_CARDS, ...safeCustom];
        }
      }
    } catch {}
    return INITIAL_CARDS;
  });

  const [selectedCardIds, setSelectedCardIds] = useState(() => {
    const initialIds = new Set(PRESET_DECKS[0].cardIds);
    ['cd_ch', 'cd_sh', 'cd_ck', 'cd_ng', 'cd_wh', 'cd_ph', 'cd_th_u', 'cd_th_v'].forEach((id) =>
      initialIds.add(id)
    );
    return initialIds;
  });

  const cardByGrapheme = useMemo(() => {
    const map = new Map();
    allCards.forEach((c) => {
      if (!map.has(c.grapheme)) map.set(c.grapheme, c);
    });
    return map;
  }, [allCards]);

  // 預設中央 1 排（c-a-t），支援按 +/- 上下擴展對照最多 4 排
  const [rows, setRows] = useState(() => {
    const defaultCards = ['c', 'a', 't']
      .map((g, idx) => {
        const found = INITIAL_CARDS.find((c) => c.grapheme === g);
        return found ? makePlacedCard(found, `_init_${idx}`) : null;
      })
      .filter(Boolean);
    return [{ id: 'row_1', cards: defaultCards }];
  });
  const [activeRowId, setActiveRowId] = useState('row_1');

  const showSafetyAlert = useCallback((msg) => {
    setSafetyToast(msg);
    setTimeout(() => setSafetyToast(null), 2800);
  }, []);

  useEffect(() => {
    if (!isOptionsOpen) return undefined;
    const handleOutside = (e) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) {
        setIsOptionsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOptionsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOptionsOpen]);

  // 當課程單元切換時：若在白板模式下，第一排更新為本課第 1 個範例字組（若有），並依單元規則自動切換母音百寶箱預設分頁
  const prevUnitIdRef = useRef(null);
  useEffect(() => {
    if (!curriculumUnit || curriculumUnit.id === prevUnitIdRef.current) return;
    prevUnitIdRef.current = curriculumUnit.id;

    const targets = curriculumUnit.targetGraphemes || [];
    if (targets.some((g) => g.includes('_'))) {
      setActiveVowelTab('silent_e');
    } else if (targets.some((g) => ['ee', 'ea', 'ai', 'ay', 'oa', 'ow', 'igh', 'ie', 'ue', 'ui', 'y(i)'].includes(g))) {
      setActiveVowelTab('teams');
    } else if (targets.some((g) => ['oi', 'oy', 'ou', 'ow(au)', 'oo', 'au', 'aw'].includes(g))) {
      setActiveVowelTab('diphthongs');
    } else if (targets.some((g) => ['ar', 'er', 'ir', 'or', 'ur'].includes(g))) {
      setActiveVowelTab('r_controlled');
    } else {
      setActiveVowelTab('short');
    }

    const demoRow = curriculumUnit.contrastDemoRows?.[0];
    if (Array.isArray(demoRow) && demoRow.length > 0) {
      const built = buildCardsFromGraphemes(demoRow, cardByGrapheme);
      if (built.length > 0) {
        const rowId = `row_${Date.now()}`;
        setRows([{ id: rowId, cards: built }]);
        setActiveRowId(rowId);
      }
    }
  }, [curriculumUnit, cardByGrapheme]);

  const activeVowels = useMemo(() => {
    switch (activeVowelTab) {
      case 'teams':
        return allCards.filter(
          (c) =>
            c.category === 'vowel_teams' &&
            ['ee', 'ea', 'ai', 'ay', 'oa', 'ow', 'igh', 'ew', 'ie', 'ue', 'ui', 'y(i)'].includes(c.grapheme)
        );
      case 'diphthongs':
        return allCards.filter(
          (c) =>
            c.category === 'vowel_teams' &&
            ['ou', 'ow(au)', 'oi', 'oy', 'oo', 'au', 'aw'].includes(c.grapheme)
        );
      case 'silent_e':
        return allCards.filter((c) => c.category === 'silent_e');
      case 'r_controlled':
        return allCards.filter((c) => c.category === 'r_controlled');
      case 'short':
      default:
        return allCards.filter(
          (c) => c.category === 'short_vowels' && ['a', 'e', 'i', 'o', 'u'].includes(c.grapheme)
        );
    }
  }, [allCards, activeVowelTab]);

  // 本課目標音組置頂（含母音與子音讓老師一目了然），加上候用匣其他子音卡
  const { unitTargetCards, stagingConsonants } = useMemo(() => {
    const unitSet = new Set(curriculumUnit?.targetGraphemes || []);
    const targetList = [];
    const seenIds = new Set();

    (curriculumUnit?.targetGraphemes || []).forEach((g) => {
      const c = cardByGrapheme.get(g);
      if (c && !seenIds.has(c.id)) {
        seenIds.add(c.id);
        targetList.push(c);
      }
    });

    const consonants = allCards.filter(
      (c) =>
        selectedCardIds.has(c.id) &&
        !VOWEL_CATEGORIES.has(c.category) &&
        !unitSet.has(c.grapheme)
    );

    return { unitTargetCards: targetList, stagingConsonants: consonants };
  }, [allCards, selectedCardIds, curriculumUnit, cardByGrapheme]);

  // ── 音素白板排組操作 ──
  const handleLoadContrastDemo = () => {
    if (!curriculumUnit?.contrastDemoRows?.length) return;
    playCardSnapSound();
    const nextRows = curriculumUnit.contrastDemoRows
      .slice(0, MAX_PHONICS_ROWS)
      .map((graphemes, rIdx) => ({
        id: `demo_row_${Date.now()}_${rIdx}`,
        cards: buildCardsFromGraphemes(graphemes, cardByGrapheme),
      }))
      .filter((r) => r.cards.length > 0);
    if (nextRows.length > 0) {
      setRows(nextRows);
      setActiveRowId(nextRows[0].id);
    }
  };

  const handleAddRow = () => {
    if (rows.length >= MAX_PHONICS_ROWS) return;
    playCardSnapSound();
    const newId = `row_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    setRows((prev) => [...prev, { id: newId, cards: [] }]);
    setActiveRowId(newId);
  };

  const handleDuplicateRow = (sourceRowId) => {
    if (rows.length >= MAX_PHONICS_ROWS) return;
    playCardSnapSound();
    const newId = `row_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === sourceRowId);
      if (idx === -1) return prev;
      const clonedCards = prev[idx].cards.map((pc, cIdx) => makePlacedCard(pc.card, `_dup_${cIdx}`));
      const next = [...prev];
      next.splice(idx + 1, 0, { id: newId, cards: clonedCards });
      return next;
    });
    setActiveRowId(newId);
  };

  const handleRemoveRow = (rowId) => {
    if (rows.length <= 1) return;
    playRemoveSound();
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== rowId);
      if (activeRowId === rowId && next[0]) {
        setActiveRowId(next[0].id);
      }
      return next;
    });
  };

  const handleClearRow = (rowId) => {
    playRemoveSound();
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, cards: [] } : r)));
  };

  // 點下方音素卡：直接加入目前作用排（activeRowId）
  const handlePlaceToActiveRow = useCallback(
    (card) => {
      playCardSnapSound();
      const targetId = activeRowId;
      setRows((prev) => {
        const hasTarget = prev.some((r) => r.id === targetId);
        const effectiveId = hasTarget ? targetId : prev[0]?.id;
        return prev.map((r) =>
          r.id === effectiveId ? { ...r, cards: [...r.cards, makePlacedCard(card)] } : r
        );
      });
    },
    [activeRowId]
  );

  const handleRemoveCardFromRow = (rowId, instanceId) => {
    playRemoveSound();
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, cards: r.cards.filter((pc) => pc.instanceId !== instanceId) } : r
      )
    );
  };

  // 拖放處理：支援從下方匣拖入（疊到舊卡上可直接原地替換！）、支援同排或跨排調整
  const handleDropOnSlot = (e, targetRowId, targetIndex, replaceExisting = false) => {
    e.preventDefault();
    e.stopPropagation();
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;

    try {
      const payload = JSON.parse(raw);
      setActiveRowId(targetRowId);

      // 1. 排內／跨排移動已放置卡片
      if (payload.isInternalReorder && payload.sourceRowId && typeof payload.sourceIndex === 'number') {
        playCardSnapSound();
        setRows((prev) => {
          const srcRow = prev.find((r) => r.id === payload.sourceRowId);
          if (!srcRow || !srcRow.cards[payload.sourceIndex]) return prev;
          const moving = srcRow.cards[payload.sourceIndex];

          if (payload.sourceRowId === targetRowId) {
            const nextCards = [...srcRow.cards];
            nextCards.splice(payload.sourceIndex, 1);
            const dest =
              typeof targetIndex === 'number'
                ? Math.min(targetIndex, nextCards.length)
                : nextCards.length;
            nextCards.splice(dest, 0, moving);
            return prev.map((r) => (r.id === targetRowId ? { ...r, cards: nextCards } : r));
          }

          return prev.map((r) => {
            if (r.id === payload.sourceRowId) {
              return { ...r, cards: r.cards.filter((_, idx) => idx !== payload.sourceIndex) };
            }
            if (r.id === targetRowId) {
              const nextCards = [...r.cards];
              const dest = typeof targetIndex === 'number' ? Math.min(targetIndex, nextCards.length) : nextCards.length;
              nextCards.splice(dest, 0, moving);
              return { ...r, cards: nextCards };
            }
            return r;
          });
        });
        return;
      }

      // 2. 從下方百寶箱／子音匣拖入新卡片
      if (payload.id && payload.grapheme) {
        playCardSnapSound();
        const newPlaced = makePlacedCard(payload);
        setRows((prev) =>
          prev.map((r) => {
            if (r.id !== targetRowId) return r;
            const nextCards = [...r.cards];
            if (replaceExisting && typeof targetIndex === 'number' && targetIndex < nextCards.length) {
              nextCards[targetIndex] = newPlaced;
            } else if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= nextCards.length) {
              nextCards.splice(targetIndex, 0, newPlaced);
            } else {
              nextCards.push(newPlaced);
            }
            return { ...r, cards: nextCards };
          })
        );
      }
    } catch {}
  };

  // 單排：連綴拼讀（含三層國小安全防護）
  const handleBlendRow = async (row, combinedInfo) => {
    if (row.cards.length === 0 || blendingRowId) return;
    if (!combinedInfo.isSafe) {
      showSafetyAlert(
        lang === 'zh'
          ? '此組合為不適合國小課堂的字詞，系統已自動靜音攔截！'
          : 'Blocked inappropriate classroom combination.'
      );
      return;
    }

    setBlendingRowId(row.id);
    try {
      const rawCards = row.cards.map((pc) => pc.card);
      await blendPhonemeSequence(
        rawCards,
        isSlowBlending,
        (idx) => setHighlightState({ rowId: idx === null ? null : row.id, index: idx }),
        combinedInfo.combinedWord,
        pronunciationMode
      );
    } finally {
      setHighlightState({ rowId: null, index: null });
      setBlendingRowId(null);
    }
  };

  // 單排：直接朗讀整字（例如點 cate 直接唸出 cate）
  const handleSpeakWholeRowWord = async (combinedInfo) => {
    if (!combinedInfo.combinedWord) return;
    if (!combinedInfo.isSafe) {
      showSafetyAlert(
        lang === 'zh'
          ? '此組合為不適合國小課堂的字詞，系統已自動靜音攔截！'
          : 'Blocked inappropriate classroom word.'
      );
      return;
    }
    await speakWord(combinedInfo.combinedWord, isSlowBlending ? 0.72 : 0.88);
  };

  const handleToggleCardInBank = (cardId) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const handleSelectMultipleInBank = (cardIds, add) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      cardIds.forEach((id) => {
        if (add) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const handleAddCustomCard = (newCard) => {
    if (
      !newCard ||
      !isElementarySafeWord(newCard.grapheme) ||
      (newCard.displayText && !isElementarySafeWord(newCard.displayText)) ||
      (newCard.sampleWord && !isElementarySafeWord(newCard.sampleWord))
    ) {
      showSafetyAlert(
        lang === 'zh'
          ? '此自訂字卡包含不適合國小課堂的字詞，已攔截！'
          : 'Blocked unsafe custom card!'
      );
      return;
    }
    setAllCards((prev) => {
      const updated = [...prev, newCard];
      try {
        localStorage.setItem('phonics_custom_cards', JSON.stringify(updated.filter((c) => c.isCustom)));
      } catch {}
      return updated;
    });
    setSelectedCardIds((prev) => new Set(prev).add(newCard.id));
  };

  const scrollTray = (dir) => {
    if (trayRef.current) {
      trayRef.current.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative">
      {/* 精簡子模式列：[自然拼音 | 聽音小測] + 目標標籤 │ [＋加一排][卡匣開關][⚙️ 選項] */}
      <div data-testid="studio-subbar" className="w-full px-3 sm:px-5 md:[padding-left:var(--studio-subbar-pl,20px)] py-1.5 flex flex-wrap items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setSubMode('board')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                subMode === 'board'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{lang === 'zh' ? '自然拼音' : 'Blending'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSubMode('quiz')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                subMode === 'quiz'
                  ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>{lang === 'zh' ? '聽音小測' : 'Listening Quiz'}</span>
            </button>
          </div>

          {curriculumUnit && (
            <span className="px-2 py-0.5 rounded-xl bg-purple-100/90 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200 text-xs font-black flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>{curriculumUnit.phonicsLabel}</span>
            </span>
          )}
        </div>

        {/* 右側精簡 3 按鈕：＋加一排 / 卡匣收合 / ⚙️選項彈窗 */}
        {subMode === 'board' && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAddRow}
              disabled={rows.length >= MAX_PHONICS_ROWS}
              className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-black flex items-center gap-1 disabled:opacity-40 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? `加一排 (${rows.length}/${MAX_PHONICS_ROWS})` : `Row (${rows.length}/${MAX_PHONICS_ROWS})`}</span>
            </button>

            <button
              type="button"
              data-testid="toggle-phonics-tray"
              onClick={() => setIsTrayCollapsed((v) => !v)}
              className={`px-2.5 py-1 rounded-xl border text-xs font-black flex items-center gap-1 transition cursor-pointer ${
                isTrayCollapsed
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white border-slate-300 dark:border-slate-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isTrayCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{lang === 'zh' ? (isTrayCollapsed ? '展開卡匣' : '收合卡匣') : (isTrayCollapsed ? 'Show Tray' : 'Hide Tray')}</span>
            </button>

            <div ref={optionsMenuRef} className="relative">
              <button
                type="button"
                data-testid="phonics-options-trigger"
                onClick={() => setIsOptionsOpen((v) => !v)}
                className={`px-2.5 py-1 rounded-xl border text-xs font-black flex items-center gap-1 transition cursor-pointer ${
                  isOptionsOpen
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '選項' : 'Options'}</span>
              </button>

              {isOptionsOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2.5 space-y-1.5 z-50">
                  {curriculumUnit?.contrastDemoRows?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        handleLoadContrastDemo();
                        setIsOptionsOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-black flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{lang === 'zh' ? '載入本課對照範例' : 'Load Unit Contrast Demo'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsSlowBlending((v) => !v)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {isSlowBlending ? <Turtle className="w-3.5 h-3.5 text-amber-500" /> : <Rabbit className="w-3.5 h-3.5 text-indigo-500" />}
                      <span>{lang === 'zh' ? '拼讀速度' : 'Blend Speed'}</span>
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {isSlowBlending ? (lang === 'zh' ? '慢速' : 'Slow') : (lang === 'zh' ? '流暢' : 'Normal')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPronunciationMode((m) => (m === 'phoneme' ? 'word' : 'phoneme'))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {pronunciationMode === 'phoneme' ? (
                        <Ear className="w-3.5 h-3.5 text-indigo-500" />
                      ) : (
                        <BookA className="w-3.5 h-3.5 text-purple-500" />
                      )}
                      <span>{lang === 'zh' ? '點卡發音' : 'Tap Sound'}</span>
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {pronunciationMode === 'phoneme'
                        ? lang === 'zh' ? '純音素' : 'Phoneme'
                        : lang === 'zh' ? '範例字' : 'Anchor'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setIsBankModalOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '開啟八大卡池選牌' : 'Open Sound Banks'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 安全警告通知條 */}
      {safetyToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs sm:text-sm font-black shadow-xl flex items-center gap-2 animate-pop">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{safetyToast}</span>
        </div>
      )}

      {subMode === 'quiz' ? (
        <div className="flex-1 overflow-y-auto">
          <PhonicsListeningQuiz
            allCards={allCards}
            selectedCardIds={selectedCardIds}
            curriculumUnit={curriculumUnit}
            lang={lang}
            onReturnToBoard={() => setSubMode('board')}
          />
        </div>
      ) : (
        <>
          {/* 中央多排對齊磁吸拼讀白板 */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 flex flex-col justify-center gap-3 max-w-6xl w-full mx-auto">
            {rows.map((row, rIdx) => {
              const isActive = row.id === activeRowId;
              const combinedInfo = combinePhonicsRow(row.cards);
              const wordInfo = combinedInfo.isSafe
                ? lookupWordMeaning(combinedInfo.combinedWord, words)
                : null;
              const slotCount = Math.max(row.cards.length === 0 ? 3 : row.cards.length + 1, 3);
              const isRowBlending = blendingRowId === row.id;

              return (
                <div
                  key={row.id}
                  onClick={() => setActiveRowId(row.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnSlot(e, row.id, row.cards.length, false)}
                  className={`relative rounded-2xl sm:rounded-3xl border-2 p-2.5 sm:p-4 transition-all flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-white/95 dark:bg-slate-900/95 border-indigo-400 dark:border-indigo-500 shadow-lg ring-2 ring-indigo-500/15'
                      : 'bg-white/75 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                  }`}
                >
                  {/* 左側：排號 + 卡片槽位區（保留足夠上方內距，避免字卡右上角紅色刪除鈕被水平捲動容器裁切） */}
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-x-auto pt-3.5 pb-2 px-1 scrollbar-none">
                    {/* 排號標記 */}
                    <div className="flex flex-col items-center justify-center shrink-0 w-7 sm:w-8">
                      <span
                        className={`w-7 h-7 rounded-xl font-mono font-black text-xs flex items-center justify-center ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {rIdx + 1}
                      </span>
                      {isActive && rows.length > 1 && (
                        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {lang === 'zh' ? '使用中' : 'Active'}
                        </span>
                      )}
                    </div>

                    {/* 固定寬度卡片軌道，確保多排上下精準對齊 */}
                    <div className="flex flex-nowrap items-center gap-2 sm:gap-3">
                      {Array.from({ length: slotCount }).map((_, slotIdx) => {
                        const placed = row.cards[slotIdx];
                        const isHighlighted =
                          highlightState.rowId === row.id &&
                          (highlightState.index === slotIdx || highlightState.index === -1);

                        if (placed) {
                          const isBeingDragged =
                            draggedMeta?.rowId === row.id && draggedMeta?.index === slotIdx;
                          return (
                            <div
                              key={placed.instanceId}
                              draggable
                              onDragStart={(e) => {
                                setDraggedMeta({ rowId: row.id, index: slotIdx });
                                e.dataTransfer.setData(
                                  'text/plain',
                                  JSON.stringify({
                                    isInternalReorder: true,
                                    sourceRowId: row.id,
                                    sourceIndex: slotIdx,
                                  })
                                );
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragEnd={() => setDraggedMeta(null)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => handleDropOnSlot(e, row.id, slotIdx, true)}
                              className={`relative shrink-0 transition-all ${
                                isBeingDragged ? 'opacity-40 scale-95' : ''
                              }`}
                            >
                              <PhonicsCardView
                                card={placed.card}
                                size="lg"
                                isHighlighted={isHighlighted}
                                showRemove={true}
                                pronunciationMode={pronunciationMode}
                                onRemove={() => handleRemoveCardFromRow(row.id, placed.instanceId)}
                                className="hover:scale-103"
                              />
                            </div>
                          );
                        }

                        return (
                          <div
                            key={`empty_${row.id}_${slotIdx}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDropOnSlot(e, row.id, slotIdx, false)}
                            className="w-[66px] h-[84px] sm:w-20 sm:h-24 md:w-24 md:h-28 shrink-0 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30 hover:border-indigo-400 flex flex-col items-center justify-center text-slate-400 transition-colors"
                          >
                            <PlusCircle className="w-5 h-5 opacity-45" />
                            <span className="text-[10px] font-bold opacity-60 hidden sm:inline mt-0.5">
                              {slotIdx + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 右側：整字朗讀膠囊 + 連綴拼讀 + 複製 / 送板書 / 清空 / 刪排 */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-2 lg:pt-0 lg:pl-4 min-w-[210px]">
                    {/* 整字結果膠囊：點一下直接唸整字 */}
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {row.cards.length > 0 ? (
                        !combinedInfo.isSafe ? (
                          <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-black flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4" />
                            <span>{lang === 'zh' ? '已攔截不雅詞' : 'Unsafe'}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeakWholeRowWord(combinedInfo);
                            }}
                            title={lang === 'zh' ? '點擊直接朗讀整個單字' : 'Click to pronounce whole word'}
                            className={`px-3.5 py-1.5 rounded-2xl border-2 flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-xs ${
                              wordInfo
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100'
                                : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100'
                            }`}
                          >
                            <Volume2 className="w-4 h-4 shrink-0" />
                            <span className="font-phonics text-xl sm:text-2xl font-black tracking-wide">
                              {combinedInfo.combinedWord}
                            </span>
                            {wordInfo && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{wordInfo.meaningZh}</span>
                              </span>
                            )}
                            {combinedInfo.isMagicE && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-orange-500 text-white">
                                Magic e
                              </span>
                            )}
                          </button>
                        )
                      ) : (
                        <span className="text-xs font-bold text-slate-400 italic">
                          {lang === 'zh' ? '點擊下方音素加入此排' : 'Tap tiles below to add'}
                        </span>
                      )}
                    </div>

                    {/* 該排操作按鈕列 */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <button
                        type="button"
                        disabled={row.cards.length === 0 || Boolean(blendingRowId)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBlendRow(row, combinedInfo);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black text-white flex items-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-40 ${
                          isRowBlending
                            ? 'bg-indigo-700 animate-pulse'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isRowBlending ? (lang === 'zh' ? '拼讀中' : 'Blending') : (lang === 'zh' ? '連綴拼讀' : 'Blend')}</span>
                      </button>

                      {onSendToBoard && row.cards.length > 0 && combinedInfo.isSafe && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendToBoard(combinedInfo.combinedWord);
                          }}
                          title={lang === 'zh' ? '送到四線板書示範寫字' : 'Send to Handwriting Board'}
                          className="p-1.5 px-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{lang === 'zh' ? '板書' : 'Write'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={rows.length >= MAX_PHONICS_ROWS}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateRow(row.id);
                        }}
                        title={lang === 'zh' ? '複製此排到下方做對比' : 'Duplicate row below'}
                        className="p-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{lang === 'zh' ? '複製' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={row.cards.length === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearRow(row.id);
                        }}
                        title={lang === 'zh' ? '清空此排' : 'Clear row'}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRow(row.id);
                          }}
                          title={lang === 'zh' ? '刪除此排' : 'Remove row'}
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 底部兩欄音素選擇區（可一鍵收合展開，保留最大拼讀白板空間）：母音百寶箱 + 本課與候用子音匣 */}
          {!isTrayCollapsed && (
          <div data-testid="phonics-bottom-tray" className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2 sm:p-3 shadow-lg shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch gap-2.5">
              {/* 左側：母音百寶箱 */}
              <div className="flex flex-col justify-between bg-rose-50/70 dark:bg-rose-950/20 border-2 border-rose-300 dark:border-rose-800/60 rounded-2xl p-2 shrink-0 md:max-w-[460px]">
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-xs font-black text-rose-800 dark:text-rose-300">
                      {lang === 'zh' ? '母音百寶箱' : 'Vowel Hub'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    {VOWEL_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveVowelTab(tab.id)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all shrink-0 cursor-pointer ${
                          activeVowelTab === tab.id
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100'
                        }`}
                      >
                        {lang === 'zh' ? tab.nameZh : tab.nameEn}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-1 scrollbar-none min-h-[74px]">
                  {activeVowels.map((vowel) => (
                    <div key={`v_${vowel.id}`} className="shrink-0">
                      <PhonicsCardView
                        card={vowel}
                        size="sm"
                        pronunciationMode={pronunciationMode}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', JSON.stringify(vowel));
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={() => handlePlaceToActiveRow(vowel)}
                        className="w-14 h-17 sm:w-16 sm:h-20 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 右側：本課置頂音組 + 子音字卡專區 */}
              <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-2 relative overflow-hidden">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                      {lang === 'zh' ? '子音＆本課音組專區' : 'Unit & Consonant Tray'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {unitTargetCards.length + stagingConsonants.length}
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollTray('left')}
                      aria-label="Scroll left"
                      className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollTray('right')}
                      aria-label="Scroll right"
                      className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  ref={trayRef}
                  className="flex-1 flex items-center gap-2.5 overflow-x-auto py-1 px-1 scroll-smooth scrollbar-none min-h-[74px]"
                >
                  {unitTargetCards.map((card) => (
                    <div key={`unit_${card.id}`} className="relative shrink-0 pt-1">
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 px-1.5 py-0 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black shadow-xs pointer-events-none whitespace-nowrap inline-flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>{lang === 'zh' ? '本課' : 'Unit'}</span>
                      </span>
                      <PhonicsCardView
                        card={card}
                        size="sm"
                        pronunciationMode={pronunciationMode}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', JSON.stringify(card));
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={() => handlePlaceToActiveRow(card)}
                        className="w-14 h-17 sm:w-16 sm:h-20 hover:scale-105 ring-2 ring-amber-400"
                      />
                    </div>
                  ))}

                  {stagingConsonants.map((card) => (
                    <div key={`stg_${card.id}`} className="shrink-0 pt-1">
                      <PhonicsCardView
                        card={card}
                        size="sm"
                        pronunciationMode={pronunciationMode}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', JSON.stringify(card));
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={() => handlePlaceToActiveRow(card)}
                        className="w-14 h-17 sm:w-16 sm:h-20 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}
        </>
      )}

      {/* 八大自然發音卡池 */}
      <SoundBankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        allCards={allCards}
        selectedCardIds={selectedCardIds}
        onToggleCard={handleToggleCardInBank}
        onSelectMultiple={handleSelectMultipleInBank}
        onClearAllSelected={() => setSelectedCardIds(new Set())}
        onAddCustomCard={handleAddCustomCard}
        onLoadPreset={(preset) => setSelectedCardIds(new Set(preset.cardIds))}
        lang={lang}
      />
    </div>
  );
}

export default PhonicsStudio;
