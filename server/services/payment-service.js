import { pool } from '../db.js';
import { HttpError } from '../lib/http-error.js';
import {
  getOrderById,
  toOrderDto,
  ORDER_COLUMNS,
  expireOverdueOrders,
} from './order-service.js';
import { getProvider } from './payment/index.js';

const PAYMENT_COLUMNS = `
  id, order_id, provider, provider_transaction_id, payment_reference,
  status, amount, currency, metadata, paid_at, created_at, updated_at
`;

const PAYMENT_COLUMNS_P = `
  p.id, p.order_id, p.provider, p.provider_transaction_id, p.payment_reference,
  p.status, p.amount, p.currency, p.metadata, p.paid_at, p.created_at, p.updated_at
`;

const NON_STARTABLE_STATUSES = ['cancelled', 'expired', 'failed'];

function toPaymentDto(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    provider: row.provider,
    providerTransactionId: row.provider_transaction_id,
    paymentReference: row.payment_reference,
    status: row.status,
    amount: Number(row.amount),
    currency: row.currency,
    metadata: row.metadata ?? {},
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createOrderPayment(userId, orderId) {
  const order = await getOrderById(userId, orderId);
  if (order.status === 'paid') {
    throw new HttpError(409, 'ALREADY_PAID', 'Order sudah dibayar.');
  }
  if (NON_STARTABLE_STATUSES.includes(order.status)) {
    throw new HttpError(
      409,
      'ORDER_STATUS_CONFLICT',
      `Order berstatus ${order.status} tidak dapat dibuatkan pembayaran.`,
    );
  }

  const provider = getProvider('manual');
  const client = await pool.connect();
  let committed = false;
  try {
    await client.query('BEGIN');

    // Re-check status & expiry di bawah row lock (anti-race: order expired /
    // dibatalkan antara pembacaan awal dan pembuatan payment).
    const { rows: lockedRows } = await client.query(
      `SELECT status, expires_at FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId],
    );
    if (lockedRows.length === 0) {
      throw new HttpError(404, 'NOT_FOUND', 'Order tidak ditemukan.');
    }
    const locked = lockedRows[0];
    if (locked.status === 'paid') {
      throw new HttpError(409, 'ALREADY_PAID', 'Order sudah dibayar.');
    }
    if (NON_STARTABLE_STATUSES.includes(locked.status)) {
      throw new HttpError(
        409,
        'ORDER_STATUS_CONFLICT',
        `Order berstatus ${locked.status} tidak dapat dibuatkan pembayaran.`,
      );
    }
    if (locked.expires_at && new Date(locked.expires_at).getTime() <= Date.now()) {
      await client.query(
        `UPDATE orders SET status = 'expired'
         WHERE id = $1 AND status IN ('pending', 'awaiting_payment')`,
        [orderId],
      );
      await client.query('COMMIT');
      committed = true;
      throw new HttpError(
        409,
        'ORDER_STATUS_CONFLICT',
        'Order telah kedaluwarsa (expired).',
      );
    }

    const { rows: existing } = await client.query(
      `SELECT ${PAYMENT_COLUMNS}
       FROM payments
       WHERE order_id = $1 AND status IN ('pending', 'succeeded')
       ORDER BY created_at DESC
       LIMIT 1`,
      [orderId],
    );
    if (existing.length > 0) {
      if (existing[0].status === 'succeeded') {
        await client.query(
          `UPDATE orders SET status = 'paid', paid_at = COALESCE(paid_at, NOW()) WHERE id = $1`,
          [orderId],
        );
      }
      await client.query('COMMIT');
      return { payment: toPaymentDto(existing[0]), created: false };
    }

    const created = await provider.createPayment({ order });
    const { rows } = await client.query(
      `INSERT INTO payments
         (order_id, provider, provider_transaction_id, payment_reference, status, amount, currency, metadata)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7)
       ON CONFLICT (order_id) WHERE status = 'pending'
       DO NOTHING
       RETURNING ${PAYMENT_COLUMNS}`,
      [
        orderId,
        provider.name,
        created.providerTransactionId ?? null,
        created.paymentReference ?? null,
        order.amount,
        order.currency,
        JSON.stringify(created.metadata ?? {}),
      ],
    );

    if (rows.length === 0) {
      // Request konkuren memenangkan pembuatan payment pending — kembalikan payment tersebut.
      await client.query('COMMIT');
      const { rows: winnerRows } = await client.query(
        `SELECT ${PAYMENT_COLUMNS}
         FROM payments
         WHERE order_id = $1 AND status = 'pending'
         ORDER BY created_at DESC
         LIMIT 1`,
        [orderId],
      );
      if (winnerRows.length === 0) {
        throw new HttpError(500, 'INTERNAL_ERROR', 'Pembayaran tidak dapat dipulihkan.');
      }
      return { payment: toPaymentDto(winnerRows[0]), created: false };
    }

    if (order.status === 'pending') {
      await client.query(
        `UPDATE orders SET status = 'awaiting_payment' WHERE id = $1 AND status = 'pending'`,
        [orderId],
      );
    }

    await client.query('COMMIT');
    committed = true;
    return { payment: toPaymentDto(rows[0]), created: true };
  } catch (error) {
    if (!committed) {
      await client.query('ROLLBACK').catch(() => {});
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function getOrderPayment(userId, orderId) {
  await getOrderById(userId, orderId);
  const { rows } = await pool.query(
    `SELECT ${PAYMENT_COLUMNS}
     FROM payments
     WHERE order_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [orderId],
  );
  return rows.length === 0 ? null : toPaymentDto(rows[0]);
}

export async function listPayments({ status = '', limit = 20, offset = 0 } = {}) {
  await expireOverdueOrders();
  const values = [];
  const conditions = [];
  if (status) {
    values.push(status);
    conditions.push(`p.status = $${values.length}`);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total FROM payments p ${where}`,
    values,
  );
  const total = Number(countResult.rows[0].total);

  const listResult = await pool.query(
    `SELECT ${PAYMENT_COLUMNS_P},
            o.order_number AS order_number,
            o.status AS order_status,
            u.email AS owner_email
       FROM payments p
       LEFT JOIN orders o ON o.id = p.order_id
       LEFT JOIN users u ON u.id = o.user_id
       ${where}
      ORDER BY p.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset],
  );

  return {
    payments: listResult.rows.map((row) => ({
      ...toPaymentDto(row),
      order: {
        id: row.order_id,
        orderNumber: row.order_number,
        status: row.order_status,
      },
      ownerEmail: row.owner_email,
    })),
    total,
    limit,
    offset,
  };
}

