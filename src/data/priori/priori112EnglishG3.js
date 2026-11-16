export const PRIORI_112_ENGLISH_G3_META = {
  paperId: '112-english-g3',
  examSeries: 'priori',
  year: 112,
  subject: 'english',
  subjectLabel: '英語科',
  grade: 3,
  gradeLabel: '三年級',
  title: '112 年篩選測驗 三年級英語科',
  subtitle: '教育部國教署基本學習內容標準化評量・原卷 25 題（全卷含官方聽力原音：字母聽寫 15 題＋聽辨 10 題）',
  totalQuestions: 25,
  pointsPerQuestion: 4,
  totalPoints: 100,
  answerSource: 'official_pdf',
  answerSourceNote:
    '本卷試題、標準答案與全卷 25 段官方聽力音檔皆核對自教育部國教署「112 年篩選測驗英語科 3 年級試卷答案卷」官方公布版；第 1～15 題採用大小寫雙格互動點選與即時批改機制，全卷 25 題皆支援線上自動批改。',
  officialAnswerVerified: true,
  publicLicenseVerified: false,
  hasOriginalPhonetics: true,
};

const BASE_META = {
  paperId: '112-english-g3',
  examSeries: 'priori',
  year: 112,
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
  { num: 1, upper: 'U', lower: 'u', tip: 'U 的大寫與小寫同為開口向上的杯狀圓弧，小寫 u 右下多一短豎筆，讀作長音 you。' },
  { num: 2, upper: 'Y', lower: 'y', tip: 'Y 讀作 wai，大寫 Y 站在基準線上，小寫 y 的長尾巴則向下延伸超過基準線。' },
  { num: 3, upper: 'I', lower: 'i', tip: 'I 讀作雙母音 ai，注意小寫 i 上方有一點，不要和讀作長音 ee 的字母 E 混淆。' },
  { num: 4, upper: 'F', lower: 'f', tip: 'F 讀作 ef，收音時上齒輕觸下唇送氣，小寫 f 上方有彎鉤且中間有一橫筆。' },
  { num: 5, upper: 'D', lower: 'd', tip: 'D 讀作 dee，注意小寫 d 的圓肚在左下方，不要與圓肚在右下方的 b 搞混。' },
  { num: 6, upper: 'L', lower: 'l', tip: 'L 讀作 el，收音時舌尖輕頂上齒齦，小寫 l 為一條長直豎線。' },
  { num: 7, upper: 'P', lower: 'p', tip: 'P 讀作 pee，小寫 p 的圓圈在右上側、直豎筆向下延伸，不要與圓圈在左邊的 q 搞混。' },
  { num: 8, upper: 'H', lower: 'h', tip: 'H 讀作 aitch，注意小寫 h 左側有一條向上伸展的長豎線，不要寫成短豎線的 n。' },
  { num: 9, upper: 'R', lower: 'r', tip: 'R 讀作 ar，尾音自然卷舌，大寫 R 與小寫 r 外型差異較大需熟記。' },
  { num: 10, upper: 'N', lower: 'n', tip: 'N 讀作 en，舌尖頂住上齒齦發鼻音，小寫 n 只有一個拱門，不要與雙拱門的 m 混淆。' },
  { num: 11, upper: 'S', lower: 's', tip: 'S 讀作 es，大寫與小寫皆為流暢的彎曲蛇形線條，只有高度大小差別。' },
  { num: 12, upper: 'Z', lower: 'z', tip: 'Z 讀作 zee，大寫與小寫造型相同、僅有大小高度不同。' },
  { num: 13, upper: 'G', lower: 'g', tip: 'G 讀作 jee，注意與字母 J 區分，且小寫 g 下方有圓弧彎鉤向下延伸。' },
  { num: 14, upper: 'E', lower: 'e', tip: 'E 讀作長母音 ee，注意與讀作 ai 的字母 I 區分，小寫 e 在中間格一筆連成。' },
  { num: 15, upper: 'Q', lower: 'q', tip: 'Q 讀作 kyoo，小寫 q 的圓圈在左上方且長尾巴向下延伸，不要與 p 或 g 混淆。' },
];

const PHONEMIC_SPEC = [
  {
    num: 16,
    ans: 0,
    desc: '官方音檔中的兩個單字開頭子音完全相同，起始嘴型與發音一致，因此選 (1) O。',
  },
  {
    num: 17,
    ans: 1,
    desc: '官方音檔中的兩個單字開頭子音不同，第一個發出的子音明顯有別，因此選 (2) X。',
  },
  {
    num: 18,
    ans: 1,
    desc: '官方音檔中的兩個單字開頭子音不同，起始發音不一致，因此選 (2) X。',
  },
  {
    num: 19,
    ans: 0,
    desc: '官方音檔中的兩個單字都由同一個子音開頭，起首音相同，因此選 (1) O。',
  },
  {
    num: 20,
    ans: 0,
    desc: '官方音檔中的兩個單字開頭子音相同，起始發音一致，因此選 (1) O。',
  },
  {
    num: 21,
    ans: 1,
    desc: '官方音檔中的兩個單字開頭子音不同，起始發音不一致，因此選 (2) X。',
  },
];

