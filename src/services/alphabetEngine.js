// ═══════════════════════════════════════════════════════════════════════════
// 霧臺英語宇宙：26 字母全遊戲通用題庫與隨機生成引擎 (Alphabet Engine)
// 專為國小一、二年級打造：字母認讀、大小寫配對、序列填空、積木散落找碴、字母貪食蛇
// ═══════════════════════════════════════════════════════════════════════════

export const UPPERCASE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const LOWERCASE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

// 常見低年級易混淆字母對 (Confusable Pairs) - 用於生成高水準干擾項
export const CONFUSABLE_PAIRS = [
  { u: 'B', l: 'd', desc: 'B vs d' },
  { u: 'D', l: 'b', desc: 'D vs b' },
  { u: 'P', l: 'q', desc: 'P vs q' },
  { u: 'Q', l: 'p', desc: 'Q vs p' },
  { u: 'M', l: 'w', desc: 'M vs w' },
  { u: 'W', l: 'm', desc: 'W vs m' },
  { u: 'N', l: 'u', desc: 'N vs u' },
  { u: 'U', l: 'n', desc: 'U vs n' },
  { u: 'C', l: 'o', desc: 'C vs o' },
  { u: 'E', l: 'f', desc: 'E vs f' },
  { u: 'I', l: 'l', desc: 'I vs l' },
  { u: 'G', l: 'q', desc: 'G vs q' }
];

export const SHUFFLE = (arr) => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// ── 1. 貪食蛇：A 到 Z 無縫循環字母珍珠序列 ──
export const getSnakeNextLetter = (currentIndex = 0, isLower = false) => {
  const char = isLower ? LOWERCASE_ALPHABET[currentIndex % 26] : UPPERCASE_ALPHABET[currentIndex % 26];
  const nextIndex = (currentIndex + 1) % 26;
  const isLoopComplete = nextIndex === 0;
  return {
    char,
    currentIndex,
    nextIndex,
    isLoopComplete,
    displayEn: char,
    displayZh: `第 ${currentIndex + 1} 個字母 (${char})`
  };
};

// ── 2. 翻牌記憶對決：大小寫配對牌卡生成器 (A ↔ a, B ↔ b) ──
export const generateMemoryAlphabetDeck = (pairCount = 8) => {
  const selectedRoots = SHUFFLE(UPPERCASE_ALPHABET).slice(0, Math.min(pairCount, 12));
  const cards = [];

  selectedRoots.forEach((upper, idx) => {
    const lower = upper.toLowerCase();
    // 大寫卡
    cards.push({
      id: `card_upper_${upper}_${idx}`,
      pairId: `pair_${upper}`,
      display: upper,
      subDisplay: `大寫字母`,
      type: 'letter_upper',
      char: upper,
      isSpecial: false
    });
    // 小寫卡
    cards.push({
      id: `card_lower_${lower}_${idx}`,
      pairId: `pair_${upper}`,
      display: lower,
      subDisplay: `小寫字母`,
      type: 'letter_lower',
      char: lower,
      isSpecial: false
    });
  });

  return SHUFFLE(cards);
};

