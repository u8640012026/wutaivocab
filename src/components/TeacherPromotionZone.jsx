import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users, AlertTriangle, CheckCircle2, RefreshCw, KeyRound,
  GraduationCap, ArrowRight, ShieldAlert, Save, Sparkles, Archive
} from 'lucide-react';
import {
  fetchAllStudentProfilesForTeacher,
  updateStudentTransferPin,
  executeTeacherBatchPromotion
} from '../services/supabase';
import {
  getDefaultPromotionPlan,
  detectPromotionConflicts,
  getPlannedTargetId,
  getTransferPinFromProfile,
  formatSeatLabel,
  getCurrentAcademicYear,
  isValidTransferPin
} from '../services/accountTransferHelper';
import { computeGrimoireSummaryFromData } from '../utils/grimoireHelper';
import { GRADE_OPTIONS, CLASS_OPTIONS, pad2 } from '../utils/studentIdHelper';

const REGULAR_GRADES = GRADE_OPTIONS.filter(g => !g.isGuest);
const SEAT_OPTIONS = Array.from({ length: 35 }, (_, i) => pad2(i + 1));

export const TeacherPromotionZone = ({ onNotify }) => {
  const [loading, setLoading] = useState(true);
  const [allProfiles, setAllProfiles] = useState([]);
  const [activeProfiles, setActiveProfiles] = useState([]);
  const [archivedProfiles, setArchivedProfiles] = useState([]);
  const [plannedRows, setPlannedRows] = useState([]);
  const [selectedGradeTab, setSelectedGradeTab] = useState('01');
  const [archiveGrimoireOnMove, setArchiveGrimoireOnMove] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [confirmExecute, setConfirmExecute] = useState(false);
  const [showArchivedList, setShowArchivedList] = useState(false);

  // 4 碼換機密碼即時編輯狀態
  const [editingPinId, setEditingPinId] = useState(null);
  const [pinDraft, setPinDraft] = useState('');
  const [savingPinId, setSavingPinId] = useState(null);

  const academicYear = getCurrentAcademicYear();

  const loadRoster = useCallback(async () => {
    setLoading(true);
    setConfirmExecute(false);
    try {
      const { allProfiles: all, activeProfiles: active, archivedProfiles: archived } =
        await fetchAllStudentProfilesForTeacher();
      setAllProfiles(all);
      setActiveProfiles(active);
      setArchivedProfiles(archived);
      setPlannedRows(active.map(p => getDefaultPromotionPlan(p)));

      // 自動選中有學生的第一個年級
      const firstPopulatedGrade = REGULAR_GRADES.find(g =>
        active.some(p => pad2(p.grade) === g.id)
      );
      if (firstPopulatedGrade) {
        setSelectedGradeTab(prev =>
          active.some(p => pad2(p.grade) === prev) ? prev : firstPopulatedGrade.id
        );
      }
    } catch (err) {
      if (onNotify) onNotify('error', '讀取全校學生清單失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const profileMap = useMemo(() => {
    const map = new Map();
    activeProfiles.forEach(p => map.set(String(p.student_id), p));
    return map;
  }, [activeProfiles]);

  // 即時全域衝號偵測（同時核對批次內互撞＋跨年級現有未移動帳號）
  const conflictResult = useMemo(() => {
    return detectPromotionConflicts(plannedRows, allProfiles);
  }, [plannedRows, allProfiles]);

  const gradeStats = useMemo(() => {
    const stats = {};
    REGULAR_GRADES.forEach((g) => {
      const rowsInGrade = plannedRows.filter(r => r.originalGrade === g.id);
      const conflictCount = rowsInGrade.filter(r => Boolean(conflictResult.conflictMapBySourceId[r.sourceId])).length;
      stats[g.id] = {
        total: rowsInGrade.length,
        conflicts: conflictCount
      };
    });
    return stats;
  }, [plannedRows, conflictResult]);

  const visibleRows = useMemo(() => {
    if (selectedGradeTab === 'all') return plannedRows;
    return plannedRows.filter(r => r.originalGrade === selectedGradeTab);
  }, [plannedRows, selectedGradeTab]);

  const actionSummary = useMemo(() => {
    let moveCount = 0;
    let keepCount = 0;
    let graduateCount = 0;
    plannedRows.forEach((r) => {
      if (r.action === 'graduate') {
        graduateCount++;
      } else if (r.action === 'move') {
        const tgt = getPlannedTargetId(r);
        if (tgt && tgt !== r.sourceId) moveCount++;
        else keepCount++;
      } else {
        keepCount++;
      }
    });
    return { moveCount, keepCount, graduateCount };
  }, [plannedRows]);

  const updateRow = (sourceId, patch) => {
    setConfirmExecute(false);
    setPlannedRows(prev => prev.map(row => (
      row.sourceId === sourceId ? { ...row, ...patch } : row
    )));
  };

  const applyPresetPromotion = () => {
    setConfirmExecute(false);
    setArchiveGrimoireOnMove(true);
    setPlannedRows(activeProfiles.map(p => getDefaultPromotionPlan(p)));
    if (onNotify) onNotify('success', '已套用預設升年級建議（1～5 年級 +1、6 年級畢業封存）。');
  };

  const applyPresetMidSemester = () => {
    setConfirmExecute(false);
    setArchiveGrimoireOnMove(false);
    setPlannedRows(activeProfiles.map(p => ({
      ...getDefaultPromotionPlan(p),
      action: 'keep',
      targetGrade: pad2(p.grade),
      targetClass: pad2(p.class),
      targetSeat: pad2(p.seat)
    })));
    if (onNotify) onNotify('success', '已切換為「學期中換號模式」（全員維持原號，僅需修改要換座號的學生）。');
  };

  const handleSavePin = async (studentId) => {
    const clean = pinDraft.replace(/\D/g, '').slice(0, 4);
    if (!isValidTransferPin(clean)) {
      if (onNotify) onNotify('error', '換機密碼必須為 4 位數字（例如 1234）。');
      return;
    }
    setSavingPinId(studentId);
    try {
      const res = await updateStudentTransferPin(studentId, clean);
      if (res.success) {
        setActiveProfiles(prev => prev.map(p => (
          p.student_id === studentId
            ? { ...p, daily_quest: { ...(p.daily_quest || {}), _transfer_pin: clean } }
            : p
        )));
        setEditingPinId(null);
        setPinDraft('');
        if (onNotify) onNotify('success', `已為 ${formatSeatLabel(studentId)} 設定 4 碼換機密碼：${clean}`);
      } else if (onNotify) {
        onNotify('error', res.error || '設定密碼失敗');
      }
    } finally {
      setSavingPinId(null);
    }
  };

  const handleExecuteBatch = async () => {
    if (conflictResult.hasConflicts) {
      if (onNotify) onNotify('error', '仍有座號衝突，請先排除所有紅燈項目後再執行。');
      return;
    }
    if (actionSummary.moveCount === 0 && actionSummary.graduateCount === 0) {
      if (onNotify) onNotify('error', '目前沒有需要移動或畢業封存的學生項目。');
      return;
    }
    setIsExecuting(true);
    try {
      const res = await executeTeacherBatchPromotion(plannedRows, allProfiles, {
        archiveGrimoire: archiveGrimoireOnMove,
        academicYear
      });
      if (res.success) {
        if (onNotify) {
          onNotify('success', `✅ 轉換完成！共升級／搬移 ${res.movedCount} 位學生、封存釋出 ${res.archivedCount} 個舊／畢業座號。`);
        }
        setConfirmExecute(false);
        await loadRoster();
      } else if (onNotify) {
        onNotify('error', res.error || '轉換失敗');
      }
    } catch (err) {
      if (onNotify) onNotify('error', '批次轉換發生例外：' + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn" data-teacher-promotion-zone="true">
      {/* ── 頂部控制與模式說明卡 ── */}
      <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-violet-500" />
              <span>學年升級與座號移轉中心（{academicYear} 學年度）</span>
            </h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              預設建議「年級 +1、班級座號維持」；點擊即可任意改班改號，系統即時核對衝號並支援 1↔2 互換零覆蓋。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={applyPresetPromotion}
              className="px-3 py-2 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-200 border border-violet-300 dark:border-violet-700 text-xs font-black hover:bg-violet-200 dark:hover:bg-violet-900/70 transition cursor-pointer"
            >
              🚀 預填年級 +1 建議
            </button>
            <button
              type="button"
              onClick={applyPresetMidSemester}
              className="px-3 py-2 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-200 border border-sky-300 dark:border-sky-700 text-xs font-black hover:bg-sky-200 dark:hover:bg-sky-900/70 transition cursor-pointer"
            >
              ✏️ 學期中換號模式
            </button>
            <button
              type="button"
              onClick={loadRoster}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 text-xs font-black hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>重整名單</span>
            </button>
          </div>
        </div>

        {/* 跨學年八星封存開關 ＋ 執行轉換動作列 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={archiveGrimoireOnMove}
              onChange={(e) => setArchiveGrimoireOnMove(e.target.checked)}
              className="w-4 h-4 rounded accent-violet-600"
            />
            <span>跨學年升級時封存本學年八星至「歷屆星辰勳章牆」，新學年重啟八星挑戰（學期中單純換號請取消勾選）</span>
          </label>

          <div className="flex items-center gap-2">
            {!confirmExecute ? (
              <button
                type="button"
                data-promotion-execute-btn="true"
                disabled={conflictResult.hasConflicts || isExecuting || (actionSummary.moveCount === 0 && actionSummary.graduateCount === 0)}
                onClick={() => setConfirmExecute(true)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md transition-all ${
                  conflictResult.hasConflicts
                    ? 'bg-rose-200 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-400 cursor-not-allowed'
                    : (actionSummary.moveCount === 0 && actionSummary.graduateCount === 0)
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white cursor-pointer active:scale-95'
                }`}
              >
                {conflictResult.hasConflicts ? (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>尚有 {conflictResult.conflictCount} 處衝號衝突，禁止轉換</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>執行轉換（移轉 {actionSummary.moveCount} 人 / 畢業 {actionSummary.graduateCount} 人）</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/60 border border-amber-400 rounded-xl px-3 py-1.5">
                <span className="text-xs font-black text-amber-800 dark:text-amber-200">
                  確定寫入雲端？
                </span>
                <button
                  type="button"
                  disabled={isExecuting}
                  onClick={handleExecuteBatch}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer"
                >
                  {isExecuting ? '寫入中...' : '確認執行'}
                </button>
                <button
                  type="button"
                  disabled={isExecuting}
                  onClick={() => setConfirmExecute(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 即時衝號衝突總警示條 ── */}
      {conflictResult.hasConflicts && (
        <div
          data-promotion-conflict-banner="true"
          className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-500 text-rose-900 dark:text-rose-100 shadow-lg space-y-1.5"
        >
          <div className="flex items-center gap-2 font-black text-sm text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
            <span>⚠️ 偵測到 {conflictResult.conflictCount} 處學生座號衝突！在解除所有衝號前，系統已鎖定轉換按鈕：</span>
          </div>
          <ul className="text-xs font-bold space-y-1 pl-6 list-disc">
            {conflictResult.conflictDetails.map((item) => (
              <li key={item.targetId}>
                目標座號 <span className="font-mono font-black underline">{item.targetLabel} ({item.targetId})</span> 重複：
                {item.occupants.map(o => o.label).join(' ⚔️ ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── 年級展開切換列（一～六年級） ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedGradeTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer flex items-center gap-1.5 ${
            selectedGradeTab === 'all'
              ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>全校 ({plannedRows.length})</span>
        </button>
        {REGULAR_GRADES.map((g) => {
          const st = gradeStats[g.id] || { total: 0, conflicts: 0 };
          const isActive = selectedGradeTab === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGradeTab(g.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer flex items-center gap-1.5 ${
                st.conflicts > 0
                  ? (isActive
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                    : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-400')
                  : isActive
                  ? 'bg-violet-600 text-white border-violet-500 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{g.zh}</span>
              <span className="opacity-80">({st.total})</span>
              {st.conflicts > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-rose-700 text-[10px] font-black">
                  衝突 {st.conflicts}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 學生升級與座號編輯主表 ── */}
      {loading ? (
        <div className="p-10 text-center bg-white/80 dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-sm">
          正在從雲端載入全校學生名冊...
        </div>
      ) : visibleRows.length === 0 ? (
        <div className="p-10 text-center bg-white/80 dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-sm">
          此年級目前沒有現役雲端學生紀錄。
        </div>
      ) : (
        <div className="space-y-2">
          {visibleRows.map((row) => {
            const profile = profileMap.get(row.sourceId) || {};
            const conflict = conflictResult.conflictMapBySourceId[row.sourceId];
            const targetId = getPlannedTargetId(row);
            const savedPin = getTransferPinFromProfile(profile);
            const grimoireSummary = computeGrimoireSummaryFromData(profile.daily_quest?._grimoire || {});
            const isEditingPin = editingPinId === row.sourceId;

            return (
              <div
                key={row.sourceId}
                data-promotion-row={row.sourceId}
                data-promotion-conflict={conflict ? 'true' : 'false'}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all ${
                  conflict
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/30 shadow-md'
                    : row.action === 'graduate'
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300/70 dark:border-amber-700/60'
                    : 'bg-white/95 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* 左側：原座號、暱稱、資產、4 碼密碼 */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="px-2.5 py-1 rounded-xl bg-slate-900 text-white font-mono text-xs font-black">
                      {formatSeatLabel(row.sourceId)}
                      <span className="ml-1.5 text-slate-400">({row.sourceId})</span>
                    </div>
                    <span className="font-black text-sm text-slate-800 dark:text-white">
                      {row.nickname}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                      🪙 {profile.coins ?? 0}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                      🧭 {profile.quest_points ?? 0}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                      ⭐ {grimoireSummary.masteredStars}/8 星
                    </span>

                    {/* 4 碼換機密碼即時檢視／設定 */}
                    {isEditingPin ? (
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-xl border border-indigo-400">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          value={pinDraft}
                          onChange={(e) => setPinDraft(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="4碼數字"
                          className="w-16 bg-transparent text-xs font-mono font-black text-slate-900 dark:text-white outline-none text-center"
                        />
                        <button
                          type="button"
                          disabled={savingPinId === row.sourceId}
                          onClick={() => handleSavePin(row.sourceId)}
                          className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-black cursor-pointer flex items-center gap-0.5"
                        >
                          <Save className="w-3 h-3" />
                          <span>存</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingPinId(null); setPinDraft(''); }}
                          className="px-1.5 py-0.5 text-[10px] font-bold text-slate-500 cursor-pointer"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setEditingPinId(row.sourceId); setPinDraft(savedPin || ''); }}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-black border flex items-center gap-1 cursor-pointer transition ${
                          savedPin
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-indigo-400'
                        }`}
                        title="點擊設定或重設學生的 4 碼換機密碼"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>{savedPin ? `密碼 ${savedPin}` : '設 4 碼密碼'}</span>
                      </button>
                    )}
                  </div>

                  {/* 右側：目標升級動作與目標班級座號選擇器 */}
                  <div className="flex flex-wrap items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />
                    <select
                      aria-label={`${row.sourceId} 轉換動作`}
                      value={row.action}
                      onChange={(e) => updateRow(row.sourceId, { action: e.target.value })}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white cursor-pointer"
                    >
                      <option value="move">升級／換座號</option>
                      <option value="keep">維持原座號</option>
                      <option value="graduate">🎓 畢業封存</option>
                    </select>

                    {row.action === 'move' && (
                      <>
                        <select
                          aria-label={`${row.sourceId} 目標年級`}
                          value={row.targetGrade}
                          onChange={(e) => updateRow(row.sourceId, { targetGrade: e.target.value })}
                          className="px-2 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white cursor-pointer"
                        >
                          {REGULAR_GRADES.map(g => (
                            <option key={g.id} value={g.id}>{g.zh}</option>
                          ))}
                        </select>

                        <select
                          aria-label={`${row.sourceId} 目標班級`}
                          value={row.targetClass}
                          onChange={(e) => updateRow(row.sourceId, { targetClass: e.target.value })}
                          className="px-2 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white cursor-pointer"
                        >
                          {CLASS_OPTIONS.map(c => (
                            <option key={c.id} value={c.id}>{c.zh}</option>
                          ))}
                        </select>

                        <select
                          aria-label={`${row.sourceId} 目標座號`}
                          value={row.targetSeat}
                          onChange={(e) => updateRow(row.sourceId, { targetSeat: e.target.value })}
                          className="px-2 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white cursor-pointer"
                        >
                          {SEAT_OPTIONS.map(s => (
                            <option key={s} value={s}>{s} 號</option>
                          ))}
                        </select>
                      </>
                    )}

                    {/* 目標結果預覽徽章 */}
                    {row.action === 'graduate' ? (
                      <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                        🎓 封存並釋出座號
                      </span>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-xl font-mono text-xs font-black flex items-center gap-1 ${
                          conflict
                            ? 'bg-rose-600 text-white'
                            : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {conflict ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{targetId}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 單列紅燈衝突明細 */}
                {conflict && (
                  <div className="mt-2 pt-2 border-t border-rose-300 dark:border-rose-700 text-xs font-black text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      衝號衝突！目標 {conflict.targetLabel} ({conflict.targetId}) 與 {conflict.peers.map(p => p.label).join('、')} 重複，請修改其中一方座號。
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 已轉移／已畢業封存紀錄折疊區 ── */}
      {archivedProfiles.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
          <button
            type="button"
            onClick={() => setShowArchivedList(v => !v)}
            className="w-full flex items-center justify-between text-xs font-black text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Archive className="w-4 h-4 text-slate-400" />
              <span>已封存／已轉移歷史座號紀錄（{archivedProfiles.length} 筆）</span>
            </span>
            <span>{showArchivedList ? '收合 ▲' : '展開 ▼'}</span>
          </button>
          {showArchivedList && (
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {archivedProfiles.map((p) => {
                const meta = p.daily_quest?._transfer_meta || {};
                const status = p.daily_quest?._archived_status;
                return (
                  <div key={p.student_id} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="font-black text-slate-700 dark:text-slate-200 flex items-center justify-between">
                      <span>{formatSeatLabel(p.student_id)} ({p.nickname})</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {status === 'graduated' ? '🎓 已畢業' : '🔄 已轉移'}
                      </span>
                    </div>
                    {meta.transferredTo && (
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        → 移轉至 {formatSeatLabel(meta.transferredTo)} ({meta.transferredTo})
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
