<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Sourcing project copy

Before drafting taglines/descriptions for the five featured projects in `lib/projects.ts`, run `/ask` for each project to pull recent session summaries and weekly rollups from the prompt-history store. Those reflect current direction and active work; the in-repo READMEs often lag (or are still create-next-app boilerplate). Confirm copy with Nico before committing.

Projects: musicforge, ibuild4you, prntd, lojong (repo: `~/src/am-i-an-ai`), prompt-lab.

## Where editable text lives

See `docs/editing.md` for the canonical map. Project descriptions and `/about` are MDX (`content/`). Home hero, `/connect` intro, footer, nav labels, and site `<title>`/description are still inline TSX. Site is live at `https://pianohouseproject.org` (Vercel).

## Next steps

- Consolidate all editable copy into `content/` MDX. Move home hero, `/connect` intro, and the footer tagline out of TSX into MDX files so editors only ever touch `content/`.
- Consider adding `@tailwindcss/typography`-friendly `prose` modifiers if project pages start growing headings, lists, or block elements (currently just paragraphs).
- Add Vercel preview-env vars (Turso/Resend) once branching workflow starts. Production-only is intentional for alpha.
- Tune the home hero `object-position` if a future photo's framing wants a different crop than `object-right`.
