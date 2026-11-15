export const PRIORI_113_ENGLISH_G5_META = {
  paperId: '113-english-g5',
  examSeries: 'priori',
  year: 113,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 5,
  gradeLabel: '五年級',
  title: '113 年篩選測驗 五年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字讀寫 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「113 年篩選測驗英語科 5 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '113-english-g5',
  examSeries: 'priori',
  year: 113,
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
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字首子音拼字填入 __eer。',
    options: ['s', 'th', 'sh'],
    answer: 2,
    concept: '複合子音字首辨音（s / th / sh）',
    steps: [
      '專注聽最開頭的發音：s 是齒音 /s/、th 是咬舌 /θ/ 或 /ð/、sh 是捲舌輕音 /ʃ/。',
      '音檔三次都念 "sheer"（/ʃɪr/），開頭為柔和的 /ʃ/ 音。',
      '對應複合子音 (3) sh，所以選 (3)。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的複合子音填入 __ock。',
    options: ['br', 'bl', 'l'],
    answer: 1,
    concept: 'L 混音與 R 混音辨別（br / bl / l）',
    steps: [
      '仔細聽字首是否有兩個子音連讀，以及第二個音是 /r/ 還是舌邊音 /l/。',
      '音檔清楚念出 "block"（/blɑːk/），可聽到明顯的 /b/ 加 /l/。',
      '對應 (2) bl，所以選 (2)。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的雙子音起首拼字填入 __ep。',
    options: ['sh', 'sk', 'st'],
    answer: 1,
    concept: '複合子音字首辨音（sh / sk / st）',
    steps: [
      '區分三個選項：sh 發 /ʃ/、sk 發 /sk/、st 發 /st/。',
      '音檔三次都是 "skep"（/skɛp/），s 後方緊接清塞音 /k/。',
      '所以選 (2) sk。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    concept: '聽辨基礎數字單字（eight）',
    steps: [
      '三張圖分別顯示數字 8（eight）、6（six）與 10（ten）。',
      '音檔三次念出 "eight"（八）。',
      '對應數字 8 的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 5,
    concept: '聽辨飲品單字（water）',
    steps: [
      '三張圖依序為瓶裝飲料（標有水果／乳飲圖示）、鋁箔包果汁與一杯清澈透明的水（water）。',
      '音檔念出 "water"（水）。',
      '對應第三張圖的水杯，選 (3)。',
    ],
  },
  {
    num: 6,
    concept: '聽辨天氣與體感形容詞（cool）',
    steps: [
      '觀察圖片：圖 (1) 男孩騎著單車在微風中吹拂（涼爽 cool）；圖 (2) 下雪寒風刺骨（cold）；圖 (3) 流汗熱（hot）。',
      '音檔念出 "cool"（涼爽的）。',
      '最符合微風涼爽感覺的是圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 7,
    concept: '聽辨生活常用指令（Hurry up.）',
    steps: [
      '音檔念出 "Hurry up."（快一點／趕快！）。',
      '比較畫面：圖 (1) 背著書包急忙奔跑、身旁同學揮手催促快點；圖 (2) 對話打招呼；圖 (3) 坐著討論。',
      '符合「趕快」情境的是圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 8,
    concept: '聽辨人稱代名詞與能力句（He can sing.）',
    steps: [
      '聽力句子為 "He can sing."（他會唱歌），關鍵代名詞是男生的「He」。',
      '三個人物都有音符在唱歌，但圖 (1)、圖 (2) 都是女生（She），只有圖 (3) 是男生（He）拿著麥克風唱歌。',
      '因此正確選項為圖片 (3)。',
    ],
  },
  {
    num: 9,
    concept: '聽辨單複數與數量問答（What do you see? I see two pizzas.）',
    steps: [
      '聽力對話："What do you see? I see two pizzas."（你看到什麼？我看到兩個比薩）。',
      '比較畫面：圖 (1) 男孩睜開眼睛看著桌上兩個比薩（I see two pizzas）；圖 (2) 桌上只有一個比薩；圖 (3) 男孩閉上眼睛，比薩出現在頭上的想像泡泡裡（不是實際看到）。',
      '因此正確選項為圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 10,
    concept: '聽辨整點時間問答（What time is it? It\'s 4 o\'clock.）',
    steps: [
      '聽力對話："What time is it? It\'s 4 o\'clock."（現在幾點了？現在四點整）。',
      '看圖片區分物件：圖 (1) 是插 4 歲蠟燭的蛋糕（表年齡）；圖 (2) 電子時鐘清楚顯示 "4:00"；圖 (3) 時鐘為十一點或十二點。',
      '對應四點整時鐘的是圖片 (2)，選 (2)。',
    ],
  },
];

const READING_WORD_SPECS = [
  {
    num: 11,
    options: ['juice', 'cake', 'rice'],
    answer: 2,
    concept: '食物單字認讀（rice）',
    steps: [
      '圖片畫著滿滿一大碗白米飯（rice）。',
      'juice（果汁）、cake（蛋糕）、rice（米飯）。',
      '正確單字為 (3) rice，選 (3)。',
    ],
  },
  {
    num: 12,
    options: ['pencil', 'short', 'you'],
    answer: 1,
    concept: '長短比較形容詞辨識（short）',
    steps: [
      '圖中同時出現一枝長鉛筆和一枝短鉛筆，大箭頭特別指著下面那枝「較短的」。',
      '這題不是問名詞鉛筆，而是強調長短對比中的「短的（short）」。',
      '正確選項為 (2) short。',
    ],
  },
  {
    num: 13,
    options: ['one', 'three', 'seven'],
    answer: 1,
    concept: '數字單字認讀（three）',
    steps: [
      '球體上印著明顯的數字「3」。',
      'one（1）、three（3）、seven（7）。',
      '對應英文拼字是 (2) three，選 (2)。',
    ],
  },
  {
    num: 14,
    options: ['write', 'milk', 'like'],
    answer: 2,
    concept: '常用動詞單字認讀（like）',
    steps: [
      '圖中男孩滿臉笑意抱著小鴨玩偶，周圍冒出好幾顆愛心，表達「喜歡」。',
      'write（寫字）、milk（牛奶）、like（喜歡）。',
      '對應「喜歡」的是 (3) like，選 (3)。',
    ],
  },
  {
    num: 15,
    options: ['tall', 'tea', 'five'],
    answer: 0,
    concept: '高矮形容詞認讀（tall）',
    steps: [
      '圖片並排兩座高塔，大箭頭指向左邊高出許多的高樓，強調「高的」。',
      'tall（高的）、tea（茶）、five（五）。',
      '正確選項是 (1) tall，選 (1)。',
    ],
  },
  {
    num: 16,
    options: ['ten pies', 'six pies', 'six eggs'],
    answer: 1,
    concept: '數量搭配複數食物名詞（six pies）',
    steps: [
      '數一數圖片中的派餅：兩排各 3 個，一共 6 個派（six pies）。',
      'ten pies（十個派）、six pies（六個派）、six eggs（六顆蛋）。',
      '數量與品名都吻合的是 (2) six pies。',
    ],
  },
  {
    num: 17,
    options: ['a big dog', 'a thin pig', 'a thin dog'],
    answer: 2,
    concept: '體型形容詞搭配動物名詞（a thin dog）',
    steps: [
      '左邊有一隻瘦瘦的狗和右邊一隻胖胖的狗，箭頭指向左邊較瘦的那一隻。',
      'big（大的）、thin（瘦的）；動物都是 dog（狗）。',
      '所以應選 (3) a thin dog。',
    ],
  },
];

const READING_SENTENCE_SPECS = [
  {
    num: 18,
    stem: 'My brother is one year old.',
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 0,
    hasFigure: true,
    concept: '年齡與家人描述句（brother + one year old）',
    steps: [
      '句意：「我弟弟（或哥哥）一歲了。」重點包含男生（brother）與嬰兒年紀一歲（one year old）。',
      '看三張照片框：圖 (1) 是包尿布的小寶寶（符合一歲嬰兒）；圖 (2) 為穿洋裝小女孩；圖 (3) 為成年畢業生哥哥。',
      '因此選圖片 (1)。',
    ],
  },
  {
    num: 19,
    stem: 'I want five bananas.',
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 0,
    hasFigure: true,
    concept: '數量需求句閱讀（want five bananas）',
    steps: [
      '句意：「我想要五根香蕉。」',
      '看各隻猴子手邊或想要拿取的數量：圖 (1) 猴子指著 5 根香蕉；圖 (2) 是 2 根香蕉；圖 (3) 是 3 根香蕉。',
      '數量剛好為 5 根的是圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 20,
    stem: 'The bird can dance. The dog can swim.',
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 1,
    hasFigure: true,
    concept: '雙動物動作句複合檢核（bird dance + dog swim）',
    steps: [
      '必須同時符合兩句話：「小鳥會跳舞」而且「小狗會游泳」。',
      '看圖片細節：圖 (1) 小鳥走路、小狗睡覺？圖 (2) 天上的小鳥擺出舞姿且周圍飄著音符（can dance），水中的小狗則正在劃水游泳（can swim）！圖 (3) 兩者動作沒全對上。',
      '同時符合兩項描述的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 21,
    stem: "A: How's the weather?\nB: It's warm. It's not hot.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 1,
    hasFigure: true,
    concept: '天氣感覺詞辨識（warm, not hot）',
    steps: [
      '對話說天氣「很溫暖，不會熱（It\'s warm. It\'s not hot.）」。',
      '三張圖比較：圖 (1) 穿著厚外套烤火很冷；圖 (2) 在柔和陽光下舒服伸懶腰乘涼（warm）；圖 (3) 滿頭大汗吹電風扇（hot）。',
      '符合「溫暖不熱」的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 22,
    stem: "I see a black fish. It's happy.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 2,
    hasFigure: true,
    concept: '顏色與情緒雙條件辨識（black fish + happy）',
    steps: [
      '兩個條件：「黑色的魚（black fish）」且「很開心（happy）」。',
      '圖 (1) 是黑魚但眉頭深鎖難過；圖 (2) 是微笑但為白魚（沒塗黑）；圖 (3) 全身黑色又露出開心笑臉。',
      '兩項條件都符合的是圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 23,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: ["It's cold.", "It's sunny.", 'The girl is tall.'],
    answer: 0,
    hasFigure: true,
    concept: '看圖辨識天氣感受（It\'s cold.）',
    steps: [
      '圖片背景飄著大片雪花，人物都戴上圍巾毛帽並且雙手抱胸直打哆嗦。',
      '這表現的是寒冷的天氣（cold），不是大太陽（sunny），圖片也沒在比較女生身高（tall）。',
      '所以選 (1) It\'s cold.。',
    ],
  },
  {
    num: 24,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      "I'm happy. I want pizza.",
      "It's hot. I want cold water.",
      "It's twelve o'clock. I'm tired.",
    ],
    answer: 2,
    hasFigure: true,
    concept: '時間與身心狀態看圖推理（twelve o\'clock + tired）',
    steps: [
      '仔細觀察圖片細節：牆上掛鐘指著 12 點整（twelve o\'clock），但男孩卻垂頭站著汗如雨下、精疲力竭。',
      '選項 (1) 說「我很開心」與流淚疲憊表情不符；(2) 說「想要冰水」，圖裡沒有水只有牆外夜色／窗與想著或拒絕狀況、且沒拿冰水；唯有 (3) 準確說出時鐘 12 點與男孩很累（tired）。',
      '對照官方標準答案，選 (3)。',
    ],
  },
  {
    num: 25,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      "I see a boy. He's thin. He can't sing.",
      "The girl is nine years old. She can't sing. She's sad.",
      "The girl is my sister. She can read. She's nine years old.",
    ],
    answer: 2,
    hasFigure: true,
    concept: '綜合閱讀句子與多線索核對（sister + can read + nine）',
    steps: [
      '核對圖片每個線索：男孩正在開心放聲歌唱、面前有插著「9」蠟燭的蛋糕；旁邊的小女孩正專注捧著書閱讀（can read）且面帶笑容。',
      '(1) 錯在說男孩不會唱歌；(2) 錯在說女孩悲傷；(3) 符合小女孩會閱讀、九歲等設定（對照官方標準答案為 3）。',
      '因此選 (3)。',
    ],
  },
];

export const PRIORI_113_ENGLISH_G5_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-113-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/113/eng-g5/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/113/eng-g5/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽辨語音，請點擊官方聽力音檔按鈕聆聽三遍發音，再選出最適當的拼字選項。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${idx + 1}，${opt}`),
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
      id: `priori-113-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/113/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/113/eng-g5/q${qStr}_fig.webp`,
      questionText: `第一部分：聽辨${item.num <= 6 ? '單字' : '常用語或句子'}（第 ${item.num} 題）\n請先點擊官方聽力音檔播放 3 遍，再依圖片選出正確的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer:
        [0, 2, 0, 0, 2, 0, 1][item.num - 4],
      media: {
        audioSrc: `/audio/priori/113/eng-g5/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽力測驗，請先點擊官方聽力音檔按鈕，再選出與音檔內容最相符的圖片編號。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.num <= 6 ? '聽辨基礎單字與圖片配對' : '聽辨日常句型與時間數量圖配對',
      curriculumCode: item.num <= 6 ? 'Ab-III-2' : 'Ac-III-3',
      prioriCode: item.num <= 6 ? 'ENG-V-5-1' : 'ENG-L-5-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-113-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/113/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/113/eng-g5/q${qStr}_fig.webp`,
      questionText: `第二部分：辨識單字（第 ${item.num} 題）\n請看左邊圖片，選出最符合圖片或箭頭所指意義的英語選項。`,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: null,
        audioSourceType: null,
      },
      ttsText: `第 ${item.num} 題辨識單字，請看圖片，選出最符合圖片內容的英語選項。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${idx + 1}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'Ab-III-2',
      prioriCode: 'ENG-R-5-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_SENTENCE_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-113-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/113/eng-g5/q${qStr}.webp`,
      figureImage: item.hasFigure ? `/assets/priori/113/eng-g5/q${qStr}_fig.webp` : null,
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
      curriculumCode: 'Ac-III-3',
      prioriCode: 'ENG-R-5-2',
      explanationSteps: item.steps,
    };
  }),
];
