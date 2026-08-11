import { Router } from 'express';
import { requireAuth } from '../../server/middleware/require-auth.js';
import { HttpError } from '../../server/lib/http-error.js';
import {
  parseId,
  requiredString,
  optionalString,
  validateGuestsList,
  validateGuestStatus,
} from '../../server/lib/validation.js';
import * as guestService from '../../server/services/guest-service.js';

export const guestsRouter = Router();

function validateGuestFields(body) {
  return {
    fullName: requiredString(body.fullName, 'fullName', { max: 120 }),
    phone: optionalString(body.phone, 'phone', { max: 30 }),
    guestGroup: optionalString(body.guestGroup, 'guestGroup', { max: 60 }),
    status: body.status === undefined || body.status === null || body.status === ''
      ? 'diundang'
      : validateGuestStatus(body.status),
  };
}

function validateUpdateFields(body) {
  const changes = {};
  if (body.fullName !== undefined) {
    changes.fullName = requiredString(body.fullName, 'fullName', { max: 120 });
  }
  if (body.phone !== undefined) {
    changes.phone = optionalString(body.phone, 'phone', { max: 30 });
  }
  if (body.guestGroup !== undefined) {
    changes.guestGroup = optionalString(body.guestGroup, 'guestGroup', { max: 60 });
  }
  if (body.status !== undefined) {
    changes.status = validateGuestStatus(body.status);
  }
  return changes;
}

guestsRouter.get('/invitations/:id/guests', requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  const guests = await guestService.listGuests(id, req.user.id);
  res.status(200).json({ guests });
});

guestsRouter.post('/invitations/:id/guests', requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  const body = req.body ?? {};
  const guests = Array.isArray(body.guests)
    ? validateGuestsList(body.guests)
    : [validateGuestFields(body)];
  const created = await guestService.addGuests(id, req.user.id, guests);
  res.status(201).json({ guests: created });
});

guestsRouter.get('/invitations/:id/guests/stats', requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  const stats = await guestService.getGuestStats(id, req.user.id);
  res.status(200).json(stats);
});

guestsRouter.get('/guests/:guestId', requireAuth, async (req, res) => {
  const guestId = parseId(req.params.guestId);
  const guest = await guestService.getGuest(guestId, req.user.id);
  res.status(200).json({ guest });
});

guestsRouter.patch('/guests/:guestId', requireAuth, async (req, res) => {
  const guestId = parseId(req.params.guestId);
  const changes = validateUpdateFields(req.body ?? {});
  const guest = await guestService.updateGuest(guestId, req.user.id, changes);
  res.status(200).json({ guest });
});

guestsRouter.delete('/guests/:guestId', requireAuth, async (req, res) => {
  const guestId = parseId(req.params.guestId);
  await guestService.deleteGuest(guestId, req.user.id);
  res.status(204).end();
});
