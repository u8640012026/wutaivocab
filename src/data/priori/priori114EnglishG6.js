export const PRIORI_114_ENGLISH_G6_META = {
  paperId: '114-english-g6',
  examSeries: 'priori',
  year: 114,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 6,
  gradeLabel: '六年級',
  title: '114 年篩選測驗 六年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字讀寫 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「114 年篩選測驗英語科 6 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '114-english-g6',
  examSeries: 'priori',
  year: 114,
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
    stem: '第一部分（一）聽音拼字：請播放官方聽力音檔，選出正確的長母音拼字填入 r____。',
    options: ['aze', 'oze', 'uze'],
    answer: 1,
    concept: '長母音與字尾 silent-e 拼讀（o_e）',
    steps: [
      '專注聽單字的母音發音是長母音 /eɪ/（aze）、/oʊ/（oze）還是 /uː/（uze）。',
      '結合字首 r 與字尾 /z/ 音，判斷對應的母音組合。',
      '依照官方標準答案，本題應選 (2) oze。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽音拼字：請播放官方聽力音檔，選出正確的長母音拼字填入 m___。',
    options: ['ape', 'ipe', 'eep'],
    answer: 2,
    concept: '長母音拼讀與字尾子音（eep vs. ape / ipe）',
    steps: [
      '分辨單字中的長母音是 /eɪ/（ape）、/aɪ/（ipe）還是長母音 /iː/（eep）。',
      '三個選項字尾都是清音 /p/，因此辨識中間長母音最關鍵。',
      '依照官方標準答案，本題應選 (3) eep。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽音拼字：請播放官方聽力音檔，選出正確的母音組合填入 f____。',
    options: ['ay', 'ea', 'al'],
    answer: 0,
    concept: '雙字母母音組合（ay / ea / al）',
    steps: [
      '注意聽字尾聲音：ay 發長音 /eɪ/、ea 常發 /iː/、al 帶有 /l/ 音。',
      '搭配字首清擦音 /f/，辨識整字發音。',
      '依照官方標準答案，本題應選 (1) ay（fay）。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    concept: '聽辨學校科目單字（music / math / art）',
    steps: [
      '圖片依序為音樂課（音符）、數學課（算式）與美術課（調色盤）。',
      '聆聽官方聽力中提及的科目名稱。',
      '對照官方標準答案，本題正解為圖 (3)。',
    ],
  },
  {
    num: 5,
    concept: '聽辨動物與身體部位（ear / eye / nose）',
    steps: [
      '三張圖都是小狗，但箭頭分別指向耳朵、眼睛與鼻子。',
      '聽清楚音檔念出的身體部位單字。',
      '對照官方標準答案，本題正解為圖 (3)。',
    ],
  },
  {
    num: 6,
    concept: '聽辨居家房間單字（living room / bathroom / bedroom）',
    steps: [
      '圖片依序為客廳（沙發電視）、浴室（浴缸馬桶）與臥室（床鋪）。',
      '聆聽官方聽力單字或位置描述。',
      '對照官方標準答案，本題正解為圖 (2)。',
    ],
  },
  {
    num: 7,
    concept: '聽辨校園與居家對話情境',
    steps: [
      '圖片依序為走廊交談、送生日禮物與女孩陪小貓睡覺。',
      '播放官方聽力對話，比對最相符的情境畫面。',
      '對照官方標準答案，本題正解為圖 (1)。',
    ],
  },
  {
    num: 8,
    concept: '聽辨科目喜好句型（Chinese / math O-X 表）',
    steps: [
      '先分辨表格內國語課（Chinese）與數學課（math）分別是喜歡（O）還是不喜歡（X）。',
      '核對官方音檔中提到喜歡與不喜歡的科目。',
      '對照官方標準答案，本題正解為圖 (3)。',
    ],
  },
  {
    num: 9,
    concept: '聽辨人物與地點行進方向（park）',
    steps: [
      '比較三張公園圖中女孩或男孩的位置與行進動作。',
      '聽清音檔說的人稱（he / she）及是否正在前往公園或已在公園裡。',
      '對照官方標準答案，本題正解為圖 (3)。',
    ],
  },
  {
    num: 10,
    concept: '聽辨進行式動作與居家地點組合',
    steps: [
      '圖片依序是：在床上看電視、在床上看書、在客廳沙發看電視。',
      '同時聽清音檔的動作（watching TV / reading a book）與地點（on the bed / in the living room）。',
      '對照官方標準答案，本題正解為圖 (2)。',
    ],
  },
];

const READ_WORD_PIC_SPECS = [
  {
    num: 11,
    options: ['fly', 'walk', 'warm'],
    answer: 1,
    concept: '看圖辨字（動作動詞 walk）',
    steps: [
      '圖片中一男一女正在邁步向前走路（walk）。',
      '選項 (1) fly 飛、(2) walk 走路、(3) warm 溫暖的。',
      '正確答案為 (2) walk。',
    ],
  },
  {
    num: 12,
    options: ['eat', 'ride', 'watch'],
    answer: 0,
    concept: '看圖辨字（動作動詞 eat）',
    steps: [
      '圖片是一隻小老鼠正在啃吃（eat）一塊起司。',
      '選項 (1) eat 吃、(2) ride 騎乘、(3) watch 觀看。',
      '正確答案為 (1) eat。',
    ],
  },
  {
    num: 13,
    options: ['student', 'nurse', 'cook'],
    answer: 0,
    concept: '看圖辨字（職業／身分名詞 student）',
    steps: [
      '圖片是一名背著或放著書包坐在課桌前唸書的學生（student）。',
      '選項 (1) student 學生、(2) nurse 護理師、(3) cook 廚師。',
      '正確答案為 (1) student。',
    ],
  },
  {
    num: 14,
    options: ['Chinese', 'music', 'math'],
    answer: 1,
    concept: '看圖辨字（科目名詞 music）',
    steps: [
      '圖片中幾位小朋友正在吹直笛和打鼓演奏樂器。',
      '對應的學校科目為 (2) music（音樂課）。',
      '因此選 (2) music。',
    ],
  },
  {
    num: 15,
    options: ['eye', 'head', 'mouth'],
    answer: 0,
    concept: '看圖辨字（五官單字 eye）',
    steps: [
      '圖片是一個女孩的臉部特寫，箭頭指向她的眼睛（eye）。',
      '選項 (1) eye 眼睛、(2) head 頭、(3) mouth 嘴巴。',
      '正確答案為 (1) eye。',
    ],
  },
  {
    num: 16,
    options: ['shoe', 'dress', 'jacket'],
    answer: 2,
    concept: '看圖辨字（衣物單字 jacket）',
    steps: [
      '圖片是一雙以外套拉鍊與連帽為特徵的夾克外套（jacket）。',
      '選項 (1) shoe 鞋子、(2) dress 洋裝、(3) jacket 外套／夾克。',
      '正確答案為 (3) jacket。',
    ],
  },
  {
    num: 17,
    options: ['a small bus', 'a long box', 'a long bus'],
    answer: 2,
    concept: '長短形容詞與交通工具片語（a long bus）',
    steps: [
      '圖中比較一長一短兩輛公車，箭頭指向比較長的那一輛。',
      '(1) 小公車與 (2) 長盒子都不對，只有 (3) a long bus 符合圖意。',
      '正確答案為 (3)。',
    ],
  },
];

const DIALOGUE_TEXT_SPECS = [
  {
    num: 18,
    prompt: 'A: Is she a cook?\nB: ___',
    options: ['No, she is a nurse.', 'No, she is at school.', 'Yes, she is a teacher.'],
    answer: 0,
    concept: 'Be 動詞職業疑問句與答句一致性',
    steps: [
      '問句問職業「Is she a cook?」（她是廚師嗎？），答句應針對職業或肯定／否定保持一致。',
      '(2) 回答地點「在學校」答非所問；(3) 用 Yes 卻說成了老師（teacher）自相矛盾。',
      '只有 (1) No, she is a nurse.（不是，她是護理師）邏輯正確。',
    ],
  },
  {
    num: 19,
    prompt: 'A: Where is Ben?\nB: ___',
    options: ["He's eleven years old.", "He's in the kitchen.", "He's my brother."],
    answer: 1,
    concept: 'Where 地點疑問句答法',
    steps: [
      '疑問詞 Where 是在詢問「在哪裡」，必須回答地點或位置介系詞片語。',
      '(1) 回答十一歲（問 How old）、(3) 回答我的弟弟（問 Who），都答非所問。',
      '正確回答地點的是 (2) He\'s in the kitchen.（他在廚房裡）。',
    ],
  },
  {
    num: 20,
    prompt: 'A: Where are you going?\nB: ___',
    options: ['To the supermarket.', 'In the bathroom.', 'Riding a bike.'],
    answer: 0,
    concept: '前往地點問答（Where are you going?）',
    steps: [
      '「Where are you going?」問的是「你正要去哪裡？」，通常以「To + 地點」回答目的地。',
      '(2) 「在浴室裡」表示靜止位置；(3) 「騎腳踏車」回答方式／動作而非地點。',
      '只有 (1) To the supermarket.（去超市）符合問句語意。',
    ],
  },
];

const READ_PIC_SENTENCE_SPECS = [
  {
    num: 21,
    options: ['The girl is at home.', 'The dog is not happy.', 'The girl is not playing.'],
    answer: 2,
    concept: '看圖選句（室內外地點與進行動作辨別）',
    steps: [
      '圖片畫的是天上有雲朵的戶外草地，小狗在玩球且很開心，而女孩安靜地在一旁看書。',
      '(1) 女孩不在家裡；(2) 小狗正開心地玩球並非不開心。',
      '只有 (3) The girl is not playing.（女孩沒有在玩）符合圖片事實。',
    ],
  },
  {
    num: 22,
    options: [
      "I have three long ears. I don't like pies.",
      'I have two small eyes. I like bananas.',
      "I have a big mouth. I don't like apples.",
    ],
    answer: 0,
    concept: '外貌特徵與食物喜好表格閱讀',
    steps: [
      '看圖中奇特小兔：頭上有「三隻長耳朵」、嘴巴並不大，底下食物表顯示喜歡蘋果（O），不喜歡香蕉與派（X）。',
      '(2) 說喜歡香蕉錯；(3) 說有大嘴巴與不喜歡蘋果都錯。',
      '只有 (1) 同時符合「三隻長耳朵」與「不喜歡派」。',
    ],
  },
  {
    num: 23,
    options: [
      "I have a dress. It's in the box.",
      "I have a skirt. It's on the bed.",
      "I have a T-shirt. It's under the bed.",
    ],
    ttsOptions: [
      "選項一，I have a dress. It's in the box.",
      "選項二，I have a skirt. It's on the bed.",
      "選項三，I have a T shirt. It's under the bed.",
    ],
    answer: 1,
    concept: '衣物名詞與位置介系詞（on / in / under）',
    steps: [
      '圖中床鋪上面（on the bed）放著一件短裙（skirt）。',
      '(1) 洋裝在盒子裡不符；(3) T 恤在床底下也不符。',
      '因此選 (2) I have a skirt. It\'s on the bed.。',
    ],
  },
  {
    num: 24,
    options: [
      'He is a teacher. He is in the kitchen.',
      'He is a cook. He is dancing.',
      'He is Tom. He is a cook.',
    ],
    answer: 1,
    concept: '職業與進行式動作看圖判讀',
    steps: [
      '圖中人物戴著廚師帽（cook），名牌寫著 Ken（不是 Tom），而且旁邊有音符，他正在跳舞（dancing）。',
      '(1) 說他是老師錯；(3) 名字寫著 Ken 卻說 Tom 錯。',
      '正確描述圖意的是 (2) He is a cook. He is dancing.。',
    ],
  },
  {
    num: 25,
    options: [
      'She is Ivy. She is a nurse.',
      'The dog is in Taiwan. It is singing.',
      'The dog is black. It is under the bed.',
    ],
    answer: 0,
    concept: '人物名牌、職業與圖片細節綜合判讀',
    steps: [
      '圖片是一位戴著護士帽、名牌寫著 Ivy 的護理師，背景牆上貼著台灣地圖，她正在照顧一隻黑色小狗。',
      '(2) 小狗沒有在唱歌；(3) 小狗沒有在床底下。',
      '只有 (1) She is Ivy. She is a nurse. 完全正確。',
    ],
  },
];

export const PRIORI_114_ENGLISH_G6_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g6/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/114/eng-g6/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽音拼字，請點擊官方聽力音檔，並選出正確的字母選項。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，${opt}`),
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
      id: `priori-114-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g6/q${qStr}.webp`,
      figureImage: `/assets/priori/114/eng-g6/q${qStr}_fig.webp`,
      questionText: `第一部分（二）聽辨字詞與句子（第 ${item.num} 題）\n請先播放官方聽力音檔（共 3 遍），再選出最符合音檔內容的圖片。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: [2, 2, 1, 0, 2, 2, 1][item.num - 4],
      media: {
        audioSrc: `/audio/priori/114/eng-g6/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題，請播放官方聽力音檔，再選出最符合意思的圖片編號。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: 'Ac-III-3',
      prioriCode: 'ENG-L-6-1',
      explanationSteps: item.steps,
    };
  }),

  ...READ_WORD_PIC_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g6/q${qStr}.webp`,
      figureImage: `/assets/priori/114/eng-g6/q${qStr}_fig.webp`,
      questionText: `第二部分（一）看圖辨字（第 ${item.num} 題）\n請看左邊的圖片，選出最適當的字詞。`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題看圖辨字，請看圖片選出最適當的英文單字或片語。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'Ab-III-4',
      prioriCode: 'ENG-R-6-1',
      explanationSteps: item.steps,
    };
  }),

  ...DIALOGUE_TEXT_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g6/q${qStr}.webp`,
      figureImage: null,
      questionText: `第二部分（二）讀寫對話理解（第 ${item.num} 題）\n請閱讀對話內容，選出最適當的回答：\n${item.prompt}`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題對話理解，請選出最適當的回答。${item.prompt.replaceAll('\n', ' ')}`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'B-III-2',
      prioriCode: 'ENG-R-6-2',
      explanationSteps: item.steps,
    };
  }),

  ...READ_PIC_SENTENCE_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/114/eng-g6/q${qStr}.webp`,
      figureImage: `/assets/priori/114/eng-g6/q${qStr}_fig.webp`,
      questionText: `第二部分（三）看圖選句（第 ${item.num} 題）\n請看圖片內容，選出最符合的英文句子。`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題看圖選句，請觀察圖片選出最符合意思的英文句子。`,
      optionTtsTexts:
        item.ttsOptions || item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，${opt}`),
      conceptTitle: item.concept,
      curriculumCode: 'B-III-2',
      prioriCode: 'ENG-R-6-3',
      explanationSteps: item.steps,
    };
  }),
];
