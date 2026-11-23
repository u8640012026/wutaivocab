import React, { useState, useEffect, useRef } from 'react';
import { Button3D } from './ui/Button3D';
import { useI18n } from '../context/I18nContext';
import { useStudent } from '../context/StudentContext';
import { formatStudentDisplayName, isBookInOwnGrade, isAlphabetGameMode } from '../utils/studentIdHelper';
import { checkIfQualifiesForTop50, uploadScore } from '../services/supabase';
import { CertificateModal } from './CertificateModal';
import { getAccuracyLevel } from '../services/certificateGenerator';
import { getProfanityError } from '../services/profanityFilter';
import { recordGrimoireStar, mapModeToGrimoireId } from '../utils/grimoireHelper';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle2, Sparkles, Send, Loader2, Award, UserCheck, RefreshCw, AlertCircle, Coins, ShieldCheck, User, Printer, Edit3 } from 'lucide-react';

export const HonorSubmissionCard = ({
  mode,
  gameMode,
  book,
  qualifyingBook,
  score = 0,
  correctCount,
  practiceOnly = false,
  time = 0,
  totalCount = 20,
  rangeText = '',
  reviewWords = [],
  onSuccess
}) => {
  const { t } = useI18n();
  const { currentStudent, isLoggedIn, addCoins, openModal, coins } = useStudent();
  const [status, setStatus] = useState(practiceOnly ? 'practice_only' : 'checking'); // 'checking' | 'practice_only' | 'not_qualifying_book' | 'not_top50' | 'qualified' | 'submitting' | 'submitted'
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('wutai_player_name') || '';
  });

  const hasAwardedCoinsRef = useRef(false);
  const [awardedInfo, setAwardedInfo] = useState({ delta: 0, reason: '', type: 'none' });

  // 支援雙向相容 mode/gameMode 與 book/qualifyingBook
  const actualMode = mode || gameMode;
  const rawBook = book || qualifyingBook;
  const isAlphabet = isAlphabetGameMode(actualMode, rawBook);
  const effectiveBook = rawBook || (isAlphabet ? 'abc' : null);

  useEffect(() => {
    if (currentStudent && !playerName) {
      setPlayerName(currentStudent.nickname || '');
    }
  }, [currentStudent]);
  const [validationError, setValidationError] = useState('');
  const [isCertOpen, setIsCertOpen] = useState(false);
  const hasSubmittedRef = useRef(false);

  // ── 金幣經濟結算與防刷防作弊機制 ──
  useEffect(() => {
    if (practiceOnly) {
      setAwardedInfo({ delta: 0, reason: '試玩／練習模式不計入排行榜或金幣。', type: 'practice_only' });
      return;
    }
    if (status === 'checking' || status === 'practice_only') return;

    // 防刷門檻 (Anti-exploit Gate)：答題數 >= 5、總題數 >= 10，或挑戰時間 >= 20 秒，或密室逃脫通關
    const isLegitimateSession = totalCount >= 10 || score >= 5 || time >= 20 || actualMode === 'escape';
    const isOwnGrade = isBookInOwnGrade(effectiveBook, currentStudent?.grade, actualMode);

    if (!isLegitimateSession) {
      setAwardedInfo({
        delta: 0,
        reason: '未達結算基本門檻（需答滿 10 題或生存滿 20 秒），本次不發放金幣。',
        type: 'exploit_gate'
      });
      return;
    }

    if (!isOwnGrade) {
      setAwardedInfo({
        delta: 0,
        reason: '跨年級自主探索（純練習無金幣），請挑戰本年級教材以累積宇宙金幣！',
        type: 'cross_grade'
      });
      return;
    }

    // 達到本年級挑戰門檻：
    const coinDelta = (status === 'qualified' || status === 'submitted') ? 10 : 1;
    const rewardType = coinDelta === 10 ? 'top50' : 'clear';
    const reasonText = coinDelta === 10
      ? '👑 突破本週全校 Top 50 榮譽榜！獲得 +10 宇宙金幣！'
      : (isAlphabet && (currentStudent?.grade === '01' || currentStudent?.grade === '02'))
      ? '🌟 完美挑戰低年級字母樂園！獲得 +1 宇宙金幣！'
      : '👏 完整挑戰本年級單元！獲得 +1 宇宙金幣！';

    setAwardedInfo({
      delta: coinDelta,
      reason: reasonText,
      type: rewardType
    });

    if (isLoggedIn && !hasAwardedCoinsRef.current) {
      hasAwardedCoinsRef.current = true;
      addCoins(coinDelta);
    }
  }, [practiceOnly, status, effectiveBook, totalCount, score, time, currentStudent, isLoggedIn, addCoins, isAlphabet, mode]);

  // 當學生在結算卡片點擊「登入」後立即補發金幣
  useEffect(() => {
    if (practiceOnly) return;
    if (isLoggedIn && awardedInfo.delta > 0 && !hasAwardedCoinsRef.current) {
      hasAwardedCoinsRef.current = true;
      addCoins(awardedInfo.delta);
    }
  }, [practiceOnly, isLoggedIn, awardedInfo.delta, addCoins]);
  const [grimoireNotice, setGrimoireNotice] = useState(null);
  const hasRecordedGrimoireStarRef = useRef(false);

  // 首答正確題數與答對率計算（與局內連擊/速度加分徹底分離，杜絕答對題數 > 總題數）
  const rawCorrect = typeof correctCount === 'number' ? correctCount : score;
  const effectiveCorrectCount = totalCount > 0
    ? Math.min(totalCount, Math.max(0, Math.round(rawCorrect)))
    : Math.max(0, Math.round(rawCorrect));
  const accuracy = totalCount > 0 ? Math.min(100, Math.round((effectiveCorrectCount / totalCount) * 100)) : 100;
  const level = getAccuracyLevel(accuracy);

  // ── 神山八冊秘典典藏館進度連動（點亮星星與書籍完成度） ──
  useEffect(() => {
    if (practiceOnly) return;
    if (status === 'checking' || status === 'practice_only' || hasRecordedGrimoireStarRef.current) return;

    const targetBook = (effectiveBook && effectiveBook !== 'abc')
      ? String(effectiveBook)
      : (isAlphabet ? (currentStudent?.grade === '02' ? '2' : '1') : null);

    if (targetBook && ['1', '2', '3', '4', '5', '6', '7', '8'].includes(targetBook)) {
      const gId = mapModeToGrimoireId(actualMode);
      if (gId) {
        // 評定星數：滿80%或突破Top50為三星，60%為二星，其餘有效完成為一星
        const stars = (status === 'qualified' || status === 'submitted' || accuracy >= 80) ? 3 : (accuracy >= 60 ? 2 : 1);
        const sId = currentStudent?.student_id || 'guest';
        recordGrimoireStar(sId, targetBook, gId, stars);
        hasRecordedGrimoireStarRef.current = true;
        setGrimoireNotice({
          bookId: targetBook,
          gameId: gId,
          stars
        });
      }
    }
  }, [practiceOnly, status, actualMode, effectiveBook, accuracy, currentStudent, isAlphabet]);


  useEffect(() => {
    let isCancelled = false;

    if (practiceOnly) {
      setStatus('practice_only');
      return;
    }

    // 1. 若未滿足單冊單元範圍門檻 (跨多冊或題數不足)，但字母類遊戲不受單冊冊數限制！
    if (!effectiveBook && !isAlphabet) {
      setStatus('not_qualifying_book');
      return;
    }

    // 2. 得分必須大於 0 才有資格
    if (!score || score <= 0) {
      setStatus('not_top50');
      return;
    }

    // 3. 向 Supabase 檢查本週該冊別、該模式是否達到 Top 50 門檻
    setStatus('checking');
    checkIfQualifiesForTop50({ mode: actualMode, book: effectiveBook || 'abc', score, time })
      .then((qualified) => {
        if (isCancelled) return;
        if (qualified) {
          setStatus('qualified');
          try {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          } catch (e) {}
        } else {
          setStatus('not_top50');
        }
      })
      .catch(() => {
        if (!isCancelled) setStatus('qualified'); // 網路異常時以鼓勵優先
      });

    return () => {
      isCancelled = true;
    };
  }, [practiceOnly, actualMode, effectiveBook, score, time, isAlphabet]);

  // ── 智慧自動上榜防呆機制：若學生已登入座號，突破 Top 50 時自動背景登錄，杜絕忘按送出漏失 ──
  useEffect(() => {
    if (practiceOnly) return;
    if (status === 'qualified' && isLoggedIn && !hasSubmittedRef.current) {
      const autoName = (formatStudentDisplayName(currentStudent) || playerName || '').trim();
      if (autoName) {
        hasSubmittedRef.current = true;
        setStatus('submitting');
        uploadScore({
          mode: actualMode,
          book: effectiveBook || 'abc',
          name: autoName,
          score,
          time
        }).then((success) => {
          if (success) {
            setStatus('submitted');
            try {
              confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
            } catch (e) {}
            if (onSuccess) onSuccess();
          } else {
            hasSubmittedRef.current = false;
            setStatus('qualified');
          }
        });
      }
    }
  }, [status, isLoggedIn, currentStudent, actualMode, effectiveBook, score, time, playerName, onSuccess]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmedName = playerName.trim();
    if (!trimmedName || status === 'submitting' || hasSubmittedRef.current) return;

    // ── 不雅文字檢驗攔截 ──
    const badWordError = getProfanityError(trimmedName);
    if (badWordError) {
      setValidationError(badWordError);
      return;
    }

    hasSubmittedRef.current = true;
    setStatus('submitting');
    localStorage.setItem('wutai_player_name', trimmedName);

    const success = await uploadScore({
      mode: actualMode,
      book: effectiveBook || 'abc',
      name: trimmedName,
      score,
      time
    });

    if (success) {
      setStatus('submitted');
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
      if (onSuccess) onSuccess();
    } else {
      hasSubmittedRef.current = false;
      setStatus('qualified'); // 上傳失敗重試
    }
  };

  // 一鍵換人玩 / 清除暫存暱稱
  const handleSwitchPlayer = () => {
    localStorage.removeItem('wutai_player_name');
    setPlayerName('');
    hasSubmittedRef.current = false;
  };

  const effectiveRangeText = rangeText || (book ? `第 ${book} 冊精選單元` : '全校英語星際挑戰');

  return (
    <div className="w-full mb-4 space-y-2.5">
      {/* ── 頂部戰績與獎勵精華列 (iPad 一頁式緊湊橫幅，整合答對率、金幣、秘典與本作列印成績單) ── */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-400/20 via-yellow-400/15 to-emerald-400/20 dark:from-slate-900/90 dark:via-slate-850/80 dark:to-slate-900/90 border-2 border-amber-300/80 dark:border-amber-600/50 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-300 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 shadow-xs">
              答對率 {accuracy}%
            </span>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <span>{level.badge}</span>
              <span>{level.title}</span>
            </span>
            {awardedInfo.delta > 0 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30 flex items-center gap-0.5">
                <Coins className="w-3 h-3 text-amber-500" />
                <span>+{awardedInfo.delta} 金幣</span>
              </span>
            )}
            {grimoireNotice && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-400/30">
                📖 B{grimoireNotice.bookId} {'⭐'.repeat(grimoireNotice.stars)}
              </span>
            )}
          </div>
        </div>

        {/* 🖨️ 本作風格印表機成績單按鈕 (精巧次要標示，99.9% 情況不搶奪主視覺) */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={() => setIsCertOpen(true)}
            className="px-2.5 py-1 rounded-xl border border-amber-400/50 hover:border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 text-[11px] font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs ml-auto sm:ml-0"
            title="預覽並輸出本作風格 A4 學習成就獎狀"
          >
            <Printer className="w-3.5 h-3.5 text-amber-500" />
            <span>成績單</span>
          </button>
        </div>
      </div>

      {/* ── 下部：英雄榜上榜狀態與身分確認 (緊湊防呆一頁式) ── */}
      {/* 狀況 0：試玩 / 練習模式 (絕不寫入排行榜或發放金幣) */}
      {status === 'practice_only' && (
        <div className="p-2.5 rounded-xl bg-sky-50/90 dark:bg-sky-950/35 border border-sky-200 dark:border-sky-800/70 text-left">
          <p className="text-[11px] font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
            <span>🌱</span>
            <span>目前為自主試玩／練習模式（不計入排行榜與金幣，可隨時列印成績單留念）。</span>
          </p>
        </div>
      )}

      {/* 狀況 1：未選取符合排行榜門檻的範圍 */}
      {status === 'not_qualifying_book' && (
        <div className="p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>💡</span>
            <span>自選多單元練習模式，歡迎在首頁點選「全冊範圍」衝刺全校榮譽榜！</span>
          </p>
        </div>
      )}

      {/* 狀況 2：比對全校門檻中 */}
      {status === 'checking' && (
        <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-center flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          <span className="text-xs font-black text-blue-700 dark:text-blue-300">
            比對本週全校 Top 50 門檻中...
          </span>
        </div>
      )}

      {/* 狀況 3：未突破 Top 50 門檻 */}
      {status === 'not_top50' && (
        <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-2 text-left">
          <div className="flex items-center gap-2">
            <span className="text-base">👏</span>
            <div>
              <p className="text-xs font-black text-amber-800 dark:text-amber-300">
                恭喜完成挑戰！自主練習金幣已存入探險執照！
              </p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                只要提升速度或答對率，就有機會挺進全校 Top 50 英雄榜！
              </p>
            </div>
          </div>
          {!isLoggedIn && (
            <button
              onClick={openModal}
              className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500 hover:bg-amber-400 text-white shadow-xs shrink-0 cursor-pointer"
            >
              登入座號領金幣 🪙
            </button>
          )}
        </div>
      )}

      {/* 狀況 4：成功上榜 (自動登記或手動登記完成) */}
      {status === 'submitted' && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/60 text-emerald-950 dark:text-emerald-100 flex items-center justify-between gap-2 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="truncate">
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-200">
                🏆 成績已成功登錄全校英雄榜！
              </span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 ml-1.5 hidden sm:inline">
                勇士：{playerName || formatStudentDisplayName(currentStudent) || '優秀同學'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSwitchPlayer}
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white underline flex items-center gap-0.5 shrink-0 cursor-pointer"
            title="如需登記為其他座號或暱稱請點此"
          >
            <Edit3 className="w-3 h-3" />
            <span>更換名稱</span>
          </button>
        </div>
      )}

      {/* 狀況 5：突破紀錄中 / 訪客手動登記留名 */}
      {(status === 'qualified' || status === 'submitting') && (
        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-2 border-amber-400 dark:border-amber-600 text-center shadow-md animate-fadeIn">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
              <span className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200 font-heading">
                🎉 突破本週全校 Top 50 門檻！
              </span>
            </div>
            {!isLoggedIn && (
              <button
                type="button"
                onClick={openModal}
                className="text-[11px] font-bold text-amber-700 dark:text-amber-300 underline cursor-pointer"
              >
                直接登入座號
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setValidationError('');
                }}
                placeholder="請輸入班級與姓名（如：501小明）"
                maxLength={15}
                className={`w-full py-1.5 px-3 rounded-xl border ${
                  validationError ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20' : 'border-amber-300 dark:border-amber-700'
                } bg-white dark:bg-slate-800 text-center font-black text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-400 text-xs shadow-inner`}
              />
            </div>

            <Button3D
              variant="amber"
              size="sm"
              type="submit"
              disabled={!playerName.trim() || status === 'submitting' || hasSubmittedRef.current}
              className="shrink-0 text-xs py-1.5 px-3"
              icon={Send}
            >
              {status === 'submitting' ? '送出中...' : '送出上榜 🚀'}
            </Button3D>
          </form>

          {validationError && (
            <div className="mt-1.5 p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[11px] font-black text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
      )}

      {/* ── 官方榮譽獎狀全頁彈窗 ── */}
      <CertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        studentName={playerName || formatStudentDisplayName(currentStudent) || '優秀學生'}
        rangeText={effectiveRangeText}
        totalCount={totalCount}
        correctCount={effectiveCorrectCount}
        accuracy={accuracy}
        reviewWords={reviewWords}
      />
    </div>
  );
};
