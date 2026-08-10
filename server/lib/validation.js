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

export const GUEST_STATUS_OPTIONS = ['diundang', 'hadir', 'tidak-hadir'];

export function validateGuestStatus(value, field = 'status') {
  const status = requiredString(value, field, { max: 20 }).toLowerCase();
  if (!GUEST_STATUS_OPTIONS.includes(status)) {
    badRequest(`${field} harus salah satu dari: ${GUEST_STATUS_OPTIONS.join(', ')}.`);
  }
  return status;
}

export function validateGuestsList(value, field = 'guests', { max = 500 } = {}) {
  let data = value;
  if (typeof value === 'string') {
    try {
      data = JSON.parse(value);
    } catch {
      badRequest(`${field} bukan JSON yang valid.`);
    }
  }
  if (!Array.isArray(data) || data.length === 0) {
    badRequest(`${field} harus berupa daftar tamu yang tidak kosong.`);
  }
  if (data.length > max) {
    badRequest(`${field} maksimal ${max} item.`);
  }
  return data.map((guest) => {
    if (typeof guest !== 'object' || guest === null || Array.isArray(guest)) {
      badRequest(`Setiap item ${field} harus berupa objek.`);
    }
    return {
      fullName: requiredString(guest.fullName, 'fullName', { max: 120 }),
      phone: optionalString(guest.phone, 'phone', { max: 30 }),
      guestGroup: optionalString(guest.guestGroup, 'guestGroup', { max: 60 }),
      status: guest.status === undefined || guest.status === null || guest.status === ''
        ? 'diundang'
        : validateGuestStatus(guest.status),
    };
  });
}

const HEX_COLOR_PATTERN = /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i;

export function validateHexColor(value, field = 'color', { optional = false } = {}) {
  if (optional && (value === undefined || value === null || value === '')) {
    return '';
  }
  const color = requiredString(value, field, { max: 9 }).toLowerCase();
  if (!HEX_COLOR_PATTERN.test(color)) {
    badRequest(`${field} harus berupa warna hex (#fff atau #ffffff).`);
  }
  return color;
}

export function validateThemeColors(theme, field = 'theme') {
  const normalized = validateJsonObject(theme, field, { optional: true });
  if (Object.keys(normalized).length === 0) {
    return normalized;
  }
  const colors = normalized.colors === undefined ? {} : normalized.colors;
  if (typeof colors !== 'object' || colors === null || Array.isArray(colors)) {
    badRequest(`${field}.colors harus berupa objek.`);
  }
  const normalizedColors = {};
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === 'string' && value.startsWith('#')) {
      normalizedColors[key] = validateHexColor(value, `${field}.colors.${key}`);
    } else {
      normalizedColors[key] = value;
    }
  }
  return { ...normalized, colors: normalizedColors };
}
