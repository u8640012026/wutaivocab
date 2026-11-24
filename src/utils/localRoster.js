import { parseStudentId, CLASS_OPTIONS } from './studentIdHelper.js';

const STORAGE_KEY = 'wutai_local_roster_v1';
const ROSTER_EVENT = 'wutai-local-roster-updated';

const CLASS_SHORT_MAP = Object.fromEntries(CLASS_OPTIONS.map((c) => [c.id, c.shortZh]));

export function normalizeSeatCode(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 6) return digits;
  if (digits.length === 5) return `0${digits}`;
  return '';
}

/**
 * 將 6 碼座號轉為教學現場可讀標籤，例如 050103 -> 5甲03號
 */
export function formatSeatCodeLabel(seatCode) {
  const code = normalizeSeatCode(seatCode);
  if (!code) return String(seatCode || '').trim() || '未編碼';
  const parsed = parseStudentId(code);
  if (!parsed.isValid) return code;
  if (parsed.isGuest) return '訪客';
  const gradeNum = parseInt(parsed.grade, 10);
  const classShort = CLASS_SHORT_MAP[parsed.classNum] || parsed.classNum;
  const seatNum = String(parseInt(parsed.seat, 10)).padStart(2, '0');
  return `${gradeNum}${classShort}${seatNum}號`;
}

export function getLocalRosterMap() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function getLocalRosterCount() {
  return Object.keys(getLocalRosterMap()).length;
}

export function saveLocalRosterEntries(entries, { merge = true } = {}) {
  if (typeof window === 'undefined') return {};
  const next = merge ? { ...getLocalRosterMap() } : {};
  for (const item of entries || []) {
    const code = normalizeSeatCode(item?.seatCode);
    const name = String(item?.name || '').trim();
    if (code && name) {
      next[code] = name;
    }
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(ROSTER_EVENT, { detail: { count: Object.keys(next).length } }));
  return next;
}

export function clearLocalRoster() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(ROSTER_EVENT, { detail: { count: 0 } }));
}

