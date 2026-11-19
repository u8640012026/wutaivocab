export const PRIORI_110_ENGLISH_G6_META = {
  paperId: '110-english-g6',
  examSeries: 'priori',
  year: 110,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 6,
  gradeLabel: '六年級',
  title: '110 年篩選測驗 六年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（聽力 10 題＋認字與對話閱讀 15 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與 Q1～Q10 官方聽力音檔皆核對自教育部國教署「110 年篩選測驗英語科 6 年級試卷答案卷」官方公布版。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '110-english-g6',
  examSeries: 'priori',
  year: 110,
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
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字尾拼字填入 t____。',
    ttsPrompt: '第 1 題聽辨語音，請播放官方聽力音檔，選出正確的拼字填入字母 t 後面。',
    options: ['ube', 'obe', 'ub'],
    optionTts: ['選項一，u b e', '選項二，o b e', '選項三，u b'],
    answer: 0,
    concept: '長短母音與字尾不發音 e 規則（u_e vs. o_e vs. 短 u）',
    steps: [
      'ube 中的結尾不發音 e 使前面的 u 發長音 /u/ 或 /ju/（tube）；obe 發長音 /oʊ/；ub 則發短母音 /ʌ/。',
      '播放官方聽力音檔，聽辨字母 t 後接長音 u 收在雙唇 /b/（tube）。',
      '對應選項 (1) ube，選 (1)。',
    ],
  },
  {
    num: 2,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的母音拼字填入 br____。',
    ttsPrompt: '第 2 題聽辨語音，請播放官方聽力音檔，選出正確的母音拼字填入 b r 後面。',
    options: ['a', 'ee', 'ay'],
    optionTts: ['選項一，字母 a', '選項二，e e', '選項三，a y'],
    answer: 2,
    concept: '複合母音 ay 與 ee 及單母音辨識（a 與 ee 與 ay）',
    steps: [
      'ay 合起來發雙母音 /eɪ/（bray）；ee 發長母音 /i/；單獨的 a 在字尾通常不作 /eɪ/ 重讀韻尾或為短音。',
      '播放官方聽力音檔，聽見子音連綴 br 後接清楚的雙母音 /eɪ/（bray）。',
      '對應選項 (3) ay，選 (3)。',
    ],
  },
  {
    num: 3,
    stem: '第一部分（一）聽辨語音：請播放官方聽力音檔，選出正確的字尾拼字填入 sh____。',
    ttsPrompt: '第 3 題聽辨語音，請播放官方聽力音檔，選出正確的拼字填入 s h 後面。',
    options: ['eet', 'ate', 'ite'],
    optionTts: ['選項一，e e t', '選項二，a t e', '選項三，i t e'],
    answer: 2,
    concept: '長母音規則辨識（eet 與 ate 與 ite）',
    steps: [
      'eet 發長母音 /i/ 接 /t/；ate 中的 a_e 發雙母音 /eɪ/ 接 /t/；ite 中的 i_e 發雙母音 /aɪ/ 接 /t/。',
      '播放官方聽力音檔，聽出 sh 後接長母音 /aɪ/ 再收 /t/ 爆破音。',
      '對應選項 (3) ite，選 (3)。',
    ],
  },
];

