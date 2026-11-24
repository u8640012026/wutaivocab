import { getAvailableSentences } from '../../../data/sentencePatterns.js';

/**
 * 確定性美式音標轉換器：IPA → KK 音標
 * 專為台灣國小教師與學生習慣設計，保留重音位置與常見雙母音／長母音對照。
 */
export const ipaToKK = (rawIpa = '') => {
  const s = String(rawIpa || '').trim();
  if (!s) return '';

  let body = s.replace(/^\/+|\/+$/g, '').trim();
  body = body
    .replace(/ˈ/g, '`')
    .replace(/ˌ/g, '͵')
    .replace(/eɪ/g, 'e')
    .replace(/oʊ/g, 'o')
    .replace(/iː/g, 'i')
    .replace(/uː/g, 'u')
    .replace(/ɑː/g, 'ɑ')
    .replace(/ɔː/g, 'ɔ')
    .replace(/ɜːr?/g, 'ɝ')
    .replace(/ɝ/g, 'ɝ')
    .replace(/ər/g, 'ɚ')
    .replace(/ɚ/g, 'ɚ')
    .replace(/ː/g, '');

  return `[${body}]`;
};

const splitSingleWordSyllablesFallback = (word = '') => {
  const clean = word.trim();
  if (!clean) return [];
  if (clean.length <= 4) return [clean];

  const regex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi;
  const matches = clean.match(regex);
  if (!matches || matches.length <= 1) return [clean];

  // 避免末尾出現純無母音孤立子音塊（如 "-le" 或單子音被拆出）
  const merged = [];
  for (let i = 0; i < matches.length; i++) {
    const part = matches[i];
    if (i > 0 && !/[aeiouy]/i.test(part)) {
      merged[merged.length - 1] += part;
    } else if (merged.length > 0 && part.length === 1 && !/[aeiouy]/i.test(part)) {
      merged[merged.length - 1] += part;
    } else {
      merged.push(part);
    }
  }
  return merged.length > 0 ? merged : [clean];
};

/**
 * 智慧英文音節拆分器（支援複合詞與片語）
 */
export const splitWordSyllables = (phrase = '') => {
  const clean = String(phrase || '').trim();
  if (!clean) return [];
  const words = clean.split(/[\s-]+/).filter(Boolean);
  if (words.length > 1) {
    return words.flatMap((w) => splitSingleWordSyllablesFallback(w));
  }
  return splitSingleWordSyllablesFallback(clean);
};

