export const PRIORI_114_ENGLISH_G3_META = {
  paperId: '114-english-g3',
  examSeries: 'priori',
  year: 114,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 3,
  gradeLabel: '三年級',
  title: '114 年篩選測驗 三年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・聽寫字母 15 題＋聽力選擇 10 題（附官方原音 MP3）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與各題聽力音檔皆對齊教育部國教署「114 年篩選測驗英語科 3 年級試卷、答案卷暨官方聽力檔」。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '114-english-g3',
  examSeries: 'priori',
  year: 114,
  subject: 'english',
  grade: 3,
  points: 4,
  preserveOptionOrder: true,
  ttsLang: 'zh-TW',
  ttsVerified: true,
  groupId: null,
  passage: null,
  answerSource: 'official_pdf',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
};

const ALPHABET_SPEC = [
  { num: 1, upper: 'V', lower: 'v', tip: '注意區分唇齒摩擦音「V」與雙唇音「B」，大寫「V」尖底、小寫「v」形狀相同但位於中線與底線之間。' },
  { num: 2, upper: 'N', lower: 'n', tip: '「N」是鼻音開口輕念，大寫有斜線相連，小寫「n」只有一個拱門，別跟兩個拱門的「m」搞混。' },
  { num: 3, upper: 'J', lower: 'j', tip: '字母「J」常和「G」混淆，小寫「j」上方有一點、下方會往下延伸鉤勾。' },
  { num: 4, upper: 'T', lower: 't', tip: '無聲子音「T」，大寫頂部平橫線，小寫「t」有一豎與短橫線，別誤寫成「d」。' },
  { num: 5, upper: 'C', lower: 'c', tip: '大寫「C」頂到底線，小寫「c」形狀相同但縮在中兩線格子內。' },
  { num: 6, upper: 'P', lower: 'p', tip: '注意區分「P」與「B」，小寫「p」的圓肚在右側上方、直線往下延伸到最底線。' },
  { num: 7, upper: 'F', lower: 'f', tip: '小寫「f」頂端向右彎曲並橫過中線，不要忘記中間那一短橫。' },
  { num: 8, upper: 'G', lower: 'g', tip: '大寫「G」像「C」往內收一橫折；小寫「g」圓圈在中線格內、尾巴往下彎鉤（易與「j」或「q」混淆）。' },
  { num: 9, upper: 'S', lower: 's', tip: '大寫「S」與小寫「s」形狀相同，書寫時記得清楚區分大寫占兩格、小寫占中間一格。' },
  { num: 10, upper: 'Y', lower: 'y', tip: '大寫「Y」上半為 V 形垂直往下；小寫「y」右斜線會往下延伸穿過第三線。' },
  { num: 11, upper: 'U', lower: 'u', tip: '母音「U」，與「V」最大差別在於底部是圓弧形；小寫「u」右邊要有一小豎垂直落地。' },
  { num: 12, upper: 'D', lower: 'd', tip: '極易混淆題：小寫「d」肚子朝左邊（像「先彎後直」），別寫成肚子朝右的「b」。' },
  { num: 13, upper: 'Q', lower: 'q', tip: '極易混淆題：小寫「q」圓圈在左、直線在右往下垂，別和尾巴彎鉤的「g」或朝右的「p」搞混。' },
  { num: 14, upper: 'L', lower: 'l', tip: '大寫「L」一豎一橫；小寫「l」是一條直線（注意不要寫成數字 1 或小寫「i」）。' },
  { num: 15, upper: 'H', lower: 'h', tip: '大寫「H」兩直一橫；小寫「h」左邊高高一豎往下後再畫一個拱門，記得左柱要夠長才不會像「n」。' },
];

const PHONEMIC_SPEC = [
  { num: 16, ans: 0, label: 'O', desc: '本題官方公布答案為 (1) O，表示兩個單字開頭的子音發音相同。' },
  { num: 17, ans: 0, label: 'O', desc: '本題官方公布答案為 (1) O，表示兩個單字開頭的起始音相同。' },
  { num: 18, ans: 1, label: 'X', desc: '本題官方公布答案為 (2) X，表示兩個單字開頭的發音不同。' },
  { num: 19, ans: 0, label: 'O', desc: '本題官方公布答案為 (1) O，表示兩個單字開頭的起始音相同。' },
  { num: 20, ans: 1, label: 'X', desc: '本題官方公布答案為 (2) X，表示兩個單字開頭的發音不同。' },
  { num: 21, ans: 0, label: 'O', desc: '本題官方公布答案為 (1) O，表示兩個單字開頭的起始音相同。' },
];

