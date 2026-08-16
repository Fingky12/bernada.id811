-- ============================================================
-- BERNADA.ID — Migrasi 0007 · Commerce Packages
-- Membuat fondasi paket & harga (Sprint 6 — The Launch & Commerce Foundation).
-- Harga seed adalah PLACEHOLDER — keputusan bisnis final menunggu Owner
-- (BUSINESS DECISION REQUIRED). Backend tetap menjadi source of truth.
-- ============================================================

-- ------------------------------------------------------------
-- packages — paket undangan
-- ------------------------------------------------------------
CREATE TABLE packages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  price_amount  BIGINT NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'IDR',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_packages_code ON packages (code);
CREATE INDEX idx_packages_is_active_sort ON packages (is_active, sort_order);

CREATE TRIGGER trg_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- package_features — daftar fitur per paket
-- ------------------------------------------------------------
CREATE TABLE package_features (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id   UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  feature      TEXT NOT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_package_features_package_id ON package_features (package_id);

CREATE TRIGGER trg_package_features_updated_at
  BEFORE UPDATE ON package_features
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Seed 4 paket — PLACEHOLDER (BUSINESS DECISION REQUIRED)
-- Harga adalah nilai sementara (meniru harga sampel landing page
-- untuk PREMIUM/EXCLUSIVE); BASIC belum punya acuan harga.
-- ============================================================
INSERT INTO packages (code, name, description, price_amount, currency, is_active, sort_order) VALUES
  ('free',      'Gratis',    'Untuk mencoba merasakan pengalaman membuat undangan digital.',                    0,      'IDR', TRUE, 1),
  ('basic',     'Basic',     'Paket dasar untuk undangan digital yang berkesan.',                               0,      'IDR', TRUE, 2),
  ('premium',   'Premium',   'Paket lengkap untuk undangan yang berkesan dan mudah dikelola.',                  99000,  'IDR', TRUE, 3),
  ('exclusive', 'Eksklusif', 'Paket eksklusif untuk pengalaman paling premium dan personal.',                   199000, 'IDR', TRUE, 4);

-- Fitur per paket — konten PLACEHOLDER (BUSINESS DECISION REQUIRED)
INSERT INTO package_features (package_id, feature, sort_order)
SELECT p.id, f.feature, f.sort_order
FROM packages p
JOIN (VALUES
  ('free',      'Buat undangan digital',             1),
  ('free',      'Template dasar',                    2),
  ('free',      'Halaman undangan publik',           3),
  ('basic',     'Semua fitur Gratis',                1),
  ('basic',     'Pilihan template lebih banyak',     2),
  ('basic',     'Kustomisasi tema warna',            3),
  ('premium',   'Semua fitur Basic',                 1),
  ('premium',   'Manajemen tamu & amplop digital',   2),
  ('premium',   'RSVP & buku tamu',                  3),
  ('premium',   'Tanpa watermark BERNADA.ID',        4),
  ('exclusive', 'Semua fitur Premium',               1),
  ('exclusive', 'Kustomisasi penuh & desain prioritas', 2),
  ('exclusive', 'Dukungan prioritas',                3)
) AS f(package_code, feature, sort_order) ON f.package_code = p.code;
