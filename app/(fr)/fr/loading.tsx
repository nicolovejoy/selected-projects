import { strings } from "@/content/strings";

// Load-bearing: this is the Suspense boundary the page bodies' session reads sit
// inside (see AGENTS.md gotcha 6). Do not delete.
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="font-mono text-[0.625rem] tracking-[0.12em] text-faint uppercase">
        {strings["fr"].site.loading}
      </p>
    </div>
  );
}