// ── Here We Go 第 1～8 冊 40 單元完整核心字彙離線辭典 (100% 離線可用) ──
export const OFFLINE_VOCAB_DICT = {
  // Numbers
  one: { ipa: '/wʌn/', syllables: ['one'], pos: 'num.', synonyms: ['single'], antonyms: [] },
  two: { ipa: '/tuː/', syllables: ['two'], pos: 'num.', synonyms: ['pair'], antonyms: [] },
  three: { ipa: '/θriː/', syllables: ['three'], pos: 'num.', synonyms: [], antonyms: [] },
  four: { ipa: '/fɔːr/', syllables: ['four'], pos: 'num.', synonyms: [], antonyms: [] },
  five: { ipa: '/faɪv/', syllables: ['five'], pos: 'num.', synonyms: [], antonyms: [] },
  six: { ipa: '/sɪks/', syllables: ['six'], pos: 'num.', synonyms: [], antonyms: [] },
  seven: { ipa: '/ˈsɛvən/', syllables: ['sev', 'en'], pos: 'num.', synonyms: [], antonyms: [] },
  eight: { ipa: '/eɪt/', syllables: ['eight'], pos: 'num.', synonyms: [], antonyms: [] },
  nine: { ipa: '/naɪn/', syllables: ['nine'], pos: 'num.', synonyms: [], antonyms: [] },
  ten: { ipa: '/tɛn/', syllables: ['ten'], pos: 'num.', synonyms: [], antonyms: [] },
  eleven: { ipa: '/ɪˈlɛvən/', syllables: ['e', 'lev', 'en'], pos: 'num.', synonyms: [], antonyms: [] },
  twelve: { ipa: '/twɛlv/', syllables: ['twelve'], pos: 'num.', synonyms: ['dozen'], antonyms: [] },
  thirteen: { ipa: '/ˌθɜːrˈtiːn/', syllables: ['thir', 'teen'], pos: 'num.', synonyms: [], antonyms: [] },
  fourteen: { ipa: '/ˌfɔːrˈtiːn/', syllables: ['four', 'teen'], pos: 'num.', synonyms: [], antonyms: [] },
  fifteen: { ipa: '/ˌfɪfˈtiːn/', syllables: ['fif', 'teen'], pos: 'num.', synonyms: [], antonyms: [] },
  sixteen: { ipa: '/ˌsɪkˈstiːn/', syllables: ['six', 'teen'], pos: 'num.', synonyms: [], antonyms: [] },
  seventeen: { ipa: '/ˌsɛvənˈtiːn/', syllables: ['sev', 'en', 'teen'], pos: 'num.', synonyms: [], antonyms: [] },
  eighteen: { ipa: '/ˌeɪˈtiːn/', syllables: ['eigh', 'teen'], pos: 'num.', synonyms: [], antonyms: [] },
  nineteen: { ipa: '/ˌnaɪnˈtiːn/', syllables: ['nine', 'teen'], pos: 'num.', synonyms: [], antonyms: [] },
  twenty: { ipa: '/ˈtwɛnti/', syllables: ['twen', 'ty'], pos: 'num.', synonyms: [], antonyms: [] },
  'twenty-one': { ipa: '/ˌtwɛntiˈwʌn/', syllables: ['twen', 'ty', 'one'], pos: 'num.', synonyms: [], antonyms: [] },
  'twenty-five': { ipa: '/ˌtwɛntiˈfaɪv/', syllables: ['twen', 'ty', 'five'], pos: 'num.', synonyms: [], antonyms: [] },
  thirty: { ipa: '/ˈθɜːrti/', syllables: ['thir', 'ty'], pos: 'num.', synonyms: [], antonyms: [] },
  'thirty-five': { ipa: '/ˌθɜːrtiˈfaɪv/', syllables: ['thir', 'ty', 'five'], pos: 'num.', synonyms: [], antonyms: [] },
  forty: { ipa: '/ˈfɔːrti/', syllables: ['for', 'ty'], pos: 'num.', synonyms: [], antonyms: [] },
  'forty-five': { ipa: '/ˌfɔːrtiˈfaɪv/', syllables: ['for', 'ty', 'five'], pos: 'num.', synonyms: [], antonyms: [] },
  fifty: { ipa: '/ˈfɪfti/', syllables: ['fif', 'ty'], pos: 'num.', synonyms: [], antonyms: [] },
  'fifty-five': { ipa: '/ˌfɪftiˈfaɪv/', syllables: ['fif', 'ty', 'five'], pos: 'num.', synonyms: [], antonyms: [] },
  sixty: { ipa: '/ˈsɪksti/', syllables: ['six', 'ty'], pos: 'num.', synonyms: [], antonyms: [] },
  seventy: { ipa: '/ˈsɛvənti/', syllables: ['sev', 'en', 'ty'], pos: 'num.', synonyms: [], antonyms: [] },
  eighty: { ipa: '/ˈeɪti/', syllables: ['eigh', 'ty'], pos: 'num.', synonyms: [], antonyms: [] },
  ninety: { ipa: '/ˈnaɪnti/', syllables: ['nine', 'ty'], pos: 'num.', synonyms: [], antonyms: [] },
  'one hundred': { ipa: '/wʌn ˈhʌndrəd/', syllables: ['one', 'hun', 'dred'], pos: 'num.', synonyms: [], antonyms: [] },
  'two hundred': { ipa: '/tuː ˈhʌndrəd/', syllables: ['two', 'hun', 'dred'], pos: 'num.', synonyms: [], antonyms: [] },
  'five hundred': { ipa: '/faɪv ˈhʌndrəd/', syllables: ['five', 'hun', 'dred'], pos: 'num.', synonyms: [], antonyms: [] },
  'one thousand': { ipa: '/wʌn ˈθaʊzənd/', syllables: ['one', 'thou', 'sand'], pos: 'num.', synonyms: [], antonyms: [] },

  // B1 Core & Phonics Examples
  ant: { ipa: '/ænt/', syllables: ['ant'], pos: 'n.', synonyms: ['insect', 'bug'], antonyms: [] },
  apple: { ipa: '/ˈæpəl/', syllables: ['ap', 'ple'], pos: 'n.', synonyms: ['fruit'], antonyms: [] },
  bag: { ipa: '/bæɡ/', syllables: ['bag'], pos: 'n.', synonyms: ['backpack', 'sack'], antonyms: [] },
  boy: { ipa: '/bɔɪ/', syllables: ['boy'], pos: 'n.', synonyms: ['kid'], antonyms: ['girl'] },
  cat: { ipa: '/kæt/', syllables: ['cat'], pos: 'n.', synonyms: ['kitty', 'pet'], antonyms: ['dog'] },
  cup: { ipa: '/kʌp/', syllables: ['cup'], pos: 'n.', synonyms: ['mug', 'glass'], antonyms: [] },
  dog: { ipa: '/dɔːɡ/', syllables: ['dog'], pos: 'n.', synonyms: ['puppy', 'pet'], antonyms: ['cat'] },
  duck: { ipa: '/dʌk/', syllables: ['duck'], pos: 'n.', synonyms: ['bird'], antonyms: [] },
  egg: { ipa: '/ɛɡ/', syllables: ['egg'], pos: 'n.', synonyms: [], antonyms: [] },
  elephant: { ipa: '/ˈɛlɪfənt/', syllables: ['el', 'e', 'phant'], pos: 'n.', synonyms: ['animal'], antonyms: [] },
  name: { ipa: '/neɪm/', syllables: ['name'], pos: 'n.', synonyms: ['title'], antonyms: [] },
  fine: { ipa: '/faɪn/', syllables: ['fine'], pos: 'adj.', synonyms: ['good', 'great', 'well'], antonyms: ['bad', 'sick'] },
  fish: { ipa: '/fɪʃ/', syllables: ['fish'], pos: 'n.', synonyms: [], antonyms: [] },
  goat: { ipa: '/ɡoʊt/', syllables: ['goat'], pos: 'n.', synonyms: [], antonyms: [] },
  hat: { ipa: '/hæt/', syllables: ['hat'], pos: 'n.', synonyms: ['cap'], antonyms: [] },
  igloo: { ipa: '/ˈɪɡluː/', syllables: ['ig', 'loo'], pos: 'n.', synonyms: ['snow house'], antonyms: [] },
  jam: { ipa: '/dʒæm/', syllables: ['jam'], pos: 'n.', synonyms: ['jelly'], antonyms: [] },
  kite: { ipa: '/kaɪt/', syllables: ['kite'], pos: 'n.', synonyms: ['toy'], antonyms: [] },
  lion: { ipa: '/ˈlaɪən/', syllables: ['li', 'on'], pos: 'n.', synonyms: ['big cat'], antonyms: [] },
  map: { ipa: '/mæp/', syllables: ['map'], pos: 'n.', synonyms: ['chart'], antonyms: [] },
  nut: { ipa: '/nʌt/', syllables: ['nut'], pos: 'n.', synonyms: ['seed'], antonyms: [] },
  octopus: { ipa: '/ˈɑːktəpəs/', syllables: ['oc', 'to', 'pus'], pos: 'n.', synonyms: ['sea animal'], antonyms: [] },
  book: { ipa: '/bʊk/', syllables: ['book'], pos: 'n.', synonyms: ['textbook'], antonyms: [] },
  pen: { ipa: '/pɛn/', syllables: ['pen'], pos: 'n.', synonyms: ['marker'], antonyms: [] },
  pencil: { ipa: '/ˈpɛnsəl/', syllables: ['pen', 'cil'], pos: 'n.', synonyms: [], antonyms: [] },
  eraser: { ipa: '/ɪˈreɪsər/', syllables: ['e', 'ras', 'er'], pos: 'n.', synonyms: ['rubber'], antonyms: [] },
  ruler: { ipa: '/ˈruːlər/', syllables: ['rul', 'er'], pos: 'n.', synonyms: [], antonyms: [] },
  marker: { ipa: '/ˈmɑːrkər/', syllables: ['mark', 'er'], pos: 'n.', synonyms: ['crayon'], antonyms: [] },
  blue: { ipa: '/bluː/', syllables: ['blue'], pos: 'n./adj.', synonyms: ['navy', 'sky blue'], antonyms: [] },
  green: { ipa: '/ɡriːn/', syllables: ['green'], pos: 'n./adj.', synonyms: [], antonyms: [] },
  red: { ipa: '/rɛd/', syllables: ['red'], pos: 'n./adj.', synonyms: ['crimson'], antonyms: [] },
  yellow: { ipa: '/ˈjɛloʊ/', syllables: ['yel', 'low'], pos: 'n./adj.', synonyms: ['gold'], antonyms: [] },
  black: { ipa: '/blæk/', syllables: ['black'], pos: 'n./adj.', synonyms: ['dark'], antonyms: ['white'] },
  white: { ipa: '/waɪt/', syllables: ['white'], pos: 'n./adj.', synonyms: ['snowy'], antonyms: ['black'] },

  // B2 Pets, Abilities, Family, Jobs
  small: { ipa: '/smɔːl/', syllables: ['small'], pos: 'adj.', synonyms: ['little', 'tiny'], antonyms: ['big', 'large'] },
  big: { ipa: '/bɪɡ/', syllables: ['big'], pos: 'adj.', synonyms: ['large', 'huge'], antonyms: ['small', 'little'] },
  bird: { ipa: '/bɜːrd/', syllables: ['bird'], pos: 'n.', synonyms: [], antonyms: [] },
  dance: { ipa: '/dæns/', syllables: ['dance'], pos: 'v.', synonyms: ['move'], antonyms: ['sit'] },
  draw: { ipa: '/drɔː/', syllables: ['draw'], pos: 'v.', synonyms: ['paint', 'sketch'], antonyms: [] },
  jump: { ipa: '/dʒʌmp/', syllables: ['jump'], pos: 'v.', synonyms: ['hop', 'leap'], antonyms: ['sit'] },
  read: { ipa: '/riːd/', syllables: ['read'], pos: 'v.', synonyms: ['study'], antonyms: ['write'] },
  sing: { ipa: '/sɪŋ/', syllables: ['sing'], pos: 'v.', synonyms: ['hum'], antonyms: [] },
  swim: { ipa: '/swɪm/', syllables: ['swim'], pos: 'v.', synonyms: ['dive'], antonyms: [] },
  write: { ipa: '/raɪt/', syllables: ['write'], pos: 'v.', synonyms: ['draw'], antonyms: ['read'] },
  grandfather: { ipa: '/ˈɡrændˌfɑːðər/', syllables: ['grand', 'fa', 'ther'], pos: 'n.', synonyms: ['grandpa'], antonyms: [] },
  grandmother: { ipa: '/ˈɡrændˌmʌðər/', syllables: ['grand', 'moth', 'er'], pos: 'n.', synonyms: ['grandma'], antonyms: [] },
  father: { ipa: '/ˈfɑːðər/', syllables: ['fa', 'ther'], pos: 'n.', synonyms: ['dad'], antonyms: ['mother'] },
  mother: { ipa: '/ˈmʌðər/', syllables: ['moth', 'er'], pos: 'n.', synonyms: ['mom'], antonyms: ['father'] },
  brother: { ipa: '/ˈbrʌðər/', syllables: ['broth', 'er'], pos: 'n.', synonyms: ['sibling'], antonyms: ['sister'] },
  sister: { ipa: '/ˈsɪstər/', syllables: ['sis', 'ter'], pos: 'n.', synonyms: ['sibling'], antonyms: ['brother'] },
  tall: { ipa: '/tɔːl/', syllables: ['tall'], pos: 'adj.', synonyms: ['high'], antonyms: ['short'] },
  short: { ipa: '/ʃɔːrt/', syllables: ['short'], pos: 'adj.', synonyms: ['little'], antonyms: ['tall', 'long'] },
  student: { ipa: '/ˈstuːdənt/', syllables: ['stu', 'dent'], pos: 'n.', synonyms: ['pupil'], antonyms: ['teacher'] },
  teacher: { ipa: '/ˈtiːtʃər/', syllables: ['teach', 'er'], pos: 'n.', synonyms: ['instructor'], antonyms: ['student'] },
  doctor: { ipa: '/ˈdɑːktər/', syllables: ['doc', 'tor'], pos: 'n.', synonyms: ['vet'], antonyms: [] },
  nurse: { ipa: '/nɜːrs/', syllables: ['nurse'], pos: 'n.', synonyms: ['helper'], antonyms: [] },
  cook: { ipa: '/kʊk/', syllables: ['cook'], pos: 'n./v.', synonyms: ['chef'], antonyms: [] },
  driver: { ipa: '/ˈdraɪvər/', syllables: ['driv', 'er'], pos: 'n.', synonyms: [], antonyms: [] },

  // B3 Weather, Feelings, Food
  sunny: { ipa: '/ˈsʌni/', syllables: ['sun', 'ny'], pos: 'adj.', synonyms: ['bright', 'clear'], antonyms: ['rainy', 'cloudy'] },
  rainy: { ipa: '/ˈreɪni/', syllables: ['rain', 'y'], pos: 'adj.', synonyms: ['wet'], antonyms: ['sunny', 'dry'] },
  cloudy: { ipa: '/ˈklaʊdi/', syllables: ['cloud', 'y'], pos: 'adj.', synonyms: ['foggy'], antonyms: ['sunny'] },
  windy: { ipa: '/ˈwɪndi/', syllables: ['wind', 'y'], pos: 'adj.', synonyms: ['breezy'], antonyms: ['calm'] },
  hot: { ipa: '/hɑːt/', syllables: ['hot'], pos: 'adj.', synonyms: ['warm'], antonyms: ['cold', 'cool'] },
  warm: { ipa: '/wɔːrm/', syllables: ['warm'], pos: 'adj.', synonyms: ['cozy'], antonyms: ['cool', 'cold'] },
  cool: { ipa: '/kuːl/', syllables: ['cool'], pos: 'adj.', synonyms: ['chilly'], antonyms: ['warm', 'hot'] },
  cold: { ipa: '/koʊld/', syllables: ['cold'], pos: 'adj./n.', synonyms: ['freezing', 'icy'], antonyms: ['hot', 'warm'] },
  angry: { ipa: '/ˈæŋɡri/', syllables: ['an', 'gry'], pos: 'adj.', synonyms: ['mad'], antonyms: ['happy', 'glad'] },
  happy: { ipa: '/ˈhæpi/', syllables: ['hap', 'py'], pos: 'adj.', synonyms: ['glad', 'joyful'], antonyms: ['sad', 'angry'] },
  sad: { ipa: '/sæd/', syllables: ['sad'], pos: 'adj.', synonyms: ['unhappy'], antonyms: ['happy', 'glad'] },
  tired: { ipa: '/ˈtaɪərd/', syllables: ['tired'], pos: 'adj.', synonyms: ['sleepy'], antonyms: ['energetic'] },
  hungry: { ipa: '/ˈhʌŋɡri/', syllables: ['hun', 'gry'], pos: 'adj.', synonyms: ['starving'], antonyms: ['full'] },
  thirsty: { ipa: '/ˈθɜːrsti/', syllables: ['thirst', 'y'], pos: 'adj.', synonyms: [], antonyms: ['full'] },
  full: { ipa: '/fʊl/', syllables: ['full'], pos: 'adj.', synonyms: ['stuffed'], antonyms: ['hungry', 'empty'] },
  apples: { ipa: '/ˈæpəlz/', syllables: ['ap', 'ples'], pos: 'n.(pl.)', synonyms: ['fruit'], antonyms: [] },
  bananas: { ipa: '/bəˈnænəz/', syllables: ['ba', 'nan', 'as'], pos: 'n.(pl.)', synonyms: ['fruit'], antonyms: [] },
  oranges: { ipa: '/ˈɔːrɪndʒɪz/', syllables: ['or', 'ang', 'es'], pos: 'n.(pl.)', synonyms: ['fruit'], antonyms: [] },
  watermelons: { ipa: '/ˈwɔːtərˌmɛlənz/', syllables: ['wa', 'ter', 'mel', 'ons'], pos: 'n.(pl.)', synonyms: ['melon'], antonyms: [] },
  'hot dogs': { ipa: '/ˈhɑːt dɔːɡz/', syllables: ['hot', 'dogs'], pos: 'n.(pl.)', synonyms: ['sausage'], antonyms: [] },
  hamburgers: { ipa: '/ˈhæmˌbɜːrɡərz/', syllables: ['ham', 'bur', 'gers'], pos: 'n.(pl.)', synonyms: ['burgers'], antonyms: [] },
  sandwiches: { ipa: '/ˈsænwɪtʃɪz/', syllables: ['sand', 'wich', 'es'], pos: 'n.(pl.)', synonyms: [], antonyms: [] },
  juice: { ipa: '/dʒuːs/', syllables: ['juice'], pos: 'n.', synonyms: ['drink'], antonyms: [] },
  milk: { ipa: '/mɪlk/', syllables: ['milk'], pos: 'n.', synonyms: ['dairy'], antonyms: [] },
  water: { ipa: '/ˈwɔːtər/', syllables: ['wa', 'ter'], pos: 'n.', synonyms: [], antonyms: [] },
  tea: { ipa: '/tiː/', syllables: ['tea'], pos: 'n.', synonyms: ['drink'], antonyms: [] },
  cake: { ipa: '/keɪk/', syllables: ['cake'], pos: 'n.', synonyms: ['dessert'], antonyms: [] },
  pizza: { ipa: '/ˈpiːtsə/', syllables: ['piz', 'za'], pos: 'n.', synonyms: [], antonyms: [] },
  rice: { ipa: '/raɪs/', syllables: ['rice'], pos: 'n.', synonyms: [], antonyms: [] },
  'ice cream': { ipa: '/ˈaɪs kriːm/', syllables: ['ice', 'cream'], pos: 'n.', synonyms: ['dessert'], antonyms: [] },

  // B4 Actions, House Rooms, Household Objects
  drinking: { ipa: '/ˈdrɪŋkɪŋ/', syllables: ['drink', 'ing'], pos: 'v.', synonyms: ['sipping'], antonyms: ['eating'] },
  eating: { ipa: '/ˈiːtɪŋ/', syllables: ['eat', 'ing'], pos: 'v.', synonyms: ['having'], antonyms: ['drinking'] },
  reading: { ipa: '/ˈriːdɪŋ/', syllables: ['read', 'ing'], pos: 'v.', synonyms: ['studying'], antonyms: ['writing'] },
  sleeping: { ipa: '/ˈsliːpɪŋ/', syllables: ['sleep', 'ing'], pos: 'v.', synonyms: ['napping'], antonyms: ['running'] },
  writing: { ipa: '/ˈraɪtɪŋ/', syllables: ['writ', 'ing'], pos: 'v.', synonyms: [], antonyms: ['reading'] },
  running: { ipa: '/ˈrʌnɪŋ/', syllables: ['run', 'ning'], pos: 'v.', synonyms: ['jogging'], antonyms: ['walking'] },
  swimming: { ipa: '/ˈswɪmɪŋ/', syllables: ['swim', 'ming'], pos: 'v.', synonyms: [], antonyms: [] },
  bathroom: { ipa: '/ˈbæθruːm/', syllables: ['bath', 'room'], pos: 'n.', synonyms: ['restroom'], antonyms: [] },
  bedroom: { ipa: '/ˈbɛdruːm/', syllables: ['bed', 'room'], pos: 'n.', synonyms: [], antonyms: [] },
  'dining room': { ipa: '/ˈdaɪnɪŋ ruːm/', syllables: ['din', 'ing', 'room'], pos: 'n.', synonyms: [], antonyms: [] },
  'living room': { ipa: '/ˈlɪvɪŋ ruːm/', syllables: ['liv', 'ing', 'room'], pos: 'n.', synonyms: [], antonyms: [] },
  kitchen: { ipa: '/ˈkɪtʃən/', syllables: ['kitch', 'en'], pos: 'n.', synonyms: [], antonyms: [] },
  yard: { ipa: '/jɑːrd/', syllables: ['yard'], pos: 'n.', synonyms: ['garden'], antonyms: [] },
  box: { ipa: '/bɑːks/', syllables: ['box'], pos: 'n.', synonyms: ['case'], antonyms: [] },
  chair: { ipa: '/tʃɛr/', syllables: ['chair'], pos: 'n.', synonyms: ['seat'], antonyms: [] },
  computer: { ipa: '/kəmˈpjuːtər/', syllables: ['com', 'pu', 'ter'], pos: 'n.', synonyms: ['PC'], antonyms: [] },
  desk: { ipa: '/dɛsk/', syllables: ['desk'], pos: 'n.', synonyms: ['table'], antonyms: [] },
  table: { ipa: '/ˈteɪbəl/', syllables: ['ta', 'ble'], pos: 'n.', synonyms: ['desk'], antonyms: [] },

  // B5 Days, Subjects, Places, Animals
  Sunday: { ipa: '/ˈsʌndeɪ/', syllables: ['Sun', 'day'], pos: 'n.', synonyms: [], antonyms: [] },
  Monday: { ipa: '/ˈmʌndeɪ/', syllables: ['Mon', 'day'], pos: 'n.', synonyms: [], antonyms: [] },
  Tuesday: { ipa: '/ˈtuːzdeɪ/', syllables: ['Tues', 'day'], pos: 'n.', synonyms: [], antonyms: [] },
  Wednesday: { ipa: '/ˈwɛnzdeɪ/', syllables: ['Wednes', 'day'], pos: 'n.', synonyms: [], antonyms: [] },
  Thursday: { ipa: '/ˈθɜːrzdeɪ/', syllables: ['Thurs', 'day'], pos: 'n.', synonyms: [], antonyms: [] },
  Friday: { ipa: '/ˈfraɪdeɪ/', syllables: ['Fri', 'day'], pos: 'n.', synonyms: [], antonyms: [] },
  Saturday: { ipa: '/ˈsætərdeɪ/', syllables: ['Sat', 'ur', 'day'], pos: 'n.', synonyms: [], antonyms: [] },
  art: { ipa: '/ɑːrt/', syllables: ['art'], pos: 'n.', synonyms: ['drawing'], antonyms: [] },
  Chinese: { ipa: '/ˌtʃaɪˈniːz/', syllables: ['Chi', 'nese'], pos: 'n.', synonyms: [], antonyms: [] },
  English: { ipa: '/ˈɪŋɡlɪʃ/', syllables: ['Eng', 'lish'], pos: 'n.', synonyms: [], antonyms: [] },
  math: { ipa: '/mæθ/', syllables: ['math'], pos: 'n.', synonyms: [], antonyms: [] },
  music: { ipa: '/ˈmjuːzɪk/', syllables: ['mu', 'sic'], pos: 'n.', synonyms: ['song'], antonyms: [] },
  PE: { ipa: '/ˌpiːˈiː/', syllables: ['PE'], pos: 'n.', synonyms: ['sports'], antonyms: [] },
  science: { ipa: '/ˈsaɪəns/', syllables: ['sci', 'ence'], pos: 'n.', synonyms: [], antonyms: [] },
  'social studies': { ipa: '/ˈsoʊʃəl ˈstʌdiz/', syllables: ['so', 'cial', 'stud', 'ies'], pos: 'n.', synonyms: [], antonyms: [] },
  bank: { ipa: '/bæŋk/', syllables: ['bank'], pos: 'n.', synonyms: [], antonyms: [] },
  bookstore: { ipa: '/ˈbʊkstɔːr/', syllables: ['book', 'store'], pos: 'n.', synonyms: ['bookshop'], antonyms: [] },
  hospital: { ipa: '/ˈhɑːspɪtəl/', syllables: ['hos', 'pi', 'tal'], pos: 'n.', synonyms: ['clinic'], antonyms: [] },
  library: { ipa: '/ˈlaɪˌbrɛri/', syllables: ['li', 'brar', 'y'], pos: 'n.', synonyms: [], antonyms: [] },
  museum: { ipa: '/mjuˈziːəm/', syllables: ['mu', 'se', 'um'], pos: 'n.', synonyms: [], antonyms: [] },
  park: { ipa: '/pɑːrk/', syllables: ['park'], pos: 'n.', synonyms: ['garden'], antonyms: [] },
  'post office': { ipa: '/ˈpoʊst ˌɔːfɪs/', syllables: ['post', 'of', 'fice'], pos: 'n.', synonyms: [], antonyms: [] },
  supermarket: { ipa: '/ˈsuːpərˌmɑːrkɪt/', syllables: ['su', 'per', 'mar', 'ket'], pos: 'n.', synonyms: ['grocery store'], antonyms: [] },
  horse: { ipa: '/hɔːrs/', syllables: ['horse'], pos: 'n.', synonyms: ['pony'], antonyms: [] },
  monkey: { ipa: '/ˈmʌŋki/', syllables: ['mon', 'key'], pos: 'n.', synonyms: [], antonyms: [] },
  tiger: { ipa: '/ˈtaɪɡər/', syllables: ['ti', 'ger'], pos: 'n.', synonyms: [], antonyms: [] },
  turtle: { ipa: '/ˈtɜːrtəl/', syllables: ['tur', 'tle'], pos: 'n.', synonyms: ['tortoise'], antonyms: [] },
  zebra: { ipa: '/ˈziːbrə/', syllables: ['ze', 'bra'], pos: 'n.', synonyms: [], antonyms: [] },
  koala: { ipa: '/koʊˈɑːlə/', syllables: ['ko', 'a', 'la'], pos: 'n.', synonyms: [], antonyms: [] },

  // B6 Body Parts, Illness, Meals, Personal Items
  eyes: { ipa: '/aɪz/', syllables: ['eyes'], pos: 'n.(pl.)', synonyms: [], antonyms: [] },
  ears: { ipa: '/ɪrz/', syllables: ['ears'], pos: 'n.(pl.)', synonyms: [], antonyms: [] },
  nose: { ipa: '/noʊz/', syllables: ['nose'], pos: 'n.', synonyms: [], antonyms: [] },
  mouth: { ipa: '/maʊθ/', syllables: ['mouth'], pos: 'n.', synonyms: [], antonyms: [] },
  hands: { ipa: '/hændz/', syllables: ['hands'], pos: 'n.(pl.)', synonyms: [], antonyms: [] },
  arms: { ipa: '/ɑːrmz/', syllables: ['arms'], pos: 'n.(pl.)', synonyms: [], antonyms: [] },
  legs: { ipa: '/lɛɡz/', syllables: ['legs'], pos: 'n.(pl.)', synonyms: [], antonyms: [] },
  foot: { ipa: '/fʊt/', syllables: ['foot'], pos: 'n.', synonyms: [], antonyms: [] },
  feet: { ipa: '/fiːt/', syllables: ['feet'], pos: 'n.(pl.)', synonyms: [], antonyms: [] },
  fever: { ipa: '/ˈfiːvər/', syllables: ['fe', 'ver'], pos: 'n.', synonyms: [], antonyms: [] },
  'runny nose': { ipa: '/ˈrʌni noʊz/', syllables: ['run', 'ny', 'nose'], pos: 'n.', synonyms: [], antonyms: [] },
  'sore throat': { ipa: '/sɔːr θroʊt/', syllables: ['sore', 'throat'], pos: 'n.', synonyms: [], antonyms: [] },
  headache: { ipa: '/ˈhɛdeɪk/', syllables: ['head', 'ache'], pos: 'n.', synonyms: [], antonyms: [] },
  toothache: { ipa: '/ˈtuːθeɪk/', syllables: ['tooth', 'ache'], pos: 'n.', synonyms: [], antonyms: [] },
  stomachache: { ipa: '/ˈstʌməkˌeɪk/', syllables: ['stom', 'ach', 'ache'], pos: 'n.', synonyms: [], antonyms: [] },
  breakfast: { ipa: '/ˈbrɛkfəst/', syllables: ['break', 'fast'], pos: 'n.', synonyms: ['morning meal'], antonyms: ['dinner'] },
  lunch: { ipa: '/lʌntʃ/', syllables: ['lunch'], pos: 'n.', synonyms: ['noon meal'], antonyms: [] },
  dinner: { ipa: '/ˈdɪnər/', syllables: ['din', 'ner'], pos: 'n.', synonyms: ['supper'], antonyms: ['breakfast'] },
  bread: { ipa: '/brɛd/', syllables: ['bread'], pos: 'n.', synonyms: ['toast'], antonyms: [] },
  chicken: { ipa: '/ˈtʃɪkɪn/', syllables: ['chick', 'en'], pos: 'n.', synonyms: [], antonyms: [] },
  salad: { ipa: '/ˈsæləd/', syllables: ['sal', 'ad'], pos: 'n.', synonyms: [], antonyms: [] },
  soup: { ipa: '/suːp/', syllables: ['soup'], pos: 'n.', synonyms: ['broth'], antonyms: [] },
  noodles: { ipa: '/ˈnuːdəlz/', syllables: ['noo', 'dles'], pos: 'n.(pl.)', synonyms: ['pasta'], antonyms: [] },
  backpack: { ipa: '/ˈbækˌpæk/', syllables: ['back', 'pack'], pos: 'n.', synonyms: ['schoolbag'], antonyms: [] },
  cap: { ipa: '/kæp/', syllables: ['cap'], pos: 'n.', synonyms: ['hat'], antonyms: [] },
  lunchbox: { ipa: '/ˈlʌntʃbɑːks/', syllables: ['lunch', 'box'], pos: 'n.', synonyms: [], antonyms: [] },
  umbrella: { ipa: '/ʌmˈbrɛlə/', syllables: ['um', 'brel', 'la'], pos: 'n.', synonyms: [], antonyms: [] },
  'water bottle': { ipa: '/ˈwɔːtər ˈbɑːtəl/', syllables: ['wa', 'ter', 'bot', 'tle'], pos: 'n.', synonyms: ['flask'], antonyms: [] },
  workbook: { ipa: '/ˈwɜːrkbʊk/', syllables: ['work', 'book'], pos: 'n.', synonyms: ['notebook'], antonyms: [] },
  glasses: { ipa: '/ˈɡlæsɪz/', syllables: ['glass', 'es'], pos: 'n.(pl.)', synonyms: ['eyeglasses'], antonyms: [] },
  shoes: { ipa: '/ʃuːz/', syllables: ['shoes'], pos: 'n.(pl.)', synonyms: ['sneakers'], antonyms: [] },

  // B7 Nations, Transportation, Daily Activities
  sandwich: { ipa: '/ˈsænwɪtʃ/', syllables: ['sand', 'wich'], pos: 'n.', synonyms: [], antonyms: [] },
  soda: { ipa: '/ˈsoʊdə/', syllables: ['so', 'da'], pos: 'n.', synonyms: ['pop'], antonyms: [] },
  Australia: { ipa: '/ɔːˈstreɪliə/', syllables: ['Aus', 'tral', 'ia'], pos: 'n.', synonyms: [], antonyms: [] },
  India: { ipa: '/ˈɪndiə/', syllables: ['In', 'di', 'a'], pos: 'n.', synonyms: [], antonyms: [] },
  Japan: { ipa: '/dʒəˈpæn/', syllables: ['Ja', 'pan'], pos: 'n.', synonyms: [], antonyms: [] },
  Singapore: { ipa: '/ˈsɪŋɡəpɔːr/', syllables: ['Sin', 'ga', 'pore'], pos: 'n.', synonyms: [], antonyms: [] },
  Spain: { ipa: '/speɪn/', syllables: ['Spain'], pos: 'n.', synonyms: [], antonyms: [] },
  Taiwan: { ipa: '/ˌtaɪˈwɑːn/', syllables: ['Tai', 'wan'], pos: 'n.', synonyms: [], antonyms: [] },
  'the UK': { ipa: '/ðə juːˈkeɪ/', syllables: ['the', 'UK'], pos: 'n.', synonyms: ['Britain'], antonyms: [] },
  'the USA': { ipa: '/ðə juːˌɛsˈeɪ/', syllables: ['the', 'USA'], pos: 'n.', synonyms: ['America'], antonyms: [] },
  'by bike': { ipa: '/baɪ baɪk/', syllables: ['by', 'bike'], pos: 'phr.', synonyms: [], antonyms: ['on foot'] },
  'by bus': { ipa: '/baɪ bʌs/', syllables: ['by', 'bus'], pos: 'phr.', synonyms: [], antonyms: [] },
  'by car': { ipa: '/baɪ kɑːr/', syllables: ['by', 'car'], pos: 'phr.', synonyms: [], antonyms: [] },
  'by scooter': { ipa: '/baɪ ˈskuːtər/', syllables: ['by', 'scoo', 'ter'], pos: 'phr.', synonyms: [], antonyms: [] },
  'by metro': { ipa: '/baɪ ˈmɛtroʊ/', syllables: ['by', 'met', 'ro'], pos: 'phr.', synonyms: ['by MRT'], antonyms: [] },
  'by taxi': { ipa: '/baɪ ˈtæksi/', syllables: ['by', 'tax', 'i'], pos: 'phr.', synonyms: ['by cab'], antonyms: [] },
  'by train': { ipa: '/baɪ treɪn/', syllables: ['by', 'train'], pos: 'phr.', synonyms: [], antonyms: [] },
  'on foot': { ipa: '/ɑːn fʊt/', syllables: ['on', 'foot'], pos: 'phr.', synonyms: ['walk'], antonyms: ['by car'] },
  'go jogging': { ipa: '/ɡoʊ ˈdʒɑːɡɪŋ/', syllables: ['go', 'jog', 'ging'], pos: 'phr.', synonyms: ['run'], antonyms: [] },
  'listen to music': { ipa: '/ˈlɪsən tuː ˈmjuːzɪk/', syllables: ['lis', 'ten', 'to', 'mu', 'sic'], pos: 'phr.', synonyms: [], antonyms: [] },
  'play baseball': { ipa: '/pleɪ ˈbeɪsbɔːl/', syllables: ['play', 'base', 'ball'], pos: 'phr.', synonyms: [], antonyms: [] },
  'play basketball': { ipa: '/pleɪ ˈbæskɪtbɔːl/', syllables: ['play', 'bas', 'ket', 'ball'], pos: 'phr.', synonyms: [], antonyms: [] },
  'ride a bike': { ipa: '/raɪd ə baɪk/', syllables: ['ride', 'a', 'bike'], pos: 'phr.', synonyms: [], antonyms: [] },
  'study English': { ipa: '/ˈstʌdi ˈɪŋɡlɪʃ/', syllables: ['stud', 'y', 'Eng', 'lish'], pos: 'phr.', synonyms: ['learn English'], antonyms: [] },
  'surf the Internet': { ipa: '/sɜːrf ði ˈɪntərnɛt/', syllables: ['surf', 'the', 'In', 'ter', 'net'], pos: 'phr.', synonyms: ['go online'], antonyms: [] },
  'watch TV': { ipa: '/wɑːtʃ ˌtiːˈviː/', syllables: ['watch', 'TV'], pos: 'phr.', synonyms: [], antonyms: [] },
  'get up': { ipa: '/ɡɛt ʌp/', syllables: ['get', 'up'], pos: 'phr.', synonyms: ['wake up'], antonyms: ['go to bed'] },
  'go to school': { ipa: '/ɡoʊ tuː skuːl/', syllables: ['go', 'to', 'school'], pos: 'phr.', synonyms: [], antonyms: ['go home'] },
  'have lunch': { ipa: '/hæv lʌntʃ/', syllables: ['have', 'lunch'], pos: 'phr.', synonyms: ['eat lunch'], antonyms: [] },
  'go home': { ipa: '/ɡoʊ hoʊm/', syllables: ['go', 'home'], pos: 'phr.', synonyms: [], antonyms: ['go to school'] },
  'do my homework': { ipa: '/duː maɪ ˈhoʊmwɜːrk/', syllables: ['do', 'my', 'home', 'work'], pos: 'phr.', synonyms: ['study'], antonyms: [] },
  'take a shower': { ipa: '/teɪk ə ˈʃaʊər/', syllables: ['take', 'a', 'show', 'er'], pos: 'phr.', synonyms: ['take a bath'], antonyms: [] },
  'go to bed': { ipa: '/ɡoʊ tuː bɛd/', syllables: ['go', 'to', 'bed'], pos: 'phr.', synonyms: ['sleep'], antonyms: ['get up'] },

  // B8 Past Locations/Activities, Clothing, Seasons
  'free time': { ipa: '/friː taɪm/', syllables: ['free', 'time'], pos: 'n.', synonyms: ['spare time'], antonyms: [] },
  'at home': { ipa: '/æt hoʊm/', syllables: ['at', 'home'], pos: 'phr.', synonyms: [], antonyms: ['outside'] },
  'at school': { ipa: '/æt skuːl/', syllables: ['at', 'school'], pos: 'phr.', synonyms: [], antonyms: ['at home'] },
  'at the mall': { ipa: '/æt ðə mɔːl/', syllables: ['at', 'the', 'mall'], pos: 'phr.', synonyms: [], antonyms: [] },
  'at the movie theater': { ipa: '/æt ðə ˈmuːvi ˈθiːətər/', syllables: ['at', 'the', 'mov', 'ie', 'the', 'a', 'ter'], pos: 'phr.', synonyms: ['at the cinema'], antonyms: [] },
  'at the restaurant': { ipa: '/æt ðə ˈrɛstərɑːnt/', syllables: ['at', 'the', 'res', 'tau', 'rant'], pos: 'phr.', synonyms: [], antonyms: [] },
  'at the zoo': { ipa: '/æt ðə zuː/', syllables: ['at', 'the', 'zoo'], pos: 'phr.', synonyms: [], antonyms: [] },
  'cleaned my room': { ipa: '/kliːnd maɪ ruːm/', syllables: ['cleaned', 'my', 'room'], pos: 'phr.', synonyms: ['tidied up'], antonyms: [] },
  'listened to music': { ipa: '/ˈlɪsənd tuː ˈmjuːzɪk/', syllables: ['lis', 'tened', 'to', 'mu', 'sic'], pos: 'phr.', synonyms: [], antonyms: [] },
  'played basketball': { ipa: '/pleɪd ˈbæskɪtbɔːl/', syllables: ['played', 'bas', 'ket', 'ball'], pos: 'phr.', synonyms: [], antonyms: [] },
  'walked the dog': { ipa: '/wɔːkt ðə dɔːɡ/', syllables: ['walked', 'the', 'dog'], pos: 'phr.', synonyms: [], antonyms: [] },
  'watched videos': { ipa: '/wɑːtʃt ˈvɪdioʊz/', syllables: ['watched', 'vid', 'e', 'os'], pos: 'phr.', synonyms: [], antonyms: [] },
  'visited a friend': { ipa: '/ˈvɪzɪtɪd ə frɛnd/', syllables: ['vis', 'it', 'ed', 'a', 'friend'], pos: 'phr.', synonyms: [], antonyms: [] },
  coat: { ipa: '/koʊt/', syllables: ['coat'], pos: 'n.', synonyms: ['jacket'], antonyms: [] },
  dress: { ipa: '/drɛs/', syllables: ['dress'], pos: 'n.', synonyms: ['gown'], antonyms: [] },
  jacket: { ipa: '/ˈdʒækɪt/', syllables: ['jack', 'et'], pos: 'n.', synonyms: ['coat'], antonyms: [] },
  skirt: { ipa: '/skɜːrt/', syllables: ['skirt'], pos: 'n.', synonyms: [], antonyms: ['pants'] },
  'T-shirt': { ipa: '/ˈtiː ʃɜːrt/', syllables: ['T-', 'shirt'], pos: 'n.', synonyms: ['shirt'], antonyms: [] },
  jeans: { ipa: '/dʒiːnz/', syllables: ['jeans'], pos: 'n.(pl.)', synonyms: ['pants'], antonyms: ['shorts'] },
  pants: { ipa: '/pænts/', syllables: ['pants'], pos: 'n.(pl.)', synonyms: ['trousers', 'jeans'], antonyms: ['shorts'] },
  shorts: { ipa: '/ʃɔːrts/', syllables: ['shorts'], pos: 'n.(pl.)', synonyms: [], antonyms: ['pants'] },
  spring: { ipa: '/sprɪŋ/', syllables: ['spring'], pos: 'n.', synonyms: [], antonyms: ['fall'] },
  summer: { ipa: '/ˈsʌmər/', syllables: ['sum', 'mer'], pos: 'n.', synonyms: [], antonyms: ['winter'] },
  fall: { ipa: '/fɔːl/', syllables: ['fall'], pos: 'n.', synonyms: ['autumn'], antonyms: ['spring'] },
  winter: { ipa: '/ˈwɪntər/', syllables: ['win', 'ter'], pos: 'n.', synonyms: [], antonyms: ['summer'] },
  dry: { ipa: '/draɪ/', syllables: ['dry'], pos: 'adj.', synonyms: [], antonyms: ['wet'] },
  wet: { ipa: '/wɛt/', syllables: ['wet'], pos: 'adj.', synonyms: ['rainy', 'damp'], antonyms: ['dry'] },
  foggy: { ipa: '/ˈfɔːɡi/', syllables: ['fog', 'gy'], pos: 'adj.', synonyms: ['misty', 'cloudy'], antonyms: ['clear', 'sunny'] },
  snowy: { ipa: '/ˈsnoʊi/', syllables: ['snow', 'y'], pos: 'adj.', synonyms: ['icy'], antonyms: ['sunny'] },
};

