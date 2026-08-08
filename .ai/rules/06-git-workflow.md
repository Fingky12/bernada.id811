<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Rule - Git Workflow · Category : Rules
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# 06 — Git Workflow

> Alur git yang rapi menjaga sejarah project tetap bersih dan mudah ditelusuri. **AI tidak boleh commit / push tanpa perintah eksplisit dari manusia.**

---

## 1. Prinsip

- Setiap perubahan besar dikerjakan di **branch terpisah**, bukan langsung di main.
- Commit kecil dan bermakna — satu commit, satu tujuan.
- Riwayat (history) adalah dokumentasi; jangan merusaknya dengan force-push.
- Semua keputusan besar terekam melalui commit message yang jelas.

## 2. Branch

| Branch | Fungsi |
| --- | --- |
| `main` | Produksi / stabil. Dilarang commit langsung |
| `develop` (jika ada) | Integrasi pengembangan |
| `feature/<nama>` | Fitur baru |
| `fix/<nama>` | Perbaikan bug |
| `refactor/<nama>` | Refactor |
| `docs/<nama>` | Perubahan dokumentasi |

## 3. Commit Message

Format konvensional (semantic commit):

```
<type>(<scope>): <deskripsi singkat>

contoh:
feat(invitation): tambah halaman detail undangan
fix(api): perbaiki validasi email pada registrasi
refactor(css): gunakan design token pada kartu
docs(design-system): tambah panduan spacing
```

| Type | Arti |
| --- | --- |
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `refactor` | Perubahan struktur tanpa mengubah perilaku |
| `docs` | Dokumentasi |
| `style` | Format / gaya tanpa logika |
| `test` | Penambahan pengujian |
| `chore` | Tugas pendukung |

## 4. Alur Kerja

```
1. Buat branch dari main (git checkout -b feature/...)
2. Kerjakan sesuai workflow (rules/00)
3. Self review (rules/09) sebelum commit
4. Commit kecil dengan pesan konvensional
5. Pull request / review oleh manusia
6. Setelah disetujui, merge
```

## 5. Aturan Wajib

- **Jangan commit secret / credential.**
- **Jangan commit file sampah** (node_modules, .env, dsb.) — pastikan `.gitignore` benar.
- **Jangan mengubah riwayat publik** (amend/force-push) tanpa persetujuan.
- Cek `git status` dan `git diff` sebelum commit — jangan commit barang yang tidak diinginkan.
- AI menulis commit hanya jika manusia memintanya.

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
