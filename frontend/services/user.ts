import { apiFetch } from '@/lib/api-client';
import type { AppUser } from '@/types';

export async function updateProfile(input: { name?: string; phone?: string }) {
  const data = await apiFetch<{ user: AppUser }>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return data.user;
}