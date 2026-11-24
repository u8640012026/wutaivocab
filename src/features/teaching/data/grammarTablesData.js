/**
 * 國小英語十大視覺化文法統整表 (Books 1-8 Here We Go 課綱連動)
 *
 * 將課本各單元零散的文法角落框整理成 10 張直覺易讀的視覺對照表，
 * 搭配朗朗上口的記誦口訣、色塊詞性標示與可點讀例句。
 */

export const GRAMMAR_ROLE_STYLES = {
  wh: {
    labelZh: '疑問詞',
    labelEn: 'Wh-Word',
    chipClass: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-700',
    cellClass: 'bg-purple-50/80 text-purple-900 dark:bg-purple-950/35 dark:text-purple-200',
  },
  subject: {
    labelZh: '主詞',
    labelEn: 'Subject',
    chipClass: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-700',
    cellClass: 'bg-sky-50/80 text-sky-900 dark:bg-sky-950/35 dark:text-sky-200',
  },
  verb: {
    labelZh: '動詞／助動詞',
    labelEn: 'Verb / Aux',
    chipClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700',
    cellClass: 'bg-rose-50/80 text-rose-900 dark:bg-rose-950/35 dark:text-rose-200 font-bold',
  },
  object: {
    labelZh: '名詞／形容詞',
    labelEn: 'Complement',
    chipClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700',
    cellClass: 'bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/35 dark:text-emerald-200',
  },
  prep: {
    labelZh: '介系詞／時間',
    labelEn: 'Prep / Time',
    chipClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700',
    cellClass: 'bg-amber-50/80 text-amber-900 dark:bg-amber-950/35 dark:text-amber-200',
  },
  note: {
    labelZh: '重點說明',
    labelEn: 'Note',
    chipClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
    cellClass: 'bg-slate-50/80 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300',
  },
};

