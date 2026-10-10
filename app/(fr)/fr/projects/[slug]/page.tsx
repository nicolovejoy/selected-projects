import { ProjectView, projectMetadata, projectStaticParams } from "@/components/pages/project";

export const generateStaticParams = projectStaticParams;

type Props = { params: Promise<{ slug: string }> };

export function generateMetadata({ params }: Props) {
  return projectMetadata(params, "fr");
}

export default function Page({ params }: Props) {
  return <ProjectView params={params} locale="fr" />;
}
