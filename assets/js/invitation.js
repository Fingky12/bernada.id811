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
};

let invitation = null;
let musicOn = false;

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

  try {
    const res = await fetch(`/api/invitations/public/${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (!res.ok) {
      showError(data?.error?.message);
      return;
    }
    invitation = data;
    applyTheme(invitation.invitation.theme);
    render();

    if (invitation.invitation.eventDate) {
      const target = new Date(invitation.invitation.eventDate);
      setCountdown(target);
    }

    elements.openBtn.addEventListener('click', openInvitation);
    elements.musicBtn.addEventListener('click', toggleMusic);
    elements.calendarBtn.addEventListener('click', downloadCalendar);
  } catch {
    showError('Gagal memuat undangan. Periksa koneksi Anda.');
  }
}

init();
