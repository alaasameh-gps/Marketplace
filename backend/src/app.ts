import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { httpLog, requestId } from './middleware/request.middleware.js';
import routes from './routes/index.js';

const app = express();

app.use(requestId);
app.use(httpLog);
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);
app.use(
  express.json({
    limit: env.jsonBodyLimit as never,
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);
app.use(cookieParser());

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;