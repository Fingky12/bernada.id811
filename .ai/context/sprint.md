<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Sprint Context · Category : Context (living document)
  Version  : 1.7.0 · Status : ✅ Stable · Update : 16-08-2026
-->

# Sprint

> Status sprint yang sedang berjalan. **Referensi lengkap**: `.docs/sprint-1.md`, `.docs/sprint-2.md`, `.docs/sprint-3.md`, `.docs/sprint-4.md`, `.docs/sprint-5.md`, `.docs/sprint-6.md`. Perbarui file ini saat sprint dimulai, berubah, atau selesai.

---

## Sprint Terakhir (Closed)

| Item | Detail |
| --- | --- |
| Sprint | Sprint 6 — The Launch & Commerce Foundation |
| Tujuan | Fondasi pricing/paket, order/checkout, boundary pembayaran, lifecycle undangan, builder readiness, frontend commerce |
| Status | ✅ Closed — M0–M7 selesai; E2E Sprint 6 38/38 PASS + regression Sprint 5 25/25 PASS; Audit PASS 25/0/0; v1.5.0 kandidat menunggu tag |
| Release | v1.5.0 — The Launch & Commerce Foundation (kandidat) |
| Referensi | `.docs/sprint-6.md`, `.docs/e2e/sprint-6-verification.md`, `.docs/audit/LAPORAN-AUDIT-SPRINT-6.html`, `.docs/releases/v1.5.0-launch-commerce-foundation.md` |

### Lingkup Sprint 6 (Disetujui)

- Pricing & packages — migrasi `0007`, `package-service.js`, `GET /api/packages` (+ `:id`), seed placeholder
- Order foundation — migrasi `0008_orders.sql`, `order-service.js`, `POST/GET /api/orders` + `GET /:id` + `POST /:id/cancel`; amount server-side, idempotency, ownership, rate limit 10/mnt
- Payment boundary — migrasi `0009_payments.sql`, adapter registry + provider `manual`, `POST/GET /api/orders/:id/payment`; paid hanya dari backend
- Invitation lifecycle — migrasi `0010_invitation_lifecycle.sql` (status + package_id + trigger), `GET/PATCH /api/invitations/:id/status`
- Builder readiness — badge status lifecycle
- Frontend commerce — pricing dinamis, `pages/checkout.html` + `checkout.js`, login redirect `?next=`
- E2E Sprint 6 + regression + docs + audit + release

### Keputusan Bisnis Terbuka (Sprint 6)

- Harga final per paket — placeholder (`BUSINESS DECISION REQUIRED`)
- Provider pembayaran — `PAYMENT PROVIDER DECISION REQUIRED`; verifikasi manual admin menunggu keputusan
- Lifecycle `expired` undangan — belum terverifikasi requirement
- Instance produksi :3000 perlu redeploy (elevated; belum memuat route Sprint 6) — perlu `taskkill /F /PID 7000` manual lalu restart

## Hasil Sprint 6 (Development)

- ✅ Migrasi `0007` (packages + package_features + seed 4 paket), `0008` (orders), `0009` (payments), `0010` (invitation lifecycle + trigger sync)
- ✅ Pricing API — `GET /api/packages` (+ `/:id`) publik, aktif, urut sortOrder, fitur ter-sertakan
- ✅ Order — `POST/GET /api/orders` + `GET /:id` + `POST /:id/cancel`; amount server-side, `order_number`, idempotency UNIQUE, ownership 404, rate limit 10/mnt
- ✅ Payment boundary — adapter registry + provider `manual`; `POST/GET /api/orders/:id/payment`; `succeeded` hanya dari backend; rate limit 5/mnt
- ✅ Invitation lifecycle — `status` (draft/preview/published/unpublished) sinkron `is_published` via service + trigger; `GET/PATCH /api/invitations/:id/status` (409 INVALID_TRANSITION); API legacy kompatibel
- ✅ Frontend commerce — pricing dinamis (`landing-pricing.js`), `pages/checkout.html` + `checkout.js`, route `/checkout`, login redirect `?next=`, badge status builder
- ✅ Verifikasi E2E **38/38 PASS** + regression Sprint 5 **25/25 PASS** — 0 bug aplikasi (`.docs/e2e/sprint-6-verification.md`)
- ✅ Audit Sprint 6 PASS — 25 PASS · 0 WARNING · 0 ERROR (`.docs/audit/LAPORAN-AUDIT-SPRINT-6.html`)
- ✅ Pembersihan data test historis — 7 undangan `e2e-*@test.local` dihapus (13 user asli, 6 undangan)
- ✅ Release v1.5.0 kandidat — release doc + `package.json` v1.5.0; menunggu approval tag & redeploy :3000

