-- ============================================================
-- 霧臺國小 學習扶助練習館 (PRIORI) 獨立資料表與伺服器端權限隔離腳本 (v3)
-- 請在 Supabase Dashboard -> SQL Editor 中貼上並點擊「Run」執行
-- ============================================================
-- ★ 執行前必填步驟：
--    請搜尋本檔案中的 __REPLACE_WITH_ADMIN_NEW_PASSWORD__，
--    將其替換為至少 8 碼的「全新管理教師密碼」再執行（不可沿用舊預設密碼）。
-- ============================================================
-- 安全設計重點（逐項可實測驗證）：
-- 1. 舊公開 leaderboard 無損保全遷移與永久鎖死：
--    - 先備份至受 RLS 封鎖的 priori_legacy_leaderboard_backup，
--      依時間／成績決定性合併同生同卷重複列（較新／較高分勝出，保留最早初測基準）、
--      將無法解析或無效紀錄寫入 priori_legacy_migration_issues 稽核表，
--      核對新表筆數與贏出成績完全吻合後才從公開表刪除，並於 leaderboard 設下 CHECK 與 RLS 阻斷。
-- 2. 所有 PRIORI 資料表啟用 RLS 且 REVOKE ALL FROM PUBLIC, anon, authenticated，
--    未授權直接呼叫 /rest/v1/priori_* 一律被 PostgreSQL RLS 拒絕。
-- 3. 權威學生座號名錄 (priori_student_directory) + 教師一次性啟用碼：
--    - 首次綁定與教師重設後，均須憑教師發放的一次性 6 碼啟用碼＋學生自設 4 碼換機小密碼完成啟用；
--      匿名裝置無法搶先認領任何空白或剛重設的座號並讀走舊成績。
--    - 啟用完成後，同一台 iPad 憑本機 device_secret 雜湊永久免密直接登入；換新 iPad 才輸 4 碼小密碼。
--    - 學生寫入 (priori_student_upsert_record) 與教師查詢 (priori_teacher_list_records)
--      皆強制以 priori_student_directory 為唯一真實來源，拒絕任何篡改年級／班級／座號之請求 (42501)。
-- 4. 教師端全面採用 pgcrypto crypt() bcrypt 雜湊，嚴格隔離全校 ('*') 與單班 ('3-1') 權限。
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ── 1. 核心隔離資料表 ──────────────────────────────────────

