<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Sourcing project copy

Before drafting taglines/descriptions for the five featured projects in `lib/projects.ts`, run `/ask` for each project to pull recent session summaries and weekly rollups from the prompt-history store. Those reflect current direction and active work; the in-repo READMEs often lag (or are still create-next-app boilerplate). Confirm copy with Nico before committing.

Projects: musicforge, ibuild4you, prntd, lojong (repo: `~/src/am-i-an-ai`), prompt-lab.

## Where editable text lives

See `docs/editing.md` for the canonical map. All visible copy lives in `content/`: pages are MDX (`home.mdx`, `connect.mdx`, `about.mdx`, `projects/*.mdx`) and site-wide strings (title, description, footer tagline, nav labels) are in `content/site.ts`. Site is live at `https://pianohouseproject.org` (Vercel).

## Local checks

`npm run check` validates content/ — project frontmatter, status enum, image references, hero registry, `homeHero` resolution. A `simple-git-hooks` pre-push runs `check` + `next build` automatically; bypass with `SKIP_SIMPLE_GIT_HOOKS=1 git push` if you really need to.

## Next steps

- **Email — finish wiring**: `nico@pianohouseproject.org` and `nico@ibuild4you.com` receive via iCloud+ Custom Domain (Cloudflare DNS, Apple-managed records). Still TODO: verify the domain in Resend, **merge** Resend's SPF into the existing iCloud SPF TXT (one record only — `v=spf1 include:icloud.com include:_spf.resend.com ~all`), then update `CONNECT_TO_EMAIL` and `CONNECT_FROM_EMAIL` in Vercel env vars. Test connect form on prod once verified.
- **Project screenshots**: scaffold ready (`image?` field on ProjectMeta, render under header, compress script handles nested slugs). Drop files at `assets/originals/projects/<slug>.<ext>`, run `node scripts/compress-image.mjs projects/<slug>`, add `image: "/projects/<slug>.jpg"` to each MDX.
- **Tidy `content/projects/prompt-lab.mdx`** — only project not yet reviewed in the copy pass.
- Consider adding `@tailwindcss/typography`-friendly `prose` modifiers if project pages start growing headings, lists, or block elements.
- Add Vercel preview-env vars (Turso/Resend) once branching workflow starts. Production-only is intentional for alpha.
- Tune the home hero `object-position` if a future photo's framing wants a different crop.
