<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Rule - Security · Category : Rules
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# 07 — Keamanan Aplikasi

> Keamanan adalah tanggung jawab bersama. **AI wajib menerapkan aturan ini di setiap kode yang ditulis.**

---

## 1. Secret & Credential

- ❌ **Dilarang** menulis password, API key, token, atau credential ke dalam kode.
- Gunakan **environment variable** (file `.env` yang tidak di-commit).
- Pastikan `.gitignore` mengecualikan `.env`.
- Jika secret terlanjur ter-commit: segera laporkan, rotasi secret, dan bersihkan riwayat.

## 2. Validasi Input

- **Jangan pernah percaya input pengguna.**
- Semua input (body, query, params, file) divalidasi: tipe, panjang, format, dan nilai yang diperbolehkan.
- Validasi di sisi server — validasi client hanya untuk UX, bukan pengaman.
- Berikan pesan error yang jelas tanpa membocorkan detail internal.

## 3. Database

- Selalu gunakan **parameter binding** / prepared statement → cegah **SQL Injection**.
- ❌ Jangan menyusun query dengan string concatenation dari input pengguna.
- Terapkan prinsip **least privilege** pada akses database.

## 4. Autentikasi & Otorisasi

- Password disimpan dengan hashing yang aman (bcrypt / argon2).
- Session/token dikelola dengan aman (httpOnly, secure, dsb.).
- Setiap endpoint memeriksa otorisasi — jangan andalkan hidden URL.

## 5. XSS & Output

- Escape output dinamis di HTML untuk mencegah **XSS**.
- Hindari `innerHTML` dengan input pengguna; gunakan DOM API / escaping.
- Jangan membocorkan data sensitif (email, telepon, dsb.) ke tempat yang tidak seharusnya.

## 6. HTTP & Headers

- Gunakan HTTPS di produksi.
- Terapkan header keamanan dasar (CSP, X-Content-Type-Options, dll. sesuai kebutuhan).
- Batasi CORS hanya pada origin yang dibutuhkan.

## 7. Review Keamanan

- Setiap kode yang memproses input atau data sensitif wajib melewati cek keamanan pada self-review (`rules/09`).
- Jika ragu terhadap keamanan suatu implementasi → tanyakan, jangan menebak.

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
