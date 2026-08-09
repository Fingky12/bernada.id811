import crypto from 'node:crypto';
import { pool } from '../db.js';
import { config } from '../config.js';
import { HttpError } from '../lib/http-error.js';
import { signAccessToken } from '../lib/jwt.js';
import { verifyPassword } from '../lib/password.js';
import { createUser, getUserByEmail, getUserById } from './user-service.js';

const DUMMY_PASSWORD_HASH =
  '$2b$12$C6UzMDM.H6dfI/f/IKcEeOZfU9z0q1mY8Lq9rS7uYQ8KvT3VpY3eG';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function newRefreshToken() {
  return crypto.randomBytes(48).toString('base64url');
}

export function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    createdAt: user.created_at,
  };
}

async function issueRefreshToken(client, userId) {
  await client.query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
  const refreshToken = newRefreshToken();
  const expiresAt = new Date(
    Date.now() + config.refreshTokenExpiryDays * 24 * 60 * 60 * 1000,
  );
  await client.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hashToken(refreshToken), expiresAt],
  );
  return { refreshToken, expiresAt };
}

async function issueSession(userId) {
  const accessToken = signAccessToken({ sub: userId });
  const { refreshToken, expiresAt } = await issueRefreshToken(pool, userId);
  return { accessToken, refreshToken, expiresAt };
}

export async function register({ email, password, fullName }) {
  const user = await createUser({ email, password, fullName });
  const session = await issueSession(user.id);
  return { user: toPublicUser(user), ...session };
}

export async function login({ email, password }) {
  const user = await getUserByEmail(email);
  if (!user) {
    await verifyPassword(password, DUMMY_PASSWORD_HASH);
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email atau password salah.');
  }
  const passwordMatches = await verifyPassword(password, user.password_hash);
  if (!passwordMatches) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email atau password salah.');
  }
  const session = await issueSession(user.id);
  return { user: toPublicUser(user), ...session };
}

export async function logout(refreshToken) {
  if (!refreshToken) {
    return;
  }
  await pool.query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL',
    [hashToken(refreshToken)],
  );
}

export async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Sesi tidak ditemukan.');
  }

  const { rows } = await pool.query(
    'SELECT id, user_id, expires_at FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL',
    [hashToken(refreshToken)],
  );
  const record = rows[0];

  if (!record) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Sesi tidak valid.');
  }
  if (new Date(record.expires_at) < new Date()) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Sesi sudah kedaluwarsa.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
      [record.id],
    );
    const accessToken = signAccessToken({ sub: record.user_id });
    const { refreshToken: newToken, expiresAt } = await issueRefreshToken(client, record.user_id);
    await client.query('COMMIT');
    return { accessToken, refreshToken: newToken, expiresAt };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getCurrentUser(userId) {
  const user = await getUserById(userId);
  if (!user) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Pengguna tidak ditemukan.');
  }
  return toPublicUser(user);
}
