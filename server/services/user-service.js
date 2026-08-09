import { pool } from '../db.js';
import { hashPassword } from '../lib/password.js';
import { HttpError } from '../lib/http-error.js';

const PUBLIC_COLUMNS = 'id, email, full_name, role, created_at';

export async function createUser({ email, password, fullName }) {
  const passwordHash = await hashPassword(password);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING ${PUBLIC_COLUMNS}`,
      [email, passwordHash, fullName],
    );
    return rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'EMAIL_TAKEN', 'Email sudah terdaftar.');
    }
    throw error;
  }
}

export async function getUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash, full_name, role, created_at FROM users WHERE email = $1',
    [email],
  );
  return rows[0] || null;
}

export async function getUserById(id) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}
