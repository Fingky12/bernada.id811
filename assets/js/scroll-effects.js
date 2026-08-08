/* ==========================================================
    BERNADA.ID SCROLL EFFECTS
    ----------------------------------------------------------
    Sprint 2 — The First Experience
    Tanggung jawab:
    - Scroll reveal (IntersectionObserver, fallback aman)
    - Active nav link sesuai section yang terlihat
    - Back-to-top button
    Dependensi: sections.css (.reveal, .back-to-top, .nav-link)
  ========================================================== */

(function () {
    'use strict';

    /* Tanda JS aktif — .reveal default tetap terlihat bila JS mati */
    document.documentElement.classList.add('js-enabled');

    const backToTop = document.querySelector('.back-to-top');
    const sections = Array.prototype.slice.call(
        document.querySelectorAll('main section[id]')
    );
    const navLinks = Array.prototype.slice.call(
        document.querySelectorAll('.nav-link')
    );

    const BACK_TO_TOP_THRESHOLD = 600;
    const ACTIVE_OFFSET = 100;
    const BOTTOM_MARGIN = 60;

    /* ------------------------------------------
        BACK-TO-TOP
    ------------------------------------------ */

    if (backToTop) {
        function updateBackToTop() {
            backToTop.classList.toggle(
                'is-visible',
                window.scrollY > BACK_TO_TOP_THRESHOLD
            );
        }

        updateBackToTop();
        window.addEventListener('scroll', updateBackToTop, { passive: true });

        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ------------------------------------------
        SCROLL REVEAL
    ------------------------------------------ */

    const revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && revealElements.length) {
        const revealObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        revealElements.forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        revealElements.forEach(function (el) {
            el.classList.add('is-visible');
        });
    }

    /* ------------------------------------------
        ACTIVE NAV LINK
    ------------------------------------------ */

    if (sections.length && navLinks.length) {
        const linkBySection = new Map();
        navLinks.forEach(function (link) {
            const href = link.getAttribute('href');
            if (href && href.charAt(0) === '#') {
                linkBySection.set(href.slice(1), link);
            }
        });

        function buildPositions() {
            return sections.map(function (section) {
                return {
                    id: section.id,
                    top: section.offsetTop - ACTIVE_OFFSET
                };
            });
        }

        let positions = buildPositions();
        window.addEventListener('resize', function () {
            positions = buildPositions();
        }, { passive: true });

        function updateActiveNav() {
            const scrollY = window.scrollY;
            let currentId = null;

            for (let i = 0; i < positions.length; i += 1) {
                if (scrollY >= positions[i].top) {
                    currentId = positions[i].id;
                }
            }

            const nearBottom =
                window.innerHeight + scrollY >=
                document.documentElement.scrollHeight - BOTTOM_MARGIN;
            if (nearBottom) {
                currentId = positions[positions.length - 1].id;
            }

            navLinks.forEach(function (link) {
                link.classList.remove('is-active');
            });

            if (currentId && linkBySection.has(currentId)) {
                linkBySection.get(currentId).classList.add('is-active');
            }
        }

        updateActiveNav();
        window.addEventListener('scroll', updateActiveNav, { passive: true });
    }
})();
