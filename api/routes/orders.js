import { Router } from 'express';
import { requireAuth } from '../../server/middleware/require-auth.js';
import { rateLimit } from '../../server/middleware/rate-limit.js';
import { parseId, requiredString } from '../../server/lib/validation.js';
import * as orderService from '../../server/services/order-service.js';

export const ordersRouter = Router();

function parseOptionalId(value, field) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return parseId(value, field);
}

function parseOptionalKey(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return requiredString(value, 'idempotencyKey', { max: 100 });
}

ordersRouter.post('/', requireAuth, rateLimit({
  max: 10,
  message: 'Terlalu banyak membuat order, coba lagi nanti.',
}), async (req, res) => {
  const body = req.body ?? {};
  const packageId = parseId(body.packageId, 'packageId');
  const invitationId = parseOptionalId(body.invitationId, 'invitationId');
  const idempotencyKey = parseOptionalKey(body.idempotencyKey);
  const { order, created } = await orderService.createOrder(req.user.id, {
    packageId,
    invitationId,
    idempotencyKey,
  });
  res.status(created ? 201 : 200).json({ order, created });
});

ordersRouter.get('/', requireAuth, async (req, res) => {
  const orders = await orderService.listOrders(req.user.id);
  res.status(200).json({ orders });
});

ordersRouter.get('/:id', requireAuth, async (req, res) => {
  const orderId = parseId(req.params.id, 'id');
  const order = await orderService.getOrderById(req.user.id, orderId);
  res.status(200).json({ order });
});

ordersRouter.post('/:id/cancel', requireAuth, async (req, res) => {
  const orderId = parseId(req.params.id, 'id');
  const order = await orderService.cancelOrder(req.user.id, orderId);
  res.status(200).json({ order });
});
