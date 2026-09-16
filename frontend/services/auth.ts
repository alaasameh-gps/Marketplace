import { apiFetch, setAccessToken } from '@/lib/api-client';
import type { AppUser } from '@/types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'customer' | 'vendor';
  storeName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SessionData {
  user: AppUser;
  accessToken: string;
}

export async function register(input: RegisterInput) {
  const data = await apiFetch<{ user: AppUser; store?: unknown }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data;
}

export async function login(input: LoginInput) {
  const data = await apiFetch<SessionData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  setAccessToken(data.accessToken);
  return data;
}

export async function logout() {
  try {
    await apiFetch<null>('/auth/logout', { method: 'POST' });
  } finally {
    setAccessToken(null);
  }
}

export async function getMe() {
  const data = await apiFetch<{ user: AppUser }>('/auth/me');
  return data.user;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await apiFetch<null>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}