import { createClient } from '@supabase/supabase-js';
import { containsProfanity } from './profanityFilter';
import { getCurrentSemesterId, checkAndApplySemesterReset } from '../utils/semesterHelper';
import { parseStudentId, isGuestStudent } from '../utils/studentIdHelper';
import {
  registerGrimoireCloudSync,
  replaceLocalGrimoire,
  mergeGrimoireProgress,
  mergeGrimoireHistory
} from '../utils/grimoireHelper';
import {
  mergeDailyQuestPreservingMeta,
  isValidTransferPin,
  getTransferPinFromProfile,
  isProfileArchived,
  detectPromotionConflicts,
  getPlannedTargetId,
  buildTransferredTargetProfile,
  buildArchivedSourceProfile,
  getCurrentAcademicYear
} from './accountTransferHelper';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fqkdkmcqjswufzbvkram.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_M9phUn6LH1yeVA9NbIXesg_tVABCW5z';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── 本機離線備用題庫 (確保護航：斷網或資料庫初始化前仍能暢玩) ──
export const FALLBACK_WORDS = [
  // 第 1 冊
  { id: 'f-1', author: 'Official', book: '1', lesson: '1', en: 'apple', zh: '蘋果' },
  { id: 'f-2', author: 'Official', book: '1', lesson: '1', en: 'banana', zh: '香蕉' },
  { id: 'f-3', author: 'Official', book: '1', lesson: '1', en: 'cat', zh: '貓' },
  { id: 'f-4', author: 'Official', book: '1', lesson: '1', en: 'dog', zh: '狗' },
  { id: 'f-5', author: 'Official', book: '1', lesson: '2', en: 'elephant', zh: '大象' },
  { id: 'f-6', author: 'Official', book: '1', lesson: '2', en: 'fish', zh: '魚' },
  { id: 'f-7', author: 'Official', book: '1', lesson: '2', en: 'grape', zh: '葡萄' },
  { id: 'f-8', author: 'Official', book: '1', lesson: '2', en: 'hat', zh: '帽子' },
  // 第 2 冊
  { id: 'f-9', author: 'Official', book: '2', lesson: '1', en: 'ruler', zh: '尺' },
  { id: 'f-10', author: 'Official', book: '2', lesson: '1', en: 'pencil', zh: '鉛筆' },
  { id: 'f-11', author: 'Official', book: '2', lesson: '1', en: 'eraser', zh: '橡皮擦' },
  { id: 'f-12', author: 'Official', book: '2', lesson: '1', en: 'book', zh: '書本' },
  { id: 'f-13', author: 'Official', book: '2', lesson: '2', en: 'red', zh: '紅色' },
  { id: 'f-14', author: 'Official', book: '2', lesson: '2', en: 'blue', zh: '藍色' },
  { id: 'f-15', author: 'Official', book: '2', lesson: '2', en: 'yellow', zh: '黃色' },
  { id: 'f-16', author: 'Official', book: '2', lesson: '2', en: 'green', zh: '綠色' },
  // Mario 老師專區
  { id: 'f-m1', author: 'Mario', book: 'Mario專區', lesson: 'Unit 1 食物與甜點', en: 'pizza', zh: '披薩' },
  { id: 'f-m2', author: 'Mario', book: 'Mario專區', lesson: 'Unit 1 食物與甜點', en: 'hamburger', zh: '漢堡' },
  { id: 'f-m3', author: 'Mario', book: 'Mario專區', lesson: 'Unit 1 食物與甜點', en: 'ice cream', zh: '冰淇淋' },
  { id: 'f-m4', author: 'Mario', book: 'Mario專區', lesson: 'Unit 1 食物與甜點', en: 'sandwich', zh: '三明治' },
  // Ibu 老師專區
  { id: 'f-i1', author: 'Ibu', book: 'Ibu專區', lesson: 'Unit 1 自然與動物', en: 'mountain', zh: '山' },
  { id: 'f-i2', author: 'Ibu', book: 'Ibu專區', lesson: 'Unit 1 自然與動物', en: 'river', zh: '河流' },
  { id: 'f-i3', author: 'Ibu', book: 'Ibu專區', lesson: 'Unit 1 自然與動物', en: 'butterfly', zh: '蝴蝶' },
  { id: 'f-i4', author: 'Ibu', book: 'Ibu專區', lesson: 'Unit 1 自然與動物', en: 'flower', zh: '花朵' },
  // Vanessa 老師專區
  { id: 'f-v1', author: 'Vanessa', book: 'Vanessa專區', lesson: 'Unit 1 學校生活', en: 'classroom', zh: '教室' },
  { id: 'f-v2', author: 'Vanessa', book: 'Vanessa專區', lesson: 'Unit 1 學校生活', en: 'teacher', zh: '老師' },
  { id: 'f-v3', author: 'Vanessa', book: 'Vanessa專區', lesson: 'Unit 1 學校生活', en: 'student', zh: '學生' },
  { id: 'f-v4', author: 'Vanessa', book: 'Vanessa專區', lesson: 'Unit 1 學校生活', en: 'library', zh: '圖書館' },
  // Mark 老師專區
  { id: 'f-k1', author: 'Mark', book: 'Mark專區', lesson: 'Unit 1 運動休閒', en: 'basketball', zh: '籃球' },
  { id: 'f-k2', author: 'Mark', book: 'Mark專區', lesson: 'Unit 1 運動休閒', en: 'soccer', zh: '足球' },
  { id: 'f-k3', author: 'Mark', book: 'Mark專區', lesson: 'Unit 1 運動休閒', en: 'swimming', zh: '游泳' },
  { id: 'f-k4', author: 'Mark', book: 'Mark專區', lesson: 'Unit 1 運動休閒', en: 'running', zh: '跑步' }
];

// ── 裝置專屬 UUID 生成與獲取 ──
export const getDeviceId = () => {
  const KEY = 'wutai_device_id_v2';
  let deviceId = localStorage.getItem(KEY);
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem(KEY, deviceId);
  }
  return deviceId;
};

// ── 取得當前年第幾週 (ISO Week) ──
export const getWeekNumber = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// ── 題庫快取機制 (輕量中繼探針：自動偵測題庫更新，杜絕跨裝置快取滯後) ──
const WORDS_CACHE_KEY = 'wutai_words_cache_v3';
const WORDS_CACHE_TIME_KEY = 'wutai_words_cache_time_v3';
const WORDS_CACHE_META_KEY = 'wutai_words_meta_v3';
const WORDS_CACHE_TTL = 30 * 60 * 1000; // 30 分鐘整體 TTL
const REMOTE_PROBE_INTERVAL = 60 * 1000; // 每 60 秒透過極輕量 HEAD 查詢探測遠端是否有異動

export const invalidateWordsCache = () => {
  try {
    localStorage.removeItem(WORDS_CACHE_KEY);
    localStorage.removeItem(WORDS_CACHE_TIME_KEY);
    localStorage.removeItem(WORDS_CACHE_META_KEY);
  } catch (e) {}
};

