---
name: troubleshooting
description: Use when diagnosing an incident, bug, or unexpected failure in BERNADA.ID — gathering evidence, checking health, analyzing logs, finding root cause, and recording the resolved incident. Trigger on "bug", "error", "500", "503", "degraded", "crash", "incident", "troubleshoot", "diagnosa", "gagal", "FAIL".
---

# Troubleshooting (Incident Diagnosis)

> Diagnosis dulu, jangan retry membabi buta. Setiap incident yang selesai harus bisa diringkas menjadi entry reusable.

---

## 1. Alur Diagnosis (wajib dalam urutan)

1. **Identifikasi gejala** — apa yang gagal: HTTP status, error message, kapan mulai terjadi.
2. **Cek health dulu** (bukan menyentuh service):
   ```powershell
   npm run test:health
   ```
   - FAIL → cek skill `postgres-windows` (service, port 5432) sebelum menyentuh aplikasi.
   - PASS tapi fitur gagal → masalah di logika/API, bukan infrastruktur.
3. **Kumpulkan bukti** — log server (console), error response API, output skrip, error database (`dbErrorMessage` di `server/db.js`).
4. **Cek perubahan terbaru** — `git log --oneline -10`; seringkali bug muncul dari perubahan terakhir (regresi).
5. **Cek knowledge base** — apakah masalah terkait pernah terjadi? Lihat `docs/knowledge/lessons-learned.md` & `incidents.md`; ikuti solusi yang terbukti, jangan ulangi yang gagal.
6. **Cari root cause** — jangan berhenti di perbaikan gejala.
7. **Verifikasi fix** — jalankan test relevan (`npm run test:health`, E2E).
8. **Rekam incident** — format di §3.

## 2. Anti-pattern (dilarang)

- ❌ Restart service berulang tanpa diagnosis.
- ❌ `npm install` sebagai langkah pertama troubleshooting.
- ❌ Menghapus file server (mis. `postmaster.pid`) tanpa bukti.
- ❌ Mengubah kode tanpa memahami root cause.
- ❌ Menyatakan selesai tanpa verifikasi.

## 3. Format Lesson Capture (wajib untuk setiap incident selesai)

```markdown
### [KODE] — Judul singkat
- Tanggal: YYYY-MM-DD
- Referensi: <file/commit/test yang membuktikan>

**ROOT CAUSE**
<jelaskan akar masalah>

**EVIDENCE**
<bukti terverifikasi: pesan error, output, commit hash, hasil test>

**FIX**
<solusi yang terbukti bekerja — command/kode/pola>

**VERIFICATION**
<cara membuktikan fix berhasil — test/command + hasil>

**DO NOT REPEAT**
<command/perilaku yang tidak boleh diulang>
```

Simpan di `docs/knowledge/incidents.md` (incident spesifik) dan/atau `docs/knowledge/lessons-learned.md` (pola reusable).

## 4. Pengelompokan Domain

| Domain | Skill |
| --- | --- |
| Bug perilaku project / API / UI | `bernada-core` |
| Masalah PostgreSQL / Windows / koneksi | `postgres-windows` |
| Masalah database safety / data | `safe-db-operations` |
| Regression / E2E | `e2e-testing` |
| Diagnosis umum | skill ini (`troubleshooting`) |

## 5. Prinsip

- **Jangan mencatat dugaan sebagai fakta.** Hanya yang terverifikasi masuk knowledge base.
- Root cause yang belum ditemukan → tulis "belum terverifikasi" — jangan mengarang penyebab.
- Satu incident → satu entry reusable yang jelas.
