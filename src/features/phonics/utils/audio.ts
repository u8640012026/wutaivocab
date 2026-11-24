import type { PhonicsCard } from '../types/phonics';
import { isElementarySafeWord } from '../../../services/profanityFilter';

// Audio Context singleton for pure Web Audio API sound synthesis & audio buffer playback
let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export async function ensureAudioContext(): Promise<AudioContext | null> {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {}
  }
  return ctx;
}

// UI Sound Effects
export function playCardSnapSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.10, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

export function playRemoveSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(560, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

export function playSuccessChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = ctx.currentTime + index * 0.1;
    const duration = 0.35;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.18, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}

export function playErrorBonk() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.25);

  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

// ============================================================================
// Tier 1: Real Native Human Studio Audio Cache (/audio/phonics/[id].mp3) & Blends
// ============================================================================
const phonemeAudioBufferCache: Record<string, AudioBuffer | null> = {};

// Component definitions for Consonant Blends (Beginning & Ending Blends)
const BLEND_COMPONENTS: Record<string, [string, string]> = {
  // Beginning Blends
  'bl': ['b', 'l'],
  'cl': ['ck', 'l'],
  'fl': ['f', 'l'],
  'gl': ['g', 'l'],
  'pl': ['p', 'l'],
  'sl': ['s', 'l'],
  'br': ['b', 'r'],
  'cr': ['ck', 'r'],
  'dr': ['d', 'r'],
  'fr': ['f', 'r'],
  'gr': ['g', 'r'],
  'pr': ['p', 'r'],
  'tr': ['t', 'r'],
  'sk': ['s', 'ck'],
  'sm': ['s', 'm'],
  'sn': ['s', 'n'],
  'sp': ['s', 'p'],
  'st': ['s', 't'],
  'sw': ['s', 'w'],

  // Ending Blends
  'nd': ['n', 'd'],
  'nk': ['ng', 'ck'],
  'nt': ['n', 't'],
  'mp': ['m', 'p'],
  'ld': ['l', 'd'],
  'lk': ['l', 'ck'],
  'ft': ['f', 't'],
};

async function getOrLoadBaseBuffer(ctx: AudioContext, soundName: string): Promise<AudioBuffer | null> {
  if (phonemeAudioBufferCache[soundName]) {
    return phonemeAudioBufferCache[soundName];
  }
  if (phonemeAudioBufferCache[soundName] === null) {
    return null;
  }
  
  // Try .wav first (lossless studio recordings / blends), then .mp3
  const extensions = ['.wav', '.mp3'];
  for (const ext of extensions) {
    try {
      const res = await fetch(`/audio/phonics/${soundName}${ext}`);
      if (res.ok) {
        const ab = await res.arrayBuffer();
        const buffer = await ctx.decodeAudioData(ab);
        phonemeAudioBufferCache[soundName] = buffer;
        return buffer;
      }
    } catch {}
  }

  phonemeAudioBufferCache[soundName] = null;
  return null;
}

function playBuffer(ctx: AudioContext, buffer: AudioBuffer): Promise<boolean> {
  return new Promise((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.95, ctx.currentTime);
    source.connect(gain);
    gain.connect(ctx.destination);

    let finished = false;
    const done = () => {
      if (!finished) {
        finished = true;
        resolve(true);
      }
    };
    source.onended = done;
    setTimeout(done, Math.ceil(buffer.duration * 1000) + 60);
    try {
      source.start(0);
    } catch {
      done();
    }
  });
}

