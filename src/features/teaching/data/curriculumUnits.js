import { HERE_WE_GO_TEXTBOOKS } from '../../../data/hereWeGoTextbookData.js';
import { normalizeLessonToken } from '../../../data/sentencePatterns.js';

/**
 * Here We Go 第 1～8 冊（共 40 單元）官方課程大綱、字母拼讀目標與課綱字彙 SSOT
 * 完整對齊 textbook_docx/ALL Contents.pdf
 */
export const CURRICULUM_BOOKS = [
  { book: '1', labelZh: '第 1 冊 (三上)', shortLabel: 'B1 三上' },
  { book: '2', labelZh: '第 2 冊 (三下)', shortLabel: 'B2 三下' },
  { book: '3', labelZh: '第 3 冊 (四上)', shortLabel: 'B3 四上' },
  { book: '4', labelZh: '第 4 冊 (四下)', shortLabel: 'B4 四下' },
  { book: '5', labelZh: '第 5 冊 (五上)', shortLabel: 'B5 五上' },
  { book: '6', labelZh: '第 6 冊 (五下)', shortLabel: 'B6 五下' },
  { book: '7', labelZh: '第 7 冊 (六上)', shortLabel: 'B7 六上' },
  { book: '8', labelZh: '第 8 冊 (六下)', shortLabel: 'B8 六下' }
];

