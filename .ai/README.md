<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : AI Development Framework - Index · Category : Framework Entry Point
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# AI Development Framework BERNADA.ID

> **Engineering Handbook** — sistem kerja permanen yang menjadi budaya kerja seluruh AI Pair Programmer yang bergabung dalam project BERNADA.ID.
>
> **Tujuan utama:** *"Membangun AI yang mengikuti standar tim, bukan memaksa tim mengikuti kebiasaan AI."*

Dokumen ini adalah **pintu masuk** framework. Baca dari sini untuk memahami struktur, fungsi setiap file, dan cara menggunakannya.

---

## Prinsip Framework

- **Modular** — setiap aturan, prompt, dan konteks berdiri sendiri dan mudah diganti.
- **Mudah dikembangkan** — menambah aturan baru cukup menambah file baru dengan nomor urut.
- **Terdokumentasi dengan baik** — seluruh file mengikuti standar dokumentasi yang sama.
- **Reusable** — struktur framework tidak terikat teknologi tertentu, siap dipakai di project lain.

---

## Struktur Folder

```text
.ai/
│
├── README.md                     ← Kamu sedang di sini (index framework)
│
├── manifesto.md                  ← Filosofi & budaya engineering BERNADA.ID
│
├── context/                      ← Konteks project yang selalu diperbarui
│   ├── project.md                ← Gambaran umum project & tech stack
│   ├── roadmap.md                ← Arah pengembangan jangka panjang
│   ├── architecture.md           ← Arsitektur & prinsip clean architecture
│   └── sprint.md                 ← Status sprint yang sedang berjalan
│
├── prompts/                      ← Template prompt siap pakai
│   ├── create-feature.md         ← Membangun fitur end-to-end
│   ├── create-component.md       ← Membangun komponen UI
│   ├── create-api.md             ← Membangun endpoint API
│   ├── review.md                 ← Code review berbasis checklist
│   ├── refactor.md               ← Refactor yang aman & terukur
│   └── documentation.md          ← Membuat / memperbarui dokumentasi
│
└── rules/                        ← Aturan wajib (urutan = prioritas)
    ├── 00-opencode.md            ← CONSTITUTION AI (prioritas tertinggi)
    ├── 01-documentation.md       ← Standar dokumentasi & versioning
    ├── 02-coding-standard.md     ← Standar penulisan kode
    ├── 03-design-system.md       ← Aturan penggunaan design system
    ├── 04-project-structure.md   ← Struktur project & penempatan file
    ├── 05-naming-convention.md   ← Aturan penamaan
    ├── 06-git-workflow.md        ← Alur git, branch, commit, PR
    ├── 07-security.md            ← Aturan keamanan aplikasi
    ├── 08-testing.md             ← Standar pengujian
    └── 09-review-checklist.md    ← Checklist self-review wajib
```

---

## Fungsi Setiap File

### `manifesto.md`

Filosofi engineering BERNADA.ID: vision, mission, prinsip engineering, prinsip AI, nilai tim, dan Golden Rule. Ini adalah identitas budaya — **setiap AI dan manusia harus membacanya sebelum bekerja**.

### `context/`

Memberikan konteks terkini agar AI tidak menebak-nebak.

| File | Fungsi |
| --- | --- |
| `project.md` | Gambaran project, brand, tech stack, dan status saat ini |
| `roadmap.md` | Arah jangka panjang: fase alpha, beta, GA, dan pasca-launch |
| `architecture.md` | Arsitektur aplikasi & prinsip desain yang dipakai |
| `sprint.md` | Sprint yang berjalan: tujuan, lingkup, status, dan referensi dokumen sprint |

### `prompts/`

Template prompt yang siap disalin. Setiap template mewajibkan AI mengikuti **workflow** dan **rules** terkait.

| File | Fungsi |
| --- | --- |
| `create-feature.md` | Membangun fitur baru dari requirement hingga final review (end-to-end) |
| `create-component.md` | Membangun komponen UI sesuai design system & coding standard |
| `create-api.md` | Membangun endpoint API: validasi, error handling, keamanan, dokumentasi |
| `review.md` | Menjalankan code review dengan checklist dan level temuan |
| `refactor.md` | Merombak kode tanpa mengubah perilaku, dengan pengujian sebagai pengaman |
| `documentation.md` | Membuat atau memperbarui dokumentasi sesuai standar `01-documentation.md` |

### `rules/`

**Aturan wajib.** Urutan nomor = urutan prioritas. `00-opencode.md` adalah **Constitution AI** dan menang atas semua aturan lain.

| File | Fungsi |
| --- | --- |
| `00-opencode.md` | Konstitusi AI: hierarki aturan, peran tim, workflow, komunikasi AI, learning mode |
| `01-documentation.md` | Format dokumentasi wajib: document info, version history, changelog, status |
| `02-coding-standard.md` | Standar kode: struktur, format, komentar, larangan hardcoded |
| `03-design-system.md` | Wajib memakai design token; larangan nilai warna/spacing ad-hoc |
| `04-project-structure.md` | Penempatan file & arsitektur folder |
| `05-naming-convention.md` | Aturan penamaan file, variabel, CSS custom property, API, DB |
| `06-git-workflow.md` | Branch, commit message, pull request, review sebelum merge |
| `07-security.md` | Larangan secret, validasi input, pencegahan injeksi & XSS |
| `08-testing.md` | Standar dan pendekatan pengujian |
| `09-review-checklist.md` | Checklist self-review sebelum task dinyatakan selesai |

---

## Cara Menggunakan

1. **Baca `manifesto.md`** untuk memahami budaya kerja.
2. **Baca `rules/00-opencode.md`** — Constitution AI, aturan tertinggi dan **satu-satunya sumber (single source of truth)** untuk hierarki aturan & development workflow.
3. **Perbarui `context/`** setiap kali konteks project berubah.
4. **Pilih template di `prompts/`** sesuai jenis pekerjaan dan salin ke AI.
5. **AI mengikuti workflow & rules**, lalu melakukan **self-review** (`09-review-checklist.md`) sebelum menyatakan selesai.
6. **Manusia memegang keputusan akhir** — AI hanya memberi rekomendasi teknis.

---

## Cara Menambah Aturan Baru

- Aturan baru = file baru di `rules/` dengan nomor urut berikutnya (contoh `10-laravel.md`, `11-mobile.md`).
- Semua aturan tetap berada di bawah `00-opencode.md`.
- Prompt baru = file baru di `prompts/`; konteks baru = file baru di `context/`.
- Setiap file wajib memakai format dokumentasi standar (lihat `rules/01-documentation.md`).

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release

---

*"Membangun AI yang mengikuti standar tim, bukan memaksa tim mengikuti kebiasaan AI."* — **BERNADA.ID Engineering**
