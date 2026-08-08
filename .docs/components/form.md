<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Form Components · Category : Components
  Version  : 1.0.0 · Status : ✅ Stable · Update : 04-08-2026
-->

# Form

> Elemen input form untuk data entry — input, textarea, select, checkbox, radio, switch.

---

## 1. Informasi Dokumen

| Item | Detail |
| --- | --- |
| Nama | Form Components |
| Versi | 1.0.0 |
| Status | ✅ Stable |
| Update Terakhir | 04-08-2026 |
| File | `assets/css/components/form.css` |
| Dependensi | `assets/css/variables.css` |

---

## 2. Tujuan Komponen

Form components adalah elemen interaksi untuk:

- **Input teks** — nama, email, password, search
- **Textarea** — pesan, deskripsi, komentar
- **Select** — pilihan opsi dari dropdown
- **Checkbox** — pilihan multiple (centang)
- **Radio** — pilihan tunggal (lingkaran)
- **Switch** — toggle on/off

Form harus mudah digunakan, terlihat jelas, dan memiliki umpan balik yang tepat.

---

## 3. Class API

### Input

| Class | Keterangan |
| --- | --- |
| `.input` | Base input — width 100%, padding, border, radius |
| `.input:focus` | State fokus — border primary + ring |
| `.input:disabled` | State nonaktif — opacity, cursor |
| `.input-error` | State error — border danger |
| `.input-success` | State success — border success |

### Textarea

| Class | Keterangan |
| --- | --- |
| `.textarea` | Input multi-baris — extends `.input` |

### Select

| Class | Keterangan |
| --- | --- |
| `.select` | Dropdown select — extends `.input` |

### Checkbox & Radio

| Class | Keterangan |
| --- | --- |
| `.checkbox` | Kotak centang — pilihan multiple |
| `.radio` | Lingkaran — pilihan tunggal |

### Switch

| Class | Keterangan |
| --- | --- |
| `.switch` | Toggle switch — on/off state |

### Form Groups

| Class | Keterangan |
| --- | --- |
| `.form-group` | Kontainer form — flex column |
| `.form-label` | Label input |
| `.form-hint` | Hint text — di bawah input |
| `.form-error` | Error text — di bawah input |

---

## 4. HTML Example

### Input Dasar

```html
<!-- Input text -->
<input type="text" class="input" placeholder="Nama Lengkap">

<!-- Input email -->
<input type="email" class="input" placeholder="email@domain.com">

<!-- Input password -->
<input type="password" class="input" placeholder="Masukkan password">
```

### Input dengan State

```html
<!-- Focus — state saat diklik -->
<input type="text" class="input" value="Fokus di sini">

<!-- Disabled — tidak bisa diubah -->
<input type="text" class="input" disabled value="Nonaktif">

<!-- Error — validasi gagal -->
<input type="email" class="input input-error" value="invalid-email">
<span class="form-error">Email tidak valid</span>

<!-- Success — validasi berhasil -->
<input type="email" class="input input-success" value="valid@email.com">
<span class="form-hint">Email tersedia</span>
```

### Textarea

```html
<textarea class="input textarea" placeholder="Tulis pesan Anda..."></textarea>
```

### Select

```html
<select class="input select">
  <option value="">Pilih opsi</option>
  <option value="1">Opsi 1</option>
  <option value="2">Opsi 2</option>
  <option value="3">Opsi 3</option>
</select>
```

### Checkbox

```html
<!-- Checkbox individual -->
<label class="checkbox">
  <input type="checkbox">
  Saya setuju dengan syarat dan ketentuan
</label>

<!-- Checkbox group -->
<div class="form-group">
  <span class="form-label">Minat:</span>
  <label class="checkbox">
    <input type="checkbox" name="minat" value="desain">
    Desain
  </label>
  <label class="checkbox">
    <input type="checkbox" name="minat" value="coding">
    Coding
  </label>
  <label class="checkbox">
    <input type="checkbox" name="minat" value="marketing">
    Marketing
  </label>
</div>
```

### Radio

```html
<!-- Radio individual -->
<label class="radio">
  <input type="radio" name="gender" value="laki-laki">
  Laki-laki
</label>

<!-- Radio group -->
<div class="form-group">
  <span class="form-label">Jenis Kelamin:</span>
  <label class="radio">
    <input type="radio" name="gender" value="laki-laki">
    Laki-laki
  </label>
  <label class="radio">
    <input type="radio" name="gender" value="perempuan">
    Perempuan
  </label>
</div>
```

### Switch

