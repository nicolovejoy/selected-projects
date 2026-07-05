import { createClient, type Client } from "@libsql/client";

let _client: Client | undefined;

export function db(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url || (!authToken && !url.startsWith("file:"))) {
      throw new Error(
        "TURSO_DATABASE_URL must be set (TURSO_AUTH_TOKEN too, unless file:)"
      );
    }
    _client = createClient(authToken ? { url, authToken } : { url });
  }
  return _client;
}
