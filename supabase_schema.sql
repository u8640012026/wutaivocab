-- ============================================================
-- 霧臺國小 英文學習平台 Supabase 資料庫建置腳本
-- 請在 Supabase 後台左側「SQL Editor」中貼上並點擊「Run」執行
-- ============================================================

-- 1. 題庫單字資料表 (words)
CREATE TABLE IF NOT EXISTS public.words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author TEXT NOT NULL DEFAULT 'Official',    -- 'Official', 'Mario', 'Ibu', 'Vanessa', 'Mark'
    book TEXT NOT NULL,                         -- 冊別或主題 (如 '1', '2', 'Mario專區')
    lesson TEXT NOT NULL,                       -- 課別或單元 (如 '1', 'Unit 1 顏色與動物')
    en TEXT NOT NULL,                           -- 英文單字
    zh TEXT NOT NULL,                           -- 中文翻譯
    cloze TEXT DEFAULT '',                      -- 填空提示或例句 (選填)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 建立索引加速查詢
CREATE INDEX IF NOT EXISTS idx_words_author ON public.words(author);
CREATE INDEX IF NOT EXISTS idx_words_book ON public.words(book);
CREATE INDEX IF NOT EXISTS idx_words_book_lesson ON public.words(book, lesson);

-- 2. 每週榮譽排行榜資料表 (leaderboard)
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,                    -- 裝置專屬 UUID，防止同名學生覆蓋
    name TEXT NOT NULL,                         -- 學生輸入的暱稱
    mode TEXT NOT NULL,                         -- 遊戲模式 ('zh-en', 'en-zh', 'spelling', 'meteor', 'snake', etc.)
    book TEXT NOT NULL,                         -- 冊別
    score INT NOT NULL DEFAULT 0,               -- 得分
    time INT NOT NULL DEFAULT 0,                -- 花費秒數
    week INT NOT NULL,                          -- ISO 年週次 (例如 39)
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 建立排行榜查詢索引
CREATE INDEX IF NOT EXISTS idx_leaderboard_week_mode ON public.leaderboard(week, mode, book);
CREATE INDEX IF NOT EXISTS idx_leaderboard_device ON public.leaderboard(device_id);

-- 防護約束條件 (防止惡意腳本塞爆資料庫或寫入荒謬分數)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_leaderboard_score') THEN
        ALTER TABLE public.leaderboard ADD CONSTRAINT chk_leaderboard_score CHECK (score >= 0 AND score <= 100000);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_leaderboard_time') THEN
        ALTER TABLE public.leaderboard ADD CONSTRAINT chk_leaderboard_time CHECK (time >= 0 AND time <= 7200);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_leaderboard_name') THEN
        ALTER TABLE public.leaderboard ADD CONSTRAINT chk_leaderboard_name CHECK (char_length(name) >= 1 AND char_length(name) <= 20);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_leaderboard_week') THEN
        -- week = 0 保留給非週期性隔離通道（如 exam-audit-note / exam-student-report / priori-record）
        ALTER TABLE public.leaderboard ADD CONSTRAINT chk_leaderboard_week CHECK (week >= 0 AND week <= 53);
    END IF;
END $$;

-- 3. 開啟 Row Level Security (RLS) 安全防護
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- 題庫權限：允許所有人 (學生與訪客) 讀取單字
DROP POLICY IF EXISTS "Allow public read words" ON public.words;
CREATE POLICY "Allow public read words" ON public.words FOR SELECT USING (true);

-- 題庫權限：允許匿名/公開寫入與修改單字 (由前端教師後台密碼把關)
DROP POLICY IF EXISTS "Allow public insert words" ON public.words;
CREATE POLICY "Allow public insert words" ON public.words FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update words" ON public.words;
CREATE POLICY "Allow public update words" ON public.words FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete words" ON public.words;
CREATE POLICY "Allow public delete words" ON public.words FOR DELETE USING (true);

-- 排行榜權限：允許所有人讀取榜單
DROP POLICY IF EXISTS "Allow public read leaderboard" ON public.leaderboard;
CREATE POLICY "Allow public read leaderboard" ON public.leaderboard FOR SELECT USING (true);

-- 排行榜權限：允許所有人上傳個人成績
DROP POLICY IF EXISTS "Allow public insert leaderboard" ON public.leaderboard;
CREATE POLICY "Allow public insert leaderboard" ON public.leaderboard FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update leaderboard" ON public.leaderboard;
CREATE POLICY "Allow public update leaderboard" ON public.leaderboard FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete leaderboard" ON public.leaderboard;
CREATE POLICY "Allow public delete leaderboard" ON public.leaderboard FOR DELETE USING (true);

-- ============================================================
-- 4. 預載種子題庫 (包含官方基礎教材 + 教師專屬自建範例)
-- ============================================================
INSERT INTO public.words (author, book, lesson, en, zh) VALUES
-- 官方第 1 冊
('Official', '1', '1', 'apple', '蘋果'),
('Official', '1', '1', 'banana', '香蕉'),
('Official', '1', '1', 'cat', '貓'),
('Official', '1', '1', 'dog', '狗'),
('Official', '1', '2', 'elephant', '大象'),
('Official', '1', '2', 'fish', '魚'),
('Official', '1', '2', 'grape', '葡萄'),
('Official', '1', '2', 'hat', '帽子'),
-- 官方第 2 冊
('Official', '2', '1', 'ruler', '尺'),
('Official', '2', '1', 'pencil', '鉛筆'),
('Official', '2', '1', 'eraser', '橡皮擦'),
('Official', '2', '1', 'book', '書本'),
('Official', '2', '2', 'red', '紅色'),
('Official', '2', '2', 'blue', '藍色'),
('Official', '2', '2', 'yellow', '黃色'),
('Official', '2', '2', 'green', '綠色'),
-- Mario 老師自建專區
('Mario', 'Mario專區', 'Unit 1 食物與甜點', 'pizza', '披薩'),
('Mario', 'Mario專區', 'Unit 1 食物與甜點', 'hamburger', '漢堡'),
('Mario', 'Mario專區', 'Unit 1 食物與甜點', 'ice cream', '冰淇淋'),
('Mario', 'Mario專區', 'Unit 1 食物與甜點', 'sandwich', '三明治'),
-- Ibu 老師自建專區
('Ibu', 'Ibu專區', 'Unit 1 自然與動物', 'mountain', '山'),
('Ibu', 'Ibu專區', 'Unit 1 自然與動物', 'river', '河流'),
('Ibu', 'Ibu專區', 'Unit 1 自然與動物', 'butterfly', '蝴蝶'),
('Ibu', 'Ibu專區', 'Unit 1 自然與動物', 'flower', '花朵'),
-- Vanessa 老師自建專區
('Vanessa', 'Vanessa專區', 'Unit 1 學校日常生活', 'classroom', '教室'),
('Vanessa', 'Vanessa專區', 'Unit 1 學校日常生活', 'teacher', '老師'),
('Vanessa', 'Vanessa專區', 'Unit 1 學校日常生活', 'student', '學生'),
('Vanessa', 'Vanessa專區', 'Unit 1 學校日常生活', 'library', '圖書館'),
-- Mark 老師自建專區
('Mark', 'Mark專區', 'Unit 1 運動與休閒', 'basketball', '籃球'),
('Mark', 'Mark專區', 'Unit 1 運動與休閒', 'soccer', '足球'),
('Mark', 'Mark專區', 'Unit 1 運動與休閒', 'swimming', '游泳'),
('Mark', 'Mark專區', 'Unit 1 運動與休閒', 'running', '跑步')
ON CONFLICT DO NOTHING;
