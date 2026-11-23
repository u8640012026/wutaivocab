import fs from 'node:fs';
import path from 'node:path';
import {
  SUPPORTED_TEXTBOOK_BOOKS,
  SENTENCE_BANKS_BY_BOOK,
  BOOK1_SENTENCES,
  BOOK1_CROSS_UNIT_SENTENCES,
  BOOK1_LV3_QUESTIONS,
  BOOK8_SENTENCES,
  normalizeLessonToken,
  parseSelectedSentenceScope,
  formatTokensToSentence,
  getAcceptedTokenVariants,
  matchSentenceTokens,
  getAvailableSentences,
  getAvailableSentenceCount,
  generateSentenceRound,
  generateAlphabetSequenceRound,
  getAlphabetSequencePoolCount
} from '../src/data/sentencePatterns.js';
import {
  generateQuizAlphabetQuestions,
  generateSpellingAlphabetRound
} from '../src/services/alphabetEngine.js';
import {
  getBookProgress,
  mapModeToGrimoireId,
  recordGrimoireStar
} from '../src/utils/grimoireHelper.js';
import {
  getSentenceListeningQuestions,
  getDialogueQAQuestions
} from '../src/services/listeningQuestionBank.js';
import { PERSONAS, voiceManager, speakEnglish, stopSpeech, getVoiceDiagnostics } from '../src/services/audio.js';
import {
  doesLeaderboardEntryMatchStudent,
  parseLeaderboardIdentity,
  isBookInOwnGrade,
  isAlphabetGameMode
} from '../src/utils/studentIdHelper.js';

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

console.log('BATCH 1, 2A & 2B SENTENCE (BOOKS 1-8), ALPHABET, GRIMOIRE & SCORING CONTRACT');

// 1. 驗證 sentencePatterns.js 全題庫契約 (Books 1~8 Lv.1/Lv.2/跨單元 + Lv.3 + 低年級純字母連續序列)
assert(BOOK1_SENTENCES.length >= 30, `Expected >= 30 Book 1 sentences, got ${BOOK1_SENTENCES.length}`);
assert(BOOK1_CROSS_UNIT_SENTENCES.length >= 8, `Expected >= 8 cross-unit sentences, got ${BOOK1_CROSS_UNIT_SENTENCES.length}`);
assert(BOOK1_LV3_QUESTIONS.length === 35, `Expected 35 Book 1 Lv.3 questions, got ${BOOK1_LV3_QUESTIONS.length}`);

const FORBIDDEN_WORD_SPOILING_IMGS = ['marker.png', 'milk.png', 'bus.png'];
const seenIds = new Set();

for (const bookId of SUPPORTED_TEXTBOOK_BOOKS) {
  const bank = SENTENCE_BANKS_BY_BOOK[bookId];
  assert(bank, `Missing sentence bank for book ${bookId}`);
  const allLv12 = [...bank.sentences, ...bank.crossUnit];
  assert(bank.sentences.length >= 30, `Book ${bookId} expected >= 30 sentences, got ${bank.sentences.length}`);
  assert(bank.crossUnit.length >= 6, `Book ${bookId} expected >= 6 cross-unit sentences, got ${bank.crossUnit.length}`);
  assert(bank.lv3.length >= 24, `Book ${bookId} expected >= 24 Lv.3 questions, got ${bank.lv3.length}`);

  for (const q of allLv12) {
    assert(q.id && !seenIds.has(q.id), `Duplicate or missing id: ${q.id}`);
    seenIds.add(q.id);
    assert(String(q.book) === String(bookId), `Mismatched book in ${q.id}`);
    assert(!q.en.includes('’'), `Curly apostrophe found in ${q.id}: ${q.en}`);
    assert(Array.isArray(q.tokens) && q.tokens.length >= 3, `Invalid tokens in ${q.id}`);
    assert(formatTokensToSentence(q.tokens) === q.en, `Tokens mismatch in ${q.id}: ${formatTokensToSentence(q.tokens)} !== ${q.en}`);
    assert(q.zh && q.zh.trim().length > 0, `Missing zh in ${q.id}`);
    const lowerSet = new Set(q.tokens.map(t => t.toLowerCase()));
    assert(Array.isArray(q.distractors) && q.distractors.length >= 2, `Missing distractors in ${q.id}`);
    assert(new Set(q.distractors.map(d => d.toLowerCase())).size === q.distractors.length, `Duplicate distractors in ${q.id}`);
    for (const d of q.distractors) {
      assert(!lowerSet.has(d.toLowerCase()), `Distractor overlaps token in ${q.id}: ${d}`);
    }
    const baseSorted = [...q.tokens].sort().join('|');
    for (const variant of getAcceptedTokenVariants(q)) {
      assert([...variant].sort().join('|') === baseSorted, `acceptedVariant changed tokens multiset in ${q.id}`);
    }
  }

  const normalizeCueScan = s => String(s || '').toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const q of bank.lv3) {
    assert(q.id && !seenIds.has(q.id), `Duplicate or missing Lv.3 id: ${q.id}`);
    seenIds.add(q.id);
    assert(String(q.book) === String(bookId), `Mismatched Lv.3 book in ${q.id}`);
    assert(['dialogue', 'listen_build', 'listen_qa', 'picture'].includes(q.promptType), `Invalid Lv.3 promptType in ${q.id}`);
    assert(!q.en.includes('’'), `Curly apostrophe found in ${q.id}: ${q.en}`);
    assert(Array.isArray(q.tokens) && q.tokens.length >= 3, `Invalid tokens in ${q.id}`);
    assert(formatTokensToSentence(q.tokens) === q.en, `Tokens mismatch in ${q.id}`);
    assert(q.zh && q.zh.trim().length > 0, `Missing zh in ${q.id}`);
    assert(q.hideChineseByDefault === true, `Lv.3 ${q.id} must hide Chinese by default`);
    // 防洩題檢查：cueText / pictureCue 不得包含完整英文目標句，第 2~8 冊 >= 4 詞句子交集比例必須 < 0.70
    const normEn = normalizeCueScan(q.en);
    const normCue = normalizeCueScan(`${q.cueText || ''} ${q.pictureCue || ''}`);
    assert(!(normEn && normCue.includes(normEn)), `Lv.3 cue leaks full English answer in ${q.id}: ${q.cueText || q.pictureCue}`);
    if (Number(bookId) >= 2) {
      const enWords = normEn.split(' ').filter(Boolean);
      const cueWords = new Set(normCue.split(' ').filter(Boolean));
      const hitCount = enWords.filter(w => cueWords.has(w)).length;
      if (enWords.length >= 4) {
        assert(hitCount / enWords.length < 0.7, `Lv.3 cue word overlap >= 0.70 in ${q.id} (${hitCount}/${enWords.length}): ${q.cueText || q.pictureCue}`);
      }
    }
    if (q.imageSrc) {
      for (const badImg of FORBIDDEN_WORD_SPOILING_IMGS) {
        assert(!q.imageSrc.includes(badImg), `Lv.3 ${q.id} must not use word-spoiling ${badImg}`);
      }
      const absImgPath = path.resolve(process.cwd(), 'public', q.imageSrc.replace(/^\/+/, ''));
      assert(fs.existsSync(absImgPath), `Lv.3 image missing on disk for ${q.id}: ${absImgPath}`);
    }
    if (q.promptType === 'listen_build' || q.promptType === 'listen_qa') {
      assert(q.isListeningTask === true && q.strictOrder === true, `Lv.3 listening item ${q.id} must enforce strictOrder`);
      const spokenSrc = q.promptType === 'listen_qa' ? q.promptAudioText : (q.audioText || q.en);
      assert(spokenSrc && spokenSrc.trim().length > 0, `Lv.3 listening item ${q.id} missing audio source`);
    }
    if (q.promptType === 'dialogue') {
      assert(
        q.dialogueLine && q.dialogueLine.trim().toLowerCase() !== q.en.trim().toLowerCase(),
        `Lv.3 dialogue ${q.id} must not mirror exact answer line`
      );
    }
    const baseSorted = [...q.tokens].sort().join('|');
    for (const variant of getAcceptedTokenVariants(q, { allowVariants: true })) {
      assert([...variant].sort().join('|') === baseSorted, `Lv.3 acceptedVariant changed tokens multiset in ${q.id}`);
    }
  }
}

