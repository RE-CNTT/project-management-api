import type { ResponseUser } from "@/features/auth/types";
import type { QueryParams } from "@/types/api";

export type { ResponseUser };

export interface UserQueryParams extends QueryParams {
  email?: string;
  limit?: number;
  name?: string;
  page?: number;
}
