# Environments

Three tiers. The rule: **only production talks to the production database.** Local and preview get their own stores, so routine dev/testing can't damage prod data.

| Tier | Deploy | Database | Email |
|---|---|---|---|
| Local | `npm run dev` | `file:dev.db` (gitignored SQLite) | magic links log to console; connect/note alerts still send via Resend |
| Preview | Vercel preview deploys | Turso `pianohouse-preview` | real Resend key — sends real mail |
| Production | Vercel production | Turso prod DB | real Resend key |

## Local dev

`.env.local` (regenerate via `op inject -i .env.tpl -o .env.local`) points `TURSO_DATABASE_URL` at `file:dev.db` — no auth token needed for `file:` URLs (`lib/db.ts`, `scripts/migrate.mjs` both allow it).

Create or refresh the schema, then populate it:

```
npm run db:migrate
npm run db:seed
```

`db:seed` inserts two `@localhost` users with follows and notes (`scripts/seed-dev.mjs`). It refuses any non-`file:` URL outright, and re-running only replaces its own `seed-user-*` rows.

Deliberate prod access from local (rare; e.g. deleting a test user): swap in the commented `op://` lines in `.env.tpl`, re-inject, and swap back after. Or use `turso db shell`.

Both scripts print the URL they target. `db:migrate` against a remote DB requires `--remote` (`npm run db:migrate -- --remote`) — a leftover `libsql://` in `.env.local` otherwise means an unintended preview/prod migration.

## Preview

Vercel Preview env vars point at the `pianohouse-preview` Turso DB (created 2026-07-04). Same schema, applied with `scripts/migrate.mjs --remote`. Data there is disposable — wipe and re-migrate freely.

## Prod smoke tests

Testing against prod is sometimes the point (auth, email delivery). Convention:

- Use plus-addressed accounts: `nlovejoy+<label>@me.com` — distinct user to the app, lands in the real inbox.
- Clean up after: delete the user's `sessions`, `magic_tokens`, `follows`, `notes`, then the `users` row.

## Hardening roadmap (iterative)

Done:

1. Local dev isolated to `file:dev.db` (2026-07-04).
2. Preview isolated to `pianohouse-preview` DB; preview `AUTH_FROM_EMAIL` un-pinned from a deleted branch so magic links work on previews (2026-07-04).
3. Dev email safety — local dev logs magic links to the console and never calls Resend for them (2026-07-05).
4. Note moderation — email alert to `CONNECT_TO_EMAIL` on every new note; `ADMIN_EMAIL` (env var, all tiers) grants delete-any-note; authors can delete their own (2026-07-05).
5. Sign-in anti-bot — honeypot field on the form (fakes success), rate limits via `magic_tokens`: 3 links per email + 10 per IP per 15 min, and 5 notes per user per hour (2026-07-05).
6. Seed script + migrate guard — `scripts/seed-dev.mjs` (`file:` only), and `migrate.mjs` now requires `--remote` for non-`file:` URLs after an agent unintentionally ran it against the remote DB a stale `.env.local` was pointing at (2026-07-19).

Next, in rough order of value:

7. **Prod backup habit** — `turso db shell <prod> .dump > backup.sql` before any schema migration; Turso point-in-time restore covers the rest.
8. **Preview email split** — separate Resend key (or at least a distinct from-address) for preview, so preview sends are distinguishable and revocable.