const LOWERCASE_LOOKUP_MAP = new Map(
  Object.entries(OFFLINE_VOCAB_DICT).map(([k, v]) => [k.toLowerCase(), { key: k, ...v }])
);

const ALL_SENTENCE_UNITS_SCOPE = ['1-all', '2-all', '3-all', '4-all', '5-all', '6-all', '7-all', '8-all'];

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findTextbookExample = (word = '', book = '', unit = '') => {
  const clean = String(word || '').trim();
  if (!clean) return null;

  const regex = new RegExp(`\\b${escapeRegExp(clean)}\\b`, 'i');
  const candidateScopes = [];
  if (/^\d+$/.test(String(book)) && unit !== undefined && unit !== null && unit !== 'all' && unit !== 'free') {
    candidateScopes.push([`${book}-${unit}`]);
  }
  if (/^\d+$/.test(String(book))) {
    candidateScopes.push([`${book}-all`]);
  }
  candidateScopes.push(ALL_SENTENCE_UNITS_SCOPE);

  for (const scope of candidateScopes) {
    const pool = getAvailableSentences({ selectedUnits: scope, includeCrossUnit: true, level: 'lv1' });
    const hit = pool.find((s) => regex.test(s.en || ''));
    if (hit) {
      return { en: hit.en, zh: hit.zh, unitTag: hit.unitTag || '' };
    }
  }
  return null;
};