// ── 3. 看中選英 / 看英選中 / 聽力測驗：字母選擇題生成器 ──
export const generateQuizAlphabetQuestions = (quizType = 'upper_to_lower', count = 20, alphaMode = 'mixed') => {
  // quizType: 'upper_to_lower' (看大選小) | 'lower_to_upper' (看小選大) | 'listening' (聽音選字母)
  const normalizedAlphaMode = ['upper', 'lower', 'mixed'].includes(alphaMode) ? alphaMode : 'mixed';
  const safeCount = Math.max(1, Number(count) || 20);

  let listeningLowerFlags = null;
  if (quizType === 'listening') {
    if (normalizedAlphaMode === 'upper') {
      listeningLowerFlags = Array(safeCount).fill(false);
    } else if (normalizedAlphaMode === 'lower') {
      listeningLowerFlags = Array(safeCount).fill(true);
    } else {
      const startLower = Math.random() < 0.5;
      listeningLowerFlags = Array.from({ length: safeCount }, (_, i) => (
        i % 2 === 0 ? startLower : !startLower
      ));
    }
  }

  const roots = [];
  while (roots.length < safeCount) {
    roots.push(...SHUFFLE(UPPERCASE_ALPHABET));
  }
  const selectedRoots = roots.slice(0, safeCount);

  return selectedRoots.map((root, index) => {
    const upper = root;
    const lower = root.toLowerCase();

    let promptText = '';
    let targetDisplay = '';
    const audioText = upper;
    let correctAnswer = '';
    let isTargetLower = false;

    if (quizType === 'upper_to_lower') {
      promptText = '請選出對應的小寫字母：';
      targetDisplay = upper;
      correctAnswer = lower;
      isTargetLower = true;
    } else if (quizType === 'lower_to_upper') {
      promptText = '請選出對應的大寫字母：';
      targetDisplay = lower;
      correctAnswer = upper;
      isTargetLower = false;
    } else {
      // listening：依 alphaMode 嚴格區分全大寫 / 全小寫 / 逐題純粹交替（單題絕不混寫）
      promptText = '請聆聽字母發音，選出正確的字母：';
      targetDisplay = '🎧';
      isTargetLower = Boolean(listeningLowerFlags?.[index]);
      correctAnswer = isTargetLower ? lower : upper;
    }

    // 生成干擾項：優先挑選外型相近之混淆字母（嚴禁與正解撞字且保持同題大小寫一致）
    const distractors = [];
    const confusable = CONFUSABLE_PAIRS.find(p => p.u === upper);
    const confCand = confusable
      ? (isTargetLower ? confusable.l : confusable.l.toUpperCase())
      : null;
    if (confCand && confCand !== correctAnswer && !distractors.includes(confCand)) {
      distractors.push(confCand);
    }

    const excludeUpper = confCand ? confCand.toUpperCase() : null;
    const otherRoots = UPPERCASE_ALPHABET.filter(r => r !== upper && r !== excludeUpper);
    const shuffledOthers = SHUFFLE(otherRoots);

    while (distractors.length < 3 && shuffledOthers.length > 0) {
      const cand = shuffledOthers.pop();
      const distChar = isTargetLower ? cand.toLowerCase() : cand;
      if (!distractors.includes(distChar) && distChar !== correctAnswer) {
        distractors.push(distChar);
      }
    }

    const rawOptions = [
      { text: correctAnswer, textEn: correctAnswer, isCorrect: true },
      ...distractors.map(d => ({ text: d, textEn: d, isCorrect: false }))
    ];

    const shuffledOptions = SHUFFLE(rawOptions).map((opt, optIdx) => ({
      ...opt,
      key: String.fromCharCode(65 + optIdx) // A, B, C, D
    }));

    return {
      id: `q_alpha_${quizType}_${normalizedAlphaMode}_${index}`,
      type: quizType,
      isLower: isTargetLower,
      prompt: promptText,
      target: targetDisplay,
      audioText,
      en: quizType === 'upper_to_lower' ? upper : (quizType === 'lower_to_upper' ? lower : correctAnswer),
      zh: `字母 ${upper} / ${lower}`,
      correctAnswer,
      options: shuffledOptions
    };
  });
};

