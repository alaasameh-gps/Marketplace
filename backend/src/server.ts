import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const start = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(env.port, () => {
      console.log(`Marketplace API listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', (error as Error).message);
    process.exit(1);
  }
};

void start();