export const CURRICULUM_UNITS = [
  // ════════════════════════════════════════════════════════════════
  // 第 1 冊 (三上)：26 字母名與基礎字首音 Aa–Zz
  // ════════════════════════════════════════════════════════════════
  {
    id: '1-0', book: '1', unit: '0', titleZh: 'Starter 問候與數字',
    phonicsLabel: 'Aa – Ee',
    targetGraphemes: ['a', 'b', 'c', 'd', 'e'],
    contrastDemoRows: [['c', 'a', 't'], ['b', 'e', 'd']],
    officialVocab: [
      { en: 'one', zh: '一', kind: 'core' }, { en: 'two', zh: '二', kind: 'core' }, { en: 'three', zh: '三', kind: 'core' },
      { en: 'four', zh: '四', kind: 'core' }, { en: 'five', zh: '五', kind: 'core' },
      { en: 'ant', zh: '螞蟻', kind: 'phonics' }, { en: 'apple', zh: '蘋果', kind: 'phonics' },
      { en: 'bag', zh: '袋子', kind: 'phonics' }, { en: 'boy', zh: '男孩', kind: 'phonics' },
      { en: 'cat', zh: '貓', kind: 'phonics' }, { en: 'cup', zh: '杯子', kind: 'phonics' },
      { en: 'dog', zh: '狗', kind: 'phonics' }, { en: 'duck', zh: '鴨子', kind: 'phonics' },
      { en: 'egg', zh: '蛋', kind: 'phonics' }, { en: 'elephant', zh: '大象', kind: 'phonics' }
    ],
    drillWords: [
      { word: 'apple', phonemes: ['a'], distractors: ['b', 'c', 'e'], meaningZh: '蘋果 (Aa)', emoji: '🍎', isLetterDrill: true },
      { word: 'bat', phonemes: ['b'], distractors: ['a', 'd', 'e'], meaningZh: '蝙蝠 (Bb)', emoji: '🦇', isLetterDrill: true },
      { word: 'cat', phonemes: ['c'], distractors: ['b', 'd', 'a'], meaningZh: '貓咪 (Cc)', emoji: '🐱', isLetterDrill: true },
      { word: 'dog', phonemes: ['d'], distractors: ['b', 'c', 'e'], meaningZh: '小狗 (Dd)', emoji: '🐶', isLetterDrill: true },
      { word: 'egg', phonemes: ['e'], distractors: ['a', 'b', 'd'], meaningZh: '雞蛋 (Ee)', emoji: '🥚', isLetterDrill: true }
    ]
  },
  {
    id: '1-1', book: '1', unit: '1', titleZh: 'Unit 1 自我介紹',
    phonicsLabel: 'Ff – Jj',
    targetGraphemes: ['f', 'g', 'h', 'i', 'j'],
    contrastDemoRows: [['f', 'i', 'g'], ['j', 'a', 'm']],
    officialVocab: [
      { en: 'name', zh: '名字', kind: 'core' }, { en: 'fine', zh: '很好', kind: 'core' },
      { en: 'fish', zh: '魚', kind: 'phonics' }, { en: 'goat', zh: '山羊', kind: 'phonics' },
      { en: 'hat', zh: '帽子', kind: 'phonics' }, { en: 'igloo', zh: '冰屋', kind: 'phonics' }, { en: 'jam', zh: '果醬', kind: 'phonics' }
    ],
    drillWords: [
      { word: 'fish', phonemes: ['f'], distractors: ['g', 'h', 'j'], meaningZh: '小魚 (Ff)', emoji: '🐟', isLetterDrill: true },
      { word: 'goat', phonemes: ['g'], distractors: ['f', 'j', 'i'], meaningZh: '山羊 (Gg)', emoji: '🐐', isLetterDrill: true },
      { word: 'hat', phonemes: ['h'], distractors: ['f', 'g', 'j'], meaningZh: '帽子 (Hh)', emoji: '🎩', isLetterDrill: true },
      { word: 'igloo', phonemes: ['i'], distractors: ['f', 'g', 'h'], meaningZh: '冰屋 (Ii)', emoji: '🧊', isLetterDrill: true },
      { word: 'jam', phonemes: ['j'], distractors: ['g', 'h', 'f'], meaningZh: '果醬 (Jj)', emoji: '🍯', isLetterDrill: true }
    ]
  },
  {
    id: '1-2', book: '1', unit: '2', titleZh: 'Unit 2 年齡',
    phonicsLabel: 'Kk – Oo',
    targetGraphemes: ['k', 'l', 'm', 'n', 'o'],
    contrastDemoRows: [['m', 'o', 'p'], ['k', 'i', 'd']],
    officialVocab: [
      { en: 'six', zh: '六', kind: 'core' }, { en: 'seven', zh: '七', kind: 'core' }, { en: 'eight', zh: '八', kind: 'core' },
      { en: 'nine', zh: '九', kind: 'core' }, { en: 'ten', zh: '十', kind: 'core' },
      { en: 'kite', zh: '風箏', kind: 'phonics' }, { en: 'lion', zh: '獅子', kind: 'phonics' },
      { en: 'map', zh: '地圖', kind: 'phonics' }, { en: 'nut', zh: '堅果', kind: 'phonics' }, { en: 'octopus', zh: '章魚', kind: 'phonics' }
    ],
    drillWords: [
      { word: 'kite', phonemes: ['k'], distractors: ['l', 'm', 'n'], meaningZh: '風箏 (Kk)', emoji: '🪁', isLetterDrill: true },
      { word: 'lion', phonemes: ['l'], distractors: ['k', 'm', 'n'], meaningZh: '獅子 (Ll)', emoji: '🦁', isLetterDrill: true },
      { word: 'map', phonemes: ['m'], distractors: ['n', 'l', 'o'], meaningZh: '地圖 (Mm)', emoji: '🗺️', isLetterDrill: true },
      { word: 'nut', phonemes: ['n'], distractors: ['m', 'l', 'k'], meaningZh: '堅果 (Nn)', emoji: '🥜', isLetterDrill: true },
      { word: 'octopus', phonemes: ['o'], distractors: ['k', 'm', 'n'], meaningZh: '章魚 (Oo)', emoji: '🐙', isLetterDrill: true }
    ]
  },
  {
    id: '1-3', book: '1', unit: '3', titleZh: 'Unit 3 教室常見物品',
    phonicsLabel: 'Pp – Tt',
    targetGraphemes: ['p', 'qu', 'r', 's', 't'],
    contrastDemoRows: [['p', 'e', 'n'], ['t', 'o', 'p']],
    officialVocab: [
      { en: 'book', zh: '書本' }, { en: 'pen', zh: '原子筆' },
      { en: 'pencil', zh: '鉛筆' }, { en: 'eraser', zh: '橡皮擦' },
      { en: 'ruler', zh: '尺' }, { en: 'marker', zh: '彩色筆' }
    ],
    drillWords: [
      { word: 'pig', phonemes: ['p'], distractors: ['r', 's', 't'], meaningZh: '小豬 (Pp)', emoji: '🐷', isLetterDrill: true },
      { word: 'queen', phonemes: ['qu'], distractors: ['p', 'r', 't'], meaningZh: '皇后 (Qq)', emoji: '👑', isLetterDrill: true },
      { word: 'red', phonemes: ['r'], distractors: ['p', 's', 't'], meaningZh: '紅色 (Rr)', emoji: '🔴', isLetterDrill: true },
      { word: 'sun', phonemes: ['s'], distractors: ['p', 'r', 't'], meaningZh: '太陽 (Ss)', emoji: '☀️', isLetterDrill: true },
      { word: 'top', phonemes: ['t'], distractors: ['p', 'r', 's'], meaningZh: '陀螺 (Tt)', emoji: '🪀', isLetterDrill: true }
    ]
  },
  {
    id: '1-4', book: '1', unit: '4', titleZh: 'Unit 4 顏色',
    phonicsLabel: 'Uu – Zz',
    targetGraphemes: ['u', 'v', 'w', 'x', 'y', 'z'],
    contrastDemoRows: [['b', 'u', 's'], ['z', 'i', 'p']],
    officialVocab: [
      { en: 'blue', zh: '藍色' }, { en: 'green', zh: '綠色' }, { en: 'red', zh: '紅色' },
      { en: 'yellow', zh: '黃色' }, { en: 'black', zh: '黑色' }, { en: 'white', zh: '白色' }
    ],
    drillWords: [
      { word: 'umbrella', phonemes: ['u'], distractors: ['v', 'w', 'z'], meaningZh: '雨傘 (Uu)', emoji: '☂️', isLetterDrill: true },
      { word: 'van', phonemes: ['v'], distractors: ['w', 'u', 'z'], meaningZh: '廂型車 (Vv)', emoji: '🚐', isLetterDrill: true },
      { word: 'web', phonemes: ['w'], distractors: ['v', 'y', 'z'], meaningZh: '蜘蛛網 (Ww)', emoji: '🕸️', isLetterDrill: true },
      { word: 'box', phonemes: ['x'], distractors: ['z', 'v', 'y'], meaningZh: '盒子 (Xx)', emoji: '📦', isLetterDrill: true },
      { word: 'yak', phonemes: ['y'], distractors: ['w', 'v', 'z'], meaningZh: '犛牛 (Yy)', emoji: '🦬', isLetterDrill: true },
      { word: 'zip', phonemes: ['z'], distractors: ['v', 'w', 'x'], meaningZh: '拉鍊 (Zz)', emoji: '🤐', isLetterDrill: true }
    ]
  },

  // ════════════════════════════════════════════════════════════════
  // 第 2 冊 (三下)：短母音 CVC 字族 (-ad/-at ~ -ub/-ut)
  // ════════════════════════════════════════════════════════════════
  {
    id: '2-0', book: '2', unit: '0', titleZh: 'Starter 數字 11–15',
    phonicsLabel: '-ad, -at',
    targetGraphemes: ['a', 'd', 't', 'c', 'b', 'h', 's', 'm'],
    contrastDemoRows: [['s', 'a', 'd'], ['c', 'a', 't']],
    officialVocab: [
      { en: 'eleven', zh: '十一' }, { en: 'twelve', zh: '十二' },
      { en: 'thirteen', zh: '十三' }, { en: 'fourteen', zh: '十四' }, { en: 'fifteen', zh: '十五' }
    ],
    drillWords: [
      { word: 'cat', phonemes: ['c', 'a', 't'], distractors: ['d', 'e', 'b'], meaningZh: '貓咪', emoji: '🐱' },
      { word: 'bat', phonemes: ['b', 'a', 't'], distractors: ['d', 'o', 'p'], meaningZh: '蝙蝠/球棒', emoji: '🦇' },
      { word: 'hat', phonemes: ['h', 'a', 't'], distractors: ['d', 'i', 'm'], meaningZh: '帽子', emoji: '🎩' },
      { word: 'sad', phonemes: ['s', 'a', 'd'], distractors: ['t', 'e', 'm'], meaningZh: '難過的', emoji: '😢' },
      { word: 'dad', phonemes: ['d', 'a', 'd'], distractors: ['t', 'u', 'b'], meaningZh: '爸爸', emoji: '👨' },
      { word: 'mad', phonemes: ['m', 'a', 'd'], distractors: ['t', 'o', 'n'], meaningZh: '生氣的', emoji: '😠' }
    ]
  },
  {
    id: '2-1', book: '2', unit: '1', titleZh: 'Unit 1 寵物',
    phonicsLabel: '-ed, -et',
    targetGraphemes: ['e', 'd', 't', 'b', 'r', 'p', 'n', 'w'],
    contrastDemoRows: [['b', 'e', 'd'], ['p', 'e', 't']],
    officialVocab: [
      { en: 'small', zh: '小的' }, { en: 'big', zh: '大的' },
      { en: 'dog', zh: '狗' }, { en: 'cat', zh: '貓' },
      { en: 'bird', zh: '鳥' }, { en: 'fish', zh: '魚' }
    ],
    drillWords: [
      { word: 'bed', phonemes: ['b', 'e', 'd'], distractors: ['t', 'a', 'p'], meaningZh: '床鋪', emoji: '🛏️' },
      { word: 'red', phonemes: ['r', 'e', 'd'], distractors: ['t', 'i', 'b'], meaningZh: '紅色', emoji: '🔴' },
      { word: 'pet', phonemes: ['p', 'e', 't'], distractors: ['d', 'a', 'n'], meaningZh: '寵物', emoji: '🐾' },
      { word: 'net', phonemes: ['n', 'e', 't'], distractors: ['d', 'o', 'b'], meaningZh: '網子', emoji: '🥅' },
      { word: 'wet', phonemes: ['w', 'e', 't'], distractors: ['d', 'u', 'r'], meaningZh: '濕的', emoji: '💧' },
      { word: 'jet', phonemes: ['j', 'e', 't'], distractors: ['d', 'a', 'p'], meaningZh: '噴射機', emoji: '✈️' }
    ]
  },
  {
    id: '2-2', book: '2', unit: '2', titleZh: 'Unit 2 能力',
    phonicsLabel: '-ig, -ick',
    targetGraphemes: ['i', 'g', 'ck', 'p', 'b', 'd', 'k', 's'],
    contrastDemoRows: [['p', 'i', 'g'], ['k', 'i', 'ck']],
    officialVocab: [
      { en: 'dance', zh: '跳舞' }, { en: 'draw', zh: '畫畫' }, { en: 'jump', zh: '跳躍' },
      { en: 'read', zh: '閱讀' }, { en: 'sing', zh: '唱歌' },
      { en: 'swim', zh: '游泳' }, { en: 'write', zh: '寫字' }
    ],
    drillWords: [
      { word: 'pig', phonemes: ['p', 'i', 'g'], distractors: ['ck', 'e', 'b'], meaningZh: '小豬', emoji: '🐷' },
      { word: 'big', phonemes: ['b', 'i', 'g'], distractors: ['ck', 'a', 'd'], meaningZh: '大的', emoji: '🐘' },
      { word: 'dig', phonemes: ['d', 'i', 'g'], distractors: ['ck', 'o', 'p'], meaningZh: '挖掘', emoji: '⛏️' },
      { word: 'kick', phonemes: ['k', 'i', 'ck'], distractors: ['g', 'e', 's'], meaningZh: '踢', emoji: '⚽' },
      { word: 'sick', phonemes: ['s', 'i', 'ck'], distractors: ['g', 'u', 'p'], meaningZh: '生病的', emoji: '🤒' },
      { word: 'pick', phonemes: ['p', 'i', 'ck'], distractors: ['g', 'a', 'd'], meaningZh: '挑選', emoji: '🤏' }
    ]
  },
  {
    id: '2-3', book: '2', unit: '3', titleZh: 'Unit 3 家人',
    phonicsLabel: '-op, -ot',
    targetGraphemes: ['o', 'p', 't', 'h', 'm', 'c', 'n'],
    contrastDemoRows: [['h', 'o', 'p'], ['h', 'o', 't']],
    officialVocab: [
      { en: 'grandfather', zh: '祖父/外公' }, { en: 'grandmother', zh: '祖母/外婆' },
      { en: 'father', zh: '爸爸' }, { en: 'mother', zh: '媽媽' },
      { en: 'brother', zh: '兄弟' }, { en: 'sister', zh: '姊妹' },
      { en: 'tall', zh: '高的' }, { en: 'short', zh: '矮的' }
    ],
    drillWords: [
      { word: 'hop', phonemes: ['h', 'o', 'p'], distractors: ['t', 'a', 'm'], meaningZh: '單腳跳', emoji: '🐇' },
      { word: 'mop', phonemes: ['m', 'o', 'p'], distractors: ['t', 'u', 'c'], meaningZh: '拖把', emoji: '🧹' },
      { word: 'top', phonemes: ['t', 'o', 'p'], distractors: ['d', 'i', 'h'], meaningZh: '陀螺', emoji: '🪀' },
      { word: 'hot', phonemes: ['h', 'o', 't'], distractors: ['p', 'a', 'n'], meaningZh: '炎熱的', emoji: '🔥' },
      { word: 'pot', phonemes: ['p', 'o', 't'], distractors: ['m', 'e', 'c'], meaningZh: '鍋子', emoji: '🍲' }
    ]
  },
  {
    id: '2-4', book: '2', unit: '4', titleZh: 'Unit 4 職業',
    phonicsLabel: '-ub, -ut',
    targetGraphemes: ['u', 'b', 't', 'c', 'n', 'r', 'h'],
    contrastDemoRows: [['t', 'u', 'b'], ['c', 'u', 't']],
    officialVocab: [
      { en: 'student', zh: '學生' }, { en: 'teacher', zh: '老師' },
      { en: 'doctor', zh: '醫生' }, { en: 'nurse', zh: '護理師' },
      { en: 'cook', zh: '廚師' }, { en: 'driver', zh: '司機' }
    ],
    drillWords: [
      { word: 'tub', phonemes: ['t', 'u', 'b'], distractors: ['c', 'o', 'p'], meaningZh: '浴缸', emoji: '🛁' },
      { word: 'cub', phonemes: ['c', 'u', 'b'], distractors: ['t', 'a', 'r'], meaningZh: '幼獸', emoji: '🐻' },
      { word: 'rub', phonemes: ['r', 'u', 'b'], distractors: ['t', 'e', 'n'], meaningZh: '搓揉', emoji: '🫧' },
      { word: 'cut', phonemes: ['c', 'u', 't'], distractors: ['b', 'o', 'h'], meaningZh: '切/剪', emoji: '✂️' },
      { word: 'nut', phonemes: ['n', 'u', 't'], distractors: ['b', 'i', 'c'], meaningZh: '堅果', emoji: '🥜' },
      { word: 'hut', phonemes: ['h', 'u', 't'], distractors: ['b', 'a', 'n'], meaningZh: '小屋', emoji: '🛖' }
    ]
  },

  // ════════════════════════════════════════════════════════════════
  // 第 3 冊 (四上)：易混淆字首子音對比 (b-/p- ~ z-/s-)
  // ════════════════════════════════════════════════════════════════
  {
    id: '3-0', book: '3', unit: '0', titleZh: 'Starter 數字 16–20',
    phonicsLabel: 'b-, p-',
    targetGraphemes: ['b', 'p', 'a', 'e', 'i', 'o', 'u'],
    contrastDemoRows: [['b', 'a', 't'], ['p', 'a', 't']],
    officialVocab: [
      { en: 'sixteen', zh: '十六' }, { en: 'seventeen', zh: '十七' },
      { en: 'eighteen', zh: '十八' }, { en: 'nineteen', zh: '十九' }, { en: 'twenty', zh: '二十' }
    ],
    drillWords: [
      { word: 'bat', phonemes: ['b', 'a', 't'], distractors: ['p', 'o', 'g'], meaningZh: '球棒/蝙蝠', emoji: '🦇' },
      { word: 'pat', phonemes: ['p', 'a', 't'], distractors: ['b', 'i', 'n'], meaningZh: '輕拍', emoji: '🫳' },
      { word: 'big', phonemes: ['b', 'i', 'g'], distractors: ['p', 'e', 't'], meaningZh: '大的', emoji: '🐘' },
      { word: 'pig', phonemes: ['p', 'i', 'g'], distractors: ['b', 'a', 'd'], meaningZh: '小豬', emoji: '🐷' },
      { word: 'bag', phonemes: ['b', 'a', 'g'], distractors: ['p', 'u', 'n'], meaningZh: '袋子', emoji: '🎒' },
      { word: 'pen', phonemes: ['p', 'e', 'n'], distractors: ['b', 'i', 'g'], meaningZh: '原子筆', emoji: '🖊️' },
      { word: 'box', phonemes: ['b', 'o', 'x'], distractors: ['p', 'u', 't'], meaningZh: '盒子', emoji: '📦' },
      { word: 'pot', phonemes: ['p', 'o', 't'], distractors: ['b', 'e', 'd'], meaningZh: '鍋子', emoji: '🍲' }
    ]
  },
  {
    id: '3-1', book: '3', unit: '1', titleZh: 'Unit 1 天氣',
    phonicsLabel: 'd-, t-',
    targetGraphemes: ['d', 't', 'a', 'e', 'i', 'o', 'u'],
    contrastDemoRows: [['d', 'o', 'g'], ['t', 'o', 'p']],
    officialVocab: [
      { en: 'sunny', zh: '晴朗的' }, { en: 'rainy', zh: '下雨的' },
      { en: 'cloudy', zh: '多雲的' }, { en: 'windy', zh: '有風的' },
      { en: 'hot', zh: '炎熱的' }, { en: 'warm', zh: '溫暖的' },
      { en: 'cool', zh: '涼爽的' }, { en: 'cold', zh: '寒冷的' }
    ],
    drillWords: [
      { word: 'dog', phonemes: ['d', 'o', 'g'], distractors: ['t', 'a', 'p'], meaningZh: '小狗', emoji: '🐶' },
      { word: 'top', phonemes: ['t', 'o', 'p'], distractors: ['d', 'i', 'g'], meaningZh: '陀螺', emoji: '🪀' },
      { word: 'dig', phonemes: ['d', 'i', 'g'], distractors: ['t', 'u', 'b'], meaningZh: '挖掘', emoji: '⛏️' },
      { word: 'tub', phonemes: ['t', 'u', 'b'], distractors: ['d', 'e', 'n'], meaningZh: '浴缸', emoji: '🛁' },
      { word: 'duck', phonemes: ['d', 'u', 'ck'], distractors: ['t', 'a', 'p'], meaningZh: '鴨子', emoji: '🦆' },
      { word: 'ten', phonemes: ['t', 'e', 'n'], distractors: ['d', 'o', 't'], meaningZh: '十', emoji: '🔟' }
    ]
  },
  {
    id: '3-2', book: '3', unit: '2', titleZh: 'Unit 2 感覺',
    phonicsLabel: 'g-, c-',
    targetGraphemes: ['g', 'c', 'a', 'o', 'u'],
    contrastDemoRows: [['g', 'a', 'p'], ['c', 'a', 'p']],
    officialVocab: [
      { en: 'angry', zh: '生氣的' }, { en: 'happy', zh: '快樂的' },
      { en: 'sad', zh: '難過的' }, { en: 'tired', zh: '疲累的' },
      { en: 'hungry', zh: '飢餓的' }, { en: 'thirsty', zh: '口渴的' }, { en: 'full', zh: '飽的' }
    ],
    drillWords: [
      { word: 'gap', phonemes: ['g', 'a', 'p'], distractors: ['c', 'o', 't'], meaningZh: '缺口', emoji: '🕳️' },
      { word: 'cap', phonemes: ['c', 'a', 'p'], distractors: ['g', 'i', 'b'], meaningZh: '便帽', emoji: '🧢' },
      { word: 'gum', phonemes: ['g', 'u', 'm'], distractors: ['c', 'o', 'p'], meaningZh: '口香糖', emoji: '🫧' },
      { word: 'cup', phonemes: ['c', 'u', 'p'], distractors: ['g', 'a', 'm'], meaningZh: '杯子', emoji: '☕' },
      { word: 'cat', phonemes: ['c', 'a', 't'], distractors: ['g', 'o', 'd'], meaningZh: '貓咪', emoji: '🐱' },
      { word: 'gift', phonemes: ['g', 'i', 'ft'], distractors: ['c', 'a', 'nd'], meaningZh: '禮物', emoji: '🎁' }
    ]
  },
  {
    id: '3-3', book: '3', unit: '3', titleZh: 'Unit 3 食物一 (可數)',
    phonicsLabel: 'v-, f-',
    targetGraphemes: ['v', 'f', 'a', 'e', 'i', 'o'],
    contrastDemoRows: [['v', 'a', 'n'], ['f', 'a', 'n']],
    officialVocab: [
      { en: 'apples', zh: '蘋果' }, { en: 'bananas', zh: '香蕉' },
      { en: 'oranges', zh: '柳橙' }, { en: 'watermelons', zh: '西瓜' },
      { en: 'hot dogs', zh: '熱狗' }, { en: 'hamburgers', zh: '漢堡' }, { en: 'sandwiches', zh: '三明治' }
    ],
    drillWords: [
      { word: 'van', phonemes: ['v', 'a', 'n'], distractors: ['f', 'e', 't'], meaningZh: '廂型車', emoji: '🚐' },
      { word: 'fan', phonemes: ['f', 'a', 'n'], distractors: ['v', 'o', 'x'], meaningZh: '電風扇', emoji: '🌀' },
      { word: 'vet', phonemes: ['v', 'e', 't'], distractors: ['f', 'i', 'g'], meaningZh: '獸醫', emoji: '🩺' },
      { word: 'fox', phonemes: ['f', 'o', 'x'], distractors: ['v', 'u', 'n'], meaningZh: '狐狸', emoji: '🦊' },
      { word: 'fish', phonemes: ['f', 'i', 'sh'], distractors: ['v', 'a', 'ch'], meaningZh: '魚', emoji: '🐟' }
    ]
  },
  {
    id: '3-4', book: '3', unit: '4', titleZh: 'Unit 4 食物二 (不可數)',
    phonicsLabel: 'z-, s-',
    targetGraphemes: ['z', 's', 'a', 'e', 'i', 'o', 'u'],
    contrastDemoRows: [['z', 'i', 'p'], ['s', 'i', 'x']],
    officialVocab: [
      { en: 'juice', zh: '果汁' }, { en: 'milk', zh: '牛奶' },
      { en: 'water', zh: '水' }, { en: 'tea', zh: '茶' },
      { en: 'cake', zh: '蛋糕' }, { en: 'pizza', zh: '披薩' },
      { en: 'rice', zh: '米飯' }, { en: 'ice cream', zh: '冰淇淋' }
    ],
    drillWords: [
      { word: 'zip', phonemes: ['z', 'i', 'p'], distractors: ['s', 'a', 't'], meaningZh: '拉鍊', emoji: '🤐' },
      { word: 'zoo', phonemes: ['z', 'oo'], distractors: ['s', 'ee', 'p'], meaningZh: '動物園', emoji: '🦁' },
      { word: 'sun', phonemes: ['s', 'u', 'n'], distractors: ['z', 'a', 'p'], meaningZh: '太陽', emoji: '☀️' },
      { word: 'sock', phonemes: ['s', 'o', 'ck'], distractors: ['z', 'i', 'ng'], meaningZh: '襪子', emoji: '🧦' },
      { word: 'sand', phonemes: ['s', 'a', 'nd'], distractors: ['z', 'e', 'nt'], meaningZh: '沙子', emoji: '🏖️' }
    ]
  },

  // ════════════════════════════════════════════════════════════════
  // 第 4 冊 (四下)：短母音 vs 魔術 e 長母音對照 (-a-/-a_e ~ -u-/-u_e)
  // ════════════════════════════════════════════════════════════════
  {
    id: '4-0', book: '4', unit: '0', titleZh: 'Starter 數字 21–30',
    phonicsLabel: '-a-, -a_e',
    targetGraphemes: ['a', 'a_e', 'c', 'k', 'p', 'm', 'n', 'g', 't'],
    contrastDemoRows: [['c', 'a', 'p'], ['c', 'a_e', 'p']],
    officialVocab: [
      { en: 'twenty-one', zh: '二十一' }, { en: 'twenty-five', zh: '二十五' }, { en: 'thirty', zh: '三十' }
    ],
    drillWords: [
      { word: 'cap', phonemes: ['c', 'a', 'p'], distractors: ['a_e', 'k', 'i'], meaningZh: '便帽 (短a)', emoji: '🧢' },
      { word: 'cape', phonemes: ['c', 'a_e', 'p'], distractors: ['a', 'i_e', 't'], meaningZh: '披風 (長a_e)', emoji: '🦸' },
      { word: 'cake', phonemes: ['c', 'a_e', 'k'], distractors: ['a', 'o_e', 'p'], meaningZh: '蛋糕', emoji: '🎂' },
      { word: 'name', phonemes: ['n', 'a_e', 'm'], distractors: ['a', 'i_e', 'l'], meaningZh: '名字', emoji: '🏷️' },
      { word: 'game', phonemes: ['g', 'a_e', 'm'], distractors: ['a', 'o_e', 'k'], meaningZh: '遊戲', emoji: '🎮' },
      { word: 'lake', phonemes: ['l', 'a_e', 'k'], distractors: ['a', 'u_e', 'm'], meaningZh: '湖泊', emoji: '🏞️' }
    ]
  },
  {
    id: '4-1', book: '4', unit: '1', titleZh: 'Unit 1 時間',
    phonicsLabel: '-e-, -e_e',
    targetGraphemes: ['e', 'e_e', 'b', 'd', 'p', 'n', 'h', 'r', 'th(voiced)', 's'],
    contrastDemoRows: [['b', 'e', 'd'], ['th(voiced)', 'e_e', 's']],
    officialVocab: [
      { en: 'twenty', zh: '二十' }, { en: 'thirty', zh: '三十' },
      { en: 'forty', zh: '四十' }, { en: 'fifty', zh: '五十' },
      { en: 'twenty-five', zh: '二十五' }, { en: 'thirty-five', zh: '三十五' },
      { en: 'forty-five', zh: '四十五' }, { en: 'fifty-five', zh: '五十五' }
    ],
    drillWords: [
      { word: 'bed', phonemes: ['b', 'e', 'd'], distractors: ['e_e', 'a', 'p'], meaningZh: '床鋪 (短e)', emoji: '🛏️' },
      { word: 'pen', phonemes: ['p', 'e', 'n'], distractors: ['e_e', 'i', 't'], meaningZh: '原子筆 (短e)', emoji: '🖊️' },
      { word: 'hen', phonemes: ['h', 'e', 'n'], distractors: ['e_e', 'o', 'b'], meaningZh: '母雞 (短e)', emoji: '🐔' },
      { word: 'these', phonemes: ['th(voiced)', 'e_e', 's'], distractors: ['e', 'i_e', 'ch'], meaningZh: '這些 (長e_e)', emoji: '👉' },
      { word: 'here', phonemes: ['h', 'e_e', 'r'], distractors: ['e', 'a_e', 'n'], meaningZh: '這裡 (長e_e)', emoji: '📍' }
    ]
  },
  {
    id: '4-2', book: '4', unit: '2', titleZh: 'Unit 2 動作',
    phonicsLabel: '-i-, -i_e',
    targetGraphemes: ['i', 'i_e', 'b', 'k', 't', 'l', 'n', 'r', 'd', 'p'],
    contrastDemoRows: [['p', 'i', 'n'], ['l', 'i_e', 'n']],
    officialVocab: [
      { en: 'drinking', zh: '正在喝' }, { en: 'eating', zh: '正在吃' },
      { en: 'reading', zh: '正在讀' }, { en: 'sleeping', zh: '正在睡覺' },
      { en: 'writing', zh: '正在寫' }, { en: 'running', zh: '正在跑' }, { en: 'swimming', zh: '正在游泳' }
    ],
    drillWords: [
      { word: 'pin', phonemes: ['p', 'i', 'n'], distractors: ['i_e', 'e', 't'], meaningZh: '別針 (短i)', emoji: '🧷' },
      { word: 'lip', phonemes: ['l', 'i', 'p'], distractors: ['i_e', 'a', 'd'], meaningZh: '嘴唇 (短i)', emoji: '👄' },
      { word: 'bike', phonemes: ['b', 'i_e', 'k'], distractors: ['i', 'a_e', 'p'], meaningZh: '腳踏車 (長i_e)', emoji: '🚲' },
      { word: 'kite', phonemes: ['k', 'i_e', 't'], distractors: ['i', 'o_e', 'n'], meaningZh: '風箏 (長i_e)', emoji: '🪁' },
      { word: 'time', phonemes: ['t', 'i_e', 'm'], distractors: ['i', 'u_e', 'k'], meaningZh: '時間 (長i_e)', emoji: '⏱️' },
      { word: 'line', phonemes: ['l', 'i_e', 'n'], distractors: ['i', 'e_e', 'r'], meaningZh: '線條 (長i_e)', emoji: '📏' }
    ]
  },
  {
    id: '4-3', book: '4', unit: '3', titleZh: 'Unit 3 屋內空間',
    phonicsLabel: '-o-, -o_e',
    targetGraphemes: ['o', 'o_e', 'r', 'p', 'n', 's', 'h', 'm', 'b', 't'],
    contrastDemoRows: [['h', 'o', 'p'], ['h', 'o_e', 'p']],
    officialVocab: [
      { en: 'bathroom', zh: '浴室' }, { en: 'bedroom', zh: '臥室' },
      { en: 'dining room', zh: '飯廳' }, { en: 'living room', zh: '客廳' },
      { en: 'kitchen', zh: '廚房' }, { en: 'yard', zh: '院子' }
    ],
    drillWords: [
      { word: 'hot', phonemes: ['h', 'o', 't'], distractors: ['o_e', 'a', 'p'], meaningZh: '炎熱的 (短o)', emoji: '🔥' },
      { word: 'box', phonemes: ['b', 'o', 'x'], distractors: ['o_e', 'u', 't'], meaningZh: '盒子 (短o)', emoji: '📦' },
      { word: 'rope', phonemes: ['r', 'o_e', 'p'], distractors: ['o', 'i_e', 'n'], meaningZh: '繩子 (長o_e)', emoji: '🪢' },
      { word: 'nose', phonemes: ['n', 'o_e', 's'], distractors: ['o', 'a_e', 'm'], meaningZh: '鼻子 (長o_e)', emoji: '👃' },
      { word: 'home', phonemes: ['h', 'o_e', 'm'], distractors: ['o', 'u_e', 'r'], meaningZh: '家園 (長o_e)', emoji: '🏡' },
      { word: 'hope', phonemes: ['h', 'o_e', 'p'], distractors: ['o', 'a_e', 's'], meaningZh: '希望 (長o_e)', emoji: '🌟' }
    ]
  },
  {
    id: '4-4', book: '4', unit: '4', titleZh: 'Unit 4 家庭物品',
    phonicsLabel: '-u-, -u_e',
    targetGraphemes: ['u', 'u_e', 'c', 't', 'b', 'p', 's', 'n'],
    contrastDemoRows: [['t', 'u', 'b'], ['t', 'u_e', 'b']],
    officialVocab: [
      { en: 'bag', zh: '袋子' }, { en: 'box', zh: '盒子' },
      { en: 'chair', zh: '椅子' }, { en: 'computer', zh: '電腦' },
      { en: 'desk', zh: '書桌' }, { en: 'table', zh: '餐桌' }
    ],
    drillWords: [
      { word: 'cup', phonemes: ['c', 'u', 'p'], distractors: ['u_e', 'o', 't'], meaningZh: '杯子 (短u)', emoji: '☕' },
      { word: 'sun', phonemes: ['s', 'u', 'n'], distractors: ['u_e', 'a', 'b'], meaningZh: '太陽 (短u)', emoji: '☀️' },
      { word: 'bug', phonemes: ['b', 'u', 'g'], distractors: ['u_e', 'o', 'p'], meaningZh: '昆蟲 (短u)', emoji: '🐛' },
      { word: 'cute', phonemes: ['c', 'u_e', 't'], distractors: ['u', 'o_e', 'p'], meaningZh: '可愛的 (長u_e)', emoji: '🥰' },
      { word: 'tube', phonemes: ['t', 'u_e', 'b'], distractors: ['u', 'i_e', 'n'], meaningZh: '管子 (長u_e)', emoji: '🧪' },
      { word: 'cube', phonemes: ['c', 'u_e', 'b'], distractors: ['u', 'a_e', 't'], meaningZh: '立方體 (長u_e)', emoji: '🧊' }
    ]
  },

  // ════════════════════════════════════════════════════════════════
  // 第 5 冊 (五上)：長母音組家族 (a_e/ai/ay ~ u_e/ue/ui)
  // ════════════════════════════════════════════════════════════════
  {
    id: '5-0', book: '5', unit: '0', titleZh: 'Starter 數字 60–100',
    phonicsLabel: 'a_e, ai, ay',
    targetGraphemes: ['a_e', 'ai', 'ay', 'r', 'n', 'tr', 'pl', 'd', 'c', 'k'],
    contrastDemoRows: [['r', 'ai', 'n'], ['d', 'ay']],
    officialVocab: [
      { en: 'sixty', zh: '六十' }, { en: 'seventy', zh: '七十' },
      { en: 'eighty', zh: '八十' }, { en: 'ninety', zh: '九十' }, { en: 'one hundred', zh: '一百' }
    ],
    drillWords: [
      { word: 'cake', phonemes: ['c', 'a_e', 'k'], distractors: ['ai', 'ay', 'm'], meaningZh: '蛋糕', emoji: '🎂' },
      { word: 'rain', phonemes: ['r', 'ai', 'n'], distractors: ['ay', 'ee', 't'], meaningZh: '下雨', emoji: '🌧️' },
      { word: 'train', phonemes: ['tr', 'ai', 'n'], distractors: ['ay', 'pl', 'm'], meaningZh: '火車', emoji: '🚆' },
      { word: 'day', phonemes: ['d', 'ay'], distractors: ['ai', 'ea', 't'], meaningZh: '白天', emoji: '☀️' },
      { word: 'play', phonemes: ['pl', 'ay'], distractors: ['ai', 'tr', 's'], meaningZh: '玩耍', emoji: '🎮' }
    ]
  },
  {
    id: '5-1', book: '5', unit: '1', titleZh: 'Unit 1 星期',
    phonicsLabel: 'e_e, ee, ea',
    targetGraphemes: ['e_e', 'ee', 'ea', 'b', 'tr', 's', 'l', 'f', 't', 'r', 'd'],
    contrastDemoRows: [['s', 'ee'], ['s', 'ea']],
    officialVocab: [
      { en: 'Sunday', zh: '星期日' }, { en: 'Monday', zh: '星期一' },
      { en: 'Tuesday', zh: '星期二' }, { en: 'Wednesday', zh: '星期三' },
      { en: 'Thursday', zh: '星期四' }, { en: 'Friday', zh: '星期五' }, { en: 'Saturday', zh: '星期六' }
    ],
    drillWords: [
      { word: 'bee', phonemes: ['b', 'ee'], distractors: ['ea', 'ai', 'p'], meaningZh: '蜜蜂', emoji: '🐝' },
      { word: 'tree', phonemes: ['tr', 'ee'], distractors: ['ea', 'dr', 'oa'], meaningZh: '樹木', emoji: '🌳' },
      { word: 'see', phonemes: ['s', 'ee'], distractors: ['ea', 'ay', 'z'], meaningZh: '看見', emoji: '👀' },
      { word: 'leaf', phonemes: ['l', 'ea', 'f'], distractors: ['ee', 'oa', 'v'], meaningZh: '樹葉', emoji: '🍃' },
      { word: 'tea', phonemes: ['t', 'ea'], distractors: ['ee', 'ai', 'd'], meaningZh: '茶水', emoji: '🍵' },
      { word: 'read', phonemes: ['r', 'ea', 'd'], distractors: ['ee', 'ai', 't'], meaningZh: '閱讀', emoji: '📖' }
    ]
  },
  {
    id: '5-2', book: '5', unit: '2', titleZh: 'Unit 2 科目',
    phonicsLabel: 'i_e, ie, y',
    targetGraphemes: ['i_e', 'ie', 'y(i)', 'b', 'k', 'p', 't', 'cr', 'fl', 'sk'],
    contrastDemoRows: [['p', 'ie'], ['sk', 'y(i)']],
    officialVocab: [
      { en: 'art', zh: '美術' }, { en: 'Chinese', zh: '國語' },
      { en: 'English', zh: '英語' }, { en: 'math', zh: '數學' },
      { en: 'music', zh: '音樂' }, { en: 'PE', zh: '體育' },
      { en: 'science', zh: '自然' }, { en: 'social studies', zh: '社會' }
    ],
    drillWords: [
      { word: 'bike', phonemes: ['b', 'i_e', 'k'], distractors: ['ie', 'y(i)', 't'], meaningZh: '腳踏車', emoji: '🚲' },
      { word: 'kite', phonemes: ['k', 'i_e', 't'], distractors: ['ie', 'a_e', 'p'], meaningZh: '風箏', emoji: '🪁' },
      { word: 'pie', phonemes: ['p', 'ie'], distractors: ['y(i)', 'ee', 'b'], meaningZh: '派', emoji: '🥧' },
      { word: 'tie', phonemes: ['t', 'ie'], distractors: ['y(i)', 'ai', 'd'], meaningZh: '領帶', emoji: '👔' },
      { word: 'fly', phonemes: ['fl', 'y(i)'], distractors: ['ie', 'cr', 'ee'], meaningZh: '飛翔', emoji: '🦋' },
      { word: 'sky', phonemes: ['sk', 'y(i)'], distractors: ['ie', 'sp', 'ay'], meaningZh: '天空', emoji: '🌌' },
      { word: 'cry', phonemes: ['cr', 'y(i)'], distractors: ['ie', 'fl', 'oa'], meaningZh: '哭泣', emoji: '😭' }
    ]
  },
  {
    id: '5-3', book: '5', unit: '3', titleZh: 'Unit 3 社區場所',
    phonicsLabel: 'o_e, oa, ow',
    targetGraphemes: ['o_e', 'oa', 'ow', 'b', 'g', 'c', 't', 'sn', 'r', 'p'],
    contrastDemoRows: [['b', 'oa', 't'], ['sn', 'ow']],
    officialVocab: [
      { en: 'bank', zh: '銀行' }, { en: 'bookstore', zh: '書店' },
      { en: 'hospital', zh: '醫院' }, { en: 'library', zh: '圖書館' },
      { en: 'museum', zh: '博物館' }, { en: 'park', zh: '公園' },
      { en: 'post office', zh: '郵局' }, { en: 'supermarket', zh: '超市' }
    ],
    drillWords: [
      { word: 'boat', phonemes: ['b', 'oa', 't'], distractors: ['ow', 'ee', 'p'], meaningZh: '小船', emoji: '⛵' },
      { word: 'goat', phonemes: ['g', 'oa', 't'], distractors: ['ow', 'ai', 'c'], meaningZh: '山羊', emoji: '🐐' },
      { word: 'coat', phonemes: ['c', 'oa', 't'], distractors: ['ow', 'ea', 'g'], meaningZh: '外套', emoji: '🧥' },
      { word: 'snow', phonemes: ['sn', 'ow'], distractors: ['oa', 'st', 'oo'], meaningZh: '白雪', emoji: '❄️' },
      { word: 'rope', phonemes: ['r', 'o_e', 'p'], distractors: ['oa', 'ow', 'b'], meaningZh: '繩子', emoji: '🪢' },
      { word: 'home', phonemes: ['h', 'o_e', 'm'], distractors: ['oa', 'ow', 'n'], meaningZh: '家園', emoji: '🏡' }
    ]
  },
  {
    id: '5-4', book: '5', unit: '4', titleZh: 'Unit 4 動物',
    phonicsLabel: 'u_e, ue, ui',
    targetGraphemes: ['u_e', 'ue', 'ui', 'bl', 'gl', 'tr', 'fr', 's', 't', 'c'],
    contrastDemoRows: [['bl', 'ue'], ['fr', 'ui', 't']],
    officialVocab: [
      { en: 'elephant', zh: '大象' }, { en: 'horse', zh: '馬' },
      { en: 'lion', zh: '獅子' }, { en: 'monkey', zh: '猴子' },
      { en: 'tiger', zh: '老虎' }, { en: 'turtle', zh: '烏龜' },
      { en: 'zebra', zh: '斑馬' }, { en: 'koala', zh: '無尾熊' }
    ],
    drillWords: [
      { word: 'blue', phonemes: ['bl', 'ue'], distractors: ['ui', 'gl', 'oa'], meaningZh: '藍色', emoji: '🔵' },
      { word: 'glue', phonemes: ['gl', 'ue'], distractors: ['ui', 'bl', 'ee'], meaningZh: '膠水', emoji: '🧴' },
      { word: 'true', phonemes: ['tr', 'ue'], distractors: ['ui', 'cr', 'ai'], meaningZh: '真實的', emoji: '✅' },
      { word: 'fruit', phonemes: ['fr', 'ui', 't'], distractors: ['ue', 'fl', 'p'], meaningZh: '水果', emoji: '🍓' },
      { word: 'suit', phonemes: ['s', 'ui', 't'], distractors: ['ue', 'z', 'oa'], meaningZh: '套裝', emoji: '🤵' },
      { word: 'tube', phonemes: ['t', 'u_e', 'b'], distractors: ['ue', 'ui', 'c'], meaningZh: '試管', emoji: '🧪' }
    ]
  },

  // ════════════════════════════════════════════════════════════════
  // 第 6 冊 (五下)：二合子音與鼻音家族 (ng/nk ~ ch/sh)
  // ════════════════════════════════════════════════════════════════
  {
    id: '6-0', book: '6', unit: '0', titleZh: 'Starter 數字 100–1000',
    phonicsLabel: 'ng, nk',
    targetGraphemes: ['ng', 'nk', 'r', 'k', 's', 'w', 'l', 'p', 'b', 'i', 'o', 'a'],
    contrastDemoRows: [['s', 'i', 'ng'], ['s', 'i', 'nk']],
    officialVocab: [
      { en: 'one hundred', zh: '一百' }, { en: 'two hundred', zh: '兩百' },
      { en: 'five hundred', zh: '五百' }, { en: 'one thousand', zh: '一千' }
    ],
    drillWords: [
      { word: 'ring', phonemes: ['r', 'i', 'ng'], distractors: ['nk', 'e', 'k'], meaningZh: '戒指', emoji: '💍' },
      { word: 'king', phonemes: ['k', 'i', 'ng'], distractors: ['nk', 'a', 'r'], meaningZh: '國王', emoji: '👑' },
      { word: 'sing', phonemes: ['s', 'i', 'ng'], distractors: ['nk', 'u', 'w'], meaningZh: '唱歌', emoji: '🎤' },
      { word: 'pink', phonemes: ['p', 'i', 'nk'], distractors: ['ng', 'a', 'b'], meaningZh: '粉紅色', emoji: '🌸' },
      { word: 'sink', phonemes: ['s', 'i', 'nk'], distractors: ['ng', 'o', 'r'], meaningZh: '水槽', emoji: '🚰' },
      { word: 'bank', phonemes: ['b', 'a', 'nk'], distractors: ['ng', 'i', 'p'], meaningZh: '銀行', emoji: '🏦' }
    ]
  },
  {
    id: '6-1', book: '6', unit: '1', titleZh: 'Unit 1 身體部位',
    phonicsLabel: 'wh, ph',
    targetGraphemes: ['wh', 'ph', 'a_e', 'i_e', 'o_e', 'ee', 'l', 't', 'n'],
    contrastDemoRows: [['wh', 'a_e', 'l'], ['ph', 'o_e', 'n']],
    officialVocab: [
      { en: 'eyes', zh: '眼睛' }, { en: 'ears', zh: '耳朵' },
      { en: 'nose', zh: '鼻子' }, { en: 'mouth', zh: '嘴巴' },
      { en: 'hands', zh: '手' }, { en: 'arms', zh: '手臂' },
      { en: 'legs', zh: '腿' }, { en: 'foot', zh: '腳' }, { en: 'feet', zh: '雙腳' }
    ],
    drillWords: [
      { word: 'whale', phonemes: ['wh', 'a_e', 'l'], distractors: ['ph', 'w', 'i_e'], meaningZh: '鯨魚', emoji: '🐳' },
      { word: 'white', phonemes: ['wh', 'i_e', 't'], distractors: ['ph', 'a_e', 'l'], meaningZh: '白色', emoji: '⬜' },
      { word: 'wheel', phonemes: ['wh', 'ee', 'l'], distractors: ['ph', 'ea', 't'], meaningZh: '輪子', emoji: '🛞' },
      { word: 'phone', phonemes: ['ph', 'o_e', 'n'], distractors: ['wh', 'f', 'a_e'], meaningZh: '電話', emoji: '📱' }
    ]
  },
  {
    id: '6-2', book: '6', unit: '2', titleZh: 'Unit 2 病症',
    phonicsLabel: 'th(無聲), th(有聲)',
    targetGraphemes: ['th(unvoiced)', 'th(voiced)', 'i', 'a', 'e', 'n', 'm', 'b', 'p'],
    contrastDemoRows: [['th(unvoiced)', 'i', 'n'], ['th(voiced)', 'i', 's']],
    officialVocab: [
      { en: 'cold', zh: '感冒' }, { en: 'fever', zh: '發燒' },
      { en: 'runny nose', zh: '流鼻水' }, { en: 'sore throat', zh: '喉嚨痛' },
      { en: 'headache', zh: '頭痛' }, { en: 'toothache', zh: '牙痛' }, { en: 'stomachache', zh: '胃痛' }
    ],
    drillWords: [
      { word: 'thin', phonemes: ['th(unvoiced)', 'i', 'n'], distractors: ['th(voiced)', 'sh', 'a'], meaningZh: '纖細的 (無聲th)', emoji: '🪡' },
      { word: 'bath', phonemes: ['b', 'a', 'th(unvoiced)'], distractors: ['th(voiced)', 'sh', 'e'], meaningZh: '洗澡 (無聲th)', emoji: '🛁' },
      { word: 'math', phonemes: ['m', 'a', 'th(unvoiced)'], distractors: ['th(voiced)', 'ch', 'o'], meaningZh: '數學 (無聲th)', emoji: '➗' },
      { word: 'this', phonemes: ['th(voiced)', 'i', 's'], distractors: ['th(unvoiced)', 'd', 'a'], meaningZh: '這個 (有聲th)', emoji: '👇' },
      { word: 'that', phonemes: ['th(voiced)', 'a', 't'], distractors: ['th(unvoiced)', 'd', 'i'], meaningZh: '那個 (有聲th)', emoji: '👉' },
      { word: 'them', phonemes: ['th(voiced)', 'e', 'm'], distractors: ['th(unvoiced)', 'ch', 'n'], meaningZh: '他們 (有聲th)', emoji: '👥' }
    ]
  },
  {
    id: '6-3', book: '6', unit: '3', titleZh: 'Unit 3 三餐與食物',
    phonicsLabel: 'ch, sh',
    targetGraphemes: ['ch', 'sh', 'i', 'o', 'a', 'p', 'n', 'f', 'd', 'r'],
    contrastDemoRows: [['ch', 'i', 'p'], ['sh', 'i', 'p']],
    officialVocab: [
      { en: 'breakfast', zh: '早餐' }, { en: 'lunch', zh: '午餐' },
      { en: 'dinner', zh: '晚餐' }, { en: 'bread', zh: '麵包' },
      { en: 'chicken', zh: '雞肉' }, { en: 'salad', zh: '沙拉' },
      { en: 'soup', zh: '湯' }, { en: 'noodles', zh: '麵' }
    ],
    drillWords: [
      { word: 'chip', phonemes: ['ch', 'i', 'p'], distractors: ['sh', 'a', 'n'], meaningZh: '洋芋片', emoji: '🍟' },
      { word: 'ship', phonemes: ['sh', 'i', 'p'], distractors: ['ch', 'o', 'b'], meaningZh: '輪船', emoji: '🚢' },
      { word: 'chin', phonemes: ['ch', 'i', 'n'], distractors: ['sh', 'e', 'm'], meaningZh: '下巴', emoji: '🧔' },
      { word: 'chop', phonemes: ['ch', 'o', 'p'], distractors: ['sh', 'a', 'n'], meaningZh: '切/砍', emoji: '🪓' },
      { word: 'shop', phonemes: ['sh', 'o', 'p'], distractors: ['ch', 'u', 't'], meaningZh: '商店', emoji: '🏪' },
      { word: 'fish', phonemes: ['f', 'i', 'sh'], distractors: ['ch', 'a', 'ck'], meaningZh: '魚', emoji: '🐟' },
      { word: 'dish', phonemes: ['d', 'i', 'sh'], distractors: ['ch', 'o', 'p'], meaningZh: '盤子', emoji: '🍽️' }
    ]
  },
  {
    id: '6-4', book: '6', unit: '4', titleZh: 'Unit 4 隨身物品',
    phonicsLabel: 'th, wh, ph, ch, sh 總複習',
    targetGraphemes: ['th(unvoiced)', 'th(voiced)', 'wh', 'ph', 'ch', 'sh'],
    contrastDemoRows: [['sh', 'o', 'p'], ['ch', 'o', 'p']],
    officialVocab: [
      { en: 'backpack', zh: '後背包' }, { en: 'cap', zh: '鴨舌帽' },
      { en: 'lunchbox', zh: '便當盒' }, { en: 'umbrella', zh: '雨傘' },
      { en: 'water bottle', zh: '水壺' }, { en: 'workbook', zh: '習作' },
      { en: 'glasses', zh: '眼鏡' }, { en: 'shoes', zh: '鞋子' }
    ],
    drillWords: [
      { word: 'ship', phonemes: ['sh', 'i', 'p'], distractors: ['ch', 'wh', 'a'], meaningZh: '輪船', emoji: '🚢' },
      { word: 'chip', phonemes: ['ch', 'i', 'p'], distractors: ['sh', 'ph', 'o'], meaningZh: '洋芋片', emoji: '🍟' },
      { word: 'thin', phonemes: ['th(unvoiced)', 'i', 'n'], distractors: ['sh', 'wh', 'a'], meaningZh: '纖細的', emoji: '🪡' },
      { word: 'this', phonemes: ['th(voiced)', 'i', 's'], distractors: ['th(unvoiced)', 'ch', 'e'], meaningZh: '這個', emoji: '👇' },
      { word: 'whale', phonemes: ['wh', 'a_e', 'l'], distractors: ['ph', 'sh', 'i_e'], meaningZh: '鯨魚', emoji: '🐳' },
      { word: 'phone', phonemes: ['ph', 'o_e', 'n'], distractors: ['wh', 'ch', 'a_e'], meaningZh: '電話', emoji: '📱' }
    ]
  },

  // ════════════════════════════════════════════════════════════════
  // 第 7 冊 (六上)：R-controlled 捲舌音 & 雙母音滑音 (-er/-or ~ ou/ow)
  // ════════════════════════════════════════════════════════════════
  {
    id: '7-0', book: '7', unit: '0', titleZh: 'Starter 複習與餐點',
    phonicsLabel: '-er, -or',
    targetGraphemes: ['er', 'or', 'h', 'f', 'n', 'c', 'k', 'b'],
    contrastDemoRows: [['f', 'er', 'n'], ['c', 'or', 'n']],
    officialVocab: [
      { en: 'sandwich', zh: '三明治' }, { en: 'soda', zh: '汽水' }, { en: 'chair', zh: '椅子' }
    ],
    drillWords: [
      { word: 'her', phonemes: ['h', 'er'], distractors: ['or', 'ar', 's'], meaningZh: '她的', emoji: '👩' },
      { word: 'fern', phonemes: ['f', 'er', 'n'], distractors: ['or', 'ar', 'k'], meaningZh: '蕨類', emoji: '🌿' },
      { word: 'corn', phonemes: ['c', 'or', 'n'], distractors: ['er', 'ar', 'b'], meaningZh: '玉米', emoji: '🌽' },
      { word: 'fork', phonemes: ['f', 'or', 'k'], distractors: ['er', 'ir', 'n'], meaningZh: '叉子', emoji: '🍴' },
      { word: 'horn', phonemes: ['h', 'or', 'n'], distractors: ['er', 'ur', 'k'], meaningZh: '號角', emoji: '📯' }
    ]
  },
  {
    id: '7-1', book: '7', unit: '1', titleZh: 'Unit 1 國家',
    phonicsLabel: 'ir, ur',
    targetGraphemes: ['ir', 'ur', 'b', 'd', 'g', 'l', 's', 'f', 't', 'n'],
    contrastDemoRows: [['b', 'ir', 'd'], ['s', 'ur', 'f']],
    officialVocab: [
      { en: 'Australia', zh: '澳洲' }, { en: 'India', zh: '印度' },
      { en: 'Japan', zh: '日本' }, { en: 'Singapore', zh: '新加坡' },
      { en: 'Spain', zh: '西班牙' }, { en: 'Taiwan', zh: '臺灣' },
      { en: 'the UK', zh: '英國' }, { en: 'the USA', zh: '美國' }
    ],
    drillWords: [
      { word: 'bird', phonemes: ['b', 'ir', 'd'], distractors: ['ar', 'or', 't'], meaningZh: '小鳥', emoji: '🐦' },
      { word: 'girl', phonemes: ['g', 'ir', 'l'], distractors: ['or', 'ar', 'd'], meaningZh: '女孩', emoji: '👧' },
      { word: 'surf', phonemes: ['s', 'ur', 'f'], distractors: ['ar', 'or', 't'], meaningZh: '衝浪', emoji: '🏄' },
      { word: 'turn', phonemes: ['t', 'ur', 'n'], distractors: ['or', 'ar', 'l'], meaningZh: '轉彎', emoji: '↪️' }
    ]
  },
  {
    id: '7-2', book: '7', unit: '2', titleZh: 'Unit 2 交通工具',
    phonicsLabel: 'ar, or',
    targetGraphemes: ['ar', 'or', 'c', 'p', 'k', 'f', 'm', 'st', 'n'],
    contrastDemoRows: [['c', 'ar'], ['c', 'or', 'n']],
    officialVocab: [
      { en: 'by bike', zh: '騎腳踏車' }, { en: 'by bus', zh: '搭公車' },
      { en: 'by car', zh: '搭汽車' }, { en: 'by scooter', zh: '騎機車' },
      { en: 'by metro', zh: '搭捷運' }, { en: 'by taxi', zh: '搭計程車' },
      { en: 'by train', zh: '搭火車' }, { en: 'on foot', zh: '走路' }
    ],
    drillWords: [
      { word: 'car', phonemes: ['c', 'ar'], distractors: ['or', 'ir', 'k'], meaningZh: '汽車', emoji: '🚗' },
      { word: 'park', phonemes: ['p', 'ar', 'k'], distractors: ['or', 'er', 'm'], meaningZh: '公園', emoji: '🏞️' },
      { word: 'farm', phonemes: ['f', 'ar', 'm'], distractors: ['or', 'ur', 'k'], meaningZh: '農場', emoji: '🚜' },
      { word: 'star', phonemes: ['st', 'ar'], distractors: ['or', 'sp', 'ir'], meaningZh: '星星', emoji: '⭐' },
      { word: 'corn', phonemes: ['c', 'or', 'n'], distractors: ['ar', 'er', 'k'], meaningZh: '玉米', emoji: '🌽' },
      { word: 'fork', phonemes: ['f', 'or', 'k'], distractors: ['ar', 'ur', 'n'], meaningZh: '叉子', emoji: '🍴' }
    ]
  },
  {
    id: '7-3', book: '7', unit: '3', titleZh: 'Unit 3 日常活動',
    phonicsLabel: 'oi, oy',
    targetGraphemes: ['oi', 'oy', 'c', 'n', 's', 'l', 'b', 't', 'j'],
    contrastDemoRows: [['c', 'oi', 'n'], ['t', 'oy']],
    officialVocab: [
      { en: 'go jogging', zh: '去慢跑' }, { en: 'listen to music', zh: '聽音樂' },
      { en: 'play baseball', zh: '打棒球' }, { en: 'play basketball', zh: '打籃球' },
      { en: 'ride a bike', zh: '騎腳踏車' }, { en: 'study English', zh: '讀英語' },
      { en: 'surf the Internet', zh: '上網' }, { en: 'watch TV', zh: '看電視' }
    ],
    drillWords: [
      { word: 'coin', phonemes: ['c', 'oi', 'n'], distractors: ['oy', 'ou', 't'], meaningZh: '硬幣', emoji: '🪙' },
      { word: 'soil', phonemes: ['s', 'oi', 'l'], distractors: ['oy', 'oa', 'b'], meaningZh: '泥土', emoji: '🪴' },
      { word: 'boil', phonemes: ['b', 'oi', 'l'], distractors: ['oy', 'ai', 'n'], meaningZh: '煮沸', emoji: '♨️' },
      { word: 'toy', phonemes: ['t', 'oy'], distractors: ['oi', 'ay', 'b'], meaningZh: '玩具', emoji: '🧸' },
      { word: 'boy', phonemes: ['b', 'oy'], distractors: ['oi', 'ow', 't'], meaningZh: '男孩', emoji: '👦' },
      { word: 'joy', phonemes: ['j', 'oy'], distractors: ['oi', 'ay', 's'], meaningZh: '喜悅', emoji: '😄' }
    ]
  },
  {
    id: '7-4', book: '7', unit: '4', titleZh: 'Unit 4 生活作息',
    phonicsLabel: 'ou, ow',
    targetGraphemes: ['ou', 'ow(au)', 'l', 'd', 'sh', 't', 'cl', 'c', 'n'],
    contrastDemoRows: [['cl', 'ou', 'd'], ['c', 'ow(au)']],
    officialVocab: [
      { en: 'get up', zh: '起床' }, { en: 'go to school', zh: '去上學' },
      { en: 'have lunch', zh: '吃午餐' }, { en: 'go home', zh: '回家' },
      { en: 'do my homework', zh: '做功課' }, { en: 'take a shower', zh: '淋浴' }, { en: 'go to bed', zh: '上床睡覺' }
    ],
    drillWords: [
      { word: 'loud', phonemes: ['l', 'ou', 'd'], distractors: ['ow(au)', 'oo', 't'], meaningZh: '大聲的', emoji: '📢' },
      { word: 'shout', phonemes: ['sh', 'ou', 't'], distractors: ['ow(au)', 'ch', 'd'], meaningZh: '大喊', emoji: '🗣️' },
      { word: 'cloud', phonemes: ['cl', 'ou', 'd'], distractors: ['ow(au)', 'bl', 't'], meaningZh: '白雲', emoji: '☁️' },
      { word: 'cow', phonemes: ['c', 'ow(au)'], distractors: ['ou', 'aw', 'n'], meaningZh: '乳牛', emoji: '🐮' },
      { word: 'now', phonemes: ['n', 'ow(au)'], distractors: ['ou', 'oy', 'd'], meaningZh: '現在', emoji: '⏰' },
      { word: 'down', phonemes: ['d', 'ow(au)', 'n'], distractors: ['ou', 'oa', 't'], meaningZh: '向下', emoji: '⬇️' }
    ]
  },

  // ════════════════════════════════════════════════════════════════
  // 第 8 冊 (六下)：複合子音群組 + 短長母音總複習 (pl/bl ~ 長母音)
  // ════════════════════════════════════════════════════════════════
  {
    id: '8-0', book: '8', unit: '0', titleZh: 'Starter 休閒總複習',
    phonicsLabel: 'pl, bl, cl, gl',
    targetGraphemes: ['pl', 'bl', 'cl', 'gl', 'ay', 'ue', 'ck', 'a_e', 'ou', 'd'],
    contrastDemoRows: [['pl', 'ay'], ['bl', 'ue']],
    officialVocab: [
      { en: 'free time', zh: '空閒時間' }, { en: 'go jogging', zh: '去慢跑' }
    ],
    drillWords: [
      { word: 'play', phonemes: ['pl', 'ay'], distractors: ['bl', 'cl', 'ai'], meaningZh: '玩耍', emoji: '🎮' },
      { word: 'plane', phonemes: ['pl', 'a_e', 'n'], distractors: ['bl', 'gl', 'i_e'], meaningZh: '飛機', emoji: '✈️' },
      { word: 'blue', phonemes: ['bl', 'ue'], distractors: ['pl', 'gl', 'ui'], meaningZh: '藍色', emoji: '🔵' },
      { word: 'cloud', phonemes: ['cl', 'ou', 'd'], distractors: ['gl', 'bl', 'ow(au)'], meaningZh: '白雲', emoji: '☁️' },
      { word: 'clock', phonemes: ['cl', 'o', 'ck'], distractors: ['gl', 'pl', 'a'], meaningZh: '時鐘', emoji: '⏰' },
      { word: 'glue', phonemes: ['gl', 'ue'], distractors: ['bl', 'cl', 'ui'], meaningZh: '膠水', emoji: '🧴' }
    ]
  },
  {
    id: '8-1', book: '8', unit: '1', titleZh: 'Unit 1 過去地點',
    phonicsLabel: 'cr, gr, tr, dr',
    targetGraphemes: ['cr', 'gr', 'tr', 'dr', 'a', 'b', 'ee', 'ai', 'n', 'u', 'm', 'aw'],
    contrastDemoRows: [['cr', 'a', 'b'], ['dr', 'u', 'm']],
    officialVocab: [
      { en: 'at home', zh: '在家' }, { en: 'at school', zh: '在學校' },
      { en: 'at the mall', zh: '在購物中心' }, { en: 'at the movie theater', zh: '在電影院' },
      { en: 'at the restaurant', zh: '在餐廳' }, { en: 'at the zoo', zh: '在動物園' }
    ],
    drillWords: [
      { word: 'crab', phonemes: ['cr', 'a', 'b'], distractors: ['gr', 'dr', 'p'], meaningZh: '螃蟹', emoji: '🦀' },
      { word: 'cry', phonemes: ['cr', 'y(i)'], distractors: ['tr', 'dr', 'ie'], meaningZh: '哭泣', emoji: '😭' },
      { word: 'tree', phonemes: ['tr', 'ee'], distractors: ['dr', 'cr', 'ea'], meaningZh: '樹木', emoji: '🌳' },
      { word: 'train', phonemes: ['tr', 'ai', 'n'], distractors: ['gr', 'dr', 'ay'], meaningZh: '火車', emoji: '🚆' },
      { word: 'drum', phonemes: ['dr', 'u', 'm'], distractors: ['tr', 'cr', 'o'], meaningZh: '打鼓', emoji: '🥁' },
      { word: 'draw', phonemes: ['dr', 'aw'], distractors: ['gr', 'cr', 'oo'], meaningZh: '畫圖', emoji: '🎨' }
    ]
  },
  {
    id: '8-2', book: '8', unit: '2', titleZh: 'Unit 2 過去活動',
    phonicsLabel: 'sw, sp, st, sk',
    targetGraphemes: ['sw', 'sp', 'st', 'sk', 'a', 'i', 'm', 'n', 'ar', 'oo', 'y(i)'],
    contrastDemoRows: [['st', 'ar'], ['sp', 'oo', 'n']],
    officialVocab: [
      { en: 'cleaned my room', zh: '打掃房間' }, { en: 'listened to music', zh: '聽音樂' },
      { en: 'played basketball', zh: '打籃球' }, { en: 'walked the dog', zh: '遛狗' },
      { en: 'watched videos', zh: '看影片' }, { en: 'visited a friend', zh: '拜訪朋友' }
    ],
    drillWords: [
      { word: 'swan', phonemes: ['sw', 'a', 'n'], distractors: ['sp', 'st', 'o'], meaningZh: '天鵝', emoji: '🦢' },
      { word: 'swim', phonemes: ['sw', 'i', 'm'], distractors: ['sk', 'st', 'e'], meaningZh: '游泳', emoji: '🏊' },
      { word: 'spoon', phonemes: ['sp', 'oo', 'n'], distractors: ['st', 'sk', 'ou'], meaningZh: '湯匙', emoji: '🥄' },
      { word: 'star', phonemes: ['st', 'ar'], distractors: ['sp', 'sw', 'or'], meaningZh: '星星', emoji: '⭐' },
      { word: 'stop', phonemes: ['st', 'o', 'p'], distractors: ['sk', 'sp', 'a'], meaningZh: '停止', emoji: '🛑' },
      { word: 'sky', phonemes: ['sk', 'y(i)'], distractors: ['st', 'sw', 'ie'], meaningZh: '天空', emoji: '🌌' }
    ]
  },
  {
    id: '8-3', book: '8', unit: '3', titleZh: 'Unit 3 衣物',
    phonicsLabel: '短母音 a, e, i, o, u',
    targetGraphemes: ['a', 'e', 'i', 'o', 'u'],
    contrastDemoRows: [['h', 'a', 't'], ['h', 'o', 't']],
    officialVocab: [
      { en: 'coat', zh: '外套' }, { en: 'dress', zh: '洋裝' },
      { en: 'hat', zh: '帽子' }, { en: 'jacket', zh: '夾克' },
      { en: 'skirt', zh: '裙子' }, { en: 'T-shirt', zh: 'T 恤' },
      { en: 'jeans', zh: '牛仔褲' }, { en: 'pants', zh: '長褲' }, { en: 'shorts', zh: '短褲' }
    ],
    drillWords: [
      { word: 'hat', phonemes: ['h', 'a', 't'], distractors: ['e', 'o', 'u'], meaningZh: '帽子 (短a)', emoji: '🎩' },
      { word: 'bed', phonemes: ['b', 'e', 'd'], distractors: ['a', 'i', 'u'], meaningZh: '床鋪 (短e)', emoji: '🛏️' },
      { word: 'pig', phonemes: ['p', 'i', 'g'], distractors: ['e', 'a', 'o'], meaningZh: '小豬 (短i)', emoji: '🐷' },
      { word: 'hot', phonemes: ['h', 'o', 't'], distractors: ['a', 'u', 'i'], meaningZh: '炎熱的 (短o)', emoji: '🔥' },
      { word: 'cup', phonemes: ['c', 'u', 'p'], distractors: ['o', 'a', 'e'], meaningZh: '杯子 (短u)', emoji: '☕' }
    ]
  },
  {
    id: '8-4', book: '8', unit: '4', titleZh: 'Unit 4 季節與氣候',
    phonicsLabel: '長母音 a, e, i, o, u',
    targetGraphemes: ['a_e', 'e_e', 'i_e', 'o_e', 'u_e', 'ai', 'ee', 'oa', 'ue'],
    contrastDemoRows: [['c', 'a_e', 'k'], ['b', 'i_e', 'k']],
    officialVocab: [
      { en: 'spring', zh: '春天' }, { en: 'summer', zh: '夏天' },
      { en: 'fall', zh: '秋天' }, { en: 'winter', zh: '冬天' },
      { en: 'dry', zh: '乾燥的' }, { en: 'wet', zh: '潮濕的' },
      { en: 'foggy', zh: '起霧的' }, { en: 'snowy', zh: '下雪的' }
    ],
    drillWords: [
      { word: 'cake', phonemes: ['c', 'a_e', 'k'], distractors: ['i_e', 'o_e', 'a'], meaningZh: '蛋糕 (長a)', emoji: '🎂' },
      { word: 'tree', phonemes: ['tr', 'ee'], distractors: ['ai', 'oa', 'e'], meaningZh: '樹木 (長e)', emoji: '🌳' },
      { word: 'bike', phonemes: ['b', 'i_e', 'k'], distractors: ['a_e', 'u_e', 'i'], meaningZh: '腳踏車 (長i)', emoji: '🚲' },
      { word: 'boat', phonemes: ['b', 'oa', 't'], distractors: ['ee', 'ai', 'o'], meaningZh: '小船 (長o)', emoji: '⛵' },
      { word: 'blue', phonemes: ['bl', 'ue'], distractors: ['ee', 'oa', 'u'], meaningZh: '藍色 (長u)', emoji: '🔵' }
    ]
  }
];

