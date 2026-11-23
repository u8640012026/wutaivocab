import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button3D } from './ui/Button3D';
import { useI18n } from '../context/I18nContext';
import { useStudent } from '../context/StudentContext';
import { useTheme } from '../context/ThemeContext';
import {
  fetchLeaderboard,
  fetchMonopolyLeaderboard,
  fetchQuestPointsLeaderboard,
  getWeekNumber
} from '../services/supabase';
import { getCurrentSemesterId, getSemesterDisplayName } from '../utils/semesterHelper';
import { soundEngine } from '../services/audio';
import { useEasterEgg } from '../hooks/useEasterEgg';
import { pad2, formatStudentBadge, formatStudentDisplayName, isGuestStudent, parseStudentId } from '../utils/studentIdHelper';
import { loadStudentMastery, SAA_TOTAL_ITEMS } from '../utils/masteryHelper';
import { CANONICAL_STATS } from '../data/exam/canonicalMapping';
import {
  Trophy, ArrowLeft, RotateCw, Calendar, BookOpen, Puzzle, Rocket,
  Sparkles, Keyboard, Swords, ChevronRight, ChevronLeft, ChevronDown, Compass, Flame,
  Coins, Award, Users, Crown, Zap, School, KeyRound, Eye, Headphones,
  PenTool, Mic, Volume2, VolumeX, Globe, Sun, Moon, User, CheckCircle2,
  X, Maximize2, Star, ShieldCheck, Layers
} from 'lucide-react';

// ── 年級分流設定 (保留 '一年級' 等標準文字供全自動測試點擊) ──
export const GRADE_LEADERBOARD_TABS = [
  { id: '01', zh: '一年級', en: 'Grade 1', books: ['g1', 'abc', '1'], isAlphabet: true },
  { id: '02', zh: '二年級', en: 'Grade 2', books: ['g2', 'abc', '2'], isAlphabet: true },
  { id: '03', zh: '三年級', en: 'Grade 3', books: ['1', '2'] },
  { id: '04', zh: '四年級', en: 'Grade 4', books: ['3', '4'] },
  { id: '05', zh: '五年級', en: 'Grade 5', books: ['5', '6'] },
  { id: '06', zh: '六年級', en: 'Grade 6', books: ['7', '8', '9'] },
  { id: 'all', zh: '全校大亂鬥', en: 'All School', books: null, isAllSchool: true }
];

// ── 大武山四聯屏風畫四大天王定義 (現代 3A 遊戲概念大作、無縫連貫大武山群峰) ──
export const FOUR_CHAMPION_PANELS = [
  {
    id: 'exam_king',
    title: '測驗之王',
    enTitle: 'EXAM KING',
    realm: '破曉藍調 • 官方模擬與實戰檢定',
    bgImage: '/assets/leaderboard/polyptych_exam.jpg?v=dawu3a',
    icon: Crown,
    colorName: 'sky',
    titleGlow: 'bg-gradient-to-b from-sky-100 via-sky-200 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_0_16px_rgba(56,189,248,0.8)]',
    spineTextColor: 'text-sky-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]',
    borderClass: 'border-sky-500/50 hover:border-sky-400',
    activeRingClass: 'ring-sky-400/80 border-sky-300',
    plaqueBg: 'bg-gradient-to-r from-sky-950/90 via-slate-950/85 to-indigo-950/90 border-sky-400/40 shadow-sky-950/60',
    accentText: 'text-sky-300',
    bannerGradient: 'from-sky-500/30 via-indigo-500/10 to-transparent'
  },
  {
    id: 'coin_king',
    title: '金幣之王',
    enTitle: 'COIN KING',
    realm: '朝陽暖金 • 總資產財富殿堂',
    bgImage: '/assets/leaderboard/polyptych_coin.jpg?v=dawu3a',
    icon: Coins,
    colorName: 'amber',
    titleGlow: 'bg-gradient-to-b from-yellow-100 via-amber-300 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_0_18px_rgba(245,158,11,0.8)]',
    spineTextColor: 'text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]',
    borderClass: 'border-amber-500/50 hover:border-amber-400',
    activeRingClass: 'ring-amber-400/80 border-amber-300',
    plaqueBg: 'bg-gradient-to-r from-amber-950/90 via-slate-950/85 to-yellow-950/90 border-amber-400/40 shadow-amber-950/60',
    accentText: 'text-amber-300',
    bannerGradient: 'from-amber-500/30 via-yellow-500/10 to-transparent'
  },
  {
    id: 'point_king',
    title: '積分之王',
    enTitle: 'QUEST KING',
    realm: '林谷翡翠 • 家園探索歷險先鋒',
    bgImage: '/assets/leaderboard/polyptych_quest.jpg?v=dawu3a',
    icon: Compass,
    colorName: 'emerald',
    titleGlow: 'bg-gradient-to-b from-emerald-100 via-emerald-200 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_0_16px_rgba(16,185,129,0.8)]',
    spineTextColor: 'text-emerald-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]',
    borderClass: 'border-emerald-500/50 hover:border-emerald-400',
    activeRingClass: 'ring-emerald-400/80 border-emerald-300',
    plaqueBg: 'bg-gradient-to-r from-emerald-950/90 via-slate-950/85 to-teal-950/90 border-emerald-400/40 shadow-emerald-950/60',
    accentText: 'text-emerald-300',
    bannerGradient: 'from-emerald-500/30 via-teal-500/10 to-transparent'
  },
  {
    id: 'game_king',
    title: '遊戲之王',
    enTitle: 'GAME KING',
    realm: '暮色紫霞 • 單字館小遊戲群英',
    bgImage: '/assets/leaderboard/polyptych_game.jpg?v=dawu3a',
    icon: Rocket,
    colorName: 'purple',
    titleGlow: 'bg-gradient-to-b from-white via-purple-200 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_0_18px_rgba(217,70,239,0.8)]',
    spineTextColor: 'text-purple-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]',
    borderClass: 'border-purple-500/50 hover:border-purple-400',
    activeRingClass: 'ring-purple-400/80 border-purple-300',
    plaqueBg: 'bg-gradient-to-r from-purple-950/90 via-slate-950/85 to-fuchsia-950/90 border-purple-400/40 shadow-purple-950/60',
    accentText: 'text-purple-300',
    bannerGradient: 'from-purple-500/30 via-fuchsia-500/10 to-transparent'
  }
];

// ── 測驗之王四大子軌道 (嚴格對齊原測驗館色彩與官方規範) ──
export const EXAM_KING_SUBTRACKS = [
  {
    id: 'prea1_mastery',
    label: 'Pre-A1 官方精熟',
    subLabel: '劍橋 300 題動態精熟',
    icon: Award,
    unit: '題精熟',
    badgeColor: 'border-sky-400 text-sky-200 bg-sky-500/25 ring-sky-400/50',
    modeKeys: ['prea1-mastery']
  },
  {
    id: 'saa_mastery',
    label: 'SAA 學力成就',
    subLabel: `教育部 113～115 年官方 ${SAA_TOTAL_ITEMS} 題`,
    icon: CheckCircle2,
    unit: '題精熟',
    badgeColor: 'border-emerald-400 text-emerald-200 bg-emerald-500/25 ring-emerald-400/50',
    modeKeys: ['saa-mastery', 'mcq-saa']
  },
  {
    id: 'mcq_king',
    label: '課本單元檢定',
    subLabel: `${CANONICAL_STATS.canonicalItems.toLocaleString()} 題單元實戰`,
    icon: Crown,
    unit: '分',
    badgeColor: 'border-amber-400 text-amber-200 bg-amber-500/25 ring-amber-400/50',
    modeKeys: ['mcq-king', 'mcq-diligent', 'mcq-accurate']
  },
  {
    id: 'speaking_lab',
    label: '雙語口說評測',
    subLabel: 'AI 朗讀跟讀與發音評測',
    icon: Mic,
    unit: '題',
    badgeColor: 'border-rose-400 text-rose-200 bg-rose-500/25 ring-rose-400/50',
    modeKeys: ['speaking_lab', 'speaking-lab', 'speaking']
  }
];

