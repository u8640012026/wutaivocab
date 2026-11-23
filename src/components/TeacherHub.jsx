import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Button3D } from './ui/Button3D';
import {
  insertWordsBatch,
  deleteWordById,
  adminFetchLeaderboard,
  adminDeleteLeaderboardEntry,
  adminClearAbnormalScores,
  adminResetWeekScores,
  adminGetSystemStats,
  getWeekNumber,
  supabase,
  STUDENT_PROFILES_TABLE_SQL
} from '../services/supabase';
import {
  Lock, ArrowLeft, PlusCircle, Trash2, CheckCircle2, AlertCircle,
  FileSpreadsheet, Sparkles, Trophy, Swords, Shield, Activity,
  Megaphone, Download, RotateCw, Search, Calendar, Filter, Users,
  Database, Clock, AlertTriangle, FileCheck2, ZoomIn, Award, BarChart3
} from 'lucide-react';
import { ExamAuditZone } from './exam/ExamAuditZone';
import { TeacherMasteryAnalytics } from './exam/TeacherMasteryAnalytics';

class ExamAuditErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('ExamAuditZone error trapped:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 shadow-xl m-4">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 text-2xl">
            ⚠️
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">
            試題檢核區遇到載入小插曲
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            系統已阻斷全域崩潰，未影響其他功能。請點擊下方按鈕重整檢核區。
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition cursor-pointer"
          >
            🔄 重新載入試題檢核區
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const TEACHERS = ['Mario', 'Ibu', 'Vanessa', 'Mark', 'Official'];

const GAME_MODES = [
  { id: 'all', name: '全部模式' },
  { id: 'listening_lab', name: '🎧 雙語聽力特訓' },
  { id: 'speaking_lab', name: '🎙️ 雙語口說跟讀' },
  { id: 'quiz-choice', name: '中英字義速辨 (歷史 quiz-choice)' },
  { id: 'quiz-hard', name: '標準測驗進階 (歷史 quiz-hard)' },
  { id: 'zh-en', name: '標準測驗 (中選英 - 歷史)' },
  { id: 'en-zh', name: '標準測驗 (英選中 - 歷史)' },
  { id: 'quiz-listening', name: '🎧 英語聽力試煉 (quiz-listening)' },
  { id: 'handwriting', name: '✍️ 神筆筆順書寫 (handwriting)' },
  { id: 'sentence', name: '🧩 句型積木工坊 (sentence)' },
  { id: 'sentence-abc', name: '🐣 低年級字母序列 (sentence-abc)' },
  { id: 'spelling', name: '單字積木拼裝' },
  { id: 'meteor-zh-en', name: '隕石防衛戰 (中選英)' },
  { id: 'meteor-en-zh', name: '隕石防衛戰 (英選中)' },
  { id: 'meteor-abc', name: '大小寫字母防衛戰' },
  { id: 'snake-normal', name: '貪食蛇 (一般模式)' },
  { id: 'snake-survival', name: '貪食蛇 (生存模式)' },
  { id: 'memory-single', name: '記憶翻牌對決' },
  { id: 'battle-wins', name: '連線對戰總勝場' }
];

export const TeacherHub = ({ onBack, words = [], onRefreshWords, onOpenShowcase, onOpenZoomShowcase }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('wutai_teacher_authed') === 'true';
  });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('words'); // words | scores | mastery | exam-audit | arenas | system | announcement
  const [toast, setToast] = useState(null);

  // ── Tab 1: 題庫管理狀態 ──
  const [selectedTeacher, setSelectedTeacher] = useState('Mario');
  const [lessonName, setLessonName] = useState('Unit 1 自訂生字');
  const [pasteContent, setPasteContent] = useState('');
  const [isSubmittingWords, setIsSubmittingWords] = useState(false);
  const [wordSearchQuery, setWordSearchQuery] = useState('');

  // ── Tab 2: 成績與異常管理狀態 ──
  const currentWeek = getWeekNumber();
  const [scoreWeek, setScoreWeek] = useState(currentWeek);
  const [scoreMode, setScoreMode] = useState('all');
  const [scoreSearch, setScoreSearch] = useState('');
  const [leaderboardList, setLeaderboardList] = useState([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);

  // ── Tab 3: 對戰擂台監控狀態 ──
  const [arenaStatusList, setArenaStatusList] = useState([
    { id: 'arena-1', name: '🔴 烈焰擂台 (PIN 1001)', status: 'idle', statusText: '空房就緒', count: 0, players: [] },
    { id: 'arena-2', name: '🟢 翡翠擂台 (PIN 1002)', status: 'idle', statusText: '空房就緒', count: 0, players: [] },
    { id: 'arena-3', name: '🔵 星空擂台 (PIN 1003)', status: 'idle', statusText: '空房就緒', count: 0, players: [] }
  ]);

  // ── Tab 4: 系統狀態與雲端體檢 ──
  const [systemStats, setSystemStats] = useState(null);
  const [isTestingSystem, setIsTestingSystem] = useState(false);

  // ── Tab 5: 全校公告廣播 ──
  const [announcementActive, setAnnouncementActive] = useState(() => {
    try {
      const saved = localStorage.getItem('wutai_announcement');
      return saved ? JSON.parse(saved).active : false;
    } catch (e) {
      return false;
    }
  });
  const [announcementText, setAnnouncementText] = useState(() => {
    try {
      const saved = localStorage.getItem('wutai_announcement');
      return saved ? JSON.parse(saved).text : '🔔 歡迎參加本週英語單字冒險競賽！請各班同學踴躍挑戰！';
    } catch (e) {
      return '🔔 歡迎參加本週英語單字冒險競賽！請各班同學踴躍挑戰！';
    }
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'wt7902230') {
      setIsAuthenticated(true);
      sessionStorage.setItem('wutai_teacher_authed', 'true');
      setAuthError('');
      showToast('最高系統管理者身分驗證成功！');
    } else {
      setAuthError('密碼錯誤，請重新輸入');
    }
  };

  // ── 題庫批次匯入 ──
  const handleBulkImport = async () => {
    if (!pasteContent.trim()) {
      showToast('請先貼上單字內容！', 'error');
      return;
    }
    if (!lessonName.trim()) {
      showToast('請填寫單元名稱！', 'error');
      return;
    }

    const lines = pasteContent.split(/\r?\n/).filter(line => line.trim() !== '');
    const parsedWords = [];

    lines.forEach(line => {
      const parts = line.split(/[,\t]+/).map(s => s.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        parsedWords.push({
          author: selectedTeacher,
          book: selectedTeacher === 'Official' ? '1' : `${selectedTeacher}專區`,
          lesson: lessonName.trim(),
          en: parts[0].toLowerCase(),
          zh: parts[1],
          cloze: parts[2] || ''
        });
      }
    });

    if (parsedWords.length === 0) {
      showToast('解析失敗：每行請至少包含「英文, 中文」', 'error');
      return;
    }

    setIsSubmittingWords(true);
    try {
      await insertWordsBatch(parsedWords);
      showToast(`成功匯入 ${parsedWords.length} 個單字至 ${selectedTeacher} 老師字庫！`, 'success');
      setPasteContent('');
      if (onRefreshWords) await onRefreshWords();
    } catch (err) {
      console.error(err);
      showToast('匯入失敗，請檢查資料庫連線', 'error');
    } finally {
      setIsSubmittingWords(false);
    }
  };

  // ── 題庫單一刪除 ──
  const handleDeleteWord = async (id, en) => {
    if (!window.confirm(`確定要刪除單字「${en}」嗎？`)) return;
    try {
      await deleteWordById(id);
      showToast(`已刪除「${en}」`, 'success');
      if (onRefreshWords) await onRefreshWords();
    } catch (err) {
      showToast('刪除失敗', 'error');
    }
  };

  // ── 一鍵匯出題庫備份 (JSON) ──
  const handleExportWordsBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(words, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `wutai_words_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('題庫備份 JSON 已成功下載！');
    } catch (err) {
      showToast('匯出失敗', 'error');
    }
  };

  // ── 成績管理：載入成績 ──
  const loadLeaderboardData = async () => {
    setIsLoadingScores(true);
    try {
      const data = await adminFetchLeaderboard({
        week: scoreWeek,
        mode: scoreMode,
        limit: 100
      });
      setLeaderboardList(data);
    } catch (err) {
      showToast('讀取排行榜失敗', 'error');
    } finally {
      setIsLoadingScores(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'scores') {
      loadLeaderboardData();
    }
  }, [isAuthenticated, activeTab, scoreWeek, scoreMode]);

  // ── 成績管理：刪除單筆紀錄 ──
  const handleDeleteScoreEntry = async (id, name, score) => {
    if (!window.confirm(`確定要刪除學生「${name}」的紀錄 (${score}分) 嗎？`)) return;
    try {
      await adminDeleteLeaderboardEntry(id);
      showToast(`已刪除「${name}」的紀錄`, 'success');
      setLeaderboardList(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      showToast('刪除失敗，請檢查資料庫 RLS DELETE 權限', 'error');
    }
  };

  // ── 成績管理：一鍵清理異常紀錄 ──
  const handleClearAbnormal = async () => {
    if (!window.confirm('確定要一鍵清理極端異常數據 (例如分數破表大於 100,000 者) 嗎？')) return;
    try {
      await adminClearAbnormalScores();
      showToast('已清理異常分數！', 'success');
      loadLeaderboardData();
    } catch (err) {
      showToast('清理失敗', 'error');
    }
  };

  // ── 成績管理：清空當週成績 ──
  const handleResetCurrentWeek = async () => {
    const inputWeek = prompt(`⚠️ 危險操作：這將完全清空「第 ${scoreWeek} 週」所有學生成績！\n若確認執行，請在下方輸入週次數字「${scoreWeek}」：`);
    if (inputWeek !== String(scoreWeek)) {
      showToast('週次輸入不吻合，已取消清空操作', 'error');
      return;
    }
    try {
      await adminResetWeekScores(scoreWeek);
      showToast(`已成功清空第 ${scoreWeek} 週排行榜！`, 'success');
      loadLeaderboardData();
    } catch (err) {
      showToast('清空失敗，請確認資料庫權限', 'error');
    }
  };

  // ── 成績管理：匯出為 CSV 試算表 ──
  const handleExportScoresCSV = () => {
    if (leaderboardList.length === 0) {
      showToast('目前清單尚無資料可匯出', 'error');
      return;
    }
    try {
      const headers = ['週次', '遊戲模式', '冊別', '學生暱稱', '得分', '秒數', '裝置識別碼', '登錄時間'];
      const rows = leaderboardList.map(row => [
        row.week,
        row.mode,
        row.book,
        `"${(row.name || '').replace(/"/g, '""')}"`,
        row.score,
        row.time,
        `"${row.device_id}"`,
        `"${new Date(row.created_at).toLocaleString()}"`
      ]);

      const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `wutai_scores_week_${scoreWeek}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast(`已成功匯出 ${leaderboardList.length} 筆成績至 CSV！`);
    } catch (err) {
      showToast('匯出失敗', 'error');
    }
  };

  // ── Tab 3: 即時探測與重置三大固定擂台 ──
  const probeArenasInHub = useCallback(() => {
    const arenaDefs = [
      { id: 'arena-1', name: '🔴 烈焰擂台 (PIN 1001)' },
      { id: 'arena-2', name: '🟢 翡翠擂台 (PIN 1002)' },
      { id: 'arena-3', name: '🔵 星空擂台 (PIN 1003)' }
    ];

    arenaDefs.forEach(def => {
      const ch = supabase.channel(`battle-${def.id}`);
      ch.on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState();
        const list = Object.values(state).flat();
        const isBattling = list.some(p => p.status === 'battling');
        const allResult = list.length > 0 && list.every(p => p.status === 'result');
        const now = Date.now();
        const isStale = list.length > 0 && list.every(p => p.status === 'waiting' && (now - (p.joinedAt || now) > 5 * 60 * 1000));

        let statusText = '空房就緒 (可開立)';
        let statusBadge = 'idle';
        if (isBattling) {
          statusText = '激戰進行中 (已鎖定)';
          statusBadge = 'battling';
        } else if (allResult) {
          statusText = '結算完成 (即將自動釋出)';
          statusBadge = 'result';
        } else if (isStale) {
          statusText = '逾時無活動幽靈房 (可一鍵重置)';
          statusBadge = 'stale';
        } else if (list.length > 0) {
          statusText = `等待開戰 (${list.length}/4 人)`;
          statusBadge = 'waiting';
        }

        setArenaStatusList(prev => prev.map(a => a.id === def.id ? {
          ...a,
          name: def.name,
          count: list.length,
          status: statusBadge,
          statusText,
          players: list.map(p => p.name || '小勇士')
        } : a));
      });
      ch.subscribe();
      setTimeout(() => {
        try { supabase.removeChannel(ch); } catch(e) {}
      }, 1800);
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'arenas') {
      probeArenasInHub();
      const interval = setInterval(probeArenasInHub, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, probeArenasInHub]);

  const handleResetArena = async (arenaId, arenaName) => {
    if (!window.confirm(`確定要強制重置「${arenaName}」嗎？這將廣播重置訊號給該擂台玩家並清空幽靈連線。`)) return;
    try {
      // 1. 發送至現代標準頻道 battle-${arenaId}
      const chBattle = supabase.channel(`battle-${arenaId}`);
      await chBattle.subscribe(async (s) => {
        if (s === 'SUBSCRIBED') {
          await chBattle.send({
            type: 'broadcast',
            event: 'admin_force_reset',
            payload: { resetBy: 'admin', timestamp: Date.now() }
          });
          supabase.removeChannel(chBattle);
        }
      });

      // 2. 同時發送至舊版相容頻道 arena_presence_${arenaId}
      const chLegacy = supabase.channel(`arena_presence_${arenaId}`);
      await chLegacy.subscribe(async (s) => {
        if (s === 'SUBSCRIBED') {
          await chLegacy.send({
            type: 'broadcast',
            event: 'admin_force_reset',
            payload: { resetBy: 'admin', timestamp: Date.now() }
          });
          supabase.removeChannel(chLegacy);
        }
      });

      showToast(`已成功發送強制重置訊號給 ${arenaName}！幽靈房間已解散釋出。`);
      setTimeout(probeArenasInHub, 600);
    } catch (err) {
      showToast('重置擂台失敗', 'error');
    }
  };

  // ── Tab 4: 系統健康體檢 ──
  const runSystemDiagnostics = async () => {
    setIsTestingSystem(true);
    try {
      const stats = await adminGetSystemStats();
      setSystemStats(stats);
      showToast('系統即時體檢完成！');
    } catch (err) {
      showToast('體檢失敗，請檢查網路連線', 'error');
    } finally {
      setIsTestingSystem(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'system' && !systemStats) {
      runSystemDiagnostics();
    }
  }, [isAuthenticated, activeTab]);

  // ── Tab 5: 儲存全校公告 ──
  const handleSaveAnnouncement = () => {
    try {
      const payload = { active: announcementActive, text: announcementText.trim() };
      localStorage.setItem('wutai_announcement', JSON.stringify(payload));
      showToast('全校跑馬燈廣播公告已更新！首頁大廳已同步顯現。');
    } catch (err) {
      showToast('儲存失敗', 'error');
    }
  };

  // 題庫目前選取分區
  const currentTeacherWords = useMemo(() => {
    return words.filter(w => {
      const matchAuthor = w.author === selectedTeacher;
      if (!matchAuthor) return false;
      if (!wordSearchQuery.trim()) return true;
      const q = wordSearchQuery.toLowerCase();
      return (w.en && w.en.toLowerCase().includes(q)) || (w.zh && w.zh.includes(q)) || (w.lesson && w.lesson.includes(q));
    });
  }, [words, selectedTeacher, wordSearchQuery]);

  // 成績關鍵字篩選
  const filteredScores = useMemo(() => {
    if (!scoreSearch.trim()) return leaderboardList;
    const q = scoreSearch.toLowerCase();
    return leaderboardList.filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.device_id && s.device_id.toLowerCase().includes(q)) ||
      (s.mode && s.mode.toLowerCase().includes(q))
    );
  }, [leaderboardList, scoreSearch]);

  // 尚未登入時顯示密碼鎖定畫面
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-1 font-heading">
            最高系統管理者控制台
          </h2>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6">
            霧臺國小 英文單字大冒險 • 教師與管理者後台
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入系統授權密碼"
              className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-center font-bold text-lg text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 shadow-inner"
              autoFocus
            />
            {authError && <p className="text-rose-500 text-xs font-black">{authError}</p>}
            
            <div className="flex gap-3">
              <Button3D variant="slate" onClick={onBack} className="flex-1">
                回遊戲大廳
              </Button3D>
              <Button3D type="submit" variant="emerald" className="flex-1">
                解鎖進入
              </Button3D>
            </div>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 animate-fadeIn pb-20">
      {/* ── 頂部導覽列 ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <Button3D variant="slate" size="sm" onClick={onBack} icon={ArrowLeft}>
          回遊戲大廳
        </Button3D>
        
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 font-heading">
              最高系統管理控制台
            </h2>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              ● 已授權系統管理員模式
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenShowcase && (
            <button
              onClick={onOpenShowcase}
              className="px-3 py-2 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 hover:scale-105 active:scale-95 text-stone-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="查看 16 隻神獸進度條奔馳與 30 則英語格言"
            >
              <span>🐆</span>
              <span>神獸進度條展示台</span>
            </button>
          )}

          <button
            onClick={() => onOpenZoomShowcase ? onOpenZoomShowcase() : window.location.assign('?view=zoom-showcase')}
            className="px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="體驗試題附圖四大放大方案（方案 1、方案 2、方案 3A、方案 3B）"
          >
            <ZoomIn className="w-4 h-4 text-indigo-500" />
            <span>🔍 附圖 4 方案體驗台</span>
          </button>

          <button
            onClick={handleExportWordsBackup}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
            title="下載全校單字庫 JSON 備份檔"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">備份題庫</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-2 font-black text-sm shadow-md animate-fadeIn ${
          toast.type === 'success' 
            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200' 
            : 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── 主功能分頁切換卡 ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
        <button
          onClick={() => setActiveTab('words')}
          className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'words'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-[1.02]'
              : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>題庫極速管理</span>
        </button>

        <button
          onClick={() => setActiveTab('scores')}
          className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'scores'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-[1.02]'
              : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>全校成績管理</span>
        </button>

        <button
          onClick={() => setActiveTab('mastery')}
          className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'mastery'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-[1.02]'
              : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>精熟評量分析</span>
        </button>

        <button
          onClick={() => setActiveTab('exam-audit')}
          className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'exam-audit'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 scale-[1.02]'
              : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>檢定試題檢核</span>
        </button>

        <button
          onClick={() => setActiveTab('arenas')}
          className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'arenas'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
              : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>對戰擂台監控</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'system'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
              : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>雲端系統體檢</span>
        </button>

        <button
          onClick={() => setActiveTab('announcement')}
          className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'announcement'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-[1.02]'
              : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>全校公告廣播</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* ── TAB 1: 題庫管理 ── */}
      {/* ============================================================ */}
      {activeTab === 'words' && (
        <div className="space-y-6">
          {/* 教師標籤選擇列 */}
          <div className="flex flex-wrap gap-2">
            {TEACHERS.map(teacher => (
              <button
                key={teacher}
                onClick={() => setSelectedTeacher(teacher)}
                className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-sm ${
                  selectedTeacher === teacher
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30 scale-105'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {teacher === 'Official' ? '📚 官方教材' : `👨‍🏫 ${teacher} 老師字庫`}
                <span className="ml-1.5 text-xs opacity-75">
                  ({words.filter(w => w.author === teacher).length})
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左側：批次貼上匯入器 */}
            <div className="lg:col-span-5">
              <GlassCard>
                <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-black">
                  <FileSpreadsheet className="w-5 h-5" />
                  <h3 className="text-base font-heading">1 秒批次貼上匯入</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-bold">
                  可直接自 Excel / Google 試算表複製整欄（英文、中文）貼在此處！
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 mb-1 block">
                      單元或課別名稱：
                    </label>
                    <input
                      type="text"
                      value={lessonName}
                      onChange={(e) => setLessonName(e.target.value)}
                      placeholder="例如：Unit 3 食物篇、期中必背"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 mb-1 block">
                      貼上單字內容（每行一個，以逗號或 Tab 分隔）：
                    </label>
                    <textarea
                      rows={8}
                      value={pasteContent}
                      onChange={(e) => setPasteContent(e.target.value)}
                      placeholder="apple, 蘋果&#10;banana, 香蕉&#10;orange, 柳橙"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <Button3D
                    variant="emerald"
                    size="md"
                    onClick={handleBulkImport}
                    disabled={isSubmittingWords}
                    className="w-full"
                    icon={PlusCircle}
                  >
                    {isSubmittingWords ? '匯入中...' : `一鍵匯入至 ${selectedTeacher} 專區`}
                  </Button3D>
                </div>
              </GlassCard>
            </div>

            {/* 右側：目前單字清單與搜尋 */}
            <div className="lg:col-span-7">
              <GlassCard className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-800 dark:text-slate-100 font-heading">
                      {selectedTeacher === 'Official' ? '官方單字列表' : `${selectedTeacher} 老師自建列表`}
                    </h3>
                    <p className="text-xs font-bold text-slate-500">
                      共 {currentTeacherWords.length} 個單字
                    </p>
                  </div>

                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={wordSearchQuery}
                      onChange={(e) => setWordSearchQuery(e.target.value)}
                      placeholder="搜尋單字或課名..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-xs font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[480px] space-y-2 pr-1">
                  {currentTeacherWords.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                      <p className="text-sm font-bold">目前此分區尚無單字，請使用左側批次匯入。</p>
                    </div>
                  ) : (
                    currentTeacherWords.map((word) => (
                      <div
                        key={word.id}
                        className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between hover:bg-white dark:hover:bg-slate-700/80 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            {word.lesson}
                          </span>
                          <span className="font-black text-slate-800 dark:text-slate-100 text-sm">
                            {word.en}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                            {word.zh}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteWord(word.id, word.en)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ── TAB 2: 全校成績與異常作弊管理 ── */}
      {/* ============================================================ */}
      {activeTab === 'scores' && (
        <div className="space-y-6">
          <GlassCard className="p-4 sm:p-6">
            {/* 篩選控制器 */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                {/* 週次切換 */}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200">週次：</span>
                  <select
                    value={scoreWeek}
                    onChange={(e) => setScoreWeek(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-black text-xs border border-slate-200 dark:border-slate-600 outline-none"
                  >
                    <option value="all">全部歷史週次</option>
                    {[...Array(12)].map((_, i) => {
                      const w = currentWeek - i;
                      if (w < 1) return null;
                      return <option key={w} value={w}>第 {w} 週 {w === currentWeek ? '(當週)' : ''}</option>;
                    })}
                  </select>
                </div>

                {/* 模式切換 */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200">模式：</span>
                  <select
                    value={scoreMode}
                    onChange={(e) => setScoreMode(e.target.value)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-black text-xs border border-slate-200 dark:border-slate-600 outline-none max-w-[160px] truncate"
                  >
                    {GAME_MODES.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* 學生搜尋 */}
                <div className="relative w-44">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={scoreSearch}
                    onChange={(e) => setScoreSearch(e.target.value)}
                    placeholder="搜尋學生暱稱..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              {/* 操作按鈕群 */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={loadLeaderboardData}
                  disabled={isLoadingScores}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center gap-1 shadow-sm hover:bg-slate-50 transition-all"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoadingScores ? 'animate-spin' : ''}`} />
                  重新整理
                </button>

                <button
                  onClick={handleClearAbnormal}
                  className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 text-xs font-black flex items-center gap-1 shadow-sm hover:bg-rose-100 transition-all"
                  title="自動掃描並刪除破表分數"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  清理異常破表
                </button>

                {scoreWeek !== 'all' && (
                  <button
                    onClick={handleResetCurrentWeek}
                    className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-1 shadow-sm transition-all"
                    title={`清空第 ${scoreWeek} 週所有成績`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    清空第 {scoreWeek} 週
                  </button>
                )}

                <button
                  onClick={handleExportScoresCSV}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  匯出 CSV
                </button>
              </div>
            </div>

            {/* 成績數據表 */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">週次</th>
                    <th className="p-3">遊戲模式</th>
                    <th className="p-3">冊別</th>
                    <th className="p-3">學生暱稱</th>
                    <th className="p-3 text-center">得分</th>
                    <th className="p-3 text-center">耗時</th>
                    <th className="p-3">登錄時間</th>
                    <th className="p-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-bold">
                  {isLoadingScores ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                        正在載入雲端成績...
                      </td>
                    </tr>
                  ) : filteredScores.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        目前選取的條件下尚無成績紀錄。
                      </td>
                    </tr>
                  ) : (
                    filteredScores.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-black">
                            W{row.week}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {row.mode}
                        </td>
                        <td className="p-3">第 {row.book} 冊</td>
                        <td className="p-3 font-black text-slate-800 dark:text-slate-100">
                          {row.name}
                        </td>
                        <td className="p-3 text-center font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          {row.score} 分
                        </td>
                        <td className="p-3 text-center font-mono text-slate-500">
                          {row.time ? `${row.time} 秒` : '-'}
                        </td>
                        <td className="p-3 text-[10px] font-mono text-slate-400">
                          {new Date(row.created_at).toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteScoreEntry(row.id, row.name, row.score)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="刪除此紀錄"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ============================================================ */}
      {/* ── TAB 3: 線上對戰擂台監控 ── */}
      {/* ============================================================ */}
      {activeTab === 'arenas' && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400 font-black">
              <Swords className="w-5 h-5" />
              <h3 className="text-lg font-heading">三大固定擂台即時狀態</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-bold">
              本系統採用固定三擂台機制，若學生端因網路斷線導致房間卡在戰鬥中，老師可隨時點擊「強制重置」釋放房間。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {arenaStatusList.map((arena) => (
                <div
                  key={arena.id}
                  className="p-5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {arena.id}
                      </span>
                      <span className={`flex items-center gap-1.5 text-xs font-black ${
                        arena.status === 'battling'
                          ? 'text-rose-500'
                          : arena.status === 'waiting'
                          ? 'text-amber-500'
                          : arena.status === 'stale'
                          ? 'text-purple-500'
                          : 'text-emerald-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${
                          arena.status === 'battling'
                            ? 'bg-rose-500'
                            : arena.status === 'waiting'
                            ? 'bg-amber-500'
                            : arena.status === 'stale'
                            ? 'bg-purple-500'
                            : 'bg-emerald-500'
                        }`} />
                        {arena.statusText || '監控就緒'}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-800 dark:text-slate-100 font-heading">
                      {arena.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      線上人數：<strong className="text-slate-700 dark:text-slate-200 font-mono">{arena.count}</strong> / 4 人
                      {arena.players && arena.players.length > 0 && (
                        <span className="block text-[11px] text-slate-400 mt-0.5 truncate">
                          成員：{arena.players.join('、')}
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() => handleResetArena(arena.id, arena.name)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-black transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    一鍵強制重置擂台
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ============================================================ */}
      {/* ── TAB 4: 系統狀態與雲端體檢 ── */}
      {/* ============================================================ */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black">
                <Activity className="w-5 h-5" />
                <h3 className="text-lg font-heading">Supabase 雲端資料庫體檢儀表板</h3>
              </div>
              <button
                onClick={runSystemDiagnostics}
                disabled={isTestingSystem}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md hover:bg-blue-700 transition-all"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isTestingSystem ? 'animate-spin' : ''}`} />
                即時重新體檢
              </button>
            </div>

            {systemStats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-400 block mb-1">雲端連線延遲</span>
                    <span className="text-2xl font-black text-emerald-600 font-mono">
                      {systemStats.latencyMs} ms
                    </span>
                    <span className="text-[10px] text-emerald-500 font-bold block mt-1">● 連線極速順暢</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-400 block mb-1">題庫總收錄數</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono">
                      {systemStats.wordsCount} 字
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">官方 + 各教師專區</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-400 block mb-1">歷史排行榜紀錄</span>
                    <span className="text-2xl font-black text-amber-600 font-mono">
                      {systemStats.leaderboardCount} 筆
                    </span>
                    <span className="text-[10px] text-amber-500 font-bold block mt-1">全校累計成果</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-400 block mb-1">預估資料庫容量</span>
                    <span className="text-2xl font-black text-indigo-600 font-mono">
                      {systemStats.estimatedMB} MB
                    </span>
                    <span className="text-[10px] text-indigo-500 font-bold block mt-1">
                      上限 500 MB (免費配額)
                    </span>
                  </div>
                </div>

                {/* 容量進度條 */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center text-xs font-black mb-2">
                    <span className="text-slate-700 dark:text-slate-200">免費資料庫配額消耗率：</span>
                    <span className="text-emerald-600 font-mono">{systemStats.quotaPercent}% (極度安全)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(parseFloat(systemStats.quotaPercent), 1)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-bold leading-relaxed">
                    💡 依目前增長速度，霧臺國小全校成績資料可持續安心保存 1～2 年以上，完全無須擔心觸及 500 MB 免費上限。
                  </p>
                </div>

                {/* 學生漫遊資料庫表結構 SQL */}
                <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-black text-sm">
                      <Database className="w-4 h-4" />
                      <span>霧臺英語宇宙 2.0 學生漫遊雲端資料表 (SQL)</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(STUDENT_PROFILES_TABLE_SQL);
                        setToast({ type: 'success', text: '已複製 student_profiles SQL 至剪貼簿！' });
                        setTimeout(() => setToast(null), 3000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors cursor-pointer"
                    >
                      複製 SQL
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-40 leading-relaxed">
                    {STUDENT_PROFILES_TABLE_SQL.trim()}
                  </pre>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-bold">
                    📌 說明：系統已內建無損本機離線快取防護。若需開啟全校跨裝置即時漫遊，可隨時將上述 SQL 貼至 Supabase SQL Editor 執行。
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-bold">
                <RotateCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                正在進行雲端伺服器效能檢測...
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* ============================================================ */}
      {/* ── TAB 5: 全校公告廣播 ── */}
      {/* ============================================================ */}
      {activeTab === 'announcement' && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4 text-purple-600 dark:text-purple-400 font-black">
              <Megaphone className="w-5 h-5" />
              <h3 className="text-lg font-heading">全校即時跑馬燈廣播公告</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-bold">
              啟用後，全校所有學生的「遊戲大廳」頂部均會顯現醒目的黃金廣播列，適合發布單元競賽、停機維護或得獎表揚等通知。
            </p>

            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-3">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  跑馬燈廣播狀態：
                </label>
                <button
                  type="button"
                  onClick={() => setAnnouncementActive(prev => !prev)}
                  className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                    announcementActive
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {announcementActive ? '🔔 已啟用廣播' : '⏸️ 暫停廣播'}
                </button>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 mb-1 block">
                  公告廣播內文：
                </label>
                <textarea
                  rows={3}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="請輸入全校廣播公告內容..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* 預覽效果 */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-300 dark:border-amber-700">
                <span className="text-[10px] font-black text-amber-600 block mb-1">【學生端顯示預覽】</span>
                <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-200">
                  <Megaphone className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{announcementText.trim() || '（尚未輸入公告內容）'}</span>
                </div>
              </div>

              <Button3D
                variant="purple"
                size="md"
                onClick={handleSaveAnnouncement}
                className="w-full sm:w-auto"
                icon={Megaphone}
              >
                儲存並發布廣播
              </Button3D>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ============================================================ */}
      {/* ── TAB 6: 霧臺英語檢定館試題檢核 ── */}
      {/* ============================================================ */}
      {activeTab === 'exam-audit' && (
        <ExamAuditErrorBoundary>
          <ExamAuditZone onBack={() => setActiveTab('words')} />
        </ExamAuditErrorBoundary>
      )}

      {/* ============================================================ */}
      {/* ── TAB 7: Pre-A1 官方模擬精熟矩陣與弱點診斷 ── */}
      {/* ============================================================ */}
      {activeTab === 'mastery' && (
        <div className="space-y-6">
          <TeacherMasteryAnalytics />
        </div>
      )}
    </div>
  );
};
