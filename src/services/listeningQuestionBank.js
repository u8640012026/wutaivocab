import { DIALOGUE_VARIANTS } from '../games/town/townDialogueData.js';
import { VISITING_TEACHER_VARIANTS } from '../games/town/townData.js';

/**
 * 收集小鎮 50 套生活對話樹中所有高頻核心句型與情境問答
 */
const rawSentencePool = [];
const rawQAPool = [];

function extractAllData() {
  if (rawSentencePool.length > 0) return;

  const sources = [DIALOGUE_VARIANTS, VISITING_TEACHER_VARIANTS].filter(Boolean);

  sources.forEach(source => {
    Object.values(source).forEach(variants => {
      if (!Array.isArray(variants)) return;
      variants.forEach(variant => {
        if (!variant?.nodes) return;
        const nodes = Object.values(variant.nodes);

        nodes.forEach(node => {
          // 1. 提取節點自然英語句子 (NPC 說的話)
          if (node.en && node.zh && node.en.trim().length >= 4 && !/[\u4e00-\u9fa5]/.test(node.en) && /[a-zA-Z]{2,}/.test(node.en)) {
            rawSentencePool.push({
              id: `node_${node.id || Math.random()}`,
              en: node.en.trim(),
              zh: node.zh.trim(),
              speaker: node.speaker || '對話者'
            });
          }

          // 2. 提取選項句子與問答配對 (學生回應選項)
          if (Array.isArray(node.options)) {
            node.options.forEach((opt, optIdx) => {
              const textEn = opt.text_en?.trim();
              const textZh = opt.text_zh?.trim();
              if (textEn && textZh && textEn.length >= 4 && !/[\u4e00-\u9fa5]/.test(textEn) && /[a-zA-Z]{2,}/.test(textEn) && opt.target_id !== 'END' && !opt.action?.startsWith('OPEN_')) {
                // 做為純句子庫候選
                rawSentencePool.push({
                  id: `opt_${optIdx}_${Math.random()}`,
                  en: textEn,
                  zh: textZh,
                  speaker: '學生'
                });

                // 做為情境問答 QA 候選 (node.en 提問 -> opt.text_en 應答)
                if (node.en && node.zh) {
                  rawQAPool.push({
                    id: `qa_${node.id}_${optIdx}`,
                    speaker: node.speaker || '對話者',
                    questionEn: node.en.trim(),
                    questionZh: node.zh.trim(),
                    replyEn: textEn,
                    replyZh: textZh
                  });
                }
              }
            });
          }
        });
      });
    });
  });
}

// 正規化顯示文字（杜絕不同對話重複相同回覆造成四選一出現重複選項）
function normalizeOptionText(text) {
  return String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// 隨機重組陣列
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 取得句子辨聽測驗題目 (聽音選正確句子)
 * @param {number} count 題目數量
 */
export function getSentenceListeningQuestions(count = 20) {
  extractAllData();

  // 去重 (依小寫英文字串)
  const uniqueMap = new Map();
  rawSentencePool.forEach(item => {
    const key = item.en.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });

  const uniqueSentences = Array.from(uniqueMap.values());
  const shuffled = shuffleArray(uniqueSentences);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((item, index) => {
    // 挑選 3 個顯示文字互異的干擾句
    const otherSentences = uniqueSentences.filter(s => s.en !== item.en);
    const shuffledOthers = shuffleArray(otherSentences);
    const usedSentenceKeys = new Set([normalizeOptionText(item.en)]);
    const distractors = [];
    for (const candidate of shuffledOthers) {
      if (distractors.length >= 3) break;
      const candKey = normalizeOptionText(candidate.en);
      if (!candKey || usedSentenceKeys.has(candKey)) continue;
      usedSentenceKeys.add(candKey);
      distractors.push(candidate);
    }

    const rawOptions = [
      { textEn: item.en, textZh: item.zh, isCorrect: true },
      ...distractors.map(d => ({ textEn: d.en, textZh: d.zh, isCorrect: false }))
    ];

    const shuffledOptions = shuffleArray(rawOptions).map((opt, optIndex) => ({
      ...opt,
      key: String.fromCharCode(65 + optIndex) // 'A', 'B', 'C', 'D'
    }));

    return {
      id: `sentence_${index}_${Date.now()}`,
      subMode: 'sentence',
      speaker: item.speaker,
      audioText: item.en,
      correctEn: item.en,
      correctZh: item.zh,
      promptZh: '請聆聽發音，選出聽到的完整句子：',
      promptEn: 'Listen and choose the sentence you heard:',
      options: shuffledOptions
    };
  });
}

/**
 * 取得情境問答聽力測驗題目 (聽情境問句，選出最得體最適當的應答句)
 * @param {number} count 題目數量
 */
export function getDialogueQAQuestions(count = 20) {
  extractAllData();

  // 去重 (以問句+答句組合為鍵)
  const uniqueMap = new Map();
  rawQAPool.forEach(item => {
    const key = `${item.questionEn}_${item.replyEn}`.toLowerCase();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });

  const uniqueQAList = Array.from(uniqueMap.values());
  const shuffled = shuffleArray(uniqueQAList);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((item, index) => {
    // 挑選 3 個來自其他對話且實際顯示回覆文字互異的干擾項（杜絕重複選項）
    const otherReplies = uniqueQAList.filter(q => q.questionEn !== item.questionEn);
    const shuffledOthers = shuffleArray(otherReplies);
    const usedReplyKeys = new Set([normalizeOptionText(item.replyEn)]);
    const distractors = [];
    for (const candidate of shuffledOthers) {
      if (distractors.length >= 3) break;
      const candKey = normalizeOptionText(candidate.replyEn);
      if (!candKey || usedReplyKeys.has(candKey)) continue;
      usedReplyKeys.add(candKey);
      distractors.push(candidate);
    }

    const rawOptions = [
      { textEn: item.replyEn, textZh: item.replyZh, isCorrect: true },
      ...distractors.map(d => ({ textEn: d.replyEn, textZh: d.replyZh, isCorrect: false }))
    ];

    const shuffledOptions = shuffleArray(rawOptions).map((opt, optIndex) => ({
      ...opt,
      key: String.fromCharCode(65 + optIndex) // 'A', 'B', 'C', 'D'
    }));

    return {
      id: `qa_${index}_${Date.now()}`,
      subMode: 'qa',
      speaker: item.speaker,
      audioText: item.questionEn,
      questionZh: item.questionZh,
      correctEn: item.replyEn,
      correctZh: item.replyZh,
      promptZh: `${item.speaker || '對話者'} 說：(請選出最適當的回應)`,
      promptEn: `${item.speaker || 'Speaker'} asks: (Choose the best response)`,
      options: shuffledOptions
    };
  });
}
