<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Architecture · Category : Panduan (source of truth)
  Version  : 1.0.0 · Status : 🟠 Review · Update : 03-08-2026
-->

# Arsitektur BERNADA.ID

> Deskripsi arsitektur project. Ringkasan untuk AI ada di `.ai/context/architecture.md`.

---

## Gambaran Umum (Alpha)

Arsitektur tiga lapis (three-tier) yang terpisah jelas:

```text

┌──────────────────────────────┐
│         Frontend             │
│  HTML + CSS + JavaScript     │
│  (Design System via token)   │
└──────────────┬───────────────┘
               │ HTTP / JSON
┌──────────────▼───────────────┐
│           Backend            │
│      Node.js + Express       │
│  (API, validasi, auth)       │
└──────────────┬───────────────┘
               │ SQL
┌──────────────▼───────────────┐
│          Database            │
│        PostgreSQL            │
└──────────────────────────────┘
```

## Prinsip Arsitektur

1. **Separation of Concerns** — frontend, backend, dan database dipisahkan dengan jelas.
2. **Clean Architecture** — logika bisnis terpisah dari detail teknis (framework, DB).
3. **Modular** — fitur dibangun sebagai modul yang berdiri sendiri.
4. **API-first** — komunikasi frontend ↔ backend melalui API yang terdokumentasi.
5. **Design Token Sentral** — seluruh tampilan bersumber dari `assets/css/variables.css`.
6. **Scalable** — struktur folder memungkinkan penambahan halaman, modul, dan layanan tanpa menulis ulang.

## Status Komponen Saat Ini

| Lapisan | Status | Catatan |
| --- | --- | --- |
| Frontend | 🟠 Sebagian | design system & komponen dasar selesai; halaman inti belum |
| Backend | 🟡 Belum | Node.js + Express belum dimulai |
| Database | 🟡 Belum | PostgreSQL belum dirancang |

## Keputusan Arsitektur

Setiap keputusan arsitektur penting (pola, teknologi, struktur data) wajib:

- Ditulis di dokumen ini atau `.docs/changelog.md`.
- Menyertakan **alasan**, **alternatif**, serta **kelebihan dan kekurangan**.

### Keputusan yang Sudah Diambil

| Keputusan | Alasan | Alternatif | Kelebihan | Kekurangan |
| --- | --- | --- | --- | --- |
| Design System berbasis CSS Custom Properties | Satu sumber token untuk seluruh tampilan | Preprocessor (Sass/Less) | Native, mudah di-override & di-*runtime*, tanpa build step | Tidak ada fitur programatik (loop, function) |

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Ringkasan arsitektur alpha |
