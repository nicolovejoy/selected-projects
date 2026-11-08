# Roadmap: next work after the home redesign (2026-11-07)

Written at the close of the 2026-11-07 session. Home redesign (#42, #43, #44, `901730f`) is live. Everything below is verified against `main` at `901730f`, not against CLAUDE.md prose. Work items are ordered by what a hiring manager sees first.

Model guidance: items 1–3 are bounded, well-specified fixes with a clear pass/fail. **Sonnet** is the right implementer for all three; Fable or Opus reviews the diff. Item 4 needs Nico, not a model. Item 5 is deferred.

Rules that apply to every item: branch off `main`, PR, `npm run check` + `npx tsc --noEmit` + the relevant e2e spec before asking for review. Reader-facing text goes in `content/strings.ts` with its French twin. Never read any `.env` file. Playwright headless only.

## 1. Contribution count: 6,216 shown vs 12,600+ claimed

**Where.** `lib/github.ts:186`, the GraphQL query in `getUserContributions`:

```
{ user(login: "…") { contributionsCollection { contributionCalendar { totalContributions weeks { … } } } } }
```

**Why it's low.** `contributionCalendar.totalContributions` counts public contributions plus private ones only when the viewer is the user themself *and* the token has `read:user`. The 12,600 figure came from Nico's own logged-in GitHub profile, which includes private repos. Two possible gaps:
- the `GITHUB_TOKEN` in Vercel is a fine-grained or classic token without `read:user` (so private contributions are excluded), or
- the token belongs to the account but the profile setting "Include private contributions on my profile" is off, in which case even the API returns the public-only number.

**Steps.**
1. Locally, with the token via `op run --env-file=.env.tpl -- node -e …`, query `contributionsCollection { totalContributions restrictedContributionsCount }`. `restrictedContributionsCount` is the private count the calendar is excluding. If it's ~6,400, the token is fine and the gap is the private setting; if it's 0, the token lacks scope.
2. If scope: Nico mints a classic token with `read:user` (plus `public_repo` if the repo-count query needs it), stores it in 1Password, updates Vercel with `vercel env add GITHUB_TOKEN production --sensitive --value "$(op read op://…)"` (CLAUDE.md gotcha 14: never pipe stdin). Redeploy with `vercel redeploy --target production`.
3. If the profile setting: Nico flips it at https://github.com/settings/profile ("Contributions & activity"). No code change.
4. Either way, the `hours` cache on `getUserContributions` means prod updates within the hour; confirm with `curl -s https://www.pianohouseproject.org/ | grep -o "[0-9,]* contributions"`.

**Done when** the home proof line shows a number within 5% of Nico's profile page. If the honest number stays near 6,200, change the brief, not the code: the proof line is still true.

## 2. Playwright on Edge

**Where.** `playwright.config.ts:26`, project `chromium` uses `devices["Desktop Chrome"]`. Convention (CLAUDE.md "Browser testing runs headless") says desktop runs use Edge via `channel: "msedge"`.

**Steps.** Add `channel: "msedge"` to that project's `use`, keep the project name (specs and CI filters may reference `chromium`; grep first). Run the full suite locally: `npx playwright test` (34 tests + setup). CI (`.github/workflows/check.yml:35`) installs only Chromium with `npx playwright install --with-deps chromium`, and Edge isn't guaranteed on the runner image, so scope the channel to local runs: `channel: process.env.CI ? undefined : "msedge"`, with a one-line comment saying why. Leave the workflow alone.

**Done when** the suite passes locally on Edge and CI stays green.

## 3. Issue #32: `truncateIp` mangles compressed IPv6

**Where.** `components/connect/actions.ts`, `truncateIp` (~line 25). It splits on `:` and `filter(Boolean)`s, so `::` compression loses its zero groups: `2001:db8::5` → `2001:db8:5::` instead of the `/48` prefix `2001:db8:0::`. Since PR #31 this is the connect-form rate-limit key (10/hr per truncated IP), so a bad prefix splits a bucket. Low impact, but it's a correctness bug with a two-line fix.

**Steps.** Expand `::` to the right number of zero groups before taking the first three. Add a unit test. `package.json` has no vitest or `test` script, so export `truncateIp` and cover it with a `node --test` file at `scripts/truncate-ip.test.mjs` (plain Node, no new dependency), wired into `npm run check` or a new `test:unit` script. Don't add a test framework for one function. Cases from the issue: `2001:db8::5`, `::1`, a full uncompressed address, and an IPv4 address unchanged. Close #32 from the PR body.

**Done when** the three IPv6 cases produce the expected `/48` prefixes and `e2e/connect-rate-limit.spec.ts` still passes.

## 4. French copy review (Nico or a native reader, not a model)

`fr.site.translationNote` in `content/strings.ts` still discloses machine translation. The home redesign added new French strings (`hard`/`facts` in `content/fr/projects/*.mdx`, `strings.home.*`) that have had one machine pass and no human read. When a human has been through them, clear the note. No model task here beyond assembling a review sheet if Nico asks.

## 5. Deferred, unchanged

- Issue #34 Spanish / N-locale switcher: not before Nico is back from France.
- Tier 2 disclosure (garm wiring), follower email digest, Bakery Louise `og:image` (that repo's job).
- ibuild4you signed-out home mocks: filed in `~/src/.handoff/selected-projects-ibuild4you.md`, theirs to build.

## Suggested session shape

One Sonnet session, items 2 then 3 (both pure code, ~30 minutes together), one PR each. Item 1 in parallel as a Nico-driven check, since the likely outcome is a token or profile-setting change with no code. Review each PR with `/code-review medium` before merge.
