import type { HydratedDocument } from 'mongoose';

import { User, type UserDoc } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPageResult, getPaginationDefaults } from '../utils/pagination.js';

export type HydratedUser = HydratedDocument<UserDoc>;

export interface PublicUserShape {
  id: string;
  name: string;
  email: string;
  phone: string | null | undefined;
  role: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function toPublicUser(user: HydratedUser): PublicUserShape {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getUserById(id: string): Promise<HydratedUser> {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  return user;
}

export async function getAdminUser(id: string): Promise<PublicUserShape> {
  return toPublicUser(await getUserById(id));
}

export async function getVisibleUser(
  userId: string,
  requesterId: string,
  isAdmin: boolean,
): Promise<PublicUserShape> {
  if (!isAdmin && userId !== requesterId) {
    throw new ApiError(403, 'You do not have permission to view this user.');
  }

  return toPublicUser(await getUserById(userId));
}

export async function updateProfile(
  userId: string,
  updates: { name?: string; phone?: string },
): Promise<PublicUserShape> {
  const user = await getUserById(userId);

  if (updates.name !== undefined) user.name = updates.name;
  if (updates.phone !== undefined) user.phone = updates.phone;

  await user.save();
  return toPublicUser(user);
}

export async function findByEmail(email: string): Promise<HydratedUser | null> {
  return User.findOne({ email: email.trim().toLowerCase() });
}

export interface ListUsersParams {
  q?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function listUsers(params: ListUsersParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 20), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (params.role) filter.role = params.role;
  if (params.status) filter.status = params.status;

  const q = params.q?.trim();
  if (q) {
    filter.$or = [
      { name: { $regex: escapeRegExp(q), $options: 'i' } },
      { email: { $regex: escapeRegExp(q), $options: 'i' } },
    ];
  }

  const [docs, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return buildPageResult(docs.map(toPublicUser), page, limit, total);
}

export async function setUserStatus(userId: string, status: 'active' | 'suspended') {
  const user = await getUserById(userId);

  if (user.role === 'admin') {
    throw new ApiError(403, 'Admin accounts cannot be suspended or reactivated.');
  }

  if (user.status === status) {
    throw new ApiError(409, `User is already ${status}.`);
  }

  user.status = status;
  await user.save();
  return toPublicUser(user);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}