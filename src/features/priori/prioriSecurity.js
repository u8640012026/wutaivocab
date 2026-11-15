import { supabase } from '../../services/supabase';
import { formatStudentId, pad2 } from '../../utils/studentIdHelper';

const ROSTER_LOCAL_KEY = 'wutai_priori_roster_enc_v1';
export const TEACHER_SESSION_STORAGE_KEY = 'wutai_priori_teacher_session_v1';
const LEGACY_AUTH_SESSION_KEY = 'wutai_priori_teacher_authed';

export function isPrioriSchemaPendingError(err) {
  const code = String(err?.code || '');
  const msg = String(err?.message || '').toLowerCase();
  return (
    code === 'PGRST202' ||
    code === '42883' ||
    msg.includes('could not find the function') ||
    msg.includes('priori_teacher_') ||
    msg.includes('priori_student_')
  );
}

export function isPrioriUnauthorizedError(err) {
  const code = String(err?.code || '');
  const msg = String(err?.message || '').toLowerCase();
  return code === '42501' || msg.includes('unauthorized') || msg.includes('forbidden');
}

export function getPrioriTeacherSession() {
  try {
    sessionStorage.removeItem(LEGACY_AUTH_SESSION_KEY);
    const raw = sessionStorage.getItem(TEACHER_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.schemaPendingOnly) return parsed;
    if (!parsed.token || !parsed.expiresAt) return null;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      sessionStorage.removeItem(TEACHER_SESSION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function savePrioriTeacherSession(session) {
  try {
    sessionStorage.removeItem(LEGACY_AUTH_SESSION_KEY);
    if (session) {
      sessionStorage.setItem(TEACHER_SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(TEACHER_SESSION_STORAGE_KEY);
    }
  } catch {}
}

export function clearPrioriTeacherSession() {
  savePrioriTeacherSession(null);
}

/**
 * 透過 Supabase SECURITY DEFINER RPC 在伺服器端以 bcrypt 驗證教師身分並核發 12 小時不透明工作階段 Token
 * （前端不包含任何明文或雜湊教師密碼）
 */
export async function loginPrioriTeacherServer(password) {
  const clean = typeof password === 'string' ? password.trim() : '';
  if (!clean) {
    return { ok: false, error: '請輸入教師密碼' };
  }

  try {
    const { data, error } = await supabase.rpc('priori_teacher_login', {
      p_password: clean,
    });

    if (error) {
      if (isPrioriSchemaPendingError(error)) {
        return {
          ok: false,
          schemaPending: true,
          error:
            'Supabase 尚未執行 supabase_priori_security.sql 權限隔離腳本，無法從伺服器驗證教師身分（已移除前端離線預設密碼）。',
        };
      }
      return { ok: false, error: error.message || '伺服器驗證失敗，請稍後再試。' };
    }

    if (data?.authorized && data?.token) {
      const session = {
        token: data.token,
        teacherId: data.teacher_id || 'admin',
        displayName: data.display_name || '授權教師',
        allowedClasses: Array.isArray(data.allowed_classes) ? data.allowed_classes : ['*'],
        schemaPendingOnly: false,
        expiresAt: data.expires_at || new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      };
      savePrioriTeacherSession(session);
      return { ok: true, session, schemaPending: false };
    }

    return { ok: false, error: '教師密碼錯誤，請再試一次。' };
  } catch (err) {
    return { ok: false, error: err?.message || '教師登入連線失敗' };
  }
}

export async function logoutPrioriTeacherServer(token) {
  clearPrioriTeacherSession();
  if (!token) return;
  try {
    await supabase.rpc('priori_teacher_logout', { p_token: token });
  } catch {}
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

export function resolveRosterScopeKey(allowedClasses = ['*']) {
  if (!Array.isArray(allowedClasses) || allowedClasses.includes('*')) {
    return 'priori_school_roster_v1';
  }
  const first = String(allowedClasses[0] || '').trim();
  return /^\d+-\d+$/.test(first) ? `class:${first}` : 'priori_school_roster_v1';
}

function getScopedRosterLocalKey(scopeKey) {
  return scopeKey === 'priori_school_roster_v1'
    ? ROSTER_LOCAL_KEY
    : `${ROSTER_LOCAL_KEY}_${scopeKey}`;
}

/**
 * 讀取本機與雲端的加密名冊封包（透過伺服器驗證教師工作階段 RPC 依班級權限存取 `priori_rosters` 隔離表）
 */
export async function loadEncryptedRosterEnvelope(
  teacherToken = '',
  allowedClasses = ['*']
) {
  const scopeKey = resolveRosterScopeKey(allowedClasses);
  const localStorageKey = getScopedRosterLocalKey(scopeKey);
  let localEnv = null;
  try {
    const raw = localStorage.getItem(localStorageKey);
    if (raw) localEnv = JSON.parse(raw);
  } catch {}

  if (typeof window !== 'undefined' && window.__CI__) {
    return { envelope: localEnv, cloudError: '', scopeKey };
  }

  const activeToken = teacherToken || getPrioriTeacherSession()?.token || '';
  if (!activeToken) {
    return { envelope: localEnv, cloudError: '', scopeKey };
  }

  try {
    const { data, error } = await supabase.rpc('priori_teacher_get_roster', {
      p_token: activeToken,
      p_roster_key: scopeKey,
    });

    if (error) {
      if (isPrioriSchemaPendingError(error)) {
        return {
          envelope: localEnv,
          cloudError:
            '尚未於 Supabase 執行 supabase_priori_security.sql 權限隔離腳本，目前僅讀取本機名冊密文。',
          schemaPending: true,
          scopeKey,
        };
      }
      return {
        envelope: localEnv,
        cloudError: error.message,
        unauthorized: isPrioriUnauthorizedError(error),
        scopeKey,
      };
    }

    if (data?.envelope) {
      const cloudEnv = data.envelope;
      const localTs = new Date(localEnv?.updatedAt || 0).getTime();
      const cloudTs = new Date(cloudEnv?.updatedAt || data.updated_at || 0).getTime();
      if (!localEnv || cloudTs >= localTs) {
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(cloudEnv));
        } catch {}
        return { envelope: cloudEnv, cloudError: '', scopeKey };
      }
    }
  } catch (err) {
    return {
      envelope: localEnv,
      cloudError: err?.message || '雲端讀取加密名冊失敗',
      scopeKey,
    };
  }

  return { envelope: localEnv, cloudError: '', scopeKey };
}

/**
 * 將加密後之名冊封包保存於本機並透過授權 RPC 同步至 `priori_rosters` 隔離資料表（不含任何明文）
 */
export async function saveEncryptedRosterEnvelope(
  envelope,
  teacherToken = '',
  allowedClasses = ['*']
) {
  const scopeKey = resolveRosterScopeKey(allowedClasses);
  const localStorageKey = getScopedRosterLocalKey(scopeKey);
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(envelope));
  } catch {}

  if (typeof window !== 'undefined' && window.__CI__) {
    return { ok: true, scopeKey };
  }

  const activeToken = teacherToken || getPrioriTeacherSession()?.token || '';
  if (!activeToken) {
    return {
      ok: false,
      scopeKey,
      error: '缺乏有效教師伺服器憑證（或尚未套用 supabase_priori_security.sql），已僅加密存於本機。',
    };
  }

  try {
    const { data, error } = await supabase.rpc('priori_teacher_save_roster', {
      p_token: activeToken,
      p_envelope: envelope,
      p_entry_count: Number(envelope.count) || 0,
      p_roster_key: scopeKey,
    });

    if (error) {
      if (isPrioriSchemaPendingError(error)) {
        return {
          ok: false,
          schemaPending: true,
          scopeKey,
          error: '尚未於 Supabase 執行 supabase_priori_security.sql，名冊僅暫存本機加密區。',
        };
      }
      return { ok: false, error: error.message, scopeKey };
    }
    return { ok: Boolean(data?.ok ?? true), scopeKey };
  } catch (err) {
    return { ok: false, error: err?.message || '雲端同步加密名冊失敗', scopeKey };
  }
}

/**
 * 教師讀取授權班級學生之裝置綁定／待啟用狀態（不含雜湊或明文啟用碼）
 */
export async function fetchPrioriStudentBindingsServer(teacherToken, grade = null, classNum = null) {
  const activeToken = teacherToken || getPrioriTeacherSession()?.token || '';
  if (!activeToken) {
    return { ok: false, bindings: [], error: '缺乏有效教師伺服器憑證' };
  }
  try {
    const { data, error } = await supabase.rpc('priori_teacher_list_bindings', {
      p_token: activeToken,
      p_grade: grade && grade !== 'demo' ? String(grade) : null,
      p_class_num: classNum && classNum !== 'all' && classNum !== 'demo' ? String(classNum) : null,
    });
    if (error) {
      return {
        ok: false,
        bindings: [],
        unauthorized: isPrioriUnauthorizedError(error),
        schemaPending: isPrioriSchemaPendingError(error),
        error: error.message || '讀取裝置綁定狀態失敗',
      };
    }
    return { ok: true, bindings: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { ok: false, bindings: [], error: err?.message || '讀取裝置綁定狀態連線失敗' };
  }
}

/**
 * 教師為單一尚未綁定／待啟用座號發放一次性 6 碼啟用碼
 */
export async function issuePrioriActivationCodeServer(teacherToken, studentKey) {
  const activeToken = teacherToken || getPrioriTeacherSession()?.token || '';
  const cleanKey = String(studentKey || '').trim();
  if (!activeToken) {
    return { ok: false, error: '缺乏有效教師伺服器憑證' };
  }
  if (!/^\d{6}$/.test(cleanKey) || cleanKey === '999999') {
    return { ok: false, error: '無效的 6 碼座號' };
  }
  try {
    const { data, error } = await supabase.rpc('priori_teacher_issue_activation_code', {
      p_token: activeToken,
      p_student_key: cleanKey,
    });
    if (error) {
      return {
        ok: false,
        unauthorized: isPrioriUnauthorizedError(error),
        schemaPending: isPrioriSchemaPendingError(error),
        error: error.message || '產生啟用碼失敗',
      };
    }
    return {
      ok: Boolean(data?.ok),
      reason: data?.reason || '',
      studentKey: data?.student_key || cleanKey,
      activationCode: data?.activation_code || '',
      expiresAt: data?.expires_at || null,
      error: data?.reason === 'already_bound' ? '該座號已綁定裝置；若學生忘記密碼請改用「重設並發啟用碼」。' : '',
    };
  } catch (err) {
    return { ok: false, error: err?.message || '產生啟用碼連線失敗' };
  }
}

/**
 * 教師為整班尚未綁定學生批量產生一次性 6 碼啟用碼
 */
export async function issuePrioriClassActivationCodesServer(
  teacherToken,
  grade,
  classNum,
  reissueExisting = false
) {
  const activeToken = teacherToken || getPrioriTeacherSession()?.token || '';
  if (!activeToken) {
    return { ok: false, items: [], error: '缺乏有效教師伺服器憑證' };
  }
  try {
    const { data, error } = await supabase.rpc('priori_teacher_issue_class_activation_codes', {
      p_token: activeToken,
      p_grade: String(grade || ''),
      p_class_num: String(classNum || ''),
      p_reissue_existing: Boolean(reissueExisting),
    });
    if (error) {
      return {
        ok: false,
        items: [],
        unauthorized: isPrioriUnauthorizedError(error),
        schemaPending: isPrioriSchemaPendingError(error),
        error: error.message || '整班發放啟用碼失敗',
      };
    }
    return { ok: true, items: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { ok: false, items: [], error: err?.message || '整班發放啟用碼連線失敗' };
  }
}

/**
 * 教師為忘記 4 碼換機密碼或更換新 iPad 的授權班級學生重設裝置綁定並換發新啟用碼（不刪除作答紀錄）
 */
export async function resetPrioriStudentBindingServer(teacherToken, studentKey) {
  const activeToken = teacherToken || getPrioriTeacherSession()?.token || '';
  const cleanKey = String(studentKey || '').trim();
  if (!activeToken) {
    return { ok: false, error: '缺乏有效教師伺服器憑證' };
  }
  if (!/^\d{6}$/.test(cleanKey) || cleanKey === '999999') {
    return { ok: false, error: '無效的 6 碼座號' };
  }

  try {
    const { data, error } = await supabase.rpc('priori_teacher_reset_student_binding', {
      p_token: activeToken,
      p_student_key: cleanKey,
    });
    if (error) {
      return {
        ok: false,
        unauthorized: isPrioriUnauthorizedError(error),
        schemaPending: isPrioriSchemaPendingError(error),
        error: error.message || '重設學生裝置綁定失敗',
      };
    }
    return {
      ok: Boolean(data?.ok ?? true),
      studentKey: data?.student_key || cleanKey,
      activationCode: data?.activation_code || '',
      expiresAt: data?.expires_at || null,
    };
  } catch (err) {
    return { ok: false, error: err?.message || '重設學生裝置綁定連線失敗' };
  }
}
