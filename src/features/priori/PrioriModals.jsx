import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  QrCode,
  Printer,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { MathRichText } from './MathRichText';
import { formatPrioriAnswerLabel } from './prioriStorage';

/**
 * 霧臺台灣百合花極簡向量徽章（點綴文化特色而不干擾閱讀）
 */
export function LilyEmblem({ className = 'w-7 h-7' }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 6C20 14 19 20 24 27C29 20 28 14 24 6Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8 18C15 17 20 20 24 27C16 27 11 24 8 18Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M40 18C33 17 28 20 24 27C32 27 37 24 40 18Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M14 35C16 29 20 27 24 27C28 27 32 29 34 35C29 37 19 37 14 35Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="2.2" fill="currentColor" />
    </svg>
  );
}

/**
 * 圖片放大平移檢視燈箱（底部常駐即時選答條）
 */
export function PrioriZoomModal({
  isOpen,
  onClose,
  imageSrc,
  title,
  question,
  selectedAnswer,
  onSelectAnswer,
  readOnly = false,
}) {
  const [zoom, setZoom] = useState(1.2);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setZoom(1.25);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handlePointerDown = (e) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="題圖放大檢視"
    >
      {/* 頂欄 */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-900/95 border-b border-slate-800 text-white shrink-0">
        <div className="min-w-0">
          <p className="text-xs font-black text-teal-300 truncate">{title}</p>
          <p className="text-[11px] text-slate-400 font-bold">
            可用 ＋／－ 縮放並拖曳圖片細節（{Math.round(zoom * 100)}%）
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.25).toFixed(2)))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
            title="縮小"
            aria-label="縮小圖片"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.6, +(z + 0.25).toFixed(2)))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
            title="放大"
            aria-label="放大圖片"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1.2);
              setPan({ x: 0, y: 0 });
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="重設大小"
            aria-label="重設圖片縮放"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
            關閉
          </button>
        </div>
      </div>

      {/* 中央可拖曳縮放畫布 */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`flex-1 flex items-center justify-center overflow-hidden p-4 touch-none ${
          zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.14s ease-out',
          }}
          className="bg-white rounded-2xl p-3 sm:p-5 shadow-2xl border-2 border-teal-400/50 max-w-full max-h-full select-none pointer-events-none"
        >
          <img
            src={imageSrc}
            alt={title}
            className="max-h-[62vh] w-auto object-contain mx-auto pointer-events-none"
            draggable={false}
          />
        </div>
      </div>

      {/* 底部即時懸浮選答條（邊看大圖邊選答） */}
      {!readOnly &&
        question &&
        question.questionType !== 'alphabet-pair' &&
        Array.isArray(question.options) &&
        question.options.length > 0 &&
        typeof onSelectAnswer === 'function' && (
        <div className="px-3 sm:px-6 py-3 bg-slate-900/95 border-t border-slate-800 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="text-[11px] font-black text-teal-300 mb-2 flex items-center justify-between">
              <span>👇 邊看大圖邊點選答案（選完可直接關閉或點下一步）：</span>
              {selectedAnswer !== null && selectedAnswer !== undefined && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  已選 {question.optionLabels?.[selectedAnswer] || `(${selectedAnswer + 1})`}
                </span>
              )}
            </div>
            <div
              className={`grid gap-2 ${
                question.options.length === 2
                  ? 'grid-cols-2'
                  : question.options.length === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {question.options.map((opt, idx) => {
                const chosen = selectedAnswer === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectAnswer(idx)}
                    className={`px-3 py-2 rounded-xl border-2 text-left text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer ${
                      chosen
                        ? 'bg-teal-600 border-teal-300 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-teal-500'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                        chosen ? 'bg-white text-teal-800' : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="truncate">
                      <MathRichText text={opt} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 派卷 QR Code 彈窗（投影給全班平板掃碼直達試卷）
 */
export function PrioriQrModal({ isOpen, onClose, title, shareUrl }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="派卷 QR Code"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-300 dark:border-teal-700 p-6 shadow-2xl text-center space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-black text-base">
            <QrCode className="w-5 h-5" />
            <span>學生掃碼直接練習</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
            aria-label="關閉 QR Code 視窗"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{title}</p>

        <div className="p-3 bg-white rounded-2xl border-2 border-teal-100 inline-block shadow-inner">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
              shareUrl
            )}`}
            alt="學習扶助練習館 QR Code"
            className="w-48 h-48 object-contain"
          />
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-500 dark:text-slate-400 break-all">
          {shareUrl}
        </div>
      </div>
    </div>
  );
}

/**
 * 交卷防呆確認彈窗
 */
export function PrioriSubmitConfirmModal({ isOpen, unansweredCount, onContinue, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="交卷確認"
    >
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700 p-6 shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
          還有 {unansweredCount} 題還沒作答，確定要交卷嗎？
        </h3>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          沒寫完的題目在交卷後會被歸類為待練習錯題，你也可以先回去把空白題補寫完成。
        </p>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-sm transition cursor-pointer"
          >
            繼續寫題目
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-black text-sm shadow-md transition cursor-pointer"
          >
            確定交卷
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 瀏覽器原生 @media print 學習單（僅於列印時顯示）
 */
export function PrioriPrintableSheet({ paper, questions, answers, showAnswerKey = false }) {
  if (!paper || !questions?.length) return null;

  let lastGroupId = null;

  return (
    <div className="hidden print:block bg-white text-black p-6 space-y-5 font-sans">
      <div className="border-b-2 border-slate-800 pb-3 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-black">
            {paper.title}
            {showAnswerKey ? '（教師解答卷・含正解）' : '（練習學習單）'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {showAnswerKey
              ? `霧臺國小學習扶助自主練習館｜共 ${questions.length} 題（${
                  paper.officialAnswerVerified ? '含官方標準答案' : '教師解題參考答案'
                }，教師專用）`
              : `霧臺國小學習扶助自主練習館｜共 ${questions.length} 題（學生練習卷）`}
          </p>
        </div>
        <div className="text-xs font-bold text-slate-700">班級：______ 姓名：____________</div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {questions.map((q) => {
          const picked = answers?.[q.id];
          const hasPicked =
            picked !== undefined && picked !== null && picked !== '' && picked !== ',';
          const showPassage = Boolean(q.passage && q.groupId && q.groupId !== lastGroupId);
          if (q.groupId) lastGroupId = q.groupId;

          return (
            <React.Fragment key={q.id}>
              {showPassage && (
                <div className="border-2 border-slate-400 rounded-xl p-3 bg-slate-50 break-inside-avoid space-y-1.5">
                  <div className="text-xs font-black text-slate-800">{q.passage.title}</div>
                  {q.passage.paragraphs?.map((p, idx) => (
                    <p key={idx} className="text-xs leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              )}

              <div className="border border-slate-300 rounded-xl p-3 break-inside-avoid space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-bold leading-snug whitespace-pre-line">
                    <span className="font-black mr-1.5">({q.number})</span>
                    <MathRichText text={q.questionText} />
                  </div>
                  {showAnswerKey && (
                    <span className="text-[11px] font-bold text-slate-600 shrink-0">
                      {hasPicked ? `作答：${formatPrioriAnswerLabel(q, picked, false)}｜` : ''}
                      正解：
                      {q.questionType === 'alphabet-pair' ? q.answer : `(${q.answer + 1})`}
                    </span>
                  )}
                </div>
                {q.figureImage && (
                  <img
                    src={q.figureImage}
                    alt={`第 ${q.number} 題圖示`}
                    className="max-h-36 object-contain"
                  />
                )}
                {q.questionType === 'alphabet-pair' ? (
                  <div className="flex items-center gap-6 text-xs font-bold pt-1">
                    <span>大寫：[　　　]</span>
                    <span>小寫：[　　　]</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx}>
                        ({oIdx + 1}) <MathRichText text={opt} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1">
        <Printer className="w-3.5 h-3.5" />
        <span>列印自霧臺國小自主學習宇宙 — 學習扶助練習館</span>
      </div>
    </div>
  );
}
