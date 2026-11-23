// ── 霧臺國小 八冊神山古老秘典典藏館與八星大宗師成就系統 ──

export const GRIMOIRE_BOOKS = [
  {
    id: 1,
    roman: 'BOOK I',
    nameZh: '百合幼芽之書',
    nameEn: 'Book of Sacred Sprout',
    totem: '百合幼芽',
    symbol: '🌱',
    themeColor: 'from-emerald-600 to-green-700',
    accentColor: 'text-emerald-300',
    borderColor: 'border-emerald-500/50',
    coverImage: '/assets/grimoire/book_1.webp',
    description: '記錄三上第一冊初探教室文具與基礎字母，象徵求知初生、破土萌芽。'
  },
  {
    id: 2,
    roman: 'BOOK II',
    nameZh: '排灣陶甕之書',
    nameEn: 'Book of Sacred Urn',
    totem: '排灣陶甕',
    symbol: '🏺',
    themeColor: 'from-amber-600 to-orange-700',
    accentColor: 'text-amber-300',
    borderColor: 'border-amber-500/50',
    coverImage: '/assets/grimoire/book_2.webp',
    description: '三下第二冊天地萬物之藏，如祖先神聖陶甕蘊含千古知識之火。'
  },
  {
    id: 3,
    roman: 'BOOK III',
    nameZh: '七彩琉璃之書',
    nameEn: 'Book of Mystic Beads',
    totem: '七彩琉璃珠',
    symbol: '🔮',
    themeColor: 'from-blue-600 to-sky-700',
    accentColor: 'text-sky-300',
    borderColor: 'border-sky-500/50',
    coverImage: '/assets/grimoire/book_3.webp',
    description: '四上第三冊生活日常與繽紛色彩，如勇士之珠閃耀純淨湛藍光芒。'
  },
  {
    id: 4,
    roman: 'BOOK IV',
    nameZh: '百步神蛇之書',
    nameEn: 'Book of Sacred Serpent',
    totem: '百步蛇菱紋',
    symbol: '🐍',
    themeColor: 'from-teal-600 to-emerald-800',
    accentColor: 'text-teal-300',
    borderColor: 'border-teal-500/50',
    coverImage: '/assets/grimoire/book_4.webp',
    description: '四下第四冊自然探險與神山守護，百步蛇菱格神紋銘刻神聖誓言。'
  },
  {
    id: 5,
    roman: 'BOOK V',
    nameZh: '雄鷹羽翼之書',
    nameEn: 'Book of Mountain Eagle',
    totem: '雄鷹之羽',
    symbol: '🦅',
    themeColor: 'from-purple-700 to-indigo-800',
    accentColor: 'text-purple-300',
    borderColor: 'border-purple-500/50',
    coverImage: '/assets/grimoire/book_5.webp',
    description: '五上第五冊翱翔高階句型與對話，大武山雄鷹展翅穿雲入九霄。'
  },
  {
    id: 6,
    roman: 'BOOK VI',
    nameZh: '勇士禮刀之書',
    nameEn: 'Book of Warrior Blade',
    totem: '勇士禮刀',
    symbol: '🗡️',
    themeColor: 'from-rose-700 to-red-800',
    accentColor: 'text-rose-300',
    borderColor: 'border-rose-500/50',
    coverImage: '/assets/grimoire/book_6.webp',
    description: '五下第六冊挑戰果敢與智慧實踐，如出鞘禮刀般精準剛毅、鋒芒內斂。'
  },
  {
    id: 7,
    roman: 'BOOK VII',
    nameZh: '巍峨聖山之書',
    nameEn: 'Book of Mount Dawu',
    totem: '大武山星宿',
    symbol: '⛰️',
    themeColor: 'from-indigo-800 to-slate-900',
    accentColor: 'text-indigo-300',
    borderColor: 'border-indigo-400/50',
    coverImage: '/assets/grimoire/book_7.webp',
    description: '六上第七冊宇宙天象與深度閱讀，仰望大武山巔恆久北極星宿。'
  },
  {
    id: 8,
    roman: 'BOOK VIII',
    nameZh: '神山雲豹之書',
    nameEn: 'Book of Clouded Leopard',
    totem: '臺灣雲豹',
    symbol: '🐆',
    themeColor: 'from-amber-500 via-yellow-600 to-amber-800',
    accentColor: 'text-yellow-300',
    borderColor: 'border-yellow-400/60',
    coverImage: '/assets/grimoire/book_8.webp',
    description: '六下第八冊全書統整精熟之最高境界，魯凱聖靈雲豹引領邁向八星大宗師。'
  }
];

