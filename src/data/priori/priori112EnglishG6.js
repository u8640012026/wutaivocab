export const PRIORI_112_ENGLISH_G6_META = {
  paperId: '112-english-g6',
  examSeries: 'priori',
  year: 112,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 6,
  gradeLabel: '六年級',
  title: '112 年篩選測驗 六年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字讀寫 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「112 年篩選測驗英語科 6 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '112-english-g6',
  examSeries: 'priori',
  year: 112,
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
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的長母音拼字填入 br____。',
    options: ['ak', 'eek', 'ake'],
    answer: 2,
    concept: '長母音 a_e 與短母音拼讀辨識（ak 與 eek 與 ake）',
    steps: [
      '專注聽中間的母音：ak 是短母音 a、eek 是長母音 ee、ake 是雙母音長音 a_e。',
      '音檔三次都念出 "brake"，可清楚聽到長母音 a 與字尾 k。',
      '對應長母音拼法 (3) ake，所以選 (3)。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的長母音拼字填入 s____。',
    options: ['ane', 'ine', 'une'],
    answer: 1,
    concept: '長母音魔法 e 拼讀辨識（ane 與 ine 與 une）',
    steps: [
      '重點分辨中間的長母音發音：ane 發長音 a、ine 發長音 i、une 發長音 u。',
      '音檔三次清楚念出 "sine"，中間為雙母音長音 i 後接鼻音 n。',
      '對應長母音組合 (2) ine，所以選 (2)。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的母音組合填入 r____。',
    options: ['ay', 'ea', 'eel'],
    answer: 1,
    concept: '雙字母母音組合與字尾音辨識（ay 與 ea 與 eel）',
    steps: [
      '聽辨字尾母音是雙母音 ay 還是長母音 ea，並注意結尾有沒有舌邊音 l。',
      '音檔三次念出清晰的長音 "rea"，結尾沒有 l 的收音。',
      '對應 (2) ea，所以選 (2)。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    concept: '聽辨日常動作單字（walk）',
    steps: [
      '觀察三張圖中女孩的動作：圖 (1) 坐在桌前吃東西（eat）；圖 (2) 雙腳平穩走路（walk）；圖 (3) 邁開大步奔跑（run）。',
      '官方音檔念出 "walk"（走路）。',
      '對應走路動作的圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 5,
    concept: '聽辨學校科目單字（math）',
    steps: [
      '三本課本封面上依序寫著：圖 (1) 數學（math）、圖 (2) 國語（Chinese）、圖 (3) 音樂（music）。',
      '官方音檔念出 "math"（數學）。',
      '對應數學課本的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 6,
    concept: '聽辨生活場所單字（supermarket）',
    steps: [
      '三張場所圖片依序為：圖 (1) 擺滿書櫃的書店（bookstore）、圖 (2) 有收銀台結帳的超級市場（supermarket）、圖 (3) 有長頸鹿與大象的動物園（zoo）。',
      '官方音檔清晰念出 "supermarket"（超市）。',
      '對應超市結帳櫃檯的圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 7,
    concept: '聽辨日常禮貌應對用語（Thank you. 與 You\'re welcome.）',
    steps: [
      '觀察三張圖的對話情境：圖 (1) 一人送上禮物，對方道謝說 "Thank you."；圖 (2) 指著地上說 "Look!"；圖 (3) 道歉說 "Sorry."。',
      '聆聽官方音檔念出的禮貌回應句（如 You\'re welcome. 不客氣）。',
      '符合道謝與回應情境的是圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 8,
    concept: '聽辨職業與人稱句子（He is a doctor.）',
    steps: [
      '三張圖的人物職業分別為：圖 (1) 戴高帽端菜的廚師（cook）、圖 (2) 戴護士帽的女護理師（nurse）、圖 (3) 配戴聽診器的男醫師（doctor）。',
      '聆聽官方音檔描述的人物職業為醫師（doctor）。',
      '對應圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 9,
    concept: '聽辨時間與日常作息句子',
    steps: [
      '三張圖中女孩都在吃麵，關鍵差別在牆上的時鐘時刻：圖 (1) 指針在 12 點整；圖 (2) 長針指在 6（代表 12 點 30 分）；圖 (3) 指針位置不同。',
      '聆聽官方音檔中的時間描述，核對牆上時鐘的分針位置。',
      '符合音檔時刻的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 10,
    concept: '聽辨現在進行式動作句子（reading）',
    steps: [
      '比較三張圖中男孩的動作：圖 (1) 雙手捧著書本正在看書（reading）；圖 (2) 看著桌上立著的國語課本；圖 (3) 手握鉛筆正在寫字（writing）。',
      '聆聽官方音檔的動作描述，確認主角正在進行閱讀（reading）的動作。',
      '對應正在看書的圖片 (1)，選 (1)。',
    ],
  },
];

const READING_WORD_SPECS = [
  {
    num: 11,
    options: ['doctor', 'brother', 'teacher'],
    answer: 0,
    concept: '職業單字認讀（doctor）',
    steps: [
      '圖片人物身穿白袍、脖子上掛著聽診器，代表醫師（doctor）。',
      '三個選項分別為 (1) doctor（醫師）、(2) brother（兄弟）、(3) teacher（老師）。',
      '正確單字是 (1) doctor，選 (1)。',
    ],
  },
  {
    num: 12,
    options: ['ride', 'write', 'dance'],
    answer: 0,
    concept: '日常活動動詞認讀（ride）',
    steps: [
      '圖中人物戴著安全帽正在騎車（ride）。',
      '三個選項分別為 (1) ride（騎乘）、(2) write（寫字）、(3) dance（跳舞）。',
      '正確動詞為 (1) ride，選 (1)。',
    ],
  },
  {
    num: 13,
    options: ['head', 'ear', 'egg'],
    answer: 0,
    concept: '身體部位單字認讀（head）',
    steps: [
      '圖片右上方的粗黑箭頭直接指向小男孩的「頭部（head）」。',
      '三個選項分別為 (1) head（頭）、(2) ear（耳朵）、(3) egg（蛋）。',
      '正確答案是 (1) head，選 (1)。',
    ],
  },
  {
    num: 14,
    options: ['box', 'bed', 'bus'],
    answer: 2,
    concept: '交通工具名詞認讀（bus）',
    steps: [
      '圖片畫的是一輛公共汽車（bus）。',
      '三個選項分別為 (1) box（箱子）、(2) bed（床）、(3) bus（公車）。',
      '正確選項是 (3) bus，選 (3)。',
    ],
  },
  {
    num: 15,
    options: ['boy', 'bag', 'shoe'],
    answer: 1,
    concept: '生活物品單字認讀（bag）',
    steps: [
      '圖片畫的是一個手提袋（bag）。',
      '三個選項分別為 (1) boy（男孩）、(2) bag（袋子）、(3) shoe（鞋子）。',
      '正確單字是 (2) bag，選 (2)。',
    ],
  },
  {
    num: 16,
    options: ['zoo', 'home', 'school'],
    answer: 1,
    concept: '場所名詞認讀（home）',
    steps: [
      '圖片中一家人溫馨地待在房子裡，代表「家（home）」。',
      '三個選項分別為 (1) zoo（動物園）、(2) home（家）、(3) school（學校）。',
      '正確單字為 (2) home，選 (2)。',
    ],
  },
  {
    num: 17,
    options: ['a long skirt', 'a short skirt', 'a long T-shirt'],
    answer: 0,
    concept: '服飾與長短形容詞片語（a long skirt）',
    steps: [
      '注意右下方的粗黑箭頭指向女孩穿著、長及腳踝的「長裙（a long skirt）」。',
      '三個選項分別為 (1) a long skirt（一件長裙）、(2) a short skirt（一件短裙）、(3) a long T-shirt（一件長 T 恤）。',
      '符合箭頭所指服飾的是 (1) a long skirt，選 (1)。',
    ],
  },
];

const READING_DIALOGUE_SPECS = [
  {
    num: 18,
    stem: 'A: What are you doing?\nB: _____________________',
    options: ["I'm a teacher.", "I'm in the bathroom.", "I'm singing in the bathroom."],
    answer: 2,
    hasFigure: false,
    concept: '現在進行式問答配合（What are you doing?）',
    steps: [
      '問句 "What are you doing?" 詢問「你正在做什麼動作？」，需要使用現在進行式（be 動詞加 V-ing）回答正在做的動作。',
      '(1)「我是老師」答職業；(2)「我在浴室裡」只答地點；只有 (3) "I\'m singing in the bathroom."（我正在浴室裡唱歌）回答了正在進行的動作。',
      '因此選 (3)。',
    ],
  },
  {
    num: 19,
    stem: 'A: Where are you going?\nB: _____________________',
    options: ["I'm going to the bookstore.", "I'm reading English books.", 'I have three books.'],
    answer: 0,
    hasFigure: false,
    concept: '去向問句回應（Where are you going?）',
    steps: [
      '問句 "Where are you going?" 詢問「你要去哪裡？」，強調前往的目的地（going to ...）。',
      '(1) "I\'m going to the bookstore."（我要去書店）明確回答目的地；(2) 答正在讀英文書；(3) 答擁有三本書。',
      '所以選 (1)。',
    ],
  },
  {
    num: 20,
    stem: 'A: Where is my car?\nB: _____________________',
    options: ['I like cars.', 'I have a car.', "It's in the box."],
    answer: 2,
    hasFigure: false,
    concept: '物品位置問句回應（Where is my car?）',
    steps: [
      '問句 "Where is my car?" 詢問「我的車子在哪裡？」，回答必須指出物品所在位置。',
      '(1) 答我喜歡車子；(2) 答我有一台車；(3) "It\'s in the box."（它在箱子裡）清楚回答了位置。',
      '正確回應是 (3)。',
    ],
  },
  {
    num: 21,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      'I have a small nose.',
      'I have a big mouth.',
      'I have three eyes.',
    ],
    answer: 2,
    hasFigure: true,
    concept: '看圖辨識複數與身體特徵句（three eyes）',
    steps: [
      '仔細觀察圖片中的小怪獸外觀：牠有「三隻眼睛（three eyes）」、一個大鼻子和一張小嘴巴。',
      '(1) 說小鼻子（錯，是大鼻子）；(2) 說大嘴巴（錯，是小嘴巴）；只有 (3) "I have three eyes." 與圖片完全相符。',
      '故選 (3)。',
    ],
  },
  {
    num: 22,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      'He is swimming to Taiwan.',
      'He is going to Taiwan.',
      'He is in Taiwan.',
    ],
    answer: 1,
    hasFigure: true,
    concept: '移動方向與進行式句型核對（going to Taiwan）',
    steps: [
      '先看圖片：男孩正開著飛機，沿著虛線箭頭朝台灣飛去，代表「正在前往台灣（going to Taiwan）」。',
      '(1) 說游泳去台灣（swimming，與開飛機不符）；(3) 說已經在台灣裡面（in Taiwan，尚未抵達）；只有 (2) 正確。',
      '故選 (2)。',
    ],
  },
  {
    num: 23,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      "It's 1:30. Amy is eating rice.",
      "It's 2:15. Amy is riding a bike.",
      "It's 4:30. Amy is drawing.",
    ],
    answer: 2,
    hasFigure: true,
    concept: '作息時間表判讀與現在進行式（4:30 與 drawing）',
    steps: [
      '對照左圖 Amy 週一的時間表：1:00 到 2:00 吃漢堡喝牛奶；2:00 到 3:00 睡覺；3:00 到 4:00 騎腳踏車；4:00 到 5:00 畫畫（drawing）。',
      '核對選項：(1) 1:30 吃的是漢堡不是米飯（rice）；(2) 2:15 在睡覺不是騎車；(3) 4:30 介於 4:00 到 5:00 之間，Amy 正在畫畫，完全正確。',
      '故選 (3)。',
    ],
  },
  {
    num: 24,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      "I see a cat. It's watching TV.",
      "The cat is on the TV. It's sleeping.",
      "The dog is in the kitchen. It's watching TV.",
    ],
    answer: 1,
    hasFigure: true,
    concept: '看圖辨識位置介系詞與動物動作（on the TV 與 sleeping）',
    steps: [
      '觀察圖片：小狗坐在有沙發的客廳（不是廚房）看電視，而貓咪趴在電視機「上面（on the TV）」睡覺（冒出 zzz）。',
      '(1) 說貓在看電視（錯，貓在睡覺）；(3) 說狗在廚房裡（錯，是在客廳）；(2) "The cat is on the TV. It\'s sleeping." 完全符合畫面細節。',
      '故選 (2)。',
    ],
  },
  {
    num: 25,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      "I'm in the park. It's hot.",
      "It's warm. I want a dress.",
      "I'm in the park. I want a jacket.",
    ],
    answer: 2,
    hasFigure: true,
    concept: '綜合觀察場所、天氣與衣物需求（in the park 與 want a jacket）',
    steps: [
      '觀察左圖：女孩在寒風吹拂的公園樹下冷得直發抖，頭上的思考泡泡裡是一件保暖夾克外套（jacket）。',
      '逐一核對選項：(1) 說天氣很熱（錯）；(2) 說溫暖想要洋裝（錯）；(3) "I\'m in the park. I want a jacket."（我在公園裡，我想要一件外套）完全正確。',
      '因此選 (3)。',
    ],
  },
];

export const PRIORI_112_ENGLISH_G6_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-112-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/112/eng-g6/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/112/eng-g6/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽辨語音，請點擊官方聽力音檔按鈕聆聽三遍發音，再選出最適當的拼字選項。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${idx + 1}，${opt.replace(/-/g, ' ')}`),
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
      id: `priori-112-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/112/eng-g6/q${qStr}.webp`,
      figureImage: `/assets/priori/112/eng-g6/q${qStr}_fig.webp`,
      questionText: `第一部分：聽辨${item.num <= 6 ? '單字' : '常用語或句子'}（第 ${item.num} 題）\n請先點擊官方聽力音檔播放 3 遍，再依圖片選出正確的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: [1, 0, 1, 0, 2, 1, 0][item.num - 4],
      media: {
        audioSrc: `/audio/priori/112/eng-g6/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽力測驗，請先點擊官方聽力音檔按鈕，再選出與音檔內容最相符的圖片編號。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: item.num <= 6 ? 'Ab-III-2' : 'Ac-III-3',
      prioriCode: item.num <= 6 ? 'ENG-V-6-1' : 'ENG-L-6-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-112-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/112/eng-g6/q${qStr}.webp`,
      figureImage: `/assets/priori/112/eng-g6/q${qStr}_fig.webp`,
      questionText: `第二部分：辨識單字（第 ${item.num} 題）\n請看左邊圖片，選出最符合圖片或箭頭所指意義的英語選項。`,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: null,
        audioSourceType: null,
      },
      ttsText: `第 ${item.num} 題辨識單字，請看圖片，選出最符合圖片內容的英語選項。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${idx + 1}，${opt.replace(/-/g, ' ')}`),
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
      id: `priori-112-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/112/eng-g6/q${qStr}.webp`,
      figureImage: item.hasFigure ? `/assets/priori/112/eng-g6/q${qStr}_fig.webp` : null,
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
      optionTtsTexts: item.options.map((opt, idx) => `選項${idx + 1}，${opt.replace(/-/g, ' ')}`),
      conceptTitle: item.concept,
      curriculumCode: 'Ac-III-3',
      prioriCode: 'ENG-R-6-2',
      explanationSteps: item.steps,
    };
  }),
];
