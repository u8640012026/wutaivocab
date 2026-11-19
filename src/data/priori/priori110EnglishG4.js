export const PRIORI_110_ENGLISH_G4_META = {
  paperId: '110-english-g4',
  examSeries: 'priori',
  year: 110,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 4,
  gradeLabel: '四年級',
  title: '110 年篩選測驗 四年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字讀寫 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「110 年篩選測驗英語科 4 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '110-english-g4',
  examSeries: 'priori',
  year: 110,
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
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的中間母音填入 f__b。',
    ttsPrompt: '第 1 題聽辨語音，請播放官方聽力音檔，選出正確的中間母音填入字母 f 和 b 中間。',
    options: ['i', 'u', 'a'],
    optionTts: ['選項一，字母 i', '選項二，字母 u', '選項三，字母 a'],
    answer: 2,
    concept: '單字中間短母音辨識（i 與 u 與 a）',
    steps: [
      '聚焦於三個短母音口型差異：i 是短促微扁平音，u 是嘴巴放鬆微閉的悶短音，a 是嘴巴張大呈扁平的短音 /æ/。',
      '播放官方聽力音檔，聽出字母 f 與 b 中間為張大口型的短音 /æ/，拼出 fab。',
      '對應選項 (3) a，選 (3)。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字首子音填入 __en。',
    ttsPrompt: '第 2 題聽辨語音，請播放官方聽力音檔，選出正確的字首子音填入前面空格。',
    options: ['z', 's', 'f'],
    optionTts: ['選項一，字母 z', '選項二，字母 s', '選項三，字母 f'],
    answer: 0,
    concept: '字首子音辨識（z 與 s 與 f）',
    steps: [
      '分辨字首三個子音差異：z 是聲帶震動的濁音 /z/，s 是不震動的清音 /s/，f 是上齒輕觸下唇的氣音 /f/。',
      '播放官方聽力音檔，聽出最開頭帶有明確聲帶震動的 /z/ 音，拼出 zen。',
      '對應選項 (1) z，選 (1)。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的韻尾拼字填入 w__。',
    ttsPrompt: '第 3 題聽辨語音，請播放官方聽力音檔，選出正確的拼字填入字母 w 後面。',
    options: ['ip', 'op', 'ox'],
    optionTts: ['選項一，i p', '選項二，o p', '選項三，o x'],
    answer: 1,
    concept: '短母音與字尾子音拼讀（ip 與 op 與 ox）',
    steps: [
      '分辨韻尾母音與收尾子音：ip 是短音 i 收雙唇音 p；op 是短音 o 收雙唇閉合的 p；ox 是短音 o 收 /ks/ 音。',
      '播放官方聽力音檔，聽出圓唇短音 o 接著雙唇輕閉爆破的 /p/ 收尾，拼出 wop。',
      '對應選項 (2) op，選 (2)。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    ans: 1,
    concept: '聽辨飲品單字（milk）',
    steps: [
      '觀察三張圖片：圖 (1) 是一盤切片蛋糕（cake）；圖 (2) 是印有乳牛圖案並插著吸管的牛奶盒（milk）；圖 (3) 是一支麥克筆（marker）。',
      '播放官方聽力音檔，聽辨念出的英文單字。',
      '對應圖片 (2) 牛奶盒（milk），選 (2)。',
    ],
  },
  {
    num: 5,
    ans: 2,
    concept: '聽辨動物單字（fish）',
    steps: [
      '觀察三張圖片：圖 (1) 是一隻小豬（pig）；圖 (2) 是一隻張翅飛翔的小鳥（bird）；圖 (3) 是一條有鱗片與大尾鰭的魚（fish）。',
      '播放官方聽力音檔，聽辨念出的動物單字。',
      '對應圖片 (3) 魚（fish），選 (3)。',
    ],
  },
  {
    num: 6,
    ans: 0,
    concept: '聽辨顏色單字（green）',
    steps: [
      '觀察三桶油漆上的國字標示：圖 (1) 貼著「綠」字標籤（green）；圖 (2) 貼著「白」字標籤（white）；圖 (3) 貼著「黑」字標籤（black）。',
      '播放官方聽力音檔，聽辨念出的顏色名稱。',
      '對應圖片 (1) 綠色油漆桶（green），選 (1)。',
    ],
  },
  {
    num: 7,
    ans: 1,
    concept: '聽辨日常互動與禮貌招呼情境',
    steps: [
      '觀察三張圖中男孩的動作：圖 (1) 男孩一隻手遮住眼睛、另一隻手指著左方；圖 (2) 男孩面帶微笑站立，右手自然伸出與人招呼互動；圖 (3) 男孩雙手食指在嘴前交叉比出叉叉手勢。',
      '播放官方聽力音檔，聽辨對話與語氣所表達的情境。',
      '依官方標準答案，對應情境為圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 8,
    ans: 0,
    concept: '聽辨課堂物品動作指令（Take out your book.）',
    steps: [
      '觀察三張圖片中女孩的動作與箭頭方向：圖 (1) 箭頭向上，女孩把書從書包拿出來（Take out your book.）；圖 (2) 箭頭向下，女孩把書收進書包；圖 (3) 椅子旁有向下箭頭，女孩準備坐下。',
      '播放官方聽力音檔，辨識說出的動作指令。',
      '對應圖片 (1) 從書包拿出書本的情境，選 (1)。',
    ],
  },
  {
    num: 9,
    ans: 2,
    concept: '聽辨顏色單字（yellow）',
    steps: [
      '觀察三桶油漆上的標籤文字：圖 (1) 寫著「紅」（red）；圖 (2) 寫著「黑」（black）；圖 (3) 寫著「黃」（yellow）。',
      '播放官方聽力音檔，聽辨說出的顏色名稱。',
      '對應圖片 (3) 黃色油漆桶（yellow），選 (3)。',
    ],
  },
  {
    num: 10,
    ans: 1,
    concept: '聽辨遠近指示代名詞與動物句型（That is a bird.）',
    steps: [
      '觀察三張圖片中手指指向的對象與距離：圖 (1) 兩隻手近距離圍著停在手指上的白鳥（This is a bird.）；圖 (2) 手指指向遠處空中飛翔的黑鳥（That is a bird.）；圖 (3) 手指指向遠處空中的飛機（That is not a bird.）。',
      '播放官方聽力音檔，注意聽距離提示（this 近／that 遠）與動物名稱（bird）。',
      '對應指向遠處小鳥的圖片 (2)，選 (2)。',
    ],
  },
];

const READING_WORD_SPECS = [
  {
    num: 11,
    options: ['egg', 'milk', 'cake'],
    answer: 2,
    concept: '食物單字認讀（cake）',
    steps: [
      '左圖畫著盤子上的一塊切片蛋糕（cake）。',
      '選項依序為 (1) egg（蛋）、(2) milk（牛奶）、(3) cake（蛋糕）。',
      '選 (3)。',
    ],
  },
  {
    num: 12,
    options: ['banana', 'apple', 'book'],
    answer: 0,
    concept: '水果單字認讀（banana）',
    steps: [
      '左圖畫的是一根彎彎的香蕉（banana）。',
      '選項依序為 (1) banana（香蕉）、(2) apple（蘋果）、(3) book（書本）。',
      '選 (1)。',
    ],
  },
  {
    num: 13,
    options: ['tiger', 'lion', 'dog'],
    answer: 0,
    concept: '動物單字認讀（tiger）',
    steps: [
      '左圖畫的是一隻身上有條紋的老虎（tiger）。',
      '選項依序為 (1) tiger（老虎）、(2) lion（獅子）、(3) dog（狗）。',
      '選 (1)。',
    ],
  },
  {
    num: 14,
    options: ['red', 'bird', 'rabbit'],
    answer: 2,
    concept: '動物單字認讀（rabbit）',
    steps: [
      '左圖畫的是一隻有著長耳朵的小白兔（rabbit）。',
      '選項依序為 (1) red（紅色）、(2) bird（小鳥）、(3) rabbit（兔子）。',
      '選 (3)。',
    ],
  },
  {
    num: 15,
    options: ['yellow', 'blue', 'green'],
    answer: 1,
    concept: '顏色單字認讀（blue）',
    steps: [
      '左圖畫著一桶寫著「藍」字的油漆桶（blue）。',
      '選項依序為 (1) yellow（黃色）、(2) blue（藍色）、(3) green（綠色）。',
      '選 (2)。',
    ],
  },
  {
    num: 16,
    options: ['white', 'black', 'red'],
    answer: 0,
    concept: '顏色單字認讀（white）',
    steps: [
      '左圖畫著一條擠出白色顏料、寫著「白色」的顏料管（white）。',
      '選項依序為 (1) white（白色）、(2) black（黑色）、(3) red（紅色）。',
      '選 (1)。',
    ],
  },
  {
    num: 17,
    options: ['book', 'lion', 'pen'],
    answer: 2,
    concept: '文具單字認讀（pen）',
    steps: [
      '左圖畫著一支正在書寫線條的鋼筆／原子筆（pen）。',
      '選項依序為 (1) book（書本）、(2) lion（獅子）、(3) pen（筆）。',
      '選 (3)。',
    ],
  },
];

const READING_S2P_SPECS = [
  {
    num: 18,
    stem: 'My name is Apple.',
    ttsPrompt: '第 18 題，讀一讀句子：My name is Apple. 請選出符合這句話的圖片。',
    answer: 0,
    concept: '自我介紹姓名句型（My name is ...）',
    steps: [
      '句子意思是：「我的名字叫作 Apple。」',
      '觀察三張圖片：圖 (1) 女孩胸前掛著寫有「Apple」的名牌並笑著指向它；圖 (2) 女孩指著桌上的蘋果圖卡；圖 (3) 畫有三顆蘋果。',
      '最符合自我介紹名字的是圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 19,
    stem: 'This is a fish.',
    ttsPrompt: '第 19 題，讀一讀句子：This is a fish. 請選出符合這句話的圖片。',
    answer: 1,
    concept: '近指單數物品句型（This is a fish.）',
    steps: [
      '句子「This is a fish.」用 this（這個）表示物品在很近的距離，且對象是魚（fish）。',
      '觀察三張圖片：圖 (1) 手打開盒蓋裡面是兩隻花枝／魷魚；圖 (2) 手指近距離指著魚缸裡的小金魚；圖 (3) 手指從遠處指著牆上的魚圖畫（that）。',
      '符合近指魚的圖片是 (2)，選 (2)。',
    ],
  },
  {
    num: 20,
    stem: 'It’s a ruler.',
    ttsPrompt: '第 20 題，讀一讀句子：It is a ruler. 請選出符合這句話的圖片。',
    answer: 1,
    concept: '文具單字與句型認讀（It is a ruler.）',
    steps: [
      '句子意思是：「它是一把尺（ruler）。」',
      '觀察三張圖片手裡拿的物品：圖 (1) 是剪刀；圖 (2) 是有刻度的直尺（ruler）；圖 (3) 是鉛筆（pencil）。',
      '符合直尺的圖片是 (2)，選 (2)。',
    ],
  },
  {
    num: 21,
    stem: 'It’s a cat. It’s not a pig.',
    ttsPrompt: '第 21 題，讀一讀句子：It is a cat. It is not a pig. 請選出符合這句話的圖片。',
    answer: 0,
    concept: '動物肯定與否定句認讀（cat vs. pig）',
    steps: [
      '句子意思是：「它是一隻貓（cat），它不是一隻豬（not a pig）。」',
      '觀察三張圖片：圖 (1) 是一隻條紋貓咪；圖 (2) 是一隻小豬；圖 (3) 是一隻兔子。',
      '選 (1)。',
    ],
  },
  {
    num: 22,
    stem: 'A: Is this an egg?  B: Yes, it is.',
    ttsPrompt: '第 22 題，對話：Is this an egg? Yes, it is. 請選出符合這段對話的圖片。',
    answer: 2,
    concept: '近指疑問句與肯定簡答（Is this an egg?）',
    steps: [
      '問句用「this（這個）」代表手指距離物品很近，而且詢問的是「蛋（egg）」，回答「Yes, it is.」確認就是蛋。',
      '觀察三張圖片：圖 (1) 手近距離指著蛋糕；圖 (2) 手從遠處指著彩蛋（that）；圖 (3) 手就在彩蛋正上方近距離指著蛋（this）。',
      '選 (3)。',
    ],
  },
];

const READING_P2S_SPECS = [
  {
    num: 23,
    options: ['It’s red.', 'It’s blue.', 'It’s a bird.'],
    optionTts: [
      '選項一，It is red.',
      '選項二，It is blue.',
      '選項三，It is a bird.',
    ],
    answer: 0,
    concept: '看圖辨識顏色形容句（It is red.）',
    steps: [
      '觀察左邊圖片：手拿著寫有「紅色」的彩色筆正在幫紙上的甲蟲塗色。',
      '對照三個句子：(1) 它是紅色的（It’s red.）；(2) 它是藍色的；(3) 它是一隻小鳥。',
      '最符合圖意的是 (1)，選 (1)。',
    ],
  },
  {
    num: 24,
    options: [
      'It’s a marker. It’s blue.',
      'It’s a ruler. It’s black.',
      'It’s a marker. It’s black.',
    ],
    optionTts: [
      '選項一，It is a marker. It is blue.',
      '選項二，It is a ruler. It is black.',
      '選項三，It is a marker. It is black.',
    ],
    answer: 2,
    concept: '看圖辨識文具與顏色複合句（black marker）',
    steps: [
      '觀察左圖是一支麥克筆（marker），筆身寫著「黑色」（black）。',
      '對照選項：(1) 顏色錯（blue）；(2) 物品錯（ruler）；(3) It’s a marker. It’s black.（它是一支麥克筆，它是黑色的）完全正確。',
      '選 (3)。',
    ],
  },
  {
    num: 25,
    options: [
      'A: What’s that? B: It’s a tiger.',
      'A: What’s that? B: It’s a lion.',
      'A: What’s this? B: It’s a lion.',
    ],
    optionTts: [
      '選項一，A 問 What is that? B 答 It is a tiger.',
      '選項二，A 問 What is that? B 答 It is a lion.',
      '選項三，A 問 What is this? B 答 It is a lion.',
    ],
    answer: 1,
    concept: '看圖辨識遠指問答與動物名詞（that lion）',
    steps: [
      '觀察左邊圖片：手在左下角指向遠處鐵籠裡的動物，籠子裡是有著濃密鬃毛的獅子（lion，非老虎）。',
      '因為距離較遠，問句應使用「that（那個）」，因此是 A: What’s that? B: It’s a lion.',
      '選 (2)。',
    ],
  },
];

export const PRIORI_110_ENGLISH_G4_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-110-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g4/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/110/eng-g4/q${qStr}.mp3`,
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
      id: `priori-110-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/110/eng-g4/q${qStr}_fig.webp`,
      questionText: `第一部分（二）聽辨圖意（第 ${item.num} 題）\n請先播放官方聽力音檔（共 3 遍），再依左邊圖片選出最適合的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/110/eng-g4/q${qStr}.mp3`,
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
      id: `priori-110-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/110/eng-g4/q${qStr}_fig.webp`,
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
      id: `priori-110-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/110/eng-g4/q${qStr}_fig.webp`,
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
      id: `priori-110-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/110/eng-g4/q${qStr}_fig.webp`,
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