function createBlendedAudioBuffer(
  ctx: AudioContext,
  buf1: AudioBuffer,
  buf2: AudioBuffer,
  firstPartDurationSec: number
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const numSamples1 = Math.min(buf1.length, Math.max(1, Math.floor(sampleRate * firstPartDurationSec)));
  const crossfadeSamples = Math.min(Math.floor(sampleRate * 0.015), Math.floor(numSamples1 / 2));
  const numSamples2 = Math.min(buf2.length, Math.floor(sampleRate * 0.35));

  const totalLength = numSamples1 - crossfadeSamples + numSamples2;
  const blendedBuffer = ctx.createBuffer(1, Math.max(1, totalLength), sampleRate);
  const out = blendedBuffer.getChannelData(0);

  const d1 = buf1.getChannelData(0);
  const d2 = buf2.getChannelData(0);

  // 1. First sound prior to crossfade
  for (let i = 0; i < numSamples1 - crossfadeSamples; i++) {
    out[i] = d1[i];
  }

  // 2. Crossfade window
  const crossfadeStart = numSamples1 - crossfadeSamples;
  for (let i = 0; i < crossfadeSamples; i++) {
    const ratio = i / crossfadeSamples;
    const s1 = d1[crossfadeStart + i] || 0;
    const s2 = d2[i] || 0;
    out[crossfadeStart + i] = s1 * (1 - ratio) + s2 * ratio;
  }

  // 3. Second sound following crossfade
  for (let i = crossfadeSamples; i < numSamples2; i++) {
    const targetIdx = crossfadeStart + i;
    if (targetIdx < totalLength) {
      out[targetIdx] = d2[i];
    }
  }

  return blendedBuffer;
}

/**
 * Attempts to play studio-recorded native human pure audio from /audio/phonics/
 * (e.g. authentic Oxford Phonics World recordings for blends, phonemes, vowels)
 * or dynamically synthesize consonant blends if no direct recording is found.
 * Returns true if played with 0ms latency.
 */
const PHONEME_AUDIO_FILE_ALIASES: Record<string, string[]> = {
  vt_ow: ['oa', 'vt_oa'],       // /oʊ/ 對應 B5 U3 (snow)
  vt_ow_au: ['ou', 'vt_ou'],    // /aʊ/ 對應 B7 U4 (cow)
  vt_ui: ['ue', 'vt_oo'],       // /uː/ 對應 B5 U4 (fruit)
  vt_y: ['ie', 'vt_igh'],       // /aɪ/ 對應 B5 U2 (sky / cry)
};

export async function playPhonemeAudioFile(card: PhonicsCard): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;

  const cleanGrapheme = card.grapheme.toLowerCase().replace(/[^a-z]/g, '');

  // Step 1: Direct static file lookup (aliases first, then card.id, cleanGrapheme, and prefixes)
  // Tries lossless .wav first (e.g. authentic studio blend recordings), then .mp3
  const aliasKeys = PHONEME_AUDIO_FILE_ALIASES[card.id] || [];
  const candidateKeys = [
    ...aliasKeys,
    card.id,
    cleanGrapheme,
    `bb_${cleanGrapheme}`,
    `eb_${cleanGrapheme}`,
    `cd_${cleanGrapheme}`,
    `bc_${cleanGrapheme}`,
    `vt_${cleanGrapheme}`,
    `rc_${cleanGrapheme}`,
    `sl_${cleanGrapheme}`,
    `v_${cleanGrapheme}`,
    `se_${cleanGrapheme}`,
  ].filter(Boolean);

  for (const key of candidateKeys) {
    if (phonemeAudioBufferCache[key] === null) {
      continue;
    }

    let buffer = phonemeAudioBufferCache[key];
    if (!buffer) {
      buffer = await getOrLoadBaseBuffer(ctx, key);
    }

    if (buffer) {
      return playBuffer(ctx, buffer);
    }
  }

  // Step 2: Fallback programmatic blend if no direct studio recording file was found
  const blendPair = BLEND_COMPONENTS[cleanGrapheme];
  if (blendPair) {
    const [c1, c2] = blendPair;
    const blendCacheKey = `blend_${cleanGrapheme}`;
    if (phonemeAudioBufferCache[blendCacheKey]) {
      return playBuffer(ctx, phonemeAudioBufferCache[blendCacheKey]!);
    }

    const [buf1, buf2] = await Promise.all([
      getOrLoadBaseBuffer(ctx, c1),
      getOrLoadBaseBuffer(ctx, c2),
    ]);

    if (buf1 && buf2) {
      let firstDuration = 0.08;
      if (c1 === 's' || c1 === 'f') {
        firstDuration = 0.12;
      } else if (c1 === 'm' || c1 === 'n' || c1 === 'ng' || c1 === 'l') {
        firstDuration = 0.13;
      }

      const blended = createBlendedAudioBuffer(ctx, buf1, buf2, firstDuration);
      phonemeAudioBufferCache[blendCacheKey] = blended;
      return playBuffer(ctx, blended);
    }
  }

  return false;
}

