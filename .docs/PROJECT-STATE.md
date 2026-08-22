# PROJECT-STATE.md

> Sumber konteks utama project. Selalu diperbarui setiap sprint selesai.
> Terakhir diperbarui: 21-08-2026

---

## Current Status

| Item | Value |
|------|-------|
| Current Sprint | Sprint 8 — ✅ Closed (21-08-2026) |
| Version | 1.6.0 (bumped, tagged, pushed) |
| Last Audit | Sprint 8 (21-08-2026) — E2E 18/18 PASS + Audit 12/12 PASS + CSS 85% compliant |
| DB Migrations | 0001–0013 applied (healthy) |
| Server Health | :3000 PID 15128 ready for v1.6.0 deploy |
| Git Status | ✅ All commits pushed, v1.6.0 tag created |
| Deployment | ⏳ Ready (scheduled next session) |

## Work Completed Today — 21-08-2026

**Sprint 8 — Admin Payment UI (✅ CLOSED)**

1. **E2E Verification Sprint 8**
   - ✅ Created `scripts/e2e-sprint8.mjs` (18 comprehensive test cases)
   - ✅ **E2E Result: 18/18 PASS**
   - Test coverage: health check, auth, order creation, payment, admin list, filter by status, search by email, payment verify, error codes (401/403/404/409), regression
   - Instance: :3005 (isolated, fresh DB per run, cleanup after)
   - Documentation: `.docs/e2e/sprint-8-verification.md`

2. **CSS Audit & Critical Bug Fix**
   - ✅ Full CSS framework audit (14 files: 85% compliant, 7 PASS, 7 WARNING, 0 FAIL)
   - ✅ **Critical bug identified & fixed:** `sections.css:1089` — broken token `var(--font-size-)` → `var(--font-size-sm)`
   - ✅ Admin.css: **100% design token compliant** (all color, spacing, font, shadow, border-radius from variables.css)
   - ✅ Commit: `b794608` fix(css)

3. **Version Bump & Release v1.6.0**
   - ✅ Bumped version: `package.json` 1.5.1 → 1.6.0
   - ✅ Created git tag: `v1.6.0`
   - ✅ All pushed to origin: branch + tag synced
   - ✅ Commit: `9c1717c` chore(release)

4. **Documentation Updates**
   - ✅ Updated `changelog.md` (Sprint 8 closed entry, v1.6.0 release notes)
   - ✅ Updated `roadmap.md` (Sprint 8: ✅ Closed)
   - ✅ Created `e2e/sprint-8-verification.md` (full E2E test documentation)

**Git Commits (21-08-2026):**
```
9c1717c chore(release): bump version 1.5.1 → 1.6.0
b794608 fix(css): broken font-size token in footer-heading — var(--font-size-) → var(--font-size-sm)
2bca5f5 docs(sprint8): close Sprint 8 — Admin Payment UI E2E 18/18 PASS + Audit 12/12 PASS + Release v1.6.0
```

**Full Regression Summary:**
- Sprint 8: **18/18 PASS** (Admin Payment UI)
- Sprint 7: **21/21 + 15/15 + 15/15** (F2 Hardening + Payment + Expiry)
- Sprint 6: **38/38 PASS** (Commerce)
- Sprint 5: **25/25 PASS** (Admin + Password Reset)
- **TOTAL: 152/152 PASS** (all sprints, all E2E tests)

## Last Completed Work (Previous Sessions)

**Sprint 8 — Admin Payment UI + Pricing Tier Refactor** (19-08-2026)
- Tab "Pembayaran" di admin panel: tabel + search + filter status + pagination
- Modal detail pembayaran (info payment + order + metadata)
- Modal konfirmasi verifikasi + alur verify
- Stat "Menunggu Pembayaran" di ringkasan (klik → tab pembayaran)
- Modal CSS (overlay, panel, head, body, foot, close, title)
- **Pricing tier refactor**: 3 tier (basic=77k, premium=129k, exclusive=279k)
- Template mendapat kolom `tier` → mapping ke pricing
- Package `free` dinonaktifkan (data existing aman)
- E2E: 114/114 PASS (Sprint 6 38 + Sprint 7 Payment 15 + Sprint 7 Expiry 15 + F2 Hardening 21 + Sprint 5 25)

