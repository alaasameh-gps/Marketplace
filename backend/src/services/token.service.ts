import { Types } from 'mongoose';

import { env } from '../config/env.js';
import { RefreshToken } from '../models/RefreshToken.model.js';
import { ApiError } from '../utils/ApiError.js';
import { generateRawToken, hashRawToken } from '../utils/token.js';

const refreshTokenLifetimeMs = env.refreshTokenExpiresDays * 24 * 60 * 60 * 1000;

export async function issueRefreshToken(userId: string): Promise<string> {
  const raw = generateRawToken();

  await RefreshToken.create({
    tokenHash: hashRawToken(raw),
    user: new Types.ObjectId(userId),
    expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
  });

  return raw;
}

const REFRESH_FAILED = 'Invalid or expired refresh token.';

export async function ensureRefreshTokenValid(raw: string): Promise<{ userId: string }> {
  const record = await RefreshToken.findOne({
    tokenHash: hashRawToken(raw),
  });

  if (!record) {
    throw new ApiError(401, REFRESH_FAILED);
  }

  if (record.revokedAt) {
    throw new ApiError(401, REFRESH_FAILED);
  }

  if (record.expiresAt.getTime() < Date.now()) {
    throw new ApiError(401, REFRESH_FAILED);
  }

  return { userId: record.user.toString() };
}

export async function rotateRefreshToken(raw: string): Promise<string> {
  await ensureRefreshTokenValid(raw);

  const oldHash = hashRawToken(raw);
  const nextRaw = generateRawToken();
  const nextHash = hashRawToken(nextRaw);

  const old = await RefreshToken.findOne({ tokenHash: oldHash });
  if (!old) {
    throw new ApiError(401, REFRESH_FAILED);
  }

  const userId = old.user.toString();

  old.revokedAt = new Date();
  old.replacedByTokenHash = nextHash;
  await old.save();

  await RefreshToken.create({
    tokenHash: nextHash,
    user: old.user,
    expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
  });

  return nextRaw;
}

export async function revokeRefreshToken(raw: string): Promise<void> {
  const record = await RefreshToken.findOne({
    tokenHash: hashRawToken(raw),
  });

  if (record && !record.revokedAt) {
    record.revokedAt = new Date();
    await record.save();
  }
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await RefreshToken.updateMany(
    { user: new Types.ObjectId(userId), revokedAt: undefined },
    { $set: { revokedAt: new Date() } },
  );
}