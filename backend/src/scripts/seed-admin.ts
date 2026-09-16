import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { getConnectionUri } from '../config/db.js';
import { User } from '../models/User.model.js';
import { hashPassword } from '../utils/password.js';

async function main(): Promise<void> {
  const { adminInitialEmail, adminInitialPassword } = env;

  if (!adminInitialEmail || !adminInitialPassword) {
    throw new Error(
      'ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD must be set to create the admin account.',
    );
  }

  await mongoose.connect(await getConnectionUri());
  console.log('Connected to MongoDB.');

  const existing = await User.findOne({ email: adminInitialEmail });
  if (existing) {
    console.log(`Admin account already exists for ${adminInitialEmail}.`);
    await mongoose.disconnect();
    return;
  }

  await User.create({
    name: 'Platform Administrator',
    email: adminInitialEmail,
    passwordHash: await hashPassword(adminInitialPassword),
    role: 'admin',
    status: 'active',
  });

  console.log(`Admin account created for ${adminInitialEmail}.`);
  await mongoose.disconnect();
}

main().catch((err: unknown) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});