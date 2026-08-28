import { apiData, apiRequest } from "@/lib/api/client";
import type { PaginatedData } from "@/types/api";
import type {
  CreateProjectMemberRequest,
  CreateProjectRequest,
  Project,
  ProjectDetail,
  ProjectMember,
  ProjectQueryParams,
  UpdateProjectRequest,
} from "./types";

export function getProjects(params: ProjectQueryParams, token: string) {
  return apiData<PaginatedData<Project>>("/api/v1/projects", {
    query: params,
    token,
  });
}

export function getProject(projectId: number, token: string) {
  return apiData<ProjectDetail>(`/api/v1/projects/${projectId}`, {
    token,
  });
}

export function createProject(data: CreateProjectRequest, token: string) {
  return apiData<Project>("/api/v1/projects", {
    method: "POST",
    body: data,
    token,
  });
}

export function updateProject(
  projectId: number,
  data: UpdateProjectRequest,
  token: string,
) {
  return apiData<Project>(`/api/v1/projects/${projectId}`, {
    method: "PUT",
    body: data,
    token,
  });
}

export function deleteProject(projectId: number, token: string) {
  return apiRequest<void>(`/api/v1/projects/${projectId}`, {
    method: "DELETE",
    token,
  });
}

export function addProjectMember(
  projectId: number,
  data: CreateProjectMemberRequest,
  token: string,
) {
  return apiData<null>(`/api/v1/projects/${projectId}/members`, {
    method: "POST",
    body: data,
    token,
  });
}

export function getProjectMembers(projectId: number, token: string) {
  return apiData<ProjectMember[]>(
    `/api/v1/projects/projects/${projectId}/members`,
    {
      token,
    },
  );
}

export function deleteProjectMember(
  projectId: number,
  userId: number,
  token: string,
) {
  return apiRequest<void>(`/api/v1/projects/${projectId}/members/${userId}`, {
    method: "DELETE",
    token,
  });
}
