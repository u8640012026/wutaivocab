export const PRIORI_113_ENGLISH_G3_META = {
  paperId: '113-english-g3',
  examSeries: 'priori',
  year: 113,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 3,
  gradeLabel: '三年級',
  title: '113 年篩選測驗 三年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（全卷含官方聽力原音：字母聽寫 15 題＋聽辨 10 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與全卷 25 段官方聽力音檔皆核對自教育部國教署「113 年篩選測驗英語科 3 年級試卷答案卷」官方公布版；第 1～15 題採用大小寫雙格互動點選與即時批改機制，全卷 25 題皆支援線上自動批改。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '113-english-g3',
  examSeries: 'priori',
  year: 113,
  subject: 'english',
  grade: 3,
  points: 4,
  preserveOptionOrder: true,
  ttsLang: 'zh-TW',
  ttsVerified: true,
  groupId: null,
  passage: null,
  answerSource: 'official_pdf',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
};

const ALPHABET_SPEC = [
  { num: 1, upper: 'Z', lower: 'z', tip: 'Z 的大寫與小寫造型相同、大小不同，讀作 /ziː/。' },
  { num: 2, upper: 'E', lower: 'e', tip: '注意長母音 /iː/，字母是 E，不是讀音相近的 B、C、D。' },
  { num: 3, upper: 'C', lower: 'c', tip: 'C 的大寫與小寫同為半圓開口造型，讀作 /siː/。' },
  { num: 4, upper: 'H', lower: 'h', tip: 'H 讀作 /eɪtʃ/，注意小寫 h 有一條向上伸展的長豎線，不要寫成 n。' },
  { num: 5, upper: 'J', lower: 'j', tip: 'J 讀作 /dʒeɪ/，容易和 G (/dʒiː/) 搞混，注意字尾發 /eɪ/ 音。' },
  { num: 6, upper: 'K', lower: 'k', tip: 'K 讀作 /keɪ/，注意小寫 k 右側斜筆的寫法位置。' },
  { num: 7, upper: 'X', lower: 'x', tip: 'X 讀作 /ɛks/，大小寫皆為兩條交叉斜線，只有高度差別。' },
  { num: 8, upper: 'M', lower: 'm', tip: 'M 讀作 /ɛm/，閉雙唇鼻音，不要跟開口鼻音 N (/ɛn/) 混淆。' },
  { num: 9, upper: 'P', lower: 'p', tip: 'P 讀作 /piː/，小寫 p 圓圈在右側且豎筆向下突出四線格。' },
  { num: 10, upper: 'Q', lower: 'q', tip: 'Q 讀作 /kjuː/，小寫 q 圓圈在左側且尾巴向下突出，不要跟 p 搞混。' },
  { num: 11, upper: 'T', lower: 't', tip: 'T 讀作 /tiː/，無聲送氣 /t/，注意和小寫十字叉造型。' },
  { num: 12, upper: 'R', lower: 'r', tip: 'R 讀作 /ɑːr/，卷舌結尾，大小寫外型差異較大需熟記。' },
  { num: 13, upper: 'G', lower: 'g', tip: 'G 讀作 /dʒiː/，與 J (/dʒeɪ/) 區分，且小寫 g 下方有圓鉤。' },
  { num: 14, upper: 'V', lower: 'v', tip: 'V 讀作 /viː/，上齒輕觸下唇振動聲帶，不要和 B (/biː/) 混淆。' },
  { num: 15, upper: 'B', lower: 'b', tip: 'B 讀作 /biː/，小寫 b 的圓肚在右下方，不要寫成 d。' },
];

const PHONEMIC_SPEC = [
  {
    num: 16,
    ans: 1,
    desc: '官方音檔為 go（開頭 /g/）與 dot（開頭 /d/），兩個開頭子音不同，因此選 (2) X。',
  },
  {
    num: 17,
    ans: 0,
    desc: '官方音檔為 mock（開頭 /m/）與 mass（開頭 /m/），兩個字都從雙唇鼻音 /m/ 開始，因此選 (1) O。',
  },
  {
    num: 18,
    ans: 0,
    desc: '官方音檔為 shag（開頭 /ʃ/）與 shoom（開頭 /ʃ/），開頭皆為 /ʃ/ 音，因此選 (1) O。',
  },
  {
    num: 19,
    ans: 1,
    desc: '官方音檔為 fog（清音 /f/）與 vat（濁音 /v/），一個不振動聲帶、一個振動聲帶，開頭音不同，選 (2) X。',
  },
  {
    num: 20,
    ans: 0,
    desc: '官方音檔為 hum（開頭 /h/）與 heap（開頭 /h/），兩個字都從輕吐氣音 /h/ 開始，因此選 (1) O。',
  },
  {
    num: 21,
    ans: 1,
    desc: '官方音檔為 sin（開頭 /s/）與 chop（開頭 /tʃ/），兩者起始子音不同，因此選 (2) X。',
  },
];

