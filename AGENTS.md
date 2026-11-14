# WutaiVocab 專案全域核心守則與唯一交接入口 (Always-On Agent Rules)

本檔案由 Antigravity 於每次新對話啟動時**自動載入**。進行任何開發前，請嚴格遵守以下全域鐵律，並依需要讀取唯一的現況交接總手冊 [`HANDOVER.md`](HANDOVER.md)。

---

## 一、 全域不可妥協之工程鐵律 (Global Guardrails)

1. **學生雲端資料永久保護（嚴禁覆蓋金幣與積分）**：
   - **Supabase 帳號**：`liguyt@wutps.ptc.edu.tw`｜**Project ID**：`fqkdkmcqjswufzbvkram`｜**後台**：https://supabase.com/dashboard/project/fqkdkmcqjswufzbvkram
   - **雙軌聯集融合（Union Merge）**：`src/services/supabase.js` 同時讀寫 `student_profiles` 與 `leaderboard (mode = 'profile-sync')`，永遠以 `Math.max` 取最高金幣 (`coins`) 與探索積分 (`quest_points`)。
   - **學期制保留**：由 `src/utils/semesterHelper.js` 判定學期（2/1～7/31 下學期、8/1～隔年1/31 上學期），整學期保留資料，跨學期自動封存至 `semester_history`。**任何更新嚴禁清空或覆蓋學生資料**。
2. **強制 6 階段全自動防回歸測試（杜絕改 A 壞 B、免除人工重測）**：
   - 任何程式碼變更後、推送前，**必須執行**：
     ```powershell
     npm run build ; if ($LASTEXITCODE -eq 0) { node scripts/smoke_test.mjs }
     ```
   - **以 `$LASTEXITCODE` 判斷 build 成敗**（勿用 `$?`）：PowerShell 的 `$?` 在 stderr 被重導（如 `2>&1 | Select-Object`）時，會把 Vite 警告誤判為失敗而跳過 smoke test。另**勿同時啟動兩個 smoke test**（共用 port 4198，會互相干擾產生假失敗）。
   - 必須 100% 通過 6 大階段：(0) 靜態契約檢查（所有 `soundEngine.xxx()` 必須存在於 `src/services/audio.js`，嚴禁 `if (queue.length === 0) return onBack()` 閃退寫法）、(1) 排行榜、(2) 大廳與教師台、(3) 鷹眼神探、(4) 口說評測、(5) 核心遊戲真實互動點擊/按鍵/開房模擬與檢定館 E2E、(6) 14 款遊戲 × 4 身分全量矩陣。
3. **React 與狀態安全規範**：
   - 嚴禁在 `setState(prev => ...)` updater 函式內執行副作用（如 `soundEngine`、Supabase 廣播、`onBack()`）。
   - 所有遊戲讀取 `settings?.selectedUnits` 必須加空值防禦 `(settings?.selectedUnits || [])`。
4. **Git 推送規範**：
   - 正式生產環境為 Cloudflare Pages (`https://wutaivocab.pages.dev`，綁定 `origin/main`)。
   - 日常更新推送至 `origin`（`dev` 與 `main`）；除非 Mark 特別指示，避免日常頻繁推送 `vercel` 以免耗盡免費建置配額。
5. **高階繪圖 API 額度透明化與詢問機制（嚴禁擅自降級隱瞞）**：
   - 當呼叫高階繪圖生成工具（`image-generator` / `gemini-3.1-flash-image`）遇到配額上限（HTTP 429 `RESOURCE_EXHAUSTED`）時，**必須第一時間主動回報 Mark**。
   - 回報內容必須明確包含發生時間、預計重置時間，且**嚴禁在未獲授權前擅自退回使用低階/程序化 SVG 向量圖取代**。
6. **本機 ↔ 雲端無縫交接規範（`origin/main` 唯一交棒站）**：
   - **開工必拉**：無論在本機（Windows 桌面工作區）或雲端（Cloud Agent）啟動工作，動手前一律先執行 `git pull origin main`（勿覆蓋本機 `SAA/` / `tmp/`），對齊最新 [`HANDOVER.md`](HANDOVER.md)。
   - **大檔留本機**：`SAA/`、`tmp/`、`textbook_docx/` 等原始大檔列於 `.gitignore` 僅留本機（或聊天附件上傳），只提交壓縮切好的 `public/assets/`、`public/audio/` 小檔與程式碼。
   - **收工必推**：完成驗證並更新 [`HANDOVER.md`](HANDOVER.md) 第五節進度表後再 `git push origin main`，確保跨環境切換零斷層。
7. **本機預覽主動啟動與一鍵網址規範**：
   - 當使用者詢問或需要本機預覽新功能時，**主動啟動背景預覽伺服器**（如 `npm run dev -- --host 127.0.0.1 --port 5173` Daemon 或開啟內建瀏覽器面板），並於回覆中直接提供**一鍵直達網址**（含對應 `?view=...` 與試卷參數），免去使用者手動切換目錄與下指令。

---

## 二、 唯一交接文件與創作用劇本索引

- **唯一專案交接與開發規格總手冊**：[`HANDOVER.md`](HANDOVER.md)
  - 涵蓋：全站 7 大主館與 14 款遊戲現況、歷次錯誤嘗試與避坑清單（Postmortems）、題庫擴充／SAA 截取／找不同出圖 SOP、現況待辦進度與常用驗證指令。
- **非交接性質之微電影創作劇本（供影音創作參考）**：
  - [`docs/MIA_AND_BEN_HALLOWEEN_SCRIPT.md`](docs/MIA_AND_BEN_HALLOWEEN_SCRIPT.md)
  - [`docs/SNOWY_PEAK_BISTRO_SCRIPT_BIBLE.md`](docs/SNOWY_PEAK_BISTRO_SCRIPT_BIBLE.md)
