import { pool } from '../db.js';
import { HttpError } from '../lib/http-error.js';
import { getOrderById } from './order-service.js';
import { getProvider } from './payment/index.js';

const PAYMENT_COLUMNS = `
  id, order_id, provider, provider_transaction_id, payment_reference,
  status, amount, currency, metadata, paid_at, created_at, updated_at
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
  try {
    await client.query('BEGIN');

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

    if (order.status === 'pending') {
      await client.query(
        `UPDATE orders SET status = 'awaiting_payment' WHERE id = $1 AND status = 'pending'`,
        [orderId],
      );
    }

    await client.query('COMMIT');
    return { payment: toPaymentDto(rows[0]), created: true };
  } catch (error) {
    await client.query('ROLLBACK');
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
