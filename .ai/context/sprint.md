<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Sprint Context · Category : Context (living document)
  Version  : 1.0.8 · Status : 🟠 Proses · Update : 09-08-2026
-->

# Sprint

> Status sprint yang sedang berjalan. **Referensi lengkap**: `.docs/sprint-1.md`, `.docs/sprint-2.md`, `.docs/sprint-3.md`. Perbarui file ini saat sprint dimulai, berubah, atau selesai.

---

## Sprint Berjalan (Active)

| Item | Detail |
| --- | --- |
| Sprint | Sprint 3 — The Core Features (Builder Undangan) |
| Tujuan | Autentikasi + builder undangan + template & personalisasi (API + halaman UI) |
| Status | 🟠 Proses (Planning) |
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
- Halaman UI: `pages/login.html` & `pages/builder.html` (disajikan Express)
- Manajemen tamu & RSVP — 🟡 ditunda ke Sprint 4

## Aturan Sprint

1. Pekerjaan baru masuk lingkup sprint harus disetujui terlebih dahulu.
2. Item yang belum selesai dicatat dengan jelas statusnya (🟡 Belum / 🟠 Proses / ✅ Selesai).
3. Setiap akhir sprint: review hasil, tulis changelog di `.docs/changelog.md`.

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.8 | 09-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 dimulai — Planning (Auth + Builder + Template) |
| 1.0.7 | 05-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Closed | Sprint 2 closed — Audit PASS + Release v1.1.0 The First Experience (tag v1.1.0) |
| 1.0.6 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 2 — Development selesai (9 section + interaksi + aset); Review & Documentation |
| 1.0.4 | 04-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Sprint 1 closed — Release v1.0.0 The Foundation Release |
| 1.0.2 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Tambah base.css pada item base stylesheet (selesai) |
| 1.0.1 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Sinkronkan status item sprint (reset & komponen dasar selesai) |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Status Sprint 1 |
