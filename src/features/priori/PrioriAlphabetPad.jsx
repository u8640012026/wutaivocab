import React, { useState } from 'react';
import { Eraser, Type } from 'lucide-react';
import { parseAlphabetPairAnswer, formatAlphabetPairValue } from './prioriStorage';

const UPPER_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LOWER_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

/**
 * 英語科第一部分「聽音寫大小寫字母」專屬四線格作答板（絕不硬轉四選一）
 * 同時支援直接鍵盤輸入與平板大按鈕點選，大寫／小寫各自獨立挑選以真實測驗字形辨識。
 */
export function PrioriAlphabetPad({ value = '', onChange, disabled = false }) {
  const { upper, lower } = parseAlphabetPairAnswer(value);
  const [activeSlot, setActiveSlot] = useState('upper'); // 'upper' | 'lower'

  const commit = (nextUpper, nextLower) => {
    if (disabled || typeof onChange !== 'function') return;
    onChange(formatAlphabetPairValue(nextUpper, nextLower));
  };

  const handleUpperInput = (e) => {
    const raw = e.target.value.replace(/[^a-zA-Z]/g, '').slice(-1);
    commit(raw, lower);
    if (raw && !lower) setActiveSlot('lower');
  };

  const handleLowerInput = (e) => {
    const raw = e.target.value.replace(/[^a-zA-Z]/g, '').slice(-1);
    commit(upper, raw);
  };

  const keys = activeSlot === 'upper' ? UPPER_LETTERS : LOWER_LETTERS;

  return (
    <div className="space-y-4">
      {/* 仿原卷英語四線格大小寫作答框 */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* 大寫格子 */}
        <div
          onClick={() => !disabled && setActiveSlot('upper')}
          className={`relative rounded-2xl border-2 p-3 sm:p-4 transition cursor-pointer ${
            activeSlot === 'upper'
              ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-300/60'
              : 'border-stone-200 dark:border-slate-700 bg-stone-50/70 dark:bg-slate-800/70 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-indigo-800 dark:text-indigo-200">
              大寫（Uppercase）
            </span>
            {activeSlot === 'upper' && !disabled && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black">
                目前作答格
              </span>
            )}
          </div>

          {/* 英語四線格背景視覺線 */}
          <div className="relative h-20 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-slate-700 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-x-3 top-3 border-t border-rose-300/70 pointer-events-none" />
            <div className="absolute inset-x-3 top-1/2 -translate-y-1 border-t border-dashed border-sky-400/75 pointer-events-none" />
            <div className="absolute inset-x-3 bottom-3 border-t-2 border-rose-400/80 pointer-events-none" />
            <input
              type="text"
              aria-label="大寫字母輸入"
              maxLength={2}
              value={upper}
              disabled={disabled}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              onFocus={() => setActiveSlot('upper')}
              onChange={handleUpperInput}
              placeholder="A"
              className="relative z-10 w-full h-full bg-transparent text-center text-4xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none font-sans"
            />
          </div>
        </div>

        {/* 小寫格子 */}
        <div
          onClick={() => !disabled && setActiveSlot('lower')}
          className={`relative rounded-2xl border-2 p-3 sm:p-4 transition cursor-pointer ${
            activeSlot === 'lower'
              ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-300/60'
              : 'border-stone-200 dark:border-slate-700 bg-stone-50/70 dark:bg-slate-800/70 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-indigo-800 dark:text-indigo-200">
              小寫（Lowercase）
            </span>
            {activeSlot === 'lower' && !disabled && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black">
                目前作答格
              </span>
            )}
          </div>

          <div className="relative h-20 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-slate-700 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-x-3 top-3 border-t border-rose-300/70 pointer-events-none" />
            <div className="absolute inset-x-3 top-1/2 -translate-y-1 border-t border-dashed border-sky-400/75 pointer-events-none" />
            <div className="absolute inset-x-3 bottom-3 border-t-2 border-rose-400/80 pointer-events-none" />
            <input
              type="text"
              aria-label="小寫字母輸入"
              maxLength={2}
              value={lower}
              disabled={disabled}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              onFocus={() => setActiveSlot('lower')}
              onChange={handleLowerInput}
              placeholder="a"
              className="relative z-10 w-full h-full bg-transparent text-center text-4xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none font-sans"
            />
          </div>
        </div>
      </div>

      {/* iPad 點選用大小寫字母快速鍵盤 */}
      {!disabled && (
        <div className="rounded-2xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200 dark:border-slate-700 p-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-600 dark:text-slate-300">
              <Type className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" />
              <span>
                點選填入
                <strong className="text-indigo-700 dark:text-indigo-300 mx-1">
                  {activeSlot === 'upper' ? '大寫 (A–Z)' : '小寫 (a–z)'}
                </strong>
                （也可直接用鍵盤輸入）
              </span>
            </div>
            <p className="w-full text-[11px] font-bold text-amber-700 dark:text-amber-300">
              大小寫字母辨識練習：採輸入字元自動核對，與紙筆評分規準之字形、四線格位置人工批閱不同。
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveSlot('upper')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition ${
                  activeSlot === 'upper'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-stone-200 dark:border-slate-600'
                }`}
              >
                切到大寫
              </button>
              <button
                type="button"
                onClick={() => setActiveSlot('lower')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition ${
                  activeSlot === 'lower'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-stone-200 dark:border-slate-600'
                }`}
              >
                切到小寫
              </button>
              {(upper || lower) && (
                <button
                  type="button"
                  onClick={() => {
                    commit('', '');
                    setActiveSlot('upper');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                >
                  <Eraser className="w-3 h-3" />
                  清空
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5">
            {keys.map((letter) => {
              const selected =
                activeSlot === 'upper' ? upper === letter : lower === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => {
                    if (activeSlot === 'upper') {
                      commit(letter, lower);
                      setActiveSlot('lower');
                    } else {
                      commit(upper, letter);
                    }
                  }}
                  className={`h-9 rounded-xl font-black text-base transition cursor-pointer border ${
                    selected
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-indigo-400'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