export const getUnitsForBook = (book) => {
  return CURRICULUM_UNITS.filter((u) => u.book === String(book));
};

export const getCurriculumUnit = (book, unit) => {
  const bStr = String(book || '1');
  const uNorm = normalizeLessonToken(String(unit ?? '0')) || '0';
  return (
    CURRICULUM_UNITS.find((u) => u.book === bStr && u.unit === uNorm) ||
    CURRICULUM_UNITS.find((u) => u.book === bStr) ||
    null
  );
};

/**
 * 取得教師專區在 Supabase 單字庫中的獨立冊別（例如 Mark專區、Vanessa專區）
 */
export const getTeacherZoneBooks = (supabaseWords = []) => {
  if (!Array.isArray(supabaseWords)) return [];
  const seen = new Set();
  supabaseWords.forEach((w) => {
    const b = String(w?.book || '').trim();
    if (b && !/^\d+$/.test(b) && b.toLowerCase() !== 'abc') {
      seen.add(b);
    }
  });
  return Array.from(seen);
};

/**
 * 取得指定冊課的單字清單：
 * 優先讀取 Supabase 即時單字庫（對應 teacher / admin 擴充），缺漏時自動回補 HERE_WE_GO_TEXTBOOKS 與 ALL Contents 官方字表
 */
