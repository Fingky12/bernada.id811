<!--
  BERNADA.ID KNOWLEDGE BASE
  Document : Lessons Learned · Category : Knowledge (living document)
  Version  : 1.0.0 · Status : ✅ Verified · Update : 16-08-2026
-->

# Lessons Learned — BERNADA.ID

> Pola reusable yang sudah **terverifikasi**. Setiap lesson wajib berisi: ROOT CAUSE, EVIDENCE, FIX, VERIFICATION, DO NOT REPEAT.
> Aturan: **jangan mencatat dugaan sebagai fakta.** Entry baru hanya dari hasil yang benar-benar terbukti.

---

## Cara Menambah Lesson Baru

1. Tulis dengan format di bawah (5 bagian wajib).
2. Cantumkan bukti: commit hash, file, output test.
3. Simpan pola reusable di file ini; incident spesifik di `incidents.md`.

---

## L-001 — Migrasi skema yang sudah diterapkan tidak boleh diubah (append-only)

- Tanggal: 16-08-2026
- Referensi: commit `4eb54d7`, `.docs/e2e/sprint-5-verification.md`

**ROOT CAUSE**
Trigger `updated_at` pada migrasi sebelumnya (0005) butuh perbaikan. Mengubah file migrasi yang sudah diterapkan akan memecah konsistensi `schema_migrations` (file sudah tercatat sebagai applied).

**EVIDENCE**
- Commit `4eb54d7` — "feat(auth): lupa & reset password (SMTP email + token reset) + fix trigger updated_at migrasi 0006".
- `database/migrations/0006_password_reset_tokens_updated_at.sql` ada sebagai migrasi baru terpisah (bukan edit 0005).
- `.docs/e2e/sprint-5-verification.md`: "migrasi 0001–0006 applied (termasuk `password_reset_tokens` + fix `updated_at`)".

**FIX**
Buat file migrasi baru bernomor lebih besar (`0006_*.sql`) berisi perbaikan; jalankan `npm run migrate`. Runner `database/migrate.js` membandingkan file dengan `schema_migrations` dan hanya menerapkan yang belum tercatat.

**VERIFICATION**
`npm run migrate` → "Migrasi 0006 diterapkan."; E2E Sprint 5 25/25 PASS dengan `updated_at` berfungsi.

**DO NOT REPEAT**
- ❌ Edit/rewrite file migrasi yang sudah tercatat di `schema_migrations`.
- ❌ Menghapus baris `schema_migrations` agar migrasi lama dijalankan ulang.

---

## L-002 — E2E harus tahan rate limit in-memory (429) dengan self-healing

- Tanggal: 16-08-2026
- Referensi: `scripts/e2e-sprint5.mjs`, `.docs/e2e/sprint-5-verification.md`

**ROOT CAUSE**
Rate limit auth 10/menit (middleware in-memory) membuat serangkaian request E2E beruntun dalam satu menit mendapat `429 RATE_LIMITED`.

**EVIDENCE**
- `.docs/e2e/sprint-5-verification.md` (Temuan): "saat verifikasi dijalankan beruntun dalam satu menit, respons `429 RATE_LIMITED` dikembalikan dengan benar".
- Skrip menangani `429` dengan menunggu 61 detik lalu retry sekali.

**FIX**
Di helper `api()` skrip E2E: jika `status === 429`, tunggu `61_000` ms lalu retry satu kali (self-healing). Ini membuktikan rate limiting bekerja, bukan bug E2E.

**VERIFICATION**
E2E Sprint 5: **25/25 PASS** (16-08-2026), termasuk alur yang kena rate limit.

**DO NOT REPEAT**
- ❌ Menonaktifkan rate limiter di kode agar E2E lolos.
- ❌ Menambah timeout/retry tanpa batas untuk "menang" atas 429.
- ❌ Menganggap 429 sebagai kegagalan E2E tanpa memahami penyebabnya.

---