// ── 4. 單字積木拼裝：字母序列連續拼裝題型生成器 ──
// 規則：一年級 4 個連續字母挖 1 格；二年級 5 個連續字母挖 1~2 格；候選積木嚴格保持同題一致大小寫
export const generateSpellingAlphabetQuestion = (index = 0, options = {}) => {
  const {
    alphaMode = 'mixed',
    alphaGrade = 2,
    startIndex = null,
    forceUpper = null
  } = options || {};

  const gradeNum = Number(alphaGrade) === 1 ? 1 : 2;
  const normalizedMode = ['upper', 'lower', 'mixed'].includes(alphaMode) ? alphaMode : 'mixed';
  const isUpper = typeof forceUpper === 'boolean'
    ? forceUpper
    : normalizedMode === 'upper'
    ? true
    : normalizedMode === 'lower'
    ? false
    : index % 2 === 0;

  const alphabet = isUpper ? UPPERCASE_ALPHABET : LOWERCASE_ALPHABET;
  const seqLength = gradeNum === 1 ? 4 : 5;
  const maxStart = 26 - seqLength;
  const startIdx = Number.isInteger(startIndex)
    ? Math.max(0, Math.min(maxStart, startIndex))
    : Math.floor(Math.random() * (maxStart + 1));
  const sequenceChars = alphabet.slice(startIdx, startIdx + seqLength);

  // 一年級固定挖 1 格；二年級交錯挖 1 或 2 格
  const blankCount = gradeNum === 1 ? 1 : (index % 2 === 0 ? 1 : 2);
  const possibleIndices = Array.from({ length: seqLength }, (_, i) => i);
  const blankIndices = SHUFFLE(possibleIndices).slice(0, blankCount).sort((a, b) => a - b);

  const correctAnswers = blankIndices.map(bIdx => sequenceChars[bIdx]);

  // 生成干擾積木（嚴格保持與題幹相同的大小寫！）
  const otherAlphabet = alphabet.filter(c => !sequenceChars.includes(c));
  const distractorCount = Math.max(2, 4 - blankCount); // 候選區維持 4 塊積木
  const distractors = SHUFFLE(otherAlphabet).slice(0, distractorCount);

  const candidateTiles = SHUFFLE([
    ...correctAnswers.map((char, i) => ({ id: `tile_ans_${index}_${i}_${char}`, char, isAnswer: true })),
    ...distractors.map((char, i) => ({ id: `tile_dist_${index}_${i}_${char}`, char, isAnswer: false }))
  ]);

  // 構成槽位定義
  const slots = sequenceChars.map((char, idx) => {
    const isBlank = blankIndices.includes(idx);
    return {
      slotIndex: idx,
      expectedChar: char,
      initialChar: isBlank ? null : char,
      isGiven: !isBlank
    };
  });

  return {
    id: `spell_alpha_g${gradeNum}_${isUpper ? 'u' : 'l'}_${startIdx}_${index}`,
    isAlphabetQuestion: true,
    alphaGrade: gradeNum,
    alphaMode: normalizedMode,
    isUpper,
    seqLength,
    blankCount,
    sequenceChars,
    slots,
    candidateTiles,
    targetWord: sequenceChars.join(''),
    audioText: sequenceChars.join(', '),
    meaningZh: isUpper ? '大寫字母連續填空' : '小寫字母連續填空',
    promptZh: '請依英文字母表的順序，點選或拖曳積木補齊空格：'
  };
};

export const generateSpellingAlphabetRound = ({
  count = 10,
  alphaMode = 'upper',
  alphaGrade = 1
} = {}) => {
  const gradeNum = Number(alphaGrade) === 2 ? 2 : 1;
  const normalizedMode = ['upper', 'lower', 'mixed'].includes(alphaMode)
    ? alphaMode
    : (gradeNum === 2 ? 'lower' : 'upper');
  const seqLength = gradeNum === 1 ? 4 : 5;
  const maxWindows = 26 - seqLength + 1;
  const targetCount = Math.min(Math.max(1, Number(count) || 10), maxWindows);

  const startPool = SHUFFLE(Array.from({ length: maxWindows }, (_, i) => i)).slice(0, targetCount);

  let upperFlags;
  if (normalizedMode === 'upper') {
    upperFlags = Array(targetCount).fill(true);
  } else if (normalizedMode === 'lower') {
    upperFlags = Array(targetCount).fill(false);
  } else {
    const startUpper = Math.random() < 0.5;
    upperFlags = Array.from({ length: targetCount }, (_, i) => (
      i % 2 === 0 ? startUpper : !startUpper
    ));
  }

  return startPool.map((startIndex, idx) => (
    generateSpellingAlphabetQuestion(idx, {
      alphaMode: normalizedMode,
      alphaGrade: gradeNum,
      startIndex,
      forceUpper: upperFlags[idx]
    })
  ));
};

