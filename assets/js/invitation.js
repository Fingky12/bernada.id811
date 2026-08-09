/* ==========================================================
    BERNADA.ID INVITATION PAGE
    ----------------------------------------------------------
    Halaman publik undangan (/u/:slug).
    Tanggung jawab:
    - Mengambil data undangan terbit dari API publik
    - Merender konten, tema warna, hitung mundur
    - Musik latar & tombol toggle
    - Tautan lokasi (Google Maps) & unduhan kalender
  ========================================================== */

import { DEMO_INVITATIONS, demoGuestbook, galleryPlaceholder } from './demo-invitations.js';

const DEFAULT_THEME = { primaryColor: '#A12828', accentColor: '#FFC400' };

const elements = {
  error: document.getElementById('inv-error'),
  errorText: document.getElementById('inv-error-text'),
  cover: document.getElementById('cover'),
  openBtn: document.getElementById('open-btn'),
  main: document.getElementById('inv-main'),
  coverCouple: document.getElementById('cover-couple'),
  coverDate: document.getElementById('cover-date'),
  mainCouple: document.getElementById('main-couple'),
  mainDate: document.getElementById('main-date'),
  venue: document.getElementById('venue'),
  location: document.getElementById('location'),
  message: document.getElementById('message'),
  messageSection: document.getElementById('message-section'),
  countdownSection: document.getElementById('countdown-section'),
  cdDays: document.getElementById('cd-days'),
  cdHours: document.getElementById('cd-hours'),
  cdMinutes: document.getElementById('cd-minutes'),
  cdSeconds: document.getElementById('cd-seconds'),
  mapsBtn: document.getElementById('maps-btn'),
  calendarBtn: document.getElementById('calendar-btn'),
  music: document.getElementById('bg-music'),
  musicBtn: document.getElementById('music-btn'),
  musicIcon: document.getElementById('music-icon'),
  gallerySection: document.getElementById('gallery-section'),
  gallery: document.getElementById('gallery'),
  rsvpForm: document.getElementById('rsvp-form'),
  rsvpAlert: document.getElementById('rsvp-alert'),
  guestbook: document.getElementById('guestbook'),
  guestbookCount: document.getElementById('guestbook-count'),
  guestbookNote: document.getElementById('guestbook-note'),
};

let invitation = null;
let musicOn = false;
let guestbookEntries = [];

const GUESTBOOK_KEY = (slug) => `bernada:guestbook:${slug}`;

function getSlug() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  return segments[segments.length - 1] || '';
}

function formatDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatTime(time) {
  const trimmed = String(time || '').trim();
  if (!trimmed) return '';
  const match = trimmed.match(/^(\d{1,2})[:.](\d{2})/);
  if (match) {
    return `${match[1].padStart(2, '0')}:${match[2]}`;
  }
  return trimmed;
}

function applyTheme(theme) {
  const merged = { ...DEFAULT_THEME, ...(theme || {}) };
  const root = document.documentElement;
  root.style.setProperty('--inv-primary', merged.primaryColor || DEFAULT_THEME.primaryColor);
  root.style.setProperty('--inv-accent', merged.accentColor || DEFAULT_THEME.accentColor);
}

function showError(message) {
  elements.errorText.textContent = message || 'Undangan tidak ditemukan atau belum diterbitkan.';
  elements.error.classList.remove('d-none');
  elements.cover.classList.add('d-none');
  elements.main.hidden = true;
}

function render() {
  const inv = invitation.invitation;
  const fallbackCouple = inv.couple || inv.title || 'Nama Pasangan';

  document.title = `${fallbackCouple} — Undangan Digital`;
  elements.coverCouple.textContent = fallbackCouple;
  elements.mainCouple.textContent = fallbackCouple;

  const dateText = formatDate(inv.eventDate);
  if (dateText) {
    elements.coverDate.textContent = dateText;
    const timeText = formatTime(inv.eventTime);
    elements.mainDate.textContent = timeText ? `${dateText} · ${timeText}` : dateText;
  } else {
    elements.coverDate.classList.add('d-none');
    elements.mainDate.classList.add('d-none');
    elements.countdownSection.classList.add('d-none');
  }

  elements.venue.textContent = inv.venue || 'Tempat Acara';
  elements.location.textContent = inv.location || '';

  if (inv.message) {
    elements.message.textContent = inv.message;
  } else {
    elements.messageSection.classList.add('d-none');
  }

  const query = inv.location || inv.venue;
  if (query) {
    elements.mapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  } else {
    elements.mapsBtn.classList.add('d-none');
  }

  if (inv.musicUrl) {
    elements.music.src = inv.musicUrl;
    elements.musicBtn.classList.remove('d-none');
  }

  renderGallery();
}

