import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

export function InstallAppButton({ className = '' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.navigator?.standalone === true
    );
  });
  const [showGuide, setShowGuide] = useState(false);
  const [installedJustNow, setInstalledJustNow] = useState(false);

  const isIos =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent || '');

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstalledJustNow(true);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isStandalone || installedJustNow) {
    return null;
  }

  const handleClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          setDeferredPrompt(null);
          setInstalledJustNow(true);
        }
      } catch {
        setShowGuide(true);
      }
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        data-testid="install-app-btn"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-md transition active:scale-95 cursor-pointer ${className}`}
        title="將霧臺英語宇宙安裝至桌面，全螢幕開啟像 App 一樣操作"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>安裝 App</span>
        <Download className="w-3 h-3 opacity-85" />
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          data-testid="install-app-guide-modal"
          onClick={() => setShowGuide(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800 p-5 shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-black text-base">
                <Smartphone className="w-5 h-5" />
                <span>安裝「霧臺英語」App</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer"
                aria-label="關閉"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIos ? (
              <ol className="space-y-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span className="flex items-center gap-1 flex-wrap">
                    請使用 Safari 瀏覽器，點擊下方或右上角的 <Share className="w-4 h-4 text-sky-600 inline" /> <strong>「分享」</strong> 按鈕。
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span className="flex items-center gap-1 flex-wrap">
                    向下滑動點選 <PlusSquare className="w-4 h-4 text-indigo-600 inline" /> <strong>「加入主畫面」</strong>，即完成全螢幕 App 安裝！
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    點擊瀏覽器網址列右側的 <strong>「安裝」圖示</strong>，或點選右上角選單（⋮）。
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    選擇 <strong>「安裝應用程式」</strong> 或 <strong>「加到主畫面」</strong>，免裝 APK 即可使用！
                  </span>
                </li>
              </ol>
            )}

            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>登入同組 6 碼座號即可與網頁版即時同步金幣與學習紀錄。</span>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs cursor-pointer"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default InstallAppButton;
