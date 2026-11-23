import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchStudentProfile,
  upsertStudentProfile,
  updateStudentCoins as apiUpdateCoins,
  updateStudentQuestPoints as apiUpdateQuestPoints,
  updateStudentInventory as apiUpdateInventory,
  updateStudentDailyQuest as apiUpdateDailyQuest,
  syncStudentGrimoireToCloud,
  updateStudentTransferPin as apiUpdateTransferPin,
  executeStudentSelfTransfer
} from '../services/supabase';
import { hydrateGrimoireFromProfile } from '../utils/grimoireHelper';
import { mergeDailyQuestPreservingMeta } from '../services/accountTransferHelper';
import {
  formatStudentId,
  parseStudentId,
  isBookInOwnGrade,
  getRandomFunNickname
} from '../utils/studentIdHelper';
import {
  getCurrentSemesterId,
  getSemesterDisplayName,
  checkAndApplySemesterReset
} from '../utils/semesterHelper';
import { containsProfanity } from '../services/profanityFilter';

const StudentContext = createContext(null);

const LAST_STUDENT_ID_KEY = 'wutai_last_student_id';

export const StudentProvider = ({ children }) => {
  const [currentStudent, setCurrentStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [semesterNotice, setSemesterNotice] = useState(null);

  // 初始化：嘗試自本機記憶載入上次漫遊座號或訪客狀態
  useEffect(() => {
    let isCancelled = false;
    const initStudent = async () => {
      try {
        const lastId = localStorage.getItem(LAST_STUDENT_ID_KEY);
        if (lastId && lastId.length === 6) {
          try {
            const profile = await fetchStudentProfile(lastId);
            if (!isCancelled && profile) {
              const avatarId = localStorage.getItem(`wutai_avatar_${lastId}`) || profile.avatar_id || 'boy_scout';
              const frameId = localStorage.getItem(`wutai_frame_${lastId}`) || profile.avatar_frame || 'frame_slate';
              const enriched = { ...profile, avatar_id: avatarId, avatar_frame: frameId };
              const hydrated = hydrateGrimoireFromProfile(lastId, enriched);
              if (hydrated.localHadNewer) {
                syncStudentGrimoireToCloud(lastId, hydrated.progress, hydrated.history).catch(() => {});
              }
              setCurrentStudent(enriched);
              if (profile.has_just_reset_semester) {
                setSemesterNotice(profile.last_reset_notice || '🎉 歡迎進入新學期！全新學期競賽已開跑！');
              }
              return;
            }
          } catch (e) {}

          const parsed = parseStudentId(lastId);
          if (parsed.isValid && !isCancelled) {
            const fallbackProfile = {
              student_id: lastId,
              grade: parsed.grade,
              classNum: parsed.classNum,
              seat: parsed.seat,
              nickname: parsed.isGuest ? '神秘訪客勇士' : `學生${lastId.slice(-2)}`,
              coins: 0,
              quest_points: 0,
              avatar_id: localStorage.getItem(`wutai_avatar_${lastId}`) || 'boy_scout',
              avatar_frame: localStorage.getItem(`wutai_frame_${lastId}`) || 'frame_slate'
            };
            setCurrentStudent(fallbackProfile);
            return;
          }
        }
        // 嘗試載入離線/訪客存檔
        const guestSaved = localStorage.getItem('wutai_guest_student');
        if (guestSaved && !isCancelled) {
          try {
            const parsed = JSON.parse(guestSaved);
            const checked = checkAndApplySemesterReset(parsed);
            const avatarId = localStorage.getItem('wutai_avatar_guest') || checked.avatar_id || 'boy_scout';
            const frameId = localStorage.getItem('wutai_frame_guest') || checked.avatar_frame || 'frame_slate';
            const enriched = { ...checked, avatar_id: avatarId, avatar_frame: frameId };
            setCurrentStudent(enriched);
            if (checked.has_just_reset_semester) {
              setSemesterNotice(checked.last_reset_notice);
              try { localStorage.setItem('wutai_guest_student', JSON.stringify(enriched)); } catch (e) {}
            }
          } catch (e) {}
        }
      } catch (e) {
        console.warn('載入上次學生身分失敗:', e);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    initStudent();
    return () => {
      isCancelled = true;
    };
  }, []);

  /**
   * 登入 / 切換座號雲端漫遊身分
   */
  const loginStudent = useCallback(async ({ grade, classNum, seat, nickname }) => {
    setIsLoading(true);
    try {
      const studentId = formatStudentId(grade, classNum, seat);
      let cleanNick = (nickname || '').trim();
      if (!cleanNick) {
        cleanNick = getRandomFunNickname();
      } else if (containsProfanity(cleanNick)) {
        cleanNick = '文明好學生';
      }

      // 先嘗試自雲端或快取取得既有資料
      const existing = await fetchStudentProfile(studentId);
      const currentSem = getCurrentSemesterId();
      const localAvatar = localStorage.getItem(`wutai_avatar_${studentId}`) || existing?.avatar_id || 'boy_scout';
      const localFrame = localStorage.getItem(`wutai_frame_${studentId}`) || existing?.avatar_frame || 'frame_slate';
      const profileToSave = {
        student_id: studentId,
        grade: String(grade).padStart(2, '0'),
        class: String(classNum).padStart(2, '0'),
        seat: String(seat).padStart(2, '0'),
        nickname: cleanNick,
        avatar_id: localAvatar,
        avatar_frame: localFrame,
        coins: existing?.coins ?? 0,
        quest_points: existing?.quest_points ?? 0,
        semester_id: existing?.semester_id || currentSem,
        semester_history: Array.isArray(existing?.semester_history) ? existing.semester_history : [],
        inventory: Array.isArray(existing?.inventory) ? existing.inventory : [],
        daily_quest: (typeof existing?.daily_quest === 'object' && existing?.daily_quest) ? existing.daily_quest : {}
      };

      const saved = await upsertStudentProfile(profileToSave);
      const finalProfile = saved || profileToSave;

      const hydrated = hydrateGrimoireFromProfile(studentId, finalProfile);
      if (hydrated.localHadNewer) {
        syncStudentGrimoireToCloud(studentId, hydrated.progress, hydrated.history).catch(() => {});
      }

      setCurrentStudent(finalProfile);
      localStorage.setItem(LAST_STUDENT_ID_KEY, studentId);
      setIsModalOpen(false);
      return { success: true, student: finalProfile };
    } catch (err) {
      console.error('登入學生失敗:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 登出當前身分 (切換前置作業，確保共用 iPad 不殘留上一位學生座號)
   */
  const logoutStudent = useCallback(() => {
    setCurrentStudent(null);
    try {
      localStorage.removeItem(LAST_STUDENT_ID_KEY);
    } catch (e) {}
  }, []);

  /**
   * 增加金幣 (樂觀更新 + 雲端同步)
   */
  const addCoins = useCallback(async (amount) => {
    if (typeof amount !== 'number' || amount <= 0) return 0;
    
    // 若尚未登入或為訪客，在前端本地狀態依然累加金幣
    if (!currentStudent?.student_id) {
      const nextCoins = ((currentStudent?.coins ?? 100) + amount);
      setCurrentStudent(prev => {
        const updated = {
          nickname: prev?.nickname || '好學生',
          student_id: prev?.student_id || 'guest',
          grade: prev?.grade || '00',
          coins: nextCoins,
          quest_points: prev?.quest_points || 0,
          inventory: prev?.inventory || []
        };
        try { localStorage.setItem('wutai_guest_student', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
      return nextCoins;
    }

    const newCoins = (currentStudent.coins || 0) + amount;
    setCurrentStudent(prev => prev ? { ...prev, coins: newCoins } : null);

    try {
      await apiUpdateCoins(currentStudent.student_id, amount);
    } catch (e) {
      console.warn('雲端金幣同步異常:', e);
    }
    return newCoins;
  }, [currentStudent]);

  /**
   * 消費金幣 (樂觀更新 + 雲端同步)
   * 若餘額不足返回 false
   */
  const spendCoins = useCallback(async (amount) => {
    if (typeof amount !== 'number' || amount <= 0) return false;
    const currentCoins = currentStudent?.coins || 0;
    if (currentCoins < amount) {
      return false; // 金幣不足
    }

    const newCoins = currentCoins - amount;
    setCurrentStudent(prev => {
      const updated = prev ? { ...prev, coins: newCoins } : null;
      if (!currentStudent?.student_id) {
        try { localStorage.setItem('wutai_guest_student', JSON.stringify(updated)); } catch (e) {}
      }
      return updated;
    });

    if (currentStudent?.student_id) {
      try {
        await apiUpdateCoins(currentStudent.student_id, -amount);
      } catch (e) {
        console.warn('雲端金幣扣除同步異常:', e);
      }
    }
    return true;
  }, [currentStudent]);

  /**
   * 增加探索積分
   */
  const addQuestPoints = useCallback(async (amount) => {
    if (typeof amount !== 'number' || amount <= 0) return 0;

    // 若尚未登入或為訪客，在前端本地狀態依然累加積分
    if (!currentStudent?.student_id) {
      const nextPoints = ((currentStudent?.quest_points ?? 0) + amount);
      setCurrentStudent(prev => {
        const updated = {
          nickname: prev?.nickname || '好學生',
          student_id: prev?.student_id || 'guest',
          grade: prev?.grade || '00',
          coins: prev?.coins ?? 100,
          quest_points: nextPoints,
          inventory: prev?.inventory || []
        };
        try { localStorage.setItem('wutai_guest_student', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
      return nextPoints;
    }

    const newPoints = (currentStudent.quest_points || 0) + amount;
    setCurrentStudent(prev => prev ? { ...prev, quest_points: newPoints } : null);

    try {
      await apiUpdateQuestPoints(currentStudent.student_id, amount);
    } catch (e) {
      console.warn('雲端積分同步異常:', e);
    }
    return newPoints;
  }, [currentStudent]);

  /**
   * 更新背包物品庫
   */
  const updateInventory = useCallback(async (newInventory) => {
    if (!currentStudent?.student_id || !Array.isArray(newInventory)) return;
    setCurrentStudent(prev => prev ? { ...prev, inventory: newInventory } : null);

    try {
      await apiUpdateInventory(currentStudent.student_id, newInventory);
    } catch (e) {
      console.warn('雲端背包同步異常:', e);
    }
  }, [currentStudent]);

  /**
   * 更新每日任務（保留 _grimoire / _transfer_pin 等系統中繼欄位）
   */
  const updateDailyQuest = useCallback(async (dailyQuestData) => {
    if (!currentStudent?.student_id || typeof dailyQuestData !== 'object') return;
    setCurrentStudent(prev => {
      if (!prev) return null;
      return {
        ...prev,
        daily_quest: mergeDailyQuestPreservingMeta(prev.daily_quest || {}, dailyQuestData)
      };
    });

    try {
      await apiUpdateDailyQuest(currentStudent.student_id, dailyQuestData);
    } catch (e) {
      console.warn('雲端每日任務同步異常:', e);
    }
  }, [currentStudent]);

  /**
   * 領取今日客座外師彩蛋獎勵 (+5~10 探索積分)
   */
  const claimTeacherBonus = useCallback(async (bonusPoints, teacherName) => {
    if (!currentStudent?.student_id || typeof bonusPoints !== 'number') return 0;
    const today = new Date().toISOString().slice(0, 10);
    const newPoints = (currentStudent.quest_points || 0) + bonusPoints;

    const currentDailyQuest = (typeof currentStudent.daily_quest === 'object' && currentStudent.daily_quest) ? currentStudent.daily_quest : {};
    const updatedDailyQuest = {
      ...currentDailyQuest,
      teacherMetDate: today,
      lastTeacherName: teacherName,
      lastTeacherBonus: bonusPoints
    };

    const updated = {
      ...currentStudent,
      quest_points: newPoints,
      daily_quest: updatedDailyQuest
    };

    setCurrentStudent(updated);

    try {
      await apiUpdateQuestPoints(currentStudent.student_id, bonusPoints);
      await apiUpdateDailyQuest(currentStudent.student_id, updatedDailyQuest);
    } catch (e) {
      console.warn('客座外師獎勵同步異常:', e);
    }
    return newPoints;
  }, [currentStudent]);

  /**
   * 重新拉取最新雲端學生檔案
   */
  const refreshStudentProfile = useCallback(async () => {
    if (!currentStudent?.student_id) return;
    try {
      const refreshed = await fetchStudentProfile(currentStudent.student_id);
      if (refreshed) {
        const hydrated = hydrateGrimoireFromProfile(currentStudent.student_id, refreshed);
        if (hydrated.localHadNewer) {
          syncStudentGrimoireToCloud(currentStudent.student_id, hydrated.progress, hydrated.history).catch(() => {});
        }
        setCurrentStudent(refreshed);
      }
    } catch (e) {}
  }, [currentStudent?.student_id]);

  /**
   * 設定或變更 4 碼換機／換號密碼
   */
  const setTransferPin = useCallback(async (pin4) => {
    if (!currentStudent?.student_id) {
      return { success: false, error: '請先登入正式 6 碼座號。' };
    }
    const res = await apiUpdateTransferPin(currentStudent.student_id, pin4);
    if (res.success && res.profile) {
      setCurrentStudent(prev => prev ? {
        ...prev,
        daily_quest: mergeDailyQuestPreservingMeta(prev.daily_quest || {}, res.profile.daily_quest || {})
      } : res.profile);
    }
    return res;
  }, [currentStudent?.student_id]);

  /**
   * 軌道二：以舊 6 碼座號 ＋ 4 碼換機密碼自行匯入舊資料
   */
  const importOldSeatData = useCallback(async (sourceStudentId, pin4) => {
    if (!currentStudent?.student_id) {
      return { success: false, error: '請先登入您的新座號後再執行匯入。' };
    }
    const res = await executeStudentSelfTransfer({
      sourceStudentId,
      pin4,
      targetStudentId: currentStudent.student_id
    });
    if (res.success && res.targetProfile) {
      setCurrentStudent(prev => ({
        ...res.targetProfile,
        avatar_id: prev?.avatar_id || 'boy_scout',
        avatar_frame: prev?.avatar_frame || 'frame_slate'
      }));
    }
    return res;
  }, [currentStudent?.student_id]);

  /**
   * 判斷是否為學生本年級教材 (支援字母模式直接符合一、二年級)
   */
  const isOwnGradeBook = useCallback((book, mode = null) => {
    if (!currentStudent) return true; // 未登入前不限制
    return isBookInOwnGrade(book, currentStudent.grade, mode);
  }, [currentStudent]);

  /**
   * 切換自訂勇士頭像立繪與石板神槽外框
   */
  const updateAvatar = useCallback(async (avatarId, frameId = null) => {
    if (!currentStudent) return;
    const nextAvatar = avatarId || currentStudent.avatar_id || 'boy_scout';
    const nextFrame = frameId || currentStudent.avatar_frame || 'frame_slate';
    const studentId = currentStudent.student_id || 'guest';

    const updated = {
      ...currentStudent,
      avatar_id: nextAvatar,
      avatar_frame: nextFrame
    };

    setCurrentStudent(updated);

    try {
      localStorage.setItem(`wutai_avatar_${studentId}`, nextAvatar);
      localStorage.setItem(`wutai_frame_${studentId}`, nextFrame);
      if (!currentStudent.student_id || currentStudent.student_id === 'guest') {
        localStorage.setItem('wutai_guest_student', JSON.stringify(updated));
      }
    } catch (e) {}

    if (currentStudent.student_id && currentStudent.student_id !== 'guest') {
      try {
        await upsertStudentProfile(updated);
      } catch (e) {
        console.warn('更新頭像雲端同步暫緩:', e);
      }
    }
    return updated;
  }, [currentStudent]);

  const value = {
    currentStudent,
    isLoggedIn: Boolean(currentStudent),
    isLoading,
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    loginStudent,
    logoutStudent,
    updateAvatar,
    avatarId: currentStudent?.avatar_id || 'boy_scout',
    avatarFrame: currentStudent?.avatar_frame || 'frame_slate',
    addCoins,
    spendCoins,
    addQuestPoints,
    updateInventory,
    updateDailyQuest,
    claimTeacherBonus,
    refreshStudentProfile,
    setTransferPin,
    importOldSeatData,
    isOwnGradeBook,
    studentGrade: currentStudent?.grade || '00',
    coins: currentStudent?.coins || 0,
    questPoints: currentStudent?.quest_points || 0,
    inventory: currentStudent?.inventory || [],
    currentSemesterId: getCurrentSemesterId(),
    semesterName: getSemesterDisplayName(),
    semesterNotice,
    clearSemesterNotice: () => setSemesterNotice(null)
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
