<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Rule - Naming Convention · Category : Rules
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# 05 — Naming Convention

> Penamaan yang konsisten adalah bahasa bersama tim dan AI. **Seluruh penamaan mengikuti aturan ini.**

---

## 1. Prinsip Umum

- **Deskriptif** — nama menjelaskan fungsi, bukan bentuk.
- **Lowercase** — huruf kecil untuk nama file, variabel, dan token.
- **Pemisah** — gunakan `-` (kebab-case) untuk file & token, `camelCase` untuk JS.
- **Tanpa singkatan membingungkan.**

## 2. CSS Custom Properties (Design Token)

Pola: `--kategori-sifat-varian`

```css
--color-primary        /* kategori: color */
--color-primary-light  /* kategori + sifat + varian */
--spacing-md           /* kategori: spacing */
--border-radius-lg     /* kategori: border-radius */
--shadow-md            /* kategori: shadow */
--font-size-sm         /* kategori: font-size */
--font-weight-bold     /* kategori: font-weight */
--z-index-modal        /* kategori: z-index */
--breakpoint-md        /* kategori: breakpoint */
```

Skala warna: `-50` (terang) → `-900` (gelap), `500` = base.

## 3. File & Folder

| Hal | Konvensi | Contoh |
| --- | --- | --- |
| File CSS | `kebab-case.css` | `variables.css`, `responsive.css` |
| Halaman | `kebab-case.html` | `invitation.html` |
| File JS/Node | `kebab-case.js` | `auth-service.js` |
| Folder | `kebab-case` | `assets/css` |

## 4. HTML Class

- `kebab-case`, deskriptif: `.btn-primary`, `.card`, `.nav-link`.
- State class: `.is-active`, `.is-open` (jika diperlukan).
- Gunakan class utilitas dari `utilities.css` bila tersedia.

## 5. JavaScript

- Variabel & fungsi: `camelCase` → `getUserById`, `totalPrice`.
- Konstanta: `UPPER_SNAKE_CASE` → `MAX_ITEMS_PER_PAGE`.
- Class/konstruktor: `PascalCase`.
- Boolean: awalan `is` / `has` → `isActive`, `hasError`.

## 6. API

- URL: `kebab-case` → `/api/invitation-templates`.
- Metode HTTP sesuai makna (GET, POST, PUT/PATCH, DELETE).
- Body JSON: `camelCase`.

## 7. Database

- Nama tabel & kolom: `snake_case` → `invitation_templates`, `created_at`.
- Primary key: `id`. Foreign key: `{table}_id`.

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
