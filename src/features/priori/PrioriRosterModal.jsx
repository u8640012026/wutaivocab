import React, { useState, useMemo, useEffect } from 'react';
import { X, ShieldCheck, KeyRound, Upload, Lock, Users, CheckCircle2 } from 'lucide-react';
import {
  parseRosterInput,
  encryptRosterEntries,
  decryptRosterEnvelope,
  saveEncryptedRosterEnvelope,
} from './prioriSecurity';

/**
 * 學習扶助教師後台：全校去識別化加密名冊管理彈窗
 * - 支援貼入或匯入 JSON（相容 classqna roster 格式）/ CSV / Excel 複製貼上
 * - 支援一鍵中間字「O」遮罩去識別化，並以 Web Crypto PBKDF2 + AES-256-GCM 加密存入本機與 Supabase
 * - 明文個資絕不寫進 GitHub 或 Cloudflare 靜態打包檔
 */
export function PrioriRosterModal({
  isOpen,
  onClose,
  existingEnvelope,
  decryptedCount = 0,
  onRosterUnlocked,
}) {
  const [mode, setMode] = useState(existingEnvelope ? 'unlock' : 'import');
  const [rawInput, setRawInput] = useState('');
  const [applyMask, setApplyMask] = useState(true);
  const [passphrase, setPassphrase] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    setStatusMsg('');
    setPassphrase('');
    setMode(existingEnvelope && decryptedCount === 0 ? 'unlock' : 'import');
  }, [isOpen, existingEnvelope, decryptedCount]);

  const parsedPreview = useMemo(
    () => parseRosterInput(rawInput, { applyMask }),
    [rawInput, applyMask]
  );

  if (!isOpen) return null;

  const handleFilePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setRawInput(text);
      setErrorMsg('');
    } catch {
      setErrorMsg('讀取檔案失敗，請改為複製內容直接貼上');
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    setBusy(true);
    try {
      const entries = await decryptRosterEnvelope(existingEnvelope, passphrase);
      onRosterUnlocked(entries, existingEnvelope);
      setStatusMsg(`已解密載入 ${entries.length} 位學生名冊（僅暫存本次記憶體）`);
      setPassphrase('');
      setTimeout(() => onClose(), 650);
    } catch (err) {
      setErrorMsg(err?.message || '解密失敗');
    } finally {
      setBusy(false);
    }
  };

  const handleEncryptAndSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    if (parsedPreview.entries.length === 0) {
      setErrorMsg('請先貼入或匯入有效的學生名單');
      return;
    }
    setBusy(true);
    try {
      const envelope = await encryptRosterEntries(parsedPreview.entries, passphrase);
      const syncRes = await saveEncryptedRosterEnvelope(envelope);
      onRosterUnlocked(parsedPreview.entries, envelope);
      setPassphrase('');
      if (syncRes.ok) {
        setStatusMsg(
          `已以 AES-256 加密保存 ${parsedPreview.entries.length} 筆名冊並同步至 Supabase 隔離通道！`
        );
      } else {
        setStatusMsg(
          `已加密保存於本機瀏覽器（${parsedPreview.entries.length} 筆），雲端同步提醒：${syncRes.error}`
        );
      }
    } catch (err) {
      setErrorMsg(err?.message || '加密保存失敗');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="班級名冊管理與加密同步"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-300 dark:border-teal-700 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-teal-800 dark:text-teal-200 font-black text-base">
            <Users className="w-5 h-5" />
            <span>全校班級名冊管理（AES-256 加密・不進 GitHub）</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
            aria-label="關閉名冊視窗"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed bg-teal-50/70 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-2xl p-3">
          前台學生永遠只顯示自取暱稱；此名冊僅在教師輸入暗號後於瀏覽器記憶體解密對照，並預設把姓名轉為「王O明」遮罩後以 AES-256-GCM 加密存進本機與 Supabase。
        </p>

        {/* 模式切換 */}
        <div className="flex items-center gap-2">
          {existingEnvelope && (
            <button
              type="button"
              onClick={() => {
                setMode('unlock');
                setErrorMsg('');
                setStatusMsg('');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black border transition cursor-pointer flex items-center gap-1.5 ${
                mode === 'unlock'
                  ? 'bg-teal-700 border-teal-600 text-white'
                  : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>解密現有名冊（{existingEnvelope.count || 0} 筆）</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setMode('import');
              setErrorMsg('');
              setStatusMsg('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black border transition cursor-pointer flex items-center gap-1.5 ${
              mode === 'import'
                ? 'bg-teal-700 border-teal-600 text-white'
                : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>匯入／更新全校名冊</span>
          </button>
        </div>

        {mode === 'unlock' && existingEnvelope && (
          <form onSubmit={handleUnlock} className="space-y-3">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1">
                輸入名冊解密暗號
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="請輸入當初匯入名冊時設定的加密暗號"
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={busy || !passphrase.trim()}
              className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{busy ? '解密中...' : '解密顯示班級姓名'}</span>
            </button>
          </form>
        )}

        {mode === 'import' && (
          <form onSubmit={handleEncryptAndSave} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                貼上名冊或選擇檔案（相容 classqna roster.json、CSV 或 Excel 貼上）
              </label>
              <label className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>選擇 JSON / CSV 檔</span>
                <input
                  type="file"
                  accept=".json,.csv,.txt"
                  onChange={handleFilePick}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={5}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={`支援三種貼上格式：\n1) JSON：[{"grade":"3","class":"1","number":"1","name":"王小明"}]\n2) 表格：3, 1, 1, 王小明  （年級, 班級, 座號, 姓名）\n3) 學號＋姓名：030101, 王小明`}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-100"
            />

            <label className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={applyMask}
                onChange={(e) => setApplyMask(e.target.checked)}
                className="rounded border-stone-300 text-teal-600 focus:ring-teal-500"
              />
              <span>自動將姓名中間字轉為「O」去識別化（王小明 → 王O明、林小 → 林O）</span>
            </label>

            {rawInput.trim() && (
              <div className="rounded-xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 p-2.5 text-xs space-y-1">
                <div className="font-black text-teal-800 dark:text-teal-200">
                  已解析 {parsedPreview.entries.length} 位學生
                  {parsedPreview.invalidCount > 0 && (
                    <span className="text-amber-600 ml-2">
                      （略過 {parsedPreview.invalidCount} 行格式不符）
                    </span>
                  )}
                </div>
                {parsedPreview.entries.length > 0 && (
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    預覽：
                    {parsedPreview.entries
                      .slice(0, 4)
                      .map((s) => `${s.grade}年${s.classNum}班${s.seat}號 ${s.name}`)
                      .join('、')}
                    {parsedPreview.entries.length > 4 ? '…' : ''}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1">
                設定本次加密暗號（至少 4 字元，建議另設未寫進 Git 的專用暗號）
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="輸入名冊加密／解密暗號"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={busy || parsedPreview.entries.length === 0 || passphrase.trim().length < 4}
              className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{busy ? 'AES-256 加密上傳中...' : '加密保存名冊（本機 + Supabase）'}</span>
            </button>
          </form>
        )}

        {errorMsg && (
          <p className="text-xs font-black text-rose-600 dark:text-rose-400">{errorMsg}</p>
        )}
        {statusMsg && (
          <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMsg}</span>
          </p>
        )}
      </div>
    </div>
  );
}
