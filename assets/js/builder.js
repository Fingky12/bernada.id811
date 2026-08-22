/* ==========================================================
    BERNADA.ID BUILDER PAGE
    ----------------------------------------------------------
    Sprint 3 — The Core Features
    Tanggung jawab:
    - Cek sesi (redirect ke login bila belum masuk)
    - Daftar undangan milik pengguna (list view)
    - Editor undangan: buat/edit, pilih template, tema, pratinjau
    - Aksi: simpan, publikasi/nonaktif, hapus, buka link
  ========================================================== */

import { api } from './api.js';
import { escapeHtml, formatDate as formatEventDate, initDashShell } from './util.js';

const elements = {
  userName: document.getElementById('app-user-name'),
  logoutBtn: document.getElementById('logout-btn'),
  adminLink: document.getElementById('admin-link'),
  listView: document.getElementById('list-view'),
  editorView: document.getElementById('editor-view'),
  manageView: document.getElementById('manage-view'),
  ordersView: document.getElementById('orders-view'),
  ordersTableWrap: document.getElementById('orders-table-wrap'),
  ordersTbody: document.getElementById('orders-tbody'),
  ordersEmpty: document.getElementById('orders-empty'),
  grid: document.getElementById('invitation-grid'),
  emptyState: document.getElementById('empty-state'),
  createBtn: document.getElementById('create-btn'),
  emptyCreateBtn: document.getElementById('empty-create-btn'),
  backBtn: document.getElementById('back-btn'),
  cancelBtn: document.getElementById('cancel-btn'),
  editorTitle: document.getElementById('editor-title'),
  form: document.getElementById('invitation-form'),
  templateGrid: document.getElementById('template-grid'),
  saveBtn: document.getElementById('save-btn'),
  toast: document.getElementById('toast'),
  manage: {
    backBtn: document.getElementById('manage-back-btn'),
    title: document.getElementById('manage-title'),
    stats: {
      total: document.getElementById('stat-total'),
      hadir: document.getElementById('stat-hadir'),
      tidakHadir: document.getElementById('stat-tidak-hadir'),
      diundang: document.getElementById('stat-diundang'),
    },
    fullName: document.getElementById('g-full-name'),
    phone: document.getElementById('g-phone'),
    group: document.getElementById('g-group'),
    bulk: document.getElementById('g-bulk'),
    addBtn: document.getElementById('g-add-btn'),
    filter: document.getElementById('g-filter'),
    list: document.getElementById('guest-list'),
    bank: document.getElementById('ga-bank'),
    number: document.getElementById('ga-number'),
    name: document.getElementById('ga-name'),
    addGiftBtn: document.getElementById('ga-add-btn'),
    giftList: document.getElementById('gift-account-list'),
  },
  preview: {
    couple: document.getElementById('preview-couple'),
    date: document.getElementById('preview-date'),
    message: document.getElementById('preview-message'),
    venue: document.getElementById('preview-venue'),
    location: document.getElementById('preview-location'),
    window: document.querySelector('.preview-window'),
  },
};

const DEFAULT_THEME = { primaryColor: '#A12828', accentColor: '#FFC400' };

let currentInvitationId = null;
let templates = [];
let autoSlug = '';
let currentManageInvitation = null;
let guestsCache = [];
let giftAccountsCache = [];
let currentGuestFilter = 'semua';

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function toDateInputValue(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function displayEventDate(iso) {
  return formatEventDate(iso) || 'Tanggal acara';
}

function showToast(message, type = '') {
  elements.toast.textContent = message;
  elements.toast.className = `toast is-visible${type ? ` toast-${type}` : ''}`;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    elements.toast.className = 'toast';
  }, 3000);
}

function setLoading(button, loading) {
  if (!button) return;
  button.disabled = loading;
  button.classList.toggle('btn-loading', loading);
}

/* ==========================================================
    PRATINJAU LIVE
  ========================================================== */

