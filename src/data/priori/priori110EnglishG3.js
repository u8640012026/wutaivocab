export const PRIORI_110_ENGLISH_G3_META = {
  paperId: '110-english-g3',
  examSeries: 'priori',
  year: 110,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 3,
  gradeLabel: '三年級',
  title: '110 年篩選測驗 三年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 21 題附官方原音＋紙筆認讀 4 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q21 官方聽力音檔皆核對自教育部國教署「110 年篩選測驗英語科 3 年級試卷答案卷」官方公布版；第 1～9 題採用大小寫雙格互動點選，第 22～25 題為大小寫字母配對紙筆題。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '110-english-g3',
  examSeries: 'priori',
  year: 110,
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
  { num: 1, upper: 'R', lower: 'r', tip: 'R 讀作 ar，尾音微捲舌，大寫 R 左豎右上半圓帶斜腳，小寫 r 左豎右上帶小彎芽。' },
  { num: 2, upper: 'G', lower: 'g', tip: 'G 讀作 jee，大寫 G 圓弧內收一短橫，小寫 g 圓圈在上方、直豎向下彎鉤（注意不要與 q 搞混）。' },
  { num: 3, upper: 'U', lower: 'u', tip: 'U 讀作 you，開口向上呈圓弧杯狀，小寫 u 右側有一條短直豎貼齊基準線。' },
  { num: 4, upper: 'P', lower: 'p', tip: 'P 讀作 pee，雙唇輕閉送氣，小寫 p 圓圈在右上、豎線向下延伸（不要與圓肚在左的 q 搞混）。' },
  { num: 5, upper: 'N', lower: 'n', tip: 'N 讀作 en，鼻音收尾，小寫 n 只有一個拱門（m 才是有兩個拱門）。' },
  { num: 6, upper: 'S', lower: 's', tip: 'S 讀作 es，先發出短母音 e 再接嘶嘶摩擦音，大小寫造型皆為 S 曲線，只差高度大小。' },
  { num: 7, upper: 'E', lower: 'e', tip: 'E 讀作 ee，大寫 E 有三條橫線，小寫 e 由內橫向右畫起再繞成半圓開口。' },
  { num: 8, upper: 'D', lower: 'd', tip: 'D 讀作 dee，大寫 D 右側為半圓弧，小寫 d 的圓肚在左下方（不要與圓肚在右的 b 搞混）。' },
  { num: 9, upper: 'T', lower: 't', tip: 'T 讀作 tee，無聲齒齦送氣音，大寫 T 頂部一橫，小寫 t 豎線中間帶十字短橫。' },
];

const LETTER_CHOICE_SPEC = [
  {
    num: 10,
    options: ['F', 'L', 'T'],
    answer: 1,
    concept: '聽音辨認大寫字母（L）',
    steps: [
      '三個選項分別為大寫字母 F、L、T。',
      '播放官方聽力音檔，聽辨字母名稱讀作 "L"（el），開頭有短音 e 再將舌尖頂住上齒齦。',
      '對應選項 (2) L，選 (2)。',
    ],
  },
  {
    num: 11,
    options: ['C', 'E', 'S'],
    answer: 0,
    concept: '聽音辨認大寫字母（C）',
    steps: [
      '三個選項分別為大寫字母 C、E、S。',
      '播放官方聽力音檔，聽辨字母名稱讀作 "C"（see），先發出清脆的 /s/ 再接長音 ee。',
      '對應選項 (1) C，選 (1)。',
    ],
  },
  {
    num: 12,
    options: ['w', 'm', 'z'],
    answer: 1,
    concept: '聽音辨認小寫字母（m）',
    steps: [
      '三個選項分別為小寫字母 w、m、z。',
      '播放官方聽力音檔，聽辨字母名稱讀作 "m"（em），結尾雙唇閉合發出鼻音。',
      '對應兩個拱門的小寫 (2) m，選 (2)。',
    ],
  },
  {
    num: 13,
    options: ['n', 'x', 'h'],
    answer: 2,
    concept: '聽音辨認小寫字母（h）',
    steps: [
      '三個選項分別為小寫字母 n、x、h。',
      '播放官方聽力音檔，聽辨字母名稱讀作 "h"（eitch），尾音帶有 /tʃ/ 的氣音。',
      '對應左高豎加右拱門的小寫 (3) h，選 (3)。',
    ],
  },
];

