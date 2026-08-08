# Design System BERNADA.ID

> Panduan resmi Design System project BERNADA.ID — platform SaaS Undangan Digital.
>
> Dokumen ini adalah sumber kebenaran (*single source of truth*) untuk seluruh token desain, aturan penamaan, dan cara pemakaian komponen pada project.

---

## 1. Filosofi Desain

**Design System** adalah kumpulan aturan, prinsip, dan *design token* yang menjadi standar tunggal untuk membangun tampilan aplikasi. Semua nilai seperti warna, tipografi, spacing, radius, dan lainnya didefinisikan sekali di satu tempat — `assets/css/variables.css` — dan dipakai ulang di seluruh project.

**Mengapa BERNADA.ID menggunakannya?**

- **Konsistensi** — setiap halaman dan komponen terlihat sama, tanpa peduli siapa yang menulisnya.
- **Efisiensi** — desainer dan developer tidak perlu memutuskan ulang nilai yang sama berulang kali.
- **Perawatan mudah** — ubah satu token di `variables.css`, seluruh aplikasi ikut berubah.
- **Skalabilitas** — platform SaaS terus bertambah halaman dan fitur; fondasi yang rapi membuatnya mudah dikembangkan.
- **Kecepatan pengembangan** — komponen baru cukup merakit token yang sudah ada, bukan menciptakan nilai baru.

---

## 2. Karakter Visual Bernada.ID

Karakter visual BERNADA.ID dibangun dari kombinasi **Merah dan Emas** di atas latar hangat yang lembut. Kombinasi ini menciptakan kesan mewah namun tetap modern — pas dengan kebutuhan undangan digital yang romantis dan premium.

| Karakter | Deskripsi | Wujudnya dalam Desain |
| --- | --- | --- |
| **Elegan** | Kesan halus dan berkelas | Tipografi serif *Playfair Display*, radius lembut, aksen emas yang hemat |
| **Hangat** | Terasa dekat dan personal | Latar krem `#F7F3EF`, netral hangat, bayangan lembut |
| **Romantis** | Suasana kasih dan perayaan | Merah brand sebagai warna utama, dekorasi aksen emas |
| **Modern** | Rapi, bersih, fungsional | Skala token konsisten, sans-serif untuk teks, grid responsif |
| **Premium** | Kesan mahal dan mewah | Kontras merah tua + emas, tipografi elegan, shadow berlapis |

Prinsip kuncinya: **gunakan aksen emas secara hemat**. Emas adalah aksen premium, bukan warna utama.

---

## 3. Color System

Seluruh warna didefinisikan di bagian **Color Palette** pada `variables.css` dengan awalan `--color-`. Warna brand utama adalah **Merah (Primary)** dan **Emas (Accent)**.

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| `--color-primary` | `#A12828` | Warna utama brand. Tombol utama, tautan penting, elemen terpilih, `::selection`, scrollbar, outline fokus |
| `--color-primary-light` | `#CF2E2E` | Versi lebih terang dari primary. *Hover* elemen, aksen pada background gelap, gradient |
| `--color-primary-dark` | `#6D0E1B` | Versi paling gelap. State aktif / tertekan, teks di atas latar terang |
| `--color-accent` | `#FFC400` | Aksen premium (emas). Judul aksen, highlight, dekorasi undangan, badge premium. Gunakan hemat |
| `--color-background` | `#F7F3EF` | Latar belakang halaman utama — hangat dan lembut |
| `--color-surface` | `#FFFFFF` | Permukaan kartu, modal, input, dan komponen yang berdiri di atas background |
| `--color-border` | `#E5E5E5` | Garis pemisah (*divider*), border input, batas komponen |
| `--color-text-primary` | `#1F1F1F` | Teks utama: heading dan konten paling penting |
| `--color-text-secondary` | `#555555` | Teks sekunder: body text, paragraf, deskripsi |

### Aturan pemakaian warna