// 2. 驗證低年級一／二年級純字母連續序列（G1=3字母, G2=5字母；零跳字、零單題混寫、mixed 嚴格逐題交替）
assert(getAlphabetSequencePoolCount(1) === 24 && getAvailableSentenceCount({ selectedUnits: ['abc'], alphaGrade: 1 }) === 24, 'G1 pool count must be 24');
assert(getAlphabetSequencePoolCount(2) === 22 && getAvailableSentenceCount({ selectedUnits: ['abc'], alphaGrade: 2 }) === 22, 'G2 pool count must be 22');

const assertConsecutiveTokens = (tokens, expectedLen, expectedCase) => {
  assert(Array.isArray(tokens) && tokens.length === expectedLen, `Expected ${expectedLen} letters, got ${tokens?.length}`);
  for (let i = 0; i < tokens.length; i++) {
    const ch = tokens[i];
    if (expectedCase === 'upper') assert(/^[A-Z]$/.test(ch), `Expected uppercase letter, got ${ch}`);
    else assert(/^[a-z]$/.test(ch), `Expected lowercase letter, got ${ch}`);
    if (i > 0) {
      assert(ch.charCodeAt(0) === tokens[i - 1].charCodeAt(0) + 1, `Letters must be strictly consecutive without gaps: ${tokens.join('')}`);
    }
  }
};

const g1UpperRound = generateSentenceRound({ selectedUnits: ['abc'], alphaMode: 'upper', alphaGrade: 1, count: 10 });
assert(g1UpperRound.isAlphabetRound && g1UpperRound.questions.length === 10, 'G1 alpha upper round expected 10 questions');
assert(new Set(g1UpperRound.questions.map(q => q.id)).size === 10, 'G1 alpha round must not duplicate windows');
for (const q of g1UpperRound.questions) {
  assertConsecutiveTokens(q.tokens, 3, 'upper');
  assert(q.bankTiles.map(t => t.text).join('|') !== q.tokens.join('|'), `Bank tiles must start shuffled in ${q.id}`);
}

const g2LowerRound = generateAlphabetSequenceRound({ alphaMode: 'lower', alphaGrade: 2, count: 10 });
assert(g2LowerRound.questions.length === 10, 'G2 alpha lower round expected 10 questions');
assert(new Set(g2LowerRound.questions.map(q => q.id)).size === 10, 'G2 alpha round must not duplicate windows');
for (const q of g2LowerRound.questions) {
  assertConsecutiveTokens(q.tokens, 5, 'lower');
  assert(q.bankTiles.map(t => t.text).join('|') !== q.tokens.join('|'), `Bank tiles must start shuffled in ${q.id}`);
}

for (let trial = 0; trial < 20; trial++) {
  const g2MixedRound = generateSentenceRound({ selectedUnits: ['abc'], alphaMode: 'mixed', alphaGrade: 2, count: 10 });
  assert(g2MixedRound.questions.length === 10, 'G2 mixed round expected 10 questions');
  let mixedUpperCount = 0;
  let mixedLowerCount = 0;
  let prevUpper = null;
  for (const q of g2MixedRound.questions) {
    const allU = q.tokens.every(t => /^[A-Z]$/.test(t));
    const allL = q.tokens.every(t => /^[a-z]$/.test(t));
    assert(allU !== allL, `Intra-question mixed case forbidden in ${q.id}: ${q.tokens.join('')}`);
    if (prevUpper !== null) {
      assert(allU !== prevUpper, `Mixed alphabet sequence must strictly alternate U/L per question (trial ${trial})`);
    }
    prevUpper = allU;
    if (allU) {
      mixedUpperCount += 1;
      assertConsecutiveTokens(q.tokens, 5, 'upper');
    } else {
      mixedLowerCount += 1;
      assertConsecutiveTokens(q.tokens, 5, 'lower');
    }
  }
  assert(mixedUpperCount === 5 && mixedLowerCount === 5, `Mixed G2 round must balance 5 upper + 5 lower, got ${mixedUpperCount}/${mixedLowerCount}`);
}

