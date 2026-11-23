import assert from 'node:assert/strict';
import {
  mergeGrimoireProgress,
  mergeGrimoireHistory,
  buildGrimoireYearArchiveEntry,
  computeGrimoireSummaryFromData,
  GRIMOIRE_GAME_MODES
} from '../src/utils/grimoireHelper.js';
import {
  isValidTransferPin,
  mergeDailyQuestPreservingMeta,
  getDefaultPromotionPlan,
  detectPromotionConflicts,
  buildTransferredTargetProfile,
  buildArchivedSourceProfile,
  isProfileArchived,
  getTransferPinFromProfile
} from '../src/services/accountTransferHelper.js';

console.log('CLOUD GRIMOIRE, ANNUAL ARCHIVE & DUAL-TRACK PROMOTION CONTRACT');

// 1. Cross-device Grimoire Union Merge (Math.max)
const phoneData = { '1': { sentence: 3, escape: 2 }, '2': { maze: 3 } };
const ipadData = { '1': { sentence: 2, escape: 3, spotter: 3 }, '3': { spelling: 3 } };
const mergedGrimoire = mergeGrimoireProgress(phoneData, ipadData);
assert.equal(mergedGrimoire['1'].sentence, 3);
assert.equal(mergedGrimoire['1'].escape, 3);
assert.equal(mergedGrimoire['1'].spotter, 3);
assert.equal(mergedGrimoire['2'].maze, 3);
assert.equal(mergedGrimoire['3'].spelling, 3);
console.log('✓ Cross-device Grimoire union merge (Math.max) passed');

// 2. daily_quest metadata protection (QuestBoard updates never wipe _grimoire or _transfer_pin)
const existingDq = {
  date: '2026-11-22',
  _grimoire: phoneData,
  _grimoire_history: [{ academicYear: '114', grade: '01', masteredStars: 1, totalMasteredModes: 10 }],
  _transfer_pin: '2580'
};
const incomingQuestUpdate = { date: '2026-11-23', activeQuestId: 'q_01', claimedIds: ['q_01'] };
const preservedDq = mergeDailyQuestPreservingMeta(existingDq, incomingQuestUpdate);
assert.equal(preservedDq.date, '2026-11-23');
assert.equal(preservedDq._transfer_pin, '2580');
assert.equal(preservedDq._grimoire['1'].sentence, 3);
assert.equal(preservedDq._grimoire_history.length, 1);
console.log('✓ daily_quest system metadata preservation passed');

// 3. Annual Grimoire Archive snapshot & history merge
const tenModes = {};
GRIMOIRE_GAME_MODES.slice(0, 10).forEach((m) => { tenModes[m.id] = 3; });
const year114Data = { '1': tenModes, '2': { sentence: 3, spelling: 3 } };
const summary114 = computeGrimoireSummaryFromData(year114Data);
assert.equal(summary114.masteredStars, 1);
assert.equal(summary114.totalMasteredModes, 12);

const archive114 = buildGrimoireYearArchiveEntry(year114Data, '114', '01');
assert.ok(archive114);
assert.equal(archive114.academicYear, '114');
assert.equal(archive114.masteredStars, 1);
assert.equal(archive114.books['1'].percent, 100);
assert.equal(archive114.books['1'].isMastered, true);
assert.equal(archive114.books['2'].percent, 20);
assert.equal(buildGrimoireYearArchiveEntry({}, '114', '01'), null);

const mergedHist = mergeGrimoireHistory([archive114], [
  { academicYear: '114', grade: '01', masteredStars: 0, totalMasteredModes: 5 },
  { academicYear: '113', grade: '01', masteredStars: 2, totalMasteredModes: 22 }
]);
assert.equal(mergedHist.length, 2);
assert.equal(mergedHist[0].academicYear, '114');
assert.equal(mergedHist[0].masteredStars, 1, 'Higher star archive must win on same year');
console.log('✓ Annual Grimoire archive snapshot & history deduplication passed');

