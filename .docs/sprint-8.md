<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Sprint 8 · Category : Panduan (source of truth)
  Version  : 0.3.0 · Status : ✅ Closed · Update : 19-08-2026
-->

# Sprint 8 — Admin Payment UI + Pricing Tier Refactor

> Dokumen sprint resmi. Menghubungkan backend admin payment (Sprint 7) dengan frontend admin panel.

---

## Info Sprint

| Item | Detail |
| --- | --- |
| Sprint | Sprint 8 — Admin Payment UI |
| Tujuan | Menghubungkan tab Pembayaran di admin panel dengan backend payment service yang sudah ada |
| Status | ✅ Closed — Audit 12/12 PASS, 0 TODO/FIXME/HACK |
| Baseline | Sprint 7 Closed (v1.5.1) · Backend admin payment API sudah berfungsi |

---

## A. Sprint Goal

Membuat tab **Pembayaran** di admin panel berfungsi penuh: menampilkan daftar pembayaran dengan filter/search/pagination, detail pembayaran dalam modal, dan alur verifikasi pembayaran manual dengan konfirmasi.

## B. Scope

### 8.1 Admin Payment List
- Tab "Pembayaran" aktif di admin panel
- Tabel pembayaran: Order, Pelanggan, Paket, Referensi, Status, Waktu, Aksi
- Filter by status (pending/succeeded/failed/expired)
- Search by email pelanggan
- Pagination

### 8.2 Payment Detail
- Modal detail pembayaran saat klik "Detail"
- Info: ID, Referensi, Provider, Status, Jumlah, Mata Uang, Waktu
- Info Order: Order Number, Status, Paket, Pelanggan
- Metadata (bila ada)

### 8.3 Verify Payment + Confirmation Modal
- Tombol "Verifikasi" hanya muncul untuk status `pending`
- Modal konfirmasi sebelum verify
- Setelah verify: payment → succeeded, order → paid
- Toast sukses/error

### 8.4 Admin Authorization/Security Regression
- Semua endpoint payment admin dilindungi `requireAdmin` middleware
- Non-admin tidak bisa mengakses tab atau data payment
- E2E regression tetap PASS

## C. Implementation

### Files Changed

| File | Change |
|------|--------|
| `assets/js/admin.js` | Tambah payments tab binding, state, loadPayments, renderPayments, modal detail/verify handlers, stat pending payments click |
| `assets/css/admin.css` | Tambah modal CSS (overlay, panel, head, body, foot, close, title), stat-card-action, payment detail inner styles |
| `.docs/sprint-8.md` | Dokumentasi sprint ini |

### What Was Already Built (Backend — Sprint 6 & 7)
- `GET /api/admin/payments` — list with status/search filter + pagination
- `POST /api/admin/payments/:id/verify` — atomic verify (payment succeeded + order paid + entitlement)
- `requireAdmin` middleware
- `payment-service.js` — `listPayments()`, `verifyManualPayment()`
- `admin-service.js` — `getStats()` includes `pendingPayments`
- DB migrations 0008 (orders), 0009 (payments), 0011 (unique pending index)
- E2E tests: `e2e-sprint7-payment.mjs` (15/15), `e2e-sprint7-expiry.mjs` (15/15), `test-f2-hardening.mjs` (21/21), `e2e-sprint6.mjs` (38/38)

### What Was Already Built (Frontend HTML — Sprint 7)
- `admin.html`: Tab button `#tab-payments`, panel `#panel-payments` with table/search/filter/pagination
- `admin.html`: Modal `#payment-detail-modal` (overlay + panel + head + body)
- `admin.html`: Modal `#verify-confirm-modal` (overlay + panel + head + body + foot)
- `admin.html`: Stat card `#stat-pending-payments-card`
- `api.js`: `listAdminPayments()` and `verifyAdminPayment()` methods

