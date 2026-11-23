/**
 * 霧臺國小自主學習宇宙 — 句型積木工坊題庫引擎 (Batch 2B: 低年級 abc + 第 1～8 冊全單元 Lv.1～Lv.3)
 *
 * 資料規範：
 * - 依據 textbook_docx/ALL Contents.pdf 教材大綱編製
 * - 撇號一律使用半形直撇號 '，標點 (. ? !) 獨立作為 tokens 尾塊
 * - distractors (Lv.2 陷阱干擾字卡) 嚴禁與正解 tokens 重複（忽略大小寫）
 * - 跨單元滾雪球組合句標註 isCrossUnit: true，預設隱藏中文提示
 */

import {
  BOOK2_SENTENCES,
  BOOK2_CROSS_UNIT_SENTENCES,
  BOOK2_LV3_QUESTIONS,
  BOOK3_SENTENCES,
  BOOK3_CROSS_UNIT_SENTENCES,
  BOOK3_LV3_QUESTIONS,
  BOOK4_SENTENCES,
  BOOK4_CROSS_UNIT_SENTENCES,
  BOOK4_LV3_QUESTIONS
} from './sentenceBooks2to4.js';
import {
  BOOK5_SENTENCES,
  BOOK5_CROSS_UNIT_SENTENCES,
  BOOK5_LV3_QUESTIONS,
  BOOK6_SENTENCES,
  BOOK6_CROSS_UNIT_SENTENCES,
  BOOK6_LV3_QUESTIONS,
  BOOK7_SENTENCES,
  BOOK7_CROSS_UNIT_SENTENCES,
  BOOK7_LV3_QUESTIONS,
  BOOK8_SENTENCES,
  BOOK8_CROSS_UNIT_SENTENCES,
  BOOK8_LV3_QUESTIONS
} from './sentenceBooks5to8.js';

export {
  BOOK2_SENTENCES,
  BOOK2_CROSS_UNIT_SENTENCES,
  BOOK2_LV3_QUESTIONS,
  BOOK3_SENTENCES,
  BOOK3_CROSS_UNIT_SENTENCES,
  BOOK3_LV3_QUESTIONS,
  BOOK4_SENTENCES,
  BOOK4_CROSS_UNIT_SENTENCES,
  BOOK4_LV3_QUESTIONS,
  BOOK5_SENTENCES,
  BOOK5_CROSS_UNIT_SENTENCES,
  BOOK5_LV3_QUESTIONS,
  BOOK6_SENTENCES,
  BOOK6_CROSS_UNIT_SENTENCES,
  BOOK6_LV3_QUESTIONS,
  BOOK7_SENTENCES,
  BOOK7_CROSS_UNIT_SENTENCES,
  BOOK7_LV3_QUESTIONS,
  BOOK8_SENTENCES,
  BOOK8_CROSS_UNIT_SENTENCES,
  BOOK8_LV3_QUESTIONS
};

export const SUPPORTED_TEXTBOOK_BOOKS = ['1', '2', '3', '4', '5', '6', '7', '8'];
export const SUPPORTED_SENTENCE_BOOKS = ['abc', ...SUPPORTED_TEXTBOOK_BOOKS];

/**
 * 將 tokens 陣列組裝回標準英語句子（標點符號自動緊貼前詞）
 */
export const formatTokensToSentence = (tokens = []) => {
  const noLeadingSpace = new Set(['.', '?', '!', ',']);
  let out = '';
  tokens.forEach((raw) => {
    const tok = String(raw || '').trim();
    if (!tok) return;
    if (!out || noLeadingSpace.has(tok)) {
      out += tok;
    } else {
      out += ` ${tok}`;
    }
  });
  return out;
};

/**
 * 取得題目所有可接受之語序變體（含預設主句型與對稱可調換變體如 A and B / B and A）；
 * 若為聽力辨識題（`isListeningTask` / `strictOrder` 或 `{ allowVariants: false }`），僅允許完全符合原音訊順序的主句型 `question.tokens`
 */
export const getAcceptedTokenVariants = (question, { allowVariants = true } = {}) => {
  if (!question || !Array.isArray(question.tokens)) return [];
  const variants = [question.tokens];
  const strictOrderOnly = !allowVariants || question?.strictOrder === true || question?.isListeningTask === true;
  if (!strictOrderOnly && Array.isArray(question.acceptedVariants)) {
    question.acceptedVariants.forEach((v) => {
      if (Array.isArray(v) && v.length > 0) variants.push(v);
    });
  }
  return variants;
};

/**
 * 比對學生組出的積木序列是否符合任一合法語序變體；命中回傳對應 token 陣列，否則回傳 null
 */
export const matchSentenceTokens = (placedTokenTexts = [], question, { allowVariants = true } = {}) => {
  const variants = getAcceptedTokenVariants(question, { allowVariants });
  for (const variant of variants) {
    if (
      placedTokenTexts.length === variant.length &&
      placedTokenTexts.every((tok, idx) => tok === variant[idx])
    ) {
      return variant;
    }
  }
  return null;
};

const UPPER_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LOWER_ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

/**
 * 低年級預設可用之連續字母排序視窗數（一年級 3 字母 24 組 / 二年級 5 字母 22 組）
 */
export const getAlphabetSequencePoolCount = (alphaGrade = 1) => {
  return Number(alphaGrade) === 2 ? 22 : 24;
};

