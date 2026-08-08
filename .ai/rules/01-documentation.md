<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Rule - Documentation Standard · Category : Rules
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# 01 — Standar Dokumentasi

> Dokumentasi adalah **bagian dari kode**, bukan pelengkap. Seluruh dokumen di project BERNADA.ID wajib mengikuti standar ini agar format konsisten — namun tetap ringkas dan mudah dirawat.

---

## 1. Format Wajib

Setiap dokumen terdiri dari **3 bagian**: Header (Document Info) → Isi → Footer (Versi).

### a. Header — Document Information

Semua dokumen memakai header ringkas ini (4 baris):

```markdown
<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : <Nama Dokumen> · Category : <Kategori>
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->
```

**Status Document** yang valid:

| Status | Arti |
| --- | --- |
| 🟡 **Draft** | Masih disusun, belum final |
| 🟠 **Review** | Perlu ditinjau / disetujui |
| ✅ **Stable** | Final, berlaku sebagai standar |
| 🔴 **Deprecated** | Tidak berlaku lagi, ditinggalkan |

### b. Isi — Markdown Structure

- Heading hierarkis (`#` dokumen, `##` bab, `###` sub-bab) — tanpa melompat level.
- Tabel untuk data terstruktur.
- Blok kode diberi bahasa (contoh: ` ```css `).
- Setiap bab penting disertai catatan **best practice** singkat.

### c. Footer — Version History

Ada **dua bentuk**, pilih sesuai jenis dokumen:

**1) Dokumen hidup** (berubah berkala: `context/*.md`, changelog) → **tabel**:

```markdown
| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.1 | 05-08-2026 | AI + Senior Engineer | ✅ Stable | Perbaiki deskripsi token warna |
| 1.0.0 | 03-08-2026 | AI + Senior Engineer | ✅ Stable | Initial release |
```

**2) Dokumen statis** (aturan, prompt, manifesto, README) → **baris ringkas**:

```markdown
> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
```

## 2. Versioning

- Setiap perubahan isi = **versi naik**:
  - Perubahan kecil (typo, penyempurnaan) → minor (`1.0.x`).
  - Perubahan besar (struktur, isi) → major (`x.0.0`).
- Versi lama **tidak dihapus** — tambahkan baris baru di atasnya.
- Deskripsi menceritakan **apa yang berubah**, bukan "update dokumen".
- Changelog ringkas ditulis di `.docs/changelog.md` untuk perubahan penting.

## 3. Aturan Penulisan

- Bahasa Indonesia yang jelas, profesional, dan konsisten.
- Ringkas namun lengkap — dokumentasi yang bertele-tele tidak dibaca.
- Akurat sesuai kode/keputusan aktual; **dilarang mengarang**.
- Jika informasi belum tersedia, tulis "belum tersedia" — jangan dikarang.
- Gunakan terminologi konsisten di seluruh dokumen.

## 4. Single Source of Truth

Beberapa informasi hanya ditulis di **satu tempat**, dokumen lain mereferensikannya:

| Informasi | Satu-satunya sumber |
| --- | --- |
| Hierarki aturan & Development Workflow | `rules/00-opencode.md` |
| Design token | `assets/css/variables.css` |
| Panduan design system | `.docs/design-system.md` |
| Arsitektur | `.docs/architecture.md` + `context/architecture.md` |
| Roadmap | `.docs/roadmap.md` + `context/roadmap.md` |

> Aturan: **jangan menyalin isi** dari sumber tersebut ke dokumen lain. Cukup tulis referensi, contoh: "Workflow lihat `rules/00-opencode.md §5`".

## 5. Lokasi Dokumentasi

| Jenis | Lokasi |
| --- | --- |
| Panduan & arsitektur | `.docs/` |
| Framework AI | `.ai/` |
| Ringkasan untuk AI | `.ai/context/` |
| Dokumentasi API | `.docs/api.md` |
| Perubahan versi | `.docs/changelog.md` |

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
