import assert from 'node:assert/strict';
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

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
      const resolved = execSync('command -v google-chrome || command -v chromium || command -v chromium-browser || true', {
        encoding: 'utf8',
      }).trim();
      if (resolved && fs.existsSync(resolved)) return resolved;
    } catch {}
  }
  throw new Error(`Chrome binary not found. Checked: ${candidates.join(', ')}`);
}

const CHROME_PATH = findChromePath();

const PREVIEW_PORT = 4199;
const CDP_PORT = 9269;
const BASE_URL = `http://127.0.0.1:${PREVIEW_PORT}`;
const SCREENSHOT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'priori-e2e-shots-'));

// 114 Math G3 official answers (for verifying wrong vs right during sinking drill)
const MATH_114_OFFICIAL = [
  3, 1, 2, 0, 0,
  2, 3, 3, 1, 1,
  2, 3, 2, 2, 3,
  0, 3, 2, 1, 1,
  0, 1, 0, 3, 2,
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForHttp(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.exceptions = [];
    this.consoleErrors = [];
    this.mockRows = [];
    this.prioriRecords = [];
    this.prioriRosters = new Map();
    this.studentBindings = new Map();
    this.studentSessions = new Map();
    this.teacherSessions = new Map();
    this.mockRequests = [];
    this.nextRowSeq = 1;
    this.blockCloudReads = false;
  }
  handleMockSupabase(req) {
    const rawUrl = req.url || '';
    const method = req.method || 'GET';
    const accept = req.headers?.Accept || req.headers?.accept || '';
    const wantsSingle = accept.includes('vnd.pgrst.object+json');
    let parsedUrl;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return { status: 200, body: wantsSingle ? 'null' : '[]' };
    }

    let payload = null;
    try {
      payload = req.postData ? JSON.parse(req.postData) : null;
    } catch {}

    // Direct REST table access to PRIORI isolated tables MUST be blocked by RLS
    if (
      parsedUrl.pathname.includes('/rest/v1/priori_records') ||
      parsedUrl.pathname.includes('/rest/v1/priori_rosters') ||
      parsedUrl.pathname.includes('/rest/v1/priori_student_bindings') ||
      parsedUrl.pathname.includes('/rest/v1/priori_student_sessions') ||
      parsedUrl.pathname.includes('/rest/v1/priori_teacher_auth') ||
      parsedUrl.pathname.includes('/rest/v1/priori_teacher_sessions') ||
      parsedUrl.pathname.includes('/rest/v1/priori_legacy_leaderboard_backup')
    ) {
      return { status: 401, body: JSON.stringify({ code: '42501', message: 'permission denied by RLS' }) };
    }

    // Scoped SECURITY DEFINER RPC simulation
    if (parsedUrl.pathname.includes('/rest/v1/rpc/')) {
      const rpcName = parsedUrl.pathname.split('/rest/v1/rpc/')[1] || '';

      if (rpcName === 'priori_teacher_login') {
        const pw = String(payload?.p_password || '').trim();
        if (pw === 'ci-mock-admin-pw' || pw === 'ci-mock-class31-pw') {
          const isClass31 = pw === 'ci-mock-class31-pw';
          const allowedClasses = isClass31 ? ['3-1'] : ['*'];
          const teacherId = isClass31 ? 'teacher_301' : 'admin';
          const displayName = isClass31 ? '三年甲班導師' : '霧臺國小管理教師';
          const token = `mock-teacher-token-${this.nextRowSeq++}-${'a'.repeat(32)}`;
          const expiresAt = new Date(Date.now() + 12 * 3600 * 1000).toISOString();
          this.teacherSessions.set(token, {
            teacherId,
            allowedClasses,
            expiresAt,
          });
          return {
            status: 200,
            body: JSON.stringify({
              authorized: true,
              token,
              teacher_id: teacherId,
              display_name: displayName,
              allowed_classes: allowedClasses,
              expires_at: expiresAt,
            }),
          };
        }
        return { status: 200, body: JSON.stringify({ authorized: false }) };
      }

      if (rpcName === 'priori_teacher_logout') {
        if (payload?.p_token) this.teacherSessions.delete(payload.p_token);
        return { status: 200, body: JSON.stringify({ ok: true }) };
      }

      if (rpcName === 'priori_teacher_list_records') {
        const sess = this.teacherSessions.get(payload?.p_token || '');
        if (!sess) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Unauthorized teacher session' }) };
        }
        const reqG = payload?.p_grade ? String(parseInt(payload.p_grade, 10) || payload.p_grade) : null;
        const reqC = payload?.p_class_num ? String(parseInt(payload.p_class_num, 10) || payload.p_class_num) : null;
        if (!sess.allowedClasses.includes('*') && (reqG || reqC)) {
          const scopeOk = sess.allowedClasses.some((item) => {
            const [ag, ac] = String(item).split('-');
            return (!reqG || String(parseInt(ag, 10)) === reqG) && (!reqC || String(parseInt(ac, 10)) === reqC);
          });
          if (!scopeOk) {
            return { status: 401, body: JSON.stringify({ code: '42501', message: 'Forbidden: requested class outside teacher scope' }) };
          }
        }
        const hits = this.prioriRecords.filter((r) => {
          if (payload?.p_paper_id && r.paper_id !== payload.p_paper_id) return false;
          if (!sess.allowedClasses.includes('*')) {
            const cKey = `${parseInt(r.grade, 10)}-${parseInt(r.class_num, 10)}`;
            if (!sess.allowedClasses.includes(cKey)) return false;
          }
          if (reqG && String(parseInt(r.grade, 10)) !== reqG) return false;
          if (reqC && String(parseInt(r.class_num, 10)) !== reqC) return false;
          return true;
        });
        return { status: 200, body: JSON.stringify(hits) };
      }

      if (rpcName === 'priori_teacher_get_roster') {
        const sess = this.teacherSessions.get(payload?.p_token || '');
        if (!sess) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Unauthorized teacher session' }) };
        }
        const scopeKey = String(payload?.p_roster_key || 'priori_school_roster_v1').trim();
        if (scopeKey === 'priori_school_roster_v1' && !sess.allowedClasses.includes('*')) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Forbidden: whole-school roster requires * scope' }) };
        }
        if (scopeKey.startsWith('class:')) {
          const cls = scopeKey.slice(6);
          if (!sess.allowedClasses.includes('*') && !sess.allowedClasses.includes(cls)) {
            return { status: 401, body: JSON.stringify({ code: '42501', message: 'Forbidden: class roster outside scope' }) };
          }
        }
        const row = this.prioriRosters.get(scopeKey);
        return {
          status: 200,
          body: JSON.stringify(
            row || { envelope: null, updated_at: null, roster_key: scopeKey }
          ),
        };
      }

      if (rpcName === 'priori_teacher_save_roster') {
        const sess = this.teacherSessions.get(payload?.p_token || '');
        const scopeKey = String(payload?.p_roster_key || 'priori_school_roster_v1').trim();
        const scopeOk =
          sess &&
          (sess.allowedClasses.includes('*') ||
            (scopeKey.startsWith('class:') && sess.allowedClasses.includes(scopeKey.slice(6))));
        if (!scopeOk) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Unauthorized teacher session' }) };
        }
        const now = new Date().toISOString();
        this.prioriRosters.set(scopeKey, {
          envelope: payload?.p_envelope,
          entry_count: Number(payload?.p_entry_count) || 0,
          updated_at: now,
          roster_key: scopeKey,
        });
        return { status: 200, body: JSON.stringify({ ok: true, updated_at: now, roster_key: scopeKey }) };
      }

      if (rpcName === 'priori_teacher_list_bindings') {
        const sess = this.teacherSessions.get(payload?.p_token || '');
        if (!sess) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Unauthorized teacher session' }) };
        }
        const headcounts = {
          '1-1': 5, '1-2': 11, '2-1': 6, '2-2': 4, '3-1': 6, '3-2': 9,
          '4-1': 8, '4-2': 11, '5-1': 6, '5-2': 19, '6-1': 6, '6-2': 12,
        };
        const reqG = payload?.p_grade ? String(parseInt(payload.p_grade, 10)) : null;
        const reqC = payload?.p_class_num ? String(parseInt(payload.p_class_num, 10)) : null;
        const items = [];
        for (const [clsKey, maxSeat] of Object.entries(headcounts)) {
          const [g, c] = clsKey.split('-');
          if (!sess.allowedClasses.includes('*') && !sess.allowedClasses.includes(clsKey)) continue;
          if (reqG && g !== reqG) continue;
          if (reqC && c !== reqC) continue;
          for (let s = 1; s <= maxSeat; s += 1) {
            const seatStr = String(s).padStart(2, '0');
            const sk = `${g.padStart(2, '0')}${c.padStart(2, '0')}${seatStr}`;
            const bind = this.studentBindings.get(sk);
            let status = 'unbound';
            if (bind) {
              if (bind.lockedUntil > Date.now()) status = 'locked';
              else if (bind.pin) status = 'bound';
            }
            items.push({
              student_key: sk,
              grade: g,
              class_num: c,
              seat: seatStr,
              status,
              device_count: bind?.deviceSecrets?.size || 0,
              activated_at: bind?.activatedAt || null,
            });
          }
        }
        return { status: 200, body: JSON.stringify(items) };
      }

      if (rpcName === 'priori_teacher_set_student_pin') {
        const sess = this.teacherSessions.get(payload?.p_token || '');
        const sk = String(payload?.p_student_key || '').trim();
        const newPin = String(payload?.p_new_pin || '').trim();
        if (!sess) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Unauthorized teacher session' }) };
        }
        const cls = `${parseInt(sk.slice(0, 2), 10)}-${parseInt(sk.slice(2, 4), 10)}`;
        if (!sess.allowedClasses.includes('*') && !sess.allowedClasses.includes(cls)) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Forbidden: student outside scope' }) };
        }
        if (!/^\d{4}$/.test(newPin)) {
          return { status: 400, body: JSON.stringify({ code: '22023', message: 'PIN must be 4 digits' }) };
        }
        for (const [t, s] of this.studentSessions.entries()) {
          if (s.studentKey === sk) this.studentSessions.delete(t);
        }
        const nowIso = new Date().toISOString();
        this.studentBindings.set(sk, {
          pin: newPin,
          activatedAt: nowIso,
          deviceSecrets: new Set(),
          failCount: 0,
          lockedUntil: 0,
        });
        return { status: 200, body: JSON.stringify({ ok: true, student_key: sk }) };
      }

      if (rpcName === 'priori_teacher_set_class_pins') {
        const sess = this.teacherSessions.get(payload?.p_token || '');
        if (!sess) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Unauthorized teacher session' }) };
        }
        const newPin = String(payload?.p_new_pin || '').trim();
        if (!/^\d{4}$/.test(newPin)) {
          return { status: 400, body: JSON.stringify({ code: '22023', message: 'PIN must be 4 digits' }) };
        }
        const reqGradeRaw = payload?.p_grade ? String(payload.p_grade).trim() : '';
        const reqClassRaw = payload?.p_class_num ? String(payload.p_class_num).trim() : '';
        const reqG = reqGradeRaw && reqGradeRaw !== 'all' ? String(parseInt(reqGradeRaw, 10)) : null;
        const reqC = reqClassRaw && reqClassRaw !== 'all' ? String(parseInt(reqClassRaw, 10)) : null;
        const overwriteExisting = Boolean(payload?.p_overwrite_existing);
        const headcounts = {
          '1-1': 5, '1-2': 11, '2-1': 6, '2-2': 4, '3-1': 6, '3-2': 9,
          '4-1': 8, '4-2': 11, '5-1': 6, '5-2': 19, '6-1': 6, '6-2': 12,
        };
        if (reqG && reqC) {
          const targetCls = `${reqG}-${reqC}`;
          if (!sess.allowedClasses.includes('*') && !sess.allowedClasses.includes(targetCls)) {
            return { status: 401, body: JSON.stringify({ code: '42501', message: 'Forbidden: class outside scope' }) };
          }
        } else if (!sess.allowedClasses.includes('*')) {
          const allowedInGrade = Object.keys(headcounts).some((clsKey) => {
            if (!sess.allowedClasses.includes(clsKey)) return false;
            const [g] = clsKey.split('-');
            return !reqG || g === reqG;
          });
          if (!allowedInGrade) {
            return { status: 401, body: JSON.stringify({ code: '42501', message: 'Forbidden: grade outside scope' }) };
          }
        }
        let updatedCount = 0;
        let skippedCount = 0;
        const nowIso = new Date().toISOString();
        for (const [clsKey, maxSeat] of Object.entries(headcounts)) {
          if (!sess.allowedClasses.includes('*') && !sess.allowedClasses.includes(clsKey)) continue;
          const [g, c] = clsKey.split('-');
          if (reqG && g !== reqG) continue;
          if (reqC && c !== reqC) continue;
          for (let s = 1; s <= maxSeat; s += 1) {
            const seatStr = String(s).padStart(2, '0');
            const sk = `${g.padStart(2, '0')}${c.padStart(2, '0')}${seatStr}`;
            const existing = this.studentBindings.get(sk);
            if (!overwriteExisting && existing?.pin) {
              skippedCount += 1;
              continue;
            }
            for (const [t, st] of this.studentSessions.entries()) {
              if (st.studentKey === sk) this.studentSessions.delete(t);
            }
            this.studentBindings.set(sk, {
              pin: newPin,
              activatedAt: nowIso,
              deviceSecrets: new Set(),
              failCount: 0,
              lockedUntil: 0,
            });
            updatedCount += 1;
          }
        }
        return {
          status: 200,
          body: JSON.stringify({ ok: true, updated_count: updatedCount, skipped_count: skippedCount }),
        };
      }

      if (rpcName === 'priori_student_login_seat') {
        const sk = String(payload?.p_student_key || '').trim();
        const devSecret = String(payload?.p_device_secret || '').trim();
        const pin = payload?.p_transfer_pin ? String(payload.p_transfer_pin).trim() : '';
        if (!/^\d{6}$/.test(sk) || sk === '999999' || devSecret.length < 16) {
          return { status: 400, body: JSON.stringify({ code: '22023', message: 'Invalid student/device credential' }) };
        }
        const headcounts = {
          '1-1': 5, '1-2': 11, '2-1': 6, '2-2': 4, '3-1': 6, '3-2': 9,
          '4-1': 8, '4-2': 11, '5-1': 6, '5-2': 19, '6-1': 6, '6-2': 12,
        };
        const gNum = parseInt(sk.slice(0, 2), 10);
        const cNum = parseInt(sk.slice(2, 4), 10);
        const sNum = parseInt(sk.slice(4, 6), 10);
        const maxSeat = headcounts[`${gNum}-${cNum}`] || 0;
        if (sNum < 1 || sNum > maxSeat) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Unknown or inactive student seat' }) };
        }
        let bind = this.studentBindings.get(sk);
        const expiresAt = new Date(Date.now() + 30 * 86400 * 1000).toISOString();
        const hasRecs = this.prioriRecords.some((r) => r.student_key === sk);
        const issueToken = (status) => {
          const token = `psess_mock_${sk}_${this.nextRowSeq++}_${'s'.repeat(32)}`;
          this.studentSessions.set(token, { studentKey: sk, devSecret, expiresAt });
          return { status: 200, body: JSON.stringify({ authorized: true, status, token, student_key: sk, expires_at: expiresAt }) };
        };
        if (bind && bind.lockedUntil > Date.now()) {
          return {
            status: 200,
            body: JSON.stringify({
              authorized: false,
              status: 'pin_locked',
              has_records: hasRecs,
            }),
          };
        }
        if (!bind || !bind.pin) {
          if (hasRecs) {
            return {
              status: 200,
              body: JSON.stringify({
                authorized: false,
                status: 'needs_teacher_pin',
                has_records: true,
              }),
            };
          }
          if (!pin) {
            return {
              status: 200,
              body: JSON.stringify({
                authorized: false,
                status: 'needs_pin_setup',
                has_records: false,
              }),
            };
          }
          if (!/^\d{4}$/.test(pin)) {
            return {
              status: 200,
              body: JSON.stringify({
                authorized: false,
                status: 'invalid_pin_format',
                has_records: false,
              }),
            };
          }
          bind = {
            pin,
            activatedAt: new Date().toISOString(),
            deviceSecrets: new Set([devSecret]),
            failCount: 0,
            lockedUntil: 0,
          };
          this.studentBindings.set(sk, bind);
          return issueToken('bound_new');
        }
        if (bind.deviceSecrets.has(devSecret)) {
          bind.failCount = 0;
          return issueToken('trusted_device');
        }
        if (!pin) {
          return { status: 200, body: JSON.stringify({ authorized: false, status: 'pin_required', remaining_attempts: Math.max(1, 5 - bind.failCount) }) };
        }
        if (pin !== bind.pin) {
          bind.failCount += 1;
          if (bind.failCount >= 5) {
            bind.lockedUntil = Date.now() + 15 * 60 * 1000;
            return { status: 200, body: JSON.stringify({ authorized: false, status: 'pin_locked', remaining_attempts: 0 }) };
          }
          return { status: 200, body: JSON.stringify({ authorized: false, status: 'invalid_pin', remaining_attempts: 5 - bind.failCount }) };
        }
        bind.deviceSecrets.add(devSecret);
        bind.failCount = 0;
        return issueToken('pin_verified');
      }

      if (rpcName === 'priori_student_logout') {
        if (payload?.p_token) this.studentSessions.delete(payload.p_token);
        return { status: 200, body: JSON.stringify({ ok: true }) };
      }

      if (rpcName === 'priori_student_release_wrong_seat') {
        const sess = this.studentSessions.get(payload?.p_token || '');
        if (!sess) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Unauthorized student session' }) };
        }
        if (this.prioriRecords.some((r) => r.student_key === sess.studentKey)) {
          return { status: 200, body: JSON.stringify({ released: false, reason: 'has_records' }) };
        }
        this.studentBindings.delete(sess.studentKey);
        this.studentSessions.delete(payload.p_token);
        return { status: 200, body: JSON.stringify({ released: true }) };
      }

      if (rpcName === 'priori_student_get_records') {
        const sess = this.studentSessions.get(payload?.p_token || '');
        const reqSk = payload?.p_student_key ? String(payload.p_student_key).trim() : sess?.studentKey;
        if (!sess) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Unauthorized student session' }) };
        }
        if (reqSk !== sess.studentKey) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Forbidden: student session scope mismatch' }) };
        }
        if (this.blockCloudReads) {
          return { status: 200, body: '[]' };
        }
        return {
          status: 200,
          body: JSON.stringify(this.prioriRecords.filter((r) => r.student_key === sess.studentKey)),
        };
      }

      if (rpcName === 'priori_student_upsert_record') {
        const sess = this.studentSessions.get(payload?.p_token || '');
        const sk = String(payload?.p_student_key || '').trim();
        const pid = String(payload?.p_paper_id || '').trim();
        if (!sess) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Unauthorized student session' }) };
        }
        if (sk !== sess.studentKey) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Forbidden: student session scope mismatch' }) };
        }
        if (!/^\d{6}$/.test(sk) || sk === '999999' || !pid) {
          return { status: 400, body: JSON.stringify({ code: '22023', message: 'Invalid student record scope' }) };
        }
        const dirGrade = String(parseInt(sk.slice(0, 2), 10));
        const dirClass = String(parseInt(sk.slice(2, 4), 10));
        const dirSeat = sk.slice(4, 6);
        const reqGrade = String(payload?.p_grade ?? dirGrade).trim().replace(/^0+/, '') || dirGrade;
        const reqClass = String(payload?.p_class_num ?? dirClass).trim().replace(/^0+/, '') || dirClass;
        const reqSeat = String(payload?.p_seat ?? dirSeat).trim().replace(/^0+/, '');
        if (reqGrade !== dirGrade || reqClass !== dirClass || (reqSeat && reqSeat !== String(parseInt(dirSeat, 10)))) {
          return { status: 401, body: JSON.stringify({ code: '42501', message: 'Forbidden: grade/class/seat mismatch against student directory' }) };
        }
        const now = new Date().toISOString();
        const recordKey = `priori_${sk}_${pid}`;
        const nextRow = {
          record_key: recordKey,
          student_key: sk,
          paper_id: pid,
          grade: dirGrade,
          class_num: dirClass,
          seat: dirSeat,
          score: Number(payload?.p_score) || 0,
          elapsed_seconds: Number(payload?.p_elapsed) || 0,
          payload: payload?.p_payload,
          updated_at: now,
        };
        const idx = this.prioriRecords.findIndex((r) => r.record_key === recordKey);
        if (idx >= 0) this.prioriRecords[idx] = nextRow;
        else this.prioriRecords.push(nextRow);
        return { status: 200, body: JSON.stringify({ ok: true, record_key: recordKey, updated_at: now }) };
      }

      return { status: 404, body: JSON.stringify({ code: 'PGRST202', message: `Unknown RPC ${rpcName}` }) };
    }

    if (!parsedUrl.pathname.includes('/leaderboard')) {
      return { status: 200, body: wantsSingle ? 'null' : '[]' };
    }

    const sp = parsedUrl.searchParams;
    const matchFilter = (row) => {
      for (const [k, expr] of sp.entries()) {
        if (k === 'select' || k === 'order' || k === 'limit') continue;
        if (expr.startsWith('eq.')) {
          if (String(row[k]) !== expr.slice(3)) return false;
        } else if (expr.startsWith('like.')) {
          const pat = expr.slice(5).replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&').replaceAll('*', '.*').replaceAll('%', '.*');
          if (!new RegExp(`^${pat}$`).test(String(row[k] || ''))) return false;
        }
      }
      return true;
    };

    if (method === 'GET') {
      if (this.blockCloudReads) {
        return { status: 200, body: wantsSingle ? 'null' : '[]' };
      }
      const hits = this.mockRows.filter(matchFilter);
      if (wantsSingle) {
        return { status: 200, body: JSON.stringify(hits[0] || null) };
      }
      return { status: 200, body: JSON.stringify(hits) };
    }

    if (method === 'POST') {
      const items = Array.isArray(payload) ? payload : payload ? [payload] : [];
      const inserted = items.map((item) => ({
        id: `mock-${this.nextRowSeq++}`,
        created_at: item.created_at || new Date().toISOString(),
        ...item,
      }));
      this.mockRows.push(...inserted);
      return { status: 201, body: JSON.stringify(wantsSingle ? inserted[0] : inserted) };
    }

    if (method === 'PATCH') {
      const updated = [];
      for (const row of this.mockRows) {
        if (matchFilter(row)) {
          Object.assign(row, payload || {});
          updated.push(row);
        }
      }
      return { status: 200, body: JSON.stringify(wantsSingle ? (updated[0] || null) : updated) };
    }

    return { status: 200, body: wantsSingle ? 'null' : '[]' };
  }
  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data.toString());
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method === 'Fetch.requestPaused') {
        // Isolate E2E from live Supabase using an in-memory PostgREST mock
        const req = msg.params.request || {};
        const hdrs = req.headers || {};
        const origin = hdrs.Origin || hdrs.origin || '*';
        const requestedHeaders = hdrs['Access-Control-Request-Headers'] || hdrs['access-control-request-headers'];
        const corsHeaders = [
          { name: 'Access-Control-Allow-Origin', value: origin },
          { name: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS' },
          {
            name: 'Access-Control-Allow-Headers',
            value: requestedHeaders || 'apikey, authorization, content-type, accept, prefer, x-client-info, x-supabase-api-version, range',
          },
          { name: 'Content-Type', value: 'application/json' },
        ];
        if (req.method === 'OPTIONS') {
          this.send('Fetch.fulfillRequest', {
            requestId: msg.params.requestId,
            responseCode: 204,
            responseHeaders: corsHeaders,
          }).catch(() => {});
        } else {
          const mockRes = this.handleMockSupabase(req);
          this.mockRequests.push({ method: req.method, url: req.url, status: mockRes.status });
          this.send('Fetch.fulfillRequest', {
            requestId: msg.params.requestId,
            responseCode: mockRes.status,
            responseHeaders: corsHeaders,
            body: Buffer.from(mockRes.body).toString('base64'),
          }).catch(() => {});
        }
      } else if (msg.method === 'Runtime.exceptionThrown') {
        this.exceptions.push(JSON.stringify(msg.params?.exceptionDetails));
      } else if (msg.method === 'Console.messageAdded' && msg.params?.message?.level === 'error') {
        this.consoleErrors.push(msg.params.message.text);
      }
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval failed: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }
  async screenshot(filename) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SCREENSHOT_DIR, filename), Buffer.from(data, 'base64'));
  }
  close() {
    try { this.ws.close(); } catch {}
  }
}

