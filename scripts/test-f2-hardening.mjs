/* ==========================================================
    BERNADA.ID — TEST F2 HARDENING (Sprint 7 · Fase 2)
    ----------------------------------------------------------
    F2-01 JWT algorithm hardening (HS256 eksplisit)
    F2-02 Refresh token race (dua refresh konkuren, token sama)
    F2-03 Refresh token reuse detection (replay token bekas)
    F2-04 Invitation slug race (create slug sama konkuren)
    F2-05 Order idempotency race (idempotencyKey sama konkuren)
    F2-06 Duplicate pending payment race (payment konkuren)

    Prasyarat: server KODE BARU berjalan di :<config.port>,
    migrasi s.d. 0011 sudah diterapkan, DB sehat.

    Penggunaan:
      $env:PORT="3004"
      node --env-file-if-exists=.env scripts/test-f2-hardening.mjs
  ========================================================== */

import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { pool } from '../server/db.js';
import { config } from '../server/config.js';
import { signAccessToken, verifyAccessToken } from '../server/lib/jwt.js';

const BASE_URL = `http://localhost:${config.port}`;
const PASSWORD = 'F2-test-2026';

const results = [];
let passCount = 0;
let failCount = 0;

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (ok) passCount += 1;
  else failCount += 1;
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function doFetch(path, { method = 'GET', body, token, cookie } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cookie) headers.Cookie = `bernada_refresh=${cookie}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data, res };
}

async function api(path, opts) {
  let result = await doFetch(path, opts);
  if (result.status === 429) {
    console.log('  (rate limited — menunggu window 61s lalu retry...)');
    await new Promise((resolve) => setTimeout(resolve, 61_000));
    result = await doFetch(path, opts);
  }
  return result;
}

function extractRefreshToken(res) {
  const sc = res.headers.get('set-cookie') || '';
  const match = sc.match(/bernada_refresh=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function uniqueEmail(tag) {
  return `${tag}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@e2e-bernada.local`;
}

async function registerUser(tag) {
  const email = uniqueEmail(tag);
  const res = await api('/api/auth/register', {
    method: 'POST',
    body: { email, password: PASSWORD, fullName: `F2 ${tag}` },
  });
  if (res.status !== 200) {
    throw new Error(`register ${tag} gagal: HTTP ${res.status}`);
  }
  return {
    email,
    userId: res.data.user.id,
    accessToken: res.data.accessToken,
    refreshToken: extractRefreshToken(res.res),
  };
}

async function countUnrevoked(userId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS n FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL',
    [userId],
  );
  return rows[0].n;
}

async function isRevoked(token) {
  const { rows } = await pool.query(
    'SELECT revoked_at FROM refresh_tokens WHERE token_hash = $1',
    [sha256Hex(token)],
  );
  return rows.length > 0 && rows[0].revoked_at !== null;
}

async function cleanup(userIds) {
  if (userIds.length === 0) return;
  await pool.query(
    `DELETE FROM payments
      WHERE order_id IN (SELECT id FROM orders WHERE user_id = ANY($1))`,
    [userIds],
  );
  await pool.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);
}

// --- F2-01 ----------------------------------------------------------------
function testJwt() {
  const sub = '00000000-0000-0000-0000-000000000000';

  try {
    const token = signAccessToken({ sub });
    const payload = verifyAccessToken(token);
    record('F2-01 sign/verify round-trip HS256 (kompatibel)', payload.sub === sub, `sub=${payload.sub}`);
  } catch (error) {
    record('F2-01 sign/verify round-trip HS256 (kompatibel)', false, error.message);
  }

  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const noneToken = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub })}.`;
  try {
    verifyAccessToken(noneToken);
    record('F2-01 token alg "none" ditolak', false, 'tidak melempar error');
  } catch {
    record('F2-01 token alg "none" ditolak', true, 'throws');
  }

  const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const rsToken = jwt.sign({ sub }, privateKey, { algorithm: 'RS256' });
  try {
    verifyAccessToken(rsToken);
    record('F2-01 token alg "RS256" ditolak (hanya HS256)', false, 'tidak melempar error');
  } catch {
    record('F2-01 token alg "RS256" ditolak (hanya HS256)', true, 'throws');
  }
}