// ── 第 1 冊完整句型池（Starter / U1~U4 / Festival，共 32 句） ──
export const BOOK1_SENTENCES = [
  // Starter
  {
    id: 'b1_u0_01',
    book: 1,
    unit: '0',
    unitTag: 'B1St',
    en: 'Hello! I am Edison.',
    tokens: ['Hello', '!', 'I', 'am', 'Edison', '.'],
    zh: '你好！我是愛迪生。',
    distractors: ['is', 'you'],
    isCrossUnit: false
  },
  {
    id: 'b1_u0_02',
    book: 1,
    unit: '0',
    unitTag: 'B1St',
    en: "Hi! I'm Edison.",
    tokens: ['Hi', '!', "I'm", 'Edison', '.'],
    zh: '嗨！我是愛迪生。',
    distractors: ['My', 'are'],
    isCrossUnit: false
  },
  {
    id: 'b1_u0_03',
    book: 1,
    unit: '0',
    unitTag: 'B1St',
    en: "Hi, I'm Amber.",
    tokens: ['Hi', ',', "I'm", 'Amber', '.'],
    zh: '嗨，我是安珀。',
    distractors: ['you', 'is'],
    isCrossUnit: false
  },
  {
    id: 'b1_u0_04',
    book: 1,
    unit: '0',
    unitTag: 'B1St',
    en: 'I have five books.',
    tokens: ['I', 'have', 'five', 'books', '.'],
    zh: '我有五本書。',
    distractors: ['has', 'is'],
    isCrossUnit: false
  },

  // Unit 1: 自我介紹
  {
    id: 'b1_u1_01',
    book: 1,
    unit: '1',
    unitTag: 'B1U1',
    en: "What's your name?",
    tokens: ["What's", 'your', 'name', '?'],
    zh: '你叫什麼名字？',
    distractors: ['you', 'is'],
    isCrossUnit: false
  },
  {
    id: 'b1_u1_02',
    book: 1,
    unit: '1',
    unitTag: 'B1U1',
    en: 'My name is Abu.',
    tokens: ['My', 'name', 'is', 'Abu', '.'],
    zh: '我的名字是阿布。',
    distractors: ['I', 'are'],
    isCrossUnit: false
  },
  {
    id: 'b1_u1_03',
    book: 1,
    unit: '1',
    unitTag: 'B1U1',
    en: "I'm Mia.",
    tokens: ["I'm", 'Mia', '.'],
    zh: '我是米亞。',
    distractors: ['My', 'is'],
    isCrossUnit: false
  },
  {
    id: 'b1_u1_04',
    book: 1,
    unit: '1',
    unitTag: 'B1U1',
    en: 'How are you?',
    tokens: ['How', 'are', 'you', '?'],
    zh: '你好嗎？',
    distractors: ['is', 'your'],
    isCrossUnit: false
  },
  {
    id: 'b1_u1_05',
    book: 1,
    unit: '1',
    unitTag: 'B1U1',
    en: "I'm fine.",
    tokens: ["I'm", 'fine', '.'],
    zh: '我很好。',
    distractors: ['are', 'my'],
    isCrossUnit: false
  },
  {
    id: 'b1_u1_06',
    book: 1,
    unit: '1',
    unitTag: 'B1U1',
    en: 'My name is Rocky.',
    tokens: ['My', 'name', 'is', 'Rocky', '.'],
    zh: '我的名字是洛基。',
    distractors: ['your', 'am'],
    isCrossUnit: false
  },

  // Unit 2: 年齡
  {
    id: 'b1_u2_01',
    book: 1,
    unit: '2',
    unitTag: 'B1U2',
    en: 'How old are you?',
    tokens: ['How', 'old', 'are', 'you', '?'],
    zh: '你幾歲？',
    distractors: ['is', 'your'],
    isCrossUnit: false
  },
  {
    id: 'b1_u2_02',
    book: 1,
    unit: '2',
    unitTag: 'B1U2',
    en: "I'm ten.",
    tokens: ["I'm", 'ten', '.'],
    zh: '我十歲。',
    distractors: ['is', 'years'],
    isCrossUnit: false
  },
  {
    id: 'b1_u2_03',
    book: 1,
    unit: '2',
    unitTag: 'B1U2',
    en: "I'm ten years old.",
    tokens: ["I'm", 'ten', 'years', 'old', '.'],
    zh: '我十歲了。',
    distractors: ['year', 'is'],
    isCrossUnit: false
  },
  {
    id: 'b1_u2_04',
    book: 1,
    unit: '2',
    unitTag: 'B1U2',
    en: "I'm nine years old.",
    tokens: ["I'm", 'nine', 'years', 'old', '.'],
    zh: '我九歲了。',
    distractors: ['are', 'year'],
    isCrossUnit: false
  },
  {
    id: 'b1_u2_05',
    book: 1,
    unit: '2',
    unitTag: 'B1U2',
    en: 'Thank you.',
    tokens: ['Thank', 'you', '.'],
    zh: '謝謝你。',
    distractors: ['your', 'am'],
    isCrossUnit: false
  },
  {
    id: 'b1_u2_06',
    book: 1,
    unit: '2',
    unitTag: 'B1U2',
    en: "You're welcome.",
    tokens: ["You're", 'welcome', '.'],
    zh: '不客氣。',
    distractors: ['Your', 'fine'],
    isCrossUnit: false
  },

  // Unit 3: 教室常見物品
  {
    id: 'b1_u3_01',
    book: 1,
    unit: '3',
    unitTag: 'B1U3',
    en: "What's this?",
    tokens: ["What's", 'this', '?'],
    zh: '這是什麼？',
    distractors: ['is', 'it'],
    isCrossUnit: false
  },
  {
    id: 'b1_u3_02',
    book: 1,
    unit: '3',
    unitTag: 'B1U3',
    en: "What's that?",
    tokens: ["What's", 'that', '?'],
    zh: '那是什麼？',
    distractors: ['is', 'you'],
    isCrossUnit: false
  },
  {
    id: 'b1_u3_03',
    book: 1,
    unit: '3',
    unitTag: 'B1U3',
    en: "It's a book.",
    tokens: ["It's", 'a', 'book', '.'],
    zh: '它是一本書。',
    distractors: ['an', 'are'],
    isCrossUnit: false
  },
  {
    id: 'b1_u3_04',
    book: 1,
    unit: '3',
    unitTag: 'B1U3',
    en: "It's an eraser.",
    tokens: ["It's", 'an', 'eraser', '.'],
    zh: '它是一個橡皮擦。',
    distractors: ['a', 'is'],
    isCrossUnit: false
  },
  {
    id: 'b1_u3_05',
    book: 1,
    unit: '3',
    unitTag: 'B1U3',
    en: "It's a pencil.",
    tokens: ["It's", 'a', 'pencil', '.'],
    zh: '它是一枝鉛筆。',
    distractors: ['an', 'am'],
    isCrossUnit: false
  },
  {
    id: 'b1_u3_06',
    book: 1,
    unit: '3',
    unitTag: 'B1U3',
    en: "It's a ruler.",
    tokens: ["It's", 'a', 'ruler', '.'],
    zh: '它是一把尺。',
    distractors: ['an', 'you'],
    isCrossUnit: false
  },
  {
    id: 'b1_u3_07',
    book: 1,
    unit: '3',
    unitTag: 'B1U3',
    en: 'Good job!',
    tokens: ['Good', 'job', '!'],
    zh: '做得好！',
    distractors: ['fine', 'book'],
    isCrossUnit: false
  },

  // Unit 4: 顏色
  {
    id: 'b1_u4_01',
    book: 1,
    unit: '4',
    unitTag: 'B1U4',
    en: 'What color is it?',
    tokens: ['What', 'color', 'is', 'it', '?'],
    zh: '它是什麼顏色？',
    distractors: ['are', 'a'],
    isCrossUnit: false
  },
  {
    id: 'b1_u4_02',
    book: 1,
    unit: '4',
    unitTag: 'B1U4',
    en: "It's blue.",
    tokens: ["It's", 'blue', '.'],
    zh: '它是藍色的。',
    distractors: ['a', 'are'],
    isCrossUnit: false
  },
  {
    id: 'b1_u4_03',
    book: 1,
    unit: '4',
    unitTag: 'B1U4',
    en: "It's green.",
    tokens: ["It's", 'green', '.'],
    zh: '它是綠色的。',
    distractors: ['an', 'is'],
    isCrossUnit: false
  },
  {
    id: 'b1_u4_04',
    book: 1,
    unit: '4',
    unitTag: 'B1U4',
    en: "It's red and yellow.",
    tokens: ["It's", 'red', 'and', 'yellow', '.'],
    acceptedVariants: [["It's", 'yellow', 'and', 'red', '.']],
    zh: '它是紅色和黃色的。',
    distractors: ['a', 'are'],
    isCrossUnit: false
  },
  {
    id: 'b1_u4_05',
    book: 1,
    unit: '4',
    unitTag: 'B1U4',
    en: 'Good morning.',
    tokens: ['Good', 'morning', '.'],
    zh: '早安。',
    distractors: ['fine', 'color'],
    isCrossUnit: false
  },
  {
    id: 'b1_u4_06',
    book: 1,
    unit: '4',
    unitTag: 'B1U4',
    en: 'Good afternoon.',
    tokens: ['Good', 'afternoon', '.'],
    zh: '午安。',
    distractors: ['old', 'name'],
    isCrossUnit: false
  },

  // Festival: Halloween
  {
    id: 'b1_fest_01',
    book: 1,
    unit: 'festival',
    unitTag: 'B1Fe',
    en: 'Happy Halloween!',
    tokens: ['Happy', 'Halloween', '!'],
    zh: '萬聖節快樂！',
    distractors: ['Good', 'morning'],
    isCrossUnit: false
  },
  {
    id: 'b1_fest_02',
    book: 1,
    unit: 'festival',
    unitTag: 'B1Fe',
    en: 'Trick or treat!',
    tokens: ['Trick', 'or', 'treat', '!'],
    zh: '不給糖就搗蛋！',
    distractors: ['and', 'is'],
    isCrossUnit: false
  },
  {
    id: 'b1_fest_03',
    book: 1,
    unit: 'festival',
    unitTag: 'B1Fe',
    en: "It's a pumpkin.",
    tokens: ["It's", 'a', 'pumpkin', '.'],
    zh: '它是一顆南瓜。',
    distractors: ['an', 'are'],
    isCrossUnit: false
  },
  {
    id: 'b1_fest_04',
    book: 1,
    unit: 'festival',
    unitTag: 'B1Fe',
    en: "It's a black spider.",
    tokens: ["It's", 'a', 'black', 'spider', '.'],
    zh: '牠是一隻黑色的蜘蛛。',
    distractors: ['an', 'is'],
    isCrossUnit: false
  }
];