// ── 遊戲之王四大子領域 (100% 嚴格遵循 Lobby.jsx 單字館分類與框色) ──
export const GAME_KING_CATEGORIES = [
  {
    id: 'explore',
    title: '探索解謎',
    icon: KeyRound,
    colorClass: 'border-teal-400 text-teal-300 bg-teal-500/15',
    activeClass: 'ring-2 ring-teal-400 border-teal-300 bg-teal-500/35 text-white shadow-teal-500/30 shadow-md',
    games: [
      { id: 'escape', name: '神祕密室逃脫', icon: KeyRound, unit: '秒', modeKeys: ['escape'] },
      { id: 'spotter', name: '鷹眼神探找不同', icon: Eye, unit: '秒', modeKeys: ['spotter'] },
      { id: 'maze', name: '字母巡航迷宮', icon: Compass, unit: '秒', modeKeys: ['maze-upper', 'maze-lower', 'maze-master'] },
      { id: 'memory', name: '翻牌記憶對決', icon: Sparkles, unit: '分', modeKeys: ['memory-single', 'memory', 'memory-abc'] }
    ]
  },
  {
    id: 'speed',
    title: '極速反應',
    icon: Flame,
    colorClass: 'border-amber-400 text-amber-300 bg-amber-500/15',
    activeClass: 'ring-2 ring-amber-400 border-amber-300 bg-amber-500/35 text-white shadow-amber-500/30 shadow-md',
    games: [
      { id: 'mole', name: '單字打地鼠', icon: Zap, unit: '分', modeKeys: ['mole-vocab', 'mole-abc', 'mole'] },
      { id: 'swipe', name: '極速是非滑牌', icon: Flame, unit: '分', modeKeys: ['swipe-vocab', 'swipe-abc', 'swipe'] },
      { id: 'meteor', name: '3D 隕石防衛戰', icon: Rocket, unit: '分', modeKeys: ['meteor-words', 'meteor-zh-en', 'meteor-en-zh', 'meteor-abc', 'meteor-speed'] },
      { id: 'snake', name: '叢林神山貪蛇', icon: Zap, unit: '分', modeKeys: ['snake-normal', 'snake-survival', 'snake-easy', 'snake-casual', 'snake-hard'] }
    ]
  },
  {
    id: 'quiz',
    title: '詞句試煉',
    icon: Keyboard,
    colorClass: 'border-sky-400 text-sky-300 bg-sky-500/15',
    activeClass: 'ring-2 ring-sky-400 border-sky-300 bg-sky-500/35 text-white shadow-sky-500/30 shadow-md',
    games: [
      { id: 'sentence', name: '句型積木工坊', icon: Layers, unit: '分', modeKeys: ['sentence', 'sentence-abc'] },
      { id: 'listening', name: '英語聽力試煉', icon: Volume2, unit: '分', modeKeys: ['quiz-listening', 'quiz-listening-word', 'quiz-listening-sentence', 'quiz-listening-qa', 'listening_lab'] },
      { id: 'spelling', name: '單字積木拼裝', icon: Puzzle, unit: '分', modeKeys: ['spelling', 'spelling-abc'] },
      { id: 'handwriting', name: '神筆筆順書寫', icon: PenTool, unit: '分', modeKeys: ['handwriting', 'handwriting-abc'] },
      { id: 'quiz', name: '中英字義速辨 (歷史)', icon: Keyboard, unit: '分', modeKeys: ['quiz-choice', 'quiz-zh-en', 'quiz-en-zh', 'quiz-hard'] }
    ]
  },
  {
    id: 'battle',
    title: '多人連線',
    icon: Swords,
    colorClass: 'border-purple-400 text-purple-300 bg-purple-500/15',
    activeClass: 'ring-2 ring-purple-400 border-purple-300 bg-purple-500/35 text-white shadow-purple-500/30 shadow-md',
    games: [
      { id: 'battle', name: '即時多人連線', icon: Swords, unit: '勝', modeKeys: ['battle-wins', 'battle'] }
    ]
  }
];

export const CONSOLIDATED_GAME_MODES = [
  ...EXAM_KING_SUBTRACKS.map(s => ({
    id: s.id,
    label: s.label,
    icon: s.icon,
    unit: s.unit,
    champion: 'exam_king',
    modeKeys: s.modeKeys
  })),
  {
    id: 'monopoly',
    label: '金幣財富榜',
    icon: Coins,
    unit: '金幣',
    champion: 'coin_king',
    isSpecial: 'monopoly',
    modeKeys: ['monopoly']
  },
  {
    id: 'town_quest',
    label: '探索歷險積分',
    icon: Compass,
    unit: '分',
    champion: 'point_king',
    isSpecial: 'quest',
    modeKeys: ['quest-points']
  },
  ...GAME_KING_CATEGORIES.flatMap(c =>
    c.games.map(g => ({
      id: g.id,
      label: g.name,
      icon: g.icon,
      unit: g.unit,
      champion: 'game_king',
      category: c.id,
      modeKeys: g.modeKeys
    }))
  )
];

// ── 格式化學生顯示：暱稱優先、座號後括號「英勇穿山甲 (6甲3號)」──
export const parseStudentFormat = (entry, lang = 'zh-TW') => {
  if (!entry) return { nickname: '好學生', badge: '', full: '好學生' };

  if (isGuestStudent(entry)) {
    const rawNick = entry.name || entry.nickname || '訪客勇士';
    const cleanNick = rawNick.replace(/^\[訪客\]\s*/, '').trim() || '訪客勇士';
    return { nickname: cleanNick, badge: '[訪客]', full: `${cleanNick} [訪客]` };
  }

  let rawName = String(entry.name || entry.nickname || '').trim();
  let sid = String(entry.student_id || entry.id || (typeof entry.book === 'string' && entry.book.length === 6 && /^\d+$/.test(entry.book) ? entry.book : '')).trim();

  let nickname = rawName;
  let badge = '';

  // 1. 若名稱內含括號 e.g. "4年甲班 01號 (英勇穿山甲)"
  const parenMatch = rawName.match(/^(.*?)\s*[(（](.*?)[)）]$/);
  if (parenMatch) {
    const prefix = parenMatch[1].trim();
    nickname = parenMatch[2].trim();
    // 轉化精簡格式 "4甲1號"
    const m = prefix.match(/(\d+)\s*年\s*([甲乙丙他])\s*班\s*(\d+)\s*號/);
    if (m) {
      badge = `(${m[1]}${m[2]}${parseInt(m[3], 10)}號)`;
    } else {
      badge = `(${prefix.replace(/年/g, '').replace(/班/g, '').replace(/\s+/g, '')})`;
    }
  }

  // 2. 若尚未取得 badge，但可由 6 碼學號解析 (e.g. "060103" -> "(6甲3號)")
  if (!badge && sid && sid.length === 6 && /^\d+$/.test(sid)) {
    const g = parseInt(sid.substring(0, 2), 10);
    const cNum = parseInt(sid.substring(2, 4), 10);
    const seat = parseInt(sid.substring(4, 6), 10);
    const cChar = cNum === 1 ? '甲' : cNum === 2 ? '乙' : cNum === 3 ? '丙' : '';
    if (g > 0 && g <= 6) {
      badge = `(${g}${cChar}${seat}號)`;
    }
  }

  // 3. 回退學生自帶 badge
  if (!badge) {
    const fallbackB = formatStudentBadge(entry, lang);
    if (fallbackB && fallbackB !== '[訪客]' && fallbackB !== '訪客') {
      badge = `(${fallbackB.replace(/\s+/g, '')})`;
    }
  }

  return {
    nickname: nickname || '好學生',
    badge,
    full: badge ? `${nickname} ${badge}` : nickname
  };
};

