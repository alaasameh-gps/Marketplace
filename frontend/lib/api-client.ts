import type { ApiEnvelope } from '@/types';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.status === 401) {
        setAccessToken(null);
        return null;
      }
      const json = (await res.json()) as { success: boolean; data?: { accessToken?: string } };
      const token = json.data?.accessToken ?? null;
      setAccessToken(token);
      return token;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const doFetch = (): Promise<Response> => {
    const headers = new Headers(init?.headers);
    if (!headers.has('Content-Type') && init?.body) headers.set('Content-Type', 'application/json');
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    return fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
  };

  let res = await doFetch();

  const isAuthLeaf =
    path.endsWith('/auth/refresh') ||
    path.endsWith('/auth/login') ||
    path.endsWith('/auth/register') ||
    path.endsWith('/auth/logout');

  if (res.status === 401 && !isAuthLeaf) {
    const token = await refreshAccessToken();
    if (token) res = await doFetch();
  }

  const json = (await res.json().catch(() => null)) as ApiEnvelope<never> | null;

  if (!res.ok || !json?.success) {
    throw new ApiError(res.status, json?.message ?? `Request failed (${res.status})`, json?.code);
  }

  return json.data as T;
}

export function buildQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}