// 前三大單元學習區域對應之 12 大單人遊戲挑戰（探索 4 款 + 極速 4 款 + 經典 4 款）
// 友善容錯機制：全冊 12 款中任選精通 10 款三星即可達到 100% 點亮該冊神印（8 冊共 80 項 = 八星大宗師）
export const REQUIRED_MODES_FOR_MASTER = 10;

export const GRIMOIRE_GAME_MODES = [
  // ── 探索解謎 (4 款) ──
  { id: 'escape', nameZh: '神祕密室逃脫', icon: '🗝️', category: 'explore' },
  { id: 'spotter', nameZh: '鷹眼神探找碴', icon: '🔍', category: 'explore' },
  { id: 'maze', nameZh: '字母巡航迷宮', icon: '🌀', category: 'explore' },
  { id: 'memory', nameZh: '翻牌記憶對決', icon: '🃏', category: 'explore' },

  // ── 極速反應 (4 款) ──
  { id: 'mole', nameZh: '單字打地鼠', icon: '🔨', category: 'speed' },
  { id: 'swipe', nameZh: '極速是非滑牌', icon: '⚡', category: 'speed' },
  { id: 'meteor', nameZh: '3D 隕石防衛戰', icon: '☄️', category: 'speed' },
  { id: 'snake', nameZh: '叢林神山貪食蛇', icon: '🐍', category: 'speed' },

  // ── 詞句試煉 (4 款) ──
  { id: 'sentence', nameZh: '句型積木工坊', icon: '🧩', category: 'quiz', note: '課本句型重組與情境造句' },
  { id: 'quiz-listening', nameZh: '英語聽力試煉', icon: '🎧', category: 'quiz', note: '單字辨音/句子/問答任一三星' },
  { id: 'spelling', nameZh: '單字積木拼裝', icon: '🧱', category: 'quiz' },
  { id: 'handwriting', nameZh: '神筆筆順書寫', icon: '✍️', category: 'quiz', note: '四線三格標準手寫評測' }
];

const STORAGE_PREFIX = 'wutai_grimoire_progress_';

/**
 * 取得特定學生的八冊進度資料庫
 */
export const getStudentGrimoireData = (studentId = 'guest') => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${studentId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
};

/**
 * 儲存學生八冊進度
 */