// 4. Teacher Promotion Defaults (G1-G5 +1 grade, G6 graduate)
const g1Plan = getDefaultPromotionPlan({ student_id: '010101', grade: '01', class: '01', seat: '01', nickname: '小花' });
assert.equal(g1Plan.action, 'move');
assert.equal(g1Plan.targetGrade, '02');
assert.equal(g1Plan.targetClass, '01');
assert.equal(g1Plan.targetSeat, '01');

const g6Plan = getDefaultPromotionPlan({ student_id: '060301', grade: '06', class: '03', seat: '01', nickname: '阿山' });
assert.equal(g6Plan.action, 'graduate');
console.log('✓ Teacher promotion defaults (G1-G5 +1, G6 graduate) passed');

// 5. Real-time Conflict Detection (Mark's exact scenarios)
const roster = [
  { student_id: '010101', grade: '01', class: '01', seat: '01', nickname: '甲班一號' },
  { student_id: '010102', grade: '01', class: '01', seat: '02', nickname: '甲班二號' },
  { student_id: '020105', grade: '02', class: '01', seat: '05', nickname: '二年五號' },
  { student_id: '050101', grade: '05', class: '01', seat: '01', nickname: '五年一號' },
  { student_id: '060101', grade: '06', class: '01', seat: '01', nickname: '六年一號' }
];

// 5A: 甲班一號改成甲班二號，與原甲班二號衝號 -> 必須紅燈衝突
const collisionRows = [
  { ...getDefaultPromotionPlan(roster[0]), targetSeat: '02' }, // 010101 -> 020102
  getDefaultPromotionPlan(roster[1])                           // 010102 -> 020102
];
const resCollision = detectPromotionConflicts(collisionRows, roster);
assert.equal(resCollision.hasConflicts, true);
assert.equal(resCollision.conflictCount, 1);
assert.ok(resCollision.conflictMapBySourceId['010101']);
assert.ok(resCollision.conflictMapBySourceId['010102']);
assert.equal(resCollision.conflictMapBySourceId['010101'].targetId, '020102');

// 5B: 甲班一號與甲班二號互相交換座號 -> 合法無衝突
const swapRows = [
  { ...getDefaultPromotionPlan(roster[0]), action: 'move', targetGrade: '01', targetClass: '01', targetSeat: '02' },
  { ...getDefaultPromotionPlan(roster[1]), action: 'move', targetGrade: '01', targetClass: '01', targetSeat: '01' }
];
const resSwap = detectPromotionConflicts(swapRows, roster);
assert.equal(resSwap.hasConflicts, false);

// 5C: 僅展開一年級升級，把 010101 改到 020105（撞到未移動的現有二年五號）-> 必須偵測衝突
const crossGradeCollision = [
  { ...getDefaultPromotionPlan(roster[0]), targetGrade: '02', targetClass: '01', targetSeat: '05' }
];
const resCrossCollision = detectPromotionConflicts(crossGradeCollision, roster);
assert.equal(resCrossCollision.hasConflicts, true);
assert.ok(resCrossCollision.conflictMapBySourceId['010101']);

// 5D: 六年級畢業封存釋出 060101，五年級 050101 升上 060101 -> 合法無衝突
const gradAndPromote = [
  getDefaultPromotionPlan(roster[3]), // 050101 -> 060101
  getDefaultPromotionPlan(roster[4])  // 060101 -> graduate
];
const resGrad = detectPromotionConflicts(gradAndPromote, roster);
assert.equal(resGrad.hasConflicts, false);
console.log('✓ Real-time conflict detection (collision, 1<->2 swap, cross-grade occupant, G6 graduate) passed');

// 6. Transfer Profile Builder & Source Archiving + 4-digit PIN validation
assert.equal(isValidTransferPin('0428'), true);
assert.equal(isValidTransferPin('123'), false);
assert.equal(isValidTransferPin('12ab'), false);
assert.equal(isValidTransferPin('12345'), false);

