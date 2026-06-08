/**
 * A section that collapses via native <details>/<summary> — no client JS.
 * The summary is styled as a header; the default disclosure marker is hidden
 * in favour of a chevron that rotates when open.
 */
export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group mt-8 border-t border-neutral-200 pt-6">
      <summary className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <svg
          className="h-5 w-5 shrink-0 text-neutral-400 transition-transform group-open:rotate-180"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
        </svg>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
