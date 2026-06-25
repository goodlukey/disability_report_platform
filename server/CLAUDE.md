# server/CLAUDE.md

Backend-specific rules for the Express API (`server/`). Applies alongside the root `CLAUDE.md`.

## Commands
```bash
npm run dev    # tsx watch src/index.ts — hot-reload on save (http://localhost:3000)
npm run build  # tsc compile to dist/
```

## Module System
- **ESM only** — `"type": "module"` in package.json
- All local imports **must** use `.js` extension, even for `.ts` source files:
  ```ts
  import pool from '../db.js'      // ✅
  import pool from '../db'         // ❌ will crash at runtime
  ```

## Adding a New Route
1. Create `src/routes/<name>.ts` — export a default `Router`
2. Register in `src/index.ts`: `app.use('/api/<name>', router)`
3. Pattern to follow: `src/routes/reports.ts`

## Route Conventions
- Every handler must be wrapped in `try/catch`
- On error: `res.status(500).json({ error: 'Internal server error' })` — never leak stack traces
- DB column names are `snake_case`; map to `camelCase` before sending JSON responses
- Extract SQL longer than 3 lines into a `const query = \`...\`` variable above the handler

## Database (`src/db.ts`)
- Uses `pg` Pool with SSL (`rejectUnauthorized: false`) — required for Supabase
- Always use parameterized queries (`$1, $2, ...`) — never string-interpolate user input into SQL
- Pool is a singleton — import and use directly, never create a new Pool

## Supabase Storage (`src/supabase.ts`)
- Bucket: `report-images`, path pattern: `reports/<timestamp>-<random>.<ext>`
- Upload via `supabase.storage.from('report-images').upload(path, buffer, { contentType })`
- Get public URL via `.getPublicUrl(path)` immediately after upload
- On upload error, throw — do not insert the DB row if any image fails

## File Uploads (Multer)
- Memory storage only — `multer({ storage: multer.memoryStorage() })`
- Max 3 files per request: `upload.array('images', 3)`
- Access files as `req.files as Express.Multer.File[]`

## TDX API (`src/tdx.ts`)
- Client Credentials OAuth flow — token is fetched and cached automatically
- Full MRT data is cached in-memory for **24 hours** — do not add per-request fetches
- Call `getMrtLines()` to get all lines + stations with coordinates

## Environment Variables
All read from `server/.env` via `dotenv.config()` in each entry file:

| Variable | Used in |
|----------|---------|
| `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT` | `src/db.ts` |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | `src/supabase.ts` |
| `TDX_CLIENT_ID`, `TDX_CLIENT_SECRET` | `src/tdx.ts` |
| `PORT` | `src/index.ts` (default: 3000) |

Never hardcode credentials. Never commit `.env`.
