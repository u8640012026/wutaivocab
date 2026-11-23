import { formatStudentId, parseStudentId, pad2, GRADE_OPTIONS, CLASS_OPTIONS, isGuestStudent } from '../utils/studentIdHelper.js';
import { getCurrentSemesterId } from '../utils/semesterHelper.js';
import {
  mergeGrimoireProgress,
  mergeGrimoireHistory,
  buildGrimoireYearArchiveEntry
} from '../utils/grimoireHelper.js';

export const INTERNAL_DQ_META_KEYS = [
  '_grimoire',
  '_grimoire_history',
  '_grimoire_epoch',
  '_transfer_pin',
  '_transfer_meta',
  '_archived_status'
];

/**
 * 取得當前學年度代碼（例如 "115-1" -> "115"）
 */
export const getCurrentAcademicYear = (date = new Date()) => {
  return String(getCurrentSemesterId(date)).split('-')[0] || '115';
};

/**
 * 驗證 4 碼數字換機／換號密碼
 */
export const isValidTransferPin = (pin) => {
  return /^\d{4}$/.test(String(pin ?? '').trim());
};

/**
 * 取得檔案中保存的 4 碼換機密碼
 */
export const getTransferPinFromProfile = (profile) => {
  const raw = profile?.daily_quest?._transfer_pin;
  return isValidTransferPin(raw) ? String(raw).trim() : '';
};

/**
 * 判斷帳號是否已被升級轉移或畢業封存（不再佔用現行班級座號）
 */
export const isProfileArchived = (profile) => {
  const status = profile?.daily_quest?._archived_status;
  return status === 'transferred' || status === 'graduated';
};

/**
 * 合併 daily_quest 並保護所有 `_` 開頭的系統中繼資料（八星、歷屆封存、4 碼密碼、轉移紀錄）
 */
export const mergeDailyQuestPreservingMeta = (existingDq = {}, incomingDq = {}) => {
  const base = (existingDq && typeof existingDq === 'object') ? existingDq : {};
  const next = (incomingDq && typeof incomingDq === 'object') ? incomingDq : {};

  const result = { ...next };

  // 先保留原有內部中繼欄位
  INTERNAL_DQ_META_KEYS.forEach((key) => {
    if (base[key] !== undefined && result[key] === undefined) {
      result[key] = base[key];
    }
  });

  // 八星進度與歷屆封存一律依 epoch 與聯集融合規則處理
  const baseEpoch = Number(base._grimoire_epoch) || 0;
  const nextEpoch = Number(next._grimoire_epoch) || 0;
  const finalEpoch = Math.max(baseEpoch, nextEpoch);
  if (finalEpoch > 0) {
    result._grimoire_epoch = finalEpoch;
  }

  if (nextEpoch > baseEpoch) {
    result._grimoire = (next._grimoire && typeof next._grimoire === 'object') ? { ...next._grimoire } : {};
  } else if (baseEpoch > nextEpoch) {
    result._grimoire = (base._grimoire && typeof base._grimoire === 'object') ? { ...base._grimoire } : {};
  } else if (base._grimoire || next._grimoire) {
    result._grimoire = mergeGrimoireProgress(base._grimoire || {}, next._grimoire || {});
  }

  if (base._grimoire_history || next._grimoire_history) {
    result._grimoire_history = mergeGrimoireHistory(
      base._grimoire_history || [],
      next._grimoire_history || []
    );
  }

  return result;
};

/**
 * 將 6 碼座號格式化為親切簡稱（例如 010102 -> "1年甲班02號"）
 */
export const formatSeatLabel = (studentId) => {
  const p = parseStudentId(String(studentId || ''));
  if (!p.isValid) return String(studentId || '');
  const gObj = GRADE_OPTIONS.find(g => g.id === p.grade);
  const cObj = CLASS_OPTIONS.find(c => c.id === p.classNum);
  const gText = gObj ? gObj.shortZh : `${parseInt(p.grade, 10) || 0}年`;
  const cText = cObj ? `${cObj.shortZh}班` : `${p.classNum}班`;
  return `${gText}${cText}${p.seat}號`;
};

