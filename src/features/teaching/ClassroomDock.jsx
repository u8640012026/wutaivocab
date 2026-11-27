import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Wrench,
  X,
  Plus,
  Minus,
  Crown,
  Trophy,
  RotateCcw,
  Timer,
  Play,
  Pause,
  Dices,
  PenTool,
  Volume2,
  Volume1,
  Turtle,
  Zap,
  Bot,
  Smile,
  Radio,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  GripVertical,
  GripHorizontal,
  Pin,
  PinOff,
  Undo2,
  Trash2,
} from 'lucide-react';
import { soundEngine, speakEnglish } from '../../services/audio';
import { LiveClassroomPanel } from './LiveClassroomPanel';
import { WutaiAnimalIcon } from './components/WutaiAnimalIcon';

const WUTAI_ANIMAL_TEAMS = [
  { id: 'leopard', defaultZh: '霧臺雲豹', color: 'from-amber-500 to-orange-500', badge: 'bg-amber-100/90 text-amber-900 border-amber-300' },
  { id: 'bear', defaultZh: '大武黑熊', color: 'from-slate-700 to-slate-900', badge: 'bg-slate-100/90 text-slate-900 border-slate-300' },
  { id: 'boar', defaultZh: '勇士山豬', color: 'from-rose-500 to-red-600', badge: 'bg-rose-100/90 text-rose-900 border-rose-300' },
  { id: 'deer', defaultZh: '溪谷水鹿', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-100/90 text-emerald-900 border-emerald-300' },
  { id: 'eagle', defaultZh: '雄鷹獵手', color: 'from-sky-500 to-indigo-600', badge: 'bg-sky-100/90 text-sky-900 border-sky-300' },
  { id: 'owl', defaultZh: '智慧貓頭鷹', color: 'from-purple-500 to-fuchsia-600', badge: 'bg-purple-100/90 text-purple-900 border-purple-300' },
];

const VOICE_DICE_FACES = [
  { label: 'Loud!', zh: '大聲唸', Icon: Volume2, speak: 'Read it loud!' },
  { label: 'Whisper', zh: '悄悄話', Icon: Volume1, speak: 'Whisper!' },
  { label: 'Slow', zh: '慢動作', Icon: Turtle, speak: 'Read it slowly!' },
  { label: 'Fast!', zh: '超級快', Icon: Zap, speak: 'Read it fast!' },
  { label: 'Robot', zh: '機器人', Icon: Bot, speak: 'Robot voice!' },
  { label: 'Happy', zh: '超開心', Icon: Smile, speak: 'Happy voice!' },
];

const clampViewportPos = (x, y, width, height) => {
  if (typeof window === 'undefined') return { x, y };
  const maxX = Math.max(8, window.innerWidth - width - 8);
  const maxY = Math.max(56, window.innerHeight - height - 8);
  return {
    x: Math.min(Math.max(8, x), maxX),
    y: Math.min(Math.max(56, y), maxY),
  };
};

const PEN_COLORS = [
  { id: 'red', hex: '#ef4444', label: '紅' },
  { id: 'blue', hex: '#2563eb', label: '藍' },
  { id: 'amber', hex: '#f59e0b', label: '黃' },
  { id: 'green', hex: '#10b981', label: '綠' },
];

const CLASSROOM_SFX_ITEMS = [
  {
    id: 'applause',
    labelZh: '過關掌聲',
    labelEn: 'Applause',
    Icon: Award,
    iconColor: 'text-amber-500',
    bgHover: 'hover:bg-amber-50 dark:hover:bg-amber-950/50',
    fn: () => soundEngine.classroomApplause(),
  },
  {
    id: 'ding',
    labelZh: '答對叮咚',
    labelEn: 'Correct',
    Icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    bgHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50',
    fn: () => soundEngine.classroomDingDong(),
  },
  {
    id: 'wrong',
    labelZh: '再試一次',
    labelEn: 'Try Again',
    Icon: XCircle,
    iconColor: 'text-rose-500',
    bgHover: 'hover:bg-rose-50 dark:hover:bg-rose-950/50',
    fn: () => soundEngine.classroomBuzzerWrong(),
  },
  {
    id: 'sparkle',
    labelZh: '重點提示',
    labelEn: 'Highlight',
    Icon: Sparkles,
    iconColor: 'text-indigo-500',
    bgHover: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/50',
    fn: () => soundEngine.classroomSparkle(),
  },
];

const formatSeconds = (totalSec) => {
  const s = Math.max(0, Math.floor(totalSec));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export function ClassroomDock({ lang = 'zh' }) {
  const isZh = lang !== 'en';
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState('teams'); // 'teams' | 'timer' | 'dice' | 'annotate' | 'live'

  // ── 0. 雙懸浮獨立拖曳位置（課堂工具列預設右下角安全距離；小組記分板預設右上角，永不重疊）──
  const drawerWidth = typeof window !== 'undefined' && window.innerWidth >= 640 ? 384 : 320;
  const drawerMaxHeight = typeof window !== 'undefined' ? Math.min(520, Math.round(window.innerHeight * 0.72)) : 520;

  const [dockPos, setDockPos] = useState(() => {
    if (typeof window === 'undefined') return { x: 860, y: 620 };
    return clampViewportPos(window.innerWidth - 136, window.innerHeight - 64, 116, 40);
  });
  const [drawerPos, setDrawerPos] = useState(() => {
    if (typeof window === 'undefined') return { x: 680, y: 140 };
    return clampViewportPos(window.innerWidth - 404, Math.max(64, window.innerHeight - 540), 384, 480);
  });
  const [miniPos, setMiniPos] = useState(() => {
    if (typeof window === 'undefined') return { x: 760, y: 64 };
    return clampViewportPos(window.innerWidth - 260, 64, 240, 44);
  });
  const [sfxPos, setSfxPos] = useState(() => {
    if (typeof window === 'undefined') return { x: 20, y: 620 };
    return clampViewportPos(20, window.innerHeight - 68, 220, 48);
  });

  const drawerRef = useRef(null);
  const dockDragRef = useRef(null);
  const dockMovedRef = useRef(false);
  const drawerDragRef = useRef(null);
  const miniDragRef = useRef(null);
  const miniMovedRef = useRef(false);
  const sfxDragRef = useRef(null);

  useEffect(() => {
    const onResize = () => {
      const h = drawerRef.current?.offsetHeight || 460;
      setDockPos((p) => clampViewportPos(p.x, p.y, 116, 40));
      setDrawerPos((p) => clampViewportPos(p.x, p.y, drawerWidth, h));
      setMiniPos((p) => clampViewportPos(p.x, p.y, 240, 44));
      setSfxPos((p) => clampViewportPos(p.x, p.y, 220, 48));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawerWidth]);

  const openDrawer = useCallback(
    (targetTab) => {
      if (targetTab) setActiveTool(targetTab);
      setDrawerPos(
        clampViewportPos(
          dockPos.x - drawerWidth + 116,
          dockPos.y - drawerMaxHeight + 40,
          drawerWidth,
          drawerMaxHeight
        )
      );
      setIsOpen(true);
    },
    [dockPos.x, dockPos.y, drawerWidth, drawerMaxHeight]
  );

  const startDockDrag = useCallback((e, width, height) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('[data-no-drag="true"]')) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dockMovedRef.current = false;
    dockDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: dockPos.x,
      originY: dockPos.y,
      width,
      height,
    };
  }, [dockPos]);

  const moveDockDrag = useCallback((e) => {
    const drag = dockDragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.hypot(dx, dy) > 5) dockMovedRef.current = true;
    setDockPos(clampViewportPos(drag.originX + dx, drag.originY + dy, drag.width, drag.height));
  }, []);

  const endDockDrag = useCallback(() => {
    dockDragRef.current = null;
  }, []);

  const startDrawerDrag = useCallback(
    (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest('[data-no-drag="true"]')) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const actualHeight = drawerRef.current?.offsetHeight || drawerMaxHeight;
      drawerDragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: drawerPos.x,
        originY: drawerPos.y,
        width: drawerWidth,
        height: actualHeight,
      };
    },
    [drawerPos, drawerWidth, drawerMaxHeight]
  );

  const moveDrawerDrag = useCallback((e) => {
    const drag = drawerDragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setDrawerPos(clampViewportPos(drag.originX + dx, drag.originY + dy, drag.width, drag.height));
  }, []);

  const endDrawerDrag = useCallback(() => {
    drawerDragRef.current = null;
  }, []);

  const startMiniDrag = useCallback((e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    miniMovedRef.current = false;
    miniDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: miniPos.x,
      originY: miniPos.y,
    };
  }, [miniPos]);

  const moveMiniDrag = useCallback((e) => {
    const drag = miniDragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.hypot(dx, dy) > 5) miniMovedRef.current = true;
    setMiniPos(clampViewportPos(drag.originX + dx, drag.originY + dy, 240, 44));
  }, []);

  const endMiniDrag = useCallback(() => {
    miniDragRef.current = null;
  }, []);

  const startSfxDrag = useCallback((e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    sfxDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: sfxPos.x,
      originY: sfxPos.y,
    };
  }, [sfxPos]);

  const moveSfxDrag = useCallback((e) => {
    const drag = sfxDragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setSfxPos(clampViewportPos(drag.originX + dx, drag.originY + dy, 220, 48));
  }, []);

  const endSfxDrag = useCallback(() => {
    sfxDragRef.current = null;
  }, []);

  const [pinSfxMini, setPinSfxMini] = useState(false);
  const [sfxExpanded, setSfxExpanded] = useState(true);

  // ── 1. 霧臺神獸分組記分板 ──
  const [teams, setTeams] = useState(() =>
    WUTAI_ANIMAL_TEAMS.slice(0, 2).map((t) => ({ ...t, name: t.defaultZh, score: 0 }))
  );
  const [pinTeamsMini, setPinTeamsMini] = useState(false);
  const [expandedMiniTeamId, setExpandedMiniTeamId] = useState(null);

  const maxScore = useMemo(() => Math.max(0, ...teams.map((t) => t.score)), [teams]);

  const adjustTeamScore = (teamId, delta) => {
    try {
      if (delta > 0) soundEngine.correct();
      else soundEngine.click();
    } catch {}
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t))
    );
  };

  const handleAddTeam = () => {
    if (teams.length >= WUTAI_ANIMAL_TEAMS.length) return;
    const nextPreset = WUTAI_ANIMAL_TEAMS[teams.length];
    setTeams((prev) => [...prev, { ...nextPreset, name: nextPreset.defaultZh, score: 0 }]);
  };

  const handleRemoveTeam = () => {
    if (teams.length <= 2) return;
    setTeams((prev) => prev.slice(0, -1));
  };

  // ── 2. 大字倒數計時器與碼錶 ──
  const [timerMode, setTimerMode] = useState('countdown'); // 'countdown' | 'stopwatch'
  const [countdownTotal, setCountdownTotal] = useState(60);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [pinTimerMini, setPinTimerMini] = useState(false);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const id = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (timerMode === 'stopwatch') return prev + 1;
        if (prev <= 1) {
          setTimerRunning(false);
          try {
            soundEngine.win();
            confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
          } catch {}
          return 0;
        }
        if (prev <= 11) {
          try {
            soundEngine.countdownTensionTick();
          } catch {}
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, timerMode]);

  const setPresetCountdown = (sec) => {
    setTimerRunning(false);
    setTimerMode('countdown');
    setCountdownTotal(sec);
    setTimerSeconds(sec);
  };

  const timerPct =
    timerMode === 'countdown' && countdownTotal > 0
      ? Math.max(0, Math.min(100, (timerSeconds / countdownTotal) * 100))
      : 100;

  // ── 3. 立體 3D 骰子 ──
  const [diceMode, setDiceMode] = useState('single'); // 'single' | 'double' | 'voice'
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceResult, setDiceResult] = useState({ d1: 6, d2: 4, voiceIdx: 0 });
  const diceTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (diceTimeoutRef.current) clearTimeout(diceTimeoutRef.current);
    };
  }, []);

  const handleRollDice = () => {
    if (diceRolling) return;
    setDiceRolling(true);
    try {
      soundEngine.spinCard();
    } catch {}
    if (diceTimeoutRef.current) clearTimeout(diceTimeoutRef.current);
    diceTimeoutRef.current = window.setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const voiceIdx = Math.floor(Math.random() * VOICE_DICE_FACES.length);
      setDiceResult({ d1, d2, voiceIdx });
      setDiceRolling(false);
      try {
        soundEngine.correct();
        if (diceMode === 'voice') {
          speakEnglish(VOICE_DICE_FACES[voiceIdx].speak, { rate: 0.92 });
        } else if (diceMode === 'double') {
          speakEnglish(String(d1 + d2), { rate: 0.9 });
        } else {
          speakEnglish(String(d1), { rate: 0.9 });
        }
      } catch {}
    }, 520);
  };

  // ── 4. 螢幕重點畫筆層（預設關閉，不干擾原生大屏觸控） ──
  const [annotationEnabled, setAnnotationEnabled] = useState(false);
  const [penColor, setPenColor] = useState(PEN_COLORS[0].hex);
  const [strokes, setStrokes] = useState([]);
  const activeStrokeRef = useRef(null);
  const [drawingStroke, setDrawingStroke] = useState(null);

  const handleAnnoPointerDown = (e) => {
    if (!annotationEnabled) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const pt = { x: e.clientX, y: e.clientY };
    const next = { color: penColor, points: [pt] };
    activeStrokeRef.current = next;
    setDrawingStroke(next);
  };

  const handleAnnoPointerMove = (e) => {
    if (!activeStrokeRef.current) return;
    const pt = { x: e.clientX, y: e.clientY };
    const updated = {
      ...activeStrokeRef.current,
      points: [...activeStrokeRef.current.points, pt],
    };
    activeStrokeRef.current = updated;
    setDrawingStroke(updated);
  };

  const handleAnnoPointerUp = () => {
    if (!activeStrokeRef.current) return;
    const finished = activeStrokeRef.current;
    activeStrokeRef.current = null;
    setDrawingStroke(null);
    if (finished.points.length > 0) {
      setStrokes((prev) => [...prev, finished]);
    }
  };

  const toSvgPath = (pts) => {
    if (!pts || pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y} L ${pts[0].x + 0.5} ${pts[0].y + 0.5}`;
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  return (
    <>
      {/* 透明全螢幕重點標註畫筆層（僅開啟時攔截筆跡，支援復原／清除／一鍵關閉） */}
      {annotationEnabled && (
        <div className="fixed inset-0 z-30 pointer-events-auto touch-none">
          <svg
            data-testid="classroom-annotation-canvas"
            onPointerDown={handleAnnoPointerDown}
            onPointerMove={handleAnnoPointerMove}
            onPointerUp={handleAnnoPointerUp}
            onPointerCancel={handleAnnoPointerUp}
            className="w-full h-full cursor-crosshair"
          >
            {strokes.map((st, idx) => (
              <path
                key={idx}
                d={toSvgPath(st.points)}
                fill="none"
                stroke={st.color}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.88"
              />
            ))}
            {drawingStroke && (
              <path
                d={toSvgPath(drawingStroke.points)}
                fill="none"
                stroke={drawingStroke.color}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.88"
              />
            )}
          </svg>

          {/* 懸浮畫筆捷徑條 */}
          <div className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 text-white shadow-2xl border border-slate-700">
            {PEN_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPenColor(c.hex)}
                className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                  penColor === c.hex ? 'border-white scale-115' : 'border-transparent opacity-75'
                }`}
                style={{ backgroundColor: c.hex }}
                aria-label={c.label}
              />
            ))}
            <button
              type="button"
              onClick={() => setStrokes((prev) => prev.slice(0, -1))}
              className="p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              title={isZh ? '復原一筆' : 'Undo'}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setStrokes([])}
              className="p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              title={isZh ? '清除全部標註' : 'Clear'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setAnnotationEnabled(false)}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-black cursor-pointer"
            >
              {isZh ? '結束畫筆' : 'Done'}
            </button>
          </div>
        </div>
      )}

      {/* 縮小懸浮快捷條（拖曳限於左側把手；單點組徽平滑展開 +/-；連點兩下還原為完整分組視窗） */}
      {!isOpen && (pinTeamsMini || pinTimerMini) && (
        <div
          data-testid="classroom-mini-floating"
          onDoubleClick={() => openDrawer('teams')}
          style={{ left: miniPos.x, top: miniPos.y }}
          title={isZh ? '拖曳左側把手移動；點擊組別展開加減分；連點兩下還原工具列' : 'Drag handle to move; tap team for +/-; double-click to expand'}
          className="fixed z-30 flex flex-wrap items-center gap-1.5 px-2 py-1.5 rounded-2xl bg-white/75 dark:bg-slate-900/75 border border-white/50 dark:border-slate-700/60 shadow-xl backdrop-blur-xl select-none"
        >
          <span
            data-testid="classroom-mini-drag-handle"
            onPointerDown={startMiniDrag}
            onPointerMove={moveMiniDrag}
            onPointerUp={endMiniDrag}
            onPointerCancel={endMiniDrag}
            className="text-slate-400 dark:text-slate-500 hover:text-indigo-500 flex items-center px-1 py-1 rounded-lg cursor-grab active:cursor-grabbing touch-none"
            title={isZh ? '拖曳移動記分板' : 'Drag scoreboard'}
          >
            <GripVertical className="w-4 h-4" />
          </span>
          {pinTimerMini && (
            <button
              type="button"
              onClick={() => setTimerRunning((r) => !r)}
              className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                timerMode === 'countdown' && timerSeconds <= 10 && timerSeconds > 0
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span className="font-mono text-sm">{formatSeconds(timerSeconds)}</span>
            </button>
          )}
          {pinTeamsMini &&
            teams.map((tm) => {
              const isExpanded = expandedMiniTeamId === tm.id;
              return (
                <div key={tm.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    data-testid={`mini-team-pill-${tm.id}`}
                    onClick={() => setExpandedMiniTeamId((prev) => (prev === tm.id ? null : tm.id))}
                    className={`px-2 py-1 rounded-xl border text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${tm.badge} ${
                      isExpanded ? 'ring-2 ring-indigo-400' : ''
                    }`}
                    title={isZh ? '點一下展開 +/- 加減分；連點兩下還原完整記分板' : 'Tap for +/-; double-click to expand'}
                  >
                    <WutaiAnimalIcon animal={tm.id} className="w-4 h-4 shrink-0" />
                    <span>{tm.score}</span>
                  </button>
                  <div
                    className={`flex items-center gap-0.5 overflow-hidden transition-all duration-200 ${
                      isExpanded ? 'max-w-[64px] opacity-100 scale-100' : 'max-w-0 opacity-0 scale-90 pointer-events-none'
                    }`}
                  >
                    <button
                      type="button"
                      data-testid={`mini-team-minus-${tm.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        adjustTeamScore(tm.id, -1);
                      }}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className="w-6 h-6 rounded-lg bg-white/90 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer active:scale-90"
                      aria-label={`${tm.name} -1`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      data-testid={`mini-team-plus-${tm.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        adjustTeamScore(tm.id, 1);
                      }}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center cursor-pointer active:scale-90"
                      aria-label={`${tm.name} +1`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* 獨立純圖示浮動音效膠囊（仿 classqna：一鍵收合／展開、左側把手自由拖曳） */}
      {pinSfxMini && (
        <div
          data-testid="classroom-sfx-floating"
          style={{ left: sfxPos.x, top: sfxPos.y }}
          className="fixed z-35 flex items-center gap-1 p-1.5 rounded-full bg-white/75 dark:bg-slate-900/75 border border-white/50 dark:border-slate-700/60 shadow-xl backdrop-blur-xl select-none"
        >
          <span
            data-testid="classroom-sfx-drag-handle"
            onPointerDown={startSfxDrag}
            onPointerMove={moveSfxDrag}
            onPointerUp={endSfxDrag}
            onPointerCancel={endSfxDrag}
            className="text-slate-400 dark:text-slate-500 hover:text-indigo-500 flex items-center pl-1 pr-0.5 py-1 cursor-grab active:cursor-grabbing touch-none"
            title={isZh ? '拖曳移動音效盤' : 'Drag soundboard'}
          >
            <GripVertical className="w-4 h-4" />
          </span>

          <button
            type="button"
            data-testid="classroom-sfx-toggle-btn"
            onClick={() => setSfxExpanded((v) => !v)}
            title={sfxExpanded ? (isZh ? '收合音效列' : 'Collapse') : isZh ? '展開課室音效盤' : 'Expand Soundboard'}
            aria-label={isZh ? '收合或展開音效盤' : 'Toggle Soundboard'}
            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition ${
              sfxExpanded
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <div
            className={`flex items-center gap-1 overflow-hidden transition-all duration-200 ${
              sfxExpanded ? 'max-w-[160px] opacity-100 scale-100 pr-0.5' : 'max-w-0 opacity-0 scale-90 pointer-events-none'
            }`}
          >
            {CLASSROOM_SFX_ITEMS.map((sfx) => {
              const SfxIcon = sfx.Icon;
              const label = isZh ? sfx.labelZh : sfx.labelEn;
              return (
                <button
                  key={sfx.id}
                  type="button"
                  data-testid={`floating-sfx-${sfx.id}`}
                  onClick={() => {
                    try {
                      sfx.fn();
                    } catch {}
                  }}
                  title={label}
                  aria-label={label}
                  className={`w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 ${sfx.bgHover} flex items-center justify-center cursor-pointer active:scale-90 transition`}
                >
                  <SfxIcon className={`w-4 h-4 ${sfx.iconColor}`} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 可拖曳懸浮課堂工具膠囊按鈕 */}
      {!isOpen && (
        <button
          type="button"
          data-testid="classroom-dock-toggle"
          onPointerDown={(e) => startDockDrag(e, 116, 40)}
          onPointerMove={moveDockDrag}
          onPointerUp={endDockDrag}
          onPointerCancel={endDockDrag}
          onClick={() => {
            if (dockMovedRef.current) {
              dockMovedRef.current = false;
              return;
            }
            openDrawer();
          }}
          style={{ left: dockPos.x, top: dockPos.y }}
          title={isZh ? '拖曳擺放，或點擊展開霧臺課堂工具列' : 'Drag or open Classroom Dock'}
          className="fixed z-40 px-2.5 py-2 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-xl border border-white/25 backdrop-blur-md flex items-center gap-1.5 text-xs font-black cursor-grab active:cursor-grabbing touch-none select-none transition-colors"
        >
          <GripVertical className="w-3.5 h-3.5 opacity-75" />
          <Wrench className="w-4 h-4" />
          <span className="hidden sm:inline">{isZh ? '課堂工具' : 'Tools'}</span>
        </button>
      )}

      {/* 半透明毛玻璃可全屏自由拖曳懸浮抽屜面板（保持掛載以保留連線室房號與學生名單） */}
      <aside
        ref={drawerRef}
        data-testid="classroom-dock-drawer"
        style={{ left: drawerPos.x, top: drawerPos.y, width: drawerWidth, maxHeight: drawerMaxHeight }}
        className={
          isOpen
            ? 'fixed z-40 rounded-2xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/50 dark:border-slate-700/60 shadow-2xl flex flex-col overflow-hidden'
            : 'hidden'
        }
      >
          {/* 頂部拖曳把手與收合按鈕 */}
          <div
            data-testid="classroom-dock-drag-handle"
            onPointerDown={startDrawerDrag}
            onPointerMove={moveDrawerDrag}
            onPointerUp={endDrawerDrag}
            onPointerCancel={endDrawerDrag}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 backdrop-blur-md text-white flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
          >
            <div className="flex items-center gap-2 font-black text-sm">
              <GripHorizontal className="w-4 h-4 text-white/75" />
              <Wrench className="w-4 h-4 text-amber-200" />
              <span>{isZh ? '霧臺課堂萬用工具列' : 'Classroom Toolkit'}</span>
            </div>
            <button
              type="button"
              data-no-drag="true"
              data-testid="classroom-dock-close"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 cursor-pointer"
              aria-label={isZh ? '收起工具列' : 'Close Dock'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 五大工具分頁 */}
          <div className="grid grid-cols-5 gap-1 p-1.5 bg-slate-100/70 dark:bg-slate-800/70 border-b border-white/40 dark:border-slate-700/60 shrink-0 text-[11px] font-black">
            {[
              { id: 'teams', labelZh: '計分', labelEn: 'Teams', Icon: Trophy },
              { id: 'timer', labelZh: '計時', labelEn: 'Timer', Icon: Timer },
              { id: 'dice', labelZh: '骰子', labelEn: 'Dice', Icon: Dices },
              { id: 'annotate', labelZh: '畫筆', labelEn: 'Pen', Icon: PenTool },
              { id: 'live', labelZh: '連線', labelEn: 'Live', Icon: Radio },
            ].map((t) => {
              const TabIcon = t.Icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  data-testid={`dock-tab-${t.id}`}
                  onClick={() => setActiveTool(t.id)}
                  className={`py-1.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-1 ${
                    activeTool === t.id
                      ? 'bg-white/95 dark:bg-slate-700/95 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-700/40'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{isZh ? t.labelZh : t.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* 工具內容捲動區 */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {/* ── 1. 守護神獸分組計分板 ── */}
            {activeTool === 'teams' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleAddTeam}
                      disabled={teams.length >= 6}
                      className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-200 font-black disabled:opacity-40 cursor-pointer"
                    >
                      + {isZh ? '加一組' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveTeam}
                      disabled={teams.length <= 2}
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black disabled:opacity-40 cursor-pointer"
                    >
                      - {isZh ? '減組' : 'Del'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPinTeamsMini((p) => !p)}
                    className={`px-2 py-1 rounded-lg border font-black flex items-center gap-1 cursor-pointer ${
                      pinTeamsMini
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {pinTeamsMini ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                    <span>{isZh ? '縮小懸浮' : 'Pin'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {teams.map((tm) => {
                    const isLeader = maxScore > 0 && tm.score === maxScore;
                    return (
                      <div
                        key={tm.id}
                        data-testid={`team-card-${tm.id}`}
                        className={`p-2.5 rounded-2xl border-2 flex items-center justify-between gap-2 transition ${
                          isLeader
                            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <WutaiAnimalIcon animal={tm.id} className="w-7 h-7 shrink-0" />
                          <input
                            type="text"
                            maxLength={12}
                            value={tm.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTeams((prev) =>
                                prev.map((x) => (x.id === tm.id ? { ...x, name: val } : x))
                              );
                            }}
                            className="w-full min-w-0 bg-transparent text-xs sm:text-sm font-black text-slate-800 dark:text-white focus:outline-none focus:underline"
                          />
                          {isLeader && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => adjustTeamScore(tm.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span
                            data-testid={`team-score-${tm.id}`}
                            className="w-8 text-center text-lg font-black text-indigo-700 dark:text-indigo-300"
                          >
                            {tm.score}
                          </span>
                          <button
                            type="button"
                            data-testid={`team-plus-${tm.id}`}
                            onClick={() => adjustTeamScore(tm.id, 1)}
                            className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1 text-xs font-black">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.correct();
                      setTeams((prev) => prev.map((t) => ({ ...t, score: t.score + 1 })));
                    }}
                    className="py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
                  >
                    {isZh ? '全班 +1' : 'All +1'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        soundEngine.win();
                        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
                      } catch {}
                    }}
                    className="py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{isZh ? '頒獎' : 'Celebrate'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })))}
                    className="py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    {isZh ? '歸零' : 'Reset'}
                  </button>
                </div>
              </div>
            )}

            {/* ── 2. 大字視覺計時器／碼錶 ── */}
            {activeTool === 'timer' && (
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-black">
                    <button
                      type="button"
                      onClick={() => {
                        setTimerRunning(false);
                        setTimerMode('countdown');
                        setTimerSeconds(countdownTotal);
                      }}
                      className={`px-3 py-1 rounded-lg cursor-pointer ${
                        timerMode === 'countdown' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      {isZh ? '倒數計時' : 'Countdown'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTimerRunning(false);
                        setTimerMode('stopwatch');
                        setTimerSeconds(0);
                      }}
                      className={`px-3 py-1 rounded-lg cursor-pointer ${
                        timerMode === 'stopwatch' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      {isZh ? '正計時碼錶' : 'Stopwatch'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPinTimerMini((p) => !p)}
                    className={`px-2 py-1 rounded-lg border text-xs font-black flex items-center gap-1 cursor-pointer ${
                      pinTimerMini
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {pinTimerMini ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                    <span>{isZh ? '懸浮' : 'Pin'}</span>
                  </button>
                </div>

                {/* SVG 進度圓環 */}
                <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-800" />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={326.7}
                      strokeDashoffset={326.7 * (1 - timerPct / 100)}
                      className={`transition-all duration-500 ${
                        timerMode === 'countdown' && timerSeconds <= 10
                          ? 'text-rose-500'
                          : 'text-indigo-500'
                      }`}
                    />
                  </svg>
                  <div
                    data-testid="classroom-timer-display"
                    className={`absolute font-mono text-4xl font-black ${
                      timerMode === 'countdown' && timerSeconds <= 10 && timerSeconds > 0
                        ? 'text-rose-600 animate-pulse'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {formatSeconds(timerSeconds)}
                  </div>
                </div>

                {timerMode === 'countdown' && (
                  <div className="flex flex-wrap justify-center gap-1.5 text-xs font-black">
                    {[30, 60, 90, 120, 180, 300].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setPresetCountdown(sec)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setTimerSeconds((s) => s + 10);
                        setCountdownTotal((c) => Math.max(c, timerSeconds + 10));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 cursor-pointer"
                    >
                      +10s
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    data-testid="classroom-timer-start-btn"
                    onClick={() => setTimerRunning((r) => !r)}
                    className={`px-6 py-2.5 rounded-2xl text-white font-black text-sm flex items-center gap-1.5 shadow-sm cursor-pointer ${
                      timerRunning ? 'bg-amber-500 hover:bg-amber-400' : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{timerRunning ? (isZh ? '暫停' : 'Pause') : isZh ? '開始' : 'Start'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerSeconds(timerMode === 'countdown' ? countdownTotal : 0);
                    }}
                    className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                    aria-label="Reset timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── 3. 立體 3D 骰子 ── */}
            {activeTool === 'dice' && (
              <div className="space-y-4 text-center">
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-black">
                  {[
                    { id: 'single', labelZh: '單骰 1-6', labelEn: '1 Die' },
                    { id: 'double', labelZh: '雙骰 2-12', labelEn: '2 Dice' },
                    { id: 'voice', labelZh: '英語指令骰', labelEn: 'Voice' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDiceMode(m.id)}
                      className={`py-1.5 rounded-lg cursor-pointer ${
                        diceMode === m.id ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      {isZh ? m.labelZh : m.labelEn}
                    </button>
                  ))}
                </div>

                <div className="py-6 flex items-center justify-center gap-5 [perspective:600px]">
                  {diceMode !== 'voice' ? (
                    <>
                      <div
                        data-testid="classroom-dice-face"
                        className={`w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl flex items-center justify-center text-5xl font-black border-4 border-white/40 transition-transform duration-500 ${
                          diceRolling ? 'animate-spin scale-110' : ''
                        }`}
                      >
                        {diceResult.d1}
                      </div>
                      {diceMode === 'double' && (
                        <div
                          className={`w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-xl flex items-center justify-center text-5xl font-black border-4 border-white/40 transition-transform duration-500 ${
                            diceRolling ? 'animate-spin scale-110' : ''
                          }`}
                        >
                          {diceResult.d2}
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      data-testid="classroom-dice-face"
                      className={`w-44 h-28 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl flex flex-col items-center justify-center gap-1 border-4 border-white/50 transition-transform duration-500 ${
                        diceRolling ? 'animate-bounce scale-105' : ''
                      }`}
                    >
                      {(() => {
                        const DiceIcon = VOICE_DICE_FACES[diceResult.voiceIdx].Icon;
                        return <DiceIcon className="w-7 h-7" />;
                      })()}
                      <span className="text-xl font-black">
                        {VOICE_DICE_FACES[diceResult.voiceIdx].label}
                      </span>
                      <span className="text-xs font-bold opacity-90">
                        {VOICE_DICE_FACES[diceResult.voiceIdx].zh}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  data-testid="classroom-dice-roll-btn"
                  onClick={handleRollDice}
                  disabled={diceRolling}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-base shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Dices className="w-5 h-5" />
                  <span>{diceRolling ? (isZh ? '擲骰中...' : 'Rolling...') : isZh ? '擲出骰子！' : 'Roll Dice!'}</span>
                </button>
              </div>
            )}

            {/* ── 4. 螢幕重點畫筆 & 課室音效 ── */}
            {activeTool === 'annotate' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                      <PenTool className="w-4 h-4 text-rose-500" />
                      <span>{isZh ? '螢幕重點標註畫筆層' : 'Screen Annotation Pen'}</span>
                    </span>
                    <button
                      type="button"
                      data-testid="classroom-annotation-toggle"
                      onClick={() => {
                        setAnnotationEnabled((v) => !v);
                        setIsOpen(false);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer ${
                        annotationEnabled ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {annotationEnabled ? (isZh ? '關閉畫筆' : 'Turn Off') : isZh ? '開啟畫筆' : 'Enable Pen'}
                    </button>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {isZh
                      ? '預設關閉以避免干擾大屏原廠畫筆；開啟後可直接於單字／句型上方畫線圈重點。'
                      : 'Off by default so display native pens work seamlessly.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-black text-slate-500 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-indigo-500" />
                      <span>{isZh ? '課室互動音效盤' : 'Classroom Soundboard'}</span>
                    </div>
                    <button
                      type="button"
                      data-testid="pin-sfx-mini-btn"
                      onClick={() => {
                        setPinSfxMini((p) => !p);
                        setSfxExpanded(true);
                      }}
                      className={`px-2 py-1 rounded-lg border text-xs font-black flex items-center gap-1 cursor-pointer ${
                        pinSfxMini
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {pinSfxMini ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                      <span>{isZh ? '懸浮圖示' : 'Float'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {CLASSROOM_SFX_ITEMS.map((sfx) => {
                      const SfxIcon = sfx.Icon;
                      const label = isZh ? sfx.labelZh : sfx.labelEn;
                      return (
                        <button
                          key={sfx.id}
                          type="button"
                          onClick={() => {
                            try {
                              sfx.fn();
                            } catch {}
                          }}
                          className="py-2.5 px-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 text-xs font-black text-slate-800 dark:text-slate-100 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <SfxIcon className={`w-4 h-4 ${sfx.iconColor}`} />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── 5. QR Code 課堂即時連線室（常駐掛載避免切換分頁時換房清空） ── */}
            <div className={activeTool === 'live' ? '' : 'hidden'}>
              <LiveClassroomPanel lang={lang} />
            </div>
          </div>
        </aside>
    </>
  );
}

export default ClassroomDock;
