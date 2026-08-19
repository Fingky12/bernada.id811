import crypto from 'node:crypto';
import { pool } from '../db.js';
import { config } from '../config.js';
import { HttpError } from '../lib/http-error.js';
import { getActivePackageById } from './package-service.js';

export const ORDER_COLUMNS = `
  id, order_number, user_id, package_id, invitation_id, amount, currency,
  status, idempotency_key, expires_at, paid_at, created_at, updated_at
`;

const CANCELLABLE_STATUSES = ['pending', 'awaiting_payment'];

export function toOrderDto(row, pkg = null) {
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
    package: pkg ? { id: pkg.id, code: pkg.code, name: pkg.name, tier: pkg.tier } : null,
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

// F2-08 — Order expiry (mekanisme lazy + deterministik, tanpa background worker).
// Transisi: pending/awaiting_payment → expired, hanya bila expires_at terlewat.
// Order terminal (paid/cancelled/failed/expired) tidak pernah ter-expriy.
async function expireOrderRows(client, orderId) {
  const { rows } = await client.query(
    `UPDATE orders SET status = 'expired'
     WHERE id = $1 AND status IN ('pending', 'awaiting_payment')
       AND expires_at IS NOT NULL AND expires_at <= NOW()
     RETURNING id`,
    [orderId],
  );
  if (rows.length > 0) {
    await client.query(
      `UPDATE payments SET status = 'expired'
       WHERE order_id = $1 AND status = 'pending'`,
      [orderId],
    );
  }
  return rows.length > 0;
}

function isDueForExpiry(row) {
  if (!row || !row.expires_at) return false;
  if (!['pending', 'awaiting_payment'].includes(row.status)) return false;
  return new Date(row.expires_at).getTime() <= Date.now();
}

// Expiry scoped satu order — dipanggil dari jalur baca/transisi yang menyentuh
// order, sehingga status expired selalu terlihat konsisten tanpa worker.
export async function expireOrderIfDue(orderId) {
  const { rows } = await pool.query(
    'SELECT status, expires_at FROM orders WHERE id = $1',
    [orderId],
  );
  if (!isDueForExpiry(rows[0])) return false;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const expired = await expireOrderRows(client, orderId);
    await client.query('COMMIT');
    return expired;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Sweep global satu kali — dipakai pada list orders/payments agar status order
// kedaluwarsa akurat saat dilihat. Deterministik & idempoten.
export async function expireOverdueOrders() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE orders SET status = 'expired'
       WHERE status IN ('pending', 'awaiting_payment')
         AND expires_at IS NOT NULL AND expires_at <= NOW()
       RETURNING id`,
    );
    for (const row of rows) {
      await client.query(
        `UPDATE payments SET status = 'expired'
         WHERE order_id = $1 AND status = 'pending'`,
        [row.id],
      );
    }
    await client.query('COMMIT');
    return rows.length;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
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
  // F2-08: batas waktu pembayaran ditetapkan saat order dibuat (konsisten untuk
  // order berbayar — termasuk yang nantinya menjadi 'awaiting_payment').
  const expiresAt = autoPaid
    ? null
    : new Date(Date.now() + config.orderPaymentExpiryHours * 60 * 60 * 1000);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const orderNumber = await nextOrderNumber();
      try {
        await client.query('SAVEPOINT order_insert');
        const { rows } = await client.query(
          `INSERT INTO orders
             (order_number, user_id, package_id, invitation_id, amount, currency, status, idempotency_key, expires_at, paid_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
            expiresAt,
            paidAt,
          ],
        );
        await client.query('RELEASE SAVEPOINT order_insert');
        if (rows[0].status === 'paid' && rows[0].invitation_id) {
          await client.query(
            `UPDATE invitations SET package_id = $1
             WHERE id = $2 AND package_id IS DISTINCT FROM $1`,
            [rows[0].package_id, rows[0].invitation_id],
          );
        }
        await client.query('COMMIT');
        return { order: toOrderDto(rows[0], pkg), created: true };
      } catch (error) {
        await client.query('ROLLBACK TO SAVEPOINT order_insert');
        if (error?.code === '23505' && error?.constraint === 'orders_idempotency_key_key') {
          // Duplikat idempotency dari request konkuren — DB sebagai sumber kebenaran:
          // kembalikan order yang sudah menang.
          const { rows: existingRows } = await client.query(
            `SELECT ${ORDER_COLUMNS} FROM orders WHERE idempotency_key = $1 LIMIT 1`,
            [idempotencyKey],
          );
          await client.query('COMMIT');
          const existing = existingRows[0];
          if (!existing) {
            throw new HttpError(500, 'INTERNAL_ERROR', 'Konflik idempotency tidak dapat diselesaikan.');
          }
          if (existing.user_id !== userId) {
            throw new HttpError(409, 'IDEMPOTENCY_CONFLICT', 'Kunci idempotency sudah dipakai.');
          }
          return { order: toOrderDto(existing), created: false };
        }
        if (error?.code === '23505' && error?.constraint === 'orders_order_number_key' && attempt < 4) {
          continue;
        }
        throw error;
      }
    }
    throw new HttpError(500, 'INTERNAL_ERROR', 'Gagal membuat nomor order unik.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getOrderById(userId, orderId) {
  await expireOrderIfDue(orderId);
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
    'SELECT id, code, name, tier FROM packages WHERE id = $1',
    [packageId],
  );
  return rows.length === 0 ? null : rows[0];
}

export async function listOrders(userId) {
  await expireOverdueOrders();
  const { rows } = await pool.query(
    `SELECT o.id, o.order_number, o.user_id, o.package_id, o.invitation_id, o.amount, o.currency,
            o.status, o.idempotency_key, o.expires_at, o.paid_at, o.created_at, o.updated_at,
            p.code AS package_code, p.name AS package_name, p.tier AS package_tier
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
    tier: row.package_tier,
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
