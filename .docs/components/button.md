<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Button Component · Category : Components
  Version  : 1.0.0 · Status : ✅ Stable · Update : 04-08-2026
-->

# Button

> Tombol interaktif untuk aksi user — CTA, navigasi, dan operasi form.

---

## 1. Informasi Dokumen

| Item | Detail |
| --- | --- |
| Nama | Button Component |
| Versi | 1.0.0 |
| Status | ✅ Stable |
| Update Terakhir | 04-08-2026 |
| File | `assets/css/components/button.css` |
| Dependensi | `assets/css/variables.css` |

---

## 2. Tujuan Komponen

Button adalah elemen interaksi utama yang memungkinkan user melakukan aksi:

- **Submit form** — mengirim data ke server
- **Navigasi** — pindah halaman atau section
- **Operasi** — hapus, edit, simpan, batalkan
- **Toggle** — aktifkan/nonaktifkan fitur

Button harus selalu terlihat jelas, mudah diklik, dan memberikan umpan balik visual yang tepat.

---

## 3. Class API

### Base

| Class | Keterangan |
| --- | --- |
| `.btn` | Base class — wajib ada di setiap tombol |

### Varian Warna

| Class | Keterangan | Gunakan Untuk |
| --- | --- | --- |
| `.btn-primary` | Tombol utama (merah brand) | CTA utama, aksi paling penting |
| `.btn-secondary` | Tombol sekunder (abu-abu) | Aksi tambahan, alternatif |
| `.btn-outline` | Tombol berborder (transparan) | Aksi alternatif, ringan |
| `.btn-ghost` | Tombol transparan | Aksi minimal, di dalam card |
| `.btn-link` | Tombol seperti tautan | Navigasi, "pelajari lebih lanjut" |
| `.btn-success` | Tombol sukses (hijau) | Konfirmasi, aksi positif |
| `.btn-danger` | Tombol bahaya (merah) | Hapus, aksi destruktif |
| `.btn-gold` | Tombol emas (aksen premium) | Aksi premium, undangan spesial |

### Varian Ukuran

| Class | Keterangan | Gunakan Untuk |
| --- | --- | --- |
| `.btn-sm` | Ukuran kecil | Inline actions, ruang terbatas |
| `.btn-md` | Ukuran default | Penggunaan umum |
| `.btn-lg` | Ukuran besar | CTA utama, hero section |

### Status

| Class/Selector | Keterangan |
| --- | --- |
| `.btn:disabled` | Tombol nonaktif — tidak bisa diklik |
| `.btn-loading` | Tombol dalam proses loading (opsional) |

---

## 4. HTML Example

### Contoh Varian Warna

```html
<!-- Primary — CTA utama -->
<button class="btn btn-primary">Buat Undangan</button>

<!-- Secondary — Aksi tambahan -->
<button class="btn btn-secondary">Batal</button>

<!-- Outline — Alternatif ringan -->
<button class="btn btn-outline">Lihat Preview</button>

<!-- Ghost — Aksi minimal -->
<button class="btn btn-ghost">Tutup</button>

<!-- Link — Seperti tautan -->
<button class="btn btn-link">Pelajari lebih lanjut</button>

<!-- Success — Konfirmasi -->
<button class="btn btn-success">Simpan Perubahan</button>

<!-- Danger — Aksi destruktif -->
<button class="btn btn-danger">Hapus Undangan</button>

<!-- Gold — Premium -->
<button class="btn btn-gold">Upgrade Premium</button>
```

### Contoh Varian Ukuran

```html
<!-- Small -->
<button class="btn btn-primary btn-sm">Kecil</button>

<!-- Medium (default) -->
<button class="btn btn-primary btn-md">Sedang</button>

<!-- Large -->
<button class="btn btn-primary btn-lg">Besar</button>
```

### Kombinasi

```html
<!-- Large + Primary — CTA utama di hero -->
<button class="btn btn-primary btn-lg">Mulai Sekarang</button>

<!-- Small + Ghost — Tombol tutup di modal -->
<button class="btn btn-ghost btn-sm">✕</button>

<!-- Danger + Large — Konfirmasi hapus -->
<button class="btn btn-danger btn-lg">Ya, Hapus</button>
```

### State

```html
<!-- Disabled -->
<button class="btn btn-primary" disabled>Simpan</button>

<!-- Loading — gunakan dengan JavaScript -->
<button class="btn btn-primary btn-loading">Menyimpan...</button>

<!-- Loading + Disabled -->
<button class="btn btn-primary btn-loading" disabled>Memproses...</button>
```

