<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Sprint 1 · Category : Panduan (source of truth)
  Version  : 1.0.3 · Status : ✅ Stable · Update : 04-08-2026
-->

# Sprint 1 — Foundation (Alpha)

> Dokumen sprint resmi. Ringkasan untuk AI ada di `.ai/context/sprint.md`.

---

## Info Sprint

| Item | Detail |
| --- | --- |
| Sprint | Sprint 1 — Foundation (Alpha) |
| Tujuan | Membangun fondasi desain, struktur, dan halaman inti |
| Status | Selesai |

## Lingkup & Status

| Item | Status | Catatan |
| --- | --- | --- |
| Design System resmi (Merah & Emas) | ✅ | `variables.css`, `.docs/design-system.md` |
| Reset CSS | ✅ | `assets/css/reset.css` — murni reset 12 bagian |
| Base stylesheet | ✅ | `assets/css/base.css` — styling dasar elemen via design token |
| Struktur stylesheet & layout dasar | ✅ | `layout.css` selesai; `sections.css` placeholder siap |
| Komponen UI dasar | ✅ | button (8 varian, 3 ukuran), card (4 varian), badge (4 varian), form (input, textarea, select, checkbox, radio, switch) |
| Animation system | ✅ | `animations.css` — keyframes, utility classes, duration, delay, easing, fill mode |
| Main entry point | ✅ | `main.css` — single entry point CSS Framework |
| Release | ✅ | v1.0.0 — The Foundation Release (`.docs/releases/v1.0.0-foundation.md`) |
| Halaman inti & navigasi | 🟡 | `index.html` masih kosong |
| Setup awal server & database | 🟡 | belum dimulai |
| Documentation | ✅ | button.md, card.md, badge.md, form.md lengkap |
| Audit | ✅ | Internal Code Review selesai — PASS |

## Definisi Selesai (Definition of Done)

1. Halaman inti (`index.html`) terbangun di atas design token dan komponen yang sudah ada.
2. Seluruh halaman responsif di semua breakpoint.
3. Aksesibilitas dasar terpenuhi (focus ring, kontras teks, reduced motion).
4. Tidak ada styling tersendiri yang mengesampingkan design token tanpa alasan.
5. Perubahan terdokumentasi di `.docs/changelog.md`.

## Aturan Sprint

1. Pekerjaan baru masuk lingkup sprint harus disetujui terlebih dahulu.
2. Item yang belum selesai dicatat dengan jelas statusnya (🟡 Belum / 🟠 Proses / ✅ Selesai).
3. Setiap akhir sprint: review hasil, tulis changelog di `.docs/changelog.md`.

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.3 | 04-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Update status komponen, tambah documentation & audit |
| 1.0.2 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Layout system selesai (layout.css) |
| 1.0.1 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Tambah item base stylesheet (selesai) |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Definisi Sprint 1 + status awal |
