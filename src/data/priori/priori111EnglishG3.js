export const PRIORI_111_ENGLISH_G3_META = {
  paperId: '111-english-g3',
  examSeries: 'priori',
  year: 111,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 3,
  gradeLabel: '三年級',
  title: '111 年篩選測驗 三年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 21 題附官方原音＋紙筆認讀 4 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q21 官方聽力音檔皆核對自教育部國教署「111 年篩選測驗英語科 3 年級試卷答案卷」官方公布版；第 1～9 題採用大小寫雙格互動點選，第 22～25 題為大小寫字母配對紙筆題。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '111-english-g3',
  examSeries: 'priori',
  year: 111,
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
  { num: 1, upper: 'D', lower: 'd', tip: 'D 讀作 dee，大寫 D 右側為半圓弧，小寫 d 的圓肚在左下方（不要與圓肚在右的 b 搞混）。' },
  { num: 2, upper: 'L', lower: 'l', tip: 'L 讀作 el，舌尖輕頂上齒齦，小寫 l 是一條長直豎線。' },
  { num: 3, upper: 'I', lower: 'i', tip: 'I 讀作 ai，小寫 i 上方有一圓點，要注意與讀作 ee 的 E 區分。' },
  { num: 4, upper: 'V', lower: 'v', tip: 'V 讀作 vee，發音時上齒輕觸下唇帶出聲帶震動，大小寫造型相同皆為 V 字斜角。' },
  { num: 5, upper: 'Y', lower: 'y', tip: 'Y 讀作 wai，大寫 Y 站在基準線上，小寫 y 則有斜長尾巴向下延伸。' },
  { num: 6, upper: 'Q', lower: 'q', tip: 'Q 讀作 kyoo，大寫為圓圈右下多一斜撇，小寫 q 圓圈在左上、直豎向右下方略勾或垂下。' },
  { num: 7, upper: 'J', lower: 'j', tip: 'J 讀作 jay，大寫與小寫底部都有向左彎的鉤子，小寫 j 上方多一點，注意與 G 區分。' },
  { num: 8, upper: 'R', lower: 'r', tip: 'R 讀作 ar，尾音微捲舌，大寫 R 與小寫 r 外型差異較大，小寫 r 左直豎右上帶小彎芽。' },
  { num: 9, upper: 'N', lower: 'n', tip: 'N 讀作 en，鼻音收尾，小寫 n 只有一個拱門（m 才是有兩個拱門）。' },
];

const LETTER_CHOICE_SPEC = [
  {
    num: 10,
    options: ['D', 'C', 'G'],
    answer: 1,
    concept: '聽音辨認大寫字母（C）',
    steps: [
      '三個選項分別為大寫字母 D、C、G。',
      '播放官方聽力音檔，聽辨字母名稱讀作 "C"（see），非帶 d 或 j 音的 D、G。',
      '對應選項 (2) C，選 (2)。',
    ],
  },
  {
    num: 11,
    options: ['T', 'E', 'F'],
    answer: 2,
    concept: '聽音辨認大寫字母（F）',
    steps: [
      '三個選項分別為大寫字母 T、E、F。',
      '播放官方聽力音檔，聽辨字母名稱讀作 "F"（ef），開頭有短音 e 再接輕咬下唇的 f 音。',
      '對應選項 (3) F，選 (3)。',
    ],
  },
  {
    num: 12,
    options: ['x', 'f', 's'],
    answer: 0,
    concept: '聽音辨認小寫字母（x）',
    steps: [
      '三個選項分別為小寫字母 x、f、s。',
      '播放官方聽力音檔，聽辨字母名稱讀作 "x"（eks），尾音有明顯的 /ks/ 氣音。',
      '對應選項 (1) x，選 (1)。',
    ],
  },
  {
    num: 13,
    options: ['v', 'n', 'u'],
    answer: 2,
    concept: '聽音辨認小寫字母（u）',
    steps: [
      '三個選項分別為小寫字母 v、n、u（字型皆有近似處，須靠聽音與弧形/尖角分辨）。',
      '播放官方聽力音檔，聽辨字母名稱讀作 "u"（you）。',
      '對應圓底開口向上的小寫 (3) u，選 (3)。',
    ],
  },
];

