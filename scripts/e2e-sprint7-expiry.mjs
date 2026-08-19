/* ==========================================================
    BERNADA.ID — E2E VERIFICATION — Sprint 7 · Fase 4 (F2-08)
    Verifikasi mekanisme ORDER EXPIRY (lazy + deterministik):
    (1) expires_at ditetapkan saat order dibuat (konsisten)
    (2) transisi pending/awaiting_payment → expired
    (3) order expired TIDAK bisa: dibuatkan payment, diverifikasi
        admin menjadi paid, dibatalkan (409)
    (4) order terminal (paid/cancelled) TIDAK ter-expriy
    (5) boundary: order belum kedaluwarsa tetap bisa diverifikasi
    (6) admin list payments menampilkan order_status expired

    Prasyarat: server KODE BARU (Fase 4) di :<config.port>,
    DB migrate s.d. 0011, DB sehat.

    Penggunaan:
      $env:PORT="3004"
      node --env-file-if-exists=.env scripts/e2e-sprint7-expiry.mjs
  ========================================================== */

import { execSync } from 'node:child_process';
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
    // Transient network error — retry sekali dengan koneksi baru.
    await new Promise((resolve) => setTimeout(resolve, 500));
    result = await doRequest();
  }
  if (result.status === 429) {
    console.log('  (rate limited — menunggu window 61s lalu retry...)');
    await new Promise((resolve) => setTimeout(resolve, 61_000));
    result = await doRequest();
  }
  return result;
}

function uniqueEmail(prefix) {
  return `${prefix}.${Date.now()}@e2e-bernada.local`;
}

async function forceExpired(orderId) {
  await pool.query(
    `UPDATE orders SET expires_at = NOW() - interval '1 second' WHERE id = $1`,
    [orderId],
  );
}

