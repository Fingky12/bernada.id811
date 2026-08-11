/* ==========================================================
    BERNADA.ID LOGIN PAGE
    ----------------------------------------------------------
    Sprint 3 — The Core Features
    Tanggung jawab:
    - Toggle form masuk/daftar (tab)
    - Validasi inline per-field (meniru aturan server)
    - Kirim login/register ke API
    - Mapping error server (field / alert global)
    - Alihkan ke builder.html setelah berhasil
  ========================================================== */

import { api } from './api.js';

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const alertBox = document.getElementById('auth-alert');
const subtitle = document.getElementById('auth-subtitle');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELD_NAMES = ['email', 'password', 'fullName'];

function trim(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/* ------------------------------------------
    Validasi per-field (client)
    Meniru aturan server (server/lib/validation.js).
  ------------------------------------------ */

function validateFullName(value) {
  const name = trim(value);
  if (!name) return 'Nama lengkap wajib diisi.';
  if (name.length > 100) return 'Nama lengkap maksimal 100 karakter.';
  return null;
}

function validateEmail(value) {
  const email = trim(value);
  if (!email) return 'Email wajib diisi.';
  if (!EMAIL_PATTERN.test(email)) return 'Email tidak valid.';
  return null;
}

function validatePassword(value) {
  const password = trim(value);
  if (!password) return 'Password wajib diisi.';
  if (password.length < 8) return 'Password minimal 8 karakter.';
  return null;
}

function validateInput(input) {
  if (input.name === 'fullName') return validateFullName(input.value);
  if (input.name === 'email') return validateEmail(input.value);
  if (input.name === 'password') return validatePassword(input.value);
  return null;
}

/* ------------------------------------------
    Error per-field (inline)
  ------------------------------------------ */

function errorId(input) {
  return `${input.id}-error`;
}

function fieldErrorNode(input) {
  let node = document.getElementById(errorId(input));
  if (!node) {
    node = document.createElement('p');
    node.id = errorId(input);
    node.className = 'form-error';
    const group = input.closest('.form-group') || input.parentElement;
    group.appendChild(node);
  }
  return node;
}

function setFieldError(input, message) {
  input.classList.add('input-error');
  input.setAttribute('aria-invalid', 'true');
  const node = fieldErrorNode(input);
  node.textContent = message;
  input.setAttribute('aria-describedby', node.id);
}

function clearFieldError(input) {
  input.classList.remove('input-error');
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
  const node = document.getElementById(errorId(input));
  if (node) node.remove();
}

function clearFormErrors(form) {
  for (const input of form.querySelectorAll('.input-error')) {
    clearFieldError(input);
  }
}

/* ------------------------------------------
    Alert global (error non-field)
  ------------------------------------------ */

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.classList.remove('d-none');
}

function hideAlert() {
  alertBox.classList.add('d-none');
  alertBox.textContent = '';
}

/* ------------------------------------------
    Submit & mapping error server
  ------------------------------------------ */

function setLoading(button, loading) {
  button.disabled = loading;
  button.classList.toggle('btn-loading', loading);
}

function validateForm(form) {
  let firstInvalid = null;
  for (const input of form.querySelectorAll('input')) {
    clearFieldError(input);
    const message = validateInput(input);
    if (message) {
      setFieldError(input, message);
      if (!firstInvalid) firstInvalid = input;
    }
  }
  return firstInvalid;
}

function inputByName(form, name) {
  return form.querySelector(`[name="${name}"]`);
}

function showErrorOnField(form, message) {
  const fieldName = FIELD_NAMES.find((name) => message.toLowerCase().includes(name.toLowerCase()));
  const input = fieldName ? inputByName(form, fieldName) : null;
  if (input) {
    setFieldError(input, message);
    return;
  }
  showAlert(message);
}

function handleApiError(form, error) {
  if (error.status === undefined) {
    showAlert('Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.');
    return;
  }
  if (error.code === 'EMAIL_TAKEN') {
    const emailInput = inputByName(form, 'email');
    if (emailInput) {
      setFieldError(emailInput, 'Email sudah terdaftar. Gunakan email lain atau masuk.');
      return;
    }
  }
  showErrorOnField(form, error.message);
}

async function submit(form, handler) {
  hideAlert();
  const firstInvalid = validateForm(form);
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  setLoading(button, true);
  try {
    const formData = new FormData(form);
    await handler(Object.fromEntries(formData.entries()));
    window.location.href = '/builder';
  } catch (error) {
    handleApiError(form, error);
    setLoading(button, false);
  }
}

/* ------------------------------------------
    Validasi live (hanya saat field sudah ber-error)
  ------------------------------------------ */

function attachLiveValidation(form) {
  form.addEventListener('input', (event) => {
    const input = event.target;
    if (!input.matches('input[name]')) return;

    const message = validateInput(input);
    if (!message) {
      clearFieldError(input);
    } else if (input.classList.contains('input-error')) {
      setFieldError(input, message);
    }
  });
}

/* ------------------------------------------
    Tab & event binding
  ------------------------------------------ */

function showTab(which) {
  const isLogin = which === 'login';
  tabLogin.classList.toggle('is-active', isLogin);
  tabRegister.classList.toggle('is-active', !isLogin);
  tabLogin.setAttribute('aria-selected', String(isLogin));
  tabRegister.setAttribute('aria-selected', String(!isLogin));
  loginForm.classList.toggle('d-none', !isLogin);
  registerForm.classList.toggle('d-none', isLogin);
  subtitle.textContent = isLogin
    ? 'Masuk untuk melanjutkan ke dasbor undangan Anda.'
    : 'Buat akun gratis untuk mulai membuat undangan digital.';
  clearFormErrors(loginForm);
  clearFormErrors(registerForm);
  hideAlert();
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submit(loginForm, (data) => api.login(data));
});

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submit(registerForm, (data) => api.register(data));
});

tabLogin.addEventListener('click', () => showTab('login'));
tabRegister.addEventListener('click', () => showTab('register'));

attachLiveValidation(loginForm);
attachLiveValidation(registerForm);
