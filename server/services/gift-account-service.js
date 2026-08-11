import { pool } from '../db.js';
import { HttpError } from '../lib/http-error.js';

const COLUMNS = 'id, invitation_id, bank_name, account_number, account_name, is_active, sort_order, created_at, updated_at';

function toGiftAccountDto(row) {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    bankName: row.bank_name,
    accountNumber: row.account_number,
    accountName: row.account_name,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function notFound() {
  return new HttpError(404, 'NOT_FOUND', 'Rekening amplop digital tidak ditemukan.');
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

export async function listGiftAccounts(invitationId, ownerId) {
  await assertOwnInvitation(invitationId, ownerId);
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM gift_accounts
     WHERE invitation_id = $1
     ORDER BY sort_order ASC, created_at ASC`,
    [invitationId],
  );
  return rows.map(toGiftAccountDto);
}

export async function createGiftAccount(invitationId, ownerId, data) {
  await assertOwnInvitation(invitationId, ownerId);
  const { rows } = await pool.query(
    `INSERT INTO gift_accounts
       (invitation_id, bank_name, account_number, account_name, is_active, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [
      invitationId,
      data.bankName,
      data.accountNumber,
      data.accountName,
      data.isActive ?? true,
      data.sortOrder ?? 0,
    ],
  );
  return toGiftAccountDto(rows[0]);
}

export async function updateGiftAccount(giftAccountId, ownerId, changes) {
  const { rows } = await pool.query(
    `SELECT ga.id FROM gift_accounts ga
     JOIN invitations i ON i.id = ga.invitation_id
     WHERE ga.id = $1 AND i.owner_id = $2`,
    [giftAccountId, ownerId],
  );
  if (rows.length === 0) {
    throw notFound();
  }

  const mapping = {
    bank_name: changes.bankName,
    account_number: changes.accountNumber,
    account_name: changes.accountName,
    is_active: changes.isActive,
    sort_order: changes.sortOrder,
  };
  const entries = Object.entries(mapping).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return getGiftAccount(giftAccountId, ownerId);
  }

  const sets = [];
  const values = [];
  let index = 1;
  for (const [column, value] of entries) {
    sets.push(`${column} = $${index}`);
    values.push(value);
    index += 1;
  }
  values.push(giftAccountId, ownerId);

  const updated = await pool.query(
    `UPDATE gift_accounts ga
     SET ${sets.join(', ')}
     FROM invitations i
     WHERE ga.id = $${index} AND i.id = ga.invitation_id AND i.owner_id = $${index + 1}
     RETURNING ga.id, ga.invitation_id, ga.bank_name, ga.account_number, ga.account_name,
               ga.is_active, ga.sort_order, ga.created_at, ga.updated_at`,
    values,
  );
  if (updated.rows.length === 0) {
    throw notFound();
  }
  return toGiftAccountDto(updated.rows[0]);
}

export async function getGiftAccount(giftAccountId, ownerId) {
  const { rows } = await pool.query(
    `SELECT ga.id, ga.invitation_id, ga.bank_name, ga.account_number, ga.account_name,
            ga.is_active, ga.sort_order, ga.created_at, ga.updated_at
     FROM gift_accounts ga
     JOIN invitations i ON i.id = ga.invitation_id
     WHERE ga.id = $1 AND i.owner_id = $2`,
    [giftAccountId, ownerId],
  );
  if (rows.length === 0) {
    throw notFound();
  }
  return toGiftAccountDto(rows[0]);
}

export async function deleteGiftAccount(giftAccountId, ownerId) {
  const { rowCount } = await pool.query(
    `DELETE FROM gift_accounts ga
     USING invitations i
     WHERE ga.id = $1 AND i.id = ga.invitation_id AND i.owner_id = $2`,
    [giftAccountId, ownerId],
  );
  if (rowCount === 0) {
    throw notFound();
  }
}

export async function listPublicGiftAccounts(slug) {
  const { rows } = await pool.query(
    `SELECT ga.id, ga.bank_name, ga.account_number, ga.account_name
     FROM gift_accounts ga
     JOIN invitations i ON i.id = ga.invitation_id
     WHERE i.slug = $1 AND i.is_published = TRUE AND ga.is_active = TRUE
     ORDER BY ga.sort_order ASC, ga.created_at ASC`,
    [slug],
  );
  return rows.map((row) => ({
    id: row.id,
    bankName: row.bank_name,
    accountNumber: row.account_number,
    accountName: row.account_name,
  }));
}
