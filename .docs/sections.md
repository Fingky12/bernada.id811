<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Sections · Category : Panduan (living document)
  Version  : 1.0.0 · Status : 🟠 Proses · Update : 05-08-2026
-->

# Sections — Landing Page

> Struktur, styling, dan interaksi 9 section landing page BERNADA.ID (Sprint 2 — The First Experience).

---

## Lokasi File

| Fungsi | Lokasi |
| --- | --- |
| Markup section | `index.html` |
| Style section | `assets/css/sections.css` (murni design token) |
| Responsive | `assets/css/responsive.css` (Mobile First, xs → 2xl) |
| Interaksi | `assets/js/navigation.js` · `accordion.js` · `scroll-effects.js` |
| Aset visual | `assets/img/*.svg` |

---

## Daftar Section

Urutan section (satu halaman, scroll tunggal, Bahasa Indonesia):

| # | Section | Class utama | Konten |
| --- | --- | --- | --- |
| 1 | Navbar | `.site-header`, `.navbar`, `.nav-menu` | Wordmark, 6 menu, CTA "Buat Undangan", hamburger mobile, sticky + glass |
| 2 | Hero | `.hero`, `.hero-inner` | Headline serif + aksen, subteks, 2 CTA, 3 statistik, visual undangan SVG |
| 3 | About | `.about`, `.about-inner` | Cerita brand, visual cincin, 3 poin kunci berikon |
| 4 | Features | `.features`, `.grid-3`, `.feature-card` | 6 kartu fitur berikon |
| 5 | Pricing | `.pricing-grid`, `.pricing-card` | 3 tier (Gratis / Premium / Gold) + badge popular — harga placeholder |
| 6 | Portfolio | `.portfolio`, `.grid-3`, `.portfolio-card` | 6 contoh undangan (nama ilustrasi) |
| 7 | CTA Banner | `.cta`, `.cta-banner` | Ajakan penutup, gradien Merah → Emas, ornamen translusen |
| 8 | FAQ | `.faq`, `.accordion` | Accordion 5 pertanyaan |
| 9 | Footer | `.site-footer`, `.footer-top` | Brand, navigasi, layanan, kontak, copyright, back-to-top |

---

## Interaksi (Vanilla JS)

Ketiga script dimuat `defer` dan dalam bentuk IIFE + `'use strict'`:

### `navigation.js`
- Toggle menu mobile (panel geser kanan) via `.nav-toggle` + class `.is-open` / `body.nav-open`.
- Sinkronisasi `aria-expanded` dan `aria-label` ("Buka/Tutup menu").
- Tutup via tombol, klik link di dalam menu, dan tombol `Escape` (fokus kembali ke toggle).
- Fokus dipindah ke link pertama menu saat dibuka.
- Breakpoint desktop memakai `matchMedia('(min-width: 992px)')` (referensi `--breakpoint-lg`) — menu dianggap statis di atasnya.
- Sticky header: class `.is-scrolled` ditambah/dihapus saat halaman digulir.

### `accordion.js`
- Satu item FAQ terbuka dalam satu waktu; item lain ditutup otomatis.
- Sinkronisasi `aria-expanded` + class `.is-open`.

### `scroll-effects.js`
- `IntersectionObserver` untuk scroll reveal (class `.reveal` + `.is-visible`).
- Menandai link nav aktif (`.is-active`) berdasarkan posisi scroll section ber-id.
- Back-to-top muncul (`.is-visible`) setelah scroll melewati 600px.

### Aksesibilitas
- Seluruh interaksi berbasis state di DOM (class/aria), bukan inline style.
- `prefers-reduced-motion` dipangkas di `animations.css` / `reset.css`.
- Jika JS nonaktif: konten tetap tampil penuh (reveal tidak menyembunyikan tanpa `.js-enabled`).

---

## Aset Visual (SVG placeholder)

| File | Ukuran (px) | Digunakan di |
| --- | --- | --- |
| `hero-invitation.svg` | 480 × 540 | Hero |
| `about-rings.svg` | 480 × 400 | About |
| `portfolio-1.svg` … `portfolio-6.svg` | 400 × 520 | Portfolio |
| `favicon.svg` | — | Ikon browser |

---

## Breakpoint

| Breakpoint | Nilai | Penyesuaian utama |
| --- | --- | --- |
| xs | 480px | default mobile |
| sm | 576px | visual hero diperbesar (`--size-hero-visual-sm`) |
| md | 768px | hero padding lega, pricing 3 kolom, CTA lebih besar, footer 2 kolom |
| lg | 992px | navbar baris statis, hero & about 2 kolom, footer 4 kolom |
| xl | 1200px | jarak section-head lebih lega |
| 2xl | 1400px | shadow visual hero lebih dalam |

---

## Catatan Review (Sprint 2)

- Konflik `transform` antara scroll reveal dan hover kartu diperbaiki dengan menghapus `.reveal` dari kartu yang punya efek hover naik (feature, pricing, portfolio).
- Visual hero memakai `isolation: isolate` agar bingkai putus-putus tidak tenggelam ke latar gradien.
- Ukuran ikon berulang ditokenisasi di `variables.css` bagian 17 (`--size-icon-*`, `--size-hero-visual-*`).
- Nilai geometrik mikro (offset, rotate, rasio, ornamen) tercatat di daftar **REKOMENDASI TOKEN BARU** akhir `sections.css`.

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.0 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Dokumentasi section landing page Sprint 2 |
