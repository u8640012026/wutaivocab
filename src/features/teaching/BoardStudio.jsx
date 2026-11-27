import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  PenTool,
  Eraser,
  Undo2,
  Trash2,
  Volume2,
  Play,
  Eye,
  EyeOff,
  Grid,
  Gamepad2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Turtle,
  Rabbit,
  ShieldAlert,
  LayoutList,
  Square,
  Hash,
  Settings2,
  Type,
  FileText,
} from 'lucide-react';
import { FOUR_LINES, getLetterStrokes } from '../../services/alphabetStrokes';
import { speakEnglish } from '../../services/audio';
import { isElementarySafeWord } from '../../services/profanityFilter';
import { getCurriculumUnitVocab } from './data/curriculumUnits';

const ALPHABET_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const FALLBACK_DICTATION_WORDS = [
  { id: 'fb_apple', en: 'apple', zh: '蘋果' },
  { id: 'fb_book', en: 'book', zh: '書本' },
  { id: 'fb_cat', en: 'cat', zh: '貓咪' },
  { id: 'fb_dog', en: 'dog', zh: '小狗' },
  { id: 'fb_happy', en: 'happy', zh: '快樂的' },
  { id: 'fb_sunny', en: 'sunny', zh: '晴朗的' },
];

const PEN_COLORS = [
  { id: 'ink', labelZh: '標準黑/白', light: '#0f172a', dark: '#f8fafc', chalk: '#f8fafc' },
  { id: 'crimson', labelZh: '朱砂紅', light: '#dc2626', dark: '#f87171', chalk: '#fda4af' },
  { id: 'cobalt', labelZh: '靛青藍', light: '#2563eb', dark: '#60a5fa', chalk: '#7dd3fc' },
  { id: 'emerald', labelZh: '翡翠綠', light: '#059669', dark: '#34d399', chalk: '#6ee7b7' },
];

const PEN_WIDTHS = [
  { id: 'thin', labelZh: '細', size: 3 },
  { id: 'medium', labelZh: '中', size: 5.5 },
  { id: 'thick', labelZh: '粗', size: 9 },
];

const BOARD_DRAFTS_STORAGE_KEY = 'wutai_teaching_board_drafts_v1';
const MAX_BOARD_DRAFTS = 12;

