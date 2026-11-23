import React, { useState, useEffect, useMemo } from 'react';
import { useStudent } from '../context/StudentContext';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { Button3D } from './ui/Button3D';
import { GlassCard } from './ui/GlassCard';
import {
  GRADE_OPTIONS,
  CLASS_OPTIONS,
  formatStudentId,
  formatStudentDisplayName,
  formatStudentBadge,
  doesLeaderboardEntryMatchStudent,
  getRandomFunNickname,
  isGuestStudent,
  pad2
} from '../utils/studentIdHelper';
import { getTransferPinFromProfile, isValidTransferPin } from '../services/accountTransferHelper';
import { AVATAR_LIST, AVATAR_FRAMES, getAvatarById, getAvatarFrameById } from '../data/avatars';
import { getProfanityError } from '../services/profanityFilter';
import { fetchLeaderboard, getWeekNumber } from '../services/supabase';
import {
  User,
  Sparkles,
  Coins,
  Trophy,
  Package,
  X,
  LogOut,
  RefreshCw,
  Check,
  Dices,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Medal,
  Crown,
  Layers,
  BookOpen,
  KeyRound,
  ArrowRightLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GrimoireSanctuaryModal } from './GrimoireSanctuaryModal';
import { CurioBackpackModal } from '../games/town/CurioBackpackModal';
import { getGrimoireSummary } from '../utils/grimoireHelper';
import { groupInventoryItems, getInventorySummary } from '../utils/inventoryHelper';
import { soundEngine } from '../services/audio';
import { CONSOLIDATED_GAME_MODES } from './LeaderboardView';

