import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Moon, Play, LogOut, Clock, ShieldAlert } from 'lucide-react';
import { soundEngine, stopSpeech } from '../../services/audio';

// ── 受閒置守護防護之單人遊戲與互動視圖 ──
const GUARDED_PREFIXES = [
  'quiz-', // quiz-choice, quiz-en-zh, quiz-zh-en, quiz-listen
  'sentence',
  'spelling',
  'meteor',
  'snake',
  'memory',
  'maze',
  'swipe',
  'escape',
  'spotter',
  'mole',
  'handwriting',
  'town'
];

export const InactivityGuard = ({
  currentView,
  onTimeoutToLobby,
  timeoutMinutes = 45, // 閒置達 45 分鐘無操作觸發提醒
  warningSeconds = 60  // 彈窗後給予 60 秒倒數緩衝
}) => {
  const isGuardedView = GUARDED_PREFIXES.some(prefix => currentView?.startsWith(prefix));

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [countdown, setCountdown] = useState(warningSeconds);
  const [toastMessage, setToastMessage] = useState('');

  const lastActiveTimeRef = useRef(Date.now());
  const hiddenAtRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // 互動事件重置時間戳記
  const recordUserActivity = useCallback(() => {
    lastActiveTimeRef.current = Date.now();
    // 若警示彈窗開啟中，小勇士只要點擊螢幕任何一處，立即自動解除警示並繼續遊戲
    setIsWarningOpen(prev => {
      if (prev) {
        soundEngine.click();
        return false;
      }
      return false;
    });
  }, []);

  // 監聽全域所有觸控與操作（點擊、觸碰、滑動、鍵盤等）
  useEffect(() => {
    if (!isGuardedView) {
      setIsWarningOpen(false);
      return;
    }

    // 重設活動時間戳記為進入遊戲時
    lastActiveTimeRef.current = Date.now();

    const events = ['pointerdown', 'touchstart', 'click', 'keydown', 'wheel'];
    events.forEach(evt => window.addEventListener(evt, recordUserActivity, { passive: true }));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, recordUserActivity));
    };
  }, [isGuardedView, recordUserActivity]);

  // 定期檢查閒置時間（每 5 秒輪詢一次，消耗極低）
  useEffect(() => {
    if (!isGuardedView) return;

    const checkInterval = setInterval(() => {
      if (isWarningOpen) return;

      const idleDuration = Date.now() - lastActiveTimeRef.current;
      const thresholdMs = timeoutMinutes * 60 * 1000;

      // 當超過閒置時間門檻，啟動 60 秒提醒倒數
      if (idleDuration >= thresholdMs) {
        setIsWarningOpen(true);
        setCountdown(warningSeconds);
        try {
          soundEngine.wrong();
        } catch (e) {}
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [isGuardedView, isWarningOpen, timeoutMinutes, warningSeconds]);

  // 彈窗倒數計時器
  useEffect(() => {
    if (!isWarningOpen) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      return;
    }

    setCountdown(warningSeconds);
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          handleFinalTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isWarningOpen, warningSeconds]);

  // 逾時強制清理並返回大廳
  const handleFinalTimeout = useCallback(() => {
    setIsWarningOpen(false);
    try {
      soundEngine.pauseSceneBgm();
      stopSpeech();
    } catch (e) {}

    if (typeof onTimeoutToLobby === 'function') {
      onTimeoutToLobby();
    }

    setToastMessage('💤 因連續 45 分鐘未操作，探險已自動結束並返回大廳，為您省電保護設備。');
    setTimeout(() => {
      setToastMessage('');
    }, 5000);
  }, [onTimeoutToLobby]);

  // 監聽頁面切換或鎖定休眠 (visibilitychange)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 切到背景：暫停背景音樂與語音以省電
        hiddenAtRef.current = Date.now();
        if (isGuardedView) {
          try {
            soundEngine.pauseSceneBgm();
            stopSpeech();
          } catch (e) {}
        }
      } else {
        // 切回前景：檢查是否已在背景沉睡超過 45 分鐘
        if (hiddenAtRef.current && isGuardedView) {
          const hiddenDuration = Date.now() - hiddenAtRef.current;
          const thresholdMs = timeoutMinutes * 60 * 1000;
          if (hiddenDuration >= thresholdMs) {
            handleFinalTimeout();
            return;
          }
        }
        hiddenAtRef.current = null;
        // 未逾時則平順喚醒背景音樂
        if (isGuardedView && !isWarningOpen) {
          try {
            soundEngine.resumeSceneBgm();
          } catch (e) {}
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isGuardedView, isWarningOpen, timeoutMinutes, handleFinalTimeout]);

  // 手動點選「繼續探險」按鈕
  const handleResumePlaying = () => {
    lastActiveTimeRef.current = Date.now();
    setIsWarningOpen(false);
    soundEngine.correct();
  };

  // 手動點選「返回大廳」
  const handleManualExit = () => {
    setIsWarningOpen(false);
    soundEngine.click();
    handleFinalTimeout();
  };

  return (
    <>
      {/* 溫柔防呆閒置警示彈窗 */}
      {isWarningOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full rounded-3xl bg-slate-900 border-2 border-amber-500/70 p-6 text-center text-white shadow-[0_0_50px_rgba(245,158,11,0.35)] animate-scaleUp">
            {/* 頂部裝飾圖標 */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 text-3xl shadow-inner animate-pulse">
              <Moon className="w-9 h-9" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-amber-300 font-heading mb-2">
              探險暫停：小勇士還在嗎？
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-bold mb-4 leading-relaxed">
              偵測到您已超過 <span className="text-amber-400 font-black font-mono">{timeoutMinutes} 分鐘</span> 沒有進行任何操作。為了保護平板電力與維持系統流暢，遊戲將於：
            </p>

            {/* 倒數秒數大標籤 */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono font-black text-2xl mb-6 shadow-md">
              <Clock className="w-6 h-6 text-amber-400 animate-spin" />
              <span>{countdown} 秒後自動保存並返回大廳</span>
            </div>

            {/* 操作按鈕 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleResumePlaying}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                我還在！繼續探險
              </button>
              <button
                onClick={handleManualExit}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm border border-white/10 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                返回大廳
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 逾時返回大廳後的溫柔浮動通知 */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-5 py-3 rounded-2xl bg-slate-900/95 border-2 border-amber-500/80 text-amber-200 text-xs sm:text-sm font-black shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fadeIn pointer-events-none">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
