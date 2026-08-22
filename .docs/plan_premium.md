# 🚀 PREMIUM DIGITAL INVITATION PLATFORM — MASTER BLUEPRINT

## 0. Product Vision

### Nama kerja

**BERNADA.ID — Premium Digital Invitation Platform**

### Core proposition

> **Platform untuk membuat, mengelola, mempublikasikan, dan membagikan undangan digital premium tanpa perlu coding.**

Bukan sekadar:

> “website undangan”

tetapi:

> **Invitation Creation Platform + Template Engine + Commerce + Guest Management + Analytics**

---

# 1. BIG PICTURE ARCHITECTURE

Gambaran besarnya:

```text
                         ┌──────────────────────┐
                         │      BERNADA.ID      │
                         │ Premium Invitation   │
                         │      Platform        │
                         └──────────┬───────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
      │   PUBLIC    │       │  CUSTOMER   │       │    ADMIN    │
      │   WEBSITE   │       │  DASHBOARD  │       │    PANEL    │
      └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
             │                     │                     │
             └─────────────────────┼─────────────────────┘
                                   ▼
                         ┌───────────────────┐
                         │ APPLICATION CORE │
                         └─────────┬─────────┘
                                   │
       ┌────────────┬──────────────┼──────────────┬────────────┐
       ▼            ▼              ▼              ▼            ▼
    Template     Invitation       User          Payment      Media
     Engine       Engine         System          System       System
       │            │              │              │            │
       └────────────┴──────────────┼──────────────┴────────────┘
                                   ▼
                           ┌───────────────┐
                           │   DATABASE    │
                           └───────────────┘
```

---

# 2. PRODUCT ECOSYSTEM

Platform dibagi menjadi **5 produk utama**.

### A. Marketing Website

Untuk mendapatkan customer.

```text
/
├── Home
├── Templates
├── Pricing
├── Features
├── Demo
├── FAQ
├── Blog
└── Contact
```

---

### B. Invitation Builder

Tempat customer membuat undangan.

```text
/dashboard
    ↓
/create
    ↓
Template Selection
    ↓
Invitation Editor
    ↓
Preview
    ↓
Publish
```

---

### C. Public Invitation

Hasil akhir yang dibuka tamu.

```text
/invitation/[slug]
```

atau:

```text
/nama-pasangan
```

---

### D. Commerce

Mengatur:

```text
Plans
Products
Orders
Payments
Invoices
Activation
Expiration
```

---

### E. Admin

Mengelola seluruh platform.

```text
/admin
├── Dashboard
├── Users
├── Invitations
├── Templates
├── Payments
├── Orders
├── Media
├── Reports
├── Settings
└── Security
```

---

# 3. USER ROLES

Minimal kita punya:

```text
GUEST
  ↓
CUSTOMER
  ↓
ADMIN
  ↓
SUPER ADMIN
```

### Guest

Tidak perlu login.

Bisa:

* melihat undangan
* RSVP
* memberikan ucapan
* melihat lokasi
* melihat gift information

### Customer

Bisa:

* membuat undangan
* edit undangan
* upload foto
* mengatur event
* mengelola guest
* melihat RSVP
* melihat analytics
* membeli paket
* publish/unpublish

### Admin

Bisa:

* melihat customer
* verifikasi payment
* mengelola invitation
* mengelola template
* moderation
* melihat laporan

### Super Admin

Memiliki seluruh permission.

---

# 4. CUSTOMER JOURNEY

Ini harus menjadi **golden flow** platform.

```text
Landing
   ↓
Browse Template
   ↓
Template Demo
   ↓
Choose Template
   ↓
Create Invitation
   ↓
Register / Login
   ↓
Invitation Setup
   ↓
Edit Content
   ↓
Customize Design
   ↓
Preview
   ↓
Choose Plan
   ↓
Checkout
   ↓
Payment
   ↓
Verification
   ↓
Invitation Activated
   ↓
Publish
   ↓
Share
```

Setelah publish:

```text
Invitation
     ↓
Guest visits
     ↓
RSVP / Wishes / Gift
     ↓
Customer Dashboard
     ↓
Analytics
```

---

# 5. INFORMATION ARCHITECTURE CUSTOMER

Dashboard:

