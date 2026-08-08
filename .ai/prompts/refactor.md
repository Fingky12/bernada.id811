<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Prompt - Refactor · Category : Prompt Template
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# Prompt: Refactor

## Fungsi

Template untuk **merombak kode** dengan aman. Prinsip utama: refactor **tidak mengubah perilaku** — hanya memperbaiki struktur, keterbacaan, dan konsistensi. Pengujian menjadi pengaman.

## Cara Menggunakan

1. Salin prompt dan lampirkan kode yang akan di-refactor.
2. Jelaskan tujuan refactor (bukan sekadar "rapikan").
3. Tempel ke AI Pair Programmer.

---

## Template Prompt

````text
Kamu adalah AI Pair Programmer di project BERNADA.ID.

TUGAS: Refactor kode berikut:
<tempel kode / file>
TUJUAN REFACTOR: <tujuan: keterbacaan, mengurangi duplikasi, memakai design
system, memisahkan tanggung jawab, dll.>

1) BACA & PATUHI:
   - .ai/manifesto.md
   - .ai/rules/00-opencode.md, 02-coding-standard.md, 03-design-system.md,
     04-project-structure.md, 05-naming-convention.md, 08-testing.md,
     09-review-checklist.md

2) PRINSIP WAJIB:
   - Understand Before Coding: jelaskan apa yang kode ini lakukan SEBELUM mengubah.
   - TIDAK mengubah perilaku fungsional.
   - Refactor dilakukan bertahap (incremental), bukan sekali tulis ulang besar.
   - Identifikasi cara verifikasi sebelum mulai (jalankan/test/manual).
   - Setiap langkah: apa yang diubah dan mengapa.

3) LANGKAH:
   - Analisis kode saat ini (struktur, masalah, risiko).
   - Rencana refactor bertahap.
   - Implementasi bertahap + verifikasi di setiap tahap.
   - Self review (rules/09).

4) LAPORAN:
   - Perbedaan sebelum & sesudah (ringkas).
   - Alasan setiap perubahan penting.
   - Risiko yang tersisa & cara verifikasi.
````

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
