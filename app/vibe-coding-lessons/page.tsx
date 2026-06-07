import Lessons, { metadata as lessonsMetadata } from "@/content/vibe-coding-lessons.mdx";

type LessonsMeta = { title: string };
const lessonsMeta = lessonsMetadata as LessonsMeta;

export default function VibeCodingLessonsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{lessonsMeta.title}</h1>
      <article className="prose prose-stone prose-lg mt-8 max-w-none">
        <Lessons />
      </article>
    </div>
  );
}
