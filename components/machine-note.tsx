import type { ReactNode } from "react";

type Props = {
  label?: string;
  children: ReactNode;
};

export function MachineNote({ label = "from claude", children }: Props) {
  return (
    <aside className="not-prose my-8 border-l-2 border-neutral-300 pl-5 py-1">
      <div className="mono-label mb-3">
        ↳ {label}
      </div>
      <div className="space-y-3 italic leading-relaxed text-neutral-500">
        {children}
      </div>
    </aside>
  );
}
