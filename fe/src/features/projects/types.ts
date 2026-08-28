import type { PublicUser } from "@/features/auth/types";

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface UpdateProjectRequest {
  name: string;
  description: string;
  owner_id: number;
}

export interface CreateProjectMemberRequest {
  user_id: number;
}

export interface Project {
  id: number;
  name: string;
  description: string;
}

export interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  owner: PublicUser;
}

export interface ProjectMember extends PublicUser {
  role: string;
}

export interface ProjectQueryParams {
  limit?: number;
  name?: string;
  page?: number;
}