## L-003 — `NOT NULL` violation saat create gift account → berikan default di service

- Tanggal: 11-08-2026 (Release v1.3.0)
- Referensi: `.docs/changelog.md`, `server/services/gift-account-service.js`

**ROOT CAUSE**
Create gift account tanpa `isActive`/`sortOrder` mengembalikan error PostgreSQL `23502 not_null_violation` karena kolom bertipe `NOT NULL` tanpa default di sisi aplikasi.

**EVIDENCE**
- `.docs/changelog.md` v1.3.0: "bug 23502 not_null_violation pada create gift account tanpa isActive/sortOrder".

**FIX**
Default di service layer: `?? true` untuk `isActive` dan `?? 0` untuk `sortOrder` di `gift-account-service.js`.

**VERIFICATION**
E2E Sprint 4: **21/21 PASS** setelah perbaikan (tercatat di changelog & `.docs/e2e/sprint-4-verification.md`).

**DO NOT REPEAT**
- ❌ Menerima input partial tanpa default untuk kolom `NOT NULL` — beri default di service atau `DEFAULT` di migrasi.

---

## L-004 — Route publik harus dideklarasikan sebelum middleware auth global

- Tanggal: 11-08-2026 (Release v1.3.0)
- Referensi: `.docs/changelog.md`, `api/routes/invitations.js`, `api/routes/guests.js`, `api/routes/gift-accounts.js`

**ROOT CAUSE**
Endpoint publik `GET /api/invitations/public/:slug/gift-accounts` selalu 401 karena middleware `requireAuth` global terpasang lebih dulu di route file, sehingga request publik ditolak.

**EVIDENCE**
- `.docs/changelog.md` v1.3.0: "publik gift-accounts selalu 401 → route publik dipindah sebelum `use(requireAuth)` di `invitations.js` + `requireAuth` per-route di `guests.js` & `gift-accounts.js`".

**FIX**
Pindahkan route publik sebelum pemasangan `use(requireAuth)`; untuk route lain, pasang `requireAuth` per-route, bukan global.

**VERIFICATION**
E2E Sprint 4: 21/21 PASS.

**DO NOT REPEAT**
- ❌ Memasang middleware auth global sebelum mendeklarasikan route publik dalam satu file route.
- ❌ Menganggap semua route di file yang sama memiliki auth yang sama tanpa memeriksa urutan.

---

## L-005 — Middleware rate limiter ganda pada satu endpoint = respons tidak konsisten

- Tanggal: 16-08-2026 (Audit Sprint 5, temuan LOW)
- Referensi: `.docs/e2e/sprint-5-verification.md` (re-verifikasi pasca-audit), `api/routes/auth.js`

**ROOT CAUSE**
`authLimiter` terpasang dua kali pada `POST /api/auth/reset-password`, menimbulkan perilaku rate limiting ganda/tidak konsisten.

**EVIDENCE**
- `.docs/e2e/sprint-5-verification.md` re-verifikasi: "authLimiter ganda pada `POST /api/auth/reset-password` dihapus (`api/routes/auth.js`)".
- `.docs/changelog.md` v1.4.0: "Perbaikan: authLimiter ganda pada reset-password dihapus".

**FIX**
Hapus salah satu pemasangan `authLimiter` pada endpoint tersebut di `api/routes/auth.js`.

**VERIFICATION**
Re-verifikasi E2E Sprint 5 setelah audit: **25/25 PASS**, tanpa regresi.

**DO NOT REPEAT**
- ❌ Menumpuk middleware rate limiter yang sama pada satu endpoint.

---

## L-006 — Dev secret JWT tidak boleh bocor ke environment selain development

- Tanggal: 11-08-2026 (hardening audit LOW, Sprint 4)
- Referensi: `.docs/changelog.md` v1.3.0, `server/config.js`

**ROOT CAUSE**
Default secret development (`dev-secret-bernada-jangan-dipakai-produksi`) berisiko terpakai di luar development jika `JWT_SECRET` tidak diisi.

