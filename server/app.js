import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { apiRouter } from '../api/index.js';
import { notFoundHandler, errorHandler } from './middleware/error-handler.js';

const ROOT_DIR = path.resolve(fileURLToPath(new URL('../', import.meta.url)));

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
  if (config.env === 'production') {
    app.set('trust proxy', 1);
  }
  app.use(helmet());
  app.use(cors({ origin: resolveCorsOrigins(config.corsOrigin) }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', apiRouter);

  app.use('/assets', express.static(path.join(ROOT_DIR, 'assets')));
  app.use('/pages', express.static(path.join(ROOT_DIR, 'pages')));

  const page = (file) => (req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'pages', file));
  };

  app.get('/', (req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'index.html'));
  });
  app.get('/login', page('login.html'));
  app.get('/builder', page('builder.html'));
  app.get('/admin', page('admin.html'));
  app.get('/checkout', page('checkout.html'));
  app.get('/u/:slug', page('invitation.html'));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

