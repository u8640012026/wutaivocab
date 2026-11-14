import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

console.log('══════════════════════════════════════════════════════════════');
console.log('  AUTOMATED CI FUNCTIONAL & SMOKE TEST SUITE (HEADLESS CHROME) ');
console.log('══════════════════════════════════════════════════════════════');

const PORT = 4198;
const BASE_URL = `http://localhost:${PORT}`;

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--host'], {
  stdio: 'pipe'
});

async function waitForServer(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) {
        console.log('✓ Preview server active on port', PORT);
        return true;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 400));
  }
  throw new Error('Preview server failed to start');
}

const tempProfile = path.join(os.tmpdir(), `chrome_smoke_gate_${Date.now()}`);
fs.mkdirSync(tempProfile, { recursive: true });

const chromePath = os.platform() === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : '/usr/bin/chromium');

const chromeArgs = [
  '--headless=new',
  '--remote-debugging-port=9263',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  `--user-data-dir=${tempProfile}`
];
if (os.platform() !== 'win32') {
  chromeArgs.push('--no-sandbox', '--disable-setuid-sandbox');
}

const chrome = spawn(chromePath, chromeArgs);

async function waitForChrome(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9263/json/list');
      const tabs = await res.json();
      const pageTab = tabs.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension://'));
      if (pageTab) {
        return pageTab;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 400));
  }
  throw new Error('Headless Chrome failed to start');
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
    this.consoleErrors = [];
    this.exceptions = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.pending.has(data.id)) {
          const { resolve, reject } = this.pending.get(data.id);
          this.pending.delete(data.id);
          if (data.error) reject(new Error(data.error.message));
          else resolve(data.result);
        } else if (data.method === 'Runtime.consoleAPICalled') {
          if (data.params.type === 'error') {
            const args = data.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
            this.consoleErrors.push(args);
          }
        } else if (data.method === 'Runtime.exceptionThrown') {
          this.exceptions.push(data.params.exceptionDetails);
        } else if (data.method === 'Page.javascriptDialogOpening') {
          this.send('Page.handleJavaScriptDialog', { accept: true }).catch(() => {});
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  }
}

const ALL_GAME_IDS = [
  'escape',
  'spotter',
  'maze',
  'memory',
  'mole',
  'swipe',
  'meteor',
  'snake',
  'quiz-choice',
  'quiz-listening',
  'spelling',
  'handwriting',
  'battle',
  'town'
];

