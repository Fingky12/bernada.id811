import { Router } from 'express';
import { requireAuth } from '../../server/middleware/require-auth.js';
import {
  parseId,
  requiredString,
  optionalString,
  validateSlug,
  validateIsoDate,
  validateJsonObject,
} from '../../server/lib/validation.js';
import * as invitationService from '../../server/services/invitation-service.js';

export const invitationsRouter = Router();

invitationsRouter.use(requireAuth);

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
    theme: validateJsonObject(body.theme, 'theme', { optional: true }),
    musicUrl: optionalString(body.musicUrl, 'musicUrl', { max: 500 }),
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
    changes.theme = validateJsonObject(body.theme, 'theme', { optional: true });
  }
  if (body.musicUrl !== undefined) {
    changes.musicUrl = optionalString(body.musicUrl, 'musicUrl', { max: 500 });
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
