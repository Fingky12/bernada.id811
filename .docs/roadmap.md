<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Roadmap · Category : Panduan (source of truth)
  Version  : 1.0.6 · Status : 🟠 Proses · Update : 05-08-2026
-->

# Roadmap BERNADA.ID

> Arah pengembangan jangka panjang BERNADA.ID. Dokumen ini adalah **sumber kebenaran**; ringkasan untuk AI ada di `.ai/context/roadmap.md`.
>
> Status item: 🟡 Belum · 🟠 Proses/sebagian · ✅ Selesai.
>
> **Sprint aktif:** belum ada — Sprint 2 telah Closed. Berikutnya: Fase 2 — Core Features (Beta).

---

## Fase 1 — Foundation (Alpha) · v1.0.0 Alpha

**Tujuan:** membangun fondasi desain, struktur kode, dan halaman inti.

> ✅ **Fase 1 selesai (05-08-2026).** Server & database awal telah dibangun (Node.js/Express + skema PostgreSQL + alur migrasi). Catatan: PostgreSQL belum diinstall di mesin lokal — pengujian end-to-end menunggu instalasi. Item berikutnya masuk ke Fase 2.

| Item | Status | Catatan |
| --- | --- | --- |
| Design System resmi (Merah & Emas) | ✅ | `assets/css/variables.css`, `.docs/design-system.md` |
| Reset CSS dasar | ✅ | `assets/css/reset.css` — murni reset, tanpa design token |
| Base stylesheet | ✅ | `assets/css/base.css` — styling dasar elemen via design token |
| Struktur stylesheet & layout dasar | ✅ | `layout.css` selesai (container, grid, flex, stack, cluster, sidebar, dll.); `sections.css` placeholder siap |
| Komponen UI dasar | ✅ | button, card, badge, form di `assets/css/components/` (modular, satu file per komponen) |
| Animation system | ✅ | `animations.css` — keyframes, utility classes, duration, delay, easing, fill mode |
| Main entry point | ✅ | `main.css` — single entry point CSS Framework |
| Halaman inti & navigasi | ✅ | Sprint 2 closed — `index.html` 9 section + interaksi; Release v1.1.0 The First Experience (tag `v1.1.0`) |
| Setup server & database awal | ✅ | Node.js/Express (ESM) + health check (`/api/health`); skema awal users/templates/invitations + alur migrasi (`database/migrations/`); PostgreSQL belum diinstall lokal |

## Fase 2 — Core Features (Beta) · v1.0.0 Beta

- Builder / editor undangan digital
- Template undangan & personalisasi
- Manajemen tamu & RSVP
- Autentikasi pengguna

## Fase 3 — Launch · v1.0.0 GA

- Pembayaran & penagihan
- Optimasi performa & SEO
- Uji coba & hardening produksi

## Fase 4 — Scale & Expand (Post-GA)

- Kategori undangan non-pernikahan
- Analitik untuk pengguna
- Multi-template marketplace
- Integrasi pihak ketiga (media, payment, notification)

---

## Prinsip Roadmap

1. Setiap fase harus menyelesaikan fondasi terlebih dahulu (design system → komponen → fitur).
2. Fitur baru tidak boleh mengorbankan kualitas fondasi yang sudah ada.
3. Roadmap bisa berubah — perubahan harus disetujui manusia dan dicatat di changelog.

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.7 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Fase 1 selesai — setup server & database awal |
| 1.0.6 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 2 closed — Release v1.1.0 The First Experience; Fase 1 selesai (server & database belum) |
| 1.0.5 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Homepage 9 section selesai dibangun — menunggu audit & Release v1.1.0 |
| 1.0.3 | 04-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Sprint 1 selesai — Release v1.0.0 The Foundation Release |
| 1.0.2 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Layout system selesai (layout.css 10 bagian) |
| 1.0.1 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Tambah base.css (base stylesheet) pada Fase 1 |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Draft roadmap berbasis fase |
