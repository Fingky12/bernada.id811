<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Rule - Testing · Category : Rules
  Version  : 1.0.0 · Status : ✅ Stable · Update : 03-08-2026
-->

# 08 — Pengujian

> Pengujian menjamin kode bekerja sesuai harapan dan tidak merusak bagian lain. **Setiap task tidak dianggap selesai tanpa verifikasi.**

---

## 1. Prinsip

- **Verifikasi sebelum selesai** — setiap implementasi harus diuji.
- **Pahami cara menguji** sebelum menulis kode (jangan menulis kode yang sulit diverifikasi).
- **Uji perilaku, bukan implementasi** — pengujian fokus pada hasil, bukan detail internal.
- Tambahkan pengujian untuk memperbaiki bug (mencegah regresi).

## 2. Jenis Pengujian

| Jenis | Kapan |
| --- | --- |
| Manual (browser/UI) | Memverifikasi tampilan, UX, dan alur pengguna |
| Unit test | Menguji fungsi / logika kecil secara terisolasi |
| API test | Menguji endpoint: validasi, status code, format response |
| Integration test | Menguji alur antar-modul (API + database) |
| Regression test | Memastikan perubahan tidak merusak fitur lama |

## 3. Cakupan Wajib (untuk fitur baru)

1. Alur **sukses** (happy path).
2. Alur **gagal / error** (input salah, otorisasi ditolak, data tidak ditemukan).
3. **Kasus batas** (empty, null, nilai maksimal, duplikasi).
4. **Keamanan** dasar (input berbahaya ditolak).

## 4. Cara Verifikasi di Project Ini

- Jalankan aplikasi dan uji manual di browser.
- Cek konsol untuk error.
- Untuk API: uji dengan tool request (Postman / cURL) atau script.
- Catat hasil pengujian pada laporan task.

## 5. Aturan

- ❌ Jangan menyatakan "sudah berjalan" tanpa benar-benar menjalankan.
- ❌ Jangan menyembunyikan kegagalan; laporkan apa adanya.
- Perbaikan bug menyertakan pengujian yang membuktikan bug hilang.
- Pengujian otomatis (jika ada di project) harus tetap hijau.

---

> **v1.0.0** · ✅ Stable · 03-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
