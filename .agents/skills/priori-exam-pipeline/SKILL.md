---
name: priori-exam-pipeline
description: >-
  End-to-end standard operating workflow for importing, auditing, and releasing
  Taiwan K-12EA PRIORI screening exam papers (110, 109, 108, etc.) into the
  WutaiVocab PRIORI Hub (?view=priori). Activate this skill whenever adding
  a new PRIORI exam year, auditing question media/TTS integrity, or running
  pre-release spot-checks.
---

# WutaiVocab PRIORI 新年度試卷標準入庫與品質驗收流程

本 Skill 將已驗證穩定的 **111～115 年度**建置經驗固化為單一標準作業流程。後續 AI 接手製作 **110、109、108** 等年度時，請直接依序執行以下 5 個階段，**不需回頭排查舊版系統或 UI 邏輯**。

---

## 核心不可妥協原則（開工前確認）

1. **原卷直出不洗牌**：圖形與聽力題依原卷順序直出，禁止對選項隨機洗牌（`preserveOptionOrder: true`），避免圖片 `(1)(2)(3)` 或聽力編號與選項錯位。
2. **無強制停留時間**：學生交卷後即可隨時點擊重練或看解析，不設倒數鎖定。
3. **精熟規則**：一般正式測驗初測達 **≥ 80 分** 時該次答對題目直接判連對 2 次（🌟 已精熟）；錯題特訓支援 10／20 次上限與中途離開結算。
4. **僅數學科啟用計算紙**：國語與英語全選擇卷不顯示計算紙介面。
5. **誠實標記驗收邊界**：腳本／CI 全數通過僅代表**「系統與自動化結構檢核通過」**；不得在未逐題對照原卷／試聽音檔前宣稱「全數題目人工核對無誤」。

---

## Phase 1：原始素材盤點與試卷指紋確認

1. 確認本機倉庫已同步：執行 `git pull origin main`（**嚴禁覆蓋本機 `.gitignore` 內的 `PRIORI/` 與 `tmp/`**）。
2. 盤點本機 `PRIORI/歷屆篩選測驗/<年度>/`：
   - 確認三～六年級國語、數學、英語 **12 份學生空白原卷 PDF + 12 份答案卷 PDF + 英語聽力 MP3** 均到位。
   - **三年級英語題型指紋核對（最易跨年變動）**：先讀該年度三年級英語答案卷與試卷首頁，確認題型分段（例如 114/113/112 為 `15 alphabet-pair + 6 O/X + 4 pic`，而 111 年為 `9 alphabet-pair + 4 letter + 3 pic + 5 O/X + 4 reading`），再撰寫該年規則。
   - 記下國語科各年級題組起訖題號（如 G3 `21–23, 24–25`）與數學圖表／分數題題號。

---

## Phase 2：轉圖、切圖、MP3 切音與 A3 原卷輸出

1. **PDF 轉底圖鐵律**：一律匯入共用 [`scripts/lib/renderPdfPagesWithChrome.mjs`](../../../scripts/lib/renderPdfPagesWithChrome.mjs)（`renderPdfPagesWithChrome`）透過本機 Chrome DirectWrite 轉製頁面底圖後再用 Sharp 裁切；**嚴禁使用 `pdf-parse` 的 `getScreenshot()`**（缺繁中 CMap 會造成國字／單位／注音變形）。
2. **輸出路徑規範**：
   - 題圖與附圖：`public/assets/priori/<年度>/{math,chi,eng}-g{3..6}/`（`q01.webp`～`q25.webp`、`qXX_fig.webp`、`passage_XX_YY.webp`）。
   - 官方英聽 MP3：`public/audio/priori/<年度>/eng-g{3..6}/qXX.mp3`（`96kbps Mono` + `0.1s` fade-in/out）。
   - A3 原卷 PDF：複製學生卷與答案卷至 `public/assets/priori/original/<year>-{math,chinese,english}-g{3..6}-{student,answer}.pdf`（共 24 份）。
   - 本機總覽表：`tmp/<年度>_sheets/*.png` 與 `tmp/<年度>_extracted_spec.json` **只留本機供人工目檢，不推入 Git，也不要將整張接觸表餵給 AI 視覺浪費額度**。
3. **極少數重點圖人工核對**：
   - 堆疊分數題、表格題圖（如國語表格選項）、圖表型閱讀本文（掃描或海報圖如 111 五國 `passage_24_25`）、以及幾何標記圖，可視情況直接用 `read_file` 查看單一 `.webp` 確認邊緣無裁切字樣。
   - 若出現線條極細、WebP 小於 800 bytes 但影像完整（非空白）之圖檔，於資產腳本與契約測試中列為明確幾何例外（`SPARSE_OUTLINE_WEBPS`），勿盲目調降全局門禁。

---

## Phase 3：三層 Canonical 資料模組建置

在 `src/data/priori/` 建立 12 份模組 `priori<Year>{Math,Chinese,English}G{3..6}.js` 與 `META`：

