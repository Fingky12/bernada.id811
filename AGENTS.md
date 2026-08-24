# AGENTS.md — BERNADA.ID Knowledge & Skill System

> Instruksi untuk OpenCode (AI agent) agar setiap masalah yang selesai menjadi **pengetahuan reusable** pada sesi berikutnya.

## Fakta Teknis Kunci (terverifikasi)

- **Stack**: Node ≥22 ESM (`"type": "module"`), Express 5, PostgreSQL lokal (v18.4, scoop), tanpa ORM (`pg` + SQL mentah), tanpa build step frontend.
- **Env**: semua script memuat `.env` via flag native `--env-file-if-exists=.env` — bukan `dotenv`. Jangan tambah library env.
- **Entrypoint**: `server/index.js` → `server/app.js`; pool DB lazy di `server/db.js` (server tetap hidup saat DB mati — jangan asumsikan DB down hanya karena `/api/health` hidup).
- **Verifikasi** (tidak ada lint/test framework): urutan wajib
  1. DB ready (`pg_isready`, lihat skill `postgres-windows`)
  2. `npm run test:health` (exit 1 = FAIL)
  3. Sentuh auth/admin/DB → `node --env-file-if-exists=.env scripts/e2e-sprint5.mjs`
- **Migrasi**: append-only, file baru `database/migrations/00NN_*.sql` + `npm run migrate`. Dilarang edit/hapus file yang sudah tercatat di `schema_migrations` (lesson L-001).
- **Start/stop stack lengkap** (PostgreSQL + API): `start-bernada.ps1` / `stop-bernada.ps1` di root. Script ini tahu path scoop & reuse instance berjalan — pakai, jangan bikin start instance sendiri.
- **Rate limit in-memory per IP** (auth 10/mnt) → E2E beruntun bisa kena `429`; skrip sudah self-heal (tunggu 61s, retry sekali). Jangan matikan rate limiter agar test lolos (L-002).
- **Versi**: percaya `package.json`, bukan header versi di README (README sering telat update).
- **Admin CLI**: `npm run admin:promote -- <email>`.

---

## Hierarki Sumber Kebenaran

1. `.ai/rules/00-opencode.md` — Constitution AI (tertinggi) + `.ai/rules/*`.
2. `AGENTS.md` (file ini) — alur kerja knowledge.
3. `.opencode/skills/*` — skill khusus domain.
4. `docs/knowledge/*` — knowledge base: lessons, incidents, architecture, operational rules.
5. `.ai/context/*`, `.docs/*` — konteks & dokumentasi project.

Konflik antar aturan → yang lebih tinggi menang (lihat Constitution §2).

## 2. Sebelum Perubahan(WAJIB)

1. Baca `AGENTS.md`.
2. Muat skill yang relevan dengan domain perubahan:
   - Perilaku project / API / UI → `bernada-core`
   - PostgreSQL di Windows → `postgres-windows`
   - Verifikasi/regression → `e2e-testing`
   - Operasi database → `safe-db-operations`
   - Diagnosa incident → `troubleshooting`
3. Baca `docs/knowledge/lessons-learned.md` — cek apakah masalah terkait pernah terjadi.
4. Kalau ada lesson relevan → ikuti solusi yang terbukti; jangan ulangi solusi yang gagal.

## 3. Setelah Menyelesaikan Masalah (WAJIB Rekam)

Tulis entry dengan format **lesson capture** (bagian wajib):

```markdown
**ROOT CAUSE**
**EVIDENCE**
**FIX**
**VERIFICATION**
**DO NOT REPEAT**
```

Isi wajib: root cause, bukti (file/commit/test), solusi terbukti, solusi yang gagal, command valid, command berbahaya yang tidak boleh diulang. Simpan di `docs/knowledge/incidents.md` (incident) dan/atau `lessons-learned.md` (pola reusable).

## 4. Aturan Fakta

