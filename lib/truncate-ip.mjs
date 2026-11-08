// Truncates a client IP to a coarse network prefix: /24 for IPv4, /48 for IPv6.
// Used as the connect-form rate-limit key and stored with each submission.
// Plain .mjs (not .ts) so `node --test` can import it without TypeScript tooling.

/**
 * @param {string | null} raw  An x-forwarded-for value; only the first entry is used.
 * @returns {string | null}    e.g. "203.0.113.0" or "2001:db8:0::"; null if unparseable.
 */
export function truncateIp(raw) {
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim();
  if (!first) return null;
  if (first.includes(":")) {
    const groups = expandIpv6(first);
    return groups ? groups.slice(0, 3).join(":") + "::" : null;
  }
  const parts = first.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  return null;
}

/**
 * Expands "::" compression to the full eight groups, normalized to lowercase
 * hex without leading zeros, so equivalent spellings share a prefix.
 * @param {string} addr
 * @returns {string[] | null}
 */
function expandIpv6(addr) {
  const bare = addr.replace(/^\[|\]$/g, "").split("%")[0]; // brackets, zone id
  const halves = bare.split("::");
  if (halves.length > 2) return null;
  /** @param {string} s */
  const toGroups = (s) => {
    const out = [];
    for (const part of s ? s.split(":") : []) {
      // An embedded IPv4 tail (::ffff:1.2.3.4) occupies two groups.
      out.push(...(part.includes(".") ? ["0", "0"] : [part]));
    }
    return out;
  };
  const head = toGroups(halves[0]);
  const tail = halves.length === 2 ? toGroups(halves[1]) : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 2 ? missing < 1 : missing !== 0) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill("0"), ...tail];
  if (!groups.every((g) => /^[0-9a-f]{1,4}$/i.test(g))) return null;
  return groups.map((g) => parseInt(g, 16).toString(16));
}