const LISTENING_PIC_SPECS = [
  {
    num: 4,
    ans: 1,
    concept: '聽辨交通工具與身體部位單字（nose）',
    steps: [
      '觀察三張圖片：圖 (1) 是一輛公車（bus）；圖 (2) 箭頭指著人物側臉的鼻子（nose）；圖 (3) 是一隻耳朵（ear）。',
      '播放官方聽力音檔，聽辨念出的英文單字。',
      '對應指向鼻子的圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 5,
    ans: 1,
    concept: '聽辨居家房間名稱（bedroom）',
    steps: [
      '觀察三張室內場景：圖 (1) 有浴缸、蓮蓬頭與洗手台（bathroom 浴室）；圖 (2) 有床鋪、枕頭與床頭櫃（bedroom 臥室）；圖 (3) 有瓦斯爐、抽油煙機與湯鍋（kitchen 廚房）。',
      '播放官方聽力音檔，辨識聽到的房間名稱。',
      '對應臥室的圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 6,
    ans: 0,
    concept: '聽辨衣物與日常名詞（dress）',
    steps: [
      '觀察三張圖片：圖 (1) 是一件長袖連身洋裝（dress）；圖 (2) 女孩拿著調色盤在畫架前畫畫（draw）；圖 (3) 是一碗白飯（rice）。',
      '播放官方聽力音檔，聽辨說出的英文單字。',
      '對應洋裝的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 7,
    ans: 2,
    concept: '聽辨生活對話場景（點餐或購物回應）',
    steps: [
      '觀察三張人物對話情境：圖 (1) 老師在教室黑板前對坐著的兩位學生講課；圖 (2) 兩位同學在門口彎腰行禮打招呼；圖 (3) 速食店員戴著帽子在櫃台遞上放有漢堡與飲料的餐盤給顧客。',
      '播放官方聽力音檔，聽辨對話所發生的場景與內容。',
      '依官方標準答案，對應情境為圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 8,
    ans: 1,
    concept: '聽辨動物與動作句（The cat can ride a bike.）',
    steps: [
      '觀察三張圖片中的動物與動作：圖 (1) 是一隻鳥在騎腳踏車；圖 (2) 是一隻貓在騎腳踏車（ride a bike）；圖 (3) 是一隻貓在畫架上畫腳踏車（draw a bike）。',
      '播放官方聽力音檔，同時確認動物名稱（bird 鳥 vs. cat 貓）以及動作（ride 騎 vs. draw 畫）。',
      '對應貓咪騎腳踏車的圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 9,
    ans: 0,
    concept: '聽辨性別人稱與職業句（He is a cook.）',
    steps: [
      '觀察三張圖片人物的性別與職業：圖 (1) 是留著小鬍子的男廚師端著牛排（He is a cook.）；圖 (2) 是戴聽診器穿白袍的男醫生（He is a doctor.）；圖 (3) 是綁麻花辮的女廚師端著牛排（She is a cook.）。',
      '播放官方聽力音檔，注意聽人稱代名詞（He / She）和職業名詞（cook / doctor）。',
      '對應男廚師的圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 10,
    ans: 1,
    concept: '聽辨學科喜好句（She likes Chinese.）',
    steps: [
      '觀察三張圖片女孩思想泡泡裡的課本與符號：圖 (1) 「英語」課本旁打勾 ✓，女孩微笑；圖 (2) 「國語」課本旁打勾 ✓，女孩微笑（likes Chinese）；圖 (3) 「國語」課本旁打叉 ×，女孩難過掉淚（doesn’t like Chinese）。',
      '播放官方聽力音檔，留意科目名稱（English 英語 vs. Chinese 國語）以及肯定或否定喜好。',
      '對應喜歡國語課本的圖片 (2)，選 (2)。',
    ],
  },
];

const READING_WORD_SPECS = [
  {
    num: 11,
    options: ['doctor', 'student', 'teacher'],
    answer: 2,
    concept: '職業與身分單字認讀（teacher）',
    steps: [
      '左圖畫著講台前拿著課本與粉筆向兩位學生授課的人物，箭頭指向老師（teacher）。',
      '選項分別為 (1) doctor（醫生）、(2) student（學生）、(3) teacher（老師）。',
      '選 (3)。',
    ],
  },
  {
    num: 12,
    options: ['eat', 'sleep', 'walk'],
    answer: 1,
    concept: '日常動作動詞認讀（sleep）',
    steps: [
      '左圖畫著男孩蓋著棉被在床上閉眼熟睡、上方飄著「ZZZ」符號（sleep）。',
      '選項依序為 (1) eat（吃）、(2) sleep（睡覺）、(3) walk（走路）。',
      '選 (2)。',
    ],
  },
  {
    num: 13,
    options: ['English', 'math', 'art'],
    answer: 1,
    concept: '學習科目單字認讀（math）',
    steps: [
      '左圖展示兩個加減算式（math 數學）。',
      '選項依序為 (1) English（英語）、(2) math（數學）、(3) art（美術）。',
      '選 (2)。',
    ],
  },
  {
    num: 14,
    options: ['eye', 'nose', 'mouth'],
    answer: 0,
    concept: '身體部位單字認讀（eye）',
    steps: [
      '左圖畫著貓咪臉部，粗黑箭頭明確指向貓咪的眼睛（eye）。',
      '選項依序為 (1) eye（眼睛）、(2) nose（鼻子）、(3) mouth（嘴巴）。',
      '選 (1)。',
    ],
  },
  {
    num: 15,
    options: ['park', 'bookstore', 'living room'],
    answer: 2,
    concept: '居家空間單字認讀（living room）',
    steps: [
      '左圖畫著擺有兩張沙發、地毯與電視機的客廳空間（living room）。',
      '選項依序為 (1) park（公園）、(2) bookstore（書店）、(3) living room（客廳）。',
      '選 (3)。',
    ],
  },
  {
    num: 16,
    options: ['zoo', 'home', 'school'],
    answer: 0,
    concept: '場所單字認讀（zoo）',
    steps: [
      '左圖畫著圍欄裡的大象、猴子與長頸鹿，一旁還有遊客觀賞，明顯是動物園（zoo）。',
      '選項依序為 (1) zoo（動物園）、(2) home（家）、(3) school（學校）。',
      '選 (1)。',
    ],
  },
  {
    num: 17,
    options: ['skirt', 'dress', 'jacket'],
    answer: 2,
    concept: '衣物單字認讀（jacket）',
    steps: [
      '左圖畫著一件正面拉鍊式、有領口與口袋的長袖夾克外套（jacket）。',
      '選項依序為 (1) skirt（裙子）、(2) dress（洋裝）、(3) jacket（夾克／外套）。',
      '選 (3)。',
    ],
  },
];

const READING_DIALOGUE_SPECS = [
  {
    num: 18,
    stem: 'A: What are you doing?  B: _____________________',
    ttsPrompt: '第 18 題，對話問句是 What are you doing? 請問 B 應該選擇哪一個回應？',
    options: ['I can dance.', 'I’m reading.', 'I’m in the park.'],
    optionTts: ['選項一，I can dance.', '選項二，I am reading.', '選項三，I am in the park.'],
    answer: 1,
    concept: '現在進行式問句配對答句（What are you doing?）',
    steps: [
      '問句「What are you doing?（你正在做什麼？）」詢問正在進行的動作，須用現在進行式回答。',
      '(1) 回答的是能力「我會跳舞」；(3) 回答的是地點「我在公園裡」；只有 (2) I’m reading.（我正在閱讀）符合進行式語法與語意。',
      '選 (2)。',
    ],
  },
  {
    num: 19,
    stem: 'A: Where are you?  B: _____________________',
    ttsPrompt: '第 19 題，對話問句是 Where are you? 請問 B 應該選擇哪一個回應？',
    options: ['I’m eleven.', 'It’s in the box.', 'I’m in the bedroom.'],
    optionTts: [
      '選項一，I am eleven.',
      '選項二，It is in the box.',
      '選項三，I am in the bedroom.',
    ],
    answer: 2,
    concept: '疑問詞 Where 詢問人所在位置之回應（Where are you?）',
    steps: [
      '「Where are you?」問的是「你在哪裡？」，主詞是「你（you）」，回答應以「I’m + 地點」回應。',
      '(1) 回答年齡「我十一歲」；(2) 主詞誤用「It’s（它在盒子裡）」；只有 (3) I’m in the bedroom.（我在臥室裡）主詞與地點都正確。',
      '選 (3)。',
    ],
  },
  {
    num: 20,
    stem: 'A: Is she a nurse?  B: _____________________',
    ttsPrompt: '第 20 題，對話問句是 Is she a nurse? 請問 B 應該選擇哪一個回應？',
    options: ['No. She is a doctor.', 'No. She is a nurse.', 'Yes. She is a doctor.'],
    optionTts: [
      '選項一，No. She is a doctor.',
      '選項二，No. She is a nurse.',
      '選項三，Yes. She is a doctor.',
    ],
    answer: 0,
    concept: '一般疑問句肯定與否定邏輯一致性（Is she a nurse?）',
    steps: [
      '問句問「她是一位護理師嗎（Is she a nurse?）」，肯定（Yes）後方職業應維持 nurse，否定（No）後方才可改說其他職業。',
      '(2) 回答 No 卻又說她是 nurse、自相矛盾；(3) 回答 Yes 卻說她是 doctor、前後矛盾；只有 (1) No. She is a doctor.（不，她是一位醫生）邏輯完全合理。',
      '選 (1)。',
    ],
  },
];

const READING_P2S_SPECS = [
  {
    num: 21,
    options: ['He is going to the park.', 'He is in the park.', 'He is flying.'],
    optionTts: [
      '選項一，He is going to the park.',
      '選項二，He is in the park.',
      '選項三，He is flying.',
    ],
    answer: 0,
    concept: '看圖辨識現在進行式移動句（He is going to the park.）',
    steps: [
      '觀察左圖：男孩正沿著草地小路走往前方的溜滑梯、鞦韆與「○○公園」招牌，尚未進入公園裡面。',
      '對照三個句子：(1) 他正要去公園（He is going to the park.）、(2) 他在公園裡、(3) 他正在飛，最符合畫面的是 (1)。',
      '選 (1)。',
    ],
  },
  {
    num: 22,
    options: ['I am a sad boy.', 'I have a big mouth.', 'I am drawing a mouth.'],
    optionTts: [
      '選項一，I am a sad boy.',
      '選項二，I have a big mouth.',
      '選項三，I am drawing a mouth.',
    ],
    answer: 2,
    concept: '看圖辨識進行式動作與身體部位名詞（drawing a mouth）',
    steps: [
      '觀察左圖：男孩面帶微笑拿著調色盤與畫筆，正在畫架的畫布上畫一張嘴巴（mouth）。',
      '對照選項：(1) 男孩並不難過；(2) 男孩自己的嘴巴很小；(3) I am drawing a mouth.（我正在畫一張嘴巴）完全相符。',
      '選 (3)。',
    ],
  },
  {
    num: 23,
    options: [
      'The boy is at home.',
      'The bird is under the bed.',
      'The cat is in the bathroom.',
    ],
    optionTts: [
      '選項一，The boy is at home.',
      '選項二，The bird is under the bed.',
      '選項三，The cat is in the bathroom.',
    ],
    answer: 2,
    concept: '看圖辨識動物位置與房間名稱（cat in the bathroom）',
    steps: [
      '觀察左圖細節：男孩站在房子外面（非在家裡面）；鳥停在床「上面」（on the bed，非床底下）；左邊房間有馬桶，貓咪正坐在馬桶上（in the bathroom）。',
      '對應 (3) The cat is in the bathroom.',
      '選 (3)。',
    ],
  },
  {
    num: 24,
    options: [
      'The box is in the bedroom.',
      'The T-shirt is under the box.',
      'The shoe is on the box.',
    ],
    optionTts: [
      '選項一，The box is in the bedroom.',
      '選項二，The T shirt is under the box.',
      '選項三，The shoe is on the box.',
    ],
    answer: 1,
    concept: '看圖辨識方位介系詞（under the box vs. in the box）',
    steps: [
      '觀察左邊客廳圖片（有沙發與電視，並非臥室）：鞋子放在盒子「裡面」（in the box，非上面 on），而 T 恤則被壓在盒子「底下」（under the box）。',
      '對應 (2) The T-shirt is under the box.',
      '選 (2)。',
    ],
  },
  {
    num: 25,
    options: [
      'Tina is in the kitchen. She is eating.',
      'Tina is in the kitchen. She is singing.',
      'Tina is in the living room. She is eating.',
    ],
    optionTts: [
      '選項一，Tina is in the kitchen. She is eating.',
      '選項二，Tina is in the kitchen. She is singing.',
      '選項三，Tina is in the living room. She is eating.',
    ],
    answer: 0,
    concept: '看圖辨識房間場所與進行式動作（in the kitchen, eating）',
    steps: [
      '觀察左圖背景有抽油煙機、鍋子與瓦斯爐，確認地點是在廚房（kitchen）；Tina 手裡捧著碗用筷子夾麵條，動作是正在吃東西（eating）。',
      '對應 (1) Tina is in the kitchen. She is eating.',
      '選 (1)。',
    ],
  },
];

export const PRIORI_110_ENGLISH_G6_QUESTIONS = [
  ...LISTENING_WORD_SPECS.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-110-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g6/q${qStr}.webp`,
      figureImage: null,
      questionText: item.stem,
      options: item.options,
      answer: item.answer,
      media: {
        audioSrc: `/audio/priori/110/eng-g6/q${qStr}.mp3`,
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
      id: `priori-110-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g6/q${qStr}.webp`,
      figureImage: `/assets/priori/110/eng-g6/q${qStr}_fig.webp`,
      questionText: `第一部分（二）聽辨圖意（第 ${item.num} 題）\n請先播放官方聽力音檔（共 3 遍），再依左邊圖片選出最適合的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/110/eng-g6/q${qStr}.mp3`,
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
      id: `priori-110-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g6/q${qStr}.webp`,
      figureImage: `/assets/priori/110/eng-g6/q${qStr}_fig.webp`,
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
      id: `priori-110-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g6/q${qStr}.webp`,
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
      id: `priori-110-eng-g6-q${qStr}`,
      number: item.num,
      questionImage: `/assets/priori/110/eng-g6/q${qStr}.webp`,
      figureImage: `/assets/priori/110/eng-g6/q${qStr}_fig.webp`,
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
