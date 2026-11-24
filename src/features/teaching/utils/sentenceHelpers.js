import { isElementarySafeWord } from '../../../services/profanityFilter.js';

export const PUNCTUATION_RE = /^[?!.,:;]+$/;

const DETERMINER_WORDS = new Set([
  'a',
  'an',
  'the',
  'my',
  'your',
  'his',
  'her',
  'its',
  'our',
  'their',
  'this',
  'that',
  'these',
  'those',
  'some',
  'any',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
]);

const WH_WORDS = new Set([
  'what',
  "what's",
  'who',
  "who's",
  'where',
  "where's",
  'when',
  'why',
  'how',
  "how's",
  'which',
  'whose',
]);

const SUBJECT_WORDS = new Set([
  'i',
  "i'm",
  "i'd",
  'you',
  "you're",
  "you'd",
  'he',
  "he's",
  "he'd",
  'she',
  "she's",
  "she'd",
  'it',
  "it's",
  'we',
  "we're",
  "we'd",
  'they',
  "they're",
  "there's",
  'my',
  'your',
  'his',
  'her',
  'its',
  'our',
  'their',
  'this',
  'that',
  'these',
  'those',
]);

const TIME_PREP_WORDS = new Set([
  'in',
  'on',
  'under',
  'by',
  'at',
  'to',
  'from',
  'for',
  'with',
  'next',
  'behind',
  'between',
  'near',
  'over',
  'yesterday',
  'today',
  'tomorrow',
  'now',
  'last',
  'ago',
  'morning',
  'afternoon',
  'evening',
  'night',
  'weekend',
  'weekends',
  "o'clock",
]);

const NON_VERB_ING_WORDS = new Set([
  'morning',
  'afternoon',
  'evening',
  'spring',
  'thing',
  'nothing',
  'something',
  'everything',
  'building',
  'dumpling',
  'pudding',
  'ceiling',
  'wedding',
  'king',
  'ring',
  'wing',
]);

const NON_VERB_ED_WORDS = new Set([
  'tired',
  'excited',
  'bored',
  'scared',
  'interested',
  'worried',
  'red',
  'bed',
  'hundred',
  'sled',
  'bread',
  'head',
]);

const VERB_WORDS = new Set([
  'am',
  'is',
  'are',
  'was',
  'were',
  'be',
  'do',
  'does',
  'did',
  "don't",
  "doesn't",
  "didn't",
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
  'can',
  "can't",
  'cannot',
  'will',
  'would',
  "let's",
  'like',
  'likes',
  'liked',
  'want',
  'wants',
  'wanted',
  'need',
  'needs',
  'needed',
  'have',
  'has',
  'had',
  'go',
  'goes',
  'went',
  'going',
  'get',
  'gets',
  'got',
  'surf',
  'surfs',
  'surfed',
  'hurt',
  'hurts',
  'eat',
  'eats',
  'ate',
  'eating',
  'drink',
  'drinks',
  'drank',
  'drinking',
  'see',
  'sees',
  'saw',
  'look',
  'looks',
  'looked',
  'feel',
  'feels',
  'felt',
  'play',
  'plays',
  'played',
  'playing',
  'read',
  'reads',
  'reading',
  'write',
  'writes',
  'wrote',
  'writing',
  'swim',
  'swims',
  'swam',
  'swimming',
  'run',
  'runs',
  'ran',
  'running',
  'ride',
  'rides',
  'rode',
  'riding',
  'sing',
  'sings',
  'sang',
  'singing',
  'dance',
  'dances',
  'danced',
  'dancing',
  'cook',
  'cooks',
  'cooked',
  'cooking',
  'sleep',
  'sleeps',
  'slept',
  'sleeping',
  'watch',
  'watches',
  'watched',
  'watching',
  'study',
  'studies',
  'studied',
  'studying',
  'walk',
  'walks',
  'walked',
  'walking',
  'help',
  'helps',
  'helped',
  'visit',
  'visits',
  'visited',
  'clean',
  'cleans',
  'cleaned',
  'listen',
  'listens',
  'listened',
  'take',
  'takes',
  'took',
  'make',
  'makes',
  'made',
  'buy',
  'buys',
  'bought',
  'come',
  'comes',
  'came',
  'give',
  'gives',
  'gave',
  'jogging',
  'shopping',
]);

