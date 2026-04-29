import { createClient, type Client } from "@libsql/client";

let _client: Client | undefined;

export function db(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url || !authToken) {
      throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set");
    }
    _client = createClient({ url, authToken });
  }
  return _client;
}
