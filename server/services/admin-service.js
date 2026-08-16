import { pool } from '../db.js';
import { HttpError } from '../lib/http-error.js';

const USER_COLUMNS = 'id, email, full_name, role, created_at';

function toUserDto(row) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
  };
}

function userNotFound() {
  return new HttpError(404, 'NOT_FOUND', 'Pengguna tidak ditemukan.');
}

export async function getStats() {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users)                            AS users,
      (SELECT COUNT(*) FROM users WHERE role = 'admin')       AS admins,
      (SELECT COUNT(*) FROM invitations)                      AS invitations,
      (SELECT COUNT(*) FROM invitations WHERE is_published)   AS invitations_published,
      (SELECT COUNT(*) FROM guestbook)                        AS guestbook_entries,
      (SELECT COUNT(*) FROM guests)                           AS guests,
      (SELECT COUNT(*) FROM gift_accounts)                    AS gift_accounts,
      (SELECT COUNT(*) FROM gift_accounts WHERE is_active)    AS gift_accounts_active,
      (SELECT COUNT(*) FROM payments WHERE status = 'pending') AS pending_payments
  `);
  const row = rows[0];
  return {
    users: Number(row.users),
    admins: Number(row.admins),
    invitations: Number(row.invitations),
    invitationsPublished: Number(row.invitations_published),
    guestbookEntries: Number(row.guestbook_entries),
    guests: Number(row.guests),
    giftAccounts: Number(row.gift_accounts),
    giftAccountsActive: Number(row.gift_accounts_active),
    pendingPayments: Number(row.pending_payments),
  };
}

export async function listUsers({ search = '', role = '', limit = 20, offset = 0 } = {}) {
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(email ILIKE $${values.length} OR full_name ILIKE $${values.length})`);
  }
  if (role === 'admin' || role === 'user') {
    values.push(role);
    conditions.push(`role = $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total FROM users ${where}`,
    values,
  );
  const total = Number(countResult.rows[0].total);

  const listResult = await pool.query(
    `SELECT ${USER_COLUMNS}
       FROM users
       ${where}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset],
  );

  return {
    users: listResult.rows.map(toUserDto),
    total,
    limit,
    offset,
  };
}

export async function setUserRole(userId, role, actorId) {
  const targetResult = await pool.query(
    'SELECT id, role FROM users WHERE id = $1',
    [userId],
  );
  if (targetResult.rows.length === 0) {
    throw userNotFound();
  }
  const target = targetResult.rows[0];

  if (target.id === actorId) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Tidak bisa mengubah peran akun sendiri.');
  }

  if (target.role === 'admin' && role === 'user') {
    const adminResult = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'admin'",
    );
    if (Number(adminResult.rows[0].total) <= 1) {
      throw new HttpError(409, 'LAST_ADMIN', 'Tidak bisa menurunkan admin terakhir.');
    }
  }

  const { rows } = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2 RETURNING ${USER_COLUMNS}`,
    [role, userId],
  );
  return toUserDto(rows[0]);
}

export async function getUserDetail(userId) {
  const userResult = await pool.query(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
    [userId],
  );
  if (userResult.rows.length === 0) {
    throw userNotFound();
  }
  const user = toUserDto(userResult.rows[0]);

  const countsResult = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM invitations WHERE owner_id = $1) AS invitations,
       (SELECT COUNT(*) FROM invitations WHERE owner_id = $1 AND is_published) AS invitations_published,
       (SELECT COUNT(*) FROM guests
         WHERE invitation_id IN (SELECT id FROM invitations WHERE owner_id = $1)) AS guests,
       (SELECT COUNT(*) FROM gift_accounts
         WHERE invitation_id IN (SELECT id FROM invitations WHERE owner_id = $1)) AS gift_accounts,
       (SELECT COUNT(*) FROM guestbook
         WHERE invitation_id IN (SELECT id FROM invitations WHERE owner_id = $1)) AS guestbook_entries
    `,
    [userId],
  );
  const row = countsResult.rows[0];

  return {
    user,
    counts: {
      invitations: Number(row.invitations),
      invitationsPublished: Number(row.invitations_published),
      guests: Number(row.guests),
      giftAccounts: Number(row.gift_accounts),
      guestbookEntries: Number(row.guestbook_entries),
    },
  };
}

export async function listInvitations({ search = '', status = '', limit = 20, offset = 0 } = {}) {
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(i.title ILIKE $${values.length}
        OR i.slug ILIKE $${values.length}
        OR u.email ILIKE $${values.length}
        OR u.full_name ILIKE $${values.length})`,
    );
  }
  if (status === 'published') {
    conditions.push('i.is_published = TRUE');
  } else if (status === 'draft') {
    conditions.push('i.is_published = FALSE');
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total
       FROM invitations i
       LEFT JOIN users u ON u.id = i.owner_id
       ${where}`,
    values,
  );
  const total = Number(countResult.rows[0].total);

  const listResult = await pool.query(
    `SELECT i.id, i.owner_id, i.slug, i.title, i.is_published, i.published_at, i.created_at,
            u.email AS owner_email, u.full_name AS owner_name,
            t.name AS template_name
       FROM invitations i
       LEFT JOIN users u ON u.id = i.owner_id
       LEFT JOIN templates t ON t.id = i.template_id
       ${where}
      ORDER BY i.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset],
  );

  return {
    invitations: listResult.rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      isPublished: row.is_published,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      owner: {
        id: row.owner_id,
        email: row.owner_email,
        fullName: row.owner_name,
      },
      templateName: row.template_name,
    })),
    total,
    limit,
    offset,
  };
}

export async function unpublishInvitation(id) {
  const { rows } = await pool.query(
    `UPDATE invitations
        SET is_published = FALSE, published_at = NULL
      WHERE id = $1
      RETURNING id, slug, title, is_published, published_at`,
    [id],
  );
  if (rows.length === 0) {
    throw new HttpError(404, 'NOT_FOUND', 'Undangan tidak ditemukan.');
  }
  const row = rows[0];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    isPublished: row.is_published,
    publishedAt: row.published_at,
  };
}

export async function listGuestbookEntries({ search = '', limit = 20, offset = 0 } = {}) {
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(g.guest_name ILIKE $${values.length} OR g.message ILIKE $${values.length})`,
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total FROM guestbook g ${where}`,
    values,
  );
  const total = Number(countResult.rows[0].total);

  const listResult = await pool.query(
    `SELECT g.id, g.guest_name, g.attendance, g.guests_count, g.message, g.created_at,
            i.title AS invitation_title, i.slug AS invitation_slug
       FROM guestbook g
       LEFT JOIN invitations i ON i.id = g.invitation_id
       ${where}
      ORDER BY g.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset],
  );

  return {
    entries: listResult.rows.map((row) => ({
      id: row.id,
      guestName: row.guest_name,
      attendance: row.attendance,
      guestsCount: row.guests_count,
      message: row.message,
      createdAt: row.created_at,
      invitation: {
        title: row.invitation_title,
        slug: row.invitation_slug,
      },
    })),
    total,
    limit,
    offset,
  };
}

export async function deleteGuestbookEntry(entryId) {
  const { rowCount } = await pool.query(
    'DELETE FROM guestbook WHERE id = $1',
    [entryId],
  );
  if (rowCount === 0) {
    throw new HttpError(404, 'NOT_FOUND', 'Entri buku tamu tidak ditemukan.');
  }
}
