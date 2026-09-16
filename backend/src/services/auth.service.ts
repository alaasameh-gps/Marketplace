import type { HydratedDocument } from 'mongoose';

import { env } from '../config/env.js';
import { RefreshToken } from '../models/RefreshToken.model.js';
import { User, type UserDoc } from '../models/User.model.js';
import type { VendorDoc } from '../models/Vendor.model.js';
import { createVendorForOwner } from '../services/vendor.service.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateRawToken, hashRawToken } from '../utils/token.js';

const refreshTokenLifetimeMs = env.refreshTokenExpiresDays * 24 * 60 * 60 * 1000;

export type HydratedUser = HydratedDocument<UserDoc>;

export interface AuthUserResult {
  user: HydratedUser;
  accessToken: string;
  refreshToken: string;
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'customer' | 'vendor';
  storeName?: string;
}): Promise<{
  user: HydratedUser;
  store?: HydratedDocument<VendorDoc>;
}> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'Email is already registered.');
  }

  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: await hashPassword(input.password),
    phone: input.phone,
    role: input.role,
  });

  let store: HydratedDocument<VendorDoc> | undefined;
  if (input.role === 'vendor') {
    store = await createVendorForOwner(user._id.toString(), input.storeName!);
  }

  return { user, store };
}

export async function login(input: { email: string; password: string }): Promise<AuthUserResult> {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (user.status === 'suspended') {
    throw new ApiError(403, 'Account is suspended.');
  }

  const userId = user._id.toString();
  const accessToken = signAccessToken({ sub: userId, role: user.role });
  const refreshToken = generateRawToken();

  await RefreshToken.create({
    tokenHash: hashRawToken(refreshToken),
    user: userId,
    expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
  });

  return { user, accessToken, refreshToken };
}

export async function refresh(refreshToken: string): Promise<AuthUserResult> {
  const tokenHash = hashRawToken(refreshToken);
  const record = await RefreshToken.findOne({ tokenHash });

  if (!record) {
    throw new ApiError(401, 'Invalid refresh token.');
  }

  if (record.revokedAt) {
    throw new ApiError(401, 'Refresh token has been revoked.');
  }

  if (record.expiresAt.getTime() < Date.now()) {
    throw new ApiError(401, 'Refresh token has expired.');
  }

  const user = await User.findById(record.user);
  if (!user) {
    throw new ApiError(401, 'User account no longer exists.');
  }

  if (user.status === 'suspended') {
    throw new ApiError(403, 'Account is suspended.');
  }

  const newRefreshToken = generateRawToken();

  record.revokedAt = new Date();
  record.replacedByTokenHash = hashRawToken(newRefreshToken);
  await record.save();

  await RefreshToken.create({
    tokenHash: hashRawToken(newRefreshToken),
    user: user._id,
    expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
  });

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });

  return { user, accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string): Promise<void> {
  if (!refreshToken) return;
  await RefreshToken.updateOne(
    { tokenHash: hashRawToken(refreshToken) },
    { $set: { revokedAt: new Date() } },
  );
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const matches = await verifyPassword(currentPassword, user.passwordHash);
  if (!matches) {
    throw new ApiError(400, 'Current password is incorrect.');
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  await RefreshToken.deleteMany({ user: userId });
}

export function getMe(userId: string) {
  return User.findById(userId);
}