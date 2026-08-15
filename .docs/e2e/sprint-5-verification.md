<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Verifikasi E2E Sprint 5 · Category : Catatan
  Version  : 1.0.0 · Status : ✅ Verified · Update : 16-08-2026
-->

# Verifikasi E2E — Sprint 5 (Admin Dashboard + Reset Password)

> Verifikasi end-to-end fitur baru pasca release v1.3.0: **lupa & reset password** (SMTP email + token hash) dan **admin dashboard** (role management + moderasi). Seluruhnya diuji terhadap PostgreSQL lokal.

---

## Lingkungan

| Item | Nilai |
| --- | --- |
| Tanggal | 16-08-2026 |
| OS | Windows (PowerShell 5.1) |
| PostgreSQL | lokal `localhost:5432`, role `bernada`, DB `bernada` |
| Node.js | ≥ 22 (ESM) |
| Server | `npm run dev` → `http://localhost:3000` (v1.3.0, `database=connected`) |
| Database | migrasi 0001–0006 applied (termasuk `password_reset_tokens` + fix `updated_at`) |

## Skrip

- `scripts/e2e-sprint5.mjs` — verifikasi otomatis; jalankan `node --env-file-if-exists=.env scripts/e2e-sprint5.mjs`.
  - Self-healing terhadap rate limit in-memory (Sprint 4 hardening): saat dapat `429 RATE_LIMITED`, menunggu 61 detik lalu retry sekali.
  - Data test dibuat unik (suffix timestamp) dan dibersihkan di akhir (hapus user test — cascade).

## Hasil 25/25 PASS

| # | Langkah | Status |
| --- | --- | --- |
| 1 | `GET /api/health` — `status=ok`, `database=connected` | ✅ PASS |
| 2 | `POST /api/auth/register` (user A — alur reset) | ✅ PASS |
| 3 | `POST /api/auth/forgot-password` — respons generik + token tersimpan (hash) di `password_reset_tokens` | ✅ PASS |
| 4 | `POST /api/auth/forgot-password` (email tidak terdaftar → tetap 200, anti-enumerasi) | ✅ PASS |
| 5 | `POST /api/auth/reset-password` (token valid → password berubah) | ✅ PASS |
| 6 | `POST /api/auth/login` (password baru berfungsi) | ✅ PASS |
| 7 | `POST /api/auth/reset-password` (token sudah dipakai → 400 `INVALID_TOKEN`) | ✅ PASS |
| 8 | `POST /api/auth/reset-password` (token kedaluwarsa → 400 `EXPIRED_TOKEN`) | ✅ PASS |
| 9 | `POST /api/auth/reset-password` (token tidak dikenal → 400 `INVALID_TOKEN`) | ✅ PASS |
| 10 | `POST /api/auth/register` (user B — data untuk moderasi) | ✅ PASS |
| 11 | `POST /api/invitations` + `/publish` (undangan terbit) | ✅ PASS |
| 12 | `POST /api/invitations/public/:slug/guestbook` (entri buku tamu) | ✅ PASS |
| 13 | `GET /api/admin/stats` (non-admin → 403 `FORBIDDEN`) | ✅ PASS |
| 14 | `POST /api/auth/register` (user C — calon admin) | ✅ PASS |
| 15 | `npm run admin:promote -- <email>` (script → role `admin`) | ✅ PASS |
| 16 | `GET /api/admin/stats` (admin → 200 + data) | ✅ PASS |
| 17 | `GET /api/admin/users` (list + filter `search`) | ✅ PASS |
| 18 | `GET /api/admin/users/:id` (detail + counts) | ✅ PASS |
| 19 | `GET /api/admin/invitations` (list) | ✅ PASS |
| 20 | `POST /api/admin/invitations/:id/unpublish` (`isPublished=false`) | ✅ PASS |
| 21 | `GET /api/admin/guestbook` (list) | ✅ PASS |
| 22 | `DELETE /api/admin/guestbook/:entryId` (204 + baris hilang) | ✅ PASS |
| 23 | `PATCH /api/admin/users/:id/role` (ubah role sendiri → 400 `VALIDATION_ERROR`) | ✅ PASS |
| 24 | `PATCH /api/admin/users/:id/role` (promote → demote, guard admin terakhir) | ✅ PASS |
| 25 | `GET /api/admin/users` (user yang sudah di-demote → 403) | ✅ PASS |

## Temuan

- **0 bug aplikasi ditemukan.** Fitur reset password (validasi token, kedaluwarsa, reuse, anti-enumerasi, revoke refresh token) dan admin dashboard (authorization, guard admin terakhir, moderasi) berfungsi sesuai spesifikasi.
- **Rate limit in-memory (auth 10/menit) terbukti bekerja** — saat verifikasi dijalankan beruntun dalam satu menit, respons `429 RATE_LIMITED` dikembalikan dengan benar (hardening Sprint 4 terkonfirmasi).
- **Catatan SMTP:** `SMTP_HOST` kosong di `.env` → `email-service.js` tidak mengirim email sungguhan, melainkan log dev (`[mail:dev]` + Reset URL) di konsol server. Alur token (generate, hash SHA-256, simpan, pakai, revoke) tetap terverifikasi penuh end-to-end.

## Kesimpulan

- Seluruh Acceptance Criteria fitur baru Sprint 5 (reset password + admin dashboard) terverifikasi end-to-end terhadap PostgreSQL asli: **25/25 PASS**.
- Script `scripts/e2e-sprint5.mjs` dapat dipakai ulang sebagai regression check.

## Re-verifikasi pasca-audit (16-08-2026)

- **25/25 PASS** kembali dijalankan setelah perbaikan temuan audit Sprint 5: `authLimiter` ganda pada `POST /api/auth/reset-password` dihapus (`api/routes/auth.js`) & warning production untuk `SMTP_HOST` kosong (`server/services/email-service.js`). Tidak ada regresi.
- Referensi: `.docs/audit/LAPORAN-AUDIT-SPRINT-5.html`.
