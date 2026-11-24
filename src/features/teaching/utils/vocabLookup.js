import { isElementarySafeWord, isSafeDictionaryEntry } from '../../../services/profanityFilter.js';
import { ipaToKK } from '../data/vocabDictionary.js';

const onlineDictCache = new Map();

// 嚴格驗證音標字串：須為 /.../ 或 [...] 包夾之正規 IPA 符號，阻擋隨意英文句、HTML 或惡意文字
const SAFE_IPA_PATTERN = /^[/[][a-zæɑɒɔəɛɜɪʊʌθðʃʒŋɹɾɫɚɝʔːˈˌ.\-\s'()]{1,36}[/\]]$/;

const sanitizeSafeIpa = (raw) => {
  const cleaned = String(raw || '').trim();
  if (!cleaned || cleaned.length > 40) return '';
  if (!isElementarySafeWord(cleaned)) return '';
  if (!SAFE_IPA_PATTERN.test(cleaned)) return '';
  const body = cleaned.slice(1, -1).trim();
  if (!body || body.split(/\s+/).length > 2) return '';
  return cleaned;
};

const isUsAudioUrl = (audio = '') => {
  const lower = String(audio || '').toLowerCase();
  return /-us(?:\.|[-_/])|\/us\/|_us\.mp3/.test(lower);
};

/**
 * 安全線上字典查詢（僅於離線辭典未收錄之教師自訂生字觸發）
 * - 支援 AbortSignal，於切換冊課／關閉時立即取消過時請求
 * - Layer 1: 輸入先過 isElementarySafeWord（擋掉 fuxx、bxtch、全形、符號繞過）
 * - Layer 2: API 回傳詞條全面經過 isSafeDictionaryEntry（含各詞義 labels/tags/phonetic）+ 逐欄過濾
 */
export const lookupWordSafeOnline = async (rawWord = '', { signal } = {}) => {
  const clean = String(rawWord || '').trim();
  if (!clean) {
    return { ok: false, blocked: false, reason: 'empty' };
  }

  if (!isElementarySafeWord(clean)) {
    return {
      ok: false,
      blocked: true,
      reason: 'unsafe_input',
    };
  }

  const cacheKey = clean.toLowerCase();
  if (onlineDictCache.has(cacheKey)) {
    return onlineDictCache.get(cacheKey);
  }

  if (signal?.aborted) {
    return { ok: false, blocked: false, reason: 'aborted' };
  }

  const controller = new AbortController();
  const handleExternalAbort = () => controller.abort();
  signal?.addEventListener('abort', handleExternalAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), 4500);

  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cacheKey)}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      return { ok: false, blocked: false, reason: 'not_found' };
    }
    const entries = await res.json();
    if (!Array.isArray(entries) || entries.length === 0) {
      return { ok: false, blocked: false, reason: 'not_found' };
    }

    const first = entries[0];
    if (!entries.every((e) => isSafeDictionaryEntry(e))) {
      const blockedRes = { ok: false, blocked: true, reason: 'unsafe_entry' };
      onlineDictCache.set(cacheKey, blockedRes);
      return blockedRes;
    }

    const phoneticsList = Array.isArray(first.phonetics) ? first.phonetics : [];
    const usPhoneticEntry = phoneticsList.find(
      (p) => p?.text && isUsAudioUrl(p?.audio) && sanitizeSafeIpa(p.text)
    );
    const anyPhoneticEntry = phoneticsList.find((p) => p?.text && sanitizeSafeIpa(p.text));

    const usIpa = usPhoneticEntry ? sanitizeSafeIpa(usPhoneticEntry.text) : '';
    const fallbackIpa =
      usIpa || sanitizeSafeIpa(first.phonetic) || (anyPhoneticEntry ? sanitizeSafeIpa(anyPhoneticEntry.text) : '');
    const isUsIpa = Boolean(usIpa);
    const ipa = fallbackIpa;
    const kk = isUsIpa && ipa ? ipaToKK(ipa) : '';

    const firstMeaning = Array.isArray(first.meanings) ? first.meanings[0] : null;
    const firstDef = firstMeaning?.definitions?.[0] || null;
    const pos = firstMeaning?.partOfSpeech ? `${firstMeaning.partOfSpeech.slice(0, 4)}.` : 'word';

    const rawExample =
      first.meanings
        ?.flatMap((m) => m.definitions || [])
        .find((d) => d?.example && isElementarySafeWord(d.example))?.example || '';

    const synSet = new Set();
    const antSet = new Set();
    (first.meanings || []).forEach((m) => {
      (m.synonyms || []).forEach((s) => {
        if (s && isElementarySafeWord(s)) synSet.add(s);
      });
      (m.antonyms || []).forEach((a) => {
        if (a && isElementarySafeWord(a)) antSet.add(a);
      });
      (m.definitions || []).forEach((d) => {
        (d.synonyms || []).forEach((s) => {
          if (s && isElementarySafeWord(s)) synSet.add(s);
        });
        (d.antonyms || []).forEach((a) => {
          if (a && isElementarySafeWord(a)) antSet.add(a);
        });
      });
    });

    const data = {
      word: first.word && isElementarySafeWord(first.word) ? first.word : clean,
      ipa,
      kk,
      isUsIpa,
      syllables: [],
      hasVerifiedSyllables: false,
      pos,
      definitionEn:
        firstDef?.definition && isElementarySafeWord(firstDef.definition)
          ? firstDef.definition
          : '',
      example: rawExample ? { en: rawExample, zh: '' } : null,
      synonyms: Array.from(synSet).slice(0, 4),
      antonyms: Array.from(antSet).slice(0, 4),
      fromOnlineDict: true,
    };

    const okRes = { ok: true, blocked: false, data };
    onlineDictCache.set(cacheKey, okRes);
    return okRes;
  } catch (err) {
    const reason = signal?.aborted
      ? 'aborted'
      : err?.name === 'AbortError'
        ? 'timeout'
        : 'network_error';
    return {
      ok: false,
      blocked: false,
      reason,
    };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', handleExternalAbort);
  }
};
