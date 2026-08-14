-- ============================================================
-- BERNADA.ID — Migrasi 0006 · Fix password_reset_tokens.updated_at
-- Migrasi 0005 membuat trigger trg_password_reset_tokens_updated_at
-- (via set_updated_at) yang menulis NEW.updated_at, namun kolom
-- updated_at tidak ada di tabel — menyebabkan error 42703
-- undefined_column saat token dipakai (UPDATE).
-- Menambahkan kolom agar konsisten dengan tabel lain.
-- ============================================================

ALTER TABLE password_reset_tokens
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
