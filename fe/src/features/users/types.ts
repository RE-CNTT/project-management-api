import type { ResponseUser } from "@/features/auth/types";

export type { ResponseUser };

export interface UserQueryParams {
  email?: string;
  limit?: number;
  name?: string;
  page?: number;
}
