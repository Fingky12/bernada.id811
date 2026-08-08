<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Rule - Review Checklist · Category : Rules
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# 09 — Review Checklist

> **Checklist self-review WAJIB** sebelum AI menyatakan task selesai. Gunakan juga untuk code review (`prompts/review.md`).
>
> Jika salah satu item tidak terpenuhi, task **belum selesai**.

---

## Checklist

### 1. Readability
- [ ] Kode mudah dibaca dan dipahami orang lain.
- [ ] Nama variabel/fungsi/class deskriptif.
- [ ] Tidak ada logika yang membingungkan tanpa penjelasan.

### 2. Maintainability
- [ ] Perubahan mudah dirawat / diubah di masa depan.
- [ ] Tidak ada duplikasi kode yang seharusnya dipakai ulang.
- [ ] Fungsi/komponen berukuran wajar (satu tanggung jawab).

### 3. Scalability
- [ ] Solusi tetap berfungsi saat data/permintaan bertambah.
- [ ] Tidak ada jalan pintas yang hanya bekerja untuk kasus tunggal.

### 4. Performance
- [ ] Tidak ada operasi yang tidak perlu (loop, query, render berulang).
- [ ] Aset dan selektor CSS efisien.

### 5. Security
- [ ] Tidak ada secret/credential di kode.
- [ ] Input pengguna divalidasi dan tidak masuk query mentah.
- [ ] Output dinamis di-escape (cegah XSS).
- [ ] Endpoint memeriksa otorisasi.

### 6. Consistency
- [ ] Mengikuti pola yang sudah ada di project.
- [ ] Gaya penulisan seragam dengan file sekitarnya.

### 7. Naming
- [ ] Seluruh penamaan mengikuti `rules/05-naming-convention.md`.

### 8. Documentation
- [ ] Perubahan penting terdokumentasi (changelog / docs terkait).
- [ ] Dokumentasi API diperbarui jika endpoint berubah.

### 9. Reusability
- [ ] Tidak ada kode yang seharusnya menjadi komponen/utilitas bersama.
- [ ] Solusi memakai design token dan utilitas yang tersedia.

### 10. Project Standards
- [ ] Mengikuti design system (`rules/03`).
- [ ] Mengikuti coding standard (`rules/02`).
- [ ] Struktur file benar (`rules/04`).
- [ ] Testing dilakukan (`rules/08`).
- [ ] Git workflow dipatuhi (`rules/06`).

---

## Format Pelaporan Self-Review

```
### Self Review
| Aspek | Status | Catatan |
| --- | --- | --- |
| Readability | ✅ / 🟠 / ❌ | ... |
| Maintainability | ✅ / 🟠 / ❌ | ... |
| ... | ... | ... |

**Temuan yang perlu perhatian:** ...
**Rekomendasi:** ...
```

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