// ── 5. 神祕密室逃脫：四大字母古代神石鎖題型生成器 ──
export const generateEscapeAlphabetPuzzles = (grade = '01') => {
  const isGrade2 = grade === '02';

  // 題型 1：順序缺字鎖 (如 H I [ ? ] K)
  const isUpper1 = !isGrade2 || Math.random() < 0.5;
  const alpha1 = isUpper1 ? UPPERCASE_ALPHABET : LOWERCASE_ALPHABET;
  const start1 = Math.floor(Math.random() * 22);
  const seq1 = alpha1.slice(start1, start1 + 4);
  const blankIdx1 = 1 + Math.floor(Math.random() * 2); // 挖第 2 或第 3 個
  const targetChar1 = seq1[blankIdx1];
  const puzzle1Prompt = seq1.map((c, i) => i === blankIdx1 ? '【 ? 】' : c).join('  ➔  ');
  const otherRoots1 = alpha1.filter(c => c !== targetChar1);
  const opts1 = SHUFFLE([
    { text: targetChar1, isCorrect: true },
    ...SHUFFLE(otherRoots1).slice(0, 3).map(c => ({ text: c, isCorrect: false }))
  ]);

  // 題型 2：聽神秘神獸音選字母
  const targetChar2 = UPPERCASE_ALPHABET[Math.floor(Math.random() * 26)];
  const displayChar2 = isGrade2 && Math.random() < 0.5 ? targetChar2.toLowerCase() : targetChar2;
  const opts2 = SHUFFLE([
    { text: displayChar2, isCorrect: true },
    ...SHUFFLE(UPPERCASE_ALPHABET.filter(c => c !== targetChar2)).slice(0, 3).map(c => ({
      text: isGrade2 && Math.random() < 0.5 ? c.toLowerCase() : c,
      isCorrect: false
    }))
  ]);

  // 題型 3：三串中找出順序正確的那一串
  const alpha3 = !isGrade2 || Math.random() < 0.5 ? UPPERCASE_ALPHABET : LOWERCASE_ALPHABET;
  const start3 = Math.floor(Math.random() * 22);
  const correctSeq3 = alpha3.slice(start3, start3 + 4).join(' - ');
  // 錯誤項 A：順序顛倒 (如 A C B D)
  const wrongSeq3A = [alpha3[start3], alpha3[start3 + 2], alpha3[start3 + 1], alpha3[start3 + 3]].join(' - ');
  // 錯誤項 B：跳字錯誤 (如 A B D E)
  const wrongSeq3B = [alpha3[start3], alpha3[start3 + 1], alpha3[start3 + 3], alpha3[start3 + 4] || 'Z'].join(' - ');
  const opts3 = SHUFFLE([
    { text: correctSeq3, isCorrect: true },
    { text: wrongSeq3A, isCorrect: false },
    { text: wrongSeq3B, isCorrect: false }
  ]);

  // 題型 4：左右兩堆找落單者 (左堆 5 個，右堆 6 個，找出多出來的唯一字母)
  const alpha4 = !isGrade2 || Math.random() < 0.5 ? UPPERCASE_ALPHABET : LOWERCASE_ALPHABET;
  const pickedLetters = SHUFFLE(alpha4).slice(0, 6);
  const commonLetters = pickedLetters.slice(0, 5);
  const oddLetter = pickedLetters[5]; // 第 6 個落單者
  const leftPile = SHUFFLE(commonLetters);
  const rightPile = SHUFFLE([...commonLetters, oddLetter]);
  const opts4 = SHUFFLE([
    { text: oddLetter, isCorrect: true },
    ...SHUFFLE(commonLetters).slice(0, 3).map(c => ({ text: c, isCorrect: false }))
  ]);

  return [
    {
      chamberNum: 1,
      title: '第一關：星石序列缺字鎖',
      desc: '觀察石板上的字母順序，解開問號處的封印字母：',
      displayPrompt: puzzle1Prompt,
      options: opts1,
      audioText: null
    },
    {
      chamberNum: 2,
      title: '第二關：大武神獸天籟之音',
      desc: '聆聽神獸的呼喚，選出呼應的神聖字母：',
      displayPrompt: '🔊 點擊按鈕聆聽字母發音',
      audioText: targetChar2,
      options: opts2
    },
    {
      chamberNum: 3,
      title: '第三關：古老字母軌道辨析',
      desc: '三組石板符文中，只有一組遵守正確的字母順序，請將它找出：',
      displayPrompt: '請找出順序完全正確的符文軌道：',
      options: opts3,
      audioText: null
    },
    {
      chamberNum: 4,
      title: '第四關：雙子石盤找孤星',
      desc: '右盤比左盤多了一個落單的字母，請眼明手快找出它：',
      leftPile,
      rightPile,
      displayPrompt: `左盤（${leftPile.join('  ')}） vs 右盤（${rightPile.join('  ')}）`,
      options: opts4,
      audioText: null
    }
  ];
};

