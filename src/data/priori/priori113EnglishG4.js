export const PRIORI_113_ENGLISH_G4_META = {
  paperId: '113-english-g4',
  examSeries: 'priori',
  year: 113,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 4,
  gradeLabel: '四年級',
  title: '113 年篩選測驗 四年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字讀寫 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「113 年篩選測驗英語科 4 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '113-english-g4',
  examSeries: 'priori',
  year: 113,
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
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的母音填入 n__g。',
    options: ['o', 'i', 'a'],
    answer: 2,
    concept: '短母音拼讀辨識（a / i / o）',
    steps: [
      '專注聽中間短母音的口型：o 發 /ɑ/（nog）、i 發 /ɪ/（nig）、a 發 /æ/（nag）。',
      '音檔連續播放三遍清晰的 /næɡ/（nag）。',
      '對應開大口的短母音 a，所以選 (3) a。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的韻尾拼字填入 b__。',
    options: ['um', 'im', 'en'],
    answer: 0,
    concept: '短母音與鼻音韻尾辨識（um vs. im / en）',
    steps: [
      '先分辨母音：um 是短音 /ʌ/、im 是 /ɪ/、en 是 /ɛ/。',
      '同時聽字尾收音是閉雙唇鼻音 /m/ 還是 /n/。',
      '音檔為 /bʌm/（bum），對應 (1) um，選 (1)。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字首子音填入 __ed。',
    options: ['f', 'y', 'l'],
    answer: 1,
    concept: '字首子音辨識（f / y / l）',
    steps: [
      '把重點放在最開頭的子音：f 是咬唇吐氣音 /f/、y 是半母音 /j/、l 是舌邊音 /l/。',
      '音檔三次都是 /jɛd/（yed），開頭為滑音 /j/。',
      '對應子音字母 y，所以選 (2) y。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    concept: '聽辨點心食物單字（cake）',
    steps: [
      '三張圖片依序為牛奶盒（milk）、比薩（pizza）與杯子蛋糕（cake）。',
      '聆聽官方音檔清楚念出 "cake"（蛋糕）。',
      '對應圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 5,
    concept: '聽辨動物名稱單字（tiger）',
    steps: [
      '三張圖片依序為老虎（tiger）、獅子（lion）與小豬（pig）。',
      '音檔念出 "tiger"（老虎）。',
      '對應圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 6,
    concept: '聽辨顏色單字（black）',
    steps: [
      '三張色塊圖依序為白色（white）、純黑色（black）與灰色（gray）。',
      '音檔清楚念出 "black"（黑色）。',
      '對應塗滿黑色的圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 7,
    concept: '聽辨日常告別用語（See you.）',
    steps: [
      '圖 (1) 學生看著筆記、圖 (2) 兩人走過說話、圖 (3) 兩人揮手道別。',
      '音檔念出道別用語 "See you."（再見）。',
      '最符合揮手告別情節的是圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 8,
    concept: '聽辨教室指令（Put away your book.）',
    steps: [
      '音檔念出 "Put away your book."（把你的書收起來）。',
      '比較動作方向：圖 (1) 箭頭向外拿出書本；圖 (2) 箭頭向內把書本收進書包；圖 (3) 正在翻開書本。',
      '符合「收好書本」動作的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 9,
    concept: '聽辨顏色問答句（What color is it? It\'s red.）',
    steps: [
      '聽力對話為 "What color is it? It\'s red."（這是什麼顏色？它是紅色的）。',
      '檢視三張圖上的標籤：圖 (1) 寫著姓名牌 Ben Red（問姓名）；圖 (2) 油漆桶標示「紅色」；圖 (3) 彩色筆標示「黃色」。',
      '對應「紅色」物件的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 10,
    concept: '聽辨遠近指示與否定回答（Is that a marker? No, it\'s not.）',
    steps: [
      '音檔問："Is that a marker?"（那是一枝彩色筆嗎？）並回答："No, it\'s not."（不，它不是）。',
      '圖 (1) 手緊握「這枝」彩色筆；圖 (2) 手遠指 "that" 是一枝彩色筆（應為 Yes）；圖 (3) 手遠指一枝筆刷（並非彩色筆，符合 No, it\'s not）。',
      '因此選圖片 (3)。',
    ],
  },
];

const READING_WORD_SPECS = [
  {
    num: 11,
    options: ['egg', 'milk', 'apple'],
    answer: 0,
    concept: '食物與飲品單字認讀（egg）',
    steps: [
      '看左邊圖中的大箭頭，指向餐盤裡的荷包蛋。',
      '三個選項分別為 egg（蛋）、milk（牛奶）、apple（蘋果）。',
      '正確單字為 (1) egg，選 (1)。',
    ],
  },
  {
    num: 12,
    options: ['pig', 'dog', 'tiger'],
    answer: 0,
    concept: '動物單字認讀（pig）',
    steps: [
      '圖片畫的是一隻提著燈籠和春聯的小豬。',
      'pig（豬）、dog（狗）、tiger（老虎）。',
      '正確單字為 (1) pig，選 (1)。',
    ],
  },
  {
    num: 13,
    options: ['red', 'green', 'yellow'],
    answer: 1,
    concept: '顏色單字認讀（green）',
    steps: [
      '油漆桶身上寫著國字標示「綠色」。',
      'red（紅色）、green（綠色）、yellow（黃色）。',
      '對應「綠色」的單字為 (2) green，選 (2)。',
    ],
  },
  {
    num: 14,
    options: ['lion', 'ruler', 'rabbit'],
    answer: 2,
    concept: '動物單字認讀（rabbit）',
    steps: [
      '圖中是有著長耳朵的小兔子。',
      'lion（獅子）、ruler（尺）、rabbit（兔子）。',
      '正確單字為 (3) rabbit，選 (3)。',
    ],
  },
  {
    num: 15,
    options: ['pen', 'pencil', 'marker'],
    answer: 1,
    concept: '文具單字認讀（pencil）',
    steps: [
      '注意左邊圖上的箭頭指向筆筒最左邊那一枝削尖的木頭鉛筆（旁邊才是原子筆或彩色筆）。',
      'pen（原子筆／鋼筆）、pencil（鉛筆）、marker（彩色筆／麥克筆）。',
      '因此正確選項為 (2) pencil。',
    ],
  },
  {
    num: 16,
    options: ['color', 'name', 'marker'],
    answer: 0,
    concept: '分類與顏色名詞認讀（color）',
    steps: [
      '圖片中列出紅色、黃色、藍色、綠色四種顏料色卡。',
      'color（顏色）、name（名字）、marker（彩色筆）。',
      '能夠總括這四種顏色的單字是 (1) color。',
    ],
  },
  {
    num: 17,
    options: ['white cat', 'white dog', 'black dog'],
    answer: 1,
    concept: '顏色形容詞搭配動物名詞片語（white dog）',
    steps: [
      '觀察圖片上的動物外型是一隻沒有塗黑、純白色輪廓的小狗。',
      'white cat（白貓）、white dog（白狗）、black dog（黑狗）。',
      '最符合圖片的是 (2) white dog，選 (2)。',
    ],
  },
];

const READING_SENTENCE_SPECS = [
  {
    num: 18,
    stem: "A: What's your name?\nB: Lion.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 0,
    hasFigure: true,
    concept: '問姓名句型理解（What\'s your name?）',
    steps: [
      '對話問「你叫什麼名字？」，回答「Lion（我的名字是獅子）」。',
      '看三張圖：圖 (1) 男孩胸口別著 "Lion" 名牌（名字）；圖 (2) 畫獅子圖；圖 (3) T恤圖案。',
      '代表名字的是圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 19,
    stem: "It's a pen. It's yellow.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 0,
    hasFigure: true,
    concept: '文具與顏色雙條件句辨識',
    steps: [
      '題幹有兩個條件：「pen（原子筆）」和「yellow（黃色）」。',
      '仔細看三張圖：圖 (1) 筆上標籤寫著「黃色」（且為按壓式原子筆形狀）；圖 (2) 是紅色；圖 (3) 是綠色。',
      '同時符合「筆」與「黃色」的是圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 20,
    stem: "A: What's that?\nB: It's a banana.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 2,
    hasFigure: true,
    concept: '遠近指示代名詞與單數名詞辨識（that + a banana）',
    steps: [
      '注意問句用的是 "that"（遠指：那），而非 "this"（近指：這），並回答一根香蕉（a banana）。',
      '圖 (1) 遠指但香蕉很小或距離較曖昧？看手與香蕉距離及大小：圖 (2) 手直接握住香蕉（this）；圖 (1) 與 (3) 手指著遠方香蕉，看細節圖 (3) 香蕉在遠處且為單根清楚對指（核對官方標準答案為圖 3）。',
      '依遠指 "that" 的圖示約定與官方標準答案，選 (3)。',
    ],
  },
  {
    num: 21,
    stem: "It's red. It's not an apple.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 1,
    hasFigure: true,
    concept: '顏色與否定句條件篩選（red + not an apple）',
    steps: [
      '兩個條件：「It\'s red.（它是紅色的）」且「It\'s not an apple.（它不是蘋果）」。',
      '圖 (1) 同學手拿著蘋果；圖 (2) 同學拿著寫上或畫成紅色且「不是蘋果」的物品（草莓／心形小品）；圖 (3) 拿的是其他物件。',
      '符合「紅色且非蘋果」的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 22,
    stem: 'A: Is this a cat?\nB: Yes, it is.',
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 0,
    hasFigure: true,
    concept: '近指疑問句與肯定簡答（Is this a cat?）',
    steps: [
      '條件一：問的是 "this"（手指近距離觸碰／指著身邊）；條件二：動物是貓且回答 "Yes, it is."。',
      '圖 (1) 手就點在貓咪身上；圖 (2) 遠指其他小動物；圖 (3) 遠指小狗。',
      '符合所有條件的是圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 23,
    stem: '請看左邊圖片，選出正確描述的對話或句子：',
    options: [
      "A: What's this?  B: It's a bird.",
      "A: What's that?  B: It's a bird.",
      'A: Is that a cat?  B: Yes, it is.',
    ],
    answer: 0,
    hasFigure: true,
    concept: '看圖選對話（近指 this 與 bird）',
    steps: [
      '圖中雙手捧著一隻鸚鵡／小鳥（bird），就在手掌近處，而且一隻手指直接指向牠。',
      '因為距離非常近，應使用近指疑問詞 "this"（"What\'s this?"），不是遠指 "that"。',
      '因此正確選項為 (1)。',
    ],
  },
  {
    num: 24,
    stem: '請看左邊圖片，選出正確描述的對話或句子：',
    options: [
      "A: Is it a cake?  B: No, it's not.",
      "A: Is it a rabbit?  B: No, it's a lion.",
      "A: Is it a rabbit?  B: No, it's a cake.",
    ],
    answer: 2,
    hasFigure: true,
    concept: '否定澄清句型理解（No, it\'s a cake.）',
    steps: [
      '左圖是一個插著蠟燭「2」、裝飾成可愛兔子造型的生日蛋糕（實物是蛋糕 cake，外觀像兔子 rabbit）。',
      '對照選項：(1) 說不是蛋糕（錯）；(2) 說是獅子（錯）；(3) 問「它是兔子嗎？」答「不，它是一個蛋糕（No, it\'s a cake.）」，幽默又準確！',
      '故選 (3)。',
    ],
  },
  {
    num: 25,
    stem: '請看左邊圖片，選出正確描述的句子：',
    options: [
      "It's a fish. It's blue.",
      "It's red. It's not a fish.",
      "It's blue. It's not a fish.",
    ],
    answer: 2,
    hasFigure: true,
    concept: '看圖辨識顏色標籤與否定敘述（blue + not a fish）',
    steps: [
      '圖中是一隻章魚（並非魚 fish），手上拿著的彩色筆筆身清楚寫著「藍色」（blue）。',
      '因此「它是藍色的，而且它不是一條魚」最正確。',
      '對應選項 (3)，選 (3)。',
    ],
  },
];

export const PRIORI_113_ENGLISH_G4_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-113-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/113/eng-g4/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/113/eng-g4/q${qStr}.mp3`,
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
      id: `priori-113-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/113/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/113/eng-g4/q${qStr}_fig.webp`,
      questionText: `第一部分：聽辨${item.num <= 6 ? '單字' : '常用語或句子'}（第 ${item.num} 題）\n請先點擊官方聽力音檔播放 3 遍，再依圖片選出正確的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer:
        [2, 0, 1, 2, 1, 1, 2][item.num - 4],
      media: {
        audioSrc: `/audio/priori/113/eng-g4/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽力測驗，請先點擊官方聽力音檔按鈕，再選出與音檔內容最相符的圖片編號。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.num <= 6 ? '聽辨基礎單字與圖片配對' : '聽辨日常對話與情境圖配對',
      curriculumCode: item.num <= 6 ? 'Ab-II-2' : 'Ac-II-3',
      prioriCode: item.num <= 6 ? 'ENG-V-4-1' : 'ENG-L-4-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-113-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/113/eng-g4/q${qStr}.webp`,
      figureImage: `/assets/priori/113/eng-g4/q${qStr}_fig.webp`,
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
      id: `priori-113-eng-g4-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/113/eng-g4/q${qStr}.webp`,
      figureImage: item.hasFigure ? `/assets/priori/113/eng-g4/q${qStr}_fig.webp` : null,
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