export async function verifyManualPayment(paymentId) {
  const client = await pool.connect();
  let committed = false;
  try {
    await client.query('BEGIN');

    const { rows: payRows } = await client.query(
      `SELECT ${PAYMENT_COLUMNS_P},
              o.order_number AS _order_number,
              o.status AS _order_status,
              o.expires_at AS _order_expires_at,
              o.invitation_id AS _invitation_id,
              o.package_id AS _order_package_id
       FROM payments p
       JOIN orders o ON o.id = p.order_id
       WHERE p.id = $1
       FOR UPDATE OF p`,
      [paymentId],
    );
    if (payRows.length === 0) {
      throw new HttpError(404, 'NOT_FOUND', 'Pembayaran tidak ditemukan.');
    }
    const pay = payRows[0];

    if (pay.provider !== 'manual') {
      throw new HttpError(
        409,
        'VERIFY_NOT_ALLOWED',
        'Verifikasi manual hanya untuk pembayaran provider manual.',
      );
    }
    if (pay.status !== 'pending') {
      throw new HttpError(
        409,
        'PAYMENT_STATUS_CONFLICT',
        `Pembayaran berstatus ${pay.status} tidak dapat diverifikasi.`,
      );
    }
    if (!['pending', 'awaiting_payment'].includes(pay._order_status)) {
      throw new HttpError(
        409,
        'ORDER_STATUS_CONFLICT',
        `Order berstatus ${pay._order_status} tidak dapat menerima pembayaran.`,
      );
    }

    // F2-08: order yang melewati expires_at tidak boleh diverifikasi menjadi paid.
    // Expiry dipersistkan di sini (order + payment pending) lalu transaksi di-commit
    // sebelum melempar 409, agar status expired tercatat walau tanpa akses lain.
    if (pay._order_expires_at && new Date(pay._order_expires_at).getTime() <= Date.now()) {
      await client.query(
        `UPDATE orders SET status = 'expired'
         WHERE id = $1 AND status IN ('pending', 'awaiting_payment')`,
        [pay.order_id],
      );
      await client.query(
        `UPDATE payments SET status = 'expired'
         WHERE id = $1 AND status = 'pending'`,
        [paymentId],
      );
      await client.query('COMMIT');
      committed = true;
      throw new HttpError(
        409,
        'ORDER_STATUS_CONFLICT',
        'Order telah kedaluwarsa (expired).',
      );
    }

    const payUpdate = await client.query(
      `UPDATE payments SET status = 'succeeded', paid_at = NOW()
       WHERE id = $1 AND status = 'pending'
       RETURNING ${PAYMENT_COLUMNS}`,
      [paymentId],
    );
    if (payUpdate.rows.length === 0) {
      throw new HttpError(409, 'PAYMENT_STATUS_CONFLICT', 'Pembayaran sudah berubah status.');
    }

    const orderUpdate = await client.query(
      `UPDATE orders SET status = 'paid', paid_at = COALESCE(paid_at, NOW())
       WHERE id = $1 AND status IN ('pending', 'awaiting_payment')
       RETURNING ${ORDER_COLUMNS}`,
      [pay.order_id],
    );
    if (orderUpdate.rows.length === 0) {
      throw new HttpError(409, 'ORDER_STATUS_CONFLICT', 'Order sudah dalam status terminal.');
    }
    const order = orderUpdate.rows[0];

    let entitlement = null;
    if (order.invitation_id && order.package_id) {
      const ent = await client.query(
        `UPDATE invitations SET package_id = $1
         WHERE id = $2 AND package_id IS DISTINCT FROM $1
         RETURNING id, package_id, status`,
        [order.package_id, order.invitation_id],
      );
      if (ent.rows.length > 0) {
        entitlement = {
          invitationId: ent.rows[0].id,
          packageId: ent.rows[0].package_id,
          status: ent.rows[0].status,
        };
      }
    }

    await client.query('COMMIT');
    committed = true;
    return {
      payment: toPaymentDto(payUpdate.rows[0]),
      order: toOrderDto(order),
      entitlement,
    };
  } catch (error) {
    if (!committed) {
      await client.query('ROLLBACK').catch(() => {});
    }
    throw error;
  } finally {
    client.release();
  }
}
