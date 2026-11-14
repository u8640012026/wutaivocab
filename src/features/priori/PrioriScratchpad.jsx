import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Pencil, Eraser, Undo2, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const PEN_COLORS = [
  { id: 'teal', label: '雲霧青', value: '#0f766e', darkValue: '#2dd4bf' },
  { id: 'indigo', label: '靛青藍', value: '#4338ca', darkValue: '#818cf8' },
  { id: 'rose', label: '朱砂紅', value: '#dc2626', darkValue: '#f87171' },
];

/**
 * 互動方格手寫計算紙（支援分題獨立記憶與唯讀筆跡回放）
 */
export function PrioriScratchpad({
  questionNumber,
  strokes = [],
  onStrokesChange,
  readOnly = false,
  compact = false,
  className = '',
}) {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const strokesRef = useRef(Array.isArray(strokes) ? strokes : []);
  const activeStrokeRef = useRef(null);
  const isDrawingRef = useRef(false);
  const onChangeRef = useRef(onStrokesChange);
  onChangeRef.current = onStrokesChange;

  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [colorId, setColorId] = useState('teal');
  const [strokeCount, setStrokeCount] = useState(() =>
    Array.isArray(strokes) ? strokes.length : 0
  );

  // 將方格線交給 CSS 背景，Canvas 只畫透明墨水層，確保橡皮擦不會擦掉方格線
  const redrawInkOnly = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const logicalW = canvas.width / dpr;
    const logicalH = canvas.height / dpr;
    if (logicalW <= 0 || logicalH <= 0) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, logicalW, logicalH);

    const allStrokes = activeStrokeRef.current
      ? [...strokesRef.current, activeStrokeRef.current]
      : strokesRef.current;

    for (const s of allStrokes) {
      const strokeTool = s.tool || s.t || 'pen';
      const strokeColor = s.colorId || s.c || 'teal';
      const pts = Array.isArray(s.points)
        ? s.points
        : Array.isArray(s.p)
        ? s.p.map(([nx, ny]) => ({ nx, ny }))
        : [];
      if (pts.length === 0) continue;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (strokeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = compact ? 16 : 24;
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        const palette = PEN_COLORS.find((c) => c.id === strokeColor) || PEN_COLORS[0];
        ctx.strokeStyle = isDark ? palette.darkValue : palette.value;
        ctx.lineWidth = compact ? 2.2 : 2.8;
      }

      ctx.beginPath();
      const p0 = pts[0];
      ctx.moveTo(p0.nx * logicalW, p0.ny * logicalH);
      if (pts.length === 1) {
        ctx.lineTo(p0.nx * logicalW + 0.1, p0.ny * logicalH + 0.1);
      } else {
        for (let i = 1; i < pts.length; i++) {
          const pt = pts[i];
          ctx.lineTo(pt.nx * logicalW, pt.ny * logicalH);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }, [compact, isDark]);

  // 切換題號或外部傳入筆跡變更時同步畫面
  useEffect(() => {
    const incoming = Array.isArray(strokes) ? strokes : [];
    strokesRef.current = incoming;
    activeStrokeRef.current = null;
    isDrawingRef.current = false;
    setStrokeCount(incoming.length);
    redrawInkOnly();
  }, [strokes, questionNumber, redrawInkOnly]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      redrawInkOnly();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [redrawInkOnly]);

  useEffect(() => {
    redrawInkOnly();
  }, [redrawInkOnly]);

  const getNormalizedPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    return {
      nx: rect.width > 0 ? x / rect.width : 0,
      ny: rect.height > 0 ? y / rect.height : 0,
    };
  };

  const handlePointerDown = (e) => {
    if (readOnly) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    isDrawingRef.current = true;
    activeStrokeRef.current = {
      tool,
      colorId,
      points: [getNormalizedPoint(e)],
    };
    redrawInkOnly();
  };

  const handlePointerMove = (e) => {
    if (readOnly || !isDrawingRef.current || !activeStrokeRef.current) return;
    e.preventDefault();
    activeStrokeRef.current.points.push(getNormalizedPoint(e));
    redrawInkOnly();
  };

  const finishStroke = () => {
    if (readOnly || !isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (activeStrokeRef.current && activeStrokeRef.current.points.length > 0) {
      const next = [...strokesRef.current, activeStrokeRef.current];
      strokesRef.current = next;
      setStrokeCount(next.length);
      onChangeRef.current?.(next);
    }
    activeStrokeRef.current = null;
    redrawInkOnly();
  };

  const handleUndo = () => {
    if (readOnly || strokesRef.current.length === 0) return;
    const next = strokesRef.current.slice(0, -1);
    strokesRef.current = next;
    setStrokeCount(next.length);
    onChangeRef.current?.(next);
    redrawInkOnly();
  };

  const handleClear = () => {
    if (readOnly) return;
    strokesRef.current = [];
    activeStrokeRef.current = null;
    setStrokeCount(0);
    onChangeRef.current?.([]);
    redrawInkOnly();
  };

  const gridStyle = {
    backgroundImage: isDark
      ? 'linear-gradient(to right, rgba(148,163,184,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.10) 1px, transparent 1px)'
      : 'linear-gradient(to right, rgba(13,148,136,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(13,148,136,0.10) 1px, transparent 1px)',
    backgroundSize: compact ? '16px 16px' : '24px 24px',
  };

  return (
    <div
      className={`flex flex-col rounded-2xl border-2 border-teal-200/80 dark:border-teal-800/70 bg-white/95 dark:bg-slate-900/95 shadow-lg overflow-hidden ${className}`}
      aria-label={readOnly ? `第 ${questionNumber} 題計算紙紀錄` : '手寫計算紙'}
    >
      {/* 工具列（唯讀模式改為精簡狀態標頭） */}
      {readOnly ? (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-teal-50/90 dark:bg-slate-800/90 border-b border-teal-200/70 dark:border-slate-700 text-[11px] font-black text-teal-800 dark:text-teal-200">
          <span>✏️ 第 {questionNumber} 題手寫計算紙紀錄</span>
          <span className="tabular-nums text-slate-500 dark:text-slate-400">
            {strokeCount > 0 ? `共 ${strokeCount} 筆畫` : '空白'}
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-teal-50/90 dark:bg-slate-800/90 border-b border-teal-200/70 dark:border-slate-700">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTool('pen')}
              className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer ${
                tool === 'pen'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              畫筆
            </button>
            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer ${
                tool === 'eraser'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              橡皮擦
            </button>

            {/* 三色切換 */}
            <div className="flex items-center gap-1 pl-1 border-l border-teal-200 dark:border-slate-600">
              {PEN_COLORS.map((c) => {
                const active = tool === 'pen' && colorId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    title={c.label}
                    aria-label={`畫筆顏色：${c.label}`}
                    onClick={() => {
                      setTool('pen');
                      setColorId(c.id);
                    }}
                    className={`w-5 h-5 rounded-full border-2 transition cursor-pointer ${
                      active ? 'scale-115 border-slate-900 dark:border-white ring-2 ring-teal-400' : 'border-white/80 dark:border-slate-700 opacity-75 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: isDark ? c.darkValue : c.value }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokeCount === 0}
              className="px-2 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1 transition cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              復原
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={strokeCount === 0}
              className="px-2 py-1 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 disabled:opacity-40 hover:bg-rose-100 flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>
      )}

      {/* 方格手寫區 */}
      <div
        ref={containerRef}
        style={gridStyle}
        className={`relative flex-1 bg-[#FAF8F5] dark:bg-slate-950 select-none ${
          compact ? 'min-h-[165px]' : 'min-h-[260px] lg:min-h-[380px]'
        }`}
      >
        {strokeCount === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-teal-800/35 dark:text-teal-300/25 px-4 text-center">
            {readOnly ? (
              <p className="text-xs font-bold">此題未留存手寫計算紙筆跡</p>
            ) : (
              <>
                <p className="text-sm font-black">✏️ 自由書寫直式計算區</p>
                <p className="text-[11px] font-bold mt-1">
                  第 {questionNumber} 題專屬計算紙（切換題目自動獨立保存，交卷與教師後台可回看直式過程）
                </p>
              </>
            )}
          </div>
        )}
        <canvas
          ref={canvasRef}
          onPointerDown={readOnly ? undefined : handlePointerDown}
          onPointerMove={readOnly ? undefined : handlePointerMove}
          onPointerUp={readOnly ? undefined : finishStroke}
          onPointerCancel={readOnly ? undefined : finishStroke}
          className={`w-full h-full block ${
            readOnly ? 'pointer-events-none' : 'touch-none cursor-crosshair'
          }`}
        />
      </div>
    </div>
  );
}

/**
 * 唯讀計算紙縮圖回放元件（供結算檢討頁與教師後台單題檢視使用）
 */
export function PrioriScratchpadPreview({
  questionNumber,
  strokes = [],
  compact = true,
  className = '',
}) {
  return (
    <PrioriScratchpad
      questionNumber={questionNumber}
      strokes={strokes}
      readOnly={true}
      compact={compact}
      className={className}
    />
  );
}
