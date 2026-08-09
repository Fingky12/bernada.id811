import { HttpError } from './http-error.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_PASSWORD_BYTES = 72;

function badRequest(message) {
  throw new HttpError(400, 'VALIDATION_ERROR', message);
}

export function parseId(value, field = 'id') {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    badRequest(`${field} tidak valid.`);
  }
  return value;
}

export function requiredString(value, field, { min = 1, max = 255, trim = true } = {}) {
  const text = trim && typeof value === 'string' ? value.trim() : value;
  if (typeof text !== 'string' || text.length < min) {
    badRequest(`${field} wajib diisi minimal ${min} karakter.`);
  }
  if (text.length > max) {
    badRequest(`${field} maksimal ${max} karakter.`);
  }
  return text;
}

export function optionalString(value, field, { max = 255 } = {}) {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  return requiredString(value, field, { min: 1, max });
}

export function validateEmail(value, field = 'email') {
  const email = requiredString(value, field, { max: 254 });
  if (!EMAIL_PATTERN.test(email)) {
    badRequest(`${field} tidak valid.`);
  }
  return email.toLowerCase();
}

export function validatePassword(value, field = 'password') {
  const password = requiredString(value, field, { min: 8, max: 255 });
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    badRequest(`${field} terlalu panjang (maksimal 72 byte).`);
  }
  return password;
}

export function validateSlug(value, field = 'slug', { max = 60 } = {}) {
  const slug = requiredString(value, field, { min: 1, max });
  if (!SLUG_PATTERN.test(slug)) {
    badRequest(`${field} hanya boleh huruf kecil, angka, dan tanda hubung.`);
  }
  return slug;
}

export function validateIsoDate(value, field, { optional = false } = {}) {
  if (optional && (value === undefined || value === null || value === '')) {
    return null;
  }
  const text = requiredString(value, field, { max: 40 });
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    badRequest(`${field} harus berupa tanggal yang valid.`);
  }
  return parsed.toISOString();
}

export function validateJsonObject(value, field, { optional = false } = {}) {
  if (optional && (value === undefined || value === null)) {
    return {};
  }
  let data = value;
  if (typeof value === 'string') {
    try {
      data = JSON.parse(value);
    } catch {
      badRequest(`${field} bukan JSON yang valid.`);
    }
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    badRequest(`${field} harus berupa objek.`);
  }
  return data;
}

export function validateStringArray(value, field, { max = 100, itemMax = 500 } = {}) {
  if (value === undefined || value === null) {
    return [];
  }
  let data = value;
  if (typeof value === 'string') {
    try {
      data = JSON.parse(value);
    } catch {
      badRequest(`${field} bukan JSON yang valid.`);
    }
  }
  if (!Array.isArray(data)) {
    badRequest(`${field} harus berupa daftar teks.`);
  }
  if (data.length > max) {
    badRequest(`${field} maksimal ${max} item.`);
  }
  return data.map((item) => {
    if (typeof item !== 'string' || item.trim() === '') {
      badRequest(`${field} hanya boleh berisi teks.`);
    }
    if (item.trim().length > itemMax) {
      badRequest(`${field} maksimal ${itemMax} karakter per item.`);
    }
    return item.trim();
  });
}