const FUNCTION_STOP_WORDS = new Set([
  ...DETERMINER_WORDS,
  ...WH_WORDS,
  ...SUBJECT_WORDS,
  ...TIME_PREP_WORDS,
  'am',
  'is',
  'are',
  'was',
  'were',
  'do',
  'does',
  'did',
  'can',
  'will',
  'would',
  'yes',
  'no',
  'not',
]);

const PEER_SUBSTITUTION_GROUPS = [
  ['happy', 'sad', 'angry', 'tired', 'hungry', 'thirsty', 'sick', 'great', 'full'],
  ['sunny', 'rainy', 'cloudy', 'windy', 'hot', 'cold', 'warm', 'cool', 'dry', 'wet', 'foggy', 'snowy'],
  ['spring', 'summer', 'fall', 'winter'],
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
  ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'black', 'white'],
  ['apple', 'banana', 'orange', 'book', 'pen', 'ruler', 'eraser', 'backpack', 'umbrella'],
  ['cat', 'dog', 'bird', 'fish', 'lion', 'horse', 'zebra'],
  ['home', 'school', 'park', 'zoo', 'library', 'supermarket', 'bookstore', 'bakery', 'mall'],
  ['bus', 'bike', 'car', 'train', 'MRT', 'taxi', 'scooter'],
  ['swim', 'sing', 'dance', 'draw', 'cook', 'read', 'run', 'jump'],
  ['visited', 'cleaned', 'watched', 'walked', 'played', 'listened', 'studied'],
  ['reading', 'writing', 'swimming', 'sleeping', 'running', 'dancing', 'cooking', 'jogging'],
  ['I', 'you', 'he', 'she', 'it', 'we', 'they'],
  ['am', 'is', 'are', 'was', 'were'],
];

/**
 * 結合單字詞形與前後詞脈絡進行詞性著色標註
 * （避免把 evening 誤判為 -ing 動詞，也能正確辨識 visited 等過去式動詞）
 */
export function classifyTokenRole(token, idx = 0, tokens = []) {
  const clean = String(token || '').trim();
  if (!clean || PUNCTUATION_RE.test(clean)) return 'punct';

  const lower = clean.toLowerCase();
  if (WH_WORDS.has(lower)) return 'wh';
  if (SUBJECT_WORDS.has(lower)) return 'subject';
  if (TIME_PREP_WORDS.has(lower)) return 'prep';

  const prevLower = idx > 0 ? String(tokens[idx - 1] || '').trim().toLowerCase() : '';
  if (prevLower && DETERMINER_WORDS.has(prevLower)) {
    return 'object';
  }

  if (VERB_WORDS.has(lower)) return 'verb';

  if (
    /^[a-z]{3,}ing$/i.test(clean) &&
    !NON_VERB_ING_WORDS.has(lower)
  ) {
    return 'verb';
  }

  if (
    /^[a-z]{3,}ed$/i.test(clean) &&
    !NON_VERB_ED_WORDS.has(lower)
  ) {
    return 'verb';
  }

  return 'object';
}

export function getAutoScaleTier(sentenceText) {
  const len = String(sentenceText || '').trim().length;
  if (len <= 24) return 2;
  if (len <= 42) return 1;
  return 0;
}

export function pickDefaultSlotIndex(tokens = [], unitVocab = []) {
  if (!Array.isArray(tokens) || tokens.length === 0) return 0;
  const vocabSet = new Set(
    (unitVocab || []).map((w) => String(w?.en || '').trim().toLowerCase()).filter(Boolean)
  );

  let lastWordIdx = 0;
  for (let i = tokens.length - 1; i >= 0; i--) {
    const t = String(tokens[i] || '').trim();
    if (!t || PUNCTUATION_RE.test(t)) continue;
    if (lastWordIdx === 0) lastWordIdx = i;
    if (vocabSet.has(t.toLowerCase())) return i;
  }

  for (let i = tokens.length - 1; i >= 0; i--) {
    const role = classifyTokenRole(tokens[i], i, tokens);
    if (role === 'object') return i;
  }
  return lastWordIdx;
}

