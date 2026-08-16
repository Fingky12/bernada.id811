-- ============================================================
-- BERNADA.ID — Migrasi 0009 · Commerce Payments
-- Boundary pembayaran provider-agnostic. Status hanya ditentukan
-- backend/provider; TIDAK PERNAH diset dari request frontend.
-- Provider aktif saat ini: manual/dev (PAYMENT PROVIDER DECISION REQUIRED).
-- (Sprint 6 — The Launch & Commerce Foundation)
-- ============================================================

CREATE TABLE payments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  provider                TEXT NOT NULL,
  provider_transaction_id TEXT,
  payment_reference       TEXT,
  status                  TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'succeeded', 'failed', 'expired')),
  amount                  BIGINT NOT NULL CHECK (amount >= 0),
  currency                TEXT NOT NULL DEFAULT 'IDR',
  metadata                JSONB NOT NULL DEFAULT '{}'::jsonb,
  paid_at                 TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments (order_id);
CREATE INDEX idx_payments_provider_transaction_id ON payments (provider_transaction_id);

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
