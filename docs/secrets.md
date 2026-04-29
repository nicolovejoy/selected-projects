# Storing project secrets in 1Password

Pattern for getting service credentials (DB URLs, auth tokens, API keys) into the
shared `dev-secrets` 1Password vault, then referencing them from a `.env.tpl` via
`op://` so `op inject` can materialize a real `.env.local` on demand.

This file documents the manual flow used when standing up a new service for a
project. Repeat per-service.

## Conventions

- **Vault:** `dev-secrets` (shared with collaborators).
- **Category:** `password` for simple key/value secrets. The secret value goes
  into the item's `password` field. One item per logical credential — e.g.
  `pianohouse-turso-url` and `pianohouse-turso-auth-token` are two separate items,
  not one combined item.
- **Naming:** `<project>-<service>-<credential>`. Lowercase, hyphenated. Examples:
  - `pianohouse-turso-url`
  - `pianohouse-turso-auth-token`
  - `pianohouse-resend-api-key`
- **Reference path:** `op://dev-secrets/<item>/password`.

## 1. Mint the credential

Whatever the service's CLI is, get the secret onto your clipboard cleanly. The
canonical pattern (Turso shown; substitute for other providers):

verify on screen and copy to clipboard

```
turso db tokens create <db> | tee /dev/tty | tr -d '\n' | pbcopy
```

silent (no on-screen display, for shared screens)

```
turso db tokens create <db> | tr -d '\n' | pbcopy
```

The `tr -d '\n'` matters — without it a trailing newline ends up on the
clipboard, which terminates `read -rs` prompts on paste.

For credentials that come from a web dashboard (Resend API key, Stripe key,
etc.), copy from the UI and skip step 1.

## 2. Save into 1Password

For non-sensitive values (a URL, a public hostname), pass directly:

```
op item create --category=password --vault=dev-secrets --title=<item-name> password='<value>'
```

For sensitive values (tokens, API keys), use `read -rs` so the secret never
lands in shell history. Run the line, paste at the prompt (no echo), hit enter:

```
read -rs SECRET && op item create --category=password --vault=dev-secrets --title=<item-name> password="$SECRET" && unset SECRET
```

## 3. Verify

Metadata-only check, safe to run anywhere:

```
op item list --vault dev-secrets | grep <project>
```

## 4. Clean up the clipboard

```
pbcopy < /dev/null
```

## 5. Reference from `.env.tpl`

Commit a `.env.tpl` to the repo with `op://` references in place of values:

```
TURSO_DATABASE_URL=op://dev-secrets/pianohouse-turso-url/password
TURSO_AUTH_TOKEN=op://dev-secrets/pianohouse-turso-auth-token/password
RESEND_API_KEY=op://dev-secrets/pianohouse-resend-api-key/password
```

To materialize a usable `.env.local`:

```
op inject -i .env.tpl -o .env.local
```

`.env.local` stays gitignored. `.env.tpl` is checked in and tells anyone who
clones the repo (with access to the vault) exactly which secrets they need.

## Notes

- For a Vercel-deployed app, production secrets live in Vercel's env-var settings,
  not 1Password. 1Password is for local dev. The two stay in sync by convention.
- The hook at `~/.claude/hooks/block-secrets.sh` blocks Claude from running any
  `op` command that would return a secret value — `op read`, `op inject`,
  `op item get`, etc. Metadata commands (`op item list`, `op vault list`) are
  allowed. Run the secret-fetching commands yourself.
