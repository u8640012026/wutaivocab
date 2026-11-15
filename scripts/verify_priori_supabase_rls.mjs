import assert from 'node:assert/strict';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://fqkdkmcqjswufzbvkram.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_M9phUn6LH1yeVA9NbIXesg_tVABCW5z';

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
    'priori_student_bindings?select=*',
    'priori_student_sessions?select=*',
    'priori_teacher_auth?select=*',
    'priori_teacher_sessions?select=*',
    'priori_legacy_leaderboard_backup?select=*',
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

  // 2. Direct table insert MUST be blocked
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

  // 3. Unauthenticated / forged student RPC calls MUST be denied (42501)
  const unauthStuGet = await restCall('rpc/priori_student_get_records', {
    method: 'POST',
    body: { p_token: 'forged-student-token-' + '0'.repeat(40), p_student_key: '030101' },
  });
  assert.ok(
    isDenied(unauthStuGet),
    `Expected forged student token read rejected, got ${unauthStuGet.status}: ${unauthStuGet.text}`
  );

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

  // 3b. Invalid student keys / wildcards / short device secret MUST be rejected by priori_student_login_seat
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
  console.log('✓ Student RPC requires valid session token & rejects guest / wildcards / non-6-digit keys');

  // 4. Legacy exposed password & wrong password MUST NOT issue token; invalid token MUST be denied
  for (const badPw of ['definitely-wrong-password', 'wt7902230', '__REPLACE_WITH_ADMIN_NEW_PASSWORD__']) {
    const badLogin = await restCall('rpc/priori_teacher_login', {
      method: 'POST',
      body: { p_password: badPw },
    });
    assert.equal(badLogin.status, 200, `Unexpected login status: ${badLogin.status} ${badLogin.text}`);
    assert.equal(badLogin.json?.authorized, false, `Legacy/wrong password "${badPw}" must fail`);
    assert.ok(!badLogin.json?.token, 'Failed login must never return a session token');
  }

  for (const [rpc, body] of [
    ['rpc/priori_teacher_list_records', { p_token: 'forged-token-' + '0'.repeat(64) }],
    ['rpc/priori_teacher_get_roster', { p_token: 'forged-token-' + '0'.repeat(64), p_roster_key: 'priori_school_roster_v1' }],
    ['rpc/priori_teacher_reset_student_binding', { p_token: 'forged-token-' + '0'.repeat(64), p_student_key: '030101' }],
  ]) {
    const r = await restCall(rpc, { method: 'POST', body });
    assert.ok(isDenied(r), `Expected forged teacher token rejected on ${rpc}, got ${r.status}: ${r.text}`);
  }
  console.log('✓ Teacher RPC blocks legacy exposed password, wrong password & forged session tokens');

  // 5. Public leaderboard must contain 0 PRIORI rows and block future priori-* inserts
  const legacyCheck = await restCall(
    'leaderboard?select=id&mode=in.(priori-record,priori-roster)&limit=1'
  );
  assert.equal(legacyCheck.status, 200);
  assert.equal(
    Array.isArray(legacyCheck.json) ? legacyCheck.json.length : -1,
    0,
    `Expected 0 legacy PRIORI rows in public leaderboard, found: ${legacyCheck.text}`
  );

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
  console.log('✓ Public leaderboard has 0 PRIORI rows & permanently rejects priori-* writes');

  // 6. Cross-student isolation roundtrip (uses synthetic grade '00' keys & cleans up automatically)
  if (process.env.PRIORI_TEST_STUDENT_ISOLATION === '1') {
    const devA = 'audit_dev_a_' + Date.now() + '_' + 'a'.repeat(16);
    const devB = 'audit_dev_b_' + Date.now() + '_' + 'b'.repeat(16);
    const stuA = '000001';
    const stuB = '000002';

    const bindA = await restCall('rpc/priori_student_login_seat', {
      method: 'POST',
      body: { p_student_key: stuA, p_device_secret: devA, p_transfer_pin: '1357' },
    });
    const bindB = await restCall('rpc/priori_student_login_seat', {
      method: 'POST',
      body: { p_student_key: stuB, p_device_secret: devB, p_transfer_pin: '2468' },
    });
    assert.equal(bindA.json?.authorized, true, `Failed binding synthetic student A: ${bindA.text}`);
    assert.equal(bindB.json?.authorized, true, `Failed binding synthetic student B: ${bindB.text}`);

    try {
      // Student A token attempting to READ Student B -> MUST BE DENIED (42501)
      const crossRead = await restCall('rpc/priori_student_get_records', {
        method: 'POST',
        body: { p_token: bindA.json.token, p_student_key: stuB },
      });
      assert.ok(
        isDenied(crossRead),
        `Expected Student A reading Student B to be rejected, got ${crossRead.status}: ${crossRead.text}`
      );

      // Student A token attempting to WRITE Student B -> MUST BE DENIED (42501)
      const crossWrite = await restCall('rpc/priori_student_upsert_record', {
        method: 'POST',
        body: {
          p_token: bindA.json.token,
          p_student_key: stuB,
          p_paper_id: '114-math-g3',
          p_grade: '00',
          p_class_num: '0',
          p_seat: '02',
          p_score: 0,
          p_elapsed: 5,
          p_payload: { studentKey: stuB, paperId: '114-math-g3' },
        },
      });
      assert.ok(
        isDenied(crossWrite),
        `Expected Student A writing Student B to be rejected, got ${crossWrite.status}: ${crossWrite.text}`
      );

      // Unbound device attempting to log into Student A without PIN -> MUST require PIN & leak 0 token
      const hijackTry = await restCall('rpc/priori_student_login_seat', {
        method: 'POST',
        body: { p_student_key: stuA, p_device_secret: 'evil_dev_' + 'x'.repeat(24) },
      });
      assert.equal(hijackTry.json?.authorized, false);
      assert.equal(hijackTry.json?.status, 'pin_required');
      assert.ok(!hijackTry.json?.token);
    } finally {
      await restCall('rpc/priori_student_release_wrong_seat', {
        method: 'POST',
        body: { p_token: bindA.json.token },
      });
      await restCall('rpc/priori_student_release_wrong_seat', {
        method: 'POST',
        body: { p_token: bindB.json.token },
      });
    }
    console.log('✓ Cross-student isolation verified (Student A reading/writing Student B rejected)');
  } else {
    console.log('ℹ️ Tip: set PRIORI_TEST_STUDENT_ISOLATION=1 to verify live Student A != Student B isolation.');
  }

  // 7. Optional authenticated teacher & single-class isolation roundtrip
  const teacherPw = process.env.PRIORI_TEACHER_PASSWORD || '';
  if (teacherPw) {
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
  if (classTeacherPw) {
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

  console.log('\n✅ ALL PRIORI SUPABASE RLS & RPC PERMISSION CHECKS PASSED!');
}

run().catch((err) => {
  console.error('❌ Permission audit failed:', err);
  process.exit(1);
});
