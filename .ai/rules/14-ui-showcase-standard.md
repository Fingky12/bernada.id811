<!--
  BERNADA.ID ENGINEERING HANDBOOK
  Document : UI Showcase Standard
  Category : AI Development Rules
  Version  : 1.0.0
  Status   : ✅ Stable
  Update   : 05-08-2026
-->

# 14 — UI Showcase Standard

> Tujuan:
> Seluruh halaman BERNADA.ID harus memiliki kualitas visual yang layak dijadikan showcase produk profesional.
> AI wajib memikirkan pengalaman visual, bukan hanya menghasilkan HTML yang berfungsi.

---

# Filosofi

Website bukan sekadar bekerja.

Website harus memberikan pengalaman.

Setiap section harus mempunyai:

- visual hierarchy
- focal point
- keseimbangan layout
- kedalaman visual
- konsistensi design system

AI tidak boleh membuat halaman yang hanya berisi:

Heading
Paragraph
Button
Image Placeholder

karena itu menghasilkan tampilan yang datar (flat).

---

# Visual Composition

Setiap section WAJIB memiliki minimal beberapa elemen visual berikut.

## Decorative Background

Gunakan decorative element seperti:

• Gradient
• Blur Circle
• Glow
• Abstract Shape
• Pattern
• SVG Ornament
• Floating Element

Jangan pernah menggunakan background putih polos untuk semua section.

---

## Visual Illustration

Jika aset final belum tersedia:

gunakan placeholder SVG premium.

Contoh:

assets/img/illustrations/
hero.svg
feature-dashboard.svg
portfolio.svg
pricing.svg
faq.svg
cta.svg
footer-pattern.svg

Placeholder harus tetap memiliki kualitas desain yang baik.

Bukan kotak abu-abu.

---

## Card Illustration

Card tidak boleh hanya icon + text.

Card sebaiknya memiliki salah satu:

mini illustration
background pattern
soft gradient
glass effect
shadow hierarchy

---

## Depth

Gunakan kombinasi:

shadow
blur
gradient
layer
border
glassmorphism

agar UI memiliki kedalaman.

---

## Empty Space

Whitespace adalah bagian dari desain.

AI wajib menjaga ritme visual.

Jangan membuat section terlalu padat.

---

## Color Composition

Seluruh warna HARUS berasal dari Design Token.

Dilarang hardcoded.

Gunakan kombinasi:

Primary
Gold Accent
Surface
Background
Border
Shadow

---

## Decorative SVG

AI dianjurkan membuat SVG sederhana seperti:

wave
blob
line pattern
dot pattern
grid
abstract ornament

langsung di assets/img/.

Tidak mengambil dari internet.

---

## Image Quality

Jika menggunakan placeholder:

harus berupa vector SVG.

Tidak menggunakan:

❌ screenshot
❌ bitmap buram
❌ kotak abu-abu
❌ lorem image

---

## CTA

CTA adalah pusat perhatian.

Harus memiliki:

background berbeda
gradient
dekorasi
ornament
button menonjol

---

## Hero

Hero adalah wajah website.

Hero wajib memiliki:

headline kuat
subheadline
CTA utama
CTA kedua
hero illustration
background decoration
floating ornament
shape
blur
gradient

---

## Pricing

Pricing harus terlihat premium.

Gunakan:

featured plan
badge popular
soft shadow
accent border
hover animation

---

## FAQ

Accordion harus memiliki:

smooth animation
icon rotate
spacing nyaman
hover state
focus state

---

## Footer

Footer tidak boleh kosong.

Minimal terdiri dari:

Brand
Navigation
Contact
Copyright
Background ornament

---

# Responsive

Seluruh dekorasi wajib tetap responsif.

Dekorasi boleh disembunyikan pada mobile bila mengganggu UX.

---

# Accessibility

Seluruh elemen dekoratif:

aria-hidden="true"

Tidak boleh mengganggu screen reader.

---

# Animation

Dekorasi hanya menggunakan animasi ringan.

Tidak boleh mengganggu pembacaan.

Hormati:

prefers-reduced-motion

---

# Engineering Rules

Saat membuat section baru AI WAJIB berpikir seperti UI Designer.

AI tidak hanya membuat HTML.

AI juga harus mendesain pengalaman visual.

Setiap section harus terlihat seperti produk premium yang siap dipresentasikan kepada klien.

---

# Definition of Done

Sebuah halaman dianggap selesai apabila memenuhi seluruh kriteria berikut:

✅ Struktur HTML semantik
✅ Menggunakan Design Token
✅ Mobile First
✅ Responsif
✅ Accessible
✅ Memiliki visual hierarchy
✅ Memiliki decorative element
✅ Memiliki ilustrasi/SVG berkualitas
✅ Memiliki whitespace yang baik
✅ Tidak terlihat kosong
✅ Tidak menggunakan placeholder abu-abu
✅ Layak dijadikan portfolio/showcase BERNADA.ID

---

> **v1.0.0** · ✅ Stable · 05-08-2026 · AI Pair Programmer + Senior Engineer — Initial release
