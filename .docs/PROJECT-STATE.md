# PROJECT-STATE.md

> Sumber konteks utama project. Berisi riwayat setiap sprint yang complete, disusun berurutan.
> Terakhir diperbarui: 24-08-2026

---

## Current Status

| Item | Value |
|------|-------|
| Sprint terakhir | Sprint 11b — ✅ Closed (23-08-2026) |
| Versi package.json | 1.6.0 (tag `v1.6.0`; fitur Sprint 9–11b belum di-release/bump) |
| DB Migrations | 0001–0015 applied (healthy) |
| Git | Branch `feature/sprint-6-launch-commerce`, synced dengan origin (`d6b4ba6`) |
| Verifikasi terakhir | Custom checks 12/12 PASS · E2E regression Sprint 8 18/18 PASS · Health PASS |
| Deployment | ⏳ Belum dieksekusi sejak v1.6.0 — kode terbaru (Sprint 11b) belum jalan di :3000 |

---

## Riwayat Sprint (urut dari awal)

### Sprint 1 — Foundation (03–05-08-2026) · v1.0.0
Design system resmi (Merah & Emas, `variables.css`), reset/base/layout/components/animations/main.css, struktur folder project, setup awal server & skema DB.
Detail: `.docs/sprint-1.md`

### Sprint 2 — The First Experience (05–10-08-2026) · v1.1.0
Homepage `index.html` 9 section + interaksi.
Detail: `.docs/sprint-2.md`

### Sprint 3 — The Core Features (10-08-2026) · v1.2.0
Autentikasi (register/login/logout/refresh rotasi httpOnly), API templates + 6 seed, builder undangan, halaman publik `/u/:slug`.
Detail: `.docs/sprint-3.md`

### Sprint 4 — The Guest Experience (10–11-08-2026) · v1.3.0
Buku tamu (guestbook), manajemen tamu (CRUD + stats), amplop digital (gift accounts), hardening LOW, E2E PostgreSQL 21/21 PASS.
Detail: `.docs/sprint-4.md`

### Sprint 5 — The Admin & Account Security (12–16-08-2026) · v1.4.0
Dasbor admin + role management (`requireAdmin`, `/api/admin/*`), lupa/reset password (SMTP + token hash), E2E 25/25 PASS, audit PASS.
Detail: `.docs/sprint-5.md`

### Sprint 6 — The Launch & Commerce Foundation (16-08-2026) · v1.5.0
Packages + pricing (0007), orders server-side + idempotency (0008), payment boundary provider manual (0009), invitation lifecycle draft→published (0010), frontend commerce (pricing dinamis + checkout), E2E 38/38 PASS, audit PASS 25/0/0.
Detail: `.docs/sprint-6.md`

### Sprint 7 — Security & Commerce Hardening (16-08-2026) · v1.5.1
F2-01 JWT HS256 pinning · F2-02 refresh race atomik · F2-03 reuse detection + revoke family · F2-04 slug race 409 · F2-05 idempotency SAVEPOINT · F2-06 partial unique pending payment (0011) · F2-07 entitlement `package_id` · F2-08 order expiry lazy+sweep tanpa worker · admin verify pembayaran manual + audit_logs (0012). E2E: F2 21/21 · Payment 15/15 · Expiry 15/15 · Regression 38/38.
Detail: `.docs/changelog.md`, `.docs/audits/audit-sprint-7.md`

### Sprint 8 — Admin Payment UI + Pricing Tier Refactor (19–21-08-2026) · v1.6.0
Tab "Pembayaran" admin panel (list/filter/search/pagination), modal detail + konfirmasi verify, stat pending card, modal CSS design-token. **Pricing refactor**: 3-tier basic=77k/premium=129k/exclusive=279k (0013, `templates.tier`). Audit 12/12 PASS · E2E baru `e2e-sprint8.mjs` **18/18 PASS** · CSS audit awal (fix token rusak `sections.css`). Tag `v1.6.0`.
Detail: `.docs/sprint-8.md`, `.docs/e2e/sprint-8-verification.md`, `.docs/audits/audit-sprint-8.md`

### CSS Audit Compliance Phase 2–4 (22-08-2026)
Melanjutkan audit CSS Sprint 8: tambah token motion/hover-lift/form/decorative/layout, seluruh file CSS diarahkan 100% design-token compliant.
Commit: `2d848e1`

### Sprint 9 — UI/UX Dashboard Redesign + Polish Final (22-08-2026)
Dashboard shell konsisten builder + admin: sidebar maroon (drawer mobile), dash-header, summary cards (`dash-summary`/`dash-quick`), `initDashShell()` di util.js. Polish: auth tabs aktif (border + gold shadow + focus ring), auth alert spacing, footer responsive, portfolio overflow clamp, admin detail panel card style. Backend/DB tidak tersentuh. Verifikasi: desktop/tablet/mobile PASS · E2E regression 18/18 PASS · syntax PASS.
Commit: `49c4d97`, `3dd4129`; arsip audit: `.docs/audit_uiux/`