### Dengan Ikon

```html
<!-- Ikon kiri -->
<button class="btn btn-primary">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
  Tambah Tamu
</button>

<!-- Ikon kanan -->
<button class="btn btn-outline">
  Lihat Semua
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="m9 18 6-6-6-6"/>
  </svg>
</button>
```

---

## 5. Accessibility

### Keyboard Support

| Key | Action |
| --- | --- |
| `Enter` | Mengklik tombol |
| `Space` | Mengklik tombol |
| `Tab` | Memindahkan fokus ke tombol berikutnya |
| `Shift + Tab` | Memindahkan fokus ke tombol sebelumnya |

### Focus Management

- Tombol memiliki **focus-visible** outline saat diakses dengan keyboard
- Outline berwarna sesuai varian tombol (primary = merah, success = hijau, dll.)
- Outline offset 2px agar tidak tumpang tindih dengan border tombol

### Disabled State

- Tombol `disabled` memiliki opacity 50% (token `--opacity-disabled`)
- Cursor berubah menjadi `not-allowed`
- Tombol **tidak bisa di-klik** atau diakses dengan keyboard
- Gunakan atribut HTML `disabled` untuk mematikan tombol

### Loading State

- Gunakan class `.btn-loading` untuk operasi async
- Tombol menampilkan spinner animasi
- Teks tombol disembunyikan (color: transparent)
- Tombol **tidak bisa di-klik** selama loading

### Screen Reader

- Gunakan elemen `<button>` (bukan `<div>` atau `<a>`) untuk aksi
- Sertakan teks deskriptif di dalam tombol
- Jika hanya ikon, gunakan `aria-label`:

```html
<button class="btn btn-ghost btn-sm" aria-label="Tutup dialog">✕</button>
```

---

## 6. Best Practice

1. **Gunakan elemen `<button>`** untuk aksi, `<a>` untuk navigasi
2. **Pilih varian yang tepat** — primary untuk CTA utama, secondary untuk alternatif
3. **Hindari terlalu banyak tombol primary** — satu CTA utama per section
4. **Gunakan ukuran yang sesuai** — large untuk hero, small untuk inline
5. **Tambahkan loading state** untuk operasi yang membutuhkan waktu
6. **Gunakan disabled** saat tombol tidak bisa diklik (form belum valid, proses berjalan)
7. **Kombinasikan dengan ikon** untuk memperjelas makna tombol

---

## 7. Do & Don't

### Do

```html
<!-- ✅ Satu CTA utama per section -->
<div class="section">
  <h2>Buat Undangan Pertama Anda</h2>
  <p>Buat undangan digital profesional dalam hitungan menit.</p>
  <button class="btn btn-primary btn-lg">Mulai Sekarang</button>
</div>

<!-- ✅ Loading state untuk operasi async -->
<button class="btn btn-primary btn-loading" disabled>Menyimpan...</button>

<!-- ✅ Disabled saat form belum valid -->
<button class="btn btn-primary" disabled>Simpan</button>

<!-- ✅ Tombol dengan ikon untuk kejelasan -->
<button class="btn btn-danger">
  <svg>...</svg>
  Hapus
</button>
```

### Don't

```html
<!-- ❌ Terlalu banyak tombol primary -->
<button class="btn btn-primary">Simpan</button>
<button class="btn primary">Batal</button>
<button class="btn btn-primary">Hapus</button>

<!-- ❌ Menggunakan div sebagai tombol -->
<div class="btn btn-primary" onclick="submit()">Klik</div>

<!-- ❌ Tanpa loading state untuk operasi lama -->
<button class="btn btn-primary" onclick="submit()">Simpan</button>

<!-- ❌ Menggunakan warna hardcoded -->
<button style="background: #ff0000; color: white;">Hapus</button>

<!-- ❌ Tombol tanpa teks (kecuali dengan aria-label) -->
<button class="btn btn-ghost">✕</button>

<!-- ❌ Menggunakan varian gold untuk semua aksi premium -->
<button class="btn btn-gold">Simpan</button>
<button class="btn btn-gold">Edit</button>
<button class="btn btn-gold">Preview</button>
```

---

## 8. Version History

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.0 | 04-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Initial release — 8 varian warna, 3 ukuran, state disabled/loading |

---

> **v1.0.0** · ✅ Stable · 04-08-2026 · BERNADA.ID Engineering Handbook