export const ELEMENTARY_GRAMMAR_TABLES = [
  {
    id: 'be_verbs',
    titleZh: '1. Be 動詞家族 (am / is / are)',
    titleEn: '1. Verb To Be (am / is / are)',
    subtitleZh: '說明「是、在、怎麼樣（心情／外觀）」',
    icon: 'puzzle',
    mnemonicZh: '口訣：I 配 am，You 配 are；is 跟著他她它（he / she / it）；複數統統用 are！',
    linkedBooks: ['1', '2', '3'],
    primaryUnitIds: ['1-0', '1-2', '2-4', '3-0', '3-1', '3-2', '5-1', '7-1'],
    linkedUnitIds: ['1-0', '1-1', '1-2', '1-3', '1-4', '2-1', '2-3', '2-4', '3-0', '3-1', '3-2', '4-1', '4-3', '4-4', '5-1', '7-1', '8-3', '8-4'],
    columns: [
      { key: 'subj', labelZh: '主詞', labelEn: 'Subject', role: 'subject' },
      { key: 'be', labelZh: 'Be 動詞', labelEn: 'Be', role: 'verb' },
      { key: 'short', labelZh: '縮寫', labelEn: 'Short', role: 'verb' },
      { key: 'neg', labelZh: '否定', labelEn: 'Negative', role: 'verb' },
      { key: 'tip', labelZh: '適用對象', labelEn: 'Rule', role: 'note' },
    ],
    rows: [
      { subj: 'I', be: 'am', short: "I'm", neg: "I'm not", tip: '我自己（第一人稱單數）' },
      { subj: 'You', be: 'are', short: "You're", neg: "You aren't", tip: '你 / 你們' },
      { subj: 'He / She / It', be: 'is', short: "He's / She's / It's", neg: "isn't", tip: '第三人稱單數（1人 / 1物）' },
      { subj: 'We / They', be: 'are', short: "We're / They're", neg: "aren't", tip: '複數（2人或2物以上）' },
    ],
    examples: [
      { en: 'I am happy.', zh: '我很開心。', highlight: 'am' },
      { en: "She's a student.", zh: '她是一位學生。', highlight: "She's" },
      { en: 'Are they lions?', zh: '牠們是獅子嗎？', highlight: 'Are' },
    ],
  },
  {
    id: 'pronouns_possessives',
    titleZh: '2. 人稱代名詞與所有格',
    titleEn: '2. Pronouns & Possessives',
    subtitleZh: '分清楚「我 / 我的」、「他 / 他的」',
    icon: 'users',
    mnemonicZh: '口訣：主詞放句首做動作；所有格「的」後面一定接名詞！',
    linkedBooks: ['1', '2', '6', '8'],
    primaryUnitIds: ['1-1', '2-3', '6-1', '6-4', '7-0', '8-4'],
    linkedUnitIds: ['1-1', '1-2', '2-3', '6-1', '6-4', '7-0', '8-4'],
    columns: [
      { key: 'subj', labelZh: '主格（誰）', labelEn: 'Subject', role: 'subject' },
      { key: 'poss', labelZh: '所有格（誰的）', labelEn: 'Possessive', role: 'object' },
      { key: 'meaning', labelZh: '中文意思', labelEn: 'Meaning', role: 'note' },
      { key: 'phrase', labelZh: '名詞搭配', labelEn: 'With Noun', role: 'prep' },
    ],
    rows: [
      { subj: 'I', poss: 'my', meaning: '我 / 我的', phrase: 'my name / my book' },
      { subj: 'you', poss: 'your', meaning: '你 / 你的', phrase: 'your bag / your pen' },
      { subj: 'he', poss: 'his', meaning: '他 / 他的', phrase: 'his father / his bike' },
      { subj: 'she', poss: 'her', meaning: '她 / 她的', phrase: 'her mother / her dress' },
      { subj: 'it', poss: 'its', meaning: '牠 / 牠的', phrase: 'its tail / its ears' },
      { subj: 'we / they', poss: 'our / their', meaning: '我們 / 他們的', phrase: 'our school / their pets' },
    ],
    examples: [
      { en: 'What is your name?', zh: '你叫什麼名字？', highlight: 'your' },
      { en: 'My name is Mia.', zh: '我的名字是 Mia。', highlight: 'My' },
      { en: 'He is my brother.', zh: '他是我的哥哥。', highlight: 'He / my' },
    ],
  },
  {
    id: 'plurals_articles',
    titleZh: '3. 冠詞 a / an 與名詞單複數',
    titleEn: '3. Articles (a/an) & Plurals',
    subtitleZh: '單數可數名詞才用 a / an，複數記得加 s / es',
    icon: 'apple',
    mnemonicZh: '口訣：只有「單數可數名詞」才能配 a/an！要依字首「開頭發音」（母音音素用 an、子音音素用 a）而非只看拼字！',
    linkedBooks: ['1', '2', '3'],
    primaryUnitIds: ['1-3', '2-0', '2-1', '3-3'],
    linkedUnitIds: ['1-0', '1-3', '2-0', '2-1', '3-3', '5-4', '6-0', '8-3'],
    columns: [
      { key: 'type', labelZh: '規則分類', labelEn: 'Rule', role: 'wh' },
      { key: 'pattern', labelZh: '使用條件與句構', labelEn: 'Pattern', role: 'verb' },
      { key: 'sample', labelZh: '單複數範例', labelEn: 'Examples', role: 'object' },
      { key: 'tip', labelZh: '記憶小提醒', labelEn: 'Tip', role: 'note' },
    ],
    rows: [
      { type: 'a + 子音音素開頭', pattern: 'a + 單數可數名詞', sample: 'a book, a dog, a uniform', tip: '依讀音決定：字首唸出子音（含 [j] 開頭）用 a' },
      { type: 'an + 母音音素開頭', pattern: 'an + 單數可數名詞', sample: 'an apple, an eraser, an hour', tip: '依讀音決定：字首唸出母音音素（如靜音 h 的 hour）用 an' },
      { type: '一般複數 + s', pattern: '複數可數名詞 + s（不加 a/an）', sample: 'cats, apples, pencils', tip: '兩個以上可數名詞直接使用複數' },
      { type: 's/x/ch/sh/o + es', pattern: '名詞 + es', sample: 'boxes, buses, watches', tip: '擦音尾音要多加 e 再加 s' },
      { type: '指示代名詞', pattern: 'this/that ↔ these/those', sample: 'this cat ↔ these cats', tip: '近 this/these；遠 that/those' },
    ],
    examples: [
      { en: 'It is an apple.', zh: '它是一顆蘋果。', highlight: 'an apple' },
      { en: 'They are three lions.', zh: '牠們是三隻獅子。', highlight: 'three lions' },
      { en: 'What are these?', zh: '這些是什麼？', highlight: 'these' },
    ],
  },
  {
    id: 'present_continuous',
    titleZh: '4. 現在進行式 (Be + V-ing)',
    titleEn: '4. Present Continuous (Be + V-ing)',
    subtitleZh: '表達「此時此刻正在做某事」',
    icon: 'activity',
    mnemonicZh: '口訣：現在進行兩兄弟「Be 動詞＋V-ing」缺一不可！Wh- 問做什麼回答動作；Yes/No 問句 Be 往前搬！',
    linkedBooks: ['4', '5'],
    primaryUnitIds: ['4-2', '5-0', '5-3'],
    linkedUnitIds: ['4-2', '5-0', '5-3'],
    columns: [
      { key: 'kind', labelZh: '句型', labelEn: 'Form', role: 'wh' },
      { key: 'formula', labelZh: '結構公式', labelEn: 'Formula', role: 'verb' },
      { key: 'ving', labelZh: '拼寫與問答規則', labelEn: 'Rule & Answer', role: 'object' },
    ],
    rows: [
      { kind: '肯定句', formula: '主詞 + am / is / are + V-ing', ving: '直接加 ing：read → reading, eat → eating' },
      { kind: '去 e 加 ing', formula: '字尾不發音 e 去掉 + ing', ving: 'write → writing, dance → dancing, ride → riding' },
      { kind: '重複字尾 + ing', formula: '短母音+單子音 → 重複字尾 + ing', ving: 'run → running, swim → swimming, shop → shopping' },
      { kind: 'Wh- 疑問句', formula: 'What / Where + am/is/are + 主詞 + V-ing?', ving: '完整回答動詞動作：I am reading. / She is going to school.' },
      { kind: 'Yes/No 疑問句', formula: 'Am / Is / Are + 主詞 + V-ing?', ving: "簡答：Yes, 主詞 + am/is/are. / No, 主詞 + isn't/aren't." },
    ],
    examples: [
      { en: 'What are you doing?', zh: '你正在做什麼？', highlight: 'are ... doing' },
      { en: 'I am reading a book.', zh: '我正在讀書。', highlight: 'am reading' },
      { en: 'She is swimming now.', zh: '她現在正在游泳。', highlight: 'is swimming' },
    ],
  },
  {
    id: 'modal_can',
    titleZh: '5. 情態助動詞 Can（能夠／會）',
    titleEn: '5. Modal Verb Can (Ability)',
    subtitleZh: '表示能力或請求，後面接原形動詞',
    icon: 'shield',
    mnemonicZh: '口訣：Can 是大老闆，人稱不分我你他，後面動詞打回「原形」（不加 s / ing）！',
    linkedBooks: ['2'],
    primaryUnitIds: ['2-2'],
    linkedUnitIds: ['2-2', '6-1'],
    columns: [
      { key: 'type', labelZh: '句型', labelEn: 'Type', role: 'wh' },
      { key: 'pattern', labelZh: '句型結構', labelEn: 'Structure', role: 'verb' },
      { key: 'note', labelZh: '重要規則', labelEn: 'Key Point', role: 'note' },
    ],
    rows: [
      { type: '肯定句', pattern: '主詞 + can + 原形動詞', note: '任何人稱都用 can，動詞不變化' },
      { type: '否定句', pattern: "主詞 + can't (cannot) + 原形動詞", note: "縮寫 can't，口氣「不會／不能」" },
      { type: '疑問句', pattern: 'Can + 主詞 + 原形動詞 ...?', note: 'Can 移到句首問能力或請求' },
      { type: '肯定 / 否定簡答', pattern: "Yes, 主詞 can. / No, 主詞 can't.", note: '用對人稱代名詞回答' },
    ],
    examples: [
      { en: 'Can you swim?', zh: '你會游泳嗎？', highlight: 'Can ... swim' },
      { en: 'Yes, I can dance and sing.', zh: '會的，我會跳舞和唱歌。', highlight: 'can dance' },
      { en: "He can't ride a bike.", zh: '他不會騎腳踏車。', highlight: "can't ride" },
    ],
  },
  {
    id: 'do_does_present',
    titleZh: '6. 現在簡單式與 Do / Does',
    titleEn: '6. Simple Present (Do / Does)',
    subtitleZh: '詢問與表達「習慣、喜好、經常做的事」',
    icon: 'zap',
    mnemonicZh: '口訣：一般動詞找幫手 do / does！三單（he/she/it）用 does，幫手一出現，後面動詞回原形！',
    linkedBooks: ['3', '5', '6', '7'],
    primaryUnitIds: ['3-4', '4-0', '5-2', '5-4', '6-2', '7-2', '7-3', '7-4', '8-0'],
    linkedUnitIds: ['3-3', '3-4', '4-0', '5-2', '5-4', '6-2', '7-2', '7-3', '7-4', '8-0'],
    columns: [
      { key: 'subj', labelZh: '主詞群組', labelEn: 'Subject', role: 'subject' },
      { key: 'pos', labelZh: '肯定句動詞', labelEn: 'Affirmative', role: 'verb' },
      { key: 'q', labelZh: '疑問句助動詞', labelEn: 'Question', role: 'wh' },
      { key: 'neg', labelZh: '否定句', labelEn: 'Negative', role: 'object' },
    ],
    rows: [
      { subj: 'I / You / We / They / 複數', pos: '原形動詞 (like / have)', q: 'Do + 主詞 + 原形V?', neg: "don't + 原形動詞" },
      { subj: 'He / She / It / 單數名詞', pos: '動詞 + s/es (likes / has)', q: 'Does + 主詞 + 原形V?', neg: "doesn't + 原形動詞" },
      { subj: '照妖鏡提醒', pos: '肯定句三單才加 s', q: 'Does 已拿走 s！後面回原形', neg: "doesn't 後面動詞要回原形！" },
    ],
    examples: [
      { en: 'Do you like apples?', zh: '你喜歡蘋果嗎？', highlight: 'Do ... like' },
      { en: 'Does she have a fever?', zh: '她發燒了嗎？', highlight: 'Does ... have' },
      { en: 'He likes math very much.', zh: '他非常喜歡數學。', highlight: 'likes' },
    ],
  },
  {
    id: 'wh_questions',
    titleZh: '7. 疑問詞家族 (5W1H)',
    titleEn: '7. Wh- Question Words',
    subtitleZh: '問對疑問詞，就能找對答案',
    icon: 'help',
    mnemonicZh: '口訣：What 問事物、Who 問人、Where 問地點、When/What time 問時間、How 問方法與價錢！',
    linkedBooks: ['1', '4', '5', '6', '7', '8'],
    primaryUnitIds: ['1-4', '4-1', '4-3', '6-3', '8-3', '8-4'],
    linkedUnitIds: ['1-1', '1-2', '1-3', '1-4', '2-2', '2-3', '3-1', '3-3', '4-1', '4-2', '4-3', '4-4', '5-1', '5-3', '5-4', '6-0', '6-1', '6-3', '6-4', '7-1', '7-2', '7-3', '7-4', '8-0', '8-1', '8-2', '8-3', '8-4'],
    columns: [
      { key: 'wh', labelZh: '疑問詞', labelEn: 'Wh-Word', role: 'wh' },
      { key: 'ask', labelZh: '詢問重點', labelEn: 'Asks About', role: 'note' },
      { key: 'sampleQ', labelZh: '課本常見問句', labelEn: 'Question', role: 'verb' },
      { key: 'sampleA', labelZh: '回答關鍵詞', labelEn: 'Answer Key', role: 'object' },
    ],
    rows: [
      { wh: 'What', ask: '什麼（物品／活動）', sampleQ: 'What is this? / What day is today?', sampleA: "It's a ruler. / It's Monday." },
      { wh: 'What time', ask: '幾點幾分', sampleQ: 'What time is it?', sampleA: "It's eight thirty." },
      { wh: 'Who', ask: '誰（人物／關係）', sampleQ: 'Who is he?', sampleA: 'He is my father.' },
      { wh: 'Where', ask: '在哪裡（地點）', sampleQ: 'Where are you going?', sampleA: "I'm going to the park." },
      { wh: 'How / How much', ask: '怎麼去 / 多少錢', sampleQ: 'How do you go to school?', sampleA: 'By bus. / One hundred dollars.' },
    ],
    examples: [
      { en: 'What time is it?', zh: '現在幾點了？', highlight: 'What time' },
      { en: 'Where is the post office?', zh: '郵局在哪裡？', highlight: 'Where' },
      { en: 'How much is this T-shirt?', zh: '這件 T 恤多少錢？', highlight: 'How much' },
    ],
  },
  {
    id: 'prepositions_place_transport',
    titleZh: '8. 方位、時間與交通介系詞',
    titleEn: '8. Prepositions (Place / Time / Transport)',
    subtitleZh: 'in / on / under / by / at 一表分清楚',
    icon: 'compass',
    mnemonicZh: '口訣：in 在裡面、on 在上面、under 在下面；交通工具幾乎都用 by，只有走路是 on foot！',
    linkedBooks: ['4', '5', '7'],
    primaryUnitIds: ['4-3', '4-4', '5-3', '7-2', '7-4'],
    linkedUnitIds: ['4-3', '4-4', '5-0', '5-2', '5-3', '7-2', '7-3', '7-4', '8-1', '8-4'],
    columns: [
      { key: 'cat', labelZh: '類別', labelEn: 'Category', role: 'wh' },
      { key: 'prep', labelZh: '介系詞', labelEn: 'Preposition', role: 'prep' },
      { key: 'use', labelZh: '使用說明', labelEn: 'Usage', role: 'note' },
      { key: 'ex', labelZh: '搭配片語', labelEn: 'Phrases', role: 'object' },
    ],
    rows: [
      { cat: '空間位置', prep: 'in / on / under / by', use: '裡面 / 上面 / 下面 / 旁邊', ex: 'in the box, on the desk, under the chair' },
      { cat: '街區方位', prep: 'next to / in front of / behind', use: '隔壁 / 前面 / 後面', ex: 'next to the bank, behind the school' },
      { cat: '時間點與星期', prep: 'at + 時間 / on + 星期 / in + 季節・早午晚', use: '小點 at、星期日期 on、季節或大段時間 in', ex: 'at 7:30, on Sunday, in fall / in the morning' },
      { cat: '交通方式', prep: 'by + 交通工具 / on foot', use: 'by 後面直接加單數名詞（不加 the/a）', ex: 'by bus, by MRT, by bike, on foot' },
    ],
    examples: [
      { en: 'The cat is under the chair.', zh: '貓咪在椅子下面。', highlight: 'under' },
      { en: 'I go to school by bus.', zh: '我搭公車去上學。', highlight: 'by bus' },
      { en: 'We have PE class on Friday.', zh: '我們星期五有體育課。', highlight: 'on Friday' },
    ],
  },
  {
    id: 'past_be_verbs',
    titleZh: '9. 過去式 Be 動詞 (was / were)',
    titleEn: '9. Past Simple Be (was / were)',
    subtitleZh: '說「昨天、上週、以前在哪裡或心情」',
    icon: 'clock',
    mnemonicZh: '口訣：am / is 過去變 was；are 的過去變 were！看到 yesterday / last 就變過去式！',
    linkedBooks: ['8'],
    primaryUnitIds: ['8-1'],
    linkedUnitIds: ['8-1'],
    columns: [
      { key: 'present', labelZh: '現在式', labelEn: 'Present', role: 'note' },
      { key: 'past', labelZh: '過去式 Be', labelEn: 'Past Be', role: 'verb' },
      { key: 'neg', labelZh: '過去否定', labelEn: 'Negative', role: 'verb' },
      { key: 'time', labelZh: '常見過去時間詞', labelEn: 'Time Signal', role: 'prep' },
    ],
    rows: [
      { present: 'I am / He is / She is / It is', past: 'was', neg: "wasn't (was not)", time: 'yesterday 昨天' },
      { present: 'You are / We are / They are', past: 'were', neg: "weren't (were not)", time: 'last night / last week 昨晚/上週' },
      { present: '疑問句：Be 動詞移到主詞前', past: 'Were you ...? / Was he ...?', neg: 'Yes, I was. / No, we weren\'t.', time: 'two days ago 兩天前' },
    ],
    examples: [
      { en: 'Where were you yesterday?', zh: '你昨天在哪裡？', highlight: 'were ... yesterday' },
      { en: 'I was at home.', zh: '我在家。', highlight: 'was' },
      { en: 'The weather was sunny last Sunday.', zh: '上週日天氣很晴朗。', highlight: 'was ... last Sunday' },
    ],
  },
  {
    id: 'past_action_did',
    titleZh: '10. 過去式一般動詞 (V-ed / Did)',
    titleEn: '10. Past Simple Action Verbs (V-ed / Did)',
    subtitleZh: '表達「過去做過什麼動作」，包含規則與常見不規則動詞',
    icon: 'scroll',
    mnemonicZh: '口訣：一般過去動詞加 ed，常用不規則另外背；疑問否定找 did 幫手，後面動詞回原形！',
    linkedBooks: ['8'],
    primaryUnitIds: ['8-2'],
    linkedUnitIds: ['8-2'],
    columns: [
      { key: 'kind', labelZh: '變化類型', labelEn: 'Pattern', role: 'wh' },
      { key: 'base', labelZh: '原形 → 過去式', labelEn: 'Base → Past', role: 'verb' },
      { key: 'rule', labelZh: '句型規則', labelEn: 'Rule', role: 'object' },
    ],
    rows: [
      { kind: '規則動詞 (+ed / +d)', base: 'play → played / watch → watched / dance → danced', rule: '肯定句直接用過去式動詞' },
      { kind: '子音+y 去 y +ied', base: 'study → studied / cry → cried', rule: 'y 前面是子音才去 y 加 ied' },
      { kind: '常用不規則動詞', base: 'go → went / eat → ate / see → saw / do → did', rule: '課本高頻不規則字要特別熟記' },
      { kind: '疑問與否定 (did)', base: "Did + 主詞 + 原形V? / 主詞 + didn't + 原形V", rule: 'did 出馬，後面動詞一律變回原形！' },
    ],
    examples: [
      { en: 'What did you do yesterday?', zh: '你昨天做了什麼？', highlight: 'did ... do' },
      { en: 'I went to the zoo.', zh: '我去了動物園。', highlight: 'went' },
      { en: 'She watched TV last night.', zh: '她昨晚看了電視。', highlight: 'watched' },
    ],
  },
];

