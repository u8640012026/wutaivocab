/**
 * 霧臺英語宇宙 2.0 - 學生身分與 6 碼漫遊通行碼工具函式庫
 * 6-Digit Composite Student Code: [Grade 2D][Class 2D][Seat 2D] (e.g. 040209)
 */

export const GRADE_OPTIONS = [
  { id: '01', zh: '一年級', en: 'Grade 1', shortZh: '1年', books: ['g1', '1', 'abc'], descZh: '一年級字母啟蒙樂園' },
  { id: '02', zh: '二年級', en: 'Grade 2', shortZh: '2年', books: ['g2', '2', 'abc'], descZh: '二年級字母進階樂園' },
  { id: '03', zh: '三年級', en: 'Grade 3', shortZh: '3年', books: ['1', '2'], descZh: '三年級第1~2冊綜合' },
  { id: '04', zh: '四年級', en: 'Grade 4', shortZh: '4年', books: ['3', '4'], descZh: '四年級第3~4冊進階' },
  { id: '05', zh: '五年級', en: 'Grade 5', shortZh: '5年', books: ['5', '6'], descZh: '五年級第5~6冊高年級' },
  { id: '06', zh: '六年級', en: 'Grade 6', shortZh: '6年', books: ['7', '8', '9'], descZh: '六年級第7~8冊畢業會考與國一先修' },
  { id: '99', zh: '訪客體驗', en: 'Guest Mode', shortZh: '訪客', books: ['g1', 'g2', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'abc'], isGuest: true, descZh: '全校自由體驗與遊客試玩' }
];

export const CLASS_OPTIONS = [
  { id: '01', zh: '甲班', en: 'Class A', shortZh: '甲' },
  { id: '02', zh: '乙班', en: 'Class B', shortZh: '乙' },
  { id: '03', zh: '丙班', en: 'Class C', shortZh: '丙' },
  { id: '00', zh: '其他', en: 'Other', shortZh: '他' },
];

export const FUN_NICKNAMES = [
  '勇者山豬', '飛鼠隊長', '百合小花', '長老黑熊',
  '高山雲豹', '琉璃珍珠', '熱血老鷹', '部落獵人',
  '晨曦微風', '彩虹勇士', '星空探索者', '快樂青蛙',
  '活力松鼠', '小米陽光', '大武山歌者', '神秘陶壺',
  '英勇穿山甲', '翠綠竹節蟲', '部落百步蛇', '原野小鹿'
];

/**
 * 補齊兩位數字串
 */
export const pad2 = (val) => {
  const str = String(val ?? '').trim();
  if (!str) return '00';
  return str.padStart(2, '0').slice(-2);
};

/**
 * 組成 6 碼學生識別碼 (student_id)
 * @param {string|number} grade - 年級 (01~06, 99, 00)
 * @param {string|number} classNum - 班級 (01~03, 99, 00)
 * @param {string|number} seat - 座號 (01~35, 99)
 * @returns {string} 6-digit ID (e.g. '040209', '999999')
 */
export const formatStudentId = (grade, classNum, seat) => {
  if (String(grade) === '99') return '999999';
  return `${pad2(grade)}${pad2(classNum)}${pad2(seat)}`;
};

/**
 * 解析 6 碼學生識別碼
 * @param {string} studentId
 * @returns {{ grade: string, classNum: string, seat: string, isValid: boolean, isGuest: boolean }}
 */
export const parseStudentId = (studentId) => {
  if (!studentId || typeof studentId !== 'string' || studentId.length !== 6) {
    return { grade: '00', classNum: '00', seat: '00', isValid: false, isGuest: false };
  }
  const grade = studentId.substring(0, 2);
  const classNum = studentId.substring(2, 4);
  const seat = studentId.substring(4, 6);
  const isGuest = studentId === '999999' || grade === '99';
  return { grade, classNum, seat, isValid: true, isGuest };
};

/**
 * 取得格式化顯示名稱
 * e.g. "4年乙班 09號 (小明)" 或 "[訪客] 神秘訪客勇士"
 */

/**
 * 全平台標準訪客判定唯一真理來源 (Single Source of Truth)
 * @param {string|object} studentOrId - 學生識別碼或學生物件
 * @returns {boolean}
 */
export const isGuestStudent = (studentOrId) => {
  if (!studentOrId) return true;
  if (typeof studentOrId === 'object') {
    const sId = String(studentOrId.student_id || studentOrId.id || '');
    const name = String(studentOrId.nickname || studentOrId.name || '');
    const grade = String(studentOrId.grade || '');
    return sId === '999999' || sId.startsWith('99') || grade === '99' || name.includes('訪客') || name.includes('Guest');
  }
  const str = String(studentOrId);
  return str === '999999' || str.startsWith('99') || str === 'guest';
};

