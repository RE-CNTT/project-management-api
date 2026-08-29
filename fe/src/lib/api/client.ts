import { getApiBaseUrl } from "./config";
import type { ApiResponse, QueryValue, ValidationErrorItem } from "@/types/api";

export interface ApiRequestOptions {
  body?: unknown;
  headers?: HeadersInit;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, QueryValue>;
  token?: string | null;
}

export class ApiError extends Error {
  readonly payload: unknown;
  readonly statusCode: number;
  readonly detailError: string | null;

  constructor(
    message: string,
    statusCode: number,
    payload: unknown,
    detailError: string | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.payload = payload;
    this.detailError = detailError;
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
    const detailError = extractDetailError(payload);
    const primaryMessage = getErrorMessage(payload, `HTTP ${response.status}`);
    const resolvedMessage = detailError || primaryMessage;

    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth:unauthorized", {
          detail: { message: resolvedMessage },
        }),
      );
    }

    throw new ApiError(
      resolvedMessage,
      response.status,
      payload,
      detailError,
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

export async function apiResponse<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<ApiResponse<T>>(path, options);
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.detailError || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Không thể xử lý yêu cầu.";
}

export function extractDetailError(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const error = payload.error;

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (Array.isArray(error) && error.length > 0) {
    const validationMessages = error
      .map((item) => formatValidationError(item))
      .filter(Boolean);

    if (validationMessages.length > 0) {
      return validationMessages.join("; ");
    }
  }

  if (typeof payload.detail === "string" && payload.detail.trim().length > 0) {
    return payload.detail;
  }

  return null;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getApiBaseUrl()}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

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

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) {
    return fallback;
  }

  const detail = extractDetailError(payload);
  if (detail) {
    return detail;
  }

  if (typeof payload.message === "string" && payload.message.length > 0) {
    return payload.message;
  }

  return fallback;
}

function formatValidationError(item: unknown): string {
  if (!isValidationErrorItem(item)) {
    return "";
  }

  const field = item.loc.filter((segment) => segment !== "body").join(".");
  return field ? `${field}: ${item.msg}` : item.msg;
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
