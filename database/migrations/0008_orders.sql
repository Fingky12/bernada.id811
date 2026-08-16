-- ============================================================
-- BERNADA.ID — Migrasi 0008 · Commerce Orders
-- Order paket: amount DITENTUKAN SERVER (dari packages.price_amount),
-- idempotency anti-duplikat, status lifecycle eksplisit.
-- (Sprint 6 — The Launch & Commerce Foundation)
-- ============================================================

-- ------------------------------------------------------------
-- orders — transaksi pembelian paket
-- ------------------------------------------------------------
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT NOT NULL UNIQUE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id      UUID NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  invitation_id   UUID REFERENCES invitations(id) ON DELETE SET NULL,
  amount          BIGINT NOT NULL CHECK (amount >= 0),
  currency        TEXT NOT NULL DEFAULT 'IDR',
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'awaiting_payment', 'paid', 'cancelled', 'expired', 'failed')),
  idempotency_key TEXT UNIQUE,
  expires_at      TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_invitation_id ON orders (invitation_id);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
