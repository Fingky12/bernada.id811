---
name: bernada-core
description: Use when working on BERNADA.ID application code — architecture, tech stack, folder layout, npm scripts, environment variables, API routes, pages, and project-specific conventions. Trigger on words like "bernada", "undangan", "invitation", "builder", "admin", "login", "API", or any edit inside api/, server/, pages/, assets/, scripts/, database/.
---

# BERNADA.ID — Project Core Behavior

> Knowledge inti spesifik project BERNADA.ID (Digital Wedding Invitation Platform).
> Ini adalah ringkasan operasional. Dokumentasi resmi lengkap ada di `.docs/` dan konteks AI di `.ai/context/`.
> Hanya fakta terverifikasi dari repo yang boleh dimasukkan di sini — bukan dugaan.

---

## 1. Stack (terverifikasi dari package.json, README, .docs/architecture.md)

| Lapisan | Teknologi |
| --- | --- |
| Frontend | HTML + CSS + JavaScript (vanilla), design system via token di `assets/css/variables.css` |
| Backend | Node.js ≥ 22, Express 5, ESM (`"type": "module"` di package.json) |
| Database | PostgreSQL (lokal, role `bernada`, DB `bernada`, port 5432), driver `pg`, migrasi SQL mentah |
| Library | `bcryptjs` (tanpa native build — aman Windows), `jsonwebtoken`, `helmet`, `cors`, `cookie-parser`, `nodemailer` |

## 2. Struktur Folder

```text
server/            index.js, app.js, config.js, db.js
server/lib/        util bersama (jwt, password, validation, http-error, dll.)
server/middleware/ auth, admin (requireAdmin), rate-limit
server/services/   logika bisnis (auth, user, template, invitation, guestbook, guest, gift-account, admin, password-reset, email)
api/routes/        health, auth, templates, invitations, guests, gift-accounts, admin
pages/             login.html, builder.html, admin.html, invitation.html (disajikan same-origin via Express)
assets/            css/js (design system, util.js)
database/          create-db.js, migrate.js, migrations/*.sql
scripts/           health-check.mjs, e2e-sprint5.mjs, make-admin.mjs
.docs/             dokumentasi engineering resmi (api, database, architecture, changelog, sprint, e2e, releases)
.ai/               framework AI: rules/ (constitution & aturan), context/, prompts/
```

## 3. Perintah Valid (terverifikasi dari package.json)

```bash
npm install                       # instal dependency
npm run dev                       # server + auto-restart (node --watch --env-file-if-exists=.env)
npm start                         # server produksi (BLOCKING foreground — JANGAN dipakai via tool; pakai start-api.ps1)
& .\scripts\start-api.ps1 -Port 3000   # PowerShell: orchestrator start API (detached, readiness, exit 0) — WAJIB untuk start server
npm run db:create                 # buat database (database/create-db.js)
npm run migrate                   # jalankan migrasi 0001-0006 (idempotent, transaction per file)
npm run test:health               # health check endpoint (PASS/FAIL, exit code 1 bila gagal)
npm run admin:promote -- <email>  # jadikan akun sebagai admin
node --env-file-if-exists=.env scripts/e2e-sprint5.mjs   # verifikasi E2E Sprint 5 (regression)
```

**Selalu pakai `--env-file-if-exists=.env`** — konfigurasi dibaca dari `.env`; tanpa flag ini `DATABASE_URL` default dipakai.

## 4. Environment (dari `.env.example` / `server/config.js`)

- `DATABASE_URL` default `postgresql://bernada:bernada@localhost:5432/bernada`.
- `PORT` default 3000; `NODE_ENV` default development.
- `JWT_SECRET`: di development boleh kosong (default dev-secret), di production **wajib** diisi (server menolak start).
- `SMTP_HOST` kosong → email TIDAK dikirim; tautan reset dicetak di log console (`[mail:dev]`).
- `APP_BASE_URL` dipakai untuk membangun tautan reset password.

