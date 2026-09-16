import { resolveSrv } from 'node:dns/promises';

import mongoose from 'mongoose';

import { env } from './env.js';

const READY_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export const dbState = (): string =>
  READY_STATES[mongoose.connection.readyState] ?? 'unknown';

/**
 * Some networks block DNS TXT queries, which the MongoDB driver always issues for
 * `mongodb+srv://` URIs (to discover authSource / replicaSet), causing connection to
 * hang indefinitely. To stay deterministic we pre-resolve the `_mongodb._tcp` SRV
 * records and build an equivalent `mongodb://` seed-list URI (authSource=admin is the
 * Atlas default). If the URI is not an `srv` URI (or SRV resolution fails) the
 * original URI is returned unchanged.
 */
export async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith('mongodb+srv://')) {
    return uri;
  }

  const parsed = new URL(uri);
  const hosts = await resolveSrv(`_mongodb._tcp.${parsed.hostname}`);

  if (hosts.length === 0) {
    return uri;
  }

  const seedList = hosts.map((r) => r.name).join(',');
  const keep = parsed.searchParams;
  keep.set('tls', 'true');
  keep.set('authSource', keep.get('authSource') ?? 'admin');

  const creds = parsed.username
    ? `${parsed.username}:${parsed.password ? encodeURIComponent(parsed.password) : ''}@`
    : '';
  const db = parsed.pathname && parsed.pathname.length > 1 ? parsed.pathname : '/';

  return `mongodb://${creds}${seedList}${db}?${keep.toString()}`;
}

let resolvedUriPromise: Promise<string> | null = null;

export const getConnectionUri = (): Promise<string> => {
  resolvedUriPromise ??= resolveMongoUri(env.mongoUri);
  return resolvedUriPromise;
};

export const connectDB = async (): Promise<void> => {
  const uri = await getConnectionUri();
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
};