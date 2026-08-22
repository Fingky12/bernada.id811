/* ==========================================================
    BERNADA.ID ADMIN PAGE
    ----------------------------------------------------------
    Sprint 5 — Admin Dashboard
    Tanggung jawab:
    - Guard akses: hanya role 'admin' (via me()) yang boleh masuk
    - Tab: Ringkasan (statistik + pengguna + kelola role + detail user),
      Undangan (moderasi: search/filter/status + tarik terbit), dan
      Buku Tamu (moderasi: search + hapus entri)
    - Semua render memakai escapeHtml (anti-XSS)
  ========================================================== */

import { api } from './api.js';
import { escapeHtml, formatDate, formatGuestbookDate, initDashShell } from './util.js';

const elements = {
  userName: document.getElementById('app-user-name'),
  logoutBtn: document.getElementById('logout-btn'),
  tabs: {
    summary: document.getElementById('tab-summary'),
    payments: document.getElementById('tab-payments'),
    invitations: document.getElementById('tab-invitations'),
    guestbook: document.getElementById('tab-guestbook'),
  },
  panels: {
    summary: document.getElementById('panel-summary'),
    payments: document.getElementById('panel-payments'),
    invitations: document.getElementById('panel-invitations'),
    guestbook: document.getElementById('panel-guestbook'),
  },
  stats: {
    users: document.getElementById('stat-users'),
    admins: document.getElementById('stat-admins'),
    invitations: document.getElementById('stat-invitations'),
    published: document.getElementById('stat-published'),
    guestbook: document.getElementById('stat-guestbook'),
    guests: document.getElementById('stat-guests'),
    giftAccounts: document.getElementById('stat-gift-accounts'),
    giftActive: document.getElementById('stat-gift-active'),
  },
  users: {
    search: document.getElementById('user-search'),
    role: document.getElementById('user-role'),
    tbody: document.getElementById('users-tbody'),
    empty: document.getElementById('users-empty'),
    prev: document.getElementById('prev-page'),
    next: document.getElementById('next-page'),
    info: document.getElementById('page-info'),
    detail: document.getElementById('user-detail'),
  },
  invitations: {
    search: document.getElementById('inv-search'),
    status: document.getElementById('inv-status'),
    tbody: document.getElementById('invitations-tbody'),
    empty: document.getElementById('invitations-empty'),
    prev: document.getElementById('inv-prev-page'),
    next: document.getElementById('inv-next-page'),
    info: document.getElementById('inv-page-info'),
  },
  guestbook: {
    search: document.getElementById('gb-search'),
    tbody: document.getElementById('guestbook-tbody'),
    empty: document.getElementById('guestbook-empty'),
    prev: document.getElementById('gb-prev-page'),
    next: document.getElementById('gb-next-page'),
    info: document.getElementById('gb-page-info'),
  },
  payments: {
    search: document.getElementById('pay-search'),
    status: document.getElementById('pay-status'),
    tbody: document.getElementById('payments-tbody'),
    empty: document.getElementById('payments-empty'),
    prev: document.getElementById('pay-prev-page'),
    next: document.getElementById('pay-next-page'),
    info: document.getElementById('pay-page-info'),
  },
  pendingPaymentsCard: document.getElementById('stat-pending-payments-card'),
  pendingPayments: document.getElementById('stat-pending-payments'),
  paymentDetailModal: document.getElementById('payment-detail-modal'),
  paymentDetailBody: document.getElementById('payment-detail-body'),
  closePaymentDetail: document.getElementById('close-payment-detail'),
  verifyConfirmModal: document.getElementById('verify-confirm-modal'),
  verifyConfirmBody: document.getElementById('verify-confirm-body'),
  verifyConfirmBtn: document.getElementById('verify-confirm-btn'),
  verifyCancel: document.getElementById('verify-cancel'),
  closeVerifyConfirm: document.getElementById('close-verify-confirm'),
};

