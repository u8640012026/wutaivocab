export const PRIORI_111_ENGLISH_G6_META = {
  paperId: '111-english-g6',
  examSeries: 'priori',
  year: 111,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 6,
  gradeLabel: '六年級',
  title: '111 年篩選測驗 六年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字與對話閱讀 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「111 年篩選測驗英語科 6 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '111-english-g6',
  examSeries: 'priori',
  year: 111,
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
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字尾拼字填入 m____。',
    ttsPrompt: '第 1 題聽辨語音，請播放官方聽力音檔，選出正確的拼字填入字母 m 後面。',
    options: ['od', 'ude', 'ode'],
    optionTts: ['選項一，o d', '選項二，u d e', '選項三，o d e'],
    answer: 2,
    concept: '長短母音與字尾不發音 e 規則（o_e vs. u_e vs. 短 o）',
    steps: [
      'od 發短母音 /ɑ/；ude 發長音 you；ode 中的結尾 e 使前面的 o 發長母音 /oʊ/（mode）。',
      '播放官方聽力音檔，聽辨發音為長母音 o（mode）。',
      '對應選項 (3) ode，選 (3)。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字尾拼字填入 bl____。',
    ttsPrompt: '第 2 題聽辨語音，請播放官方聽力音檔，選出正確的母音拼字填入 b l 後面。',
    options: ['ep', 'eep', 'ipe'],
    optionTts: ['選項一，e p', '選項二，e e p', '選項三，i p e'],
    answer: 1,
    concept: '雙母音 ee 長音辨識（ep 與 eep 與 ipe）',
    steps: [
      'ep 發短音 /ɛ/；ee 合起來發長音 /i/（eep）；i_e 發長音 /aɪ/（ipe）。',
      '播放官方聽力音檔，聽見雙唇子音連綴 bl 後接長母音 /i/ 再收在雙唇 p（bleep）。',
      '對應選項 (2) eep，選 (2)。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的母音組合填入 ch___。',
    ttsPrompt: '第 3 題聽辨語音，請播放官方聽力音檔，選出正確的母音拼字填入 c h 後面。',
    options: ['ate', 'ea', 'ay'],
    optionTts: ['選項一，a t e', '選項二，e a', '選項三，a y'],
    answer: 2,
    concept: '複合母音與子音收尾辨識（ate 與 ea 與 ay）',
    steps: [
      'ate 字尾有清楚的無聲齒齦塞音 /t/；ea 發長母音 /i/；ay 發雙母音 /eɪ/ 且末尾沒有 /t/（chay）。',
      '播放官方聽力音檔，確認末尾是滑順的 /eɪ/ 長音且無 t 爆破音。',
      '對應選項 (3) ay，選 (3)。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    ans: 1,
    concept: '聽辨日常動詞（draw）',
    steps: [
      '觀察三張圖片男生的動作：圖 (1) 在白板上寫字 ABC（write）；圖 (2) 在白板上畫小熊圖案（draw）；圖 (3) 拿著書本閱讀（read）。',
      '播放官方聽力音檔，聽辨念出的動詞單字。',
      '對應正在畫畫的圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 5,
    ans: 0,
    concept: '聽辨場所單字（bookstore）',
    steps: [
      '觀察三種場所招牌：圖 (1) 招牌上有書本且外面擺滿書架（bookstore 書局）；圖 (2) 有購物車標誌（supermarket 超級市場）；圖 (3) 屋頂插旗子且有鐘面（school 學校）。',
      '播放官方聽力音檔，辨識聽到的是哪個場所。',
      '對應書局的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 6,
    ans: 0,
    concept: '聽辨衣物單字（jacket / coat）',
    steps: [
      '觀察三件衣物：圖 (1) 是有拉鍊與連帽的長袖外套（jacket / coat）；圖 (2) 是百褶短裙（skirt）；圖 (3) 是短袖上衣（T-shirt）。',
      '播放官方聽力音檔，聽辨說出的衣物名稱。',
      '對應長袖外套的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 7,
    ans: 2,
    concept: '聽辨生活對話情緒與情境（道歉或安慰）',
    steps: [
      '觀察三張母子互動圖：圖 (1) 小男孩笑著送花給媽媽；圖 (2) 過 5 歲生日戴尖帽開心慶祝；圖 (3) 小男孩低頭緊張捏手指，像是做錯事認錯或難過（I am sorry. / Don’t be sad.）。',
      '播放官方聽力音檔，聽辨句子所表達的情緒或叮嚀。',
      '依官方標準答案，對應情境為圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 8,
    ans: 0,
    concept: '聽辨位置介系詞（in the bag vs. in the box vs. on the bag）',
    steps: [
      '三張圖片的小白兔位置不同：圖 (1) 兔子在袋子「裡面」（in the bag）；圖 (2) 兔子在紙箱「裡面」（in the box）；圖 (3) 兔子蹲在袋子「上面」（on the bag）。',
      '播放官方聽力音檔，同時留意介系詞（in 裡面 vs. on 上面）與物品名詞（bag 袋子 vs. box 盒子）。',
      '對應兔子在袋子裡面的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 9,
    ans: 1,
    concept: '聽辨地點與活動句（at school / in the classroom）',
    steps: [
      '觀察三張圖的地點與動作：圖 (1) 女孩在家裡沙發看電視吃東西（at home）；圖 (2) 教室裡後方有佈告欄與榮譽榜，女孩在座位吃東西；圖 (3) 女孩站在寫著值日生的黑板前用粉筆畫線。',
      '播放官方聽力音檔，注意地點或動作描述。',
      '對應教室課桌前的圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 10,
    ans: 0,
    concept: '聽辨交通方式與目的地（go home by bike）',
    steps: [
      '觀察三張圖片的交通工具與箭頭目的地：圖 (1) 騎腳踏車「回家（home）」；圖 (2) 騎滑板車「回家（home）」；圖 (3) 騎腳踏車「去動物園（zoo）」。',
      '播放官方聽力音檔，聽清楚交通工具（bike 腳踏車 vs. scooter 滑板車）以及目的地（home vs. zoo）。',
      '對應騎腳踏車回家的圖片 (1)，選 (1)。',
    ],
  },
];

const READING_WORD_SPECS = [
  {
    num: 11,
    options: ['brother', 'student', 'doctor'],
    answer: 1,
    concept: '身分與職業單字認讀（student）',
    steps: [
      '觀察左圖描繪的學生形象（student）。',
      '選項分別為 (1) brother（兄弟）、(2) student（學生）、(3) doctor（醫生）。',
      '選 (2)。',
    ],
  },
  {
    num: 12,
    options: ['ride', 'walk', 'watch'],
    answer: 2,
    concept: '動作動詞認讀（watch）',
    steps: [
      '左邊圖片展示觀看螢幕或事物的動作（watch）。',
      '選項依序為 (1) ride（騎）、(2) walk（走路）、(3) watch（觀看）。',
      '選 (3)。',
    ],
  },
  {
    num: 13,
    options: ['Chinese', 'English', 'math'],
    answer: 1,
    concept: '學習科目單字認讀（English）',
    steps: [
      '左圖描繪與英語課相關的字母學習畫面（English）。',
      '選項依序為 (1) Chinese（國語）、(2) English（英語）、(3) math（數學）。',
      '選 (2)。',
    ],
  },
  {
    num: 14,
    options: ['car', 'bus', 'cat'],
    answer: 0,
    concept: '交通工具單字認讀（car）',
    steps: [
      '左圖畫的是一輛小轎車（car）。',
      '選項依序為 (1) car（小汽車）、(2) bus（公車）、(3) cat（貓）。',
      '選 (1)。',
    ],
  },
  {
    num: 15,
    options: ['supermarket', 'school', 'home'],
    answer: 0,
    concept: '地點單字認讀（supermarket）',
    steps: [
      '左圖畫的是一間超級市場（supermarket）。',
      '選項依序為 (1) supermarket（超級市場）、(2) school（學校）、(3) home（家）。',
      '選 (1)。',
    ],
  },
  {
    num: 16,
    options: ['bag', 'box', 'TV'],
    answer: 2,
    concept: '家電用品單字認讀（TV）',
    steps: [
      '左圖畫的是一台電視機（TV）。',
      '選項依序為 (1) bag（袋子）、(2) box（盒子）、(3) TV（電視）。',
      '選 (3)。',
    ],
  },
  {
    num: 17,
    options: ['short', 'long', 'tall'],
    answer: 1,
    concept: '長度形容詞認讀（long）',
    steps: [
      '左圖顯示物品或頭髮「長」（long）的比較提示。',
      '選項依序為 (1) short（短／矮）、(2) long（長的）、(3) tall（高的）。',
      '選 (2)。',
    ],
  },
];

const READING_DIALOGUE_SPECS = [
  {
    num: 18,
    stem: 'A: What is she doing?  B: _____________________',
    ttsPrompt: '第 18 題，對話問句是 What is she doing? 請問 B 應該選擇哪一個回應？',
    options: ["She's in the park.", 'She can sing.', "She's flying."],
    optionTts: ['選項一，She is in the park.', '選項二，She can sing.', '選項三，She is flying.'],
    answer: 2,
    concept: '現在進行式問句配對答句（What is she doing?）',
    steps: [
      '問句「What is she doing?（她正在做什麼？）」使用現在進行式（be 動詞 + V-ing）。',
      '(1) 回答的是地點「她在公園裡」；(2) 回答的是能力「她會唱歌」；只有 (3) She’s flying.（她正在飛）同為進行式動作。',
      '選 (3)。',
    ],
  },
  {
    num: 19,
    stem: 'A: Where is my T-shirt?  B: _____________________',
    ttsPrompt: '第 19 題，對話問句是 Where is my T shirt? 請問 B 應該選擇哪一個回應？',
    options: ['I have a T-shirt.', "It's a small T-shirt.", "It's in the bathroom."],
    optionTts: [
      '選項一，I have a T shirt.',
      '選項二，It is a small T shirt.',
      '選項三，It is in the bathroom.',
    ],
    answer: 2,
    concept: '疑問詞 Where 詢問地點的位置回應',
    steps: [
      '「Where is my T-shirt?」問的是「我的 T 恤在哪裡？」，答句必須包含地點介系詞片語。',
      '(1) 說「我有一件 T 恤」，(2) 說「這是一件小 T 恤」，只有 (3) It’s in the bathroom.（它在浴室裡）回答了位置。',
      '選 (3)。',
    ],
  },
  {
    num: 20,
    stem: 'A: Do you like music?  B: _____________________',
    ttsPrompt: '第 20 題，對話問句是 Do you like music? 請問 B 應該選擇哪一個回應？',
    options: ['Yes, I can draw.', 'No, I like math.', "No, I can't."],
    optionTts: ['選項一，Yes, I can draw.', '選項二，No, I like math.', '選項三，No, I cannot.'],
    answer: 1,
    concept: '助動詞 Do 問喜好的合理應答（Do you like ...?）',
    steps: [
      '問句用「Do you like music?」詢問是否喜歡音樂，回答也應回應喜好的科目或用 do/don’t。',
      '(1) 與 (3) 都誤用了能力助動詞「can / can’t」答非所問；只有 (2) No, I like math.（不，我喜歡數學）語意連貫正確。',
      '選 (2)。',
    ],
  },
];

const READING_P2S_SPECS = [
  {
    num: 21,
    options: ["She's playing.", "She's at home.", "She's sad."],
    optionTts: ['選項一，She is playing.', '選項二，She is at home.', '選項三，She is sad.'],
    answer: 0,
    concept: '看圖辨識現在進行式句子（She is playing.）',
    steps: [
      '左圖呈現女生正在玩樂或進行遊玩的動作。',
      '對照三個句子：(1) 她正在玩（She’s playing.）、(2) 她在家、(3) 她很難過，最相符的是 (1)。',
      '選 (1)。',
    ],
  },
  {
    num: 22,
    options: ['I see two big heads.', 'I see two small ears.', 'I see three small eyes.'],
    optionTts: [
      '選項一，I see two big heads.',
      '選項二，I see two small ears.',
      '選項三，I see three small eyes.',
    ],
    answer: 1,
    concept: '身體部位複數與大小形容詞辨讀（two small ears）',
    steps: [
      '核對左圖特徵的數量與部位名稱，只有「兩隻小耳朵（two small ears）」符合正常外觀與圖意，而非兩個大頭或三隻小眼睛。',
      '選 (2)。',
    ],
  },
  {
    num: 23,
    options: [
      "He's a doctor. He's reading.",
      "He's a teacher. He's reading.",
      "He's a doctor. He's drawing.",
    ],
    optionTts: [
      '選項一，He is a doctor. He is reading.',
      '選項二，He is a teacher. He is reading.',
      '選項三，He is a doctor. He is drawing.',
    ],
    answer: 0,
    concept: '看圖辨識職業與正在進行的動作（doctor, reading）',
    steps: [
      '觀察左邊圖片人物的穿著與配備是醫生（doctor），手裡拿著書正在閱讀（reading），並非畫畫或老師。',
      '對應 (1) He’s a doctor. He’s reading.',
      '選 (1)。',
    ],
  },
  {
    num: 24,
    options: [
      "I have a lion. It's in the living room.",
      "I have a cat. It's under the skirt.",
      "I see a lion. It's sleeping.",
    ],
    optionTts: [
      '選項一，I have a lion. It is in the living room.',
      '選項二，I have a cat. It is under the skirt.',
      '選項三，I see a lion. It is sleeping.',
    ],
    answer: 1,
    concept: '動物名稱與方位介系詞（cat under the skirt）',
    steps: [
      '觀察左圖的動物是貓咪（cat，非獅子），而且所在位置是在裙子底下（under the skirt）。',
      '對應 (2) I have a cat. It’s under the skirt.',
      '選 (2)。',
    ],
  },
  {
    num: 25,
    options: [
      "I don't like art. I like math.",
      "I don't like math. I like art.",
      "I don't like art. I like Chinese.",
    ],
    optionTts: [
      '選項一，I do not like art. I like math.',
      '選項二，I do not like math. I like art.',
      '選項三，I do not like art. I like Chinese.',
    ],
    answer: 2,
    concept: '看圖辨識學科喜惡對比（art vs. Chinese）',
    steps: [
      '觀察左邊圖片中表示不喜歡（打叉）的是美術／藝術（art），而表情喜歡的是國語（Chinese）。',
      '對應 (3) I don’t like art. I like Chinese.',
      '選 (3)。',
    ],
  },
];

export const PRIORI_111_ENGLISH_G6_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-111-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g6/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/111/eng-g6/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: item.ttsPrompt,
      optionTtsTexts: item.optionTts,
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
      id: `priori-111-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g6/q${qStr}.webp`,
      figureImage: `/assets/priori/111/eng-g6/q${qStr}_fig.webp`,
      questionText: `第一部分（二）聽辨圖意（第 ${item.num} 題）\n請先播放官方聽力音檔（共 3 遍），再依左邊圖片選出最適合的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/111/eng-g6/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題，聽力看圖題。請先點擊官方聽力音檔，再從一、二、三號圖片中選出正確答案。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: 'Ac-III-3',
      prioriCode: 'ENG-L-6-1',
      explanationSteps: item.steps,
    };
  }),

  ...READING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-111-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g6/q${qStr}.webp`,
      figureImage: `/assets/priori/111/eng-g6/q${qStr}_fig.webp`,
      questionText: `第二部分（一）看圖認字（第 ${item.num} 題）\n請觀察左邊圖片，選出最符合圖意的英語單字：`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題，看圖選單字。請對照左邊圖片，選出最符合圖意的英語單字。`,
      optionTtsTexts: item.options.map((opt, idx) => `選項${['一', '二', '三'][idx]}，${opt}`),
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
      id: `priori-111-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g6/q${qStr}.webp`,
      figureImage: null,
      questionText: `第二部分（二）日常英語對話問答（第 ${item.num} 題）\n${item.stem}`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: item.ttsPrompt,
      optionTtsTexts: item.optionTts,
      conceptTitle: item.concept,
      curriculumCode: 'Ac-III-3',
      prioriCode: 'ENG-R-6-2',
      explanationSteps: item.steps,
    };
  }),

  ...READING_P2S_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-111-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/111/eng-g6/q${qStr}.webp`,
      figureImage: `/assets/priori/111/eng-g6/q${qStr}_fig.webp`,
      questionText: `第二部分（三）看圖辨識句子（第 ${item.num} 題）\n請依照左邊圖片選出最適合的英語句子：`,
      options: item.options,
      answer: item.answer,
      media: { audioSrc: null, audioSourceType: null },
      ttsText: `第 ${item.num} 題，看圖選句子。請依照左邊圖片選出最適合的句子。`,
      optionTtsTexts: item.optionTts,
      conceptTitle: item.concept,
      curriculumCode: 'Ac-III-3',
      prioriCode: 'ENG-R-6-2',
      explanationSteps: item.steps,
    };
  }),
];
