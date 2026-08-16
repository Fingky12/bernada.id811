<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : API · Category : Panduan (source of truth)
  Version  : 1.4.0 · Status : 🟠 Proses · Update : 16-08-2026
-->

# API BERNADA.ID

> Dokumentasi endpoint API. Endpoint baru wajib didokumentasikan di file ini (rules/01).

---

## Konvensi Umum

| Aspek | Konvensi |
| --- | --- |
| Base path | `/api` |
| Format | JSON |
| URL | `kebab-case` (`rules/05`) |
| Body/response | `camelCase` (`rules/05`) |
| Metode HTTP | sesuai makna (GET, POST, PUT/PATCH, DELETE) |
| Autentikasi | JWT access token via header `Authorization: Bearer <token>`; refresh via cookie httpOnly (`bernada_refresh`). Endpoint yang bertanda "Publik" tidak memerlukan autentikasi |

### Format Response Sukses

Tidak ada pembungkus khusus — data dikembalikan langsung sebagai body JSON.

### Format Response Error

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Pesan kesalahan yang aman untuk ditampilkan."
  }
}
```

Aturan:

- **Jangan membocorkan detail internal** (stack trace, query, dsb.) ke response.
- `code` ringkas `UPPER_SNAKE_CASE`; `message` bahasa Indonesia, aman ditampilkan.
- Error 5xx selalu `message` generik; detail lengkap dicatat di log server.

---

## Autentikasi

### Skema Token

| Token | Penyimpanan | Masa Berlaku | Rotasi |
| --- | --- | --- | --- |
| Access token (JWT) | Memori browser (bukan localStorage) | `JWT_ACCESS_EXPIRES` (default `15m`) | Regenerated tiap refresh |
| Refresh token | Cookie httpOnly `bernada_refresh`, hash SHA-256 di DB | `REFRESH_TOKEN_EXPIRY_DAYS` (default `30`) | Dirotasi setiap refresh; bisa di-revoke (logout) |

Aturan:

- Password tersimpan sebagai hash `bcryptjs` (salt 12) — tidak pernah plaintext.
- Seluruh permintaan yang memakai body token (refresh) via cookie httpOnly — tidak bisa dibaca JavaScript (anti XSS).
- Endpoint publik tidak memerlukan autentikasi.

---

## Endpoint

### GET `/api/health`

Cek kesehatan layanan dan koneksi database.

**Response 200** — database terhubung:

```json
{
  "status": "ok",
  "service": "bernada-api",
  "version": "1.2.0",
  "timestamp": "2026-08-10T03:50:39.652Z",
  "database": "connected"
}
```

**Response 503** — database tidak terjangkau (server tetap hidup, `status: degraded`):

```json
{
  "status": "degraded",
  "service": "bernada-api",
  "version": "1.2.0",
  "timestamp": "2026-08-10T03:50:39.652Z",
  "database": "unreachable"
}
```

---

## Endpoint Autentikasi

### POST `/api/auth/register`

Membuat akun baru lalu langsung memberi sesi.

**Request:**

```json
{
  "email": "rara@contoh.com",
  "password": "rahasia123",
  "fullName": "Rara Kirana"
}
```

**Response 200** — sesi dibuat:

```json
{
  "user": {
    "id": "1e3f0b8a-0000-0000-0000-000000000001",
    "email": "rara@contoh.com",
    "fullName": "Rara Kirana",
    "role": "user",
    "createdAt": "2026-08-10T03:50:39.652Z"
  },
  "accessToken": "<jwt>"
}
```

Setelah response, cookie httpOnly `bernada_refresh` otomatis dipasang.

**Response 409** — email sudah terdaftar (`EMAIL_TAKEN`).

### POST `/api/auth/login`

Masuk dengan email & password.

**Request:**

```json
{
  "email": "rara@contoh.com",
  "password": "rahasia123"
}
```

**Response 200** — sama dengan register (`user` + `accessToken`, cookie `bernada_refresh` dipasang).

**Response 401** — `INVALID_CREDENTIALS` bila email/password salah (pesan sama untuk keduanya, anti enumerasi).

### POST `/api/auth/refresh`

Memperbarui access token memakai refresh token di cookie httpOnly.

- Tidak menerima body; token dibaca dari cookie `bernada_refresh`.
- Refresh token lama di-revoke, token baru dirotasi (rotasi aman, token bekas tidak bisa dipakai ulang).

**Response 200:**

```json
{ "accessToken": "<jwt-baru>" }
```

**Response 401** — `UNAUTHORIZED` bila cookie tidak ada / token invalid / kedaluwarsa / sudah di-revoke.

### POST `/api/auth/logout`

Menghapus sesi (refresh token di-revoke) dan membersihkan cookie.

**Response 204** — tanpa body.

### GET `/api/auth/me`

Mengambil data pengguna yang sedang masuk (memerlukan access token).

**Response 200:**

```json
{
  "user": {
    "id": "1e3f0b8a-0000-0000-0000-000000000001",
    "email": "rara@contoh.com",
    "fullName": "Rara Kirana",
    "role": "user",
    "createdAt": "2026-08-10T03:50:39.652Z"
  }
}
```

### POST `/api/auth/forgot-password`

Meminta tautan reset password (dikirim via email SMTP). Rate limit 5/menit per IP.

**Request:**

```json
{ "email": "rara@contoh.com" }
```

**Response 200 — selalu generik (anti-enumerasi):**

```json
{
  "message": "Jika email terdaftar, tautan reset password telah dikirim."
}
```

Catatan:

- Response **sama** untuk email terdaftar maupun tidak — mencegah enumerasi akun.
- Bila `SMTP_HOST` kosong (mode dev), email **tidak** dikirim; tautan reset dicatat di log server (`[mail:dev]`).
- Token disimpan sebagai hash SHA-256 di tabel `password_reset_tokens`, kedaluwarsa `RESET_TOKEN_EXPIRY_HOURS` (default 24 jam).
- Tautan menuju `APP_BASE_URL/login?reset=<token>`.

### POST `/api/auth/reset-password`

Mengganti password memakai token dari tautan reset.

**Request:**

```json
{
  "token": "<token-dari-email>",
  "password": "rahasiaBaru123"
}
```

Aturan:

- `token` wajib (maks 200); `password` mengikuti aturan umum (min 8 karakter).
- Token sekali pakai — **tidak bisa dipakai ulang** (`used_at`).
- Token kedaluwarsa ditolak → **400** `EXPIRED_TOKEN`.
- Token tidak dikenal / sudah dipakai → **400** `INVALID_TOKEN`.
- Saat sukses: password baru disimpan (bcrypt), seluruh refresh token pengguna di-revoke (sesi lama dicabut).

**Response 200:**

```json
{
  "user": {
    "id": "1e3f0b8a-0000-0000-0000-000000000001",
    "email": "rara@contoh.com",
    "fullName": "Rara Kirana",
    "role": "user",
    "createdAt": "2026-08-10T03:50:39.652Z"
  }
}
```

---

## Endpoint Publik

> Endpoint berikut tidak memerlukan autentikasi.

### GET `/api/templates`

Daftar template undangan yang aktif (untuk dipakai builder).

**Response 200:**

```json
{
  "templates": [
    {
      "id": "…",
      "name": "Klasik Minimal",
      "slug": "klasik-minimal",
      "description": "Desain bersih dan tenang…",
      "category": "wedding",
      "previewUrl": "/assets/img/portfolio-1.svg"
    }
  ]
}
```

Catatan: hanya template `is_active = TRUE` yang dikembalikan.

### GET `/api/packages`

Daftar paket & harga undangan yang aktif (publik). **Backend = source of truth** untuk harga — frontend tidak pernah menampilkan/hardcode harga final.

**Response 200:**

```json
{
  "packages": [
    {
      "id": "…",
      "code": "free",
      "name": "Gratis",
      "description": "Untuk mencoba merasakan pengalaman membuat undangan digital.",
      "priceAmount": 0,
      "currency": "IDR",
      "isActive": true,
      "sortOrder": 1,
      "features": ["Buat undangan digital", "Template dasar", "Halaman undangan publik"]
    }
  ]
}
```

Catatan:

- Hanya paket `is_active = TRUE` yang dikembalikan, urut `sortOrder`.
- `priceAmount` dalam rupiah utuh (BIGINT → Number). Harga seed masih **placeholder** (`BUSINESS DECISION REQUIRED`).
- `features` adalah array label fitur dari `package_features`.

### GET `/api/packages/:id`

Detail satu paket aktif (termasuk fitur).

**Response 200:** `{ "package": { … } }` — struktur sama dengan item list.

**Response 404** — `NOT_FOUND` bila paket tidak ada atau tidak aktif.

### GET `/api/invitations/public/:slug`

Mengambil undangan yang sudah diterbitkan (publik). Endpoint ini dipakai halaman undangan di `/u/:slug`.

**Response 200:**

```json
{
  "invitation": {
    "id": "b6f4d5f0-6b9e-4c0e-8d2a-1f2c3d4e5f6a",
    "slug": "dua-pasangan",
    "title": "Pernikahan Dua Pasangan",
    "eventDate": "2026-12-12T03:00:00.000Z",
    "eventTime": "09:00",
    "venue": "Gedung Serbaguna",
    "location": "Jl. Contoh No. 1, Jakarta",
    "couple": "Ahmad & Siti",
    "message": "Dengan memohon rahmat dan ridho Allah SWT…",
    "theme": { "primaryColor": "#A12828", "accentColor": "#FFC400" },
    "musicUrl": "https://…/lagu.mp3",
    "gallery": ["https://…/foto-1.jpg"],
    "publishedAt": "2026-08-09T04:00:00.000Z"
  },
  "template": {
    "name": "Klasik Minimal",
    "category": "wedding",
    "previewUrl": "/assets/img/portfolio-1.svg"
  }
}
```

Catatan:

- Hanya undangan dengan `is_published = TRUE` yang dikembalikan.
- Response **404** (`NOT_FOUND`) bila slug tidak ada atau belum diterbitkan.
- Field `owner_id` dan detail internal lain **tidak** di-expose.
- Slug divalidasi (huruf kecil, angka, tanda hubung).
- `gallery` berupa array URL foto (bisa kosong).

### GET `/api/invitations/public/:slug/guestbook`

Daftar buku tamu / RSVP undangan terbit (publik).

**Response 200:**

```json
{
  "entries": [
    {
      "id": "…",
      "guestName": "Bapak/Ibu Tamu",
      "attendance": "hadir",
      "guestsCount": 2,
      "message": "Selamat menempuh hidup baru…",
      "createdAt": "2026-08-10T03:50:39.652Z"
    }
  ]
}
```

Catatan:

- Diurutkan terbaru dulu (`created_at DESC`), maksimal 200 entri.
- Hanya untuk undangan `is_published = TRUE` (404 bila tidak ditemukan/belum terbit).

### POST `/api/invitations/public/:slug/guestbook`

Mengirim ucapan & konfirmasi kehadiran (publik).

**Request:**

```json
{
  "guestName": "Bapak/Ibu Tamu",
  "attendance": "hadir",
  "guestsCount": 2,
  "message": "Selamat menempuh hidup baru!"
}
```

Aturan validasi:

- `guestName` wajib, maksimal 120 karakter.
- `attendance` wajib: `hadir` | `tidak-hadir`.
- `guestsCount` angka 1–10 (default 1 bila kosong).
- `message` opsional, maksimal 1000 karakter.

**Response 201:**

```json
{
  "entry": {
    "id": "…",
    "guestName": "Bapak/Ibu Tamu",
    "attendance": "hadir",
    "guestsCount": 2,
    "message": "Selamat menempuh hidup baru!",
    "createdAt": "2026-08-10T03:50:39.652Z"
  }
}
```

---

## Endpoint Undangan (Terproteksi)

> Seluruh endpoint di bawah memerlukan header `Authorization: Bearer <accessToken>` dan hanya mengakses/mengubah undangan **milik pengguna** (owner scoping). Akses ke undangan milik pengguna lain menghasilkan **404** `NOT_FOUND`.

### POST `/api/invitations`

Membuat undangan baru.

**Request (semua field opsional kecuali `title` & `slug`):**

```json
{
  "title": "Pernikahan Rara & Bima",
  "slug": "rara-bima",
  "templateId": "…",
  "eventDate": "2026-10-08T04:00:00.000Z",
  "eventTime": "09:00",
  "venue": "Hotel Mulia",
  "location": "Jl. Asia Afrika, Jakarta",
  "couple": "Rara & Bima",
  "message": "Merupakan suatu kehormatan…",
  "theme": { "primaryColor": "#A12828", "accentColor": "#FFC400" },
  "musicUrl": "https://…/lagu.mp3",
  "gallery": ["https://…/foto-1.jpg"]
}
```

Validasi:

- `title` wajib, maksimal 150.
- `slug` wajib, pola `[a-z0-9]+(-[a-z0-9]+)*`, maksimal 60.
- `eventDate` ISO tanggal valid (opsional).
- `theme` objek JSON (opsional).
- `gallery` array teks, maksimal 100 item, 500 karakter/item.

**Response 201:** objek undangan lengkap (termasuk `id`, `isPublished`, `publishedAt`, `createdAt`, `updatedAt`).

**Response 409** — `SLUG_TAKEN` bila slug sudah dipakai undangan lain.

### GET `/api/invitations`

Daftar seluruh undangan milik pengguna (terbaru dulu).

**Response 200:**

```json
{ "invitations": [ … ] }
```

### GET `/api/invitations/:id`

Detail satu undangan milik pengguna.

**Response 200:** objek undangan. **404** bila tidak ada/bukan miliknya.

### PATCH `/api/invitations/:id`

Memperbarui sebagian field undangan (partial update — hanya field yang dikirim yang diubah).

Body memakai struktur yang sama dengan create; setiap field opsional. Contoh: `{ "title": "Judul Baru" }`.

**Response 200:** objek undangan terbaru.

### DELETE `/api/invitations/:id`

Menghapus undangan milik pengguna.

**Response 204** — tanpa body.

### POST `/api/invitations/:id/publish`

Menerbitkan undangan — langsung bisa diakses publik via `/u/:slug` dan `GET /api/invitations/public/:slug`.

**Response 200:** objek undangan (`isPublished: true`, `publishedAt` terisi bila pertama kali).

### POST `/api/invitations/:id/unpublish`

Menonaktifkan undangan dari publik.

**Response 200:** objek undangan (`isPublished: false`, `publishedAt` kosong).

---

## Endpoint Tamu (Terproteksi)

Seluruh endpoint tamu wajib header `Authorization: Bearer <accessToken>` (owner undangan).

### GET `/api/invitations/:id/guests`

Daftar tamu sebuah undangan (opsional query `status` = `diundang` | `hadir` | `tidak-hadir`).

**Response 200:** `{ guests: [{ id, invitationId, fullName, phone, guestGroup, status, createdAt, updatedAt }] }`.

### POST `/api/invitations/:id/guests`

Tambah tamu (tunggal atau batch). Body:
- tunggal: `{ fullName, phone?, guestGroup?, status? }` (status default `diundang`)
- batch: `{ guests: [{ fullName, phone?, guestGroup? }, ...] }` (maks 50 per batch)

**Response 201:** `{ guests: [...] }` — daftar tamu yang berhasil dibuat.

### GET `/api/invitations/:id/guests/stats`

Statistik tamu undangan.

**Response 200:** `{ stats: { total, hadir, tidakHadir, diundang } }`.

### GET `/api/guests/:guestId`

Detail satu tamu (wajib owner undangan terkait).

**Response 200:** `{ guest: {...} }`.

### PATCH `/api/guests/:guestId`

Perbarui tamu — `fullName`, `phone`, `guestGroup`, `status` (opsional).

**Response 200:** `{ guest: {...} }`.

### DELETE `/api/guests/:guestId`

Hapus tamu.

**Response 204:** tanpa body.

---

## Endpoint Amplop Digital (Gift Account)

### GET `/api/invitations/public/:slug/gift-accounts`

Amplop digital publik untuk undangan terbit.

**Response 200:** `{ accounts: [{ id, bankName, accountNumber, accountName }] }` — hanya yang aktif (`isActive: true`).

### GET `/api/invitations/:id/gift-accounts`

Daftar amplop owner (termasuk non-aktif).

**Response 200:** `{ accounts: [...] }`.

### POST `/api/invitations/:id/gift-accounts`

Tambah amplop — `{ bankName, accountNumber, accountName?, isActive?, sortOrder? }`.

**Response 201:** `{ account: {...} }`.

### PATCH `/api/gift-accounts/:giftAccountId`

Perbarui amplop (field opsional).

**Response 200:** `{ account: {...} }`.

### DELETE `/api/gift-accounts/:giftAccountId`

Hapus amplop.

**Response 204:** tanpa body.

---

## Endpoint Admin (Terproteksi)

> Seluruh endpoint admin memerlukan `Authorization: Bearer <accessToken>` **dan** peran `admin` (middleware `requireAdmin`; role dicek ulang ke database per-request). Non-admin menerima **403** `FORBIDDEN`. Dibatasi rate limiting 60 req/menit per IP.

### GET `/api/admin/stats`

Ringkasan statistik platform.

**Response 200:**

```json
{
  "stats": {
    "users": 12,
    "admins": 1,
    "invitations": 30,
    "invitationsPublished": 10,
    "guestbookEntries": 55,
    "guests": 120,
    "giftAccounts": 25,
    "giftAccountsActive": 18
  }
}
```

### GET `/api/admin/users`

Daftar pengguna dengan pencarian, filter peran, dan pagination.

Query (semua opsional): `search` (nama/email, ILIKE), `role` (`admin` | `user`), `page` (default 1), `pageSize` (default 20, maks 100).

**Response 200:**

```json
{
  "users": [{ "id": "…", "email": "…", "fullName": "…", "role": "user", "createdAt": "…" }],
  "total": 12,
  "limit": 20,
  "offset": 0,
  "page": 1
}
```

### GET `/api/admin/users/:id`

Detail pengguna + ringkasan hitungan miliknya.

**Response 200:**

```json
{
  "user": { "id": "…", "email": "…", "fullName": "…", "role": "user", "createdAt": "…" },
  "counts": {
    "invitations": 3,
    "invitationsPublished": 1,
    "guests": 10,
    "giftAccounts": 2,
    "guestbookEntries": 5
  }
}
```

**404** `NOT_FOUND` bila pengguna tidak ada.

### PATCH `/api/admin/users/:id/role`

Ubah peran pengguna.

**Request:**

```json
{ "role": "admin" }
```

`role` wajib: `admin` | `user`.

Aturan keamanan:

- **Tidak bisa** mengubah peran akun sendiri → **400** `VALIDATION_ERROR`.
- **Tidak bisa** menurunkan admin terakhir → **409** `LAST_ADMIN`.
- **404** bila pengguna tidak ada.

**Response 200:** `{ "user": { … } }` — objek pengguna dengan `role` baru.

### GET `/api/admin/invitations`

Moderasi undangan — daftar seluruh undangan (semua pemilik).

Query (semua opsional): `search` (judul/slug/email pemilik, ILIKE), `status` (`published` | `draft`), `page`, `pageSize`.

**Response 200:**

```json
{
  "invitations": [
    {
      "id": "…",
      "slug": "rara-bima",
      "title": "Pernikahan Rara & Bima",
      "isPublished": true,
      "publishedAt": "…",
      "createdAt": "…",
      "owner": { "id": "…", "email": "…", "fullName": "…" },
      "templateName": "Klasik Minimal"
    }
  ],
  "total": 30,
  "limit": 20,
  "offset": 0,
  "page": 1
}
```

### POST `/api/admin/invitations/:id/unpublish`

Menarik undangan dari publik (moderasi). Berlaku untuk undangan milik pengguna mana pun.

**Response 200:** `{ "invitation": { "id", "slug", "title", "isPublished": false, "publishedAt": null } }`.

**404** bila undangan tidak ada.

### GET `/api/admin/guestbook`

Moderasi buku tamu — daftar seluruh entri (semua undangan).

Query (semua opsional): `search` (nama tamu/ucapan, ILIKE), `page`, `pageSize`.

**Response 200:**

```json
{
  "entries": [
    {
      "id": "…",
      "guestName": "Budi",
      "attendance": "hadir",
      "guestsCount": 2,
      "message": "Selamat ya!",
      "createdAt": "…",
      "invitation": { "title": "Pernikahan Rara & Bima", "slug": "rara-bima" }
    }
  ],
  "total": 55,
  "limit": 20,
  "offset": 0,
  "page": 1
}
```

### DELETE `/api/admin/guestbook/:entryId`

Hapus entri buku tamu (moderasi spam/ucapan tidak pantas).

**Response 204** — tanpa body. **404** bila entri tidak ada.

---

## Middleware

| Middleware | Fungsi |
| --- | --- |
| `helmet` | Header keamanan (CSP, HSTS, X-Content-Type-Options, dll.) |
| `cors` | Batasi origin (konfigurasi `CORS_ORIGIN` di `.env`) |
| `cookieParser` | Baca cookie (refresh token httpOnly) |
| `express.json` | Parse body JSON (limit 1mb) |
| `requireAuth` | Wajib autentikasi untuk endpoint terproteksi (verify JWT `Bearer`) |
| `requireAdmin` | Wajib peran `admin` (menggunakan `requireAuth` + cek `role` ke database) — melindungi seluruh `/api/admin/*` |
| `rateLimit` | Rate limiting in-memory per IP+route (auth 10/mnt, guestbook 20/mnt, publik 120/mnt) — header `X-RateLimit-*` & `Retry-After` |
| `notFoundHandler` | 404 JSON untuk route yang tidak dikenal |
| `errorHandler` | Error terpusat: 5xx generik, <5xx mengikuti `err.status` |

---

## Halaman (disajikan Express, same-origin)

| Route | File |
| --- | --- |
| `/` | `index.html` |
| `/login` | `pages/login.html` |
| `/builder` | `pages/builder.html` |
| `/admin` | `pages/admin.html` |
| `/u/:slug` | `pages/invitation.html` |

Aset statis disajikan via `/assets` dan `/pages`.

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.3.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Endpoint forgot-password & reset-password (Sprint 5 — keamanan akun) |
| 1.2.0 | 12-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Endpoint admin — stats, users (+ role, detail), invitations (unpublish), guestbook (hapus) |
| 1.0.3 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Endpoint tamu (CRUD + stats) & amplop digital (owner + publik), middleware rate limit |
| 1.0.2 | 10-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Endpoint auth, templates, undangan CRUD/publish, guestbook publik & galeri |
| 1.0.1 | 09-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Endpoint publik `GET /api/invitations/public/:slug` + konvensi autentikasi JWT |
| 1.0.0 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Konvensi API + endpoint health |
