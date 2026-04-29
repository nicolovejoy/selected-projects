import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set");
  process.exit(1);
}

const db = createClient({ url, authToken });

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

console.log("✓ schema applied");
process.exit(0);
