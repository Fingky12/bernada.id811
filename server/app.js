import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config.js';
import { apiRouter } from '../api/index.js';
import { notFoundHandler, errorHandler } from './middleware/error-handler.js';

function resolveCorsOrigins(raw) {
  if (raw === '' || raw === '*') {
    return raw === '' ? false : '*';
  }
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: resolveCorsOrigins(config.corsOrigin) }));
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
