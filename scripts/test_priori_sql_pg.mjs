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

  // 10. Anti-preemption: anonymous attacker CANNOT claim unbound/migrated seat 030105!
  const dev1 = 'device_ipad_0001_secret_token_alpha';
  const dev2 = 'device_ipad_0002_secret_token_beta';
  const hijackAttempt = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, $3, $4)`,
    ['030105', dev1, '9999', '123456']
  );
  assert.equal(hijackAttempt.authorized, false);
  assert.equal(hijackAttempt.status, 'needs_activation');
  assert.equal(hijackAttempt.has_active_code, false);

  // Teacher issues one-time activation code for 030105
  const actIssue = await callRpc(
    db,
    'anon',
    `SELECT public.priori_teacher_issue_activation_code($1, $2)`,
    [adminLogin.token, '030105']
  );
  assert.equal(actIssue.ok, true);
  assert.match(actIssue.activation_code, /^\d{6}$/);

  // Wrong activation code fails cleanly
  const badActTry = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, $3, $4)`,
    ['030105', dev1, '2468', actIssue.activation_code === '000000' ? '111111' : '000000']
  );
  assert.equal(badActTry.authorized, false);
  assert.equal(badActTry.status, 'invalid_activation_code');

  // Valid activation code + 4-digit PIN activates & returns token, and CANNOT be reused!
  const activated = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, $3, $4)`,
    ['030105', dev1, '2468', actIssue.activation_code]
  );
  assert.equal(activated.authorized, true);
  assert.equal(activated.status, 'activated_new');
  const stuToken1 = activated.token;

  // Same iPad needs ZERO activation code and ZERO PIN!
  const sameDeviceLogin = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, NULL, NULL)`,
    ['030105', dev1]
  );
  assert.equal(sameDeviceLogin.authorized, true);
  assert.equal(sameDeviceLogin.status, 'trusted_device');

  // Reusing the spent activation code on device 2 MUST be ignored/rejected -> requires Transfer PIN
  const reuseTry = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, NULL, $3)`,
    ['030105', dev2, actIssue.activation_code]
  );
  assert.equal(reuseTry.authorized, false);
  assert.equal(reuseTry.status, 'pin_required');

  // Device 2 unlocks with self-chosen 4-digit PIN '2468'
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
  console.log('✓ One-time activation, same-device passwordless, and 2nd-device 4-digit PIN verified');

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
      callRpc(db, 'anon', `SELECT public.priori_teacher_reset_student_binding($1, '030105')`, [t42Login.token]),
    (err) => err.code === '42501'
  );
  console.log('✓ Student class-tampering 42501 & Class-4-2 directory isolation passed');

  // 12. Teacher reset invalidates old tokens, blocks anonymous preemption, and preserves migrated record
  const resetRes = await callRpc(
    db,
    'anon',
    `SELECT public.priori_teacher_reset_student_binding($1, $2)`,
    [adminLogin.token, '030105']
  );
  assert.equal(resetRes.ok, true);
  assert.match(resetRes.activation_code, /^\d{6}$/);

  await assert.rejects(
    async () => callRpc(db, 'anon', `SELECT public.priori_student_get_records($1, $2)`, [stuToken1, '030105']),
    (err) => err.code === '42501',
    'Reset binding must immediately revoke previous student tokens'
  );

  // Attacker trying old PIN '2468' after reset CANNOT hijack seat without teacher new activation code
  const postResetHijack = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, '2468', NULL)`,
    ['030105', 'attacker_device_secret_xyz_123456']
  );
  assert.equal(postResetHijack.authorized, false);
  assert.equal(postResetHijack.status, 'invalid_activation_code');

  // Real student activates with new activation code and new 4-digit PIN '1357' -> keeps score = 12
  const reActivated = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat($1, $2, '1357', $3)`,
    ['030105', dev2, resetRes.activation_code]
  );
  assert.equal(reActivated.authorized, true);
  const preservedRecords = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_get_records($1, $2)`,
    [reActivated.token, '030105']
  );
  assert.equal(preservedRecords.length, 1);
  assert.equal(preservedRecords[0].score, 12, 'Teacher reset + reactivation must preserve 100% of records');
  console.log('✓ Post-reset anti-preemption & zero-data-loss reactivation verified');

  // 13. Teacher binding status listing & bulk class activation code issuance + preserving existing active codes
  const single030101 = await callRpc(
    db,
    'anon',
    `SELECT public.priori_teacher_issue_activation_code($1, '030101')`,
    [adminLogin.token]
  );
  assert.equal(single030101.ok, true);
  const code030101Before = single030101.activation_code;

  const bindings31 = await callRpc(
    db,
    'anon',
    `SELECT public.priori_teacher_list_bindings($1, '3', '1')`,
    [adminLogin.token]
  );
  assert.equal(bindings31.length, 6, 'Class 3-1 directory should contain 6 seats');
  const bind030105 = bindings31.find((b) => b.student_key === '030105');
  assert.equal(bind030105?.status, 'bound');
  assert.equal(bind030105?.device_count, 1);
  const bind030101 = bindings31.find((b) => b.student_key === '030101');
  assert.equal(bind030101?.status, 'awaiting_activation');

  // Default bulk issue (p_reissue_existing = false) MUST skip BOTH bound 030105 AND awaiting-valid 030101!
  const bulk31 = await callRpc(
    db,
    'anon',
    `SELECT public.priori_teacher_issue_class_activation_codes($1, '3', '1', FALSE)`,
    [adminLogin.token]
  );
  assert.equal(bulk31.length, 4, 'Bulk issuance must skip bound 030105 AND active awaiting 030101 -> 4 remaining seats');
  assert.ok(!bulk31.some((x) => x.student_key === '030105' || x.student_key === '030101'));

  // Explicit reissue (p_reissue_existing = true) replaces awaiting 030101 with a fresh code while keeping bound 030105 untouched
  const reissue31 = await callRpc(
    db,
    'anon',
    `SELECT public.priori_teacher_issue_class_activation_codes($1, '3', '1', TRUE)`,
    [adminLogin.token]
  );
  assert.equal(reissue31.length, 5, 'Explicit class reissue covers all 5 non-bound seats');
  const reissued030101 = reissue31.find((x) => x.student_key === '030101');
  assert.ok(reissued030101 && reissued030101.activation_code !== code030101Before);

  // Old code before explicit reissue fails; new code succeeds
  const oldCodeFail = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat('030101', $1, '1122', $2)`,
    [dev1, code030101Before]
  );
  assert.equal(oldCodeFail.authorized, false);
  assert.equal(oldCodeFail.status, 'invalid_activation_code');
  const newCodeOk = await callRpc(
    db,
    'anon',
    `SELECT public.priori_student_login_seat('030101', $1, '1122', $2)`,
    [dev1, reissued030101.activation_code]
  );
  assert.equal(newCodeOk.authorized, true);

  await assert.rejects(
    async () =>
      callRpc(db, 'anon', `SELECT public.priori_teacher_issue_class_activation_codes($1, '3', '1', FALSE)`, [t42Login.token]),
    (err) => err.code === '42501',
    'Class 4-2 teacher must not bulk-issue codes for Class 3-1'
  );
  console.log('✓ Teacher binding list, non-destructive bulk class issuance & explicit reissue verified');

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
      PRIORI_TEACHER_PASSWORD: '',
      PRIORI_CLASS_TEACHER_PASSWORD: '',
    });
    assert.equal(roRes.code, 0, `Strict read-only mode failed: ${roRes.stderr}\n${roRes.stdout}`);
    assert.ok(roRes.stdout.includes('STRICT READ-ONLY AUDIT PASSED'));
    const forbiddenPaths = recordedHits.filter(
      (h) =>
        (h.method === 'POST' && !h.pathname.startsWith('/rest/v1/rpc/')) ||
        h.pathname.includes('priori_student_login_seat') ||
        h.pathname.includes('priori_student_upsert_record') ||
        h.pathname.includes('priori_teacher_reset_student_binding') ||
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
