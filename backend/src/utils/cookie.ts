import type { CookieOptions, Response } from 'express';

import { env } from '../config/env.js';
import { REFRESH_COOKIE_NAME } from './token.js';

export function refreshCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? 'none' : 'lax',
    path: '/api/v1/auth',
    maxAge: maxAgeMs,
  };
}

export function setRefreshCookie(res: Response, rawToken: string, maxAgeMs: number): void {
  res.cookie(REFRESH_COOKIE_NAME, rawToken, refreshCookieOptions(maxAgeMs));
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions(0));
}