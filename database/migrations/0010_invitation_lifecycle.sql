-- ============================================================
-- BERNADA.ID — Migrasi 0010 · Invitation Lifecycle
-- Opsi A: is_published tetap source of truth akses publik; kolom
-- status (draft|preview|published|unpublished) disinkronkan via
-- trigger saat is_published diubah langsung (legacy/admin), dan
-- dijaga eksplisit oleh service saat transisi status.
-- + invitation.package_id (nullable) untuk entitlement (Sprint 6).
-- (Sprint 6 — The Launch & Commerce Foundation)
-- ============================================================

ALTER TABLE invitations
  ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'preview', 'published', 'unpublished')),
  ADD COLUMN package_id UUID REFERENCES packages(id) ON DELETE RESTRICT;

-- Backfill status dari nilai is_published yang sudah ada
UPDATE invitations
SET status = CASE WHEN is_published THEN 'published' ELSE 'draft' END;

CREATE INDEX idx_invitations_status ON invitations (status);

-- ------------------------------------------------------------
-- Sinkronisasi is_published ↔ status untuk jalur tulis langsung
-- (mis. admin unpublish, setPublished lama). Service transisi status
-- selalu menulis kedua kolom sekaligus → trigger dilewati saat
-- status sudah diubah eksplisit.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION sync_invitation_status()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_published IS DISTINCT FROM OLD.is_published
     AND NEW.status = OLD.status THEN
    NEW.status := CASE WHEN NEW.is_published THEN 'published' ELSE 'unpublished' END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invitations_sync_status
  BEFORE UPDATE ON invitations
  FOR EACH ROW EXECUTE FUNCTION sync_invitation_status();
