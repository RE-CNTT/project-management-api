"use client";

import { useParams } from "next/navigation";
import { ProjectDetailView } from "@/features/projects/components/ProjectDetailView";

export default function ProjectDetailPage() {
  const params = useParams();
  const rawId = params.id;
  const projectId = Number(Array.isArray(rawId) ? rawId[0] : rawId);

  return <ProjectDetailView projectId={projectId} />;
}
