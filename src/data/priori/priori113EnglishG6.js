export const PRIORI_113_ENGLISH_G6_META = {
  paperId: '113-english-g6',
  examSeries: 'priori',
  year: 113,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 6,
  gradeLabel: '六年級',
  title: '113 年篩選測驗 六年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字讀寫 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「113 年篩選測驗英語科 6 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '113-english-g6',
  examSeries: 'priori',
  year: 113,
  subject: 'english',
  grade: 6,
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
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的長母音拼字填入 f____。',
    options: ['us', 'ese', 'use'],
    answer: 2,
    concept: '長母音與字尾子音辨識（u_e / e_e vs. us）',
    steps: [
      '注意母音是短音 /ʌ/（us）、長音 /iː/（ese）還是長音 /juː/（use），以及字尾帶 /z/ 音。',
      '音檔三次都念 "fuse"（/fjuːz/）。',
      '對應長母音拼法 (3) use，所以選 (3)。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的長母音拼字填入 sk____。',
    options: ['em', 'eam', 'ime'],
    answer: 1,
    concept: '雙母音長音拼讀辨識（ea / i_e vs. em）',
    steps: [
      '重點分辨中間的母音發音：em 是短母音 /ɛ/、eam 是長母音 /iː/、ime 是雙母音 /aɪ/。',
      '音檔三次清楚念出 "scheme" 音型的長音 /iː/（/skiːm/）。',
      '對應長母音組合 (2) eam，所以選 (2)。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的母音組合填入 sh____。',
    options: ['a', 'ea', 'ay'],
    answer: 2,
    concept: '雙字母母音組合發音（a / ea / ay）',
    steps: [
      '聽辨字尾母音是短音 /æ/（a）、長音 /iː/（ea）還是雙母音 /eɪ/（ay）。',
      '音檔三次念出 "shay"（/ʃeɪ/），結尾清楚上揚為 /eɪ/。',
      '對應 (3) ay，所以選 (3)。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    concept: '聽辨場所單字（school）',
    steps: [
      '三張圖依序為公園溜滑梯（park）、校園校舍大樓（school）與動物園大門（zoo）。',
      '官方音檔念出 "school"（學校）。',
      '對應學校建築圖 (2)，選 (2)。',
    ],
  },
  {
    num: 5,
    concept: '聽辨生活物品單字（bed）',
    steps: [
      '三張圖依序為提袋（bag）、小鳥（bird）與床鋪（bed）。',
      '音檔念出 "bed"（床）。',
      '對應圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 6,
    concept: '聽辨大小與性質形容詞（small）',
    steps: [
      '先注意三張圖片中的目標大小特徵，圖 (1) 與 (2)(3) 分別呈現小／深色／淺色對比。',
      '音檔清晰念出 "small"（小的）。',
      '對照官方標準答案與聽辨目標圖，正解為圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 7,
    concept: '聽辨關心問候語（What\'s wrong?）',
    steps: [
      '音檔念出關心別人的常用問句 "What\'s wrong?"（怎麼了？發生什麼事了？）。',
      '圖 (1) 一位同學看到好友抱著肚子難過皺眉，伸手詢問關心；圖 (2)(3) 則在開心揮手道別或鞠躬道歉。',
      '符合「詢問別人哪裡不舒服或出什麼事」的是圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 8,
    concept: '聽辨房間場所句子（She\'s in the bathroom.）',
    steps: [
      '聽力句子是 "She\'s in the bathroom."（她在浴室裡）。',
      '圖 (1) 在廚房端熱茶／客廳桌上；圖 (2) 推購物車在超市；圖 (3) 阿嬤泡在裝滿熱水的浴缸裡洗澡。',
      '在浴室裡的是圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 9,
    concept: '聽辨物品位置介系詞句（Where is my jacket? It\'s under the bag.）',
    steps: [
      '關鍵位置介系詞為 "under the bag"（在袋子「下面」）。',
      '看外套與袋子的相對位置：圖 (1) 外套在袋子裡或旁邊；圖 (2) 外套在袋子上面或後面；圖 (3) 外套清楚被壓在書包／袋子的底下。',
      '符合 "under the bag" 的是圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 10,
    concept: '聽辨場所與現在進行式（He\'s in the park. He\'s sleeping.）',
    steps: [
      '兩個關鍵條件：「in the park（在公園）」和「sleeping（正在睡覺）」。',
      '圖 (1) 男孩在戶外公園長椅上睡著了；圖 (2) 在室內床上睡覺；圖 (3) 在公園玩溜滑梯。',
      '兩項條件都符合的是圖片 (1)，選 (1)。',
    ],
  },
];

const READING_WORD_SPECS = [
  {
    num: 11,
    options: ['name', 'nurse', 'doctor'],
    answer: 1,
    concept: '職業單字認讀（nurse）',
    steps: [
      '圖片人物頭戴印有十字徽章的護士帽、穿著護理服，代表護理師／護士。',
      'name（名字）、nurse（護理師／護士）、doctor（醫師）。',
      '正確單字是 (2) nurse，選 (2)。',
    ],
  },
  {
    num: 12,
    options: ['play', 'sleep', 'dance'],
    answer: 0,
    concept: '日常活動動詞認讀（play）',
    steps: [
      '圖中男孩正開心地在戲水池與黃色小鴨游泳圈玩水（play）。',
      'play（玩耍）、sleep（睡覺）、dance（跳舞）。',
      '正確動詞為 (1) play，選 (1)。',
    ],
  },
  {
    num: 13,
    options: ['ten', 'music', 'English'],
    answer: 1,
    concept: '學校科目單字認讀（music）',
    steps: [
      '圖片上畫著小提琴、高音譜記號、音符、小喇叭與大鼓，全部都是音樂課樂器。',
      'ten（十）、music（音樂）、English（英語）。',
      '正確答案是 (2) music，選 (2)。',
    ],
  },
  {
    num: 14,
    options: ['school', 'bedroom', 'living room'],
    answer: 2,
    concept: '居家空間名詞認讀（living room）',
    steps: [
      '圖裡有沙發、茶几、馬克杯、盆栽與電視機，這是客廳的擺設。',
      'school（學校）、bedroom（臥室）、living room（客廳）。',
      '正確選項是 (3) living room，選 (3)。',
    ],
  },
  {
    num: 15,
    options: ['draw', 'dress', 'jacket'],
    answer: 1,
    concept: '服飾衣物單字認讀（dress）',
    steps: [
      '圖片畫的是一件連身洋裝／禮服（dress）。',
      'draw（畫畫）、dress（洋裝）、jacket（夾克外套）。',
      '正確單字是 (2) dress，選 (2)。',
    ],
  },
  {
    num: 16,
    options: ['shoe', 'short', 'skirt'],
    answer: 2,
    concept: '服飾衣物單字認讀（skirt）',
    steps: [
      '圖片畫的是一條單件半身長裙（skirt）。',
      'shoe（鞋子）、short（短的）、skirt（裙子）。',
      '正確單字為 (3) skirt，選 (3)。',
    ],
  },
  {
    num: 17,
    options: ['a red nose', 'a long ear', 'a big egg'],
    answer: 1,
    concept: '身體部位與特徵形容詞片語（a long ear）',
    steps: [
      '注意左上方的粗黑箭頭，直接指向小兔子又高又長的耳朵（ear）。',
      'a red nose（紅鼻子）、a long ear（一隻長耳朵）、a big egg（一顆大蛋）。',
      '符合箭頭所指部位的是 (2) a long ear，選 (2)。',
    ],
  },
];

const READING_DIALOGUE_SPECS = [
  {
    num: 18,
    stem: 'A: What is he doing?\nB: _____________________',
    options: ['Writing a book.', "He's a cook.", "He's short."],
    answer: 0,
    hasFigure: false,
    concept: '現在進行式問答配合（What is he doing?）',
    steps: [
      '問句 "What is he doing?" 詢問「他正在做什麼動作？」，需要使用「be 動詞 ＋ V-ing」或動作正在進行（V-ing）來回答。',
      '(2)「他是廚師」答職業；(3)「他很矮」答外型；只有 (1) "Writing a book."（正在寫一本書）回答了正在做的動作。',
      '因此選 (1)。',
    ],
  },
  {
    num: 19,
    stem: 'A: Do you like juice?\nB: _____________________',
    options: ['Yes. I like water.', 'Yes. I can eat.', 'No. I like milk.'],
    answer: 2,
    hasFigure: false,
    concept: 'Do you 疑問句邏輯回應',
    steps: [
      '問句問「你喜歡果汁嗎？（Do you like juice?）」，回答內容必須與「喜不喜歡」及「飲品選擇」邏輯一致。',
      '(1) 答喜歡但又換成水，前後矛盾；(2) 答我可以吃，答非所問；(3)「不喜歡，我喜歡牛奶」邏輯自然流暢。',
      '所以選 (3)。',
    ],
  },
  {
    num: 20,
    stem: 'A: Where are you going?\nB: _____________________',
    options: ['To the zoo.', 'In the bedroom.', "I'm having lunch."],
    answer: 0,
    hasFigure: false,
    concept: '去向問句回應（Where are you going? → To ...）',
    steps: [
      '問句 "Where are you going?" 詢問「你要『往哪裡去』？」，強調移動的目的地。',
      '(1) "To the zoo."（去動物園）明確回答目的地方向；(2) "In the bedroom." 答的是「現在在哪裡」的靜態位置，(3) 答動作。',
      '正確回應是 (1)。',
    ],
  },
  {
    num: 21,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      'I have two big mouths.',
      'I have three big heads.',
      'I have a small eye.',
    ],
    answer: 0,
    hasFigure: true,
    concept: '看圖辨識複數與身體特徵句（two big mouths）',
    steps: [
      '仔細數圖片中的雙頭蛇／外星怪物特徵：牠有兩個頭、每張臉各有 1 張大嘴，合起來有「兩張大嘴巴（two big mouths）」。',
      '(2) 說三個頭（圖只有 2 個）；(3) 說一隻小眼睛（圖有 4 隻眼睛）；只有 (1) 數量與形容詞皆正確。',
      '故選 (1)。',
    ],
  },
  {
    num: 22,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      'Mary is in the bedroom. She is reading.',
      'Mary is in the bedroom. She is drawing.',
      'Mary is in the bathroom. She is reading.',
    ],
    answer: 0,
    hasFigure: true,
    concept: '空間場所與人物動作雙重核對（bedroom + reading）',
    steps: [
      '先看場所背景有床鋪與枕頭，確定是在臥室（in the bedroom），不是浴室。',
      '再看女生（Mary）手上捧著書專心看書（reading），趴在地板上畫畫（drawing）的則是男生。',
      '兩項皆符合的是 (1)，選 (1)。',
    ],
  },
  {
    num: 23,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      "It's three o'clock. The boy is going to the supermarket.",
      "It's five o'clock. The boy is going to the supermarket.",
      "It's five o'clock. The boy is in the supermarket.",
    ],
    answer: 1,
    hasFigure: true,
    concept: '看圖讀時鐘與方向動詞（five o\'clock + going to）',
    steps: [
      '先看圖中大樓牆上的大圓鐘：短針指 5、長針指 12，代表現在是五點整（five o\'clock），可直接刪去 (1) 三點整。',
      '再看男孩正走在門口外、朝「超市」方向前去，並非已經在超市裡面（in），因此是 "going to the supermarket"。',
      '故選 (2)。',
    ],
  },
  {
    num: 24,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      "It's rainy. The boy is riding a bike.",
      'The boy is riding a big bike. He is tired.',
      "It's sunny. The boy is riding a small bike.",
    ],
    answer: 2,
    hasFigure: true,
    concept: '綜合觀察天氣與交通工具特徵（sunny + small bike）',
    steps: [
      '天空掛著一顆明亮的大太陽（sunny），排除 (1) 下雨。',
      '再看男孩跨騎的腳踏車非常迷你小巧（small bike），並非大腳踏車（big bike），排除 (2)。',
      '完全符合畫面細節的是 (3)，選 (3)。',
    ],
  },
  {
    num: 25,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      "I like English. I don't like art.",
      "I like math. I don't like English.",
      "I don't like Chinese. I like math.",
    ],
    answer: 1,
    hasFigure: true,
    concept: '表格符號與科目喜好推論（笑臉 vs. 哭臉）',
    steps: [
      '檢視四科表情圖表：國語（笑臉＝喜歡）、數學（笑臉＝喜歡）、美術（哭臉＝不喜歡）、英語（哭臉＝不喜歡）。',
      '逐一核對選項：(1) 說喜歡英語（錯）；(3) 說不喜歡國語（錯）；(2) 說喜歡數學、不喜歡英語（全對）。',
      '因此選 (2)。',
    ],
  },
];

export const PRIORI_113_ENGLISH_G6_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-113-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/113/eng-g6/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/113/eng-g6/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽辨語音，請點擊官方聽力音檔按鈕聆聽三遍發音，再選出最適當的拼字選項。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${idx + 1}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'Aa-III-2',
      prioriCode: 'ENG-P-6-1',
      explanationSteps: item.steps,
    };
  }),

  ...LISTENING_PIC_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-113-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/113/eng-g6/q${qStr}.webp`,
      figureImage: `/assets/priori/113/eng-g6/q${qStr}_fig.webp`,
      questionText: `第一部分：聽辨${item.num <= 6 ? '單字' : '常用語或句子'}（第 ${item.num} 題）\n請先點擊官方聽力音檔播放 3 遍，再依圖片選出正確的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer:
        [1, 2, 0, 0, 2, 2, 0][item.num - 4],
      media: {
        audioSrc: `/audio/priori/113/eng-g6/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽力測驗，請先點擊官方聽力音檔按鈕，再選出與音檔內容最相符的圖片編號。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.num <= 6 ? '聽辨場所生活單字與圖片配對' : '聽辨生活對話與空間進行式圖配對',
      curriculumCode: item.num <= 6 ? 'Ab-III-2' : 'Ac-III-3',
      prioriCode: item.num <= 6 ? 'ENG-V-6-1' : 'ENG-L-6-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-113-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/113/eng-g6/q${qStr}.webp`,
      figureImage: `/assets/priori/113/eng-g6/q${qStr}_fig.webp`,
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
      prioriCode: 'ENG-R-6-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_DIALOGUE_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-113-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/113/eng-g6/q${qStr}.webp`,
      figureImage: item.hasFigure ? `/assets/priori/113/eng-g6/q${qStr}_fig.webp` : null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: null,
        audioSourceType: null,
      },
      ttsText:
        item.num <= 20
          ? `第 ${item.num} 題閱讀對話回應，${item.stem.replace(/_{3,}/g, '空格').replace(/\n/g, ' ')}。請選出最恰當的英語回應。`
          : `第 ${item.num} 題看圖辨識句子，請看左邊圖片，從三個英語選項中選出最正確的描述。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${idx + 1}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'Ac-III-3',
      prioriCode: 'ENG-R-6-2',
      explanationSteps: item.steps,
    };
  }),
];
