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

- **UX overhaul SHIPPED to prod (2026-06-06).** `ux-feed-and-magic-link-auth` was merged to main and is live: feed-first home, magic-link auth, notes + follow, `/projects` index, `/vibe-coding-lessons`, expanded tenets. The merge reconciled PRs #2/#3 (a parallel vibe-coding rewrite that landed on main from `origin/docs/vibe-coding-rewrite`): vibe-coding took main's shorter rewrite, tenets is a union (caveat + #2–5), nav kept the auth-aware version. All env vars (Turso/Resend/connect + `AUTH_FROM_EMAIL`) are set in Vercel prod + preview.
- **One thing still unverified:** real magic-link delivery to a *non-owner* inbox on prod. Smoke-tested via curl (pages 200, content correct) but not an actual end-to-end sign-in by a stranger. Do the 30-sec manual test at `https://www.pianohouseproject.org/signin` with a second inbox; confirm the link arrives from `noreply@mail.pianohouseproject.org`.
- **Auth follow-ups (not built):** Google OAuth + account-linking by verified email; an email digest for followers (Resend); light moderation for public notes. (The env-template hook-allowlist question was resolved — `.env.tpl` is now editable.)
- **Eyeball backfilled evolution copy** on prod and iterate on tone via prompt-lab if the public-summary phrasing feels off. 163 session summaries + 39 weekly rollups are now live across all 7 projects.
- **Project imagery — both fields are wired**: `image` (detail-page hero, renders under header) and `cardImage` (home-card background, white-fade overlay). Workflow per field: drop file at `assets/originals/projects/<slug>.<ext>`, run `node scripts/compress-image.mjs projects/<slug>`, add `image:` and/or `cardImage:` to each MDX. None set yet.
- **Email config DONE.** Sender domain `mail.pianohouseproject.org` is a verified Resend domain (no SPF merge needed — root iCloud SPF untouched). `AUTH_FROM_EMAIL` = `the piano house project <noreply@mail.pianohouseproject.org>`; `CONNECT_FROM_EMAIL`/`CONNECT_TO_EMAIL` already set. All live in Vercel prod + preview and in the env template. Receiving: `nico@pianohouseproject.org` + `nico@ibuild4you.com` via iCloud+ Custom Domain (Cloudflare DNS).
- **Tidy `content/projects/prompt-lab.mdx`** — only project not yet reviewed in the copy pass. Also worth a once-over on the `selected-projects.mdx` meta page now that we know the system works.
