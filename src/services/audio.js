// ── Web Audio 音效合成、吉卜力原聲 BGM 平滑播放器與多角色美語語音指紋引擎 ──

// ============================================================================
// 一、 多角色美語語音指紋管理器 (Voice Persona Registry & Voice Fallback Chain)
// ============================================================================

export const PERSONAS = {
  // 0. 標準清晰美式英語（全站單字／句型／聽力／拼寫／手寫預設發音引擎，絕不降音調或混入機械口音）
  standard_us: {
    id: 'standard_us',
    nameZh: '標準美式英語',
    preferredVoices: [
      'Microsoft Ava Online (Natural)',
      'Microsoft Jenny Online (Natural)',
      'Microsoft Aria Online (Natural)',
      'Microsoft Andrew Online (Natural)',
      'Microsoft Guy Online (Natural)',
      'Microsoft Michelle Online (Natural)',
      'Natural',
      'Samantha (Enhanced)',
      'Ava (Enhanced)',
      'Nicky (Enhanced)',
      'Allison (Enhanced)',
      'Ava',
      'Nicky',
      'Samantha',
      'Aaron',
      'Google US English',
      'Microsoft Aria',
      'Microsoft Jenny',
      'Microsoft Zira',
      'Microsoft David'
    ],
    lang: 'en-US',
    gender: 'neutral',
    pitch: 1.0,
    rate: 0.92,
    strictLang: true
  },

  // 1. 客座外師 Mario (熱情陽光美式男外師，高頻動感、節奏明快)
  mario: {
    id: 'mario',
    nameZh: '客座外師 Mario',
    preferredVoices: ['Guy', 'Microsoft Guy', 'Christopher', 'Nathan', 'Alex', 'David', 'Google US English'],
    lang: 'en-US',
    gender: 'male',
    pitch: 1.05,
    rate: 1.05
  },

  // 2. 客座外師 Ibu (加州陽光親切美式女外師，柔和親切、溫暖易懂)
  ibu: {
    id: 'ibu',
    nameZh: '客座外師 Ibu',
    preferredVoices: ['Jenny', 'Microsoft Jenny', 'Aria', 'Samantha', 'Zira', 'Google US English'],
    lang: 'en-US',
    gender: 'female',
    pitch: 1.08,
    rate: 0.94
  },

  // 3. 霧臺國小 老校長 Principal Hawk (智慧威嚴典雅的英國紳士)
  school: {
    id: 'school',
    nameZh: '老校長 Principal Hawk',
    preferredVoices: ['George', 'Oliver', 'Daniel', 'Google UK English Male', 'en-GB'],
    lang: 'en-GB',
    gender: 'male',
    pitch: 0.80,
    rate: 0.82,
    accent: 'en-GB'
  },

  // 4. 黑熊超市 黑熊店員 Clerk Bear (渾厚低沉壯碩的大黑熊，語調沉著踏實)
  supermarket: {
    id: 'supermarket',
    nameZh: '黑熊店員 Clerk Bear',
    preferredVoices: ['Eric', 'Microsoft Eric', 'David', 'Microsoft David', 'Google UK English Male'],
    lang: 'en-US',
    gender: 'male',
    pitch: 0.62,
    rate: 0.78
  },

  // 5. 山豬影城 野豬售票員 Clerk Boar (粗獷豪爽熱情的野豬，帶叫賣穿透力)
  cinema: {
    id: 'cinema',
    nameZh: '野豬售票員 Clerk Boar',
    preferredVoices: ['Roger', 'Microsoft Roger', 'Steffan', 'David', 'Alex'],
    lang: 'en-US',
    gender: 'male',
    pitch: 0.70,
    rate: 0.95
  },

  // 6. 霧臺客運站 雄鷹站長 Station Master Eagle (俐落威嚴自信的軍旅出發感)
  station: {
    id: 'station',
    nameZh: '雄鷹站長 Station Master Eagle',
    preferredVoices: ['Mark', 'Microsoft Mark', 'Christopher', 'Microsoft David'],
    lang: 'en-US',
    gender: 'male',
    pitch: 0.85,
    rate: 0.90
  },

  // 7. 貓頭鷹診所 貓頭鷹醫師 Dr. Owl (溫和理性撫慰安心的男醫師，慢條斯理)
  clinic: {
    id: 'clinic',
    nameZh: '貓頭鷹醫師 Dr. Owl',
    preferredVoices: ['Arthur', 'Daniel', 'David', 'Google US English'],
    lang: 'en-US',
    gender: 'male',
    pitch: 0.78,
    rate: 0.82
  },

  // 8. 雲豹書局 雲豹店長 Manager Leopard (熱情儒雅書卷氣的青年店長，清晰溫和)
  bookstore: {
    id: 'bookstore',
    nameZh: '雲豹店長 Manager Leopard',
    preferredVoices: ['Nathan', 'Christopher', 'David', 'Alex'],
    lang: 'en-US',
    gender: 'male',
    pitch: 0.96,
    rate: 0.94
  },

  // 9. 飛鼠公園 飛鼠長老 Elder Squirrel (靈巧敏捷快嘴的飛鼠老爺爺，輕快活潑)
  park: {
    id: 'park',
    nameZh: '飛鼠長老 Elder Squirrel',
    preferredVoices: ['Alex', 'Guy', 'David'],
    lang: 'en-US',
    gender: 'male',
    pitch: 1.15,
    rate: 0.98
  },

  // 10. 百步蛇集會所 百合設計師 Stylist Lily (優雅甜美婉約的部落女設計師)
  plaza: {
    id: 'plaza',
    nameZh: '百合設計師 Stylist Lily',
    preferredVoices: ['Zira', 'Victoria', 'Karen', 'Samantha', 'Google US English'],
    lang: 'en-US',
    gender: 'female',
    pitch: 1.18,
    rate: 0.86
  },

  // 11. 學生/孩童發音 (單字庫練習、每日靈感卡)
  student: {
    id: 'student',
    nameZh: '好學生',
    preferredVoices: ['Google US English', 'Samantha', 'Jenny', 'Aria'],
    lang: 'en-US',
    gender: 'female',
    pitch: 1.10,
    rate: 0.92
  }
};

