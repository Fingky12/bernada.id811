import pg from 'pg';
import { config } from '../server/config.js';

const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function sanitizeIdentifier(name) {
  if (!IDENTIFIER_PATTERN.test(name)) {
    throw new Error(`Nama database tidak valid: "${name}"`);
  }
  return name;
}

async function createDatabase() {
  const url = new URL(config.databaseUrl);
  const databaseName = url.pathname.replace(/^\//, '');

  url.pathname = '/postgres';
  const adminClient = new pg.Client({ connectionString: url.toString() });

  try {
    await adminClient.connect();
    const result = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName],
    );

    if (result.rowCount > 0) {
      console.log(`Database "${databaseName}" sudah ada.`);
      return;
    }

    const safeName = sanitizeIdentifier(databaseName);
    await adminClient.query(`CREATE DATABASE ${safeName}`);
    console.log(`Database "${databaseName}" berhasil dibuat.`);
  } finally {
    await adminClient.end();
  }
}

createDatabase().catch((error) => {
  console.error('Gagal membuat database:', error.message);
  process.exit(1);
});
