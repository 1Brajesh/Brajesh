# Speeches Website Notes

Local context note for sessions started in `brajesh/speeches/`.

## What This Folder Is

- This folder is the speeches website inside the broader `brajesh` static-site repo.
- Production entrypoint in this folder: `index.html`
- As of 2026-05-07, the old local mockups and test files (`index2-9.html`, `mockup*.js`, `mock-speeches.js`) were removed.

## Main Files

- `index.html`
  - speech manager page shell, styles, and DOM structure
- `../assets/js/brajesh-speeches.js`
  - real speeches app logic
- `../assets/js/brajesh-auth.js`
  - shared Supabase magic-link auth helper
- `../supabase/20260506143000_add_brajesh_speeches.sql`
  - speeches schema, triggers, indexes, and RLS

## Stack

- Plain HTML, CSS, and JavaScript
- No build step
- No package manifest
- No automated test suite
- Backend/auth uses Supabase

## Deployment

- This speeches site ships as part of the main `brajesh` repo.
- Default expectation for live-facing speeches changes:
  - commit the change
  - push `main`
  - let GitHub Pages publish it
- Only keep changes local when explicitly asked.

## Access Model

- This page is private.
- Login is via Supabase email magic links.
- Admin access is checked against `brajesh_admins` through `public.is_brajesh_admin()`.

## Data Model

- `brajesh_speeches`
  - parent speech record
  - title, status, goal, core idea, tags, notes, active version
- `brajesh_speech_versions`
  - one speech can have many versions
  - full script, revision note, target minutes, rehearsal bullets
- `brajesh_speech_runs`
  - delivered instances / run history
  - date, venue, version used, feedback, evaluator notes, next actions

## Main UI Areas

- library with search and status filters
- overview tab
- versions tab
- runs tab
- fullscreen rehearsal mode

## Important Behavior

- Creating a new speech also creates its first version.
- Saving a version updates the speech's `active_version_id`.
- Logging a run usually moves the speech to `delivered`, except when:
  - the speech is still `idea`
  - the run result is `scheduled`
- Rehearsal mode shows one bullet at a time.
- Rehearsal navigation:
  - click/tap or `Space` / right arrow = next
  - left arrow = previous
  - `Escape` = exit

## Useful Starting Point

When starting work from this folder, read:

1. `README.md`
2. `index.html`
3. `../assets/js/brajesh-speeches.js`
4. `../supabase/20260506143000_add_brajesh_speeches.sql`

There is also broader repo memory in `/Volumes/T7/kritika4/.codex/memories/brajesh-codebase.md`, but this local file is the fastest place to rehydrate speeches-specific context.
