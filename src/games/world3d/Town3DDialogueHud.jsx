import React, { useState, useEffect, useMemo } from 'react';
import { getDialogueTreeForLocation } from '../town/townData';
import { speakEnglish, stopSpeech, soundEngine } from '../../services/audio';
import { CinemaTheaterModal } from '../town/CinemaTheaterModal';
import {
  Volume2, X, MessageSquare, Sparkles, ShoppingBag,
  ScrollText, ChevronRight, Eye, EyeOff, RotateCcw, Film
} from 'lucide-react';

/**
 * Translucent RPG Dialogue HUD rendered directly over the live 3D Town canvas.
 * Reuses 100% of Wutai Town's dialogue trees, persona TTS voices, shop/quest actions,
 * and anti-inflation completion callbacks without covering the 3D scenery.
 */
export const Town3DDialogueHud = ({
  location,
  onClose,
  onOpenShop,
  onOpenQuests,
  onQuestProgress,
  isVisitingTeacher = false,
  visitingTeacher = null,
  onTeacherBonusClaimed,
  onDialogueComplete
}) => {
  const tree = useMemo(() => {
    return getDialogueTreeForLocation(location?.id, {
      isTeacherActive: isVisitingTeacher,
      teacher: visitingTeacher
    });
  }, [location?.id, isVisitingTeacher, visitingTeacher]);

  const [currentNodeId, setCurrentNodeId] = useState(tree?.startNode || 'welcome');
  const [nodeHistory, setNodeHistory] = useState([]);
  const [showChineseNpc, setShowChineseNpc] = useState(false);
  const [showChineseOptions, setShowChineseOptions] = useState(false);
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);
  const [theaterInitialHall, setTheaterInitialHall] = useState('ALL');
  const [theaterInitialMovieId, setTheaterInitialMovieId] = useState(null);

  const currentNode = tree?.nodes?.[currentNodeId];

  const activeVoicePersonaKey = useMemo(() => {
    if (isVisitingTeacher && visitingTeacher?.id) {
      return visitingTeacher.id;
    }
    return location?.id || 'mario';
  }, [isVisitingTeacher, visitingTeacher, location]);

  useEffect(() => {
    if (currentNode?.en) {
      soundEngine.click();
      speakEnglish(currentNode.en, activeVoicePersonaKey);
      setShowChineseNpc(false);
      if (onQuestProgress && location?.id) {
        onQuestProgress('dialogue', location.id, currentNodeId);
      }
    }
  }, [currentNodeId, currentNode, location?.id, activeVoicePersonaKey, onQuestProgress]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  if (!location || !tree || !currentNode) {
    return null;
  }

  const handleClose = () => {
    stopSpeech();
    onClose?.();
  };

  const handleSelectOption = (opt) => {
    soundEngine.click();

    if (opt.action === 'CLAIM_TEACHER_BONUS') {
      stopSpeech();
      onTeacherBonusClaimed?.();
      handleClose();
      return;
    }

    if (opt.action === 'OPEN_SHOP') {
      stopSpeech();
      onOpenShop?.(location.id);
      return;
    }

    if (opt.action === 'OPEN_QUESTS') {
      stopSpeech();
      onOpenQuests?.();
      return;
    }

    if (opt.action === 'OPEN_THEATER') {
      stopSpeech();
      setTheaterInitialHall(opt.hall || 'ALL');
      setTheaterInitialMovieId(opt.movieId || null);
      setIsTheaterOpen(true);
      return;
    }

    if (opt.target_id === 'END') {
      onDialogueComplete?.(location.id);
      handleClose();
      return;
    }

    if (opt.target_id && tree.nodes[opt.target_id]) {
      setNodeHistory((prev) => [...prev, currentNodeId]);
      setCurrentNodeId(opt.target_id);
    } else {
      handleClose();
    }
  };

  const handleGoBack = () => {
    soundEngine.click();
    stopSpeech();
    if (nodeHistory.length > 0) {
      const prevNodeId = nodeHistory[nodeHistory.length - 1];
      setNodeHistory((prev) => prev.slice(0, -1));
      setCurrentNodeId(prevNodeId);
    } else {
      setCurrentNodeId(tree?.startNode || 'welcome');
    }
  };

  const displayAvatar = isVisitingTeacher ? visitingTeacher.avatar : location.npcAvatar;
  const displayPortrait = isVisitingTeacher ? visitingTeacher.portrait : location.npcPortrait;
  const displayRole = isVisitingTeacher ? visitingTeacher.roleZh : location.npcRole;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-2.5 sm:p-5 pointer-events-none flex flex-col items-center">
      {/* Subtle bottom vignette so HUD stays readable over bright grass/buildings */}
      <div className="fixed inset-x-0 bottom-0 h-[55vh] bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent pointer-events-none -z-10" />

      <div className="w-full max-w-[1060px] pointer-events-auto flex flex-col md:flex-row items-end gap-3 sm:gap-4 animate-slideUp">
        {/* Compact NPC Portrait Card (left side on desktop, compact chip on mobile) */}
        <div className="hidden md:flex flex-col items-center shrink-0 w-44">
          {displayPortrait ? (
            <img
              src={displayPortrait}
              alt={currentNode.speaker}
              className="h-44 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] select-none"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-emerald-500/25 border border-white/30 flex items-center justify-center text-5xl mb-2 shadow-xl backdrop-blur-md">
              {displayAvatar}
            </div>
          )}
          <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-white/25 text-center shadow-lg">
            <div className="text-xs font-black text-white font-heading">{currentNode.speaker}</div>
            <div className="text-[10px] font-bold text-emerald-400">{displayRole}</div>
          </div>
        </div>

        {/* Main Translucent Speech & Choices Panel */}
        <div className="flex-1 w-full rounded-3xl bg-slate-900/85 backdrop-blur-xl border-2 border-white/25 shadow-2xl p-3.5 sm:p-5 text-white space-y-3">
          {/* Header Row: Location, Shortcuts, Close */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-lg shrink-0">
                {displayAvatar}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-black font-heading text-white truncate">
                    {currentNode.speaker}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded-full">
                    {location.nameZh}
                  </span>
                  {isVisitingTeacher && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" />
                      <span>{visitingTeacher.nameZh}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {location.hasShop && (
                <button
                  onClick={() => { stopSpeech(); onOpenShop?.(location.id); }}
                  className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1 shadow cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>商店</span>
                </button>
              )}
              {location.id === 'cinema' && (
                <button
                  onClick={() => {
                    stopSpeech();
                    setTheaterInitialHall('ALL');
                    setTheaterInitialMovieId(null);
                    setIsTheaterOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1 shadow cursor-pointer active:scale-95"
                >
                  <Film className="w-3.5 h-3.5 text-yellow-300" />
                  <span>時刻表</span>
                </button>
              )}
              {location.hasQuests && (
                <button
                  onClick={() => { stopSpeech(); onOpenQuests?.(); }}
                  className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1 shadow cursor-pointer active:scale-95"
                >
                  <ScrollText className="w-3.5 h-3.5" />
                  <span>任務欄</span>
                </button>
              )}
              <button
                onClick={() => speakEnglish(currentNode.en, activeVoicePersonaKey)}
                className="px-2.5 py-1 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-400/40 text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95"
                title="重聽英語發音"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>朗讀</span>
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="結束對話繼續探索"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* NPC Speech Line */}
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 space-y-1.5">
            <p className="text-sm sm:text-lg font-black text-white leading-snug font-heading">
              "{currentNode.en}"
            </p>
            {showChineseNpc ? (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                <p className="text-xs font-bold text-amber-300">「{currentNode.zh}」</p>
                <button
                  onClick={() => setShowChineseNpc(false)}
                  className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-0.5 shrink-0 cursor-pointer"
                >
                  <EyeOff className="w-3 h-3" />
                  <span>隱藏</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowChineseNpc(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:underline cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>查看中文翻譯</span>
              </button>
            )}
          </div>

          {/* Player Response Options */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black text-emerald-300 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>選擇你的英語回應：</span>
              </span>
              <button
                onClick={() => setShowChineseOptions((prev) => !prev)}
                className="text-[11px] font-bold text-slate-300 hover:text-amber-300 cursor-pointer"
              >
                {showChineseOptions ? '隱藏中文提示' : '💡 選項中文提示'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[24vh] overflow-y-auto pr-0.5">
              {currentNode.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  className="text-left p-2.5 rounded-xl bg-white/10 hover:bg-emerald-500/30 border border-white/15 hover:border-emerald-400 transition-all flex items-center gap-2 cursor-pointer active:scale-98 group"
                >
                  <span className="w-5 h-5 rounded-md bg-emerald-500/30 group-hover:bg-emerald-500 text-emerald-200 group-hover:text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-black text-white leading-snug">
                      {opt.text_en}
                    </div>
                    {showChineseOptions && opt.text_zh && (
                      <div className="text-[10px] font-bold text-slate-300 mt-0.5">
                        {opt.text_zh}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0" />
                </button>
              ))}

              {nodeHistory.length > 0 && (
                <button
                  onClick={handleGoBack}
                  className="text-left p-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-400/35 text-indigo-200 font-black text-xs flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>"Let me ask something else." (回上一層)</span>
                  </span>
                </button>
              )}

              <button
                onClick={handleClose}
                className="text-left p-2 rounded-xl bg-white/5 hover:bg-rose-500/25 border border-white/15 hover:border-rose-400/50 text-slate-300 hover:text-rose-200 font-black text-xs flex items-center justify-between cursor-pointer"
              >
                <span>🚪 "Goodbye!" (結束對話繼續逛小鎮)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isTheaterOpen && (
        <CinemaTheaterModal
          initialHall={theaterInitialHall}
          initialMovieId={theaterInitialMovieId}
          onClose={() => setIsTheaterOpen(false)}
        />
      )}
    </div>
  );
};

export default Town3DDialogueHud;