const DIALOGUE_SPEC = [
  {
    num: 22,
    ans: 1,
    concept: '聽辨日常提醒與安靜指令（Be quiet.）',
    steps: [
      '先播放官方聽力音檔，聽辨題目念出的日常指令（Be quiet. 請安靜）。',
      '觀察三張圖片：圖 (1) 指著桌上的蛋糕點心；圖 (2) 有人在床上睡覺，旁邊的人把食指放在嘴唇前示意保持安靜；圖 (3) 在戶外指著天上的風箏。',
      '最符合「請安靜」情境的是圖片 (2)，選 (2)。',
    ],
  },
  {
    num: 23,
    ans: 2,
    concept: '聽辨課堂指示動詞（Listen.）',
    steps: [
      '先播放官方聽力音檔，題目念出課堂指令 "Listen."（仔細聽）。',
      '比較三張圖的動作：圖 (1) 男孩伸手指向天空的星星；圖 (2) 男孩雙手抱胸站立；圖 (3) 男孩將手掌貼近耳朵旁做專心傾聽的動作。',
      '符合「仔細聽」動作的是圖片 (3)，選 (3)。',
    ],
  },
  {
    num: 24,
    ans: 0,
    concept: '聽辨動作指令（Sit down.）',
    steps: [
      '先播放官方聽力音檔，題目念出常用動作指令 "Sit down."（坐下）。',
      '看三張圖中小狗的動作：圖 (1) 男孩手勢向下、小狗乖乖坐下；圖 (2) 男孩手向上舉、小狗後腳站立；圖 (3) 小狗四腳朝天躺在地上。',
      '符合「坐下」動作的是圖片 (1)，選 (1)。',
    ],
  },
  {
    num: 25,
    ans: 0,
    concept: '聽辨日常時間問候語（Good morning.）',
    steps: [
      '先播放官方聽力音檔，注意聽問候語對應的時段（Good morning. 早安）。',
      '觀察三張圖的背景線索：圖 (1) 天空掛著明亮的太陽，代表白天早晨問候；圖 (2) 背景是夜晚的月亮與星星；圖 (3) 是不小心弄倒物品向對方道歉的情境。',
      '符合早晨問候情境的是圖片 (1)，選 (1)。',
    ],
  },
];

export const PRIORI_112_ENGLISH_G3_QUESTIONS = [
  ...ALPHABET_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-112-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'alphabet-pair',
      questionImage: `/assets/priori/112/eng-g3/q${qStr}.webp`,
      figureImage: null,
      questionText: `第一部分：聽寫字母（第 ${item.num} 題）\n請先點擊官方聽力播放按鈕，並於下方分別點選聽到的大寫與小寫字母。`,
      options: [],
      optionLabels: [],
      expectedUpper: item.upper,
      expectedLower: item.lower,
      answer: `${item.upper}, ${item.lower}`,
      media: {
        audioSrc: `/audio/priori/112/eng-g3/q${qStr}.mp3`,
        audioSourceType: 'official_mp3',
      },
      ttsText: `第 ${item.num} 題聽寫測驗，請先點擊官方聽力音檔按鈕，再點選聽到的大寫與小寫英文字母。`,
      optionTtsTexts: [],
      conceptTitle: '聽音辨認大小寫英文字母',
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
      id: `priori-112-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/112/eng-g3/q${qStr}.webp`,
      figureImage: null,
      questionText: `第二部分（一）聽辨語音（第 ${item.num} 題）\n請仔細聽音檔中的兩個單字：兩個字開始的音一樣請選「O」，不一樣請選「X」。`,
      options: ['O（兩個字開始的音一樣）', 'X（兩個字開始的音不一樣）'],
      optionLabels: ['(1)', '(2)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/112/eng-g3/q${qStr}.mp3`,
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
        '分辨兩個單字的起首音屬於同一組發音，還是不同的兩個音。',
        item.desc,
      ],
    };
  }),

  ...DIALOGUE_SPEC.map((item) => {
    const qStr = String(item.num).padStart(2, '0');
    return {
      ...BASE_META,
      id: `priori-112-eng-g3-q${qStr}`,
      number: item.num,
      questionType: 'single-choice',
      questionImage: `/assets/priori/112/eng-g3/q${qStr}.webp`,
      figureImage: `/assets/priori/112/eng-g3/q${qStr}_fig.webp`,
      questionText: `第二部分（二）聽辨常用語（第 ${item.num} 題）\n請先播放官方聽力句子（共 3 遍），再依左邊圖片選出最適合的圖片編號。`,
      options: ['圖片 (1)', '圖片 (2)', '圖片 (3)'],
      optionLabels: ['(1)', '(2)', '(3)'],
      answer: item.ans,
      media: {
        audioSrc: `/audio/priori/112/eng-g3/q${qStr}.mp3`,
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
