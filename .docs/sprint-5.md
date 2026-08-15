<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Sprint 5 · Category : Panduan (source of truth)
  Version  : 1.0.0 · Status : ✅ Closed · Update : 16-08-2026
-->

# Sprint 5 — The Admin & Account Security

> Dokumen sprint resmi. Ringkasan untuk AI ada di `.ai/context/sprint.md`.
>
> Sprint ini mengikuti **Engineering Workflow** (`rules/10-engineering-workflow.md`).

---

## Info Sprint

| Item | Detail |
| --- | --- |
| Sprint | Sprint 5 — The Admin & Account Security |
| Tujuan | Dasbor admin (role management + moderasi) + lupa/reset password (SMTP email + token aman) + verifikasi E2E fitur baru |
| Status | ✅ Closed (16-08-2026) |
| Release | v1.4.0 — The Admin & Account Security Release (tag `v1.4.0`) |
| Tanggal | 12-08-2026 (Development admin) · 15-08-2026 (Development reset password) · 16-08-2026 (Verifikasi E2E, Audit & Release) |

---

## Sprint Goal

Memberikan **kontrol administrasi** platform (kelola pengguna, role, moderasi undangan & buku tamu) dan **keamanan akun** (lupa & reset password lewat email SMTP dengan token sekali pakai) — sekaligus menutup pekerjaan yang sempat menggantung: dokumentasi & verifikasi fitur baru yang berjalan sebelum planning difinalkan.

---

## Hasil Sprint (Development)

### Dasbor Admin & Role Management (12-08-2026)

- ✅ **Migrasi & API admin** — `api/routes/admin.js` + `server/services/admin-service.js`; middleware `requireAdmin` (auth + cek role ke DB per-request).
- ✅ **Endpoint admin** — `GET /api/admin/stats`, `GET /api/admin/users` (search/role/page), `GET /api/admin/users/:id` (detail + counts), `PATCH /api/admin/users/:id/role` (guard: tidak bisa ubah role sendiri, tidak bisa turunkan admin terakhir `LAST_ADMIN`), `GET /api/admin/invitations` (search/status), `POST /api/admin/invitations/:id/unpublish`, `GET /api/admin/guestbook`, `DELETE /api/admin/guestbook/:entryId`.
- ✅ **UI admin** — `pages/admin.html` + `assets/js/admin.js` + `assets/css/admin.css`; route `/admin` di `server/app.js`; tab users / invitations / guestbook dengan search, filter, pagination, loading state.
- ✅ **Script promote** — `scripts/make-admin.mjs` (`npm run admin:promote -- <email>`).

### Lupa & Reset Password (15-08-2026)

- ✅ **Migrasi `0005_password_reset_tokens.sql`** — tabel `password_reset_tokens` (user_id, token_hash SHA-256, expires_at, used_at) + indeks + trigger.
- ✅ **Migrasi `0006_password_reset_tokens_updated_at.sql`** — fix kolom `updated_at` (trigger `set_updated_at` menulis kolom yang tidak ada → error 42703 saat UPDATE).
- ✅ **Service** — `server/services/password-reset-service.js` (generate token acak, hash SHA-256, cleanup token basi, validasi kedaluwarsa/pakai-ulang, transaksi update password + revoke refresh token) & `server/services/email-service.js` (nodemailer; bila `SMTP_HOST` kosong → log dev `[mail:dev]` + Reset URL, tidak mengirim).
- ✅ **Endpoint** — `POST /api/auth/forgot-password` (respons generik anti-enumerasi, rate limit 5/menit) & `POST /api/auth/reset-password` (token wajib, password baru).
- ✅ **UI login** — `pages/login.html` + `assets/js/login.js`: form "Lupa password?" → kirim email; halaman `/login?reset=<token>` → set password baru.
- ✅ **Config/env** — `SMTP_HOST/PORT/USER/PASS`, `EMAIL_FROM`, `APP_BASE_URL`, `RESET_TOKEN_EXPIRY_HOURS` (default 24 jam) di `server/config.js` + `.env.example`.

### Verifikasi E2E (16-08-2026)

- ✅ **25/25 PASS** — skrip `scripts/e2e-sprint5.mjs` + rekaman `.docs/e2e/sprint-5-verification.md`. Reset password (anti-enumerasi, token valid/kedaluwarsa/pakai-ulang/tidak dikenal, login password baru) & admin (403 non-admin, promote script, stats/users/invitations/guestbook, unpublish, delete entri, guard role sendiri & admin terakhir).
- ✅ **0 bug aplikasi ditemukan** — rate limiting in-memory (auth 10/menit) terkonfirmasi bekerja (429 `RATE_LIMITED`).

