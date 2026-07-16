import type { ApiErrorBody } from './types';

// empty string in prod -> requests go relative (/api/v1/...), same origin as backend
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// thrown for every non-2xx response -> ui maps err.code to friendly text
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// token kept in memory + localStorage -> survives page refresh
let sessionToken: string | null = localStorage.getItem('lumpa_token');

export function setToken(token: string | null) {
  sessionToken = token;
  if (token) localStorage.setItem('lumpa_token', token);
  else localStorage.removeItem('lumpa_token');
}

export function getToken() {
  return sessionToken;
}

export async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth && sessionToken) headers.Authorization = `Bearer ${sessionToken}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server');
  }

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    let parsed: Partial<ApiErrorBody> = {};
    try {
      parsed = await res.json();
    } catch {
      // empty or non-json error body -> keep fallbacks
    }
    throw new ApiError(
      res.status,
      parsed.code ?? 'UNKNOWN_ERROR',
      parsed.message ?? `Request failed with status ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}