// 2B. 驗證第 1~8 冊 Lv.1 / Lv.2 / Lv.3 單元誠實性、無干擾塊與分層抽題
for (const bookId of SUPPORTED_TEXTBOOK_BOOKS) {
  for (const unit of ['0', '1', '2', '3', '4', 'festival']) {
    const unitKey = `${bookId}-${unit}`;
    for (const level of ['lv1', 'lv2', 'lv3']) {
      const r = generateSentenceRound({ selectedUnits: [unitKey], level, count: 10 });
      assert(r.questions.length >= (level === 'lv3' ? 3 : 4), `Unit ${unitKey} (${level}) returned too few questions: ${r.questions.length}`);
      for (const q of r.questions) {
        const tileIds = new Set(q.bankTiles.map(t => t.tileId));
        assert(tileIds.size === q.bankTiles.length, `Duplicate tileId in ${q.id}`);
        if (level === 'lv2') {
          assert(q.bankTiles.some(t => t.isDistractor), `Lv.2 missing distractor in ${q.id}`);
        } else {
          assert(q.bankTiles.every(t => !t.isDistractor), `${level} leaked distractor in ${q.id}`);
        }
        if (q.isCrossUnit || level === 'lv3') {
          assert(q.hideChineseByDefault === true, `${level} / cross-unit ${q.id} must hide Chinese by default`);
        }
      }
    }
  }

  const allLv3Round = generateSentenceRound({ selectedUnits: [`${bookId}-all`], level: 'lv3', count: 10 });
  assert(allLv3Round.questions.length === 10, `Book ${bookId} all Lv.3 expected 10 questions, got ${allLv3Round.questions.length}`);
  const lv3TypesPresent = new Set(allLv3Round.questions.map(q => q.promptType));
  for (const expectedType of ['dialogue', 'listen_build', 'listen_qa', 'picture']) {
    assert(lv3TypesPresent.has(expectedType), `Book ${bookId} all Lv.3 round missing stratified promptType ${expectedType}`);
  }
}

const lv3SymListen = BOOK1_LV3_QUESTIONS.find(q => q.id === 'b1_lv3_u4_04');
assert(matchSentenceTokens(["It's", 'yellow', 'and', 'red', '.'], lv3SymListen) === null, 'Lv.3 listen_build must reject swapped color order even without options');
assert(matchSentenceTokens(["It's", 'yellow', 'and', 'red', '.'], lv3SymListen, { allowVariants: true }) === null, 'Lv.3 strict listening task must reject swapped order even if allowVariants:true');
assert(matchSentenceTokens(["It's", 'red', 'and', 'yellow', '.'], lv3SymListen), 'Lv.3 listen_build must accept exact spoken order');

// 2C. 驗證 alphabetEngine (StandardQuiz 聽力 / SpellingGame 連續填空) 100% 遵守 alphaMode、alphaGrade 與 mixed 嚴格逐題交替
for (const mode of ['upper', 'lower', 'mixed']) {
  const trials = mode === 'mixed' ? 20 : 1;
  for (let trial = 0; trial < trials; trial++) {
    const qList = generateQuizAlphabetQuestions('listening', 20, mode);
    assert(qList.length === 20, `Alphabet listening (${mode}) expected 20 items`);
    let uItems = 0;
    let lItems = 0;
    let prevOptUpper = null;
    for (const item of qList) {
      assert(item.options.length === 4, `Alphabet listening must have 4 options`);
      const texts = item.options.map(o => o.textEn);
      assert(new Set(texts).size === 4, `Alphabet listening has duplicate options: ${texts.join(',')}`);
      const optUpper = texts.every(t => /^[A-Z]$/.test(t));
      const optLower = texts.every(t => /^[a-z]$/.test(t));
      assert(optUpper !== optLower, `Intra-question option case mix in alphabet listening (${mode}): ${texts.join(',')}`);
      if (mode === 'upper') assert(optUpper && /^[A-Z]$/.test(item.correctAnswer), 'Upper listening leaked lowercase');
      if (mode === 'lower') assert(optLower && /^[a-z]$/.test(item.correctAnswer), 'Lower listening leaked uppercase');
      if (mode === 'mixed' && prevOptUpper !== null) {
        assert(optUpper !== prevOptUpper, `Mixed listening must strictly alternate U/L per question (trial ${trial})`);
      }
      prevOptUpper = optUpper;
      if (optUpper) uItems += 1;
      else lItems += 1;
    }
    if (mode === 'mixed') assert(uItems === 10 && lItems === 10, `Mixed listening must balance 10/10, got ${uItems}/${lItems}`);
  }
}

const spellG1 = generateSpellingAlphabetRound({ count: 10, alphaMode: 'upper', alphaGrade: 1 });
assert(spellG1.length === 10 && spellG1.every(q => q.seqLength === 4 && q.blankCount === 1 && q.isUpper), 'G1 spelling must have 4 letters, 1 blank, all uppercase');
for (let trial = 0; trial < 20; trial++) {
  const spellG2Mixed = generateSpellingAlphabetRound({ count: 10, alphaMode: 'mixed', alphaGrade: 2 });
  assert(spellG2Mixed.length === 10, 'G2 mixed spelling expected 10 items');
  let spU = 0;
  let spL = 0;
  let prevSpellUpper = null;
  for (const sq of spellG2Mixed) {
    assert(sq.seqLength === 5, `G2 spelling seqLength must be 5, got ${sq.seqLength}`);
    const seqU = sq.sequenceChars.every(c => /^[A-Z]$/.test(c));
    const seqL = sq.sequenceChars.every(c => /^[a-z]$/.test(c));
    const candU = sq.candidateTiles.every(t => /^[A-Z]$/.test(t.char));
    const candL = sq.candidateTiles.every(t => /^[a-z]$/.test(t.char));
    assert((seqU && candU) || (seqL && candL), `G2 spelling mixed case leak in ${sq.id}`);
    assertConsecutiveTokens(sq.sequenceChars, 5, seqU ? 'upper' : 'lower');
    if (prevSpellUpper !== null) {
      assert(seqU !== prevSpellUpper, `Mixed spelling must strictly alternate U/L per question (trial ${trial})`);
    }
    prevSpellUpper = seqU;
    if (seqU) spU += 1;
    else spL += 1;
  }
  assert(spU === 5 && spL === 5, `G2 mixed spelling must balance 5 upper + 5 lower, got ${spU}/${spL}`);
}

// U1 只有 6 題，不應補入未選單元；U4 則解鎖跨單元題
const u1Pool = getAvailableSentences({ selectedUnits: ['1-1'] });
assert(u1Pool.length === 6 && u1Pool.every(q => q.unit === '1' && !q.isCrossUnit), '1-1 leaked other units');
const u4Pool = getAvailableSentences({ selectedUnits: ['1-4'] });
assert(u4Pool.some(q => q.isCrossUnit), '1-4 should unlock Book 1 cross-unit sentences');

// 重複詞項目 Hi! I'm Abu, and I'm ten. 必須讓每個重複的 "I'm" tile 持有獨立 tileId；同時驗證對稱句 b1_u4_04 支援對調
const book1Lv2 = generateSentenceRound({ selectedUnits: ['1-all'], level: 'lv2', count: 50 });
const dupWordQ = book1Lv2.questions.find(q => q.id === 'cross_b1_07');
assert(dupWordQ, 'Expected cross_b1_07 in 1-all pool');
assert(dupWordQ.bankTiles.filter(t => t.text === "I'm").length === 2, 'Duplicate word "I\'m" must keep 2 independent tiles');
assert(new Set(dupWordQ.bankTiles.map(t => t.tileId)).size === dupWordQ.bankTiles.length, 'tileIds must be unique');

