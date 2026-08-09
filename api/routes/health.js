import { Router } from 'express';
import { config } from '../../server/config.js';
import { checkDatabase } from '../../server/db.js';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  const db = await checkDatabase();
  res.status(db.ok ? 200 : 503).json({
    status: db.ok ? 'ok' : 'degraded',
    service: 'bernada-api',
    version: config.appVersion,
    timestamp: new Date().toISOString(),
    database: db.ok ? 'connected' : 'unreachable',
  });
});
