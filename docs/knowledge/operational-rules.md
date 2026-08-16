<!--
  BERNADA.ID KNOWLEDGE BASE
  Document : Operational Rules · Category : Knowledge
  Version  : 1.0.0 · Status : ✅ Verified · Update : 16-08-2026
-->

# Operational Rules — BERNADA.ID

> Aturan operasional yang harus diikuti OpenCode saat bekerja di project ini.
> Ringkasan cepat ada di `AGENTS.md` §5. Detail di sini.

---

## 1. Prinsip Dasar

- **Knowledge reuse first**: sebelum perubahan besar, cek knowledge base; setelah selesai, rekam hasil.
- **Jangan mencatat dugaan sebagai fakta** — hanya yang terverifikasi.
- **Verifikasi sebelum menyatakan selesai** — setiap perubahan wajib diuji (lihat `.ai/rules/08-testing.md`).

## 2. PostgreSQL di Windows

1. Cek server running:
   ```powershell
   Get-Service -Name "*postgres*"
   Get-NetTCPConnection -LocalPort 5432 -State Listen
   ```
2. Cek readiness: `pg_isready -h localhost -p 5432 -U bernada` (jika tersedia) atau `npm run test:health`.
3. **Reuse jika sehat** — jangan start instance kedua.
4. Jangan stop service yang bukan dibuat oleh workflow ini.
5. Jangan paksa hapus `postmaster.pid`.
6. Masalah koneksi → diagnosis (§2 langkah 1–2) sebelum menyentuh apa pun.

## 3. Database Safety

Tanpa verifikasi (health check + backup + dampak teridentifikasi), **DILARANG**:

- Drop database / drop tabel.
- Truncate produksi.
- Update/delete massal tanpa `WHERE`.
- Mengubah migrasi yang sudah diterapkan.

**Jalur resmi untuk perubahan skema:**

1. Buat `database/migrations/000N_*.sql` (append-only, nomor urut berikutnya).
2. Jalankan `npm run migrate` (transaction per file + tercatat di `schema_migrations`).
3. Verifikasi dengan query read-only / health check.

**Backup** sebelum operasi destruktif (contoh: `pg_dump` ke luar repo — lokasi sementara: `C:\Users\User\AppData\Local\Temp\opencode`).

## 4. E2E / Regression

Urutan wajib:
1. Health check database.
2. Health check API: `npm run test:health` (harus PASS, `database=connected`).
3. Baru jalankan test (mis. `node --env-file-if-exists=.env scripts/e2e-sprint5.mjs`).

Jika gagal: **diagnosis dulu** (log, status, lesson terdahulu), jangan retry membabi buta. Retry hanya untuk kondisi transien (rate limit sudah ditangani skrip: tunggu 61s, retry sekali).

## 5. Troubleshooting Umum

- Jangan reinstall dependency sebagai langkah pertama.
- Jangan restart service berulang tanpa diagnosis.
- Cek perubahan terakhir: `git log --oneline -10`.
- Cek knowledge base (`lessons-learned.md`, `incidents.md`) sebelum mencoba solusi baru.
- Setiap fix harus punya root cause, bukan sekadar meredam gejala.

## 6. Lesson Capture (wajib setelah masalah selesai)

Entry dengan bagian wajib: **ROOT CAUSE, EVIDENCE, FIX, VERIFICATION, DO NOT REPEAT**.
- Incident spesifik → `docs/knowledge/incidents.md`.
- Pola reusable → `docs/knowledge/lessons-learned.md`.
- Command valid dan command berbahaya harus dicatat.

## 7. Perubahan Aturan / Skill

- Jangan ubah `AGENTS.md` atau skill inti otomatis hanya karena satu eksperimen.
- Menemukan pola baru → **usulkan update skill** (jelaskan perubahan), setelah disetujui manusia baru simpan.
- Perubahan permanen butuh bukti kuat & persetujuan; jangan hapus aturan lama tanpa alasan.

## 8. Keamanan

- Jangan commit `.env`, secret, credential.
- Jangan tulis secret/password ke log, knowledge base, atau dokumen.
- Periksa `git status` & `git diff` sebelum commit; AI hanya commit atas perintah eksplisit (`.ai/rules/06-git-workflow.md`).
- Secret development (mis. dev JWT secret) tidak boleh dipakai di environment lain.

## 9. Setelah Setiap Perubahan

1. Jalankan test yang relevan (`npm run test:health`; E2E bila menyentuh auth/admin/DB).
2. Simpan hasil verifikasi.
3. Update knowledge base hanya jika hasil benar-benar terbukti.
