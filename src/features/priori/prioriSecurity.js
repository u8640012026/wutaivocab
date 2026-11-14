import { supabase } from '../../services/supabase';
import { formatStudentId, pad2 } from '../../utils/studentIdHelper';

const TEACHER_PASSWORD_SALT = 'wutai_priori_salt_2026:';
const TEACHER_PASSWORD_DIGEST =
  '4fc4bb3b6f9a9f0b9e5ebf353eb487440be0682297f853f37b674844301125ea';

const ROSTER_LOCAL_KEY = 'wutai_priori_roster_enc_v1';
const ROSTER_CLOUD_DEVICE_ID = 'priori_school_roster_v1';
const ROSTER_CLOUD_MODE = 'priori-roster';
const ROSTER_CLOUD_WEEK = 0;

/**
 * 純 JS SHA-256（確保在非 HTTPS 區域網路或任何瀏覽器環境下皆能正常計算雜湊）
 */
function sha256HexSync(str) {
  const bytes = new TextEncoder().encode(str);
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i += 1) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((n) => n.toString(16).padStart(8, '0'))
    .join('');
}

/**
 * 驗證教師後台密碼（不在前端程式碼保留明文密碼）
 */
export function verifyPrioriTeacherPassword(input) {
  if (typeof input !== 'string') return false;
  return sha256HexSync(`${TEACHER_PASSWORD_SALT}${input.trim()}`) === TEACHER_PASSWORD_DIGEST;
}

/**
 * 姓名中間字去識別化遮罩：王小明 → 王O明、林小 → 林O、歐陽修明 → 歐OO明
 */
export function maskStudentName(rawName) {
  const chars = Array.from(String(rawName || '').trim());
  if (chars.length <= 1) return chars.join('');
  if (chars.length === 2) return `${chars[0]}O`;
  return `${chars[0]}${'O'.repeat(chars.length - 2)}${chars[chars.length - 1]}`;
}

function normalizeGradeDigit(raw) {
  const s = String(raw || '').trim();
  const zhMap = { 一: '1', 二: '2', 三: '3', 四: '4', 五: '5', 六: '6' };
  if (zhMap[s]) return zhMap[s];
  const digits = s.replace(/\D/g, '');
  if (!digits) return '';
  return String(parseInt(digits, 10));
}

function normalizeClassDigit(raw) {
  const s = String(raw || '').trim();
  const clsMap = { 甲: '1', 甲班: '1', 霧臺: '1', 乙: '2', 乙班: '2', 勵古: '2', 丙: '3', 丙班: '3' };
  if (clsMap[s]) return clsMap[s];
  for (const [k, v] of Object.entries(clsMap)) {
    if (s.includes(k)) return v;
  }
  const digits = s.replace(/\D/g, '');
  if (!digits) return '1';
  return String(parseInt(digits, 10));
}

/**
 * 解析教師貼上的全校名冊（支援 classqna roster.json 格式、CSV 或 Excel 複製貼上）
 */
export function parseRosterInput(rawText, { applyMask = true } = {}) {
  const text = String(rawText || '').trim();
  if (!text) return { entries: [], invalidCount: 0 };

  const entries = [];
  let invalidCount = 0;

  const pushNormalized = (gRaw, cRaw, nRaw, nameRaw) => {
    const grade = normalizeGradeDigit(gRaw);
    const classNum = normalizeClassDigit(cRaw);
    const seatNum = parseInt(String(nRaw || '').replace(/\D/g, ''), 10);
    const cleanName = String(nameRaw || '').trim();
    if (!grade || !seatNum || seatNum < 1 || seatNum > 99 || !cleanName) {
      invalidCount += 1;
      return;
    }
    const displayName = applyMask ? maskStudentName(cleanName) : cleanName;
    entries.push({
      studentKey: formatStudentId(pad2(grade), pad2(classNum), pad2(seatNum)),
      grade,
      classNum,
      seat: String(seatNum),
      name: displayName,
    });
  };

  if (text.startsWith('[') || text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.students)
        ? parsed.students
        : [];
      for (const item of list) {
        if (!item || typeof item !== 'object') {
          invalidCount += 1;
          continue;
        }
        pushNormalized(
          item.grade ?? item.studentGrade,
          item.class ?? item.classNum ?? item.class_name ?? '1',
          item.number ?? item.seat ?? item.seat_number,
          item.name ?? item.studentName
        );
      }
      return { entries: dedupeRoster(entries), invalidCount };
    } catch {
      // 若非合法 JSON 繼續以表格行解析
    }
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    // 略過常見表頭
    if (/^(年級|grade|學生|姓名|座號|class)/i.test(line)) continue;
    const cols = line.split(/[\t,，]+/).map((c) => c.trim()).filter(Boolean);
    if (cols.length >= 4) {
      pushNormalized(cols[0], cols[1], cols[2], cols[3]);
    } else if (cols.length === 3) {
      // 例如：三年甲班, 5, 王小明  或  3, 5, 王小明（預設 1 班）
      const m = cols[0].match(/([一二三四五六1-6])\s*年?\s*([甲乙丙1-3])/);
      if (m) {
        pushNormalized(m[1], m[2], cols[1], cols[2]);
      } else {
        pushNormalized(cols[0], '1', cols[1], cols[2]);
      }
    } else if (cols.length === 2 && /^\d{5,6}$/.test(cols[0])) {
      // 5~6 碼學號（如 030105 / 30105）, 姓名
      const padded = cols[0].padStart(6, '0');
      pushNormalized(padded.slice(0, 2), padded.slice(2, 4), padded.slice(4, 6), cols[1]);
    } else {
      invalidCount += 1;
    }
  }

  return { entries: dedupeRoster(entries), invalidCount };
}

