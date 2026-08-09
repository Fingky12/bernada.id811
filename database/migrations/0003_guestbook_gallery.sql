-- ============================================================
-- BERNADA.ID — Migrasi 0003 · Galeri & Buku Tamu
-- Menambahkan galeri foto pada invitations dan tabel buku tamu
-- (RSVP) untuk halaman undangan publik.
-- ============================================================

-- ------------------------------------------------------------
-- invitations.gallery — array URL foto untuk galeri undangan
-- ------------------------------------------------------------
ALTER TABLE invitations
  ADD COLUMN gallery JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ------------------------------------------------------------
-- guestbook — RSVP & ucapan tamu
-- ------------------------------------------------------------
CREATE TABLE guestbook (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_name    TEXT NOT NULL,
  attendance    TEXT NOT NULL DEFAULT 'hadir'
                CHECK (attendance IN ('hadir', 'tidak-hadir')),
  guests_count  INT  NOT NULL DEFAULT 1
                CHECK (guests_count BETWEEN 1 AND 10),
  message       TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guestbook_invitation_id ON guestbook (invitation_id);
CREATE INDEX idx_guestbook_created_at ON guestbook (invitation_id, created_at DESC);
