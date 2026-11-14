import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Button3D } from './ui/Button3D';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { useEasterEgg } from '../hooks/useEasterEgg';
import {
  Rocket,
  Volume2,
  BookOpen,
  ArrowRight,
  Headphones,
  QrCode,
  GraduationCap,
  ClipboardCheck,
  Layers,
  ExternalLink,
  Store,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const Portal = ({
  onNavigate,
  onOpenLeaderboard,
  onOpenTeacherHub,
  wordsCount = 0
}) => {
  const { t } = useI18n();
  const { isDark } = useTheme();
  const handleAdminTrigger = useEasterEgg(onOpenTeacherHub, 5, 2000);
  const [showMobileQr, setShowMobileQr] = useState(false);

  return (
    <div className="relative min-h-screen w-full">
      {/* ══════════════════════════════════════════════════════════ */}
      {/* 🏞️ 魯凱族原住民文化專屬自適應網頁底圖 (日夜自適應無縫漸變) */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <img
          src="/assets/rukai_ui_background.jpg"
          alt="Rukai Indigenous Cultural Background - Day"
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ${
            isDark ? 'opacity-0' : 'opacity-90'
          }`}
        />
        <img
          src="/assets/rukai_ui_background_night.webp"
          alt="Rukai Indigenous Cultural Background - Night"
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ${
            isDark ? 'opacity-90' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-0 transition-colors duration-1000 backdrop-blur-[0.5px] ${
            isDark
              ? 'bg-gradient-to-b from-slate-950/65 via-slate-950/35 to-slate-950/75'
              : 'bg-gradient-to-b from-white/30 via-white/10 to-white/40'
          }`}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-3 sm:space-y-4 animate-fadeIn pb-12">
        {/* ══════════════════════════════════════════════════════════ */}
        {/* 📱 1. 手機專屬極精簡版面 (< 640px) */}
        {/* 順序：小鎮 RPG ➔ 單字館 ➔ 聽說館 ➔ 題庫檢定館 ➔ 自然發音館 ➔ ClassQnA ➔ 電子教科書 */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="block sm:hidden space-y-2">
          {/* 1. 霧臺小鎮生活冒險 RPG */}
          <div
            onClick={() => onNavigate('town')}
            className="p-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent dark:from-amber-950/60 dark:to-slate-900/60 border-2 border-amber-400/70 dark:border-amber-600/70 flex items-center justify-between gap-2.5 shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-[15px] font-black text-slate-800 dark:text-slate-100 font-heading truncate">
                  {t.townModuleTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-600 text-white shrink-0">
                  生活RPG
                </span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 2. 英語單字冒險館 */}
          <div
            onClick={() => onNavigate('lobby')}
            className="p-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent dark:from-emerald-950/60 dark:to-slate-900/60 border-2 border-emerald-400/70 dark:border-emerald-600/70 flex items-center justify-between gap-2.5 shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
                <Rocket className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-[15px] font-black text-slate-800 dark:text-slate-100 font-heading truncate">
                  {t.vocabModuleTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-600 text-white shrink-0">
                  單字冒險
                </span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 3. 雙語聽說探險館 */}
          <div
            onClick={() => onNavigate('langlab')}
            className="p-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-transparent dark:from-rose-950/60 dark:to-slate-900/60 border-2 border-rose-400/70 dark:border-rose-600/70 flex items-center justify-between gap-2.5 shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-rose-600 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/25 shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-[15px] font-black text-slate-800 dark:text-slate-100 font-heading truncate">
                  {t.langlabModuleTitle || '雙語聽說探險館'}
                </h3>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-600 text-white shrink-0">
                  聽說探險
                </span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 4. 霧臺英語檢定館 */}
          <div
            onClick={() => onNavigate('mcq-exam')}
            className="p-2.5 px-3 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-blue-500/10 to-transparent dark:from-indigo-950/60 dark:to-slate-900/60 border-2 border-indigo-400/70 dark:border-indigo-600/70 flex items-center justify-between gap-2.5 shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-[15px] font-black text-slate-800 dark:text-slate-100 font-heading truncate">
                  霧臺英語檢定館
                </h3>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-indigo-600 text-white shrink-0">
                  英語檢定
                </span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 4.5 學習扶助練習館 (獨立題庫與手寫草稿，不與金幣／檢定統計混算) */}
          <div
            onClick={() => onNavigate('priori')}
            className="p-2.5 px-3 rounded-2xl bg-gradient-to-r from-teal-500/15 via-cyan-500/10 to-transparent dark:from-teal-950/60 dark:to-slate-900/60 border-2 border-teal-400/70 dark:border-teal-600/70 flex items-center justify-between gap-2.5 shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-700 to-cyan-700 text-white flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-[15px] font-black text-slate-800 dark:text-slate-100 font-heading truncate">
                  學習扶助練習館
                </h3>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-teal-700 text-white shrink-0">
                  篩選練習
                </span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 5. 自然發音探索館 */}
          <div
            onClick={() => onNavigate('phonics')}
            className="p-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-500/15 via-violet-500/10 to-transparent dark:from-purple-950/60 dark:to-slate-900/60 border-2 border-purple-400/70 dark:border-purple-600/70 flex items-center justify-between gap-2.5 shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 via-purple-600 to-fuchsia-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-[15px] font-black text-slate-800 dark:text-slate-100 font-heading truncate">
                  {t.phonicsModuleTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-purple-600 text-white shrink-0">
                  自然發音
                </span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 6. ClassQnA 線上互動教室 */}
          <div
            onClick={() =>
              window.open('https://classqna.pages.dev/', '_blank', 'noopener,noreferrer')
            }
            className="p-2.5 px-3 rounded-2xl bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-transparent dark:from-sky-950/60 dark:to-slate-900/60 border-2 border-sky-400/70 dark:border-sky-600/70 flex items-center justify-between gap-2.5 shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-sky-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-sky-500/25 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-[15px] font-black text-slate-800 dark:text-slate-100 font-heading truncate">
                  {t.classqnaModuleTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-sky-600 text-white shrink-0">
                  互動教室
                </span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 7. 自編英語電子教科書 */}
          <div
            onClick={() => onNavigate('textbook')}
            className="p-2.5 px-3 rounded-2xl bg-gradient-to-r from-teal-500/15 via-cyan-500/10 to-transparent dark:from-teal-950/60 dark:to-slate-900/60 border-2 border-teal-400/70 dark:border-teal-600/70 flex items-center justify-between gap-2.5 shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-[15px] font-black text-slate-800 dark:text-slate-100 font-heading truncate">
                  {t.textbookModuleTitle || '自編英語電子教科書'}
                </h3>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-teal-600 text-white shrink-0">
                  電子課本
                </span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 💻 2. 電腦與平板精煉橫幅卡片 (>= 640px) */}
        {/* 順序：小鎮 RPG ➔ 單字館 ➔ 聽說館 ➔ 題庫檢定館 ➔ 自然發音館 ➔ ClassQnA ➔ 電子教科書 */}
        {/* 瘦身設計：僅保留「圖示 + 主標題 + 精煉副標 + 進入按鈕」，視覺乾淨純粹 */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="hidden sm:flex flex-col space-y-3.5">
          {/* 1. 霧臺小鎮生活冒險 RPG */}
          <GlassCard
            hoverable={true}
            onClick={() => onNavigate('town')}
            className="relative overflow-hidden group cursor-pointer border-2 border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-amber-950/40 dark:via-slate-900/50 dark:to-orange-950/30 p-4 sm:p-5 shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-amber-500/25 shrink-0">
                  <Store className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 font-heading">
                      {t.townModuleTitle}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-600 text-white">
                      9 大生活地標・實景對話
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 truncate">
                    漫步社區地標進行情境英語對話，完成每日任務與金幣商店採買。
                  </p>
                </div>
              </div>
              <Button3D variant="amber" size="md" className="shrink-0">
                <div className="flex items-center gap-1.5">
                  <span>{t.townModuleEnter}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Button3D>
            </div>
          </GlassCard>

          {/* 2. 英語單字冒險館 */}
          <GlassCard
            hoverable={true}
            onClick={() => onNavigate('lobby')}
            className="relative overflow-hidden group cursor-pointer border-2 border-emerald-300/80 dark:border-emerald-700/60 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 dark:from-emerald-950/40 dark:via-slate-900/50 dark:to-teal-950/30 p-4 sm:p-5 shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-emerald-500/25 shrink-0">
                  <Rocket className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 font-heading">
                      {t.vocabModuleTitle}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white">
                      {wordsCount > 0 ? `課綱 ${wordsCount} 單字・14 款遊戲` : '全冊單字・14 款互動遊戲'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 truncate">
                    結合多人連線擂台、鷹眼神探、神話記憶翻牌、貪食蛇與拼字手寫挑戰。
                  </p>
                </div>
              </div>
              <Button3D variant="emerald" size="md" className="shrink-0">
                <div className="flex items-center gap-1.5">
                  <span>{t.vocabModuleEnter}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Button3D>
            </div>
          </GlassCard>

          {/* 3. 雙語聽說探險館 */}
          <GlassCard
            hoverable={true}
            onClick={() => onNavigate('langlab')}
            className="relative overflow-hidden group cursor-pointer border-2 border-rose-300/80 dark:border-rose-700/60 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-rose-500/10 dark:from-rose-950/40 dark:via-slate-900/50 dark:to-pink-950/30 p-4 sm:p-5 shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-pink-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-rose-500/25 shrink-0">
                  <Headphones className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 font-heading">
                      {t.langlabModuleTitle || '雙語聽說探險館'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white">
                      課文聽力・AI 口說評測
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 truncate">
                    收錄全冊情境對話，提供聽力選擇題、AI 口說跟讀、題庫檢定與單元微電影。
                  </p>
                </div>
              </div>
              <Button3D variant="rose" size="md" className="shrink-0">
                <div className="flex items-center gap-1.5">
                  <span>{t.langlabModuleEnter || '進入聽說探險館'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Button3D>
            </div>
          </GlassCard>

          {/* 4. 霧臺英語檢定館 */}
          <GlassCard
            hoverable={true}
            onClick={() => onNavigate('mcq-exam')}
            className="relative overflow-hidden group cursor-pointer border-2 border-indigo-300/80 dark:border-indigo-700/60 bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-indigo-500/10 dark:from-indigo-950/40 dark:via-slate-900/50 dark:to-indigo-950/30 p-4 sm:p-5 shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-indigo-500/25 shrink-0">
                  <ClipboardCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 font-heading">
                      霧臺英語檢定館
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white">
                      課本同步・學力檢測・Pre-A1 官方模擬
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 truncate">
                    專業一頁一題語言測驗，涵蓋課本同步複習、國小學力成就評量與教育部 Pre-A1 官方實戰模擬。
                  </p>
                </div>
              </div>
              <Button3D variant="indigo" size="md" className="shrink-0">
                <div className="flex items-center gap-1.5">
                  <span>進入檢定館</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Button3D>
            </div>
          </GlassCard>

          {/* 4.5 學習扶助練習館 (獨立國/數/英篩選練習，資料完全隔離) */}
          <GlassCard
            hoverable={true}
            onClick={() => onNavigate('priori')}
            className="relative overflow-hidden group cursor-pointer border-2 border-teal-300/80 dark:border-teal-700/60 bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-teal-500/10 dark:from-teal-950/40 dark:via-slate-900/50 dark:to-teal-950/30 p-4 sm:p-5 shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-700 to-cyan-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-teal-500/25 shrink-0">
                  <Layers className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 font-heading">
                      學習扶助練習館
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-700 text-white">
                      115 篩選練習・原卷模擬／輔助朗讀・互動計算紙
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 truncate">
                    獨立篩選測驗刷題與講解空間：iPad 橫屏並排計算紙、錯題重練與逐步解析，不與金幣或檢定積分混算。
                  </p>
                </div>
              </div>
              <Button3D variant="cyan" size="md" className="shrink-0">
                <div className="flex items-center gap-1.5">
                  <span>進入練習館</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Button3D>
            </div>
          </GlassCard>

          {/* 5. 自然發音探索館 */}
          <GlassCard
            hoverable={true}
            onClick={() => onNavigate('phonics')}
            className="relative overflow-hidden group cursor-pointer border-2 border-purple-300/80 dark:border-purple-700/60 bg-gradient-to-r from-purple-500/10 via-violet-500/5 to-fuchsia-500/10 dark:from-purple-950/40 dark:via-slate-900/50 dark:to-purple-950/30 p-4 sm:p-5 shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-purple-500 via-purple-600 to-fuchsia-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-purple-500/25 shrink-0">
                  <Volume2 className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 font-heading">
                      {t.phonicsModuleTitle}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-600 text-white">
                      8 大發音規則・CVC 拼讀
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 truncate">
                    包含短母音、長母音與複合子音卡池，支援磁吸拼讀導軌與聽音辨字挑戰。
                  </p>
                </div>
              </div>
              <Button3D variant="purple" size="md" className="shrink-0">
                <div className="flex items-center gap-1.5">
                  <span>{t.phonicsModuleEnter}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Button3D>
            </div>
          </GlassCard>

          {/* 6. ClassQnA 線上互動教室 */}
          <GlassCard
            hoverable={true}
            onClick={() =>
              window.open('https://classqna.pages.dev/', '_blank', 'noopener,noreferrer')
            }
            className="relative overflow-hidden group cursor-pointer border-2 border-sky-300/80 dark:border-sky-700/60 bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-cyan-500/10 dark:from-sky-950/40 dark:via-slate-900/50 dark:to-cyan-950/30 p-4 sm:p-5 shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-blue-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-sky-500/25 shrink-0">
                  <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 font-heading">
                      {t.classqnaModuleTitle}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-600 text-white">
                      課堂即時問答・雲端作業
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 truncate">
                    建立線上互動虛擬教室，支援課堂即時問答與學生跨裝置回家作業練習。
                  </p>
                </div>
              </div>
              <Button3D variant="sky" size="md" className="shrink-0">
                <div className="flex items-center gap-1.5">
                  <span>{t.classqnaModuleEnter}</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </Button3D>
            </div>
          </GlassCard>

          {/* 7. 自編英語電子教科書 */}
          <GlassCard
            hoverable={true}
            onClick={() => onNavigate('textbook')}
            className="relative overflow-hidden group cursor-pointer border-2 border-teal-300/80 dark:border-teal-700/60 bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-teal-500/10 dark:from-teal-950/40 dark:via-slate-900/50 dark:to-teal-950/30 p-4 sm:p-5 shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-600 to-cyan-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-teal-500/25 shrink-0">
                  <BookOpen className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 font-heading">
                      {t.textbookModuleTitle || '自編英語電子教科書'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-600 text-white">
                      48 頁全彩・3D 翻頁朗讀
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 truncate">
                    收錄國小雙語校本教材全 5 單元，支援擬真翻頁、章節跳轉與語音朗讀輔助。
                  </p>
                </div>
              </div>
              <Button3D variant="teal" size="md" className="shrink-0">
                <div className="flex items-center gap-1.5">
                  <span>{t.textbookModuleEnter || '翻閱電子書'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Button3D>
            </div>
          </GlassCard>
        </div>

        {/* ── 頁尾 QR Code 與開發者標記 ── */}
        <footer className="pt-2 sm:pt-4 flex flex-col items-center justify-center text-center">
          <div className="sm:hidden mb-2">
            <button
              type="button"
              onClick={() => setShowMobileQr(!showMobileQr)}
              className="text-[11px] font-black text-slate-500 dark:text-slate-400 hover:text-emerald-600 flex items-center gap-1 py-1 px-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
            >
              <QrCode className="w-3 h-3 text-emerald-600" />
              <span>{showMobileQr ? '收合網站 QR Code' : '📱 顯示網站 QR Code 分享'}</span>
              {showMobileQr ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <div className={`${showMobileQr ? 'block' : 'hidden sm:block'} w-full max-w-xs transition-all`}>
            <GlassCard className="p-3.5 flex flex-col items-center w-full">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 mb-1.5">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                    typeof window !== 'undefined' &&
                      window.location.origin &&
                      !window.location.origin.includes('localhost') &&
                      !window.location.origin.includes('127.0.0.1')
                      ? window.location.origin
                      : 'https://wutaivocab.pages.dev'
                  )}`}
                  alt="QR Code"
                  className="w-20 h-20 sm:w-22 sm:h-22 object-contain"
                />
              </div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <QrCode className="w-3 h-3 text-emerald-600" />
                {t.scanToJoin}
              </p>
              <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                {typeof window !== 'undefined' &&
                window.location.host &&
                !window.location.host.includes('localhost')
                  ? window.location.host
                  : 'wutaivocab.pages.dev'}
              </span>
            </GlassCard>
          </div>

          <p
            onClick={handleAdminTrigger}
            className="text-[11px] font-bold text-slate-400 mt-3 cursor-pointer select-none active:scale-95 transition-transform"
            title={t.appName}
          >
            {t.developer}
          </p>
        </footer>
      </div>
    </div>
  );
};
