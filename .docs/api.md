<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : API · Category : Panduan (source of truth)
  Version  : 1.0.0 · Status : 🟠 Proses · Update : 05-08-2026
-->

# API BERNADA.ID

> Dokumentasi endpoint API. Endpoint baru wajib didokumentasikan di file ini (rules/01).

---

## Konvensi Umum

| Aspek | Konvensi |
| --- | --- |
| Base path | `/api` |
| Format | JSON |
| URL | `kebab-case` (`rules/05`) |
| Body/response | `camelCase` (`rules/05`) |
| Metode HTTP | sesuai makna (GET, POST, PUT/PATCH, DELETE) |
| Autentikasi | belum ada (Fase 2 — Sprint 3) |

### Format Response Sukses

Tidak ada pembungkus khusus — data dikembalikan langsung sebagai body JSON.

### Format Response Error

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Pesan kesalahan yang aman untuk ditampilkan."
  }
}
```

Aturan:
- **Jangan membocorkan detail internal** (stack trace, query, dsb.) ke response.
- `code` ringkas `UPPER_SNAKE_CASE`; `message` bahasa Indonesia, aman ditampilkan.
- Error 5xx selalu `message` generik; detail lengkap dicatat di log server.

---

## Endpoint

### GET `/api/health`

Cek kesehatan layanan dan koneksi database.

**Response 200** — database terhubung:

```json
{
  "status": "ok",
  "service": "bernada-api",
  "version": "1.1.0",
  "timestamp": "2026-08-09T03:50:39.652Z",
  "database": "connected"
}
```

**Response 503** — database tidak terjangkau (server tetap hidup, `status: degraded`):

```json
{
  "status": "degraded",
  "service": "bernada-api",
  "version": "1.1.0",
  "timestamp": "2026-08-09T03:50:39.652Z",
  "database": "unreachable"
}
```

---

## Middleware

| Middleware | Fungsi |
| --- | --- |
| `helmet` | Header keamanan (CSP, HSTS, X-Content-Type-Options, dll.) |
| `cors` | Batasi origin (konfigurasi `CORS_ORIGIN` di `.env`) |
| `express.json` | Parse body JSON (limit 1mb) |
| `notFoundHandler` | 404 JSON untuk route yang tidak dikenal |
| `errorHandler` | Error terpusat: 5xx generik, <5xx mengikuti `err.status` |

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.0 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Konvensi API + endpoint health |