function renderGallery() {
  const photos = (invitation.invitation.gallery || []).filter(Boolean);
  if (photos.length === 0) {
    elements.gallerySection.classList.add('d-none');
    elements.gallery.innerHTML = '';
    return;
  }
  elements.gallerySection.classList.remove('d-none');
  const fallback = galleryPlaceholder(invitation.invitation.theme, 'B');
  elements.gallery.innerHTML = photos
    .map(
      (url, index) => `
      <figure class="inv-gallery-item">
        <img src="${escapeHtml(url)}" alt="Foto galeri ${index + 1}" loading="lazy" width="400" height="500"
             onerror="this.onerror=null;this.src='${fallback}';">
      </figure>`,
    )
    .join('');
}

/* ==========================================================
    RSVP & BUKU TAMU
  ========================================================== */

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatGuestbookDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function guestbookEntryHtml(entry) {
  const hadir = entry.attendance === 'hadir';
  const badge = hadir ? 'Hadir' : 'Tidak Hadir';
  const badgeClass = hadir
    ? 'inv-guestbook-entry-attendance-hadir'
    : 'inv-guestbook-entry-attendance-tidak-hadir';
  const message = entry.message
    ? `<p class="inv-guestbook-entry-message">${escapeHtml(entry.message)}</p>`
    : '';
  return `
    <article class="inv-guestbook-entry">
      <div class="inv-guestbook-entry-top">
        <span class="inv-guestbook-entry-name">${escapeHtml(entry.guestName)}</span>
        <span class="inv-guestbook-entry-attendance ${badgeClass}">${badge}</span>
      </div>
      <p class="inv-guestbook-entry-date">${formatGuestbookDate(entry.createdAt)} · ${entry.guestsCount || 1} tamu</p>
      ${message}
    </article>`;
}

function renderGuestbook() {
  if (guestbookEntries.length === 0) {
    elements.guestbook.innerHTML =
      '<p class="inv-guestbook-empty">Belum ada ucapan. Jadilah yang pertama!</p>';
    elements.guestbookCount.textContent = '';
    return;
  }
  elements.guestbookCount.textContent = `${guestbookEntries.length} ucapan`;
  elements.guestbook.innerHTML = guestbookEntries.map(guestbookEntryHtml).join('');
}

function setRsvpAlert(message, type) {
  const cls =
    type === 'danger'
      ? 'inv-rsvp-alert inv-rsvp-alert-danger'
      : type === 'success'
        ? 'inv-rsvp-alert inv-rsvp-alert-success'
        : 'inv-rsvp-alert d-none';
  elements.rsvpAlert.className = cls;
  elements.rsvpAlert.textContent = message || '';
}

function useLocalGuestbook() {
  elements.guestbookNote.classList.remove('d-none');
  const demo = demoGuestbook(getSlug()) || [];
  const saved = [];
  try {
    saved.push(...JSON.parse(localStorage.getItem(GUESTBOOK_KEY(getSlug())) || '[]'));
  } catch {
    /* data lokal rusak — abaikan */
  }
  guestbookEntries = [...saved, ...demo];
}

async function loadGuestbook() {
  const slug = getSlug();
  try {
    const res = await fetch(`/api/invitations/public/${encodeURIComponent(slug)}/guestbook`);
    const data = await res.json().catch(() => null);
    if (res.ok) {
      guestbookEntries = data?.entries || [];
      renderGuestbook();
      return;
    }
  } catch {
    /* lanjut ke fallback lokal */
  }
  useLocalGuestbook();
  renderGuestbook();
}

function saveLocalGuestbook(payload) {
  elements.guestbookNote.classList.remove('d-none');
  const entry = {
    id: `local-${Date.now()}`,
    guestName: payload.guestName,
    attendance: payload.attendance,
    guestsCount: payload.guestsCount,
    message: payload.message,
    createdAt: new Date().toISOString(),
  };
  guestbookEntries = [entry, ...guestbookEntries];
  renderGuestbook();

  const slug = getSlug();
  const saved = [];
  try {
    saved.push(...JSON.parse(localStorage.getItem(GUESTBOOK_KEY(slug)) || '[]'));
  } catch {
    /* abaikan */
  }
  saved.unshift(entry);
  try {
    localStorage.setItem(GUESTBOOK_KEY(slug), JSON.stringify(saved.slice(0, 100)));
  } catch {
    /* kuota penuh — abaikan */
  }
}

