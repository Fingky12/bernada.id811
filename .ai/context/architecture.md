<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Architecture Context · Category : Context (living document)
  Version  : 1.0.7 · Status : 🟠 Proses · Update : 16-08-2026
-->

# Arsitektur

> Ringkasan arsitektur untuk AI. **Referensi lengkap**: `.docs/architecture.md`. Prinsip arsitektur mengikuti aturan `rules/04-project-structure.md`.

---

## Arsitektur Saat Ini (Alpha)

```
┌──────────────────────────────┐
│         Frontend             │
│  HTML + CSS + JavaScript     │
│  (Design System via token)   │
└──────────────┬───────────────┘
               │ HTTP / JSON
┌──────────────▼───────────────┐
│           Backend            │
│      Node.js + Express       │
│  (API, validasi, auth)       │
└──────────────┬───────────────┘
               │ SQL
┌──────────────▼───────────────┐
│          Database            │
│        PostgreSQL            │
└──────────────────────────────┘
```

## Prinsip Arsitektur

1. **Separation of Concerns** — frontend, backend, dan database dipisahkan dengan jelas.
2. **Clean Architecture** — logika bisnis terpisah dari detail teknis (framework, DB).
3. **Modular** — fitur dibangun sebagai modul yang berdiri sendiri.
4. **API-first** — komunikasi frontend ↔ backend melalui API yang terdokumentasi.
5. **Design Token Sentral** — seluruh tampilan bersumber dari `variables.css`.
6. **Scalable** — struktur folder memungkinkan penambahan halaman, modul, dan layanan tanpa menulis ulang.

## Keputusan Arsitektur yang Harus Didokumentasikan

Setiap keputusan arsitektur penting (pola, teknologi, struktur data) wajib:
- Ditulis di `.docs/architecture.md` atau changelog.
- Menyertakan **alasan**, **alternatif**, serta **kelebihan dan kekurangan**.

## Status Saat Ini

- **Frontend:** ✅ Landing page 9 section (v1.1.0) + halaman aplikasi: `pages/login.html`, `pages/builder.html`, `pages/invitation.html`, `pages/admin.html`, `pages/checkout.html`; pricing landing dinamis dari `GET /api/packages`.
- **Backend:** ✅ Node.js + Express (ESM) — `server/` (config, db, app, error handler, lib: jwt/password/validation/http-error, middleware rate-limit/require-admin, services incl. admin, password-reset, email, **package, order, payment (adapter registry + provider manual), invitation status**) + `api/` (health, auth, templates, invitations, guestbook publik, guests, gift-accounts, admin, **packages, orders**).
- **Database:** ✅ Migrasi `0001`–`0010` — `0001` (core) + `0002` (auth/templates) + `0003` (galeri/buku tamu) + `0004` (guests/gift_accounts) + `0005` (password_reset_tokens) + `0006` (fix updated_at) + `0007` (packages/package_features) + `0008` (orders) + `0009` (payments) + `0010` (invitation lifecycle status + package_id + trigger sync) — PostgreSQL 18.4 terpasang lokal.

## Keputusan Arsitektur Kunci

- **ESM** (`"type": "module"`) — standar modern, tanpa build step.
- **`pg` + migrasi SQL mentah** — parameter binding, tanpa ORM.
- **Migrasi append-only** di `database/migrations/` (rollback transaksi per file).
- **Konfigurasi via env** (`.env.example` → `.env`), secret tidak masuk kode.
- **Pool lazy + health check** — server tetap hidup saat DB mati.
- **Layer service** — route (validasi) → service (logika bisnis/query) → pool (`server/services/*`).
- **Autentikasi** — JWT access short-lived (memori) + refresh token rotasi (cookie httpOnly, hash SHA-256 di DB).
- **Keamanan akun** — reset password via token acak hash SHA-256 (sekali pakai, kedaluwarsa 24 jam); email via `nodemailer` dengan dev-log bila `SMTP_HOST` kosong; respons forgot generik (anti-enumerasi).
- **Admin** — role `users.role` + middleware `requireAdmin` (auth + cek role ke DB per-request); guard tidak bisa ubah role sendiri & tidak bisa turunkan admin terakhir.
- **Frontend same-origin** — Express menyajikan halaman & aset statis; `assets/js/api.js` client menangani auto-refresh.
- **Payment boundary** — `server/services/payment/index.js` registry adapter (`defineProvider`/`getProvider`) + provider `manual` (dev); `amount` order selalu dari `packages.price_amount` (server), idempotency key anti-duplicate, status `succeeded` HANYA dari backend — `PAYMENT PROVIDER DECISION REQUIRED`.
- **Invitation lifecycle** — kolom `status` (`draft/preview/published/unpublished`) + `is_published` tetap source of truth akses publik; disinkronkan service `setStatus` (menulis dua kolom) + trigger DB `sync_invitation_status` untuk tulis langsung (termasuk jalur admin).
- **Progressive enhancement & fallback demo** — halaman publik `/u/:slug` tetap berfungsi dengan data demo saat API/DB tidak aktif.

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.7 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 6 — package-service, order-service, payment adapter (manual), invitation status + trigger, migrasi 0007–0010 |
| 1.0.5 | 11-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Sprint 4 closed — guest-service, gift-account-service, rate-limit, migrasi 0004, verifikasi E2E 21/21 |
| 1.0.4 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 4 — guest-service, gift-account-service, middleware rate-limit, migrasi 0004 |
| 1.0.3 | 10-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Release v1.2.0 — The Core Features (Audit PASS) |
| 1.0.2 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Backend & DB lengkap (auth, template, invitation, guestbook) — Sprint 3 |
| 1.0.1 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Backend & database awal (Fase 1) |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Ringkasan arsitektur alpha |
