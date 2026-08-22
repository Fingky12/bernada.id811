/* ==========================================================
    BERNADA.ID FRONTEND UTIL
    ----------------------------------------------------------
    Fungsi bersama antar halaman:
    - escapeHtml — mencegah XSS pada render dinamis
    - formatDate / formatGuestbookDate — format tanggal
    Dipakai oleh builder.js & invitation.js (hilangkan duplikasi).
  ========================================================== */

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatDate(iso, options) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...(options || {}),
  }).format(date);
}

export function formatGuestbookDate(iso) {
  return formatDate(iso, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* Dashboard shell: toggle sidebar drawer (tablet/mobile) */
export function initDashShell() {
  const sidebar = document.getElementById('dash-sidebar');
  const toggle = document.getElementById('dash-nav-toggle');
  const backdrop = document.getElementById('dash-backdrop');
  if (!sidebar || !toggle || !backdrop) return;

  const close = () => {
    sidebar.classList.remove('is-open');
    backdrop.hidden = true;
  };

  toggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('is-open');
    backdrop.hidden = !open;
  });
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}