// ── 載入所有單字 (含跨裝置即時同步探針) ──
export const fetchWordsFromDb = async (force = false) => {
  try {
    const cached = localStorage.getItem(WORDS_CACHE_KEY);
    const cachedTime = localStorage.getItem(WORDS_CACHE_TIME_KEY);
    const cachedMeta = localStorage.getItem(WORDS_CACHE_META_KEY);

    if (!force && cached && cachedTime) {
      const timeElapsed = Date.now() - parseInt(cachedTime, 10);

      // 若在探測週期內 (小於 60 秒)，直接返回本機快取以節省頻寬
      if (timeElapsed < REMOTE_PROBE_INTERVAL) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      } else if (timeElapsed < WORDS_CACHE_TTL) {
        // 已過 60 秒：發起極輕量探針 (只查 count 與最新 created_at，不載入表格內容，消耗 <100 bytes)
        try {
          const [{ count }, { data: latestRow }] = await Promise.all([
            supabase.from('words').select('id', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('words').select('created_at').order('created_at', { ascending: false }).limit(1)
          ]);

          const remoteVersion = `${count || 0}_${latestRow?.[0]?.created_at || ''}`;
          if (cachedMeta === remoteVersion) {
            // 遠端資料完全未變更！刷新探測時間戳並繼續使用快取
            localStorage.setItem(WORDS_CACHE_TIME_KEY, Date.now().toString());
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
          // 若 remoteVersion 不同，說明老師在後台新增或異動了單字，自動穿透快取重新抓取！
        } catch (probeErr) {
          // 網路探測異常時，平滑使用既有快取護航
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch (e) {}
        }
      }
    }

    // 重新自 Supabase 取得完整題庫
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('is_active', true)
      .order('book', { ascending: true })
      .order('lesson', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Supabase 題庫讀取回退至備用題庫:', error?.message);
      if (cached) {
        try { return JSON.parse(cached); } catch (e) {}
      }
      return FALLBACK_WORDS;
    }

    // 成功取得資料，寫入本機快取與最新版本號
    try {
      const latestTime = data.reduce((max, w) => (w.created_at > max ? w.created_at : max), '');
      const metaVersion = `${data.length}_${latestTime}`;
      localStorage.setItem(WORDS_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(WORDS_CACHE_TIME_KEY, Date.now().toString());
      localStorage.setItem(WORDS_CACHE_META_KEY, metaVersion);
    } catch (e) {}

    return data;
  } catch (err) {
    console.warn('題庫連線異常，啟用備用題庫:', err);
    const cached = localStorage.getItem(WORDS_CACHE_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return FALLBACK_WORDS;
  }
};

// ── 批次新增單字 (教師專區) ──
export const insertWordsBatch = async (wordsList) => {
  const { data, error } = await supabase.from('words').insert(wordsList).select();
  if (error) throw error;
  invalidateWordsCache(); // 清除本機快取
  return data;
};

// ── 刪除單字 ──
export const deleteWordById = async (id) => {
  const { error } = await supabase.from('words').delete().eq('id', id);
  if (error) throw error;
  invalidateWordsCache(); // 清除本機快取
};

// ── 上傳遊戲成績 (共用 iPad 防覆蓋：以 device_id + name 雙鍵隔離不同學生) ──
export const uploadScore = async ({ mode, book, name, score, time }) => {
  const deviceId = getDeviceId();
  const currentWeek = getWeekNumber();
  let cleanName = (name || '').trim();
  if (!cleanName) return false;

  // 拒絕不雅名稱寫入資料庫
  if (containsProfanity(cleanName)) {
    cleanName = '文明好學生';
  }

  const actualBook = (book && book !== 'null' && book !== 'undefined') ? String(book) : 'abc';

  try {
    // 檢查本週同裝置且同姓名的紀錄 (同台 iPad 不同學生戰績完全獨立)
    const { data: existing } = await supabase
      .from('leaderboard')
      .select('id, score, time')
      .eq('device_id', deviceId)
      .eq('name', cleanName)
      .eq('week', currentWeek)
      .eq('mode', mode)
      .eq('book', actualBook)
      .maybeSingle();

    const isTimeAscending = mode === 'spotter' || mode === 'escape';
    // 嚴格防禦：找不同 (需 > 0 秒) 與密室逃脫 (需 > 1 秒，因三連關必大於 1 秒)，若時間過短視為異常資料，嚴禁上榜
    const minValidTime = mode === 'escape' ? 1 : 0;
    if (isTimeAscending && (!time || Number(time) <= minValidTime)) {
      console.warn(`通關時間異常 (<= ${minValidTime} 秒)，已攔截上榜請求:`, time);
      return false;
    }

    if (existing) {
      // 找不同與密室逃脫：以過關時間升冪排序 (time ASC)，同時間再比剩餘愛心/機關數 (score DESC)
      // 若歷史資料包含 0 秒或 1 秒異常紀錄 (existing.time <= minValidTime)，以本次合規正常成績覆蓋！
      // 其他模式：以得分降冪排序 (score DESC)，同分再比通關速度 (time ASC)
      const isExistingBugged = isTimeAscending && (existing.time <= minValidTime);
      const isBetter = isTimeAscending
        ? (isExistingBugged && time > minValidTime) ||
          (!isExistingBugged && (
            (time > 0 && time < existing.time) ||
            (time === existing.time && score > existing.score)
          ))
        : (score > existing.score || (score === existing.score && (existing.time === 0 || time < existing.time)));
      if (isBetter) {
        await supabase
          .from('leaderboard')
          .update({ score, time, created_at: new Date().toISOString() })
          .eq('id', existing.id);
      }
    } else {
      await supabase.from('leaderboard').insert([{
        device_id: deviceId,
        name: cleanName,
        mode,
        book: actualBook,
        score,
        time,
        week: currentWeek
      }]);
    }
    return true;
  } catch (err) {
    console.error('成績上傳失敗:', err);
    return false;
  }
};

// ── 檢查是否達到進入前 50 名的門檻 ──
export const checkIfQualifiesForTop50 = async ({ mode, book, score, time }) => {
  if (!score || score <= 0) return false;
  const currentWeek = getWeekNumber();
  const actualBook = (book && book !== 'null' && book !== 'undefined') ? String(book) : 'abc';

  try {
    const isTimeAscending = mode === 'spotter' || mode === 'escape';
    const minValidTime = mode === 'escape' ? 1 : 0;
    if (isTimeAscending && (!time || Number(time) <= minValidTime)) {
      return false; // 秒數無效 (<= minValidTime) 絕對不予留名
    }

    const isHandwritingAlphabet =
      mode === 'handwriting-abc' || (mode === 'handwriting' && actualBook === 'abc');

    let query = supabase
      .from('leaderboard')
      .select('score, time')
      .eq('week', currentWeek)
      .eq('book', actualBook);

    if (isHandwritingAlphabet) {
      query = query.in('mode', ['handwriting', 'handwriting-abc']);
    } else {
      query = query.eq('mode', mode);
    }

    if (isTimeAscending) {
      query = query.gt('time', minValidTime).order('time', { ascending: true }).order('score', { ascending: false });
    } else {
      query = query.order('score', { ascending: false }).order('time', { ascending: true });
    }

    let timeoutId;
    let data = null;
    let error = null;
    try {
      const res = await Promise.race([
        query.limit(50),
        new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            resolve({ data: null, error: new Error('top50_timeout') });
          }, 3500);
        }),
      ]);
      data = res?.data ?? null;
      error = res?.error ?? null;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    if (error) return null; // 若連線異常或逾時，回傳 null 代表「暫未確認」，避免誤判上榜
    if (!data || data.length < 50) return true; // 未滿 50 人，任何正分皆可上榜！

    // 已滿 50 人門檻比較
    const last50th = data[data.length - 1];
    return isTimeAscending
      ? ((time > 0 && (last50th.time <= minValidTime || time < last50th.time)) || (time === last50th.time && score > last50th.score))
      : (score > last50th.score || (score === last50th.score && (last50th.time === 0 || time < last50th.time)));
  } catch (e) {
    return null;
  }
};

