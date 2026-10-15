# Built with iBuild4You — showcase plan

**Spec (agreed with Nico 2026-10-14, mockup https://claude.ai/artifact/VU6NfbUZ2whZiYmyLZUGix board B):**
Projects made through iBuild4You are ordinary project pages in their natural category, carrying an optional boolean flag. The ibuild4you detail page shows a card grid of every flagged project; images are optional. No people's names anywhere (no credit field). Launch set: Tideline and Bakery Louise. L6 later (permission pending); Label-Me held.

## Global Constraints

- Frontmatter field name: `ibuild4you` (boolean, optional; absent = false). Must not be set on the `ibuild4you` project itself.
- No new category. `ProjectCategory` stays `"music" | "art" | "products" | "tools"`.
- Every reader-facing string lives in `content/strings.ts` with both `en` and `fr` (`fr: Strings` is typed as `typeof en`). No inline copy in components.
- Card image precedence matches `components/og-preview.tsx`: `cardImage ?? og?.image ?? image`; no image → text-only card (no placeholder box).
- Visual language: existing tokens/utilities only (`mono-label`, `font-serif`, `border-neutral-200`, 2px radii via `rounded-md`). Match `components/feed-card.tsx` / mockup board B.
- Must keep every page route `◐ Partial Prerender`; `getOgPreview` is already `'use cache: remote'` — call it, don't re-fetch.
- Verify with: `npm run check`, `npx tsc --noEmit` (run `npx next typegen` first if phantom module errors), `npm run build`, `npx playwright test`.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never mention the local env filename in commands or messages.

## Task 1: Flag, helper, validation

Files: `lib/projects.ts`, `scripts/check-content.mjs`.

- Add to `ProjectMeta`, after `embed`:
  ```ts
  /** Made through iBuild4You. Listed in the grid on the ibuild4you page and
   *  labelled in the detail header. Absent = false. */
  ibuild4you?: boolean;
  ```
- Add to `lib/projects.ts`:
  ```ts
  /** Projects built through iBuild4You, localized, in `projects` order. */
  export function builtWithIbuild4you(locale: Locale = "en"): Project[] {
    return localizedProjects(locale).filter((p) => p.ibuild4you && p.slug !== "ibuild4you");
  }
  ```
- `check-content.mjs`, inside the per-project meta validation next to the `embed` block:
  ```js
  if (meta.ibuild4you !== undefined) {
    expect(typeof meta.ibuild4you === "boolean", `${fullPath}: ibuild4you must be a boolean`);
    expect(
      !(meta.ibuild4you && path.parse(fullPath).name === "ibuild4you"),
      `${fullPath}: the ibuild4you project can't flag itself`,
    );
  }
  ```
  (Adapt variable names to what the surrounding loop actually uses.)
- Verify: `npm run check` passes; temporarily set `ibuild4you: "yes"` in one MDX to see the check fail, then revert (do not commit the bad value). `npx tsc --noEmit` clean.

## Task 2: Grid section + header label

Files: `content/strings.ts`, new `components/project/built-with-grid.tsx`, `components/pages/project.tsx`.

- Strings, under `project` in `en`:
  ```ts
  builtWith: "built with iBuild4You",
  builtWithIntro: "Things people dreamed up and built through it. Each one is theirs.",
  ```
  and `sections.builtWith: "built with iBuild4You"`. In `fr`:
  ```ts
  builtWith: "réalisé avec iBuild4You",
  builtWithIntro: "Des idées que d’autres ont imaginées et construites grâce à lui. Chacune leur appartient.",
  ```
  and `sections.builtWith: "réalisé avec iBuild4You"`.
- `BuiltWithGrid({ projects, locale })`: async server component. `<ul>` grid `grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5`. Each `<li>` is a card (`border border-neutral-200 rounded-md overflow-hidden`, hover `border-neutral-400`) whose whole surface links to `localePath(locale, \`/projects/${slug}\`)` (single `<Link>` wrapping content — no nested anchors). Inside: optional `<img>` (aspect `1200/630`, `object-cover`, `bg-neutral-100`, alt from `strings[locale].project.previewAlt(name)`, plain `<img>` with the same eslint-disable comment as og-preview); then padding block with `mono-label` category (`strings[locale].categories[category]`), serif name (`font-serif text-[1.375rem]`), tagline (`text-sm text-neutral-600`). Image: `p.cardImage ?? (p.url ? (await getOgPreview(p.url))?.image : undefined) ?? p.image`; resolve all with `Promise.all`.
- `components/pages/project.tsx`:
  - After the about `CollapsibleSection`, when `slug === "ibuild4you"` and `builtWithIbuild4you(locale)` is non-empty: `<CollapsibleSection title={t.sections.builtWith} defaultOpen>` containing `<p className="font-serif italic text-neutral-600 mb-5">{t.builtWithIntro}</p>` and the grid inside `<Suspense>` (fallback: a `div` with `h-40 animate-pulse rounded-md bg-neutral-100`).
  - In the header's category/status row, when `project.ibuild4you`: another `·` separator then `<Link href={localePath(locale, "/projects/ibuild4you")} className="mono-label underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900">{t.builtWith}</Link>`.
- Until Task 3 lands nothing is flagged, so the section renders nothing; to eyeball, temporarily flag an existing project locally (don't commit). Verify tsc + build (all page routes still `◐`).

## Task 3: Launch content + e2e

Files: `content/projects/tideline.mdx`, `content/projects/bakerylouise.mdx`, `content/fr/projects/tideline.mdx`, `content/fr/projects/bakerylouise.mdx`, `lib/projects.ts` (imports + `entries` + `frEntries`), new `e2e/built-with.spec.ts`.

- Copy is supplied by the controller in the dispatch, approved by Nico — use verbatim.
- Frontmatter: tideline → `category: "products"`, `url: "https://tideline.ibuild4you.com"`, `github: "tideline"`, `ibuild4you: true`. bakerylouise → `category: "products"`, `url: "https://bakerylouise.com"`, `ibuild4you: true`, no `github` (private repo). Status and `historyKey` come with the copy.
- e2e (`e2e/built-with.spec.ts`):
  1. `/projects/ibuild4you`: section summary "built with iBuild4You" is open; it contains links named Tideline and Bakery Louise pointing at `/projects/tideline` and `/projects/bakerylouise`.
  2. `/fr/projects/ibuild4you`: section "réalisé avec iBuild4You" with links to `/fr/projects/tideline` and `/fr/projects/bakerylouise`.
  3. `/projects/tideline`: header has a link "built with iBuild4You" → `/projects/ibuild4you`.
  4. `/projects/musicforge`: no such label and no such section.
- Verify: check, tsc, build, full `npx playwright test`.