## Sprint Sebelumnya (Closed)

| Item | Detail |
| --- | --- |
| Sprint | Sprint 5 — The Admin & Account Security |
| Tujuan | Dasbor admin (role management + moderasi) + lupa/reset password (SMTP + token) + verifikasi E2E |
| Status | ✅ Closed |
| Release | v1.4.0 — The Admin & Account Security Release |
| Referensi | `.docs/sprint-5.md` |

## Sprint Sebelumnya (Closed)

| Item | Detail |
| --- | --- |
| Sprint | Sprint 4 — The Guest Experience |
| Tujuan | Manajemen tamu + amplop digital (transfer info), hardening audit LOW, verifikasi PostgreSQL & E2E |
| Status | ✅ Closed |
| Release | v1.3.0 — The Guest Experience Release |
| Referensi | `.docs/sprint-4.md` |

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

## Lingkup Sprint 4 (Disetujui)

- Manajemen tamu — tabel `guests` + API CRUD + statistik (owner-scoped)
- Amplop digital — tabel `gift_accounts` + API owner & publik (transfer info saja; wishlist/gift item 🟡 ditunda)
- UI Builder: tampilan "Kelola" per undangan (statistik, tambah tunggal/bulk, filter, kelola rekening)
- Halaman publik: section Amplop Digital dengan tombol salin
- Hardening audit LOW — validasi hex tema, token `--color-overlay-*`, rate limiting, util bersama, dokumentasi JWT
- Install PostgreSQL di mesin pengembangan + verifikasi E2E penuh (AC7)

## Hasil Sprint 4

- ✅ Migrasi `0004_guests_gift_accounts.sql` — tabel `guests` (status diundang/hadir/tidak-hadir) + `gift_accounts` (bank/account, is_active, sort_order)
- ✅ Guest API — `GET/POST /api/invitations/:id/guests`, `GET .../guests/stats`, `GET/PATCH/DELETE /api/guests/:guestId`
- ✅ Gift-account API — owner `GET/POST /api/invitations/:id/gift-accounts`, `PATCH/DELETE /api/gift-accounts/:giftAccountId`; publik `GET /api/invitations/public/:slug/gift-accounts`
- ✅ Builder UI "Kelola" — statistik tamu, tambah tunggal/bulk, filter status, kelola rekening (tambah/toggle/hapus)
- ✅ Halaman publik — section Amplop Digital + tombol salin (fallback demo saat API tidak tersedia)
- ✅ Hardening LOW — `validateThemeColors`, `--color-overlay-*`, `server/middleware/rate-limit.js`, `assets/js/util.js`, dokumentasi JWT dev secret
- ✅ PostgreSQL terpasang (18.4) + migrasi 0001–0004 sukses (8 tabel) — verifikasi E2E penuh **21/21 PASS** terekam (`.docs/e2e/sprint-4-verification.md`); temuan MEDIUM AC7 tertutup
- ✅ 2 bug E2E diperbaiki — 23502 default `isActive`/`sortOrder` & publik 401 (route publik sebelum `use(requireAuth)` + `requireAuth` per-route); diverifikasi ulang
- ✅ Health check di repo — `scripts/health-check.mjs` + `npm run test:health`
- ✅ Audit PASS — 24 PASS · 1 WARNING (resolved) · 0 ERROR (`.docs/audit/LAPORAN-AUDIT-SPRINT-4.html`)
- ✅ Release v1.3.0 — The Guest Experience Release (tag `v1.3.0`) — **Sprint 4 closed**

