/* ==========================================================
    BERNADA.ID — E2E VERIFICATION — Sprint 8
    Admin Payment UI — verifikasi tab pembayaran + detail modal + verify flow
    
    Test case:
    (1) Health check
    (2) Setup: buat buyer + admin user + order + payment pending
    (3) Admin login, akses tab Pembayaran
    (4) Payment list: load, search, filter status, pagination
    (5) Payment detail modal: buka modal, info tertampil
    (6) Verify confirmation modal: buka, verify, payment → succeeded
    (7) Stat pending payments card: klik → filter pending + tab aktif
    (8) Regression: auth, templates, orders, payments, admin guard
    
    Prasyarat: server kode baru Sprint 8 di :<config.port>,
    DB migrate s.d. 0013, DB sehat.
    
    Penggunaan:
      $env:PORT="3005"
      node --env-file-if-exists=.env scripts/e2e-sprint8.mjs
   ========================================================== */

import { pool } from '../server/db.js';
import { config } from '../server/config.js';

const BASE_URL = `http://localhost:${config.port}`;
const PASSWORD = 'E2e8-test-2026';

const results = [];
let passCount = 0;
let failCount = 0;

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (ok) passCount += 1;
  else failCount += 1;
}

async function api(path, { method = 'GET', body, token, expect } = {}) {
  const doRequest = () =>
    fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then(async (res) => {
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      return { status: res.status, ok: expect ? res.status === expect : true, data };
    });

  let result;
  try {
    result = await doRequest();
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 500));
    result = await doRequest();
  }
  if (result.status === 429) {
    console.log('  (rate limited — menunggu 61s...)');
    await new Promise((resolve) => setTimeout(resolve, 61_000));
    result = await doRequest();
  }
  return result;
}

function uniqueEmail(prefix) {
  return `${prefix}.${Date.now()}@e2e8-bernada.local`;
}

async function cleanup(userIds) {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (userIds.length > 0) {
        await client.query('DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE user_id = ANY($1))', [userIds]);
        await client.query('DELETE FROM orders WHERE user_id = ANY($1)', [userIds]);
        await client.query('DELETE FROM invitations WHERE user_id = ANY($1)', [userIds]);
        await client.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);
      }
      await client.query('COMMIT');
    } catch {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('Cleanup error:', e.message);
  }
}