export const getCurriculumUnitVocab = (book, unit, supabaseWords = []) => {
  const bStr = String(book || '').trim();
  if (!bStr || bStr === 'free') return [];

  const isNumericBook = /^\d+$/.test(bStr);
  const uNorm = normalizeLessonToken(String(unit ?? '0'));

  // 1. Supabase 即時單字庫比對
  const dbMatches = Array.isArray(supabaseWords)
    ? supabaseWords.filter((w) => {
        if (String(w?.book || '').trim() !== bStr) return false;
        if (!isNumericBook) {
          return !unit || unit === 'all' || String(w?.lesson || '').trim() === String(unit).trim();
        }
        return normalizeLessonToken(w?.lesson || '') === uNorm;
      })
    : [];

  // 2. 先從課綱官方大綱建立「核心單字 vs 拼讀補充」標籤索引（讓分類永遠以課綱為準，同時保留雲端釋義優先順序）
  const officialUnit = isNumericBook ? getCurriculumUnit(bStr, uNorm) : null;
  const officialKindByEn = new Map();
  if (officialUnit && Array.isArray(officialUnit.officialVocab)) {
    officialUnit.officialVocab.forEach((v) => {
      const k = String(v?.en || '').trim().toLowerCase();
      if (k && !officialKindByEn.has(k)) {
        officialKindByEn.set(k, v?.kind || 'core');
      }
    });
  }

  // 3. 靜態課文資料與官方大綱字表去重合併
  const merged = [];
  const seenEn = new Set();

  const pushEntry = (item, source) => {
    const en = String(item?.en || '').trim();
    if (!en) return;
    const key = en.toLowerCase();
    if (seenEn.has(key)) return;
    seenEn.add(key);
    merged.push({
      id: item.id || `${bStr}_${uNorm}_${key}`,
      en,
      zh: String(item?.zh || '').trim(),
      book: bStr,
      lesson: item.lesson || uNorm,
      kind: officialKindByEn.get(key) || item?.kind || 'core',
      source
    });
  };

  dbMatches.forEach((w) => pushEntry(w, 'supabase'));

  if (isNumericBook) {
    const tbBook = (HERE_WE_GO_TEXTBOOKS || []).find((b) => String(b.book) === bStr);
    if (tbBook) {
      const tbUnit = (tbBook.units || []).find((u) => {
        const uidTail = String(u.unitId || '').split('_u')[1] || '';
        return uidTail === uNorm || normalizeLessonToken(u.title || '') === uNorm;
      });
      if (tbUnit && Array.isArray(tbUnit.vocab)) {
        tbUnit.vocab.forEach((v) => pushEntry(v, 'textbook'));
      }
    }

    if (officialUnit && Array.isArray(officialUnit.officialVocab)) {
      officialUnit.officialVocab.forEach((v) => pushEntry(v, 'official'));
    }
  }

  return merged;
};

