import { useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  TOWN_ITEMS,
  getTodayDateStr,
  getDailyVisitingTeacherInfo,
  DAILY_QUEST_MASTER_POOL
} from './townData';
import { soundEngine, stopSpeech } from '../../services/audio';

/**
 * Shared hook for Wutai Town (both 2D panorama and 3D immersive world)
 * handling daily anti-inflation coin rewards, visiting teacher bonuses,
 * and 52-template daily quest progress tracking.
 */
export function useTownEconomy({
  currentStudent,
  addCoins,
  addQuestPoints,
  updateDailyQuest,
  claimTeacherBonus
}) {
  const todayStr = useMemo(() => getTodayDateStr(), []);
  const teacherInfo = useMemo(() => getDailyVisitingTeacherInfo(todayStr), [todayStr]);
  const studentId = currentStudent?.student_id || 'guest';
  const dialogueStorageKey = `wutai_town_dialogues_${studentId}_${todayStr}`;
  const hasMetTeacherToday = currentStudent?.daily_quest?.teacherMetDate === todayStr;

  const [teacherBonusToast, setTeacherBonusToast] = useState(null);
  const [townDialogueToast, setTownDialogueToast] = useState(null);

  const [dailyDialogueRecord, setDailyDialogueRecord] = useState(() => {
    try {
      const saved = localStorage.getItem(dialogueStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.coinsEarned === 'number' && Array.isArray(parsed.completedLocations)) {
          return parsed;
        }
      }
    } catch (e) {}
    return { date: todayStr, coinsEarned: 0, completedLocations: [] };
  });

  const handleDialogueComplete = useCallback(async (locationId) => {
    if (!locationId) return;

    let currentRecord = dailyDialogueRecord;
    try {
      const saved = localStorage.getItem(dialogueStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.coinsEarned === 'number' && Array.isArray(parsed.completedLocations)) {
          currentRecord = parsed;
        }
      }
    } catch (e) {}

    const isFirstTimeAtLocationToday = !currentRecord.completedLocations.includes(locationId);
    const hasReachedDailyCoinCap = currentRecord.coinsEarned >= 6;
    let toastInfo = null;

    if (isFirstTimeAtLocationToday && !hasReachedDailyCoinCap) {
      const newCoinsEarned = currentRecord.coinsEarned + 1;
      const updated = {
        date: todayStr,
        coinsEarned: newCoinsEarned,
        completedLocations: [...currentRecord.completedLocations, locationId]
      };
      setDailyDialogueRecord(updated);
      try {
        localStorage.setItem(dialogueStorageKey, JSON.stringify(updated));
      } catch (e) {}

      if (addCoins) {
        await addCoins(1);
      }
      soundEngine.win();
      try {
        confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
      } catch (e) {}

      toastInfo = {
        icon: '🪙',
        title: '完成生活英語對話！',
        desc: `獲得宇宙金幣 +1！(今日小鎮金幣: ${newCoinsEarned}/6)`,
        type: 'coin'
      };
    } else if (isFirstTimeAtLocationToday && hasReachedDailyCoinCap) {
      const updated = {
        date: todayStr,
        coinsEarned: currentRecord.coinsEarned,
        completedLocations: [...currentRecord.completedLocations, locationId]
      };
      setDailyDialogueRecord(updated);
      try {
        localStorage.setItem(dialogueStorageKey, JSON.stringify(updated));
      } catch (e) {}

      if (addQuestPoints) {
        await addQuestPoints(1);
      }
      soundEngine.correct();

      toastInfo = {
        icon: '🌟',
        title: '今日小鎮金幣已達上限 (6/6)',
        desc: '持續自主生活英語探索，獲得榮譽探索積分 +1！',
        type: 'points'
      };
    } else {
      if (addQuestPoints) {
        await addQuestPoints(1);
      }
      soundEngine.correct();

      toastInfo = {
        icon: '💬',
        title: '溫故知新，練習生活美語！',
        desc: '今日該地標已領取金幣，反覆自主練習獲得探索積分 +1！',
        type: 'points'
      };
    }

    if (toastInfo) {
      setTownDialogueToast(toastInfo);
      setTimeout(() => {
        setTownDialogueToast(null);
      }, 4200);
    }
  }, [todayStr, dialogueStorageKey, dailyDialogueRecord, addCoins, addQuestPoints]);

  const handleTeacherBonusClaimed = useCallback(async (onAfterClear) => {
    stopSpeech();
    if (onAfterClear) onAfterClear();

    const bonus = Math.floor(Math.random() * 11) + 10;
    soundEngine.win();
    try {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    } catch (e) {}

    if (claimTeacherBonus) {
      await claimTeacherBonus(bonus, teacherInfo.teacher.nameZh);
    }

    setTeacherBonusToast({
      teacherName: teacherInfo.teacher.nameZh,
      points: bonus
    });

    setTimeout(() => {
      setTeacherBonusToast(null);
    }, 4500);
  }, [claimTeacherBonus, teacherInfo.teacher.nameZh]);

  const handleQuestProgress = useCallback(async (actionType, param1, param2) => {
    const dailyQuest = currentStudent?.daily_quest;
    if (!dailyQuest || dailyQuest.completed || dailyQuest.rewardClaimed) return;

    const currentQuestId = dailyQuest.questId || dailyQuest.activeQuestId;
    if (!currentQuestId) return;

    const template = DAILY_QUEST_MASTER_POOL.find(q => q.id === currentQuestId);
    if (!template) return;

    const prevProgress = (typeof dailyQuest.progress === 'object' && dailyQuest.progress) ? dailyQuest.progress : {};
    const visitedLocations = Array.isArray(prevProgress.visitedLocations) ? [...prevProgress.visitedLocations] : [];
    const boughtItems = Array.isArray(prevProgress.boughtItems) ? [...prevProgress.boughtItems] : [];

    let progressChanged = false;

    if (actionType === 'dialogue' && param1 && param2 && param2 !== 'welcome') {
      if (!visitedLocations.includes(param1)) {
        visitedLocations.push(param1);
        progressChanged = true;
      }
    }

    if (actionType === 'buy' && param2) {
      if (!boughtItems.includes(param2)) {
        boughtItems.push(param2);
        progressChanged = true;
      }
      const shopLoc = TOWN_ITEMS.find(it => it.id === param2)?.shopId;
      if (shopLoc && !visitedLocations.includes(shopLoc)) {
        visitedLocations.push(shopLoc);
        progressChanged = true;
      }
    }

    let shouldComplete = false;

    if (template.type === 'talk') {
      if (visitedLocations.includes(template.targetLocation)) {
        shouldComplete = true;
      }
    } else if (template.type === 'buy_item') {
      if (boughtItems.includes(template.targetItemId)) {
        shouldComplete = true;
      }
    } else if (template.type === 'buy_category') {
      if (actionType === 'buy' && param1 === template.targetCategory) {
        shouldComplete = true;
      }
    } else if (template.type === 'talk_or_buy') {
      if (visitedLocations.includes(template.targetLocation)) {
        shouldComplete = true;
      }
    } else if (template.type === 'multi_tour') {
      if (Array.isArray(template.targetLocations) && template.targetLocations.every(loc => visitedLocations.includes(loc))) {
        shouldComplete = true;
      }
    } else if (template.type === 'buy_and_visit') {
      const hasBought = Array.isArray(template.validItemIds)
        ? template.validItemIds.some(id => boughtItems.includes(id))
        : boughtItems.length > 0;
      const hasVisited = visitedLocations.includes(template.targetLocation);
      if (hasBought && hasVisited) {
        shouldComplete = true;
      }
    } else if (template.type === 'grand_tour') {
      if (visitedLocations.length >= (template.requiredCount || 3)) {
        shouldComplete = true;
      }
    }

    if (shouldComplete) {
      soundEngine.win();
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      await updateDailyQuest({
        ...dailyQuest,
        completed: true,
        completedAt: new Date().toISOString(),
        progress: { visitedLocations, boughtItems }
      });
    } else if (progressChanged) {
      await updateDailyQuest({
        ...dailyQuest,
        progress: { visitedLocations, boughtItems }
      });
    }
  }, [currentStudent?.daily_quest, updateDailyQuest]);

  return {
    todayStr,
    teacherInfo,
    hasMetTeacherToday,
    dailyDialogueRecord,
    townDialogueToast,
    teacherBonusToast,
    handleDialogueComplete,
    handleTeacherBonusClaimed,
    handleQuestProgress
  };
}