// --- F2-02 ----------------------------------------------------------------
async function testRefreshRace(userIds) {
  const x = await registerUser('f2race');
  userIds.push(x.userId);

  const races = await Promise.all([
    doFetch('/api/auth/refresh', { method: 'POST', cookie: x.refreshToken }),
    doFetch('/api/auth/refresh', { method: 'POST', cookie: x.refreshToken }),
  ]);
  const codes = races.map((r) => r.status).sort((a, b) => a - b);
  const n = await countUnrevoked(x.userId);
  record(
    'F2-02 refresh konkuren (token sama) → tepat satu 200 + satu 401',
    codes.length === 2 && codes[0] === 200 && codes[1] === 401,
    `codes=${codes.join(',')}`,
  );
  record(
    'F2-02 hanya satu token baru yang hidup dari satu token lama',
    n === 0,
    `unrevoked=${n}`,
  );
}

// --- F2-03 ----------------------------------------------------------------
async function testReuseDetection(userIds) {
  const y = await registerUser('f2reuse');
  userIds.push(y.userId);

  const first = await api('/api/auth/refresh', { method: 'POST', cookie: y.refreshToken });
  const newToken = first.status === 200 ? extractRefreshToken(first.res) : null;
  record(
    'F2-03 refresh normal → token baru (rotasi)',
    first.status === 200 && !!newToken && newToken !== y.refreshToken,
    `status=${first.status} rotated=${!!newToken && newToken !== y.refreshToken}`,
  );

  const replay = await api('/api/auth/refresh', { method: 'POST', cookie: y.refreshToken });
  record('F2-03 replay token bekas → 401', replay.status === 401, `status=${replay.status}`);

  const revokedNew = newToken ? await isRevoked(newToken) : null;
  record(
    'F2-03 family dicabut (token baru ikut di-revoke)',
    revokedNew === true,
    `newTokenRevoked=${revokedNew}`,
  );

  if (newToken) {
    const after = await api('/api/auth/refresh', { method: 'POST', cookie: newToken });
    record('F2-03 refresh dgn token family yg dicabut → 401', after.status === 401, `status=${after.status}`);
  }

  const z = await registerUser('f2unrelated');
  userIds.push(z.userId);
  const zRefresh = await api('/api/auth/refresh', { method: 'POST', cookie: z.refreshToken });
  record(
    'F2-03 sesi user lain tidak terganggu (refresh tetap 200)',
    zRefresh.status === 200,
    `status=${zRefresh.status}`,
  );
}

// --- F2-04 ----------------------------------------------------------------
async function testSlugRace(userIds) {
  const w = await registerUser('f2slug');
  userIds.push(w.userId);

  const slug = `f2-slug-${Date.now().toString(36)}`;
  const body = { title: 'F2 Slug Race', slug };
  const races = await Promise.all([
    doFetch('/api/invitations', { method: 'POST', token: w.accessToken, body }),
    doFetch('/api/invitations', { method: 'POST', token: w.accessToken, body }),
  ]);
  const codes = races.map((r) => r.status).sort((a, b) => a - b);
  const hasSlugTaken = races.some(
    (r) => r.status === 409 && r.data?.error?.code === 'SLUG_TAKEN',
  );
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS n FROM invitations WHERE slug = $1',
    [slug],
  );
  record(
    'F2-04 create slug sama konkuren → 201 + 409 SLUG_TAKEN',
    codes.length === 2 && codes[0] === 201 && codes[1] === 409 && hasSlugTaken,
    `codes=${codes.join(',')} slugTaken=${hasSlugTaken}`,
  );
  record('F2-04 hanya satu undangan tersimpan untuk slug tsb', rows[0].n === 1, `count=${rows[0].n}`);
}

