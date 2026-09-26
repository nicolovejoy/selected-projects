import crypto from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@libsql/client";
import { SEED_USER, STORAGE_STATE } from "./auth";

const E2E_DB = "file:.playwright/e2e.db";
const THANKS = "Thanks — we'll be in touch.";

test.describe.configure({ mode: "serial" });

async function cleanup(): Promise<void> {
  const db = createClient({ url: E2E_DB });
  try {
    await db.execute({
      sql: `DELETE FROM connect_submissions WHERE email = ? OR email LIKE '%@e2e.test'`,
      args: [SEED_USER.email],
    });
  } finally {
    db.close();
  }
}

async function rowsFor(email: string): Promise<number> {
  const db = createClient({ url: E2E_DB });
  try {
    const res = await db.execute({
      sql: `SELECT COUNT(*) AS n FROM connect_submissions WHERE lower(email) = lower(?)`,
      args: [email],
    });
    return Number(res.rows[0]?.n ?? 0);
  } finally {
    db.close();
  }
}

async function ipFor(email: string): Promise<string | null> {
  const db = createClient({ url: E2E_DB });
  try {
    const res = await db.execute({
      sql: `SELECT ip FROM connect_submissions WHERE lower(email) = lower(?) LIMIT 1`,
      args: [email],
    });
    const ip = res.rows[0]?.ip;
    return ip == null ? null : String(ip);
  } finally {
    db.close();
  }
}

async function countForIp(ip: string): Promise<number> {
  const db = createClient({ url: E2E_DB });
  try {
    const res = await db.execute({
      sql: `SELECT COUNT(*) AS n FROM connect_submissions WHERE ip = ?`,
      args: [ip],
    });
    return Number(res.rows[0]?.n ?? 0);
  } finally {
    db.close();
  }
}

async function submit(
  page: Page,
  fields: { name?: string; email?: string; message: string },
): Promise<void> {
  await page.goto("/connect");
  if (fields.name !== undefined) {
    await page.getByLabel("Name").fill(fields.name);
  }
  if (fields.email !== undefined) {
    await page.getByLabel("Email").fill(fields.email);
  }
  await page.getByLabel("Message").fill(fields.message);

  const before = fields.email !== undefined ? await rowsFor(fields.email) : null;

  // A plain <button> has no pre-hydration fallback: a click that lands before
  // hydration is silently swallowed (AGENTS.md gotcha). Retry click-then-assert,
  // but guard against a retry double-submitting by checking rowsFor rather than
  // trusting the click count.
  await expect(async () => {
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText(THANKS)).toBeVisible();
  }).toPass();

  if (fields.email !== undefined && before !== null) {
    const after = await rowsFor(fields.email);
    expect(after).toBeLessThanOrEqual(before + 1);
  }
}

async function insertRows(
  ip: string,
  count: number,
  emailPrefix: string,
): Promise<void> {
  const db = createClient({ url: E2E_DB });
  try {
    for (let i = 0; i < count; i++) {
      await db.execute({
        sql: `INSERT INTO connect_submissions (id, name, email, project, message, ip)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          crypto.randomUUID(),
          "E2E Filler",
          `${emailPrefix}-${i}-${Date.now()}@e2e.test`,
          "general",
          `e2e ip-bucket filler ${i}`,
          ip,
        ],
      });
    }
  } finally {
    db.close();
  }
}

test.describe("connect rate limit — signed in, email key", () => {
  test.use({ storageState: STORAGE_STATE });

  test("6th submission in an hour is silently dropped", async ({ page }) => {
    await cleanup();

    for (let n = 0; n < 6; n++) {
      await submit(page, { message: `e2e rate limit test message ${n} ${Date.now()}` });
    }

    expect(await rowsFor(SEED_USER.email)).toBe(5);
  });

  test("signed-in submission is not dropped when the IP bucket is full", async ({ page }) => {
    await cleanup();

    // Submit once signed in to learn the local server's forwarded IP, the
    // same way the signed-out spec derives it — don't hardcode '1::'.
    const probeMessage = `e2e ip-bucket probe ${Date.now()}`;
    await submit(page, { message: probeMessage });
    const ip = await ipFor(SEED_USER.email);
    if (ip === null) {
      test.skip(true, "no forwarded IP on the local server — IP key can't be exercised");
      return;
    }

    await cleanup();
    await insertRows(ip, 10, "rl-ipfull");
    expect(await countForIp(ip)).toBe(10);

    const before = await rowsFor(SEED_USER.email);
    await submit(page, { message: `e2e ip-bucket signed-in check ${Date.now()}` });
    const after = await rowsFor(SEED_USER.email);

    expect(after).toBe(before + 1);
  });
});

test.describe("connect rate limit — signed out, IP key", () => {
  test("11th submission from the same IP in an hour is silently dropped", async ({ page }) => {
    await cleanup();

    const probeEmail = `rl-${Date.now()}-probe@e2e.test`;
    await submit(page, {
      name: "E2E Tester",
      email: probeEmail,
      message: "e2e rate limit ip probe",
    });

    const ip = await ipFor(probeEmail);
    if (ip === null) {
      test.skip(true, "no forwarded IP on the local server — IP key can't be exercised");
      return;
    }

    let n = 1;
    let count = await countForIp(ip);
    // Up to 4 submissions per email so the email key (limit 5) never trips,
    // while we drive the IP's row count (limit 10) up to the cap.
    while (count < 10) {
      const email = `rl-${Date.now()}-${n}@e2e.test`;
      for (let perEmail = 0; perEmail < 4 && count < 10; perEmail++) {
        await submit(page, {
          name: "E2E Tester",
          email,
          message: `e2e rate limit ip fill ${n}-${perEmail} ${Date.now()}`,
        });
        count = await countForIp(ip);
      }
      n++;
    }

    expect(count).toBe(10);

    const overEmail = `rl-${Date.now()}-over@e2e.test`;
    await submit(page, {
      name: "E2E Tester",
      email: overEmail,
      message: "e2e rate limit ip over the cap",
    });

    expect(await countForIp(ip)).toBe(10);
  });
});
