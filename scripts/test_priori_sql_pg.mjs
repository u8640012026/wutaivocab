import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

const ROOT = process.cwd();
const SCHEMA_SQL_PATH = path.join(ROOT, 'supabase_schema.sql');
const SECURITY_SQL_PATH = path.join(ROOT, 'supabase_priori_security.sql');

async function callRpc(db, role, fnSql, params = []) {
  await db.exec('BEGIN;');
  try {
    await db.exec(`SET LOCAL ROLE ${role};`);
    const res = await db.query(fnSql, params);
    await db.exec('COMMIT;');
    return res.rows?.[0] ? Object.values(res.rows[0])[0] : null;
  } catch (err) {
    try {
      await db.exec('ROLLBACK;');
    } catch {}
    throw err;
  }
}

async function run() {
  console.log('=== PRIORI Real PostgreSQL (PGlite + pgcrypto) Full SQL & Security Audit ===');
  const schemaSql = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
  const rawSecuritySql = fs.readFileSync(SECURITY_SQL_PATH, 'utf8');

  assert.ok(
    rawSecuritySql.includes('__REPLACE_WITH_ADMIN_NEW_PASSWORD__'),
    'supabase_priori_security.sql must keep placeholder before deployment'
  );

  const db = new PGlite({ extensions: { pgcrypto } });

  // Emulate Supabase roles & extensions schema
  await db.exec(`
    CREATE SCHEMA IF NOT EXISTS extensions;
    CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
      END IF;
    END $$;
    GRANT USAGE ON SCHEMA public TO anon, authenticated;
    GRANT USAGE ON SCHEMA extensions TO anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
  `);

  // 1. Apply base schema
  await db.exec(schemaSql);

  // 2. Seed tricky legacy leaderboard rows BEFORE migration:
  //    - Older 8分 row vs Newer 12分 row (with earlier created_at on the 12分 row to verify updatedAt wins!)
  //    - Unparseable corrupt JSON row
  //    - Valid priori-roster row + normal vocab row (vocab row must survive intact!)
  const oldPayload8 = JSON.stringify({
    studentKey: '030105',
    paperId: '114-math-g3',
    score: 8,
    latestScore: 8,
    firstScore: 8,
    firstCorrectCount: 2,
    firstAnswers: { q1: 3, q2: 1 },
    firstSubmittedAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  });
  const newPayload12 = JSON.stringify({
    studentKey: '030105',
    paperId: '114-math-g3',
    score: 12,
    latestScore: 12,
    firstScore: 12,
    firstCorrectCount: 3,
    firstAnswers: { q1: 3, q2: 1, q3: 2 },
    firstSubmittedAt: '2026-11-02T09:00:00Z',
    updatedAt: '2026-11-02T09:00:00Z',
  });
  const badFieldPayload = JSON.stringify({
    studentKey: '030106',
    paperId: '114-math-g3',
    latestScore: 'not-an-int',
    updatedAt: '2026-11-02T10:00:00Z',
  });

  await db.query(
    `INSERT INTO public.leaderboard (device_id, name, mode, book, score, time, week, created_at)
     VALUES
       ('dev_1', '030105', 'priori-record', $1, 12, 50, 0, '2026-11-01T07:00:00Z'),
       ('dev_2', '030105', 'priori-record', $2, 8, 40, 0, '2026-11-01T10:00:00Z'),
       ('dev_bad_field', '030106', 'priori-record', $3, 0, 10, 0, '2026-11-01T10:30:00Z'),
       ('dev_bad', '030105', 'priori-record', '{not-valid-json', 0, 10, 0, '2026-11-01T11:00:00Z'),
       ('dev_roster', 'roster', 'priori-roster', '{"version":1,"entries":{}}', 0, 12, 0, '2026-11-01T12:00:00Z'),
       ('dev_vocab', '巴奈', 'vocab', '1', 100, 30, 10, '2026-11-02T12:00:00Z')`,
    [newPayload12, oldPayload8, badFieldPayload]
  );

  // 3. Unreplaced placeholder MUST abort safely inside DO block without deleting legacy leaderboard
  await assert.rejects(
    async () => db.exec(rawSecuritySql),
    /替換為至少 8 碼|__REPLACE_WITH_ADMIN_NEW_PASSWORD__/,
    'Unreplaced admin password placeholder must fail loudly'
  );
  const preLegacyLeft = await db.query(
    `SELECT COUNT(*)::int AS cnt FROM public.leaderboard WHERE mode IN ('priori-record', 'priori-roster')`
  );
  assert.equal(preLegacyLeft.rows[0].cnt, 5, 'Failed placeholder guard must roll back whole script');

  // 4. Execute full SQL top-to-bottom with rotated admin password
  const patchedSql = rawSecuritySql.replaceAll('__REPLACE_WITH_ADMIN_NEW_PASSWORD__', 'WutaiAdmin!2026Secure');
  await db.exec(patchedSql);
  console.log('✓ Full supabase_priori_security.sql executed cleanly top-to-bottom (0 syntax/42883 errors)');

  // 5. Verify re-running (idempotency) ALSO succeeds
  await db.exec(patchedSql);
  console.log('✓ Idempotent re-execution passed');

  // 6. Verify deterministic lossless migration + quarantine + backup
  const backupRes = await db.query(`SELECT migration_status FROM public.priori_legacy_leaderboard_backup ORDER BY backed_up_at`);
  assert.equal(backupRes.rows.length, 5, 'All 5 legacy PRIORI rows must be backed up');
  const issuesRes = await db.query(`SELECT issue_type FROM public.priori_legacy_migration_issues`);
  const issueTypes = issuesRes.rows.map((r) => r.issue_type);
  assert.ok(issueTypes.includes('unparseable_json'), 'Corrupt legacy JSON must be logged to issues table');
  assert.ok(issueTypes.includes('invalid_field_type'), 'Non-integer JSON score must be quarantined instead of raising 22P02');
  assert.ok(issueTypes.includes('merged_duplicate'), 'Duplicate (030105, 114-math-g3) must be logged as merged_duplicate');

  const migratedRowRes = await db.query(
    `SELECT score, grade, class_num, seat, payload FROM public.priori_records WHERE record_key = 'priori_030105_114-math-g3'`
  );
  assert.equal(migratedRowRes.rows.length, 1);
  assert.equal(migratedRowRes.rows[0].score, 12, 'Newer 12分 row MUST beat older 8分 row regardless of created_at');
  assert.equal(migratedRowRes.rows[0].payload?.firstScore, 8, 'Earlier firstScore (8) MUST survive even when newer duplicate row also carries firstScore (12)');
  assert.equal(migratedRowRes.rows[0].payload?.firstCorrectCount, 2, 'Earlier firstCorrectCount (2) MUST survive alongside firstScore (8)');
  assert.deepEqual(migratedRowRes.rows[0].payload?.firstAnswers, { q1: 3, q2: 1 }, 'Earlier firstAnswers MUST survive');
  assert.equal(new Date(migratedRowRes.rows[0].payload?.firstSubmittedAt).toISOString(), '2026-11-01T08:00:00.000Z');

  const remainingPrioris = await db.query(
    `SELECT COUNT(*)::int AS cnt FROM public.leaderboard WHERE mode IN ('priori-record', 'priori-roster')`
  );
  assert.equal(remainingPrioris.rows[0].cnt, 0, 'All legacy PRIORI rows must be deleted from public.leaderboard');
  const survivingVocab = await db.query(
    `SELECT COUNT(*)::int AS cnt FROM public.leaderboard WHERE mode = 'vocab'`
  );
  assert.equal(survivingVocab.rows[0].cnt, 1, 'Non-PRIORI leaderboard rows must stay untouched');

  const chkConstraintRes = await db.query(
    `SELECT conname, convalidated FROM pg_constraint WHERE conrelid = 'public.leaderboard'::regclass AND conname = 'chk_leaderboard_no_priori'`
  );
  assert.equal(chkConstraintRes.rows.length, 1, 'chk_leaderboard_no_priori must exist on public.leaderboard');
  assert.equal(chkConstraintRes.rows[0].convalidated, true, 'chk_leaderboard_no_priori must be fully validated inside the atomic migration block');

  const lbPoliciesRes = await db.query(
    `SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'leaderboard' ORDER BY policyname`
  );
  assert.deepEqual(
    lbPoliciesRes.rows.map((r) => r.policyname),
    [
      'Allow public delete leaderboard',
      'Allow public insert leaderboard',
      'Allow public read leaderboard',
      'Allow public update leaderboard',
    ]
  );

  const pendingBackupRes = await db.query(
    `SELECT COUNT(*)::int AS cnt FROM public.priori_legacy_leaderboard_backup WHERE migration_status = 'backed_up'`
  );
  assert.equal(pendingBackupRes.rows[0].cnt, 0, 'Every locked backup row must reach a terminal migration_status before deletion');
  console.log('✓ Legacy deterministic migration (12分 latest + 8分 earliest baseline + validated constraint/policies + terminal backup states + vocab intact) passed');

  // 7. Create a single-class teacher (4-2) to verify strict class scoping
  await db.exec(`
    INSERT INTO public.priori_teacher_auth (teacher_id, display_name, auth_algo, pass_salt, pass_hash, allowed_classes, is_active)
    VALUES ('teacher_402', '四年乙班導師', 'bcrypt', '', extensions.crypt('Class42Pass!99', extensions.gen_salt('bf', 8)), ARRAY['4-2'], TRUE)
    ON CONFLICT (teacher_id) DO UPDATE SET pass_hash = EXCLUDED.pass_hash, allowed_classes = EXCLUDED.allowed_classes, is_active = TRUE;
  `);

  // 8. Verify anon direct table access & chk_leaderboard_no_priori are blocked
  for (const tbl of [
    'priori_student_directory',
    'priori_records',
    'priori_rosters',
    'priori_student_bindings',
    'priori_student_sessions',
    'priori_teacher_auth',
    'priori_teacher_sessions',
    'priori_legacy_leaderboard_backup',
    'priori_legacy_migration_issues',
  ]) {
    await assert.rejects(
      async () => callRpc(db, 'anon', `SELECT * FROM public.${tbl} LIMIT 1`),
      /permission denied/i,
      `Expected anon SELECT on ${tbl} to be denied`
    );
  }
  const anonVocabCount = await callRpc(
    db,
    'anon',
    `SELECT COUNT(*)::int FROM public.leaderboard WHERE mode = 'vocab'`
  );
  assert.equal(anonVocabCount, 1, 'Normal vocab leaderboard rows must stay readable to anon');

  await assert.rejects(
    async () =>
      callRpc(
        db,
        'anon',
        `INSERT INTO public.leaderboard (device_id, name, mode, book, score, time, week) VALUES ('x', 'y', 'priori-record', '{}', 0, 0, 0)`
      ),
    /row-level security|chk_leaderboard_no_priori/i
  );
  console.log('✓ Direct anon table access across all 9 tables & leaderboard check constraint rejected');

  // 9. Verify legacy password is rejected and admin teacher login succeeds as anon
  const legacyLogin = await callRpc(db, 'anon', `SELECT public.priori_teacher_login($1)`, ['wt7902230']);
  assert.equal(legacyLogin.authorized, false);
  const adminLogin = await callRpc(db, 'anon', `SELECT public.priori_teacher_login($1)`, ['WutaiAdmin!2026Secure']);
  assert.equal(adminLogin.authorized, true);
  assert.ok(adminLogin.token);
  const t42Login = await callRpc(db, 'anon', `SELECT public.priori_teacher_login($1)`, ['Class42Pass!99']);
  assert.equal(t42Login.authorized, true);

  // 10. Blank seat self-setup vs migrated unbound seat protection
  const dev1 = 'device_ipad_0001_secret_token_alpha';
  const dev2 = 'device_ipad_0002_secret_token_beta';

  // 10A. Blank seat (030102 has 0 records) -> student can self-set 4-digit PIN directly with zero activation code!
  const blankCheck = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, NULL, NULL)`,
    ['030102', dev1]
  );
  assert.equal(blankCheck.authorized, false);
  assert.equal(blankCheck.status, 'needs_pin_setup');

  const blankBound = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, $3, NULL)`,
    ['030102', dev1, '1212']
  );
  assert.equal(blankBound.authorized, true);
  assert.equal(blankBound.status, 'bound_new');

  // 10B. Migrated unbound seat WITH pre-existing records (030105) CANNOT be anonymously claimed!
  const hijackAttempt = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, $3, NULL)`,
    ['030105', dev1, '9999']
  );
  assert.equal(hijackAttempt.authorized, false);
  assert.equal(hijackAttempt.status, 'needs_teacher_pin');
  assert.equal(hijackAttempt.has_records, true);

  // Teacher sets initial custom 4-digit PIN '2468' for 030105
  const setPin05 = await callRpc(
    db,
    'anon',
    `SELECT public.priori_teacher_set_student_pin($1, $2, $3)`,
    [adminLogin.token, '030105', '2468']
  );
  assert.equal(setPin05.ok, true);

  // Wrong PIN fails cleanly
  const badPinTry = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, $3, NULL)`,
    ['030105', dev1, '0000']
  );
  assert.equal(badPinTry.authorized, false);
  assert.equal(badPinTry.status, 'invalid_pin');

  // Correct teacher-set 4-digit PIN '2468' logs in on device 1 & binds device 1
  const dev1Ok = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, $3, NULL)`,
    ['030105', dev1, '2468']
  );
  assert.equal(dev1Ok.authorized, true);
  assert.equal(dev1Ok.status, 'pin_verified');
  const stuToken1 = dev1Ok.token;

  // Same iPad needs ZERO PIN!
  const sameDeviceLogin = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, NULL, NULL)`,
    ['030105', dev1]
  );
  assert.equal(sameDeviceLogin.authorized, true);
  assert.equal(sameDeviceLogin.status, 'trusted_device');

  // Device 2 prompts for PIN and unlocks with '2468'
  const dev2Prompt = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, NULL, NULL)`,
    ['030105', dev2]
  );
  assert.equal(dev2Prompt.authorized, false);
  assert.equal(dev2Prompt.status, 'pin_required');

  const dev2PinOk = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, $3, NULL)`,
    ['030105', dev2, '2468']
  );
  assert.equal(dev2PinOk.authorized, true);
  assert.equal(dev2PinOk.status, 'pin_verified');

  // Student reads migrated 12分 record cleanly
  const myRecords = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_get_records($1, $2)`,
    [stuToken1, '030105']
  );
  assert.equal(myRecords.length, 1);
  assert.equal(myRecords[0].score, 12);
  console.log('✓ Blank self-PIN, migrated-record anti-preemption, same-device passwordless, and 2nd-device PIN verified');

  // 11. Verify student CANNOT read/write sibling seat OR tamper class/grade/seat to 4-2!
  await assert.rejects(
    async () =>
      callRpc(db, 'anon', `SELECT public.priori_student_get_records($1, $2)`, [stuToken1, '030106']),
    (err) => err.code === '42501'
  );
  await assert.rejects(
    async () =>
      callRpc(
        db,
        'anon',
        `SELECT public.priori_student_upsert_record($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [stuToken1, '030105', '114-math-g3', '4', '2', '05', 100, 10, JSON.stringify({ studentKey: '030105' })]
      ),
    (err) => err.code === '42501',
    'Tampering p_grade/p_class_num to 4-2 MUST throw 42501'
  );

  // Even if legacy DB row had wrong grade/class_num columns, teacher 4-2 MUST NOT see 030105!
  await db.exec(`UPDATE public.priori_records SET grade = '4', class_num = '2' WHERE student_key = '030105';`);
  const t42Records = await callRpc(
    db,
    'anon',
    `SELECT public.priori_teacher_list_records($1, NULL, '4', '2')`,
    [t42Login.token]
  );
  assert.equal(t42Records.length, 0, 'Teacher 4-2 must see ZERO rows for 030105 based on priori_student_directory');

  await assert.rejects(
    async () =>
      callRpc(db, 'anon', `SELECT public.priori_teacher_list_records($1, NULL, '3', '1')`, [t42Login.token]),
    (err) => err.code === '42501'
  );
  await assert.rejects(
    async () =>
      callRpc(db, 'anon', `SELECT public.priori_teacher_get_roster($1, 'priori_school_roster_v1')`, [t42Login.token]),
    (err) => err.code === '42501'
  );
  await assert.rejects(
    async () =>
      callRpc(db, 'anon', `SELECT public.priori_teacher_set_student_pin($1, '030105', '9999')`, [t42Login.token]),
    (err) => err.code === '42501'
  );
  console.log('✓ Student class-tampering 42501 & Class-4-2 directory isolation passed');

  // 12. Teacher sets a new 4-digit PIN ('1357') -> revokes old tokens/devices immediately without unbinding window & preserves records
  const resetRes = await callRpc(
    db,
    'anon',
    `SELECT public.priori_teacher_set_student_pin($1, $2, $3)`,
    [adminLogin.token, '030105', '1357']
  );
  assert.equal(resetRes.ok, true);

  await assert.rejects(
    async () => callRpc(db, 'anon', `SELECT public.priori_student_get_records($1, $2)`, [stuToken1, '030105']),
    (err) => err.code === '42501',
    'Setting new PIN must immediately revoke previous student tokens'
  );

  // Old trusted device dev1 is revoked too (must re-enter new teacher-set PIN; old PIN '2468' is rejected!)
  const oldPinTry = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, '2468', NULL)`,
    ['030105', dev1]
  );
  assert.equal(oldPinTry.authorized, false);
  assert.equal(oldPinTry.status, 'invalid_pin');

  // Real student logs in directly with teacher-chosen 4-digit PIN '1357' -> keeps score = 12
  const reSignedIn = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, '1357', NULL)`,
    ['030105', dev2]
  );
  assert.equal(reSignedIn.authorized, true);
  assert.equal(reSignedIn.status, 'pin_verified');
  const preservedRecords = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_get_records($1, $2)`,
    [reSignedIn.token, '030105']
  );
  assert.equal(preservedRecords.length, 1);
  assert.equal(preservedRecords[0].score, 12, 'Teacher custom PIN reset must preserve 100% of records');
  console.log('✓ Custom teacher PIN reset revokes old sessions & preserves 100% of records');

  // 13. Teacher binding status listing & batch class/school custom 4-digit PIN setting
  const bindings31 = await callRpc(
    db,
    'anon',
    `SELECT public.priori_teacher_list_bindings($1, '3', '1')`,
    [adminLogin.token]
  );
  assert.equal(bindings31.length, 6, 'Class 3-1 directory should contain 6 seats');
  assert.equal(bindings31.find((b) => b.student_key === '030105')?.status, 'bound');
  assert.equal(bindings31.find((b) => b.student_key === '030102')?.status, 'bound');
  assert.equal(bindings31.find((b) => b.student_key === '030101')?.status, 'unbound');

  // Batch set with p_overwrite_existing = FALSE skips already-bound 030102 & 030105, sets remaining 4 unbound seats
  const batchSkip = await callRpc(
    db,
    'anon',
    `SELECT public.priori_teacher_set_class_pins($1, '3', '1', '3344', FALSE)`,
    [adminLogin.token]
  );
  assert.equal(batchSkip.updated_count, 4);
  assert.equal(batchSkip.skipped_count, 2);

  // Confirm 030101 can log in with batch PIN '3344' while 030102 still uses '1212'
  const login01Batch = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat('030101', $1, '3344', NULL)`,
    [dev1]
  );
  assert.equal(login01Batch.authorized, true);
  const login02Intact = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat('030102', $1, '1212', NULL)`,
    [dev2]
  );
  assert.equal(login02Intact.authorized, true);

  // Batch overwrite (p_overwrite_existing = TRUE) resets all 6 seats in Class 3-1 to '8899' and revokes prior device/PINs
  const batchOverwrite = await callRpc(
    db,
    'anon',
    `SELECT public.priori_teacher_set_class_pins($1, '3', '1', '8899', TRUE)`,
    [adminLogin.token]
  );
  assert.equal(batchOverwrite.updated_count, 6);
  const old02Rejected = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat('030102', $1, NULL, NULL)`,
    [dev1]
  );
  assert.equal(old02Rejected.authorized, false);
  assert.equal(old02Rejected.status, 'pin_required');
  const new02Accepted = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat('030102', $1, '8899', NULL)`,
    [dev1]
  );
  assert.equal(new02Accepted.authorized, true);

  // Class 4-2 teacher CANNOT batch-set Class 3-1 or outside their scope!
  await assert.rejects(
    async () =>
      callRpc(db, 'anon', `SELECT public.priori_teacher_set_class_pins($1, '3', '1', '0000', TRUE)`, [t42Login.token]),
    (err) => err.code === '42501',
    'Class 4-2 teacher must not set PINs for Class 3-1'
  );
  console.log('✓ Teacher binding list, selective batch PIN init & full-class custom PIN reset verified');

  await db.close();

  // 14. Verify verify_priori_supabase_rls.mjs default mode issues ZERO write/login/reset/student-seat probes
  const recordedHits = [];
  const mockServer = http.createServer((req, res) => {
    const reqUrl = new URL(req.url, 'http://127.0.0.1');
    recordedHits.push({ method: req.method, pathname: reqUrl.pathname, search: reqUrl.search });
    if (req.method === 'GET' && reqUrl.pathname === '/rest/v1/leaderboard') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('[]');
      return;
    }
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: '42501', message: 'Forbidden in read-only audit check' }));
  });
  await new Promise((resolve) => mockServer.listen(0, '127.0.0.1', resolve));
  const { port } = mockServer.address();
  const auditScriptPath = path.join(ROOT, 'scripts', 'verify_priori_supabase_rls.mjs');

  const runScript = (extraEnv) =>
    new Promise((resolve) => {
      const child = spawn(process.execPath, [auditScriptPath], {
        env: { ...process.env, VITE_SUPABASE_URL: `http://127.0.0.1:${port}`, ...extraEnv },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d) => (stdout += d));
      child.stderr.on('data', (d) => (stderr += d));
      child.on('close', (code) => resolve({ code, stdout, stderr }));
    });

  try {
    const roRes = await runScript({
      PRIORI_TEST_DB: '',
      PRIORI_ENABLE_WRITE_PROBES: '',
      PRIORI_TEST_STUDENT_ISOLATION: '',
      PRIORI_TEACHER_PASSWORD: 'lingering-env-pw-must-be-ignored',
      PRIORI_CLASS_TEACHER_PASSWORD: 'lingering-cls-pw-must-be-ignored',
    });
    assert.equal(roRes.code, 0, `Strict read-only mode failed: ${roRes.stderr}\n${roRes.stdout}`);
    assert.ok(roRes.stdout.includes('STRICT READ-ONLY AUDIT PASSED'));
    const forbiddenPaths = recordedHits.filter(
      (h) =>
        (h.method === 'POST' && !h.pathname.startsWith('/rest/v1/rpc/')) ||
        h.pathname.includes('priori_student_login_seat') ||
        h.pathname.includes('priori_student_upsert_record') ||
        h.pathname.includes('priori_teacher_set_student_pin') ||
        h.pathname.includes('priori_teacher_set_class_pins') ||
        h.pathname.includes('priori_teacher_login')
    );
    assert.deepEqual(forbiddenPaths, [], `Default read-only audit MUST NOT execute write/login probes, got: ${JSON.stringify(forbiddenPaths)}`);

    const unsafeGuardRes = await runScript({ PRIORI_TEST_DB: '', PRIORI_ENABLE_WRITE_PROBES: '1' });
    assert.notEqual(unsafeGuardRes.code, 0, 'Write probes without PRIORI_TEST_DB=1 must refuse to run');
    console.log('✓ verify_priori_supabase_rls.mjs strict read-only guard verified (0 table writes, 0 login/reset probes)');
  } finally {
    await new Promise((resolve) => mockServer.close(resolve));
  }

  console.log('\n🎉 ALL POSTGRESQL SQL, MIGRATION & SECURITY AUDIT ASSERTIONS PASSED!');
}

run().catch((err) => {
  console.error('❌ SQL PG Audit failed:', err);
  process.exit(1);
});
