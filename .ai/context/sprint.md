<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Sprint Context · Category : Context (living document)
  Version  : 1.1.0 · Status : ✅ Closed · Update : 10-08-2026
-->

# Sprint

> Status sprint yang sedang berjalan. **Referensi lengkap**: `.docs/sprint-1.md`, `.docs/sprint-2.md`, `.docs/sprint-3.md`. Perbarui file ini saat sprint dimulai, berubah, atau selesai.

---

## Sprint Berjalan (Active)

| Item | Detail |
| --- | --- |
| Sprint | Sprint 4 — (belum dijadwalkan) |
| Tujuan | — |
| Status | ⏸ Belum dimulai — menunggu Sprint 3 Closed lalu planning |
| Release | — |
| Referensi | — |

## Sprint Sebelumnya (Closed)

| Item | Detail |
| --- | --- |
| Sprint | Sprint 3 — The Core Features (Builder Undangan) |
| Tujuan | Autentikasi + builder undangan + template & personalisasi (API + halaman UI) |
| Status | ✅ Closed |
| Release | v1.2.0 — The Core Features Release |
| Referensi | `.docs/sprint-3.md` |

## Sprint Sebelumnya (Closed)

| Item | Detail |
| --- | --- |
| Sprint | Sprint 2 — The First Experience (Homepage) |
| Tujuan | Landing page pertama (9 section) di atas CSS Framework Sprint 1, responsive + interaksi |
| Status | ✅ Closed |
| Release | v1.1.0 — The First Experience Release |
| Referensi | `.docs/sprint-2.md` |

| Item | Detail |
| --- | --- |
| Sprint | Sprint 1 — Foundation (Alpha) |
| Tujuan | Membangun fondasi desain, struktur, dan halaman inti |
| Status | ✅ Closed |
| Release | v1.0.0 — The Foundation Release |

## Hasil Sprint 2

- Landing page 9 section (`index.html`) — ✅ selesai
- `sections.css` v1.1.0 & `responsive.css` v1.1.0 — ✅ selesai
- Interaksi vanilla JS (`navigation.js`, `accordion.js`, `scroll-effects.js`) — ✅ selesai
- SVG placeholder di `assets/img/` — ✅ selesai
- Dokumentasi & Audit — ✅ Audit PASS (20 PASS / 7 WARNING LOW / 0 ERROR)
- Release v1.1.0 — The First Experience Release (tag `v1.1.0`) — ✅ Stable
- Sprint 2 — ✅ Closed

## Hasil Sprint 1

- Design System resmi (Merah & Emas) — ✅ selesai (`variables.css`, `.docs/design-system.md`)
- Reset CSS — ✅ selesai (`assets/css/reset.css`, murni reset tanpa design token)
- Base stylesheet — ✅ selesai (`assets/css/base.css`, styling dasar elemen via design token)
- Utilities — ✅ selesai (`utilities.css`)
- Layout system — ✅ selesai (`layout.css`, 10 bagian layout reusable)
- Components — ✅ selesai (`components/` — button, card, badge, form, modular)
- Animation system — ✅ selesai (`animations.css`)
- Main entry point — ✅ selesai (`main.css`)
- Dokumentasi — ✅ selesai (component docs, engineering workflow, release policy)
- Audit — ✅ PASS (Internal Code Review, Architecture, QA, Engineering)
- Halaman inti & navigasi — ✅ selesai (Sprint 2: landing page 9 section)
- Setup awal server & database — ✅ selesai (Fase 1: Express ESM + skema awal + migrasi)

## Lingkup Sprint 3 (Disetujui)

- Autentikasi pengguna (register, login, logout, refresh, me)
- Builder / editor undangan digital (CRUD + publish, owner-scoped)
- Template undangan & personalisasi (list template aktif + tema)
- Halaman UI: `pages/login.html`, `pages/builder.html` & `pages/invitation.html` (disajikan Express)
- Halaman publik undangan `/u/:slug` — cover, hitung mundur, tema, musik, lokasi & kalender
- RSVP & buku tamu — masuk scope saat Development (tabel `guestbook` + endpoint publik + fallback demo)
- Galeri foto — kolom `gallery` JSONB di undangan (migrasi 0003)
- Manajemen tamu (kelola daftar tamu oleh pemilik) — 🟡 ditunda ke Sprint 4

## Hasil Sprint 3 (Development)

- ✅ Autentikasi lengkap — register/login/logout/refresh (rotasi + revoke, httpOnly cookie, hash SHA-256) + `me` + `requireAuth`
- ✅ Template API — `GET /api/templates` + 6 template seed (migrasi 0002)
- ✅ Invitation API — CRUD + publish/unpublish, owner-scoped, validasi server
- ✅ Halaman publik `/u/:slug` — cover, countdown, tema, musik, lokasi + kalender `.ics`, galeri, RSVP & buku tamu
- ✅ RSVP & buku tamu — tabel `guestbook` (migrasi 0003) + endpoint publik + fallback demo lokal
- ✅ Galeri foto — kolom `gallery` (migrasi 0003), dikelola builder, dirender publik
- ✅ Frontend — `login.html`, `builder.html`, `invitation.html` + `api.js`, `login.js`, `builder.js`, `invitation.js`, `demo-invitations.js`
- ✅ Audit PASS — 24 PASS · 6 WARNING (0 ERROR) — `.docs/audit/LAPORAN-AUDIT-SPRINT-3.html`
- ✅ Release v1.2.0 — The Core Features Release (tag `v1.2.0`) — Sprint 3 closed
- 📌 Catatan: verifikasi E2E penuh (register→login→CRUD→publish→guestbook) menunggu PostgreSQL terpasang

## Aturan Sprint

1. Pekerjaan baru masuk lingkup sprint harus disetujui terlebih dahulu.
2. Item yang belum selesai dicatat dengan jelas statusnya (🟡 Belum / 🟠 Proses / ✅ Selesai).
3. Setiap akhir sprint: review hasil, tulis changelog di `.docs/changelog.md`.

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.1.0 | 10-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Closed | Sprint 3 closed — Audit PASS + Release v1.2.0 The Core Features (tag v1.2.0) |
| 1.0.9 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 Development selesai (auth, template, invitation API, halaman publik, RSVP & buku tamu, galeri) — Review/Documentation |
| 1.0.8 | 09-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 dimulai — Planning (Auth + Builder + Template) |
| 1.0.7 | 05-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Closed | Sprint 2 closed — Audit PASS + Release v1.1.0 The First Experience (tag v1.1.0) |
| 1.0.6 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 2 — Development selesai (9 section + interaksi + aset); Review & Documentation |
| 1.0.4 | 04-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Sprint 1 closed — Release v1.0.0 The Foundation Release |
| 1.0.2 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Tambah base.css pada item base stylesheet (selesai) |
| 1.0.1 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Sinkronkan status item sprint (reset & komponen dasar selesai) |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Status Sprint 1 |
