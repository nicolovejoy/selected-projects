# Editing the site

Where the visible text lives, by file. Most edits happen in `content/`.

## Project content

`content/projects/<slug>.mdx` — one file per project. Five files today: `musicforge.mdx`, `ibuild4you.mdx`, `prntd.mdx`, `lojong.mdx`, `prompt-lab.mdx`. Each has:

- **Frontmatter** (`export const metadata = { ... }`) — the project's `name`, `tagline`, `status`, `url`, and `github` repo slug. Status must be one of `live`, `beta`, `alpha`, `demo`, `concept`.
- **Body** — the prose description shown on `/projects/<slug>`. Plain markdown. Paragraph breaks are blank lines.

To add a new project: drop a new `.mdx` file here, then add an import line to `lib/projects.ts`.

## Standalone pages

`content/about.mdx` — body of the `/about` page (the headline "About" lives in `app/about/page.tsx`).

## Site chrome and inline copy

These are still TSX files (small enough that they don't warrant MDX yet — easy to migrate later if you want):

- `app/page.tsx` — home hero: the "Piano House" headline and the one-paragraph intro under it.
- `app/connect/page.tsx` — the heading and the line above the connect form.
- `components/nav.tsx` — header nav labels (Projects / About / Connect) and the footer line.
- `app/layout.tsx` — site `<title>` and meta `description`. These show up in browser tabs, Google results, and shared link previews.

## What you generally don't edit

- `lib/projects.ts` — TypeScript that imports the MDX files and exposes them to pages. Edit only when adding/removing a project (one new import line per addition).
- `app/projects/[slug]/page.tsx` and `app/about/page.tsx` — the layout chrome around the MDX content. Edit if you want to change the *structure* of a project page, not its words.

## How to preview an edit

```
npm run dev
```

Open http://localhost:3000. Most content edits hot-reload without a restart. Save the file and the page refreshes.

## How to deploy an edit

Commit and push to `main`. Vercel auto-deploys to https://pianohouseproject.org within ~2 minutes.

```
git add -A && git commit -m "Update <whatever>" && git push
```