// 排除 macOS / iOS 機械或趣味搞笑語音，避免學生練習聽力抽到異常音效
const NOVELTY_VOICE_REGEX = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|ralph|fred|junior|kathy|eloquence|reed|rocko|sandy|shelley|eddy|flo|grandma|grandpa)\b/i;

const isNoveltyVoice = (v) => NOVELTY_VOICE_REGEX.test(String(v?.name || ''));

const isHighQualityNaturalVoice = (v) => {
  const name = String(v?.name || '').toLowerCase();
  return (
    name.includes('natural') ||
    name.includes('neural') ||
    name.includes('enhanced') ||
    name.includes('premium') ||
    name.includes('google us english')
  );
};

// 舊版 Windows SAPI5 本機語音（在 0.92x 變速拉伸下短字母音易失真，預設採 1.0x 原速且可供提示升級 Edge/Chrome）
const isLegacySapiVoice = (v) => {
  const name = String(v?.name || '').toLowerCase();
  if (!name) return false;
  if (name.includes('natural') || name.includes('online') || name.includes('neural')) return false;
  return /microsoft\s+(zira|david|mark)\b/i.test(name);
};

// 判斷是否為通用英語語系 (強制杜絕葡語、法語、德語等非英語混入)
export const isEnglishVoice = (v) => {
  const lang = (v?.lang || '').toLowerCase().replace('_', '-');
  return lang.startsWith('en');
};

const isExplicitMale = (v) => {
  if (!isEnglishVoice(v)) return false;
  const name = (v?.name || '').toLowerCase();
  const femaleSignals = [
    'female', 'woman', 'girl', 'zira', 'jenny', 'samantha', 'aria', 'hazel', 
    'victoria', 'karen', 'linda', 'anna', 'michelle', 'ana', 'ava', 'emma', 
    'susan', 'heera', 'catherine', 'clara', 'natasha', 'sonia', 'neerja', 
    'stephanie', 'alice', 'julie', 'sarah', 'google us english', 'google uk english female'
  ];
  if (femaleSignals.some(f => name.includes(f))) return false;

  const maleSignals = [
    'male', 'david', 'guy', 'mark', 'christopher', 'eric', 'roger', 'steffan', 
    'alex', 'fred', 'daniel', 'george', 'oliver', 'tom', 'aaron', 'bruce', 
    'richard', 'ryan', 'james', 'john', 'paul', 'william', 'charles', 'google uk english male'
  ];
  return maleSignals.some(m => name.includes(m));
};

