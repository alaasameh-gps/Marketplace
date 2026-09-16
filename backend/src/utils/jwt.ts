import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env.js';
import type { ExtraJwtPayload } from '../types/auth.types.js';

export function signAccessToken(payload: ExtraJwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): ExtraJwtPayload {
  return jwt.verify(token, env.jwtSecret) as ExtraJwtPayload;
}