const DIALOGUE_PIC_SPEC = [
  {
    num: 14,
    ans: 2,
    concept: '聽辨課堂與日常問候道別語（Goodbye. / Bye.）',
    steps: [
      '先播放官方聽力音檔，聽辨圖中人物說出的問候或道別用語。',
      '觀察三張圖片情境：圖 (1) 男孩與女孩揹著書包面對面在校門口揮手打招呼；圖 (2) 男孩在生日蛋糕前送禮物給戴壽星帽的女孩；圖 (3) 男孩與女孩揹著書包背對鏡頭、各自走向不同方向並揮手道別。',
      '最符合道別情境的是圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 15,
    ans: 1,
    concept: '聽辨課堂與生活動作指令（Sit down.）',
    steps: [
      '先播放官方聽力音檔，聽辨人物說出的常用動詞指令（Sit down. 坐下）。',
      '觀察三張圖中媽媽與孩子的互動：圖 (1) 孩子跪地大哭、媽媽伸出食指叮嚀；圖 (2) 椅子上方有向下箭頭，媽媽引導孩子坐下；圖 (3) 媽媽與孩子抬頭望著天空飛過的飛機。',
      '符合「坐下」動作指示的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 16,
    ans: 1,
    concept: '聽辨課堂動作指令（Close your book.）',
    steps: [
      '先播放官方聽力音檔，聽辨老師在課堂上說出的動作指令（Close your book. 把書合起來）。',
      '觀察三張圖中老師對話框的圖示：圖 (1) 雙向箭頭朝外側展開書本（Open your book.）；圖 (2) 雙向箭頭向內側合攏書本（Close your book.）；圖 (3) 食指貼在嘴唇前示意安靜（Be quiet.）。',
      '符合「把書合起來」動作的是圖片 (2)，選 (2)。',
    ],
  },
];

const PHONEMIC_SPEC = [
  { num: 17, ans: 1, desc: '官方音檔中的兩個單字開頭起首音不同，發音部位與氣流方式有別，因此選 (2) X。' },
  { num: 18, ans: 0, desc: '官方音檔中的兩個單字開頭起首音相同，都由同一音素開頭，因此選 (1) O。' },
  { num: 19, ans: 0, desc: '官方音檔中的兩個單字開頭起首音相同，起始發音一致，因此選 (1) O。' },
  { num: 20, ans: 0, desc: '官方音檔中的兩個單字開頭起首音完全相同，起始發音一致，因此選 (1) O。' },
  { num: 21, ans: 1, desc: '官方音檔中的兩個單字開頭起首音不同，起始發音不一致，因此選 (2) X。' },
];

const READING_MATCH_SPEC = [
  {
    num: 22,
    prompt: 'F',
    options: ['e', 'j', 'f'],
    answer: 2,
    concept: '大寫與小寫字母配對（F → f）',
    steps: [
      '題目給定大寫字母 F，須從三個小寫字母 e、j、f 中選出對應的小寫。',
      '大寫 F 對應的小寫是頂端微彎、中間有一短橫的 f（e 對應 E，j 對應 J）。',
      '選 (3) f。',
    ],
  },
  {
    num: 23,
    prompt: 'Q',
    options: ['o', 'q', 'p'],
    answer: 1,
    concept: '大寫與小寫字母配對（Q → q）',
    steps: [
      '題目給定大寫字母 Q，須區分外觀皆有圓圈的小寫 o、q、p。',
      '大寫 Q 對應的小寫 q 圓圈在左上、直豎向下延伸（o 無豎線對應 O；p 圓圈在右上對應 P）。',
      '選 (2) q。',
    ],
  },
  {
    num: 24,
    prompt: 'j',
    options: ['I', 'J', 'T'],
    answer: 1,
    concept: '小寫與大寫字母配對（j → J）',
    steps: [
      '題目給定小寫字母 j，須從大寫 I、J、T 中選出正確配對。',
      '小寫 j 底部向左彎鉤、上方有一圓點，對應的大寫正是帶鉤的 J（I 對應 i，T 對應 t）。',
      '選 (2) J。',
    ],
  },
  {
    num: 25,
    prompt: 'y',
    options: ['L', 'X', 'Y'],
    answer: 2,
    concept: '小寫與大寫字母配對（y → Y）',
    steps: [
      '題目給定小寫字母 y，須從大寫 L、X、Y 中選出正確配對。',
      '小寫 y 上方呈 V 字開口、下方斜長尾巴延伸，對應的大寫是同樣呈分叉狀的 Y。',
      '選 (3) Y。',
    ],
  },
];

export const PRIORI_110_ENGLISH_G3_QUESTIONS = [
  ...ALPHABET_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-110-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'alphabet-pair',
      questionImage: `/assets/priori/110/eng-g3/q${qStr}.webp`,
      figureImage: null,
      questionText: `第一部分：聽寫字母（第 ${item.num} 題）\n請先點擊官方聽力播放按鈕，並於下方分別點選聽到的大寫與小寫字母。`,
      options: [],
      optionLabels: [],
      expectedUpper: item.upper,
      expectedLower: item.lower,
      answer: `${item.upper}, ${item.lower}`,
      media: {
        audioSrc: `/audio/priori/110/eng-g3/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽寫字母，請先點擊官方聽力音檔按鈕，再點選聽到的大寫與小寫英文字母。`,
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

  ...LETTER_CHOICE_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-110-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/110/eng-g3/q${qStr}.webp`,
      figureImage: null,
      questionText: `第二部分（一）聽辨字母（第 ${item.num} 題）\n請先播放官方聽力音檔，再選出聽到的英文字母。`,
      options: item.options,
      optionLabels: ['(1)', '(2)', '(3)'],
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/110/eng-g3/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽辨字母，請先點擊官方聽力音檔，再選出聽到的字母選項。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，字母 ${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'Ab-II-1',
      prioriCode: 'ENG-A-3-2',
      explanationSteps: item.steps,
    };
  }),

  ...DIALOGUE_PIC_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-110-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/110/eng-g3/q${qStr}.webp`,
      figureImage: `/assets/priori/110/eng-g3/q${qStr}_fig.webp`,
      questionText: `第二部分（二）聽辨常用語與動作（第 ${item.num} 題）\n請先播放官方聽力句子，再依左邊圖片選出最適合的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      optionLabels: ['(1)', '(2)', '(3)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/110/eng-g3/q${qStr}.mp3`,
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

  ...PHONEMIC_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-110-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/110/eng-g3/q${qStr}.webp`,
      figureImage: null,
      questionText: `第二部分（三）聽辨語音（第 ${item.num} 題）\n請仔細聽音檔中的兩個單字：兩個字開始的音一樣請選「O」，不一樣請選「X」。`,
      options: ['O（兩個字開始的音一樣）', 'X（兩個字開始的音不一樣）'],
      optionLabels: ['(1)', '(2)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/110/eng-g3/q${qStr}.mp3`,
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
        '把音檔重播一次，專注聽每個單字「第一個發出的嘴型與聲音」。',
        '比對兩個單字字首是否屬於同一個音。',
        item.desc,
      ],
    };
  }),

  ...READING_MATCH_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-110-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/110/eng-g3/q${qStr}.webp`,
      figureImage: null,
      questionText: `第三部分：字母大小寫配對（第 ${item.num} 題）\n請選出與左邊字母「${item.prompt}」互相配對的正確大小寫字母：`,
      options: item.options,
      optionLabels: ['(1)', '(2)', '(3)'],
      answer: item.answer,
      media: {
        audioSrc: null,
        audioSourceType: null,
      },
      ttsText: `第 ${item.num} 題，認讀字母配對。請問和左邊字母 ${item.prompt} 配對的是哪一個選項？`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，字母 ${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'Ab-II-1',
      prioriCode: 'ENG-R-3-1',
      explanationSteps: item.steps,
    };
  }),
];
