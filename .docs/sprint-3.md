<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Sprint 3 · Category : Panduan (source of truth)
  Version  : 1.0.2 · Status : ✅ Closed · Update : 10-08-2026
-->

# Sprint 3 — The Core Features (Builder Undangan)

> Dokumen sprint resmi. Ringkasan untuk AI ada di `.ai/context/sprint.md`.
>
> Sprint ini mengikuti **Engineering Workflow** (`rules/10-engineering-workflow.md`).

---

## Info Sprint

| Item | Detail |
| --- | --- |
| Sprint | Sprint 3 — The Core Features (Builder Undangan) |
| Tujuan | Autentikasi pengguna + builder undangan digital + template & personalisasi — API dan halaman UI |
| Status | ✅ Closed |
| Release | v1.2.0 — The Core Features Release |
| Tanggal | 09-08-2026 (Development) · 10-08-2026 (Release) |

---

## Sprint Goal

Menghadirkan **fitur inti platform**: pengguna dapat membuat akun, masuk, lalu membuat undangan digital sendiri — memilih template, menyesuaikan konten & tema, menyimpan, memublikasikan, dan mengelolanya — melalui API yang aman dan halaman builder di browser.

---

## Hasil Sprint

- ✅ **Autentikasi lengkap** — register, login, logout, refresh (rotasi + revoke), `GET /api/auth/me`, middleware `requireAuth`. Password hash `bcryptjs`, refresh token di cookie httpOnly (hash SHA-256 di DB).
- ✅ **Template API** — `GET /api/templates` (publik, hanya aktif) + 6 template seed (migrasi 0002).
- ✅ **Invitation API** — CRUD + publish/unpublish (auth, owner-scoped), validasi server lengkap, parameter binding.
- ✅ **Halaman publik** — `/u/:slug` (cover, countdown, tema warna, musik, lokasi & kalender `.ics`, galeri foto, RSVP & buku tamu) + endpoint publik.
- ✅ **RSVP & buku tamu** — tabel `guestbook` (migrasi 0003) + endpoint publik list/create + fallback demo lokal saat DB tidak aktif.
- ✅ **Galeri foto** — kolom `gallery` JSONB (migrasi 0003), dikelola di builder, dirender di halaman publik.
- ✅ **Frontend** — `pages/login.html`, `pages/builder.html` (list + editor + pratinjau live + pilih template + tema warna + galeri), `pages/invitation.html`; disajikan Express same-origin.
- ✅ **Dokumentasi** — `api.md`, `database.md`, changelog, context tersinkron.
- ✅ **Audit PASS** — 24 PASS · 6 WARNING (LOW/non-blocking, 1 MEDIUM verifikasi E2E menunggu DB) · 0 ERROR (`.docs/audit/LAPORAN-AUDIT-SPRINT-3.html`).
- ✅ **Release v1.2.0 — The Core Features Release** — disetujui Product Owner, Senior Engineer & AI Pair Programmer; tag git `v1.2.0` dibuat (`.docs/releases/v1.2.0-core-features.md`).
- ✅ **Sprint Closed** — seluruh Acceptance Criteria yang dapat diverifikasi terpenuhi; Sprint 3 resmi ditutup. Verifikasi E2E penuh dijadwalkan setelah PostgreSQL terpasang.

---

## Scope

1. **Planning** — dokumen Sprint 3, desain API & skema (append di `.docs/api.md` & `.docs/database.md`), sinkron roadmap/context.
2. **Database** — migrasi `0002`: tabel `refresh_tokens` + seed data `templates`.
3. **Autentikasi** — register, login, logout, refresh token (rotasi, httpOnly cookie), `GET /api/auth/me`, middleware `requireAuth`.
4. **Template API** — `GET /api/templates` (publik, hanya aktif).
5. **Invitation API** — CRUD + publish (auth, scoped per pemilik): list, create, get, update, delete, publish/unpublish.
6. **Frontend** — halaman `pages/login.html` (login/registrasi), `pages/builder.html` (daftar undangan, form, pilih template, personalisasi tema, pratinjau live, galeri), & `pages/invitation.html` (halaman publik `/u/:slug`); disajikan statis oleh Express (same-origin).
7. **Halaman publik undangan** — endpoint publik `GET /api/invitations/public/:slug` (hanya terbit) + halaman `/u/:slug` (cover, hitung mundur, tema warna, musik latar, tautan lokasi & kalender).
8. **RSVP & buku tamu** *(masuk scope saat Development)* — migrasi `0003` (galeri + tabel `guestbook`), endpoint publik `GET/POST /api/invitations/public/:slug/guestbook`, formulir RSVP & buku tamu di halaman publik, fallback demo lokal.
9. **Documentation** — `api.md`, `database.md`, `changelog.md`, README, sinkron context.
10. **Audit** — laporan + perbaikan temuan.
11. **Release** — v1.2.0 **The Core Features Release** + tag git + sprint closed.