const loadBoardDraftsMap = () => {
  try {
    const raw = sessionStorage.getItem(BOARD_DRAFTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  return {};
};

const persistBoardDraftsMap = (mapObj) => {
  try {
    const entries = Object.entries(mapObj || {});
    if (entries.length > MAX_BOARD_DRAFTS) {
      entries.sort((a, b) => (b[1]?.updatedAt || 0) - (a[1]?.updatedAt || 0));
    }
    const trimmed = Object.fromEntries(entries.slice(0, MAX_BOARD_DRAFTS));
    sessionStorage.setItem(BOARD_DRAFTS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
};

/**
 * 將所有已完成筆畫與正在進行中的多指筆畫清單繪製至指定 Canvas（依 pointerId 支援多點同步書寫）。
 */
function renderInkCanvas(canvas, strokes, activeStrokesMap, resolveColor) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  if (w <= 0 || h <= 0) return;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const activeList = activeStrokesMap ? Array.from(activeStrokesMap.values()) : [];
  const all = activeList.length > 0 ? [...strokes, ...activeList] : strokes;

  for (const s of all) {
    const pts = s.points || [];
    if (pts.length === 0) continue;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (s.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = Math.max(18, (s.width || 5.5) * 4);
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = s.width || 5.5;
      ctx.strokeStyle = resolveColor(s.colorId);
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].nx * w, pts[0].ny * h);
    if (pts.length === 1) {
      ctx.lineTo(pts[0].nx * w + 0.1, pts[0].ny * h + 0.1);
    } else {
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const midX = ((prev.nx + curr.nx) / 2) * w;
        const midY = ((prev.ny + curr.ny) / 2) * h;
        ctx.quadraticCurveTo(prev.nx * w, prev.ny * h, midX, midY);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last.nx * w, last.ny * h);
    }
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * 高解析度透明墨水層 + 精準 0px 基線對齊 SVG 四線三格背景畫布
 * 四線與字帖底稿繪製於同一全寬全高 SVG 座標系中，基線 y3 === rowH * 0.625 零誤差。
 * 橡皮擦採 destination-out 僅擦墨水層，永不擦掉底線；支援多指 pointerId 同時書寫。
 */
function FourLineInkPad({
  strokes = [],
  onStrokesChange,
  tool = 'pen',
  colorId = 'ink',
  penWidth = 5.5,
  rowsCount = 1,
  showFourLines = true,
  guideLines = [], // string[] per row
  showGuide = false,
  guideHighlight = false,
  boardStyle = 'whiteboard', // 'whiteboard' | 'chalkboard'
  isDarkGlobal = false,
  isVisible = true,
  minHeightClass = 'min-h-[210px]',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const strokesRef = useRef(strokes);
  const activeStrokesMapRef = useRef(new Map());
  const onChangeRef = useRef(onStrokesChange);
  onChangeRef.current = onStrokesChange;

  const [padSize, setPadSize] = useState({ width: 800, height: 260 });
  const isChalk = boardStyle === 'chalkboard';

  const resolveStrokeColor = useCallback(
    (cId) => {
      const found = PEN_COLORS.find((p) => p.id === cId) || PEN_COLORS[0];
      if (isChalk) return found.chalk;
      return isDarkGlobal ? found.dark : found.light;
    },
    [isChalk, isDarkGlobal]
  );

  const redrawInk = useCallback(() => {
    renderInkCanvas(canvasRef.current, strokesRef.current, activeStrokesMapRef.current, resolveStrokeColor);
  }, [resolveStrokeColor]);

  useEffect(() => {
    strokesRef.current = Array.isArray(strokes) ? strokes : [];
    redrawInk();
  }, [strokes, redrawInk]);

  useEffect(() => {
    if (!isVisible) return undefined;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const syncSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.max(1, Math.round(rect.width * dpr));
      const targetH = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      const nextW = Math.round(rect.width);
      const nextH = Math.round(rect.height);
      setPadSize((prev) => (prev.width === nextW && prev.height === nextH ? prev : { width: nextW, height: nextH }));
      redrawInk();
    };

    syncSize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
    if (ro) ro.observe(container);
    window.addEventListener('resize', syncSize);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', syncSize);
    };
  }, [redrawInk, rowsCount, isVisible]);

  const getNormPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { nx: 0, ny: 0 };
    const rect = canvas.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height)));
    return { nx, ny };
  };

  const handlePointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const pt = getNormPoint(e);
    activeStrokesMapRef.current.set(e.pointerId, {
      tool,
      colorId,
      width: penWidth,
      points: [pt],
    });
    redrawInk();
  };

  const handlePointerMove = (e) => {
    const active = activeStrokesMapRef.current.get(e.pointerId);
    if (!active) return;
    e.preventDefault();
    const pt = getNormPoint(e);
    const pts = active.points;
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(pt.nx - last.nx, pt.ny - last.ny) > 0.002) {
      pts.push(pt);
      redrawInk();
    }
  };

  const finishStroke = (e) => {
    const finished = activeStrokesMapRef.current.get(e.pointerId);
    if (!finished) return;
    activeStrokesMapRef.current.delete(e.pointerId);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    const nextStrokes = [...strokesRef.current, finished];
    strokesRef.current = nextStrokes;
    redrawInk();
    if (typeof onChangeRef.current === 'function') {
      onChangeRef.current(nextStrokes);
    }
  };

  const rowW = Math.max(200, padSize.width);
  const rowH = Math.max(80, Math.round(padSize.height / Math.max(1, rowsCount)));
  const padX = Math.max(12, Math.round(rowW * 0.018));
  const y1 = rowH * 0.125;
  const y2 = rowH * 0.375;
  const y3 = rowH * 0.625;
  const y4 = rowH * 0.875;

  return (
    <div
      ref={containerRef}
      data-testid="fourline-ink-pad"
      className={`relative w-full h-full ${minHeightClass} rounded-2xl border-2 overflow-hidden select-none touch-none transition-colors ${
        isChalk
          ? 'bg-[#17362b] border-amber-700/80 shadow-inner'
          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-inner'
      }`}
    >
      {/* 底層：與像素尺寸 1:1 鎖定之 SVG 四線三格與字母基線對齊字帖 */}
      <div className="absolute inset-0 flex flex-col pointer-events-none select-none">
        {Array.from({ length: rowsCount }).map((_, rIdx) => {
          const lineText = guideLines[rIdx] || '';
          const charLen = Math.max(1, lineText.length);
          const computedPx = Math.max(
            18,
            Math.min(rowH * 0.54, (rowW - padX * 2 - 24) / Math.max(1, charLen * 0.58))
          );

          return (
            <div key={rIdx} className="flex-1 relative w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${rowW} ${rowH}`}
                preserveAspectRatio="none"
                className="w-full h-full block pointer-events-none"
              >
                {showFourLines && (
                  <g data-fourlines-group="true">
                    <line
                      x1={padX}
                      y1={y1}
                      x2={rowW - padX}
                      y2={y1}
                      stroke={isChalk ? 'rgba(52, 211, 153, 0.35)' : isDarkGlobal ? 'rgba(244, 63, 94, 0.45)' : 'rgba(251, 113, 133, 0.78)'}
                      strokeWidth="1"
                    />
                    <line
                      x1={padX}
                      y1={y2}
                      x2={rowW - padX}
                      y2={y2}
                      stroke={isChalk ? 'rgba(125, 211, 252, 0.45)' : isDarkGlobal ? 'rgba(56, 189, 248, 0.5)' : 'rgba(56, 189, 248, 0.85)'}
                      strokeWidth="1.2"
                      strokeDasharray="6 6"
                    />
                    <line
                      data-fourlines-baseline="true"
                      x1={padX}
                      y1={y3}
                      x2={rowW - padX}
                      y2={y3}
                      stroke={isChalk ? 'rgba(252, 211, 77, 0.65)' : isDarkGlobal ? 'rgba(251, 113, 133, 0.75)' : 'rgba(244, 63, 94, 0.85)'}
                      strokeWidth="2"
                    />
                    <line
                      x1={padX}
                      y1={y4}
                      x2={rowW - padX}
                      y2={y4}
                      stroke={isChalk ? 'rgba(52, 211, 153, 0.35)' : isDarkGlobal ? 'rgba(244, 63, 94, 0.45)' : 'rgba(251, 113, 133, 0.78)'}
                      strokeWidth="1"
                    />
                  </g>
                )}

                {showGuide && lineText && (
                  <text
                    data-fourlines-guide="true"
                    x={padX + 16}
                    y={y3}
                    dominantBaseline="alphabetic"
                    fontSize={computedPx}
                    fontWeight="700"
                    className="font-phonics"
                    fill={
                      guideHighlight
                        ? isChalk
                          ? 'rgba(110, 231, 183, 0.52)'
                          : 'rgba(16, 185, 129, 0.48)'
                        : isChalk
                        ? 'rgba(255, 255, 255, 0.22)'
                        : isDarkGlobal
                        ? 'rgba(148, 163, 184, 0.28)'
                        : 'rgba(100, 116, 139, 0.24)'
                    }
                    stroke={
                      guideHighlight
                        ? isChalk
                          ? 'rgba(167, 243, 208, 0.7)'
                          : 'rgba(5, 150, 105, 0.55)'
                        : 'none'
                    }
                    strokeWidth={guideHighlight ? '1' : '0'}
                    letterSpacing="2"
                  >
                    {lineText}
                  </text>
                )}
              </svg>
            </div>
          );
        })}
      </div>

      {/* 上層：高解析度透明多指觸控書寫墨水層 */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        className={`relative z-10 w-full h-full block touch-none ${
          tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'
        }`}
      />
    </div>
  );
}

/**
 * 單一字母動態筆順示範 SVG 卡（複用 alphabetStrokes.js 標準四線三格路徑）
 */
