import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

function findChromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/opt/google/chrome/chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const direct = candidates.find((p) => fs.existsSync(p));
  if (direct) return direct;
  if (process.platform !== 'win32') {
    try {
      const resolved = execSync(
        'command -v google-chrome || command -v chromium || command -v chromium-browser || true',
        { encoding: 'utf8' }
      ).trim();
      if (resolved && fs.existsSync(resolved)) return resolved;
    } catch {}
  }
  throw new Error('Chrome binary not found');
}

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'priori', 'guide');
const SPEC_PATH = path.join(ROOT, 'src', 'data', 'priori', 'prioriGuideSteps.json');
const VIEW_W = 1280;
const VIEW_H = 820;
const PREVIEW_PORT = 4197;
const CDP_PORT = 9277;
const BASE_URL = `http://127.0.0.1:${PREVIEW_PORT}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${res.exceptionDetails.text}`);
    }
    return res.result?.value;
  }
  async captureWebp(filename, rectExpr) {
    const rect = await this.eval(rectExpr);
    if (!rect) {
      const dbg = await this.eval(`({ url: location.href, btns: Array.from(document.querySelectorAll('button')).map(b => (b.innerText || '').trim().replace(/\\s+/g, ' ')).filter(Boolean).slice(0, 20) })`);
      console.log('DEBUG NULL RECT:', filename, dbg);
    }
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    const outPath = path.join(OUT_DIR, filename);
    await sharp(Buffer.from(data, 'base64'))
      .webp({ quality: 82 })
      .toFile(outPath);
    const clamped = rect
      ? {
          x: Math.max(1, Math.min(96, Number(((rect.x / VIEW_W) * 100).toFixed(2)))),
          y: Math.max(1, Math.min(96, Number(((rect.y / VIEW_H) * 100).toFixed(2)))),
          w: Math.max(4, Math.min(98, Number(((rect.w / VIEW_W) * 100).toFixed(2)))),
          h: Math.max(4, Math.min(98, Number(((rect.h / VIEW_H) * 100).toFixed(2)))),
        }
      : { x: 25, y: 25, w: 50, h: 30 };
    console.log(`✓ ${filename} -> spotlight`, clamped);
    return clamped;
  }
  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = spawn(
    process.execPath,
    [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--host', '127.0.0.1', '--port', String(PREVIEW_PORT), '--strictPort'],
    { cwd: ROOT, stdio: 'ignore' }
  );
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'priori-guide-shots-'));
  let chrome = null;
  let client = null;

  try {
    for (let i = 0; i < 30; i += 1) {
      try {
        const r = await fetch(BASE_URL);
        if (r.ok) break;
      } catch {}
      await sleep(250);
    }

    chrome = spawn(
      findChromePath(),
      [
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${userDataDir}`,
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        `--window-size=${VIEW_W},${VIEW_H}`,
        'about:blank',
      ],
      { stdio: 'ignore' }
    );

    let wsUrl = null;
    for (let i = 0; i < 30; i += 1) {
      try {
        const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
        const page = list.find((t) => t.type === 'page');
        if (page?.webSocketDebuggerUrl) {
          wsUrl = page.webSocketDebuggerUrl;
          break;
        }
      } catch {}
      await sleep(250);
    }
    if (!wsUrl) throw new Error('Failed to attach CDP');

    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });
    client = new CdpClient(ws);
    await client.send('Page.enable');
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        const origFetch = window.fetch.bind(window);
        window.fetch = async (input, init) => {
          const url = typeof input === 'string' ? input : (input?.url || '');
          if (url.includes('/rest/v1/rpc/priori_teacher_login')) {
            return new Response(JSON.stringify({
              authorized: true,
              token: 'guide-mock-token',
              teacher_id: 'admin',
              display_name: '示範教師',
              allowed_classes: ['*'],
              expires_at: new Date(Date.now() + 3600000).toISOString(),
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (url.includes('/rest/v1/rpc/priori_teacher_list_records')) {
            return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (url.includes('/rest/v1/rpc/priori_teacher_get_roster')) {
            return new Response(JSON.stringify({ ok: true, roster: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (url.includes('/rest/v1/rpc/priori_teacher_')) {
            return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          return origFetch(input, init);
        };
      `,
    });
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: VIEW_W,
      height: VIEW_H,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // 1. Student Step 1: Hub identity button
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori` });
    await sleep(900);
    const s1Rect = await client.captureWebp(
      'student_1_identity.webp',
      `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('訪客練習中'));
        const r = btn?.getBoundingClientRect();
        return r ? { x: r.left - 8, y: r.top - 6, w: r.width + 16, h: r.height + 12 } : null;
      })()`
    );

    // 2. Student Step 2: Select Chinese + Grade 5
    await client.eval(`
      (() => {
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('國語科'))?.click();
        setTimeout(() => {
          Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '五年級')?.click();
        }, 120);
      })()
    `);
    await sleep(450);
    const s2Rect = await client.captureWebp(
      'student_2_subject.webp',
      `(() => {
        const chiBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('國語科'));
        const g5Btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '五年級');
        const r1 = chiBtn?.getBoundingClientRect();
        const r2 = g5Btn?.getBoundingClientRect();
        if (!r1 || !r2) return null;
        const left = Math.min(r1.left, r2.left) - 10;
        const top = Math.min(r1.top, r2.top) - 8;
        const right = Math.max(r1.right, r2.right) + 10;
        const bottom = Math.max(r1.bottom, r2.bottom) + 8;
        return { x: left, y: top, w: right - left, h: bottom - top };
      })()`
    );

    // 3. Student Step 3: 114 Chinese G5 paper row
    const s3Rect = await client.captureWebp(
      'student_3_start.webp',
      `(() => {
        const row = Array.from(document.querySelectorAll('div.rounded-2xl')).find(el => {
          const t = el.innerText || '';
          return t.includes('114 年') && t.includes('五年級國語科');
        });
        row?.scrollIntoView({ block: 'center' });
        const r = row?.getBoundingClientRect();
        return r ? { x: r.left - 8, y: r.top - 6, w: r.width + 16, h: r.height + 12 } : null;
      })()`
    );

    // 4. Student Step 4: Click 開始測驗 on 114 Chinese G5 row
    await client.eval(`
      (() => {
        const row = Array.from(document.querySelectorAll('div.rounded-2xl')).find(el => {
          const t = el.innerText || '';
          return t.includes('114 年') && t.includes('五年級國語科');
        });
        Array.from(row?.querySelectorAll('button') || []).find(b => (b.innerText || '').includes('開始測驗') || (b.innerText || '').includes('再次練習'))?.click();
      })()
    `);
    await client.eval(`
      (async () => {
        const deadline = Date.now() + 5000;
        while (Date.now() < deadline && !document.querySelector('button[aria-label="跳到第 20 題"]')) {
          await new Promise(r => setTimeout(r, 100));
        }
        document.querySelector('button[aria-label="跳到第 20 題"]')?.click();
      })()
    `);
    await sleep(500);
    const s4Rect = await client.captureWebp(
      'student_4_exam.webp',
      `(() => {
        const readBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('朗讀'));
        const r = readBtn?.parentElement?.getBoundingClientRect() || readBtn?.getBoundingClientRect();
        return r ? { x: r.left - 8, y: r.top - 6, w: r.width + 16, h: r.height + 12 } : null;
      })()`
    );

    // 5. Student Step 5: Jump to Q25, submit to show Result + Mastery progress (連續答對 2 次即精熟)
    await client.eval(`
      (() => {
        document.querySelector('button[aria-label="跳到第 25 題"]')?.click();
      })()
    `);
    await sleep(250);
    await client.eval(`
      (() => {
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('交卷核對'))?.click();
      })()
    `);
    await sleep(300);
    await client.eval(`
      (() => {
        Array.from(document.querySelectorAll('[role="dialog"] button')).find(b => (b.innerText || '').includes('確定交卷'))?.click();
      })()
    `);
    await client.eval(`
      (async () => {
        const deadline = Date.now() + 4000;
        while (Date.now() < deadline && !(document.body.innerText || '').includes('精熟進度')) {
          await new Promise(r => setTimeout(r, 100));
        }
      })()
    `);
    await sleep(300);
    const s5Rect = await client.captureWebp(
      'student_5_drill.webp',
      `(() => {
        const badge = Array.from(document.querySelectorAll('span')).find(s => (s.innerText || '').includes('連續答對 2 次'));
        const target = badge?.parentElement || badge;
        const r = target?.getBoundingClientRect();
        return r && r.width > 0 ? { x: r.left - 8, y: r.top - 6, w: r.width + 16, h: r.height + 12 } : null;
      })()`
    );
    await client.eval(`
      (() => {
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('回練習館'))?.click();
      })()
    `);
    await sleep(300);

    // 6. Teacher Step 1: QR modal on Hub
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori` });
    await sleep(700);
    await client.eval(`
      (() => {
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('派卷 QR'))?.click();
      })()
    `);
    await sleep(650);
    const t1Rect = await client.captureWebp(
      'teacher_1_qr.webp',
      `(() => {
        const dlg = document.querySelector('[role="dialog"][aria-label="派卷 QR Code"]');
        const r = dlg?.firstElementChild?.getBoundingClientRect() || dlg?.getBoundingClientRect();
        return r ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
      })()`
    );

    // 7. Teacher Step 3, 4, 5, 2 inside Teacher Dashboard (click 教師後台 from Hub)
    await client.eval(`
      (() => {
        document.querySelector('[aria-label="關閉 QR Code 視窗"]')?.click();
      })()
    `);
    await sleep(250);
    const teacherDebug = await client.eval(`
      (async () => {
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('教師後台'))?.click();
        const deadline = Date.now() + 4000;
        while (Date.now() < deadline && !document.querySelector('input[type="password"]')) {
          await new Promise(r => setTimeout(r, 100));
        }
        const pwInput = document.querySelector('input[type="password"]');
        if (!pwInput) return { stage: 'no-pw-input', text: document.body.innerText.slice(0, 120) };
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(pwInput, 'guide-demo-pw');
        pwInput.dispatchEvent(new Event('input', { bubbles: true }));
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('驗證進入教師診斷台'))?.click();
        const classDeadline = Date.now() + 4000;
        while (Date.now() < classDeadline && !document.querySelector('select[aria-label="篩選班級"]')) {
          await new Promise(r => setTimeout(r, 100));
        }
        const classSel = document.querySelector('select[aria-label="篩選班級"]');
        if (!classSel) return { stage: 'no-class-sel', text: document.body.innerText.slice(0, 180) };
        const selSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        selSetter.call(classSel, 'demo');
        classSel.dispatchEvent(new Event('change', { bubbles: true }));
        return { stage: 'ok' };
      })()
    `);
    console.log('Teacher login status:', teacherDebug);
    await sleep(600);

    // Teacher Step 3: Overview + Initial/Mastery toggle
    const t3Rect = await client.captureWebp(
      'teacher_3_overview.webp',
      `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('精熟後成果'));
        const r = btn?.parentElement?.getBoundingClientRect() || btn?.getBoundingClientRect();
        return r && r.width > 0 ? { x: r.left - 8, y: r.top - 6, w: r.width + 16, h: r.height + 12 } : null;
      })()`
    );

    // Teacher Step 2: Print Picker Modal
    await client.eval(`
      (() => {
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('列印解答卷'))?.click();
      })()
    `);
    await sleep(450);
    const t2Rect = await client.captureWebp(
      'teacher_2_print.webp',
      `(() => {
        const dlg = document.querySelector('[role="dialog"][aria-label="選擇列印試卷與版本"]');
        const r = dlg?.firstElementChild?.getBoundingClientRect() || dlg?.getBoundingClientRect();
        return r && r.width > 0 ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
      })()`
    );
    await client.eval(`document.querySelector('[aria-label="關閉列印選單"]')?.click();`);
    await sleep(250);

    // Teacher Step 4: Switch to 依題目 tab & capture matrix
    await client.eval(`
      (() => {
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '依題目')?.click();
      })()
    `);
    await sleep(350);
    await client.eval(`
      (() => {
        const sec = document.querySelector('section[aria-label="依題目班級作答交叉矩陣"]');
        sec?.scrollIntoView({ block: 'start' });
      })()
    `);
    await sleep(300);
    const t4Rect = await client.captureWebp(
      'teacher_4_question.webp',
      `(() => {
        const sec = document.querySelector('section[aria-label="依題目班級作答交叉矩陣"]');
        const r = sec?.getBoundingClientRect();
        return r && r.width > 0 ? { x: r.left, y: r.top, w: r.width, h: Math.min(r.height, 420) } : null;
      })()`
    );

    // Teacher Step 5: Switch back to 依班級 + real class 1 to show 批次設 4 碼密碼
    await client.eval(`
      (() => {
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '依班級')?.click();
        const classSel = document.querySelector('select[aria-label="篩選班級"]');
        if (classSel) {
          const selSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
          selSetter.call(classSel, '1');
          classSel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(350);
    await client.eval(`
      (() => {
        const pinBtn = document.getElementById('priori-teacher-batch-pin-btn');
        pinBtn?.scrollIntoView({ block: 'center' });
      })()
    `);
    await sleep(250);
    const t5Rect = await client.captureWebp(
      'teacher_5_pin.webp',
      `(() => {
        const pinBtn = document.getElementById('priori-teacher-batch-pin-btn');
        const r = pinBtn?.getBoundingClientRect();
        return r && r.width > 0 ? { x: r.left - 10, y: r.top - 8, w: r.width + 20, h: r.height + 16 } : null;
      })()`
    );

    const spec = {
      student: [
        {
          id: 'student-1-identity',
          title: '步驟 1：選班級座號並自設 4 碼密碼',
          desc: '點右上角身分膠囊選擇「年級、班級、座號」。第一次使用會請你自設一組好記的「4 碼換機密碼」，以後用這台 iPad 都免重登！',
          image: '/assets/priori/guide/student_1_identity.webp',
          rect: s1Rect,
          demoTyping: '2026',
          typingLabel: '示範自設 4 碼',
          actionHint: '點亮區或下一步繼續',
        },
        {
          id: 'student-2-subject',
          title: '步驟 2：挑選「國語科」與「五年級」',
          desc: '在首頁上方先選科目（舉例：點「國語科」），再點選自己的年級（舉例：「五年級」），下方就會整理出對應的歷屆試卷。',
          image: '/assets/priori/guide/student_2_subject.webp',
          rect: s2Rect,
          actionHint: '點亮區或下一步繼續',
        },
        {
          id: 'student-3-start',
          title: '步驟 3：點開「114 年五年級國語科」開始練習',
          desc: '找到目標年度的試卷卡片，點右側「開始練習」或「再次練習」按鈕，即可進入全真線上作答畫面。',
          image: '/assets/priori/guide/student_3_start.webp',
          rect: s3Rect,
          actionHint: '點亮區或下一步繼續',
        },
        {
          id: 'student-4-exam',
          title: '步驟 4：雙欄作答＋「原卷 / 朗讀」自由切換',
          desc: '閱讀題組採左文右題並排，右上角可切換「原卷／朗讀」模式（數學科還可展開 iPad 計算紙手寫筆跡）。選好答案後按右上「交卷」。',
          image: '/assets/priori/guide/student_4_exam.webp',
          rect: s4Rect,
          actionHint: '點亮區或下一步繼續',
        },
        {
          id: 'student-5-drill',
          title: '步驟 5：錯題沉底特訓（連對 2 次即精熟）',
          desc: '交卷後如果有答錯的題目，點「開始錯題特訓」就能把錯題集中重練；每題累計連對 2 次就會標記為「🌟 已精熟」！',
          image: '/assets/priori/guide/student_5_drill.webp',
          rect: s5Rect,
          actionHint: '完成學生導覽',
        },
      ],
      teacher: [
        {
          id: 'teacher-1-qr',
          title: '步驟 1：一鍵「派卷 QR Code」給全班掃碼',
          desc: '點首頁上方「派卷 QR」，選擇「科目 × 年度 × 年級」就會即時產生專屬 QR Code，學生平板一掃就直達該卷。',
          image: '/assets/priori/guide/teacher_1_qr.webp',
          rect: t1Rect,
          actionHint: '點亮區或下一步繼續',
        },
        {
          id: 'teacher-2-print',
          title: '步驟 2：快速列印「空白練習卷 / 教師解答卷」',
          desc: '在教師後台點「列印解答卷（含正解）」，挑好科目、年度與年級即可直接預覽並印出含題圖的紙本試卷或解答卷。',
          image: '/assets/priori/guide/teacher_2_print.webp',
          rect: t2Rect,
          actionHint: '點亮區或下一步繼續',
        },
        {
          id: 'teacher-3-overview',
          title: '步驟 3：後台看成績（初測成績 vs 精熟後成果）',
          desc: '進入教師後台後（此處以示範班級畫面呈現），可一鍵切換「初測成績（預設）」與「精熟後成果」，清楚對照學生補救前後表現。',
          image: '/assets/priori/guide/teacher_3_overview.webp',
          rect: t3Rect,
          actionHint: '點亮區或下一步繼續',
        },
        {
          id: 'teacher-4-question',
          title: '步驟 4：「2. 依題目」檢視全班答對率與計算紙',
          desc: '往下滑到「2. 依題目」矩陣，可直接看出全班哪一題最常錯、快速預覽題目附圖（🖼️ 含題圖），也能點開單題檢視學生的計算紙筆跡。',
          image: '/assets/priori/guide/teacher_4_question.webp',
          rect: t4Rect,
          actionHint: '點亮區或下一步繼續',
        },
        {
          id: 'teacher-5-pin',
          title: '步驟 5：學生忘記密碼時「改設 / 批次設 4 碼」',
          desc: '若有學生忘記換機密碼，老師直接在後台點「改設 4 碼」或「批次設 4 碼密碼」，輸入新 4 碼即可立即重設，原有作答成績完全保留！',
          image: '/assets/priori/guide/teacher_5_pin.webp',
          rect: t5Rect,
          demoTyping: '1234',
          typingLabel: '示範重設 4 碼',
          actionHint: '完成教師導覽',
        },
      ],
    };

    fs.writeFileSync(SPEC_PATH, JSON.stringify(spec, null, 2), 'utf8');
    console.log(`✅ Saved 10 guide WebPs & ${SPEC_PATH}`);
  } finally {
    client?.close();
    try {
      chrome?.kill();
    } catch {}
    try {
      server?.kill();
    } catch {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

run().catch((err) => {
  console.error('❌ Guide capture failed:', err);
  process.exit(1);
});