-- 1A. 伺服器權威學生座號名錄（不含姓名個資，僅供權威班級／座號與教師可見範圍對照）
CREATE TABLE IF NOT EXISTS public.priori_student_directory (
    student_key TEXT PRIMARY KEY CHECK (student_key ~ '^\d{6}$' AND student_key <> '999999'),
    grade TEXT NOT NULL CHECK (char_length(grade) BETWEEN 1 AND 4),
    class_num TEXT NOT NULL CHECK (char_length(class_num) BETWEEN 1 AND 8),
    seat TEXT NOT NULL CHECK (char_length(seat) BETWEEN 1 AND 4),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    source TEXT NOT NULL DEFAULT 'school_headcount',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_priori_directory_class ON public.priori_student_directory(grade, class_num);

-- 預置霧臺國小 1～6 年級各班編班座號骨架（冪等 ON CONFLICT DO NOTHING）
DO $$
DECLARE
    v_cfg RECORD;
    v_s INT;
    v_sk TEXT;
BEGIN
    FOR v_cfg IN
        SELECT * FROM (
            VALUES
                ('1', '1', 5),  ('1', '2', 11),
                ('2', '1', 6),  ('2', '2', 4),
                ('3', '1', 6),  ('3', '2', 9),
                ('4', '1', 8),  ('4', '2', 11),
                ('5', '1', 6),  ('5', '2', 19),
                ('6', '1', 6),  ('6', '2', 12)
        ) AS t(g, c, cnt)
    LOOP
        FOR v_s IN 1..v_cfg.cnt LOOP
            v_sk := lpad(v_cfg.g, 2, '0') || lpad(v_cfg.c, 2, '0') || lpad(v_s::text, 2, '0');
            INSERT INTO public.priori_student_directory (student_key, grade, class_num, seat, active, source)
            VALUES (v_sk, v_cfg.g, v_cfg.c, lpad(v_s::text, 2, '0'), TRUE, 'school_headcount')
            ON CONFLICT (student_key) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 1B. 學生學習扶助作答與計算紙筆跡隔離資料表
CREATE TABLE IF NOT EXISTS public.priori_records (
    record_key TEXT PRIMARY KEY,
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

-- 1C. 教師去識別化 AES-GCM 加密名冊隔離資料表
CREATE TABLE IF NOT EXISTS public.priori_rosters (
    roster_key TEXT PRIMARY KEY,
    envelope JSONB NOT NULL,
    entry_count INT NOT NULL DEFAULT 0 CHECK (entry_count >= 0 AND entry_count <= 2000),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1D. 學生座號裝置綁定、一次性啟用碼雜湊與 4 碼換機密碼雜湊
CREATE TABLE IF NOT EXISTS public.priori_student_bindings (
    student_key TEXT PRIMARY KEY CHECK (student_key ~ '^\d{6}$' AND student_key <> '999999'),
    pin_hash TEXT,
    activation_code_hash TEXT,
    activation_expires_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,
    authorized_device_hashes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    pin_failed_attempts INT NOT NULL DEFAULT 0,
    pin_locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 兼容由 v1/v2 升級：放寬 pin_hash NULL 限制並補齊啟用碼欄位
ALTER TABLE public.priori_student_bindings ALTER COLUMN pin_hash DROP NOT NULL;
ALTER TABLE public.priori_student_bindings ADD COLUMN IF NOT EXISTS activation_code_hash TEXT;
ALTER TABLE public.priori_student_bindings ADD COLUMN IF NOT EXISTS activation_expires_at TIMESTAMPTZ;
ALTER TABLE public.priori_student_bindings ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

-- 1E. 伺服器簽發之學生作用域工作階段憑證（嚴格綁定單一 student_key）
CREATE TABLE IF NOT EXISTS public.priori_student_sessions (
    token_hash TEXT PRIMARY KEY,
    student_key TEXT NOT NULL CHECK (student_key ~ '^\d{6}$' AND student_key <> '999999'),
    device_secret_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_priori_student_sessions_key ON public.priori_student_sessions(student_key);
CREATE INDEX IF NOT EXISTS idx_priori_student_sessions_exp ON public.priori_student_sessions(expires_at);

-- 1F. 教師帳號驗證與班級授權範圍（僅允許 bcrypt 雜湊）
CREATE TABLE IF NOT EXISTS public.priori_teacher_auth (
    teacher_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    auth_algo TEXT NOT NULL CHECK (auth_algo IN ('sha256-salted', 'bcrypt', 'disabled')),
    pass_salt TEXT NOT NULL DEFAULT '',
    pass_hash TEXT NOT NULL,
    allowed_classes TEXT[] NOT NULL DEFAULT ARRAY['*'],
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.priori_teacher_auth ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

DO $$
BEGIN
    ALTER TABLE public.priori_teacher_auth DROP CONSTRAINT IF EXISTS priori_teacher_auth_auth_algo_check;
    ALTER TABLE public.priori_teacher_auth
        ADD CONSTRAINT priori_teacher_auth_auth_algo_check
        CHECK (auth_algo IN ('sha256-salted', 'bcrypt', 'disabled'));
EXCEPTION WHEN others THEN
    NULL;
END $$;

-- 1G. 伺服器簽發之短期教師工作階段憑證
CREATE TABLE IF NOT EXISTS public.priori_teacher_sessions (
    token_hash TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL REFERENCES public.priori_teacher_auth(teacher_id) ON DELETE CASCADE,
    allowed_classes TEXT[] NOT NULL DEFAULT ARRAY['*'],
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_priori_teacher_sessions_exp ON public.priori_teacher_sessions(expires_at);

-- 1H. 公開 leaderboard 舊資料封存備份表與遷移稽核紀錄表（完全封鎖匿名與一般使用者存取）
CREATE TABLE IF NOT EXISTS public.priori_legacy_leaderboard_backup (
    id UUID PRIMARY KEY,
    original_row JSONB NOT NULL,
    migration_status TEXT NOT NULL DEFAULT 'pending',
    target_record_key TEXT,
    migration_note TEXT,
    backed_up_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.priori_legacy_leaderboard_backup ADD COLUMN IF NOT EXISTS migration_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.priori_legacy_leaderboard_backup ADD COLUMN IF NOT EXISTS target_record_key TEXT;
ALTER TABLE public.priori_legacy_leaderboard_backup ADD COLUMN IF NOT EXISTS migration_note TEXT;

CREATE TABLE IF NOT EXISTS public.priori_legacy_migration_issues (
    issue_id BIGSERIAL PRIMARY KEY,
    legacy_id UUID,
    mode TEXT NOT NULL,
    issue_type TEXT NOT NULL, -- 'unparseable_json' | 'invalid_key' | 'invalid_field_type' | 'merged_duplicate' | 'superseded_roster'
    student_key TEXT,
    paper_id TEXT,
    detail TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ── 2. 全面啟用 RLS 並撤銷直接資料表存取 ────────────────────
ALTER TABLE public.priori_student_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_student_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_student_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_teacher_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_teacher_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_legacy_leaderboard_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priori_legacy_migration_issues ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.priori_student_directory FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_records FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_rosters FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_student_bindings FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_student_sessions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_teacher_auth FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_teacher_sessions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_legacy_leaderboard_backup FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.priori_legacy_migration_issues FROM PUBLIC, anon, authenticated;

-- ── 3. 保全、決定性合併遷移公開 leaderboard 舊資料並核對後再清理 ──
DO $$
DECLARE
    v_source_ids UUID[] := ARRAY[]::UUID[];
    v_verified_source_ids UUID[] := ARRAY[]::UUID[];
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
    v_first_at TIMESTAMPTZ;
    v_existing RECORD;
    v_existing_first_at TIMESTAMPTZ;
    v_existing_has_first BOOLEAN;
    v_row_has_first BOOLEAN;
    v_raw_first_score INT;
    v_raw_first_correct INT;
    v_field_valid BOOLEAN;
    v_field_err TEXT;
    v_is_newer_latest BOOLEAN;
    v_use_incoming_baseline BOOLEAN;
    v_baseline_src JSONB;
    v_baseline_at TIMESTAMPTZ;
    v_expected_first_score INT;
    v_merged_payload JSONB;
    v_migrated_or_merged INT := 0;
    v_quarantined_issues INT := 0;
    v_expected_key RECORD;
    v_actual_row RECORD;
    v_has_roster_winner BOOLEAN := FALSE;
BEGIN
    IF to_regclass('public.leaderboard') IS NULL THEN
        RETURN;
    END IF;

    -- 先在同一交易內鎖定公開表並立即安裝寫入與讀取封鎖，杜絕備份快照後仍寫入的新紀錄遭到誤刪
    LOCK TABLE public.leaderboard IN SHARE ROW EXCLUSIVE MODE;

    DROP POLICY IF EXISTS "Allow public read leaderboard" ON public.leaderboard;
    CREATE POLICY "Allow public read leaderboard" ON public.leaderboard
        FOR SELECT
        USING (mode IS DISTINCT FROM 'priori-record' AND mode IS DISTINCT FROM 'priori-roster');

    DROP POLICY IF EXISTS "Allow public insert leaderboard" ON public.leaderboard;
    CREATE POLICY "Allow public insert leaderboard" ON public.leaderboard
        FOR INSERT
        WITH CHECK (mode IS DISTINCT FROM 'priori-record' AND mode IS DISTINCT FROM 'priori-roster');

    DROP POLICY IF EXISTS "Allow public update leaderboard" ON public.leaderboard;
    CREATE POLICY "Allow public update leaderboard" ON public.leaderboard
        FOR UPDATE
        USING (mode IS DISTINCT FROM 'priori-record' AND mode IS DISTINCT FROM 'priori-roster')
        WITH CHECK (mode IS DISTINCT FROM 'priori-record' AND mode IS DISTINCT FROM 'priori-roster');

    DROP POLICY IF EXISTS "Allow public delete leaderboard" ON public.leaderboard;
    CREATE POLICY "Allow public delete leaderboard" ON public.leaderboard
        FOR DELETE
        USING (mode IS DISTINCT FROM 'priori-record' AND mode IS DISTINCT FROM 'priori-roster');

    ALTER TABLE public.leaderboard DROP CONSTRAINT IF EXISTS chk_leaderboard_no_priori;
    ALTER TABLE public.leaderboard
        ADD CONSTRAINT chk_leaderboard_no_priori
        CHECK (mode NOT IN ('priori-record', 'priori-roster')) NOT VALID;

    -- 鎖定後才擷取唯一待搬移來源主鍵清單（後續備份、搬移與刪除嚴格限定於此集合）
    SELECT COALESCE(array_agg(id ORDER BY created_at ASC, id ASC), ARRAY[]::UUID[])
    INTO v_source_ids
    FROM public.leaderboard
    WHERE mode IN ('priori-record', 'priori-roster');

    v_legacy_count := COALESCE(array_length(v_source_ids, 1), 0);

    IF v_legacy_count > 0 THEN
        CREATE TEMP TABLE tmp_expected_priori_winners (
            record_key TEXT PRIMARY KEY,
            expected_score INT NOT NULL,
            expected_first_score INT,
            expected_updated_at TIMESTAMPTZ NOT NULL
        ) ON COMMIT DROP;

        -- 步驟 3.1：完整封存全部已鎖定來源列至受 RLS 保護之備份表
        INSERT INTO public.priori_legacy_leaderboard_backup (id, original_row, migration_status)
        SELECT l.id, to_jsonb(l), 'backed_up'
        FROM public.leaderboard l
        WHERE l.id = ANY(v_source_ids)
        ON CONFLICT (id) DO UPDATE
            SET original_row = EXCLUDED.original_row;

        SELECT COUNT(*) INTO v_backup_count
        FROM public.priori_legacy_leaderboard_backup b
        WHERE b.id = ANY(v_source_ids);

        IF v_backup_count <> v_legacy_count THEN
            RAISE EXCEPTION '備份筆數 (%) 與鎖定來源紀錄數 (%) 不符，已中止刪除以保全學生資料', v_backup_count, v_legacy_count;
        END IF;

        -- 步驟 3.2：逐筆讀取鎖定快照內之舊版 priori-record（安全驗證 JSON 與數值型別，分別挑選最新作答與最早有效初測基線）
        FOR v_rec IN
            SELECT id, name, book, score, time, created_at
            FROM public.leaderboard
            WHERE id = ANY(v_source_ids) AND mode = 'priori-record'
            ORDER BY created_at ASC, score ASC, id ASC
        LOOP
            BEGIN
                v_payload := v_rec.book::jsonb;
            EXCEPTION WHEN others THEN
                v_payload := NULL;
            END;

            IF v_payload IS NULL OR jsonb_typeof(v_payload) <> 'object' THEN
                v_quarantined_issues := v_quarantined_issues + 1;
                INSERT INTO public.priori_legacy_migration_issues (legacy_id, mode, issue_type, detail)
                VALUES (v_rec.id, 'priori-record', 'unparseable_json', 'book 欄位無法解析為 JSON 物件');
                UPDATE public.priori_legacy_leaderboard_backup
                SET migration_status = 'unparseable_json',
                    migration_note = 'book 欄位無法解析為 JSON 物件'
                WHERE id = v_rec.id;
                CONTINUE;
            END IF;

            v_sk := trim(COALESCE(v_payload->>'studentKey', ''));
            v_pid := trim(COALESCE(v_payload->>'paperId', ''));
            IF v_sk !~ '^\d{6}$' OR v_sk = '999999' OR char_length(v_pid) < 3 OR char_length(v_pid) > 64 THEN
                v_quarantined_issues := v_quarantined_issues + 1;
                INSERT INTO public.priori_legacy_migration_issues (legacy_id, mode, issue_type, student_key, paper_id, detail)
                VALUES (v_rec.id, 'priori-record', 'invalid_key', v_sk, v_pid, '缺少合法 6 碼座號或 paperId，略過搬移並保留備份');
                UPDATE public.priori_legacy_leaderboard_backup
                SET migration_status = 'invalid_key',
                    migration_note = format('invalid studentKey=%s paperId=%s', v_sk, v_pid)
                WHERE id = v_rec.id;
                CONTINUE;
            END IF;

            -- 安全驗證可選整數與基線欄位型別（防止 22P02 中斷整批遷移；非法欄位改寫入稽核隔離表）
            v_field_valid := TRUE;
            v_field_err := '';
            v_score := NULL;
            v_elapsed := NULL;
            v_raw_first_score := NULL;
            v_raw_first_correct := NULL;
            BEGIN
                IF (v_payload ? 'latestScore') AND jsonb_typeof(v_payload->'latestScore') <> 'null' THEN
                    IF jsonb_typeof(v_payload->'latestScore') NOT IN ('number', 'string') THEN
                        RAISE EXCEPTION 'latestScore 必須為整數';
                    END IF;
                    v_score := (v_payload->>'latestScore')::int;
                END IF;
                IF v_score IS NULL AND (v_payload ? 'score') AND jsonb_typeof(v_payload->'score') <> 'null' THEN
                    IF jsonb_typeof(v_payload->'score') NOT IN ('number', 'string') THEN
                        RAISE EXCEPTION 'score 必須為整數';
                    END IF;
                    v_score := (v_payload->>'score')::int;
                ELSIF (v_payload ? 'score') AND jsonb_typeof(v_payload->'score') <> 'null' THEN
                    IF jsonb_typeof(v_payload->'score') NOT IN ('number', 'string') THEN
                        RAISE EXCEPTION 'score 必須為整數';
                    END IF;
                    PERFORM (v_payload->>'score')::int;
                END IF;
                v_score := LEAST(100, GREATEST(0, COALESCE(v_score, v_rec.score, 0)));

                IF (v_payload ? 'elapsedSeconds') AND jsonb_typeof(v_payload->'elapsedSeconds') <> 'null' THEN
                    IF jsonb_typeof(v_payload->'elapsedSeconds') NOT IN ('number', 'string') THEN
                        RAISE EXCEPTION 'elapsedSeconds 必須為整數';
                    END IF;
                    v_elapsed := (v_payload->>'elapsedSeconds')::int;
                END IF;
                v_elapsed := LEAST(7200, GREATEST(0, COALESCE(v_elapsed, v_rec.time, 0)));

                IF (v_payload ? 'firstScore') AND jsonb_typeof(v_payload->'firstScore') <> 'null' THEN
                    IF jsonb_typeof(v_payload->'firstScore') NOT IN ('number', 'string') THEN
                        RAISE EXCEPTION 'firstScore 必須為整數';
                    END IF;
                    v_raw_first_score := LEAST(100, GREATEST(0, (v_payload->>'firstScore')::int));
                END IF;

                IF (v_payload ? 'firstCorrectCount') AND jsonb_typeof(v_payload->'firstCorrectCount') <> 'null' THEN
                    IF jsonb_typeof(v_payload->'firstCorrectCount') NOT IN ('number', 'string') THEN
                        RAISE EXCEPTION 'firstCorrectCount 必須為整數';
                    END IF;
                    v_raw_first_correct := GREATEST(0, (v_payload->>'firstCorrectCount')::int);
                END IF;

                IF (v_payload ? 'firstAnswers') AND jsonb_typeof(v_payload->'firstAnswers') NOT IN ('null', 'object') THEN
                    RAISE EXCEPTION 'firstAnswers 必須為 JSON 物件';
                END IF;
            EXCEPTION WHEN others THEN
                v_field_valid := FALSE;
                v_field_err := SQLERRM;
            END;

            IF NOT v_field_valid THEN
                v_quarantined_issues := v_quarantined_issues + 1;
                INSERT INTO public.priori_legacy_migration_issues (legacy_id, mode, issue_type, student_key, paper_id, detail)
                VALUES (v_rec.id, 'priori-record', 'invalid_field_type', v_sk, v_pid, format('JSON 欄位型別不合法，已隔離保留備份 (%s)', v_field_err));
                UPDATE public.priori_legacy_leaderboard_backup
                SET migration_status = 'invalid_field_type',
                    migration_note = format('invalid field type: %s', v_field_err)
                WHERE id = v_rec.id;
                CONTINUE;
            END IF;

            v_grade := COALESCE(NULLIF(ltrim(substring(v_sk, 1, 2), '0'), ''), '1');
            v_class := COALESCE(NULLIF(ltrim(substring(v_sk, 3, 2), '0'), ''), '1');
            v_seat := substring(v_sk, 5, 2);

            -- 確保合法歷史座號註冊於權威名錄
            INSERT INTO public.priori_student_directory (student_key, grade, class_num, seat, active, source)
            VALUES (v_sk, v_grade, v_class, v_seat, TRUE, 'legacy_migration')
            ON CONFLICT (student_key) DO NOTHING;

            SELECT grade, class_num, seat
            INTO v_grade, v_class, v_seat
            FROM public.priori_student_directory
            WHERE student_key = v_sk;

            BEGIN
                v_updated := COALESCE(
                    NULLIF(trim(v_payload->>'updatedAt'), '')::timestamptz,
                    NULLIF(trim(v_payload->>'completedAt'), '')::timestamptz,
                    v_rec.created_at,
                    timezone('utc'::text, now())
                );
            EXCEPTION WHEN others THEN
                v_updated := COALESCE(v_rec.created_at, timezone('utc'::text, now()));
            END;

            BEGIN
                v_first_at := COALESCE(
                    NULLIF(trim(v_payload->>'firstSubmittedAt'), '')::timestamptz,
                    NULLIF(trim(v_payload->>'completedAt'), '')::timestamptz,
                    v_updated
                );
            EXCEPTION WHEN others THEN
                v_first_at := v_updated;
            END;

            v_row_has_first := (v_raw_first_score IS NOT NULL)
                OR ((v_payload ? 'firstAnswers') AND jsonb_typeof(v_payload->'firstAnswers') = 'object');

            v_rkey := 'priori_' || v_sk || '_' || v_pid;
            v_payload := v_payload || jsonb_build_object(
                'studentKey', v_sk,
                'paperId', v_pid,
                'grade', v_grade,
                'classNum', v_class,
                'seat', v_seat,
                'score', v_score,
                'latestScore', v_score
            );
            IF v_row_has_first THEN
                v_payload := v_payload || jsonb_build_object(
                    'firstSubmittedAt', v_first_at,
                    'firstScore', COALESCE(v_raw_first_score, v_score)
                );
                IF v_raw_first_correct IS NOT NULL THEN
                    v_payload := v_payload || jsonb_build_object('firstCorrectCount', v_raw_first_correct);
                END IF;
            END IF;

            SELECT record_key, score, elapsed_seconds, payload, updated_at
            INTO v_existing
            FROM public.priori_records
            WHERE record_key = v_rkey;

            IF NOT FOUND THEN
                INSERT INTO public.priori_records (
                    record_key, student_key, paper_id, grade, class_num, seat,
                    score, elapsed_seconds, payload, updated_at
                )
                VALUES (
                    v_rkey, v_sk, v_pid, v_grade, v_class, v_seat,
                    v_score, v_elapsed, v_payload, v_updated
                );

                v_expected_first_score := CASE
                    WHEN v_row_has_first THEN COALESCE(v_raw_first_score, v_score)
                    ELSE NULL
                END;

                INSERT INTO tmp_expected_priori_winners (record_key, expected_score, expected_first_score, expected_updated_at)
                VALUES (v_rkey, v_score, v_expected_first_score, v_updated)
                ON CONFLICT (record_key) DO UPDATE SET
                    expected_score = EXCLUDED.expected_score,
                    expected_first_score = EXCLUDED.expected_first_score,
                    expected_updated_at = EXCLUDED.expected_updated_at;

                UPDATE public.priori_legacy_leaderboard_backup
                SET migration_status = 'migrated',
                    target_record_key = v_rkey,
                    migration_note = format('migrated score=%s', v_score)
                WHERE id = v_rec.id;
                v_migrated_or_merged := v_migrated_or_merged + 1;
            ELSE
                -- 已存在同生同卷：獨立挑選「最新作答」與「最早有效初測（日期＋答案＋分數＋題數）」
                v_existing_has_first := (
                    ((v_existing.payload ? 'firstScore') AND jsonb_typeof(v_existing.payload->'firstScore') <> 'null')
                    OR ((v_existing.payload ? 'firstAnswers') AND jsonb_typeof(v_existing.payload->'firstAnswers') = 'object')
                );
                BEGIN
                    v_existing_first_at := COALESCE(
                        NULLIF(trim(v_existing.payload->>'firstSubmittedAt'), '')::timestamptz,
                        NULLIF(trim(v_existing.payload->>'completedAt'), '')::timestamptz,
                        v_existing.updated_at
                    );
                EXCEPTION WHEN others THEN
                    v_existing_first_at := v_existing.updated_at;
                END;

                v_is_newer_latest := (v_updated > v_existing.updated_at)
                    OR (v_updated = v_existing.updated_at AND v_score >= v_existing.score);

                v_use_incoming_baseline := v_row_has_first AND (
                    NOT v_existing_has_first
                    OR v_first_at < v_existing_first_at
                    OR (
                        v_first_at = v_existing_first_at
                        AND COALESCE(v_raw_first_score, v_score) < COALESCE((v_existing.payload->>'firstScore')::int, v_existing.score)
                    )
                );

                v_merged_payload := CASE WHEN v_is_newer_latest THEN v_payload ELSE v_existing.payload END;

                IF v_row_has_first OR v_existing_has_first THEN
                    v_baseline_src := CASE WHEN v_use_incoming_baseline THEN v_payload ELSE v_existing.payload END;
                    v_baseline_at := CASE WHEN v_use_incoming_baseline THEN v_first_at ELSE v_existing_first_at END;
                    v_merged_payload := (v_merged_payload - 'firstScore' - 'firstAnswers' - 'firstCorrectCount' - 'firstSubmittedAt')
                        || jsonb_build_object(
                            'firstSubmittedAt', v_baseline_at,
                            'firstScore', v_baseline_src->'firstScore'
                        );
                    IF v_baseline_src ? 'firstAnswers' AND jsonb_typeof(v_baseline_src->'firstAnswers') = 'object' THEN
                        v_merged_payload := v_merged_payload || jsonb_build_object('firstAnswers', v_baseline_src->'firstAnswers');
                    END IF;
                    IF v_baseline_src ? 'firstCorrectCount' AND jsonb_typeof(v_baseline_src->'firstCorrectCount') <> 'null' THEN
                        v_merged_payload := v_merged_payload || jsonb_build_object('firstCorrectCount', v_baseline_src->'firstCorrectCount');
                    END IF;
                    v_expected_first_score := (v_baseline_src->>'firstScore')::int;
                ELSE
                    v_expected_first_score := NULL;
                END IF;

                UPDATE public.priori_records
                SET grade = v_grade,
                    class_num = v_class,
                    seat = v_seat,
                    score = CASE WHEN v_is_newer_latest THEN v_score ELSE v_existing.score END,
                    elapsed_seconds = CASE WHEN v_is_newer_latest THEN v_elapsed ELSE v_existing.elapsed_seconds END,
                    payload = v_merged_payload,
                    updated_at = CASE WHEN v_is_newer_latest THEN v_updated ELSE v_existing.updated_at END
                WHERE record_key = v_rkey;

                INSERT INTO tmp_expected_priori_winners (record_key, expected_score, expected_first_score, expected_updated_at)
                VALUES (
                    v_rkey,
                    CASE WHEN v_is_newer_latest THEN v_score ELSE v_existing.score END,
                    v_expected_first_score,
                    CASE WHEN v_is_newer_latest THEN v_updated ELSE v_existing.updated_at END
                )
                ON CONFLICT (record_key) DO UPDATE SET
                    expected_score = EXCLUDED.expected_score,
                    expected_first_score = EXCLUDED.expected_first_score,
                    expected_updated_at = EXCLUDED.expected_updated_at;

                INSERT INTO public.priori_legacy_migration_issues (legacy_id, mode, issue_type, student_key, paper_id, detail)
                VALUES (
                    v_rec.id,
                    'priori-record',
                    'merged_duplicate',
                    v_sk,
                    v_pid,
                    format('偵測同生同卷重複列，已依最新時間／分數規則整併並保留最早初測基準 (prev_score=%s, row_score=%s)', v_existing.score, v_score)
                );
                UPDATE public.priori_legacy_leaderboard_backup
                SET migration_status = 'merged_duplicate',
                    target_record_key = v_rkey,
                    migration_note = format('merged score=%s (prev=%s)', v_score, v_existing.score)
                WHERE id = v_rec.id;
                v_migrated_or_merged := v_migrated_or_merged + 1;
            END IF;
        END LOOP;

        -- 步驟 3.3：決定性遷移鎖定快照內最新有效之 priori-roster，並標記舊重複名冊
        FOR v_rec IN
            SELECT id, book, time, created_at
            FROM public.leaderboard
            WHERE id = ANY(v_source_ids) AND mode = 'priori-roster'
            ORDER BY created_at DESC, id DESC
        LOOP
            BEGIN
                v_payload := v_rec.book::jsonb;
            EXCEPTION WHEN others THEN
                v_payload := NULL;
            END;

            IF v_payload IS NULL OR jsonb_typeof(v_payload) <> 'object' THEN
                v_quarantined_issues := v_quarantined_issues + 1;
                INSERT INTO public.priori_legacy_migration_issues (legacy_id, mode, issue_type, detail)
                VALUES (v_rec.id, 'priori-roster', 'unparseable_json', '名冊 book 欄位無法解析為 JSON 物件');
                UPDATE public.priori_legacy_leaderboard_backup
                SET migration_status = 'unparseable_json',
                    migration_note = 'roster json parse failed'
                WHERE id = v_rec.id;
                CONTINUE;
            END IF;

            IF NOT v_has_roster_winner THEN
                INSERT INTO public.priori_rosters (roster_key, envelope, entry_count, updated_at)
                VALUES (
                    'priori_school_roster_v1',
                    v_payload,
                    GREATEST(0, COALESCE(v_rec.time, 0)),
                    COALESCE(v_rec.created_at, timezone('utc'::text, now()))
                )
                ON CONFLICT (roster_key) DO UPDATE SET
                    envelope = EXCLUDED.envelope,
                    entry_count = EXCLUDED.entry_count,
                    updated_at = EXCLUDED.updated_at
                WHERE public.priori_rosters.updated_at <= EXCLUDED.updated_at;

                v_has_roster_winner := TRUE;
                UPDATE public.priori_legacy_leaderboard_backup
                SET migration_status = 'migrated',
                    target_record_key = 'priori_school_roster_v1',
                    migration_note = 'migrated latest roster envelope'
                WHERE id = v_rec.id;
                v_migrated_or_merged := v_migrated_or_merged + 1;
            ELSE
                INSERT INTO public.priori_legacy_migration_issues (legacy_id, mode, issue_type, detail)
                VALUES (v_rec.id, 'priori-roster', 'superseded_roster', '已被更新之名冊紀錄取代，原列保留於封存備份表');
                UPDATE public.priori_legacy_leaderboard_backup
                SET migration_status = 'superseded_roster',
                    target_record_key = 'priori_school_roster_v1',
                    migration_note = 'older duplicate roster archived'
                WHERE id = v_rec.id;
                v_migrated_or_merged := v_migrated_or_merged + 1;
            END IF;
        END LOOP;

        -- 步驟 3.4：清理公開表前強制逐筆驗證：總數吻合＋備份終態完整＋新表每組 (student_key, paper_id) 分數等於預期贏家
        IF (v_migrated_or_merged + v_quarantined_issues) <> v_legacy_count THEN
            RAISE EXCEPTION '遷移稽核不符 (處理=% + 異常=% != 原始=%)，已中止清理', v_migrated_or_merged, v_quarantined_issues, v_legacy_count;
        END IF;

        SELECT COALESCE(array_agg(b.id), ARRAY[]::UUID[])
        INTO v_verified_source_ids
        FROM public.priori_legacy_leaderboard_backup b
        WHERE b.id = ANY(v_source_ids)
          AND b.migration_status IN (
              'migrated',
              'merged_duplicate',
              'superseded_roster',
              'unparseable_json',
              'invalid_key',
              'invalid_field_type'
          );

        IF COALESCE(array_length(v_verified_source_ids, 1), 0) <> v_legacy_count THEN
            RAISE EXCEPTION '封存狀態核對未完成 (完成=% / 鎖定來源=%)，已中止刪除公開表資料',
                COALESCE(array_length(v_verified_source_ids, 1), 0), v_legacy_count;
        END IF;

        FOR v_expected_key IN SELECT * FROM tmp_expected_priori_winners LOOP
            SELECT record_key, score, (payload->>'firstScore')::int AS first_score INTO v_actual_row
            FROM public.priori_records
            WHERE record_key = v_expected_key.record_key;

            IF NOT FOUND
               OR v_actual_row.score <> v_expected_key.expected_score
               OR (v_expected_key.expected_first_score IS NOT NULL AND v_actual_row.first_score IS DISTINCT FROM v_expected_key.expected_first_score) THEN
                RAISE EXCEPTION '新表核對失敗 (% 預期分數 % / 初測 %，實際 % / %)，已中止清理公開表',
                    v_expected_key.record_key, v_expected_key.expected_score, v_expected_key.expected_first_score,
                    v_actual_row.score, v_actual_row.first_score;
            END IF;
        END LOOP;

        -- 核對無誤後僅依已驗證來源主鍵清單自公開 leaderboard 移除
        DELETE FROM public.leaderboard
        WHERE id = ANY(v_verified_source_ids);
    END IF;

    -- 步驟 3.5（同一交易驗證完成）：正式 VALIDATE CHECK 約束，雙重永久封鎖 PRIORI 資料進公開表
    ALTER TABLE public.leaderboard VALIDATE CONSTRAINT chk_leaderboard_no_priori;
END $$;

-- ── 4. 清除舊前端預設雜湊，設定全新 bcrypt 教師密碼 ──────────
DO $$
DECLARE
    -- ★ 請於執行前替換下方佔位字串為您的全新管理教師密碼（至少 8 碼）：
    v_admin_pw TEXT := '__REPLACE_WITH_ADMIN_NEW_PASSWORD__';
    v_has_active_bcrypt BOOLEAN := FALSE;
BEGIN
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

    IF trim(COALESCE(v_admin_pw, '')) IN ('', '__REPLACE_WITH_' || 'ADMIN_NEW_PASSWORD__') THEN
        IF NOT v_has_active_bcrypt THEN
            RAISE EXCEPTION '請先將腳本內 v_admin_pw 的佔位字串替換為至少 8 碼的新管理教師密碼再執行 Run！';
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

-- ── 5. 清除所有舊版／不一致之函式簽章（防多載繞過與 42883 衝突） ──
DROP FUNCTION IF EXISTS public.priori_student_login_seat(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.priori_student_get_records(TEXT);
DROP FUNCTION IF EXISTS public.priori_student_upsert_record(TEXT, TEXT, TEXT, TEXT, TEXT, INT, INT, JSONB);
DROP FUNCTION IF EXISTS public.priori_teacher_get_roster(TEXT);
DROP FUNCTION IF EXISTS public.priori_teacher_save_roster(TEXT, JSONB, INT);

-- ── 6. 內部輔助函式（不開放 PUBLIC / anon / authenticated 呼叫） ──
CREATE OR REPLACE FUNCTION public.priori_internal_generate_activation_code()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    SELECT lpad(
        ((get_byte(extensions.gen_random_bytes(1), 0)::bigint << 24
        | get_byte(extensions.gen_random_bytes(1), 0)::bigint << 16
        | get_byte(extensions.gen_random_bytes(1), 0)::bigint << 8
        | get_byte(extensions.gen_random_bytes(1), 0)::bigint) % 900000 + 100000)::text,
        6,
        '0'
    );
$$;

REVOKE ALL ON FUNCTION public.priori_internal_generate_activation_code() FROM PUBLIC, anon, authenticated;

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
    JOIN public.priori_student_directory d ON d.student_key = s.student_key AND d.active = TRUE
    WHERE s.token_hash = v_token_hash
      AND s.expires_at > timezone('utc'::text, now())
      AND b.pin_hash IS NOT NULL
      AND b.activation_code_hash IS NULL
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

CREATE OR REPLACE FUNCTION public.priori_internal_class_in_scope(
    p_allowed_classes TEXT[],
    p_grade TEXT,
    p_class_num TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_g TEXT := COALESCE(NULLIF(ltrim(trim(COALESCE(p_grade, '')), '0'), ''), '0');
    v_c TEXT := COALESCE(NULLIF(ltrim(trim(COALESCE(p_class_num, '')), '0'), ''), '0');
    v_item TEXT;
    v_parts TEXT[];
BEGIN
    IF '*' = ANY(p_allowed_classes) THEN
        RETURN TRUE;
    END IF;
    FOREACH v_item IN ARRAY COALESCE(p_allowed_classes, ARRAY[]::TEXT[])
    LOOP
        v_parts := string_to_array(v_item, '-');
        IF COALESCE(NULLIF(ltrim(trim(COALESCE(v_parts[1], '')), '0'), ''), '0') = v_g
           AND COALESCE(NULLIF(ltrim(trim(COALESCE(v_parts[2], '')), '0'), ''), '0') = v_c THEN
            RETURN TRUE;
        END IF;
    END LOOP;
    RETURN FALSE;
END;
$$;

REVOKE ALL ON FUNCTION public.priori_internal_class_in_scope(TEXT[], TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- ── 7. 學生 RPC：教師一次性啟用碼首次啟用 ＋ 同機免密 ＋ 換機 4 碼小密碼 ──
CREATE OR REPLACE FUNCTION public.priori_student_login_seat(
    p_student_key TEXT,
    p_device_secret TEXT,
    p_transfer_pin TEXT DEFAULT NULL,
    p_activation_code TEXT DEFAULT NULL
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
    v_act TEXT := trim(COALESCE(p_activation_code, ''));
    v_dev_hash TEXT;
    v_dir public.priori_student_directory%ROWTYPE;
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

    SELECT *
    INTO v_dir
    FROM public.priori_student_directory
    WHERE student_key = v_key
      AND active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Forbidden: student seat not in active school directory' USING ERRCODE = '42501';
    END IF;

    DELETE FROM public.priori_student_sessions
    WHERE expires_at <= v_now;

    v_dev_hash := encode(extensions.digest(convert_to(v_secret, 'UTF8'), 'sha256'), 'hex');

    SELECT *
    INTO v_bind
    FROM public.priori_student_bindings
    WHERE student_key = v_key
    FOR UPDATE;

    -- 情境 A：此座號從未由教師發放啟用碼或尚未建立綁定列 -> 嚴禁匿名裝置搶先綁定
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'authorized', false,
            'status', 'needs_activation',
            'has_active_code', false,
            'has_records', EXISTS (SELECT 1 FROM public.priori_records WHERE student_key = v_key)
        );
    END IF;

    -- 情境 B：已完成啟用且為同一台已信任裝置 -> 永久免輸入啟用碼／密碼直接登入
    IF v_bind.pin_hash IS NOT NULL
       AND v_bind.activation_code_hash IS NULL
       AND v_dev_hash = ANY(v_bind.authorized_device_hashes) THEN
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

    -- 情境 C：等待首次啟用或教師重設後待重新啟用（必須核對教師發放的一次性 6 碼啟用碼 ＋ 自設 4 碼換機密碼）
    IF v_bind.pin_hash IS NULL OR v_bind.activation_code_hash IS NOT NULL THEN
        IF v_bind.pin_locked_until IS NOT NULL AND v_bind.pin_locked_until > v_now THEN
            RETURN jsonb_build_object(
                'authorized', false,
                'status', 'activation_locked',
                'locked_until', v_bind.pin_locked_until,
                'has_active_code', (v_bind.activation_code_hash IS NOT NULL AND v_bind.activation_expires_at > v_now),
                'remaining_attempts', 0
            );
        END IF;

        IF v_bind.activation_code_hash IS NULL
           OR v_bind.activation_expires_at IS NULL
           OR v_bind.activation_expires_at <= v_now THEN
            RETURN jsonb_build_object(
                'authorized', false,
                'status', 'needs_activation',
                'has_active_code', false,
                'has_records', EXISTS (SELECT 1 FROM public.priori_records WHERE student_key = v_key)
            );
        END IF;

        IF v_act = '' AND v_pin = '' THEN
            RETURN jsonb_build_object(
                'authorized', false,
                'status', 'needs_activation',
                'has_active_code', true,
                'remaining_attempts', GREATEST(1, 5 - COALESCE(v_bind.pin_failed_attempts, 0)),
                'has_records', EXISTS (SELECT 1 FROM public.priori_records WHERE student_key = v_key)
            );
        END IF;

        IF v_pin !~ '^\d{4}$' THEN
            RETURN jsonb_build_object(
                'authorized', false,
                'status', 'invalid_pin_format',
                'has_active_code', true,
                'remaining_attempts', GREATEST(1, 5 - COALESCE(v_bind.pin_failed_attempts, 0))
            );
        END IF;

        IF v_act !~ '^\d{6}$' OR extensions.crypt(v_act, v_bind.activation_code_hash) <> v_bind.activation_code_hash THEN
            v_fail := COALESCE(v_bind.pin_failed_attempts, 0) + 1;
            IF v_fail >= 5 THEN
                UPDATE public.priori_student_bindings
                SET pin_failed_attempts = v_fail,
                    pin_locked_until = v_now + interval '15 minutes',
                    updated_at = v_now
                WHERE student_key = v_key;

                RETURN jsonb_build_object(
                    'authorized', false,
                    'status', 'activation_locked',
                    'has_active_code', true,
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
                'status', 'invalid_activation_code',
                'has_active_code', true,
                'remaining_attempts', GREATEST(0, 5 - v_fail)
            );
        END IF;

        -- 一次性啟用碼核對成功：立即作廢啟用碼並綁定此裝置＋設定 4 碼換機小密碼
        UPDATE public.priori_student_bindings
        SET pin_hash = extensions.crypt(v_pin, extensions.gen_salt('bf', 8)),
            activation_code_hash = NULL,
            activation_expires_at = NULL,
            activated_at = v_now,
            authorized_device_hashes = ARRAY[v_dev_hash],
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
            'status', 'activated_new',
            'token', v_token,
            'student_key', v_key,
            'expires_at', v_expires
        );
    END IF;

    -- 情境 D：已啟用座號切換至另一台新 iPad／手機 -> 僅核對學生自設 4 碼換機密碼
    IF v_bind.pin_locked_until IS NOT NULL AND v_bind.pin_locked_until > v_now THEN
        RETURN jsonb_build_object(
            'authorized', false,
            'status', 'pin_locked',
            'locked_until', v_bind.pin_locked_until,
            'remaining_attempts', 0
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

-- ── 8. 學生 RPC：讀取與寫入（由權威名錄鎖定年級／班級／座號） ──
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
                'grade', d.grade,
                'class_num', d.class_num,
                'seat', d.seat,
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
    JOIN public.priori_student_directory d ON d.student_key = r.student_key AND d.active = TRUE
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
    v_dir public.priori_student_directory%ROWTYPE;
    v_paper TEXT := trim(COALESCE(p_paper_id, ''));
    v_req_g TEXT := NULLIF(ltrim(trim(COALESCE(p_grade, '')), '0'), '');
    v_req_c TEXT := NULLIF(ltrim(trim(COALESCE(p_class_num, '')), '0'), '');
    v_req_s TEXT := NULLIF(ltrim(trim(COALESCE(p_seat, '')), '0'), '');
    v_dir_s TEXT;
    v_record_key TEXT;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_clean_payload JSONB;
BEGIN
    SELECT * INTO v_sess
    FROM public.priori_internal_assert_student(p_token, p_student_key);

    SELECT * INTO v_dir
    FROM public.priori_student_directory
    WHERE student_key = v_sess.student_key
      AND active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Forbidden: student not in active directory' USING ERRCODE = '42501';
    END IF;

    v_dir_s := NULLIF(ltrim(v_dir.seat, '0'), '');
    IF (v_req_g IS NOT NULL AND v_req_g <> v_dir.grade)
       OR (v_req_c IS NOT NULL AND v_req_c <> v_dir.class_num)
       OR (v_req_s IS NOT NULL AND v_req_s <> COALESCE(v_dir_s, '0')) THEN
        RAISE EXCEPTION 'Forbidden: grade, class or seat tampered against verified directory' USING ERRCODE = '42501';
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

    -- 一律以權威名錄之年級／班級／座號寫入欄位與 JSON payload
    v_clean_payload := p_payload || jsonb_build_object(
        'studentKey', v_sess.student_key,
        'paperId', v_paper,
        'grade', v_dir.grade,
        'classNum', v_dir.class_num,
        'seat', v_dir.seat
    );
    v_record_key := 'priori_' || v_sess.student_key || '_' || v_paper;

    INSERT INTO public.priori_records (
        record_key, student_key, paper_id, grade, class_num, seat,
        score, elapsed_seconds, payload, updated_at
    )
    VALUES (
        v_record_key,
        v_sess.student_key,
        v_paper,
        v_dir.grade,
        v_dir.class_num,
        v_dir.seat,
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
    -- 釋放後仍移除該座號綁定（必須由教師重新發放一次性啟用碼才可再認領）
    DELETE FROM public.priori_student_bindings WHERE student_key = v_sess.student_key;
    RETURN jsonb_build_object('released', true);
END;
$$;

-- ── 9. 教師 RPC：登入、登出、名錄與紀錄查詢、一次性啟用碼發放與重設 ──
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
    v_scope_ok BOOLEAN := FALSE;
    v_item TEXT;
    v_parts TEXT[];
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    IF NOT ('*' = ANY(v_sess.allowed_classes)) AND (v_req_g IS NOT NULL OR v_req_c IS NOT NULL) THEN
        FOREACH v_item IN ARRAY v_sess.allowed_classes
        LOOP
            v_parts := string_to_array(v_item, '-');
            IF (v_req_g IS NULL OR ltrim(COALESCE(v_parts[1], ''), '0') = v_req_g)
               AND (v_req_c IS NULL OR ltrim(COALESCE(v_parts[2], ''), '0') = v_req_c) THEN
                v_scope_ok := TRUE;
                EXIT;
            END IF;
        END LOOP;
        IF NOT v_scope_ok THEN
            RAISE EXCEPTION 'Forbidden: requested class outside teacher scope' USING ERRCODE = '42501';
        END IF;
    END IF;

    -- 教師可見範圍與輸出班級／座號一律取自權威名錄 priori_student_directory
    SELECT coalesce(
        jsonb_agg(
            jsonb_build_object(
                'record_key', r.record_key,
                'student_key', r.student_key,
                'paper_id', r.paper_id,
                'grade', d.grade,
                'class_num', d.class_num,
                'seat', d.seat,
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
    JOIN public.priori_student_directory d ON d.student_key = r.student_key AND d.active = TRUE
    WHERE public.priori_internal_class_in_scope(v_sess.allowed_classes, d.grade, d.class_num)
      AND (p_paper_id IS NULL OR r.paper_id = p_paper_id)
      AND (v_req_g IS NULL OR d.grade = v_req_g)
      AND (v_req_c IS NULL OR d.class_num = v_req_c);

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
    v_parts TEXT[];
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    IF v_key = 'priori_school_roster_v1' THEN
        IF NOT ('*' = ANY(v_sess.allowed_classes)) THEN
            RAISE EXCEPTION 'Forbidden: single-class teacher cannot read whole-school roster' USING ERRCODE = '42501';
        END IF;
    ELSIF v_key ~ '^class:\d+-\d+$' THEN
        v_class_scope := substring(v_key FROM 7);
        v_parts := string_to_array(v_class_scope, '-');
        IF NOT public.priori_internal_class_in_scope(v_sess.allowed_classes, v_parts[1], v_parts[2]) THEN
            RAISE EXCEPTION 'Forbidden: class roster outside teacher scope' USING ERRCODE = '42501';
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid roster scope key' USING ERRCODE = '22023';
    END IF;

    SELECT envelope, updated_at, entry_count
    INTO v_row
    FROM public.priori_rosters
    WHERE roster_key = v_key;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('envelope', NULL, 'updated_at', NULL, 'entry_count', 0, 'roster_key', v_key);
    END IF;

    RETURN jsonb_build_object(
        'envelope', v_row.envelope,
        'updated_at', v_row.updated_at,
        'entry_count', v_row.entry_count,
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
    v_parts TEXT[];
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    IF v_key = 'priori_school_roster_v1' THEN
        IF NOT ('*' = ANY(v_sess.allowed_classes)) THEN
            RAISE EXCEPTION 'Forbidden: only school admin teacher can modify master roster' USING ERRCODE = '42501';
        END IF;
    ELSIF v_key ~ '^class:\d+-\d+$' THEN
        v_class_scope := substring(v_key FROM 7);
        v_parts := string_to_array(v_class_scope, '-');
        IF NOT public.priori_internal_class_in_scope(v_sess.allowed_classes, v_parts[1], v_parts[2]) THEN
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

-- 9E. 教師檢視授權班級學生之裝置綁定／待啟用狀態（不含雜湊與明文碼）
CREATE OR REPLACE FUNCTION public.priori_teacher_list_bindings(
    p_token TEXT,
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
    v_req_g TEXT := NULLIF(ltrim(trim(COALESCE(p_grade, '')), '0'), '');
    v_req_c TEXT := NULLIF(ltrim(trim(COALESCE(p_class_num, '')), '0'), '');
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_rows JSONB;
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    IF NOT ('*' = ANY(v_sess.allowed_classes)) AND v_req_g IS NOT NULL AND v_req_c IS NOT NULL THEN
        IF NOT public.priori_internal_class_in_scope(v_sess.allowed_classes, v_req_g, v_req_c) THEN
            RAISE EXCEPTION 'Forbidden: class outside teacher scope' USING ERRCODE = '42501';
        END IF;
    END IF;

    SELECT coalesce(
        jsonb_agg(
            jsonb_build_object(
                'student_key', d.student_key,
                'grade', d.grade,
                'class_num', d.class_num,
                'seat', d.seat,
                'status', CASE
                    WHEN b.student_key IS NULL THEN 'unbound'
                    WHEN b.pin_locked_until IS NOT NULL AND b.pin_locked_until > v_now THEN 'locked'
                    WHEN b.pin_hash IS NULL OR b.activation_code_hash IS NOT NULL THEN
                        CASE
                            WHEN b.activation_code_hash IS NOT NULL AND b.activation_expires_at > v_now THEN 'awaiting_activation'
                            ELSE 'unbound'
                        END
                    ELSE 'bound'
                END,
                'device_count', COALESCE(array_length(b.authorized_device_hashes, 1), 0),
                'activation_expires_at', b.activation_expires_at,
                'activated_at', b.activated_at
            )
            ORDER BY d.student_key ASC
        ),
        '[]'::jsonb
    )
    INTO v_rows
    FROM public.priori_student_directory d
    LEFT JOIN public.priori_student_bindings b ON b.student_key = d.student_key
    WHERE d.active = TRUE
      AND public.priori_internal_class_in_scope(v_sess.allowed_classes, d.grade, d.class_num)
      AND (v_req_g IS NULL OR d.grade = v_req_g)
      AND (v_req_c IS NULL OR d.class_num = v_req_c);

    RETURN v_rows;
END;
$$;

-- 9F. 教師發放單一未綁定座號之「一次性 6 碼啟用碼」（防首次搶先綁走）
CREATE OR REPLACE FUNCTION public.priori_teacher_issue_activation_code(
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
    v_dir public.priori_student_directory%ROWTYPE;
    v_bind public.priori_student_bindings%ROWTYPE;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_expires TIMESTAMPTZ := v_now + interval '7 days';
    v_code TEXT;
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    IF v_key !~ '^\d{6}$' OR v_key = '999999' THEN
        RAISE EXCEPTION 'Invalid student key scope' USING ERRCODE = '22023';
    END IF;

    SELECT * INTO v_dir
    FROM public.priori_student_directory
    WHERE student_key = v_key AND active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student seat not found in active directory' USING ERRCODE = '22023';
    END IF;

    IF NOT public.priori_internal_class_in_scope(v_sess.allowed_classes, v_dir.grade, v_dir.class_num) THEN
        RAISE EXCEPTION 'Forbidden: student outside teacher class scope' USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_bind
    FROM public.priori_student_bindings
    WHERE student_key = v_key
    FOR UPDATE;

    IF FOUND AND v_bind.pin_hash IS NOT NULL AND v_bind.activation_code_hash IS NULL
       AND COALESCE(array_length(v_bind.authorized_device_hashes, 1), 0) > 0 THEN
        RETURN jsonb_build_object(
            'ok', false,
            'reason', 'already_bound',
            'student_key', v_key
        );
    END IF;

    v_code := public.priori_internal_generate_activation_code();

    INSERT INTO public.priori_student_bindings (
        student_key, pin_hash, activation_code_hash, activation_expires_at,
        authorized_device_hashes, pin_failed_attempts, pin_locked_until, created_at, updated_at
    )
    VALUES (
        v_key,
        NULL,
        extensions.crypt(v_code, extensions.gen_salt('bf', 6)),
        v_expires,
        ARRAY[]::TEXT[],
        0,
        NULL,
        v_now,
        v_now
    )
    ON CONFLICT (student_key) DO UPDATE SET
        pin_hash = NULL,
        activation_code_hash = EXCLUDED.activation_code_hash,
        activation_expires_at = EXCLUDED.activation_expires_at,
        authorized_device_hashes = ARRAY[]::TEXT[],
        pin_failed_attempts = 0,
        pin_locked_until = NULL,
        updated_at = v_now;

    RETURN jsonb_build_object(
        'ok', true,
        'student_key', v_key,
        'activation_code', v_code,
        'expires_at', v_expires
    );
END;
$$;

-- 9G. 教師為整班尚未綁定學生批量發放一次性 6 碼啟用碼（預設跳過已綁定與尚持有有效未過期啟用碼者；僅 p_reissue_existing=TRUE 才重發覆蓋）
DROP FUNCTION IF EXISTS public.priori_teacher_issue_class_activation_codes(TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.priori_teacher_issue_class_activation_codes(
    p_token TEXT,
    p_grade TEXT,
    p_class_num TEXT,
    p_reissue_existing BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_sess RECORD;
    v_g TEXT := COALESCE(NULLIF(ltrim(trim(COALESCE(p_grade, '')), '0'), ''), '');
    v_c TEXT := COALESCE(NULLIF(ltrim(trim(COALESCE(p_class_num, '')), '0'), ''), '');
    v_reissue BOOLEAN := COALESCE(p_reissue_existing, FALSE);
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_expires TIMESTAMPTZ := v_now + interval '7 days';
    v_stu RECORD;
    v_bind RECORD;
    v_code TEXT;
    v_results JSONB := '[]'::jsonb;
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    IF v_g = '' OR v_c = '' THEN
        RAISE EXCEPTION 'Invalid class filter' USING ERRCODE = '22023';
    END IF;

    IF NOT public.priori_internal_class_in_scope(v_sess.allowed_classes, v_g, v_c) THEN
        RAISE EXCEPTION 'Forbidden: class outside teacher scope' USING ERRCODE = '42501';
    END IF;

    FOR v_stu IN
        SELECT d.student_key, d.grade, d.class_num, d.seat
        FROM public.priori_student_directory d
        WHERE d.active = TRUE
          AND d.grade = v_g
          AND d.class_num = v_c
        ORDER BY d.student_key ASC
    LOOP
        SELECT * INTO v_bind
        FROM public.priori_student_bindings
        WHERE student_key = v_stu.student_key
        FOR UPDATE;

        -- 已完成裝置綁定者永遠跳過
        IF FOUND AND v_bind.pin_hash IS NOT NULL AND v_bind.activation_code_hash IS NULL
           AND COALESCE(array_length(v_bind.authorized_device_hashes, 1), 0) > 0 THEN
            CONTINUE;
        END IF;

        -- 已發放且尚未過期之有效啟用碼，預設予以保留以免學生手上的紙本碼失效
        IF NOT v_reissue AND FOUND AND v_bind.activation_code_hash IS NOT NULL
           AND v_bind.activation_expires_at IS NOT NULL AND v_bind.activation_expires_at > v_now THEN
            CONTINUE;
        END IF;

        v_code := public.priori_internal_generate_activation_code();

        INSERT INTO public.priori_student_bindings (
            student_key, pin_hash, activation_code_hash, activation_expires_at,
            authorized_device_hashes, pin_failed_attempts, pin_locked_until, created_at, updated_at
        )
        VALUES (
            v_stu.student_key,
            NULL,
            extensions.crypt(v_code, extensions.gen_salt('bf', 6)),
            v_expires,
            ARRAY[]::TEXT[],
            0,
            NULL,
            v_now,
            v_now
        )
        ON CONFLICT (student_key) DO UPDATE SET
            pin_hash = NULL,
            activation_code_hash = EXCLUDED.activation_code_hash,
            activation_expires_at = EXCLUDED.activation_expires_at,
            authorized_device_hashes = ARRAY[]::TEXT[],
            pin_failed_attempts = 0,
            pin_locked_until = NULL,
            updated_at = v_now;

        v_results := v_results || jsonb_build_array(
            jsonb_build_object(
                'student_key', v_stu.student_key,
                'grade', v_stu.grade,
                'class_num', v_stu.class_num,
                'seat', v_stu.seat,
                'activation_code', v_code,
                'expires_at', v_expires
            )
        );
    END LOOP;

    RETURN v_results;
END;
$$;

-- 9H. 教師重設學生換機鎖：保留全部作答紀錄，清掉舊綁定並立即換發全新一次性 6 碼啟用碼
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
    v_dir public.priori_student_directory%ROWTYPE;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_expires TIMESTAMPTZ := v_now + interval '7 days';
    v_code TEXT;
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    IF v_key !~ '^\d{6}$' OR v_key = '999999' THEN
        RAISE EXCEPTION 'Invalid student key scope' USING ERRCODE = '22023';
    END IF;

    SELECT * INTO v_dir
    FROM public.priori_student_directory
    WHERE student_key = v_key AND active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student seat not found in active directory' USING ERRCODE = '22023';
    END IF;

    IF NOT public.priori_internal_class_in_scope(v_sess.allowed_classes, v_dir.grade, v_dir.class_num) THEN
        RAISE EXCEPTION 'Forbidden: student outside teacher class scope' USING ERRCODE = '42501';
    END IF;

    DELETE FROM public.priori_student_sessions WHERE student_key = v_key;

    v_code := public.priori_internal_generate_activation_code();

    INSERT INTO public.priori_student_bindings (
        student_key, pin_hash, activation_code_hash, activation_expires_at,
        authorized_device_hashes, pin_failed_attempts, pin_locked_until, created_at, updated_at
    )
    VALUES (
        v_key,
        NULL,
        extensions.crypt(v_code, extensions.gen_salt('bf', 6)),
        v_expires,
        ARRAY[]::TEXT[],
        0,
        NULL,
        v_now,
        v_now
    )
    ON CONFLICT (student_key) DO UPDATE SET
        pin_hash = NULL,
        activation_code_hash = EXCLUDED.activation_code_hash,
        activation_expires_at = EXCLUDED.activation_expires_at,
        authorized_device_hashes = ARRAY[]::TEXT[],
        pin_failed_attempts = 0,
        pin_locked_until = NULL,
        updated_at = v_now;

    RETURN jsonb_build_object(
        'ok', true,
        'student_key', v_key,
        'activation_code', v_code,
        'expires_at', v_expires
    );
END;
$$;

-- 9I. 教師管理權威班級座號人數（限定教師授權班級內增修）
CREATE OR REPLACE FUNCTION public.priori_teacher_sync_directory(
    p_token TEXT,
    p_grade TEXT,
    p_class_num TEXT,
    p_headcount INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_sess RECORD;
    v_g TEXT := COALESCE(NULLIF(ltrim(trim(COALESCE(p_grade, '')), '0'), ''), '');
    v_c TEXT := COALESCE(NULLIF(ltrim(trim(COALESCE(p_class_num, '')), '0'), ''), '');
    v_cnt INT := COALESCE(p_headcount, 0);
    v_s INT;
    v_sk TEXT;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
    SELECT * INTO v_sess FROM public.priori_internal_assert_teacher(p_token);

    IF v_g = '' OR v_c = '' OR v_cnt < 1 OR v_cnt > 45 THEN
        RAISE EXCEPTION 'Invalid directory parameters' USING ERRCODE = '22023';
    END IF;

    IF NOT public.priori_internal_class_in_scope(v_sess.allowed_classes, v_g, v_c) THEN
        RAISE EXCEPTION 'Forbidden: directory update outside teacher class scope' USING ERRCODE = '42501';
    END IF;

    FOR v_s IN 1..v_cnt LOOP
        v_sk := lpad(v_g, 2, '0') || lpad(v_c, 2, '0') || lpad(v_s::text, 2, '0');
        INSERT INTO public.priori_student_directory (student_key, grade, class_num, seat, active, source, updated_at)
        VALUES (v_sk, v_g, v_c, lpad(v_s::text, 2, '0'), TRUE, 'teacher_sync', v_now)
        ON CONFLICT (student_key) DO UPDATE SET
            grade = EXCLUDED.grade,
            class_num = EXCLUDED.class_num,
            seat = EXCLUDED.seat,
            active = TRUE,
            updated_at = v_now;
    END LOOP;

    RETURN jsonb_build_object('ok', true, 'grade', v_g, 'class_num', v_c, 'headcount', v_cnt);
END;
$$;

-- ── 10. 嚴格限制僅開放授權之 RPC 給 anon / authenticated（精確核對參數簽名） ──
REVOKE ALL ON FUNCTION public.priori_student_login_seat(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_student_login_seat(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_student_get_records(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_student_get_records(TEXT, TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_student_upsert_record(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INT, INT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_student_upsert_record(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INT, INT, JSONB) TO anon, authenticated;

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

REVOKE ALL ON FUNCTION public.priori_teacher_list_bindings(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_list_bindings(TEXT, TEXT, TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_issue_activation_code(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_issue_activation_code(TEXT, TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_issue_class_activation_codes(TEXT, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_issue_class_activation_codes(TEXT, TEXT, TEXT, BOOLEAN) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_reset_student_binding(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_reset_student_binding(TEXT, TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.priori_teacher_sync_directory(TEXT, TEXT, TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.priori_teacher_sync_directory(TEXT, TEXT, TEXT, INT) TO anon, authenticated;