### What Was Added (Sprint 8)
- `admin.js`: `'payments'` in TAB_KEYS, elements/payments + modal elements
- `admin.js`: `state.payments` (search, status, page, pageSize, total, list)
- `admin.js`: `renderPayments()` with status badge, detail/verify buttons
- `admin.js`: `loadPayments()` via `api.listAdminPayments()`
- `admin.js`: `openPaymentDetail()` / `closePaymentDetailModal()` — renders payment + order info + metadata
- `admin.js`: `openVerifyConfirm()` / `closeVerifyConfirmModal()` / `confirmVerifyPayment()` — confirmation flow
- `admin.js`: `paymentStatusBadge()` — maps status to badge-success/warning/danger/neutral
- `admin.js`: Event bindings — search, filter, pagination, detail click, verify click, modal close, pending card click
- `admin.js`: `stat-pending-payments` rendered in `renderStats()`, card click → filters to pending + opens payments tab
- `admin.css`: Modal overlay/panel/head/body/foot/close/title styles using design tokens
- `admin.css`: `.stat-card-action` interactive styles
- `admin.css`: `.payment-detail-row/label/value/section/section-title` inner modal styles

## D. Verification (Admin Payment UI)

- `npm run test:health` → PASS
- Server started via `scripts/start-api.ps1` → HEALTH=OK, DB=CONNECTED
- JS syntax check: `node -c assets/js/admin.js` → clean
- No changes to backend, DB, or existing features

---

## E. Pricing Tier Refactor (19-08-2026)

Mengubah model 4-package (free/basic/premium/exclusive) menjadi 3-tier pricing (basic/premium/exclusive). Template mendapat kolom `tier` yang menentukan tier pricing-nya.

### Harga Final

| Tier | Harga | Code |
|------|-------|------|
| BASIC | Rp77.000 | basic |
| PREMIUM | Rp129.000 | premium |
| EKSCLUSIF | Rp279.000 | exclusive |

### Trust Chain (tetap dipertahankan)

```
packages.price_amount → orders.amount → payments.amount
```

Order lama tetap memakai price snapshot saat checkout. Perubahan harga tier hanya memengaruhi order baru.

### Template → Tier Mapping

| Template | Tier |
|----------|------|
| Klasik Minimal | basic |
| Diagonal Modern | basic |
| Merah Elegan | premium |
| Border Bunga | premium |
| Pita Emas | premium |
| Gold Mewah | exclusive |

### Files Changed

| File | Change |
|------|--------|
| `database/migrations/0013_pricing_tier_model.sql` | Tambah `tier` ke templates + packages; update harga; deactivate `free` package |
| `server/services/template-service.js` | Tambah `tier` ke DTO + query |
| `server/services/package-service.js` | Tambah `tier` ke DTO + columns |
| `server/services/order-service.js` | Tambah `tier` ke package info di DTO + queries |
| `server/services/payment-service.js` | Tambah `tier` ke package info di admin list query |
| `assets/js/landing-pricing.js` | Popular badge pakai `pkg.tier === 'premium'` |
| `assets/js/builder.js` | Tampilkan tier badge pada template selection |
| `assets/css/sections.css` | Update comment "Basic / Premium / Eksklusif" |
| `scripts/e2e-sprint6.mjs` | Update hardcoded 99000→129000; replace free→basic |
| `scripts/e2e-sprint7-payment.mjs` | Replace free auto-paid test → basic + admin verify |
| `scripts/e2e-sprint7-expiry.mjs` | Replace free auto-paid test → basic + admin verify |

### Testing

| E2E Script | Hasil |
|---|---|
| e2e-sprint6.mjs | 38/38 PASS |
| e2e-sprint7-payment.mjs | 15/15 PASS |
| e2e-sprint7-expiry.mjs | 15/15 PASS |
| test-f2-hardening.mjs | 21/21 PASS |
| e2e-sprint5.mjs | 25/25 PASS |
| **Total** | **114/114 PASS** |

### Data Safety

- Package `free` dinonaktifkan (`is_active = FALSE`), bukan dihapus — data order lama tetap aman
- `orders.amount` dan `payments.amount` tetap price snapshot — order lama tidak berubah
- Tidak ada destructive DB change — semua append-only via migrasi 0013
