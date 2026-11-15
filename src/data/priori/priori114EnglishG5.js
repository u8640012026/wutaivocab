export const PRIORI_114_ENGLISH_G5_META = {
  paperId: '114-english-g5',
  examSeries: 'priori',
  year: 114,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 5,
  gradeLabel: '五年級',
  title: '114 年篩選測驗 五年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字讀寫 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「114 年篩選測驗英語科 5 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '114-english-g5',
  examSeries: 'priori',
  year: 114,
  subject: 'english',
  grade: 5,
  points: 4,
  questionType: 'single-choice',
  optionLabels: ['(1)', '(2)', '(3)'],
  preserveOptionOrder: true,
  ttsLang: 'zh-TW',
  ttsVerified: true,
  groupId: null,
  passage: null,
  answerSource: 'official_pdf',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
};

const LISTENING_WORD_SPECS = [
  {
    num: 1,
    stem: '第一部分（一）聽音拼字：請播放官方聽力音檔，選出正確的字首複合子音填入 __eel。',
    options: ['sk', 'ch', 'sh'],
    answer: 2,
    concept: '複合子音字首辨音（sk / ch / sh）',
    steps: [
      '專心聽單字一開始發出的複合子音，後面皆接 -eel。',
      '分辨清擦音 /ʃ/（sh）與 /tʃ/（ch）、/sk/（sk）的差異。',
      '依照官方標準答案，本題應選 (3) sh。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽音拼字：請播放官方聽力音檔，選出正確的字首字母填入 __ook。',
    options: ['bl', 'br', 'r'],
    answer: 1,
    concept: '混合子音連音辨音（bl- / br- / r-）',
    steps: [
      '注意聽開頭是否有雙唇爆破音 /b/，以及後面連的是 /l/ 還是捲舌音 /r/。',
      '區分 br-、bl- 與單純字首 r- 的聲音差別。',
      '依照官方標準答案，本題應選 (2) br（brook）。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽音拼字：請播放官方聽力音檔，選出正確的字首複合子音填入 __ore。',
    options: ['th', 'ch', 'bl'],
    answer: 0,
    concept: '複合子音字首辨音（th / ch / bl）',
    steps: [
      '先聽清楚字首音是咬舌氣音 /θ/（th）、破擦音 /tʃ/（ch），還是 /bl/。',
      '配合字尾 -ore 聽出正確音節。',
      '依照官方標準答案，本題應選 (1) th。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    concept: '聽辨星期與天氣預報圖示（sunny / rainy / cloudy）',
    steps: [
      '觀察圖片上的星期標示與太陽、雨滴、雲朵圖案。',
      '播放官方聽力音檔（共 3 遍），抓住星期幾與天氣單字。',
      '對照官方標準答案，本題正解為圖 (1)。',
    ],
  },
  {
    num: 5,
    concept: '聽辨人物與家庭稱謂（boy / girl / grandmother）',
    steps: [
      '圖片依序為男孩、女孩與奶奶。',
      '聆聽官方聽力說出的人物稱謂或特徵。',
      '對照官方標準答案，本題正解為圖 (2)。',
    ],
  },
  {
    num: 6,
    concept: '聽辨高矮特徵描述（short / tall）',
    steps: [
      '注意圖片中箭頭所指的樹木是較矮還是較高。',
      '聆聽官方聽力句子中的形容詞。',
      '對照官方標準答案，本題正解為圖 (2)。',
    ],
  },
  {
    num: 7,
    concept: '聽辨教室與生活情境對話',
    steps: [
      '觀察三張圖片的人物動作、手勢與互動場景。',
      '聆聽官方聽力對話，比對最相符的情境圖。',
      '對照官方標準答案，本題正解為圖 (2)。',
    ],
  },
  {
    num: 8,
    concept: '聽辨數字十的應用情境（時間／價錢／歲數）',
    steps: [
      '三張圖分別是十點鐘的時鐘、十元的香蕉，以及插十根蠟燭的蛋糕。',
      '專心聽官方聽力到底問或說的是時間、價錢還是年齡。',
      '對照官方標準答案，本題正解為圖 (1)。',
    ],
  },
  {
    num: 9,
    concept: '聽辨季節與天氣感受（snowy / windy / hot & sunny）',
    steps: [
      '圖片依序為下雪堆雪人、強風吹拂、烈日炎炎。',
      '聆聽音檔中的天氣形容詞與感受描述。',
      '對照官方標準答案，本題正解為圖 (2)。',
    ],
  },
  {
    num: 10,
    concept: '聽辨能力句型（can / cannot 與動作組合）',
    steps: [
      '注意圖片裡的打圈（會做）與打叉（不會做），涵蓋游泳、跳舞與唱歌。',
      '核對官方音檔中提到會做哪項運動、不會做哪項才藝。',
      '對照官方標準答案，本題正解為圖 (1)。',
    ],
  },
];

const READ_WORD_PIC_SPECS = [
  {
    num: 11,
    options: ['three', 'thin', 'see'],
    answer: 0,
    concept: '看圖辨字（數字 three）',
    steps: [
      '圖片顯示數字 3。',
      '選項 (1) three 是三、(2) thin 是瘦的、(3) see 是看見。',
      '正確答案為 (1) three。',
    ],
  },
  {
    num: 12,
    options: ['write', 'read', 'sing'],
    answer: 2,
    concept: '看圖辨字（動作動詞 sing）',
    steps: [
      '圖片中兩位女生正張開嘴巴開心唱歌，旁邊還有音符符號。',
      '選項 (1) write 寫字、(2) read 閱讀、(3) sing 唱歌。',
      '正確答案為 (3) sing。',
    ],
  },
  {
    num: 13,
    options: ['want', 'water', 'warm'],
    answer: 2,
    concept: '看圖辨字（形容詞 warm）',
    steps: [
      '窗外下著雪很冷，但女生在室內披著毛毯覺得很「溫暖」。',
      '選項 (1) want 想要、(2) water 水、(3) warm 溫暖的。',
      '符合圖意的是 (3) warm。',
    ],
  },
  {
    num: 14,
    options: ['tall', 'cold', 'short'],
    answer: 2,
    concept: '看圖辨字（長短形容詞 short）',
    steps: [
      '圖片把兩支鉛筆並排，箭頭指向比較「短」的那一支。',
      '選項 (1) tall 高的、(2) cold 冷的、(3) short 短的／矮的。',
      '符合圖意的是 (3) short。',
    ],
  },
  {
    num: 15,
    options: ['boy', 'girl', 'blue'],
    answer: 0,
    concept: '看圖辨字（人物名詞 boy）',
    steps: [
      '圖片畫的是一位小男孩。',
      '選項 (1) boy 男孩、(2) girl 女孩、(3) blue 藍色。',
      '正確答案為 (1) boy。',
    ],
  },
  {
    num: 16,
    options: ['a happy rabbit', 'a tired rabbit', 'a tired tiger'],
    answer: 1,
    concept: '情緒形容詞與動物名詞片語（a tired rabbit）',
    steps: [
      '圖片是一隻垂頭喪氣、非常疲倦（tired）的兔子（rabbit）。',
      '(1) 說快樂不對；(3) 說老虎不對；只有 (2) a tired rabbit 完全符合。',
      '正確答案為 (2)。',
    ],
  },
  {
    num: 17,
    options: ['banana pizza', 'banana juice', 'apple juice'],
    answer: 1,
    concept: '看圖辨識複合飲食名詞（banana juice）',
    steps: [
      '圖片是一盒印有香蕉圖案的果汁紙盒包裝。',
      '選項 (1) 香蕉披薩、(2) 香蕉汁、(3) 蘋果汁。',
      '正確答案為 (2) banana juice。',
    ],
  },
];

const READ_PIC_CHOICE_SPECS = [
  {
    num: 18,
    prompt: 'A: What do you like?\nB: Apple pie.',
    answer: 0,
    concept: '喜好問答句理解（What do you like?）',
    steps: [
      'A 問你喜歡什麼，B 回答「蘋果派（Apple pie）」。',
      '觀察圖片，找出桌上有蘋果派且搭配喜愛表情的選項。',
      '對照官方標準答案，正解為圖 (1)。',
    ],
  },
  {
    num: 19,
    prompt: "A: Can your sister read?\nB: No, she can't.",
    answer: 2,
    concept: '能力疑問句否定理解（No, she cannot read.）',
    steps: [
      '對話表示「姊姊／妹妹不會閱讀（讀書）」。',
      '注意人物是女性（sister），且動作必須與「不會讀書」相符。',
      '對照官方標準答案，正解為圖 (3)。',
    ],
  },
  {
    num: 20,
    prompt: 'My brother is five. He can write.',
    answer: 2,
    concept: '年齡與動作能力綜合句（He can write.）',
    steps: [
      '句子描述：弟弟／哥哥今年五歲（five），他會寫字（write）。',
      '比對三張圖片中男孩的歲數標記與是否正在寫字。',
      '對照官方標準答案，正解為圖 (3)。',
    ],
  },
  {
    num: 21,
    prompt: "It's cold. I want hot rice.",
    answer: 0,
    concept: '天候感受與需求表達（cold / hot rice）',
    steps: [
      '句子說「天氣好冷，我想要熱騰騰的飯（hot rice）」。',
      '對比圖片中的溫度提示與主角想要的食物。',
      '對照官方標準答案，正解為圖 (1)。',
    ],
  },
  {
    num: 22,
    prompt: 'My father is tall. My mother is thin.',
    answer: 1,
    concept: '家庭成員外觀形容詞（tall / thin）',
    steps: [
      '第一個條件是爸爸高（tall），第二個條件是媽媽瘦（thin）。',
      '同時核對圖片中父母兩人的體型特徵。',
      '對照官方標準答案，正解為圖 (2)。',
    ],
  },
];

const READ_PIC_SENTENCE_SPECS = [
  {
    num: 23,
    options: ['Boy: I want milk.', 'Father: I want juice.', 'Mother: I want water.'],
    answer: 2,
    concept: '看圖比對家庭成員與飲品需求',
    steps: [
      '先看圖中桌前的小男孩、爸爸、媽媽各自想喝什麼飲料或食物提示。',
      '逐一核對選項 (1) 男孩要牛奶、(2) 爸爸要果汁、(3) 媽媽要水，何者與圖完全吻合。',
      '對照官方標準答案，正解為 (3) Mother: I want water.。',
    ],
  },
  {
    num: 24,
    options: [
      'I see a lion. It is not big.',
      'The lion is big. It is happy.',
      "The rabbit is big. It can't dance.",
    ],
    answer: 0,
    concept: '動物大小比較與能力觀察',
    steps: [
      '圖中有一隻大兔子正開心地跳舞，旁邊還有一隻小獅子。',
      '(2) 說獅子很大不對；(3) 說兔子不會跳舞也不對。',
      '只有 (1) I see a lion. It is not big.（獅子不大）完全正確。',
    ],
  },
  {
    num: 25,
    options: [
      "It's sunny. The girl is sad.",
      "It's eight o'clock. It's rainy.",
      "It's not rainy. The girl is happy.",
    ],
    answer: 2,
    concept: '天氣、時間與情緒綜合判讀',
    steps: [
      '看圖可知窗外是晴天（沒有下雨）、牆上時鐘指向 3 點、女孩笑得很開心。',
      '(1) 說女孩難過錯；(2) 說八點與下雨都錯。',
      '正確描述圖意的是 (3) It\'s not rainy. The girl is happy.。',
    ],
  },
];

export const PRIORI_114_ENGLISH_G5_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g5/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/114/eng-g5/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽音拼字，請點擊官方聽力音檔，並選出正確的字母選項。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'Aa-III-2',
      prioriCode: 'ENG-P-5-1',
      explanationSteps: item.steps,
    };
  }),

  ...LISTENING_PIC_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/114/eng-g5/q${qStr}_fig.webp`,
      questionText: `第一部分（二）聽辨字詞與句子（第 ${item.num} 題）\n請先播放官方聽力音檔（共 3 遍），再選出最符合音檔內容的圖片。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: [0, 1, 1, 1, 0, 1, 0][item.num - 4],
      media: {
        audioSrc: `/audio/priori/114/eng-g5/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題，請播放官方聽力音檔，再選出最符合意思的圖片編號。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: 'Ac-III-3',
      prioriCode: 'ENG-L-5-1',
      explanationSteps: item.steps,
    };
  }),

  ...READ_WORD_PIC_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/114/eng-g5/q${qStr}_fig.webp`,
      questionText: `第二部分（一）看圖辨字（第 ${item.num} 題）\n請看左邊的圖片，選出最適當的字詞。`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題看圖辨字，請看圖片選出最適當的英文單字或片語。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'Ab-III-3',
      prioriCode: 'ENG-R-5-1',
      explanationSteps: item.steps,
    };
  }),

  ...READ_PIC_CHOICE_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/114/eng-g5/q${qStr}_fig.webp`,
      questionText: `第二部分（二）看圖理解句意（第 ${item.num} 題）\n請閱讀題目句子，選出最符合意思的圖片：\n${item.prompt}`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題，請讀句子選出正確的圖片。${item.prompt.replaceAll('\n', ' ')}`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: 'B-III-1',
      prioriCode: 'ENG-R-5-2',
      explanationSteps: item.steps,
    };
  }),

  ...READ_PIC_SENTENCE_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/114/eng-g5/q${qStr}_fig.webp`,
      questionText: `第二部分（三）看圖選句（第 ${item.num} 題）\n請看圖片內容，選出最符合的英文句子。`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題看圖選句，請觀察圖片選出最符合意思的英文句子。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'B-III-1',
      prioriCode: 'ENG-R-5-3',
      explanationSteps: item.steps,
    };
  }),
];
