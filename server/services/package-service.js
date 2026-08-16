import { pool } from '../db.js';
import { HttpError } from '../lib/http-error.js';

const PACKAGE_COLUMNS = `
  id, code, name, description, price_amount, currency,
  is_active, sort_order, created_at, updated_at
`;

function toPackageDto(row, features = []) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    priceAmount: Number(row.price_amount),
    currency: row.currency,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    features,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function featuresByPackageIds(ids) {
  if (ids.length === 0) {
    return new Map();
  }
  const { rows } = await pool.query(
    `SELECT package_id, feature
     FROM package_features
     WHERE package_id = ANY($1::uuid[])
     ORDER BY sort_order ASC, created_at ASC`,
    [ids],
  );
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.package_id)) {
      map.set(row.package_id, []);
    }
    map.get(row.package_id).push(row.feature);
  }
  return map;
}

async function attachFeatures(packages) {
  const features = await featuresByPackageIds(packages.map((pkg) => pkg.id));
  for (const pkg of packages) {
    pkg.features = features.get(pkg.id) || [];
  }
  return packages;
}

export async function listActivePackages() {
  const { rows } = await pool.query(
    `SELECT ${PACKAGE_COLUMNS}
     FROM packages
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, created_at ASC`,
  );
  const packages = rows.map((row) => toPackageDto(row));
  return attachFeatures(packages);
}

export async function getPackageById(id) {
  const { rows } = await pool.query(
    `SELECT ${PACKAGE_COLUMNS} FROM packages WHERE id = $1`,
    [id],
  );
  if (rows.length === 0) {
    return null;
  }
  const [pkg] = await attachFeatures([toPackageDto(rows[0])]);
  return pkg;
}

export async function getActivePackageById(id) {
  const pkg = await getPackageById(id);
  if (!pkg || !pkg.isActive) {
    throw new HttpError(404, 'NOT_FOUND', 'Paket tidak ditemukan.');
  }
  return pkg;
}
