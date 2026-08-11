<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Sprint 4 · Category : Panduan (source of truth)
  Version  : 1.2.0 · Status : ✅ Closed · Update : 11-08-2026
-->

# Sprint 4 — The Guest Experience

> Dokumen sprint resmi. Ringkasan untuk AI ada di `.ai/context/sprint.md`.
>
> Sprint ini mengikuti **Engineering Workflow** (`rules/10-engineering-workflow.md`).

---

## Info Sprint

| Item | Detail |
| --- | --- |
| Sprint | Sprint 4 — The Guest Experience |
| Tujuan | Manajemen tamu & amplop digital (transfer info) + verifikasi E2E (PostgreSQL) + perbaikan temuan LOW audit |
| Status | ✅ Closed |
| Release | v1.3.0 — The Guest Experience Release |
| Tanggal | 10-08-2026 (Development) · 11-08-2026 (Release) |

---

## Sprint Goal

Mengelola **tamu** dengan mudah (daftar, RSVP status, statistik) dan menyediakan **amplop digital** berupa info transfer pada undangan — sekaligus menutup temuan audit: **verifikasi E2E** (PostgreSQL terpasang) dan **5 temuan LOW** (validasi warna tema, token overlay, rate limiting, util bersama, dokumentasi JWT secret).

---

## Hasil Sprint

- ✅ **PostgreSQL terpasang** (18.4, scoop) — `npm run db:create` + `npm run migrate` 0001–0004 sukses (8 tabel).
- ✅ **Verifikasi E2E 21/21 PASS** — register → login → CRUD invitation → publish → guestbook → guests → gift-accounts → refresh → logout (`.docs/e2e/sprint-4-verification.md`); menutup temuan audit **MEDIUM AC7**.
- ✅ **2 bug ditemukan & diperbaiki selama E2E** — `23502 not_null_violation` pada create gift account (default `isActive`/`sortOrder` di `gift-account-service.js`) & publik gift-accounts selalu 401 (route publik dipindah sebelum `use(requireAuth)` + `requireAuth` per-route). Diverifikasi ulang.
- ✅ **Health check resmi di repo** — `scripts/health-check.mjs` + `npm run test:health` (PASS & jalur gagal teruji; endpoint tunggal `GET /api/health`).
- ✅ **Manajemen tamu** — tabel `guests` (migrasi 0004), API owner-scoped (`GET/POST .../guests`, `.../guests/stats`, `GET/PATCH/DELETE /api/guests/:guestId`), UI "Kelola" di builder.
- ✅ **Amplop digital** — tabel `gift_accounts` (migrasi 0004), API owner CRUD + publik `GET /api/invitations/public/:slug/gift-accounts` (hanya aktif), section Amplop Digital + tombol salin di halaman publik.
- ✅ **Hardening LOW** — `validateThemeColors` (whitelist hex), token `--color-overlay-*`, `server/middleware/rate-limit.js` (auth 10/mnt, guestbook 20/mnt, publik 120/mnt), `assets/js/util.js` bersama, dokumentasi JWT dev secret.
- ✅ **Dokumentasi** — `api.md`, `database.md`, changelog, roadmap, context tersinkron.
- ✅ **Audit PASS** — 24 PASS · 1 WARNING (temuan E2E, resolved) · 0 ERROR (`.docs/audit/LAPORAN-AUDIT-SPRINT-4.html`).
- ✅ **Release v1.3.0 — The Guest Experience Release** — disetujui Product Owner, Senior Engineer & AI Pair Programmer; tag git `v1.3.0` dibuat (`.docs/releases/v1.3.0-guest-experience.md`).
- ✅ **Sprint Closed** — seluruh Acceptance Criteria terpenuhi; Sprint 4 resmi ditutup.

---

## Scope

