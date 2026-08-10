<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Project Context · Category : Context (living document)
  Version  : 1.0.6 · Status : ✅ Stable · Update : 10-08-2026
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
| Versi | v1.2.0 (The Core Features) |
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

- **Fase:** 2 — Core Features (Beta). Release v1.2.0 **The Core Features** (tag `v1.2.0`) — Sprint 3 closed.
- **Design system:** ✅ selesai — `variables.css` (Merah & Emas) + dokumentasi `.docs/design-system.md`.
- **Landing page:** ✅ selesai — v1.1.0 The First Experience (9 section + interaksi, tag `v1.1.0`).
- **Server (Node.js/Express):** ✅ berjalan — ESM, `server/` (config, db pool, app, error handler, lib auth/jwt/password/validation) + `api/` (health, auth, templates, invitations + guestbook). Jalankan: `npm install` → `npm run dev`.
- **Autentikasi:** ✅ register, login, logout, refresh (rotasi, cookie httpOnly), `me`; password hash `bcryptjs`, JWT access short-lived.
- **Builder & halaman publik:** ✅ `pages/login.html`, `pages/builder.html`, `pages/invitation.html` (CRUD + publish, tema, galeri, RSVP & buku tamu, demo fallback).
- **Database (PostgreSQL):** 🟠 skema lengkap + migrasi — `0001` (users/templates/invitations), `0002` (refresh_tokens + seed 6 template), `0003` (gallery + guestbook) + runner `database/migrate.js`. PostgreSQL belum diinstall lokal; buat DB via `npm run db:create` lalu `npm run migrate`.
- **API & dokumentasi:** `.docs/api.md` & `.docs/database.md` terisi (auth, templates, invitations, publik `/u/:slug`, guestbook).

## Referensi Dokumentasi

- Arsitektur → `context/architecture.md` & `.docs/architecture.md`
- Roadmap → `context/roadmap.md` & `.docs/roadmap.md`
- Sprint → `context/sprint.md` & `.docs/sprint-1.md`

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.6 | 10-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Release v1.2.0 — The Core Features (Audit PASS + tag v1.2.0 + Sprint 3 closed) |
| 1.0.5 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 Development selesai — auth, builder, halaman publik, RSVP & galeri; menunggu audit & release v1.2.0 |
| 1.0.4 | 05-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Fase 1 selesai — server Express + database awal (skema & migrasi) |
| 1.0.3 | 04-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Update referensi style.css → main.css, tambah Engineering Workflow |
| 1.0.2 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Tambah base.css ke lapisan stylesheet & Google Fonts di style.css |
| 1.0.1 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Sinkronkan status: reset.css & komponen dasar selesai, halaman inti belum |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Initial release |
