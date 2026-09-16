import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, RequestHandler, Response } from 'express';

declare module 'express' {
  interface Request {
    id?: string;
    rawBody?: Buffer;
  }
}

export const requestId: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
  req.id = req.headers['x-request-id'] as string | undefined ?? randomUUID();
  next();
};

export const httpLog: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    console.log(
      `[${req.id}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`,
    );
  });

  next();
};