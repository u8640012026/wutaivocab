import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  downloadRosterXlsxTemplate,
} from '../utils/localRoster';

export function LocalRosterModal({ isOpen, onClose, onSaved }) {
  const [rawText, setRawText] = useState('');
  const [mergeMode, setMergeMode] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [existingCount, setExistingCount] = useState(() => Object.keys(getLocalRosterMap()).length);
  const fileInputRef = useRef(null);

  const parsedEntries = useMemo(() => parseRosterText(rawText), [rawText]);

  if (!isOpen || typeof document === 'undefined') return null;

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
            text: '未偵測到「6 碼座號 + 姓名」欄位（例：010101, 王曉明）。',
          });
          return;
        }
        setRawText(entries.map((e) => `${e.seatCode},${e.name}`).join('\n'));
        setStatusMsg({ type: 'success', text: `已讀取 ${entries.length} 筆學生對應！` });
      } else {
        const text = await file.text();
        setRawText(text);
        const entries = parseRosterText(text);
        setStatusMsg(
          entries.length > 0
            ? { type: 'success', text: `已解析 ${entries.length} 筆學生對應！` }
            : { type: 'error', text: '未偵測到有效資料，請確認格式為 010101,王曉明。' }
        );
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err?.message || '讀取檔案失敗，請改用 CSV 或複製貼上。' });
    }
  };

  const handleConfirmImport = () => {
    if (parsedEntries.length === 0) {
      setStatusMsg({ type: 'error', text: '請先貼上名單或拖入檔案。' });
      return;
    }
    const nextMap = saveLocalRosterEntries(parsedEntries, { merge: mergeMode });
    const count = Object.keys(nextMap).length;
    setExistingCount(count);
    setStatusMsg({
      type: 'success',
      text: `已儲存 ${count} 筆本機座號姓名對應！`,
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
    setStatusMsg({ type: 'success', text: '已清除本機名冊。' });
    if (onSaved) onSaved(0);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      data-testid="local-roster-modal"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-indigo-800 dark:text-indigo-200 font-black text-base">
            <Users className="w-5 h-5" />
            <span>本機座號姓名匯入（目前 {existingCount} 筆）</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
            aria-label="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Concise Privacy Note */}
        <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>姓名資料僅存於本機瀏覽器。</span>
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
          <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm">
            <Upload className="w-4 h-4" />
            <span>拖曳 .xlsx / .csv 檔案至此，或點擊選取</span>
          </div>
        </div>

        {/* Paste CSV / Excel text */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs font-black text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" />
              <span>貼上名單（逗號串流或 Excel 兩欄）</span>
            </span>
            <button
              type="button"
              data-testid="download-roster-xlsx-btn"
              onClick={downloadRosterXlsxTemplate}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 inline-flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載空白名單 (.xlsx)</span>
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
              <span>已辨識 {parsedEntries.length} 筆</span>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeMode}
                  onChange={(e) => setMergeMode(e.target.checked)}
                  className="rounded"
                />
                <span>保留舊名冊合併</span>
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

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
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
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 cursor-pointer"
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
    </div>,
    document.body
  );
}

export default LocalRosterModal;