- **Primary** dipakai untuk aksi utama dan identitas — jangan mewarnai semuanya dengan merah.
- **Accent (emas)** hanya untuk momen istimewa: judul hero, ornament, badge premium.
- **Background vs Surface**: halaman memakai `--color-background`; elemen mengambang (kartu, modal) memakai `--color-surface`.
- Teks selalu menggunakan token `--color-text-*`, bukan warna lain.
- Warna status aplikasi memakai token semantik: `--color-success-*`, `--color-warning-*`, `--color-danger-*`, `--color-info-*` (nilai standar UI).

---

## 4. Typography

Tipografi BERNADA.ID menggabungkan serif elegan untuk judul dan sans-serif modern untuk isi — memadukan kesan romantis dengan keterbacaan tinggi.

| Font | Token | Alasan Pemilihan |
| --- | --- | --- |
| **Heading** — *Playfair Display* (serif) | `--font-family-heading` | Serif bergaya *high-contrast* yang elegan dan romantis, sangat cocok untuk judul undangan dan kesan premium |
| **Body** — *Plus Jakarta Sans* (sans-serif) | `--font-family-body` | Sans-serif geometris yang modern dan legible di layar kecil (mobile-first), tetap hangat dan bersahabat |
| **Mono** — *JetBrains Mono* | `--font-family-mono` | Untuk kode, data, dan informasi teknis yang butuh keseragaman karakter |

> Font webfont (Google Fonts) di-import di `main.css`; jika webfont tidak tersedia, sistem memakai *fallback stack* yang sudah disiapkan di dalam token.

---

## 5. Font Size Scale

Skala dimulai dari ukuran mobile (base 16px) menggunakan satuan `rem` agar proporsional terhadap ukuran akar dokumen.

| Token | Nilai | Kegunaan |
| --- | --- | --- |
| `--font-size-xs` | `0.75rem` (12px) | Caption, label kecil, meta info |
| `--font-size-sm` | `0.875rem` (14px) | Teks sekunder, badge, helper text |
| `--font-size-base` | `1rem` (16px) | Teks body default |
| `--font-size-md` | `1.125rem` (18px) | Teks penting, subjudul kecil |
| `--font-size-lg` | `1.25rem` (20px) | Subheading kecil |
| `--font-size-xl` | `1.5rem` (24px) | Subheading |
| `--font-size-2xl` | `1.875rem` (30px) | Heading 3 |
| `--font-size-3xl` | `2.25rem` (36px) | Heading 2 |
| `--font-size-4xl` | `3rem` (48px) | Heading 1 |
| `--font-size-5xl` | `3.75rem` (60px) | Hero besar |
| `--font-size-6xl` | `4.5rem` (72px) | Hero utama |

### Ukuran fluid (heading responsif)

Heading besar memakai `clamp()` agar mengalir mengikuti lebar layar (mobile-first):

| Token | Nilai |
| --- | --- |
| `--font-size-display-sm` | `clamp(1.875rem, 4vw, 2.5rem)` |
| `--font-size-display-md` | `clamp(2.25rem, 5vw, 3rem)` |
| `--font-size-display-lg` | `clamp(3rem, 7vw, 4.5rem)` |

---

## 6. Spacing System

Konsep spacing BERNADA.ID mengikuti **skala 4px**: setiap level adalah kelipatan dari unit dasar. Skala berbasis `rem` (1rem = 16px) sehingga tetap proporsional di berbagai ukuran layar.

> **Aturan emas:** jangan pernah menebak-nebak jarak. Selalu gunakan token spacing yang tersedia.