/**
 * 依據目前冊別與單元，找出最相關的文法表 ID 清單。
 * 優先排序本課核心聚焦文法 (primaryUnitIds)，其次為課綱關聯單元 (linkedUnitIds)，無單元對應時才退回冊別關聯。
 */
export function getRelevantGrammarTableIds(book, unit) {
  const safeBook = String(book ?? '');
  const safeUnit = String(unit ?? '');
  if (!safeBook || safeBook === 'free') return [];

  const unitKey = `${safeBook}-${safeUnit}`;
  const primaryMatches = ELEMENTARY_GRAMMAR_TABLES
    .filter((table) => Array.isArray(table.primaryUnitIds) && table.primaryUnitIds.includes(unitKey))
    .map((table) => table.id);

  const linkedMatches = ELEMENTARY_GRAMMAR_TABLES
    .filter((table) => Array.isArray(table.linkedUnitIds) && table.linkedUnitIds.includes(unitKey))
    .map((table) => table.id);

  const combinedExact = Array.from(new Set([...primaryMatches, ...linkedMatches]));
  if (combinedExact.length > 0) return combinedExact;

  return ELEMENTARY_GRAMMAR_TABLES
    .filter((table) => Array.isArray(table.linkedBooks) && table.linkedBooks.includes(safeBook))
    .map((table) => table.id);
}