// ── 連線對戰勝場紀錄 (共用 iPad 身分隔離：以 device_id + name 獨立累加，不繼承他人勝場) ──
export const recordBattleWin = async ({ book, name }) => {
  const deviceId = getDeviceId();
  const currentWeek = getWeekNumber();
  const mode = 'battle-wins';
  let cleanName = (name || '').trim();
  if (!cleanName) return false;

  if (containsProfanity(cleanName)) {
    cleanName = '文明好學生';
  }

  try {
    const { data: existing } = await supabase
      .from('leaderboard')
      .select('id, score')
      .eq('device_id', deviceId)
      .eq('name', cleanName)
      .eq('week', currentWeek)
      .eq('mode', mode)
      .eq('book', String(book))
      .maybeSingle();

    if (existing) {
      await supabase
        .from('leaderboard')
        .update({
          score: (existing.score || 0) + 1,
          created_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('leaderboard')
        .insert([{
          device_id: deviceId,
          name: cleanName,
          mode,
          book: String(book),
          score: 1,
          time: 0,
          week: currentWeek
        }]);
    }
    return true;
  } catch (err) {
    console.error('連線勝場紀錄失敗:', err);
    return false;
  }
};

// ── 課本題庫檢定三大累計榜同步紀錄 (測驗王 mcq-king、勤學王 mcq-diligent、精準王 mcq-accurate) ──
export const recordMcqExamStats = async ({ grade, book, name, correctCount, totalCount }) => {
  const deviceId = getDeviceId();
  const currentWeek = getWeekNumber();
  let cleanName = (name || '').trim();
  if (!cleanName) return null;
  if (containsProfanity(cleanName)) {
    cleanName = '文明好學生';
  }

  const gNum = parseInt(grade, 10) || 0;
  let canonicalBook = String(book || '1');
  if (gNum === 1) canonicalBook = 'g1';
  else if (gNum === 2) canonicalBook = 'g2';
  else if (gNum === 3) canonicalBook = '1';
  else if (gNum === 4) canonicalBook = '3';
  else if (gNum === 5) canonicalBook = '5';
  else if (gNum === 6) canonicalBook = '7';

  try {
    // 讀取本週已累計之答對題數 (score) 與作答總題數 (time)
    const { data: existingDiligent } = await supabase
      .from('leaderboard')
      .select('id, score, time')
      .eq('device_id', deviceId)
      .eq('name', cleanName)
      .eq('week', currentWeek)
      .eq('mode', 'mcq-diligent')
      .eq('book', canonicalBook)
      .maybeSingle();

    const prevCorrect = Number(existingDiligent?.score || 0);
    const prevAttempted = Number(existingDiligent?.time || 0);
    const totalCorrect = prevCorrect + Number(correctCount || 0);
    const totalAttempted = prevAttempted + Number(totalCount || 0);
    if (totalAttempted <= 0) return null;

    const accuracyRatio = totalCorrect / totalAttempted;
    const accuracyPct = Math.round(accuracyRatio * 100);
    const kingScore = Math.max(1, Math.round(totalCorrect * accuracyRatio));

    const upsertModeRow = async (modeKey, scoreVal, timeVal) => {
      const { data: row } = await supabase
        .from('leaderboard')
        .select('id')
        .eq('device_id', deviceId)
        .eq('name', cleanName)
        .eq('week', currentWeek)
        .eq('mode', modeKey)
        .eq('book', canonicalBook)
        .maybeSingle();

      if (row?.id) {
        await supabase
          .from('leaderboard')
          .update({
            score: scoreVal,
            time: timeVal,
            created_at: new Date().toISOString()
          })
          .eq('id', row.id);
      } else {
        await supabase.from('leaderboard').insert([
          {
            device_id: deviceId,
            name: cleanName,
            mode: modeKey,
            book: canonicalBook,
            score: scoreVal,
            time: timeVal,
            week: currentWeek
          }
        ]);
      }
    };

    await Promise.all([
      upsertModeRow('mcq-diligent', totalCorrect, totalAttempted),
      upsertModeRow('mcq-king', kingScore, totalAttempted),
      totalAttempted >= 20
        ? upsertModeRow('mcq-accurate', accuracyPct, totalAttempted)
        : Promise.resolve()
    ]);

    // 清除本機排行榜快取，確保切換至英雄榜時立即顯示最新累計成績
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('lb_g4_')) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {}

    return { totalCorrect, totalAttempted, accuracyPct, kingScore };
  } catch (err) {
    console.error('題庫檢定累計榜同步失敗:', err);
    return null;
  }
};

// ── Test My English Pre-A1 官方模擬精熟榜同步紀錄 (mode: prea1-mastery) ──
export const recordPreA1MasteryLeaderboard = async ({ grade, name, studentId, masteredCount, totalItems = 300, masteryRate }) => {
  const deviceId = getDeviceId();
  const currentWeek = getWeekNumber();
  let cleanName = (name || '').trim();
  if (!cleanName) return null;
  if (containsProfanity(cleanName)) {
    cleanName = '文明好學生';
  }

  const gNum = parseInt(grade, 10) || 0;
  const canonicalBook = gNum > 0 ? `g${gNum}` : 'prea1';

  try {
    const { data: row } = await supabase
      .from('leaderboard')
      .select('id, score, time')
      .eq('device_id', deviceId)
      .eq('name', cleanName)
      .eq('week', currentWeek)
      .eq('mode', 'prea1-mastery')
      .maybeSingle();

    if (row?.id) {
      if (masteredCount >= (row.score || 0)) {
        await supabase
          .from('leaderboard')
          .update({
            score: masteredCount,
            time: masteryRate,
            book: canonicalBook,
            created_at: new Date().toISOString()
          })
          .eq('id', row.id);
      }
    } else {
      await supabase.from('leaderboard').insert([
        {
          device_id: deviceId,
          name: cleanName,
          mode: 'prea1-mastery',
          book: canonicalBook,
          score: masteredCount,
          time: masteryRate,
          week: currentWeek
        }
      ]);
    }

    // 清除英雄榜快取
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('lb_g4_')) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {}

    return { masteredCount, masteryRate };
  } catch (err) {
    console.warn('同步 Pre-A1 精熟排行失敗:', err);
    return null;
  }
};


// ── 讀取排行榜 (支援單冊/多冊與單模式/多模式合併，每位同學取最高成績) ──
export const fetchLeaderboard = async (week, mode, bookOrBooks, limit = 50) => {
  try {
    let query = supabase
      .from('leaderboard')
      .select('id, name, score, time, mode, book, created_at')
      .eq('week', week);

    if (Array.isArray(mode)) {
      query = query.in('mode', mode);
    } else if (mode && mode !== 'all') {
      query = query.eq('mode', mode);
    }

    if (Array.isArray(bookOrBooks)) {
      query = query.in('book', bookOrBooks.map(String));
    } else if (bookOrBooks && bookOrBooks !== 'all') {
      query = query.eq('book', String(bookOrBooks));
    }

    const isTimeAscending = (Array.isArray(mode) ? mode.includes('spotter') : mode === 'spotter') ||
                            (Array.isArray(mode) ? mode.includes('escape') : mode === 'escape');
    const isTimeDescending = (Array.isArray(mode) ? mode.includes('mcq-accurate') : mode === 'mcq-accurate');

    if (isTimeAscending) {
      // 密室逃脫三連關正常秒數必 > 1 秒，查詢時直接過濾歷史 0 秒與 1 秒異常髒資料
      const isEscapeOnly = Array.isArray(mode) ? mode.every(m => m === 'escape') : mode === 'escape';
      const minQueryTime = isEscapeOnly ? 1 : 0;
      query = query.gt('time', minQueryTime).order('time', { ascending: true }).order('score', { ascending: false });
    } else if (isTimeDescending) {
      // 精準王 (mcq-accurate)：先比總答對率 (score DESC)，同答對率時比累計總題數越多越前 (time DESC)
      query = query.order('score', { ascending: false }).order('time', { ascending: false });
    } else {
      query = query.order('score', { ascending: false }).order('time', { ascending: true });
    }

    const { data, error } = await query.limit(limit * 2); // 取稍多以利學生最佳紀錄去重

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // 每位學生僅保留其最佳單筆成績，且對秒數計時遊戲強制過濾 (escape: > 1, spotter: > 0)
    const seenNames = new Set();
    const uniqueList = [];
    for (const entry of data) {
      const isEntryEscape = entry.mode === 'escape';
      const minValid = isEntryEscape ? 1 : 0;
      if (isTimeAscending && (!entry.time || Number(entry.time) <= minValid)) {
        continue; // 徹底防禦與清洗歷史 0 秒與 1 秒髒資料
      }
      const cleanName = (entry.name || '').trim();
      if (!seenNames.has(cleanName)) {
        seenNames.add(cleanName);
        uniqueList.push(entry);
      }
      if (uniqueList.length >= limit) break;
    }

    return uniqueList;
  } catch (err) {
    console.error('排行榜讀取失敗:', err);
    return [];
  }
};

// ============================================================
// ── 最高系統管理者 (Super Admin) 專屬服務函式 ──
// ============================================================

/**
 * 管理者查詢歷史成績列表 (支援多維度篩選)
 */
export const adminFetchLeaderboard = async ({ week, mode, limit = 100 } = {}) => {
  try {
    let query = supabase.from('leaderboard').select('*');
    if (week !== undefined && week !== 'all') {
      query = query.eq('week', parseInt(week, 10));
    }
    if (Array.isArray(mode) && mode.length > 0) {
      query = query.in('mode', mode);
    } else if (mode && mode !== 'all') {
      query = query.eq('mode', mode);
    }
    query = query.order('created_at', { ascending: false }).limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('後台讀取成績失敗:', err);
    return [];
  }
};

/**
 * 管理者個別刪除指定成績
 */
export const adminDeleteLeaderboardEntry = async (id) => {
  const { error } = await supabase.from('leaderboard').delete().eq('id', id);
  if (error) throw error;
  return true;
};

/**
 * 管理者一鍵清理異常成績 (分數極端破表者)
 */
export const adminClearAbnormalScores = async () => {
  try {
    const { error } = await supabase
      .from('leaderboard')
      .delete()
      .or('score.gt.100000,score.lt.0');
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('清理異常分數失敗:', err);
    throw err;
  }
};

/**
 * 管理者清空指定週次成績
 */
export const adminResetWeekScores = async (week) => {
  const { error } = await supabase
    .from('leaderboard')
    .delete()
    .eq('week', parseInt(week, 10));
  if (error) throw error;
  return true;
};

/**
 * 管理者取得全系統即時診斷資訊 (Latency, 筆數, 容量佔比)
 */
