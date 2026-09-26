# Issue #23 — rate-limit the connect form

Issue: https://github.com/nicolovejoy/selected-projects/issues/23
Spec: the issue body plus the decisions below (agreed with Nico 2026-09-26). There is no separate spec doc; this plan is the spec.

## Goal

`submitConnect` (`app/connect/actions.ts`) has no abuse control beyond the honeypot. Add a per-key rolling one-hour rate limit, counted from the existing `connect_submissions` table.

## Decisions (binding)

- **No new table, no migration, no index.** `connect_submissions` already stores `email`, `ip` (truncated to /24 or a /48-ish IPv6 prefix by `truncateIp`) and `created_at` (`datetime('now')` text) per row. Count rows in the last hour.
- **Limits:** 5 submissions per rolling hour per email; 10 per rolling hour per IP.
- **Keys:** signed in → email only (the session email; it's 1:1 with the user and the table has no user id). Signed out → email AND IP; exceeding **either** limit drops the submission. A null IP means the IP key does not apply.
- **Email comparison is case-insensitive** (`lower(email) = lower(?)`), so `A@x.com` and `a@x.com` share a bucket.
- **Over the limit → behave exactly like the honeypot:** return `{ ok: true, message: "Thanks — we'll be in touch." }` with no DB insert and no email sent.
- **Fail open:** if the count query throws, log `console.error("[connect] rate check failed", err)` and continue to the normal insert path. A rate-limit outage must not block real messages.
- The check runs **after** validation (so invalid input still gets its error) and **before** the insert.

## Context every task needs

- Next.js 16.2.4 (`cacheComponents: true`). This is not the Next.js in your training data; nothing in this plan touches caching, but read `node_modules/next/dist/docs/` before using any Next API you're unsure of.
- DB access: `db()` from `lib/db.ts` returns a `@libsql/client` client. Existing pattern to mirror: `countRecentNotes` in `lib/community.ts:110`.
- Email sending is disabled in e2e (`EMAIL_DISABLED=1` in `playwright.config.ts`), so tests never send mail.
- The e2e server runs against `file:.playwright/e2e.db`, which is **not reset between runs** (migrate + seed only). Tests that insert connect rows must clean up their own rows first.
- The secrets hook blocks any shell command whose text contains the dot-env filename. Never cat/grep env files; you don't need them.

## Global Constraints

- `ConnectFormState` and `submitConnect`'s signature stay unchanged. `app/connect/form.tsx` needs no edits.
- The honeypot keeps its current behavior and message.
- Verification for every task: `npx tsc --noEmit`, `npm run check`, and `npx playwright test` all green. Kill nothing you didn't start; if port 3199 is already taken, report it instead of killing it.

## Task 1: Count helper + the check in `submitConnect`

**Files:** create `lib/connect.ts`; modify `app/connect/actions.ts`.

`lib/connect.ts` — complete contents:

```ts
import { db } from "@/lib/db";

export const MAX_CONNECTS_PER_EMAIL_PER_HOUR = 5;
export const MAX_CONNECTS_PER_IP_PER_HOUR = 10;

/**
 * Submissions in the last rolling hour for this email (case-insensitive) and
 * this truncated IP. A null ip counts 0 — the IP key doesn't apply.
 */
export async function countRecentConnects(
  email: string,
  ip: string | null,
): Promise<{ byEmail: number; byIp: number }> {
  const res = await db().execute({
    sql: `SELECT
            COALESCE(SUM(lower(email) = lower(?)), 0) AS by_email,
            COALESCE(SUM(ip = ?), 0) AS by_ip
          FROM connect_submissions
          WHERE created_at > datetime('now', '-1 hour')`,
    args: [email, ip],
  });
  const row = res.rows[0];
  return { byEmail: Number(row?.by_email ?? 0), byIp: Number(row?.by_ip ?? 0) };
}
```

`app/connect/actions.ts` changes:

1. Add a module constant `const THANKS = "Thanks — we'll be in touch.";` and use it for the honeypot return and the final success return (both currently inline that string).
2. Import `countRecentConnects`, `MAX_CONNECTS_PER_EMAIL_PER_HOUR`, `MAX_CONNECTS_PER_IP_PER_HOUR` from `@/lib/connect`.
3. Immediately after the `const id = crypto.randomUUID();` line and before the insert `try`, add:

```ts
  // Rate limit — over either key, drop it silently like the honeypot. Signed-in
  // users are keyed on their session email only; a shared network shouldn't
  // block them. A failed check fails open: better a burst than a lost message.
  try {
    const recent = await countRecentConnects(email, ip);
    const overEmail = recent.byEmail >= MAX_CONNECTS_PER_EMAIL_PER_HOUR;
    const overIp = !sessionUser && recent.byIp >= MAX_CONNECTS_PER_IP_PER_HOUR;
    if (overEmail || overIp) {
      console.warn(`[connect] rate limited (${overEmail ? "email" : "ip"})`);
      return { ok: true, message: THANKS };
    }
  } catch (err) {
    console.error("[connect] rate check failed", err);
  }
```

Do not log the email or IP value.

**Verify:** `npx tsc --noEmit`, `npm run check`, `npx playwright test` (existing suite must stay 25/25 green). Commit: `Connect form: per-email and per-IP hourly rate limit (#23)`.

## Task 2: e2e coverage

**Files:** create `e2e/connect-rate-limit.spec.ts`.

The file runs its tests **serially** (`test.describe.configure({ mode: "serial" })`) because both tests' rows count against the same local IP.

Helpers (in the spec file):

- `cleanup()`: open `createClient({ url: "file:.playwright/e2e.db" })` (same constant as `e2e/auth.ts`), run `DELETE FROM connect_submissions WHERE email = 'dev@localhost' OR email LIKE '%@e2e.test'`, close. Call it at the start of each test.
- `rowsFor(email)`: count rows in `connect_submissions` with that email.
- `submit(page, fields)`: `page.goto("/connect")`, fill Name/Email when given (signed-out only), fill Message, click **Send**, then expect the text `Thanks — we'll be in touch.` to be visible. The form is a `useActionState` server-action form; if clicks prove flaky before hydration, wrap click-then-assert in `expect(...).toPass()` — the pattern and reason are in AGENTS.md gotcha "A plain `<button>` has no pre-hydration fallback" — but a retry must not double-submit: check `rowsFor` rather than trusting the click count.

Tests:

1. **Signed-in, email key** — `test.use({ storageState: STORAGE_STATE })` (import from `./auth`; the `setup` project already mints the session). Submit 6 times. Every submission shows the thanks text. Assert `rowsFor("dev@localhost") === 5`.
2. **Signed-out, IP key** — no storage state. Submit once with a unique `@e2e.test` email, then read that row's `ip`. If it is null, `test.skip(true, "no forwarded IP on the local server — IP key can't be exercised")`. Otherwise submit with fresh unique `@e2e.test` emails (≤ 4 per email so the email key never trips) until 10 rows exist for that IP, then submit once more with another fresh email: it shows the thanks text, and the IP's row count stays 10.

Name/Email/Message fields: labels `Name`, `Email`, and the message textarea (check `app/connect/form.tsx` for its label). Unique emails: `` `rl-${Date.now()}-${n}@e2e.test` ``.

Signed-in tests live in `e2e/signed-in.spec.ts` today; check how it applies `STORAGE_STATE` and mirror that.

**Verify:** full `npx playwright test` green (27 tests, or 26 + 1 skipped — report which, and if skipped, say so plainly). Run the new spec twice back-to-back to prove re-runs within the hour pass. Commit: `e2e: connect rate limit coverage (#23)`.
