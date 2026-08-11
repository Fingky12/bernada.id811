# BERNADA.ID

Digital Wedding Invitation Platform

---

## Version

v1.3.0 (The Guest Experience)

---

## Tech Stack

Frontend

- HTML
- CSS
- JavaScript

Backend

- Node.js
- Express

Database

- PostgreSQL

---

## Menjalankan di Lokal

### Frontend

- `index.html` — landing page (buka langsung di browser, atau disajikan server).
- `/login` — halaman masuk / daftar (`pages/login.html`).
- `/builder` — dasbor & editor undangan (`pages/builder.html`).
- `/u/:slug` — halaman publik undangan (`pages/invitation.html`).

### Backend (API)

```bash
npm install          # instal dependency
cp .env.example .env # buat file konfigurasi, sesuaikan nilainya
npm run dev          # jalankan server (http://localhost:3000)
```

### Database (PostgreSQL)

```bash
npm run db:create    # buat database (dibaca dari DATABASE_URL)
npm run migrate      # jalankan migrasi skema (database/migrations/)
```

### Script

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan server (auto-restart) |
| `npm start` | Jalankan server produksi |
| `npm run db:create` | Buat database PostgreSQL |
| `npm run migrate` | Jalankan migrasi skema |
| `npm run test:health` | Health check otomatis (PASS/FAIL) |

### Health Check

`GET http://localhost:3000/api/health` — status `ok` (200) bila database terhubung, `degraded` (503) bila belum.

### Alur Penggunaan

1. Buka `/login` → daftar akun baru.
2. Masuk ke `/builder` → "Buat Undangan" → isi detail, pilih template, sesuaikan tema → simpan.
3. Di "Kelola": tambah daftar tamu (tunggal/bulk) & kelola amplop digital (rekening transfer).
4. "Terbitkan" → bagikan link `/u/<slug>` ke tamu.
5. Tamu membuka link: melihat undangan, konfirmasi kehadiran & menulis buku tamu, dan melihat amplop digital untuk kirim kado.

> Catatan: halaman publik `/u/:slug` tetap bisa dilihat lewat data demo bawaan (`assets/js/demo-invitations.js`) saat API tidak aktif.

---

## Dokumentasi

Dokumentasi engineering ada di `.docs/` (arsitektur, database, API, sprint, roadmap) dan konteks AI di `.ai/`.

---

Developed by

BERNADA.ID
