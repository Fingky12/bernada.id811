# BERNADA.ID Frontend UI Audit Baseline
**Generated:** 2026-08-22  
**Scope:** Complete frontend codebase mapping (HTML, CSS, JS)  
**Status:** Comprehensive inventory for audit & maintenance

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| HTML Pages | 6 files (1,317 total lines) |
| CSS Files | 12 files + 4 components (1,600+ lines) |
| JavaScript Files | 12 modules (utilities, API, interactive) |
| Design Tokens | 658 lines (comprehensive token system) |
| Breakpoints | 6 (xs: 480px, sm: 576px, md: 768px, lg: 992px, xl: 1200px, 2xl: 1400px) |
| Color Palettes | Brand (Primary: #A12828), Accent (Gold: #FFC400), Neutral (Gray scale), Semantic (Success/Warning/Danger/Info) |

---

## 1. LANDING PAGE (index.html — 469 lines)

### Sections & Components

| Section | ID | CSS Classes | Design Tokens | Interactions |
|---------|----|----|----|----|
| Header/Navbar | site-header | .navbar, .brand, .nav-menu, .nav-toggle | primary, text, spacing | navigation.js (mobile toggle) |
| Hero | beranda | .hero, .hero-content, .hero-visual, .hero-stats | gradient-soft, display-lg, spacing-5xl | scroll-effects.js (reveal) |
| About | tentang | .about, .about-points, .about-point | primary-accent, icon-md, border-radius-md | Scroll reveal |
| Features | fitur | .features, .grid-3, .feature-card | surface, border, shadow-md, spacing-lg | Card hover |
| Pricing | harga | .pricing, .pricing-grid | primary, gold, semantic colors | landing-pricing.js (API render) |
| Portfolio | portofolio | .portfolio, .portfolio-card, .card-hover | surface, shadow-lg, spacing-lg | demo-invitations.js |
| CTA Banner | (inline) | .cta, .cta-content | gradient-brand, text-inverse, font-bold | Link to checkout |
| FAQ | faq | .faq, .accordion, .accordion-item | border-light, text, border-radius-lg | accordion.js |
| Footer | site-footer | .site-footer, .footer-nav | gray-900, text-inverse, spacing-xl | Back-to-top |

### CSS Files
- variables.css (658 lines — tokens)
- reset.css, base.css, layout.css, utilities.css
- components/button.css, components/card.css
- sections.css (1,230 lines), animations.css, responsive.css

### JavaScript
- navigation.js — Hamburger + smooth scroll
- landing-pricing.js — Fetch & render pricing
- accordion.js — FAQ toggle
- scroll-effects.js — Reveal animations
- api.js, util.js — Shared utilities

---

## 2. AUTH PAGES

### Login (pages/login.html — 97 lines)

| Component | ID/Class | Purpose | Handler |
|-----------|----------|---------|---------|
| Layout | .auth-page | Centered card on gradient | login.js |
| Card | .auth-card | White card, shadow-lg, rounded-2xl | — |
| Tabs | .auth-tabs | Login / Register / Forgot / Reset | login.js (tab switch) |
| Forms | .auth-form (4 forms) | Email/Password inputs, validation | login.js (submit handlers) |
| Alert | .auth-alert | Error/success (aria-live) | JS-rendered |
| Buttons | .btn.btn-primary | Full-width CTAs | login.js |

**CSS:** pages.css (auth page section), form.css, button.css
**JS:** login.js (initTabs, validate, submitLogin, submitRegister, submitForgot)
**Tokens:** surface, gradient-soft, primary button, shadow-lg, padding-xl

### Checkout (pages/checkout.html — 54 lines)

| Component | ID/Class | Purpose | Handler |
|-----------|----------|---------|---------|
| Layout | .auth-page, .auth-card | Same as login | checkout.js |
| Summary | .checkout-summary | Package details, dropdown, CTA | checkout.js |
| Result | .checkout-result | Order ID, payment status | Dynamic render |
| Package Info | .checkout-line* | Name, desc, price, features | Rendered from API |
| Submit | .btn.btn-primary | "Buat Order" ? POST /api/orders | checkout.js |

**CSS:** pages.css, form.css, button.css
**JS:** checkout.js (initCheckout, renderSummary, submitOrder, handlePaymentRedirect)

---

## 3. BUILDER PAGE (pages/builder.html — 281 lines)

### Layout
`
+- app-header (sticky) ------------+
¦ BERNADA.ID | User | Admin | Logout ¦
+- app-main (flex) ---------------¦
¦ +- list-view (default) --------+ ¦
¦ ¦ Page Head + Grid + Empty     ¦ ¦
¦ +-----------------------------+ ¦
¦ +- editor-view (d-none) ------+ ¦
¦ ¦ Back + Title                ¦ ¦
¦ ¦ 2-col: Form | Preview       ¦ ¦
¦ +-----------------------------+ ¦
+----------------------------------+
`

### Sections

| Section | ID | Purpose | CSS Classes | JS Handler |
|---------|----|----|----|----|
| Header | app-header | User info + logout | .app-header, .app-header-inner (sticky) | — |
| List View | list-view | Grid of invitations | .invitation-grid, .empty-state | builder.js |
| Editor View | editor-view | Form + Preview | .editor-grid, .editor-form, .editor-section | builder.js |
| Form Fields | (multiple) | Title, slug, couple, date, time, location, template | .form-group, .input | builder.js (sync to API) |
| Preview | .editor-preview | Live preview in iFrame | Real-time update | builder.js |
| Actions | .btn variants | Save, Publish, Delete | Conditional visibility | builder.js |

**CSS:** pages.css (799 lines — app pages), layout.css, form.css, button.css
**JS:** builder.js (renderGrid, openEditor, save/publish/delete, validateSlug, logout)
**Tokens:** header-height (72px), page-title (3xl), spacing-4xl, bg-background

**Responsive:**
- Mobile (< 768px): Form stacked, preview hidden
- Tablet+ (768px): 2-column (form | preview)

---

## 4. ADMIN PAGE (pages/admin.html — 250 lines)

### Sections

| Section | ID | Purpose | CSS | Interaction |
|---------|----|----|-----|-------------|
| Header | app-header | Same as builder | .app-header | — |
| Tabs | .admin-tabs | Summary / Payments / Invitations / Guestbook | pages.css | admin.js |
| Summary Panel | panel-summary | 8 stat cards + user search/filter table | .admin-stats, .stat-card | admin.js (tab switch) |
| Stat Cards | .stat-card (8) | Users, Admins, Invitations, Published, Guestbook, Guests, Gift Accounts, Pending Payments | Grid layout | Click pending-payments ? jump to Payments tab |
| Users Table | admin-table-wrap | Search + Filter + detail modal | .admin-table, .admin-toolbar | admin.js (search, filter, expand) |
| User Detail | .admin-detail | Profile, invitations, guestbook entries | Side card | admin.js |
| Payments Panel | panel-payments | Payment records table | .admin-table | admin.js |
| Invitations Panel | panel-invitations | All invitations table | .admin-table | admin.js |
| Guestbook Panel | panel-guestbook | Guestbook entries | List/table | admin.js |

**CSS:** pages.css (admin section), layout.css, utilities.css
**JS:** admin.js (fetchStats, renderStats, fetchUsers, renderTable, switchTab, expandDetail)
**Tokens:** stat-value (2xl bold), stat-label (sm muted), border-light on rows, hover bg-surface-strong

---

## 5. INVITATION DISPLAY PAGE (pages/invitation.html — 166 lines)

### Sections

| Section | ID | CSS Classes | Purpose | Interaction |
|---------|----|----|---------|-------------|
| Error | inv-error | .inv-error-card (d-none default) | Show if not found/unpublished | Hidden until error |
| Cover | cover | .inv-cover, .inv-cover-ornament | Intro screen with couple name, date | open-btn click ? reveal main |
| Main | inv-main | .inv-main, .inv-section | Scrollable content (hidden initially) | Revealed after opening |
| Countdown | countdown-section | .inv-countdown, .inv-count-box | Days/Hours/Minutes/Seconds | invitation.js updates every 1s |
| Detail | (section) | .inv-section, .inv-main-couple | Couple name, date, time, greeting | Static |
| Location | location-section | .inv-location-card, .inv-venue | Venue name, address, Maps/Calendar buttons | invitation.js (Maps link, .ics) |
| Message | message-section | .inv-message (blockquote) | Personal greeting | Static |
| Gift/Amplop | gift-section (d-none if empty) | .inv-gift-accounts | Gift account list (bank, name, number) | invitation.js (copy to clipboard) |
| Gallery | gallery-section (d-none if empty) | .inv-gallery | Photo grid | Click to expand (lightbox) |
| RSVP/Guestbook | rsvp-section | .inv-rsvp-form, .inv-guestbook | Form (name, attendance, guest count, message) + entries | invitation.js (POST /api/guestbook) |
| Footer | inv-footer | .inv-footer | Copyright, attribution | — |
| Music | music-btn (d-none if no music) | .inv-music-btn | Play/stop background music | invitation.js (toggle audio) |

**CSS:** invitation.css (500+ lines), utilities.css, base.css, form.css, button.css
**JS:** invitation.js (renderInvitation, updateCountdown, addToCalendar, openMaps, submitRSVP, toggleMusic)
**Tokens:** Primary + Gold accents, Playfair Display headings, Plus Jakarta Sans body, spacing-4xl sections, glass morphism effects

**Responsive:**
- Mobile (< 768px): Full-screen sections, stacked cards
- Desktop (768px+): Multi-column layouts

---

## 6. CSS LAYER ARCHITECTURE

### Import Order (main.css)
`
1. variables.css         (658 lines) — Design tokens
2. reset.css            — Normalization
3. base.css             — Element defaults
4. utilities.css        — Helpers (.d-none, .gap-md, .sr-only)
5. layout.css           — Grid, container, spacing
6. components/          — UI components
   +- button.css        (349 lines)
   +- form.css          (299 lines)
   +- card.css
   +- badge.css
7. sections.css         (1,230 lines) — Landing sections
8. animations.css       — Keyframes, transitions
9. responsive.css       — Media queries (Mobile First)
`

### Key Files

| File | Lines | Purpose | Key Classes |
|------|-------|---------|-------------|
| variables.css | 658 | Design tokens | :root (658 CSS vars) |
| reset.css | ~100 | Normalize | *, body, input |
| base.css | ~400 | Element styling | h1–h6, p, a, forms |
| utilities.css | ~300 | Helpers | .d-none, .gap-lg, .sr-only |
| layout.css | ~250 | Grid, flex | .container, .grid-3, .flex, .stack |
| button.css | 349 | Buttons | .btn, .btn-primary, .btn-outline, .btn-sm |
| form.css | 299 | Forms | .input, .textarea, .form-group, .form-label |
| card.css | ~150 | Cards | .card, .card-hover |
| badge.css | ~100 | Badges | .badge, .badge-primary |
| sections.css | 1,230 | Landing | .hero, .about, .features, .pricing, .faq |
| animations.css | ~350 | Keyframes | .animate-fade-in, .animate-slide-up |
| responsive.css | ~300 | Media queries | @media breakpoints |
| pages.css | 799 | App pages | .auth-page, .app-header, .editor-form |
| invitation.css | ~500 | Invitation | .inv-cover, .inv-countdown, .inv-guestbook |

---

## 7. JAVASCRIPT MODULE MAP

| File | ~Lines | Key Functions | Page(s) |
|------|--------|---|---------|
| util.js | 150 | formatCurrency(), debounce(), parseDate(), validateEmail() | Reused all |
| api.js | 200 | fetch() wrappers (GET/POST/PATCH/DELETE) | All pages |
| navigation.js | 100 | toggleNav(), smoothScroll() | index.html |
| landing-pricing.js | 150 | fetchPackages(), renderCards() | index.html (pricing) |
| accordion.js | 100 | toggleAccordion(), closeOthers() | index.html (FAQ) |
| scroll-effects.js | 120 | initReveal(), observeIntersection() | All pages |
| login.js | 200 | initTabs(), validateForm(), submit* | /login |
| checkout.js | 150 | initCheckout(), renderSummary(), submitOrder() | /checkout |
| builder.js | 300+ | renderGrid(), openEditor(), save/publish/delete | /builder |
| admin.js | 250+ | fetchStats(), renderTable(), switchTab(), filter* | /admin |
| invitation.js | 300+ | renderInvitation(), updateCountdown(), submitRSVP() | /u/:slug |
| demo-invitations.js | 100 | getDemoInvitations() | index.html (portfolio) |

---

## 8. DESIGN TOKENS SUMMARY

### Colors
- **Primary:** #A12828 (brand red) + scale (50–900)
- **Accent:** #FFC400 (gold) + scale (50–900)
- **Neutral:** Gray scale (50–900, warm tone)
- **Semantic:** Success (green), Warning (amber), Danger (red), Info (blue)
- **Text:** primary (1F1F1F), secondary (555555), muted (8C8780), disabled (B5B0A9), inverse (FFFFFF)
- **Background:** #F7F3EF (page), surface (white), surface-alt (F5F2EE)
- **Border:** #E5E5E5 (default), light (F0EDE9), strong (D5D0C9)

### Typography
- **Heading Font:** Playfair Display (elegant, serif)
- **Body Font:** Plus Jakarta Sans (modern, sans-serif)
- **Code Font:** JetBrains Mono (monospace)
- **Sizes:** xs (12px) to 6xl (72px), fluid display sizes (clamp)
- **Weights:** 300–900 (light to black)
- **Line Heights:** tight (1.25) to loose (2)

### Spacing
- Scale: 2px, 8px, 12px, 16px, 24px, 32px, 40px, 48px, 56px, 64px, 72px, 80px
- Container padding: 20px (mobile) to 32px (desktop)
- Grid gap: 12px–32px (context-dependent)

### Shadows
- xs, sm, md, lg, xl, 2xl (from subtle to strong)

### Border Radius
- xs (4px), sm (8px), md (12px), lg (16px), xl (20px), 2xl (24px), pill (9999px), full (50%)

### Z-Index
- Base (0), header (100), dropdown (1000), modal (1300), toast (1600), max (2147483647)

### Breakpoints
- xs: 480px, sm: 576px, md: 768px, lg: 992px, xl: 1200px, 2xl: 1400px

---

## 9. ACCESSIBILITY FEATURES

### Semantic HTML
- Landmarks: header, main, section, article, footer
- Heading hierarchy: h1–h6
- Form labels with for attribute
- Table headers with scope="col"

### ARIA Attributes
- role="tab", role="tabpanel" (tabs)
- role="timer" (countdown)
- role="alert", role="button" (interactive)
- aria-label (icon buttons)
- aria-labelledby (main regions)
- aria-live="polite" (dynamic content)
- aria-expanded (mobile menu)
- aria-controls (toggle targets)
- aria-hidden="true" (decorative icons)

### Keyboard Navigation
- Tab order: header ? nav ? main ? footer
- Focus ring visible (--color-focus-ring: rgba(161, 40, 40, 0.35))
- Enter/Space on buttons
- Arrow keys in dropdowns (if applicable)

### Utilities
- .sr-only (screen reader only)
- Focus ring tokens (primary, danger, success)
- Proper contrast ratios (WCAG AA)

---

## 10. AUDIT CHECKLIST

### Visual Consistency
- [ ] All brand colors from variables.css (primary #A12828, accent #FFC400)
- [ ] Typography hierarchy: Playfair (headings), Plus Jakarta (body)
- [ ] Spacing: 8px scale (--spacing-xs to --spacing-7xl)
- [ ] Shadows: sm, md, lg, xl applied consistently
- [ ] Border radius: md (inputs), pill (buttons), lg (cards)

### Responsive Testing
- [ ] Mobile (375px): Single column, hamburger nav, stacked cards
- [ ] Tablet (768px): 2-column, expanded nav
- [ ] Desktop (1200px): 3-column, full layout
- [ ] Large desktop (1400px): Max-width containers

### Accessibility
- [ ] Form inputs have labels
- [ ] Dynamic content uses aria-live="polite"
- [ ] Focus ring visible
- [ ] Images: alt text (meaningful) or aria-hidden (decorative)
- [ ] Color + icon/text for status

### Components
- [ ] Buttons: primary, outline, ghost, sm, lg consistent
- [ ] Forms: text, email, password, textarea, select unified
- [ ] Cards: shadow/border-radius tokens
- [ ] Tables: thead/tbody, scope="col"

### Performance
- [ ] Critical CSS loaded (main.css)
- [ ] Hero image high priority (fetchpriority)
- [ ] Other images lazy (loading="lazy")
- [ ] Non-critical JS deferred
- [ ] No unused CSS

### Security
- [ ] No hardcoded secrets
- [ ] API calls HTTPS
- [ ] Form validation (JS + backend)
- [ ] CSRF tokens (if state-changing)

### SEO
- [ ] Meta description on all pages
- [ ] robots="noindex" on private pages (/admin, /builder, /checkout, /u/:slug)
- [ ] Heading hierarchy
- [ ] Image alt text
- [ ] Open Graph tags (landing)

---

## 11. QUICK REFERENCE

### By Feature
| Feature | HTML | CSS | JS |
|---------|------|-----|-----|
| Landing | index.html | sections.css | navigation.js, landing-pricing.js, accordion.js |
| Auth | pages/login.html | pages.css | login.js |
| Checkout | pages/checkout.html | pages.css | checkout.js |
| Builder | pages/builder.html | pages.css | builder.js |
| Admin | pages/admin.html | pages.css | admin.js |
| Invitation | pages/invitation.html | invitation.css | invitation.js |

### By Layer
| Layer | Files |
|-------|-------|
| Foundation | variables.css, reset.css, base.css |
| Utilities | utilities.css, layout.css |
| Components | button.css, form.css, card.css, badge.css |
| Sections | sections.css, animations.css, responsive.css |
| Pages | pages.css, invitation.css |
| Scripts | util.js, api.js, + feature modules |

---

**End of Audit Report**
*Baseline for frontend consistency, accessibility, and maintainability.*
