# 霧臺國小英語自主學習宇宙 (WutaiVocab 2.0) — 單一現況交接總手冊

> **最後整理**：2026-11-19（學扶館 `PRIORI` 擴展至 **61 卷 / 1,525 題**〔含 110＋111＋112＋113＋114 年度三～六年級國／英／數全 60 卷 ＋ 115 三年級數學〕＋ 110 年 405 張 WebP / 51 段英聽 MP3 / 24 份 A3 原卷與解答 PDF 入庫並完成自動化契約檢核）  
> **正式環境**：[https://wutaivocab.pages.dev](https://wutaivocab.pages.dev)（Cloudflare Pages 綁定 `origin/main`）  
> **Supabase**：帳號 `liguyt@wutps.ptc.edu.tw`｜Project ID `fqkdkmcqjswufzbvkram`｜[後台](https://supabase.com/dashboard/project/fqkdkmcqjswufzbvkram)

---

> **PRIORI 題庫驗收交接（進行中）**：請先讀 [題庫驗收規範](docs/PRIORI_QA_SOP.md) 與 [驗收進度／疑點](docs/PRIORI_QA_PROGRESS.md)。112–114 曾通過部分自動測試與抽核，尚未依新規範逐卷完成內容驗收；不得宣稱全數驗收通過。

> **110 年裁圖修正**：五數 Q3 附圖補完整 A–E，五英 Q25 附圖補回 Kevin／May；兩圖使用 `_v2` 檔名避開快取，詳見 `docs/PRIORI_QA_PROGRESS.md`。使用者確認六數 Q8 按現有題目通過。

## 一、 全域不可妥協之工程鐵律

1. **學生雲端資料永久保護（嚴禁覆蓋金幣與積分）**：
   - [`src/services/supabase.js`](src/services/supabase.js) 同時讀寫 `student_profiles` 與 `leaderboard (mode = 'profile-sync')`，一律採 **Union Merge（`Math.max` 取最高金幣 `coins` 與探索積分 `quest_points`）**。
   - [`src/utils/semesterHelper.js`](src/utils/semesterHelper.js) 依學期（2/1～7/31 下學期、8/1～隔年1/31 上學期）整學期保留成績，跨學期自動封存至 `semester_history`。**任何更新嚴禁清空或覆蓋學生資料**。
2. **強制 6 階段自動化防回歸測試（每次程式碼變更後、推送前必跑）**：
   - Windows PowerShell：
     ```powershell
     npm run build ; if ($LASTEXITCODE -eq 0) { node scripts/smoke_test.mjs }
     ```
   - Linux / Bash：
     ```bash
     npm run build && node scripts/smoke_test.mjs
     ```
   - PowerShell **必須以 `$LASTEXITCODE` 判斷 build 成敗（勿用 `$?`）**；**嚴禁同時啟動兩個 `smoke_test.mjs`**（共用 port 4198 會互相干擾）。
   - 6 階段內容：`[0/6]` 靜態契約（`soundEngine.xxx()` 存在於 `src/services/audio.js`、禁 `if (queue.length === 0) return onBack()`、課本 1,989 題 & SAA 113–115 契約）→ `[1/6]` 排行榜 → `[2/6]` 大廳與教師台 → `[3/6]` 鷹眼神探 → `[4/6]` 口說評測 → `[5/6]` 核心遊戲互動與檢定館 E2E（含 SAA 113/114）→ `[6/6]` 14 款遊戲 × 4 身分（56 組）零崩潰。
3. **React 與音訊狀態安全規範**：
   - 嚴禁在 `setState(prev => ...)` updater 內執行副作用（如 `soundEngine`、Supabase 廣播、`onBack()`）。
   - 所有遊戲讀取 `settings?.selectedUnits` 必須加空值防禦 `(settings?.selectedUnits || [])`。
4. **Git 推送與生態系保護規範**：
   - 日常更新一律推送 `origin`（`dev` / `main`），**除非 Mark 特別指示，嚴禁日常執行 `git push vercel`**（會耗盡 Vercel 建置配額）。
   - **霧臺三大專案生態**：
     - `wutaivocab`：本專案（`https://wutaivocab.pages.dev`，Cloudflare Account ID `4cd48161aad48dd1884b350e37ba7c75`）。
     - `classqna`：課堂抽籤與問答系統（`https://classqna.pages.dev`）。
     - `wutpsdata`：校務管理系統（`https://wutpsdata.pages.dev`）；其 LINE LIFF Webhook 與日曆 API 運行於 Vercel Serverless（`api/line_webhook.js`, `api/calendar.js`），**絕不可更改或刪除該 Webhook 指向**。
5. **高階繪圖 API 429 額度透明化鐵律**：
   - 呼叫高階生圖工具遇 HTTP 429 `RESOURCE_EXHAUSTED` 時，必須第一時間回報發生時間與預計重置時間，**未獲 Mark 明確同意前嚴禁擅自退回低階／程序化 SVG 取代**。
6. **本機 ↔ 雲端無縫交接規範（`origin/main` 唯一交棒站）**：
   - **開工必拉**：無論於本機或雲端啟動作業，動手前必先執行 `git pull origin main`（保留本機 `SAA/` 與 `tmp/`），對齊最新狀態。
   - **大檔留本機**：`SAA/`、`tmp/`、`textbook_docx/` 等原始大檔列於 `.gitignore` 僅留本機，只提交裁切壓縮後之 `public/assets/`、`public/audio/` 與程式碼。
   - **收工必推**：通過 `build` + `smoke_test.mjs` 後更新第五節進度表並 `git push origin main`，確保下次換邊無縫接軌。

---

## 二、 歷次「錯誤嘗試與避坑清單」(Postmortems & Anti-Patterns)

> 本節完整保留開發過程中曾踩過的實戰地雷，供後續 AI 接手時直接避開：

1. **大 MP3 配 `clipStart/clipEnd` 超過 Cloudflare 25 MiB 上限**：早期將 SAA 113 三個完整 10～30 MB 音檔放進 `public/` 搭配瀏覽器跳轉，超出 Cloudflare Pages 單檔 25 MiB 上限導致整次部署靜默失敗且無法穩定跨瀏覽器尋軌。**解方**：用 FFmpeg 切為每題獨立 `96kbps Mono` 小檔（約 80～150 KB）＋ `0.1s` fade-in/out。
2. **SAA 114 統一 2×2 切圖錯切與選項卡劇透**：`ae71c68` 用統一十字 2×2 切全部 36 組圖片，導致不規則版型（G4 Q20 橫排、G4 Q35 上下雙行、G5 Q15 橫排）嚴重錯切並殘留題號與 `①②③④` 圈號，且文字選項把答案劇透印在卡片上。**解方**：全部 36 組改為獨立 `{ left, top, width, height }` 四座標裁切、選項文字改純 `['(A)', '(B)', '(C)', '(D)']`＋`optionAltTexts`，並加入 Sharp 防白/Entropy/防撞像素門禁與 Contact Sheet 視覺簽核。
3. **遊戲進入時 `if (queue.length === 0) return onBack()` 瞬間閃退**：從大廳點「開始遊戲」進入 `StandardQuiz` / `SpellingGame` 時，首個 render 週期 `queue` 尚未算完，`return onBack()` 會直接踢回大廳。**解方**：等待 `queue.length > 0 && !hasStarted` 再啟動，`smoke_test.mjs [0/6]` 會掃描阻擋。
4. **密室逃脫「0 秒／1 秒通關」異常**：過關呼叫 `addQuestPoints` 更新 `StudentContext.currentStudent`，曾誤將 `currentStudent` 放入 `initCampaign` 依賴陣列，導致通關當下重建關卡把 `timeElapsed` 歸零。**解方**：斷開 `currentStudent` 依賴、加入 `gameStateRef` / `finalTimeRef` 鎖定完賽時間，且資料庫與前端過濾 `<= 1` 秒髒資料。
5. **多人連線對戰 `subscribe()` 後重綁 `presence` 白屏崩潰**：`BattleGame` 選單頁有探測頻道，若未清除就直接重用同名 topic 綁定 `.on('presence')` 會觸發 Supabase SDK 致命例外。**解方**：開房/加入前必先呼叫 `syncEvictChannel(topicName)`；備戰室容器用 `relative min-h-[calc(100vh-64px)]` 不可蓋到全域 `<Header>` 或重複渲染頂列。
6. **貪食蛇吃掉轉向鍵、發光字母糊掉、百步蛇斷節感**：
   - `advanceOneStep()` 漏呼叫 `inputQueueRef.current.shift()` 會讓所有方向鍵與十字鍵失效；手機滑動須於 `touchmove` 跨過 12～18px 門檻即排入（單次滑動僅送一方向）。
   - 字母不可開 `ctx.shadowBlur > 0`（黃暈會糊成光團），須用 900 特粗黑描邊 + 純白/高純金填色，且不可將字母生成在蛇頭前進安全錐形區內。
   - 蛇身不可分開零散繪圖，須用同源母圖 + `buildDenseFilletSpine`（14px 圓弧過渡 + 5px 重採樣）與開局預設 5 節。
7. **打地鼠重開鎖死與計時停擺**：倒數計時 `useEffect` 必須依賴 `[gameState, isPreloading, triggerGameOver]`；重開務必重置 `isTransitioningRef`、`livesRef`、`timeLeftRef`；同題 10 秒未擊中正解扣 1 顆心、斷連擊、扣 10 分。
8. **極速滑卡連點誤扣與雙正解**：180ms 動畫期間必須以 `isSwipingRef` 防抖鎖定；干擾字必須過濾 `w.meaning.trim() !== targetWord.meaning.trim()` 避免中文字義撞車。
9. **手寫塗鴉彈窗遮擋與死板筆順誤殺**：評測結果彈窗必須脫離四線三格容器避免擋住「下一題」；筆畫僅供建議教學，判分須以幾何距離比對未完成部件（允許反向、連筆與合理替代筆順）；須尊重 `settings.alphaMode`（`upper`/`lower`/`mixed`）。
10. **鷹眼神探「缺字空白、DOM 重疊誤觸、重畫兩張全圖穿幫」**：
    - 低年級旋轉按鈕 DOM 矩形易互蓋誤觸，且缺字空白 (`missing`) 為無效熱區 → 已改為 `createNonOverlappingSpotterCircles` 歐氏距離圓形命中區 + SVG 等比縮放 + 4 維度差異 + 系統無襯線字型白名單（左右同位字型鎖死）。
    - 高年級不可分別生成兩張全圖，必以同一張 Base 底圖 +「8 取 5」局部透明羽化補丁 (`public/assets/spotter/patches/`) + Sharp Alpha 通道自動算單一座標真相 (`slot`)；嚴禁人工寫兩套座標，嚴禁在博物館場景放置食物。
11. **課本題庫複本膨脹、硬編碼總數與跨平台 CRLF 坑**：
    - 同冊跨單元複製曾造成 1,728 筆冗餘複本與 7～8 個 `scopes`；經方案 A Prune 後以 `src/data/hereWeGoMcqBank.js` 為唯一來源（舊產生器 `expand_mcq_bank_100_per_book.mjs` 已退役嚴禁再跑）。
    - 嚴禁寫死 `1589`、`1689` 等常數，一律讀取 `CANONICAL_STATS`。
    - 腳本動態載入檔案一律用 `pathToFileURL()`（避免 Windows `c:` 協議報錯），且 SHA-256 先將 `\r\n` 正規化為 `\n`（`.gitattributes` 鎖定 `eol=lf`）。
    - `rollback_canonical_migration.mjs` 僅適用於 1,589 題基準；含 Batch A~D（1,989 題）後禁止回滾覆蓋。
12. **檢定館 Runtime、背包與通行證地雷**：
    - 正式測驗須用 `deadlineAt` 防關分頁無限暫停，並於 `finalizeExam` 完成後才清除快照；僅 `scopeMode === 'curriculum'` 寫入課本排行榜；易錯題複習嚴禁以一般題補滿；Pre-A1 正式卷排除 `W-SCRAMBLE` 與 `S-READ`；`supabase.js` 錯題回報必檢 `{ error }`；精熟快照不得 fallback 至 `questions.length`。
    - 學生背包道具必經 `resolveItemMetadata()`（杜絕「無名快遞紙箱 📦」）；通行證禁止寫死遊戲名單與橫向捲動條（動態讀 `CONSOLIDATED_GAME_MODES` 與 `getInventorySummary`）。
13. **Cloudflare Pages CI 因 `eslint src` 全形空白阻塞部署 & Vercel GitHub Webhook 誤觸發**：
    - `.github/workflows/deploy-cloudflare.yml` 會在 `npm run build` 前先跑 `npm run lint`（`eslint src`），任何 `no-irregular-whitespace`（例如 JSX 文字中的全形空白 `　`）都會讓 Action 在建置前直接中止並跳過 `wrangler pages deploy`；又因 Cloudflare Pages SPA 會以 HTTP 200 回傳舊版 `index.html`，未上線的 `/assets/priori/...` 會靜默回傳 HTML 而非報 404。**解方**：列印預留空寬改用 CSS（如 `<span className="inline-block w-10" />`），且每次推送前必跑 `npm run lint && npm run build && node scripts/smoke_test.mjs`。
    - 同時 Vercel 若曾於 Vercel 後台綁定 GitHub `u8640012026/wutaivocab` 倉庫，即使本機沒有 `vercel` git remote，每次 `git push origin main` 仍會透過 GitHub App 自動觸發 Vercel 建置並消耗免費配額；欲徹底關閉日常自動消耗需於 Vercel Project Settings → Git / Ignored Build Step 設定忽略或中斷連動。
    - 雲端寫入約束與錯誤顯示：`supabase_schema.sql` 原 `chk_leaderboard_week` 寫作 `week >= 1`，但實測線網與 `exam-audit-note`／`priori-record` 皆寫入 `week = 0`；此外 Supabase JS 回傳 `{ error }` 不會自動 throw，必須明確檢查 `error` 並於前端顯示同步失敗提示。

---

## 三、 全站現行架構與各館規格 (`src/App.jsx`)

### 入口首頁 (`src/components/Portal.jsx`) 七大主館
依序為：**1. 霧臺小鎮 RPG** (`town`) → **2. 英語單字冒險館** (`lobby`) → **3. 雙語聽說探險館** (`langlab`) → **4. 霧臺英語檢定館** (`mcq-exam`) → **5. 自然發音探索館** (`phonics`) → **6. ClassQnA 互動教室** (`classqna.pages.dev`) → **7. 自編英語電子教科書** (`textbook`)。

| 館別 / 模組 | 關鍵原始碼 | 現行核心規範與設計要點 |
| :--- | :--- | :--- |
| **1. 霧臺家園 RPG**<br>& **背包／通行證** | `src/games/town/WutaiTownGame.jsx`<br>`CinemaTheaterModal.jsx`<br>`CurioBackpackModal.jsx`<br>`StudentProfileModal.jsx`<br>`src/utils/inventoryHelper.js` | • **地圖互動**：9 大建築探索、NPC 對話樹 (`DialogueEngine`)、任務板 (`QuestBoardModal`)、商店 (`ShopModal`)、文化典籍 (`WisdomCardModal`, `GrimoireSanctuaryModal`)。頂部 HUD 容器保持 `pointer-events-none`（按鈕設 `pointer-events-auto`）防擋地圖建築點擊。<br>• **山豬影城**：16:9 `youtube-nocookie.com` 無伺服器流量串流，開啟時自動暫停場景 BGM。<br>• **24 格多寶格與通行證**：`resolveItemMetadata` 自動解析 30+ 原民／生活物品並折疊堆疊 (`x10`)，點擊「把玩」觸發音效、英音與文化典故；通行證嚴格維持 768:1024 單頁石板並動態查詢 `CONSOLIDATED_GAME_MODES`。 |
| **2. 英語單字冒險館**<br>(`Lobby` ＋ **14 款遊戲**) | `src/components/Lobby.jsx`<br>`src/games/{spotter,escape,maze,memory,mole,swipe,meteor,snake,sentence,quiz,spelling,handwriting,battle}/` | • **5×2 一頁式整備室與榮譽榜門檻 (`qualifyingBook`)**：一二年級採 `abc` 字母（可切換 `upper`/`lower`/`mixed` 膠囊）；三～六年級需**同冊且（$\ge 20$ 字 或 $\ge 2$ 單元）**方具上榜資格。<br>• **探索解謎**：**密室逃脫**（四大秘境進度即開、複合詞膠囊、秒數鎖定）、**鷹眼神探**（低年級 6 取 3 圓形托盤；中高年級 8 取 5 補丁；放大鏡連按 5 下或 `?view=spotter-test` 進測試工作台）、**字母巡航迷宮**（方向鍵/觸控收集字母）、**星際記憶翻牌**（9 組單字＋2 張神卡共 20 張、全場 8 秒同步流光、`PowerUpCodexModal` 3D 轉盤圖鑑、依全站 `isDark` 自動切換日之章/夜之章卡背）。<br>• **反應競技**：**打地鼠**（60 秒倒數、10 秒未答扣 1 心連擊歸零、3 心歸零結算）、**極速滑卡**（180ms 防抖）、**3D 隕石防衛戰**（`IcosahedronGeometry`＋GLSL 熔岩/大氣著色器、攝影機 `z: 27`、每 50 分得 1 層單一呼吸光罩最多顯示 5 層＋`soundEngine.powerUp()`）、**貪食蛇**（日/夜雙景、330/235/205ms、樣條骨骼 + `inputQueueRef`）。<br>• **詞句試煉與對戰**：**句型積木工坊** (`SentenceBuilderGame`，Batch 1 試玩開放 `abc`＋第 1 冊 `Lv.1`/`Lv.2`、`practiceOnly`)、**單字積木拼裝** (`SpellingGame` 星空寶石積木升級)、**英語聽力試煉** (`StandardQuiz` 4 選 1 聲波搶答＋`0.78x` 慢速＋`onEnd` 啟動 12 秒獎勵條；舊 `?view=quiz-choice` 保留相容並採純練習隔離)、**神筆筆順書寫** (`HandwritingGame` 支援一筆連寫與必要點／橫防漏幾何檢查)、**多人連線對戰** (`BattleGame` 三間固定擂台 PIN `1001~1003`、每房最多 4 人、`EmergencyRaidMeteor` 突襲限 1 顆飛行 + 1 顆排隊＋1.5 秒冷卻＋落點左翼 18%～30%)。 |
| **3. 雙語聽說探險館** | `src/features/langlab/LanguageLabHub.jsx`<br>`MediaBookshelfModal.jsx`<br>`YouTubeClipPlayer.jsx` | • 三大入口：**聽力特訓**（15 題三選一、3 秒自動倒數、`listening_lab` 榜；所有英文選項經 `isValidEnglishSentence` 過濾零漢字）、**口說跟讀**（Web Speech API 雙擊錄音評分回饋卡、`speaking_lab` 榜）、**影音微電影**（`UNIT_VIDEO_LIBRARY` 微秒區間播放暫停選答＋老師原創／歌謠分類，支援現場自訂測試，並含第 3 張直通 `mcq-exam` 卡片）。 |
| **4. 霧臺英語檢定館**<br>& **四大天王排行榜** | `src/games/exam/PureMcqExamView.jsx`<br>`examBlueprint.js`<br>`mistakeReview.js`<br>`src/utils/masteryHelper.js`<br>`src/components/exam/*`<br>`LeaderboardView.jsx` | • **全頁無干擾介面 (`h-[100dvh]`)**：隱藏全域 `<Header />`、零遊戲音效與彩帶，設「第 0 頁測驗說明」按開始作答才計時。<br>• **四軌統一響應式設定骨架與主色**：課本題庫（藍色；手機同頁四列手風琴、iPad 橫向/桌機四欄並排）、SAA 學力檢測（翡翠綠；3 步零捲動 Wizard）、Pre-A1 模擬（紫色；單頁 4 膠囊：正式 30 題限時 35 分 / 綜合 15+15 / 聽 20 / 閱 20）、個人易錯題（玫紅；`全部`/`課本`/`SAA`/`Pre-A1` 篩選與 `10/20/30/全部清空`，嚴禁以一般題補滿，錯題歸零沉底、連對 2 次出庫、清空即提前結算）。琥珀色保留給金幣與提示。<br>• **滾動精熟引擎**：四狀態 `unattempted` → `remedial` → `probation`（錯後連對 1 次）→ `mastered`（累計連對 2 次解鎖，猜對率僅 6.25%）。三大軌道分母：`CURRICULUM_TOTAL_ITEMS = CANONICAL_STATS.canonicalItems`（現 **1,989** 題）、`PRE_A1_TOTAL_ITEMS = 300`、`SAA_TOTAL_ITEMS = 315`。<br>• **金幣核發與四大天王**：課本本年級（或易錯題）且正確率 $\ge 60\%$ 核發 `Math.min(20, Math.round(題數 * 答對率 * 0.4))` 金幣；`LeaderboardView` 呈現「測驗之王 / 金幣之王 / 積分之谷 / 遊戲之王」大武山四聯手風琴與課本檢定三累計榜（`mcq-king`, `mcq-diligent`, `mcq-accurate`）。 |
| **5. 自然發音探索館** | `src/features/phonics/PhonicsBoard.tsx` | • 互動式磁性拼讀板（Blending Board）、音標庫 (`SoundBankModal`)、兩種發音模式（`phoneme` 純音素 vs `word` 錨定單字）、自訂音標卡 (`phonics_custom_cards`)、測驗模式 (`QuizView`)，語系與日夜主題與主站雙向即時同步。 |
| **6. 自編英語電子教科書** | `src/components/TextbookViewer.jsx` | • 嵌入 Heyzine 48 頁翻頁書並提供章節目錄快捷跳轉（Cover / Alphabet / U1–U5 / Review / Audio Hub），右側/底部抽屜內建 0.85x 初學者語速 Web Speech 朗讀清單與自訂英句即時發音。 |
| **7. 全域載入條／教師後台／閒置保護** | `src/components/ui/GamePreloader.jsx`<br>`PreloaderShowcase.jsx`<br>`TeacherHub.jsx`<br>`InactivityGuard.jsx` | • **GamePreloader**：最短展示 1.2 秒＋300ms 淡出，`Image.decode()` 實測進度＋中英格言 (`forestQuotes.js`)；4 常態守護神獸（雲豹、黑熊、野豬、水鹿）＋12 月份節慶限定角色（當月 32% 優先登場），禁 Emoji 降級；展示台路由 `?view=preloader-showcase`。<br>• **TeacherHub**（密碼 `wt7902230`，快捷鍵 `Ctrl+Shift+A` / `Ctrl+Alt+T` 或 ErrorBoundary ⚠️ 連點 5 下）：含 7 大分頁（題庫管理、成績異常管理、精熟熱力圖 `TeacherMasteryAnalytics`、試題檢核區 `ExamAuditZone`、對戰擂台監控、系統體檢、全校公告廣播），並可直達 `PreloaderShowcase` 與 `?view=zoom-showcase`。<br>• **InactivityGuard**：單人互動模組 45 分鐘無操作預警 60 秒後自動返回大廳。 |

---

## 四、 資料建置與擴充標準 SOP

1. **課本題庫擴充（`src/data/hereWeGoMcqBank.js`）七大命題鐵律與配比**：
   - **架構契約**：唯一 Canonical（`isCanonical: true`）、`scopes.length <= 2`、7 選項（`options.length === 7`）、正解固定 `answer: 0`（施測動態 $C^6_3$ 抽樣洗牌）、空格統一 6 底線 `______`、禁 `..` 雙句點；**UI 嚴禁寫死總題數**，一律讀取 `CANONICAL_STATS`。
   - **內容紅線**：禁用六大萬用樣板句（`See you later.` / `Have a nice day!` / `You're welcome.` / `It is over there.` / `Go straight.` / `Turn left.`）；無性別線索禁同現 `He/She`、`His/Her`；`V-MEAN` 必須為英文語境填空（禁「X 的中文意思是什麼」翻譯題）；`R-COMP` 短文嚴格 30～50 字；`L-WORD` / `L-RESP` 使用固定中文題幹、英語逐字稿僅存 `media.audioText`。
   - **每冊 +50 題黃金配比**：`L-WORD: 8` / `L-RESP: 8` / `V-MEAN: 10` / `G-MC: 10` / `G-CTX: 6` / `R-COMP: 8`。
2. **Pre-A1 審題與題庫（`src/data/exam/tmePreA1Bank.js`, 300 題）**：
   - `W-SCRAMBLE`（60 題，對應十大基礎句型積木架）與 `S-READ`（36 題）只供專題特訓，正式 30 題卷（35 分鐘、及格 70%）嚴格配置 15 聽力 + 15 閱讀/字彙；超綱字需降級為國小核心詞或於文末加註 `*` 中文；6 個誘答必須語意互斥（如 `playground` 不可配 `park` / `school`）。
3. **教育部 SAA 官方考古題標準截取 SOP（`src/data/exam/saa/`）**：
   - **不變規則**：`track: 'ministry-assessment'`, `sourceType: 'official'`, `sourceStatus: 'published'`, `preserveOptionOrder: true`, `reviewed: true`；每卷 35 題（Q1–15 聽力、Q16–35 閱讀）；同 `groupId` 每題必須持有 100% 相同 `passage` 物件 (SSOT)；四選一答案精確對照官方答案表；圖片型選項拆為獨立 4 張 WebP `_a.._d.webp` 並配 `options: ['(A)','(B)','(C)','(D)']` 與 `optionAltTexts`。
   - **圖片與 Pixel Gate**：Poppler (`pdftoppm -jpeg -r 110`) 依真實頁面尺寸動態縮放座標 → Sharp 裁切 WebP q92（不規則版型採獨立四座標、產出 Contact Sheet 目視驗收）；契約門禁檢查 `width/height >= 80`、非白像素 `>= 2%`、Entropy `>= 0.8`、SHA-256 唯一且全局成對差異維持 `>= 1%`（若遇極相似電子數字選項如 `saa-115-g4-24` 之 `11:14` vs `11:40` 差異 `0.76%`，應於腳本採**明確例外清單**控管，嚴禁全局降門檻）。
   - **音訊切檔與人工抽聽**：FFmpeg 加入 `0.1s` 淡入淡出與 `96k` Mono 輸出，並保留至少一次人工抽聽紀錄確認語意切點正確（自動化測試僅驗證存在性與解碼可播性）：
     ```bash
     ffmpeg -y -ss {start} -to {end} -i full.mp3 \
       -af "afade=t=in:ss=0:d=0.1,afade=t=out:st={dur-0.1}:d=0.1" \
       -vn -map_metadata -1 -c:a libmp3lame -b:a 96k -ar 44100 -ac 1 out.mp3
     ```
4. **鷹眼神探出圖與 AI 微電影規範**：
   - **找不同**：依五級單字金字塔選詞（Unit 1～4 主字 > Starter/Festival > Phonics 具象名詞 > 國小 300 字 > GEPT Kids 685 字）；先討論再出圖；變異采 Base + 8 取 5 透明補丁 + Sharp Alpha 自動標定 `slot`。
   - **微電影 & 歌謠**：YouTube 不公開＋允許嵌入＋`unitVideoQuestionData.js` 寫入影片 ID 與起訖秒數（劇本草稿保留於 `docs/MIA_AND_BEN_HALLOWEEN_SCRIPT.md` 與 `docs/SNOWY_PEAK_BISTRO_SCRIPT_BIBLE.md`）。

---

## 五、 專案現況進度與待辦清單 (Current Status & Next)

**2026-11-17 學扶館介面簡化**
- 學生首頁以「再練待加強題」作為主要入口，練習次數與僅練錯題收進「練習設定」。交卷後顯示練習次數上限、待加強總數與「往下看錯題解析」，整卷重做及列印收進「更多操作」。
- 教師後台保留班級、試卷年級、成績與列印；跨年度、批次設碼等收進「更多工具」。名冊未匯入或未解鎖時顯示入口，解鎖後收入更多工具。
- 學生與教師聚光燈導覽及使用手冊配合介面更新。截圖以隔離的示範身分產生，仍需校內實體裝置實測。

**2026-11-17 PRIORI 原卷 PDF 列印**
- 前台試卷列印可選原卷 A3 或練習卷 A4，教師後台可另選空白卷或解答卷；錯題學習單沿用既有 A4。原卷 PDF 開啟後由瀏覽器／PDF 檢視器列印，紙張與雙面由使用者設定。
- 112–114 年各 12 份學生卷與解答卷，以及 115 年三數空白卷，位於 `public/assets/priori/original/`；115 年無原卷答案 PDF。三年級英語原卷為紙筆作答形式。
- 原卷與解答 PDF 為 Cloudflare Pages 公開靜態檔案，知道網址者可直接存取。前台介面僅提供學生卷；教師權限不會限制公開靜態檔案的直接網址。

**2026-11-16 PRIORI 修正交接**
- 跨裝置合併保留最早一次初測快照，並保留最新作答的合併。無逐題作答次數的舊紀錄不再自動升級為精熟。已被舊邏輯改寫的資料無法在缺少歷史時可靠還原。
- 114 年四年級數學第 2 題數線圖重新裁切，補足 A、B、C、D 標記；圖片建置腳本一併調整。113／114 圖片完整性仍需持續逐題人工對照原卷，不能僅憑契約測試認定全部通過。
- 補上錯題特訓最後一題答錯時的 2 秒提醒，並更新使用手冊及跨裝置測試。

**後續開發與複驗注意事項（`fc5716f`）**
- 圖片稽核先閱讀原卷共同作答說明，將題組範圍套用各題。英語的聽力三圖、看圖選字及看句選圖須逐題核對題幹與每個圖片選項，保留原卷順序。例如 113 五英第 4–10 題各有三個圖片選項，第 11–17 題各有題幹圖片。
- 題幹、選項或題組說明提到「圖」可作為初篩。逐頁查看原卷中的非文字圖形、表格與圖片選項，並核對網站作答畫面、圖中文字、數字、刻度和邊緣。逐題稽核表記錄原卷頁次、應有圖片、網站實際內容與複核結果。
- `questionImage` 可作為原卷對照，預設作答是否顯示必要圖片須檢查 `figureImage`、`passage.image` 與畫面。圖片檔存在、尺寸、空白比例、題數及 CI 成功只能證明對應技術檢查通過，不能證明截圖正確或原卷圖片沒有遺漏。
- 114 四數第 2 題先前題圖上緣裁切到 A–D 標記，即使稽核表曾標示通過仍需以原卷和顯示圖覆核。重建素材後應再次檢查產出的圖檔及正式站畫面；舊的 113／114 全數 PASS 報告應視為待重新核對。
- 跨機合併時，初測 `firstAnswers`、`firstScore`、`firstCorrectCount` 和 `firstSubmittedAt` 維持同一次交卷的快照，依首次交卷時間挑選，不能把不同次交卷的空白互相填補。最新答案與初測基準分別驗證。
- 測試應涵蓋兩台裝置各交卷 10／25 題的情況，初測不應合成 80 分，也不應因合成而升精熟。另測初測時間與最後更新時間順序不同、已作答後再答錯、舊紀錄缺少 `questionAttemptCounts` 等案例。
- 若舊資料缺少足夠的作答歷史，保留已知進度並向使用者揭露無法確認的部分。已被舊邏輯改寫的資料須有可信來源才能還原。
- 交接及驗收報告分別標示自動化結果、抽查範圍、實機結果與待人工確認項目。維護者使用學校實際教學需求評估優先順序。


| 項目 | 狀態 | 備註 / 下一步 |
| :--- | :---: | :--- |
| **檢定館四軌響應式、易錯題、打地鼠/貪食蛇優化 (`d07d91e`)** | ✅ **已上線** | 正式站已具備四軌整合設定頁與自適應錯題流程 |
| **課本題庫 Canonical 擴充 (Batches A～D)** | ✅ **1,989 題在線** | Book 1～8 全冊各 +50 題高規擴充完成（Book 7: 178 題、Book 8: 176 題），全冊皆 ≥ 100 獨立 Canonical 題 |
| **Pre-A1 官方模擬題庫** | ✅ **300 題在線** | 含 30 題正式卷藍圖與專項特訓 |
| **SAA 113 年官方卷** | ✅ **105 題 + 45 音檔上線** | `scripts/test_saa_113_contract.mjs` 全過 |
| **SAA 114 年官方卷 — P0 圖片與契約鎖定** | ✅ **已上線 (`c44e60d`)** | 144 張選項圖依獨立座標裁切完成、`optionAltTexts` 與 G4 Q20 (`50/25/15/5`) 校準鎖定，105 題標準答案與 Sharp 門禁通過 `test_saa_114_contract.mjs` 與 114 E2E |
| **SAA 114 年官方卷 — P0 實體音檔** | ✅ **已上線 (`cee0282`)** | 已依 `SAA/114/{4,5,6}` 官方英聽 MP3 完成 FFmpeg 波形時間戳校準（`TIMESTAMPS_CALIBRATED = true`），產出 45 個 `96kbps Mono` + `0.1s` fade 小檔至 `public/audio/saa/114/` 並寫入 `media.audioSrc` |
| **SAA 115 年官方卷** | ✅ **105 題 + 148 選項圖 + 45 音檔結案 (`9b425e2`)** | 已通過 GPT 複檢結案（暫停 SAA 開發）。兩項非阻擋 P2 待日後順手優化：`G6 Q3 (C)/(D)` 下緣略緊、將 `0.5%` 相似度門禁改回「全局 `1%`＋明確數字題例外清單」＋保留官方音檔人工抽聽紀錄 |
| **學習扶助篩選測驗 (`PRIORI` — 獨立「學習扶助練習館」)** | ✅ **110＋111＋112＋113＋114 G3–G6 三科 ＋ 115 三數 ＋ 獨立 RLS v4・方案 A 學生自設 4 碼＋教師自訂／批次 4 碼 (`61 卷 / 1,525 題`)** | 首頁增獨立「學習扶助練習館 (`?view=priori`)」入口，完整收錄 **114 年三～六年級國／英／數（12 卷 300 題）**、**113 年三～六年級國／英／數（12 卷 300 題，含 405 張 WebP 與 55 段英聽 MP3）**、**112 年三～六年級國／英／數（12 卷 300 題，含 408 張 WebP 與 55 段英聽 MP3）**、**111 年三～六年級國／英／數（12 卷 300 題，含 407 張 WebP、51 段英聽 MP3 與 24 份 A3 原卷／解答 PDF）**、**110 年三～六年級國／英／數（12 卷 300 題，含 405 張 WebP、51 段英聽 MP3 與 24 份 A3 原卷／解答 PDF）** 與 **115 年三年級數學（25 題教師參考）**，全館合計 **61 卷 1,525 題**（全數 100% 線上作答與自動批改；僅數學科啟用計算紙；113/114 全 600 題圖片稽核見 [`docs/PRIORI_113_114_IMAGE_AUDIT.md`](docs/PRIORI_113_114_IMAGE_AUDIT.md)）。安全性已升級至 **v4（方案 A，取消 6 碼啟用碼）**。 |
| **檢定館教師派發與列印** | 📝 **已定案待排程** | 未來於 `TeacherHub.jsx` 增「一鍵派發連結／QR Code」（學生掃碼直進第 0 頁說明）、結果頁重練捷徑與瀏覽器原生 `@media print` 學習單（不做 `.docx` 產生器） |
| **全站師生使用手冊** | 📝 **初稿完成 (`docs/USER_MANUAL.md`)** | 已依現行 8 大主館、主站 7 分頁教師台與學扶 v4（方案 A）完成 [`docs/USER_MANUAL.md`](docs/USER_MANUAL.md) 撰寫，並對齊 GPT 覆核修正點；待校內 iPad 實機走測補截圖後即可定稿發布 |
| **詞句試煉重塑＋Batch 1～2B 第 1～8 冊全量句型積木工坊＋上榜與八星連動** | ✅ **全量上線就緒（`practiceOnly={false}`・一～六年級資格／Top 50 英雄榜／八冊秘典八星已連動並全過 6 階段 E2E）** | 單字館第 3 欄「詞句試煉」已全面取代停辦之 `quiz-choice`：(1) **一／二年級共享純字母連續序列（`sentence-abc`）**：整備室共用 `大寫 / 小寫 / 混合`（G1 預設大寫＋連續 **3 字母**、G2 預設小寫＋連續 **5 字母**，`mixed` 嚴格逐題交替 `U/L/U/L...`，進工坊自動隱藏 `Lv.1/2/3`），通關正式計入一／二年級英雄榜、金幣與八冊秘典第 1／2 冊 `sentence` 星數，並同步對齊 `StandardQuiz` 與 `SpellingGame`（移除強制大寫 CSS）；(2) **三～六年級第 1～8 冊全單元 Lv.1～Lv.3 全量題庫（`sentence`，共 524 題）**：依 `textbook_docx/ALL Contents.pdf` 完成基礎 Lv.1/Lv.2 **257 題**、U4 跨單元滾雪球 **50 題**、Lv.3 四合一情境挑戰 **217 題**（全數預設隱藏中文、零干擾卡、44 張目視確認無字 Pre-A1 PNG 與防洩漏掃描）；(3) **英雄榜＆八星連動與年級防刷保護**：`LeaderboardView` 納入 `句型積木工坊`（`sentence`／`sentence-abc`）至「詞句試煉」與「遊戲之王」總榜、`TeacherHub` 支援 `sentence`／`sentence-abc` 查詢；低年級 `abc` 與三～六年級「單冊 ≥2 單元／全冊／Review」正式上榜並依答對率（`≥80%` 三星）連動 `grimoireHelper` 八冊秘典各冊 `sentence` 星位（`isBookInOwnGrade` 嚴守 3年=1~2冊、4年=3~4冊、5年=5~6冊、6年=7~8冊）；單單元或跨冊混選則自動進入 `not_qualifying_book` 純練習保護（絕不洗榜與洗星）。 |

---

## 六、 常用驗證、工具與快速入口

```bash
# 1. SAA 113 / 114 / 115 契約、檢定與語意測試
node scripts/test_saa_113_contract.mjs
node scripts/test_saa_114_contract.mjs
node scripts/test_saa_115_contract.mjs
node scripts/audit_semantic_gates.mjs
node scripts/test_exam_audit_fixes.mjs
node scripts/test_exam_setup_flow.mjs

# 2. 課本題庫擴充批次驗證
node scripts/verify_canonical_schema.mjs
node scripts/test_batch_a_contract.mjs
node scripts/test_batch_b_contract.mjs
node scripts/test_batch_c_contract.mjs
node scripts/test_batch_d_contract.mjs

# 3. Real PostgreSQL SQL 實測、ESLint、建置、學扶館 E2E 與 6 階段無頭 Chrome 回歸測試 (推送前必跑，注意勿同時併行兩個預覽測試)
node scripts/test_priori_sql_pg.mjs ; if ($LASTEXITCODE -eq 0) { npm run lint } ; if ($LASTEXITCODE -eq 0) { npm run build } ; if ($LASTEXITCODE -eq 0) { node scripts/verify_priori_e2e.mjs } ; if ($LASTEXITCODE -eq 0) { node scripts/smoke_test.mjs }
```

- **管理者快捷通道**：鍵盤 `Ctrl+Shift+A`／`Ctrl+Alt+T`，或 ErrorBoundary ⚠️ 圖示連點 5 下，教師密碼 `wt7902230`。
- **隱藏測試頁路由**：`?view=spotter-test`（放大鏡連按 5 下）、`?view=preloader-showcase`、`?view=zoom-showcase`。

---

## 七、 學習扶助篩選測驗 (`PRIORI`) Stage 0 盤點與新對話交接規格

> [!CAUTION]
> **PDF 轉圖鐵律（嚴禁使用 `pdf-parse` `getScreenshot()`）**：
> - `pdf-parse` 的 `getScreenshot()` 在 Node.js 環境缺少繁體中文 CMap 與系統中文字型，會導致題圖／文章圖內的「公分、單位、國字、注音」發生**字型替換變形（看似 OCR 失敗）**。
> - **日後凡製作 `111 / 110 / 109 / 108` 等任何 PRIORI 試卷截圖**，一律必須匯入共用模組 [`scripts/lib/renderPdfPagesWithChrome.mjs`](scripts/lib/renderPdfPagesWithChrome.mjs)（`renderPdfPagesWithChrome(pdfPath, SCALE)`），透過本機 Chrome DirectWrite 完整繁中字型引擎＋`pdfjs-dist` (`cMapUrl` + `standardFontDataUrl` + `useSystemFonts: true`) 轉製無失真頁面底圖後再裁切 `.webp`。
> - 切圖與總覽拼圖產生後，盡量以純本機腳本與契約測試（如 `"圖片"` 必備圖檢查＋Sharp 門禁）把關，或產出 `tmp/<年度>_sheets/*.png` 供人工列印目檢，**避免讓 AI 多模態視覺批次讀大圖消耗額度**。

> **工作區交接指引**：`PRIORI/115篩選測驗/`（亦位於本機 `C:\Users\user\Documents\chatgpt\PRIORI\115篩選測驗\`）原始 PDF 與 MP3 **僅存於 Windows 本機（已列於 `.gitignore` `/PRIORI/`）**，由**本機桌面板 Antigravity 開新對話**接手開發。開工前請先確認 Git 遠端對齊最新 `u8640012026/wutaivocab` `main`（避免主工作區停在舊 commit 或另有隔離 worktree 衝突），且全程不可覆蓋本機未追蹤原始資料。

### 1. Stage 0 本機素材盤點現況（不得擅自推入 Git）
- **試卷 PDF（16 卷）**：國語 G1–G6、數學 G1–G6、英語 G3–G6；已核對檔案數與頁數，除三年級數學外尚未逐卷完整目視審核題型與卷內是否含答案。
- **官方答案與評分規準**：目前另有國語 G1–G2、數學 G1–G2、英語 G3 獨立答案卷及國語手寫／英語字母評分規準；**三年級數學尚未找到獨立官方答案卷**（未見官方答案前，嚴禁自行推算並標記為官方答案）。
- **英語音檔（4 檔）**：英語 G3–G6 各 1 個 MP3（G4–G6 檔長相同但 SHA-256 不同），尚未逐題試聽或與試卷對應校對。
- **公開授權核實（上線前阻塞檢查）**：[官方 115 年篩選測驗公告](https://exam.tcte.edu.tw/tbt_html/index.php?mod=news%2Findex%2Fnews_id%2F686) 與 [官方問答集](https://exam.k12ea.gov.tw/tbt_html/index.php?mod=faq) 僅說明學校施測期間下載與紙本取得方式，尚未構成公開網站重製題圖與音檔之明確授權；正式對外開放前需向主管單位確認授權範圍。

### 2. 三學科題型陷阱與「三層資料架構」鐵律
瀏覽器無法直接朗讀圖片，且 OCR 抽取會破壞分數／注音排版，**嚴禁未人工校對即啟用 OCR 朗讀**：
1. **`questionImage`**（視覺真本）：官方題圖與 4 張獨立選項圖卡（維持原選項順序，題圖與選項圖皆支援放大；圖形與分數免設圖片座標熱區）。
2. **`questionText`**（人工核對文字）：供搜尋、無障礙與教師檢閱；OCR 僅供產生初稿。
3. **`ttsText`**（專屬自然朗讀稿）：為 TTS 重新編寫口語自然文字，例如：
   - `2043 + 1958` →「二千零四十三加上一千九百五十八」；分數 `3/8` →「八分之三」。
   - **國語**：含注音、破音字與特殊空格，必須保留原題圖與人工校對朗讀稿。
   - **數學**：計算、單位、分數與幾何圖形須另寫自然朗讀文字。
   - **英語**：如 G3 前段為「聽音寫大小寫字母」，非四選一不得強行硬轉為選擇題；英語閱讀採 `en-US`，官方聽力作答前嚴禁以 TTS 洩漏逐字稿。
- 資料模型應同時預留 **題組 (`groupId`/`passage`)、官方聽力音檔 (`audioSrc`)、非選擇題（手寫／輸入）** 之擴充欄位。

### 3. 獨立練習館、雙模式與首波 G3 數學 MVP 範圍
- **獨立入口與資料完全隔離**：於首頁 `Portal.jsx` 另設獨立入口 **「學習扶助練習館」**（不混入檢定館既有課本 1,989 題、Pre-A1 300 題、SAA 315 題；題號、作答紀錄、錯題庫與精熟分母均獨立計算，**沿用登入身分但不改動現有金幣與積分**）。
- **雙模式切換**：
  - **原卷模擬**：國語、數學及英語閱讀題不開放朗讀，僅播放原本即有之官方聽力音檔。
  - **輔助練習（明確標示「輔助朗讀」）**：僅對**已完成人工核對 `ttsText` 之題目**啟用題幹與選項喇叭按鈕（未核對前不得顯示或啟用）。
- **Stage 1 首波目標 — 115 年三年級數學單卷 MVP**：
  - 共 25 題四選一（每題 4 分），涵蓋計算、單位、分數與圖形題（MVP 不需英語音檔）。
  - **上線前紅線**：在確認官方答案來源及公開授權前，**不得公開啟用自動計分或宣稱官方答案**；通過後再決定作答紀錄儲存機制與靜態媒體是否使用 Cloudflare R2。
  - **驗收門檻**：逐題對照原卷 PDF 與官方答案、實測圖片縮放／手機版操作／朗讀精確度／資料與金幣隔離，並 100% 通過 `npm run build` 與 6 階段 `smoke_test.mjs`。

#### 7.5 Stage 1 MVP 完成實作紀錄（115 年三年級數學科）
- **資料與資產管線**：
  - [`scripts/build_priori_115_math_g3_assets.mjs`](scripts/build_priori_115_math_g3_assets.mjs)：擷取 `PRIORI/115篩選測驗/數學/115年篩選測驗數學科3年級試卷.pdf` 產出 25 張全題原卷注音圖（`q01.webp`–`q25.webp`）與 6 張幾何／數線專圖（`q09_fig`, `q11_fig`, `q13_fig`, `q15_fig`, `q19_fig`, `q25_fig` 共 31 張 WebP，自動去白邊加均勻留白），並生成 Contact Sheet 目視確認。
  - [`src/data/priori/priori115MathG3.js`](src/data/priori/priori115MathG3.js) 與 [`src/data/priori/index.js`](src/data/priori/index.js)：落實三層資料（`questionImage` / `figureImage` / `questionText` + 分數 `{a/b}` 語法 / `ttsText` 與 `optionTtsTexts` 自然口語稿）、課綱／學扶指標代碼、`explanationSteps`（3～4 步引導詳解）與預留欄位（`groupId`, `passage`, `media`）；明確標記 `answerSource: 'teacher_solved'`、`officialAnswerVerified: false`（因國教署尚未公布 115 三～六年級官方答案卷，經由原卷算驗及外部教師參考鍵交叉確認）。
  - [`scripts/test_priori_115_math_g3_contract.mjs`](scripts/test_priori_115_math_g3_contract.mjs)：驗證 25 題格式、答案、禁止生硬計算符號出現在 `ttsText`/`optionTtsTexts`、`ttsVerified === true`，並對 31 張 WebP 執行 Sharp 尺寸／非白像素（`>= 2.0%`）／影像熵檢查（標準題圖 `>= 0.80`；4 張純黑白線條幾何與數線檔列明確例外 `>= 0.50`）。
- **獨立練習館介面與互動元件 (`src/features/priori/`)**：
  - [`PrioriPracticeHub.jsx`](src/features/priori/PrioriPracticeHub.jsx)、[`PrioriScratchpad.jsx`](src/features/priori/PrioriScratchpad.jsx)、[`PrioriTeacherDashboard.jsx`](src/features/priori/PrioriTeacherDashboard.jsx)、[`prioriStorage.js`](src/features/priori/prioriStorage.js)、[`PrioriModals.jsx`](src/features/priori/PrioriModals.jsx)、[`MathRichText.jsx`](src/features/priori/MathRichText.jsx) 與首頁／路由整合（[`Portal.jsx`](src/components/Portal.jsx)、[`App.jsx`](src/App.jsx)、[`Button3D.jsx`](src/components/ui/Button3D.jsx) 加 `cyan` 變體）。
  - 支援：`?view=priori`、`?view=priori&paper=115-math-g3` 與 `?view=priori&tab=teacher` 直達連結；iPad 橫屏（`>= 1024px`）自動展開右欄分題記憶方格計算紙（切換題目自動保存／還原筆跡並支援 `PrioriScratchpadPreview` 唯讀回放）；原卷模擬／輔助朗讀即時切換；原卷注音圖切換與放大平移燈箱；交卷防呆確認；逐題逐步解題提示；錯題重練；**連續答對 2 次 (`streaks[q.id] >= 2`) 自動升級為「已精熟」**；獨立紀錄儲存於 `wutai_priori_v1_${studentId}` 並同步至隔離通道 `leaderboard (mode='priori-record', week=0)`，絕不觸碰單字館金幣、積分或 `mcq-exam`。
  - **獨立教師診斷後台 (`?view=priori&tab=teacher`，由 Supabase `bcrypt` 帳號驗證)**：可切年度／科目／年級／班級與內建示範班級；「各題答題情況與單題計算紙」可看 25 題答對率、精熟率、4 選項誘答人數並點開單題全班學生手寫計算紙；「各生作答與精熟明細」可點閱個別學生初測→最新進步分數與各題筆跡回放，並提供 `重設換機鎖`（僅解除裝置綁定與忘記的 4 碼小密碼，完整保留成績）。
- **後續擴充進度 — Route 1（114 年三年級 國／英／數完整官方三科 ＋ 分科錯題沉底特訓）已完成**：
  - **資產與音檔管線 (`scripts/build_priori_114_g3_assets.mjs`)**：依 K-12EA 114 年三年級空白試卷與紅字標準答案卷產生 **90 張 WebP 圖資**（數學 34 張含 9 張獨立圖形 `q01/02/07/08/11/12/19/20/25_fig`、國語 27 張含 2 篇題組原卷圖 `passage_20_22`/`passage_23_25`、英語 29 張含 `q22..25_fig`），並用 FFmpeg 將 `PRIORI/114篩選測驗/114年篩選測驗英語科3年級試卷聽力檔.mp3` 依 95 段靜音邊界精確切分為 **25 個官方題音檔 (`public/audio/priori/114/eng-g3/q01.mp3`–`q25.mp3`，每題 7.2s–12.7s)**。
  - **三科官方題庫與專屬題型 UI (`officialAnswerVerified: true, answerSource: 'official_pdf'`)**：
    - [`src/data/priori/priori114MathG3.js`](src/data/priori/priori114MathG3.js)（25 題四選一）、[`src/data/priori/priori114ChineseG3.js`](src/data/priori/priori114ChineseG3.js)（19 單題＋2 組共 6 題左文右題閱讀理解）、[`src/data/priori/priori114EnglishG3.js`](src/data/priori/priori114EnglishG3.js)（Q1–15 `alphabet-pair` 聽音大小寫寫入 [`PrioriAlphabetPad.jsx`](src/features/priori/PrioriAlphabetPad.jsx) 四線格、Q16–21 `O/X` 2 選、Q22–25 聽辨對話 3 圖選＋官方 MP3 慢/原速切換）與統一索引 [`src/data/priori/index.js`](src/data/priori/index.js)（4 卷 100 題）。
  - **分科隔離錯題沉底引擎與教師後台擴充**：
    - [`prioriStorage.js`](src/features/priori/prioriStorage.js) 新增 `getSubjectRemedialPool`、`recordPrioriSubjectDrillAttempt` 與英語大小寫寬鬆解析比對 (`parseAlphabetPairAnswer` / `isPrioriAnswerCorrect`)；[`PrioriPracticeHub.jsx`](src/features/priori/PrioriPracticeHub.jsx) 於各科分頁建置嚴格分流不混科之「**錯題沉底特訓專區**」（答錯即時提示並排至題組隊尾重作、連對 2 次升級「🌟 已精熟」），[`PrioriTeacherDashboard.jsx`](src/features/priori/PrioriTeacherDashboard.jsx) 支援 `114`/`115` 雙年度切換、三科班級統計與英語「常見誤寫」字對剖析。
  - **圖資與列印品質修正**：
    - `115-math-g3` Q11 (`q11_fig.webp`) 裁切座標擴大上緣高度（`top: 3022, height: 268`）確保雙圓頂部完整無切邊；`114-math-g3` Q1 (`q01_fig.webp`) 精準裁至純圖形規律列（`height: 64`）並精簡 `questionText` 消除題圖與文字重複。
    - 列印分流 (`PrioriModals.jsx` `PrioriPrintableSheet`)：外部學生學習單列印（`showAnswerKey={false}`）徹底隱藏「作答／正解」；僅於已授權之獨立教師診斷後台提供「列印解答卷（含正解）」（`showAnswerKey={true}`）。
  - **英語四線格標示與雲端同步可視化（GPT 審查跟進）**：
    - 移除 `PrioriModals.jsx` 列印空格處會觸發 ESLint `no-irregular-whitespace` 的全形空白改用 CSS 寬度，解除 Cloudflare Pages CI 部署阻塞；[`PrioriAlphabetPad.jsx`](src/features/priori/PrioriAlphabetPad.jsx) 補上「字元輸入辨識與紙筆字形／四線格位置人工批閱差異」提示；[`prioriStorage.js`](src/features/priori/prioriStorage.js) 補齊 Supabase `.select/.update/.insert` `{ error }` 檢查並在 [`PrioriPracticeHub.jsx`](src/features/priori/PrioriPracticeHub.jsx) 與 [`PrioriTeacherDashboard.jsx`](src/features/priori/PrioriTeacherDashboard.jsx) 顯性呈現雲端同步錯誤；同步更新 [`supabase_schema.sql`](supabase_schema.sql) `chk_leaderboard_week`（`week >= 0 AND week <= 53`）對齊隔離通道設計。
  - **視覺區隔、極簡大廳、派卷 QR 與教師班級矩陣＋去識別化加密名冊**：
    - **首頁卡片分色**：[`Button3D.jsx`](src/components/ui/Button3D.jsx) 新增 `lime`（黃綠）變體用於「學習扶助練習館」（在深靛藍與深紫間清楚跳色），[`Portal.jsx`](src/components/Portal.jsx) 將「自編英語電子教科書」調整為 `wood` 暖棕色，徹底避開森林綠／天藍重複視覺。
    - **學生大廳極簡化與派卷 QR (`PrioriPracticeHub.jsx` / `PrioriModals.jsx`)**：移除冗餘文字說明，保留「科目 × 年級」切換與 **115→108 降冪緊湊橫條**（年分、精熟狀態、純圖示印表機鈕、`開始測驗／再練一次`），僅在該科有已作答紀錄時顯示錯題沉底特訓橫幅；「派卷 QR」彈窗支援教師自選 `科目 × 年度 × 年級` 產生 `?view=priori&paper=<paperId>&entry=qr`，學生掃碼後進入乾淨確認頁（顯示「目前身分 ＋ 切換座號」、「要做的試卷」與主按鈕「進入測驗」）。
    - **班級優先教師矩陣與前端去識別化加密名冊 (`PrioriTeacherDashboard.jsx` / `PrioriRosterModal.jsx` / `prioriSecurity.js`)**：教師密碼採加鹽 SHA-256 雜湊驗證 (`prioriSecurity.js`) 移除前端明文密碼比對；預設為「班級座號升冪總覽矩陣」（支援「依年度看國／數／英」與「依科目看歷年 115–108」、未作答以 `-` 顯示、點分數格直接進個人逐題與計算紙筆跡回放＋全班「單題診斷」分頁）；因 `wutaivocab` 正式庫 (`fqkdkmcqjswufzbvkram`) 原先未建校內名冊表（校內名冊原存於 `classqna`/`wutpsdata` 另庫），新增 `PrioriRosterModal` 支援匯入 `classqna` JSON／CSV／Excel，預設以中間字 `O` 去識別化（如 `王小明 → 王O明`）並經 Web Crypto `PBKDF2` + `AES-256-GCM` 加密後存於隔離通道 `leaderboard (mode='priori-roster', week=0)` 與教師端 `localStorage`，明文與真實全名絕不進入 Git 與 Cloudflare 靜態資源。
    - **錯題特訓規範統一（學扶館 `prioriDrill.js` / `PrioriPracticeHub.jsx` ＋ 檢定館 `PureMcqExamView.jsx`）**：雙館皆嚴禁跨範圍抓題或自行造題湊數；選項統一為「**10 題短測 / 20 題長測**」（移除無上限模式），畫面上明確標示本輪終點；若範圍內錯題達成連對 2 次（0 待精熟，如 2 錯題連對 4 次即滿）立即提前結束，若反覆答錯則於達 10/20 上限時強制結束結算；並支援「**中途離開**」一鍵保存目前已作答批改進度並結算。
    - **教師指定列印彈窗、單橫行控制列與「依班級／依題目」雙軸矩陣＋各班人數骨架 (`PrioriModals.jsx` / `PrioriTeacherDashboard.jsx` / `prioriStorage.js`)**：
      - 共用 [`PrioriPaperAxisSelector`](src/features/priori/PrioriModals.jsx) 抽出 [`PrioriTeacherPrintModal`](src/features/priori/PrioriModals.jsx)，後台點「列印解答卷（含正解）」即可像派卷 QR 一樣自由指定「科目 × 年度 × 年級」與「教師解答卷（含正解）／空白練習卷」，不再綁死當前預覽卷。
      - 後台主工具列收斂為單橫行 `1. 年級 / 2. 班級 / 3. 檢視（依班級｜依題目）/ 4. 搜尋`。內建無個資全校公開班級人數 `SCHOOL_CLASS_HEADCOUNTS`（一甲5、二甲6、三甲6、四甲8、五甲6、六甲6；一乙11、二乙4、三乙9、四乙11、五乙19、六乙12）預先展開座號 `1..N`（無加密名冊時提供純存瀏覽器 `wutai_priori_teacher_local_names_v1` 之空白姓名欄直接輸入）。
      - 「依題目」模式透過子膠囊切換 `科目 × 年度 × 年級`（含已建置快捷膠囊），下方呈現「縱軸：第 1–25 題題意縮減 + 答對率；橫軸：該班座號 `1..N` 升冪；格內：`🌟` 已精熟／`○` 答對／`✕` 答錯／`-` 未作答＋`✏️` 筆跡」交叉矩陣，點擊任意題目立即展開選項誘答分佈與全班學生手寫計算紙檢視。
    - **跨裝置合併、訪客防寫雲端、輕量裝置提示、初測／精熟雙視角與 CI 收編 (`prioriStorage.js` / `PrioriPracticeHub.jsx` / `PrioriTeacherDashboard.jsx` / `supabase_schema.sql` / `canonical-ci.yml`)**：
      - **多裝置合併與初測基線凍結**：[`prioriStorage.js`](src/features/priori/prioriStorage.js) 新增 `fetchAndMergeStudentCloudRecords`、`mergePrioriPaperRecord`（依 `updatedAt` 保留較新連對、凍結初測 `firstAnswers` / `firstScore` / `firstCorrectCount` 不被後續沉底練習覆蓋，並累計 `drillAttemptsCount` 與逐題 `questionAttemptCounts`），學生切換 iPad／手機登入自動接續雲端最新進度；訪客 (`guest` / `999999`) 嚴格僅留本機 `localStorage`，絕不寫入雲端共用鍵。
      - **無負擔誠實登錄與一鍵登出重選**：[`PrioriPracticeHub.jsx`](src/features/priori/PrioriPracticeHub.jsx) 大廳與派卷 QR 確認頁不阻擋作答，僅於同一台 iPad 切換座號或跨裝置接續時跳出柔和提示（含 `點錯了？切換座號` 與頂部一鍵 `登出` 鈕），並於訪客掃描 QR 時提醒只存本機。
      - **示範班級內建下拉與「初測（預設）／精熟後」雙模式**：移除後台頂部示範開關與自動開假資料邏輯（真實空班永遠乾淨）；於「1. 年級」與「2. 班級」下拉選單內建 `🧪 示範班級（假資料）` 選項，任選其一即切換示範介面。子膠囊新增 `初測成績（預設）｜精熟後成果` 切換，逐題呈現已答／應答人數分母與自主補練次數。
      - **資料庫約束冪等修復與 CI 收編**：[`supabase_schema.sql`](supabase_schema.sql) 改為先 `DROP CONSTRAINT IF EXISTS chk_leaderboard_week` 再建 `CHECK (week >= 0 AND week <= 53)`；跨平台 E2E 升格至 [`scripts/verify_priori_e2e.mjs`](scripts/verify_priori_e2e.mjs) 並納入 [`.github/workflows/canonical-ci.yml`](.github/workflows/canonical-ci.yml)。
    - **僅數學科啟用計算紙與 114 年度四～六年級國／英／數全 9 卷完整入庫（2026-11-15）**：
      - **僅數學科計算紙規則**：`prioriStorage.js` 示範資料、`PrioriPracticeHub.jsx` 作答／復盤區與 `PrioriTeacherDashboard.jsx` 矩陣與明細僅在數學科顯示「計算紙」與 `✏️` 筆跡徽章，國語與英語全選擇卷徹底隱藏計算紙版面。
      - **114 年度四～六年級全 9 卷入庫（共 225 題，全館累計 13 卷 325 題）**：新增 [`scripts/build_priori_114_g4_6_assets.mjs`](scripts/build_priori_114_g4_6_assets.mjs) 依 K-12EA 原卷產出 **316 張 WebP**（`public/assets/priori/114/{math,chi,eng}-g{4,5,6}/`）與 **30 段官方英聽 96kbps Mono MP3**（`public/audio/priori/114/eng-g{4,5,6}/q01..q10.mp3`），並建立 [`priori114MathG4.js`](src/data/priori/priori114MathG4.js)–[`G6.js`](src/data/priori/priori114MathG6.js)、[`priori114ChineseG4.js`](src/data/priori/priori114ChineseG4.js)–[`G6.js`](src/data/priori/priori114ChineseG6.js)、[`priori114EnglishG4.js`](src/data/priori/priori114EnglishG4.js)–[`G6.js`](src/data/priori/priori114EnglishG6.js)，225 題皆經官方紅字答案卷核對 (`officialAnswerVerified: true`) 且通過 [`scripts/test_priori_114_g4_6_contract.mjs`](scripts/test_priori_114_g4_6_contract.mjs) 與 CI 接入。
    - **跨裝置合併重算、國語原文朗讀無劇透與 30 段英聽逐段聽驗覆核（2026-11-15 `dcf63dd` 跟進）**：
      - **跨裝置交錯合併即時重算摘要**：將無狀態作答判別與合併核心 (`summarizePrioriPaperState`、`mergePrioriPaperRecordWithPaper`) 抽至純 JS [`prioriDrill.js`](src/features/priori/prioriDrill.js) 並由 [`prioriStorage.js`](src/features/priori/prioriStorage.js) 委派呼叫。修補兩台裝置各做不同題號交錯同步時「新機未答 `null` 覆蓋舊機連對／未於合併後重算 `score`、`firstScore`、`correctCount`、`firstCorrectCount`、`wrongIds`、`masteredCount`」問題；[`test_priori_drill_contract.mjs`](scripts/test_priori_drill_contract.mjs) 新增雙機交錯測試，[`verify_priori_e2e.mjs`](scripts/verify_priori_e2e.mjs) Test I 內建 Supabase PostgREST 記憶體雙機離線交錯同步實測驗證（各答對 1 題自動收斂為 `8 分 / 2 題` 並同步顯示於大廳與教師後台初測／精熟雙視角）。
      - **國語閱讀原文朗讀去劇透與英聽 30 段逐段覆核**：修正四～六年級國語 8 篇閱讀理解 `ttsText` 為 100% 逐字朗讀原文（移除如六年級 `跑廁所`、五年級 `心存希望` 等劇透釋義，維持交卷後才顯示 `explanationSteps`）；直接聽驗完成四～六年級共 30 段官方 MP3 (`q01..q10.mp3`) 確認題號、3 遍完整播放與正解 100% 相符，並微調四／六年級英語 `conceptTitle` 與解析步驟敘述。
    - **Supabase 獨立資料表隔離、學生換機小密碼 Token 與教師憑證輪替（2026-11-15 `b4f3f21` 複檢強化）**：
      - **舊資料保全遷移＋7 表零公開權限**：[`supabase_priori_security.sql`](supabase_priori_security.sql) 建立 `public.priori_records`、`public.priori_rosters`、`public.priori_student_bindings`、`public.priori_student_sessions`、`public.priori_teacher_auth`、`public.priori_teacher_sessions` 與封存表 `public.priori_legacy_leaderboard_backup`（全部啟用 RLS 且 `REVOKE ALL`）。執行時先完整備份並驗證筆數後，才將舊 `leaderboard` 內的 `priori-record`/`priori-roster` 遷移清理，並於 `leaderboard` 加上 `chk_leaderboard_no_priori` 約束永久禁止未來寫入。前端 [`prioriStorage.js`](src/features/priori/prioriStorage.js) 與 [`prioriSecurity.js`](src/features/priori/prioriSecurity.js) 徹底停止對公開 `leaderboard` 讀寫，亦完全移除先前曝光於 Git 的加鹽 SHA-256 雜湊。
      - **學生同機免密・換機 4 碼 Token 隔離 (`42501`)**：依 Mark 確認之輕量 UX，首次綁定某座號時設定「4 碼換機小密碼」，該台 iPad 之後永遠免輸密碼自動續登；僅換用新平板／手機時要求輸入 4 碼小密碼驗證並簽發 30 天專屬 Token（`psess_*`），`priori_student_get_records` / `priori_student_upsert_record` 強制驗證 `p_token` 與目標 `p_student_key` 相符（跨座號讀寫即拋 `42501`；誤試 5 次鎖定 15 分鐘；教師後台提供 `重設換機鎖` 僅清綁定不動成績）。
      - **教師 `bcrypt` 輪替＋班級／名冊權限隔離**：移除舊 `sha256-salted` 與預設雜湊帳號，強制由管理者於 SQL 執行前替換 `__REPLACE_WITH_ADMIN_NEW_PASSWORD__` 以 PostgreSQL `pgcrypto` `bcrypt` 初始化密碼；`priori_teacher_list_records`、`priori_teacher_get_roster`（`priori_school_roster_v1` 僅限 `*` 全校權限）與 `priori_teacher_save_roster` 均於伺服器端檢核 `allowed_classes`（越權班級拋 `42501`）。
      - **實測與權限稽核腳本**：更新 [`scripts/verify_priori_supabase_rls.mjs`](scripts/verify_priori_supabase_rls.mjs) 支援 7 表直連阻斷、舊公開列零殘留、`chk_leaderboard_no_priori` 阻擋測試、舊曝光密碼拒絕驗證，以及可選參數 `PRIORI_TEST_STUDENT_ISOLATION=1`、`PRIORI_TEACHER_PASSWORD` 與 `PRIORI_CLASS_TEACHER_PASSWORD` 跨生／跨班隔離實測。
    - **113 年度三～六年級國／英／數全 12 卷入庫與官方答案校正（2026-11-15，全館累計 25 卷 / 625 題）**：
      - **資產與音檔管線 (`scripts/build_priori_113_g3_6_assets.mjs`)**：依 K-12EA 113 年三～六年級空白試卷、紅字官方答案卷與官方原音 MP3（含僅無 `ans/` 前綴之三年級答案卷亦精準核對），切製產出 **405 張 WebP**（`public/assets/priori/113/{math,chi,eng}-g{3..6}/`，其中三英 29 張、四／五英各 47 張、六英 44 張、三數 33 張、四數 35 張、五數 31 張、六數 28 張、三國 27 張、四國 27 張、五國 29 張、六國 28 張）與 **55 段官方英聽 96kbps Mono MP3**（`public/audio/priori/113/eng-g3/q01..q25.mp3` 25 段＋`eng-g{4,5,6}/q01..q10.mp3` 30 段，含完整題號與 3 遍原音，且經實際聽驗音色與題號無誤）。
      - **全 12 卷 Canonical 資料模組＋錯鍵校準機制**：完成 [`priori113MathG3.js`](src/data/priori/priori113MathG3.js)–[`G6.js`](src/data/priori/priori113MathG6.js)、[`priori113ChineseG3.js`](src/data/priori/priori113ChineseG3.js)–[`G6.js`](src/data/priori/priori113ChineseG6.js)、[`priori113EnglishG3.js`](src/data/priori/priori113EnglishG3.js)–[`G6.js`](src/data/priori/priori113EnglishG6.js) 並於 [`src/data/priori/index.js`](src/data/priori/index.js) 註冊發布，並依 GPT 逐題抽檢修正 **113 五英 Q9 正解 `(1)` (`answer: 0`)** 與 **113 六英 Q23 正解 `(2)` (`answer: 1`)** 及對應解析／契約測試；[`prioriDrill.js`](src/features/priori/prioriDrill.js) 新增 `reconcilePrioriPaperRecordWithPaper`，載入本機或雲端舊紀錄時自動依最新試題正解重算 `score`、`firstScore`、`wrongIds` 與 `streaks`（保留既有作答與連對紀錄）。
    - **Supabase 安全遷移 v3.1 → v4（方案 A 簡化版＋完整防回歸實測）**：
      - **1. 精確 9 參數簽名＋真實 PostgreSQL CI 執行**：[`supabase_priori_security.sql`](supabase_priori_security.sql) 以 `DROP FUNCTION IF EXISTS` 清理舊版 6 碼啟用碼 RPC，確保 `priori_student_upsert_record`（9 參數含 6 個 `TEXT`）與新版 `priori_student_login_seat(TEXT, TEXT, TEXT)`、`priori_teacher_set_student_pin(TEXT, TEXT, TEXT)`、`priori_teacher_set_class_pins(TEXT, TEXT, TEXT, TEXT, BOOLEAN)` 的 `REVOKE/GRANT` 完全對齊；[`scripts/test_priori_sql_pg.mjs`](scripts/test_priori_sql_pg.mjs) 以 `@electric-sql/pglite`＋`pgcrypto` 完整由頭到尾執行並重複驗證冪等性，納入 [`.github/workflows/canonical-ci.yml`](.github/workflows/canonical-ci.yml)。
      - **2. 方案 A（移除 6 碼啟用碼，保留學生 4 碼自設＋教師自訂／批次 4 碼重設）**：學生登入尚無紀錄之空白座號時，無須教師先發 6 碼啟用碼，可直接於 iPad 自設 **4 碼換機密碼** 並綁定該裝置（原機永久免密、僅換機需 4 碼）；若該座號已有舊雲端作答紀錄但尚未設密碼，仍回傳 `needs_teacher_pin` 強制先由教師設定初始 4 碼，杜絕匿名搶佔既有成績。教師與管理者於 [`PrioriTeacherDashboard.jsx`](src/features/priori/PrioriTeacherDashboard.jsx) 可直接自訂任意 4 碼替單一學生（`設 4 碼`／`改設 4 碼`）或批次（`批次設 4 碼密碼`，支援目前班級／全校所有班級、及是否覆蓋已有密碼者）統一重設，保留全部作答並即時撤銷舊裝置工作階段；登出／切換教師帳號時以 `sessionEpochRef` 清零狀態與進行中請求。
      - **3. 無個資 `priori_student_directory` 強制伺服器班級鎖定與嚴格只讀稽核**：DB 種子化全校 `SCHOOL_CLASS_HEADCOUNTS` 座號目錄，`priori_student_upsert_record` 與 `priori_teacher_list_records` 一律由伺服器端名冊鎖死 `grade`／`class_num`／`seat`（送出偽造年班立即拋 `42501`）；[`scripts/verify_priori_supabase_rls.mjs`](scripts/verify_priori_supabase_rls.mjs) 預設模式改為 100% 嚴格只讀（`teacherPw`/`classTeacherPw` 亦鎖於 `ALLOW_TEST_DB_WRITES` 下，零 `POST` 寫表、零登入／重設／密碼探測）。
      - **4. 鎖表原子遷移與 `leaderboard` 隔離封鎖**：[`supabase_priori_security.sql`](supabase_priori_security.sql) Step 3 先 `LOCK TABLE public.leaderboard IN SHARE ROW EXCLUSIVE MODE`、套用 `leaderboard` 4 條 RLS 排除政策並加上 `chk_leaderboard_no_priori ... NOT VALID`，分別獨立選取「最新作答」與「最早有效初測」，核對分數雙重吻合後僅刪除 `id = ANY(v_verified_source_ids)` 並 `VALIDATE CONSTRAINT chk_leaderboard_no_priori`。升級至 v4 時，已建好之 `admin` bcrypt 密碼與既有 `priori_records` 皆原封保留不覆蓋。
  - **驗證與 CI 追蹤 (`491486d` / 最新自動化全綠)**：[`scripts/test_priori_sql_pg.mjs`](scripts/test_priori_sql_pg.mjs)、7 項 PRIORI 契約測試（[`test_priori_111_g3_6_contract.mjs`](scripts/test_priori_111_g3_6_contract.mjs) 至 [`115`](scripts/test_priori_115_math_g3_contract.mjs) 與 [`drill`](scripts/test_priori_drill_contract.mjs)）、[`scripts/screen_priori_content.mjs`](scripts/screen_priori_content.mjs)（`--strict` 內容防劇透／缺圖／音檔／A3 檢查與 `--spot-check` 抽樣）、[`scripts/verify_priori_e2e.mjs`](scripts/verify_priori_e2e.mjs)（Tests A–L）、`npm run lint`（`0 errors`）、`npm run build` 與 6 階段 `scripts/smoke_test.mjs` 全部通過；`491486d` 雲端跨平台 CI ([Run 44432400098](https://github.com/u8640012026/wutaivocab/actions/runs/44432400098)) 與 Cloudflare 部署 ([Run 44432400030](https://github.com/u8640012026/wutaivocab/actions/runs/44432400030)) 全數 `completed / success`（目前狀態：**系統與自動化檢核通過，111 年英語題組圖音逐題核對及實體 iPad／紙本列印驗收持續進行中**）。
    - **111 年度三～六年級國／英／數全 12 卷入庫與標準化 Skill 建立（2026-11-18～19，全館累計 49 卷 / 1,225 題）**：
      - **新年度作業標準 Skill**：已建立 [`.agents/skills/priori-exam-pipeline/SKILL.md`](.agents/skills/priori-exam-pipeline/SKILL.md)，將「素材盤點 → Chrome DirectWrite 切圖與 MP3 切音 → 三層資料與無劇透規範 → `screen_priori_content.mjs --strict --spot-check` 全檢 → 全站 E2E／CI 全綠交接」固化為標準流程，後續接手 110～108 年度直接依此 Skill 執行即可。
      - **資產與音檔管線 (`scripts/build_priori_111_g3_6_assets.mjs`)**：依 `PRIORI/歷屆篩選測驗/111` 原卷、紅字官方答案卷與英聽 MP3（含 `111 年 05 月` 官方 PDF 雙軌 `renderPdfPagesWithChrome` 轉圖切題），產出 **407 張 WebP**（`public/assets/priori/111/{math,chi,eng}-g{3..6}/`，其中 `math-g3/q15_fig.webp` 為極細純線條長方形框 `288x212 / 370 bytes` 已於契約與管線明列幾何例外）、**51 段官方英聽 96kbps Mono MP3**（`eng-g3/q01..q21.mp3` 共 21 段 ＋ `eng-g{4,5,6}/q01..q10.mp3` 共 30 段），並同步複製 **24 份 A3 原卷與解答 PDF** 至 `public/assets/priori/original/111-*-{student,answer}.pdf`，同時於 [`PrioriModals.jsx`](src/features/priori/PrioriModals.jsx) 將 `hasOriginal` 擴充包含 `111`。
      - **111 三英題型實卷結構與全 12 卷模組**：完成 [`priori111MathG3.js`](src/data/priori/priori111MathG3.js)–[`G6.js`](src/data/priori/priori111MathG6.js)、[`priori111ChineseG3.js`](src/data/priori/priori111ChineseG3.js)–[`G6.js`](src/data/priori/priori111ChineseG6.js)、[`priori111EnglishG3.js`](src/data/priori/priori111EnglishG3.js)–[`G6.js`](src/data/priori/priori111EnglishG6.js) 並於 [`src/data/priori/index.js`](src/data/priori/index.js) 註冊發布。特別依 111 年三年級英語實卷差異落實：`Q1–Q9` 字母大小寫聽寫 (`alphabet-pair` + MP3)、`Q10–Q13` 字母三選一聽辨 (+ MP3)、`Q14–Q16` 聽辨句子配三圖 (+ MP3)、`Q17–Q21` 語音 O/X 聽辨 (+ MP3)、`Q22–Q25` 字母大小寫認讀配對（無 MP3），共 21 段音檔；全 12 卷皆通過 [`scripts/test_priori_111_g3_6_contract.mjs`](scripts/test_priori_111_g3_6_contract.mjs) 與 CI 接入。
    - **110 年度三～六年級國／英／數全 12 卷入庫與自動化契約／防劇透檢核（2026-11-19，全館累計 61 卷 / 1,525 題）**：
      - **資產與音檔管線 (`scripts/build_priori_110_g3_6_assets.mjs`)**：依 `PRIORI/110篩選測驗` 原卷、答案卷與英聽 MP3 透過 `renderPdfPagesWithChrome` 轉圖切題，產出 **405 張 WebP**（`public/assets/priori/110/{math,chi,eng}-g{3..6}/`，其中 `math-g3/q22_fig.webp` 為極細純線條長方形框 `339x213 / 330 bytes` 已於契約與管線明列幾何例外）、**51 段官方英聽 96kbps Mono MP3**（`eng-g3/q01..q21.mp3` 共 21 段 ＋ `eng-g{4,5,6}/q01..q10.mp3` 共 30 段，含 `0.1s` fade-in/out），並同步複製 **24 份 A3 原卷與解答 PDF** 至 `public/assets/priori/original/110-*-{student,answer}.pdf`，同時於 [`PrioriModals.jsx`](src/features/priori/PrioriModals.jsx) 將 `hasOriginal` 擴充包含 `110`。
      - **110 三英實卷與全 12 卷模組**：完成 [`priori110MathG3.js`](src/data/priori/priori110MathG3.js)–[`G6.js`](src/data/priori/priori110MathG6.js)、[`priori110ChineseG3.js`](src/data/priori/priori110ChineseG3.js)–[`G6.js`](src/data/priori/priori110ChineseG6.js)、[`priori110EnglishG3.js`](src/data/priori/priori110EnglishG3.js)–[`G6.js`](src/data/priori/priori110EnglishG6.js) 並於 [`src/data/priori/index.js`](src/data/priori/index.js) 註冊發布。110 三英與 111 同為 `Q1–Q9` 大小寫聽寫 (`alphabet-pair`)、`Q10–Q13` 字母三選一、`Q14–Q16` 聽辨常用語配三圖、`Q17–Q21` 語音 O/X、`Q22–Q25` 大小寫紙筆認讀配對（無 MP3）；後續並依 [`docs/PRIORI_QA_PROGRESS.md`](docs/PRIORI_QA_PROGRESS.md) 完成 110 全年段 95 張 `_fig` 附圖及 300 題底端條碼擴大目視覆核，除 `b935f76` 修正之五數 Q3／五英 Q25 外，再以 `VERIFIED_QUESTION_FIGURES`／`VERIFIED_QUESTION_CROPS` + `_v2.webp` 防快取修正 7 題（三數 Q15、四數 Q18、五數 Q7／Q16、六數 Q11／Q14、三英 Q15）；全 12 卷通過 [`scripts/test_priori_110_g3_6_contract.mjs`](scripts/test_priori_110_g3_6_contract.mjs)、`screen_priori_content.mjs --strict --spot-check 110` 與 CI 接入（尚待 51 段音檔逐段聽核、全 300 題逐題人工核對原卷及實體 iPad／列印驗收）。
- **下一步建議（Stage 3 — 正式庫升級 v4 與擴充 108–109）**：Mark 已於 Supabase 執行 v3.1 完成唯一 1 筆舊紀錄 (`score: 92`) 安全搬移與清空 `leaderboard`；接著僅需在 Supabase SQL Editor 貼上執行最新 [`supabase_priori_security.sql`](supabase_priori_security.sql) 即可升級至 v4（原管理員密碼與 `priori_records` 資料皆完整保留），完成後再以 `node scripts/verify_priori_supabase_rls.mjs` 做只讀稽核即可；後續 **109～108 年度新對話框** 可直接啟用 `priori-exam-pipeline` Skill 依 `PRIORI/{109,108}篩選測驗` 建置。