const isExplicitFemale = (v) => {
  if (!isEnglishVoice(v)) return false;
  const name = (v?.name || '').toLowerCase();
  const maleSignals = [
    'david', 'guy', 'mark', 'christopher', 'eric', 'roger', 'steffan', 
    'alex', 'fred', 'daniel', 'george', 'oliver', 'tom', 'aaron', 'bruce', 
    'richard', 'ryan', 'google uk english male'
  ];
  if (maleSignals.some(m => name.includes(m)) && !name.includes('female')) return false;

  const femaleSignals = [
    'female', 'woman', 'girl', 'zira', 'jenny', 'samantha', 'aria', 'hazel', 
    'victoria', 'karen', 'linda', 'anna', 'michelle', 'ana', 'ava', 'emma', 
    'susan', 'heera', 'catherine', 'clara', 'natasha', 'sonia', 'neerja', 
    'stephanie', 'alice', 'julie', 'sarah', 'google us english', 'google uk english female'
  ];
  return femaleSignals.some(f => name.includes(f));
};

let speechPrimed = false;
export const primeSpeechSynthesis = () => {
  if (speechPrimed || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending || voiceManager?.speakingToken > 0) {
    speechPrimed = true;
    return;
  }
  speechPrimed = true;
  try {
    const silent = new SpeechSynthesisUtterance(' ');
    silent.volume = 0.01;
    silent.rate = 10;
    window.speechSynthesis.speak(silent);
  } catch (e) {}
};

