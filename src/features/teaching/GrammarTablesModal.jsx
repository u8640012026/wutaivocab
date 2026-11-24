import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Volume2, BookOpen, Sparkles, Star } from 'lucide-react';
import { GrammarIcon } from './components/GrammarIcon';
import {
  ELEMENTARY_GRAMMAR_TABLES,
  GRAMMAR_ROLE_STYLES,
  getRelevantGrammarTableIds,
} from './data/grammarTablesData';
import { speakEnglish, soundEngine } from '../../services/audio';
import { isElementarySafeWord } from '../../services/profanityFilter';

function renderHighlightedSentence(sentence, highlightText) {
  if (!highlightText || typeof sentence !== 'string') return sentence;
  const parts = highlightText
    .split(/\s*(?:\/|\.\.\.)\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return sentence;

  const escaped = parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const segments = sentence.split(regex);

  return segments.map((seg, idx) => {
    const matched = parts.some((p) => p.toLowerCase() === seg.toLowerCase());
    if (!matched) return <React.Fragment key={idx}>{seg}</React.Fragment>;
    return (
      <span
        key={idx}
        className="px-1.5 py-0.5 mx-0.5 rounded-md bg-amber-200/80 dark:bg-amber-700/50 text-amber-950 dark:text-amber-100 font-black underline decoration-amber-500/70 decoration-2 underline-offset-4"
      >
        {seg}
      </span>
    );
  });
}

export function GrammarTablesModal({
  isOpen,
  onClose,
  selectedBook = '3',
  selectedUnit = '0',
  lang = 'zh',
}) {
  const isZh = lang !== 'en';

  const relevantIds = useMemo(
    () => getRelevantGrammarTableIds(selectedBook, selectedUnit),
    [selectedBook, selectedUnit]
  );
  const relevantSet = useMemo(() => new Set(relevantIds), [relevantIds]);

  const [activeTableId, setActiveTableId] = useState(
    () => relevantIds[0] || ELEMENTARY_GRAMMAR_TABLES[0]?.id || 'be_verbs'
  );
  const [speakingIdx, setSpeakingIdx] = useState(-1);

  // 每次開啟彈窗或切換冊課時，自動聚焦第一張本課關聯的文法表
  useEffect(() => {
    if (!isOpen) return;
    setActiveTableId(relevantIds[0] || ELEMENTARY_GRAMMAR_TABLES[0]?.id || 'be_verbs');
    setSpeakingIdx(-1);
  }, [isOpen, relevantIds]);

  // Escape 鍵關閉彈窗
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const activeTable = useMemo(
    () =>
      ELEMENTARY_GRAMMAR_TABLES.find((t) => t.id === activeTableId) ||
      ELEMENTARY_GRAMMAR_TABLES[0],
    [activeTableId]
  );

  const handleSelectTable = useCallback((tableId) => {
    try {
      soundEngine.click();
    } catch {
      // ignore audio init error
    }
    setActiveTableId(tableId);
    setSpeakingIdx(-1);
  }, []);

  const handleSpeakExample = useCallback((text, idx) => {
    if (!text || !isElementarySafeWord(text)) return;
    setSpeakingIdx(idx);
    try {
      speakEnglish(text);
    } catch {
      // ignore TTS failure
    }
    window.setTimeout(() => {
      setSpeakingIdx((curr) => (curr === idx ? -1 : curr));
    }, 1500);
  }, []);

  if (!isOpen || !activeTable) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label={isZh ? '國小十大視覺化文法統整表' : 'Elementary Visual Grammar Tables'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-6xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 text-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-5 h-5 shrink-0 text-amber-200" />
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black truncate">
                {isZh ? '國小英語十大視覺文法表' : '10 Visual Grammar Tables (B1-B8)'}
              </h2>
              <p className="text-xs text-blue-100 truncate">
                {relevantIds.length > 0
                  ? isZh
                    ? `已依目前 B${selectedBook} 單元自動標記 ${relevantIds.length} 張相關文法表`
                    : `${relevantIds.length} table(s) matched to Book ${selectedBook}`
                  : isZh
                    ? '完整統整 Here We Go B1-B8 核心句型規則'
                    : 'Complete Here We Go B1-B8 core grammar guide'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isZh ? '關閉文法表' : 'Close grammar tables'}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Layout: Sidebar + Content */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar / Mobile Horizontal Strip */}
          <nav
            aria-label={isZh ? '文法表選單' : 'Grammar table list'}
            className="md:w-72 lg:w-80 shrink-0 bg-slate-50 dark:bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-1.5"
          >
            {ELEMENTARY_GRAMMAR_TABLES.map((table) => {
              const isSelected = table.id === activeTable.id;
              const isRelevant = relevantSet.has(table.id);

              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => handleSelectTable(table.id)}
                  data-grammar-tab={table.id}
                  className={`shrink-0 md:shrink text-left px-3 py-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : isRelevant
                        ? 'bg-amber-50/90 dark:bg-amber-950/35 text-slate-800 dark:text-slate-100 border-amber-300 dark:border-amber-700/70 hover:bg-amber-100/80 dark:hover:bg-amber-900/40'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center" aria-hidden="true">
                    <GrammarIcon name={table.icon} className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold truncate">
                        {isZh ? table.titleZh : table.titleEn}
                      </span>
                    </div>
                    {isRelevant && (
                      <span
                        className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                          isSelected
                            ? 'bg-amber-300 text-amber-950'
                            : 'bg-amber-200/90 text-amber-900 dark:bg-amber-800/80 dark:text-amber-100'
                        }`}
                      >
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {isZh ? '本課推薦' : 'This Unit'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Main Detail Panel */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Title + Subtitle + Unit Tags */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0" aria-hidden="true">
                    <GrammarIcon name={activeTable.icon} className="w-5 h-5" />
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {isZh ? activeTable.titleZh : activeTable.titleEn}
                  </h3>
                  {relevantSet.has(activeTable.id) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {isZh ? '本單元重點文法' : 'Matched to Current Unit'}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300">
                  {activeTable.subtitleZh}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {activeTable.linkedBooks.map((bk) => (
                  <span
                    key={bk}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${
                      String(bk) === String(selectedBook)
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/60 dark:text-indigo-200 dark:border-indigo-700'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    Book {bk}
                  </span>
                ))}
              </div>
            </div>

            {/* Classroom Chant Banner */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800/70 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base font-extrabold text-amber-950 dark:text-amber-100 leading-relaxed">
                {activeTable.mnemonicZh}
              </p>
            </div>

            {/* Color-Coded Comparison Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <table className="w-full text-left border-collapse min-w-[540px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    {activeTable.columns.map((col) => {
                      const roleStyle = GRAMMAR_ROLE_STYLES[col.role] || GRAMMAR_ROLE_STYLES.note;
                      return (
                        <th
                          key={col.key}
                          className={`px-3.5 py-3 text-xs sm:text-sm font-black border-r last:border-r-0 border-slate-200/80 dark:border-slate-700/80 ${roleStyle.chipClass}`}
                        >
                          {isZh ? col.labelZh : col.labelEn}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {activeTable.rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {activeTable.columns.map((col) => {
                        const roleStyle = GRAMMAR_ROLE_STYLES[col.role] || GRAMMAR_ROLE_STYLES.note;
                        return (
                          <td
                            key={col.key}
                            className={`px-3.5 py-3 text-sm sm:text-base font-semibold border-r last:border-r-0 border-slate-200/70 dark:border-slate-700/70 align-top ${roleStyle.cellClass}`}
                          >
                            {row[col.key]}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Click-to-Speak Examples */}
            <div className="space-y-2.5">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-indigo-500" />
                <span>{isZh ? '點擊句卡立即發音示範' : 'Tap Any Example to Hear TTS'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {activeTable.examples.map((ex, idx) => {
                  const isSpeaking = speakingIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSpeakExample(ex.en, idx)}
                      className={`text-left p-3.5 rounded-2xl border-2 transition-all group ${
                        isSpeaking
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 shadow-md scale-[1.01]'
                          : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                          {renderHighlightedSentence(ex.en, ex.highlight)}
                        </p>
                        <Volume2
                          className={`w-4 h-4 shrink-0 mt-1 transition-colors ${
                            isSpeaking
                              ? 'text-indigo-600 dark:text-indigo-300 animate-pulse'
                              : 'text-slate-400 group-hover:text-indigo-500'
                          }`}
                        />
                      </div>
                      <p className="mt-1.5 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {ex.zh}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
