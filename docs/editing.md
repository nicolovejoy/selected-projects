# Editing the site

All visible copy lives in `content/`. Pages and layout chrome import from there — you should not need to touch TSX files for word changes.

The site is bilingual: English at the usual URLs, French mirrored under `/fr` (`/fr`, `/fr/about`, `/fr/projects/<slug>`, …). Every English file below has a French twin, so **an English copy edit means a matching French edit** — `npm run check` fails if a French file is missing, but it can't tell when one is stale.

## Short UI strings (both languages)

`content/strings.ts` — every short string in the chrome and forms (nav, footer, buttons, labels, form errors, status names, category names), as two objects: `en` and `fr`. `fr` is typed as `typeof en`, so adding a key to one and not the other fails `tsc`. `content/site.ts` is now just `strings.en.site`, kept for the OG card.

The `site` block holds:

- `title` — site name (browser tab, header link).
- `tagline` — terse form, drawn as type on the OG card. Not a meta description; the list form makes a poor search snippet.
- `description` — prose form, for `<meta name="description">` and the text beneath social cards. Deliberately a different string from `tagline`.
- `footerTagline` — full footer line ("the piano house project — music, art, products, and tools.").
- `navLabels` — header nav labels (`about`, `tenets`, `lessons`, `connect`, `signIn`).
- `translationNote` — footer line shown only on French pages ("Traduit de l’anglais par Claude."), per tenet 1. Change it once Nico has reviewed the French.

## Standalone pages

French versions live at the same name under `content/fr/` (e.g. `content/fr/about.mdx`). Internal links inside French MDX point at `/fr/...`; `<MachineNote>` there takes `label="par claude"`.

`content/home.mdx` — the intro paragraph under the heading. Only the body is used; `metadata.title` is exported but unread (the H1 comes from `strings.home.heading`). The paragraph is hidden on phones — it's the one element that pushes the four category tiles into scrolling.

`content/connect.mdx` — `/connect` page. `metadata.title` is the H1; the body is the line above the connect form.

`content/about.mdx` — `/about` page body. `metadata.title` is the H1.

## Project content

`content/projects/<slug>.mdx` — one file per project. Nine today: `musicforge.mdx`, `split-recording.mdx`, `songscribe.mdx`, `rocksculpture.mdx`, `prntd.mdx`, `recountly.mdx`, `ibuild4you.mdx`, `prompt-lab.mdx`, `selected-projects.mdx`. Each has:

- **Frontmatter** (`export const metadata = { ... }`) — the project's `name`, `tagline`, `status`, `category`, `url`, and `github` repo slug. Status must be one of `live`, `beta`, `alpha`, `demo`, `concept`; category one of `music`, `art`, `products`, `tools`. Category decides which section of the home page the project appears under; section order lives in `lib/projects.ts`. Optional `cardImage` sets a curated card image (`/cards/<slug>.jpg`, see `assets/README.md`) that overrides the live `og:image` scrape.
- **Body** — the prose description shown on `/projects/<slug>`. Plain markdown. Paragraph breaks are blank lines.

French: `content/fr/projects/<slug>.mdx` exports only `metadata = { tagline }` plus the translated body. Name, status, url, etc. always come from the English file, so they can't drift.

To add a new project: drop a new `.mdx` file here and its French twin in `content/fr/projects/`, then add both import lines to `lib/projects.ts` (`entries` and `frEntries`).

## What you generally don't edit

- `lib/projects.ts` — TypeScript that imports the project MDX files. Edit only when adding/removing a project (two new import lines per addition: English and French).
- `components/pages/*.tsx` — the page bodies, shared by both languages. Edit if you want to change page *structure*, not its words.
- `app/(en)/**` and `app/(fr)/fr/**` — one-line route wrappers that pick a locale. Two root layouts (one per language) so each sets its own `<html lang>`; `app/global-not-found.tsx` covers unmatched URLs.
- `components/nav.tsx`, `components/root-shell.tsx`, `app/opengraph-image.tsx` — read from `content/strings.ts`. Edit that instead.

## What stays in English on French pages

- Weekly rollups and session summaries in the « évolution » block and the feed — written by Claude upstream in prompt-lab, in English (marked `lang="en"`).
- Notes posted by readers, and OG preview titles scraped from project sites.
- The sign-in email and the post-sign-in redirect (`/api/auth/verify` lands on `/`).
- The OG share card, and the 404 page for completely unmatched URLs.

## How to preview an edit

```
npm run dev
```

Open http://localhost:3000. Most content edits hot-reload without a restart.

## How to deploy an edit

Commit and push to `main`. Vercel auto-deploys to https://pianohouseproject.org, usually within ~2 minutes — though a deploy has sat in "Initializing" for 10+ before clearing on its own.

Stage explicit paths, not `-A` — `git add -A` once swept a stray agent screenshot into a commit.

```
git add content/ && git commit -m "Update <whatever>" && git push
```