class VoiceManager {
  constructor() {
    this.voices = [];
    this.isReady = false;
    this.speakingToken = 0;
    this.pendingSpeakTimer = null;
    this.pendingTimeoutId = null;
    this.voiceListeners = new Set();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      const handleVoicesChanged = () => {
        this.initVoices();
        this.voiceListeners.forEach((cb) => {
          try { cb(this.voices); } catch (e) {}
        });
      };
      try {
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
        window.speechSynthesis.addEventListener?.('voiceschanged', handleVoicesChanged);
      } catch (e) {}
    }
  }

  onVoicesReady(cb) {
    if (typeof cb !== 'function') return () => {};
    this.voiceListeners.add(cb);
    return () => this.voiceListeners.delete(cb);
  }

  initVoices() {
    try {
      this.voices = window.speechSynthesis.getVoices() || [];
      if (this.voices.length > 0) {
        this.isReady = true;
      }
    } catch (e) {
      this.voices = [];
    }
  }

  resolveVoice(persona) {
    if (!this.voices || this.voices.length === 0) {
      this.initVoices();
    }
    if (!this.voices || this.voices.length === 0) return null;

    const isTargetEnglish = !persona.lang || persona.lang.toLowerCase().startsWith('en');
    const englishVoicesRaw = this.voices.filter(v => isEnglishVoice(v));
    const cleanEnglishVoices = englishVoicesRaw.filter(v => !isNoveltyVoice(v));
    const englishVoices = cleanEnglishVoices.length > 0 ? cleanEnglishVoices : englishVoicesRaw;

    // 嚴格依目標口音分層：只要裝置具備目標語系（如 en-US），絕不讓 en-GB / en-AU 搶走標準美語
    const targetLang = (persona.lang || 'en-US').toLowerCase().replace('_', '-');
    const targetLangVoices = englishVoices.filter(v => (v?.lang || '').toLowerCase().replace('_', '-').startsWith(targetLang));
    const fallbackEnVoices = englishVoices.filter(v => !(v?.lang || '').toLowerCase().replace('_', '-').startsWith(targetLang));

    const pickFromTier = (tierPool) => {
      if (!tierPool || tierPool.length === 0) return null;

      // 1. 優先在音色候選名單中逐一精確匹配（若要求中性清晰語音且清單過泛如 'Natural'，仍優先選取）
      if (persona.preferredVoices && persona.preferredVoices.length > 0) {
        for (const pref of persona.preferredVoices) {
          const found = tierPool.find(v => (v.name || '').toLowerCase().includes(pref.toLowerCase()));
          if (found) return found;
        }
      }

      // 2. 高解析／神經網路自然語音優先
      if (persona.gender === 'male') {
        const qualityMale = tierPool.find(v => isHighQualityNaturalVoice(v) && isExplicitMale(v));
        if (qualityMale) return qualityMale;
      } else if (persona.gender === 'female') {
        const qualityFemale = tierPool.find(v => isHighQualityNaturalVoice(v) && isExplicitFemale(v));
        if (qualityFemale) return qualityFemale;
      } else {
        const qualityAny = tierPool.find(v => isHighQualityNaturalVoice(v));
        if (qualityAny) return qualityAny;
      }

      // 3. 次順位：依性別尋找原生音色
      if (persona.gender === 'male') {
        const anyMale = tierPool.find(v => isExplicitMale(v));
        if (anyMale) return anyMale;
      } else if (persona.gender === 'female') {
        const anyFemale = tierPool.find(v => isExplicitFemale(v));
        if (anyFemale) return anyFemale;
      }

      // 4. 最末順位：同語系首個清晰語音
      return tierPool[0] || null;
    };

    if (!isTargetEnglish) {
      return pickFromTier(this.voices);
    }
    return pickFromTier(targetLangVoices) || pickFromTier(fallbackEnVoices) || null;
  }

  getVoiceDiagnostics(personaKey = 'standard_us') {
    this.initVoices();
    if (!this.voices || this.voices.length === 0) {
      return { voiceName: '', lang: '', quality: 'loading' };
    }
    const englishVoicesRaw = this.voices.filter(v => isEnglishVoice(v));
    if (englishVoicesRaw.length === 0) {
      return { voiceName: '', lang: '', quality: 'missing_en' };
    }
    const persona = PERSONAS[personaKey] || PERSONAS.standard_us || PERSONAS.student;
    const selected = this.resolveVoice(persona);
    if (!selected) {
      return { voiceName: '', lang: '', quality: 'missing_en' };
    }
    const sName = String(selected.name || '');
    const sLang = String(selected.lang || '').replace('_', '-');
    const lowerLang = sLang.toLowerCase();
    let quality = 'standard_us';
    if (!lowerLang.startsWith('en-us')) {
      quality = 'non_us_en';
    } else if (sName.toLowerCase().includes('google us english')) {
      quality = 'google_us';
    } else if (isHighQualityNaturalVoice(selected)) {
      quality = 'neural';
    } else if (isLegacySapiVoice(selected)) {
      quality = 'legacy_sapi';
    }
    return { voiceName: sName, lang: sLang, quality };
  }

  speak(text, optionsOrKey = {}) {
    speechPrimed = true;
    let customOptions = {};
    let personaKey = 'standard_us';
    if (typeof optionsOrKey === 'string') {
      personaKey = optionsOrKey;
    } else if (typeof optionsOrKey === 'object' && optionsOrKey !== null) {
      personaKey = optionsOrKey.persona || optionsOrKey.locationId || optionsOrKey.id || optionsOrKey.gender || 'standard_us';
      customOptions = optionsOrKey;
    }

    let terminalEndedCalled = false;
    let timedOutPending = false;
    const fireOnEnd = (info = { completed: false, reason: 'unknown' }) => {
      if (terminalEndedCalled) return;
      if (info.reason === 'timeout') {
        if (timedOutPending) return;
        timedOutPending = true;
      } else {
        terminalEndedCalled = true;
      }
      if (typeof customOptions.onEnd === 'function') {
        try { customOptions.onEnd(info); } catch (e) {}
      }
    };

    if (typeof window === 'undefined' || !('speechSynthesis' in window) || soundEngine.isMuted || !text) {
      const reason = !text
        ? 'empty'
        : soundEngine.isMuted
        ? 'muted'
        : 'unsupported';
      setTimeout(() => fireOnEnd({ completed: false, reason }), 80);
      return;
    }

    const synth = window.speechSynthesis;
    const wasBusy = Boolean(synth.speaking || synth.pending);
    this.stop({ onlyIfBusy: true });

    const currentToken = ++this.speakingToken;
    const startTimeoutMs =
      typeof customOptions.timeoutMs === 'number' && customOptions.timeoutMs > 0
        ? customOptions.timeoutMs
        : 1200;

    const dispatchSpeak = () => {
      if (this.speakingToken !== currentToken) return;
      try {
        if (!this.voices || this.voices.length === 0) {
          this.initVoices();
        }
        const utterance = new SpeechSynthesisUtterance(text);

        const persona = PERSONAS[personaKey] || PERSONAS.standard_us || PERSONAS.student;
        const lang = customOptions.lang || persona.lang || 'en-US';
        utterance.lang = lang;

        const selectedVoice = this.resolveVoice(persona);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        let pitch = typeof customOptions.pitch === 'number' ? customOptions.pitch : persona.pitch;
        let rate = typeof customOptions.rate === 'number'
          ? customOptions.rate
          : (personaKey === 'standard_us' && selectedVoice && isLegacySapiVoice(selectedVoice) ? 1.0 : persona.rate);

        // 男聲保護：如果瀏覽器缺乏原生男聲導致 fallback 至女聲，強制壓低 pitch 至 0.65 模擬厚實男低音
        if (persona.gender === 'male') {
          if (!selectedVoice || isExplicitFemale(selectedVoice)) {
            pitch = Math.min(pitch, 0.65);
          }
        }

        utterance.pitch = pitch;
        utterance.rate = rate;

        let started = false;
        const timeoutId = setTimeout(() => {
          if (!started && this.speakingToken === currentToken) {
            // iOS Safari 暫時延遲或靜默阻擋時先解除 UI 卡住，但不封死同 token 遲到播放成功後的 onEnd 恢復通道
            bgmManager.resumeBgm();
            fireOnEnd({ completed: false, reason: 'timeout' });
          }
        }, startTimeoutMs);
        this.pendingTimeoutId = timeoutId;

        utterance.onstart = () => {
          if (this.speakingToken !== currentToken) return;
          started = true;
          clearTimeout(timeoutId);
          bgmManager.pauseBgm();
          if (typeof customOptions.onStart === 'function') {
            try { customOptions.onStart(); } catch (e) {}
          }
        };
        utterance.onend = () => {
          clearTimeout(timeoutId);
          const isCurrent = this.speakingToken === currentToken;
          if (isCurrent) {
            bgmManager.resumeBgm();
          }
          fireOnEnd({ completed: isCurrent, reason: isCurrent ? 'ended' : 'cancelled' });
        };
        utterance.onerror = () => {
          clearTimeout(timeoutId);
          const isCurrent = this.speakingToken === currentToken;
          if (isCurrent) {
            bgmManager.resumeBgm();
          }
          fireOnEnd({ completed: false, reason: isCurrent ? 'error' : 'cancelled' });
        };

        synth.speak(utterance);
      } catch (e) {
        bgmManager.resumeBgm();
        fireOnEnd({ completed: false, reason: 'error' });
      }
    };

    // 初次在實機瀏覽器啟動且語音列表尚未載入時，短等 voiceschanged（最多 250ms），避免 Windows 偷退回中文預設音唸英文單字
    const supportsVoicesChanged = Boolean(synth && 'onvoiceschanged' in synth);
    if (supportsVoicesChanged && (!this.voices || this.voices.length === 0)) {
      let dispatched = false;
      const unsub = this.onVoicesReady((loadedVoices) => {
        if (this.speakingToken !== currentToken) {
          unsub();
          return;
        }
        if (dispatched || !loadedVoices || loadedVoices.length === 0) return;
        dispatched = true;
        clearTimeout(this.pendingSpeakTimer);
        this.pendingSpeakTimer = null;
        unsub();
        dispatchSpeak();
      });
      this.pendingSpeakTimer = setTimeout(() => {
        if (dispatched) return;
        dispatched = true;
        this.pendingSpeakTimer = null;
        unsub();
        dispatchSpeak();
      }, wasBusy ? 250 : 220);
      return;
    }

    // 剛 cancel() 掉前句正在播放的語音時，延遲 60ms 再送新句，避免 Windows/Chromium 吃掉 dog 等短字字首氣音
    if (wasBusy) {
      this.pendingSpeakTimer = setTimeout(() => {
        this.pendingSpeakTimer = null;
        dispatchSpeak();
      }, 60);
      return;
    }

    dispatchSpeak();
  }

  stop({ onlyIfBusy = false } = {}) {
    if (this.pendingSpeakTimer) {
      clearTimeout(this.pendingSpeakTimer);
      this.pendingSpeakTimer = null;
    }
    if (this.pendingTimeoutId) {
      clearTimeout(this.pendingTimeoutId);
      this.pendingTimeoutId = null;
    }
    this.speakingToken += 1;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (!onlyIfBusy || window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {}
    }
    bgmManager.resumeBgm();
  }
}

