<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Architecture Context · Category : Context (living document)
  Version  : 1.0.0 · Status : 🟠 Review · Update : 03-08-2026
-->

# Arsitektur

> Ringkasan arsitektur untuk AI. **Referensi lengkap**: `.docs/architecture.md`. Prinsip arsitektur mengikuti aturan `rules/04-project-structure.md`.

---

## Arsitektur Saat Ini (Alpha)

```
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
5. **Design Token Sentral** — seluruh tampilan bersumber dari `variables.css`.
6. **Scalable** — struktur folder memungkinkan penambahan halaman, modul, dan layanan tanpa menulis ulang.

## Keputusan Arsitektur yang Harus Didokumentasikan

Setiap keputusan arsitektur penting (pola, teknologi, struktur data) wajib:
- Ditulis di `.docs/architecture.md` atau changelog.
- Menyertakan **alasan**, **alternatif**, serta **kelebihan dan kekurangan**.

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Ringkasan arsitektur alpha |