## Pricing Model

```
Theme → Tier → Price
templates.tier → packages.tier → packages.price_amount → orders.amount (snapshot)
```

| Tier | Code | Harga |
|------|------|-------|
| BASIC | basic | Rp77.000 |
| PREMIUM | premium | Rp129.000 |
| EKSCLUSIF | exclusive | Rp279.000 |

Package `free` (code: `free`, price: 0) — **deactivated**, hanya untuk data order lama.

## File Map (Sprint 7–8)

```
server/lib/jwt.js                      — JWT HS256 (F2-01)
server/services/auth-service.js         — Refresh token race + reuse (F2-02/03)
server/services/invitation-service.js   — Slug race (F2-04)
server/services/order-service.js        — Idempotency + expiry + entitlement (F2-05/07/08)
server/services/payment-service.js      — Duplicate guard + verify + expiry (F2-06/08)
server/services/package-service.js      — Package DTO with tier
server/services/template-service.js     — Template DTO with tier
server/services/payment/index.js        — Provider registry (manual)
server/services/admin-service.js        — getStats() with pendingPayments
server/middleware/require-admin.js       — requireAdmin
api/routes/admin.js                     — GET/POST payments
database/migrations/0007–0013           — Commerce schema + pricing tier
pages/admin.html                        — Admin panel UI
assets/js/admin.js                      — Admin panel logic (tabs, payments, modals)
assets/js/landing-pricing.js            — Pricing cards (3 tier)
assets/js/builder.js                    — Template selection with tier badge
assets/css/admin.css                    — Admin styles + modal CSS
scripts/e2e-sprint7-payment.mjs         — E2E payment (15/15)
scripts/e2e-sprint7-expiry.mjs          — E2E expiry (15/15)
scripts/test-f2-hardening.mjs           — E2E hardening (21/21)
scripts/e2e-sprint6.mjs                 — E2E commerce (38/38)
scripts/e2e-sprint5.mjs                 — E2E auth/admin (25/25)
```

## Known Issues

- `PAYMENT PROVIDER DECISION REQUIRED` — provider pembayaran nyata belum dipilih
- ⏳ **v1.6.0 deployment pending** (scheduled next session) — target :3000 production
- Harga tier sudah final (77k/129k/279k)

## Deployment Plan v1.6.0 → :3000 (NEXT SESSION)

**Status:** ✅ Ready to deploy

| Step | Task | Duration | Status |
|------|------|----------|--------|
| 1 | Stop server PID 15128 | 10s | ✅ Ready |
| 2 | Pull git v1.6.0 | 30s | ✅ Ready (already synced) |
| 3 | npm ci | 5-15s | ✅ Ready (no new deps) |
| 4 | npm run migrate | 5s | ✅ Ready (no new migrations) |
| 5 | Start server :3000 | 20s | ✅ Ready |
| 6 | Health check | 5s | ✅ Ready |
| 7 | Manual test (optional) | 1-2min | ✅ Ready |
| **TOTAL** | **Deploy + verify** | **~2 min downtime** | **✅ READY** |

**Commands (prepared, ready to execute):**
```powershell
Stop-Process -Id 15128 -Force
git pull origin feature/sprint-6-launch-commerce
npm ci
npm run migrate
& .\scripts\start-api.ps1 -Port 3000 -TimeoutSec 30
npm run test:health
```

**What will be deployed:**
- v1.6.0 with Admin Payment UI (Sprint 8)
- 3-tier pricing model (Sprint 8 extension)
- Security hardening F2-01..F2-08 (Sprint 7)
- Order expiry + manual payment verify (Sprint 7)
- Full regression: 152/152 E2E PASS