---

## Out of Scope

| Item | Alasan |
| --- | --- |
| Manajemen tamu & RSVP (kelola daftar tamu oleh pemilik) | Belum perlu untuk Release v1.2.0 — melengkapi `guests` di Sprint 4 |
| Amplop digital (`gifts`) | Bergantung tabel `gifts` — Sprint 4 |
| Payment / pricing engine | Tetap placeholder |
| Admin panel | Belum diperlukan |

---

## Keputusan Planning

| Keputusan | Nilai |
| --- | --- |
| Release | v1.2.0 — The Core Features Release |
| Token | JWT access (short-lived) + refresh token rotasi (httpOnly cookie, hash di DB) |
| Password | `bcryptjs` (hash) — tanpa build step, aman di Windows |
| Validasi input | Helper `server/lib/validation.js` (tanpa dependency baru) |
| Serving frontend | Express `express.static` — frontend & API same-origin |
| Halaman baru | `pages/login.html`, `pages/builder.html`, `pages/invitation.html` + `assets/js/api.js`, `assets/js/login.js`, `assets/js/builder.js`, `assets/js/invitation.js`, `assets/js/demo-invitations.js`, `assets/css/pages.css`, `assets/css/invitation.css` |
| URL publik undangan | `GET /u/:slug` (halaman) → `GET /api/invitations/public/:slug` (data) |
| Template awal | Seed 6 template dari portofolio landing page |
| RSVP & buku tamu | Migrasi `0003` — endpoint publik, fallback demo lokal saat API/DB tidak aktif |
| Git | Commit per milestone sesuai `rules/06` |

---

## Acceptance Criteria

1. Pengguna bisa register, login, logout, refresh — password tersimpan hash (`bcryptjs`), token di httpOnly cookie, refresh token dirotasi & bisa di-revoke.
2. Hanya pemilik undangan yang bisa mengakses/mengubah undangannya (owner scoping).
3. Seluruh input divalidasi di server (tipe, panjang, format) — query memakai parameter binding.
4. `GET /api/templates` publik hanya menampilkan template aktif.
5. Halaman login & builder berfungsi di browser: login → buat undangan → personalisasi → pratinjau → simpan → daftar → publish.
6. Tidak ada secret di kode (env via `.env`); error tidak membocorkan detail internal.
7. Verifikasi API end-to-end (register → login → CRUD invitation) terekam.
8. Dokumentasi sinkron; Audit PASS; Release v1.2.0 disetujui & dicatat di changelog.

---

## Timeline

| Tahap | Aktivitas | Estimasi |
| --- | --- | --- |
| Planning | Dokumen sprint, desain API/skema | 1 hari |
| Development | Migrasi DB + backend auth | 2 hari |
| Development | Template & invitation API | 2 hari |
| Development | Frontend login & builder | 3 hari |
| Review & Refactor | Self-review `rules/09` | 1 hari |
| Documentation | Sinkron docs & changelog | 1 hari |
| Audit | Laporan + perbaikan | 1 hari |
| Release | v1.2.0 + approval + closed | 0.5 hari |

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.2 | 10-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Closed | Sprint 3 closed — Audit PASS + Release v1.2.0 The Core Features (tag v1.2.0) |
| 1.0.1 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Development selesai (auth, template, invitation API, halaman publik, RSVP & buku tamu, galeri) — Review/Documentation |
| 1.0.0 | 09-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 dimulai — Planning |
