import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || (!authToken && !url.startsWith("file:"))) {
  console.error("TURSO_DATABASE_URL must be set (TURSO_AUTH_TOKEN too, unless file:)");
  process.exit(1);
}

const db = createClient(authToken ? { url, authToken } : { url });

await db.execute(`
  CREATE TABLE IF NOT EXISTS connect_submissions (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    project TEXT NOT NULL,
    intents TEXT,
    message TEXT NOT NULL,
    user_agent TEXT,
    ip TEXT,
    geo_city TEXT,
    geo_region TEXT,
    geo_country TEXT,
    referer TEXT,
    links TEXT
  )
`);

// Idempotent column adds for tables created by an earlier migration.
const info = await db.execute(`PRAGMA table_info(connect_submissions)`);
const existing = new Set(info.rows.map((r) => r.name));
const newColumns = [
  ["ip", "TEXT"],
  ["geo_city", "TEXT"],
  ["geo_region", "TEXT"],
  ["geo_country", "TEXT"],
  ["referer", "TEXT"],
  ["links", "TEXT"],
];
for (const [name, type] of newColumns) {
  if (!existing.has(name)) {
    await db.execute(`ALTER TABLE connect_submissions ADD COLUMN ${name} ${type}`);
    console.log(`  + added ${name}`);
  }
}

await db.execute(
  `CREATE INDEX IF NOT EXISTS idx_connect_submissions_created_at
     ON connect_submissions(created_at DESC)`
);

// --- auth: users, magic tokens, sessions ---
await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);
await db.execute(`
  CREATE TABLE IF NOT EXISTS magic_tokens (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    ip TEXT
  )
`);
{
  const cols = await db.execute(`PRAGMA table_info(magic_tokens)`);
  if (!cols.rows.some((r) => r.name === "ip")) {
    await db.execute(`ALTER TABLE magic_tokens ADD COLUMN ip TEXT`);
    console.log("  + added magic_tokens.ip");
  }
}
await db.execute(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);
await db.execute(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`);

// --- community: follows + notes ---
await db.execute(`
  CREATE TABLE IF NOT EXISTS follows (
    user_id TEXT NOT NULL REFERENCES users(id),
    project TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, project)
  )
`);
await db.execute(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    project TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id),
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);
await db.execute(`CREATE INDEX IF NOT EXISTS idx_notes_project ON notes(project, created_at DESC)`);
await db.execute(`CREATE INDEX IF NOT EXISTS idx_follows_project ON follows(project)`);

console.log("✓ schema applied");
process.exit(0);