function dedupeRoster(entries) {
  const map = new Map();
  for (const entry of entries) {
    map.set(entry.studentKey, entry);
  }
  return Array.from(map.values()).sort((a, b) => a.studentKey.localeCompare(b.studentKey));
}

function toBase64(uint8Arr) {
  let bin = '';
  for (let i = 0; i < uint8Arr.length; i += 1) bin += String.fromCharCode(uint8Arr[i]);
  return btoa(bin);
}

function fromBase64(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveAesKey(passphrase, saltBytes) {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('目前瀏覽環境不支援 Web Crypto 加密（請使用 HTTPS 或本機 localhost）');
  }
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 使用前端 PBKDF2 + AES-256-GCM 加密全校名冊
 */
export async function encryptRosterEntries(entries, passphrase) {
  const cleanPass = String(passphrase || '').trim();
  if (cleanPass.length < 4) {
    throw new Error('請輸入至少 4 個字元的名冊加密暗號');
  }
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const aesKey = await deriveAesKey(cleanPass, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify({ entries }));
  const cipherBuf = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    plaintext
  );
  return {
    v: 1,
    alg: 'PBKDF2-AES-GCM',
    count: entries.length,
    updatedAt: new Date().toISOString(),
    salt: toBase64(salt),
    iv: toBase64(iv),
    ct: toBase64(new Uint8Array(cipherBuf)),
  };
}

/**
 * 解密加密名冊封包
 */
export async function decryptRosterEnvelope(envelope, passphrase) {
  if (!envelope?.ct || !envelope?.salt || !envelope?.iv) {
    throw new Error('名冊密文格式無效');
  }
  const cleanPass = String(passphrase || '').trim();
  if (!cleanPass) throw new Error('請輸入名冊解密暗號');

  try {
    const aesKey = await deriveAesKey(cleanPass, fromBase64(envelope.salt));
    const plainBuf = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(envelope.iv) },
      aesKey,
      fromBase64(envelope.ct)
    );
    const parsed = JSON.parse(new TextDecoder().decode(plainBuf));
    return Array.isArray(parsed?.entries) ? parsed.entries : [];
  } catch {
    throw new Error('名冊解密失敗：暗號不正確或密文已損毀');
  }
}

/**
 * 讀取本機與雲端的加密名冊封包（僅讀取密文，不含明文個資）
 */
export async function loadEncryptedRosterEnvelope() {
  let localEnv = null;
  try {
    const raw = localStorage.getItem(ROSTER_LOCAL_KEY);
    if (raw) localEnv = JSON.parse(raw);
  } catch {}

  if (typeof window !== 'undefined' && window.__CI__) {
    return { envelope: localEnv, cloudError: '' };
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('book, created_at')
      .eq('device_id', ROSTER_CLOUD_DEVICE_ID)
      .eq('mode', ROSTER_CLOUD_MODE)
      .eq('week', ROSTER_CLOUD_WEEK)
      .maybeSingle();

    if (error) {
      return { envelope: localEnv, cloudError: error.message };
    }
    if (data?.book) {
      const cloudEnv = JSON.parse(data.book);
      const localTs = new Date(localEnv?.updatedAt || 0).getTime();
      const cloudTs = new Date(cloudEnv?.updatedAt || data.created_at || 0).getTime();
      if (!localEnv || cloudTs >= localTs) {
        try {
          localStorage.setItem(ROSTER_LOCAL_KEY, JSON.stringify(cloudEnv));
        } catch {}
        return { envelope: cloudEnv, cloudError: '' };
      }
    }
  } catch (err) {
    return { envelope: localEnv, cloudError: err?.message || '雲端讀取加密名冊失敗' };
  }

  return { envelope: localEnv, cloudError: '' };
}

/**
 * 將加密後之名冊封包保存於本機並同步至 Supabase 隔離通道（不含任何明文）
 */
export async function saveEncryptedRosterEnvelope(envelope) {
  try {
    localStorage.setItem(ROSTER_LOCAL_KEY, JSON.stringify(envelope));
  } catch {}

  if (typeof window !== 'undefined' && window.__CI__) {
    return { ok: true };
  }

  try {
    const serialized = JSON.stringify(envelope);
    const { data: existing, error: selErr } = await supabase
      .from('leaderboard')
      .select('id')
      .eq('device_id', ROSTER_CLOUD_DEVICE_ID)
      .eq('mode', ROSTER_CLOUD_MODE)
      .eq('week', ROSTER_CLOUD_WEEK)
      .maybeSingle();

    if (selErr) return { ok: false, error: selErr.message };

    if (existing?.id) {
      const { error: updErr } = await supabase
        .from('leaderboard')
        .update({
          name: 'PrioriRoster',
          book: serialized,
          score: Number(envelope.count) || 0,
          time: 1,
          created_at: envelope.updatedAt,
        })
        .eq('id', existing.id);
      if (updErr) return { ok: false, error: updErr.message };
    } else {
      const { error: insErr } = await supabase.from('leaderboard').insert([
        {
          device_id: ROSTER_CLOUD_DEVICE_ID,
          name: 'PrioriRoster',
          mode: ROSTER_CLOUD_MODE,
          book: serialized,
          score: Number(envelope.count) || 0,
          time: 1,
          week: ROSTER_CLOUD_WEEK,
        },
      ]);
      if (insErr) return { ok: false, error: insErr.message };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || '雲端同步加密名冊失敗' };
  }
}
