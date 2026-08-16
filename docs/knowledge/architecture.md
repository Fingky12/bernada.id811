<!--
  BERNADA.ID KNOWLEDGE BASE
  Document : Architecture · Category : Knowledge
  Version  : 1.0.0 · Status : ✅ Verified · Update : 16-08-2026
-->

# Arsitektur BERNADA.ID (ringkasan knowledge)

> Ringkasan untuk AI. **Source of truth**: `.docs/architecture.md` dan `.ai/context/architecture.md`.
> Fakta di file ini diverifikasi dari `.docs/architecture.md`, `package.json`, dan struktur repo.

---

## 1. Gambaran Umum

Arsitektur **three-tier** yang terpisah jelas: Frontend (HTML+CSS+JS) → Backend (Node.js + Express, API-first) → Database (PostgreSQL). Seluruh frontend disajikan same-origin via Express (`express.static` + route halaman), sehingga cookie same-site bekerja tanpa CORS.

## 2. Status Komponen (terverifikasi dari `.docs/architecture.md`, 16-08-2026)

| Lapisan | Status |
| --- | --- |
| Frontend | ✅ Selesai (v1.3.0): landing `index.html`, `/login`, `/builder`, `/admin`, `/u/:slug` |
| Backend | ✅ Selesai (Sprint 3–5): config, app, error handler, middleware (auth, admin, rate-limit), lib, service layer, routers |
| Database | ✅ Terpasang & termigrasi: PostgreSQL 18.4 lokal; migrasi 0001–0006 (users, templates, invitations, refresh_tokens, guestbook, guests, gift_accounts, password_reset_tokens) |

## 3. Prinsip Arsitektur

1. Separation of Concerns — frontend/backend/database dipisah.
2. Clean Architecture — logika bisnis terpisah dari framework/DB.
3. Modular — fitur sebagai modul berdiri sendiri.
4. API-first — komunikasi melalui API terdokumentasi.
5. Design Token Sentral — sumber dari `assets/css/variables.css`.
6. Scalable — penambahan halaman/modul tanpa menulis ulang.

## 4. Keputusan Arsitektur Kunci (ringkas — detail & alternatif di `.docs/architecture.md`)

| Keputusan | Inti |
| --- | --- |
| Design system | CSS Custom Properties (native, tanpa build step) |
| Module system | Node ESM (`"type": "module"`), async/await top-level |
| Database access | Driver `pg` + migrasi SQL mentah (tanpa ORM) |
| Migrasi | Append-only + runner `database/migrate.js` (transaction per file, tabel `schema_migrations`) |
| Konfigurasi | Environment (`.env` + `--env-file-if-exists`), native Node 22 |
| Pool DB | `server/db.js` lazy pool + health check (server tetap hidup saat DB mati) |
| Arsitektur backend | Route (validasi/HTTP) → Service layer (logika bisnis) |
| Auth | JWT access (short-lived) + refresh token httpOnly cookie, hash SHA-256 di DB, rotasi & revoke |
| Password hash | `bcryptjs` (tanpa native build — aman Windows/CI) |
| Reset password | Token acak di-hash SHA-256, sekali pakai, kedaluwarsa 24 jam; `nodemailer` dev-log bila `SMTP_HOST` kosong; forgot generik (anti-enumerasi) |
| Role admin | `users.role` + middleware `requireAdmin` cek ke DB per request; guard role sendiri & admin terakhir |
| Rate limiting | In-memory per IP: auth 10/mnt, guestbook 20/mnt, publik 120/mnt, admin 60/mnt, forgot 5/mnt |
| Frontend serving | Same-origin via Express (tanpa CORS untuk cookie) |
| Fallback demo | `/u/:slug` memakai data demo (`demo-invitations.js`) saat API/DB mati |

## 5. Alur Data Kunci

1. **Auth**: `POST /api/auth/register|login` → service (bcrypt) → JWT access + refresh cookie → refresh di-rotasi & di-revoke saat login/logout.
2. **Undangan**: owner membuat via `/api/invitations`, publish → tamu akses `/u/:slug` → RSVP/buku tamu (`/public/:slug/guestbook`) + amplop digital.
3. **Admin**: `/api/admin/*` → `requireAdmin` → service admin (stats, users, invitations, guestbook).
4. **Reset password**: forgot (anti-enumerasi) → token hash di `password_reset_tokens` → email/dev-log → reset (token sekali pakai).

## 6. Health & Status

- `GET /api/health` → 200 `{status:"ok", service:"bernada-api", database:"connected"}`; 503 `degraded` bila DB tidak terhubung.
- `npm run test:health` → PASS/FAIL (exit 1 bila gagal).
- Server tidak mati saat DB down (lazy pool) — jangan asumsikan DB down hanya karena server hidup.

## 7. Referensi

- Detail lengkap: `.docs/architecture.md`, `.docs/database.md`, `.docs/api.md`.
- Konteks AI: `.ai/context/architecture.md`, `.ai/context/project.md`.
- Changelog: `.docs/changelog.md`.
