import type { Role } from '../models/shared.js';

export interface ExtraJwtPayload {
  sub: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  role: Role;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}