- **Jangan mencatat dugaan sebagai fakta.** Hanya yang terverifikasi masuk knowledge base.
- Hal yang belum terverifikasi → tandai "belum terverifikasi", jangan mengarang.
- Jangan mengubah `AGENTS.md` atau skill inti otomatis hanya karena satu eksperimen. Perubahan aturan permanen butuh bukti kuat dan persetujuan manusia.
- Menemukan pola baru → **usulkan update skill** (tunjukkan perubahan yang akan dilakukan), setelah disetujui baru simpan.

## 5. Aturan Operasional (ringkas — detail di docs/knowledge/operational-rules.md)

**PostgreSQL:**

- Cek server running → cek readiness → reuse jika sehat.
- Jangan start instance kedua; jangan stop service yang bukan dibuat workflow ini.
- Jangan paksa hapus `postmaster.pid`.

**Database safety:**

- Tanpa verifikasi → dilarang: drop database, truncate produksi, delete massal tanpa WHERE, ubah migrasi yang sudah diterapkan.
- Gunakan jalur resmi: migrasi baru `database/migrations/000N_*.sql` + `npm run migrate`.

**E2E:**

- Urutan: health check DB → health check API (`npm run test:health`) → baru test.
- Gagal → diagnosis dulu, jangan retry membabi buta.

**Umum:**

- Jangan reinstall dependency sebagai langkah pertama.
- Jangan restart service berulang tanpa diagnosis.

## 6. Setelah Setiap Perubahan

- Jalankan test yang relevan (`npm run test:health`, E2E bila menyentuh auth/admin/DB).
- Simpan hasil verifikasi.
- Update knowledge base hanya jika hasil benar-benar terbukti.

## 7. Keamanan

- Jangan commit `.env`, secret, credential.
- Jangan tulis secret/password ke log, knowledge base, atau dokumen.
- Periksa `git status` dan `git diff` sebelum commit. AI hanya commit atas perintah eksplisit manusia (lihat `.ai/rules/06-git-workflow.md`).

---

## 8. WORKFLOW KERJA BERNADA.ID — WAJIB

Workflow ini berlaku untuk SETIAP perubahan tanpa membedakan besar/kecil:
feature, bug fix, UI/UX, refactor, audit, maintenance, konfigurasi,
dokumentasi, maupun perubahan lainnya.

### Urutan wajib

1. PAHAMI
   - Pahami tujuan dan scope task.
   - Jangan memperluas pekerjaan tanpa instruksi.

2. BACA KONTEKS RELEVAN
   - Baca hanya file, skill, dan dokumentasi yang diperlukan.
   - Jangan membaca seluruh project jika tidak relevan.

3. KERJA
   - Lakukan perubahan sesuai scope dan aturan BERNADA.ID.
   - Jangan mengerjakan pekerjaan tambahan di luar scope.
   - Audit (lihat `.ai/rules/10-engineering-workflow.md`)

4. VERIFY
   - Jalankan verification/test yang relevan terhadap perubahan.
   - Jangan menyatakan PASS jika belum diverifikasi.
   - Jika gagal, diagnosis dan perbaiki sebelum menyatakan selesai.

5. PROJECT HISTORY
   - Setelah pekerjaan selesai dan verification PASS,
     TAMBAHKAN history baru ke `.docs/PROJECT-STATE.md`.
   - Jangan menghapus, menimpa, atau mengganti history sebelumnya.
   - Catat hanya pekerjaan yang benar-benar selesai.

6. REPORT
   Report wajib mencantumkan:
   - pekerjaan yang dilakukan
   - file yang berubah
   - verification yang dijalankan
   - hasil verification
   - status akhir

7. STOP
   - Setelah report selesai, STOP.
   - Jangan otomatis melanjutkan task, sprint, audit, atau pekerjaan lain.
   - Tunggu instruksi berikutnya dari manusia.

8. LANJUT Kerjakan/NANTI
   1. Commit & push Github?
   2. Cantumkan List Progress yang menggantung/Belom PASS & List Kerjaan saat ini belom clear
   3. List Perbaikan Bug/Error saat ini, Perbaiki?
   4. Berikan Plan-Plan Berikutnya Yang Dikerjakan Setelah Ini (Tergantung Keputusan)

PRINSIP UTAMA:
Setiap perubahan harus mengikuti aturan project, scope task,
verification, project history, dan workflow di atas.
