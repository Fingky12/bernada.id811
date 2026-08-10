<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Architecture · Category : Panduan (source of truth)
  Version  : 1.0.2 · Status : 🟠 Proses · Update : 10-08-2026
-->

# Arsitektur BERNADA.ID

> Deskripsi arsitektur project. Ringkasan untuk AI ada di `.ai/context/architecture.md`.

---

## Gambaran Umum (Alpha)

Arsitektur tiga lapis (three-tier) yang terpisah jelas:

```text

┌──────────────────────────────┐
│         Frontend             │
│  HTML + CSS + JavaScript     │
│  (Design System via token)   │
└──────────────┬───────────────┘
               │ HTTP / JSON
┌──────────────▼───────────────┐
│           Backend            │
│      Node.js + Express       │
│  (API, validasi, auth)       │
└──────────────┬───────────────┘
               │ SQL
┌──────────────▼───────────────┐
│          Database            │
│        PostgreSQL            │
└──────────────────────────────┘
```

## Prinsip Arsitektur

1. **Separation of Concerns** — frontend, backend, dan database dipisahkan dengan jelas.
2. **Clean Architecture** — logika bisnis terpisah dari detail teknis (framework, DB).
3. **Modular** — fitur dibangun sebagai modul yang berdiri sendiri.
4. **API-first** — komunikasi frontend ↔ backend melalui API yang terdokumentasi.
5. **Design Token Sentral** — seluruh tampilan bersumber dari `assets/css/variables.css`.
6. **Scalable** — struktur folder memungkinkan penambahan halaman, modul, dan layanan tanpa menulis ulang.

## Status Komponen Saat Ini

| Lapisan | Status | Catatan |
| --- | --- | --- |
| Frontend | ✅ Selesai (v1.1.0 → v1.2.0) | Landing page 9 section + halaman `/login`, `/builder`, `/u/:slug` |
| Backend | ✅ Selesai (Sprint 3) | Node.js + Express: config, app, error handler, middleware auth, lib (jwt/password/validation), service layer, router health/auth/templates/invitations + guestbook publik |
| Database | 🟠 Sebagian | Migrasi 0001 (core) + 0002 (refresh_tokens + seed template) + 0003 (galeri & buku tamu); PostgreSQL belum diinstall lokal |

## Keputusan Arsitektur

Setiap keputusan arsitektur penting (pola, teknologi, struktur data) wajib:

- Ditulis di dokumen ini atau `.docs/changelog.md`.
- Menyertakan **alasan**, **alternatif**, serta **kelebihan dan kekurangan**.

### Keputusan yang Sudah Diambil

| Keputusan | Alasan | Alternatif | Kelebihan | Kekurangan |
| --- | --- | --- | --- | --- |
| Design System berbasis CSS Custom Properties | Satu sumber token untuk seluruh tampilan | Preprocessor (Sass/Less) | Native, mudah di-override & di-*runtime*, tanpa build step | Tidak ada fitur programatik (loop, function) |
| Node.js ESM (`"type": "module"`) | Standar JavaScript modern, async/await top-level, tanpa build step | CommonJS | Ekosistem aktif, `import` eksplisit | Beberapa pustaka lama hanya CJS (perlu interop) |
| Driver `pg` + migrasi SQL mentah | Kontrol penuh atas SQL, parameter binding, tanpa ORM/build step | Prisma/Sequelize | Ringan, transparan, sesuai prinsip vanilla project | Menulis migrasi manual, tanpa type-safety ORM |
| Migrasi append-only + runner `database/migrate.js` | Riwayat skema terjamin, rollback transaksi per file | Tool eksternal (node-pg-migrate) | Tanpa dependency ekstra | Runner minimal, fitur downgrade tidak disediakan |
| Konfigurasi via environment (`.env` + `--env-file-if-exists`) | Secret tidak masuk kode (rules/07) | dotenv | Tanpa dependency, didukung native Node 22 | File `.env` harus dibuat manual dari contoh |
| Pool `pg` di `server/db.js` + lazy health check | Server tetap hidup saat DB mati; health endpoint lapor status | Koneksi wajib saat boot | Toleran kegagalan, mudah di-debug | Health check perlu pemantauan |
| Service layer (`server/services/*`) | Route hanya validasi & HTTP; logika bisnis di service — single responsibility | Logika menumpuk di route | Mudah diuji & dipakai ulang | File service bertambah seiring fitur |
| JWT access + refresh token rotasi | Access short-lived (memori), refresh di cookie httpOnly + hash SHA-256 di DB, dirotasi & di-revoke | Session murni / OAuth | Aman XSS (httpOnly), revoke-able, stateless access | Rotasi perlu transaksi & index `token_hash` |
| `bcryptjs` (tanpa native build) | Aman di Windows & CI, tanpa dependency native | `bcrypt` / argon2 native | Mudah diinstall di semua OS | Sedikit lebih lambat dari native |
| Frontend same-origin via Express | `express.static` + route halaman — cookie same-site bekerja tanpa CORS | SPA terpisah + CORS | Sederhana, cookie aman, tanpa origin checker | Frontend terikat satu server |
| Fallback demo publik (`demo-invitations.js`) | Halaman `/u/:slug` tetap terlihat saat API/DB mati (progressive enhancement) | Skeleton + error page | UX tidak mati total; berguna saat demo | Data contoh tidak dari DB (beri label "Pratinjau") |

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.2 | 10-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 3 — auth, service layer, template & invitation API, halaman publik, guestbook |
| 1.0.1 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Backend & database awal (Fase 1) — keputusan arsitektur baru |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Ringkasan arsitektur alpha |
