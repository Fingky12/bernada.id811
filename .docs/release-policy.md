<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Release Policy · Category : Rules
  Version  : 1.0.0 · Status : ✅ Stable · Update : 04-08-2026
-->

# Release Policy

> Kebijakan resmi untuk setiap Release di project BERNADA.ID.

---

## 1. Prinsip Dasar

**Setiap Sprint wajib menghasilkan satu Release resmi.**

Release adalah penanda resmi bahwa hasil kerja Sprint sudah stabil, terdokumentasi, dan siap digunakan.

## 2. Komponen Release

Setiap Release wajib memiliki:

| Komponen | Keterangan |
| --- | --- |
| **Version** | Nomor versi (Semantic Versioning) |
| **Release Name** | Tagline unik untuk Release |
| **Status** | Status stabil / tidak stabil |
| **Sprint** | Sprint yang menghasilkan Release |
| **Highlights** | Pencapaian utama Sprint |
| **Review Result** | Hasil review (PASS/FAIL) |
| **Release Notes** | Ringkasan profesional |
| **Approved By** | Pihak yang menyetujui Release |

## 3. Aturan Wajib

1. **Release hanya boleh dibuat setelah Audit dinyatakan PASS.**
   - Jika ada Critical Issue, perbaiki terlebih dahulu sebelum membuat Release.
2. **Seluruh Release wajib dicatat pada `changelog.md`.**
   - Format changelog harus konsisten.
   - Jangan menghapus histori release sebelumnya.
   - Tambahkan release terbaru di bagian paling atas.
3. **Satu Sprint hanya memiliki satu Stable Release.**
   - Tidak boleh ada dua Stable Release dalam satu Sprint.
4. **Setiap Release memiliki Tagline yang unik.**
   - Contoh: "The Foundation Release", "The Core Features Release".
5. **Version mengikuti Semantic Versioning.**
   - Format: `MAJOR.MINOR.PATCH`
   - `MAJOR` — perubahan besar / tidak kompatibel.
   - `MINOR` — fitur baru yang kompatibel.
   - `PATCH` — perbaikan bug.
6. **Dokumentasi wajib sinkron dengan kode sebelum Release dibuat.**
   - Seluruh dokumentasi harus mencerminkan implementasi terbaru.
7. **Sprint baru tidak boleh dimulai sebelum Sprint sebelumnya dinyatakan Closed.**

## 4. Alur Release

```text
Audit PASS
   ↓
Siapkan Release
   ↓
Sinkronisasi Dokumentasi
   ↓
Persetujuan (Product Owner + Senior Engineer)
   ↓
Tandai Status Stable
   ↓
Catat di changelog.md
   ↓
Sprint Closed
```

## 5. Persetujuan

Setiap Release wajib disetujui oleh:

| Peran | Tanggung Jawab |
| --- | --- |
| **Product Owner** | Persetujuan bisnis & scope |
| **Senior Engineer** | Persetujuan teknis & kualitas |
| **AI Pair Programmer** | Rekomendasi teknis |

---

> **v1.0.0** · ✅ Stable · 04-08-2026 · BERNADA.ID Engineering Handbook
