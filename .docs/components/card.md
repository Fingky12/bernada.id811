<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Card Component · Category : Components
  Version  : 1.0.0 · Status : ✅ Stable · Update : 04-08-2026
-->

# Card

> Kontainer konten terstruktur untuk menampilkan informasi secara terorganisir.

---

## 1. Informasi Dokumen

| Item | Detail |
| --- | --- |
| Nama | Card Component |
| Versi | 1.0.0 |
| Status | ✅ Stable |
| Update Terakhir | 04-08-2026 |
| File | `assets/css/components/card.css` |
| Dependensi | `assets/css/variables.css` |

---

## 2. Tujuan Komponen

Card adalah kontainer fleksibel untuk menampilkan konten secara terstruktur:

- **Informasi** — profil, detail, ringkasan
- **Konten** — artikel, postingan, produk
- **Interaksi** — card yang bisa diklik untuk navigasi
- **Tampilan** — glassmorphism, outline, hover effect

Card harus terlihat rapi, terstruktur, dan mudah di扫描.

---

## 3. Class API

### Base

| Class | Keterangan |
| --- | --- |
| `.card` | Base card — default dengan shadow dan hover |

### Varian

| Class | Keterangan | Gunakan Untuk |
| --- | --- | --- |
| `.card-glass` | Efek glassmorphism (transparan + blur) | Di atas gambar / gradient |
| `.card-outline` | Card dengan border tanpa shadow | Tampilan ringan |
| `.card-hover` | Card dengan efek hover halus | Interaksi klik |

### Internals

| Class | Keterangan |
| --- | --- |
| `.card-header` | Bagian atas card (judul, ikon) |
| `.card-body` | Bagian utama card (konten) |
| `.card-footer` | Bagian bawah card (aksi, meta) |

---

## 4. HTML Example

### Varian Dasar

```html
<!-- Default — dengan shadow dan hover -->
<div class="card">
  <h3>Judul Card</h3>
  <p>Isi konten card di sini.</p>
</div>

<!-- Glass — efek glassmorphism -->
<div class="card card-glass">
  <h3>Glass Card</h3>
  <p>Konten di atas gambar.</p>
</div>

<!-- Outline — border tanpa shadow -->
<div class="card card-outline">
  <h3>Outline Card</h3>
  <p>Tampilan ringan.</p>
</div>

<!-- Hover — efek hover halus -->
<div class="card card-hover">
  <h3>Hover Card</h3>
  <p>Klik untuk aksi.</p>
</div>
```

### Dengan Internals

```html
<div class="card">
  <div class="card-header">
    <h3>Judul Artikel</h3>
    <span class="badge badge-primary">Baru</span>
  </div>
  <div class="card-body">
    <p>Ini adalah konten utama card yang berisi informasi penting.</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary btn-sm">Baca Selengkapnya</button>
  </div>
</div>
```

### Card Grid

```html
<div class="grid grid-3">
  <div class="card">
    <div class="card-header">
      <h3>Fitur 1</h3>
    </div>
    <div class="card-body">
      <p>Deskripsi fitur pertama.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header">
      <h3>Fitur 2</h3>
    </div>
    <div class="card-body">
      <p>Deskripsi fitur kedua.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header">
      <h3>Fitur 3</h3>
    </div>
    <div class="card-body">
      <p>Deskripsi fitur ketiga.</p>
    </div>
  </div>
</div>
```

### Glass Card di atas Gambar

```html
<div style="position: relative;">
  <img src="hero.jpg" alt="Hero" style="width: 100%; border-radius: var(--border-radius-xl);">
  <div class="card card-glass" style="position: absolute; bottom: 2rem; left: 2rem; right: 2rem;">
    <h3>Judul Hero</h3>
    <p>Deskripsi singkat di atas gambar.</p>
    <button class="btn btn-primary">Pelajari Lebih Lanjut</button>
  </div>
</div>
```

---

## 5. Accessibility

### Keyboard Support

| Key | Action |
| --- | --- |
| `Enter` | Jika card memiliki `role="button"` atau link |
| `Space` | Jika card memiliki `role="button"` |
| `Tab` | Memindahkan fokus ke card berikutnya |

### Focus Management

- Card dengan `.card-hover` memiliki `cursor: pointer` — pertimbangkan untuk menambahkan `role="button"` jika bisa diklik
- Gunakan `tabindex="0"` jika card interaktif
- Sertakan `aria-label` atau `aria-labelledby` untuk screen reader

### Screen Reader

```html
<!-- Card interaktif -->
<div class="card card-hover" role="button" tabindex="0" aria-label="Baca artikel: Judul Artikel">
  <h3 id="article-title">Judul Artikel</h3>
  <p>Deskripsi artikel.</p>
</div>

<!-- Card statis -->
<div class="card" aria-labelledby="card-heading">
  <h3 id="card-heading">Informasi Penting</h3>
  <p>Konten card.</p>
</div>
```

---

## 6. Best Practice

1. **Gunakan card untuk konten terstruktur** — bukan untuk layout
2. **Kombinasikan dengan internals** untuk hierarki konten yang jelas
3. **Gunakan varian yang tepat** — glass untuk di atas gambar, outline untuk tampilan ringan
4. **Hindari terlalu banyak card** — pilih yang paling penting
5. **Pastikan kontras warna** — terutama untuk card glass
6. **Gunakan grid untuk multiple card** — layout konsisten

---

## 7. Do & Don't

### Do

```html
<!-- ✅ Card dengan hierarki jelas -->
<div class="card">
  <div class="card-header">
    <h3>Judul</h3>
  </div>
  <div class="card-body">
    <p>Konten utama.</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary btn-sm">Aksi</button>
  </div>
</div>

<!-- ✅ Card interaktif dengan aksesibilitas -->
<div class="card card-hover" role="button" tabindex="0" aria-label="Lihat detail">
  <h3>Produk</h3>
  <p>Deskripsi produk.</p>
</div>
```

### Don't

```html
<!-- ❌ Card tanpa struktur -->
<div class="card">
  <img src="produk.jpg">
  <h3>Produk</h3>
  <p>Deskripsi</p>
  <button>Beli</button>
  <button>Detail</button>
</div>

<!-- ❌ Terlalu banyak card di satu baris -->
<div class="grid grid-4">
  <!-- 12 card — terlalu banyak, gunakan pagination atau filter -->
</div>

<!-- ❌ Card tanpa heading -->
<div class="card">
  <p>Hanya paragraf tanpa judul.</p>
</div>
```

---

## 8. Version History

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.0 | 04-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Initial release — 4 varian, internals |

---

> **v1.0.0** · ✅ Stable · 04-08-2026 · BERNADA.ID Engineering Handbook
