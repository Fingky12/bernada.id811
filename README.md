# BERNADA.ID

Digital Wedding Invitation Platform

---

## Version

v1.1.0

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

### Frontend (Landing Page)

Buka `index.html` langsung di browser, atau sajikan dengan server statis apa pun.

### Backend (API)

```bash
npm install          # instal dependency
cp .env.example .env # buat file konfigurasi, sesuaikan nilainya
npm run dev          # jalankan server (http://localhost:3000)
```

### Database (PostgreSQL)

Database Postgres belum diinstall di mesin pengembangan — install dulu lalu:

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

### Health Check

`GET http://localhost:3000/api/health` — status `ok` (200) bila database terhubung, `degraded` (503) bila belum.

---

## Dokumentasi

Dokumentasi engineering ada di `.docs/` (arsitektur, database, API, sprint, roadmap) dan konteks AI di `.ai/`.

---

Developed by

BERNADA.ID
