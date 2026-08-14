import crypto from 'node:crypto';
import { pool } from '../db.js';
import { config } from '../config.js';
import { HttpError } from '../lib/http-error.js';
import { hashPassword } from '../lib/password.js';
import { getUserByEmail, getUserById } from './user-service.js';
import { sendPasswordResetEmail } from './email-service.js';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createResetToken(userId) {
  await pool.query(
    `DELETE FROM password_reset_tokens
      WHERE expires_at < NOW() OR used_at IS NOT NULL`,
  );
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(
    Date.now() + config.resetTokenExpiryHours * 60 * 60 * 1000,
  );
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, hashToken(token), expiresAt],
  );
  return { token, expiresAt };
}

export async function requestPasswordReset(email) {
  const user = await getUserByEmail(email);
  if (!user) {
    return;
  }
  const { token } = await createResetToken(user.id);
  const resetUrl = `${config.appBaseUrl}/login?reset=${encodeURIComponent(token)}`;
  await sendPasswordResetEmail({
    to: user.email,
    fullName: user.full_name,
    resetUrl,
  });
}

export async function resetPassword({ token, password }) {
  const { rows } = await pool.query(
    `SELECT id, user_id, expires_at, used_at
       FROM password_reset_tokens
      WHERE token_hash = $1`,
    [hashToken(token)],
  );
  const record = rows[0];

  if (!record) {
    throw new HttpError(400, 'INVALID_TOKEN', 'Tautan reset password tidak valid.');
  }
  if (record.used_at) {
    throw new HttpError(400, 'INVALID_TOKEN', 'Tautan reset password sudah digunakan.');
  }
  if (new Date(record.expires_at) < new Date()) {
    throw new HttpError(
      400,
      'EXPIRED_TOKEN',
      'Tautan reset password sudah kedaluwarsa. Silakan minta tautan baru.',
    );
  }

  const passwordHash = await hashPassword(password);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1',
      [record.id],
    );
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, record.user_id],
    );
    await client.query(
      `UPDATE refresh_tokens
          SET revoked_at = NOW()
        WHERE user_id = $1 AND revoked_at IS NULL`,
      [record.user_id],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return getUserById(record.user_id);
}
