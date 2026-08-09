<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Changelog · Category : Catatan (living document)
  Version  : 1.0.6 · Status : ✅ Stable · Update : 05-08-2026
-->

# Changelog

> Catatan perubahan penting project BERNADA.ID. Ditulis dari perubahan paling baru.

---

## Release v1.1.0 — The First Experience Release (05-08-2026)

### Release

- 🚀 **Release v1.1.0 — The First Experience Release** (Status: ✅ Stable) — Landing page pertama BERNADA.ID (9 section) di atas CSS Framework Sprint 1. Detail: `.docs/releases/v1.1.0-first-experience.md`.
- ✅ **Audit Sprint 2 PASS** — 20 PASS · 7 WARNING (LOW, non-blocking) · 0 ERROR. Landing page siap rilis (`.docs/audit/LAPORAN-AUDIT-SPRINT-2.html`).
- 🏷️ **Tag git v1.1.0** dibuat — release disetujui Product Owner, Senior Engineer & AI Pair Programmer; **Sprint 2 closed**.

### Homepage

- Menulis `index.html` — landing page 9 section (navbar, hero, about, features, pricing, portfolio, CTA banner, FAQ, footer) Bahasa Indonesia, mobile-first, aksesibel (ARIA, semantik, `:focus-visible`).
- Menulis ulang `assets/css/sections.css` (v1.1.0) — 11 bagian style section murni design token + blok REKOMENDASI TOKEN BARU di akhir file.
- Mengisi `assets/css/responsive.css` (v1.1.0) — media query lengkap xs (480px) → 2xl (1400px).
- Menambahkan interaksi vanilla JS modular di `assets/js/`: `navigation.js` (mobile menu aksesibel + sticky header), `accordion.js` (FAQ accordion), `scroll-effects.js` (scroll reveal + active nav + back-to-top) — mendukung `prefers-reduced-motion`.
- Membuat 7 aset SVG placeholder di `assets/img/` (hero, about, 6 portofolio, favicon).

### Design System

- Menambahkan token baru di `variables.css` — bagian 16 GRADIENT & SURFACE EFFECT (`--gradient-brand`, `--gradient-soft`, `--color-surface-translucent`) dan bagian 17 SIZE & METRIC (`--size-icon-*`, `--size-hero-visual-*`).
- Menambahkan import Google Fonts (Playfair Display & Plus Jakarta Sans) di `main.css`.
- Menambahkan helper `.sr-only` (aksesibilitas) di `utilities.css`.

### Review & Refactor

- Self-review `rules/09`: memperbaiki konflik transform `reveal` vs hover kartu, menambah `isolation` pada visual hero, menokenisasi ukuran ikon berulang.
- Memperluas daftar REKOMENDASI TOKEN BARU di `sections.css` agar mencakup seluruh nilai geometrik mikro.

### Planning & Documentation

- Rewrite `release-naming.md` (v1.0.1) — v1.1.0 = The First Experience Release; v1.2.0 = The Core Features Release; v2.0.0 = The Platform Release.
- Menulis `.docs/sprint-2.md` & `.docs/sections.md`; membuat release document v1.1.0; menyinkronkan `.docs/roadmap.md`, `.docs/design-system.md`, `.ai/context/sprint.md`, `.ai/context/roadmap.md`.

---

## Release v1.0.0 — The Foundation Release (04-08-2026)

### Release

- 🚀 **Release v1.0.0 — The Foundation Release** (Status: ✅ Stable) — Release resmi pertama BERNADA.ID. Menandai selesainya seluruh fondasi CSS Framework. Detail: `.docs/releases/v1.0.0-foundation.md`.

### Engineering Workflow

- Menambahkan `rules/10-engineering-workflow.md` — Engineering Workflow resmi yang wajib diikuti setiap Sprint: Planning → Development → Review → Refactor → Documentation → Audit → Release → Sprint Closed.
- Menandai Development Workflow lama di `00-opencode.md §5` sebagai deprecated.
- Menambahkan `.docs/release-policy.md` — Release Policy resmi (setiap Sprint wajib menghasilkan satu Stable Release).

