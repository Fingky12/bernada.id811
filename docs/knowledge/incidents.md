<!--
  BERNADA.ID KNOWLEDGE BASE
  Document : Incidents · Category : Knowledge (living document)
  Version  : 1.0.0 · Status : ✅ Verified · Update : 16-08-2026
-->

# Incidents — BERNADA.ID

> Log incident yang sudah selesai & terverifikasi. Setiap entry memakai format **lesson capture**:
> ROOT CAUSE / EVIDENCE / FIX / VERIFICATION / DO NOT REPEAT.
> Incident spesifik → file ini. Pola reusable → `lessons-learned.md`.
> Jangan menulis dugaan sebagai fakta; jika ada bagian belum terverifikasi, tandai "belum terverifikasi".

---

## Template Entry Baru

```markdown
### INC-XXX — Judul singkat
- Tanggal: YYYY-MM-DD
- Severity: <low|medium|high|critical>
- Status: ✅ Resolved
- Referensi: <commit/file/.docs>

**ROOT CAUSE**
...
**EVIDENCE**
...
**FIX**
...
**VERIFICATION**
...
**DO NOT REPEAT**
...
```

---

## INC-001 — `23502 not_null_violation` saat create gift account

- Tanggal: 11-08-2026 (Release v1.3.0)
- Severity: medium
- Status: ✅ Resolved
- Referensi: commit `f0f4eeb`, `.docs/changelog.md`, `server/services/gift-account-service.js`

**ROOT CAUSE**
Payload create gift account tanpa `isActive`/`sortOrder` gagal karena kolom `NOT NULL` tanpa default sisi aplikasi → error PostgreSQL `23502`.

**EVIDENCE**
`.docs/changelog.md` v1.3.0: "23502 not_null_violation pada create gift account tanpa isActive/sortOrder → default di gift-account-service.js (`?? true` / `?? 0`)".

**FIX**
Default di service: `isActive = payload.isActive ?? true`, `sortOrder = payload.sortOrder ?? 0`.

**VERIFICATION**
E2E Sprint 4: 21/21 PASS; juga terverifikasi ulang oleh commit `f0f4eeb` (fix default + E2E 21/21 PASS).

**DO NOT REPEAT**
- ❌ Create record dengan kolom `NOT NULL` tanpa memastikan nilai/default.
- ❌ Menerima partial payload tanpa validasi/default di service.

---

## INC-002 — Endpoint publik gift-accounts selalu 401

- Tanggal: 11-08-2026 (Release v1.3.0)
- Severity: medium
- Status: ✅ Resolved
- Referensi: commit `f0f4eeb`, `.docs/changelog.md`

**ROOT CAUSE**
Route publik dideklarasikan setelah `use(requireAuth)` global pada file route, sehingga tanpa JWT request ditolak.

**EVIDENCE**
`.docs/changelog.md` v1.3.0: "publik gift-accounts selalu 401 → route publik dipindah sebelum `use(requireAuth)`".

**FIX**
Pindahkan route publik sebelum middleware auth global; pasang `requireAuth` per-route pada route owner.

**VERIFICATION**
E2E Sprint 4: 21/21 PASS.

**DO NOT REPEAT**
- ❌ Memasang middleware auth global sebelum route publik dalam satu file route.

---

## INC-003 — Trigger `updated_at` salah pada migrasi password reset

- Tanggal: 16-08-2026 (Sprint 5)
- Severity: low
- Status: ✅ Resolved
- Referensi: commit `4eb54d7`, `database/migrations/0006_password_reset_tokens_updated_at.sql`

**ROOT CAUSE**
Migrasi 0005 (`password_reset_tokens`) memiliki trigger `updated_at` yang perlu diperbaiki; mengubah file 0005 yang sudah applied melanggar prinsip append-only.

**EVIDENCE**
Commit `4eb54d7` menyebut "fix trigger updated_at migrasi 0006"; `.docs/e2e/sprint-5-verification.md` mencatat migrasi 0001–0006 applied.

**FIX**
Migrasi baru `0006_password_reset_tokens_updated_at.sql`; jalankan `npm run migrate`.

**VERIFICATION**
`npm run migrate` sukses; E2E Sprint 5 25/25 PASS.

**DO NOT REPEAT**
- ❌ Mengubah isi migrasi yang sudah tercatat applied (lihat L-001).

---

## INC-004 — `authLimiter` ganda pada reset-password (temuan audit LOW)

