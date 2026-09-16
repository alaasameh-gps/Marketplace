import { InferSchemaType, Schema, model } from 'mongoose';

export const refreshTokenSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: undefined },
    replacedByTokenHash: { type: String, default: undefined },
  },
  { timestamps: true },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenDoc = InferSchemaType<typeof refreshTokenSchema>;

export const RefreshToken = model('RefreshToken', refreshTokenSchema);