function updatePreview() {
  const theme = getTheme();
  elements.preview.window.style.setProperty('--preview-primary', theme.primaryColor);
  elements.preview.window.style.setProperty('--preview-accent', theme.accentColor);

  elements.preview.couple.textContent =
    document.getElementById('f-couple').value.trim() || 'Nama Pasangan';
  const dateText = displayEventDate(
    document.getElementById('f-date').value
      ? `${document.getElementById('f-date').value}T12:00:00`
      : null,
  );
  const timeText = document.getElementById('f-time').value.trim();
  elements.preview.date.textContent = timeText ? `${dateText} · ${timeText}` : dateText;
  elements.preview.message.textContent =
    document.getElementById('f-message').value.trim() ||
    'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara pernikahan kami.';
  elements.preview.venue.textContent =
    document.getElementById('f-venue').value.trim() || 'Tempat Acara';
  elements.preview.location.textContent =
    document.getElementById('f-location').value.trim() || '';
}

function getTheme() {
  return {
    primaryColor:
      document.getElementById('f-theme-primary').value || DEFAULT_THEME.primaryColor,
    accentColor:
      document.getElementById('f-theme-accent').value || DEFAULT_THEME.accentColor,
  };
}

/* ==========================================================
    DAFTAR UNDANGAN
  ========================================================== */

