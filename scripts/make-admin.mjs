/* ==========================================================
    BERNADA.ID — PROMOTE USER TO ADMIN
    Sprint 5 — Admin Dashboard
    Penggunaan: npm run admin:promote -- <email>
    Efek: mengubah role user menjadi 'admin' di database.
  ========================================================== */

import { pool } from '../server/db.js';

const email = process.argv[2];

function usage() {
  console.error('Gunakan: npm run admin:promote -- <email>');
  process.exit(1);
}

if (!email) {
  usage();
}

try {
  const { rowCount } = await pool.query(
    'UPDATE users SET role = $1 WHERE email = $2',
    ['admin', email],
  );
  if (rowCount === 0) {
    console.error(`User dengan email "${email}" tidak ditemukan.`);
    process.exit(1);
  }
  console.log(`Role "admin" diterapkan untuk ${email}.`);
  process.exit(0);
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
