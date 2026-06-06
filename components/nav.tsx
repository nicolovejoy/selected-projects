import Link from "next/link";
import buildInfo from "@/lib/build-info.json";
import { site } from "@/content/site";
import { MobileMenu } from "@/components/mobile-menu";
import { getSessionUser } from "@/lib/auth";

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

const links = [
  { href: "/", label: site.navLabels.projects },
  { href: "/about", label: site.navLabels.about },
  { href: "/tenets", label: site.navLabels.tenets },
  { href: "/connect", label: site.navLabels.connect },
];

export async function Nav() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <nav className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-[15px] font-normal tracking-tight">
          the <span className="font-bold">piano house</span> project
        </Link>

        <ul className="hidden items-center gap-6 text-sm text-neutral-600 sm:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-neutral-900">
                {l.label}
              </Link>
            </li>
          ))}
          {user ? (
            <>
              <li className="text-neutral-400">{user.name ?? user.email}</li>
              <li>
                <form action="/api/auth/signout" method="post">
                  <button type="submit" className="hover:text-neutral-900">
                    sign out
                  </button>
                </form>
              </li>
            </>
          ) : (
            <li>
              <Link
                href="/signin"
                className="font-medium text-neutral-800 hover:text-neutral-950"
              >
                {site.navLabels.signIn}
              </Link>
            </li>
          )}
        </ul>

        <MobileMenu links={links} signInLabel={site.navLabels.signIn} user={user} />
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-neutral-200">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-2 px-6 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <span>{site.footerTagline}</span>
        <span className="font-mono text-[11px] text-neutral-400">
          Built {builtAt} PT{buildInfo.commit && <> · {buildInfo.commit}</>}
        </span>
      </div>
    </footer>
  );
}
