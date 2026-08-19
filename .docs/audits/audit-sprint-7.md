# Audit Sprint 7 — Security & Commerce Hardening

| Item | Detail |
|------|--------|
| Tanggal | 19-08-2026 |
| Sprint | 7 — Security & Commerce Hardening |
| Methodology | Source code verification — setiap item diperiksa langsung dari file yang ada |
| Hasil | 10/10 PASS · 0 TODO/FIXME/HACK |

---

## F2-01 JWT Algorithm Hardening — PASS

**File:** `server/lib/jwt.js`
- Line 6: `algorithm: 'HS256'` eksplisit di `signAccessToken`
- Line 12: `algorithms: ['HS256']` eksplisit di `verifyAccessToken`

Sign dan verify keduanya membatasi HS256. Token `alg:none` / `RS256` ditolak.

---

## F2-02 Refresh Token Race — PASS

**File:** `server/services/auth-service.js`
- Line 106–132: `refresh()` mengambil pool client, memulai transaksi
- Line 110–112: Claim atomik — `UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL RETURNING id`
- Line 114: `rowCount === 0` → token sudah diklaim, revoke family

Dua refresh konkuren hanya menghasilkan satu token hidup.

---

## F2-03 Refresh Token Reuse Detection — PASS

**File:** `server/services/auth-service.js`
- Line 93–100: Jika `record.revoked_at` truthy (token sudah dipakai), revoke semua token aktif user
- Line 114–121: Jika atomic claim kalah, revoke family

Dua jalur deteksi reuse: replay token + claim race.

---

## F2-04 Invitation Slug Race — PASS

**File:** `server/services/invitation-service.js`
- Line 40–48: `assertUniqueSlug()` — pre-check SELECT sebelum INSERT
- Line 89–91 (create): catch `error.code === '23505'` + `invitations_slug_key` → `SLUG_TAKEN`
- Line 163–165 (update): catch 23505 yang sama untuk UPDATE

Dua lapis proteksi: optimis + DB constraint catch, di create dan update.

---

## F2-05 Order Idempotency Race — PASS

**File:** `server/services/order-service.js`
- Line 177–233: Retry loop dengan `SAVEPOINT order_insert`
- Line 209–227: 23505 `orders_idempotency_key_key` → ROLLBACK TO SAVEPOINT, re-read existing, return
- Line 228–230: 23505 `orders_order_number_key` → retry (max 5)
- Line 151–158: Early idempotency check sebelum transaksi

SAVEPOINT + pembedaan constraint idempotency vs order_number.

---

## F2-06 Duplicate Pending Payment — PASS

**Migration:** `database/migrations/0011_payments_unique_pending_order.sql`
- Partial unique index: `CREATE UNIQUE INDEX idx_payments_unique_pending_order ON payments (order_id) WHERE status = 'pending'`

**File:** `server/services/payment-service.js`
- Line 116–131: INSERT dengan `ON CONFLICT (order_id) WHERE status = 'pending' DO NOTHING RETURNING ...`
- Line 133–148: Jika `rows.length === 0` → re-read pemenang

DB constraint + ON CONFLICT DO NOTHING.

---

## F2-07 Entitlement package_id — PASS

**File:** `server/services/order-service.js`
- Line 200–205: Saat order `paid` + `invitation_id` ada → `UPDATE invitations SET package_id = $1 WHERE id = $2`

**File:** `server/services/payment-service.js`
- Line 364–377: Admin verify → payment succeeded + order paid → set `package_id` pada invitation

Jalur auto-paid (free) dan admin verify keduanya mengatur entitlement.

---

## F2-08 Order Expiry — PASS

**File:** `server/config.js`
- Line 70: `orderPaymentExpiryHours: Number.parseInt(getEnv('ORDER_PAYMENT_EXPIRY_HOURS', '24'), 10)`

**File:** `server/services/order-service.js`
- Line 72–88: `expireOrderRows()` — transisi order + payment → expired
- Line 90–94: `isDueForExpiry()` — cek status + `expires_at <= now`
- Line 98–117: `expireOrderIfDue(orderId)` — lazy expiry (dipanggil di `getOrderById`)
- Line 121–146: `expireOverdueOrders()` — sweep (dipanggil di `listOrders` + `listPayments`)
- Line 170–172: `expiresAt` dihitung saat order dibuat

**File:** `server/services/payment-service.js`
- Line 313–337: `verifyManualPayment` mengecek expiry dalam transaksi

Tanpa background worker — deterministic lazy + sweep-on-access.

---

## Admin Verify Payment API — PASS

**File:** `api/routes/admin.js`
- Line 26–28: `adminLimiter` rate limit 60/mnt
- Line 29: `adminRouter.use(requireAdmin)` — semua route behind admin auth
- Line 98–108: `GET /payments` — paginated list + status filter + search
- Line 110–117: `POST /payments/:id/verify` — atomic verify via `paymentService.verifyManualPayment()`

---

## E2E Tests — PASS

File berikut ada dan diverifikasi:
- `scripts/e2e-sprint7-payment.mjs`
- `scripts/e2e-sprint7-expiry.mjs`
- `scripts/test-f2-hardening.mjs`

Hasil E2E (dari dokumentasi): F2 21/21, Fase 3 15/15, F2-08 15/15, Regression Sprint 6 38/38.

---

## DB Schema (Migrasi 0007–0012) — PASS

| Migrasi | Isi |
|---------|-----|
| 0007 | `packages` + `package_features` + seed 4 paket |
| 0008 | `orders` (order_number, amount, status enum, idempotency_key, expires_at, paid_at) |
| 0009 | `payments` (provider, status, amount, metadata JSONB, paid_at) |
| 0010 | `invitations.status` + `invitations.package_id` + trigger sync |
| 0011 | Partial unique index pending payment per order |
| 0012 | `audit_logs` (actor, action, payment/order snapshots) |

---

## Security — PASS

- JWT: HS256 pinning (sign + verify)
- Refresh token: atomic claim + reuse detection + family revoke
- Admin routes: `requireAdmin` middleware (role check dari DB)
- Rate limiting: admin 60/mnt, auth 10/mnt
- Invitation slug: DB constraint sebagai sumber kebenaran
- Order: server-side amount, idempotency key, ownership check
- Payment: `ON CONFLICT DO NOTHING`, expiry guard

---

## TODO/FIXME/HACK

**0 ditemukan** di seluruh file Sprint 7.

---

## Kesimpulan

| Item | Hasil |
|------|-------|
| F2-01..F2-08 | 8/8 PASS |
| Admin verify API | PASS |
| E2E tests | Ada + hasil terdokumentasi |
| DB schema | 6 migrasi lengkap |
| Security | Memenuhi best practice |
| Code quality | 0 TODO/FIXME/HACK |
| **Overall** | **PASS** |