```text
Dashboard
│
├── Overview
│
├── My Invitations
│   ├── All
│   ├── Draft
│   ├── Published
│   └── Expired
│
├── Create Invitation
│
├── Guests
│
├── RSVP
│
├── Wishes
│
├── Gift
│
├── Analytics
│
├── Orders
│
└── Account Settings
```

---

# 6. INVITATION ENGINE

Ini adalah **jantung teknis**.

Jangan membuat invitation sebagai halaman hardcoded.

Gunakan model:

```text
Template
   +
Template Configuration
   +
Invitation Data
   +
Theme
   +
Section Configuration
   =
Published Invitation
```

Contoh:

```text
Template: Elegant-01

Sections:
1. Cover
2. Couple
3. Event
4. Story
5. Gallery
6. Countdown
7. RSVP
8. Wishes
9. Gift
10. Location
```

Customer mengisi:

```text
groom
bride
event_date
venue
address
gallery
story
music
maps
```

Engine kemudian merender hasil akhirnya.

---

# 7. SECTION ENGINE

Setiap invitation terdiri dari section.

Contoh:

```text
Section
├── id
├── type
├── order
├── enabled
├── content
├── settings
└── style
```

Jenis section:

```text
COVER
COUPLE
EVENT
COUNTDOWN
STORY
GALLERY
VIDEO
QUOTE
RSVP
WISHES
GIFT
LOCATION
LIVE_STREAM
CLOSING
```

Ini membuat template sangat fleksibel.

---

# 8. TEMPLATE ENGINE

Template bukan hanya HTML.

Strukturnya:

```text
Template
│
├── Metadata
│
├── Theme
│
├── Typography
│
├── Sections
│
├── Animation
│
├── Responsive Rules
│
└── Assets
```

Contoh:

```text
Elegant Romance
Luxury Gold
Minimal Modern
Floral Garden
Islamic Classic
Traditional Javanese
Modern Editorial
```

---

# 9. DESIGN SYSTEM

Design system platform harus dipisahkan dari design system template.

## Platform Design System

Untuk dashboard/admin:

```text
Colors
Typography
Spacing
Grid
Buttons
Inputs
Forms
Tables
Cards
Modal
Toast
Tabs
Dropdown
Navigation
```

## Invitation Design System

Untuk public invitation:

```text
Typography
Colors
Section spacing
Decorative elements
Image treatment
Animation
Button style
Divider
Background
```

Jangan dicampur.

---

# 10. THEME SYSTEM

Setiap template punya theme.

Misalnya:

```text
theme:
  primary
  secondary
  background
  foreground
  accent
  muted
  border
```

Typography:

```text
heading_font
body_font
accent_font
```

Animation:

```text
entrance
scroll
hover
transition
```

Dengan begitu kita bisa membuat template baru tanpa mengubah engine.

---

# 11. INVITATION EDITOR

Untuk MVP, gue **tidak menyarankan Canva-style freeform editor**.

Terlalu kompleks.

Gunakan:

### Section-based editor

```text
┌──────────────────────────────┐
│ Invitation Editor            │
├──────────────┬───────────────┤
│ Sections     │ Preview       │
│              │               │
│ ☰ Cover      │               │
│ ☰ Couple     │   Invitation  │
│ ☰ Event      │   Preview     │
│ ☰ Story      │               │
│ ☰ Gallery    │               │
│ ☰ RSVP       │               │
└──────────────┴───────────────┘
```

User bisa:

* edit
* enable/disable
* reorder
* customize
* preview

Ini jauh lebih manageable.

---

# 12. INVITATION DATA MODEL

Minimal:

```text
users
profiles
invitations
invitation_sections
templates
template_sections
themes
media
events
stories
galleries
guests
rsvps
wishes
gift_accounts
orders
payments
subscriptions
domains
analytics
```

Relationship:

```text
USER
 │
 ├── INVITATION
 │      │
 │      ├── SECTIONS
 │      ├── EVENTS
 │      ├── STORIES
 │      ├── GALLERY
 │      ├── GUESTS
 │      ├── RSVP
 │      └── WISHES
 │
 └── ORDERS
        │
        └── PAYMENTS
```

---

# 13. MEDIA SYSTEM