// ── 第 1 冊跨單元滾雪球組合句（須選取含第 1 冊 U4 或全冊才解鎖；中文提示預設隱藏） ──
export const BOOK1_CROSS_UNIT_SENTENCES = [
  {
    id: 'cross_b1_01',
    book: 1,
    unit: '4',
    unitTag: '跨單元',
    minUnitRequired: '4',
    en: "It's a blue book.",
    tokens: ["It's", 'a', 'blue', 'book', '.'],
    zh: '它是一本藍色的書。',
    distractors: ['an', 'are'],
    isCrossUnit: true
  },
  {
    id: 'cross_b1_02',
    book: 1,
    unit: '4',
    unitTag: '跨單元',
    minUnitRequired: '4',
    en: "It's a red pen.",
    tokens: ["It's", 'a', 'red', 'pen', '.'],
    zh: '它是一枝紅色的筆。',
    distractors: ['an', 'is'],
    isCrossUnit: true
  },
  {
    id: 'cross_b1_03',
    book: 1,
    unit: '4',
    unitTag: '跨單元',
    minUnitRequired: '4',
    en: "It's a yellow pencil.",
    tokens: ["It's", 'a', 'yellow', 'pencil', '.'],
    zh: '它是一枝黃色的鉛筆。',
    distractors: ['an', 'you'],
    isCrossUnit: true
  },
  {
    id: 'cross_b1_04',
    book: 1,
    unit: '4',
    unitTag: '跨單元',
    minUnitRequired: '4',
    en: "It's a green ruler.",
    tokens: ["It's", 'a', 'green', 'ruler', '.'],
    zh: '它是一把綠色的尺。',
    distractors: ['an', 'my'],
    isCrossUnit: true
  },
  {
    id: 'cross_b1_05',
    book: 1,
    unit: '4',
    unitTag: '跨單元',
    minUnitRequired: '4',
    en: "It's a white eraser.",
    tokens: ["It's", 'a', 'white', 'eraser', '.'],
    zh: '它是一個白色的橡皮擦。',
    distractors: ['an', 'are'],
    isCrossUnit: true
  },
  {
    id: 'cross_b1_06',
    book: 1,
    unit: '4',
    unitTag: '跨單元',
    minUnitRequired: '4',
    en: "It's a black marker.",
    tokens: ["It's", 'a', 'black', 'marker', '.'],
    zh: '它是一枝黑色的彩色筆。',
    distractors: ['an', 'is'],
    isCrossUnit: true
  },
  {
    id: 'cross_b1_07',
    book: 1,
    unit: '4',
    unitTag: '跨單元',
    minUnitRequired: '4',
    // 刻意包含重複字詞 "I'm"（2 次）驗證重複積木各自擁有獨立 tileId，同時避免「紅與藍對調」之並列歧義
    en: "Hi! I'm Abu, and I'm ten.",
    tokens: ['Hi', '!', "I'm", 'Abu', ',', 'and', "I'm", 'ten', '.'],
    zh: '嗨！我是阿布，我十歲。',
    distractors: ['is', 'my'],
    isCrossUnit: true
  },
  {
    id: 'cross_b1_08',
    book: 1,
    unit: '4',
    unitTag: '跨單元',
    minUnitRequired: '4',
    en: 'I have a yellow book.',
    tokens: ['I', 'have', 'a', 'yellow', 'book', '.'],
    zh: '我有一本黃色的書。',
    distractors: ['an', 'has'],
    isCrossUnit: true
  }
];