const symQ = BOOK1_SENTENCES.find(q => q.id === 'b1_u4_04');
assert(matchSentenceTokens(["It's", 'red', 'and', 'yellow', '.'], symQ), 'Primary order must match b1_u4_04');
assert(matchSentenceTokens(["It's", 'yellow', 'and', 'red', '.'], symQ), 'Swapped symmetric order must also match b1_u4_04');
assert(matchSentenceTokens(["It's", 'yellow', 'and', 'red', '.'], symQ, { allowVariants: true }), 'Explicit allowVariants:true must match swapped symmetric order');
assert(matchSentenceTokens(["It's", 'yellow', 'and', 'red', '.'], symQ, { allowVariants: false }) === null, 'Listening/strict mode (allowVariants:false) must reject swapped symmetric order');
assert(matchSentenceTokens(["It's", 'red', 'and', 'yellow', '.'], symQ, { allowVariants: false }), 'Listening/strict mode (allowVariants:false) must accept exact primary order');
assert(matchSentenceTokens(["It's", 'yellow', 'and', 'red', '.'], { ...symQ, isListeningTask: true }) === null, 'isListeningTask:true must reject swapped symmetric order');
assert(matchSentenceTokens(["It's", 'yellow', 'and', 'red', '.'], { ...symQ, strictOrder: true }) === null, 'strictOrder:true must reject swapped symmetric order');
assert(!matchSentenceTokens(['yellow', 'and', 'red', "It's", '.'], symQ), 'Invalid syntax order must still fail b1_u4_04');

// 第 8 冊氣候對稱句驗證（非聽力可對調、聽力嚴格鎖定）
const symB8Q = BOOK8_SENTENCES.find(q => q.id === 'b8_u4_03');
assert(matchSentenceTokens(["It's", 'dry', 'and', 'cool', 'in', 'fall', '.'], symB8Q), 'Book 8 cool/dry swap must match in build mode');
assert(matchSentenceTokens(["It's", 'dry', 'and', 'cool', 'in', 'fall', '.'], { ...symB8Q, isListeningTask: true }) === null, 'Book 8 cool/dry swap must fail in strict listening mode');

// 2D. 驗證第 2~8 冊逐冊 U4 跨單元門檻、跨冊混選、Culture/Sports/Review 正規化、abc+課本混選揭露、第 9 冊未收錄保護與混選略過提示
assert(normalizeLessonToken('Culture') === 'festival', 'Culture must normalize to festival');
assert(normalizeLessonToken('Sports Around the World') === 'festival', 'Sports must normalize to festival');
assert(normalizeLessonToken('Review 1') === 'review1', 'Review 1 must normalize to review1');
assert(normalizeLessonToken('Review 2') === 'review2', 'Review 2 must normalize to review2');
assert(normalizeLessonToken('Review') === 'review', 'Review must normalize to review');

const b2Rev1Pool = getAvailableSentences({ selectedUnits: ['2-Review 1'] });
assert(b2Rev1Pool.length === 12 && b2Rev1Pool.every(q => (q.unit === '1' || q.unit === '2') && !q.isCrossUnit), '2-Review 1 should return U1+U2 (12 items)');
const b2Rev2Pool = getAvailableSentences({ selectedUnits: ['2-Review 2'] });
assert(b2Rev2Pool.length === 18 && b2Rev2Pool.some(q => q.isCrossUnit) && b2Rev2Pool.every(q => q.unit === '3' || q.unit === '4'), '2-Review 2 should return U3+U4+crossUnit (18 items)');
const b2RevAllPool = getAvailableSentences({ selectedUnits: ['2-review'] });
assert(b2RevAllPool.length === 30 && b2RevAllPool.some(q => q.isCrossUnit), '2-review should return U1~U4+crossUnit (30 items)');

const b2SwimFix = SENTENCE_BANKS_BY_BOOK['2'].lv3.find(q => q.id === 'b2_lv3_u2_04');
assert(b2SwimFix && b2SwimFix.dialogueLine.toLowerCase().includes('swim') && !b2SwimFix.dialogueLine.toLowerCase().includes('sing'), 'b2_lv3_u2_04 dialogueLine must match swim action');

const abcPlusBookScope = parseSelectedSentenceScope(['abc', '2-1']);
assert(abcPlusBookScope.skippedAbc === true, 'abc + 2-1 must set skippedAbc: true');
const abcPlusBookRound = generateSentenceRound({ selectedUnits: ['abc', '2-1'], level: 'lv1', count: 10 });
assert(
  abcPlusBookRound.emptyReason === null &&
    abcPlusBookRound.skippedAbc === true &&
    abcPlusBookRound.questions.length === 6 &&
    abcPlusBookRound.questions.every(q => String(q.book) === '2'),
  'abc + 2-1 must play Book 2 U1 and disclose skippedAbc: true'
);

const abcUnknownUnitScope = parseSelectedSentenceScope(['abc', '2-unknown']);
assert(
  abcUnknownUnitScope.skippedAbc === false &&
    abcUnknownUnitScope.supportedBooks.length === 0 &&
    abcUnknownUnitScope.hasPartialUnsupported === true &&
    abcUnknownUnitScope.unsupportedUnits.has('2-unknown'),
  'abc + 2-unknown must separate book support from valid playable units'
);
const abcUnknownUnitRound = generateSentenceRound({ selectedUnits: ['abc', '2-unknown'], count: 10 });
assert(
  abcUnknownUnitRound.isAlphabetRound === true &&
    abcUnknownUnitRound.skippedAbc === false &&
    abcUnknownUnitRound.questions.length === 10 &&
    abcUnknownUnitRound.unsupportedUnits.includes('2-unknown'),
  'abc + 2-unknown must fall back cleanly to alphabet sequence while disclosing unsupportedUnits'
);
const b2WithUnknownRound = generateSentenceRound({ selectedUnits: ['2-1', '2-unknown'], level: 'lv1', count: 10 });
assert(
  b2WithUnknownRound.emptyReason === null &&
    b2WithUnknownRound.questions.length === 6 &&
    b2WithUnknownRound.unsupportedUnits.includes('2-unknown'),
  '2-1 + 2-unknown must play Book 2 U1 while disclosing unsupportedUnits'
);
const onlyUnknownUnitRound = generateSentenceRound({ selectedUnits: ['2-unknown'], level: 'lv1', count: 10 });
assert(
  onlyUnknownUnitRound.questions.length === 0 &&
    onlyUnknownUnitRound.emptyReason === 'no_units_selected' &&
    onlyUnknownUnitRound.unsupportedUnits.includes('2-unknown'),
  '2-unknown alone must return no_units_selected with unsupportedUnits disclosed'
);

