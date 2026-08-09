import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export function dbErrorMessage(error) {
  const message =
    error?.errors?.[0]?.message ??
    error?.cause?.message ??
    error?.message;
  return message || 'Kesalahan database yang tidak diketahui.';
}

export async function checkDatabase() {
  try {
    const { rows } = await pool.query('SELECT NOW() AS now');
    return { ok: true, serverTime: rows[0].now };
  } catch (error) {
    console.error('Database health check gagal:', dbErrorMessage(error));
    return { ok: false };
  }
}