async function run() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'priori-chrome-'));

  const server = spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PREVIEW_PORT), '--strictPort', '--host', '127.0.0.1'],
    { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] }
  );
  let serverLog = '';
  server.stderr?.on('data', (d) => { serverLog += d.toString(); });
  let chrome = null;
  let chromeLog = '';
  let client = null;

  try {
    try {
      await waitForHttp(BASE_URL);
    } catch (err) {
      throw new Error(`${err.message}\nVite stderr: ${serverLog}`);
    }
    const chromeFlags = [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
    ];
    if (process.platform !== 'win32') {
      chromeFlags.push('--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage');
    }

    chrome = spawn(CHROME_PATH, chromeFlags, { stdio: ['ignore', 'ignore', 'pipe'] });
    chrome.stderr?.on('data', (d) => { chromeLog += d.toString(); });

    try {
      await waitForHttp(`http://127.0.0.1:${CDP_PORT}/json/list`);
    } catch (err) {
      throw new Error(`${err.message}\nChrome stderr: ${chromeLog}`);
    }
    const tabs = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
    const pageTab = tabs.find((t) => t.type === 'page') || tabs[0];
    assert.ok(pageTab?.webSocketDebuggerUrl, 'Missing CDP page tab');

    client = new CDP(pageTab.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Console.enable');
    await client.send('Fetch.enable', {
      patterns: [{ urlPattern: '*supabase.co*' }],
    });
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        window.__CI__ = true;
        window.__printCalls = 0;
        window.print = () => { window.__printCalls += 1; };
        window.alert = () => {};
        window.confirm = () => true;
      `,
    });

    // Test A: Portal Entry on iPad Landscape (1024x768)
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await client.send('Page.navigate', { url: BASE_URL });
    await sleep(900);

    const portalResult = await client.eval(`
      (async () => {
        const deadline = Date.now() + 8000;
        let heading = null;
        while (Date.now() < deadline) {
          heading = Array.from(document.querySelectorAll('h3')).find(el => (el.innerText || '').includes('學習扶助練習館'));
          if (heading) break;
          await new Promise(r => setTimeout(r, 150));
        }
        if (!heading) return { ok: false, reason: 'Portal card missing' };
        heading.click();
        const hubDeadline = Date.now() + 4000;
        while (Date.now() < hubDeadline) {
          if ((document.body.innerText || '').includes('霧臺國小・學習扶助自主練習館')) break;
          await new Promise(r => setTimeout(r, 120));
        }
        return {
          ok: (document.body.innerText || '').includes('霧臺國小・學習扶助自主練習館'),
          url: window.location.search,
          bodyHead: (document.body.innerText || '').slice(0, 300),
        };
      })()
    `);
    assert.equal(portalResult?.ok, true, `Portal navigation failed: ${JSON.stringify(portalResult)}; exceptions=${JSON.stringify(client.exceptions)}; console=${JSON.stringify(client.consoleErrors)}`);
    console.log('✓ Test A (Portal -> Priori navigation at 1024x768) passed');

    // Test B: Deep-link /?view=priori Minimalist Hub View + 3-Subject Switching at 1024x768
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori` });
    await sleep(700);
    await client.screenshot('priori_ipad_hub.png');

    const hubCheck = await client.eval(`
      (async () => {
        const txt = document.body.innerText || '';
        const hasTitle = txt.includes('霧臺國小・學習扶助自主練習館');
        const has114Row = txt.includes('114 年') && txt.includes('三年級數學科');
        const has115Row = txt.includes('115 年') && txt.includes('三年級數學科');
        const descOrderOk = txt.indexOf('115 年') >= 0 && txt.indexOf('114 年') > txt.indexOf('115 年');
        const hasUnattemptedText = txt.includes('尚未作答');
        const hasTeacherBadge = txt.includes('教師參考答案');
        const hasGuestHint = txt.includes('訪客作答只留這台 iPad');
        const hasGradePills = txt.includes('三年級') && txt.includes('六年級');
        const hasEmblems = document.querySelectorAll('svg').length >= 2;
        const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;

        // Open 派卷 QR modal, switch to 114 Chinese G3 & verify &entry=qr link
        const qrBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('派卷 QR'));
        qrBtn?.click();
        await new Promise(r => setTimeout(r, 200));
        const qrDialog = document.querySelector('[role="dialog"][aria-label="派卷 QR Code"]');
        const qrSubjSel = document.getElementById('qr-subject-select');
        const qrYearSel = document.getElementById('qr-year-select');
        const qrGradeSel = document.getElementById('qr-grade-select');
        const setSelect = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        if (qrSubjSel && qrYearSel && qrGradeSel) {
          setSelect(qrSubjSel, 'chinese');
          setSelect(qrYearSel, '114');
          setSelect(qrGradeSel, '3');
          await new Promise(r => setTimeout(r, 150));
        }
        const qrHasPaperUrl = (qrDialog?.innerText || '').includes('?view=priori&paper=114-chinese-g3&entry=qr');
        document.querySelector('button[aria-label="關閉 QR Code 視窗"]')?.click();
        await new Promise(r => setTimeout(r, 150));

        // Click compact Printer icon on 114-math-g3 & verify external student print hides answers
        const printBtn = document.querySelector('button[aria-label="列印114 年篩選測驗 三年級數學科學習單"]');
        printBtn?.click();
        await new Promise(r => setTimeout(r, 150));
        const studentPrintDialog = document.querySelector('[role="dialog"][aria-label="選擇列印試卷與版本"]');
        Array.from(studentPrintDialog?.querySelectorAll('button') || []).find(b => (b.innerText || '').trim() === '原卷 A3')?.click();
        const originalLinkDeadline = Date.now() + 3000;
        while (Date.now() < originalLinkDeadline && !studentPrintDialog?.querySelector('a[href$="-student.pdf"]')) {
          await new Promise(r => setTimeout(r, 100));
        }
        const studentOriginalHref = studentPrintDialog?.querySelector('a[href$="-student.pdf"]')?.getAttribute('href');
        const studentOriginalOk = studentOriginalHref === '/assets/priori/original/114-math-g3-student.pdf' && !studentPrintDialog?.querySelector('a[href$="-answer.pdf"]');
        Array.from(studentPrintDialog?.querySelectorAll('button') || []).find(b => (b.innerText || '').trim() === '練習卷 A4')?.click();
        await new Promise(r => setTimeout(r, 100));
        Array.from(studentPrintDialog?.querySelectorAll('button') || []).find(b => (b.innerText || '').includes('確定列印此試卷'))?.click();
        const hubPrintDeadline = Date.now() + 3000;
        while (Date.now() < hubPrintDeadline && (window.__printCalls || 0) < 1) {
          await new Promise(r => setTimeout(r, 100));
        }
        const printSheetText = document.querySelector('[class*="print:block"]')?.textContent || '';
        const studentPrintClean = studentOriginalOk &&
          printSheetText.includes('學生練習卷') &&
          !printSheetText.includes('正解：') &&
          !printSheetText.includes('未作答');

        // Switch to 國語科 tab & verify 114 Chinese card + zero practiced remedial noise
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('國語科'))?.click();
        await new Promise(r => setTimeout(r, 200));
        const chiTxt = document.body.innerText || '';
        const has114Chi = chiTxt.includes('114 年') && chiTxt.includes('三年級國語科');
        const chiNoPrematureRemedial = !chiTxt.includes('再練待加強題');

        // Verify Grade 5 Chinese card
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '五年級')?.click();
        await new Promise(r => setTimeout(r, 150));
        const has114ChiG5 = (document.body.innerText || '').includes('114 年') && (document.body.innerText || '').includes('五年級國語科');

        // Switch to 英語科 tab & verify 114 English G5 & G3 cards
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('英語科'))?.click();
        await new Promise(r => setTimeout(r, 200));
        const has114EngG5 = (document.body.innerText || '').includes('114 年') && (document.body.innerText || '').includes('五年級英語科');
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '三年級')?.click();
        await new Promise(r => setTimeout(r, 150));
        const engTxt = document.body.innerText || '';
        const has114Eng = engTxt.includes('114 年') && engTxt.includes('三年級英語科');
        const engNoPrematureRemedial = !engTxt.includes('再練待加強題');

        // Switch back to 數學科 & verify Grade 4 / Grade 6 cards then restore Grade 3
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('數學科'))?.click();
        await new Promise(r => setTimeout(r, 200));
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '四年級')?.click();
        await new Promise(r => setTimeout(r, 150));
        const has114MathG4 = (document.body.innerText || '').includes('114 年') && (document.body.innerText || '').includes('四年級數學科');
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '六年級')?.click();
        await new Promise(r => setTimeout(r, 150));
        const has114MathG6 = (document.body.innerText || '').includes('114 年') && (document.body.innerText || '').includes('六年級數學科');
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '三年級')?.click();
        await new Promise(r => setTimeout(r, 150));

        return {
          ok: hasTitle && has114Row && has115Row && descOrderOk && hasUnattemptedText && hasTeacherBadge && hasGuestHint && hasGradePills && hasEmblems && !overflow && qrHasPaperUrl && window.__printCalls >= 1 && studentPrintClean && has114Chi && chiNoPrematureRemedial && has114ChiG5 && has114EngG5 && has114Eng && engNoPrematureRemedial && has114MathG4 && has114MathG6,
          hasTitle, has114Row, has115Row, descOrderOk, hasUnattemptedText, hasTeacherBadge, hasGuestHint, hasGradePills, hasEmblems, overflow, qrHasPaperUrl,
          printCalls: window.__printCalls, studentPrintClean, studentOriginalHref, studentOriginalOk, printSheetText: printSheetText.slice(0, 150), has114Chi, chiNoPrematureRemedial, has114ChiG5, has114EngG5, has114Eng, engNoPrematureRemedial, has114MathG4, has114MathG6,
        };
      })()
    `);
    assert.equal(hubCheck?.ok, true, `Hub 3-subject check failed: ${JSON.stringify(hubCheck)}`);
    console.log('✓ Test B (Minimalist Hub 115→108 strips, guest local-only reminder, 派卷 QR 3-axis selector, Print icon) passed');

    // Test B2: QR Entry Confirmation Landing (?view=priori&paper=114-chinese-g3&entry=qr)
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori&paper=114-chinese-g3&entry=qr` });
    await sleep(600);
    const qrConfirmCheck = await client.eval(`
      (async () => {
        const txt = document.body.innerText || '';
        const hasIdentity = txt.includes('目前身分');
        const hasGuestQrNotice = txt.includes('目前為訪客模式：作答只會留在本機');
        const hasTarget = txt.includes('即將進行測驗') && txt.includes('114 年篩選測驗 三年級國語科');
        const enterBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('進入測驗'));
        if (!enterBtn) return { ok: false, hasIdentity, hasGuestQrNotice, hasTarget, reason: 'Missing 進入測驗 button' };
        enterBtn.click();
        await new Promise(r => setTimeout(r, 300));
        const enteredQuiz = document.querySelectorAll('nav[aria-label="題號導覽"] button').length === 25;
        return { ok: hasIdentity && hasGuestQrNotice && hasTarget && enteredQuiz, hasIdentity, hasGuestQrNotice, hasTarget, enteredQuiz };
      })()
    `);
    assert.equal(qrConfirmCheck?.ok, true, `QR confirmation screen check failed: ${JSON.stringify(qrConfirmCheck)}`);
    console.log('✓ Test B2 (派卷 QR &entry=qr confirmation screen + guest local-only warning -> 進入測驗) passed');

    // Test B3: Light iPad Seat-Switch Check + 1-Click Logout
    await client.eval(`
      (() => {
        localStorage.setItem('wutai_priori_last_seat_on_ipad_v1', JSON.stringify({
          studentKey: '030101',
          displayName: '3年1班 01號'
        }));
        localStorage.setItem('wutai_last_student_id', '030102');
      })()
    `);
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori` });
    await sleep(600);
    const seatSwitchCheck = await client.eval(`
      (async () => {
        const deadline = Date.now() + 4000;
        let logoutBtn = null;
        while (Date.now() < deadline) {
          logoutBtn = Array.from(document.querySelectorAll('header button')).find(b => (b.innerText || '').trim() === '登出');
          if (logoutBtn && (document.body.innerText || '').includes('這台裝置上次登入的是「3年1班 01號」')) break;
          await new Promise(r => setTimeout(r, 120));
        }
        const txt = document.body.innerText || '';
        const hasNotice = txt.includes('這台裝置上次登入的是「3年1班 01號」');
        const hasSwitchBtn = txt.includes('點錯了？切換座號');
        if (!logoutBtn) {
          return {
            ok: false,
            hasNotice,
            hasSwitchBtn,
            reason: 'Missing header logout button',
            lastId: localStorage.getItem('wutai_last_student_id'),
            bodyHead: txt.slice(0, 240),
          };
        }
        logoutBtn.click();
        await new Promise(r => setTimeout(r, 250));
        const afterLogoutGuest = (document.body.innerText || '').includes('訪客練習中');
        return { ok: hasNotice && hasSwitchBtn && afterLogoutGuest, hasNotice, hasSwitchBtn, afterLogoutGuest };
      })()
    `);
    assert.equal(seatSwitchCheck?.ok, true, `Seat switch & 1-click logout check failed: ${JSON.stringify(seatSwitchCheck)}`);
    await client.eval(`localStorage.removeItem('wutai_priori_last_seat_on_ipad_v1'); localStorage.removeItem('wutai_last_student_id');`);
    console.log('✓ Test B3 (Lightweight iPad seat-change notice + 1-click logout) passed');

    // Navigate cleanly back to Hub for Test C (114-math-g3)
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori` });
    await sleep(600);

    // Test C: 114-math-g3 Split-Pane Quiz + Scratchpad + TTS + Zoom at 1024x768
    const quizSetup = await client.eval(`
      (async () => {
        const startBtn = Array.from(document.querySelectorAll('button')).find((b) => {
          const t = b.innerText || '';
          if (!t.includes('開始測驗') && !t.includes('再練一次')) return false;
          const rowText = b.closest('div.rounded-2xl')?.innerText || '';
          return rowText.includes('114 年') && rowText.includes('三年級數學科');
        });
        if (!startBtn) return { ok: false, reason: 'No 114-math-g3 開始測驗 button' };
        startBtn.click();
        await new Promise(r => setTimeout(r, 350));

        const pills = Array.from(document.querySelectorAll('nav[aria-label="題號導覽"] button'));
        const article = document.querySelector('article');
        const canvas = document.querySelector('canvas');
        const artRect = article?.getBoundingClientRect();
        const canRect = canvas?.getBoundingClientRect();
        const sideBySide = !!artRect && !!canRect && canRect.left >= artRect.right - 8 && Math.abs(canRect.top - artRect.top) < 160;
        const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;

        // Draw on scratchpad
        if (canvas && canRect) {
          canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: canRect.left + 30, clientY: canRect.top + 30, bubbles: true, pointerId: 1 }));
          canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: canRect.left + 90, clientY: canRect.top + 70, bubbles: true, pointerId: 1 }));
          canvas.dispatchEvent(new PointerEvent('pointerup', { clientX: canRect.left + 90, clientY: canRect.top + 70, bubbles: true, pointerId: 1 }));
          await new Promise(r => setTimeout(r, 120));
        }
        const undoBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('復原'));
        const undoEnabled = !!undoBtn && !undoBtn.disabled;

        // Answer Q1 of 114 Math correctly (index 3: ▽)
        const q1Radios = Array.from(document.querySelectorAll('[role="radio"]'));
        q1Radios[3]?.click();
        await new Promise(r => setTimeout(r, 120));

        // Next to Q2, verify clean scratchpad, then jump back to Q1 to confirm persistence
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('下一題'))?.click();
        await new Promise(r => setTimeout(r, 180));
        const q2UndoBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('復原'));
        const q2ScratchpadBlank = !!q2UndoBtn && q2UndoBtn.disabled;
        document.querySelector('button[aria-label="跳到第 1 題"]')?.click();
        await new Promise(r => setTimeout(r, 180));
        const q1UndoRestoredBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('復原'));
        const q1ScratchpadRestored = !!q1UndoRestoredBtn && !q1UndoRestoredBtn.disabled;

        // Back to Q2, pick WRONG answer (official Q2 is index 1, so pick index 0)
        document.querySelector('button[aria-label="跳到第 2 題"]')?.click();
        await new Promise(r => setTimeout(r, 180));
        document.querySelectorAll('[role="radio"]')[0]?.click();
        await new Promise(r => setTimeout(r, 120));

        // Toggle 輔助朗讀開
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('輔助朗讀'))?.click();
        await new Promise(r => setTimeout(r, 150));
        const hasStemTtsBtn = !!document.querySelector('button[aria-label="朗讀題幹"]');
        const hasOptTtsBtn = !!document.querySelector('button[aria-label="朗讀選項 1"]');

        // Jump to Q7 (has geometric figure q07_fig.webp)
        document.querySelector('button[aria-label="跳到第 7 題"]')?.click();
        await new Promise(r => setTimeout(r, 350));
        const figImg = document.querySelector('img[src*="q07_fig.webp"]');
        const figLoaded = !!figImg && figImg.complete && figImg.naturalWidth > 0;

        // Open Zoom Modal & verify image
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('點擊放大看細節'))?.click();
        await new Promise(r => setTimeout(r, 200));
        const zoomModalImg = document.querySelector('[role="dialog"] img[src*="q07_fig.webp"]');
        const zoomOpen = !!zoomModalImg;
        return {
          ok:
            pills.length === 25 &&
            sideBySide &&
            undoEnabled &&
            q2ScratchpadBlank &&
            q1ScratchpadRestored &&
            !overflow &&
            hasStemTtsBtn &&
            hasOptTtsBtn &&
            figLoaded &&
            zoomOpen,
          pillCount: pills.length,
          sideBySide,
          undoEnabled,
          q2ScratchpadBlank,
          q1ScratchpadRestored,
          overflow,
          hasStemTtsBtn,
          hasOptTtsBtn,
          figLoaded,
          zoomOpen,
        };
      })()
    `);
    assert.equal(quizSetup?.ok, true, `114 Math Quiz check failed: ${JSON.stringify(quizSetup)}`);

    await client.eval(`
      (() => {
        const closeBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b => b.getAttribute('aria-label')?.includes('關閉') || (b.innerText || '').includes('關閉'));
        closeBtn?.click();
      })()
    `);
    await sleep(250);
    await client.screenshot('priori_ipad_quiz.png');
    console.log('✓ Test C (114 Math 25 pills, split-pane canvas, TTS buttons, Q7 figure & Zoom modal at 1024x768) passed');

    // Test D: Submit 114 Math -> Result -> Data Isolation -> Subject-Isolated Mistake Sinking Drill
    const resultCheck = await client.eval(`
      (async () => {
        document.querySelector('button[aria-label="跳到第 25 題"]')?.click();
        await new Promise(r => setTimeout(r, 200));
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('交卷核對'))?.click();
        await new Promise(r => setTimeout(r, 200));
        const confirmDialog = document.querySelector('[role="dialog"][aria-label="交卷確認"]');
        const hasUnansweredConfirm = (confirmDialog?.innerText || '').includes('23 題還沒作答');
        Array.from(document.querySelectorAll('[role="dialog"] button')).find(b => (b.innerText || '').includes('確定交卷'))?.click();
        await new Promise(r => setTimeout(r, 400));

        const body = document.body.innerText || '';
        const retryBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('再練待加強題'));
        const reviewLink = Array.from(document.querySelectorAll('a')).find(a => a.innerText === '看錯題');
        const more = Array.from(document.querySelectorAll('details')).find(d => d.querySelector('summary')?.innerText === '更多操作');
        const resultActionsOk = !!retryBtn && reviewLink?.getAttribute('href') === '#review-priori-114-math-g3-q02' && more && !more.open;
        const hasScore = (body.includes('4') && (body.includes('1 / 25') || body.includes('1/25')));
        const q1Review = document.querySelector('#review-priori-114-math-g3-q01');
        const expandBtn = Array.from(q1Review?.querySelectorAll('button') || []).find(b => (b.innerText || '').includes('展開全部'));
        expandBtn?.click();
        await new Promise(r => setTimeout(r, 150));
        const q1Text = q1Review?.innerText || '';
        const hasAllSteps = q1Text.includes('選 (4)');
        const hasStreak1 = q1Text.includes('連對 1 次');
        const hasPadReplay = !!q1Review?.querySelector('[aria-label="第 1 題計算紙紀錄"]');

        return {
          ok: resultActionsOk && hasUnansweredConfirm && hasScore && hasAllSteps && hasStreak1 && hasPadReplay,
          resultActionsOk, hasUnansweredConfirm, hasScore, hasAllSteps, hasStreak1, hasPadReplay,
          scorePreview: body.slice(0, 350),
          storageKeys: Object.keys(localStorage),
        };
      })()
    `);
    await client.screenshot('priori_ipad_result.png');
    assert.equal(resultCheck?.ok, true, `114 Math Result check failed: ${JSON.stringify(resultCheck)}`);

    const leakedKeys = resultCheck.storageKeys.filter(
      (k) => k.includes('mcq') || k.includes('exam_mastery') || k.includes('coins')
    );
    assert.equal(leakedKeys.length, 0, `Unexpected storage keys: ${leakedKeys.join(', ')}`);
    assert.ok(resultCheck.storageKeys.some((k) => k.startsWith('wutai_priori_v1_')), 'Expected wutai_priori_v1_* storage key');

    // Navigate back to Hub and verify Subject-Isolated Sinking Drill
    const sinkingCheck = await client.eval(`
      (async () => {
        const OFFICIAL = ${JSON.stringify(MATH_114_OFFICIAL)};
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('回練習館') || (b.innerText || '').includes('選卷'))?.click();
        await new Promise(r => setTimeout(r, 250));

        // Confirm Chinese & English remedial pools are untouched (no 再練待加強題 button in Chinese/English tabs)
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('國語科'))?.click();
        await new Promise(r => setTimeout(r, 180));
        const chiIsolated = !(document.body.innerText || '').includes('再練待加強題');

        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('英語科'))?.click();
        await new Promise(r => setTimeout(r, 180));
        const engIsolated = !(document.body.innerText || '').includes('再練待加強題');

        // Back to 數學科 and inspect remedial section + launch sinking drill
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('數學科'))?.click();
        await new Promise(r => setTimeout(r, 250));
        const mathSection = document.querySelector('[aria-label="數學科待補強與錯題沉底特訓專區"]');
        const mathSectionText = mathSection?.innerText || '';
        const settings = mathSection?.querySelector('details');
        const settingsCollapsed = settings && !settings.open;
        settings?.querySelector('summary')?.click();
        const hasShortLongToggles = settingsCollapsed && settings.open && settings.innerText.includes('10 題短測') && settings.innerText.includes('20 題長測');
        settings?.querySelector('summary')?.click();
        const launchBtn = Array.from(mathSection?.querySelectorAll('button') || []).find(b =>
          (b.innerText || '').includes('再練待加強題')
        );
        if (!launchBtn) return { ok: false, reason: 'Missing math sinking drill button', chiIsolated, engIsolated, mathSectionText };
        launchBtn.click();
        await new Promise(r => setTimeout(r, 300));

        const headerTextBefore = document.body.innerText || '';
        const hasExplicitCapBanner = headerTextBefore.includes('單輪上限 20 題');
        const matchProgressBefore = headerTextBefore.match(/沉底特訓進度：\\s*1\\s*\\/\\s*(\\d+)/) || headerTextBefore.match(/1\\s*\\/\\s*(\\d+)/);
        const totalBefore = matchProgressBefore ? Number(matchProgressBefore[1]) : 0;
        const matchQNum = headerTextBefore.match(/第\\s*(\\d+)\\s*題/);
        const qNum = matchQNum ? Number(matchQNum[1]) : 2;
        const officialIdx = OFFICIAL[qNum - 1] ?? 0;
        const wrongIdx = (officialIdx + 1) % 4;

        // Intentionally pick wrong option & click 確認本題答案
        document.querySelectorAll('[role="radio"]')[wrongIdx]?.click();
        await new Promise(r => setTimeout(r, 120));
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('確認本題答案'))?.click();
        await new Promise(r => setTimeout(r, 200));

        const afterWrongText = document.body.innerText || '';
        const hasSinkFeedback = afterWrongText.includes('答錯') || afterWrongText.includes('排到') || afterWrongText.includes('隊尾') || afterWrongText.includes('重新排入');
        const sinkAdvanceBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('繼續下一題（已排到最後）'));
        const hasSinkBtn = !!sinkAdvanceBtn;
        window.__sinkFeedbackSample = afterWrongText.slice(0, 700);
        sinkAdvanceBtn?.click();
        await new Promise(r => setTimeout(r, 200));

        const headerTextAfter = document.body.innerText || '';
        const matchProgressAfter = headerTextAfter.match(/2\\s*\\/\\s*(\\d+)/);
        const totalAfter = matchProgressAfter ? Number(matchProgressAfter[1]) : 0;
        const queueExtended = totalAfter === totalBefore + 1;

        // Test 中途離開 + saving 1 completed attempt cleanly
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('中途離開'))?.click();
        await new Promise(r => setTimeout(r, 180));
        const exitDialog = document.querySelector('[role="dialog"][aria-label="中途離開確認"]');
        const savePartialBtn = Array.from(exitDialog?.querySelectorAll('button') || []).find(b => (b.innerText || '').includes('保存已練 1 題進度'));
        savePartialBtn?.click();
        await new Promise(r => setTimeout(r, 250));
        const partialExitOk = (document.body.innerText || '').includes('已留存本輪 1 次作答的進度');

        return {
          ok: chiIsolated && engIsolated && hasShortLongToggles && hasExplicitCapBanner && hasSinkFeedback && hasSinkBtn && queueExtended && partialExitOk,
          chiIsolated, engIsolated, hasShortLongToggles, hasExplicitCapBanner, hasSinkFeedback, hasSinkBtn, totalBefore, totalAfter, queueExtended, partialExitOk,
          sinkFeedbackSample: window.__sinkFeedbackSample,
        };
      })()
    `);
    assert.equal(sinkingCheck?.ok, true, `Subject-isolated sinking drill check failed: ${JSON.stringify(sinkingCheck)}`);
    console.log('✓ Test D (Submit, review scratchpad replay, subject isolation, wrong-answer sink & queue extension) passed');

    // Test E: 114 Chinese G3 Reading Group Split View (/?view=priori&paper=114-chinese-g3)
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori&paper=114-chinese-g3` });
    await sleep(600);
    const chineseCheck = await client.eval(`
      (async () => {
        document.querySelector('button[aria-label="跳到第 20 題"]')?.click();
        await new Promise(r => setTimeout(r, 350));
        const txt = document.body.innerText || '';
        const hasPassageTitle = txt.includes('小光與阿婆的雜貨店') && txt.includes('彈珠遊戲機');
        const toggleImgBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('原卷注音圖：'));
        toggleImgBtn?.click();
        await new Promise(r => setTimeout(r, 350));
        const passageImg = document.querySelector('img[src*="passage_20_22.webp"]');
        const passageLoaded = !!passageImg && passageImg.complete && passageImg.naturalWidth > 0;
        // Toggle back to structured reading text for crisp screenshot & click official answer
        toggleImgBtn?.click();
        await new Promise(r => setTimeout(r, 150));
        const radios = document.querySelectorAll('[role="radio"]');
        radios[1]?.click(); // official Q20 answer (遊戲機)
        await new Promise(r => setTimeout(r, 120));
        const noScratchpadInChinese = !Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('計算紙'));
        return {
          ok: hasPassageTitle && passageLoaded && radios.length === 4 && noScratchpadInChinese,
          hasPassageTitle, passageLoaded, radioCount: radios.length, noScratchpadInChinese,
        };
      })()
    `);
    assert.equal(chineseCheck?.ok, true, `114 Chinese reading group check failed: ${JSON.stringify(chineseCheck)}`);
    await client.screenshot('priori_114_chi_reading.png');
    console.log('✓ Test E (114 Chinese G3 Q20 reading passage split pane) passed');

    // Test F: 114 English G3 Official MP3 + Alphabet Pad + O/X + 3-Picture Choice
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori&paper=114-english-g3` });
    await sleep(600);
    const engSetup = await client.eval(`
      (async () => {
        const hasAudioBtn = !!document.querySelector('button[aria-label="播放官方聽力音檔"]');
        const upperInput = document.querySelector('input[aria-label="大寫字母輸入"]');
        const lowerInput = document.querySelector('input[aria-label="小寫字母輸入"]');
        const noMcqRadios = document.querySelectorAll('[role="radio"]').length === 0;
        const noScratchpadInEnglish = !Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('計算紙'));
        if (!upperInput || !lowerInput) return { ok: false, reason: 'Missing PrioriAlphabetPad inputs' };

        const setInput = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        };
        setInput(upperInput, 'V');
        await new Promise(r => setTimeout(r, 80));
        setInput(lowerInput, 'v');
        await new Promise(r => setTimeout(r, 120));

        return {
          ok: hasAudioBtn && noMcqRadios && noScratchpadInEnglish && upperInput.value === 'V' && lowerInput.value === 'v',
          hasAudioBtn, noMcqRadios, noScratchpadInEnglish, upperVal: upperInput.value, lowerVal: lowerInput.value,
        };
      })()
    `);
    assert.equal(engSetup?.ok, true, `114 English Alphabet Pad check failed: ${JSON.stringify(engSetup)}`);
    await client.screenshot('priori_114_eng_alphabet.png');

    const engRest = await client.eval(`
      (async () => {
        // Jump to Q16 (O/X 2 options)
        document.querySelector('button[aria-label="跳到第 16 題"]')?.click();
        await new Promise(r => setTimeout(r, 250));
        const q16Radios = document.querySelectorAll('[role="radio"]');
        const q16TwoOpts = q16Radios.length === 2;
        q16Radios[0]?.click(); // official O
        await new Promise(r => setTimeout(r, 120));

        // Jump to Q22 (3 picture options + q22_fig.webp)
        document.querySelector('button[aria-label="跳到第 22 題"]')?.click();
        await new Promise(r => setTimeout(r, 350));
        const q22Radios = document.querySelectorAll('[role="radio"]');
        const q22ThreeOpts = q22Radios.length === 3;
        const fig22 = document.querySelector('img[src*="q22_fig.webp"]');
        const fig22Loaded = !!fig22 && fig22.complete && fig22.naturalWidth > 0;
        q22Radios[2]?.click(); // official 圖片 (3)
        await new Promise(r => setTimeout(r, 120));

        return {
          ok: q16TwoOpts && q22ThreeOpts && fig22Loaded,
          q16TwoOpts, q22ThreeOpts, fig22Loaded,
        };
      })()
    `);
    assert.equal(engRest?.ok, true, `114 English Q16/Q22 check failed: ${JSON.stringify(engRest)}`);
    await client.screenshot('priori_114_eng_dialogue.png');

    const engSubmit = await client.eval(`
      (async () => {
        document.querySelector('button[aria-label="跳到第 25 題"]')?.click();
        await new Promise(r => setTimeout(r, 200));
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('交卷核對'))?.click();
        await new Promise(r => setTimeout(r, 200));
        Array.from(document.querySelectorAll('[role="dialog"] button')).find(b => (b.innerText || '').includes('確定交卷'))?.click();
        await new Promise(r => setTimeout(r, 400));
        const body = document.body.innerText || '';
        const has3Right = body.includes('答對 3 / 25 題') && body.includes('12 分');
        const q1Review = document.querySelector('#review-priori-114-eng-g3-q01');
        const q1Text = q1Review?.innerText || '';
        const hasEngMastery = q1Text.includes('V') && q1Text.includes('v') && q1Text.includes('連對 1 次');
        return { ok: has3Right && hasEngMastery, has3Right, hasEngMastery, q1Text };
      })()
    `);
    await client.screenshot('priori_114_eng_result.png');
    assert.equal(engSubmit?.ok, true, `114 English grading check failed: ${JSON.stringify(engSubmit)}`);
    console.log('✓ Test F (114 English G3 official MP3, Alphabet Pad, 2-opt O/X, 3-opt dialogue & 3/25 grading) passed');

    // Test G: Independent Teacher Dashboard (Server Auth ci-mock-admin-pw, Real Clean Default vs Dropdown Demo, Initial vs Mastery toggle, Class Matrix + AES Roster + Year 114 & 115)
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori&tab=teacher` });
    await sleep(600);
    const teacherCheck = await client.eval(`
      (async () => {
        const setInput = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        };
        const setTextarea = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        };
        const setSelect = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        let pwInput = null;
        const pwDeadline = Date.now() + 5000;
        while (Date.now() < pwDeadline) {
          pwInput = document.getElementById('priori-teacher-password');
          if (pwInput) break;
          await new Promise(r => setTimeout(r, 120));
        }
        if (!pwInput) return { ok: false, reason: 'Missing password input' };

        setInput(pwInput, 'wrongpass');
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('驗證進入教師診斷台'))?.click();
        await new Promise(r => setTimeout(r, 200));
        const wrongPwMsg = (document.body.innerText || '').includes('教師密碼錯誤');

        setInput(pwInput, 'ci-mock-admin-pw');
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('驗證進入教師診斷台'))?.click();
        let matrixSection = null;
        const matrixDeadline = Date.now() + 5000;
        while (Date.now() < matrixDeadline) {
          matrixSection = document.querySelector('section[aria-label="班級成績總覽矩陣"]');
          if (matrixSection) break;
          await new Promise(r => setTimeout(r, 120));
        }
        const getSeatNums = () => Array.from(matrixSection?.querySelectorAll('tbody tr td:first-child') || [])
          .map(td => parseInt((td.innerText || '').replace(/\\D+/g, ''), 10))
          .filter(n => !Number.isNaN(n));
        const g3aSeats = getSeatNums();
        const seatsAscending = g3aSeats.length === 6 && g3aSeats.every((v, i) => i === 0 || v >= g3aSeats[i - 1]);
        const realClassClean = !(matrixSection?.innerText || '').includes('巴奈');

        // Test 5年乙班 headcount (19人) + inline local seat name input (zero PII leaked)
        const gradeSel = document.querySelector('select[aria-label="篩選年級"]');
        const classSel = document.querySelector('select[aria-label="篩選班級"]');
        setSelect(gradeSel, '5');
        await new Promise(r => setTimeout(r, 150));
        setSelect(classSel, '2');
        await new Promise(r => setTimeout(r, 150));
        const g5bSeats = getSeatNums();
        const g5bCountOk = g5bSeats.length === 19 && g5bSeats[0] === 1 && g5bSeats[18] === 19;
        const localNameInput = matrixSection?.querySelector('input[aria-label="01 號 姓名輸入"]');
        let localNameOk = false;
        if (localNameInput) {
          setInput(localNameInput, '本機試填');
          await new Promise(r => setTimeout(r, 120));
          localNameOk = (localStorage.getItem('wutai_priori_teacher_local_names_v1') || '').includes('本機試填');
          setInput(localNameInput, '');
        }
        setSelect(gradeSel, '3');
        await new Promise(r => setTimeout(r, 150));
        setSelect(classSel, '1');
        await new Promise(r => setTimeout(r, 150));

        // Pick built-in demo class directly from 2. 班級 dropdown & verify 初測成績（預設） vs 精熟後成果 toggle
        setSelect(classSel, 'demo');
        await new Promise(r => setTimeout(r, 250));
        const demoInClassOk = (matrixSection?.innerText || '').includes('巴奈 (示範)') && (matrixSection?.innerText || '').includes('84 分');
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '精熟後成果')?.click();
        await new Promise(r => setTimeout(r, 200));
        const masteryModeOk = (matrixSection?.innerText || '').includes('96 分') && (matrixSection?.innerText || '').includes('🌟');
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '初測成績（預設）')?.click();
        await new Promise(r => setTimeout(r, 150));

        const tools = document.getElementById('priori-teacher-more-tools');
        const toolsCollapsed = tools && !tools.open;
        tools?.querySelector('summary')?.click();
        // Switch matrix view to '依科目看歷年（115–108）' -> unattempted years show '-' & switch back to '依年度看國／數／英'
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('依科目看歷年'))?.click();
        await new Promise(r => setTimeout(r, 200));
        const bySubjColsOk = toolsCollapsed && tools.open && (matrixSection?.innerText || '').includes('115 年') && (matrixSection?.innerText || '').includes('108 年');
        const hasDashCells = Array.from(matrixSection?.querySelectorAll('tbody td') || [])
          .some(td => (td.innerText || '').trim() === '-');

        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('依年度看國／數／英'))?.click();
        await new Promise(r => setTimeout(r, 200));

        // Click a Math student's score cell (with ✏️ scratchpad icon; Chinese/English must NOT carry ✏️)
        const allScoreBtns = Array.from(matrixSection?.querySelectorAll('tbody button') || []).filter(b => (b.innerText || '').includes('分'));
        const nonMathNoPadOk = allScoreBtns.some(b => !(b.innerText || '').includes('✏️'));
        const scoreCellBtn = allScoreBtns.find(b => (b.innerText || '').includes('✏️'));
        scoreCellBtn?.click();
        await new Promise(r => setTimeout(r, 250));
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('含計算紙筆跡'))?.click();
        await new Promise(r => setTimeout(r, 180));
        const studentDetailOk = nonMathNoPadOk && (document.body.innerText || '').includes('回成績總表') && document.querySelectorAll('article canvas').length >= 1;
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('回成績總表'))?.click();
        await new Promise(r => setTimeout(r, 200));

        // Return to real 3年甲班 for encrypted roster test
        setSelect(classSel, '1');
        await new Promise(r => setTimeout(r, 200));

        // Test PrioriRosterModal: import + O masking (王小明 -> 王O明) + PBKDF2/AES-GCM encryption
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('匯入加密名冊'))?.click();
        await new Promise(r => setTimeout(r, 200));
        const rosterDialog = document.querySelector('[role="dialog"][aria-label="班級名冊管理與加密同步"]');
        const textarea = rosterDialog?.querySelector('textarea');
        const rosterPassInput = rosterDialog?.querySelector('input[type="password"]');
        let rosterImportOk = false;
        if (textarea && rosterPassInput) {
          setTextarea(textarea, '3, 1, 3, 王小明\\n3, 1, 8, 林小華');
          setInput(rosterPassInput, 'demo1234');
          await new Promise(r => setTimeout(r, 150));
          const saveRosterBtn = Array.from(rosterDialog.querySelectorAll('button')).find(b => (b.innerText || '').includes('加密保存名冊'));
          saveRosterBtn?.click();
          const deadline = Date.now() + 4000;
          while (Date.now() < deadline) {
            const modalText = rosterDialog.innerText || '';
            if (modalText.includes('已加密保存') || modalText.includes('AES-256')) {
              rosterImportOk = true;
              break;
            }
            await new Promise(r => setTimeout(r, 150));
          }
        }
        document.querySelector('button[aria-label="關閉名冊視窗"]')?.click();
        await new Promise(r => setTimeout(r, 200));
        const maskedRosterRendered = (document.querySelector('section[aria-label="班級成績總覽矩陣"]')?.innerText || '').includes('王O明');

        // Select demo via 1. 年級 dropdown and inspect '依題目' cross-matrix (Y: Q1..25 condensed, X: seats 1..N)
        setSelect(gradeSel, 'demo');
        await new Promise(r => setTimeout(r, 200));
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '依題目')?.click();
        await new Promise(r => setTimeout(r, 250));

        const yearSel = document.querySelector('select[aria-label="篩選年度"]');
        const subjSel = document.querySelector('select[aria-label="篩選科目"]');
        const defaultYearIs114 = yearSel?.value === '114';

        // Verify X-Y cross-matrix defaults to 初測答對率 & toggles to 目前精熟率
        const qMatrix = document.querySelector('section[aria-label="依題目班級作答交叉矩陣"]');
        const qInitialColOk = (qMatrix?.innerText || '').includes('初測答對率');
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '精熟後成果')?.click();
        await new Promise(r => setTimeout(r, 200));
        const qMasteryColOk = (qMatrix?.innerText || '').includes('目前精熟率');

        // Click Q1 to verify 4 demo scratchpad canvases
        const qRowsCount = qMatrix?.querySelectorAll('tbody tr')?.length || 0;
        const firstQBtn = qMatrix?.querySelector('tbody tr td:first-child button');
        firstQBtn?.click();
        await new Promise(r => setTimeout(r, 250));
        const q1Inspector = document.querySelector('section[aria-label="第 1 題全班作答與計算紙檢視"]');
        const hasQ1Canvases = qRowsCount === 25 && (q1Inspector?.querySelectorAll('canvas')?.length || 0) >= 4;

        // Switch to 114 Chinese
        setSelect(subjSel, 'chinese');
        await new Promise(r => setTimeout(r, 300));
        const chiMatrixText = document.querySelector('section[aria-label="依題目班級作答交叉矩陣"]')?.innerText || '';
        const chiRowsCount = document.querySelectorAll('section[aria-label="依題目班級作答交叉矩陣"] tbody tr').length;
        const chiLoaded = chiRowsCount === 25 && (chiMatrixText.includes('小光') || chiMatrixText.includes('閱讀理解'));

        // Switch to 114 English & click Q1 to verify alphabet-pair key + options
        setSelect(subjSel, 'english');
        await new Promise(r => setTimeout(r, 300));
        const engRowsCount = document.querySelectorAll('section[aria-label="依題目班級作答交叉矩陣"] tbody tr').length;
        document.querySelector('section[aria-label="依題目班級作答交叉矩陣"] tbody tr td:first-child button')?.click();
        await new Promise(r => setTimeout(r, 250));
        const engInspectorText = document.querySelector('section[aria-label="第 1 題全班作答與計算紙檢視"]')?.innerText || '';
        const engLoaded = engRowsCount === 25 && engInspectorText.includes('V') && engInspectorText.includes('v');

        // Verify Teacher Print Picker Modal -> pick 114 Chinese Grade 3 with Answer Key & print
        const prevPrintCalls = window.__printCalls || 0;
        const teacherPrintBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('列印試卷'));
        teacherPrintBtn?.click();
        await new Promise(r => setTimeout(r, 200));
        const printDialog = document.querySelector('[role="dialog"][aria-label="選擇列印試卷與版本"]');
        const pSubj = document.getElementById('print-subject-select');
        const pYear = document.getElementById('print-year-select');
        const pGrade = document.getElementById('print-grade-select');
        if (pSubj && pYear && pGrade) {
          setSelect(pSubj, 'chinese');
          setSelect(pYear, '114');
          setSelect(pGrade, '3');
          await new Promise(r => setTimeout(r, 100));
        }
        Array.from(printDialog?.querySelectorAll('button') || []).find(b => (b.innerText || '').trim() === '原卷 A3')?.click();
        await new Promise(r => setTimeout(r, 100));
        const teacherAnswerHref = printDialog?.querySelector('a[href$="-answer.pdf"]')?.getAttribute('href');
        Array.from(printDialog?.querySelectorAll('button') || []).find(b => (b.innerText || '').includes('空白練習卷'))?.click();
        await new Promise(r => setTimeout(r, 100));
        const teacherBlankHref = printDialog?.querySelector('a[href$="-student.pdf"]')?.getAttribute('href');
        setSelect(pSubj, 'math');
        setSelect(pYear, '115');
        await new Promise(r => setTimeout(r, 100));
        Array.from(printDialog?.querySelectorAll('button') || []).find(b => (b.innerText || '').includes('教師解答卷'))?.click();
        await new Promise(r => setTimeout(r, 100));
        const missing115Answer = (printDialog?.innerText || '').includes('115 年原卷答案尚未提供') && !printDialog?.querySelector('a[href$="-answer.pdf"]');
        const originalPrintOk = teacherAnswerHref === '/assets/priori/original/114-chinese-g3-answer.pdf' && teacherBlankHref === '/assets/priori/original/114-chinese-g3-student.pdf' && missing115Answer;
        setSelect(pSubj, 'chinese');
        setSelect(pYear, '114');
        Array.from(printDialog?.querySelectorAll('button') || []).find(b => (b.innerText || '').trim() === '練習卷 A4')?.click();
        await new Promise(r => setTimeout(r, 100));
        Array.from(printDialog?.querySelectorAll('button') || []).find(b => (b.innerText || '').includes('確定列印此試卷'))?.click();
        const printDeadline = Date.now() + 3000;
        while (Date.now() < printDeadline && (window.__printCalls || 0) <= prevPrintCalls) {
          await new Promise(r => setTimeout(r, 100));
        }
        const teacherPrintText = document.querySelector('[class*="print:block"]')?.textContent || '';
        const teacherPrintOk = originalPrintOk &&
          !!teacherPrintBtn &&
          !!printDialog &&
          (window.__printCalls || 0) > prevPrintCalls &&
          teacherPrintText.includes('教師解答卷') &&
          teacherPrintText.includes('國語科') &&
          teacherPrintText.includes('正解：');

        return {
          ok: wrongPwMsg && seatsAscending && realClassClean && g5bCountOk && localNameOk && demoInClassOk && masteryModeOk && hasDashCells && bySubjColsOk && studentDetailOk && rosterImportOk && maskedRosterRendered && defaultYearIs114 && qInitialColOk && qMasteryColOk && hasQ1Canvases && chiLoaded && engLoaded && teacherPrintOk,
          wrongPwMsg, seatsAscending, realClassClean, g5bCountOk, localNameOk, demoInClassOk, masteryModeOk, hasDashCells, bySubjColsOk, studentDetailOk, rosterImportOk, maskedRosterRendered, defaultYearIs114, qInitialColOk, qMasteryColOk, hasQ1Canvases, chiLoaded, engLoaded, teacherPrintOk,
        };
      })()
    `);
    await client.screenshot('priori_teacher_114_eng.png');
    assert.equal(teacherCheck?.ok, true, `Teacher dashboard check failed: ${JSON.stringify(teacherCheck)}`);

    // Also switch Teacher Dashboard to Year 115 Math
    const teacher115 = await client.eval(`
      (async () => {
        const yearSel = document.querySelector('select[aria-label="篩選年度"]');
        const subjSel = document.querySelector('select[aria-label="篩選科目"]');
        const setSelect = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        setSelect(subjSel, 'math');
        setSelect(yearSel, '115');
        await new Promise(r => setTimeout(r, 300));
        const matrixEl = document.querySelector('section[aria-label="依題目班級作答交叉矩陣"]');
        const t115 = matrixEl?.innerText || '';
        const rows25 = (matrixEl?.querySelectorAll('tbody tr')?.length || 0) === 25;
        return rows25 && (t115.includes('4001') || t115.includes('加減') || t115.includes('第 1 題'));
      })()
    `);
    assert.equal(teacher115, true, 'Teacher dashboard failed to switch back to 115 Math');
    await client.screenshot('priori_teacher_question.png');
    console.log('✓ Test G (Teacher backend ci-mock-admin-pw, clean real class, dropdown demo, initial/mastery toggle, AES roster & 114/115) passed');

    // Test H: Mobile Portrait (375x812)
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori` });
    await sleep(600);

    const mobileCheck = await client.eval(`
      (async () => {
        const hubOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;
        Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('再練一次') || (b.innerText || '').includes('開始測驗'))?.click();
        await new Promise(r => setTimeout(r, 350));
        const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '計算紙');
        btn?.click();
        await new Promise(r => setTimeout(r, 200));
        const quizOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;
        const artRect = document.querySelector('article')?.getBoundingClientRect();
        const canRect = document.querySelector('canvas')?.getBoundingClientRect();
        const stackedVertically = !!artRect && !!canRect && canRect.top >= artRect.bottom - 10;
        return {
          ok: !hubOverflow && !quizOverflow && stackedVertically,
          hubOverflow, quizOverflow, stackedVertically,
        };
      })()
    `);
    assert.equal(mobileCheck?.ok, true, `Mobile portrait layout failed: ${JSON.stringify(mobileCheck)}`);
    await client.screenshot('priori_mobile_quiz.png');
    console.log('✓ Test H (Mobile portrait 375x812 vertical stacking & zero overflow) passed');

    // Test I: Two-Device Staggered Cross-Sync -> Recomputed Summary (8 分 / 2 題) -> Hub & Teacher Verification
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `window.__CI__ = false;`,
    });
    client.mockRows = [];
    client.prioriRecords = [];
    client.mockRequests = [];
    client.blockCloudReads = false;

    const resetLocalPrioriForSeat = async (seatId = '030105', { resetDeviceSecret = false } = {}) => {
      await client.eval(`
        (() => {
          Object.keys(localStorage)
            .filter((k) => k.startsWith('wutai_priori') && k !== 'wutai_priori_device_secret_v1')
            .forEach((k) => localStorage.removeItem(k));
          if (${resetDeviceSecret}) {
            localStorage.removeItem('wutai_priori_device_secret_v1');
          }
          localStorage.setItem('wutai_last_student_id', ${JSON.stringify(seatId)});
        })()
      `);
    };

    const submitTransferPin = async (pin, expectError = false, expectedErrorSubstring = '不正確') => {
      const res = await client.eval(`
        (async () => {
          const deadline = Date.now() + 5000;
          let input = null;
          while (Date.now() < deadline) {
            input = document.getElementById('priori-student-transfer-pin');
            if (input) break;
            await new Promise((r) => setTimeout(r, 100));
          }
          if (!input) return { ok: false, reason: 'PIN dialog not shown' };
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, ${JSON.stringify(pin)});
          input.dispatchEvent(new Event('input', { bubbles: true }));
          const form = input.closest('form');
          form?.querySelector('button[type="submit"]')?.click();
          if (${expectError}) {
            await new Promise((r) => setTimeout(r, 350));
            const stillOpen = !!document.getElementById('priori-student-transfer-pin');
            const dialogText = form?.innerText || '';
            return { ok: stillOpen && dialogText.includes(${JSON.stringify(expectedErrorSubstring)}), dialogText };
          }
          const closeDeadline = Date.now() + 5000;
          while (Date.now() < closeDeadline) {
            if (!document.getElementById('priori-student-transfer-pin')) break;
            await new Promise((r) => setTimeout(r, 100));
          }
          return { ok: !document.getElementById('priori-student-transfer-pin') };
        })()
      `);
      assert.equal(res?.ok, true, `Transfer PIN interaction (${pin}) failed: ${JSON.stringify(res)}`);
    };

    const start114MathAndAnswer = async (qNum, optIdx) => {
      const res = await client.eval(`
        (async () => {
          const deadline = Date.now() + 6000;
          let startBtn = null;
          while (Date.now() < deadline) {
            startBtn = Array.from(document.querySelectorAll('button')).find((b) => {
              const t = b.innerText || '';
              if (!t.includes('開始測驗') && !t.includes('再練一次')) return false;
              const rowText = b.closest('div.rounded-2xl')?.innerText || '';
              return rowText.includes('114 年') && rowText.includes('三年級數學科');
            });
            if (startBtn) break;
            await new Promise((r) => setTimeout(r, 120));
          }
          if (!startBtn) return { ok: false, reason: 'Missing 114-math-g3 start button' };
          startBtn.click();
          await new Promise((r) => setTimeout(r, 300));

          if (${qNum} !== 1) {
            document.querySelector('button[aria-label="跳到第 ${qNum} 題"]')?.click();
            await new Promise((r) => setTimeout(r, 150));
          }
          const radios = Array.from(document.querySelectorAll('[role="radio"]'));
          if (!radios[${optIdx}]) return { ok: false, reason: 'Missing radio option ${optIdx}' };
          radios[${optIdx}].click();
          await new Promise((r) => setTimeout(r, 150));
          return { ok: true };
        })()
      `);
      assert.equal(res?.ok, true, `Two-device quiz step failed: ${JSON.stringify(res)}`);
    };

    const submitQuiz = async () => {
      await client.eval(`
        (async () => {
          document.querySelector('button[aria-label="跳到第 25 題"]')?.click();
          await new Promise((r) => setTimeout(r, 150));
          Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').includes('交卷核對'))?.click();
          await new Promise((r) => setTimeout(r, 180));
          Array.from(document.querySelectorAll('[role="dialog"] button')).find((b) => (b.innerText || '').includes('確定交卷'))?.click();
          await new Promise((r) => setTimeout(r, 400));
        })()
      `);
    };

    // Device 1 on blank unbound seat '030105': student directly self-sets 4-digit PIN '0512' (no activation code) & binds this iPad
    await resetLocalPrioriForSeat('030105', { resetDeviceSecret: true });
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori` });
    await sleep(600);
    const blankSetupPrompt = await client.eval(`
      (async () => {
        const deadline = Date.now() + 5000;
        let pinInput = null;
        while (Date.now() < deadline) {
          pinInput = document.getElementById('priori-student-transfer-pin');
          if (pinInput) break;
          await new Promise((r) => setTimeout(r, 100));
        }
        const formText = pinInput?.closest('form')?.innerText || '';
        return {
          ok: Boolean(pinInput) && !document.getElementById('priori-student-activation-code') && formText.includes('請自設你的 4 位數小密碼'),
          formText,
        };
      })()
    `);
    assert.equal(blankSetupPrompt?.ok, true, `Blank seat must prompt direct 4-digit PIN setup without activation code: ${JSON.stringify(blankSetupPrompt)}`);
    await submitTransferPin('0512', false);

    // Reload on SAME Device 1: MUST NOT prompt for PIN again!
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori` });
    await sleep(600);
    const sameDevNoPrompt = await client.eval(
      `!document.getElementById('priori-student-transfer-pin')`
    );
    assert.equal(sameDevNoPrompt, true, 'Same trusted device must NOT prompt for transfer PIN again');

    await start114MathAndAnswer(1, 3);
    await submitQuiz();
    for (let i = 0; i < 20; i++) {
      if (client.prioriRecords.some((r) => r.record_key === 'priori_030105_114-math-g3')) break;
      await sleep(100);
    }
    const afterDev1Row = client.prioriRecords.find((r) => r.record_key === 'priori_030105_114-math-g3');
    if (!afterDev1Row) {
      const dev1Diag = await client.eval(`({
        ci: window.__CI__,
        lastId: localStorage.getItem('wutai_last_student_id'),
        prioriKeys: Object.keys(localStorage).filter(k => k.includes('priori')),
        bodyHead: (document.body.innerText || '').slice(0, 500),
      })`);
      assert.fail(`Expected Device 1 record synced to priori_records RPC; dev1Diag=${JSON.stringify(dev1Diag)}; reqs=${JSON.stringify(client.mockRequests.slice(-10))}; prioriRecords=${JSON.stringify(client.prioriRecords)}`);
    }
    assert.equal(afterDev1Row.score, 4, `Expected Device 1 cloud score 4, got ${afterDev1Row.score}; row=${JSON.stringify(afterDev1Row)}`);

    // Device 2 (staggered): simulates new device secret -> rejects wrong PIN '9999' -> unlocks with '0512', solves Q2 right (option index 1), reconnects & submits
    await resetLocalPrioriForSeat('030105', { resetDeviceSecret: true });
    client.blockCloudReads = true;
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori` });
    await sleep(600);
    await submitTransferPin('9999', true);
    await submitTransferPin('0512', false);
    await start114MathAndAnswer(2, 1);
    client.blockCloudReads = false;
    await submitQuiz();

    let mergedRow = null;
    for (let i = 0; i < 25; i++) {
      const row = client.prioriRecords.find((r) => r.record_key === 'priori_030105_114-math-g3');
      if (row && row.score === 8) {
        mergedRow = row;
        break;
      }
      await sleep(120);
    }
    assert.ok(mergedRow, `Expected cloud record merged to score 8; rows=${JSON.stringify(client.prioriRecords)}`);

    // Hub shows the merged latest score while the first submission remains intact.
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori` });
    await sleep(700);
    const hubMerged = await client.eval(`
      (() => {
        const row114 = Array.from(document.querySelectorAll('div.rounded-2xl')).find((el) => {
          const t = el.innerText || '';
          return t.includes('114 年') && t.includes('三年級數學科');
        });
        const text = row114?.innerText || '';
        const localAll = JSON.parse(localStorage.getItem('wutai_priori_v1_030105') || '{}');
        const rec = localAll['114-math-g3'] || null;
        return {
          ok: text.includes('8 分') && rec?.score === 8 && rec?.firstScore === 4 && rec?.correctCount === 2 && rec?.firstCorrectCount === 1,
          text,
          recSummary: rec ? { score: rec.score, firstScore: rec.firstScore, correctCount: rec.correctCount, firstCorrectCount: rec.firstCorrectCount, masteredCount: rec.masteredCount } : null,
        };
      })()
    `);
    assert.equal(hubMerged?.ok, true, `Expected Hub 114-math-g3 strip to show 8 分: ${JSON.stringify(hubMerged)}`);

    // Anti-preemption check: unbound seat '030106' with pre-existing cloud record CANNOT self-set PIN anonymously
    client.prioriRecords.push({
      id: 'pre-existing-030106',
      record_key: 'priori_030106_114-math-g3',
      student_key: '030106',
      paper_id: '114-math-g3',
      grade: '03',
      class_num: '1',
      seat: '06',
      score: 12,
      elapsed: 40,
      payload: {
        score: 12,
        firstScore: 12,
        correctCount: 3,
        firstCorrectCount: 3,
        totalQuestions: 25,
        answers: { q01: 3, q02: 1, q03: 0 },
        firstAnswers: { q01: 3, q02: 1, q03: 0 },
        submittedAt: '2026-11-15T00:00:00.000Z',
        firstSubmittedAt: '2026-11-15T00:00:00.000Z',
      },
      updated_at: '2026-11-15T00:00:00.000Z',
    });
    await resetLocalPrioriForSeat('030106', { resetDeviceSecret: true });
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori` });
    await sleep(600);
    const blockedExistingRecords = await client.eval(`
      (async () => {
        const deadline = Date.now() + 5000;
        let dialogText = '';
        while (Date.now() < deadline) {
          dialogText = document.querySelector('[role="dialog"]')?.innerText || '';
          if (dialogText.includes('請先請老師幫這組座號設定 4 碼密碼')) break;
          await new Promise((r) => setTimeout(r, 100));
        }
        return {
          ok: dialogText.includes('請先請老師幫這組座號設定 4 碼密碼') && !document.getElementById('priori-student-transfer-pin'),
          dialogText,
        };
      })()
    `);
    assert.equal(blockedExistingRecords?.ok, true, `Unbound seat with existing records must require teacher PIN setup: ${JSON.stringify(blockedExistingRecords)}`);

    // Teacher Dashboard: legacy password blocked -> Admin sets single PIN for 030106, non-destructive batch PIN for 3-1, logout/3-1 teacher session clean check
    await client.eval(`sessionStorage.removeItem('wutai_priori_teacher_session_v1'); sessionStorage.removeItem('wutai_priori_teacher_authed');`);
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori&tab=teacher` });
    await sleep(700);
    const teacherMerged = await client.eval(`
      (async () => {
        const setInput = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        };
        const setSelect = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        const pwInput = document.getElementById('priori-teacher-password');
        let legacyBlocked = false;
        if (pwInput) {
          setInput(pwInput, 'wt7902230');
          Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').includes('驗證進入教師診斷台'))?.click();
          await new Promise((r) => setTimeout(r, 350));
          legacyBlocked = (document.body.innerText || '').includes('教師密碼錯誤');

          setInput(pwInput, 'ci-mock-admin-pw');
          Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').includes('驗證進入教師診斷台'))?.click();
          const deadline = Date.now() + 5000;
          while (Date.now() < deadline) {
            if (document.querySelector('section[aria-label="班級成績總覽矩陣"]')) break;
            await new Promise((r) => setTimeout(r, 120));
          }
        }
        const gradeSel = document.querySelector('select[aria-label="篩選年級"]');
        const classSel = document.querySelector('select[aria-label="篩選班級"]');
        setSelect(gradeSel, '3');
        await new Promise((r) => setTimeout(r, 150));
        setSelect(classSel, '1');
        await new Promise((r) => setTimeout(r, 300));

        const matrix = document.querySelector('section[aria-label="班級成績總覽矩陣"]');
        const seat05RowInitial = Array.from(matrix?.querySelectorAll('tbody tr') || []).find((tr) =>
          (tr.innerText || '').includes('05 號')
        );
        const initialText = seat05RowInitial?.innerText || '';

        Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').trim() === '精熟後成果')?.click();
        await new Promise((r) => setTimeout(r, 200));
        const seat05RowMastery = Array.from(matrix?.querySelectorAll('tbody tr') || []).find((tr) =>
          (tr.innerText || '').includes('05 號')
        );
        const masteryText = seat05RowMastery?.innerText || '';

        // 1) Set custom 4-digit PIN '2468' for seat 030106 (which had existing records)
        document.querySelector('button[data-binding-action="set-pin"][data-student-key="030106"]')?.click();
        await new Promise((r) => setTimeout(r, 150));
        const pinInput = document.getElementById('priori-teacher-pin-input');
        if (pinInput) setInput(pinInput, '2468');
        document.getElementById('priori-teacher-pin-submit')?.click();
        await new Promise((r) => setTimeout(r, 300));
        const singleNoticeText = document.getElementById('priori-teacher-binding-notice')?.innerText || '';

        document.querySelector('#priori-teacher-more-tools summary')?.click();

        // 2) Uncheck overwrite checkbox -> batch set 4-digit PIN '3344' for class 3-1 WITHOUT overwriting existing PINs -> updates 4 seats, skips 030105 & 030106
        document.getElementById('priori-teacher-batch-pin-btn')?.click();
        await new Promise((r) => setTimeout(r, 150));
        const overwriteChk = document.getElementById('priori-teacher-batch-overwrite');
        if (overwriteChk?.checked) overwriteChk.click();
        await new Promise((r) => setTimeout(r, 80));
        const batchPinInput = document.getElementById('priori-teacher-pin-input');
        if (batchPinInput) setInput(batchPinInput, '3344');
        document.getElementById('priori-teacher-pin-submit')?.click();
        await new Promise((r) => setTimeout(r, 300));
        const batchNoticeText = document.getElementById('priori-teacher-binding-notice')?.innerText || '';

        // 3) Switch to 3-2 -> open modal -> Logout -> Log in as 3-1 teacher in same SPA state -> notice, modal, and 3-2 must be gone!
        setSelect(classSel, '2');
        await new Promise((r) => setTimeout(r, 200));
        document.getElementById('priori-teacher-batch-pin-btn')?.click();
        await new Promise((r) => setTimeout(r, 100));

        Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').trim() === '登出')?.click();
        await new Promise((r) => setTimeout(r, 250));
        const pwAfterLogout = document.getElementById('priori-teacher-password');
        let clearedAfterSwitchLogin = false;
        if (pwAfterLogout) {
          setInput(pwAfterLogout, 'ci-mock-class31-pw');
          Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').includes('驗證進入教師診斷台'))?.click();
          const deadline = Date.now() + 5000;
          while (Date.now() < deadline) {
            if (document.querySelector('section[aria-label="班級成績總覽矩陣"]')) break;
            await new Promise((r) => setTimeout(r, 120));
          }
          await new Promise((r) => setTimeout(r, 250));
          clearedAfterSwitchLogin =
            !document.getElementById('priori-teacher-pin-modal') &&
            !document.getElementById('priori-teacher-binding-notice') &&
            !(document.body.innerText || '').includes('3年2班');
        }

        return {
          ok:
            legacyBlocked &&
            initialText.includes('4 分') &&
            initialText.includes('已設碼（綁 2 台）') &&
            masteryText.includes('8 分') &&
            singleNoticeText.includes('030106') &&
            singleNoticeText.includes('2468') &&
            batchNoticeText.includes('共 4 位學生') &&
            batchNoticeText.includes('另有 2 位已自設密碼學生未覆蓋') &&
            clearedAfterSwitchLogin,
          legacyBlocked,
          initialText,
          masteryText,
          singleNoticeText,
          batchNoticeText,
          clearedAfterSwitchLogin,
        };
      })()
    `);
    assert.equal(teacherMerged?.ok, true, `Teacher seat 05 staggered merge / custom PIN / logout isolation failed: ${JSON.stringify(teacherMerged)}`);

    // Verify 030106 now unlocks with teacher-assigned PIN '2468' & 030101 unlocked by batch PIN '3344'
    const verify030106Pin = client.handleMockSupabase({
      url: 'https://fqkdkmcqjswufzbvkram.supabase.co/rest/v1/rpc/priori_student_login_seat',
      method: 'POST',
      postData: JSON.stringify({
        p_student_key: '030106',
        p_device_secret: 'stu_030106_verify_secret_' + '1'.repeat(16),
        p_transfer_pin: '2468',
      }),
    });
    assert.equal(JSON.parse(verify030106Pin.body).authorized, true, `Expected teacher PIN 2468 to unlock 030106: ${verify030106Pin.body}`);

    const verify030101BatchPin = client.handleMockSupabase({
      url: 'https://fqkdkmcqjswufzbvkram.supabase.co/rest/v1/rpc/priori_student_login_seat',
      method: 'POST',
      postData: JSON.stringify({
        p_student_key: '030101',
        p_device_secret: 'stu_030101_verify_secret_' + '1'.repeat(16),
        p_transfer_pin: '3344',
      }),
    });
    assert.equal(JSON.parse(verify030101BatchPin.body).authorized, true, `Expected batch PIN 3344 to unlock 030101: ${verify030101BatchPin.body}`);

    // Verify zero Priori writes or queries hit public leaderboard table
    const leakedLeaderboardReqs = client.mockRequests.filter(
      (r) => r.url.includes('/leaderboard') && (r.url.includes('priori') || r.method !== 'GET')
    );
    assert.equal(
      leakedLeaderboardReqs.length,
      0,
      `PRIORI must not read/write public leaderboard: ${JSON.stringify(leakedLeaderboardReqs)}`
    );
    const rpcUrls = client.mockRequests.filter((r) => r.url.includes('/rpc/priori_')).map((r) => r.url.split('/rpc/')[1]);
    assert.ok(rpcUrls.includes('priori_student_login_seat'), `Missing student login RPC call: ${JSON.stringify(rpcUrls)}`);
    assert.ok(rpcUrls.includes('priori_student_upsert_record'), `Missing student upsert RPC call: ${JSON.stringify(rpcUrls)}`);
    assert.ok(rpcUrls.includes('priori_teacher_login'), `Missing teacher login RPC call: ${JSON.stringify(rpcUrls)}`);
    assert.ok(rpcUrls.includes('priori_teacher_list_records'), `Missing teacher list RPC call: ${JSON.stringify(rpcUrls)}`);
    assert.ok(rpcUrls.includes('priori_teacher_list_bindings'), `Missing teacher bindings RPC call: ${JSON.stringify(rpcUrls)}`);
    assert.ok(rpcUrls.includes('priori_teacher_set_student_pin'), `Missing teacher single PIN RPC call: ${JSON.stringify(rpcUrls)}`);
    assert.ok(rpcUrls.includes('priori_teacher_set_class_pins'), `Missing teacher batch PIN RPC call: ${JSON.stringify(rpcUrls)}`);

    // Direct RPC contract isolation assertions on mock server (0 browser console noise):
    const activeTokenA = Array.from(client.studentSessions.entries()).find(([, s]) => s.studentKey === '030105')?.[0];
    assert.ok(activeTokenA, 'Expected active mock student token for 030105');
    const crossReadMock = client.handleMockSupabase({
      url: 'https://fqkdkmcqjswufzbvkram.supabase.co/rest/v1/rpc/priori_student_get_records',
      method: 'POST',
      postData: JSON.stringify({ p_token: activeTokenA, p_student_key: '030106' }),
    });
    assert.equal(crossReadMock.status, 401, `Student A reading Student B must be rejected: ${crossReadMock.body}`);
    const crossWriteMock = client.handleMockSupabase({
      url: 'https://fqkdkmcqjswufzbvkram.supabase.co/rest/v1/rpc/priori_student_upsert_record',
      method: 'POST',
      postData: JSON.stringify({
        p_token: activeTokenA,
        p_student_key: '030106',
        p_paper_id: '114-math-g3',
        p_grade: '03',
        p_class_num: '1',
        p_seat: '06',
        p_score: 100,
        p_elapsed: 5,
        p_payload: {},
      }),
    });
    assert.equal(crossWriteMock.status, 401, `Student A writing Student B must be rejected: ${crossWriteMock.body}`);

    const classTamperMock = client.handleMockSupabase({
      url: 'https://fqkdkmcqjswufzbvkram.supabase.co/rest/v1/rpc/priori_student_upsert_record',
      method: 'POST',
      postData: JSON.stringify({
        p_token: activeTokenA,
        p_student_key: '030105',
        p_paper_id: '114-math-g3',
        p_grade: '04',
        p_class_num: '2',
        p_seat: '05',
        p_score: 100,
        p_elapsed: 5,
        p_payload: {},
      }),
    });
    assert.equal(classTamperMock.status, 401, `Student 3-1 tampering grade/class to 4-2 must be rejected: ${classTamperMock.body}`);

    const clsLoginMock = client.handleMockSupabase({
      url: 'https://fqkdkmcqjswufzbvkram.supabase.co/rest/v1/rpc/priori_teacher_login',
      method: 'POST',
      postData: JSON.stringify({ p_password: 'ci-mock-class31-pw' }),
    });
    const clsToken = JSON.parse(clsLoginMock.body).token;
    const clsSchoolRoster = client.handleMockSupabase({
      url: 'https://fqkdkmcqjswufzbvkram.supabase.co/rest/v1/rpc/priori_teacher_get_roster',
      method: 'POST',
      postData: JSON.stringify({ p_token: clsToken, p_roster_key: 'priori_school_roster_v1' }),
    });
    assert.equal(clsSchoolRoster.status, 401, `Single-class teacher must be denied school roster: ${clsSchoolRoster.body}`);
    const clsForeignClass = client.handleMockSupabase({
      url: 'https://fqkdkmcqjswufzbvkram.supabase.co/rest/v1/rpc/priori_teacher_list_records',
      method: 'POST',
      postData: JSON.stringify({ p_token: clsToken, p_grade: '3', p_class_num: '2' }),
    });
    assert.equal(clsForeignClass.status, 401, `Single-class teacher must be denied foreign class 3-2: ${clsForeignClass.body}`);

    // Teacher clicks '改設 4 碼' for 030105 -> sets '7788' -> revokes activeTokenA & invalidates old PIN '0512' while preserving records
    const resetUiRes = await client.eval(`
      (async () => {
        const setInput = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        };
        document.querySelector('button[data-binding-action="set-pin"][data-student-key="030105"]')?.click();
        await new Promise((r) => setTimeout(r, 150));
        const pinInput = document.getElementById('priori-teacher-pin-input');
        if (pinInput) setInput(pinInput, '7788');
        document.getElementById('priori-teacher-pin-submit')?.click();
        const deadline = Date.now() + 4000;
        let notice = '';
        while (Date.now() < deadline) {
          notice = document.getElementById('priori-teacher-binding-notice')?.innerText || '';
          if (notice.includes('030105') && notice.includes('7788')) break;
          await new Promise((r) => setTimeout(r, 100));
        }
        return { ok: notice.includes('030105') && notice.includes('7788'), notice };
      })()
    `);
    assert.equal(resetUiRes?.ok, true, `Teacher PIN reset UI failed for 030105: ${JSON.stringify(resetUiRes)}`);
    const staleTokenCheck = client.handleMockSupabase({
      url: 'https://fqkdkmcqjswufzbvkram.supabase.co/rest/v1/rpc/priori_student_get_records',
      method: 'POST',
      postData: JSON.stringify({ p_token: activeTokenA, p_student_key: '030105' }),
    });
    assert.equal(staleTokenCheck.status, 401, `Old student token must be invalidated after PIN reset: ${staleTokenCheck.body}`);
    const oldPinRejected = client.handleMockSupabase({
      url: 'https://fqkdkmcqjswufzbvkram.supabase.co/rest/v1/rpc/priori_student_login_seat',
      method: 'POST',
      postData: JSON.stringify({
        p_student_key: '030105',
        p_device_secret: 'attacker_device_secret_value_12345',
        p_transfer_pin: '0512',
      }),
    });
    assert.equal(JSON.parse(oldPinRejected.body).authorized, false, `Old PIN 0512 must fail after teacher reset to 7788: ${oldPinRejected.body}`);
    const newPinAccepted = client.handleMockSupabase({
      url: 'https://fqkdkmcqjswufzbvkram.supabase.co/rest/v1/rpc/priori_student_login_seat',
      method: 'POST',
      postData: JSON.stringify({
        p_student_key: '030105',
        p_device_secret: 'stu_030105_rebound_device_' + '9'.repeat(16),
        p_transfer_pin: '7788',
      }),
    });
    assert.equal(JSON.parse(newPinAccepted.body).authorized, true, `New teacher PIN 7788 must unlock 030105: ${newPinAccepted.body}`);
    console.log('✓ Test I (student self-4-digit PIN + existing-record protection + teacher single/batch 4-digit PIN + directory & reset isolation verified) passed');

    // Test J: Year-113 G3–G6 Sampling + Official 113 Eng G5 Q9 (1) / G6 Q23 (2) Grading + Legacy Record Reconciliation
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `window.__CI__ = true;`,
    });

    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori&paper=113-chinese-g6` });
    await sleep(600);
    const check113ChiG6 = await client.eval(`
      (() => {
        const bodyText = document.body.innerText || '';
        const noScratchpad = !Array.from(document.querySelectorAll('button')).some((b) => (b.innerText || '').trim() === '計算紙');
        return { ok: bodyText.includes('113 年') && bodyText.includes('六年級國語') && noScratchpad, noScratchpad };
      })()
    `);
    assert.equal(check113ChiG6?.ok, true, `113-chinese-g6 UI check failed: ${JSON.stringify(check113ChiG6)}`);

    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori&paper=113-english-g3` });
    await sleep(600);
    const check113EngG3 = await client.eval(`
      (async () => {
        const bodyText = document.body.innerText || '';
        const hasAudioBtn = Array.from(document.querySelectorAll('button')).some((b) => (b.innerText || '').includes('聽力') || (b.innerText || '').includes('播放'));
        const mp3Res = await fetch('/audio/priori/113/eng-g3/q01.mp3');
        const noScratchpad = !Array.from(document.querySelectorAll('button')).some((b) => (b.innerText || '').trim() === '計算紙');
        return { ok: bodyText.includes('113 年') && hasAudioBtn && mp3Res.ok && noScratchpad, hasAudioBtn, mp3Status: mp3Res.status, noScratchpad };
      })()
    `);
    assert.equal(check113EngG3?.ok, true, `113-english-g3 UI check failed: ${JSON.stringify(check113EngG3)}`);

    // Verify 113-english-g5 Q9 selects official (1) (index 0) -> scores 4 分
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori&paper=113-english-g5` });
    await sleep(600);
    const check113EngG5Q9 = await client.eval(`
      (async () => {
        document.querySelector('button[aria-label="跳到第 9 題"]')?.click();
        await new Promise((r) => setTimeout(r, 150));
        const radios = Array.from(document.querySelectorAll('[role="radio"]'));
        radios[0]?.click();
        await new Promise((r) => setTimeout(r, 150));
        document.querySelector('button[aria-label="跳到第 25 題"]')?.click();
        await new Promise((r) => setTimeout(r, 150));
        Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').includes('交卷核對'))?.click();
        await new Promise((r) => setTimeout(r, 180));
        Array.from(document.querySelectorAll('[role="dialog"] button')).find((b) => (b.innerText || '').includes('確定交卷'))?.click();
        await new Promise((r) => setTimeout(r, 400));
        const body = document.body.innerText || '';
        return { ok: body.includes('4 分') && body.includes('答對 1 / 25 題'), snippet: body.slice(0, 400) };
      })()
    `);
    assert.equal(check113EngG5Q9?.ok, true, `113-english-g5 Q9 official (1) grading failed: ${JSON.stringify(check113EngG5Q9)}`);

    // Verify 113-english-g6 Q23 selects official (2) (index 1) -> scores 4 分
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori&paper=113-english-g6` });
    await sleep(600);
    const check113EngG6Q23 = await client.eval(`
      (async () => {
        document.querySelector('button[aria-label="跳到第 23 題"]')?.click();
        await new Promise((r) => setTimeout(r, 150));
        const radios = Array.from(document.querySelectorAll('[role="radio"]'));
        radios[1]?.click();
        await new Promise((r) => setTimeout(r, 150));
        document.querySelector('button[aria-label="跳到第 25 題"]')?.click();
        await new Promise((r) => setTimeout(r, 150));
        Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').includes('交卷核對'))?.click();
        await new Promise((r) => setTimeout(r, 180));
        Array.from(document.querySelectorAll('[role="dialog"] button')).find((b) => (b.innerText || '').includes('確定交卷'))?.click();
        await new Promise((r) => setTimeout(r, 400));
        const body = document.body.innerText || '';
        return { ok: body.includes('4 分') && body.includes('答對 1 / 25 題'), snippet: body.slice(0, 400) };
      })()
    `);
    assert.equal(check113EngG6Q23?.ok, true, `113-english-g6 Q23 official (2) grading failed: ${JSON.stringify(check113EngG6Q23)}`);

    // Seed pre-fix miskeyed local record (where 113 Eng G5 Q9 had official answer 0 but cached 96 / wrongIds=['priori-113-eng-g5-q09']) -> Hub reconciles to 100 分!
    await client.eval(`
      (() => {
        const sid = '050101';
        localStorage.setItem('wutai_last_student_id', sid);
        const allCorrect = [2, 1, 1, 0, 2, 0, 0, 2, 0, 1, 2, 1, 1, 2, 0, 1, 2, 0, 0, 1, 1, 2, 0, 2, 2];
        const answers = {};
        const streaks = {};
        allCorrect.forEach((ans, idx) => {
          const qid = 'priori-113-eng-g5-q' + String(idx + 1).padStart(2, '0');
          answers[qid] = ans;
          streaks[qid] = idx === 8 ? 0 : 1;
        });
        localStorage.setItem('wutai_priori_v1_' + sid, JSON.stringify({
          '113-english-g5': {
            paperId: '113-english-g5',
            year: 113,
            subject: 'english',
            grade: 5,
            score: 96,
            latestScore: 96,
            firstScore: 96,
            correctCount: 24,
            firstCorrectCount: 24,
            totalCount: 25,
            wrongIds: ['priori-113-eng-g5-q09'],
            masteredIds: [],
            masteredCount: 0,
            latestAnswers: answers,
            firstAnswers: answers,
            streaks,
          },
        }));
      })()
    `);
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori` });
    await sleep(600);
    const reconciledCheck = await client.eval(`
      (async () => {
        await new Promise((r) => setTimeout(r, 350));
        Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').includes('暫時先用本機練習'))?.click();
        await new Promise((r) => setTimeout(r, 150));
        Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').includes('英語'))?.click();
        await new Promise((r) => setTimeout(r, 200));
        Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').includes('五年級'))?.click();
        await new Promise((r) => setTimeout(r, 250));
        const strip = Array.from(document.querySelectorAll('div.rounded-2xl')).find((el) => {
          const t = el.innerText || '';
          return t.includes('113 年') && t.includes('五年級英語');
        });
        const stripText = strip?.innerText || '';
        const noWrongChip = !document.body.innerText.includes('待訂正 1 題');
        return { ok: stripText.includes('100 分') && noWrongChip, stripText, noWrongChip };
      })()
    `);
    assert.equal(reconciledCheck?.ok, true, `Expected legacy pre-fix record to auto-reconcile to 100 分: ${JSON.stringify(reconciledCheck)}`);

    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori&paper=113-math-g5` });
    await sleep(600);
    const check113MathG5 = await client.eval(`
      (() => {
        const bodyText = document.body.innerText || '';
        const hasScratchpad = Array.from(document.querySelectorAll('button')).some((b) => (b.innerText || '').trim() === '計算紙');
        const imgEl = document.querySelector('img[src*="/assets/priori/113/math-g5/q01_fig.webp"]') || document.querySelector('img[src*="/assets/priori/113/math-g5/q01.webp"]');
        const imgOk = !!imgEl && imgEl.complete && imgEl.naturalWidth > 0;
        return { ok: bodyText.includes('113 年') && hasScratchpad && imgOk, hasScratchpad, imgOk, src: imgEl?.getAttribute('src') || null };
      })()
    `);
    assert.equal(check113MathG5?.ok, true, `113-math-g5 UI check failed: ${JSON.stringify(check113MathG5)}`);
    console.log('✓ Test J (Year-113 G3–G6 sampling, Eng G5 Q9 (1) / G6 Q23 (2) official grading & auto-reconciliation verified) passed');

    // Test K: Printable sheet renders all 22 figureImage <img> elements (complete && naturalWidth > 0) for 113-english-g5 + Year-112 smoke
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori&paper=113-english-g5` });
    await sleep(900);
    const printImgCheck = await client.eval(`
      (async () => {
        const imgs = Array.from(document.querySelectorAll('div[class*="-left-[99999px]"] img[src*="/assets/priori/113/eng-g5/q"]'));
        const deadline = Date.now() + 4000;
        while (Date.now() < deadline) {
          if (imgs.length >= 22 && imgs.every((img) => img.complete && img.naturalWidth > 0)) break;
          await new Promise((r) => setTimeout(r, 150));
        }
        const figImgs = imgs.filter((img) => /q\\d+_fig\\.webp/.test(img.getAttribute('src') || ''));
        const loadedFigs = figImgs.filter((img) => img.complete && img.naturalWidth > 0);
        return {
          totalPrintImgs: imgs.length,
          figCount: figImgs.length,
          loadedFigCount: loadedFigs.length,
          ok: figImgs.length === 22 && loadedFigs.length === 22,
        };
      })()
    `);
    assert.equal(printImgCheck?.ok, true, `Printable sheet 113-english-g5 figureImage DOM check failed: ${JSON.stringify(printImgCheck)}`);

    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori&paper=112-math-g3` });
    await sleep(600);
    const check112MathG3 = await client.eval(`
      (() => {
        const bodyText = document.body.innerText || '';
        const imgEl = document.querySelector('img[src*="/assets/priori/112/math-g3/"]');
        return { ok: bodyText.includes('112 年') && !!imgEl && imgEl.complete && imgEl.naturalWidth > 0 };
      })()
    `);
    assert.equal(check112MathG3?.ok, true, `112-math-g3 UI check failed: ${JSON.stringify(check112MathG3)}`);
    console.log('✓ Test K (Printable sheet 113-english-g5 22 figureImage DOM load + Year-112 112-math-g3 UI check) passed');

    // Test L: Spotlight interactive guide capsule button & modal flow
    await client.send('Page.navigate', { url: `${BASE_URL}/?view=priori` });
    await sleep(600);
    const guideCheck = await client.eval(`
      (async () => {
        const guideBtn = Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').includes('操作說明'));
        if (!guideBtn) return { ok: false, reason: 'missing-guide-btn' };
        guideBtn.click();
        await new Promise((r) => setTimeout(r, 200));
        const dlg = document.querySelector('[role="dialog"][aria-label*="互動式使用說明"]');
        const hasWelcome = (dlg?.innerText || '').includes('歡迎來到霧臺國小學習扶助練習網站說明');
        const studentBtn = Array.from(dlg?.querySelectorAll('button') || []).find((b) => (b.innerText || '').includes('我是學生'));
        studentBtn?.click();
        await new Promise((r) => setTimeout(r, 300));
        const img = dlg?.querySelector('img');
        const imgLoaded = !!img && img.complete && img.naturalWidth > 0;
        const nextBtn = Array.from(dlg?.querySelectorAll('button') || []).find((b) => (b.innerText || '').trim() === '下一步');
        nextBtn?.click();
        await new Promise((r) => setTimeout(r, 200));
        const step2Ok = (dlg?.innerText || '').includes('2 / 5');
        dlg?.querySelector('button[aria-label="關閉導覽"]')?.click();
        await new Promise((r) => setTimeout(r, 150));
        const closed = !document.querySelector('[role="dialog"][aria-label*="互動式使用說明"]');
        return { ok: hasWelcome && imgLoaded && step2Ok && closed, hasWelcome, imgLoaded, step2Ok, closed };
      })()
    `);
    assert.equal(guideCheck?.ok, true, `Spotlight guide E2E check failed: ${JSON.stringify(guideCheck)}`);
    console.log('✓ Test L (Spotlight interactive guide capsule, student 5-step WebP load & navigation) passed');

    assert.equal(client.exceptions.length, 0, `Page exceptions: ${client.exceptions.join('; ')}`);
    assert.equal(client.consoleErrors.length, 0, `Console errors: ${client.consoleErrors.join('; ')}`);
    console.log('\n🎉 ALL PRIORI ROUTE 1 E2E VERIFICATIONS PASSED WITH 0 CONSOLE ERRORS & 0 EXCEPTIONS!');
  } finally {
    client?.close();
    try { chrome?.kill(); } catch {}
    try { server?.kill(); } catch {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
      fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
    } catch {}
  }
}

run().catch((err) => {
  console.error('E2E FAILED:', err);
  process.exit(1);
});
