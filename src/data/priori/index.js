import {
  PRIORI_114_MATH_G3_META,
  PRIORI_114_MATH_G3_QUESTIONS,
} from './priori114MathG3.js';
import {
  PRIORI_114_CHINESE_G3_META,
  PRIORI_114_CHINESE_G3_QUESTIONS,
} from './priori114ChineseG3.js';
import {
  PRIORI_114_ENGLISH_G3_META,
  PRIORI_114_ENGLISH_G3_QUESTIONS,
} from './priori114EnglishG3.js';
import {
  PRIORI_115_MATH_G3_META,
  PRIORI_115_MATH_G3_QUESTIONS,
} from './priori115MathG3.js';

export {
  PRIORI_114_MATH_G3_META,
  PRIORI_114_MATH_G3_QUESTIONS,
  PRIORI_114_CHINESE_G3_META,
  PRIORI_114_CHINESE_G3_QUESTIONS,
  PRIORI_114_ENGLISH_G3_META,
  PRIORI_114_ENGLISH_G3_QUESTIONS,
  PRIORI_115_MATH_G3_META,
  PRIORI_115_MATH_G3_QUESTIONS,
};

export const PRIORI_SUBJECTS = [
  {
    id: 'math',
    label: '數學科',
    enLabel: 'Mathematics',
    description: '計算概念、單位換算、分數與幾何圖形（附互動方格計算紙與分科錯題沉底特訓）',
    availableGrades: [3],
  },
  {
    id: 'chinese',
    label: '國語科',
    enLabel: 'Mandarin',
    description: '國字注音、語詞句意與左文右題閱讀理解（附原卷注音圖與分科錯題沉底特訓）',
    availableGrades: [3],
  },
  {
    id: 'english',
    label: '英語科',
    enLabel: 'English',
    description: '聽音寫大小寫字母、字音聽辨與生活看圖題（附國教署官方聽力原音 MP3）',
    availableGrades: [3],
  },
];

export const PRIORI_PAPERS = [
  {
    ...PRIORI_114_MATH_G3_META,
    questions: PRIORI_114_MATH_G3_QUESTIONS,
    status: 'published',
  },
  {
    ...PRIORI_115_MATH_G3_META,
    questions: PRIORI_115_MATH_G3_QUESTIONS,
    status: 'published',
  },
  {
    ...PRIORI_114_CHINESE_G3_META,
    questions: PRIORI_114_CHINESE_G3_QUESTIONS,
    status: 'published',
  },
  {
    ...PRIORI_114_ENGLISH_G3_META,
    questions: PRIORI_114_ENGLISH_G3_QUESTIONS,
    status: 'published',
  },
];

export const PRIORI_PAPER_MAP = Object.fromEntries(
  PRIORI_PAPERS.map((paper) => [paper.paperId, paper])
);

export const PRIORI_QUESTION_INDEX = Object.fromEntries(
  PRIORI_PAPERS.flatMap((paper) =>
    paper.questions.map((q) => [q.id, { paper, question: q }])
  )
);

export const PRIORI_STATS = {
  totalPapers: PRIORI_PAPERS.length,
  totalQuestions: PRIORI_PAPERS.reduce((sum, p) => sum + p.questions.length, 0),
};
