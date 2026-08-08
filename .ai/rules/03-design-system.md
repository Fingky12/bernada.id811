<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Rule - Design System · Category : Rules
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# 03 — Design System

> Design System adalah sumber tunggal untuk seluruh tampilan BERNADA.ID. **Setiap komponen dan halaman wajib dibangun dari design token.**

---

## 1. Sumber Resmi

| Aset | Lokasi |
| --- | --- |
| Design token (CSS Custom Properties) | `assets/css/variables.css` |
| Panduan & filosofi | `.docs/design-system.md` |
| Komponen berbasis token | `assets/css/components/` (button, card, badge, form) |

## 2. Aturan Wajib

1. **Selalu gunakan CSS Variables** — ambil nilai melalui `var(--token)`.
2. **Dilarang nilai hardcoded** untuk warna, spacing, radius, shadow, dan font.
3. **Gunakan token `--color-*`** untuk warna baru (awalan `--color-`).
4. **Spacing hanya dari skala `--spacing-*`** — jangan menebak jarak.
5. **Radius dari `--border-radius-*`**, shadow dari `--shadow-*`, transition dari `--transition-*`.
6. **Aksen emas (`--color-accent`) digunakan hemat** — aksen premium, bukan warna utama.
7. **Konsistensi > kreativitas** — jangan membuat "nilai baru" bila token sudah ada.

## 3. Jika Token Belum Ada

- Token yang dibutuhkan belum ada → **ajukan penambahan** ke `variables.css`.
- Jangan membuat nilai ad-hoc di komponen.
- Penambahan token wajib didokumentasikan (design system + changelog).

## 4. Komponen

- Komponen dibangun di atas token dan mengikuti pola komponen yang sudah ada.
- State komponen lengkap: default, hover, focus, active, disabled (jika relevan).
- Perhatikan aksesibilitas: kontras teks, `:focus-visible`, label.

## 5. Referensi Cepat

```css
.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--border-radius-pill);
  padding: var(--spacing-sm) var(--spacing-lg);
  transition: var(--transition-normal);
}
```

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