function AnimatedStrokeLetterCard({
  char,
  animStep,
  animProgress,
  showOrderNumbers,
  isDarkGlobal,
  boardStyle,
}) {
  const strokeData = getLetterStrokes(char);
  const isChalk = boardStyle === 'chalkboard';
  if (!strokeData) return null;

  return (
    <svg
      viewBox={`0 0 ${FOUR_LINES.width} ${FOUR_LINES.height}`}
      className="w-full h-full pointer-events-none select-none"
    >
      {/* 四線三格背景線 */}
      <line x1="6" y1={FOUR_LINES.top} x2="94" y2={FOUR_LINES.top} stroke={isChalk ? 'rgba(52,211,153,0.4)' : 'rgba(244,63,94,0.45)'} strokeWidth="0.7" />
      <line x1="6" y1={FOUR_LINES.mid} x2="94" y2={FOUR_LINES.mid} stroke={isChalk ? 'rgba(125,211,252,0.5)' : 'rgba(56,189,248,0.65)'} strokeWidth="0.8" strokeDasharray="2.2,2.2" />
      <line x1="6" y1={FOUR_LINES.base} x2="94" y2={FOUR_LINES.base} stroke={isChalk ? 'rgba(252,211,77,0.75)' : 'rgba(225,29,72,0.75)'} strokeWidth="1.3" />
      <line x1="6" y1={FOUR_LINES.bottom} x2="94" y2={FOUR_LINES.bottom} stroke={isChalk ? 'rgba(52,211,153,0.4)' : 'rgba(244,63,94,0.45)'} strokeWidth="0.7" />

      {/* 淡灰完整字形底稿 */}
      {strokeData.strokes.map((st) => (
        <path
          key={`bg_${char}_${st.id}`}
          d={st.path}
          fill="none"
          stroke={isChalk ? 'rgba(255,255,255,0.18)' : isDarkGlobal ? 'rgba(148,163,184,0.28)' : 'rgba(148,163,184,0.38)'}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* 動態筆順播放層 */}
      {strokeData.strokes.map((st, idx) => {
        const samples = st.sample || [];
        const isDone = idx < animStep;
        const isCurrent = idx === animStep;

        if (isDone) {
          return (
            <path
              key={`done_${char}_${st.id}`}
              d={st.path}
              fill="none"
              stroke={isChalk ? '#6ee7b7' : '#4f46e5'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.82"
            />
          );
        }

        if (isCurrent && samples.length > 0) {
          const sliceLen = Math.max(1, Math.ceil(samples.length * animProgress));
          const activePts = samples.slice(0, sliceLen);
          const partialPath = activePts
            .map((p, pIdx) => `${pIdx === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`)
            .join(' ');
          const tip = activePts[activePts.length - 1];

          return (
            <g key={`cur_${char}_${st.id}`}>
              <path
                d={partialPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {tip && (
                <circle
                  cx={tip[0]}
                  cy={tip[1]}
                  r="4.2"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              )}
            </g>
          );
        }

        return null;
      })}

      {/* ①②③ 筆順編號 */}
      {showOrderNumbers &&
        strokeData.strokes.map((st, idx) => {
          const lx = st.labelPos?.x ?? st.start?.x ?? 50;
          const ly = st.labelPos?.y ?? st.start?.y ?? 50;
          const isCurrent = idx === animStep;
          return (
            <g key={`lbl_${char}_${st.id}`}>
              <circle
                cx={lx}
                cy={ly}
                r="5.2"
                fill={isCurrent ? '#f59e0b' : '#4f46e5'}
                stroke="#ffffff"
                strokeWidth="0.9"
              />
              <text
                x={lx}
                y={ly + 1.8}
                textAnchor="middle"
                fontSize="5.4"
                fontWeight="900"
                fill="#ffffff"
              >
                {st.id}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

export function BoardStudio({
  selectedBook = '1',
  selectedUnit = '0',
  curriculumUnit = null,
  words = [],
  lang = 'zh',
  isDark = false,
  isVisible = true,
  incomingBoardText = '',
  onConsumeIncomingBoardText,
  onLaunchGame,
}) {
  const initialScopeKey = `${selectedBook}::${selectedUnit}`;
  const draftsMapRef = useRef(loadBoardDraftsMap());
  const activeDraftScopeRef = useRef(initialScopeKey);
  const initialDraft = useMemo(
    () => (incomingBoardText ? null : draftsMapRef.current[initialScopeKey] || null),
    // 僅於掛載當下讀取初始草稿
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const initialSafeUnitWord = useMemo(() => {
    const firstValid = getCurriculumUnitVocab(selectedBook, selectedUnit, words).find(
      (w) => w.en && isElementarySafeWord(w.en)
    );
    return firstValid?.en || FALLBACK_DICTATION_WORDS[0].en;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [boardMode, setBoardMode] = useState(() => {
    if (incomingBoardText) return 'free';
    if (initialDraft?.boardMode) return initialDraft.boardMode;
    return String(selectedBook) === '1' ? 'alphabet' : 'dictation';
  });

  // 共用畫筆狀態
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [colorId, setColorId] = useState('ink');
  const [penWidth, setPenWidth] = useState(5.5);
  const [boardStyle, setBoardStyle] = useState('whiteboard'); // 'whiteboard' | 'chalkboard'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [clearConfirmArmed, setClearConfirmArmed] = useState(false);
  const settingsRef = useRef(null);
  const clearTimerRef = useRef(null);

  // ── Mode 1：大小寫筆順示範 ──
  const [alphaCase, setAlphaCase] = useState(() => initialDraft?.alphaCase || 'both'); // 'upper' | 'lower' | 'both'
  const [activeLetter, setActiveLetter] = useState(() => initialDraft?.activeLetter || 'A');
  const [showOrderNumbers, setShowOrderNumbers] = useState(true);
  const [isSlowStroke, setIsSlowStroke] = useState(false);
  const [animPhase, setAnimPhase] = useState({ slot: 0, strokeIdx: 0, progress: 1 });
  const [animRunId, setAnimRunId] = useState(0);
  const [alphaStrokes, setAlphaStrokes] = useState(() =>
    Array.isArray(initialDraft?.alphaStrokes) ? initialDraft.alphaStrokes : []
  );
  const alphaContainerRef = useRef(null);
  const alphaCanvasRef = useRef(null);
  const alphaStrokesRef = useRef([]);
  const alphaActiveStrokesMapRef = useRef(new Map());

  // ── Mode 2：看中文寫單字 (G3-G6) ──
  const [dictLayout, setDictLayout] = useState(() => initialDraft?.dictLayout || 'single'); // 'single' | 'multi'
  const [dictIndex, setDictIndex] = useState(() =>
    typeof initialDraft?.dictIndex === 'number' ? initialDraft.dictIndex : 0
  );
  const [dictStrokesByWord, setDictStrokesByWord] = useState(
    () => (initialDraft?.dictStrokesByWord && typeof initialDraft.dictStrokesByWord === 'object' ? initialDraft.dictStrokesByWord : {})
  );
  const [revealedByWord, setRevealedByWord] = useState(
    () => (initialDraft?.revealedByWord && typeof initialDraft.revealedByWord === 'object' ? initialDraft.revealedByWord : {})
  );

  // ── Mode 3：自由四線板書 ──
  const [freeInput, setFreeInput] = useState(
    () => incomingBoardText || initialDraft?.freeInput || initialSafeUnitWord
  );
  const [freeGuideText, setFreeGuideText] = useState(
    () => incomingBoardText || initialDraft?.freeGuideText || initialSafeUnitWord
  );
  const [showFreeGuide, setShowFreeGuide] = useState(() => initialDraft?.showFreeGuide ?? true);
  const [showFreeLines, setShowFreeLines] = useState(() => initialDraft?.showFreeLines ?? true);
  const [freeRowsCount, setFreeRowsCount] = useState(() => initialDraft?.freeRowsCount || 1);
  const [freeStrokes, setFreeStrokes] = useState(() =>
    incomingBoardText ? [] : Array.isArray(initialDraft?.freeStrokes) ? initialDraft.freeStrokes : []
  );
  const [safetyWarn, setSafetyWarn] = useState(null);

  const showSafety = useCallback((msg) => {
    setSafetyWarn(msg);
    setTimeout(() => setSafetyWarn(null), 2800);
  }, []);

  const speakSafeBoardText = useCallback(
    (text, rate = 0.85) => {
      const val = String(text || '').trim();
      if (!val) return;
      if (!isElementarySafeWord(val)) {
        showSafety(lang === 'zh' ? '包含不適合國小課堂的字詞，已靜音攔截！' : 'Unsafe speech blocked!');
        return;
      }
      speakEnglish(val, { rate });
    },
    [lang, showSafety]
  );

  // 取得當前單元單字清單
  const unitVocabList = useMemo(() => {
    const raw = getCurriculumUnitVocab(selectedBook, selectedUnit, words);
    const cleaned = raw.filter((w) => w.en && isElementarySafeWord(w.en));
    return cleaned.length > 0 ? cleaned : FALLBACK_DICTATION_WORDS;
  }, [selectedBook, selectedUnit, words]);

  // 依「冊別::單元」即時封存目前板書草稿於 sessionStorage，離開去遊戲再回館不遺失字帖與筆跡
  const buildDraftSnapshot = useCallback(
    () => ({
      boardMode,
      freeInput,
      freeGuideText,
      showFreeGuide,
      showFreeLines,
      freeRowsCount,
      freeStrokes,
      alphaCase,
      activeLetter,
      alphaStrokes,
      dictLayout,
      dictIndex,
      dictStrokesByWord,
      revealedByWord,
      updatedAt: Date.now(),
    }),
    [
      boardMode,
      freeInput,
      freeGuideText,
      showFreeGuide,
      showFreeLines,
      freeRowsCount,
      freeStrokes,
      alphaCase,
      activeLetter,
      alphaStrokes,
      dictLayout,
      dictIndex,
      dictStrokesByWord,
      revealedByWord,
    ]
  );

  const currentScopeKey = `${selectedBook}::${selectedUnit}`;
  useEffect(() => {
    if (activeDraftScopeRef.current !== currentScopeKey) return;
    draftsMapRef.current[activeDraftScopeRef.current] = buildDraftSnapshot();
    persistBoardDraftsMap(draftsMapRef.current);
  }, [currentScopeKey, buildDraftSnapshot]);

  // 點擊外部關閉板書設定彈窗
  useEffect(() => {
    if (!isSettingsOpen) return undefined;
    const handleOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsSettingsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isSettingsOpen]);

  // 清除按鈕誤觸防護計時清理
  useEffect(() => {
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setClearConfirmArmed(false);
  }, [boardMode]);

  // 當從拼音／單字分頁點「✍️ 送至板書」傳入單字時，切至自由板書並設定底稿（絕不被冊課初始化蓋掉）
  useEffect(() => {
    if (!incomingBoardText) return;
    if (!isElementarySafeWord(incomingBoardText)) {
      showSafety(lang === 'zh' ? '已攔截不適合國小課堂的字詞！' : 'Blocked unsafe word.');
      if (onConsumeIncomingBoardText) onConsumeIncomingBoardText();
      return;
    }
    setBoardMode('free');
    setFreeInput(incomingBoardText);
    setFreeGuideText(incomingBoardText);
    setShowFreeGuide(true);
    setFreeStrokes([]);
    if (onConsumeIncomingBoardText) onConsumeIncomingBoardText();
  }, [incomingBoardText, onConsumeIncomingBoardText, lang, showSafety]);

  // 切換「冊別／單元」時：先將前一單元的板書狀態快照保存，再載入新單元草稿或以乾淨畫布初始化（不把舊單元筆跡殘留到新單元）
  const prevScopeRef = useRef(initialScopeKey);
  useEffect(() => {
    const nextScope = `${selectedBook}::${selectedUnit}`;
    if (prevScopeRef.current === nextScope) return;
    const outgoingScope = prevScopeRef.current;
    draftsMapRef.current[outgoingScope] = buildDraftSnapshot();
    prevScopeRef.current = nextScope;
    activeDraftScopeRef.current = nextScope;

    const restored = incomingBoardText ? null : draftsMapRef.current[nextScope] || null;
    if (restored) {
      setBoardMode(restored.boardMode || (String(selectedBook) === '1' ? 'alphabet' : 'dictation'));
      setFreeInput(restored.freeInput || unitVocabList[0]?.en || 'cat');
      setFreeGuideText(restored.freeGuideText ?? (unitVocabList[0]?.en || 'cat'));
      setShowFreeGuide(restored.showFreeGuide ?? true);
      setShowFreeLines(restored.showFreeLines ?? true);
      setFreeRowsCount(restored.freeRowsCount || 1);
      setFreeStrokes(Array.isArray(restored.freeStrokes) ? restored.freeStrokes : []);
      setAlphaCase(restored.alphaCase || 'both');
      setActiveLetter(restored.activeLetter || 'A');
      setAlphaStrokes(Array.isArray(restored.alphaStrokes) ? restored.alphaStrokes : []);
      setDictLayout(restored.dictLayout || 'single');
      setDictIndex(typeof restored.dictIndex === 'number' ? restored.dictIndex : 0);
      setDictStrokesByWord(restored.dictStrokesByWord || {});
      setRevealedByWord(restored.revealedByWord || {});
      persistBoardDraftsMap(draftsMapRef.current);
      return;
    }

    setDictIndex(0);
    setDictStrokesByWord({});
    setRevealedByWord({});
    setAlphaStrokes([]);
    if (String(selectedBook) === '1' && curriculumUnit?.targetGraphemes?.length) {
      const firstLet = curriculumUnit.targetGraphemes.find((g) => /^[a-z]$/i.test(g));
      if (firstLet) {
        setActiveLetter(firstLet.toUpperCase());
        setAnimRunId((r) => r + 1);
      }
    }
    if (!incomingBoardText) {
      const nextWord = unitVocabList[0]?.en || 'cat';
      setFreeStrokes([]);
      setFreeInput(nextWord);
      setFreeGuideText(nextWord);
      if (String(selectedBook) === '1') {
        setBoardMode('alphabet');
      } else {
        setBoardMode((prev) => (prev === 'alphabet' ? 'dictation' : prev));
      }
    }
    persistBoardDraftsMap(draftsMapRef.current);
  }, [selectedBook, selectedUnit, curriculumUnit, unitVocabList, incomingBoardText, buildDraftSnapshot]);

  // ── Mode 1：筆順動畫計時器（隱藏分頁時暫停，節省資源） ──
  const alphaCharsToShow = useMemo(() => {
    const up = activeLetter.toUpperCase();
    const low = activeLetter.toLowerCase();
    if (alphaCase === 'upper') return [up];
    if (alphaCase === 'lower') return [low];
    return [up, low];
  }, [activeLetter, alphaCase]);

  useEffect(() => {
    if (!isVisible || boardMode !== 'alphabet') return undefined;
    let rafId = null;
    let slotIdx = 0;
    let strokeIdx = 0;
    let startTs = null;
    const strokeDuration = isSlowStroke ? 1300 : 720;

    const tick = (ts) => {
      if (!startTs) startTs = ts;
      const char = alphaCharsToShow[slotIdx];
      const data = getLetterStrokes(char);
      const totalStrokes = data?.strokes?.length || 1;
      const elapsed = ts - startTs;
      const prog = Math.min(1, elapsed / strokeDuration);

      setAnimPhase({ slot: slotIdx, strokeIdx, progress: prog });

      if (prog >= 1) {
        if (strokeIdx + 1 < totalStrokes) {
          strokeIdx += 1;
          startTs = ts;
        } else if (slotIdx + 1 < alphaCharsToShow.length) {
          slotIdx += 1;
          strokeIdx = 0;
          startTs = ts;
        } else {
          setAnimPhase({ slot: slotIdx, strokeIdx: totalStrokes, progress: 1 });
          return;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    setAnimPhase({ slot: 0, strokeIdx: 0, progress: 0 });
    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [boardMode, alphaCharsToShow, isSlowStroke, animRunId, isVisible]);

  // ── Mode 1 透明墨水畫布繪製（支援多指 pointerId 同時在字母示範卡上描寫） ──
  const resolveAlphaColor = useCallback(
    (cId) => {
      const palette = PEN_COLORS.find((p) => p.id === cId) || PEN_COLORS[0];
      return boardStyle === 'chalkboard' ? palette.chalk : isDark ? palette.dark : palette.light;
    },
    [boardStyle, isDark]
  );

  const redrawAlphaInk = useCallback(() => {
    renderInkCanvas(alphaCanvasRef.current, alphaStrokesRef.current, alphaActiveStrokesMapRef.current, resolveAlphaColor);
  }, [resolveAlphaColor]);

  useEffect(() => {
    alphaStrokesRef.current = alphaStrokes;
    redrawAlphaInk();
  }, [alphaStrokes, redrawAlphaInk]);

  useEffect(() => {
    if (!isVisible || boardMode !== 'alphabet') return undefined;
    const container = alphaContainerRef.current;
    const canvas = alphaCanvasRef.current;
    if (!container || !canvas) return undefined;

    const sync = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      const tw = Math.max(1, Math.round(rect.width * dpr));
      const th = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== tw || canvas.height !== th) {
        canvas.width = tw;
        canvas.height = th;
      }
      redrawAlphaInk();
    };
    sync();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null;
    if (ro) ro.observe(container);
    window.addEventListener('resize', sync);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [boardMode, redrawAlphaInk, alphaCase, isVisible]);

  const handleAlphaPointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const rect = e.currentTarget.getBoundingClientRect();
    const pt = {
      nx: Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width))),
      ny: Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height))),
    };
    alphaActiveStrokesMapRef.current.set(e.pointerId, {
      tool,
      colorId,
      width: penWidth,
      points: [pt],
    });
    redrawAlphaInk();
  };

  const handleAlphaPointerMove = (e) => {
    const active = alphaActiveStrokesMapRef.current.get(e.pointerId);
    if (!active) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const pt = {
      nx: Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width))),
      ny: Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height))),
    };
    active.points.push(pt);
    redrawAlphaInk();
  };

  const finishAlphaStroke = (e) => {
    const done = alphaActiveStrokesMapRef.current.get(e.pointerId);
    if (!done) return;
    alphaActiveStrokesMapRef.current.delete(e.pointerId);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setAlphaStrokes((prev) => [...prev, done]);
  };

  // ── Mode 2：看中文寫單字可視項目清單 ──
  const visibleDictWords = useMemo(() => {
    if (unitVocabList.length === 0) return [];
    if (dictLayout === 'single') {
      return [unitVocabList[dictIndex % unitVocabList.length]];
    }
    const count = Math.min(3, unitVocabList.length);
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(unitVocabList[(dictIndex + i) % unitVocabList.length]);
    }
    return items;
  }, [unitVocabList, dictIndex, dictLayout]);

  const handleApplyFreeText = (e) => {
    e?.preventDefault();
    const val = freeInput.trim();
    if (!val) {
      setFreeGuideText('');
      return;
    }
    if (!isElementarySafeWord(val)) {
      showSafety(lang === 'zh' ? '包含不適合國小課堂的字詞，已攔截！' : 'Unsafe word blocked!');
      return;
    }
    setFreeGuideText(val);
    setShowFreeGuide(true);
  };

  const handleSpeakFreeText = () => {
    const val = (freeGuideText || freeInput).trim();
    if (!val) return;
    speakSafeBoardText(val, 0.85);
  };

  // 共用復原 / 兩段式安全清除（依當前子模式運作）
  const activeModeHasInk = useMemo(() => {
    if (boardMode === 'alphabet') return alphaStrokes.length > 0;
    if (boardMode === 'free') return freeStrokes.length > 0;
    return visibleDictWords.some((w) => (dictStrokesByWord[w.id || w.en] || []).length > 0);
  }, [boardMode, alphaStrokes, freeStrokes, visibleDictWords, dictStrokesByWord]);

  const handleDockUndo = () => {
    if (boardMode === 'alphabet') {
      setAlphaStrokes((prev) => prev.slice(0, -1));
      return;
    }
    if (boardMode === 'free') {
      setFreeStrokes((prev) => prev.slice(0, -1));
      return;
    }
    // 聽寫模式下，從最後一個有筆跡的題目格復原一筆
    for (let i = visibleDictWords.length - 1; i >= 0; i--) {
      const k = visibleDictWords[i].id || visibleDictWords[i].en;
      if ((dictStrokesByWord[k] || []).length > 0) {
        setDictStrokesByWord((prev) => ({
          ...prev,
          [k]: (prev[k] || []).slice(0, -1),
        }));
        break;
      }
    }
  };

  const handleDockClear = () => {
    if (!activeModeHasInk) return;
    if (!clearConfirmArmed) {
      setClearConfirmArmed(true);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => setClearConfirmArmed(false), 3000);
      return;
    }
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    setClearConfirmArmed(false);
    if (boardMode === 'alphabet') {
      setAlphaStrokes([]);
    } else if (boardMode === 'free') {
      setFreeStrokes([]);
    } else {
      const next = { ...dictStrokesByWord };
      visibleDictWords.forEach((w) => {
        next[w.id || w.en] = [];
      });
      setDictStrokesByWord(next);
    }
  };

  // 目前單元在冊一中屬於哪幾個目標字母（用來亮星）
  const unitHighlightLetters = useMemo(() => {
    if (String(selectedBook) !== '1' || !curriculumUnit?.targetGraphemes) return new Set();
    return new Set(curriculumUnit.targetGraphemes.map((g) => g.toUpperCase()));
  }, [selectedBook, curriculumUnit]);

  const currentLetterMeta = getLetterStrokes(alphaCharsToShow[0]);
  const allVisibleDictRevealed =
    visibleDictWords.length > 0 && visibleDictWords.every((w) => revealedByWord[w.id || w.en]);

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 精簡單一板書控制列：[三模式切換] │ [本模式精簡主控] │ [🎮 神筆遊戲] */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div data-testid="studio-subbar" className="w-full px-3 sm:px-5 md:[padding-left:var(--studio-subbar-pl,20px)] py-1.5 flex flex-wrap items-center justify-between gap-2 bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 shrink-0">
        {/* 左：三模式切換 */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setBoardMode('alphabet')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-black transition cursor-pointer inline-flex items-center gap-1 ${
              boardMode === 'alphabet'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? '筆順' : 'Strokes'}</span>
          </button>
          <button
            type="button"
            onClick={() => setBoardMode('dictation')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-black transition cursor-pointer inline-flex items-center gap-1 ${
              boardMode === 'dictation'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? '聽寫' : 'Dictation'}</span>
          </button>
          <button
            type="button"
            onClick={() => setBoardMode('free')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-black transition cursor-pointer inline-flex items-center gap-1 ${
              boardMode === 'free'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? '自由' : 'Free'}</span>
          </button>
        </div>

        {/* 中：當前模式核心控制（精簡無多餘第二排） */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {boardMode === 'alphabet' && (
            <>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black">
                {[
                  { id: 'both', label: 'Aa' },
                  { id: 'upper', label: 'A' },
                  { id: 'lower', label: 'a' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setAlphaCase(opt.id);
                      setAlphaStrokes([]);
                      setAnimRunId((r) => r + 1);
                    }}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${
                      alphaCase === opt.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setAnimRunId((r) => r + 1)}
                className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'zh' ? '重播' : 'Replay'}</span>
              </button>

              {currentLetterMeta?.sound && (
                <button
                  type="button"
                  onClick={() => speakSafeBoardText(currentLetterMeta.sound, 0.86)}
                  className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{currentLetterMeta.sound}</span>
                </button>
              )}
            </>
          )}

          {boardMode === 'dictation' && (
            <>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black">
                <button
                  type="button"
                  onClick={() => setDictLayout('single')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer ${
                    dictLayout === 'single' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '單題' : '1x'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDictLayout('multi')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer ${
                    dictLayout === 'multi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '3題接力' : '3x'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setDictIndex((i) =>
                      (i - (dictLayout === 'multi' ? 3 : 1) + unitVocabList.length) % unitVocabList.length
                    )
                  }
                  title={lang === 'zh' ? '上一題' : 'Prev'}
                  className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-black text-slate-600 dark:text-slate-300 px-1">
                  {(dictIndex % unitVocabList.length) + 1}/{unitVocabList.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDictIndex((i) => (i + (dictLayout === 'multi' ? 3 : 1)) % unitVocabList.length)
                  }
                  title={lang === 'zh' ? '下一題' : 'Next'}
                  className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDictIndex(Math.floor(Math.random() * unitVocabList.length))}
                  title={lang === 'zh' ? '隨機跳題' : 'Random'}
                  className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = { ...revealedByWord };
                  visibleDictWords.forEach((w) => {
                    next[w.id || w.en] = !allVisibleDictRevealed;
                  });
                  setRevealedByWord(next);
                }}
                className={`px-2.5 py-1 rounded-xl border text-xs font-black flex items-center gap-1 cursor-pointer ${
                  allVisibleDictRevealed
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                }`}
              >
                {allVisibleDictRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{lang === 'zh' ? (allVisibleDictRevealed ? '隱藏對照' : '揭曉') : 'Reveal'}</span>
              </button>
            </>
          )}

          {boardMode === 'free' && (
            <>
              <form onSubmit={handleApplyFreeText} className="flex items-center gap-1">
                <input
                  type="text"
                  value={freeInput}
                  onChange={(e) => setFreeInput(e.target.value)}
                  placeholder={lang === 'zh' ? '輸入字帖單字...' : 'Guide word...'}
                  className="w-36 sm:w-52 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black cursor-pointer shrink-0"
                >
                  {lang === 'zh' ? '套用' : 'Set'}
                </button>
                <button
                  type="button"
                  onClick={handleSpeakFreeText}
                  title={lang === 'zh' ? '朗讀示範詞句' : 'Speak'}
                  className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 cursor-pointer shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFreeRowsCount(n)}
                    className={`px-2 py-1 rounded-lg cursor-pointer ${
                      freeRowsCount === n ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {n}行
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 右：🎮 一鍵前往神筆筆順書寫 */}
        {onLaunchGame && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() =>
                onLaunchGame('handwriting', {
                  mode: boardMode === 'alphabet' || String(selectedBook) === '1' ? 'alphabet' : 'word',
                  openInNewTab: false,
                })
              }
              className="px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'zh' ? '神筆遊戲' : 'Game'}</span>
            </button>
            <button
              type="button"
              title={lang === 'zh' ? '於新分頁開啟神筆書寫' : 'Open in new tab'}
              onClick={() =>
                onLaunchGame('handwriting', {
                  mode: boardMode === 'alphabet' || String(selectedBook) === '1' ? 'alphabet' : 'word',
                  openInNewTab: true,
                })
              }
              className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {safetyWarn && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs sm:text-sm font-black shadow-xl flex items-center gap-2 animate-pop">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{safetyWarn}</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 中央滿版書寫主舞台 */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {boardMode === 'alphabet' && (
        <div className="flex-1 min-h-0 flex flex-col justify-between px-3 sm:px-5 pt-2.5 pb-1.5 max-w-6xl w-full mx-auto gap-2 overflow-hidden">
          <div
            ref={alphaContainerRef}
            className={`relative flex-1 min-h-0 rounded-3xl border-2 overflow-hidden flex items-center justify-center p-4 transition-colors ${
              boardStyle === 'chalkboard'
                ? 'bg-[#17362b] border-amber-700/80 shadow-inner'
                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-md'
            }`}
          >
            <div className={`w-full h-full max-w-3xl grid gap-4 items-center ${alphaCharsToShow.length === 2 ? 'grid-cols-2' : 'grid-cols-1 max-w-md'}`}>
              {alphaCharsToShow.map((ch, idx) => {
                const slotAnimStep =
                  idx < animPhase.slot
                    ? 99
                    : idx === animPhase.slot
                    ? animPhase.strokeIdx
                    : -1;
                const slotProg = idx === animPhase.slot ? animPhase.progress : idx < animPhase.slot ? 1 : 0;

                return (
                  <div key={ch} className="w-full h-full max-h-[360px] flex items-center justify-center">
                    <AnimatedStrokeLetterCard
                      char={ch}
                      animStep={slotAnimStep}
                      animProgress={slotProg}
                      showOrderNumbers={showOrderNumbers}
                      isDarkGlobal={isDark}
                      boardStyle={boardStyle}
                    />
                  </div>
                );
              })}
            </div>

            <canvas
              ref={alphaCanvasRef}
              onPointerDown={handleAlphaPointerDown}
              onPointerMove={handleAlphaPointerMove}
              onPointerUp={finishAlphaStroke}
              onPointerCancel={finishAlphaStroke}
              className={`absolute inset-0 z-20 w-full h-full touch-none ${
                tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'
              }`}
            />
          </div>

          {/* 底部 A-Z 字母快選條 */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 px-1 scrollbar-none shrink-0">
            {ALPHABET_UPPER.map((letter) => {
              const isSelected = activeLetter === letter;
              const isUnitHighlight = unitHighlightLetters.has(letter);
              const display =
                alphaCase === 'lower'
                  ? letter.toLowerCase()
                  : alphaCase === 'both'
                  ? `${letter}${letter.toLowerCase()}`
                  : letter;

              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => {
                    setActiveLetter(letter);
                    setAlphaStrokes([]);
                    setAnimRunId((r) => r + 1);
                  }}
                  className={`px-2.5 py-1 rounded-xl font-phonics font-black text-xs sm:text-sm shrink-0 border transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : isUnitHighlight
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-400'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {display}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {boardMode === 'dictation' && (
        <div className="flex-1 min-h-0 flex flex-col px-3 sm:px-5 pt-2.5 pb-1.5 max-w-6xl w-full mx-auto gap-2.5 overflow-y-auto">
          {visibleDictWords.map((item) => {
            const key = item.id || item.en;
            const isRevealed = Boolean(revealedByWord[key]);
            const rowStrokes = dictStrokesByWord[key] || [];

            return (
              <div
                key={key}
                className={`flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 p-2.5 sm:p-3 flex flex-col sm:flex-row items-stretch gap-3 shadow-xs ${
                  dictLayout === 'single' ? 'min-h-[260px]' : 'min-h-[155px]'
                }`}
              >
                {/* 左側：大字中文題目卡 + 發音 + 單格揭曉 */}
                <div className="sm:w-52 md:w-60 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 flex flex-col justify-between gap-2">
                  <div>
                    <div className={`font-black text-slate-900 dark:text-white leading-snug ${dictLayout === 'single' ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'}`}>
                      {item.zh || item.en}
                    </div>
                    {isRevealed && (
                      <div className="mt-1.5 font-phonics text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {item.en}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => speakSafeBoardText(item.en, 0.85)}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? '聽發音' : 'Speak'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setRevealedByWord((prev) => ({ ...prev, [key]: !prev[key] }))
                      }
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border cursor-pointer transition ${
                        isRevealed
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isRevealed ? (lang === 'zh' ? '隱藏' : 'Hide') : (lang === 'zh' ? '揭曉' : 'Show')}</span>
                    </button>

                    <button
                      type="button"
                      disabled={rowStrokes.length === 0}
                      onClick={() =>
                        setDictStrokesByWord((prev) => ({
                          ...prev,
                          [key]: (prev[key] || []).slice(0, -1),
                        }))
                      }
                      title={lang === 'zh' ? '復原此格' : 'Undo'}
                      className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-35 cursor-pointer"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 右側：四線三格手寫板 */}
                <div className="flex-1 min-h-[130px]">
                  <FourLineInkPad
                    strokes={rowStrokes}
                    onStrokesChange={(next) =>
                      setDictStrokesByWord((prev) => ({ ...prev, [key]: next }))
                    }
                    tool={tool}
                    colorId={colorId}
                    penWidth={penWidth}
                    rowsCount={1}
                    showFourLines={true}
                    guideLines={[item.en]}
                    showGuide={isRevealed}
                    guideHighlight={true}
                    boardStyle={boardStyle}
                    isDarkGlobal={isDark}
                    isVisible={isVisible && boardMode === 'dictation'}
                    minHeightClass={dictLayout === 'single' ? 'min-h-[220px]' : 'min-h-[130px]'}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {boardMode === 'free' && (
        <div className="flex-1 min-h-0 flex flex-col justify-between px-3 sm:px-5 pt-2.5 pb-1.5 max-w-6xl w-full mx-auto gap-2 overflow-hidden">
          <div className="flex-1 min-h-0">
            <FourLineInkPad
              strokes={freeStrokes}
              onStrokesChange={setFreeStrokes}
              tool={tool}
              colorId={colorId}
              penWidth={penWidth}
              rowsCount={freeRowsCount}
              showFourLines={showFreeLines}
              guideLines={Array.from({ length: freeRowsCount }, () => freeGuideText)}
              showGuide={showFreeGuide}
              guideHighlight={false}
              boardStyle={boardStyle}
              isDarkGlobal={isDark}
              isVisible={isVisible && boardMode === 'free'}
              minHeightClass="min-h-[260px]"
            />
          </div>

          {/* 精簡本課單字快捷選詞列 */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none shrink-0">
            <span className="text-[11px] font-black text-slate-400 shrink-0">
              {lang === 'zh' ? '字帖：' : 'Words:'}
            </span>
            {unitVocabList.map((w) => (
              <button
                key={w.id || w.en}
                type="button"
                onClick={() => {
                  setFreeInput(w.en);
                  setFreeGuideText(w.en);
                  setShowFreeGuide(true);
                }}
                className={`px-2.5 py-0.5 rounded-xl text-xs font-bold border shrink-0 transition cursor-pointer ${
                  freeGuideText === w.en
                    ? 'bg-sky-600 text-white border-sky-500'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-sky-400'
                }`}
              >
                {w.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 精簡底部畫筆工具列（筆、橡皮擦、4色、復原、兩段防誤觸清除、設定彈窗） */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="w-full px-3 py-1.5 flex items-center justify-center shrink-0">
        <div
          ref={settingsRef}
          className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-md"
        >
          <button
            type="button"
            onClick={() => setTool('pen')}
            title={lang === 'zh' ? '畫筆' : 'Pen'}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              tool === 'pen' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setTool('eraser')}
            title={lang === 'zh' ? '橡皮擦（不擦底線）' : 'Eraser'}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              tool === 'eraser' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Eraser className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {PEN_COLORS.map((c) => {
            const displayHex = boardStyle === 'chalkboard' ? c.chalk : isDark ? c.dark : c.light;
            const active = tool === 'pen' && colorId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                title={c.labelZh}
                onClick={() => {
                  setTool('pen');
                  setColorId(c.id);
                }}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition cursor-pointer ${
                  active ? 'scale-115 ring-2 ring-indigo-500 border-white' : 'border-slate-300 dark:border-slate-600'
                }`}
                style={{ backgroundColor: displayHex }}
              />
            );
          })}

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

          <button
            type="button"
            disabled={!activeModeHasInk}
            onClick={handleDockUndo}
            title={lang === 'zh' ? '復原一筆' : 'Undo'}
            className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-35 flex items-center gap-1 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'zh' ? '復原' : 'Undo'}</span>
          </button>

          <button
            type="button"
            disabled={!activeModeHasInk}
            onClick={handleDockClear}
            title={lang === 'zh' ? '清除全部筆跡（點兩次確認）' : 'Clear ink (tap twice)'}
            className={`px-2 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer disabled:opacity-35 ${
              clearConfirmArmed
                ? 'bg-rose-600 text-white shadow-xs animate-pulse'
                : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {clearConfirmArmed
                ? lang === 'zh' ? '再點確認' : 'Confirm'
                : lang === 'zh' ? '清除' : 'Clear'}
            </span>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* 設定彈窗按鈕（筆畫粗細、黑白板、各模式次要開關） */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen((v) => !v)}
            title={lang === 'zh' ? '板書進階設定' : 'Board Settings'}
            className={`px-2 py-1 rounded-xl border text-xs font-black flex items-center gap-1 cursor-pointer ${
              isSettingsOpen
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'zh' ? '設定' : 'Options'}</span>
          </button>

          {isSettingsOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 space-y-3 z-50">
              {/* 筆粗細 */}
              <div>
                <div className="text-[11px] font-black text-slate-400 mb-1.5">
                  {lang === 'zh' ? '筆畫粗細' : 'Pen Width'}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {PEN_WIDTHS.map((pw) => (
                    <button
                      key={pw.id}
                      type="button"
                      onClick={() => {
                        setTool('pen');
                        setPenWidth(pw.size);
                      }}
                      className={`py-1.5 rounded-xl text-xs font-black border cursor-pointer ${
                        penWidth === pw.size
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {pw.labelZh}
                    </button>
                  ))}
                </div>
              </div>

              {/* 黑／白板切換 */}
              <div>
                <div className="text-[11px] font-black text-slate-400 mb-1.5">
                  {lang === 'zh' ? '板面樣式' : 'Surface'}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBoardStyle('whiteboard')}
                    className={`py-1.5 rounded-xl text-xs font-black border cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                      boardStyle === 'whiteboard'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300 shrink-0" />
                    <span>{lang === 'zh' ? '白板' : 'White'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoardStyle('chalkboard')}
                    className={`py-1.5 rounded-xl text-xs font-black border cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                      boardStyle === 'chalkboard'
                        ? 'bg-[#17362b] text-emerald-100 border-amber-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700 border border-emerald-400 shrink-0" />
                    <span>{lang === 'zh' ? '黑板' : 'Chalk'}</span>
                  </button>
                </div>
              </div>

              {/* 模式專屬進階開關 */}
              {boardMode === 'alphabet' && (
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setIsSlowStroke((v) => !v)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      {isSlowStroke ? <Turtle className="w-3.5 h-3.5 text-amber-500" /> : <Rabbit className="w-3.5 h-3.5 text-indigo-500" />}
                      <span>{lang === 'zh' ? '筆順動畫速度' : 'Stroke Speed'}</span>
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400">{isSlowStroke ? '慢速' : '正常'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOrderNumbers((v) => !v)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{lang === 'zh' ? '顯示筆順編號' : 'Order Numbers'}</span>
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400">{showOrderNumbers ? '開' : '關'}</span>
                  </button>
                </div>
              )}

              {boardMode === 'free' && (
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setShowFreeGuide((v) => !v)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      {showFreeGuide ? <Eye className="w-3.5 h-3.5 text-sky-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{lang === 'zh' ? '字帖底稿顯示' : 'Trace Guide'}</span>
                    </span>
                    <span className="text-sky-600 dark:text-sky-400">{showFreeGuide ? '開' : '關'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFreeLines((v) => !v)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Grid className="w-3.5 h-3.5 text-rose-500" />
                      <span>{lang === 'zh' ? '顯示四線三格' : 'Show 4-Lines'}</span>
                    </span>
                    <span className="text-rose-600 dark:text-rose-400">{showFreeLines ? '開' : '關'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BoardStudio;
