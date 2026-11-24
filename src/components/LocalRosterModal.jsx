import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Upload,
  ShieldCheck,
  Trash2,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import {
  parseRosterText,
  parseXlsxRosterFile,
  saveLocalRosterEntries,
  clearLocalRoster,
  getLocalRosterMap,
  formatSeatCodeLabel,
} from '../utils/localRoster';

export function LocalRosterModal({ isOpen, onClose, onSaved }) {
  const [rawText, setRawText] = useState('');
  const [mergeMode, setMergeMode] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success'|'error', text }
  const [existingCount, setExistingCount] = useState(() => Object.keys(getLocalRosterMap()).length);
  const fileInputRef = useRef(null);

  const parsedEntries = useMemo(() => parseRosterText(rawText), [rawText]);

  if (!isOpen) return null;

  const handleFile = async (file) => {
    if (!file) return;
    setStatusMsg(null);
    const lowerName = file.name.toLowerCase();
    try {
      if (lowerName.endsWith('.xlsx')) {
        const buf = await file.arrayBuffer();
        const entries = await parseXlsxRosterFile(buf);
        if (entries.length === 0) {
          setStatusMsg({
            type: 'error',
            text: '檔案中未偵測到有效的「6 碼座號 + 姓名」欄位（例：010101, 王曉明）。',
          });
          return;
        }
        setRawText(entries.map((e) => `${e.seatCode},${e.name}`).join('\n'));
        setStatusMsg({ type: 'success', text: `已從 ${file.name} 讀取 ${entries.length} 筆學生對應！` });
      } else {
        const text = await file.text();
        setRawText(text);
        const entries = parseRosterText(text);
        setStatusMsg(
          entries.length > 0
            ? { type: 'success', text: `已從 ${file.name} 解析 ${entries.length} 筆學生對應！` }
            : { type: 'error', text: '未偵測到有效資料，請確認格式為 010101,王曉明。' }
        );
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err?.message || '讀取檔案失敗，請改用 CSV 或複製貼上。' });
    }
  };

  const handleDownloadTemplate = () => {
    const sample = '\uFEFF座號代碼(6碼),學生姓名\n010101,範例學生甲\n010102,範例學生乙\n';
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wutai_local_roster_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = () => {
    if (parsedEntries.length === 0) {
      setStatusMsg({ type: 'error', text: '請先貼上名單或拖入檔案，確認下方出現預覽筆數。' });
      return;
    }
    const nextMap = saveLocalRosterEntries(parsedEntries, { merge: mergeMode });
    const count = Object.keys(nextMap).length;
    setExistingCount(count);
    setStatusMsg({
      type: 'success',
      text: `已在本機成功儲存 ${count} 筆座號姓名對應（未上傳雲端）！`,
    });
    if (onSaved) onSaved(count);
    window.setTimeout(() => {
      onClose();
    }, 550);
  };

  const handleClear = () => {
    clearLocalRoster();
    setExistingCount(0);
    setRawText('');
    setStatusMsg({ type: 'success', text: '已清除本機瀏覽器中的所有學生姓名對應。' });
    if (onSaved) onSaved(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      data-testid="local-roster-modal"
    >
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-sky-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-amber-200" />
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                本機座號姓名一鍵匯入
              </h2>
              <p className="text-[11px] text-white/85 font-bold">
                目前本機已儲存 {existingCount} 筆對應（無對照時自動顯示如 5甲03號）
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 cursor-pointer"
            aria-label="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Privacy Notice */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              姓名資料<strong>僅存於這台電腦的瀏覽器本機（localStorage）</strong>，絕不上傳 Supabase 雲端。於公用大屏上課後可隨時按「清除本機名冊」。
            </span>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer?.files?.[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/80 dark:bg-slate-800/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt,.xlsx"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm">
                <Upload className="w-4 h-4" />
                <span>拖曳 .xlsx / .csv 檔案到此處，或點擊選取檔案</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                第一欄請放 6 碼座號（如 010101）、第二欄放學生姓名
              </span>
            </div>
          </div>

          {/* Paste CSV / Excel text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" />
                <span>或直接複製貼上名單（支援整串逗號或 Excel 兩欄貼上）</span>
              </span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>下載空白範本</span>
              </button>
            </div>
            <textarea
              data-testid="local-roster-textarea"
              rows={4}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setStatusMsg(null);
              }}
              placeholder="010101,王曉明,010102,陳小華,010103,張大為"
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Parsed Preview */}
          {parsedEntries.length > 0 && (
            <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-indigo-800 dark:text-indigo-200">
                <span>已辨識 {parsedEntries.length} 筆對應預覽</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mergeMode}
                    onChange={(e) => setMergeMode(e.target.checked)}
                    className="rounded"
                  />
                  <span>保留舊名冊並合併更新</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {parsedEntries.slice(0, 18).map((item) => (
                  <span
                    key={item.seatCode}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-[11px] font-bold text-slate-700 dark:text-slate-200"
                  >
                    {item.seatCode} · {formatSeatCodeLabel(item.seatCode)} {item.name}
                  </span>
                ))}
                {parsedEntries.length > 18 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold text-indigo-600">
                    ...等共 {parsedEntries.length} 筆
                  </span>
                )}
              </div>
            </div>
          )}

          {statusMsg && (
            <div
              className={`p-3 rounded-2xl text-xs font-black flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={existingCount === 0}
            className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-black inline-flex items-center gap-1 disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清除本機名冊</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              data-testid="local-roster-confirm-btn"
              onClick={handleConfirmImport}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-sm cursor-pointer"
            >
              確認匯入本機
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocalRosterModal;
