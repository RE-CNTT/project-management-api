import type { PublicUser } from "@/features/auth/types";
import type { QueryParams } from "@/types/api";

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

export interface ProjectQueryParams extends QueryParams {
  limit?: number;
  name?: string;
  page?: number;
}
