import React from 'react';
import type { PhonicsCard } from '../types/phonics';
import { CATEGORIES_META } from '../data/phonicsData';
import { speakPhoneme } from '../utils/audio';
import { isElementarySafeWord } from '../../../services/profanityFilter';
import { X } from 'lucide-react';

import type { PronunciationMode } from '../utils/audio';

interface PhonicsCardViewProps {
  card: PhonicsCard;
  isInfinite?: boolean;
  isHighlighted?: boolean;
  showRemove?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
  slotIndex?: number;
  pronunciationMode?: PronunciationMode;
}

export const PhonicsCardView: React.FC<PhonicsCardViewProps> = ({
  card,
  isInfinite = false,
  isHighlighted = false,
  showRemove = false,
  onRemove,
  onClick,
  size = 'md',
  draggable = true,
  onDragStart,
  className = '',
  pronunciationMode = 'phoneme',
}) => {
  const meta = CATEGORIES_META[card.category] || CATEGORIES_META.basic_consonants;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !isElementarySafeWord(card.grapheme) ||
      (card.displayText && !isElementarySafeWord(card.displayText)) ||
      (pronunciationMode === 'word' && card.sampleWord && !isElementarySafeWord(card.sampleWord))
    ) {
      return;
    }
    // Default action: speak phoneme sound with chosen pronunciation mode
    speakPhoneme(card, pronunciationMode);
    if (onClick) {
      onClick();
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  // Dimensions based on size (lg 適度精簡尺寸，確保右上角刪除鈕完整顯示且單行可容納更多字卡)
  const sizeClasses = {
    sm: 'w-14 h-17 text-xl sm:w-16 sm:h-20 sm:text-2xl',
    md: 'w-18 h-22 text-2xl sm:w-22 sm:h-26 sm:text-3xl',
    lg: 'w-[66px] h-[84px] text-2xl sm:w-20 sm:h-24 sm:text-3xl md:w-24 md:h-28 md:text-4xl',
  }[size];

  // Check if it's a split digraph like a_e
  const isSplitDigraph = card.isSplit || card.grapheme.includes('_');

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={handleCardClick}
      title={`${card.grapheme} (${card.phonemeSound}) ${card.sampleWord ? '— e.g. ' + card.sampleWord : ''}`}
      className={`
        relative select-none flex flex-col items-center justify-center cursor-pointer rounded-2xl
        border-3 font-phonics font-bold transition-all duration-200 card-tactile
        ${sizeClasses}
        ${meta.bgLight} ${meta.bgDark}
        ${meta.borderLight} ${meta.borderDark}
        ${meta.textLight} ${meta.textDark}
        ${isHighlighted ? 'scale-108 ring-4 ring-amber-400 ring-offset-2 shadow-xl z-20 animate-pulse' : ''}
        ${isSplitDigraph ? 'border-dashed border-4' : ''}
        ${className}
      `}
    >
      {/* Category sound badge / IPA hint */}
      <span className="absolute top-1 text-[10px] sm:text-xs font-sans font-medium px-1.5 py-0.2 rounded-full opacity-75 pointer-events-none truncate max-w-[90%]">
        {card.phonemeSound}
      </span>

      {/* Main Grapheme Text - Single-story early childhood font */}
      <div className="flex items-center justify-center tracking-normal mt-1">
        {isSplitDigraph ? (
          <div className="flex items-center space-x-1">
            <span>{card.grapheme.split('_')[0]}</span>
            <span className="w-2.5 h-0.5 border-b-2 border-dashed border-current opacity-60 mx-0.5"></span>
            <span>{card.grapheme.split('_')[1] || 'e'}</span>
          </div>
        ) : (
          <span>{card.displayText || card.grapheme}</span>
        )}
      </div>

      {/* Remove Button on card (for placed cards) */}
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={handleRemoveClick}
          aria-label="Remove card"
          className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-115 active:scale-95 z-30"
        >
          <X className="w-3.5 h-3.5 stroke-[2.75]" />
        </button>
      )}
    </div>
  );
};
