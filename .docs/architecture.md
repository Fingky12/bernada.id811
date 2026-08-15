<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Architecture · Category : Panduan (source of truth)
  Version  : 1.0.4 · Status : 🟠 Proses · Update : 16-08-2026
-->

# Arsitektur BERNADA.ID

> Deskripsi arsitektur project. Ringkasan untuk AI ada di `.ai/context/architecture.md`.

---

## Gambaran Umum (Alpha)

Arsitektur tiga lapis (three-tier) yang terpisah jelas:

```text

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
5. **Design Token Sentral** — seluruh tampilan bersumber dari `assets/css/variables.css`.
6. **Scalable** — struktur folder memungkinkan penambahan halaman, modul, dan layanan tanpa menulis ulang.

## Status Komponen Saat Ini

| Lapisan | Status | Catatan |
| --- | --- | --- |
| Frontend | ✅ Selesai (v1.3.0) | Landing page 9 section + halaman `/login` (masuk/daftar/lupa password), `/builder`, `/admin`, `/u/:slug` — same-origin via Express |
| Backend | ✅ Selesai (Sprint 3–5) | Node.js + Express: config, app, error handler, middleware (auth, admin, rate-limit), lib (jwt/password/validation/http-error), service layer (auth, user, template, invitation, guestbook, guest, gift-account, admin, password-reset, email), router health/auth/templates/invitations/guests/gift-accounts/admin |
| Database | ✅ Terpasang & termigrasi | PostgreSQL 18.4 lokal; migrasi 0001–0006 sukses (users, templates, invitations, refresh_tokens, guestbook, guests, gift_accounts, password_reset_tokens) |

## Keputusan Arsitektur

Setiap keputusan arsitektur penting (pola, teknologi, struktur data) wajib:

- Ditulis di dokumen ini atau `.docs/changelog.md`.
- Menyertakan **alasan**, **alternatif**, serta **kelebihan dan kekurangan**.

### Keputusan yang Sudah Diambil

| Keputusan | Alasan | Alternatif | Kelebihan | Kekurangan |
| --- | --- | --- | --- | --- |
| Design System berbasis CSS Custom Properties | Satu sumber token untuk seluruh tampilan | Preprocessor (Sass/Less) | Native, mudah di-override & di-*runtime*, tanpa build step | Tidak ada fitur programatik (loop, function) |
| Node.js ESM (`"type": "module"`) | Standar JavaScript modern, async/await top-level, tanpa build step | CommonJS | Ekosistem aktif, `import` eksplisit | Beberapa pustaka lama hanya CJS (perlu interop) |
| Driver `pg` + migrasi SQL mentah | Kontrol penuh atas SQL, parameter binding, tanpa ORM/build step | Prisma/Sequelize | Ringan, transparan, sesuai prinsip vanilla project | Menulis migrasi manual, tanpa type-safety ORM |
| Migrasi append-only + runner `database/migrate.js` | Riwayat skema terjamin, rollback transaksi per file | Tool eksternal (node-pg-migrate) | Tanpa dependency ekstra | Runner minimal, fitur downgrade tidak disediakan |
| Konfigurasi via environment (`.env` + `--env-file-if-exists`) | Secret tidak masuk kode (rules/07) | dotenv | Tanpa dependency, didukung native Node 22 | File `.env` harus dibuat manual dari contoh |
| Pool `pg` di `server/db.js` + lazy health check | Server tetap hidup saat DB mati; health endpoint lapor status | Koneksi wajib saat boot | Toleran kegagalan, mudah di-debug | Health check perlu pemantauan |
| Service layer (`server/services/*`) | Route hanya validasi & HTTP; logika bisnis di service — single responsibility | Logika menumpuk di route | Mudah diuji & dipakai ulang | File service bertambah seiring fitur |
| JWT access + refresh token rotasi | Access short-lived (memori), refresh di cookie httpOnly + hash SHA-256 di DB, dirotasi & di-revoke | Session murni / OAuth | Aman XSS (httpOnly), revoke-able, stateless access | Rotasi perlu transaksi & index `token_hash` |
| `bcryptjs` (tanpa native build) | Aman di Windows & CI, tanpa dependency native | `bcrypt` / argon2 native | Mudah diinstall di semua OS | Sedikit lebih lambat dari native |
| Reset password (token hash + email) | Token acak di-hash SHA-256 (sekali pakai, kedaluwarsa 24 jam); `nodemailer` dengan dev-log saat `SMTP_HOST` kosong; respons forgot generik (anti-enumerasi) | Token JWT stateless di email | Revoke-able, aman XSS, anti-enumerasi, tanpa state rahasia di URL | Butuh SMTP untuk produksi; token basi perlu cleanup |
| Role admin + `requireAdmin` | Kolom `users.role`; middleware cek auth + role ke DB per-request; guard role sendiri & admin terakhir | ACL/claim JWT | Sederhana, revoke role instan | Query DB ekstra per request admin |
| Rate limiting in-memory (`rate-limit.js`) | Map per IP + window; tanpa dependency; auth 10/mnt, guestbook 20/mnt, publik 120/mnt, admin 60/mnt, forgot 5/mnt | `express-rate-limit` / Redis | Tanpa dependency, cukup untuk satu proses | Tidak terdistribusi (perlu Redis bila multi-instance) |
| Frontend same-origin via Express | `express.static` + route halaman — cookie same-site bekerja tanpa CORS | SPA terpisah + CORS | Sederhana, cookie aman, tanpa origin checker | Frontend terikat satu server |
| Fallback demo publik (`demo-invitations.js`) | Halaman `/u/:slug` tetap terlihat saat API/DB mati (progressive enhancement) | Skeleton + error page | UX tidak mati total; berguna saat demo | Data contoh tidak dari DB (beri label "Pratinjau") |

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.4 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 4–5 — guest/gift-account/admin/password-reset/email service, require-admin, rate-limit, migrasi 0004–0006 |
| 1.0.3 | 11-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 4 — guest & gift-account service, rate-limit, migrasi 0004 |
| 1.0.2 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 — auth, service layer, template & invitation API, halaman publik, guestbook |
| 1.0.1 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Backend & database awal (Fase 1) — keputusan arsitektur baru |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Ringkasan arsitektur alpha |
