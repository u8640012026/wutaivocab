import assert from 'node:assert/strict';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://fqkdkmcqjswufzbvkram.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_M9phUn6LH1yeVA9NbIXesg_tVABCW5z';

const IS_TEST_DB = process.env.PRIORI_TEST_DB === '1';
const ENABLE_WRITE_PROBES = process.env.PRIORI_ENABLE_WRITE_PROBES === '1';
const ENABLE_ISOLATION_TEST = process.env.PRIORI_TEST_STUDENT_ISOLATION === '1';
const ALLOW_TEST_DB_WRITES = IS_TEST_DB && ENABLE_WRITE_PROBES;

if ((ENABLE_WRITE_PROBES || ENABLE_ISOLATION_TEST) && !IS_TEST_DB) {
  console.error(
    '❌ Refusing to run write/login/isolation probes without PRIORI_TEST_DB=1. Default mode against production is strictly read-only.'
  );
  process.exit(1);
}

async function restCall(path, { method = 'GET', body = undefined } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}
  return { status: res.status, text, json };
}

function isDenied(r) {
  return (
    r.status === 401 ||
    r.status === 403 ||
    r.json?.code === '42501' ||
    String(r.json?.message || '').toLowerCase().includes('forbidden') ||
    String(r.json?.message || '').toLowerCase().includes('unauthorized')
  );
}

