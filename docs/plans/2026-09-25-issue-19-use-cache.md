# Issue #19 Phase 2 — `use cache` the feed, close the last cold-nav round-trip

Issue: https://github.com/nicolovejoy/selected-projects/issues/19
Spec: the "Still open → Phase 2 — #19" bullet and the "Gotchas learned 2026-08-02" blocks in `AGENTS.md`. There is no separate spec doc; this plan is the spec.

## Goal

Cold client-side navigation to `/` and to `/[category]` (e.g. `/music`) should need **0 blocking RSC requests**. Today it needs 1 because the feed data sits in a dynamic hole. Get there by caching the data layer with `'use cache'` so the feed renders into the PPR static shell. Along the way, stop mutations from invalidating shared cache entries.

## Context every task needs

- Next.js 16.2.4 with `cacheComponents: true` (see `next.config.ts`). **This is not the Next.js in your training data.** Read the relevant file in `node_modules/next/dist/docs/01-app/` before writing code:
  - `03-api-reference/01-directives/use-cache.md`
  - `03-api-reference/04-functions/cacheLife.md` (especially "Nested caching behavior", "Prerendering behavior" and "Conditional cache lifetimes")
  - `03-api-reference/03-file-conventions/02-route-segment-config/instant.md`
  - `03-api-reference/04-functions/refresh.md`
- Rules from those docs that this plan depends on:
  - Only one `cacheLife` call may run per invocation. Calling it in different branches is allowed.
  - An explicit outer `cacheLife` wins over inner lifetimes, whether they are shorter or longer.
  - A lifetime with zero `revalidate`, or an `expire` under 5 minutes, becomes a dynamic hole and is excluded from the prerender. **Never use the `seconds` profile, and never set `expire` below 300.**
  - `cookies()`/`headers()` cannot be called inside `'use cache'`.
  - `Date.now()` inside a `'use cache'` scope runs when the entry is filled (at build time for a prerendered entry), not per request. It stays correct only if the entry revalidates.
  - Cache keys include the Build ID, so every deploy cold-starts every entry.
- `app/loading.tsx` is load-bearing. It is the Suspense boundary around page bodies that call `getSessionUser()`. **Do not delete or change it.**
- `lib/auth.ts` `getSessionUser()` reads cookies, so any component that calls it must render inside a `<Suspense>` boundary (or below `loading.tsx`).

## Global Constraints

- The exported function names and return types of `lib/og.ts`, `lib/github.ts`, `lib/history.ts` and `lib/feed.ts` stay **unchanged**. Call sites must not need edits because of the migration.
- A failed upstream fetch must never throw out of an exported function. It returns `null` (og/github) or the `EMPTY` history (history), exactly as today.
- Cache lifetimes, per function (these replace the old `revalidate` numbers):
  - OG preview (`getOgPreview`) on success: `cacheLife("days")`. Old value: `revalidate: 86400`.
  - Commit activity (`getCommitActivity`) on success: `cacheLife("hours")`. Old value: 3600.
  - Public repo (`getPublicRepo`) on success: `cacheLife("days")`. Old value: 86400.
  - History (`getProjectHistory`) on success, including a 404 → EMPTY: `cacheLife("hours")`. Old value: `next: { revalidate: 3600 }`.
  - The feed (`getGroupedFeed`): explicit `cacheLife("hours")`.
  - **Any failure path** (non-OK response, thrown error, timeout, no og:image, private repo, zero commits): `cacheLife("minutes")` (1 min revalidate, 1 h expire). A failure is cached briefly, never for the success lifetime.
