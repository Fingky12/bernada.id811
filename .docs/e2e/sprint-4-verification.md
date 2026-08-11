<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Verifikasi E2E Sprint 4 · Category : Catatan
  Version  : 1.0.0 · Status : ✅ Verified · Update : 11-08-2026
-->

# Verifikasi E2E — Sprint 4 (The Guest Experience)

> Verifikasi end-to-end API BERNADA.ID terhadap PostgreSQL lokal. Menutup temuan audit **MEDIUM AC7** ("verifikasi E2E menunggu instalasi PostgreSQL") dari Sprint 3.

---

## Lingkungan

| Item | Nilai |
| --- | --- |
| Tanggal | 11-08-2026 |
| OS | Windows (PowerShell 5.1 + curl.exe) |
| PostgreSQL | 18.4 (scoop), `localhost:5432`, role `bernada`, DB `bernada` |
| Node.js | >= 22 (ESM) |
| Server | `npm run dev` → `http://localhost:3000` |
| Database | `npm run db:create` + `npm run migrate` — migrasi 0001–0004 sukses (8 tabel) |

## Skrip

- `scripts/health-check.mjs` + `npm run test:health` — verifikasi `GET /api/health` (HTTP 200, `status=ok`, `service=bernada-api`, `database=connected`). Jalur gagal (server mati) mengembalikan FAIL dengan pesan error asli, exit code 1.

## Hasil 21/21 PASS

| # | Langkah | Status |
| --- | --- | --- |
| 1 | `GET /api/health` — database `connected` | ✅ PASS |
| 2 | `POST /api/auth/register` (user baru unik) | ✅ PASS |
| 3 | `POST /api/auth/login` | ✅ PASS |
| 4 | `GET /api/auth/me` | ✅ PASS |
| 5 | `GET /api/templates` — 6 template aktif | ✅ PASS |
| 6 | `POST /api/invitations` (create) | ✅ PASS |
| 7 | `GET /api/invitations` (list owner) | ✅ PASS |
| 8 | `PATCH /api/invitations/:id` | ✅ PASS |
| 9 | `POST /api/invitations/:id/publish` | ✅ PASS |
| 10 | `GET /api/invitations/public/:slug` (undangan terbit) | ✅ PASS |
| 11 | `POST` + `GET /api/invitations/public/:slug/guestbook` | ✅ PASS |
| 12 | `POST /api/invitations/:id/guests` (batch 2) | ✅ PASS |
| 13 | `GET /api/invitations/:id/guests` + `/guests/stats` | ✅ PASS |
| 14 | `PATCH /api/guests/:guestId` (status → hadir) | ✅ PASS |
| 15 | `DELETE /api/guests/:guestId` (204) | ✅ PASS |
| 16 | `POST /api/invitations/:id/gift-accounts` (tanpa `isActive`/`sortOrder`) | ✅ PASS |
| 17 | `GET /api/invitations/:id/gift-accounts` + `GET /api/invitations/public/:slug/gift-accounts` (hanya aktif) | ✅ PASS |
| 18 | `PATCH /api/gift-accounts/:giftAccountId` (nonaktif → hilang dari publik) | ✅ PASS |
| 19 | `DELETE /api/gift-accounts/:giftAccountId` (204) | ✅ PASS |
| 20 | `POST /api/auth/refresh` (rotasi token) | ✅ PASS |
| 21 | `POST /api/auth/logout` (204) | ✅ PASS |

## Bug yang Ditemukan & Diperbaiki Selama Verifikasi

1. **`23502 not_null_violation` pada create gift account** — `createGiftAccount` mengirim `undefined` untuk `is_active`/`sort_order` (kolom NOT NULL) saat body tidak menyertakannya. Diperbaiki di `server/services/gift-account-service.js` dengan default `data.isActive ?? true` dan `data.sortOrder ?? 0` (defense in depth, konsisten default DB).
2. **Public gift-accounts selalu 401** — `GET /api/invitations/public/:slug/gift-accounts` terblokir `use(requireAuth)` global di `api/routes/invitations.js` (dieksekusi untuk semua request yang masuk router tapi tidak match route publik). Diperbaiki:
   - Route publik dipindah ke `api/routes/invitations.js` sebelum `use(requireAuth)` (pola sama seperti guestbook publik).
   - `guests.js` & `gift-accounts.js` mengganti `use(requireAuth)` menjadi `requireAuth` per-route (mencegah router di-mount `/` memblokir route publik router lain).

## Kesimpulan

- Seluruh Acceptance Criteria API Sprint 4 terverifikasi end-to-end terhadap PostgreSQL asli.
- Temuan audit **MEDIUM AC7** dinyatakan **tertutup**.
- Tidak ada route `/health` duplikat; endpoint resmi `GET /api/health` terverifikasi 200 + field lengkap.
