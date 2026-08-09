/* ==========================================================
    BERNADA.ID DEMO INVITATIONS
    ----------------------------------------------------------
    Data contoh untuk halaman undangan (/u/:slug) saat
    API belum tersedia (mis. database sedang tidak aktif).
    Hanya dipakai untuk slug undangan contoh dari portofolio.
  ========================================================== */

const DAY = 86_400_000;

function inDays(days, hour = 10, minute = 0) {
  const date = new Date(Date.now() + days * DAY);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export function galleryPlaceholder(theme = {}, seed = 'B') {
  const primary = theme.primaryColor || '#A12828';
  const accent = theme.accentColor || '#FFC400';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${primary}"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="url(#g)" opacity="0.85"/>
  <circle cx="200" cy="250" r="74" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.7"/>
  <text x="200" y="255" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#ffffff" opacity="0.92">${seed}</text>
  <text x="200" y="320" text-anchor="middle" font-family="Georgia, serif" font-size="14" letter-spacing="4" fill="#ffffff" opacity="0.7">BERNADA.ID</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function seedGuestbook(couple) {
  return [
    {
      id: 'demo-1',
      guestName: 'Bapak/Ibu Tamu Undangan',
      attendance: 'hadir',
      guestsCount: 2,
      message: `Selamat menempuh hidup baru ${couple}! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.`,
      createdAt: new Date(Date.now() - 2 * DAY).toISOString(),
    },
    {
      id: 'demo-2',
      guestName: 'Keluarga Besar',
      attendance: 'hadir',
      guestsCount: 3,
      message: 'Barakallahu lakuma wa baraka alaikuma. Bahagia selalu!',
      createdAt: new Date(Date.now() - DAY).toISOString(),
    },
  ];
}

function build(slug, templateId, couple, title, theme, eventDate, eventTime, venue, location, message) {
  return {
    invitation: {
      id: `00000000-0000-0000-0000-${templateId}`,
      slug,
      title,
      eventDate,
      eventTime,
      venue,
      location,
      couple,
      message,
      theme,
      musicUrl: '',
      gallery: Array.from({ length: 6 }, (_, index) => galleryPlaceholder(theme, String(index + 1))),
      publishedAt: new Date().toISOString(),
    },
    template: {
      name: title,
      category: 'contoh',
      previewUrl: null,
    },
    guestbook: seedGuestbook(couple),
  };
}

export const DEMO_INVITATIONS = {
  'vella-adit': build(
    'vella-adit',
    '000000000001',
    'Vella & Adit',
    'Klasik Minimal',
    { primaryColor: '#1F3A5F', accentColor: '#C9A86A' },
    inDays(45),
    '09:00',
    'The Ritz-Carlton Ballroom',
    'Jl. Asia Afrika No. 8, Bandung, Jawa Barat',
    'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu untuk kami.',
  ),
  'rara-bima': build(
    'rara-bima',
    '000000000002',
    'Rara & Bima',
    'Merah Elegan',
    { primaryColor: '#A12828', accentColor: '#FFC400' },
    inDays(60),
    '11:00',
    'Hotel Mulia Senayan',
    'Jl. Asia Afrika No. 8, Jakarta Pusat',
    'Bersama ini kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami.',
  ),
  'intan-reza': build(
    'intan-reza',
    '000000000003',
    'Intan & Reza',
    'Border Bunga',
    { primaryColor: '#6B4E71', accentColor: '#E8B4B8' },
    inDays(75),
    '10:00',
    'Gedung Sate Grand Hall',
    'Jl. Diponegoro No. 22, Bandung, Jawa Barat',
    'Dengan memohon ridho Allah SWT, kami bermaksud menyelenggarakan resepsi pernikahan.',
  ),
  'dina-fajar': build(
    'dina-fajar',
    '000000000004',
    'Dina & Fajar',
    'Gold Mewah',
    { primaryColor: '#8C6D1F', accentColor: '#F2D06B' },
    inDays(90),
    '08:00',
    'Ballroom Hotel Shangri-La',
    'Jl. Jend. Sudirman Kav. 1, Jakarta Selatan',
    'Maha suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Merupakan kehormatan bagi kami apabila berkenan hadir.',
  ),
  'maya-galih': build(
    'maya-galih',
    '000000000005',
    'Maya & Galih',
    'Pita Emas',
    { primaryColor: '#2E3A46', accentColor: '#D4AF37' },
    inDays(105),
    '13:00',
    'Garden Venue The Taman',
    'Jl. Raya Canggu No. 99, Bali',
    'Turut mengundang Bapak/Ibu/Saudara/i dalam acara pernikahan putra-putri kami.',
  ),
  'salsa-raka': build(
    'salsa-raka',
    '000000000006',
    'Salsa & Raka',
    'Diagonal Modern',
    { primaryColor: '#1E2A38', accentColor: '#FF6B6B' },
    inDays(120),
    '16:00',
    'Sky Garden Lantai 38',
    'Jl. MH. Thamrin No. 1, Jakarta Pusat',
    'Akhirnya sampai juga di hari yang kami tunggu. Kami menantikan kehadiran serta doa restu dari Bapak/Ibu/Saudara/i.',
  ),
};

export function demoGuestbook(slug) {
  return DEMO_INVITATIONS[slug]?.guestbook || null;
}
