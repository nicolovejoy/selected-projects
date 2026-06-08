<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Sourcing project copy

Before drafting taglines/descriptions for the featured projects in `lib/projects.ts`, run `/ask` for each project to pull recent session summaries and weekly rollups from the prompt-history store. Those reflect current direction and active work; the in-repo READMEs often lag (or are still create-next-app boilerplate). Confirm copy with Nico before committing.

Projects (slug → repo if different): musicforge, prntd, rocksculpture (repo: `~/src/showcase`), ibuild4you, prompt-lab, lojong (repo: `~/src/am-i-an-ai`). MDX files set an explicit `historyKey` when slug ≠ repo dir name.

## Where editable text lives

See `docs/editing.md` for the canonical map. All visible copy lives in `content/`: pages are MDX (`home.mdx`, `connect.mdx`, `about.mdx`, `projects/*.mdx`) and site-wide strings (title, description, footer tagline, nav labels) are in `content/site.ts`. Site is live at `https://pianohouseproject.org` (Vercel).

## Cross-agent handoff

This repo coordinates with `prompt-lab` (the producer of `public_session_summaries` / `public_weekly_rollups`) via an append-only shared file at `~/src/.handoff/selected-projects-prompt-lab.md`. **Read it at session start** alongside `/readup`. New cross-repo asks (bug reports about the public tables, schema changes, expected-behavior clarifications) go there as a new entry under `## Active`. When an entry is acted on, move it under `## Archived` with a one-line outcome. See the file's own header for the entry format. Cross-repo GitHub issues remain valid for anything the public web should see; the handoff file is for working-state coordination.

## Local checks

`npm run check` validates content/ — project frontmatter, status enum, image references, hero registry, `homeHero` resolution. A `simple-git-hooks` pre-push runs `check` + `next build` automatically; bypass with `SKIP_SIMPLE_GIT_HOOKS=1 git push` if you really need to.

## Next steps

**Done 2026-06-07 (this session):** UX overhaul live on main (feed-first home, magic-link auth, notes+follow, `/projects`, `/vibe-coding-lessons`, tenets). Terse-copy razor pass across all user-facing copy + new global rule in `~/.claude/CLAUDE.md` ("say only what's not obvious"). Home feed is now **one card per project** (latest rollup, newest-first). **GitHub contribution calendar** added to detail pages — built from the `/commits` API (NOT `stats/commit_activity`, which 202s intermittently and caused flicker), cached success-only via `unstable_cache`, truncated to fetched range for busy/capped repos. "Code on GitHub" link for public repos; "Visit site" moved into the header; calendar sits beside the evolution timeline; `/projects` sorted by most recent work. `GITHUB_TOKEN` set in Vercel prod+preview (classic no-scope = public only; **musicforge repo is private → 404 → hidden**; widen token scope to include private repos if wanted).

**NEXT UP — detail-page redesign (PLANNED, not built; decided: preview = live-URL OG tags):**

1. **OG preview card.** New `lib/og.ts`: `getOgPreview(url)` → `{ image, title, description } | null`.
   - Server-side `fetch` the project's live URL HTML with a short timeout (AbortController ~3s) + a normal User-Agent; parse `og:image` / `og:title` / `og:description` (fallback `twitter:image`). Resolve relative image URLs against the page origin.
   - Wrap in `unstable_cache` (revalidate daily), **success-only — throw on miss** so failures aren't cached (same pattern as `lib/github.ts`).
   - Fallback chain: og:image → project `image`/`cardImage` → null (render nothing).
   - New `components/og-preview.tsx`: clickable card (`<a href={project.url} target="_blank">`) with image + title. Use a plain `<img>` (arbitrary external domains) to skip `next/image` remotePatterns config.
   - Render at the very top of `app/projects/[slug]/page.tsx` in `<Suspense>`, only when `project.url` set; likely replaces the separate `image` block.
2. **Above-the-fold + expandable layout.** Restructure the detail page: above fold = OG card → name+status+tagline → Visit/GitHub. Collapse long content into native `<details>`/`<summary>` (no JS): **About** (MDX `<Body/>`, open by default), **Evolution** (timeline+calendar, collapsed), **Notes** (collapsed). Style `<summary>` as headers, hide default marker, add a chevron.
3. **Per-project OG follow-up** ("make it look right"): set/verify `og:image` on each project site (prntd, ibuild4you, am-i-an-ai, musicforge, prompt-lab; this site already has `/opengraph-image`).

**Still open (pre-existing):**
- **Verify magic-link to a non-owner inbox** on prod — the only un-verified piece of auth. `https://www.pianohouseproject.org/signin`, expect sender `noreply@mail.pianohouseproject.org`.
- **Auth follow-ups (not built):** Google OAuth + account-linking; follower email digest (Resend); note moderation.
- **Project imagery** — `image` + `cardImage` wired, none set. Drop file at `assets/originals/projects/<slug>.<ext>`, run `node scripts/compress-image.mjs projects/<slug>`, add to MDX. (May matter less once OG cards land.)
- **Tidy `content/projects/prompt-lab.mdx`** — last project not in the copy pass.
- **Email config DONE** — sender `noreply@mail.pianohouseproject.org` verified; all vars set in prod/preview.
