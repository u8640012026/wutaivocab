import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useStudent } from '../../context/StudentContext';
import { TOWN_LOCATIONS } from '../town/townData';
import { useTownEconomy } from '../town/useTownEconomy';
import { ShopModal } from '../town/ShopModal';
import { BackpackModal } from '../town/BackpackModal';
import { QuestBoardModal } from '../town/QuestBoardModal';
import { HomeScene } from '../town/HomeScene';
import { soundEngine, stopSpeech } from '../../services/audio';
import { WUTAI_3D_WORLD } from './worlds/wutaiWorld';
import { World3DCanvas } from './World3DCanvas';
import { Town3DDialogueHud } from './Town3DDialogueHud';
import {
  ArrowLeft, Coins, Trophy, Package, ScrollText, Sparkles,
  Compass, Music, VolumeX, Sun, Moon, Eye, MessageCircle, Map as MapIcon
} from 'lucide-react';

/**
 * Full-screen 3D Immersive Wutai Town Prototype (?view=town-3d).
 * Keeps 100% compatibility with existing StudentContext, daily quest & coin caps,
 * and allows switching seamlessly between 3rd-person and 1st-person perspectives.
 */
export const WutaiTown3DGame = ({ onBack, onSwitchTo2D }) => {
  const { isDark, toggleTheme } = useTheme();
  const {
    currentStudent,
    coins,
    questPoints,
    inventory,
    updateDailyQuest,
    claimTeacherBonus,
    addCoins,
    addQuestPoints
  } = useStudent();

  const {
    teacherInfo,
    hasMetTeacherToday,
    townDialogueToast,
    teacherBonusToast,
    handleDialogueComplete,
    handleTeacherBonusClaimed,
    handleQuestProgress
  } = useTownEconomy({
    currentStudent,
    addCoins,
    addQuestPoints,
    updateDailyQuest,
    claimTeacherBonus
  });

  const locationsById = useMemo(() => {
    const map = {};
    TOWN_LOCATIONS.forEach((loc) => {
      map[loc.id] = loc;
    });
    return map;
  }, []);

  const [cameraMode, setCameraMode] = useState('third'); // 'third' | 'first'
  const [nearestLocationId, setNearestLocationId] = useState(null);
  const [activeDialogueLocation, setActiveDialogueLocation] = useState(null);
  const [activeDialogueIsTeacher, setActiveDialogueIsTeacher] = useState(false);
  const [activeShopLocationId, setActiveShopLocationId] = useState(null);
  const [isHomeOpen, setIsHomeOpen] = useState(false);
  const [isBackpackOpen, setIsBackpackOpen] = useState(false);
  const [isQuestBoardOpen, setIsQuestBoardOpen] = useState(false);
  const [isCompassDrawerOpen, setIsCompassDrawerOpen] = useState(false);
  const [isTownBgmActive, setIsTownBgmActive] = useState(true);
  const [teleportRequest, setTeleportRequest] = useState(null);
  const [radarPos, setRadarPos] = useState({ x: 0, z: 14, yaw: 0 });

  // Virtual Joystick mutable ref (0 latency for 60fps animation loop)
  const joystickRef = useRef({ x: 0, y: 0 });
  const [joystickKnob, setJoystickKnob] = useState({ x: 0, y: 0 });
  const joyOriginRef = useRef(null);

  const handleOpenLocation = useCallback((locId) => {
    const loc = locationsById[locId];
    if (!loc) return;
    stopSpeech();
    soundEngine.click();
    soundEngine.init();
    if (soundEngine.ctx && soundEngine.ctx.state === 'suspended') {
      soundEngine.ctx.resume().catch(() => {});
    }
    if (loc.id === 'home') {
      setIsHomeOpen(true);
      return;
    }
    const isTeacher = Boolean(loc.id === teacherInfo.locationId && !hasMetTeacherToday);
    setActiveDialogueIsTeacher(isTeacher);
    setActiveDialogueLocation(loc);
  }, [locationsById, teacherInfo.locationId, hasMetTeacherToday]);

  // Keyboard shortcut V to toggle 1st/3rd person view
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key.toLowerCase() === 'v' && !activeDialogueLocation) {
        setCameraMode((prev) => (prev === 'third' ? 'first' : 'third'));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeDialogueLocation]);

  // BGM synchronization
  useEffect(() => {
    if (!isTownBgmActive) {
      soundEngine.stopSceneBgm();
      return;
    }
    soundEngine.init();
    if (soundEngine.ctx && soundEngine.ctx.state === 'suspended') {
      soundEngine.ctx.resume().catch(() => {});
    }
    if (isHomeOpen) {
      soundEngine.startSceneBgm('home');
    } else if (activeDialogueLocation) {
      soundEngine.startSceneBgm(activeDialogueLocation.id);
    } else {
      soundEngine.startSceneBgm('town');
    }
  }, [isHomeOpen, activeDialogueLocation, isTownBgmActive]);

  useEffect(() => {
    return () => {
      stopSpeech();
      soundEngine.stopSceneBgm();
    };
  }, []);

  const handleJoystickStart = (e) => {
    e.stopPropagation();
    const touch = e.touches ? e.touches[0] : e;
    const rect = e.currentTarget.getBoundingClientRect();
    joyOriginRef.current = {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      maxR: rect.width * 0.38
    };
    updateJoystick(touch.clientX, touch.clientY);
  };

  const updateJoystick = (clientX, clientY) => {
    if (!joyOriginRef.current) return;
    const { cx, cy, maxR } = joyOriginRef.current;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    joystickRef.current = { x: dx / maxR, y: dy / maxR };
    setJoystickKnob({ x: dx, y: dy });
  };

  const handleJoystickMove = (e) => {
    if (!joyOriginRef.current) return;
    const touch = e.touches ? e.touches[0] : e;
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleJoystickEnd = () => {
    joyOriginRef.current = null;
    joystickRef.current = { x: 0, y: 0 };
    setJoystickKnob({ x: 0, y: 0 });
  };

  const nearestLoc = nearestLocationId ? locationsById[nearestLocationId] : null;

  return (
    <div className="relative w-full h-[100dvh] bg-slate-950 overflow-hidden select-none">
      {/* ── 3D WebGL Town World ── */}
      <World3DCanvas
        worldManifest={WUTAI_3D_WORLD}
        locationsById={locationsById}
        visitingTeacherLocationId={teacherInfo.locationId}
        hasMetTeacherToday={hasMetTeacherToday}
        isDark={isDark}
        cameraMode={cameraMode}
        isDialogueOpen={Boolean(activeDialogueLocation)}
        activeLocationId={activeDialogueLocation?.id || null}
        teleportRequest={teleportRequest}
        joystickRef={joystickRef}
        onNearestLocationChange={setNearestLocationId}
        onInteractLocation={handleOpenLocation}
        onPositionUpdate={setRadarPos}
      />

      {/* ── Top Floating Glass HUD ── */}
      <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-4 sm:right-4 z-30 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left: Back + Title + 2D Switch */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <button
            onClick={() => { stopSpeech(); soundEngine.stopSceneBgm(); onBack?.(); }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/75 hover:bg-slate-800 text-white text-xs font-black backdrop-blur-md border border-white/20 flex items-center gap-1 shadow-lg cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">回學習宇宙</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900/75 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-black font-heading flex items-center gap-1.5 shadow-lg">
            <span>🏔️</span>
            <span>霧臺小鎮 3D</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-mono">
              BETA
            </span>
          </div>

          {onSwitchTo2D && (
            <button
              onClick={() => { stopSpeech(); soundEngine.stopSceneBgm(); onSwitchTo2D(); }}
              className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-slate-100 text-xs font-black backdrop-blur-md border border-white/20 items-center gap-1 shadow cursor-pointer"
              title="切換回 2D 全景版小鎮"
            >
              <MapIcon className="w-3.5 h-3.5 text-sky-300" />
              <span>2D 版</span>
            </button>
          )}
        </div>

        {/* Right: Camera Toggle, Compass Teleport, Quests, Backpack, Day/Night, BGM, Gold */}
        <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap justify-end">
          {/* 1st / 3rd Person Switch */}
          <button
            onClick={() => setCameraMode((prev) => (prev === 'third' ? 'first' : 'third'))}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black backdrop-blur-md border flex items-center gap-1 shadow-lg cursor-pointer active:scale-95 transition-all ${
              cameraMode === 'first'
                ? 'bg-sky-500/90 border-sky-200 text-white'
                : 'bg-slate-900/75 border-white/20 text-white hover:bg-slate-800'
            }`}
            title="切換第一人稱 / 第三人稱視角 (快捷鍵 V)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{cameraMode === 'first' ? '第一視角' : '第三視角'}</span>
          </button>

          {/* Compass Landmark Teleport */}
          <button
            onClick={() => setIsCompassDrawerOpen((prev) => !prev)}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-600/85 hover:bg-emerald-500 text-white text-xs font-black backdrop-blur-md border border-emerald-300/40 flex items-center gap-1 shadow-lg cursor-pointer active:scale-95"
            title="小鎮地標快速導航傳送"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">地標傳送</span>
          </button>

          {/* Quests & Backpack */}
          <button
            onClick={() => setIsQuestBoardOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-indigo-600/85 hover:bg-indigo-500 text-white text-xs font-black backdrop-blur-md border border-indigo-300/40 flex items-center gap-1 shadow-lg cursor-pointer"
            title="每日任務欄"
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">任務</span>
          </button>

          <button
            onClick={() => setIsBackpackOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-600/85 hover:bg-amber-500 text-white text-xs font-black backdrop-blur-md border border-amber-300/40 flex items-center gap-1 shadow-lg cursor-pointer"
            title="冒險背包"
          >
            <Package className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{inventory?.length || 0}</span>
          </button>

          {/* Theme Day/Night */}
          <button
            onClick={() => { soundEngine.click(); toggleTheme(); }}
            className="p-1.5 rounded-xl bg-slate-900/75 hover:bg-slate-800 text-amber-300 backdrop-blur-md border border-white/20 shadow-lg cursor-pointer"
            title={isDark ? '切換為日間風景' : '切換為星空夜景'}
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* BGM */}
          <button
            onClick={() => { soundEngine.click(); setIsTownBgmActive((p) => !p); }}
            className="p-1.5 rounded-xl bg-slate-900/75 hover:bg-slate-800 text-slate-200 backdrop-blur-md border border-white/20 shadow-lg cursor-pointer"
            title={isTownBgmActive ? '靜音背景音樂' : '播放背景音樂'}
          >
            {isTownBgmActive ? <Music className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Gold & XP Chip */}
          <div className="hidden xs:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-xs font-black text-white shadow-lg">
            <span className="flex items-center gap-1 text-amber-300">
              <Coins className="w-3.5 h-3.5" />
              {coins ?? 0}
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <Trophy className="w-3.5 h-3.5" />
              {questPoints ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* ── Mini Radar (Top-Left below HUD on desktop/tablet) ── */}
      {!activeDialogueLocation && (
        <div className="hidden sm:block absolute top-16 left-4 z-20 w-28 h-28 rounded-2xl bg-slate-900/65 backdrop-blur-md border border-white/20 shadow-xl p-1.5 pointer-events-none">
          <div className="relative w-full h-full rounded-xl bg-emerald-950/60 overflow-hidden">
            {WUTAI_3D_WORLD.buildings.map((b) => {
              const px = 50 + (b.position[0] / WUTAI_3D_WORLD.worldRadius) * 44;
              const py = 50 + (b.position[1] / WUTAI_3D_WORLD.worldRadius) * 44;
              const isTeacher = b.locationId === teacherInfo.locationId && !hasMetTeacherToday;
              return (
                <div
                  key={b.locationId}
                  style={{ left: `${px}%`, top: `${py}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                    isTeacher ? 'bg-amber-400 ring-2 ring-amber-200 animate-ping' : 'bg-emerald-300/80'
                  }`}
                />
              );
            })}
            {/* Player Dot */}
            <div
              style={{
                left: `${50 + (radarPos.x / WUTAI_3D_WORLD.worldRadius) * 44}%`,
                top: `${50 + (radarPos.z / WUTAI_3D_WORLD.worldRadius) * 44}%`
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-sky-400 border border-white shadow"
            />
          </div>
        </div>
      )}

      {/* ── Compass Landmark Teleport Drawer ── */}
      {isCompassDrawerOpen && (
        <div className="absolute top-16 right-3 sm:right-4 z-30 w-72 max-w-[90vw] rounded-2xl bg-slate-900/92 backdrop-blur-xl border border-white/20 p-3 shadow-2xl text-white animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>點擊地標瞬移前往</span>
            </span>
            <button
              onClick={() => setIsCompassDrawerOpen(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 gap-1.5 max-h-[55vh] overflow-y-auto">
            {TOWN_LOCATIONS.map((loc) => {
              const isTeacherHere = loc.id === teacherInfo.locationId && !hasMetTeacherToday;
              return (
                <button
                  key={loc.id}
                  onClick={() => {
                    setTeleportRequest({ locationId: loc.id, ts: Date.now() });
                    setIsCompassDrawerOpen(false);
                    soundEngine.click();
                  }}
                  className="w-full p-2 rounded-xl bg-white/5 hover:bg-emerald-500/25 border border-white/10 hover:border-emerald-400/50 flex items-center justify-between text-left transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{loc.npcAvatar}</span>
                    <span>
                      <div className="text-xs font-black">{loc.nameZh}</div>
                      <div className="text-[10px] text-slate-400">{loc.nameEn}</div>
                    </span>
                  </span>
                  {isTeacherHere && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black">
                      外師在此
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bottom Controls (Virtual Joystick + Controls Hint + Context Talk Button) ── */}
      {!activeDialogueLocation && (
        <>
          {/* Virtual Joystick (Bottom-Left) */}
          <div
            onMouseDown={handleJoystickStart}
            onMouseMove={handleJoystickMove}
            onMouseUp={handleJoystickEnd}
            onMouseLeave={handleJoystickEnd}
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
            className="absolute bottom-5 left-4 sm:left-6 z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-900/45 backdrop-blur-md border-2 border-white/25 flex items-center justify-center touch-none cursor-pointer shadow-xl"
            title="拖曳搖桿移動角色"
          >
            <div
              style={{ transform: `translate(${joystickKnob.x}px, ${joystickKnob.y}px)` }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-400/85 border-2 border-white shadow-lg pointer-events-none"
            />
          </div>

          {/* Center Controls Guide (Desktop) */}
          <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-slate-900/65 backdrop-blur-md border border-white/15 text-[11px] font-bold text-slate-200 items-center gap-3 pointer-events-none">
            <span>⌨️ WASD / 方向鍵移動</span>
            <span>🖱️ 拖曳轉視角 / 點地即走</span>
            <span>👁️ V 切換第一視角</span>
            <span>💬 E 與 NPC 對話</span>
          </div>

          {/* Contextual Interact Button (Bottom-Right when inside NPC trigger ring) */}
          {nearestLoc && (
            <button
              onClick={() => handleOpenLocation(nearestLoc.id)}
              className="absolute bottom-6 right-5 sm:right-8 z-30 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-2xl border-2 border-white/60 flex items-center gap-2 animate-bounce cursor-pointer active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              <span>和 {nearestLoc.nameZh} 對話</span>
            </button>
          )}
        </>
      )}

      {/* ── Live 3D RPG Dialogue HUD ── */}
      {activeDialogueLocation && activeDialogueLocation.id !== 'home' && (
        <Town3DDialogueHud
          key={activeDialogueLocation.id + (activeDialogueIsTeacher ? '_teacher' : '')}
          location={activeDialogueLocation}
          onClose={() => {
            stopSpeech();
            setActiveDialogueLocation(null);
            setActiveDialogueIsTeacher(false);
          }}
          onOpenShop={(shopId) => {
            stopSpeech();
            setActiveShopLocationId(shopId);
          }}
          onOpenQuests={() => {
            stopSpeech();
            setIsQuestBoardOpen(true);
          }}
          onQuestProgress={handleQuestProgress}
          isVisitingTeacher={activeDialogueIsTeacher}
          visitingTeacher={teacherInfo.teacher}
          onTeacherBonusClaimed={() =>
            handleTeacherBonusClaimed(() => {
              setActiveDialogueLocation(null);
              setActiveDialogueIsTeacher(false);
            })
          }
          onDialogueComplete={handleDialogueComplete}
        />
      )}

      {/* ── Reward Toasts ── */}
      {townDialogueToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 text-white flex items-center gap-3 shadow-2xl animate-bounce border border-white/40 max-w-[90vw]">
          <span className="text-2xl">{townDialogueToast.icon}</span>
          <div>
            <div className="font-black text-sm">{townDialogueToast.title}</div>
            <div className="text-xs text-white/90 font-bold">{townDialogueToast.desc}</div>
          </div>
        </div>
      )}

      {teacherBonusToast && (
        <div className="fixed top-16 right-4 z-50 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white flex items-center gap-3 shadow-2xl animate-bounce">
          <Sparkles className="w-6 h-6" />
          <div>
            <div className="font-black text-sm">獲得 {teacherBonusToast.teacherName} 的每日驚喜獎勵！</div>
            <div className="text-xs font-bold">探索積分 +{teacherBonusToast.points} 點！</div>
          </div>
        </div>
      )}

      {/* ── Shared Sub-Modals (Home, Shop, Backpack, Quests) ── */}
      {isHomeOpen && <HomeScene onClose={() => setIsHomeOpen(false)} />}

      {activeShopLocationId && (
        <ShopModal
          locationId={activeShopLocationId}
          onClose={() => setActiveShopLocationId(null)}
          onQuestProgress={handleQuestProgress}
        />
      )}

      {isBackpackOpen && <BackpackModal onClose={() => setIsBackpackOpen(false)} />}

      {isQuestBoardOpen && (
        <QuestBoardModal
          onClose={() => setIsQuestBoardOpen(false)}
          onNavigateLocation={(targetLocId) => {
            setTeleportRequest({ locationId: targetLocId, ts: Date.now() });
            setIsQuestBoardOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default WutaiTown3DGame;
