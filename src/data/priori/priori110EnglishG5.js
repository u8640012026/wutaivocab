export const PRIORI_110_ENGLISH_G5_META = {
  paperId: '110-english-g5',
  examSeries: 'priori',
  year: 110,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 5,
  gradeLabel: '五年級',
  title: '110 年篩選測驗 五年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字讀寫 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「110 年篩選測驗英語科 5 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '110-english-g5',
  examSeries: 'priori',
  year: 110,
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
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字首拼字填入 __um。',
    ttsPrompt: '第 1 題聽辨語音，請播放官方聽力音檔，選出正確的字首子音填入 u m 前面。',
    options: ['t', 'th', 'sh'],
    optionTts: ['選項一，字母 t', '選項二，t h', '選項三，s h'],
    answer: 1,
    concept: '複合子音與單子音辨識（t 與 th 與 sh）',
    steps: [
      '區分字首音素：t 是舌尖頂住上齒齦的無聲塞音 /t/；th 是舌尖輕放上下齒間吹氣的音 /θ/；sh 是雙唇微圓的摩擦音 /ʃ/。',
      '播放官方聽力音檔，聽出開頭為輕咬舌尖送氣的 /θ/ 音，拼出 thum。',
      '對應選項 (2) th，選 (2)。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字首拼字填入 __ot。',
    ttsPrompt: '第 2 題聽辨語音，請播放官方聽力音檔，選出正確的字首子音填入 o t 前面。',
    options: ['br', 'bl', 'b'],
    optionTts: ['選項一，b r', '選項二，b l', '選項三，字母 b'],
    answer: 0,
    concept: '複合子音連綴辨識（br 與 bl 與 b）',
    steps: [
      '區分字首連綴：br 在 /b/ 後帶有微捲舌的 /r/；bl 在 /b/ 後舌尖頂上齒齦發 /l/；b 則是單純雙唇濁塞音。',
      '播放官方聽力音檔，聽出雙唇 /b/ 緊接微捲舌 /r/ 的連音，拼出 brot。',
      '對應選項 (1) br，選 (1)。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字首拼字填入 __it。',
    ttsPrompt: '第 3 題聽辨語音，請播放官方聽力音檔，選出正確的字首子音填入 i t 前面。',
    options: ['sk', 'st', 'k'],
    optionTts: ['選項一，s k', '選項二，s t', '選項三，字母 k'],
    answer: 0,
    concept: '複合子音連綴辨識（sk 與 st 與 k）',
    steps: [
      '區分字首連綴：sk 先發出齒縫音 /s/ 再接舌根音 /k/；st 先發 /s/ 再接舌尖音 /t/；k 則只有單純的 /k/ 音。',
      '播放官方聽力音檔，聽出開頭清楚的 /s/ 接舌根音 /k/，拼出 skit。',
      '對應選項 (1) sk，選 (1)。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    ans: 2,
    concept: '聽辨數字單字（nine）',
    steps: [
      '觀察三張圖片顯示的數字：圖 (1) 是數字 6（six）；圖 (2) 是數字 5（five）；圖 (3) 是數字 9（nine）。',
      '播放官方聽力音檔，聽辨念出的英文數字。',
      '對應數字 9 的圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 5,
    ans: 1,
    concept: '聽辨餐飲單字（rice）',
    steps: [
      '觀察三張圖片的食物或飲料：圖 (1) 是附檸檬片與吸管的果汁（juice）；圖 (2) 是一碗白飯（rice）；圖 (3) 是一杯泡著茶包的熱茶（tea）。',
      '播放官方聽力音檔，聽辨念出的食物單字。',
      '對應一碗飯的圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 6,
    ans: 0,
    concept: '聽辨天氣與體感形容詞（cool）',
    steps: [
      '觀察三張圖中女孩的感受：圖 (1) 女孩對著電風扇吹風，露出涼爽開心的表情（cool）；圖 (2) 烈日當空，女孩流汗擦額頭（hot）；圖 (3) 雪花紛飛，女孩穿著大衣戴耳罩發抖（cold）。',
      '播放官方聽力音檔，聽辨描述天氣或體感的單字。',
      '對應感到涼爽的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 7,
    ans: 1,
    concept: '聽辨日常情緒與請求互動情境',
    steps: [
      '觀察三張圖中媽媽與小寶寶的互動：圖 (1) 寶寶開心地疊好積木、媽媽比出大拇指稱讚；圖 (2) 寶寶雙手交叉抱胸生氣皺眉、媽媽拿著一塊積木微笑安撫或詢問；圖 (3) 地上有摔破的碗，媽媽吃驚地看著寶寶。',
      '播放官方聽力音檔，聽辨對話與語氣所描述的情境。',
      '依官方標準答案，對應情境為圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 8,
    ans: 2,
    concept: '聽辨人物特徵與身高／年齡描述句',
    steps: [
      '觀察三張圖片箭頭所指的人物：圖 (1) 高個子女生站在男生旁，箭頭指向男生；圖 (2) 高個子女生站在小女孩旁，箭頭指向高個子女生；圖 (3) 高個子女生站在小女孩旁，箭頭指向矮個子的小女孩。',
      '播放官方聽力音檔，留意人稱代名詞（he / she）以及箭頭所指的特徵（tall 高／short 矮）。',
      '對應指向小女孩的圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 9,
    ans: 0,
    concept: '聽辨數字 10 的生活應用情境（年齡 ten years old）',
    steps: [
      '觀察三張圖片中的數字 10 代表什麼：圖 (1) 生日蛋糕上插著數字 10 的蠟燭（ten years old）；圖 (2) 寫著 $10 的價錢吊牌（ten dollars）；圖 (3) 顯示 10:00 的電子時鐘（ten o’clock）。',
      '播放官方聽力音檔，分辨說出的是年齡、價錢還是時間。',
      '對應 10 歲生日蛋糕的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 10,
    ans: 1,
    concept: '聽辨能力動詞與肯定否定句（He can swim.）',
    steps: [
      '觀察三張圖片男孩的動作：圖 (1) 拿著麥克風開心唱歌（sing）；圖 (2) 戴著蛙鏡在水中自在游泳（can swim）；圖 (3) 在水中緊張掙扎拍水（can’t swim）。',
      '播放官方聽力音檔，注意聽動作動詞（sing / swim）與肯定或否定（can / can’t）。',
      '對應會游泳的圖片 (2)，選 (2)。',
    ],
  },
];

const READING_WORD_SPECS = [
  {
    num: 11,
    options: ['father', 'marker', 'brother'],
    answer: 2,
    concept: '家庭成員稱謂單字認讀（brother）',
    steps: [
      '左圖畫著一名女孩趴著看旁邊正在爬行的小寶寶，箭頭指向小寶寶（弟弟／兄弟 brother）。',
      '選項依序為 (1) father（爸爸）、(2) marker（彩色筆）、(3) brother（兄弟）。',
      '選 (3)。',
    ],
  },
  {
    num: 12,
    options: ['ten', 'one', 'eleven'],
    answer: 1,
    concept: '數字單字認讀（one）',
    steps: [
      '左圖畫著大大的阿拉伯數字「1」（one）。',
      '選項依序為 (1) ten（10）、(2) one（1）、(3) eleven（11）。',
      '選 (2)。',
    ],
  },
  {
    num: 13,
    options: ['happy', 'tired', 'sad'],
    answer: 2,
    concept: '情緒形容詞認讀（sad）',
    steps: [
      '左圖畫著一個流眼淚、皺眉哭泣的難過表情（sad）。',
      '選項依序為 (1) happy（開心的）、(2) tired（疲累的）、(3) sad（難過的）。',
      '選 (3)。',
    ],
  },
  {
    num: 14,
    options: ['pie', 'cake', 'pizza'],
    answer: 2,
    concept: '食物單字認讀（pizza）',
    steps: [
      '左圖畫著一個切塊、放滿香菇與臘腸配料的披薩（pizza）。',
      '選項依序為 (1) pie（派）、(2) cake（蛋糕）、(3) pizza（披薩）。',
      '選 (3)。',
    ],
  },
  {
    num: 15,
    options: ['sunny', 'seven', 'short'],
    answer: 0,
    concept: '天氣形容詞認讀（sunny）',
    steps: [
      '左圖畫著大太陽高掛天空、草地開花的晴朗天氣（sunny）。',
      '選項依序為 (1) sunny（晴朗的）、(2) seven（7）、(3) short（矮的／短的）。',
      '選 (1)。',
    ],
  },
  {
    num: 16,
    options: ['tall', 'time', 'tired'],
    answer: 0,
    concept: '身高形容詞認讀（tall）',
    steps: [
      '左圖畫著一大一小兩個人站在一起，箭頭指向身材高大的那一位（tall）。',
      '選項依序為 (1) tall（高的）、(2) time（時間）、(3) tired（疲累的）。',
      '選 (1)。',
    ],
  },
  {
    num: 17,
    options: ['color', 'cold', 'read'],
    answer: 1,
    concept: '體感形容詞認讀（cold）',
    steps: [
      '左圖畫著男孩在蓮蓬頭沖水下牙齒打顫、抱胸發抖，表示很冷（cold）。',
      '選項依序為 (1) color（顏色）、(2) cold（寒冷的）、(3) read（閱讀）。',
      '選 (2)。',
    ],
  },
];

const READING_S2P_SPECS = [
  {
    num: 18,
    stem: 'He’s twelve years old.',
    ttsPrompt: '第 18 題，讀一讀句子：He is twelve years old. 請選出符合這句話的圖片。',
    answer: 1,
    concept: '人稱代名詞與年齡表達（He is twelve years old.）',
    steps: [
      '句子有兩個關鍵線索：(1) 主詞是男生「He」，(2) 年齡是 12 歲「twelve」。',
      '觀察三張圖片：圖 (1) 是綁雙馬尾的女生拿著 12 歲蛋糕；圖 (2) 是男生拿著插上數字「12」蠟燭的蛋糕；圖 (3) 是男生拿著數字「11」蠟燭的蛋糕。',
      '選 (2)。',
    ],
  },
  {
    num: 19,
    stem: 'A: What time is it?  B: It’s two o’clock.',
    ttsPrompt: '第 19 題，對話：What time is it? It is two o clock. 請選出符合這段對話的圖片。',
    answer: 2,
    concept: '整點時間問答（What time is it? It is two o’clock.）',
    steps: [
      '問句問「現在幾點了？」，回答是「It’s two o’clock.（現在兩點鐘）」。',
      '觀察三張圖片：圖 (1) 時鐘顯示 07:00；圖 (2) 是插著兩根蠟燭的蛋糕；圖 (3) 企鵝造型時鐘顯示 02:00（兩點整）。',
      '選 (3)。',
    ],
  },
  {
    num: 20,
    stem: 'A: How’s the weather?  B: It’s rainy.',
    ttsPrompt: '第 20 題，對話：How is the weather? It is rainy. 請選出符合這段對話的圖片。',
    answer: 0,
    concept: '天氣詢問與下雨天表達（How is the weather? It is rainy.）',
    steps: [
      '對話詢問「天氣如何？」，回答「It’s rainy.（是下雨天）」。',
      '觀察三張圖片：圖 (1) 手指向窗外烏雲密布、正下著雨的天空；圖 (2) 是水龍頭流出自來水（非天氣）；圖 (3) 手指向窗外晴朗有太陽的天空。',
      '選 (1)。',
    ],
  },
  {
    num: 21,
    stem: 'A: What do you want?  B: I want hot water.',
    ttsPrompt: '第 21 題，對話：What do you want? I want hot water. 請選出符合這段對話的圖片。',
    answer: 2,
    concept: '飲食需求問答（What do you want? I want hot water.）',
    steps: [
      '對話問「你想要什麼？」，回答「I want hot water.（我想要熱水）」。',
      '觀察三張圖片：圖 (1) 男孩開心伸手拿桌上的牛奶盒；圖 (2) 男孩雙手抱胸搖頭拒絕桌上的熱水；圖 (3) 男孩面帶微笑伸手拿冒著熱氣的一杯水。',
      '選 (3)。',
    ],
  },
  {
    num: 22,
    stem: 'A: Can she write?  B: No, she can’t. She can read.',
    ttsPrompt: '第 22 題，對話：Can she write? No, she cannot. She can read. 請選出符合這段對話的圖片。',
    answer: 0,
    concept: '能力助動詞否定與肯定句（can’t write, can read）',
    steps: [
      '對話表示她「不會寫字（can’t write），但她會閱讀（can read）」。',
      '觀察三張圖片：圖 (1) 女孩雙手正拿著「ABC」書本開心閱讀；圖 (2) 女孩把書拿反了，頭上冒出許多問號（不會閱讀）；圖 (3) 女孩趴在地上拿筆寫字（can write）。',
      '選 (1)。',
    ],
  },
];

const READING_P2S_SPECS = [
  {
    num: 23,
    options: [
      'The boy is seven years old.',
      'The girl can sing.',
      'It’s rainy.',
    ],
    optionTts: [
      '選項一，The boy is seven years old.',
      '選項二，The girl can sing.',
      '選項三，It is rainy.',
    ],
    answer: 1,
    concept: '看圖辨識能力句子（The girl can sing.）',
    steps: [
      '觀察左圖細節：天空掛著大太陽（不是 rainy），蛋糕上的蠟燭是數字「8」（男生不是 7 歲），而左邊的女孩張嘴唱歌、旁邊飄著音符（The girl can sing.）。',
      '唯一完全符合圖意的是 (2) The girl can sing.',
      '選 (2)。',
    ],
  },
  {
    num: 24,
    options: [
      'I see three rabbits.',
      'The black rabbit is big.',
      'The white rabbit is thin.',
    ],
    optionTts: [
      '選項一，I see three rabbits.',
      '選項二，The black rabbit is big.',
      '選項三，The white rabbit is thin.',
    ],
    answer: 2,
    concept: '看圖辨識動物數量、顏色與體型形容詞（thin）',
    steps: [
      '觀察左邊圖片：共有兩隻兔子（不是三隻），左邊矮胖小隻的是黑兔（不是 big），右邊瘦高細長的是白兔（The white rabbit is thin.）。',
      '符合圖意的是 (3) The white rabbit is thin.',
      '選 (3)。',
    ],
  },
  {
    num: 25,
    options: [
      'Kevin can swim. He can’t sing.',
      'May can sing. She can’t dance.',
      'May can dance. Kevin can’t.',
    ],
    optionTts: [
      '選項一，Kevin can swim. He cannot sing.',
      '選項二，May can sing. She cannot dance.',
      '選項三，May can dance. Kevin cannot.',
    ],
    answer: 2,
    concept: '看圖表辨識人物能力比較（May can dance. Kevin can’t.）',
    steps: [
      '讀懂表格兩列（Kevin 與 May）和三欄圖示（游泳 swim、唱歌 sing、跳舞 dance）：',
      'Kevin：游泳打勾、唱歌打勾、跳舞打叉；May：游泳打叉、唱歌打勾、跳舞打勾。',
      '核對選項：(1) Kevin 會唱歌（錯）；(2) May 會跳舞（錯）；(3) May 會跳舞，Kevin 不會（May can dance. Kevin can’t.）完全正確。選 (3)。',
    ],
  },
];

export const PRIORI_110_ENGLISH_G5_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-110-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g5/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/110/eng-g5/q${qStr}.mp3`,
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
      id: `priori-110-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/110/eng-g5/q${qStr}_fig.webp`,
      questionText: `第一部分（二）聽辨圖意（第 ${item.num} 題）\n請先播放官方聽力音檔（共 3 遍），再依左邊圖片選出最適合的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/110/eng-g5/q${qStr}.mp3`,
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
      id: `priori-110-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/110/eng-g5/q${qStr}_fig.webp`,
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
      id: `priori-110-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/110/eng-g5/q${qStr}_fig.webp`,
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
      id: `priori-110-eng-g5-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g5/q${qStr}.webp`,
      figureImage: `/assets/priori/110/eng-g5/q${qStr}_fig.webp`,
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
