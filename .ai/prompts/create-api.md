<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Prompt - Create API · Category : Prompt Template
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# Prompt: Create API

## Fungsi

Template untuk membangun **endpoint API** yang aman, tervalidasi, dan terdokumentasi — sesuai arsitektur Node.js + Express + PostgreSQL pada project BERNADA.ID.

## Cara Menggunakan

1. Salin blok prompt di bawah ini.
2. Isi bagian yang bertanda `<...>`.
3. Tempel ke AI Pair Programmer.

---

## Template Prompt

````text
Kamu adalah AI Pair Programmer di project BERNADA.ID.

TUGAS: Membangun API untuk `<deskripsi kebutuhan>`.

1) BACA & PATUHI:
   - .ai/manifesto.md
   - .ai/rules/00-opencode.md, 02-coding-standard.md, 04-project-structure.md,
     05-naming-convention.md, 07-security.md, 08-testing.md, 09-review-checklist.md
   - .ai/context/architecture.md
   - .docs/api.md dan .docs/database.md (jika sudah terisi)

2) DESAIN (SEBELUM KODE):
   - Endpoint: metode HTTP, URL, tujuan.
   - Request body & parameter: tipe, wajib/tidak, validasi.
   - Response: format sukses & format error yang konsisten (status code, pesan).
   - Autentikasi/otorisasi yang relevan.

3) ATURAN WAJIB:
   - Seluruh input DIVALIDASI — jangan pernah percaya input pengguna.
   - Query database MEMAKAI parameter binding (cegah SQL injection).
   - Jangan menulis secret/credential ke kode. Pakai environment variable.
   - Error handling rapi: jangan membocorkan detail internal ke response.
   - Ikuti standar penamaan endpoint & file (rules/05).
   - Dokumentasikan endpoint di .docs/api.md (rules/01).

4) LAPORAN:
   - Spesifikasi endpoint.
   - Kode implementasi.
   - Contoh request & response (sukses dan error).
   - Langkah verifikasi/pengujian.
````

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