const b2U1Pool = getAvailableSentences({ selectedUnits: ['2-1'] });
assert(b2U1Pool.length === 6 && b2U1Pool.every(q => String(q.book) === '2' && q.unit === '1' && !q.isCrossUnit), '2-1 leaked cross-unit or wrong book');
const b1U4AndB2U1Pool = getAvailableSentences({ selectedUnits: ['1-4', '2-1'] });
assert(b1U4AndB2U1Pool.some(q => String(q.book) === '1' && q.isCrossUnit), '1-4 + 2-1 should unlock Book 1 cross-unit');
assert(!b1U4AndB2U1Pool.some(q => String(q.book) === '2' && q.isCrossUnit), '1-4 + 2-1 must NOT leak Book 2 cross-unit without 2-4');
const b2U4Pool = getAvailableSentences({ selectedUnits: ['2-4'] });
assert(b2U4Pool.some(q => String(q.book) === '2' && q.isCrossUnit), '2-4 should unlock Book 2 cross-unit');

const multiBookPool = getAvailableSentences({ selectedUnits: ['2-1', '5-3'] });
assert(multiBookPool.some(q => String(q.book) === '2' && q.unit === '1') && multiBookPool.some(q => String(q.book) === '5' && q.unit === '3'), 'Multi-book selection 2-1 + 5-3 failed');

const b9Round = generateSentenceRound({ selectedUnits: ['9-1'], level: 'lv1', count: 10 });
assert(b9Round.questions.length === 0 && b9Round.emptyReason === 'upcoming_book' && b9Round.unsupportedBooks.includes('9'), 'Unsupported Book 9 must return upcoming_book');
assert(getAvailableSentenceCount({ selectedUnits: ['9-all'] }) === 0, 'Book 9 count must be 0');

const mixedScope = parseSelectedSentenceScope(['2-1', '9-1']);
assert(mixedScope.hasSupported && !mixedScope.hasUnsupportedOnly && mixedScope.hasPartialUnsupported, 'Mixed supported + unsupported scope flags wrong');
const mixedRound = generateSentenceRound({ selectedUnits: ['2-1', '9-1'], level: 'lv1', count: 10 });
assert(mixedRound.emptyReason === null && mixedRound.questions.length === 6 && mixedRound.questions.every(q => String(q.book) === '2') && mixedRound.unsupportedBooks.join(',') === '9', 'Mixed 2-1 + 9-1 must play Book 2 while disclosing unsupported Book 9');

// 3. 驗證秘典舊星承接與真實星等分離 (mock localStorage)
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k)
};
store.set('wutai_grimoire_progress_030101', JSON.stringify({
  '1': {
    'quiz-choice': 3,
    'spelling': 3
  }
}));
const prog = getBookProgress('030101', 1);
assert(prog.threeStarCount === 2, `Expected 2 preserved 3-star modes, got ${prog.threeStarCount}`);
assert(prog.modesStatus.sentence === 0, `Sentence actual stars must remain 0, got ${prog.modesStatus.sentence}`);
assert(prog.legacyPreservedModes.sentence === true, 'legacyPreservedModes.sentence must be true');
assert(mapModeToGrimoireId('sentence') === 'sentence', 'sentence must map to sentence grimoire id');
assert(mapModeToGrimoireId('sentence-abc') === 'sentence', 'sentence-abc must map to sentence grimoire id');
assert(mapModeToGrimoireId('quiz-choice') === 'quiz-choice', 'legacy quiz-choice must remain mapped to quiz-choice');

// 驗證八星連動與 1~6 年級本年級金幣／上榜資格判定
recordGrimoireStar('030101', '1', mapModeToGrimoireId('sentence'), 3);
const progAfterSentence = getBookProgress('030101', 1);
assert(progAfterSentence.modesStatus.sentence === 3, `sentence 3-star must update Grimoire Book 1, got ${progAfterSentence.modesStatus.sentence}`);
assert(progAfterSentence.threeStarCount === 2, 'sentence + quiz-choice share 1 Grimoire slot for total count (legacy safe)');
recordGrimoireStar('050101', '5', mapModeToGrimoireId('sentence'), 3);
assert(getBookProgress('050101', 5).modesStatus.sentence === 3 && getBookProgress('050101', 5).threeStarCount === 1, 'Book 5 sentence 3-star must light up Grimoire');
recordGrimoireStar('020101', '2', mapModeToGrimoireId('sentence-abc'), 3);
assert(getBookProgress('020101', 2).modesStatus.sentence === 3, 'G2 sentence-abc must light up Book 2 sentence slot');

assert(isAlphabetGameMode('sentence-abc', 'abc') && !isAlphabetGameMode('sentence', '1'), 'sentence-abc vs sentence alphabet detection wrong');
assert(isBookInOwnGrade('abc', '01', 'sentence-abc') && isBookInOwnGrade('abc', '02', 'sentence-abc'), 'G1/G2 must own abc in sentence-abc');
assert(isBookInOwnGrade('1', '03') && isBookInOwnGrade('2', '03') && !isBookInOwnGrade('3', '03'), 'G3 must match Books 1-2 only');
assert(isBookInOwnGrade('3', '04') && isBookInOwnGrade('4', '04') && !isBookInOwnGrade('5', '04'), 'G4 must match Books 3-4 only');
assert(isBookInOwnGrade('5', '05') && isBookInOwnGrade('6', '05') && !isBookInOwnGrade('1', '05'), 'G5 must match Books 5-6 only');
assert(isBookInOwnGrade('7', '06') && isBookInOwnGrade('8', '06') && !isBookInOwnGrade('6', '06'), 'G6 must match Books 7-8 only');

// 4. 驗證 HonorSubmissionCard 與 StandardQuiz 靜態契約
const honorSrc = fs.readFileSync(new URL('../src/components/HonorSubmissionCard.jsx', import.meta.url), 'utf8');
assert(honorSrc.includes('effectiveCorrectCount'), 'HonorSubmissionCard must compute effectiveCorrectCount separately');
assert(honorSrc.includes('practiceOnly'), 'HonorSubmissionCard must support practiceOnly mode');
assert(honorSrc.includes('correctCount={effectiveCorrectCount}'), 'CertificateModal must receive capped effectiveCorrectCount');

