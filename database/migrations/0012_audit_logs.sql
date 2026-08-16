-- ============================================================
-- BERNADA.ID — Migrasi 0012 · Audit Trail
-- Catatan append-only untuk aksi administratif yang penting
-- (Sprint 8 — Admin Payment UI & Audit Trail).
-- Setiap aksi verify pembayaran manual direkam: siapa, apa,
-- dari/ke status apa, dan hasilnya (success / kode error).
-- Tidak menyimpan password, token, secret, atau API key.
-- Snapshot denormalized (actor_email, order_number) menjaga
-- jejak tetap terbaca walau user/order terhapus.
-- Non-destructive: hanya menambah tabel baru.
-- ============================================================

CREATE TABLE audit_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_email         TEXT NOT NULL,
  action              TEXT NOT NULL,
  payment_id          UUID REFERENCES payments(id) ON DELETE SET NULL,
  order_id            UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_number        TEXT,
  prev_payment_status TEXT,
  new_payment_status  TEXT,
  prev_order_status   TEXT,
  new_order_status    TEXT,
  result              TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_payment_id ON audit_logs (payment_id);
CREATE INDEX idx_audit_logs_order_id ON audit_logs (order_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);
