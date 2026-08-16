<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Sprint 7 · Fase 2–4 Verification · Category : Catatan
  Version  : 1.1.0 · Status : ✅ PASS · Update : 16-08-2026
-->

# Sprint 7 — Verifikasi E2E Fase 2, Fase 3 & Fase 4

> Rekaman hasil verifikasi Sprint 7 (Security & Commerce Hardening) pada instance API baru (kode Fase 2 + Fase 3 + Fase 4) di port `3004` (PID berubah per run), migrasi s.d. `0011` applied, DB sehat.

## Lingkungan Verifikasi

| Item | Nilai |
| --- | --- |
| Kode | Fase 2 (F2-01..F2-06) + Fase 3 (admin verify + entitlement) + Fase 4 (F2-08 order expiry) |
| Port test | `3004` (fresh instance per skrip — reset limiter in-memory) |
| Migrasi | `0001`–`0011` (0011 = partial unique index pending payment) |
| DB | `bernada` · PostgreSQL · `database=connected` |
| Verifikasi akhir | DB bersih: `leftover users=0, orders=0, payments=0` · produksi :3000/:3001/:3002 healthy |

## Hasil Fase 2 — `scripts/test-f2-hardening.mjs` · 21/21 PASS

| # | Langkah | Status |
| --- | --- | --- |
| 1 | Health check DB connected | ✅ PASS |
| 2 | F2-01 sign/verify round-trip HS256 (kompatibel) | ✅ PASS |
| 3 | F2-01 token `alg:none` ditolak | ✅ PASS |
| 4 | F2-01 token `alg:RS256` (RSA nyata) ditolak | ✅ PASS |
| 5 | F2-02 refresh konkuren (token sama) → tepat satu 200 + satu 401 | ✅ PASS |
| 6 | F2-02 hanya satu token baru yang hidup dari satu token lama (unrevoked=0) | ✅ PASS |
| 7 | F2-03 refresh normal → rotasi token baru | ✅ PASS |
| 8 | F2-03 replay token bekas → 401 | ✅ PASS |
| 9 | F2-03 family dicabut (token baru ikut revoked) | ✅ PASS |
| 10 | F2-03 refresh dgn token family revoked → 401 | ✅ PASS |
| 11 | F2-03 sesi user lain tidak terganggu | ✅ PASS |
| 12 | F2-04 create slug sama konkuren → 201 + 409 `SLUG_TAKEN` | ✅ PASS |
| 13 | F2-04 hanya satu undangan tersimpan | ✅ PASS |
| 14 | F2-05 idempotencyKey sama konkuren → satu 201 + satu 200 (order sama) | ✅ PASS |
| 15 | F2-05 format `order_number` tetap `ORD-YYYYMMDD-XXXX` | ✅ PASS |
| 16 | F2-05 hanya satu order tersimpan | ✅ PASS |
| 17 | F2-06 payment konkuren → satu 201 + satu 200 (payment sama) | ✅ PASS |
| 18 | F2-06 hanya satu payment pending per order | ✅ PASS |
| 19 | F2-06 order menjadi `awaiting_payment` | ✅ PASS |
| 20 | sanity login + `/auth/me` (auth regression) | ✅ PASS |
| 21 | sanity `/api/templates` (regression) | ✅ PASS |

## Hasil Fase 3 — `scripts/e2e-sprint7-payment.mjs` · 15/15 PASS

| # | Langkah | Status |
| --- | --- | --- |
| 1 | Health check DB connected | ✅ PASS |
| 2 | Register buyer | ✅ PASS |
| 3 | Create invitation (draft, `packageId` null) | ✅ PASS |
| 4 | Order premium + invitation → `pending`, `invitationId` tersimpan | ✅ PASS |
| 5 | Payment manual → `pending`, order `awaiting_payment` | ✅ PASS |
| 6 | Verify tanpa token → 401 | ✅ PASS |
| 7 | Verify non-admin → 403 `FORBIDDEN` | ✅ PASS |
| 8 | Admin verify → payment `succeeded` + order `paid` (atomik) | ✅ PASS |
| 9 | F2-07 entitlement → invitation `packageId` = premium (status tetap) | ✅ PASS |
| 10 | Verify ulang → 409 `PAYMENT_STATUS_CONFLICT` | ✅ PASS |
| 11 | Verify payment tak ada → 404 | ✅ PASS |
| 12 | F2-07 free auto-paid → invitation `packageId` = free (tanpa admin) | ✅ PASS |
| 13 | `GET /api/admin/payments` (list + filter status) | ✅ PASS |
| 14 | Regression: order paid → payment 409 `ALREADY_PAID` | ✅ PASS |
| 15 | Regression: `GET /api/admin/stats` (admin → 200) | ✅ PASS |