export const saveStudentGrimoireData = (studentId = 'guest', data) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${studentId}`, JSON.stringify(data));
  } catch (e) {}
};

/**
 * 取得單冊進度百分比 (0 ~ 100%) 與三星遊戲數
 */
export const getBookProgress = (studentId, bookId) => {
  const allData = getStudentGrimoireData(studentId);
  const bookRecord = allData[String(bookId)] || {};
  
  // 計算在該冊獲得 3 星 (或通關) 的遊戲數
  let threeStarCount = 0;
  const consolidatedRecord = { ...bookRecord };
  const sentenceActualStar = bookRecord['sentence'] || 0;
  const legacyQuizStar = Math.max(
    bookRecord['quiz-choice'] || 0,
    bookRecord['quiz-zh-en'] || 0,
    bookRecord['quiz-en-zh'] || 0
  );
  // 卡片顯示句型工坊真實星等（絕不將舊字義星等偽裝為已完成句型工坊）
  consolidatedRecord['sentence'] = sentenceActualStar;
  consolidatedRecord['quiz-choice'] = legacyQuizStar;
  consolidatedRecord['quiz-listening'] = Math.max(
    bookRecord['quiz-listening'] || 0,
    bookRecord['quiz-listening-word'] || 0,
    bookRecord['quiz-listening-sentence'] || 0,
    bookRecord['quiz-listening-qa'] || 0
  );

  // 舊版三星承接：計算整冊點亮完成度時，取「新句型星 vs 舊字義星」最大值保留學生既得解鎖
  const legacyPreservedModes = {
    sentence: legacyQuizStar >= 3 && sentenceActualStar < 3
  };

  GRIMOIRE_GAME_MODES.forEach(m => {
    let star = consolidatedRecord[m.id] || 0;
    if (m.id === 'sentence') {
      star = Math.max(sentenceActualStar, legacyQuizStar);
    }
    if (star >= 3) {
      threeStarCount++;
    }
  });

  const percent = Math.min(100, threeStarCount * 10);
  const isMastered = threeStarCount >= REQUIRED_MODES_FOR_MASTER;

  return {
    bookId,
    percent,
    threeStarCount,
    requiredModes: REQUIRED_MODES_FOR_MASTER,
    totalModes: GRIMOIRE_GAME_MODES.length,
    isMastered,
    modesStatus: consolidatedRecord,
    legacyPreservedModes
  };
};

/**
 * 取得全八冊完整進程總結 (含點亮的星數 0~8、總通關項數 0~80)
 */
export const getGrimoireSummary = (studentId) => {
  const booksProgress = GRIMOIRE_BOOKS.map(b => getBookProgress(studentId, b.id));
  const masteredCount = booksProgress.filter(b => b.isMastered).length; // 亮起之星星數 (0 ~ 8)
  const totalMasteredModes = booksProgress.reduce((sum, b) => sum + b.threeStarCount, 0); // 總精通項數 (0 ~ 80)

  return {
    booksProgress,
    masteredStars: masteredCount,
    totalMasteredModes,
    maxModes: 80,
    titleInfo: getMasterTitle(masteredCount)
  };
};

/**
 * 將各遊戲模式字串精確映射至八冊秘典之 12 大模式代碼
 */
export const mapModeToGrimoireId = (mode) => {
  if (!mode) return null;
  const m = String(mode).toLowerCase();
  if (m.startsWith('escape')) return 'escape';
  if (m.startsWith('spotter')) return 'spotter';
  if (m.startsWith('maze')) return 'maze';
  if (m.startsWith('memory')) return 'memory';
  if (m.startsWith('mole')) return 'mole';
  if (m.startsWith('swipe')) return 'swipe';
  if (m.startsWith('meteor')) return 'meteor';
  if (m.startsWith('snake')) return 'snake';
  if (m.startsWith('sentence')) return 'sentence';
  if (m.startsWith('spelling')) return 'spelling';
  if (m.startsWith('handwriting')) return 'handwriting';
  if (m === 'quiz-choice' || m === 'quiz-zh-en' || m === 'choice-zh-en' || m === 'quiz-en-zh' || m === 'choice-en-zh') return 'quiz-choice';
  if (m.startsWith('quiz-listening') || m.startsWith('listening')) return 'quiz-listening';
  return null;
};

/**
 * 記錄學生在某冊某遊戲的三星戰績
 */
export const recordGrimoireStar = (studentId, bookId, gameId, stars = 3) => {
  if (!studentId || !bookId || !gameId) return;
  const allData = getStudentGrimoireData(studentId);
  const bKey = String(bookId);
  if (!allData[bKey]) allData[bKey] = {};

  const currentStars = allData[bKey][gameId] || 0;
  if (stars > currentStars) {
    allData[bKey][gameId] = stars;
    // 若為聽力子模式，同步更新父級 quiz-listening
    if (gameId.startsWith('quiz-listening')) {
      allData[bKey]['quiz-listening'] = Math.max(allData[bKey]['quiz-listening'] || 0, stars);
    }
    saveStudentGrimoireData(studentId, allData);
  }
};

export const getMasterTitle = (stars = 0) => {
  switch (stars) {
    case 0:
      return {
        level: 0,
        name: '初入山林巡山學童',
        badge: '學徒',
        color: 'text-slate-300',
        quote: '勤勉向學，踏出探險的第一步！'
      };
    case 1:
      return {
        level: 1,
        name: '一星・見習神探巡山士',
        badge: '巡山士',
        color: 'text-emerald-300',
        quote: '已精通第一冊！百合初芽展露鋒芒！'
      };
    case 2:
      return {
        level: 2,
        name: '二星・神山探險先鋒',
        badge: '先鋒',
        color: 'text-amber-300',
        quote: '已精通二冊！古老陶甕蘊含無窮潛力！'
      };
    case 3:
      return {
        level: 3,
        name: '三星・大武山敏捷獵手',
        badge: '獵手',
        color: 'text-sky-300',
        quote: '已精通三冊！琉璃光彩護佑敏捷身手！'
      };
    case 4:
      return {
        level: 4,
        name: '四星・翠綠密林遊俠',
        badge: '遊俠',
        color: 'text-teal-300',
        quote: '已精通四冊！百步蛇神靈庇佑的勇士！'
      };
    case 5:
      return {
        level: 5,
        name: '五星・翡翠聖境智者',
        badge: '智者',
        color: 'text-purple-300',
        quote: '已精通五冊！雄鷹雙翼載譽而歸！'
      };
    case 6:
      return {
        level: 6,
        name: '六星・神山百步守護長老',
        badge: '長老',
        color: 'text-rose-300',
        quote: '已精通六冊！禮刀所向披靡，德高望重！'
      };
    case 7:
      return {
        level: 7,
        name: '七星・神山殿堂大守護者',
        badge: '大守護者',
        color: 'text-indigo-300',
        quote: '已精通七冊！仰望巍峨大武山之頂峰！'
      };
    case 8:
    default:
      return {
        level: 8,
        name: '八星・神山全知八星大宗師',
        badge: '大宗師',
        color: 'text-yellow-300',
        quote: '榮登全校最高殿堂！精通八冊八十項絕技之至高大宗師！'
      };
  }
};