| Token | Nilai | Contoh Penggunaan |
| --- | --- | --- |
| `--spacing-2xs` | `0.125rem` (2px) | Jarak sangat kecil, dot / ikon kecil |
| `--spacing-xs` | `0.5rem` (8px) | Jarak antar elemen kecil dalam satu grup |
| `--spacing-sm` | `0.75rem` (12px) | Gap antar tombol, padding badge |
| `--spacing-md` | `1rem` (16px) | Jarak standar antar elemen |
| `--spacing-lg` | `1.5rem` (24px) | Padding kartu, padding kontainer |
| `--spacing-xl` | `2rem` (32px) | Padding kartu besar, section kecil |
| `--spacing-2xl` | `2.5rem` (40px) | Jarak antar section |
| `--spacing-3xl` | `3rem` (48px) | Jarak antar section besar |
| `--spacing-4xl` | `3.5rem` (56px) | Padding section (mobile) |
| `--spacing-5xl` | `4rem` (64px) | Padding section besar |
| `--spacing-6xl` | `4.5rem` (72px) | Jarak section hero |
| `--spacing-7xl` | `5rem` (80px) | Jarak hero utama |

---

## 7. Border Radius

Skala radius memberi kesan halus dan modern. Gunakan nilai yang konsisten sesuai hierarki elemen.

| Token | Nilai | Kapan Menggunakan |
| --- | --- | --- |
| `--border-radius-none` | `0` | Elemen persegi penuh, gambar bertepi |
| `--border-radius-xs` | `0.25rem` (4px) | Tag kecil, chip kecil |
| `--border-radius-sm` | `0.5rem` (8px) | Input kecil, komponen ringkas |
| `--border-radius-md` | `0.75rem` (12px) | Tombol, komponen kecil |
| `--border-radius-lg` | `1rem` (16px) | Input, kartu, area konten |
| `--border-radius-xl` | `1.25rem` (20px) | Kartu besar, panel utama |
| `--border-radius-2xl` | `1.5rem` (24px) | Modal, popup, *bottom sheet* |
| `--border-radius-pill` | `9999px` | Bentuk pil: tombol, badge, search bar |
| `--border-radius-full` | `50%` | Lingkaran penuh: avatar, ikon |

**Panduan praktis:** elemen besar memakai radius besar, elemen kecil memakai radius kecil. Tombol dan badge memakai bentuk *pill* untuk kesan modern.

---

## 8. Shadow

Shadow memberi kedalaman pada elemen. Makin tinggi nilainya, makin elegan dan makin "mengambang" elemennya.

| Token | Nilai | Contoh Penggunaan |
| --- | --- | --- |
| `--shadow-xs` | `0 1px 2px rgba(16,24,40,.06)` | Bayangan sangat halus pada elemen datar |
| `--shadow-sm` | `0 1px 3px rgba(16,24,40,.1), 0 1px 2px rgba(16,24,40,.06)` | Kartu default |
| `--shadow-md` | `0 4px 6px -1px rgba(16,24,40,.1), 0 2px 4px -2px rgba(16,24,40,.1)` | Kartu saat *hover*, dropdown ringan |
| `--shadow-lg` | `0 10px 15px -3px rgba(16,24,40,.1), 0 4px 6px -4px rgba(16,24,40,.1)` | Dropdown, popup, popover |
| `--shadow-xl` | `0 20px 25px -5px rgba(16,24,40,.1), 0 8px 10px -6px rgba(16,24,40,.1)` | Modal, overlay |
| `--shadow-2xl` | `0 25px 50px -12px rgba(16,24,40,.25)` | Bayangan kuat untuk elemen paling menonjol |

**Panduan praktis:** naikkan satu level saat elemen berinteraksi (misalnya kartu `--shadow-sm` → `--shadow-md` saat di-*hover*).

---

## 9. Transition

Transition mengatur kecepatan perubahan visual. Nilai gabungan sudah berisi durasi + *timing function* (`cubic-bezier(0.4, 0, 0.2, 1)`).

| Token | Durasi | Kapan Menggunakan |
| --- | --- | --- |
| `--transition-fast` | `150ms` | Efek *hover*, *active*, perubahan kecil (warna, opacity) |
| `--transition-normal` | `250ms` | Perubahan state default: tombol, kartu, input, menu |
| `--transition-slow` | `350ms` | Gerakan besar dan halus: modal, overlay, ekspansi section |

