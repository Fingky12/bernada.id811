<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Rule - Project Structure · Category : Rules
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# 04 — Struktur Project

> Setiap file harus berada di tempat yang benar. Struktur yang konsisten membuat project mudah dinavigasi oleh manusia dan AI. Referensi lengkap: `.docs/architecture.md`.

---

## 1. Struktur Root

```
BERNADA/
├── index.html              ← entry point aplikasi
├── assets/
│   └── css/                ← seluruh stylesheet
│       ├── variables.css   ← design token (PUSAT)
│       ├── reset.css       ← normalisasi browser
│       ├── utilities.css   ← class utilitas
│       ├── layout.css      ← layout global (container, grid, header)
│       ├── components/     ← komponen UI (button, card, badge, form)
│       │   ├── button.css
│       │   ├── card.css
│       │   ├── badge.css
│       │   └── form.css
│       ├── main.css       ← single entry point (import only)
│       ├── animations.css  ← animasi & transisi
│       └── responsive.css  ← media query (Mobile First)
├── pages/                  ← halaman aplikasi
├── api/                    ← kode API / endpoint
├── server/                 ← kode server (Express)
├── database/               ← skema & migrasi database
├── .docs/                  ← dokumentasi project
├── .ai/                    ← AI Development Framework
└── README.md
```

## 2. Aturan Penempatan

| Jenis Kode | Tempat |
| --- | --- |
| Design token | `assets/css/variables.css` |
| Komponen UI | `assets/css/components/` |
| Layout global | `assets/css/layout.css` |
| Responsif / breakpoint | `assets/css/responsive.css` (jangan di file lain) |
| Halaman baru | `pages/` |
| Endpoint API | `api/` |
| Skema / migrasi DB | `database/` |

## 3. Aturan Stylesheet

- `main.css` adalah **satu-satunya** entry yang meng-import seluruh CSS, sesuai urutan:
  1. `variables.css`
  2. `reset.css`
  3. `base.css`
  4. `utilities.css`
  5. `layout.css`
  6. `components/` (button.css, card.css, badge.css, form.css)
  7. `sections.css`
  8. `animations.css`
  9. `responsive.css`
- Jangan menambah file CSS baru tanpa alasan; jika perlu, ikuti urutan import.

## 4. Prinsip

- **Separation of concerns** — setiap file satu tanggung jawab.
- **Modular** — menambah halaman/fitur tidak menyentuh file inti.
- **Tanpa file yatim** — file yang tidak dipakai dihapus.
- Perubahan struktur project wajib didokumentasikan di `.docs/architecture.md` dan `context/architecture.md`.

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
