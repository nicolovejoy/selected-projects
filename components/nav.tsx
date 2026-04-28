import Link from "next/link";

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
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-neutral-500">
        Piano House — a workshop of small projects.
      </div>
    </footer>
  );
}
