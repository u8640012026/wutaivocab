/**
 * Batch D (Books 7 & 8) 高品質題庫擴充建置腳本 (expand_batch_d_b7_b8.mjs)
 *
 * 嚴格遵守「七大命題鐵律」、V-MEAN 語境生活填空、R-COMP 字數規格 (30~50字)：
 * 1. Canonical 唯一性：每題皆為獨立原創題 (isCanonical: true)，scopes 長度 <= 2。
 * 2. 單一正解防呆：情境充足，正答唯一，排他性 100%。
 * 3. 性別中立防呆：明確人稱或情境，無性別線索時嚴禁同時出現 He/She 或 His/Her。
 * 4. 禁用萬用樣板句：6 個誘答必須同質同詞性，0 樣板句、0 縮寫撞車。
 * 5. 聽力防洩漏：L-WORD / L-RESP 統一固定題幹，逐字稿僅在 media.audioText。
 * 6. 詳解 100% 同步：具體說明正答理由與誘答錯誤原因。
 * 7. 靜態結構契約：7 選項、正答 answer: 0、挖空 ______、無雙句點。
 * 8. V-MEAN 語境填空：純生活語境英文句子挖空，選項僅限純英文單字/片語，嚴禁機械式翻譯題。
 * 9. R-COMP 短文字數：短文長度嚴格落於 30~50 字。
 *
 * 配比保證 (每冊 50 題，合計 100 題)：
 * L-WORD: 8, L-RESP: 8, V-MEAN: 10, G-MC: 10, G-CTX: 6, R-COMP: 8
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const mcqFilePath = path.join(projectRoot, 'src/data/hereWeGoMcqBank.js');
const mappingFilePath = path.join(projectRoot, 'src/data/exam/canonicalMapping.js');

const makeScopes = (unit) => {
  if (unit === 'Unit 1' || unit === 'Unit 2') return [unit, 'Review 1'];
  if (unit === 'Unit 3' || unit === 'Unit 4') return [unit, 'Review 2'];
  return [unit];
};

const FIXED_L_WORD_STEM = '【聽力：聽音選字】請聽英語發音，選出聽到的單字：';
const FIXED_L_RESP_STEM = '【聽力：聽問句選回應】請聽英語問句，選出最適合的回應句：';

const createItem = ({
  id,
  book,
  unit,
  section,
  taskType,
  difficulty = 2,
  audioText = null,
  question,
  options,
  explanation
}) => {
  const normalizedQuestion =
    taskType === 'L-WORD'
      ? FIXED_L_WORD_STEM
      : taskType === 'L-RESP'
        ? FIXED_L_RESP_STEM
        : question;

  return {
    id,
    track: 'textbook',
    book,
    unit,
    section,
    taskType,
    difficulty,
    reviewed: true,
    groupId: null,
    media: {
      audioText,
      imageId: null
    },
    question: normalizedQuestion,
    options,
    answer: 0,
    explanation,
    canonicalId: id,
    primaryScope: unit,
    scopes: makeScopes(unit),
    isCanonical: true
  };
};

// ============================================================================
// BOOK 7 NEW ITEMS (+50 Questions: Starter, Unit 1~4, Review 1~2, Festival)
// Exact TaskType Quota: L-WORD: 8, L-RESP: 8, V-MEAN: 10, G-MC: 10, G-CTX: 6, R-COMP: 8
// ============================================================================
const BOOK_7_NEW_ITEMS = [
  // --- Starter (Picnic Food, Drinks & Possessive Pronouns) ---
  createItem({
    id: 'hwg_b7_bd_01',
    book: 7,
    unit: 'Starter',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 1,
    question: 'It is sunny outside. Let us go to the park and have a ______ together.',
    options: ['picnic', 'shower', 'subway', 'fever', 'museum', 'station', 'temple'],
    explanation: '句意為「外面天氣晴朗，我們一起去公園野餐吧。」have a picnic 為「去野餐」，最符合情境。'
  }),
  createItem({
    id: 'hwg_b7_bd_02',
    book: 7,
    unit: 'Starter',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 1,
    question: 'A: ______ water bottle is this on the grass? B: Oh, it is mine.',
    options: ['Whose', 'Who', 'Where', 'How', 'What', 'When', 'Which'],
    explanation: '回答為「Oh, it is mine.（喔，是我的。）」，可知問句詢問物品是誰的，應使用疑問詞 Whose。'
  }),
  createItem({
    id: 'hwg_b7_bd_03',
    book: 7,
    unit: 'Starter',
    section: 'grammar',
    taskType: 'G-CTX',
    difficulty: 1,
    question: '在公園野餐時，你想有禮貌地詢問朋友「你要來點牛肉三明治嗎？」，應該怎麼問？',
    options: [
      'Would you like some beef sandwiches?',
      'Where do you go on weekends?',
      'What time do you take a shower?',
      'How do you go to the library?',
      'Are you from Singapore or India?',
      'Whose bicycle is under the tree?',
      'What does he do after school?'
    ],
    explanation: '有禮貌地詢問別人是否想吃某食物，標準句型為「Would you like some ...?」。'
  }),
  createItem({
    id: 'hwg_b7_bd_04',
    book: 7,
    unit: 'Starter',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 1,
    audioText: 'Would you like some orange juice?',
    options: [
      'Yes, please. Thank you!',
      'I go to school by bus.',
      'We are from Taiwan.',
      'He plays baseball at five.',
      'It is on the second floor.',
      'They are my new shoes.',
      'She goes to bed at ten.'
    ],
    explanation: '問句「Would you like some orange juice?（你要來點柳橙汁嗎？）」的禮貌肯定回答為「Yes, please. Thank you!」。'
  }),
  createItem({
    id: 'hwg_b7_bd_05',
    book: 7,
    unit: 'Starter',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「It is Sunday afternoon. Mia, Rocky, and Amber are having a picnic in the park. Mia brings two beef sandwiches. Amber brings cold apple juice. Rocky puts his blue cap on the chair, and everyone enjoys the sunny day happily.」請問 Amber 帶了什麼去野餐？',
    options: ['冰蘋果汁', '牛肉三明治', '起司漢堡', '熱蔬菜湯', '巧克力蛋糕', '檸檬紅茶', '鮮奶吐司'],
    explanation: '短文第 4 句寫到「Amber brings cold apple juice.（Amber 帶了冰蘋果汁）」，故選「冰蘋果汁」。'
  }),

  // --- Unit 1 (Countries & Origins) ---
  createItem({
    id: 'hwg_b7_bd_06',
    book: 7,
    unit: 'Unit 1',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'Singapore',
    options: ['Singapore', 'Australia', 'Taiwan', 'India', 'Japan', 'Spain', 'Egypt'],
    explanation: '聽力發音為國家名稱「Singapore（新加坡）」。'
  }),
  createItem({
    id: 'hwg_b7_bd_07',
    book: 7,
    unit: 'Unit 1',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'Australia',
    options: ['Australia', 'India', 'Singapore', 'Japan', 'Spain', 'Egypt', 'Taiwan'],
    explanation: '聽力發音為國家名稱「Australia（澳洲）」。'
  }),
  createItem({
    id: 'hwg_b7_bd_08',
    book: 7,
    unit: 'Unit 1',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'Where are you and your sister from?',
    options: [
      'We are from Taiwan.',
      'I go home by metro.',
      'They play the piano.',
      'It is six thirty now.',
      'Yes, I like beef curry.',
      'He is in the museum.',
      'She gets up at seven.'
    ],
    explanation: '問句問「Where are you and your sister from?（你和妹妹來自哪裡？）」，主詞為複數「你們」，故用「We are from Taiwan.」回答。'
  }),
  createItem({
    id: 'hwg_b7_bd_09',
    book: 7,
    unit: 'Unit 1',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'The Taj Mahal is a very famous building in ______. Many travelers visit it every year.',
    options: ['India', 'Japan', 'Spain', 'Taiwan', 'Singapore', 'Australia', 'Egypt'],
    explanation: '泰姬瑪哈陵（Taj Mahal）位於印度（India），為世界知名地標。'
  }),
  createItem({
    id: 'hwg_b7_bd_10',
    book: 7,
    unit: 'Unit 1',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'Sydney Opera House and cute koalas are famous sights in ______.',
    options: ['Australia', 'India', 'Spain', 'Japan', 'Taiwan', 'Egypt', 'Singapore'],
    explanation: '雪梨歌劇院（Sydney Opera House）與無尾熊（koalas）皆位於澳洲（Australia）。'
  }),
  createItem({
    id: 'hwg_b7_bd_11',
    book: 7,
    unit: 'Unit 1',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'A: ______ your new classmate from the UK? B: No, she is from Japan.',
    options: ['Is', 'Are', 'Am', 'Do', 'Does', 'Can', 'Be'],
    explanation: '主詞「your new classmate」為第三人稱單數，且句中無一般動詞而為 be 動詞＋from 句型，疑問句開頭須用 Is。'
  }),
  createItem({
    id: 'hwg_b7_bd_12',
    book: 7,
    unit: 'Unit 1',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'My uncle lives in London. He is from ______.',
    options: ['the UK', 'a UK', 'UK', 'an UK', 'Taiwan', 'Japan', 'Spain'],
    explanation: '英國（the UK）與美國（the USA）屬於縮寫國名，搭配 from 使用時必須加上定冠詞 the，故選 the UK。'
  }),
  createItem({
    id: 'hwg_b7_bd_13',
    book: 7,
    unit: 'Unit 1',
    section: 'grammar',
    taskType: 'G-CTX',
    difficulty: 2,
    question: '國際文化週上，你想問來自遠方的男孩「你從哪裡來？」，應該怎麼問？',
    options: [
      'Where are you from?',
      'How can you go there?',
      'What time is the show?',
      'Whose backpack is this?',
      'What do you want to eat?',
      'When is your birthday?',
      'Do you like hot curry?'
    ],
    explanation: '詢問對方來自哪個國家或城市，標準句型為「Where are you from?」。'
  }),
  createItem({
    id: 'hwg_b7_bd_14',
    book: 7,
    unit: 'Unit 1',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「Hello, everyone. My name is Kenji. I am twelve years old, and I am from Japan. My best friend Emma is from the UK. We meet at an international camp in Taiwan. We both love Taiwanese beef noodles and mango ice very much.」請問 Kenji 的好朋友 Emma 來自哪個國家？',
    options: ['英國', '日本', '台灣', '印度', '西班牙', '美國', '新加坡'],
    explanation: '短文第 4 句寫道「My best friend Emma is from the UK.（我的好朋友 Emma 來自英國）」，故選「英國」。'
  }),

  // --- Unit 2 (Transportation & Going Places) ---
  createItem({
    id: 'hwg_b7_bd_15',
    book: 7,
    unit: 'Unit 2',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'scooter',
    options: ['scooter', 'metro', 'boat', 'taxi', 'train', 'bike', 'tram'],
    explanation: '聽力發音為交通工具單字「scooter（機車／滑板車）」。'
  }),
  createItem({
    id: 'hwg_b7_bd_16',
    book: 7,
    unit: 'Unit 2',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'museum',
    options: ['museum', 'station', 'theater', 'library', 'hospital', 'bakery', 'office'],
    explanation: '聽力發音為場所單字「museum（博物館）」。'
  }),
  createItem({
    id: 'hwg_b7_bd_17',
    book: 7,
    unit: 'Unit 2',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'How does Kevin go to school every morning?',
    options: [
      'He goes to school by bike.',
      'He is from the USA.',
      'He plays basketball at four.',
      'He wraps gifts at school.',
      'He wants some noodles.',
      'He likes sunny weather.',
      'He is in the classroom.'
    ],
    explanation: '問句問「Kevin 每天早上怎麼去上學？」，詢問交通方式須用「by + 交通工具」或「on foot」回答，故選「He goes to school by bike.」。'
  }),
  createItem({
    id: 'hwg_b7_bd_18',
    book: 7,
    unit: 'Unit 2',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'Do you go to the library by metro?',
    options: [
      'No, I go there on foot.',
      'Yes, I am from Taipei.',
      'No, I get up at six.',
      'Yes, he likes music.',
      'No, it is my water bottle.',
      'Yes, they are my friends.',
      'No, we want some juice.'
    ],
    explanation: '問句是「Do you go to the library by metro?（你搭捷運去圖書館嗎？）」，以 Yes/No 簡答並說明實際交通方式「No, I go there on foot.（不，我走路去那裡）」。'
  }),
  createItem({
    id: 'hwg_b7_bd_19',
    book: 7,
    unit: 'Unit 2',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'Our school is very close to my house, so I walk there ______ foot every day.',
    options: ['on', 'by', 'in', 'at', 'to', 'with', 'under'],
    explanation: '「走路／步行」在英文的固定介系詞片語為 on foot，不可使用 by foot。'
  }),
  createItem({
    id: 'hwg_b7_bd_20',
    book: 7,
    unit: 'Unit 2',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'Taking the ______ under the city is fast because there are no traffic lights underground.',
    options: ['metro', 'boat', 'bicycle', 'horse', 'ship', 'plane', 'kite'],
    explanation: '「在地下行駛、沒有紅綠燈的快速交通工具」即捷運／地鐵（metro）。'
  }),
  createItem({
    id: 'hwg_b7_bd_21',
    book: 7,
    unit: 'Unit 2',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'My father ______ to the office by train on weekdays.',
    options: ['goes', 'go', 'going', 'to go', 'wenting', 'are', 'does'],
    explanation: '主詞 My father 為第三人稱單數，現在簡單式表達平常習慣（on weekdays），動詞 go 須加 es 變為 goes。'
  }),
  createItem({
    id: 'hwg_b7_bd_22',
    book: 7,
    unit: 'Unit 2',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'A: ______ your sisters go to the night market by bus? B: Yes, they do.',
    options: ['Do', 'Does', 'Are', 'Is', 'Am', 'Has', 'Was'],
    explanation: '主詞 your sisters 為複數名詞，且後面為原形動詞 go，疑問句助動詞須選 Do。'
  }),
  createItem({
    id: 'hwg_b7_bd_23',
    book: 7,
    unit: 'Unit 2',
    section: 'grammar',
    taskType: 'G-CTX',
    difficulty: 2,
    question: '同學家住得有點遠，你想問他「你爸爸都怎麼去博物館？」，下列哪一句最適合？',
    options: [
      'How does your dad go to the museum?',
      'Where is the history museum?',
      'What does your dad do on Monday?',
      'Is your dad from Australia?',
      'What time does the museum open?',
      'Whose car is in front of the museum?',
      'Would you like to see the museum?'
    ],
    explanation: '詢問第三人稱（your dad）如何前往某地，須使用「How does + 主詞 + go to + 地點?」。'
  }),
  createItem({
    id: 'hwg_b7_bd_24',
    book: 7,
    unit: 'Unit 2',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「Every morning, Iris and her brother Leo leave home at seven thirty. Iris takes the metro to school because her school is downtown. Leo goes to school by bike with his neighbor. Their mother walks to the post office near their home on foot.」請問 Iris 每天早上如何去上學？',
    options: ['搭捷運', '騎腳踏車', '步行走路', '搭公車', '坐爸爸的車', '搭火車', '騎機車'],
    explanation: '短文第 2 句寫到「Iris takes the metro to school because her school is downtown.（Iris 搭捷運上學）」，故選「搭捷運」。'
  }),

  // --- Review 1 (Countries + Transport Integration) ---
  createItem({
    id: 'hwg_b7_bd_25',
    book: 7,
    unit: 'Review 1',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「Ben is from Egypt, and his cousin Maya is from Spain. They are visiting Taipei this weekend. First, they go to the museum by metro in the morning. Then, they take a taxi to a famous beef noodle shop for lunch together.」請問 Ben 來自哪裡？',
    options: ['埃及', '西班牙', '台灣', '英國', '澳洲', '日本', '印度'],
    explanation: '短文第 1 句明確指出「Ben is from Egypt（Ben 來自埃及）」，Maya 才來自西班牙，故選「埃及」。'
  }),

  // --- Unit 3 (Free Time Activities) ---
  createItem({
    id: 'hwg_b7_bd_26',
    book: 7,
    unit: 'Unit 3',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'baseball',
    options: ['baseball', 'basketball', 'badminton', 'piano', 'guitar', 'violin', 'soccer'],
    explanation: '聽力發音為運動項目單字「baseball（棒球）」。'
  }),
  createItem({
    id: 'hwg_b7_bd_27',
    book: 7,
    unit: 'Unit 3',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'jogging',
    options: ['jogging', 'reading', 'writing', 'singing', 'dancing', 'cooking', 'fishing'],
    explanation: '聽力發音為休閒活動單字「jogging（慢跑）」。'
  }),
  createItem({
    id: 'hwg_b7_bd_28',
    book: 7,
    unit: 'Unit 3',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'What does your sister do in her free time?',
    options: [
      'She plays the piano at home.',
      'She goes to school by bus.',
      'She is from Singapore.',
      'She gets up at six o\'clock.',
      'She wants some sandwiches.',
      'She is at the post office.',
      'It is half past eight now.'
    ],
    explanation: '問句問「What does your sister do in her free time?（你妹妹空閒時間都在做什麼？）」，須回答休閒活動，故選「She plays the piano at home.」。'
  }),
  createItem({
    id: 'hwg_b7_bd_29',
    book: 7,
    unit: 'Unit 3',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'Mozart loved music very much, and he could ______ the piano very well.',
    options: ['play', 'ride', 'surf', 'wrap', 'watch', 'brush', 'walk'],
    explanation: '搭配樂器（the piano）表達「彈奏」應使用動詞 play（play the piano）。'
  }),
  createItem({
    id: 'hwg_b7_bd_30',
    book: 7,
    unit: 'Unit 3',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'After finishing his homework, Ryan likes to ______ a bike along the river.',
    options: ['ride', 'watch', 'listen', 'surf', 'play', 'write', 'take'],
    explanation: '搭配腳踏車（a bike）表達「騎乘」須使用動詞 ride（ride a bike）。'
  }),
  createItem({
    id: 'hwg_b7_bd_31',
    book: 7,
    unit: 'Unit 3',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'What do you and your brother do after school?',
    options: [
      'We ride bikes and listen to music.',
      'We are from the UK.',
      'It is eleven thirty now.',
      'I go to school by scooter.',
      'Yes, we want some apple juice.',
      'My water bottle is under the chair.',
      'She wraps gifts at the elf school.'
    ],
    explanation: '問句詢問「你和弟弟放學後都做什麼？」，主詞為複數且問日常休閒活動，故回答「We ride bikes and listen to music.」。'
  }),
  createItem({
    id: 'hwg_b7_bd_32',
    book: 7,
    unit: 'Unit 3',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'My brother ______ TV with our grandfather after dinner every evening.',
    options: ['watches', 'watch', 'watching', 'watchs', 'to watch', 'are watching', 'watched'],
    explanation: '主詞 My brother 為第三人稱單數，every evening 為現在簡單式習慣，watch 字尾為 ch，三單變化須加 es 為 watches。'
  }),
  createItem({
    id: 'hwg_b7_bd_33',
    book: 7,
    unit: 'Unit 3',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'A: What ______ Chloe and her friends do on weekends? B: They go jogging in the park.',
    options: ['do', 'does', 'are', 'is', 'can', 'has', 'did'],
    explanation: '主詞 Chloe and her friends 為複數，搭配原形動詞 do，疑問句助動詞須使用 do。'
  }),
  createItem({
    id: 'hwg_b7_bd_34',
    book: 7,
    unit: 'Unit 3',
    section: 'grammar',
    taskType: 'G-CTX',
    difficulty: 2,
    question: '你想知道好朋友 David 放學後的空閒時間都做些什麼活動，可以怎麼問他？',
    options: [
      'What do you do in your free time?',
      'How do you go home after school?',
      'Where do you come from, David?',
      'What time do you go to bed?',
      'Whose baseball bat is this?',
      'Do you want some hot soup?',
      'Can you take a metro there?'
    ],
    explanation: '詢問對方空閒時間做什麼休閒活動，標準問句為「What do you do in your free time?」。'
  }),
  createItem({
    id: 'hwg_b7_bd_35',
    book: 7,
    unit: 'Unit 3',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「Eric and his twin sister Amy have different hobbies. On weekends, Eric plays baseball with his school team at the field. Amy does not like ball games. Instead, she stays at home to practice the piano and surf the Internet for music videos.」請問週末時 Amy 在家做什麼活動？',
    options: ['彈鋼琴與上網看音樂影片', '去棒球場打棒球', '跟鄰居去公園慢跑', '去圖書館寫功課', '騎腳踏車逛夜市', '到歌劇院聽演講', '去超市買牛肉三明治'],
    explanation: '短文最後一句指出 Amy 留在家中「practice the piano and surf the Internet for music videos（練鋼琴與上網找音樂影片）」。'
  }),

  // --- Unit 4 (Daily Routines & Telling Time) ---
  createItem({
    id: 'hwg_b7_bd_36',
    book: 7,
    unit: 'Unit 4',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'homework',
    options: ['homework', 'breakfast', 'dinner', 'shower', 'snowman', 'reindeer', 'office'],
    explanation: '聽力發音為日常作息關鍵字「homework（家庭作業）」。'
  }),
  createItem({
    id: 'hwg_b7_bd_37',
    book: 7,
    unit: 'Unit 4',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'breakfast',
    options: ['breakfast', 'lunch', 'dinner', 'homework', 'weekend', 'morning', 'evening'],
    explanation: '聽力發音為三餐單字「breakfast（早餐）」。'
  }),
  createItem({
    id: 'hwg_b7_bd_38',
    book: 7,
    unit: 'Unit 4',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'What time do you get up on school days?',
    options: [
      'I get up at six thirty.',
      'I go to school by bus.',
      'I play baseball with friends.',
      'I am from Taiwan.',
      'I like beef sandwiches.',
      'I wrap gifts for my mom.',
      'I am in the post office.'
    ],
    explanation: '問句問「What time do you get up on school days?（你上學日幾點起床？）」，須回答起床時間，故選「I get up at six thirty.」。'
  }),
  createItem({
    id: 'hwg_b7_bd_39',
    book: 7,
    unit: 'Unit 4',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'What does Joy do after breakfast at the elf school?',
    options: [
      'She wraps gifts and makes toys.',
      'She is from the Arctic Circle.',
      'She goes home at twelve thirty.',
      'She takes the tram to Vienna.',
      'It is ten o\'clock in the morning.',
      'Her bottle is on the table.',
      'Yes, she would like some tea.'
    ],
    explanation: '問句詢問 Joy 早餐後在精靈學校做什麼事，應回答具體動作，故選「She wraps gifts and makes toys.」。'
  }),
  createItem({
    id: 'hwg_b7_bd_40',
    book: 7,
    unit: 'Unit 4',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'Before going to bed every night, I take a warm ______ to relax.',
    options: ['shower', 'picnic', 'subway', 'snowman', 'present', 'tram', 'museum'],
    explanation: '「睡前沖個熱水澡放鬆」英文固定為 take a shower。'
  }),
  createItem({
    id: 'hwg_b7_bd_41',
    book: 7,
    unit: 'Unit 4',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'Joy is very busy before Christmas because she needs to ______ many colorful gifts.',
    options: ['wrap', 'walk', 'surf', 'ride', 'ring', 'count', 'clean'],
    explanation: '聖誕節前包裝禮物（wrap gifts），應選動詞 wrap（包裝）。'
  }),
  createItem({
    id: 'hwg_b7_bd_42',
    book: 7,
    unit: 'Unit 4',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'Santa always goes to bed ______ eleven thirty after he finishes his work.',
    options: ['at', 'on', 'in', 'by', 'from', 'to', 'with'],
    explanation: '在英文時間介系詞中，精確的時間點（如 eleven thirty / 11:30）前面固定搭配介系詞 at。'
  }),
  createItem({
    id: 'hwg_b7_bd_43',
    book: 7,
    unit: 'Unit 4',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'A: What time ______ your brother have dinner? B: He has dinner at six.',
    options: ['does', 'do', 'is', 'are', 'has', 'was', 'can'],
    explanation: '主詞 your brother 為第三人稱單數，後面搭配原形動詞 have，疑問句助動詞須使用 does。'
  }),
  createItem({
    id: 'hwg_b7_bd_44',
    book: 7,
    unit: 'Unit 4',
    section: 'grammar',
    taskType: 'G-CTX',
    difficulty: 2,
    question: '媽媽想知道弟弟每天晚上幾點睡覺，她應該問什麼？',
    options: [
      'What time does he go to bed?',
      'What does he do in his free time?',
      'How does he go to the park?',
      'Where does your brother live?',
      'Does he wrap gifts after dinner?',
      'Whose clock is on the wall?',
      'Would he like some warm milk?'
    ],
    explanation: '詢問「幾點睡覺」應使用時間疑問詞 What time ＋ 助動詞 does ＋ go to bed。'
  }),
  createItem({
    id: 'hwg_b7_bd_45',
    book: 7,
    unit: 'Unit 4',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「Every morning, elf Joy gets up at eight o\'clock in SantaPark. After a quick breakfast, she makes wooden toys and wraps pretty gifts with her friends. At noon, she walks the reindeer outside in the snow. She goes home at twelve at night.」請問 Joy 吃完早餐後在做什麼？',
    options: ['製作木頭玩具與包裝禮物', '在雪地裡堆雪人與洗冰浴', '搭電車去維也納歌劇院', '吃牛肉三明治與喝汽水', '打棒球與彈鋼琴', '上網查新年煙火時間', '睡覺到下午三點'],
    explanation: '短文第 2 句寫到「After a quick breakfast, she makes wooden toys and wraps pretty gifts（製作木頭玩具並包裝漂亮禮物）」。'
  }),

  // --- Review 2 & Festival (Routines + New Year Cultures) ---
  createItem({
    id: 'hwg_b7_bd_46',
    book: 7,
    unit: 'Review 2',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'My sister ______ her homework at seven and then listens to music before bed.',
    options: ['does', 'do', 'doing', 'is do', 'are doing', 'doeses', 'did'],
    explanation: '句子與後半句 listens 並列為現在簡單式習慣動作，主詞 My sister 為三單，故選 does（do one’s homework）。'
  }),
  createItem({
    id: 'hwg_b7_bd_47',
    book: 7,
    unit: 'Review 2',
    section: 'grammar',
    taskType: 'G-CTX',
    difficulty: 2,
    question: '你想同時問同學「你哥哥晚上幾點回家，回家後又喜歡做什麼休閒活動？」，下列哪一組說法最自然？',
    options: [
      'What time does he go home, and what does he do in his free time?',
      'Where is he from, and how does he go to the library?',
      'Whose cap is on the desk, and do you want some cheese?',
      'When is Lunar New Year, and can you ring the bell?',
      'Are you going to Vienna by tram, or on foot?',
      'What is your favorite subject in fifth grade?',
      'How much is the beef sandwich at this park?'
    ],
    explanation: '前半問回家時間（What time does he go home），後半問空閒休閒活動（what does he do in his free time），完全對應 Review 2 兩大單元主題。'
  }),
  createItem({
    id: 'hwg_b7_bd_48',
    book: 7,
    unit: 'Festival',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'During Lunar New Year in Taiwan, families ______ up red spring couplets on the doors for good luck.',
    options: ['put', 'wrap', 'surf', 'ring', 'take', 'ride', 'drop'],
    explanation: '台灣農曆新年「貼春聯」的固定動詞片語為 put up spring couplets。'
  }),
  createItem({
    id: 'hwg_b7_bd_49',
    book: 7,
    unit: 'Festival',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「On New Year\'s Eve in Australia, Emily and her family watch colorful fireworks over the Sydney Harbor Bridge. Before midnight, they share a warm picnic dinner by the water and count down happily with friendly neighbors from around the world.」請問 Emily 一家人在澳洲跨年時會觀賞什麼？',
    options: ['五彩繽紛的煙火', '十二顆西班牙葡萄', '日本寺廟的銅鐘', '芬蘭的馴鹿雪橇', '台北夜市的小吃', '維也納的電車遊行', '公園裡的棒球比賽'],
    explanation: '短文第 1 句指出「watch colorful fireworks over the Sydney Harbor Bridge（在雪梨港灣大橋上方觀賞五彩繽紛的煙火）」，故選「五彩繽紛的煙火」。'
  }),
  createItem({
    id: 'hwg_b7_bd_50',
    book: 7,
    unit: 'Festival',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「People celebrate New Year differently around the world. In Japan, temples ring bells 108 times on New Year\'s Eve. In Spain, people eat twelve grapes as the clock chimes midnight. In Taiwan, families clean their houses, put up spring couplets, and share a big dinner.」請問在西班牙跨年時人們會吃什麼？',
    options: ['十二顆葡萄', '牛肉麵與水餃', '蘋果與吐司', '起司漢堡', '鳳梨酥', '抹茶蛋糕', '橘子與香蕉'],
    explanation: '短文第 3 句指出「In Spain, people eat twelve grapes as the clock chimes midnight.（在西班牙人們會吃十二顆葡萄）」。'
  })
];

// ============================================================================
// BOOK 8 NEW ITEMS (+50 Questions: Starter, Unit 1~4, Review 1~2, Festival)
// Exact TaskType Quota: L-WORD: 8, L-RESP: 8, V-MEAN: 10, G-MC: 10, G-CTX: 6, R-COMP: 8
// ============================================================================
const BOOK_8_NEW_ITEMS = [
  // --- Starter (Free Time Sports & Activities) ---
  createItem({
    id: 'hwg_b8_bd_01',
    book: 8,
    unit: 'Starter',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 1,
    question: 'My grandfather goes to the park early every morning to ______ Tai Chi.',
    options: ['do', 'go', 'play', 'take', 'watch', 'visit', 'clean'],
    explanation: '打太極拳與練功夫（Tai Chi / kung fu）在英文固定搭配動詞 do，故選 do Tai Chi。'
  }),
  createItem({
    id: 'hwg_b8_bd_02',
    book: 8,
    unit: 'Starter',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 1,
    question: 'A: What do you do in your free time? B: I go ______ in the mountains with my family.',
    options: ['camping', 'camp', 'badminton', 'kung fu', 'Tai Chi', 'piano', 'videos'],
    explanation: '在「go + V-ing」句型中，去露營為 go camping；badminton 用 play，Tai Chi 和 kung fu 用 do。'
  }),
  createItem({
    id: 'hwg_b8_bd_03',
    book: 8,
    unit: 'Starter',
    section: 'grammar',
    taskType: 'G-CTX',
    difficulty: 1,
    question: '公園裡你看到同學在揮羽球拍，你想用英文問「你平常空閒時間都做什麼運動？」，該怎麼問？',
    options: [
      'What do you do in your free time?',
      'Where were you yesterday morning?',
      'How much is your new jacket?',
      'What did you do last night?',
      'How is the weather in winter?',
      'Whose badminton racket is on the bench?',
      'Were they at the movie theater?'
    ],
    explanation: '詢問平常空閒時間的興趣或運動習慣，使用現在式問句「What do you do in your free time?」。'
  }),
  createItem({
    id: 'hwg_b8_bd_04',
    book: 8,
    unit: 'Starter',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 1,
    audioText: 'What do you do in your free time, Mia?',
    options: [
      'I play badminton with my brother.',
      'I was at the restaurant yesterday.',
      'The T-shirt is four hundred dollars.',
      'My favorite season is cool fall.',
      'We cleaned our room last night.',
      'Yes, it is very snowy today.',
      'No, they were not at the zoo.'
    ],
    explanation: '問句問 Mia 平常空閒時間做什麼（現在式），應以現在簡單式活動回答，故選「I play badminton with my brother.」。'
  }),
  createItem({
    id: 'hwg_b8_bd_05',
    book: 8,
    unit: 'Starter',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「Every Saturday morning, Uncle Tom goes jogging around the lake near his house. His son Leo prefers indoor sports, so Leo practices kung fu at a sports center. In the afternoon, they often go fishing together by the quiet river.」請問星期六下午父子倆常一起去做什麼？',
    options: ['一起去釣魚', '一起打羽毛球', '一起在公園打太極', '一起去購物中心', '一起去電影院看片', '一起在健身房練功夫', '一起在湖邊慢跑'],
    explanation: '短文最後一句指出「In the afternoon, they often go fishing together by the quiet river.（下午他們常去安靜的河邊釣魚）」。'
  }),

  // --- Unit 1 (Past Tense Be Verbs was / were & Places) ---
  createItem({
    id: 'hwg_b8_bd_06',
    book: 8,
    unit: 'Unit 1',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'yesterday',
    options: ['yesterday', 'tomorrow', 'tonight', 'today', 'winter', 'summer', 'weekend'],
    explanation: '聽力發音為過去時間副詞「yesterday（昨天）」。'
  }),
  createItem({
    id: 'hwg_b8_bd_07',
    book: 8,
    unit: 'Unit 1',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'restaurant',
    options: ['restaurant', 'hospital', 'theater', 'museum', 'library', 'station', 'bakery'],
    explanation: '聽力發音為地點單字「restaurant（餐廳）」。'
  }),
  createItem({
    id: 'hwg_b8_bd_08',
    book: 8,
    unit: 'Unit 1',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'Where were you and Max yesterday afternoon?',
    options: [
      'We were at the movie theater.',
      'We are playing basketball now.',
      'I go camping in my free time.',
      'They cost five hundred dollars.',
      'My favorite season is spring.',
      'Yes, I cleaned my room.',
      'It is warm and sunny in summer.'
    ],
    explanation: '問句問「Where were you and Max yesterday afternoon?（昨天下午你和 Max 在哪裡？）」，主詞是你們且為過去時間，故答「We were at the movie theater.」。'
  }),
  createItem({
    id: 'hwg_b8_bd_09',
    book: 8,
    unit: 'Unit 1',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'We wanted to buy a new jacket and some gifts, so we went to the ______ yesterday.',
    options: ['mall', 'zoo', 'hospital', 'lake', 'kitchen', 'playground', 'temple'],
    explanation: '要買夾克跟禮物（buy a new jacket and some gifts），最適合前往購物中心（mall）。'
  }),
  createItem({
    id: 'hwg_b8_bd_10',
    book: 8,
    unit: 'Unit 1',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'My parents were hungry last night, so we had salad and steak at a nice ______.',
    options: ['restaurant', 'theater', 'museum', 'library', 'school', 'bookstore', 'airport'],
    explanation: '吃沙拉與牛排（had salad and steak）的地方是餐廳（restaurant）。'
  }),
  createItem({
    id: 'hwg_b8_bd_11',
    book: 8,
    unit: 'Unit 1',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'A: Where ______ Rocky yesterday morning? B: He was at the zoo.',
    options: ['was', 'were', 'is', 'are', 'did', 'do', 'does'],
    explanation: '時間為 yesterday morning（過去時間），主詞 Rocky 為第三人稱單數，故過去式 be 動詞應選 was。'
  }),
  createItem({
    id: 'hwg_b8_bd_12',
    book: 8,
    unit: 'Unit 1',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'A: Were your friends at the mall last Sunday? B: No, they ______.',
    options: ['weren’t', 'wasn’t', 'aren’t', 'isn’t', 'didn’t', 'don’t', 'doesn’t'],
    explanation: '問句以「Were your friends...」提問，過去式複數否定簡答固定為「No, they weren’t.」。'
  }),
  createItem({
    id: 'hwg_b8_bd_13',
    book: 8,
    unit: 'Unit 1',
    section: 'grammar',
    taskType: 'G-CTX',
    difficulty: 2,
    question: '在希臘奧運會場上找不到火把，你想問守護者「火把昨天在這裡嗎？」，該怎麼問？',
    options: [
      'Was the torch here yesterday?',
      'Are the torches here every day?',
      'Where did you buy the torch?',
      'How much was the Olympic torch?',
      'What season was it yesterday?',
      'Did the torch light up last night?',
      'Were they at the restaurant yesterday?'
    ],
    explanation: '單數名詞 the torch 在過去時間 yesterday 是否於此，應使用「Was the torch here yesterday?」。'
  }),
  createItem({
    id: 'hwg_b8_bd_14',
    book: 8,
    unit: 'Unit 1',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「Yesterday was a busy day for Mia. In the morning, she was at school for a music club meeting. At noon, she was at a restaurant near the park with her aunt. In the evening, Mia and her brother were at the movie theater together.」請問昨天中午 Mia 在哪裡？',
    options: ['在餐廳', '在學校', '在電影院', '在購物中心', '在動物園', '在博物館', '在家裡'],
    explanation: '短文第 3 句指出「At noon, she was at a restaurant near the park with her aunt.（中午她在餐廳）」，故選「在餐廳」。'
  }),

  // --- Unit 2 (Past Tense Regular/Did Actions) ---
  createItem({
    id: 'hwg_b8_bd_15',
    book: 8,
    unit: 'Unit 2',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'visited',
    options: ['visited', 'watched', 'cleaned', 'walked', 'listened', 'played', 'washed'],
    explanation: '聽力發音為過去式動詞「visited（拜訪）」。'
  }),
  createItem({
    id: 'hwg_b8_bd_16',
    book: 8,
    unit: 'Unit 2',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'watched',
    options: ['watched', 'walked', 'cleaned', 'visited', 'listened', 'played', 'cooked'],
    explanation: '聽力發音為過去式動詞「watched（觀看）」。'
  }),
  createItem({
    id: 'hwg_b8_bd_17',
    book: 8,
    unit: 'Unit 2',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'What did you do last night, Lucas?',
    options: [
      'I cleaned my room and listened to music.',
      'I was at the restaurant yesterday noon.',
      'These jeans are six hundred dollars.',
      'My favorite season is snowy winter.',
      'I go jogging every Sunday morning.',
      'Yes, it is foggy and cold today.',
      'They are going to the movie theater.'
    ],
    explanation: '問句用過去式「What did you do last night?（昨晚你做了什麼？）」，須以過去式動詞動作回答「I cleaned my room and listened to music.」。'
  }),
  createItem({
    id: 'hwg_b8_bd_18',
    book: 8,
    unit: 'Unit 2',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'Did Emma walk the dog yesterday evening?',
    options: [
      'Yes, she did. They walked in the park.',
      'Yes, she was at the mall yesterday.',
      'No, she likes summer and fall.',
      'No, the jacket is two hundred dollars.',
      'Yes, she plays badminton every day.',
      'No, we are watching videos now.',
      'Yes, I visited my grandfather.'
    ],
    explanation: '問句以助動詞 Did 提問第三人稱女性 Emma，肯定簡答應為「Yes, she did.」。'
  }),
  createItem({
    id: 'hwg_b8_bd_19',
    book: 8,
    unit: 'Unit 2',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'My bedroom was very messy, so I ______ my room yesterday afternoon.',
    options: ['cleaned', 'visited', 'listened', 'watched', 'walked', 'surfed', 'rained'],
    explanation: '因為房間很亂（messy），所以「打掃房間」應選過去式動詞 cleaned（cleaned my room）。'
  }),
  createItem({
    id: 'hwg_b8_bd_20',
    book: 8,
    unit: 'Unit 2',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'Kevin misses his grandmother, so he ______ her in Taipei last weekend.',
    options: ['visited', 'cleaned', 'watched', 'walked', 'listened', 'played', 'finished'],
    explanation: '想念奶奶所以去「拜訪她」（visited her），最符合句意。'
  }),
  createItem({
    id: 'hwg_b8_bd_21',
    book: 8,
    unit: 'Unit 2',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'A: Did Abu ______ video games late last night? B: Yes, he did.',
    options: ['play', 'played', 'plays', 'playing', 'to play', 'did play', 'was play'],
    explanation: '過去式疑問句中已經有助動詞 Did 出現，後方的動詞必須恢復為原形動詞 play。'
  }),
  createItem({
    id: 'hwg_b8_bd_22',
    book: 8,
    unit: 'Unit 2',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'Nina ______ videos with her brother after school yesterday.',
    options: ['watched', 'watch', 'watches', 'watching', 'was watch', 'did watched', 'are watching'],
    explanation: '時間副詞為 yesterday（昨天），且句中無助動詞 did，故動詞 watch 須用過去式 watched。'
  }),
  createItem({
    id: 'hwg_b8_bd_23',
    book: 8,
    unit: 'Unit 2',
    section: 'grammar',
    taskType: 'G-CTX',
    difficulty: 2,
    question: '你想問好友昨晚有沒有跟大家一起打籃球，應該怎麼用英文問？',
    options: [
      'Did you play basketball last night?',
      'Do you play basketball every night?',
      'Were you at the basketball court?',
      'What did you watch last night?',
      'Are you playing basketball now?',
      'How much was the basketball?',
      'Did you clean your room yesterday?'
    ],
    explanation: '詢問過去某晚是否做了「打籃球」這個動作，應使用過去式助動詞問句「Did you play basketball last night?」。'
  }),
  createItem({
    id: 'hwg_b8_bd_24',
    book: 8,
    unit: 'Unit 2',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「Last Sunday was rainy, so Jason stayed at home all day. In the morning, he cleaned his room and finished his math homework. In the afternoon, he watched funny videos and listened to K-pop music with his sister on the sofa.」請問上週日下午 Jason 和妹妹一起做了什麼？',
    options: ['看影片和聽韓國流行音樂', '去公園打籃球和遛狗', '打掃房間與寫數學作業', '去餐廳吃沙拉和看電影', '去購物中心買藍色牛仔褲', '去河邊釣魚和搭帳篷', '在健身房打太極拳'],
    explanation: '短文最後一句清楚指出「In the afternoon, he watched funny videos and listened to K-pop music with his sister」，故選看影片和聽 K-pop 音樂。'
  }),

  // --- Review 1 (Past Be + Past Action Integration) ---
  createItem({
    id: 'hwg_b8_bd_25',
    book: 8,
    unit: 'Review 1',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「Where were Noah and Grace yesterday? In the morning, they were at a kimchi workshop in Korea. After lunch, Noah visited a friend near the park, and Grace walked her white dog by the lake. They both had a wonderful day.」請問昨天上午 Noah 和 Grace 在哪裡？',
    options: ['在泡菜工作坊', '在電影院看片', '在湖邊遛狗', '在餐廳吃牛排', '在購物中心買衣服', '在家裡看影片', '在動物園看獅子'],
    explanation: '短文第 2 句寫到「In the morning, they were at a kimchi workshop in Korea.（早上他們在韓國的泡菜工作坊）」。'
  }),

  // --- Unit 3 (Clothes & Asking Prices) ---
  createItem({
    id: 'hwg_b8_bd_26',
    book: 8,
    unit: 'Unit 3',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'jacket',
    options: ['jacket', 'skirt', 'dress', 'jeans', 'shorts', 'pants', 'coat'],
    explanation: '聽力發音為服飾單字「jacket（夾克外套）」。'
  }),
  createItem({
    id: 'hwg_b8_bd_27',
    book: 8,
    unit: 'Unit 3',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'shorts',
    options: ['shorts', 'skirt', 'dress', 'coat', 'jacket', 'hat', 'cap'],
    explanation: '聽力發音為複數服飾單字「shorts（短褲）」。'
  }),
  createItem({
    id: 'hwg_b8_bd_28',
    book: 8,
    unit: 'Unit 3',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'How much are those blue jeans?',
    options: [
      'They are eight hundred dollars.',
      'It is eight hundred dollars.',
      'Yes, I was at the mall yesterday.',
      'My favorite season is winter.',
      'They cleaned the room last night.',
      'I go camping in my free time.',
      'No, it is sunny and warm today.'
    ],
    explanation: 'jeans（牛仔褲）為成雙複數名詞，問句以 are 提問，故金額回答必須用複數主詞「They are eight hundred dollars.」。'
  }),
  createItem({
    id: 'hwg_b8_bd_29',
    book: 8,
    unit: 'Unit 3',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'It is very windy outside. Please put on your warm ______ before you leave.',
    options: ['coat', 'shorts', 'skirt', 'sandals', 'sunglasses', 'swimsuit', 'umbrella'],
    explanation: '外面風大時要穿上保暖的外套／大衣（warm coat），最符合情境。'
  }),
  createItem({
    id: 'hwg_b8_bd_30',
    book: 8,
    unit: 'Unit 3',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'The sun is very bright today. You should wear a ______ to shade your eyes and face.',
    options: ['hat', 'dress', 'pants', 'jeans', 'coat', 'sweater', 'socks'],
    explanation: '太陽很大時可以戴一頂有帽簷的帽子（wear a hat）來遮陽。'
  }),
  createItem({
    id: 'hwg_b8_bd_31',
    book: 8,
    unit: 'Unit 3',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'How much is that warm red coat?',
    options: [
      'It is nine hundred dollars.',
      'They are nine hundred dollars.',
      'I cleaned my room yesterday.',
      'We were at the movie theater.',
      'My favorite season is cool fall.',
      'Yes, it is very foggy today.',
      'She plays badminton after school.'
    ],
    explanation: '問句詢問單數衣物「that warm red coat（那件紅色保暖外套）多少錢？」，須以單數主詞回答價格「It is nine hundred dollars.」。'
  }),
  createItem({
    id: 'hwg_b8_bd_32',
    book: 8,
    unit: 'Unit 3',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'A: How much ______ these black pants? B: They are seven hundred dollars.',
    options: ['are', 'is', 'am', 'do', 'does', 'was', 'be'],
    explanation: 'pants（長褲）屬於成雙成對的複數服飾名詞，前面搭配指示代名詞 these，詢問價錢時 be 動詞必須用 are。'
  }),
  createItem({
    id: 'hwg_b8_bd_33',
    book: 8,
    unit: 'Unit 3',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'A: How much is that green dress? B: ______ nine hundred fifty dollars.',
    options: ['It is', 'They are', 'It were', 'They were', 'He is', 'She is', 'There are'],
    explanation: 'that green dress 為單數服飾，回答金額時應使用單數代名詞與單數 be 動詞「It is」。'
  }),
  createItem({
    id: 'hwg_b8_bd_34',
    book: 8,
    unit: 'Unit 3',
    section: 'grammar',
    taskType: 'G-CTX',
    difficulty: 2,
    question: '在夜市攤位看中一件藍色夾克，你想問老闆「這件夾克多少錢？」，該怎麼問？',
    options: [
      'How much is this blue jacket?',
      'How much are these blue pants?',
      'What did you wear yesterday?',
      'Where did you buy this jacket?',
      'Whose blue jacket is on the chair?',
      'Do you wear jackets in summer?',
      'Was the blue jacket at the mall?'
    ],
    explanation: '詢問單件商品（this blue jacket）的價格，標準問句為「How much is this blue jacket?」。'
  }),
  createItem({
    id: 'hwg_b8_bd_35',
    book: 8,
    unit: 'Unit 3',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「Tina went shopping at the mall with her mom yesterday. First, she bought a yellow T-shirt for three hundred dollars. Next, she liked a pair of blue jeans, which cost six hundred dollars. They spent nine hundred dollars in total.」請問 Tina 買的黃色 T 恤多少錢？',
    options: ['三百元', '六百元', '九百元', '兩百元', '四百五十元', '五百元', '八百元'],
    explanation: '短文第 2 句寫道「First, she bought a yellow T-shirt for three hundred dollars.（她花了三百元買一件黃色 T 恤）」。'
  }),

  // --- Unit 4 (Seasons & Weather) ---
  createItem({
    id: 'hwg_b8_bd_36',
    book: 8,
    unit: 'Unit 4',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'foggy',
    options: ['foggy', 'snowy', 'rainy', 'windy', 'sunny', 'cloudy', 'stormy'],
    explanation: '聽力發音為天氣形容詞「foggy（有霧的）」。'
  }),
  createItem({
    id: 'hwg_b8_bd_37',
    book: 8,
    unit: 'Unit 4',
    section: 'listening',
    taskType: 'L-WORD',
    difficulty: 2,
    audioText: 'season',
    options: ['season', 'weather', 'spring', 'summer', 'winter', 'autumn', 'weekend'],
    explanation: '聽力發音為季節總稱單字「season（季節）」。'
  }),
  createItem({
    id: 'hwg_b8_bd_38',
    book: 8,
    unit: 'Unit 4',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'What is your favorite season, Eric?',
    options: [
      'My favorite season is fall because it is cool.',
      'I was at the movie theater last night.',
      'These blue shorts are four hundred dollars.',
      'I walked the dog in the park yesterday.',
      'Yes, I can play badminton very well.',
      'No, there were no students at school.',
      'She wore a pretty pink dress today.'
    ],
    explanation: '問句問「你最喜歡的季節是什麼？」，直接回答最喜愛的季節與原因，故選「My favorite season is fall because it is cool.」。'
  }),
  createItem({
    id: 'hwg_b8_bd_39',
    book: 8,
    unit: 'Unit 4',
    section: 'listening',
    taskType: 'L-RESP',
    difficulty: 2,
    audioText: 'How is the weather in winter in Iceland?',
    options: [
      'It is very cold and snowy.',
      'It is three hundred fifty dollars.',
      'I visited my cousin last Friday.',
      'We were at a restaurant for dinner.',
      'He plays basketball after school.',
      'They are my favorite blue jeans.',
      'Yes, I like to go camping.'
    ],
    explanation: '問句問「冰島冬天的天氣如何？」，應以天氣形容詞回答，故選「It is very cold and snowy.」。'
  }),
  createItem({
    id: 'hwg_b8_bd_40',
    book: 8,
    unit: 'Unit 4',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'Wait carefully when you drive up the mountain because it is very ______ and hard to see.',
    options: ['foggy', 'dry', 'sunny', 'warm', 'hot', 'clear', 'bright'],
    explanation: '視線模糊難以看清（hard to see）的天氣狀況是有霧的（foggy）。'
  }),
  createItem({
    id: 'hwg_b8_bd_41',
    book: 8,
    unit: 'Unit 4',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'Look at the white snow falling on the trees! Today is cold and ______.',
    options: ['snowy', 'wet', 'hot', 'warm', 'sunny', 'rainy', 'windy'],
    explanation: '樹上飄落白雪（white snow falling），對應的天氣形容詞是下雪的（snowy）。'
  }),
  createItem({
    id: 'hwg_b8_bd_42',
    book: 8,
    unit: 'Unit 4',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'In Taiwan, it is usually hot and ______ in summer, so bring an umbrella.',
    options: ['wet', 'snowy', 'freezing', 'dry', 'icy', 'cool', 'foggy'],
    explanation: '後半句提示要記得帶傘（bring an umbrella），可知天氣又熱又潮濕多雨（wet）。'
  }),
  createItem({
    id: 'hwg_b8_bd_43',
    book: 8,
    unit: 'Unit 4',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'A: ______ your sisters like winter? B: Yes, they love going to hot springs in winter.',
    options: ['Do', 'Does', 'Are', 'Is', 'Were', 'Was', 'Did'],
    explanation: '詢問「現在的喜好（like winter）」且主詞 your sisters 為複數名詞，疑問句助動詞須使用 Do。'
  }),
  createItem({
    id: 'hwg_b8_bd_44',
    book: 8,
    unit: 'Unit 4',
    section: 'grammar',
    taskType: 'G-CTX',
    difficulty: 2,
    question: '看到外國筆友來自北方雪國，你想問他「你們那裡秋天的天氣怎麼樣？」，應該怎麼問？',
    options: [
      'How is the weather in fall there?',
      'What did you wear last fall?',
      'Were you in Iceland last winter?',
      'How much is that winter coat?',
      'What do you do on rainy days?',
      'Which dress do you want to buy?',
      'Did it snow in summer yesterday?'
    ],
    explanation: '詢問特定季節（in fall）的天氣狀況，標準問句為「How is the weather in fall there?」。'
  }),
  createItem({
    id: 'hwg_b8_bd_45',
    book: 8,
    unit: 'Unit 4',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「Welcome to Iceland! In winter, the weather is freezing and snowy, and you can sometimes see green Northern Lights in the night sky. Best of all, you can relax in famous warm hot springs all year round, even when snow falls around you.」請問在冰島即使冬天也可以享受什麼活動？',
    options: ['泡溫暖的溫泉', '到海邊穿短褲衝浪', '去公園看相撲比賽', '吃西瓜和芒果冰', '穿無袖背心慢跑', '逛台北夜市', '到印度看泰姬瑪哈陵'],
    explanation: '短文第 3 句指出「you can relax in famous warm hot springs all year round（全年都可以泡在著名的溫暖溫泉裡）」。'
  }),

  // --- Review 2 & Festival (Clothes + Weather + Sports Around the World) ---
  createItem({
    id: 'hwg_b8_bd_46',
    book: 8,
    unit: 'Review 2',
    section: 'grammar',
    taskType: 'G-MC',
    difficulty: 2,
    question: 'It is cool and dry ______ fall. Let us put on our light jackets and go camping.',
    options: ['in', 'on', 'at', 'by', 'under', 'for', 'with'],
    explanation: '表達季節（spring / summer / fall / winter）時，前面固定搭配時間介系詞 in。'
  }),
  createItem({
    id: 'hwg_b8_bd_47',
    book: 8,
    unit: 'Review 2',
    section: 'grammar',
    taskType: 'G-CTX',
    difficulty: 2,
    question: '天氣突然變冷了，媽媽叫店員把櫥窗裡的黑色外套拿出來並問價格，她應該怎麼問？',
    options: [
      'Excuse me, how much is that black coat?',
      'Excuse me, where were my black jeans?',
      'Excuse me, did you see the Northern Lights?',
      'Excuse me, what did you do in summer?',
      'Excuse me, are those shorts warm enough?',
      'Excuse me, when does spring start here?',
      'Excuse me, who won the Olympic game?'
    ],
    explanation: '詢問單件櫥窗商品（that black coat）的價錢，禮貌說法為「Excuse me, how much is that black coat?」。'
  }),
  createItem({
    id: 'hwg_b8_bd_48',
    book: 8,
    unit: 'Festival',
    section: 'vocabulary',
    taskType: 'V-MEAN',
    difficulty: 2,
    question: 'Sumo is a traditional sport in Japan. Sumo wrestlers try to stay inside the ______ to win.',
    options: ['circle', 'square', 'triangle', 'theater', 'season', 'jacket', 'restaurant'],
    explanation: '日本相撲比賽規則為選手須留在土俵圓圈內（stay inside the circle），出界即落敗。'
  }),
  createItem({
    id: 'hwg_b8_bd_49',
    book: 8,
    unit: 'Festival',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「In the United Kingdom, polo is an exciting outdoor team sport. Players sit on horseback and ride across a large green field. They hold long mallets and hit a small white ball into the goal to score points for their team.」請問在英國馬球比賽中，選手是怎麼移動的？',
    options: ['騎在馬背上奔馳', '穿著冰鞋在冰面滑行', '站在圓圈裡推對方出界', '搭地鐵前往比賽會場', '沿著河邊慢跑熱身', '划著龍舟向前衝刺', '開著汽車繞過障礙物'],
    explanation: '短文第 2 句指出「Players sit on horseback and ride across a large green field.（選手騎在馬背上奔馳於大片綠草地上）」。'
  }),
  createItem({
    id: 'hwg_b8_bd_50',
    book: 8,
    unit: 'Festival',
    section: 'reading',
    taskType: 'R-COMP',
    difficulty: 2,
    question: '閱讀短文：「Different countries love different sports. Yesterday, Zack watched Japanese sumo at home, where wrestlers stay inside a circle. Meanwhile, Jenny visited a friend and watched American football, which has eleven players on each team. Charles watched British polo played on horseback.」請問昨日美式足球比賽每隊有幾名球員？',
    options: ['十一名球員', '四名球員', '五名球員', '八名球員', '兩名力士', '九名球員', '十五名球員'],
    explanation: '短文第 3 句指出「American football, which has eleven players on each team.（美式足球每隊有十一名球員）」。'
  })
];

const newItems = [...BOOK_7_NEW_ITEMS, ...BOOK_8_NEW_ITEMS];

// 載入既有題庫，確保若重跑腳本具有冪等性 (Idempotency)
const mcqMod = await import(pathToFileURL(mcqFilePath).href);
const existingBookMeta = mcqMod.HERE_WE_GO_BOOK_META;
const existingBank = mcqMod.HERE_WE_GO_MCQ_BANK.filter(
  q => !q.id.startsWith('hwg_b7_bd_') && !q.id.startsWith('hwg_b8_bd_')
);

const updatedBank = [...existingBank, ...newItems];

const bankHeader = `// -------------------------------------------------------------
// 翰林英語 Here We Go 全國首創小學全冊檢定題庫
// 本檔案由系統標準題庫正規化工具與擴充建置管線共同維護
// -------------------------------------------------------------

export const HERE_WE_GO_BOOK_META = ${JSON.stringify(existingBookMeta, null, 2)};

export const HERE_WE_GO_MCQ_BANK = ${JSON.stringify(updatedBank, null, 2)};
`;

fs.writeFileSync(mcqFilePath, bankHeader.replace(/\r\n/g, '\n'), 'utf8');

// 計算各冊與各單元最新 Canonical 統計數據
const bookCounts = {};
const unitCounts = {};

for (const q of updatedBank) {
  bookCounts[q.book] = (bookCounts[q.book] || 0) + 1;
  const unitKey = `b${q.book}_${q.unit}`;
  unitCounts[unitKey] = (unitCounts[unitKey] || 0) + 1;
}

const mappingMod = await import(pathToFileURL(mappingFilePath).href);
const currentLegacyMap = mappingMod.LEGACY_TO_CANONICAL_MAP || {};
const currentMetaMap = mappingMod.CANONICAL_META_MAP || {};

const nextLegacyMap = { ...currentLegacyMap };
const nextMetaMap = { ...currentMetaMap };

for (const item of newItems) {
  nextLegacyMap[item.id] = item.id;
  nextMetaMap[item.id] = {
    canonicalId: item.id,
    primaryScope: item.primaryScope,
    scopes: item.scopes,
    clones: []
  };
}

const nextStats = {
  totalLegacyMapped: Object.keys(nextLegacyMap).length,
  canonicalItems: updatedBank.length,
  duplicateClones: 1728,
  prunedClonesCount: 1728,
  crossBookIndependentSets: 22,
  bookCounts,
  unitCounts
};

const mappingContent = `/**
 * 課本題庫 Canonical Question 映射表與結構定義 (Scheme A + Batches A, B, C & D Expanded)
 *
 * 規範依據：
 * - 冊內正規化 (In-book Canonical)：現有 ${updatedBank.length} 題 (原 1,589 題 + Batch A 100 題 + Batch B 100 題 + Batch C 100 題 + Batch D 100 題)
 * - 已刪除同冊跨單元重複複本：1,728 筆
 * - 跨冊複現題目保留各自獨立進度：22 組
 * - 每冊保證獨立題目數 >= 100 題
 * - scopes 精準限制為原授課單元及對應 Review (長度 <= 2)，絕無全冊漫延
 */

