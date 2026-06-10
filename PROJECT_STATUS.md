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
- **外部 API:** TDX (Transport Data eXchange) API - 用於獲取捷運線路與車站即時座標
- **圖片儲存:** Supabase Storage (Bucket: `report-images`)
- **文件處理:** Multer (Memory Storage)

## 3. 目錄結構
```text
disability_report_platform/
├── server/                 # 後端專案
│   ├── src/
│   │   ├── routes/         # API 路由模組
│   │   │   ├── reports.ts  # 回報相關 API
│   │   │   └── mrtLines.ts # 捷運資料 API (TDX 串接)
│   │   ├── index.ts        # 入口程式
│   │   ├── db.ts           # PostgreSQL 連線池
│   │   ├── supabase.ts     # Supabase SDK 初始化
│   │   ├── tdx.ts          # TDX API 整合工具 (Auth & Fetch)
│   │   └── test-db.ts      # 資料庫連線測試工具
│   ├── .env                # 環境變數 (DB, Supabase, TDX)
│   ├── package.json
│   └── schema.sql
├── src/                    # 前端專案
│   ├── components/
│   ├── views/
│   │   ├── MapView.vue     # 地圖視覺化頁面
│   │   └── ReportView.vue  # 回報表單頁面 (動態載入車站)
│   ├── stores/
│   ├── App.vue
│   └── ...
└── .env                    # 前端環境變數 (Google Maps API Key)
```

## 4. 當前開發進度 (Progress)

### 已完成功能
1.  **後端架構重構:** 將 API 拆分為路由模組，提升維護性；抽象化 Supabase 與 TDX 服務邏輯。
2.  **TDX API 整合:** 成功對接交通部 TDX 平台，能動態獲取台北捷運所有路線與站點座標，取代原本的靜態 JSON。
3.  **動態表單:** `ReportView` 會根據後端提供的 TDX 資料生成選項，並在選擇站點時自動記錄精確的經緯度。
4.  **地圖檢視優化:** 標記顯示更詳細的資訊（路線 + 站名），並統一後端傳回的經緯度格式 (Float)。
5.  **圖片上傳與儲存:** 支援多圖上傳至 Supabase Storage 並將網址存回資料庫。

### 核心邏輯
- **資料獲取:** 後端串接 TDX (Client Credentials 流) -> 快取機制 (24h) -> 前端 Fetch。
- **資料流:** 前端選擇車站 (取得經緯度) -> 提交 FormData -> 後端上傳圖片至 Supabase -> 寫入 PostgreSQL -> 地圖端即時更新。

## 5. 下次啟動建議 (Next Steps)
1.  **使用者回饋:** 加入 `v-snackbar` 提示提交狀態。
2.  **地圖功能增強:** 點擊清單中的車站後，地圖自動平移 (Pan) 且縮放 (Zoom)。
3.  **定位功能:** 整合 Geolocation API，讓使用者能回報非捷運站點的周邊問題。
4.  **後台管理:** 實作管理介面以進行回報的審核或刪除。

---
*最後更新日期: 2026年5月31日*
