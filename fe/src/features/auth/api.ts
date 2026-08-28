import { apiData } from "@/lib/api/client";
import type {
  AuthTokenResponse,
  CreateUserRequest,
  LoginRequest,
  ResponseUser,
} from "./types";

export function login(data: LoginRequest) {
  return apiData<AuthTokenResponse>("/auth/login", {
    method: "POST",
    body: data,
  });
}

export function registerUser(data: CreateUserRequest) {
  return apiData<ResponseUser>("/auth/register", {
    method: "POST",
    body: data,
  });
}
