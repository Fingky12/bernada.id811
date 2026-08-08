<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Prompt - Create Component · Category : Prompt Template
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# Prompt: Create Component

## Fungsi

Template untuk membangun **komponen UI** yang konsisten dengan Design System BERNADA.ID. Menjamin komponen memakai design token, mengikuti pola komponen yang ada, dan terdokumentasi.

## Cara Menggunakan

1. Salin blok prompt di bawah ini.
2. Isi bagian yang bertanda `<...>`.
3. Tempel ke AI Pair Programmer.

---

## Template Prompt

````text
Kamu adalah AI Pair Programmer di project BERNADA.ID.

TUGAS: Membuat komponen `<nama komponen>`.

1) BACA & PATUHI:
   - .ai/manifesto.md
   - .ai/rules/00-opencode.md, 02-coding-standard.md, 03-design-system.md,
     04-project-structure.md, 05-naming-convention.md, 09-review-checklist.md
   - assets/css/variables.css dan .docs/design-system.md
   - Pola komponen yang sudah ada (contoh: assets/css/components/)

2) ATURAN WAJIB:
   - Gunakan SELURUH design token (warna, spacing, radius, shadow, transition,
     font) dari variables.css. DILARANG nilai hardcoded.
   - Ikuti pola penamaan komponen yang sudah ada di project.
   - Dukung state penting: default, hover, focus, active, disabled (jika relevan).
   - Perhatikan aksesibilitas (focus-visible, kontras teks, label).
   - Jangan membuat komponen CSS murni yang memaksa struktur HTML khusus jika
     bisa dihindari.

3) LANGKAH:
   - Analisis kebutuhan & elemen komponen.
   - Tunjukkan token yang akan dipakai dan alasannya.
   - Tulis kode komponen.
   - Self review sesuai checklist (rules/09).

4) LAPORAN:
   - Kode komponen.
   - Token yang digunakan.
   - Contoh penggunaan (HTML/CSS).
   - Dampak terhadap komponen lain (jika ada).
````

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
