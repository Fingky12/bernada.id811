import { pool } from '../db.js';

// Audit trail (Sprint 8). Mencatat aksi administratif penting secara
// append-only. db = objek yang punya .query() (pool atau client transaksi).
// Tidak pernah menyimpan password, token, secret, atau API key.
export async function recordAudit(db, entry) {
  await db.query(
    `INSERT INTO audit_logs
       (actor_user_id, actor_email, action, payment_id, order_id, order_number,
        prev_payment_status, new_payment_status, prev_order_status,
        new_order_status, result)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      entry.actorUserId ?? null,
      entry.actorEmail ?? '',
      entry.action,
      entry.paymentId ?? null,
      entry.orderId ?? null,
      entry.orderNumber ?? null,
      entry.prevPaymentStatus ?? null,
      entry.newPaymentStatus ?? null,
      entry.prevOrderStatus ?? null,
      entry.newOrderStatus ?? null,
      entry.result ?? 'success',
    ],
  );
}

export async function listAuditLogs({ paymentId, limit = 20, offset = 0 } = {}) {
  const values = [];
  const conditions = [];
  if (paymentId) {
    values.push(paymentId);
    conditions.push(`payment_id = $${values.length}`);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total FROM audit_logs ${where}`,
    values,
  );
  const total = Number(countResult.rows[0].total);

  const listResult = await pool.query(
    `SELECT id, actor_user_id, actor_email, action, payment_id, order_id,
            order_number, prev_payment_status, new_payment_status,
            prev_order_status, new_order_status, result, created_at
       FROM audit_logs
       ${where}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset],
  );

  return {
    logs: listResult.rows.map((row) => ({
      id: row.id,
      actorUserId: row.actor_user_id,
      actorEmail: row.actor_email,
      action: row.action,
      paymentId: row.payment_id,
      orderId: row.order_id,
      orderNumber: row.order_number,
      prevPaymentStatus: row.prev_payment_status,
      newPaymentStatus: row.new_payment_status,
      prevOrderStatus: row.prev_order_status,
      newOrderStatus: row.new_order_status,
      result: row.result,
      createdAt: row.created_at,
    })),
    total,
    limit,
    offset,
  };
}
