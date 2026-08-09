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

const elements = {
  userName: document.getElementById('app-user-name'),
  logoutBtn: document.getElementById('logout-btn'),
  listView: document.getElementById('list-view'),
  editorView: document.getElementById('editor-view'),
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

function formatEventDate(iso) {
  if (!iso) return 'Tanggal acara';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Tanggal acara';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function showToast(message, type = '') {
  elements.toast.textContent = message;
  elements.toast.className = `toast is-visible${type ? ` toast-${type}` : ''}`;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    elements.toast.className = 'toast';
  }, 3000);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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
  elements.preview.date.textContent = formatEventDate(
    document.getElementById('f-date').value
      ? `${document.getElementById('f-date').value}T12:00:00`
      : null,
  );
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

function renderInvitations(invitations) {
  const hasItems = invitations.length > 0;
  elements.emptyState.classList.toggle('d-none', hasItems);

  elements.grid.innerHTML = invitations
    .map((invitation) => {
      const published = invitation.isPublished;
      const badge = published
        ? '<span class="badge badge-success badge-sm">Terbit</span>'
        : '<span class="badge badge-warning badge-sm">Draf</span>';
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
            <span class="invitation-meta-item">📅 ${escapeHtml(formatEventDate(invitation.eventDate))}</span>
          </div>
          <p class="invitation-slug">/${escapeHtml(invitation.slug)}</p>
          <div class="invitation-actions">
            <button class="btn btn-outline btn-sm" type="button" data-action="edit" data-id="${invitation.id}">Edit</button>
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
  elements.templateGrid.innerHTML = templates
    .map((template) => `
      <label class="template-option" data-template-id="${template.id}">
        <input type="radio" name="templateId" value="${template.id}" class="d-none">
        <span class="template-option-check" aria-hidden="true">✓</span>
        <img class="template-option-thumb" src="${escapeHtml(template.previewUrl)}" alt="${escapeHtml(template.name)}" loading="lazy">
        <span class="template-option-name">${escapeHtml(template.name)}</span>
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
  elements.listView.classList.remove('d-none');
  elements.editorView.classList.add('d-none');
  loadInvitations().catch(showToast);
}

function showEditor(invitation = null) {
  currentInvitationId = invitation?.id || null;
  elements.listView.classList.add('d-none');
  elements.editorView.classList.remove('d-none');
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

  const theme = { ...DEFAULT_THEME, ...(invitation?.theme || {}) };
  document.getElementById('f-theme-primary').value = theme.primaryColor;
  document.getElementById('f-theme-primary-hex').value = theme.primaryColor;
  document.getElementById('f-theme-accent').value = theme.accentColor;
  document.getElementById('f-theme-accent-hex').value = theme.accentColor;

  selectTemplate(invitation?.templateId || null);
  autoSlug = invitation?.slug || '';
  updateSlugPreview();
}

function buildPayload() {
  return {
    title: document.getElementById('f-title').value.trim(),
    slug: document.getElementById('f-slug').value.trim(),
    couple: document.getElementById('f-couple').value.trim(),
    eventDate: document.getElementById('f-date').value
      ? `${document.getElementById('f-date').value}T12:00:00`
      : null,
    eventTime: document.getElementById('f-time').value.trim(),
    venue: document.getElementById('f-venue').value.trim(),
    location: document.getElementById('f-location').value.trim(),
    message: document.getElementById('f-message').value.trim(),
    musicUrl: document.getElementById('f-music').value.trim(),
    theme: getTheme(),
    templateId: elements.templateGrid.querySelector('input[name="templateId"]:checked')
      ? elements.templateGrid.querySelector('input[name="templateId"]:checked').value
      : null,
  };
}

function updateSlugPreview() {
  const slug = document.getElementById('f-slug').value.trim() || autoSlug;
  document.getElementById('slug-preview').textContent = `${slug || 'nama-undangan'}`;
}

async function saveInvitation() {
  const payload = buildPayload();
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
  const formFields = ['f-title', 'f-couple', 'f-date', 'f-venue', 'f-location', 'f-message'];
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

  if (!(await api.initSession())) {
    window.location.href = '/login';
    return;
  }

  try {
    const user = await api.me();
    elements.userName.textContent = user.fullName || user.email;
  } catch {
    window.location.href = '/login';
    return;
  }

  try {
    await Promise.all([loadTemplates(), loadInvitations()]);
  } catch (error) {
    showToast(error.message, 'danger');
  }

  elements.createBtn.addEventListener('click', () => showEditor());
  elements.emptyCreateBtn.addEventListener('click', () => showEditor());
  elements.backBtn.addEventListener('click', showList);
  elements.cancelBtn.addEventListener('click', showList);
  elements.grid.addEventListener('click', handleGridAction);

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
