export const PRIORI_112_ENGLISH_G4_META = {
  paperId: '112-english-g4',
  examSeries: 'priori',
  year: 112,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 4,
  gradeLabel: '四年級',
  title: '112 年篩選測驗 四年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字讀寫 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「112 年篩選測驗英語科 4 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '112-english-g4',
  examSeries: 'priori',
  year: 112,
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
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字首子音填入 __eam。',
    options: ['w', 'r', 'b'],
    answer: 1,
    concept: '字首子音辨識（w 與 r 與 b）',
    steps: [
      '專注聽單字最開頭的子音：w 是圓唇滑音、r 是捲舌音、b 是雙唇塞音。',
      '音檔連續播放三遍清晰的 "ream"，開頭為明顯的捲舌音 r。',
      '對應子音字母 r，所以選 (2) r。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的韻尾拼字填入 h__。',
    options: ['ag', 'eg', 'ig'],
    answer: 2,
    concept: '短母音與韻尾拼讀辨識（ag 與 eg 與 ig）',
    steps: [
      '重點分辨中間的短母音口型：ag 是開口大音 a、eg 是短音 e、ig 是扁唇短音 i。',
      '音檔三次都念出清晰的 "hig"，中間母音為短音 i。',
      '對應韻尾拼字 (3) ig，所以選 (3)。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的韻尾拼字填入 m__。',
    options: ['op', 'up', 'ud'],
    answer: 0,
    concept: '短母音與字尾子音辨識（op 與 up 與 ud）',
    steps: [
      '同時留意中間母音（o 與 u）以及字尾收音是雙唇無聲塞音 p 還是舌尖有聲塞音 d。',
      '音檔念出清晰的 "mop"，母音為短音 o 且字尾雙唇閉合收在 p。',
      '對應選項 (1) op，所以選 (1)。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    concept: '聽辨動物與物品單字（bird）',
    steps: [
      '三張圖片依序為：圖 (1) 貓咪（cat）、圖 (2) 書本（book）、圖 (3) 小鳥（bird）。',
      '聆聽官方音檔清楚念出 "bird"（小鳥）。',
      '對應小鳥圖案的圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 5,
    concept: '聽辨顏色單字（yellow）',
    steps: [
      '三桶油漆上分別標示著國字：圖 (1) 黃色（yellow）、圖 (2) 紅色（red）、圖 (3) 藍色（blue）。',
      '官方音檔念出 "yellow"（黃色）。',
      '對應標示「黃色」的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 6,
    concept: '聽辨文具單字（pencil）',
    steps: [
      '三張文具圖片依序為：圖 (1) 鉛筆（pencil）、圖 (2) 直尺（ruler）、圖 (3) 黑色麥克筆（marker）。',
      '官方音檔念出 "pencil"（鉛筆）。',
      '對應圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 7,
    concept: '聽辨日常道別用語（Goodbye. 或 See you.）',
    steps: [
      '先播放官方聽力音檔，聽辨句子表達的日常社交情境。',
      '比較三張圖片：圖 (1) 兩人近距離打招呼交談；圖 (2) 不小心撞倒畫架道歉；圖 (3) 兩人拉開距離並轉身揮手道別。',
      '最符合揮手道別情境的是圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 8,
    concept: '聽辨日常動作與課堂指令（Sing.）',
    steps: [
      '播放官方聽力音檔，聽辨題目念出的動作或情境句。',
      '觀察三張圖片：圖 (1) 在籃球場遞水瓶道謝；圖 (2) 同學們站在台上張口唱歌；圖 (3) 指向桌上的書本。',
      '符合音檔描述的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 9,
    concept: '聽辨動物與物品問答句（cat）',
    steps: [
      '觀察三張圖片：圖 (1) 是長耳兔子（rabbit）、圖 (2) 是貓咪（cat）、圖 (3) 是生日蛋糕（cake）。',
      '聆聽官方音檔，確認句子指稱的對象為貓咪（cat）。',
      '對應貓咪的圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 10,
    concept: '聽辨食物單字與肯定否定句（egg）',
    steps: [
      '觀察三張圖片：圖 (1) 是一顆完整的蘋果（apple）、圖 (2) 是削開果皮的蘋果、圖 (3) 是一顆蛋（egg，不是蘋果）。',
      '播放官方聽力音檔，聽辨對話或句子對物品的描述與判斷。',
      '對照官方標準答案，正解為圖片 (3)，選 (3)。',
    ],
  },
];

const READING_WORD_SPECS = [
  {
    num: 11,
    options: ['apple', 'cake', 'milk'],
    answer: 2,
    concept: '飲品與食物單字認讀（milk）',
    steps: [
      '左邊圖片畫的是一盒牛奶。',
      '三個選項分別為 (1) apple（蘋果）、(2) cake（蛋糕）、(3) milk（牛奶）。',
      '正確單字為 (3) milk，選 (3)。',
    ],
  },
  {
    num: 12,
    options: ['white rabbit', 'white bird', 'red rabbit'],
    answer: 0,
    concept: '顏色形容詞搭配動物名詞片語（white rabbit）',
    steps: [
      '觀察左圖是一隻沒有塗黑、純白色的長耳朵小兔子。',
      '三個選項分別為 (1) white rabbit（白兔）、(2) white bird（白鳥）、(3) red rabbit（紅兔）。',
      '最符合圖片的是 (1) white rabbit，選 (1)。',
    ],
  },
  {
    num: 13,
    options: ['tiger', 'cat', 'dog'],
    answer: 2,
    concept: '動物單字認讀（dog）',
    steps: [
      '左邊圖片是一隻戴著項圈的小狗。',
      '三個選項分別為 (1) tiger（老虎）、(2) cat（貓）、(3) dog（狗）。',
      '正確單字為 (3) dog，選 (3)。',
    ],
  },
  {
    num: 14,
    options: ['tiger', 'lion', 'pig'],
    answer: 0,
    concept: '動物單字認讀（tiger）',
    steps: [
      '圖片是額頭有「王」字、身上有條紋的老虎。',
      '三個選項分別為 (1) tiger（老虎）、(2) lion（獅子）、(3) pig（豬）。',
      '正確單字為 (1) tiger，選 (1)。',
    ],
  },
  {
    num: 15,
    options: ['blue', 'black', 'green'],
    answer: 0,
    concept: '顏色單字認讀（blue）',
    steps: [
      '油漆桶身上清楚標示國字「藍色」。',
      '三個選項分別為 (1) blue（藍色）、(2) black（黑色）、(3) green（綠色）。',
      '對應「藍色」的單字為 (1) blue，選 (1)。',
    ],
  },
  {
    num: 16,
    options: ['yes', 'no', 'it'],
    answer: 1,
    concept: '肯定與否定回應詞認讀（no）',
    steps: [
      '圖中男孩看到打針嚇得流淚，雙手在胸前交叉拒絕，表達「不要、不（no）」。',
      '三個選項分別為 (1) yes（是）、(2) no（不）、(3) it（它）。',
      '符合拒絕情境的單字為 (2) no，選 (2)。',
    ],
  },
  {
    num: 17,
    options: ['ruler', 'pencil', 'marker'],
    answer: 0,
    concept: '文具單字認讀（ruler）',
    steps: [
      '左邊圖片是一把有刻度的長直尺。',
      '三個選項分別為 (1) ruler（尺）、(2) pencil（鉛筆）、(3) marker（彩色筆）。',
      '正確單字為 (1) ruler，選 (1)。',
    ],
  },
];

const READING_SENTENCE_SPECS = [
  {
    num: 18,
    stem: "It's a lion.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 1,
    hasFigure: true,
    concept: '動物句子閱讀理解（It\'s a lion.）',
    steps: [
      '題幹句意為「它是一隻獅子（It\'s a lion.）」。',
      '看三張圖片：圖 (1) 是貓咪（cat）、圖 (2) 是有蓬鬆鬃毛的獅子（lion）、圖 (3) 是老虎（tiger）。',
      '代表獅子的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 19,
    stem: "It's a fish. It's not a ruler.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 0,
    hasFigure: true,
    concept: '肯定與否定雙條件句辨識（a fish, not a ruler）',
    steps: [
      '題幹有兩個條件：「它是一條魚（It\'s a fish.）」而且「它不是一把尺（It\'s not a ruler.）」。',
      '觀察三張圖片：圖 (1) 是一條魚；圖 (2) 是一把普通的尺；圖 (3) 是印有小魚圖案的尺（本身仍是尺）。',
      '符合「是魚、不是尺」的是圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 20,
    stem: "A: What color is it? Yellow?\nB: No. It's red.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 0,
    hasFigure: true,
    concept: '顏色問答與否定澄清句型（No. It\'s red.）',
    steps: [
      '對話中 A 問：「它是什麼顏色？黃色嗎？」B 回答：「不，它是紅色的（It\'s red.）。」',
      '看三桶油漆上的文字標示：圖 (1) 標示「紅色」、圖 (2) 標示「綠色」、圖 (3) 標示「黃色」。',
      '對應紅色的圖片是 (1)，選 (1)。',
    ],
  },
  {
    num: 21,
    stem: "It's not a pencil. It's a marker. It's green.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 1,
    hasFigure: true,
    concept: '文具與顏色多條件篩選（marker 與 green）',
    steps: [
      '題幹條件：「不是鉛筆（not a pencil）」、「是麥克筆（a marker）」而且「是綠色的（green）」。',
      '比較三張圖：圖 (1) 是標示「紅色」的麥克筆；圖 (2) 是標示「綠色」的麥克筆；圖 (3) 是標示「綠色」的鉛筆。',
      '同時符合「麥克筆」與「綠色」的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 22,
    stem: "A: What's this? Is it a pig?\nB: Yes, it is.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 1,
    hasFigure: true,
    concept: '近指疑問句與動物圖案辨識（What\'s this? 與 a pig）',
    steps: [
      '對話問「這是什麼？它是一隻豬嗎？（What\'s this? Is it a pig?）」並肯定回答「Yes, it is.」。',
      '注意問句使用近指代名詞 "this"：圖 (1) 站在遠處指向小豬拼圖（應為 that）；圖 (2) 近距離指著桌上的小豬拼圖（this）；圖 (3) 桌上拼圖是小狗。',
      '同時符合「近指 this」與「小豬 pig」的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 23,
    stem: '請看左邊圖片，選出正確描述的對話或句子：',
    options: [
      "A: What is it?  B: It's an egg.",
      "A: Is it an egg?  B: No. It's a bird.",
      "A: Is it an egg?  B: Yes. It's an egg.",
    ],
    answer: 1,
    hasFigure: true,
    concept: '看圖辨識否定澄清對話（No. It\'s a bird.）',
    steps: [
      '左圖是一隻從破掉的蛋殼裡孵化出來的小鳥（bird），主角是小鳥而非完整的蛋（egg）。',
      '核對三個選項：(1) 與 (3) 都回答「它是一顆蛋」，與圖意不符；(2) 問「它是蛋嗎？」答「不，它是一隻鳥（No. It\'s a bird.）」，最準確。',
      '故選 (2)。',
    ],
  },
  {
    num: 24,
    stem: '請看左邊圖片，選出正確描述的對話或句子：',
    options: [
      "A: Is that a cake?  B: No, it's not.",
      "A: What's this?  B: It's a cake.",
      "A: What's that?  B: It's a cake.",
    ],
    answer: 2,
    hasFigure: true,
    concept: '看圖辨識遠近指示代名詞對話（What\'s that?）',
    steps: [
      '觀察左圖：女孩手指著「遠處」桌上的生日蛋糕（cake），距離較遠應使用遠指代名詞 "that"。',
      '核對選項：(1) 否定說是蛋糕（錯）；(2) 用近指 "this"（距離不符）；(3) 問 "What\'s that?" 並答 "It\'s a cake." 完全正確。',
      '故選 (3)。',
    ],
  },
  {
    num: 25,
    stem: '請看左邊圖片，選出正確描述的對話或句子：',
    options: [
      "A: Is this green?  B: No. It's black.",
      "A: What color is it?  B: It's black.",
      "A: What's your name?  B: My name is Black.",
    ],
    answer: 2,
    hasFigure: true,
    concept: '看圖區分姓名大寫與顏色問答（My name is Black.）',
    steps: [
      '左圖中女孩拿麥克風訪問男孩，男孩胸前掛著寫有大寫開頭 "Black" 的名牌，代表他的名字叫 Black。',
      '因此對話是在詢問姓名 "What\'s your name?" 並回答 "My name is Black."，而非詢問物品顏色。',
      '故選 (3)。',
    ],
  },
];

export const PRIORI_112_ENGLISH_G4_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-112-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/112/eng-g4/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/112/eng-g4/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽辨語音，請點擊官方聽力音檔按鈕聆聽三遍發音，再選出最適當的字母拼字選項。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${idx + 1}，${opt}`),
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
      id: `priori-112-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/112/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/112/eng-g4/q${qStr}_fig.webp`,
      questionText: `第一部分：聽辨${item.num <= 6 ? '單字' : '常用語或句子'}（第 ${item.num} 題）\n請先點擊官方聽力音檔播放 3 遍，再依圖片選出正確的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: [2, 0, 0, 2, 1, 1, 2][item.num - 4],
      media: {
        audioSrc: `/audio/priori/112/eng-g4/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽力測驗，請先點擊官方聽力音檔按鈕，再選出與音檔內容最相符的圖片編號。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: item.num <= 6 ? 'Ab-II-2' : 'Ac-II-3',
      prioriCode: item.num <= 6 ? 'ENG-V-4-1' : 'ENG-L-4-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-112-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/112/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/112/eng-g4/q${qStr}_fig.webp`,
      questionText: `第二部分：辨識單字（第 ${item.num} 題）\n請看左邊圖片，選出最符合圖片意思的英語單字或片語。`,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: null,
        audioSourceType: null,
      },
      ttsText: `第 ${item.num} 題辨識單字，請看圖片，選出最符合圖片內容的英語選項。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${idx + 1}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'Ab-II-2',
      prioriCode: 'ENG-R-4-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_SENTENCE_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-112-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/112/eng-g4/q${qStr}.webp`,
      figureImage: item.hasFigure ? `/assets/priori/112/eng-g4/q${qStr}_fig.webp` : null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: null,
        audioSourceType: null,
      },
      ttsText:
        item.num <= 22
          ? `第 ${item.num} 題閱讀理解，${item.stem.replace(/\n/g, ' ')}。請選出最符合句意的圖片編號。`
          : `第 ${item.num} 題看圖辨識句子，請看左邊圖片，從三個英語選項中選出最正確的描述。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${idx + 1}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'Ac-II-3',
      prioriCode: 'ENG-R-4-2',
      explanationSteps: item.steps,
    };
  }),
];
