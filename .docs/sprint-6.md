<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Sprint 6 · Category : Panduan (source of truth)
  Version  : 0.2.0 · Status : ✅ Approved & Active (M0–M5 selesai, M6 testing) · Update : 16-08-2026
-->

# Sprint 6 — The Launch & Commerce Foundation

> Dokumen sprint resmi (draft planning). Ringkasan untuk AI ada di `.ai/context/sprint.md`.
>
> Sprint ini mengikuti **Engineering Workflow** (`rules/10-engineering-workflow.md`) dan **Human Approval Gate** (approval Owner wajib sebelum development).

---

## Info Sprint

| Item | Detail |
| --- | --- |
| Sprint | Sprint 6 — The Launch & Commerce Foundation |
| Tujuan | Fondasi pricing/paket, order/checkout, boundary pembayaran, lifecycle undangan, kesiapan builder, UI commerce, production-readiness yang relevan |
| Status | ✅ Approved & Active (16-08-2026) — M0–M5 selesai; E2E Sprint 6 38/38 + regression Sprint 5 25/25 |
| Release | v1.5.0 — The Launch & Commerce Foundation (kandidat) |
| Baseline | Sprint 5 Closed (v1.4.0) · E2E Sprint 5 25/25 PASS (16-08-2026) · PostgreSQL 18.4 connected · migrasi 0001–0006 applied |

---

## A. Sprint Goal

Membangun **fondasi bisnis pra-launch**: paket & harga bersumber dari backend (source of truth), pembuatan order yang aman (amount ditentukan server), boundary pembayaran yang siap diikat provider mana pun, lifecycle undangan yang jelas (draft → preview → published → unpublished), serta UI commerce yang membaca data dari API — tanpa menentukan harga final sendiri.

## B. Business Objective

1. Platform dapat menunjukkan paket & harga secara konsisten (backend = source of truth; frontend tidak hardcode).
2. Pengguna dapat membuat order paket dengan aman (harga tidak bisa dimanipulasi dari frontend).
3. Status pembayaran hanya ditentukan backend (frontend tidak bisa memalsukan PAID).
4. Kesiapan arsitektur sehingga provider pembayaran (Midtrans/Xendit/Tripay/dll.) dapat ditambahkan tanpa membongkar sistem order.
5. Lifecycle undangan eksplisit dan aman (draft tidak publik, published bisa diakses slug, unpublished tidak publik, admin tetap bisa moderasi).

## C. Technical Objective

- Migrasi baru (append-only) untuk `packages`, `package_features`, `orders`, `payments` + lifecycle `invitations` (bila disetujui).
- Route → Validation → Service → Pool, konsisten dengan Sprint 3–5.
- `HttpError`, `validation.js`, middleware existing (`requireAuth`, `requireAdmin`, `rateLimit`).
- DTO mapping snake_case → camelCase.
- Frontend commerce memakai `assets/js/api.js` (tidak fetch tersebar), design token, loading/empty/error/success state.
- E2E Sprint 6 (`scripts/e2e-sprint6.mjs`) tanpa merusak regression Sprint 5.

## D. Scope

1. **Pricing & Package Foundation** — entity paket + fitur, active/inactive, sort order, harga placeholder yang ditandai `BUSINESS DECISION REQUIRED`.
2. **Order Foundation** — order dengan status eksplisit, order number, amount dari server, anti-duplicate (idempotency), owner-scoped.
3. **Payment Boundary** — tabel payment + adapter interface (tanpa integrasi provider fiktif), dokumentasi `PAYMENT PROVIDER DECISION REQUIRED`.
4. **Invitation Lifecycle** — audit status existing; tambah status eksplisit bila perlu; kompatibilitas API existing.
5. **Builder readiness** — tutup gap yang menghalangi flow: pilih template → isi data → simpan draft → preview → publish.
6. **Frontend commerce UX** — pricing (dari API), pilih paket, buat order, ringkasan checkout, status pembayaran, status undangan.
7. **Production-readiness relevan** — hanya yang blocker; sisanya dicatat sebagai technical debt.
8. **Testing & dokumentasi** — E2E Sprint 6 + regression + update docs + audit.

## E. Out of Scope

| Item | Alasan |
| --- | --- |
| Integrasi provider pembayaran nyata | Belum ada requirement/approval provider; Sprint 6 hanya boundary + adapter interface |
| Harga final bisnis | `BUSINESS DECISION REQUIRED` — pakai placeholder, backend tetap source of truth |
| Wishlist hadiah (`gift_items`) | Ditunda sejak Sprint 4; bukan blocker flow pembayaran |
| Notifikasi tamu (email/WA) | Fase 4 |
| Hardening produksi besar-besaran | Di luar cakupan Sprint 6 kecuali blocker; dicatat sebagai technical debt |
| Fitur dekoratif builder yang tidak menghalangi flow utama | Bukan prioritas |