const sourceStudent = {
  student_id: '010101',
  grade: '01',
  class: '01',
  seat: '01',
  nickname: '小雲豹',
  coins: 320,
  quest_points: 180,
  inventory: ['item_lily', 'item_urn'],
  semester_history: [{ semester_id: '114-1', coins: 120, quest_points: 60 }],
  daily_quest: {
    _grimoire: year114Data,
    _grimoire_history: [],
    _grimoire_epoch: 0,
    _transfer_pin: '8866'
  }
};

// 6A: 跨學年升級（封存舊年度八星，新年度歸零重打，資產與 4 碼密碼完整保留）
const promoted = buildTransferredTargetProfile({
  sourceProfile: sourceStudent,
  targetGrade: '02',
  targetClass: '02',
  targetSeat: '12',
  archiveGrimoire: true,
  academicYear: '114',
  mergeWithExistingTarget: false
});
assert.equal(promoted.student_id, '020212');
assert.equal(promoted.coins, 320);
assert.equal(promoted.quest_points, 180);
assert.deepEqual(promoted.inventory, ['item_lily', 'item_urn']);
assert.equal(getTransferPinFromProfile(promoted), '8866');
assert.deepEqual(promoted.daily_quest._grimoire, {});
assert.equal(promoted.daily_quest._grimoire_history.length, 1);
assert.equal(promoted.daily_quest._grimoire_history[0].academicYear, '114');
assert.equal(promoted.daily_quest._grimoire_history[0].masteredStars, 1);
assert.equal(promoted.daily_quest._grimoire_epoch, 1);

// 6B: 學期中同級換座號（不封存當年八星，原進度完整延續）
const midSemMoved = buildTransferredTargetProfile({
  sourceProfile: sourceStudent,
  targetGrade: '01',
  targetClass: '01',
  targetSeat: '09',
  archiveGrimoire: false,
  academicYear: '114',
  mergeWithExistingTarget: false
});
assert.equal(midSemMoved.student_id, '010109');
assert.equal(midSemMoved.daily_quest._grimoire['1'].sentence, 3);
assert.equal(midSemMoved.daily_quest._grimoire_history.length, 0);

// 6C: 學生自行以 4 碼密碼匯入至已玩過的新座號（合併金幣與背包不遺失）
const newSeatExisting = {
  student_id: '020212',
  grade: '02',
  class: '02',
  seat: '12',
  nickname: '小雲豹二號',
  coins: 50,
  quest_points: 20,
  inventory: ['item_eagle'],
  daily_quest: { _grimoire: { '2': { sentence: 3 } } }
};
const selfMerged = buildTransferredTargetProfile({
  sourceProfile: sourceStudent,
  existingTargetProfile: newSeatExisting,
  targetGrade: '02',
  targetClass: '02',
  targetSeat: '12',
  archiveGrimoire: true,
  academicYear: '114',
  mergeWithExistingTarget: true
});
assert.equal(selfMerged.coins, 370);
assert.equal(selfMerged.quest_points, 200);
assert.equal(selfMerged.inventory.length, 3);
assert.equal(selfMerged.daily_quest._grimoire['2'].sentence, 3, 'New year progress already earned on target seat must be preserved');
assert.equal(selfMerged.daily_quest._grimoire_history.length, 1);

// 6D: 舊座號封存殼檢查（不重複上榜、不佔衝號、保留備份快照）
const archivedOld = buildArchivedSourceProfile({
  sourceProfile: sourceStudent,
  status: 'transferred',
  transferredTo: '020212',
  academicYear: '114'
});
assert.equal(isProfileArchived(archivedOld), true);
assert.equal(archivedOld.coins, 0);
assert.equal(archivedOld.quest_points, 0);
assert.equal(archivedOld.semester_history.length, 0);
assert.equal(archivedOld.daily_quest._transfer_meta.snapshotCoins, 320);
assert.equal(archivedOld.daily_quest._transfer_meta.transferredTo, '020212');
console.log('✓ Cross-year archive, mid-semester move, self-transfer merge & source archiving passed');
