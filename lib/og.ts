import { cacheLife } from "next/cache";

/** Open Graph preview scraped from a project's live URL. */
export type OgPreview = {
  /** Absolute image URL (og:image / twitter:image). */
  image: string;
  title?: string;
  description?: string;
};

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&#39;": "'",
  "&#x27;": "'",
  "&quot;": '"',
  "&lt;": "<",
  "&gt;": ">",
};

function decode(s: string): string {
  return s.replace(/&amp;|&#39;|&#x27;|&quot;|&lt;|&gt;/g, (m) => ENTITIES[m]);
}

/** First matching <meta property|name="…" content="…"> value, either attr order. */
function metaTag(html: string, ...props: string[]): string | undefined {
  for (const prop of props) {
    const after = html.match(
      new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*?content=["']([^"']*)["']`, "i"),
    );
    if (after?.[1]) return decode(after[1]);
    const before = html.match(
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*?(?:property|name)=["']${prop}["']`, "i"),
    );
    if (before?.[1]) return decode(before[1]);
  }
  return undefined;
}

/**
 * Fetch the live page and parse its OG tags, cached by `url`. The try/catch
 * lives inside the cached scope so a failure never throws out of it — it's
 * cached briefly (`minutes`) instead of caching nothing, and a success is
 * cached for a day.
 *
 * `remote`, not plain `use cache`: on /projects/[slug] this runs at request
 * time, where plain `use cache` is per-serverless-instance memory and missed on
 * nearly every view (measured on prod 2026-09-25: 6 loads, 6 scrapes). The
 * remote handler is shared across instances. Nested inside the feed's plain
 * `use cache` is allowed (use-cache-remote.md, "Nesting rules").
 */
async function fetchOgPreview(url: string): Promise<OgPreview | null> {
  "use cache: remote";

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  try {
    let html: string;
    try {
      const res = await fetch(url, {
        headers: {
          // A normal UA — some hosts gate OG tags behind a real browser agent.
          "User-Agent":
            "Mozilla/5.0 (compatible; PianoHouseBot/1.0; +https://pianohouseproject.org)",
          Accept: "text/html",
        },
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`og ${res.status}`);
      html = await res.text();
    } finally {
      clearTimeout(timer);
    }

    // OG tags live in <head>; cap the scan so a huge body doesn't blow up regex.
    const head = html.slice(0, 100_000);
    const image = metaTag(head, "og:image", "twitter:image", "twitter:image:src");
    if (!image) throw new Error("no og:image");

    const preview: OgPreview = {
      image: new URL(image, new URL(url).origin).toString(), // resolve relative paths
      title: metaTag(head, "og:title", "twitter:title"),
      description: metaTag(head, "og:description", "twitter:description"),
    };
    cacheLife("days");
    return preview;
  } catch (err) {
    console.warn(`[og] ${url}: ${(err as Error).message}`);
    cacheLife("minutes");
    return null;
  }
}

/** Cached (daily) OG preview for a project's live URL, or null on any failure. */
export async function getOgPreview(url: string): Promise<OgPreview | null> {
  return fetchOgPreview(url);
}
