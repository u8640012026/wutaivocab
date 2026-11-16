import React, { useEffect, useState } from 'react';
import {
  Compass,
  GraduationCap,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  MousePointerClick,
  Keyboard,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import GUIDE_STEPS from '../../data/priori/prioriGuideSteps.json';

/**
 * 學扶館聚光燈互動式使用說明彈窗（支援 iPad 與手機自適應縮放）
 * - 開場先以柔灰微毛玻璃遮罩覆蓋於首頁上方，提供「學生路線」與「教師路線」選擇
 * - 後續步驟採用實機高畫質 WebP 截圖＋精準百分比聚光燈亮框＋虛擬游標移動與模擬輸入動畫
 * - 點擊聚光燈亮框或下方「下一步」皆可順暢前進，不寫入任何真實作答或後台資料
 */
export function PrioriSpotlightGuideModal({ isOpen, onClose }) {
  const [role, setRole] = useState(null); // null | 'student' | 'teacher'
  const [stepIdx, setStepIdx] = useState(0);
  const [typedChars, setTypedChars] = useState('');
  const [cursorReady, setCursorReady] = useState(false);

  const steps = role ? GUIDE_STEPS[role] || [] : [];
  const currentStep = steps[stepIdx] || null;
  const isLastStep = role && stepIdx >= steps.length - 1;

  useEffect(() => {
    if (!isOpen) {
      setRole(null);
      setStepIdx(0);
      setTypedChars('');
      setCursorReady(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !currentStep) return undefined;
    setCursorReady(false);
    setTypedChars('');
    const moveTimer = setTimeout(() => setCursorReady(true), 80);

    let typeInterval = null;
    if (currentStep.demoTyping) {
      const target = String(currentStep.demoTyping);
      let idx = 0;
      const startTimer = setTimeout(() => {
        typeInterval = setInterval(() => {
          idx += 1;
          setTypedChars(target.slice(0, idx));
          if (idx >= target.length) {
            clearInterval(typeInterval);
          }
        }, 320);
      }, 450);
      return () => {
        clearTimeout(moveTimer);
        clearTimeout(startTimer);
        if (typeInterval) clearInterval(typeInterval);
      };
    }

    return () => clearTimeout(moveTimer);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (!role) return;
    if (stepIdx < steps.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      onClose?.();
    }
  };

  const handlePrev = () => {
    if (stepIdx > 0) {
      setStepIdx((i) => i - 1);
    } else {
      setRole(null);
      setStepIdx(0);
    }
  };

  const rect = currentStep?.rect || { x: 25, y: 25, w: 50, h: 30 };
  const centerX = Math.min(94, Math.max(6, rect.x + rect.w / 2));
  const centerY = Math.min(94, Math.max(6, rect.y + rect.h / 2));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/55 backdrop-blur-[2px] animate-fadeIn print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="霧臺國小學習扶助練習館互動式使用說明"
    >
      {!role ? (
        /* ═══ Step 0：聚光燈歡迎卡片（於學扶館首頁上方彈出） ═══ */
        <div className="w-full max-w-xl rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-cyan-400 dark:border-cyan-600 p-5 sm:p-7 shadow-2xl space-y-5 text-center">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-200 text-xs font-black">
              <Compass className="w-4 h-4" />
              <span>聚光燈互動導覽</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
              aria-label="關閉操作說明"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
              歡迎來到霧臺國小學習扶助練習網站說明
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
              請選擇您想了解的部分，系統將以聚光燈與虛擬游標一步步示範（不會影響真實作答與成績）：
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setStepIdx(0);
              }}
              className="group p-4 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/90 dark:bg-emerald-950/40 hover:border-emerald-500 hover:shadow-md transition text-left space-y-1.5 cursor-pointer"
            >
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-black text-sm">
                <GraduationCap className="w-5 h-5 shrink-0" />
                <span>我是學生（進行測驗）</span>
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                以「114 年五年級國語卷」為例，帶你學會選座號、自設 4 碼、朗讀切換與錯題連對 2 次特訓。
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 dark:text-emerald-300 pt-1">
                開始學生導覽（{GUIDE_STEPS.student.length} 步）
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setStepIdx(0);
              }}
              className="group p-4 rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/90 dark:bg-amber-950/40 hover:border-amber-500 hover:shadow-md transition text-left space-y-1.5 cursor-pointer"
            >
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-black text-sm">
                <Users className="w-5 h-5 shrink-0" />
                <span>我是老師（派卷／列印／看成績）</span>
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                引導操作一鍵派卷 QR、列印紙本試卷／解答卷，並以示範畫面說明後台看成績與重設 4 碼。
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 dark:text-amber-300 pt-1">
                開始教師導覽（{GUIDE_STEPS.teacher.length} 步）
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* ═══ 步驟導覽舞台：等比例實機截圖＋柔灰聚光燈高亮框＋虛擬鼠標／輸入動畫 ═══ */
        <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-cyan-400 dark:border-cyan-600 shadow-2xl overflow-hidden flex flex-col max-h-[94dvh]">
          {/* 頂部進度列 */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-600 text-white text-[11px] font-black">
                {role === 'student' ? '學生操作導覽' : '教師操作導覽'}・{stepIdx + 1} / {steps.length}
              </span>
              <span className="text-xs font-black text-slate-700 dark:text-slate-200 hidden sm:inline">
                {currentStep?.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRole(null);
                  setStepIdx(0);
                }}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-black text-slate-600 dark:text-slate-200 inline-flex items-center gap-1 hover:bg-slate-100 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重選身分</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
                aria-label="關閉導覽"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 截圖聚光燈舞台（固定 1280:820 比例，手機與 iPad 不跑位） */}
          <div className="relative w-full bg-slate-950/10 flex-1 min-h-0 flex items-center justify-center p-2 sm:p-3 overflow-hidden">
            <div className="relative w-full max-w-[820px] aspect-[1280/820] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner bg-white select-none">
              <img
                src={currentStep?.image}
                alt={currentStep?.title}
                className="w-full h-full object-contain block"
                draggable={false}
              />

              {/* 聚光燈高亮洞：外圍使用柔灰半透明（rgba(15,23,42,0.52)），不死黑 */}
              <button
                type="button"
                onClick={handleNext}
                aria-label={`點擊導覽亮區前往下一步：${currentStep?.title}`}
                style={{
                  left: `${rect.x}%`,
                  top: `${rect.y}%`,
                  width: `${rect.w}%`,
                  height: `${rect.h}%`,
                  boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.52)',
                }}
                className="absolute rounded-xl border-2 border-cyan-300 ring-4 ring-cyan-400/50 transition-all duration-500 cursor-pointer group"
              >
                <span className="sr-only">點此亮區繼續</span>
              </button>

              {/* 虛擬游標動畫（平滑移入高亮框中心並顯示點擊波紋） */}
              <div
                style={{
                  left: cursorReady ? `${centerX}%` : `${Math.min(92, centerX + 14)}%`,
                  top: cursorReady ? `${centerY}%` : `${Math.min(92, centerY + 14)}%`,
                }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-20"
              >
                <span className="absolute -inset-2 rounded-full bg-cyan-400/45 animate-ping" />
                <span className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500 text-white border-2 border-white shadow-lg">
                  <MousePointerClick className="w-4 h-4" />
                </span>
              </div>

              {/* 模擬鍵盤輸入氣泡（如 4 碼換機密碼示範） */}
              {currentStep?.demoTyping && (
                <div
                  style={{
                    left: `${Math.min(72, Math.max(8, rect.x))}%`,
                    top: `${Math.min(80, rect.y + rect.h + 2)}%`,
                  }}
                  className="pointer-events-none absolute z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white border border-cyan-400 shadow-xl flex items-center gap-2 text-xs font-black"
                >
                  <Keyboard className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <span className="text-slate-300">{currentStep.typingLabel}：</span>
                  <span className="font-mono tracking-[0.25em] text-amber-300 min-w-[4.5ch]">
                    {typedChars || '____'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 下方說明與導覽按鈕（雙軌：可點上面亮框，也可點這裡的「下一步」） */}
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 text-left">
              <div className="text-sm font-black text-slate-900 dark:text-white sm:hidden">
                {currentStep?.title}
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                {currentStep?.desc}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>上一步</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black inline-flex items-center gap-1 shadow-sm cursor-pointer"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{currentStep?.actionHint || '完成導覽'}</span>
                  </>
                ) : (
                  <>
                    <span>下一步</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