export const voiceManager = new VoiceManager();
export const speakEnglish = (text, optionsOrKey) => voiceManager.speak(text, optionsOrKey);
export const stopSpeech = () => voiceManager.stop();
export const getVoiceDiagnostics = (personaKey = 'standard_us') => voiceManager.getVoiceDiagnostics(personaKey);


// ============================================================================
// 二、 真實音訊吉卜力原聲 BGM 播放器 (HTML5 Audio 跨場景平滑 Crossfade)
// ============================================================================

class BgmManager {
  constructor() {
    this.currentAudio = null;
    this.currentScene = null;
    this.cache = new Map();
    this.isMuted = false;
    this.maxVolume = 0.32; // 舒適且清晰的背景音樂音量
    this.fadeTimer = null;
    this.unlocked = false;

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wutai_bgm_muted');
        this.isMuted = saved === 'true';
      } catch (e) {}

      // 首次使用者手勢互動時解鎖音訊政策
      const unlockAudio = () => {
        this.unlocked = true;
        if (this.currentAudio && !this.isMuted && this.currentAudio.paused) {
          this.currentAudio.play().catch(() => {});
        }
        primeSpeechSynthesis();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { once: true });
      window.addEventListener('click', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
    }
  }

  getAudioInstance(sceneId) {
    if (!this.cache.has(sceneId)) {
      const audio = new Audio(`/audio/bgm/${sceneId}.mp3`);
      audio.loop = true;
      audio.preload = 'auto';
      this.cache.set(sceneId, audio);
    }
    return this.cache.get(sceneId);
  }

  playScene(sceneId = 'home') {
    if (!sceneId) return;
    if (this.currentScene === sceneId && this.currentAudio && !this.currentAudio.paused) {
      return;
    }

    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }

    const prevAudio = this.currentAudio;
    const nextAudio = this.getAudioInstance(sceneId);

    this.currentScene = sceneId;
    this.currentAudio = nextAudio;

    if (this.isMuted) {
      if (prevAudio) {
        prevAudio.pause();
        prevAudio.currentTime = 0;
      }
      return;
    }

    // 啟動平滑 Crossfade (1 秒內線性漸強新音樂、漸弱舊音樂)
    try {
      nextAudio.volume = 0;
      const playPromise = nextAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // 瀏覽器未互動時的安全靜默
        });
      }

      let step = 0;
      const totalSteps = 10;
      this.fadeTimer = setInterval(() => {
        step++;
        const progress = step / totalSteps;

        try {
          if (nextAudio) {
            nextAudio.volume = Math.min(this.maxVolume, progress * this.maxVolume);
          }
          if (prevAudio && prevAudio !== nextAudio) {
            prevAudio.volume = Math.max(0, (1 - progress) * this.maxVolume);
          }
        } catch (e) {}

        if (step >= totalSteps) {
          clearInterval(this.fadeTimer);
          this.fadeTimer = null;
          if (prevAudio && prevAudio !== nextAudio) {
            try {
              prevAudio.pause();
              prevAudio.currentTime = 0;
            } catch (e) {}
          }
        }
      }, 100);
    } catch (e) {
      // 容錯保護
    }
  }

  stopBgm() {
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    if (this.currentAudio) {
      try {
        const audio = this.currentAudio;
        let step = 0;
        const fadeOut = setInterval(() => {
          step++;
          audio.volume = Math.max(0, (1 - step / 5) * this.maxVolume);
          if (step >= 5) {
            clearInterval(fadeOut);
            audio.pause();
            audio.currentTime = 0;
          }
        }, 60);
      } catch (e) {
        this.currentAudio.pause();
      }
    }
    this.currentScene = null;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wutai_bgm_muted', String(this.isMuted));
      }
    } catch (e) {}

    if (this.isMuted) {
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
      return false; // 現在是靜音
    } else {
      if (this.currentAudio) {
        this.currentAudio.volume = this.maxVolume;
        this.currentAudio.play().catch(() => {});
      } else if (this.currentScene) {
        this.playScene(this.currentScene);
      }
      return true; // 現在播放中
    }
  }

  pauseBgm() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.wasPlayingBeforePause = true;
    }
  }

  resumeBgm() {
    if (this.wasPlayingBeforePause && !this.isMuted && this.currentAudio) {
      this.wasPlayingBeforePause = false;
      this.currentAudio.play().catch(() => {});
    }
  }

  isBgmActive() {
    return !this.isMuted && Boolean(this.currentAudio && !this.currentAudio.paused);
  }

  setPlaybackRate(rate = 1.0) {
    if (this.currentAudio) {
      try {
        this.currentAudio.playbackRate = rate;
      } catch (e) {}
    }
  }
}