Image upload adalah bagian besar dari invitation platform.

Flow:

```text
User Upload
     ↓
Validation
     ↓
Image Processing
     ↓
Optimization
     ↓
Storage
     ↓
CDN
     ↓
Invitation
```

Minimal support:

```text
JPEG
PNG
WEBP
AVIF
```

Jangan menyimpan original image berukuran sangat besar untuk langsung dikirim ke browser.

---

# 14. PUBLIC INVITATION UX

Ini tempat kita **menjual kesan premium**.

Opening:

```text
┌─────────────────────────────┐
│                             │
│      THE WEDDING OF         │
│                             │
│       AHMAD & AISYAH        │
│                             │
│      12 · 12 · 2026         │
│                             │
│        [ OPEN ]             │
│                             │
└─────────────────────────────┘
```

Setelah Open:

```text
Cover
 ↓
Couple
 ↓
Event
 ↓
Countdown
 ↓
Story
 ↓
Gallery
 ↓
RSVP
 ↓
Wishes
 ↓
Gift
 ↓
Location
 ↓
Closing
```

---

# 15. PREMIUM INTERACTION

Animasi jangan berlebihan.

Gunakan:

```text
Fade
Reveal
Parallax ringan
Image zoom
Scroll reveal
Text reveal
Smooth transition
```

Prinsip:

> **Animation should enhance emotion, not compete with content.**

---

# 16. GUEST SYSTEM

Ini bisa menjadi feature pembeda.

Customer bisa membuat:

```text
Guest
├── Name
├── Phone
├── Group
├── Invitation Status
├── RSVP
├── Number of Guests
└── Message
```

Kemudian:

```text
Nama tamu:
Budi Santoso
```

URL bisa membawa personalization:

```text
/nama-pasangan?to=Budi-Santoso
```

atau mekanisme token yang lebih aman.

Public invitation kemudian:

> Kepada Yth. Bapak/Ibu Budi Santoso

Ini terasa jauh lebih premium.

---

# 17. RSVP SYSTEM

Flow:

```text
Guest
 ↓
RSVP
 ↓
Attend?
 ├── Yes
 │    ├── Guest count
 │    └── Meal / notes
 │
 └── No
```

Dashboard:

```text
Total Invitations
Confirmed
Declined
Pending
Total Guests
```

---

# 18. WISHES SYSTEM

Guest:

```text
Name
Message
```

Customer:

```text
Approve
Hide
Delete
```

Moderation diperlukan agar platform tidak menjadi tempat spam.

---

# 19. GIFT SYSTEM

Contoh:

```text
Digital Gift
├── Bank Account
├── E-wallet
├── Physical Address
└── QR
```

Security:

**jangan expose data sensitif secara sembarangan.**

---

# 20. ANALYTICS

Customer bisa melihat:

```text
Views
Unique Visitors
RSVP
Wishes
Gift Clicks
Location Clicks
Share Clicks
```

Dashboard:

```text
Invitation Performance

1,248 Views
   387 Unique Visitors

RSVP
   145 Yes
    21 No
    34 Pending
```

---

# 21. COMMERCE ARCHITECTURE

Model sederhananya:

```text
PLAN
 ↓
ORDER
 ↓
PAYMENT
 ↓
VERIFICATION
 ↓
ACTIVATION
 ↓
EXPIRATION
```

Contoh:

```text
Free
Premium
Exclusive
Custom
```

Payment status:

```text
PENDING
PAID
FAILED
EXPIRED
REFUNDED
```

---

# 22. ADMIN PAYMENT

Ini nyambung langsung dengan roadmap BERNADA.ID kamu yang sudah memiliki area **Payment List, Payment Detail, Verify Payment + confirmation modal, dan authorization/security regression**. 

Flow:

```text
Customer Payment
       ↓
Payment Pending
       ↓
Admin Review
       ↓
Verify
       ↓
Order Activated
```

Admin tidak boleh sekadar mengubah status sembarangan.

Harus ada:

```text
Authorization
Audit Log
Confirmation
Permission
```

---

# 23. ADMIN ARCHITECTURE

```text
Admin
│
├── Dashboard
│
├── Customers
│
├── Invitations
│
├── Templates
│
├── Payments
│
├── Orders
│
├── Media
│
├── Reports
│
├── Audit Logs
│
└── Settings
```