function setSummaryCount(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

function statusBadge(invitation) {
  const status = invitation.status || (invitation.isPublished ? 'published' : 'draft');
  const config = {
    draft: { label: 'Draf', class: 'badge-warning' },
    preview: { label: 'Pratonton', class: 'badge-primary' },
    published: { label: 'Terbit', class: 'badge-success' },
    unpublished: { label: 'Nonaktif', class: 'badge-danger' },
  }[status] || { label: status, class: 'badge-warning' };
  return `<span class="badge ${config.class} badge-sm">${config.label}</span>`;
}

function renderInvitations(invitations) {
  const hasItems = invitations.length > 0;
  elements.emptyState.classList.toggle('d-none', hasItems);

  const counts = { draft: 0, published: 0, unpublished: 0, views: 0 };
  for (const invitation of invitations) {
    const status = invitation.status || (invitation.isPublished ? 'published' : 'draft');
    if (status === 'published') counts.published += 1;
    else if (status === 'draft') counts.draft += 1;
    else counts.unpublished += 1;
    counts.views += invitation.viewCount || 0;
  }
  setSummaryCount('sum-total', invitations.length);
  setSummaryCount('sum-draft', counts.draft);
  setSummaryCount('sum-published', counts.published);
  setSummaryCount('sum-unpublished', counts.unpublished);
  setSummaryCount('sum-views', counts.views);

  elements.grid.innerHTML = invitations
    .map((invitation) => {
      const published = invitation.isPublished;
      const badge = statusBadge(invitation);
      return `
        <article class="invitation-card">
          <div class="invitation-card-top">
            <div>
              <h2 class="invitation-title">${escapeHtml(invitation.title)}</h2>
              <p class="invitation-couple">${escapeHtml(invitation.couple || 'Tanpa nama pasangan')}</p>
            </div>
            ${badge}
          </div>
          <div class="invitation-meta">
            <span class="invitation-meta-item">📅 ${escapeHtml(displayEventDate(invitation.eventDate))}</span>
            ${(invitation.viewCount || 0) > 0 ? `<span class="invitation-meta-item">👁 ${invitation.viewCount} dilihat</span>` : ''}
          </div>
          <p class="invitation-slug">/${escapeHtml(invitation.slug)}</p>
          <div class="invitation-actions">
            <button class="btn btn-outline btn-sm" type="button" data-action="edit" data-id="${invitation.id}">Edit</button>
            <button class="btn btn-ghost btn-sm" type="button" data-action="manage" data-id="${invitation.id}" data-slug="${invitation.slug}">Kelola</button>
            ${published
              ? `<button class="btn btn-ghost btn-sm" type="button" data-action="unpublish" data-id="${invitation.id}">Nonaktifkan</button>`
              : `<button class="btn btn-primary btn-sm" type="button" data-action="publish" data-id="${invitation.id}">Terbitkan</button>`}
            <a class="btn btn-link btn-sm" href="/u/${escapeHtml(invitation.slug)}" target="_blank" rel="noopener">Buka link</a>
            <button class="btn btn-danger btn-sm" type="button" data-action="delete" data-id="${invitation.id}">Hapus</button>
          </div>
        </article>`;
    })
    .join('');
}

async function loadInvitations() {
  const invitations = await api.listInvitations();
  renderInvitations(invitations);
}

/* ==========================================================
    TEMPLATE SELECTION
  ========================================================== */

async function loadTemplates() {
  templates = await api.listTemplates();
  const tierLabel = { basic: 'Basic', premium: 'Premium', exclusive: 'Eksklusif' };
  const tierClass = { basic: 'badge-neutral', premium: 'badge-warning', exclusive: 'badge-primary' };
  elements.templateGrid.innerHTML = templates
    .map((template) => `
      <label class="template-option" data-template-id="${template.id}">
        <input type="radio" name="templateId" value="${template.id}" class="d-none">
        <span class="template-option-check" aria-hidden="true">✓</span>
        <img class="template-option-thumb" src="${escapeHtml(template.previewUrl)}" alt="${escapeHtml(template.name)}" loading="lazy">
        <span class="template-option-name">${escapeHtml(template.name)}</span>
        ${template.tier ? `<span class="badge badge-sm ${tierClass[template.tier] || 'badge-neutral'}">${tierLabel[template.tier] || template.tier}</span>` : ''}
      </label>`)
    .join('');

  elements.templateGrid.addEventListener('change', (event) => {
    if (event.target.matches('input[name="templateId"]')) {
      selectTemplate(event.target.value);
    }
  });
}

function selectTemplate(templateId) {
  elements.templateGrid.querySelectorAll('.template-option').forEach((option) => {
    const isSelected = option.dataset.templateId === templateId;
    option.classList.toggle('is-selected', isSelected);
    if (isSelected) {
      option.querySelector('input').checked = true;
    }
  });
}

/* ==========================================================
    EDITOR
  ========================================================== */

function showList() {
  switchView(elements.listView);
  loadInvitations().catch(showToast);
}

function showEditor(invitation = null) {
  currentInvitationId = invitation?.id || null;
  switchView(elements.editorView);
  elements.editorTitle.textContent = invitation ? 'Edit Undangan' : 'Buat Undangan';
  populateForm(invitation);
  updatePreview();
}

function populateForm(invitation) {
  elements.form.reset();
  document.getElementById('f-title').value = invitation?.title || '';
  document.getElementById('f-slug').value = invitation?.slug || '';
  document.getElementById('f-couple').value = invitation?.couple || '';
  document.getElementById('f-date').value = toDateInputValue(invitation?.eventDate);
  document.getElementById('f-time').value = invitation?.eventTime || '';
  document.getElementById('f-venue').value = invitation?.venue || '';
  document.getElementById('f-location').value = invitation?.location || '';
  document.getElementById('f-message').value = invitation?.message || '';
  document.getElementById('f-music').value = invitation?.musicUrl || '';
  document.getElementById('f-gallery').value = (invitation?.gallery || []).join('\n');

  const theme = { ...DEFAULT_THEME, ...(invitation?.theme || {}) };
  document.getElementById('f-theme-primary').value = theme.primaryColor;
  document.getElementById('f-theme-primary-hex').value = theme.primaryColor;
  document.getElementById('f-theme-accent').value = theme.accentColor;
  document.getElementById('f-theme-accent-hex').value = theme.accentColor;

  populateSections(invitation?.sections);

  selectTemplate(invitation?.templateId || null);
  autoSlug = invitation?.slug || '';
  updateSlugPreview();
}

function buildPayload() {
  const gallery = document
    .getElementById('f-gallery')
    .value.split('\n')
    .map((url) => url.trim())
    .filter(Boolean);
  return {
    title: document.getElementById('f-title').value.trim(),
    slug: document.getElementById('f-slug').value.trim() || autoSlug,
    couple: document.getElementById('f-couple').value.trim(),
    eventDate: document.getElementById('f-date').value
      ? `${document.getElementById('f-date').value}T12:00:00`
      : null,
    eventTime: document.getElementById('f-time').value.trim(),
    venue: document.getElementById('f-venue').value.trim(),
    location: document.getElementById('f-location').value.trim(),
    message: document.getElementById('f-message').value.trim(),
    musicUrl: document.getElementById('f-music').value.trim(),
    gallery,
    sections: collectSections(),
    theme: getTheme(),
    templateId: elements.templateGrid.querySelector('input[name="templateId"]:checked')
      ? elements.templateGrid.querySelector('input[name="templateId"]:checked').value
      : null,
  };
}

const SECTION_TYPES = ['countdown', 'location', 'message', 'gift', 'gallery'];

function collectSections() {
  return SECTION_TYPES.map((type) => ({
    type,
    enabled: document.getElementById(`sec-${type}`).checked,
  }));
}

function populateSections(sections) {
  const disabled = new Set(
    (Array.isArray(sections) ? sections : [])
      .filter((s) => s && s.enabled === false)
      .map((s) => s.type),
  );
  SECTION_TYPES.forEach((type) => {
    const checkbox = document.getElementById(`sec-${type}`);
    if (checkbox) checkbox.checked = !disabled.has(type);
  });
}

function updateSlugPreview() {
  const slug = document.getElementById('f-slug').value.trim() || autoSlug;
  document.getElementById('slug-preview').textContent = `${slug || 'nama-undangan'}`;
}

async function saveInvitation() {
  const payload = buildPayload();
  if (!payload.slug) {
    showToast('Judul diperlukan untuk membuat link undangan.', 'danger');
    return;
  }
  setLoading(elements.saveBtn, true);
  try {
    if (currentInvitationId) {
      await api.updateInvitation(currentInvitationId, payload);
      showToast('Undangan berhasil diperbarui.', 'success');
    } else {
      await api.createInvitation(payload);
      showToast('Undangan berhasil dibuat.', 'success');
    }
    showList();
  } catch (error) {
    showToast(error.message, 'danger');
  } finally {
    setLoading(elements.saveBtn, false);
  }
}

/* ==========================================================
    KELOLA — TAMU & AMPLOP DIGITAL
  ========================================================== */

const VIEWS = () => [elements.listView, elements.editorView, elements.manageView, elements.ordersView];

function switchView(target) {
  VIEWS().forEach((view) => view.classList.add('d-none'));
  target.classList.remove('d-none');
  document.querySelectorAll('.dash-nav-item[data-nav]').forEach((item) => {
    item.classList.toggle(
      'is-active',
      item.dataset.nav === (target === elements.ordersView ? 'orders' : 'list'),
    );
  });
}

/* ==========================================================
    PESANAN
  ========================================================== */

const ORDER_STATUS_LABELS = {
  pending: { label: 'Menunggu Pembayaran', cls: 'badge-warning' },
  awaiting_payment: { label: 'Menunggu Pembayaran', cls: 'badge-warning' },
  paid: { label: 'Dibayar', cls: 'badge-success' },
  succeeded: { label: 'Selesai', cls: 'badge-success' },
  cancelled: { label: 'Dibatalkan', cls: 'badge-danger' },
  expired: { label: 'Kedaluwarsa', cls: 'badge-danger' },
  failed: { label: 'Gagal', cls: 'badge-danger' },
};

function formatRupiah(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;
}

async function showOrders() {
  switchView(elements.ordersView);
  try {
    const orders = await api.listOrders();
    const hasItems = orders.length > 0;
    elements.ordersTableWrap.classList.toggle('d-none', !hasItems);
    elements.ordersEmpty.classList.toggle('d-none', hasItems);
    elements.ordersTbody.innerHTML = orders
      .map((order) => {
        const statusConfig = ORDER_STATUS_LABELS[order.status] || { label: order.status, cls: 'badge-warning' };
        return `
          <tr>
            <td>${escapeHtml(order.orderNumber)}</td>
            <td>${escapeHtml(order.package?.name || '—')}</td>
            <td>${formatRupiah(order.amount)}</td>
            <td><span class="badge badge-sm ${statusConfig.cls}">${statusConfig.label}</span></td>
            <td>${escapeHtml(formatEventDate(order.createdAt) || '-')}</td>
          </tr>`;
      })
      .join('');
  } catch (error) {
    showToast(error.message, 'danger');
  }
}

function showManage(invitation) {
  currentManageInvitation = invitation;
  switchView(elements.manageView);
  elements.manage.title.textContent = `Kelola — ${invitation.title}`;
  loadManageData();
}

async function loadManageData() {
  try {
    await Promise.all([loadGuestStats(), loadGuests(), loadGiftAccounts()]);
  } catch (error) {
    showToast(error.message, 'danger');
  }
}

async function loadGuestStats() {
  const stats = await api.getGuestStats(currentManageInvitation.id);
  elements.manage.stats.total.textContent = stats.total;
  elements.manage.stats.hadir.textContent = stats.hadir;
  elements.manage.stats.tidakHadir.textContent = stats.tidakHadir;
  elements.manage.stats.diundang.textContent = stats.diundang;
}

async function loadGuests() {
  guestsCache = await api.listGuests(currentManageInvitation.id);
  renderGuests();
}

function renderGuests() {
  const filtered = guestsCache.filter(
    (guest) => currentGuestFilter === 'semua' || guest.status === currentGuestFilter,
  );
  if (filtered.length === 0) {
    elements.manage.list.innerHTML =
      '<p class="form-hint">Belum ada tamu. Tambahkan nama untuk mulai mengelola.</p>';
    return;
  }
  elements.manage.list.innerHTML = filtered
    .map((guest) => {
      const statusLabels = {
        diundang: 'Diundang',
        hadir: 'Hadir',
        'tidak-hadir': 'Tidak Hadir',
      };
      const options = Object.entries(statusLabels)
        .map(
          ([value, label]) =>
            `<option value="${value}"${guest.status === value ? ' selected' : ''}>${label}</option>`,
        )
        .join('');
      return `
        <article class="guest-item">
          <div class="guest-item-main">
            <strong class="guest-name">${escapeHtml(guest.fullName)}</strong>
            <span class="guest-meta">${escapeHtml(guest.guestGroup || 'Tanpa kelompok')}${guest.phone ? ` · ${escapeHtml(guest.phone)}` : ''}</span>
            <select class="input input-sm guest-status" data-id="${guest.id}" aria-label="Status ${escapeHtml(guest.fullName)}">${options}</select>
          </div>
          <button class="btn btn-danger btn-sm" type="button" data-action="delete-guest" data-id="${guest.id}">Hapus</button>
        </article>`;
    })
    .join('');
}

async function addGuestsFromForm() {
  const singleName = elements.manage.fullName.value.trim();
  const bulkText = elements.manage.bulk.value.trim();
  const nameLine = bulkText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const names = singleName ? [singleName] : nameLine;
  if (names.length === 0) {
    showToast('Masukkan nama tamu terlebih dahulu.', 'danger');
    return;
  }

  const payload = {
    fullName: names[0],
    phone: elements.manage.phone.value.trim(),
    guestGroup: elements.manage.group.value.trim(),
  };

  try {
    if (names.length === 1) {
      await api.addGuest(currentManageInvitation.id, payload);
    } else {
      await api.addGuestsBulk(
        currentManageInvitation.id,
        names.map((name) => ({ ...payload, fullName: name })),
      );
    }
    elements.manage.fullName.value = '';
    elements.manage.bulk.value = '';
    showToast(`Berhasil menambahkan ${names.length} tamu.`, 'success');
    await Promise.all([loadGuestStats(), loadGuests()]);
  } catch (error) {
    showToast(error.message, 'danger');
  }
}

async function handleGuestStatusChange(event) {
  const select = event.target.closest('select.guest-status');
  if (!select) return;
  try {
    await api.updateGuest(select.dataset.id, { status: select.value });
    await Promise.all([loadGuestStats(), loadGuests()]);
  } catch (error) {
    showToast(error.message, 'danger');
  }
}

async function handleDeleteGuest(event) {
  const button = event.target.closest('button[data-action="delete-guest"]');
  if (!button) return;
  if (!window.confirm('Hapus tamu ini?')) return;
  try {
    await api.deleteGuest(button.dataset.id);
    showToast('Tamu dihapus.', 'success');
    await Promise.all([loadGuestStats(), loadGuests()]);
  } catch (error) {
    showToast(error.message, 'danger');
  }
}

async function loadGiftAccounts() {
  giftAccountsCache = await api.listGiftAccounts(currentManageInvitation.id);
  renderGiftAccounts();
}

function renderGiftAccounts() {
  if (giftAccountsCache.length === 0) {
    elements.manage.giftList.innerHTML =
      '<p class="form-hint">Belum ada rekening. Tambahkan untuk menampilkan amplop digital.</p>';
    return;
  }
  elements.manage.giftList.innerHTML = giftAccountsCache
    .map(
      (account) => `
        <article class="guest-item">
          <div class="guest-item-main">
            <strong class="guest-name">${escapeHtml(account.bankName)} — ${escapeHtml(account.accountNumber)}</strong>
            <span class="guest-meta">${escapeHtml(account.accountName || 'Tanpa atas nama')}${account.isActive ? '' : ' · <em>Nonaktif</em>'}</span>
            <div class="invitation-actions">
              <button class="btn btn-ghost btn-sm" type="button" data-action="toggle-gift" data-id="${account.id}" data-active="${account.isActive}">${account.isActive ? 'Nonaktifkan' : 'Aktifkan'}</button>
              <button class="btn btn-danger btn-sm" type="button" data-action="delete-gift" data-id="${account.id}">Hapus</button>
            </div>
          </div>
        </article>`,
    )
    .join('');
}

async function addGiftAccountFromForm() {
  const bankName = elements.manage.bank.value.trim();
  const accountNumber = elements.manage.number.value.trim();
  if (!bankName || !accountNumber) {
    showToast('Nama bank dan nomor rekening wajib diisi.', 'danger');
    return;
  }
  try {
    await api.createGiftAccount(currentManageInvitation.id, {
      bankName,
      accountNumber,
      accountName: elements.manage.name.value.trim(),
    });
    elements.manage.bank.value = '';
    elements.manage.number.value = '';
    elements.manage.name.value = '';
    showToast('Rekening amplop digital ditambahkan.', 'success');
    loadGiftAccounts();
  } catch (error) {
    showToast(error.message, 'danger');
  }
}

async function handleToggleGift(event) {
  const button = event.target.closest('button[data-action="toggle-gift"]');
  if (!button) return;
  try {
    await api.updateGiftAccount(button.dataset.id, {
      isActive: button.dataset.active === 'false',
    });
    loadGiftAccounts();
  } catch (error) {
    showToast(error.message, 'danger');
  }
}

async function handleDeleteGift(event) {
  const button = event.target.closest('button[data-action="delete-gift"]');
  if (!button) return;
  if (!window.confirm('Hapus rekening ini?')) return;
  try {
    await api.deleteGiftAccount(button.dataset.id);
    showToast('Rekening dihapus.', 'success');
    loadGiftAccounts();
  } catch (error) {
    showToast(error.message, 'danger');
  }
}

function wireManageEvents() {
  elements.manage.backBtn.addEventListener('click', () => {
    elements.manageView.classList.add('d-none');
    elements.listView.classList.remove('d-none');
    loadInvitations().catch(showToast);
  });
  elements.manage.addBtn.addEventListener('click', addGuestsFromForm);
  elements.manage.filter.addEventListener('change', (event) => {
    currentGuestFilter = event.target.value;
    renderGuests();
  });
  elements.manage.list.addEventListener('change', handleGuestStatusChange);
  elements.manage.list.addEventListener('click', handleDeleteGuest);
  elements.manage.addGiftBtn.addEventListener('click', addGiftAccountFromForm);
  elements.manage.giftList.addEventListener('click', (event) => {
    handleToggleGift(event);
    handleDeleteGift(event);
  });
}

/* ==========================================================
    INISIALISASI & EVENT
  ========================================================== */

async function handleGridAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const { action, id } = button.dataset;
  try {
    if (action === 'edit') {
      const invitation = await api.getInvitation(id);
      showEditor(invitation);
    } else if (action === 'manage') {
      const invitation = await api.getInvitation(id);
      showManage(invitation);
    } else if (action === 'delete') {
      if (!window.confirm('Hapus undangan ini? Tindakan tidak dapat dibatalkan.')) return;
      await api.deleteInvitation(id);
      showToast('Undangan dihapus.', 'success');
      loadInvitations();
    } else if (action === 'publish' || action === 'unpublish') {
      await api.setPublished(id, action === 'publish');
      showToast(action === 'publish' ? 'Undangan diterbitkan.' : 'Undangan dinonaktifkan.', 'success');
      loadInvitations();
    }
  } catch (error) {
    showToast(error.message, 'danger');
  }
}

