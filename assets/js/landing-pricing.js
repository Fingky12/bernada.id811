/* ==========================================================
    BERNADA.ID — LANDING PRICING
    ----------------------------------------------------------
    Sprint 6 — The Launch & Commerce Foundation
    Render section harga dari backend (GET /api/packages).
    Frontend TIDAK menentukan harga final — hanya menampilkan
    data yang dikirim API (source of truth = tabel packages).
  ========================================================== */

import { api } from './api.js';
import { escapeHtml } from './util.js';

const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

function formatPrice(amount) {
  return new Intl.NumberFormat('id-ID').format(Number(amount));
}

function renderPackages(packages) {
  const grid = document.getElementById('pricing-grid');
  if (!grid) return;

  grid.innerHTML = packages
    .map((pkg) => {
      const popular = pkg.code === 'premium';
      const features = (pkg.features || [])
        .map((feature) => `<li>${CHECK_ICON}${escapeHtml(feature)}</li>`)
        .join('');
      const ctaLabel = Number(pkg.priceAmount) === 0
        ? 'Mulai Gratis'
        : `Pilih ${escapeHtml(pkg.name)}`;
      return `
        <article class="card pricing-card${popular ? ' pricing-popular' : ''}">
          ${popular ? '<span class="pricing-popular-badge">Paling Populer</span>' : ''}
          <h3 class="pricing-tier">${escapeHtml(pkg.name)}</h3>
          <p class="pricing-price"><span class="currency">Rp</span>${formatPrice(pkg.priceAmount)}<span class="pricing-period">/ undangan</span></p>
          <p class="pricing-desc">${escapeHtml(pkg.description)}</p>
          <ul class="pricing-features">${features}</ul>
          <a class="btn ${popular ? 'btn-primary' : 'btn-outline'} w-100 pricing-cta"
             href="/checkout?package=${encodeURIComponent(pkg.id)}">${ctaLabel}</a>
        </article>`;
    })
    .join('');

  const note = document.getElementById('pricing-note');
  if (note) note.textContent = '';
}

async function init() {
  const grid = document.getElementById('pricing-grid');
  if (!grid) return;
  const note = document.getElementById('pricing-note');
  try {
    const packages = await api.listPackages();
    if (!packages.length) {
      if (note) note.textContent = 'Daftar paket belum tersedia.';
      return;
    }
    renderPackages(packages);
  } catch {
    if (note) note.textContent = 'Gagal memuat daftar paket. Silakan muat ulang halaman.';
  }
}

init();
