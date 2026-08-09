<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Sprint 3 · Category : Panduan (source of truth)
  Version  : 1.0.0 · Status : 🟠 Proses · Update : 05-08-2026
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
| Status | 🟠 Proses (Planning) |
| Release | v1.2.0 — The Core Features Release |
| Tanggal | 09-08-2026 |

---

## Sprint Goal

Menghadirkan **fitur inti platform**: pengguna dapat membuat akun, masuk, lalu membuat undangan digital sendiri — memilih template, menyesuaikan konten & tema, menyimpan, memublikasikan, dan mengelolanya — melalui API yang aman dan halaman builder di browser.

---

## Scope

1. **Planning** — dokumen Sprint 3, desain API & skema (append di `.docs/api.md` & `.docs/database.md`), sinkron roadmap/context.
2. **Database** — migrasi `0002`: tabel `refresh_tokens` + seed data `templates`.
3. **Autentikasi** — register, login, logout, refresh token (rotasi, httpOnly cookie), `GET /api/auth/me`, middleware `requireAuth`.
4. **Template API** — `GET /api/templates` (publik, hanya aktif).
5. **Invitation API** — CRUD + publish (auth, scoped per pemilik): list, create, get, update, delete, publish/unpublish.
6. **Frontend** — halaman `pages/login.html` (login/registrasi) & `pages/builder.html` (daftar undangan, form, pilih template, personalisasi tema, pratinjau live); disajikan statis oleh Express (same-origin).
7. **Documentation** — `api.md`, `database.md`, `changelog.md`, README, sinkron context.
8. **Audit** — laporan + perbaikan temuan.
9. **Release** — v1.2.0 **The Core Features Release** + tag git + sprint closed.

---

## Out of Scope

| Item | Alasan |
| --- | --- |
| Manajemen tamu & RSVP | Dipindah ke Sprint 4 |
| Buku tamu & amplop digital | Bergantung `guests`/`gifts` — Sprint 4 |
| Halaman undangan publik yang bisa dibuka tamu | Bergantung builder selesai; Sprint 4 |
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
| Halaman baru | `pages/login.html`, `pages/builder.html` + `assets/js/api.js`, `assets/css/pages.css` |
| Template awal | Seed 6 template dari portofolio landing page |
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
| 1.0.0 | 09-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 dimulai — Planning |
