import { apiData, apiRequest, apiResponse } from "@/lib/api/client";
import type { ApiResponse, HealthResponse, PaginatedData } from "@/types/api";
import type { ResponseUser, UserQueryParams } from "./types";

export function healthCheck(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>("/api/v1/health", {
    method: "GET",
  });
}

export function getMe(token: string): Promise<ResponseUser> {
  return apiData<ResponseUser>("/api/v1/me", {
    method: "GET",
    token,
  });
}

export function getUsers(
  params: UserQueryParams,
  token: string,
): Promise<ApiResponse<PaginatedData<ResponseUser>>> {
  return apiResponse<PaginatedData<ResponseUser>>("/api/v1/users", {
    method: "GET",
    query: params,
    token,
  });
}
