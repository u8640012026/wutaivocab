import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Home,
  Sun,
  Moon,
  Languages,
  Maximize,
  Minimize,
  GraduationCap,
  ChevronDown,
  Settings,
  Check,
  BookOpen,
  Sparkles,
  Layers,
  Puzzle,
  PenTool,
  Type,
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';
import { getAvailableSentences } from '../../data/sentencePatterns';
import {
  CURRICULUM_BOOKS,
  getUnitsForBook,
  getCurriculumUnit,
  getCurriculumUnitVocab,
  getTeacherZoneBooks,
} from './data/curriculumUnits';
import { PhonicsStudio } from './PhonicsStudio';
import { BoardStudio } from './BoardStudio';
import { VocabStudio } from './VocabStudio';
import { SentenceStudio } from './SentenceStudio';
import { ClassroomDock } from './ClassroomDock';

const SESSION_STORAGE_KEY = 'wutai_teaching_state_v1';

const MAIN_TABS = [
  { id: 'phonics', Icon: Type, labelZh: '拼音', labelEn: 'Phonics' },
  { id: 'vocab', Icon: Layers, labelZh: '單字', labelEn: 'Vocab' },
  { id: 'sentence', Icon: Puzzle, labelZh: '句型', labelEn: 'Sentences' },
  { id: 'board', Icon: PenTool, labelZh: '板書', labelEn: 'Board' },
];

const readInitialStudioState = () => {
  let saved = {};
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') saved = parsed;
    }
  } catch {}

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlTab = urlParams.get('tab');
    const urlBook = urlParams.get('book');
    const urlUnit = urlParams.get('unit');
    return {
      activeTab: MAIN_TABS.some((m) => m.id === urlTab)
        ? urlTab
        : MAIN_TABS.some((m) => m.id === saved.activeTab)
        ? saved.activeTab
        : 'phonics',
      selectedBook: urlBook || saved.selectedBook || '3',
      selectedUnit: urlUnit ?? saved.selectedUnit ?? '0',
    };
  } catch {}

  return {
    activeTab: MAIN_TABS.some((m) => m.id === saved.activeTab) ? saved.activeTab : 'phonics',
    selectedBook: saved.selectedBook || '3',
    selectedUnit: saved.selectedUnit ?? '0',
  };
};

