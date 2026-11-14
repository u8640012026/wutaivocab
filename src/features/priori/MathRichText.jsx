import React from 'react';

const FRACTION_REGEX = /(\{\s*\d+\s*\/\s*\d+\s*\})/g;

/**
 * 將含有 {分子/分母} 標記的數學文字渲染為上下直式分數排版
 */
export function MathRichText({ text = '', className = '' }) {
  const raw = String(text ?? '');
  if (!raw) return null;

  const parts = raw.split(FRACTION_REGEX);

  return (
    <span className={`inline leading-relaxed ${className}`}>
      {parts.map((part, idx) => {
        const match = part.match(/^\{\s*(\d+)\s*\/\s*(\d+)\s*\}$/);
        if (match) {
          const [, numerator, denominator] = match;
          return (
            <span
              key={idx}
              className="inline-flex flex-col items-center justify-center align-middle mx-1 px-0.5 leading-none select-none tabular-nums"
              aria-label={`${denominator}分之${numerator}`}
            >
              <span className="text-[0.82em] font-black pb-[2px] border-b-[1.5px] border-current min-w-[1.25em] text-center">
                {numerator}
              </span>
              <span className="text-[0.82em] font-black pt-[2px] min-w-[1.25em] text-center">
                {denominator}
              </span>
            </span>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </span>
  );
}