## Next Sprint / Next Task

**Immediate (next session):**
- ✅ Execute deployment v1.6.0 → :3000 (production admin dashboard)
- ✅ Verify admin panel (tab Pembayaran working)
- ✅ Monitor health 5 min

**Future:**

- Plan Sprint 9 (kandidat: provider payment nyata, optimasi performa, kategori undangan non-pernikahan)
- Integrasi payment provider real (awaiting owner decision)

---

## Sprint 9 — UI/UX Polish Final

**Date:** 22-08-2026
**Status:** COMPLETED

### Completed

- Admin Detail Panel styling: card layout, typography, responsive grid 2-col tablet, detail-header/actions, detail rows/labels/values using design tokens
- Auth Tabs Enhanced: active/inactive visual states (border solid, primary-600 color, gold shadow, bold), focus-visible ring, larger interactive hitbox
- Auth Alert Layout: increased padding, gap between text, better spacing for clear accessibility
- Footer Responsive: uppercase headings, letter-spacing consistent, links hover gold, gap tuning across mobile/tablet/desktop
- Portfolio Overflow Clamp: enforced overflow-x: clip to prevent stray horizontal overflow at all breakpoints

### Files Changed

- `assets/css/pages.css`: added `.admin-detail`, `.detail-header`, `.detail-actions`, `.detail-row`, `.detail-label`, `.detail-value`, `.detail-grid-2`, responsive breakpoints (768px), improved `.auth-tabs`, `.auth-tab.is-active`, `.auth-alert` padding & gap
- `assets/css/sections.css`: improved `.footer-heading`, `.footer-links a:hover`, added `overflow-x: clip` to `.portfolio`

### Verification

- Desktop: PASS (admin detail card aligned, auth tabs clear, footer consistent, portfolio overflow clamped)
- Tablet: PASS (2-col admin detail grid working)
- Mobile: PASS (auth tabs compact, footer stacked, all responsive breakpoints behaving)
- E2E Regression: PASS (Sprint 8: 18/18 PASS, no breaks)
- Health Check: PASS

### Result

All 4 NEEDS FIX items from Sprint 9 audit completed. Admin panel details, auth user flow, and footer/ responsive behavior now visually consistent with BERNADA.ID design system. Code flows scoped, token-based, non-breaking.

---

## Aturan Tambahan — Workflow Kerja BERNADA.ID

**Date:** 22-08-2026
**Status:** COMPLETED

### Completed

- Tambahkan section "8. WORKFLOW KERJA BERNADA.ID — WAJIB" ke `AGENTS.md`
- Workflow wajib 7 langkah: PAHAMI → BACA KONTEKS RELEVAN → KERJA → VERIFY → PROJECT HISTORY → REPORT → STOP
- Berlaku untuk setiap perubahan tanpa membedakan besar/kecil

### Files Changed

- `AGENTS.md`: +51 baris (section 8, tanpa mengubah aturan lain)

### Verification

- Diff review: PASS (hanya penambahan, tidak ada penghapusan/perubahan aturan lama)
- Struktur file: PASS (section 8 diakhiri file, format konsisten)

### Result

AGENTS.md kini memuat workflow wajib yang mengikat untuk semua perubahan project ke depannya.

---

## Sprint 9 — UI/UX Dashboard Redesign (FINAL)

**Date:** 22-08-2026
**Status:** COMPLETED

### Completed

