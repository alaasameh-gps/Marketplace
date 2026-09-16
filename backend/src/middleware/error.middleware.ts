import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/ApiError.js';

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
  });
};