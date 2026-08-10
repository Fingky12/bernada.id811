import { pool } from '../db.js';
import { HttpError } from '../lib/http-error.js';

const COLUMNS = 'id, invitation_id, full_name, phone, guest_group, status, created_at, updated_at';

function toGuestDto(row) {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    fullName: row.full_name,
    phone: row.phone,
    guestGroup: row.guest_group,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function notFound() {
  return new HttpError(404, 'NOT_FOUND', 'Tamu tidak ditemukan.');
}

async function assertOwnInvitation(invitationId, ownerId) {
  const { rows } = await pool.query(
    'SELECT id FROM invitations WHERE id = $1 AND owner_id = $2',
    [invitationId, ownerId],
  );
  if (rows.length === 0) {
    throw new HttpError(404, 'NOT_FOUND', 'Undangan tidak ditemukan.');
  }
}

export async function listGuests(invitationId, ownerId) {
  await assertOwnInvitation(invitationId, ownerId);
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM guests
     WHERE invitation_id = $1
     ORDER BY created_at DESC`,
    [invitationId],
  );
  return rows.map(toGuestDto);
}

export async function addGuests(invitationId, ownerId, guests) {
  await assertOwnInvitation(invitationId, ownerId);
  const created = [];
  for (const guest of guests) {
    const { rows } = await pool.query(
      `INSERT INTO guests (invitation_id, full_name, phone, guest_group, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLUMNS}`,
      [invitationId, guest.fullName, guest.phone, guest.guestGroup, guest.status],
    );
    created.push(toGuestDto(rows[0]));
  }
  return created;
}

export async function updateGuest(guestId, ownerId, changes) {
  const { rows } = await pool.query(
    `SELECT g.id FROM guests g
     JOIN invitations i ON i.id = g.invitation_id
     WHERE g.id = $1 AND i.owner_id = $2`,
    [guestId, ownerId],
  );
  if (rows.length === 0) {
    throw notFound();
  }

  const mapping = {
    full_name: changes.fullName,
    phone: changes.phone,
    guest_group: changes.guestGroup,
    status: changes.status,
  };
  const entries = Object.entries(mapping).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return getGuest(guestId, ownerId);
  }

  const sets = [];
  const values = [];
  let index = 1;
  for (const [column, value] of entries) {
    sets.push(`${column} = $${index}`);
    values.push(value);
    index += 1;
  }
  values.push(guestId, ownerId);

  const updated = await pool.query(
    `UPDATE guests g
     SET ${sets.join(', ')}
     FROM invitations i
     WHERE g.id = $${index} AND i.id = g.invitation_id AND i.owner_id = $${index + 1}
     RETURNING g.id, g.invitation_id, g.full_name, g.phone, g.guest_group, g.status, g.created_at, g.updated_at`,
    values,
  );
  if (updated.rows.length === 0) {
    throw notFound();
  }
  return toGuestDto(updated.rows[0]);
}

export async function getGuest(guestId, ownerId) {
  const { rows } = await pool.query(
    `SELECT g.id, g.invitation_id, g.full_name, g.phone, g.guest_group, g.status, g.created_at, g.updated_at
     FROM guests g
     JOIN invitations i ON i.id = g.invitation_id
     WHERE g.id = $1 AND i.owner_id = $2`,
    [guestId, ownerId],
  );
  if (rows.length === 0) {
    throw notFound();
  }
  return toGuestDto(rows[0]);
}

export async function deleteGuest(guestId, ownerId) {
  const { rowCount } = await pool.query(
    `DELETE FROM guests g
     USING invitations i
     WHERE g.id = $1 AND i.id = g.invitation_id AND i.owner_id = $2`,
    [guestId, ownerId],
  );
  if (rowCount === 0) {
    throw notFound();
  }
}

export async function getGuestStats(invitationId, ownerId) {
  await assertOwnInvitation(invitationId, ownerId);
  const { rows } = await pool.query(
    `SELECT
       COUNT(*)                                  AS total,
       COUNT(*) FILTER (WHERE status = 'hadir')       AS hadir,
       COUNT(*) FILTER (WHERE status = 'tidak-hadir') AS tidak_hadir,
       COUNT(*) FILTER (WHERE status = 'diundang')    AS diundang
     FROM guests
     WHERE invitation_id = $1`,
    [invitationId],
  );
  const row = rows[0];
  return {
    total: Number(row.total),
    hadir: Number(row.hadir),
    tidakHadir: Number(row.tidak_hadir),
    diundang: Number(row.diundang),
  };
}
