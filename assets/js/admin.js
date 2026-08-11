/* ==========================================================
    BERNADA.ID ADMIN PAGE
    ----------------------------------------------------------
    Sprint 5 — Admin Dashboard
    Tanggung jawab:
    - Guard akses: hanya role 'admin' (via me()) yang boleh masuk
    - Menampilkan kartu statistik platform (read-only)
    - Tabel daftar pengguna dengan pencarian, filter role, pagination
  ========================================================== */

import { api } from './api.js';
import { escapeHtml, formatDate } from './util.js';

const elements = {
  userName: document.getElementById('app-user-name'),
  logoutBtn: document.getElementById('logout-btn'),
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
  search: document.getElementById('user-search'),
  role: document.getElementById('user-role'),
  tbody: document.getElementById('users-tbody'),
  empty: document.getElementById('users-empty'),
  prevBtn: document.getElementById('prev-page'),
  nextBtn: document.getElementById('next-page'),
  pageInfo: document.getElementById('page-info'),
};

const state = {
  search: '',
  role: '',
  page: 1,
  pageSize: 20,
  total: 0,
};

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

function roleBadge(role) {
  return role === 'admin'
    ? '<span class="badge badge-primary badge-sm">Admin</span>'
    : '<span class="badge badge-neutral badge-sm">Pengguna</span>';
}

function renderUsers(users) {
  elements.tbody.innerHTML = users
    .map(
      (user) => `
        <tr>
          <td>${escapeHtml(user.fullName || '—')}</td>
          <td>${escapeHtml(user.email)}</td>
          <td>${roleBadge(user.role)}</td>
          <td>${formatDate(user.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
        </tr>`,
    )
    .join('');

  const totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
  elements.empty.classList.toggle('d-none', users.length > 0);
  elements.prevBtn.disabled = state.page <= 1;
  elements.nextBtn.disabled = state.page >= totalPages;
  elements.pageInfo.textContent = `Halaman ${state.page} dari ${totalPages} · ${state.total} pengguna`;
}

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
}

async function loadStats() {
  const stats = await api.getAdminStats();
  renderStats(stats);
}

async function loadUsers() {
  const data = await api.listAdminUsers({
    search: state.search,
    role: state.role,
    page: state.page,
    pageSize: state.pageSize,
  });
  state.total = data.total;
  renderUsers(data.users);
}

function wireEvents() {
  let debounceTimer = null;
  elements.search.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.search = elements.search.value.trim();
      state.page = 1;
      loadUsers().catch((error) => showToast(error.message));
    }, 300);
  });

  elements.role.addEventListener('change', () => {
    state.role = elements.role.value;
    state.page = 1;
    loadUsers().catch((error) => showToast(error.message));
  });

  elements.prevBtn.addEventListener('click', () => {
    if (state.page > 1) {
      state.page -= 1;
      loadUsers().catch((error) => showToast(error.message));
    }
  });

  elements.nextBtn.addEventListener('click', () => {
    state.page += 1;
    loadUsers().catch((error) => showToast(error.message));
  });

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

  elements.userName.textContent = user.fullName || user.email;
  wireEvents();

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
