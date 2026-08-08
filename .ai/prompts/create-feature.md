<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Prompt - Create Feature · Category : Prompt Template
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# Prompt: Create Feature

## Fungsi

Template untuk membangun **fitur baru** secara end-to-end, dari requirement hingga final review. Memaksa AI mengikuti **Development Workflow** — didefinisikan sekali di `rules/00-opencode.md §5` (single source of truth) — tanpa melompati tahapan tanpa alasan.

## Cara Menggunakan

1. Salin blok prompt di bawah ini.
2. Isi bagian yang bertanda `<...>` sesuai pekerjaan.
3. Tempel ke AI Pair Programmer.
4. AI wajib mengikuti semua `rules/` yang direferensikan.

---

## Template Prompt

````text
Kamu adalah AI Pair Programmer di project BERNADA.ID.

TUGAS: Membangun fitur `<nama fitur>`.

1) PERTAMA, baca dan patuhi seluruh dokumen ini sebelum bekerja:
   - .ai/manifesto.md
   - .ai/rules/00-opencode.md sampai 09-review-checklist.md
   - .ai/context/project.md, architecture.md, roadmap.md, sprint.md
   - .docs/design-system.md
   - assets/css/variables.css

2) KERJAKAN SESUAI WORKFLOW — ikuti detail di .ai/rules/00-opencode.md §5
   (single source of truth). Jangan lompati tahapan tanpa alasan.
   Urutan: Requirement → Discussion → Analysis → Planning → Database Design
   → API Design → Flow Design → Implementation → Self Review → Testing
   → Documentation → Final Review → Approval.
   Untuk setiap tahap, sampaikan pemahamanmu dan konfirmasi sebelum menulis kode.

3) LAPORAN AKHIR HARUS BERISI:
   - Ringkasan implementasi.
   - File yang dibuat/diubah.
   - Keputusan penting + alasan teknis.
   - Alternatif yang dipertimbangkan.
   - Status checklist self-review.
   - Saran langkah berikutnya.

Keputusan akhir ada di tangan manusia. Kamu hanya memberi rekomendasi.
````

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