async function submitRsvp(event) {
  event.preventDefault();
  const slug = getSlug();

  const guestName = document.getElementById('rsvp-name').value.trim();
  const attendance = document.getElementById('rsvp-attendance').value;
  const guestsCount = Number(document.getElementById('rsvp-count').value) || 1;
  const message = document.getElementById('rsvp-message').value.trim();

  setRsvpAlert('', '');
  if (!guestName) {
    setRsvpAlert('Nama wajib diisi.', 'danger');
    return;
  }

  const payload = { guestName, attendance, guestsCount, message };

  try {
    const res = await fetch(`/api/invitations/public/${encodeURIComponent(slug)}/guestbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin',
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.error?.message || 'Gagal mengirim ucapan.');
    }
    guestbookEntries = [data.entry, ...guestbookEntries];
    renderGuestbook();
    setRsvpAlert('Ucapan berhasil dikirim. Terima kasih!', 'success');
  } catch {
    saveLocalGuestbook(payload);
    setRsvpAlert('Ucapan terkirim (pratinjau lokal).', 'success');
  }

  event.target.reset();
  document.getElementById('rsvp-count').value = 1;
  document.getElementById('rsvp-attendance').value = 'hadir';
}

function setCountdown(target) {
  const tick = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) {
      elements.cdDays.textContent = '0';
      elements.cdHours.textContent = '0';
      elements.cdMinutes.textContent = '0';
      elements.cdSeconds.textContent = '0';
      return false;
    }
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    const seconds = Math.floor((diff % 60_000) / 1000);
    elements.cdDays.textContent = days;
    elements.cdHours.textContent = String(hours).padStart(2, '0');
    elements.cdMinutes.textContent = String(minutes).padStart(2, '0');
    elements.cdSeconds.textContent = String(seconds).padStart(2, '0');
    return true;
  };

  if (tick()) {
    setInterval(tick, 1000);
  }
}

function buildCalendarHref() {
  const inv = invitation.invitation;
  const date = new Date(inv.eventDate);
  const timeMatch = String(inv.eventTime || '').match(/^(\d{1,2})[:.](\d{2})/);
  if (timeMatch) {
    date.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
  } else {
    date.setHours(9, 0, 0, 0);
  }
  const pad = (num) => String(num).padStart(2, '0');
  const stamp = (d) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const location = [inv.venue, inv.location].filter(Boolean).join(', ');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BERNADA.ID//IDN',
    'BEGIN:VEVENT',
    `UID:${inv.id}@bernada.id`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(date)}`,
    `SUMMARY:${inv.couple || inv.title || 'Undangan'}`,
    location ? `LOCATION:${location}` : '',
    location ? `DESCRIPTION:${location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

function downloadCalendar() {
  const link = document.createElement('a');
  link.href = buildCalendarHref();
  link.download = 'undangan.ics';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function toggleMusic() {
  if (!elements.music.src) return;
  musicOn = !musicOn;
  if (musicOn) {
    elements.music.play().catch(() => {
      musicOn = false;
      elements.musicIcon.textContent = '🔇';
      elements.musicBtn.setAttribute('aria-label', 'Nyalakan musik');
    });
  } else {
    elements.music.pause();
  }
  elements.musicIcon.textContent = musicOn ? '🔊' : '🔇';
  elements.musicBtn.setAttribute('aria-label', musicOn ? 'Matikan musik' : 'Nyalakan musik');
}

function openInvitation() {
  elements.cover.classList.add('is-open');
  elements.main.hidden = false;
  if (elements.music.src) {
    toggleMusic();
  }
  setTimeout(() => {
    elements.cover.remove();
    elements.openBtn.removeEventListener('click', openInvitation);
  }, 500);
}

async function init() {
  const slug = getSlug();
  if (!slug) {
    showError('Tautan undangan tidak valid.');
    return;
  }

  const demo = DEMO_INVITATIONS[slug];

  try {
    const res = await fetch(`/api/invitations/public/${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (res.ok) {
      invitation = data;
    } else if (demo) {
      invitation = demo;
    } else {
      showError(data?.error?.message);
      return;
    }
  } catch {
    if (demo) {
      invitation = demo;
    } else {
      showError('Gagal memuat undangan. Periksa koneksi Anda.');
      return;
    }
  }

  applyTheme(invitation.invitation.theme);
  render();

  if (invitation.invitation.eventDate) {
    const target = new Date(invitation.invitation.eventDate);
    setCountdown(target);
  }

  loadGuestbook();
  elements.rsvpForm.addEventListener('submit', submitRsvp);
  elements.openBtn.addEventListener('click', openInvitation);
  elements.musicBtn.addEventListener('click', toggleMusic);
  elements.calendarBtn.addEventListener('click', downloadCalendar);
}

init();
