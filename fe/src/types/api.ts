export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  error: unknown;
  timestamp: string;
  path: string;
}

export interface ValidationErrorItem {
  loc: Array<string | number>;
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total_page: number;
  total_recoder: number;
}

export interface PaginatedData<T> {
  result: T[];
  metadata: PaginationMetadata;
}

export interface HealthResponse {
  status: "success";
}