export const CANONICAL_STATS = ${JSON.stringify(nextStats, null, 2)};

/** 舊題號 (legacyId) -> 標準題號 (canonicalId) 映射表 */
export const LEGACY_TO_CANONICAL_MAP = ${JSON.stringify(nextLegacyMap, null, 2)};

/** 標準題號 (canonicalId) -> 範圍與複本元資料 */
export const CANONICAL_META_MAP = ${JSON.stringify(nextMetaMap, null, 2)};

/**
 * 取得指定題號之 Canonical ID
 * @param {string} id 舊題號或標準題號
 * @returns {string}
 */
export function resolveCanonicalId(id) {
  if (!id) return id;
  return LEGACY_TO_CANONICAL_MAP[id] || id;
}

/**
 * 判定題號是否為 Canonical 題號
 * @param {string} id
 * @returns {boolean}
 */
export function isCanonicalId(id) {
  if (!id) return false;
  return Boolean(CANONICAL_META_MAP[id]);
}
`.replace(/\r\n/g, '\n');

fs.writeFileSync(mappingFilePath, mappingContent, 'utf8');

console.log(`✓ Added ${newItems.length} Batch D questions (Book 7: +50, Book 8: +50)`);
console.log(`✓ Updated HERE_WE_GO_MCQ_BANK total canonical items: ${updatedBank.length}`);
console.log(`✓ Book 7 count: ${bookCounts[7]}, Book 8 count: ${bookCounts[8]}`);