const DIALOGUE_PIC_SPEC = [
  {
    num: 14,
    ans: 2,
    concept: '聽辨課堂動作指令（Close your book.）',
    steps: [
      '先播放官方聽力音檔，聽辨老師或課堂人物說出的常用指令（Close your book. 把書合起來）。',
      '觀察三張圖片的對話框圖示：圖 (1) 是舉起手掌（Raise your hand.）；圖 (2) 雙向箭頭向外表示把書打開（Open your book.）；圖 (3) 雙向箭頭向內合攏表示把書合上。',
      '最符合「把書合起來」動作的是圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 15,
    ans: 1,
    concept: '聽辨課堂動作與感官動詞（Look.）',
    steps: [
      '先播放官方聽力音檔，聽辨簡短常用動詞指令（Look. 看）。',
      '觀察三張圖中女孩的動作：圖 (1) 將手放在耳朵旁傾聽（Listen.）；圖 (2) 拿著望遠鏡仔細觀看（Look.）；圖 (3) 笑著豎起大拇指稱讚（Good job.）。',
      '符合「看」動作的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 16,
    ans: 0,
    concept: '聽辨課堂動作指令（Stand up.）',
    steps: [
      '先播放官方聽力音檔，聽辨課堂常用指示（Stand up. 起立）。',
      '觀察三張圖片箭頭方向：圖 (1) 男孩箭頭向上從椅子站起來；圖 (2) 男孩箭頭向下坐上椅子；圖 (3) 男孩雙手捧書往兩側打開。',
      '符合「站起來」動作的是圖片 (1)，選 (1)。',
    ],
  },
];

const PHONEMIC_SPEC = [
  { num: 17, ans: 1, desc: '官方音檔中的兩個單字開頭起首音不同，發音方式與嘴型有別，因此選 (2) X。' },
  { num: 18, ans: 0, desc: '官方音檔中的兩個單字開頭起首音相同，都由同一音素開頭，因此選 (1) O。' },
  { num: 19, ans: 1, desc: '官方音檔中的兩個單字開頭起首音不同，起始發音不一致，因此選 (2) X。' },
  { num: 20, ans: 0, desc: '官方音檔中的兩個單字開頭起首音完全相同，起始發音一致，因此選 (1) O。' },
  { num: 21, ans: 0, desc: '官方音檔中的兩個單字開頭起首音相同，都從同一子音發出，因此選 (1) O。' },
];

const READING_MATCH_SPEC = [
  {
    num: 22,
    prompt: 'T',
    options: ['i', 't', 'j'],
    answer: 1,
    concept: '大寫與小寫字母配對（T → t）',
    steps: [
      '題目給定大寫字母 T，須從三個小寫字母 i、t、j 中選出對應的小寫。',
      '大寫 T 對應的小寫是帶十字短橫的 t（i 與 j 上方各有圓點，分別對應大寫 I 與 J）。',
      '選 (2) t。',
    ],
  },
  {
    num: 23,
    prompt: 'B',
    options: ['d', 'p', 'b'],
    answer: 2,
    concept: '大寫與小寫字母配對（B → b）',
    steps: [
      '題目給定大寫字母 B，須區分外觀極易混淆的小寫 d、p、b。',
      '大寫 B 圓肚向右，小寫 b 的直豎在左、圓肚朝右（b 像大寫 B 少了上半圈）；d 的圓肚朝左下，p 的圓圈在右上、豎線向下。',
      '選 (3) b。',
    ],
  },
  {
    num: 24,
    prompt: 'h',
    options: ['H', 'K', 'L'],
    answer: 0,
    concept: '小寫與大寫字母配對（h → H）',
    steps: [
      '題目給定小寫字母 h，須從大寫 H、K、L 中選出正確配對。',
      '小寫 h（左長豎加右拱門）對應的大寫正是兩豎一橫的 H（K、L 分別對應 k、l）。',
      '選 (1) H。',
    ],
  },
  {
    num: 25,
    prompt: 'e',
    options: ['F', 'I', 'E'],
    answer: 2,
    concept: '小寫與大寫字母配對（e → E）',
    steps: [
      '題目給定小寫字母 e，須從大寫 F、I、E 中選出正確配對。',
      '小寫 e 對應的是三條橫線的大寫 E（F 有兩橫對應 f，I 一豎對應 i）。',
      '選 (3) E。',
    ],
  },
];

export const PRIORI_111_ENGLISH_G3_QUESTIONS = [
  ...ALPHABET_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-111-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'alphabet-pair',
      questionImage: `/assets/priori/111/eng-g3/q${qStr}.webp`,
      figureImage: null,
      questionText: `第一部分：聽寫字母（第 ${item.num} 題）\n請先點擊官方聽力播放按鈕，並於下方分別點選聽到的大寫與小寫字母。`,
      options: [],
      optionLabels: [],
      expectedUpper: item.upper,
      expectedLower: item.lower,
      answer: `${item.upper}, ${item.lower}`,
      media: {
        audioSrc: `/audio/priori/111/eng-g3/q${qStr}.mp3`,
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
      id: `priori-111-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/111/eng-g3/q${qStr}.webp`,
      figureImage: null,
      questionText: `第二部分（一）聽辨字母（第 ${item.num} 題）\n請先播放官方聽力音檔，再選出聽到的英文字母。`,
      options: item.options,
      optionLabels: ['(1)', '(2)', '(3)'],
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/111/eng-g3/q${qStr}.mp3`,
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
      id: `priori-111-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/111/eng-g3/q${qStr}.webp`,
      figureImage: `/assets/priori/111/eng-g3/q${qStr}_fig.webp`,
      questionText: `第二部分（二）聽辨常用語與動作（第 ${item.num} 題）\n請先播放官方聽力句子，再依左邊圖片選出最適合的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      optionLabels: ['(1)', '(2)', '(3)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/111/eng-g3/q${qStr}.mp3`,
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
      id: `priori-111-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/111/eng-g3/q${qStr}.webp`,
      figureImage: null,
      questionText: `第二部分（三）聽辨語音（第 ${item.num} 題）\n請仔細聽音檔中的兩個單字：兩個字開始的音一樣請選「O」，不一樣請選「X」。`,
      options: ['O（兩個字開始的音一樣）', 'X（兩個字開始的音不一樣）'],
      optionLabels: ['(1)', '(2)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/111/eng-g3/q${qStr}.mp3`,
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
      id: `priori-111-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/111/eng-g3/q${qStr}.webp`,
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