```html
<!-- Switch individual -->
<label class="switch">
  <input type="checkbox">
  Aktifkan notifikasi
</label>

<!-- Switch group -->
<div class="form-group">
  <span class="form-label">Pengaturan:</span>
  <label class="switch">
    <input type="checkbox" checked>
    Email notifikasi
  </label>
  <label class="switch">
    <input type="checkbox">
    SMS notifikasi
  </label>
</div>
```

### Form Group Lengkap

```html
<div class="form-group">
  <label class="form-label" for="email">Email</label>
  <input type="email" id="email" class="input" placeholder="email@domain.com">
  <span class="form-hint">Kami tidak akan membagikan email Anda.</span>
</div>

<div class="form-group">
  <label class="form-label" for="password">Password</label>
  <input type="password" id="password" class="input input-error" placeholder="Masukkan password">
  <span class="form-error">Password minimal 8 karakter.</span>
</div>

<div class="form-group">
  <label class="form-label" for="pesan">Pesan</label>
  <textarea id="pesan" class="input textarea" placeholder="Tulis pesan Anda..."></textarea>
</div>

<div class="form-group">
  <label class="form-label">Preferensi:</label>
  <label class="checkbox">
    <input type="checkbox" name="pref" value="newsletter">
    Berlangganan newsletter
  </label>
  <label class="radio">
    <input type="radio" name="pref" value="email">
    Email
  </label>
  <label class="radio">
    <input type="radio" name="pref" value="sms">
    SMS
  </label>
</div>

<button class="btn btn-primary">Kirim</button>
```

---

## 5. Accessibility

### Keyboard Support

| Key | Action |
| --- | --- |
| `Tab` | Memindahkan fokus ke input berikutnya |
| `Shift + Tab` | Memindahkan fokus ke input sebelumnya |
| `Enter` | Submit form (jika di dalam form) |
| `Space` | Toggle checkbox/switch |
| `Arrow Keys` | Navigasi radio group |

### Focus Management

- Semua input memiliki focus ring yang jelas
- Focus ring menggunakan warna primary (brand)
- Outline offset 2px agar tidak tumpang tindih

### Labels

- **WAJIB** sertakan `<label>` untuk setiap input
- Gunakan `for` attribute untuk menghubungkan label dengan input
- Gunakan `id` attribute pada input

### Screen Reader

```html
<!-- Benar -->
<label for="email">Email</label>
<input type="email" id="email" class="input">

<!-- Salah — tanpa label -->
<input type="email" class="input" placeholder="Email">
```

### Error Handling

- Sertakan `aria-describedby` untuk menghubungkan error message
- Gunakan `aria-invalid` untuk state error

```html
<label for="email">Email</label>
<input type="email" id="email" class="input input-error" aria-invalid="true" aria-describedby="email-error">
<span id="email-error" class="form-error">Email tidak valid</span>
```

---

## 6. Best Practice

1. **Gunakan `<label>` untuk semua input** — aksesibilitas
2. **Gunakan `type` yang tepat** — email, password, number, dll.
3. **Sertakan placeholder** — petunjuk untuk user
4. **Gunakan form-group** untuk layout yang rapi
5. **Tampilkan error message** — di bawah input, dengan warna danger
6. **Gunakan hint text** — untuk informasi tambahan
7. **Validasi di sisi client dan server** — keamanan

---

## 7. Do & Don't

### Do

```html
<!-- ✅ Form dengan label -->
<div class="form-group">
  <label class="form-label" for="name">Nama Lengkap</label>
  <input type="text" id="name" class="input" placeholder="Masukkan nama">
  <span class="form-hint">Nama sesuai KTP.</span>
</div>

<!-- ✅ Form dengan error -->
<div class="form-group">
  <label class="form-label" for="email">Email</label>
  <input type="email" id="email" class="input input-error" aria-invalid="true" aria-describedby="email-error">
  <span id="email-error" class="form-error">Email tidak valid.</span>
</div>
```

### Don't

```html
<!-- ❌ Input tanpa label -->
<input type="text" class="input" placeholder="Nama">

<!-- ❌ Input tanpa type -->
<input class="input" placeholder="Email">

<!-- ❌ Error message tanpa hubungan dengan input -->
<input type="email" class="input input-error">
<span class="form-error">Email tidak valid</span> <!-- tidak ada aria-describedby -->
```

---

## 8. Version History

| Version | Date | Author | Status | Description |
| --- | --- | --- | --- | --- |
| 1.0.0 | 04-08-2026 | AI Pair Programmer + Senior Engineer | ✅ Stable | Initial release — input, textarea, select, checkbox, radio, switch, form groups |

---

> **v1.0.0** · ✅ Stable · 04-08-2026 · BERNADA.ID Engineering Handbook