/**
 * 依據學生原年級產生預設學年升級建議：
 * - 一～五年級：年級 + 1，班級與座號維持不變
 * - 六年級：預設「畢業封存」以釋出六年級座號給新六升學生
 */
export const getDefaultPromotionPlan = (profile) => {
  const sid = String(profile?.student_id || '');
  const parsed = parseStudentId(sid);
  const gradeNum = parseInt(profile?.grade || parsed.grade, 10) || 1;
  const cls = pad2(profile?.class || parsed.classNum || '01');
  const seat = pad2(profile?.seat || parsed.seat || '01');

  if (gradeNum >= 6) {
    return {
      sourceId: sid,
      nickname: profile?.nickname || '好學生',
      originalGrade: pad2(gradeNum),
      originalClass: cls,
      originalSeat: seat,
      action: 'graduate',
      targetGrade: '06',
      targetClass: cls,
      targetSeat: seat
    };
  }

  return {
    sourceId: sid,
    nickname: profile?.nickname || '好學生',
    originalGrade: pad2(gradeNum),
    originalClass: cls,
    originalSeat: seat,
    action: 'move',
    targetGrade: pad2(gradeNum + 1),
    targetClass: cls,
    targetSeat: seat
  };
};

/**
 * 計算單一計畫列的目標 6 碼 ID（畢業封存回傳 null）
 */
export const getPlannedTargetId = (row) => {
  if (!row || row.action === 'graduate') return null;
  if (row.action === 'keep') return String(row.sourceId || '');
  return formatStudentId(row.targetGrade, row.targetClass, row.targetSeat);
};

/**
 * 即時衝號衝突偵測引擎：
 * - 同時核對「同批次計畫列之間的目標互撞」與「撞到雲端其他未移動的現役學生」
 * - 支援「兩兩互換（如 1 號↔2 號）」與「連鎖移位（1→2、2→3）」不誤判
 */
export const detectPromotionConflicts = (plannedRows = [], allCloudProfiles = []) => {
  const plannedBySource = new Map();
  const occupantsByTargetId = new Map();

  const addOccupant = (targetId, occupant) => {
    if (!targetId) return;
    if (!occupantsByTargetId.has(targetId)) {
      occupantsByTargetId.set(targetId, []);
    }
    occupantsByTargetId.get(targetId).push(occupant);
  };

  (Array.isArray(plannedRows) ? plannedRows : []).forEach((row) => {
    if (!row?.sourceId) return;
    const sid = String(row.sourceId);
    plannedBySource.set(sid, row);
    const targetId = getPlannedTargetId(row);
    if (targetId) {
      addOccupant(targetId, {
        kind: 'planned',
        sourceId: sid,
        nickname: row.nickname || '好學生',
        action: row.action,
        label: `${formatSeatLabel(sid)} (${row.nickname || '好學生'})`
      });
    }
  });

  // 納入未出現在本次計畫表內的其他現役雲端學生（例如只展開一年級升級到二年級時，偵測是否撞到未移動的現有二年級）
  (Array.isArray(allCloudProfiles) ? allCloudProfiles : []).forEach((profile) => {
    const sid = String(profile?.student_id || '');
    if (!sid || sid.length !== 6 || isGuestStudent(sid)) return;
    if (isProfileArchived(profile)) return;
    if (plannedBySource.has(sid)) return;

    addOccupant(sid, {
      kind: 'existing',
      sourceId: sid,
      nickname: profile.nickname || '好學生',
      action: 'existing',
      label: `現有未移動 ${formatSeatLabel(sid)} (${profile.nickname || '好學生'})`
    });
  });

  const conflictMapBySourceId = {};
  const conflictTargetIds = [];
  const conflictDetails = [];

  occupantsByTargetId.forEach((occupants, targetId) => {
    if (occupants.length > 1) {
      conflictTargetIds.push(targetId);
      conflictDetails.push({
        targetId,
        targetLabel: formatSeatLabel(targetId),
        occupants
      });
      occupants.forEach((occ) => {
        if (occ.kind === 'planned') {
          conflictMapBySourceId[occ.sourceId] = {
            targetId,
            targetLabel: formatSeatLabel(targetId),
            peers: occupants.filter(p => p.sourceId !== occ.sourceId)
          };
        }
      });
    }
  });

  return {
    hasConflicts: conflictTargetIds.length > 0,
    conflictCount: conflictTargetIds.length,
    conflictTargetIds,
    conflictMapBySourceId,
    conflictDetails
  };
};