async function run() {
  console.log(`=== PRIORI Supabase RLS & RPC Permission Audit (${SUPABASE_URL}) ===`);

  // 1. Direct table queries MUST be blocked by RLS / REVOKE ALL
  for (const tbl of [
    'priori_records?select=*',
    'priori_rosters?select=*',
    'priori_student_directory?select=*',
    'priori_student_bindings?select=*',
    'priori_student_sessions?select=*',
    'priori_teacher_auth?select=*',
    'priori_teacher_sessions?select=*',
    'priori_legacy_leaderboard_backup?select=*',
    'priori_legacy_migration_issues?select=*',
  ]) {
    const r = await restCall(tbl);
    if (r.status === 404 || r.json?.code === 'PGRST205') {
      console.error(
        `❌ ${tbl.split('?')[0]} 尚未建立。請先至 Supabase Dashboard -> SQL Editor 執行 supabase_priori_security.sql！`
      );
      process.exit(2);
    }
    assert.ok(
      isDenied(r),
      `Expected direct anonymous query on ${tbl} to be blocked, got HTTP ${r.status}: ${r.text}`
    );
    console.log(`✓ Direct table read blocked: ${tbl.split('?')[0]} -> HTTP ${r.status}`);
  }

  // 2. Direct table insert probe (TEST DB WRITE PROBE ONLY — skipped in strict read-only mode)
  if (ALLOW_TEST_DB_WRITES) {
    const directInsert = await restCall('priori_records', {
      method: 'POST',
      body: {
        record_key: 'priori_030101_tamper',
        student_key: '030101',
        paper_id: 'tamper',
        grade: '03',
        class_num: '1',
        seat: '01',
        score: 100,
        elapsed_seconds: 1,
        payload: {},
      },
    });
    assert.ok(
      isDenied(directInsert),
      `Expected direct POST priori_records blocked, got ${directInsert.status}: ${directInsert.text}`
    );
    console.log(`✓ Direct anonymous INSERT priori_records blocked -> HTTP ${directInsert.status}`);
  } else {
    console.log('ℹ️ Read-only mode: skipped direct POST priori_records probe (verified on test DB / PGlite).');
  }

  // 3. Unauthenticated / forged read RPC calls MUST be denied (42501, zero mutations)
  const unauthStuGet = await restCall('rpc/priori_student_get_records', {
    method: 'POST',
    body: { p_token: 'forged-student-token-' + '0'.repeat(40), p_student_key: '030101' },
  });
  assert.ok(
    isDenied(unauthStuGet),
    `Expected forged student token read rejected, got ${unauthStuGet.status}: ${unauthStuGet.text}`
  );

  for (const [rpc, body] of [
    ['rpc/priori_teacher_list_records', { p_token: 'forged-token-' + '0'.repeat(64) }],
    ['rpc/priori_teacher_get_roster', { p_token: 'forged-token-' + '0'.repeat(64), p_roster_key: 'priori_school_roster_v1' }],
    ['rpc/priori_teacher_list_bindings', { p_token: 'forged-token-' + '0'.repeat(64) }],
  ]) {
    const r = await restCall(rpc, { method: 'POST', body });
    assert.ok(isDenied(r), `Expected forged teacher token rejected on ${rpc}, got ${r.status}: ${r.text}`);
  }
  console.log('✓ Read-only RPC permission checks passed: forged student & teacher tokens denied (42501)');

  // 3b & 4. Mutating RPC probes & login probes (TEST DB ONLY — never executed in default read-only mode)
  if (ALLOW_TEST_DB_WRITES) {
    const unauthStuUpsert = await restCall('rpc/priori_student_upsert_record', {
      method: 'POST',
      body: {
        p_token: 'forged-student-token-' + '0'.repeat(40),
        p_student_key: '030101',
        p_paper_id: '114-math-g3',
        p_grade: '03',
        p_class_num: '1',
        p_seat: '01',
        p_score: 100,
        p_elapsed: 10,
        p_payload: {},
      },
    });
    assert.ok(
      isDenied(unauthStuUpsert),
      `Expected forged student token upsert rejected, got ${unauthStuUpsert.status}: ${unauthStuUpsert.text}`
    );

    const forgedSetPin = await restCall('rpc/priori_teacher_set_student_pin', {
      method: 'POST',
      body: { p_token: 'forged-token-' + '0'.repeat(64), p_student_key: '000099', p_new_pin: '1234' },
    });
    assert.ok(isDenied(forgedSetPin), `Expected forged teacher set-pin rejected, got ${forgedSetPin.status}`);

    for (const badKey of ['guest', '999999', '%', '03%', '']) {
      const res = await restCall('rpc/priori_student_login_seat', {
        method: 'POST',
        body: {
          p_student_key: badKey,
          p_device_secret: 'a'.repeat(32),
          p_transfer_pin: '1234',
        },
      });
      assert.ok(
        res.status >= 400,
        `Expected invalid student key "${badKey}" to fail, got ${res.status}: ${res.text}`
      );
    }

    for (const badPw of ['definitely-wrong-password', 'wt7902230', '__REPLACE_WITH_ADMIN_NEW_PASSWORD__']) {
      const badLogin = await restCall('rpc/priori_teacher_login', {
        method: 'POST',
        body: { p_password: badPw },
      });
      assert.equal(badLogin.status, 200, `Unexpected login status: ${badLogin.status} ${badLogin.text}`);
      assert.equal(badLogin.json?.authorized, false, `Legacy/wrong password "${badPw}" must fail`);
      assert.ok(!badLogin.json?.token, 'Failed login must never return a session token');
    }
    console.log('✓ Test-DB write/login probes passed: upsert/reset/bad-key/bad-teacher-pw all blocked');
  } else {
    console.log('ℹ️ Read-only mode: skipped upsert/reset/student-login/bad-password probes (0 mutations or seat probes).');
  }

  // 5. Public leaderboard must contain 0 PRIORI rows (GET count check); INSERT constraint probe runs on test DB only
  const legacyCheck = await restCall(
    'leaderboard?select=id&mode=in.(priori-record,priori-roster)&limit=1'
  );
  assert.equal(legacyCheck.status, 200);
  assert.equal(
    Array.isArray(legacyCheck.json) ? legacyCheck.json.length : -1,
    0,
    `Expected 0 legacy PRIORI rows in public leaderboard, found: ${legacyCheck.text}`
  );
  console.log('✓ Public leaderboard exposes 0 legacy PRIORI rows (GET count check)');

  if (ALLOW_TEST_DB_WRITES) {
    const rejectPrioriInsert = await restCall('leaderboard', {
      method: 'POST',
      body: {
        device_id: 'audit_probe',
        name: 'audit',
        mode: 'priori-record',
        book: '{}',
        score: 0,
        time: 0,
        week: 0,
      },
    });
    assert.ok(
      rejectPrioriInsert.status >= 400,
      `Expected chk_leaderboard_no_priori to reject priori-record insert, got ${rejectPrioriInsert.status}: ${rejectPrioriInsert.text}`
    );

    const badSeatClaim = await restCall('rpc/priori_student_login_seat', {
      method: 'POST',
      body: {
        p_student_key: '030199',
        p_device_secret: 'audit_bad_seat_' + 'x'.repeat(24),
        p_transfer_pin: '1234',
      },
    });
    assert.ok(
      isDenied(badSeatClaim),
      `Expected out-of-directory seat '030199' denied (42501), got ${badSeatClaim.status}: ${badSeatClaim.text}`
    );

    const probeSeat = (process.env.PRIORI_TEST_SEAT || '000099').trim();
    const anonNoPin = await restCall('rpc/priori_student_login_seat', {
      method: 'POST',
      body: {
        p_student_key: probeSeat,
        p_device_secret: 'audit_anon_probe_' + 'x'.repeat(24),
      },
    });
    assert.equal(
      Boolean(anonNoPin.json?.authorized),
      false,
      `Anonymous login without PIN must never authorize: ${anonNoPin.text}`
    );
    assert.ok(!anonNoPin.json?.token, 'Anonymous unverified login must not return token');
    console.log('✓ Test-DB leaderboard constraint & anonymous claim block verified');
  } else {
    console.log('ℹ️ Read-only mode: skipped POST leaderboard & student-seat login probes (protected from PIN/trusted-device writes).');
  }

  // 6. Optional write/binding isolation roundtrip (strictly isolated test DB with PRIORI_TEST_DB=1 + dedicated '00xxxx' test seat)
  const teacherPw = process.env.PRIORI_TEACHER_PASSWORD || '';
  if (ENABLE_ISOLATION_TEST) {
    if (!teacherPw) {
      throw new Error(
        'PRIORI_TEST_STUDENT_ISOLATION=1 requires PRIORI_TEACHER_PASSWORD.'
      );
    }
    const testSeat = (process.env.PRIORI_TEST_SEAT || '').trim();
    if (!/^\d{6}$/.test(testSeat) || testSeat === '999999') {
      throw new Error(
        'PRIORI_TEST_STUDENT_ISOLATION=1 requires explicit PRIORI_TEST_SEAT (e.g. dedicated 00xxxx test identity on a test DB); formal class seat defaults were removed to protect student accounts.'
      );
    }
    if (!testSeat.startsWith('00') && process.env.PRIORI_TEST_ALLOW_NON_SYNTHETIC_ON_STAGING !== '1') {
      throw new Error(
        `Refusing to mutate class seat ${testSeat} without explicit staging opt-in. Use a dedicated 00xxxx test identity or staging DB with PRIORI_TEST_ALLOW_NON_SYNTHETIC_ON_STAGING=1.`
      );
    }

    const adminLoginForIso = await restCall('rpc/priori_teacher_login', {
      method: 'POST',
      body: { p_password: teacherPw },
    });
    assert.equal(adminLoginForIso.json?.authorized, true, 'Admin teacher login failed for isolation test');
    const adminTok = adminLoginForIso.json.token;

    try {
      const existingRecs = await restCall('rpc/priori_teacher_list_records', {
        method: 'POST',
        body: { p_token: adminTok },
      });
      assert.equal(existingRecs.status, 200, `Failed checking pre-existing records: ${existingRecs.text}`);
      if (Array.isArray(existingRecs.json) && existingRecs.json.some((r) => r.student_key === testSeat)) {
        throw new Error(
          `Refusing isolation test on ${testSeat}: seat already has records (cleanup via priori_student_release_wrong_seat would fail with has_records).`
        );
      }

      const setPinRes = await restCall('rpc/priori_teacher_set_student_pin', {
        method: 'POST',
        body: { p_token: adminTok, p_student_key: testSeat, p_new_pin: '1357' },
      });
      if (!setPinRes.json?.ok) {
        throw new Error(`Could not set 4-digit PIN for test seat ${testSeat}: ${setPinRes.text}`);
      }

      const devA = 'audit_dev_a_' + Date.now() + '_' + 'a'.repeat(16);
      const bindA = await restCall('rpc/priori_student_login_seat', {
        method: 'POST',
        body: {
          p_student_key: testSeat,
          p_device_secret: devA,
          p_transfer_pin: '1357',
        },
      });
      assert.equal(bindA.json?.authorized, true, `Failed activating test seat ${testSeat}: ${bindA.text}`);
      let releaseErr = null;
      try {
        const siblingSeat = testSeat === '030106' ? '030105' : '030106';
        const crossRead = await restCall('rpc/priori_student_get_records', {
          method: 'POST',
          body: { p_token: bindA.json.token, p_student_key: siblingSeat },
        });
        assert.ok(isDenied(crossRead), `Expected Student A reading ${siblingSeat} rejected: ${crossRead.text}`);

        const tamperGradeClass = await restCall('rpc/priori_student_upsert_record', {
          method: 'POST',
          body: {
            p_token: bindA.json.token,
            p_student_key: testSeat,
            p_paper_id: '114-math-g3',
            p_grade: '4',
            p_class_num: '2',
            p_seat: testSeat.slice(4, 6),
            p_score: 100,
            p_elapsed: 5,
            p_payload: { studentKey: testSeat, paperId: '114-math-g3' },
          },
        });
        assert.ok(
          isDenied(tamperGradeClass),
          `Expected grade/class tampering to 4-2 rejected (42501), got ${tamperGradeClass.status}: ${tamperGradeClass.text}`
        );

        const hijackTry = await restCall('rpc/priori_student_login_seat', {
          method: 'POST',
          body: { p_student_key: testSeat, p_device_secret: 'evil_dev_' + 'x'.repeat(24) },
        });
        assert.equal(hijackTry.json?.authorized, false);
        assert.equal(hijackTry.json?.status, 'pin_required');
        assert.ok(!hijackTry.json?.token);
        console.log(`✓ Live student isolation & directory tamper rejection verified on ${testSeat}`);
      } finally {
        const relRes = await restCall('rpc/priori_student_release_wrong_seat', {
          method: 'POST',
          body: { p_token: bindA.json.token },
        });
        if (relRes.status !== 200 || relRes.json?.released !== true) {
          releaseErr = new Error(
            `Test binding cleanup FAILED for ${testSeat} (must return released=true, got status=${relRes.status} body=${relRes.text})`
          );
        }
      }
      if (releaseErr) throw releaseErr;
      console.log(`✓ Confirmed test binding cleanup released=true on ${testSeat}`);
    } finally {
      await restCall('rpc/priori_teacher_logout', { method: 'POST', body: { p_token: adminTok } });
    }
  } else {
    console.log('ℹ️ Read-only audit mode: skipped isolation write test (run only on a test DB with PRIORI_TEST_DB=1 PRIORI_TEST_STUDENT_ISOLATION=1 PRIORI_TEST_SEAT=000099).');
  }

  // 7. Optional authenticated teacher & single-class isolation roundtrip (gated to ALLOW_TEST_DB_WRITES to avoid lingering env vars mutating prod sessions)
  if (ALLOW_TEST_DB_WRITES && teacherPw) {
    const loginOk = await restCall('rpc/priori_teacher_login', {
      method: 'POST',
      body: { p_password: teacherPw },
    });
    assert.equal(loginOk.status, 200);
    assert.equal(loginOk.json?.authorized, true, 'Provided teacher password failed server login');
    assert.ok(loginOk.json?.token, 'Missing token on valid teacher login');

    const authedList = await restCall('rpc/priori_teacher_list_records', {
      method: 'POST',
      body: { p_token: loginOk.json.token },
    });
    assert.equal(authedList.status, 200, `Authed list failed: ${authedList.text}`);
    assert.ok(Array.isArray(authedList.json), 'Expected JSON array of authorized records');

    await restCall('rpc/priori_teacher_logout', {
      method: 'POST',
      body: { p_token: loginOk.json.token },
    });
    const postLogoutList = await restCall('rpc/priori_teacher_list_records', {
      method: 'POST',
      body: { p_token: loginOk.json.token },
    });
    assert.ok(
      isDenied(postLogoutList),
      'Revoked teacher token must no longer read records'
    );
    console.log('✓ Authenticated admin teacher login -> authorized list -> logout revocation verified');
  } else {
    console.log('ℹ️ Tip: pass PRIORI_TEACHER_PASSWORD=... to also verify live admin login & revocation.');
  }

  const classTeacherPw = process.env.PRIORI_CLASS_TEACHER_PASSWORD || '';
  if (ALLOW_TEST_DB_WRITES && classTeacherPw) {
    const clsLogin = await restCall('rpc/priori_teacher_login', {
      method: 'POST',
      body: { p_password: classTeacherPw },
    });
    assert.equal(clsLogin.json?.authorized, true, 'Single-class teacher login failed');
    const tok = clsLogin.json.token;
    try {
      const schoolRosterTry = await restCall('rpc/priori_teacher_get_roster', {
        method: 'POST',
        body: { p_token: tok, p_roster_key: 'priori_school_roster_v1' },
      });
      assert.ok(
        isDenied(schoolRosterTry),
        `Expected single-class teacher denied whole-school roster, got ${schoolRosterTry.status}: ${schoolRosterTry.text}`
      );

      const allowed = Array.isArray(clsLogin.json.allowed_classes) ? clsLogin.json.allowed_classes : [];
      const foreignClass = allowed.includes('3-2') ? '1' : '2';
      const foreignClassTry = await restCall('rpc/priori_teacher_list_records', {
        method: 'POST',
        body: { p_token: tok, p_grade: '3', p_class_num: foreignClass },
      });
      assert.ok(
        isDenied(foreignClassTry),
        `Expected single-class teacher denied other class 3-${foreignClass}, got ${foreignClassTry.status}: ${foreignClassTry.text}`
      );
      console.log('✓ Single-class teacher isolation verified (other class & whole-school roster rejected)');
    } finally {
      await restCall('rpc/priori_teacher_logout', { method: 'POST', body: { p_token: tok } });
    }
  } else {
    console.log('ℹ️ Tip: pass PRIORI_CLASS_TEACHER_PASSWORD=... to also verify single-class teacher isolation.');
  }

  if (!ALLOW_TEST_DB_WRITES && !ENABLE_ISOLATION_TEST) {
    console.log('\n🔒 STRICT READ-ONLY AUDIT PASSED (0 INSERT/UPDATE/reset/student-login probes executed against target DB).');
  } else {
    console.log('\n✅ ALL PRIORI SUPABASE RLS & RPC PERMISSION CHECKS PASSED (including test-DB write probes)!');
  }
}

run().catch((err) => {
  console.error('❌ Permission audit failed:', err);
  process.exit(1);
});