// ============================================================================
// Tier 2: Pure Acoustic Formant Model for American Short Vowels (Fallback)
// ============================================================================
interface FormantSpec {
  f1: number;
  f2: number;
  f3: number;
  f4: number;
  bw1: number;
  bw2: number;
  bw3: number;
  bw4: number;
  g1: number;
  g2: number;
  g3: number;
  g4: number;
}

const SHORT_VOWEL_FORMANTS: Record<'a' | 'e' | 'i' | 'o' | 'u', FormantSpec> = {
  'a': {
    f1: 850, f2: 1720, f3: 2650, f4: 3500,
    bw1: 80, bw2: 110, bw3: 140, bw4: 200,
    g1: 1.0, g2: 0.60, g3: 0.28, g4: 0.10,
  },
  'e': {
    f1: 540, f2: 1850, f3: 2600, f4: 3600,
    bw1: 70, bw2: 90,  bw3: 130, bw4: 200,
    g1: 1.0, g2: 0.50, g3: 0.22, g4: 0.08,
  },
  'i': {
    f1: 390, f2: 2150, f3: 2750, f4: 3650,
    bw1: 60, bw2: 85,  bw3: 125, bw4: 200,
    g1: 1.0, g2: 0.45, g3: 0.20, g4: 0.08,
  },
  'o': {
    f1: 600, f2: 960,  f3: 2450, f4: 3400,
    bw1: 70, bw2: 90,  bw3: 140, bw4: 200,
    g1: 1.0, g2: 0.65, g3: 0.18, g4: 0.06,
  },
  'u': {
    f1: 650, f2: 1220, f3: 2550, f4: 3500,
    bw1: 70, bw2: 90,  bw3: 130, bw4: 200,
    g1: 1.0, g2: 0.55, g3: 0.20, g4: 0.06,
  },
};

const vowelBufferCache: Partial<Record<'a' | 'e' | 'i' | 'o' | 'u', AudioBuffer>> = {};

function createVowelBuffer(ctx: AudioContext, vowel: 'a' | 'e' | 'i' | 'o' | 'u'): AudioBuffer {
  const spec = SHORT_VOWEL_FORMANTS[vowel];
  const sampleRate = ctx.sampleRate || 44100;
  const duration = 0.36;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const channelData = buffer.getChannelData(0);

  function makeResonator(f: number, bw: number) {
    const r = Math.exp((-Math.PI * bw) / sampleRate);
    const theta = (2 * Math.PI * f) / sampleRate;
    const a1 = 2 * r * Math.cos(theta);
    const a2 = -r * r;
    const b0 = (1 - r) * Math.sin(theta);
    let y1 = 0;
    let y2 = 0;
    return (x: number) => {
      const y = b0 * x + a1 * y1 + a2 * y2;
      y2 = y1;
      y1 = y;
      return y;
    };
  }

  const r1 = makeResonator(spec.f1, spec.bw1);
  const r2 = makeResonator(spec.f2, spec.bw2);
  const r3 = makeResonator(spec.f3, spec.bw3);
  const r4 = makeResonator(spec.f4, spec.bw4);

  let phase = 0;
  let maxAbs = 0;
  const rawSignal = new Float32Array(numSamples);

  for (let n = 0; n < numSamples; n++) {
    const t = n / sampleRate;
    const f0 = 208 - 26 * (t / duration) + 1.8 * Math.sin(2 * Math.PI * 5 * t);
    phase += f0 / sampleRate;
    if (phase >= 1.0) phase -= 1.0;

    let glottal = 0;
    if (phase < 0.68) {
      glottal = Math.sin((Math.PI * phase) / 0.68);
    } else {
      glottal = -Math.exp(-12 * (phase - 0.68)) * 0.35;
    }

    let env = 1.0;
    if (t < 0.02) {
      env = t / 0.02;
    } else if (t > duration - 0.07) {
      const rel = (duration - t) / 0.07;
      env = Math.max(0, rel * rel);
    }

    const noise = (Math.random() * 2 - 1) * 0.012;
    const excitation = (glottal + noise) * env;

    const out =
      r1(excitation) * spec.g1 +
      r2(excitation) * spec.g2 +
      r3(excitation) * spec.g3 +
      r4(excitation) * spec.g4;

    rawSignal[n] = out;
    const absVal = Math.abs(out);
    if (absVal > maxAbs) maxAbs = absVal;
  }

  const scale = maxAbs > 0 ? 0.85 / maxAbs : 1.0;
  for (let n = 0; n < numSamples; n++) {
    channelData[n] = Math.max(-1, Math.min(1, rawSignal[n] * scale));
  }

  return buffer;
}