export function EnglishTeachingStudio({
  words = [],
  onBackToPortal,
  onLaunchGame,
}) {
  const { lang, setLang } = useI18n();
  const { isDark, toggleTheme } = useTheme();
  const uiLang = lang === 'en' ? 'en' : 'zh';

  const initialState = useMemo(() => readInitialStudioState(), []);
  const [activeTab, setActiveTab] = useState(initialState.activeTab);
  const [selectedBook, setSelectedBook] = useState(initialState.selectedBook);
  const [selectedUnit, setSelectedUnit] = useState(initialState.selectedUnit);
  const [incomingBoardText, setIncomingBoardText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isScopeMenuOpen, setIsScopeMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const scopeMenuRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const rootRef = useRef(null);
  const leftAnchorRef = useRef(null);

  // 同步目前冊課與分頁至 sessionStorage 及網址列參數，確保遊戲返回／重整／瀏覽器上一頁均精準恢復現場
  useEffect(() => {
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ activeTab, selectedBook, selectedUnit })
      );
    } catch {}

    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get('book') !== String(selectedBook) ||
        urlParams.get('unit') !== String(selectedUnit) ||
        urlParams.get('tab') !== String(activeTab)
      ) {
        urlParams.set('book', String(selectedBook));
        urlParams.set('unit', String(selectedUnit));
        urlParams.set('tab', String(activeTab));
        const nextUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState(window.history.state, '', nextUrl);
      }
    } catch {}
  }, [activeTab, selectedBook, selectedUnit]);

  // 點擊外部或 Escape 關閉頂欄彈窗
  useEffect(() => {
    if (!isScopeMenuOpen && !isSettingsOpen) return undefined;
    const handleOutside = (e) => {
      if (isScopeMenuOpen && scopeMenuRef.current && !scopeMenuRef.current.contains(e.target)) {
        setIsScopeMenuOpen(false);
      }
      if (isSettingsOpen && settingsMenuRef.current && !settingsMenuRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsScopeMenuOpen(false);
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isScopeMenuOpen, isSettingsOpen]);

  useEffect(() => {
    const handleFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const teacherBooks = useMemo(() => getTeacherZoneBooks(words), [words]);
  const isOfficialBook = /^\d+$/.test(String(selectedBook));
  const unitsInBook = useMemo(
    () => (isOfficialBook ? getUnitsForBook(selectedBook) : []),
    [isOfficialBook, selectedBook]
  );

  const curriculumUnit = useMemo(
    () => (isOfficialBook ? getCurriculumUnit(selectedBook, selectedUnit) : null),
    [isOfficialBook, selectedBook, selectedUnit]
  );

  const unitVocab = useMemo(
    () => getCurriculumUnitVocab(selectedBook, selectedUnit, words),
    [selectedBook, selectedUnit, words]
  );

  const unitSentences = useMemo(() => {
    if (!isOfficialBook) return [];
    return getAvailableSentences({
      selectedUnits: [`${selectedBook}-${selectedUnit}`],
      includeCrossUnit: false,
      level: 'lv1',
    });
  }, [isOfficialBook, selectedBook, selectedUnit]);

  const handleSelectBook = (nextBook) => {
    setSelectedBook(nextBook);
    if (/^\d+$/.test(nextBook)) {
      setSelectedUnit('0');
    } else if (nextBook === 'free') {
      setSelectedUnit('free');
      setIsScopeMenuOpen(false);
    } else {
      setSelectedUnit('all');
      setIsScopeMenuOpen(false);
    }
  };

  const handleSelectUnit = (unitVal) => {
    setSelectedUnit(unitVal);
    setIsScopeMenuOpen(false);
  };

  const handleSendToBoard = useCallback((text) => {
    if (!text) return;
    setIncomingBoardText(text);
    setActiveTab('board');
  }, []);

  const handleConsumeIncomingBoardText = useCallback(() => {
    setIncomingBoardText('');
  }, []);

  const handleLaunch = useCallback(
    (targetView, extraOpts = {}) => {
      if (typeof onLaunchGame !== 'function') return;
      onLaunchGame(targetView, {
        book: String(selectedBook),
        unit: String(selectedUnit),
        tab: activeTab,
        ...extraOpts,
      });
    },
    [onLaunchGame, selectedBook, selectedUnit, activeTab]
  );

  const compactScopeLabel = useMemo(() => {
    if (selectedBook === 'free') {
      return uiLang === 'zh' ? '自由模式' : 'Free';
    }
    if (!isOfficialBook) {
      return selectedBook;
    }
    const uTag = selectedUnit === '0' ? 'Starter' : `U${selectedUnit}`;
    return `B${selectedBook} ${uTag}`;
  }, [selectedBook, selectedUnit, isOfficialBook, uiLang]);

  useEffect(() => {
    const rootEl = rootRef.current;
    const anchorEl = leftAnchorRef.current;
    if (!rootEl || !anchorEl) return undefined;
    const updateOffset = () => {
      const headerPad = window.innerWidth >= 640 ? 16 : 8;
      const offset = Math.round(headerPad + anchorEl.getBoundingClientRect().width + 12);
      rootEl.style.setProperty('--studio-subbar-pl', `${offset}px`);
    };
    updateOffset();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateOffset) : null;
    ro?.observe(anchorEl);
    window.addEventListener('resize', updateOffset);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateOffset);
    };
  }, [selectedBook, selectedUnit, uiLang]);

  return (
    <div
      ref={rootRef}
      className="h-[100dvh] w-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
    >
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 單一常駐主頂欄：桌面左錨([首頁][館名][冊課▾])＋緊鄰[4大模組]對齊下方子列；手機極簡[🏠][冊課▾][4模][⚙️] */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <header className="h-13 px-2 sm:px-4 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 shadow-xs z-40">
        <div className="flex items-center gap-1.5 md:gap-3 min-w-0 flex-1">
          {/* 左側錨點：回首頁 + 館名（手機隱藏）+ 冊課選擇膠囊 */}
          <div ref={leftAnchorRef} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onBackToPortal}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1 transition cursor-pointer"
              title={uiLang === 'zh' ? '返回學習宇宙首頁' : 'Back to Home'}
            >
              <Home className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="hidden lg:inline">{uiLang === 'zh' ? '首頁' : 'Home'}</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h1 className="font-heading font-black text-sm lg:text-base text-slate-800 dark:text-slate-100 whitespace-nowrap">
                {uiLang === 'zh' ? '霧臺英語教學館' : 'Wutai English Studio'}
              </h1>
            </div>

            {/* 冊課選單收合膠囊（展開為冊別與單元彈窗，節省常駐橫幅空間） */}
            <div ref={scopeMenuRef} className="relative">
            <button
              type="button"
              data-testid="curriculum-scope-trigger"
              onClick={() => setIsScopeMenuOpen((v) => !v)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1 transition cursor-pointer whitespace-nowrap ${
                isScopeMenuOpen
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400'
              }`}
              title={
                curriculumUnit
                  ? `第 ${curriculumUnit.book} 冊 ${curriculumUnit.titleZh}`
                  : compactScopeLabel
              }
            >
              <span>{compactScopeLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isScopeMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isScopeMenuOpen && (
              <div
                data-testid="curriculum-scope-popover"
                className="absolute left-0 top-full mt-2 w-[310px] sm:w-[400px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3.5 space-y-3 z-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{uiLang === 'zh' ? '選擇教學冊別 / 專區' : 'Select Book / Scope'}</span>
                  </span>
                  <select
                    aria-label="選擇冊別"
                    value={selectedBook}
                    onChange={(e) => handleSelectBook(e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    {CURRICULUM_BOOKS.map((b) => (
                      <option key={b.book} value={b.book}>
                        {b.labelZh}
                      </option>
                    ))}
                    {teacherBooks.map((tb) => (
                      <option key={tb} value={tb}>
                        {uiLang === 'zh' ? `教師：${tb}` : tb}
                      </option>
                    ))}
                    <option value="free">{uiLang === 'zh' ? '自由練習 (不限單元)' : 'Free Practice'}</option>
                  </select>
                </div>

                {isOfficialBook ? (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-black text-slate-400">
                      {uiLang === 'zh' ? '選擇單元（點選即套用並關閉）' : 'Select Unit'}
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 max-h-[260px] overflow-y-auto pr-0.5">
                      {unitsInBook.map((u) => {
                        const active = u.unit === selectedUnit;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelectUnit(u.unit)}
                            className={`w-full px-3 py-2 rounded-xl text-left border transition flex items-center justify-between gap-2 cursor-pointer ${
                              active
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-black truncate">{u.titleZh}</div>
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold shrink-0 ${
                                active
                                  ? 'bg-white/20 text-white'
                                  : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              }`}
                            >
                              {u.phonicsLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {selectedBook === 'free'
                      ? uiLang === 'zh'
                        ? '目前為自由練習模式，可使用全套拼讀卡池與任意自訂字詞。'
                        : 'Free sandbox mode active.'
                      : uiLang === 'zh'
                      ? `教師專區：${selectedBook}（共 ${unitVocab.length} 字）`
                      : `${selectedBook} (${unitVocab.length} words)`}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>

          {/* 4 大主分頁切換（緊鄰冊課錨點右側，與第二排子模組垂直對齊） */}
          <nav
            aria-label="Teaching Studio Tabs"
            className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none"
          >
            {MAIN_TABS.map((tab) => {
              const active = activeTab === tab.id;
              const TabIcon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2 sm:px-3.5 py-1 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5 shrink-0 hidden sm:block" />
                  <span>{uiLang === 'zh' ? tab.labelZh : tab.labelEn}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 右側：全螢幕（手機隱藏）+ 介面顯示設定 */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={toggleFullscreen}
            title={uiLang === 'zh' ? '全螢幕切換' : 'Fullscreen'}
            className="hidden sm:flex p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <div ref={settingsMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsSettingsOpen((v) => !v)}
              title={uiLang === 'zh' ? '顯示與語言設定' : 'Display Settings'}
              className={`p-1.5 rounded-xl border cursor-pointer transition ${
                isSettingsOpen
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2.5 space-y-1.5 z-50">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-black flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                    <span>{uiLang === 'zh' ? '介面主題' : 'Theme'}</span>
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {isDark ? (uiLang === 'zh' ? '深色' : 'Dark') : (uiLang === 'zh' ? '淺色' : 'Light')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLang(uiLang === 'zh' ? 'en' : 'zh-TW')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-black flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-indigo-500" />
                    <span>{uiLang === 'zh' ? '介面語言' : 'Language'}</span>
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>{uiLang === 'zh' ? '中文' : 'EN'}</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 中央滿版互動教學畫布（拼音與板書保持掛載，切換分頁永不遺失筆跡與拼讀） */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className={activeTab === 'phonics' ? 'flex-1 min-h-0 flex flex-col overflow-hidden' : 'hidden'}>
          <PhonicsStudio
            curriculumUnit={curriculumUnit}
            words={words}
            lang={uiLang}
            onSendToBoard={handleSendToBoard}
          />
        </div>

        <div className={activeTab === 'board' ? 'flex-1 min-h-0 flex flex-col overflow-hidden' : 'hidden'}>
          <BoardStudio
            selectedBook={selectedBook}
            selectedUnit={selectedUnit}
            curriculumUnit={curriculumUnit}
            words={words}
            lang={uiLang}
            isDark={isDark}
            isVisible={activeTab === 'board'}
            incomingBoardText={incomingBoardText}
            onConsumeIncomingBoardText={handleConsumeIncomingBoardText}
            onLaunchGame={handleLaunch}
          />
        </div>

        {activeTab === 'vocab' && (
          <VocabStudio
            selectedBook={selectedBook}
            selectedUnit={selectedUnit}
            unitVocab={unitVocab}
            lang={uiLang}
            onSendToBoard={handleSendToBoard}
            onLaunchGame={handleLaunch}
          />
        )}

        {activeTab === 'sentence' && (
          <SentenceStudio
            selectedBook={selectedBook}
            selectedUnit={selectedUnit}
            curriculumUnit={curriculumUnit}
            unitVocab={unitVocab}
            unitSentences={unitSentences}
            lang={uiLang}
            onSendToBoard={handleSendToBoard}
            onLaunchGame={handleLaunch}
          />
        )}
      </main>

      {/* 右側霧臺課堂萬用工具列（神獸計分板、計時器、3D 骰子、螢幕畫筆、QR 即時連線室） */}
      <ClassroomDock lang={uiLang} />
    </div>
  );
}

export default EnglishTeachingStudio;
