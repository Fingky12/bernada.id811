import { pool } from '../db.js';

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
      (SELECT COUNT(*) FROM gift_accounts WHERE is_active)    AS gift_accounts_active
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
