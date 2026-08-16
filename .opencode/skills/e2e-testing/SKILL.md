---
name: e2e-testing
description: Use when running or writing end-to-end verification in BERNADA.ID — regression checks, health checks before tests, E2E scripts, interpreting PASS/FAIL results, handling rate limits. Trigger on "e2e", "regression", "test:health", "verifikasi", "sprint-5", "scripts/e2e-sprint5.mjs", "PASS", "FAIL", "429".
---

# E2E Testing (BERNADA.ID)

> Urutan wajib: **health check database → health check API → baru jalankan test.**
> Jika gagal, diagnosis dulu — **jangan retry membabi buta.**

---

## 1. Prasyarat sebelum test

```powershell
# 1) Server aplikasi berjalan
#    Pastikan: GET http://localhost:3000/api/health → 200 {status:"ok", database:"connected"}
npm run test:health

# 2) Kalau health FAIL → JANGAN jalankan E2E. Diagnosis:
#    - Cek service/port PostgreSQL (lihat skill postgres-windows)
#    - Cek migrasi: npm run migrate
#    - Cek log server
```

Health check harus **PASS** (`database=connected`) sebelum test apa pun.

## 2. Skrip E2E yang Ada (terverifikasi)

- `scripts/e2e-sprint5.mjs` — verifikasi reset password + admin dashboard.
  ```bash
  node --env-file-if-exists=.env scripts/e2e-sprint5.mjs
  ```
- `npm run test:health` — health check otomatis (`scripts/health-check.mjs`).

Fakta terverifikasi dari `.docs/e2e/sprint-5-verification.md`:
- Hasil baseline: **25/25 PASS** (16-08-2026), dan 21/21 PASS untuk Sprint 4.
- Skrip self-healing terhadap rate limit: saat menerima `429`, menunggu **61 detik** lalu retry **sekali**.
- Data test dibuat unik (suffix timestamp) dan dibersihkan di akhir (hapus user test — cascade).
- Skrip dipakai ulang sebagai regression check setelah perubahan.

## 3. Alur jika test gagal

1. **Catat kegagalan apa adanya** — jangan disembunyikan.
2. Diagnosis berdasarkan output: HTTP status, error code, log server, log DB.
3. Cek apakah ada lesson terkait di `docs/knowledge/lessons-learned.md`.
4. Perbaiki root cause, jalankan ulang.
5. Retry maksimal sekali untuk kondisi transien (rate limit sudah ditangani skrip). Retry berulang tanpa diagnosis = dilarang.
6. Setelah hijau, rekam hasil.

## 4. Menulis test E2E baru

- Ikuti pola `scripts/e2e-sprint5.mjs`: helper `api()`, pencatatan hasil per langkah (`record`), akumulasi PASS/FAIL.
- Health check di langkah pertama.
- Buat data unik per-run; bersihkan data test di akhir.
- Tangani rate limit (tunggu window 61s, retry sekali).
- Simpan hasil di `.docs/e2e/<sprint>-verification.md` dengan tabel langkah + status.

## 5. Setelah perubahan kode

- Jalankan `npm run test:health` minimal.
- Jalankan `node --env-file-if-exists=.env scripts/e2e-sprint5.mjs` sebagai regression jika perubahan menyentuh auth, admin, reset password, atau DB schema.
- Simpan hasil verifikasi (perintah yang valid + hasilnya) ke knowledge base hanya jika benar-benar terbukti.

## 6. Anti-pattern (dilarang)

- ❌ Test tanpa health check DB/API dulu.
- ❌ Retry membabi buta / menambah timeout agar test "lolos" padahal ada bug.
- ❌ Menyatakan PASS padahal belum menjalankan.
- ❌ Mengabaikan kegagalan yang sudah terlihat.