/**
 * 合併背包道具清單（依道具 id 或字串值安全保留）
 */
const mergeInventoryLists = (listA = [], listB = []) => {
  const a = Array.isArray(listA) ? listA : [];
  const b = Array.isArray(listB) ? listB : [];
  return [...a, ...b];
};

/**
 * 建構搬移後的目標帳號檔案（純函式，供教師批次升級與學生自行換號共用）
 * - mergeWithExistingTarget=false：教師批次升級／互換時使用，只保留來源學生本人資產，不混入原佔位者資產
 * - mergeWithExistingTarget=true：學生登入新座號後「匯入舊座號」時使用，與新座號已玩資產累加合併
 */
export const buildTransferredTargetProfile = ({
  sourceProfile,
  existingTargetProfile = null,
  targetGrade,
  targetClass,
  targetSeat,
  archiveGrimoire = true,
  academicYear = getCurrentAcademicYear(),
  mergeWithExistingTarget = false
}) => {
  const tGrade = pad2(targetGrade);
  const tClass = pad2(targetClass);
  const tSeat = pad2(targetSeat);
  const targetId = formatStudentId(tGrade, tClass, tSeat);

  const srcDq = (sourceProfile?.daily_quest && typeof sourceProfile.daily_quest === 'object')
    ? sourceProfile.daily_quest
    : {};
  const tgtDq = (mergeWithExistingTarget && existingTargetProfile?.daily_quest && typeof existingTargetProfile.daily_quest === 'object')
    ? existingTargetProfile.daily_quest
    : {};

  const srcGrimoire = (srcDq._grimoire && typeof srcDq._grimoire === 'object') ? srcDq._grimoire : {};
  const srcHistory = Array.isArray(srcDq._grimoire_history) ? srcDq._grimoire_history : [];
  const tgtGrimoire = (tgtDq._grimoire && typeof tgtDq._grimoire === 'object') ? tgtDq._grimoire : {};
  const tgtHistory = Array.isArray(tgtDq._grimoire_history) ? tgtDq._grimoire_history : [];

  const baseEpoch = Math.max(Number(srcDq._grimoire_epoch) || 0, Number(tgtDq._grimoire_epoch) || 0);
  let nextGrimoire;
  let nextHistory;
  let nextEpoch = baseEpoch;

  if (archiveGrimoire) {
    const archiveEntry = buildGrimoireYearArchiveEntry(srcGrimoire, academicYear, sourceProfile?.grade || '');
    nextHistory = mergeGrimoireHistory(
      mergeGrimoireHistory(srcHistory, tgtHistory),
      archiveEntry ? [archiveEntry] : []
    );
    // 新學年八星歸零重新挑戰（若學生先在新座號玩過已拿星則保留新座號當年度星）
    nextGrimoire = mergeWithExistingTarget ? { ...tgtGrimoire } : {};
    nextEpoch = baseEpoch + 1;
  } else {
    // 同學年學期中單純換座號：延續當年度八星進度
    nextHistory = mergeGrimoireHistory(srcHistory, tgtHistory);
    nextGrimoire = mergeGrimoireProgress(srcGrimoire, tgtGrimoire);
  }

  const preservedPin = getTransferPinFromProfile(existingTargetProfile) || getTransferPinFromProfile(sourceProfile) || '';

  const nextDq = {
    ...(mergeWithExistingTarget ? tgtDq : srcDq),
    _grimoire: nextGrimoire,
    _grimoire_history: nextHistory,
    _grimoire_epoch: nextEpoch,
    _transfer_meta: {
      transferredFrom: String(sourceProfile?.student_id || ''),
      transferredAt: new Date().toISOString(),
      academicYear: String(academicYear),
      archivedPreviousGrimoire: Boolean(archiveGrimoire)
    }
  };
  delete nextDq._archived_status;
  if (preservedPin) {
    nextDq._transfer_pin = preservedPin;
  }

  const srcCoins = Math.max(0, Number(sourceProfile?.coins) || 0);
  const srcQP = Math.max(0, Number(sourceProfile?.quest_points) || 0);
  const tgtCoins = mergeWithExistingTarget ? Math.max(0, Number(existingTargetProfile?.coins) || 0) : 0;
  const tgtQP = mergeWithExistingTarget ? Math.max(0, Number(existingTargetProfile?.quest_points) || 0) : 0;

  const mergedHistory = [
    ...(Array.isArray(sourceProfile?.semester_history) ? sourceProfile.semester_history : []),
    ...(mergeWithExistingTarget && Array.isArray(existingTargetProfile?.semester_history) ? existingTargetProfile.semester_history : [])
  ];

  return {
    student_id: targetId,
    grade: tGrade,
    class: tClass,
    seat: tSeat,
    nickname: (mergeWithExistingTarget && existingTargetProfile?.nickname)
      ? existingTargetProfile.nickname
      : (sourceProfile?.nickname || '好學生'),
    coins: srcCoins + tgtCoins,
    quest_points: srcQP + tgtQP,
    semester_id: getCurrentSemesterId(),
    semester_history: mergedHistory,
    inventory: mergeWithExistingTarget
      ? mergeInventoryLists(sourceProfile?.inventory, existingTargetProfile?.inventory)
      : (Array.isArray(sourceProfile?.inventory) ? [...sourceProfile.inventory] : []),
    daily_quest: nextDq,
    updated_at: new Date().toISOString()
  };
};

