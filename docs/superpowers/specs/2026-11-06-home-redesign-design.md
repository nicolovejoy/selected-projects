# Home redesign for the job hunt (2026-11-06)

Amended 2026-11-07: heading renamed to 'selected projects'; the aside placement was removed and rocksculpture / selected-projects joined the table (ranks 7, 8).

Audience and card choices come from the 2026-11-05 brief in `~/src/.handoff/selected-projects-split-recording.md`. Nico ruled on 2026-11-06: layout from mock B (https://claude.ai/artifact/MYEWviFZ8aQBw4JLtSFhD4), claim "Nico's agentic coding projects", no bio (LinkedIn carries that), byside dropped entirely, Tideline featured instead, anomatom featured with motion, detail and category pages restyled in the same round. Nico edits the copy in the source files himself; seed it from the brief and keep every line factual. No section intros, no labels that restate a heading.

## Intent

A hiring manager at an AI company arrives from a resume or LinkedIn and has 60 to 90 seconds. The page must show, without being told, that Nico builds every day with coding agents and that the work ships to real people. Goal: they want a 20-minute call.

## Goals, non-goals, anti-goals

- Goals: claim and proof above the fold; four featured projects with images; every other project in one scannable table; music and art as texture, not headline; human/AI authorship stays explicit; both languages.
- Non-goals: bio or career history on this site (LinkedIn link only); byside, SkiTrack, span; a Spanish locale; changes to the connect, tenets, lessons, signin pages.
- Anti-goals: filler copy; hype words; cards without a fact; a home that looks like a hobby portfolio.

## Home page

Container 1040px, same type as today: Newsreader for the claim, project names and section headings; Geist for body; Geist Mono for numbers and states. Neutral ramp unchanged. Dark mode via the existing tokens.

1. **Hero**, two columns from 860px (5fr/7fr), stacked below.
   - Left: h1 `home.heading` = "Nico's agentic coding projects"; one line `home.sub` = "Nico Lovejoy, Seattle."; three actions: "Get in touch" (primary, `/connect`), "GitHub" (https://github.com/nicolovejoy), "LinkedIn" (`site.linkedin`, URL to come from Nico; render the button only when set).
   - Right: a 52-week GitHub contribution calendar for the user, not a repo. Caption under it: `{total} contributions in the past year`, `{repos} public repos`, `daily with Claude Code since late 2025` (`home.proof.claudeCode`, a string), and the bare link github.com/nicolovejoy. Numbers are fetched, never typed.
2. **Featured** (`h2` = "LLM and agent work"): PRNTD, Tideline, Prompt Lab, anomatom, in that order. Grid: 1 column under 700px, 2 to 1100px, 4 above. Each card: image (16:9ish, `cardVideo` if set, else `cardImage`, else OG scrape, else a text tile with the tagline in Newsreader), name, state (mono, coloured by status), tagline, `hard` line (muted), `facts` row (mono, faint). Whole card links to the detail page.
   - `cardVideo`: muted, looping, `playsInline`, `preload="metadata"`, poster = `cardImage`; under `prefers-reduced-motion: reduce` show the poster only. Asset is Nico's to supply (anomatom repo); the field is optional and `check` verifies the file exists under `public/` if set.
3. **Shipped** (`h2` = "Shipped"): a table of every project with `home: list` (the default), ordered by `rank` ascending, unranked after, ties by latest `weekOf`. Columns: name (Newsreader), state (mono), what it does (tagline, then `hard` as a muted second line), facts (mono, right-aligned, one per line). Under 600px each row stacks. Row links to the detail page.
4. **Aside**: one sentence listing projects with `home: aside` ("Also here: anomatom…" style, names linked), then "Nico writes this site; Claude's passages are marked." with a link to `/tenets`. Both strings live in `strings.home`.
5. Categories disappear from home. The category routes and nav stay.

## Content model (frontmatter in `content/projects/*.mdx`)

New optional fields, validated by `scripts/check-content.mjs`:

- `home`: `"featured" | "list" | "aside"`, default `list`.
- `rank`: positive integer; order within featured and within the list.
- `hard`: string, one sentence, the part that took real work. French twin in `content/fr/projects/*.mdx` (`FrMeta` gains optional `hard`; falls back to EN).
- `facts`: string[] of short facts ("440 tests", "600+ commits"). French twin optional, falls back to EN.
- `cardVideo`: path under `public/`, mp4 or webm.

Seed values (Nico edits after):

- prntd: featured, rank 1, hard "A multi-step LLM pipeline sits between the chat and the printer; every revision still has to print.", facts ["440 tests", "CI on every push", "takes paid orders"].
- tideline: featured, rank 2, hard "Built through iBuild4You: empty repo to live site in a day.", facts ["live", "14-day window"].
- prompt-lab: featured, rank 3, hard "The numbers on this page come from it; so do the write-ups, drafted by a model and gated by Nico.", facts ["every session logged", "nightly summaries"].
- anomatom: featured, rank 4, hard "Pattern notation parsed into a physics scene and a drum machine in the same tick.", facts ["beta"].
- split-recording: list, rank 1, hard "Takes are named by local Whisper transcription matched against the band's repertoire; the catalog is a static site on R2 with a Worker and D1 only for votes.", facts ["600+ commits", "~180 PRs", "pytest, vitest, Playwright"].
- l6-music: list, rank 2, hard "One stage per PR, in-app feedback straight to the teacher.", facts ["272 commits in two months", "51 test files"].
- musicforge: list, rank 3, facts ["iOS and web"].
- ibuild4you: list, rank 4, hard "Bakery Louise, Tideline and L6 came through it.", facts ["3 apps delivered"].
- raconte: list, rank 5, facts ["iPhone and Mac", "no server"].
- bakerylouise: list, rank 6.
- rocksculpture, selected-projects: aside.
- songscribe: removed (both mdx files, slug, `lib/projects.ts` entries), with permanent redirects `/projects/songscribe` → `/music` and `/fr/projects/songscribe` → `/fr/music`.

## GitHub data (`lib/github.ts`)

Add `getUserContributions()`: GraphQL `user(login:"nicolovejoy") { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { contributionCount date } } } } }` with `GITHUB_TOKEN` (present in Vercel Production and Preview). `"use cache: remote"`, `cacheLife("hours")` on success, `minutes` and null on failure. Also `getPublicRepoCount()` from REST `/users/nicolovejoy` (`public_repos`), `days`. With no token or on failure the hero renders without the calendar and without those two numbers (the Claude Code line and links still show). Reuse `ContributionCalendar` for rendering; give it a `levels` input independent of the per-repo commit shape, or map the contribution days into the existing `CommitWeek` shape. Fill happens at request time inside Suspense, like the detail page's calendar (gotcha 4 in CLAUDE.md).

## Detail page (`components/pages/project.tsx`)

Keep the sections. Change the header to match home:

- Image on top at full column width when there is one (`cardVideo`/`cardImage`/OG), not a right-hand column. Below it: name, state, tagline, `hard`, `facts` in the same treatment as the featured card.
- The mono uppercase strip (category / status / latest / activity / source) becomes one sentence-case line in Geist 13px muted: "Music · beta · latest week of Oct 26 · 21 sessions" is the information, written as "Music, beta. Latest write-up week of Oct 26, from 21 sessions." Keep `StatusBadge` colours.
- Actions row unchanged in function; buttons use the hero's button style.
- `mono-label` stays available for the recordings-catalog parity but home and the restyled header do not use uppercase labels.

## Category page (`components/pages/category.tsx`, `feed-card.tsx`)

Rows use the home table's row format with a small image thumbnail on the left (96px wide, 16:9) when one exists: name, state, tagline, `hard`, facts, latest `weekOf`. Drop the "↳ from claude · N sessions" and "no rollup published" labels from the row; the `summary` paragraph stays and is marked as Claude's with the same muted-italic treatment `MachineNote` uses. Keep the `← all work` link as sentence case.

## French

Every new string in `strings.ts` gets its `fr` twin. New frontmatter `hard`/`facts` get FR values in the FR mdx where wording differs; glossary at `prompt-lab/workflow/localization/fr-glossary.md`. `translationNote` stays.

## Tests

- `e2e/home.spec.ts` rewritten: h1 text, four featured cards in order, the Shipped table lists Split Recording first, the aside names Rock Sculpture, no category h2s, calendar present when the token is set (skip otherwise), everything above the fold on an iPhone is the hero only.
- `e2e/ledger-feed.spec.ts` rewritten for the new row format; songscribe references removed everywhere (french, live-preview, not-found specs too).
- `npm run check`, `npx tsc --noEmit` after `npx next typegen`, `npm run build`, full e2e headless with Edge.

## Left to the builder

Exact spacing, the thumbnail sizes, the table's stacked layout under 600px, the hero's stacking order on phones (calendar below the actions), and how the text tile is set when a featured project has no image.