## F. Architecture

```
Frontend (pages/*.html + assets/js/*.js → api.js)
   │  HTTP/JSON (same-origin, cookie httpOnly)
   ▼
Route (validasi) → Service (logika bisnis + query parameterized) → Pool (pg)
   │
   ▼
PostgreSQL (migrasi append-only, transaction per file)
```

- Pattern order/payment mengikuti pola service existing (mirip `invitation-service.js` / `guest-service.js`).
- **Payment boundary**: `server/services/payment/*` atau `payment-adapter.js` dengan interface `createPayment / verifyCallback / checkStatus`; provider di-daftarkan via registry. Tanpa provider → gunakan mode `manual`/`dev` yang dokumentasikan, dan TIDAK pernah menandai PAID dari request frontend.
- Backend = satu-satunya penentu `amount` (dibaca dari `packages.price_amount`).
- Idempotency: kolom `idempotency_key` unik di `orders` (nullable) → cegah duplicate submission.

## G. Database Changes

> Migrasi baru **append-only**, nomor urut setelah `0006`. Semua snake_case, PK `id` UUID, FK `<table>_id`, `created_at/updated_at` via trigger `set_updated_at()`.

### G1. `0007_commerce_packages.sql` — Paket & Fitur (usulan)

`packages`:

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | `gen_random_uuid()` |
| `code` | TEXT UNIQUE | `free` \| `basic` \| `premium` \| `exclusive` |
| `name` | TEXT | nama paket (FREE/BASIC/PREMIUM/EXCLUSIVE) |
| `description` | TEXT | deskripsi |
| `price_amount` | BIGINT | harga dalam rupiah utuh — **PLACEHOLDER**, `BUSINESS DECISION REQUIRED` |
| `currency` | TEXT | default `IDR` |
| `is_active` | BOOLEAN | default TRUE — tampil di publik |
| `sort_order` | INT | urutan tampil |
| `created_at`/`updated_at` | TIMESTAMPTZ | otomatis |

`package_features` (label fitur per paket, opsional di milestone pertama):

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | |
| `package_id` | UUID FK → packages ON DELETE CASCADE | |
| `feature` | TEXT | label fitur |
| `sort_order` | INT | urutan |

### G2. `0008_orders_payments.sql` — Order & Payment (usulan)

`orders`:

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | |
| `order_number` | TEXT UNIQUE | nomor order manusia (mis. `ORD-20260816-XXXX`) |
| `user_id` | UUID FK → users ON DELETE CASCADE | pemesan (dari `req.user.id`) |
| `package_id` | UUID FK → packages ON DELETE RESTRICT | paket yang dibeli |
| `invitation_id` | UUID FK → invitations ON DELETE SET NULL | nullable — jika order terkait undangan |
| `amount` | BIGINT | **ditentukan server** dari `packages.price_amount` saat create |
| `currency` | TEXT | default `IDR` |
| `status` | TEXT CHECK | kandidat: `pending` \| `awaiting_payment` \| `paid` \| `cancelled` \| `expired` \| `failed` |
| `idempotency_key` | TEXT UNIQUE | nullable — kunci anti duplicate |
| `expires_at` | TIMESTAMPTZ | nullable — batas waktu pembayaran |
| `paid_at` | TIMESTAMPTZ | nullable |
| `created_at`/`updated_at` | TIMESTAMPTZ | otomatis |

Index: `user_id`, `order_number`, `status`.

`payments` (boundary — status hanya dari backend/provider):

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | |
| `order_id` | UUID FK → orders ON DELETE RESTRICT | |
| `provider` | TEXT | `manual` (dev) — nanti `midtrans`/`xendit`/`tripay` |
| `provider_transaction_id` | TEXT | nullable |
| `payment_reference` | TEXT | nullable — VA/reference/token |
| `status` | TEXT CHECK | `pending` \| `succeeded` \| `failed` \| `expired` |
| `amount` | BIGINT | dari order |
| `currency` | TEXT | |
| `metadata` | JSONB | payload provider (tanpa secret) |
| `paid_at` | TIMESTAMPTZ | nullable |
| `created_at`/`updated_at` | TIMESTAMPTZ | otomatis |

Index: `order_id`, `provider_transaction_id`.

### G3. Invitation Lifecycle — 2 opsi (keputusan Owner)

- **Opsi A (direkomendasikan untuk kompatibilitas):** pertahankan `is_published` boolean sebagai sumber kebenaran akses publik; tambahkan kolom `status` (`draft` \| `preview` \| `published` \| `unpublished` \| `expired`) yang dijaga sinkron via trigger/service. API lama tetap berfungsi.
- **Opsi B:** ganti ke enum `status` sepenuhnya → memecah kontrak API existing → tidak direkomendasikan tanpa kebutuhan kuat.

