import fs from "node:fs";
import { execSync } from "node:child_process";

const built_at = new Date().toISOString();

let commit = "";
try {
  commit = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim();
} catch {
  // not a git repo, or git not available; commit stays empty
}

fs.mkdirSync("lib", { recursive: true });
fs.writeFileSync(
  "lib/build-info.json",
  JSON.stringify({ built_at, commit }, null, 2) + "\n",
);
