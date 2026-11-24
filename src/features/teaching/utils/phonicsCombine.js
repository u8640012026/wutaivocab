import { REAL_WORDS_DICTIONARY } from '../../phonics/data/phonicsData.ts';
import { HERE_WE_GO_TEXTBOOKS } from '../../../data/hereWeGoTextbookData.js';
import { isElementarySafeWord } from '../../../services/profanityFilter.js';

// 移除發音註解括號（例如 th(voiced) -> th, y(i) -> y, c(s) -> c）
export const stripCardAnnotations = (grapheme = '') => {
  return String(grapheme || '').replace(/\([^)]*\)/g, '').trim();
};

const MAGIC_E_CONSONANTS = new Set([
  'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'qu', 'r', 's', 't', 'v', 'w', 'x', 'z',
  'ch', 'sh', 'th', 'ph', 'ck', 'ng'
]);

const SHORT_VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

const STANDARD_SPLIT_DIGRAPHS = new Set(['a_e', 'e_e', 'i_e', 'o_e', 'u_e']);

// 高頻例外字（字尾雖為 V+C+e，但屬短音或不規則讀音，不標記 Magic e 規則提示）
const MAGIC_E_EXCEPTIONS = new Set([
  'have', 'give', 'love', 'come', 'some', 'done', 'none', 'gone', 'one',
  'are', 'were', 'move', 'prove', 'lose', 'whose', 'dove', 'glove', 'above', 'shove',
  'there', 'where', 'eye', 'bye', 'dye', 'rye'
]);

/**
 * 將一排磁吸音素卡精準組合為拼讀單字。
 * 正確處理分離母音 (a_e, e_e, i_e, o_e, u_e)：
 * 例如 [c][a_e][k] -> "cake"（而非舊版錯誤的 "caek"）
 * 例如 [c][a_e][t] -> "cate"（示範拼讀對比）
 * 亦偵測手動排入的 4 格 CVCe（如 [c][a][t][e]）並標記 isMagicE。
 * 僅當結構真正符合規則且不屬於常見例外字時，才標記 isMagicE。
 */
export const combinePhonicsRow = (placedCards = []) => {
  if (!Array.isArray(placedCards) || placedCards.length === 0) {
    return {
      combinedWord: '',
      isMagicE: false,
      magicEType: null,
      magicEPair: null,
      isSafe: true,
      displayLetters: []
    };
  }

  const outputTokens = [];
  let splitCount = 0;
  let splitValidTailAtEnd = false;
  let splitPair = null;

  for (let i = 0; i < placedCards.length; i++) {
    const card = placedCards[i]?.card || placedCards[i];
    if (!card || !card.grapheme) continue;

    const raw = card.grapheme;
    const isSplit = Boolean(card.isSplit || raw.includes('_'));

    if (isSplit && raw.includes('_')) {
      const isStandardSplit = STANDARD_SPLIT_DIGRAPHS.has(raw.toLowerCase());
      splitCount += 1;
      const [headPart, tailPart = 'e'] = raw.split('_').map(stripCardAnnotations);
      const nextCard = placedCards[i + 1]?.card || placedCards[i + 1];
      const nextClean =
        nextCard && nextCard.grapheme && !nextCard.isSplit && !nextCard.grapheme.includes('_')
          ? stripCardAnnotations(nextCard.grapheme).toLowerCase()
          : '';

      if (nextClean && MAGIC_E_CONSONANTS.has(nextClean)) {
        outputTokens.push(headPart, nextClean, tailPart);
        if (isStandardSplit && i + 1 === placedCards.length - 1) {
          splitValidTailAtEnd = true;
          splitPair = [i, i + 1];
        } else {
          splitValidTailAtEnd = false;
        }
        i += 1; // 已消耗下一個子音卡
      } else {
        // 缺尾音或緊接母音時仍保留自由拼字輸出，但不視為標準 Magic e 規則
        outputTokens.push(headPart, tailPart);
        splitValidTailAtEnd = false;
      }
    } else {
      outputTokens.push(stripCardAnnotations(raw));
    }
  }

  let isMagicE = splitCount === 1 && splitValidTailAtEnd;
  let magicEType = isMagicE ? 'split' : null;
  let magicEPair = isMagicE ? splitPair : null;

  // 偵測標準 CVCe（例如 [c][a][t][e] 或 [th][e][s][e]），僅在無分離母音卡時檢查
  if (splitCount === 0 && placedCards.length >= 3) {
    const cleanCards = placedCards.map((pc) => {
      const c = pc?.card || pc;
      return stripCardAnnotations(c?.grapheme || '').toLowerCase();
    });
    const lastIdx = cleanCards.length - 1;
    if (
      cleanCards[lastIdx] === 'e' &&
      MAGIC_E_CONSONANTS.has(cleanCards[lastIdx - 1]) &&
      SHORT_VOWELS.has(cleanCards[lastIdx - 2])
    ) {
      isMagicE = true;
      magicEType = 'cvce';
      magicEPair = [lastIdx - 2, lastIdx];
    }
  }

  const combinedWord = outputTokens.join('').toLowerCase();

  if (MAGIC_E_EXCEPTIONS.has(combinedWord)) {
    isMagicE = false;
    magicEType = null;
    magicEPair = null;
  }

  const isSafe = combinedWord ? isElementarySafeWord(combinedWord) : true;

  return {
    combinedWord,
    isMagicE,
    magicEType,
    magicEPair,
    isSafe,
    displayLetters: combinedWord.split('')
  };
};

