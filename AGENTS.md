<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Sourcing project copy

Before drafting taglines/descriptions for the featured projects in `lib/projects.ts`, run `/ask` for each project to pull recent session summaries and weekly rollups from the prompt-history store. Those reflect current direction and active work; the in-repo READMEs often lag (or are still create-next-app boilerplate). Confirm copy with Nico before committing.

Projects (slug → repo if different): musicforge, prntd, rocksculpture (repo: `~/src/showcase`), ibuild4you, prompt-lab. (lojong removed from the site 2026-07-05 — portfolio focus.) MDX files set an explicit `historyKey` when slug ≠ repo dir name.

## Where editable text lives

See `docs/editing.md` for the canonical map. All visible copy lives in `content/`: pages are MDX (`home.mdx`, `connect.mdx`, `about.mdx`, `projects/*.mdx`) and site-wide strings (title, description, footer tagline, nav labels) are in `content/site.ts`. Site is live at `https://pianohouseproject.org` (Vercel).

## Cross-agent handoff

This repo coordinates with `prompt-lab` (the producer of `public_session_summaries` / `public_weekly_rollups`) via an append-only shared file at `~/src/.handoff/selected-projects-prompt-lab.md`. **Read it at session start** alongside `/readup`. New cross-repo asks (bug reports about the public tables, schema changes, expected-behavior clarifications) go there as a new entry under `## Active`. When an entry is acted on, move it under `## Archived` with a one-line outcome. See the file's own header for the entry format. Cross-repo GitHub issues remain valid for anything the public web should see; the handoff file is for working-state coordination.

## Environments

See `docs/environments.md`. Local dev uses `file:dev.db` (init: `npm run db:migrate`); preview deploys use the `pianohouse-preview` Turso DB; only production touches the prod DB (`pianohouse`). Prod smoke tests use plus-addressed accounts (`nlovejoy+<label>@me.com`), cleaned up after.

## Local checks

`npm run check` validates content/ — project frontmatter, status enum, image references, hero registry, `homeHero` resolution. A `simple-git-hooks` pre-push runs `check` + `next build` automatically; bypass with `SKIP_SIMPLE_GIT_HOOKS=1 git push` if you really need to.

## Next steps

**Done 2026-06-07 (this session):** UX overhaul live on main (feed-first home, magic-link auth, notes+follow, `/projects`, `/vibe-coding-lessons`, tenets). Terse-copy razor pass across all user-facing copy + new global rule in `~/.claude/CLAUDE.md` ("say only what's not obvious"). Home feed is now **one card per project** (latest rollup, newest-first). **GitHub contribution calendar** added to detail pages — built from the `/commits` API (NOT `stats/commit_activity`, which 202s intermittently and caused flicker), cached success-only via `unstable_cache`, truncated to fetched range for busy/capped repos. "Code on GitHub" link for public repos; "Visit site" moved into the header; calendar sits beside the evolution timeline; `/projects` sorted by most recent work. `GITHUB_TOKEN` set in Vercel prod+preview (classic no-scope = public only; **musicforge repo is private → 404 → hidden**; widen token scope to include private repos if wanted).

**Done 2026-06-08 (this session — shipped + verified on prod):** Detail-page redesign. `lib/og.ts` `getOgPreview(url)` scrapes `og:image`/`og:title`/`og:description` from the live URL (AbortController 3s, normal UA, relative→absolute), `unstable_cache` daily, **throw-on-miss** (mirrors `lib/github.ts`); fallback og:image → project `image`/`cardImage` → null. `components/og-preview.tsx` = clickable card (plain `<img>`, fills its column). `components/collapsible-section.tsx` = native `<details>`/`<summary>` (hidden marker, rotating chevron, no JS). `app/projects/[slug]/page.tsx`: **above-the-fold two-column header** — title+status+tagline+CTAs (Visit/GitHub, Follow, Get-in-touch) on the **left**, compact `sm:w-80` preview card on the **right** (`flex-col` stacks on mobile); then **about** (open) / **evolution** (collapsed, timeline+calendar) / **notes** (collapsed); stripped section chrome from `evolution.tsx`+`notes.tsx`. Also: terse-copy razor on `prompt-lab.mdx` (last project), display name → `PianoHouseProject.org`. Card size/layout iterated live with Nico (capped → two-column → title-left/card-right).