export const formatStudentDisplayName = (student, lang = 'zh-TW') => {
  if (!student) return lang === 'zh-TW' ? '訪客學生' : 'Guest Student';
  const sId = String(student.student_id || '');
  const isGuest = sId === '999999' || pad2(student.grade) === '99';
  const nickname = student.nickname || (lang === 'zh-TW' ? (isGuest ? '訪客勇士' : '好學生') : (isGuest ? 'Guest' : 'Learner'));

  if (isGuest) {
    return lang === 'zh-TW' ? `[訪客] ${nickname}` : `[Guest] ${nickname}`;
  }

  const gradeObj = GRADE_OPTIONS.find(g => g.id === pad2(student.grade)) || GRADE_OPTIONS[0];
  const classObj = CLASS_OPTIONS.find(c => c.id === pad2(student.classNum || student.class)) || CLASS_OPTIONS[0];
  const seatNum = parseInt(student.seat, 10) || 0;

  if (gradeObj.id === '00' || gradeObj.id === '99') {
    return `${gradeObj[lang === 'zh-TW' ? 'zh' : 'en']} (${nickname})`;
  }

  if (lang === 'zh-TW') {
    return `${gradeObj.shortZh}${classObj.shortZh} ${seatNum > 0 ? seatNum + '號' : ''} (${nickname})`;
  } else {
    return `${gradeObj.en} ${classObj.en} #${seatNum} (${nickname})`;
  }
};

/**
 * 取得精簡標籤
 * e.g. "4乙 09號" 或 "[訪客]"
 */
export const formatStudentBadge = (student, lang = 'zh-TW') => {
  if (!student) return lang === 'zh-TW' ? '訪客' : 'Guest';
  const sId = String(student.student_id || '');
  if (sId === '999999' || pad2(student.grade) === '99' || pad2(student.grade) === '00') {
    return lang === 'zh-TW' ? '[訪客]' : '[Guest]';
  }
  const gradeObj = GRADE_OPTIONS.find(g => g.id === pad2(student.grade));
  const classObj = CLASS_OPTIONS.find(c => c.id === pad2(student.classNum || student.class));
  const seatNum = parseInt(student.seat, 10) || 0;

  if (!gradeObj || gradeObj.id === '00' || gradeObj.id === '99') return lang === 'zh-TW' ? '[訪客]' : '[Guest]';
  const seatText = seatNum > 0 ? `${seatNum}號` : '';
  return `${gradeObj.shortZh}${classObj ? classObj.shortZh : ''} ${seatText}`.trim();
};

/**
 * 隨機產生一個好玩正向的原鄉兒童暱稱
 */
export const getRandomFunNickname = () => {
  const index = Math.floor(Math.random() * FUN_NICKNAMES.length);
  return FUN_NICKNAMES[index];
};

/**
 * 判斷模式或冊別是否屬於「字母類遊戲」
 * 包含：字母巡航迷宮、極速是非滑牌(字母)、隕石防衛戰(ABC)、星際記憶翻牌等
 */
export const isAlphabetGameMode = (mode, book) => {
  if (book === 'abc' || book === 'alphabet') return true;
  if (!mode) return false;
  const m = String(mode);
  return (
    m.startsWith('maze') ||
    m === 'handwriting-abc' ||
    (m === 'handwriting' && (!book || book === 'abc')) ||
    m.includes('abc') ||
    m.endsWith('-abc') ||
    m === 'swipe-abc' ||
    m === 'meteor-abc' ||
    m === 'mole-abc' ||
    m === 'snake-abc' ||
    m === 'memory-abc' ||
    m === 'spelling-abc' ||
    m === 'spotter-abc' ||
    m === 'memory-single' ||
    ((m === 'listening_lab' || m === 'speaking_lab') && (!book || book === 'abc'))
  );
};

/**
 * 檢查遊戲或冊別是否屬於學生自己的年級範圍
 * 一、二年級：所有字母類遊戲 (迷宮、是非、隕石、翻牌) 均為本年級合格範圍！
 * 年級 3 -> 第 1, 2 冊
 * 年級 4 -> 第 3, 4 冊
 * 年級 5 -> 第 5, 6 冊
 * 年級 6 -> 第 7, 8 冊
 * 年級 99 / 00 (訪客/全開) -> 全冊皆符合
 */
export const isBookInOwnGrade = (book, grade, mode = null) => {
  const cleanGrade = pad2(grade);
  if (cleanGrade === '00' || cleanGrade === '99') return true; // 訪客全開放

  // 課本題庫檢定館：一年級嚴格對應 g1 (大寫字母)、二年級嚴格對應 g2 (大小寫字母)
  if (mode === 'mcq-exam') {
    if (cleanGrade === '01') return String(book) === 'g1';
    if (cleanGrade === '02') return String(book) === 'g2';
  }

  // 一、二年級核心範圍：所有字母類遊戲均直接認定為本年級合格範圍！
  if ((cleanGrade === '01' || cleanGrade === '02') && isAlphabetGameMode(mode, book)) {
    return true;
  }

  // 字母標記
  if (String(book) === 'abc' && (cleanGrade === '01' || cleanGrade === '02')) {
    return true;
  }

  const gradeObj = GRADE_OPTIONS.find(g => g.id === cleanGrade);
  if (!gradeObj || !gradeObj.books) return false;
  return gradeObj.books.includes(String(book));
};

