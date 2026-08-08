<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : Engineering Workflow · Category : Rules
  Version  : 1.0.0 · Status : ✅ Stable · Update : 04-08-2026
-->

# 10 — Engineering Workflow

> Workflow resmi yang **WAJIB diikuti** pada setiap Sprint di project BERNADA.ID.

---

## 1. Gambaran Umum

Engineering Workflow adalah alur kerja standar yang menjamin kualitas, konsistensi, dan dokumentasi di setiap siklus pengembangan. Seluruh tim (manusia maupun AI) wajib mengikuti workflow ini tanpa pengecualian.

```text
Planning
   ↓
Development
   ↓
Review
   ↓
Refactor
   ↓
Documentation
   ↓
Audit
   ↓
Release
   ↓
Sprint Closed
```

## 2. Tahapan Workflow

### 2.1 Planning

**Tujuan:** Menentukan kebutuhan, ruang lingkup, requirement, flow, dan desain teknis sebelum implementasi.

| Aktivitas | Output |
| --- | --- |
| Identifikasi kebutuhan | Daftar requirement |
| Penentuan ruang lingkup | Scope document |
| Perancangan alur sistem | Flow diagram |
| Desain teknis | Technical design document |
| Estimasi waktu | Sprint plan |

**Gate:** Planning selesai → masuk ke Development.

### 2.2 Development

**Tujuan:** Implementasi fitur sesuai standar coding dan arsitektur project.

| Aktivitas | Output |
| --- | --- |
| Implementasi kode | Source code |
| Penulisan unit test | Test files |
| Self-review | Review checklist |
| Commit berkala | Git history |

**Gate:** Development selesai → masuk ke Review.

### 2.3 Review

**Tujuan:** Internal Code Review untuk memastikan kualitas implementasi.

| Aktivitas | Output |
| --- | --- |
| Code review | Review report |
| Perbaikan berdasarkan review | Updated code |
| Validasi standar | Compliance checklist |

**Gate:** Review PASS → masuk ke Refactor.

### 2.4 Refactor

**Tujuan:** Penyempurnaan kode tanpa mengubah perilaku sistem.

| Aktivitas | Output |
| --- | --- |
| Optimasi kode | Refactored code |
| Penghapusan duplikasi | Clean code |
| Peningkatan keterbacaan | Readable code |
| Validasi tidak ada perubahan perilaku | Test results |

**Gate:** Refactor selesai → masuk ke Documentation.

### 2.5 Documentation

**Tujuan:** Sinkronisasi seluruh dokumentasi terhadap implementasi terbaru.

| Aktivitas | Output |
| --- | --- |
| Perbarui dokumentasi teknis | Updated docs |
| Perbarui changelog | Changelog entry |
| Perbarui sprint status | Sprint update |
| Validasi sinkronisasi | Sync checklist |

**Gate:** Documentation selesai → masuk ke Audit.

### 2.6 Audit

**Tujuan:** Pemeriksaan kualitas project (Architecture, QA, Engineering).

| Aktivitas | Output |
| --- | --- |
| Internal Code Review | Code review report |
| Architecture Review | Architecture report |
| QA Review | QA report |
| Engineering Review | Engineering report |

**Gate:** Audit PASS → masuk ke Release.

### 2.7 Release

**Tujuan:** Menetapkan hasil Sprint sebagai versi resmi (Stable Release).

| Aktivitas | Output |
| --- | --- |
| Finalisasi kode | Release candidate |
| Penulisan release notes | Release document |
| Tagging versi | Git tag |
| Pencatatan di changelog | Changelog entry |

**Gate:** Release selesai → masuk ke Sprint Closed.

### 2.8 Sprint Closed

**Tujuan:** Menutup Sprint dan mendokumentasikan hasil sebelum melanjutkan Sprint berikutnya.

| Aktivitas | Output |
| --- | --- |
| Evaluasi Sprint | Sprint retrospective |
| Dokumentasi hasil | Sprint report |
| Perencanaan Sprint berikutnya | Next sprint plan |

**Gate:** Sprint Closed → Sprint berikutnya bisa dimulai.

## 3. Aturan Workflow

1. **Setiap Sprint WAJIB melalui seluruh tahapan.** Tidak ada tahapan yang boleh dilewati tanpa alasan tertulis dan persetujuan Product Owner.
2. **Sprint tidak boleh dinyatakan selesai** apabila belum mencapai tahap Release.
3. **Seluruh Release wajib dicatat** pada `.docs/changelog.md`.
4. **Setelah Release selesai, Sprint dinyatakan Closed.**
5. **Sprint baru tidak boleh dimulai** sebelum Sprint sebelumnya dinyatakan Closed.

## 4. Hubungan dengan Development Workflow (§5 00-opencode.md)

Engineering Workflow ini menggantikan Development Workflow lama di `00-opencode.md §5`. Perbedaan utama:

| Aspek | Development Workflow (Lama) | Engineering Workflow (Baru) |
| --- | --- | --- |
| Fokus | Per task | Per Sprint |
| Tahapan | 13 tahapan detail | 8 tahapan Sprint |
| Release | Tidak ada | Wajib ada |
| Audit | Tidak ada | Wajib ada |
| Sprint Close | Tidak ada | Wajib ada |

---

> **v1.0.0** · ✅ Stable · 04-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