**Done 2026-06-09 (this session — cleanup pass):** OG follow-up closed — all six project sites ship `og:image` (ibuild4you was last; cards fill via daily revalidation). Added CI (`.github/workflows/check.yml`: `npm run check` on push/PR) and trimmed the pre-push hook to `check` only (CI + Vercel build anyway). Deleted merged `ux-feed-and-magic-link-auth`; archived the resolved handoff entry. **musicforge calendar is hidden by design** — repo is private, prod `GITHUB_TOKEN` is public-only; public-repo-vs-wider-token decision deferred. `app/dev/hero-tune` kept — it's the hero-tuning dev tool and already 404s in prod.

**Done 2026-06-13 (this session):** Issue #4 closed — `/vibe-coding-lessons` gated behind auth. `app/projects/[slug]/page.tsx` pattern reused: `app/vibe-coding-lessons/page.tsx` now `await getSessionUser()` → signed-in renders full `<Lessons/>`; anonymous gets a teaser (real `MachineNote` attribution w/ `/tenets` link + the one-line version + sign-in CTA card). Single content file unchanged = source of truth; teaser duplicates ~2 short strings (accepted). Verified all three on prod: anonymous teaser, signed-in full, and **single-use magic-link** (reusing a consumed link → "expired or used"). Also replied to prompt-lab's public-table audit in the cross-repo handoff file: manifest = **7 `historyKey`s** (not slugs — `showcase`/`am-i-an-ai` would be mis-purged), both tables consumed per-project, frozen-is-fine, purge approved incl. byside.

**Done 2026-07-04:** Non-owner magic-link verified on prod via Playwright (`nlovejoy+stranger@me.com` — signed in, gated lessons unlocked; test user deleted after). Environment isolation shipped: local dev → `file:dev.db` (token-less `file:` support in `lib/db.ts`/`migrate.mjs`, `.env.tpl` defaults to it), preview deploys → new `pianohouse-preview` Turso DB, prod TURSO vars re-scoped Production-only with fresh tokens (old 1Password token still valid). Fixed preview `AUTH_FROM_EMAIL` pinned to a deleted branch (preview magic links were broken). Wrote `docs/environments.md` incl. hardening roadmap. **Gotcha:** `vercel env rm NAME preview` deletes the whole var across ALL environments, not just one target.

**Done 2026-07-05 (this session):** Six commits, all verified live. (1) **Note moderation + anti-bot** (`4ed8d90`): `ADMIN_EMAIL` env (all tiers) → delete-any-note, authors delete their own; email alert to `CONNECT_TO_EMAIL` per note; sign-in honeypot + rate limits via `magic_tokens` (3/email + 10/IP per 15 min; new `ip` column, migrated dev/preview/prod), 5 notes/user/hr; dev logs magic links, never calls Resend. (2) **Signed-in nav chip** (`24e5d00`). (3) **Portfolio pass** (`bd97970`) — site now doubles as a portfolio for Nico's Anthropic PM application (see memory): hero identity line, feed cards get tagline + OG thumbnail + "visit ↗" link, "vibe-coding" reframed in site copy, **lojong removed** (handoff sent: public-tables manifest now 6 keys), anonymous feed gate removed. (4) **Site-walk fixes** (`a54c550`): detail back-link, per-project `<title>`s, no nested `<main>`, honeypot a11y. (5) **/projects retired** (`ef4705e`) — home feed IS the index; route redirects home; CTA → "Get in touch". (6) **GitHub link in nav** (`571ff50`). **Gotcha:** the permission classifier blocks agent-run prod DB dumps and prod ALTERs — Nico runs those (copy-paste command) or approves inline.

**Still open:**
- **Next session (Nico, 2026-07-05):** (1) new project pages for **split-recording** and maybe **recountly** (per AGENTS.md: run `/ask` per project before drafting copy, confirm with Nico); he also said "add ibuild4you to the described projects" — it already has a page, clarify what he meant. (2) **Naming pass:** "Piano House Project" = umbrella for ALL of Nico's work; the site itself = the `selected-projects` project — audit copy for that distinction. (3) Nav GitHub icon should point to Nico's **profile** (https://github.com/nicolovejoy), not (only) the site repo.
- **Follower email digest** (Resend) — next feature; `follows` is populated but nothing sends. Then Google OAuth + account-linking (stub button on /signin).
- **Issue #5** — richer card visuals (real screenshots vs. text-heavy og:images; prompt-lab needs a `cardImage`): https://github.com/nicolovejoy/selected-projects/issues/5
- **Hardening** (docs/environments.md): seed script `scripts/seed-dev.mjs` → preview email split → prod backup habit (user-run; classifier blocks agent dumps).
