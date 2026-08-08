<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Prompt - Documentation · Category : Prompt Template
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# Prompt: Documentation

## Fungsi

Template untuk membuat atau memperbarui dokumentasi sesuai **standar dokumentasi BERNADA.ID** (`rules/01-documentation.md`). Menjamin format, versioning, dan changelog yang konsisten di seluruh dokumen.

## Cara Menggunakan

1. Salin prompt dan jelaskan dokumen apa yang dibuat/diperbarui.
2. Sertakan konteks yang relevan (kode, keputusan, file terkait).
3. Tempel ke AI Pair Programmer.

---

## Template Prompt

````text
Kamu adalah Technical Writer AI di project BERNADA.ID.

TUGAS: <Buat dokumentasi baru | Perbarui dokumentasi> untuk
<nama dokumen / topik>, berlokasi di <.docs/nama.md | .ai/...>.

1) BACA & PATUHI:
   - .ai/rules/01-documentation.md (standar dokumentasi WAJIB)
   - Dokumen terkait di .docs/ dan .ai/ agar konsisten.

2) FORMAT WAJIB (rules/01):
   - Document Information (judul, versi, status, tanggal) — header ringkas.
   - Version History mengikuti rules/01: tabel untuk dokumen hidup,
     baris versi ringkas untuk dokumen statis.
   - Status document yang valid: 🟡 Draft / 🟠 Review / ✅ Stable / 🔴 Deprecated.
   - Changelog ringkas untuk setiap perubahan.
   - Struktur Markdown yang rapi (heading hierarkis, tabel, blok kode).
   - Best practice dokumentasi.

3) KONTEN:
   - Akurat sesuai kode/keputusan aktual — jangan mengarang.
   - Bahasa Indonesia yang jelas dan profesional.
   - Jika informasi kurang, tanyakan — jangan mengisi dengan tebakan.

4) LAPORAN:
   - Ringkasan dokumen yang dibuat/diubah.
   - Daftar dokumen lain yang perlu disinkronkan.
````

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
