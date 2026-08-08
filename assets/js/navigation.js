/* ==========================================================
    BERNADA.ID NAVIGATION
    ----------------------------------------------------------
    Sprint 2 — The First Experience
    Tanggung jawab:
    - Mobile menu (hamburger) open/close + fokus aksesibel
    - Sticky header shadow saat digulir
    Dependensi: sections.css (.nav-menu, .nav-toggle, .site-header)
  ========================================================== */

(function () {
    'use strict';

    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');

    if (!header || !toggle || !menu) return;

    const OPEN_CLASS = 'is-open';
    const SCROLLED_CLASS = 'is-scrolled';
    const SCROLLED_THRESHOLD = 8;
    const DESKTOP_QUERY = '(min-width: 992px)'; /* --breakpoint-lg */
    const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;

    function setMenuState(open) {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
        menu.classList.toggle(OPEN_CLASS, open);
        document.body.classList.toggle('nav-open', open);

        if (open) {
            const firstLink = menu.querySelector('.nav-link');
            if (firstLink && !isDesktop()) {
                firstLink.focus({ preventScroll: true });
            }
        }
    }

    function closeMenu() {
        if (menu.classList.contains(OPEN_CLASS)) {
            setMenuState(false);
        }
    }

    toggle.addEventListener('click', function () {
        setMenuState(!menu.classList.contains(OPEN_CLASS));
    });

    menu.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeMenu();
            toggle.focus();
        }
    });

    window.addEventListener('resize', function () {
        if (isDesktop()) closeMenu();
    });

    function onScroll() {
        header.classList.toggle(SCROLLED_CLASS, window.scrollY > SCROLLED_THRESHOLD);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
})();