- Tanggal: 16-08-2026 (Audit Sprint 5)
- Severity: low
- Status: ✅ Resolved
- Referensi: `.docs/audit/LAPORAN-AUDIT-SPRINT-5.html`, `api/routes/auth.js`, `.docs/changelog.md`

**ROOT CAUSE**
`authLimiter` terpasang dua kali pada `POST /api/auth/reset-password`, menyebabkan perilaku rate limiting ganda.

**EVIDENCE**
`.docs/e2e/sprint-5-verification.md` (re-verifikasi pasca-audit): "authLimiter ganda pada reset-password dihapus"; changelog v1.4.0: "24 PASS · 1 WARNING (temuan LOW audit, resolved)".

**FIX**
Hapus salah satu pemasangan `authLimiter` di `api/routes/auth.js`.

**VERIFICATION**
Re-verifikasi E2E Sprint 5: 25/25 PASS tanpa regresi.

**DO NOT REPEAT**
- ❌ Middleware rate limiter ganda pada endpoint yang sama (lihat L-005).

---

## INC-005 — `429 RATE_LIMITED` selama verifikasi E2E beruntun

- Tanggal: 16-08-2026
- Severity: low (perilaku yang diharapkan, bukan bug)
- Status: ✅ Resolved
- Referensi: `.docs/e2e/sprint-5-verification.md`, `scripts/e2e-sprint5.mjs`

**ROOT CAUSE**
Rate limit auth 10/menit memblokir request E2E yang dijalankan beruntun dalam satu menit — perilaku middleware yang benar.

**EVIDENCE**
`.docs/e2e/sprint-5-verification.md` (Temuan): "429 RATE_LIMITED dikembalikan dengan benar (hardening Sprint 4 terkonfirmasi)".

**FIX**
Skrip E2E self-healing: tunggu 61 detik lalu retry sekali saat `429`.

**VERIFICATION**
E2E Sprint 5: 25/25 PASS.

**DO NOT REPEAT**
- ❌ Menganggap 429 sebagai kegagalan E2E; ❌ menonaktifkan rate limiter demi test.

---

## INC-006 — Workflow "macet" setelah start server API di sesi audit (07:39 UTC)

- Tanggal: 16-08-2026
- Severity: medium
- Status: ✅ Resolved
- Referensi: sesi `ses_ff68a9666ffeL2QN7zYVgDsE90`, tool call `call_00_o4EOU9XVGuJOX52S3ukS9185`, fix `scripts/start-api.ps1`, pola reusable `lessons-learned.md` L-007

**ROOT CAUSE**
Workflow audit menjalankan `Start-Process node server/index.js` secara ad-hoc (bukan script) setelah menulis teks "npm start" yang tidak sesuai perintah aktual. Tool call bash tercatat `status="running"` tanpa completion (record terakhir di `opencode.log`: `07:39:04.587Z`); sesi berakhir abnormal sehingga workflow tampak menunggu server yang long-running. Mekanisme pasti terminasi sesi **belum terverifikasi**; yang terverifikasi adalah tidak ada orchestrator deterministik yang mengembalikan kontrol ke agent.

**EVIDENCE**
- Part `prt_00982843a001sbD1y4TRF6uTcn` (sesi `ses_ff68a966`) = teks "Port freed. Starting the server with the fixed code (npm start, logs to temp).".
- Tool call `call_00_o4EOU9XVGuJOX52S3ukS9185`: `state.status="running"`, tanpa `time.end`.
- Reproduksi terkontrol port 3001 (PID 17116): pola yang sama TIDAK hang — tool kembali dengan `REPRO-DONE`; server sehat (health=ok, db=connected, CPU idle).

**FIX**
- Buat orchestrator `scripts/start-api.ps1 -Port <N>`: detached start/reuse, capture PID, tunggu readiness (process + port + health + db), cetak output terstruktur, exit 0, tidak menunggu node exit.
- Panduan: jangan pernah memulai server via perintah foreground yang memblokir tool; selalu pakai orchestrator.

**VERIFICATION**
- `scripts/start-api.ps1 -Port 3001` → `STARTED PID=17116 / PORT=3001 / HEALTH=OK / DB=CONNECTED / REPRO-DONE / EXITCODE=0`, tool kembali seketika.
- `scripts/start-api.ps1 -Port 3000` → `STARTED PID=7000 ... EXITCODE=0` (reuse).
- `npm run test:health` PASS; `pg_isready` OK; E2E Sprint 5 **25/25 PASS**, exit 0.