/**
 * 取得完整離線單字教學資訊（IPA + KK + 音節拆分 + 詞性 + 同反義詞 + 課本例句自動媒合）
 * 未收錄於離線辭典的字不進行拼字猜測分節，保留完整單字並標示 hasVerifiedSyllables: false。
 */
export const getOfflineWordMeta = (rawWord = '', book = '', unit = '') => {
  const clean = String(rawWord || '').trim();
  if (!clean) return null;

  const lower = clean.toLowerCase();
  const dictHit = LOWERCASE_LOOKUP_MAP.get(lower) || null;
  const ipa = dictHit?.ipa || '';
  const isUsIpa = Boolean(ipa);
  const kk = isUsIpa ? ipaToKK(ipa) : '';
  const hasVerifiedSyllables = Boolean(dictHit?.syllables?.length);
  const syllables = hasVerifiedSyllables ? dictHit.syllables : [clean];
  const example = findTextbookExample(clean, book, unit);

  return {
    word: clean,
    ipa,
    kk,
    isUsIpa,
    syllables,
    hasVerifiedSyllables,
    pos: dictHit?.pos || (clean.includes(' ') ? 'phr.' : 'word'),
    synonyms: dictHit?.synonyms || [],
    antonyms: dictHit?.antonyms || [],
    example,
    fromOfflineDict: Boolean(dictHit),
  };
};