const quizSrc = fs.readFileSync(new URL('../src/games/quiz/StandardQuiz.jsx', import.meta.url), 'utf8');
assert(quizSrc.includes('HOMOPHONE_GROUPS'), 'StandardQuiz must guard against homophone distractors');
assert(quizSrc.includes('rate: 0.78') || quizSrc.includes('handleReplayAudio(0.78)'), 'StandardQuiz must support 0.78x slow speech');
assert(quizSrc.includes('setBonusActive(true)'), 'StandardQuiz must start 12s bonus timer on audio onEnd');
assert(quizSrc.includes("mode === 'quiz-hard'") && quizSrc.includes('isLegacyRetiredMode'), 'StandardQuiz must treat quiz-hard as retired practice-only mode');
assert(quizSrc.includes('bonusActive && audioReadyForBonus'), 'StandardQuiz must gate speed bonus behind completed audio playback');
assert(quizSrc.includes('useState(0)'), 'StandardQuiz bonusTimeLeftMs must initialize at 0 before audio completion');

// 5. 驗證聽力題庫 (句子辨聽與情境問答) 在多次抽樣下選項文字絕不重複
const normOpt = (txt) => String(txt || '').trim().toLowerCase().replace(/\s+/g, ' ');
for (let trial = 0; trial < 30; trial++) {
  const qaList = getDialogueQAQuestions(20);
  for (const q of qaList) {
    assert(q.options.length === 4, `QA question ${q.id} expected 4 options, got ${q.options.length}`);
    const texts = q.options.map(o => normOpt(o.textEn));
    assert(new Set(texts).size === q.options.length, `Duplicate QA option found: ${q.options.map(o => o.textEn).join(' | ')}`);
  }
  const sentList = getSentenceListeningQuestions(20);
  for (const q of sentList) {
    assert(q.options.length === 4, `Sentence question ${q.id} expected 4 options, got ${q.options.length}`);
    const texts = q.options.map(o => normOpt(o.textEn));
    assert(new Set(texts).size === q.options.length, `Duplicate sentence option found: ${q.options.map(o => o.textEn).join(' | ')}`);
  }
}

// 6. 驗證音訊服務無 speechSynthesis 時回報 completed: false，絕不誤觸發完成
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('speakEnglish fallback callback timeout')), 1000);
  speakEnglish('apple', {
    onEnd: (info) => {
      clearTimeout(timer);
      try {
        assert(info && info.completed === false, `Expected completed: false in unsupported env, got ${JSON.stringify(info)}`);
        resolve();
      } catch (err) {
        reject(err);
      }
    }
  });
});

// 7. 驗證神筆混分隔離、通行證多 key 查榜、教師篩選與句型選課重整契約
const handwritingSrc = fs.readFileSync(new URL('../src/games/handwriting/HandwritingGame.jsx', import.meta.url), 'utf8');
assert(handwritingSrc.includes('resetRoundForMode') && handwritingSrc.includes('hasUsedTracingInRound'), 'HandwritingGame must reset round on mode switch and guard against mixed tracing rounds');

const audioSrc = fs.readFileSync(new URL('../src/services/audio.js', import.meta.url), 'utf8');
assert(audioSrc.includes('completed: isCurrent') && audioSrc.includes('this.speakingToken += 1'), 'VoiceManager must differentiate completed playback vs cancelled/muted');

const profileSrc = fs.readFileSync(new URL('../src/components/StudentProfileModal.jsx', import.meta.url), 'utf8');
assert(!profileSrc.includes('gm.modeKeys?.[0]'), 'StudentProfileModal must query full gm.modeKeys array instead of only modeKeys[0]');
assert(profileSrc.includes('doesLeaderboardEntryMatchStudent'), 'StudentProfileModal must use exact doesLeaderboardEntryMatchStudent matcher');