### Catatan Non-Sprint (22-08-2026)
`AGENTS.md` ditambah section **WORKFLOW KERJA BERNADA.ID — WAJIB** (PAHAMI → KONTEKS → KERJA → VERIFY → HISTORY → REPORT → STOP) dan revisi poin 8 (LANJUT/NANTI). Commits: `9ae053e`, `8da7ddc`, `aa7f971`.

### Sprint 10 — Personalized Guest URL + Dynamic OG/SEO (22-08-2026) + Fix 10b
Personalisasi tamu via `?to=Nama`, OG/SEO meta dinamis server-side. **Fix 10b**: gallery array → 500 (jsonb vs pg array literal) — stringify sebelum query. Create/PATCH galeri 201/200, og:image ✅.
Commits: `17532cb`, `5f652b0`

### Sprint 11 — Analytics Views, Section Engine MVP, Orders View (23-08-2026)
A. Analytics: migrasi `0014_invitation_view_count`, increment di route publik, metric "Total Dilihat" + badge per kartu.
B. Section engine MVP: migrasi `0015_invitation_sections` (JSONB `{type,enabled}`), whitelist toggle countdown/location/message/gift/gallery, public page sembunyikan bagian disabled, checkbox editor.
C. Orders view: nav sidebar + tabel order dari `GET /api/orders` + CTA checkout.
Verifikasi: custom checks 7 PASS · E2E regression 18/18 PASS.
Commit: `1aa000f`

### Sprint 11b — Section Reorder UI, Media Upload, RSVP/Wishes Stats (23-08-2026)
A. Reorder section: public DOM menyusun ulang sesuai array `sections`; editor ordered list dengan tombol ↑↓.
B. Media upload MVP: `POST /api/uploads` (base64 JSON, validasi magic bytes JPEG/PNG/WEBP, max 5MB, simpan `uploads/` gitignored, serve `/uploads`), tombol Upload Foto multi-file di editor.
   ponytail: base64-over-JSON tanpa multer — upgrade multipart+S3/CDN bila traffic naik.
C. Stats RSVP: `GET /api/invitations/:id/guestbook-stats` (owner-scoped) + 3 box stats di manage view.
Verifikasi: custom checks **12/12 PASS** · E2E regression 18/18 PASS · Health/Syntax PASS.
Commit: `d6b4ba6` (**HEAD**)

---

## Referensi Teknis

### Pricing Model
```
Theme → Tier → Price
templates.tier → packages.tier → packages.price_amount → orders.amount (snapshot)
```
| Tier | Code | Harga |
|------|------|-------|
| BASIC | basic | Rp77.000 |
| PREMIUM | premium | Rp129.000 |
| EKSCLUSIF | exclusive | Rp279.000 |

Package `free` deactivated (hanya untuk data order lama).

### File Map Inti
```
server/services/order-service.js        — order + expiry + entitlement
server/services/payment-service.js      — payment + verify admin + guard duplikat
server/services/invitation-service.js   — CRUD + sections + viewCount
server/services/guestbook-service.js    — guestbook + stats
api/routes/uploads.js                   — upload foto (magic bytes, max 5MB)
database/migrations/0001–0015           — schema lengkap
pages/builder.html + assets/js/builder.js    — dashboard user (+reorder, upload, orders view)
pages/admin.html + assets/js/admin.js        — panel admin (+tab Pembayaran)
assets/js/invitation.js                 — halaman publik (+applySections reorder)
scripts/e2e-sprint8.mjs                 — E2E regression utama (18/18)
start-bernada.ps1 / stop-bernada.ps1    — start/stop stack lengkap
```

---

## Known Issues / Outstanding

- `PAYMENT PROVIDER DECISION REQUIRED` — provider pembayaran nyata belum dipilih (menunggu owner)
- ⏳ **Deploy :3000 pending** — origin sudah Sprint 11b, produksi masih kode v1.6.0-era
- ⏳ **Version bump pending** — kandidat v1.7.0 (fitur Sprint 9–11b belum direlease)
- ⏳ **AGENTS.md ada perubahan belum commit** — penambahan "Fakta Teknis Kunci" (fakta terverifikasi, disarankan commit)

## Next Steps (kandidat)

1. Bump version → v1.7.0 + tag + push
2. Commit AGENTS.md (Fakta Teknis Kunci)
3. Deploy ke :3000 (pakai `start-api.ps1`, ~2 menit downtime)
4. Planning Sprint 12 (kandidat: integrasi payment provider nyata, optimasi performa/SEO)