// ── 6. 鷹眼神探：左右托盤散落彩色字母積木找碴生成器 ──
const VIBRANT_COLORS = [
  '#ef4444', // 鮮紅
  '#3b82f6', // 湛藍
  '#10b981', // 翠綠
  '#f59e0b', // 琥珀黃
  '#8b5cf6', // 紫羅蘭
  '#ec4899', // 桃粉
  '#06b6d4', // 青綠
  '#f97316'  // 暖橘
];

// 刻意使用高對比配色，不從相近色隨機抽取，避免紅/橘、藍/青等差異過小。
const CONTRASTING_SPOTTER_COLORS = {
  '#ef4444': ['#06b6d4', '#3b82f6'],
  '#3b82f6': ['#f59e0b', '#f97316'],
  '#10b981': ['#8b5cf6', '#ec4899'],
  '#f59e0b': ['#3b82f6', '#8b5cf6'],
  '#8b5cf6': ['#f59e0b', '#10b981'],
  '#ec4899': ['#10b981', '#06b6d4'],
  '#06b6d4': ['#ef4444', '#8b5cf6'],
  '#f97316': ['#3b82f6', '#06b6d4']
};

export const getSpotterColorDistance = (leftHex, rightHex) => {
  const toRgb = (hex) => {
    const value = String(hex || '').replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(value)) return null;
    return [0, 2, 4].map(offset => Number.parseInt(value.slice(offset, offset + 2), 16));
  };
  const left = toRgb(leftHex);
  const right = toRgb(rightHex);
  if (!left || !right) return 0;
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]);
};

const BLOCK_FONTS = [
  'system-ui, sans-serif',
  'Arial, Helvetica, sans-serif',
  'Trebuchet MS, sans-serif',
  'Verdana, Geneva, sans-serif',
  'Tahoma, Geneva, sans-serif',
  'Segoe UI, Arial, sans-serif'
];

export const normalizeSpotterAlphabetGrade = (grade = '01') => {
  const numericGrade = String(grade ?? '').trim().replace(/^0+/, '');
  return numericGrade === '2' ? '02' : '01';
};

export const normalizeSpotterAlphabetCaseMode = (caseMode, grade = '01') => {
  if (['upper', 'lower', 'mixed'].includes(caseMode)) return caseMode;
  return normalizeSpotterAlphabetGrade(grade) === '02' ? 'lower' : 'upper';
};

/**
 * 依觸控座標找出命中的隱形圓框。
 *
 * 左右托盤共用相同的圓心與半徑，圓框彼此不重疊；字母的字形、
 * 顏色與旋轉都只在圓內呈現，不參與命中計算。
 */
export const resolveSpotterAlphabetHit = ({
  blocks = [],
  x,
  y,
  width,
  height,
  maxDistancePx = 52
}) => {
  if (!Array.isArray(blocks) || blocks.length === 0 ||
      !Number.isFinite(x) || !Number.isFinite(y) ||
      !Number.isFinite(width) || !Number.isFinite(height) ||
      width <= 0 || height <= 0) {
    return null;
  }

  let closest = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const block of blocks) {
    const blockX = (Number(block.x) / 100) * width;
    const blockY = (Number(block.y) / 100) * height;
    const distance = Math.hypot(x - blockX, y - blockY);
    const blockRadius = Number.isFinite(Number(block.hitRadiusPct))
      ? (Number(block.hitRadiusPct) / 100) * width
      : maxDistancePx;
    if (distance <= blockRadius && distance < closestDistance) {
      closest = block;
      closestDistance = distance;
    }
  }

  return closest;
};

const SPOTTER_TRAY_WIDTH = 400;
const SPOTTER_TRAY_HEIGHT = 300;

