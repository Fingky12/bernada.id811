<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Database · Category : Panduan (source of truth)
  Version  : 1.0.0 · Status : 🟠 Proses · Update : 05-08-2026
-->

# Database BERNADA.ID

> Desain skema dan alur migrasi database. Referensi arsitektur: `.docs/architecture.md`.

---

## Informasi Umum

| Item | Detail |
| --- | --- |
| Engine | PostgreSQL 13+ |
| Driver Node.js | `pg` (parameter binding / prepared statement) |
| Migrasi | SQL mentah di `database/migrations/` (dijalankan `database/migrate.js`) |
| Status | 🟠 Skema awal (Fase 1) — tabel inti: users, templates, invitations |

---

## Prinsip

- **snake_case** untuk nama tabel & kolom.
- Primary key `id` (UUID `gen_random_uuid()`).
- Foreign key `{table}_id` dengan `ON DELETE` yang disengaja.
- `created_at` / `updated_at` (`TIMESTAMPTZ`) diisi otomatis via trigger `set_updated_at()`.
- Seluruh query memakai parameter binding — **dilarang** string concatenation input.
- Migrasi bersifat **append-only**: file tidak boleh diubah setelah diterapkan; perubahan skema = migrasi baru.

---

## Alur Migrasi

1. Buat database: `npm run db:create` (dibaca dari `DATABASE_URL`).
2. Jalankan migrasi: `npm run migrate`.
3. Runner membaca `database/migrations/*.sql` terurut, mencatat file yang sudah diterapkan di tabel `schema_migrations`, dan menjalankan sisa migrasi dalam transaksi (rollback otomatis bila gagal).

---

## Skema (Migrasi `0001_init.sql`)

### users — akun pengguna

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | default `gen_random_uuid()` |
| `email` | TEXT UNIQUE | dinormalisasi lowercase oleh aplikasi |
| `password_hash` | TEXT | hashed (bcrypt/argon2) — Fase 2 |
| `full_name` | TEXT | nama pengguna |
| `role` | TEXT | `user` \| `admin` (default `user`) |
| `created_at` / `updated_at` | TIMESTAMPTZ | otomatis |

### templates — template undangan

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | |
| `name` | TEXT | nama template |
| `slug` | TEXT UNIQUE | slug URL |
| `description` | TEXT | deskripsi |
| `category` | TEXT | kategori (default `wedding`) |
| `preview_url` | TEXT | URL pratinjau |
| `is_active` | BOOLEAN | tampil di publik (default TRUE) |
| `created_at` / `updated_at` | TIMESTAMPTZ | otomatis |

### invitations — undangan yang dibuat pengguna

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | |
| `owner_id` | UUID FK → users `ON DELETE CASCADE` | pemilik undangan |
| `template_id` | UUID FK → templates `ON DELETE SET NULL` | template yang dipakai |
| `slug` | TEXT UNIQUE | link unik undangan (dibagikan ke tamu) |
| `title` | TEXT | judul |
| `event_date` / `event_time` | TIMESTAMPTZ / TEXT | jadwal acara |
| `venue` / `location` | TEXT | tempat acara |
| `couple` / `message` | TEXT | nama pasangan & sambutan |
| `theme` | JSONB | personalisasi (warna, dsb.) |
| `music_url` | TEXT | musik latar |
| `is_published` / `published_at` | BOOLEAN / TIMESTAMPTZ | status publikasi |
| `created_at` / `updated_at` | TIMESTAMPTZ | otomatis |

Index: `owner_id`, `slug`.

---

## Rencana Tabel Berikutnya (Sprint 3+ — Fase 2)

Tabel pendukung fitur yang dijanjikan landing page, dibuat lewat migrasi baru (bukan mengubah `0001`):

- `guests` — manajemen tamu & RSVP
- `guest_messages` — buku tamu
- `gifts` — amplop digital

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.0 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Skema awal (users, templates, invitations) + alur migrasi |
