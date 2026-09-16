import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { User } from '../models/User.model.js';
import type { Role } from '../models/shared.js';
import type { AuthUser } from '../types/auth.types.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const requireAuth: RequestHandler = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required. Provide a valid access token.');
    }

    const token = header.slice('Bearer '.length).trim();

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new ApiError(401, 'Invalid or expired access token.');
    }

    const user = await User.findById(payload.sub).select('role status').lean();

    if (!user) {
      throw new ApiError(401, 'User account no longer exists.');
    }

    if (user.status === 'suspended') {
      throw new ApiError(403, 'Account is suspended.');
    }

    const authUser: AuthUser = { id: user._id.toString(), role: user.role };

    req.user = authUser;
    next();
  },
);

export function requireRole(...roles: Role[]): RequestHandler {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required.');
      }

      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, 'You do not have permission to access this resource.');
      }

      next();
    },
  );
}