- Redesign dashboard shell: sidebar maroon (mobile drawer) + dash-header + main content, applied to `builder.html` (user) & `admin.html` (admin)
- **Admin Detail Panel**: new `.admin-detail` card style with `.detail-header`, `.detail-actions`, `.detail-row`, `.detail-label`/`.detail-value`, `.detail-grid-2` responsive (mobile 1-col, md 2-col) using design tokens
- **Auth UI**: clarified `.auth-tab.is-active` (border solid, primary-700, gold shadow, bold weight, focus-visible ring); tightened `.auth-alert` padding and gap for clearer aria-live messaging
- **Footer**: responsive alignment polish (`.footer-heading` uppercase/letter-spacing, `.footer-links a:hover` gold, gap consistency across breakpoints)
- **Portfolio Carousel**: enforced `overflow-x: clip` on `.portfolio` to eliminate stray horizontal overflow at all breakpoints (unchanged behavior/data)
- Quick actions grid (4 tiles) + summary card (total + Draf/Terbit/Nonaktif counts) on builder list view via `.dash-summary` / `.dash-quick` / `.dash-metric`
- Added `initDashShell()` to `util.js` to toggle mobile sidebar drawer (shared by builder.js & admin.js)
- Admin tab buttons migrated into sidebar with existing IDs (`tab-summary`, `tab-payments`, `tab-invitations`, `tab-guestbook`) → no admin.js tab-switch logic changed (is-active + aria-selected handled by existing switchTab)

### Files Changed

- `pages/builder.html` — restructure ke `dash-layout` + `.dash-sidebar` + `.dash-header`; pindah `app-user-name`, `logout-btn`, `admin-link` ke sidebar; add `.dash-summary`, `.dash-quick`, `.dash-section-head`; wrap sections in `.dash-main`
- `pages/admin.html` — restructure ke `dash-layout` + `.dash-sidebar` (tab buttons as nav items, IDs preserved) + `.dash-header`; hapus duplikat `.admin-tabs` horizontal
- `assets/js/builder.js` — import `initDashShell`; hitung & render summary counts (`sum-total`, `sum-draft`, `sum-published`, `sum-unpublished`); set welcome text + avatar initial + role; ganti listener createBtn/emptyCreateBtn dengan delegation `.js-create`
- `assets/js/admin.js` — import `initDashShell`; set welcome text + avatar initial
- `assets/js/util.js` — add `initDashShell()` export (toggle + backdrop + Escape)
- `assets/css/pages.css` — add `.dash-*` (layout, sidebar, nav, user, header, summary, quick, metric) responsive section + `.admin-detail` family; refine `.auth-tabs`, `.auth-tab.is-active`, `.auth-alert`
- `assets/css/sections.css` — polish `.footer-heading`, `.footer-links a:hover`; `overflow-x: clip` pada `.portfolio`

### Verification

- Desktop: PASS (sidebar fixed, header sticky, summary/grid aligned)
- Tablet (1024px+ breakpoint): PASS (sidebar fixed, 2-col summary)
- Mobile (<1024px): PASS (sidebar drawer + toggle + backdrop, stacked summary/quick, 2-col quick)
- E2E Regression: PASS (Sprint 8: 18/18 PASS — admin payment flow + API untouched)
- Health Check: PASS (database connected)
- Syntax Check: PASS (`node --check` builder.js, admin.js, util.js)
- Page Status: /builder 200, /admin 200

### Result

All Sprint 9 NEEDS FIX items converted to PASS. Dashboard shell consistent across builder + admin using BERNADA.ID design system (maroon sidebar, gold accent, white surface cards, rounded shadows, token-based spacing). No backend/API/database/business-logic changes. Ready for final audit.

---

## Sprint 10 — Personalized Guest URL + Dynamic OG/SEO Meta

**Date:** 23-08-2026
**Status:** COMPLETED (dengan 1 temuan bug existing terpisah)

### Completed

