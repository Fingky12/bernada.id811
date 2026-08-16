<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Roadmap Context · Category : Context (living document)
  Version  : 1.6.0 · Status : ✅ Stable · Update : 16-08-2026
-->

# Roadmap

> Arah pengembangan jangka panjang BERNADA.ID. **Sumber kebenaran tetap** ada di `.docs/roadmap.md`; file ini adalah ringkasan untuk AI agar tidak menebak fase pengembangan.
>
> **Sprint terakhir:** Sprint 6 — The Launch & Commerce Foundation (Fase 3, 16-08-2026, ✅ Closed; tag `v1.5.0`).

---

## Fase Pengembangan

### 🟠 Fase 1 — Foundation (Alpha) · v1.0.0 Alpha

- Design System resmi (Merah & Emas) ✅
- Reset CSS dasar (`reset.css`) ✅
- Base stylesheet (`base.css`) ✅
- Utilities (`utilities.css`) ✅
- Layout system (`layout.css`) ✅
- Components (`components/` — button, card, badge, form) ✅
- Animation system (`animations.css`) ✅
- Main entry point (`main.css`) ✅
- Release v1.0.0 — The Foundation Release ✅
- Halaman inti & navigasi ✅ — Sprint 2 closed: `index.html` 9 section + interaksi; Release v1.1.0 (tag `v1.1.0`)
- Setup server & database awal ✅ — Express (ESM) + `/api/health`; skema users/templates/invitations + migrasi; PostgreSQL belum diinstall lokal

### 🟠 Fase 2 — Core Features (Beta) · v1.0.0 Beta

> Sprint 3 (The Core Features) ✅ Closed 10-08-2026 — Release v1.2.0.
> Sprint 4 (The Guest Experience) ✅ Closed 11-08-2026 — Release v1.3.0 (tag `v1.3.0`); Fase 2 selesai.

- Autentikasi pengguna ✅ (register, login, logout, refresh rotasi, me, requireAuth)
- Template undangan & personalisasi ✅ (`GET /api/templates` + 6 seed, tema warna)
- Builder / editor undangan digital ✅ (CRUD + publish, owner-scoped)
- Halaman publik `/u/:slug` ✅ (cover, countdown, tema, musik, lokasi, kalender, galeri)
- RSVP & buku tamu ✅ (tabel `guestbook`, endpoint publik, fallback demo)
- Manajemen tamu ✅ (tabel `guests`, CRUD + stats, UI Kelola — Sprint 4)
- Amplop digital ✅ (tabel `gift_accounts`, API owner & publik — transfer info; wishlist 🟡 ditunda — Sprint 4)

### ✅ Sprint 5 — The Admin & Account Security · v1.4.0 (Closed)

> ✅ Closed 16-08-2026 — Audit PASS + Release v1.4.0 (tag `v1.4.0`).

- Dasbor admin & role management ✅ — middleware `requireAdmin`, `/api/admin/*`, UI `pages/admin.html`, script `admin:promote`
- Lupa & reset password (SMTP + token) ✅ — migrasi 0005 & 0006, service email & reset, endpoint forgot/reset, UI login
- Verifikasi E2E fitur baru ✅ — 25/25 PASS (`.docs/e2e/sprint-5-verification.md`)
- Audit Sprint 5 & Release v1.4.0 ✅ — Audit PASS + tag `v1.4.0`

### 🟢 Sprint 6 — The Launch & Commerce Foundation · v1.5.0 (Active)

> ✅ Closed 16-08-2026 — M0–M7 selesai; E2E Sprint 6 **38/38 PASS** + regression Sprint 5 25/25 PASS; Audit PASS 25/0/0; tag `v1.5.0` dibuat. Sisa: redeploy :3000. Detail: `.docs/sprint-6.md`, `.docs/e2e/sprint-6-verification.md`, `.docs/audit/LAPORAN-AUDIT-SPRINT-6.html`, `.docs/releases/v1.5.0-launch-commerce-foundation.md`.

- Pricing & packages ✅ — migrasi `0007`, `package-service.js`, `GET /api/packages` (+ `:id`), seed placeholder
- Order foundation ✅ — migrasi `0008_orders.sql`, `order-service.js`, amount server-side, idempotency, ownership, rate limit
- Payment boundary ✅ — migrasi `0009_payments.sql`, adapter registry + provider `manual`, paid hanya dari backend
- Invitation lifecycle ✅ — migrasi `0010_invitation_lifecycle.sql` (status + package_id + trigger sync), endpoint status
- Builder readiness ✅ — badge status lifecycle
- Frontend commerce ✅ — pricing dinamis (`landing-pricing.js`), checkout (`checkout.html`/`checkout.js`), login redirect `?next=`
- E2E Sprint 6 & regression ✅ — 38/38 + 25/25 PASS
- Audit & release v1.5.0 ✅ — Audit PASS 25/0/0; release doc Stable + tag `v1.5.0`; sisa: redeploy :3000

### 🟢 Fase 3 — Launch · v1.0.0 GA

- Pembayaran & penagihan
- Optimasi performa & SEO
- Uji coba & hardening produksi

### 🔵 Fase 4 — Scale & Expand (Post-GA)

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
| 1.6.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Closed | Sprint 6 closed — Launch & Commerce Foundation: E2E 38/38 + regression 25/25, Audit PASS 25/0/0, tag `v1.5.0`; sisa: redeploy :3000 |
| 1.3.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 5 Development — dasbor admin & keamanan akun (reset password), E2E 25/25 PASS; menunggu audit & release v1.4.0 |
| 1.2.0 | 11-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 4 closed — Release v1.3.0 The Guest Experience (tag v1.3.0); Fase 2 selesai; menunggu planning Sprint 5 (Fase 3) |
| 1.1.0 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 4 dimulai — Manajemen tamu + amplop digital + hardening LOW (Development) |
| 1.0.9 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 closed — Release v1.2.0 The Core Features |
| 1.0.8 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 Development selesai — Fase 2 (auth, template, builder, halaman publik, RSVP & galeri) |
| 1.0.7 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Fase 1 selesai — setup server & database awal |
| 1.0.7 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 2 closed — Release v1.1.0 The First Experience; Fase 1 selesai |
| 1.0.6 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Homepage 9 section selesai dibangun — menunggu audit & Release v1.1.0 |
| 1.0.4 | 04-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Sprint 1 selesai — Release v1.0.0 The Foundation Release |
| 1.0.2 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Tambah base.css (base stylesheet) pada progres Fase 1 |
| 1.0.1 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Sinkronkan progres Fase 1: reset CSS & komponen dasar selesai |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Draft roadmap berbasis fase |
