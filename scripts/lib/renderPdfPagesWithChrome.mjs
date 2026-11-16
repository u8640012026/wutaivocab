import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');
const PDFJS_DIR = path.join(ROOT, 'node_modules', 'pdfjs-dist');

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
  throw new Error('Chrome binary not found for PDF rasterization');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.bcmap': 'application/octet-stream',
  '.pfb': 'application/octet-stream',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CdpSession {
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
      throw new Error(`Chrome PDF rasterize error: ${res.exceptionDetails.text}`);
    }
    return res.result?.value;
  }
  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

/**
 * 使用本機 Chrome（DirectWrite / Skia 完整繁中字型引擎）搭配 pdfjs-dist（含 CMap 與標準字型）
 * 將 PDF 逐頁轉成高解析度 PNG Buffer，避免 Node canvas 缺字導致圖內「公分、單位、國字」變形。
 *
 * @param {string} pdfPath PDF 絕對路徑
 * @param {number} [scale=3] 縮放倍率（須與 pdfjsLib.getViewport({ scale }) 一致）
 * @returns {Promise<Array<{ pageNumber: number, width: number, height: number, data: Buffer }>>}
 */
export async function renderPdfPagesWithChrome(pdfPath, scale = 3) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const cdpPort = 9280 + Math.floor(Math.random() * 60);
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'priori-pdf-render-'));

  const server = http.createServer((req, res) => {
    const reqPath = (req.url || '/').split('?')[0];
    if (reqPath === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body>
<canvas id="c"></canvas>
<script type="module">
  import * as pdfjsLib from '/pdfjs/build/pdf.mjs';
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/build/pdf.worker.mjs';
  window.__renderAllPages = async (scale) => {
    const doc = await pdfjsLib.getDocument({
      url: '/target.pdf',
      cMapUrl: '/pdfjs/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: '/pdfjs/standard_fonts/',
      useSystemFonts: true,
      verbosity: 1,
    }).promise;
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d', { alpha: false });
    const pages = [];
    for (let p = 1; p <= doc.numPages; p += 1) {
      const page = await doc.getPage(p);
      const viewport = page.getViewport({ scale });
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      pages.push({
        pageNumber: p,
        width: canvas.width,
        height: canvas.height,
        dataUrl: canvas.toDataURL('image/png'),
      });
    }
    return pages;
  };
</script>
</body></html>`);
      return;
    }

    if (reqPath === '/target.pdf') {
      res.writeHead(200, { 'Content-Type': 'application/pdf' });
      res.end(pdfBytes);
      return;
    }

    if (reqPath.startsWith('/pdfjs/')) {
      const rel = reqPath.slice('/pdfjs/'.length);
      const target = path.resolve(PDFJS_DIR, rel);
      if (!target.startsWith(PDFJS_DIR) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(target).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(target).pipe(res);
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  let chrome = null;
  let cdp = null;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}/`;

    chrome = spawn(
      findChromePath(),
      [
        `--remote-debugging-port=${cdpPort}`,
        `--user-data-dir=${userDataDir}`,
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        'about:blank',
      ],
      { stdio: 'ignore' }
    );

    let wsUrl = null;
    for (let i = 0; i < 40; i += 1) {
      try {
        const list = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json();
        const page = list.find((t) => t.type === 'page');
        if (page?.webSocketDebuggerUrl) {
          wsUrl = page.webSocketDebuggerUrl;
          break;
        }
      } catch {}
      await sleep(200);
    }
    if (!wsUrl) throw new Error('Failed to attach Chrome CDP for PDF rasterization');

    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });
    cdp = new CdpSession(ws);
    await cdp.send('Page.enable');
    await cdp.send('Page.navigate', { url: baseUrl });
    for (let i = 0; i < 40; i += 1) {
      const ready = await cdp.eval(`typeof window.__renderAllPages === 'function'`);
      if (ready) break;
      await sleep(100);
    }

    const rendered = await cdp.eval(`window.__renderAllPages(${Number(scale)})`);
    return rendered.map((p) => ({
      pageNumber: p.pageNumber,
      width: p.width,
      height: p.height,
      data: Buffer.from(p.dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'),
    }));
  } finally {
    cdp?.close();
    try {
      chrome?.kill();
    } catch {}
    try {
      server.close();
    } catch {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}
