import { Router } from 'express';
import { requireAuth } from '../../server/middleware/require-auth.js';
import { rateLimit } from '../../server/middleware/rate-limit.js';
import { HttpError } from '../../server/lib/http-error.js';
import {
  parseId,
  requiredString,
  optionalString,
  validateSlug,
  validateIsoDate,
  validateStringArray,
  validateThemeColors,
} from '../../server/lib/validation.js';
import * as invitationService from '../../server/services/invitation-service.js';
import * as guestbookService from '../../server/services/guestbook-service.js';
import * as giftAccountService from '../../server/services/gift-account-service.js';

export const invitationsRouter = Router();

const publicLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
const guestbookLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

invitationsRouter.get('/public/:slug', publicLimiter, async (req, res) => {
  const slug = validateSlug(req.params.slug, 'slug');
  const result = await invitationService.getPublishedInvitationBySlug(slug);
  await invitationService.incrementViewCount(result.invitation.id);
  result.invitation.viewCount += 1; // sertakan kunjungan ini dalam respons
  res.status(200).json(result);
});

const ATTENDANCE_OPTIONS = ['hadir', 'tidak-hadir'];

function validateAttendance(value) {
  const attendance = requiredString(value, 'attendance', { max: 20 }).toLowerCase();
  if (!ATTENDANCE_OPTIONS.includes(attendance)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Kehadiran tidak valid.');
  }
  return attendance;
}

function validateGuestsCount(value) {
  if (value === undefined || value === null || value === '') {
    return 1;
  }
  const count = Number(value);
  if (!Number.isInteger(count) || count < 1 || count > 10) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Jumlah tamu harus angka 1–10.');
  }
  return count;
}

function validateGuestbookFields(body) {
  return {
    guestName: requiredString(body.guestName, 'guestName', { max: 120 }),
    attendance: validateAttendance(body.attendance),
    guestsCount: validateGuestsCount(body.guestsCount),
    message: optionalString(body.message, 'message', { max: 1000 }),
  };
}

invitationsRouter.get('/public/:slug/guestbook', publicLimiter, async (req, res) => {
  const slug = validateSlug(req.params.slug, 'slug');
  const entries = await guestbookService.listGuestbook(slug);
  res.status(200).json({ entries });
});

invitationsRouter.post('/public/:slug/guestbook', guestbookLimiter, async (req, res) => {
  const slug = validateSlug(req.params.slug, 'slug');
  const data = validateGuestbookFields(req.body ?? {});
  const entry = await guestbookService.addGuestbookEntry(slug, data);
  res.status(201).json({ entry });
});

invitationsRouter.get('/public/:slug/gift-accounts', publicLimiter, async (req, res) => {
  const slug = validateSlug(req.params.slug, 'slug');
  const accounts = await giftAccountService.listPublicGiftAccounts(slug);
  res.status(200).json({ accounts });
});

invitationsRouter.use(requireAuth);

const SECTION_TYPES = ['countdown', 'location', 'message', 'gift', 'gallery'];

function validateSections(value) {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'sections harus berupa daftar.');
  }
  const seen = new Set();
  const result = [];
  for (const item of value) {
    const type = item && typeof item === 'object' ? String(item.type || '') : '';
    if (!SECTION_TYPES.includes(type) || seen.has(type)) {
      continue;
    }
    seen.add(type);
    result.push({ type, enabled: item.enabled !== false });
  }
  return result;
}

function validateCreateFields(body) {
  return {
    title: requiredString(body.title, 'title', { max: 150 }),
    slug: validateSlug(body.slug, 'slug'),
    templateId: body.templateId === null || body.templateId === undefined
      ? null
      : parseId(body.templateId, 'templateId'),
    eventDate: validateIsoDate(body.eventDate, 'eventDate', { optional: true }),
    eventTime: optionalString(body.eventTime, 'eventTime', { max: 20 }),
    venue: optionalString(body.venue, 'venue', { max: 200 }),
    location: optionalString(body.location, 'location', { max: 300 }),
    couple: optionalString(body.couple, 'couple', { max: 120 }),
    message: optionalString(body.message, 'message', { max: 2000 }),
    theme: validateThemeColors(body.theme),
    musicUrl: optionalString(body.musicUrl, 'musicUrl', { max: 500 }),
    gallery: validateStringArray(body.gallery, 'gallery'),
    sections: validateSections(body.sections),
  };
}

