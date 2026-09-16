import type { Request, RequestHandler, Response } from 'express';

import { getVisibleUser, updateProfile } from '../services/user.service.js';
import type { AuthUser } from '../types/auth.types.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUserById: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const isAdmin = authUser.role === 'admin';
    const user = await getVisibleUser(String(req.params.id), authUser.id, isAdmin);
    res.json({ success: true, data: { user } });
  },
);

export const updateMe: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user as AuthUser;
    const user = await updateProfile(authUser.id, req.body);
    res.json({ success: true, data: { user } });
  },
);