const DIALOGUE_SPEC = [
  {
    num: 22,
    ans: 2,
    concept: '聽辨生活常用語與情境圖（第 22 題）',
    steps: [
      '仔細反覆聆聽上方官方聽力音檔（共播出 3 遍），抓住句中關鍵動詞或情境人物的動作。',
      '比較圖卡差異：圖 (1)、圖 (2) 與圖 (3) 的動作和表情不同。',
      '對照教育部官方答案卷，第 22 題正確圖片選項為 (3)。',
    ],
  },
  {
    num: 23,
    ans: 0,
    concept: '聽辨生活常用語與情境圖（第 23 題）',
    steps: [
      '點擊聽力音檔聽 3 遍，注意說話者描述的日常活動或教室用語。',
      '觀察三張圖片中人物正在做的動作，找出完全符合句意的情境圖。',
      '對照教育部官方答案卷，第 23 題正確圖片選項為 (1)。',
    ],
  },
  {
    num: 24,
    ans: 2,
    concept: '聽辨生活常用語與情境圖（第 24 題）',
    steps: [
      '聆聽音檔中的人物對話與關鍵名詞、動作。',
      '逐一排除不符合圖片情景的選項，鎖定最貼合的一張。',
      '對照教育部官方答案卷，第 24 題正確圖片選項為 (3)。',
    ],
  },
  {
    num: 25,
    ans: 2,
    concept: '聽辨教室指令與動作圖（第 25 題）',
    steps: [
      '注意聽句子裡的關鍵物品與開關動作（如打開箱子、合上課本或打開課本）。',
      '對照三張圖片箭頭方向：圖 (1) 打開盒子、圖 (2) 合上書本、圖 (3) 打開書本。',
      '對照教育部官方答案卷，第 25 題正確圖片選項為 (3)。',
    ],
  },
];

export const PRIORI_114_ENGLISH_G3_QUESTIONS = [
  ...ALPHABET_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'alphabet-pair',
      questionImage: `/assets/priori/114/eng-g3/q${qStr}.webp`,
      figureImage: null,
      questionText: `第一部分：聽寫字母（第 ${item.num} 題）\n請先點擊上方音檔聆聽字母（共唸 3 遍），再於下方四線格填入對應的大寫與小寫字母。`,
      options: [],
      optionLabels: [],
      expectedUpper: item.upper,
      expectedLower: item.lower,
      answer: `${item.upper}, ${item.lower}`,
      media: {
        audioSrc: `/audio/priori/114/eng-g3/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽寫測驗，請先點擊官方聽力音檔按鈕，再寫出聽到的大寫與小寫英文字母。`,
      optionTtsTexts: [],
      conceptTitle: `聽音寫大小寫字母（${item.upper}, ${item.lower}）`,
      curriculumCode: 'Ab-II-1',
      prioriCode: 'ENG-A-3-1',
      explanationSteps: [
        '先點擊聽力音檔重聽 3 遍的字母名稱發音，確認是哪一個英文字母。',
        item.tip,
        `官方標準答案：大寫寫「${item.upper}」、小寫寫「${item.lower}」（寫作 ${item.upper}, ${item.lower}）。`,
      ],
    };
  }),

  ...PHONEMIC_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/114/eng-g3/q${qStr}.webp`,
      figureImage: null,
      questionText: `第二部分（一）聽辨語音（第 ${item.num} 題）\n請仔細聽音檔中的兩個單字：兩個字開始的音一樣請選「O」，不一樣請選「X」。`,
      options: ['O（兩個字開始的音一樣）', 'X（兩個字開始的音不一樣）'],
      optionLabels: ['(1)', '(2)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/114/eng-g3/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽辨語音，請點擊官方聽力音檔。如果兩個單字開頭的音一樣請選圓圈，不一樣請選叉叉。`,
      optionTtsTexts: [
        '選項一，圓圈，兩個字開始的音一樣',
        '選項二，叉叉，兩個字開始的音不一樣',
      ],
      conceptTitle: '聽辨單字起始音（Phonemic Awareness）',
      curriculumCode: 'Aa-II-2',
      prioriCode: 'ENG-P-3-1',
      explanationSteps: [
        '把音檔重播一次，專注聽每個單字「第一個發出的嘴型與聲音」，先不管字尾怎麼念。',
        '分辨兩個單字的起首音屬於同一組母音／子音，還是不同的兩個音。',
        item.desc,
      ],
    };
  }),

  ...DIALOGUE_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-114-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/114/eng-g3/q${qStr}.webp`,
      figureImage: `/assets/priori/114/eng-g3/q${qStr}_fig.webp`,
      questionText: `第二部分（二）聽辨常用語（第 ${item.num} 題）\n請先播放官方聽力句子（共 3 遍），再依左邊圖片選出最適合的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      optionLabels: ['(1)', '(2)', '(3)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/114/eng-g3/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽辨常用語，請點擊官方聽力音檔，再選出最符合意思的圖片編號。`,
      optionTtsTexts: ['選項一，圖片一', '選項二，圖片二', '選項三，圖片三'],
      conceptTitle: item.concept,
      curriculumCode: 'Ac-II-3',
      prioriCode: 'ENG-L-3-1',
      explanationSteps: item.steps,
    };
  }),
];
