---
description: Scaffold a new Express API route module and register it in server/src/index.ts
argument-hint: <route-name> (e.g. "comments", "admin")
---

Create a new Express route module for `$ARGUMENTS`.

## Steps

1. Create `server/src/routes/$ARGUMENTS.ts` following this exact pattern:
   - Import `Router` from express
   - Import `pool` from `../db.js`
   - Export a default `router`
   - Add at minimum a `GET /` handler that queries PostgreSQL and returns JSON
   - Map DB column names (snake_case) to camelCase in the response — same style as `server/src/routes/reports.ts`

2. Register the new router in `server/src/index.ts`:
   - Add import: `import $ARGUMENTSRouter from './routes/$ARGUMENTS.js'`
   - Add `app.use('/api/$ARGUMENTS', $ARGUMENTSRouter)` after the existing routes

3. After creating the files, show the user the new API endpoint URL and the curl command to test it.

## Conventions
- ESM imports (use `.js` extension on local imports)
- All errors caught with try/catch; return `res.status(500).json({ error: 'Internal server error' })`
- No inline SQL strings longer than 5 lines — extract to a `const query = \`...\`` variable
