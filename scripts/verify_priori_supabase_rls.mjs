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

async function run() {
  console.log(`=== PRIORI Supabase RLS & RPC Permission Audit (${SUPABASE_URL}) ===`);

  // 1. Direct table queries MUST be blocked by RLS / REVOKE ALL
  for (const tbl of [
    'priori_records?select=*',
    'priori_rosters?select=*',
    'priori_teacher_auth?select=*',
    'priori_teacher_sessions?select=*',
  ]) {
    const r = await restCall(tbl);
    const blocked = r.status === 401 || r.status === 403 || r.json?.code === '42501';
    if (r.status === 404 || r.json?.code === 'PGRST205') {
      console.error(
        `❌ ${tbl.split('?')[0]} 尚未建立。請先至 Supabase Dashboard -> SQL Editor 執行 supabase_priori_security.sql！`
      );
      process.exit(2);
    }
    assert.ok(
      blocked,
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
    directInsert.status === 401 || directInsert.status === 403,
    `Expected direct POST priori_records blocked, got ${directInsert.status}: ${directInsert.text}`
  );
  console.log(`✓ Direct anonymous INSERT priori_records blocked -> HTTP ${directInsert.status}`);

  // 3. Invalid student wildcards / guest MUST be rejected by priori_student_get_records
  for (const badKey of ['guest', '999999', '%', '03%', '']) {
    const res = await restCall('rpc/priori_student_get_records', {
      method: 'POST',
      body: { p_student_key: badKey },
    });
    assert.ok(
      res.status >= 400,
      `Expected invalid student key "${badKey}" to fail, got ${res.status}: ${res.text}`
    );
  }
  console.log('✓ Student RPC rejects guest / wildcards / non-6-digit keys');

  // 4. Wrong teacher password MUST NOT issue token; invalid token MUST be denied
  const badLogin = await restCall('rpc/priori_teacher_login', {
    method: 'POST',
    body: { p_password: 'definitely-wrong-password' },
  });
  assert.equal(badLogin.status, 200, `Unexpected login status: ${badLogin.status} ${badLogin.text}`);
  assert.equal(badLogin.json?.authorized, false, 'Wrong password must return authorized: false');
  assert.ok(!badLogin.json?.token, 'Wrong password must never return a session token');

  const forgedList = await restCall('rpc/priori_teacher_list_records', {
    method: 'POST',
    body: { p_token: 'forged-token-' + '0'.repeat(64) },
  });
  assert.ok(
    forgedList.status === 401 || forgedList.status === 403 || forgedList.json?.code === '42501',
    `Expected forged teacher token rejected, got ${forgedList.status}: ${forgedList.text}`
  );

  const forgedRoster = await restCall('rpc/priori_teacher_get_roster', {
    method: 'POST',
    body: { p_token: 'forged-token-' + '0'.repeat(64) },
  });
  assert.ok(
    forgedRoster.status === 401 || forgedRoster.status === 403 || forgedRoster.json?.code === '42501',
    `Expected forged roster read rejected, got ${forgedRoster.status}: ${forgedRoster.text}`
  );
  console.log('✓ Teacher RPC rejects wrong password & forged session tokens');

  // 5. Public leaderboard must contain zero remaining PRIORI records/rosters
  const legacyCheck = await restCall(
    'leaderboard?select=id&mode=in.(priori-record,priori-roster)&limit=1'
  );
  assert.equal(legacyCheck.status, 200);
  assert.equal(
    Array.isArray(legacyCheck.json) ? legacyCheck.json.length : -1,
    0,
    `Expected 0 legacy PRIORI rows in public leaderboard, found: ${legacyCheck.text}`
  );
  console.log('✓ Public leaderboard has 0 priori-record / priori-roster rows');

  // 6. Optional authenticated roundtrip if PRIORI_TEACHER_PASSWORD env var is provided
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
      postLogoutList.status === 401 || postLogoutList.status === 403 || postLogoutList.json?.code === '42501',
      'Revoked teacher token must no longer read records'
    );
    console.log('✓ Authenticated teacher login -> authorized list -> logout revocation verified');
  } else {
    console.log('ℹ️ Tip: pass PRIORI_TEACHER_PASSWORD=... to also verify live login & token revocation roundtrip.');
  }

  console.log('\n✅ ALL PRIORI SUPABASE RLS & RPC PERMISSION CHECKS PASSED!');
}

run().catch((err) => {
  console.error('❌ Permission audit failed:', err);
  process.exit(1);
});