export const adminGetSystemStats = async () => {
  const tStart = performance.now();
  try {
    const [wordsRes, leaderboardRes] = await Promise.all([
      supabase.from('words').select('id', { count: 'exact', head: true }),
      supabase.from('leaderboard').select('id', { count: 'exact', head: true })
    ]);
    const latency = Math.round(performance.now() - tStart);
    const wordsCount = wordsRes.count || 0;
    const leaderboardCount = leaderboardRes.count || 0;
    // 預估 Postgres 資料庫空間 (單字~200B + 排行榜~150B + 基礎系統表約 1.5MB)
    const estimatedBytes = (wordsCount * 200) + (leaderboardCount * 150) + 1500000;
    const estimatedMB = (estimatedBytes / (1024 * 1024)).toFixed(2);
    return {
      isOnline: true,
      latencyMs: latency,
      wordsCount,
      leaderboardCount,
      estimatedMB,
      quotaPercent: ((parseFloat(estimatedMB) / 500) * 100).toFixed(2)
    };
  } catch (err) {
    return {
      isOnline: false,
      latencyMs: -1,
      wordsCount: 0,
      leaderboardCount: 0,
      estimatedMB: '0.00',
      quotaPercent: '0.00'
    };
  }
};

// ============================================================
// ── 學生 6 碼雲端漫遊身分 (Student Roaming Profiles) ──
// ============================================================

export const STUDENT_PROFILES_TABLE_SQL = `
-- 霧臺英語宇宙 2.0: 學生身分與漫遊資料表
create table if not exists student_profiles (
  student_id text primary key, -- e.g. '040209'
  grade text not null,
  class text not null,
  seat text not null,
  nickname text not null,
  coins integer default 0,
  quest_points integer default 0,
  semester_id text default '115-1',
  semester_history jsonb default '[]'::jsonb,
  inventory jsonb default '[]'::jsonb,
  daily_quest jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 啟用 RLS 與開放讀寫策略 (供全校學童免登入直接暢玩)
alter table student_profiles enable row level security;
create policy "Allow all read on student_profiles" on student_profiles for select using (true);
create policy "Allow all insert on student_profiles" on student_profiles for insert with check (true);
create policy "Allow all update on student_profiles" on student_profiles for update using (true);
`;

