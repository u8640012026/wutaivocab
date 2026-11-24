import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Radio,
  Copy,
  Check,
  Users,
  Sparkles,
  BarChart3,
  Zap,
  RotateCcw,
  QrCode,
  UserX,
  Dices,
  Target,
  Trophy,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { soundEngine, speakEnglish } from '../../services/audio';
import {
  getLocalRosterMap,
  subscribeLocalRoster,
  resolveStudentDisplay,
  normalizeSeatCode,
} from '../../utils/localRoster';
import { LocalRosterModal } from '../../components/LocalRosterModal';

const generateRoomCode = () => String(Math.floor(1000 + Math.random() * 9000));

const POLL_PRESETS = [
  { id: 'ab', labelZh: 'A / B 選項', options: ['A', 'B'] },
  { id: 'abcd', labelZh: 'A / B / C / D', options: ['A', 'B', 'C', 'D'] },
  { id: 'ox', labelZh: 'O / X 判斷', options: ['O', 'X'] },
];

export function LiveClassroomPanel({ lang = 'zh' }) {
  const isZh = lang !== 'en';
  const [roomCode, setRoomCode] = useState(() => generateRoomCode());
  const [isRoomActive, setIsRoomActive] = useState(false);
  const [liveActivity, setLiveActivity] = useState('draw'); // 'draw' | 'poll' | 'buzzer'
  const [copied, setCopied] = useState(false);

  // 連線學生名單（僅接收座號代碼，依座號昇冪排列；姓名於本機端解譯）
  const [connectedStudents, setConnectedStudents] = useState([]); // [{ id, seatCode }]
  const [localRosterMap, setLocalRosterMap] = useState(() => getLocalRosterMap());
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

  useEffect(() => {
    return subscribeLocalRoster((map) => setLocalRosterMap(map));
  }, []);

  // 抽籤設定（支援離線座號 1..N + 排除請假座號）
  const [drawSource, setDrawSource] = useState('offline'); // 'offline' | 'online'
  const [maxSeatCount, setMaxSeatCount] = useState(15);
  const [absentSeats, setAbsentSeats] = useState(() => new Set());
  const [drawnResult, setDrawnResult] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 即時投票
  const [pollPresetId, setPollPresetId] = useState('abcd');
  const [pollVotes, setPollVotes] = useState({}); // { studentId: optionLabel }

  // 全班搶答
  const [buzzerOpen, setBuzzerOpen] = useState(false);
  const [buzzerWinner, setBuzzerWinner] = useState(null); // { id, name, time }
  const [buzzerQueue, setBuzzerQueue] = useState([]);

  const channelRef = useRef(null);
  const drawTimerRef = useRef(null);

  const joinUrl = useMemo(() => {
    const base =
      typeof window !== 'undefined' &&
      window.location.origin &&
      !window.location.origin.includes('localhost') &&
      !window.location.origin.includes('127.0.0.1')
        ? window.location.origin
        : typeof window !== 'undefined'
          ? window.location.origin
          : 'https://wutaivocab.pages.dev';
    return `${base}/?view=live&room=${roomCode}`;
  }, [roomCode]);

  const qrSrc = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
        joinUrl
      )}`,
    [joinUrl]
  );

  const currentPollOptions = useMemo(
    () => POLL_PRESETS.find((p) => p.id === pollPresetId)?.options || ['A', 'B', 'C', 'D'],
    [pollPresetId]
  );

  const latestStateRef = useRef({
    liveActivity,
    currentPollOptions,
    buzzerOpen,
    buzzerWinner,
    drawnResult,
  });
  latestStateRef.current = {
    liveActivity,
    currentPollOptions,
    buzzerOpen,
    buzzerWinner,
    drawnResult,
  };

  const sanitizeBroadcastDrawn = (val) => {
    if (!val) return null;
    const seat = normalizeSeatCode(val);
    if (seat) return seat;
    const str = String(val).trim();
    return /^\d+\s*號$|^Seat\s+\d+$/i.test(str) ? str : null;
  };

  const broadcastState = useCallback((override = {}) => {
    const ch = channelRef.current;
    if (!ch) return;
    const cur = latestStateRef.current;
    const rawWinner = override.buzzerWinner !== undefined ? override.buzzerWinner : cur.buzzerWinner;
    const winnerSeat = rawWinner ? normalizeSeatCode(rawWinner.seatCode) : '';
    const safeWinner = rawWinner && winnerSeat ? { id: rawWinner.id, seatCode: winnerSeat } : null;
    const rawDrawn = override.drawnResult !== undefined ? override.drawnResult : cur.drawnResult;
    ch.send({
      type: 'broadcast',
      event: 'teacher_state',
      payload: {
        activity: override.activity ?? cur.liveActivity,
        pollOptions: override.pollOptions ?? cur.currentPollOptions,
        buzzerOpen: override.buzzerOpen ?? cur.buzzerOpen,
        buzzerWinner: safeWinner,
        drawnResult: sanitizeBroadcastDrawn(rawDrawn),
      },
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isRoomActive) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return undefined;
    }

    const ch = supabase.channel(`wutai_live_${roomCode}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = ch;

    ch.on('broadcast', { event: 'student_join' }, ({ payload }) => {
      const seatCode = normalizeSeatCode(payload?.seatCode);
      if (!payload?.id || !seatCode) return;
      setConnectedStudents((prev) => {
        const exists = prev.some((s) => s.seatCode === seatCode);
        const next = exists
          ? prev.map((s) => (s.seatCode === seatCode ? { id: payload.id, seatCode } : s))
          : [...prev, { id: payload.id, seatCode }];
        return [...next].sort((a, b) => a.seatCode.localeCompare(b.seatCode));
      });
      // 同步目前課堂狀態給剛加入的學生
      broadcastState();
    });

    ch.on('broadcast', { event: 'student_vote' }, ({ payload }) => {
      const seatCode = normalizeSeatCode(payload?.seatCode);
      if (!payload?.option || !seatCode) return;
      setPollVotes((prev) => ({ ...prev, [seatCode]: payload.option }));
    });

    ch.on('broadcast', { event: 'student_buzz' }, ({ payload }) => {
      const seatCode = normalizeSeatCode(payload?.seatCode);
      if (!payload?.id || !seatCode) return;

      if (latestStateRef.current.buzzerOpen && !latestStateRef.current.buzzerWinner) {
        const winnerObj = { id: payload.id, seatCode, at: Date.now() };
        latestStateRef.current.buzzerWinner = winnerObj;
        latestStateRef.current.buzzerOpen = false;
        setBuzzerWinner(winnerObj);
        setBuzzerOpen(false);
        try {
          soundEngine.win();
        } catch {}
        broadcastState({
          activity: 'buzzer',
          buzzerOpen: false,
          buzzerWinner: winnerObj,
        });
      }

      setBuzzerQueue((prev) =>
        prev.some((q) => q.seatCode === seatCode)
          ? prev
          : [...prev, { id: payload.id, seatCode }]
      );
    });

    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        broadcastState();
      }
    });

    return () => {
      supabase.removeChannel(ch);
      if (channelRef.current === ch) channelRef.current = null;
    };
  }, [isRoomActive, roomCode, broadcastState]);

  useEffect(() => {
    return () => {
      if (drawTimerRef.current) clearInterval(drawTimerRef.current);
    };
  }, []);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const toggleAbsentSeat = (seatNum) => {
    setAbsentSeats((prev) => {
      const next = new Set(prev);
      if (next.has(seatNum)) next.delete(seatNum);
      else next.add(seatNum);
      return next;
    });
  };

  const handleRunLuckyDraw = () => {
    if (isDrawing) return;
    if (drawSource === 'online' && connectedStudents.length === 0) {
      return;
    }

    const candidates =
      drawSource === 'online'
        ? connectedStudents.map((s) => s.seatCode)
        : Array.from({ length: maxSeatCount }, (_, i) => i + 1)
            .filter((n) => !absentSeats.has(n))
            .map((n) => (isZh ? `${n} 號` : `Seat ${n}`));

    if (candidates.length === 0) return;

    setIsDrawing(true);
    let ticks = 0;
    if (drawTimerRef.current) clearInterval(drawTimerRef.current);
    drawTimerRef.current = setInterval(() => {
      ticks += 1;
      const randomPick = candidates[Math.floor(Math.random() * candidates.length)];
      setDrawnResult(randomPick);
      try {
        soundEngine.click();
      } catch {}

      if (ticks >= 12) {
        clearInterval(drawTimerRef.current);
        drawTimerRef.current = null;
        const winner = candidates[Math.floor(Math.random() * candidates.length)];
        setDrawnResult(winner);
        setIsDrawing(false);
        try {
          soundEngine.win();
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          const spoken = resolveStudentDisplay(winner, localRosterMap).shortName;
          speakEnglish(String(spoken).replace(/號/g, ''), { rate: 0.9 });
        } catch {}
        broadcastState({ activity: 'draw', drawnResult: winner });
      }
    }, 85);
  };

  const pollTallies = useMemo(() => {
    const counts = {};
    currentPollOptions.forEach((opt) => {
      counts[opt] = 0;
    });
    Object.values(pollVotes).forEach((v) => {
      if (Object.prototype.hasOwnProperty.call(counts, v)) {
        counts[v] += 1;
      }
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { counts, total };
  }, [currentPollOptions, pollVotes]);

  return (
    <div className="space-y-3">
      {/* 連線室開關與 QR Code 區 */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Radio
              className={`w-4 h-4 ${
                isRoomActive ? 'text-emerald-500 animate-pulse' : 'text-slate-400'
              }`}
            />
            <span className="text-xs font-black text-slate-800 dark:text-white">
              {isZh ? '課堂即時連線室' : 'QR Live Room'}
            </span>
          </div>
          <button
            type="button"
            data-testid="live-room-toggle-btn"
            onClick={() => {
              soundEngine.click();
              setIsRoomActive((v) => !v);
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-black cursor-pointer transition ${
              isRoomActive
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isRoomActive ? (isZh ? '連線中 (關閉)' : 'Live (Stop)') : isZh ? '開啟連線室' : 'Start Room'}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400">
            {isZh ? '房間代碼：' : 'Code: '}
            <strong data-testid="live-room-code" className="text-base font-black text-indigo-600 dark:text-indigo-300 tracking-widest">
              {roomCode}
            </strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setRoomCode(generateRoomCode());
                setConnectedStudents([]);
                setPollVotes({});
                setBuzzerWinner(null);
              }}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold cursor-pointer"
              title={isZh ? '更換房間代碼' : 'New Code'}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              type="button"
              data-testid="live-open-roster-btn"
              onClick={() => setIsRosterModalOpen(true)}
              className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-1 cursor-pointer"
              title={isZh ? '本機匯入座號姓名對應（不上傳雲端）' : 'Local Roster'}
            >
              <Users className="w-3 h-3" />
              <span>{isZh ? '名冊' : 'Roster'}{Object.keys(localRosterMap).length > 0 ? `(${Object.keys(localRosterMap).length})` : ''}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? (isZh ? '已複製' : 'Copied') : isZh ? '複製連結' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {isRoomActive && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-xl border border-slate-200 shrink-0">
                <img src={qrSrc} alt="Live Room QR" className="w-20 h-20 object-contain" />
              </div>
              <div className="min-w-0 space-y-1 text-xs">
                <div className="flex items-center gap-1 font-black text-emerald-700 dark:text-emerald-300">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {connectedStudents.length} {isZh ? '位學生已掃碼加入' : 'joined'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {isZh
                    ? '座號依昇冪排列，姓名僅於本機端自動解譯！'
                    : 'Sorted by seat code ascending; names resolved locally!'}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 truncate">
                  <QrCode className="w-3 h-3 shrink-0" />
                  <span className="truncate">?view=live&room={roomCode}</span>
                </div>
              </div>
            </div>

            {connectedStudents.length > 0 && (
              <div
                data-testid="live-connected-students"
                className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1 border-t border-slate-200/70 dark:border-slate-700/70"
              >
                {connectedStudents.map((stu) => {
                  const resolved = resolveStudentDisplay(stu.seatCode, localRosterMap);
                  return (
                    <span
                      key={stu.id}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black text-slate-700 dark:text-slate-200"
                    >
                      {resolved.displayName}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 三合一課堂即時活動切換：抽籤 / 投票 / 搶答 */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black">
        {[
          { id: 'draw', labelZh: '抽籤', labelEn: 'Draw', icon: Dices },
          { id: 'poll', labelZh: '投票', labelEn: 'Poll', icon: BarChart3 },
          { id: 'buzzer', labelZh: '搶答', labelEn: 'Buzz', icon: Zap },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={`live-tab-${tab.id}`}
              onClick={() => {
                setLiveActivity(tab.id);
                broadcastState({ activity: tab.id });
              }}
              className={`py-1.5 rounded-lg cursor-pointer transition flex items-center justify-center gap-1 ${
                liveActivity === tab.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{isZh ? tab.labelZh : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* 活動 1：班級隨機抽籤（支援離線座號與請假排除） */}
      {liveActivity === 'draw' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <select
              value={drawSource}
              onChange={(e) => setDrawSource(e.target.value)}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              <option value="offline">{isZh ? '離線座號抽籤' : 'Seat Numbers'}</option>
              <option value="online">{isZh ? `已連線學生 (${connectedStudents.length})` : `Joined (${connectedStudents.length})`}</option>
            </select>

            {drawSource === 'offline' && (
              <label className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300">
                <span>1~</span>
                <input
                  type="number"
                  min={2}
                  max={45}
                  value={maxSeatCount}
                  onChange={(e) => setMaxSeatCount(Math.max(2, Math.min(45, Number(e.target.value) || 15)))}
                  className="w-12 px-1.5 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-black"
                />
              </label>
            )}
          </div>

          {drawSource === 'offline' && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                <UserX className="w-3 h-3" />
                <span>{isZh ? '點選座號可排除請假生：' : 'Tap to mark absent:'}</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {Array.from({ length: maxSeatCount }, (_, i) => i + 1).map((num) => {
                  const isAbsent = absentSeats.has(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => toggleAbsentSeat(num)}
                      className={`w-7 h-7 rounded-lg text-xs font-black border cursor-pointer transition ${
                        isAbsent
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-700 line-through'
                          : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div
            data-testid="live-draw-result"
            className="h-16 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/35 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-200 px-3 text-center"
          >
            {drawSource === 'online' && connectedStudents.length === 0 && !drawnResult
              ? isZh
                ? '尚無已連線學生，請先掃碼'
                : 'No online students yet'
              : drawnResult
                ? resolveStudentDisplay(drawnResult, localRosterMap).displayName
                : isZh
                  ? '準備抽籤'
                  : 'Ready'}
          </div>

          <button
            type="button"
            data-testid="live-draw-btn"
            onClick={handleRunLuckyDraw}
            disabled={isDrawing || (drawSource === 'online' && connectedStudents.length === 0)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-sm shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Target className="w-4 h-4" />
            <span>{isDrawing ? (isZh ? '抽籤中...' : 'Drawing...') : isZh ? '抽出幸運學生！' : 'Draw Student!'}</span>
          </button>
        </div>
      )}

      {/* 活動 2：即時投票 */}
      {liveActivity === 'poll' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <select
              value={pollPresetId}
              onChange={(e) => {
                setPollPresetId(e.target.value);
                setPollVotes({});
                const preset = POLL_PRESETS.find((p) => p.id === e.target.value);
                broadcastState({ activity: 'poll', pollOptions: preset?.options || ['A', 'B'] });
              }}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              {POLL_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.labelZh}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setPollVotes({});
                broadcastState({ activity: 'poll' });
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-black cursor-pointer"
            >
              {isZh ? '清除票數' : 'Reset'}
            </button>
          </div>

          <div className="space-y-2">
            {currentPollOptions.map((opt) => {
              const count = pollTallies.counts[opt] || 0;
              const pct = pollTallies.total > 0 ? Math.round((count / pollTallies.total) * 100) : 0;
              return (
                <div key={opt} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span>{opt}</span>
                    <span className="text-indigo-600 dark:text-indigo-300">
                      {count} {isZh ? '票' : ''} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 活動 3：全班搶答 */}
      {liveActivity === 'buzzer' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 space-y-3 text-center">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/35 border-2 border-rose-200 dark:border-rose-800 min-h-[82px] flex flex-col items-center justify-center">
            {buzzerWinner ? (
              <>
                <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 inline-flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{isZh ? '搶答成功！' : 'Winner!'}</span>
                </span>
                <span className="text-xl font-black text-rose-900 dark:text-rose-100 mt-0.5">
                  {resolveStudentDisplay(buzzerWinner.seatCode || buzzerWinner.name, localRosterMap).displayName}
                </span>
              </>
            ) : (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                {buzzerOpen ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isZh ? '搶答開放中！等待學生按下搶答鈕...' : 'Buzzer open! Waiting...'}</span>
                  </>
                ) : (
                  <span>{isZh ? '按下「開始搶答」讓全班同步搶答' : 'Tap Start to open buzzer'}</span>
                )}
              </span>
            )}
          </div>

          <button
            type="button"
            data-testid="live-buzzer-start-btn"
            onClick={() => {
              setBuzzerWinner(null);
              setBuzzerQueue([]);
              setBuzzerOpen(true);
              try {
                soundEngine.hintPing();
              } catch {}
              broadcastState({ activity: 'buzzer', buzzerOpen: true, buzzerWinner: null });
            }}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
          >
            {buzzerWinner || buzzerOpen ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>{isZh ? '重置並下一題搶答' : 'Reset Buzzer'}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>{isZh ? '開始搶答！' : 'Open Buzzer'}</span>
              </>
            )}
          </button>

          {buzzerQueue.length > 1 && (
            <div className="text-[11px] font-bold text-slate-400">
              {isZh ? '手速順序：' : 'Order: '}
              {buzzerQueue
                .map((q, i) => `${i + 1}.${resolveStudentDisplay(q.seatCode || q.name, localRosterMap).displayName}`)
                .join(' · ')}
            </div>
          )}
        </div>
      )}

      <LocalRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
      />
    </div>
  );
}