**DO NOT REPEAT**
- ❌ Start server API via perintah ad-hoc/foreground tanpa orchestrator (lihat L-007).
- ❌ Membunuh server healthy untuk "mengulang start" — reuse.
- ❌ Mengutip teks asisten sebagai bukti perintah yang dieksekusi tanpa memeriksa tool call di DB.

---

## INC-007 — Tool bash hang permanen setelah spawn proses long-running (conhost mewarisi pipe stdout)

- Tanggal: 16-08-2026
- Severity: high (3 kejadian; 2 aborted 442s, 1 permanen → sesi dibuka ulang)
- Status: ✅ Resolved
- Referensi: sesi `ses_ff59cd70fffefvlu2oQBf3695m`, part `prt_00a7dcd98001MYeC8yIS0WsQwi`; fix `scripts/spawn-api.ps1` + `scripts/start-api.ps1` + `start-bernada.ps1`; pola reusable `lessons-learned.md` L-008

**ROOT CAUSE**
Tool bash opencode (Windows) menganggap tool selesai dari EOF pipe stdout-nya. `Start-Process` (pola `-WindowStyle Hidden`) membuat proses anak ber-console baru; `conhost.exe` mewarisi salinan handle pipe stdout dari shell induk yang dipakai opencode. Selama anak hidup, pipe tidak EOF → tool call tetap `status=running` tanpa `time.end`, walau shell induk sudah keluar. Redirect stdout/stderr ke file tidak mencegah hang karena yang memegang pipe adalah conhost, bukan anak.

**EVIDENCE**
- `prt_00a7dcd98001MYeC8yIS0WsQwi` (12:13:31 UTC): `Start-Process ping.exe -t 127.0.0.1 -RedirectStandardOutput ... -RedirectStandardError ... -WindowStyle Hidden -PassThru`, output `SPAWNED PID=7296 elapsed=77ms` → status=running tanpa end; log berhenti setelah permission eval.
- PING.EXE 7296 (mulai 19:13:34 lokal) + conhost.exe 15120 masih hidup berjam-jam kemudian; baru dibunuh saat diagnosa sesi baru.
- Tiga kejadian spawn verifikasi: 08:04:53 (node 3001, PID 17116) hang 442s → abort; 11:58:10 (node 3002, PID 17900) hang 442.6s → abort; 12:13:31 (ping) permanen.
- Klaim "REPRO-DONE membuktikan Start-Process+redirect aman" (INC-006/L-007 lama) SALAH: run yang completed (08:17:51) adalah path REUSE; path SPAWN tidak pernah sukses lewat tool.

**FIX**
- Helper `scripts/spawn-api.ps1` (short-lived): set `$env:PORT` sebelum `Start-Process`; spawn node (log file, `-PassThru`); poll readiness bounded; tulis state file `%TEMP%\opencode\bernada-api-<port>.state` (`PID=.. / STATUS=READY|FAIL`); EXIT sendiri; tidak menunggu node exit.
- `scripts/start-api.ps1` meluncurkan helper via `[System.Diagnostics.Process]::Start` dengan `UseShellExecute=$true` + `WindowStyle=Hidden` (tidak mewarisi pipe tool), lalu poll state file bounded, cetak kontrak output, exit 0. Path REUSE tidak berubah.
- `start-bernada.ps1`: ganti blok Start-Process+loop dengan panggilan `scripts\start-api.ps1 -Port 3000 -TimeoutSec 30`.

**VERIFICATION**
- `& .\scripts\start-api.ps1 -Port 3003 -TimeoutSec 45` (port kosong → path SPAWN) → `STARTED PID=11660 / PORT=3003 / HEALTH=OK / DB=CONNECTED / REPRO-DONE / EXITCODE=0`; `TOOL-RETURNED exit=0 elapsed_ms=3997` → tool call SELESAI.
- `GET /api/health` 3003 → status=ok database=connected; state file `PID=11660 / STATUS=READY`.
- Cleanup: node 11660 + conhost verifikasi hilang; ping=0; helper keluar; server healthy 7000/17116/17900 tetap hidup dan sehat (3002 ok).

**DO NOT REPEAT**
- ❌ `Start-Process` proses long-running langsung di tool call (terutama yang bikin console baru) — hang; redirect tidak menolong.
- ❌ Menganggap "Start-Process+redirect TERBUKTI aman" tanpa memeriksa path mana (reuse/spawn) yang benar-benar tereksekusi di DB.
- ❌ Menyimpulkan tool "kembali" tanpa bukti `time.end` di `opencode.db`.
