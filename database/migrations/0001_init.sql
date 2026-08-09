-- ============================================================
-- BERNADA.ID — Migrasi 0001 · Skema Awal (Core)
-- Membuat tabel inti platform: users, templates, invitations.
-- PostgreSQL 13+ (gen_random_uuid() bawaan).
-- ============================================================

-- Trigger helper untuk mengisi updated_at secara otomatis.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- users — akun pengguna (autentikasi Fase 2)
-- ------------------------------------------------------------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- templates — template undangan
-- ------------------------------------------------------------
CREATE TABLE templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL DEFAULT 'wedding',
  preview_url  TEXT NOT NULL DEFAULT '',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- invitations — undangan yang dibuat pengguna
-- ------------------------------------------------------------
CREATE TABLE invitations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id   UUID REFERENCES templates(id) ON DELETE SET NULL,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  event_date    TIMESTAMPTZ,
  event_time    TEXT NOT NULL DEFAULT '',
  venue         TEXT NOT NULL DEFAULT '',
  location      TEXT NOT NULL DEFAULT '',
  couple        TEXT NOT NULL DEFAULT '',
  message       TEXT NOT NULL DEFAULT '',
  theme         JSONB NOT NULL DEFAULT '{}'::jsonb,
  music_url     TEXT NOT NULL DEFAULT '',
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitations_owner_id ON invitations (owner_id);
CREATE INDEX idx_invitations_slug ON invitations (slug);

CREATE TRIGGER trg_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
