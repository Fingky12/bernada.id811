-- Sprint 11 — Analytics dasar: penghitung view undangan
-- Naive counter: bertambah setiap GET /api/invitations/public/:slug sukses.
-- ponytail: tanpa unique-visitor dedup; tambah tabel views bila analytics butuh akurat.

ALTER TABLE invitations
  ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;
