# PROJECT-STATE.md

> Sumber konteks utama project. Selalu diperbarui setiap sprint selesai.
> Terakhir diperbarui: 19-08-2026

---

## Current Status

| Item | Value |
|------|-------|
| Current Sprint | Sprint 8 — Closed |
| Version | 1.5.1 |
| Last Audit | Sprint 8 (19-08-2026) — Admin Payment 12/12 PASS + Pricing Tier 114/114 E2E PASS |
| DB Migrations | 0001–0013 applied |
| Server Health | OK (tested via `npm run test:health`) |

## Last Completed Work

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
- Sprint 7–8 belum di-deploy ke production
- Harga tier sudah final (77k/129k/279k)

## Important Notes

- **Start server**: selalu pakai `scripts/start-api.ps1 -Port <N>` (jangan `npm start` foreground)
- **Migrasi**: append-only, jangan edit file migrasi yang sudah applied
- **Rate limit**: in-memory, global per instance — E2E beruntun butuh instance segar
- **Constitution AI**: `.ai/rules/00-opencode.md` (tertinggi)

## Sprint History

| Sprint | Status | Audit | File |
|--------|--------|-------|------|
| 1 | ✅ Closed | PASS | `.docs/sprint-1.md` |
| 2 | ✅ Closed | PASS | `.docs/sprint-2.md` |
| 3 | ✅ Closed | PASS | `.docs/sprint-3.md` |
| 4 | ✅ Closed | PASS | `.docs/sprint-4.md` |
| 5 | ✅ Closed | PASS | `.docs/sprint-5.md` |
| 6 | ✅ Closed | PASS | `.docs/sprint-6.md` |
| 7 | ✅ Closed | PASS | `.docs/audits/audit-sprint-7.md` |
| 8 | ✅ Closed | PASS | `.docs/sprint-8.md` |

## Next Sprint / Next Task

Belum direncanakan. Kandidat:
- Integrasi provider pembayaran nyata (butuh keputusan owner)
- Deploy v1.5.1 ke production
- Sprint 9 planning