- No `unstable_cache` imports may remain in `lib/`.
- No fetch inside a `'use cache'` scope may keep `cache: "no-store"` or `next: { revalidate }`. The scope owns caching.
- Comments explain *why* and match the surrounding comment density. Where the old comments describe `unstable_cache` behaviour ("throws so the wrapper never stores a failure"), rewrite them to describe the new behaviour.
- Verification commands (run from the repo root):
  - `npm run check`
  - `npx tsc --noEmit`
  - `npx next build`. Read the route table: `◐` is partial prerender, `○` is static, `ƒ` is dynamic.
  - `npx playwright test`. It builds and serves on port 3199 with a disposable `file:.playwright/e2e.db`. **Never** point anything at a `libsql://` URL, and never run `npm run db:migrate`.
  - The nav-cost measurement, using the instructions in the header of `scripts/nav-cost.mjs`:
    - Build, then serve with `TURSO_DATABASE_URL="file:.playwright/e2e.db" npx next start --port 3199`.
    - Run `node scripts/nav-cost.mjs`.
    - Kill the server afterwards.
    - If `.playwright/e2e.db` does not exist yet, create it first with `mkdir -p .playwright && TURSO_DATABASE_URL=file:.playwright/e2e.db node scripts/migrate.mjs && TURSO_DATABASE_URL=file:.playwright/e2e.db node scripts/seed-dev.mjs`, after checking how `playwright.config.ts` invokes them.
- Stage specific files only. Never `git add -A` or `git add .`.
- Commit on the current branch `issue-19-use-cache`. Never push.

---

### Task 1: Baseline, then migrate the leaf data fetchers to `'use cache'`

**Files:** `lib/og.ts`, `lib/github.ts`, `lib/history.ts`

1. **Baseline first, before editing anything.** On the unmodified branch, build and run `scripts/nav-cost.mjs` as described in Global Constraints. Paste its full output into your report under "Baseline nav-cost". Also paste the `next build` route table.
2. `lib/og.ts`:
   - Replace the `unstable_cache` wrapper with a `'use cache'` function keyed by its `url` argument.
   - Success → `cacheLife("days")`, return the preview. Any failure → `cacheLife("minutes")`, `console.warn` as today, return `null`.
   - The try/catch has to live **inside** the cached function, because an exception must not escape the cached scope.
   - Remove `cache: "no-store"`. Keep the 3 s AbortController timeout and the User-Agent header.
3. `lib/github.ts`:
   - Migrate `getCommitActivity` in the same way (success `hours`, failure `minutes` + warn + `null`).
   - Migrate `getPublicRepo` in the same way (success `days`, failure `minutes` + warn + `null`).
   - Remove both `cache: "no-store"`.
   - Add a comment on the `Date.now()` calls saying they evaluate when the cache entry fills, and that the `hours` lifetime is what keeps the calendar window current. Do not restructure the calendar math.
4. `lib/history.ts`:
   - Make `getProjectHistory` a `'use cache'` function.
   - Success, including 404 → `EMPTY`: `cacheLife("hours")`. Non-OK and thrown errors: `cacheLife("minutes")`, returning `EMPTY` with the existing warnings.
   - Remove `next: { revalidate: 3600 }` from the fetch.
5. Run `npm run check`, `npx tsc --noEmit`, `npx next build` and `npx playwright test`. All must pass. `next build` must not report a prerender error or a "short-lived cache nested without cacheLife" error.
6. Commit: `Migrate og/github/history fetchers from unstable_cache to 'use cache' (#19)`.

**Done when:**
- No `unstable_cache` remains in `lib/`.
- Every exported function keeps its signature.
- Every failure path calls `cacheLife("minutes")` and returns null/EMPTY.
- Build and e2e are green.
- The report contains the baseline nav-cost output and route table.

### Task 2: Cache the feed and move the home page's session read into a Suspense hole

**Files:** `lib/feed.ts`, `app/page.tsx`. `app/[category]/page.tsx` only if the build shows it needs a change.

1. `lib/feed.ts`: add `'use cache'` plus an explicit `cacheLife("hours")` to `getGroupedFeed`, and give it a one-line comment on why the explicit profile is needed:
   - Without it, an inner `minutes` failure lifetime would propagate and demote the feed into a dynamic hole.
   - With it, a leaf failure caught at fill time persists for up to an hour at the feed level. We accept that tradeoff.
2. `app/page.tsx`:
   - Today `HomePage` awaits `getSessionUser()` before rendering anything, so the whole body waits on cookies.
   - Restructure so the feed and headings render with no session read. The only session-dependent element is the "Sign in" link. Move it into a small async server component that calls `getSessionUser()` and renders the link only when `!user`, and wrap it in `<Suspense fallback={null}>`.
   - The "Get in touch" link stays static.
   - The rendered DOM for both signed-in and signed-out visitors must stay the same as today.