const state = {
  currentUser: null,
  users: { search: '', role: '', page: 1, pageSize: 20, total: 0 },
  invitations: { search: '', status: '', page: 1, pageSize: 20, total: 0 },
  guestbook: { search: '', page: 1, pageSize: 20, total: 0 },
  payments: { search: '', status: '', page: 1, pageSize: 20, total: 0 },
  pendingVerifyId: null,
};

const TAB_KEYS = ['summary', 'payments', 'invitations', 'guestbook'];

const toast = document.getElementById('toast');
let toastTimer = null;

function showToast(message, type = 'danger') {
  toast.textContent = message;
  toast.className = `toast is-visible${type ? ` toast-${type}` : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}

function debounce(fn, delay = 300) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function roleBadge(role) {
  return role === 'admin'
    ? '<span class="badge badge-primary badge-sm">Admin</span>'
    : '<span class="badge badge-neutral badge-sm">Pengguna</span>';
}

function statusBadge(isPublished) {
  return isPublished
    ? '<span class="badge badge-success badge-sm">Terbit</span>'
    : '<span class="badge badge-warning badge-sm">Draft</span>';
}

function attendanceBadge(attendance) {
  return attendance === 'hadir'
    ? '<span class="badge badge-success badge-sm">Hadir</span>'
    : '<span class="badge badge-danger badge-sm">Tidak Hadir</span>';
}

function paymentStatusBadge(status) {
  const map = {
    pending: 'badge-warning',
    succeeded: 'badge-success',
    failed: 'badge-danger',
    expired: 'badge-neutral',
  };
  const label = { pending: 'Menunggu', succeeded: 'Selesai', failed: 'Gagal', expired: 'Kedaluwarsa' };
  return `<span class="badge ${map[status] || 'badge-neutral'} badge-sm">${label[status] || status}</span>`;
}

function updatePagination({ current, total, pageSize }, elements) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  elements.prev.disabled = current <= 1;
  elements.next.disabled = current >= totalPages;
  elements.info.textContent = `Halaman ${current} dari ${totalPages} · ${total} item`;
}

/* ==========================================================
    Ringkasan — statistik
  ========================================================== */

function renderStats(stats) {
  const set = (el, value) => {
    if (el) el.textContent = value;
  };
  set(elements.stats.users, stats.users);
  set(elements.stats.admins, stats.admins);
  set(elements.stats.invitations, stats.invitations);
  set(elements.stats.published, stats.invitationsPublished);
  set(elements.stats.guestbook, stats.guestbookEntries);
  set(elements.stats.guests, stats.guests);
  set(elements.stats.giftAccounts, stats.giftAccounts);
  set(elements.stats.giftActive, `(${stats.giftAccountsActive} aktif)`);
  set(elements.pendingPayments, stats.pendingPayments ?? 0);
}

async function loadStats() {
  const stats = await api.getAdminStats();
  renderStats(stats);
}

/* ==========================================================
    Ringkasan — daftar pengguna + kelola role + detail
  ========================================================== */

function roleActionCell(user) {
  if (user.id === state.currentUser.id) {
    return '<span class="admin-row-note">Anda</span>';
  }
  if (user.role === 'admin') {
    return '<button type="button" class="btn btn-outline btn-sm" data-action="demote" data-user-id="' + user.id + '">Turunkan</button>';
  }
  return '<button type="button" class="btn btn-primary btn-sm" data-action="promote" data-user-id="' + user.id + '">Jadikan Admin</button>';
}

function renderUsers(users) {
  elements.users.tbody.innerHTML = users
    .map(
      (user) => `
        <tr>
          <td>
            <button type="button" class="admin-link" data-user-id="${user.id}">${escapeHtml(user.fullName || '—')}</button>
          </td>
          <td>${escapeHtml(user.email)}</td>
          <td>${roleBadge(user.role)}</td>
          <td>${formatDate(user.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
          <td class="admin-actions">${roleActionCell(user)}</td>
        </tr>`,
    )
    .join('');

  elements.users.empty.classList.toggle('d-none', users.length > 0);
  updatePagination(state.users, elements.users);
}

async function loadUsers() {
  const data = await api.listAdminUsers({
    search: state.users.search,
    role: state.users.role,
    page: state.users.page,
    pageSize: state.users.pageSize,
  });
  state.users.total = data.total;
  renderUsers(data.users);
}

function hideUserDetail() {
  elements.users.detail.classList.add('d-none');
  elements.users.detail.innerHTML = '';
}

function renderUserDetail(detail) {
  const { user, counts } = detail;
  const registered = formatDate(user.createdAt, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  elements.users.detail.classList.remove('d-none');
  elements.users.detail.innerHTML = `
    <div class="admin-detail-head">
      <div>
        <strong class="admin-detail-name">${escapeHtml(user.fullName || '—')}</strong>
        <p class="admin-detail-sub">${escapeHtml(user.email)} · terdaftar ${escapeHtml(registered)}</p>
      </div>
      <div class="admin-detail-actions">
        ${roleBadge(user.role)}
        <button type="button" class="btn btn-ghost btn-sm" id="close-user-detail" aria-label="Tutup detail pengguna">Tutup</button>
      </div>
    </div>
    <div class="admin-detail-stats">
      <div class="admin-detail-stat"><strong>${counts.invitations}</strong><span>Undangan</span></div>
      <div class="admin-detail-stat"><strong>${counts.invitationsPublished}</strong><span>Terbit</span></div>
      <div class="admin-detail-stat"><strong>${counts.guests}</strong><span>Tamu</span></div>
      <div class="admin-detail-stat"><strong>${counts.giftAccounts}</strong><span>Rekening</span></div>
      <div class="admin-detail-stat"><strong>${counts.guestbookEntries}</strong><span>Buku Tamu</span></div>
    </div>
  `;
  const closeBtn = elements.users.detail.querySelector('#close-user-detail');
  if (closeBtn) closeBtn.addEventListener('click', hideUserDetail);
}

async function loadUserDetail(userId) {
  const detail = await api.getAdminUser(userId);
  renderUserDetail(detail);
}

async function changeRole(userId, role) {
  const label = role === 'admin' ? 'Jadikan admin' : 'Turunkan peran';
  if (!window.confirm(`${label} untuk pengguna ini?`)) return;
  try {
    await api.setUserRole(userId, role);
    showToast('Peran pengguna diperbarui.', 'success');
    hideUserDetail();
    await Promise.all([loadStats(), loadUsers()]);
  } catch (error) {
    showToast(error.message);
  }
}

/* ==========================================================
    Undangan — moderasi
  ========================================================== */

function renderInvitations(invitations) {
  elements.invitations.tbody.innerHTML = invitations
    .map(
      (inv) => `
        <tr>
          <td>
            <span class="admin-title">${escapeHtml(inv.title)}</span>
            <span class="admin-subtext">${escapeHtml(inv.slug)}</span>
          </td>
          <td>
            <span class="admin-title">${escapeHtml(inv.owner.fullName || inv.owner.email || '—')}</span>
            <span class="admin-subtext">${escapeHtml(inv.owner.email || '')}</span>
          </td>
          <td>${escapeHtml(inv.templateName || '—')}</td>
          <td>${statusBadge(inv.isPublished)}</td>
          <td>${formatDate(inv.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
          <td class="admin-actions">
            ${inv.isPublished
              ? `<button type="button" class="btn btn-danger btn-sm" data-action="unpublish" data-inv-id="${inv.id}">Tarik</button>`
              : '<span class="admin-row-note">Draft</span>'}
          </td>
        </tr>`,
    )
    .join('');

  elements.invitations.empty.classList.toggle('d-none', invitations.length > 0);
  updatePagination(state.invitations, elements.invitations);
}

async function loadInvitations() {
  const data = await api.listAdminInvitations({
    search: state.invitations.search,
    status: state.invitations.status,
    page: state.invitations.page,
    pageSize: state.invitations.pageSize,
  });
  state.invitations.total = data.total;
  renderInvitations(data.invitations);
}

async function unpublishInvitation(invId) {
  if (!window.confirm('Tarik undangan ini? Halaman publiknya akan segera nonaktif.')) return;
  try {
    await api.adminUnpublishInvitation(invId);
    showToast('Undangan ditarik dari publik.', 'success');
    await Promise.all([loadStats(), loadInvitations()]);
  } catch (error) {
    showToast(error.message);
  }
}

/* ==========================================================
    Buku Tamu — moderasi
  ========================================================== */

function renderGuestbook(entries) {
  elements.guestbook.tbody.innerHTML = entries
    .map(
      (entry) => `
        <tr>
          <td>${escapeHtml(entry.guestName)}</td>
          <td class="admin-message">${escapeHtml(entry.message || '—')}</td>
          <td>${attendanceBadge(entry.attendance)}</td>
          <td>
            <span class="admin-title">${escapeHtml(entry.invitation.title || '—')}</span>
            <span class="admin-subtext">${escapeHtml(entry.invitation.slug || '')}</span>
          </td>
          <td>${formatGuestbookDate(entry.createdAt)}</td>
          <td class="admin-actions">
            <button type="button" class="btn btn-danger btn-sm" data-action="delete-entry" data-entry-id="${entry.id}">Hapus</button>
          </td>
        </tr>`,
    )
    .join('');

  elements.guestbook.empty.classList.toggle('d-none', entries.length > 0);
  updatePagination(state.guestbook, elements.guestbook);
}

async function loadGuestbook() {
  const data = await api.listAdminGuestbook({
    search: state.guestbook.search,
    page: state.guestbook.page,
    pageSize: state.guestbook.pageSize,
  });
  state.guestbook.total = data.total;
  renderGuestbook(data.entries);
}

async function deleteGuestbookEntry(entryId) {
  if (!window.confirm('Hapus entri buku tamu ini?')) return;
  try {
    await api.deleteAdminGuestbookEntry(entryId);
    showToast('Entri buku tamu dihapus.', 'success');
    await Promise.all([loadStats(), loadGuestbook()]);
  } catch (error) {
    showToast(error.message);
  }
}

/* ==========================================================
    Pembayaran — admin moderation
  ========================================================== */

function formatDateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

function renderPayments(payments) {
  elements.payments.tbody.innerHTML = payments
    .map(
      (p) => `
        <tr>
          <td>
            <span class="admin-title">${escapeHtml(p.order?.orderNumber || '—')}</span>
            <span class="admin-subtext">${escapeHtml(p.order?.status || '')}</span>
          </td>
          <td>${escapeHtml(p.ownerEmail || '—')}</td>
          <td>${escapeHtml(p.order?.package?.name || '—')}</td>
          <td>
            <span class="admin-title">${escapeHtml(p.paymentReference || '—')}</span>
            <span class="admin-subtext">${escapeHtml(p.provider || '')}</span>
          </td>
          <td>${paymentStatusBadge(p.status)}</td>
          <td>${formatDateShort(p.createdAt)}</td>
          <td class="admin-actions">
            <button type="button" class="btn btn-ghost btn-sm admin-link" data-action="detail-payment" data-payment-id="${p.id}">Detail</button>
            ${p.status === 'pending'
              ? `<button type="button" class="btn btn-primary btn-sm" data-action="verify-payment" data-payment-id="${p.id}" data-payment-ref="${escapeHtml(p.paymentReference || '')}">Verifikasi</button>`
              : ''}
          </td>
        </tr>`,
    )
    .join('');

  elements.payments.empty.classList.toggle('d-none', payments.length > 0);
  updatePagination(state.payments, elements.payments);
}

async function loadPayments() {
  const data = await api.listAdminPayments({
    search: state.payments.search,
    status: state.payments.status,
    page: state.payments.page,
    pageSize: state.payments.pageSize,
  });
  state.payments.total = data.total;
  state.payments.list = data.payments;
  renderPayments(data.payments);
}

function openPaymentDetail(payment) {
  const body = elements.paymentDetailBody;
  body.innerHTML = `
    <div class="payment-detail-section">
      <div class="payment-detail-section-title">Informasi Pembayaran</div>
      <div class="payment-detail-row"><span class="payment-detail-label">ID Pembayaran</span><span class="payment-detail-value">${escapeHtml(String(payment.id))}</span></div>
      <div class="payment-detail-row"><span class="payment-detail-label">Referensi</span><span class="payment-detail-value">${escapeHtml(payment.paymentReference || '—')}</span></div>
      <div class="payment-detail-row"><span class="payment-detail-label">Provider</span><span class="payment-detail-value">${escapeHtml(payment.provider || '—')}</span></div>
      <div class="payment-detail-row"><span class="payment-detail-label">Status</span><span class="payment-detail-value">${paymentStatusBadge(payment.status)}</span></div>
      <div class="payment-detail-row"><span class="payment-detail-label">Jumlah</span><span class="payment-detail-value">${formatCurrency(payment.amount)}</span></div>
      <div class="payment-detail-row"><span class="payment-detail-label">Mata Uang</span><span class="payment-detail-value">${escapeHtml(payment.currency || 'IDR')}</span></div>
      <div class="payment-detail-row"><span class="payment-detail-label">Dibuat</span><span class="payment-detail-value">${formatDateShort(payment.createdAt)}</span></div>
      ${payment.paidAt ? `<div class="payment-detail-row"><span class="payment-detail-label">Dibayar</span><span class="payment-detail-value">${formatDateShort(payment.paidAt)}</span></div>` : ''}
    </div>
    <div class="payment-detail-section">
      <div class="payment-detail-section-title">Informasi Order</div>
      <div class="payment-detail-row"><span class="payment-detail-label">Order</span><span class="payment-detail-value">${escapeHtml(payment.order?.orderNumber || '—')}</span></div>
      <div class="payment-detail-row"><span class="payment-detail-label">Status Order</span><span class="payment-detail-value">${escapeHtml(payment.order?.status || '—')}</span></div>
      <div class="payment-detail-row"><span class="payment-detail-label">Paket</span><span class="payment-detail-value">${escapeHtml(payment.order?.package?.name || '—')}</span></div>
      <div class="payment-detail-row"><span class="payment-detail-label">Pelanggan</span><span class="payment-detail-value">${escapeHtml(payment.ownerEmail || '—')}</span></div>
    </div>
    ${payment.metadata && Object.keys(payment.metadata).length > 0 ? `
    <div class="payment-detail-section">
      <div class="payment-detail-section-title">Metadata</div>
      <pre style="margin:0;padding:var(--spacing-sm);background:var(--color-gray-50);border-radius:var(--border-radius-sm);font-size:var(--font-size-xs);overflow-x:auto;white-space:pre-wrap">${escapeHtml(JSON.stringify(payment.metadata, null, 2))}</pre>
    </div>` : ''}
  `;
  elements.paymentDetailModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closePaymentDetailModal() {
  elements.paymentDetailModal.hidden = true;
  document.body.style.overflow = '';
}

function openVerifyConfirm(paymentId, ref) {
  state.pendingVerifyId = paymentId;
  elements.verifyConfirmBody.innerHTML = `
    <p>Anda akan memverifikasi pembayaran ini:</p>
    <p style="margin-top:var(--spacing-sm)"><strong>${escapeHtml(ref || '—')}</strong></p>
    <p style="margin-top:var(--spacing-sm);color:var(--color-gray-600);font-size:var(--font-size-sm)">
      Pembayaran akan ditandai berhasil dan order akan diaktifkan.
    </p>
  `;
  elements.verifyConfirmModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeVerifyConfirmModal() {
  elements.verifyConfirmModal.hidden = true;
  elements.verifyConfirmBtn.disabled = false;
  state.pendingVerifyId = null;
  document.body.style.overflow = '';
}

async function confirmVerifyPayment() {
  const id = state.pendingVerifyId;
  if (!id) return;
  elements.verifyConfirmBtn.disabled = true;
  try {
    await api.verifyAdminPayment(id);
    showToast('Pembayaran berhasil diverifikasi.', 'success');
    closeVerifyConfirmModal();
    await Promise.all([loadStats(), loadPayments()]);
  } catch (error) {
    showToast(error.message);
    elements.verifyConfirmBtn.disabled = false;
  }
}

/* ==========================================================
    Tab & event binding
  ========================================================== */

function showTab(which) {
  for (const key of TAB_KEYS) {
    const active = key === which;
    elements.tabs[key].classList.toggle('is-active', active);
    elements.tabs[key].setAttribute('aria-selected', String(active));
    elements.panels[key].classList.toggle('d-none', !active);
  }
  if (which === 'payments') {
    loadPayments().catch((error) => showToast(error.message));
  } else if (which === 'invitations') {
    loadInvitations().catch((error) => showToast(error.message));
  } else if (which === 'guestbook') {
    loadGuestbook().catch((error) => showToast(error.message));
  }
}

function wireEvents() {
  elements.tabs.summary.addEventListener('click', () => showTab('summary'));
  elements.tabs.payments.addEventListener('click', () => showTab('payments'));
  elements.tabs.invitations.addEventListener('click', () => showTab('invitations'));
  elements.tabs.guestbook.addEventListener('click', () => showTab('guestbook'));

  const searchUsers = debounce(() => {
    state.users.search = elements.users.search.value.trim();
    state.users.page = 1;
    loadUsers().catch((error) => showToast(error.message));
  });
  elements.users.search.addEventListener('input', searchUsers);

  elements.users.role.addEventListener('change', () => {
    state.users.role = elements.users.role.value;
    state.users.page = 1;
    loadUsers().catch((error) => showToast(error.message));
  });

  elements.users.prev.addEventListener('click', () => {
    if (state.users.page > 1) {
      state.users.page -= 1;
      loadUsers().catch((error) => showToast(error.message));
    }
  });

  elements.users.next.addEventListener('click', () => {
    state.users.page += 1;
    loadUsers().catch((error) => showToast(error.message));
  });

  elements.users.tbody.addEventListener('click', (event) => {
    const link = event.target.closest('.admin-link');
    if (link) {
      loadUserDetail(link.dataset.userId).catch((error) => showToast(error.message));
      return;
    }
    const roleBtn = event.target.closest('[data-action="promote"], [data-action="demote"]');
    if (roleBtn) {
      changeRole(roleBtn.dataset.userId, roleBtn.dataset.action === 'promote' ? 'admin' : 'user');
    }
  });

  const searchInvitations = debounce(() => {
    state.invitations.search = elements.invitations.search.value.trim();
    state.invitations.page = 1;
    loadInvitations().catch((error) => showToast(error.message));
  });
  elements.invitations.search.addEventListener('input', searchInvitations);

  elements.invitations.status.addEventListener('change', () => {
    state.invitations.status = elements.invitations.status.value;
    state.invitations.page = 1;
    loadInvitations().catch((error) => showToast(error.message));
  });

  elements.invitations.prev.addEventListener('click', () => {
    if (state.invitations.page > 1) {
      state.invitations.page -= 1;
      loadInvitations().catch((error) => showToast(error.message));
    }
  });

  elements.invitations.next.addEventListener('click', () => {
    state.invitations.page += 1;
    loadInvitations().catch((error) => showToast(error.message));
  });

  elements.invitations.tbody.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="unpublish"]');
    if (button) {
      unpublishInvitation(button.dataset.invId);
    }
  });

  const searchGuestbook = debounce(() => {
    state.guestbook.search = elements.guestbook.search.value.trim();
    state.guestbook.page = 1;
    loadGuestbook().catch((error) => showToast(error.message));
  });
  elements.guestbook.search.addEventListener('input', searchGuestbook);

  elements.guestbook.prev.addEventListener('click', () => {
    if (state.guestbook.page > 1) {
      state.guestbook.page -= 1;
      loadGuestbook().catch((error) => showToast(error.message));
    }
  });

  elements.guestbook.next.addEventListener('click', () => {
    state.guestbook.page += 1;
    loadGuestbook().catch((error) => showToast(error.message));
  });

  elements.guestbook.tbody.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="delete-entry"]');
    if (button) {
      deleteGuestbookEntry(button.dataset.entryId);
    }
  });

  const searchPayments = debounce(() => {
    state.payments.search = elements.payments.search.value.trim();
    state.payments.page = 1;
    loadPayments().catch((error) => showToast(error.message));
  });
  elements.payments.search.addEventListener('input', searchPayments);

  elements.payments.status.addEventListener('change', () => {
    state.payments.status = elements.payments.status.value;
    state.payments.page = 1;
    loadPayments().catch((error) => showToast(error.message));
  });

  elements.payments.prev.addEventListener('click', () => {
    if (state.payments.page > 1) {
      state.payments.page -= 1;
      loadPayments().catch((error) => showToast(error.message));
    }
  });

  elements.payments.next.addEventListener('click', () => {
    state.payments.page += 1;
    loadPayments().catch((error) => showToast(error.message));
  });

  elements.payments.tbody.addEventListener('click', (event) => {
    const detailBtn = event.target.closest('[data-action="detail-payment"]');
    if (detailBtn) {
      const paymentId = detailBtn.dataset.paymentId;
      const payment = (state.payments.list || []).find((p) => String(p.id) === paymentId);
      if (payment) openPaymentDetail(payment);
      return;
    }
    const verifyBtn = event.target.closest('[data-action="verify-payment"]');
    if (verifyBtn) {
      openVerifyConfirm(verifyBtn.dataset.paymentId, verifyBtn.dataset.paymentRef);
    }
  });

  elements.closePaymentDetail.addEventListener('click', closePaymentDetailModal);
  elements.paymentDetailModal.addEventListener('click', (e) => {
    if (e.target === elements.paymentDetailModal) closePaymentDetailModal();
  });

  elements.closeVerifyConfirm.addEventListener('click', closeVerifyConfirmModal);
  elements.verifyCancel.addEventListener('click', closeVerifyConfirmModal);
  elements.verifyConfirmModal.addEventListener('click', (e) => {
    if (e.target === elements.verifyConfirmModal) closeVerifyConfirmModal();
  });
  elements.verifyConfirmBtn.addEventListener('click', confirmVerifyPayment);

  if (elements.pendingPaymentsCard) {
    elements.pendingPaymentsCard.addEventListener('click', () => {
      state.payments.status = 'pending';
      elements.payments.status.value = 'pending';
      state.payments.page = 1;
      showTab('payments');
    });
    elements.pendingPaymentsCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        elements.pendingPaymentsCard.click();
      }
    });
  }

  elements.logoutBtn.addEventListener('click', async () => {
    await api.logout();
    window.location.href = '/login';
  });
}

async function init() {
  if (!(await api.initSession())) {
    window.location.href = '/login';
    return;
  }

  let user;
  try {
    user = await api.me();
  } catch {
    window.location.href = '/login';
    return;
  }

  if (user.role !== 'admin') {
    window.location.href = '/builder';
    return;
  }

  state.currentUser = user;
  elements.userName.textContent = user.fullName || user.email;
  const welcome = document.getElementById('dash-welcome');
  if (welcome) welcome.textContent = `Selamat datang, ${user.fullName || user.email}`;
  const avatar = document.getElementById('dash-avatar');
  if (avatar) avatar.textContent = (user.fullName || user.email || 'A').trim().charAt(0).toUpperCase();
  wireEvents();
  initDashShell();

  try {
    await Promise.all([loadStats(), loadUsers()]);
  } catch (error) {
    if (error.status === 403) {
      window.location.href = '/builder';
      return;
    }
    showToast(error.message);
  }
}

init();
