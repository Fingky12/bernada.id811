/* ==========================================================
    BERNADA.ID ACCORDION
    ----------------------------------------------------------
    Sprint 2 — The First Experience
    Tanggung jawab:
    - Buka/tutup item FAQ accordion (satu item terbuka)
    - Sinkron atribut aria-expanded untuk aksesibilitas
    Dependensi: sections.css (.accordion, .accordion-item)
  ========================================================== */

(function () {
    'use strict';

    const buttons = document.querySelectorAll('.accordion-button');
    if (!buttons.length) return;

    const OPEN_CLASS = 'is-open';

    function closeItem(item) {
        item.classList.remove(OPEN_CLASS);
        const button = item.querySelector('.accordion-button');
        if (button) {
            button.setAttribute('aria-expanded', 'false');
        }
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            const item = button.closest('.accordion-item');
            if (!item) return;

            const isOpen = item.classList.contains(OPEN_CLASS);

            document.querySelectorAll('.accordion-item.' + OPEN_CLASS)
                .forEach(closeItem);

            if (!isOpen) {
                item.classList.add(OPEN_CLASS);
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });
})();