**EVIDENCE**
- `.docs/changelog.md` v1.3.0: "dokumentasi JWT dev secret dipertegas di `server/config.js`".
- `server/config.js`: pada `NODE_ENV=production` server menolak start tanpa `JWT_SECRET`; `.env.example` mewajibkan string acak panjang untuk produksi.

**FIX**
`server/config.js` mewajibkan `JWT_SECRET` saat produksi (throw error bila kosong) dan `.env.example` menegaskan larangan memakai default dev.

**VERIFICATION**
Config production tanpa `JWT_SECRET` gagal start (perilaku kode terverifikasi di `server/config.js`).

**DO NOT REPEAT**
- ❌ Memakai nilai secret default dev di environment selain development.
- ❌ Menulis secret (nilai sebenarnya) ke log/dokumen/knowledge base.

---

## L-007 — Start API server wajib lewat orchestrator detached (readiness-based, exit 0)

- Tanggal: 16-08-2026
- Referensi: `scripts/start-api.ps1`, sesi `ses_ff68a9666ffeL2QN7zYVgDsE90`, `docs/knowledge/incidents.md` (INC-006)

**ROOT CAUSE**
Workflow audit di sesi `ses_ff68a966` menulis teks "Port freed. Starting the server with the fixed code (npm start, logs to temp)." lalu menjalankan perintah `Start-Process node server/index.js` secara ad-hoc lewat tool bash. Tool call-nya tercatat `status="running"` tanpa record completion di `opencode.log` (baris terakhir sesi `07:39:04.587Z`); sesi berakhir abnormal → workflow tampak "macet menunggu server". Tidak ada orchestrator deterministik yang menjamin tool bash kembali ke agent.

**EVIDENCE**
- Part `prt_00982843a001sbD1y4TRF6uTcn` pada sesi `ses_ff68a966` (message `msg_009827b55001l2V1UUUROBWNNJ`) — sumber teks "npm start".
- Tool call `call_00_o4EOU9XVGuJOX52S3ukS9185` di `opencode.db`: `state.status="running"`, tanpa `time.end`.
- `opencode.log` tidak memuat record tool completion untuk sesi tersebut setelah `07:39:04.587Z`.
- Tidak ada script/orchestrator yang menjalankan `npm start` foreground (grep seluruh repo/`.opencode`/`.config/opencode`/Temp); `npm start` hanya disebut di `README.md:62` dan `.opencode/skills/bernada-core/SKILL.md:44`.
- Reproduksi terkontrol port 3001: `scripts/start-api.ps1 -Port 3001` (08:17:51) → `REPRO-DONE`, tool bash kembali seketika. **KOREKSI (INC-007):** run ini adalah path REUSE — PID 17116 sudah hidup sejak spawn ad-hoc 08:04:53 yang HANG 442 detik lalu di-abort. Klaim lama "pola `Start-Process`+redirect TERBUKTI tidak menggantung tool" **SALAH**; kejadian spawn verifikasi (3001/3002/ping) semuanya hang. Mekanisme yang benar: lihat L-008.

**FIX**
Orchestrator reusable `scripts/start-api.ps1 -Port <N>`: (1) reuse server sehat bila ada (cek port LISTENING + `/api/health` status=ok database=connected); (2) bila belum, spawn lewat helper detached `scripts/spawn-api.ps1` (mekanisme anti-hang L-008); (3) tunggu readiness dengan bounded timeout; (4) cetak `STARTED PID=.. / PORT=.. / HEALTH=OK / DB=CONNECTED / REPRO-DONE / EXITCODE=0` lalu exit 0; (5) TIDAK menunggu node exit.

**VERIFICATION**
- `scripts/start-api.ps1 -Port 3001` → `STARTED PID=17116 ... EXITCODE=0`, tool bash kembali seketika (tanpa hang).
- `scripts/start-api.ps1 -Port 3000` → `STARTED PID=7000 ... EXITCODE=0` (path reuse server sehat).
- `npm run test:health` → PASS; `pg_isready` → accepting connections; E2E Sprint 5 → **25/25 PASS**, exit 0.