**Panduan praktis:** gunakan **fast** untuk umpan balik instan, **normal** sebagai pilihan default, dan **slow** untuk gerakan dramatis yang butuh kesan premium.

---

## 10. Z-Index

Z-index mengatur lapisan elemen di atas satu sama lain. Urutan layer berikut **wajib** diikuti agar modal, dropdown, dan notifikasi tidak saling menimpa secara salah.

| Urutan | Token | Nilai | Elemen |
| --- | --- | --- | --- |
| 1 | `--z-index-negative` | `-1` | Elemen di belakang konten |
| 2 | `--z-index-base` | `0` | Konten default |
| 3 | `--z-index-header` | `100` | **Header** / navbar |
| 4 | `--z-index-dropdown` | `1000` | **Dropdown** |
| 5 | `--z-index-sticky` | `1100` | Elemen sticky |
| 6 | `--z-index-overlay` | `1200` | Overlay / backdrop |
| 7 | `--z-index-modal` | `1300` | **Modal** / dialog |
| 8 | `--z-index-popover` | `1400` | Popover |
| 9 | `--z-index-tooltip` | `1500` | **Tooltip** |
| 10 | `--z-index-toast` | `1600` | **Toast** / notifikasi |
| — | `--z-index-max` | `2147483647` | Lapisan tertinggi (khusus) |

Urutan hirarki utama: `Header < Dropdown < Modal < Tooltip < Toast`.

---

## 11. Responsive Breakpoint

BERNADA.ID menggunakan konsep **Mobile First**: gaya ditulis untuk layar terkecil lebih dulu, lalu ditingkatkan (*progressive enhancement*) menggunakan media query `min-width`.

```css
/* Gaya dasar untuk mobile */
.card { padding: var(--spacing-md); }

/* Tingkatkan di layar yang lebih besar */
@media (min-width: var-breakpoint-reference) {
  .card { padding: var(--spacing-lg); }
}
```

> **Catatan penting:** CSS Custom Properties tidak bisa dipakai di dalam media query. Nilai `--breakpoint-*` dipakai sebagai referensi dokumentasi dan sumber `window.matchMedia` di JavaScript.

| Breakpoint | Token | Nilai | Perangkat |
| --- | --- | --- | --- |
| XS | `--breakpoint-xs` | `480px` | Smartphone kecil |
| SM | `--breakpoint-sm` | `576px` | Smartphone |
| MD | `--breakpoint-md` | `768px` | Tablet |
| LG | `--breakpoint-lg` | `992px` | Laptop |
| XL | `--breakpoint-xl` | `1200px` | Desktop |
| 2XL | `--breakpoint-2xl` | `1400px` | Desktop besar |

Kontainer mengikuti lebar yang selaras: `--container-sm` (540px) hingga `--container-2xl` (1280px), dengan `--container-max-width` sebagai kontainer utama project.

---

## 12. Naming Convention

Seluruh token memakai pola penamaan terstruktur dan konsisten:

```text
--kategori-sifat-varian
```

- **Kategori** — kelompok token: `color`, `font`, `spacing`, `radius` (border-radius), `shadow`, `transition`, `z-index`, `container`, `breakpoint`, `opacity`.
- **Sifat** — nama fungsional token.
- **Varian** (opsional) — skala atau turunan: angka skala, `light`/`dark`, `sm`/`md`/`lg`.

| Contoh Token | Pola |
| --- | --- |
| `--color-primary` | kategori `color` + sifat `primary` |
| `--color-primary-light` | kategori `color` + sifat + varian `light` |
| `--spacing-md` | kategori `spacing` + varian skala |
| `--border-radius-lg` | kategori `border-radius` + varian skala |
| `--shadow-md` | kategori `shadow` + varian skala |
| `--font-size-sm` | kategori `font-size` + varian skala |
| `--font-weight-semibold` | kategori `font-weight` + sifat |
| `--z-index-modal` | kategori `z-index` + sifat |
| `--breakpoint-md` | kategori `breakpoint` + varian skala |

**Aturan penamaan:**