function validateUpdateFields(body) {
  const changes = {};
  if (body.title !== undefined) {
    changes.title = requiredString(body.title, 'title', { max: 150 });
  }
  if (body.slug !== undefined) {
    changes.slug = validateSlug(body.slug, 'slug');
  }
  if (body.templateId !== undefined) {
    changes.templateId = body.templateId === null
      ? null
      : parseId(body.templateId, 'templateId');
  }
  if (body.eventDate !== undefined) {
    changes.eventDate = validateIsoDate(body.eventDate, 'eventDate', { optional: true });
  }
  if (body.eventTime !== undefined) {
    changes.eventTime = optionalString(body.eventTime, 'eventTime', { max: 20 });
  }
  if (body.venue !== undefined) {
    changes.venue = optionalString(body.venue, 'venue', { max: 200 });
  }
  if (body.location !== undefined) {
    changes.location = optionalString(body.location, 'location', { max: 300 });
  }
  if (body.couple !== undefined) {
    changes.couple = optionalString(body.couple, 'couple', { max: 120 });
  }
  if (body.message !== undefined) {
    changes.message = optionalString(body.message, 'message', { max: 2000 });
  }
  if (body.theme !== undefined) {
    changes.theme = validateThemeColors(body.theme);
  }
  if (body.musicUrl !== undefined) {
    changes.musicUrl = optionalString(body.musicUrl, 'musicUrl', { max: 500 });
  }
  if (body.gallery !== undefined) {
    changes.gallery = validateStringArray(body.gallery, 'gallery');
  }
  if (body.sections !== undefined) {
    changes.sections = validateSections(body.sections);
  }
  return changes;
}

invitationsRouter.post('/', async (req, res) => {
  const data = validateCreateFields(req.body ?? {});
  const invitation = await invitationService.createInvitation(req.user.id, data);
  res.status(201).json({ invitation });
});

invitationsRouter.get('/', async (req, res) => {
  const invitations = await invitationService.listInvitations(req.user.id);
  res.status(200).json({ invitations });
});

invitationsRouter.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const invitation = await invitationService.getInvitation(id, req.user.id);
  res.status(200).json({ invitation });
});

invitationsRouter.patch('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const changes = validateUpdateFields(req.body ?? {});
  const invitation = await invitationService.updateInvitation(id, req.user.id, changes);
  res.status(200).json({ invitation });
});

invitationsRouter.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  await invitationService.deleteInvitation(id, req.user.id);
  res.status(204).end();
});

invitationsRouter.post('/:id/publish', async (req, res) => {
  const id = parseId(req.params.id);
  const invitation = await invitationService.setPublished(id, req.user.id, true);
  res.status(200).json({ invitation });
});

invitationsRouter.post('/:id/unpublish', async (req, res) => {
  const id = parseId(req.params.id);
  const invitation = await invitationService.setPublished(id, req.user.id, false);
  res.status(200).json({ invitation });
});

invitationsRouter.get('/:id/status', async (req, res) => {
  const id = parseId(req.params.id);
  const invitation = await invitationService.getInvitation(id, req.user.id);
  res.status(200).json({
    id: invitation.id,
    status: invitation.status,
    isPublished: invitation.isPublished,
  });
});

invitationsRouter.get('/:id/guestbook-stats', async (req, res) => {
  const id = parseId(req.params.id);
  const stats = await guestbookService.getGuestbookStats(id, req.user.id);
  res.status(200).json({ stats });
});

invitationsRouter.patch('/:id/status', async (req, res) => {
  const id = parseId(req.params.id);
  const nextStatus = requiredString(req.body?.status, 'status', { max: 20 }).toLowerCase();
  const invitation = await invitationService.setStatus(id, req.user.id, nextStatus);
  res.status(200).json({
    id: invitation.id,
    status: invitation.status,
    isPublished: invitation.isPublished,
  });
});
