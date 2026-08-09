<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Sprint 2 · Category : Panduan (source of truth)
  Version  : 1.0.2 · Status : ✅ Closed · Update : 05-08-2026
-->

# Sprint 2 — The First Experience (Homepage)

> Dokumen sprint resmi. Ringkasan untuk AI ada di `.ai/context/sprint.md`.
>
> Sprint ini mengikuti **Engineering Workflow** (`rules/10-engineering-workflow.md`).

---

## Info Sprint

| Item | Detail |
| --- | --- |
| Sprint | Sprint 2 — The First Experience (Homepage) |
| Tujuan | Membangun landing page pertama BERNADA.ID di atas CSS Framework Sprint 1, lengkap dengan responsive & interaksi |
| Status | ✅ Closed |
| Release | v1.1.0 — The First Experience Release |
| Tanggal | 05-08-2026 |

---

## Sprint Goal

Menghadirkan **pengalaman pertama pengguna** BERNADA.ID berupa Landing Page yang elegan, responsif, dan interaktif — dibangun sepenuhnya di atas design system & komponen Sprint 1 — sebagai gerbang menuju platform undangan digital.

---

## Hasil Sprint

- ✅ **Audit PASS** — 20 PASS · 7 WARNING (LOW, non-blocking) · 0 ERROR (`.docs/audit/LAPORAN-AUDIT-SPRINT-2.html`).
- ✅ **Release v1.1.0 — The First Experience Release** — disetujui Product Owner, Senior Engineer & AI Pair Programmer; tag git `v1.1.0` dibuat (`.docs/releases/v1.1.0-first-experience.md`).
- ✅ **Sprint Closed** — seluruh Acceptance Criteria terpenuhi; Sprint 2 resmi ditutup.

---

## Scope

Yang dikerjakan pada Sprint 2:

1. **Planning** — dokumen Sprint 2, rewrite `release-naming.md` (v1.1.0 = The First Experience Release), update `roadmap.md` & `context/roadmap.md`
2. **Homepage** — `index.html` satu halaman (Bahasa Indonesia) dengan 9 section
3. **Section Styles** — `assets/css/sections.css` (murni design token)
4. **Responsive** — `assets/css/responsive.css` (Mobile First, breakpoint xs → 2xl)
5. **Interaction** — `assets/js/` vanilla JS modular & aksesibel
6. **Aset Visual** — SVG placeholder lokal di `assets/img/`
7. **Documentation** — `changelog.md`, `sections.md`, release document, sinkron `.ai/context/*`
8. **Audit** — `LAPORAN-AUDIT-SPRINT-2.html`
9. **Release** — tag git v1.1.0, approval, sprint closed

---

## Out of Scope

| Item | Alasan |
| --- | --- |
| Dashboard | Belum diperlukan; fokus pengalaman publik |
| Login / Registrasi | Bergantung backend & auth |
| Database | Belum dirancang/dibuat |
| Payment / Pricing engine | Harga hanya placeholder display |
| Admin Panel | Belum diperlukan |
| API | Frontend statis; komunikasi backend belum ada |
| Server (Node.js/Express) | Belum dimulai |
| Halaman lain selain Homepage | Homepage saja |

---

## Deliverables

| # | Hasil | Lokasi |
| --- | --- | --- |
| 1 | Dokumen Sprint 2 | `.docs/sprint-2.md` |
| 2 | Landing Page 9 section | `index.html` |
| 3 | Section styles | `assets/css/sections.css` |
| 4 | Responsive styles | `assets/css/responsive.css` |
| 5 | Script interaksi | `assets/js/navigation.js` · `accordion.js` · `scroll-effects.js` |
| 6 | Aset SVG placeholder | `assets/img/*.svg` |
| 7 | Token baru (bila diperlukan) | `assets/css/variables.css` |
| 8 | Dokumentasi section | `.docs/sections.md` |
| 9 | Changelog diperbarui | `.docs/changelog.md` |
| 10 | Release document | `.docs/releases/v1.1.0-first-experience.md` |
| 11 | Laporan audit | `.docs/audit/LAPORAN-AUDIT-SPRINT-2.html` |
| 12 | Release v1.1.0 + tag git | Repo BERNADA |

---

## Section Planning

Urutan section Landing Page (satu halaman, scroll tunggal):

