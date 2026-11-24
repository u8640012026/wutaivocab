import React, { useState, useMemo } from 'react';
import type { PhonicsCard, PhonicsCategory, Language, DeckPreset } from '../types/phonics';
import { CATEGORIES_META, PRESET_DECKS } from '../data/phonicsData';
import { PhonicsCardView } from './PhonicsCardView';
import { getT } from '../utils/i18n';
import { isElementarySafeWord } from '../../../services/profanityFilter';
import {
  X,
  Search,
  CheckSquare,
  Square,
  Trash2,
  Plus,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FolderDown,
} from 'lucide-react';

interface SoundBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  allCards: PhonicsCard[];
  selectedCardIds: Set<string>;
  onToggleCard: (cardId: string) => void;
  onSelectMultiple: (cardIds: string[], add: boolean) => void;
  onClearAllSelected: () => void;
  onAddCustomCard: (card: PhonicsCard) => void;
  onLoadPreset: (preset: DeckPreset) => void;
  lang: Language;
}

export const SoundBankModal: React.FC<SoundBankModalProps> = ({
  isOpen,
  onClose,
  allCards,
  selectedCardIds,
  onToggleCard,
  onSelectMultiple,
  onClearAllSelected,
  onAddCustomCard,
  onLoadPreset,
  lang,
}) => {
  const t = getT(lang);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [customGrapheme, setCustomGrapheme] = useState('');
  const [customSound, setCustomSound] = useState('');
  const [customCategory, setCustomCategory] = useState<PhonicsCategory>('custom');
  const [activeTab, setActiveTab] = useState<'bank' | 'presets'>('bank');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Rule categories ordered specifically
  const orderedCategoryKeys: PhonicsCategory[] = [
    'short_vowels',
    'silent_e',
    'consonant_digraphs',
    'beginning_blends',
    'ending_blends',
    'vowel_teams',
    'r_controlled',
    'silent_letters',
    'basic_consonants',
    'custom',
  ];

  // Filter cards based on search and category
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        card.grapheme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.phonemeSound.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (card.sampleWord && card.sampleWord.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = activeCategoryFilter === 'all' || card.category === activeCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [allCards, searchQuery, activeCategoryFilter]);

  // Group filtered cards by category
  const groupedCards = useMemo(() => {
    const groups: { categoryId: PhonicsCategory; meta: typeof CATEGORIES_META[string]; cards: PhonicsCard[] }[] = [];

    orderedCategoryKeys.forEach((catKey) => {
      const cardsInGroup = filteredCards.filter((c) => c.category === catKey);
      if (cardsInGroup.length > 0 || (activeCategoryFilter === catKey && catKey === 'custom')) {
        const meta = CATEGORIES_META[catKey] || CATEGORIES_META.basic_consonants;
        groups.push({
          categoryId: catKey,
          meta,
          cards: cardsInGroup,
        });
      }
    });

    return groups;
  }, [filteredCards, activeCategoryFilter]);

  const handleSelectAllCategory = (catId: string) => {
    const idsInCat = allCards.filter((c) => c.category === catId).map((c) => c.id);
    onSelectMultiple(idsInCat, true);
  };

  const handleDeselectCategory = (catId: string) => {
    const idsInCat = allCards.filter((c) => c.category === catId).map((c) => c.id);
    onSelectMultiple(idsInCat, false);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const rawGrapheme = customGrapheme.trim();
    const rawSound = customSound.trim();
    if (!rawGrapheme) return;

    if (!isElementarySafeWord(rawGrapheme) || (rawSound && !isElementarySafeWord(rawSound))) {
      showToast(
        lang === 'zh'
          ? '⚠️ 此字卡包含不適合國小課堂的字詞，已攔截！'
          : '⚠️ Blocked inappropriate classroom word!'
      );
      return;
    }

    const newCard: PhonicsCard = {
      id: `custom_${Date.now()}`,
      grapheme: rawGrapheme.toLowerCase(),
      displayText: rawGrapheme,
      category: customCategory,
      phonemeSound: rawSound || `/${rawGrapheme}/`,
      sampleWord: 'custom',
      isCustom: true,
      isSplit: rawGrapheme.includes('_'),
    };

    onAddCustomCard(newCard);
    setCustomGrapheme('');
    setCustomSound('');
    showToast(lang === 'zh' ? '✅ 自訂字卡已加入卡池並勾選！' : 'Custom card added!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden animate-pop">
      {/* Top Header Bar */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 shadow-sm shrink-0 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>{lang === 'zh' ? '自然發音八大卡池（全螢幕展開選牌）' : 'Phonics Sound Banks (Full Screen Picker)'}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500 text-white">
                {selectedCardIds.size} {lang === 'zh' ? '張已放入候用區' : 'selected'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {lang === 'zh'
                ? '點擊卡片可試聽並直接加入下方候用匣，選好後點選右下方「完成選取」返回拼讀板'
                : 'Click tiles to preview sound and add to tray. Click "Done" when ready to blend.'}
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Sound Bank vs Curriculum Decks */}
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'bank'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {lang === 'zh' ? '八大規則卡池' : '8 Sound Banks'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'presets'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {lang === 'zh' ? '快速教案套件' : 'Curriculum Decks'}
            </button>
          </div>

          {/* Close / Return Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <span>{lang === 'zh' ? '完成選取並返回' : 'Done & Return'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Filter and Category Jump Navigation Bar */}
      {activeTab === 'bank' && (
        <div className="bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                activeCategoryFilter === 'all'
                  ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {lang === 'zh' ? '全部規則' : 'All Rules'}
            </button>

            {orderedCategoryKeys.map((catKey) => {
              const meta = CATEGORIES_META[catKey];
              if (!meta) return null;
              const isSelected = activeCategoryFilter === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategoryFilter(catKey)}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? `${meta.badgeBg} shadow-xs text-white`
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : meta.badgeBg}`} />
                  <span>{lang === 'zh' ? meta.nameZh : meta.nameEn}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'zh' ? '搜尋音素 (如 ch, a_e, ar)...' : 'Search sounds (e.g. ch, ar)...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area: Large organized Category Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {activeTab === 'bank' ? (
          <>
            {groupedCards.map((group) => {
              const selectedCount = group.cards.filter((c) => selectedCardIds.has(c.id)).length;
              const isAllSelected = group.cards.length > 0 && selectedCount === group.cards.length;

              return (
                <section
                  key={group.categoryId}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4 transition-all"
                >
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                      <span className={`w-4 h-4 rounded-full ${group.meta.badgeBg} shadow-sm shrink-0`} />
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <span>{lang === 'zh' ? group.meta.nameZh : group.meta.nameEn}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {selectedCount} / {group.cards.length} {lang === 'zh' ? '已選取' : 'selected'}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {lang === 'zh' ? group.meta.descriptionZh : group.meta.descriptionEn}
                        </p>
                      </div>
                    </div>

                    {/* Category Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          isAllSelected
                            ? handleDeselectCategory(group.categoryId)
                            : handleSelectAllCategory(group.categoryId)
                        }
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          isAllSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {isAllSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        <span>
                          {isAllSelected
                            ? lang === 'zh'
                              ? '取消全選'
                              : 'Deselect All'
                            : lang === 'zh'
                            ? '全選本類別'
                            : 'Select All'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Cards Grid: Large, touch-friendly, high-contrast tiles */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 pt-1">
                    {group.cards.map((card) => {
                      const isSelected = selectedCardIds.has(card.id);
                      return (
                        <div key={card.id} className="relative group flex flex-col items-center">
                          <PhonicsCardView
                            card={card}
                            size="md"
                            draggable={false}
                            onClick={() => onToggleCard(card.id)}
                            className={`w-full! h-24! sm:h-28! cursor-pointer transition-all ${
                              isSelected
                                ? 'ring-4 ring-indigo-500 ring-offset-2 scale-103 shadow-lg'
                                : 'opacity-65 hover:opacity-100 hover:scale-102'
                            }`}
                          />
                          {/* Selection indicator pill */}
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-30 pointer-events-none animate-pop">
                              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                            </div>
                          )}
                          <span className="text-[11px] font-sans font-medium text-slate-500 dark:text-slate-400 mt-1 truncate max-w-full">
                            {card.sampleWord}{lang === 'zh' && card.sampleWordZh ? ` (${card.sampleWordZh})` : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {/* Teacher Custom Card Creator */}
            <section className="bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-dashed border-indigo-300 dark:border-indigo-800 rounded-3xl p-5 sm:p-7 space-y-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {lang === 'zh' ? '➕ 教師臨時自訂字卡' : '➕ Teacher Custom Phoneme Card'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'zh'
                  ? '輸入您需要的字母組合（如 spl, tion, a_e），可立即加入卡池與候用區'
                  : 'Add custom graphemes (e.g. spl, tion, a_e) to your deck instantly'}
              </p>

              <form onSubmit={handleAddCustom} className="flex flex-wrap items-center gap-3 pt-2">
                <input
                  type="text"
                  value={customGrapheme}
                  onChange={(e) => setCustomGrapheme(e.target.value)}
                  placeholder={lang === 'zh' ? '字母 (如 spl, str)' : 'Grapheme (e.g. spl)'}
                  maxLength={6}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-phonics text-lg font-bold text-slate-800 dark:text-slate-100 w-36"
                />
                <input
                  type="text"
                  value={customSound}
                  onChange={(e) => setCustomSound(e.target.value)}
                  placeholder={lang === 'zh' ? '音標提示 (如 /spl/)' : 'Sound cue (e.g. /spl/)'}
                  maxLength={10}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 w-40"
                />
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as PhonicsCategory)}
                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100"
                >
                  {orderedCategoryKeys.map((catKey) => {
                    const meta = CATEGORIES_META[catKey];
                    if (!meta) return null;
                    return (
                      <option key={catKey} value={catKey}>
                        {lang === 'zh' ? meta.nameZh : meta.nameEn}
                      </option>
                    );
                  })}
                </select>
                <button
                  type="submit"
                  disabled={!customGrapheme.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'zh' ? '新增並選入候用區' : 'Add to Staging Tray'}</span>
                </button>
              </form>
            </section>
          </>
        ) : (
          /* Preset Curriculum Decks Tab */
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                {t.presetDecksTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                {lang === 'zh'
                  ? '一鍵套用國小標準教材循序漸進的自然發音教學包（CVC入門、二合子音、魔術e、複合音）'
                  : 'One-click load Orton-Gillingham progression lesson decks'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESET_DECKS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                        <span>{lang === 'zh' ? preset.nameZh : preset.nameEn}</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {preset.cardIds.length} {lang === 'zh' ? '張字卡' : 'cards'}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {lang === 'zh' ? preset.descriptionZh : preset.descriptionEn}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadPreset(preset);
                        showToast(lang === 'zh' ? `已成功套用【${preset.nameZh}】！` : 'Deck loaded!');
                      }}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <FolderDown className="w-4 h-4" />
                      <span>{t.loadPreset}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating / Sticky Bottom Action Bar */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 shadow-lg shrink-0 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <span>
              {lang === 'zh'
                ? `候用區目前累積：${selectedCardIds.size} 張發音字卡`
                : `${selectedCardIds.size} cards ready in staging tray`}
            </span>
          </div>

          {selectedCardIds.size > 0 && (
            <button
              type="button"
              onClick={onClearAllSelected}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearAllSelected}</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all active:scale-97"
          >
            <span>{lang === 'zh' ? '✅ 選好了！返回拼讀板' : 'Done! Back to Blending Board'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* Toast Notice */}
      {toastMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-2xl shadow-2xl border border-slate-700 animate-pop z-50">
          {toastMsg}
        </div>
      )}
    </div>
  );
};