## 5. Endpoint & Pola API

- Health: `GET /api/health` → 200 `{status:"ok", service:"bernada-api", database:"connected"}`; 503 `degraded` bila DB mati.
- Auth: `/api/auth/register|login|refresh|logout|forgot-password|reset-password`.
- Undangan: `/api/invitations` (owner), publik `/api/invitations/public/:slug/...`.
- Admin: `/api/admin/*` — wajib JWT + role `admin` (`requireAdmin`).
- Format error konsisten: status code + `{ error: { code, message } }`.
- Rate limit in-memory: auth 10/mnt, guestbook 20/mnt, publik 120/mnt, admin 60/mnt, forgot 5/mnt. Respons `429` berisi header `X-RateLimit-*`.
- Otentikasi: JWT access (short-lived) + refresh token di cookie httpOnly (`bernada_refresh`) yang di-hash SHA-256 di DB.

## 6. Konvensi Project

- **Arsitektur**: three-tier (frontend/backend/DB), clean architecture, API-first, design token sentral.
- **One file = satu komponen** untuk CSS; urutan class `Base → Variant → Size → State`.
- **Design token wajib** — jangan hardcode nilai yang sudah ada sebagai token.
- **Jangan commit** `.env`, `node_modules`, secret; periksa `git status` + `git diff` sebelum commit.
- **Commit**: semantic convention `type(scope): deskripsi` — `feat/fix/refactor/docs/style/test/chore`. AI hanya commit atas perintah eksplisit manusia.
- **Migrasi**: append-only, nomor urut `000N_*.sql`, tidak boleh diubah setelah diterapkan — buat migrasi baru bila perlu perubahan.
- Dokumen engineering ditulis dengan header BERNADA.ID ENGINEERING HANDBOOK dan diberi versioning.

## 7. Perilaku Khusus yang Harus Diketahui

- Server tetap hidup saat DB mati (lazy health check); `GET /api/health` melaporkan `degraded` — **jangan asumsikan DB down hanya karena server hidup**.
- **Start server API wajib lewat `scripts/start-api.ps1 -Port <N>`** (detached, reuse server sehat, tunggu readiness `status=ok`+`database=connected`, cetak `STARTED PID=.. / PORT=.. / HEALTH=OK / DB=CONNECTED / REPRO-DONE / EXITCODE=0` lalu exit 0). **DILARANG** menjalankan `npm start` / `node server/index.js` sebagai perintah foreground yang memblokir tool bash — server long-running dan tidak akan exit. Jangan menunggu node exit; jangan anggap node yang tetap hidup setelah READY sebagai kegagalan; jangan kill server yang healthy (reuse saja).
- Halaman publik `/u/:slug` punya fallback data demo (`assets/js/demo-invitations.js`) saat API/DB tidak aktif.
- `admin:promote` hanya menaikkan role — jangan dipakai untuk mengubah data lain.
- Migrasi mencatat file yang sudah dijalankan di tabel `schema_migrations`; migrasi yang gagal di-rollback per file (lihat `database/migrate.js`).

## 8. Referensi Dokumen

- Konstitusi & aturan: `.ai/rules/00-opencode.md` (tertinggi) lalu `.ai/rules/*`.
- Arsitektur: `.docs/architecture.md`, ringkasan AI `.ai/context/architecture.md`.
- Database & API: `.docs/database.md`, `.docs/api.md`.
- Knowledge base sesi: `docs/knowledge/lessons-learned.md`, `docs/knowledge/incidents.md`.

## 9. Sebelum Perubahan Besar

1. Baca `AGENTS.md`.
2. Muat skill yang relevan (bernada-core / postgres-windows / e2e-testing / safe-db-operations / troubleshooting).
3. Baca `docs/knowledge/lessons-learned.md` — cek apakah masalah terkait pernah terjadi.
4. Kalau ada lesson yang relevan, ikuti solusi yang sudah terverifikasi, jangan mengulang solusi yang gagal.
