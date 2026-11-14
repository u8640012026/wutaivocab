# 霧臺國小英語自主學習宇宙 (WutaiVocab 2.0) — 單一現況交接總手冊

> **最後整理**：2026-11-13（SAA 113–115 正式結案：`9b425e2` ＋ 課本 1,989 題 ＋ 學習扶助篩選測驗 `PRIORI` 交接規格導入）  
> **正式環境**：[https://wutaivocab.pages.dev](https://wutaivocab.pages.dev)（Cloudflare Pages 綁定 `origin/main`）  
> **Supabase**：帳號 `liguyt@wutps.ptc.edu.tw`｜Project ID `fqkdkmcqjswufzbvkram`｜[後台](https://supabase.com/dashboard/project/fqkdkmcqjswufzbvkram)

---

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
| **2. 英語單字冒險館**<br>(`Lobby` ＋ **14 款遊戲**) | `src/components/Lobby.jsx`<br>`src/games/{spotter,escape,maze,memory,mole,swipe,meteor,snake,quiz,spelling,handwriting,battle}/` | • **5×2 一頁式整備室與榮譽榜門檻 (`qualifyingBook`)**：一二年級採 `abc` 字母（可切換 `upper`/`lower`/`mixed` 膠囊）；三～六年級需**同冊且（$\ge 20$ 字 或 $\ge 2$ 單元）**方具上榜資格。<br>• **探索解謎**：**密室逃脫**（四大秘境進度即開、複合詞膠囊、秒數鎖定）、**鷹眼神探**（低年級 6 取 3 圓形托盤；中高年級 8 取 5 補丁；放大鏡連按 5 下或 `?view=spotter-test` 進測試工作台）、**字母巡航迷宮**（方向鍵/觸控收集字母）、**星際記憶翻牌**（9 組單字＋2 張神卡共 20 張、全場 8 秒同步流光、`PowerUpCodexModal` 3D 轉盤圖鑑、依全站 `isDark` 自動切換日之章/夜之章卡背）。<br>• **反應競技**：**打地鼠**（60 秒倒數、10 秒未答扣 1 心連擊歸零、3 心歸零結算）、**極速滑卡**（180ms 防抖）、**3D 隕石防衛戰**（`IcosahedronGeometry`＋GLSL 熔岩/大氣著色器、攝影機 `z: 27`、每 50 分得 1 層單一呼吸光罩最多顯示 5 層＋`soundEngine.powerUp()`）、**貪食蛇**（日/夜雙景、330/235/205ms、樣條骨骼 + `inputQueueRef`）。<br>• **基礎測驗與對戰**：**中英速辨 / 英語聽力** (`StandardQuiz`)、**單字積木拼裝** (`SpellingGame` `parsePhrase` 複合詞分組)、**神筆筆順書寫** (`HandwritingGame` 四線三格＋彈性筆順幾何判定)、**多人連線對戰** (`BattleGame` 三間固定擂台 PIN `1001~1003`、每房最多 4 人、`EmergencyRaidMeteor` 突襲限 1 顆飛行 + 1 顆排隊＋1.5 秒冷卻＋落點左翼 18%～30%)。 |
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

| 項目 | 狀態 | 備註 / 下一步 |
| :--- | :---: | :--- |
| **檢定館四軌響應式、易錯題、打地鼠/貪食蛇優化 (`d07d91e`)** | ✅ **已上線** | 正式站已具備四軌整合設定頁與自適應錯題流程 |
| **課本題庫 Canonical 擴充 (Batches A～D)** | ✅ **1,989 題在線** | Book 1～8 全冊各 +50 題高規擴充完成（Book 7: 178 題、Book 8: 176 題），全冊皆 ≥ 100 獨立 Canonical 題 |
| **Pre-A1 官方模擬題庫** | ✅ **300 題在線** | 含 30 題正式卷藍圖與專項特訓 |
| **SAA 113 年官方卷** | ✅ **105 題 + 45 音檔上線** | `scripts/test_saa_113_contract.mjs` 全過 |
| **SAA 114 年官方卷 — P0 圖片與契約鎖定** | ✅ **已上線 (`c44e60d`)** | 144 張選項圖依獨立座標裁切完成、`optionAltTexts` 與 G4 Q20 (`50/25/15/5`) 校準鎖定，105 題標準答案與 Sharp 門禁通過 `test_saa_114_contract.mjs` 與 114 E2E |
| **SAA 114 年官方卷 — P0 實體音檔** | ✅ **已上線 (`cee0282`)** | 已依 `SAA/114/{4,5,6}` 官方英聽 MP3 完成 FFmpeg 波形時間戳校準（`TIMESTAMPS_CALIBRATED = true`），產出 45 個 `96kbps Mono` + `0.1s` fade 小檔至 `public/audio/saa/114/` 並寫入 `media.audioSrc` |
| **SAA 115 年官方卷** | ✅ **105 題 + 148 選項圖 + 45 音檔結案 (`9b425e2`)** | 已通過 GPT 複檢結案（暫停 SAA 開發）。兩項非阻擋 P2 待日後順手優化：`G6 Q3 (C)/(D)` 下緣略緊、將 `0.5%` 相似度門禁改回「全局 `1%`＋明確數字題例外清單」＋保留官方音檔人工抽聽紀錄 |
| **學習扶助篩選測驗 (`PRIORI` — 獨立「學習扶助練習館」)** | ✅ **Stage 1 + Route 1 官方三科 ＋ 極簡大廳／派卷 QR／班級矩陣與加密名冊版完成 (`100 題 / 4 卷`)** | 首頁增獨立「學習扶助練習館 (`?view=priori`，`lime` 黃綠色視覺區隔；英語教科書改 `wood` 棕)」入口，收錄 **114 年三年級 國／英／數（各 25 題，對齊官方標準答案＋25 題英語官方 MP3）** 與 **115 年三年級數學（25 題教師參考）**，共 4 卷 100 題、121 張 WebP 與 25 個 MP3。學生大廳極簡化為「科目 × 年級 × 115–108 緊湊條列」（純圖示列印、已練才顯示分科錯題沉底特訓）；支援「派卷 QR」（教師自選 `科目 × 年度 × 年級` 產出 `&entry=qr` 掃碼確認頁，顯示目前身分＋試卷＋進入測驗按鈕）；教師後台改「年級／班級座號升冪成績矩陣」為首頁（支援 `依年度看三科` 與 `依科目看歷年 115–108`、未作答顯示 `-`、點分數進單生逐題計算紙回放＋全班單題診斷），密碼驗證改加鹽 SHA-256 雜湊比對 (`prioriSecurity.js`) 並內建 `PrioriRosterModal`（相容 `classqna` JSON／CSV／Excel 貼上，預設中間字 `O` 去識別化＋Web Crypto PBKDF2/AES-256-GCM 加密存於隔離 `mode='priori-roster', week=0`，絕不入 Git 或觸碰金幣積分）。驗證：`npm run lint`、`test_priori_115_math_g3_contract.mjs`、`test_priori_114_g3_contract.mjs`、`verify_priori_e2e.mjs` 與 6 階段 `smoke_test.mjs` 全過。 |
| **檢定館教師派發與列印** | 📝 **已定案待排程** | 未來於 `TeacherHub.jsx` 增「一鍵派發連結／QR Code」（學生掃碼直進第 0 頁說明）、結果頁重練捷徑與瀏覽器原生 `@media print` 學習單（不做 `.docx` 產生器） |
| **全站師生使用手冊** | ⏳ **待結案整理** | 未來完成全案後以第三節模組總覽產出對外操作說明書 |

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

# 3. 完整 ESLint、建置與 6 階段無頭 Chrome 回歸測試 (推送前必跑)
npm run lint ; if ($LASTEXITCODE -eq 0) { npm run build } ; if ($LASTEXITCODE -eq 0) { node scripts/smoke_test.mjs }
```

- **管理者快捷通道**：鍵盤 `Ctrl+Shift+A`／`Ctrl+Alt+T`，或 ErrorBoundary ⚠️ 圖示連點 5 下，教師密碼 `wt7902230`。
- **隱藏測試頁路由**：`?view=spotter-test`（放大鏡連按 5 下）、`?view=preloader-showcase`、`?view=zoom-showcase`。

---

## 七、 學習扶助篩選測驗 (`PRIORI`) Stage 0 盤點與新對話交接規格

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
  - **獨立教師診斷後台 (`?view=priori&tab=teacher`，密碼 `wt7902230`)**：可切年度／科目／年級／班級與示範班級開關；「各題答題情況與單題計算紙」可看 25 題答對率、精熟率、4 選項誘答人數並點開單題全班學生手寫計算紙；「各生作答與精熟明細」可點閱個別學生初測→最新進步分數與各題筆跡回放。
- **後續擴充進度 — Route 1（114 年三年級 國／英／數完整官方三科 ＋ 分科錯題沉底特訓）已完成**：
  - **資產與音檔管線 (`scripts/build_priori_114_g3_assets.mjs`)**：依 K-12EA 114 年三年級空白試卷與紅字標準答案卷產生 **90 張 WebP 圖資**（數學 34 張含 9 張獨立圖形 `q01/02/07/08/11/12/19/20/25_fig`、國語 27 張含 2 篇題組原卷圖 `passage_20_22`/`passage_23_25`、英語 29 張含 `q22..25_fig`），並用 FFmpeg 將 `PRIORI/114篩選測驗/114年篩選測驗英語科3年級試卷聽力檔.mp3` 依 95 段靜音邊界精確切分為 **25 個官方題音檔 (`public/audio/priori/114/eng-g3/q01.mp3`–`q25.mp3`，每題 7.2s–12.7s)**。
  - **三科官方題庫與專屬題型 UI (`officialAnswerVerified: true, answerSource: 'official_pdf'`)**：
    - [`src/data/priori/priori114MathG3.js`](src/data/priori/priori114MathG3.js)（25 題四選一）、[`src/data/priori/priori114ChineseG3.js`](src/data/priori/priori114ChineseG3.js)（19 單題＋2 組共 6 題左文右題閱讀理解）、[`src/data/priori/priori114EnglishG3.js`](src/data/priori/priori114EnglishG3.js)（Q1–15 `alphabet-pair` 聽音大小寫寫入 [`PrioriAlphabetPad.jsx`](src/features/priori/PrioriAlphabetPad.jsx) 四線格、Q16–21 `O/X` 2 選、Q22–25 聽辨對話 3 圖選＋官方 MP3 慢/原速切換）與統一索引 [`src/data/priori/index.js`](src/data/priori/index.js)（4 卷 100 題）。
  - **分科隔離錯題沉底引擎與教師後台擴充**：
    - [`prioriStorage.js`](src/features/priori/prioriStorage.js) 新增 `getSubjectRemedialPool`、`recordPrioriSubjectDrillAttempt` 與英語大小寫寬鬆解析比對 (`parseAlphabetPairAnswer` / `isPrioriAnswerCorrect`)；[`PrioriPracticeHub.jsx`](src/features/priori/PrioriPracticeHub.jsx) 於各科分頁建置嚴格分流不混科之「**錯題沉底特訓專區**」（答錯即時提示並排至題組隊尾重作、連對 2 次升級「🌟 已精熟」），[`PrioriTeacherDashboard.jsx`](src/features/priori/PrioriTeacherDashboard.jsx) 支援 `114`/`115` 雙年度切換、三科班級統計與英語「常見誤寫」字對剖析。
  - **圖資與列印品質修正**：
    - `115-math-g3` Q11 (`q11_fig.webp`) 裁切座標擴大上緣高度（`top: 3022, height: 268`）確保雙圓頂部完整無切邊；`114-math-g3` Q1 (`q01_fig.webp`) 精準裁至純圖形規律列（`height: 64`）並精簡 `questionText` 消除題圖與文字重複。
    - 列印分流 (`PrioriModals.jsx` `PrioriPrintableSheet`)：外部學生學習單列印（`showAnswerKey={false}`）徹底隱藏「作答／正解」；僅於密碼 `wt7902230` 之獨立教師診斷後台提供「列印解答卷（含正解）」（`showAnswerKey={true}`）。
  - **英語四線格標示與雲端同步可視化（GPT 審查跟進）**：
    - 移除 `PrioriModals.jsx` 列印空格處會觸發 ESLint `no-irregular-whitespace` 的全形空白改用 CSS 寬度，解除 Cloudflare Pages CI 部署阻塞；[`PrioriAlphabetPad.jsx`](src/features/priori/PrioriAlphabetPad.jsx) 補上「字元輸入辨識與紙筆字形／四線格位置人工批閱差異」提示；[`prioriStorage.js`](src/features/priori/prioriStorage.js) 補齊 Supabase `.select/.update/.insert` `{ error }` 檢查並在 [`PrioriPracticeHub.jsx`](src/features/priori/PrioriPracticeHub.jsx) 與 [`PrioriTeacherDashboard.jsx`](src/features/priori/PrioriTeacherDashboard.jsx) 顯性呈現雲端同步錯誤；同步更新 [`supabase_schema.sql`](supabase_schema.sql) `chk_leaderboard_week`（`week >= 0 AND week <= 53`）對齊隔離通道設計。
  - **視覺區隔、極簡大廳、派卷 QR 與教師班級矩陣＋去識別化加密名冊**：
    - **首頁卡片分色**：[`Button3D.jsx`](src/components/ui/Button3D.jsx) 新增 `lime`（黃綠）變體用於「學習扶助練習館」（在深靛藍與深紫間清楚跳色），[`Portal.jsx`](src/components/Portal.jsx) 將「自編英語電子教科書」調整為 `wood` 暖棕色，徹底避開森林綠／天藍重複視覺。
    - **學生大廳極簡化與派卷 QR (`PrioriPracticeHub.jsx` / `PrioriModals.jsx`)**：移除冗餘文字說明，保留「科目 × 年級」切換與 **115→108 降冪緊湊橫條**（年分、精熟狀態、純圖示印表機鈕、`開始測驗／再練一次`），僅在該科有已作答紀錄時顯示錯題沉底特訓橫幅；「派卷 QR」彈窗支援教師自選 `科目 × 年度 × 年級` 產生 `?view=priori&paper=<paperId>&entry=qr`，學生掃碼後進入乾淨確認頁（顯示「目前身分 ＋ 切換座號」、「要做的試卷」與主按鈕「進入測驗」）。
    - **班級優先教師矩陣與前端去識別化加密名冊 (`PrioriTeacherDashboard.jsx` / `PrioriRosterModal.jsx` / `prioriSecurity.js`)**：教師密碼採加鹽 SHA-256 雜湊驗證 (`prioriSecurity.js`) 移除前端明文密碼比對；預設為「班級座號升冪總覽矩陣」（支援「依年度看國／數／英」與「依科目看歷年 115–108」、未作答以 `-` 顯示、點分數格直接進個人逐題與計算紙筆跡回放＋全班「單題診斷」分頁）；因 `wutaivocab` 正式庫 (`fqkdkmcqjswufzbvkram`) 原先未建校內名冊表（校內名冊原存於 `classqna`/`wutpsdata` 另庫），新增 `PrioriRosterModal` 支援匯入 `classqna` JSON／CSV／Excel，預設以中間字 `O` 去識別化（如 `王小明 → 王O明`）並經 Web Crypto `PBKDF2` + `AES-256-GCM` 加密後存於隔離通道 `leaderboard (mode='priori-roster', week=0)` 與教師端 `localStorage`，明文與真實全名絕不進入 Git 與 Cloudflare 靜態資源。
  - **驗證**：[`scripts/test_priori_114_g3_contract.mjs`](scripts/test_priori_114_g3_contract.mjs)、[`scripts/test_priori_115_math_g3_contract.mjs`](scripts/test_priori_115_math_g3_contract.mjs)、[`tmp/verify_priori_e2e.mjs`](tmp/verify_priori_e2e.mjs)、`npm run lint`、`npm run build` 與 6 階段 `scripts/smoke_test.mjs` 全部通過。
- **下一步建議（Stage 3）**：比照本規格向上延伸 114 年（或 115 年官方公告後）四～六年級國／英／數試卷，並預留公開授權確認與正式版佈署。
