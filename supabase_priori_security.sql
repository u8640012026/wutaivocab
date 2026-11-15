-- ============================================================
-- 霧臺國小 學習扶助練習館 (PRIORI) 獨立資料表與伺服器端權限隔離腳本 (v2)
-- 請在 Supabase Dashboard -> SQL Editor 中貼上並點擊「Run」執行
-- ============================================================
-- ★ 執行前必填步驟：
--    請搜尋本檔案中的 __REPLACE_WITH_ADMIN_NEW_PASSWORD__，
--    將其替換為至少 8 碼的「全新管理教師密碼」再執行（不可沿用舊預設密碼）。
-- ============================================================
-- 安全設計重點：
-- 1. 先完整備份並遷移公開 leaderboard 內既有的 priori-record / priori-roster，
--    核對備份筆數後才清理公開表，並加上 chk_leaderboard_no_priori 約束永久阻斷回寫。
-- 2. 所有 PRIORI 資料表啟用 RLS 且 REVOKE ALL FROM PUBLIC, anon, authenticated，
--    未授權直接呼叫 /rest/v1/priori_* 一律被 PostgreSQL RLS 拒絕。
-- 3. 學生端採用「同裝置永久免密 + 換機 4 碼小密碼 + 伺服器不透明 Token」：
--    - 首台 iPad 設定 4 碼換機密碼後綁定加密 device_secret 雜湊，之後同台 iPad 自動免密碼續用。
--    - priori_student_get_records 與 priori_student_upsert_record 必須驗證伺服器核發之學生 token，
--      任何跨座號請求（學生 A 讀寫學生 B）或未驗證請求一律回傳 SQLSTATE 42501 拒絕。
--    - 換新裝置連續輸錯 5 次換機碼自動鎖定 15 分鐘防暴力破解；忘記密碼可由導師於後台一鍵重設綁定。
-- 4. 教師端全面改用 pgcrypto crypt() bcrypt 雜湊，停用並清除舊前端預設雜湊；
--    嚴格區分全校權限 ('*') 與單班導師權限（例如 ARRAY['3-1']）：單班導師讀取他班紀錄或全校總名冊一律回 42501 拒絕。
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ── 1. 核心隔離資料表 ──────────────────────────────────────

