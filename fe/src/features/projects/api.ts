import { apiRequest, apiResponse } from "@/lib/api/client";
import type { ApiResponse, PaginatedData } from "@/types/api";
import type {
  CreateProjectMemberRequest,
  CreateProjectRequest,
  Project,
  ProjectDetail,
  ProjectMember,
  ProjectQueryParams,
  UpdateProjectRequest,
} from "./types";

export function getProjects(
  params: ProjectQueryParams,
  token: string,
): Promise<ApiResponse<PaginatedData<Project>>> {
  return apiResponse<PaginatedData<Project>>("/api/v1/projects", {
    method: "GET",
    query: params,
    token,
  });
}

export function getProject(
  projectId: number,
  token: string,
): Promise<ApiResponse<ProjectDetail>> {
  return apiResponse<ProjectDetail>(`/api/v1/projects/${projectId}`, {
    method: "GET",
    token,
  });
}

export function createProject(
  data: CreateProjectRequest,
  token: string,
): Promise<ApiResponse<Project>> {
  return apiResponse<Project>("/api/v1/projects", {
    method: "POST",
    body: {
      name: data.name,
      description: data.description,
    },
    token,
  });
}

export function updateProject(
  projectId: number,
  data: UpdateProjectRequest,
  token: string,
): Promise<ApiResponse<Project>> {
  return apiResponse<Project>(`/api/v1/projects/${projectId}`, {
    method: "PUT",
    body: {
      name: data.name,
      description: data.description,
      owner_id: data.owner_id,
    },
    token,
  });
}

export function deleteProject(
  projectId: number,
  token: string,
): Promise<void> {
  return apiRequest<void>(`/api/v1/projects/${projectId}`, {
    method: "DELETE",
    token,
  });
}

export function addProjectMember(
  projectId: number,
  data: CreateProjectMemberRequest,
  token: string,
): Promise<ApiResponse<null>> {
  return apiResponse<null>(`/api/v1/projects/${projectId}/members`, {
    method: "POST",
    body: {
      user_id: data.user_id,
    },
    token,
  });
}

export function getProjectMembers(
  projectId: number,
  token: string,
): Promise<ApiResponse<ProjectMember[]>> {
  return apiResponse<ProjectMember[]>(
    `/api/v1/projects/projects/${projectId}/members`,
    {
      method: "GET",
      token,
    },
  );
}

export function deleteProjectMember(
  projectId: number,
  userId: number,
  token: string,
): Promise<void> {
  return apiRequest<void>(`/api/v1/projects/${projectId}/members/${userId}`, {
    method: "DELETE",
    token,
  });
}