---

# 24. SECURITY MODEL

Minimal:

```text
Authentication
Authorization
Role Based Access
Ownership Check
Input Validation
File Validation
Rate Limiting
CSRF Protection
XSS Protection
SQL Injection Protection
Secure Payment Verification
Audit Logging
```

Yang sangat penting:

```text
USER A
   ↓
Invitation A

USER B
   ↓
Invitation B
```

User A **tidak boleh** bisa mengakses invitation B hanya dengan mengganti ID/slug.

---

# 25. URL ARCHITECTURE

Marketing:

```text
/
 /templates
 /pricing
 /features
 /demo
```

Customer:

```text
/dashboard
/dashboard/invitations
/dashboard/invitations/[id]
```

Admin:

```text
/admin
/admin/users
/admin/payments
/admin/templates
```

Public:

```text
/[slug]
```

atau:

```text
/invitation/[slug]
```

Untuk jangka panjang:

```text
custom-domain.com
```

---

# 26. SEO & SOCIAL SHARING

Setiap invitation harus punya:

```text
Title
Description
OG Image
OG Title
OG Description
Canonical URL
```

Misalnya ketika dibagikan:

```text
┌────────────────────────────┐
│ [Wedding Image]            │
│                            │
│ Ahmad & Aisyah             │
│ Undangan Pernikahan        │
│ 12 December 2026           │
└────────────────────────────┘
```

Ini penting banget untuk conversion.

---

# 27. PERFORMANCE TARGET

Untuk public invitation:

**Prioritas:**

```text
Mobile
 ↓
Fast first render
 ↓
Optimized images
 ↓
Lazy loading
 ↓
Minimal JS
```

Jangan sampai premium berarti:

> loading 8 detik karena 30 foto + 10 animation library.

😂

Premium harus terasa **cepat**.

---

# 28. RESPONSIVE STRATEGY

Design dari:

```text
Mobile
 ↓
Tablet
 ↓
Desktop
```

Bukan sebaliknya.

Karena tamu undangan kemungkinan besar membuka dari smartphone.

Minimal test:

```text
360px
390px
430px
768px
1024px
1280px
1440px
```

---

# 29. OBSERVABILITY

Platform production perlu:

```text
Error Monitoring
Performance Monitoring
Payment Monitoring
Audit Logs
Application Logs
Analytics
```

Supaya ketika customer bilang:

> “Undangan saya nggak bisa dibuka.”

kita bisa tahu apa yang terjadi.

---

# 30. ROADMAP DEVELOPMENT

Sekarang bagian paling penting.

Gue sarankan kita **tidak langsung membuat semua feature**.

## PHASE 1 — FOUNDATION

```text
1. Product architecture
2. Database architecture
3. Auth
4. Role/permission
5. Design system
6. Project structure
```

---

## PHASE 2 — TEMPLATE ENGINE

```text
1. Template model
2. Section model
3. Theme system
4. Section renderer
5. Template preview
6. Template management
```

---

## PHASE 3 — INVITATION MVP

```text
1. Create invitation
2. Basic information
3. Couple
4. Event
5. Gallery
6. Story
7. Countdown
8. RSVP
9. Preview
10. Publish
```

---

## PHASE 4 — PREMIUM UX

```text
1. Opening animation
2. Music
3. Advanced typography
4. Theme customization
5. Scroll animations
6. Better gallery
7. Mobile optimization
```

---

## PHASE 5 — CUSTOMER DASHBOARD

```text
1. Invitation management
2. Guest management
3. RSVP dashboard
4. Wishes
5. Analytics
6. Settings
```

---

## PHASE 6 — COMMERCE

```text
1. Pricing
2. Product
3. Checkout
4. Order
5. Payment
6. Verification
7. Activation
8. Expiration
```

Ini bisa mengikuti fondasi payment yang sudah ada di roadmap BERNADA.ID. 

---

## PHASE 7 — ADMIN

```text
1. Admin dashboard
2. User management
3. Invitation management
4. Template management
5. Payment management
6. Order management
7. Audit log
8. Security regression
```

---

## PHASE 8 — ADVANCED