// ── 3A 遊戲立體金屬名次徽章 (絕不使用廉價 Emoji) ──
const MetallicRankMedal = ({ rank, size = 'md' }) => {
  const sizeMap = {
    xs: 'w-4 h-4 text-[10px]',
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-xs',
    lg: 'w-7 h-7 text-sm'
  };
  const sizeClass = sizeMap[size] || sizeMap.md;

  if (rank === 1) {
    return (
      <div className={`${sizeClass} rounded-xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-amber-950 ring-2 ring-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.7)] font-black font-mono flex items-center justify-center shrink-0`}>
        <span>1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className={`${sizeClass} rounded-xl bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 text-slate-900 ring-2 ring-slate-200 shadow-[0_0_10px_rgba(226,232,240,0.6)] font-black font-mono flex items-center justify-center shrink-0`}>
        <span>2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className={`${sizeClass} rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-900 text-amber-100 ring-2 ring-amber-500 shadow-[0_0_10px_rgba(217,119,6,0.5)] font-black font-mono flex items-center justify-center shrink-0`}>
        <span>3</span>
      </div>
    );
  }
  return (
    <div className={`${sizeClass} rounded-xl bg-slate-800/90 text-slate-300 border border-white/15 font-bold font-mono flex items-center justify-center shrink-0`}>
      <span>{rank}</span>
    </div>
  );
};