**DO NOT REPEAT**
- ❌ Menjalankan `npm start` / `node server/index.js` sebagai perintah foreground yang memblokir tool bash — server long-running dan tidak akan exit.
- ❌ Menganggap proses node yang tetap hidup setelah READY sebagai "tool failure"; jangan menunggunya selesai.
- ❌ Menulis teks "starting npm start" padahal perintah aktual berbeda (teks asisten ≠ bukti eksekusi).
- ❌ Kill server yang masih healthy (mis. PID 17116/7000) hanya demi "mengulang start" — reuse lewat orchestrator.

---

## L-008 — Spawn proses long-running di tool bash (Windows): pakai helper detached via `[System.Diagnostics.Process]::Start` + `UseShellExecute=$true`, poll state file

- Tanggal: 16-08-2026
- Referensi: `scripts/spawn-api.ps1`, `scripts/start-api.ps1`, `start-bernada.ps1`, `docs/knowledge/incidents.md` (INC-007)

**ROOT CAUSE**
Tool bash opencode (Windows) menganggap tool SELESAI dari EOF pipe stdout-nya. `Start-Process` dengan `-WindowStyle Hidden` membuat proses anak dengan console baru; `conhost.exe` (console host) mewarisi salinan handle pipe stdout dari shell induk (yang dipakai opencode). Selama anak hidup, salinan pipe itu tidak pernah EOF → tool call tetap `status=running` tanpa `time.end`, walau shell induk sudah keluar. Redirect stdout/stderr anak ke file TIDAK mencegah hang, karena yang memegang pipe adalah conhost, bukan proses anak.

**EVIDENCE**
- 3 kejadian spawn semuanya hang: 08:04:53 (node 3001, PID 17116) → 442s abort; 11:58:10 (node 3002, PID 17900) → 442.6s abort; 12:13:31 (ping -t) → permanen (part `prt_00a7dcd98001MYeC8yIS0WsQwi`, sesi `ses_ff59cd70fffefvlu2oQBf3695m`).
- Semua path SPAWN `start-api.ps1` versi lama (Start-Process+redirect) TIDAK PERNAH sukses lewat tool; yang tampak sukses adalah path REUSE (server sudah hidup dari spawn hang sebelumnya).
- Helper yang diluncurkan via `ProcessStartInfo.UseShellExecute=$true` tidak mewarisi pipe tool → tool call selesai normal.

**FIX**
1. `scripts/spawn-api.ps1` (short-lived): set `$env:PORT` SEBELUM `Start-Process` (node --env-file tidak meng-override env yang sudah ada); spawn node (log file, `-PassThru`, `WindowStyle Hidden`); poll readiness bounded; tulis state file `%TEMP%\opencode\bernada-api-<port>.state` (`PID=..` / `STATUS=READY|FAIL` / `REASON=..`); EXIT. Tidak pernah menunggu node exit.
2. `scripts/start-api.ps1`: path REUSE tidak berubah; path SPAWN meluncurkan helper via `[System.Diagnostics.ProcessStartInfo]` (`UseShellExecute=$true`, `WindowStyle=Hidden`, `WorkingDirectory=$PROJECT`) — jangan pakai `CreateNoWindow` saat `UseShellExecute=$true` (diabaikan); lalu poll state file bounded (sleep 500ms) dan cetak kontrak output + exit 0.
3. `start-bernada.ps1`: delegasi `& scripts\start-api.ps1 -Port 3000 -TimeoutSec 30`, verifikasi ulang health.