// 常見拼讀小字補充字典（補足 REAL_WORDS_DICTIONARY 未收錄但教材常拼讀的單字）
const EXTRA_PHONICS_WORDS = {
  pat: { meaningZh: '輕拍', meaningEn: 'to touch gently', emoji: '🫳' },
  sad: { meaningZh: '難過的', meaningEn: 'feeling unhappy', emoji: '😢' },
  mad: { meaningZh: '生氣的', meaningEn: 'angry', emoji: '😠' },
  dad: { meaningZh: '爸爸', meaningEn: 'father', emoji: '👨' },
  bad: { meaningZh: '壞的', meaningEn: 'not good', emoji: '👎' },
  fat: { meaningZh: '胖的', meaningEn: 'not thin', emoji: '🍔' },
  sat: { meaningZh: '坐下(過去式)', meaningEn: 'past of sit', emoji: '🪑' },
  pet: { meaningZh: '寵物', meaningEn: 'an animal kept at home', emoji: '🐾' },
  net: { meaningZh: '網子', meaningEn: 'a mesh trap or goal', emoji: '🥅' },
  vet: { meaningZh: '獸醫', meaningEn: 'animal doctor', emoji: '🩺' },
  wet: { meaningZh: '濕的', meaningEn: 'covered with water', emoji: '💧' },
  jet: { meaningZh: '噴射機', meaningEn: 'a fast plane', emoji: '✈️' },
  ted: { meaningZh: '泰德(人名)', meaningEn: 'a boy name', emoji: '👦' },
  big: { meaningZh: '大的', meaningEn: 'large', emoji: '🐘' },
  wig: { meaningZh: '假髮', meaningEn: 'artificial hair', emoji: '💇' },
  kick: { meaningZh: '踢', meaningEn: 'hit with a foot', emoji: '⚽' },
  sick: { meaningZh: '生病的', meaningEn: 'ill', emoji: '🤒' },
  lick: { meaningZh: '舔', meaningEn: 'pass tongue over', emoji: '🍭' },
  pick: { meaningZh: '挑選/採摘', meaningEn: 'choose', emoji: '🤏' },
  hop: { meaningZh: '單腳跳', meaningEn: 'jump lightly', emoji: '🐇' },
  mop: { meaningZh: '拖把', meaningEn: 'floor cleaner', emoji: '🧹' },
  top: { meaningZh: '陀螺/頂端', meaningEn: 'highest part or toy', emoji: '🪀' },
  pop: { meaningZh: '爆開/流行', meaningEn: 'short burst sound', emoji: '🍿' },
  cub: { meaningZh: '幼獸', meaningEn: 'a baby bear or lion', emoji: '🐻' },
  tub: { meaningZh: '浴缸', meaningEn: 'bathtub', emoji: '🛁' },
  rub: { meaningZh: '擦/搓', meaningEn: 'press and move back and forth', emoji: '🫧' },
  cut: { meaningZh: '切/剪', meaningEn: 'divide with scissors or knife', emoji: '✂️' },
  nut: { meaningZh: '堅果', meaningEn: 'hard-shelled seed', emoji: '🥜' },
  hut: { meaningZh: '小屋', meaningEn: 'small simple house', emoji: '🛖' },
  bag: { meaningZh: '袋子/書包', meaningEn: 'container', emoji: '🎒' },
  pan: { meaningZh: '平底鍋', meaningEn: 'cooking pan', emoji: '🍳' },
  fan: { meaningZh: '電風扇/迷', meaningEn: 'cooling device', emoji: '🌀' },
  van: { meaningZh: '廂型車', meaningEn: 'medium vehicle', emoji: '🚐' },
  vet2: { meaningZh: '獸醫', meaningEn: 'vet', emoji: '🩺' },
  gum: { meaningZh: '口香糖', meaningEn: 'chewing gum', emoji: '🫧' },
  gap: { meaningZh: '缺口', meaningEn: 'open space', emoji: '🕳️' },
  zip: { meaningZh: '拉鍊', meaningEn: 'fastener', emoji: '🤐' },
  cape: { meaningZh: '披風', meaningEn: 'sleeveless cloak', emoji: '🦸' },
  tape: { meaningZh: '膠帶', meaningEn: 'sticky strip', emoji: '📼' },
  wave: { meaningZh: '海浪/揮手', meaningEn: 'moving water or hand gesture', emoji: '🌊' },
  eve: { meaningZh: '前夕', meaningEn: 'evening before', emoji: '🌙' },
  here: { meaningZh: '這裡', meaningEn: 'in this place', emoji: '📍' },
  these: { meaningZh: '這些', meaningEn: 'plural of this', emoji: '👉' },
  ride: { meaningZh: '騎乘', meaningEn: 'sit on and control', emoji: '🚲' },
  hide: { meaningZh: '躲藏', meaningEn: 'put out of sight', emoji: '🙈' },
  bone: { meaningZh: '骨頭', meaningEn: 'hard part of skeleton', emoji: '🦴' },
  cone: { meaningZh: '甜筒/圓錐', meaningEn: 'cone shape', emoji: '🍦' },
  note: { meaningZh: '筆記/音符', meaningEn: 'short written message', emoji: '📝' },
  cube: { meaningZh: '立方體', meaningEn: 'box-shaped solid', emoji: '🧊' },
  mule: { meaningZh: '騾子', meaningEn: 'animal', emoji: '🐴' },
  huge: { meaningZh: '巨大的', meaningEn: 'very big', emoji: '🦕' },
  pie: { meaningZh: '派', meaningEn: 'baked pastry', emoji: '🥧' },
  tie: { meaningZh: '領帶/綁', meaningEn: 'necktie or fasten', emoji: '👔' },
  lie: { meaningZh: '躺/說謊', meaningEn: 'recline', emoji: '🛏️' },
  cry: { meaningZh: '哭泣', meaningEn: 'shed tears', emoji: '😭' },
  fly: { meaningZh: '飛翔', meaningEn: 'move through air', emoji: '🦋' },
  sky: { meaningZh: '天空', meaningEn: 'space above earth', emoji: '🌌' },
  shy: { meaningZh: '害羞的', meaningEn: 'timid', emoji: '😳' },
  blue: { meaningZh: '藍色', meaningEn: 'color of the sky', emoji: '🔵' },
  glue: { meaningZh: '膠水', meaningEn: 'sticky paste', emoji: '🧴' },
  true: { meaningZh: '真實的', meaningEn: 'fact', emoji: '✅' },
  fruit: { meaningZh: '水果', meaningEn: 'sweet plant food', emoji: '🍓' },
  suit: { meaningZh: '西裝/套裝', meaningEn: 'set of clothes', emoji: '🤵' },
  this: { meaningZh: '這個', meaningEn: 'near object', emoji: '👇' },
  that: { meaningZh: '那個', meaningEn: 'far object', emoji: '👉' },
  them: { meaningZh: '他們(受格)', meaningEn: 'plural pronoun', emoji: '👥' },
  then: { meaningZh: '然後/那時', meaningEn: 'at that time', emoji: '⏭️' },
  three: { meaningZh: '三', meaningEn: 'number 3', emoji: '3️⃣' },
  pink: { meaningZh: '粉紅色', meaningEn: 'pale red color', emoji: '🌸' },
  sink: { meaningZh: '水槽/下沉', meaningEn: 'washbasin', emoji: '🚰' },
  bank: { meaningZh: '銀行', meaningEn: 'money institution', emoji: '🏦' },
  whale: { meaningZh: '鯨魚', meaningEn: 'giant sea mammal', emoji: '🐳' },
  white: { meaningZh: '白色', meaningEn: 'color of snow', emoji: '⬜' },
  wheel: { meaningZh: '輪子', meaningEn: 'circular frame', emoji: '🛞' },
  phone: { meaningZh: '電話', meaningEn: 'telephone', emoji: '📱' },
  photo: { meaningZh: '照片', meaningEn: 'photograph', emoji: '📷' },
  her: { meaningZh: '她的', meaningEn: 'belonging to her', emoji: '👩' },
  fern: { meaningZh: '蕨類', meaningEn: 'leafy plant', emoji: '🌿' },
  horn: { meaningZh: '號角/犄角', meaningEn: 'horn', emoji: '📯' },
  surf: { meaningZh: '衝浪', meaningEn: 'ride waves', emoji: '🏄' },
  turn: { meaningZh: '轉彎/輪流', meaningEn: 'rotate', emoji: '↪️' },
  soil: { meaningZh: '泥土', meaningEn: 'earth for plants', emoji: '🪴' },
  boil: { meaningZh: '煮沸', meaningEn: 'heat liquid to bubbles', emoji: '♨️' },
  joy: { meaningZh: '喜悅', meaningEn: 'great happiness', emoji: '😄' },
  house: { meaningZh: '房子', meaningEn: 'building to live in', emoji: '🏠' },
  mouse: { meaningZh: '老鼠/滑鼠', meaningEn: 'small rodent', emoji: '🐭' },
  plane: { meaningZh: '飛機', meaningEn: 'airplane', emoji: '✈️' },
  black: { meaningZh: '黑色', meaningEn: 'darkest color', emoji: '⬛' },
  clock: { meaningZh: '時鐘', meaningEn: 'timepiece', emoji: '⏰' },
  glass: { meaningZh: '玻璃杯', meaningEn: 'drinking cup', emoji: '🥛' },
  green: { meaningZh: '綠色', meaningEn: 'color of leaves', emoji: '🟢' },
  grape: { meaningZh: '葡萄', meaningEn: 'purple fruit', emoji: '🍇' },
  swan: { meaningZh: '天鵝', meaningEn: 'white water bird', emoji: '🦢' },
  swim: { meaningZh: '游泳', meaningEn: 'move in water', emoji: '🏊' },
  spoon: { meaningZh: '湯匙', meaningEn: 'utensil', emoji: '🥄' },
  skate: { meaningZh: '溜冰', meaningEn: 'glide on skates', emoji: '⛸️' },
  skirt: { meaningZh: '裙子', meaningEn: 'clothing', emoji: '👗' }
};

