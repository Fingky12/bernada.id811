import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, dbErrorMessage } from '../server/db.js';

const MIGRATIONS_DIR = path.join(fileURLToPath(new URL('.', import.meta.url)), 'migrations');

async function applyMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const appliedResult = await client.query('SELECT filename FROM schema_migrations');
    const applied = new Set(appliedResult.rows.map((row) => row.filename));

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
      console.log('Database sudah terbaru. Tidak ada migrasi yang perlu dijalankan.');
      return;
    }

    for (const file of pending) {
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Migrasi ${file} diterapkan.`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Migrasi ${file} gagal: ${dbErrorMessage(error)}`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigrations().catch((error) => {
  console.error(`Migrasi gagal: ${dbErrorMessage(error)}`);
  process.exit(1);
});
