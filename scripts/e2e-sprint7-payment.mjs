/* ==========================================================
    BERNADA.ID — E2E VERIFICATION — Sprint 7 · Fase 3
    Verifikasi lintasan pembayaran & entitlement:
    (1) Order premium + payment pending (boundary manual)
    (2) Verifikasi pembayaran manual via admin (keputusan #6 S6)
    (3) F2-07: entitlement invitations.package_id saat order paid
        (jalur admin verify + jalur free auto-paid)
    (4) Guard error (401 non-admin, 409 double verify, 404 unknown)
    (5) Regression ringkas (auth, order, payment, invitation)

    Prasyarat: server KODE BARU (Fase 3) di :<config.port>,
    DB migrate s.d. 0011, DB sehat.

    Penggunaan:
      $env:PORT="3004"
      node --env-file-if-exists=.env scripts/e2e-sprint7-payment.mjs
  ========================================================== */

import { execSync } from 'node:child_process';
import { pool } from '../server/db.js';
import { config } from '../server/config.js';

const BASE_URL = `http://localhost:${config.port}`;
const PASSWORD = 'E2e7-test-2026';

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
    // Transient network error (mis. keep-alive reset) — retry sekali dengan koneksi baru.
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

async function run() {
  const emailA = uniqueEmail('e2e7.buyer');
  const emailB = uniqueEmail('e2e7.user');
  const emailC = uniqueEmail('e2e7.admin');
  const userIds = [];

  // --- 1. Health check -----------------------------------------------------
  const health = await api('/api/health');
  record(
    'GET /api/health',
    health.status === 200 && health.data?.status === 'ok' && health.data?.database === 'connected',
    `status=${health.status} database=${health.data?.database}`,
  );

  // --- 2. Register buyer + ambil paket --------------------------------------
  const regA = await api('/api/auth/register', {
    method: 'POST',
    body: { email: emailA, password: PASSWORD, fullName: 'E2E7 Buyer' },
    expect: 200,
  });
  const tokenA = regA.data?.accessToken;
  userIds.push(regA.data.user.id);
  record('POST /api/auth/register (buyer)', regA.ok && !!tokenA, `status=${regA.status}`);

  const packages = await api('/api/packages');
  const pkgList = packages.data?.packages ?? [];
  const premium = pkgList.find((p) => p.code === 'premium');
  const freePkg = pkgList.find((p) => p.code === 'free');

  // --- 3. Buat undangan (packageId null, status draft) ------------------------
  const slugA = `s7-${Date.now().toString(36)}`;
  const templates = await api('/api/templates');
  const invA = await api('/api/invitations', {
    method: 'POST',
    token: tokenA,
    body: {
      title: 'E2E7 Entitlement Verification',
      slug: slugA,
      templateId: templates.data.templates[0].id,
      eventDate: '2026-12-25',
      eventTime: '09:00',
      venue: 'Gedung E2E7',
      location: 'Jakarta',
      couple: 'E2E7 & Test',
    },
    expect: 201,
  });
  const invAId = invA.data?.invitation?.id;
  record(
    'POST /api/invitations (draft, packageId null)',
    invA.ok && invA.data?.invitation?.status === 'draft' && invA.data?.invitation?.packageId === null,
    `status=${invA.data?.invitation?.status} packageId=${invA.data?.invitation?.packageId}`,
  );

  // --- 4. Order premium terkait undangan (pending, server amount) ---------------
  const orderA = await api('/api/orders', {
    method: 'POST',
    token: tokenA,
    body: { packageId: premium.id, invitationId: invAId, idempotencyKey: `s7-key-${Date.now()}` },
    expect: 201,
  });
  const orderAId = orderA.data?.order?.id;
  record(
    'POST /api/orders (premium + invitation → pending, invitationId tersimpan)',
    orderA.ok && orderA.data?.order?.status === 'pending'
      && orderA.data?.order?.invitationId === invAId
      && orderA.data?.order?.package?.code === 'premium',
    `status=${orderA.data?.order?.status} inv=${orderA.data?.order?.invitationId}`,
  );

  // --- 5. Payment pending (boundary manual) → awaiting_payment -------------------
  const payA = await api(`/api/orders/${orderAId}/payment`, {
    method: 'POST',
    token: tokenA,
    expect: 201,
  });
  const paymentA = payA.data?.payment;
  record(
    'POST payment (manual → pending) + order awaiting_payment',
    payA.ok && payA.data?.created === true && paymentA?.status === 'pending'
      && (await api(`/api/orders/${orderAId}`, { token: tokenA })).data?.order?.status === 'awaiting_payment',
    `status=${paymentA?.status} provider=${paymentA?.provider}`,
  );

  // --- 6. Verifikasi tanpa token → 401, user NON-admin → 403 -------------------------
  const verifyNoAuth = await api(`/api/admin/payments/${paymentA.id}/verify`, {
    method: 'POST',
    expect: 401,
  });
  record('POST verify (tanpa token → 401)', verifyNoAuth.ok, `status=${verifyNoAuth.status}`);

  const regB = await api('/api/auth/register', {
    method: 'POST',
    body: { email: emailB, password: PASSWORD, fullName: 'E2E7 NonAdmin' },
    expect: 200,
  });
  const tokenB = regB.data?.accessToken;
  userIds.push(regB.data.user.id);
  const verifyAnon = await api(`/api/admin/payments/${paymentA.id}/verify`, {
    method: 'POST',
    token: tokenB,
    expect: 403,
  });
  record(
    'POST /api/admin/payments/:id/verify (non-admin → 403 FORBIDDEN)',
    verifyAnon.ok && verifyAnon.data?.error?.code === 'FORBIDDEN',
    `status=${verifyAnon.status} code=${verifyAnon.data?.error?.code}`,
  );

  // --- 7. Admin verify → paid + entitlement package_id ----------------------------
  const regC = await api('/api/auth/register', {
    method: 'POST',
    body: { email: emailC, password: PASSWORD, fullName: 'E2E7 Admin Candidate' },
    expect: 200,
  });
  userIds.push(regC.data.user.id);
  let promoted = false;
  try {
    execSync(`npm run admin:promote -- "${emailC}"`, { stdio: 'pipe', cwd: process.cwd() });
    promoted = true;
  } catch {
    promoted = false;
  }
  const loginC = await api('/api/auth/login', {
    method: 'POST',
    body: { email: emailC, password: PASSWORD },
    expect: 200,
  });
  const tokenC = loginC.data?.accessToken;

  const verify = await api(`/api/admin/payments/${paymentA.id}/verify`, {
    method: 'POST',
    token: tokenC,
    expect: 200,
  });
  const verifyOk = verify.ok
    && verify.data?.payment?.status === 'succeeded'
    && !!verify.data?.payment?.paidAt
    && verify.data?.order?.status === 'paid'
    && !!verify.data?.order?.paidAt;
  record(
    'Admin verify → payment succeeded + order paid (atomik)',
    verifyOk,
    `pay=${verify.data?.payment?.status} order=${verify.data?.order?.status}`,
  );

  // --- 8. Entitlement: undangan packageId = premium -------------------------------
  const invAfterVerify = await api(`/api/invitations/${invAId}`, { token: tokenA });
  const entitlement = verify.data?.entitlement;
  record(
    'F2-07 entitlement → invitation.packageId = premium (status tetap)',
    entitlement?.invitationId === invAId
      && entitlement?.packageId === premium.id
      && invAfterVerify.data?.invitation?.packageId === premium.id
      && invAfterVerify.data?.invitation?.status === 'draft',
    `packageId=${invAfterVerify.data?.invitation?.packageId} status=${invAfterVerify.data?.invitation?.status}`,
  );

  // --- 9. Double verify → 409 PAYMENT_STATUS_CONFLICT ------------------------------
  const verify2 = await api(`/api/admin/payments/${paymentA.id}/verify`, {
    method: 'POST',
    token: tokenC,
    expect: 409,
  });
  record(
    'POST verify ulang → 409 PAYMENT_STATUS_CONFLICT',
    verify2.ok && verify2.data?.error?.code === 'PAYMENT_STATUS_CONFLICT',
    `status=${verify2.status} code=${verify2.data?.error?.code}`,
  );

  // --- 10. Verify payment tidak ada → 404 -------------------------------------------
  const verify404 = await api('/api/admin/payments/00000000-0000-0000-0000-000000000000/verify', {
    method: 'POST',
    token: tokenC,
    expect: 404,
  });
  record('POST verify (payment tidak ada → 404)', verify404.ok && verify404.data?.error?.code === 'NOT_FOUND', `status=${verify404.status}`);

  // --- 11. Entitlement jalur free auto-paid (tanpa admin) ---------------------------
  const slugFree = `s7-free-${Date.now().toString(36)}`;
  const invFree = await api('/api/invitations', {
    method: 'POST',
    token: tokenA,
    body: { title: 'E2E7 Free Entitlement', slug: slugFree, templateId: templates.data.templates[0].id },
    expect: 201,
  });
  const invFreeId = invFree.data?.invitation?.id;
  const orderFree = await api('/api/orders', {
    method: 'POST',
    token: tokenA,
    body: { packageId: freePkg.id, invitationId: invFreeId, idempotencyKey: `s7-free-${Date.now()}` },
    expect: 201,
  });
  const invAfterFree = await api(`/api/invitations/${invFreeId}`, { token: tokenA });
  record(
    'F2-07 free auto-paid → invitation.packageId = free (tanpa admin)',
    orderFree.ok && orderFree.data?.order?.status === 'paid'
      && invAfterFree.data?.invitation?.packageId === freePkg.id,
    `orderStatus=${orderFree.data?.order?.status} packageId=${invAfterFree.data?.invitation?.packageId}`,
  );

  // --- 12. Admin list payments (filter & konten) --------------------------------------
  const payList = await api('/api/admin/payments', { token: tokenC, expect: 200 });
  const found = payList.data?.payments?.some((p) => p.id === paymentA.id && p.status === 'succeeded' && p.order?.orderNumber);
  const payListPending = await api('/api/admin/payments?status=pending', { token: tokenC, expect: 200 });
  const pendingNotInclude = !payListPending.data?.payments?.some((p) => p.id === paymentA.id);
  record(
    'GET /api/admin/payments (list + filter status)',
    payList.ok && found && Array.isArray(payListPending.data?.payments) && pendingNotInclude,
    `status=${payList.status} found=${found} pendingExcluded=${pendingNotInclude}`,
  );

  // --- 13. Regression: order paid tidak bisa dibuatkan payment lagi -------------------
  const payPaid = await api(`/api/orders/${orderAId}/payment`, {
    method: 'POST',
    token: tokenA,
    expect: 409,
  });
  record(
    'Regression: order paid → payment 409 ALREADY_PAID',
    payPaid.ok && payPaid.data?.error?.code === 'ALREADY_PAID',
    `status=${payPaid.status} code=${payPaid.data?.error?.code}`,
  );

  // --- 14. Regression: admin stats masih sehat ----------------------------------------
  const stats = await api('/api/admin/stats', { token: tokenC, expect: 200 });
  record('Regression: GET /api/admin/stats (admin → 200)', stats.ok, `status=${stats.status}`);

  // --- Cleanup: payments dulu (FK RESTRICT), lalu users (cascade orders/invitations) ---
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
    record('SKRIP E2E FASE 3 (unexpected error)', false, `${error.message}`);
  }

  console.log(`\n=== E2E SPRINT 7 FASE 3 — ${passCount}/${passCount + failCount} PASS ===\n`);
  for (const r of results) {
    const icon = r.ok ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon}  ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  console.log(`\nTotal: ${passCount} PASS · ${failCount} FAIL`);
  process.exit(failCount > 0 ? 1 : 0);
}

main();