Keputusan: apakah `expired` berbasis `event_date` otomatis, atau berbasis masa aktif langganan paket? (belum terverifikasi requirement — `BUSINESS DECISION REQUIRED` bila relevan Sprint 6).

## H. API Changes

> Semua endpoint baru wajib didokumentasikan di `.docs/api.md`. DTO camelCase.

### Kandidat endpoint (disesuaikan pola existing)

**Pricing:**
- `GET /api/packages` — publik, hanya aktif, urut `sortOrder`.
- `GET /api/packages/:id` — publik (aktif) — detail paket + fitur.

**Orders (requireAuth):**
- `POST /api/orders` — body `{ packageId, invitationId?, idempotencyKey? }`; server menghitung `amount`; reject paket nonaktif/tidak ada.
- `GET /api/orders` — daftar order milik pengguna.
- `GET /api/orders/:id` — detail order milik pengguna (404 bila bukan miliknya).
- `POST /api/orders/:id/cancel` — hanya status tertentu (`pending`/`awaiting_payment`).

**Payments (requireAuth):**
- `POST /api/orders/:id/payment` — membuat payment record untuk order (boundary; provider `manual` dev).
- `GET /api/orders/:id/payment` — status payment.

**Invitation lifecycle:**
- `GET /api/invitations/:id/status` — status eksplisit.
- `PATCH /api/invitations/:id/status` — transisi (validasi state machine).

**Admin (requireAdmin):**
- `GET /api/admin/orders` — daftar order (moderasi/payment ops).
- (opsional) verifikasi pembayaran manual → menunggu keputusan.

**Security:**
- `amount`/`price` TIDAK pernah diterima dari body frontend.
- `user_id` TIDAK pernah diterima dari body — pakai `req.user.id`.
- Parameterized query di semua service.
- Transaction untuk create order + payment multi-step.
- Rate limit baru untuk `POST /api/orders` (mis. 10/menit).
- Webhook (belum ada) wajib signature-verified bila provider dipilih nanti.

## I. Frontend Changes

- **Pricing** — section harga landing (`index.html`) diganti render dinamis dari `GET /api/packages` (hapus hardcode Rp0/Rp99rb/Rp199rb — menjadi `BUSINESS DECISION REQUIRED`).
- **Commerce flow** — halaman/flow baru: pilih paket → ringkasan order → buat order → status pembayaran. Pakai `api.js`, design token, component existing, util `escapeHtml`.
- **Builder** — badge/status undangan eksplisit; pastikan flow pilih template → isi → draft → preview → publish utuh.
- **Invitation status** — indikator status di dasbor builder.
- Frontend **tidak** menentukan harga final; hanya menampilkan data API.

## J. Testing Strategy

1. Health check DB/API dulu (`npm run test:health`) — wajib sebelum E2E.
2. `scripts/e2e-sprint6.mjs` — pricing, order, payment state, invitation lifecycle, + regression (auth, templates, guests, gift accounts, guestbook, admin, reset password, health).
3. Regression Sprint 5: `node --env-file-if-exists=.env scripts/e2e-sprint5.mjs` → harus tetap 25/25 PASS.
4. Target: 100% PASS acceptance criteria Sprint 6.
5. Pola skrip E2E mengikuti `e2e-sprint5.mjs` (record PASS/FAIL, data unik, cleanup, self-healing 429).

## K. Security Considerations

- Server menentukan semua nilai finansial; frontend tidak dipercaya.
- `req.user.id` untuk ownership; 404 (bukan 403) untuk undangan/order milik orang lain.
- Idempotency untuk cegah duplicate order.
- Payment `paid` hanya dari boundary backend, bukan request frontend.
- Parameterized query; transaction multi-step.
- Tidak expose secret/metadata payment berisi credential.
- Validasi semua input via `validation.js`.

## L. Performance Considerations

- Index untuk kolom yang difilter (`orders.user_id`, `orders.status`, `payments.order_id`).
- List package kecil (≤ 4) — tanpa pagination.
- List order paginated bila besar.
- Tidak ada N+1: join package + features per list.

## M. Documentation Changes

- `.docs/sprint-6.md` (file ini), `.docs/api.md`, `.docs/database.md`, `.docs/changelog.md`, `.docs/roadmap.md`, `.ai/context/*` (sprint, project, roadmap, architecture).
- `.docs/e2e/sprint-6-verification.md` — rekaman E2E Sprint 6.
- `.docs/audit/LAPORAN-AUDIT-SPRINT-6.html` — audit akhir.

## N. Acceptance Criteria

