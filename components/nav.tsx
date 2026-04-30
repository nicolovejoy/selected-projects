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
        <ul className="flex gap-6 text-sm text-neutral-600">
          <li><Link href="/" className="hover:text-neutral-900">Projects</Link></li>
          <li><Link href="/about" className="hover:text-neutral-900">About</Link></li>
          <li><Link href="/connect" className="hover:text-neutral-900">Connect</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-neutral-200">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-2 px-6 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Piano House — explorations in AI and vibe-coding.</span>
        <span className="font-mono text-[11px] text-neutral-400">
          Built {builtAt} PT{buildInfo.commit && <> · {buildInfo.commit}</>}
        </span>
      </div>
    </footer>
  );
}