function wireEditorEvents() {
  const formFields = ['f-title', 'f-couple', 'f-date', 'f-time', 'f-venue', 'f-location', 'f-message'];
  formFields.forEach((id) => {
    document.getElementById(id).addEventListener('input', updatePreview);
  });

  const titleInput = document.getElementById('f-title');
  const slugInput = document.getElementById('f-slug');
  titleInput.addEventListener('input', () => {
    if (!currentInvitationId && !slugInput.value.trim()) {
      autoSlug = slugify(titleInput.value);
      slugInput.value = autoSlug;
      updateSlugPreview();
    }
  });
  slugInput.addEventListener('input', updateSlugPreview);

  ['primary', 'accent'].forEach((name) => {
    const colorInput = document.getElementById(`f-theme-${name}`);
    const hexInput = document.getElementById(`f-theme-${name}-hex`);
    colorInput.addEventListener('input', () => {
      hexInput.value = colorInput.value;
      updatePreview();
    });
    hexInput.addEventListener('input', () => {
      if (/^#[0-9a-f]{6}$/i.test(hexInput.value)) {
        colorInput.value = hexInput.value;
        updatePreview();
      }
    });
  });
}

async function init() {
  wireEditorEvents();
  wireManageEvents();

  if (!(await api.initSession())) {
    window.location.href = '/login';
    return;
  }

  try {
    const user = await api.me();
    elements.userName.textContent = user.fullName || user.email;
    if (user.role === 'admin' && elements.adminLink) {
      elements.adminLink.classList.remove('d-none');
    }
    const welcome = document.getElementById('dash-welcome');
    if (welcome) welcome.textContent = `Selamat datang, ${user.fullName || user.email}`;
    const avatar = document.getElementById('dash-avatar');
    if (avatar) avatar.textContent = (user.fullName || user.email || 'B').trim().charAt(0).toUpperCase();
    const roleEl = document.getElementById('dash-user-role');
    if (roleEl) roleEl.textContent = user.role === 'admin' ? 'Administrator' : 'Member';
  } catch {
    window.location.href = '/login';
    return;
  }

  try {
    await Promise.all([loadTemplates(), loadInvitations()]);
  } catch (error) {
    showToast(error.message, 'danger');
  }

  document.querySelectorAll('.js-create').forEach((btn) => {
    btn.addEventListener('click', () => showEditor());
  });
  document.querySelectorAll('.dash-nav-item[data-nav]').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      if (item.dataset.nav === 'orders') {
        showOrders();
      } else {
        showList();
      }
    });
  });
  elements.backBtn.addEventListener('click', showList);
  elements.cancelBtn.addEventListener('click', showList);
  elements.grid.addEventListener('click', handleGridAction);
  initDashShell();

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveInvitation();
  });

  elements.logoutBtn.addEventListener('click', async () => {
    await api.logout();
    window.location.href = '/login';
  });
}

init();
