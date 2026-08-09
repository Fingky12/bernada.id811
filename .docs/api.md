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
| Autentikasi | JWT access token via header `Authorization: Bearer <token>`; refresh via cookie httpOnly (`bernada_refresh`). Endpoint yang bertanda "Publik" tidak memerlukan autentikasi |

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

## Endpoint Publik

### GET `/api/invitations/public/:slug`

Mengambil undangan yang sudah diterbitkan (publik, tanpa autentikasi). Endpoint ini dipakai halaman undangan di `/u/:slug`.

**Response 200:**

```json
{
  "invitation": {
    "id": "b6f4d5f0-6b9e-4c0e-8d2a-1f2c3d4e5f6a",
    "slug": "dua-pasangan",
    "title": "Pernikahan Dua Pasangan",
    "eventDate": "2026-12-12T03:00:00.000Z",
    "eventTime": "09:00",
    "venue": "Gedung Serbaguna",
    "location": "Jl. Contoh No. 1, Jakarta",
    "couple": "Ahmad & Siti",
    "message": "Dengan memohon rahmat dan ridho Allah SWT…",
    "theme": { "primaryColor": "#A12828", "accentColor": "#FFC400" },
    "musicUrl": "https://…/lagu.mp3",
    "publishedAt": "2026-08-09T04:00:00.000Z"
  },
  "template": {
    "name": "Klasik Minimal",
    "category": "wedding",
    "previewUrl": "/assets/img/portfolio-1.svg"
  }
}
```

Catatan:

- Hanya undangan dengan `is_published = TRUE` yang dikembalikan.
- Response **404** (`NOT_FOUND`) bila slug tidak ada atau belum diterbitkan.
- Field `owner_id` dan detail internal lain **tidak** di-expose.
- Slug divalidasi (huruf kecil, angka, tanda hubung).

---

## Middleware

| Middleware | Fungsi |
| --- | --- |
| `helmet` | Header keamanan (CSP, HSTS, X-Content-Type-Options, dll.) |
| `cors` | Batasi origin (konfigurasi `CORS_ORIGIN` di `.env`) |
| `express.json` | Parse body JSON (limit 1mb) |
| `requireAuth` | Wajib autentikasi untuk endpoint terproteksi |
| `notFoundHandler` | 404 JSON untuk route yang tidak dikenal |
| `errorHandler` | Error terpusat: 5xx generik, <5xx mengikuti `err.status` |

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.1 | 09-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Endpoint publik `GET /api/invitations/public/:slug` + konvensi autentikasi JWT |
| 1.0.0 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Konvensi API + endpoint health |