export function subscribeLocalRoster(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback(getLocalRosterMap());
  window.addEventListener(ROSTER_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(ROSTER_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

/**
 * 依本機名冊解譯座號為姓名；若無本機名冊則自動顯示為「5甲03號」
 */
export function resolveStudentDisplay(seatCodeOrText, rosterMapOverride = null) {
  const code = normalizeSeatCode(seatCodeOrText);
  if (!code) {
    const fallback = String(seatCodeOrText || '').trim();
    return {
      seatCode: '',
      seatLabel: fallback,
      localName: '',
      displayName: fallback,
      shortName: fallback,
      hasLocalName: false,
    };
  }
  const map = rosterMapOverride || getLocalRosterMap();
  const localName = String(map[code] || '').trim();
  const seatLabel = formatSeatCodeLabel(code);
  return {
    seatCode: code,
    seatLabel,
    localName,
    displayName: localName ? `${seatLabel} ${localName}` : seatLabel,
    shortName: localName || seatLabel,
    hasLocalName: Boolean(localName),
  };
}

/**
 * 支援兩種常見格式：
 * 1. 連續逗號串流：010101,王曉明,010102,陳小華,010103,張大為
 * 2. 逐行貼上（CSV / TSV / Excel 兩欄複製 / 空白分隔）
 */
export function parseRosterText(rawText) {
  const text = String(rawText || '').replace(/^\uFEFF/, '').trim();
  if (!text) return [];

  const resultsMap = new Map();
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    // 單行有多組逗號配對，例如: 010101,王曉明,010102,陳小華
    const commaTokens = line.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    if (commaTokens.length >= 4 && commaTokens.length % 2 === 0 && normalizeSeatCode(commaTokens[0]) && normalizeSeatCode(commaTokens[2])) {
      for (let i = 0; i < commaTokens.length; i += 2) {
        const code = normalizeSeatCode(commaTokens[i]);
        const name = String(commaTokens[i + 1] || '').trim();
        if (code && name && !normalizeSeatCode(name)) {
          resultsMap.set(code, name);
        }
      }
      continue;
    }

    // 單行兩欄（Tab / 逗號 / 空白）
    let parts = line.split(/\t|[,，]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length < 2) {
      parts = line.split(/\s+/).map((s) => s.trim()).filter(Boolean);
    }
    if (parts.length >= 2) {
      const code = normalizeSeatCode(parts[0]);
      const name = parts[1];
      if (code && name && !normalizeSeatCode(name)) {
        resultsMap.set(code, name);
      }
    }
  }

  return Array.from(resultsMap.entries())
    .map(([seatCode, name]) => ({ seatCode, name }))
    .sort((a, b) => a.seatCode.localeCompare(b.seatCode));
}

// ── 輕量純瀏覽器 .xlsx 解析器（使用瀏覽器內建 DecompressionStream，零外部套件、絕不離開本機）──
async function readZipEntries(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);
  const decoder = new TextDecoder('utf-8');
  const entries = new Map();

  let offset = 0;
  while (offset + 30 <= bytes.length) {
    const sig = view.getUint32(offset, true);
    if (sig !== 0x04034b50) break;
    const method = view.getUint16(offset + 8, true);
    const compSize = view.getUint32(offset + 18, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const name = decoder.decode(bytes.subarray(offset + 30, offset + 30 + nameLen));
    const dataStart = offset + 30 + nameLen + extraLen;

    // 若遇到 data descriptor (compSize === 0 且 bit 3 = 1)，改用中央目錄定位
    if (compSize === 0 && (view.getUint16(offset + 6, true) & 0x08) !== 0) {
      entries.clear();
      break;
    }

    const rawSlice = bytes.subarray(dataStart, dataStart + compSize);
    entries.set(name, { method, rawSlice });
    offset = dataStart + compSize;
  }

  // Fallback：從 Central Directory 讀取（支援 Google Sheets / Excel 帶 data descriptor 的 xlsx）
  if (entries.size === 0) {
    let eocd = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
      if (view.getUint32(i, true) === 0x06054b50) {
        eocd = i;
        break;
      }
    }
    if (eocd !== -1) {
      const cdOffset = view.getUint32(eocd + 16, true);
      const totalEntries = view.getUint16(eocd + 10, true);
      let pos = cdOffset;
      for (let i = 0; i < totalEntries && pos + 46 <= bytes.length; i++) {
        if (view.getUint32(pos, true) !== 0x02014b50) break;
        const method = view.getUint16(pos + 10, true);
        const compSize = view.getUint32(pos + 20, true);
        const nameLen = view.getUint16(pos + 28, true);
        const extraLen = view.getUint16(pos + 30, true);
        const commentLen = view.getUint16(pos + 32, true);
        const localHeaderOffset = view.getUint32(pos + 42, true);
        const name = decoder.decode(bytes.subarray(pos + 46, pos + 46 + nameLen));

        const lNameLen = view.getUint16(localHeaderOffset + 26, true);
        const lExtraLen = view.getUint16(localHeaderOffset + 28, true);
        const dataStart = localHeaderOffset + 30 + lNameLen + lExtraLen;
        entries.set(name, { method, rawSlice: bytes.subarray(dataStart, dataStart + compSize) });
        pos += 46 + nameLen + extraLen + commentLen;
      }
    }
  }

  const readEntryText = async (entryName) => {
    const entry = entries.get(entryName);
    if (!entry) return '';
    if (entry.method === 0) return decoder.decode(entry.rawSlice);
    if (entry.method === 8 && typeof DecompressionStream !== 'undefined') {
      const ds = new DecompressionStream('deflate-raw');
      const stream = new Blob([entry.rawSlice]).stream().pipeThrough(ds);
      return await new Response(stream).text();
    }
    return '';
  };

  return { readEntryText, has: (n) => entries.has(n) };
}

export async function parseXlsxRosterFile(arrayBuffer) {
  const zip = await readZipEntries(arrayBuffer);
  if (!zip.has('xl/worksheets/sheet1.xml')) {
    throw new Error('無法讀取工作表內容，請確認為標準 .xlsx 格式或改存為 .csv');
  }

  const sharedXml = await zip.readEntryText('xl/sharedStrings.xml');
  const sharedStrings = [];
  if (sharedXml) {
    const doc = new DOMParser().parseFromString(sharedXml, 'application/xml');
    doc.querySelectorAll('si').forEach((si) => {
      const tNodes = si.querySelectorAll('t');
      const combined = Array.from(tNodes).map((n) => n.textContent || '').join('');
      sharedStrings.push(combined);
    });
  }

  const sheetXml = await zip.readEntryText('xl/worksheets/sheet1.xml');
  const sheetDoc = new DOMParser().parseFromString(sheetXml, 'application/xml');
  const lines = [];

  sheetDoc.querySelectorAll('sheetData > row').forEach((row) => {
    const cells = [];
    row.querySelectorAll('c').forEach((c) => {
      const type = c.getAttribute('t');
      if (type === 's') {
        const idx = parseInt(c.querySelector('v')?.textContent || '-1', 10);
        cells.push(idx >= 0 ? sharedStrings[idx] || '' : '');
      } else if (type === 'inlineStr') {
        cells.push(c.querySelector('is t')?.textContent || '');
      } else {
        cells.push(c.querySelector('v')?.textContent || '');
      }
    });
    if (cells.length >= 2) {
      lines.push(`${cells[0]},${cells[1]}`);
    }
  });

  return parseRosterText(lines.join('\n'));
}
