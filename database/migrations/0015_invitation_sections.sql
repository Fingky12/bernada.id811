-- Sprint 11 — Section engine MVP: konfigurasi enable/disable bagian undangan.
-- Array JSONB berisi { "type": string, "enabled": boolean }.
-- Type whitelist divalidasi di aplikasi (bukan DB) agar fleksibel.
-- Urutan array = urutan tampil (reorder UI menyusul).
-- Types yang bisa toggle: countdown, location, message, gift, gallery.
-- cover, couple/event, rsvp/wishes selalu tampil (core).

ALTER TABLE invitations
  ADD COLUMN sections JSONB NOT NULL DEFAULT '[]'::jsonb;
