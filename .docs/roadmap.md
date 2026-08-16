<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Roadmap · Category : Panduan (source of truth)
  Version  : 1.5.0 · Status : 🟠 Proses · Update : 16-08-2026
-->

# Roadmap BERNADA.ID

> Arah pengembangan jangka panjang BERNADA.ID. Dokumen ini adalah **sumber kebenaran**; ringkasan untuk AI ada di `.ai/context/roadmap.md`.
>
> Status item: 🟡 Belum · 🟠 Proses/sebagian · ✅ Selesai.
>
> **Sprint berikutnya:** Sprint 7 (belum direncanakan) · **Sprint terakhir:** Sprint 6 — The Launch & Commerce Foundation (Fase 3, 16-08-2026, ✅ Closed; v1.5.0 kandidat menunggu tag).

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

**Tujuan:** fitur inti platform — autentikasi, builder undangan, template & personalisasi.

> Sprint 3 — The Core Features: ✅ Closed (10-08-2026) — Audit PASS + Release v1.2.0 (tag `v1.2.0`).
> Sprint 4 — The Guest Experience: ✅ Closed (11-08-2026) — manajemen tamu + amplop digital + hardening LOW + verifikasi PostgreSQL & E2E 21/21 PASS (release v1.3.0, tag `v1.3.0`). Fase 2 selesai.

| Item | Status | Catatan |
| --- | --- | --- |
| Autentikasi pengguna | ✅ | register, login, logout, refresh (rotasi, httpOnly), `me`, `requireAuth` |
| Template undangan | ✅ | `GET /api/templates` publik + 6 template seed (migrasi 0002) |
| Builder / editor undangan digital | ✅ | `pages/builder.html` — CRUD + publish/unpublish, owner-scoped |
| Halaman publik undangan `/u/:slug` | ✅ | cover, countdown, tema, musik, lokasi, kalender `.ics`, galeri |
| RSVP & buku tamu | ✅ | tabel `guestbook` (migrasi 0003) + endpoint publik + fallback demo |
| Manajemen tamu (kelola daftar tamu pemilik) | ✅ | tabel `guests` (migrasi 0004), CRUD + stats + UI Kelola di builder (Sprint 4) |
| Amplop digital (`gifts`) | ✅ | tabel `gift_accounts` (migrasi 0004), API owner & publik, transfer info saja; wishlist 🟡 ditunda (Sprint 4) |
| Payment / pricing engine | 🟡 | Fase 3 |

## Sprint 5 — The Admin & Account Security · v1.4.0 (Closed)

> Sprint 5 (12–16-08-2026) — ✅ Closed 16-08-2026: Audit PASS + Release v1.4.0 (tag `v1.4.0`).

| Item | Status | Catatan |
| --- | --- | --- |
| Dasbor admin & role management | ✅ | middleware `requireAdmin`, `/api/admin/*` (stats, users, role, invitations, guestbook), UI `pages/admin.html`, script `admin:promote` |
| Lupa & reset password (SMTP + token) | ✅ | migrasi 0005 & 0006, `password-reset-service.js` + `email-service.js`, endpoint forgot/reset, UI login |
| Verifikasi E2E fitur baru | ✅ | 25/25 PASS — `.docs/e2e/sprint-5-verification.md` |
| Audit Sprint 5 & Release v1.4.0 | ✅ | Audit PASS (24 PASS · 1 WARNING resolved · 0 ERROR) + tag `v1.4.0` — Sprint 5 closed |

## Sprint 6 — The Launch & Commerce Foundation · v1.5.0 (Closed)

> Sprint 6 (16-08-2026) — ✅ Closed. M0–M7 selesai; E2E Sprint 6 **38/38 PASS** + regression Sprint 5 25/25 PASS; Audit PASS (25/0/0); release v1.5.0 kandidat menunggu tag & redeploy :3000. Detail: `.docs/sprint-6.md`, `.docs/e2e/sprint-6-verification.md`, `.docs/audit/LAPORAN-AUDIT-SPRINT-6.html`, `.docs/releases/v1.5.0-launch-commerce-foundation.md`.

| Item | Status | Catatan |
| --- | --- | --- |
| Pricing & packages | ✅ | migrasi `0007`, `package-service.js`, `GET /api/packages` (+ `:id`), seed placeholder (`BUSINESS DECISION REQUIRED`) |
| Order foundation | ✅ | migrasi `0008_orders.sql`, `order-service.js` — amount server-side, `order_number`, idempotency, ownership 404, rate limit 10/mnt |
| Payment boundary | ✅ | migrasi `0009_payments.sql`, adapter registry (`server/services/payment/index.js`) + provider `manual`, paid hanya dari backend; `PAYMENT PROVIDER DECISION REQUIRED` |
| Invitation lifecycle | ✅ | migrasi `0010_invitation_lifecycle.sql` — status `draft/preview/published/unpublished` + `package_id` + trigger sync; endpoint status (GET/PATCH) |
| Builder readiness | ✅ | badge status lifecycle di builder (`statusBadge`) |
| Frontend commerce | ✅ | pricing landing dinamis (`landing-pricing.js`), flow checkout (`pages/checkout.html` + `checkout.js`), login redirect `?next=` |
| E2E Sprint 6 & regression | ✅ | `scripts/e2e-sprint6.mjs` 38/38 PASS + Sprint 5 25/25 PASS |
| Audit & release v1.5.0 | ✅ | Audit PASS 25/0/0; release doc kandidat + `package.json` v1.5.0; menunggu approval tag |

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
| 1.5.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟡 Kandidat | Sprint 6 Closed — Launch & Commerce Foundation: E2E 38/38 + regression 25/25, Audit PASS 25/0/0, release doc + bump v1.5.0; menunggu approval tag & redeploy :3000 |
| 1.3.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 5 Development — dasbor admin & keamanan akun (reset password) selesai, E2E 25/25 PASS; menunggu audit & release v1.4.0 |
| 1.2.0 | 11-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 4 closed — Release v1.3.0 The Guest Experience (tag v1.3.0); Fase 2 selesai; menunggu planning Sprint 5 (Fase 3 — Launch) |
| 1.1.0 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 4 dimulai — Manajemen tamu + amplop digital + hardening LOW (Development) |
| 1.0.9 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 closed — Release v1.2.0 The Core Features (tag v1.2.0); Fase 2 inti selesai |
| 1.0.8 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 Development selesai — Fase 2 (auth, template, builder, halaman publik, RSVP & galeri) menunggu audit & release |
| 1.0.7 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Fase 1 selesai — setup server & database awal |
| 1.0.6 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 2 closed — Release v1.1.0 The First Experience; Fase 1 selesai (server & database belum) |
| 1.0.5 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Homepage 9 section selesai dibangun — menunggu audit & Release v1.1.0 |
| 1.0.3 | 04-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Sprint 1 selesai — Release v1.0.0 The Foundation Release |
| 1.0.2 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Layout system selesai (layout.css 10 bagian) |
| 1.0.1 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Tambah base.css (base stylesheet) pada Fase 1 |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Draft roadmap berbasis fase |