- Semua huruf **kecil** (`lowercase`).
- Kata dipisah dengan **tanda hubung** (`-`).
- **Tidak ada** singkatan membingungkan — gunakan nama yang deskriptif.
- Skala warna memakai angka: `-50` (paling terang) hingga `-900` (paling gelap), `500` adalah base.
- Nama menggambarkan **fungsi**, bukan tampilan (contoh: `--color-text-secondary`, bukan `--color-gray-4`).

---

## 13. Best Practice

Berikut aturan yang wajib dipatuhi oleh seluruh anggota tim:

1. **Jangan menggunakan hardcoded color.** Warna di luar Design System dilarang.
2. **Selalu gunakan CSS Variables.** Ambil nilai melalui `var(--token)` — jangan tulis nilai mentah.
3. **Jangan membuat spacing sembarangan.** Gunakan skala `--spacing-*` yang sudah ditentukan.
4. **Gunakan Design Token.** Semua nilai desain (warna, tipografi, radius, shadow, dll.) harus berasal dari token.
5. **Semua komponen harus mengikuti Design System.** Komponen baru disusun dari token yang ada, tidak menciptakan nilai baru tanpa persetujuan.

Tambahan: jika token yang dibutuhkan belum tersedia, ajukan penambahan di `variables.css` bersama penjaga Design System — jangan buat nilai ad-hoc.

---

## 14. Contoh Penggunaan

Contoh komponen yang dibangun murni dari design token:

### Button

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  font-family: var(--font-family-body);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  transition: var(--transition-normal);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-primary:hover {
  background: var(--color-primary-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}
```

### Card

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-6px);
}
```

### Input

```css
.input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family-body);
  font-size: var(--font-size-base);
  transition: var(--transition-normal);
}

.input::placeholder {
  color: var(--color-text-secondary);
}

.input:focus {
  border-color: var(--color-primary);
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

---

## 15. Gradient & Surface Effect (Sprint 2)

Token efek visual section landing page (ditambahkan Sprint 2 — The First Experience):

- **`--gradient-brand`** — gradien Merah → Emas untuk banner CTA / highlight premium, tersusun dari token brand (`--color-primary-800` → `--color-primary` → `--color-gold-600`).
- **`--gradient-soft`** — gradien lembut hangat untuk latar hero / about (Primary-50 → Surface).
- **`--color-surface-translucent`** — permukaan putih translusen (rgba putih 85%) untuk header glass & panel menu mobile.

## 16. Size & Metric (Sprint 2)

Skala ukuran ikon dan elemen visual yang dipakai berulang di landing page:

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `--size-icon-lg` | 1.5rem | ikon besar — fitur, hamburger |
| `--size-icon-md` | 1.375rem | ikon sedang — poin about |
| `--size-icon-sm` | 1.125rem | ikon kecil — centang pricing, kontak |
| `--size-icon-tile-lg` | 3rem | kotak ikon fitur |
| `--size-icon-tile-md` | 2.75rem | kotak ikon poin about |
| `--size-hero-visual` | 24rem | lebar visual hero (mobile) |
| `--size-hero-visual-sm` | 26rem | lebar visual hero (smartphone) |

Nilai geometrik mikro (offset 2px, rotate hamburger, rasio portofolio, ornamen CTA) tercatat di daftar **REKOMENDASI TOKEN BARU** di akhir `sections.css` dan menunggu keputusan penjaga Design System.

---

## Penutup

Design System BERNADA.ID adalah dokumen hidup (*living document*). Seiring pertumbuhan project — halaman baru, fitur baru, komponen baru — sistem token akan terus dievaluasi, dilengkapi, dan disempurnakan.

Prinsip yang selalu dipegang: **konsistensi di atas segalanya**. Setiap penambahan harus melewati aturan penamaan dan token yang sudah ada, agar BERNADA.ID tetap elegan, hangat, romantis, modern, dan premium di setiap versinya.

---

Bernada.ID — Digital Wedding Invitation Platform · v1.0.0 Alpha
