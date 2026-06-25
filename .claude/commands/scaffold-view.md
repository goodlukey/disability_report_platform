---
description: Scaffold a new Vue view + register its route in the router
argument-hint: <ViewName> <path> (e.g. "AdminView /admin")
---

Scaffold a new Vue view and register it. Arguments: `$ARGUMENTS`
Parse the first word as the component name (PascalCase) and the second as the route path.

## Steps

1. Create `src/views/<ViewName>.vue` with:
   - `<script setup lang="ts">` block (Composition API)
   - A `<template>` using `v-container` as the root (Vuetify convention)
   - A `<v-card>` with a title matching the view name
   - No placeholder comments — write real structural markup

2. Register the route in `src/router/index.ts`:
   - Add a lazy-loaded route: `{ path: '<path>', component: () => import('../views/<ViewName>.vue') }`

3. Add a navigation link in `src/components/layout/Sidebar.vue`:
   - Follow the existing link list style exactly

4. After creating everything, summarize: what file was created, what route was added, what sidebar entry was added.

## Conventions
- `<script setup lang="ts">` always first in the SFC
- Use Vuetify `v-*` components only — no raw HTML divs for layout
- MDI icons from `@mdi/font` (prepend-icon or append-icon props)
- No `<style scoped>` unless the view genuinely needs it
