# 專案進度報告：無障礙設施檢舉平台 (Disability Report Platform)

## 1. 專案目標
本專案旨在建立一個眾包平台，讓使用者能回報公共設施的無障礙問題（如輪椅坡道受阻）。系統將回報資料結合地理資訊，視覺化呈現於 Google Maps 上。

## 2. 技術架構 (Tech Stack)

### 前端 (Frontend)
- **框架:** Vue 3 (Composition API + `<script setup>`)
- **語言:** TypeScript
- **UI 庫:** Vuetify 3 (Material Design)
- **狀態管理:** Pinia
- **路由:** Vue Router 4
- **地圖服務:** Google Maps API (JavaScript SDK)

### 後端 (Backend)
- **運行環境:** Node.js (Express)
- **模組規範:** ESM (ECMAScript Modules)
- **執行工具:** `tsx` (TypeScript Execution)
- **資料庫:** PostgreSQL (託管於 Supabase)
- **圖片儲存:** Supabase Storage (Bucket: `report-images`)
- **文件處理:** Multer (Memory Storage)

## 3. 目錄結構
```text
disability_report_platform/
├── server/                 # 後端專案
│   ├── src/
│   │   ├── index.ts        # API 主程式 (Express, Supabase SDK)
│   │   ├── db.ts           # PostgreSQL 連線池 (pg library)
│   │   └── test-db.ts      # 資料庫連線測試工具
│   ├── .env                # 環境變數 (DB 密鑰, Supabase URL)
│   ├── package.json        # 依賴與 tsx 腳本
│   └── schema.sql          # 資料庫資料表定義
├── src/                    # 前端專案
│   ├── components/         # 共用組件 (Layout, ImageUpload)
│   ├── views/              # 頁面 (MapView, ReportView)
│   ├── stores/             # Pinia Store (與後端同步)
│   ├── data/               # 靜態資料 (MRT 站點座標)
│   └── App.vue             # 入口組件
└── .env                    # 前端環境變數 (Google Maps API Key)
```

## 4. 當前開發進度 (Progress)

### 已完成功能
1.  **地圖檢視 (MapView):** 整合 Google Maps，能從後端讀取回報資料並渲染標記 (Markers)。點擊標記可查看詳情與圖片。
2.  **問題回報 (ReportView):** 完整的表單，包含 MRT 路線/站點選擇、地點說明、問題描述。
3.  **圖片上傳:** 自定義 `ImageUpload` 組件，支援相機/相簿選擇，並能預覽/刪除圖片。
4.  **後端 API:** 
    - `GET /api/reports`: 從 PostgreSQL 讀取所有回報。
    - `POST /api/reports`: 處理多圖上傳，將圖片存至 Supabase Storage，並將網址與資料存入 DB。
5.  **資料庫連線:** 已成功串接 Supabase 雲端 PostgreSQL，並處理好 ESM 與 TypeScript 的兼容性問題。

### 核心邏輯
- **混合模式:** 使用 `pg` 庫進行 SQL 操作以學習後端基礎，同時使用 `supabase-js` SDK 處理複雜的圖片儲存業務。
- **資料流:** 前端 `FormData` -> 後端 `Multer` -> `Supabase Storage` (存圖片) -> `SQL` (存網址) -> 回傳前端更新 `Pinia`。

## 5. 下次啟動建議 (Next Steps)
1.  **使用者回饋:** 加入 `v-snackbar` 或 `v-alert` 提示使用者提交成功或失敗。
2.  **地圖優化:** 當使用者點擊地圖標記時，自動縮放到該位置。
3.  **刪除功能:** 增加刪除回報的 API 與介面。
4.  **手機定位:** 整合 HTML5 Geolocation API，自動定位使用者目前位置而非僅限 MRT 站點。
5.  **部署:** 準備將後端部署至 Render 或 Fly.io 等平台。

---
*最後更新日期: 2026年5月30日*
