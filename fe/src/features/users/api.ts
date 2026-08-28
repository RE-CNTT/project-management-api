import { apiData, apiRequest } from "@/lib/api/client";
import type { HealthResponse, PaginatedData } from "@/types/api";
import type { ResponseUser, UserQueryParams } from "./types";

export function healthCheck() {
  return apiRequest<HealthResponse>("/api/v1/health");
}

export function getMe(token: string) {
  return apiData<ResponseUser>("/api/v1/me", {
    token,
  });
}

export function getUsers(params: UserQueryParams, token: string) {
  return apiData<PaginatedData<ResponseUser>>("/api/v1/users", {
    query: params,
    token,
  });
}
