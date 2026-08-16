---
name: postgres-windows
description: Use when dealing with PostgreSQL on Windows in this project — checking if the server is running, readiness checks, connection issues, port conflicts, reusing an existing server instance, and avoiding starting duplicate instances. Trigger on "postgres", "postmaster", "pg_isready", "5432", "DATABASE_URL", "connection refused", "ECONNREFUSED", "could not connect".
---

# PostgreSQL di Windows (Project BERNADA.ID)

> Aturan inti: **cek dulu, reuse jika sehat, jangan mulai instance kedua, jangan berhentikan service yang bukan dibuat workflow ini.**

---

## 1. Konfigurasi Terverifikasi (dari .env.example, .docs/architecture.md)

- Koneksi: `postgresql://bernada:bernada@localhost:5432/bernada`.
- PostgreSQL lokal **18.4** (via scoop) — satu instance, port `5432`.
- Tooling project: `npm run db:create` (buat DB via koneksi admin ke DB `postgres`) dan `npm run migrate` (migrasi 0001–0006).

## 2. Urutan Cek (lakukan SEBELUM menyentuh apa pun)

```powershell
# 1) Apakah service PostgreSQL ada & sedang berjalan?
Get-Service -Name "*postgres*"

# 2) Cek port 5432 yang sedang listen (proses mana yang memakainya)
Get-NetTCPConnection -LocalPort 5432 -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess

# 3) Cek readiness lewat pg_isready (jika ada di PATH)
pg_isready -h localhost -p 5432 -U bernada

# 4) Cek dari sisi aplikasi
npm run test:health
```

**Kesimpulan yang valid:**
- Jika service/port hidup → server sehat → langsung pakai, JANGAN start instance baru.
- Jika `Get-Service` kosong → cek scoop (`scoop list | Select-String postgres`) dan PATH sebelum menginstal ulang.
- Jika app belum terhubung padahal server hidup → masalah di kredensial/nama DB/`DATABASE_URL`, bukan di server.

## 3. Readiness & Health

- Endpoint aplikasi: `GET /api/health` → `database: "connected"` bila koneksi DB ok, `degraded` (503) bila tidak.
- `npm run test:health` → PASS/FAIL dengan exit code 1 bila gagal.
- Server aplikasi tetap hidup saat DB mati (lazy pool di `server/db.js`) — health endpoint adalah sumber kebenaran status DB, bukan hidup/tidaknya proses node.

## 4. Dilarang (berdasarkan aturan knowledge base)

- ❌ Menghapus `postmaster.pid` secara paksa untuk "menghidupkan ulang" — bisa korup data; diagnosis dulu.
- ❌ `DROP DATABASE` / `TRUNCATE` data produksi tanpa verifikasi & backup.
- ❌ Me-start instance PostgreSQL kedua hanya karena koneksi gagal (cek §2 dulu).
- ❌ Menghentikan service PostgreSQL yang bukan dibuat oleh workflow ini (misal service sistem/instalasi scoop lain) tanpa persetujuan.
- ❌ Menginstal ulang dependency (npm install) sebagai langkah pertama troubleshooting.

## 5. Diagnosis Cepat

| Gejala | Penyebab umum | Langkah verifikasi |
| --- | --- | --- |
| `ECONNREFUSED 127.0.0.1:5432` | Server tidak jalan / port beda | Cek §2.1–2.2, pastikan satu instance listen di 5432 |
| `password authentication failed` | Kredensial salah di `.env` | Bandingkan `DATABASE_URL` dengan kredensial instance |
| `database "bernada" does not exist` | DB belum dibuat | Jalankan `npm run db:create` (aman, idempotent) |
| Server hidup tapi health `degraded` | DB down atau URL salah | Lihat log server + cek service/port DB |

## 6. Catatan Keamanan

- Jangan pernah menampilkan / menulis password dari `.env` ke log atau knowledge base.
- Operasi yang mengubah data wajib melalui aturan `safe-db-operations` dan mendapat verifikasi.