| # | Section | Konten Utama | Dependensi |
| --- | --- | --- | --- |
| 1 | Navbar | Wordmark, menu (Fitur, Harga, Portofolio, FAQ), CTA "Buat Undangan", hamburger mobile, sticky | `--header-height`, `--z-index-header`, `.btn` |
| 2 | Hero | Headline serif + aksen emas, subteks, 2 CTA, visual SVG | `--font-size-display-*`, `.btn-lg` |
| 3 | About | Cerita brand, misi, visual SVG, poin kunci | `.grid-2`, `.card` |
| 4 | Features | 6 kartu fitur | `.grid-3`, `.card` |
| 5 | Pricing | 3 tier (Gratis/Premium/Gold) — harga placeholder | `.card`, `.badge` |
| 6 | Portfolio | 6 contoh undangan | `.grid-3`, `.card-hover` |
| 7 | CTA | Banner ajakan, gradien merah/gold | `.btn-gold` |
| 8 | FAQ | Accordion 5–6 pertanyaan | `accordion.js`, `aria-expanded` |
| 9 | Footer | Brand, link, kontak, copyright | `.cluster`, `.grid` |

---

## Acceptance Criteria

Sprint dinyatakan selesai apabila:

1. `index.html` terbangun dengan 9 section di atas design token & komponen Sprint 1 — tanpa styling yang mengesampingkan token.
2. Seluruh section responsif di semua breakpoint (Mobile First), diuji xs (480px) hingga 2xl (1400px).
3. Interaksi JS berfungsi: mobile menu, sticky header, smooth scroll + active nav, FAQ accordion, scroll reveal, back-to-top — aksesibel (keyboard, `:focus-visible`, `prefers-reduced-motion`).
4. Tidak ada nilai hardcoded (warna/spacing/radius/shadow) di luar design token.
5. Seluruh perubahan terdokumentasi di `.docs/changelog.md` dan dokumentasi terkait sinkron.
6. Audit Sprint 2 PASS (Internal Code Review, Architecture, QA, Engineering).
7. Release v1.1.0 **The First Experience Release** disetujui (Product Owner + Senior Engineer + AI) dan dicatat di changelog.

---

## Risks

| # | Risiko | Mitigasi |
| --- | --- | --- |
| 1 | Copywriting (judul, harga pricing, FAQ) butuh persetujuan bisnis | Draf konten disiapkan saat Development; konfirmasi PO sebelum Release |
| 2 | Harga pricing placeholder (payment off-scope) berpotensi salah dipahami | Beri label jelas "sample / menyusul" |
| 3 | SVG placeholder kurang "premium" | Review visual saat Refactor; gradien elegan dari token |
| 4 | Token baru ditambahkan tanpa dokumentasi | Tambah ke `variables.css` + catat di changelog & design-system |
| 5 | Rekomendasi token hardcoded Sprint 1 menumpuk | Audit berkala; dahulukan token yang dipakai section |
| 6 | Responsive & aksesibilitas sulit diverifikasi manual | Uji semua breakpoint; validasi keyboard + reduced motion |
| 7 | Repo git baru — disiplin commit belum terbentuk | Commit per milestone sesuai `rules/06` |

---

## Timeline

Estimasi: **± 7 hari kerja** (sesuai Engineering Workflow).

| Tahap | Aktivitas | Estimasi |
| --- | --- | --- |
| Planning | Dokumen sprint, release naming, roadmap | 1 hari |
| Development | Homepage (9 section) + sections.css | 2 hari |
| Development | Responsive + SVG assets | 1 hari |
| Development | Interaction (3 file JS) | 1 hari |
| Review & Refactor | Self-review `rules/09`, perbaikan | 1 hari |
| Documentation | Changelog, sections.md, release doc, sync context | 1 hari |
| Audit | Laporan audit + perbaikan temuan | 1 hari |
| Release | v1.1.0 + approval + sprint closed | 0.5 hari |

---

## Keputusan Planning

| Keputusan | Nilai |
| --- | --- |
| Release | v1.1.0 — The First Experience Release (rewrite `release-naming.md`) |
| Bahasa konten | Bahasa Indonesia |
| Aset visual | SVG placeholder lokal (`assets/img/`) |
| Cakupan interaksi | Mobile menu, sticky header, smooth scroll + active nav, FAQ accordion, scroll reveal, back-to-top |
| Git | `git init` + commit per milestone + tag v1.1.0 |

---

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.2 | 05-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Closed | Sprint 2 closed — Audit PASS + Release v1.1.0 The First Experience (tag v1.1.0) |
| 1.0.1 | 05-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Proses | Sprint 2 dimulai — Planning (rewrite release-naming disetujui) |
| 1.0.0 | 04-08-2026 | AI Pair Programmer + Senior Engineer | 🟠 Review | Definisi Sprint 2 — The First Experience |