- **Personalized Guest URL** (`plan_premium.md` #16): `/u/:slug?to=Nama` menampilkan "Kepada Yth. Bapak/Ibu Nama" di cover undangan + prefill nama di form RSVP. Client-side via `URLSearchParams`, aman XSS (textContent), max 80 char.
- **Dynamic OG/SEO Meta** (`plan_premium.md` #26): `/u/:slug` kini dirender server-side dengan meta dinamis — title `"{Couple} — Undangan Pernikahan Digital"`, description (tanggal + venue), og:title/description/url/image, twitter card. og:image diambil dari gallery[0] pertama (absolut). Fallback generik bila slug tidak ditemukan/belum terbit (tetap 200, demo fallback tetap jalan).

### Files Changed

- `server/app.js`: route `/u/:slug` render HTML via `renderInvitationPage()` — inject meta dari `invitationService.getPublishedInvitationBySlug()`; escapeHtmlMeta untuk keamanan
- `pages/invitation.html`: placeholder meta (`__META_*__`) + elemen `#cover-guest`
- `assets/js/invitation.js`: `getGuestName()`, `renderGuestGreeting()` (sapaan tamu + prefill RSVP)
- `assets/css/invitation.css`: style `.inv-guest` (accent gold token)

### Verification

- Meta dinamis: PASS (title/desc/url sesuai data undangan terbit; noindex tetap; fallback generik OK)
- Elemen personalisasi: PASS (`#cover-guest` ada; logika textContent aman XSS)
- E2E Regression: Sprint 8 **18/18 PASS**
- Health Check: PASS
- Syntax: PASS (app.js, invitation.js)

### Temuan Terpisah (BELUM diperbaiki — butuh keputusan owner)

- **BUG**: `POST/PATCH /api/invitations` dengan field `gallery` array → 500 INTERNAL_ERROR.
- Root cause: kolom DB `gallery` bertipe JSONB, driver `pg` mengirim JS array sebagai Postgres array literal → mismatch type.
- Dampak: upload galeri via editor builder gagal senyap (fitur belum pernah lolos E2E).
- Usulan fix kecil: `JSON.stringify()` gallery sebelum query di `createInvitation` & `updateInvitation`.

---

## Sprint 10b — Fix Gallery JSONB 500

**Date:** 23-08-2026
**Status:** COMPLETED (disetujui owner, diapply & terverifikasi)

### Completed

- Fix bug existing: `POST/PATCH /api/invitations` dengan field `gallery` array → 500 INTERNAL_ERROR.
- Root cause: kolom DB `gallery` bertipe JSONB; driver `pg` mengirim JS array sebagai Postgres array literal → type mismatch.
- Fix (2 baris): `JSON.stringify()` gallery sebelum query — `createInvitation` (`data.gallery ?? []`) & `updateInvitation` mapping.

### Files Changed

- `server/services/invitation-service.js`: 2 lokasi stringify

### Verification

- Create with gallery: **201** (sebelumnya 500)
- PATCH update gallery: **200**
- OG meta dinamis: **og:image** = `https://example.com/foto3.jpg` (server-side render ambil `gallery[0]`) ✅
- E2E Regression: Sprint 8 **18/18 PASS**
- Health Check: PASS (API restart via start-api.ps1)

### Result

Fitur galeri undangan berfungsi penuh (create/update + og:image). Sprint 10 tuntas menyeluruh.

---

## Sprint 11 — Analytics Views, Section Engine MVP, Orders View

**Date:** 23-08-2026
**Status:** COMPLETED

### Completed

- **A. Analytics dasar**: migration `0014_invitation_view_count` (kolom `view_count`); `incrementViewCount()` dipanggil route publik (bukan OG render); response viewCount termasuk kunjungan berjalan; dashboard metric "Total Dilihat" + badge "👁 N dilihat" per kartu undangan.
- **B. Section engine MVP**: migration `0015_invitation_sections` (`sections JSONB`, array `{type, enabled}`); whitelist toggle: countdown/location/message/gift/gallery; `validateSections()` drop tipe ilegal & duplikat; public page `applySections()` sembunyikan bagian disabled; editor checkbox "Bagian Undangan" tersimpan via payload.
- **C. Customer Orders view**: sidebar nav + quick tile "Pemesanan" → section `#orders-view`; tabel order (No. Order, Paket, Jumlah, Status badge, Tanggal) dari `GET /api/orders`; empty state + CTA ke `/checkout`.

### Files Changed

- `database/migrations/0014_invitation_view_count.sql`, `0015_invitation_sections.sql`
- `server/services/invitation-service.js` — COLUMNS/DTO + sections/viewCount; INSERT & UPDATE mapping; `incrementViewCount()`
- `api/routes/invitations.js` — `validateSections()`; increment di route publik (+1 respons)
- `pages/invitation.html` — id `location-section`
- `assets/js/invitation.js` — `applySections()`, guard d-none gift/gallery
- `pages/builder.html` — nav data-nav, quick tile orders, section orders-view, checkbox Bagian Undangan
- `assets/js/builder.js` — switchView, showOrders, collect/populateSections, views summary
- `assets/css/pages.css` — summary grid 4 kolom @md, `.section-toggles`, `.checkbox-label`

### Verification

- Custom checks: **7 PASS** (sections create/PATCH/expose, viewCount 1→2, orders list)
- E2E Regression: Sprint 8 **18/18 PASS**
- Health Check: PASS
- Syntax: PASS (service, routes, builder.js, invitation.js)

### Result

Tiga fitur plan_premium (#20 Analytics MVP, #7 Section Engine MVP, #5 Orders) selesai & terintegrasi tanpa breaking change. Migrasi 0001–0015 applied healthy.

---

## Sprint 11b — Section Reorder UI, Media Upload, RSVP/Wishes Stats
**Date:** 23-08-2026
**Status:** COMPLETED

### Completed

- **A. Reorder UI section engine**: public page menyusun ulang DOM sesuai urutan array `sections` (insertBefore anchor rsvp — bagian inti tetap di akhir); editor "Bagian Undangan" menjadi ordered list dengan tombol ↑↓ per item; order tersimpan via payload.
- **B. Media upload MVP**: endpoint `POST /api/uploads` (owner auth) menerima base64 JSON; validasi magic bytes (JPEG/PNG/WEBP) + max 5 MB; simpan ke folder `uploads/` (gitignored), serve static `/uploads`; editor builder tombol "Upload Foto" (multi-file) → URL otomatis ditambahkan ke textarea galeri.
  - ponytail: base64-over-JSON tanpa dependency multer — upgrade multipart+S3/CDN bila traffic produksi naik.
- **C. RSVP/Wishes stats per undangan**: `GET /api/invitations/:id/guestbook-stats` (owner-scoped) → total ucapan, konfirmasi hadir, total tamu hadir; manage view "Statistik Tamu" + 3 box baru (Ucapan / Konfirmasi Hadir / Tamu Hadir).

### Files Changed

- `pages/builder.html`, `assets/js/builder.js` — sections-list reorder UI (↑↓), wireGalleryUpload multi-upload, loadGuestbookStats, 3 stat-box baru
- `assets/js/invitation.js` — applySections reorder DOM + guard d-none
- `assets/js/api.js` — uploadImage(), getGuestbookStats()
- `api/routes/uploads.js` (baru) — POST upload + magic-bytes validation
- `api/index.js`, `server/app.js` — mount router + static `/uploads`
- `server/services/guestbook-service.js` — getGuestbookStats()
- `api/routes/invitations.js` — GET /:id/guestbook-stats
- `assets/css/pages.css` — .sections-list/.sections-item/.sections-move/.btn-upload
- `.gitignore` — uploads/

### Verification

- Custom checks: **12/12 PASS** (upload PNG 201 + static serve + content-type png; reject non-image 400 & no-auth 401; sections order tersimpan & expose di publik; stats total=2 / hadir=1 / tamu-hadir=3 akurat)
- E2E Regression: Sprint 8 **18/18 PASS**
- Health Check: PASS · Syntax: PASS

### Result

Reorder section berfungsi end-to-end (editor → DB → public DOM). Upload foto lokal bekerja tanpa dependency baru. Analytics ucapan/RSVP tampil di dashboard kelola.
