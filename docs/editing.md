# Editing the site

All visible copy lives in `content/`. Pages and layout chrome import from there — you should not need to touch TSX files for word changes.

## Site-wide strings

`content/site.ts` — small strings that appear in chrome:

- `title` — site name (browser tab, header link).
- `tagline` — terse form, drawn as type on the OG card. Not a meta description; the list form makes a poor search snippet.
- `description` — prose form, for `<meta name="description">` and the text beneath social cards. Deliberately a different string from `tagline`.
- `footerTagline` — full footer line ("the piano house project — music, art, products, and tools.").
- `navLabels` — header nav labels (`about`, `tenets`, `lessons`, `connect`, `signIn`).

## Standalone pages

`content/home.mdx` — the intro paragraph under the "What's cooking" heading. Only the body is used; `metadata.title` is exported but unread (the H1 is hardcoded in `app/page.tsx`). The paragraph is hidden on phones — it's the one element that pushes the four category tiles into scrolling.

`content/connect.mdx` — `/connect` page. `metadata.title` is the H1; the body is the line above the connect form.

`content/about.mdx` — `/about` page body. `metadata.title` is exported but currently unused (the H1 is hardcoded as "About" in `app/about/page.tsx`).

## Project content

`content/projects/<slug>.mdx` — one file per project. Eight today: `musicforge.mdx`, `split-recording.mdx`, `rocksculpture.mdx`, `prntd.mdx`, `recountly.mdx`, `ibuild4you.mdx`, `prompt-lab.mdx`, `selected-projects.mdx`. Each has:

- **Frontmatter** (`export const metadata = { ... }`) — the project's `name`, `tagline`, `status`, `category`, `url`, and `github` repo slug. Status must be one of `live`, `beta`, `alpha`, `demo`, `concept`; category one of `music`, `art`, `products`, `tools`. Category decides which section of the home page the project appears under; section order lives in `lib/projects.ts`. Optional `cardImage` sets a curated card image (`/cards/<slug>.jpg`, see `assets/README.md`) that overrides the live `og:image` scrape.
- **Body** — the prose description shown on `/projects/<slug>`. Plain markdown. Paragraph breaks are blank lines.

To add a new project: drop a new `.mdx` file here, then add an import line to `lib/projects.ts`.

## What you generally don't edit

- `lib/projects.ts` — TypeScript that imports the project MDX files. Edit only when adding/removing a project (one new import line per addition).
- `app/projects/[slug]/page.tsx`, `app/about/page.tsx`, `app/page.tsx`, `app/connect/page.tsx` — layout chrome. Edit if you want to change page *structure*, not its words.
- `components/nav.tsx`, `app/layout.tsx`, `app/opengraph-image.tsx` — read from `content/site.ts`. Edit `site.ts` instead.

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
