export const PRIORI_111_ENGLISH_G4_META = {
  paperId: '111-english-g4',
  examSeries: 'priori',
  year: 111,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 4,
  gradeLabel: '四年級',
  title: '111 年篩選測驗 四年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字讀寫 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「111 年篩選測驗英語科 4 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '111-english-g4',
  examSeries: 'priori',
  year: 111,
  subject: 'english',
  grade: 4,
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
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的韻尾拼字填入 w__。',
    ttsPrompt: '第 1 題聽辨語音，請播放官方聽力音檔，選出正確的拼字填入字母 w 後面。',
    options: ['at', 'ed', 'ud'],
    optionTts: ['選項一，a t', '選項二，e d', '選項三，u d'],
    answer: 1,
    concept: '短母音與字尾子音拼讀（at 與 ed 與 ud）',
    steps: [
      '專注聽字首 w 後面的短母音和字尾收音：a 是大開口短音，e 是微張短音，u 是悶短音，且字尾 t 與 d 清濁音不同。',
      '播放官方聽力音檔，分辨發出的韻尾母音與濁音 d 結尾。',
      '對應選項 (2) ed，選 (2)。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字首子音填入 __ap。',
    ttsPrompt: '第 2 題聽辨語音，請播放官方聽力音檔，選出正確的字首子音填入前面空格。',
    options: ['f', 's', 'c'],
    optionTts: ['選項一，字母 f', '選項二，字母 s', '選項三，字母 c'],
    answer: 1,
    concept: '字首子音辨識（f 與 s 與 c）',
    steps: [
      '分辨字首三個子音差異：f 是上齒咬下唇吹氣，s 是齒縫摩擦音，c 是舌根無聲塞音 /k/。',
      '播放官方聽力音檔，聽出最開頭為清晰的齒縫音 /s/，拼出 sap。',
      '對應選項 (2) s，選 (2)。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的中間母音填入 r__g。',
    ttsPrompt: '第 3 題聽辨語音，請播放官方聽力音檔，選出正確的中間母音填入字母 r 和 g 中間。',
    options: ['e', 'a', 'o'],
    optionTts: ['選項一，字母 e', '選項二，字母 a', '選項三，字母 o'],
    answer: 2,
    concept: '單字中間短母音辨識（e 與 a 與 o）',
    steps: [
      '聚焦於三個短母音口型差別：e、a 與後圓唇音 /ɑ/ 的字母 o。',
      '播放官方聽力音檔，聽出字母 r 後接短音 o 再收尾 g。',
      '對應選項 (3) o，選 (3)。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    ans: 0,
    concept: '聽辨食物單字（egg）',
    steps: [
      '觀察三張圖片：圖 (1) 是荷包蛋（egg）、圖 (2) 是草莓/櫻桃切片蛋糕（cake）、圖 (3) 是一條條紋魚（fish）。',
      '播放官方聽力音檔，聽辨念出的英文食物名稱。',
      '對應圖片 (1) 煎蛋（egg），選 (1)。',
    ],
  },
  {
    num: 5,
    ans: 0,
    concept: '聽辨動物單字（bird）',
    steps: [
      '觀察三張圖片：圖 (1) 是停在樹枝上的小鳥（bird）、圖 (2) 是獅子（lion）、圖 (3) 是白兔（rabbit）。',
      '播放官方聽力音檔，聽辨念出的動物單字。',
      '對應圖片 (1) 小鳥（bird），選 (1)。',
    ],
  },
  {
    num: 6,
    ans: 1,
    concept: '聽辨日常與文具單字（marker）',
    steps: [
      '觀察三張圖片：圖 (1) 是一盒牛奶（milk）、圖 (2) 是彩色筆／麥克筆（marker）、圖 (3) 是一把尺（ruler）。',
      '播放官方聽力音檔，聽辨念出的文具單字。',
      '對應圖片 (2) 麥克筆（marker），選 (2)。',
    ],
  },
  {
    num: 7,
    ans: 2,
    concept: '聽辨生活情境與情緒表現',
    steps: [
      '觀察三張圖中人物的動作與場所：圖 (1) 在書桌旁看見同學趴睡而猶豫；圖 (2) 兩人在平地上舉手揮手打招呼；圖 (3) 男生坐在蹺蹺板高處開心地張開雙臂揮舞。',
      '播放官方聽力音檔，聽辨對話與語氣所描述的情境。',
      '依官方標準答案，對應情境為圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 8,
    ans: 0,
    concept: '聽辨課堂招呼與活動指令',
    steps: [
      '觀察三張圖片中老師的動作：圖 (1) 老師與兩位同學揮手打招呼（Hello. / Goodbye.）；圖 (2) 老師吹哨示意跑道上準備起跑；圖 (3) 老師指示同學從書包拿出或收起書本。',
      '播放官方聽力音檔，確認老師對同學說的話。',
      '對應圖片 (1) 師生揮手互動情境，選 (1)。',
    ],
  },
  {
    num: 9,
    ans: 1,
    concept: '聽辨指示代名詞與物品句型（This is milk. / this milk）',
    steps: [
      '觀察三張圖片中手指指向的物品與遠近距離：圖 (1) 指著近處的麥克筆（this marker）；圖 (2) 指著近處的牛奶盒（this milk）；圖 (3) 指著遠處的牛奶盒（that milk）。',
      '播放官方聽力音檔，注意聽究竟是指 near（this）還是 far（that），以及對象是麥克筆還是牛奶。',
      '對應指著近處牛奶盒的圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 10,
    ans: 0,
    concept: '聽辨蔬果名稱與否定句型（It is corn. / It is not a banana.）',
    steps: [
      '觀察三張圖片：圖 (1) 是一根玉米（corn）；圖 (2) 是剝開外皮的香蕉（banana）；圖 (3) 是一根未剝皮的香蕉（banana）。',
      '播放官方聽力音檔，聽辨句子所說的蔬果或是否定描述。',
      '對應圖片 (1) 玉米，選 (1)。',
    ],
  },
];

const READING_WORD_SPECS = [
  {
    num: 11,
    options: ['cake', 'book', 'name'],
    answer: 2,
    concept: '日常學習單字認讀（name）',
    steps: [
      '圖片顯示名牌／姓名的對應提示，三個選項依序為 (1) cake（蛋糕）、(2) book（書本）、(3) name（名字）。',
      '搭配圖片文意與常見三年級核心字彙，正確單字為 name。',
      '選 (3)。',
    ],
  },
  {
    num: 12,
    options: ['it', 'no', 'this'],
    answer: 1,
    concept: '基礎否定字彙認讀（no）',
    steps: [
      '三個選項分別為 (1) it（它）、(2) no（不是／不）、(3) this（這個）。',
      '觀察左圖的打叉或否定標誌意象，對應表示「不」的字彙 no。',
      '選 (2)。',
    ],
  },
  {
    num: 13,
    options: ['tiger', 'white', 'rabbit'],
    answer: 0,
    concept: '動物單字認讀（tiger）',
    steps: [
      '左圖畫的是一隻老虎（tiger）。',
      '選項依序為 (1) tiger（老虎）、(2) white（白色）、(3) rabbit（兔子）。',
      '選 (1)。',
    ],
  },
  {
    num: 14,
    options: ['pig', 'fish', 'color'],
    answer: 1,
    concept: '動物單字認讀（fish）',
    steps: [
      '左圖畫的是一條魚（fish）。',
      '選項依序為 (1) pig（豬）、(2) fish（魚）、(3) color（顏色）。',
      '選 (2)。',
    ],
  },
  {
    num: 15,
    options: ['cat', 'green', 'black'],
    answer: 2,
    concept: '顏色單字認讀（black）',
    steps: [
      '左圖展示與「黑色」對應的圖案提示（black）。',
      '選項依序為 (1) cat（貓）、(2) green（綠色）、(3) black（黑色）。',
      '選 (3)。',
    ],
  },
  {
    num: 16,
    options: ['milk', 'marker', 'pencil'],
    answer: 2,
    concept: '文具單字認讀（pencil）',
    steps: [
      '左圖畫的是一支鉛筆（pencil）。',
      '選項依序為 (1) milk（牛奶）、(2) marker（彩色筆）、(3) pencil（鉛筆）。',
      '選 (3)。',
    ],
  },
  {
    num: 17,
    options: ['pen', 'ruler', 'rabbit'],
    answer: 1,
    concept: '文具單字認讀（ruler）',
    steps: [
      '左圖畫的是一把尺（ruler）。',
      '選項依序為 (1) pen（原子筆）、(2) ruler（尺）、(3) rabbit（兔子）。',
      '選 (2)。',
    ],
  },
];

const READING_S2P_SPECS = [
  {
    num: 18,
    stem: "It's a pig. It's red.",
    ttsPrompt: '第 18 題，讀一讀句子：It is a pig. It is red. 請選出符合這句話的圖片。',
    answer: 2,
    concept: '認讀動物與顏色形容詞句（red pig）',
    steps: [
      '句子意思是：「它是一隻豬（pig），它是紅色的（red）。」',
      '找出同時具備「豬」和「深紅色塗色」的圖片，即圖片 (3)。',
      '選 (3)。',
    ],
  },
  {
    num: 19,
    stem: "It's white. It's not a rabbit.",
    ttsPrompt: '第 19 題，讀一讀句子：It is white. It is not a rabbit. 請選出符合這句話的圖片。',
    answer: 0,
    concept: '顏色形容詞與否定句認讀（white, not a rabbit）',
    steps: [
      '句子有兩個條件：(1) 它是白色的（white，沒有塗深色），(2) 它不是兔子（not a rabbit）。',
      '對應「白色但不是兔子」的圖片為 (1)。',
      '選 (1)。',
    ],
  },
  {
    num: 20,
    stem: 'A: Is it an egg?  B: Yes, it is.',
    ttsPrompt: '第 20 題，對話：Is it an egg? Yes, it is. 請選出符合這段對話的圖片。',
    answer: 0,
    concept: '一般疑問句與肯定簡答（Is it an egg? Yes, it is.）',
    steps: [
      '問句問「這是一顆蛋嗎？」，回答是「Yes, it is.（是的，它是）」，因此圖片中的物品必須是蛋（egg）。',
      '對應畫有雞蛋的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 21,
    stem: "A: What's this?  B: A pen.",
    ttsPrompt: '第 21 題，對話：What is this? A pen. 請選出符合這段對話的圖片。',
    answer: 1,
    concept: '近指疑問句與文具問答（What is this? A pen.）',
    steps: [
      '問句使用「this（這個）」，代表手指指在近處，而且物品是原子筆（pen）。',
      '排除指出遠方（that）或其他文具的圖，對應指向近處原子筆的圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 22,
    stem: "A: Is that a cat?  B: No, it's not.",
    ttsPrompt: '第 22 題，對話：Is that a cat? No, it is not. 請選出符合這段對話的圖片。',
    answer: 2,
    concept: '遠指疑問句與否定簡答（Is that a cat? No, it is not.）',
    steps: [
      '問句「Is that a cat?」用 that 表示物品在較遠處，回答「No, it’s not.」表示那不是一隻貓。',
      '對應遠指著非貓物品的圖片 (3)，選 (3)。',
    ],
  },
];

const READING_P2S_SPECS = [
  {
    num: 23,
    options: ["That's a dog.", "It's not a dog.", 'This dog is white.'],
    optionTts: [
      '選項一，That is a dog.',
      '選項二，It is not a dog.',
      '選項三，This dog is white.',
    ],
    answer: 0,
    concept: '看圖辨識遠指肯定句（That is a dog.）',
    steps: [
      '比較三個句子：(1) 那是一隻狗；(2) 它不是一隻狗；(3) 這隻狗是白色的。',
      '觀察左邊圖片中手指向遠方的一隻狗，最恰當的句子是 (1) That’s a dog.',
      '選 (1)。',
    ],
  },
  {
    num: 24,
    options: [
      "It's a marker. It's not a pen.",
      "It's a marker. It's not red.",
      "It's a pen. It's red.",
    ],
    optionTts: [
      '選項一，It is a marker. It is not a pen.',
      '選項二，It is a marker. It is not red.',
      '選項三，It is a pen. It is red.',
    ],
    answer: 0,
    concept: '看圖辨識肯定與否定複合句（marker vs. pen）',
    steps: [
      '觀察左圖是一支麥克筆（marker），並非原子筆（pen）。',
      '只有選項 (1) 正確指出「它是一支麥克筆，它不是原子筆」（It’s a marker. It’s not a pen.）。',
      '選 (1)。',
    ],
  },
  {
    num: 25,
    options: [
      'A: Is it a rabbit?  B: Yes, it is.',
      "A: Is it a cat?  B: No, it's not.",
      "A: Is it a cake?  B: No, it's not.",
    ],
    optionTts: [
      '選項一，A 問 Is it a rabbit? B 答 Yes, it is.',
      '選項二，A 問 Is it a cat? B 答 No, it is not.',
      '選項三，A 問 Is it a cake? B 答 No, it is not.',
    ],
    answer: 2,
    concept: '看圖配對動物問答句（非蛋糕情境）',
    steps: [
      '檢查圖中角色所問與所見圖案，對照選項肯定／否定的合理性：',
      '(1) 若圖不是兔則錯；(2) 若圖就是貓或非貓不符圖意；(3) A 問「這是蛋糕嗎（Is it a cake?）」，看著圖上的非蛋糕動物回答「No, it’s not.」，完全符合圖意。',
      '選 (3)。',
    ],
  },
];

export const PRIORI_111_ENGLISH_G4_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-111-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g4/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/111/eng-g4/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: item.ttsPrompt,
      optionTtsTexts: item.optionTts,
      conceptTitle: item.concept,
      curriculumCode: 'Aa-II-2',
      prioriCode: 'ENG-P-4-1',
      explanationSteps: item.steps,
    };
  }),

  ...LISTENING_PIC_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-111-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/111/eng-g4/q${qStr}_fig.webp`,
      questionText: `第一部分（二）聽辨圖意（第 ${item.num} 題）\n請先播放官方聽力音檔（共 3 遍），再依左邊圖片選出最適合的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/111/eng-g4/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題，聽力看圖題。請先點擊官方聽力音檔，再從一、二、三號圖片中選出正確答案。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: 'Ac-II-3',
      prioriCode: 'ENG-L-4-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-111-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/111/eng-g4/q${qStr}_fig.webp`,
      questionText: `第二部分（一）看圖認字（第 ${item.num} 題）\n請觀察左邊圖片，選出最符合圖意的英語單字：`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題，看圖選單字。請對照左邊圖片，選出最符合圖意的英語單字。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'Ab-II-2',
      prioriCode: 'ENG-R-4-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_S2P_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-111-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/111/eng-g4/q${qStr}_fig.webp`,
      questionText: `第二部分（二）句子配對圖片（第 ${item.num} 題）\n請閱讀英文句子並選出最適合的圖片：\n${item.stem}`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: item.ttsPrompt,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: 'Ac-II-3',
      prioriCode: 'ENG-R-4-2',
      explanationSteps: item.steps,
    };
  }),

  ...READING_P2S_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-111-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/111/eng-g4/q${qStr}_fig.webp`,
      questionText: `第二部分（三）圖片配對句子（第 ${item.num} 題）\n請依照左邊圖片選出最適合的英語句子：`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題，看圖選句子。請依照左邊圖片選出最適合的句子。`,
      optionTtsTexts: item.optionTts,
      conceptTitle: item.concept,
      curriculumCode: 'Ac-II-3',
      prioriCode: 'ENG-R-4-2',
      explanationSteps: item.steps,
    };
  }),
];
