import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ConnectForm } from "@/components/connect/form";
import { SignInForm } from "@/components/signin/form";
import { getSessionUser } from "@/lib/auth";
import { projects } from "@/lib/projects";
import { strings } from "@/content/strings";
import { localePath, type Locale } from "@/lib/i18n";
import ConnectEn, { metadata as connectEnMeta } from "@/content/connect.mdx";
import ConnectFr, { metadata as connectFrMeta } from "@/content/fr/connect.mdx";

type Meta = { title: string };
const connectDocs = {
  en: { Body: ConnectEn, meta: connectEnMeta as Meta },
  fr: { Body: ConnectFr, meta: connectFrMeta as Meta },
};

const projectOptions = projects.map(({ slug, name }) => ({ slug, name }));

export function connectMetadata(locale: Locale) {
  return { title: `${connectDocs[locale].meta.title} — ${strings[locale].site.title}` };
}

export async function ConnectView({ locale }: { locale: Locale }) {
  const user = await getSessionUser();
  const { Body, meta } = connectDocs[locale];
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{meta.title}</h1>
      <div className="mt-3 text-neutral-600">
        <Body />
      </div>
      <Suspense>
        <ConnectForm email={user?.email ?? null} locale={locale} projects={projectOptions} />
      </Suspense>
    </div>
  );
}

export function signinMetadata(locale: Locale) {
  return { title: strings[locale].signin.metaTitle };
}

export async function SignInView({
  searchParams,
  locale,
}: {
  searchParams: Promise<{ error?: string }>;
  locale: Locale;
}) {
  const user = await getSessionUser();
  if (user) redirect(localePath(locale, "/"));

  const t = strings[locale].signin;
  const { error } = await searchParams;
  const errorMessage = error ? t.linkErrors[error] : undefined;

  return (
    <div className="min-h-[80dvh] bg-neutral-50">
      <div className="mx-auto flex max-w-sm flex-col px-5 pt-16 pb-20">
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {errorMessage}
          </div>
        )}
        <SignInForm locale={locale} />
        <p className="mt-6 text-center text-xs leading-relaxed text-neutral-400">{t.footnote}</p>
      </div>
    </div>
  );
}
