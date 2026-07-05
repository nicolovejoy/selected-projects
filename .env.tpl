# Local dev uses a local SQLite file (no token). Init/refresh with: npm run db:migrate
# Prod/preview credentials live in Vercel env vars. For deliberate prod access, swap in:
#   TURSO_DATABASE_URL=op://dev-secrets/pianohouse-turso-url/password
#   TURSO_AUTH_TOKEN=op://dev-secrets/pianohouse-turso-auth-token/password
TURSO_DATABASE_URL=file:dev.db
RESEND_API_KEY=op://dev-secrets/pianohouse-resend-api-key/password
CONNECT_FROM_EMAIL=connect@mail.pianohouseproject.org
AUTH_FROM_EMAIL=the piano house project <noreply@mail.pianohouseproject.org>
CONNECT_TO_EMAIL=nlovejoy@me.com
GITHUB_TOKEN=op://dev-secrets/github-pat-readonly/password