/**
 * 將教學館目前的冊別／單元轉換為 Lobby / 遊戲識別的 selectedUnits 格式
 */
export const resolveLobbySelectedUnits = (book, unit, supabaseWords = []) => {
  const bStr = String(book || '1').trim();
  if (!bStr || bStr === 'free') return ['1-1'];
  if (bStr === 'abc') return ['abc'];

  const isNumericBook = /^\d+$/.test(bStr);
  const uNorm = normalizeLessonToken(String(unit ?? '0'));

  if (Array.isArray(supabaseWords) && supabaseWords.length > 0) {
    const matchedKeys = new Set();
    supabaseWords.forEach((w) => {
      if (String(w?.book || '').trim() !== bStr) return;
      if (!isNumericBook) {
        if (!unit || unit === 'all' || String(w?.lesson || '').trim() === String(unit).trim()) {
          matchedKeys.add(`${bStr}-${w.lesson}`);
        }
      } else if (normalizeLessonToken(w?.lesson || '') === uNorm) {
        matchedKeys.add(`${bStr}-${w.lesson}`);
      }
    });
    if (matchedKeys.size > 0) {
      return Array.from(matchedKeys);
    }
  }

  return isNumericBook ? [`${bStr}-${uNorm || '0'}`] : [`${bStr}-all`];
};
