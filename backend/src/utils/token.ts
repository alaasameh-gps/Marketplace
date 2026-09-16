import { createHash, randomBytes } from 'node:crypto';

export function generateRawToken(): string {
  return randomBytes(48).toString('base64url');
}

export function hashRawToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export const REFRESH_COOKIE_NAME = 'refreshToken';