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
const authTabs = document.getElementById('auth-tabs');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const forgotForm = document.getElementById('forgot-form');
const resetForm = document.getElementById('reset-form');
const alertBox = document.getElementById('auth-alert');
const subtitle = document.getElementById('auth-subtitle');

const resetToken = new URLSearchParams(window.location.search).get('reset');

const nextUrlParam = new URLSearchParams(window.location.search).get('next');
const nextUrl = nextUrlParam && nextUrlParam.startsWith('/') ? nextUrlParam : null;

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

function validatePasswordConfirm(confirmInput) {
  const passwordInput = document.getElementById('reset-password');
  const confirm = trim(confirmInput.value);
  if (!confirm) return 'Ulangi password wajib diisi.';
  if (passwordInput && passwordInput.value !== confirm) {
    return 'Password tidak sama.';
  }
  return null;
}

function validateInput(input) {
  if (input.name === 'fullName') return validateFullName(input.value);
  if (input.name === 'email') return validateEmail(input.value);
  if (input.name === 'password') return validatePassword(input.value);
  if (input.name === 'passwordConfirm') return validatePasswordConfirm(input);
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
  alertBox.classList.remove('d-none', 'auth-alert-success');
  alertBox.classList.add('auth-alert-danger');
}

function showSuccess(message) {
  alertBox.textContent = message;
  alertBox.classList.remove('d-none', 'auth-alert-danger');
  alertBox.classList.add('auth-alert-success');
}

function hideAlert() {
  alertBox.classList.add('d-none');
  alertBox.classList.remove('auth-alert-danger', 'auth-alert-success');
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
  if (error.code === 'INVALID_TOKEN' || error.code === 'EXPIRED_TOKEN') {
    showAlert(error.message);
    return;
  }
  showErrorOnField(form, error.message);
}

async function submit(form, handler, onSuccess) {
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
    const result = await handler(Object.fromEntries(formData.entries()));
    if (onSuccess) {
      setLoading(button, false);
      onSuccess(result);
    } else {
      window.location.href = nextUrl || (result?.role === 'admin' ? '/admin' : '/builder');
    }
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
    Tampilan & event binding
  ------------------------------------------ */

function showView(view) {
  const isLogin = view === 'login';
  const isRegister = view === 'register';
  const isForgot = view === 'forgot';
  const isReset = view === 'reset';

  authTabs.classList.toggle('d-none', isForgot || isReset);
  tabLogin.classList.toggle('is-active', isLogin);
  tabRegister.classList.toggle('is-active', isRegister);
  tabLogin.setAttribute('aria-selected', String(isLogin));
  tabRegister.setAttribute('aria-selected', String(isRegister));

  loginForm.classList.toggle('d-none', !isLogin);
  registerForm.classList.toggle('d-none', !isRegister);
  forgotForm.classList.toggle('d-none', !isForgot);
  resetForm.classList.toggle('d-none', !isReset);

  subtitle.textContent = isRegister
    ? 'Buat akun gratis untuk mulai membuat undangan digital.'
    : isForgot
      ? 'Masukkan email untuk menerima tautan reset password.'
      : isReset
        ? 'Buat password baru untuk akun Anda.'
        : 'Masuk untuk melanjutkan ke dasbor undangan Anda.';

  clearFormErrors(loginForm);
  clearFormErrors(registerForm);
  clearFormErrors(forgotForm);
  clearFormErrors(resetForm);
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

forgotForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submit(
    forgotForm,
    (data) => api.forgotPassword(data.email),
    () => {
      showSuccess('Tautan reset password telah dikirim ke email Anda.');
      forgotForm.reset();
    },
  );
});

resetForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submit(
    resetForm,
    (data) => api.resetPassword(resetToken, data.password),
    () => {
      resetForm.reset();
      showView('login');
      showSuccess('Password berhasil diubah. Silakan masuk dengan password baru.');
    },
  );
});

tabLogin.addEventListener('click', () => showView('login'));
tabRegister.addEventListener('click', () => showView('register'));

document.getElementById('show-forgot').addEventListener('click', () => showView('forgot'));
document.getElementById('back-login-from-forgot').addEventListener('click', () => showView('login'));
document.getElementById('back-login-from-reset').addEventListener('click', () => showView('login'));

attachLiveValidation(loginForm);
attachLiveValidation(registerForm);
attachLiveValidation(forgotForm);
attachLiveValidation(resetForm);

if (resetToken) {
  showView('reset');
}