// ── 第 1 冊 Lv.3 情境挑戰 4 合 1 題庫（對話接龍 / 聽音組句 / 聽音答句 / 嚴選無字線稿看圖，共 35 題） ──
// 所有題目預設隱藏中文（hideChineseByDefault: true），且不放入干擾塊；聽音題一律強制 strictOrder / isListeningTask
export const BOOK1_LV3_QUESTIONS = [
  // Starter (4)
  {
    id: 'b1_lv3_u0_01',
    book: 1,
    unit: '0',
    unitTag: 'B1St',
    promptType: 'dialogue',
    dialogueRole: 'ask_reply',
    dialogueSpeaker: 'A',
    dialogueLine: 'Hello! Welcome to school!',
    dialogueZh: '你好！歡迎來到學校！',
    cueText: '🙋 我是愛迪生（Edison），親切自我介紹',
    en: 'Hello! I am Edison.',
    tokens: ['Hello', '!', 'I', 'am', 'Edison', '.'],
    zh: '你好！我是愛迪生。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u0_02',
    book: 1,
    unit: '0',
    unitTag: 'B1St',
    promptType: 'listen_build',
    audioText: "Hi! I'm Edison.",
    en: "Hi! I'm Edison.",
    tokens: ['Hi', '!', "I'm", 'Edison', '.'],
    zh: '嗨！我是愛迪生。',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u0_03',
    book: 1,
    unit: '0',
    unitTag: 'B1St',
    promptType: 'listen_build',
    audioText: "Hi, I'm Amber.",
    en: "Hi, I'm Amber.",
    tokens: ['Hi', ',', "I'm", 'Amber', '.'],
    zh: '嗨，我是安珀。',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u0_04',
    book: 1,
    unit: '0',
    unitTag: 'B1St',
    promptType: 'picture',
    imageSrc: '/assets/exam/preA1/book.png',
    countBadge: '× 5',
    pictureCue: '依數量與圖片造句（用 I have...）',
    en: 'I have five books.',
    tokens: ['I', 'have', 'five', 'books', '.'],
    zh: '我有五本書。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },

  // Unit 1 (6)
  {
    id: 'b1_lv3_u1_01',
    book: 1,
    unit: '1',
    unitTag: 'B1U1',
    promptType: 'dialogue',
    dialogueRole: 'infer_question',
    dialogueSpeaker: 'B',
    dialogueLine: 'My name is Abu.',
    dialogueZh: '我的名字是阿布。',
    cueText: "❓ 推敲上一句：如何詢問對方名字？（用 What's...）",
    en: "What's your name?",
    tokens: ["What's", 'your', 'name', '?'],
    zh: '你叫什麼名字？',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u1_02',
    book: 1,
    unit: '1',
    unitTag: 'B1U1',
    promptType: 'dialogue',
    dialogueRole: 'ask_reply',
    dialogueSpeaker: 'A',
    dialogueLine: "What's your name?",
    dialogueZh: '你叫什麼名字？',
    cueText: '🪪 角色：阿布（Abu，用 My name is... 回答）',
    en: 'My name is Abu.',
    tokens: ['My', 'name', 'is', 'Abu', '.'],
    zh: '我的名字是阿布。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u1_03',
    book: 1,
    unit: '1',
    unitTag: 'B1U1',
    promptType: 'listen_qa',
    promptAudioText: "What's your name?",
    promptTranscript: "What's your name?",
    promptZh: '你叫什麼名字？',
    cueText: "🪪 回答我是米亞（Mia，用 I'm...）",
    en: "I'm Mia.",
    tokens: ["I'm", 'Mia', '.'],
    zh: '我是米亞。',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u1_04',
    book: 1,
    unit: '1',
    unitTag: 'B1U1',
    promptType: 'dialogue',
    dialogueRole: 'infer_question',
    dialogueSpeaker: 'B',
    dialogueLine: "I'm fine. Thank you.",
    dialogueZh: '我很好。謝謝你。',
    cueText: '❓ 推敲上一句：如何關心問候「你好嗎？」',
    en: 'How are you?',
    tokens: ['How', 'are', 'you', '?'],
    zh: '你好嗎？',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u1_05',
    book: 1,
    unit: '1',
    unitTag: 'B1U1',
    promptType: 'listen_qa',
    promptAudioText: 'How are you?',
    promptTranscript: 'How are you?',
    promptZh: '你好嗎？',
    cueText: '😊 開心回應「我很好」',
    en: "I'm fine.",
    tokens: ["I'm", 'fine', '.'],
    zh: '我很好。',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u1_06',
    book: 1,
    unit: '1',
    unitTag: 'B1U1',
    promptType: 'listen_build',
    audioText: 'My name is Rocky.',
    en: 'My name is Rocky.',
    tokens: ['My', 'name', 'is', 'Rocky', '.'],
    zh: '我的名字是洛基。',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: false
  },

  // Unit 2 (6)
  {
    id: 'b1_lv3_u2_01',
    book: 1,
    unit: '2',
    unitTag: 'B1U2',
    promptType: 'dialogue',
    dialogueRole: 'infer_question',
    dialogueSpeaker: 'B',
    dialogueLine: "I'm ten years old.",
    dialogueZh: '我十歲了。',
    cueText: '❓ 推敲上一句：如何詢問對方幾歲？',
    en: 'How old are you?',
    tokens: ['How', 'old', 'are', 'you', '?'],
    zh: '你幾歲？',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u2_02',
    book: 1,
    unit: '2',
    unitTag: 'B1U2',
    promptType: 'listen_qa',
    promptAudioText: 'How old are you?',
    promptTranscript: 'How old are you?',
    promptZh: '你幾歲？',
    cueText: '🎂 回答：10 歲（簡答）',
    en: "I'm ten.",
    tokens: ["I'm", 'ten', '.'],
    zh: '我十歲。',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u2_03',
    book: 1,
    unit: '2',
    unitTag: 'B1U2',
    promptType: 'dialogue',
    dialogueRole: 'ask_reply',
    dialogueSpeaker: 'A',
    dialogueLine: 'How old are you?',
    dialogueZh: '你幾歲？',
    cueText: '🎂 回答：10 歲（完整句）',
    en: "I'm ten years old.",
    tokens: ["I'm", 'ten', 'years', 'old', '.'],
    zh: '我十歲了。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u2_04',
    book: 1,
    unit: '2',
    unitTag: 'B1U2',
    promptType: 'listen_build',
    audioText: "I'm nine years old.",
    en: "I'm nine years old.",
    tokens: ["I'm", 'nine', 'years', 'old', '.'],
    zh: '我九歲了。',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u2_05',
    book: 1,
    unit: '2',
    unitTag: 'B1U2',
    promptType: 'dialogue',
    dialogueRole: 'ask_reply',
    dialogueSpeaker: 'A',
    dialogueLine: 'Thank you.',
    dialogueZh: '謝謝你。',
    cueText: '🤝 禮貌回應「不客氣」',
    en: "You're welcome.",
    tokens: ["You're", 'welcome', '.'],
    zh: '不客氣。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u2_06',
    book: 1,
    unit: '2',
    unitTag: 'B1U2',
    promptType: 'listen_build',
    audioText: 'Thank you.',
    en: 'Thank you.',
    tokens: ['Thank', 'you', '.'],
    zh: '謝謝你。',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: false
  },

  // Unit 3 (6)
  {
    id: 'b1_lv3_u3_01',
    book: 1,
    unit: '3',
    unitTag: 'B1U3',
    promptType: 'picture',
    imageSrc: '/assets/exam/preA1/book.png',
    pictureCue: "看圖說出物品（用 It's a...）",
    en: "It's a book.",
    tokens: ["It's", 'a', 'book', '.'],
    zh: '它是一本書。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u3_02',
    book: 1,
    unit: '3',
    unitTag: 'B1U3',
    promptType: 'picture',
    imageSrc: '/assets/exam/preA1/eraser.png',
    pictureCue: "看圖說出物品（注意 a / an，用 It's...）",
    en: "It's an eraser.",
    tokens: ["It's", 'an', 'eraser', '.'],
    zh: '它是一個橡皮擦。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u3_03',
    book: 1,
    unit: '3',
    unitTag: 'B1U3',
    promptType: 'picture',
    imageSrc: '/assets/exam/preA1/pencil.png',
    pictureCue: "看圖說出物品（用 It's a...）",
    en: "It's a pencil.",
    tokens: ["It's", 'a', 'pencil', '.'],
    zh: '它是一枝鉛筆。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u3_04',
    book: 1,
    unit: '3',
    unitTag: 'B1U3',
    promptType: 'picture',
    imageSrc: '/assets/exam/preA1/ruler.png',
    pictureCue: "看圖說出物品（用 It's a...）",
    en: "It's a ruler.",
    tokens: ["It's", 'a', 'ruler', '.'],
    zh: '它是一把尺。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u3_05',
    book: 1,
    unit: '3',
    unitTag: 'B1U3',
    promptType: 'dialogue',
    dialogueRole: 'infer_question',
    dialogueSpeaker: 'B',
    dialogueLine: "It's a book.",
    dialogueZh: '它是一本書。',
    cueText: '👉 指著手邊近處的物品發問「這是什麼？」',
    en: "What's this?",
    tokens: ["What's", 'this', '?'],
    zh: '這是什麼？',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u3_06',
    book: 1,
    unit: '3',
    unitTag: 'B1U3',
    promptType: 'listen_qa',
    promptAudioText: "What's that?",
    promptTranscript: "What's that?",
    promptZh: '那是什麼？',
    imageSrc: '/assets/exam/preA1/book.png',
    cueText: '依圖片回答問句',
    en: "It's a book.",
    tokens: ["It's", 'a', 'book', '.'],
    zh: '它是一本書。',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: false
  },

  // Unit 4 (6 + 4 cross-unit = 10)
  {
    id: 'b1_lv3_u4_01',
    book: 1,
    unit: '4',
    unitTag: 'B1U4',
    promptType: 'dialogue',
    dialogueRole: 'infer_question',
    dialogueSpeaker: 'B',
    dialogueLine: "It's blue.",
    dialogueZh: '它是藍色的。',
    cueText: '🎨 詢問對方「它是什麼顏色？」',
    en: 'What color is it?',
    tokens: ['What', 'color', 'is', 'it', '?'],
    zh: '它是什麼顏色？',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u4_02',
    book: 1,
    unit: '4',
    unitTag: 'B1U4',
    promptType: 'picture',
    colorSwatches: [{ hex: '#2563eb' }],
    pictureCue: "看色塊回答顏色（用 It's...）",
    en: "It's blue.",
    tokens: ["It's", 'blue', '.'],
    zh: '它是藍色的。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u4_03',
    book: 1,
    unit: '4',
    unitTag: 'B1U4',
    promptType: 'listen_qa',
    promptAudioText: 'What color is it?',
    promptTranscript: 'What color is it?',
    promptZh: '它是什麼顏色？',
    colorSwatches: [{ hex: '#16a34a' }],
    cueText: '看色塊回答聽到的問句',
    en: "It's green.",
    tokens: ["It's", 'green', '.'],
    zh: '它是綠色的。',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u4_04',
    book: 1,
    unit: '4',
    unitTag: 'B1U4',
    promptType: 'listen_build',
    audioText: "It's red and yellow.",
    en: "It's red and yellow.",
    tokens: ["It's", 'red', 'and', 'yellow', '.'],
    acceptedVariants: [["It's", 'yellow', 'and', 'red', '.']],
    zh: '它是紅色和黃色的。',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u4_05',
    book: 1,
    unit: '4',
    unitTag: 'B1U4',
    promptType: 'dialogue',
    dialogueRole: 'ask_reply',
    dialogueSpeaker: 'A',
    dialogueLine: 'Hi, Mia! Look at the morning sun!',
    dialogueZh: '嗨，米亞！看看早上的太陽！',
    cueText: '☀️ 早上遇見朋友，用英文道早安',
    en: 'Good morning.',
    tokens: ['Good', 'morning', '.'],
    zh: '早安。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_u4_06',
    book: 1,
    unit: '4',
    unitTag: 'B1U4',
    promptType: 'listen_build',
    audioText: 'Good afternoon.',
    en: 'Good afternoon.',
    tokens: ['Good', 'afternoon', '.'],
    zh: '午安。',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_cross_01',
    book: 1,
    unit: '4',
    unitTag: '跨單元',
    minUnitRequired: '4',
    promptType: 'picture',
    imageSrc: '/assets/exam/preA1/book.png',
    colorSwatches: [{ hex: '#2563eb' }],
    pictureCue: "結合顏色＋物品（用 It's a...）",
    en: "It's a blue book.",
    tokens: ["It's", 'a', 'blue', 'book', '.'],
    zh: '它是一本藍色的書。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: true
  },
  {
    id: 'b1_lv3_cross_02',
    book: 1,
    unit: '4',
    unitTag: '跨單元',
    minUnitRequired: '4',
    promptType: 'picture',
    imageSrc: '/assets/exam/preA1/pen.png',
    colorSwatches: [{ hex: '#ef4444' }],
    pictureCue: "結合顏色＋物品（用 It's a...）",
    en: "It's a red pen.",
    tokens: ["It's", 'a', 'red', 'pen', '.'],
    zh: '它是一枝紅色的筆。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: true
  },
  {
    id: 'b1_lv3_cross_03',
    book: 1,
    unit: '4',
    unitTag: '跨單元',
    minUnitRequired: '4',
    promptType: 'picture',
    imageSrc: '/assets/exam/preA1/pencil.png',
    colorSwatches: [{ hex: '#eab308' }],
    pictureCue: "結合顏色＋物品（用 It's a...）",
    en: "It's a yellow pencil.",
    tokens: ["It's", 'a', 'yellow', 'pencil', '.'],
    zh: '它是一枝黃色的鉛筆。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: true
  },
  {
    id: 'b1_lv3_cross_04',
    book: 1,
    unit: '4',
    unitTag: '跨單元',
    minUnitRequired: '4',
    promptType: 'listen_build',
    audioText: "It's a green ruler.",
    en: "It's a green ruler.",
    tokens: ["It's", 'a', 'green', 'ruler', '.'],
    zh: '它是一把綠色的尺。',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: true
  },

  // Festival: Halloween (3)
  {
    id: 'b1_lv3_fest_01',
    book: 1,
    unit: 'festival',
    unitTag: 'B1Fe',
    promptType: 'dialogue',
    dialogueRole: 'ask_reply',
    dialogueSpeaker: 'A',
    dialogueLine: 'Trick or treat! Here is some candy!',
    dialogueZh: '不給糖就搗蛋！給你糖果！',
    cueText: '🎃 祝賀對方「萬聖節快樂！」',
    en: 'Happy Halloween!',
    tokens: ['Happy', 'Halloween', '!'],
    zh: '萬聖節快樂！',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_fest_02',
    book: 1,
    unit: 'festival',
    unitTag: 'B1Fe',
    promptType: 'listen_build',
    audioText: 'Trick or treat!',
    en: 'Trick or treat!',
    tokens: ['Trick', 'or', 'treat', '!'],
    zh: '不給糖就搗蛋！',
    isListeningTask: true,
    strictOrder: true,
    hideChineseByDefault: true,
    isCrossUnit: false
  },
  {
    id: 'b1_lv3_fest_03',
    book: 1,
    unit: 'festival',
    unitTag: 'B1Fe',
    promptType: 'picture',
    imageSrc: '/assets/exam/preA1/spider.png',
    colorSwatches: [{ hex: '#111827' }],
    pictureCue: "結合顏色＋萬聖節角色（用 It's a...）",
    en: "It's a black spider.",
    tokens: ["It's", 'a', 'black', 'spider', '.'],
    zh: '牠是一隻黑色的蜘蛛。',
    isListeningTask: false,
    hideChineseByDefault: true,
    isCrossUnit: false
  }
];

export const SENTENCE_BANKS_BY_BOOK = {
  '1': { sentences: BOOK1_SENTENCES, crossUnit: BOOK1_CROSS_UNIT_SENTENCES, lv3: BOOK1_LV3_QUESTIONS },
  '2': { sentences: BOOK2_SENTENCES, crossUnit: BOOK2_CROSS_UNIT_SENTENCES, lv3: BOOK2_LV3_QUESTIONS },
  '3': { sentences: BOOK3_SENTENCES, crossUnit: BOOK3_CROSS_UNIT_SENTENCES, lv3: BOOK3_LV3_QUESTIONS },
  '4': { sentences: BOOK4_SENTENCES, crossUnit: BOOK4_CROSS_UNIT_SENTENCES, lv3: BOOK4_LV3_QUESTIONS },
  '5': { sentences: BOOK5_SENTENCES, crossUnit: BOOK5_CROSS_UNIT_SENTENCES, lv3: BOOK5_LV3_QUESTIONS },
  '6': { sentences: BOOK6_SENTENCES, crossUnit: BOOK6_CROSS_UNIT_SENTENCES, lv3: BOOK6_LV3_QUESTIONS },
  '7': { sentences: BOOK7_SENTENCES, crossUnit: BOOK7_CROSS_UNIT_SENTENCES, lv3: BOOK7_LV3_QUESTIONS },
  '8': { sentences: BOOK8_SENTENCES, crossUnit: BOOK8_CROSS_UNIT_SENTENCES, lv3: BOOK8_LV3_QUESTIONS }
};

export const normalizeLessonToken = (lessonRaw = '') => {
  const s = String(lessonRaw).trim().toLowerCase();
  if (!s) return '';
  if (s === 'all') return 'all';
  if (s === '0' || s.includes('starter')) return '0';
  if (s.includes('rev')) {
    if (s.includes('1')) return 'review1';
    if (s.includes('2')) return 'review2';
    return 'review';
  }
  if (
    s.includes('fest') ||
    s.includes('culture') ||
    s.includes('halloween') ||
    s.includes('mother') ||
    s.includes('moon') ||
    s.includes('easter') ||
    s.includes('christmas') ||
    s.includes('dragon') ||
    s.includes('new year') ||
    s.includes('sport')
  ) {
    return 'festival';
  }
  const numMatch = s.match(/\d+/);
  if (numMatch) return numMatch[0];
  return s;
};

const VALID_SENTENCE_UNITS = new Set(['0', '1', '2', '3', '4', 'festival']);

/**
 * 解析 Lobby / URL 傳入的單元代碼清單，區分已支援冊別 (abc / 1~8)、無對應題庫之單元與未收錄冊別 (如 9 / 自訂)
 */
export const parseSelectedSentenceScope = (selectedUnits = [], qualifyingBook = null) => {
  const rawList = Array.isArray(selectedUnits) ? selectedUnits.filter(Boolean) : [];
  const list = rawList.length > 0
    ? rawList
    : qualifyingBook === 'abc'
    ? ['abc']
    : qualifyingBook
    ? [`${qualifyingBook}-all`]
    : [];

  let includeAbc = false;
  const bookUnitsMap = {};
  const unsupportedBooks = new Set();
  const unsupportedUnits = new Set();

  list.forEach((key) => {
    const str = String(key).trim();
    if (!str) return;
    if (str.toLowerCase() === 'abc') {
      includeAbc = true;
      return;
    }
    const dashIdx = str.indexOf('-');
    const bookPart = dashIdx >= 0 ? str.slice(0, dashIdx).trim() : str;
    const lessonPart = dashIdx >= 0 ? str.slice(dashIdx + 1).trim() : 'all';

    if (Object.prototype.hasOwnProperty.call(SENTENCE_BANKS_BY_BOOK, bookPart)) {
      const norm = normalizeLessonToken(lessonPart);
      const ensureSet = () => {
        if (!bookUnitsMap[bookPart]) {
          bookUnitsMap[bookPart] = new Set();
        }
        return bookUnitsMap[bookPart];
      };
      if (norm === 'all') {
        const set = ensureSet();
        ['0', '1', '2', '3', '4', 'festival'].forEach(u => set.add(u));
      } else if (norm === 'review1') {
        const set = ensureSet();
        ['1', '2'].forEach(u => set.add(u));
      } else if (norm === 'review2') {
        const set = ensureSet();
        ['3', '4'].forEach(u => set.add(u));
      } else if (norm === 'review') {
        const set = ensureSet();
        ['1', '2', '3', '4'].forEach(u => set.add(u));
      } else if (VALID_SENTENCE_UNITS.has(norm)) {
        ensureSet().add(norm);
      } else {
        unsupportedUnits.add(str);
      }
    } else if (bookPart) {
      unsupportedBooks.add(bookPart);
    }
  });

  const supportedBooks = SUPPORTED_TEXTBOOK_BOOKS.filter(
    b => bookUnitsMap[b] && bookUnitsMap[b].size > 0
  );
  const book1Units = bookUnitsMap['1'] || new Set();
  const hasSupported = includeAbc || supportedBooks.length > 0;
  const skippedAbc = Boolean(includeAbc && supportedBooks.length > 0);

  return {
    includeAbc,
    bookUnitsMap,
    book1Units,
    supportedBooks,
    unsupportedBooks,
    unsupportedUnits,
    hasSupported,
    skippedAbc,
    hasUnsupportedOnly: !hasSupported && unsupportedBooks.size > 0,
    hasPartialUnsupported: hasSupported && (unsupportedBooks.size > 0 || unsupportedUnits.size > 0)
  };
};

/**
 * 依所選範圍嚴格取得可遊玩句型清單（絕不偷塞未選單元或未選冊；逐冊檢查 U4 解鎖該冊跨單元句；支援 Lv.1/Lv.2/Lv.3）
 */
export const getAvailableSentences = ({
  selectedUnits = [],
  qualifyingBook = null,
  includeCrossUnit = true,
  level = 'lv1'
} = {}) => {
  const scope = parseSelectedSentenceScope(selectedUnits, qualifyingBook);
  if (scope.supportedBooks.length === 0) {
    return [];
  }

  const results = [];
  for (const bookId of scope.supportedBooks) {
    const unitSet = scope.bookUnitsMap[bookId];
    const bank = SENTENCE_BANKS_BY_BOOK[bookId];
    if (!unitSet || !bank) continue;
    const hasU4 = includeCrossUnit && unitSet.has('4');

    if (level === 'lv3') {
      bank.lv3.forEach((item) => {
        if (!unitSet.has(String(item.unit))) return;
        if (item.isCrossUnit && !hasU4) return;
        results.push(item);
      });
    } else {
      bank.sentences.forEach((item) => {
        if (unitSet.has(String(item.unit))) {
          results.push(item);
        }
      });
      // 只有當該冊選取範圍包含 U4，才解鎖該冊跨單元綜合句
      if (hasU4) {
        results.push(...bank.crossUnit);
      }
    }
  }
  return results;
};

/**
 * 即時計算整備室選區實際可玩題數（低年級回傳連續字母窗數；三～六年級回傳該難度實際句數）
 */
export const getAvailableSentenceCount = (params = {}) => {
  const { selectedUnits = [], qualifyingBook = null, alphaGrade = 1 } = params || {};
  const scope = parseSelectedSentenceScope(selectedUnits, qualifyingBook);
  if (scope.includeAbc && scope.supportedBooks.length === 0) {
    return getAlphabetSequencePoolCount(alphaGrade);
  }
  return getAvailableSentences(params).length;
};

const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const buildShuffledBankTiles = (item, includeDistractors) => {
  const baseTiles = item.tokens.map((text, idx) => ({
    tileId: `${item.id}_t_${idx}`,
    text,
    isPunct: ['.', '?', '!', ','].includes(text),
    isDistractor: false
  }));

  const tokenLowerSet = new Set(item.tokens.map(t => String(t).toLowerCase()));
  const extraDistractors = includeDistractors
    ? (item.distractors || [])
        .filter(d => d && !tokenLowerSet.has(String(d).toLowerCase()))
        .slice(0, 2)
        .map((text, idx) => ({
          tileId: `${item.id}_d_${idx}`,
          text,
          isPunct: false,
          isDistractor: true
        }))
    : [];

  const combined = [...baseTiles, ...extraDistractors];
  let shuffled = shuffleArray(combined);
  // 確保打散後不會與正解順序完全相同
  if (combined.length > 1) {
    const targetJoined = item.tokens.join('|');
    for (let retry = 0; retry < 5; retry++) {
      if (shuffled.map(t => t.text).join('|') !== targetJoined) break;
      shuffled = shuffleArray(combined);
    }
    if (shuffled.map(t => t.text).join('|') === targetJoined) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
  }
  return shuffled;
};

/**
 * 產生低年級（一年級 3 字母 / 二年級 5 字母）嚴格連續字母排序題組
 * - 絕不跳字、絕不在單題內混雜大小寫（mixed 模式採逐題純大／純小平衡輪流）
 */
export const generateAlphabetSequenceRound = ({
  alphaMode = 'upper',
  alphaGrade = 1,
  count = 10
} = {}) => {
  const gradeNum = Number(alphaGrade) === 2 ? 2 : 1;
  const seqLength = gradeNum === 2 ? 5 : 3;
  const normalizedMode = ['upper', 'lower', 'mixed'].includes(alphaMode)
    ? alphaMode
    : (gradeNum === 2 ? 'lower' : 'upper');

  const maxWindows = 26 - seqLength + 1;
  const targetCount = Math.min(Math.max(1, Number(count) || 10), maxWindows);
  const startPool = shuffleArray(Array.from({ length: maxWindows }, (_, i) => i)).slice(0, targetCount);

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

  const questions = startPool.map((startIdx, idx) => {
    const isUpper = upperFlags[idx];
    const alphabet = isUpper ? UPPER_ALPHABET : LOWER_ALPHABET;
    const tokens = alphabet.slice(startIdx, startIdx + seqLength);
    const id = `alpha_seq_g${gradeNum}_${isUpper ? 'u' : 'l'}_${startIdx}`;
    const itemBase = { id, tokens };
    const bankTiles = buildShuffledBankTiles(itemBase, false);

    return {
      id,
      book: 'abc',
      unit: 'abc',
      unitTag: gradeNum === 2 ? '二年級 5 字母' : '一年級 3 字母',
      isAlphabetSequence: true,
      isUpper,
      seqLength,
      alphaMode: normalizedMode,
      alphaGrade: gradeNum,
      promptType: 'alphabet_order',
      level: 'alpha',
      tokens,
      en: tokens.join(' '),
      audioText: tokens.join(', '),
      zh: isUpper
        ? `請將 ${seqLength} 個大寫字母依 A → Z 順序排好`
        : `請將 ${seqLength} 個小寫字母依 a → z 順序排好`,
      targetCount: seqLength,
      bankTiles,
      isListeningTask: false,
      strictOrder: true,
      hideChineseByDefault: false,
      isCrossUnit: false
    };
  });

  return {
    questions,
    availableCount: maxWindows,
    isAlphabetRound: true,
    alphaMode: normalizedMode,
    alphaGrade: gradeNum,
    emptyReason: null,
    unsupportedBooks: []
  };
};

const LV3_PROMPT_ORDER = ['dialogue', 'listen_build', 'listen_qa', 'picture'];

const pickStratifiedLv3 = (pool, targetCount) => {
  if (pool.length <= targetCount) {
    return shuffleArray(pool);
  }
  const buckets = new Map();
  LV3_PROMPT_ORDER.forEach(type => buckets.set(type, []));
  pool.forEach((item) => {
    const key = item.promptType || 'dialogue';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(item);
  });
  for (const [k, arr] of buckets.entries()) {
    buckets.set(k, shuffleArray(arr));
  }

  const chosen = [];
  const activeTypes = Array.from(buckets.keys()).filter(k => buckets.get(k).length > 0);
  while (chosen.length < targetCount && activeTypes.length > 0) {
    for (let i = 0; i < activeTypes.length && chosen.length < targetCount; i++) {
      const bucket = buckets.get(activeTypes[i]);
      if (bucket && bucket.length > 0) {
        chosen.push(bucket.shift());
      }
    }
    for (let i = activeTypes.length - 1; i >= 0; i--) {
      if (buckets.get(activeTypes[i]).length === 0) activeTypes.splice(i, 1);
    }
  }
  return shuffleArray(chosen);
};

/**
 * 產生一輪句型積木題組：
 * - 低年級 abc：連續 3／5 字母排序（純大 / 純小 / 逐題輪流）
 * - 三～六年級：Lv.1 基礎重組 / Lv.2 干擾陷阱 / Lv.3 情境挑戰 4 合 1（無干擾塊）
 */
export const generateSentenceRound = ({
  selectedUnits = [],
  qualifyingBook = null,
  level = 'lv1',
  count = 10,
  alphaMode,
  alphaGrade
} = {}) => {
  const scope = parseSelectedSentenceScope(selectedUnits, qualifyingBook);
  if (scope.includeAbc && scope.supportedBooks.length === 0) {
    const alphaRound = generateAlphabetSequenceRound({ alphaMode, alphaGrade, count });
    return {
      ...alphaRound,
      skippedAbc: false,
      unsupportedBooks: Array.from(scope.unsupportedBooks),
      unsupportedUnits: Array.from(scope.unsupportedUnits)
    };
  }

  const effectiveLevel = level === 'lv3' ? 'lv3' : (level === 'lv2' ? 'lv2' : 'lv1');
  const pool = getAvailableSentences({
    selectedUnits,
    qualifyingBook,
    includeCrossUnit: true,
    level: effectiveLevel
  });

  if (pool.length === 0) {
    return {
      questions: [],
      availableCount: 0,
      emptyReason: scope.hasUnsupportedOnly ? 'upcoming_book' : 'no_units_selected',
      skippedAbc: Boolean(scope.skippedAbc),
      unsupportedBooks: Array.from(scope.unsupportedBooks),
      unsupportedUnits: Array.from(scope.unsupportedUnits)
    };
  }

  const targetCount = Math.min(Math.max(1, count), pool.length);
  const picked = effectiveLevel === 'lv3'
    ? pickStratifiedLv3(pool, targetCount)
    : shuffleArray(pool).slice(0, targetCount);

  const questions = picked.map((item) => {
    const bankTiles = buildShuffledBankTiles(item, effectiveLevel === 'lv2');
    return {
      ...item,
      level: effectiveLevel,
      targetCount: item.tokens.length,
      bankTiles,
      hideChineseByDefault: effectiveLevel === 'lv3' ? true : Boolean(item.isCrossUnit)
    };
  });

  return {
    questions,
    availableCount: pool.length,
    emptyReason: null,
    skippedAbc: Boolean(scope.skippedAbc),
    unsupportedBooks: Array.from(scope.unsupportedBooks),
    unsupportedUnits: Array.from(scope.unsupportedUnits)
  };
};