## Lingkup Sprint 5 (Disetujui)

- Dasbor admin — middleware `requireAdmin`, service `admin-service.js`, API `/api/admin/*` (stats, users + role/detail, invitations + unpublish, guestbook + hapus), UI `pages/admin.html` + `assets/js/admin.js`
- Script promote — `npm run admin:promote -- <email>` (`scripts/make-admin.mjs`)
- Lupa & reset password — migrasi 0005 & 0006, `password-reset-service.js` + `email-service.js` (SMTP/dev-log), `POST /api/auth/forgot-password` & `POST /api/auth/reset-password`, UI "Lupa password?" di login
- Verifikasi E2E fitur baru — `scripts/e2e-sprint5.mjs` + rekaman `.docs/e2e/sprint-5-verification.md`

## Hasil Sprint 5 (Development)

- ✅ Migrasi `0005_password_reset_tokens.sql` (token hash SHA-256, sekali pakai, kedaluwarsa 24 jam) + `0006` (fix `updated_at` trigger)
- ✅ API admin — stats, users (+ search/role/page, detail + counts, role guard), invitations (unpublish), guestbook (list + hapus); `requireAdmin` cek role ke DB per-request
- ✅ Reset password — anti-enumerasi (respons generik), token valid/kedaluwarsa/pakai-ulang/tidak dikenal tertangani, revoke refresh token saat reset
- ✅ Email service — nodemailer; dev-log `[mail:dev]` + Reset URL bila `SMTP_HOST` kosong
- ✅ UI login — form "Lupa password?" + `/login?reset=<token>` set password baru
- ✅ Verifikasi E2E **25/25 PASS** — 0 bug aplikasi; rate limiting (auth 10/mnt) terkonfirmasi (`.docs/e2e/sprint-5-verification.md`)
- ✅ Audit Sprint 5 PASS — 24 PASS · 1 WARNING (resolved) · 0 ERROR (`.docs/audit/LAPORAN-AUDIT-SPRINT-5.html`); perbaikan: limiter ganda reset-password & warning SMTP production, diverifikasi ulang 25/25
- ✅ Release v1.4.0 — The Admin & Account Security Release (tag `v1.4.0`) — **Sprint 5 closed**

## Aturan Sprint

1. Pekerjaan baru masuk lingkup sprint harus disetujui terlebih dahulu.
2. Item yang belum selesai dicatat dengan jelas statusnya (🟡 Belum / 🟠 Proses / ✅ Selesai).
3. Setiap akhir sprint: review hasil, tulis changelog di `.docs/changelog.md`.

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.7.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Closed | Sprint 6 closed — E2E 38/38 + regression 25/25, Audit PASS 25/0/0, v1.5.0 kandidat dibuat; menunggu approval tag & redeploy :3000 |
| 1.4.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 5 Development — dasbor admin & keamanan akun (reset password), E2E 25/25 PASS; menunggu audit & release |
| 1.3.0 | 11-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Closed | Sprint 4 closed — Audit PASS + Release v1.3.0 The Guest Experience (tag v1.3.0) |
| 1.2.0 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 4 dimulai — Manajemen tamu + amplop digital + hardening LOW (Development) |
| 1.1.0 | 10-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Closed | Sprint 3 closed — Audit PASS + Release v1.2.0 The Core Features (tag v1.2.0) |
| 1.0.9 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 Development selesai (auth, template, invitation API, halaman publik, RSVP & buku tamu, galeri) — Review/Documentation |
| 1.0.8 | 09-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 dimulai — Planning (Auth + Builder + Template) |
| 1.0.7 | 05-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Closed | Sprint 2 closed — Audit PASS + Release v1.1.0 The First Experience (tag v1.1.0) |
| 1.0.6 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 2 — Development selesai (9 section + interaksi + aset); Review & Documentation |
| 1.0.4 | 04-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Sprint 1 closed — Release v1.0.0 The Foundation Release |
| 1.0.2 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Tambah base.css pada item base stylesheet (selesai) |
| 1.0.1 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Sinkronkan status item sprint (reset & komponen dasar selesai) |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Status Sprint 1 |
