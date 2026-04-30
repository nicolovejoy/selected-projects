# Editing the site

All visible copy lives in `content/`. Pages and layout chrome import from there — you should not need to touch TSX files for word changes.

## Site-wide strings

`content/site.ts` — small strings that appear in chrome:

- `title` — site name (browser tab, header link, footer tagline, OG image).
- `description` — one-line description (meta description, OG, Twitter card, OG image).
- `footerTagline` — full footer line ("Piano House Project — explorations in AI and vibe-coding.").
- `navLabels` — header nav labels (`projects`, `about`, `connect`).

## Standalone pages

`content/home.mdx` — home hero. `metadata.title` is the H1; the body is the intro paragraph below it.

`content/connect.mdx` — `/connect` page. `metadata.title` is the H1; the body is the line above the connect form.

`content/about.mdx` — `/about` page body. `metadata.title` is exported but currently unused (the H1 is hardcoded as "About" in `app/about/page.tsx`).

## Project content

`content/projects/<slug>.mdx` — one file per project. Five today: `musicforge.mdx`, `ibuild4you.mdx`, `prntd.mdx`, `lojong.mdx`, `prompt-lab.mdx`. Each has:

- **Frontmatter** (`export const metadata = { ... }`) — the project's `name`, `tagline`, `status`, `url`, and `github` repo slug. Status must be one of `live`, `beta`, `alpha`, `demo`, `concept`.
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

Commit and push to `main`. Vercel auto-deploys to https://pianohouseproject.org within ~2 minutes.

```
git add -A && git commit -m "Update <whatever>" && git push
```