export const bgmManager = new BgmManager();


// ============================================================================
// 三、 遊戲音效引擎 (Web Audio API - 按鈕點擊、答對、答錯、勝利、抽卡旋轉等)
// ============================================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      stopSpeech();
      bgmManager.stopBgm();
    }
    return this.isMuted;
  }

  playTone(freq, type = 'sine', duration = 0.15, vol = 0.15) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio error safely caught
    }
  }

  // 答對音效：清脆雙和弦
  correct() {
    this.playTone(659.25, 'sine', 0.12, 0.18); // E5
    setTimeout(() => this.playTone(880.00, 'sine', 0.20, 0.20), 80); // A5
  }

  // 答錯音效：低沉鋸齒波
  wrong() {
    this.playTone(160, 'sawtooth', 0.25, 0.16);
  }

  // 連擊 Combo 特效音
  combo(streak = 2) {
    const baseFreq = 500 + Math.min(streak * 70, 600);
    this.playTone(baseFreq, 'sine', 0.15, 0.22);
    setTimeout(() => this.playTone(baseFreq * 1.25, 'sine', 0.22, 0.25), 90);
  }

  // 雷射發射
  laser() {
    this.playTone(700, 'square', 0.08, 0.06);
    setTimeout(() => this.playTone(450, 'square', 0.08, 0.06), 40);
  }

  // 爆炸音效
  explosion() {
    this.playTone(90, 'sawtooth', 0.35, 0.25);
  }

  // 勝利通關旋律
  win() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.2, 0.15), idx * 120);
    });
  }

  // 防護罩生成 / 能量升級音效
  powerUp() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.16, 0.18), idx * 70);
    });
  }

  powerup() {
    this.powerUp();
  }

  // 按鈕點擊反饋
  click() {
    this.playTone(400, 'triangle', 0.04, 0.08);
  }

  // 3D 積木磁吸定位聲（依序隨五聲音階上揚：C5 D5 E5 G5 A5 C6 D6 E6）
  blockSnap(pitchIndex = 0) {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
    const safeIdx = Math.max(0, Number(pitchIndex) || 0) % scale.length;
    const freq = scale[safeIdx];
    this.playTone(freq, 'triangle', 0.08, 0.14);
    setTimeout(() => this.playTone(freq * 1.5, 'sine', 0.11, 0.09), 28);
  }

  // 積木退回待選區之輕柔氣泡彈回音
  blockPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.09);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  // 神筆書寫筆畫完成之星空風鈴共鳴音
  brushChime(step = 0) {
    const scale = [587.33, 739.99, 880.0, 1174.66];
    const freq = scale[Math.max(0, Number(step) || 0) % scale.length];
    this.playTone(freq, 'sine', 0.15, 0.15);
    setTimeout(() => this.playTone(freq * 1.25, 'sine', 0.18, 0.09), 40);
  }

  // 開啟隱藏中文提示之柔和微光提示音
  hintPing() {
    this.playTone(698.46, 'sine', 0.10, 0.12);
    setTimeout(() => this.playTone(1046.5, 'sine', 0.14, 0.10), 55);
  }

  // 跨平台觸覺微脈衝 (支援 Android 實體震動 + Web Audio 超低頻 55Hz 衝擊，在 iPad/PC 上營造擊打受力感)
  hapticPulse(strength = 'normal') {
    if (this.isMuted) return;

    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        if (strength === 'strong') {
          navigator.vibrate([35, 20, 45]);
        } else {
          navigator.vibrate(28);
        }
      } catch (e) {}
    }

    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(strength === 'strong' ? 75 : 55, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.045);

      const vol = strength === 'strong' ? 0.22 : 0.14;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  // 最後 10 秒倒數緊張節奏鼓點 (具備 TTS 發音自動閃避 Ducking 機制，避免干擾單字朗讀)
  countdownTensionTick(secondsLeft = 10) {
    if (this.isMuted) return;
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
      return; // TTS 朗讀中自動閃避
    }
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const pitch = 85 + (10 - Math.max(1, secondsLeft)) * 8; // 85Hz ~ 160Hz 遞增緊湊

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  // 美語發音呼叫 (代理至 voiceManager)
  speak(text, persona = 'mario') {
    if (this.isMuted) return;
    voiceManager.speak(text, persona);
  }

  // 魔法靈感卡 急速旋轉音效
  spinCard() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const count = 16;
      for (let i = 0; i < count; i++) {
        const offset = Math.pow(i / count, 1.35) * 1.5;
        const freq = 320 + i * 55;
        const vol = 0.08 + (i / count) * 0.12;
        setTimeout(() => {
          this.playTone(freq, 'sine', 0.07, vol);
        }, offset * 1000);
      }
    } catch (e) {}
  }

  // 實體卡牌釘在榮譽告示板上的清脆木質圖釘聲
  pinCard() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      this.playTone(260, 'triangle', 0.035, 0.28);
      setTimeout(() => this.playTone(840, 'sine', 0.06, 0.16), 25);
    } catch (e) {}
  }

  // ── 背景音樂介面橋接 (向後完全相容原程式調用) ──
  startSceneBgm(sceneId = 'home') {
    bgmManager.playScene(sceneId);
  }

  stopSceneBgm() {
    bgmManager.stopBgm();
  }

  toggleSceneBgm(sceneId = 'home') {
    if (bgmManager.isBgmActive()) {
      bgmManager.toggleMute();
      return false;
    } else {
      if (bgmManager.isMuted) {
        bgmManager.toggleMute();
      }
      bgmManager.playScene(sceneId);
      return true;
    }
  }

  isSceneBgmActive() {
    return bgmManager.isBgmActive();
  }

  startHomeBgm() {
    bgmManager.playScene('home');
  }

  stopHomeBgm() {
    bgmManager.stopBgm();
  }

  toggleHomeBgm() {
    return this.toggleSceneBgm('home');
  }

  isHomeBgmActive() {
    return bgmManager.isBgmActive();
  }

  pauseSceneBgm() {
    bgmManager.pauseBgm();
  }

  resumeSceneBgm() {
    bgmManager.resumeBgm();
  }
}

export const soundEngine = new SoundEngine();
export const pauseBgm = () => bgmManager.pauseBgm();
export const resumeBgm = () => bgmManager.resumeBgm();
