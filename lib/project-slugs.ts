/** Every project slug, one per content/projects/<slug>.mdx. A plain list so
 *  proxy.ts can 404 unknown slugs without importing the MDX-heavy
 *  lib/projects.ts (#36). npm run check fails if this drifts from content/. */
export const PROJECT_SLUGS: readonly string[] = [
  "bakerylouise",
  "ibuild4you",
  "musicforge",
  "prntd",
  "prompt-lab",
  "raconte",
  "rocksculpture",
  "selected-projects",
  "songscribe",
  "split-recording",
  "tideline",
];
