import { InferSchemaType, Schema, model } from 'mongoose';

import { USER_ROLES, USER_STATUSES } from './shared.js';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_PATTERN, 'Please provide a valid email address'],
    },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true, maxlength: 30, default: undefined },
    role: { type: String, enum: USER_ROLES, default: 'customer' },
    status: { type: String, enum: USER_STATUSES, default: 'active' },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, status: 1 });

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User = model('User', userSchema);