1. **Planning** — dokumen Sprint 4, desain API & skema (append di `.docs/api.md` & `.docs/database.md`), sinkron roadmap/context.
2. **Setup PostgreSQL & E2E** — instal PostgreSQL lokal, `npm run db:create` + `npm run migrate`, verifikasi E2E (register → login → CRUD invitation → publish → guestbook → guests → gift-accounts); rekam hasil (tutup temuan MEDIUM AC7).
3. **Database** — migrasi `0004`: tabel `guests` (manajemen tamu) & `gift_accounts` (amplop digital transfer).
4. **Guest API** — `GET/POST /api/invitations/:id/guests`, `PATCH/DELETE /api/guests/:guestId`, `GET /api/invitations/:id/guests/stats` (auth, owner-scoped).
5. **Gift Account API** — owner: `GET/POST /api/invitations/:id/gift-accounts`, `PATCH/DELETE /api/gift-accounts/:giftId`; publik: `GET /api/invitations/public/:slug/gift-accounts` (hanya aktif).
6. **Builder UI** — section "Tamu" (tambah tunggal/bulk, daftar, filter status, statistik) & "Amplop Digital" (CRUD rekening).
7. **Halaman publik** — section "Amplop Digital" di `/u/:slug` + render & aksi salin nomor rekening.
8. **Perbaikan temuan LOW audit** — validasi hex tema, token `--color-overlay-*`, rate limiting in-memory, util bersama `assets/js/util.js`, dokumentasi JWT dev secret.
9. **Documentation** — `api.md`, `database.md`, `changelog.md`, README, sinkron context.
10. **Audit** — laporan + perbaikan temuan.
11. **Release** — v1.3.0 **The Guest Experience Release** + tag git + sprint closed.

---

## Out of Scope

| Item | Alasan |
| --- | --- |
| Wishlist hadiah (`gift_items`) | Disetujui ditunda — amplop digital hanya transfer info |
| Payment / pricing engine | Tetap placeholder (Fase 3) |
| Admin panel | Belum diperlukan |
| Notifikasi/pengingat tamu (email/WA) | Fitur lanjutan — Fase 4 |

---

## Keputusan Planning

| Keputusan | Nilai |
| --- | --- |
| Release | v1.3.0 — The Guest Experience Release |
| Manajemen tamu | Tabel `guests` — pemilik mengelola daftar tamu & status RSVP |
| Amplop digital | Tabel `gift_accounts` — info transfer (bank, no. rekening, atas nama); hanya aktif tampil publik |
| Pola backend | Route (validasi `validation.js`) → service (query parameter binding) → pool — konsisten Sprint 3 |
| Frontend | Perluas `pages/builder.html` & `pages/invitation.html` + `builder.js`/`invitation.js` |
| Rate limiting | Middleware in-memory sederhana (tanpa dependency baru) |
| Util bersama | `assets/js/util.js` — `escapeHtml`, format tanggal (hilangkan duplikasi) |
| Git | Commit per milestone sesuai `rules/06` |

---

## Acceptance Criteria

1. PostgreSQL terpasang; `npm run db:create` + `npm run migrate` (0001–0004) sukses; **verifikasi E2E terekam** — menutup temuan MEDIUM AC7.
2. Pemilik bisa kelola daftar tamu (tambah, ubah status, hapus, statistik) via API & UI — owner-scoped, validasi server.
3. Pemilik bisa kelola rekening amplop digital (CRUD); halaman publik menampilkan hanya yang aktif.
4. Temuan LOW audit diperbaiki & terdokumentasi (hex tema, overlay, rate limit, util, JWT secret).
5. Dokumentasi sinkron; Audit PASS; Release v1.3.0 disetujui & dicatat di changelog; tag `v1.3.0`.

---

## Timeline

| Tahap | Aktivitas | Estimasi |
| --- | --- | --- |
| Planning | Dokumen sprint, desain API/skema | 1 hari |
| Setup | PostgreSQL + migrasi + E2E | 1 hari |
| Development | Migrasi 0004 + guest API | 2 hari |
| Development | Gift account API | 1 hari |
| Frontend | Builder (tamu & amplop) + halaman publik | 2 hari |
| Hardening | Perbaikan LOW audit | 1 hari |
| Documentation | Sinkron docs & changelog | 1 hari |
| Audit | Laporan + perbaikan | 1 hari |
| Release | v1.3.0 + approval + closed | 0.5 hari |

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.2.0 | 11-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Closed | Sprint 4 closed — Audit PASS + Release v1.3.0 The Guest Experience (tag v1.3.0) |
| 1.1.0 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Development — migrasi 0004, guest & gift API, builder UI, halaman publik, hardening LOW |
| 1.0.0 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 4 dimulai — Planning |