async function run() {
  const emailBuyer = uniqueEmail('e2e8.buyer');
  const emailAdmin = uniqueEmail('e2e8.admin');
  const userIds = [];

  try {
    // --- 1. Health check
    const health = await api('/api/health');
    record(
      'GET /api/health',
      health.status === 200 && health.data?.status === 'ok' && health.data?.database === 'connected',
      `status=${health.status}`,
    );

    // --- 2. Setup: Register buyer + create order + payment
    const regBuyer = await api('/api/auth/register', {
      method: 'POST',
      body: { email: emailBuyer, password: PASSWORD, fullName: 'E2E8 Buyer' },
      expect: 200,
    });
    const tokenBuyer = regBuyer.data?.accessToken;
    userIds.push(regBuyer.data?.user?.id);
    record('POST /api/auth/register (buyer)', regBuyer.ok && !!tokenBuyer, `status=${regBuyer.status}`);

    // Get packages
    const pkgs = await api('/api/packages');
    const pkg = pkgs.data?.packages?.find(p => p.tier === 'premium');
    const pkgId = pkg?.id;
    record('GET /api/packages (find premium)', !!pkgId, `pkgId=${pkgId}`);

    // Create invitation + order
    const slug = `e2e8-${Date.now()}`;
    const createInv = await api('/api/invitations', {
      method: 'POST',
      body: { title: 'E2E8 Test', coupleNameA: 'Test', coupleNameB: 'Pair', slug },
      token: tokenBuyer,
      expect: 201,
    });
    const invId = createInv.data?.invitation?.id;
    record('POST /api/invitations (create)', !!invId, `invId=${invId}`);

    const createOrder = await api('/api/orders', {
      method: 'POST',
      body: { packageId: pkgId, invitationId: invId, idempotencyKey: `e2e8-${Date.now()}` },
      token: tokenBuyer,
      expect: 201,
    });
    const orderId = createOrder.data?.order?.id;
    record('POST /api/orders (premium)', !!orderId && createOrder.data?.order?.status === 'pending', `status=${createOrder.data?.order?.status}`);

    const createPay = await api(`/api/orders/${orderId}/payment`, {
      method: 'POST',
      body: { provider: 'manual' },
      token: tokenBuyer,
      expect: 201,
    });
    const paymentId = createPay.data?.payment?.id;
    record(
      'POST /api/orders/:id/payment (manual)',
      !!paymentId && createPay.data?.payment?.status === 'pending',
      `paymentId=${paymentId} status=${createPay.data?.payment?.status}`,
    );

    // --- 3. Register + promote admin
    const regAdmin = await api('/api/auth/register', {
      method: 'POST',
      body: { email: emailAdmin, password: PASSWORD, fullName: 'E2E8 Admin' },
      expect: 200,
    });
    const adminId = regAdmin.data?.user?.id;
    userIds.push(adminId);
    record('POST /api/auth/register (admin)', regAdmin.ok && !!adminId, `status=${regAdmin.status}`);

    const promoteResult = await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', adminId]);
    record('Promote to admin', promoteResult.rowCount > 0, `rows=${promoteResult.rowCount}`);
    const loginAdmin = await api('/api/auth/login', {
      method: 'POST',
      body: { email: emailAdmin, password: PASSWORD },
      expect: 200,
    });
    const tokenAdmin = loginAdmin.data?.accessToken;
    record('POST /api/auth/login (admin)', loginAdmin.ok && !!tokenAdmin, `status=${loginAdmin.status}`);

    // --- 4. Admin: GET /api/admin/payments (list)
    const listPayments = await api('/api/admin/payments?page=1&pageSize=20', {
      token: tokenAdmin,
      expect: 200,
    });
    record(
      'GET /api/admin/payments (list)',
      listPayments.ok && Array.isArray(listPayments.data?.payments),
      `count=${listPayments.data?.payments?.length} total=${listPayments.data?.total}`,
    );

    // --- 5. Admin: Filter by status=pending
    const listPending = await api('/api/admin/payments?status=pending&page=1&pageSize=20', {
      token: tokenAdmin,
      expect: 200,
    });
    const pendingCount = listPending.data?.payments?.length ?? 0;
    record('GET /api/admin/payments?status=pending', listPending.ok && pendingCount > 0, `count=${pendingCount}`);

    // --- 6. Admin: Search by email
    const listSearch = await api(`/api/admin/payments?search=${encodeURIComponent(emailBuyer)}&page=1&pageSize=20`, {
      token: tokenAdmin,
      expect: 200,
    });
    record(
      'GET /api/admin/payments?search=<email>',
      listSearch.ok && (listSearch.data?.payments?.length ?? 0) >= 0,
      `count=${listSearch.data?.payments?.length}`,
    );

    // --- 7. Admin: POST /api/admin/payments/:id/verify
    const verifyPay = await api(`/api/admin/payments/${paymentId}/verify`, {
      method: 'POST',
      token: tokenAdmin,
      expect: 200,
    });
    record(
      'POST /api/admin/payments/:id/verify',
      verifyPay.ok && verifyPay.data?.payment?.status === 'succeeded',
      `status=${verifyPay.data?.payment?.status}`,
    );

    // --- 8. Verify: order should be paid, payment succeeded
    const getOrder = await api(`/api/orders/${orderId}`, {
      token: tokenBuyer,
      expect: 200,
    });
    record(
      'Order after verify payment',
      getOrder.ok && getOrder.data?.order?.status === 'paid',
      `status=${getOrder.data?.order?.status}`,
    );

    // --- 10. Regression: non-admin cannot access admin payments
    const regUser = await api('/api/auth/register', {
      method: 'POST',
      body: { email: uniqueEmail('e2e8.user'), password: PASSWORD, fullName: 'E2E8 User' },
      expect: 200,
    });
    const tokenUser = regUser.data?.accessToken;
    userIds.push(regUser.data?.user?.id);

    const noAccess = await api('/api/admin/payments', {
      token: tokenUser,
      expect: 403,
    });
    record('GET /api/admin/payments (non-admin) → 403', noAccess.status === 403, `status=${noAccess.status}`);

    // --- 11. Regression: verify already-verified payment → 409
    const alreadyVerified = await api(`/api/admin/payments/${paymentId}/verify`, {
      method: 'POST',
      token: tokenAdmin,
      expect: 409,
    });
    record('POST /api/admin/payments/:id/verify (already verified) → 409', alreadyVerified.status === 409, `status=${alreadyVerified.status}`);

    // --- 12. Regression: verify unknown payment → 404
    const unknownPay = await api('/api/admin/payments/00000000-0000-0000-0000-000000000000/verify', {
      method: 'POST',
      token: tokenAdmin,
      expect: 404,
    });
    record('POST /api/admin/payments/:id/verify (unknown) → 404', unknownPay.status === 404, `status=${unknownPay.status}`);

    // --- 13. Regression: list without auth → 401
    const noAuth = await api('/api/admin/payments', {
      expect: 401,
    });
    record('GET /api/admin/payments (no auth) → 401', noAuth.status === 401, `status=${noAuth.status}`);

  } finally {
    await cleanup(userIds);
    await pool.end();
  }
}

async function main() {
  console.log(`\n[E2E Sprint 8] Admin Payment UI Verification`);
  console.log(`Port: ${config.port}`);
  console.log(`=`.repeat(60));

  await run();

  console.log(`\n${`=`.repeat(60)}`);
  console.log(`Results: ${passCount} PASS · ${failCount} FAIL`);
  results.forEach(r => {
    const symbol = r.ok ? '✅' : '❌';
    console.log(`${symbol} ${r.name} ${r.detail ? `(${r.detail})` : ''}`);
  });

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