/**
 * 依冊別反推所屬年級 (1~6 年級)
 */
export const getGradeFromBook = (book) => {
  const b = String(book);
  if (b === 'abc' || b === 'g1') return '01'; // 一年級大寫字母與字母啟蒙
  if (b === 'g2') return '02'; // 二年級大小寫字母
  if (b === '1' || b === '2') return '03'; // 國小三年級啟蒙第 1, 2 冊
  if (b === '3' || b === '4') return '04'; // 四年級第 3, 4 冊
  if (b === '5' || b === '6') return '05'; // 五年級第 5, 6 冊
  if (b === '7' || b === '8' || b === '9') return '06'; // 六年級第 7, 8 冊與國一先修
  return '00';
};

const CLASS_LABEL_TO_ID = {
  '甲': '01',
  'a': '01',
  '乙': '02',
  'b': '02',
  '丙': '03',
  'c': '03',
  '他': '00',
  '其他': '00',
  'other': '00'
};

/**
 * 解析排行榜顯示名稱中的年班座號／訪客前綴與暱稱結構，供通行證查榜精確比對使用
 */
export const parseLeaderboardIdentity = (rawName = '') => {
  const str = String(rawName || '').trim();
  if (!str) return null;

  const guestMatch = str.match(/^\[(?:訪客|Guest)\]\s*(.*)$/i);
  if (guestMatch) {
    return { kind: 'guest', nickname: guestMatch[1].trim() };
  }

  const zhFormal = str.match(
    /^(\d{1,2})\s*(?:年\s*)?(甲|乙|丙|其他|他)\s*班?\s*(\d{1,2})\s*號\s*[(（](.+)[)）]$/
  );
  if (zhFormal) {
    return {
      kind: 'formal',
      grade: pad2(zhFormal[1]),
      classNum: CLASS_LABEL_TO_ID[zhFormal[2]] || '00',
      seat: pad2(zhFormal[3]),
      nickname: zhFormal[4].trim()
    };
  }

  const enFormal = str.match(
    /^Grade\s+(\d{1,2})\s+(?:Class\s+)?(A|B|C|Other)\s+#(\d{1,2})\s*[(（](.+)[)）]$/i
  );
  if (enFormal) {
    return {
      kind: 'formal',
      grade: pad2(enFormal[1]),
      classNum: CLASS_LABEL_TO_ID[enFormal[2].toLowerCase()] || '00',
      seat: pad2(enFormal[3]),
      nickname: enFormal[4].trim()
    };
  }

  return { kind: 'plain', nickname: str };
};

/**
 * 精確比對排行榜紀錄是否屬於指定學生，避免子字串暱稱（如「小明」誤認「小明同學」）或訪客誤匹配
 */
export const doesLeaderboardEntryMatchStudent = (entry, student) => {
  if (!entry || !student) return false;

  const studentIsGuest = isGuestStudent(student);
  const entryIsGuest = isGuestStudent(entry);
  if (studentIsGuest !== entryIsGuest) return false;

  const studentId = String(student.student_id || '').trim();
  const studentNick = String(student.nickname || '').trim();
  const entryRawName = String(entry.name || entry.nickname || '').trim();
  const parsed = parseLeaderboardIdentity(entryRawName);

  if (studentIsGuest) {
    if (!studentNick || !parsed) return false;
    return parsed.nickname.toLowerCase() === studentNick.toLowerCase();
  }

  const rawEntrySid = String(
    entry.student_id ||
    (typeof entry.book === 'string' && /^\d{6}$/.test(entry.book.trim()) ? entry.book.trim() : '') ||
    ''
  ).trim();
  const nameSidMatch = !rawEntrySid && entryRawName
    ? entryRawName.match(/(?:^|\D)(\d{6})(?:\D|$)/)
    : null;
  const entrySid = /^\d{6}$/.test(rawEntrySid)
    ? rawEntrySid
    : (nameSidMatch ? nameSidMatch[1] : '');

  if (entrySid && /^\d{6}$/.test(studentId)) {
    return entrySid === studentId;
  }

  if (parsed?.kind === 'formal') {
    const sidParsed = parseStudentId(studentId);
    const sGrade = sidParsed.isValid ? sidParsed.grade : pad2(student.grade);
    const sClass = sidParsed.isValid ? sidParsed.classNum : pad2(student.classNum || student.class);
    const sSeat = sidParsed.isValid ? sidParsed.seat : pad2(student.seat);
    return parsed.grade === sGrade && parsed.classNum === sClass && parsed.seat === sSeat;
  }

  if (
    entryRawName &&
    (entryRawName === formatStudentDisplayName(student, 'zh-TW') ||
      entryRawName === formatStudentDisplayName(student, 'en'))
  ) {
    return true;
  }

  return Boolean(studentNick && parsed?.kind === 'plain' && parsed.nickname === studentNick);
};
