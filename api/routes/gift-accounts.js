import { Router } from 'express';
import { requireAuth } from '../../server/middleware/require-auth.js';
import { HttpError } from '../../server/lib/http-error.js';
import {
  parseId,
  requiredString,
  optionalString,
} from '../../server/lib/validation.js';
import * as giftAccountService from '../../server/services/gift-account-service.js';

export const giftAccountsRouter = Router();

function validateSortOrder(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const order = Number(value);
  if (!Number.isInteger(order)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Urutan harus berupa angka bulat.');
  }
  return order;
}

function validateFields(body, { partial = false } = {}) {
  const data = {};
  if (!partial || body.bankName !== undefined) {
    data.bankName = requiredString(body.bankName, 'bankName', { max: 80 });
  }
  if (!partial || body.accountNumber !== undefined) {
    data.accountNumber = requiredString(body.accountNumber, 'accountNumber', { max: 40 });
  }
  if (!partial || body.accountName !== undefined) {
    data.accountName = optionalString(body.accountName, 'accountName', { max: 120 });
  }
  if (body.isActive !== undefined) {
    data.isActive = body.isActive === true || body.isActive === 'true';
  }
  const sortOrder = validateSortOrder(body.sortOrder);
  if (sortOrder !== undefined) {
    data.sortOrder = sortOrder;
  }
  return data;
}

giftAccountsRouter.get('/invitations/:id/gift-accounts', requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  const accounts = await giftAccountService.listGiftAccounts(id, req.user.id);
  res.status(200).json({ accounts });
});

giftAccountsRouter.post('/invitations/:id/gift-accounts', requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  const data = validateFields(req.body ?? {});
  const account = await giftAccountService.createGiftAccount(id, req.user.id, data);
  res.status(201).json({ account });
});

giftAccountsRouter.patch('/gift-accounts/:giftAccountId', requireAuth, async (req, res) => {
  const giftAccountId = parseId(req.params.giftAccountId);
  const changes = validateFields(req.body ?? {}, { partial: true });
  const account = await giftAccountService.updateGiftAccount(giftAccountId, req.user.id, changes);
  res.status(200).json({ account });
});

giftAccountsRouter.delete('/gift-accounts/:giftAccountId', requireAuth, async (req, res) => {
  const giftAccountId = parseId(req.params.giftAccountId);
  await giftAccountService.deleteGiftAccount(giftAccountId, req.user.id);
  res.status(204).end();
});
