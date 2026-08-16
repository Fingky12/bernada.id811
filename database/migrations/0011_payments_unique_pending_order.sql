-- ============================================================
-- BERNADA.ID — Migrasi 0011 · Payments: unique pending per order
-- Mencegah payment 'pending' ganda untuk satu order saat dua request
-- createOrderPayment konkuren (Sprint 7 — Security & Commerce Hardening, F2-06).
-- Non-destructive: hanya menambah index parsial; data existing tidak diubah.
-- ============================================================

CREATE UNIQUE INDEX idx_payments_unique_pending_order
  ON payments (order_id)
  WHERE status = 'pending';