## Regression Sprint 6 — `scripts/e2e-sprint6.mjs` · 38/38 PASS

Diulang pada instance segar (reset limiter): **38/38 PASS** — pricing, order (server-side amount, idempotency, ownership 404, rate limit 429), payment state, invitation lifecycle, guestbook/gift publik, admin stats, legacy publish. **Tanpa regresi.**

## Hasil Fase 4 — `scripts/e2e-sprint7-expiry.mjs` · 15/15 PASS

| # | Langkah | Status |
| --- | --- | --- |
| 1 | Health check DB connected | ✅ PASS |
| 2 | F2-08 order dibuat → `pending` + `expires_at` masa depan (konsisten) | ✅ PASS |
| 3 | F2-08 payment → `awaiting_payment`, `expires_at` tidak berubah | ✅ PASS |
| 4 | Boundary: order belum expired → admin verify 200 `paid` (tidak premature) | ✅ PASS |
| 5 | F2-08 `awaiting_payment` kedaluwarsa → GET order `expired` (lazy) | ✅ PASS |
| 6 | F2-08 payment pending order expired → `expired` | ✅ PASS |
| 7 | F2-08 expired order → POST payment 409 `ORDER_STATUS_CONFLICT` | ✅ PASS |
| 8 | F2-08 expired order → cancel 409 `ORDER_STATUS_CONFLICT` | ✅ PASS |
| 9 | F2-08 expired order → admin verify 409 (payment sudah `expired`) | ✅ PASS |
| 10 | F2-08 verify deteksi expiry in-transaction → 409 + order/payment jadi `expired` | ✅ PASS |
| 11 | F2-08 order `pending` (tanpa payment) kedaluwarsa → `expired` | ✅ PASS |
| 12 | F2-08 order `paid` TIDAK ter-expriy (tetap `paid`) | ✅ PASS |
| 13 | F2-08 order `cancelled` TIDAK ter-expriy (tetap `cancelled`) | ✅ PASS |
| 14 | F2-08 GET /api/admin/payments → `order_status=expired` tampil (sweep) | ✅ PASS |
| 15 | (extra) register admin + promote + login — pasokan token untuk test 4/9/10/14 | ✅ PASS |

## Full Regression Fase 4 (instance terisolasi)

| Skrip | Hasil |
| --- | --- |
| `test-f2-hardening.mjs` (Fase 2) | ✅ 21/21 PASS |
| `e2e-sprint7-payment.mjs` (Fase 3) | ✅ 15/15 PASS |
| `e2e-sprint6.mjs` (Sprint 6) | ✅ 38/38 PASS |
| Health + DB | ✅ `database=connected` |
| DB bersih (users/orders/payments test) | ✅ 0/0/0 |

## Catatan Operasional (terverifikasi)

- Limiter rate-limit **in-memory bersama antar-skrip**: saat `test-f2-hardening` + `e2e-sprint7-payment` + `e2e-sprint6` dijalankan beruntun pada instance yang sama dalam window 60s, bucket `POST /api/auth/register` (max 10/mnt) terakumulasi (3+5+3) → register admin E2E kena 429 dan skrip gagal dengan `Cannot read properties of undefined (reading 'id')`. **Solusi:** jalankan skrip E2E terhadap instance server segar (restart → reset bucket) bila beruntun; tidak ada regresi produk (pada instance segar 38/38 PASS).
- **F2-08 order expiry** (lazy + deterministik, tanpa background worker): `expires_at` di-set saat order berbayar dibuat (default 24 jam); transisi `pending/awaiting_payment → expired` saat diakses (`expireOrderIfDue`) atau saat list (`expireOverdueOrders`); guard anti-race via `FOR UPDATE` di `createOrderPayment` dan pemeriksaan `expires_at` in-transaction di `verifyManualPayment` (persist commit-before-throw). Order terminal tidak pernah ter-expriy. Detail: `.docs/changelog.md`.
- Data test dibersihkan tiap skrip (payment dulu, lalu users) — verifikasi akhir: `leftover users=0, orders=0, payments=0`.
- Instance produksi :3000/:3001/:3002 tidak tersentuh dan tetap healthy selama verifikasi.
