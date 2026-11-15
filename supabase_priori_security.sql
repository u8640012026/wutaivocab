-- ============================================================
-- 霧臺國小 學習扶助練習館 (PRIORI) 獨立資料表與伺服器端權限隔離腳本
-- 請在 Supabase Dashboard -> SQL Editor 中貼上並點擊「Run」執行
-- ============================================================
-- 安全設計重點：
-- 1. 學生作答/筆跡 (`priori_records`) 與加密名冊 (`priori_rosters`) 徹底脫離公開 `leaderboard` 表。
-- 2. 所有 PRIORI 資料表啟用 RLS 且不開放任何 anon/authenticated 直接 SELECT/INSERT/UPDATE/DELETE Policy，
--    任何未授權直接呼叫 `/rest/v1/priori_*` 之匿名請求皆會被 PostgreSQL RLS 拒絕。
-- 3. 僅透過嚴格作用域限制之 `SECURITY DEFINER` RPC 函式存取：
--    - 學生無密碼輕量登入：只憑 6 碼座號讀取/寫入自己單筆 `priori_<studentKey>_<paperId>`，無法批次撈取全班或使用萬用字元。
--    - 教師後台解鎖：由伺服器端 `priori_teacher_login` 核對雜湊並核發 12 小時效期不透明 session token，
--      所有班級紀錄、逐題筆跡與加密名冊讀取皆核驗該伺服器 session token 與授權班級 (`allowed_classes`)。
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. 學生學習扶助作答與計算紙筆跡隔離資料表
CREATE TABLE IF NOT EXISTS public.priori_records (
    record_key TEXT PRIMARY KEY,                              -- e.g. 'priori_030105_114-math-g3'
    student_key TEXT NOT NULL CHECK (student_key ~ '^\d{6}$'), -- 僅允許正式 6 碼座號（訪客嚴禁上雲）
    paper_id TEXT NOT NULL CHECK (char_length(paper_id) BETWEEN 3 AND 64),
    grade TEXT NOT NULL CHECK (char_length(grade) BETWEEN 1 AND 4),
    class_num TEXT NOT NULL CHECK (char_length(class_num) BETWEEN 1 AND 8),
    seat TEXT NOT NULL CHECK (char_length(seat) BETWEEN 1 AND 4),
    score INT NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    elapsed_seconds INT NOT NULL DEFAULT 0 CHECK (elapsed_seconds >= 0 AND elapsed_seconds <= 7200),
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_priori_records_student ON public.priori_records(student_key);
CREATE INDEX IF NOT EXISTS idx_priori_records_class ON public.priori_records(grade, class_num);
CREATE INDEX IF NOT EXISTS idx_priori_records_paper ON public.priori_records(paper_id);

-- 2. 教師去識別化 AES-GCM 加密名冊隔離資料表
CREATE TABLE IF NOT EXISTS public.priori_rosters (
    roster_key TEXT PRIMARY KEY,
    envelope JSONB NOT NULL,
    entry_count INT NOT NULL DEFAULT 0 CHECK (entry_count >= 0 AND entry_count <= 2000),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. 教師帳號驗證與班級授權範圍（純雜湊儲存，永不對外暴露）
CREATE TABLE IF NOT EXISTS public.priori_teacher_auth (
    teacher_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    auth_algo TEXT NOT NULL CHECK (auth_algo IN ('sha256-salted', 'bcrypt')),
    pass_salt TEXT NOT NULL DEFAULT '',
    pass_hash TEXT NOT NULL,
    allowed_classes TEXT[] NOT NULL DEFAULT ARRAY['*'], -- '*' 代表全校，或如 ARRAY['3-1','3-2'] 限制導師授權班級
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. 伺服器簽發之短期教師工作階段憑證
CREATE TABLE IF NOT EXISTS public.priori_teacher_sessions (
    token_hash TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL REFERENCES public.priori_teacher_auth(teacher_id) ON DELETE CASCADE,
    allowed_classes TEXT[] NOT NULL DEFAULT ARRAY['*'],
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_priori_teacher_sessions_exp ON public.priori_teacher_sessions(expires_at);

-- 啟用 RLS 並徹底撤銷直接資料表權限（僅限 SECURITY DEFINER RPC 依規則代理存取）
ALTER TABLE public.priori_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_teacher_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_teacher_sessions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.priori_records FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_rosters FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_teacher_auth FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_teacher_sessions FROM PUBLIC, anon, authenticated;

-- 預載全校教師預設雜湊帳號（不含任何明文密碼；建議執行後可在後台或 SQL 中以 crypt() 變更為專屬密碼）
INSERT INTO public.priori_teacher_auth (teacher_id, display_name, auth_algo, pass_salt, pass_hash, allowed_classes)
VALUES (
    'admin',
    '霧臺國小管理教師',
    'sha256-salted',
    'wutai_priori_salt_2026:',
    '4fc4bb3b6f9a9f0b9e5ebf353eb487440be0682297f853f37b674844301125ea',
    ARRAY['*']
)
ON CONFLICT (teacher_id) DO NOTHING;

-- ── 內部輔助：驗證教師工作階段 token（不直接開放給前端呼叫） ──
CREATE OR REPLACE FUNCTION public.priori_internal_assert_teacher(p_token TEXT)
RETURNS TABLE(teacher_id TEXT, allowed_classes TEXT[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_token_hash TEXT;
BEGIN
    IF p_token IS NULL OR length(trim(p_token)) < 32 THEN
        RAISE EXCEPTION 'Unauthorized: missing teacher token' USING ERRCODE = '42501';
    END IF;

    v_token_hash := encode(extensions.digest(convert_to(trim(p_token), 'UTF8'), 'sha256'), 'hex');

    RETURN QUERY
    SELECT s.teacher_id, s.allowed_classes
    FROM public.priori_teacher_sessions s
    WHERE s.token_hash = v_token_hash
      AND s.expires_at > timezone('utc'::text, now())
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unauthorized: invalid or expired teacher session' USING ERRCODE = '42501';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.priori_internal_assert_teacher(TEXT) FROM PUBLIC, anon, authenticated;

-- ── 1. 學生 RPC：僅能讀取自己 6 碼座號之跨裝置作答紀錄 ──
CREATE OR REPLACE FUNCTION public.priori_student_get_records(p_student_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_key TEXT := trim(COALESCE(p_student_key, ''));
    v_rows JSONB;
BEGIN
    IF v_key !~ '^\d{6}$' OR v_key = '999999' THEN
        RAISE EXCEPTION 'Invalid student key scope' USING ERRCODE = '22023';
    END IF;

    SELECT coalesce(
        jsonb_agg(
            jsonb_build_object(
                'record_key', r.record_key,
                'student_key', r.student_key,
                'paper_id', r.paper_id,
                'grade', r.grade,
                'class_num', r.class_num,
                'seat', r.seat,
                'score', r.score,
                'elapsed_seconds', r.elapsed_seconds,
                'payload', r.payload,
                'updated_at', r.updated_at
            )
            ORDER BY r.updated_at DESC
        ),
        '[]'::jsonb
    )
    INTO v_rows
    FROM public.priori_records r
    WHERE r.student_key = v_key;

    RETURN v_rows;
END;
$$;

-- ── 2. 學生 RPC：僅能寫入／更新自己單筆作答紀錄 ──
CREATE OR REPLACE FUNCTION public.priori_student_upsert_record(
    p_student_key TEXT,
    p_paper_id TEXT,
    p_grade TEXT,
    p_class_num TEXT,
    p_seat TEXT,
    p_score INT,
    p_elapsed INT,
    p_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_key TEXT := trim(COALESCE(p_student_key, ''));
    v_paper TEXT := trim(COALESCE(p_paper_id, ''));
    v_record_key TEXT;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
    IF v_key !~ '^\d{6}$' OR v_key = '999999' THEN
        RAISE EXCEPTION 'Invalid student key scope' USING ERRCODE = '22023';
    END IF;
    IF char_length(v_paper) < 3 OR char_length(v_paper) > 64 OR v_paper ~ '[%\*\s]' THEN
        RAISE EXCEPTION 'Invalid paper id' USING ERRCODE = '22023';
    END IF;
    IF p_score IS NULL OR p_score < 0 OR p_score > 100 THEN
        RAISE EXCEPTION 'Invalid score range' USING ERRCODE = '22023';
    END IF;
    IF p_elapsed IS NULL OR p_elapsed < 0 OR p_elapsed > 7200 THEN
        RAISE EXCEPTION 'Invalid elapsed seconds' USING ERRCODE = '22023';
    END IF;
    IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object' THEN
        RAISE EXCEPTION 'Invalid payload format' USING ERRCODE = '22023';
    END IF;

    v_record_key := 'priori_' || v_key || '_' || v_paper;

    INSERT INTO public.priori_records (
        record_key, student_key, paper_id, grade, class_num, seat,
        score, elapsed_seconds, payload, updated_at
    )
    VALUES (
        v_record_key,
        v_key,
        v_paper,
        left(trim(COALESCE(p_grade, '03')), 4),
        left(trim(COALESCE(p_class_num, '1')), 8),
        left(trim(COALESCE(p_seat, '01')), 4),
        p_score,
        p_elapsed,
        p_payload,
        v_now
    )
    ON CONFLICT (record_key) DO UPDATE SET
        grade = EXCLUDED.grade,
        class_num = EXCLUDED.class_num,
        seat = EXCLUDED.seat,
        score = EXCLUDED.score,
        elapsed_seconds = EXCLUDED.elapsed_seconds,
        payload = EXCLUDED.payload,
        updated_at = v_now;

    RETURN jsonb_build_object(
        'ok', true,
        'record_key', v_record_key,
        'updated_at', v_now
    );
END;
$$;

-- ── 3. 教師 RPC：伺服器端密碼驗證與核發 12 小時短期 Session Token ──
CREATE OR REPLACE FUNCTION public.priori_teacher_login(p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_pw TEXT := trim(COALESCE(p_password, ''));
    v_auth RECORD;
    v_matched BOOLEAN := false;
    v_token TEXT;
    v_token_hash TEXT;
    v_expires TIMESTAMPTZ := timezone('utc'::text, now()) + interval '12 hours';
BEGIN
    DELETE FROM public.priori_teacher_sessions
    WHERE expires_at <= timezone('utc'::text, now());

    IF v_pw = '' THEN
        RETURN jsonb_build_object('authorized', false);
    END IF;

    FOR v_auth IN
        SELECT teacher_id, display_name, auth_algo, pass_salt, pass_hash, allowed_classes
        FROM public.priori_teacher_auth
    LOOP
        IF v_auth.auth_algo = 'bcrypt' THEN
            IF extensions.crypt(v_pw, v_auth.pass_hash) = v_auth.pass_hash THEN
                v_matched := true;
            END IF;
        ELSIF v_auth.auth_algo = 'sha256-salted' THEN
            IF encode(extensions.digest(convert_to(v_auth.pass_salt || v_pw, 'UTF8'), 'sha256'), 'hex') = v_auth.pass_hash THEN
                v_matched := true;
            END IF;
        END IF;

        IF v_matched THEN
            v_token := encode(extensions.gen_random_bytes(32), 'hex');
            v_token_hash := encode(extensions.digest(convert_to(v_token, 'UTF8'), 'sha256'), 'hex');

            INSERT INTO public.priori_teacher_sessions (token_hash, teacher_id, allowed_classes, expires_at)
            VALUES (v_token_hash, v_auth.teacher_id, v_auth.allowed_classes, v_expires);

            RETURN jsonb_build_object(
                'authorized', true,
                'token', v_token,
                'teacher_id', v_auth.teacher_id,
                'display_name', v_auth.display_name,
                'allowed_classes', v_auth.allowed_classes,
                'expires_at', v_expires
            );
        END IF;
    END LOOP;

    RETURN jsonb_build_object('authorized', false);
END;
$$;

-- ── 4. 教師 RPC：登出註銷工作階段 Token ──
CREATE OR REPLACE FUNCTION public.priori_teacher_logout(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_token_hash TEXT;
BEGIN
    IF p_token IS NOT NULL AND length(trim(p_token)) >= 32 THEN
        v_token_hash := encode(extensions.digest(convert_to(trim(p_token), 'UTF8'), 'sha256'), 'hex');
        DELETE FROM public.priori_teacher_sessions WHERE token_hash = v_token_hash;
    END IF;
    RETURN jsonb_build_object('ok', true);
END;
$$;

-- ── 5. 教師 RPC：僅回傳該教師授權班級範圍內之作答紀錄 ──
CREATE OR REPLACE FUNCTION public.priori_teacher_list_records(
    p_token TEXT,
    p_paper_id TEXT DEFAULT NULL,
    p_grade TEXT DEFAULT NULL,
    p_class_num TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_sess RECORD;
    v_rows JSONB;
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    SELECT coalesce(
        jsonb_agg(
            jsonb_build_object(
                'record_key', r.record_key,
                'student_key', r.student_key,
                'paper_id', r.paper_id,
                'grade', r.grade,
                'class_num', r.class_num,
                'seat', r.seat,
                'score', r.score,
                'elapsed_seconds', r.elapsed_seconds,
                'payload', r.payload,
                'updated_at', r.updated_at
            )
            ORDER BY r.updated_at DESC
        ),
        '[]'::jsonb
    )
    INTO v_rows
    FROM public.priori_records r
    WHERE (
        '*' = ANY(v_sess.allowed_classes)
        OR (ltrim(r.grade, '0') || '-' || ltrim(r.class_num, '0')) = ANY(v_sess.allowed_classes)
        OR (r.grade || '-' || r.class_num) = ANY(v_sess.allowed_classes)
    )
      AND (p_paper_id IS NULL OR r.paper_id = p_paper_id)
      AND (p_grade IS NULL OR ltrim(r.grade, '0') = ltrim(p_grade, '0'))
      AND (p_class_num IS NULL OR ltrim(r.class_num, '0') = ltrim(p_class_num, '0'));

    RETURN v_rows;
END;
$$;

-- ── 6. 教師 RPC：取得加密名冊密文（需通過教師 Token 驗證） ──
CREATE OR REPLACE FUNCTION public.priori_teacher_get_roster(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_sess RECORD;
    v_row RECORD;
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    SELECT envelope, entry_count, updated_at
    INTO v_row
    FROM public.priori_rosters
    WHERE roster_key = 'priori_school_roster_v1'
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('envelope', NULL, 'updated_at', NULL);
    END IF;

    RETURN jsonb_build_object(
        'envelope', v_row.envelope,
        'entry_count', v_row.entry_count,
        'updated_at', v_row.updated_at
    );
END;
$$;

-- ── 7. 教師 RPC：保存／更新加密名冊密文（僅限全校管理教師 '*'） ──
CREATE OR REPLACE FUNCTION public.priori_teacher_save_roster(
    p_token TEXT,
    p_envelope JSONB,
    p_entry_count INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_sess RECORD;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);
    IF NOT ('*' = ANY(v_sess.allowed_classes)) THEN
        RAISE EXCEPTION 'Forbidden: only school admin teacher can modify master roster' USING ERRCODE = '42501';
    END IF;
    IF p_envelope IS NULL OR jsonb_typeof(p_envelope) <> 'object' THEN
        RAISE EXCEPTION 'Invalid roster envelope' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.priori_rosters (roster_key, envelope, entry_count, updated_at)
    VALUES ('priori_school_roster_v1', p_envelope, GREATEST(0, COALESCE(p_entry_count, 0)), v_now)
    ON CONFLICT (roster_key) DO UPDATE SET
        envelope = EXCLUDED.envelope,
        entry_count = EXCLUDED.entry_count,
        updated_at = v_now;

    RETURN jsonb_build_object('ok', true, 'updated_at', v_now);
END;
$$;

-- 嚴格限制僅開放上述 7 支代理 RPC 給 anon/authenticated 呼叫
REVOKE ALL ON FUNCTION public.priori_student_get_records(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_student_get_records(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_student_upsert_record(TEXT, TEXT, TEXT, TEXT, TEXT, INT, INT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_student_upsert_record(TEXT, TEXT, TEXT, TEXT, TEXT, INT, INT, JSONB) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_login(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_login(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_logout(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_logout(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_list_records(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_list_records(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_get_roster(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_get_roster(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_save_roster(TEXT, JSONB, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_save_roster(TEXT, JSONB, INT) TO anon, authenticated;

-- 清理先前曾寫入公開 leaderboard 之學習扶助測試／舊通道資料，確保公開表不殘留任何 PRIORI 紀錄或名冊密文
DELETE FROM public.leaderboard WHERE mode IN ('priori-record', 'priori-roster');
