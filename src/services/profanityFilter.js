// ── 常用安全詞彙白名單 (避免 class 包含 ass、peacock 包含 cock、grapes 包含 rape 誤判) ──
const SAFE_WORDS = [
  'class', 'classic', 'classical', 'classroom', 'pass', 'passage', 'passenger', 'password',
  'grass', 'grasshopper', 'glass', 'glasses', 'bass', 'compass', 'assistant', 'assist',
  'assess', 'asset', 'assign', 'assume', 'assure', 'casserole', 'embassy', 'massage',
  'peacock', 'cockatoo', 'cocktail', 'peacocking',
  'grape', 'grapes', 'grapefruit', 'scrape', 'drape',
  'title', 'subtitle', 'butterfly', 'butter',
  'hello', 'shell', 'shelter', 'shutter', 'shuttle',
  'duck', 'luck', 'lucky', 'truck', 'stuck', 'bucket', 'ticket', 'pocket', 'chicken', 'kitchen',
  'witch', 'pitch', 'switch', 'stitch', 'ditch', 'rich', 'which', 'sandwich', 'ostrich',
  'push', 'bush', 'brush', 'rush', 'crush', 'mushroom',
  'pen', 'pencil', 'open', 'happen', 'penny', 'penguin', 'carpenter',
  'document', 'canal', 'panel', 'channel', 'tunnel', 'final', 'animal', 'normal',
  'personal', 'national', 'shoe', 'shoes', 'hoeing', 'canals', 'analyse', 'analyze',
  'accumulate', 'cucumber', 'documentary', 'six', 'sixteen', 'sixty', 'text', 'textbook',
  'exchange', 'excuse', 'exercise', 'exit', 'next',
  'spice', 'spicy', 'spices', 'spinach', 'spaghetti', 'pickle', 'pickles'
];

const SAFE_WORDS_BY_LEN = [...new Set(SAFE_WORDS)].sort((a, b) => b.length - a.length);
const SAFE_WORDS_SET = new Set(SAFE_WORDS_BY_LEN);

// ── 需以全字邊界比對之短敏字詞 (避免嵌入一般英語字根如 hello/class/shoes/spice 誤殺) ──
const BOUNDARY_PROFANITY_WORDS = new Set([
  'ass', 'arse', 'hell', 'sex', 'sexy', 'cum', 'tit', 'tits', 'fag', 'hoe', 'hoes',
  'piss', 'anal', 'anus', 'xxx', 'cock', 'clit', 'jizz', 'milf',
  'rape', 'nude', 'naked', 'twat', 'spic', 'kike'
]);

// ── 中文與注音校園敏感詞清單 ──
const CJK_PROFANITY_WORDS = [
  '幹你', '幹他', '幹她', '幹娘', '幹死', '林娘', '操你', '草泥馬', '三小', '靠北', '靠杯', '靠夭',
  '機掰', '雞掰', '雞巴', 'ㄐㄅ', 'ㄐ掰', '懶趴', '懶叫', '覽叫', '懶子', '爛趴', '白痴', '白癡',
  '智障', '腦殘', '低能', '智缺', '婊子', '破麻', '賤人', '賤貨', '雜種', '王八蛋', '王八', '混蛋',
  '去死', '死好', '色情', '做愛', '幹砲', '約砲', '陰莖', '陰道', '睪丸', '自慰', '打手槍',
  '手淫', '射精', '吃屎', '大便', '死八婆', '死肥豬', '屌爆', '屌你', '露點', '裸照', '色圖'
];

// ── 英文髒話、歧視、色情與暴力詞彙 (子字串比對，含常見諧音與縮寫) ──
const EN_PROFANITY_WORDS = [
  'fuck', 'fuk', 'fck', 'fking', 'fxxk', 'fxck', 'fuxx', 'fuxk', 'fucc', 'fuq', 'motherfucker',
  'shit', 'sh1t', 'shxt', 'shyt', 'bullshit', 'dipshit',
  'bitch', 'b1tch', 'bxtch', 'btch', 'biatch',
  'asshole', 'jackass', 'dumbass', 'smartass',
  'dick', 'd1ck', 'dickhead',
  'cunt', 'pussy', 'slut', 'slutty', 'whore', 'whorish',
  'nigger', 'nigga', 'faggot', 'chink',
  'bastard', 'retard', 'retarded',
  'porn', 'porno', 'pornography', 'hentai', 'penis', 'vagina', 'boobs', 'boobies',
  'dildo', 'orgasm', 'masturbate', 'masturbation', 'horny', 'blowjob', 'handjob',
  'wtf', 'stfu',
  'testicle', 'scrotum', 'erection', 'fetish', 'bdsm', 'kinky', 'stripper',
  'prostitute', 'brothel', 'cocaine', 'heroin', 'methamphetamine'
];

