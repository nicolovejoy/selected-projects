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

- **Ship the UX overhaul.** Branch `ux-feed-and-magic-link-auth` (pushed, preview only) holds: feed-first home (`/`), hamburger nav, hand-rolled magic-link auth (Turso + Resend), notes + follow on project pages, `/projects` index, `/vibe-coding-lessons`, expanded tenets. **Before merging to main (auto-deploys prod):** set `AUTH_FROM_EMAIL` / `CONNECT_FROM_EMAIL` / `CONNECT_TO_EMAIL` AND the Turso vars in Vercel prod env, or others can't sign in / DB calls fail. The whole site is now dynamic (nav reads the session cookie in the layout).
- **Auth follow-ups (not built):** Google OAuth + account-linking by verified email; an email digest for followers (Resend); light moderation for public notes. The `.env.tpl` hook-allowlist question is with the prompt-lab agent.
- **Eyeball backfilled evolution copy** on prod and iterate on tone via prompt-lab if the public-summary phrasing feels off. 163 session summaries + 39 weekly rollups are now live across all 7 projects.
- **Project imagery — both fields are wired**: `image` (detail-page hero, renders under header) and `cardImage` (home-card background, white-fade overlay). Workflow per field: drop file at `assets/originals/projects/<slug>.<ext>`, run `node scripts/compress-image.mjs projects/<slug>`, add `image:` and/or `cardImage:` to each MDX. None set yet.
- **Email — sender already verified; just set the From vars.** Receiving: `nico@pianohouseproject.org` and `nico@ibuild4you.com` via iCloud+ Custom Domain (Cloudflare DNS, Apple-managed records). Sending: `mail.pianohouseproject.org` is **already a verified Resend domain** (DKIM at `resend._domainkey.mail.pianohouseproject.org`), so there is **no domain to verify and no SPF merge to do** — Resend uses its own `send` subdomain, leaving the root iCloud SPF (`v=spf1 include:icloud.com ~all`) untouched. Remaining work is only config: set `AUTH_FROM_EMAIL`, `CONNECT_FROM_EMAIL` (e.g. `... <noreply@mail.pianohouseproject.org>`), and `CONNECT_TO_EMAIL` (`nico@pianohouseproject.org`) in `.env.tpl` (plain values, not `op://` — they're public) → `op inject`, and in Vercel prod env. Until set, magic-link auth falls back to Resend's test sender (`onboarding@resend.dev`), which only delivers to the account owner — so other people can't sign in via email on prod until the prod vars are in place. Then test the connect form + sign-in on prod.
- **Tidy `content/projects/prompt-lab.mdx`** — only project not yet reviewed in the copy pass. Also worth a once-over on the new `selected-projects.mdx` meta page now that we know the system works.
- Add Vercel preview-env vars (Turso/Resend) once branching workflow starts. Production-only is intentional for alpha.