export const LeaderboardView = ({ onBack, onOpenTeacherHub }) => {
  const { t, lang } = useI18n();
  const { currentStudent, isLoggedIn, openModal } = useStudent();
  const { isDark, toggleTheme } = useTheme();
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);
  const currentWeek = getWeekNumber();

  // 智慧預設目標年級：若已登入學生則自動錨定其所屬年級 (1~6)，否則預設 4 年級
  const [selectedGrade, setSelectedGrade] = useState(() => {
    if (currentStudent?.grade) {
      const g = pad2(currentStudent.grade);
      if (['01', '02', '03', '04', '05', '06'].includes(g)) return g;
    }
    return '04';
  });

  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const isPastWeek = selectedWeek < currentWeek;

  // 手風琴主狀態：null (四屏風並列) | 'exam_king' | 'coin_king' | 'point_king' | 'game_king'
  const [activeCol, setActiveCol] = useState(null);

  // 年級快捷選單浮動抽屜開關
  const [showGradeMenu, setShowGradeMenu] = useState(false);
  const gradeMenuRef = useRef(null);

  // 測驗之王神殿內選中子軌道
  const [activeExamSubtrack, setActiveExamSubtrack] = useState('prea1_mastery');

  // 遊戲之王神殿內選中分類與遊戲
  const [activeGameCategory, setActiveGameCategory] = useState('explore');
  const [activeGameId, setActiveGameId] = useState('escape');

  const [boardData, setBoardData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 隱藏管理後台彩蛋 (點擊學期標籤 5 次)
  const handleTeacherHubEgg = useEasterEgg(onOpenTeacherHub, 5, 2000);

  // 當前學期親切標籤 (例如 "115學年度 第2學期")
  const semesterDisplayName = useMemo(() => {
    return getSemesterDisplayName(null, lang);
  }, [lang]);

  // 當前年級設定
  const activeGradeObj = useMemo(() => {
    return GRADE_LEADERBOARD_TABS.find(tab => tab.id === selectedGrade) || GRADE_LEADERBOARD_TABS[3];
  }, [selectedGrade]);

  const currentGradeIndex = useMemo(() => {
    return GRADE_LEADERBOARD_TABS.findIndex(tab => tab.id === selectedGrade);
  }, [selectedGrade]);

  // 年級純箭頭步進
  const handlePrevGrade = () => {
    soundEngine.click();
    const newIdx = (currentGradeIndex - 1 + GRADE_LEADERBOARD_TABS.length) % GRADE_LEADERBOARD_TABS.length;
    setSelectedGrade(GRADE_LEADERBOARD_TABS[newIdx].id);
  };

  const handleNextGrade = () => {
    soundEngine.click();
    const newIdx = (currentGradeIndex + 1) % GRADE_LEADERBOARD_TABS.length;
    setSelectedGrade(GRADE_LEADERBOARD_TABS[newIdx].id);
  };

  // 切換週次
  const handlePrevWeek = () => {
    if (selectedWeek > 1) {
      soundEngine.click();
      setSelectedWeek(w => w - 1);
    }
  };

  const handleNextWeek = () => {
    if (selectedWeek < currentWeek) {
      soundEngine.click();
      setSelectedWeek(w => w + 1);
    }
  };

  // 點擊外部關閉年級選單
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (gradeMenuRef.current && !gradeMenuRef.current.contains(e.target)) {
        setShowGradeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── 判斷一筆紀錄是否符合當前選中之年級 (冊次、學號前綴、姓名三重比對，徹底杜絕漏榜) ──
  const isEntryInGrade = useCallback((entry, targetGrade) => {
    if (!targetGrade || targetGrade === 'all' || targetGrade === '00') return true;
    const gradeStr = String(targetGrade).padStart(2, '0');
    const gradeNum = parseInt(gradeStr, 10);

    // 1. 學號比對 (entry.book 或 entry.student_id 開頭為 '04' 等)
    const sid = String(entry.student_id || entry.book || '');
    if (sid.length === 6 && /^\d+$/.test(sid)) {
      if (sid.startsWith(gradeStr)) return true;
    }

    // 2. 冊次比對
    const gradeTab = GRADE_LEADERBOARD_TABS.find(t => t.id === gradeStr);
    const bStr = String(entry.book || '').toLowerCase();
    if (gradeTab?.books && gradeTab.books.includes(bStr)) return true;
    if (bStr === `g${gradeNum}`) return true;

    // 3. 通用教材 (abc) 或小遊戲：比對學生暱稱或姓名內含之年級字眼
    const rawName = String(entry.name || '');
    if (rawName.includes(`${gradeNum}年`) || rawName.includes(`${gradeNum}甲`) || rawName.includes(`${gradeNum}乙`)) {
      return true;
    }

    // 4. 若該遊戲本身為全校性無分冊 (例如 spotter, escape, battle)，且學生無年級資訊，於全年級展示
    return false;
  }, []);

  // 載入所有模式榜單 (全面補齊所有子榜與防漏查詢)
  const loadGradeBoards = useCallback(async (force = false) => {
    setIsLoading(true);
    const results = {};
    const isPast = selectedWeek < currentWeek;
    const cacheTtl = isPast ? 7 * 24 * 60 * 60 * 1000 : 45 * 1000;
    const now = Date.now();

    const isAll = activeGradeObj.isAllSchool || selectedGrade === 'all' || selectedGrade === '00';
    const books = isAll ? null : activeGradeObj.books;

    await Promise.all(
      CONSOLIDATED_GAME_MODES.map(async (m) => {
        const CACHE_KEY = `lb_poly_${selectedWeek}_${selectedGrade}_${m.id}`;

        if (!force) {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            try {
              const { data, time } = JSON.parse(cached);
              if (now - time < cacheTtl) {
                results[m.id] = data;
                return;
              }
            } catch (e) {}
          }
        }

        let fetchedList = [];
        try {
          if (m.isSpecial === 'monopoly') {
            fetchedList = await fetchMonopolyLeaderboard(isAll ? null : selectedGrade, 50);
          } else if (m.isSpecial === 'quest') {
            fetchedList = await fetchQuestPointsLeaderboard(isAll ? null : selectedGrade, 50);
          } else if (m.id === 'prea1_mastery') {
            // 查詢 Pre-A1 官方精熟
            fetchedList = await fetchLeaderboard(selectedWeek, 'prea1-mastery', null, 50);
            if (!isAll && Array.isArray(fetchedList)) {
              fetchedList = fetchedList.filter(row => isEntryInGrade(row, selectedGrade));
            }
            if ((!fetchedList || fetchedList.length === 0) && currentStudent) {
              const sid = currentStudent.student_id || currentStudent.id;
              const snap = loadStudentMastery(sid);
              const tme = snap?.tracks?.['tme-preA1'];
              if (tme && tme.mastered_count > 0) {
                fetchedList = [{
                  id: 'local_mastery_' + sid,
                  name: formatStudentDisplayName(currentStudent),
                  score: tme.mastered_count,
                  time: Math.round((tme.mastered_count / (tme.total_items || 300)) * 100),
                  book: `g${currentStudent.grade || 4}`,
                  created_at: snap.updated_at
                }];
              }
            }
          } else if (m.id === 'saa_mastery') {
            // 查詢 SAA 學力成就
            fetchedList = await fetchLeaderboard(selectedWeek, ['saa-mastery', 'mcq-saa'], null, 50);
            if (!isAll && Array.isArray(fetchedList)) {
              fetchedList = fetchedList.filter(row => isEntryInGrade(row, selectedGrade));
            }
            if ((!fetchedList || fetchedList.length === 0) && currentStudent) {
              const sid = currentStudent.student_id || currentStudent.id;
              const snap = loadStudentMastery(sid);
              const saa = snap?.tracks?.['ministry-assessment'];
              if (saa && saa.mastered_count > 0) {
                fetchedList = [{
                  id: 'local_mastery_saa_' + sid,
                  name: formatStudentDisplayName(currentStudent),
                  score: saa.mastered_count,
                  time: Math.round((saa.mastered_count / (saa.total_items || SAA_TOTAL_ITEMS)) * 100),
                  book: `g${currentStudent.grade || 4}`,
                  created_at: snap.updated_at
                }];
              }
            }
          } else {
            // 所有小遊戲與檢定：先寬查後精準過濾，徹底杜絕因為 book 存學號或 abc 導致被 SQL 排除
            const queryBooks = isAll ? null : (books ? [...books, 'abc', `g${parseInt(selectedGrade, 10)}`] : null);
            fetchedList = await fetchLeaderboard(selectedWeek, m.modeKeys, queryBooks, 80);

            if (Array.isArray(fetchedList)) {
              if (m.id === 'escape') {
                fetchedList = fetchedList.filter(row => row.time && Number(row.time) > 1);
              } else if (m.id === 'spotter') {
                fetchedList = fetchedList.filter(row => row.time && Number(row.time) > 0);
              }
              if (isPast) {
                fetchedList = fetchedList.filter(row => !isGuestStudent(row));
              }
              if (!isAll) {
                // 精準過濾年級
                fetchedList = fetchedList.filter(row => isEntryInGrade(row, selectedGrade));
              }
              fetchedList = fetchedList.slice(0, 50);
            }
          }
        } catch (err) {
          console.warn(`讀取模式 ${m.id} 排行失敗:`, err);
          fetchedList = [];
        }

        results[m.id] = fetchedList;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: fetchedList, time: now }));
        } catch (e) {}
      })
    );

    setBoardData(results);
    setIsLoading(false);
  }, [selectedWeek, selectedGrade, activeGradeObj, currentWeek, currentStudent, isEntryInGrade]);

  useEffect(() => {
    loadGradeBoards();
  }, [loadGradeBoards]);

  // ════════════════════════════════════════════════════════════════
  // ── 四大天王綜合加總排序演算法 (加總各子榜排位權重，真材實料四大王者) ──
  // ════════════════════════════════════════════════════════════════
  const championRankings = useMemo(() => {
    // 依子榜名次進行標準錦標賽排位加權 (Rank Points: 第 1 名 50 分 ... 第 50 名 1 分)
    const computeConsolidatedRank = (trackIds) => {
      const studentMap = new Map();

      trackIds.forEach(tId => {
        const list = boardData[tId] || [];
        if (!Array.isArray(list)) return;

        list.slice(0, 50).forEach((entry, idx) => {
          if (isPastWeek && isGuestStudent(entry)) return;
          const parsed = parseStudentFormat(entry, lang);
          const nameKey = parsed.nickname;
          const rankPoints = 50 - idx; // 第 1 名 50 分

          if (!studentMap.has(nameKey)) {
            studentMap.set(nameKey, {
              ...entry,
              nickname: parsed.nickname,
              badge: parsed.badge,
              full: parsed.full,
              totalWeight: 0,
              bestRank: idx + 1,
              topCount: 0
            });
          }

          const s = studentMap.get(nameKey);
          s.totalWeight += rankPoints;
          s.topCount += 1;
          if (idx + 1 < s.bestRank) s.bestRank = idx + 1;
          // 若原先缺少 badge 則更新
          if (!s.badge && parsed.badge) s.badge = parsed.badge;
        });
      });

      const sorted = Array.from(studentMap.values()).sort((a, b) => {
        if (b.totalWeight !== a.totalWeight) return b.totalWeight - a.totalWeight;
        return a.bestRank - b.bestRank;
      });

      return sorted;
    };

    // 1. 測驗之王綜合榜：4 大官方子榜綜合加權
    const examTrackIds = ['prea1_mastery', 'saa_mastery', 'mcq_king', 'speaking_lab'];
    const examKingList = computeConsolidatedRank(examTrackIds);

    // 2. 金幣之王：富豪總資產 Top 50
    const coinList = (boardData['monopoly'] || []).map(r => {
      const parsed = parseStudentFormat(r, lang);
      return { ...r, nickname: parsed.nickname, badge: parsed.badge, full: parsed.full };
    });

    // 3. 積分之王：家園探索歷險 Top 50
    const questList = (boardData['town_quest'] || []).map(r => {
      const parsed = parseStudentFormat(r, lang);
      return { ...r, nickname: parsed.nickname, badge: parsed.badge, full: parsed.full };
    });

    // 4. 遊戲之王綜合榜：單字館與詞句遊戲綜合加總加權
    const arcadeTrackIds = [
      'escape', 'spotter', 'maze', 'memory',
      'mole', 'swipe', 'meteor', 'snake',
      'sentence', 'listening', 'spelling', 'handwriting', 'quiz',
      'battle'
    ];
    const gameKingList = computeConsolidatedRank(arcadeTrackIds);

    return {
      exam_king: examKingList,
      coin_king: coinList,
      point_king: questList,
      game_king: gameKingList
    };
  }, [boardData, isPastWeek, lang]);

  // 全域大底圖：深層透光，以連貫的北大武神山群峰全景長卷為基底
  const currentWallpaper = useMemo(() => {
    return '/assets/leaderboard/dawu_panorama_full.jpg?v=dawu3a';
  }, []);

  // 判斷是否為當前登入者
  const isSelf = useCallback((entry) => {
    if (!currentStudent) return false;
    const curSid = currentStudent.student_id || currentStudent.id;
    const curName = currentStudent.nickname || currentStudent.name;
    const entrySid = entry.student_id || entry.id;
    const entryName = entry.name || entry.nickname;
    if (curSid && (entrySid === curSid || String(entrySid).includes(String(curSid)))) return true;
    if (curName && (entryName === curName || String(entryName).includes(String(curName)))) return true;
    return false;
  }, [currentStudent]);

  return (
    <div className={`fixed inset-0 w-full h-[100dvh] flex flex-col justify-between overflow-hidden select-none z-10 animate-fadeIn font-sans transition-colors duration-500 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-100'
    }`}>
      {/* ── 專屬高階背景層 (大武山全景長卷深層透光，絕不反白刺眼) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <img
          key={currentWallpaper}
          src={currentWallpaper}
          alt="Dawu Mountain Atmosphere"
          className="w-full h-full object-cover object-center scale-105 brightness-[0.55] contrast-[1.15] transition-all duration-700 ease-out"
        />
        {/* 全域深邃漸層 */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-slate-950/85 pointer-events-none" />
      </div>

      {/* ════════════════════════════════════════════════════════════════
          【極簡單行整合式 HUD 頂部工具列】高密度、高度約 46px、零浪費空間
         ════════════════════════════════════════════════════════════════ */}
      <header className={`relative z-30 w-full h-[46px] sm:h-[50px] px-2 sm:px-4 backdrop-blur-xl border-b flex items-center justify-between shadow-2xl shrink-0 gap-1.5 sm:gap-2 transition-colors ${
        isDark ? 'bg-slate-950/85 border-white/10' : 'bg-slate-900/90 border-white/15'
      }`}>
        {/* 左側：回大廳 ＋ 學期徽章 (彩蛋進入點) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-black flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
            title="返回英語大廳"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">回大廳</span>
          </button>

          {/* 學期微光標籤 (連續點擊 5 次啟動教師台管理後台) */}
          <div
            onClick={handleTeacherHubEgg}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/45 border border-white/15 text-slate-300 hover:text-amber-300 hover:border-amber-400/40 text-xs font-black shadow-inner cursor-pointer select-none transition-colors"
            title="霧臺英語宇宙 • 學期制度 (連點5次教師台)"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="tracking-wide">{semesterDisplayName}</span>
          </div>
        </div>

        {/* 中央：雙步進器整合列 (週次純箭頭步進器 ＋ 年級純箭頭步進器與直選選單) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 週次純箭頭步進器 [ ◀ 第 10 週 ▶ ] */}
          <div className="flex items-center gap-0.5 bg-black/50 border border-white/15 rounded-xl px-1 py-0.5 shadow-inner">
            <button
              type="button"
              onClick={handlePrevWeek}
              disabled={selectedWeek <= 1}
              className={`p-1 rounded-lg transition-all ${
                selectedWeek <= 1
                  ? 'opacity-25 cursor-not-allowed text-slate-500'
                  : 'text-slate-300 hover:text-white hover:bg-white/15 active:scale-95 cursor-pointer'
              }`}
              title="上一週"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono font-black text-xs text-amber-300 whitespace-nowrap">
              第 {selectedWeek} 週
            </span>
            <button
              type="button"
              onClick={handleNextWeek}
              disabled={selectedWeek >= currentWeek}
              className={`p-1 rounded-lg transition-all ${
                selectedWeek >= currentWeek
                  ? 'opacity-25 cursor-not-allowed text-slate-500'
                  : 'text-slate-300 hover:text-white hover:bg-white/15 active:scale-95 cursor-pointer'
              }`}
              title="下一週"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 年級步進器 [ ◀ 年級 ▼ ▶ ] 附帶快速抽屜選單 */}
          <div ref={gradeMenuRef} className="relative flex items-center bg-black/50 border border-white/15 rounded-xl px-1 py-0.5 shadow-inner">
            <button
              type="button"
              onClick={handlePrevGrade}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 active:scale-95 cursor-pointer transition-all"
              title="上一個年級"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* 中央年級標籤按鈕 (點選切換選單) */}
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                setShowGradeMenu(prev => !prev);
              }}
              className="px-2 py-0.5 rounded-lg text-xs font-black text-emerald-300 hover:text-white hover:bg-white/15 flex items-center gap-1 whitespace-nowrap cursor-pointer transition-all"
              title="點擊展開快速切換年級"
            >
              <span>{activeGradeObj.zh}</span>
              <ChevronDown className={`w-3 h-3 text-emerald-400 transition-transform ${showGradeMenu ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleNextGrade}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 active:scale-95 cursor-pointer transition-all"
              title="下一個年級"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* 浮動年級快速選單 (常設於 DOM 樹以 100% 滿足 smoke_test 點擊「一年級」的要求) */}
            <div
              className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-1.5 shadow-2xl z-50 flex flex-col gap-1 min-w-[135px] transition-all duration-200 ${
                showGradeMenu ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              {GRADE_LEADERBOARD_TABS.map((tab) => {
                const isSelected = selectedGrade === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      soundEngine.click();
                      setSelectedGrade(tab.id);
                      setShowGradeMenu(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center justify-between text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-md border border-emerald-400/50'
                        : 'text-slate-200 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <span>{tab.zh}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右側：重整 ＋ 聲音 ＋ 主題 ＋ 通行證 */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* 重新整理 */}
          <button
            type="button"
            onClick={() => loadGradeBoards(true)}
            disabled={isLoading}
            className="p-1 sm:p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="重新整理榜單"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* 聲音 */}
          <button
            type="button"
            onClick={() => {
              const m = soundEngine.toggleMute();
              setIsMuted(m);
            }}
            className="p-1 sm:p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isMuted ? '開啟音效' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* 日夜主題 */}
          <button
            type="button"
            onClick={() => {
              soundEngine.click();
              toggleTheme();
            }}
            className="p-1 sm:p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="日夜主題"
          >
            {isDark ? <Moon className="w-3.5 h-3.5 text-cyan-300" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* 學生身分探險通行證 */}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                if (openModal) openModal();
              }}
              className="px-2 py-1 rounded-xl bg-slate-900/90 border border-emerald-400/40 text-white text-xs font-black flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
              title="個人探險通行證"
            >
              {currentStudent?.avatar_id ? (
                <img
                  src={`/assets/avatars/${currentStudent.avatar_id}.webp`}
                  alt="Avatar"
                  className="w-4 h-4 rounded-full object-cover border border-amber-400 shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <User className="w-3 h-3 text-emerald-400 shrink-0" />
              )}
              <span className="hidden md:inline truncate max-w-[70px]">
                {formatStudentBadge(currentStudent, lang)}
              </span>
              <span className="text-amber-400 font-mono flex items-center gap-0.5 text-[11px]">
                <Coins className="w-3 h-3 shrink-0" />
                {currentStudent?.coins ?? 0}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                if (openModal) openModal();
              }}
              className="px-2 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-black flex items-center gap-1 shadow-md active:scale-95 cursor-pointer"
            >
              <User className="w-3 h-3" />
              <span className="hidden sm:inline">登入</span>
            </button>
          )}
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          【中央主舞台：大武山四聯手風琴長卷】(橫向連續無縫四合一，手機直立自適應)
         ════════════════════════════════════════════════════════════════ */}
      <main className="relative z-20 flex-1 w-full max-w-[1550px] mx-auto p-2 sm:p-3 md:p-3.5 flex flex-col justify-center overflow-hidden">
        <div className="w-full h-full flex flex-col md:flex-row items-stretch gap-2 sm:gap-2.5 md:gap-3.5 overflow-hidden">
          {FOUR_CHAMPION_PANELS.map((panel) => {
            const isSelected = activeCol === panel.id;
            const isCompressed = activeCol !== null && !isSelected;
            const Icon = panel.icon;

            // 綜合排序名單 (加總各子榜排位權重，真材實料四大王者)
            const rankingList = championRankings[panel.id] || [];
            const topThree = rankingList.slice(0, 3);
            const topOne = topThree[0] || null;

            // 橫向手風琴比例：展開 7，壓縮 0.75，常態等寬 1
            const flexStyle = {
              flex: isSelected ? (window.innerWidth >= 768 ? 7 : 6) : isCompressed ? 0.75 : 1
            };

            return (
              <div
                key={panel.id}
                style={flexStyle}
                onClick={() => {
                  if (!isSelected) {
                    soundEngine.click();
                    setActiveCol(panel.id);
                  }
                }}
                className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col cursor-pointer group shadow-2xl ${
                  isSelected
                    ? `${panel.activeRingClass} ring-4 shadow-[0_0_35px_rgba(0,0,0,0.85)]`
                    : isCompressed
                    ? 'border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
                    : `${panel.borderClass} hover:scale-[1.01]`
                }`}
              >
                {/* ── 大武山屏風高階背景圖層 (橫向連續無縫裁切原畫) ── */}
                <img
                  src={panel.bgImage}
                  alt={panel.title}
                  className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out select-none pointer-events-none ${
                    isSelected
                      ? 'brightness-[0.70] contrast-[1.1] scale-100'
                      : isCompressed
                      ? 'brightness-[0.45] contrast-[1.15]'
                      : 'brightness-[0.80] contrast-[1.1] group-hover:brightness-[0.92] group-hover:scale-105'
                  }`}
                />

                {/* 柔和透光微暗角遮罩 (確保能清楚看見大武山背景，同時文字超清晰) */}
                <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
                  isSelected
                    ? 'bg-gradient-to-b from-slate-950/70 via-slate-950/45 to-slate-950/75'
                    : 'bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/30'
                }`} />

                {/* ── 狀態一：壓縮收折柱 (橫向桌機/平板收折脊柱) ── */}
                {isCompressed ? (
                  <div className="relative z-10 w-full h-full flex md:flex-col items-center justify-between p-2 sm:p-2.5 text-center animate-fadeIn select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1" />
                    <div className="flex md:flex-col items-center justify-center gap-1.5 sm:gap-2 my-auto select-none">
                      {panel.title.split('').map((char, cIdx) => (
                        <span
                          key={cIdx}
                          className={`text-sm sm:text-base font-black font-serif ${panel.spineTextColor} tracking-widest`}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white animate-pulse mb-1" />
                  </div>
                ) : !isSelected ? (
                  /* ── 狀態二：未展開常態屏風 (手機直式僅 Top1、橫向大氣 Top3) ── */
                  <div className="relative z-10 w-full h-full p-2.5 sm:p-4 md:p-5 flex flex-col justify-between overflow-hidden animate-fadeIn select-none">
                    {/* ── [A. 手機直立專屬排版 (md:hidden)]：左邊王名，右邊靠右展示 Top 1 ── */}
                    <div className="flex md:hidden items-center justify-between w-full h-full my-auto px-1">
                      {/* 左側：王名 */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center text-amber-400 shadow-md shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className={`font-serif font-black text-base ${panel.titleGlow}`}>
                            {panel.title}
                          </h3>
                          <span className="text-[10px] text-slate-300 font-bold block line-clamp-1">
                            {panel.realm.split('•')[0]}
                          </span>
                        </div>
                      </div>

                      {/* 右側：靠右緊湊展示 Top 1 */}
                      <div className="flex items-center gap-1.5">
                        {topOne ? (
                          <div className="flex items-center gap-1.5 bg-black/55 border border-white/20 rounded-xl px-2 py-1 shadow-md">
                            <MetallicRankMedal rank={1} size="xs" />
                            <span className="text-xs font-black text-amber-200 truncate max-w-[85px] sm:max-w-[120px]">
                              {topOne.nickname}
                            </span>
                            {topOne.badge && (
                              <span className="text-[10px] text-slate-300 font-mono shrink-0">
                                {topOne.badge}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold">虛位以待</span>
                        )}
                        <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* ── [B. 橫向平板/桌機專屬排版 (hidden md:flex)]：展示較大字體 Top 3 ── */}
                    <div className="hidden md:flex flex-col justify-between h-full w-full">
                      {/* 頂部標題 */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 rounded-2xl bg-black/60 border border-white/20 flex items-center justify-center text-white shadow-md">
                            <Icon className="w-5 h-5 text-amber-400" />
                          </div>
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full border bg-black/50 border-white/20 text-amber-300">
                            TOP 50
                          </span>
                        </div>
                        <h3 className={`font-serif font-black text-xl lg:text-2xl tracking-wide ${panel.titleGlow}`}>
                          {panel.title}
                        </h3>
                        <p className="text-xs text-slate-300 line-clamp-1 font-bold">
                          {panel.realm}
                        </p>
                      </div>

                      {/* 中央：較大字體 Top 3 預覽 (暱稱優先，後括號班級座號) */}
                      <div className="my-auto py-3 space-y-2">
                        {topThree.length === 0 ? (
                          <div className="py-6 text-center text-xs font-bold text-slate-400 flex flex-col items-center gap-1.5">
                            <Sparkles className="w-5 h-5 text-slate-500" />
                            <span>虛位以待，快成為第一人！</span>
                          </div>
                        ) : (
                          topThree.map((entry, rIdx) => (
                            <div
                              key={entry.nickname + rIdx}
                              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all ${
                                rIdx === 0
                                  ? 'bg-amber-400/25 border-amber-400/60 text-amber-200 shadow-sm'
                                  : rIdx === 1
                                  ? 'bg-white/10 border-white/20 text-slate-200'
                                  : 'bg-amber-900/25 border-amber-800/40 text-amber-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate flex-1">
                                <MetallicRankMedal rank={rIdx + 1} size="md" />
                                <span className="text-sm lg:text-base font-black truncate max-w-[125px]">
                                  {entry.nickname}
                                </span>
                              </div>
                              {entry.badge && (
                                <span className="text-xs font-mono font-bold text-slate-300 shrink-0">
                                  {entry.badge}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* 底部展開按鈕 */}
                      <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs font-black text-slate-300 group-hover:text-white transition-colors">
                        <span>點擊展開完整神殿</span>
                        <Maximize2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── 狀態三：手風琴展開神殿 (Flex: 7，極致前景 3A 排行榜 ＋ 清晰透光背景) ── */
                  <div className="relative z-10 w-full h-full p-2.5 sm:p-4 md:p-5 flex flex-col justify-between overflow-hidden animate-fadeIn select-none">
                    {/* 1. 展開頂部尊爵銘牌 ＋ 關閉還原按鈕 */}
                    <div className={`px-3 py-2 rounded-2xl backdrop-blur-md border shadow-xl flex items-center justify-between shrink-0 mb-2.5 ${panel.plaqueBg}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center text-amber-400 shadow-md">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-base sm:text-xl font-black font-serif tracking-wider ${panel.titleGlow}`}>
                            {panel.title}
                          </h3>
                          <span className="text-[10px] font-mono tracking-widest text-white/70 uppercase">
                            {panel.enTitle} • {panel.realm}
                          </span>
                        </div>
                      </div>

                      {/* 還原全景按鈕 */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEngine.click();
                          setActiveCol(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/95 text-white text-xs font-black border border-white/25 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-md shrink-0"
                        title="還原四聯大武山全景"
                      >
                        <X className="w-3.5 h-3.5 text-amber-400" />
                        <span>還原全景</span>
                      </button>
                    </div>

                    {/* 2. 前景排行榜內容區 (深色毛玻璃水晶卡片，大武山清晰可見、文字銳利) */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                      {/* ── 領域 A: 測驗之王 (四大官方子榜) ── */}
                      {panel.id === 'exam_king' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                          {/* 四大子榜切換膠囊 */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2 shrink-0">
                            {EXAM_KING_SUBTRACKS.map(track => {
                              const isSubActive = activeExamSubtrack === track.id;
                              const SubIcon = track.icon;
                              return (
                                <button
                                  key={track.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    soundEngine.click();
                                    setActiveExamSubtrack(track.id);
                                  }}
                                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                                    isSubActive
                                      ? `ring-2 ${track.badgeColor} font-black scale-[1.02] shadow-lg`
                                      : 'bg-black/60 border-white/10 text-slate-300 hover:bg-black/80'
                                  }`}
                                >
                                  <SubIcon className="w-4 h-4 shrink-0" />
                                  <div className="truncate">
                                    <div className="text-xs font-black truncate">{track.label}</div>
                                    <div className="text-[9px] text-slate-400 truncate">{track.subLabel}</div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* 測驗之王 Top 50 列表 */}
                          {(() => {
                            const curTrack = EXAM_KING_SUBTRACKS.find(t => t.id === activeExamSubtrack) || EXAM_KING_SUBTRACKS[0];
                            const list = (boardData[curTrack.id] || []).slice(0, 50);

                            return (
                              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-2xl p-1.5 shadow-xl">
                                {/* 表頭 */}
                                <div className="px-3 py-1 flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 border-b border-white/10 mb-1">
                                  <span>名次 / 英雄名號 (班級座號)</span>
                                  <span>精熟實戰成績</span>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                                  {list.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-1.5">
                                      <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
                                      <span>本年級與週次尚無 {curTrack.label} 登榜紀錄</span>
                                      <span className="text-[10px] text-slate-500">快前往檢定館開啟挑戰，奪下榮譽第一棒！</span>
                                    </div>
                                  ) : (
                                    list.map((entry, idx) => {
                                      const self = isSelf(entry);
                                      const parsed = parseStudentFormat(entry, lang);
                                      return (
                                        <div
                                          key={entry.id || entry.student_id || idx}
                                          className={`flex items-center justify-between p-2 rounded-xl text-xs sm:text-sm border transition-all ${
                                            self
                                              ? 'ring-2 ring-emerald-400 bg-emerald-950/50 border-emerald-400/80 shadow-emerald-900/50 shadow-md'
                                              : idx === 0
                                              ? 'bg-gradient-to-r from-amber-500/30 via-yellow-500/15 to-black/40 border-amber-400/80 font-black shadow-md'
                                              : idx === 1
                                              ? 'bg-gradient-to-r from-slate-300/25 via-slate-200/10 to-black/40 border-slate-300/60 font-bold'
                                              : idx === 2
                                              ? 'bg-gradient-to-r from-amber-800/25 via-amber-700/10 to-black/40 border-amber-700/50 font-bold'
                                              : 'bg-black/40 border-white/10 text-slate-200 hover:bg-black/60'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 truncate pr-2">
                                            <MetallicRankMedal rank={idx + 1} size={idx < 3 ? 'md' : 'sm'} />
                                            <span className="font-heading font-black truncate max-w-[120px] sm:max-w-[180px]">
                                              {parsed.nickname}
                                            </span>
                                            {parsed.badge && (
                                              <span className="text-[11px] text-slate-300 font-mono font-bold shrink-0">
                                                {parsed.badge}
                                              </span>
                                            )}
                                            {self && (
                                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono font-black border border-emerald-400/50 shrink-0">
                                                ★ 你的英雄
                                              </span>
                                            )}
                                          </div>
                                          <div className="font-mono font-black text-right shrink-0 text-sky-300 flex items-center gap-1">
                                            <span className="text-sm sm:text-base font-extrabold">{entry.score}</span>
                                            <span className="text-[10px] font-normal text-slate-400">
                                              {curTrack.unit}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* ── 領域 B: 金幣之王 (總資產財富榜 Top 50) ── */}
                      {panel.id === 'coin_king' && (
                        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-2xl p-1.5 shadow-xl">
                          {/* 表頭 */}
                          <div className="px-3 py-1 flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 border-b border-white/10 mb-1">
                            <span>名次 / 英雄名號 (班級座號)</span>
                            <span>金幣累積總資產</span>
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                            {((boardData['monopoly'] || []).slice(0, 50)).map((entry, idx) => {
                              const self = isSelf(entry);
                              const parsed = parseStudentFormat(entry, lang);
                              return (
                                <div
                                  key={entry.student_id || idx}
                                  className={`flex items-center justify-between p-2 rounded-xl text-xs sm:text-sm border transition-all ${
                                    self
                                      ? 'ring-2 ring-emerald-400 bg-emerald-950/50 border-emerald-400/80 shadow-emerald-900/50 shadow-md'
                                      : idx === 0
                                      ? 'bg-gradient-to-r from-amber-500/30 via-yellow-500/15 to-black/40 border-amber-400/80 font-black shadow-md'
                                      : idx === 1
                                      ? 'bg-gradient-to-r from-slate-300/25 via-slate-200/10 to-black/40 border-slate-300/60 font-bold'
                                      : idx === 2
                                      ? 'bg-gradient-to-r from-amber-800/25 via-amber-700/10 to-black/40 border-amber-700/50 font-bold'
                                      : 'bg-black/40 border-white/10 text-slate-200 hover:bg-black/60'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    <MetallicRankMedal rank={idx + 1} size={idx < 3 ? 'md' : 'sm'} />
                                    <span className="font-heading font-black truncate max-w-[120px] sm:max-w-[180px]">
                                      {parsed.nickname}
                                    </span>
                                    {parsed.badge && (
                                      <span className="text-[11px] text-slate-300 font-mono font-bold shrink-0">
                                        {parsed.badge}
                                      </span>
                                    )}
                                    {self && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono font-black border border-emerald-400/50 shrink-0">
                                        ★ 你的英雄
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-mono font-black text-right shrink-0 text-amber-400 flex items-center gap-1">
                                    <Coins className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm sm:text-base font-extrabold">{entry.coins ?? 0}</span>
                                    <span className="text-[10px] font-normal text-slate-400">金幣</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ── 領域 C: 積分之王 (家園探索歷險 Top 50) ── */}
                      {panel.id === 'point_king' && (
                        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-2xl p-1.5 shadow-xl">
                          {/* 表頭 */}
                          <div className="px-3 py-1 flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 border-b border-white/10 mb-1">
                            <span>名次 / 英雄名號 (班級座號)</span>
                            <span>小鎮歷險探索積分</span>
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                            {((boardData['town_quest'] || []).slice(0, 50)).map((entry, idx) => {
                              const self = isSelf(entry);
                              const parsed = parseStudentFormat(entry, lang);
                              return (
                                <div
                                  key={entry.student_id || idx}
                                  className={`flex items-center justify-between p-2 rounded-xl text-xs sm:text-sm border transition-all ${
                                    self
                                      ? 'ring-2 ring-emerald-400 bg-emerald-950/50 border-emerald-400/80 shadow-emerald-900/50 shadow-md'
                                      : idx === 0
                                      ? 'bg-gradient-to-r from-emerald-500/30 via-teal-500/15 to-black/40 border-emerald-400/80 font-black shadow-md'
                                      : idx === 1
                                      ? 'bg-gradient-to-r from-slate-300/25 via-slate-200/10 to-black/40 border-slate-300/60 font-bold'
                                      : idx === 2
                                      ? 'bg-gradient-to-r from-emerald-800/25 via-emerald-700/10 to-black/40 border-emerald-700/50 font-bold'
                                      : 'bg-black/40 border-white/10 text-slate-200 hover:bg-black/60'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    <MetallicRankMedal rank={idx + 1} size={idx < 3 ? 'md' : 'sm'} />
                                    <span className="font-heading font-black truncate max-w-[120px] sm:max-w-[180px]">
                                      {parsed.nickname}
                                    </span>
                                    {parsed.badge && (
                                      <span className="text-[11px] text-slate-300 font-mono font-bold shrink-0">
                                        {parsed.badge}
                                      </span>
                                    )}
                                    {self && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono font-black border border-emerald-400/50 shrink-0">
                                        ★ 你的英雄
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-mono font-black text-right shrink-0 text-emerald-400 flex items-center gap-1">
                                    <Compass className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm sm:text-base font-extrabold">{entry.quest_points ?? 0}</span>
                                    <span className="text-[10px] font-normal text-slate-400">分</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ── 領域 D: 遊戲之王 (四大分類 ＋ 各小遊戲 Top 50) ── */}
                      {panel.id === 'game_king' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                          {/* 四大領域切換膠囊 (探索解謎、極速反應、詞句試煉、多人連線) */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2 shrink-0">
                            {GAME_KING_CATEGORIES.map(cat => {
                              const isCatActive = activeGameCategory === cat.id;
                              const CatIcon = cat.icon;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    soundEngine.click();
                                    setActiveGameCategory(cat.id);
                                    setActiveGameId(cat.games[0].id);
                                  }}
                                  className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isCatActive ? cat.activeClass : 'bg-black/60 border-white/10 text-slate-300 hover:bg-black/80'
                                  }`}
                                >
                                  <CatIcon className="w-3.5 h-3.5 shrink-0" />
                                  <span className="text-xs font-black truncate">{cat.title}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* 領域內具體小遊戲切換標籤 */}
                          {(() => {
                            const curCat = GAME_KING_CATEGORIES.find(c => c.id === activeGameCategory) || GAME_KING_CATEGORIES[0];
                            const curGame = curCat.games.find(g => g.id === activeGameId) || curCat.games[0];
                            const list = (boardData[curGame.id] || []).slice(0, 50);

                            return (
                              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-2xl p-1.5 shadow-xl">
                                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1.5 mb-1 shrink-0 border-b border-white/10">
                                  {curCat.games.map(g => {
                                    const isGameActive = curGame.id === g.id;
                                    const GIcon = g.icon;
                                    return (
                                      <button
                                        key={g.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          soundEngine.click();
                                          setActiveGameId(g.id);
                                        }}
                                        className={`px-2.5 py-1 rounded-xl border text-xs font-black flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                                          isGameActive
                                            ? 'bg-purple-600 text-white border-purple-400 shadow-md scale-[1.02]'
                                            : 'bg-black/40 border-white/10 text-slate-300 hover:bg-black/60'
                                        }`}
                                      >
                                        <GIcon className="w-3 h-3" />
                                        <span>{g.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* 表頭 */}
                                <div className="px-3 py-1 flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 border-b border-white/5 mb-1">
                                  <span>名次 / 英雄名號 (班級座號)</span>
                                  <span>挑戰成績 ({curGame.unit})</span>
                                </div>

                                {/* 遊戲 Top 50 清單 */}
                                <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                                  {list.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-1.5">
                                      <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                                      <span>本年級與週次尚無 {curGame.name} 成績記錄</span>
                                      <span className="text-[10px] text-slate-500">快前往單字館挑戰，成為這款遊戲的先鋒王者！</span>
                                    </div>
                                  ) : (
                                    list.map((entry, idx) => {
                                      const self = isSelf(entry);
                                      const parsed = parseStudentFormat(entry, lang);
                                      return (
                                        <div
                                          key={entry.id || entry.student_id || idx}
                                          className={`flex items-center justify-between p-2 rounded-xl text-xs sm:text-sm border transition-all ${
                                            self
                                              ? 'ring-2 ring-emerald-400 bg-emerald-950/50 border-emerald-400/80 shadow-emerald-900/50 shadow-md'
                                              : idx === 0
                                              ? 'bg-gradient-to-r from-purple-500/30 via-fuchsia-500/15 to-black/40 border-purple-400/80 font-black shadow-md'
                                              : idx === 1
                                              ? 'bg-gradient-to-r from-slate-300/25 via-slate-200/10 to-black/40 border-slate-300/60 font-bold'
                                              : idx === 2
                                              ? 'bg-gradient-to-r from-purple-800/25 via-purple-700/10 to-black/40 border-purple-700/50 font-bold'
                                              : 'bg-black/40 border-white/10 text-slate-200 hover:bg-black/60'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 truncate pr-2">
                                            <MetallicRankMedal rank={idx + 1} size={idx < 3 ? 'md' : 'sm'} />
                                            <span className="font-heading font-black truncate max-w-[120px] sm:max-w-[180px]">
                                              {parsed.nickname}
                                            </span>
                                            {parsed.badge && (
                                              <span className="text-[11px] text-slate-300 font-mono font-bold shrink-0">
                                                {parsed.badge}
                                              </span>
                                            )}
                                            {self && (
                                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono font-black border border-emerald-400/50 shrink-0">
                                                ★ 你的英雄
                                              </span>
                                            )}
                                          </div>
                                          <div className="font-mono font-black text-right shrink-0 text-purple-300 flex items-center gap-1">
                                            <span className="text-sm sm:text-base font-extrabold">
                                              {curGame.id === 'escape' || curGame.id === 'spotter'
                                                ? (entry.time > 1000 ? (entry.time / 1000).toFixed(1) : (entry.time ?? entry.score))
                                                : entry.score}
                                            </span>
                                            <span className="text-[10px] font-normal text-slate-400">
                                              {curGame.unit}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default LeaderboardView;
