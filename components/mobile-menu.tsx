"use client";

import Link from "next/link";
import { useState } from "react";

type LinkItem = { href: string; label: string };
type MenuUser = { email: string; name: string | null } | null;

export function MobileMenu({
  links,
  signInLabel,
  user,
}: {
  links: LinkItem[];
  signInLabel: string;
  user: MenuUser;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 sm:hidden">
      {user && (
        <span
          aria-hidden
          className="flex size-6 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white"
        >
          {(user.name ?? user.email)[0].toUpperCase()}
        </span>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={open}
        className="-mr-1 rounded-md p-2 text-neutral-600 hover:bg-neutral-100"
      >
        <div className="space-y-[5px]">
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
        </div>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-neutral-200 bg-white shadow-sm">
          <ul className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3 text-sm text-neutral-700">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2 hover:bg-neutral-100"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-1 border-t border-neutral-100 pt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-2 py-1">
                    <span
                      aria-hidden
                      className="flex size-6 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white"
                    >
                      {(user.name ?? user.email)[0].toUpperCase()}
                    </span>
                    <span className="truncate text-sm font-medium text-neutral-800">
                      {user.name ?? user.email}
                    </span>
                  </div>
                  <form action="/api/auth/signout" method="post">
                    <button
                      type="submit"
                      className="block w-full rounded-md px-2 py-2 text-left font-medium hover:bg-neutral-100"
                    >
                      sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2 font-medium hover:bg-neutral-100"
                >
                  {signInLabel}
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
