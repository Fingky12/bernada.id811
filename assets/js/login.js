/* ==========================================================
    BERNADA.ID LOGIN PAGE
    ----------------------------------------------------------
    Sprint 3 — The Core Features
    Tanggung jawab:
    - Toggle form masuk/daftar (tab)
    - Kirim login/register ke API
    - Alihkan ke builder.html setelah berhasil
  ========================================================== */

import { api } from './api.js';

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const alertBox = document.getElementById('auth-alert');
const subtitle = document.getElementById('auth-subtitle');

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
  hideAlert();
}

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.classList.remove('d-none');
}

function hideAlert() {
  alertBox.classList.add('d-none');
  alertBox.textContent = '';
}

function setLoading(button, loading) {
  button.disabled = loading;
  button.classList.toggle('btn-loading', loading);
}

async function submit(form, handler) {
  hideAlert();
  const button = form.querySelector('button[type="submit"]');
  setLoading(button, true);
  try {
    const formData = new FormData(form);
    await handler(Object.fromEntries(formData.entries()));
    window.location.href = 'builder.html';
  } catch (error) {
    showAlert(error.message);
    setLoading(button, false);
  }
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