// ── 字典回傳釋義或標籤的不良標記（Layer 2：線上字典回傳審查） ──
const UNSAFE_DICTIONARY_MARKERS = [
  'vulgar', 'offensive', 'derogatory', 'taboo', 'profanity', 'obscenity',
  'obscene', 'sexual', 'genitalia', 'pornographic', 'erotic', 'slur',
  'expletive', 'intercourse', 'prostitution', 'masturbation', 'fetish',
  'crude slang', 'pejorative', 'ethnic slur', 'racial slur', 'rude', 'profane'
];

const DIGIT_LEET_MAP = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't'
};

// Leetspeak 與符號替代正規化（例如 f4ck, sh1t, b!tch, @ss, fuuuuck）
const LEET_CHAR_MAP = {
  ...DIGIT_LEET_MAP,
  '@': 'a',
  '$': 's',
  '!': 'i'
};

const applyCharMap = (str, map) =>
  str
    .split('')
    .map((ch) => map[ch] || ch)
    .join('');

const stripSafeSubstrings = (val) => {
  let out = val;
  for (const sw of SAFE_WORDS_BY_LEN) {
    if (out.includes(sw)) {
      out = out.split(sw).join(' ');
    }
  }
  return out.replace(/\s+/g, '');
};

const hasProfanityInToken = (rawToken) => {
  if (!rawToken) return false;

  const candidates = new Set();

  // A. 保留 @$! 做 leetspeak 映射（抓 b!tch, @ss, a$$hole, sh!t）
  const leetCore = rawToken.replace(/[^a-z0-9@$!]/g, '');
  if (leetCore && /[a-z@$!]/.test(leetCore)) {
    const mapped = applyCharMap(leetCore, LEET_CHAR_MAP);
    candidates.add(mapped);
    candidates.add(mapped.replace(/([a-z])\1{2,}/g, '$1'));
    candidates.add(mapped.replace(/([a-z])\1{2,}/g, '$1$1'));
  }

  // B. 把 @ $ ! 與標點全部剝除（抓 f@u@c@k, sh@it, f@ck, f*ck），僅對含字母者映數字
  const strippedCore = rawToken.replace(/[^a-z0-9]/g, '');
  if (strippedCore && /[a-z]/.test(strippedCore)) {
    const mapped = applyCharMap(strippedCore, DIGIT_LEET_MAP);
    candidates.add(mapped);
    candidates.add(mapped.replace(/([a-z])\1{2,}/g, '$1'));
    candidates.add(mapped.replace(/([a-z])\1{2,}/g, '$1$1'));
  }

  // C. 純英文字母序列（防止數字混插繞過）
  const alphaCore = rawToken.replace(/[^a-z]/g, '');
  if (alphaCore) {
    candidates.add(alphaCore);
    candidates.add(alphaCore.replace(/([a-z])\1{2,}/g, '$1'));
    candidates.add(alphaCore.replace(/([a-z])\1{2,}/g, '$1$1'));
  }

  for (const cand of candidates) {
    if (!cand) continue;
    if (SAFE_WORDS_SET.has(cand)) continue;
    if (BOUNDARY_PROFANITY_WORDS.has(cand)) return true;

    const remaining = stripSafeSubstrings(cand);
    if (!remaining) continue;
    if (BOUNDARY_PROFANITY_WORDS.has(remaining)) return true;
    if (EN_PROFANITY_WORDS.some((bad) => remaining.includes(bad))) {
      return true;
    }
  }

  return false;
};

/**
 * 檢查字串是否包含不雅文字（Layer 1：輸入與發音前即時防護閘）
 * @param {string} text - 待檢查字串 (如暱稱、單字、板書或自訂句型)
 * @returns {boolean} - 若包含不雅字詞則返回 true
 */
