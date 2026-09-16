import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_ENV_VARS = ['MONGO_URI', 'JWT_SECRET'] as const;

function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter(
    (name) => !process.env[name] || process.env[name]!.trim() === '',
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Check the .env file or refer to .env.example.',
    );
  }
}

validateEnv();

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI!,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30,
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  adminInitialEmail: process.env.ADMIN_INITIAL_EMAIL || '',
  adminInitialPassword: process.env.ADMIN_INITIAL_PASSWORD || '',
  sandboxWebhookSecret: process.env.SANDBOX_WEBHOOK_SECRET || 'sandbox-change-me',
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || '1mb',
} as const;