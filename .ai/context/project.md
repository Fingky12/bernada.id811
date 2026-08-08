<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Project Context · Category : Context (living document)
  Version  : 1.0.3 · Status : ✅ Stable · Update : 04-08-2026
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

- **Fase:** Alpha — fondasi tampilan dan struktur.
- **Design system:** ✅ selesai — `variables.css` (Merah & Emas) + dokumentasi `.docs/design-system.md`.
- **Reset CSS:** ✅ selesai — `assets/css/reset.css` murni reset 12 bagian, tanpa design token.
- **Komponen UI dasar:** 🟠 sebagian — button, card, badge, form di `assets/css/components/` (modular, satu file per komponen).
- **Halaman inti & navigasi:** 🟡 belum — `index.html` masih kosong; `sections.css` belum diisi.
- **API & database:** 🟡 belum — masih tahap perancangan awal.

## Referensi Dokumentasi

- Arsitektur → `context/architecture.md` & `.docs/architecture.md`
- Roadmap → `context/roadmap.md` & `.docs/roadmap.md`
- Sprint → `context/sprint.md` & `.docs/sprint-1.md`

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.3 | 04-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Update referensi style.css → main.css, tambah Engineering Workflow |
| 1.0.2 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Tambah base.css ke lapisan stylesheet & Google Fonts di style.css |
| 1.0.1 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Sinkronkan status: reset.css & komponen dasar selesai, halaman inti belum |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Initial release |
