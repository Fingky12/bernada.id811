-- ============================================================
-- BERNADA.ID — Migrasi 0002 · Autentikasi & Template
-- Menambahkan refresh_tokens dan mengisi data template awal.
-- ============================================================

-- ------------------------------------------------------------
-- refresh_tokens — token refresh (rotasi, disimpan hashed)
-- ------------------------------------------------------------
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens (expires_at);

-- ------------------------------------------------------------
-- Seed templates — 6 template awal dari portofolio landing page
-- ------------------------------------------------------------
INSERT INTO templates (name, slug, description, category, preview_url, is_active) VALUES
  ('Klasik Minimal',   'klasik-minimal',   'Desain bersih dan tenang, fokus pada pasangan.',            'wedding', '/assets/img/portfolio-1.svg', TRUE),
  ('Merah Elegan',     'merah-elegan',     'Merah hangat yang berkelas untuk hari istimewa.',            'wedding', '/assets/img/portfolio-2.svg', TRUE),
  ('Border Bunga',     'border-bunga',     'Border bunga romantis yang menawan.',                        'wedding', '/assets/img/portfolio-3.svg', TRUE),
  ('Gold Mewah',       'gold-mewah',       'Aksen emas mewah untuk kesan premium.',                      'wedding', '/assets/img/portfolio-4.svg', TRUE),
  ('Pita Emas',        'pita-emas',        'Pita emas menambah sentuhan manis dan klasik.',              'wedding', '/assets/img/portfolio-5.svg', TRUE),
  ('Diagonal Modern',  'diagonal-modern',  'Komposisi diagonal modern untuk pasangan masa kini.',        'wedding', '/assets/img/portfolio-6.svg', TRUE);
