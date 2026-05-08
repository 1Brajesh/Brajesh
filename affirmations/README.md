# Affirmations Website Notes

Local context note for sessions started in `brajesh/affirmations/`.

## What This Folder Is

- This folder is the affirmations website inside the broader `brajesh` static-site repo.
- Production entrypoint in this folder: `index.html`
- This folder is not fully self-contained:
  - page shell and styles live here
  - real logic lives in `../assets/js/brajesh-affirmations.js`
  - shared auth lives in `../assets/js/brajesh-auth.js`

## Main Files

- `index.html`
  - affirmations page shell, styles, display-mode DOM, and module script include
- `README.md`
  - local rehydration notes for this slice of the repo
- `import-template.csv`
  - starter CSV for bulk import
- `../assets/js/brajesh-affirmations.js`
  - real affirmations app logic
- `../assets/js/brajesh-auth.js`
  - shared Supabase magic-link auth helper
- `../supabase/20260504123000_add_brajesh_affirmations.sql`
  - affirmations schema, normalization helpers, indexes, and RLS

## Stack

- Plain HTML, CSS, and JavaScript
- No build step
- No package manifest
- No automated test suite
- Backend/auth uses Supabase

## Deployment

- This affirmations site ships as part of the main `brajesh` repo.
- Default expectation for live-facing affirmations changes:
  - commit the change
  - push `main`
  - let GitHub Pages publish it
- Only keep changes local when explicitly asked.

## Access Model

- This page is private.
- Login is via Supabase email magic links.
- Admin access is checked against `brajesh_admins` through `public.is_brajesh_admin()`.
- Current login flow redirects back to `/affirmations/`.
- If this app is ever split to `affirmations.brajesh.com`, the redirect target and Supabase allowed redirect URLs will need to change.

## Data Model

- Table: `public.brajesh_affirmations`
- Main columns:
  - `id`
  - `theme`
  - `body`
  - `body_normalized`
  - `created_at`
  - `updated_at`
- DB uniqueness:
  - unique index on `(theme, body_normalized)`
- RLS:
  - admin-only select/insert/update/delete

## Main UI Areas

- magic-link login panel
- display setup with theme pills
- add/edit form
- CSV import/export tools
- affirmation library
- fullscreen display mode

## Important Behavior

- Built-in reserved theme:
  - `long`
- `Random` display excludes `long`.
- Duplicate prevention uses normalized `theme + body`.
- CSV import accepts `affirmation,theme` or matching header synonyms.
- `long` affirmations split by authored line breaks and play one line at a time.
- Fullscreen order is shuffled once when display mode opens, then kept stable for the rest of the session.

## Fullscreen Navigation

- Right-side tap/click:
  - next affirmation
- Left-side tap/click:
  - previous affirmation
- Keyboard:
  - `Space`, `ArrowRight`, `ArrowDown` = next
  - `ArrowLeft`, `ArrowUp` = previous
  - `Escape` = exit
- `long` behavior:
  - forward steps line by line before advancing to the next affirmation
  - backward steps line by line before moving to the previous affirmation
  - mobile swipe left skips the rest of the current `long`
  - desktop skip button and `N` also skip the current `long`

## Visual Drift

- As of 2026-05-08, fullscreen mode applies one curated random skin per session.
- Each skin can change:
  - font stack
  - text color
  - accent color
  - subtle corner/background SVG motifs
- Current motif set includes:
  - sun
  - flower
  - leaf
  - wave
  - star
  - ribbon / dance-like mark
- Keep this subtle. The text remains the priority.

## Fragile Areas

- Fullscreen text fitting is historically fragile, especially on iPhone Safari.
- The current fitting logic uses delayed `requestAnimationFrame` sizing and should be treated carefully.
- Any fullscreen layout, font, or padding change should be tested with:
  - short affirmations
  - long affirmations
  - phone-sized viewport
  - desktop fullscreen

## Cache Note

- Important: when affirmations UI changes appear not to register after deploy, check for stale cached JS.
- The page currently cache-busts the module URL in `affirmations/index.html`:
  - `../assets/js/brajesh-affirmations.js?v=20260508c`
- If future JS changes appear missing in production, bump that query-string version.

## Local Cautions

- There is an untracked file in this folder:
  - `resend-key.txt`
- Treat it as sensitive and never commit it.

## Useful Starting Point

When starting work from this folder, read:

1. `README.md`
2. `index.html`
3. `../assets/js/brajesh-affirmations.js`
4. `../assets/js/brajesh-auth.js`
5. `../supabase/20260504123000_add_brajesh_affirmations.sql`

There is also broader repo memory in `/Volumes/T7/kritika4/.codex/memories/brajesh-codebase.md`, but this local file is the fastest place to rehydrate affirmations-specific context.
