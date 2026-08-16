import crypto from 'node:crypto';
import { pool } from '../db.js';
import { HttpError } from '../lib/http-error.js';
import { getActivePackageById } from './package-service.js';

const ORDER_COLUMNS = `
  id, order_number, user_id, package_id, invitation_id, amount, currency,
  status, idempotency_key, expires_at, paid_at, created_at, updated_at
`;

const CANCELLABLE_STATUSES = ['pending', 'awaiting_payment'];

function toOrderDto(row, pkg = null) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    packageId: row.package_id,
    invitationId: row.invitation_id,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    idempotencyKey: row.idempotency_key,
    expiresAt: row.expires_at,
    paidAt: row.paid_at,
    package: pkg ? { id: pkg.id, code: pkg.code, name: pkg.name } : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function notFound() {
  return new HttpError(404, 'NOT_FOUND', 'Order tidak ditemukan.');
}

async function nextOrderNumber() {
  const now = new Date();
  const date = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
  ].join('');
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ORD-${date}-${suffix}`;
}

async function assertInvitationOwned(invitationId, ownerId) {
  const { rows } = await pool.query(
    'SELECT id FROM invitations WHERE id = $1 AND owner_id = $2',
    [invitationId, ownerId],
  );
  if (rows.length === 0) {
    throw new HttpError(404, 'NOT_FOUND', 'Undangan tidak ditemukan.');
  }
}

async function findByIdentity(identifier, value) {
  const { rows } = await pool.query(
    `SELECT ${ORDER_COLUMNS}
     FROM orders
     WHERE ${identifier} = $1
     LIMIT 1`,
    [value],
  );
  return rows.length === 0 ? null : rows[0];
}

export async function createOrder(userId, { packageId, invitationId, idempotencyKey }) {
  const pkg = await getActivePackageById(packageId);

  if (idempotencyKey) {
    const existing = await findByIdentity('idempotency_key', idempotencyKey);
    if (existing) {
      if (existing.user_id !== userId) {
        throw new HttpError(409, 'IDEMPOTENCY_CONFLICT', 'Kunci idempotency sudah dipakai.');
      }
      return { order: toOrderDto(existing), created: false };
    }
  }

  if (invitationId) {
    await assertInvitationOwned(invitationId, userId);
  }

  const autoPaid = Number(pkg.priceAmount) === 0;
  const status = autoPaid ? 'paid' : 'pending';
  const paidAt = autoPaid ? new Date() : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let orderNumber;
    let inserted = null;
    for (let attempt = 0; attempt < 5 && !inserted; attempt += 1) {
      orderNumber = await nextOrderNumber();
      try {
        const { rows } = await client.query(
          `INSERT INTO orders
             (order_number, user_id, package_id, invitation_id, amount, currency, status, idempotency_key, paid_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING ${ORDER_COLUMNS}`,
          [
            orderNumber,
            userId,
            pkg.id,
            invitationId ?? null,
            pkg.priceAmount,
            pkg.currency,
            status,
            idempotencyKey ?? null,
            paidAt,
          ],
        );
        inserted = rows[0];
      } catch (error) {
        const isUniqueViolation = error?.code === '23505';
        if (!isUniqueViolation || attempt === 4) {
          throw error;
        }
      }
    }
    await client.query('COMMIT');
    return { order: toOrderDto(inserted, pkg), created: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getOrderById(userId, orderId) {
  const row = await findByIdentity('id', orderId);
  if (!row || row.user_id !== userId) {
    throw notFound();
  }
  const pkg = row.package_id
    ? await getPackageSummary(row.package_id)
    : null;
  return toOrderDto(row, pkg);
}

export async function getPackageSummary(packageId) {
  const { rows } = await pool.query(
    'SELECT id, code, name FROM packages WHERE id = $1',
    [packageId],
  );
  return rows.length === 0 ? null : rows[0];
}

export async function listOrders(userId) {
  const { rows } = await pool.query(
    `SELECT o.id, o.order_number, o.user_id, o.package_id, o.invitation_id, o.amount, o.currency,
            o.status, o.idempotency_key, o.expires_at, o.paid_at, o.created_at, o.updated_at,
            p.code AS package_code, p.name AS package_name
     FROM orders o
     LEFT JOIN packages p ON p.id = o.package_id
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC
     LIMIT 100`,
    [userId],
  );
  return rows.map((row) => toOrderDto(row, {
    id: row.package_id,
    code: row.package_code,
    name: row.package_name,
  }));
}

export async function cancelOrder(userId, orderId) {
  const order = await getOrderById(userId, orderId);
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    throw new HttpError(
      409,
      'ORDER_STATUS_CONFLICT',
      `Order berstatus ${order.status} tidak dapat dibatalkan.`,
    );
  }
  await pool.query(
    `UPDATE orders SET status = 'cancelled' WHERE id = $1 AND user_id = $2`,
    [orderId, userId],
  );
  return getOrderById(userId, orderId);
}