```text
1. Personalized invitation
2. Guest import
3. WhatsApp integration
4. Custom domain
5. Digital gift
6. Live streaming
7. Advanced analytics
8. Template marketplace
```

---

# 31. MVP YANG GUE SARANKAN

Jangan membuat:

❌ 30 template
❌ drag-and-drop editor
❌ custom domain
❌ marketplace
❌ AI generator
❌ 100 jenis section

untuk versi pertama.

Bikin:

### **1 template premium yang luar biasa bagus.**

Dengan:

```text
Cover
Couple
Event
Countdown
Story
Gallery
RSVP
Wishes
Location
Music
Closing
```

Kemudian:

```text
Customer
 ↓
Create
 ↓
Edit
 ↓
Preview
 ↓
Pay
 ↓
Publish
 ↓
Share
```

Kalau flow ini sudah solid, baru scale.

---

# 32. NORTH STAR METRIC

Jangan cuma mengukur jumlah user.

Metric utama:

> **Number of published invitations**

Karena:

```text
Registered User
        ≠
Active Customer
        ≠
Paid Customer
        ≠
Published Invitation
```

Yang benar-benar menghasilkan value adalah:

**Published Invitation.**

Secondary metrics:

```text
Template → Create conversion
Create → Publish conversion
Payment conversion
Invitation views
RSVP conversion
Customer retention
```

---

# 33. BUSINESS FLYWHEEL

Ini yang menurut gue menarik.

```text
Beautiful Template
       ↓
More Customers
       ↓
More Invitations
       ↓
More Guest Views
       ↓
More Social Sharing
       ↓
More Brand Awareness
       ↓
More Customers
       ↓
More Templates
       ↓
More Customers
```

Jadi kualitas template bukan hanya masalah estetika.

**Template adalah marketing channel.**

---

# 34. PRIORITAS FEATURE

Kalau kita pakai ranking:

| Feature           | Priority |
| ----------------- | -------: |
| Auth              |    🔴 P0 |
| Invitation Engine |    🔴 P0 |
| Template Engine   |    🔴 P0 |
| Editor            |    🔴 P0 |
| Public Invitation |    🔴 P0 |
| Preview           |    🔴 P0 |
| Payment           |    🔴 P0 |
| Publish           |    🔴 P0 |
| Admin             |    🔴 P0 |
| RSVP              |    🟠 P1 |
| Gallery           |    🟠 P1 |
| Wishes            |    🟠 P1 |
| Guest Management  |    🟠 P1 |
| Analytics         |    🟠 P1 |
| Music             |    🟠 P1 |
| Gift              |    🟡 P2 |
| Personalization   |    🟡 P2 |
| Custom Domain     |    🟡 P2 |
| Marketplace       |    🟢 P3 |
| AI Builder        |    🟢 P3 |

---

# 35. STRATEGI TEMPLATE

Setelah engine stabil, baru kita bikin katalog:

```text
CATEGORY

Luxury
├── Gold
├── Black
└── Editorial

Minimal
├── White
├── Modern
└── Clean

Floral
├── Garden
├── Rose
└── Botanical

Islamic
├── Elegant
├── Classic
└── Modern

Traditional
├── Javanese
├── Sundanese
└── Balinese
```

Tetapi semuanya menggunakan **engine yang sama**.

---

# 36. FINAL PRODUCT ARCHITECTURE

Kalau diringkas:

```text
                    BERNADA.ID
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
   MARKETING         CUSTOMER           ADMIN
       │             DASHBOARD             │
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                         ▼
                INVITATION PLATFORM
                         │
       ┌─────────────────┼──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
 TEMPLATE ENGINE   INVITATION ENGINE   COMMERCE ENGINE
       │                 │                  │
       │                 │                  │
       └─────────────────┼──────────────────┘
                         │
                         ▼
                   DATA + MEDIA
                         │
                         ▼
                  PUBLIC INVITATION
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
             RSVP      Wishes      Gift
                         │
                         ▼
                     ANALYTICS
```

## 🔥 Dan menurut gue, ini arah terbaik untuk project kamu

**Jangan membangun “website undangan”.**

Bangun:

> **BERNADA.ID — sebuah engine yang memungkinkan satu platform menghasilkan ribuan undangan digital premium yang berbeda.**

