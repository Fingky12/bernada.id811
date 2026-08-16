<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Verifikasi E2E Sprint 6 · Category : Catatan
  Version  : 1.0.0 · Status : ✅ Verified · Update : 16-08-2026
-->

# Verifikasi E2E — Sprint 6 (The Launch & Commerce Foundation)

> Verifikasi end-to-end fitur baru Sprint 6: **pricing & packages**, **order** (amount server-side, idempotency, ownership), **payment boundary** (provider manual), **invitation lifecycle** (draft/preview/published/unpublished), plus regression (auth, templates, guestbook, gift accounts, admin). Seluruhnya diuji terhadap PostgreSQL lokal.

---

## Lingkungan

| Item | Nilai |
| --- | --- |
| Tanggal | 16-08-2026 |
| OS | Windows (PowerShell 5.1) |
| PostgreSQL | lokal `localhost:5432`, role `bernada`, DB `bernada` |
| Node.js | ≥ 22 (ESM) |
| Server uji | instance sementara `http://localhost:3004` (kode terbaru Sprint 6, `database=connected`) — port 3000 tetap instance produksi lama (tanpa route Sprint 6; tidak diganggu) |
| Database | migrasi 0001–0010 applied (packages, package_features, orders, payments, invitation lifecycle) |

## Skrip

- `scripts/e2e-sprint6.mjs` — verifikasi otomatis; jalankan dengan `PORT=3004 node --env-file-if-exists=.env scripts/e2e-sprint6.mjs`.
  - Self-healing terhadap rate limit in-memory (menunggu 61 detik lalu retry sekali saat `429`).
  - Data test unik (suffix timestamp + email `@e2e-bernada.local`), dibersihkan di akhir (hapus payments dulu karena FK `ON DELETE RESTRICT`, lalu users — cascade orders/invitations).

## Hasil 38/38 PASS

| # | Langkah | Status |
| --- | --- | --- |
| 1 | `GET /api/health` — `status=ok`, `database=connected` | ✅ PASS |
| 2 | `GET /api/packages` — 4 paket aktif (`free,basic,premium,exclusive`), urut `sortOrder`, fitur ter-sertakan | ✅ PASS |
| 3 | `GET /api/packages/:id` — detail `premium` (price `99000`, fitur ≥ 1) | ✅ PASS |
| 4 | `GET /api/packages/:id` (invalid → 404 `NOT_FOUND`) | ✅ PASS |
| 5 | Regression `GET /api/templates` (6 template) | ✅ PASS |
| 6 | Register buyer (user A) | ✅ PASS |
| 7 | `POST /api/orders` premium → 201 `pending`, `amount=99000` (server), format `ORD-YYYYMMDD-XXXX` | ✅ PASS |
| 8 | `POST /api/orders` duplicate idempotency → `created:false`, id sama | ✅ PASS |
| 9 | `POST /api/orders` amount tampering diabaikan; paket free → auto-paid (`amount=0`, `status=paid`) | ✅ PASS |
| 10 | `POST /api/orders` paket invalid → 404 | ✅ PASS |
| 11 | `POST /api/orders` unauthenticated → 401 | ✅ PASS |
| 12 | `GET /api/orders` — list milik user (2 order) | ✅ PASS |
| 13 | `GET /api/orders/:id` — detail | ✅ PASS |
| 14 | `GET /api/orders/:id` order milik orang lain → 404 (ownership) | ✅ PASS |
| 15 | `POST /api/orders/:id/payment` → 201, provider `manual`, `pending`, ref `MANUAL-ORD-…` | ✅ PASS |
| 16 | Setelah payment → order `awaiting_payment` | ✅ PASS |
| 17 | `POST payment` duplicate → `created:false`, id sama | ✅ PASS |
| 18 | `GET /api/orders/:id/payment` — detail (amount 99000) | ✅ PASS |
| 19 | `POST payment` order free (auto-paid) → 409 `ALREADY_PAID` | ✅ PASS |
| 20 | `GET payment` (belum ada) → `null` | ✅ PASS |
| 21 | `POST /api/orders/:id/cancel` → `cancelled` | ✅ PASS |
| 22 | `POST cancel` ulang → 409 `ORDER_STATUS_CONFLICT` | ✅ PASS |
| 23 | `POST /api/invitations` baru → `status=draft`, `packageId=null`, `isPublished=false` | ✅ PASS |
| 24 | `GET /api/invitations/:id/status` → draft | ✅ PASS |
| 25 | `PATCH status` draft → preview → published (is_published ikut tersinkron) | ✅ PASS |
| 26 | Publik `GET /api/invitations/public/:slug` → 200 saat published | ✅ PASS |
| 27 | `PATCH status` published → unpublished → publik 404 | ✅ PASS |
| 28 | `PATCH status` unpublished → draft (sah) | ✅ PASS |
| 29 | `PATCH status` draft → published langsung (sah) | ✅ PASS |
| 30 | `PATCH status` published → preview → 409 `INVALID_TRANSITION` | ✅ PASS |
| 31 | `PATCH status` tidak dikenal → 400 `VALIDATION_ERROR` | ✅ PASS |
| 32 | `POST /api/invitations/:id/publish` (legacy) → `status=published` | ✅ PASS |
| 33 | Regression: guestbook publik + gift accounts publik | ✅ PASS |
| 34 | `GET /api/invitations` — DTO berisi `status` & `packageId` | ✅ PASS |
| 35 | Admin unpublish → `isPublished=false` + status owner `unpublished` (sinkronisasi trigger) | ✅ PASS |
| 36 | Regression `GET /api/admin/stats` (admin → 200) | ✅ PASS |
| 37 | Rate limit `POST /api/orders` (burst 11 → ≥ 1 × 429) | ✅ PASS |
| 38 | Rate limit `POST /api/orders/:id/payment` (burst 6 → ≥ 1 × 429) | ✅ PASS |

