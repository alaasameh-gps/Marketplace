import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';

import { ApiError } from '../utils/ApiError.js';

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue
        ? `${firstIssue.path.join('.') || 'body'}: ${firstIssue.message}`
        : 'Invalid request body.';

      next(new ApiError(400, message));
      return;
    }

    (req as Request & { body: T }).body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodType<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue
        ? `query ${firstIssue.path.join('.') || 'body'}: ${firstIssue.message}`
        : 'Invalid query parameters.';

      next(new ApiError(400, message));
      return;
    }

    Object.defineProperty(req, 'query', {
      value: { ...req.query, ...result.data },
      configurable: true,
      enumerable: true,
      writable: true,
    });
    next();
  };
}

export function validateParams<T>(schema: ZodType<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue
        ? `params ${firstIssue.path.join('.') || 'body'}: ${firstIssue.message}`
        : 'Invalid route parameters.';

      next(new ApiError(400, message));
      return;
    }

    Object.defineProperty(req, 'params', {
      value: result.data,
      configurable: true,
      enumerable: true,
      writable: true,
    });
    next();
  };
}