const createNonOverlappingSpotterCircles = (count) => {
  const circles = [];
  const gap = 14;

  for (let index = 0; index < count; index++) {
    let placed = null;
    for (let attempt = 0; attempt < 300; attempt++) {
      const radius = 29 + Math.random() * 9;
      const candidate = {
        radius,
        x: radius + 12 + Math.random() * (SPOTTER_TRAY_WIDTH - (radius + 12) * 2),
        y: radius + 30 + Math.random() * (SPOTTER_TRAY_HEIGHT - radius * 2 - 42)
      };
      const overlaps = circles.some(circle => (
        Math.hypot(candidate.x - circle.x, candidate.y - circle.y) <
        candidate.radius + circle.radius + gap
      ));
      if (!overlaps) {
        placed = candidate;
        break;
      }
    }

    // 理論上 6 個圓在 400×300 足以隨機放入；若極端亂數連續碰撞，
    // 整組改用安全槽位保底，避免單一 fallback 圓碰到先前隨機圓。
    if (!placed) {
      const fallbackCenters = [
        [62, 72], [200, 72], [338, 72],
        [62, 150], [200, 150], [338, 150],
        [62, 228], [200, 228], [338, 228]
      ];
      return fallbackCenters.slice(0, count).map(([x, y]) => ({
        x: (x / SPOTTER_TRAY_WIDTH) * 100,
        y: (y / SPOTTER_TRAY_HEIGHT) * 100,
        hitRadiusPct: (27 / SPOTTER_TRAY_WIDTH) * 100
      }));
    }
    circles.push(placed);
  }

  return circles.map(circle => ({
    x: (circle.x / SPOTTER_TRAY_WIDTH) * 100,
    y: (circle.y / SPOTTER_TRAY_HEIGHT) * 100,
    hitRadiusPct: (circle.radius / SPOTTER_TRAY_WIDTH) * 100
  }));
};