## Regression Sprint 5 (25/25 PASS)

- Di-`PORT=3004` (kode terbaru) — `scripts/e2e-sprint5.mjs` **25/25 PASS**: reset password (valid/expired/reuse/unknown/anti-enumerasi) & admin (403 non-admin, promote, stats/users/invitations/guestbook, unpublish, delete, guard role sendiri & admin terakhir).

## Temuan

- **0 bug aplikasi.** Seluruh acceptance criteria Sprint 6 terverifikasi end-to-end.
- **Amount tidak bisa dimanipulasi** — body `amount`/`price` diabaikan; nilai selalu dari `packages.price_amount` (server). Paket `priceAmount=0` auto-paid (`paid` + `paid_at`).
- **Payment `succeeded` tidak bisa dipalsukan frontend** — boundary manual hanya membuat `pending`; status `succeeded` hanya dari backend (verifikasi manual admin — menunggu keputusan `PAYMENT PROVIDER DECISION REQUIRED`).
- **Idempotency & ownership terverifikasi** — duplicate submission `created:false`; order orang lain → 404 (bukan 403).
- **Rate limit baru bekerja** — `POST /api/orders` 10/mnt & `POST /api/orders/:id/payment` 5/mnt (fingerprint `ip:method:path`).
- **Sinkronisasi lifecycle** — `PATCH status` & endpoint legacy `publish`/`unpublish` konsisten (is_published ↔ status) termasuk lewat jalur admin (trigger DB).

## Catatan Operasional

- **Port 3000 (instance produksi, PID 7000) belum memuat route Sprint 6** (`/api/packages`, `/api/orders`, `/api/payments` → 404). Diperlukan redeploy/restart sebelum Go-Live; tidak dilakukan dalam sesi ini untuk menghormati aturan operasional (jangan menghentikan layanan tanpa diagnosis & persetujuan).
- **Sisa data test historis**: 7 undangan `e2e-*@test.local` (artefak E2E sprint sebelumnya) masih ada di DB. Tidak dihapus tanpa persetujuan — menunggu keputusan Owner untuk pembersihan.

## Kesimpulan

- Acceptance Criteria Sprint 6 terverifikasi: **38/38 PASS** (E2E Sprint 6) + **25/25 PASS** (regression Sprint 5).
- Script `scripts/e2e-sprint6.mjs` dapat dipakai ulang sebagai regression check.
