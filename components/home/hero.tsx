import Link from "next/link";
import { Suspense } from "react";
import { ContributionCalendar } from "@/components/contribution-calendar";
import { getPublicRepoCount, getUserContributions } from "@/lib/github";
import { strings } from "@/content/strings";
import { localePath, type Locale } from "@/lib/i18n";

const btn =
  "rounded-[2px] border border-neutral-900 px-3.5 py-[9px] text-sm hover:underline hover:underline-offset-[3px]";

function Caption({ locale, children }: { locale: Locale; children?: React.ReactNode }) {
  const t = strings[locale].home;
  return (
    <div className="mt-2.5 flex flex-wrap justify-between gap-x-3 gap-y-1 font-mono text-xs text-neutral-500 tabular-nums">
      {children}
      <span>{t.proof.claudeCode}</span>
      <a
        href="https://github.com/nicolovejoy"
        className="border-b border-neutral-200 text-neutral-600"
      >
        github.com/nicolovejoy
      </a>
    </div>
  );
}

async function ProofCalendar({ locale }: { locale: Locale }) {
  const t = strings[locale].home;
  const [contrib, repos] = await Promise.all([getUserContributions(), getPublicRepoCount()]);
  if (!contrib) return <Caption locale={locale} />;
  const weeks = contrib.weeks.slice(-52);
  const contributions = t.proof.contributions(contrib.total);
  return (
    <>
      <ContributionCalendar weeks={weeks} locale={locale} caption={contributions} fill />
      <Caption locale={locale}>
        <span>{contributions}</span>
        {repos !== null && <span>{t.proof.repos(repos)}</span>}
      </Caption>
    </>
  );
}

function CalendarSkeleton() {
  return (
    <div aria-hidden>
      <div className="w-full animate-pulse rounded-[2px] bg-neutral-100" style={{ aspectRatio: "52 / 7" }} />
      <div className="mt-2.5 h-4" />
    </div>
  );
}

export function Hero({ locale }: { locale: Locale }) {
  const t = strings[locale].home;
  const linkedin = strings[locale].site.linkedin;
  return (
    <section className="mt-10 grid items-end gap-x-12 gap-y-8 min-[860px]:mt-14 min-[860px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div>
        <h1 className="m-0 font-serif text-[clamp(30px,4.2vw,46px)] leading-[1.1] font-normal tracking-tight text-balance">
          {t.heading}
        </h1>
        <p className="mt-4 max-w-[44ch] text-neutral-600">{t.sub}</p>
        <div className="mt-[22px] flex flex-wrap gap-2.5">
          <Link
            href={localePath(locale, "/connect")}
            className={`${btn} bg-neutral-900 text-white`}
          >
            {t.getInTouch}
          </Link>
          <a href="https://github.com/nicolovejoy" className={btn}>
            {t.github}
          </a>
          {linkedin && (
            <a href={linkedin} className={btn}>
              {t.linkedin}
            </a>
          )}
        </div>
      </div>
      <div className="min-w-0">
        <Suspense fallback={<CalendarSkeleton />}>
          <ProofCalendar locale={locale} />
        </Suspense>
      </div>
    </section>
  );
}
