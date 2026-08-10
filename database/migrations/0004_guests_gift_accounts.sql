-- ============================================================
-- BERNADA.ID — Migrasi 0004 · Manajemen Tamu & Amplop Digital
-- Menambahkan tabel guests (daftar tamu & status RSVP pemilik)
-- dan gift_accounts (info transfer / amplop digital).
-- ============================================================

-- ------------------------------------------------------------
-- guests — daftar tamu yang dikelola pemilik undangan
-- ------------------------------------------------------------
CREATE TABLE guests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL DEFAULT '',
  guest_group   TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'diundang'
                CHECK (status IN ('diundang', 'hadir', 'tidak-hadir')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guests_invitation_id ON guests (invitation_id);

CREATE TRIGGER trg_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- gift_accounts — info transfer / amplop digital undangan
-- ------------------------------------------------------------
CREATE TABLE gift_accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id  UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  bank_name      TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name   TEXT NOT NULL DEFAULT '',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order     INT  NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gift_accounts_invitation_id ON gift_accounts (invitation_id);

CREATE TRIGGER trg_gift_accounts_updated_at
  BEFORE UPDATE ON gift_accounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
