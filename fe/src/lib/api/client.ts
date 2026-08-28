import { getApiBaseUrl } from "./config";
import type { ApiResponse, ValidationErrorItem } from "@/types/api";

type QueryValue = string | number | boolean | null | undefined;

interface ApiRequestOptions {
  body?: unknown;
  headers?: HeadersInit;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, QueryValue>;
  token?: string | null;
}

export class ApiError extends Error {
  readonly payload: unknown;
  readonly statusCode: number;

  constructor(message: string, statusCode: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, options.query);
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, `HTTP ${response.status}`),
      response.status,
      payload,
    );
  }

  return payload as T;
}

export async function apiData<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await apiRequest<ApiResponse<T>>(path, options);
  return response.data;
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Không thể xử lý request.";
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getApiBaseUrl()}${normalizedPath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function parsePayload(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (!isRecord(payload)) {
    return fallback;
  }

  const error = payload.error;

  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  if (Array.isArray(error)) {
    const validationMessages = error
      .map((item) => formatValidationError(item))
      .filter(Boolean);

    if (validationMessages.length > 0) {
      return validationMessages.join("; ");
    }
  }

  if (typeof payload.message === "string" && payload.message.length > 0) {
    return payload.message;
  }

  if (typeof payload.detail === "string" && payload.detail.length > 0) {
    return payload.detail;
  }

  return fallback;
}

function formatValidationError(item: unknown) {
  if (!isValidationErrorItem(item)) {
    return "";
  }

  return `${item.loc.join(".")}: ${item.msg}`;
}

function isValidationErrorItem(item: unknown): item is ValidationErrorItem {
  return (
    isRecord(item) &&
    Array.isArray(item.loc) &&
    typeof item.msg === "string" &&
    typeof item.type === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