export const generateSpotterAlphabetRound = (itemCount = 6, diffCount = 3, grade = '01', caseMode) => {
  const normalizedGrade = normalizeSpotterAlphabetGrade(grade);
  const normalizedCaseMode = normalizeSpotterAlphabetCaseMode(caseMode, normalizedGrade);
  const roots = SHUFFLE(UPPERCASE_ALPHABET).slice(0, itemCount);
  // 三種內容膠囊共用同一套引擎：upper 全大寫、lower 全小寫、mixed
  // 每局強制同時含大/小寫。未傳模式時，一年級預設 upper、二年級 lower。
  const lowercaseIndices = new Set();
  if (normalizedCaseMode === 'lower') {
    roots.forEach((_, index) => lowercaseIndices.add(index));
  } else if (normalizedCaseMode === 'mixed' && roots.length > 1) {
    const lowercaseCount = Math.max(1, Math.min(roots.length - 1, Math.round(roots.length * 0.4)));
    SHUFFLE(Array.from({ length: roots.length }, (_, index) => index))
      .slice(0, lowercaseCount)
      .forEach(index => lowercaseIndices.add(index));
  }

  // 隨機散落的隱形圓形判定區：左右兩盤共用同一組圓心與半徑，且圓框
  // 彼此保留安全間距。字母可以自由旋轉，但判定範圍永遠不會相互覆蓋。
  const chosenSlots = createNonOverlappingSpotterCircles(itemCount);

  // 挑選哪些字母要被設為「差異點」；支援 3 或 5 個目標，也防止
  // 呼叫端要求的差異數超過實際字母數。
  const safeDiffCount = Math.min(Math.max(0, Number(diffCount) || 0), roots.length);
  const diffIndices = SHUFFLE(Array.from({ length: roots.length }, (_, i) => i)).slice(0, safeDiffCount);

  const leftBlocks = [];
  const rightBlocks = [];
  const differences = [];

  roots.forEach((rootChar, idx) => {
    const isUpper = !lowercaseIndices.has(idx);
    const char = isUpper ? rootChar : rootChar.toLowerCase();
    const pos = chosenSlots[idx];
    const font = BLOCK_FONTS[Math.floor(Math.random() * BLOCK_FONTS.length)];
    const color = VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
    // SVG viewBox 內的相對字級；會跟著大/小圓框同比縮放，永不超框。
    const fontScale = 52 + Math.floor(Math.random() * 9); // 52 ~ 60 / 100
    // 字母可在互不重疊的圓框中自由傾斜，旋轉不再改變判定區。
    const rotation = Math.round(Math.random() * 48 - 24);

    const isDifferent = diffIndices.includes(idx);

    const baseBlock = {
      id: `block_${idx}`,
      char,
      rootChar,
      x: pos.x,
      y: pos.y,
      hitRadiusPct: pos.hitRadiusPct,
      font,
      color,
      fontScale,
      rotation,
      isDifference: isDifferent
    };

    if (!isDifferent) {
      // 兩邊完全一致
      leftBlocks.push({ ...baseBlock, side: 'left' });
      rightBlocks.push({ ...baseBlock, side: 'right' });
    } else {
      // 僅使用左右都清楚可見的差異，不再使用「缺字」空白熱區。
      const diffTypes = ['color', 'char', 'size'];
      const rotationSafeRoots = 'ABCDEFGJKLMPRTUVWY';
      const caseSafeRoots = 'ABDEFGHIJKLMNPQRTUY';
      if (rotationSafeRoots.includes(rootChar)) diffTypes.push('rotation');
      if (normalizedCaseMode === 'mixed' && caseSafeRoots.includes(rootChar)) diffTypes.push('case');
      const primaryDiff = diffTypes[Math.floor(Math.random() * diffTypes.length)];
      const chosenDiffs = [primaryDiff];
      // 約 28% 目標疊加第二種明顯差異；避免 char + case 同時改寫同一屬性。
      if (Math.random() < 0.28) {
        let compoundCandidates = diffTypes.filter(type => type !== primaryDiff);
        if (primaryDiff === 'char') compoundCandidates = compoundCandidates.filter(type => type !== 'case');
        if (primaryDiff === 'case') compoundCandidates = compoundCandidates.filter(type => type !== 'char');
        if (primaryDiff === 'rotation' || primaryDiff === 'case') {
          compoundCandidates = compoundCandidates.filter(type => type === 'color' || type === 'char' || type === 'size');
        }
        if (compoundCandidates.length > 0) {
          chosenDiffs.push(compoundCandidates[Math.floor(Math.random() * compoundCandidates.length)]);
        }
      }

      let rightChar = char;
      let rightColor = color;
      let rightRotation = rotation;
      let rightFontScale = fontScale;
      const reasonParts = [];

      for (const chosenDiff of chosenDiffs) {
        if (chosenDiff === 'color') {
          const otherColors = CONTRASTING_SPOTTER_COLORS[color] || VIBRANT_COLORS.filter(c => c !== color);
          rightColor = otherColors[Math.floor(Math.random() * otherColors.length)];
          reasonParts.push('顏色不同');
        } else if (chosenDiff === 'char') {
          const otherChars = (isUpper ? UPPERCASE_ALPHABET : LOWERCASE_ALPHABET).filter(c => c !== char);
          rightChar = otherChars[Math.floor(Math.random() * otherChars.length)];
          reasonParts.push(`字母不同（左為 ${char}，右為 ${rightChar}）`);
        } else if (chosenDiff === 'rotation') {
          const rotationDelta = 55 + Math.round(Math.random() * 20);
          rightRotation = rotation >= 0 ? rotation - rotationDelta : rotation + rotationDelta;
          reasonParts.push('旋轉方向不同');
        } else if (chosenDiff === 'size') {
          rightFontScale = 28 + Math.floor(Math.random() * 7); // 28 ~ 34，與 52 ~ 60 明顯分離
          reasonParts.push('字體大小不同');
        } else if (chosenDiff === 'case') {
          rightChar = isUpper ? char.toLowerCase() : char.toUpperCase();
          reasonParts.push(`大小寫不同（左為 ${char}，右為 ${rightChar}）`);
        }
      }
      const reasonText = reasonParts.join('＋');

      const diffId = `diff_${idx}`;
      differences.push({
        id: diffId,
        blockIndex: idx,
        reason: reasonText,
        types: [...chosenDiffs],
        x: pos.x,
        y: pos.y,
        hitRadiusPct: pos.hitRadiusPct,
        isFound: false
      });

      leftBlocks.push({
        ...baseBlock,
        side: 'left',
        diffId
      });

      rightBlocks.push({
        ...baseBlock,
        side: 'right',
        char: rightChar,
        color: rightColor,
        rotation: rightRotation,
        fontScale: rightFontScale,
        diffId
      });
    }
  });

  return {
    leftBlocks,
    rightBlocks,
    differences,
    caseMode: normalizedCaseMode,
    totalDiffs: safeDiffCount,
    promptZh: `左右托盤中共有 ${safeDiffCount} 處字母差異（顏色、大小、旋轉、字母或大小寫），請找出它們！`
  };
};
