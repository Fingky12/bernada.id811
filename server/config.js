import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

function getEnv(name, defaultValue) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${name} wajib diisi (lihat .env.example).`);
  }
  return value;
}

function parsePort(value) {
  const port = Number.parseInt(value, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Environment variable PORT harus berupa angka 1-65535.');
  }
  return port;
}

const env = getEnv('NODE_ENV', 'development');
const port = parsePort(getEnv('PORT', '3000'));
const corsOrigin = getEnv('CORS_ORIGIN', env === 'production' ? '' : '*');

// JWT_SECRET wajib diisi pada production.
// Di development, jika tidak di-set, dipakai default 'dev-secret-bernada-jangan-dipakai-produksi'
// HANYA untuk keperluan lokal. Jangan pernah memakai nilai default ini di environment lain.
const jwtSecret = getEnv('JWT_SECRET', env === 'production' ? '' : 'dev-secret-bernada-jangan-dipakai-produksi');

if (env === 'production' && !jwtSecret) {
  throw new Error('Environment variable JWT_SECRET wajib diisi pada mode production.');
}

export const config = {
  env,
  port,
  corsOrigin,
  databaseUrl: getEnv(
    'DATABASE_URL',
    'postgresql://bernada:bernada@localhost:5432/bernada',
  ),
  appVersion: packageJson.version,
  jwtSecret,
  jwtAccessExpires: getEnv('JWT_ACCESS_EXPIRES', '15m'),
  refreshTokenExpiryDays: Number.parseInt(getEnv('REFRESH_TOKEN_EXPIRY_DAYS', '30'), 10),
  cookieName: 'bernada_refresh',

  // Email (SMTP) — untuk reset password
  smtpHost: getEnv('SMTP_HOST', ''),
  smtpPort: Number.parseInt(getEnv('SMTP_PORT', '587'), 10),
  smtpUser: getEnv('SMTP_USER', ''),
  smtpPass: getEnv('SMTP_PASS', ''),
  emailFrom: getEnv('EMAIL_FROM', 'BERNADA.ID <no-reply@bernada.id>'),
  appBaseUrl: getEnv('APP_BASE_URL', 'http://localhost:3000'),

  // Password reset token expiry (hours)
  resetTokenExpiryHours: Number.parseInt(getEnv('RESET_TOKEN_EXPIRY_HOURS', '24'), 10),

  // Masa berlaku pembayaran order (jam) — order pending/awaiting_payment
  // yang melewati batas ini menjadi 'expired' (F2-08).
  orderPaymentExpiryHours: Number.parseInt(getEnv('ORDER_PAYMENT_EXPIRY_HOURS', '24'), 10),
};
