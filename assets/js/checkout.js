/* ==========================================================
    BERNADA.ID — CHECKOUT
    ----------------------------------------------------------
    Sprint 6 — The Launch & Commerce Foundation
    Flow: pilih paket → buat order → buat pembayaran → status.
    Frontend TIDAK menentukan harga (amount = dari server).
  ========================================================== */

import { api } from './api.js';
import { escapeHtml } from './util.js';

const params = new URLSearchParams(window.location.search);
const packageId = params.get('package');

const IDEMPOTENCY_PREFIX = 'bernada.order.idem.';

const elements = {
  alert: document.getElementById('checkout-alert'),
  subtitle: document.getElementById('checkout-subtitle'),
  summary: document.getElementById('checkout-summary'),
  result: document.getElementById('checkout-result'),
  submit: document.getElementById('co-submit'),
  invitation: document.getElementById('co-invitation'),
};

const STATUS_LABEL = {
  pending: 'Menunggu',
  awaiting_payment: 'Menunggu pembayaran',
  paid: 'Lunas',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
  failed: 'Gagal',
};

function showAlert(message) {
  elements.alert.textContent = message;
  elements.alert.classList.remove('d-none');
}

function hideAlert() {
  elements.alert.classList.add('d-none');
}

function formatPrice(amount) {
  return new Intl.NumberFormat('id-ID').format(Number(amount));
}

async function ensureSession() {
  const ok = await api.initSession();
  if (!ok) {
    const next = encodeURIComponent(`/checkout?package=${encodeURIComponent(packageId || '')}`);
    window.location.href = `/login?next=${next}`;
    return false;
  }
  return true;
}

function idempotencyKeyFor(pkgId) {
  const storageKey = `${IDEMPOTENCY_PREFIX}${pkgId}`;
  let value = sessionStorage.getItem(storageKey);
  if (!value) {
    value = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(storageKey, value);
  }
  return value;
}

function renderPackage(pkg) {
  document.getElementById('co-package-name').textContent = pkg.name;
  document.getElementById('co-package-desc').textContent = pkg.description || '';
  document.getElementById('co-package-price').textContent = `Rp ${formatPrice(pkg.priceAmount)} / undangan`;
  document.getElementById('co-package-features').innerHTML = (pkg.features || [])
    .map((feature) => `<li>${escapeHtml(feature)}</li>`)
    .join('');
}

async function loadInvitations() {
  try {
    const invitations = await api.listInvitations();
    elements.invitation.innerHTML = invitations
      .map((inv) => `<option value="${inv.id}">${escapeHtml(inv.title)} (/${escapeHtml(inv.slug)})</option>`)
      .join('');
  } catch {
    // Undangan opsional — biarkan daftar kosong bila gagal.
  }
}

function renderOrderResult(order, payment) {
  const statusLabel = STATUS_LABEL[order.status] || order.status;
  const badgeClass = order.status === 'paid' ? 'badge-success' : 'badge-warning';
  let body = `
    <div class="checkout-result-box">
      <p class="checkout-line"><strong>Nomor Order:</strong> ${escapeHtml(order.orderNumber)}</p>
      <p class="checkout-line"><strong>Paket:</strong> ${escapeHtml(order.package?.name || '')}</p>
      <p class="checkout-line"><strong>Total:</strong> Rp ${formatPrice(order.amount)}</p>
      <p class="checkout-line"><strong>Status:</strong> <span class="badge ${badgeClass} badge-sm">${escapeHtml(statusLabel)}</span></p>
    </div>`;

  if (order.status === 'paid') {
    body += '<p class="checkout-note">Order berhasil — paket sudah aktif untuk undangan Anda.</p>';
  } else if (payment) {
    body += `
      <p class="checkout-note">
        Pembayaran menunggu verifikasi. Referensi pembayaran:
        <strong>${escapeHtml(payment.paymentReference || '—')}</strong>.
        Mode pengembangan — pembayaran diverifikasi manual oleh admin.
        <em>(PAYMENT PROVIDER DECISION REQUIRED)</em>
      </p>`;
  }
  return body;
}

elements.submit.addEventListener('click', async () => {
  hideAlert();
  elements.submit.disabled = true;
  try {
    const invitationId = elements.invitation.value || undefined;
    const idempotencyKey = idempotencyKeyFor(packageId);
    const { order, created } = await api.createOrder({ packageId, invitationId, idempotencyKey });

    let payment = null;
    if (order.status === 'pending' || order.status === 'awaiting_payment') {
      const result = await api.createOrderPayment(order.id);
      payment = result.payment;
    }

    elements.summary.classList.add('d-none');
    elements.result.classList.remove('d-none');
    document.getElementById('co-result-body').innerHTML = renderOrderResult(order, payment);
    elements.subtitle.textContent = created
      ? 'Order berhasil dibuat.'
      : 'Order sudah ada (permintaan duplikat dicegah).';
  } catch (error) {
    showAlert(error.message || 'Gagal membuat order.');
    elements.submit.disabled = false;
  }
});

async function init() {
  if (!packageId) {
    showAlert('Paket tidak dipilih. Silakan pilih paket terlebih dahulu.');
    return;
  }
  const ok = await ensureSession();
  if (!ok) return;

  let pkg;
  try {
    pkg = await api.getPackage(packageId);
  } catch (error) {
    showAlert(error.message || 'Paket tidak ditemukan.');
    return;
  }

  renderPackage(pkg);
  await loadInvitations();
  elements.summary.classList.remove('d-none');
}

init();
