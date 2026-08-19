-- ============================================================
-- BERNADA.ID — Migrasi 0013 · Pricing Tier Model
-- Mengubah model 4-package menjadi 3-tier pricing.
-- Template mendapat kolom tier. Package mendapat kolom tier.
-- Harga final: BASIC=77000, PREMIUM=129000, EKSCLUSUSIF=279000
-- Package 'free' dinonaktifkan (data existing tetap aman).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tambah kolom tier ke templates
-- ------------------------------------------------------------
ALTER TABLE templates ADD COLUMN tier TEXT NOT NULL DEFAULT 'basic';

ALTER TABLE templates ADD CONSTRAINT chk_templates_tier
  CHECK (tier IN ('basic', 'premium', 'exclusive'));

CREATE INDEX idx_templates_tier ON templates (tier);

-- ------------------------------------------------------------
-- 2. Backfill tier untuk 6 template yang ada
--    basic: Klasik Minimal, Diagonal Modern
--    premium: Merah Elegan, Border Bunga, Pita Emas
--    exclusive: Gold Mewah
-- ------------------------------------------------------------
UPDATE templates SET tier = 'basic'    WHERE slug IN ('klasik-minimal', 'diagonal-modern');
UPDATE templates SET tier = 'premium'  WHERE slug IN ('merah-elegan', 'border-bunga', 'pita-emas');
UPDATE templates SET tier = 'exclusive' WHERE slug = 'gold-mewah';

-- ------------------------------------------------------------
-- 3. Tambah kolom tier ke packages
-- ------------------------------------------------------------
ALTER TABLE packages ADD COLUMN tier TEXT;

ALTER TABLE packages ADD CONSTRAINT chk_packages_tier
  CHECK (tier IS NULL OR tier IN ('basic', 'premium', 'exclusive'));

-- ------------------------------------------------------------
-- 4. Set tier dan harga final untuk package aktif
-- ------------------------------------------------------------
UPDATE packages SET tier = 'basic',     price_amount = 77000   WHERE code = 'basic';
UPDATE packages SET tier = 'premium',   price_amount = 129000  WHERE code = 'premium';
UPDATE packages SET tier = 'exclusive', price_amount = 279000  WHERE code = 'exclusive';

-- Package 'free' dinonaktifkan (data tetap ada untuk order lama)
UPDATE packages SET is_active = FALSE WHERE code = 'free';

-- ------------------------------------------------------------
-- 5. Update fitur package sesuai tier baru
-- ------------------------------------------------------------
DELETE FROM package_features WHERE package_id IN (
  SELECT id FROM packages WHERE code IN ('basic', 'premium', 'exclusive')
);

INSERT INTO package_features (package_id, feature, sort_order)
SELECT p.id, f.feature, f.sort_order
FROM packages p
JOIN (VALUES
  ('basic',     'Template dasar',                        1),
  ('basic',     'Kustomisasi tema warna',                2),
  ('basic',     'Halaman undangan publik',               3),
  ('premium',   'Semua fitur Basic',                     1),
  ('premium',   'Manajemen tamu & amplop digital',       2),
  ('premium',   'RSVP & buku tamu',                      3),
  ('premium',   'Tanpa watermark BERNADA.ID',            4),
  ('exclusive', 'Semua fitur Premium',                   1),
  ('exclusive', 'Kustomisasi penuh & desain prioritas',  2),
  ('exclusive', 'Dukungan prioritas',                    3)
) AS f(package_code, feature, sort_order) ON f.package_code = p.code;
