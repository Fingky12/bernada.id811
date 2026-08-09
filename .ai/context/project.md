<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Project Context · Category : Context (living document)
  Version  : 1.0.4 · Status : ✅ Stable · Update : 05-08-2026
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
| Versi | v1.0.0 Alpha |
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

- **Fase:** Alpha — fondasi tampilan, server, dan database.
- **Design system:** ✅ selesai — `variables.css` (Merah & Emas) + dokumentasi `.docs/design-system.md`.
- **Landing page:** ✅ selesai — v1.1.0 The First Experience (9 section + interaksi, tag `v1.1.0`).
- **Server (Node.js/Express):** 🟠 berjalan — ESM, `server/` (config, db pool, app, error handler) + `api/` (router, endpoint health). Jalankan: `npm install` → `npm run dev`.
- **Database (PostgreSQL):** 🟠 skema awal + migrasi — `database/migrations/0001_init.sql` (users, templates, invitations) + runner `database/migrate.js`. PostgreSQL belum diinstall lokal; buat DB via `npm run db:create` lalu `npm run migrate`.
- **API & dokumentasi:** `.docs/api.md` & `.docs/database.md` terisi; endpoint health `/api/health`.

## Referensi Dokumentasi

- Arsitektur → `context/architecture.md` & `.docs/architecture.md`
- Roadmap → `context/roadmap.md` & `.docs/roadmap.md`
- Sprint → `context/sprint.md` & `.docs/sprint-1.md`

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.4 | 05-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Fase 1 selesai — server Express + database awal (skema & migrasi) |
| 1.0.3 | 04-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Update referensi style.css → main.css, tambah Engineering Workflow |
| 1.0.2 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Tambah base.css ke lapisan stylesheet & Google Fonts di style.css |
| 1.0.1 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Sinkronkan status: reset.css & komponen dasar selesai, halaman inti belum |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Initial release |
