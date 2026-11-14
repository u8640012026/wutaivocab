import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Lobby } from './components/Lobby';
import { TeacherHub } from './components/TeacherHub';
import { LeaderboardView } from './components/LeaderboardView';
import { StandardQuiz } from './games/quiz/StandardQuiz';
import { HandwritingGame } from './games/handwriting/HandwritingGame';
import { SpellingGame } from './games/spelling/SpellingGame';
import { MeteorGame } from './games/meteor/MeteorGame';
import { SnakeGame } from './games/snake/SnakeGame';
import { MemoryGameSingle } from './games/memory/MemoryGameSingle';
import { BattleGame } from './games/battle/BattleGame';
import { AlphabetMazeGame } from './games/maze/AlphabetMazeGame';
import { SwipeCardGame } from './games/swipe/SwipeCardGame';
import { VocabEscapeGame } from './games/escape/VocabEscapeGame';
import { VocabSpotterGame } from './games/spotter/VocabSpotterGame';
import { SpotterTestWorkbench } from './games/spotter/SpotterTestWorkbench';
import { WhackAMoleGame } from './games/mole/WhackAMoleGame';
import { PhonicsBoard } from './features/phonics/PhonicsBoard';
import { Portal } from './components/Portal';
import { WutaiTownGame } from './games/town/WutaiTownGame';
import { TextbookViewer } from './components/TextbookViewer';
import { PreloaderShowcase } from './components/PreloaderShowcase';
import { ImageZoomShowcase } from './components/exam/ImageZoomShowcase';
import { LanguageLabHub } from './features/langlab/LanguageLabHub';
import { PureMcqExamView } from './games/exam/PureMcqExamView';
import { PrioriPracticeHub } from './features/priori/PrioriPracticeHub';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { InactivityGuard } from './components/common/InactivityGuard';
import { useI18n } from './context/I18nContext';
import { useTheme } from './context/ThemeContext';
import { fetchWordsFromDb } from './services/supabase';
import { soundEngine } from './services/audio';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.clickCount = 0;
    this.clickTimer = null;
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  handleIconClick = () => {
    this.clickCount += 1;
    if (this.clickTimer) clearTimeout(this.clickTimer);
    this.clickTimer = setTimeout(() => { this.clickCount = 0; }, 2000);
    if (this.clickCount >= 5) {
      this.clickCount = 0;
      this.setState({ hasError: false });
      if (this.props.onOpenTeacherHub) this.props.onOpenTeacherHub();
    }
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-md w-full p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
            <div
              onClick={this.handleIconClick}
              className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 text-2xl font-black cursor-pointer select-none active:scale-95 transition-transform"
              title="點擊 5 次啟動後台備援"
            >
              ⚠️
            </div>
            <h2 className="text-xl font-heading font-black text-slate-800 dark:text-slate-100 mb-2">
              畫面載入遇到小插曲
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-bold">
              請點擊下方按鈕，系統將自動為您重整並返回單字學習館
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                if (this.props.onReset) this.props.onReset();
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              🔄 返回單字學習館
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const { lang, setLang } = useI18n();
  const { isDark, toggleTheme } = useTheme();

  const resolveViewFromUrl = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('join')) return 'battle';

      const viewParam = (urlParams.get('view') || '').toLowerCase();
      const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
      const target = viewParam || path;

      if (!target || target === 'home' || target === 'portal') return 'portal';
      if (target === 'vocab' || target === 'lobby') return 'lobby';

      const VALID_VIEWS = [
        'phonics', 'lobby', 'town', 'textbook', 'langlab', 'mcq-exam', 'priori',
        'escape', 'spotter', 'spotter-test', 'maze', 'memory',
        'mole', 'swipe', 'meteor', 'snake', 'spelling', 'handwriting',
        'battle', 'leaderboard', 'teacher-hub', 'preloader-showcase', 'loader-showcase', 'zoom-showcase'
      ];
      if (VALID_VIEWS.includes(target)) return target;
      if (target.startsWith('quiz-')) return target;
    } catch (e) {}
    return 'portal';
  };

  const [currentView, setCurrentView] = useState(resolveViewFromUrl);

  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // 測驗出題設定 (預設純選定範圍誘答，支援 URL 直接帶入冊次初始化)
  const [settings, setSettings] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const b = urlParams.get('book');
      if (b) {
        return {
          selectedUnits: b === 'abc' ? ['abc'] : [`${b}-1`, `${b}-2`],
          count: '20',
          distractorMode: 'strict',
          selectedBook: b
        };
      }
    } catch (e) {}
    return {
      selectedUnits: [],
      count: '20',
      distractorMode: 'strict'
    };
  });

  const [autoJoinCode, setAutoJoinCode] = useState(null);
  const [initialPrioriPaper] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('paper') || null;
    } catch {
      return null;
    }
  });

  const loadWords = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWordsFromDb();
      setWords(data);
      setIsOnline(true);
    } catch (e) {
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWords();

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const joinParam = urlParams.get('join');
      if (joinParam) {
        setAutoJoinCode(joinParam);
        setCurrentView('battle');
      }
    } catch (e) {}
  }, []);

  // 監聽瀏覽器上一頁/下一頁返回事件 (POPSTATE)
  useEffect(() => {
    const handlePopState = (e) => {
      try {
        if (e.state?.view) {
          setCurrentView(e.state.view);
        } else {
          setCurrentView(resolveViewFromUrl());
        }
        const urlParams = new URLSearchParams(window.location.search);
        const b = urlParams.get('book');
        if (b) {
          setSettings(prev => {
            if (!prev.selectedUnits || prev.selectedUnits.length === 0) {
              return {
                ...prev,
                selectedUnits: b === 'abc' ? ['abc'] : [`${b}-1`, `${b}-2`],
                selectedBook: b
              };
            }
            return prev;
          });
        }
      } catch (e) {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 榮譽榜資格判斷：低年級 abc 模式直接合格；中高年級僅能選同冊且超過 20 字或 2 單元以上
  const qualifyingBook = useMemo(() => {
    if (!settings.selectedUnits || settings.selectedUnits.length === 0) return null;

    // 低年級 Aa 字母全套模式直接認可為合格冊別 'abc'
    if (settings.selectedUnits.includes('abc') || settings.alphaMode) {
      return 'abc';
    }

    const selectedBooks = [...new Set(settings.selectedUnits.map(u => u.split('-')[0]))];
    // 條件 1：僅能選同冊
    if (selectedBooks.length !== 1) return null;

    const book = selectedBooks[0];
    const selectedUnitsCount = settings.selectedUnits.length;
    const selectedWordsCount = words.filter(w =>
      settings.selectedUnits.includes(`${w.book}-${w.lesson}`)
    ).length;

    // 條件 2 (二擇一滿足即可)：
    // A. 超過 20 字 (selectedWordsCount >= 20)
    // B. 或者包含兩個以上的正常單元 (selectedUnitsCount >= 2)
    const hasEnoughWords = selectedWordsCount >= 20;
    const hasEnoughUnits = selectedUnitsCount >= 2;

    if (!hasEnoughWords && !hasEnoughUnits) return null;

    return book;
  }, [settings.selectedUnits, words]);

  const [isTeacherAuthOpen, setIsTeacherAuthOpen] = useState(false);

  const handleOpenTeacherHub = () => {
    if (sessionStorage.getItem('wutai_teacher_authed') === 'true') {
      handleNavigate('teacher-hub');
    } else {
      setIsTeacherAuthOpen(true);
    }
  };

  const handleNavigate = (view) => {
    soundEngine.init();
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      let targetPath = '/';
      if (view === 'portal') targetPath = '/';
      else if (view === 'lobby') targetPath = '/vocab';
      else targetPath = `/${view}`;

      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view }, '', targetPath);
      }
    } catch (e) {}
  };

  // ── 全域管理者快捷鍵 (Ctrl+Shift+A 或 Ctrl+Alt+T) 與 Console 備援通道 ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isModifier = e.ctrlKey || e.metaKey;
      if (isModifier && ((e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 't' || e.key === 'T')))) {
        e.preventDefault();
        handleOpenTeacherHub();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.openAdminHub = handleOpenTeacherHub;
    window.__openTeacherHub = handleOpenTeacherHub;
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      delete window.openAdminHub;
      delete window.__openTeacherHub;
    };
  }, []);

  // 當處於單字學習遊戲或大廳且單字尚未同步完成時顯示輕量載入動畫
  if (isLoading && words.length === 0 && currentView !== 'portal' && currentView !== 'phonics' && currentView !== 'textbook' && currentView !== 'langlab' && currentView !== 'town' && currentView !== 'mcq-exam' && currentView !== 'priori') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4" />
        <h2 className="text-xl font-heading font-black text-slate-700 dark:text-slate-200">
          正在同步雲端單字庫...
        </h2>
        <p className="text-xs font-bold text-slate-400 mt-1">
          Wutai English Adventure World Loading
        </p>
      </div>
    );
  }

  const handleGoParent = () => {
    // 依層級關係精確返回上一層：
    // 若當前在單字學習館大廳 (lobby)、自然發音 (phonics)、小鎮 (town)、電子書 (textbook)、聽說館 (langlab)、題庫檢定館 (mcq-exam) 或學習扶助練習館 (priori)，上一層為學習宇宙首頁 (portal)
    if (currentView === 'lobby' || currentView === 'phonics' || currentView === 'town' || currentView === 'textbook' || currentView === 'langlab' || currentView === 'mcq-exam' || currentView === 'priori') {
      handleNavigate('portal');
    } else if (currentView !== 'portal') {
      // 若當前在任何單字遊戲、字母迷宮、排行榜或教師後台，上一層為單字學習館 (lobby)
      handleNavigate('lobby');
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* 全域統一導覽列 (大廳、排行榜、打地鼠、課本題庫檢定館與學習扶助練習館擁有專屬零干擾頂欄，其餘頁面維持標準 Header) */}
      {currentView !== 'lobby' && currentView !== 'leaderboard' && currentView !== 'mole' && currentView !== 'mcq-exam' && currentView !== 'priori' && (
        <Header
          onOpenTeacherHub={handleOpenTeacherHub}
          onOpenLeaderboard={() => handleNavigate('leaderboard')}
          onOpenPhonics={() => handleNavigate('phonics')}
          onGoParent={handleGoParent}
          onGoHome={() => handleNavigate('portal')}
          currentView={currentView}
          isOnline={isOnline}
        />
      )}

      {/* 畫面路由視圖切換 (含全域安全防護熔斷) */}
      <main className="flex-1 flex flex-col">
        <ErrorBoundary
          onReset={() => handleNavigate(currentView === 'portal' || currentView === 'phonics' || currentView === 'priori' ? 'portal' : 'lobby')}
          onOpenTeacherHub={handleOpenTeacherHub}
        >
          {currentView === 'portal' && (
            <Portal
              onNavigate={handleNavigate}
              onOpenLeaderboard={() => handleNavigate('leaderboard')}
              onOpenTeacherHub={handleOpenTeacherHub}
              wordsCount={words.length}
            />
          )}

          {currentView === 'lobby' && (
            <Lobby
              words={words}
              settings={settings}
              setSettings={setSettings}
              onNavigate={handleNavigate}
              onOpenLeaderboard={() => handleNavigate('leaderboard')}
              onOpenTeacherHub={handleOpenTeacherHub}
              qualifyingBook={qualifyingBook}
            />
          )}

          {currentView === 'teacher-hub' && (
            <TeacherHub
              words={words}
              onBack={() => handleNavigate('lobby')}
              onRefreshWords={loadWords}
              onOpenShowcase={() => handleNavigate('preloader-showcase')}
              onOpenZoomShowcase={() => handleNavigate('zoom-showcase')}
            />
          )}

          {currentView === 'zoom-showcase' && (
            <ImageZoomShowcase
              onBack={() => {
                if (sessionStorage.getItem('wutai_teacher_authed') === 'true') {
                  handleNavigate('teacher-hub');
                } else {
                  handleNavigate('lobby');
                }
              }}
            />
          )}

          {(currentView === 'preloader-showcase' || currentView === 'loader-showcase' || currentView === 'preloader-preview') && (
            <PreloaderShowcase
              onBack={() => {
                if (sessionStorage.getItem('wutai_teacher_authed') === 'true') {
                  handleNavigate('teacher-hub');
                } else {
                  handleNavigate('lobby');
                }
              }}
            />
          )}

          {currentView === 'leaderboard' && (
            <LeaderboardView
              words={words}
              onBack={() => handleNavigate('lobby')}
              onOpenTeacherHub={handleOpenTeacherHub}
            />
          )}

          {currentView.startsWith('quiz-') && (
            <StandardQuiz
              mode={currentView}
              settings={settings}
              words={words}
              qualifyingBook={qualifyingBook}
              onBack={() => handleNavigate('lobby')}
            />
          )}

          {currentView === 'spelling' && (
            <SpellingGame
              settings={settings}
              words={words}
              qualifyingBook={qualifyingBook}
              onBack={() => handleNavigate('lobby')}
            />
          )}

          {currentView === 'meteor' && (
            <MeteorGame
              settings={settings}
              words={words}
              qualifyingBook={qualifyingBook}
              onBack={() => handleNavigate('lobby')}
            />
          )}

          {currentView === 'snake' && (
            <SnakeGame
              settings={settings}
              words={words}
              qualifyingBook={qualifyingBook}
              onBack={() => handleNavigate('lobby')}
            />
          )}

          {currentView === 'memory' && (
            <MemoryGameSingle
              settings={settings}
              words={words}
              qualifyingBook={qualifyingBook}
              onBack={() => handleNavigate('lobby')}
            />
          )}

          {currentView === 'maze' && (
            <AlphabetMazeGame
              qualifyingBook={qualifyingBook}
              onBack={() => handleNavigate('lobby')}
            />
          )}

          {currentView === 'swipe' && (
            <SwipeCardGame
              settings={settings}
              words={words}
              qualifyingBook={qualifyingBook}
              onBack={() => handleNavigate('lobby')}
            />
          )}

          {currentView === 'escape' && (
            <VocabEscapeGame
              settings={settings}
              words={words}
              qualifyingBook={qualifyingBook}
              onBack={() => handleNavigate('lobby')}
            />
          )}

          {currentView === 'spotter' && (
            <VocabSpotterGame
              settings={settings}
              words={words}
              qualifyingBook={qualifyingBook}
              onBack={() => handleNavigate('lobby')}
              onOpenWorkbench={() => handleNavigate('spotter-test')}
            />
          )}

          {currentView === 'spotter-test' && (
            <SpotterTestWorkbench
              onBack={() => handleNavigate('spotter')}
            />
          )}

          {currentView === 'mole' && (
            <WhackAMoleGame
              settings={settings}
              words={words}
              qualifyingBook={qualifyingBook}
              onBack={() => handleNavigate('lobby')}
            />
          )}

          {currentView === 'battle' && (
            <BattleGame
              settings={settings}
              setSettings={setSettings}
              words={words}
              autoJoinCode={autoJoinCode}
              onBack={() => {
                setAutoJoinCode(null);
                handleNavigate('lobby');
              }}
            />
          )}

          {currentView === 'handwriting' && (
            <HandwritingGame
              settings={settings}
              words={words}
              qualifyingBook={qualifyingBook}
              onBack={() => handleNavigate('lobby')}
            />
          )}

          {currentView === 'mcq-exam' && (
            <PureMcqExamView
              settings={settings}
              onBack={() => handleNavigate('portal')}
            />
          )}

          {currentView === 'priori' && (
            <PrioriPracticeHub
              initialPaperId={initialPrioriPaper}
              onBack={() => handleNavigate('portal')}
            />
          )}

          {currentView === 'town' && (
            <WutaiTownGame
              onBack={() => handleNavigate('portal')}
            />
          )}

          {currentView === 'textbook' && (
            <TextbookViewer
              onBack={() => handleNavigate('portal')}
            />
          )}

          {currentView === 'langlab' && (
            <LanguageLabHub
              onBack={() => handleNavigate('portal')}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'phonics' && (
            <PhonicsBoard
              onBackToLobby={() => handleNavigate('portal')}
              initialLang={lang === 'en' ? 'en' : 'zh'}
              initialTheme={isDark ? 'dark' : 'light'}
              onLangChangeGlobal={(newPhonicsLang) => {
                setLang(newPhonicsLang === 'en' ? 'en' : 'zh-TW');
              }}
              onThemeChangeGlobal={(newPhonicsTheme) => {
                if ((newPhonicsTheme === 'dark') !== isDark) {
                  toggleTheme();
                }
              }}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* 教師工作台通行驗證彈窗 (密碼: wt7902230) */}
      <TeacherAuthModal
        isOpen={isTeacherAuthOpen}
        onClose={() => setIsTeacherAuthOpen(false)}
        onSuccess={() => {
          setIsTeacherAuthOpen(false);
          handleNavigate('teacher-hub');
        }}
      />

      {/* 學生 6 碼雲端漫遊通行證彈窗 */}
      <StudentProfileModal />

      {/* 全域單人 12 款遊戲與互動模組 45 分鐘閒置保護與休眠監控 */}
      <InactivityGuard
        currentView={currentView}
        onTimeoutToLobby={() => handleNavigate('lobby')}
        timeoutMinutes={45}
        warningSeconds={60}
      />
    </div>
  );
}
export default App;