function scoreYesNoCompatibility(qLower, aLower) {
  if (!/^(yes|no)\b[,.!\s]/.test(aLower)) return -1;

  if (/^would you\b/.test(qLower)) {
    return /^(yes,\s*please|no,\s*thank you)\b/.test(aLower) ? 100 : -1;
  }
  if (/^are you\b/.test(qLower)) {
    return /\b(i am|i'm|we are|we're|i'm not|we aren't|we're not)\b/.test(aLower) ? 100 : -1;
  }
  if (/^is he\b/.test(qLower)) {
    return /\b(he is|he's|he isn't)\b/.test(aLower) ? 100 : -1;
  }
  if (/^is she\b/.test(qLower)) {
    return /\b(she is|she's|she isn't)\b/.test(aLower) ? 100 : -1;
  }
  if (/^is (it|this|that|the )\b/.test(qLower)) {
    return /\b(it is|it's|it isn't)\b/.test(aLower) ? 100 : -1;
  }
  if (/^are (they|these|those)\b/.test(qLower)) {
    return /\b(they are|they're|they aren't)\b/.test(aLower) ? 100 : -1;
  }
  if (/^do you\b/.test(qLower)) {
    return /\b(i|we)\s+(do|don't)\b/.test(aLower) ? 100 : -1;
  }
  if (/^does he\b/.test(qLower)) {
    return /\bhe\s+(does|doesn't)\b/.test(aLower) ? 100 : -1;
  }
  if (/^does she\b/.test(qLower)) {
    return /\bshe\s+(does|doesn't)\b/.test(aLower) ? 100 : -1;
  }
  if (/^can you\b/.test(qLower)) {
    return /\b(i|we)\s+(can|can't)\b/.test(aLower) ? 100 : -1;
  }
  if (/^can he\b/.test(qLower)) {
    return /\bhe\s+(can|can't)\b/.test(aLower) ? 100 : -1;
  }
  if (/^can she\b/.test(qLower)) {
    return /\bshe\s+(can|can't)\b/.test(aLower) ? 100 : -1;
  }
  if (/^were you\b/.test(qLower)) {
    return /\b(i|we)\s+(was|wasn't|were|weren't)\b/.test(aLower) ? 100 : -1;
  }
  if (/^did you\b/.test(qLower)) {
    return /\b(i|we)\s+(did|didn't)\b/.test(aLower) ? 100 : -1;
  }
  if (/^did he\b/.test(qLower)) {
    return /\bhe\s+(did|didn't)\b/.test(aLower) ? 100 : -1;
  }
  if (/^did she\b/.test(qLower)) {
    return /\bshe\s+(did|didn't)\b/.test(aLower) ? 100 : -1;
  }

  return -1;
}

function scoreWhCompatibility(qLower, aLower) {
  if (/^(yes|no)\b[,.!\s]/.test(aLower)) return -1;

  if (/^how many\b.*\bare there\b/.test(qLower)) {
    return /^(there's|there is|there are)\b/.test(aLower) ? 100 : -1;
  }
  if (/^how much is\b/.test(qLower)) {
    return (/\b(it's|it is)\b/.test(aLower) || /^that\b.*\bis\b/.test(aLower)) && /\bdollars?\b/.test(aLower) ? 100 : -1;
  }
  if (/^how much are\b/.test(qLower)) {
    return /\b(they're|they are)\b/.test(aLower) && /\bdollars?\b/.test(aLower) ? 100 : -1;
  }
  if (/^whose\b/.test(qLower)) {
    if (/\b(are these|are those)\b/.test(qLower)) {
      return /^(they're|they are)\b/.test(aLower) ? 100 : -1;
    }
    return /^(it's|it is)\b/.test(aLower) ? 100 : -1;
  }
  if (/^(what's|what is) your name\b/.test(qLower)) {
    return /\b(my name is|i'm|i am)\b/.test(aLower) ? 100 : -1;
  }
  if (/^how old are you\b/.test(qLower)) {
    return /\byears old\b|^(i'm|i am)\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\b/.test(aLower)
      ? 100
      : -1;
  }
  if (/^how are you\b/.test(qLower)) {
    return /\b(fine|good|great|ok)\b/.test(aLower) ? 100 : -1;
  }
  if (/^what color is it\b/.test(qLower)) {
    return /^(it's|it is)\s+(red|blue|green|yellow|orange|purple|pink|black|white)\b/.test(aLower) ? 100 : -1;
  }
  if (/^how's the weather\b/.test(qLower)) {
    return /^(it's|it is)\s+(sunny|rainy|cloudy|windy|warm|cold|hot|cool)\b/.test(aLower) ? 100 : -1;
  }
  if (/^what time is it\b/.test(qLower)) {
    return /^(it's|it is)\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)/.test(aLower)
      ? 100
      : -1;
  }
  if (/^what day is today\b/.test(qLower)) {
    return /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(aLower) ? 100 : -1;
  }
  if (/^what's your favorite season\b/.test(qLower)) {
    return /\bfavorite season\b/.test(aLower) ? 100 : -1;
  }
  if (/^who's he\b/.test(qLower)) {
    return /^(he's|he is)\b/.test(aLower) ? 100 : -1;
  }
  if (/^who's she\b/.test(qLower)) {
    return /^(she's|she is)\b/.test(aLower) ? 100 : -1;
  }
  if (/^what are you doing\b/.test(qLower)) {
    return /^(i'm|i am|we're|we are)\s+[a-z]+ing\b/.test(aLower) ? 100 : -1;
  }
  if (/^what's (he|she) doing\b/.test(qLower)) {
    const subj = /\bhe\b/.test(qLower) ? 'he' : 'she';
    return new RegExp(`^(${subj}'s|${subj} is)\\s+[a-z]+ing\\b`).test(aLower) ? 100 : -1;
  }
  if (/^where are you from\b/.test(qLower)) {
    return /\bfrom\b/.test(aLower) ? 100 : -1;
  }
  if (/^where are you going\b/.test(qLower)) {
    return /\bgoing to\b/.test(aLower) ? 100 : -1;
  }
  if (/^where are you\b/.test(qLower)) {
    return /^(i'm|i am|we're|we are)\s+(in|at|on|under|by)\b/.test(aLower) ? 100 : -1;
  }
  if (/^where's your grandma\b/.test(qLower)) {
    return /^(she's|she is)\s+(in|at|on)\b/.test(aLower) ? 100 : -1;
  }
  if (/^where's (my|the)\b/.test(qLower)) {
    return /^(it's|it is|the\s+\w+\s+is)\s+(in|on|under|by|next|at)\b/.test(aLower) ? 95 : -1;
  }
  if (/^what would you like\b/.test(qLower)) {
    return /^(i'd|we'd|i would|we would)\s+like\b/.test(aLower) ? 100 : -1;
  }
  if (/^what's wrong with you\b/.test(qLower)) {
    return /\bhurts?\b/.test(aLower) ? 100 : -1;
  }
  if (/^how do you go\b/.test(qLower)) {
    return /^(i|we)\s+go\b/.test(aLower) ? 100 : -1;
  }
  if (/^what time do you\b/.test(qLower)) {
    return /^(i|we)\b.*\bat\b/.test(aLower) ? 100 : -1;
  }
  if (/^what time does (he|she)\b/.test(qLower)) {
    const subj = /\bhe\b/.test(qLower) ? 'he' : 'she';
    return new RegExp(`^${subj}\\b.*\\bat\\b`).test(aLower) ? 100 : -1;
  }
  if (/^what do you do\b/.test(qLower)) {
    return /^(i|we)\s+(?!was\b|were\b)[a-z]+/.test(aLower) ? 95 : -1;
  }
  if (/^what does (he|she) do\b/.test(qLower)) {
    const subj = /\bhe\b/.test(qLower) ? 'he' : 'she';
    return new RegExp(`^${subj}\\s+[a-z]+`).test(aLower) ? 95 : -1;
  }
  if (/^where were you\b/.test(qLower)) {
    return /^(i was|we were)\b/.test(aLower) ? 100 : -1;
  }
  if (/^what did you do\b/.test(qLower)) {
    return /^(i|we)\s+[a-z]+ed\b/.test(aLower) ? 100 : -1;
  }
  if (/^(what's|what is) (this|that)\b/.test(qLower)) {
    return /^(it's|it is)\s+(a|an)\b/.test(aLower) ? 100 : -1;
  }
  if (/^what are (these|those)\b/.test(qLower)) {
    return /^(they're|they are)\b/.test(aLower) ? 100 : -1;
  }
  if (/^what can you do\b/.test(qLower)) {
    return /^(i|we)\s+can\b/.test(aLower) ? 100 : -1;
  }

  return -1;
}

export function scoreQaCompatibility(questionText, answerText) {
  const qLower = String(questionText || '').trim().toLowerCase();
  const aLower = String(answerText || '').trim().toLowerCase();
  if (!qLower.endsWith('?') || !aLower || aLower.endsWith('?')) return -1;

  if (/^(are|is|am|do|does|did|can|could|will|would|were|was)\b/.test(qLower)) {
    return scoreYesNoCompatibility(qLower, aLower);
  }
  if (/^(what|what's|who|who's|where|where's|when|why|how|how's|whose|which)\b/.test(qLower)) {
    return scoreWhCompatibility(qLower, aLower);
  }
  return -1;
}

/**
 * 依主詞、助動詞、Wh-/Yes-No 語法一致性建立課本問答配對。
 * 無相符問答的單元或純陳述句單元回傳空陣列（不在前端強行硬湊）。
 */
export function buildQaPairs(sentences = []) {
  if (!Array.isArray(sentences) || sentences.length === 0) return [];
  const pairs = [];
  const usedAnswerIndices = new Set();

  for (let i = 0; i < sentences.length; i++) {
    const q = sentences[i];
    const qText = String(q?.en || '').trim();
    if (!qText.endsWith('?')) continue;

    let bestIdx = -1;
    let bestScore = -1;

    for (let j = 0; j < sentences.length; j++) {
      if (j === i) continue;
      const a = sentences[j];
      const baseScore = scoreQaCompatibility(qText, a?.en);
      if (baseScore <= 0) continue;

      const unusedBonus = usedAnswerIndices.has(j) ? 0 : 30;
      const orderBonus = j === i + 1 ? 15 : j > i ? 8 : 0;
      const total = baseScore + unusedBonus + orderBonus;
      if (total > bestScore) {
        bestScore = total;
        bestIdx = j;
      }
    }

    if (bestIdx !== -1) {
      usedAnswerIndices.add(bestIdx);
      pairs.push({
        id: `qa_${q.id || i}_${bestIdx}`,
        question: q,
        answer: sentences[bestIdx],
      });
    }
  }

  return pairs;
}

const SINGULAR_SUBJ_BE_CONTRACTIONS = new Set(["i'm", "he's", "she's", "it's", "that's", "this's"]);
const PLURAL_SUBJ_BE_CONTRACTIONS = new Set(["we're", "you're", "they're"]);
const WH_BE_CONTRACTIONS = new Set(["what's", "who's", "where's", "how's"]);
const POSSESSIVE_WORDS = new Set(['my', 'your', 'his', 'her', 'its', 'our', 'their']);
const BARE_SINGULAR_SUBJECTS = new Set(['he', 'she', 'it']);
const BARE_PLURAL_SUBJECTS = new Set(['we', 'they', 'you']);
const VOWEL_SOUND_EXCEPTIONS_A = /^(?:uni(?:form|versity|t)|use|user|useful|one|once)/i;
const SILENT_H_AN = /^(?:hour|honest|honor)/i;
const INVARIANT_PLURALS = new Set(['glasses', 'pants', 'shorts', 'scissors', 'clothes', 'jeans']);

function isPluralNounCandidate(word = '') {
  const lower = String(word || '').trim().toLowerCase();
  if (!lower || lower.length < 3) return false;
  if (INVARIANT_PLURALS.has(lower)) return true;
  if (/(?:ss|us|is)$/.test(lower)) return false;
  return lower.endsWith('s');
}

function startsWithVowelSound(word = '') {
  const clean = String(word || '').trim();
  if (!clean) return false;
  if (VOWEL_SOUND_EXCEPTIONS_A.test(clean)) return false;
  if (SILENT_H_AN.test(clean)) return true;
  return /^[aeiou]/i.test(clean);
}

/**
 * 找出本句優先建議教師代換的「教學重點槽」索引清單（如本課單字與核心受詞／補語位置）
 */
export function getFocusSlotIndices(tokens = [], unitVocab = []) {
  if (!Array.isArray(tokens) || tokens.length === 0) return [];
  const vocabSet = new Set(
    (unitVocab || []).map((w) => String(w?.en || '').trim().toLowerCase()).filter(Boolean)
  );
  const focus = new Set();

  tokens.forEach((tok, idx) => {
    const clean = String(tok || '').trim();
    if (!clean || PUNCTUATION_RE.test(clean)) return;
    if (vocabSet.has(clean.toLowerCase())) {
      focus.add(idx);
    }
  });

  if (focus.size === 0) {
    focus.add(pickDefaultSlotIndex(tokens, unitVocab));
  }
  return Array.from(focus);
}

/**
 * 依據被選中詞槽的語法角色、單複數脈絡與縮寫結構，篩選嚴格符合文法的代換推薦字詞
 */
export function buildSlotSubstitutionChoices(tokens = [], slotIndex = 0, unitVocab = []) {
  const targetWord = String(tokens[slotIndex] || '').trim();
  if (!targetWord || PUNCTUATION_RE.test(targetWord)) return [];

  const lowerTarget = targetWord.toLowerCase();
  const prevLower = slotIndex > 0 ? String(tokens[slotIndex - 1] || '').trim().toLowerCase() : '';
  const nextLower = slotIndex + 1 < tokens.length ? String(tokens[slotIndex + 1] || '').trim().toLowerCase() : '';
  const slotRole = classifyTokenRole(targetWord, slotIndex, tokens);
  const seen = new Set([lowerTarget]);
  const list = [];

  const pushIfValid = (word) => {
    const cleaned = String(word || '').trim();
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    if (!seen.has(key) && isElementarySafeWord(cleaned)) {
      seen.add(key);
      list.push(cleaned);
    }
  };

  // 1. 若為縮寫「主詞+Be」(They're / He's / What's 等)，僅推薦同類單／複數縮寫結構，避免缺動詞或單複數衝突
  if (PLURAL_SUBJ_BE_CONTRACTIONS.has(lowerTarget)) {
    ["We're", "You're", "They're"].forEach(pushIfValid);
    return list.slice(0, 12);
  }
  if (SINGULAR_SUBJ_BE_CONTRACTIONS.has(lowerTarget)) {
    ["I'm", "He's", "She's", "It's"].forEach(pushIfValid);
    return list.slice(0, 12);
  }
  if (WH_BE_CONTRACTIONS.has(lowerTarget)) {
    ["What's", "Who's", "Where's"].forEach(pushIfValid);
    return list.slice(0, 12);
  }
  if (POSSESSIVE_WORDS.has(lowerTarget)) {
    ['my', 'your', 'his', 'her', 'our', 'their'].forEach(pushIfValid);
    return list.slice(0, 12);
  }
  if (lowerTarget === 'a' || lowerTarget === 'an') {
    ['a', 'an', 'the'].forEach(pushIfValid);
    return list.slice(0, 12);
  }

  // 2. 語意同類群組（心情、天氣、星期、數字、顏色、水果、動物、地點、交通、動作等）
  const matchedGroup = PEER_SUBSTITUTION_GROUPS.find((grp) =>
    grp.some((w) => w.toLowerCase() === lowerTarget)
  );

  // 3. 依語法槽位嚴格篩選
  if (slotRole === 'subject') {
    if (nextLower === 'am') {
      ['I'].forEach(pushIfValid);
    } else if (BARE_SINGULAR_SUBJECTS.has(lowerTarget) || nextLower === 'is' || nextLower === 'does' || nextLower === 'was') {
      ['he', 'she', 'it'].forEach(pushIfValid);
    } else if (BARE_PLURAL_SUBJECTS.has(lowerTarget) || nextLower === 'are' || nextLower === 'were') {
      ['you', 'we', 'they'].forEach(pushIfValid);
    } else if (matchedGroup) {
      matchedGroup.forEach(pushIfValid);
    } else {
      ['I', 'you', 'he', 'she', 'it', 'we', 'they'].forEach(pushIfValid);
    }
    return list.slice(0, 12);
  }

  if (slotRole === 'wh') {
    ['What', 'Who', 'Where', 'When', 'How'].forEach(pushIfValid);
    return list.slice(0, 12);
  }

  if (slotRole === 'prep') {
    if (/^(yesterday|today|tomorrow|now|last|ago|morning|afternoon|evening|night|weekends?)$/i.test(lowerTarget)) {
      ['yesterday', 'today', 'now', 'tonight'].forEach(pushIfValid);
    } else {
      ['in', 'on', 'under', 'by', 'at', 'near'].forEach(pushIfValid);
    }
    return list.slice(0, 12);
  }

  if (slotRole === 'verb') {
    if (/^[a-z]{3,}ed$/i.test(targetWord)) {
      ['visited', 'cleaned', 'watched', 'walked', 'played', 'listened', 'studied'].forEach(pushIfValid);
    } else if (/^[a-z]{3,}ing$/i.test(targetWord)) {
      ['reading', 'writing', 'swimming', 'sleeping', 'running', 'dancing', 'jogging'].forEach(pushIfValid);
    } else if (/^(am|is|are)$/.test(lowerTarget)) {
      if (prevLower === 'i') ['am'].forEach(pushIfValid);
      else if (BARE_SINGULAR_SUBJECTS.has(prevLower)) ['is'].forEach(pushIfValid);
      else if (BARE_PLURAL_SUBJECTS.has(prevLower)) ['are'].forEach(pushIfValid);
      else ['am', 'is', 'are'].forEach(pushIfValid);
    } else if (/^(was|were)$/.test(lowerTarget)) {
      ['was', 'were'].forEach(pushIfValid);
    } else {
      ['like', 'want', 'have', 'read', 'play', 'swim', 'run'].forEach(pushIfValid);
    }
    return list.slice(0, 12);
  }

  // 4. 名詞／形容詞補語槽位：若有同類群組優先列同類，並依單複數脈絡過濾本課單字
  if (matchedGroup) {
    matchedGroup.forEach(pushIfValid);
  }

  const expectsPluralNoun =
    isPluralNounCandidate(targetWord) ||
    PLURAL_SUBJ_BE_CONTRACTIONS.has(prevLower) ||
    prevLower === 'these' ||
    prevLower === 'those' ||
    prevLower === 'many';
  const expectsSingularNoun = prevLower === 'a' || prevLower === 'an';

  for (const v of unitVocab || []) {
    const candidate = String(v?.en || '').trim();
    const candLower = candidate.toLowerCase();
    if (!candidate || candidate.includes(' ')) continue;
    if (FUNCTION_STOP_WORDS.has(candLower)) continue;
    if (classifyTokenRole(candidate, 0, [candidate]) !== 'object') continue;
    if (expectsPluralNoun && !isPluralNounCandidate(candidate)) continue;
    if (expectsSingularNoun && isPluralNounCandidate(candidate)) continue;
    pushIfValid(candidate);
  }

  if (expectsPluralNoun && list.length < 4) {
    ['apples', 'bananas', 'oranges', 'cats', 'dogs', 'lions', 'books', 'pencils'].forEach(pushIfValid);
  }

  return list.slice(0, 12);
}

/**
 * 代換後即時文法檢視與安全自動校正：
 * - 自動補正：句首大寫、I 大寫、a/an 依發音自動對齊、Be 動詞與主詞單複數／Do-Does 對齊。
 * - 紅色文法警示：若出現缺動詞（如 She oranges.）或主詞與名詞單複數衝突（如 He's oranges.），標註錯誤位置與說明。
 */
export function validateAndNormalizeSubstitutedTokens(rawTokens = [], { autoCorrect = true } = {}) {
  if (!Array.isArray(rawTokens) || rawTokens.length === 0) {
    return { tokens: [], autoFixes: [], errors: [] };
  }

  const tokens = rawTokens.map((t) => String(t ?? '').trim());
  const autoFixes = [];
  const errors = [];

  if (autoCorrect) {
    // 1. 句首大寫與 "I" 大寫補正
    const first = tokens[0];
    if (first && !PUNCTUATION_RE.test(first)) {
      if (first.toLowerCase() === "i'm") {
        if (first !== "I'm") {
          tokens[0] = "I'm";
          autoFixes.push('已校正句首 I\'m 大寫');
        }
      } else if (/^[a-z]/.test(first)) {
        tokens[0] = first[0].toUpperCase() + first.slice(1);
        autoFixes.push('已自動將句首字母改為大寫');
      }
    }
    for (let i = 1; i < tokens.length; i++) {
      if (tokens[i] === 'i') {
        tokens[i] = 'I';
        autoFixes.push('已將人稱 I 改為大寫');
      } else if (tokens[i] === "i'm") {
        tokens[i] = "I'm";
        autoFixes.push("已將 I'm 改為大寫");
      }
    }

    // 2. a / an 依後方開頭發音自動校正
    for (let i = 0; i < tokens.length - 1; i++) {
      const currLower = tokens[i].toLowerCase();
      const nextTok = tokens[i + 1];
      if ((currLower === 'a' || currLower === 'an') && nextTok && !PUNCTUATION_RE.test(nextTok)) {
        const expected = startsWithVowelSound(nextTok) ? 'an' : 'a';
        if (currLower !== expected) {
          tokens[i] = tokens[i][0] === tokens[i][0].toUpperCase()
            ? expected[0].toUpperCase() + expected.slice(1)
            : expected;
          autoFixes.push(`已依「${nextTok}」開頭發音自動校正冠詞為 ${tokens[i]}`);
        }
      }
    }

    // 3. 主詞與 Be 動詞 / Do-Does 一致性自動校正
    for (let i = 0; i < tokens.length - 1; i++) {
      const subj = tokens[i].toLowerCase();
      const verb = tokens[i + 1].toLowerCase();
      const preserveUpper = tokens[i + 1][0] && tokens[i + 1][0] === tokens[i + 1][0].toUpperCase();
      const formatCase = (w) => (preserveUpper ? w[0].toUpperCase() + w.slice(1) : w);

      if (subj === 'i' && (verb === 'is' || verb === 'are')) {
        tokens[i + 1] = formatCase('am');
        autoFixes.push('已將 I 後方的 Be 動詞校正為 am');
      } else if (BARE_SINGULAR_SUBJECTS.has(subj) && (verb === 'am' || verb === 'are')) {
        tokens[i + 1] = formatCase('is');
        autoFixes.push(`已將 ${tokens[i]} 後方的 Be 動詞校正為 is`);
      } else if (BARE_PLURAL_SUBJECTS.has(subj) && (verb === 'am' || verb === 'is')) {
        tokens[i + 1] = formatCase('are');
        autoFixes.push(`已將 ${tokens[i]} 後方的 Be 動詞校正為 are`);
      } else if (BARE_SINGULAR_SUBJECTS.has(subj) && verb === 'do') {
        tokens[i + 1] = formatCase('does');
        autoFixes.push(`已將 ${tokens[i]} 的助動詞校正為 does`);
      } else if ((subj === 'i' || BARE_PLURAL_SUBJECTS.has(subj)) && verb === 'does') {
        tokens[i + 1] = formatCase('do');
        autoFixes.push(`已將 ${tokens[i]} 的助動詞校正為 do`);
      }
    }
  }

  // 4. 結構性文法錯誤檢查（標紅提醒）
  const hasAnyVerbOrBeContraction = tokens.some((tok, idx) => {
    const low = tok.toLowerCase();
    return (
      classifyTokenRole(tok, idx, tokens) === 'verb' ||
      SINGULAR_SUBJ_BE_CONTRACTIONS.has(low) ||
      PLURAL_SUBJ_BE_CONTRACTIONS.has(low) ||
      WH_BE_CONTRACTIONS.has(low)
    );
  });

  if (!hasAnyVerbOrBeContraction && tokens.length >= 2) {
    const firstLower = tokens[0].toLowerCase();
    if (firstLower === 'i' || BARE_SINGULAR_SUBJECTS.has(firstLower) || BARE_PLURAL_SUBJECTS.has(firstLower)) {
      errors.push({
        messageZh: `句子缺少動詞！「${tokens[0]}」不能直接接「${tokens[1]}」，請加上 Be 動詞／一般動詞（如 ${tokens[0]}'s 或使用 They're）。`,
        indices: [0, 1],
      });
    }
  }

  // 檢查單數「主詞+Be」配複數名詞（如 He's oranges.）或複數「主詞+Be」配 a/an 單數（如 They're a book.）
  for (let i = 0; i < tokens.length - 1; i++) {
    const low = tokens[i].toLowerCase();
    const nextLow = tokens[i + 1].toLowerCase();
    if (SINGULAR_SUBJ_BE_CONTRACTIONS.has(low) && isPluralNounCandidate(tokens[i + 1])) {
      errors.push({
        messageZh: `單複數不一致！單數結構「${tokens[i]}」後方不可接複數名詞「${tokens[i + 1]}」，請改用複數（They're）或改為單數名詞。`,
        indices: [i, i + 1],
      });
    } else if (PLURAL_SUBJ_BE_CONTRACTIONS.has(low) && (nextLow === 'a' || nextLow === 'an')) {
      errors.push({
        messageZh: `單複數不一致！複數結構「${tokens[i]}」後方不可接單數冠詞「${tokens[i + 1]}」。`,
        indices: [i, i + 1],
      });
    }
  }

  return { tokens, autoFixes, errors };
}