const DIALOGUE_SPEC = [
  {
    num: 22,
    ans: 1,
    concept: '聽辨禮貌感謝用語（Thank you.）',
    steps: [
      '先播聽力音檔：題目念的是 "Thank you."（謝謝你）。',
      '看情境圖：(1) 為同學排隊說話、(2) 為一位同學把物品遞給另一位同學道謝、(3) 為兩人爭執大喊。',
      '符合表達感謝情境的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 23,
    ans: 2,
    concept: '聽辨教室指令祈使句（Close your book.）',
    steps: [
      '音檔念出教室指令 "Close your book."（把書關上／闔上書本）。',
      '比較三張圖：圖 (1) 正打開書閱讀、圖 (2) 在收文具盒、圖 (3) 正雙手把書本闔起來。',
      '因此選圖片 (3)。',
    ],
  },
  {
    num: 24,
    ans: 1,
    concept: '聽辨動作指令（Sit down.）',
    steps: [
      '音檔念出常用指令 "Sit down."（坐下）。',
      '看圖辨認動作：只有圖 (2) 的男孩正彎身往椅子上坐下，圖 (1) 與 (3) 都是站立拿著物品。',
      '因此選圖片 (2)。',
    ],
  },
  {
    num: 25,
    ans: 0,
    concept: '聽辨課堂指示動詞（Listen.）',
    steps: [
      '音檔念出動詞指令 "Listen."（仔細聽）。',
      '觀察三組人物互動：圖 (1) 一位學生拿起紙杯傳聲筒貼近耳朵專心傾聽另一人說話，圖 (2)(3) 則強調指物發言與交談。',
      '對照官方標準答案，正解為圖片 (1)。',
    ],
  },
];

export const PRIORI_113_ENGLISH_G3_QUESTIONS = [
  ...ALPHABET_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-113-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'alphabet-pair',
      questionImage: `/assets/priori/113/eng-g3/q${qStr}.webp`,
      figureImage: null,
      questionText: `第一部分：聽寫字母（第 ${item.num} 題）\n請先點擊官方聽力播放按鈕，並於下方分別點選聽到的大寫與小寫字母。`,
      options: [],
      optionLabels: [],
      expectedUpper: item.upper,
      expectedLower: item.lower,
      answer: `${item.upper}, ${item.lower}`,
      media: {
        audioSrc: `/audio/priori/113/eng-g3/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽寫測驗，請先點擊官方聽力音檔按鈕，再點選聽到的大寫與小寫英文字母。`,
      optionTtsTexts: [],
      conceptTitle: '聽音辨認大小寫英文字母',
      curriculumCode: 'Ab-II-1',
      prioriCode: 'ENG-A-3-1',
      explanationSteps: [
        '先點擊聽力音檔重聽 3 遍的字母名稱發音，確認是哪一個英文字母。',
        item.tip,
        `官方標準答案：大寫寫「${item.upper}」、小寫寫「${item.lower}」（寫作 ${item.upper}, ${item.lower}）。`,
      ],
    };
  }),

  ...PHONEMIC_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-113-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/113/eng-g3/q${qStr}.webp`,
      figureImage: null,
      questionText: `第二部分（一）聽辨語音（第 ${item.num} 題）\n請仔細聽音檔中的兩個單字：兩個字開始的音一樣請選「O」，不一樣請選「X」。`,
      options: ['O（兩個字開始的音一樣）', 'X（兩個字開始的音不一樣）'],
      optionLabels: ['(1)', '(2)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/113/eng-g3/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽辨語音，請點擊官方聽力音檔。如果兩個單字開頭的音一樣請選圓圈，不一樣請選叉叉。`,
      optionTtsTexts: [
        '選項一，圓圈，兩個字開始的音一樣',
        '選項二，叉叉，兩個字開始的音不一樣',
      ],
      conceptTitle: '聽辨單字起始音（Phonemic Awareness）',
      curriculumCode: 'Aa-II-2',
      prioriCode: 'ENG-P-3-1',
      explanationSteps: [
        '把音檔重播一次，專注聽每個單字「第一個發出的嘴型與聲音」，先不管字尾怎麼念。',
        '分辨兩個單字的起首音屬於同一組發音，還是不同的兩個音。',
        item.desc,
      ],
    };
  }),

  ...DIALOGUE_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-113-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/113/eng-g3/q${qStr}.webp`,
      figureImage: `/assets/priori/113/eng-g3/q${qStr}_fig.webp`,
      questionText: `第二部分（二）聽辨常用語（第 ${item.num} 題）\n請先播放官方聽力句子（共 3 遍），再依左邊圖片選出最適合的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      optionLabels: ['(1)', '(2)', '(3)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/113/eng-g3/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽辨常用語，請點擊官方聽力音檔，再選出最符合意思的圖片編號。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: 'Ac-II-3',
      prioriCode: 'ENG-L-3-1',
      explanationSteps: item.steps,
    };
  }),
];
