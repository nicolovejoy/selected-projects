/**
 * Sessions-per-week as a tiny area chart. Deliberately unlabelled — it reads as
 * a texture of activity, not a figure to be measured. Renders nothing when the
 * project has no published history, so an empty upstream feed leaves no residue.
 */
export function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;

  const w = 48;
  const h = 14;
  const max = Math.max(...values, 1);
  const step = w / (values.length - 1);
  const points = values.map((v, i) => [i * step, h - (v / max) * (h - 2)] as const);
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      aria-hidden
      className={`shrink-0 overflow-visible text-neutral-400 ${className}`}
    >
      <polyline points={`0,${h} ${line} ${w},${h}`} fill="currentColor" opacity={0.15} />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
