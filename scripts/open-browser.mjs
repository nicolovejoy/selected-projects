// Opens the dev server in a browser once it actually responds. Runs alongside
// `next dev`; NO_OPEN=1 suppresses it (Playwright's webServer sets it).
import { spawn } from "node:child_process";

if (process.env.NO_OPEN) process.exit(0);

const port = process.env.PORT ?? "3000";
const url = `http://localhost:${port}`;
const deadline = Date.now() + 30_000;

while (Date.now() < deadline) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(500) });
    const cmd =
      process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    spawn(cmd, [url], { detached: true, stdio: "ignore" }).unref();
    process.exit(0);
  } catch {
    await new Promise((r) => setTimeout(r, 300));
  }
}