**VERIFICATION**
- `& .\scripts\start-api.ps1 -Port 3003 -TimeoutSec 45` (port kosong → path SPAWN): `STARTED PID=11660 / PORT=3003 / HEALTH=OK / DB=CONNECTED / REPRO-DONE / EXITCODE=0`, `TOOL-RETURNED exit=0 elapsed_ms=3997` → tool call SELESAI dalam 4 detik.
- `GET /api/health` 3003 → status=ok database=connected; state file `PID=11660 / STATUS=READY`; tidak ada proses diagnostik tertinggal; server healthy 7000/17116/17900 tetap hidup.

**DO NOT REPEAT**
- ❌ `Start-Process` proses long-running langsung di tool call (terutama `-WindowStyle Hidden`) — hang (conhost pegang pipe); redirect ke file tidak menolong.
- ❌ Menyimpulkan tool "kembali" tanpa bukti `time.end` di `opencode.db`; ❌ mengutip klaim "spawn+redirect aman" (L-007 versi lama).
- ❌ Meluncurkan helper dengan `UseShellExecute=$false` atau `CreateNoWindow` — mengalahkan tujuan detach.

---

## L-009 — Rate limiter in-memory bersifat global per server instance → skrip E2E beruntun saling kena 429

- Tanggal: 16-08-2026
- Referensi: `server/middleware/rate-limit.js`, `scripts/test-f2-hardening.mjs`, `scripts/e2e-sprint7-payment.mjs`, `scripts/e2e-sprint6.mjs`, `.docs/e2e/sprint-7-fase3-verification.md`

**ROOT CAUSE**
Rate limiter in-memory (`state` Map di modul rate-limit.js) hidup di **satu server instance**, bukan per-proses skrip. Bucket `ip:method:basePath` (mis. `POST /api/auth/register` max 10/60s) terakumulasi lintas skrip E2E yang dijalankan beruntun terhadap instance yang sama dalam window 60s. Saat 3 skrip dijalankan (register 3+5+3 = 11 > 10), register terakhir kena 429; helper `api()` di `e2e-sprint6.mjs` menunggu 61s lalu retry — namun skrip `e2e-sprint6.mjs` memakai `regC.data.user.id` **tanpa optional chaining** sehingga data null → `TypeError: Cannot read properties of undefined (reading 'id')` → skrip abort di tengah, cleanup tidak berjalan (data leftover).

**EVIDENCE**
- Run beruntun F3→F2→e2e-sprint6 di :3004: hasil e2e-sprint6 **34/35** dengan error `Cannot read properties of undefined (reading 'id')`; `e2e6.admin` tidak terbuat di DB (register kena 429); leftover 2 user + 1 payment.
- Restart :3004 (bucket reset) lalu jalankan `e2e-sprint6.mjs` sendirian → **38/38 PASS**. Skrip lain pada instance segar: `test-f2-hardening` 21/21, `e2e-sprint7-payment` 15/15.
- `server/middleware/rate-limit.js:3` `const state = new Map();` — state modul di-share seluruh request instance.

**FIX**
Jalankan skrip E2E terhadap **instance server segar** bila dijalankan beruntun dalam ≤60s (restart via `start-api.ps1` → bucket in-memory reset). Untuk skrip baru, akses properti response yang rawan 429 dengan optional chaining (`reg?.data?.user?.id`) atau buat data sebelum dipakai. Simpan hasil run terisolasi sebagai baseline.

**VERIFICATION**
- `e2e-sprint6.mjs` pada instance segar → **38/38 PASS** (2× terverifikasi).
- Fase 2 21/21 & Fase 3 15/15 pada instance segar → PASS.
- Verifikasi akhir DB: `leftover users=0, orders=0, payments=0`.

**DO NOT REPEAT**
- ❌ Menjalankan beberapa skrip E2E beruntun (dalam 1 menit) terhadap instance server yang sama tanpa memperhitungkan bucket limiter yang terakumulasi.
- ❌ Mengakses `data.user.id` tanpa optional chaining pada respons endpoint ber-rate-limit di skrip E2E.
- ❌ Menyimpulkan "regresi produk" dari kegagalan 429 lintas-skrip tanpa uji ulang pada instance segar.

