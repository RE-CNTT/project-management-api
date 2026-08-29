import { apiResponse } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  AuthTokenResponse,
  CreateUserRequest,
  LoginRequest,
  ResponseUser,
} from "./types";

export function login(data: LoginRequest): Promise<ApiResponse<AuthTokenResponse>> {
  return apiResponse<AuthTokenResponse>("/auth/login", {
    method: "POST",
    body: {
      email: data.email,
      password: data.password,
    },
  });
}

export function registerUser(data: CreateUserRequest): Promise<ApiResponse<ResponseUser>> {
  return apiResponse<ResponseUser>("/auth/register", {
    method: "POST",
    body: {
      email: data.email,
      full_name: data.full_name,
      password: data.password,
    },
  });
}
