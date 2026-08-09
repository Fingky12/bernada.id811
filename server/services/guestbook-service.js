import { pool } from '../db.js';
import { HttpError } from '../lib/http-error.js';

function toGuestbookDto(row) {
  return {
    id: row.id,
    guestName: row.guest_name,
    attendance: row.attendance,
    guestsCount: row.guests_count,
    message: row.message,
    createdAt: row.created_at,
  };
}

function notFound() {
  return new HttpError(
    404,
    'NOT_FOUND',
    'Undangan tidak ditemukan atau belum diterbitkan.',
  );
}

async function getPublishedInvitationId(slug) {
  const { rows } = await pool.query(
    'SELECT id FROM invitations WHERE slug = $1 AND is_published = TRUE',
    [slug],
  );
  if (rows.length === 0) {
    throw notFound();
  }
  return rows[0].id;
}

export async function listGuestbook(slug) {
  const invitationId = await getPublishedInvitationId(slug);
  const { rows } = await pool.query(
    `SELECT id, guest_name, attendance, guests_count, message, created_at
     FROM guestbook
     WHERE invitation_id = $1
     ORDER BY created_at DESC
     LIMIT 200`,
    [invitationId],
  );
  return rows.map(toGuestbookDto);
}

export async function addGuestbookEntry(slug, data) {
  const invitationId = await getPublishedInvitationId(slug);
  const { rows } = await pool.query(
    `INSERT INTO guestbook (invitation_id, guest_name, attendance, guests_count, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, guest_name, attendance, guests_count, message, created_at`,
    [invitationId, data.guestName, data.attendance, data.guestsCount, data.message],
  );
  return toGuestbookDto(rows[0]);
}
