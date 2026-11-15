export const PRIORI_114_ENGLISH_G4_META = {
  paperId: '114-english-g4',
  examSeries: 'priori',
  year: 114,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 4,
  gradeLabel: '四年級',
  title: '114 年篩選測驗 四年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字讀寫 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「114 年篩選測驗英語科 4 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '114-english-g4',
  examSeries: 'priori',
  year: 114,
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
    stem: '第一部分（一）聽音拼字：請播放官方聽力音檔，選出正確的字母組合填入 t__。',
    options: ['am', 'um', 'an'],
    answer: 0,
    concept: '短母音 /æ/ 與字尾子音拼讀（-am）',
    steps: [
      '先專心聆聽官方音檔念出的單字開頭 t 與母音、字尾音。',
      '注意分辨鼻音尾音是 /m/（am / um）還是 /n/（an），以及短母音是 /æ/ 還是 /ʌ/。',
      '依照官方標準答案，本題應選 (1) am。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽音拼字：請播放官方聽力音檔，選出正確的子音字母填入 __id。',
    options: ['l', 'z', 'r'],
    answer: 0,
    concept: '字首流音子音辨音（l- / r- / z-）',
    steps: [
      '把重點放在單字「第一個發出來的子音」，後面皆為 -id。',
      '區分舌尖抵上齒齦的 /l/、捲舌音 /r/，以及帶聲摩擦音 /z/。',
      '依照官方標準答案，本題應選 (1) l（lid）。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽音拼字：請播放官方聽力音檔，選出正確的短母音字母填入 j__t。',
    options: ['a', 'e', 'o'],
    answer: 2,
    concept: '短母音辨音（a / e / o）',
    steps: [
      '字首 j (/dʒ/) 與字尾 t (/t/) 都相同，只要專心分辨中間的母音。',
      '比較短母音 a (/æ/)、e (/ɛ/) 與 o (/ɑ/) 的開口度差別。',
      '依照官方標準答案，本題應選 (3) o（jot）。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    concept: '聽辨食物與飲料單字圖示',
    steps: [
      '先看清三張圖片分別代表的食物或飲料。',
      '播放官方聽力音檔（共念 3 遍），捕捉關鍵名詞。',
      '對照官方答案與圖片內容，本題正解為 (2)。',
    ],
  },
  {
    num: 5,
    concept: '聽辨顏色單字（白色／藍色／黃色）',
    steps: [
      '先觀察三管顏料分別標示的顏色：白色、藍色、黃色。',
      '聆聽官方聽力說出的顏色單字。',
      '對照官方標準答案，本題正解為 (2)。',
    ],
  },
  {
    num: 6,
    concept: '聽辨文具、動物與顏色相關單字圖示',
    steps: [
      '三張圖依序是尺（ruler）、老虎（tiger）與調色盤（colors）。',
      '聆聽官方聽力單字，比對圖片特徵。',
      '對照官方標準答案，本題正解為 (1)。',
    ],
  },
  {
    num: 7,
    concept: '聽辨日常問候與教室對話情境',
    steps: [
      '先觀察三張情境圖中人物的動作與對話關係。',
      '播放官方聽力對話，確認語氣與回應情境。',
      '對照官方標準答案，本題正解為 (2)。',
    ],
  },
  {
    num: 8,
    concept: '聽辨教室常用指令（揮手道別／起立／坐下）',
    steps: [
      '圖片分別表示道別、站起來（Stand up.）與坐下（Sit down.）。',
      '聽清音檔中的動作指令關鍵字。',
      '對照官方標準答案，本題正解為 (1)。',
    ],
  },
  {
    num: 9,
    concept: '聽辨動物與顏色特徵描述',
    steps: [
      '注意圖片呈現的老虎、黑色色塊與名稱標記（Tiger Black）。',
      '聆聽音檔描述，核對動物與顏色是否都相符。',
      '對照官方標準答案，本題正解為 (3)。',
    ],
  },
  {
    num: 10,
    concept: '聽辨距離與文具指示（this / that；pencil / ruler）',
    steps: [
      '觀察圖片中手指指向的遠近位置（近處 this 與遠處 that）及文具種類（鉛筆或尺）。',
      '聽清楚句子裡是 this 還是 that，以及文具名稱。',
      '對照官方標準答案，本題正解為 (1)。',
    ],
  },
];

const READ_WORD_PIC_SPECS = [
  {
    num: 11,
    options: ['cake', 'milk', 'book'],
    answer: 1,
    concept: '看圖辨認食物與飲料單字（milk）',
    steps: [
      '圖片是一個標示乳牛圖案的鮮奶瓶（牛奶）。',
      '選項 (1) cake 是蛋糕、(2) milk 是牛奶、(3) book 是書。',
      '符合圖意的是 (2) milk。',
    ],
  },
  {
    num: 12,
    options: ['fish', 'dog', 'lion'],
    answer: 0,
    concept: '看圖辨認動物單字（fish）',
    steps: [
      '圖片畫的是一條魚。',
      '選項 (1) fish 是魚、(2) dog 是狗、(3) lion 是獅子。',
      '因此選 (1) fish。',
    ],
  },
  {
    num: 13,
    options: ['book', 'blue', 'bird'],
    answer: 2,
    concept: '看圖辨認動物單字（bird）',
    steps: [
      '圖片畫的是一隻停在樹枝上的小鳥。',
      '選項 (1) book 是書、(2) blue 是藍色、(3) bird 是鳥。',
      '因此選 (3) bird。',
    ],
  },
  {
    num: 14,
    options: ['yellow', 'white', 'red'],
    answer: 1,
    concept: '看圖辨認顏色單字（white）',
    steps: [
      '圖片中手指正指著白色的星星圖案。',
      '選項 (1) yellow 黃色、(2) white 白色、(3) red 紅色。',
      '符合白色星星的是 (2) white。',
    ],
  },
  {
    num: 15,
    options: ['milk', 'ruler', 'marker'],
    answer: 2,
    concept: '看圖辨認文具單字（marker）',
    steps: [
      '圖片畫的是一支彩色筆／麥克筆。',
      '選項 (1) milk 牛奶、(2) ruler 尺、(3) marker 彩色筆。',
      '符合圖意的是 (3) marker。',
    ],
  },
  {
    num: 16,
    options: ['book', 'black', 'name'],
    answer: 0,
    concept: '看圖辨認物品單字（book）',
    steps: [
      '圖片畫的是一本翻開的書本。',
      '選項 (1) book 書、(2) black 黑色、(3) name 名字。',
      '因此選 (1) book。',
    ],
  },
  {
    num: 17,
    options: ['a blue banana', 'a red banana', 'a red pen'],
    answer: 1,
    concept: '顏色形容詞加名詞片語（a red banana）',
    steps: [
      '圖片中有人用「紅色」彩色筆把「香蕉」塗上紅色。',
      '組合起來就是 a red banana（一根紅色的香蕉）。',
      '選項 (2) a red banana 完全符合圖意。',
    ],
  },
];

const READ_PIC_CHOICE_SPECS = [
  {
    num: 18,
    prompt: "It's an egg.",
    answer: 0,
    concept: '單句閱讀理解（名詞單數 It is an egg）',
    steps: [
      "句意是「它是一顆蛋（It's an egg.）」。",
      '觀察三張圖片，找出呈現一顆蛋的圖示。',
      '對照官方標準答案，正解為圖 (1)。',
    ],
  },
  {
    num: 19,
    prompt: "A: What color is it?\nB: It's yellow.",
    answer: 1,
    concept: '顏色問答句理解（What color is it?）',
    steps: [
      'A 問這是什麼顏色，B 回答「它是黃色的（yellow）」。',
      '找出圖片中呈顯黃色或標示黃色的圖卡。',
      '對照官方標準答案，正解為圖 (2)。',
    ],
  },
  {
    num: 20,
    prompt: "It's a rabbit. It's black.",
    answer: 2,
    concept: '動物與顏色雙條件句閱讀',
    steps: [
      '句子包含兩個條件：第一是兔子（rabbit），第二是黑色（black）。',
      '逐一檢視三張圖，排除不是兔子或不是黑色的圖片。',
      '同時符合「黑色兔子」的是圖 (3)。',
    ],
  },
  {
    num: 21,
    prompt: "A: What's this?\nB: It's a lion. It's not a tiger.",
    answer: 1,
    concept: '否定句與動物辨識（lion vs. tiger）',
    steps: [
      'B 回答「這是一隻獅子，不是老虎」，同時注意問句是近指 What is this?。',
      '比對圖片中的動物種類與手指距離。',
      '對照官方標準答案，正解為圖 (2)。',
    ],
  },
  {
    num: 22,
    prompt: "A: Is it a pen?\nB: No, it's not.",
    answer: 2,
    concept: '一般疑問句否定回答（Is it a pen? No, it is not.）',
    steps: [
      'A 問「這是一支原子筆嗎？」，B 回答「不，不是」。',
      '因此正確圖片裡的物品不能是原子筆。',
      '對照官方標準答案，正解為圖 (3)。',
    ],
  },
];

const READ_PIC_SENTENCE_SPECS = [
  {
    num: 23,
    options: ["It's a rabbit.", "It's a pencil.", "It's a marker."],
    ttsOptions: ["選項一，It's a rabbit.", "選項二，It's a pencil.", "選項三，It's a marker."],
    answer: 1,
    concept: '看圖選句子（辨認文具與動物造型）',
    steps: [
      '圖片雖然有長頸鹿造型，但物品本質是一支「鉛筆（pencil）」。',
      '選項 (1) 兔子、(2) 鉛筆、(3) 彩色筆。',
      '符合圖中物品的是 (2) It\'s a pencil.。',
    ],
  },
  {
    num: 24,
    options: [
      "It's a lion. It's black.",
      "It's a dog. It's not black.",
      "It's a dog. It's not a cat.",
    ],
    ttsOptions: [
      "選項一，It's a lion. It's black.",
      "選項二，It's a dog. It's not black.",
      "選項三，It's a dog. It's not a cat.",
    ],
    answer: 2,
    concept: '看圖選句子（動物辨識與顏色條件）',
    steps: [
      '圖中正用「黑色」彩色筆幫一隻「狗（dog）」塗成黑色。',
      '因此 (1) 說獅子不對；(2) 說不是黑色與圖中黑色畫筆不符；(3) 說「是一隻狗，不是貓」完全正確。',
      '故選 (3)。',
    ],
  },
  {
    num: 25,
    options: [
      "A: What's this? / B: It's an apple.",
      "A: Is that an apple? / B: No, it's not.",
      "A: What's that? / B: It's an apple.",
    ],
    ttsOptions: [
      "選項一，A 問 What's this?，B 答 It's an apple.",
      "選項二，A 問 Is that an apple?，B 答 No, it's not.",
      "選項三，A 問 What's that?，B 答 It's an apple.",
    ],
    answer: 2,
    concept: '遠近指示代名詞應用（this 與 that）',
    steps: [
      '圖片中女孩站在樹下，手指著「遠處」樹上的蘋果，問句要用遠指的 that。',
      '(1) 用近指的 this 不合距離情境；(2) 回答 No 是否定蘋果，與圖意不符。',
      '正確對應圖意的是 (3) A: What\'s that? / B: It\'s an apple.。',
    ],
  },
];

export const PRIORI_114_ENGLISH_G4_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g4/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/114/eng-g4/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽音拼字，請點擊官方聽力音檔，並選出正確的字母選項。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，${opt}`),
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
      id: `priori-114-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/114/eng-g4/q${qStr}_fig.webp`,
      questionText: `第一部分（二）聽辨字詞與句子（第 ${item.num} 題）\n請先播放官方聽力音檔（共 3 遍），再選出最符合音檔內容的圖片。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: [1, 1, 0, 1, 0, 2, 0][item.num - 4],
      media: {
        audioSrc: `/audio/priori/114/eng-g4/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題，請播放官方聽力音檔，再選出最符合意思的圖片編號。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: 'Ac-II-3',
      prioriCode: 'ENG-L-4-1',
      explanationSteps: item.steps,
    };
  }),

  ...READ_WORD_PIC_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/114/eng-g4/q${qStr}_fig.webp`,
      questionText: `第二部分（一）看圖辨字（第 ${item.num} 題）\n請看左邊的圖片，選出最適當的字詞。`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題看圖辨字，請看圖片選出最適當的英文單字或片語。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'Ab-II-4',
      prioriCode: 'ENG-R-4-1',
      explanationSteps: item.steps,
    };
  }),

  ...READ_PIC_CHOICE_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/114/eng-g4/q${qStr}_fig.webp`,
      questionText: `第二部分（二）看圖理解句意（第 ${item.num} 題）\n請閱讀題目句子，選出最符合意思的圖片：\n${item.prompt}`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題，請讀句子選出正確的圖片。${item.prompt.replaceAll('\n', ' ')}`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: 'B-II-1',
      prioriCode: 'ENG-R-4-2',
      explanationSteps: item.steps,
    };
  }),

  ...READ_PIC_SENTENCE_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/114/eng-g4/q${qStr}_fig.webp`,
      questionText: `第二部分（三）看圖選句（第 ${item.num} 題）\n請看圖片內容，選出最符合的英文句子或對話。`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題看圖選句，請觀察圖片選出最符合意思的英文句子。`,
      optionTtsTexts: item.ttsOptions,
      conceptTitle: item.concept,
      curriculumCode: 'B-II-1',
      prioriCode: 'ENG-R-4-3',
      explanationSteps: item.steps,
    };
  }),
];