export function playVowelFormant(vowel: 'a' | 'e' | 'i' | 'o' | 'u'): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    if (!ctx) {
      resolve();
      return;
    }

    if (!vowelBufferCache[vowel]) {
      vowelBufferCache[vowel] = createVowelBuffer(ctx, vowel);
    }
    const buffer = vowelBufferCache[vowel]!;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.9, now);
    source.connect(gain);
    gain.connect(ctx.destination);

    let finished = false;
    const done = () => {
      if (!finished) {
        finished = true;
        resolve();
      }
    };
    source.onended = done;
    setTimeout(done, Math.ceil(buffer.duration * 1000) + 50);

    try {
      source.start(now);
    } catch {
      done();
    }
  });
}

// Phonetic symbol hints for SpeechSynthesis (pure sounds only)
const PHONEME_SPEECH_MAP: Record<string, string> = {
  // Silent e / Split digraphs (alphabet long sounds)
  'a_e': 'A',
  'e_e': 'E',
  'i_e': 'I',
  'o_e': 'O',
  'u_e': 'U',

  // Vowel Teams
  'ai': 'A',
  'ay': 'A',
  'ee': 'E',
  'ea': 'E',
  'igh': 'I',
  'oa': 'O',
  'ow': 'ow',
  'oi': 'oy',
  'oy': 'oy',
  'ou': 'ow',
  'oo': 'oo',
  'au': 'aw',
  'aw': 'aw',
  'ew': 'U',
  'ie': 'I',
  'ue': 'oo',
  'ui': 'oo',
  'y(i)': 'I',
  'ow(au)': 'ow',

  // Bossy R
  'ar': 'are',
  'er': 'er',
  'ir': 'er',
  'or': 'or',
  'ur': 'er',
  'air': 'air',
  'are': 'air',
  'ear': 'ear',
  'ore': 'or',

  // Silent Letters & Rules
  'kn': 'n',
  'wr': 'r',
  'gn': 'n',
  'mb': 'm',
  'tch': 'ch',
  'dge': 'j',
  'c(s)': 's',
  'g(j)': 'j',

  // Beginning Blends (Fallback safety - phonetic single sounds, unaspirated stop for s-clusters)
  'bl': 'bl',
  'cl': 'kl',
  'fl': 'fl',
  'gl': 'gl',
  'pl': 'pl',
  'sl': 'sl',
  'br': 'br',
  'cr': 'kr',
  'dr': 'dr',
  'fr': 'fr',
  'gr': 'gr',
  'pr': 'pr',
  'tr': 'tr',
  'sk': 'sk',
  'sm': 'sm',
  'sn': 'sn',
  'sp': 'sb',
  'st': 'sd',
  'sw': 'sw',

  // Ending Blends (Fallback safety)
  'nd': 'nd',
  'nk': 'nk',
  'nt': 'nt',
  'mp': 'mp',
  'ld': 'ld',
  'lk': 'lk',
  'ft': 'ft',
};

// Anchor words for short vowels when explicitly in 'word' mode
const VOWEL_ANCHORS: Record<string, string> = {
  'a': 'apple',
  'e': 'egg',
  'i': 'igloo',
  'o': 'octopus',
  'u': 'umbrella',
};

let preferredEnglishVoice: SpeechSynthesisVoice | null = null;

function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (preferredEnglishVoice) return preferredEnglishVoice;
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  const naturalUS = voices.find(
    (v) =>
      (v.lang.startsWith('en-US') || v.lang.startsWith('en_US')) &&
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny'))
  );
  if (naturalUS) {
    preferredEnglishVoice = naturalUS;
    return naturalUS;
  }
  const anyUS = voices.find((v) => v.lang.startsWith('en-US') || v.lang.startsWith('en_US'));
  if (anyUS) {
    preferredEnglishVoice = anyUS;
    return anyUS;
  }
  const anyEN = voices.find((v) => v.lang.startsWith('en'));
  if (anyEN) {
    preferredEnglishVoice = anyEN;
    return anyEN;
  }
  return null;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    preferredEnglishVoice = null;
    getEnglishVoice();
  };
}

