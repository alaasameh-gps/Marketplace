import type { Request, RequestHandler, Response } from 'express';

import { getAdminUser, listUsers, setUserStatus } from '../../services/user.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { IdParams } from '../../validations/admin/common.js';

export const listUsersHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await listUsers({
      q: (req.query.q as string | undefined) ?? undefined,
      role: (req.query.role as string | undefined) ?? undefined,
      status: (req.query.status as string | undefined) ?? undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    res.json({ success: true, data: result });
  },
);

export const getUserByIdHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const user = await getAdminUser(id);
    res.json({ success: true, data: { user } });
  },
);

export const setUserStatusHandler: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as IdParams;
    const user = await setUserStatus(id, req.body.status);
    res.json({ success: true, data: { user } });
  },
);