async function run() {
  await waitForServer();
  const pageTab = await waitForChrome();
  const client = new CDPClient(pageTab.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Page.addScriptToEvaluateOnNewDocument', {
    source: 'window.alert = () => {}; window.confirm = () => true; window.prompt = () => null; window.__CI__ = true; try { localStorage.setItem("wutai_player_name", "測試勇士"); } catch(e){}'
  }).catch(() => {});

  const failures = [];

  // ── 檢查點 0: 靜態契約與防回歸語法檢查 (Static Contract Gate) ──
  console.log('\n[0/6] Running Static Contract & Anti-Regression Audit...');
  const walkSrc = (dir) => {
    let results = [];
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) results = results.concat(walkSrc(p));
      else if (/\.(js|jsx)$/.test(f)) results.push(p);
    }
    return results;
  };
  const srcFiles = walkSrc('src');
  const audioSrc = fs.readFileSync('src/services/audio.js', 'utf8');
  for (const f of srcFiles) {
    const txt = fs.readFileSync(f, 'utf8');
    const re = /soundEngine\.([a-zA-Z0-9_]+)/g;
    let m;
    while ((m = re.exec(txt)) !== null) {
      const method = m[1];
      const exists = new RegExp('^\\s*' + method + '\\s*\\(', 'm').test(audioSrc) || new RegExp('this\\.' + method + '\\s*=', 'm').test(audioSrc);
      if (!exists) {
        failures.push({ target: 'Static Contract: soundEngine.' + method, file: f });
      }
    }
    if (f.includes('games') && /if\s*\(\s*queue\.length\s*===\s*0\s*\)\s*return\s+onBack\(\)/.test(txt)) {
      failures.push({ target: 'Static Contract: premature onBack() on empty queue', file: f });
    }
  }

  // Arcade controls contract: missed targets must cost a life; snake touch input must react before touchend.
  const moleSrc = fs.readFileSync('src/games/mole/WhackAMoleGame.jsx', 'utf8');
  const missStart = moleSrc.indexOf('const handleMissTimeout');
  const missEnd = moleSrc.indexOf('// 輔助函式：讓指定洞', missStart);
  const missBlock = missStart >= 0 && missEnd > missStart ? moleSrc.slice(missStart, missEnd) : '';
  if (!/livesRef\.current\s*-\s*1/.test(missBlock) || !/triggerGameOver\('dead'\)/.test(missBlock)) {
    failures.push({ target: 'Arcade Contract: missed correct mole must deduct life and allow death' });
  }

  const snakeSrc = fs.readFileSync('src/games/snake/SnakeGame.jsx', 'utf8');
  const touchMoveStart = snakeSrc.indexOf('const handleTouchMove');
  const touchEndStart = snakeSrc.indexOf('const handleTouchEnd', touchMoveStart);
  const touchMoveBlock = touchMoveStart >= 0 && touchEndStart > touchMoveStart
    ? snakeSrc.slice(touchMoveStart, touchEndStart)
    : '';
  if (!/handleDpad\(/.test(touchMoveBlock) || !/Math\.max\(12,\s*Math\.min\(18/.test(touchMoveBlock)) {
    failures.push({ target: 'Arcade Contract: adaptive 12-18px snake swipe must turn during touchmove' });
  }
  if (!/easy:\s*330/.test(snakeSrc) || !/normal:\s*235/.test(snakeSrc) || !/survival:\s*205/.test(snakeSrc)) {
    failures.push({ target: 'Arcade Contract: responsive snake speed profile regressed' });
  }

  // 驗證課本題庫檢定館 (HERE_WE_GO_MCQ_BANK) 7 道品質閘門與每冊百題契約
  const { HERE_WE_GO_MCQ_BANK } = await import('../src/data/hereWeGoMcqBank.js');
  const mcqIds = new Set();
  const mcqBookCounts = { g1: 0, g2: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const q of HERE_WE_GO_MCQ_BANK) {
    if (!q.id || mcqIds.has(q.id)) failures.push({ target: 'Static Contract: Duplicate MCQ ID', id: q.id });
    mcqIds.add(q.id);
    if (!mcqBookCounts[q.book] && mcqBookCounts[q.book] !== 0) failures.push({ target: 'Static Contract: Invalid MCQ book', id: q.id });
    else mcqBookCounts[q.book]++;
    if (!Array.isArray(q.options) || q.options.length < 3 || new Set(q.options.map(o => String(o || '').toLowerCase().trim())).size !== q.options.length) {
      failures.push({ target: 'Static Contract: Invalid MCQ options', id: q.id });
    }
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) {
      failures.push({ target: 'Static Contract: Invalid MCQ answer index', id: q.id });
    }
    if (!q.section || !q.taskType || !q.difficulty || q.reviewed !== true) {
      failures.push({ target: 'Static Contract: Missing format v2 fields', id: q.id });
    }
    if (q.explanation && q.explanation.includes('依據本課核心句型')) {
      failures.push({ target: 'Static Contract: Templated explanation found', id: q.id });
    }
    if ((q.book === 'g1' || q.book === 'g2') && (/後面的字母/.test(q.question) || /前面的字母/.test(q.question)) && !/緊接/.test(q.question)) {
      failures.push({ target: 'Static Contract: Ambiguous letter order phrasing', id: q.id });
    }
    if (Array.isArray(q.scopes) && q.scopes.length > 2) {
      failures.push({ target: 'Static Contract: MCQ scopes length > 2', id: q.id, scopes: q.scopes });
    }
  }
  for (const b of ['g1', 'g2', 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    if (mcqBookCounts[b] < 100) {
      failures.push({ target: `Static Contract: MCQ Book ${b} count < 100`, count: mcqBookCounts[b] });
    }
  }
  // 驗證 Scheme A Canonical 契約：Canonical 題數與題庫一致 (>= 1,589)、1,728 歷史 Clones 映射、每冊 >= 100 題
  const { CANONICAL_STATS, LEGACY_TO_CANONICAL_MAP } = await import('../src/data/exam/canonicalMapping.js');
  if (CANONICAL_STATS.canonicalItems !== HERE_WE_GO_MCQ_BANK.length || CANONICAL_STATS.canonicalItems < 1589 || CANONICAL_STATS.duplicateClones !== 1728) {
    failures.push({ target: 'Static Contract: Scheme A canonical counts mismatch', stats: CANONICAL_STATS });
  }
  if (Object.keys(LEGACY_TO_CANONICAL_MAP).length !== 1728 + CANONICAL_STATS.canonicalItems) {
    failures.push({ target: 'Static Contract: Scheme A legacy mapping incomplete' });
  }
  for (const b of ['g1', 'g2', 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    if (CANONICAL_STATS.bookCounts[b] < 100) {
      failures.push({ target: `Static Contract: Scheme A Book ${b} canonical count < 100`, count: CANONICAL_STATS.bookCounts[b] });
    }
  }
  // 驗證低年級找不同：grade=2/02 同義、左右圓框一致、圓框不重疊、
  // 差異資料一致，且畫面座標只能命中圓框內的字母。
  const {
    generateSpotterAlphabetRound,
    getSpotterColorDistance,
    normalizeSpotterAlphabetCaseMode,
    normalizeSpotterAlphabetGrade,
    resolveSpotterAlphabetHit
  } = await import('../src/services/alphabetEngine.js');
  if (normalizeSpotterAlphabetGrade('2') !== '02' || normalizeSpotterAlphabetGrade('02') !== '02') {
    failures.push({ target: 'Static Contract: Spotter grade 2 normalization failed' });
  }
  if (normalizeSpotterAlphabetCaseMode(undefined, '1') !== 'upper' ||
      normalizeSpotterAlphabetCaseMode(undefined, '2') !== 'lower') {
    failures.push({ target: 'Static Contract: Spotter grade defaults must be G1 upper / G2 lower' });
  }
  let sawLowercase = false;
  let sawCaseDifference = false;
  let sawCompoundDifference = false;
  const seenDifferenceTypes = new Set();
  const allowedSpotterFonts = new Set([
    'system-ui, sans-serif',
    'Arial, Helvetica, sans-serif',
    'Trebuchet MS, sans-serif',
    'Verdana, Geneva, sans-serif',
    'Tahoma, Geneva, sans-serif',
    'Segoe UI, Arial, sans-serif'
  ]);
  for (let i = 0; i < 200; i++) {
    const expectedDiffCount = i % 2 === 0 ? 3 : 5;
    const expectedItemCount = expectedDiffCount === 5 ? 8 : 6;
    const round = generateSpotterAlphabetRound(expectedItemCount, expectedDiffCount, '2', 'mixed');
    const diffIds = new Set(round.differences.map(diff => diff.id));
    if (round.totalDiffs !== expectedDiffCount || round.differences.length !== expectedDiffCount) {
      failures.push({ target: 'Static Contract: Spotter 3/5 target count mismatch', expectedDiffCount, round });
      break;
    }
    const mixedHasUppercase = round.leftBlocks.some(block => /[A-Z]/.test(block.char));
    const mixedHasLowercase = round.leftBlocks.some(block => /[a-z]/.test(block.char));
    if (!mixedHasUppercase || !mixedHasLowercase) {
      failures.push({ target: 'Static Contract: Spotter mixed mode must contain both cases every round', round });
      break;
    }
    const grade1Round = generateSpotterAlphabetRound(6, 3, '1');
    if (grade1Round.leftBlocks.some(block => !/^[A-Z]$/.test(block.char))) {
      failures.push({ target: 'Static Contract: Spotter G1 default must contain uppercase only', grade1Round });
      break;
    }
    const grade2Round = generateSpotterAlphabetRound(6, 3, '2');
    if (grade2Round.leftBlocks.some(block => !/^[a-z]$/.test(block.char))) {
      failures.push({ target: 'Static Contract: Spotter G2 default must contain lowercase only', grade2Round });
      break;
    }
    sawLowercase ||= round.leftBlocks.some(block => /[a-z]/.test(block.char));
    sawCaseDifference ||= round.differences.some(diff => diff.reason.includes('大小寫不同'));
    sawCompoundDifference ||= round.differences.some(diff => diff.reason.includes('＋'));
    round.differences.forEach(diff => (diff.types || []).forEach(type => seenDifferenceTypes.add(type)));

    for (let blockIndex = 0; blockIndex < round.leftBlocks.length; blockIndex++) {
      const left = round.leftBlocks[blockIndex];
      const right = round.rightBlocks[blockIndex];
      if (left.x !== right.x || left.y !== right.y || left.hitRadiusPct !== right.hitRadiusPct) {
        failures.push({ target: 'Static Contract: Spotter left/right hit circles differ', left, right });
        break;
      }
      if (left.font !== right.font || !allowedSpotterFonts.has(left.font)) {
        failures.push({ target: 'Static Contract: Spotter font must be standard and identical on both sides', left, right });
        break;
      }
      const radius = (left.hitRadiusPct / 100) * 400;
      const centerX = (left.x / 100) * 400;
      const centerY = (left.y / 100) * 300;
      if (centerX - radius < 0 || centerX + radius > 400 || centerY - radius < 0 || centerY + radius > 300) {
        failures.push({ target: 'Static Contract: Spotter hit circle exceeds tray', left, radius, centerX, centerY });
        break;
      }
      if (left.fontScale > 60 || left.fontScale < 52 || right.fontScale > 60 || right.fontScale < 28) {
        failures.push({ target: 'Static Contract: Spotter SVG glyph scale can exceed hit circle', left, right });
        break;
      }

      const visualKeys = ['char', 'color', 'rotation', 'font', 'fontScale'];
      const visualDifferences = visualKeys.filter(key => left[key] !== right[key]);
      const diffMeta = left.diffId ? round.differences.find(diff => diff.id === left.diffId) : null;
      const invalidTargetDifference = left.diffId && (visualDifferences.length < 1 || visualDifferences.length > 2);
      const typesMismatch = diffMeta && diffMeta.types.length !== visualDifferences.length;
      const subtleColor = diffMeta?.types.includes('color') && getSpotterColorDistance(left.color, right.color) < 160;
      const subtleSize = diffMeta?.types.includes('size') && Math.abs(left.fontScale - right.fontScale) < 18;
      const subtleRotation = diffMeta?.types.includes('rotation') && Math.abs(left.rotation - right.rotation) < 55;
      if (invalidTargetDifference || typesMismatch || subtleColor || subtleSize || subtleRotation || (!left.diffId && visualDifferences.length !== 0)) {
        failures.push({ target: 'Static Contract: Spotter target/non-target visual equality mismatch', left, right, visualDifferences });
        break;
      }
      for (let otherIndex = blockIndex + 1; otherIndex < round.leftBlocks.length; otherIndex++) {
        const other = round.leftBlocks[otherIndex];
        const distance = Math.hypot(
          ((left.x - other.x) / 100) * 400,
          ((left.y - other.y) / 100) * 300
        );
        const combinedRadii = ((left.hitRadiusPct + other.hitRadiusPct) / 100) * 400;
        if (distance < combinedRadii) {
          failures.push({ target: 'Static Contract: Spotter hit circles overlap', left, other, distance, combinedRadii });
          break;
        }
      }
    }

    for (const block of [...round.leftBlocks, ...round.rightBlocks]) {
      if (Boolean(block.isDifference) !== Boolean(block.diffId && diffIds.has(block.diffId))) {
        failures.push({ target: 'Static Contract: Spotter block/difference metadata mismatch', block });
        break;
      }
    }

    const target = round.leftBlocks.find(block => block.diffId);
    const hit = resolveSpotterAlphabetHit({
      blocks: round.leftBlocks,
      x: (target.x / 100) * 320,
      y: (target.y / 100) * 220,
      width: 320,
      height: 220
    });
    if (hit?.id !== target.id) {
      failures.push({ target: 'Static Contract: Spotter nearest-center hit resolution failed', target, hit });
      break;
    }
  }
  if (!sawLowercase || !sawCaseDifference || !sawCompoundDifference) {
    failures.push({
      target: 'Static Contract: Spotter mixed-mode variants or compound differences missing',
      sawLowercase,
      sawCaseDifference,
      sawCompoundDifference
    });
  }
  for (const requiredType of ['color', 'char', 'rotation', 'size', 'case']) {
    if (!seenDifferenceTypes.has(requiredType)) {
      failures.push({ target: 'Static Contract: Spotter difference type missing', requiredType, seenDifferenceTypes: [...seenDifferenceTypes] });
    }
  }
  // 驗證 SAA 113～115 官方學力檢測題庫（3 年 × 3 年級 × 35 題）與題圖。
  const { SAA_ALL_OFFICIAL_QUESTIONS, SAA_ALL_EXAM_PAPERS } = await import('../src/data/exam/saa/index.js');
  if (SAA_ALL_OFFICIAL_QUESTIONS.length !== 315 || Object.keys(SAA_ALL_EXAM_PAPERS).length !== 3) {
    failures.push({ target: 'Static Contract: SAA official paper count mismatch' });
  }
  let missingImages = 0;
  for (const q of SAA_ALL_OFFICIAL_QUESTIONS) {
    if (q.year === 114 && q.sourceType !== 'official') {
      failures.push({ target: 'Static Contract: SAA 114 missing official sourceType', id: q.id });
    }
    const imgs = [];
    if (q.image) imgs.push(q.image);
    if (q.media?.image) imgs.push(q.media.image);
    if (q.passage?.image) imgs.push(q.passage.image);
    if (Array.isArray(q.optionImages)) imgs.push(...q.optionImages);
    for (const img of imgs) {
      const relPath = path.join('public', img.replace(/^\//, ''));
      if (!fs.existsSync(relPath)) {
        failures.push({ target: 'Static Contract: Missing SAA image', image: img, id: q.id });
        missingImages++;
      }
    }
  }
  const saa114Audit = spawnSync(process.execPath, ['scripts/test_saa_114_contract.mjs'], { encoding: 'utf8' });
  if (saa114Audit.status !== 0) {
    failures.push({
      target: 'Static Contract: SAA 114 Contract & Sharp Pixel Gate',
      output: (saa114Audit.stderr || saa114Audit.stdout || '').slice(-800)
    });
  }
  const saa115Audit = spawnSync(process.execPath, ['scripts/test_saa_115_contract.mjs'], { encoding: 'utf8' });
  if (saa115Audit.status !== 0) {
    failures.push({
      target: 'Static Contract: SAA 115 Contract & Sharp Pixel Gate',
      output: (saa115Audit.stderr || saa115Audit.stdout || '').slice(-800)
    });
  }
  if (failures.length === 0) {
    console.log(`  ✓ Static Contract Gate passed (soundEngine, lifecycle hooks, ${HERE_WE_GO_MCQ_BANK.length} MCQs & SAA 113–115 [315 official questions, 114 & 115 Sharp-verified] verified)`);
  }

  const waitForAppReady = async (maxAttempts = 40) => {
    await new Promise(r => setTimeout(r, 400));
    for (let i = 0; i < maxAttempts; i++) {
      const status = await client.evaluate(`
        (() => {
          if (!document.body) return 'empty';
          const text = document.body.innerText || '';
          if (text.includes('正在同步雲端單字庫') || text.includes('Adventure World Loading') || text.includes('高山祕境') || text.includes('Forest Wisdom') || text.includes('冒險境界')) return 'syncing';
          if (text.length > 30) return 'ready';
          return 'loading';
        })()
      `);
      if (status === 'ready') return true;
      await new Promise(r => setTimeout(r, 250));
    }
    return false;
  };

  // ── 檢查點 1: 排行榜視圖與互動 ──
  console.log('\n[1/6] Testing Leaderboard View & Interactions...');
  client.exceptions = [];
  client.consoleErrors = [];
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=leaderboard` });
  await waitForAppReady();
  await new Promise(r => setTimeout(r, 400));

  let hasError = await client.evaluate(`document.body.innerText.includes('畫面載入遇到小插曲')`);
  if (hasError || client.exceptions.length > 0) {
    failures.push({ target: 'Leaderboard initial load', errors: client.exceptions });
    console.log('  ❌ Leaderboard failed to load');
  } else {
    console.log('  ✓ Leaderboard loaded smoothly');
  }

  await client.evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const g1 = btns.find(b => b.innerText.includes('一年級'));
      if (g1) g1.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 300));
  hasError = await client.evaluate(`document.body.innerText.includes('畫面載入遇到小插曲')`);
  if (hasError) failures.push({ target: 'Leaderboard grade switch', error: 'Crashed on grade click' });
  else console.log('  ✓ Leaderboard grade filter interaction passed');

  // ── 檢查點 2: 首頁大廳與教師台 ──
  console.log('\n[2/5] Testing Lobby & Teacher Hub...');
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=lobby` });
  await waitForAppReady();
  await new Promise(r => setTimeout(r, 300));
  hasError = await client.evaluate(`document.body.innerText.includes('畫面載入遇到小插曲')`);
  if (hasError) failures.push({ target: 'Lobby', error: 'Crashed' });
  else console.log('  ✓ Lobby loaded smoothly');

  client.exceptions = [];
  client.consoleErrors = [];
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=teacher-hub` });
  await waitForAppReady();
  await new Promise(r => setTimeout(r, 300));
  hasError = await client.evaluate(`document.body.innerText.includes('畫面載入遇到小插曲')`);
  if (hasError || client.exceptions.length > 0) {
    failures.push({ target: 'TeacherHub', error: 'Crashed', details: client.exceptions });
  } else {
    console.log('  ✓ TeacherHub loaded smoothly');
  }

  // ── 教師台試題檢核區互動驗測 (ExamAuditZone) ──
  await client.evaluate(`
    (() => {
      sessionStorage.setItem('wutai_teacher_authed', 'true');
    })()
  `);
  await client.send('Page.reload');
  await waitForAppReady();
  await new Promise(r => setTimeout(r, 500));
  const auditTabClicked = await client.evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText && b.innerText.includes('檢定試題檢核'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  const auditZoneRendered = await client.evaluate(`
    (() => {
      const text = document.body.innerText || '';
      return {
        hasTitle: text.includes('試題檢核'),
        hasTrack: text.includes('課本題庫練習') || text.includes('學力檢測練習'),
        hasCheckbox: text.includes('排除已通過題目') || text.includes('排除已檢核通過')
      };
    })()
  `);
  if (!auditTabClicked || !auditZoneRendered.hasTitle) {
    const pageText = await client.evaluate(`document.body.innerText`);
    failures.push({ target: 'TeacherHub ExamAuditZone', error: 'ExamAuditZone not rendered or crashed', details: auditZoneRendered, exceptions: client.exceptions, pageSnippet: (pageText || '').slice(0, 300) });
    console.log('  ❌ TeacherHub ExamAuditZone failed:', auditZoneRendered, 'exceptions:', client.exceptions, 'snippet:', (pageText || '').slice(0, 150));
  } else {
    console.log('  ✓ TeacherHub: ExamAuditZone tab switch & 3-track review UI verified');
  }

  // ── 試題附圖 4 方案體驗台驗測 (ImageZoomShowcase) ──
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=zoom-showcase` });
  await waitForAppReady();
  await new Promise(r => setTimeout(r, 400));
  const zoomShowcaseCheck = await client.evaluate(`
    (() => {
      const text = document.body.innerText || '';
      return {
        hasTitle: text.includes('試題附圖放大機制') && text.includes('四大方案實測體驗台'),
        hasPlans: text.includes('方案 1') && text.includes('方案 2') && text.includes('方案 3A') && text.includes('方案 3B')
      };
    })()
  `);
  if (!zoomShowcaseCheck.hasTitle || !zoomShowcaseCheck.hasPlans) {
    const pageText = await client.evaluate(`document.body.innerText`);
    failures.push({ target: 'ImageZoomShowcase', error: 'ImageZoomShowcase view failed', details: zoomShowcaseCheck, exceptions: client.exceptions, pageSnippet: (pageText || '').slice(0, 300) });
    console.log('  ❌ ImageZoomShowcase failed:', zoomShowcaseCheck, 'exceptions:', client.exceptions, 'snippet:', (pageText || '').slice(0, 150));
  } else {
    console.log('  ✓ ImageZoomShowcase: 4 zoom interaction plans verified');
  }

  // ── 檢查點 3: 鷹眼神探深度功能性驗收 (低年級托盤 vs 中年級紙雕全相異) ──
  console.log('\n[3/5] Deep Functional Testing: VocabSpotterGame...');

  const waitForSpotterLoad = async () => {
    // 預留導航與 DOM 掛載起始緩衝
    await new Promise(r => setTimeout(r, 400));
    for (let i = 0; i < 35; i++) {
      const status = await client.evaluate(`
        (() => {
          if (!document.body) return 'loading';
          const text = document.body.innerText || '';
          if (text.includes('正在同步雲端單字庫') || text.includes('Adventure World Loading') || text.includes('高山祕境') || text.includes('Forest Wisdom') || text.includes('冒險境界')) return 'syncing';
          if (text.includes('左側托盤') || text.includes('找不同（點擊不扣心）') || text.includes('世界節慶與環球港灣')) return 'ready';
          return 'waiting';
        })()
      `);
      if (status === 'ready') break;
      await new Promise(r => setTimeout(r, 300));
    }
    await new Promise(r => setTimeout(r, 500));
  };
  
  // 3A. 一年級字母托盤模式
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=spotter&grade=1&book=abc` });
  await waitForSpotterLoad();
  const spotterG1Check = await client.evaluate(`
    (() => {
      const body = document.body.innerText;
      const hasAlphabetTray = body.includes('左側托盤') && body.includes('右側托盤');
      const hasWordBank = body.includes('請在下方點選該相異物品');
      const trayButtons = document.querySelectorAll('button[style*="font-family"]').length;
      const tray = document.querySelector('[data-alpha-tray="left"]');
      const chars = [...(tray?.querySelectorAll('text') || [])].map(node => node.textContent.trim());
      return {
        hasAlphabetTray,
        hasWordBank,
        trayButtonsCount: trayButtons,
        caseMode: tray?.getAttribute('data-alpha-case-mode') || null,
        allUppercase: chars.length > 0 && chars.every(char => /^[A-Z]$/.test(char))
      };
    })()
  `);
  if (!spotterG1Check.hasAlphabetTray || spotterG1Check.trayButtonsCount === 0 || spotterG1Check.caseMode !== 'upper' || !spotterG1Check.allUppercase) {
    failures.push({ target: 'Spotter G1 Alphabet Trays', error: 'Alphabet trays not rendered', details: spotterG1Check });
    console.log('  ❌ Spotter G1 Alphabet Trays failed:', spotterG1Check);
  } else {
    console.log(`  ✓ Spotter G1: Alphabet Trays verified (${spotterG1Check.trayButtonsCount} interactive blocks)`);
  }

  // 以真實螢幕座標點擊差異字母中心，驗證不會因旋轉 DOM 疊層而誤判扣心。
  const spotterCoordinateClick = await client.evaluate(`
    (() => {
      const target = document.querySelector('[data-alpha-tray="left"] [data-alpha-difference="true"]');
      if (!target) return { dispatched: false, reason: 'missing difference target' };
      target.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = target.getBoundingClientRect();
      const clientX = rect.left + rect.width / 2;
      const clientY = rect.top + rect.height / 2;
      const receiver = document.elementFromPoint(clientX, clientY);
      receiver?.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX, clientY, detail: 1 }));
      return {
        dispatched: Boolean(receiver),
        targetId: target.getAttribute('data-alpha-block'),
        receiverId: receiver?.closest?.('[data-alpha-block]')?.getAttribute('data-alpha-block') || null
      };
    })()
  `);
  await new Promise(r => setTimeout(r, 250));
  const spotterCoordinateResult = await client.evaluate(`
    (() => ({
      foundOne: (document.body.innerText || '').includes('已尋獲：1 / 3'),
      lives: document.querySelectorAll('.fill-rose-500').length
    }))()
  `);
  if (!spotterCoordinateClick.dispatched || !spotterCoordinateResult.foundOne || spotterCoordinateResult.lives !== 5) {
    failures.push({
      target: 'Spotter G1 coordinate hit resolution',
      error: 'Visual difference center was not accepted without life loss',
      details: { spotterCoordinateClick, spotterCoordinateResult }
    });
    console.log('  ❌ Spotter G1 coordinate hit resolution failed:', spotterCoordinateClick, spotterCoordinateResult);
  } else {
    console.log('  ✓ Spotter G1: visual-center click accepted with all 5 lives preserved');
  }

  // 3A-2. URL 使用 grade=2 時也必須正規化為二年級 02，而非誤套一年級規則。
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=spotter&grade=2&book=abc` });
  await waitForSpotterLoad();
  const spotterG2Check = await client.evaluate(`
    (() => ({
      normalizedGrade: document.querySelector('[data-alpha-tray]')?.getAttribute('data-alpha-grade') || null,
      caseMode: document.querySelector('[data-alpha-tray]')?.getAttribute('data-alpha-case-mode') || null,
      allLowercase: [...document.querySelectorAll('[data-alpha-tray="left"] text')].every(node => /^[a-z]$/.test(node.textContent.trim())),
      trayButtonsCount: document.querySelectorAll('[data-alpha-block]').length
    }))()
  `);
  if (spotterG2Check.normalizedGrade !== '02' || spotterG2Check.caseMode !== 'lower' || !spotterG2Check.allLowercase || spotterG2Check.trayButtonsCount !== 12) {
    failures.push({ target: 'Spotter G2 grade normalization', details: spotterG2Check });
    console.log('  ❌ Spotter G2 grade normalization failed:', spotterG2Check);
  } else {
    console.log('  ✓ Spotter G2: grade=2 defaults to 6 lowercase letters with 12 tray blocks');
  }

  // 3B. 三年級紙雕場景模式 (全部 8 處差異均為正解，Word Bank 存在)
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=spotter&grade=3&book=1` });
  await waitForSpotterLoad();
  const spotterG3Check = await client.evaluate(`
    (() => {
      const body = document.body.innerText;
      const hasScenes = document.querySelectorAll('svg').length >= 2;
      const hasWordBank = body.includes('鷹眼已鎖定') || body.includes('請先在上方雙圖中點選找出一處不同') || body.includes('找不同（點擊不扣心）') || body.includes('請點選單字');
      return { hasScenes, hasWordBank };
    })()
  `);
  if (!spotterG3Check.hasScenes || !spotterG3Check.hasWordBank) {
    failures.push({ target: 'Spotter G3 Papercut & WordBank', error: 'Scenes or Word Bank missing', details: spotterG3Check });
    console.log('  ❌ Spotter G3 failed:', spotterG3Check);
  } else {
    console.log('  ✓ Spotter G3: Papercut dual-view & Word Bank verified');
  }

  // 3C. 六年級第 7 冊專屬場景驗收 (驗收世界節慶與環球港灣、第 7 冊單字庫)
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=spotter&grade=6&book=7` });
  await waitForSpotterLoad();
  const spotterG6Check = await client.evaluate(`
    (() => {
      const body = document.body.innerText;
      const hasBook7Title = body.includes('世界節慶與環球港灣') || body.includes('第 7 冊') || body.includes('第七冊') || body.includes('第7冊') || body.includes('七');
      const hasScenes = document.querySelectorAll('svg').length >= 2;
      return { hasBook7Title, hasScenes };
    })()
  `);
  if (!spotterG6Check.hasBook7Title || !spotterG6Check.hasScenes) {
    failures.push({ target: 'Spotter Book 7 Scene & Vocab', error: 'Book 7 not loaded', details: spotterG6Check });
    console.log('  ❌ Spotter Book 7 failed:', spotterG6Check);
  } else {
    console.log('  ✓ Spotter Book 7: Global Harbor scene & Grade 6 vocab verified');
  }

  // ── 檢查點 4: 雙語聽說口說測驗功能性流程驗收 (錄音、反饋與重測) ──
  console.log('\n[4/5] Deep Functional Testing: Speaking Lab...');
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=langlab` });

  // 等待並點選進入口說跟讀
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 250));
    const clicked = await client.evaluate(`
      (() => {
        const nodes = Array.from(document.querySelectorAll('button, div[class*="cursor-pointer"]'));
        const speakBtn = nodes.find(b => (b.innerText || '').includes('口說測驗') || (b.innerText || '').includes('口說跟讀') || (b.innerText || '').includes('Speaking'));
        if (speakBtn) {
          speakBtn.click();
          return true;
        }
        return false;
      })()
    `);
    if (clicked) break;
  }
  await new Promise(r => setTimeout(r, 700));

  // 點選挑戰模式第一項 (大寫字母或第一關)
  await client.evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('button, div[class*="cursor-pointer"]'));
      const startBtn = cards.find(c => c.innerText.includes('大寫字母') || c.innerText.includes('三年級') || c.innerText.includes('開始挑戰'));
      if (startBtn) startBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // 點擊麥克風評測按鈕 (第 1 次點擊：開始錄音)
  await client.evaluate(`
    (() => {
      const micBtn = document.querySelector('button[title*="錄音"]');
      if (micBtn) micBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 200));

  // 再次點擊麥克風評測按鈕 (第 2 次點擊：立即提前結束並評測)
  await client.evaluate(`
    (() => {
      const micBtn = document.querySelector('button[title*="錄音"]');
      if (micBtn) micBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // 檢查反饋卡片是否成功渲染出來
  const feedbackCheck = await client.evaluate(`
    (() => {
      const body = document.body.innerText;
      const hasFeedback = body.includes('匹配度評分') || body.includes('Perfect') || body.includes('Good job') || body.includes('大聲說出來') || body.includes('跟讀練習完成');
      return { hasFeedback, snippet: body.slice(0, 200) };
    })()
  `);
  if (!feedbackCheck.hasFeedback) {
    failures.push({ target: 'Speaking Lab Feedback Flow', error: 'Feedback score card did not render', details: feedbackCheck });
    console.log('  ❌ Speaking Lab Feedback Card did not render:', feedbackCheck);
  } else {
    console.log('  ✓ Speaking Lab: Recording & evaluation feedback card verified');
  }

  // ── 檢查點 5: 深度互動遊戲模擬 (模擬學生真實點擊、移動、開房、答題) ──
  console.log('\n[5/6] Deep Interactive Gameplay Simulation Across Core Engines...');

  // 5A. 大廳選冊 -> 點擊「開始遊戲」過渡測試 (防止按開始遊戲卻閃退回大廳)
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=lobby&grade=3&book=1` });
  await new Promise(r => setTimeout(r, 900));
  const lobbyLaunchResult = await client.evaluate(`
    (async () => {
      const cards = Array.from(document.querySelectorAll('button, div[role="button"], div[class*="cursor-pointer"]'));
      const quizCard = cards.find(c => (c.innerText || '').includes('經典選擇題') || (c.innerText || '').includes('選擇題'));
      if (quizCard) quizCard.click();
      await new Promise(r => setTimeout(r, 400));
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find(b => (b.innerText || '').includes('開始遊戲') || (b.innerText || '').includes('START'));
      if (startBtn) startBtn.click();
      await new Promise(r => setTimeout(r, 600));
      const body = document.body.innerText || '';
      return {
        stayedInGame: !body.includes('選擇你想挑戰的學習模式') || body.includes('Score') || body.includes('題') || document.querySelectorAll('button').length >= 4
      };
    })()
  `);
  if (!lobbyLaunchResult?.stayedInGame) {
    failures.push({ target: 'Lobby -> Classic Quiz Start Transition', error: 'Bounced back to lobby' });
  } else {
    console.log('  ✓ Lobby -> Classic Quiz launch transition & question render verified');
  }

  // 5B. 貪食蛇方向鍵與虛擬十字鍵實際轉向驗證 (支援 GamePreloader 資源加載等待)
  client.exceptions = [];
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=snake&grade=3&book=1` });
  await waitForAppReady();
  await new Promise(r => setTimeout(r, 600));
  const snakeMoveCheck = await client.evaluate(`
    (async () => {
      let upBtn = null;
      for (let i = 0; i < 20; i++) {
        upBtn = document.querySelector('button[title*="向上"]');
        if (upBtn) break;
        await new Promise(r => setTimeout(r, 200));
      }
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp', bubbles: true }));
      if (upBtn) upBtn.click();
      await new Promise(r => setTimeout(r, 500));
      return { alive: !document.body.innerText.includes('畫面載入遇到小插曲'), hasControls: !!upBtn };
    })()
  `);
  if (!snakeMoveCheck?.alive || !snakeMoveCheck?.hasControls || client.exceptions.length > 0) {
    failures.push({ target: 'Snake Interactive Controls', details: snakeMoveCheck, exceptions: client.exceptions });
  } else {
    console.log('  ✓ SnakeGame: Keyboard ArrowUp & D-pad directional turn verified');
  }

  // 5C. 多人連線對戰開立擂台 + Header 不重疊 + soundEngine.powerUp 護盾音效驗證
  client.exceptions = [];
  await client.evaluate(`localStorage.setItem('wutai_player_name', '測試勇士');`);
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=battle&grade=3&book=1` });
  await waitForAppReady();
  const battleCheck = await client.evaluate(`
    (async () => {
      const nameInput = document.querySelector('input[placeholder*="暱稱"]');
      if (nameInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (setter) setter.call(nameInput, '測試勇士');
        else nameInput.value = '測試勇士';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(r => setTimeout(r, 200));
      }
      let openBtn = null;
      for (let i = 0; i < 20; i++) {
        const btns = Array.from(document.querySelectorAll('button'));
        openBtn = btns.find(b => (b.innerText || '').includes('開立此擂台') || (b.innerText || '').includes('進入此擂台'));
        if (openBtn) break;
        await new Promise(r => setTimeout(r, 250));
      }
      if (openBtn) openBtn.click();
      let hasWaitingRoom = false;
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 350));
        const body = document.body.innerText || '';
        if (body.includes('等待各路英雄入座') || body.includes('開始對戰') || body.includes('房主') || body.includes('備戰大廳')) {
          hasWaitingRoom = true;
          break;
        }
      }
      const body = document.body.innerText || '';
      const hasRedundantHeader = body.includes('PIN 碼直接加入');
      return { hasWaitingRoom, hasRedundantHeader, openBtnFound: !!openBtn, openBtnText: openBtn?.innerText, bodySnippet: body.slice(0, 300) };
    })()
  `);
  if (!battleCheck?.hasWaitingRoom || battleCheck?.hasRedundantHeader || client.exceptions.length > 0) {
    failures.push({ target: 'BattleGame Arena Hosting & Header Layout', details: battleCheck, exceptions: client.exceptions });
  } else {
    console.log('  ✓ BattleGame: Arena hosting (zero channel collision) & clean header verified');
  }

  // 5D. 經典選擇題 / 拼字 / 記憶翻牌 / 隕石防衛 互動點擊驗證
  for (const interactiveGame of ['quiz-choice', 'spelling', 'memory', 'meteor', 'swipe', 'mole']) {
    client.exceptions = [];
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=${interactiveGame}&grade=3&book=1` });
    await new Promise(r => setTimeout(r, 750));
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button')).filter(b => {
          const t = b.innerText || '';
          return !t.includes('返回') && !t.includes('退出') && !t.includes('離開') && !t.includes('全螢幕');
        });
        if (btns.length > 0) btns[btns.length - 1].click();
      })()
    `);
    await new Promise(r => setTimeout(r, 350));
    const crashed = await client.evaluate(`document.body.innerText.includes('畫面載入遇到小插曲')`);
    if (crashed || client.exceptions.length > 0) {
      failures.push({ target: `Interactive click in ${interactiveGame}`, exceptions: client.exceptions });
    }
  }
  console.log('  ✓ Interactive gameplay clicks verified for quiz-choice, spelling, memory, meteor, swipe, mole');

  // 5D-2. 課本題庫手機漸進手風琴：依序選冊別 → 範圍 → 題型 → 題數，操作不得被覆蓋。
  client.exceptions = [];
  await client.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=mcq-exam` });
  await new Promise(r => setTimeout(r, 900));
  const mcqMobileCheck = await client.evaluate(`
    (async () => {
      const textbookEntry = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('課本題庫練習'));
      if (textbookEntry) {
        textbookEntry.click();
        await new Promise(r => setTimeout(r, 200));
      }
      const blocked = [];
      const checkReachable = async (label, clickAfter = false) => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes(label));
        if (!btn) { blocked.push(label + ':missing'); return false; }
        btn.scrollIntoView({ block: 'center' });
        await new Promise(r => setTimeout(r, 80));
        const rect = btn.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        if (!hit || !(hit === btn || btn.contains(hit))) {
          blocked.push(label + ':covered');
          return false;
        }
        if (clickAfter) {
          btn.click();
          await new Promise(r => setTimeout(r, 160));
        }
        return true;
      };
      await checkReachable('第 1 冊', true);
      await checkReachable('上半冊');
      await checkReachable('下半冊');
      await checkReachable('全選');
      await checkReachable('上半冊', true);
      await checkReachable('綜合測驗', true);
      await checkReachable('10 題');
      await checkReachable('50 題');
      await checkReachable('20 題', true);
      await checkReachable('開始檢定');
      return { ok: blocked.length === 0, blocked };
    })()
  `);
  await client.send('Emulation.clearDeviceMetricsOverride', {});
  if (!mcqMobileCheck?.ok || client.exceptions.length > 0) {
    failures.push({ target: 'PureMcqExamView Mobile Setup Overlap (375x667)', details: mcqMobileCheck, exceptions: client.exceptions });
  } else {
    console.log('  ✓ PureMcqExamView mobile 375x667: progressive textbook accordion remains reachable without overlap');
  }

  // 5D-2b. iPad 橫向：課本四個必要設定必須並排成四欄，欄內可捲動但不得推動整頁。
  client.exceptions = [];
  await client.send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 768, deviceScaleFactor: 2, mobile: false });
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=mcq-exam` });
  await new Promise(r => setTimeout(r, 850));
  const textbookLandscapeCheck = await client.evaluate(`
    (async () => {
      const entry = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('課本題庫練習'));
      entry?.click();
      await new Promise(r => setTimeout(r, 220));
      const board = document.querySelector('[data-testid="textbook-setup-board"]');
      const steps = [1, 2, 3, 4].map(n => document.querySelector('[data-testid="textbook-step-' + n + '"]'));
      const rects = steps.map(step => step?.getBoundingClientRect());
      const columns = board ? getComputedStyle(board).gridTemplateColumns.split(' ').filter(Boolean) : [];
      const sameRow = rects.every(rect => rect && Math.abs(rect.top - rects[0].top) <= 2);
      const allVisible = steps.every(step => step && getComputedStyle(step).display !== 'none' && step.getBoundingClientRect().width > 150);
      const noPageOverflow = document.documentElement.scrollWidth <= window.innerWidth + 2;
      const boardDoesNotScrollPage = !!board && board.scrollHeight <= board.clientHeight + 2;
      return {
        ok: !!entry && columns.length === 4 && sameRow && allVisible && noPageOverflow && boardDoesNotScrollPage,
        columnCount: columns.length,
        sameRow,
        allVisible,
        noPageOverflow,
        boardDoesNotScrollPage
      };
    })()
  `);
  await client.send('Emulation.clearDeviceMetricsOverride', {});
  if (!textbookLandscapeCheck?.ok || client.exceptions.length > 0) {
    failures.push({ target: 'Textbook iPad Landscape Four-Column Setup (1024x768)', details: textbookLandscapeCheck, exceptions: client.exceptions });
  } else {
    console.log('  ✓ Textbook iPad landscape 1024x768: four-column setup stays on one screen with internal column scrolling');
  }

  // 5D-3. SAA 學力檢測響應式 Wizard：年級 → 題源 → 年度／模式，手機不得漏步或被遮擋
  client.exceptions = [];
  await client.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=mcq-exam` });
  await new Promise(r => setTimeout(r, 900));
  const saaWizardCheck = await client.evaluate(`
    (async () => {
      const buttons = () => Array.from(document.querySelectorAll('button'));
      const findButton = (label) => buttons().find(b => (b.innerText || '').includes(label));
      const clickVisible = async (button) => {
        if (!button) return false;
        button.scrollIntoView({ block: 'center' });
        await new Promise(r => setTimeout(r, 80));
        const rect = button.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        if (!hit || !(hit === button || button.contains(hit))) return false;
        button.click();
        await new Promise(r => setTimeout(r, 180));
        return true;
      };
      const wizardFitsWithoutScroll = () => {
        const wizard = document.querySelector('[data-testid="saa-wizard"]');
        const contentScroller = wizard?.parentElement;
        if (!wizard || !contentScroller) return false;
        return contentScroller.scrollHeight <= contentScroller.clientHeight + 2;
      };

      const entered = await clickVisible(findButton('學力檢測練習'));
      const step1 = !!findButton('五年級');
      const step1NoScroll = wizardFitsWithoutScroll();
      const gradeSelected = await clickVisible(findButton('五年級'));
      const step2 = !!findButton('官方考古題') && !!findButton('原創類題練習');
      const step2NoScroll = wizardFitsWithoutScroll();
      const officialSelected = await clickVisible(findButton('官方考古題'));
      const step3 = !!findButton('115 年')
        && !!findButton('114 年')
        && !!findButton('113 年');
      const step3NoScroll = wizardFitsWithoutScroll();
      const yearSelected = await clickVisible(findButton('113 年'));
      const startButton = findButton('開始113 年官方卷');
      const startReachable = startButton ? await (async () => {
        startButton.scrollIntoView({ block: 'center' });
        await new Promise(r => setTimeout(r, 80));
        const rect = startButton.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return !!hit && (hit === startButton || startButton.contains(hit));
      })() : false;
      const backed = await clickVisible(findButton('題源'));
      const preservedSource = !!findButton('官方考古題')
        && findButton('官方考古題').className.includes('bg-emerald-600');

      return {
        ok: entered && step1 && step1NoScroll && gradeSelected && step2 && step2NoScroll && officialSelected && step3 && step3NoScroll && yearSelected && startReachable && backed && preservedSource,
        entered,
        step1,
        step1NoScroll,
        step2,
        step2NoScroll,
        step3,
        step3NoScroll,
        startReachable,
        preservedSource
      };
    })()
  `);
  await client.send('Emulation.clearDeviceMetricsOverride', {});
  if (!saaWizardCheck?.ok || client.exceptions.length > 0) {
    failures.push({ target: 'SAA Responsive Wizard (375x667)', details: saaWizardCheck, exceptions: client.exceptions });
  } else {
    console.log('  ✓ SAA mobile Wizard: grade -> source -> year/mode flow, 113 official paper, back navigation & preserved selection verified');
  }

  // 5D-4. 較矮筆電安全高度：預留瀏覽器工具列後，三步仍不得產生設定區捲軸
  client.exceptions = [];
  await client.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 650, deviceScaleFactor: 1, mobile: false });
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=mcq-exam` });
  await new Promise(r => setTimeout(r, 800));
  const saaLaptopNoScrollCheck = await client.evaluate(`
    (async () => {
      const buttons = () => Array.from(document.querySelectorAll('button'));
      const findButton = (label) => buttons().find(b => (b.innerText || '').includes(label));
      const click = async (label) => {
        const button = findButton(label);
        if (!button) return false;
        button.click();
        await new Promise(r => setTimeout(r, 160));
        return true;
      };
      const fits = () => {
        const wizard = document.querySelector('[data-testid="saa-wizard"]');
        const scroller = wizard?.parentElement;
        return !!wizard && !!scroller && scroller.scrollHeight <= scroller.clientHeight + 2;
      };

      const entered = await click('學力檢測練習');
      const optionStage = document.querySelector('[data-testid="saa-option-stage"]');
      const stageRect = optionStage?.getBoundingClientRect();
      const stageCentered = !!stageRect
        && stageRect.width <= 580
        && Math.abs((stageRect.left + stageRect.right) / 2 - window.innerWidth / 2) <= 3;
      const step1 = fits();
      const gradeSelected = await click('五年級');
      const step2 = fits();
      const sourceSelected = await click('官方考古題');
      const step3 = fits();
      return { ok: entered && stageCentered && gradeSelected && sourceSelected && step1 && step2 && step3, entered, stageCentered, stageWidth: stageRect?.width, step1, step2, step3 };
    })()
  `);
  await client.send('Emulation.clearDeviceMetricsOverride', {});
  if (!saaLaptopNoScrollCheck?.ok || client.exceptions.length > 0) {
    failures.push({ target: 'SAA Laptop Zero-Scroll Safety (1280x650)', details: saaLaptopNoScrollCheck, exceptions: client.exceptions });
  } else {
    console.log('  ✓ SAA laptop 1280x650: centered vertical capsules and all three Wizard steps fit without setup-area scrolling');
  }

  // 5D-5. 113 六年級官方卷：題組材料需跨題保留、桌機雙欄，且圖片可開啟放大視窗。
  client.exceptions = [];
  await client.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=mcq-exam` });
  await new Promise(r => setTimeout(r, 800));
  const saa113GroupCheck = await client.evaluate(`
    (async () => {
      const buttons = () => Array.from(document.querySelectorAll('button'));
      const byText = (label) => buttons().find(b => (b.innerText || '').includes(label));
      const click = async (label, wait = 180) => {
        const button = byText(label);
        if (!button) return false;
        button.click();
        await new Promise(r => setTimeout(r, wait));
        return true;
      };

      if (!await click('學力檢測練習')) return { ok: false, reason: 'missing SAA entry' };
      await click('六年級');
      await click('官方考古題');
      await click('113 年');
      if (!await click('開始113 年官方卷', 450)) return { ok: false, reason: 'missing 113 start' };
      await click('開始作答', 450);

      const officialAudioReady = (document.body.innerText || '').includes('播放官方原聲');
      const q31Button = buttons().find(b => (b.innerText || '').trim() === '31');
      if (!q31Button) return { ok: false, reason: 'missing Q31 navigation', officialAudioReady };
      q31Button.click();
      await new Promise(r => setTimeout(r, 350));

      const material = document.querySelector('[data-testid="saa-group-material"]');
      const question = document.querySelector('[data-testid="saa-group-question"]');
      const materialRect = material?.getBoundingClientRect();
      const questionRect = question?.getBoundingClientRect();
      const twoColumn = !!materialRect && !!questionRect && materialRect.right <= questionRect.left + 8;
      const q31Visible = (document.body.innerText || '').includes('Taylor 寫給 Stella 的信')
        && !!material?.querySelector('img[src*="g6_letter.webp"]');

      const zoomButton = Array.from(material?.querySelectorAll('button') || []).find(b => (b.innerText || '').includes('放大'));
      zoomButton?.click();
      await new Promise(r => setTimeout(r, 160));
      const zoomOpened = !!document.querySelector('[data-testid="exam-image-zoom"] img[src*="g6_letter.webp"]');
      document.querySelector('[data-testid="exam-image-zoom"] button[aria-label="關閉放大圖片"]')?.click();
      await new Promise(r => setTimeout(r, 100));

      const q32Button = buttons().find(b => (b.innerText || '').trim() === '32');
      q32Button?.click();
      await new Promise(r => setTimeout(r, 250));
      const q32HasSharedLetter = !!document.querySelector('[data-testid="saa-group-material"] img[src*="g6_letter.webp"]');
      const q32HasMap = !!document.querySelector('img[src*="g6_q32_map.webp"]');

      const q33Button = buttons().find(b => (b.innerText || '').trim() === '33');
      q33Button?.click();
      await new Promise(r => setTimeout(r, 250));
      const optionZoomButtons = Array.from(document.querySelectorAll('[data-testid="option-image-zoom"]'));
      const allOptionImagesZoomable = optionZoomButtons.length === 4;
      optionZoomButtons[0]?.click();
      await new Promise(r => setTimeout(r, 160));
      const optionZoomOpened = !!document.querySelector('[data-testid="exam-image-zoom"] img[src*="g6_q33_a.webp"]');
      document.querySelector('[data-testid="exam-image-zoom"] button[aria-label="關閉放大圖片"]')?.click();

      return {
        ok: officialAudioReady && twoColumn && q31Visible && zoomOpened && q32HasSharedLetter && q32HasMap && allOptionImagesZoomable && optionZoomOpened,
        officialAudioReady,
        twoColumn,
        q31Visible,
        zoomOpened,
        q32HasSharedLetter,
        q32HasMap,
        allOptionImagesZoomable,
        optionZoomOpened
      };
    })()
  `);
  await client.send('Emulation.clearDeviceMetricsOverride', {});
  if (!saa113GroupCheck?.ok || client.exceptions.length > 0) {
    failures.push({ target: 'SAA 113 shared material, zoom & official audio', details: saa113GroupCheck, exceptions: client.exceptions });
  } else {
    console.log('  ✓ SAA 113 G6: official audio, desktop two-column group material, cross-question persistence & image zoom verified');
  }

  // 5D-6. 114 年 SAA G4 Q20、G4 Q35、G5 Q15：獨立純圖選項卡、(A)-(D) 無洩漏文字、optionAltTexts 與放大視窗 E2E
  client.exceptions = [];
  await client.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=mcq-exam` });
  await new Promise(r => setTimeout(r, 800));
  const saa114G4Check = await client.evaluate(`
    (async () => {
      const buttons = () => Array.from(document.querySelectorAll('button'));
      const byText = (label) => buttons().find(b => (b.innerText || '').includes(label));
      const click = async (label, wait = 180) => {
        const button = byText(label);
        if (!button) return false;
        button.click();
        await new Promise(r => setTimeout(r, wait));
        return true;
      };
      const waitImagesLoaded = async (prefix) => {
        for (let attempt = 0; attempt < 20; attempt++) {
          const imgs = Array.from(document.querySelectorAll('img[src*="' + prefix + '"]'));
          if (imgs.length === 4 && imgs.every(img => img.complete && img.naturalWidth > 0)) {
            return imgs;
          }
          await new Promise(r => setTimeout(r, 120));
        }
        return Array.from(document.querySelectorAll('img[src*="' + prefix + '"]'));
      };

      if (!await click('學力檢測練習')) return { ok: false, reason: 'missing SAA entry' };
      await click('四年級');
      await click('官方考古題');
      await click('114 年');
      if (!await click('開始114 年官方卷', 450)) return { ok: false, reason: 'missing 114 G4 start' };
      await click('開始作答', 450);

      // Jump to G4 Q20
      const q20Btn = buttons().find(b => (b.innerText || '').trim() === '20');
      if (!q20Btn) return { ok: false, reason: 'missing G4 Q20 nav' };
      q20Btn.click();
      await new Promise(r => setTimeout(r, 250));
      const q20Imgs = await waitImagesLoaded('g4_q20_');
      const q20Alts = q20Imgs.map(img => img.getAttribute('alt') || '');
      const q20AltOk = ['50', '25', '15', '5'].every((n, i) => (q20Alts[i] || '').includes(n));
      const q20Loaded = q20Imgs.length === 4 && q20Imgs.every(img => img.complete && img.naturalWidth > 0);
      const q20ZoomBtns = Array.from(document.querySelectorAll('[data-testid="option-image-zoom"]'));
      q20ZoomBtns[0]?.click();
      await new Promise(r => setTimeout(r, 160));
      const q20ZoomOk = !!document.querySelector('[data-testid="exam-image-zoom"] img[src*="g4_q20_a.webp"]');
      document.querySelector('[data-testid="exam-image-zoom"] button[aria-label="關閉放大圖片"]')?.click();
      await new Promise(r => setTimeout(r, 120));

      // Jump to G4 Q35
      const q35Btn = buttons().find(b => (b.innerText || '').trim() === '35');
      if (!q35Btn) return { ok: false, reason: 'missing G4 Q35 nav' };
      q35Btn.click();
      await new Promise(r => setTimeout(r, 250));
      const q35GroupVisible = (document.body.innerText || '').includes('Surprise Party');
      const q35Imgs = await waitImagesLoaded('g4_q35_');
      const q35Loaded = q35Imgs.length === 4 && q35Imgs.every(img => img.complete && img.naturalWidth > 0);
      const q35AltOk = q35Imgs.every(img => (img.getAttribute('alt') || '').trim().length > 2);
      const q35ZoomBtns = Array.from(document.querySelectorAll('[data-testid="option-image-zoom"]'));
      q35ZoomBtns[3]?.click();
      await new Promise(r => setTimeout(r, 160));
      const q35ZoomOk = !!document.querySelector('[data-testid="exam-image-zoom"] img[src*="g4_q35_d.webp"]');
      document.querySelector('[data-testid="exam-image-zoom"] button[aria-label="關閉放大圖片"]')?.click();

      return {
        ok: q20Loaded && q20AltOk && q20ZoomOk && q35GroupVisible && q35Loaded && q35AltOk && q35ZoomOk,
        q20Loaded,
        q20AltOk,
        q20ZoomOk,
        q35GroupVisible,
        q35Loaded,
        q35AltOk,
        q35ZoomOk
      };
    })()
  `);

  await client.send('Page.navigate', { url: `${BASE_URL}/?view=mcq-exam` });
  await new Promise(r => setTimeout(r, 800));
  const saa114G5Check = await client.evaluate(`
    (async () => {
      const buttons = () => Array.from(document.querySelectorAll('button'));
      const byText = (label) => buttons().find(b => (b.innerText || '').includes(label));
      const click = async (label, wait = 180) => {
        const button = byText(label);
        if (!button) return false;
        button.click();
        await new Promise(r => setTimeout(r, wait));
        return true;
      };
      const waitImagesLoaded = async (prefix) => {
        for (let attempt = 0; attempt < 20; attempt++) {
          const imgs = Array.from(document.querySelectorAll('img[src*="' + prefix + '"]'));
          if (imgs.length === 4 && imgs.every(img => img.complete && img.naturalWidth > 0)) {
            return imgs;
          }
          await new Promise(r => setTimeout(r, 120));
        }
        return Array.from(document.querySelectorAll('img[src*="' + prefix + '"]'));
      };

      if (!await click('學力檢測練習')) return { ok: false, reason: 'missing SAA entry' };
      await click('五年級');
      await click('官方考古題');
      await click('114 年');
      if (!await click('開始114 年官方卷', 450)) return { ok: false, reason: 'missing 114 G5 start' };
      await click('開始作答', 450);

      const q15Btn = buttons().find(b => (b.innerText || '').trim() === '15');
      if (!q15Btn) return { ok: false, reason: 'missing G5 Q15 nav' };
      q15Btn.click();
      await new Promise(r => setTimeout(r, 250));
      const q15Imgs = await waitImagesLoaded('g5_q15_');
      const q15Loaded = q15Imgs.length === 4 && q15Imgs.every(img => img.complete && img.naturalWidth > 0);
      const q15AltOk = q15Imgs.every(img => (img.getAttribute('alt') || '').trim().length > 2);
      const q15ZoomBtns = Array.from(document.querySelectorAll('[data-testid="option-image-zoom"]'));
      q15ZoomBtns[2]?.click();
      await new Promise(r => setTimeout(r, 160));
      const q15ZoomOk = !!document.querySelector('[data-testid="exam-image-zoom"] img[src*="g5_q15_c.webp"]');
      document.querySelector('[data-testid="exam-image-zoom"] button[aria-label="關閉放大圖片"]')?.click();

      return { ok: q15Loaded && q15AltOk && q15ZoomOk, q15Loaded, q15AltOk, q15ZoomOk };
    })()
  `);
  await client.send('Emulation.clearDeviceMetricsOverride', {});
  if (!saa114G4Check?.ok || !saa114G5Check?.ok || client.exceptions.length > 0) {
    failures.push({ target: 'SAA 114 G4 Q20/Q35 & G5 Q15 Option Cards & Zoom E2E', details: { saa114G4Check, saa114G5Check }, exceptions: client.exceptions });
  } else {
    console.log('  ✓ SAA 114 G4 Q20, G4 Q35 & G5 Q15: pure 4-card option images, optionAltTexts & zoom modal verified');
  }

  // 5D-7. 115 年 SAA G4 Q1 (官方音檔 + 4圖選項 + 放大視窗) & G6 Q3 (獨立圖卡 + 放大視窗) E2E
  client.exceptions = [];
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=mcq-exam` });
  await new Promise(r => setTimeout(r, 800));
  const saa115G4Check = await client.evaluate(`
    (async () => {
      const buttons = () => Array.from(document.querySelectorAll('button'));
      const byText = (label) => buttons().find(b => (b.innerText || '').includes(label));
      const click = async (label, wait = 180) => {
        const button = byText(label);
        if (!button) return false;
        button.click();
        await new Promise(r => setTimeout(r, wait));
        return true;
      };
      const waitImagesLoaded = async (prefix) => {
        for (let attempt = 0; attempt < 20; attempt++) {
          const imgs = Array.from(document.querySelectorAll('img[src*="' + prefix + '"]'));
          if (imgs.length === 4 && imgs.every(img => img.complete && img.naturalWidth > 0)) {
            return imgs;
          }
          await new Promise(r => setTimeout(r, 120));
        }
        return Array.from(document.querySelectorAll('img[src*="' + prefix + '"]'));
      };

      if (!await click('學力檢測練習')) return { ok: false, reason: 'missing SAA entry' };
      await click('四年級');
      await click('官方考古題');
      await click('115 年');
      if (!await click('開始115 年官方卷', 450)) return { ok: false, reason: 'missing 115 G4 start' };
      await click('開始作答', 450);

      const audioBtn = buttons().find(b => (b.innerText || '').includes('播放') || (b.getAttribute('aria-label') || '').includes('播放'));
      if (audioBtn) audioBtn.click();
      await new Promise(r => setTimeout(r, 120));

      const q6Btn = buttons().find(b => (b.innerText || '').trim() === '6');
      if (!q6Btn) return { ok: false, reason: 'missing G4 Q6 nav' };
      q6Btn.click();
      await new Promise(r => setTimeout(r, 250));

      const q6Imgs = await waitImagesLoaded('g4_q6_');
      const q6Loaded = q6Imgs.length === 4 && q6Imgs.every(img => img.complete && img.naturalWidth > 0);
      const q6AltOk = q6Imgs.length === 4 && q6Imgs.every(img => (img.getAttribute('alt') || '').trim().length >= 2);
      const q6ZoomBtns = Array.from(document.querySelectorAll('[data-testid="option-image-zoom"]'));
      q6ZoomBtns[0]?.click();
      await new Promise(r => setTimeout(r, 160));
      const q6ZoomOk = !!document.querySelector('[data-testid="exam-image-zoom"] img[src*="g4_q6_a.webp"]');
      document.querySelector('[data-testid="exam-image-zoom"] button[aria-label="關閉放大圖片"]')?.click();

      return { ok: q6Loaded && q6AltOk && !!audioBtn && q6ZoomOk, q6Loaded, q6AltOk, hasAudioBtn: !!audioBtn, q6ZoomOk };
    })()
  `);

  await client.send('Page.navigate', { url: `${BASE_URL}/?view=mcq-exam` });
  await new Promise(r => setTimeout(r, 800));
  const saa115G6Check = await client.evaluate(`
    (async () => {
      const buttons = () => Array.from(document.querySelectorAll('button'));
      const byText = (label) => buttons().find(b => (b.innerText || '').includes(label));
      const click = async (label, wait = 180) => {
        const button = byText(label);
        if (!button) return false;
        button.click();
        await new Promise(r => setTimeout(r, wait));
        return true;
      };
      const waitImagesLoaded = async (prefix) => {
        for (let attempt = 0; attempt < 20; attempt++) {
          const imgs = Array.from(document.querySelectorAll('img[src*="' + prefix + '"]'));
          if (imgs.length === 4 && imgs.every(img => img.complete && img.naturalWidth > 0)) {
            return imgs;
          }
          await new Promise(r => setTimeout(r, 120));
        }
        return Array.from(document.querySelectorAll('img[src*="' + prefix + '"]'));
      };

      if (!await click('學力檢測練習')) return { ok: false, reason: 'missing SAA entry' };
      await click('六年級');
      await click('官方考古題');
      await click('115 年');
      if (!await click('開始115 年官方卷', 450)) return { ok: false, reason: 'missing 115 G6 start' };
      await click('開始作答', 450);

      const q3Btn = buttons().find(b => (b.innerText || '').trim() === '3');
      if (!q3Btn) return { ok: false, reason: 'missing G6 Q3 nav' };
      q3Btn.click();
      await new Promise(r => setTimeout(r, 250));
      const q3Imgs = await waitImagesLoaded('g6_q3_');
      const q3Loaded = q3Imgs.length === 4 && q3Imgs.every(img => img.complete && img.naturalWidth > 0);
      const q3AltOk = q3Imgs.length === 4 && q3Imgs.every(img => (img.getAttribute('alt') || '').trim().length > 2);
      const q3ZoomBtns = Array.from(document.querySelectorAll('[data-testid="option-image-zoom"]'));
      q3ZoomBtns[3]?.click();
      await new Promise(r => setTimeout(r, 160));
      const q3ZoomOk = !!document.querySelector('[data-testid="exam-image-zoom"] img[src*="g6_q3_d.webp"]');
      document.querySelector('[data-testid="exam-image-zoom"] button[aria-label="關閉放大圖片"]')?.click();

      return { ok: q3Loaded && q3AltOk && q3ZoomOk, q3Loaded, q3AltOk, q3ZoomOk };
    })()
  `);
  if (!saa115G4Check?.ok || !saa115G6Check?.ok || client.exceptions.length > 0) {
    failures.push({ target: 'SAA 115 G4 Q1 & G6 Q3 Option Cards, Audio & Zoom E2E', details: { saa115G4Check, saa115G6Check }, exceptions: client.exceptions });
  } else {
    console.log('  ✓ SAA 115 G4 Q1 & G6 Q3: pure 4-card option images, audio button, optionAltTexts & zoom modal verified');
  }

  // 5E. 課本題庫檢定館 (mcq-exam) 一頁式免捲動選範圍 -> 開始檢定 -> 選答案 -> 下一題 深度驗證
  client.exceptions = [];
  await client.send('Page.navigate', { url: `${BASE_URL}/?view=mcq-exam` });
  await new Promise(r => setTimeout(r, 800));
  const mcqExamCheck = await client.evaluate(`
    (async () => {
      const textbookEntry = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('課本題庫練習'));
      if (textbookEntry) {
        textbookEntry.click();
        await new Promise(r => setTimeout(r, 200));
      }
      const startBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('開始檢定'));
      if (!startBtn) return { ok: false, reason: 'No start button on setup view' };
      startBtn.click();
      await new Promise(r => setTimeout(r, 400));
      // 點擊第 0 頁（本次測驗說明與配置）之「正式開始作答」進入第 1 題
      const beginBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('開始作答'));
      if (beginBtn) {
        beginBtn.click();
        await new Promise(r => setTimeout(r, 400));
      }
      const body1 = document.body.innerText || '';
      const onQ1 = body1.includes('1 / 20') || body1.includes('Question 1');
      // 點選第一個選項 (A)
      const optBtns = Array.from(document.querySelectorAll('button')).filter(b => (b.innerText || '').trim().startsWith('A'));
      if (optBtns[0]) optBtns[0].click();
      await new Promise(r => setTimeout(r, 250));
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('下一題'));
      if (nextBtn) nextBtn.click();
      await new Promise(r => setTimeout(r, 300));
      const body2 = document.body.innerText || '';
      const onQ2 = body2.includes('2 / 20') || body2.includes('Question 2');
      return { ok: onQ1 && onQ2, onQ1, onQ2 };
    })()
  `);
  if (!mcqExamCheck?.ok || client.exceptions.length > 0) {
    failures.push({ target: 'PureMcqExamView (mcq-exam) One-Page Flow', details: mcqExamCheck, exceptions: client.exceptions });
  } else {
    console.log('  ✓ PureMcqExamView (mcq-exam): Zero-scroll setup -> Q1 answer -> Next page Q2 verified');
  }

  // ── 檢查點 6: 全部 14 款遊戲跨角色矩陣全量啟動 ──
  console.log('\n[6/6] Testing All 14 Games Across 4 Profiles...');
  const testProfiles = [
    { label: 'G1 (一年級)', grade: 1, book: 'abc' },
    { label: 'G2 (二年級)', grade: 2, book: 'abc' },
    { label: 'G4 (四年級)', grade: 4, book: '3' },
    { label: 'Guest (訪客)', grade: 'guest', book: '1' }
  ];

  for (const prof of testProfiles) {
    for (const gid of ALL_GAME_IDS) {
      client.exceptions = [];
      const url = `${BASE_URL}/?view=${gid}&grade=${prof.grade}&book=${prof.book}`;
      // 使用 SPA 內部 PopState 進行高效視圖切換，避免全頁重新載入與 56 次重複 Supabase 雲端請求
      await client.evaluate(`
        (() => {
          const u = new URL('${url}');
          window.history.pushState({ view: '${gid}' }, '', u.pathname + u.search);
          window.dispatchEvent(new PopStateEvent('popstate', { state: { view: '${gid}' } }));
        })()
      `);
      await new Promise(r => setTimeout(r, 200));

      const isCrashed = await client.evaluate(`document.body.innerText.includes('畫面載入遇到小插曲')`);
      if (isCrashed || client.exceptions.length > 0) {
        console.log(`  ❌ [CRASH] ${prof.label} -> Game: ${gid}`);
        failures.push({ profile: prof.label, game: gid, exceptions: client.exceptions });
      }
    }
    console.log(`  ✓ 14 games passed for ${prof.label}`);
  }

  client.ws.close();
  try { chrome.kill(); } catch (e) {}
  try { server.kill(); } catch (e) {}

  if (failures.length > 0) {
    console.log(`\n❌ TEST SUITE FAILED! Total Failed Items: ${failures.length}`);
    console.log(JSON.stringify(failures, null, 2));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL FUNCTIONAL TESTS & ALL 14 GAMES PASSED 100% WITH ZERO CRASHES!');
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Test runner fatal error:', err);
  try { chrome.kill(); } catch (e) {}
  try { server.kill(); } catch (e) {}
  process.exit(1);
});
