import React, { useState } from 'react';
import {
  X, Sparkles, BookOpen, Trophy, ShieldCheck,
  ChevronRight, CheckCircle2, Lock, Star, Play, Layers
} from 'lucide-react';
import { Button3D } from './ui/Button3D';
import {
  GRIMOIRE_BOOKS,
  GRIMOIRE_GAME_MODES,
  REQUIRED_MODES_FOR_MASTER,
  getGrimoireSummary,
  getBookProgress
} from '../utils/grimoireHelper';
import { soundEngine } from '../services/audio';

export const GrimoireSanctuaryModal = ({
  studentId,
  studentName = '好學生',
  cardTheme = 'dark',
  onClose,
  onLaunchGame
}) => {
  const [activeTheme, setActiveTheme] = useState(cardTheme);
  const [selectedBookId, setSelectedBookId] = useState(1);
  const [selectedHistoryKey, setSelectedHistoryKey] = useState(null);
  const summary = getGrimoireSummary(studentId);
  const historyList = Array.isArray(summary.history) ? summary.history : [];
  const activeHistoryEntry = selectedHistoryKey
    ? historyList.find(h => `${h.academicYear}::${h.grade || ''}` === selectedHistoryKey) || null
    : null;

  const selectedBook = GRIMOIRE_BOOKS.find(b => b.id === selectedBookId) || GRIMOIRE_BOOKS[0];
  const selectedProgress = getBookProgress(studentId, selectedBookId);

  const isDark = activeTheme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none overflow-hidden">
      {/* 典藏館彈窗容器 (嚴格適配 iPad 100dvh 單頁全景零全域捲軸) */}
      <div
        className={`relative w-full max-w-6xl h-[96dvh] max-h-[820px] rounded-3xl border-2 shadow-2xl flex flex-col justify-between overflow-hidden animate-scaleUp transition-colors duration-300 ${
          isDark
            ? 'bg-slate-950/95 border-amber-500/40 text-white shadow-[0_0_50px_rgba(245,158,11,0.25)]'
            : 'bg-stone-100/95 border-amber-700/40 text-stone-900 shadow-[0_0_50px_rgba(217,119,6,0.25)]'
        }`}
      >
        {/* 背景裝飾紋理 */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <img
            src={isDark ? '/assets/backpack/curio_slate.webp' : '/assets/backpack/curio_parchment.webp'}
            alt=""
            className="w-full h-full object-cover filter brightness-[0.7] blur-sm scale-105"
          />
        </div>

        {/* ── 頂部 HUD 標題與八星階級列 (緊湊單行) ── */}
        <header className="relative z-10 px-3 sm:px-5 py-2 sm:py-2.5 border-b flex items-center justify-between shrink-0 border-amber-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg shadow-md border shrink-0 ${
              isDark ? 'bg-amber-950/80 border-amber-400/40 text-amber-300' : 'bg-amber-100 border-amber-600/40 text-amber-800'
            }`}>
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-heading font-black tracking-wide">
                  神山八冊秘典典藏館
                </h3>
                <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 shadow-sm">
                  {summary.masteredStars} / 8 星大師
                </span>
              </div>
              <p className={`text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 ${
                isDark ? 'text-amber-200/80' : 'text-stone-600'
              }`}>
                <span>勇士：{studentName}</span>
                <span>•</span>
                <span className="text-amber-400 font-black">【{summary.titleInfo.name}】</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 風格切換 (黑曜石板 / 象牙羊皮) */}
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                setActiveTheme(prev => prev === 'dark' ? 'parchment' : 'dark');
              }}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-black flex items-center gap-1 border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-white/20 text-amber-300 hover:bg-slate-800'
                  : 'bg-white border-stone-300 text-amber-900 hover:bg-stone-50'
              }`}
              title="切換典藏館展台風格"
            >
              <Layers className="w-3 h-3" />
              <span>{isDark ? '墨岩' : '羊皮'}</span>
            </button>

            {/* 關閉按鈕 */}
            <button
              onClick={() => {
                soundEngine.click();
                onClose();
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 text-white transition-all cursor-pointer border border-white/15"
              title="關閉典藏館"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* ── 核心雙欄舞台 (iPad 768px+ 左右水平並排，手機上下切換，100% 單頁全景) ── */}
        <div className="relative z-10 flex-1 min-h-0 p-2 sm:p-3 grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-stretch overflow-hidden">
          
          {/* ════════════════════════════════════════════════════════
              左欄 (7/12)：8 顆星盤 + 8 本古老秘典 4x2 展台
             ════════════════════════════════════════════════════════ */}
          <div className="md:col-span-7 flex flex-col justify-between gap-2 min-h-0 overflow-hidden">
            
            {/* 上部：星盤橫幅 (緊湊單行) */}
            <div className={`p-2 sm:p-2.5 rounded-2xl border flex items-center justify-between gap-2 shadow-inner shrink-0 ${
              isDark ? 'bg-slate-900/80 border-amber-500/30' : 'bg-amber-50/90 border-amber-600/30'
            }`}>
              <div className="flex items-center gap-2 text-left">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] font-black">
                  {activeHistoryEntry
                    ? `${activeHistoryEntry.academicYear} 學年度封存榮譽：`
                    : '本學年八星試煉：'}
                  <strong className="text-amber-400 font-mono ml-1">
                    {activeHistoryEntry
                      ? `${activeHistoryEntry.totalMasteredModes}/80 項三星精通`
                      : `${summary.totalMasteredModes}/80 項三星精通`}
                  </strong>
                </span>
              </div>

              {/* 8 顆星盤 */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 border border-amber-400/30">
                {Array.from({ length: 8 }).map((_, i) => {
                  const litStars = activeHistoryEntry ? activeHistoryEntry.masteredStars : summary.masteredStars;
                  const isLit = i < litStars;
                  return (
                    <span
                      key={i}
                      className={`text-xs transition-all ${
                        isLit
                          ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.9)] animate-pulse'
                          : isDark ? 'text-slate-600/80' : 'text-stone-400/80'
                      }`}
                      title={`第 ${i + 1} 冊星位 (${isLit ? '已點亮' : '未解鎖'})`}
                    >
                      ★
                    </span>
                  );
                })}
              </div>
            </div>

            {/* 歷屆星辰勳章牆（有跨學年封存紀錄時顯示，支援一鍵切換檢視歷屆榮譽快照） */}
            {historyList.length > 0 && (
              <div
                data-grimoire-history-wall="true"
                className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 ${
                  isDark ? 'bg-slate-900/70 border-amber-500/25' : 'bg-amber-50/80 border-amber-500/30'
                }`}
              >
                <span className="text-[10px] font-black text-amber-400 shrink-0">🏅 歷屆榮譽：</span>
                <button
                  type="button"
                  onClick={() => { soundEngine.click(); setSelectedHistoryKey(null); }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black border shrink-0 cursor-pointer transition ${
                    !activeHistoryEntry
                      ? 'bg-amber-500 text-stone-950 border-amber-300'
                      : 'bg-black/30 text-slate-300 border-white/15 hover:bg-black/50'
                  }`}
                >
                  ✨ 本學年挑戰
                </button>
                {historyList.map((h) => {
                  const hKey = `${h.academicYear}::${h.grade || ''}`;
                  const isViewing = selectedHistoryKey === hKey;
                  return (
                    <button
                      key={hKey}
                      type="button"
                      onClick={() => { soundEngine.click(); setSelectedHistoryKey(hKey); }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black border shrink-0 cursor-pointer transition ${
                        isViewing
                          ? 'bg-emerald-500 text-stone-950 border-emerald-300'
                          : 'bg-black/30 text-amber-200 border-amber-400/30 hover:bg-black/50'
                      }`}
                    >
                      🏅 {h.academicYear}學年 {h.masteredStars}★ ({h.totalMasteredModes}/80)
                    </button>
                  );
                })}
              </div>
            )}

            {/* 下部：8 本古老秘典 (4 欄 x 2 列，緊湊單頁展示) */}
            <div className="flex-1 min-h-0 grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden">
              {GRIMOIRE_BOOKS.map((book) => {
                const liveProg = getBookProgress(studentId, book.id);
                const histBook = activeHistoryEntry?.books?.[String(book.id)];
                const prog = activeHistoryEntry
                  ? {
                      ...liveProg,
                      percent: Number(histBook?.percent) || 0,
                      threeStarCount: Number(histBook?.threeStarCount) || 0,
                      isMastered: Boolean(histBook?.isMastered)
                    }
                  : liveProg;
                const isSelected = book.id === selectedBookId;
                const isMastered = prog.isMastered;

                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => {
                      soundEngine.click();
                      setSelectedBookId(book.id);
                    }}
                    className={`group relative p-1.5 sm:p-2 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between text-center overflow-hidden ${
                      isSelected
                        ? isDark
                          ? 'border-amber-400 bg-amber-950/50 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-[1.02] ring-1 ring-amber-400/60'
                          : 'border-amber-600 bg-amber-100/80 shadow-md scale-[1.02] ring-1 ring-amber-600/40'
                        : isDark
                        ? 'border-white/10 bg-slate-900/70 hover:border-white/20'
                        : 'border-stone-300 bg-white/70 hover:border-stone-400'
                    }`}
                  >
                    {/* 頂部標籤：羅馬字與星標 */}
                    <div className="w-full flex items-center justify-between z-10">
                      <span className="font-mono text-[9px] font-black px-1 rounded bg-black/60 text-amber-300 border border-amber-400/30">
                        {book.roman}
                      </span>
                      {isMastered ? (
                        <span className="text-[9px] font-black px-1 rounded-full bg-amber-500 text-stone-950 shadow-sm flex items-center">
                          ★
                        </span>
                      ) : (
                        <span className={`text-[9px] font-mono font-bold ${
                          isDark ? 'text-slate-400' : 'text-stone-500'
                        }`}>
                          {prog.percent}%
                        </span>
                      )}
                    </div>

                    {/* 書籍本體插畫 (具備灰階漸進解鎖遮罩效果) */}
                    <div className="relative w-16 h-20 sm:w-20 sm:h-24 my-0.5 flex items-center justify-center">
                      {/* 底層：完整灰階暗調版本 */}
                      <img
                        src={book.coverImage}
                        alt={book.nameZh}
                        className="w-full h-full object-contain filter grayscale contrast-90 brightness-[0.45] pointer-events-none select-none transition-all duration-500"
                      />

                      {/* 上層：依據百分比揭示之全彩原貌 (透過 CSS clip-path 裁切遮罩) */}
                      <div
                        className="absolute inset-0 overflow-hidden pointer-events-none transition-all duration-700"
                        style={{
                          clipPath: `inset(0 ${100 - prog.percent}% 0 0)`
                        }}
                      >
                        <img
                          src={book.coverImage}
                          alt=""
                          className={`w-full h-full object-contain filter contrast-110 drop-shadow-md ${
                            isMastered ? 'brightness-110 animate-avatar-breathe' : ''
                          }`}
                        />
                      </div>

                      {/* 若 100% 精通，綻放金光 */}
                      {isMastered && (
                        <div className="absolute inset-0 pointer-events-none rounded-xl ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse" />
                      )}
                    </div>

                    {/* 書籍名稱與圖騰標記 */}
                    <div className="w-full z-10">
                      <h4 className="text-[11px] font-black font-heading truncate leading-tight">
                        {book.nameZh}
                      </h4>
                      <p className={`text-[9px] font-bold truncate ${
                        isDark ? 'text-slate-400' : 'text-stone-500'
                      }`}>
                        {book.totem}
                      </p>
                    </div>

                    {/* 解鎖進度條 */}
                    <div className="w-full mt-1 h-1 rounded-full bg-black/40 overflow-hidden border border-white/10">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isMastered
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${prog.percent}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* ════════════════════════════════════════════════════════
              右欄 (5/12)：選取書冊之 12 大單元挑戰模式清單
             ════════════════════════════════════════════════════════ */}
          <div className={`md:col-span-5 flex flex-col justify-between p-3 rounded-2xl border min-h-0 overflow-hidden shadow-inner ${
            isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white border-stone-300'
          }`}>
            
            {/* 上部：選取書冊標題與進度 */}
            <div className="pb-2 mb-2 border-b border-white/10 shrink-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{selectedBook.symbol}</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black font-heading">
                      【{selectedBook.roman} • {selectedBook.nameZh}】
                    </h4>
                    <span className="text-[10px] text-amber-400 font-bold">
                      圖騰：{selectedBook.totem}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-black text-emerald-400">
                    {selectedProgress.threeStarCount} / {REQUIRED_MODES_FOR_MASTER} 款三星
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {selectedProgress.percent}% 彩色解鎖
                  </div>
                </div>
              </div>

              {/* 友善容錯提示橫幅 */}
              <div className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center justify-between">
                <span>🎯 全冊 12 款挑戰中，任選 10 款三星即可 100% 點亮本冊！</span>
              </div>
            </div>

            {/* 中部：12 款遊戲挑戰模式清單 (自帶平滑滾動，絕不擠爆畫面) */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
              {GRIMOIRE_GAME_MODES.map((mode) => {
                const starVal = selectedProgress.modesStatus[mode.id] || 0;
                const isLegacyPreserved = Boolean(selectedProgress.legacyPreservedModes?.[mode.id]);
                const isCleared = starVal >= 3 || isLegacyPreserved;

                return (
                  <div
                    key={mode.id}
                    className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                      isCleared
                        ? isDark
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-emerald-50 border-emerald-500/50 text-emerald-900'
                        : isDark
                        ? 'bg-slate-950/60 border-white/10 text-slate-300'
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{mode.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-black truncate">{mode.nameZh}</div>
                        <div className="text-[9px] opacity-85 truncate">
                          {starVal >= 3
                            ? '⭐ 已三星 (+10% 解鎖)'
                            : isLegacyPreserved
                            ? '🛡️ 舊版三星已保留（已計入本冊完成度）'
                            : '尚未獲得三星'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* 三星顯示 (反映本遊戲實際完成星數) */}
                      <div className="flex items-center gap-0.5 text-xs">
                        {Array.from({ length: 3 }).map((_, sIdx) => (
                          <span
                            key={sIdx}
                            className={sIdx < starVal ? 'text-amber-400' : 'text-slate-600'}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      {/* 挑戰按鈕 */}
                      {onLaunchGame && (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.click();
                            onClose();
                            onLaunchGame({ modeId: mode.id, bookId: selectedBook.id });
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                            starVal >= 3
                              ? 'bg-emerald-800/60 hover:bg-emerald-700 text-emerald-100'
                              : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm'
                          }`}
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>{starVal >= 3 ? '重練' : '挑戰'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 下部：精通狀態提示條 */}
            <div className="pt-2 mt-2 border-t border-white/10 shrink-0 text-center">
              {selectedProgress.isMastered ? (
                <div className="py-1 px-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-[11px] font-black text-amber-300 flex items-center justify-center gap-1">
                  <span>👑 本冊已 100% 完美精通！已啟動星盤！</span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 font-bold">
                  還差 {Math.max(0, REQUIRED_MODES_FOR_MASTER - selectedProgress.threeStarCount)} 款模式三星即可 100% 點亮本冊！
                </span>
              )}
            </div>

          </div>

        </div>

        {/* ── 底部快捷條 (極簡單行) ── */}
        <footer className="relative z-10 px-4 py-1.5 border-t border-white/10 flex items-center justify-between shrink-0 text-[11px] font-bold text-slate-400 bg-black/40">
          <span>大武山神聖守護法則 • 支援 iPad 單頁全景自適應 • 任選 10 款三星即 100% 點亮</span>
          <button
            onClick={() => {
              soundEngine.click();
              onClose();
            }}
            className="px-3 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-black cursor-pointer transition-all"
          >
            完成返回通行證
          </button>
        </footer>

      </div>
    </div>
  );
};
