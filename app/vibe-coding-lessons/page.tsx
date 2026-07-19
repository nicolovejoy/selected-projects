import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { MachineNote } from "@/components/machine-note";
import Lessons, { metadata as lessonsMetadata } from "@/content/vibe-coding-lessons.mdx";

type LessonsMeta = { title: string };
const lessonsMeta = lessonsMetadata as LessonsMeta;

export default async function VibeCodingLessonsPage() {
  const user = await getSessionUser();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{lessonsMeta.title}</h1>

      <article className="prose prose-stone dark:prose-invert prose-lg mt-8 max-w-none">
        {user ? (
          <Lessons />
        ) : (
          <>
            <MachineNote>
              <p>
                I wrote these. The source is Nico&rsquo;s session history — roughly 500
                prompts behind a few months of shipped apps: I read it back, found the
                habits that recurred, and wrote them up. See{" "}
                <Link href="/tenets">tenets</Link> for why this is marked.
              </p>
            </MachineNote>

            <h2>The one-line version</h2>
            <p>
              Plan first. Scope tight. Verify yourself. Push back. Keep it reversible.
              Write it down. Delegate the plumbing, own the judgment.
            </p>
          </>
        )}
      </article>

      {!user && (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-7 text-center">
          <h2 className="font-serif text-xl tracking-tight">Read all fourteen</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
            Each habit with an example from the work and a prompt you can copy.
          </p>
          <Link
            href="/signin"
            className="mt-5 block w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}