---

## L-010 — Order expiry tanpa background worker: lazy + sweep deterministik (F2-08)

- Tanggal: 16-08-2026
- Referensi: `server/services/order-service.js` (`expireOrderIfDue`, `expireOverdueOrders`), `server/services/payment-service.js` (guard `FOR UPDATE` + in-transaction expiry), `scripts/e2e-sprint7-expiry.mjs`, `.docs/e2e/sprint-7-fase3-verification.md`

**ROOT CAUSE**
Order berbayar yang tidak dibayar bisa menggantung di status `pending`/`awaiting_payment` tanpa batas waktu, padahal kolom `expires_at` sudah ada di schema `0008` namun tidak pernah diisi. Transisi `→ expired` belum didefinisikan, sehingga order kedaluwarsa secara konseptual masih bisa dibuatkan payment/diverifikasi menjadi paid.

**EVIDENCE**
- `database/migrations/0008_orders.sql:22` — kolom `expires_at TIMESTAMPTZ` nullable, tidak pernah di-set (INSERT order-service lama tidak menyertakan `expires_at`).
- Tidak ada mekanisme transisi `awaiting_payment → expired` di service mana pun; `NON_STARTABLE_STATUSES` sudah memuat `'expired'` tetapi status itu tak pernah tercapai.
- Setelah implementasi: `scripts/e2e-sprint7-expiry.mjs` **15/15 PASS** + regression F2 21/21, Fase 3 15/15, Sprint 6 38/38.

**FIX**
1. `expires_at` di-set saat order berbayar dibuat (`config.orderPaymentExpiryHours`, default 24 jam; free auto-paid → `null`).
2. Transisi `pending/awaiting_payment → expired` hanya bila `expires_at <= NOW()` — **lazy**: `expireOrderIfDue(orderId)` dipanggil dari `getOrderById` (scoped), dan **sweep deterministik**: `expireOverdueOrders()` dipanggil dari `listOrders`/`listPayments`. Tanpa setInterval/worker — tidak ada proses latar.
3. Payment pending order yang expired ikut `→ expired` dalam transaksi yang sama.
4. **Anti-race**: `createOrderPayment` me-recheck status+expiry dengan `SELECT … FOR UPDATE` di dalam transaksi; `verifyManualPayment` memeriksa `expires_at` di dalam transaksi dan **mempersist expiry sebelum melempar 409** (commit-before-throw dengan flag `committed` agar catch tidak menjalankan ROLLBACK setelah COMMIT); `UPDATE orders SET status='paid' WHERE status IN ('pending','awaiting_payment')` menjadi backstop — order expired tidak mungkin jadi paid.

**VERIFICATION**
- E2E F2-08 15/15 PASS: expires_at konsisten, lazy expiry (GET), payment expired, guard payment/verify/cancel 409, boundary belum-expired tetap bisa diverifikasi, paid/cancelled tidak ter-expriy, admin list menampilkan `order_status=expired`.
- Full regression pada instance terisolasi: F2 21/21 · Fase 3 15/15 · Sprint 6 38/38; DB bersih 0/0/0.

**DO NOT REPEAT**
- ❌ Commit status `expired` lalu throw di dalam transaksi TANPA commit-before-throw — ROLLBACK di catch akan membatalkan expiry (status tetap `awaiting_payment`); gunakan flag `committed` + `ROLLBACK.catch(()=>{})`.
- ❌ Mengandalkan satu jalur expiry (mis. hanya lazy di getOrderById) tanpa guard DB-level (`WHERE status IN (...)`) pada transisi paid — race dengan verify/expiry bisa meloloskan order kedaluwarsa jadi paid.
- ❌ Membuat `setInterval` worker permanen untuk sweep bila lazy + sweep-on-access sudah memenuhi kebutuhan — pertahankan deterministik & tanpa proses latar.
