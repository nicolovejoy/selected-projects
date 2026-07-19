import { readdirSync } from "node:fs";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error("TURSO_DATABASE_URL must be set");
  process.exit(1);
}
if (!url.startsWith("file:")) {
  console.error(`refusing to seed a non-local database (${url.split(":")[0]}:…) — file: URLs only`);
  process.exit(1);
}

const SEED_DOMAIN = "@localhost";
const users = [
  { id: "seed-user-dev", email: `dev${SEED_DOMAIN}`, name: "Dev User" },
  { id: "seed-user-visitor", email: `visitor${SEED_DOMAIN}`, name: "Casey Visitor" },
];
const follows = [
  ["seed-user-dev", "musicforge"],
  ["seed-user-dev", "prompt-lab"],
  ["seed-user-dev", "recountly"],
  ["seed-user-visitor", "musicforge"],
  ["seed-user-visitor", "prntd"],
];
const notes = [
  ["seed-note-1", "musicforge", "seed-user-dev", "Seeded note — the arrangement view is the part I keep coming back to."],
  ["seed-note-2", "musicforge", "seed-user-visitor", "Seeded note — how does this handle stems that are already mixed?"],
  ["seed-note-3", "prompt-lab", "seed-user-dev", "Seeded note — weekly rollups are the feature that made this stick."],
  ["seed-note-4", "recountly", "seed-user-visitor", "Seeded note — tried it on a month of receipts, held up fine."],
];

const slugs = new Set(readdirSync("content/projects").map((f) => f.replace(/\.mdx$/, "")));
const referenced = [...follows.map(([, p]) => p), ...notes.map(([, p]) => p)];
const unknown = referenced.filter((p) => !slugs.has(p));
if (unknown.length) {
  console.error(`unknown project slug(s): ${[...new Set(unknown)].join(", ")}`);
  process.exit(1);
}

const db = createClient({ url });
const ids = users.map((u) => u.id);
const placeholders = ids.map(() => "?").join(", ");

await db.execute({ sql: `DELETE FROM notes WHERE user_id IN (${placeholders})`, args: ids });
await db.execute({ sql: `DELETE FROM follows WHERE user_id IN (${placeholders})`, args: ids });
await db.execute({ sql: `DELETE FROM sessions WHERE user_id IN (${placeholders})`, args: ids });
await db.execute({ sql: `DELETE FROM users WHERE id IN (${placeholders})`, args: ids });

for (const u of users) {
  await db.execute({
    sql: `INSERT INTO users (id, email, name) VALUES (?, ?, ?)`,
    args: [u.id, u.email, u.name],
  });
}
for (const [userId, project] of follows) {
  await db.execute({
    sql: `INSERT INTO follows (user_id, project) VALUES (?, ?)`,
    args: [userId, project],
  });
}
for (const [id, project, userId, body] of notes) {
  await db.execute({
    sql: `INSERT INTO notes (id, project, user_id, body) VALUES (?, ?, ?, ?)`,
    args: [id, project, userId, body],
  });
}

console.log(`✓ seeded ${users.length} users, ${follows.length} follows, ${notes.length} notes`);
console.log(`  sign in as ${users[0].email} (dev logs magic links to the console)`);
process.exit(0);
