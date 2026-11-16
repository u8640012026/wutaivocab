export const PRIORI_112_ENGLISH_G5_META = {
  paperId: '112-english-g5',
  examSeries: 'priori',
  year: 112,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 5,
  gradeLabel: '五年級',
  title: '112 年篩選測驗 五年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字讀寫 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「112 年篩選測驗英語科 5 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '112-english-g5',
  examSeries: 'priori',
  year: 112,
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
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的複合子音填入 __een。',
    options: ['th', 'ch', 'sh'],
    answer: 2,
    concept: '複合子音字首辨音（th 與 ch 與 sh）',
    steps: [
      '專注聽最開頭的複合子音：th 是咬舌音、ch 是短促塞擦音、sh 是柔和的捲舌擦音。',
      '音檔三次都念出 "sheen"，開頭為持續柔和的 sh 音。',
      '對應複合子音 (3) sh，所以選 (3)。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的子音組合填入 __ob。',
    options: ['r', 'br', 'bl'],
    answer: 2,
    concept: 'L 混音與 R 混音辨別（r 與 br 與 bl）',
    steps: [
      '仔細聽字首是否有雙唇音 b，以及後接的子音是捲舌音 r 還是舌邊音 l。',
      '音檔清楚念出 "blob"，字首為雙唇音 b 加上舌尖頂上齒齦的 l。',
      '對應 (3) bl，所以選 (3)。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的雙子音起首拼字填入 __ut。',
    options: ['sk', 'st', 'sh'],
    answer: 1,
    concept: '複合子音字首辨音（sk 與 st 與 sh）',
    steps: [
      '區分三個選項：sk 是 s 後接舌根音 k、st 是 s 後接舌尖音 t、sh 是單一擦音。',
      '音檔三次都是 "stut"，可清楚聽到 s 後方緊接舌尖塞音 t。',
      '所以選 (2) st。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    concept: '聽辨家庭成員稱謂單字（sister）',
    steps: [
      '觀察三張家庭圖中箭頭所指的人物：圖 (1) 指著爸爸（father）、圖 (2) 指著媽媽（mother）、圖 (3) 指著姊妹（sister）。',
      '官方音檔念出 "sister"（姊姊或妹妹）。',
      '對應箭頭指向女孩的圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 5,
    concept: '聽辨身心狀態與情緒形容詞（tired）',
    steps: [
      '比較三隻小狗的狀態：圖 (1) 趴在地上流汗喘氣，看起來非常疲累（tired）；圖 (2) 微笑坐著很開心（happy）；圖 (3) 齜牙咧嘴生氣（angry）。',
      '官方音檔念出 "tired"（疲累的）。',
      '對應圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 6,
    concept: '聽辨天氣與體感形容詞（warm）',
    steps: [
      '觀察圖片：圖 (1) 下雪結冰直打哆嗦（cold）；圖 (2) 在營火旁覺得溫暖舒適（warm）；圖 (3) 烈日下滿頭大汗（hot）。',
      '官方音檔念出 "warm"（溫暖的）。',
      '最符合溫暖感覺的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 7,
    concept: '聽辨日常會話與教室互動用語',
    steps: [
      '先播放官方聽力音檔，聽辨對話或日常用語的情境。',
      '比較三張圖片：圖 (1) 指著手錶詢問時間；圖 (2) 教室裡男女同學面對面交談互動；圖 (3) 公車或捷運車廂內讓座。',
      '對照官方標準答案，符合音檔情境的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 8,
    concept: '聽辨年齡、時間與價格句型（nine years old）',
    steps: [
      '三張圖都與數字 9 有關，但代表不同意義：圖 (1) 是插有 9 根蠟燭的生日蛋糕（代表 9 歲）；圖 (2) 是 9 點整的時鐘；圖 (3) 是標價 9 元的鉛筆。',
      '播放官方聽力音檔，句子描述的是年齡（nine years old）。',
      '對應生日蛋糕的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 9,
    concept: '聽辨數量與食物名詞（three fish）',
    steps: [
      '仔細看三張圖的物品與數量：圖 (1) 是三個空盤子；圖 (2) 是盤子裡有兩條魚；圖 (3) 是盤子裡有三條魚（three fish）。',
      '播放官方聽力音檔，聽辨句子中的數量與食物為三條魚。',
      '對應圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 10,
    concept: '聽辨天氣與室內活動雙條件句（rainy 與 read）',
    steps: [
      '比較三張圖的「窗外天氣」與「室內動作」：圖 (1) 窗外下雨、室內看書；圖 (2) 窗外刮風、室內看書；圖 (3) 窗外下雨、室內拿筆畫畫。',
      '聆聽官方音檔，確認天氣是下雨（rainy）且人物動作是閱讀（read）。',
      '兩項條件都符合的是圖片 (1)，選 (1)。',
    ],
  },
];

const READING_WORD_SPECS = [
  {
    num: 11,
    options: ['tiger', 'mother', 'brother'],
    answer: 1,
    concept: '家庭成員單字認讀（mother）',
    steps: [
      '觀察左圖：沙發上坐著一家人，粗黑箭頭指向抱著孩子的媽媽。',
      '三個選項分別為 (1) tiger（老虎）、(2) mother（母親、媽媽）、(3) brother（兄弟）。',
      '正確單字為 (2) mother，選 (2)。',
    ],
  },
  {
    num: 12,
    options: ['tea', 'two', 'three'],
    answer: 1,
    concept: '數字單字認讀（two）',
    steps: [
      '左邊圖片是明顯的數字「2」。',
      '三個選項分別為 (1) tea（茶）、(2) two（二）、(3) three（三）。',
      '對應數字 2 的英文單字是 (2) two，選 (2)。',
    ],
  },
  {
    num: 13,
    options: ['red', 'tired', 'read'],
    answer: 2,
    concept: '日常動作動詞認讀（read）',
    steps: [
      '圖中女孩坐在桌前雙手捧著書本正在閱讀。',
      '三個選項分別為 (1) red（紅色的）、(2) tired（疲累的）、(3) read（閱讀）。',
      '正確動詞為 (3) read，選 (3)。',
    ],
  },
  {
    num: 14,
    options: ['write', 'what', 'white'],
    answer: 0,
    concept: '日常動作動詞認讀（write）',
    steps: [
      '圖中男孩手握鉛筆正在本子上寫字。',
      '三個選項拼字相近：(1) write（寫字）、(2) what（什麼）、(3) white（白色）。',
      '符合「寫字」動作的單字是 (1) write，選 (1)。',
    ],
  },
  {
    num: 15,
    options: ['sad', 'tall', 'happy'],
    answer: 0,
    concept: '情緒形容詞認讀（sad）',
    steps: [
      '圖中男孩看到針筒害怕落淚，表情非常傷心難過。',
      '三個選項分別為 (1) sad（傷心的、難過的）、(2) tall（高的）、(3) happy（開心的）。',
      '最符合圖片表情的是 (1) sad，選 (1)。',
    ],
  },
  {
    num: 16,
    options: ['rice', 'juice', 'ruler'],
    answer: 0,
    concept: '食物單字認讀（rice）',
    steps: [
      '左邊圖片是一碗盛滿的白米飯。',
      '三個選項分別為 (1) rice（米飯）、(2) juice（果汁）、(3) ruler（尺）。',
      '正確單字為 (1) rice，選 (1)。',
    ],
  },
  {
    num: 17,
    options: ['cold', 'short', 'sunny'],
    answer: 2,
    concept: '天氣形容詞認讀（sunny）',
    steps: [
      '左邊圖片是一顆帶著笑臉、光芒四射的大太陽，代表天氣晴朗。',
      '三個選項分別為 (1) cold（寒冷的）、(2) short（短的、矮的）、(3) sunny（晴朗的）。',
      '正確單字為 (3) sunny，選 (3)。',
    ],
  },
];

const READING_SENTENCE_SPECS = [
  {
    num: 18,
    stem: "A: What time is it?\nB: Five o'clock.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 1,
    hasFigure: true,
    concept: '整點時間問答辨識（Five o\'clock.）',
    steps: [
      '對話問「現在幾點？（What time is it?）」，回答「五點整（Five o\'clock.）」。',
      '比較三張圖：圖 (1) 時針指 12、分針指 5（是 12 點 25 分，指針看反了）；圖 (2) 電子鐘清楚顯示 5:00（五點整）；圖 (3) 是插著數字 5 蠟燭的生日蛋糕（代表年齡）。',
      '因此正確選項為圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 19,
    stem: 'A: What do you want?\nB: Two hot tea.',
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 2,
    hasFigure: true,
    concept: '點餐飲品與冷熱特徵辨識（hot tea）',
    steps: [
      '對話詢問想要什麼，回答需要兩杯「熱茶（hot tea）」。',
      '觀察三張圖片：圖 (1) 是有冰塊與吸管的冰飲；圖 (2) 是兩盒牛奶；圖 (3) 是兩杯冒著熱氣的熱茶。',
      '符合「熱茶」的是圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 20,
    stem: "A: How's the weather?\nB: It's cool.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 2,
    hasFigure: true,
    concept: '天氣問答與體感溫度辨識（It\'s cool.）',
    steps: [
      '對話問「天氣如何？（How\'s the weather?）」，回答「很涼爽（It\'s cool.）」。',
      '比較三張圖片：圖 (1) 裹著厚被子發抖代表寒冷（cold）；圖 (2) 滿頭大汗吹電扇代表炎熱（hot）；圖 (3) 微風吹拂落葉、神情舒爽代表涼爽（cool）。',
      '因此選圖片 (3)。',
    ],
  },
  {
    num: 21,
    stem: 'My brother is ten years old. He is thin.',
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 0,
    hasFigure: true,
    concept: '家人性別、年齡與外型特徵辨識（brother 與 ten 與 thin）',
    steps: [
      '題幹有三個線索：「brother 與 He（男生）」、「ten years old（10 歲）」以及「thin（瘦的）」。',
      '比較三張圖片：三人衣服上都有數字 10，但圖 (3) 是女生；圖 (2) 男孩體型較圓胖；只有圖 (1) 是體型瘦長的 10 歲男孩。',
      '完全符合條件的是圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 22,
    stem: "Boy: Can you swim?\nGirl: No, I can't. Can you swim?\nBoy: Yes.",
    options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
    answer: 1,
    hasFigure: true,
    concept: '能力問答對話與角色核對（Boy can swim, Girl can\'t swim）',
    steps: [
      '從對話可知：女生不會游泳（Girl: No, I can\'t.），而男生會游泳（Boy: Yes.）。',
      '核對三張圖：圖 (1) 男生女生都開心游泳；圖 (2) 男生開心游泳，女生套著泳圈害怕流淚（不會游）；圖 (3) 反過來是男生害怕不會游。',
      '符合「男生會游、女生不會游」的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 23,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      "It's four o'clock. It's rainy.",
      "It's six o'clock. It's sunny.",
      "It's eight o'clock. It's rainy.",
    ],
    answer: 2,
    hasFigure: true,
    concept: '看圖表判讀時間與對應天氣（eight o\'clock 與 rainy）',
    steps: [
      '查看左方時間與天氣圖表：4:00 與 5:00 是晴天（sunny），6:00 是陰天（cloudy），7:00 與 8:00 是雨天（rainy）。',
      '逐一核對選項：(1) 四點是晴天而非雨天；(2) 六點是陰天而非晴天；(3) 八點是雨天（It\'s eight o\'clock. It\'s rainy.）完全正確。',
      '故選 (3)。',
    ],
  },
  {
    num: 24,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      'I see two rabbits. The rabbits are white.',
      "I like the black rabbit. It's happy.",
      "I like the white rabbit. It's thin.",
    ],
    answer: 1,
    hasFigure: true,
    concept: '看圖核對顏色、外型與情緒特徵（black rabbit 與 happy）',
    steps: [
      '觀察左圖的兩隻兔子：左邊的白兔圓潤且表情難過（sad）；右邊的黑兔高瘦且面帶微笑（happy）。',
      '核對選項：(1) 說兩隻兔子都是白色（錯，一白一黑）；(3) 說白兔很瘦（錯，白兔圓胖）；(2) 說黑兔很開心（It\'s happy.）完全符合圖片。',
      '故選 (2)。',
    ],
  },
  {
    num: 25,
    stem: '請看左邊圖片，選出最符合圖片內容的英語描述：',
    options: [
      "John can dance. He can't sing.",
      "Ann can sing. She can't dance.",
      "Bob can dance. He can't sing.",
    ],
    answer: 0,
    hasFigure: true,
    concept: '表格判讀能力助動詞肯定與否定（can 與 can\'t）',
    steps: [
      '先看表格上方圖示：左欄拿麥克風代表「唱歌（sing）」，右欄擺舞姿代表「跳舞（dance）」。',
      '核對三人紀錄：John 不會唱歌（叉）、會跳舞（勾）；Ann 兩樣都不會；Bob 會唱歌（勾）、不會跳舞（叉）。',
      '選項 (1) "John can dance. He can\'t sing."（John 會跳舞、不會唱歌）與表格完全吻合，選 (1)。',
    ],
  },
];

export const PRIORI_112_ENGLISH_G5_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-112-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/112/eng-g5/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/112/eng-g5/q${qStr}.mp3`,
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
      id: `priori-112-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/112/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/112/eng-g5/q${qStr}_fig.webp`,
      questionText: `第一部分：聽辨${item.num <= 6 ? '單字' : '常用語或句子'}（第 ${item.num} 題）\n請先點擊官方聽力音檔播放 3 遍，再依圖片選出正確的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: [2, 0, 1, 1, 0, 2, 0][item.num - 4],
      media: {
        audioSrc: `/audio/priori/112/eng-g5/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽力測驗，請先點擊官方聽力音檔按鈕，再選出與音檔內容最相符的圖片編號。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: item.num <= 6 ? 'Ab-III-2' : 'Ac-III-3',
      prioriCode: item.num <= 6 ? 'ENG-V-5-1' : 'ENG-L-5-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-112-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/112/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/112/eng-g5/q${qStr}_fig.webp`,
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
      id: `priori-112-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/112/eng-g5/q${qStr}.webp`,
      figureImage: item.hasFigure ? `/assets/priori/112/eng-g5/q${qStr}_fig.webp` : null,
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