const getLocalStudentProfile = (studentId) => {
  try {
    const raw = localStorage.getItem(`wutai_student_profile_${studentId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const checked = checkAndApplySemesterReset(parsed);
    if (checked?.has_just_reset_semester) {
      setLocalStudentProfile(studentId, checked);
    }
    return checked;
  } catch (e) {
    return null;
  }
};

const setLocalStudentProfile = (studentId, profile) => {
  try {
    localStorage.setItem(`wutai_student_profile_${studentId}`, JSON.stringify(profile));
  } catch (e) {}
};

/**
 * 雲端雙軌同步備份：寫入 leaderboard 資料表 (mode: 'profile-sync')
 * 即使 student_profiles 專屬表尚未手動建表，也能透過現有 leaderboard 表即時達成跨裝置雲端漫遊！
 */
export const syncProfileToLeaderboard = async (profile) => {
  if (!profile?.student_id) return;
  try {
    const studentId = String(profile.student_id);
    const coins = Math.max(0, Number(profile.coins) || 0);
    const questPoints = Math.max(0, Number(profile.quest_points) || 0);
    const currentWeek = getWeekNumber();
    const cleanNick = String(profile.nickname || '好學生').trim();
    const metaPayload = JSON.stringify({
      v: 1,
      inv: Array.isArray(profile.inventory) ? profile.inventory : [],
      dq: (typeof profile.daily_quest === 'object' && profile.daily_quest) ? profile.daily_quest : {},
      sem: profile.semester_id || getCurrentSemesterId(),
      hist: Array.isArray(profile.semester_history) ? profile.semester_history : []
    });

    const { data: existing } = await supabase
      .from('leaderboard')
      .select('id, score, time, device_id')
      .eq('mode', 'profile-sync')
      .eq('book', studentId)
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('leaderboard')
        .update({
          score: coins,
          time: questPoints,
          name: cleanNick,
          device_id: metaPayload,
          created_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('leaderboard').insert([{
        device_id: metaPayload,
        name: cleanNick,
        mode: 'profile-sync',
        book: studentId,
        score: coins,
        time: questPoints,
        week: currentWeek
      }]);
    }
  } catch (err) {
    console.warn('雲端雙軌同步護航提示:', err);
  }
};

/**
 * 自 leaderboard (profile-sync 雙軌備份) 讀取學生雲端漫遊資料
 */
export const fetchProfileFromLeaderboard = async (studentId) => {
  if (!studentId) return null;
  try {
    const { data: syncData } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('mode', 'profile-sync')
      .eq('book', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (syncData) {
      const parsedId = parseStudentId(studentId);
      let extraMeta = {};
      if (typeof syncData.device_id === 'string' && syncData.device_id.startsWith('{')) {
        try {
          extraMeta = JSON.parse(syncData.device_id);
        } catch (e) {}
      }
      return {
        student_id: studentId,
        grade: parsedId.grade,
        class: parsedId.classNum,
        seat: parsedId.seat,
        nickname: syncData.name || '好學生',
        coins: Math.max(0, Number(syncData.score) || 0),
        quest_points: Math.max(0, Number(syncData.time) || 0),
        semester_id: extraMeta.sem || getCurrentSemesterId(),
        semester_history: Array.isArray(extraMeta.hist) ? extraMeta.hist : [],
        inventory: Array.isArray(extraMeta.inv) ? extraMeta.inv : [],
        daily_quest: (typeof extraMeta.dq === 'object' && extraMeta.dq) ? extraMeta.dq : {}
      };
    }
    return null;
  } catch (err) {
    return null;
  }
};

/**
 * 讀取學生雲端漫遊檔案 (含本機快取與無損離線回退)
 */
export const fetchStudentProfile = async (studentId) => {
  if (!studentId) return null;
  const localProfile = getLocalStudentProfile(studentId);

  try {
    // 1. 同時查詢專屬 student_profiles 資料表與 leaderboard (profile-sync 雙軌備份)，自動取最高值融合、絕不打架！
    const [{ data: spData, error: spError }, syncProfile] = await Promise.all([
      supabase.from('student_profiles').select('*').eq('student_id', studentId).maybeSingle(),
      fetchProfileFromLeaderboard(studentId)
    ]);

    if (spData || syncProfile) {
      const parsedId = parseStudentId(studentId);
      const mergedDq1 = mergeDailyQuestPreservingMeta(syncProfile?.daily_quest || {}, localProfile?.daily_quest || {});
      const mergedDailyQuest = mergeDailyQuestPreservingMeta(mergedDq1, spData?.daily_quest || {});
      const isCloudArchived = isProfileArchived({ daily_quest: mergedDailyQuest });
      const rawNormalized = {
        ...(localProfile || {}),
        student_id: studentId,
        grade: spData?.grade || localProfile?.grade || syncProfile?.grade || parsedId.grade,
        class: spData?.class || localProfile?.class || syncProfile?.class || parsedId.classNum,
        seat: spData?.seat || localProfile?.seat || syncProfile?.seat || parsedId.seat,
        nickname: spData?.nickname || localProfile?.nickname || syncProfile?.nickname || '好學生',
        coins: isCloudArchived ? 0 : Math.max(Number(spData?.coins) || 0, Number(syncProfile?.coins) || 0, Number(localProfile?.coins) || 0),
        quest_points: isCloudArchived ? 0 : Math.max(Number(spData?.quest_points) || 0, Number(syncProfile?.quest_points) || 0, Number(localProfile?.quest_points) || 0),
        semester_id: spData?.semester_id || localProfile?.semester_id || syncProfile?.semester_id || null,
        semester_history: isCloudArchived
          ? []
          : ((Array.isArray(spData?.semester_history) && spData.semester_history.length > 0)
            ? spData.semester_history
            : ((Array.isArray(localProfile?.semester_history) && localProfile.semester_history.length > 0) ? localProfile.semester_history : (syncProfile?.semester_history || []))),
        inventory: isCloudArchived
          ? []
          : ((Array.isArray(spData?.inventory) && spData.inventory.length > 0)
            ? spData.inventory
            : ((Array.isArray(localProfile?.inventory) && localProfile.inventory.length > 0) ? localProfile.inventory : (syncProfile?.inventory || []))),
        daily_quest: mergedDailyQuest,
        updated_at: spData?.updated_at || new Date().toISOString()
      };
      const normalized = isCloudArchived ? rawNormalized : checkAndApplySemesterReset(rawNormalized);
      setLocalStudentProfile(studentId, normalized);
      syncProfileToLeaderboard(normalized).catch(() => {});

      // 若老師已建立 student_profiles 表，自動將融合後的最新資料回寫同步至 student_profiles
      if (!spError && (!spData || Number(spData.coins) < normalized.coins || Number(spData.quest_points) < normalized.quest_points)) {
        supabase.from('student_profiles').upsert({
          student_id: normalized.student_id,
          grade: normalized.grade,
          class: normalized.class,
          seat: normalized.seat,
          nickname: normalized.nickname,
          coins: normalized.coins,
          quest_points: normalized.quest_points,
          semester_id: normalized.semester_id || getCurrentSemesterId(),
          semester_history: normalized.semester_history || [],
          inventory: normalized.inventory || [],
          daily_quest: normalized.daily_quest || {},
          updated_at: new Date().toISOString()
        }, { onConflict: 'student_id' }).then(() => {}).catch(() => {});
      }

      return normalized;
    }

    // 3. 遠端尚無紀錄，回退本機快取
    if (localProfile) {
      return checkAndApplySemesterReset(localProfile);
    }

    return null;
  } catch (err) {
    console.warn('讀取學生檔案連線異常，回退本機快取:', err);
    return getLocalStudentProfile(studentId);
  }
};

/**
 * 建立或更新學生雲端檔案 (Upsert)
 */
export const upsertStudentProfile = async (profileData) => {
  if (!profileData?.student_id) return null;

  const currentSem = getCurrentSemesterId();
  const sanitized = {
    student_id: String(profileData.student_id),
    grade: String(profileData.grade || '00'),
    class: String(profileData.class || profileData.classNum || '00'),
    seat: String(profileData.seat || '00'),
    nickname: String(profileData.nickname || '好學生').trim(),
    coins: Math.max(0, Number(profileData.coins) || 0),
    quest_points: Math.max(0, Number(profileData.quest_points) || 0),
    semester_id: String(profileData.semester_id || currentSem),
    semester_history: Array.isArray(profileData.semester_history) ? profileData.semester_history : [],
    inventory: Array.isArray(profileData.inventory) ? profileData.inventory : [],
    daily_quest: (typeof profileData.daily_quest === 'object' && profileData.daily_quest) ? profileData.daily_quest : {},
    updated_at: new Date().toISOString()
  };

  // 1. 立即寫入本機快取保證即時響應
  setLocalStudentProfile(sanitized.student_id, sanitized);

  // 2. 雲端雙軌同步護航：同時寫入 leaderboard 的 profile-sync 模式！
  syncProfileToLeaderboard(sanitized).catch(() => {});

  // 3. 嘗試非同步同步至 Supabase 專屬 student_profiles 資料表
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .upsert(sanitized, { onConflict: 'student_id' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase upsert 學生檔案提示 (資料已安全暫存本機與雙軌備份):', error.message);
      return sanitized;
    }
    return data || sanitized;
  } catch (err) {
    console.warn('學生檔案雲端同步暫緩，本機安全保留:', err);
    return sanitized;
  }
};

/**
 * 安全增減金幣 (支援正負數，最低不小於 0)
 */
export const updateStudentCoins = async (studentId, deltaCoins) => {
  if (!studentId || typeof deltaCoins !== 'number') return null;

  const current = (await fetchStudentProfile(studentId)) || {
    student_id: studentId,
    grade: studentId.substring(0, 2),
    class: studentId.substring(2, 4),
    seat: studentId.substring(4, 6),
    nickname: '好學生',
    coins: 0,
    quest_points: 0,
    inventory: [],
    daily_quest: {}
  };

  const newCoins = Math.max(0, (current.coins || 0) + deltaCoins);
  const updated = {
    ...current,
    coins: newCoins,
    updated_at: new Date().toISOString()
  };

  return await upsertStudentProfile(updated);
};

/**
 * 累加探索積分
 */
export const updateStudentQuestPoints = async (studentId, deltaPoints) => {
  if (!studentId || typeof deltaPoints !== 'number') return null;

  const current = (await fetchStudentProfile(studentId)) || {
    student_id: studentId,
    grade: studentId.substring(0, 2),
    class: studentId.substring(2, 4),
    seat: studentId.substring(4, 6),
    nickname: '好學生',
    coins: 0,
    quest_points: 0,
    inventory: [],
    daily_quest: {}
  };

  const newPoints = Math.max(0, (current.quest_points || 0) + deltaPoints);
  const updated = {
    ...current,
    quest_points: newPoints,
    updated_at: new Date().toISOString()
  };

  return await upsertStudentProfile(updated);
};

/**
 * 更新學生背包物品庫 (Inventory)
 */
export const updateStudentInventory = async (studentId, newInventory) => {
  if (!studentId || !Array.isArray(newInventory)) return null;

  const current = (await fetchStudentProfile(studentId)) || {
    student_id: studentId,
    grade: studentId.substring(0, 2),
    class: studentId.substring(2, 4),
    seat: studentId.substring(4, 6),
    nickname: '好學生',
    coins: 0,
    quest_points: 0,
    inventory: [],
    daily_quest: {}
  };

  const updated = {
    ...current,
    inventory: newInventory,
    updated_at: new Date().toISOString()
  };

  return await upsertStudentProfile(updated);
};

/**
 * 更新每日任務狀態 (Daily Quest)
 */
export const updateStudentDailyQuest = async (studentId, dailyQuestData) => {
  if (!studentId || typeof dailyQuestData !== 'object') return null;

  const current = (await fetchStudentProfile(studentId)) || {
    student_id: studentId,
    grade: studentId.substring(0, 2),
    class: studentId.substring(2, 4),
    seat: studentId.substring(4, 6),
    nickname: '好學生',
    coins: 0,
    quest_points: 0,
    inventory: [],
    daily_quest: {}
  };

  const mergedDailyQuest = mergeDailyQuestPreservingMeta(current.daily_quest || {}, dailyQuestData);

  const updated = {
    ...current,
    daily_quest: mergedDailyQuest,
    updated_at: new Date().toISOString()
  };

  return await upsertStudentProfile(updated);
};

/**
 * 將八冊秘典進度與歷屆星辰封存即時同步至雲端（跨手機／平板／筆電連續）
 */
export const syncStudentGrimoireToCloud = async (studentId, grimoireData = {}, grimoireHistory = []) => {
  const sid = String(studentId || '');
  if (!sid || sid.length !== 6 || isGuestStudent(sid)) return null;

  try {
    const current = (await fetchStudentProfile(sid)) || {
      student_id: sid,
      grade: sid.substring(0, 2),
      class: sid.substring(2, 4),
      seat: sid.substring(4, 6),
      nickname: '好學生',
      coins: 0,
      quest_points: 0,
      inventory: [],
      daily_quest: {}
    };

    const existingDq = (current.daily_quest && typeof current.daily_quest === 'object') ? current.daily_quest : {};
    const mergedGrimoire = mergeGrimoireProgress(existingDq._grimoire || {}, grimoireData || {});
    const mergedHistory = mergeGrimoireHistory(existingDq._grimoire_history || [], grimoireHistory || []);

    const nextDq = {
      ...existingDq,
      _grimoire: mergedGrimoire,
      _grimoire_history: mergedHistory
    };

    return await upsertStudentProfile({
      ...current,
      daily_quest: nextDq,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('八冊秘典雲端同步略過:', err);
    return null;
  }
};

// 註冊八冊秘典雲端同步回呼（recordGrimoireStar 寫入後自動背景上雲）
registerGrimoireCloudSync(syncStudentGrimoireToCloud);

/**
 * 讀取全校雲端學生名單（供 TeacherHub 學年升級與座號移轉模組使用）
 */
export const fetchAllStudentProfilesForTeacher = async () => {
  const mergedMap = new Map();

  try {
    const [{ data: spRows, error: spError }, { data: syncRows }] = await Promise.all([
      supabase
        .from('student_profiles')
        .select('*')
        .order('student_id', { ascending: true })
        .limit(1000),
      supabase
        .from('leaderboard')
        .select('book, name, score, time, device_id, created_at')
        .eq('mode', 'profile-sync')
        .order('created_at', { ascending: false })
        .limit(1500)
    ]);

    if (!spError && Array.isArray(spRows)) {
      spRows.forEach((row) => {
        const sid = String(row?.student_id || '');
        if (!sid || sid.length !== 6 || isGuestStudent(sid)) return;
        mergedMap.set(sid, {
          ...row,
          student_id: sid,
          coins: Math.max(0, Number(row.coins) || 0),
          quest_points: Math.max(0, Number(row.quest_points) || 0),
          inventory: Array.isArray(row.inventory) ? row.inventory : [],
          semester_history: Array.isArray(row.semester_history) ? row.semester_history : [],
          daily_quest: (row.daily_quest && typeof row.daily_quest === 'object') ? row.daily_quest : {}
        });
      });
    }

    if (Array.isArray(syncRows)) {
      syncRows.forEach((r) => {
        const sid = String(r?.book || '');
        if (!sid || sid.length !== 6 || isGuestStudent(sid)) return;
        const parsedId = parseStudentId(sid);
        let extraMeta = {};
        if (typeof r.device_id === 'string' && r.device_id.startsWith('{')) {
          try { extraMeta = JSON.parse(r.device_id); } catch (e) {}
        }
        const syncDq = (extraMeta.dq && typeof extraMeta.dq === 'object') ? extraMeta.dq : {};
        const prev = mergedMap.get(sid);
        if (!prev) {
          mergedMap.set(sid, {
            student_id: sid,
            grade: parsedId.grade,
            class: parsedId.classNum,
            seat: parsedId.seat,
            nickname: r.name || '好學生',
            coins: Math.max(0, Number(r.score) || 0),
            quest_points: Math.max(0, Number(r.time) || 0),
            semester_id: extraMeta.sem || getCurrentSemesterId(),
            semester_history: Array.isArray(extraMeta.hist) ? extraMeta.hist : [],
            inventory: Array.isArray(extraMeta.inv) ? extraMeta.inv : [],
            daily_quest: syncDq,
            updated_at: r.created_at || new Date().toISOString()
          });
        } else {
          const mergedDq = mergeDailyQuestPreservingMeta(syncDq, prev.daily_quest || {});
          const archived = isProfileArchived({ daily_quest: mergedDq });
          mergedMap.set(sid, {
            ...prev,
            coins: archived ? 0 : Math.max(prev.coins, Number(r.score) || 0),
            quest_points: archived ? 0 : Math.max(prev.quest_points, Number(r.time) || 0),
            daily_quest: mergedDq
          });
        }
      });
    }
  } catch (err) {
    console.warn('讀取全校學生清單異常:', err);
  }

  const allProfiles = Array.from(mergedMap.values()).sort((a, b) =>
    String(a.student_id).localeCompare(String(b.student_id))
  );
  const activeProfiles = allProfiles.filter(p => !isProfileArchived(p));
  const archivedProfiles = allProfiles.filter(p => isProfileArchived(p));

  return { allProfiles, activeProfiles, archivedProfiles };
};

/**
 * 設定或重設學生的 4 碼換機／換號密碼（學生端與教師端共用）
 */
export const updateStudentTransferPin = async (studentId, pin4) => {
  const sid = String(studentId || '');
  const cleanPin = String(pin4 ?? '').trim();
  if (!sid || sid.length !== 6 || isGuestStudent(sid)) {
    return { success: false, error: '訪客帳號不支援設定換機密碼。' };
  }
  if (!isValidTransferPin(cleanPin)) {
    return { success: false, error: '換機密碼必須為 4 位數字（例如 1234）。' };
  }

  const current = (await fetchStudentProfile(sid)) || {
    student_id: sid,
    grade: sid.substring(0, 2),
    class: sid.substring(2, 4),
    seat: sid.substring(4, 6),
    nickname: '好學生',
    coins: 0,
    quest_points: 0,
    inventory: [],
    daily_quest: {}
  };

  const nextDq = {
    ...(current.daily_quest && typeof current.daily_quest === 'object' ? current.daily_quest : {}),
    _transfer_pin: cleanPin
  };

  const saved = await upsertStudentProfile({
    ...current,
    daily_quest: nextDq,
    updated_at: new Date().toISOString()
  });

  return { success: true, profile: saved, pin: cleanPin };
};

/**
 * 軌道一：教師後台批次學年升級／座號移轉（強制衝突門禁 + 快照原子寫入，支援 1↔2 互換不覆蓋）
 */
export const executeTeacherBatchPromotion = async (
  plannedRows = [],
  allProfilesSnapshot = [],
  { archiveGrimoire = true, academicYear = getCurrentAcademicYear() } = {}
) => {
  const conflictCheck = detectPromotionConflicts(plannedRows, allProfilesSnapshot);
  if (conflictCheck.hasConflicts) {
    return {
      success: false,
      error: `偵測到 ${conflictCheck.conflictCount} 處座號衝突，已攔截本次轉換。請先排除所有紅燈衝號後再執行。`,
      conflictCheck
    };
  }

  const profileById = new Map();
  (allProfilesSnapshot || []).forEach((p) => {
    if (p?.student_id) profileById.set(String(p.student_id), p);
  });

  // 1. 先完整拍下所有要移動／畢業的來源快照（避免兩兩互換時後讀蓋掉先寫）
  const targetWrites = [];
  const targetIdSet = new Set();
  const vacateSources = [];

  for (const row of plannedRows) {
    const sid = String(row?.sourceId || '');
    const srcProfile = profileById.get(sid);
    if (!srcProfile) continue;

    if (row.action === 'keep') {
      targetIdSet.add(sid);
      continue;
    }

    if (row.action === 'graduate') {
      vacateSources.push({ srcProfile, status: 'graduated', transferredTo: null });
      continue;
    }

    if (row.action === 'move') {
      const targetId = getPlannedTargetId(row);
      if (!targetId) continue;
      targetIdSet.add(targetId);

      // 若仍在原位但勾選跨學年封存，依然允許封存當年八星；否則搬至目標新座號
      const nextTargetProfile = buildTransferredTargetProfile({
        sourceProfile: srcProfile,
        existingTargetProfile: null,
        targetGrade: row.targetGrade,
        targetClass: row.targetClass,
        targetSeat: row.targetSeat,
        archiveGrimoire: Boolean(archiveGrimoire),
        academicYear,
        mergeWithExistingTarget: false
      });
      targetWrites.push(nextTargetProfile);

      if (targetId !== sid) {
        vacateSources.push({ srcProfile, status: 'transferred', transferredTo: targetId });
      }
    }
  }

  // 2. 依序寫入所有目標新檔案
  let movedCount = 0;
  for (const targetProfile of targetWrites) {
    await upsertStudentProfile(targetProfile);
    replaceLocalGrimoire(
      targetProfile.student_id,
      targetProfile.daily_quest?._grimoire || {},
      targetProfile.daily_quest?._grimoire_history || []
    );
    movedCount++;
  }

  // 3. 僅封存「沒有被同批次其他學生接手」的騰出舊座號或畢業生座號
  let archivedCount = 0;
  for (const item of vacateSources) {
    const sid = String(item.srcProfile.student_id);
    if (targetIdSet.has(sid)) continue;
    const archivedProfile = buildArchivedSourceProfile({
      sourceProfile: item.srcProfile,
      status: item.status,
      transferredTo: item.transferredTo,
      academicYear
    });
    await upsertStudentProfile(archivedProfile);
    archivedCount++;
  }

  return {
    success: true,
    movedCount,
    archivedCount,
    totalAffected: movedCount + archivedCount
  };
};

/**
 * 軌道二：學生端以「舊 6 碼座號 ＋ 4 碼換機密碼」自行繼承資產與歷屆八星
 */
export const executeStudentSelfTransfer = async ({
  sourceStudentId,
  pin4,
  targetStudentId,
  academicYear = getCurrentAcademicYear()
}) => {
  const srcId = String(sourceStudentId || '').trim();
  const tgtId = String(targetStudentId || '').trim();
  const cleanPin = String(pin4 ?? '').trim();

  if (srcId.length !== 6 || tgtId.length !== 6 || isGuestStudent(srcId) || isGuestStudent(tgtId)) {
    return { success: false, error: '請輸入正確的 6 碼正式學生座號。' };
  }
  if (srcId === tgtId) {
    return { success: false, error: '舊座號與目前座號相同，無需重複搬移。' };
  }
  if (!isValidTransferPin(cleanPin)) {
    return { success: false, error: '請輸入 4 位數字換機密碼。' };
  }

  const sourceProfile = await fetchStudentProfile(srcId);
  if (!sourceProfile) {
    return { success: false, error: `雲端查無舊座號 ${srcId} 的檔案。` };
  }
  if (isProfileArchived(sourceProfile)) {
    const toId = sourceProfile.daily_quest?._transfer_meta?.transferredTo;
    return {
      success: false,
      error: toId
        ? `舊座號 ${srcId} 的資料已移轉至 ${toId}，無法重複領取。`
        : `舊座號 ${srcId} 已封存，無法再次匯入。`
    };
  }

  const savedPin = getTransferPinFromProfile(sourceProfile);
  if (!savedPin) {
    return {
      success: false,
      error: `舊座號 ${srcId} 尚未設定 4 碼換機密碼，請先用舊座號登入設定，或請老師於後台協助設定。`
    };
  }
  if (savedPin !== cleanPin) {
    return { success: false, error: '4 碼換機密碼不正確，請確認後再試。' };
  }

  const existingTarget = await fetchStudentProfile(tgtId);
  const parsedTarget = parseStudentId(tgtId);
  const isCrossGrade = String(sourceProfile.grade) !== String(parsedTarget.grade);

  const nextTargetProfile = buildTransferredTargetProfile({
    sourceProfile,
    existingTargetProfile: existingTarget,
    targetGrade: parsedTarget.grade,
    targetClass: parsedTarget.classNum,
    targetSeat: parsedTarget.seat,
    archiveGrimoire: isCrossGrade,
    academicYear,
    mergeWithExistingTarget: true
  });

  const archivedSource = buildArchivedSourceProfile({
    sourceProfile,
    status: 'transferred',
    transferredTo: tgtId,
    academicYear
  });

  await upsertStudentProfile(nextTargetProfile);
  await upsertStudentProfile(archivedSource);

  replaceLocalGrimoire(
    tgtId,
    nextTargetProfile.daily_quest?._grimoire || {},
    nextTargetProfile.daily_quest?._grimoire_history || []
  );
  try {
    localStorage.setItem(
      `wutai_grimoire_epoch_${tgtId}`,
      String(nextTargetProfile.daily_quest?._grimoire_epoch || 0)
    );
  } catch (e) {}

  return {
    success: true,
    targetProfile: nextTargetProfile,
    summary: {
      sourceId: srcId,
      targetId: tgtId,
      isCrossGrade,
      inheritedCoins: Math.max(0, Number(sourceProfile.coins) || 0),
      inheritedQuestPoints: Math.max(0, Number(sourceProfile.quest_points) || 0),
      inheritedInventoryCount: Array.isArray(sourceProfile.inventory) ? sourceProfile.inventory.length : 0
    }
  };
};

const getLocalLeaderboardProfiles = (metric = 'coins', grade = null, limit = 50) => {
  try {
    const profiles = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wutai_student_profile_')) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const raw = JSON.parse(item);
            if (raw && raw.student_id) {
              const parsed = checkAndApplySemesterReset(raw);
              if (!grade || grade === '00' || grade === 'all' || parsed.grade === String(grade).padStart(2, '0')) {
                profiles.push(parsed);
              }
            }
          } catch (e) {}
        }
      }
    }
    profiles.sort((a, b) => (Number(b[metric] || 0) - Number(a[metric] || 0)));
    return profiles.slice(0, limit);
  } catch (e) {
    return [];
  }
};

/**
 * 讀取大富翁財富榜 (Monopoly Wealth Board: 依金幣降序，可選年級)
 */
export const fetchMonopolyLeaderboard = async (grade = null, limit = 50) => {
  try {
    let query = supabase
      .from('student_profiles')
      .select('student_id, grade, class, seat, nickname, coins, updated_at');

    if (grade && grade !== '00' && grade !== 'all') {
      query = query.eq('grade', String(grade).padStart(2, '0'));
    }

    const [{ data, error }, { data: syncRows }] = await Promise.all([
      query.order('coins', { ascending: false }).limit(limit),
      supabase
        .from('leaderboard')
        .select('book, name, score, time, created_at')
        .eq('mode', 'profile-sync')
        .order('score', { ascending: false })
        .limit(limit * 2)
    ]);

    const mergedMap = new Map();

    if (!error && Array.isArray(data)) {
      data.forEach(item => {
        if (item?.student_id) mergedMap.set(String(item.student_id), { ...item, coins: Number(item.coins) || 0 });
      });
    }

    if (Array.isArray(syncRows)) {
      syncRows.forEach(r => {
        if (!r?.book) return;
        const sid = String(r.book);
        const p = parseStudentId(sid);
        if (grade && grade !== '00' && grade !== 'all' && p.grade !== String(grade).padStart(2, '0')) return;
        const syncCoins = Number(r.score) || 0;
        const existing = mergedMap.get(sid);
        if (!existing || syncCoins > existing.coins) {
          mergedMap.set(sid, {
            student_id: sid,
            grade: existing?.grade || p.grade,
            class: existing?.class || p.classNum,
            seat: existing?.seat || p.seat,
            nickname: existing?.nickname || r.name,
            coins: Math.max(syncCoins, existing?.coins || 0),
            updated_at: r.created_at || existing?.updated_at
          });
        }
      });
    }

    const combined = Array.from(mergedMap.values()).sort((a, b) => b.coins - a.coins).slice(0, limit);
    if (combined.length > 0) return combined;

    return getLocalLeaderboardProfiles('coins', grade, limit);
  } catch (err) {
    return getLocalLeaderboardProfiles('coins', grade, limit);
  }
};

/**
 * 讀取小鎮探索榮譽榜 (Town Quest Points Board: 依積分降序，可選年級)
 */
export const fetchQuestPointsLeaderboard = async (grade = null, limit = 50) => {
  try {
    let query = supabase
      .from('student_profiles')
      .select('student_id, grade, class, seat, nickname, quest_points, updated_at');

    if (grade && grade !== '00' && grade !== 'all') {
      query = query.eq('grade', String(grade).padStart(2, '0'));
    }

    const [{ data, error }, { data: syncRows }] = await Promise.all([
      query.order('quest_points', { ascending: false }).limit(limit),
      supabase
        .from('leaderboard')
        .select('book, name, score, time, created_at')
        .eq('mode', 'profile-sync')
        .order('time', { ascending: false })
        .limit(limit * 2)
    ]);

    const mergedMap = new Map();

    if (!error && Array.isArray(data)) {
      data.forEach(item => {
        if (item?.student_id) mergedMap.set(String(item.student_id), { ...item, quest_points: Number(item.quest_points) || 0 });
      });
    }

    if (Array.isArray(syncRows)) {
      syncRows.forEach(r => {
        if (!r?.book) return;
        const sid = String(r.book);
        const p = parseStudentId(sid);
        if (grade && grade !== '00' && grade !== 'all' && p.grade !== String(grade).padStart(2, '0')) return;
        const syncPoints = Number(r.time) || 0;
        const existing = mergedMap.get(sid);
        if (!existing || syncPoints > existing.quest_points) {
          mergedMap.set(sid, {
            student_id: sid,
            grade: existing?.grade || p.grade,
            class: existing?.class || p.classNum,
            seat: existing?.seat || p.seat,
            nickname: existing?.nickname || r.name,
            quest_points: Math.max(syncPoints, existing?.quest_points || 0),
            updated_at: r.created_at || existing?.updated_at
          });
        }
      });
    }

    const combined = Array.from(mergedMap.values()).sort((a, b) => b.quest_points - a.quest_points).slice(0, limit);
    if (combined.length > 0) return combined;

    return getLocalLeaderboardProfiles('quest_points', grade, limit);
  } catch (err) {
    return getLocalLeaderboardProfiles('quest_points', grade, limit);
  }
};

// ── 霧臺英語檢定館：試題審查與教師修正意見雲端雙軌同步 ──
export const EXAM_AUDIT_RECORDS_TABLE_SQL = `
-- 霧臺英語檢定館：試題檢核與修正意見資料表 (選用：若未建立會自動以 leaderboard 雙軌容錯)
create table if not exists exam_audit_records (
  question_id text primary key,
  verified boolean default false,
  notes text default '',
  crop_adjust jsonb default '{}'::jsonb,
  verified_by text default 'Mark',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table exam_audit_records enable row level security;
create policy "Allow all read write on exam_audit_records" on exam_audit_records
  for all using (true) with check (true);
`;

/**
 * 儲存單題教師檢核意見至 Supabase（雙軌容錯：優先寫入專屬表，回退至 leaderboard mode='exam-audit-note'）
 */
export const saveTeacherAuditRecordToCloud = async ({
  questionId,
  verified = false,
  notes = '',
  cropAdjust = null,
  verifiedBy = 'Mark'
}) => {
  if (!questionId) return false;
  const now = Date.now();
  const payload = {
    verified: Boolean(verified),
    notes: String(notes || '').trim(),
    cropAdjust: cropAdjust || null,
    verifiedBy: String(verifiedBy || 'Mark'),
    updatedAt: now
  };

  try {
    // 軌道 A: 嘗試寫入專屬表 exam_audit_records
    const { error: directErr } = await supabase
      .from('exam_audit_records')
      .upsert({
        question_id: questionId,
        verified: payload.verified,
        notes: payload.notes,
        crop_adjust: payload.cropAdjust,
        verified_by: payload.verifiedBy,
        updated_at: new Date(now).toISOString()
      }, { onConflict: 'question_id' });

    if (!directErr) {
      return true;
    }
  } catch (e) {
    // 專屬表未建立，繼續走軌道 B
  }

  // 軌道 B: 寫入保證可用的 leaderboard (mode='exam-audit-note')
  try {
    const { data: existingRows } = await supabase
      .from('leaderboard')
      .select('id')
      .eq('mode', 'exam-audit-note')
      .eq('name', questionId)
      .limit(1);

    const jsonStr = JSON.stringify(payload);
    if (existingRows && existingRows.length > 0) {
      await supabase
        .from('leaderboard')
        .update({
          book: jsonStr,
          score: payload.verified ? 1 : 0,
          time: Math.floor(now / 1000),
          created_at: new Date(now).toISOString()
        })
        .eq('id', existingRows[0].id);
    } else {
      await supabase
        .from('leaderboard')
        .insert([{
          device_id: 'teacher-audit',
          name: questionId,
          mode: 'exam-audit-note',
          book: jsonStr,
          score: payload.verified ? 1 : 0,
          time: Math.floor(now / 1000),
          week: 0
        }]);
    }
    return true;
  } catch (err) {
    console.warn('雲端儲存試題檢核意見失敗:', err);
    return false;
  }
};

/**
 * 從 Supabase 讀取全校教師試題檢核意見（雙軌聯集融合）
 * @returns {Promise<Record<string, { verified: boolean, notes: string, cropAdjust: any, updatedAt: number, verifiedBy: string }>>}
 */
export const fetchTeacherAuditRecordsFromCloud = async () => {
  const merged = {};

  // 軌道 A: 專屬表 exam_audit_records
  try {
    const { data: directRows, error: directErr } = await supabase
      .from('exam_audit_records')
      .select('*');

    if (!directErr && Array.isArray(directRows)) {
      directRows.forEach(r => {
        if (!r?.question_id) return;
        merged[r.question_id] = {
          verified: Boolean(r.verified),
          notes: r.notes || '',
          cropAdjust: r.crop_adjust || null,
          verifiedBy: r.verified_by || 'Mark',
          updatedAt: r.updated_at ? new Date(r.updated_at).getTime() : Date.now()
        };
      });
    }
  } catch (e) {}

  // 軌道 B: leaderboard (mode = 'exam-audit-note') 全量分頁讀取
  try {
    let allRows = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
      const { data: lbRows, error: lbErr } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('mode', 'exam-audit-note')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (lbErr || !Array.isArray(lbRows) || lbRows.length === 0) break;
      allRows = allRows.concat(lbRows);
      if (lbRows.length < pageSize) break;
      page++;
    }

    if (Array.isArray(allRows)) {
      allRows.forEach(r => {
        const qId = r.name;
        if (!qId) return;
        let parsed = null;
        try {
          parsed = JSON.parse(r.book);
        } catch {
          parsed = { verified: r.score === 1, notes: r.book || '', updatedAt: (r.time || 0) * 1000 };
        }
        const existing = merged[qId];
        const rowTime = parsed?.updatedAt || (r.time ? r.time * 1000 : 0);
        if (!existing || rowTime > (existing.updatedAt || 0)) {
          merged[qId] = {
            verified: Boolean(parsed?.verified !== undefined ? parsed.verified : r.score === 1),
            notes: parsed?.notes || '',
            cropAdjust: parsed?.cropAdjust || null,
            verifiedBy: parsed?.verifiedBy || 'Mark',
            updatedAt: rowTime || Date.now()
          };
        }
      });
    }
  } catch (e) {}

  return merged;
};

/**
 * 學生端回報試題疑義至 Supabase（mode = 'exam-student-report'）
 * @param {Object} params
 * @param {string} params.questionId 試題 ID (例如 hwg_b3_69)
 * @param {string} [params.track] 測驗軌道 (textbook / ministry-assessment / tme-preA1)
 * @param {string|number} [params.book] 冊別或年級
 * @param {string} [params.tag] 回報快答標籤 (no_answer / image_error / audio_error / typo_error / other_error)
 * @param {string} [params.label] 快答標籤文字說明
 * @param {string} [params.studentId] 學生代號
 * @param {string} [params.studentName] 學生姓名/暱稱
 * @returns {Promise<{ success: boolean, offline?: boolean }>}
 */
export const submitStudentQuestionReport = async ({
  questionId,
  track = 'textbook',
  book = null,
  tag = 'other_error',
  label = '其他問題',
  studentId = 'guest',
  studentName = '冒險家'
}) => {
  if (!questionId) return { success: false };

  const nowIso = new Date().toISOString();
  const nowSec = Math.floor(Date.now() / 1000);

  const reportItem = {
    tag,
    label,
    studentId,
    studentName,
    reportedAt: nowIso
  };

  try {
    const { data: existingRows, error: fetchErr } = await supabase
      .from('leaderboard')
      .select('id, book, score')
      .eq('mode', 'exam-student-report')
      .eq('name', questionId)
      .limit(1);

    if (fetchErr) throw fetchErr;

    if (existingRows && existingRows.length > 0) {
      const row = existingRows[0];
      let payload = {};
      try {
        payload = JSON.parse(row.book);
      } catch {
        payload = {};
      }

      const existingReports = Array.isArray(payload.reports) ? payload.reports : [];
      // 保留最近 30 筆回報
      const updatedReports = [reportItem, ...existingReports].slice(0, 30);
      const newCount = (payload.reportCount || existingReports.length || 0) + 1;

      const updatedPayload = {
        ...payload,
        questionId,
        track,
        book,
        status: 'pending',
        reportCount: newCount,
        lastReportedAt: nowIso,
        reports: updatedReports
      };

      const { error: updateError } = await supabase
        .from('leaderboard')
        .update({
          book: JSON.stringify(updatedPayload),
          score: newCount,
          time: nowSec,
          created_at: nowIso
        })
        .eq('id', row.id);
      if (updateError) throw updateError;
    } else {
      const initialPayload = {
        questionId,
        track,
        book,
        status: 'pending',
        reportCount: 1,
        lastReportedAt: nowIso,
        reports: [reportItem]
      };

      const { error: insertError } = await supabase
        .from('leaderboard')
        .insert([{
          device_id: 'student-report',
          name: questionId,
          mode: 'exam-student-report',
          book: JSON.stringify(initialPayload),
          score: 1,
          time: nowSec,
          week: 0
        }]);
      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (err) {
    console.warn('雲端提交學生試題回報失敗 (本地降級):', err);
    return { success: false, offline: true, error: err?.message || String(err) };
  }
};

/**
 * 從 Supabase 讀取全校學生回報之試題疑義清單
 * @returns {Promise<Record<string, { questionId: string, track: string, book: any, reportCount: number, status: string, lastReportedAt: string, reports: Array<any> }>>}
 */
export const fetchStudentQuestionReportsFromCloud = async () => {
  const reportsMap = {};
  try {
    let allRows = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
      const { data: rows, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('mode', 'exam-student-report')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error || !Array.isArray(rows) || rows.length === 0) break;
      allRows = allRows.concat(rows);
      if (rows.length < pageSize) break;
      page++;
    }

    allRows.forEach((r) => {
      const qId = r.name;
      if (!qId) return;
      let payload = null;
      try {
        payload = JSON.parse(r.book);
      } catch {
        payload = null;
      }
      if (payload) {
        reportsMap[qId] = {
          ...payload,
          id: r.id,
          reportCount: payload.reportCount || r.score || 0,
          status: payload.status || (r.score > 0 ? 'pending' : 'resolved'),
          time: r.time
        };
      }
    });
  } catch (e) {
    console.warn('讀取學生試題回報失敗:', e);
  }
  return reportsMap;
};

/**
 * 教師於後台解除/結案指定試題之學生疑義標註
 * @param {string} questionId
 * @returns {Promise<boolean>}
 */
export const resolveStudentQuestionReportInCloud = async (questionId) => {
  if (!questionId) return false;
  try {
    const { data: existingRows, error: selectError } = await supabase
      .from('leaderboard')
      .select('id, book')
      .eq('mode', 'exam-student-report')
      .eq('name', questionId)
      .limit(1);

    if (selectError) {
      console.warn('查詢學生疑義回報失敗 (selectError):', selectError);
      return false;
    }

    if (existingRows && existingRows.length > 0) {
      const row = existingRows[0];
      let payload = {};
      try {
        payload = JSON.parse(row.book);
      } catch {
        payload = {};
      }
      payload.status = 'resolved';
      payload.resolvedAt = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('leaderboard')
        .update({
          book: JSON.stringify(payload),
          score: 0,
          time: Math.floor(Date.now() / 1000)
        })
        .eq('id', row.id);

      if (updateError) {
        console.warn('解除學生疑義回報更新失敗 (updateError):', updateError);
        return false;
      }
      return true;
    }
    return true;
  } catch (err) {
    console.warn('解除學生疑義回報失敗:', err);
  }
  return false;
};



