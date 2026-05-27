# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite)
npm run build     # Type-check with vue-tsc, then build for production
npm run preview   # Preview the production build
```

There is no lint or test script configured.

## Architecture

**Disability Report Platform** (無障礙設施檢舉平台) — a Vue 3 web app for crowdsourcing reports of inaccessible public facilities. Users submit geotagged photos and descriptions; data is visualized on a Google Maps GIS interface.

### Tech Stack
- **Vue 3** with Composition API (`<script setup>`) + **TypeScript**
- **Vite** build tool
- **Vuetify 3** (Material Design, mobile-first) — use `v-*` components; MDI icons via `@mdi/font`
- **Vue Router 4** — routes defined in `src/router/index.ts`
- **Pinia** — store in `src/stores/reportStore.ts`

### Layout
`App.vue` uses Vuetify's standard layout: `v-app-bar` (top) + `v-navigation-drawer` (collapsible sidebar) + `v-main` wrapping `<router-view>`.

Layout components live in `src/components/layout/` (`Topbar.vue`, `Sidebar.vue`).

### Core Views
| Route | File | Purpose |
|-------|------|---------|
| `/map` | `src/views/MapView.vue` | Full-screen Google Maps; renders markers from store; marker click shows photo + description popup |
| `/report` | `src/views/ReportView.vue` | Submission form: image upload, HTML5 Geolocation button (auto-fills lat/lng), location text input, issue description textarea |

### Key Component
`src/components/report/ImageUpload.vue` — handles camera capture or gallery selection for the report form.

### Directory Structure (follow exactly)
```
src/
├── assets/
├── components/
│   ├── layout/
│   │   ├── Sidebar.vue
│   │   └── Topbar.vue
│   └── report/
│       └── ImageUpload.vue
├── views/
│   ├── MapView.vue
│   └── ReportView.vue
├── router/
│   └── index.ts
├── stores/
│   └── reportStore.ts
├── App.vue
└── main.ts
```