/**
 * 建構騰出舊座號或畢業生的封存紀錄：
 * - 完整備份原資產於 _transfer_meta，同時將現行 coins/quest_points 歸 0 避免重複出現在財富／積分榜
 * - 標記 _archived_status 讓舊號不再觸發衝號衝突且防止學生重複匯入
 */
export const buildArchivedSourceProfile = ({
  sourceProfile,
  status = 'transferred',
  transferredTo = null,
  academicYear = getCurrentAcademicYear()
}) => {
  const srcDq = (sourceProfile?.daily_quest && typeof sourceProfile.daily_quest === 'object')
    ? sourceProfile.daily_quest
    : {};
  const srcGrimoire = (srcDq._grimoire && typeof srcDq._grimoire === 'object') ? srcDq._grimoire : {};
  const srcHistory = Array.isArray(srcDq._grimoire_history) ? srcDq._grimoire_history : [];
  const archiveEntry = buildGrimoireYearArchiveEntry(srcGrimoire, academicYear, sourceProfile?.grade || '');
  const nextHistory = mergeGrimoireHistory(srcHistory, archiveEntry ? [archiveEntry] : []);

  return {
    ...sourceProfile,
    coins: 0,
    quest_points: 0,
    inventory: [],
    semester_history: [],
    daily_quest: {
      ...srcDq,
      _archived_status: status,
      _grimoire: {},
      _grimoire_history: nextHistory,
      _grimoire_epoch: (Number(srcDq._grimoire_epoch) || 0) + 1,
      _transfer_meta: {
        status,
        transferredTo: transferredTo ? String(transferredTo) : null,
        archivedAt: new Date().toISOString(),
        academicYear: String(academicYear),
        snapshotCoins: Math.max(0, Number(sourceProfile?.coins) || 0),
        snapshotQuestPoints: Math.max(0, Number(sourceProfile?.quest_points) || 0),
        snapshotInventoryCount: Array.isArray(sourceProfile?.inventory) ? sourceProfile.inventory.length : 0,
        snapshotSemesterHistory: Array.isArray(sourceProfile?.semester_history) ? sourceProfile.semester_history : []
      }
    },
    updated_at: new Date().toISOString()
  };
};
