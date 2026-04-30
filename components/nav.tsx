import Link from "next/link";
import buildInfo from "@/lib/build-info.json";

const builtAt = new Date(buildInfo.built_at)
  .toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
  .replace(/AM/, "am")
  .replace(/PM/, "pm");

export function Nav() {
  return (
    <header className="border-b border-neutral-200">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-medium tracking-tight">
          Piano House
        </Link>
        <div className="flex items-center gap-6">
          <ul className="flex gap-6 text-sm text-neutral-600">
            <li><Link href="/" className="hover:text-neutral-900">Projects</Link></li>
            <li><Link href="/about" className="hover:text-neutral-900">About</Link></li>
            <li><Link href="/connect" className="hover:text-neutral-900">Connect</Link></li>
          </ul>
          <span className="hidden text-xs text-neutral-400 sm:inline">
            Built {builtAt} PT
            {buildInfo.commit && <> · {buildInfo.commit}</>}
          </span>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-neutral-200">
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-neutral-500">
        Piano House — a workshop of small projects.
      </div>
    </footer>
  );
}
