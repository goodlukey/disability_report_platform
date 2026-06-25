# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend
```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Type-check with vue-tsc, then build for production
npm run preview   # Preview the production build
```

### Backend
```bash
cd server && npm run dev   # Start Express server with tsx watch (http://localhost:3000)
cd server && npm run build # Compile TypeScript
```

There is no lint or test script configured.

## Architecture

**Disability Report Platform** (無障礙設施檢舉平台) — crowdsourced reporting of inaccessible public facilities.  
Users submit geotagged photos; data is visualized on a Google Maps GIS interface.

### Frontend Tech Stack
- **Vue 3** + Composition API (`<script setup>`) + **TypeScript**
- **Vite** build tool
- **Vuetify 3** (Material Design, mobile-first) — use `v-*` components; MDI icons via `@mdi/font`
- **Vue Router 4** — routes in `src/router/index.ts`
- **Pinia** — store in `src/stores/reportStore.ts`

### Backend Tech Stack
- **Node.js + Express** (ESM modules, `tsx` for execution)
- **PostgreSQL** hosted on **Supabase** — connection pool via `server/src/db.ts`
- **Supabase Storage** — bucket `report-images`, SDK in `server/src/supabase.ts`
- **TDX API** (Transport Data eXchange) — MRT lines/stations, auth + fetch in `server/src/tdx.ts`; 24h in-memory cache
- **Multer** — memory storage for image uploads (max 3 files)

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reports` | Fetch all reports (ordered by created_at DESC) |
| POST | `/api/reports` | Submit new report (multipart/form-data with images) |
| GET | `/api/mrt-lines` | Return all MRT lines + station coords from TDX (cached) |

### POST /api/reports — FormData Fields
`line`, `station`, `lat`, `lng`, `locationDescription`, `issueDescription`, `images[]` (up to 3 files)

### Database Schema (PostgreSQL)
```sql
reports (
  id                SERIAL PRIMARY KEY,
  line              TEXT,
  station           TEXT,
  lat               NUMERIC,
  lng               NUMERIC,
  location_description TEXT,
  issue_description TEXT,
  image_urls        TEXT[],
  created_at        TIMESTAMPTZ DEFAULT NOW()
)
```

### Environment Variables
**Frontend** (`.env`): `VITE_GOOGLE_MAPS_API_KEY`  
**Backend** (`server/.env`): `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `TDX_CLIENT_ID`, `TDX_CLIENT_SECRET`, `PORT`

### Layout
`App.vue`: `v-app-bar` (top) + `v-navigation-drawer` (collapsible sidebar) + `v-main` → `<router-view>`  
Layout components: `src/components/layout/Topbar.vue`, `src/components/layout/Sidebar.vue`

### Core Views
| Route | File | Purpose |
|-------|------|---------|
| `/map` | `src/views/MapView.vue` | Full-screen Google Maps; SVG markers grouped by station; click opens bottom sheet with reports |
| `/report` | `src/views/ReportView.vue` | Form: MRT line/station select (auto-fills lat/lng from TDX), location text, issue textarea, image upload |

### Core Usage — Per Page

#### `/map` — MapView.vue
**User goal:** Browse all reported accessibility issues on a map.
- On load: fetches all reports (`GET /api/reports`) and all MRT lines (`GET /api/mrt-lines`)
- Reports are grouped by station; each group renders as a single SVG circle marker showing the report count
- Clicking a marker: `map.panTo()` to that station, opens a `v-bottom-sheet` listing all reports for that station as cards (thumbnail + location + issue excerpt + date)
- Clicking a Google Maps POI near a station (no custom marker): intercepts the click, finds the nearest MRT station within ~300m, opens the bottom sheet with 0 reports and a "回報此站問題" CTA button
- "回報此站問題" button: closes sheet, navigates to `/report`
- Markers re-render reactively when `store.reports.length` changes

#### `/report` — ReportView.vue
**User goal:** Submit a new accessibility issue report.
- On load: fetches MRT lines from `GET /api/mrt-lines` to populate the line dropdown
- Form fields: line (select) → station (select, filtered by line) → location description (text) → issue description (textarea) → images (1–3 files via `ImageUpload.vue`)
- Selecting a station auto-records its lat/lng from TDX data — no manual coordinate entry
- Submit disabled until: line + station + locationDescription + issueDescription + ≥1 image are all filled
- On submit: POSTs `multipart/form-data` to `POST /api/reports`; shows green snackbar on success then redirects to `/map` after 1.2s; shows persistent red snackbar on failure
- Image upload: `ImageUpload.vue` handles camera capture or gallery selection, `v-model: File[]`

### Key Components & Files
- `src/components/report/ImageUpload.vue` — camera capture / gallery selection, v-model: `File[]`
- `src/stores/reportStore.ts` — Pinia store; `fetchReports()` hits GET /api/reports; `addReport(formData)` hits POST
- `server/src/tdx.ts` — Client Credentials OAuth flow for TDX; cached response reused for 24h

### Directory Structure (follow exactly)
```
disability_report_platform/
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── reports.ts
│   │   │   └── mrtLines.ts
│   │   ├── index.ts
│   │   ├── db.ts
│   │   ├── supabase.ts
│   │   └── tdx.ts
│   ├── .env
│   ├── package.json
│   └── schema.sql
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.vue
│   │   │   └── Topbar.vue
│   │   └── report/
│   │       └── ImageUpload.vue
│   ├── views/
│   │   ├── MapView.vue
│   │   └── ReportView.vue
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   └── reportStore.ts
│   ├── App.vue
│   └── main.ts
└── CLAUDE.md
```
