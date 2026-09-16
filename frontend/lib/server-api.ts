import { API_BASE, ApiError } from './api-client';

export async function serverApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    code?: string;
    data?: T;
  } | null;

  if (!res.ok || !json?.success) {
    throw new ApiError(res.status, json?.message ?? `Request failed (${res.status})`, json?.code);
  }

  return json.data as T;
}