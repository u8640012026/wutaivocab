import React, { useState, useMemo, useEffect } from 'react';
import { useI18n } from '../context/I18nContext';
import { useStudent } from '../context/StudentContext';
import { useTheme } from '../context/ThemeContext';
import { formatStudentBadge } from '../utils/studentIdHelper';
import { soundEngine } from '../services/audio';
import { PowerUpCodexModal } from '../games/memory/PowerUpCodexModal';
import {
  getAvailableSentences,
  getAvailableSentenceCount,
  parseSelectedSentenceScope
} from '../data/sentencePatterns';
import {
  Home, Trophy, User, ArrowLeft, ArrowRight, Play,
  KeyRound, Eye, Compass, Puzzle, Flame, Rocket, PenTool,
  Sparkles, Keyboard, BookOpen, Volume2, Swords,
  Store, RotateCcw, Check, CheckCircle2, ChevronRight,
  Sun, Moon, VolumeX, ShieldCheck, Layers, HelpCircle,
  X, Zap, Star, AlertCircle, Globe
} from 'lucide-react';

const POSTER_EXPLORE = '/assets/lobby/theme_explore.jpg';
const POSTER_SPEED = '/assets/lobby/theme_speed.jpg';
const POSTER_QUIZ = '/assets/lobby/theme_quiz.jpg';
const POSTER_BATTLE = '/assets/lobby/theme_battle.jpg';
const POSTER_TOWN = '/assets/lobby/theme_town.jpg';

const ALPHABET_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ── 5 欄 × 2 列年級配對定義（由左至右：一二年級、三上三下、四上四下、五上五下、六上六下） ──
const GRADE_COLUMNS = [
  {
    colId: 'g1_g2',
    colLabel: '低年級',
    top: { id: 'g1', label: '一年級', book: 'abc', grade: 1, isAlpha: true, desc: '字母認讀' },
    bottom: { id: 'g2', label: '二年級', book: 'abc', grade: 2, isAlpha: true, desc: '自然發音' }
  },
  {
    colId: 'b1_b2',
    colLabel: '三年級',
    top: { id: 'b1', label: '三上', book: '1', grade: 3, semester: 1, desc: '第 1 冊' },
    bottom: { id: 'b2', label: '三下', book: '2', grade: 3, semester: 2, desc: '第 2 冊' }
  },
  {
    colId: 'b3_b4',
    colLabel: '四年級',
    top: { id: 'b3', label: '四上', book: '3', grade: 4, semester: 1, desc: '第 3 冊' },
    bottom: { id: 'b4', label: '四下', book: '4', grade: 4, semester: 2, desc: '第 4 冊' }
  },
  {
    colId: 'b5_b6',
    colLabel: '五年級',
    top: { id: 'b5', label: '五上', book: '5', grade: 5, semester: 1, desc: '第 5 冊' },
    bottom: { id: 'b6', label: '五下', book: '6', grade: 5, semester: 2, desc: '第 6 冊' }
  },
  {
    colId: 'b7_b8',
    colLabel: '六年級',
    top: { id: 'b7', label: '六上', book: '7', grade: 6, semester: 1, desc: '第 7 冊' },
    bottom: { id: 'b8', label: '六下', book: '8', grade: 6, semester: 2, desc: '第 8 冊' }
  }
];

const ALL_GRADE_OPTIONS = GRADE_COLUMNS.flatMap(c => [c.top, c.bottom]);

// ── 三到六年級通用單元順序 (由左至右順序固定) ──
const UNIVERSAL_UNITS = [
  { id: 'all', label: '🏆 全冊 (All)' },
  { id: 'starter', label: 'Starter' },
  { id: 'unit1', label: 'Unit 1' },
  { id: 'unit2', label: 'Unit 2' },
  { id: 'unit3', label: 'Unit 3' },
  { id: 'unit4', label: 'Unit 4' },
  { id: 'festival', label: 'Festival' }
];

// ── 各遊戲左下角真實精彩遊戲截圖瞬間 (羽化融景 • 輕量化 WebP) ──
const GAME_SPOTLIGHT_ART = {
  mole: '/assets/screenshots/screenshot_mole.webp',
  meteor: '/assets/screenshots/screenshot_meteor.webp',
  snake: '/assets/screenshots/screenshot_snake.webp',
  spotter: '/assets/spotter/book1_base.jpg',
  escape: '/assets/escape/bg_temple.webp',
  maze: '/assets/screenshots/screenshot_maze.webp',
  swipe: '/assets/screenshots/screenshot_swipe.webp',
  memory: '/assets/memory/god_lightning.jpg',
  sentence: '/assets/lobby/theme_quiz.jpg',
  spelling: '/assets/screenshots/screenshot_spelling.webp',
  'quiz-choice': '/assets/lobby/theme_quiz.jpg',
  handwriting: '/assets/lobby/theme_quiz.jpg',
  'quiz-zh-en': '/assets/lobby/theme_quiz.jpg',
  'quiz-en-zh': '/assets/lobby/theme_quiz.jpg',
  'quiz-listening': '/assets/lobby/theme_quiz.jpg',
  'quiz-mixed': '/assets/lobby/theme_quiz.jpg',
  town: '/assets/town/town_map_panorama.webp',
  battle: '/assets/lobby/theme_battle.jpg'
};

// ── 密室逃脫四大秘境手風琴定義 (調用第一室實景 WebP) ──
const ESCAPE_THEMES_PREVIEW = [
  {
    id: 'temple',
    name: '大武山石板神廟',
    enName: 'Ancient Slate Sanctuary',
    bg: '/assets/escape/bg_temple.webp',
    icon: '🏛️',
    tag: '石板傳奇',
    colorName: 'emerald',
    desc: '大武山古老石板遺跡，千斤巨石封鎖，解開回音石廊與星象祭壇！'
  },
  {
    id: 'dungeon',
    name: '黑曜熔岩地下城',
    enName: 'Obsidian Dungeon',
    bg: '/assets/escape/dungeon_room1.webp',
    icon: '⛓️',
    tag: '黑曜熔岩',
    colorName: 'amber',
    desc: '封閉百年的黑曜石囚室，破譯矮人符文與煉金長廊，啟動地心升降機！'
  },
  {
    id: 'tomb',
    name: '法老古墓黃金殿',
    enName: 'Pharaoh Gold Tomb',
    bg: '/assets/escape/tomb_room1.webp',
    icon: '🏺',
    tag: '尼羅秘藏',
    colorName: 'yellow',
    desc: '沉睡千年的金字塔砂岩墓道，解讀聖書體符文，迎向太陽神之巔！'
  },
  {
    id: 'asylum',
    name: '雨夜殘破時鐘樓',
    enName: 'Clockwork Asylum',
    bg: '/assets/escape/asylum_room1.webp',
    icon: '🕰️',
    tag: '雨夜鐘樓',
    colorName: 'violet',
    desc: '暴風雨之夜廢棄維多利亞鐘樓，齒輪嘎吱作響，在十二聲鐘響前逃脫！'
  }
];

// ── 密室逃脫四大秘境靈魂大圖動態對應 ──
const ESCAPE_THEME_SPOTLIGHT = {
  temple: '/assets/escape/bg_temple.webp',
  mine: '/assets/escape/lava_room1.webp',
  tomb: '/assets/escape/tomb_room1.webp',
  asylum: '/assets/escape/asylum_room1.webp'
};

// ── 記憶翻牌三大卡背主題手風琴定義 (調用日之章、夜之章、神殿原畫) ──
const MEMORY_THEMES_PREVIEW = [
  {
    id: 'cyber_blue',
    themeKey: 'cyber_blue',
    name: '魯凱百合（日之章）',
    enName: 'Rukai Lily Sanctuary (Day)',
    bg: '/assets/memory/card_back_rukai_day.jpg',
    icon: '☀️',
    tag: '日之章',
    colorName: 'amber',
    desc: '暖陽照射的大武山聖潔百合，金光太陽紋與百步蛇傳統菱紋，守護魯凱聖域！'
  },
  {
    id: 'noble_gold',
    themeKey: 'noble_gold',
    name: '古老石板（夜之章）',
    enName: 'Ancient Slate Leopard (Night)',
    bg: '/assets/memory/card_back_slate_night.jpg',
    icon: '🌙',
    tag: '夜之章',
    colorName: 'cyan',
    desc: '霧臺古老黑曜石雕花石板，隱匿暗夜的台灣雲豹與原民三色琉璃珠秘紋！'
  },
  {
    id: 'morandi_rose',
    themeKey: 'morandi_rose',
    name: '奧林帕斯雲端神殿',
    enName: 'Mount Olympus Celestial Temple',
    bg: '/assets/memory/board_bg_olympus.jpg',
    icon: '🏛️',
    tag: '諸神聖殿',
    colorName: 'purple',
    desc: '愛奧尼大理石廊柱、破曉金光與翻滾雲海，八大希臘眾神神力降臨對決！'
  }
];

