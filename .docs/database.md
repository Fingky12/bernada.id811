<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Database · Category : Panduan (source of truth)
  Version  : 1.5.0 · Status : 🟠 Proses · Update : 16-08-2026
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

### Migrasi `0007_commerce_packages.sql` — Paket & harga (Sprint 6)

Fondasi komersial: tabel `packages` + `package_features`. **Harga seed masih placeholder** (`BUSINESS DECISION REQUIRED`) — rupiah utuh sebagai BIGINT, tanpa desimal.

```sql
CREATE TABLE packages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         VARCHAR(50)  NOT NULL UNIQUE,
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  price_amount BIGINT NOT NULL DEFAULT 0,
  currency     VARCHAR(3) NOT NULL DEFAULT 'IDR',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE package_features (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  label      VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (package_id, label)
);
```

Seed (placeholder, `sort_order` 1–4): `free` (Gratis, Rp0, 3 fitur), `basic` (Basic, Rp0, 3 fitur), `premium` (Premium, Rp99.000, 4 fitur), `exclusive` (Exclusive, Rp199.000, 3 fitur) — total 13 baris `package_features`.

Catatan keamanan:

- `price_amount` **tidak pernah** berasal dari request — hanya dari tabel `packages` (server-side).
- Endpoint yang menyentuh harga memakai **rate-limit** (pola `server/middleware/rate-limit.js`).

---

### Migrasi `0008_orders.sql` — Order paket (Sprint 6)

Transaksi pembelian paket: `amount` **ditentukan server** (dari `packages.price_amount`), anti-duplikat via `idempotency_key UNIQUE`, status lifecycle eksplisit.

```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT NOT NULL UNIQUE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id      UUID NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  invitation_id   UUID REFERENCES invitations(id) ON DELETE SET NULL,
  amount          BIGINT NOT NULL CHECK (amount >= 0),
  currency        TEXT NOT NULL DEFAULT 'IDR',
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','awaiting_payment','paid','cancelled','expired','failed')),
  idempotency_key TEXT UNIQUE,
  expires_at      TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Index: `user_id`, `status`, `invitation_id`. Trigger `set_updated_at`.

Aturan:

- `amount` tidak pernah berasal dari body request — hanya dari `packages.price_amount`.
- `paid_at` hanya diisi oleh boundary pembayaran backend (atau auto-paid untuk paket Rp0).
- `orders.order_number` dihasilkan service (`ORD-YYYYMMDD-XXXX`, unik, retry saat konflik).

---

### Migrasi `0009_payments.sql` — Boundary pembayaran (Sprint 6)

Boundary provider-agnostic. Status hanya ditentukan backend/provider — tidak pernah dari request frontend.

```sql
CREATE TABLE payments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  provider                TEXT NOT NULL,
  provider_transaction_id TEXT,
  payment_reference       TEXT,
  status                  TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','succeeded','failed','expired')),
  amount                  BIGINT NOT NULL CHECK (amount >= 0),
  currency                TEXT NOT NULL DEFAULT 'IDR',
  metadata                JSONB NOT NULL DEFAULT '{}'::jsonb,
  paid_at                 TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Index: `order_id`, `provider_transaction_id`. Trigger `set_updated_at`.

Adapter di `server/services/payment/index.js` (registry `defineProvider`/`getProvider`); provider saat ini: `manual` (dev, tanpa integrasi nyata — `PAYMENT PROVIDER DECISION REQUIRED`). `metadata` tidak pernah berisi secret.

---

## Rencana Tabel Berikutnya (Sprint 6 — Fase 3)

- `gift_items` — wishlist hadiah (ditunda dari Sprint 4)
- `template_categories`

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.5.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Migrasi 0009 (payments) + adapter manual — Sprint 6 |
| 1.4.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Migrasi 0008 (orders) — Sprint 6 |
| 1.3.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Migrasi 0007 (packages & package_features) — Sprint 6 |
| 1.1.0 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Migrasi 0004 (guests & gift_accounts) — Sprint 4 |
| 1.0.1 | 10-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Migrasi 0002 (refresh_tokens + seed templates) & 0003 (gallery + guestbook) |
| 1.0.0 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Skema awal (users, templates, invitations) + alur migrasi |
