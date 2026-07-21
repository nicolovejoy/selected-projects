"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const actLink =
  "font-mono text-[0.66rem] tracking-[0.08em] uppercase text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900 hover:decoration-neutral-500";

const LOAD_TIMEOUT_MS = 6000;

/**
 * Toggle `?preview=1` via the native History API rather than the Next
 * router. This page is dynamically rendered (auth reads cookies()), and
 * `router.replace`/`push` is a real navigation there — it round-trips to the
 * server and can race/clobber the just-set query param. `history.pushState`/
 * `replaceState` are the documented "shallow routing" escape hatch: Next
 * patches them to keep `usePathname`/`useSearchParams` in sync everywhere
 * without a refetch. See node_modules/next/dist/docs/01-app/02-guides/
 * single-page-applications.md#shallow-routing-on-the-client.
 */
function setPreviewOpen(pathname: string, open: boolean) {
  window.history.replaceState(null, "", open ? `${pathname}?preview=1` : pathname);
}

/**
 * The "live preview" action link in the detail actions row (#12). Desktop
 * (lg+) toggles the split layout; below lg it's a plain external link — no
 * split on phones.
 *
 * useSearchParams forces its subtree to render client-only on this
 * statically-generated-by-default route, hence the Suspense boundary — the
 * fallback is the phone-shaped external link so nothing pops in in the
 * common case.
 */
export function LivePreviewTrigger({ url }: { url: string }) {
  return (
    <Suspense fallback={<ExternalLink url={url} />}>
      <TriggerInner url={url} />
    </Suspense>
  );
}

function ExternalLink({ url }: { url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`lg:hidden ${actLink}`}>
      live preview ↗
    </a>
  );
}

function TriggerInner({ url }: { url: string }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const open = params.get("preview") === "1";

  return (
    <>
      <button
        type="button"
        onClick={() => setPreviewOpen(pathname, !open)}
        className={`hidden lg:inline ${actLink}`}
      >
        {open ? "close preview" : "live preview"}
      </button>
      <ExternalLink url={url} />
    </>
  );
}

/**
 * Wraps the whole detail-page body. Closed: passes `children` through
 * unchanged. Open (desktop only — the trigger above never sets `?preview=1`
 * below lg): iframe on the left ~2/3, the same `children` scrolled
 * independently on the right ~1/3. Client state only — `children` is the one
 * server-rendered tree, just relaid out, never refetched.
 */
export function LivePreviewLayout({
  name,
  url,
  children,
}: {
  name: string;
  url: string;
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>{children}</>}>
      <LayoutInner name={name} url={url}>
        {children}
      </LayoutInner>
    </Suspense>
  );
}

function LayoutInner({
  name,
  url,
  children,
}: {
  name: string;
  url: string;
  children: React.ReactNode;
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const open = params.get("preview") === "1";
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nav height, measured once per open so the split can size itself as
  // "viewport minus the sticky site header" without a hardcoded number.
  useEffect(() => {
    if (!open) return;
    const header = document.querySelector("header");
    if (!header) return;
    document.documentElement.style.setProperty(
      "--live-preview-nav-h",
      `${header.getBoundingClientRect().height}px`,
    );
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPreviewOpen(pathname, false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pathname]);

  useEffect(() => {
    if (!open) return;
    setTimedOut(false);
    timerRef.current = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open]);

  if (!open) return <>{children}</>;

  return (
    <div className="lg:grid lg:h-[calc(100vh-var(--live-preview-nav-h,65px))] lg:grid-cols-3 lg:overflow-hidden lg:border-t lg:border-neutral-200">
      <div className="relative hidden lg:col-span-2 lg:block lg:border-r lg:border-neutral-200">
        <iframe
          src={url}
          title={`live preview of ${name}`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setTimedOut(false);
          }}
          className="motion-safe:transition-opacity motion-safe:duration-300 h-full w-full opacity-100"
        />
        {timedOut && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/95 text-center">
            <p className="text-sm text-neutral-600">Taking a while to load.</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className={actLink}>
              open site ↗
            </a>
          </div>
        )}
      </div>
      <div className="col-span-1 lg:overflow-y-auto lg:px-6 lg:py-10">{children}</div>
    </div>
  );
}