export const StudentProfileModal = () => {
  const {
    currentStudent,
    isLoggedIn,
    isModalOpen,
    closeModal,
    loginStudent,
    logoutStudent,
    updateAvatar,
    setTransferPin,
    importOldSeatData,
    avatarId,
    avatarFrame,
    isLoading
  } = useStudent();
  const { t, lang } = useI18n();

  // 內部狀態：是否正在切換/編輯身分
  const [isSwitching, setIsSwitching] = useState(false);

  // 軌道二：4 碼換機密碼與舊座號匯入面板
  const [transferPanel, setTransferPanel] = useState(null); // null | 'pin' | 'import'
  const [pinInput, setPinInput] = useState('');
  const [oldGrade, setOldGrade] = useState('01');
  const [oldClass, setOldClass] = useState('01');
  const [oldSeat, setOldSeat] = useState('01');
  const [importPinInput, setImportPinInput] = useState('');
  const [transferStatusMsg, setTransferStatusMsg] = useState(null); // { type: 'success'|'error', text }
  const [isTransferBusy, setIsTransferBusy] = useState(false);

  // 勇士頭像立繪與外框更換選單狀態
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [avatarSubTab, setAvatarSubTab] = useState('avatars'); // 'avatars' | 'frames'
  const [avatarGenderFilter, setAvatarGenderFilter] = useState('all'); // 'all' | 'boy' | 'girl'

  const currentAvatar = useMemo(() => {
    return getAvatarById(currentStudent?.avatar_id || avatarId);
  }, [currentStudent?.avatar_id, avatarId]);

  const currentFrame = useMemo(() => {
    return getAvatarFrameById(currentStudent?.avatar_frame || avatarFrame);
  }, [currentStudent?.avatar_frame, avatarFrame]);

  // 表單狀態
  const [selectedGrade, setSelectedGrade] = useState('04'); // 預設 4 年級
  const [selectedClass, setSelectedClass] = useState('01'); // 預設 甲班
  const [selectedSeat, setSelectedSeat] = useState('01');   // 預設 1 號
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  // 學生榜單榮譽 Top 3 資料 (查核該學生在哪些模式名列前 3)
  const [studentTopHonors, setStudentTopHonors] = useState([]);
  const [isLoadingHonors, setIsLoadingHonors] = useState(false);

  const { isDark } = useTheme();

  // 執照主題樣式：'dark' (深邃墨岩冷光) | 'parchment' (羊皮紙石雕) - 預設自適應全局主題
  const [cardTheme, setCardTheme] = useState(() => (isDark ? 'dark' : 'parchment'));

  useEffect(() => {
    setCardTheme(isDark ? 'dark' : 'parchment');
  }, [isDark]);

  // 八冊秘典典藏館與多寶格背包彈窗
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);
  const [isCurioBackpackOpen, setIsCurioBackpackOpen] = useState(false);

  // 八星大宗師與全冊三星解鎖進度總結
  const grimoireSummary = useMemo(() => {
    return getGrimoireSummary(currentStudent?.student_id || 'guest');
  }, [currentStudent?.student_id, isGrimoireOpen]);

  // 背包物品自動摺疊堆疊（同品摺疊為 1 格並標記 xN 數量）
  const groupedInventory = useMemo(() => {
    return groupInventoryItems(currentStudent?.inventory || []);
  }, [currentStudent?.inventory]);

  // 背包物品概括統計（供通行證單頁精確展示幾類幾樣，杜絕捲動條）
  const inventorySummary = useMemo(() => {
    return getInventorySummary(currentStudent?.inventory || []);
  }, [currentStudent?.inventory]);

  // 當彈窗開啟或學生變更時同步表單
  useEffect(() => {
    if (currentStudent) {
      setSelectedGrade(pad2(currentStudent.grade));
      setSelectedClass(pad2(currentStudent.class));
      setSelectedSeat(pad2(currentStudent.seat));
      setNickname(currentStudent.nickname || '');
      setIsSwitching(false);
    } else {
      setIsSwitching(true);
      if (!nickname) {
        setNickname(getRandomFunNickname());
      }
    }
    setNicknameError('');
  }, [currentStudent, isModalOpen]);

  // 讀取學生本週與榮譽榜 Top 3 榮耀成就 (由 CONSOLIDATED_GAME_MODES 動態驅動，隨新遊戲即時自動同步)
  useEffect(() => {
    let isMounted = true;
    const loadTopHonors = async () => {
      if (!currentStudent?.student_id || !isModalOpen) return;
      setIsLoadingHonors(true);
      try {
        const curWeek = getWeekNumber();

        // 1. 全校冒險總積分榜永遠置頂
        const modesToCheck = [
          { mode: 'all', title: '全校冒險總積分榜', icon: '🏆' }
        ];

        // 2. 動態同步所有已註冊的遊戲模式 (由 CONSOLIDATED_GAME_MODES 集中註冊中心動態驅動，隨新遊戲即時更新)
        const iconMap = {
          escape: '🗝️',
          spotter: '👁️',
          maze: '🧭',
          memory: '🎴',
          mole: '⚡',
          swipe: '🔥',
          meteor: '🚀',
          snake: '🐍',
          quiz: '🎯',
          listening: '🎧',
          sentence: '🧱',
          spelling: '🧩',
          handwriting: '✍️',
          battle: '⚔️',
          listening_lab: '🎙️',
          phonics: '🗣️'
        };

        if (Array.isArray(CONSOLIDATED_GAME_MODES)) {
          CONSOLIDATED_GAME_MODES.forEach((gm) => {
            if (!gm.id || gm.id === 'all' || gm.id === 'monopoly') return;
            const queryMode = Array.isArray(gm.modeKeys) && gm.modeKeys.length > 0 ? gm.modeKeys : [gm.id];
            const iconChar = iconMap[gm.id] || '🏅';
            modesToCheck.push({
              mode: queryMode,
              title: `${gm.label}榮譽榜`,
              icon: iconChar
            });
          });
        }

        // 3. 平行非阻塞並發查核各遊戲模式榜單
        const results = await Promise.allSettled(
          modesToCheck.map(async (item) => {
            try {
              const res = await fetchLeaderboard(curWeek, item.mode, 'all', 10);
              if (res && res.length > 0) {
                const rankIdx = res.findIndex(r => doesLeaderboardEntryMatchStudent(r, currentStudent));
                if (rankIdx !== -1 && rankIdx < 3) {
                  return {
                    rank: rankIdx + 1,
                    title: item.title,
                    icon: item.icon,
                    score: res[rankIdx].score,
                    time: res[rankIdx].time
                  };
                }
              }
            } catch (queryErr) {
              // 個別模式查驗異常不中斷其他榜單
            }
            return null;
          })
        );

        if (isMounted) {
          const honors = results
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value);
          setStudentTopHonors(honors);
        }
      } catch (err) {
        console.warn('查驗榮譽榜 Top 3 失敗:', err);
      } finally {
        if (isMounted) setIsLoadingHonors(false);
      }
    };

    loadTopHonors();
    return () => {
      isMounted = false;
    };
  }, [currentStudent, isModalOpen]);

  if (!isModalOpen) return null;

  // 即時計算 6 碼 ID
  const currentComputedId = formatStudentId(selectedGrade, selectedClass, selectedSeat);

  // 驗證並抽取趣味暱稱
  const handleRandomNickname = () => {
    const randomNick = getRandomFunNickname();
    setNickname(randomNick);
    setNicknameError('');
  };

  const handleNicknameChange = (e) => {
    const val = e.target.value.slice(0, 12);
    setNickname(val);
    const err = getProfanityError(val);
    setNicknameError(err || '');
  };

  const handleConfirmLogin = async (e) => {
    e?.preventDefault();
    if (nicknameError) return;

    let finalNick = nickname.trim();
    if (!finalNick) {
      finalNick = getRandomFunNickname();
    }

    const res = await loginStudent({
      grade: selectedGrade,
      classNum: selectedClass,
      seat: selectedSeat,
      nickname: finalNick
    });

    if (res.success) {
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}
      setIsSwitching(false);
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* 浮動式無邊框高質感【大武山神廟古代石板通行證】 */}
      {/* 浮動式【大武山神廟古代石板通行證】 */}
      <div className="relative my-auto flex flex-col items-center animate-scaleUp">
        
        {/* 模式 A：已登入且未點選切換 ── 顯示精美【大武山石板勇士執照】原畫質證件 */}
        {isLoggedIn && !isSwitching ? (
          <div className="flex flex-col items-center gap-2.5">
            
            {/* 卡片本體：以底圖自然文檔流撐開真實物理高寬，100% 完美貼合，絕對不跑版 */}
            <div
              className="relative select-none shadow-[0_0_50px_rgba(16,185,129,0.35)]"
              style={{
                width: 'min(94vw, 460px, calc((85vh - 56px) * 0.75))',
                maxWidth: '100%'
              }}
            >
              
              {/* 高解析精美神廟石板原畫背景 (自然流撐開父容器高寬，100% 嚴格 768:1024 物理等比) */}
              <img
                src={cardTheme === 'dark' ? '/assets/pass/slate_pass_dark.webp' : '/assets/pass/slate_pass_parchment.webp'}
                alt="Ancient Slate Warrior Pass"
                className="w-full h-auto block select-none pointer-events-none drop-shadow-2xl"
                width={768}
                height={1024}
              />

              {/* 浮動頂部微操作鈕 (關閉與風格切換) */}
              <div className="absolute top-[2%] right-[2.5%] z-30 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCardTheme(prev => prev === 'dark' ? 'parchment' : 'dark')}
                  className="px-2 py-0.5 rounded-lg bg-black/75 hover:bg-black text-emerald-300 border border-emerald-400/40 text-[9px] font-mono font-bold flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
                  title="切換石板風格 (深邃墨岩 / 象牙羊皮)"
                >
                  <Layers className="w-2.5 h-2.5" />
                  <span>{cardTheme === 'dark' ? '墨岩' : '羊皮'}</span>
                </button>

                <button
                  onClick={closeModal}
                  className="w-6 h-6 rounded-full bg-black/75 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center border border-white/20 shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
                  title="關閉"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* ═══ 槽位 1：左上學生頭像槽 (Left: 9.90%, Top: 13.57%, W: 28.91%, H: 21.19%) ═══ */}
              <div className="absolute left-[9.90%] top-[13.57%] w-[28.91%] h-[21.19%] flex flex-col items-center justify-center p-0.5 z-20">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      confetti({ particleCount: 20, spread: 40, origin: { y: 0.3 } });
                    } catch (e) {}
                    setIsAvatarSelectorOpen(true);
                  }}
                  className="group relative flex flex-col items-center justify-center focus:outline-none cursor-pointer active:scale-95 transition-transform w-full h-full"
                  title="點擊更換勇士立繪與石板神槽外框"
                >
                  {/* 槽位靈氣呼吸光暈 (Aura pulse) */}
                  <div className={`absolute -inset-1.5 rounded-2xl bg-gradient-to-tr ${currentFrame.auraClass} blur-md animate-aura-pulse pointer-events-none`} />

                  {/* 頭像實體圓角容器 + 鑲嵌外框 */}
                  <div className={`w-[84%] h-[84%] rounded-xl overflow-hidden relative ${currentFrame.ringClass} bg-slate-950 shadow-xl transition-all duration-300`}>
                    {/* 2.5D 頭像立繪 + 輕柔呼吸微動效 */}
                    <img
                      src={currentAvatar.image}
                      alt={currentAvatar.name}
                      className="w-full h-full object-cover object-center animate-avatar-breathe select-none"
                    />

                    {/* 鏡面微光掠過 (Shimmer sweep) */}
                    <div className="absolute inset-0 w-[50%] h-[200%] -top-[50%] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-shimmer-sweep" />

                    {/* Hover 浮動提示「換造型」 */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold backdrop-blur-[2px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                      <span>換造型</span>
                    </div>
                  </div>

                  {/* 槽位下方等級/座號標籤 */}
                  <div className={`absolute -bottom-1.5 px-2 py-0.2 rounded-full border text-[8px] font-black shadow-md flex items-center gap-1 ${currentFrame.badgeColor} z-10`}>
                    <span>{currentStudent.student_id === '999999' || String(currentStudent.grade) === '99' ? 'LV.訪客' : `LV.${currentStudent.grade || 4}`}</span>
                    <span className="opacity-80">{currentStudent.student_id === '999999' || String(currentStudent.grade) === '99' ? '全校暢玩' : `(${pad2(currentStudent.seat)}號)`}</span>
                  </div>
                </button>
              </div>

              {/* ═══ 槽位 2：右上姓名與 6 碼 ID 槽 (Left: 42.97%, Top: 14.36%, W: 46.61%, H: 8.30%) ═══ */}
              <div className="absolute left-[42.97%] top-[14.36%] w-[46.61%] h-[8.30%] flex flex-col justify-center px-2.5 z-20">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-sm sm:text-base font-heading font-black truncate ${
                    cardTheme === 'dark' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]' : 'text-stone-900'
                  }`}>
                    {currentStudent.nickname}
                  </h4>
                  <span className={`font-mono text-[9px] font-black px-1.5 py-0.2 rounded-md border shrink-0 ${
                    cardTheme === 'dark' ? 'text-amber-300 bg-black/60 border-amber-400/50' : 'text-amber-900 bg-amber-100/80 border-amber-600/50'
                  }`}>
                    ID: {currentStudent.student_id}
                  </span>
                </div>
                <p className={`text-[9px] sm:text-[10px] font-bold truncate ${
                  cardTheme === 'dark' ? 'text-emerald-300' : 'text-emerald-800'
                }`}>
                  {formatStudentDisplayName(currentStudent, lang)}
                </p>
              </div>

              {/* ═══ 槽位 3：右上勇士稱號與 8 星大宗師星盤槽 (Left: 43.10%, Top: 26.37%, W: 46.61%, H: 8.30%) ═══ */}
              <div
                onClick={() => {
                  soundEngine.click();
                  setIsGrimoireOpen(true);
                }}
                className="absolute left-[43.10%] top-[26.37%] w-[46.61%] h-[8.30%] flex flex-col justify-center px-2 z-20 cursor-pointer group hover:bg-black/20 rounded-xl transition-all"
                title="點擊開啟【八冊秘典典藏館】檢視各冊彩色解鎖與星度進程"
              >
                {/* 第一行：左側標籤 + 右側 8 顆星盤星位 (獨立橫列排列，絕不擠壓稱號) */}
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className={`text-[7px] sm:text-[8px] font-mono uppercase tracking-wider font-bold ${
                    cardTheme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                  }`}>
                    TITLED WARRIOR
                  </span>

                  {/* 8 星專屬星盤列 (寬度固定 42px，星度一目了然) */}
                  <div className="flex items-center gap-[1.5px] bg-black/40 px-1 py-0.2 rounded-full border border-amber-400/30">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-[8px] leading-none transition-all ${
                          i < grimoireSummary.masteredStars
                            ? 'text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.9)] animate-pulse'
                            : cardTheme === 'dark' ? 'text-slate-600/70' : 'text-stone-400/60'
                        }`}
                      >
                        {i < grimoireSummary.masteredStars ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 第二行：稱號本體 (字體清晰 11px~12px 絕不縮小) + 典藏館微圖示 */}
                <div className="flex items-center justify-between w-full">
                  <div className={`text-[11px] sm:text-xs font-black truncate flex items-center gap-1 ${
                    cardTheme === 'dark' ? 'text-amber-300' : 'text-amber-900'
                  }`}>
                    <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{grimoireSummary.titleInfo.name}</span>
                  </div>
                  <span className="text-[9px] text-amber-400/80 group-hover:text-amber-300 flex items-center shrink-0">
                    <BookOpen className="w-2.5 h-2.5 ml-0.5" />
                  </span>
                </div>
              </div>

              {/* ═══ 槽位 4：左中金幣資產槽 (Left: 9.90%, Top: 38.18%, W: 36.98%, H: 9.47%) ═══ */}
              <div className="absolute left-[9.90%] top-[38.18%] w-[36.98%] h-[9.47%] flex items-center justify-between px-3 z-20">
                <div className={`flex items-center gap-1.5 text-xs font-black ${
                  cardTheme === 'dark' ? 'text-amber-300' : 'text-amber-800'
                }`}>
                  <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{t.coins}</span>
                </div>
                <div className={`text-sm sm:text-base font-black font-mono ${
                  cardTheme === 'dark' ? 'text-amber-300' : 'text-amber-900'
                }`}>
                  {currentStudent.coins ?? 0}
                </div>
              </div>

              {/* ═══ 槽位 5：右中冒險積分槽 (Left: 52.86%, Top: 38.18%, W: 37.11%, H: 9.47%) ═══ */}
              <div className="absolute left-[52.86%] top-[38.18%] w-[37.11%] h-[9.47%] flex items-center justify-between px-3 z-20">
                <div className={`flex items-center gap-1.5 text-xs font-black ${
                  cardTheme === 'dark' ? 'text-cyan-300' : 'text-teal-800'
                }`}>
                  <Trophy className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{t.questPoints}</span>
                </div>
                <div className={`text-sm sm:text-base font-black font-mono ${
                  cardTheme === 'dark' ? 'text-cyan-300' : 'text-teal-900'
                }`}>
                  {currentStudent.quest_points ?? 0}
                </div>
              </div>

              {/* ═══ 槽位 6：中層多寶格道具收藏槽 (Left: 9.77%, Top: 50.88%, W: 80.08%, H: 9.38%) ═══ */}
              <div
                onClick={() => {
                  soundEngine.click();
                  setIsCurioBackpackOpen(true);
                }}
                className="absolute left-[9.77%] top-[50.88%] w-[80.08%] h-[9.38%] flex items-center justify-between px-3.5 z-20 cursor-pointer group hover:bg-black/20 rounded-2xl transition-all"
                title="點擊開啟【神山多寶格背包】展示與把玩道具"
              >
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-teal-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className={`text-[11px] sm:text-xs font-black ${
                    cardTheme === 'dark' ? 'text-teal-300' : 'text-teal-900'
                  }`}>
                    {t.backpackItems}
                  </span>
                </div>
                {/* 概括統計幾類幾樣，單頁展示免捲動條 (No Bar) */}
                <div className="flex items-center gap-1.5">
                  {inventorySummary.totalCount > 0 ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-950/70 border border-teal-400/40 shadow-sm text-teal-200 group-hover:border-teal-300 transition-colors">
                      <span className="text-[10px] font-black">
                        共 <span className="text-amber-400 font-mono font-bold">{inventorySummary.totalCount}</span> 件 • <span className="text-cyan-300 font-mono font-bold">{inventorySummary.categoryCount}</span> 類寶物
                      </span>
                      <span className="text-[9px] text-amber-300 font-bold ml-1 flex items-center">
                        開啟大背包 ➔
                      </span>
                    </div>
                  ) : (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[9px] font-bold ${
                      cardTheme === 'dark'
                        ? 'border-white/10 bg-black/30 text-slate-400'
                        : 'border-stone-300 bg-stone-100 text-stone-600'
                    }`}>
                      <span>行囊輕便 • 開啟大背包 ➔</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ═══ 槽位 7：底層榮譽榜 TOP 3 成就槽 (Left: 8.85%, Top: 63.38%, W: 81.90%, H: 23.83%) ═══ */}
              <div className="absolute left-[8.85%] top-[63.38%] w-[81.90%] h-[23.83%] flex flex-col justify-between p-2.5 z-20">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-0.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span className={`text-[10px] sm:text-[11px] font-black tracking-wide ${
                      cardTheme === 'dark' ? 'text-amber-300' : 'text-amber-900'
                    }`}>
                      殿堂戰績 • 目前榮譽榜 TOP 3
                    </span>
                  </div>
                  <span className={`text-[8px] font-mono ${
                    cardTheme === 'dark' ? 'text-emerald-300/80' : 'text-emerald-900'
                  }`}>
                    TOP 3 HONORS
                  </span>
                </div>

                <div className="flex-1 my-1 overflow-y-auto space-y-1 pr-1">
                  {isLoadingHonors ? (
                    <div className="flex items-center justify-center h-full text-[10px] text-slate-400 font-bold animate-pulse">
                      正在查核全校榮譽榜殿堂...
                    </div>
                  ) : studentTopHonors.length > 0 ? (
                    studentTopHonors.map((h, i) => (
                      <div key={i} className={`flex items-center justify-between p-1 rounded-lg border ${
                        cardTheme === 'dark' ? 'bg-black/50 border-amber-400/30' : 'bg-stone-200/90 border-amber-800/40 text-stone-900'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shadow ${
                            h.rank === 1 ? 'bg-amber-400 text-stone-950 ring-1 ring-amber-300' :
                            h.rank === 2 ? 'bg-slate-300 text-stone-950' : 'bg-amber-700 text-white'
                          }`}>
                            {h.rank}
                          </span>
                          <span className={`text-[10px] font-bold ${
                            cardTheme === 'dark' ? 'text-white' : 'text-stone-900'
                          }`}>{h.icon} {h.title}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-black ${
                          cardTheme === 'dark' ? 'text-amber-300' : 'text-amber-900'
                        }`}>{h.score}分</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-1">
                      <Medal className="w-4 h-4 text-slate-500 mb-0.5" />
                      <p className={`text-[10px] font-bold ${
                        cardTheme === 'dark' ? 'text-slate-300' : 'text-stone-800'
                      }`}>
                        尚未進入全校 TOP 3 榜單
                      </p>
                      <p className={`text-[8px] mt-0.5 ${
                        cardTheme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                      }`}>
                        挑戰單人極速或密室逃脫，為年級爭光即可入榜！
                      </p>
                    </div>
                  )}
                </div>

                <div className={`flex items-center justify-between pt-0.5 border-t border-black/10 dark:border-white/10 text-[8px] font-mono shrink-0 ${
                  cardTheme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                }`}>
                  <span>WUTAI TRIBAL ADVENTURER GUILD</span>
                  <span className="text-emerald-500 font-bold">● ONLINE ACTIVE</span>
                </div>
              </div>

              {/* ═══ 🪞 勇士神殿立繪鏡像 (Avatar & Frame Mirror Overlay) ═══ */}
              {isAvatarSelectorOpen && (
                <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md rounded-3xl p-3 sm:p-4 flex flex-col justify-between animate-fadeIn select-none border-2 border-emerald-400/40 shadow-2xl">
                  {/* 頂部 Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 shrink-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      <h3 className="text-sm sm:text-base font-heading font-black text-white">
                        勇士立繪與神槽更換
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAvatarSelectorOpen(false)}
                      className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 子分頁切換：👤 探險者頭像 (8款) vs 🛡️ 神槽雕紋外框 (4款) */}
                  <div className="flex items-center gap-1.5 p-1 bg-black/50 rounded-xl border border-white/10 my-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAvatarSubTab('avatars')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        avatarSubTab === 'avatars'
                          ? 'bg-emerald-500 text-stone-950 shadow-md font-extrabold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>👤 勇士立繪</span>
                      <span className="text-[10px] opacity-80">(8款)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAvatarSubTab('frames')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        avatarSubTab === 'frames'
                          ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🛡️ 神槽外框</span>
                      <span className="text-[10px] opacity-80">(4款)</span>
                    </button>
                  </div>

                  {/* 分頁內容 */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                    {avatarSubTab === 'avatars' ? (
                      <>
                        {/* 性別/類型微篩選 */}
                        <div className="flex items-center justify-between text-[11px] px-1 font-bold">
                          <span className="text-emerald-300/80">選擇專屬神山探險立繪：</span>
                          <div className="flex gap-1">
                            {['all', 'boy', 'girl'].map((filterKey) => (
                              <button
                                key={filterKey}
                                type="button"
                                onClick={() => setAvatarGenderFilter(filterKey)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono cursor-pointer transition-all ${
                                  avatarGenderFilter === filterKey
                                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                {filterKey === 'all' ? '全部' : filterKey === 'boy' ? '👦 男孩' : '👧 女孩'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 8 款頭像網格 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {AVATAR_LIST
                            .filter(a => avatarGenderFilter === 'all' || a.gender === avatarGenderFilter)
                            .map((item) => {
                              const isSelected = (currentStudent?.avatar_id || avatarId) === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    updateAvatar(item.id, null);
                                    try {
                                      confetti({ particleCount: 25, spread: 45, origin: { y: 0.5 } });
                                    } catch (e) {}
                                  }}
                                  className={`group relative p-1.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer border ${
                                    isSelected
                                      ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-300/60 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-[1.02]'
                                      : 'bg-slate-900/60 hover:bg-slate-900 border-white/10 hover:border-white/25'
                                  }`}
                                >
                                  {/* 頭像圓角 */}
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden relative bg-slate-950 shadow-inner">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                    {isSelected && (
                                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-400 text-stone-950 flex items-center justify-center shadow">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="w-full">
                                    <h4 className="text-[11px] font-black text-white truncate">
                                      {item.name}
                                    </h4>
                                    <p className="text-[9px] text-emerald-300/80 truncate">
                                      {item.title}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-[11px] text-amber-300/90 px-1 font-bold">
                          石板頭像槽外框（自然鑲嵌於神石、絕無浮動貼紙感）：
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {AVATAR_FRAMES.map((f) => {
                            const isSelected = (currentStudent?.avatar_frame || avatarFrame) === f.id;
                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => {
                                  updateAvatar(null, f.id);
                                  try {
                                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 } });
                                  } catch (e) {}
                                }}
                                className={`p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left cursor-pointer border ${
                                  isSelected
                                    ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-300/60 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                                    : 'bg-slate-900/60 hover:bg-slate-900 border-white/10 hover:border-white/25'
                                }`}
                              >
                                {/* 外框即時預覽小頭像 */}
                                <div className="relative shrink-0 flex items-center justify-center p-1">
                                  <div className={`w-12 h-12 rounded-xl overflow-hidden relative ${f.ringClass} bg-slate-950 shadow`}>
                                    <img
                                      src={currentAvatar.image}
                                      alt="Preview"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <h4 className="text-xs font-black text-white truncate">
                                      {f.name}
                                    </h4>
                                    {isSelected ? (
                                      <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black flex items-center gap-0.5">
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                        已鑲嵌
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-mono font-bold text-amber-400">
                                        {f.price === 0 ? '預設解鎖' : `🪙 ${f.price}`}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                    {f.desc}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* 底部確認按鈕 */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400">
                      已即時銘刻至您的神石通行證
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAvatarSelectorOpen(false)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 text-stone-950 text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      完成更換
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* 軌道二：正式學生 4 碼換機密碼與升年級／換座號自主繼承工具列 */}
            {currentStudent?.student_id && !isGuestStudent(currentStudent.student_id) && (
              <div className="w-full space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    data-student-pin-toggle="true"
                    onClick={() => {
                      soundEngine.click();
                      setTransferStatusMsg(null);
                      setPinInput(getTransferPinFromProfile(currentStudent) || '');
                      setTransferPanel(prev => prev === 'pin' ? null : 'pin');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-indigo-400/40 text-indigo-200 text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      4 碼換機密碼：{getTransferPinFromProfile(currentStudent) ? '已設定' : '未設定'}
                    </span>
                  </button>

                  <button
                    type="button"
                    data-student-import-toggle="true"
                    onClick={() => {
                      soundEngine.click();
                      setTransferStatusMsg(null);
                      const curG = parseInt(currentStudent.grade, 10) || 2;
                      setOldGrade(pad2(Math.max(1, curG - 1)));
                      setOldClass(pad2(currentStudent.class || '01'));
                      setOldSeat(pad2(currentStudent.seat || '01'));
                      setImportPinInput('');
                      setTransferPanel(prev => prev === 'import' ? null : 'import');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-400/40 text-amber-200 text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                    <span>換座號／升年級匯入舊資料</span>
                  </button>
                </div>

                {transferStatusMsg && (
                  <div className={`px-3 py-2 rounded-xl text-xs font-black text-center border ${
                    transferStatusMsg.type === 'success'
                      ? 'bg-emerald-950/90 border-emerald-400/60 text-emerald-200'
                      : 'bg-rose-950/90 border-rose-400/60 text-rose-200'
                  }`}>
                    {transferStatusMsg.text}
                  </div>
                )}

                {transferPanel === 'pin' && (
                  <div className="p-3 rounded-2xl bg-slate-950/95 border border-indigo-400/50 text-white space-y-2 shadow-xl">
                    <p className="text-[11px] font-bold text-indigo-200">
                      設定 4 位數字換機／換號密碼（未來升年級或換座號時可憑此密碼自行匯入舊資料，老師也可於後台協助重設）：
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="輸入 4 碼數字"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-sm font-mono font-black text-center tracking-widest text-white outline-none focus:border-indigo-400"
                      />
                      <button
                        type="button"
                        disabled={isTransferBusy || !isValidTransferPin(pinInput)}
                        onClick={async () => {
                          setIsTransferBusy(true);
                          setTransferStatusMsg(null);
                          try {
                            const res = await setTransferPin(pinInput);
                            if (res.success) {
                              setTransferStatusMsg({ type: 'success', text: `✅ 已儲存 4 碼換機密碼：${res.pin}（請記住此密碼）` });
                              setTransferPanel(null);
                            } else {
                              setTransferStatusMsg({ type: 'error', text: res.error || '設定失敗' });
                            }
                          } finally {
                            setIsTransferBusy(false);
                          }
                        }}
                        className="px-4 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white text-xs font-black cursor-pointer"
                      >
                        {isTransferBusy ? '儲存中...' : '儲存密碼'}
                      </button>
                    </div>
                  </div>
                )}

                {transferPanel === 'import' && (
                  <div className="p-3 rounded-2xl bg-slate-950/95 border border-amber-400/50 text-white space-y-2 shadow-xl">
                    <p className="text-[11px] font-bold text-amber-200">
                      請選擇原本的舊座號並輸入 4 碼換機密碼，將金幣、探索積分、背包與歷屆八星匯入目前座號 ({currentStudent.student_id})：
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <select
                        value={oldGrade}
                        onChange={(e) => setOldGrade(e.target.value)}
                        className="px-2 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-xs font-black text-white"
                      >
                        {GRADE_OPTIONS.filter(g => !g.isGuest).map(g => (
                          <option key={g.id} value={g.id}>原 {g.zh}</option>
                        ))}
                      </select>
                      <select
                        value={oldClass}
                        onChange={(e) => setOldClass(e.target.value)}
                        className="px-2 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-xs font-black text-white"
                      >
                        {CLASS_OPTIONS.map(c => (
                          <option key={c.id} value={c.id}>{c.zh}</option>
                        ))}
                      </select>
                      <select
                        value={oldSeat}
                        onChange={(e) => setOldSeat(e.target.value)}
                        className="px-2 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-xs font-black text-white"
                      >
                        {Array.from({ length: 35 }, (_, i) => pad2(i + 1)).map(s => (
                          <option key={s} value={s}>{s} 號</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={importPinInput}
                        onChange={(e) => setImportPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="舊帳號 4 碼密碼"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-sm font-mono font-black text-center tracking-widest text-white outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        disabled={isTransferBusy || !isValidTransferPin(importPinInput)}
                        onClick={async () => {
                          const srcId = formatStudentId(oldGrade, oldClass, oldSeat);
                          setIsTransferBusy(true);
                          setTransferStatusMsg(null);
                          try {
                            const res = await importOldSeatData(srcId, importPinInput);
                            if (res.success) {
                              const s = res.summary;
                              setTransferStatusMsg({
                                type: 'success',
                                text: `🎉 匯入成功！已從 ${s.sourceId} 繼承 🪙${s.inheritedCoins} 金幣、🧭${s.inheritedQuestPoints} 積分與 ${s.inheritedInventoryCount} 件背包收藏${s.isCrossGrade ? '（舊年度八星已封存至歷屆榮譽牆）' : ''}！`
                              });
                              setTransferPanel(null);
                              try { confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
                            } else {
                              setTransferStatusMsg({ type: 'error', text: res.error || '匯入失敗' });
                            }
                          } finally {
                            setIsTransferBusy(false);
                          }
                        }}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 text-xs font-black cursor-pointer"
                      >
                        {isTransferBusy ? '匯入中...' : '確認匯入'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 卡片下方操作按鈕群 (切換身分、進入宇宙、登出) */}
            <div className="w-full flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsSwitching(true)}
                className="px-4 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/20 text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.switchSeatBtn}</span>
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 hover:from-emerald-300 hover:to-teal-200 text-stone-950 text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 cursor-pointer border-2 border-emerald-200"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t.enterUniverseBtn}</span>
              </button>

              <button
                type="button"
                onClick={logoutStudent}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 py-1 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.signOutBtn}</span>
              </button>
            </div>

          </div>
        ) : (
          /* 模式 B：選擇身分與 6 碼漫遊綁定表單 (無框線高透水晶原畫風格) */
          <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-400/80 shadow-[0_0_50px_rgba(16,185,129,0.35)] text-white p-5 sm:p-7 space-y-4">
            <img
              src="/assets/pass/warrior_pass_bg.webp"
              alt="Warrior Adventure Pass"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.55] contrast-[1.2] pointer-events-none select-none"
            />
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm pointer-events-none" />

            {/* 頂部標題與關閉按鈕 */}
            <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-heading font-black text-white">
                    {t.studentPassportTitle}
                  </h3>
                  <p className="text-[11px] text-emerald-300 font-bold">
                    {t.studentPassportSubtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-95"
                title="關閉"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 模式 B 選擇身分與 6 碼漫遊綁定表單 */}
            <form onSubmit={handleConfirmLogin} className="relative z-10 space-y-4 animate-fadeIn">
              {/* 步驟 1: 選擇年級 */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{t.selectGradeLabel}</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    2 碼：{selectedGrade}
                  </span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {GRADE_OPTIONS.map((g) => {
                    const isSelected = selectedGrade === g.id;
                    return (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => {
                          setSelectedGrade(g.id);
                          if (g.id === '99') {
                            setSelectedClass('99');
                            setSelectedSeat('99');
                          } else if (selectedGrade === '99') {
                            setSelectedClass('01');
                            setSelectedSeat('01');
                          }
                        }}
                        className={`py-2 px-1 rounded-xl text-xs font-black transition-all border ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-102'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {g.shortZh}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 步驟 2: 選擇班級 */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{t.selectClassLabel}</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    2 碼：{selectedClass}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CLASS_OPTIONS.map((c) => {
                    const isSelected = selectedClass === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setSelectedClass(c.id)}
                        className={`py-2 px-2 rounded-xl text-xs font-black transition-all border ${
                          isSelected
                            ? 'bg-teal-500 text-white border-teal-600 shadow-md scale-102'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {c.zh}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 步驟 3: 選擇座號 (1 ~ 35 號快捷宮格) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {t.selectSeatLabel}
                  </label>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    座號：{parseInt(selectedSeat, 10)} 號 ({selectedSeat})
                  </span>
                </div>
                <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-h-36 overflow-y-auto">
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {Array.from({ length: 35 }, (_, i) => {
                      const seatStr = pad2(i + 1);
                      const isSelected = selectedSeat === seatStr;
                      return (
                        <button
                          type="button"
                          key={seatStr}
                          onClick={() => setSelectedSeat(seatStr)}
                          className={`py-1.5 rounded-lg text-xs font-mono font-black transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm scale-105'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 6 碼動態身分識別預覽 */}
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border-2 border-dashed border-emerald-400 dark:border-emerald-600 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    {t.studentIdCodeLabel}
                  </span>
                  <div className="flex items-center gap-1 font-mono font-black text-lg sm:text-xl text-emerald-600 dark:text-emerald-400 tracking-widest mt-0.5">
                    <span className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">{selectedGrade}</span>
                    <span className="text-slate-400">-</span>
                    <span className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">{selectedClass}</span>
                    <span className="text-slate-400">-</span>
                    <span className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">{selectedSeat}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {formatStudentBadge({ grade: selectedGrade, class: selectedClass, seat: selectedSeat }, lang)}
                  </span>
                </div>
              </div>

              {/* 步驟 4: 學生暱稱與趣味抽取 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {t.nicknameLabel}
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomNickname}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    {t.randomNicknameBtn}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={nickname}
                    onChange={handleNicknameChange}
                    placeholder={t.nicknamePlaceholder}
                    maxLength={12}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100 font-black text-sm"
                  />
                  {nickname && (
                    <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-bold">
                      {nickname.length}/12
                    </span>
                  )}
                </div>
                {nicknameError && (
                  <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {nicknameError}
                  </p>
                )}
              </div>

              {/* 送出登入 3D 按鈕 */}
              <div className="pt-2">
                <Button3D
                  type="submit"
                  variant="emerald"
                  size="lg"
                  disabled={isLoading || Boolean(nicknameError)}
                  icon={Sparkles}
                  className="w-full shadow-lg"
                >
                  {isLoading ? '正在連結雲端漫遊檔案...' : (selectedGrade === '99' ? '開始訪客體驗 🚀 (免選班級座號)' : t.roamingLaunchBtn)}
                </Button3D>
              </div>

              {/* 學校共用平板貼心說明 */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-300/60 dark:border-amber-700/60 text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {t.sharedIpadTip}
                </p>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 八冊秘典典藏館彈窗 */}
      {isGrimoireOpen && (
        <GrimoireSanctuaryModal
          studentId={currentStudent?.student_id || 'guest'}
          studentName={currentStudent?.nickname || '好學生'}
          cardTheme={cardTheme}
          onClose={() => setIsGrimoireOpen(false)}
        />
      )}

      {/* 神山多寶格虛擬背包彈窗 */}
      {isCurioBackpackOpen && (
        <CurioBackpackModal
          cardTheme={cardTheme}
          onClose={() => setIsCurioBackpackOpen(false)}
        />
      )}
    </div>
  );
};