-- 1A. 學生學習扶助作答與計算紙筆跡隔離資料表
CREATE TABLE IF NOT EXISTS public.priori_records (
    record_key TEXT PRIMARY KEY,                              -- e.g. 'priori_030105_114-math-g3'
    student_key TEXT NOT NULL CHECK (student_key ~ '^\d{6}$' AND student_key <> '999999'),
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

-- 1B. 教師去識別化 AES-GCM 加密名冊隔離資料表（區分全校名冊 priori_school_roster_v1 與單班名冊 class:3-1）
CREATE TABLE IF NOT EXISTS public.priori_rosters (
    roster_key TEXT PRIMARY KEY,
    envelope JSONB NOT NULL,
    entry_count INT NOT NULL DEFAULT 0 CHECK (entry_count >= 0 AND entry_count <= 2000),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1C. 學生座號裝置綁定與 4 碼換機密碼雜湊（含防暴力試錯計數器）
CREATE TABLE IF NOT EXISTS public.priori_student_bindings (
    student_key TEXT PRIMARY KEY CHECK (student_key ~ '^\d{6}$' AND student_key <> '999999'),
    pin_hash TEXT NOT NULL,
    authorized_device_hashes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    pin_failed_attempts INT NOT NULL DEFAULT 0,
    pin_locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1D. 伺服器簽發之學生作用域工作階段憑證（嚴格綁定單一 student_key）
CREATE TABLE IF NOT EXISTS public.priori_student_sessions (
    token_hash TEXT PRIMARY KEY,
    student_key TEXT NOT NULL CHECK (student_key ~ '^\d{6}$' AND student_key <> '999999'),
    device_secret_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_priori_student_sessions_key ON public.priori_student_sessions(student_key);
CREATE INDEX IF NOT EXISTS idx_priori_student_sessions_exp ON public.priori_student_sessions(expires_at);

-- 1E. 教師帳號驗證與班級授權範圍（僅允許 bcrypt 雜湊，永不對外暴露）
CREATE TABLE IF NOT EXISTS public.priori_teacher_auth (
    teacher_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    auth_algo TEXT NOT NULL CHECK (auth_algo IN ('sha256-salted', 'bcrypt', 'disabled')),
    pass_salt TEXT NOT NULL DEFAULT '',
    pass_hash TEXT NOT NULL,
    allowed_classes TEXT[] NOT NULL DEFAULT ARRAY['*'], -- '*' 代表全校，或如 ARRAY['3-1'] 限制單班導師
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.priori_teacher_auth
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 更新既有 auth_algo 約束（兼容由 v1 升級）
DO $$
BEGIN
    ALTER TABLE public.priori_teacher_auth DROP CONSTRAINT IF EXISTS priori_teacher_auth_auth_algo_check;
    ALTER TABLE public.priori_teacher_auth
        ADD CONSTRAINT priori_teacher_auth_auth_algo_check
        CHECK (auth_algo IN ('sha256-salted', 'bcrypt', 'disabled'));
EXCEPTION WHEN others THEN
    NULL;
END $$;

-- 1F. 伺服器簽發之短期教師工作階段憑證
CREATE TABLE IF NOT EXISTS public.priori_teacher_sessions (
    token_hash TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL REFERENCES public.priori_teacher_auth(teacher_id) ON DELETE CASCADE,
    allowed_classes TEXT[] NOT NULL DEFAULT ARRAY['*'],
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_priori_teacher_sessions_exp ON public.priori_teacher_sessions(expires_at);

-- 1G. 公開 leaderboard 舊資料封存備份表（完全封鎖匿名與一般使用者存取）
CREATE TABLE IF NOT EXISTS public.priori_legacy_leaderboard_backup (
    id UUID PRIMARY KEY,
    original_row JSONB NOT NULL,
    backed_up_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ── 2. 全面啟用 RLS 並撤銷直接資料表存取 ────────────────────
ALTER TABLE public.priori_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_student_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_student_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_teacher_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_teacher_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_legacy_leaderboard_backup ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.priori_records FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_rosters FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_student_bindings FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_student_sessions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_teacher_auth FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_teacher_sessions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_legacy_leaderboard_backup FROM PUBLIC, anon, authenticated;

-- ── 3. 保全並遷移公開 leaderboard 既有的 PRIORI 紀錄後再清理 ──
DO $$
DECLARE
    v_legacy_count INT := 0;
    v_backup_count INT := 0;
    v_rec RECORD;
    v_payload JSONB;
    v_sk TEXT;
    v_pid TEXT;
    v_rkey TEXT;
    v_grade TEXT;
    v_class TEXT;
    v_seat TEXT;
    v_score INT;
    v_elapsed INT;
    v_updated TIMESTAMPTZ;
BEGIN
    SELECT COUNT(*) INTO v_legacy_count
    FROM public.leaderboard
    WHERE mode IN ('priori-record', 'priori-roster');

    IF v_legacy_count > 0 THEN
        -- 步驟 3.1：完整封存原始列至受 RLS 保護的備份表
        INSERT INTO public.priori_legacy_leaderboard_backup (id, original_row)
        SELECT l.id, to_jsonb(l)
        FROM public.leaderboard l
        WHERE l.mode IN ('priori-record', 'priori-roster')
        ON CONFLICT (id) DO NOTHING;

        SELECT COUNT(*) INTO v_backup_count
        FROM public.priori_legacy_leaderboard_backup b
        WHERE b.id IN (
            SELECT l.id FROM public.leaderboard l WHERE l.mode IN ('priori-record', 'priori-roster')
        );

        IF v_backup_count < v_legacy_count THEN
            RAISE EXCEPTION '備份筆數 (%) 少於公開表舊紀錄 (%)，已中止刪除以保全學生資料', v_backup_count, v_legacy_count;
        END IF;

        -- 步驟 3.2：遷移合法之舊版 priori-record 至 priori_records
        FOR v_rec IN
            SELECT id, name, book, score, time, created_at
            FROM public.leaderboard
            WHERE mode = 'priori-record'
        LOOP
            BEGIN
                v_payload := v_rec.book::jsonb;
            EXCEPTION WHEN others THEN
                v_payload := NULL;
            END;

            IF v_payload IS NOT NULL AND jsonb_typeof(v_payload) = 'object' THEN
                v_sk := trim(COALESCE(v_payload->>'studentKey', ''));
                v_pid := trim(COALESCE(v_payload->>'paperId', ''));
                IF v_sk ~ '^\d{6}$' AND v_sk <> '999999' AND char_length(v_pid) BETWEEN 3 AND 64 THEN
                    v_rkey := 'priori_' || v_sk || '_' || v_pid;
                    v_grade := left(trim(COALESCE(v_payload->>'grade', substring(v_sk, 1, 2))), 4);
                    v_class := left(trim(COALESCE(v_payload->>'classNum', ltrim(substring(v_sk, 3, 2), '0'))), 8);
                    IF v_class = '' THEN v_class := '1'; END IF;
                    v_seat := left(trim(COALESCE(v_payload->>'seat', substring(v_sk, 5, 2))), 4);
                    v_score := LEAST(100, GREATEST(0, COALESCE((v_payload->>'latestScore')::int, v_rec.score, 0)));
                    v_elapsed := LEAST(7200, GREATEST(0, COALESCE(v_rec.time, 0)));
                    v_updated := COALESCE((v_payload->>'updatedAt')::timestamptz, v_rec.created_at, timezone('utc'::text, now()));

                    INSERT INTO public.priori_records (
                        record_key, student_key, paper_id, grade, class_num, seat,
                        score, elapsed_seconds, payload, updated_at
                    )
                    VALUES (
                        v_rkey, v_sk, v_pid, v_grade, v_class, v_seat,
                        v_score, v_elapsed, v_payload, v_updated
                    )
                    ON CONFLICT (record_key) DO NOTHING;
                END IF;
            END IF;
        END LOOP;

        -- 步驟 3.3：遷移既有加密名冊至 priori_rosters
        FOR v_rec IN
            SELECT book, time, created_at
            FROM public.leaderboard
            WHERE mode = 'priori-roster'
            ORDER BY created_at DESC
            LIMIT 1
        LOOP
            BEGIN
                v_payload := v_rec.book::jsonb;
            EXCEPTION WHEN others THEN
                v_payload := NULL;
            END;

            IF v_payload IS NOT NULL AND jsonb_typeof(v_payload) = 'object' THEN
                INSERT INTO public.priori_rosters (roster_key, envelope, entry_count, updated_at)
                VALUES (
                    'priori_school_roster_v1',
                    v_payload,
                    GREATEST(0, COALESCE(v_rec.time, 0)),
                    COALESCE(v_rec.created_at, timezone('utc'::text, now()))
                )
                ON CONFLICT (roster_key) DO NOTHING;
            END IF;
        END LOOP;

        -- 步驟 3.4：確認已完整備份並遷移後，才從公開 leaderboard 移除
        DELETE FROM public.leaderboard
        WHERE mode IN ('priori-record', 'priori-roster');
    END IF;
END $$;

-- 步驟 3.5：在公開 leaderboard 加上 CHECK 約束，永久禁止未來任何請求再把 PRIORI 資料寫入公開表
DO $$
BEGIN
    ALTER TABLE public.leaderboard DROP CONSTRAINT IF EXISTS chk_leaderboard_no_priori;
    ALTER TABLE public.leaderboard
        ADD CONSTRAINT chk_leaderboard_no_priori
        CHECK (mode NOT IN ('priori-record', 'priori-roster'));
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

-- ── 4. 清除舊前端預設雜湊，設定全新 bcrypt 教師密碼 ──────────
DO $$
DECLARE
    -- ★ 請於執行前替換下方佔位字串為您的全新管理教師密碼（至少 8 碼）：
    v_admin_pw TEXT := '__REPLACE_WITH_ADMIN_NEW_PASSWORD__';
    v_has_active_bcrypt BOOLEAN := false;
BEGIN
    -- 立刻撤銷任何仍使用舊 sha256-salted 或已曝光預設雜湊的教師工作階段與帳號
    DELETE FROM public.priori_teacher_sessions
    WHERE teacher_id IN (
        SELECT teacher_id
        FROM public.priori_teacher_auth
        WHERE auth_algo <> 'bcrypt'
           OR pass_hash = '4fc4bb3b6f9a9f0b9e5ebf353eb487440be0682297f853f37b674844301125ea'
    );

    UPDATE public.priori_teacher_auth
    SET auth_algo = 'disabled',
        is_active = FALSE,
        pass_salt = '',
        pass_hash = 'DISABLED_LEGACY_HASH',
        updated_at = timezone('utc'::text, now())
    WHERE auth_algo <> 'bcrypt'
       OR pass_hash = '4fc4bb3b6f9a9f0b9e5ebf353eb487440be0682297f853f37b674844301125ea';

    SELECT EXISTS (
        SELECT 1
        FROM public.priori_teacher_auth
        WHERE teacher_id = 'admin'
          AND is_active = TRUE
          AND auth_algo = 'bcrypt'
          AND pass_hash LIKE '$2%'
    ) INTO v_has_active_bcrypt;

    IF trim(COALESCE(v_admin_pw, '')) = '__REPLACE_WITH_ADMIN_NEW_PASSWORD__' THEN
        IF NOT v_has_active_bcrypt THEN
            RAISE EXCEPTION '請先將腳本內的 __REPLACE_WITH_ADMIN_NEW_PASSWORD__ 替換為至少 8 碼的新管理教師密碼再執行 Run！';
        END IF;
    ELSE
        IF char_length(trim(v_admin_pw)) < 8 THEN
            RAISE EXCEPTION '新管理教師密碼長度至少需 8 個字元！';
        END IF;
        IF encode(extensions.digest(convert_to('wutai_priori_salt_2026:' || trim(v_admin_pw), 'UTF8'), 'sha256'), 'hex')
           = '4fc4bb3b6f9a9f0b9e5ebf353eb487440be0682297f853f37b674844301125ea' THEN
            RAISE EXCEPTION '不可沿用曾寫入公開儲存庫的舊預設密碼，請換用全新密碼！';
        END IF;

        DELETE FROM public.priori_teacher_sessions WHERE teacher_id = 'admin';

        INSERT INTO public.priori_teacher_auth (
            teacher_id, display_name, auth_algo, pass_salt, pass_hash, allowed_classes, is_active, updated_at
        )
        VALUES (
            'admin',
            '霧臺國小管理教師',
            'bcrypt',
            '',
            extensions.crypt(trim(v_admin_pw), extensions.gen_salt('bf', 10)),
            ARRAY['*'],
            TRUE,
            timezone('utc'::text, now())
        )
        ON CONFLICT (teacher_id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            auth_algo = 'bcrypt',
            pass_salt = '',
            pass_hash = EXCLUDED.pass_hash,
            allowed_classes = ARRAY['*'],
            is_active = TRUE,
            updated_at = timezone('utc'::text, now());
    END IF;
END $$;

-- 如需增設「單班導師」帳號（只看授權班級、無法撈取全校總名冊），可取消註解並修改密碼後單獨執行：
-- INSERT INTO public.priori_teacher_auth (teacher_id, display_name, auth_algo, pass_salt, pass_hash, allowed_classes, is_active)
-- VALUES (
--     'teacher_301',
--     '三年甲班導師',
--     'bcrypt',
--     '',
--     extensions.crypt('請改成該班導師專屬密碼', extensions.gen_salt('bf', 10)),
--     ARRAY['3-1'],
--     TRUE
-- )
-- ON CONFLICT (teacher_id) DO UPDATE SET
--     pass_hash = EXCLUDED.pass_hash,
--     allowed_classes = EXCLUDED.allowed_classes,
--     auth_algo = 'bcrypt',
--     is_active = TRUE,
--     updated_at = timezone('utc'::text, now());

-- ── 5. 清除舊版無 token / 未限定作用域之多餘函式簽章 ────────
DROP FUNCTION IF EXISTS public.priori_student_get_records(TEXT);
DROP FUNCTION IF EXISTS public.priori_student_upsert_record(TEXT, TEXT, TEXT, TEXT, TEXT, INT, INT, JSONB);
DROP FUNCTION IF EXISTS public.priori_teacher_get_roster(TEXT);
DROP FUNCTION IF EXISTS public.priori_teacher_save_roster(TEXT, JSONB, INT);

-- ── 6. 內部輔助函式：驗證教師／學生 Token（不開放前端呼叫） ──
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
    JOIN public.priori_teacher_auth a ON a.teacher_id = s.teacher_id
    WHERE s.token_hash = v_token_hash
      AND s.expires_at > timezone('utc'::text, now())
      AND a.is_active = TRUE
      AND a.auth_algo = 'bcrypt'
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unauthorized: invalid or expired teacher session' USING ERRCODE = '42501';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.priori_internal_assert_teacher(TEXT) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.priori_internal_assert_student(
    p_token TEXT,
    p_expected_student_key TEXT DEFAULT NULL
)
RETURNS TABLE(student_key TEXT, device_secret_hash TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_token_hash TEXT;
    v_expected TEXT := NULLIF(trim(COALESCE(p_expected_student_key, '')), '');
    v_sess RECORD;
BEGIN
    IF p_token IS NULL OR length(trim(p_token)) < 32 THEN
        RAISE EXCEPTION 'Unauthorized: missing student session token' USING ERRCODE = '42501';
    END IF;

    v_token_hash := encode(extensions.digest(convert_to(trim(p_token), 'UTF8'), 'sha256'), 'hex');

    SELECT s.student_key, s.device_secret_hash
    INTO v_sess
    FROM public.priori_student_sessions s
    JOIN public.priori_student_bindings b ON b.student_key = s.student_key
    WHERE s.token_hash = v_token_hash
      AND s.expires_at > timezone('utc'::text, now())
      AND s.device_secret_hash = ANY(b.authorized_device_hashes)
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unauthorized: invalid, expired or unbound student session' USING ERRCODE = '42501';
    END IF;

    IF v_expected IS NOT NULL AND v_sess.student_key <> v_expected THEN
        RAISE EXCEPTION 'Forbidden: student session scope mismatch' USING ERRCODE = '42501';
    END IF;

    RETURN QUERY SELECT v_sess.student_key, v_sess.device_secret_hash;
END;
$$;

REVOKE ALL ON FUNCTION public.priori_internal_assert_student(TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- ── 7. 學生 RPC：輕量 4 碼換機密碼 + 裝置綁定登入 ───────────
CREATE OR REPLACE FUNCTION public.priori_student_login_seat(
    p_student_key TEXT,
    p_device_secret TEXT,
    p_transfer_pin TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_key TEXT := trim(COALESCE(p_student_key, ''));
    v_secret TEXT := trim(COALESCE(p_device_secret, ''));
    v_pin TEXT := trim(COALESCE(p_transfer_pin, ''));
    v_dev_hash TEXT;
    v_bind public.priori_student_bindings%ROWTYPE;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_expires TIMESTAMPTZ := v_now + interval '30 days';
    v_token TEXT;
    v_token_hash TEXT;
    v_next_devs TEXT[];
    v_fail INT;
BEGIN
    IF v_key !~ '^\d{6}$' OR v_key = '999999' THEN
        RAISE EXCEPTION 'Invalid student key scope' USING ERRCODE = '22023';
    END IF;
    IF char_length(v_secret) < 16 THEN
        RAISE EXCEPTION 'Invalid device credential' USING ERRCODE = '22023';
    END IF;

    DELETE FROM public.priori_student_sessions
    WHERE expires_at <= v_now;

    v_dev_hash := encode(extensions.digest(convert_to(v_secret, 'UTF8'), 'sha256'), 'hex');

    SELECT *
    INTO v_bind
    FROM public.priori_student_bindings
    WHERE student_key = v_key
    FOR UPDATE;

    -- 情境 A：此座號尚未在任何裝置綁定過 -> 首次設定 4 碼換機小密碼並綁定此裝置
    IF NOT FOUND THEN
        IF v_pin = '' OR v_pin !~ '^\d{4}$' THEN
            RETURN jsonb_build_object(
                'authorized', false,
                'status', CASE WHEN v_pin = '' THEN 'needs_pin_setup' ELSE 'invalid_pin_format' END,
                'has_records', EXISTS (SELECT 1 FROM public.priori_records WHERE student_key = v_key)
            );
        END IF;

        INSERT INTO public.priori_student_bindings (
            student_key, pin_hash, authorized_device_hashes, pin_failed_attempts, pin_locked_until, created_at, updated_at
        )
        VALUES (
            v_key,
            extensions.crypt(v_pin, extensions.gen_salt('bf', 8)),
            ARRAY[v_dev_hash],
            0,
            NULL,
            v_now,
            v_now
        );

        v_token := 'psess_' || encode(extensions.gen_random_bytes(32), 'hex');
        v_token_hash := encode(extensions.digest(convert_to(v_token, 'UTF8'), 'sha256'), 'hex');

        INSERT INTO public.priori_student_sessions (token_hash, student_key, device_secret_hash, expires_at)
        VALUES (v_token_hash, v_key, v_dev_hash, v_expires);

        RETURN jsonb_build_object(
            'authorized', true,
            'status', 'bound_new',
            'token', v_token,
            'student_key', v_key,
            'expires_at', v_expires
        );
    END IF;

    -- 情境 B：在同一台已綁定裝置登入 -> 完全免輸入密碼，直接核發／更新 token
    IF v_dev_hash = ANY(v_bind.authorized_device_hashes) THEN
        UPDATE public.priori_student_bindings
        SET pin_failed_attempts = 0,
            pin_locked_until = NULL,
            updated_at = v_now
        WHERE student_key = v_key;

        v_token := 'psess_' || encode(extensions.gen_random_bytes(32), 'hex');
        v_token_hash := encode(extensions.digest(convert_to(v_token, 'UTF8'), 'sha256'), 'hex');

        INSERT INTO public.priori_student_sessions (token_hash, student_key, device_secret_hash, expires_at)
        VALUES (v_token_hash, v_key, v_dev_hash, v_expires);

        RETURN jsonb_build_object(
            'authorized', true,
            'status', 'trusted_device',
            'token', v_token,
            'student_key', v_key,
            'expires_at', v_expires
        );
    END IF;

    -- 情境 C：新裝置嘗試接入已綁定座號 -> 核對 4 碼換機密碼（含防暴力試錯鎖定）
    IF v_bind.pin_locked_until IS NOT NULL AND v_bind.pin_locked_until > v_now THEN
        RETURN jsonb_build_object(
            'authorized', false,
            'status', 'pin_locked',
            'locked_until', v_bind.pin_locked_until
        );
    END IF;

    IF v_pin = '' THEN
        RETURN jsonb_build_object(
            'authorized', false,
            'status', 'pin_required',
            'remaining_attempts', GREATEST(1, 5 - COALESCE(v_bind.pin_failed_attempts, 0))
        );
    END IF;

    IF v_pin !~ '^\d{4}$' OR extensions.crypt(v_pin, v_bind.pin_hash) <> v_bind.pin_hash THEN
        v_fail := COALESCE(v_bind.pin_failed_attempts, 0) + 1;
        IF v_fail >= 5 THEN
            UPDATE public.priori_student_bindings
            SET pin_failed_attempts = v_fail,
                pin_locked_until = v_now + interval '15 minutes',
                updated_at = v_now
            WHERE student_key = v_key;

            RETURN jsonb_build_object(
                'authorized', false,
                'status', 'pin_locked',
                'locked_until', v_now + interval '15 minutes',
                'remaining_attempts', 0
            );
        END IF;

        UPDATE public.priori_student_bindings
        SET pin_failed_attempts = v_fail,
            updated_at = v_now
        WHERE student_key = v_key;

        RETURN jsonb_build_object(
            'authorized', false,
            'status', 'invalid_pin',
            'remaining_attempts', GREATEST(0, 5 - v_fail)
        );
    END IF;

    -- 換機密碼正確：將此新裝置加入信任名單（最多保留最近 10 台裝置）並核發 token
    v_next_devs := array_append(v_bind.authorized_device_hashes, v_dev_hash);
    IF array_length(v_next_devs, 1) > 10 THEN
        v_next_devs := v_next_devs[(array_length(v_next_devs, 1) - 9):array_length(v_next_devs, 1)];
    END IF;

    UPDATE public.priori_student_bindings
    SET authorized_device_hashes = v_next_devs,
        pin_failed_attempts = 0,
        pin_locked_until = NULL,
        updated_at = v_now
    WHERE student_key = v_key;

    v_token := 'psess_' || encode(extensions.gen_random_bytes(32), 'hex');
    v_token_hash := encode(extensions.digest(convert_to(v_token, 'UTF8'), 'sha256'), 'hex');

    INSERT INTO public.priori_student_sessions (token_hash, student_key, device_secret_hash, expires_at)
    VALUES (v_token_hash, v_key, v_dev_hash, v_expires);

    RETURN jsonb_build_object(
        'authorized', true,
        'status', 'pin_verified',
        'token', v_token,
        'student_key', v_key,
        'expires_at', v_expires
    );
END;
$$;

-- ── 8. 學生 RPC：讀取與寫入（必須持有合法且符合座號作用域的 token） ──
CREATE OR REPLACE FUNCTION public.priori_student_get_records(
    p_token TEXT,
    p_student_key TEXT DEFAULT NULL
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
    SELECT * INTO v_sess
    FROM public.priori_internal_assert_student(p_token, p_student_key);

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
    WHERE r.student_key = v_sess.student_key;

    RETURN v_rows;
END;
$$;

CREATE OR REPLACE FUNCTION public.priori_student_upsert_record(
    p_token TEXT,
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
    v_sess RECORD;
    v_paper TEXT := trim(COALESCE(p_paper_id, ''));
    v_record_key TEXT;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_clean_payload JSONB;
BEGIN
    SELECT * INTO v_sess
    FROM public.priori_internal_assert_student(p_token, p_student_key);

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

    -- 強制鎖定 payload 內的 studentKey 必須與 token 綁定座號一致
    v_clean_payload := p_payload || jsonb_build_object('studentKey', v_sess.student_key, 'paperId', v_paper);
    v_record_key := 'priori_' || v_sess.student_key || '_' || v_paper;

    INSERT INTO public.priori_records (
        record_key, student_key, paper_id, grade, class_num, seat,
        score, elapsed_seconds, payload, updated_at
    )
    VALUES (
        v_record_key,
        v_sess.student_key,
        v_paper,
        left(trim(COALESCE(p_grade, '03')), 4),
        left(trim(COALESCE(p_class_num, '1')), 8),
        left(trim(COALESCE(p_seat, '01')), 4),
        p_score,
        p_elapsed,
        v_clean_payload,
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

CREATE OR REPLACE FUNCTION public.priori_student_logout(p_token TEXT)
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
        DELETE FROM public.priori_student_sessions WHERE token_hash = v_token_hash;
    END IF;
    RETURN jsonb_build_object('ok', true);
END;
$$;

-- 若學生剛不小心誤綁了一個尚無任何雲端作答紀錄的空白座號，可自我釋放重選
CREATE OR REPLACE FUNCTION public.priori_student_release_wrong_seat(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_sess RECORD;
BEGIN
    SELECT * INTO v_sess
    FROM public.priori_internal_assert_student(p_token, NULL);

    IF EXISTS (SELECT 1 FROM public.priori_records WHERE student_key = v_sess.student_key) THEN
        RETURN jsonb_build_object('released', false, 'reason', 'has_records');
    END IF;

    DELETE FROM public.priori_student_sessions WHERE student_key = v_sess.student_key;
    DELETE FROM public.priori_student_bindings WHERE student_key = v_sess.student_key;
    RETURN jsonb_build_object('released', true);
END;
$$;

-- ── 9. 教師 RPC：登入、登出、分級班級紀錄、分級名冊與重設學生換機鎖 ──
CREATE OR REPLACE FUNCTION public.priori_teacher_login(p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_pw TEXT := trim(COALESCE(p_password, ''));
    v_auth RECORD;
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
        SELECT teacher_id, display_name, pass_hash, allowed_classes
        FROM public.priori_teacher_auth
        WHERE is_active = TRUE
          AND auth_algo = 'bcrypt'
          AND pass_hash LIKE '$2%'
    LOOP
        IF extensions.crypt(v_pw, v_auth.pass_hash) = v_auth.pass_hash THEN
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
    v_req_g TEXT := NULLIF(ltrim(trim(COALESCE(p_grade, '')), '0'), '');
    v_req_c TEXT := NULLIF(ltrim(trim(COALESCE(p_class_num, '')), '0'), '');
    v_scope_ok BOOLEAN := false;
    v_item TEXT;
    v_parts TEXT[];
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    -- 若單班／限定班級教師明確指定查詢未授權之他班或他年級，直接回傳 42501 拒絕
    IF NOT ('*' = ANY(v_sess.allowed_classes)) AND (v_req_g IS NOT NULL OR v_req_c IS NOT NULL) THEN
        FOREACH v_item IN ARRAY v_sess.allowed_classes
        LOOP
            v_parts := string_to_array(v_item, '-');
            IF (v_req_g IS NULL OR ltrim(COALESCE(v_parts[1], ''), '0') = v_req_g)
               AND (v_req_c IS NULL OR ltrim(COALESCE(v_parts[2], ''), '0') = v_req_c) THEN
                v_scope_ok := true;
                EXIT;
            END IF;
        END LOOP;
        IF NOT v_scope_ok THEN
            RAISE EXCEPTION 'Forbidden: requested class outside teacher scope' USING ERRCODE = '42501';
        END IF;
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
    WHERE (
        '*' = ANY(v_sess.allowed_classes)
        OR (ltrim(r.grade, '0') || '-' || ltrim(r.class_num, '0')) = ANY(v_sess.allowed_classes)
        OR (r.grade || '-' || r.class_num) = ANY(v_sess.allowed_classes)
    )
      AND (p_paper_id IS NULL OR r.paper_id = p_paper_id)
      AND (v_req_g IS NULL OR ltrim(r.grade, '0') = v_req_g)
      AND (v_req_c IS NULL OR ltrim(r.class_num, '0') = v_req_c);

    RETURN v_rows;
END;
$$;

CREATE OR REPLACE FUNCTION public.priori_teacher_get_roster(
    p_token TEXT,
    p_roster_key TEXT DEFAULT 'priori_school_roster_v1'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_sess RECORD;
    v_row RECORD;
    v_key TEXT := trim(COALESCE(p_roster_key, 'priori_school_roster_v1'));
    v_class_scope TEXT;
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    IF v_key = 'priori_school_roster_v1' THEN
        IF NOT ('*' = ANY(v_sess.allowed_classes)) THEN
            RAISE EXCEPTION 'Forbidden: whole-school roster requires * scope' USING ERRCODE = '42501';
        END IF;
    ELSIF v_key ~ '^class:\d+-\d+$' THEN
        v_class_scope := substring(v_key FROM 7);
        IF NOT ('*' = ANY(v_sess.allowed_classes) OR v_class_scope = ANY(v_sess.allowed_classes)) THEN
            RAISE EXCEPTION 'Forbidden: class roster outside teacher scope' USING ERRCODE = '42501';
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid roster scope key' USING ERRCODE = '22023';
    END IF;

    SELECT envelope, entry_count, updated_at
    INTO v_row
    FROM public.priori_rosters
    WHERE roster_key = v_key
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('envelope', NULL, 'updated_at', NULL, 'roster_key', v_key);
    END IF;

    RETURN jsonb_build_object(
        'envelope', v_row.envelope,
        'entry_count', v_row.entry_count,
        'updated_at', v_row.updated_at,
        'roster_key', v_key
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.priori_teacher_save_roster(
    p_token TEXT,
    p_envelope JSONB,
    p_entry_count INT DEFAULT 0,
    p_roster_key TEXT DEFAULT 'priori_school_roster_v1'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_sess RECORD;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_key TEXT := trim(COALESCE(p_roster_key, 'priori_school_roster_v1'));
    v_class_scope TEXT;
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    IF v_key = 'priori_school_roster_v1' THEN
        IF NOT ('*' = ANY(v_sess.allowed_classes)) THEN
            RAISE EXCEPTION 'Forbidden: only school admin teacher can modify master roster' USING ERRCODE = '42501';
        END IF;
    ELSIF v_key ~ '^class:\d+-\d+$' THEN
        v_class_scope := substring(v_key FROM 7);
        IF NOT ('*' = ANY(v_sess.allowed_classes) OR v_class_scope = ANY(v_sess.allowed_classes)) THEN
            RAISE EXCEPTION 'Forbidden: class roster outside teacher scope' USING ERRCODE = '42501';
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid roster scope key' USING ERRCODE = '22023';
    END IF;

    IF p_envelope IS NULL OR jsonb_typeof(p_envelope) <> 'object' THEN
        RAISE EXCEPTION 'Invalid roster envelope' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.priori_rosters (roster_key, envelope, entry_count, updated_at)
    VALUES (v_key, p_envelope, GREATEST(0, COALESCE(p_entry_count, 0)), v_now)
    ON CONFLICT (roster_key) DO UPDATE SET
        envelope = EXCLUDED.envelope,
        entry_count = EXCLUDED.entry_count,
        updated_at = v_now;

    RETURN jsonb_build_object('ok', true, 'updated_at', v_now, 'roster_key', v_key);
END;
$$;

CREATE OR REPLACE FUNCTION public.priori_teacher_reset_student_binding(
    p_token TEXT,
    p_student_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_sess RECORD;
    v_key TEXT := trim(COALESCE(p_student_key, ''));
    v_g TEXT;
    v_c TEXT;
    v_scope TEXT;
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    IF v_key !~ '^\d{6}$' OR v_key = '999999' THEN
        RAISE EXCEPTION 'Invalid student key scope' USING ERRCODE = '22023';
    END IF;

    v_g := COALESCE(NULLIF(ltrim(substring(v_key, 1, 2), '0'), ''), '0');
    v_c := COALESCE(NULLIF(ltrim(substring(v_key, 3, 2), '0'), ''), '0');
    v_scope := v_g || '-' || v_c;

    IF NOT (
        '*' = ANY(v_sess.allowed_classes)
        OR v_scope = ANY(v_sess.allowed_classes)
        OR (substring(v_key, 1, 2) || '-' || substring(v_key, 3, 2)) = ANY(v_sess.allowed_classes)
    ) THEN
        RAISE EXCEPTION 'Forbidden: student outside teacher class scope' USING ERRCODE = '42501';
    END IF;

    DELETE FROM public.priori_student_sessions WHERE student_key = v_key;
    DELETE FROM public.priori_student_bindings WHERE student_key = v_key;

    RETURN jsonb_build_object('ok', true, 'student_key', v_key);
END;
$$;

-- ── 10. 嚴格限制僅開放授權之 RPC 給 anon / authenticated 呼叫 ──
REVOKE ALL ON FUNCTION public.priori_student_login_seat(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_student_login_seat(TEXT, TEXT, TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_student_get_records(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_student_get_records(TEXT, TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_student_upsert_record(TEXT, TEXT, TEXT, TEXT, TEXT, INT, INT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_student_upsert_record(TEXT, TEXT, TEXT, TEXT, TEXT, INT, INT, JSONB) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_student_logout(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_student_logout(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_student_release_wrong_seat(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_student_release_wrong_seat(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_login(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_login(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_logout(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_logout(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_list_records(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_list_records(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_get_roster(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_get_roster(TEXT, TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_save_roster(TEXT, JSONB, INT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_save_roster(TEXT, JSONB, INT, TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_reset_student_binding(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_reset_student_binding(TEXT, TEXT) TO anon, authenticated;