### Sprint 1 Improvement

- Menyinkronkan seluruh dokumentasi: `04-project-structure.md`, `context/project.md`, `design-system.md`, `sprint-1.md` — referensi `style.css` → `main.css`.
- Menyelesaikan dokumentasi komponen: `card.md`, `badge.md`, `form.md` di `.docs/components/`.
- Merapikan `utilities.css` — header lengkap dengan prinsip dan Last Update.
- Merapikan `sections.css` & `responsive.css` — header lengkap, komentar breakpoint, placeholder yang jelas.

## 03-08-2026

### Layout System

- Menulis ulang `assets/css/layout.css` menjadi 10 bagian layout reusable: container, section, grid, flex, stack, cluster, sidebar, content width, aspect ratio, overflow. Mobile First + murni design token.
- Menghapus class duplikat dari `utilities.css` (`.flex`, `.flex-column`, `.flex-wrap`, `.grid`, `.grid-2/3/4`, `.overflow-hidden`) — kini dimiliki `layout.css` (single responsibility).

### Base Stylesheet

- Membuat `assets/css/base.css` — styling dasar elemen HTML (13 bagian) murni dari design token, tanpa komponen.
- Menambahkan `base.css` ke urutan import `style.css` (setelah reset, sebelum utilities) + import Google Fonts (Playfair Display & Plus Jakarta Sans).
- `base.css` memakai token `--color-*`, `--font-*`, `--line-height-*`, `--spacing-*`, `--border-radius-*`, `--transition-*`, `--opacity-*`.

### 1.0.0 Alpha — Fondasi Awal

- Membuat design system resmi Merah & Emas: `assets/css/variables.css` (token `--color-*` + alias kompatibilitas) dan `.docs/design-system.md`.
- Menulis ulang `assets/css/reset.css` menjadi reset murni 12 bagian tanpa design token.
- Membangun AI Development Framework di `.ai/` (rules, prompts, context, manifesto).
- Menambahkan komponen UI dasar di `components.css`: button (6 varian), card, card-glass, badge, input, textarea.

## 04-08-2026

### Component Architecture Refactor

- Memisahkan `components.css` menjadi folder modular `assets/css/components/` (One File = One Component).
- Membuat `button.css` — komponen tombol dengan 8 varian (primary, secondary, outline, ghost, link, success, danger, gold) + 3 ukuran (sm, md, lg) + state (hover, active, focus-visible, disabled, loading).
- Membuat `card.css` — komponen kartu dengan 3 varian (glass, outline, hover) + internals (header, body, footer).
- Membuat `badge.css` — komponen label dengan 4 varian (primary, success, warning, danger) + 2 ukuran (sm, lg) + icon support.
- Membuat `form.css` — komponen form dengan input, textarea, select, checkbox, radio, switch + states (focus, disabled, error, success) + form groups.
- Memperbarui `style.css` import dari satu `components.css` menjadi 4 file modular.
- Menghapus `assets/css/components.css` (single file lama).
- Mendokumentasikan rekomendasi token baru untuk nilai hardcoded yang belum memiliki token.
- Menyusun roadmap, arsitektur, dan definisi sprint (draft, 🟠 Review).
- Membuat `index.html` (masih kosong — menunggu pembangunan halaman inti).

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.6 | 05-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Sprint 2 closed — Audit PASS + Release v1.1.0 The First Experience (tag v1.1.0) |
| 1.0.5 | 05-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Sprint 2 — Landing page 9 section + interaksi + Release v1.1.0 The First Experience |
| 1.0.4 | 04-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Release v1.0.0 The Foundation Release + Engineering Workflow |
| 1.0.3 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Catat penulisan ulang layout.css & dedup utilities.css |
| 1.0.2 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Catat penambahan base.css & Google Fonts |
| 1.0.1 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Buat changelog, sinkronkan status dokumentasi |
| 1.0.0 | 03-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Initial release |
