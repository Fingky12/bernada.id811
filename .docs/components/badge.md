<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Badge Component · Category : Components
  Version  : 1.0.0 · Status : ✅ Stable · Update : 04-08-2026
-->

# Badge

> Label kecil untuk menampilkan status, kategori, atau informasi ringkas.

---

## 1. Informasi Dokumen

| Item | Detail |
| --- | --- |
| Nama | Badge Component |
| Versi | 1.0.0 |
| Status | ✅ Stable |
| Update Terakhir | 04-08-2026 |
| File | `assets/css/components/badge.css` |
| Dependensi | `assets/css/variables.css` |

---

## 2. Tujuan Komponen

Badge adalah elemen inline untuk menampilkan:

- **Status** — aktif, pending, selesai, error
- **Kategori** — tag, label, filter
- **Informasi** — angka, hitungan, indikator
- **Penekanan** — fitur baru, penting, premium

Badge harus kecil, ringkas, dan mudah dibaca.

---

## 3. Class API

### Base

| Class | Keterangan |
| --- | --- |
| `.badge` | Base badge — default dengan padding dan border-radius pill |

### Varian Warna

| Class | Keterangan | Gunakan Untuk |
| --- | --- | --- |
| `.badge-primary` | Badge merah (primary) | Status utama, aktif |
| `.badge-success` | Badge hijau (success) | Status berhasil, aktif |
| `.badge-warning` | Badge kuning (warning) | Status peringatan, pending |
| `.badge-danger` | Badge merah (danger) | Status error, gagal |

### Varian Ukuran

| Class | Keterangan | Gunakan Untuk |
| --- | --- | --- |
| `.badge-sm` | Ukuran kecil | Inline, ruang terbatas |
| `.badge-lg` | Ukuran besar | Penekanan lebih kuat |

### Dengan Ikon

| Class | Keterangan |
| --- | --- |
| `.badge-icon` | Badge dengan ikon di samping teks |

---

## 4. HTML Example

### Varian Warna

```html
<!-- Primary -->
<span class="badge badge-primary">Aktif</span>

<!-- Success -->
<span class="badge badge-success">Berhasil</span>

<!-- Warning -->
<span class="badge badge-warning">Pending</span>

<!-- Danger -->
<span class="badge badge-danger">Error</span>
```

### Varian Ukuran

```html
<!-- Small -->
<span class="badge badge-primary badge-sm">Kecil</span>

<!-- Default -->
<span class="badge badge-primary">Default</span>

<!-- Large -->
<span class="badge badge-primary badge-lg">Besar</span>
```

### Dengan Ikon

```html
<!-- Badge dengan ikon centang -->
<span class="badge badge-success badge-icon">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
  Selesai
</span>

<!-- Badge dengan ikon panah -->
<span class="badge badge-primary badge-icon">
  Baru
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="m9 18 6-6-6-6"/>
  </svg>
</span>
```

### Kombinasi

```html
<!-- Badge di dalam heading -->
<h2>
  Produk Baru
  <span class="badge badge-primary badge-sm">New</span>
</h2>

<!-- Badge di dalam card -->
<div class="card">
  <div class="card-header">
    <h3>Artikel</h3>
    <span class="badge badge-success badge-sm">Published</span>
  </div>
  <div class="card-body">
    <p>Isi artikel.</p>
  </div>
</div>

<!-- Badge di dalam button -->
<button class="btn btn-primary">
  Notifikasi
  <span class="badge badge-danger badge-sm">3</span>
</button>
```

### Badge untuk Filter

```html
<div class="cluster">
  <span class="badge badge-primary">Semua</span>
  <span class="badge badge-outline">Aktif</span>
  <span class="badge badge-outline">Pending</span>
  <span class="badge badge-outline">Selesai</span>
</div>
```

---

## 5. Accessibility

### Screen Reader

- Badge adalah elemen inline — screen reader akan membaca teks di dalamnya
- Jika badge hanya berupa ikon, sertakan `aria-label`:

```html
<span class="badge badge-success badge-icon" aria-label="Selesai">
  <svg>...</svg>
</span>
```

### Color Contrast

- Pastikan kontras warna badge memenuhi standar WCAG (4.5:1 untuk teks)
- Badge menggunakan warna dari design token yang sudah divalidasi kontrasnya

---

## 6. Best Practice

1. **Gunakan badge untuk informasi ringkas** — bukan untuk teks panjang
2. **Pilih warna yang sesuai** — success untuk positif, danger untuk negatif
3. **Gunakan ukuran yang tepat** — small untuk inline, large untuk penekanan
4. **Kombinasikan dengan ikon** untuk kejelasan makna
5. **Hindari terlalu banyak badge** — gunakan hanya yang perlu

---

## 7. Do & Don't

### Do

```html
<!-- ✅ Badge untuk status -->
<span class="badge badge-success">Aktif</span>

<!-- ✅ Badge dengan ikon -->
<span class="badge badge-success badge-icon">
  <svg>...</svg>
  Selesai
</span>

<!-- ✅ Badge kecil di heading -->
<h2>
  Judul
  <span class="badge badge-primary badge-sm">New</span>
</h2>
```

### Don't

```html
<!-- ❌ Badge untuk teks panjang -->
<span class="badge">Ini adalah badge dengan teks yang sangat panjang</span>

<!-- ❌ Terlalu banyak badge -->
<span class="badge badge-primary">1</span>
<span class="badge badge-success">2</span>
<span class="badge badge-warning">3</span>
<span class="badge badge-danger">4</span>

<!-- ❌ Badge tanpa konteks -->
<span class="badge">Baru</span> <!-- tanpa varian warna -->
```

---

## 8. Version History

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.0 | 04-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Initial release — 4 varian warna, 2 ukuran, icon support |

---

> **v1.0.0** · ✅ Stable · 04-08-2026 · BERNADA.ID Engineering Handbook