1. **真實原卷結構**：所有題目設定 `officialAnswerVerified: true, answerSource: 'official_pdf'`（或對應來源）；英語聽力題設定 `media: { audioSrc, audioSourceType: 'official_mp3' }`，純閱讀題設定 `audioSrc: null`。
2. **報讀 `ttsText` 與 `optionTtsTexts` 鐵律**：
   - 嚴禁出現生硬符號：`FORBIDDEN_TTS_TOKENS = ['+', '-', '−', '×', '÷', '/', '=', '···', '...']`。
   - 國語閱讀理解 `passage.ttsText` 必須 **100% 逐字朗讀原文**（不得少字且字長需 `>= 0.9 * rawLen`），嚴禁在 `ttsText` 內劇透釋義或答案線索。
   - 英語聽力題的 `ttsText` 只作中文操作引導，**嚴禁提前唸出英聽正確單字或句子**。
   - `questionText` 提及「圖片」或配對圖片選項時，必須確保 `figureImage` 或 `passage.image` 存在；若無單獨附圖僅看原題圖，改稱「圖案／下方圖示／左側圖檔」。
3. **註冊與開通原卷按鈕**：
   - 於 [`src/data/priori/index.js`](../../../src/data/priori/index.js) 匯入、匯出並註冊 12 份新試卷，確認 `PRIORI_STATS.totalPapers` 與 `totalQuestions` 精準遞增（每增 1 完整年度 +12 卷 / +300 題）。
   - 於 [`src/features/priori/PrioriModals.jsx`](../../../src/features/priori/PrioriModals.jsx) 的 `hasOriginal` 陣列加入新 `<年度>`。

---

## Phase 4：全量品質稽核、契約與抽驗單產出

1. **建立年度契約測試**：參照 [`scripts/test_priori_111_g3_6_contract.mjs`](../../../scripts/test_priori_111_g3_6_contract.mjs) 新增 `scripts/test_priori_<年度>_g3_6_contract.mjs`（驗 12 卷題目、24 份 A3 `%PDF`、全部 MP3、Sharp 圖像指標、禁讀符號、`questionText` 有圖檢查與題組一致性），並同步更新既有 111–114 契約內的總卷數／總題數斷言，再加入 [`.github/workflows/canonical-ci.yml`](../../../.github/workflows/canonical-ci.yml)。
2. **執行內容盤點、防劇透與自動產出抽驗清單**：
   ```powershell
   node scripts/screen_priori_content.mjs . tmp/priori_screen --strict --spot-check <年度>
   ```
   - 確認輸出：`criticalFlagged: 0`、`zoomWiringOk: true`、`originalPdfIssues: []`。
   - 檢視 `tmp/priori_screen/inventory.json` 內的 `spotCheckSamples`（涵蓋三～六年級國／英／數的圖形題、題組、聽力 MP3 與 A3 PDF），供人工與外部覆核逐題聽驗／目檢。

---

## Phase 5：循序全驗證、推送 CI 轉綠與誠實交接

1. **強制循序執行本地驗證（嚴禁同時啟動兩個預覽端口測試）**：
   ```powershell
   node scripts/test_priori_drill_contract.mjs ; if ($LASTEXITCODE -eq 0) { node scripts/test_priori_<年度>_g3_6_contract.mjs } ; if ($LASTEXITCODE -eq 0) { node scripts/test_priori_111_g3_6_contract.mjs } ; if ($LASTEXITCODE -eq 0) { node scripts/test_priori_112_g3_6_contract.mjs } ; if ($LASTEXITCODE -eq 0) { node scripts/test_priori_113_g3_6_contract.mjs } ; if ($LASTEXITCODE -eq 0) { node scripts/test_priori_114_g3_contract.mjs } ; if ($LASTEXITCODE -eq 0) { node scripts/test_priori_114_g4_6_contract.mjs } ; if ($LASTEXITCODE -eq 0) { node scripts/test_priori_115_math_g3_contract.mjs }
   npm run lint ; if ($LASTEXITCODE -eq 0) { npm run build } ; if ($LASTEXITCODE -eq 0) { node scripts/verify_priori_e2e.mjs } ; if ($LASTEXITCODE -eq 0) { node scripts/smoke_test.mjs }
   ```
2. **更新文件與推送 `origin/main`**：
   - 更新 [`HANDOVER.md`](../../../HANDOVER.md) 與 [`docs/USER_MANUAL.md`](../../../docs/USER_MANUAL.md) 總卷數、總題數與新年度進度。
   - **僅提交資產小檔、程式碼、契約與文件**（確認 `git status` 不含 `PRIORI/`、`tmp/`）。
   - 推送至 `origin main`（**不可頻繁推 `vercel`**）。
3. **驗證雲端 CI 與 Cloudflare 部署全綠**：
   - 推送後確認最新 GitHub Actions `canonical-ci.yml`（含 `PRIORI Contracts, Lint, Build & Chrome E2E` 與 `ubuntu`/`windows` canonical 作業）及 `Deploy to Cloudflare Pages` 皆為 `completed / success` 後才可宣布上線。
   - 在交接報告與給 GPT 的複驗清單中，清楚附上 commit SHA、CI 執行網址與 `spotCheckSamples`，並註明哪些題目已目檢／聽驗、哪些尚待實機與逐題核對。
