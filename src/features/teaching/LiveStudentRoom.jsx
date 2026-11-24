import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Home, Radio, Zap, CheckCircle2, ShieldAlert, Send, BarChart3, Trophy, Target, Sparkles } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useStudent } from '../../context/StudentContext';
import { GRADE_OPTIONS, CLASS_OPTIONS, formatStudentId, parseStudentId } from '../../utils/studentIdHelper';
import { formatSeatCodeLabel, normalizeSeatCode } from '../../utils/localRoster';
import { soundEngine } from '../../services/audio';

export function LiveStudentRoom({ initialRoom = '', onBack }) {
  const { currentStudent } = useStudent();
  const initialParsed = useMemo(() => {
    const sid = currentStudent?.student_id;
    const p = parseStudentId(sid);
    if (p.isValid && !p.isGuest) return p;
    return { grade: '05', classNum: '01', seat: '01', isValid: false };
  }, [currentStudent]);

  const [roomCode, setRoomCode] = useState(() => String(initialRoom || '').trim());
  const [grade, setGrade] = useState(initialParsed.grade);
  const [classNum, setClassNum] = useState(initialParsed.classNum);
  const [seatNum, setSeatNum] = useState(initialParsed.seat);
  const seatCode = useMemo(() => formatStudentId(grade, classNum, seatNum), [grade, classNum, seatNum]);
  const seatLabel = useMemo(() => formatSeatCodeLabel(seatCode), [seatCode]);
  const [joined, setJoined] = useState(false);
  const [safetyError, setSafetyError] = useState('');

  const [teacherState, setTeacherState] = useState({
    activity: 'draw',
    pollOptions: ['A', 'B', 'C', 'D'],
    buzzerOpen: false,
    buzzerWinner: null,
    drawnResult: null,
  });
  const [myVote, setMyVote] = useState('');
  const [hasBuzzed, setHasBuzzed] = useState(false);

  const clientIdRef = useRef(
    `stu_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`
  );
  const channelRef = useRef(null);

  useEffect(() => {
    if (!joined || !roomCode) return undefined;
    const ch = supabase.channel(`wutai_live_${roomCode}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = ch;

    ch.on('broadcast', { event: 'teacher_state' }, ({ payload }) => {
      if (!payload) return;
      setTeacherState((prev) => {
        if (payload.buzzerOpen && !prev.buzzerOpen) {
          setHasBuzzed(false);
        }
        if (payload.activity === 'poll' && prev.activity !== 'poll') {
          setMyVote('');
        }
        return { ...prev, ...payload };
      });
    });

    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        ch.send({
          type: 'broadcast',
          event: 'student_join',
          payload: { id: clientIdRef.current, seatCode },
        }).catch(() => {});
      }
    });

    return () => {
      supabase.removeChannel(ch);
      if (channelRef.current === ch) channelRef.current = null;
    };
  }, [joined, roomCode, seatCode]);

  const handleJoin = (e) => {
    e.preventDefault();
    const cleanRoom = roomCode.trim();
    if (!/^\d{4}$/.test(cleanRoom)) {
      setSafetyError('請輸入 4 位數字房間代碼！');
      return;
    }
    if (!normalizeSeatCode(seatCode)) {
      setSafetyError('請選擇有效的年級、班級與座號！');
      return;
    }
    setSafetyError('');
    setJoined(true);
  };

  const handleVote = (option) => {
    if (!channelRef.current) return;
    setMyVote(option);
    try {
      soundEngine.click();
    } catch {}
    channelRef.current
      .send({
        type: 'broadcast',
        event: 'student_vote',
        payload: { id: clientIdRef.current, seatCode, option },
      })
      .catch(() => {});
  };

  const handleBuzz = () => {
    if (!channelRef.current || !teacherState.buzzerOpen || hasBuzzed) return;
    setHasBuzzed(true);
    try {
      soundEngine.correct();
    } catch {}
    channelRef.current
      .send({
        type: 'broadcast',
        event: 'student_buzz',
        payload: { id: clientIdRef.current, seatCode },
      })
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      <header className="px-4 py-3 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center gap-1.5 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>回首頁</span>
        </button>
        <div className="flex items-center gap-1.5 text-sm font-black text-indigo-700 dark:text-indigo-300">
          <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>霧臺課堂即時互動室</span>
        </div>
        <div className="w-16" />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        {!joined ? (
          <form
            onSubmit={handleJoin}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4"
          >
            <h2 className="text-xl font-black text-center text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Radio className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>加入老師的課堂連線室</span>
            </h2>

            {safetyError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-black flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{safetyError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 dark:text-slate-300">
                4 碼教室代碼
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="例如：4829"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center text-2xl font-black tracking-widest"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-600 dark:text-slate-300">
                班級座號（僅傳送座號，姓名不進雲端）
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  aria-label="年級"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="px-2 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black"
                >
                  {GRADE_OPTIONS.filter((g) => !g.isGuest).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.zh}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="班級"
                  value={classNum}
                  onChange={(e) => setClassNum(e.target.value)}
                  className="px-2 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black"
                >
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.zh}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="座號"
                  value={seatNum}
                  onChange={(e) => setSeatNum(e.target.value)}
                  className="px-2 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black"
                >
                  {Array.from({ length: 35 }, (_, i) => String(i + 1).padStart(2, '0')).map((s) => (
                    <option key={s} value={s}>
                      {parseInt(s, 10)} 號
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-center text-xs font-black text-indigo-600 dark:text-indigo-300 pt-0.5">
                將以座號加入：{seatLabel}（{seatCode}）
              </div>
            </div>

            <button
              type="submit"
              data-testid="live-student-join-btn"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-black text-base shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>立即進入教室</span>
            </button>
          </form>
        ) : (
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-5 text-center">
            <div className="flex items-center justify-between text-xs font-black text-slate-500">
              <span>教室 {roomCode}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {seatLabel}（{seatCode}）
              </span>
            </div>

            {teacherState.activity === 'poll' ? (
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>請點選你的答案投票！</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(teacherState.pollOptions || ['A', 'B', 'C', 'D']).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleVote(opt)}
                      className={`py-6 rounded-2xl border-2 text-2xl font-black cursor-pointer transition active:scale-95 ${
                        myVote === opt
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {myVote && (
                  <p className="text-xs font-black text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>已投給 {myVote}（可改投其他選項）</span>
                  </p>
                )}
              </div>
            ) : teacherState.activity === 'buzzer' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>搶答準備！</span>
                </h3>
                <button
                  type="button"
                  disabled={!teacherState.buzzerOpen || hasBuzzed}
                  onClick={handleBuzz}
                  className={`w-48 h-48 mx-auto rounded-full font-black text-2xl shadow-xl flex flex-col items-center justify-center gap-2 transition ${
                    !teacherState.buzzerOpen || hasBuzzed
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-br from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white cursor-pointer active:scale-90 animate-pulse'
                  }`}
                >
                  <Zap className="w-12 h-12" />
                  <span>{hasBuzzed ? '已搶答！' : teacherState.buzzerOpen ? '搶答！' : '等待開題'}</span>
                </button>
                {teacherState.buzzerWinner && (
                  <p className="text-sm font-black text-indigo-600 dark:text-indigo-300 flex items-center justify-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>
                      最快搶答：{formatSeatCodeLabel(teacherState.buzzerWinner.seatCode || teacherState.buzzerWinner.name)}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <div className="py-8 space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                  <Target className="w-7 h-7" />
                </div>
                <p className="text-base font-black text-slate-800 dark:text-white">
                  已連線至霧臺英語教室大螢幕！
                </p>
                <p className="text-xs font-bold text-slate-500">
                  當老師開啟投票或搶答時，畫面會自動切換出現作答按鈕。
                </p>
                {teacherState.drawnResult && (
                  <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-black flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>本輪幸運兒：{formatSeatCodeLabel(teacherState.drawnResult)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default LiveStudentRoom;