// 8. 驗證語音逾時後遲到播放可正確恢復計時（Case A）、逾時取消封鎖（Case B）、美語分層選取（Case C）與 dog 截頭防護/語音診斷（Case D）
const hadWindow = Object.prototype.hasOwnProperty.call(globalThis, 'window');
const origWindow = globalThis.window;
const hadUtterance = Object.prototype.hasOwnProperty.call(globalThis, 'SpeechSynthesisUtterance');
const origUtterance = globalThis.SpeechSynthesisUtterance;
try {
  let lastUtterance = null;
  let cancelCount = 0;
  let speakCount = 0;
  let currentVoices = [];
  globalThis.SpeechSynthesisUtterance = class MockUtterance {
    constructor(text) {
      this.text = text;
    }
  };
  globalThis.window = {
    speechSynthesis: {
      speaking: false,
      pending: false,
      getVoices: () => currentVoices,
      speak: (u) => {
        speakCount += 1;
        lastUtterance = u;
      },
      cancel: () => {
        cancelCount += 1;
      }
    }
  };

  // Case A：超過 timeoutMs 后才真正開始並播完
  const eventsA = [];
  speakEnglish('apple', {
    timeoutMs: 25,
    onStart: () => eventsA.push({ type: 'start' }),
    onEnd: (info) => eventsA.push({ type: 'end', info })
  });
  await new Promise(r => setTimeout(r, 60));
  assert(
    eventsA.length === 1 && eventsA[0].info?.reason === 'timeout' && eventsA[0].info?.completed === false,
    `Case A expected initial timeout callback, got ${JSON.stringify(eventsA)}`
  );
  lastUtterance.onstart();
  lastUtterance.onend();
  lastUtterance.onend(); // 重複誤觸須被阻擋
  assert(
    eventsA.length === 3 &&
      eventsA[1].type === 'start' &&
      eventsA[2].type === 'end' &&
      eventsA[2].info?.completed === true &&
      eventsA[2].info?.reason === 'ended',
    `Case A delayed playback failed to recover completion: ${JSON.stringify(eventsA)}`
  );

  // Case B：逾時後已呼叫 stopSpeech() 取消，遲到事件不得觸發 onStart 或 completed: true
  const eventsB = [];
  speakEnglish('banana', {
    timeoutMs: 25,
    onStart: () => eventsB.push({ type: 'start' }),
    onEnd: (info) => eventsB.push({ type: 'end', info })
  });
  await new Promise(r => setTimeout(r, 60));
  stopSpeech();
  lastUtterance.onstart();
  lastUtterance.onend();
  assert(
    eventsB.length === 2 &&
      eventsB[0].info?.reason === 'timeout' &&
      eventsB[1].type === 'end' &&
      eventsB[1].info?.completed === false &&
      eventsB[1].info?.reason === 'cancelled',
    `Case B cancelled playback leaked start/completed: ${JSON.stringify(eventsB)}`
  );
  // Case C：標準清晰美式英語分層選取（Windows Chrome / Windows Edge / iPad Safari）與預設屬性
  currentVoices = [
    { name: 'Microsoft David - English (United States)', lang: 'en-US' },
    { name: 'Google UK English Male', lang: 'en-GB' },
    { name: 'Google US English', lang: 'en-US' }
  ];
  voiceManager.voices = currentVoices;
  assert(
    voiceManager.resolveVoice(PERSONAS.standard_us)?.name === 'Google US English',
    'Chrome US voice resolution should prefer Google US English over Microsoft David / UK English'
  );
  assert(getVoiceDiagnostics('standard_us').quality === 'google_us', 'Expected google_us diagnostics quality');

  currentVoices = [
    { name: 'Microsoft David Desktop', lang: 'en-US' },
    { name: 'Microsoft Libby Online (Natural) - English (United Kingdom)', lang: 'en-GB' },
    { name: 'Microsoft Jenny Online (Natural) - English (United States)', lang: 'en-US' }
  ];
  voiceManager.voices = currentVoices;
  assert(
    voiceManager.resolveVoice(PERSONAS.standard_us)?.name?.includes('Jenny Online (Natural)'),
    'Edge US voice resolution should prefer US Natural voice over en-GB Natural'
  );
  assert(getVoiceDiagnostics('standard_us').quality === 'neural', 'Expected neural diagnostics quality');

  currentVoices = [
    { name: 'Zarvox', lang: 'en-US' },
    { name: 'Daniel', lang: 'en-GB' },
    { name: 'Samantha', lang: 'en-US' }
  ];
  voiceManager.voices = currentVoices;
  assert(
    voiceManager.resolveVoice(PERSONAS.standard_us)?.name === 'Samantha',
    'Apple/iPad US voice resolution should skip novelty Zarvox & en-GB Daniel and pick Samantha'
  );

  // Case D：閒置時不誤叫 cancel()、忙碌切換時延後 60ms 送出防 dog 字首截音、舊版 Zira 改用 1.0x 原速、純中文系統報 missing_en
  currentVoices = [
    { name: 'Microsoft Hanhan - Chinese (Traditional, Taiwan)', lang: 'zh-TW' },
    { name: 'Microsoft Zira Desktop', lang: 'en-US' }
  ];
  voiceManager.voices = currentVoices;
  assert(getVoiceDiagnostics('standard_us').quality === 'legacy_sapi', 'Expected legacy_sapi for Zira Desktop');

  const cancelsBeforeIdleSpeak = cancelCount;
  globalThis.window.speechSynthesis.speaking = false;
  speakEnglish('dog');
  assert(
    cancelCount === cancelsBeforeIdleSpeak && lastUtterance.text === 'dog' && lastUtterance.rate === 1,
    `Idle speak with legacy Zira must not cancel and must use native rate=1, got cancelDelta=${cancelCount - cancelsBeforeIdleSpeak} rate=${lastUtterance.rate}`
  );

  // 模擬忙碌時切歌（須先 cancel 並等 60ms 再送出新字）
  const speaksBeforeBusy = speakCount;
  const cancelsBeforeBusy = cancelCount;
  globalThis.window.speechSynthesis.speaking = true;
  speakEnglish('dog');
  assert(cancelCount === cancelsBeforeBusy + 1, 'Busy speak must cancel active utterances first');
  assert(speakCount === speaksBeforeBusy, 'Busy speak must wait 60ms after cancel before calling speak()');
  await new Promise(r => setTimeout(r, 85));
  assert(speakCount === speaksBeforeBusy + 1 && lastUtterance.text === 'dog', 'Busy speak must dispatch dog after 60ms buffer');

  currentVoices = [{ name: 'Microsoft Hanhan - Chinese (Traditional, Taiwan)', lang: 'zh-TW' }];
  voiceManager.voices = currentVoices;
  assert(getVoiceDiagnostics('standard_us').quality === 'missing_en', 'System with only zh-TW voices must report missing_en');

  currentVoices = [{ name: 'Google US English', lang: 'en-US' }];
  voiceManager.voices = currentVoices;
  globalThis.window.speechSynthesis.speaking = false;
  speakEnglish('hello world');
  assert(
    lastUtterance.lang === 'en-US' && lastUtterance.pitch === 1 && lastUtterance.rate === 0.92,
    `Default speakEnglish must use standard_us pitch=1 rate=0.92 en-US, got lang=${lastUtterance.lang} pitch=${lastUtterance.pitch} rate=${lastUtterance.rate}`
  );
  stopSpeech();
  currentVoices = [];
  voiceManager.voices = [];
} finally {
  if (hadWindow) globalThis.window = origWindow;
  else delete globalThis.window;
  if (hadUtterance) globalThis.SpeechSynthesisUtterance = origUtterance;
  else delete globalThis.SpeechSynthesisUtterance;
}

// 9. 驗證通行證排行榜精確身分比對（防止「小明」誤認「小明同學」或同暱稱不同座號／訪客誤匹配）
const formalStudent = {
  student_id: '030101',
  grade: '03',
  classNum: '01',
  seat: '01',
  nickname: '小明'
};
assert(parseLeaderboardIdentity('3年甲 1號 (小明)')?.seat === '01', 'parseLeaderboardIdentity must parse 3年甲 1號');
assert(doesLeaderboardEntryMatchStudent({ name: '3年甲 1號 (小明)', book: '1' }, formalStudent), 'Exact formal zh entry must match');
assert(doesLeaderboardEntryMatchStudent({ name: '3年甲班 01號 (舊暱稱)', book: '1' }, formalStudent), 'Same grade/class/seat with old nickname must match');
assert(doesLeaderboardEntryMatchStudent({ name: 'Grade 3 Class A #1 (小明)', book: '1' }, formalStudent), 'Exact formal en entry must match');
assert(doesLeaderboardEntryMatchStudent({ name: '舊格式', book: '030101' }, formalStudent), '6-digit book student_id must match');
assert(doesLeaderboardEntryMatchStudent({ name: '小明', book: '1' }, formalStudent), 'Exact plain legacy nickname must match');

assert(!doesLeaderboardEntryMatchStudent({ name: '4年乙 5號 (小明同學)', book: '1' }, formalStudent), 'Must NOT match substring nickname 小明同學');
assert(!doesLeaderboardEntryMatchStudent({ name: '3年甲 10號 (小明)', book: '1' }, formalStudent), 'Must NOT match same nickname with different seat 10');
assert(!doesLeaderboardEntryMatchStudent({ name: '小明', book: '030110' }, formalStudent), 'Must NOT match different 6-digit book student_id');
assert(!doesLeaderboardEntryMatchStudent({ name: '小明同學', book: '1' }, formalStudent), 'Must NOT match plain substring nickname 小明同學');
assert(!doesLeaderboardEntryMatchStudent({ name: '[訪客] 小明', book: '1' }, formalStudent), 'Formal student must NOT match guest with same nickname');

