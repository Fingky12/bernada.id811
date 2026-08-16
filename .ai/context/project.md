<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Project Context · Category : Context (living document)
  Version  : 1.2.0 · Status : ✅ Stable · Update : 16-08-2026
-->

# Konteks Project

> Dokumen ini memberikan gambaran umum project BERNADA.ID. **Perbarui setiap kali terjadi perubahan signifikan** pada project.

---

## Identitas Project

| Item | Detail |
| --- | --- |
| Nama | BERNADA.ID |
| Jenis | Platform SaaS Undangan Digital |
| Fokus | Undangan digital profesional (dimulai dari undangan pernikahan) |
| Versi | v1.5.0 (The Launch & Commerce Foundation — Stable, tag `v1.5.0`) |
| Brand | Kombinasi **Merah** & **Emas** |
| Karakter Brand | Elegan, Hangat, Romantis, Modern, Premium |

## Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | PostgreSQL |

## Struktur Project

```txt
BERNADA/
├── index.html
├── assets/css/          ← stylesheet (main.css meng-import seluruh CSS)
├── pages/               ← halaman-halaman aplikasi
├── api/                 ← kode API / endpoint
├── server/              ← kode server
├── database/            ← migrasi / skema database
├── .docs/               ← dokumentasi project
└── .ai/                 ← AI Development Framework (Kamu di sini)
```

## Design System

| Komponen | Lokasi |
| --- | --- |
| Design token (CSS Custom Properties) | `assets/css/variables.css` |
| Dokumentasi design system | `.docs/design-system.md` |
| Stylesheet utama | `assets/css/main.css` (single entry point — meng-import Google Fonts, `variables.css`, `reset.css`, `base.css`, `utilities.css`, `layout.css`, `components/` (button, card, badge, form), `sections.css`, `animations.css`, `responsive.css`) |

## Status Saat Ini

- **Fase:** 2 — Core Features (Beta) **selesai**. **Sprint 6** — The Launch & Commerce Foundation ✅ **Approved & Active** (16-08-2026): M0–M5 selesai, E2E 38/38 PASS + regression 25/25; menunggu audit & release v1.5.0 (M7).
- **Design system:** ✅ selesai — `variables.css` (Merah & Emas, termasuk token `--color-overlay-*`) + dokumentasi `.docs/design-system.md`.
- **Landing page:** ✅ selesai — v1.1.0 The First Experience (9 section + interaksi, tag `v1.1.0`); **section harga kini dinamis** dari `GET /api/packages` (`assets/js/landing-pricing.js`).
- **Server (Node.js/Express):** ✅ berjalan — ESM, `server/` (config, db pool, app, error handler, lib auth/jwt/password/validation/http-error, middleware rate-limit/require-admin, services) + `api/` (health, auth, templates, invitations + guestbook, guests, gift-accounts, admin, **packages, orders**). Jalankan: `npm install` → `npm run dev`.
- **Autentikasi:** ✅ register, login, logout, refresh (rotasi, cookie httpOnly), `me`; password hash `bcryptjs`, JWT access short-lived; rate limiting per IP; **lupa & reset password** via SMTP/dev-log (`POST /api/auth/forgot-password` & `reset-password`, token hash sekali pakai); **login redirect** `?next=` (hanya path relatif).
- **Admin dashboard:** ✅ `pages/admin.html` + `assets/js/admin.js` — stats, users (role/detail), invitations (unpublish), guestbook (hapus); `npm run admin:promote -- <email>`.
- **Builder & halaman publik:** ✅ `pages/login.html`, `pages/builder.html`, `pages/invitation.html` (CRUD + publish, tema, galeri, RSVP & buku tamu, **Kelola tamu & amplop**, section Amplop Digital publik + salin rekening, demo fallback); **badge status lifecycle** (draft/preview/published/unpublished).
- **Commerce:** ✅ pricing dinamis + flow checkout (`pages/checkout.html` + `assets/js/checkout.js`): pilih paket → buat order (idempotent, amount server-side) → payment (provider `manual`) → status; paket free auto-paid.
- **Database (PostgreSQL):** ✅ PostgreSQL 18.4 terpasang lokal; migrasi `0001`–`0010` sukses — `0001` (users/templates/invitations), `0002` (refresh_tokens + seed 6 template), `0003` (gallery + guestbook), `0004` (guests + gift_accounts), `0005` (password_reset_tokens), `0006` (fix updated_at), `0007` (packages + package_features), `0008` (orders), `0009` (payments), `0010` (invitation lifecycle: status + package_id + trigger sync) + runner `database/migrate.js`. Buat DB via `npm run db:create` lalu `npm run migrate`.
- **Verifikasi E2E:** ✅ Sprint 4 21/21 PASS (`.docs/e2e/sprint-4-verification.md`) & Sprint 5 **25/25 PASS** (`.docs/e2e/sprint-5-verification.md`, skrip `scripts/e2e-sprint5.mjs`) & Sprint 6 **38/38 PASS** (`.docs/e2e/sprint-6-verification.md`, skrip `scripts/e2e-sprint6.mjs`).
- **API & dokumentasi:** `.docs/api.md` (ver 1.6.0 — incl. packages, orders, payments, invitation status) & `.docs/database.md` (ver 1.6.0 — 0001–0010) terisi.

## Referensi Dokumentasi

- Arsitektur → `context/architecture.md` & `.docs/architecture.md`
- Roadmap → `context/roadmap.md` & `.docs/roadmap.md`
- Sprint → `context/sprint.md` & `.docs/sprint-1.md`

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.2.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 6 Active — Launch & Commerce Foundation: M0–M5 selesai, E2E 38/38 PASS + regression 25/25; menunggu audit & release v1.5.0 (M7) |
| 1.0.9 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 5 — dasbor admin & keamanan akun (reset password), E2E 25/25 PASS; menunggu audit & release v1.4.0 |
| 1.0.8 | 11-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Sprint 4 closed — Release v1.3.0 The Guest Experience (Audit PASS + tag v1.3.0); Fase 2 selesai |
| 1.0.7 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 4 — manajemen tamu + amplop digital + hardening LOW (Development) |
| 1.0.6 | 10-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Release v1.2.0 — The Core Features (Audit PASS + tag v1.2.0 + Sprint 3 closed) |
| 1.0.5 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 Development selesai — auth, builder, halaman publik, RSVP & galeri; menunggu audit & release v1.2.0 |
| 1.0.4 | 05-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Fase 1 selesai — server Express + database awal (skema & migrasi) |
| 1.0.3 | 04-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Update referensi style.css → main.css, tambah Engineering Workflow |
| 1.0.2 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Tambah base.css ke lapisan stylesheet & Google Fonts di style.css |
| 1.0.1 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Sinkronkan status: reset.css & komponen dasar selesai, halaman inti belum |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Initial release |
