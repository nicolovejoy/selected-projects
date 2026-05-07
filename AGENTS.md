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

- **Eyeball backfilled evolution copy** on prod and iterate on tone via prompt-lab if the public-summary phrasing feels off. 163 session summaries + 39 weekly rollups are now live across all 7 projects. [Issue #1](https://github.com/nicolovejoy/selected-projects/issues/1) can be closed.
- **Project imagery — both fields are wired**: `image` (detail-page hero, renders under header) and `cardImage` (home-card background, white-fade overlay). Workflow per field: drop file at `assets/originals/projects/<slug>.<ext>`, run `node scripts/compress-image.mjs projects/<slug>`, add `image:` and/or `cardImage:` to each MDX. None set yet.
- **Email — finish wiring**: `nico@pianohouseproject.org` and `nico@ibuild4you.com` receive via iCloud+ Custom Domain (Cloudflare DNS, Apple-managed records). Still TODO: verify the domain in Resend, **merge** Resend's SPF into the existing iCloud SPF TXT (one record only — `v=spf1 include:icloud.com include:_spf.resend.com ~all`), then update `CONNECT_TO_EMAIL` and `CONNECT_FROM_EMAIL` in Vercel env vars. Test connect form on prod once verified.
- **Tidy `content/projects/prompt-lab.mdx`** — only project not yet reviewed in the copy pass. Also worth a once-over on the new `selected-projects.mdx` meta page now that we know the system works.
- Add Vercel preview-env vars (Turso/Resend) once branching workflow starts. Production-only is intentional for alpha.
