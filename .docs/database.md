<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Database · Category : Panduan (source of truth)
  Version  : 1.2.0 · Status : 🟠 Proses · Update : 16-08-2026
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
| Status | ✅ Skema inti (Fase 2) — users, templates, invitations, refresh_tokens, guestbook · ✅ Sprint 4 — guests, gift_accounts · 🟠 Sprint 5 — password_reset_tokens |

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

## Skema

### Migrasi `0001_init.sql` — Skema Awal (Core)

#### users — akun pengguna

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | default `gen_random_uuid()` |
| `email` | TEXT UNIQUE | dinormalisasi lowercase oleh aplikasi |
| `password_hash` | TEXT | hash bcrypt (salt 12) |
| `full_name` | TEXT | nama pengguna |
| `role` | TEXT | `user` \| `admin` (default `user`) |
| `created_at` / `updated_at` | TIMESTAMPTZ | otomatis |

#### templates — template undangan

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

#### invitations — undangan yang dibuat pengguna

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
| `gallery` | JSONB | array URL foto galeri (default `[]`) — migrasi 0003 |
| `is_published` / `published_at` | BOOLEAN / TIMESTAMPTZ | status publikasi |
| `created_at` / `updated_at` | TIMESTAMPTZ | otomatis |

Index: `owner_id`, `slug`.

---

### Migrasi `0002_auth_templates.sql` — Autentikasi & Template

#### refresh_tokens — token refresh (rotasi)

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | |
| `user_id` | UUID FK → users `ON DELETE CASCADE` | pemilik token |
| `token_hash` | TEXT UNIQUE | hash SHA-256 token refresh (tidak pernah plaintext) |
| `expires_at` | TIMESTAMPTZ | batas berlaku |
| `revoked_at` | TIMESTAMPTZ | waktu revoke (logout / dipakai refresh) — NULL bila masih aktif |
| `created_at` | TIMESTAMPTZ | otomatis |

Index: `user_id`, `expires_at`.

**Seed templates** — 6 template awal (wedding) dari portofolio landing page: Klasik Minimal, Merah Elegan, Border Bunga, Gold Mewah, Pita Emas, Diagonal Modern.

---

### Migrasi `0003_guestbook_gallery.sql` — Galeri & Buku Tamu

#### invitations.gallery — galeri foto undangan

`JSONB NOT NULL DEFAULT '[]'::jsonb` — array URL foto yang ditampilkan sebagai galeri pada halaman undangan publik.

#### guestbook — buku tamu & RSVP

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | |
| `invitation_id` | UUID FK → invitations `ON DELETE CASCADE` | undangan tujuan |
| `guest_name` | TEXT | nama tamu (wajib) |
| `attendance` | TEXT | `hadir` \| `tidak-hadir` (default `hadir`) |
| `guests_count` | INT | jumlah tamu 1–10 (default 1) |
| `message` | TEXT | ucapan (opsional, default `''`) |
| `created_at` | TIMESTAMPTZ | otomatis |

Index: `idx_guestbook_invitation_id` (invitation_id), `idx_guestbook_created_at` (invitation_id, created_at DESC).

---

### Migrasi `0004_guests_gift_accounts.sql` — Manajemen Tamu & Amplop Digital

#### guests — daftar tamu yang dikelola pemilik

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | |
| `invitation_id` | UUID FK → invitations `ON DELETE CASCADE` | undangan pemilik |
| `full_name` | TEXT | nama tamu (wajib) |
| `phone` | TEXT | kontak (opsional, default `''`) |
| `guest_group` | TEXT | kelompok tamu, mis. Keluarga/Sahabat (opsional, default `''`) |
| `status` | TEXT | `diundang` \| `hadir` \| `tidak-hadir` (default `diundang`) |
| `created_at` / `updated_at` | TIMESTAMPTZ | otomatis |

Index: `idx_guests_invitation_id` (invitation_id).

#### gift_accounts — info transfer / amplop digital

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | |
| `invitation_id` | UUID FK → invitations `ON DELETE CASCADE` | undangan pemilik |
| `bank_name` | TEXT | nama bank (wajib) |
| `account_number` | TEXT | nomor rekening (wajib) |
| `account_name` | TEXT | atas nama (default `''`) |
| `is_active` | BOOLEAN | tampil di publik (default TRUE) |
| `sort_order` | INT | urutan tampil (default 0) |
| `created_at` / `updated_at` | TIMESTAMPTZ | otomatis |

Index: `idx_gift_accounts_invitation_id` (invitation_id).

---

### Migrasi `0005_password_reset_tokens.sql` — Token Reset Password

#### password_reset_tokens — token reset password (keamanan akun)

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | |
| `user_id` | UUID FK → users `ON DELETE CASCADE` | pemilik token |
| `token_hash` | TEXT | hash SHA-256 token (tidak pernah plaintext) |
| `expires_at` | TIMESTAMPTZ | batas berlaku (`RESET_TOKEN_EXPIRY_HOURS`, default 24 jam) |
| `used_at` | TIMESTAMPTZ | waktu token dipakai (sekali pakai) — NULL bila masih aktif |
| `created_at` / `updated_at` | TIMESTAMPTZ | otomatis |

Index: `idx_password_reset_tokens_user_id` (user_id), `idx_password_reset_tokens_token_hash` (token_hash).

---

### Migrasi `0006_password_reset_tokens_updated_at.sql` — Fix `updated_at`

Perbaikan migrasi 0005: trigger `trg_password_reset_tokens_updated_at` (via `set_updated_at()`) menulis `NEW.updated_at` yang belum ada di tabel → error `42703 undefined_column` saat `UPDATE`. Menambahkan kolom agar konsisten dengan tabel lain:

```sql
ALTER TABLE password_reset_tokens
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
```

---

## Rencana Tabel Berikutnya (Sprint 5+ — Fase 3)

Tabel pendukung fitur yang dijanjikan landing page, dibuat lewat migrasi baru (bukan mengubah file yang sudah ada):

- `gift_items` — wishlist hadiah (ditunda dari Sprint 4)
- `template_categories` / fitur pembayaran & penagihan (Fase 3)

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.2.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Migrasi 0005 (password_reset_tokens) & 0006 (fix updated_at) — Sprint 5 |
| 1.1.0 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Migrasi 0004 (guests & gift_accounts) — Sprint 4 |
| 1.0.1 | 10-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Migrasi 0002 (refresh_tokens + seed templates) & 0003 (gallery + guestbook) |
| 1.0.0 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Skema awal (users, templates, invitations) + alur migrasi |
