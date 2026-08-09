import { pool } from '../db.js';
import { HttpError } from '../lib/http-error.js';
import { getTemplateById } from './template-service.js';

const COLUMNS = `
  id, owner_id, template_id, slug, title, event_date, event_time,
  venue, location, couple, message, theme, music_url, gallery,
  is_published, published_at, created_at, updated_at
`;

function toInvitationDto(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    templateId: row.template_id,
    slug: row.slug,
    title: row.title,
    eventDate: row.event_date,
    eventTime: row.event_time,
    venue: row.venue,
    location: row.location,
    couple: row.couple,
    message: row.message,
    theme: row.theme,
    musicUrl: row.music_url,
    gallery: row.gallery || [],
    isPublished: row.is_published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function notFound() {
  return new HttpError(404, 'NOT_FOUND', 'Undangan tidak ditemukan.');
}

async function assertUniqueSlug(slug, excludeId) {
  const { rows } = await pool.query(
    'SELECT id FROM invitations WHERE slug = $1 AND id <> $2',
    [slug, excludeId || '00000000-0000-0000-0000-000000000000'],
  );
  if (rows.length > 0) {
    throw new HttpError(409, 'SLUG_TAKEN', 'Slug sudah dipakai pada undangan lain.');
  }
}

async function assertValidTemplate(templateId) {
  if (templateId === null) {
    return;
  }
  const template = await getTemplateById(templateId);
  if (!template) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Template tidak ditemukan.');
  }
}

export async function createInvitation(ownerId, data) {
  await assertUniqueSlug(data.slug);
  await assertValidTemplate(data.templateId);

  const { rows } = await pool.query(
    `INSERT INTO invitations
       (owner_id, template_id, slug, title, event_date, event_time,
        venue, location, couple, message, theme, music_url, gallery)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING ${COLUMNS}`,
    [
      ownerId,
      data.templateId,
      data.slug,
      data.title,
      data.eventDate,
      data.eventTime,
      data.venue,
      data.location,
      data.couple,
      data.message,
      data.theme,
      data.musicUrl,
      data.gallery,
    ],
  );
  return toInvitationDto(rows[0]);
}

export async function listInvitations(ownerId) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM invitations WHERE owner_id = $1 ORDER BY created_at DESC`,
    [ownerId],
  );
  return rows.map(toInvitationDto);
}

export async function getInvitation(id, ownerId) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM invitations WHERE id = $1 AND owner_id = $2`,
    [id, ownerId],
  );
  if (rows.length === 0) {
    throw notFound();
  }
  return toInvitationDto(rows[0]);
}

export async function updateInvitation(id, ownerId, changes) {
  const mapping = {
    template_id: changes.templateId,
    slug: changes.slug,
    title: changes.title,
    event_date: changes.eventDate,
    event_time: changes.eventTime,
    venue: changes.venue,
    location: changes.location,
    couple: changes.couple,
    message: changes.message,
    theme: changes.theme,
    music_url: changes.musicUrl,
    gallery: changes.gallery,
  };

  const entries = Object.entries(mapping).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return getInvitation(id, ownerId);
  }

  if (changes.slug !== undefined) {
    await assertUniqueSlug(changes.slug, id);
  }
  if (changes.templateId !== undefined) {
    await assertValidTemplate(changes.templateId);
  }

  const sets = [];
  const values = [];
  let index = 1;
  for (const [column, value] of entries) {
    sets.push(`${column} = $${index}`);
    values.push(value);
    index += 1;
  }
  values.push(id, ownerId);

  const { rows } = await pool.query(
    `UPDATE invitations SET ${sets.join(', ')}
     WHERE id = $${index} AND owner_id = $${index + 1}
     RETURNING ${COLUMNS}`,
    values,
  );
  if (rows.length === 0) {
    throw notFound();
  }
  return toInvitationDto(rows[0]);
}

export async function setPublished(id, ownerId, isPublished) {
  const { rows } = await pool.query(
    `UPDATE invitations
     SET is_published = $1,
         published_at = CASE WHEN $1 THEN COALESCE(published_at, NOW()) ELSE NULL END
     WHERE id = $2 AND owner_id = $3
     RETURNING ${COLUMNS}`,
    [isPublished, id, ownerId],
  );
  if (rows.length === 0) {
    throw notFound();
  }
  return toInvitationDto(rows[0]);
}

export async function deleteInvitation(id, ownerId) {
  const { rowCount } = await pool.query(
    'DELETE FROM invitations WHERE id = $1 AND owner_id = $2',
    [id, ownerId],
  );
  if (rowCount === 0) {
    throw notFound();
  }
}

export async function getPublishedInvitationBySlug(slug) {
  const { rows } = await pool.query(
    `SELECT i.id, i.slug, i.title, i.event_date, i.event_time,
            i.venue, i.location, i.couple, i.message, i.theme, i.music_url,
            i.gallery, i.published_at,
            t.name  AS template_name,
            t.category AS template_category,
            t.preview_url AS template_preview_url
     FROM invitations i
     LEFT JOIN templates t ON t.id = i.template_id
     WHERE i.slug = $1 AND i.is_published = TRUE`,
    [slug],
  );
  if (rows.length === 0) {
    throw new HttpError(
      404,
      'NOT_FOUND',
      'Undangan tidak ditemukan atau belum diterbitkan.',
    );
  }
  const row = rows[0];
  return {
    invitation: {
      id: row.id,
      slug: row.slug,
      title: row.title,
      eventDate: row.event_date,
      eventTime: row.event_time,
      venue: row.venue,
      location: row.location,
      couple: row.couple,
      message: row.message,
      theme: row.theme,
      musicUrl: row.music_url,
      gallery: row.gallery || [],
      publishedAt: row.published_at,
    },
    template: row.template_name
      ? {
          name: row.template_name,
          category: row.template_category,
          previewUrl: row.template_preview_url,
        }
      : null,
  };
}