async function run() {
  const emailBuyer = uniqueEmail('e2e8.buyer');
  const emailAdmin = uniqueEmail('e2e8.admin');
  const userIds = [];

  // --- 1. Health check -----------------------------------------------------
  const health = await api('/api/health');
  record(
    'GET /api/health (DB connected)',
    health.status === 200 && health.data?.status === 'ok' && health.data?.database === 'connected',
    `status=${health.status} database=${health.data?.database}`,
  );

  // --- Register buyer + admin ---------------------------------------------
  const regBuyer = await api('/api/auth/register', {
    method: 'POST',
    body: { email: emailBuyer, password: PASSWORD, fullName: 'E2E8 Buyer' },
    expect: 200,
  });
  const tokenA = regBuyer.data?.accessToken;
  userIds.push(regBuyer.data.user.id);
  record('POST /api/auth/register (buyer)', regBuyer.ok && !!tokenA, `status=${regBuyer.status}`);

  const regAdmin = await api('/api/auth/register', {
    method: 'POST',
    body: { email: emailAdmin, password: PASSWORD, fullName: 'E2E8 Admin Candidate' },
    expect: 200,
  });
  userIds.push(regAdmin.data.user.id);
  try {
    execSync(`npm run admin:promote -- "${emailAdmin}"`, { stdio: 'pipe', cwd: process.cwd() });
  } catch {
    /* promotion dianggap gagal — test verify non-admin tetap berjalan */
  }
  const loginAdmin = await api('/api/auth/login', {
    method: 'POST',
    body: { email: emailAdmin, password: PASSWORD },
    expect: 200,
  });
  const tokenC = loginAdmin.data?.accessToken;

  const packages = await api('/api/packages');
  const pkgList = packages.data?.packages ?? [];
  const premium = pkgList.find((p) => p.code === 'premium');
  const basicPkg = pkgList.find((p) => p.code === 'basic');

  // --- 2. Order dibuat: pending + expires_at future (F2-08 konsisten) --------
  const order1 = await api('/api/orders', {
    method: 'POST',
    token: tokenA,
    body: { packageId: premium.id, idempotencyKey: `s8-o1-${Date.now()}` },
    expect: 201,
  });
  const order1Id = order1.data?.order?.id;
  const expA = order1.data?.order?.expiresAt;
  record(
    'F2-08 order dibuat → pending + expires_at masa depan',
    order1.ok && order1.data?.order?.status === 'pending'
      && !!expA && new Date(expA).getTime() > Date.now(),
    `status=${order1.data?.order?.status} expiresAt=${expA}`,
  );

  // --- 3. Payment → awaiting_payment, expires_at tidak berubah ------------------
  const pay1 = await api(`/api/orders/${order1Id}/payment`, {
    method: 'POST',
    token: tokenA,
    expect: 201,
  });
  const payment1 = pay1.data?.payment;
  const order1After = await api(`/api/orders/${order1Id}`, { token: tokenA });
  record(
    'F2-08 payment → awaiting_payment, expires_at tetap',
    pay1.ok && payment1?.status === 'pending'
      && order1After.data?.order?.status === 'awaiting_payment'
      && order1After.data?.order?.expiresAt === expA,
    `order=${order1After.data?.order?.status} expSame=${order1After.data?.order?.expiresAt === expA}`,
  );

  // --- 4. Boundary: belum kedaluwarsa → verify TETAP berhasil (tidak premature) ---
  const verify1 = await api(`/api/admin/payments/${payment1.id}/verify`, {
    method: 'POST',
    token: tokenC,
    expect: 200,
  });
  record(
    'Boundary: order belum expired → admin verify 200 paid',
    verify1.ok && verify1.data?.payment?.status === 'succeeded' && verify1.data?.order?.status === 'paid',
    `pay=${verify1.data?.payment?.status} order=${verify1.data?.order?.status}`,
  );

  // --- 5. Lazy expiry: awaiting_payment kedaluwarsa → expired --------------------
  const order2 = await api('/api/orders', {
    method: 'POST',
    token: tokenA,
    body: { packageId: premium.id, idempotencyKey: `s8-o2-${Date.now()}` },
    expect: 201,
  });
  const order2Id = order2.data?.order?.id;
  const pay2 = await api(`/api/orders/${order2Id}/payment`, {
    method: 'POST',
    token: tokenA,
    expect: 201,
  });
  const payment2 = pay2.data?.payment;
  await forceExpired(order2Id);
  const order2Get = await api(`/api/orders/${order2Id}`, { token: tokenA });
  record(
    'F2-08 awaiting_payment kedaluwarsa → GET order status expired',
    order2Get.data?.order?.status === 'expired',
    `status=${order2Get.data?.order?.status}`,
  );

  // --- 6. Payment pending ikut expired --------------------------------------------
  const pay2Get = await api(`/api/orders/${order2Id}/payment`, { token: tokenA });
  record(
    'F2-08 payment pending order expired → status expired',
    pay2Get.data?.payment?.status === 'expired',
    `status=${pay2Get.data?.payment?.status}`,
  );

  // --- 7. Expired order: tidak bisa dibuatkan payment baru ---------------------------
  const pay2New = await api(`/api/orders/${order2Id}/payment`, {
    method: 'POST',
    token: tokenA,
    expect: 409,
  });
  record(
    'F2-08 expired order → POST payment 409 ORDER_STATUS_CONFLICT',
    pay2New.ok && pay2New.data?.error?.code === 'ORDER_STATUS_CONFLICT',
    `code=${pay2New.data?.error?.code}`,
  );

  // --- 8. Expired order: tidak bisa dibatalkan ----------------------------------------
  const cancel2 = await api(`/api/orders/${order2Id}/cancel`, {
    method: 'POST',
    token: tokenA,
    expect: 409,
  });
  record(
    'F2-08 expired order → cancel 409 ORDER_STATUS_CONFLICT',
    cancel2.ok && cancel2.data?.error?.code === 'ORDER_STATUS_CONFLICT',
    `code=${cancel2.data?.error?.code}`,
  );

  // --- 9. Expired order: payment-nya tidak bisa diverifikasi ----------------------------
  const verify2 = await api(`/api/admin/payments/${payment2.id}/verify`, {
    method: 'POST',
    token: tokenC,
    expect: 409,
  });
  record(
    'F2-08 expired order → admin verify 409 (payment sudah expired)',
    verify2.ok && verify2.data?.error?.code === 'PAYMENT_STATUS_CONFLICT',
    `code=${verify2.data?.error?.code}`,
  );

  // --- 10. Verify mendeteksi expiry di dalam transaksi (tanpa lazy dulu) ----------------
  const order3 = await api('/api/orders', {
    method: 'POST',
    token: tokenA,
    body: { packageId: premium.id, idempotencyKey: `s8-o3-${Date.now()}` },
    expect: 201,
  });
  const order3Id = order3.data?.order?.id;
  const pay3 = await api(`/api/orders/${order3Id}/payment`, {
    method: 'POST',
    token: tokenA,
    expect: 201,
  });
  const payment3 = pay3.data?.payment;
  await forceExpired(order3Id);
  const verify3 = await api(`/api/admin/payments/${payment3.id}/verify`, {
    method: 'POST',
    token: tokenC,
    expect: 409,
  });
  const order3Get = await api(`/api/orders/${order3Id}`, { token: tokenA });
  const pay3Get = await api(`/api/orders/${order3Id}/payment`, { token: tokenA });
  record(
    'F2-08 verify deteksi expiry (in-transaction) → 409 + order/payment jadi expired',
    verify3.ok && verify3.data?.error?.code === 'ORDER_STATUS_CONFLICT'
      && order3Get.data?.order?.status === 'expired'
      && pay3Get.data?.payment?.status === 'expired',
    `code=${verify3.data?.error?.code} order=${order3Get.data?.order?.status} pay=${pay3Get.data?.payment?.status}`,
  );

  // --- 11. Order pending (tanpa payment) kedaluwarsa juga → expired ------------------------
  const order4 = await api('/api/orders', {
    method: 'POST',
    token: tokenA,
    body: { packageId: premium.id, idempotencyKey: `s8-o4-${Date.now()}` },
    expect: 201,
  });
  const order4Id = order4.data?.order?.id;
  await forceExpired(order4Id);
  const order4Get = await api(`/api/orders/${order4Id}`, { token: tokenA });
  record(
    'F2-08 order pending kedaluwarsa → GET order status expired',
    order4Get.data?.order?.status === 'expired',
    `status=${order4Get.data?.order?.status}`,
  );

  // --- 12. Order PAID tidak boleh ter-expriy -----------------------------------------------
  const order5 = await api('/api/orders', {
    method: 'POST',
    token: tokenA,
    body: { packageId: basicPkg.id, idempotencyKey: `s8-o5-${Date.now()}` },
    expect: 201,
  });
  const order5Id = order5.data?.order?.id;
  const pay5 = await api(`/api/orders/${order5Id}/payment`, { method: 'POST', token: tokenA, expect: 201 });
  if (pay5.data?.payment?.id) {
    await api(`/api/admin/payments/${pay5.data.payment.id}/verify`, { method: 'POST', token: tokenC, expect: 200 });
  }
  await forceExpired(order5Id);
  const order5Get = await api(`/api/orders/${order5Id}`, { token: tokenA });
  const order5Status = order5Get.data?.order?.status;
  record(
    'F2-08 order paid TIDAK ter-expriy (status tetap paid)',
    order5Status === 'paid',
    `status=${order5Status}`,
  );

  // --- 13. Order CANCELLED tidak boleh ter-expriy ---------------------------------------------
  const order6 = await api('/api/orders', {
    method: 'POST',
    token: tokenA,
    body: { packageId: premium.id, idempotencyKey: `s8-o6-${Date.now()}` },
    expect: 201,
  });
  const order6Id = order6.data?.order?.id;
  const cancel6 = await api(`/api/orders/${order6Id}/cancel`, {
    method: 'POST',
    token: tokenA,
    expect: 200,
  });
  await forceExpired(order6Id);
  const order6Get = await api(`/api/orders/${order6Id}`, { token: tokenA });
  record(
    'F2-08 order cancelled TIDAK ter-expriy (status tetap cancelled)',
    cancel6.ok && order6Get.data?.order?.status === 'cancelled',
    `status=${order6Get.data?.order?.status}`,
  );

  // --- 14. Admin list payments menampilkan order_status expired (sweep) ----------------------
  const payList = await api('/api/admin/payments', { token: tokenC, expect: 200 });
  const expiredShown = payList.data?.payments?.some(
    (p) => p.id === payment2.id && p.order?.status === 'expired',
  );
  record(
    'F2-08 GET /api/admin/payments → order_status expired tampil (sweep)',
    payList.ok && expiredShown,
    `shown=${expiredShown}`,
  );

  // --- Cleanup -----------------------------------------------------------------------------
  await pool.query(
    `DELETE FROM payments
      WHERE order_id IN (SELECT id FROM orders WHERE user_id = ANY($1))`,
    [userIds],
  );
  await pool.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);
  await pool.end();
}

async function main() {
  try {
    await run();
  } catch (error) {
    record('SKRIP E2E FASE 4 (unexpected error)', false, `${error.message}`);
  }

  console.log(`\n=== E2E SPRINT 7 FASE 4 (F2-08 EXPIRY) — ${passCount}/${passCount + failCount} PASS ===\n`);
  for (const r of results) {
    const icon = r.ok ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon}  ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  console.log(`\nTotal: ${passCount} PASS · ${failCount} FAIL`);
  process.exit(failCount > 0 ? 1 : 0);
}

main();