const guestStudent = {
  student_id: '999999',
  grade: '99',
  nickname: '小明'
};
assert(doesLeaderboardEntryMatchStudent({ name: '[訪客] 小明', book: '1' }, guestStudent), 'Guest must match exact guest nickname');
assert(!doesLeaderboardEntryMatchStudent({ name: '[訪客] 小明同學', book: '1' }, guestStudent), 'Guest must NOT match substring nickname');
assert(!doesLeaderboardEntryMatchStudent({ name: '[訪客] 飛鼠隊長', book: '1' }, guestStudent), 'Guest must NOT match other guest');
assert(!doesLeaderboardEntryMatchStudent({ name: '3年甲 1號 (小明)', book: '1' }, guestStudent), 'Guest must NOT match formal student');

const teacherSrc = fs.readFileSync(new URL('../src/components/TeacherHub.jsx', import.meta.url), 'utf8');
for (const expectedMode of ['quiz-choice', 'quiz-hard', 'quiz-listening', 'handwriting', 'sentence', 'sentence-abc']) {
  assert(teacherSrc.includes(`'${expectedMode}'`), `TeacherHub filter missing mode ${expectedMode}`);
}

const leaderboardSrc = fs.readFileSync(new URL('../src/components/LeaderboardView.jsx', import.meta.url), 'utf8');
assert(
  leaderboardSrc.includes("id: 'sentence'") &&
    leaderboardSrc.includes("'sentence-abc'") &&
    leaderboardSrc.includes("'sentence', 'listening', 'spelling'"),
  'LeaderboardView must register sentence + sentence-abc in GAME_KING_CATEGORIES and arcadeTrackIds'
);

const appSrc = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
assert(
  appSrc.includes('isWholeBookOrReviewToken'),
  'App.jsx qualifyingBook must recognize -all and -review unit tokens'
);

const lobbySrc = fs.readFileSync(new URL('../src/components/Lobby.jsx', import.meta.url), 'utf8');
assert(
  lobbySrc.includes("onNavigate('sentence'") &&
    lobbySrc.includes('alphaGrade') &&
    lobbySrc.includes('Lv.3 情境挑戰') &&
    lobbySrc.includes('含 U4 解鎖之') &&
    lobbySrc.includes('題跨單元綜合句'),
  'Lobby must pass sentence units/level/alpha params, expose Lv.3 and disclose U4 cross-unit rule'
);

const sentenceGameSrc = fs.readFileSync(new URL('../src/games/sentence/SentenceBuilderGame.jsx', import.meta.url), 'utf8');
assert(sentenceGameSrc.includes("urlParams.get('units')") && sentenceGameSrc.includes('syncSentenceUrl'), 'SentenceBuilderGame must restore and sync units query param across reloads');
assert(
  sentenceGameSrc.includes("persona: 'standard_us'") &&
    sentenceGameSrc.includes('matchSentenceTokens') &&
    sentenceGameSrc.includes('allowVariants') &&
    sentenceGameSrc.includes('scheduleAdvance(expectedGen') &&
    sentenceGameSrc.includes("window.addEventListener('popstate'") &&
    sentenceGameSrc.includes('setOverrideUnits(null)') &&
    sentenceGameSrc.includes('finishedSettledRef') &&
    sentenceGameSrc.includes('qIndexRef') &&
    sentenceGameSrc.includes('readSavedSentenceLevel') &&
    sentenceGameSrc.includes('data-partial-unsupported-notice') &&
    sentenceGameSrc.includes('data-partial-unsupported-units-notice') &&
    sentenceGameSrc.includes('data-partial-skipped-abc-notice') &&
    sentenceGameSrc.includes('data-listen-qa-badge') &&
    sentenceGameSrc.includes('isQualifyingSentenceBook') &&
    sentenceGameSrc.includes('practiceOnly={false}') &&
    !sentenceGameSrc.includes('practiceOnly={true}') &&
    !sentenceGameSrc.includes('setQIndex((prevIdx) => {'),
  'SentenceBuilderGame must enable formal HonorSubmissionCard for qualifying single-book/abc rounds, block single-unit/mixed cheating, sync popstate cleanly, and isolate settlement side effects'
);

const quizUsSrc = fs.readFileSync(new URL('../src/games/quiz/StandardQuiz.jsx', import.meta.url), 'utf8');
const spellingUsSrc = fs.readFileSync(new URL('../src/games/spelling/SpellingGame.jsx', import.meta.url), 'utf8');
assert(quizUsSrc.includes("persona: 'standard_us'") && spellingUsSrc.includes("persona: 'standard_us'"), 'StandardQuiz and SpellingGame must force clear standard_us persona');
assert(
  spellingUsSrc.includes('generateSpellingAlphabetRound') && spellingUsSrc.includes("isAlphabetMode ? '' : 'uppercase'"),
  'SpellingGame must use generateSpellingAlphabetRound and honor lowercase rendering in alphabet mode'
);
assert(
  quizUsSrc.includes('getVoiceDiagnostics') &&
    quizUsSrc.includes('已加入錯題，待會會再考一次') &&
    quizUsSrc.includes('_retryKey') &&
    quizUsSrc.includes('moveNextTimerRef'),
  'StandardQuiz must render option feedback banner, retry clone _retryKey, voice diagnostics & clean timers'
);

console.log('✓ Books 1-8 (Lv.1/Lv.2/cross-unit + Lv.3 = 524 total items) tokens, apostrophes, distractors & verified wordless Pre-A1 images passed');
console.log('✓ Low-grade consecutive G1 (3-letter) & G2 (5-letter) alphabet sequence & strict mixed-case alternation passed');
console.log('✓ Symmetric sentence variant matching & strict Lv.3 listening order enforcement passed');
console.log('✓ alphabetEngine (StandardQuiz listening & SpellingGame consecutive blanks) alphaMode alignment passed');
console.log('✓ Per-book U4 cross-unit gating, multi-book mix, Book 9 upcoming guard & mixed supported+unsupported disclosure verified');
console.log('✓ Grimoire legacy star preservation & honest sentence stars verified');
console.log('✓ HonorSubmissionCard, StandardQuiz, Audio & QA distractor deduplication verified');
console.log('✓ Standard US natural voice selection, anti-clipping busy buffer, Zira rate=1, voice diagnostics & timeout recovery verified');
console.log('✓ Handwriting mixed-mode guard, Profile exact identity & modeKeys, TeacherHub filter & Sentence URL scope verified');