let textbookVocabCache = null;
const getTextbookVocabIndex = () => {
  if (textbookVocabCache) return textbookVocabCache;
  const map = new Map();
  (HERE_WE_GO_TEXTBOOKS || []).forEach((bookObj) => {
    (bookObj.units || []).forEach((unitObj) => {
      (unitObj.vocab || []).forEach((v) => {
        const key = String(v.en || '').trim().toLowerCase();
        if (key && !map.has(key)) {
          map.set(key, {
            word: key,
            meaningZh: v.zh || '',
            book: String(bookObj.book),
            unitTitle: unitObj.title || ''
          });
        }
      });
    });
  });
  textbookVocabCache = map;
  return map;
};

/**
 * 查詢拼出的單字在發音字典或課本單字庫中的中英釋義
 */
export const lookupWordMeaning = (word, supabaseWords = []) => {
  const clean = String(word || '').trim().toLowerCase();
  if (!clean) return null;

  // 1. 先查高優先級真實發音字典
  const directDict = REAL_WORDS_DICTIONARY[clean];
  if (directDict) {
    return {
      word: clean,
      meaningZh: directDict.meaningZh,
      meaningEn: directDict.meaningEn,
      emoji: directDict.emoji || '✨',
      source: 'phonics'
    };
  }

  // 2. 查補充拼讀字典
  const extra = EXTRA_PHONICS_WORDS[clean];

  // 3. 查 Supabase 課本單字庫
  if (Array.isArray(supabaseWords) && supabaseWords.length > 0) {
    const matched = supabaseWords.find(
      (w) => String(w.en || '').trim().toLowerCase() === clean
    );
    if (matched) {
      return {
        word: clean,
        meaningZh: matched.zh || extra?.meaningZh || '',
        meaningEn: extra?.meaningEn || '',
        emoji: extra?.emoji || '📘',
        book: matched.book,
        lesson: matched.lesson,
        source: 'textbook'
      };
    }
  }

  // 4. 查靜態課本資料
  const tbHit = getTextbookVocabIndex().get(clean);
  if (tbHit) {
    return {
      word: clean,
      meaningZh: tbHit.meaningZh || extra?.meaningZh || '',
      meaningEn: extra?.meaningEn || '',
      emoji: extra?.emoji || '📘',
      book: tbHit.book,
      source: 'textbook'
    };
  }

  if (extra) {
    return {
      word: clean,
      meaningZh: extra.meaningZh,
      meaningEn: extra.meaningEn,
      emoji: extra.emoji,
      source: 'phonics'
    };
  }

  return null;
};
