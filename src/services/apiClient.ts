import { getApiBaseUrl } from "../config/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  /** Overrides the token from auth context */
  accessToken?: string | null;
};

type AuthGetters = {
  getAccessToken: () => string | null;
  getUserId: () => string | null;
};

const defaultGetters: AuthGetters = {
  getAccessToken: () => null,
  getUserId: () => null,
};

let authGetters: AuthGetters = { ...defaultGetters };

export function setApiAuthGetters(partial: Partial<AuthGetters>): void {
  authGetters = { ...authGetters, ...partial };
}

export function clearApiAuthGetters(): void {
  authGetters = { ...defaultGetters };
}

export function getApiUserId(): string | null {
  return authGetters.getUserId();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("EXPO_PUBLIC_API_URL is not set");
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const token = options.accessToken !== undefined ? options.accessToken : authGetters.getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = null;
    }
  }

  if (!res.ok) {
    const obj = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    const message =
      obj && typeof obj.message === "string" ? obj.message : res.statusText || "Request failed";
    const code = obj && typeof obj.code === "string" ? obj.code : undefined;
    throw new ApiError(res.status, message, code);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return parsed as T;
}
