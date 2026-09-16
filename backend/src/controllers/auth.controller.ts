import type { Request, RequestHandler, Response } from 'express';

import * as authService from '../services/auth.service.js';
import { toPublicUser } from '../services/user.service.js';
import type { AuthUser } from '../types/auth.types.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearRefreshCookie, setRefreshCookie } from '../utils/cookie.js';
import { env } from '../config/env.js';
import { REFRESH_COOKIE_NAME } from '../utils/token.js';

const refreshTokenLifetimeMs = env.refreshTokenExpiresDays * 24 * 60 * 60 * 1000;

export const register: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { user, store } = await authService.register(req.body);
    res.status(201).json({ success: true, data: { user: toPublicUser(user), store } });
  },
);

export const login: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    setRefreshCookie(res, refreshToken, refreshTokenLifetimeMs);
    res.json({
      success: true,
      data: {
        user: toPublicUser(user),
        accessToken,
        expiresIn: env.jwtExpiresIn,
      },
    });
  },
);

export const refresh: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const refreshToken = (req.cookies && (req.cookies[REFRESH_COOKIE_NAME] as string)) || undefined;
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token not provided.');
    }

    const { user, accessToken, refreshToken: nextRefreshToken } = await authService.refresh(
      refreshToken,
    );

    setRefreshCookie(res, nextRefreshToken, refreshTokenLifetimeMs);

    res.json({
      success: true,
      data: {
        user: toPublicUser(user),
        accessToken,
        expiresIn: env.jwtExpiresIn,
      },
    });
  },
);

export const logout: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const refreshToken = (req.cookies && (req.cookies[REFRESH_COOKIE_NAME] as string)) || undefined;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    clearRefreshCookie(res);
    res.json({ success: true, data: null });
  },
);

export const changePassword: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    await authService.changePassword(
      authUser.id,
      req.body.currentPassword,
      req.body.newPassword,
    );
    res.json({ success: true, data: null });
  },
);

export const getMe: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const user = await authService.getMe(authUser.id);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }
    res.json({ success: true, data: { user: toPublicUser(user) } });
  },
);