3. Build. In the route table, `/` and `/[category]` (and its generated `/music` etc.) must be `◐` or `○`, not `ƒ`. Paste the table into the report.
4. Run nav-cost. **Cold nav to `/` and to the category route must now be 0 blocking.** Paste the output next to Task 1's baseline. If either is still 1 blocking, find the component still reading request data outside a Suspense boundary and fix it within these files. Do not touch `app/loading.tsx` or `components/nav.tsx`.
5. Run `npm run check`, `npx tsc --noEmit` and `npx playwright test`. All must be green, including `e2e/home.spec.ts`, `e2e/ledger-feed.spec.ts` and the signed-in/anonymous home assertions in `e2e/signed-in.spec.ts`.
6. Commit: `Cache the grouped feed and stream the home sign-in link (#19)`.

**Done when:**
- `/` and the category routes are prerendered with the feed in the shell.
- nav-cost shows 0 blocking for cold nav to both.
- e2e is green.

### Task 3: Stop mutations from invalidating shared path entries

**Files:** `app/projects/[slug]/actions.ts`, plus a new e2e spec or an addition to `e2e/signed-in.spec.ts`.

1. `postNote`, `deleteNoteAction` and `followAction` call `revalidatePath(\`/projects/${project}\`)`. Notes and follow state are read per request inside the page's dynamic hole and are never inside a `'use cache'` scope. So the call only purges the shared path entry (the prerendered shell every visitor gets) to update one user's view.
2. Replace all three calls with `refresh()` from `next/cache`, which re-renders the acting user's current route. Remove the `revalidatePath` import if it becomes unused. Add one comment at the first `refresh()` call saying why it is not `revalidatePath`.
3. Add e2e coverage for the mutation that has none today:
   - A signed-in test that opens a project the seed user is **not** following (read `scripts/seed-dev.mjs`; musicforge is followed, so pick another, e.g. `prntd`), clicks follow, and asserts the control flips to the "following" state without a manual reload.
   - Then click again and assert it flips back, so the shared e2e DB is left as seeded.
   - Tests run `fullyParallel`, so don't touch musicforge. Use the existing signed-in helpers in `e2e/auth.ts`.
   - Read `app/projects/[slug]/follow-button.tsx` for the accessible names.
4. Run `npx tsc --noEmit` and `npx playwright test`. All must be green, with the new test passing.
5. Commit: `Mutations refresh the acting user's route instead of purging shared paths (#19)`.

**Done when:**
- No `revalidatePath` remains in `app/projects/[slug]/actions.ts`.
- The follow round-trip e2e passes.
- The whole suite is green.

### Task 4: Build-time proof with `unstable_instant`, and docs

**Files:** `app/page.tsx`, `app/[category]/page.tsx`, `AGENTS.md`

1. Add `export const unstable_instant = { prefetch: "static" };` to `app/page.tsx` and `app/[category]/page.tsx`, with a short comment saying the build now fails if a change reintroduces a blocking read on these routes.
2. `npx next build` must pass. If validation reports a blocking component, fix the component (Suspense or cache), not the export. Do not set `unstable_disableValidation`.
3. Run `npx playwright test`, then re-run nav-cost as a final number. Paste both into the report.
4. `AGENTS.md`, in the "Still open → Phase 2 — #19" bullet:
   - Rewrite it to say what shipped: leaf fetchers on `'use cache'`, feed cached, home sign-in link streamed, mutations use `refresh()`, `unstable_instant` on `/` and `/[category]`, and the before/after nav-cost numbers.
   - Keep, as the remaining open item, the check that still needs a preview deploy: whether runtime cache entries persist on Vercel serverless without `'use cache: remote'`.
   - Also fix the stale "PR #26 open, not merged" heading. PR #26 merged as `d67bd3c`.
   - Keep the edit tight, in the file's existing voice. Don't touch other sections.
5. Commit: `Validate instant nav on / and /[category] at build time; roadmap update (#19)`.

**Done when:**
- The build passes with `unstable_instant` on both routes.
- e2e is green.
- AGENTS.md is accurate.