export type PronunciationMode = 'phoneme' | 'word';

/**
 * Speaks a phonics card.
 * - Mode 'word': Speaks the anchor word (e.g. apple, chair, ship, blue).
 * - Mode 'phoneme':
 *   1. Plays studio-recorded native human audio or blended consonant cluster from /audio/phonics/ (0ms latency, pure KK sound).
 *   2. If not found and it's a short vowel: falls back to Web Audio acoustic formant synthesis (/æ/, /ɛ/, /ɪ/, /ɒ/, /ʌ/).
 *   3. If other card: fallback to clean speech synthesis without spelling letters.
 */
export async function speakPhoneme(card: PhonicsCard, mode: PronunciationMode = 'phoneme'): Promise<void> {
  if (
    !isElementarySafeWord(card.grapheme) ||
    (card.displayText && !isElementarySafeWord(card.displayText))
  ) {
    return;
  }

  const g = card.grapheme.toLowerCase();

  // In 'word' mode: speak standard anchor word
  if (mode === 'word') {
    const word = VOWEL_ANCHORS[g] || card.sampleWord || g;
    if (!isElementarySafeWord(word)) return;
    await speakWord(word, 0.85);
    return;
  }

  // --- In 'phoneme' mode (pure KK phonetic symbol / blend / letter sound) ---

  // Tier 1: Try playing authentic native speaker studio recording or blended consonant cluster
  const playedRealAudio = await playPhonemeAudioFile(card);
  if (playedRealAudio) {
    return;
  }

  // Tier 2: For 5 basic short vowels, fallback to pure Web Audio acoustic formant synthesis (0ms)
  if (card.category === 'short_vowels' && (g === 'a' || g === 'e' || g === 'i' || g === 'o' || g === 'u')) {
    await playVowelFormant(g as 'a' | 'e' | 'i' | 'o' | 'u');
    return;
  }

  // Tier 3: Other cards via Web Speech API
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve();
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utteranceText =
      PHONEME_SPEECH_MAP[card.grapheme] || card.grapheme.replace(/[^a-zA-Z]/g, '');
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.lang = 'en-US';
    utterance.rate = 0.82;
    utterance.pitch = 1.05;

    const voice = getEnglishVoice();
    if (voice) utterance.voice = voice;

    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };

    utterance.onend = finish;
    utterance.onerror = finish;
    setTimeout(finish, 1000);

    window.speechSynthesis.speak(utterance);
  });
}

export function speakWord(word: string, rate: number = 0.85): Promise<void> {
  if (!isElementarySafeWord(word)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve();
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanWord);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voice = getEnglishVoice();
    if (voice) utterance.voice = voice;

    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };

    utterance.onend = finish;
    utterance.onerror = finish;
    setTimeout(finish, 1500);

    window.speechSynthesis.speak(utterance);
  });
}

// Blends phonemes sequentially with highlight callback
export async function blendPhonemeSequence(
  cards: PhonicsCard[],
  isSlow: boolean,
  onHighlight: (index: number | null) => void,
  blendedWord: string,
  mode: PronunciationMode = 'phoneme'
): Promise<void> {
  if (cards.length === 0) return;

  // Step 1: Speak each phoneme sequentially
  for (let i = 0; i < cards.length; i++) {
    onHighlight(i);
    await speakPhoneme(cards[i], mode);
    const pauseTime = isSlow ? 650 : 380;
    await new Promise((r) => setTimeout(r, pauseTime));
  }

  // Brief pause before blending all together
  onHighlight(null);
  await new Promise((r) => setTimeout(r, 220));

  // Step 2: Highlight entire board (-1 flag for all) and speak combined word
  onHighlight(-1);
  await speakWord(blendedWord, isSlow ? 0.75 : 0.88);
  await new Promise((r) => setTimeout(r, 400));
  onHighlight(null);
}
