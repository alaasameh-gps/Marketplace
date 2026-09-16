import type { Request, Response } from 'express';

import { dbState } from '../config/db.js';

export const healthCheck = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Marketplace API is running',
    db: dbState(),
  });
};