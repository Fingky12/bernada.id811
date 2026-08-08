<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Rule - Coding Standard · Category : Rules
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# 02 — Standar Penulisan Kode

> Standar ini berlaku untuk seluruh kode BERNADA.ID: HTML, CSS, JavaScript, Node.js, dan SQL. Referensi lengkap dapat dirawat di `.docs/coding-standard.md`.

---

## 1. Prinsip Umum

- **Konsisten di atas kreativitas** — ikuti pola yang sudah ada di project.
- **Keterbacaan utama** — kode dibaca manusia lebih sering daripada ditulis.
- **Kode bersih** — tanpa kode mati, tanpa duplikasi, tanpa komentar sampah.
- **Understand Before Coding** — pahami masalah sebelum menulis.

## 2. Aturan Per Bahasa

### HTML

- Struktur semantik (header, main, section, footer).
- Indentasi 4 spasi (konsisten dengan project).
- Gunakan class yang mengikuti naming convention (`rules/05`).
- Tanpa style inline kecuali benar-benar diperlukan.

### CSS

- **Selalu pakai design token** (`var(--...)`) — larangan nilai hardcoded.
- Indentasi 4 spasi.
- Setiap aturan terdiri dari blok yang rapi, tanpa spasi berlebihan.
- Kelompokkan dengan komentar bagian (`/* ===== NAMA ===== */`).
- Tanpa `!important` kecuali untuk utility khusus.
- Mobile First: tulis gaya dasar mobile, naikkan dengan `min-width`.

### JavaScript / Node.js

- Nama variabel & fungsi deskriptif (lihat `rules/05`).
- Fungsi kecil, satu tanggung jawab.
- Tanpa variabel global yang tidak perlu.
- Error handling eksplisit — jangan ditelan diam-diam.
- Gunakan `const`/`let`, hindari `var`.

### SQL

- Keyword SQL huruf besar (`SELECT`, `FROM`).
- Selalu gunakan parameter binding untuk input pengguna.
- Nama tabel & kolom `snake_case`.

## 3. Komentar

- Komentar menjelaskan **mengapa**, bukan **apa** (kode sudah menjelaskan "apa").
- Bahasa Indonesia atau Inggris — konsisten di dalam satu file.
- Tanpa komentar yang sekadar mengulang kode.
- Header file menggunakan blok komentar standar project.

## 4. Larangan

- ❌ Hardcoded color / spacing / radius.
- ❌ Menyalin-paste kode tanpa menyesuaikan standar.
- ❌ Kode yang mengubah perilaku tanpa dokumentasi.
- ❌ Secret / credential dalam kode.
- ❌ `console.log` yang tertinggal di produksi (kecuali logging terstruktur).

## 5. Verifikasi

- Setiap selesai: baca ulang kode sendiri (self review, `rules/09`).
- Pastikan kode mengikuti pola komponen/file sejenis yang sudah ada.

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
