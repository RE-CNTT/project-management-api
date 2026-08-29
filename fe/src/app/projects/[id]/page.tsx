import { ProjectDetailView } from "@/features/projects/components/ProjectDetailView";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = await params;
  const parsedId = Number(resolvedParams.id);

  return <ProjectDetailView projectId={parsedId} />;
}