// --- F2-05 ----------------------------------------------------------------
async function testOrderIdempotencyRace(userIds) {
  const a = await registerUser('f2idem');
  userIds.push(a.userId);

  const pkgRes = await api('/api/packages');
  const premium = pkgRes.data.packages.find((p) => p.code === 'premium');

  const idempotencyKey = `f2-idem-${Date.now()}`;
  const body = { packageId: premium.id, idempotencyKey };
  const races = await Promise.all([
    doFetch('/api/orders', { method: 'POST', token: a.accessToken, body }),
    doFetch('/api/orders', { method: 'POST', token: a.accessToken, body }),
  ]);
  const codes = races.map((r) => r.status).sort((a, b) => a - b);
  const orderIds = races.map((r) => r.data?.order?.id).filter(Boolean);
  const createdFlags = races.map((r) => r.data?.created);
  const sameOrder = orderIds.length === 2 && orderIds[0] === orderIds[1];
  const orderNumber = races[0]?.data?.order?.orderNumber || races[1]?.data?.order?.orderNumber;
  record(
    'F2-05 idempotencyKey sama konkuren → satu 201 + satu 200 (order sama)',
    codes.length === 2 && codes[0] === 200 && codes[1] === 201 && sameOrder,
    `codes=${codes.join(',')} created=${createdFlags.join(',')} sameOrder=${sameOrder}`,
  );
  record(
    'F2-05 format order_number tetap ORD-YYYYMMDD-XXXX (contract)',
    /^ORD-\d{8}-[0-9A-F]{4}$/.test(orderNumber || ''),
    `orderNumber=${orderNumber}`,
  );
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS n FROM orders WHERE idempotency_key = $1',
    [idempotencyKey],
  );
  record('F2-05 hanya satu order tersimpan untuk key tsb', rows[0].n === 1, `count=${rows[0].n}`);

  return { user: a, premium };
}

// --- F2-06 ----------------------------------------------------------------
async function testPaymentRace({ user, premium }) {
  const created = await api('/api/orders', {
    method: 'POST',
    token: user.accessToken,
    body: { packageId: premium.id, idempotencyKey: `f2-pay-${Date.now()}` },
  });
  const orderId = created.data.order.id;

  const races = await Promise.all([
    doFetch(`/api/orders/${orderId}/payment`, { method: 'POST', token: user.accessToken }),
    doFetch(`/api/orders/${orderId}/payment`, { method: 'POST', token: user.accessToken }),
  ]);
  const codes = races.map((r) => r.status).sort((a, b) => a - b);
  const payIds = races.map((r) => r.data?.payment?.id).filter(Boolean);
  const samePayment = payIds.length === 2 && payIds[0] === payIds[1];
  record(
    'F2-06 payment konkuren → satu 201 + satu 200 (payment sama)',
    codes.length === 2 && codes[0] === 200 && codes[1] === 201 && samePayment,
    `codes=${codes.join(',')} samePayment=${samePayment}`,
  );
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS n FROM payments
      WHERE order_id = $1 AND status = 'pending'`,
    [orderId],
  );
  record('F2-06 hanya satu payment pending per order', rows[0].n === 1, `count=${rows[0].n}`);
  const orderRes = await api(`/api/orders/${orderId}`, { token: user.accessToken });
  record(
    'F2-06 order berubah menjadi awaiting_payment',
    orderRes.data?.order?.status === 'awaiting_payment',
    `status=${orderRes.data?.order?.status}`,
  );
}

// --- main -------------------------------------------------------------------
async function run() {
  const userIds = [];

  const health = await api('/api/health');
  record(
    'Health check (DB connected)',
    health.status === 200 && health.data?.status === 'ok' && health.data?.database === 'connected',
    `status=${health.status} db=${health.data?.database}`,
  );

  testJwt();

  await testRefreshRace(userIds);
  await testReuseDetection(userIds);
  await testSlugRace(userIds);
  const { user, premium } = await testOrderIdempotencyRace(userIds);
  await testPaymentRace({ user, premium });

  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { email: user.email, password: PASSWORD },
  });
  const me = login.status === 200
    ? await api('/api/auth/me', { token: login.data.accessToken })
    : { status: 0 };
  record('sanity: login + /auth/me (auth regression)', login.status === 200 && me.status === 200, `login=${login.status} me=${me.status}`);
  const tpl = await api('/api/templates');
  record('sanity: /api/templates (regression)', tpl.status === 200 && Array.isArray(tpl.data?.templates), `status=${tpl.status}`);

  await cleanup(userIds);
  await pool.end();
}

async function main() {
  try {
    await run();
  } catch (error) {
    record('TEST F2 (unexpected error)', false, `${error.message}`);
  }

  console.log(`\n=== TEST F2 HARDENING — ${passCount}/${passCount + failCount} PASS ===\n`);
  for (const r of results) {
    const icon = r.ok ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon}  ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  console.log(`\nTotal: ${passCount} PASS · ${failCount} FAIL`);
  process.exit(failCount > 0 ? 1 : 0);
}

main();