export const Lobby = ({
  words = [],
  settings,
  setSettings,
  onNavigate,
  onOpenLeaderboard,
  onOpenTeacherHub,
  qualifyingBook,
  returnToTeaching = false,
  onReturnToTeaching = null
}) => {
  const { t, lang, toggleLang } = useI18n();
  const { currentStudent, isLoggedIn, openModal } = useStudent();
  const { isDark, toggleTheme, isAuto } = useTheme();
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);

  // ── 流程步驟：'game' (選遊戲手風琴) | 'scope' (專屬整備選冊/秘境頁) ──
  const [step, setStep] = useState('game');

  // ── 手風琴選中展開欄位：null (均分 20%) | 'explore' | 'speed' | 'quiz' ──
  const [activeCol, setActiveCol] = useState(null);

  // ── 當前選中的遊戲 ID ──
  const [selectedGame, setSelectedGame] = useState('escape');

  // ── 選定的冊次選項 ID (預設對應學生年級；若從教學館跳轉而來則優先套用帶入的冊別) ──
  const [selectedOptionId, setSelectedOptionId] = useState(() => {
    if (returnToTeaching && settings?.selectedBook) {
      const b = String(settings.selectedBook);
      if (b === 'abc') return settings?.alphaGrade === 2 ? 'g2' : 'g1';
      if (/^[1-8]$/.test(b)) return `b${b}`;
    }
    return 'b1';
  });

  // ── 單元選取模式：'all' | 'starter' | 'unit1' | 'unit2' | 'unit3' | 'unit4' | 'festival' ──
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('all');

  // ── 低年級字母模式：'upper' | 'lower' | 'mixed' ──
  const [alphaMode, setAlphaMode] = useState(() => (
    parseInt(currentStudent?.grade, 10) === 2 ? 'lower' : 'upper'
  ));

  // ── 密室逃脫選定主題 ──
  const [escapeThemeId, setEscapeThemeId] = useState('temple');

  // ── 字母巡航迷宮專屬選單狀態 ──
  const [mazeTheme, setMazeTheme] = useState(() => localStorage.getItem('wutai_maze_theme') || 'snake');
  const [mazeTier, setMazeTier] = useState(() => localStorage.getItem('wutai_maze_tier') || 'standard');
  const [mazeIsLowercase, setMazeIsLowercase] = useState(() => localStorage.getItem('wutai_maze_isLowercase') === 'true');
  const [mazeRangePreset, setMazeRangePreset] = useState(() => localStorage.getItem('wutai_maze_rangePreset') || 'AH');
  const [mazeStartChar, setMazeStartChar] = useState(() => localStorage.getItem('wutai_maze_startChar')?.toUpperCase() || 'A');
  const [mazeEndChar, setMazeEndChar] = useState(() => localStorage.getItem('wutai_maze_endChar')?.toUpperCase() || 'H');

  // 子遊戲專屬設定 (由 Lobby 整備室統一整併，告別遊戲內二次彈窗)
  const [snakeDifficulty, setSnakeDifficulty] = useState(() => localStorage.getItem('wutai_snake_difficulty') || 'normal');
  const [memoryMode, setMemoryMode] = useState(() => localStorage.getItem('wutai_memory_mode') || 'en-zh');
  const [memoryThemeId, setMemoryThemeId] = useState(() => localStorage.getItem('wutai_memory_card_theme') || 'noble_gold');
  const [showMemoryCodex, setShowMemoryCodex] = useState(false);
  const [swipeMode, setSwipeMode] = useState(() => localStorage.getItem('wutai_swipe_mode') || 'vocab');
  const [quizChoiceDirection, setQuizChoiceDirection] = useState(() => localStorage.getItem('wutai_quiz_choice_dir') || 'mixed');
  const [quizListeningSubMode, setQuizListeningSubMode] = useState(() => localStorage.getItem('wutai_quiz_listening_sub') || 'word');
  const [sentenceLevel, setSentenceLevel] = useState(() => {
    const saved = localStorage.getItem('wutai_sentence_level');
    return saved === 'lv3' || saved === 'lv2' ? saved : 'lv1';
  });

  // ── 記住我的選擇核選狀態 ──
  const [rememberSelection, setRememberSelection] = useState(() => {
    try {
      return localStorage.getItem('wutai_remember_unit_selection') === 'true';
    } catch (e) {
      return false;
    }
  });

  // ── 切換「記住我的選擇」 ──
  const handleToggleRememberSelection = () => {
    soundEngine.click();
    setRememberSelection(prev => {
      const next = !prev;
      try {
        localStorage.setItem('wutai_remember_unit_selection', String(next));
      } catch (e) {}
      return next;
    });
  };

  // ── 首次進入若未設置個人身分，自動喚起通行證設置 ──
  useEffect(() => {
    try {
      const lastId = localStorage.getItem('wutai_last_student_id');
      const guest = localStorage.getItem('wutai_guest_student');
      if (!currentStudent && !lastId && !guest) {
        const timer = setTimeout(() => {
          if (openModal) openModal();
        }, 450);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, [currentStudent, openModal]);

  // ── 學生年級判定 (1~6，預設 3) ──
  const studentGradeNum = useMemo(() => {
    if (currentStudent?.grade) {
      const g = parseInt(currentStudent.grade, 10);
      if (g >= 1 && g <= 6) return g;
    }
    return 3;
  }, [currentStudent]);

  // ── 根據學生年級自動初始化預設選項 (僅在非教學館跳轉時依年級重設) ──
  useEffect(() => {
    if (returnToTeaching) return;
    if (studentGradeNum === 1) {
      setSelectedOptionId('g1');
      setAlphaMode('upper');
    } else if (studentGradeNum === 2) {
      setSelectedOptionId('g2');
      setAlphaMode('lower');
    }
    else if (studentGradeNum === 3) setSelectedOptionId('b1');
    else if (studentGradeNum === 4) setSelectedOptionId('b3');
    else if (studentGradeNum === 5) setSelectedOptionId('b5');
    else if (studentGradeNum === 6) setSelectedOptionId('b7');
  }, [studentGradeNum, returnToTeaching]);

  // ── 當從英語教學館跳轉進入大廳時，同步選中冊別膠囊 ──
  useEffect(() => {
    if (!returnToTeaching || !settings?.selectedBook) return;
    const b = String(settings.selectedBook);
    if (b === 'abc') {
      setSelectedOptionId(settings?.alphaGrade === 2 ? 'g2' : 'g1');
      setAlphaMode(settings?.alphaMode || 'upper');
    } else if (/^[1-8]$/.test(b)) {
      setSelectedOptionId(`b${b}`);
    }
  }, [returnToTeaching]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 五大欄位定義 ──
  const COLUMNS = useMemo(() => [
    {
      id: 'explore',
      title: '探索解謎',
      enTitle: 'EXPLORE & PUZZLES',
      icon: KeyRound,
      bgImage: POSTER_EXPLORE,
      tag: '4 款挑戰',
      colorName: 'emerald',
      titleGlow: 'bg-gradient-to-b from-emerald-100 via-emerald-200 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_0_16px_rgba(16,185,129,0.7)]',
      spineTextColor: 'text-emerald-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]',
      borderClass: 'border-emerald-500/60 hover:border-emerald-400',
      activeRingClass: 'ring-emerald-400/60 border-emerald-300',
      tagBadge: 'bg-emerald-950/80 text-emerald-300 border-emerald-400/50',
      plaqueBg: 'bg-emerald-950/75 border-emerald-400/40 shadow-emerald-950/50',
      summary: '古老遺跡 • 神廟機關 • 秘境尋寶',
      isDirectJump: false,
      games: [
        { id: 'escape', name: '神祕密室逃脫', iconComp: KeyRound, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/25 border-emerald-400/40', badge: '機關解謎' },
        { id: 'spotter', name: '鷹眼神探找不同', iconComp: Eye, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/25 border-amber-400/40', badge: '全冊紙雕' },
        { id: 'maze', name: '字母巡航迷宮', iconComp: Compass, iconColor: 'text-teal-400', iconBg: 'bg-teal-500/25 border-teal-400/40', badge: '字母航線' },
        { id: 'memory', name: '翻牌記憶對決', iconComp: Sparkles, iconColor: 'text-cyan-400', iconBg: 'bg-cyan-500/25 border-cyan-400/40', badge: '記憶配對' }
      ]
    },
    {
      id: 'speed',
      title: '極速反應',
      enTitle: 'SPEED & ARCADE',
      icon: Flame,
      bgImage: POSTER_SPEED,
      tag: '4 款挑戰',
      colorName: 'amber',
      titleGlow: 'bg-gradient-to-b from-yellow-100 via-amber-300 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_0_18px_rgba(245,158,11,0.8)]',
      spineTextColor: 'text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]',
      borderClass: 'border-amber-500/60 hover:border-amber-400',
      activeRingClass: 'ring-amber-400/60 border-amber-300',
      tagBadge: 'bg-amber-950/80 text-amber-300 border-amber-400/50',
      plaqueBg: 'bg-amber-950/75 border-amber-400/40 shadow-amber-950/50',
      summary: '熔岩競技 • 隕石突擊 • 閃電手速',
      isDirectJump: false,
      games: [
        { id: 'mole', name: '單字打地鼠', iconComp: Zap, iconColor: 'text-amber-300', iconBg: 'bg-amber-500/25 border-amber-400/40', badge: '地穴手速' },
        { id: 'swipe', name: '極速是非滑牌', iconComp: Flame, iconColor: 'text-rose-400', iconBg: 'bg-rose-500/25 border-rose-400/40', badge: '30秒對決' },
        { id: 'meteor', name: '3D 隕石防衛戰', iconComp: Rocket, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/25 border-amber-400/40', badge: '打字擊墜' },
        { id: 'snake', name: '叢林神山貪蛇', iconComp: Zap, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/25 border-emerald-400/40', badge: '百步蛇' }
      ]
    },
    {
      id: 'quiz',
      title: '詞句試煉',
      enTitle: 'WORD & SENTENCE TRIALS',
      icon: Layers,
      bgImage: POSTER_QUIZ,
      tag: '4 款挑戰',
      colorName: 'blue',
      titleGlow: 'bg-gradient-to-b from-white via-sky-200 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_0_18px_rgba(56,189,248,0.7)]',
      spineTextColor: 'text-sky-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]',
      borderClass: 'border-blue-500/60 hover:border-blue-400',
      activeRingClass: 'ring-blue-400/60 border-blue-300',
      tagBadge: 'bg-blue-950/80 text-blue-300 border-blue-400/50',
      plaqueBg: 'bg-blue-950/75 border-blue-400/40 shadow-blue-950/50',
      summary: '星空書閣 • 積木造句 • 神筆聽寫',
      isDirectJump: false,
      games: [
        { id: 'sentence', name: '句型積木工坊', iconComp: Layers, iconColor: 'text-sky-400', iconBg: 'bg-sky-500/25 border-sky-400/40', badge: '句型重組' },
        { id: 'spelling', name: '單字積木拼裝', iconComp: Puzzle, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/25 border-amber-400/40', badge: '積木拼字' },
        { id: 'quiz-listening', name: '英語聽力試煉', iconComp: Volume2, iconColor: 'text-cyan-400', iconBg: 'bg-cyan-500/25 border-cyan-400/40', badge: '聲波搶答' },
        { id: 'handwriting', name: '神筆筆順書寫', iconComp: PenTool, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/25 border-emerald-400/40', badge: '四線三格' }
      ]
    },
    {
      id: 'battle',
      title: '多人連線',
      enTitle: 'LIVE BATTLE',
      icon: Swords,
      bgImage: POSTER_BATTLE,
      tag: 'LIVE 對戰',
      colorName: 'purple',
      titleGlow: 'bg-gradient-to-b from-white via-purple-200 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_0_18px_rgba(217,70,239,0.8)]',
      spineTextColor: 'text-purple-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]',
      borderClass: 'border-purple-500/60 hover:border-purple-400',
      activeRingClass: 'ring-purple-400/60 border-purple-300',
      tagBadge: 'bg-purple-950/80 text-purple-300 border-purple-400/50',
      plaqueBg: 'bg-purple-950/75 border-purple-400/40 shadow-purple-950/50',
      summary: '星際擂台 • 雙人交鋒 • 榮譽爭霸',
      isDirectJump: true,
      jumpTarget: 'battle'
    },
    {
      id: 'town',
      title: '霧臺小鎮',
      enTitle: 'WUTAI TOWN',
      icon: Store,
      bgImage: POSTER_TOWN,
      tag: '部落探索',
      colorName: 'yellow',
      titleGlow: 'bg-gradient-to-b from-amber-100 via-amber-200 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_0_18px_rgba(234,179,8,0.7)]',
      spineTextColor: 'text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]',
      borderClass: 'border-yellow-600/60 hover:border-yellow-400',
      activeRingClass: 'ring-yellow-400/60 border-yellow-300',
      tagBadge: 'bg-amber-950/80 text-yellow-300 border-yellow-500/50',
      plaqueBg: 'bg-amber-950/75 border-yellow-500/40 shadow-amber-950/50',
      summary: '夕陽百岳 • 石板屋舍 • 族人學伴',
      isDirectJump: true,
      jumpTarget: 'town'
    }
  ], []);

  // ── 當前選中的遊戲資訊 ──
  const currentGameObj = useMemo(() => {
    for (const c of COLUMNS) {
      if (c.games) {
        const found = c.games.find(g => g.id === selectedGame);
        if (found) return { ...found, categoryTitle: c.title, colorName: c.colorName, bgImage: c.bgImage };
      }
    }
    return { id: 'escape', name: '神祕密室逃脫', iconComp: KeyRound, categoryTitle: '探索解謎', bgImage: POSTER_EXPLORE };
  }, [COLUMNS, selectedGame]);

  // ── 題庫單元分組 ──
  const groupedUnits = useMemo(() => {
    const map = {};
    words.forEach(w => {
      const bKey = String(w.book);
      if (!map[bKey]) {
        map[bKey] = {
          book: bKey,
          author: w.author || 'Official',
          lessons: new Set()
        };
      }
      map[bKey].lessons.add(w.lesson);
    });
    return map;
  }, [words]);

  // ── 當前選中的冊次選項資料 ──
  const currentOptionData = useMemo(() => {
    return ALL_GRADE_OPTIONS.find(o => o.id === selectedOptionId) || ALL_GRADE_OPTIONS[2];
  }, [selectedOptionId]);

  // ── 是否為僅支援全冊的遊戲 (如鷹眼神探找不同) ──
  const isWholeBookOnlyGame = selectedGame === 'spotter';

  // ── 四碼膠囊代碼轉換器 (例: 2-3 -> B2U3, 4-festival -> B4Fe, 2-0 -> B2St, abc -> Aa) ──
  const formatUnitToShortCode = (unitKey) => {
    if (!unitKey) return '';
    if (unitKey === 'abc') {
      if (alphaMode === 'lower') return 'az';
      if (alphaMode === 'mixed') return 'Aa';
      return 'AZ';
    }
    const [bPart, lPartRaw] = unitKey.split('-');
    const bStr = `B${bPart}`;
    const lPart = (lPartRaw || '').toLowerCase();
    if (lPart === '0' || lPart.includes('starter')) return `${bStr}St`;
    if (lPart.includes('fest')) return `${bStr}Fe`;
    if (lPart.includes('rev')) return `${bStr}Re`;
    const numMatch = lPart.match(/\d+/);
    if (numMatch) return `${bStr}U${numMatch[0]}`;
    return `${bStr}U1`;
  };

  // ── 當冊次或字母模式變更時，僅在全冊專用遊戲中自動鎖定全冊，可選單元遊戲嚴格保持使用者現有清單不亂跳 ──
  useEffect(() => {
    if (isWholeBookOnlyGame) {
      if (currentOptionData.isAlpha) {
        setSettings(prev => ({
          ...prev,
          alphaMode: alphaMode,
          alphaGrade: currentOptionData.grade,
          selectedUnits: ['abc']
        }));
      } else {
        const bKey = currentOptionData.book;
        const bData = groupedUnits[bKey];
        const allUnits = (bData && bData.lessons && bData.lessons.size > 0)
          ? Array.from(bData.lessons).map(l => `${bKey}-${l}`)
          : [`${bKey}-all`];
        setSettings(prev => ({
          ...prev,
          selectedBook: bKey,
          alphaMode: null,
          alphaGrade: null,
          selectedUnits: allUnits
        }));
      }
    }
  }, [currentOptionData, alphaMode, isWholeBookOnlyGame, groupedUnits, setSettings]);

  // ── 判斷特定通用單元是否已在當前冊次中全選 ──
  const isUniversalUnitSelected = (unitId) => {
    if (currentOptionData.isAlpha) {
      return (settings.selectedUnits || []).includes('abc');
    }
    const bKey = currentOptionData.book;
    const bData = groupedUnits[bKey];
    if (!bData || !bData.lessons) return false;
    const allBookUnits = Array.from(bData.lessons).map(l => `${bKey}-${l}`);
    const selected = settings.selectedUnits || [];

    if (unitId === 'all') {
      return allBookUnits.length > 0 && allBookUnits.every(u => selected.includes(u));
    }

    let targetNum = '1';
    if (unitId === 'starter') targetNum = '0';
    else if (unitId === 'unit1') targetNum = '1';
    else if (unitId === 'unit2') targetNum = '2';
    else if (unitId === 'unit3') targetNum = '3';
    else if (unitId === 'unit4') targetNum = '4';
    else if (unitId === 'festival') targetNum = 'festival';

    const matchedBookUnits = allBookUnits.filter(u => {
      const lessonPart = u.split('-')[1]?.toLowerCase() || '';
      return lessonPart.includes(targetNum) || lessonPart === targetNum;
    });

    if (matchedBookUnits.length === 0) return false;
    return matchedBookUnits.every(u => selected.includes(u));
  };

  // ── 切換單元複選 (點擊亮起，再點歸暗，支援可完全取消清空) ──
  const handleToggleUniversalUnit = (unitId) => {
    soundEngine.click();
    const bKey = currentOptionData.book;
    const bData = groupedUnits[bKey];
    if (!bData || !bData.lessons) return;
    const allBookUnits = Array.from(bData.lessons).map(l => `${bKey}-${l}`);

    setSettings(prev => {
      const currentSelected = new Set(prev.selectedUnits || []);
      // 若先前有 abc 字母模式且現在選的是冊次，清除 abc
      currentSelected.delete('abc');

      if (unitId === 'all') {
        const allSelected = allBookUnits.length > 0 && allBookUnits.every(u => currentSelected.has(u));
        if (allSelected) {
          // 本冊全部取消選取
          allBookUnits.forEach(u => currentSelected.delete(u));
        } else {
          // 全部加入
          allBookUnits.forEach(u => currentSelected.add(u));
        }
      } else {
        let targetNum = '1';
        if (unitId === 'starter') targetNum = '0';
        else if (unitId === 'unit1') targetNum = '1';
        else if (unitId === 'unit2') targetNum = '2';
        else if (unitId === 'unit3') targetNum = '3';
        else if (unitId === 'unit4') targetNum = '4';
        else if (unitId === 'festival') targetNum = 'festival';

        const matched = allBookUnits.filter(u => {
          const lessonPart = u.split('-')[1]?.toLowerCase() || '';
          return lessonPart.includes(targetNum) || lessonPart === targetNum;
        });

        const targets = matched.length > 0 ? matched : [allBookUnits[0]];
        const isCurrentlyActive = targets.every(u => currentSelected.has(u));

        if (isCurrentlyActive) {
          // 取消選取該單元
          targets.forEach(u => currentSelected.delete(u));
        } else {
          // 加入選取
          targets.forEach(u => currentSelected.add(u));
        }
      }

      return {
        ...prev,
        alphaMode: null,
        selectedUnits: Array.from(currentSelected)
      };
    });
  };

  // ── 從底部已選托盤移除特定單元 (支援點叉叉完全移除) ──
  const handleRemoveSelectedUnit = (unitKey) => {
    if (isWholeBookOnlyGame) return; // 全冊遊戲不允許移除單元
    soundEngine.click();
    setSettings(prev => {
      const current = prev.selectedUnits || [];
      return {
        ...prev,
        selectedUnits: current.filter(u => u !== unitKey)
      };
    });
  };

  // ── 已選單字總數 & 句型實際可玩題數 ──
  const selectedWordsCount = useMemo(() => {
    const sel = settings.selectedUnits || [];
    if (sel.includes('abc')) return 26;
    return words.filter(w => sel.includes(`${w.book}-${w.lesson}`)).length;
  }, [words, settings?.selectedUnits]);

  const sentenceScopeInfo = useMemo(() => {
    return parseSelectedSentenceScope(settings?.selectedUnits || [], qualifyingBook);
  }, [settings?.selectedUnits, qualifyingBook]);

  const availableSentenceCount = useMemo(() => {
    return getAvailableSentenceCount({
      selectedUnits: settings?.selectedUnits || [],
      qualifyingBook,
      level: sentenceLevel,
      alphaGrade: currentOptionData?.grade || 1
    });
  }, [settings?.selectedUnits, qualifyingBook, sentenceLevel, currentOptionData?.grade]);

  const unlockedCrossUnitCount = useMemo(() => {
    if (selectedGame !== 'sentence') return 0;
    return getAvailableSentences({
      selectedUnits: settings?.selectedUnits || [],
      qualifyingBook,
      includeCrossUnit: true,
      level: sentenceLevel
    }).filter(q => q.isCrossUnit).length;
  }, [selectedGame, settings?.selectedUnits, qualifyingBook, sentenceLevel]);

  // ── 點擊外層欄位 ──
  const handleColumnClick = (col) => {
    soundEngine.click();
    if (col.isDirectJump) {
      onNavigate(col.jumpTarget);
      return;
    }
    setActiveCol(col.id);
    if (col.games && col.games.length > 0) {
      setSelectedGame(col.games[0].id);
    }
  };

  // ── 點選具體子遊戲：直接絲滑展開至 100% 全螢幕選冊整備頁 ──
  const handleSelectGame = (gameId) => {
    soundEngine.click();
    setSelectedGame(gameId);

    // 若為課本選擇題庫檢定，直接進入一頁一題無干擾檢定專區 (內建完整選冊/選單元/選題數面板)
    if (gameId === 'mcq-exam') {
      onNavigate('mcq-exam');
      return;
    }
    
    // 若為字母巡航迷宮，直接切換到專屬一頁式整備室 (分流 C)
    if (gameId === 'maze') {
      setStep('scope');
      return;
    }

    // 取得當前年級冊次預設所有單元
    const bKey = currentOptionData.book;
    const bData = groupedUnits[bKey];
    const defaultUnits = currentOptionData.isAlpha
      ? ['abc']
      : (bData && bData.lessons && bData.lessons.size > 0 ? Array.from(bData.lessons).map(l => `${bKey}-${l}`) : [`${bKey}-all`]);

    // 若該遊戲為全冊專用 (spotter)，直接鎖定當前冊次
    if (gameId === 'spotter') {
      setSettings(prev => ({
        ...prev,
        selectedBook: bKey,
        alphaMode: currentOptionData.isAlpha ? alphaMode : null,
        alphaGrade: currentOptionData.isAlpha ? currentOptionData.grade : null,
        selectedUnits: defaultUnits
      }));
    } else {
      // 若玩家未勾選記憶選擇，或者目前尚無已選單元，預設帶入當前冊次全單元，確保出征按鈕立即可點！
      // （若從英語教學館帶單元跳轉過來，則保留原單元範圍不強制覆蓋）
      const currentSelected = settings.selectedUnits || [];
      if ((!rememberSelection && !returnToTeaching) || currentSelected.length === 0) {
        setSettings(prev => ({
          ...prev,
          alphaMode: currentOptionData.isAlpha ? alphaMode : null,
          alphaGrade: currentOptionData.isAlpha ? currentOptionData.grade : null,
          selectedUnits: defaultUnits
        }));
      } else if (currentOptionData.isAlpha) {
        setSettings(prev => ({
          ...prev,
          alphaMode,
          alphaGrade: currentOptionData.grade,
          selectedUnits: ['abc']
        }));
      }
    }
    
    setStep('scope');
  };

  // ── 點選冊次 ──
  const handleSelectBookOption = (optId) => {
    soundEngine.click();
    setSelectedOptionId(optId);

    const optData = ALL_GRADE_OPTIONS.find(o => o.id === optId);
    if (!optData) return;

    const nextAlphaMode = optId === 'g2' ? 'lower' : optId === 'g1' ? 'upper' : alphaMode;
    if (optData.isAlpha) setAlphaMode(nextAlphaMode);

    const bKey = optData.book;
    const bData = groupedUnits[bKey];
    const newBookUnits = optData.isAlpha
      ? ['abc']
      : (bData && bData.lessons && bData.lessons.size > 0 ? Array.from(bData.lessons).map(l => `${bKey}-${l}`) : [`${bKey}-all`]);

    // 換冊時自動帶入該冊所有單元，讓學生無需額外點選單元膠囊即可出征
    setSettings(prev => ({
      ...prev,
      selectedBook: bKey,
      alphaMode: optData.isAlpha ? nextAlphaMode : null,
      alphaGrade: optData.isAlpha ? optData.grade : null,
      selectedUnits: newBookUnits
    }));
  };

  // ── 點選字母模式 ──
  const handleSelectAlphaMode = (mode) => {
    soundEngine.click();
    setAlphaMode(mode);
    setSettings(prev => ({
      ...prev,
      alphaMode: mode,
      alphaGrade: currentOptionData.isAlpha ? currentOptionData.grade : null
    }));
  };

  // ── 點選通用單元 ──
  const handleSelectUnit = (unitId) => {
    soundEngine.click();
    setSelectedUnitFilter(unitId);
  };

  // ── 上一步 ──
  const handleGoBack = () => {
    soundEngine.click();
    if (step === 'scope') {
      setStep('game');
    } else if (activeCol !== null) {
      setActiveCol(null);
    } else if (returnToTeaching && typeof onReturnToTeaching === 'function') {
      onReturnToTeaching();
    } else {
      onNavigate('portal');
    }
  };

  // ── 開始遊戲 ──
  const handleStartGame = () => {
    soundEngine.click();
    if (selectedGame === 'escape') {
      try {
        localStorage.setItem('wutai_escape_theme', escapeThemeId);
      } catch (e) {}
      onNavigate('escape');
    } else if (selectedGame === 'maze') {
      try {
        localStorage.setItem('wutai_maze_theme', mazeTheme);
        localStorage.setItem('wutai_maze_tier', mazeTier);
        localStorage.setItem('wutai_maze_isLowercase', mazeIsLowercase ? 'true' : 'false');
        localStorage.setItem('wutai_maze_rangePreset', mazeRangePreset);
        if (mazeTier === 'beginner') {
          const s = mazeIsLowercase ? mazeStartChar.toLowerCase() : mazeStartChar.toUpperCase();
          const e = mazeIsLowercase ? mazeEndChar.toLowerCase() : mazeEndChar.toUpperCase();
          localStorage.setItem('wutai_maze_startChar', s);
          localStorage.setItem('wutai_maze_endChar', e);
        } else {
          localStorage.setItem('wutai_maze_startChar', mazeIsLowercase ? 'a' : 'A');
          localStorage.setItem('wutai_maze_endChar', mazeIsLowercase ? 'z' : 'Z');
        }
      } catch (e) {}
      onNavigate('maze');
    } else if (selectedGame === 'snake') {
      try {
        localStorage.setItem('wutai_snake_difficulty', snakeDifficulty);
      } catch (e) {}
      onNavigate('snake');
    } else if (selectedGame === 'memory') {
      try {
        localStorage.setItem('wutai_memory_mode', 'en-zh');
        localStorage.setItem('wutai_memory_card_theme', isDark ? 'noble_gold' : 'cyber_blue');
      } catch (e) {}
      onNavigate('memory');
    } else if (selectedGame === 'swipe') {
      try {
        localStorage.setItem('wutai_swipe_mode', swipeMode);
      } catch (e) {}
      onNavigate('swipe');
    } else if (selectedGame === 'sentence') {
      const isAlphaSentence = Boolean(currentOptionData?.isAlpha || (settings.selectedUnits || []).includes('abc'));
      if (isAlphaSentence) {
        const launchAlphaGrade = currentOptionData?.grade === 2 ? 2 : 1;
        try {
          localStorage.setItem('wutai_sentence_units', JSON.stringify(['abc']));
          localStorage.setItem('wutai_sentence_alpha_mode', alphaMode);
          localStorage.setItem('wutai_sentence_alpha_grade', String(launchAlphaGrade));
        } catch (e) {}
        onNavigate('sentence', {
          units: 'abc',
          alphaMode,
          alphaGrade: launchAlphaGrade
        });
      } else {
        const launchUnits = (settings.selectedUnits || []).length > 0
          ? settings.selectedUnits
          : [`${currentOptionData?.book || '1'}-all`];
        try {
          localStorage.setItem('wutai_sentence_level', sentenceLevel);
          localStorage.setItem('wutai_sentence_units', JSON.stringify(launchUnits));
        } catch (e) {}
        onNavigate('sentence', {
          units: launchUnits.join(','),
          level: sentenceLevel
        });
      }
    } else if (selectedGame === 'quiz-choice') {
      try {
        localStorage.setItem('wutai_quiz_choice_dir', quizChoiceDirection);
      } catch (e) {}
      onNavigate('quiz-choice');
    } else if (selectedGame === 'quiz-listening') {
      try {
        localStorage.setItem('wutai_quiz_listening_sub', quizListeningSubMode);
      } catch (e) {}
      onNavigate('quiz-listening');
    } else {
      onNavigate(selectedGame);
    }
  };

  return (
    <div className={`fixed inset-0 w-full h-[100dvh] flex flex-col justify-between overflow-hidden select-none z-10 animate-fadeIn font-sans transition-colors duration-300 ${
      isDark
        ? 'bg-slate-950 text-white'
        : 'bg-gradient-to-b from-amber-50/50 via-slate-50/60 to-emerald-50/40 text-slate-800'
    }`}>
      
      {/* ── 背景環境微光 ── */}
      {isDark ? (
        <>
          <div className="absolute inset-0 bg-slate-950 pointer-events-none" />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/80 via-white/80 to-emerald-50/80 pointer-events-none" />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* 🏛️ 全域 8 大希臘眾神 3D 輪轉圖鑑彈窗 (可在選單、整備室隨時開啟) */}
      <PowerUpCodexModal isOpen={showMemoryCodex} onClose={() => setShowMemoryCodex(false)} />

      {/* ════════════════════════════════════════════════════════════════
          【固定頂部 HUD】左上回首頁 / 上一步 • 上中英雄榜 • 右上模式/音效/通行證
         ════════════════════════════════════════════════════════════════ */}
      <header className={`relative z-30 w-full px-2 sm:px-6 py-1.5 sm:py-2.5 backdrop-blur-md border-b flex items-center justify-between shadow-xl shrink-0 transition-colors duration-300 gap-1 sm:gap-2 ${
        isDark
          ? 'bg-slate-950/85 border-white/10 text-white'
          : 'bg-white/85 border-slate-200/90 text-slate-800 shadow-sm'
      }`}>
        
        {/* 左上角：上一步 / 回首頁 (手機版純圖示零擠壓) */}
        <button
          type="button"
          onClick={handleGoBack}
          className={`p-1.5 sm:px-3.5 sm:py-1.5 rounded-xl border text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer shrink-0 ${
            isDark
              ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 hover:text-white border-white/20'
              : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-300 shadow-sm'
          }`}
          title={step === 'scope' ? '返回選擇其他遊戲' : returnToTeaching ? '返回霧臺英語教學館' : '返回英語學習宇宙首頁'}
        >
          {step === 'scope' ? (
            <>
              <ArrowLeft className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className="hidden sm:inline">回選遊戲</span>
            </>
          ) : returnToTeaching ? (
            <>
              <ArrowLeft className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">回霧臺英語教學館</span>
            </>
          ) : (
            <>
              <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">回首頁</span>
            </>
          )}
        </button>

        {/* 置上中：英雄榜 或 整備室標題 (手機版精簡不折行) */}
        {step === 'scope' ? (
          <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 rounded-2xl border shadow-md transition-colors min-w-0 shrink-0 ${
            isDark ? 'bg-slate-900/90 border-white/20 text-white' : 'bg-white border-amber-300/80 text-slate-800 shadow-sm'
          }`}>
            <currentGameObj.iconComp className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <span className="font-heading font-black text-xs sm:text-sm tracking-wide truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none">
              {currentGameObj.name}
            </span>
            <span className="hidden xs:inline text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 font-bold shrink-0">
              {currentGameObj.categoryTitle}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              soundEngine.click();
              onOpenLeaderboard();
            }}
            className="p-1.5 sm:px-4 sm:py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-yellow-500/30 to-amber-500/25 hover:from-amber-500/35 hover:to-yellow-500/45 border-2 border-amber-500/60 text-amber-800 dark:text-amber-200 font-heading text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer backdrop-blur-md shrink-0"
            title="查看全校與年級英雄榜"
          >
            <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-bounce shrink-0" />
            <span className="tracking-wide hidden sm:inline">英雄榜</span>
            <span className="hidden md:inline text-[11px] text-amber-700 dark:text-amber-300 font-mono">
              (看{studentGradeNum}年級排行)
            </span>
          </button>
        )}

        {/* 右上角控制群組：業界標準統一排序（聲音 ➔ 雙語 ➔ 日夜主題 ➔ 勇士探險通行證） */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* 1. 靜音/音效切換按鈕 */}
          <button
            type="button"
            onClick={() => {
              const m = soundEngine.toggleMute();
              setIsMuted(m);
            }}
            className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center border shrink-0 ${
              isDark
                ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-white/20'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300'
            }`}
            title={isMuted ? '開啟音效' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
          </button>

          {/* 2. 雙語切換按鈕 */}
          <button
            type="button"
            onClick={() => {
              soundEngine.click();
              if (toggleLang) toggleLang();
            }}
            className={`p-1.5 sm:px-2.5 sm:py-2 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1 border shrink-0 ${
              isDark
                ? 'bg-slate-900/90 hover:bg-slate-800 text-blue-400 border-white/20'
                : 'bg-white hover:bg-slate-50 text-blue-600 border-slate-300'
            }`}
            title={lang === 'zh-TW' ? 'Switch to English' : '切換為繁體中文'}
          >
            <Globe className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-black hidden sm:inline">{lang === 'zh-TW' ? 'EN' : '中文'}</span>
          </button>

          {/* 3. 日夜切換按鈕 */}
          <button
            type="button"
            onClick={() => {
              soundEngine.click();
              toggleTheme();
            }}
            className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center border relative shrink-0 ${
              isDark
                ? 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border-white/20'
                : 'bg-white hover:bg-slate-50 text-amber-500 border-slate-300'
            }`}
            title={
              isAuto
                ? (isDark ? '星月夜間模式 (依時鐘自動，點擊切換為手動白天)' : '晨曦日間模式 (依時鐘自動，點擊切手動夜間)')
                : (isDark ? '當前為手動夜間 (點擊回歸時鐘自動)' : '當前為手動白天 (點擊切換為手動夜間)')
            }
          >
            {isDark ? <Moon className="w-4 h-4 text-cyan-300" /> : <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />}
            {isAuto && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white dark:ring-slate-900" title="隨時鐘自動切換" />
            )}
          </button>

          {/* 4. 勇士探險通行證 (固定錨定於最右側，手機版精簡為頭像+金幣，零多行折疊) */}
          <button
            type="button"
            onClick={() => {
              soundEngine.click();
              if (openModal) openModal();
            }}
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-black flex items-center gap-1 sm:gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer backdrop-blur-md shrink-0 ${
              isDark
                ? 'bg-slate-900/90 hover:bg-slate-800 text-white border-emerald-400/30'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-emerald-500/40 shadow-sm'
            }`}
            title="點擊開啟勇士探險通行證"
          >
            {currentStudent?.avatar_id ? (
              <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-emerald-400 shrink-0 relative bg-slate-950">
                <img
                  src={`/assets/avatars/${currentStudent.avatar_id}.webp`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            ) : (
              <User className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            )}
            <span className="max-w-[120px] truncate hidden sm:inline">
              {formatStudentBadge(currentStudent, lang) || '設置身分'}
            </span>
            {currentStudent?.coins !== undefined && (
              <span className="text-amber-500 dark:text-amber-400 font-mono font-bold flex items-center gap-0.5 text-xs">
                <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>{currentStudent.coins}</span>
              </span>
            )}
          </button>
        </div>

      </header>

      {/* ════════════════════════════════════════════════════════════════
          【中央主舞台】
          Step 1: 電腦橫向 5 欄 / 手機縱向 5 列手風琴
          Step 2: 5 欄 × 2 列上下配對網格 (位置偏上，下方預留專屬彈出區，零跳動)
         ════════════════════════════════════════════════════════════════ */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto p-2 sm:p-3 md:p-4 flex flex-col justify-center overflow-hidden">
        
        {/* ────────────────────────────────────────────────────────
            【步驟一：選遊戲】電腦橫向手風琴 / 手機縱向手風琴
           ──────────────────────────────────────────────────────── */}
        {step === 'game' && (
          <div className="w-full h-full flex flex-col md:flex-row items-stretch gap-2 sm:gap-2.5 md:gap-3 overflow-hidden">
            {COLUMNS.map((col) => {
              const isSelectedCol = activeCol === col.id;
              const isCompressed = activeCol !== null && !isSelectedCol;

              // 彈性比例
              const flexStyle = {
                flex: isSelectedCol ? (window.innerWidth >= 768 ? 6.5 : 5.5) : isCompressed ? 0.85 : 1
              };

              return (
                <div
                  key={col.id}
                  style={flexStyle}
                  onClick={() => !isSelectedCol && handleColumnClick(col)}
                  className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col cursor-pointer group shadow-2xl ${
                    isSelectedCol
                      ? `${col.activeRingClass} ring-4 shadow-[0_0_35px_rgba(0,0,0,0.8)]`
                      : isCompressed
                      ? 'border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
                      : `${col.borderClass} hover:scale-[1.01]`
                  }`}
                >
                  
                  {/* 背景圖層 */}
                  <img
                    src={col.bgImage}
                    alt={col.title}
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out select-none pointer-events-none ${
                      isSelectedCol
                        ? 'brightness-[0.6] contrast-[1.05]'
                        : isCompressed
                        ? 'brightness-[0.35] contrast-[1.1]'
                        : 'brightness-[0.85] contrast-[1.05] group-hover:brightness-[0.95] group-hover:scale-105'
                    }`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-slate-950/20 pointer-events-none" />

                  {/* 壓縮狀態 */}
                  {isCompressed ? (
                    <div className="relative z-10 w-full h-full flex md:flex-col items-center justify-between p-2 sm:p-2.5 text-center animate-fadeIn select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1" />
                      <div className="flex md:flex-col items-center justify-center gap-1.5 sm:gap-2 my-auto select-none">
                        {col.title.split('').map((char, cIdx) => (
                          <span
                            key={cIdx}
                            className={`text-sm sm:text-base font-black font-serif ${col.spineTextColor} tracking-widest`}
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white animate-pulse mb-1" />
                    </div>
                  ) : isSelectedCol ? (
                    /* 展開狀態 */
                    <div className="relative z-10 w-full h-full p-3 sm:p-4 md:p-5 flex flex-col justify-between overflow-hidden animate-fadeIn select-none">
                      
                      {/* 展開頂部銘牌 */}
                      <div className={`px-3 py-1.5 sm:py-2 rounded-xl backdrop-blur-md border shadow-lg flex items-center justify-between shrink-0 ${col.plaqueBg}`}>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-base sm:text-xl font-black font-serif tracking-wider ${col.titleGlow}`}>
                            {col.title}
                          </h3>
                          <span className="text-[10px] font-mono tracking-widest text-white/70 uppercase hidden sm:inline">
                            {col.enTitle}
                          </span>
                          <span className="text-xs text-slate-200 font-bold hidden md:inline ml-1">
                            • {col.summary}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.click();
                            setActiveCol(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-black/50 hover:bg-black/70 text-slate-200 hover:text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                          title="還原所有欄位"
                        >
                          <X className="w-3 h-3" />
                          <span>還原</span>
                        </button>
                      </div>

                      <div className="flex-1 min-h-[20px]" />

                      {/* 展開底部：子遊戲按鈕 */}
                      <div className="w-full max-w-2xl mx-auto flex flex-col gap-1.5 shrink-0">
                        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                          {col.games?.map((g) => {
                            const isGameActive = selectedGame === g.id;
                            const IconComp = g.iconComp;
                            return (
                              <button
                                key={g.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectGame(g.id);
                                }}
                                className={`px-3 py-2.5 sm:py-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 relative group active:scale-98 backdrop-blur-md shadow-lg ${
                                  isGameActive
                                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 border-amber-200 ring-4 ring-amber-300/80 font-black scale-102'
                                    : isDark
                                    ? 'bg-slate-950/85 hover:bg-slate-900/95 text-white/95 border-white/25 hover:border-amber-400/60 hover:scale-101'
                                    : 'bg-white/90 hover:bg-white text-slate-800 border-slate-200/90 hover:border-amber-400/70 hover:scale-101 shadow-md'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                                    isGameActive ? 'bg-stone-950/20' : 'bg-amber-400/20 border border-amber-400/40'
                                  }`}>
                                    <IconComp className={`w-4 h-4 ${
                                      isGameActive ? 'text-stone-950' : isDark ? 'text-amber-300' : 'text-amber-600'
                                    }`} />
                                  </div>
                                  <h4 className="text-xs sm:text-sm font-black tracking-wide truncate">
                                    {g.name}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    isGameActive
                                      ? 'bg-stone-950/25 text-stone-950'
                                      : isDark
                                      ? 'bg-white/10 text-slate-200'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {g.badge}
                                  </span>
                                  <ChevronRight className={`w-4 h-4 ${isGameActive ? 'text-stone-950' : isDark ? 'text-white/40' : 'text-slate-400'}`} />
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="text-center text-[11px] font-bold text-amber-200 pt-1 shrink-0">
                          點選任一遊戲，直通專屬整備出征室 ➔
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* 均分預設狀態 */
                    <div className="relative z-10 w-full h-full p-3 sm:p-4 flex flex-col justify-between text-center group select-none">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border shadow-sm ${col.tagBadge}`}>
                          {col.tag}
                        </span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/80 group-hover:text-white group-hover:scale-110 transition-transform">
                          <col.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                        </div>
                      </div>

                      <div className="my-auto flex flex-col items-center">
                        <h3 className={`text-xl sm:text-2xl md:text-3xl font-black font-serif tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] ${col.titleGlow}`}>
                          {col.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-white/70 font-mono tracking-widest uppercase mt-1">
                          {col.enTitle}
                        </p>
                      </div>

                      <div>
                        <div className="mt-2 w-full py-1.5 rounded-xl bg-black/40 hover:bg-black/60 group-hover:bg-black/70 text-white font-black text-xs transition-colors border border-white/15 shadow">
                          {col.isDirectJump ? '點擊直通 ➔' : '點擊展開 ➔'}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* ────────────────────────────────────────────────────────
            【步驟二：專屬整備出征室】
            A. 若為「神祕密室逃脫」：全版四大秘境手風琴 (第一室實景 WebP)
            B. 若為其他遊戲：左下角靈魂剪影羽化融景 + 5 欄 × 2 列上下配對網格 (位置偏上，下方預留專屬單元彈出區，零跳動)
           ──────────────────────────────────────────────────────── */}
        {step === 'scope' && (
          <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-2xl flex flex-col justify-between animate-fadeIn">
            
            {/* 滿版電影級背景圖層 */}
            <img
              src={currentGameObj.bgImage}
              alt={currentGameObj.name}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-all duration-500 ${
                isDark ? 'brightness-[0.35] contrast-[1.1]' : 'brightness-[0.65] contrast-[1.05]'
              }`}
            />
            <div className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
              isDark ? 'bg-slate-950/80 backdrop-blur-md' : 'bg-white/70 backdrop-blur-md'
            }`} />

            {/* ═══ 分流 C：字母巡航迷宮專屬整備室（相同視覺、一頁畫面處理完畢） ═══ */}
            {selectedGame === 'maze' ? (
              /* ═══ 分流 C：字母巡航迷宮專屬整備室（相同視覺、一頁畫面處理完畢） ═══ */
              <div className="relative z-10 w-full h-full p-2.5 sm:p-4 md:p-5 flex flex-col justify-between overflow-y-auto">
                
                {/* 頂部引導題字 */}
                <div className={`flex items-center justify-between pb-2 border-b shrink-0 ${isDark ? 'border-white/15' : 'border-slate-300/80'}`}>
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 dark:text-teal-400" />
                    <h3 className={`text-sm sm:text-base font-black font-heading ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      請選擇字母巡航迷宮探索模式：
                    </h3>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 shadow ${
                    isDark ? 'bg-teal-500/20 text-teal-300 border-teal-400/40' : 'bg-teal-50 text-teal-800 border-teal-300'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                    <span>手指連結字母順序，安全巡航通往終點</span>
                  </span>
                </div>

                {/* ── 核心舞台：左側 1/4 靈魂大圖 (右側漸層完全透明融合) + 右側專屬三層選單 ── */}
                <div className="relative flex-1 w-full my-1 sm:my-2 flex items-stretch justify-between overflow-hidden">
                  
                  {/* 左側 1/4 遊戲真實動作瞬間原畫 (約佔 24%，右側邊緣逐漸透明融入) */}
                  <div className="hidden md:block absolute left-0 top-0 bottom-0 w-[24%] min-w-[190px] max-w-[270px] h-full pointer-events-none select-none z-0">
                    <img
                      src={GAME_SPOTLIGHT_ART.maze}
                      alt="Alphabet Maze Action Spotlight"
                      className="w-full h-full object-cover rounded-2xl filter brightness-95 contrast-105"
                      style={{
                        maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 100%)'
                      }}
                    />
                  </div>

                  {/* 右側專屬三層式結構面板：主題外觀置頂、難度層級置中、字母規格與航程置底 */}
                  <div className="relative z-10 w-full md:w-[76%] md:ml-auto h-full flex flex-col justify-between py-1 gap-2">
                    
                    {/* ═══ 【第一層：主題風格外觀】2 大經典世界觀 ═══ */}
                    <div className="w-full shrink-0">
                      <div className={`text-[11px] font-black mb-1 flex items-center justify-between ${isDark ? 'text-amber-200/90' : 'text-amber-900'}`}>
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          <span>1. 選擇巡航主題風格：</span>
                        </span>
                        <span className={`text-[10px] font-bold ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                          {mazeTheme === 'snake' ? '霧台神山百步蛇守護道' : '星際光軌太空巡航站'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 w-full">
                        {/* 主題 1：神山百步蛇 */}
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.click();
                            setMazeTheme('snake');
                          }}
                          className={`p-2 sm:p-2.5 rounded-2xl border-2 transition-all duration-150 cursor-pointer flex items-center gap-3 relative active:scale-95 shadow-md ${
                            mazeTheme === 'snake'
                              ? 'bg-gradient-to-r from-emerald-950/90 via-teal-900/90 to-emerald-900/90 text-white border-amber-300 ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                              : isDark
                              ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-white/20 hover:border-amber-400/60'
                              : 'bg-white/95 hover:bg-amber-50/70 text-slate-700 border-slate-200/90 hover:border-amber-400/60 shadow-sm'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl shrink-0">
                            🐍
                          </div>
                          <div className="flex flex-col text-left overflow-hidden">
                            <span className="text-xs sm:text-sm font-black font-heading text-amber-500 dark:text-amber-300 flex items-center gap-1.5">
                              <span>霧台神山 • 百步蛇守護道</span>
                              {mazeTheme === 'snake' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 inline" />}
                            </span>
                            <span className={`text-[9px] sm:text-[10px] line-clamp-1 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                              排灣與魯凱板岩古道，守護百步蛇引領前進，金光粒子足跡
                            </span>
                          </div>
                        </button>

                        {/* 主題 2：星際光軌 */}
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.click();
                            setMazeTheme('cosmic');
                          }}
                          className={`p-2 sm:p-2.5 rounded-2xl border-2 transition-all duration-150 cursor-pointer flex items-center gap-3 relative active:scale-95 shadow-md ${
                            mazeTheme === 'cosmic'
                              ? 'bg-gradient-to-r from-indigo-950/90 via-sky-900/90 to-indigo-900/90 text-white border-cyan-300 ring-2 ring-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                              : isDark
                              ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-white/20 hover:border-cyan-400/60'
                              : 'bg-white/95 hover:bg-sky-50/70 text-slate-700 border-slate-200/90 hover:border-cyan-400/60 shadow-sm'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl shrink-0">
                            🚀
                          </div>
                          <div className="flex flex-col text-left overflow-hidden">
                            <span className="text-xs sm:text-sm font-black font-heading text-cyan-600 dark:text-cyan-300 flex items-center gap-1.5">
                              <span>星際光軌 • 太空巡航站</span>
                              {mazeTheme === 'cosmic' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 inline" />}
                            </span>
                            <span className={`text-[9px] sm:text-[10px] line-clamp-1 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                              穿梭浩瀚星雲光子節點，推進器引擎噴射，賽博未來霓虹航線
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* ═══ 【第二層：挑戰難度層級】三大模式 ═══ */}
                    <div className="w-full shrink-0">
                      <div className={`text-[11px] font-black mb-1 flex items-center justify-between ${isDark ? 'text-amber-200/90' : 'text-amber-900'}`}>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          <span>2. 選擇巡航難度層級：</span>
                        </span>
                        <span className={`text-[10px] font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          {mazeTier === 'beginner' ? '自適應 5x5~8x8 • 全程常駐發光' : mazeTier === 'standard' ? '經典 8x8 迷宮 • 停頓智慧提示' : '巨大 10x10 迷宮 • 計時搶分極限榜'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 w-full">
                        {/* 新手級 */}
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.click();
                            setMazeTier('beginner');
                          }}
                          className={`p-2 rounded-2xl border-2 transition-all duration-150 cursor-pointer flex flex-col items-center justify-center relative active:scale-95 shadow-md ${
                            mazeTier === 'beginner'
                              ? 'bg-gradient-to-b from-emerald-500 via-teal-500 to-emerald-600 text-stone-950 border-emerald-200 ring-2 ring-emerald-300 font-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                              : isDark
                              ? 'bg-slate-900/90 hover:bg-slate-800 text-white border-white/20 hover:border-emerald-400/60'
                              : 'bg-white/95 hover:bg-emerald-50/70 text-slate-800 border-slate-200/90 hover:border-emerald-400/60 shadow-sm'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-black font-heading tracking-wide flex items-center gap-1">
                            <span>🌱 新手啟蒙級</span>
                            {mazeTier === 'beginner' && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                          </span>
                          <span className={`text-[8px] sm:text-[9px] font-bold mt-0.5 truncate max-w-full ${
                            mazeTier === 'beginner' ? 'text-stone-950/80' : isDark ? 'text-slate-300' : 'text-slate-500'
                          }`}>
                            起訖字母自由選 • 常駐發光指引
                          </span>
                        </button>

                        {/* 標準級 */}
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.click();
                            setMazeTier('standard');
                          }}
                          className={`p-2 rounded-2xl border-2 transition-all duration-150 cursor-pointer flex flex-col items-center justify-center relative active:scale-95 shadow-md ${
                            mazeTier === 'standard'
                              ? 'bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 text-stone-950 border-amber-200 ring-2 ring-amber-300 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                              : isDark
                              ? 'bg-slate-900/90 hover:bg-slate-800 text-white border-white/20 hover:border-amber-400/60'
                              : 'bg-white/95 hover:bg-amber-50/70 text-slate-800 border-slate-200/90 hover:border-amber-400/60 shadow-sm'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-black font-heading tracking-wide flex items-center gap-1">
                            <span>🧭 標準冒險級</span>
                            {mazeTier === 'standard' && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                          </span>
                          <span className={`text-[8px] sm:text-[9px] font-bold mt-0.5 truncate max-w-full ${
                            mazeTier === 'standard' ? 'text-stone-950/80' : isDark ? 'text-slate-300' : 'text-slate-500'
                          }`}>
                            8x8 經典迷宮 • 停頓 1 秒自適應提示
                          </span>
                        </button>

                        {/* 挑戰級 */}
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.click();
                            setMazeTier('challenge');
                          }}
                          className={`p-2 rounded-2xl border-2 transition-all duration-150 cursor-pointer flex flex-col items-center justify-center relative active:scale-95 shadow-md ${
                            mazeTier === 'challenge'
                              ? 'bg-gradient-to-b from-rose-500 via-red-500 to-rose-600 text-white border-rose-200 ring-2 ring-rose-300 font-black shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                              : isDark
                              ? 'bg-slate-900/90 hover:bg-slate-800 text-white border-white/20 hover:border-rose-400/60'
                              : 'bg-white/95 hover:bg-rose-50/70 text-slate-800 border-slate-200/90 hover:border-rose-400/60 shadow-sm'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-black font-heading tracking-wide flex items-center gap-1">
                            <span>⚡ 極限挑戰級</span>
                            {mazeTier === 'challenge' && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                          </span>
                          <span className={`text-[8px] sm:text-[9px] font-bold mt-0.5 truncate max-w-full ${
                            mazeTier === 'challenge' ? 'text-white/90' : isDark ? 'text-slate-300' : 'text-slate-500'
                          }`}>
                            10x10 巨大迷宮 • 計時搶分極限榜
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* ═══ 【第三層：字母字形規格與巡航區間】 ═══ */}
                    <div className="w-full shrink-0">
                      <div className={`text-[11px] font-black mb-1 flex items-center justify-between ${isDark ? 'text-amber-200/90' : 'text-amber-900'}`}>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          <span>3. 字母字形與航程範圍：</span>
                        </span>
                        <span className={`text-[10px] font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                          {mazeIsLowercase ? '🔡 小寫字母' : '🔠 大寫字母'}
                        </span>
                      </div>

                      <div className={`w-full min-h-[52px] sm:min-h-[58px] flex items-center justify-between p-2 rounded-2xl border backdrop-blur-md gap-2 ${
                        isDark ? 'bg-slate-900/90 border-white/20' : 'bg-white/95 border-slate-200/90 shadow-sm'
                      }`}>
                        {/* 大小寫切換 */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.click();
                              setMazeIsLowercase(false);
                            }}
                            className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                              !mazeIsLowercase
                                ? 'bg-amber-400 text-stone-950 border-amber-200 ring-2 ring-amber-300/80 shadow'
                                : isDark
                                ? 'bg-slate-800 text-slate-200 hover:text-white border-white/15'
                                : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                            }`}
                          >
                            🔠 大寫 A-Z
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.click();
                              setMazeIsLowercase(true);
                            }}
                            className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                              mazeIsLowercase
                                ? 'bg-amber-400 text-stone-950 border-amber-200 ring-2 ring-amber-300/80 shadow'
                                : isDark
                                ? 'bg-slate-800 text-slate-200 hover:text-white border-white/15'
                                : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                            }`}
                          >
                            🔡 小寫 a-z
                          </button>
                        </div>

                        {/* 航程範圍：新手級自選起訖字母與區間膠囊，標準/挑戰級顯示全套標牌 */}
                        {mazeTier === 'beginner' ? (
                          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5 flex-1 justify-end animate-fadeIn">
                            {/* 自選起訖下拉選單 */}
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-xs shrink-0 ${
                              isDark ? 'bg-slate-950/90 border-white/20' : 'bg-slate-50 border-slate-300 shadow-sm'
                            }`}>
                              <span className={`text-[10px] font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>起點：</span>
                              <select
                                value={mazeStartChar}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMazeStartChar(val);
                                  setMazeRangePreset('custom');
                                  soundEngine.click();
                                  if (val >= mazeEndChar) {
                                    const nextIdx = Math.min(25, ALPHABET_UPPER.indexOf(val) + 3);
                                    setMazeEndChar(ALPHABET_UPPER[nextIdx]);
                                  }
                                }}
                                className={`font-mono font-black text-xs px-1.5 py-0.5 rounded border outline-none cursor-pointer ${
                                  isDark ? 'bg-slate-800 text-amber-300 border-white/20' : 'bg-white text-amber-800 border-slate-300'
                                }`}
                              >
                                {ALPHABET_UPPER.slice(0, 24).map(c => (
                                  <option key={c} value={c}>{mazeIsLowercase ? c.toLowerCase() : c}</option>
                                ))}
                              </select>

                              <span className={`text-[10px] font-bold ml-1 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>終點：</span>
                              <select
                                value={mazeEndChar}
                                onChange={(e) => {
                                  setMazeEndChar(e.target.value);
                                  setMazeRangePreset('custom');
                                  soundEngine.click();
                                }}
                                className={`font-mono font-black text-xs px-1.5 py-0.5 rounded border outline-none cursor-pointer ${
                                  isDark ? 'bg-slate-800 text-amber-300 border-white/20' : 'bg-white text-amber-800 border-slate-300'
                                }`}
                              >
                                {ALPHABET_UPPER.slice(ALPHABET_UPPER.indexOf(mazeStartChar) + 1).map(c => (
                                  <option key={c} value={c}>{mazeIsLowercase ? c.toLowerCase() : c}</option>
                                ))}
                              </select>
                            </div>

                            {/* 4 個快速推薦區間膠囊 */}
                            {[
                              { id: 'AH', label: 'A-H (8字)', s: 'A', e: 'H' },
                              { id: 'AM', label: 'A-M (13字)', s: 'A', e: 'M' },
                              { id: 'NZ', label: 'N-Z (13字)', s: 'N', e: 'Z' },
                              { id: 'AZ', label: 'A-Z (全套)', s: 'A', e: 'Z' }
                            ].map((p) => {
                              const isActive = mazeStartChar === p.s && mazeEndChar === p.e;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    soundEngine.click();
                                    setMazeStartChar(p.s);
                                    setMazeEndChar(p.e);
                                    setMazeRangePreset(p.id);
                                  }}
                                  className={`py-1 px-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer border active:scale-95 ${
                                    isActive
                                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-stone-950 border-emerald-200 ring-2 ring-emerald-300 font-black'
                                      : isDark
                                      ? 'bg-slate-800/90 text-slate-300 hover:text-white border-white/15'
                                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                                  }`}
                                >
                                  {p.label}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-black text-amber-500 dark:text-amber-300 px-2 animate-fadeIn">
                            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                            <span>全航程 26 字母完整考驗 • 手指連續滑動貫通迷宮！</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 整備室底部：狀態摘要與出征按鈕 */}
                <div className={`pt-2 border-t flex items-center justify-between shrink-0 ${isDark ? 'border-white/15' : 'border-slate-300/80'}`}>
                  <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    <span>出征整備：</span>
                    <span className="text-amber-500 dark:text-amber-300 font-black">
                      【{mazeTheme === 'snake' ? '霧台神山百步蛇' : '星際光軌巡航'}】• {mazeTier === 'beginner' ? `新手級 (${mazeStartChar}-${mazeEndChar})` : mazeTier === 'standard' ? '標準級 (8x8)' : '挑戰級 (10x10)'} • {mazeIsLowercase ? '小寫 a-z' : '大寫 A-Z'}
                    </span>
                    {mazeTier === 'challenge' ? (
                      <span className="text-amber-400 font-black hidden sm:inline ml-1 animate-pulse">
                        • 🏆 全校英雄榜榮譽資格 (需 100% 零失誤完美路線)
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold hidden sm:inline ml-1">
                        • 🌱 練習模式 (無英雄榜；挑戰級 10x10 零提示方可登榜)
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleStartGame}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-stone-950 font-heading font-black text-sm sm:text-base flex items-center gap-2 shadow-2xl active:scale-95 transition-all cursor-pointer border-2 border-amber-200"
                  >
                    <span>⚔️ 開始巡航 START</span>
                    <Play className="w-4 h-4 fill-stone-950" />
                  </button>
                </div>

              </div>
            ) : (
              /* ═══ 分流 B：全單人通用整備室 ═══ */
              <div className="relative z-10 w-full h-full p-2.5 sm:p-4 md:p-5 flex flex-col justify-between overflow-y-auto">
                
                {/* 頂部引導題字 */}
                <div className={`flex items-center justify-between pb-2 border-b shrink-0 ${isDark ? 'border-white/15' : 'border-slate-300/80'}`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <h3 className={`text-sm sm:text-base font-black font-heading ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      請選擇挑戰年級冊次：
                    </h3>
                  </div>

                  {/* 記憶翻牌專屬：醒目 3D 眾神圖鑑大按鈕 / 其他遊戲：英雄榜上榜資質標牌 */}
                  {selectedGame === 'memory' ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.click();
                        setShowMemoryCodex(true);
                      }}
                      className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.6)] border border-amber-200 cursor-pointer transition-all active:scale-95 animate-pulse"
                    >
                      <BookOpen className="w-4 h-4 text-stone-950" />
                      <span>🏛️ 查看 8 大希臘眾神圖鑑 (3D 輪轉)</span>
                    </button>
                  ) : selectedGame === 'sentence' ? (
                    <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 shadow ${
                      isDark ? 'bg-sky-500/20 text-sky-300 border-sky-400/40' : 'bg-sky-50 text-sky-800 border-sky-300'
                    }`}>
                      <Trophy className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                      <span>已全面開放：一～二年級 abc ＋ 第 1～8 冊（支援英雄榜＆八冊秘典）</span>
                    </span>
                  ) : (
                    /* 當前上榜資質標牌 */
                    <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 shadow ${
                      isDark ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                      <span>選冊即可直接獲得英雄榜資格</span>
                    </span>
                  )}
                </div>

                {/* ── 核心舞台：左側 1/4 靈魂大圖 (右側漸層完全透明融合) + 右側專屬三層選單 ── */}
                <div className="relative flex-1 w-full my-1 sm:my-2 flex items-stretch justify-between overflow-hidden">
                  
                  {/* 左側 1/4 遊戲真實動作瞬間原畫 (約佔 24%，右側邊緣逐漸透明融入，絕不遮擋任何膠囊) */}
                  <div className="hidden md:block absolute left-0 top-0 bottom-0 w-[24%] min-w-[190px] max-w-[270px] h-full pointer-events-none select-none z-0">
                    <img
                      src={selectedGame === 'escape' ? (ESCAPE_THEME_SPOTLIGHT[escapeThemeId] || ESCAPE_THEME_SPOTLIGHT.temple) : (GAME_SPOTLIGHT_ART[selectedGame] || GAME_SPOTLIGHT_ART.mole)}
                      alt="Game Action Spotlight"
                      className="w-full h-full object-cover rounded-2xl filter brightness-95 contrast-105"
                      style={{
                        maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 100%)'
                      }}
                    />
                  </div>

                  {/* 右側專屬三層式結構面板：冊數置頂、待選範圍置中(支援複選)、目前已選範圍置底 */}
                  <div className="relative z-10 w-full md:w-[76%] md:ml-auto h-full flex flex-col justify-between py-1 gap-2">
                    
                    {/* ═══ 【第一層：冊數置頂】5 欄 × 2 列上下排列 (由左至右：一二年級、三上三下、四上四下、五上五下、六上六下) ═══ */}
                    <div className="w-full shrink-0">
                      <div className={`text-[11px] font-black mb-1 flex items-center justify-between ${isDark ? 'text-amber-200/90' : 'text-amber-900'}`}>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          <span>1. 選擇年級冊次：</span>
                        </span>

                        {/* 功能核選框：記住我的選擇 (未勾選則每次進遊戲重設清空) */}
                        {!isWholeBookOnlyGame && (
                          <label
                            onClick={handleToggleRememberSelection}
                            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-bold cursor-pointer select-none transition-all active:scale-95 shadow ${
                              isDark
                                ? 'bg-slate-900/90 hover:bg-slate-800 border-white/20 text-slate-200 hover:text-white'
                                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900'
                            }`}
                            title="勾選後將保留您的單元選取設定；未勾選則每次重新出征時自動清空"
                          >
                            <input
                              type="checkbox"
                              checked={rememberSelection}
                              onChange={() => {}} // handled by parent onClick
                              className="w-3.5 h-3.5 rounded accent-amber-500 cursor-pointer"
                            />
                            <span className={rememberSelection ? (isDark ? 'text-amber-300 font-black' : 'text-amber-700 font-black') : (isDark ? 'text-slate-300' : 'text-slate-600')}>
                              記住我的選擇
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full">
                        {GRADE_COLUMNS.map((col) => {
                          const isTopSelected = selectedOptionId === col.top.id;
                          const isBottomSelected = selectedOptionId === col.bottom.id;
                          const isTopRecommended = studentGradeNum === col.top.grade;
                          const isBottomRecommended = studentGradeNum === col.bottom.grade;

                          return (
                            <div key={col.colId} className="flex flex-col gap-1.5">
                              
                              {/* 上排按鈕 (一年級、三上、四上、五上、六上) */}
                              <button
                                type="button"
                                onClick={() => handleSelectBookOption(col.top.id)}
                                className={`p-1.5 sm:p-2 rounded-2xl border-2 transition-all duration-150 cursor-pointer flex flex-col items-center justify-center relative active:scale-95 shadow-md ${
                                  isTopSelected
                                    ? 'bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 text-stone-950 border-amber-200 ring-2 ring-amber-300/80 scale-102 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                                    : isDark
                                    ? 'bg-slate-900/90 hover:bg-slate-800 text-white border-white/20 hover:border-amber-400/60'
                                    : 'bg-white/95 hover:bg-amber-50/80 text-slate-800 border-slate-200/90 hover:border-amber-400/70 shadow-sm'
                                }`}
                              >
                                {isTopRecommended && (
                                  <span className={`absolute -top-2 px-1.5 py-0.2 rounded-full text-[8px] font-black flex items-center gap-0.5 shadow ${
                                    isTopSelected
                                      ? 'bg-stone-950 text-amber-300 border border-amber-400'
                                      : 'bg-amber-500 text-stone-950 border border-amber-300 animate-pulse'
                                  }`}>
                                    <Star className="w-2 h-2 fill-current" />
                                    <span>推薦</span>
                                  </span>
                                )}

                                <span className="text-xs sm:text-sm md:text-base font-black font-heading tracking-wide">
                                  {col.top.label}
                                </span>
                                <span className={`text-[8px] sm:text-[9px] font-bold truncate max-w-full ${
                                  isTopSelected ? 'text-stone-950/80' : isDark ? 'text-slate-300' : 'text-slate-500'
                                }`}>
                                  {col.top.desc}
                                </span>

                                {isTopSelected && (
                                  <CheckCircle2 className="w-3 h-3 text-stone-950 absolute top-1 right-1 stroke-[2.5]" />
                                )}
                              </button>

                              {/* 下排按鈕 (二年級、三下、四下、五下、六下) */}
                              <button
                                type="button"
                                onClick={() => handleSelectBookOption(col.bottom.id)}
                                className={`p-1.5 sm:p-2 rounded-2xl border-2 transition-all duration-150 cursor-pointer flex flex-col items-center justify-center relative active:scale-95 shadow-md ${
                                  isBottomSelected
                                    ? 'bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 text-stone-950 border-amber-200 ring-2 ring-amber-300/80 scale-102 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                                    : isDark
                                    ? 'bg-slate-900/90 hover:bg-slate-800 text-white border-white/20 hover:border-amber-400/60'
                                    : 'bg-white/95 hover:bg-amber-50/80 text-slate-800 border-slate-200/90 hover:border-amber-400/70 shadow-sm'
                                }`}
                              >
                                {isBottomRecommended && (
                                  <span className={`absolute -top-2 px-1.5 py-0.2 rounded-full text-[8px] font-black flex items-center gap-0.5 shadow ${
                                    isBottomSelected
                                      ? 'bg-stone-950 text-amber-300 border border-amber-400'
                                      : 'bg-amber-500 text-stone-950 border border-amber-300 animate-pulse'
                                  }`}>
                                    <Star className="w-2 h-2 fill-current" />
                                    <span>推薦</span>
                                  </span>
                                )}

                                <span className="text-xs sm:text-sm md:text-base font-black font-heading tracking-wide">
                                  {col.bottom.label}
                                </span>
                                <span className={`text-[8px] sm:text-[9px] font-bold truncate max-w-full ${
                                  isBottomSelected ? 'text-stone-950/80' : isDark ? 'text-slate-300' : 'text-slate-500'
                                }`}>
                                  {col.bottom.desc}
                                </span>

                                {isBottomSelected && (
                                  <CheckCircle2 className="w-3 h-3 text-stone-950 absolute top-1 right-1 stroke-[2.5]" />
                                )}
                              </button>

                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ═══ 【第二層：待選範圍置中 • 支援單元複選】(點選亮起，再點歸暗) ═══ */}
                    <div className="w-full shrink-0">
                      <div className={`text-[11px] font-black mb-1 flex items-center justify-between ${isDark ? 'text-amber-200/90' : 'text-amber-900'}`}>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          <span>2. 點選單元膠囊 (可複選，點擊亮起 / 再次點擊取消)：</span>
                        </span>
                        <span className={`text-[10px] font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          {currentOptionData.isAlpha ? '低年級字母規格' : `目前所選冊次：${currentOptionData.label}`}
                        </span>
                      </div>

                      <div className={`w-full min-h-[52px] sm:min-h-[58px] flex items-center justify-center p-2 rounded-2xl border backdrop-blur-md ${
                        isDark ? 'bg-slate-900/90 border-white/20' : 'bg-white/95 border-slate-200/90 shadow-sm'
                      }`}>
                        {currentOptionData.isAlpha ? (
                          /* 低年級字母模式三大選項 */
                          <div className="w-full flex items-center justify-between gap-2 animate-fadeIn">
                            <span className={`text-xs font-black flex items-center gap-1.5 shrink-0 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                              <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                              <span>字母模式：</span>
                            </span>

                            <div className="grid grid-cols-3 gap-2 flex-1 max-w-md">
                              {[
                                { id: 'upper', label: '🔠 大寫 A-Z' },
                                { id: 'lower', label: '🔡 小寫 a-z' },
                                { id: 'mixed', label: '🔤 混合 Aa-Zz' }
                              ].map((m) => {
                                const isModeActive = alphaMode === m.id;
                                return (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => handleSelectAlphaMode(m.id)}
                                    className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                      isModeActive
                                        ? 'bg-emerald-400 text-stone-950 border-emerald-200 ring-2 ring-emerald-300/80 shadow'
                                        : isDark
                                        ? 'bg-slate-800 text-slate-100 hover:text-white border-white/20'
                                        : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                                    }`}
                                  >
                                    {m.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : isWholeBookOnlyGame ? (
                          /* 全冊專屬遊戲提示 */
                          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-500 dark:text-amber-300 animate-fadeIn">
                            <Eye className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
                            <span>✨ 鷹眼神探採全冊 3D 紙雕全景尋寶 • 點擊右下角立即出征！</span>
                          </div>
                        ) : (
                          /* 三到六年級通用單元膠囊 (可複選！點擊亮起/歸暗) */
                          <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto py-0.5 animate-fadeIn">
                            {UNIVERSAL_UNITS.map((u) => {
                              const isUnitActive = isUniversalUnitSelected(u.id);
                              return (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => handleToggleUniversalUnit(u.id)}
                                  className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 active:scale-95 ${
                                    isUnitActive
                                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 border-amber-200 ring-2 ring-amber-300 shadow font-black'
                                      : isDark
                                      ? 'bg-slate-800/90 text-slate-300 hover:text-white border-white/15 hover:border-amber-400/50'
                                      : 'bg-slate-100/90 text-slate-600 hover:text-slate-900 border-slate-200/80 hover:bg-amber-50 hover:border-amber-400/50 shadow-xs'
                                  }`}
                                >
                                  {isUnitActive ? (
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                                  )}
                                  <span>{u.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ═══ 【第三層：目前已選範圍置底托盤】4 碼膠囊即時呈現 (例: B2U3, B4Fe, B2St, AZ) ═══ */}
                    <div className="w-full shrink-0">
                      <div className={`text-[11px] font-black mb-1 flex items-center justify-between ${isDark ? 'text-amber-200/90' : 'text-amber-900'}`}>
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          <span>3. 目前已選出征範圍 (點擊下方四碼膠囊可移除)：</span>
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                          {selectedGame === 'sentence'
                            ? (currentOptionData.isAlpha
                              ? `低年級連續 ${currentOptionData.grade === 2 ? 5 : 3} 字母順序 • 共 10 題`
                              : `共選取 ${(settings.selectedUnits || []).length} 個單元 • 實際可玩句型 ${availableSentenceCount} 題`)
                            : `共選取 ${(settings.selectedUnits || []).length} 個單元 • 合計 ${selectedWordsCount} 字`}
                        </span>
                      </div>

                      <div className={`w-full min-h-[42px] max-h-[58px] overflow-y-auto p-1.5 sm:p-2 rounded-2xl border backdrop-blur-md flex flex-wrap items-center gap-1.5 ${
                        isDark ? 'bg-slate-950/80 border-white/20' : 'bg-white/90 border-slate-200/90 shadow-inner'
                      }`}>
                        {currentOptionData.isAlpha ? (
                          <span className={`px-2.5 py-1 rounded-xl border font-mono font-black text-xs flex items-center gap-1 shadow ${
                            isDark ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          }`}>
                            <span>{formatUnitToShortCode('abc')}</span>
                            <span className={`text-[10px] font-sans font-bold ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>
                              ({alphaMode === 'upper' ? '大寫全套' : alphaMode === 'lower' ? '小寫全套' : '混合全套'})
                            </span>
                          </span>
                        ) : (settings.selectedUnits || []).length === 0 ? (
                          <span className={`text-xs font-bold px-2 py-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            尚未選取單元，請點擊上方單元膠囊
                          </span>
                        ) : (
                          (settings.selectedUnits || []).map((uKey) => {
                            const shortCode = formatUnitToShortCode(uKey);
                            return (
                              <button
                                key={uKey}
                                type="button"
                                onClick={() => handleRemoveSelectedUnit(uKey)}
                                className={`px-2.5 py-0.5 rounded-lg font-mono font-black text-xs flex items-center gap-1 transition-all cursor-pointer shadow group border ${
                                  isDark
                                    ? 'bg-slate-800 hover:bg-rose-950/80 text-amber-300 hover:text-rose-200 border-amber-400/40 hover:border-rose-400/60'
                                    : 'bg-amber-100/90 hover:bg-rose-100 text-amber-900 hover:text-rose-700 border-amber-300/80 hover:border-rose-300 shadow-xs'
                                }`}
                                title="點擊移除此單元"
                              >
                                <span>{shortCode}</span>
                                <X className="w-3 h-3 text-slate-400 group-hover:text-rose-500 transition-colors" />
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* ═══ 【第四層：玩法風格微調 (已預選推薦，告別遊戲內二次彈窗)】 ═══ */}
                    {(selectedGame === 'snake' || selectedGame === 'swipe' || selectedGame === 'sentence' || selectedGame === 'quiz-choice' || selectedGame === 'quiz-listening' || selectedGame === 'escape') && (
                      <div className={`w-full shrink-0 flex flex-wrap items-center justify-between gap-1.5 px-2.5 py-1 rounded-xl border backdrop-blur-md animate-fadeIn ${
                        isDark ? 'bg-amber-950/40 border-amber-500/30 text-amber-200' : 'bg-amber-50/90 border-amber-300/80 text-amber-900'
                      }`}>
                        <div className="flex items-center gap-1 text-[11px] font-black">
                          <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                          <span>4. {selectedGame === 'escape' ? '探索秘境 (已預選)：' : '玩法風格 (已預選推薦)：'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                          {selectedGame === 'sentence' && (
                            currentOptionData.isAlpha ? (
                              <span
                                data-lobby-alpha-sequence-pill="true"
                                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black border ${
                                  isDark
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                }`}
                              >
                                🔤 {currentOptionData.grade === 2 ? '二年級：連續 5 字母順序排列' : '一年級：連續 3 字母順序排列'}（免選難度）
                              </span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => { soundEngine.click(); setSentenceLevel('lv1'); }}
                                  className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                    sentenceLevel === 'lv1'
                                      ? 'bg-sky-500 text-white shadow-sm font-extrabold ring-1 ring-sky-300'
                                      : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  ⭐ Lv.1 基礎重組
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { soundEngine.click(); setSentenceLevel('lv2'); }}
                                  className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                    sentenceLevel === 'lv2'
                                      ? 'bg-rose-500 text-white shadow-sm font-extrabold ring-1 ring-rose-300'
                                      : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  🔥 Lv.2 干擾陷阱
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { soundEngine.click(); setSentenceLevel('lv3'); }}
                                  className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                    sentenceLevel === 'lv3'
                                      ? 'bg-violet-500 text-white shadow-sm font-extrabold ring-1 ring-violet-300'
                                      : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  🧠 Lv.3 情境挑戰
                                </button>
                              </>
                            )
                          )}
                          {selectedGame === 'escape' && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-300">四大秘境：</span>
                              {ESCAPE_THEMES_PREVIEW.map((th) => {
                                const isSelected = escapeThemeId === th.id;
                                return (
                                  <button
                                    key={th.id}
                                    type="button"
                                    onClick={() => {
                                      soundEngine.click();
                                      setEscapeThemeId(th.id);
                                      try {
                                        localStorage.setItem('wutai_escape_theme', th.id);
                                      } catch (e) {}
                                    }}
                                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                                      isSelected
                                        ? 'bg-emerald-500 text-stone-950 ring-1 ring-emerald-300 font-extrabold shadow-sm'
                                        : isDark
                                        ? 'bg-slate-800 text-slate-300 hover:text-white'
                                        : 'bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span>{th.icon}</span>
                                    <span>{th.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {selectedGame === 'snake' && (
                            <>
                              <button
                                type="button"
                                onClick={() => { soundEngine.click(); setSnakeDifficulty('normal'); }}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                  snakeDifficulty === 'normal'
                                    ? 'bg-amber-500 text-stone-950 shadow-sm font-extrabold ring-1 ring-amber-300'
                                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                ⭐ 標準模式 (60s)
                              </button>
                              <button
                                type="button"
                                onClick={() => { soundEngine.click(); setSnakeDifficulty('casual'); }}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                  snakeDifficulty === 'casual'
                                    ? 'bg-amber-500 text-stone-950 shadow-sm font-extrabold ring-1 ring-amber-300'
                                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                🌱 休閒模式 (撞牆不死)
                              </button>
                              <button
                                type="button"
                                onClick={() => { soundEngine.click(); setSnakeDifficulty('survival'); }}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                  snakeDifficulty === 'survival'
                                    ? 'bg-amber-500 text-stone-950 shadow-sm font-extrabold ring-1 ring-amber-300'
                                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                🔥 無盡生存 (越吃越快)
                              </button>
                            </>
                          )}

                          {selectedGame === 'swipe' && (
                            <>
                              <button
                                type="button"
                                onClick={() => { soundEngine.click(); setSwipeMode('vocab'); }}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                  swipeMode === 'vocab'
                                    ? 'bg-rose-500 text-white shadow-sm font-extrabold ring-1 ring-rose-300'
                                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                ⭐ 單字詞義是非
                              </button>
                              <button
                                type="button"
                                onClick={() => { soundEngine.click(); setSwipeMode('letters'); }}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                  swipeMode === 'letters'
                                    ? 'bg-rose-500 text-white shadow-sm font-extrabold ring-1 ring-rose-300'
                                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                🔡 Aa 大小寫是非
                              </button>
                            </>
                          )}

                          {selectedGame === 'quiz-choice' && (
                            <>
                              <button
                                type="button"
                                onClick={() => { soundEngine.click(); setQuizChoiceDirection('mixed'); }}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                  quizChoiceDirection === 'mixed'
                                    ? 'bg-sky-500 text-white shadow-sm font-extrabold ring-1 ring-sky-300'
                                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                ⭐ 雙向速測
                              </button>
                              <button
                                type="button"
                                onClick={() => { soundEngine.click(); setQuizChoiceDirection('en-zh'); }}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                  quizChoiceDirection === 'en-zh'
                                    ? 'bg-sky-500 text-white shadow-sm font-extrabold ring-1 ring-sky-300'
                                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                看英選中
                              </button>
                              <button
                                type="button"
                                onClick={() => { soundEngine.click(); setQuizChoiceDirection('zh-en'); }}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                  quizChoiceDirection === 'zh-en'
                                    ? 'bg-sky-500 text-white shadow-sm font-extrabold ring-1 ring-sky-300'
                                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                看中選英
                              </button>
                            </>
                          )}

                          {selectedGame === 'quiz-listening' && (
                            <>
                              <button
                                type="button"
                                onClick={() => { soundEngine.click(); setQuizListeningSubMode('word'); }}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                  quizListeningSubMode === 'word'
                                    ? 'bg-cyan-500 text-stone-950 shadow-sm font-extrabold ring-1 ring-cyan-300'
                                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                ⭐ 單字辨音
                              </button>
                              <button
                                type="button"
                                onClick={() => { soundEngine.click(); setQuizListeningSubMode('sentence'); }}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                  quizListeningSubMode === 'sentence'
                                    ? 'bg-cyan-500 text-stone-950 shadow-sm font-extrabold ring-1 ring-cyan-300'
                                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                句子辨句
                              </button>
                              <button
                                type="button"
                                onClick={() => { soundEngine.click(); setQuizListeningSubMode('qa'); }}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                  quizListeningSubMode === 'qa'
                                    ? 'bg-cyan-500 text-stone-950 shadow-sm font-extrabold ring-1 ring-cyan-300'
                                    : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                生活情境問答
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 整備室底部：狀態摘要與出征按鈕 */}
                <div className={`pt-2 border-t flex items-center justify-between shrink-0 ${isDark ? 'border-white/15' : 'border-slate-300/80'}`}>
                  <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    <span>出征整備：</span>
                    {isWholeBookOnlyGame ? (
                      <span className="text-amber-500 dark:text-amber-300 font-black">
                        {currentOptionData.label} (全冊 3D 紙雕尋寶)
                      </span>
                    ) : selectedGame === 'sentence' ? (
                      currentOptionData.isAlpha ? (
                        <span className="text-emerald-600 dark:text-emerald-300 font-black">
                          連續 {currentOptionData.grade === 2 ? 5 : 3} 字母順序排列（{alphaMode === 'upper' ? '全大寫' : alphaMode === 'lower' ? '全小寫' : '純大／純小輪流'}）• 10 題 • 支援英雄榜與八冊秘典
                        </span>
                      ) : availableSentenceCount > 0 ? (
                        <span className="text-sky-500 dark:text-sky-300 font-black">
                          實際可玩 {availableSentenceCount} 題句型
                          {unlockedCrossUnitCount > 0 ? `（含 U4 解鎖之 ${unlockedCrossUnitCount} 題跨單元綜合句）` : ''}
                          {sentenceScopeInfo.unsupportedBooks?.size > 0 ? ` • 已略過未收錄之第 ${Array.from(sentenceScopeInfo.unsupportedBooks).join('、')} 冊` : ''}
                          {sentenceScopeInfo.unsupportedUnits?.size > 0 ? ` • 已略過無對應單元：${Array.from(sentenceScopeInfo.unsupportedUnits).join('、')}` : ''}
                          {sentenceScopeInfo.skippedAbc ? ' • 字母與課本分開練習，已略過字母範圍' : ''}
                          {' '}• 單冊雙單元以上即可衝榜與點亮八星
                        </span>
                      ) : (
                        <span className="text-amber-500 dark:text-amber-300 font-black flex items-center gap-1.5 flex-wrap">
                          <span>
                            {sentenceScopeInfo.hasUnsupportedOnly
                              ? `🚧 所選「${Array.from(sentenceScopeInfo.unsupportedBooks).map(b => `第 ${b} 冊`).join('、')}」尚未收錄句型，已全面開放低年級與第 1～8 冊`
                              : '請選一年級/二年級或第 1～8 冊任一單元試玩句型'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSelectBookOption('b1')}
                            className="px-2 py-0.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-[11px] font-black cursor-pointer"
                          >
                            🚀 一鍵選第 1 冊
                          </button>
                        </span>
                      )
                    ) : (settings.selectedUnits || []).length > 0 ? (
                      <span className="text-amber-500 dark:text-amber-300 font-black">
                        {currentOptionData.isAlpha ? '26 字母全套' : `${(settings.selectedUnits || []).length} 個單元 (${selectedWordsCount} 字)`}
                      </span>
                    ) : (
                      <span className="text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>尚未選取單元，請點選上方單元膠囊</span>
                      </span>
                    )}

                    {selectedGame !== 'sentence' && (isWholeBookOnlyGame || (settings.selectedUnits || []).length > 0) && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-black hidden sm:inline ml-1">
                        • 英雄榜榮譽資格已啟用
                      </span>
                    )}
                  </div>

                  {/* 若未選取任何單元，按鈕不可點擊亦不發光 */}
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedGame === 'memory' && (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.click();
                          setShowMemoryCodex(true);
                        }}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-heading font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border-2 border-amber-200 cursor-pointer active:scale-95 transition-all"
                        title="查看 8 大希臘眾神圖鑑與特殊神卡效果"
                      >
                        <BookOpen className="w-4 h-4 text-stone-950" />
                        <span>🏛️ 眾神神殿</span>
                      </button>
                    )}
                    {(() => {
                      const canStart = isWholeBookOnlyGame ? Boolean(selectedOptionId) : (settings.selectedUnits || []).length > 0;
                      return (
                        <button
                          type="button"
                          disabled={!canStart}
                          onClick={handleStartGame}
                          className={`px-7 sm:px-9 py-2.5 rounded-2xl font-heading font-black text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer border-2 ${
                            canStart
                              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.6)] active:scale-95 border-amber-200 animate-pulse'
                              : isDark
                              ? 'bg-slate-800 text-slate-500 border-white/10 opacity-50 cursor-not-allowed shadow-none'
                              : 'bg-slate-200 text-slate-400 border-slate-300 opacity-50 cursor-not-allowed shadow-none'
                          }`}
                        >
                          <span>{selectedGame === 'escape' ? '🚪 進入秘境 START' : '⚔️ 開始遊戲 START'}</span>
                          <Play className={`w-4 h-4 ${canStart ? 'fill-stone-950' : isDark ? 'fill-slate-500' : 'fill-slate-400'}`} />
                        </button>
                      );
                    })()}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* ════════════════════════════════════════════════════════════════
          【固定底部簡易提示列】僅在首頁狀態下輔助說明
         ════════════════════════════════════════════════════════════════ */}
      {step === 'game' && (
        <footer className={`relative z-30 w-full px-4 py-2 backdrop-blur-md border-t flex items-center justify-between text-xs font-bold shrink-0 transition-colors ${
          isDark ? 'bg-slate-950/85 border-white/10 text-slate-300' : 'bg-white/85 border-slate-200 text-slate-600 shadow-sm'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>五大主題 • 點選任一遊戲立即展開整備出征室</span>
          </div>

          <div className={`flex items-center gap-2 text-[11px] font-mono ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
            WUTAI ENGLISH ADVENTURE HALL
          </div>
        </footer>
      )}

    </div>
  );
};
