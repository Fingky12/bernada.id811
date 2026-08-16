import { Router } from 'express';
import { requireAdmin } from '../../server/middleware/require-admin.js';
import { rateLimit } from '../../server/middleware/rate-limit.js';
import { HttpError } from '../../server/lib/http-error.js';
import { parseId } from '../../server/lib/validation.js';
import * as adminService from '../../server/services/admin-service.js';
import * as paymentService from '../../server/services/payment-service.js';

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

function queryString(value, maxLength = 100) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
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
  const search = queryString(req.query.search);
  const rawRole = queryString(req.query.role, 20);
  const role = rawRole === 'admin' || rawRole === 'user' ? rawRole : '';
  const offset = (page - 1) * pageSize;

  const result = await adminService.listUsers({ search, role, limit: pageSize, offset });
  res.status(200).json({ ...result, page });
});

adminRouter.get('/users/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const result = await adminService.getUserDetail(id);
  res.status(200).json(result);
});

adminRouter.patch('/users/:id/role', async (req, res) => {
  const id = parseId(req.params.id);
  const role = typeof req.body?.role === 'string' ? req.body.role.trim() : '';
  if (role !== 'admin' && role !== 'user') {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Role harus "admin" atau "user".');
  }
  const user = await adminService.setUserRole(id, role, req.user.id);
  res.status(200).json({ user });
});

adminRouter.get('/invitations', async (req, res) => {
  const page = queryInt(req.query.page, 1, 1, 100000);
  const pageSize = queryInt(req.query.pageSize, 20, 1, 100);
  const search = queryString(req.query.search);
  const rawStatus = queryString(req.query.status, 20);
  const status = rawStatus === 'published' || rawStatus === 'draft' ? rawStatus : '';
  const offset = (page - 1) * pageSize;

  const result = await adminService.listInvitations({ search, status, limit: pageSize, offset });
  res.status(200).json({ ...result, page });
});

adminRouter.post('/invitations/:id/unpublish', async (req, res) => {
  const id = parseId(req.params.id);
  const invitation = await adminService.unpublishInvitation(id);
  res.status(200).json({ invitation });
});

adminRouter.get('/guestbook', async (req, res) => {
  const page = queryInt(req.query.page, 1, 1, 100000);
  const pageSize = queryInt(req.query.pageSize, 20, 1, 100);
  const search = queryString(req.query.search);
  const offset = (page - 1) * pageSize;

  const result = await adminService.listGuestbookEntries({ search, limit: pageSize, offset });
  res.status(200).json({ ...result, page });
});

adminRouter.delete('/guestbook/:entryId', async (req, res) => {
  const entryId = parseId(req.params.entryId);
  await adminService.deleteGuestbookEntry(entryId);
  res.status(204).end();
});

adminRouter.get('/payments', async (req, res) => {
  const page = queryInt(req.query.page, 1, 1, 100000);
  const pageSize = queryInt(req.query.pageSize, 20, 1, 100);
  const rawStatus = queryString(req.query.status, 20);
  const status = ['pending', 'succeeded', 'failed', 'expired'].includes(rawStatus) ? rawStatus : '';
  const offset = (page - 1) * pageSize;

  const result = await paymentService.listPayments({ status, limit: pageSize, offset });
  res.status(200).json({ ...result, page });
});

adminRouter.post('/payments/:id/verify', async (req, res) => {
  const id = parseId(req.params.id);
  const result = await paymentService.verifyManualPayment(id);
  res.status(200).json(result);
});
