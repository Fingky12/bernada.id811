---
name: safe-db-operations
description: Use for any database write/change operation in BERNADA.ID — migrations, inserts, updates, deletes, schema changes, backups. Trigger on "DROP", "TRUNCATE", "DELETE", "ALTER", "migrasi", "migration", "postmaster.pid", "backup", "schema", "rollback", "database operation".
---

# Safe Database Operations

> Prinsip: **tidak ada destructive database operation tanpa verifikasi.**

---

## 1. Dilarang tanpa verifikasi

- ❌ Menghapus `postmaster.pid` secara paksa.
- ❌ `DROP DATABASE` / `DROP TABLE` pada data yang masih dipakai.
- ❌ `TRUNCATE` data (termasuk tabel produksi).
- ❌ `UPDATE`/`DELETE` massal tanpa `WHERE` yang jelas dan tanpa backup.
- ❌ Mengubah migrasi yang sudah diterapkan (append-only — buat file migrasi baru).
- ❌ Menjalankan operasi berbahaya langsung dari psql tanpa backup & konfirmasi.

## 2. Prosedur aman (wajib)

1. **Baca dulu** `docs/knowledge/operational-rules.md` + cek lesson terkait.
2. **Identifikasi dampak**: tabel apa, berapa baris, siapa yang terpengaruh.
3. **Backup** sebelum perubahan destruktif (mis. `pg_dump` hanya tabel/DB yang dimaksud, ke file di luar repo).
4. **Gunakan jalur resmi project** untuk perubahan skema: buat `database/migrations/000N_*.sql` lalu `npm run migrate` — runner membungkus tiap file dalam transaksi (BEGIN/COMMIT/ROLLBACK) dan mencatatnya di `schema_migrations`.
5. **Verifikasi hasil** dengan query read-only (count, SELECT) — bukan dengan menebak.
6. Catat ke knowledge base: command valid, command berbahaya, root cause.

## 3. Perintah read-only yang aman untuk verifikasi

```powershell
# Cek daftar migrasi yang sudah diterapkan (via node + pool project, atau psql)
# psql "postgresql://bernada:bernada@localhost:5432/bernada" -c "SELECT * FROM schema_migrations ORDER BY filename;"

# Cek jumlah baris sebelum/ sesudah operasi
# SELECT COUNT(*) FROM <tabel>;

# Cek health aplikasi (DB connected?)
npm run test:health
```

## 4. Contoh backup (verifikasi dulu sintaks sebelum menjalankan)

```powershell
# pg_dump untuk backup — file disimpan di luar repo (mis. C:\Users\User\AppData\Local\Temp\opencode)
# & pg_dump "postgresql://bernada:bernada@localhost:5432/bernada" -f "backup-bernada-<tanggal>.sql"
```

> Catatan: jalur psql/pg_dump bergantung instalasi (scoop); pastikan binary tersedia sebelum menjalankan. Jangan pernah menaruh backup berisi data asli ke dalam repo.

## 5. Verifikasi sebelum menjalankan operasi destruktif

| Hal | Cara verifikasi |
| --- | --- |
| Server sehat | `npm run test:health` → PASS |
| Migrasi sudah up-to-date | `npm run migrate` (idempotent, aman) |
| Nama objek benar | Query read-only / `\dt` |
| Ada backup | File backup ada & berisi data (cek ukuran) |

## 6. Aturan knowledge

- Catat setiap solusi DB yang berhasil dengan format **ROOT CAUSE / EVIDENCE / FIX / VERIFICATION / DO NOT REPEAT** di `docs/knowledge/incidents.md` atau `lessons-learned.md`.
- Jangan mencatat dugaan sebagai fakta — tulis hanya yang sudah diverifikasi.
