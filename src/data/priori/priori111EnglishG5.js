export const PRIORI_111_ENGLISH_G5_META = {
  paperId: '111-english-g5',
  examSeries: 'priori',
  year: 111,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 5,
  gradeLabel: '五年級',
  title: '111 年篩選測驗 五年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字讀寫 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「111 年篩選測驗英語科 5 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '111-english-g5',
  examSeries: 'priori',
  year: 111,
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
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字首拼字填入 __ill。',
    ttsPrompt: '第 1 題聽辨語音，請播放官方聽力音檔，選出正確的字首子音填入 i l l 前面。',
    options: ['s', 'ch', 'sh'],
    optionTts: ['選項一，s', '選項二，c h', '選項三，s h'],
    answer: 1,
    concept: '複合子音與單子音辨識（s 與 ch 與 sh）',
    steps: [
      '區分開頭音素：s 是單純平舌摩擦音，ch 是短促有力的塞擦音 /tʃ/（chill），sh 是持續氣流摩擦音 /ʃ/。',
      '播放官方聽力音檔，聽到開頭清楚有力的塞擦音 ch，拼出 chill。',
      '對應選項 (2) ch，選 (2)。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字首子音填入 __ef。',
    ttsPrompt: '第 2 題聽辨語音，請播放官方聽力音檔，選出正確的字首子音填入 e f 前面。',
    options: ['th', 'sh', 'd'],
    optionTts: ['選項一，t h', '選項二，s h', '選項三，d'],
    answer: 0,
    concept: '字首複合子音辨識（th 與 sh 與 d）',
    steps: [
      '專注比較三種開頭音：th 是舌尖輕頂上門牙送氣音，sh 是舌面捲起摩擦音，d 是濁塞音。',
      '播放官方聽力音檔，聽辨發音起始位置是否在上下門牙間發出 th 音。',
      '對應選項 (1) th，選 (1)。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的複合子音填入 __eet。',
    ttsPrompt: '第 3 題聽辨語音，請播放官方聽力音檔，選出正確的字首子音填入 e e t 前面。',
    options: ['br', 'bl', 'b'],
    optionTts: ['選項一，b r', '選項二，b l', '選項三，b'],
    answer: 1,
    concept: '字首子音連綴辨識（br 與 bl 與 b）',
    steps: [
      '比較三個字首發音：br 帶捲舌 r 音，bl 帶舌尖彈頂上顎邊音 l，b 後面直接接長音 ee（無 l 或 r 音）。',
      '播放官方聽力音檔，留意 b 後面是否緊接清晰的邊音 l，成為 bleet。',
      '對應選項 (2) bl，選 (2)。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    ans: 1,
    concept: '聽辨食物單字（pizza）',
    steps: [
      '觀察三張圖的食物：圖 (1) 是漢堡（hamburger）、圖 (2) 是一片比薩（pizza）、圖 (3) 是圓形格子餡餅派（pie）。',
      '播放官方聽力音檔，聽辨念出的食物單字（pizza）。',
      '對應比薩圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 5,
    ans: 0,
    concept: '聽辨天氣單字（sunny）',
    steps: [
      '觀察三張天氣圖示：圖 (1) 是大太陽（sunny）、圖 (2) 是雲朵下雪（snowy）、圖 (3) 是多片灰雲（cloudy）。',
      '播放官方聽力音檔，確認描述的天氣狀況。',
      '對應太陽圖示的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 6,
    ans: 2,
    concept: '聽辨體型形容詞比較（small）',
    steps: [
      '觀察三張圖片箭頭所指的狗：圖 (1) 指著胖胖的黑狗、圖 (2) 指著大型白狗（big）、圖 (3) 指著嬌小的小白狗（small）。',
      '播放官方聽力音檔，聽辨題目描述的是哪一隻小狗。',
      '對應指著小狗的圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 7,
    ans: 2,
    concept: '聽辨日常對話與致歉/時間情境',
    steps: [
      '觀察三張人物互動圖：圖 (1) 男孩幫跌倒受傷的同伴擦藥；圖 (2) 兩人笑著擊掌慶祝；圖 (3) 時鐘指著九點半，男孩怒指對方、對方流汗合掌彎腰道歉。',
      '播放官方聽力音檔，確認對話是受傷關心、擊掌鼓勵還是遲到致歉。',
      '依官方標準答案，對應情境為圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 8,
    ans: 1,
    concept: '聽辨複數與動植物觀察句子（I see a bird.）',
    steps: [
      '觀察三張圖中女孩拿望遠鏡看到的景象：圖 (1) 樹幹上的無尾熊（koala）；圖 (2) 一隻正在飛翔的小鳥（one bird）；圖 (3) 兩隻站在樹枝上的鳥（two birds）。',
      '播放官方聽力音檔，分辨單數「一隻鳥（a bird）」還是複數「兩隻鳥（birds）」。',
      '對應單數小鳥的圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 9,
    ans: 0,
    concept: '聽辨數字 5 的三種不同生活用法（年齡 vs. 數量 vs. 價錢）',
    steps: [
      '注意三張圖片都出現數字「5」：圖 (1) 女孩對插著 5 號蠟燭的生日蛋糕許願（年齡 five years old）；圖 (2) 指著蘋果樹數出 5 顆蘋果（five apples）；圖 (3) 指著標價 5 元的蘋果（five dollars）。',
      '播放官方聽力音檔，分辨究竟談的是歲數、個數還是價錢。',
      '對應圖片 (1) 慶生 5 歲情境，選 (1)。',
    ],
  },
  {
    num: 10,
    ans: 2,
    concept: '聽辨性別代名詞與動作（He can dance. / She vs. He）',
    steps: [
      '觀察三張圖片箭頭指的對象：圖 (1) 指著正在跳舞的女生（She）；圖 (2) 指著頭暈跌坐在地上的男生；圖 (3) 指著正在開心跳舞的男生（He）。',
      '播放官方聽力音檔，專注聽句子開頭的代名詞是男他（He）還是女她（She），以及動作是跳舞還是難過。',
      '對應指著跳舞男生的圖片 (3)，選 (3)。',
    ],
  },
];

const READING_WORD_SPECS = [
  {
    num: 11,
    options: ['girl', 'sister', 'father'],
    answer: 2,
    concept: '家庭稱謂單字認讀（father）',
    steps: [
      '觀察左邊圖片顯示為男性家長（father 爸爸）。',
      '選項分別為 (1) girl（女孩）、(2) sister（姊妹）、(3) father（爸爸）。',
      '選 (3)。',
    ],
  },
  {
    num: 12,
    options: ['eleven', 'seven', 'five'],
    answer: 1,
    concept: '數字單字認讀（seven）',
    steps: [
      '觀察左邊圖片表示數字 7（seven）。',
      '選項依序為 (1) eleven (11)、(2) seven (7)、(3) five (5)。',
      '選 (2)。',
    ],
  },
  {
    num: 13,
    options: ['swim', 'write', 'sing'],
    answer: 0,
    concept: '動作動詞單字認讀（swim）',
    steps: [
      '左邊圖片顯示游泳的動作（swim）。',
      '選項依序為 (1) swim（游泳）、(2) write（寫）、(3) sing（唱歌）。',
      '選 (1)。',
    ],
  },
  {
    num: 14,
    options: ['tired', 'cold', 'happy'],
    answer: 2,
    concept: '情緒感受形容詞認讀（happy）',
    steps: [
      '左邊圖片顯示人物開心的笑臉（happy）。',
      '選項依序為 (1) tired（疲累的）、(2) cold（寒冷的）、(3) happy（開心的）。',
      '選 (3)。',
    ],
  },
  {
    num: 15,
    options: ['six', 'rice', 'juice'],
    answer: 2,
    concept: '飲食飲料單字認讀（juice）',
    steps: [
      '左邊圖片是一杯果汁（juice）。',
      '選項依序為 (1) six（六）、(2) rice（米飯）、(3) juice（果汁）。',
      '選 (3)。',
    ],
  },
  {
    num: 16,
    options: ['warm', 'rainy', 'cool'],
    answer: 0,
    concept: '天氣與溫度形容詞認讀（warm）',
    steps: [
      '左邊圖片表達溫暖舒適的氣候（warm）。',
      '選項依序為 (1) warm（溫暖的）、(2) rainy（下雨的）、(3) cool（涼爽的）。',
      '選 (1)。',
    ],
  },
  {
    num: 17,
    options: ['short', 'three', 'tall'],
    answer: 2,
    concept: '外貌特徵形容詞認讀（tall）',
    steps: [
      '左邊圖片展示「高大的」（tall）對比提示。',
      '選項依序為 (1) short（矮／短的）、(2) three（三）、(3) tall（高的）。',
      '選 (3)。',
    ],
  },
];

const READING_S2P_SPECS = [
  {
    num: 18,
    stem: "It's four o'clock.",
    ttsPrompt: '第 18 題，讀一讀句子：It is four o clock. 請選出符合這個時間的圖片。',
    answer: 1,
    concept: '整點時間英文句認讀（four o’clock）',
    steps: [
      '「It’s four o’clock.」意思是「現在是四點整」。',
      '從三個鐘面找出短針（時針）指在 4、長針（分針）指在 12 的圖示，即圖片 (2)。',
      '選 (2)。',
    ],
  },
  {
    num: 19,
    stem: 'She is tired.',
    ttsPrompt: '第 19 題，讀一讀句子：She is tired. 請選出符合這句話的圖片。',
    answer: 2,
    concept: '人稱代名詞與感受狀態認讀（She is tired.）',
    steps: [
      '注意主詞是女性「She（她）」，狀態形容詞是「tired（累的）」。',
      '觀察三張圖片，找出女生露出疲憊想睡神情的圖示，即圖片 (3)。',
      '選 (3)。',
    ],
  },
  {
    num: 20,
    stem: 'I want three pies.',
    ttsPrompt: '第 20 題，讀一讀句子：I want three pies. 請選出符合這句話的圖片。',
    answer: 0,
    concept: '飲食與複數名詞認讀（three pies）',
    steps: [
      '關鍵資訊有兩個：數量是「three（三個）」，食物是「pies（餡餅派）」。',
      '比對三張圖片的數量與食物種類，符合「三個派」的是圖片 (1)。',
      '選 (1)。',
    ],
  },
  {
    num: 21,
    stem: 'She is my mother. She can sing.',
    ttsPrompt: '第 21 題，讀一讀句子：She is my mother. She can sing. 請選出符合這段話的圖片。',
    answer: 0,
    concept: '稱謂與能力助動詞認讀（mother, can sing）',
    steps: [
      '「She is my mother.」指人物是媽媽（女性成年人）；「She can sing.」表示動作是唱歌。',
      '找出媽媽拿著麥克風或張口唱歌的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 22,
    stem: 'He is Jack. He can write.',
    ttsPrompt: '第 22 題，讀一讀句子：He is Jack. He can write. 請選出符合這段話的圖片。',
    answer: 1,
    concept: '性別代名詞與能力動作認讀（He can write.）',
    steps: [
      '「He」是男生，「can write」表示會寫字（不是畫圖或跑步）。',
      '觀察三張圖片，男生正在寫字的是圖片 (2)，選 (2)。',
    ],
  },
];

const READING_P2S_SPECS = [
  {
    num: 23,
    options: ['He is my brother.', 'She is my mother.', 'He is ten years old.'],
    optionTts: [
      '選項一，He is my brother.',
      '選項二，She is my mother.',
      '選項三，He is ten years old.',
    ],
    answer: 0,
    concept: '看圖辨識人物介紹句（He is my brother.）',
    steps: [
      '比較三個選項：(1) 他是我的哥哥／弟弟；(2) 她是我的媽媽；(3) 他十歲。',
      '左圖描繪手指向自己的兄弟人物，不帶年齡數字提示，對應 (1) He is my brother.',
      '選 (1)。',
    ],
  },
  {
    num: 24,
    options: ['I want cold tea.', 'I want hot milk.', 'I want cold milk.'],
    optionTts: ['選項一，I want cold tea.', '選項二，I want hot milk.', '選項三，I want cold milk.'],
    answer: 2,
    concept: '看圖辨識冷熱飲品需求（cold milk）',
    steps: [
      '觀察左邊圖片：是裝在盒／杯中有冰塊或冰冷標示的「冰牛奶」，並非茶（tea）或熱飲（hot）。',
      '英文為「I want cold milk.（我想要冰牛奶）」，選 (3)。',
    ],
  },
  {
    num: 25,
    options: [
      'My sister is short. She is happy.',
      'My brother is tall. He is happy.',
      'My sister is short. She is sad.',
    ],
    optionTts: [
      '選項一，My sister is short. She is happy.',
      '選項二，My brother is tall. He is happy.',
      '選項三，My sister is short. She is sad.',
    ],
    answer: 0,
    concept: '看圖辨識角色性別、高矮與心情綜合敘述',
    steps: [
      '檢查三個要點：角色性別（sister vs. brother）、身材（short 矮 vs. tall 高）、表情（happy 開心 vs. sad 難過）。',
      '圖片畫著矮小卻面露微笑的姊妹女生，對應 (1) My sister is short. She is happy.',
      '選 (1)。',
    ],
  },
];

export const PRIORI_111_ENGLISH_G5_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-111-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g5/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/111/eng-g5/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: item.ttsPrompt,
      optionTtsTexts: item.optionTts,
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
      id: `priori-111-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/111/eng-g5/q${qStr}_fig.webp`,
      questionText: `第一部分（二）聽辨圖意（第 ${item.num} 題）\n請先播放官方聽力音檔（共 3 遍），再依左邊圖片選出最適合的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/111/eng-g5/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題，聽力看圖題。請先點擊官方聽力音檔，再從一、二、三號圖片中選出正確答案。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: 'Ac-III-3',
      prioriCode: 'ENG-L-5-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-111-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/111/eng-g5/q${qStr}_fig.webp`,
      questionText: `第二部分（一）看圖認字（第 ${item.num} 題）\n請觀察左邊圖片，選出最符合圖意的英語單字：`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題，看圖選單字。請對照左邊圖片，選出最符合圖意的英語單字。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'Ab-III-2',
      prioriCode: 'ENG-R-5-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_S2P_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-111-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/111/eng-g5/q${qStr}_fig.webp`,
      questionText: `第二部分（二）句子配對圖片（第 ${item.num} 題）\n請閱讀英文句子並選出最適合的圖片：\n${item.stem}`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: item.ttsPrompt,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: 'Ac-III-3',
      prioriCode: 'ENG-R-5-2',
      explanationSteps: item.steps,
    };
  }),

  ...READING_P2S_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-111-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/111/eng-g5/q${qStr}_fig.webp`,
      questionText: `第二部分（三）圖片配對句子（第 ${item.num} 題）\n請依照左邊圖片選出最適合的英語句子：`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題，看圖選句子。請依照左邊圖片選出最適合的句子。`,
      optionTtsTexts: item.optionTts,
      conceptTitle: item.concept,
      curriculumCode: 'Ac-III-3',
      prioriCode: 'ENG-R-5-2',
      explanationSteps: item.steps,
    };
  }),
];