### Audit & Release (16-08-2026)

- ✅ **Audit Sprint 5 PASS** — 24 PASS · 1 WARNING (resolved) · 0 ERROR (`.docs/audit/LAPORAN-AUDIT-SPRINT-5.html`). Perbaikan: `authLimiter` ganda pada reset-password dihapus & warning SMTP production; diverifikasi ulang E2E **25/25 PASS**.
- ✅ **Release v1.4.0 — The Admin & Account Security Release** — dokumen `.docs/releases/v1.4.0-admin-account-security.md`, `package.json` dibump ke `v1.4.0`, tag git `v1.4.0`; disetujui Product Owner, Senior Engineer & AI Pair Programmer. **Sprint 5 closed.**

---

## Scope

1. **Dasbor admin** — middleware `requireAdmin`, service admin (stats, users, role, invitations, guestbook), UI `pages/admin.html`, script promote.
2. **Reset password** — migrasi 0005 & 0006, service password reset + email (SMTP/dev-log), endpoint forgot & reset, UI login, konfigurasi env.
3. **Verifikasi E2E** — skrip `scripts/e2e-sprint5.mjs` + rekaman `.docs/e2e/sprint-5-verification.md` (25/25 PASS).
4. **Documentation** — sinkron `api.md`, `database.md`, `changelog.md`, roadmap, context AI.
5. **Audit & Release** — ✅ Laporan Audit Sprint 5 PASS + Release v1.4.0 (tag `v1.4.0`).

---

## Out of Scope

| Item | Alasan |
| --- | --- |
| Payment & pricing engine | Fase 3 — menunggu planning (roadmap) |
| Optimasi performa & SEO | Fase 3 — menunggu planning (roadmap) |
| Hardening produksi | Fase 3 — menunggu planning (roadmap) |
| Wishlist hadiah (`gift_items`) | Ditunda dari Sprint 4 |
| Notifikasi tamu (email/WA) | Fase 4 |

---

## Keputusan Planning

| Keputusan | Nilai |
| --- | --- |
| Release | v1.4.0 — The Admin & Account Security Release (✅ dirilis) |
| Role admin | Kolom `users.role` (`user` | `admin`) + middleware `requireAdmin` (cek DB per-request) |
| Reset password | Token acak (base64url) di-hash SHA-256, sekali pakai, kedaluwarsa 24 jam; respons forgot generik (anti-enumerasi) |
| Email | `nodemailer`; dev-log bila `SMTP_HOST` kosong (tanpa dependency SMTP wajib untuk pengembangan) |
| Guard admin | Tidak bisa ubah role sendiri (`400`) & tidak bisa turunkan admin terakhir (`409 LAST_ADMIN`) |
| Pola backend | Route (validasi) → service (logika/query) → pool — konsisten Sprint 3–4 |
| Rate limit | Admin 60/menit; forgot-password 5/menit (auth tetap 10/menit) |
| Git | Commit per milestone sesuai `rules/06` |

---

## Acceptance Criteria

1. Admin dapat melihat statistik platform, daftar/detail pengguna, mengubah role (dengan guard), memoderasi undangan (unpublish) & buku tamu (hapus) — via API & UI.
2. Pengguna yang lupa password dapat meminta tautan reset (respons generik anti-enumerasi) dan mengganti password dengan token sekali pakai; token basi/kedaluwarsa/pakai-ulang ditolak.
3. Verifikasi E2E fitur baru terekam (`.docs/e2e/sprint-5-verification.md`) — 25/25 PASS.
4. Dokumentasi sinkron (sprint-5.md, api.md, database.md, changelog, roadmap, context AI).
5. Audit Sprint 5 PASS & Release v1.4.0 — ✅ selesai (LAPORAN-AUDIT-SPRINT-5.html, tag `v1.4.0`).

---

## Timeline

| Tahap | Aktivitas | Estimasi |
| --- | --- | --- |
| Development | Dasbor admin (service, API, UI, script) | 12-08-2026 (selesai) |
| Development | Reset password (migrasi, service, endpoint, UI, env) | 15-08-2026 (selesai) |
| Verification | E2E 25/25 PASS + rekaman | 16-08-2026 (selesai) |
| Documentation | Sinkron dokumen & context | 16-08-2026 (selesai) |
| Audit | Laporan Audit Sprint 5 + perbaikan temuan | 16-08-2026 (selesai) |
| Release | v1.4.0 — release doc + approval + tag + sprint closed | 16-08-2026 (selesai) |

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Closed | Sprint 5 closed — Audit PASS + Release v1.4.0 The Admin & Account Security (tag `v1.4.0`); menunggu planning Sprint 6 (Fase 3 — Launch) |