export const containsProfanity = (text) => {
  if (!text || typeof text !== 'string') return false;

  // NFKC 正規化：將全形英數與符號（如 ｆｕｃｋ、ＳＨＩＴ、＠）轉為半形再比對
  const normText = text.normalize('NFKC').toLowerCase();

  // 1. 中文與注音不雅字詞檢測
  const cleanTrimmed = normText.trim();
  if (cleanTrimmed === '幹' || cleanTrimmed === '操') return true;

  const cjkBopo = normText.replace(/[^\u4e00-\u9fff\u3105-\u312f]/g, '');
  if (cjkBopo) {
    if (!/[a-z0-9]/.test(normText) && (cjkBopo === '幹' || cjkBopo === '操')) {
      return true;
    }
    if (CJK_PROFANITY_WORDS.some((bad) => cjkBopo.includes(bad))) {
      return true;
    }
  }

  // 2. 以空白與詞間分隔符切分 token，避免跨字誤殺（如 wash it / finish it）
  //    同時捕捉逐字母拆字規避（如 f u c k / f.u.c.k / a-s-s）
  const parts = normText.split(/[\s\-_.,/|\\]+/).filter(Boolean);
  let singleCharRun = [];

  const flushRun = () => {
    if (singleCharRun.length >= 3) {
      if (hasProfanityInToken(singleCharRun.join(''))) {
        return true;
      }
    }
    singleCharRun = [];
    return false;
  };

  for (const part of parts) {
    const core = part.replace(/[^a-z0-9@$!]/g, '');
    if (!core) continue;

    if (core.length === 1) {
      singleCharRun.push(core);
      continue;
    }

    if (flushRun()) return true;
    if (hasProfanityInToken(part)) return true;
  }

  if (flushRun()) return true;

  return false;
};

/**
 * 檢查是否適合國小英語課堂使用（安全詞彙為 true，不雅／敏感詞為 false）
 */
export const isElementarySafeWord = (text) => {
  return !containsProfanity(text);
};

const UNSAFE_IPA_PATTERN = /(?:^|[\s/[\]ˈˌ.])(?:fʌk|bɪtʃ|ʃɪt|kʌnt|mʌðərfʌkər)(?:$|[\s/[\].])/;

/**
 * Layer 2：審查線上字典 API 回傳詞條是否適合國小課堂顯示與發音
 */
export const isSafeDictionaryEntry = (entry) => {
  if (!entry || typeof entry !== 'object') return false;
  if (entry.word && containsProfanity(entry.word)) return false;
  if (entry.phonetic && (containsProfanity(entry.phonetic) || UNSAFE_IPA_PATTERN.test(entry.phonetic))) {
    return false;
  }

  const chunks = [];
  const textFieldsToScan = [];
  const pushLabelsOrTags = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach((item) => {
      if (typeof item === 'string' && item.trim()) {
        chunks.push(item);
        textFieldsToScan.push(item);
      }
    });
  };

  if (typeof entry.definition === 'string') {
    chunks.push(entry.definition);
    textFieldsToScan.push(entry.definition);
  }
  if (typeof entry.partOfSpeech === 'string') chunks.push(entry.partOfSpeech);
  pushLabelsOrTags(entry.tags);
  pushLabelsOrTags(entry.labels);

  if (Array.isArray(entry.phonetics)) {
    for (const p of entry.phonetics) {
      if (typeof p?.text === 'string' && p.text.trim()) {
        if (UNSAFE_IPA_PATTERN.test(p.text)) return false;
        textFieldsToScan.push(p.text);
        chunks.push(p.text);
      }
    }
  }

  if (Array.isArray(entry.meanings)) {
    entry.meanings.forEach((m) => {
      if (m?.partOfSpeech) chunks.push(m.partOfSpeech);
      pushLabelsOrTags(m?.tags);
      pushLabelsOrTags(m?.labels);
      pushLabelsOrTags(m?.synonyms);
      pushLabelsOrTags(m?.antonyms);
      if (Array.isArray(m?.definitions)) {
        m.definitions.forEach((d) => {
          pushLabelsOrTags(d?.tags);
          pushLabelsOrTags(d?.labels);
          if (typeof d?.definition === 'string') {
            chunks.push(d.definition);
            textFieldsToScan.push(d.definition);
          }
          if (typeof d?.example === 'string') {
            chunks.push(d.example);
            textFieldsToScan.push(d.example);
          }
          pushLabelsOrTags(d?.synonyms);
          pushLabelsOrTags(d?.antonyms);
        });
      }
    });
  }

  if (textFieldsToScan.some((field) => containsProfanity(field))) {
    return false;
  }

  const combined = chunks.join(' ').toLowerCase();
  if (!combined) return true;

  if (UNSAFE_DICTIONARY_MARKERS.some((marker) => combined.includes(marker))) {
    return false;
  }

  return true;
};

/**
 * 取得不雅字警告提示
 */
export const getProfanityError = (text) => {
  if (containsProfanity(text)) {
    return '⚠️ 內容包含不適合國小課堂的字詞，請改用文明、正面的英語詞彙喔！';
  }
  return null;
};