1. `GET /api/packages` menampilkan paket aktif dengan harga dari backend; paket nonaktif tidak tampil; paket invalid ditolak.
2. Order dibuat oleh user terautentikasi dengan `amount` dari server; unauthenticated ditolak; paket nonaktif/invalid ditolak; amount body dimanipulasi diabaikan; duplicate submission ditangani (idempotency); ownership benar.
3. Payment state valid; transisi invalid ditolak; frontend tidak bisa memalsukan paid; boundary/webhook terdokumentasi.
4. Invitation lifecycle eksplisit: draft tidak publik, published dapat diakses slug, unpublished tidak publik, owner scoped; API existing tetap kompatibel.
5. Builder flow tidak regress (template → isi → draft → preview → publish).
6. Frontend commerce membaca pricing dari API, bukan hardcode.
7. E2E Sprint 6 PASS + regression Sprint 5 PASS (25/25).
8. Dokumentasi sinkron (api, database, changelog, context, sprint-6, e2e).
9. Audit Sprint 6 PASS.

## O. Definition of Done

- [x] Pricing foundation selesai (paket + fitur + API + seed placeholder)
- [x] Order foundation selesai (status, order number, amount server-side, idempotency, ownership)
- [x] Payment boundary selesai (tabel + adapter interface + dokumentasi keputusan)
- [x] Invitation lifecycle jelas & tested
- [x] Builder flow tidak regress
- [x] Frontend commerce flow selesai (pricing → order → status)
- [x] API & database terdokumentasi
- [x] Migrasi tested (0007, 0008, 0009, 0010)
- [x] E2E Sprint 6 PASS (38/38)
- [x] Regression Sprint 5 PASS (25/25)
- [x] Security review selesai (amount server-side, ownership 404, idempotency, paid hanya dari backend)
- [x] Self review selesai (`rules/09`)
- [ ] Git diff bersih dari perubahan tidak disengaja
- [ ] Dokumentasi sinkron (selesai setelah commit M6/M7)
- [ ] Audit Sprint 6 PASS (M7)
- [ ] Release preparation selesai (v1.5.0 kandidat) (M7)

## P. Milestone / Commit Plan

Branch kerja: `feature/sprint-6-launch-commerce` (dibuat setelah approval).

| Milestone | Isi | Commit (contoh) |
| --- | --- | --- |
| M0 | (Pilih) komit pembersihan working tree production-readiness yang belum ter-commit | `chore(server): ...` (opsional, perlu keputusan Owner) |
| M1 | Migrasi 0007 + service/route packages + seed placeholder + unit/API test | `feat(pricing): ...` |
| M2 | Migrasi 0008 (orders) + order service/routes + idempotency + test | `feat(order): ...` |
| M3 | Payment boundary (tabel payments + adapter interface + test) | `feat(payment): ...` |
| M4 | Invitation lifecycle (status + kompatibilitas + test) | `feat(invitation): ...` |
| M5 | Builder readiness + frontend commerce (pricing → order → status) | `feat(checkout): ...` / `feat(builder): ...` |
| M6 | E2E Sprint 6 + regression + docs + audit + release | `test(e2e): ...` / `docs(sprint-6): ...` |

Setiap milestone: test → self review → lapor hasil (command + PASS/FAIL) → tunggu instruksi bila ada keputusan bisnis ambigu.

---

## Keputusan yang Butuh Owner (Business Decision Required)

| # | Keputusan | Catatan |
| --- | --- | --- |
| 1 | **Tier paket final**: `FREE/BASIC/PREMIUM/EXCLUSIVE` (dari instruksi sprint) vs landing page saat ini `Gratis/Premium/Gold`? | Ada inkonsistensi — perlu satu source of truth |
| 2 | **Harga final** per paket | Pakai placeholder configurable; backend = source of truth |
| 3 | **Provider pembayaran** | Boundary dibangun tanpa provider fiktif; `PAYMENT PROVIDER DECISION REQUIRED` |
| 4 | **Semantik status order** (`pending`/`awaiting_payment`/`paid`/`cancelled`/`expired`/`failed`) | Kandidat; bisa disesuaikan |
| 5 | **Lifecycle `expired`** undangan: otomatis dari `event_date` atau masa aktif paket? | Perlu requirement |
| 6 | **Verifikasi pembayaran manual via admin** (untuk mode manual/dev) | Diperlukan sebelum milstone payment |
| 7 | **Working tree kotor** (5 file server production-readiness uncommitted) | Rekomendasi: commit dulu sebagai maintenance, atau discard |

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 0.2.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Approved & Active | M0–M5 selesai; E2E Sprint 6 38/38 PASS + regression 25/25 PASS; menunggu audit & release (M7) |
| 0.1.0 | 16-08-2026 | AI Pair Programmer + Senior Engineer | 🟡 Draft | Planning Sprint 6 — menunggu approval Owner |
