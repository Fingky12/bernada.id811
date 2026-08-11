import { Router } from 'express';
import { requireAdmin } from '../../server/middleware/require-admin.js';
import { rateLimit } from '../../server/middleware/rate-limit.js';
import { HttpError } from '../../server/lib/http-error.js';
import * as adminService from '../../server/services/admin-service.js';

function queryInt(value, fallback, min, max) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const num = Number(value);
  if (!Number.isInteger(num)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Parameter kueri tidak valid.');
  }
  return Math.min(max, Math.max(min, num));
}

export const adminRouter = Router();

const adminLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

adminRouter.use(adminLimiter);
adminRouter.use(requireAdmin);

adminRouter.get('/stats', async (req, res) => {
  const stats = await adminService.getStats();
  res.status(200).json({ stats });
});

adminRouter.get('/users', async (req, res) => {
  const page = queryInt(req.query.page, 1, 1, 100000);
  const pageSize = queryInt(req.query.pageSize, 20, 1, 100);
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
  const rawRole = typeof req.query.role === 'string' ? req.query.role : '';
  const role = rawRole === 'admin' || rawRole === 'user' ? rawRole : '';
  const offset = (page - 1) * pageSize;

  const result = await adminService.listUsers({ search, role, limit: pageSize, offset });
  res.status(200).json({ ...result, page });
});
